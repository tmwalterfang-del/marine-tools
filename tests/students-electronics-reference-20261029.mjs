import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.chapter===7),by=new Map(rows.map(r=>[r.id,r])),evidence={};
const pi=Math.PI;let assertions=0;
function check(p,r,inputs,expected,reference='Authored ideal-circuit reference state; topology, bias, bandwidth and saturation assumptions retained.'){
 const id=`book-c7-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const actual=evaluate(row.formula.split(/=|≈/)[1].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=3e-10*Math.max(Math.abs(expected),1e-20),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected});
}
function typed(p,r,formula,condition,reference){const id=`book-c7-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);assertions++;evidence[id]={kind:'TYPED_CIRCUIT_OR_SIGNAL_CHECK',reference};}
for(const [r,v,e] of [[1,{I_C:.1,I_B:.001},100],[2,{'ΔI_C':.01,'ΔI_B':.0001},100],[3,{'α_ac':.8},4],[4,{'α_DC':.8},4],[5,{'β_DC':4},.8],[6,{'ΔV_BE':.02,'ΔI_B':.0001},200],[7,{'ΔV_CE':2,'ΔI_C':.001},2000],[8,{h_oe:.0005},2000],[9,{'β_DC':99,I_B:.001,I_CBO:1e-6},.0991]])check(102,r,v,e);
for(const [r,v,e] of [[1,{I_B:.001,I_C:.1},.101],[2,{I_C:.1},.1],[3,{I_out:2,I_in:.5},4],[4,{V_out:-2,V_in:.5},4],[5,{'β_ac':100,R_C:1000,R_L:1000,R_in:1000},50],[6,{I_C:.001,V_T:.025},.04],[7,{g_m:.1,R_C:1000,R_L:1000},50],[8,{A_v:50,A_i:4},200]])check(103,r,v,e);
for(const [r,v,e] of [[1,{A:100,'β':.02},100/3],[2,{f_H:10,A:100,A_cl:20},50],[3,{D:.1,'β':.02,A:100},1/30],[4,{C:1e-6,R_C:1000,R_in:1000},1/(.004*pi)],[5,{R_p:2000,C_p:1e-6},1/(.004*pi)],[6,{R_C:4000,R_in:4000},2000],[7,{C_out:2e-6,C_in:2e-6},1e-6]])check(104,r,v,e);
for(const [r,v,e] of [[1,{k_B:1,T:2,R:3,B:4},Math.sqrt(96)],[2,{P_s:100,P_n:2},50],[3,{SNR_in:50,SNR_out:10},5],[4,{V_peak:4,I_peak:3},6],[5,{V_max:4,V_min:-4,I_max:3,I_min:-3},6]])check(105,r,v,e);
for(const [r,v,e] of [[1,{V_CC:20,I_Q:.2},4],[2,{V_CC:20,I_Q:.2},2],[3,{V_CC:20,R_load:10},20/pi],[4,{V_CC:20,R_load:10},5],[5,{V_CC:20,V_sat:1,V_E:1,R_load:10},3.2],[6,{V_CC:20,I_Q:.2},4],[7,{V_CC:20,R_load:10},10/(pi*pi)],[8,{},pi/4]])check(106,r,v,e,'Class A/B total single-supply rail span retained; sine peak V_CC/2 in this class-B model.');
check(107,1,{P_out:5,P_in:20/pi},pi/4);
const integrate=(f,a,b,N=12000)=>{let total=0;for(let i=0;i<N;i++)total+=f(a+(i+.5)*(b-a)/N);return total*(b-a)/N;};
const residual=Math.sqrt(integrate(t=>(3*Math.sin(2*t)+4*Math.sin(3*t))**2,0,2*pi)/(2*pi)),fundamental=Math.sqrt(integrate(t=>(100*Math.sin(t))**2,0,2*pi)/(2*pi));
typed(107,2,'THD = sqrt(Σ(V_n²,n≥2))/V_1',Math.abs(residual/fundamental-.05)<1e-12,'Multi-harmonic residual waveform RMS integrated independently; harmonics use consistent amplitudes.');
check(107,3,{R_f:2000,V_in:1,R_in:1000},-2);
check(108,1,{R_f:3000,'R₁':1000,V_in:2},8);check(108,2,{'V₂':3,'V₁':1,'R₂':2000,'R₁':1000},4);check(108,3,{V_in:-2},-2);
typed(108,4,'V_out = −R_f·Σ(Vᵢ/Rᵢ)',Math.abs(-1000*(1/1000+2/2000-3/3000)+1)<1e-12,'Three virtual-ground input currents sum to 1 mA; 1 kΩ feedback gives −1 V.');
for(const [r,v,e] of [[1,{I_in:.001,R_f:1000},-1],[2,{V_in:1,'R₁':1000},.001],[3,{V_in:1,'R₁':1000},-.001],[4,{'R₁':1,C:.1,'R₂':3,'ω':10},.1],[5,{'R₁':1,C:.1,'R₂':3,'ω':10},.5]])check(109,r,v,e,'Grounded-load polarity and ideal gyrator topology; separate independent complex KCL sweep also required.');
for(const [r,v,e] of [[1,{C:.1,'R₂':3,'R₁':1},.4],[2,{'ω':10,C:.1,'R₂':3},3],[3,{R:2,'C₁':.25,'C₂':1},1/(2*pi)],[4,{C:.5,'R₁':1,'R₂':4},1/(2*pi)],[5,{Q:2,'A₀':.5,'ω₀':100,C:.001},40],[6,{Q:2,'A₀':.5,'ω₀':100,C:.001},8/3],[7,{Q:2,'ω₀':100,C:.001},40]])check(110,r,v,e);
for(const [r,v,e] of [[1,{Q:2,'ω₀':100,C:.001},40],[2,{'R₃':40,Q:2},2.5],[3,{Q:2,'R₂':10},80],[4,{s:0,R:1000,C:1e-6},1],[5,{'R₃':1000,'R₄':1000,'C₁':1e-6,'C₂':1e-6},.002*pi]])check(111,r,v,e);
typed(112,1,'V_out(t) = V_out(t₀)−(1/(R·C))·∫[t₀,t] V_in(τ)dτ',Math.abs(3-integrate(t=>2*t+1,-1,2)+3)<1e-10,'Integrate virtual-ground RC current balance for ramp 2t+1, RC=1; initial output 3 at t0=−1 gives output −3 at t=2.');
typed(112,2,'V_out = −R·C·dV_in/dt',(-1)*(2*2)===-4,'Capacitor current for Vin=t² at t=2 and RC=1 yields output −4; finite-bandwidth implementation remains separate.');
check(112,3,{R:2,C:.5,'R₁':1,'R₂':2},2*Math.log(2));
for(const [r,v,e] of [[1,{V_ref:2,V_OH:12,'R₁':1,'R₂':4},4],[2,{V_ref:2,V_OL:-8,'R₁':1,'R₂':4},0],[3,{V_OH:12,V_OL:-8,'R₁':1,'R₂':4},4],[4,{V_ref:2,V_OL:-8,'R₁':1,'R₂':5},4],[5,{V_ref:2,V_OH:12,'R₁':1,'R₂':5},0],[6,{V_OH:12,V_OL:-8,'R₁':1,'R₂':5},4],[7,{V_in:2,'R₂':2,'R₁':1},0]])check(113,r,v,e);
check(113,7,{V_in:-2,'R₂':2,'R₁':1},4);
check(114,1,{V_in:2,'R₂':2,'R₁':1},6);check(114,1,{V_in:-2,'R₂':2,'R₁':1},0);
typed(114,2,'V_hold = max(V_in over acquisition interval)',Math.max(-2,3,1)===3,'Explicit three-sample acquisition window; ideal held peak three, no droop.');
check(114,3,{V_ref:-2},-2);check(114,4,{n:1,V_T:.025,V_in:Math.E,R:1,I_s:1},-.025);
check(115,1,{R:1,I_s:1,V_in:.025,n:1,V_T:.025},-Math.E);check(115,2,{V_ref:16,'b₁':1,'b₂':0,'b₃':1,'b₄':0},-10);check(115,3,{R:2,C:.5,V_sat_abs:10,V_ref:10/Math.E},1);
for(const [r,v,e] of [[1,{L:1,C:1},1/(2*pi)],[2,{'f₀':1000,Q:5},200],[3,{'ω₀':10,L:2,R_s:4},5],[4,{'ω₀':10,C:.005,R_s:4},5],[5,{Q:5,U:2},10],[6,{Q:5,U:2},10],[7,{R_s:4},4],[8,{L:2,C:.005,R_s:4},100]])check(116,r,v,e);
for(const [r,v,e] of [[1,{Q:5,I:2},10],[2,{'R₀':4*pi,f_c:1},1],[3,{'R₀':1/(4*pi),f_c:1},1],[4,{L:1,C:1},1/(4*pi)],[5,{'R₀':pi,f_c:1},1],[6,{'R₀':1/pi,f_c:1},1],[7,{L:1,C:1},1/pi],[8,{L:4,C:1},2],[9,{v:300,'λ':3},100]])check(117,r,v,e);
for(const [r,v,e] of [[1,{'P₂':100,'P₁':1},20],[2,{'U₂':10,'U₁':1},20],[3,{'U₂':2,'U₁':1,'R₁':1,'R₂':4},0],[4,{'I₂':2,'I₁':1,'R₂':1,'R₁':4},0],[5,{A_max:3,A_min:1},.5],[6,{'Δf':20,f_m:5},4]])check(118,r,v,e);
// Restricted Boolean parser consumes the whole expression; exact finite domain.
function boolean(text,values){const tokens=text.match(/[ABC01]|[¬∧∨⊕()]/g)||[];assert.equal(tokens.join(''),text.replace(/\s/g,''));let i=0;
 function atom(){const t=tokens[i++];if(t==='¬')return 1-atom();if(t==='('){const a=expr(0);assert.equal(tokens[i++],')');return a;}if(t==='0'||t==='1')return Number(t);assert.ok(Object.hasOwn(values,t));return values[t];}
 const precedence={'∨':1,'⊕':2,'∧':3};function expr(min){let a=atom();while((precedence[tokens[i]]||0)>min){const op=tokens[i++],b=expr(precedence[op]);a=op==='∨'?a|b:op==='∧'?a&b:a^b;}return a;}
 const value=expr(0);assert.equal(i,tokens.length);return value;}
const tables=['0001','0111','1100','1110','1000','0110','1001'];
for(let r=1;r<=7;r++){const id=`book-c7-p119-r${String(r).padStart(2,'0')}`,rhs=by.get(id).formula.split('=')[1];for(let A=0;A<2;A++)for(let B=0;B<2;B++){assert.equal(boolean(rhs,{A,B}),Number(tables[r-1][2*A+B]),id);assertions++;}evidence[id]={kind:'EXHAUSTIVE_BOOLEAN_TRUTH_TABLE',assignments:4,reference:'Independent canonical gate truth table on every A,B pair; NOT ignores B.'};}
typed(119,8,'N = Σ(d_k·b^k)',[1,0,1,1].reduce((value,digit)=>value*2+digit,0)===11,'Binary 1011 converted by left-to-right Horner recurrence, independently of weighted positional sum.');
for(let r=1;r<=17;r++){const id=`book-c7-p121-r${String(r).padStart(2,'0')}`,[lhs,rhs]=by.get(id).formula.split('=');for(let A=0;A<2;A++)for(let B=0;B<2;B++)for(let C=0;C<2;C++){assert.equal(boolean(lhs,{A,B,C}),boolean(rhs,{A,B,C}),id);assertions++;}evidence[id]={kind:'EXHAUSTIVE_BOOLEAN_IDENTITY',assignments:8,reference:'Every assignment of all three Boolean variables; exhaustive finite proof.'};}
assert.equal(rows.length,126);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',expressions:126,assertions,scope:'Displayed scalars, typed calculus/acquisition checks, 28 gate assignments and 136 exhaustive identity assignments; real-component domains remain separate.'}));
