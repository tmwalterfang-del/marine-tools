/* Actual core renderers and local calculator handlers, with unavailable external services. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{const dom=new JSDOM(read('index.html'),{url:'https://qa-test.marine-tools-frontend-preview.pages.dev/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
if(d.readyState==='loading')await new Promise(r=>d.addEventListener('DOMContentLoaded',r,{once:true}));
const errors=[];w.addEventListener('error',e=>{errors.push(e.message);e.preventDefault()});
// Background timers, idle work and layout are outside this deterministic DOM test.
w.setTimeout=()=>0;w.setInterval=()=>0;w.requestIdleCallback=()=>0;w.requestAnimationFrame=()=>0;
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};
w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
w.fetch=async()=>({ok:false,status:503,json:async()=>({error:'Synthetic unavailable service'}),text:async()=>'',headers:new Headers()});
Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});
w.__MARINE_TOOLS_PREVIEW_ISOLATED=true;
for(const p of ['privacy-policy.js','voyage-estimate-v861.js','voyage-planning-draft-v1.js','app.js'])w.eval(read(p));
d.dispatchEvent(new w.Event('DOMContentLoaded'));
const source=read('app.js'),registry=source.match(/const PAGE_RENDERERS=\{([^;]+)\};/)[1],pages=[...registry.matchAll(/'([^']+)':/g)].map(m=>m[1]),report={pages:[],calculators:[],errors};
for(const id of pages){w.__marineToolsOpenPage(id);const host=d.getElementById(id);assert(host?.classList.contains('active'),id+' activates');assert(host.textContent.trim().length>30,id+' renders');report.pages.push(id);}
for(const id of ['fuel','vessel-calcs','engineering','electrical','quick','navigation']){
 w.__marineToolsOpenPage(id);const host=d.getElementById(id);for(const button of host.querySelectorAll('.calc-action')){const card=button.closest('.tool-card');if(!card)continue;const output=card.querySelector('.result');if(!output)continue;const count=errors.length;button.click();assert.equal(errors.length,count,'Calculator error '+button.id);assert(output.textContent.trim().length>0,'No feedback from '+button.id);assert(!/\bNaN\b|\bInfinity\b/.test(output.textContent),'Non-finite displayed result '+button.id);report.calculators.push({page:id,button:button.id,result:output.textContent.slice(0,180)});}
}
for(let i=0;i<3;i++)await new Promise(resolve=>setImmediate(resolve));
assert.equal(errors.length,0,'Core DOM runtime errors');console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(root,'site-core-dom-audit.json'),JSON.stringify(report,null,2));w.close();
})().catch(e=>{console.error(e);process.exitCode=1});
