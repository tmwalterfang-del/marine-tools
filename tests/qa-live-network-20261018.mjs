// Real deployed Pages/Worker traffic, native browser Origin and credentials.
// No cookie import/export, raw HAR, tokens, request bodies or URL queries saved.
import fs from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
if(!process.env.QA_URL)throw Error('Set QA_URL to the deployment confirmed for the tested SHA');
const target=new URL(process.env.QA_URL);
if(target.protocol!=='https:'||!/^[a-z0-9-]+\.marine-tools-frontend-preview\.pages\.dev$/i.test(target.hostname))throw Error('A confirmed Marine Tools QA Pages URL is required');
const API='https://feature-qa-integrated-preview-20261015.api.marinetools.app';
const out=path.resolve(process.env.QA_OUTPUT||'qa-artifacts/live-network');await fs.mkdir(out,{recursive:true});
const report={url:target.origin,mode:'Real deployed app, native browser Origin; no forged headers, response fixtures or imported sessions',checks:[],requests:[],responses:[],pageErrors:[],blockedProductionAttempts:[]};
const safe=u=>{try{const x=new URL(u);return x.origin+x.pathname;}catch{return'unknown';}};
const clean=s=>String(s).replace(/https?:\/\/[^\s)]+/g,safe);
const browser=await chromium.launch({headless:process.env.QA_INTERACTIVE!=='1',executablePath:process.env.QA_CHROMIUM||chromium.executablePath(),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'block'});
const pending=[];const page=await context.newPage();page.setDefaultTimeout(12000);
context.on('request',r=>report.requests.push({url:safe(r.url()),method:r.method()}));
context.on('response',r=>{if(new URL(r.url()).origin!==API)return;pending.push((async()=>{const headers={};for(const key of ['content-type','x-marine-tools-environment','x-marine-tools-analytics','x-marine-tools-ais-provider','access-control-allow-origin','access-control-allow-credentials','vary']){const value=await r.headerValue(key);if(value!==null)headers[key]=value;}report.responses.push({url:safe(r.url()),method:r.request().method(),status:r.status(),headers});})());});
page.on('pageerror',e=>report.pageErrors.push(clean(e.message)));
await context.route('https://api.marinetools.app/**',r=>{report.blockedProductionAttempts.push({url:safe(r.request().url()),method:r.request().method()});return r.abort();});
const check=(name,pass,actual)=>report.checks.push({name,status:pass?'PASS':'FAIL',actual});
try{
 let response=await page.goto(target.href,{waitUntil:'domcontentloaded',timeout:30000});
 if(process.env.QA_INTERACTIVE==='1'){
  const readline=await import('node:readline/promises');const prompt=readline.createInterface({input:process.stdin,output:process.stdout});
  await prompt.question('Complete authorized login in this browser, then press Enter. Do not enter credentials in this terminal. ');prompt.close();
 }
 if(!await page.getByRole('heading',{name:'Marine Tools',exact:true}).isVisible()){
  report.checks.push({name:'Authenticated deployed frontend',status:'BLOCKED',httpStatus:response?.status(),reason:'Application unavailable in this browser; no login bypass attempted'});
 }else{
  check('Deployed frontend loaded',true,{status:response?.status(),title:await page.title()});
  const got=page.getByRole('button',{name:'Got it',exact:true});await page.waitForTimeout(1000);if(await got.isVisible())await got.click();
  const tests=await page.evaluate(async api=>{
   const result=[];
   for(const [name,route,method,expected]of [['isolation','/api/preview-isolation','GET',200],['health','/api/health','GET',200],['auth','/api/auth/status','GET',200],['admin rejected','/admin/api/analytics','GET',403],['analytics rejected','/api/analytics/event','POST',403],['writes rejected','/api/health','POST',405],['unknown path rejected','/api/qa-unknown-endpoint','GET',404]]){
    try{const response=await fetch(api+route,{method,credentials:'include',cache:'no-store',...(method==='POST'?{headers:{'content-type':'text/plain'},body:'{"event":"qa_invalid_event_do_not_store"}'}:{})});const body=await response.json();result.push({name,status:response.status,expected,body});}
    catch{result.push({name,expected,error:'Native browser fetch failed; inspect Access/CORS/network without bypassing it'});}
   }
   return result;
  },API);
  for(const t of tests){
   if(t.error){report.checks.push({name:t.name,status:'BLOCKED',reason:t.error});continue;}
   const bodyOk=t.name!=='isolation'||t.body.environment==='preview'&&t.body.analyticsWrites===false&&t.body.analyticsQueries===false;
   check(t.name,t.status===t.expected&&bodyOk,t);
  }
  await page.locator('#sidebar button[data-page="live-experimental"]').click();await page.getByRole('button',{name:'Open Route Intelligence',exact:true}).click();await page.locator('#riMap.leaflet-container').waitFor();
  const map=page.locator('#riMap');await map.click();await map.press('ArrowRight');await map.click();await page.getByRole('button',{name:'Run analysis',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#riDataAge').textContent.includes('LOADING'));
  report.routeSummary=await page.evaluate(()=>({ais:document.querySelector('#riAis').innerText,cpa:document.querySelector('#riCpa').innerText,status:document.querySelector('#riDataAge').innerText}));
  await page.waitForTimeout(500);await Promise.allSettled(pending);
  const isolation=report.responses.filter(r=>r.url===API+'/api/preview-isolation');
  check('Raw preview isolation headers',isolation.some(r=>r.headers['x-marine-tools-environment']==='preview'&&r.headers['x-marine-tools-analytics']==='disabled'&&r.headers['access-control-allow-origin']===target.origin&&r.headers['access-control-allow-credentials']==='true'&&/Origin/i.test(r.headers.vary||'')),isolation);
  const ais=report.responses.filter(r=>r.url===API+'/api/ais/latest');check('Actual AIS request observed',ais.length>0,ais);
  check('No production API attempt',report.blockedProductionAttempts.length===0,report.blockedProductionAttempts);
  const preconnects=await page.locator('link[rel="preconnect"]').evaluateAll(xs=>xs.map(x=>x.href));check('No production preconnect',!preconnects.some(u=>u.startsWith('https://api.marinetools.app')),preconnects);
  check('No uncaught page errors',report.pageErrors.length===0,report.pageErrors);
 }
}catch(e){report.checks.push({name:'Live continuation',status:'BLOCKED',reason:clean(e.message)});}
finally{await Promise.allSettled(pending);await browser.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2));}
const failed=report.checks.some(x=>x.status==='FAIL'),blocked=report.checks.some(x=>x.status==='BLOCKED');
console.log(JSON.stringify({result:failed?'FAIL':blocked?'BLOCKED':'PASS',checks:report.checks.length,output:path.join(out,'results.json')}));process.exitCode=failed?1:blocked?2:0;
