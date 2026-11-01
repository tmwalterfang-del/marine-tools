import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.chapter===8),by=new Map(rows.map(r=>[r.id,r])),evidence={},pi=Math.PI;
let assertions=0;
function check(p,r,inputs,expected,reference='Authored ideal converter/ripple reference under the recorded conduction and loading regime.',tolerance=3e-9){
 const id=`book-c8-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const actual=evaluate(row.formula.split(/=|≈/)[1].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected});
}
function typed(p,r,formula,condition,reference){const id=`book-c8-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);evidence[id]={kind:'TYPED_WAVEFORM_CHECK',reference};assertions++;}
function integral(f,a,b,N=60000){let sum=0;for(let i=0;i<N;i++)sum+=f(a+(i+.5)*(b-a)/N);return sum*(b-a)/N;}
const mean=f=>integral(f,0,2*pi)/(2*pi),rms=f=>Math.sqrt(mean(t=>f(t)**2));
const half=t=>Math.max(Math.sin(t),0),full=t=>Math.abs(Math.sin(t));
check(122,1,{V_m:1},mean(half),'Direct integration of a positive half sine over its full input period.');
check(122,2,{V_m:1},mean(full),'Direct integration of the rectified sine.');
const phases=t=>[0,2*pi/3,4*pi/3].map(p=>Math.SQRT2*Math.sin(t-p));
const star=t=>Math.max(...phases(t)),bridge=t=>Math.max(...phases(t))-Math.min(...phases(t));
check(122,3,{V_phase:1},mean(star),'Direct integration of the maximum of three phase voltages, each 1 V RMS.');
check(122,4,{V_LL:Math.sqrt(3)},mean(bridge),'Direct integration of maximum-minus-minimum phase envelope; line RMS √3.');
const fullMean=mean(full),ripple=rms(t=>full(t)-fullMean);
check(123,1,{V_m:1},ripple,'AC residual RMS calculated after subtracting the independently integrated DC mean.');
check(123,2,{'ω':1,L:1,R:1},1/Math.SQRT2,'Voltage divider with equal real R and imaginary ωL magnitudes.');
check(124,1,{'ω':10,L:1,C:1},.01,'High-frequency limiting term; exact loaded LC response differs by less than 2% for this selected case.');
assert.ok(Math.abs(1/Math.hypot(1-100,1)-.01)/.01<.02);
check(124,2,{V_m:100,f:50,R:100,C:.01},99.5,'Small triangular discharge: peak 100, peak-to-peak one volt, mean 99.5.');
check(124,3,{V_dc:100,f:50,R:100,C:.01},1/(2*Math.sqrt(3)),'Triangular ripple of one volt peak-to-peak has AC RMS 1/(2√3).');
check(125,1,{'ω':1,L:1,C:1,R:2},2,'KCL at shunt C/load node at LC resonance: conductance 1/2 sets finite gain two.');
check(125,2,{R_s:1,R:1,'ω':1,'C₂':1},1/Math.sqrt(5),'Complex loaded-divider denominator has real part two and imaginary part one.');
check(125,3,{V_m:100,R:4,R_s:1},80);
check(126,1,{V_dc:100,f:50,R:100,C:.01},1,'Half-wave triangular ripple peak amplitude: discharge once each input cycle.');
check(126,2,{V_m:20},40);
check(127,1,{V_dc:100,f:50,R:100,C:.01},.5,'Full-wave ripple amplitude halves because charging frequency doubles.');
check(127,2,{V_m:20},40);
check(128,1,{V_m:20},20);
check(128,2,{V_m:1},rms(half));check(128,3,{V_m:1},rms(full));
const triangle=t=>1-2*Math.abs(t/pi-1),square=t=>t<.6*pi?1:-1,pulse=t=>t<.5*pi?1:0;
check(128,4,{V_m:1},rms(triangle));check(128,5,{V_m:1},rms(square));
check(128,6,{V_m:1,D:.25},rms(pulse));check(128,7,{V_m:1,D:.25},mean(pulse));
for(const beta of [.2,pi/2,2.4,pi]){
 const alpha=pi-beta,oneMean=integral(Math.sin,alpha,pi)/(2*pi),oneRms=Math.sqrt(integral(t=>Math.sin(t)**2,alpha,pi)/(2*pi));
 check(128,8,{V_m:1,'β':beta},oneRms,'Independent integration over one conducting interval; full period in RMS denominator.');
 check(128,9,{V_m:1,'β':beta},oneMean);
 check(128,10,{V_m:1,'β':beta},2*oneMean);
 check(128,11,{V_m:1,'β':beta},Math.SQRT2*oneRms);
}
typed(128,12,'V_peak = V_m·sin(β) for β≤π/2; else V_m',[.2,pi/2,2.4,pi].every(beta=>{
 const start=pi-beta,candidates=[Math.sin(start),Math.sin(pi),...(start<=pi/2?[1]:[])],actual=beta<=pi/2?Math.sin(beta):1;
 return Math.abs(actual-Math.max(...candidates))<1e-12;
}),'Maximize sine over the actual conducting interval; test both branches and their shared boundary.');
typed(128,13,'ξ = V_rms/mean(abs(v))',Math.abs(rms(Math.sin)/mean(full)-pi/(2*Math.SQRT2))<2e-9,'Form factor uses independently integrated RMS and rectified mean; signed sinusoid mean is zero and unusable as a denominator.');
check(129,1,{P_loss:10,'R_θJA':5},50);
check(129,2,{'R_θJC':1,'R_θCS':2,'R_θSA':3},6);
for(const alpha of [0,.4,pi/2,2.5,pi]){
 const halfMean=integral(Math.sin,alpha,pi)/(2*pi),fullMean=2*halfMean;
 check(129,3,{V_m:1,'α':alpha},halfMean);
 check(130,1,{V_m:1,'α':alpha},fullMean);
 check(130,2,{V_m:1,'α':alpha},fullMean);
 const continuous=integral(Math.sin,alpha,pi+alpha)/pi;
 check(130,3,{V_m:1,'α':alpha},continuous,'Continuous-current source remains connected for a π-radian interval; negative mean requires an active DC source.');
}
// Phase voltages are integrated over physically selected conduction intervals.
for(const alpha of [0,.2,pi/6,.8,pi/2,2.5]){
 const start=pi/6+alpha,end=Math.min(start+2*pi/3,pi),resistive=3*integral(t=>Math.SQRT2*Math.sin(t),start,end)/(2*pi);
 check(131,alpha<=pi/6?1:2,{V_phase:1,'α':alpha},resistive,'Three-pulse star: actual phase-voltage conduction until next firing or natural zero.');
 const continuous=3*integral(t=>Math.SQRT2*Math.sin(t),start,start+2*pi/3)/(2*pi);
 check(131,3,{V_phase:1,'α':alpha},continuous,'Continuous current extends conduction through a full 120° segment; inversion conditions separate.');
}
for(const alpha of [0,.4,pi/3,1.3,pi/2,2]){
 const start=pi/3+alpha,end=Math.min(start+pi/3,pi),resistive=3*integral(t=>Math.sqrt(6)*Math.sin(t),start,end)/pi;
 check(131,alpha<=pi/3?4:5,{V_phase:1,'α':alpha},resistive,'Six-pulse line-voltage segments integrated over actual conducting intervals.');
 const continuous=3*integral(t=>Math.sqrt(6)*Math.sin(t),start,start+pi/3)/pi;
 check(132,1,{V_phase:1,'α':alpha},continuous);
}
check(132,2,{D:.25,V_in:24},6,'Zero average inductor volt-seconds in an ideal buck.');
check(132,3,{R:10,T:.001,D:.5},.0025,'At critical conduction the triangular inductor current reaches zero once per period.');
check(132,4,{V_out:12,T:.001,D:.5,'ΔV_pp':.1,L:.1},.000075,'Integrate the triangular capacitor current: ΔQ=ΔI_L·T/8, then C=ΔQ/ΔV.');
check(132,5,{V_in:12,D:.5},24,'Boost switch-on and switch-off inductor volt-seconds cancel.');
check(132,6,{R:10,T:.001,D:.5},.000625);
check(132,7,{V_out:24,D:.5,T:.001,'ΔV_pp':.1,R:10},.012,'During switch-on capacitor alone supplies 2.4 A for 0.5 ms: charge 0.0012 C, ripple 0.1 V.');
check(132,8,{t_on:.00025,T:.001},.25);
check(133,1,{V_in:12,D:.5},-12,'Inverting nonisolated buck–boost volt-second balance, not a flyback turns-ratio model.');
check(133,2,{R:10,T:.001,D:.5},.00125);
check(133,3,{V_out:-12,D:.5,T:.001,'ΔV_pp':.1,R:10},.006,'Positive capacitance from output-magnitude load current; sign of Vout cannot make capacitance negative.');
assert.equal(rows.length,51);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',expressions:51,assertions,scope:'Displayed scalar formulas, waveform integration across controlled-rectifier regimes, typed peak branches and converter charge/volt-second cases; approximation and real-component limits retained.'}));
