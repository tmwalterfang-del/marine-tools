// Claude practice-bank consistency audit: prompt numbers vs computed inputs, answer step vs expected, tolerance sanity.
const fs=require('fs'),vm=require('vm');const w={};const ctx=vm.createContext({window:w});
for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx);}
for(const f of ['practice-bank-20261030.js','practice-foundations-20261030.js','practice-science-20261030.js','practice-machinery-20261030.js','practice-marine-20261030.js'])vm.runInContext(fs.readFileSync('students/'+f,'utf8'),ctx);
const qs=[...w.MT_PRACTICE_BANK.questions,...(w.MT_PRACTICE||[]).map(p=>({...p,_legacy:true}))];
const sup={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
function promptNumbers(t){t=t.replace(/−/g,'-').replace(/(\d) (?=\d{3}\b)/g,'$1').replace(/×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(a,e)=>'e'+[...e].map(c=>sup[c]).join(''));
 return [...t.matchAll(/-?\d*\.?\d+(?:e-?\d+)?/gi)].map(m=>Number(m[0]));}
function leaves(v,out=[]){if(typeof v==='number')out.push(v);else if(Array.isArray(v))v.forEach(x=>leaves(x,out));else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v)){if(['answerScale','answerOffset','base','side','segment'].includes(k))continue;leaves(x,out);}return out;}
const near=(a,b)=>a===b||Math.abs(a-b)<=1e-9*Math.max(Math.abs(a),Math.abs(b));
const issues=[];let checked=0;
for(const q of qs){const text=(q.prompt||q.question||'');const pn=promptNumbers(text);
 const vals=[];for(const r of q.references||[])leaves(r.values,vals);
 const missing=[...new Set(vals)].filter(v=>v!==0&&v!==1&&!pn.some(p=>near(p,v)||near(Math.abs(p),Math.abs(v))||near(p*1000,v)||near(p/1000,v)||near(p*100,v)||near(p/100,v)||near(p*3600,v)||near(p/3600,v)||near(p*1e6,v)||near(p/1e6,v)||near(p*60,v)||near(p/60,v)));
 if(missing.length)issues.push({id:q.id,kind:'value-not-in-prompt',missing,prompt:text.slice(0,220)});
 const ans=(q.steps||[]).map(s=>String(s)).find(s=>/^Answer:/.test(s));
 if(ans&&Number.isFinite(q.expected)){const n=Number(ans.replace('Answer:','').trim().replace(/−/g,'-').split(' ')[0]);if(Number.isFinite(n)&&Math.abs(n-q.expected)>Math.max(q.tolerance||0,1e-6*Math.abs(q.expected)))issues.push({id:q.id,kind:'answer-step-mismatch',ans,expected:q.expected});}
 if(!(q.tolerance>0)&&!q._legacy)issues.push({id:q.id,kind:'tolerance',tolerance:q.tolerance});
 if(q.tolerance>0&&Number.isFinite(q.expected)&&q.expected!==0&&q.tolerance/Math.abs(q.expected)>0.05)issues.push({id:q.id,kind:'loose-tolerance',rel:q.tolerance/Math.abs(q.expected)});
 checked++;}
// difficulty order per chapter
const byCh={};for(const q of w.MT_PRACTICE_BANK.questions)(byCh[q.chapter]||=[]).push(q);
const counts=Object.fromEntries(Object.entries(byCh).map(([k,v])=>[k,v.length]));
const dupIds=qs.map(q=>q.id).filter((x,i,a)=>a.indexOf(x)!==i);
const dupPrompts=w.MT_PRACTICE_BANK.questions.map(q=>q.prompt).filter((x,i,a)=>a.indexOf(x)!==i);
console.log(JSON.stringify({checked,bank:w.MT_PRACTICE_BANK.questions.length,legacy:(w.MT_PRACTICE||[]).length,perChapter:counts,dupIds,dupPrompts,issues},null,1));
