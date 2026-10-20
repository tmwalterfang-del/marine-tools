// Independent complex node-current balances for the two circuits printed on pp109–110.
// Does not reuse the compact impedance expressions as its reference oracle.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w});for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx)}
const by=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r]));
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div=(a,b)=>{const d=b[0]**2+b[1]**2;return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]},one=[1,0];
let checks=0,cases=0;const near=(a,b,label)=>{assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=1e-8*Math.max(1e-12,Math.abs(b)),label+': '+a+' vs '+b);checks++};
function shown(id,v){const rhs=by.get(id).formula.split(/=|≈/)[1].trim(),names=Object.keys(v).sort((a,b)=>b.length-a.length);let s=rhs;for(let i=0;i<names.length;i++)s=s.replaceAll(names[i],'VAR'+i+'X');s=s.replace(/[²³]/g,c=>c==='²'?'**2':'**3').replaceAll('^','**').replaceAll('·','*').replaceAll('−','-').replace(/VAR(\d+)X/g,(_,i)=>'('+v[names[+i]]+')');assert.ok(/^[\d.eE+\-*/()\s]+$/.test(s));return Function('"use strict";return ('+s+')')()}
for(const r1 of [1,100,10000])for(const ratio of [2,10,1000])for(const c of [1e-9,1e-6])for(const om of [10,1000,1000000]){
 const r2=r1*ratio,yC=[0,om*c],drop=div([1/r2,0],add(yC,[1/r2,0]));
 // KCL: current through R1 to output plus current through C to noninverting node.
 const inputCurrent=add(div(drop,[r1,0]),mul(yC,drop)),z=div(one,inputCurrent),v={'R₁':r1,'R₂':r2,C:c,'ω':om};
 near(shown('book-c7-p109-r04',v),z[1]/om,'Gyrator series inductance from KCL');near(shown('book-c7-p109-r05',v),z[1]/z[0],'Gyrator Q from KCL');cases++;
}
for(const r1 of [1,100,10000])for(const ratio of [.5,1,2,10,1000])for(const c of [1e-9,1e-6])for(const om of [10,1000,1000000]){
 const r2=r1*ratio,yC=[0,om*c],drop=div(yC,add([1/r2,0],yC));
 // KCL: two distinct currents leave the input port through R1 and R2.
 const inputCurrent=add(div(drop,[r1,0]),div(drop,[r2,0])),z=div(one,inputCurrent),v={'R₁':r1,'R₂':r2,C:c,'ω':om};
 near(shown('book-c7-p110-r01',v),-1/(om*z[1]),'Multiplier series capacitance from KCL');near(shown('book-c7-p110-r02',v),z[0]/Math.abs(z[1]),'Multiplier loss tangent from KCL');cases++;
}
console.log(JSON.stringify({status:'PASS',cases,checks,scope:'Four displayed source expressions against independent complex node-current balances; ideal voltage followers, not real-op-amp validation.'}));
// Independent two-node circuit solve for MFB bandpass and its biased-input notch.
function transfer(r1,r2,r3,r4,c,omega){const yc=[0,omega*c],k=r4===null?0:r4/(r2+r4),a=add([1/r1+(r4===null?1/r2:0),0],mul([2,0],yc)),b=mul([-1,0],yc),rhs=add([1/r1,0],mul([k,0],yc));
 // KCL at A; KCL at V-=V+=k*Vin: -sC*A-Vo/R3=-k*(sC+1/R3).
 const aa=mul([-1,0],yc),bb=[-1/r3,0],rr=mul([-k,0],add(yc,[1/r3,0])),det=sub(mul(a,bb),mul(b,aa));return div(sub(mul(a,rr),mul(rhs,aa)),det)}
for(const q of [.3,.7071067811865476,2,10])for(const centre of [100,10000])for(const cap of [1e-9,1e-6]){
 const gain=.25*q*q,values={Q:q,'A₀':gain,'ω₀':centre,C:cap},r1=shown('book-c7-p110-r05',values),r2=shown('book-c7-p110-r06',values),r3=shown('book-c7-p110-r07',values),h=transfer(r1,r2,r3,null,cap,centre);near(h[0],-gain,'MFB centre gain');assert.ok(Math.abs(h[1])<1e-8*Math.max(1,gain));checks++;
 const edge=[(Math.sqrt(4+1/q**2)-1/q)/2,(Math.sqrt(4+1/q**2)+1/q)/2];for(const f of edge){const h=transfer(r1,r2,r3,null,cap,centre*f);near(Math.hypot(...h),gain/Math.sqrt(2),'MFB half-power edge from node solve')}
 const nr3=shown('book-c7-p111-r01',values),nr1=shown('book-c7-p111-r02',{...values,'R₃':nr3}),nr2=1000,nr4=shown('book-c7-p111-r03',{...values,'R₂':nr2}),pass=nr4/(nr2+nr4),zero=transfer(nr1,nr2,nr3,nr4,cap,centre);assert.ok(Math.hypot(...zero)<1e-8);checks++;near(transfer(nr1,nr2,nr3,nr4,cap,0)[0],pass,'Notch DC gain');for(const f of edge)near(Math.hypot(...transfer(nr1,nr2,nr3,nr4,cap,centre*f)),pass/Math.sqrt(2),'Notch half-power from node solve');cases+=2;
}
console.log(JSON.stringify({status:'PASS',cases,checks,scope:'Ten displayed gyrator/multiplier/MFB/notch expressions against independent ideal circuit balances.'}));
