// Independent physical reference constructions for twelve newly covered rows.
// No copied RHS strings: evaluate the shipped expression and compare with
// integrated waveforms/work, phasor differences, circuit/flux/power balances.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {evaluate} from './lib/students-numeric-expression.mjs';
const w={},ctx=vm.createContext({window:w});
for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){
 if(m[1]==='app.js')break;
 vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx);
}
const rows=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r]));
const touched=new Set();let checks=0;
const rhs=(id,inputs)=>{const r=rows.get(id);assert.ok(r);assert.notEqual(r.analyticalReview.decision,'OPEN_MODEL_OR_SOURCE_LIMIT');touched.add(id);return evaluate(r.formula.split(/=|≈/)[1],inputs)};
const near=(actual,expected,label)=>{assert.ok(Math.abs(actual-expected)<=2e-9*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);checks++};
const phaseDifference=(magnitude,angle=2*Math.PI/3)=>Math.hypot(magnitude-magnitude*Math.cos(angle),-magnitude*Math.sin(angle));
// A voltage drop is the sum of the separate outgoing/return IR drops.
for(const current of [0,.1,10,25]){
 const resistivity=1.72e-8,length=20,area=2.5e-6,legResistance=resistivity*length/area;
 near(rhs('book-c6-p81-r10',{I:current,'ρ':resistivity,l:length,A:area}),current*legResistance+current*legResistance,'Two conductor loop');
}
// Integral of average induced emf over the interval balances linkage change.
for(const flux of [-.003,0,.003]){
 const emf=rhs('book-c6-p85-r06',{N:200,'ΔΦ':flux,'Δt':.1});
 near(emf*.1,-200*flux,'Faraday oriented flux balance');
}
for(const currentChange of [-3,0,3]){
 const emf=rhs('book-c6-p85-r07',{L:.2,'ΔI':currentChange,'Δt':.05});
 const passiveVoltage=.2*(currentChange/.05);
 near(emf+passiveVoltage,0,'Back emf versus passive terminal reference');
}
for(const speed of [0,1,3]){
 const sweptAreaPerSecond=.5*speed,fluxRatePerSegment=.4*sweptAreaPerSecond;
 near(rhs('book-c6-p85-r08',{B:.4,l:.5,v:speed,N:10}),Array(10).fill(fluxRatePerSegment).reduce((a,b)=>a+b,0),'Additive moving segments');
}
// Integrate the RL differential equation to the shipped characteristic time.
for(const [L,R]of [[.5,5],[2,4],[.02,100]]){
 const tau=rhs('book-c6-p86-r03',{L,R}),dt=tau/4096;
 let current=1;const rate=x=>-R*x/L;
 for(let k=0;k<4096;k++){const a=rate(current),b=rate(current+dt*a/2),c=rate(current+dt*b/2),d=rate(current+dt*c);current+=dt*(a+2*b+2*c+d)/6;}
 near(current,1/Math.E,'RL decay at characteristic time');
}
// Integrate passive-terminal instantaneous power along positive/negative ramps.
for(const finalCurrent of [-3,0,3]){
 const L=.4,duration=.2,steps=4096,dt=duration/steps,voltage=L*finalCurrent/duration;
 let work=0;
 for(let k=0;k<steps;k++){const current=finalCurrent*((k+.5)*dt)/duration;work+=voltage*current*dt;}
 near(rhs('book-c6-p86-r04',{L,I:finalCurrent}),work,'Integrated magnetic work');
}
// RMS from numerical integration of the squared waveform, not a peak divisor.
for(const peak of [0,1,10*Math.SQRT2,120]){
 let meanSquare=0;const count=65536;
 for(let k=0;k<count;k++){const sample=peak*Math.sin(2*Math.PI*(k+.5)/count);meanSquare+=sample*sample/count;}
 near(rhs('book-c6-p88-r02',{I_peak:peak}),Math.sqrt(meanSquare),'Integrated sine RMS');
}
// A square waveform is a deliberate counterexample to extending the sine rule.
assert.ok(Math.abs(rhs('book-c6-p88-r02',{I_peak:10})-10)>1);
assert.match(rows.get('book-c6-p88-r02').conditions,/Pure sine/);checks++;
for(const phaseVoltage of [0,1,230,277])near(rhs('book-c6-p90-r07',{U_phase:phaseVoltage}),phaseDifference(phaseVoltage),'Star phasor difference');
for(const branchCurrent of [0,.5,12,143])near(rhs('book-c6-p90-r10',{I_phase:branchCurrent}),phaseDifference(branchCurrent),'Delta junction phasor difference');
for(const [phaseVoltage,lineCurrent]of [[230,10],[120,5],[277,0]]){
 const lineVoltage=phaseDifference(phaseVoltage);
 const sumOfPhaseVA=[0,1,2].map(()=>phaseVoltage*lineCurrent).reduce((a,b)=>a+b,0);
 near(rhs('book-c6-p91-r02',{U_LL:lineVoltage,I_line:lineCurrent}),sumOfPhaseVA,'Sum of three identical phase VA');
}
// Equal flux derivative sets winding voltage per turn; equal ideal VA sets current.
for(const [primaryTurns,secondaryTurns]of [[500,100],[100,500],[200,200]]){
 const fluxRate=.5,primaryVoltage=primaryTurns*fluxRate,secondaryVoltage=secondaryTurns*fluxRate;
 const primaryCurrent=2,secondaryCurrent=primaryVoltage*primaryCurrent/secondaryVoltage;
 near(rhs('book-c6-p92-r01',{'N₁':primaryTurns,'N₂':secondaryTurns}),primaryVoltage/secondaryVoltage,'Common flux turns/voltage ratio');
 near(rhs('book-c6-p92-r03',{'I₂':secondaryCurrent,'I₁':primaryCurrent}),primaryTurns/secondaryTurns,'Ideal winding current/VA balance');
}
// Non-finite arithmetic is rejected by the interpreter; this is not a complete
// domain validator for all finite but physically inappropriate inputs.
for(const [id,inputs]of [
 ['book-c6-p81-r10',{I:10,'ρ':1.72e-8,l:20,A:0}],
 ['book-c6-p85-r06',{N:200,'ΔΦ':.003,'Δt':0}],
 ['book-c6-p85-r07',{L:.2,'ΔI':3,'Δt':0}],
 ['book-c6-p86-r03',{L:.5,R:0}],
 ['book-c6-p92-r01',{'N₁':500,'N₂':0}],
 ['book-c6-p92-r03',{'I₂':10,'I₁':0}],
]){assert.throws(()=>rhs(id,inputs),id+' zero denominator');checks++;}
assert.equal(touched.size,12);
console.log(JSON.stringify({status:'PASS',checks,expressions:touched.size,scope:'Selected independent circuit/flux/work/waveform/phasor references; no cable sizing, real transformer/core, full-domain or design-code approval.'}));
