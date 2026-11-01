// Independent conservation laws, limiting cases and reference inputs across the labs.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w}),read=p=>fs.readFileSync(new URL('../students/'+p,import.meta.url),'utf8');
for(const p of ['lab-models.js','explorer-models.js','example-models.js','example-schemas.js','cargo-model.js'])vm.runInContext(read(p),ctx);
let checks=0,cases=0;const near=(a,b,label,tol=1e-8)=>{assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),label+': '+a+' vs '+b);checks++;};
const E=w.MT_EXPLORERS,M=w.MT_EXAMPLE_MODELS,L=w.MT_LABS;
const defaults=id=>Object.fromEntries(w.MT_EXAMPLE_SCHEMAS[id].fields.map(f=>[f[0],f[2]]));
// Hot/cold balances, both inlet/outlet boundary conditions and UA*LMTD.
for(const flow of ['parallel','counter'])for(const ch of [.1,1,10,100])for(const cc of [.1,1,10,100])for(const ntu of [0,.001,.1,1,10,30,50]){
 const p={hotIn:100,coldIn:10,mHot:ch,mCold:cc,cpHot:1,cpCold:1,ua:Math.min(ch,cc)*ntu,flow},h=E.heat(p),a=h.rows[0],b=h.rows.at(-1);
 near(ch*(100-h.hotOut),cc*(h.coldOut-10),'two-stream energy balance');near(a.hot,100,'hot inlet');near(b.hot,h.hotOut,'hot outlet');
 near((flow==='parallel'?a:b).cold,10,'cold inlet');near((flow==='parallel'?b:a).cold,h.coldOut,'cold outlet');
 for(const r of h.rows){assert.ok(Number.isFinite(r.hot)&&Number.isFinite(r.cold)&&r.hot>=r.cold-1e-8,'no local temperature crossing');checks++;}
 if(h.lmtd!==null&&ntu<=10)near(p.ua*h.lmtd,h.duty,'independent LMTD energy balance',1e-7);
 if(ntu===0)near(h.duty,0,'zero area has zero duty');cases++;
}
// Half-power frequencies from the quadratic roots, not a sweep maximum.
for(const r of [.1,10,10000])for(const l of [.001,1,10])for(const cMicro of [.01,10,10000]){
 const p={r,l,cMicro,voltage:230,frequency:1},c=cMicro*1e-6,disc=Math.sqrt(r*r+4*l/c),lo=2/(c*(disc+r)),hi=(disc+r)/(2*l);
 const a=E.rlc({...p,frequency:lo/(2*Math.PI)}),b=E.rlc({...p,frequency:hi/(2*Math.PI)});
 near(a.selected.current**2*r,230**2/(2*r),'lower half-power point',1e-6);near(b.selected.current**2*r,230**2/(2*r),'upper half-power point',1e-6);
 near((hi-lo)/(2*Math.PI),a.bandwidth,'half-power interval');cases++;
}
for(const speed of [.4,1,1.5])for(const staticHead of [0,10,100]){
 const p={...defaults('pump'),speed,staticHead},z=M.pump(p).results,q=z['Operating flow (m3/h)'];
 if(q>0)near(p.h0*speed**2-p.a*q*q,staticHead+p.k*q*q,'pump/system head balance');else assert.ok(p.h0*speed**2<=staticHead);
 near(z['Estimated shaft input (kW)']*1000*p.efficiency,p.density*1000*9.80665*q/3600*z['System head at operating flow (m)'],'hydraulic/shaft energy balance');cases++;
}
for(const fill of [0,.01,25,50,99.99,100]){
 const p={...defaults('tank'),fill},a=M.tank(p).results,b=M.tank({...p,divisions:2}).results;
 near(a['Total displacement (t)'],p.delta+a['Liquid mass (t)'],'tank mass conservation');near(a['FSM (t m)']/4,b['FSM (t m)'],'isolated longitudinal subdivision');
 if(fill===0||fill===100)near(a['FSM (t m)'],0,'empty/pressed-up surface limit');cases++;
}
for(const outreach of [-10,0,10]){
 const p={...defaults('lifting'),outreach},z=M.lifting(p).results,gm=z['Corrected GM (m)'],tcg=z['TCG (m)'],angle=z['Equilibrium estimate (deg)'];
 if(typeof angle==='number')near(gm*Math.sin(angle*Math.PI/180)-tcg*Math.cos(angle*Math.PI/180),0,'lift equilibrium residual');cases++;
}
for(const operation of ['load','discharge','shift']){
 const p={...defaults('trim'),operation},z=M.trim(p).results;
 near(z['Aft draft (m)']-z['Forward draft (m)'],z['Final aft minus forward draft (m)'],'trim sign and endpoints');
 const atLCF=z['Aft draft (m)']+(z['Forward draft (m)']-z['Aft draft (m)'])*p.lcf/p.length;
 near(atLCF,p.draft+z['Parallel sinkage (m)'],'LCF pivot depth');cases++;
}
for(const course of [0,90,180,270,360])for(const drift of [0,2,10]){
 const z=E.current({course,stw:10,set:90,drift,hours:3});near(z.ground.east-z.water.east,drift,'eastward current addition');near(z.ground.north,z.water.north,'unchanged north velocity');
 near(z.distance,Math.hypot(z.rows.at(-1).groundEast,z.rows.at(-1).groundNorth),'track length');cases++;
}
near(E.current({course:270,stw:10,set:90,drift:10,hours:1}).cog===null?0:1,0,'undefined course at zero ground speed');
for(const rate of [-20,0,5,50]){
 const z=E.finance({investment:100,annual:20,years:3,rate});near(z.npv,-100+20/(1+rate/100)+20/(1+rate/100)**2+20/(1+rate/100)**3,'three dated discounted payments');cases++;
}
for(const v of [-10,0,20])near(L.scale(L.scale(v,-10,20),-10,20,true),v,'signal round trip');
const pid=L.pid({kp:2,ti:20,td:0,tau:20,setpoint:60,direction:'reverse',antiWindup:true});near(pid.at(-1).pv,60,'PID steady target',1e-4);
const p={bore:.5,stroke:1,cylinders:6,rpm:600,cycles:2,mep:20,basis:'brake',mechanicalEfficiency:.9,brakeEfficiency:.45,lhv:42.7},engine=L.engine(p);
near(engine.fuel*42.7/3.6,engine.brake/.45,'fuel chemical input matches thermal balance');near(L.engine({...p,cycles:1}).brake,2*engine.brake,'cycle work events');
const cargo=w.MT_CARGO.calculate({displacement:1000,kg:5,lcg:20,tcg:0,fsm:0,km:8,operations:[{type:'load',name:'load',mass:100,vcg:10,lcg:40,tcg:2,fsmChange:0},{type:'discharge',name:'reverse',mass:100,vcg:10,lcg:40,tcg:2,fsmChange:0}]});
for(const key of ['displacement','kg','lcg','tcg','fsm'])near(cargo.final[key],cargo.rows[0][key],'load/discharge reversal '+key);
console.log(JSON.stringify({status:'PASS',cases,checks,scope:'Independent balances, model symmetries and analytic limits; no empirical hull/equipment accuracy claim.'}));
