import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const name of ['vendor/neutrium-if97.min.js','mollier-if97.js','discovery-core-20261030.js','advanced-core-20261030.js','refrigerant-r134a-20261030.js','advanced-mechanics-20261030.js','advanced-electrical-20261030.js','advanced-fluids-20261030.js','advanced-navigation-20261030.js','advanced-thermo-20261030.js','advanced-schemas-20261030.js'])vm.runInContext(fs.readFileSync(new URL('../students/'+name,import.meta.url),'utf8'),ctx);
const M=ctx.MT_EDUCATION_MODELS,S=ctx.MT_EDUCATION_MODEL_SCHEMAS;let checks=0;
function ok(value,label){assert.ok(value,label);checks++;}
function near(a,b,relative=1e-9,absolute=1e-9){ok(Number.isFinite(a)&&Math.abs(a-b)<=Math.max(absolute,Math.abs(b)*relative),a+' ≠ '+b);}
function defaults(id){return Object.fromEntries(S[id].fields.map(f=>[f.key,f.numeric?Number(f.value):f.value]));}
function run(id,changes={}){return M[S[id].fn]({...defaults(id),...changes});}
function reject(id,changes){assert.throws(()=>run(id,changes));checks++;}
function finite(value,path='result'){if(typeof value==='number')ok(Number.isFinite(value),path+' is finite');else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value))finite(v,path+'.'+k);}
ok(Object.keys(S).length===13,'all thirteen new models have schemas');
for(const id of Object.keys(S)){const model=run(id);ok(model.kind===id,'public model ID '+id);finite(model);ok(model.exercise?.steps.length>0&&Number.isFinite(model.exercise.expected),'applied question '+id);}
for(const scale of [1e-12,1,1e12]){const x=ctx.MT_ADVANCED.solve([[2*scale,scale],[scale,3*scale]],[scale,2*scale]);near(x[0],.2);near(x[1],.6);}
assert.throws(()=>ctx.MT_ADVANCED.solve([[1,1],[2,2]],[1,2]));checks++;
let r=run('force-diagram',{count:2,force1:10,force2:10,angle1:90,angle2:-90,x1:2,x2:0,y1:0,y2:0}).values;near(r.resultant,0);near(r.moment,20);ok(r.angle===null,'no unique zero-resultant angle');
r=run('truss').values;near(r.reactions[0],0);near(r.reactions[1],5000);near(r.reactions[3],5000);near(r.forces[0],10000/3);near(r.forces[1],-10000*Math.sqrt(13)/6);near(r.energy,r.externalWork);near(run('truss',{fy3:-20}).values.energy,4*r.energy);reject('truss',{members:3,nodes:4});reject('truss',{a2:1,b2:2});
r=run('buckling').values;near(r.Pcr,Math.PI**2*200e9*500e-8/25);near(run('buckling',{length:10}).values.Pcr,r.Pcr/4);reject('buckling',{factor:0});
r=run('thermal-expansion').values;near(r.free,.0012);near(r.movement,0);near(r.stress,-120e6);near(r.force,-120000);near(run('thermal-expansion',{restraint:0}).values.stress,0);near(run('thermal-expansion',{delta:-50}).values.force,120000);
r=run('pipe-network').values;near(r.flows[1]+r.flows[2],r.total);near(r.rows[0].loss+r.rows[1].loss,r.head);near(r.rows[1].loss,r.rows[2].loss);near(r.power,1000*9.80665*r.head*r.total);r=run('pipe-network',{mode:'series'}).values;near(r.rows.reduce((s,row)=>s+row.loss,0),r.head);near(r.flows[0],r.flows[2]);reject('pipe-network',{diameter1:0});
r=run('hydraulic-circuit').values;near(r.Q,27/60000);near(r.force,10500);near(r.hydraulicPower,r.loadPower+r.frictionPower+r.reliefPower);ok(r.moving,'cylinder moves');r=run('hydraulic-circuit',{time:600}).values;near(r.position,.5);near(r.speed,0);near(r.hydraulicPower,r.reliefPower);r=run('hydraulic-circuit',{load:1e6}).values;ok(r.stalled,'overload stalls');near(r.position,0);r=run('hydraulic-circuit',{direction:'neutral'}).values;near(r.pressure,0);near(r.speed,0);reject('hydraulic-circuit',{rod:100});
r=run('resistor-network').values;near(r.voltages[2],12);near(r.voltages[3],12);near(r.sourceCurrent,.24);near(r.sourcePower,5.76);near(r.sourcePower,r.loadPower);near(r.currents[4],0);near(run('resistor-network',{supply:48}).values.sourcePower,4*r.sourcePower);reject('resistor-network',{nodes:6,branches:2});
const motor=defaults('induction-motor');for(const slip of [0,.001,.01,.04,.1,.5,1]){r=run('induction-motor',{slip}).values;near(r.power,r.statorLoss+r.rotorLoss+r.mechanical);near(r.torque*2*Math.PI*r.speed/60,r.mechanical);if(slip){const Vp=400/Math.sqrt(3),d=motor.r1**2+(motor.x1+motor.xm)**2,Vth2=Vp*Vp*motor.xm**2/d,Rth=motor.r1*motor.xm**2/d,Xth=motor.xm*(motor.r1**2+motor.x1*(motor.x1+motor.xm))/d,expected=3*Vth2*(motor.r2/slip)/(2*Math.PI*1500/60*((Rth+motor.r2/slip)**2+(Xth+motor.x2)**2));near(r.torque,expected);}else near(r.torque,0);}reject('induction-motor',{poles:3});
for(const neutral of ['ideal','floating','impedance']){r=run('unbalanced-three-phase',{neutral}).values;near(r.sourcePower,r.loadPower+r.neutralPower);near(r.residual,0,1e-8,1e-8);const balanced=run('unbalanced-three-phase',{neutral,r1:10,r2:10,r3:10,x1:7.5,x2:7.5,x3:7.5}).values;near(balanced.neutralVoltage,0);near(balanced.neutralCurrent,0);near(balanced.sourcePower,3*(400/Math.sqrt(3)/12.5)**2*10);}
r=run('relative-motion',{east:0,north:10,ownSpeed:10,ownCourse:0,targetSpeed:10,targetCourse:180}).values;near(r.cpa,0);near(r.tSigned*60,30);r=run('relative-motion',{east:0,north:-10,ownSpeed:10,ownCourse:0,targetSpeed:10,targetCourse:180}).values;near(r.cpa,10);near(r.tFuture,0);r=run('relative-motion',{ownSpeed:10,targetSpeed:10,ownCourse:30,targetCourse:30}).values;ok(r.stationary&&r.tSigned===null,'stationary relative state');
r=run('bearing-fix').values;near(r.east,0,1e-9,1e-8);near(r.north,0,1e-9,1e-8);const bearing=defaults('bearing-fix');for(let i=1;i<=3;i++){bearing['x'+i]+=3;bearing['y'+i]-=2;}let translated=M.bearingFix(bearing).values;near(translated.east,3);near(translated.north,-2);near(run('bearing-fix',{sigma:1}).values.xx,4*r.xx,1e-7);near(run('bearing-fix',{sigma:0}).values.major,0);reject('bearing-fix',{count:2,bearing1:0,bearing2:0});
const rankine=JSON.parse(fs.readFileSync(new URL('fixtures/rankine-cycles-20261030.json',import.meta.url)));for(const test of rankine.cases){r=run('rankine',test.inputs).values;for(const[key,target]of Object.entries(test.expected))near(r[key],target,3e-5,1e-5);near(r.qin-r.qout,r.net);}
const cycles=JSON.parse(fs.readFileSync(new URL('fixtures/refrigerant-cycles-20261030.json',import.meta.url)));let maxCOPRelativeError=0;for(const test of cycles.cases){r=run('refrigeration-ph',test.inputs).values;for(const[key,target]of Object.entries(test.expected))near(r[key],target,key==='COP'?.012:.003,.03);maxCOPRelativeError=Math.max(maxCOPRelativeError,Math.abs(r.COP/test.expected.COP-1));near(r.cooling+r.work,r.rejected);near(r.h4,r.h3);ok(r.x4>=0&&r.x4<=1,'wet valve outlet');}
reject('refrigeration-ph',{evaporating:11});reject('rankine',{boiler:2,condenser:2});
// Round-off regressions use exact conservation/symmetry zeros, not a second
// implementation of the model. Physical scales use the model's displayed units;
// only |r| <= 1e-9 * max(1, |scale|) is eligible for zero normalization.
function exactZero(value,label){assert.strictEqual(value,0,label);checks++;}
function metricValue(model,label){return model.metrics.find(row=>row[0]===label)?.[1];}
function tableValue(model,label){return model.tables.flatMap(view=>view.rows).find(row=>row[0]===label)?.[1];}
let clean=run('bearing-fix',{count:2,bearing1:15,bearing2:105});
// The two bearing-line normals are perpendicular unit vectors, so the normal
// matrix is the identity: both eigenvalues and their ratio are exactly 1.
finite(clean);near(clean.values.condition,1);near(metricValue(clean,'Bearing geometry condition number'),1);
clean=run('bearing-fix');
// Landmarks (5,0), (0,5), (-4,3) and their stated bearings meet at (0,0).
exactZero(clean.values.east,'default bearing fix east');exactZero(clean.values.north,'default bearing fix north');
exactZero(metricValue(clean,'Estimated east coordinate'),'bearing east card');exactZero(metricValue(clean,'Estimated north coordinate'),'bearing north card');
for(const residual of clean.values.residuals)exactZero(residual.residual,'consistent bearing line residual');
for(const row of clean.tables[0].rows.slice(1))exactZero(row[4],'bearing residual table');
const misfit=run('bearing-fix',{bearing3:307.869897645844});
ok(misfit.values.residuals.some(row=>Math.abs(row.residual)>.001),'a genuine inconsistent bearing remains visible');
ok(misfit.tables[0].rows.slice(1).some(row=>Math.abs(row[4])>.001),'genuine bearing misfit remains in table');
clean=run('relative-motion',{east:0,north:10,ownSpeed:10,ownCourse:0,targetSpeed:10,targetCourse:180});
exactZero(metricValue(clean,'Future CPA'),'head-on future CPA card');
exactZero(tableValue(clean,'Future closest east offset'),'head-on closest east table');exactZero(tableValue(clean,'Future closest north offset'),'head-on closest north table');

// Valid schema extremes: common pipe D=5 mm, L=10000 m, f=0.2,
// Kminor=10000; two identical D=2000 mm, L=0, Kminor=1 branches.
// Common K = 410000, diameter ratio = 400, area-squared ratio = 400^4
// = 25600000000. Thus Rcommon/Rbranch = 10496000000000000;
// equal branches have Rparallel=Rbranch/4. At 0.7 m supplied head,
// branch head = 0.7/(1+41984000000000000) = 1.6673018292682926e-17 m.
clean=run('pipe-network',{mode:'parallel',head:.7,length0:10000,diameter0:5,friction0:.2,minor0:10000,length1:0,diameter1:2000,minor1:1,length2:0,diameter2:2000,minor2:1});
finite(clean);near(clean.values.branchHead,1.6673018292682926e-17,1e-9,1e-28);
ok(clean.values.flows.every(value=>value>0),'tiny physical branch flows stay positive');
ok(metricValue(clean,'Branch 1 flow')>0&&metricValue(clean,'Branch 2 flow')>0,'finite positive branch cards');
for(const row of clean.tables[0].rows.slice(1))ok(row.slice(1).every(Number.isFinite),'finite pipe table row');
clean=run('hydraulic-circuit',{load:12345,friction:678});
exactZero(tableValue(clean,'Hydraulic power residual'),'hydraulic power conservation table');
clean=run('resistor-network');
exactZero(clean.values.residual,'resistor internal KCL');exactZero(metricValue(clean,'Internal-node KCL residual'),'KCL card');
// The symmetric bridge has equal midpoint voltages and zero current in R5.
exactZero(clean.values.currents[4],'balanced bridge current');
exactZero(clean.tables[1].rows[5][4],'balanced bridge current table');
clean=run('induction-motor',{slip:0});
exactZero(clean.values.balance,'zero-slip motor power balance');exactZero(tableValue(clean,'Balance residual'),'motor power balance table');
exactZero(metricValue(clean,'Developed mechanical power'),'zero-slip mechanical output card');
// At zero torque and an independently supplied 80 N·m load, deficit is -80.
assert.strictEqual(metricValue(clean,'Torque minus supplied load'),-80);checks++;
clean=run('unbalanced-three-phase',{neutral:'floating'});
exactZero(clean.values.residual,'floating neutral KCL');exactZero(metricValue(clean,'Neutral RMS current'),'floating neutral current card');
exactZero(tableValue(clean,'Neutral KCL residual (A)'),'floating KCL table');exactZero(tableValue(clean,'Active-power residual (W)'),'floating active-power table');
for(const row of clean.data)exactZero(row.neutral,'floating neutral plotted/table current sum');
clean=run('unbalanced-three-phase',{neutral:'floating',r1:10,r2:10,r3:10,x1:0,x2:0,x3:0});
exactZero(clean.values.neutralVoltage,'balanced neutral voltage');exactZero(metricValue(clean,'Neutral displacement RMS voltage'),'balanced neutral voltage card');
exactZero(clean.tables[0].rows[1][2],'balanced phase A load angle table');
exactZero(clean.tables[0].rows[1][4],'balanced resistive phase A current angle table');
exactZero(clean.data[60].i0,'phase A current at its quarter-cycle zero');
exactZero(clean.tables.at(-1).rows[61][1],'quarter-cycle current plotted-data table');
clean=run('force-diagram',{count:2,force1:10,force2:10,angle1:90,angle2:-90,x1:2,x2:0,y1:0,y2:0});
// Opposite 10 kN vertical forces cancel, while the 2 m separation leaves
// a genuine +20 kN·m couple. Each horizontal component is exactly zero.
exactZero(clean.values.fx,'opposite vertical forces resultant x');exactZero(clean.values.fy,'opposite vertical forces resultant y');
exactZero(metricValue(clean,'Resultant magnitude'),'zero force resultant card');
for(const row of clean.tables[0].rows.slice(1))exactZero(row[3],'vertical force horizontal component table');
assert.strictEqual(metricValue(clean,'Moment about selected origin'),20);checks++;
clean=run('force-diagram',{count:1,force1:7,angle1:90,x1:0,y1:0,ox:0,oy:0,couple:0});
exactZero(metricValue(clean,'Moment about selected origin'),'force through origin has zero moment');
exactZero(metricValue(clean,'Balancing couple at origin'),'balancing zero couple has no negative-zero sign');
exactZero(clean.tables[0].rows[1][5],'force through origin zero moment table');
clean=run('truss',{fy3:-12});
// A symmetric 12 kN vertical apex load gives no horizontal reaction and
// two 6 kN vertical reactions; free joints are in exact static equilibrium.
exactZero(clean.values.residual,'truss free-joint residual');exactZero(metricValue(clean,'Free-joint equilibrium residual'),'truss residual card');
exactZero(metricValue(clean,'Pinned horizontal reaction'),'truss horizontal reaction card');near(clean.values.reactions[1],6000);
clean=run('rankine',{flow:2});exactZero(tableValue(clean,'Balance residual'),'Rankine energy balance table');
clean=run('refrigeration-ph',{flow:.2});exactZero(tableValue(clean,'Energy residual'),'refrigeration energy balance table');
console.log(JSON.stringify({status:'PASS',models:Object.keys(S).length,checks,independentRankineCycles:rankine.cases.length,independentRefrigerantCycles:cycles.cases.length,maxCOPRelativeError}));
