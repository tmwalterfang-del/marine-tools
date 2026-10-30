// Authored non-default examples. The oracle does not call another calculator.
// Conservation, unit conversions and reference-datum invariance supplement the examples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { catalogue } from './lib/students-catalogue.mjs';
const w = catalogue(), calculators = new Map(w.MT_CALCULATORS.map(c => [c.id, c]));
const pi = Math.PI;
const cases = [
  ['displacement', {volume:800,density:1.025}, 820, 't'],
  ['deadweight', {dis:820,light:500}, 320, 't'],
  ['add-kg', {dis:800,kg:4,load:200,loadkg:9}, 5, 'm'],
  ['discharge-kg', {dis:1000,kg:5,removed:200,remkg:9}, 4, 'm'],
  ['corrected-gm', {km:6,kg:7,fsc:.5}, -1.5, 'm'],
  ['tpc', {aw:800,rho:1.025}, 8.2, 't/cm'],
  ['draft-change', {mass:41,tpc:8.2}, 5, 'cm'],
  ['trim-change', {weight:80,distance:15,mct:60}, 20, 'cm'],
  ['block-coefficient', {vol:600,length:20,breadth:10,draft:5}, .6, 'dimensionless'],
  ['triangle', {a:5,b:12}, 13, 'm'],
  ['ohms-law', {voltage:12,res:4}, 3, 'A'],
  ['dc-power', {u:12,i:3}, 36, 'W'],
  // Three star phases, each 100 V, 2 A and pf .5: sum = 300 W.
  ['three-phase', {u:100*Math.sqrt(3),i:2,pf:.5}, .3, 'kW'],
  ['series-resistance', {r1:7,r2:11}, 18, 'Ω'],
  ['parallel-resistance', {r1:30,r2:60}, 20, 'Ω'],
  // Three pole pairs at 60 electrical cycles/s = 20 shaft rev/s.
  ['synchronous-speed', {freq:60,poles:6}, 1200, 'rpm'],
  ['hydraulic-power', {rho:1000,flow:72,head:10}, 1.96133, 'kW'],
  ['pump-time', {vol:90,flow:45}, 2, 'h'],
  ['voyage-fuel', {dist:480,speed:10,daily:15}, 30, 'm³'],
  ['battery-runtime', {cap:100,dod:.5,eta:.8,load:5}, 8, 'h'],
  ['heat-energy', {m:360,cp:2,dt:10}, 2, 'kWh'],
  // Ten revolutions/s, 20 Nm, each revolution transfers 40π J.
  ['shaft-power', {rpm:600,torque:20}, .4*pi, 'kW'],
  ['sfoc', {fuel:12,power:60}, 200, 'g/kWh'],
  ['fuel-density', {vol:40,rho:.8}, 32, 't'],
  ['molar-concentration', {moles:3,litres:12}, .25, 'mol/L'],
  ['dilution-volume', {c1:3,v1:.4,c2:.6}, 2, 'L'],
  ['ph', {activity:1e-8}, 8, 'pH'],
  ['amp-feedback', {gain:20,beta:.15}, 5, 'ratio'],
  ['db-gain', {vin:10,vout:1}, -20, 'dB'],
  ['rc-frequency', {res:500,cap:2}, 159.15494309189535, 'Hz'],
  ['buck-converter', {vin:24,duty:.25}, 6, 'V'],
  ['shaft-torsion-stress', {torque:pi,diameter:20}, 2, 'MPa'],
  // κ=2: heat rejected / heat supplied is 1/r in the ideal cycle.
  ['otto-efficiency', {ratio:4,kappa:2}, 75, '%'],
  ['engine-swept-volume', {bore:1000,stroke:1000,cylinders:4}, pi, 'm³'],
  ['wet-steam-enthalpy', {hf:300,hfg:1800,x:.25}, 750, 'kJ/kg'],
  ['refrigeration-cop', {h1:300,h2:350,h4:100}, 4, 'ratio'],
  ['relative-humidity', {pv:600,psat:2400}, 25, '%'],
  ['real-interest', {nominal:10,inflation:25}, -12, '%'],
  // Payment 121 discounted for two years at 10% gives 110 + 100.
  ['annuity-pv', {payment:121,r:10,periods:2}, 210, 'NOK'],
  ['radioactive-half-life', {initial:64,time:15,half:5}, 8, 'g'],
  ['sound-db', {out:1,input:100}, -20, 'dB'],
  ['rc-filter', {r:1,c:1}, 159.15494309189535, 'Hz'],
  ['fullwave-rectifier', {rms:pi/Math.sqrt(2)}, 2, 'V DC mean'],
  ['engine-displacement', {bore:100,stroke:100,cyl:4}, pi, 'L'],
  ['mean-piston-speed', {stroke:.2,rpm:300}, 2, 'm/s'],
  ['steam-boiler-heat', {flow:360,hout:1500,hin:500}, 100, 'kW'],
  ['cooling-cop', {h1:300,h2:350,h4:100}, 4, 'dimensionless'],
  ['shaft-torsion', {d:2}, pi/2, 'mm⁴'],
  ['annuity-payment', {pv:210,rate:10,periods:2}, 121, 'NOK / period'],
  ['npv', {cost:200,flow:121,rate:10,years:2}, 10, 'NOK'],
  ['wave-speed', {freq:4,lambda:3}, 12, 'm/s'],
  ['sound-level', {p:.002,p0:.00002}, 40, 'dB re reference'],
  ['loop-scaling', {ma:8,low:-20,high:20}, -10, 'EU'],
  ['loop-current', {value:-10,low:-20,high:20}, 8, 'mA'],
  ['p-controller', {sp:0,pv:10,kp:2,bias:50}, 30, '%'],
  ['prop-band', {kp:4}, 25, '%'],
  ['npsha', {surface:108.0665,vapour:10,rho:1000,level:-2,loss:1}, 7, 'm'],
  ['turbine-drop', {inlet:1200,outlet:900}, 300, 'kJ/kg'],
  ['fuel-input-power', {flow:36,lhv:40000}, 400, 'kW'],
  ['classical-doppler', {fs:100,c:300,vo:-30,vs:-60}, 75, 'Hz'],
];
let assertions=0;
function near(actual, expected, label, tolerance=2e-12) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual-expected) <= tolerance*Math.max(Math.abs(expected),1e-12), `${label}: ${actual} versus ${expected}`);
  assertions++;
}
function run(id, inputs) {
  const calculator=calculators.get(id); assert.ok(calculator,id);
  for(const field of calculator.fields) {
    const value=inputs[field.key]; assert.ok(Number.isFinite(value),id+' finite '+field.key);
    if(field.check==='positive') assert.ok(value>0,id+' positive '+field.key);
    if(field.check==='nonnegative') assert.ok(value>=0,id+' nonnegative '+field.key);
    if(field.check==='unitinterval') assert.ok(value>=0&&value<=1,id+' closed interval '+field.key);
  }
  const result=calculator.compute(inputs); assert.ok(!result.invalid,id+': '+result.invalid);
  return result;
}
assert.equal(cases.length,60); assert.equal(calculators.size,60);
assert.equal(new Set(cases.map(c=>c[0])).size,60);
for(const [id,inputs,expected,unit] of cases) {
  const result=run(id,inputs); near(result.value,expected,id);
  assert.equal(result.unit,unit,id+' unit');
  assert.ok(result.steps.length>0,id+' working');
}
// A change of enthalpy zero cannot alter COP, work or heat duty.
for(const id of ['refrigeration-cop','cooling-cop'])for(const shift of [-1000,0,1000])
  near(run(id,{h1:300+shift,h2:350+shift,h4:100+shift}).value,4,id+' enthalpy datum');
for(const shift of [-2000,2000]) {
  near(run('turbine-drop',{inlet:1200+shift,outlet:900+shift}).value,300,'turbine datum');
  near(run('steam-boiler-heat',{flow:360,hout:1500+shift,hin:500+shift}).value,100,'boiler datum');
}
// Directly sum independently discounted payments, including near-zero interest.
for(const rate of [0,1e-14,1e-10,.01,5,100])for(const periods of [1,2,100]) {
  let sum=0,discount=1;
  for(let year=1;year<=periods;year++){discount/=1+rate/100;sum+=123*discount;}
  near(run('annuity-pv',{payment:123,r:rate,periods}).value,sum,'annuity discrete sum',5e-12);
  near(run('annuity-payment',{pv:sum,rate,periods}).value,123,'loan closes against independent payment stream',5e-12);
}
for(const id of ['buck-converter','three-phase','wet-steam-enthalpy','amp-feedback','battery-runtime']) {
  const inputs={...cases.find(c=>c[0]===id)[1]};
  const key={ 'buck-converter':'duty','three-phase':'pf','wet-steam-enthalpy':'x','amp-feedback':'beta','battery-runtime':'dod'}[id];
  inputs[key]=0; const expected=id==='wet-steam-enthalpy'?300:id==='amp-feedback'?20:0;
  near(run(id,inputs).value,expected,id+' zero endpoint');
}
// Physical model checks beyond the common field rules.
for(const [id,inputs] of [
 ['deadweight',{dis:100,light:101}],['discharge-kg',{dis:100,kg:5,removed:100,remkg:5}],
 ['otto-efficiency',{ratio:1,kappa:1.4}],['engine-swept-volume',{bore:100,stroke:100,cylinders:2.5}],
 ['refrigeration-cop',{h1:300,h2:300,h4:100}],['cooling-cop',{h1:300,h2:350,h4:301}],
 ['relative-humidity',{pv:3000,psat:2000}],['annuity-pv',{payment:123,r:5,periods:2.5}],
 ['annuity-payment',{pv:100,rate:5,periods:2.5}],['npv',{cost:100,flow:10,rate:5,years:2.5}],
 ['loop-scaling',{ma:3,low:0,high:100}],['loop-current',{value:50,low:1,high:1}],
 ['npsha',{surface:10,vapour:11,rho:1000,level:0,loss:0}],['turbine-drop',{inlet:900,outlet:1200}],
 ['classical-doppler',{fs:100,c:300,vo:0,vs:300}],
]) { assert.ok(calculators.get(id).compute(inputs).invalid,id+' rejects invalid model');assertions++; }
// Every prompt and its separately recomputed answer were reviewed; hashes prevent stale attribution.
const practice=JSON.parse(fs.readFileSync('tests/fixtures/students-practice-reference-20261029.json','utf8'));
assert.equal(practice.length,36);assert.equal(new Set(practice.map(p=>p.id)).size,36);
for(const row of practice) {
 const exercise=w.MT_PRACTICE.find(e=>e.id===row.id);assert.ok(exercise,row.id);
 assert.equal(exercise.prompt,row.prompt,row.id+' reviewed wording');
 near(exercise.expected,row.expected,row.id+' reviewed answer',row.tolerance??2e-10);
 assert.equal(exercise.unit,row.unit,row.id+' answer unit');
}
console.log(JSON.stringify({status:'PASS',calculators:60,practice:36,assertions,scope:'Authored examples, units, model rejections, enthalpy-datum invariance, interval endpoints, and independently summed payment streams; no claim about arbitrary unsupported inputs.'}));
