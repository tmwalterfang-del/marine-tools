// Browser-logic smoke using an intentionally minimal DOM stub.
// Run: node tests/students-ui-smoke-20261019.mjs
// This cannot replace Chromium/Firefox/physical device accessibility QA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('students/index.html'),app=read('students/app.js');
const src=[
'students/formulas.js','students/formulas-extension.js','students/formulas-expansion-v1.js',
'students/calculators.js','students/calculators-extension.js','students/calculators-expansion-v1.js',
'students/learning-data.js','students/book-photos-20261020.js','students/math-chapter-20261020.js','students/physics-chapter-20261020.js','students/applied-controls-20261020.js','students/chapter-topics-a-20261020.js','students/chapter-topics-b-20261020.js','students/mechanics-p42-20261020.js','students/symbol-definitions-20261020.js','students/physics-equation-audit-20261020.js','students/math-equation-audit-20261020.js','students/mechanics-equation-audit-20261020.js','students/machine-elements-audit-20261020.js','students/symbol-index.js'
];
const win={};
src.forEach(path=>new Function('window',read(path))(win));
const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]));
const elements={},storage={},messages=[];
let printCalls=0;
function element(id){
 if(!elements[id]){
  assert.ok(ids.has(id),'No HTML element for '+id);
  elements[id]={
   id,value:"",textContent:"",innerHTML:"",hidden:false,disabled:false,dataset:{},listeners:{},
   options:[{textContent:""}],classList:{toggle(){},add(){},remove(){}},
   addEventListener(type,callback){this.listeners[type]=callback},
   setAttribute(){},append(opt){this.options.push(opt)},
   querySelectorAll(selector){
    assert.equal(selector,'input');
    return [...this.innerHTML.matchAll(/<input[^>]*name="([^"]+)"[^>]*value="([^"]+)"/g)]
     .map(match=>({name:match[1],value:match[2]}));
   }
  };
 }
 return elements[id];
}
const tabs=['formulas','symbols','calculators','practice','sheet','resources'].map(tab=>({
 dataset:{tab},listeners:{},classList:{toggle(){}},setAttribute(){},
 addEventListener(type,fn){this.listeners[type]=fn}
}));
const panes=tabs.map(x=>({dataset:{pane:x.dataset.tab},hidden:false}));
const document={
 readyState:'complete',documentElement:{lang:'en',dataset:{}},
 body:{classList:{add(x){storage.printing=x},remove(x){delete storage.printing}}},
 getElementById:element,
 querySelectorAll(selector){
  if(selector==='[data-tab]')return tabs;
  if(selector==='[data-pane]')return panes;
  if(selector==='[data-label]')return [];
  throw new Error('Unexpected DOM query '+selector);
 },
 createElement(){return {value:'',textContent:''}}
};
const localStorage={getItem(key){return storage[key]??null},setItem(key,val){storage[key]=val}};
const location={hash:''};
win.addEventListener=(type,fn)=>{win[type]=fn};
win.print=()=>printCalls++;
win.confirm=()=>true;
const navigator={clipboard:{writeText:()=>Promise.resolve()}};
new Function('window','document','location','localStorage','navigator','confirm',app)(
 win,document,location,localStorage,navigator,()=>true
);
function verify(condition,label){assert.ok(condition,label);messages.push(label)}
function switchTab(name){tabs.find(x=>x.dataset.tab===name).listeners.click()}
verify(element('formula-grid').innerHTML.includes('formula-card'),'initial form cards render');
verify(element('formula-total').textContent===523,'correct formula count');
element('formula-search').listeners.input({target:{value:'Ohm'}});
verify(element('formula-grid').innerHTML.includes('Ohm'),'text search finds Ohm');
verify(element('formula-grid').innerHTML.includes('Symbols and units'),'formula details are present');
verify(element('formula-grid').innerHTML.includes('data-open="ohms-law"'),'exact calculator link, not fuzzy category match');
element('formula-grid').listeners.click({target:{closest:()=>({dataset:{fav:'ohm-s-law'}})}});
verify(element('saved-total').textContent===1,'bookmark counts persisted');
switchTab('sheet');
verify(element('sheet-formulas').innerHTML.includes('Ohm'),'saved sheet renders bookmark');
verify(!element('print-sheet').disabled,'print sheet is enabled when saved');
element('print-sheet').listeners.click();
verify(printCalls===1&&storage.printing==='print-sheet','print sheet activates PDF-friendly printing');
win.afterprint();
verify(!storage.printing,'print mode removed after print');
switchTab('practice');
verify(element('show-solution').disabled,'solution initially locked');
verify(element('exercise-hint').textContent.length>2,'hint is populated');
element('show-hint').listeners.click();
verify(element('exercise-hint').hidden===false,'hint toggle reveals clue');
element('exercise-answer').value=String(win.MT_PRACTICE[0].expected);
element('check-answer').listeners.click();
verify(!element('show-solution').disabled,'solution unlocked after numeric attempt');
verify(element('exercise-feedback').textContent.includes('Correct'),'answer feedback verified');
element('practice-difficulty').listeners.change({target:{value:'Advanced'}});
verify(element('exercise-level').textContent==='Advanced','difficulty filter selects advanced exercise');
switchTab('formulas');
element('formula-search').listeners.input({target:{value:''}});
element('study-group').listeners.change({target:{value:'navigation'}});
verify(element('formula-grid').innerHTML.includes('Navigation'),'study area filter updates visible formulas');
verify(element('topic-filter').options.length>1,'subject dropdown reflects selected group');
switchTab('symbols');
element('symbol-search').value='Q';
element('symbol-search').listeners.input();
verify(element('symbol-results').innerHTML.includes('Electric charge')&&element('symbol-results').innerHTML.includes('Volumetric flow rate'),'Q query distinguishes electrical charge from fluid flow');
verify(element('symbol-results').innerHTML.includes('Sensible heat energy'),'Q query includes thermal heat energy');
element('symbol-search').value='Proportional band';
element('symbol-search').listeners.input();
verify(element('symbol-results').innerHTML.includes('Instrumentation &amp; Control'),'P proportional band is recognized with a distinct subject');
element('symbol-search').value='Volumetric flow rate';
element('symbol-search').listeners.input();
element('symbol-results').listeners.click({target:{closest:()=>({dataset:{symbolFormula:'volumetric-flow'}})}});
verify(element('formula-search').value==='Volumetric flow','symbol lookup opens precisely related formula');

element('symbol-search').value='α';
element('symbol-search').listeners.input();
verify(element('symbol-results').innerHTML.includes('Input angles')||element('symbol-results').innerHTML.includes('Angle'),'Greek letter lookup remains searchable after mathematics expansion');
switchTab('calculators');
verify(element('calc-selector').innerHTML.includes('fuel-input-power')&&element('calc-selector').innerHTML.includes('loop-scaling'),'applied controls calculators included in global selector');
switchTab('formulas');
element('study-group').listeners.change({target:{value:'All'}});
element('formula-search').listeners.input({target:{value:'Maximum projectile height'}});
verify(element('formula-grid').innerHTML.includes('Projectile position above launch datum')&&element('formula-grid').innerHTML.includes('Maximum projectile height'),'source variant search opens the correct projectile family');
verify(element('formula-grid').innerHTML.includes('selected numerical reference case covered'),'reference-case status does not claim full domain validation');
element('formula-search').listeners.input({target:{value:'Roller bearing basic rating life'}});
verify(element('formula-grid').innerHTML.includes('1000000')&&element('formula-grid').innerHTML.includes('10/3'),'roller variant and explicit revolution scaling render');
switchTab('symbols');element('symbol-search').value='MINIMUM FILM thickness';element('symbol-search').listeners.input();
verify(element('symbol-results').innerHTML.includes('radial clearance'),'local film-fraction quantity is searchable');
console.log(JSON.stringify({status:'PASS',checks:messages.length,details:messages}));
