const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',root=process.cwd(),out=path.resolve('qa-education-'+engine,'sessions');
const groups={examples:['lifting','trim','tank','pump','crank','faults'],explorers:['rlc','heat','current','finance'],labs:['stability','controls','engine'],cargo:['cargo'],mollier:['mollier']};
let browser,server,checks=0;const errors=[];function ok(v,m){assert.ok(v,m);checks++}
(async()=>{
 fs.mkdirSync(out,{recursive:true});server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const[group,ids]of Object.entries(groups))for(const id of ids){
  console.log('SESSION '+engine+'/'+id);await page.goto(base+'/students/'+group+'.html#'+id);await page.waitForFunction(()=>!!window.MT_STUDY_DRAFT);
  await page.evaluate(()=>{for(const d of document.querySelectorAll('details.teaching-inputs'))d.open=true});
  const svg=page.locator('main svg[viewBox]:visible').first(),original=await svg.getAttribute('viewBox');
  await svg.locator('xpath=preceding-sibling::div[contains(@class,"diagram-tools")]').getByRole('button',{name:'Zoom +',exact:true}).click();
  ok(await svg.getAttribute('viewBox')!==original,'Zoom changes view '+id);await svg.focus();await svg.press('+');ok(await svg.evaluate(s=>s.MT_DIAGRAM_VIEW.scale)>2,'Keyboard zoom '+id);
  const pan=svg.locator('xpath=preceding-sibling::div[contains(@class,"diagram-tools")]').getByRole('button',{name:'Pan / pinch',exact:true});await pan.click();await svg.scrollIntoViewIfNeeded();const b=await svg.boundingBox(),before=await svg.getAttribute('viewBox');await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.5+35,b.y+b.height*.5+20,{steps:5});await page.mouse.up();ok(await svg.getAttribute('viewBox')!==before,'Pointer pan '+id);
  ok(await svg.evaluate(s=>MT_STUDY_EXPORT.svgSnapshot(s).includes('viewBox="'+s.dataset.studyOriginalViewBox+'"')),'Export contains complete diagram '+id);
  await svg.focus();await svg.press('Escape');ok(await pan.getAttribute('aria-pressed')==='false','Escape exits pan '+id);await svg.press('0');ok(await svg.getAttribute('viewBox')===original,'Reset view '+id);
  ok(await page.locator('details.study-extra').count()>0,'Supplementary sections compact '+id);
  if(group==='cargo'){await page.locator('#add-operation').click();await page.locator('#operations tr:last-child [data-key=name]').fill('Restored cargo operation');}
  const selector=group==='mollier'?'#pressure-number':group==='labs'?'#'+id+' input[type=number]':group==='cargo'?'#cargo-form input[type=number]':'#experiment input[type=number]';const input=page.locator(selector).first();
  await input.fill(group==='mollier'?'12':'');await input.dispatchEvent('change');const expected=await page.evaluate(()=>JSON.stringify(MT_STUDY_DRAFT.capture()));
  await page.waitForFunction(expected=>{const record=JSON.parse(localStorage.getItem(MT_STUDY_DRAFT.key)||'null');return JSON.stringify(record?.data)===expected},expected);
  await page.reload();await page.waitForFunction(()=>!!window.MT_STUDY_DRAFT);ok(await page.evaluate(()=>JSON.stringify(MT_STUDY_DRAFT.capture()))===expected,'Reload restores raw draft '+id);
  if(group!=='mollier')ok(await page.locator('.error:visible,[role=alert]:visible').count()>0,'Unfinished draft remains invalid '+id);
  if(group==='cargo')ok(await page.locator('#operations tr').count()===3,'Cargo operation count restored');
  await page.evaluate(()=>{Object.defineProperty(navigator,'onLine',{configurable:true,value:false});dispatchEvent(new Event('offline'))});ok(await page.locator('.study-connectivity').getAttribute('data-offline')==='true','Offline status '+id);
 }
 await page.locator('.study-session button').click();ok(await page.evaluate(()=>!Object.keys(localStorage).some(k=>k.startsWith('mt.study.draft.v1:'))),'Clear all study drafts');await page.locator('.study-session input').uncheck();await page.reload();ok(!await page.locator('.study-session input').isChecked(),'Saving preference survives reload');
 await page.screenshot({path:path.join(out,'mollier-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mollier-mobile.png'),fullPage:true});ok(errors.length===0,'No browser errors: '+errors.join('; '));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',engine,checks,modules:15,errors},null,2));console.log(JSON.stringify({status:'PASS',engine,checks,modules:15}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
