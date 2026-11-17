// Run: node tests/voyage-estimate-speed-transfer.mjs
// Uses the real parser and estimator with DOM/storage stubs; no network services.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const voyage=read('voyage-estimate-v861.js');
// Expose private entry points only inside this test's VM.
const instrumented=voyage.replace(/\}\)\(\);\s*$/,
 'window.testVoyage={state,calculate,currentSpeed};})();');
assert.notEqual(instrumented,voyage,'Test entry points injected');

async function estimate(raw){
 const fields=new Map([
  ...['veSpeedKnots','veDraftM','veFromPort','veToPort','veRouteAlert','veCalculateRoute',
   'veDistanceValue','veEtaValue','veEtaSpeed','veFuelValue','veFuelHint',
   'veRouteBasisValue','vePassageValue','veEstimateTitle','veEstimateSubtitle',
   'veEstimateDetails','veResultArea'].map(id=>['#'+id,{value:'',textContent:'',scrollIntoView(){}}])
 ]);
 fields.get('#veSpeedKnots').value=raw;
 fields.get('#veFromPort').value='0,0';
 fields.get('#veToPort').value='0,10';
 const storage=new Map(),calls=[];
 const context={
  structuredClone,
  addEventListener(){},
  document:{readyState:'loading',addEventListener(){},getElementById(){return null},
   querySelector(selector){assert.ok(fields.has(selector),'Known DOM field '+selector);return fields.get(selector)}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}
 };
 context.window=context;
 vm.createContext(context);
 for(const file of ['product-ux-20261031.js','navigation-math.js'])vm.runInContext(read(file),context,{filename:file});
 vm.runInContext(instrumented,context,{filename:'voyage-estimate-v861.js'});
 const {state,calculate,currentSpeed}=context.testVoyage;
 state.ready=true;
 state.engine={seaRoute(from,to,options){
  calls.push(options);
  return {geometry:{type:'LineString',coordinates:[from,to]},properties:{length:600}};
 }};
 await calculate();
 const plan=context.__marineToolsVoyageEstimate.exportRegulatoryRoute();
 return {plan,transferred:JSON.parse(JSON.stringify(plan)),parsed:currentSpeed(),calls,fields};
}

for(const raw of ['8,5','8.5',' 8,5 ']){
 const result=await estimate(raw);
 assert.equal(result.calls.length,1,'Valid speed calculates a route');
 assert.equal(result.calls[0].speedKnots,8.5,'Route engine receives decimal speed');
 assert.equal(result.plan.speed,8.5,'Exported route retains decimal speed');
 assert.equal(result.transferred.speed,8.5,'JSON transfer retains decimal speed');
 console.log('PASS '+JSON.stringify(raw)+' transfers as '+result.transferred.speed);
}
for(const raw of ['','   ','invalid']){
 const result=await estimate(raw);
 assert.ok(Number.isNaN(result.parsed),'Invalid speed stays NaN rather than zero');
 assert.equal(result.calls.length,0,'Invalid speed never calls the route engine');
 assert.equal(result.plan,null,'Invalid speed never creates a transferable route');
 assert.match(result.fields.get('#veRouteAlert').innerHTML,/Check speed/,'Speed validation is shown');
 console.log('PASS '+JSON.stringify(raw)+' stays invalid (NaN; no route transferred)');
}
