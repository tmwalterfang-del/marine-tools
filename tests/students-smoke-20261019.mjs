// For Students smoke test: node tests/students-smoke-20261019.mjs
// Synthetic, independent formula references. Does not assert a complete copy of any textbook.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const html=read('students/index.html');
const css=read('students/styles.css');
const srcFormulas=read('students/formulas.js');
const srcCalculators=read('students/calculators.js');
const srcApp=read('students/app.js');
const sw=read('sw.js');
const main=read('index.html');
const education=read('education/index.html');
const sandbox={};
new Function('window',srcFormulas)(sandbox);
new Function('window',srcCalculators)(sandbox);
new Function(srcApp);
const formulas=sandbox.MT_FORMULAS,calculators=sandbox.MT_CALCULATORS,exercises=sandbox.MT_PRACTICE;
let passed=0;
function ok(condition,label){assert.ok(condition,label);passed++;console.log('PASS '+label)}
function near(value,expected,label){ok(Math.abs(value-expected)<1e-6,label)}
ok(formulas.length>=180,'formula library has at least 180 entries');
ok(new Set(formulas.map(f=>f.id)).size===formulas.length,'formula IDs unique');
ok(new Set(formulas.map(f=>f.category)).size===10,'all ten subject areas present');
ok(formulas.every(f=>f.name&&f.formula&&f.note&&f.category&&f.tags),'each formula has name, expression, context and tags');
ok(formulas.some(f=>f.formula.includes('TPC')),'waterplane TPC included');
ok(formulas.some(f=>f.name.includes('Simpson')),'Simpson integration included');
ok(formulas.some(f=>f.name.includes('three-phase')||f.name.includes('Three-phase')),'three-phase electrical included');
ok(formulas.some(f=>f.name.includes('longitudinal')||f.name.includes('Trim')),'trim included');
ok(calculators.length>=24,'at least 24 educational calculators');
ok(exercises.length>=20,'at least 20 original exercises');
ok(new Set(calculators.map(c=>c.id)).size===calculators.length,'calculator IDs unique');
ok(new Set(exercises.map(e=>e.id)).size===exercises.length,'exercise IDs unique');
for(const calc of calculators){
 const values=Object.fromEntries(calc.fields.map(f=>[f.key,f.initial]));
 const r=calc.compute(values);
 ok(Number.isFinite(r.value)&&!r.invalid&&typeof r.unit==='string'&&Array.isArray(r.steps)&&r.steps.length>0,'calculator default: '+calc.id);
}
const byId=id=>calculators.find(c=>c.id===id);
near(byId('displacement').compute({volume:12000,density:1.025}).value,12300,'displacement known example');
near(byId('add-kg').compute({dis:10000,kg:6,load:500,loadkg:12}).value,(60000+6000)/10500,'KG loading arithmetic');
near(byId('corrected-gm').compute({km:9.1,kg:7.5,fsc:0.3}).value,1.3,'GM correction arithmetic');
near(byId('tpc').compute({aw:2000,rho:1.025}).value,20.5,'TPC example');
near(byId('trim-change').compute({weight:100,distance:30,mct:250}).value,12,'trim example');
near(byId('three-phase').compute({u:440,i:120,pf:0.85}).value,Math.sqrt(3)*440*120*0.85/1000,'three-phase power example');
near(byId('voyage-fuel').compute({dist:1200,speed:12,daily:24}).value,100,'voyage fuel known example');
near(byId('battery-runtime').compute({cap:800,dod:.8,eta:.9,load:96}).value,6,'battery autonomy example');
near(byId('parallel-resistance').compute({r1:100,r2:100}).value,50,'parallel resistor example');
ok(byId('discharge-kg').compute({dis:100,kg:5,removed:100,remkg:4}).invalid!==null,'invalid mass removal rejected');
for(const e of exercises)ok(Number.isFinite(e.expected)&&e.unit&&e.steps.length>0,'exercise integrity: '+e.id);
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
ok(new Set(ids).size===ids.length,'HTML IDs unique');
const appIds=[...srcApp.matchAll(/el\("([^"]+)"\)/g)].map(m=>m[1]);
ok(appIds.every(id=>ids.includes(id)),'all application DOM IDs exist');
ok(html.includes('formulas.js')&&html.includes('calculators.js')&&html.includes('app.js')&&html.includes('styles.css'),'all student assets loaded');
ok(html.includes('noindex,nofollow'),'development student page not indexable yet');
ok(!srcApp.includes('fetch(')&&!srcApp.includes('sendBeacon'),'learning workspace makes no API or analytics calls');
ok(css.includes('@media(max-width:680px)')&&css.includes('@media print'),'responsive and printable styles exist');
ok(css.includes('[data-theme="bridge"]'),'Bridge Dark theme exists');
ok(main.includes('href="/students/"')&&education.includes('href="../students/"'),'student entrypoints linked in main/education');
ok(sw.includes("'./students/'")&&sw.includes("'./students/app.js'"),'student assets precached for PWA offline');
ok(html.includes('www.nb.no/items/7dd9087d6a49416798fe7b2f6fdd86c2'),'Gyldendal/NB title linked as original source');
ok(html.includes('Educational')||html.includes('EDUCATIONAL'),'educational-use limitation visible');
console.log(JSON.stringify({result:'PASS',checks:passed,formulas:formulas.length,calculators:calculators.length,exercises:exercises.length,
 note:'Isolated source smoke only; browser reflow, installed PWA and full editorial accuracy are still pending.'}));
