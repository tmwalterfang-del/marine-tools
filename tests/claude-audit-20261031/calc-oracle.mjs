// Claude independent calculator oracle 2026-10-31. Own inputs, own formulas (written from physics, not from the code).
import { catalogue } from '../lib/students-catalogue.mjs';

const w = catalogue(), C = new Map(w.MT_CALCULATORS.map(c => [c.id, c]));
const g=9.80665, pi=Math.PI, s3=Math.sqrt(3);
// [id, inputs, expected, note]
const cases = [
 ['displacement',{volume:12345,density:1.0},12345],
 ['deadweight',{dis:15000,light:4200.5},10799.5],
 ['add-kg',{dis:5000,kg:5.2,load:0,loadkg:30},5.2,'zero load leaves KG unchanged'],
 ['add-kg',{dis:6000,kg:7,load:2000,loadkg:3},6],
 ['discharge-kg',{dis:9000,kg:6,removed:3000,remkg:3},7.5],
 ['corrected-gm',{km:8.4,kg:7.1,fsc:0.3},1.0],
 ['tpc',{aw:1500,rho:1.0},15],
 ['draft-change',{mass:300,tpc:15},20],
 ['trim-change',{weight:250,distance:40,mct:125},80],
 ['block-coefficient',{vol:1,length:1,breadth:1,draft:1},1,'box barge Cb=1'],
 ['triangle',{a:8,b:15},17],
 ['ohms-law',{voltage:0,res:10},0],
 ['dc-power',{u:48,i:12.5},600],
 ['three-phase',{u:690,i:1000,pf:1},s3*690],
 ['series-resistance',{r1:0.5,r2:0.25},0.75],
 ['parallel-resistance',{r1:10,r2:10},5],
 ['synchronous-speed',{freq:50,poles:2},3000],
 ['hydraulic-power',{rho:1025,flow:3600,head:1},1025*g/1000,'1 m³/s at 1 m'],
 ['pump-time',{vol:0,flow:10},0],
 ['voyage-fuel',{dist:240,speed:10,daily:24},24,'one day at sea'],
 ['battery-runtime',{cap:200,dod:1,eta:1,load:50},4],
 ['heat-energy',{m:1000,cp:4.2,dt:1},4200/3600],
 ['shaft-power',{rpm:60,torque:1000},2*pi],
 ['sfoc',{fuel:0,power:1000},0],
 ['fuel-density',{vol:100,rho:0.991},99.1],
 ['molar-concentration',{moles:1,litres:4},0.25],
 ['dilution-volume',{c1:1,v1:1,c2:1},1],
 ['ph',{activity:1},0],
 ['amp-feedback',{gain:1e6,beta:0.1},1e6/(1+1e5)],
 ['db-gain',{vin:1,vout:2},20*Math.log10(2)],
 ['rc-frequency',{res:1/(2*pi),cap:1e6},1,'1/(2π·R·C)=1 with C=1 F'],
 ['buck-converter',{vin:12,duty:1},12],
 ['shaft-torsion-stress',{torque:1000,diameter:100},16*1e6/(pi*1e6)],
 ['otto-efficiency',{ratio:8,kappa:1.4},100*(1-Math.pow(8,-0.4))],
 ['engine-swept-volume',{bore:500,stroke:2000,cylinders:1},pi*0.25*0.25*2],
 ['wet-steam-enthalpy',{hf:-10,hfg:100,x:0},-10,'x=0 saturated liquid'],
 ['refrigeration-cop',{h1:250,h2:300,h4:100},3],
 ['relative-humidity',{pv:2000,psat:2000},100],
 ['real-interest',{nominal:5,inflation:5},0],
 ['annuity-pv',{payment:100,r:0,periods:3},300,'zero rate'],
 ['annuity-pv',{payment:100,r:5,periods:1},100/1.05],
 ['radioactive-half-life',{initial:80,time:0,half:3},80],
 ['sound-db',{out:2,input:1},10*Math.log10(2)],
 ['rc-filter',{r:1,c:1000},1000/(2*pi*1000)],
 ['fullwave-rectifier',{rms:230},2*Math.sqrt(2)*230/pi],
 ['engine-displacement',{bore:80,stroke:90,cyl:1},pi*0.08**2/4*0.09*1000],
 ['mean-piston-speed',{stroke:2.4,rpm:100},8],
 ['steam-boiler-heat',{flow:3600,hout:2776,hin:419},2357],
 ['cooling-cop',{h1:250,h2:300,h4:100},3],
 ['shaft-torsion',{d:10},pi*1e4/32],
 ['annuity-payment',{pv:1000,rate:0,periods:4},250],
 ['annuity-payment',{pv:1000,rate:10,periods:1},1100],
 ['npv',{cost:100,flow:0,rate:5,years:3},-100],
 ['npv',{cost:100,flow:110,rate:10,years:1},0],
 ['wave-speed',{freq:0.1,lambda:156},15.6],
 ['sound-level',{p:20e-6,p0:20e-6},0],
 ['loop-scaling',{ma:4,low:-50,high:150},-50],
 ['loop-scaling',{ma:20,low:-50,high:150},150],
 ['loop-current',{value:150,low:150,high:-50},4,'reverse-ranged transmitter'],
 ['p-controller',{sp:50,pv:50,kp:3,bias:42},42],
 ['prop-band',{kp:0.5},200],
 ['npsha',{surface:101.325,vapour:101.325-9.80665,rho:1000,level:0,loss:0},1],
 ['turbine-drop',{inlet:3400,outlet:2300},1100],
 ['fuel-input-power',{flow:3600,lhv:42700},42700],
 ['classical-doppler',{fs:500,c:343,vo:0,vs:0},500],
 ['classical-doppler',{fs:500,c:340,vo:34,vs:0},550,'observer approaching at 0.1c'],
];
// invalid/boundary expectations: [id, inputs, expectInvalidOrWarning]
const invalid = [
 ['deadweight',{dis:100,light:200},'invalid'],['discharge-kg',{dis:100,kg:5,removed:100,remkg:5},'invalid'],
 ['otto-efficiency',{ratio:1,kappa:1.4},'invalid'],['otto-efficiency',{ratio:8,kappa:1},'invalid'],
 ['refrigeration-cop',{h1:300,h2:300,h4:100},'invalid'],['relative-humidity',{pv:2001,psat:2000},'invalid'],
 ['annuity-pv',{payment:1,r:5,periods:2.5},'invalid'],['engine-swept-volume',{bore:1,stroke:1,cylinders:1.5},'invalid'],
 ['engine-displacement',{bore:1,stroke:1,cyl:2.2},'invalid'],['annuity-payment',{pv:1,rate:1,periods:1001},'invalid'],
 ['npv',{cost:1,flow:1,rate:1,years:101},'invalid'],['loop-scaling',{ma:3.9,low:0,high:1},'invalid'],['loop-scaling',{ma:12,low:5,high:5},'invalid'],
 ['loop-current',{value:2,low:0,high:1},'invalid'],['npsha',{surface:2,vapour:2,rho:1000,level:0,loss:0},'invalid'],['turbine-drop',{inlet:1,outlet:1},'invalid'],
 ['cooling-cop',{h1:100,h2:300,h4:200},'invalid'],['corrected-gm',{km:5,kg:5,fsc:0},'warning'],['block-coefficient',{vol:2,length:1,breadth:1,draft:1},'warning'],
 ['synchronous-speed',{freq:50,poles:3},'warning'],['classical-doppler',{fs:100,c:340,vo:0,vs:340},'invalid'],
 // physically questionable inputs that the calculator accepts without flag (review items):
 ['synchronous-speed',{freq:50,poles:4.5},'invalid'],['dilution-volume',{c1:1,v1:1,c2:2},'invalid'],
];
let pass=0,fail=[];
const rel=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
for (const [id,inp,exp,note] of cases){const c=C.get(id);if(!c){fail.push([id,'missing']);continue}
 const r=c.compute({...inp}); if(r.invalid||!rel(r.value,exp)) fail.push([id,JSON.stringify(inp),'got',r.value,r.invalid||'','expected',exp,note||'']); else pass++;}
const covered=new Set(cases.map(c=>c[0]));const notCovered=[...C.keys()].filter(k=>!covered.has(k));
let ipass=0,ifail=[];
for (const [id,inp,kind] of invalid){const r=C.get(id).compute({...inp});const ok=kind==='invalid'?!!r.invalid:!!r.warning;if(ok)ipass++;else ifail.push([id,JSON.stringify(inp),kind,'value',r.value,'warning',r.warning||'']);}
console.log(JSON.stringify({calculators:C.size,normalCases:cases.length,normalPass:pass,normalFail:fail,notCovered,boundaryCases:invalid.length,boundaryPass:ipass,boundaryFail:ifail},null,1));
