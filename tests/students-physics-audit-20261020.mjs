import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),w={},ctx=vm.createContext({window:w});
for(const m of read('students/index.html').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(read('students/'+m[1]),ctx)}
let checks=0,numeric=0;const ok=(v,m)=>{assert.ok(v,m);checks++},near=(actual,expected,m)=>{ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-9*Math.max(1,Math.abs(expected)),m);numeric++},reject=(fn,m)=>{let failed=false;try{fn()}catch{failed=true}ok(failed,m)};
const model=w.MT_PHYSICS_MODELS,byId=new Map(w.MT_FORMULAS.map(f=>[f.id,f]));
// Expected values follow independent crest-spacing / encounter-rate examples.
near(model.doppler({fs:1000,c:340,vo:0,vs:0}),1000,'stationary endpoints');
near(model.doppler({fs:1000,c:340,vo:34,vs:0}),1100,'observer meets 10 percent more crests');
near(model.doppler({fs:1000,c:340,vo:-34,vs:0}),900,'observer meets 10 percent fewer crests');
near(model.doppler({fs:1000,c:340,vo:0,vs:34}),10000/9,'source compresses crest spacing to 0.306 m');
near(model.doppler({fs:1000,c:340,vo:0,vs:-34}),10000/11,'departing source stretches spacing to 0.374 m');
near(model.doppler({fs:1000,c:340,vo:34,vs:34}),11000/9,'both encounter rate and spacing change');
for(const bad of [{fs:0,c:340,vo:0,vs:0},{fs:1000,c:0,vo:0,vs:0},{fs:1000,c:340,vo:340,vs:0},{fs:1000,c:340,vo:0,vs:340},{fs:NaN,c:340,vo:0,vs:0}])reject(()=>model.doppler(bad),'unsupported Doppler state rejected');
// Read and calculate the ACTUAL displayed arithmetic expression without eval/Function.
// Narrow parser handles these four cards only; syntax outside this grammar is rejected.
function displayed(id,values){
 const text=byId.get(id).formula.split('=')[1].replaceAll('²','^2').replaceAll('−','-').replaceAll('·','*');
 const tokens=text.match(/[\p{L}_][\p{L}\p{N}_]*|\d+(?:\.\d+)?|[+*/()^-]/gu)||[];let i=0;
 const atom=()=>{const t=tokens[i++];if(t==='('){const z=expr();assert.equal(tokens[i++],')');return z}if(/^\d/.test(t))return Number(t);assert.ok(Object.hasOwn(values,t),'known variable '+t);return values[t]};
 const power=()=>{let v=atom();if(tokens[i]==='^'){i++;v=v**atom()}return v};
 const product=()=>{let v=power();while(i<tokens.length&&tokens[i]!==')'&&tokens[i]!=='+'&&tokens[i]!=='-'){const op=tokens[i];if(op==='*'||op==='/')i++;const b=power();v=op==='/'?v/b:v*b}return v};
 const expr=()=>{let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();v=op==='+'?v+b:v-b}return v};
 const result=expr();assert.equal(i,tokens.length);return result;
}
near(displayed('physics-audit-20261020-classical-doppler',{fs:1000,c:340,vo:0,vs:34}),10000/9,'displayed Doppler expression agrees with independent spacing case');
near(displayed('physics-audit-20261020-molecular-gas-pressure',{N:3e20,m:5e-26,v_rms:500,V:.001}),1250,'kinetic pressure from independently chosen total mass and mean kinetic energy');
near(displayed('physics-audit-20261020-luminous-flux',{I_v:100,Ω:2}),200,'uniform intensity over two steradians');
near(displayed('physics-audit-20261020-luminance',{I_v:300,A_projected:2}),150,'luminance uses projected area');
const rows=w.MT_STUDY.physicsEquationAudit;ok(rows.length===82,'82 separately identified physics relationships');ok(new Set(rows.map(r=>r.page)).size===7,'seven physics pages mapped');
for(const r of rows)ok(byId.has(r.formulaId)&&r.symbols.every(v=>v.symbol&&v.meaning&&v.unit)&&r.conditions,'complete captured expression '+r.id);
ok(w.MT_STUDY.sourceEquationRegister.length===671,'262 math plus 82 physics plus 204 mechanics and 53 machine-element and 70 chemistry relationships remain distinct from 529 app cards');
const c=w.MT_CALCULATORS.find(c=>c.id==='classical-doppler');near(c.compute({fs:1000,c:340,vo:0,vs:34}).value,10000/9,'mapped calculator follows source speed convention');ok(!!c.compute({fs:1000,c:340,vo:0,vs:340}).invalid,'calculator surfaces sonic-boundary error');
console.log(JSON.stringify({status:'PASS',checks,numericReferenceCases:numeric,capturedPhysicsExpressions:rows.length,scope:'selected independent arithmetic and boundary cases; not numerical verification of all 82 expressions'}));
