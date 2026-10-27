// Parse shipped expressions and declared units. Unsupported notation is recorded,
// never converted into a pass. Dimensional equality is not numerical validation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const w={},ctx=vm.createContext({window:w});
for(const m of read('students/index.html').matchAll(/src="([^"?]+\.js)/g)){
 if(m[1]==='app.js')break;
 vm.runInContext(read('students/'+m[1]),ctx);
}
// M,L,T,temperature,current,amount,currency,luminous intensity
const Z=Array(8).fill(0),u=(...x)=>[...x,...Z].slice(0,8);
const U={dimensionless:Z,rad:Z,'°':Z,'rad or °':Z,rev:Z,'%':Z,percent:Z,sr:Z,dB:Z,
 kg:u(1),t:u(1),g:u(1),m:u(0,1),cm:u(0,1),mm:u(0,1),NM:u(0,1),s:u(0,0,1),h:u(0,0,1),
 K:u(0,0,0,1),'°C':u(0,0,0,1),A:u(0,0,0,0,1),mol:u(0,0,0,0,0,1),currency:u(0,0,0,0,0,0,1),cd:u(0,0,0,0,0,0,0,1),
 N:u(1,1,-2),Pa:u(1,-1,-2),bar:u(1,-1,-2),J:u(1,2,-2),W:u(1,2,-3),Wh:u(1,2,-2),
 V:u(1,2,-3,0,-1),'Ω':u(1,2,-3,0,-2),S:u(-1,-2,3,0,2),C:u(0,0,1,0,1),
 F:u(-1,-2,4,0,2),pF:u(-1,-2,4,0,2),H:u(1,2,-2,0,-2),Wb:u(1,2,-2,0,-1),T:u(1,0,-2,0,-1),
 min:u(0,0,1),day:u(0,0,1),year:u(0,0,1),L:u(0,3),kmol:u(0,0,0,0,0,1),kJ:u(1,2,-2),kWh:u(1,2,-2),kn:u(0,1,-1),Hz:u(0,0,-1),var:u(1,2,-3),VA:u(1,2,-3),lm:u(0,0,0,0,0,0,0,1),lx:u(0,-2,0,0,0,0,0,1)};
const plus=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]),scale=(a,n)=>a.map(v=>v*n),equal=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-9);
const powers={'⁻':'-','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5'};
function normal(s){return s.replace(/[⁻⁰¹²³⁴⁵]+/g,x=>'^('+[...x].map(c=>powers[c]).join('')+')').replaceAll('−','-').replaceAll('·','*');}
function parse(text,vars){
 const names=Object.keys(vars).sort((a,b)=>b.length-a.length),lookup={};
 // All quantities are declared in formula-local metadata; no inferred units.
 const pattern=names.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 if(pattern)text=text.replace(new RegExp('(?<![\\p{L}0-9_₀₁₂₃₄₅₆₇₈₉])(?:'+pattern+')(?![\\p{L}0-9_₀₁₂₃₄₅₆₇₈₉])','gu'),x=>{const k='VAR'+names.indexOf(x);lookup[k]=vars[x];return k;});
 text=normal(text);
 const tokens=text.match(/VAR\d+|[A-Za-z_]+|π|\d+(?:\.\d+)?|[+*/()^,-]/g)||[];
 if(tokens.join('')!==text.replace(/\s/g,''))throw Error('unsupported notation');
 for(let j=0;j<tokens.length-1;j++)if(/^(?:VAR\d+|\d+(?:\.\d+)?|π|\))$/.test(tokens[j])&&/^(?:[A-Za-z_]+|VAR\d+|\d+(?:\.\d+)?|π|\()$/.test(tokens[j+1]))throw Error('unsupported implicit product');
 let i=0;
 const val=(d,n=null)=>({d,n});
 function atom(){const t=tokens[i++];
  if(t==='('){const a=expr();if(tokens[i++]!==')')throw Error('unsupported grouping');return a;}
  if(t==='-'||t==='+'){const a=atom();return val(a.d,a.n===null?null:(t==='-'?-a.n:a.n));}
  if(/^\d/.test(t||''))return val(Z,Number(t));
  if(t==='π')return val(Z,Math.PI);
  if(Object.hasOwn(lookup,t))return val(lookup[t]);
  if(['sqrt','sin','cos','tan','cot','exp','ln','log10','abs','atan2','max'].includes(t)){
   if(tokens[i++]!=='(')throw Error('unsupported function notation');
   const a=expr();let b=null;if(tokens[i]===','){i++;b=expr();}if(tokens[i++]!==')')throw Error('unsupported function arguments');
   if(t==='sqrt')return val(scale(a.d,.5));if(t==='abs')return a;
   if(b){assert.ok(equal(a.d,b.d)||(t==='max'&&(a.n===0||b.n===0)),'function argument dimensions');return val(t==='max'?(a.n===0?b.d:a.d):Z);}
   assert.ok(equal(a.d,Z),'function requires dimensionless argument');return val(Z);
  }
  throw Error('undeclared quantity '+t);
 }
 function power(){let a=atom();if(tokens[i]==='^'){i++;const b=power();assert.ok(equal(b.d,Z),'dimensionless exponent');if(b.n===null){if(!equal(a.d,Z))throw Error('variable exponent on dimensional quantity');a=val(Z);}else a=val(scale(a.d,b.n),a.n===null?null:a.n**b.n);}return a;}
 function op(a,b,t){if(t==='+'||t==='-'){assert.ok(equal(a.d,b.d),'addition/subtraction dimensions');return val(a.d,a.n===null||b.n===null?null:t==='+'?a.n+b.n:a.n-b.n);}return val(plus(a.d,b.d,t==='*'?1:-1),a.n===null||b.n===null?null:t==='*'?a.n*b.n:a.n/b.n);}
 function product(){let a=power();while(tokens[i]==='*'||tokens[i]==='/'){const t=tokens[i++];a=op(a,power(),t);}return a;}
 function expr(){let a=product();while(tokens[i]==='+'||tokens[i]==='-'){const t=tokens[i++];a=op(a,product(),t);}return a;}
 const a=expr();if(i!==tokens.length)throw Error('unsupported implicit product or suffix');return a.d;
}
function unit(text){if(U[text])return U[text];return parse(text,U);}
const results=[];
for(const r of w.MT_STUDY.sourceEquationRegister){
 let outcome='DIMENSIONAL_PASS',reason='';
 try{
  if(/Σ|∫|integral|⇌|→|;|for | over |\bconstant\b/.test(r.formula)||['CHEMICAL_PATTERN','REACTION','BOOLEAN','IDENTITY'].includes(r.kind))throw Error('requires separate symbolic/chemical/indexed grammar');
  if(['book-c6-p96-r01','book-c6-p97-r01','book-c13-p189-r04','book-c13-p189-r05','book-c9-p138-r06','book-c13-p194-r03'].includes(r.id))throw Error('explicit numerical-unit conversion; coefficient carries units');
  const sides=r.formula.split(/=|≈/);if(sides.length!==2)throw Error('not a single equality');
  const vars={};for(const s of r.symbols){const d=unit(s.unit);for(const name of s.symbol.split(','))vars[name.trim()]=d;}
  if(sides.some(x=>x.trim()==='0'))throw Error('zero-valued relation: dimensional equality alone is vacuous');
  assert.ok(equal(parse(sides[0],vars),parse(sides[1],vars)),'left and right dimensions differ');
 }catch(e){outcome=e instanceof assert.AssertionError?'DIMENSIONAL_FAILURE':'NOT_PARSED';reason=e.message;}
 results.push({id:r.id,page:r.page,chapter:r.chapter??1,formula:r.formula,outcome,reason});
}
const counts=Object.fromEntries(['DIMENSIONAL_PASS','DIMENSIONAL_FAILURE','NOT_PARSED'].map(k=>[k,results.filter(r=>r.outcome===k).length]));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({counts,results},null,2)+'\n');
console.log(JSON.stringify({counts,failures:results.filter(r=>r.outcome==='DIMENSIONAL_FAILURE'),scope:'Declared units and parsed expression consistency only; scale factors, physical validity and unparsed rows are not certified.'},null,2));
assert.equal(counts.DIMENSIONAL_FAILURE,0);
assert.ok(counts.DIMENSIONAL_PASS>=450,'coverage regression');
