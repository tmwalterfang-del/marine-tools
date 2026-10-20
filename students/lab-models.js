/* Original deterministic teaching models; SI internally except documented t, bar and MJ/kg. */
(function(root){
'use strict';
const rad=d=>d*Math.PI/180;
function number(v,name,min,max){if(!Number.isFinite(v)||v<min||v>max)throw RangeError(`${name} must be between ${min} and ${max}.`);return v}
// Original synthetic fixed-displacement KN curve, not hydrostatics for a real hull.
function kn(deg){const s=Math.sin(rad(number(deg,'Heel angle',0,90)));return (8.5+2*s*s-7.5*s**4)*s}
function stability({displacement,kg,weight,lift,length,breadth,density,divisions}){
 number(displacement,'Displacement (t)',100,100000);number(kg,'KG (m)',0,12);
 number(weight,'Relocated weight (t)',0,displacement);number(lift,'Vertical movement (m)',-10,10);
 number(length,'Tank length (m)',0,40);number(breadth,'Total tank breadth (m)',0,30);number(density,'Liquid density (t/m³)',0,2);
 number(divisions,'Isolated equal compartments',1,8);if(!Number.isInteger(divisions))throw RangeError('Compartments must be an integer.');
 const movedKG=kg+weight*lift/displacement;if(movedKG<0)throw RangeError('The relocated KG must remain above the keel.');
 const inertia=length*breadth**3/(12*divisions**2),fsm=density*inertia,fsc=fsm/displacement,effectiveKG=movedKG+fsc;
 const gz=angle=>kn(angle)-effectiveKG*Math.sin(rad(angle));
 const curve=Array.from({length:181},(_,i)=>({angle:i*.5,baseline:kn(i*.5)-kg*Math.sin(rad(i*.5)),gz:gz(i*.5)}));
 // Signed area, with heel expressed in radians; trapezoidal integration at 0.5 degree.
 const area=limit=>curve.slice(0,limit*2+1).slice(1).reduce((sum,p,i)=>sum+(curve[i].gz+p.gz)/2*rad(.5),0);
 const maximum=curve.reduce((a,b)=>b.gz>a.gz?b:a);
 let zero=null;
 if(8.5-effectiveKG>0)for(let i=1;i<curve.length;i++)if(curve[i].gz<=0){const a=curve[i-1],b=curve[i];zero=a.angle+(b.angle-a.angle)*a.gz/(a.gz-b.gz);break}
 return {movedKG,inertia,fsm,fsc,effectiveKG,gm:8.5-effectiveKG,curve,maximum,zero,area30:area(30),area40:area(40),gz};
}
function scale(value,lrv,urv,inverse=false){
 number(lrv,'Lower range',-1e6,1e6);number(urv,'Upper range',-1e6,1e6);if(urv<=lrv)throw RangeError('Upper range must exceed lower range.');
 number(value,inverse?'Current (mA)':'Process value',inverse?4:lrv,inverse?20:urv);
 return inverse?lrv+(value-4)/16*(urv-lrv):4+16*(value-lrv)/(urv-lrv);
}
function pid({kp,ti,td,tau,setpoint,direction,antiWindup}){
 number(kp,'Kp',0,10);number(ti,'Ti (s); zero disables integral',0,200);number(td,'Td (s)',0,20);number(tau,'Time constant (s)',2,100);number(setpoint,'Setpoint (%)',20,95);
 if(!['reverse','direct'].includes(direction))throw RangeError('Select a controller action.');
 const sign=direction==='reverse'?1:-1,dt=.1,rows=[];let y=20,prevY=y,integral=0,filteredDerivative=0;
 for(let i=0;i<=1800;i++){
  const t=i*dt,sp=t<10?20:setpoint,e=sp-y;
  const rawDerivative=(y-prevY)/dt,filterTime=Math.max(td/10,dt);
  filteredDerivative+=dt/(filterTime+dt)*(rawDerivative-filteredDerivative);
  const p=sign*kp*e,d=-sign*kp*td*filteredDerivative,increment=ti>0?sign*kp/ti*e*dt:0;
  const candidate=integral+increment,raw=p+candidate+d;
  if(!antiWindup||!((raw>100&&increment>0)||(raw<0&&increment<0)))integral=candidate;
  const u=Math.max(0,Math.min(100,p+integral+d));
  rows.push({t,sp,pv:y,u});prevY=y;
  // Exact zero-order-hold step of dy/dt = (20 + u - y)/tau.
  y=(20+u)+(y-20-u)*Math.exp(-dt/tau);
 }
 return rows;
}
function engine({bore,stroke,cylinders,rpm,cycles,mep,basis,mechanicalEfficiency,brakeEfficiency,lhv}){
 number(bore,'Bore (m)',.05,2);number(stroke,'Stroke (m)',.05,4);number(cylinders,'Cylinders',1,20);if(!Number.isInteger(cylinders))throw RangeError('Cylinders must be an integer.');
 number(rpm,'Speed (rpm)',1,6000);number(mep,'Mean effective pressure (bar)',.1,40);if(![1,2].includes(cycles))throw RangeError('Cycles must be 1 (two-stroke) or 2 (four-stroke).');
 if(!['brake','indicated'].includes(basis))throw RangeError('Choose brake or indicated pressure.');
 number(mechanicalEfficiency,'Mechanical efficiency',.1,1);number(brakeEfficiency,'Brake thermal efficiency',.05,.65);number(lhv,'Fuel LHV (MJ/kg)',5,150);
 if(brakeEfficiency>mechanicalEfficiency)throw RangeError('Brake thermal efficiency cannot exceed mechanical efficiency: the implied indicated thermal efficiency would exceed 100%.');
 const volume=Math.PI*bore*bore/4*stroke*cylinders,power=mep*100000*volume*rpm/(60*cycles)/1000;
 const brake=basis==='brake'?power:power*mechanicalEfficiency,indicated=basis==='indicated'?power:power/mechanicalEfficiency;
 const thermal=brake/brakeEfficiency,fuel=thermal*3.6/lhv,sfoc=fuel*1000/brake;
 return {volume,brake,indicated,thermal,fuel,sfoc,pistonSpeed:2*stroke*rpm/60,mechanicalLoss:indicated-brake};
}
root.MT_LABS={kn,stability,scale,pid,engine};
})(typeof window==='undefined'?globalThis:window);
