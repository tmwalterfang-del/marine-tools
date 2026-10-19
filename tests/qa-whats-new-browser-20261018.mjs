import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.resolve(process.env.QA_OUTPUT||'qa-artifacts/whats-new');
await fs.mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(path.relative(root,f).startsWith('..'))throw Error();if((await fs.stat(f)).isDirectory())f=path.join(f,'index.html');res.setHeader('content-type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream');res.end(await fs.readFile(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(8790,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM||chromium.executablePath(),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--disable-dev-shm-usage']});
const records=[];
try{for(const [width,height]of [[1920,1080],[1366,768],[1024,768],[768,1024],[390,844],[360,640]])for(const theme of ['dark','bridge']){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),record={width,height,theme,checks:[],errors:[]};
 await context.addInitScript(theme=>{if(!localStorage.getItem('mt.qa.release.seeded')){localStorage.setItem('mt.lastSeenReleaseBuild','20261013-v8-6-1');localStorage.setItem('mt.qa.release.sentinel','retained');localStorage.setItem('mt.qa.release.seeded','1');localStorage.setItem('mt.theme',JSON.stringify(theme));localStorage.setItem('mt.settings',JSON.stringify({usageAnalytics:false}));}},theme);
 await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
 const p=await context.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>record.errors.push(e.message));
 const check=(name,pass,actual)=>record.checks.push({name,status:pass?'PASS':'FAIL',actual});
 try{
  await p.goto('http://127.0.0.1:8790/',{waitUntil:'domcontentloaded'});await p.locator('#mtReleaseDialog[open]').waitFor();
  const subtitle=await p.locator('#mtReleaseSubtitle').innerText();check('New build automatically opens updated release',subtitle.includes('v8.7.0 · 2026-10-19')&&subtitle.includes('Updated since your last visit'),subtitle);
  const notes=await p.locator('#mtReleaseContent').innerText();check('Current notes describe changes without claiming live AIS acceptance',/Voyage Planning Lab/.test(notes)&&/AIS-unavailable/.test(notes)&&/reliability improvements/.test(notes),notes);
  await p.locator('#mtReleaseDone').scrollIntoViewIfNeeded();const metrics=await p.evaluate(()=>{const r=document.querySelector('#mtReleaseDialog').getBoundingClientRect(),b=document.querySelector('#mtReleaseDone').getBoundingClientRect();return{client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,dialog:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},button:{top:b.top,bottom:b.bottom},height:innerHeight};});
  check('Dialog and dismiss button fit viewport',metrics.scroll<=metrics.client+2&&metrics.dialog.left>=-2&&metrics.dialog.right<=width+2&&metrics.dialog.top>=-2&&metrics.dialog.bottom<=height+2&&metrics.button.top>=0&&metrics.button.bottom<=height+2,metrics);
  await p.getByRole('button',{name:'Got it',exact:true}).click();await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(1200);
  const remembered=await p.evaluate(()=>({open:!!document.querySelector('#mtReleaseDialog[open]'),seen:localStorage.getItem('mt.lastSeenReleaseBuild'),data:localStorage.getItem('mt.qa.release.sentinel')}));check('Seen build remembered and existing storage preserved',!remembered.open&&remembered.seen==='20261019-v8-7-0'&&remembered.data==='retained',remembered);
  if(await p.locator('#mobileMenu').isVisible())await p.locator('#mobileMenu').click();
  await p.getByRole('button',{name:"What's new v8.7.0",exact:true}).click();check('Manual What’s New remains available',await p.locator('#mtReleaseDialog').isVisible(),await p.locator('#mtReleaseSubtitle').innerText());
  await p.getByText('Previous releases',{exact:true}).click();check('Previous published release retained',await p.locator('.mt-release-history').getByText('v8.6.1 · Voyage Estimate & interface refinement',{exact:true}).isVisible(),'8.6.1 history entry');
 }catch(e){record.checks.push({name:'continuation',status:'BLOCKED',error:e.message});}
 if(record.checks.some(x=>x.status!=='PASS'))await p.screenshot({path:path.join(out,`FAIL-${width}-${theme}.png`),fullPage:true}).catch(()=>{});
 records.push(record);await context.close();
}}finally{await browser.close();server.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify({mode:'Actual local Chromium, controlled remote dependencies, no live deployment acceptance',records},null,2));}
const checks=records.flatMap(x=>x.checks);console.log(JSON.stringify({checks:checks.length,failures:checks.filter(x=>x.status!=='PASS').length,errors:records.flatMap(x=>x.errors)}));process.exitCode=checks.length!==72||checks.some(x=>x.status!=='PASS')||records.some(x=>x.errors.length)?1:0;
