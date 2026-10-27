const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',root=process.cwd(),out=path.resolve('qa-education-'+engine,'worked-examples');
let browser,server;const errors=[];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch(process.env.STUDENTS_BROWSER_EXECUTABLE?{executablePath:process.env.STUDENTS_BROWSER_EXECUTABLE}:{});
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/students/index.html#formulas');
 await page.locator('#worked-only').check();assert.equal(await page.locator('#formula-grid .formula-card').count(),3);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  const btn=page.locator('[data-examples="sliding-friction-model"]');await btn.click();
  const example=page.locator('#formula-grid #book-mechanics-p32-r03 .worked-example');
  await example.locator('.worked-example-body').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>document.activeElement.closest('.worked-example')?.closest('.related-expression')?.id),'book-mechanics-p32-r03');
  assert.match(await example.textContent(),/20 N/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow at '+width);
  assert.ok(await example.evaluate(n=>n.scrollWidth<=n.clientWidth+1),'Example fits at '+width);
  await page.emulateMedia({reducedMotion:'reduce'});await example.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'example-'+width+'.png')});
  await example.locator('summary').press('Enter');assert.equal(await example.getAttribute('open'),null);
  await example.locator('summary').press('Enter');assert.notEqual(await example.getAttribute('open'),null);
 }
 await page.locator('#formula-search').fill('rolling');assert.equal(await page.locator('#formula-grid .formula-card').count(),1);
 await page.locator('#library-home-link').click();await page.waitForFunction(()=>document.querySelector('#formula-count').textContent==='575 / 575');assert.equal(await page.locator('#worked-only').isChecked(),false);
 await page.locator('#worked-only').check();await page.evaluate(()=>location.hash='chapter-2');await page.waitForFunction(()=>!document.querySelector('#worked-only').checked);assert.ok(await page.locator('#formula-grid .formula-card').count()>0);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',engine,widths:[1440,390,320],examples:10,scope:'Responsive layout, keyboard expansion, focus destination, search and destination resets',errors}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
