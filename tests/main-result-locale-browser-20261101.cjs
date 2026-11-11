/* Display localization must preserve calculations, pending edits, saved records
 * and machine exports. Real browser checks; external providers are unavailable. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
const storage=()=>Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('mt.')&&k!=='mt.locale.v1').sort().map(k=>[k,localStorage.getItem(k)]));
const fields=()=>[...document.querySelectorAll('input,select,textarea')].filter(x=>!x.matches('[data-mt-locale],#workspace-language')).map(x=>[x.id,x.value,x.checked]);
const results=()=>Object.fromEntries([...document.querySelectorAll('.result[data-main-result]')].map(x=>[x.id,x.innerHTML]));
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch(engine==='chromium'&&process.env.STUDENTS_BROWSER_EXECUTABLE?{executablePath:process.env.STUDENTS_BROWSER_EXECUTABLE}:{});
 const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:true}),p=await context.newPage(),errors=[];
 await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());p.on('pageerror',e=>errors.push(e.message));
 await p.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));
 let clicks=0;
 for(const page of ['fuel','engineering','electrical','vessel-calcs','quick','weather','navigation']){
  await p.goto(base+'/index.html?page='+page);await p.locator('article.tool-card').first().waitFor({state:'attached'});await p.evaluate(()=>MT_I18N.ready);
  await p.evaluate(()=>MT_I18N.set('en'));
  if(page==='navigation')await p.locator('#calcBearing855').waitFor({state:'attached'});
  // Navigation and weather editors are enhanced after the base page is rendered.
  await p.waitForTimeout(200);
  clicks+=await p.evaluate(async()=>{let n=0;for(const button of document.querySelectorAll('article.tool-card button[id^=calc],#findWindow,#fuelRouteBtn')){if(button.disabled)continue;button.click();n++;await new Promise(r=>setTimeout(r,25));}return n;});
  // Let history callbacks finish before checking that a language switch writes nothing.
  await p.waitForTimeout(100);
  const en=await p.evaluate(results),raw=await p.evaluate(storage),values=await p.evaluate(fields);
  await p.evaluate(()=>MT_I18N.set('nb'));
  const nb=await p.evaluate(results);
  assert.deepEqual(await p.evaluate(fields),values,page+' preserves inputs EN→NB');
  assert.deepEqual(await p.evaluate(storage),raw,page+' does not migrate or append records EN→NB');
  assert.deepEqual(Object.keys(nb),Object.keys(en),page+' retains result panels');
  assert(!/\bNaN\b|undefined|Infinity|\[object /.test(Object.values(nb).join('')),page+' valid localized output');
  assert(!/\b(?:usable|held as reserve|Destination check|Crosswind|Assumes constant|consecutive rows|required operating|approximate range)\b/.test(Object.values(nb).join('')),page+' no English result prose');
  if(page==='fuel')assert.match(nb.resRob,/30,4 m³ tilgjengelig · 7,2 døgn/);
  if(page==='navigation')assert.match(nb.resBearing855,/Målposisjon/);
  if(page==='weather')assert.match(nb.wwResult,/sammenhengende rader/);
  await p.evaluate(()=>MT_I18N.set('en'));
  assert.deepEqual(await p.evaluate(results),en,page+' restores exact English HTML without recalculation');
  assert.deepEqual(await p.evaluate(storage),raw,page+' records unchanged NB→EN');
 }
 // Pending edits stay separate from the last calculated result, including focus.
 await p.goto(base+'/index.html?page=fuel');await p.evaluate(()=>MT_I18N.ready);await p.locator('#calcRob').click();await p.waitForTimeout(50);
 const calculated=await p.locator('#resRob').innerText();await p.locator('#rob').fill('1000,5');await p.locator('#rob').focus();
 await p.evaluate(()=>MT_I18N.set('nb'));
 assert.equal(await p.locator('#rob').inputValue(),'1000,5');assert.equal(await p.evaluate(()=>document.activeElement.id),'rob');assert.match(await p.locator('#resRob').innerText(),/30,4/);
 await p.evaluate(()=>MT_I18N.set('en'));assert.equal(await p.locator('#resRob').innerText(),calculated);
 await p.locator('#calcRob').click();await p.waitForTimeout(50);await p.evaluate(()=>MT_I18N.set('nb'));assert.match(await p.locator('#resRob').innerText(),/800,4/);
 // Negative, zero and large results use the same precision and arithmetic.
 await p.evaluate(()=>{__marineToolsOpenPage('quick');document.getElementById('unitVal').value='-1234.5';document.getElementById('unitType').value='nm-km';document.getElementById('calcUnit').click();});
 assert.match(await p.locator('#resUnit').innerText(),/−2\s?286,294 km/);
 await p.evaluate(()=>{document.getElementById('unitVal').value='0';document.getElementById('calcUnit').click();});assert.equal((await p.locator('#resUnit strong').innerText()).trim(),'0,000 km');
 // Settle the deferred calculation record before seeding historical data.
 await p.waitForFunction(()=>JSON.parse(localStorage.getItem('mt.history')||'[]').some(x=>x.title==='Unit converter'&&/^0[,\.]000 km/.test(x.result)));
 // Saved text is immutable, including English text and decimals already stored.
 const old={title:'Old fuel result 12.50',page:'fuel',time:'2026-10-30T12:00:00Z',inputs:['Notes: user 12.50'],result:'12.50 m³ usable · 2.5 days'};
 // Seed at the start of the next document (once), so a deferred record from the previous page cannot land on top of it.
 await p.addInitScript(old=>{if(!sessionStorage.getItem('mt-test-history-seeded')){sessionStorage.setItem('mt-test-history-seeded','1');localStorage.setItem('mt.history',JSON.stringify([old]))}},old);
 await p.goto(base+'/index.html?page=home',{waitUntil:'domcontentloaded'});await p.evaluate(()=>MT_I18N.ready);
 await p.evaluate(()=>MT_I18N.set('nb'));assert.match(await p.locator('#historyHome').textContent(),/12\.50 m³ usable · 2\.5 days/);
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('mt.history'))),[old]);
 // New history stores the visible result once; switching language adds no entry.
 await p.evaluate(()=>__marineToolsOpenPage('fuel'));await p.waitForTimeout(200);
 await p.evaluate(old=>{localStorage.setItem('mt.history',JSON.stringify([old]));document.getElementById('calcRob').click();},old);await p.waitForFunction(()=>JSON.parse(localStorage.getItem('mt.history')||'[]').some(x=>x.result.includes('tilgjengelig')));
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('mt.history')));const robRecords=saved.filter(x=>x.title==='Fuel ROB & endurance');assert.equal(robRecords.length,1,JSON.stringify(saved));assert.match(robRecords[0].result,/tilgjengelig/);assert.deepEqual(saved.find(x=>x.title===old.title),old);
 await p.evaluate(()=>MT_I18N.set('en'));assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('mt.history'))),saved);
 // Exercise an actual saved consumption draft: raw quantities and ID are not recipes.
 await p.evaluate(()=>{document.getElementById('consPrevious').value='100';document.getElementById('consCurrent').value='107,3';document.getElementById('consDate').value='2026-11-01';document.getElementById('saveConsumption').click();});
 const draft=await p.evaluate(()=>JSON.parse(localStorage.getItem('mt.consumption')).at(-1));assert.equal(typeof draft.id,'string');assert.match(draft.id,/^c\d+$/);assert.equal(typeof draft.m3,'number');assert(Math.abs(draft.m3-7.3)<1e-10);
 // Compare complete downloaded bytes in both languages, using fixed timestamps.
 await p.evaluate(()=>{localStorage.setItem('mt.bunkHistory',JSON.stringify([{id:'raw-b1',date:'2026-10-30',grade:'User fuel 12.50',volume:12.5,density:840.5,massKg:10506.25,supplier:'Supplier text',reference:'ABC-12.50',notes:'User notes 12.50'}]));});
 async function download(id){const event=p.waitForEvent('download');await p.locator('#'+id).evaluate(x=>x.click());const d=await event;return fs.readFileSync(await d.path(),'utf8');}
 const exports={};
 for(const locale of ['en','nb']){await p.evaluate(locale=>MT_I18N.set(locale),locale);await p.evaluate(()=>__marineToolsOpenPage('fuel'));const consumption=await download('exportConsumption'),bunkering=await download('exportBunkHistory');await p.evaluate(()=>__marineToolsOpenPage('settings'));exports[locale]={consumption,bunkering,backup:await download('exportData')};}
 assert.deepEqual(exports.nb,exports.en,'CSV and backup JSON bytes unchanged by display language');assert.match(exports.nb.bunkering,/12\.5/);assert.match(exports.nb.bunkering,/User notes 12\.50/);
 // Dynamic Education explanations keep their numeric identity in both languages.
 for(const[id,phrase]of [['add-kg','Opprinnelig moment'],['trim-change','Trimmoment'],['voyage-fuel','Seilingstid'],['battery-runtime','Varighet'],['engine-displacement','Omregn mm til m']]){
  await p.goto(base+'/students/#calculator/'+id);await p.waitForFunction(id=>document.getElementById('calc-selector')?.value===id,id);await p.evaluate(()=>MT_I18N.ready);await p.evaluate(()=>MT_I18N.set('en'));
  const enSteps=await p.locator('#calc-steps').textContent(),values=await p.locator('#calc-fields input').evaluateAll(xs=>xs.map(x=>x.value));
  await p.evaluate(()=>MT_I18N.set('nb'));const nbSteps=await p.locator('#calc-steps').textContent();assert(nbSteps.includes(phrase),id+' Norwegian working');if(id==='add-kg'){assert.match(nbSteps,/60\s000 tm/);assert.match(nbSteps,/10\s500/);assert(!nbSteps.includes('60,000'),'Norwegian working must not use an ambiguous English thousands separator');}assert.deepEqual(await p.locator('#calc-fields input').evaluateAll(xs=>xs.map(x=>x.value)),values);
  await p.evaluate(()=>MT_I18N.set('en'));assert.equal(await p.locator('#calc-steps').textContent(),enSteps,id+' exact English working restored');
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({engine,status:'PASS',calculationClicks:clicks,educationExplanations:5,checks:'EN/NB roundtrip, pending edits, focus, history, raw draft, CSV and JSON bytes'}));
 await context.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
