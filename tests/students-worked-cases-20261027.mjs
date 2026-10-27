import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {evaluate} from './lib/students-numeric-expression.mjs';
const w={},ctx=vm.createContext({window:w});
for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){
  if(m[1]==='app.js')break;
  vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx);
}
const rows=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r]));
const {cases}=JSON.parse(fs.readFileSync('tests/fixtures/students-worked-cases-20261027.json','utf8'));
let failures=[];
const counts={};
for(const test of cases){
  const row=rows.get(test.id);
  assert.ok(row,test.id);
  assert.notEqual(row.analyticalReview.decision,'OPEN_MODEL_OR_SOURCE_LIMIT');
  const hash=crypto.createHash('sha256').update(JSON.stringify({formula:row.formula,conditions:row.conditions,symbols:row.symbols})).digest('hex');
  assert.equal(hash,test.context_sha256,'Worked-case context changed: '+test.id);
  assert.ok(test.reference && Object.keys(test.inputs).length);
  assert.notEqual(row.numericStatus,'PENDING','Worked case missing from runtime evidence: '+test.id);
  assert.equal(row.workedCaseTestReference,'tests/students-worked-cases-20261027.mjs');
  const declared=new Set(row.symbols.flatMap(s=>s.symbol.split(',').map(v=>v.trim())));
  for(const input of Object.keys(test.inputs))assert.ok(declared.has(input),'Undeclared case input '+test.id+': '+input);
  try{
    const sides=row.formula.split(/=|≈/);
    assert.equal(sides.length,2,'Only a single, explicitly selected equality is supported');
    const actual=evaluate(sides[test.side],test.inputs,test.degrees);
    const tolerance=2e-9*Math.max(1,Math.abs(test.expected));
    assert.ok(Math.abs(actual-test.expected)<=tolerance,`${actual} != ${test.expected}`);
    counts[row.chapter??1]=(counts[row.chapter??1]??0)+1;
  }catch(e){failures.push({id:test.id,formula:row.formula,error:e.message});}
}
if(failures.length)console.error(JSON.stringify(failures,null,2));
assert.equal(failures.length,0);
assert.equal(Object.keys(counts).length,16);
assert.equal(cases.length,319);
assert.equal(new Set(cases.map(c=>c.id)).size,309);
// Guard the test interpreter itself, including precedence and rejection paths.
for(const [expr,inputs,expected] of [['2x²',{x:3},18],['-x²',{x:3},-9],['sin²(x)',{x:Math.PI/2},1],['2^3^2',{},512],['x+y²',{x:2,y:3},11]])assert.equal(evaluate(expr,inputs),expected);
for(const expr of ['x.constructor','process.exit()','sqrt(-1)','1/0','x + unknown'])assert.throws(()=>evaluate(expr,{x:1}));
assert.notEqual(evaluate('I/t',{I:2,t:30}),60,'A reversed charge formula must fail the independent fixture');
console.log(JSON.stringify({status:'PASS',cases:cases.length,expressions:309,chapters:counts,scope:'Individually explained authored worked cases against the shipped RHS; not full-domain or historical-coefficient validation.'}));
