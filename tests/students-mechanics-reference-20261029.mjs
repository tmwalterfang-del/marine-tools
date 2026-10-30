// Complete mechanics chapter. Displayed arithmetic is evaluated directly;
// indexed equilibrium models and the unsupported historical head are separate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.id.startsWith('book-mechanics-'));
const by=new Map(rows.map(r=>[r.id,r])),evidence={},pi=Math.PI;let assertions=0;
function check(p,r,inputs,expected,reference='Authored load/geometric reference state with the stated model and sign conventions.',tolerance=2e-9) {
 const id=`book-mechanics-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const actual=evaluate(row.formula.split('=')[1].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(Math.abs(expected),1e-16),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected});
}
function typed(p,r,formula,condition,reference,kind='FINITE_INDEXED_MODEL_CHECK') {
 const id=`book-mechanics-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);assertions++;
 evidence[id]={kind,reference};
}
const integral=(f,a,b,N=1000)=>{let sum=f(a)+f(b);for(let i=1;i<N;i++)sum+=(i%2?4:2)*f(a+(b-a)*i/N);return sum*(b-a)/(3*N);};
check(30,1,{F:30,l:2},60);
check(30,2,{k:300,x:.02},6);
typed(30,3,'ΣF_x = 0',[100,-30,-70].reduce((a,b)=>a+b,0)===0,'Three signed horizontal components in one inertial Cartesian frame.');
typed(30,4,'ΣF_y = 0',[50,60,-110].reduce((a,b)=>a+b,0)===0,'Signed support and load forces balance vertically.');
typed(30,5,'ΣM = 0',30*2+(-20)*3===0,'Forces at perpendicular lever arms 2 and 3 balance about one common point.');
const radius=2,halfAngle=.8,arc=2*radius*halfAngle,chord=2*radius*Math.sin(halfAngle);
const arcCentroid=integral(t=>radius*Math.cos(t),-halfAngle,halfAngle)/(2*halfAngle);
check(30,6,{r:radius,'α':halfAngle},arcCentroid,'Thin-wire centroid from independently integrated Cartesian first moment.');
check(30,7,{k:chord,r:radius,b:arc},arcCentroid);
check(30,8,{r:2},4/pi);
check(30,9,{h:3},1);
check(30,10,{h:3,a:4,b:2},4/3,'Trapezoid first moment from linear strip breadth.');
const sectorCentroid=(integral(t=>Math.cos(t),-halfAngle,halfAngle)*integral(r=>r*r,0,radius))/(2*halfAngle*integral(r=>r,0,radius));
check(31,1,{r:radius,'α':halfAngle},sectorCentroid,'Sector first moment from separated polar area integrals.');
check(31,2,{r:radius,k:chord,b:arc},sectorCentroid);
check(31,3,{r:2},8/(3*pi));
check(31,4,{k:4,A:2*pi},8/(3*pi),'Semicircular segment: first moment 2r³/3 divided by semicircle area.');
check(31,5,{h:4},1);
typed(31,6,'x̄ = Σ(Aᵢ·xᵢ)/ΣAᵢ',(12*3-2*1)/(12-2)===3.4,'Rectangle of area 12 at x=3 with a hole of area 2 at x=1; signed hole moment retained.');
typed(31,7,'ȳ = Σ(Aᵢ·yᵢ)/ΣAᵢ',(12*2-2*3)/(12-2)===1.8,'Same physical area with its signed y moments; common datum.');
check(32,1,{'μ':.2,F_N:100},20);
check(32,2,{'φ':Math.atan(.2)},.2);
check(32,3,{e:.002,F_N:100,r:.1},2);
check(32,4,{e:.002,r:.1},.02);
check(32,5,{'μ':.3,F_N:100,r:.2},4,'Uniform-pressure pivot: torque integrated over concentric annular contact rings.');
check(32,6,{F_slack:100,'μ':Math.log(2)/pi,'α':pi},200,'Differential belt balance dT=μT dθ at limiting slip.');
check(32,7,{'d₂':.4,'n₂':5},2);
check(32,8,{'z₂':40,'n₂':5},200);
check(32,9,{'d₂':.4,'d₁':.2},2);
check(32,10,{'z₂':40,'z₁':20},2);
check(32,11,{'n₁':10,'n₂':5},2);
check(33,1,{'R₁':2,'r₁':1,'R₂':3,'r₂':1,l:4,r:2},12);
check(33,2,{m:2},2*pi);
check(33,3,{d:40,z:20},2*pi);
check(33,4,{m:2,z:20},40);
check(33,5,{p:2*pi,z:20},40);
check(33,6,{z_s:20,z_p:20},60);
check(33,7,{n_s:6,z_s:20,z_r:60},1.5,'Mesh velocities relative to the carrier give sun 6, fixed ring 0, carrier 1.5 rev/s.');
check(33,8,{z_s:20,z_p:20},4);
check(33,9,{n_s:6,z_s:20,z_r:60},-2,'Carrier fixed: sun and internal-ring outputs rotate with opposite signs.');
check(33,10,{z_r:60,z_s:20},3);
check(34,1,{n:4,h:2},8);
check(34,2,{G:800,n:4},200);
check(34,3,{G:800,F:250},3.2);
check(34,4,{G:800,h:2,F:250,l:8},.8);
check(34,5,{G:800,F:250,n:4},.8);
check(34,6,{G:800,R:.2,r:.1},200,'Differential pulley: one turn releases a net 2π(R−r) in two supporting parts.');
check(34,7,{N:2,R:.2,r:.1},.2*pi);
const alpha=.8,parts=3,raising=Array.from({length:parts},(_,i)=>alpha**(i+1)),lowering=Array.from({length:parts},(_,i)=>alpha**(-i-1));
const sum=xs=>xs.reduce((a,b)=>a+b,0);
typed(34,8,'F = G/Σ(α^j, j=1…n)',Math.abs(sum(raising.map(v=>v*600/sum(raising)))-600)<1e-10,'Iterated tension transmission α=.8 over three supporting terms; sum of actual support tensions equals load.');
typed(34,9,'F_lower = G/Σ(α^(−j), j=1…n)',Math.abs(sum(lowering.map(v=>v*600/sum(lowering)))-600)<1e-10,'Reverse recurrence; no brake/self-locking behavior inferred from this source-specific transmission model.');
check(35,1,{G:100,s:.01,R:.1},5/pi);
check(35,2,{G:100,s:.01,'μ':.1,r:.02,'μ_c':.1,r_c:.03,R:.1},5/pi+5);
check(35,3,{R:.1,s:.01},20*pi);
check(35,4,{s:.01,'μ':.1,r:.02,'μ_c':.1,r_c:.03},1/(1+pi));
check(35,5,{G:200,r:.1,x:2},40);
check(35,6,{F_t:100,R_w:.2},20);
check(35,7,{h:2*pi,r:.1,t:10},1);
check(35,8,{R_w:.2,n_d:1,s:.02},20*pi);
check(36,1,{G:100,'α':Math.acos(.8)},80);
check(36,2,{G:100,'α':Math.acos(.8)},60);
check(36,3,{'μ':.25,F_N:80},20);
check(36,4,{F_f:20,F_p:60},80);
check(36,5,{'α':Math.atan(.25)},.25);
check(36,6,{l:5,h:3},5/3);
check(36,7,{v:-3,t:4},-12);
check(36,8,{d:2,n:3},6*pi);
check(36,9,{r:1,n:3},6*pi);
check(36,10,{v:6*pi,r:1},6*pi);
check(36,11,{n:3},6*pi);
check(36,12,{'ω':6*pi,t:2},12*pi);
check(36,13,{T:1/3},3);
check(36,14,{v:6*pi,r:1},36*pi*pi);
check(36,15,{r:1,T:1/3},36*pi*pi);
check(36,16,{'ω':6*pi,r:1},36*pi*pi);
// Integrate constant acceleration from a signed initial velocity.
const motion={'v₀':-2,a:3,t:4,v:10,s:16,g:3};
for(const [r,expected] of [[1,10],[2,16],[3,16],[4,100],[5,10],[6,16],[7,100]])check(37,r,motion,expected,'Integral of constant acceleration 3 from initial velocity −2 over four seconds.');
const projectile={'v₀':20,'α':Math.atan(.75),g:10,t:1};
for(const [r,expected] of [[8,16],[9,2],[10,16],[11,7],[12,38.4],[13,7.2]])check(37,r,projectile,expected,'Projectile starts with components (16,12); vertical acceleration −10. Range uses t=2.4 s and apex t=1.2 s.');
const angular={'ω₀':-2,'ω':10,'α':3,t:4,'φ':16,r:2};
check(37,14,angular,10);check(37,15,angular,100);check(37,16,angular,3);
check(38,1,angular,16);check(38,2,angular,16);check(38,3,angular,16);check(38,4,angular,6);
for(const [r,inputs,expected] of [
 [5,{m:20,g:10},200],[6,{m:3,a:20},60],[7,{F:-30,s:2},-60],[8,{G:200,h:-3},-600],[9,{m:20,g:10,h:-3},-600],
 [10,{m:3,v:4},24],[11,{W:60,t:3},20],[12,{F:5,v:4},20],[13,{T:5,'ω':4},20],[14,{P_out:20,P_in:25},.8],
])check(38,r,inputs,expected);
for(const [r,inputs,expected] of [
 [1,{I:2,'α':3},6],[2,{T:6,'φ':4},24],[3,{I:3,'ω':4},24],[4,{m:3,a_n:4},12],[5,{m:3,a_t:4},12],
 [6,{l:4,g:4},2*pi],[7,{I:8,m:2,g:4,e:1},2*pi],[8,{m:4,k:4},2*pi],
])check(39,r,inputs,expected);
check(40,1,{l:4,'α':pi/3,g:2},2*pi,'Conical-pendulum force components: vertical tension balances weight and radial tension provides centripetal force.');
for(const [r,inputs,expected] of [[2,{m:6,r:2},12],[3,{m:6,R:2,r:1},15],[4,{m:6,r_m:2},24],[5,{m:6,h:4},8],[6,{m:6,b:2},2],[7,{m:5,r:2},8],[8,{m:6,l:4},8]])check(40,r,inputs,expected,'Uniform mass distributions integrated about the explicitly stated central axis.');
check(41,1,{I_C:8,m:6,e:2},32);
check(41,2,{F:-3,t:2},-6);
check(41,3,{m:3,v:2,'v₀':4},-6);
check(41,4,{m:3,v:-2},-6);
check(41,5,{'m₁':1,'m₂':3,u:.5},2);
check(41,6,{'m₁':1,'m₂':3,'u₁':-1.75,'u₂':1.25},2);
check(41,7,{e:.5,'v₂':-1,'v₁':5},-3);
check(41,8,{'m₁':1,'m₂':3,'v₁':5,'v₂':-1,'u₁':-1.75,'u₂':1.25},10.125,'Lost relative kinetic energy = 1/2 reduced mass × (1−e²) × relative approach speed².');
for(const [r,inputs,expected] of [[1,{F:600,A:3},200],[2,{F:600,A:3},200],[3,{'ΔL':.2,'L₀':10},.02],[4,{'σ':200,E:10000},.02],[5,{'σ':200,'L₀':10,E:10000},.2],[6,{F:600,'L₀':10,E:10000,A:3},.2],[7,{F:600,A_s:3},200],[8,{F:600,n:2,d:3,t:2},50],[9,{F:200*pi,n:2,d:2},100]])check(42,r,inputs,expected);
check(43,1,{I_C:16,A:12,e:2},64);
for(const [r,expected] of [[2,16],[3,9],[4,8],[5,6]])check(43,r,{b:3,h:4},expected,'Rectangle area strips integrated about centroid; modulus divides by actual extreme-fibre distance.');
for(const r of [6,7,8,9])check(43,r,{d:2},pi/4,'Unit-radius disk diametral area inertia π/4; extreme-fibre distance one.');
for(const r of [10,11])check(43,r,{D:4,d:2},15*pi/4,'Concentric annulus obtained by subtracting radius-one disk from radius-two disk.');
for(const r of [12,13])check(43,r,{D:4,d:2},15*pi/8,'Same annulus inertia divided by outer radius two.');
for(const [r,expected] of [[14,6*pi],[15,13.5*pi],[16,3*pi],[17,4.5*pi]])check(43,r,{a:3,c:2},expected,'Ellipse obtained by scaling unit-disk integrals; a,c are semiaxes.');
for(const [r,expected] of [[18,4.5],[19,13.5],[20,2.25],[21,4.5]])check(43,r,{b:6,h:3},expected,'Isosceles triangle strip integration; top fibre is 2h/3 from centroid, side fibre b/2.');
check(44,1,{B:6,H:6,b:2,h:2},320/3);check(44,2,{B:6,H:6,b:2,h:2},320/9);
check(44,3,{B:6,H:6,b:2,h:2},328/3);check(44,4,{B:6,H:6,b:2,h:2},328/9);
// Independent beam reference: integrate curvature from equilibrium moments and
// impose displacement/slope boundary conditions, rather than another deflection table.
function beam(L,E,I,loadAt,pointLoad,totalDistributed=0,cantilever=false) {
 const RA=pointLoad*(L-loadAt)/L+totalDistributed/2;
 const moment=x=>cantilever?pointLoad*(L-x)+totalDistributed/L*(L-x)**2/2:RA*x-pointLoad*Math.max(x-loadAt,0)-totalDistributed/L*x*x/2;
 const integrateTo=(f,end)=>loadAt>0&&loadAt<end?integral(f,0,loadAt)+integral(f,loadAt,end):integral(f,0,end);
 const initial=cantilever?0:integrateTo(t=>(L-t)*moment(t),L)/(E*I*L);
 const slope=x=>cantilever?integrateTo(t=>moment(t),x)/(E*I):initial-integrateTo(t=>moment(t),x)/(E*I);
 const deflection=x=>cantilever?integrateTo(t=>(x-t)*moment(t),x)/(E*I):initial*x-integrateTo(t=>(x-t)*moment(t),x)/(E*I);
 return {RA,moment,slope,deflection};
}
check(45,1,{M:120,W:4},30);check(45,2,{I:16,c:2},8);
const L=10,E=200,I=3,F=60,G=60;
const tip=beam(L,E,I,L,F,0,true),cantDistributed=beam(L,E,I,L,0,G,true),middle=beam(L,E,I,L/2,F),uniform=beam(L,E,I,L/2,0,G);
for(const [r,model,x,which] of [[3,tip,0,'moment'],[4,tip,L,'deflection'],[5,tip,L,'slope'],[6,cantDistributed,0,'moment'],[7,cantDistributed,L,'deflection'],[8,cantDistributed,L,'slope'],[9,middle,L/2,'moment'],[10,middle,L/2,'deflection'],[11,middle,0,'slope'],[12,uniform,L/2,'moment'],[13,uniform,L/2,'deflection'],[14,uniform,0,'slope']])check(45,r,{F,G,L,E,I},Math.abs(model[which](x)),'Equilibrium moment integrated twice with fixed-root or simply-supported displacement conditions.');
const a=8,b=2,offset=beam(L,E,I,a,F),values={F,L,E,I,a,b,'β₁':a/L,'β₂':b/L,'δ_F':offset.deflection(a)};
check(45,15,values,offset.RA);check(45,16,values,F-offset.RA);check(45,17,values,offset.deflection(a));
let low=0,high=L;for(let i=0;i<70;i++){const mid=(low+high)/2;if(offset.slope(mid)>0)low=mid;else high=mid;}const maximum=(low+high)/2;
check(45,18,values,offset.deflection(maximum),'Maximum located by a root of the independently integrated slope, not by assuming the load point.');
check(45,19,values,maximum);
check(45,20,values,Math.abs(offset.slope(0)));check(45,21,values,Math.abs(offset.slope(L)));
check(46,1,{T:120,W_p:4},30);check(46,2,{J:16,r:2},8);
check(46,3,{d:2},pi/2);check(46,4,{d:2},pi/2);
check(46,5,{D:4,d:2},15*pi/2);check(46,6,{D:4,d:2},15*pi/4);
check(46,7,{T:2,L:3,G:4,J:5},.3);check(46,8,{T:2,L:3,W_p:5,G:4,r:1},.3);
check(46,9,{P:20*pi,n_rpm:60},10);check(46,10,{P:20*pi,n:1},10);check(46,11,{P:20*pi,'ω':2*pi},10);
check(47,1,{I:16,A:4},2);check(47,2,{L_eff:10,i:2},5);
const critical=200*3*integral(x=>(-((pi/10)**2)*Math.sin(pi*x/10))**2,0,10)/integral(x=>((pi/10)*Math.cos(pi*x/10))**2,0,10);
check(47,3,{E:200,I:3,L_eff:10},critical,'Pinned-column eigenmode: EI∫(y″)²dx / ∫(y′)²dx.');
check(47,4,{F_cr:400,A:4},100);check(47,5,{'σ_cr':100,n_s:4},25);check(47,6,{F_cr:400,n_s:4},100);check(47,7,{'σ_cr':100,A:4},400);
check(47,8,{L:10},20);check(47,9,{L:10},10);
let rootLow=4.4,rootHigh=4.6;for(let i=0;i<70;i++){const m=(rootLow+rootHigh)/2;if(Math.tan(m)-m<0)rootLow=m;else rootHigh=m;}
check(47,10,{L:10},10*pi/((rootLow+rootHigh)/2),'Fixed/pinned eigenvalue satisfies tanλ=λ; no rounded 0.7 assumption.');
check(47,11,{L:10},5);
check(48,1,{p:100,d:2,'σ_h':1000},.1,'Cut thin-cylinder half shell: pressure force p·d per length balanced by two hoop membrane forces σs.');
const head=by.get('book-mechanics-p48-r02');
typed(48,2,head.formula,head.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT','Historical dished-head factor three lacks an independently established shape/stress/code basis. Excluded from supported calculations; no fabricated coefficient case.','EXCLUDED_FROM_SUPPORTED_CALCULATION');
assert.equal(rows.length,204);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',expressions:204,referenceCaseExpressions:203,excludedHistoricalModels:1,assertions,scope:'Displayed arithmetic and finite indexed models; independent beam curvature integration/eigenmodes; no code acceptance or historical head calibration inferred.'}));
