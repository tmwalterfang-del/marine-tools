import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import worker from '../worker/worker-v860-dashboard.js';
const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://qa-emulation.marine-tools-frontend-preview.pages.dev',api='https://feature-qa-integrated-preview-20261015.api.marinetools.app';
const out=path.resolve(process.env.QA_OUTPUT||'qa-artifacts/audit-harness');await fs.mkdir(out,{recursive:true});
globalThis.fetch=()=>{throw Error('Unexpected upstream request blocked in local fixture');};
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM||chromium.executablePath(),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--disable-dev-shm-usage']});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await context.route('**/*',async route=>{
 const request=route.request(),u=new URL(request.url());
 if(u.origin===origin){try{let f=path.resolve(root,'.'+u.pathname);if(path.relative(root,f).startsWith('..'))throw Error();if((await fs.stat(f)).isDirectory())f=path.join(f,'index.html');return route.fulfill({contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream',body:await fs.readFile(f)});}catch{return route.fulfill({status:404,body:'Not found'});}}
 if(u.origin===api){const response=await worker.fetch(new Request(u,{method:request.method(),headers:request.headers(),...(request.postData()?{body:request.postData()}:{} )}),{},{});return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});}
 return route.abort();
});
let summary;
try{
 await page.goto(origin+'/tests/qa-live-audit.html');await page.getByRole('button',{name:'Run API guard checks',exact:true}).click();
 await page.waitForFunction(()=>{try{return JSON.parse(document.querySelector('#auditSummary').textContent).checks.length===8;}catch{return false;}});
 await page.waitForFunction(()=>JSON.parse(document.querySelector('#auditSummary').textContent).workerResponses>=3);
 summary=JSON.parse(await page.locator('#auditSummary').innerText());
 summary.localHarnessResult=summary.checks.every(x=>x.status==='PASS')&&summary.productionAttempts===0&&summary.workerResponses>=3&&!errors.length?'PASS':'FAIL';
 summary.scope='Actual Chromium with full app and actual Worker chain fulfilled locally at a simulated preview origin. Not live network acceptance.';
 summary.pageErrors=errors;
}catch(e){summary={localHarnessResult:'BLOCKED',error:e.message,pageErrors:errors};}
finally{await browser.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify(summary,null,2));}
console.log(JSON.stringify(summary));process.exitCode=summary.localHarnessResult==='PASS'?0:1;
