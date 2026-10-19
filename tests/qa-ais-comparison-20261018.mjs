import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=source.indexOf('function snapshot(){'),end=source.indexOf('\n\n',start);
let saved=null;const box={innerHTML:''};
const state={aisStatus:'error',forecast:[]};
const api=vm.runInNewContext(source.slice(start,end)+';({snapshot,compareAnalysis})',{
 state,cpaTargets:()=>[{}],isCpaAlert:()=>true,corridorTargets:()=>[{}],safeWaveHs:v=>v,
 nf:(n,d)=>Number(n).toFixed(d),K:{lastAnalysis:'qa'},store:{get:()=>saved,set:(_,v)=>saved=v},$:()=>box,
});
assert.equal(api.snapshot().ais,null);assert.equal(api.snapshot().cpa,null);
api.compareAnalysis();assert.equal(saved.aisStatus,'error');
api.compareAnalysis();assert.match(box.innerHTML,/AIS unavailable/);assert(!box.innerHTML.includes('<b>0 → 0</b><span class="delta same">No change</span></div><div class="change-row"><span>CPA'));
state.aisStatus='ok';api.compareAnalysis();assert.match(box.innerHTML,/Not comparable/);assert.match(box.innerHTML,/— → 1/);
api.compareAnalysis();assert.match(box.innerHTML,/AIS targets<\/span><b>1 → 1/);
state.aisStatus='error';api.compareAnalysis();assert.match(box.innerHTML,/1 → —/);assert.equal(saved.cpa,null);
saved={ais:0,cpa:0,maxHs:0,maxWind:0,maxCurrent:0};state.aisStatus='ok';api.compareAnalysis();assert.match(box.innerHTML,/— → 1/);assert.match(box.innerHTML,/Not comparable/);
assert.equal(saved.aisStatus,'ok');assert.equal(saved.cpa,1);
console.log(JSON.stringify({result:'PASS',assertions:14,scope:'Actual snapshot/comparison functions, synthetic unavailable/recovery/legacy states'}));
