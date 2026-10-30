import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const w=catalogue(),partial=process.argv.includes('--partial');
function script(file){vm.runInNewContext(fs.readFileSync('students/'+file,'utf8'),{window:w},{filename:file});}
if(!w.MT_PRACTICE_BANK){script('practice-bank-20261030.js');for(const file of ['practice-foundations-20261030.js','practice-science-20261030.js','practice-machinery-20261030.js','practice-marine-20261030.js']){if(partial&&!fs.existsSync('students/'+file))continue;script(file);}}
script('education-models-20261030.js');
const bank=w.MT_PRACTICE_BANK.questions,source=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r])),primary=new Map(w.MT_FORMULAS.map(f=>[f.id,f])),calculators=new Map(w.MT_CALCULATORS.map(c=>[c.id,c]));let assertions=0;
function resolve(value,answer){if(value==='$answer')return answer;if(Array.isArray(value))return value.map(v=>resolve(v,answer));if(value&&typeof value==='object'){if(Object.hasOwn(value,'answerScale'))return answer*value.answerScale+(value.answerOffset??0);return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,resolve(v,answer)]));}return value;}
function near(actual,expected,label){assert.ok(Number.isFinite(actual)&&Number.isFinite(expected)&&Math.abs(actual-expected)<=3e-9*Math.max(1e-15,Math.abs(expected)),label+': '+actual+' vs '+expected);assertions++;}
function finite(operation,v){switch(operation){
 case 'sum':return v.values.reduce((a,b)=>a+b,0);
 case 'positionalInteger':return v.digits.reduce((n,d)=>n*v.base+d,0);
 case 'invertingSummer':return -v.feedback*v.voltages.reduce((i,u,k)=>i+u/v.resistances[k],0);
 case 'thd':return Math.hypot(...v.harmonics)/v.fundamental;
 case 'cycleRejection':{const cooling=v.flow*(v.h1-v.h3),work=v.flow*(v.h2-v.h1);return cooling+work;}
 case 'quotient':return v.numerator/v.denominator;
 case 'discountedCashFlows':return v.flows.reduce((pv,cash,i)=>pv+cash/(1+v.rate)**(i+1),-(v.initial??0));
 case 'cargoBalance':return v.departure-v.arrival-v.otherMassChanges.reduce((a,b)=>a+b,0);
 case 'compassInterpolation8':{assert.equal(v.deviations.length,8);let result=v.deviations.reduce((a,b)=>a+b,0)/8;for(let k=1;k<=3;k++){let sine=0,cosine=0;v.deviations.forEach((d,j)=>{sine+=d*Math.sin(k*j*Math.PI/4)/4;cosine+=d*Math.cos(k*j*Math.PI/4)/4;});result+=sine*Math.sin(k*v.angle)+cosine*Math.cos(k*v.angle);}return result+v.deviations.reduce((sum,d,j)=>sum+d*(-1)**j,0)/8*Math.cos(4*v.angle);}
 case 'mean':return v.values.reduce((a,b)=>a+b,0)/v.values.length;
 case 'weightedMean':return v.values.reduce((sum,x,i)=>sum+x*v.weights[i],0)/v.weights.reduce((a,b)=>a+b,0);
 case 'dot':assert.equal(v.left.length,v.right.length);return v.left.reduce((sum,x,i)=>sum+x*v.right[i],0);
 case 'combineDecibels':return 10*Math.log10(v.levels.reduce((sum,L)=>sum+10**(L/10),0));
 default:throw Error('No independent finite model for '+operation);
}}
for(const e of bank){
 assert.ok(Number.isInteger(e.chapter)&&e.chapter>=1&&e.chapter<=16,e.id+' chapter');assert.ok(Number.isInteger(e.difficulty)&&e.difficulty>=1&&e.difficulty<=16,e.id+' increasing rank');
 assert.equal(e.level,w.MT_PRACTICE_BANK.levels[Math.floor((e.difficulty-1)/4)],e.id+' level');
 assert.ok(e.hint.length>=20&&e.steps.length>=2,e.id+' independent hint and solution');assert.ok(e.references.length,e.id+' checked reference');
 assert.ok(e.references.some(r=>JSON.stringify(r).includes('$answer')||JSON.stringify(r).includes('answerScale')),e.id+' reference must actually constrain its answer');
 for(const r of e.references){const v=resolve(r.values??r.inputs??{},e.expected),expected=resolve(r.expected??'$answer',e.expected),label=e.id+' '+r.kind+' '+(r.id??r.operation);
  if(r.kind==='source'||r.kind==='primary'){
   const row=(r.kind==='source'?source:primary).get(r.id);assert.ok(row,label);if(r.kind==='source')assert.notEqual(row.analyticalReview?.decision,'OPEN_MODEL_OR_SOURCE_LIMIT',e.id+' must not turn an excluded historical model into a normal exercise');
   const expression=row.formula.split(';')[r.segment??0].split('⇒')[r.clause??0],sides=expression.split(/=|≈/);
   if(r.compareSides)near(evaluate(sides[r.leftSide??0],v,r.degrees??false),evaluate(sides[r.rightSide??1],v,r.degrees??false),label);
   else near(evaluate(sides[r.side??1],v,r.degrees??false)*(r.outputScale??1)+(r.outputOffset??0),expected,label);
  }else if(r.kind==='finite')near(finite(r.operation,v)*(r.outputScale??1),expected,label);
  else if(r.kind==='calculator'){const result=calculators.get(r.id).compute(v);assert.ok(!result.invalid,label);near(result.value*(r.outputScale??1),expected,label);}
  else if(r.kind==='model')near(w.MT_EDUCATION_MODELS[r.id](v)[r.output]*(r.outputScale??1),expected,label);
  else throw Error('Unknown exercise reference kind '+r.kind);
 }
}
assert.equal(new Set(bank.map(e=>e.id)).size,bank.length);assert.equal(new Set(bank.map(e=>e.prompt)).size,bank.length);
for(const chapter of [...new Set(bank.map(e=>e.chapter))]){const rows=bank.filter(e=>e.chapter===chapter);assert.equal(rows.length,16,'Sixteen NEW exercises in chapter '+chapter);assert.equal(new Set(rows.map(e=>e.difficulty)).size,16);}
if(!partial){assert.equal(bank.length,256);assert.equal(w.MT_PRACTICE.length,292,'Original 36 plus 256 new questions retained');assert.equal(new Set(w.MT_PRACTICE.map(e=>e.id)).size,292);}
console.log(JSON.stringify({status:'PASS',newExercises:bank.length,chapters:new Set(bank.map(e=>e.chapter)).size,assertions,scope:'Authored answers checked against displayed source/primary relations, independently enumerated finite operations or already independently verified model functions; no excluded historical model exercises.'}));
