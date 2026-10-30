// Reproducible evidence aggregation. --freeze is an EXPLICIT reviewer action;
// ordinary/CI execution never refreshes approved contexts or expected results.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const freeze=process.argv.includes('--freeze'),generate=process.argv.includes('--generate');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'marine-education-review-'));
const evidence={},summaries=[];
function run(executable,args){const r=spawnSync(executable,args,{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(r.status,0,[executable,...args].join(' ')+'\n'+r.stdout+'\n'+r.stderr);const lines=r.stdout.trim().split(/\r?\n/);for(const line of lines)try{const s=JSON.parse(line);if(s.status==='PASS')summaries.push(s);}catch{}return r.stdout;}
try {
 // Existing manually authored scalar cases are retained on their restricted scope.
 run(process.execPath,['tests/students-worked-cases-20261027.mjs']);
 const original=JSON.parse(fs.readFileSync('tests/fixtures/students-worked-cases-20261027.json','utf8')).cases;
 for(const c of original){const e=evidence[c.id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',test:'tests/students-worked-cases-20261027.mjs',reference:c.reference,checks:0};e.checks++;}
 for(const [name,file] of [
 ['physics','students-physics-reference-20261029.mjs'],['mechanics','students-mechanics-reference-20261029.mjs'],
 ['machine','students-machine-reference-20261029.mjs'],['chemistry','students-chemistry-reference-20261029.mjs'],
 ['electrical','students-electrical-complete-20261029.mjs'],['electronics','students-electronics-reference-20261029.mjs'],
 ['power-electronics','students-power-electronics-reference-20261030.mjs'],['engine','students-engine-reference-20261030.mjs'],
 ['heat-flow','students-heat-flow-reference-20261030.mjs'],['navigation','students-navigation-reference-20261029.mjs'],
 ['stability','students-stability-reference-20261030.mjs'],
 ]){
  const output=path.join(temporary,name+'.json');run(process.execPath,['tests/'+file,'--output',output]);
  const records=JSON.parse(fs.readFileSync(output,'utf8'));
  for(const [id,e] of Object.entries(records))evidence[id]={kind:e.kind,test:'tests/'+file,reference:e.reference??e.reason,checks:e.cases?.length??e.assignments??1};
 }
 const mathOutput=path.join(temporary,'math.json'),python=process.env.STUDENTS_PYTHON||(process.platform==='win32'?'python':'python3');
 run(python,['tests/students-math-reference-20261029.py','--output',mathOutput]);
 const math=JSON.parse(fs.readFileSync(mathOutput,'utf8'));
 for(const [id,e] of Object.entries(math.evidence))evidence[id]={kind:e.kind,test:'tests/students-math-reference-20261029.py',reference:e.basis,checks:e.checks};
 const w=catalogue(),source=w.MT_STUDY.sourceEquationRegister,primary=w.MT_FORMULAS,by=new Map(source.map(r=>[r.id,r]));
 // Remaining two source rows already had all-chapter examples; evaluate the
 // actual expression here as well, so the aggregate has an explicit row map.
 for(const [id,inputs,expected,reference] of [
 ['book-c10-p153-r04',{'u₁':100,'u₂':80,'c_θ1':300,'c_θ2':-100},38000,'Independent angular-momentum work: rotor inlet contribution 30 kJ/kg, outlet subtraction −8 kJ/kg.'],
 ['book-c12-p180-r03',{m:1,c_above:4000,'T₁':283,T_f:273,w_water:.5,L_f:334000,c_below:2000,'T₂':263},227000,'Product: 40 kJ sensible above freezing, 167 kJ latent for water fraction .5, 20 kJ sensible below.'],
 ]){
  const r=by.get(id),actual=evaluate(r.formula.split('=')[1].trim(),inputs);assert.ok(Math.abs(actual-expected)<1e-8,id);
  evidence[id]={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',test:'tests/students-full-reference-20261030.mjs',reference,checks:1};
 }
 assert.equal(source.length,1498);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());assert.equal(primary.length,575);
 const digest=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
 const contexts={
  source:Object.fromEntries(source.map(r=>[r.id,{sha256:digest({formula:r.formula,conditions:r.conditions,symbols:r.symbols}),...evidence[r.id]}])),
  primary:Object.fromEntries(primary.map(f=>[f.id,{sha256:digest({name:f.name,formula:f.formula,note:f.note,symbols:w.MT_STUDY.details[f.id]?.symbols}),review:'MANUAL_EXPRESSION_UNITS_AND_ASSUMPTIONS_REVIEW',scope:'Editorial/mathematical reading of this parent representation. A linked source record alone is not a numeric test of this formula.'}])),
 };
 const fixture='tests/fixtures/students-full-review-context-20261030.json';
 const frozen={
  scope:'Source contexts bind the classified reference evidence. Primary contexts bind a separate manual reading; they do not claim 575 independent numeric tests.',
  source:Object.fromEntries(Object.entries(contexts.source).map(([id,e])=>[id,{context_sha256:e.sha256,evidence_sha256:digest(evidence[id])}])),
  primary:Object.fromEntries(Object.entries(contexts.primary).map(([id,e])=>[id,e.sha256])),
 };
 if(freeze)fs.writeFileSync(fixture,JSON.stringify(frozen,null,2)+'\n');
 else assert.deepEqual(frozen,JSON.parse(fs.readFileSync(fixture,'utf8')),'Stale reviewed context, evidence classification or scope; do not automatically refresh the snapshot.');
 const excluded=Object.entries(evidence).filter(([,e])=>e.kind==='EXCLUDED_FROM_SUPPORTED_CALCULATION');assert.equal(excluded.length,6);
 for(const [id]of excluded)assert.equal(by.get(id).analyticalReview?.decision,'OPEN_MODEL_OR_SOURCE_LIMIT',id);
 // Parent findings: unreduced strength differs from a reduced capacity margin;
 // external gear speeds are magnitudes unless a minus sign is supplied.
 const factor=primary.find(f=>f.id==='student-v2-factor-of-safety');
 assert.match(factor.formula,/limiting strength/);assert.match(factor.note,/SAME failure mode/);
 assert.equal(evaluate(factor.formula.split('=')[1],{'limiting strength':300,'design stress':100}),3);
 assert.match(primary.find(f=>f.id==='ext-safety-factor').name,/margin/i);
 assert.match(primary.find(f=>f.id==='source-expansion-20261020-ideal-gear-speed-ratio').note,/SPEED MAGNITUDES/);
 const pack=Object.fromEntries(Object.entries(contexts.source).map(([id,e])=>[id,{kind:e.kind,test:e.test,reference:e.reference,checks:e.checks}]));
 if(!generate)assert.deepEqual(JSON.parse(JSON.stringify(Object.fromEntries(source.map(r=>[r.id,r.fullReviewEvidence])))),pack,'Generated preview evidence must match the executed, context-bound reference tests.');
 if(generate){
  fs.writeFileSync('students/full-review-20261030.js','/* Generated from executed, context-bound review evidence. Not a full-domain certificate. */\n(function(){"use strict";const evidence='+JSON.stringify(pack)+';for(const r of window.MT_STUDY.sourceEquationRegister){const e=evidence[r.id];if(!e)throw Error("Missing full-review expression "+r.id);r.fullReviewEvidence=e;}window.MT_STUDY.fullReview20261030={sourceExpressions:1498,primaryEditorialReviews:575,excludedHistoricalModels:6,scope:"Per-expression reference evidence; empirical calibration and real-vessel data remain separately qualified."};})();\n');
  const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  const headers=['id','chapter','page','name','expression','conditions','context_sha256','evidence_kind','test','checks','scope'];
  fs.writeFileSync('docs/STUDENTS_FULL_EXPRESSION_EVIDENCE_2026-10-30.csv',[headers.map(esc).join(','),...source.map(r=>{const e=contexts.source[r.id];return [r.id,r.chapter??1,r.page,r.name,r.formula,r.conditions,e.sha256,e.kind,e.test,e.checks,e.reference].map(esc).join(',');})].join('\n')+'\n');
  const ph=['id','name','expression','conditions','symbol_count','context_sha256','review_type','scope'];
  fs.writeFileSync('docs/STUDENTS_PRIMARY_FORMULA_REVIEW_2026-10-30.csv',[ph.map(esc).join(','),...primary.map(f=>{const e=contexts.primary[f.id];return [f.id,f.name,f.formula,f.note,w.MT_STUDY.details[f.id]?.symbols.length,e.sha256,e.review,e.scope].map(esc).join(',');})].join('\n')+'\n');
 }
 console.log(JSON.stringify({status:'PASS',sourceExpressions:1498,primaryEditorialReviews:575,excludedHistoricalModels:6,countsByEvidenceKind:Object.fromEntries([...new Set(Object.values(evidence).map(e=>e.kind))].map(k=>[k,Object.values(evidence).filter(e=>e.kind===k).length])),scope:'Complete row coverage with explicit evidence classes; 575 primary representations separately read/frozen, not claimed to have 575 independent numeric tests. No empirical or operational certification.'}));
} finally {
 // Delete only the unique temporary directory created by THIS process.
 assert.equal(path.dirname(path.resolve(temporary)),path.resolve(os.tmpdir()));
 assert.ok(path.basename(temporary).startsWith('marine-education-review-'));
 fs.rmSync(temporary,{recursive:true,force:true});
}
