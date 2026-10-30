/* Additional acceptance: real file round trips, invalid inputs, CSS zoom/reflow,
 * keyboard/resize and installed service-worker upgrade/offline behavior.
 * Access email identities and physical hardware are NOT simulated as verified.
 */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium',out=path.resolve('qa-education-'+engine,'acceptance');fs.mkdirSync(out,{recursive:true});
let swStage='current',privateFixture=false,browser,liveAccess={state:'NOT_RUN'};const checks=[],errors=[];
function check(value,label,detail={}){checks.push({ok:!!value,label,...detail});if(!value)console.log('FAIL '+label+' '+JSON.stringify(detail))}
const legacy="self.addEventListener('install',e=>e.waitUntil(caches.open('marine-tools-legacy-qa').then(c=>c.put('/legacy-secret',new Response('QA LEGACY MARKER'))).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));";
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(root+path.sep)&&file!==root)return res.writeHead(403).end();if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)&&!path.extname(file))file+='.html';if(!fs.existsSync(file))return res.writeHead(404).end();let data=fs.readFileSync(file);if(u.pathname==='/sw.js'){data=swStage==='legacy'?legacy:data.toString();if(privateFixture&&swStage!=='legacy')data=data.replace('test(self.location.hostname)',"test('qa.marine-tools-frontend-preview.pages.dev')");}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(data)});
async function snapshot(frame,id){return frame.evaluate(id=>{let s;if(window.MT_EXAMPLE_UI)s=MT_EXAMPLE_UI.snapshot();else if(window.MT_EXPLORER_UI)s=MT_EXPLORER_UI.snapshot();else if(window.MT_CARGO_UI)s=MT_CARGO_UI.snapshot();else if(window.MT_MOLLIER_SNAPSHOT)s=MT_MOLLIER_SNAPSHOT();else if(window.MT_EDUCATION_SNAPSHOT)s=MT_EDUCATION_SNAPSHOT();else s=MT_LAB_SNAPSHOT(id);return {inputs:s.inputs,results:s.results}},id)}
async function fileDownload(page,frame,selector,name){await frame.locator(selector).evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true});const pending=page.waitForEvent('download');await frame.locator(selector).click();const d=await pending,p=path.join(out,name);await d.saveAs(p);return p}
async function openInputs(frame){const d=frame.locator('details.teaching-inputs:visible').first();if(await d.count()&&await d.getAttribute('open')===null)await d.locator(':scope > summary').click()}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true,serviceWorkers:'block'});
 await context.route('**/*',r=>{if(r.request().url().startsWith(base)||r.request().url().startsWith('blob:'))return r.continue();return r.abort()});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/students/interactive.html');
 const modules=await page.locator('#module-list a').evaluateAll(a=>a.map(x=>x.hash.slice(1)));
 for(const id of modules){
  console.log('ACCEPTANCE '+engine+'/'+id);await page.selectOption('#module-quick',id);
  await page.waitForFunction(id=>document.getElementById('selected-title').textContent===document.querySelector('#module-list a[href="#'+id+'"]').textContent,id);
  const h=await page.locator('#frames iframe:not([hidden])').elementHandle(),f=await h.contentFrame();await f.waitForSelector('svg path,svg polyline,svg polygon',{state:'attached'});await openInputs(f);
  const engineering=await f.evaluate(()=>!!window.MT_EDUCATION_SNAPSHOT),lab=['stability','controls','engine'].includes(id),mollier=id==='mollier';
  const inputSel=mollier?'#pressure-number':lab?(id==='controls'?'#signal-form input[type=number]':'#'+id+'-form input[type=number]'):id==='cargo'?'#cargo-form input[name=displacement]':id==='faults'?'#experiment input[name=flow]':'#experiment input[type=number]';
  const input=f.locator(inputSel).first(),initial=Number(await input.inputValue()),changed=mollier?12:initial===0?1:initial*1.01;
  await input.fill(String(changed));await input.dispatchEvent('change');const expected=await snapshot(f,id);check(Object.keys(expected.results).length>0,'changed inputs calculate/'+id);
  if(id==='trim'){const mass=500,tpc=30,mct=150,lcf=70,lcg=100,L=changed;const r=expected.results;check(Math.abs(r['Forward draft (m)']-(6+mass/tpc/100-(-mass*(lcg-lcf)/mct/100)*(L-lcf)/L))<1e-10,'independent trim input-to-result reference')}
  const other=id==='trim'?'crank':'trim';await page.selectOption('#module-quick',other);await page.selectOption('#module-quick',id);check(await input.inputValue()===String(changed),'module switch preserves changed input/'+id);
  const jsonSel=engineering?'[data-model-save=json]':mollier?'#export-scenario':lab?'#report-json':'[data-save=json]',htmlSel=engineering?'[data-model-save=html]':mollier?'#export-report':lab?'#report-html':'[data-save=html]',fileSel=engineering?'#model-scenario':mollier?'#mollier-scenario':lab?'#scenario-file':'#scenario';
  const jsonPath=await fileDownload(page,f,jsonSel,id+'.json'),htmlPath=await fileDownload(page,f,htmlSel,id+'.html');
  const saved=JSON.parse(fs.readFileSync(jsonPath,'utf8')),html=fs.readFileSync(htmlPath,'utf8'),embedded=JSON.parse(html.match(/id="study-snapshot">([\s\S]*?)<\/script>/)[1]);
  check(saved.schema==='marine-tools-study-scenario'&&JSON.stringify(embedded.inputs)===JSON.stringify(expected.inputs)&&JSON.stringify(embedded.results)===JSON.stringify(expected.results),'actual scenario/report download matches calculation/'+id);
  await input.fill(String(mollier?15:changed*1.02||2));await input.dispatchEvent('change');await f.locator(fileSel).setInputFiles(jsonPath);
  await f.waitForFunction(({id,expected})=>{try{const s=window.MT_EXAMPLE_UI?.snapshot()||window.MT_EXPLORER_UI?.snapshot()||window.MT_CARGO_UI?.snapshot()||window.MT_MOLLIER_SNAPSHOT?.()||window.MT_EDUCATION_SNAPSHOT?.()||window.MT_LAB_SNAPSHOT(id);return JSON.stringify({inputs:s.inputs,results:s.results})===JSON.stringify(expected)}catch{return false}},{id,expected});
  check(JSON.stringify(await snapshot(f,id))===JSON.stringify(expected),'file-picker scenario restore recomputes same result/'+id);
  for(const invalid of ['', '1e308']){await input.fill(invalid);await input.dispatchEvent('change');let blocked=false;try{await snapshot(f,id)}catch{blocked=true}check(blocked,'invalid input blocks export snapshot/'+id+'/'+(invalid||'empty'));}
  for(const edge of ['0','-1']){await input.fill(edge);await input.dispatchEvent('change');let blocked=false;try{await snapshot(f,id)}catch{blocked=true}const allowed=edge==='0'?['crank','faults','finance','current','controls'].includes(id):['crank','controls'].includes(id);check(blocked!==allowed,'zero/negative respects module domain/'+id+'/'+edge);}
  await f.locator(fileSel).setInputFiles(jsonPath);await f.waitForFunction(()=>[...document.querySelectorAll('[role=alert],.error')].every(e=>e.hidden||!e.getBoundingClientRect().height));
  const malformed=Buffer.from(JSON.stringify({...saved,model:'wrong-module'}));await f.locator(fileSel).setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:malformed});
  await f.waitForFunction(()=>[...document.querySelectorAll('#feedback,#export-feedback,#report-feedback,#model-feedback')].some(x=>/Choose a version 1 scenario/.test(x.textContent)));
  check(JSON.stringify(await snapshot(f,id))===JSON.stringify(expected),'wrong-module import preserves valid data/'+id);
 }
 // CSS zoom is explicitly separate from native Windows Firefox zoom.
 for(const id of ['trim','crank'])for(const zoom of [1.25,1.5,2]){
  await page.goto(base+'/students/examples.html#'+id);await page.locator('#presentation-toggle').click();await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const m=await page.evaluate(()=>({w:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));check(m.scroll<=m.w+2,'CSS zoom horizontal reflow/'+id+'/'+zoom,m);
  await page.locator('#chart').scrollIntoViewIfNeeded();check(await page.locator('#module-description').isVisible()&&await page.locator('#chart').isVisible(),'zoom preserves description and chart/'+id+'/'+zoom);
  const numbers=await page.locator('.metric strong.teaching-numeric-result').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent.trim(),width:n.clientWidth,scroll:n.scrollWidth,nowrap:getComputedStyle(n).whiteSpace==='nowrap'})));check(numbers.length>0&&numbers.every(n=>n.nowrap&&n.scroll<=n.width+1),'zoom keeps numeric results intact and inside cards/'+id+'/'+zoom,{numbers});
  await page.screenshot({path:path.join(out,'zoom-'+id+'-'+zoom+'.png')});await page.locator('#presentation-toggle').press('Escape');check(await page.locator('#presentation-toggle').getAttribute('aria-pressed')==='false','keyboard Escape after zoom/'+id+'/'+zoom);
  await page.evaluate(()=>document.documentElement.style.zoom='1');
 }
 await page.goto(base+'/students/examples.html#trim');await page.locator('#presentation-toggle').click();
 for(const [width,height]of [[2048,774],[900,600],[390,844],[844,390],[1440,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const m=await page.evaluate(()=>({w:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));check(m.scroll<=m.w+2,'active presentation resize/'+width+'x'+height,m)}
 await context.close();
 if(engine==='chromium'){
  // Anonymous read only: no cookies, email submissions or authentication tokens.
  try{const response=await fetch('https://feature-for-students-formula.marine-tools-frontend-preview.pages.dev/students/',{redirect:'manual',signal:AbortSignal.timeout(15000)}),location=response.headers.get('location');
   if(location){const u=new URL(location,response.url);liveAccess={state:u.hostname.endsWith('.cloudflareaccess.com')?'ACCESS_LOGIN_REDIRECT_OBSERVED':'OTHER_REDIRECT',status:response.status,host:u.hostname,path:u.pathname};}
   else{const body=await response.text(),exposed=response.status===200&&body.includes('id="formula-grid"');liveAccess={state:exposed?'UNAUTHENTICATED_CONTENT_RECEIVED':response.status===200&&/cloudflare access|send.*login.*code/i.test(body)?'ACCESS_LOGIN_PAGE_OBSERVED':'BLOCKED_OR_INCONCLUSIVE',status:response.status};check(!exposed,'anonymous request does not receive protected Education HTML');}
  }catch(e){liveAccess={state:'BLOCKED_OR_INCONCLUSIVE',reason:e.name};}
 }
 if(engine==='chromium')for(const privateMode of [true,false]){
  swStage='legacy';privateFixture=privateMode;const c=await browser.newContext({serviceWorkers:'allow'}),p=await c.newPage();const workerErrors=[];p.on('pageerror',e=>workerErrors.push(e.message));p.on('requestfailed',r=>workerErrors.push(r.url()+' '+r.failure()?.errorText));
  await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await p.goto(base+'/students/labs.html#engine');
  await p.evaluate(()=>navigator.serviceWorker.register('/sw.js'));await p.waitForFunction(()=>navigator.serviceWorker.controller);await p.waitForFunction(async()=>!!(await caches.match('/legacy-secret')));
  await p.locator('#engine-form input[name=rpm]').fill('800');await p.locator('#engine-form input[name=rpm]').dispatchEvent('change');
  const stored=await p.evaluate(()=>localStorage.getItem('mt-student-labs-v1'));swStage='current';
  await p.evaluate(async()=>{
   const r=await navigator.serviceWorker.getRegistration(),before=r.active;
   const found=new Promise(resolve=>r.addEventListener('updatefound',()=>resolve(r.installing),{once:true}));
   await r.update();let w=r.installing||r.waiting;
   if(!w&&r.active!==before)return;if(!w)w=await found;
   await new Promise((resolve,reject)=>{const state=()=>{if(w.state==='activated')resolve();else if(w.state==='redundant')reject(Error('Worker installation failed'));else if(w.state==='installed')w.postMessage({type:'SKIP_WAITING'})};w.addEventListener('statechange',state);state()});
  });
  await p.waitForFunction(async()=>!(await caches.keys()).includes('marine-tools-legacy-qa'));
  check(await p.evaluate(()=>localStorage.getItem('mt-student-labs-v1'))===stored,'service worker upgrade preserves stored lab inputs/'+privateMode);
  await p.reload();await p.waitForSelector('#engine-form input[name=rpm]');check(await p.locator('#engine-form input[name=rpm]').inputValue()==='800','stored lab restores after reload/'+privateMode);
  const baseline=await p.evaluate(async()=>({controller:navigator.serviceWorker.controller?.scriptURL,cache:await Promise.all((await caches.keys()).map(async k=>({key:k,urls:(await(await caches.open(k)).keys()).map(r=>r.url)})))}));
  console.log('WORKER BASELINE '+privateMode+' '+JSON.stringify(baseline));
  await c.setOffline(true);let navigationError='';await p.goto(base+'/students/').catch(e=>navigationError=e.message);
  if(privateMode){check((await p.locator('body').innerText()).includes('Private preview requires an internet connection'),'private preview refuses offline navigation');check((await p.evaluate(()=>caches.keys())).filter(k=>k.startsWith('marine-tools-')).length===0,'private preview removes legacy app caches');}
  else{try{await p.waitForSelector('#formula-grid .formula-card',{timeout:10000})}catch(e){const diagnostic=await p.evaluate(async()=>({url:location.href,title:document.title,body:document.body?.innerText.slice(0,1000),formulas:window.MT_FORMULAS?.length,study:!!window.MT_STUDY,review:window.MT_STUDY?.expressionReview,controller:navigator.serviceWorker?.controller?.scriptURL,caches:typeof caches==='undefined'?[]:await Promise.all((await caches.keys()).map(async k=>({key:k,urls:(await(await caches.open(k)).keys()).map(r=>r.url)})))}));diagnostic.errors=workerErrors;diagnostic.baseline=baseline;diagnostic.navigationError=navigationError;fs.writeFileSync(path.join(out,'worker-diagnostics.json'),JSON.stringify(diagnostic,null,2));await p.screenshot({path:path.join(out,'worker-offline.png')});throw Error('Offline library failed: '+JSON.stringify(diagnostic));}check(await p.locator('#formula-grid .formula-card').count()>0,'public app library opens offline');check(await p.evaluate(()=>window.MT_STUDY.expressionReview.openModels)===6,'offline library includes current analytical review');}
  await c.close();
 }
})().catch(e=>{errors.push(e.stack||String(e))}).finally(async()=>{if(browser)await browser.close();await new Promise(r=>server.close(r));const summary={engine,tests:checks.length,failures:checks.filter(x=>!x.ok).length,errors,liveAccess,scope:'Local checkout; actual headless engines and downloads. CSS zoom, not native OS zoom. Preview hostname selected in local service-worker fixture; not a Cloudflare identity test.',checks};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({engine,tests:summary.tests,failures:summary.failures,errors,liveAccess}));if(summary.failures||errors.length)process.exitCode=1});
