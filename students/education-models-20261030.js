/* Original deterministic teaching models. No vessel tables or refrigerant datasets.
   Internally SI unless a returned column explicitly says otherwise. */
(function(root){
 'use strict';
 const pi=Math.PI,g=9.80665,rad=x=>x*pi/180;
 function number(v,name,min,max){if(!Number.isFinite(v)||v<min||v>max)throw RangeError(name+' must be between '+min+' and '+max+'.');return v;}
 function choice(v,values,name){if(!values.includes(v))throw RangeError('Choose a valid '+name+'.');return v;}
 const samples=(n,f)=>Array.from({length:n},(_,i)=>f(i/(n-1)));
 function beam(c){
  const L=number(c.length,'Span (m)',.5,30),E=number(c.young,'E (GPa)',1,400)*1e9,I=number(c.inertia,'I (cm⁴)',1,1e6)*1e-8;
  const F=number(c.force,'Point force (kN)',0,1000)*1000,q=number(c.distributed,'Uniform load (kN/m)',0,100)*1000,a=number(c.position,'Point-load position (m)',0,L),b=L-a;
  const support=choice(c.support,['simple','cantilever'],'support condition'),fixed=support==='cantilever';
  const left=fixed?F+q*L:F*b/L+q*L/2,right=fixed?0:F*a/L+q*L/2;
  function pointDeflection(x){return fixed?(x<=a?F*x*x*(3*a-x)/(6*E*I):F*a*a*(3*x-a)/(6*E*I)):(x<=a?F*b*x*(L*L-b*b-x*x)/(6*L*E*I):F*a*(L-x)*(L*L-a*a-(L-x)**2)/(6*L*E*I));}
  function deflection(x){return pointDeflection(x)+(fixed?q*x*x*(6*L*L-4*L*x+x*x)/(24*E*I):q*x*(L**3-2*L*x*x+x**3)/(24*E*I));}
  function slope(x){const point=fixed?(x<=a?F*x*(2*a-x)/(2*E*I):F*a*a/(2*E*I)):(x<=a?F*b*(L*L-b*b-3*x*x)/(6*L*E*I):-F*a*(L*L-a*a-3*(L-x)**2)/(6*L*E*I));return point+(fixed?q*x*(3*L*L-3*L*x+x*x)/(6*E*I):q*(L**3-6*L*x*x+4*x**3)/(24*E*I));}
  function moment(x){return fixed?-F*Math.max(a-x,0)-q*(L-x)**2/2:left*x-q*x*x/2-F*Math.max(x-a,0);}
  function shear(x){return fixed?F*(x<a?1:0)+q*(L-x):left-q*x-F*(x>=a?1:0);}
  let maximumX=L;if(!fixed){let lo=0,hi=L;for(let i=0;i<65;i++){const mid=(lo+hi)/2;if(slope(mid)>0)lo=mid;else hi=mid;}maximumX=(lo+hi)/2;}
  if(F===0&&q===0)maximumX=0;
  const momentCandidates=!fixed&&q>0?[left/q,(left-F)/q].filter(x=>x>=0&&x<=L):[];
  const grid=[...new Set([...samples(121,t=>L*t),a,maximumX,...momentCandidates])].sort((x,y)=>x-y),data=grid.map(x=>({x,deflection:deflection(x)*1000,moment:moment(x)/1000,shear:shear(x)/1000}));
  const maxDeflection=deflection(maximumX),maxMoment=Math.max(...data.map(p=>Math.abs(p.moment)));
  return {kind:'beam',data,length:L,position:a,left:left/1000,right:right/1000,rootMoment:fixed?F*a/1000+q*L*L/2000:0,maxDeflection:maxDeflection*1000,maximumX,maxMoment,
   warning:maxDeflection>L/20?'The deflection exceeds L/20: the small-deflection assumption needs review.':null,
   plots:[{id:'deflection',label:'Downward deflection',x:'x',xUnit:'m',yUnit:'mm',series:[['deflection','Deflection']]},{id:'moment',label:'Bending moment',x:'x',xUnit:'m',yUnit:'kN·m',series:[['moment','Moment']]},{id:'shear',label:'Shear force',x:'x',xUnit:'m',yUnit:'kN',series:[['shear','Shear']]}]};
 }
 function transient(c){
  const circuit=choice(c.circuit,['rc','rl'],'circuit'),mode=choice(c.mode,['rise','decay'],'response');
  const R=number(c.resistance,'Resistance (Ω)',.001,1e7),storage=number(c.storage,circuit==='rc'?'Capacitance (µF)':'Inductance (mH)',.001,1e7)*(circuit==='rc'?1e-6:1e-3),supply=number(c.supply,'Supply voltage (V)',0,1000),initial=number(c.initial,'Initial state',-1000,1000),extent=number(c.timeConstants,'Time constants',1,10);
  const tau=circuit==='rc'?R*storage:storage/R,final=mode==='decay'?0:circuit==='rc'?supply:supply/R,source=mode==='decay'?0:supply;
  const data=samples(161,f=>{const t=f*extent*tau,state=final+(initial-final)*Math.exp(-t/tau),current=circuit==='rc'?(source-state)/R:state,voltage=circuit==='rc'?state:source-R*current,energy=.5*storage*state*state;return {t,state,current,voltage,energy};});
  return {kind:'transient',data,tau,final,initial,storedEnergy:data.at(-1).energy,circuit,mode,
   plots:[{id:'state',label:circuit==='rc'?'Capacitor voltage':'Inductor current',x:'t',xUnit:'s',yUnit:circuit==='rc'?'V':'A',series:[['state',circuit==='rc'?'Capacitor voltage':'Inductor current']]},{id:'energy',label:'Stored energy',x:'t',xUnit:'s',yUnit:'J',series:[['energy','Stored energy']]},{id:'current',label:'Circuit current',x:'t',xUnit:'s',yUnit:'A',series:[['current','Current']]}]};
 }
 function cycle(c){
  const cycle=choice(c.cycle,['otto','diesel'],'cycle'),r=number(c.compression,'Compression ratio',2,30),gamma=number(c.gamma,'κ',1.05,1.8),T1=number(c.cold,'Initial temperature (K)',200,500),p1=number(c.pressure,'Initial pressure (bar)',.2,5)*1e5,V1=number(c.volume,'BDC volume (L)',.1,10)*.001,R=287,cv=R/(gamma-1),cp=gamma*cv,mass=p1*V1/(R*T1);
  const V2=V1/r,T2=T1*r**(gamma-1),p2=p1*r**gamma;
  let T3,V3,p3;
  if(cycle==='otto'){T3=number(c.hot,'Peak temperature (K)',500,3500);if(T3<=T2)throw RangeError('Heat addition requires T3 > T2. Increase peak temperature or reduce compression.');V3=V2;p3=p2*T3/T2;}
  else {const cutoff=number(c.cutoff,'Cut-off ratio',1.01,10);if(cutoff>=r)throw RangeError('Diesel cut-off ratio must be below compression ratio.');V3=cutoff*V2;T3=T2*cutoff;p3=p2;}
  const V4=V1,T4=T3*(V3/V4)**(gamma-1),p4=p3*(V3/V4)**gamma,Qin=mass*(cycle==='otto'?cv:cp)*(T3-T2),Qout=mass*cv*(T4-T1),work=Qin-Qout;
  const make=(stage,f)=>samples(81,t=>({stage,...f(t)})),data=[
   ...make('1 → 2 compression',t=>{const V=V1*(V2/V1)**t;return {volume:V*1000,pressure:p1*(V1/V)**gamma/1e5};}),
   ...make('2 → 3 heat addition',t=>({volume:(V2+(V3-V2)*t)*1000,pressure:(p2+(p3-p2)*t)/1e5})),
   ...make('3 → 4 expansion',t=>{const V=V3*(V4/V3)**t;return {volume:V*1000,pressure:p3*(V3/V)**gamma/1e5};}),
   ...make('4 → 1 heat rejection',t=>({volume:V1*1000,pressure:(p4+(p1-p4)*t)/1e5})),
  ];
  return {kind:'cycle',cycle,data,mass,Qin:Qin/1000,Qout:Qout/1000,work:work/1000,efficiency:work/Qin,states:[{state:1,volume:V1*1000,pressure:p1/1e5,temperature:T1},{state:2,volume:V2*1000,pressure:p2/1e5,temperature:T2},{state:3,volume:V3*1000,pressure:p3/1e5,temperature:T3},{state:4,volume:V4*1000,pressure:p4/1e5,temperature:T4}],plots:[{id:'cycle',label:'Ideal p–V cycle',x:'volume',xUnit:'L',yUnit:'bar',series:[['pressure','Cycle pressure']]}]};
 }
 function pump(c){
  const shutoff=number(c.shutoff,'Reference shut-off head (m)',1,200),rated=number(c.ratedHead,'Reference head at Qref (m)',.1,199),Qref=number(c.referenceFlow,'Reference flow (m³/h)',1,1000),speed=number(c.speed,'Speed ratio n/nref',.2,1.6),staticHead=number(c.staticHead,'Static system head (m)',0,200),loss=number(c.loss,'Friction head at Qref (m)',0,200),rho=number(c.density,'Density (kg/m³)',500,2000),eta=number(c.efficiency,'Pump efficiency',.1,1);
  if(rated>=shutoff)throw RangeError('Reference duty head must be below shut-off head.');
  const kp=(shutoff-rated)/(Qref*Qref),ks=loss/(Qref*Qref),available=shutoff*speed*speed-staticHead,flow=available>0?Math.sqrt(available/(kp+ks)):0,head=available>0?staticHead+ks*flow*flow:null,power=available>0?rho*g*(flow/3600)*head/1000:0;
  const surface=number(c.surface??101.325,'Reservoir absolute pressure (kPa)',1,1000),vapour=number(c.vapour??2.34,'Vapour pressure (kPa)',0,999),level=number(c.suctionLevel??1.5,'Reservoir level above pump (m)',-20,30),suctionLoss=number(c.suctionLoss??2,'Suction loss at Qref (m)',0,100),required=number(c.npshRequired??3,'Supplied NPSHr at selected duty (m)',0,100);
  if(surface<=vapour)throw RangeError('Reservoir absolute pressure must exceed vapour pressure for this liquid-head model.');
  const npsh=Q=>(surface-vapour)*1000/(rho*g)+level-suctionLoss*(Q/Qref)**2,npshAvailable=available>0?npsh(flow):null;
  const maxFlow=Math.max(flow*1.2,Math.sqrt(shutoff*speed*speed/kp)*1.05),data=samples(141,t=>{const Q=t*maxFlow;return {flow:Q,pump:Math.max(0,shutoff*speed*speed-kp*Q*Q),system:staticHead+ks*Q*Q,npsh:npsh(Q)};});
  return {kind:'pump',data,flow,head,shutoffHead:shutoff*speed*speed,hydraulicPower:power,shaftPower:available>0?power/eta:null,operating:available>0,npshAvailable,npshRequired:required,npshMargin:available>0?npshAvailable-required:null,warning:available<=0?'The model pump cannot overcome the static head at this speed; no forward operating point.':npshAvailable<required?'Available NPSH is below the supplied duty requirement. The selected liquid-flow state needs review.':null,
   markers:available>0?[{plot:'head',x:flow,y:head,label:'Operating point'},{plot:'npsh',x:flow,y:required,label:'Supplied NPSHr at duty'}]:[],
   plots:[{id:'head',label:'Pump and system head',x:'flow',xUnit:'m³/h',yUnit:'m',series:[['pump','Pump curve'],['system','System curve']]},{id:'npsh',label:'Available suction head',x:'flow',xUnit:'m³/h',yUnit:'m',series:[['npsh','Available NPSH']]}]};
 }
 function refrigeration(c){
  const flow=number(c.flow,'Refrigerant flow (kg/s)',.001,10),h1=number(c.h1,'h1 (kJ/kg)',-2000,5000),h2=number(c.h2,'h2 (kJ/kg)',-2000,5000),h3=number(c.h3,'h3 (kJ/kg)',-2000,5000);
  if(!(h2>h1&&h1>h3))throw RangeError('This cycle requires h2 > h1 > h3; ideal throttling gives h4 = h3.');
  const cooling=flow*(h1-h3),work=flow*(h2-h1),rejected=flow*(h2-h3),cop=cooling/work;
  return {kind:'refrigeration',flow,h1,h2,h3,h4:h3,cooling,work,rejected,cop,heatingCop:rejected/work,data:[{stage:1,h:h1},{stage:2,h:h2},{stage:3,h:h3},{stage:4,h:h3}],energy:[{name:'Heat absorbed',value:cooling},{name:'Compressor input',value:work},{name:'Heat rejected',value:rejected}],plots:[{id:'energy',type:'flow',label:'Steady-cycle energy flow',yUnit:'kW',series:[]},{id:'enthalpy',label:'Supplied state enthalpies',x:'stage',xUnit:'state',yUnit:'kJ/kg',series:[['h','Supplied state enthalpy']]}]};
 }
 function heavyLift(c){
  const initial=number(c.displacement,'Initial displacement (t)',100,100000),KG=number(c.kg,'Initial KG (m)',0,30),length=number(c.length,'Box length (m)',20,300),breadth=number(c.breadth,'Box breadth (m)',5,40),depth=number(c.depth,'Box depth (m)',3,25),density=number(c.density,'Water density (t/m³)',.9,1.1);
  const w=number(c.weight,'Suspended mass (t)',0,initial),oldZ=number(c.oldHeight,'Original onboard load height (m)',0,30),hookZ=number(c.hookHeight,'Hook height (m)',0,60),arm=number(c.arm,'Hook transverse coordinate (m)',-30,30),counter=number(c.counter,'Counterweight (t)',0,initial),counterZ=number(c.counterHeight,'Counterweight height (m)',0,30),counterArm=number(c.counterArm,'Counterweight transverse coordinate (m)',-30,30);
  const loadMode=choice(c.loadMode,['onboard','added'],'load origin'),counterMode=choice(c.counterMode,['onboard','added'],'counterweight origin');
  if((loadMode==='onboard'?w:0)+(counterMode==='onboard'?counter:0)>=initial)throw RangeError('Existing moved masses must leave a positive original hull/remainder mass.');
  if(initial*KG-(loadMode==='onboard'?w*oldZ:0)-(counterMode==='onboard'?counter*counterZ:0)<0)throw RangeError('Existing moved masses are inconsistent with the supplied initial KG above the keel.');
  const mass=initial+(loadMode==='added'?w:0)+(counterMode==='added'?counter:0),vertical=initial*KG+w*(loadMode==='onboard'?hookZ-oldZ:hookZ)+(counterMode==='added'?counter*counterZ:0),transverse=w*arm+counter*counterArm,newKG=vertical/mass,TCG=transverse/mass,T=mass/(density*length*breadth),oldT=initial/(density*length*breadth);
  if(T<=0||T>=depth||oldT>=depth||newKG<0)throw RangeError('The supplied mass/CG does not fit this floating rectangular-box teaching model.');
  const maximumAngle=Math.min(rad(25),.95*Math.atan(2*Math.min(T,depth-T,oldT,depth-oldT)/breadth));
  function KN(theta,draft){return (draft/2+breadth*breadth/(12*draft)*(1+.5*Math.tan(theta)**2))*Math.sin(theta);}
  const GM=T/2+breadth*breadth/(12*T)-newKG,net=theta=>KN(theta,T)-newKG*Math.sin(theta)-TCG*Math.cos(theta),baseline=theta=>KN(theta,oldT)-KG*Math.sin(theta);
  const data=samples(161,t=>{const theta=(2*t-1)*maximumAngle;return {heel:theta*180/pi,baseline:baseline(theta),net:net(theta),massMoment:mass*net(theta)};});
  let equilibrium=null;
  if(GM>0){for(let i=1;i<data.length;i++)if(data[i-1].net<=0&&data[i].net>=0){let lo=rad(data[i-1].heel),hi=rad(data[i].heel);for(let k=0;k<60;k++){const mid=(lo+hi)/2;if(net(mid)<0)lo=mid;else hi=mid;}equilibrium=(lo+hi)*90/pi;break;}}
  return {kind:'heavy',data,mass,newKG,TCG,GM,draft:T,equilibrium,maximumAngle:maximumAngle*180/pi,warning:GM<=0?'Nonpositive initial GM in the resulting condition; no stable small-heel equilibrium is reported.':equilibrium===null?'No restoring equilibrium was found before this box model reaches its geometric limit.':null,
   plots:[{id:'lever',label:'Net transverse lever',x:'heel',xUnit:'°',yUnit:'m',series:[['baseline','Initial upright-CG condition'],['net','After lift and counterweight']]},{id:'moment',label:'Net righting mass moment',x:'heel',xUnit:'°',yUnit:'t·m',series:[['massMoment','Net mass moment']]}]};
 }
 root.MT_EDUCATION_MODELS={beam,transient,cycle,pump,refrigeration,heavyLift};
})(typeof window==='undefined'?globalThis:window);
