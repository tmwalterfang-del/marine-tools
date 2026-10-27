// DOM logic checks. These do not replace browser layout, accessibility or offline QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../students/'+p,import.meta.url),'utf8');
function load(engine=true){
 const nodes={};
 for(const id of [...read('mollier.html').matchAll(/id="([^"]+)"/g)].map(m=>m[1]))nodes[id]={
  value:'',textContent:'',hidden:false,disabled:false,listeners:{},lastChild:null,
  addEventListener(type,fn){this.listeners[type]=fn},appendChild(){},setAttribute(){},
  getBoundingClientRect(){return {left:0,top:0,width:980,height:580}}
 };
 const ctx={navigator:{},document:{getElementById:id=>{assert.ok(nodes[id],id);return nodes[id]},createElementNS:()=>({setAttribute(){}})}};
 ctx.window=ctx;vm.createContext(ctx);
 if(engine)for(const file of ['vendor/neutrium-if97.min.js','mollier-if97.js'])vm.runInContext(read(file),ctx);
 vm.runInContext(read('mollier.js'),ctx);
 function event(id,type,value){nodes[id].value=String(value);nodes[id].listeners[type]({target:nodes[id]})}
 return {ctx,nodes,event};
}
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
const {ctx,nodes,event}=load();
ok(nodes['model-status'].textContent.includes('IAPWS-IF97'),'IF97 model selected');
event('phase-mode','change','superheated');
ok(nodes['phase-mode'].value==='superheated','superheated mode selected');
event('superheat-temp','change','300');
ok(nodes['h-state'].textContent.includes('3,051.7'),'10 bar 300 C published readout');
const before=nodes['h-state'].textContent;
event('superheat-temp','change','100');
ok(!nodes['input-error'].hidden&&nodes['h-state'].textContent===before,'invalid phase leaves state unchanged');
const wet=ctx.MT_MOLLIER_MODEL.stateAt(1,.5);
nodes['hs-chart'].listeners.click({clientX:86+(980-86-37)*wet.s/12,clientY:28+(580-28-66)*(1-wet.h/4200)});
ok(nodes['phase-mode'].value==='wet'&&!nodes['quality-field'].hidden,'wet dome click switches out of superheated mode');
ok(nodes['input-error'].hidden,'successful chart selection clears error');
event('pressure-number','change','150');
ok(Number(nodes['pressure-number'].value)===150,'wet pressure 150 bar accepted');
event('phase-mode','change','superheated');
ok(nodes['phase-mode'].value==='superheated'&&Number(nodes['pressure-number'].value)===150,'validated high-pressure phase switch retains 150 bar');
ok(nodes['input-error'].hidden,'150 bar superheated state is in the expanded validated domain');
event('reset','click','');
event('pressure-number','change','200');
ok(!nodes['input-error'].hidden&&Number(nodes['h-state'].textContent.replace(/[^0-9.]/g,''))>2700,'unsupported pressure leaves wet properties unchanged');
event('reset','click','');
event('isentropic','click','');
ok(nodes['active-state'].value==='b'&&nodes['phase-mode'].value==='wet','isentropic reference selects outlet B');
const unavailable=load(false).nodes;
ok(unavailable['model-status'].textContent.includes('unavailable'),'missing solver reported');
ok(['phase-mode','pressure','pressure-number','quality','superheat-temp','save-a','save-b','isentropic','export','reset'].every(id=>unavailable[id].disabled),'no calculations or exports without solver');
console.log(JSON.stringify({status:'PASS',checks,scope:'DOM stub only; not a real browser'}));
