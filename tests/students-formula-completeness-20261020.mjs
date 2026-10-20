/* Full student catalogue metadata audit. Run with:
 * node tests/students-formula-completeness-20261020.mjs
 * This is an editorial completeness check, not proof of printed-source verification.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const order=[
 'students/formulas.js','students/formulas-extension.js','students/formulas-expansion-v1.js',
 'students/calculators.js','students/calculators-extension.js','students/calculators-expansion-v1.js',
 'students/learning-data.js','students/book-photos-20261020.js','students/math-chapter-20261020.js',
 'students/physics-chapter-20261020.js','students/applied-controls-20261020.js',
 'students/chapter-topics-a-20261020.js','students/chapter-topics-b-20261020.js',
 'students/mechanics-p42-20261020.js','students/symbol-index.js'
];
const win={};const ctx=vm.createContext({window:win,console});
for(const path of order)vm.runInContext(read(path),ctx,{filename:path});
const formulas=win.MT_FORMULAS,study=win.MT_STUDY;
if(formulas.length!==499)throw Error('Expected 499 formulas, got '+formulas.length);
const found=new Set();const rows=[];
for(const f of formulas){
 if(found.has(f.id))throw Error('Duplicate '+f.id);
 found.add(f.id);
 const symbols=study.details[f.id]?.symbols||[];
 const missing=[];
 if(!f.formula?.trim())missing.push('expression');
 if(!f.note?.trim())missing.push('conditions');
 if(!symbols.length)missing.push('symbols');
 if(symbols.some(x=>!x.symbol?.trim()||!x.meaning?.trim()||!x.unit?.trim()))missing.push('invalid-symbol-definition');
 if(!study.photoReview?.[f.id])missing.push('no-equation-photo-review');
 // Printed source verification is distinct from topic mapping: do not infer from chapter.
 rows.push({id:f.id,name:f.name,category:f.category,expression:f.formula,conditions:f.note,
   symbolCount:symbols.length,printedPage:study.photoReview?.[f.id]?.page??'',
   sourceStatus:study.photoReview?.[f.id]?.status||'NOT EQUATION-LEVEL PHOTO REVIEWED',
   missing});
}
const completeMetadata=rows.filter(x=>!x.missing.includes('symbols')&&!x.missing.includes('invalid-symbol-definition')&&!x.missing.includes('expression')&&!x.missing.includes('conditions')).length;
const photoReviewed=rows.filter(x=>x.printedPage!=='').length;
const summary={formulas:rows.length,completeMetadata,missingMetadata:rows.length-completeMetadata,
 photoReviewed,notPhotoReviewed:rows.length-photoReviewed,
 sourceWarning:'Photo-reviewed labels are not independent numerical validation.'};
const output=process.argv[2];
if(output){
 const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 const headers=['id','name','category','expression','conditions','symbolCount','printedPage','sourceStatus','missing'];
 const csv=[headers.map(esc).join(','),...rows.map(r=>headers.map(k=>esc(k==='missing'?r.missing.join('; '):r[k])).join(','))].join('\n')+'\n';
 fs.writeFileSync(output,csv);
}
console.log(JSON.stringify(summary,null,2));
if(process.env.REQUIRE_COMPLETE_FORMULA_METADATA==='1'&&completeMetadata!==rows.length)process.exitCode=1;
