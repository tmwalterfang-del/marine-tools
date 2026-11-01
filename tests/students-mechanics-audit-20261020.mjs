// Run: node tests/students-mechanics-audit-20261020.mjs
// Tests parse the ACTUAL displayed expressions. No eval or Function is used.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),w={},ctx=vm.createContext({window:w});
for(const m of read('students/index.html').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(read('students/'+m[1]),ctx)}
const rows=w.MT_STUDY.mechanicsEquationAudit,machineRows=w.MT_STUDY.machineEquationAudit,byId=new Map(w.MT_FORMULAS.map(f=>[f.id,f]));let checks=0,numeric=0,dimensional=0;
const ok=(v,m)=>{assert.ok(v,m);checks++},near=(a,b,m,tol=1e-9)=>{ok(Number.isFinite(a)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),m);numeric++};
const units={'dimensionless':[0,0,0],'rad':[0,0,0],'m':[0,1,0],'mm':[0,1,0],'m²':[0,2,0],'m³':[0,3,0],'m⁴':[0,4,0],'s':[0,0,1],'s⁻¹':[0,0,-1],'rev/min':[0,0,-1],'m/s':[0,1,-1],'m/s²':[0,1,-2],'rad/s':[0,0,-1],'rad/s²':[0,0,-2],'kg':[1,0,0],'kg·m²':[1,2,0],'kg·m/s':[1,1,-1],'N':[1,1,-2],'N·m':[1,2,-2],'N·s':[1,1,-1],'N/m':[1,0,-2],'Pa':[1,-1,-2],'J':[1,2,-2],'W':[1,2,-3]};
for(const key of Object.keys(units))units[key].push(0);Object.assign(units,{'K':[0,0,0,1],'Pa·s':[1,-1,-1,0],'kg/s':[1,0,-1,0],'J/(kg·K)':[0,2,-2,-1],'W/(m²·K)':[1,0,-3,-1],'rev':[0,0,0,0],'h':[0,0,1,0]});
const equal=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-10),zero=[0,0,0,0],add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,k)=>a.map(v=>v*k);
function parse(text,values,dim=false){
 text=text.replaceAll('−','-').replaceAll('·','*').replace(/[²³⁴]/g,c=>'^'+({'²':2,'³':3,'⁴':4}[c]));
 const tokens=text.match(/[\p{L}_][\p{L}\p{N}\p{M}_]*|\d+(?:\.\d+)?|[+*/()^-]/gu)||[];
 assert.equal(tokens.join(''),text.replace(/\s/g,''),'unrecognised formula syntax');let i=0;
 const combine=(a,b,op)=>{
  if(!dim)return op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b;
  if(op==='+'||op==='-'){assert.ok(equal(a,b),'addition/subtraction requires compatible dimensions');return a}
  return add(a,scale(b,op==='*'?1:-1));
 };
 function atom(){const t=tokens[i++];if(t==='('){const r=expr();assert.equal(tokens[i++],')');return r}if(t==='-'||t==='+'){const r=atom();return dim?r:t==='-'?-r:r}if(/^\d/.test(t||''))return dim?zero:Number(t);
  if(['sin','cos','tan','sqrt','exp'].includes(t)){assert.equal(tokens[i++],'(');const a=expr();assert.equal(tokens[i++],')');if(dim){if(t==='sqrt')return scale(a,.5);assert.ok(equal(a,zero),'dimensionless function argument');return zero}return Math[t](a)}
  if(t==='π')return dim?zero:Math.PI;
  assert.ok(Object.hasOwn(values,t),'explicit quantity required: '+t);return values[t];
 }
 function power(){let v=atom();if(tokens[i]==='^'){i++;const paren=tokens[i]==='(';if(paren)i++;const sign=tokens[i]==='-'?(i++,-1):1;assert.ok(/^\d/.test(tokens[i]),'constant numeric exponent required');let n=Number(tokens[i++])*sign;if(paren&&tokens[i]==='/'){i++;n/=Number(tokens[i++])}if(paren)assert.equal(tokens[i++],')');v=dim?scale(v,n):v**n}return v}
 function product(){let v=power();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++];v=combine(v,power(),op)}return v}
 function expr(){let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++];v=combine(v,product(),op)}return v}
 const result=expr();assert.equal(i,tokens.length,'entire expression consumed');return result;
}
function rhs(row,values){return parse(row.formula.split('=')[1],values)}
function find(page,name,formula){const r=[...rows,...machineRows].find(r=>r.page===page&&r.name===name&&(!formula||r.formula===formula));assert.ok(r,'registered expression '+page+' '+name+' '+(formula||''));return r}
function sample(page,name,values,expected,formula,tol){near(rhs(find(page,name,formula),values),expected,page+' '+name,tol)}
ok(rows.length===204,'204 separately captured mechanics expressions');ok(new Set(rows.map(r=>r.id)).size===204,'unique mechanics expression IDs');ok(new Set(rows.map(r=>r.page)).size===19,'nineteen source pages represented, without an exhaustiveness claim');
ok(machineRows.length===53,'53 machine-element relationships');
for(const r of [...rows,...machineRows]){ok(byId.has(r.formulaId)&&r.conditions&&r.symbols.every(s=>s.symbol&&s.meaning&&s.unit),'parent and explicit quantity metadata '+r.id);
 if(r.formula.includes('Σ'))continue; // Component sums and geometric sums need a separate indexed-expression grammar.
 const vars={};for(const s of r.symbols){assert.ok(units[s.unit],'known dimensional unit '+s.unit);for(const key of s.symbol.split(','))vars[key.trim()]=units[s.unit]}
 const [lhs,right]=r.formula.split('=');assert.ok(equal(parse(lhs,vars,true),parse(right,vars,true)),r.id+' dimensional equality');dimensional++;
 if(r.referenceCase)near(rhs(r,r.referenceCase.values),r.referenceCase.expected,'recorded reference '+r.id);
}
// Independently integrate uniform geometric distributions instead of substituting the same closed forms.
function integrate(f,a,b,n=20000){let sum=0,dx=(b-a)/n;for(let j=0;j<n;j++)sum+=f(a+(j+.5)*dx);return sum*dx}
const α=1.1,r=2;
const arcCentroid=integrate(t=>r*Math.cos(t),-α,α)/(2*α);
sample(30,'Uniform circular arc centroid',{r,α},arcCentroid,undefined,1e-8);
const wire=integrate(t=>r*Math.sin(t),0,Math.PI)/Math.PI;
sample(30,'Semicircular wire centroid',{r},wire,undefined,1e-8);
const triangleA=integrate(y=>3*(1-y/4),0,4),triangleQ=integrate(y=>y*3*(1-y/4),0,4);
sample(30,'Triangular area centroid',{h:4},triangleQ/triangleA,undefined,1e-8);
const a=5,b=2,h=3,A=integrate(y=>a+(b-a)*y/h,0,h),Q=integrate(y=>y*(a+(b-a)*y/h),0,h);
sample(30,'Trapezoidal area centroid',{a,b,h},Q/A,undefined,1e-8);
const semiA=integrate(x=>2*Math.sqrt(r*r-x*x),0,r),semiQ=integrate(x=>x*2*Math.sqrt(r*r-x*x),0,r);
sample(31,'Semicircular area centroid',{r},semiQ/semiA,undefined,1e-6);
const solidV=integrate(y=>(1-y/4)**2,0,4),solidQ=integrate(y=>y*(1-y/4)**2,0,4);
sample(31,'Solid pyramid or cone centroid',{h:4},solidQ/solidV,undefined,1e-8);
sample(32,'Rolling resistance offset model',{e:.002,F_N:1000,r:.5},4);
const pivotTorque=integrate(x=>.2*1000/(Math.PI*.1**2)*2*Math.PI*x*x,0,.1);
sample(32,'Flat pivot friction torque',{μ:.2,F_N:1000,r:.1},pivotTorque,undefined,1e-8);
// Relative-velocity mesh balance: sun/carrier and ring/carrier pitch velocities cancel.
const n_s=10,z_s=20,z_r=60,n_c=2.5;
near((n_s-n_c)*z_s+(0-n_c)*z_r,0,'independent planetary mesh balance');
sample(33,'Ring fixed: carrier speed',{n_s,z_s,z_r},n_c);
sample(33,'Carrier fixed: signed ring speed',{n_s,z_s,z_r},-10/3);
sample(34,'Ideal hoist effort',{G:1000,n:4},250);
sample(34,'Differential hoist ideal effort',{G:1000,R:.1,r:.08},100);
sample(35,'Ideal screw crank force',{G:1000,s:.01,R:.2},10/(.4*Math.PI));
// Projectile values from horizontal uniform motion and vertical constant acceleration.
sample(37,'Projectile horizontal position',{'v₀':20,t:.5,α:Math.PI/6},5*Math.sqrt(3));
sample(37,'Projectile vertical position',{'v₀':20,t:.5,α:Math.PI/6,g:10},3.75);
sample(37,'Range on level ground',{'v₀':20,α:Math.PI/6,g:10},20*Math.sqrt(3));
sample(37,'Maximum projectile height',{'v₀':20,α:Math.PI/6,g:10},5);
ok(rhs(find(37,'Projectile vertical position'),{'v₀':20,t:.5,α:Math.PI/6,g:10})!==5,'position before apex must not be replaced by peak height');
sample(38,'Angular constant-acceleration relation',{ω:0,'ω₀':2,t:3},3,'φ = (ω+ω₀)·t/2');
sample(39,'Physical pendulum',{I:2,m:4,g:10,e:.5},2*Math.PI/Math.sqrt(10));
const rodI=integrate(x=>6/2*x*x,-1,1);
sample(40,'Slender rod central inertia',{m:6,l:2},rodI,undefined,1e-8);
sample(41,'Mass parallel-axis theorem',{I_C:rodI,m:6,e:1},8,undefined,1e-8);
sample(41,'Collision kinetic energy loss',{'m₁':2,'m₂':2,'v₁':3,'v₂':-1,'u₁':1,'u₂':1},8);
sample(42,'Pin average shear stress',{F:1000,n:2,d:.01},1000/(2*Math.PI*.005**2));
sample(42,'Pin projected bearing stress',{F:1000,n:2,d:.01,t:.005},1e7);
const sectionI=integrate(y=>.2*y*y,-.15,.15);
sample(43,'Rectangle section property',{b:.2,h:.3},sectionI,'I_x = b·h³/12',1e-8);
sample(43,'Rectangle section property',{b:.2,h:.3},sectionI/.15,'W_x = b·h²/6',1e-8);
const triIx=integrate(y=>3*(1-y/4)*(y-4/3)**2,0,4);
sample(43,'Isosceles triangle section property',{b:3,h:4},triIx,'I_x = b·h³/36',1e-8);
sample(43,'Isosceles triangle section property',{b:3,h:4},triIx/(8/3),'W_x = b·h²/24',1e-8);
// Integrate curvature M/EI with fixed-end or simple-support boundary conditions.
const F=120,L=3,E=2e11,I=8e-6,G=360;
const tipPoint=integrate(x=>F*(L-x)*(L-x)/(E*I),0,L);
sample(45,'Cantilever end point load',{F,L,E,I},tipPoint,'δ = F·L³/(3·E·I)',1e-9);
const tipUniform=integrate(x=>G/L*(L-x)**2/2*(L-x)/(E*I),0,L);
sample(45,'Cantilever uniform load',{G,L,E,I},tipUniform,'δ = G·L³/(8·E·I)',1e-9);
function simpleDeflection(moment,x){const slope0=-integrate(s=>(L-s)*moment(s)/(E*I),0,L)/L;return Math.abs(slope0*x+integrate(s=>(x-s)*moment(s)/(E*I),0,x))}
sample(45,'Simply supported centre point load',{F,L,E,I},simpleDeflection(x=>x<=L/2?F*x/2:F*(L-x)/2,L/2),'δ = F·L³/(48·E·I)',1e-9);
sample(45,'Simply supported uniform load',{G,L,E,I},simpleDeflection(x=>G*x/2-G*x*x/(2*L),L/2),'δ = 5·G·L³/(384·E·I)',1e-9);
const loadA=2,loadB=1,moment=x=>x<=loadA?F*loadB/L*x:F*loadA/L*(L-x);
const atLoad=simpleDeflection(moment,loadA);
sample(45,'Simply supported off-centre point load',{F,a:loadA,b:loadB,L,E,I},atLoad,'δ_F = F·a²·b²/(3·E·I·L)',1e-9);
const beta2=loadB/L,beta1=loadA/L,xMaximum=L*Math.sqrt((1-beta2**2)/3);
sample(45,'Off-centre point-load normalized relation',{δ_F:atLoad,'β₁':beta1,'β₂':beta2},simpleDeflection(moment,xMaximum),'δ_max = δ_F·(1+β₂)·sqrt((1+β₂)/(3·β₁))/(3·β₂)',1e-9);
sample(46,'Torque using rpm and watts',{P:1000,n_rpm:60},1000/(2*Math.PI));
sample(46,'Torque using rev/s and watts',{P:1000,n:1},1000/(2*Math.PI));
sample(46,'Torque using angular speed',{P:1000,ω:2*Math.PI},1000/(2*Math.PI));
// Euler load via Rayleigh quotient for sin(πx/L), not a second copy of the formula.
const numerator=integrate(x=>E*I*(Math.PI/L)**4*Math.sin(Math.PI*x/L)**2,0,L),denominator=integrate(x=>(Math.PI/L)**2*Math.cos(Math.PI*x/L)**2,0,L);
sample(47,'Elastic Euler force',{E,I,L_eff:L},numerator/denominator);
sample(48,'Thin cylinder equilibrium thickness',{p:2e6,d:.5,σ_h:1e8},.005);
ok(byId.get('mechanics-audit-20261020-thin-cylinder').note.includes('internal MINUS external'),'pressure is differential');
ok(read('sw.js').includes("'./students/mechanics-equation-audit-20261020.js'"),'mechanics pack included in offline shell');
ok(!read('students/index.html').includes('Tabulated saturation reference points with interpolation'),'Mollier reference card no longer describes removed interpolation');
// Machine-element reference cases: explicit load bases, geometric models and time conversions.
sample(49,'Thread lead angle',{s:.006,'d₂':.02},.006/(Math.PI*.02));
sample(49,'Effective V-thread friction angle',{μ:.2,β:Math.PI/3},.4);
const leadAngle=.05,frictionAngle=.15;
sample(49,'Signed thread torque during lowering',{G:1000,'d₂':.02,α:leadAngle,ρ:frictionAngle},-10*Math.tan(.1));
sample(49,'Lowering-positive thread torque',{G:1000,'d₂':.02,α:leadAngle,ρ:frictionAngle},10*Math.tan(.1));
sample(49,'Total tightening torque',{T_thread:15,T_collar:5},20);
sample(50,'Bolt nominal core stress',{F:1000,d_core:.01},1000/(Math.PI*.005**2));
sample(50,'Bolt tensile stress-area stress',{F:1000,A_t:58e-6},1000/58e-6);
sample(50,'Preloaded friction joint slip-force model',{m:4,μ:.2,R:10000,n:2,n_s:2},8000);
sample(50,'Equal-leg right-angle fillet throat',{s:.006},.003*Math.sqrt(2));
sample(50,'Single weld throat area',{a:.004,l_eff:.1},.0004);
sample(50,'Bolt combined normal and torsional stress',{σ:30,τ:40},Math.sqrt(5700));
sample(51,'Projected journal bearing pressure',{F:1000,d:.1,l:.2},50000);
sample(51,'Relative diametral bearing clearance',{D:.1002,d:.1},.002);
sample(51,'Relative radial bearing clearance',{R:.0501,r:.05},.002);
sample(51,'Relative minimum oil-film thickness',{h_min:.00004,R:.0501,r:.05},.4);
sample(52,'Minimum film thickness from clearance',{'ε_f':.4,r:.05,ψ:.002},.00004);
sample(52,'Diametral clearance from radii',{R:.0501,r:.05},.0002);
sample(52,'Annular thrust-bearing pressure',{F:1000,D:.2,d:.1},1000/(Math.PI*(.1**2-.05**2)));
const wearRadius=integrate(x=>x,.05,.1)/integrate(()=>1,.05,.1);
sample(52,'Uniform-wear annular friction radius',{D:.2,d:.1},wearRadius);
sample(53,'Bearing friction power',{F:1000,μ:.1,v:2},200);
sample(53,'Oil sensible heat removal',{m_dot:2,c_p:2000,'ΔT_oil':10},40000);
sample(53,'Steady bearing temperature above ambient',{P_f:200,P_oil:100,h_c:10,l:.2,d:.1},100/(.2*Math.PI));
sample(53,'Ball bearing basic rating life',{C:20000,P:10000},8000000);
sample(53,'Roller bearing basic rating life',{C:80000,P:10000},1024000000,undefined,1e-8);
sample(53,'Bearing life revolutions from hours',{L_h:1,n:10},36000);
sample(53,'Bearing life hours from rpm',{L_rev:8000000,n_rpm:1000},400/3);
sample(54,'Linear elastic shear strain',{τ:2e6,G:8e10},.000025);
ok(byId.get('machine-audit-20261020-bearing-life').note.includes('90% reliability'),'L10 statistical basis is visible');
ok(find(51,'Relative minimum oil-film thickness').conditions.includes('not eccentricity ratio'),'film fraction distinguished from eccentricity');
console.log(JSON.stringify({status:'PASS',checks,capturedMechanicsExpressions:rows.length,capturedMachineExpressions:machineRows.length,dimensionallyParsedExpressions:dimensional,numericReferenceCases:numeric,scope:'Selected independent numeric cases and dimensional consistency; no claim of complete source, domain or design-code verification'}));
