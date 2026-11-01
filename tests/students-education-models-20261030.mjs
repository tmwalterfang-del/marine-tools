import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window={};vm.runInNewContext(fs.readFileSync('students/education-models-20261030.js','utf8'),{window});
const M=window.MT_EDUCATION_MODELS;let checks=0;
function near(a,b,tol=2e-8){assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);checks++;}
const integral=(f,a,b,N=2000)=>{let sum=f(a)+f(b);for(let i=1;i<N;i++)sum+=(i%2?4:2)*f(a+(b-a)*i/N);return sum*(b-a)/(3*N);};
// Beam oracle integrates equilibrium curvature, imposing boundary conditions.
for(const support of ['simple','cantilever'])for(const position of [0,1.2,3,4.8,6])for(const distributed of [0,.1]){
 const c={support,position,length:6,young:210,inertia:800,force:1,distributed},m=M.beam(c),L=6,F=1000,q=distributed*1000,EI=210e9*800e-8,a=position,RA=support==='cantilever'?F+q*L:F*(L-a)/L+q*L/2;
 const moment=x=>support==='cantilever'?-F*Math.max(a-x,0)-q*(L-x)**2/2:RA*x-q*x*x/2-F*Math.max(x-a,0);
 const split=(f,x)=>a>0&&a<x?integral(f,0,a)+integral(f,a,x):integral(f,0,x);
 const slope0=support==='cantilever'?0:split(t=>(L-t)*moment(t),L)/(EI*L);
 for(const p of m.data.filter((_,i)=>i%20===0)){
  const deflection=support==='cantilever'?-split(t=>(p.x-t)*moment(t),p.x)/EI:slope0*p.x-split(t=>(p.x-t)*moment(t),p.x)/EI;
  near(p.deflection,deflection*1000);near(p.moment,moment(p.x)/1000);
 }
 near(m.left+m.right,c.force+distributed*L);
 if(support==='simple')near(m.right*L,c.force*position+distributed*L*L/2);
 else near(m.rootMoment,c.force*position+distributed*L*L/2);
}
// Integrate circuit ODEs independently with RK4 at fixed physical time steps.
for(const circuit of ['rc','rl'])for(const mode of ['rise','decay']){
 const c={circuit,mode,resistance:circuit==='rc'?100:2,storage:circuit==='rc'?10000:2000,supply:10,initial:-2,timeConstants:5},m=M.transient(c),storage=c.storage*(circuit==='rc'?1e-6:1e-3),source=mode==='rise'?10:0;
 let y=c.initial,t=0;const dt=m.tau/6400,derivative=y=>circuit==='rc'?(source-y)/(c.resistance*storage):(source-c.resistance*y)/storage;
 for(let i=0;i<m.data.length;i++){
  const target=m.data[i].t;
  while(t<target-dt/2){const h=Math.min(dt,target-t),k1=derivative(y),k2=derivative(y+h*k1/2),k3=derivative(y+h*k2/2),k4=derivative(y+h*k3);y+=h*(k1+2*k2+2*k3+k4)/6;t+=h;}
  near(m.data[i].state,y);near(m.data[i].energy,.5*storage*y*y);
 }
}
for(const cycle of ['otto','diesel'])for(const compression of [4,8,20]){
 const c={cycle,compression,gamma:1.4,cold:300,pressure:1,volume:1,hot:2400,cutoff:2},m=M.cycle(c),s=m.states;
 near(m.Qin-m.Qout,m.work);near(m.work/m.Qin,m.efficiency);
 const ideal=cycle==='otto'?1-compression**(-.4):1-(2**1.4-1)/(1.4*(2-1)*compression**.4);near(m.efficiency,ideal);
 let area=0;for(let i=1;i<m.data.length;i++)area+=(m.data[i].pressure+m.data[i-1].pressure)/2*(m.data[i].volume-m.data[i-1].volume)*.1;
 near(area,m.work,2e-3);near(s[0].volume,s[3].volume);near(s[1].volume,1/compression);
}
const pump={shutoff:30,ratedHead:20,referenceFlow:40,speed:1,staticHead:5,loss:10,density:1000,efficiency:.8};
for(const speed of [.5,1,1.5]){
 const m=M.pump({...pump,speed}),H=30*speed*speed-(10/1600)*m.flow*m.flow;
 near(m.head,H);near(m.head,5+10/1600*m.flow*m.flow);near(m.hydraulicPower,1000*9.80665*m.flow/3600*m.head/1000);near(m.shaftPower*.8,m.hydraulicPower);
  near(m.npshAvailable,(101.325-2.34)*1000/(1000*9.80665)+1.5-2*(m.flow/40)**2);near(m.npshMargin,m.npshAvailable-3);
}
const stopped=M.pump({...pump,speed:.2});assert.equal(stopped.operating,false);assert.equal(stopped.head,null);assert.equal(stopped.shaftPower,null);near(stopped.flow,0);
const ref={flow:.1,h1:400,h2:450,h3:200};
for(const shift of [-1000,0,1000]){const m=M.refrigeration({...ref,h1:ref.h1+shift,h2:ref.h2+shift,h3:ref.h3+shift});near(m.cooling,20);near(m.work,5);near(m.rejected,25);near(m.rejected,m.cooling+m.work);near(m.cop,4);near(m.heatingCop,m.cop+1);near(m.h4,m.h3);}
const heavy={displacement:10000,kg:5,length:100,breadth:20,depth:10,density:1,weight:100,oldHeight:5,hookHeight:8,arm:10,counter:50,counterHeight:2,counterArm:-15};
for(const loadMode of ['onboard','added'])for(const counterMode of ['onboard','added']){
 const m=M.heavyLift({...heavy,loadMode,counterMode}),mass=10000+(loadMode==='added'?100:0)+(counterMode==='added'?50:0),zMoment=50000+(loadMode==='added'?800:300)+(counterMode==='added'?100:0);
 near(m.mass,mass);near(m.newKG,zMoment/mass);near(m.TCG,250/mass);assert.ok(m.equilibrium!==null);
 const t=m.equilibrium*Math.PI/180,T=mass/2000,height=y=>T+y*Math.tan(t),A=integral(height,-10,10),yb=integral(y=>y*height(y),-10,10)/A,zb=integral(y=>height(y)**2/2,-10,10)/A;
 // Upward buoyancy force and downward point masses have zero net lever.
 near((yb-m.TCG)*Math.cos(t)+(zb-m.newKG)*Math.sin(t),0);
 assert.ok(m.equilibrium<m.maximumAngle);
}
for(const [fn,input] of [
 ['beam',{support:'simple',position:7,length:6,young:210,inertia:800,force:1,distributed:0}],
 ['transient',{circuit:'rc',mode:'rise',resistance:0,storage:100,supply:10,initial:0,timeConstants:5}],
 ['cycle',{cycle:'otto',compression:20,gamma:1.4,cold:300,pressure:1,volume:1,hot:500,cutoff:2}],
 ['pump',{...pump,ratedHead:40}],['refrigeration',{flow:.1,h1:400,h2:400,h3:200}],
 ['heavyLift',{...heavy,loadMode:'onboard',counterMode:'onboard',displacement:100}],
 ]){assert.throws(()=>M[fn](input));checks++;}
console.log(JSON.stringify({status:'PASS',models:6,checks,scope:'Independent curvature/ODE integration, p–V work area, pump intersection and power balance, refrigerant datum invariance, and buoyancy-centroid moment balance; teaching domains only.'}));
