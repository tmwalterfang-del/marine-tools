/* Full student catalogue metadata audit. Run with:
 * node tests/students-formula-completeness-20261020.mjs
 * This is an editorial completeness check, not proof of printed-source verification.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const order=[
 'students/formulas.js','students/formulas-extension.js','students/formulas-expansion-v1.js',
 'students/calculators.js','students/calculators-extension.js','students/calculators-expansion-v1.js',
 'students/learning-data.js','students/book-photos-20261020.js','students/math-chapter-20261020.js',
 'students/physics-chapter-20261020.js','students/applied-controls-20261020.js',
 'students/chapter-topics-a-20261020.js','students/chapter-topics-b-20261020.js',
 'students/mechanics-p42-20261020.js','students/symbol-definitions-20261020.js','students/physics-equation-audit-20261020.js','students/math-equation-audit-20261020.js','students/mechanics-equation-audit-20261020.js','students/machine-elements-audit-20261020.js','students/chemistry-equation-audit-20261020.js','students/chapter-6-audit-20261020.js','students/chapter-7-audit-20261020.js','students/chapter-8-audit-20261020.js','students/chapter-9-audit-20261020.js','students/chapter-10-audit-20261020.js','students/chapter-11-audit-20261020.js','students/chapter-12-audit-20261020.js','students/chapter-13-audit-20261020.js','students/chapter-14-audit-20261020.js','students/chapter-15-audit-20261020.js','students/chapter-16-audit-20261020.js','students/chapter-index.js','students/symbol-index.js'
];
const win={};const ctx=vm.createContext({window:win,console});
for(const path of order)vm.runInContext(read(path),ctx,{filename:path});
const formulas=win.MT_FORMULAS,study=win.MT_STUDY;
assert.equal(study.details['first-law-closed-system']?.symbols?.length,3,'Closed-system first law must have three symbols');
assert.equal(study.details['specific-fuel-oil-consumption']?.symbols?.length,3,'SFOC must have three symbol definitions');
assert.ok(study.details['first-law-closed-system'].symbols.every(s=>s.unit==='J'),'First-law energies must be joules');
assert.ok(study.details['specific-fuel-oil-consumption'].symbols.some(s=>s.unit==='g/kWh'),'SFOC must have g/kWh unit');

if(formulas.length!==575)throw Error('Expected 575 formulas, got '+formulas.length);
const found=new Set();const rows=[];
const sourceRegister=study.sourceEquationRegister||[];
for(const f of formulas){
 if(found.has(f.id))throw Error('Duplicate '+f.id);
 found.add(f.id);
 const symbols=study.details[f.id]?.symbols||[];
 const captured=sourceRegister.filter(r=>r.formulaId===f.id);
 const missing=[];
 if(!f.formula?.trim())missing.push('expression');
 if(!f.note?.trim())missing.push('conditions');
 if(!symbols.length)missing.push('symbols');
 if(symbols.some(x=>!x.symbol?.trim()||!x.meaning?.trim()||!x.unit?.trim()))missing.push('invalid-symbol-definition');
 if(!study.photoReview?.[f.id])missing.push('no-equation-photo-review');
 // Printed source verification is distinct from topic mapping: do not infer from chapter.
 rows.push({id:f.id,name:f.name,category:f.category,expression:f.formula,conditions:f.note,
   symbolCount:symbols.length,printedPage:study.photoReview?.[f.id]?.page??'',
   sourceStatus:captured.length?'SOURCE EXPRESSIONS REGISTERED; see expression-specific numerical status':study.photoReview?.[f.id]?.status||'NOT EQUATION-LEVEL PHOTO REVIEWED',
   sourceExpressionCount:captured.length,sourcePages:[...new Set(captured.map(r=>r.page))].sort((a,b)=>a-b).join(';'),
   symbolUnitBasis:'Explicit local definitions; full expression dimensional proof remains separate',
   missing});
}
const completeMetadata=rows.filter(x=>!x.missing.includes('symbols')&&!x.missing.includes('invalid-symbol-definition')&&!x.missing.includes('expression')&&!x.missing.includes('conditions')).length;
const photoReviewed=rows.filter(x=>x.printedPage!=='').length;
const summary={formulas:rows.length,completeMetadata,missingMetadata:rows.length-completeMetadata,
 photoReviewed,notPhotoReviewed:rows.length-photoReviewed,
 sourceExpressionRecords:sourceRegister.length,sourcePagesWithCapturedExpressions:new Set(sourceRegister.map(r=>r.page)).size,
 formulasWithCapturedSourceExpressions:new Set(sourceRegister.map(r=>r.formulaId)).size,
 sourceWarning:'Legacy photo-reference counts and current expression registers are separate; neither implies all equations passed numerical verification.'};
const output=process.argv[2];
if(output){
 const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 const headers=['id','name','category','expression','conditions','symbolCount','printedPage','sourceStatus','sourceExpressionCount','sourcePages','symbolUnitBasis','missing'];
 const csv=[headers.map(esc).join(','),...rows.map(r=>headers.map(k=>esc(k==='missing'?r.missing.join('; '):r[k])).join(','))].join('\n')+'\n';
 fs.writeFileSync(output,csv);
}
console.log(JSON.stringify(summary,null,2));
if(process.env.REQUIRE_COMPLETE_FORMULA_METADATA==='1'&&completeMetadata!==rows.length)process.exitCode=1;
