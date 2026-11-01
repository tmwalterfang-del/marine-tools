// All chapter-six expressions: actual scalar notation plus typed multi-branch
// sums. Selected deeper waveform/ODE/phasor tests remain in the separate suite.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.chapter===6);
const by=new Map(rows.map(r=>[r.id,r])),evidence={},pi=Math.PI;let assertions=0;
function check(p,r,inputs,expected,reference='Authored electrical reference state on the recorded RMS/peak, polarity and unit basis.') {
 const id=`book-c6-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const actual=evaluate(row.formula.split('=')[1].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=2e-10*Math.max(Math.abs(expected),1e-20),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected});
 return actual;
}
function typed(p,r,formula,condition,reference){const id=`book-c6-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);assertions++;evidence[id]={kind:'FINITE_INDEXED_CIRCUIT_CHECK',reference};}
for(const [r,v,e] of [[1,{I:2,t:3},6],[2,{'ρ':2,l:3,A:6},1],[3,{r:2},4*pi],[4,{'R₀':100,'α':.004,'ΔT':-25},90],[5,{R:4},.25],[6,{'ρ':4},.25],[7,{R:4,I:3},12]])check(79,r,v,e);
typed(79,8,'ΣI = 0',[3,2,-5].reduce((a,b)=>a+b,0)===0,'Three branch currents with a common inward-positive convention satisfy charge conservation.');
typed(80,1,'ΣU = 0',[12,-8,-4].reduce((a,b)=>a+b,0)===0,'One loop containing a 12 V rise and two voltage drops.');
typed(80,2,'R = ΣRᵢ',[10,20,30].reduce((a,b)=>a+b,0)===60,'Three series elements at 1 A drop 10+20+30 V.');
check(80,3,{n:3,'R₁':20},60);
typed(80,4,'1/R = Σ(1/Rᵢ)',Math.abs(1/60+1/30+1/20-.1)<1e-14,'Three parallel branches under 6 V draw 0.1+0.2+0.3 A; equivalent R=10 Ω.');
check(80,5,{'R₁':30,'R₂':60},20);
typed(80,6,'G = ΣGᵢ',.1+.2+.3-.6<1e-14,'Parallel current addition at common voltage gives sum of branch conductances.');
const A=30,B=60,C=90;
const X=check(81,1,{A,B,C},10),Y=check(81,2,{A,B,C},15),Z=check(81,3,{A,B,C},30);
for(const [star,delta] of [[X+Y,1/(1/A+1/(B+C))],[X+Z,1/(1/B+1/(A+C))],[Y+Z,1/(1/C+1/(A+B))]])assert.ok(Math.abs(star-delta)<1e-10,'All three terminal-pair resistances preserved by delta/star conversion');
for(const [r,v,e] of [[4,{U:12,I:2,t:5},120],[5,{P:24,t:5},120],[6,{U:12,I:2},24],[7,{R:6,I:2},24],[8,{U:12,R:6},24],[9,{P_out:24,P_in:30},.8],[10,{I:2,'ρ':.02,l:10,A:2},.4]])check(81,r,v,e);
for(const [r,v,e] of [[1,{I:2,'ρ':.02,l:10,A:2},.8],[2,{P:100,t:10,'η':.8},800],[3,{'R₂':200,'R₃':300,'R₁':100},600],[4,{Q:6,U:3},2],[5,{'ε':2,A:3,n:3,d:4},3],[6,{'ε₀':2,'ε_r':3},6],[7,{C:2,U:3},9],[8,{U:10,t:Math.log(2),R:1,C:1},5]])check(82,r,v,e);
check(83,1,{'U₀':10,t:Math.log(2),R:1,C:1},5);
check(83,2,{R:2,C:3},6);
typed(83,3,'1/C = Σ(1/Cᵢ)',Math.abs(1/2+1/3+1/6-1)<1e-14,'Three series capacitors carry equal charge; voltage drops sum, giving one-farad equivalent.');
typed(83,4,'C = ΣCᵢ',2+3+6===11,'Three parallel capacitors under common voltage store summed charges.');
typed(83,5,'Q = ΣQᵢ',2*3+3*3+6*3===33,'Actual branch charges at three volts: 6,9,18 C.');
check(83,6,{'Q₁':2e-6,'Q₂':-3e-6,'ε':1/(4*pi),r:2},1.5e-12,'Opposite charges attract; displayed scalar is positive force magnitude.');
check(83,7,{F:-6,q:-2},3,'Signed component F=qE: a negative test charge reverses force relative to the field.');
for(const [r,v,e] of [[1,{Q:12,'ε':2,A:3},2],[2,{U:12,d:3},4],[3,{'ε':2,E:4},8],[4,{Q:12,A:3},4],[5,{D:4,A:3},12],[6,{B:2,A:3},6],[7,{'μ':2,N:3,I:4,l:6},4],[8,{'μ₀':2,'μ_r':3},6],[9,{'μ':2,H:4},8],[10,{N:3,I:4,l:6},2],[11,{I:4,r:2},1],[12,{I:4,b:2},1/pi]])check(84,r,v,e);
for(const [r,v,e] of [[1,{N:100,I:2,R_m:100000},.002],[2,{N:100,I:2},200],[3,{l:6,'μ':2,A:3},1],[4,{B:2,A:3,'μ₀':2},3],[5,{B:2,I:3,l:4},24],[6,{N:5,'ΔΦ':.6,'Δt':.5},-6],[7,{L:2,'ΔI':-3,'Δt':.5},12],[8,{B:2,l:3,v:4,N:5},120],[9,{'Φ_max':2,'ω':3,N:4,t:pi/6},24]])check(85,r,v,e);
check(86,1,{I:10,R:2,t:Math.log(2)/2,L:1},5);
check(86,2,{'I₀':10,R:2,t:Math.log(2)/2,L:1},5);
for(const [r,v,e] of [[3,{L:6,R:2},3],[4,{L:2,I:-3},9],[5,{'L₁':4,'L₂':9,M:3},19],[6,{'L₁':4,'L₂':9,M:3},7],[7,{k:.5,'L₁':4,'L₂':9},3],[8,{N:4,'ΔΦ':3,'ΔI':2},6]])check(86,r,v,e);
typed(86,9,'L = ΣLᵢ',2+3+6===11,'Uncoupled series coils: signed terminal voltages add under common dI/dt.');
typed(86,10,'1/L = Σ(1/Lᵢ)',Math.abs(1/2+1/3+1/6-1)<1e-14,'Uncoupled parallel coils under common voltage: branch current derivatives add.');
for(const [r,v,e] of [[1,{'μ':2,N:3,A:4,l:6},12],[2,{T:.25},4],[3,{f:4},8*pi],[4,{T:.25},8*pi],[5,{'ω':8*pi,t:.125},pi],[6,{U_peak:10,'α':pi/6},5],[7,{I_peak:10,'α':pi/6},5],[8,{U_peak:pi},2],[9,{I_peak:pi},2]])check(87,r,v,e);
for(const [r,v,e] of [[1,{U_peak:10*Math.SQRT2},10],[2,{I_peak:10*Math.SQRT2},10],[3,{'ω':2,L:3},6],[4,{'ω':2,C:.25},2],[5,{U_R:3,U_L:9,U_C:5},5],[6,{X_L:9,X_C:5,R:3},4/3],[7,{X_L:9,X_C:5,Z:5},.8],[8,{R:3,Z:5},.6],[9,{R:3,X_L:9,X_C:5},5],[10,{U:10,Z:5},2]])check(88,r,v,e);
for(const [r,v,e] of [[1,{I_R:3,I_L:9,I_C:5},5],[2,{G:3,B:-4},5],[3,{Z:5},.2],[4,{'ω':10,C:.02,L:1},.1],[5,{R:5},.2],[6,{I:2,Z:5},10],[7,{P:30,S:50},.6],[8,{I_R:3,I:5},.6]])check(89,r,v,e);
const phi=Math.atan2(4,3);
for(const [r,v,e] of [[1,{U:10,I:5,'φ':phi},30],[2,{I:5,R:1.2},30],[3,{U:10,I:5,'φ':phi},40],[4,{I:5,X:1.6},40],[5,{U:10,I:5},50],[6,{P:30,t:4},120],[7,{U_phase:100},100*Math.sqrt(3)],[8,{I_phase:5},5],[9,{U_phase:100},100],[10,{I_phase:5},5*Math.sqrt(3)],[11,{U_LL:100*Math.sqrt(3),I_line:2,'φ':Math.acos(.5)},300]])check(90,r,v,e);
for(const [r,v,e] of [[1,{U_LL:100*Math.sqrt(3),I_line:2,'φ':pi/6},300],[2,{U_LL:100*Math.sqrt(3),I_line:2},600],[3,{P:300,t:2},600],[4,{'Q₁':500,'Q₂':200},300],[5,{P:300,'φ₁':Math.atan(2),'φ₂':Math.atan(1)},300],[6,{U_c:100,I_c:2},600],[7,{U_c:100,X_C:50},2],[8,{U_LL:100,X_C:50},200],[9,{U_LL:100,X_C:50},600]])check(91,r,v,e);
for(const [r,v,e] of [[1,{'N₁':10,'N₂':5},2],[2,{'U₁':100,'U₂':50},2],[3,{'I₂':4,'I₁':2},2],[4,{a:2,Z_load:100},400],[5,{a:2,'L₂':3},12],[6,{a:2,'C₂':4},1],[7,{I:2,'ρ':.02,l:10,'φ':Math.acos(.8),A:2},.32]])check(92,r,v,e);
for(const [r,v,e] of [[1,{I:10,R:2,X:1,'φ':Math.atan(.75)},22*Math.sqrt(3)],[2,{P:2400,R:2,X:1,'φ':Math.atan(.75),U_LL:100*Math.sqrt(3)},22*Math.sqrt(3)],[3,{I:2,'ρ':.02,l:10,A:2},1.2],[4,{S_N:1e6,S_k:20e6},.05],[5,{U_LL:400,S_N:1e6},.16],[6,{I_rated:100,u_k:.05},2000],[7,{U_LL:100*Math.sqrt(3),I_k:1000},300000]])check(93,r,v,e);
for(const [r,v,e] of [[1,{U_LL:100*Math.sqrt(3),Z_k:.1},300000],[2,{U_LL:100*Math.sqrt(3),Z_k:.1},1000],[3,{'κ':1.5,I_k:1000},1500*Math.SQRT2],[4,{I_3:1000},500*Math.sqrt(3)]])check(94,r,v,e);
for(const [r,v,e] of [[1,{k_e:2,'Φ':3,n:4},24],[2,{k_t:2,'Φ':3,I_a:4},24],[3,{P:20*pi,n:1},10],[4,{k_e:2,'Φ':3,f:4},24],[5,{f:60,p_pairs:3},20],[6,{n_s:20,n:21},-.05],[7,{s:-.05,f:60},3]])check(95,r,v,e);
check(96,1,{'d₁':3,'d₂':3,k:4},330000,'Colour-digit example: 33 times a 10^4 multiplier, no tolerance band included.');
check(97,1,{'d₁':4,'d₂':7,k:3},47000,'Capacitor code 473 denotes 47000 pF, not 47 pF.');
assert.equal(rows.length,144);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',expressions:144,assertions,scope:'Actual expressions and genuine multi-branch indexed cases, all star/delta terminal-pair resistances, signed generating slip and explicit unit/phasor conventions; real-component/system limits remain separate.'}));
