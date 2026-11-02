const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const w={};w.globalThis=w;for(const p of ['students/vendor/neutrium-if97.min.js','students/mollier-if97.js','students/systems-schemas-20261102.js','students/systems-models-20261102.js'])vm.runInNewContext(fs.readFileSync(p,'utf8'),w);const defaults=id=>Object.fromEntries(w.MT_EDUCATION_MODEL_SCHEMAS[id].fields.map(f=>[f.key,f.value])),model=(id,extra={})=>w.MT_EDUCATION_MODELS[id]({...defaults(id),...extra}),metric=(z,key)=>z.metrics.find(r=>r[0]===key)?.[1];let checks=0;function close(a,b,tol=1e-9){checks++;assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' ≠ '+b);}
// Linear droop reference: Woodward manual 26012, equal no-load frequency references.
// https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26012_A.pdf
let z=model('generator-sharing',{rating1:1000,rating2:500,droop1:5,droop2:5,load:900,slip:-.25});close(metric(z,'Generator 1 active power'),600);close(metric(z,'Generator 2 active power'),300);close(metric(z,'Steady droop frequency'),48.5);close(z.data.at(-1).phase,20-900);close(metric(z,'Generator 1 reactive power')+metric(z,'Generator 2 reactive power'),400);
// Exact integral of first-order output deficit after a loss, no shedding.
z=model('blackout',{capacity:1000,essential:500,optional:300,lost:300,shed:0,delay:0,tau:2,inertia:5});close(metric(z,'Initial frequency slope'),-1.5);close(z.data.at(-1).f,50-3*(1-Math.exp(-15/2)),1e-10);assert.throws(()=>model('blackout',{shed:1000}));
// Independent vector cross products, x forward/y port/CCW yaw.
// https://www.fossen.biz/publications/1996%20Sorensen%20et%20al%20CEP.pdf
for(let i=0;i<40;i++){const surge=-150+i*7,sway=-50+i*2,yaw=-300+i*15,beam=16,bow=25;z=model('thruster-allocation',{surge,sway,yaw,limit:1000});const [p,s,b]=z.diagram.forces;close(p+s,surge);close(b,sway);close(-beam/2*p+beam/2*s+bow*b,yaw);}
z=model('thruster-allocation',{failure:'bow'});close(metric(z,'Unbalanced sway'),80);assert.ok(z.warning);
// EA = tension/strain: https://www.orcina.com/webhelp/OrcaFlex/Content/html/Linetypes,Structuredata.htm
z=model('mooring-forces',{displacement:0});close(metric(z,'Maximum line tension'),50);close(metric(z,'Transverse restoring force'),0);const left=model('mooring-forces',{displacement:-1}),right=model('mooring-forces',{displacement:1});close(metric(left,'Transverse restoring force'),-metric(right,'Transverse restoring force'));assert.ok(right.diagram.lines.every(r=>r.tension>=0));assert.throws(()=>model('mooring-forces',{displacement:20,reach:10}));
// Orifice relation: USBR Water Measurement Manual, chapter 9. Independently solved
// one-compartment h(t)=H−[sqrt(H)−Cd A sqrt(2g)t/(2 Aeffective)]² before equilibrium.
// https://www.usbr.gov/tsc/techreferences/mands/wmm/WMM_3rd_2001.pdf
z=model('flooding',{connection:0,pump:0,duration:1});const expected=3-(Math.sqrt(3)-.62*.02*Math.sqrt(2*9.80665)*60/(2*27))**2;close(metric(z,'Compartment 1 level'),expected,2e-5);close(metric(z,'Compartment 2 level'),0);close(metric(z,'Water balance residual'),0,1e-10);
for(let i=0;i<12;i++){z=model('flooding',{initial1:i%4,initial2:(i%3)/2,breach:i%2?.02:0,connection:i%3?.02:0,pump:i*10,duration:.2+i/10});for(const r of z.data){assert.ok(r.h1>=0&&r.h2>=0);close(r.balance,0,1e-9);}}
z=model('flooding',{breach:0,connection:0,pump:500});close(metric(z,'Pumped volume'),0);close(metric(z,'Final flooded volume'),0);
// Centrifugal Stokes drift, Alfa Laval technical paper; independently precomputed
// k=0.0006579736267392907 s−1 for the default 2 µm particle.
// https://www.alfalaval.fi/globalassets/documents/products/separation/centrifugal-separators/disc-stack-separators/bilge-technical-emd00201en.pdf
z=model('separator');close(metric(z,'Ideal migration time'),1053.457391590243,1e-12);const fast=model('separator',{rpm:12000});close(metric(fast,'Ideal migration time'),metric(z,'Ideal migration time')/4);assert.throws(()=>model('separator',{particleDensity:800}));
// Independent IAPWS published saturation point ~45.80755 °C at 0.1 bar(a).
// https://www.iapws.org/relguide/IF97-Rev.html
z=model('freshwater');close(metric(z,'Saturation temperature'),45.80755,1e-6);close(metric(z,'Distillate production')+metric(z,'Brine flow'),1000);close(metric(z,'Brine salt mass fraction')/100*metric(z,'Brine flow'),35);close(metric(z,'Feed preheating duty')+metric(z,'Evaporation and condenser duty')+metric(z,'Unused heater duty'),150);close(metric(model('freshwater',{heat:0}),'Distillate production'),0);close(metric(model('freshwater',{condenser:0}),'Distillate production'),0);assert.throws(()=>model('freshwater',{feedTemperature:80}));
// Ideal gas pV=mRT, pressure always absolute. FAD at explicit reference conditions.
// https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/equation-of-state/
z=model('starting-air',{initial:10,on:20,off:40,fad:1,leak:0,draw:0,temperature:20,reference:20});close(metric(z,'Final gauge pressure'),15.06625,1e-9);close(metric(z,'Pressure balance residual'),0,1e-9);
z=model('starting-air',{initial:10,on:20,off:30,fad:10,leak:0,draw:0});close(metric(z,'Final gauge pressure'),30,1e-10);z=model('starting-air',{initial:1,draw:100,event:0,fad:0,leak:0});close(metric(z,'Minimum gauge pressure'),0);assert.ok(metric(z,'Unmet draw')>0);assert.throws(()=>model('starting-air',{on:30,off:20}));
// All eight states, every plot, progressive task and invalid boundary.
for(const id of Object.keys(w.MT_EDUCATION_MODEL_SCHEMAS)){for(const level of ['1','2','3']){z=model(id,{level});assert.ok(Number.isFinite(z.exercise.expected));assert.ok(z.exercise.steps.length>=2);for(const plot of z.plots)for(const r of plot.data||z.data)for(const[k]of plot.series){assert.ok(Number.isFinite(r[k]),id+' '+k);checks++;}}const x=defaults(id),field=w.MT_EDUCATION_MODEL_SCHEMAS[id].fields.find(f=>!f.options);x[field.key]=NaN;assert.throws(()=>w.MT_EDUCATION_MODELS[id](x));}
console.log(JSON.stringify({status:'PASS',checks,modules:8,progressiveQuestions:24,scope:'Independent droop, swing integral, force/moment, elastic line, analytic orifice, Stokes, water/energy/salt and ideal-gas benchmarks; conservation, failures and bounds.'}));
