/* Real rendering-engine QA against the checkout, with external services blocked.
 * Run: NODE_PATH=<playwright modules> node tests/education-responsive-20261020.cjs chromium
 * Viewports emulate layout/touch; they do not certify physical operating systems/devices.
 */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const pw=require('playwright'),root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const output=path.resolve(process.env.QA_OUTPUT||('qa-education-'+engine));fs.mkdirSync(output,{recursive:true});
const sizes=[['desktop',1440,900],['laptop',1280,720],['tablet-portrait',768,1024],['tablet-landscape',1080,810],['phone',390,844],['small-phone',320,568],['wide-short',2048,774],['phone-landscape',844,390]];
const pages=['home','fuel','energy-log','engineering','electrical','vessel-calcs','voyage-estimate','quick','weather','navigation','live-experimental','profile','settings','survey','suggestions','support','contact','about','privacy'];
const results=[],errors=[];let browser;
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403).end();return;}if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)&&!path.extname(p))p+='.html';if(!fs.existsSync(p)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);});
function check(ok,label,details={}){results.push({ok,label,...details});if(!ok)console.log('FAIL '+label+' '+JSON.stringify(details));}
async function metrics(page,label,scope){const m=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,heading:document.querySelector('h1,h2')?.textContent}));check(m.scroll<=m.client+2,label,{scope,...m});if(m.scroll>m.client+2)await page.screenshot({path:path.join(output,'overflow-'+results.length+'.png'),fullPage:true});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch({headless:true});
 for(const [device,width,height]of sizes){
  console.log('VIEWPORT '+engine+'/'+device);
  const scope=engine+'/'+device,context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:engine!=='firefox'&&width<=430,acceptDownloads:true,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.route('**/*',route=>{
   const request=route.request(),url=request.url();
   if(url.startsWith(base)||url.startsWith('blob:')||url.startsWith('file://'+output+path.sep))return route.continue();
   // Exercise a deliberately unavailable provider without WebKit's synthetic
   // CORS page errors from aborting cross-origin API requests during navigation.
   // No live provider is contacted or treated as a successful integration test.
   if(new URL(url).hostname==='api.marinetools.app')return route.fulfill({status:request.method()==='OPTIONS'?204:503,headers:{'access-control-allow-origin':base,'access-control-allow-credentials':'true','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':request.headers()['access-control-request-headers']||'content-type','content-type':'application/json'},body:request.method()==='OPTIONS'?'':JSON.stringify({status:'unavailable',error:'QA provider deliberately unavailable'})});
   return route.abort();
  });
  await context.addInitScript(()=>localStorage.setItem('mt.lastSeenReleaseBuild','20261019-v8-7-0'));
  const page=await context.newPage();page.on('pageerror',e=>errors.push({scope,message:e.message}));
  await page.goto(base+'/');await page.waitForFunction(()=>typeof window.__marineToolsOpenPage==='function');
  if(await page.locator('#mtReleaseDone').isVisible().catch(()=>false))await page.locator('#mtReleaseDone').click();
  const drawer=page.getByRole('button',{name:'Open menu',exact:true}),touchDrawer=await drawer.isVisible();if(touchDrawer)await drawer.click();
  const menu=page.locator('.nav-project');await menu.locator('summary').click();
  check(await menu.getByRole('link',{name:/Education/}).count()===1,'one Education entry',{scope});
  check(await menu.getByText('For Students',{exact:true}).count()===0&&await menu.getByText('For professionals',{exact:true}).count()===0,'audience split removed',{scope});
  if(touchDrawer){await page.keyboard.press('Escape');check(await page.locator('#sidebar').evaluate(x=>!x.classList.contains('open')),'drawer closes with Escape',{scope});}
  for(const id of pages){await page.evaluate(id=>window.__marineToolsOpenPage(id),id);await metrics(page,'root/'+id,scope);}
  await page.goto(base+'/education/');await page.waitForURL('**/students/');await page.waitForSelector('#formula-grid .formula-card');
  check(await page.title()==='Education · Marine Tools','Education alias opens the shared workspace',{scope});
  check(await page.locator('#chapter-filter').count()===0,'chapter dropdown removed',{scope});
  const filterHeights=await page.locator('#formula-controls select').evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().height));check(filterHeights.every(h=>h>=44&&h<=60),'filters keep compact touch-friendly height',{scope,filterHeights});
  for(const theme of ['maritime','bridge']){
   await page.selectOption('#student-theme',theme);
   for(const tab of ['formulas','symbols','calculators','practice','sheet']){await page.locator('[data-tab="'+tab+'"]').click();await metrics(page,'library/'+tab+'/'+theme,scope);}
  }
  await page.locator('[data-tab="formulas"]').click();await page.selectOption('#study-group','stability');await page.selectOption('#topic-filter','Ship Stability');
  check(await page.locator('#formula-grid .formula-card').count()>0,'discipline and subject yield formulas',{scope});
  check((await page.locator('#formula-grid .topic-pill').allTextContents()).every(t=>t==='Ship Stability'),'subject results match the visible filter',{scope});
  await page.goto(base+'/students/interactive.html');await page.waitForSelector('#module-list a',{state:'attached'});
  const modules=await page.locator('#module-list a').evaluateAll(xs=>xs.map(x=>({id:x.hash.slice(1),name:x.textContent})));
  check(modules.length===15,'fifteen modules selectable',{scope});
  check(await page.locator('#module-quick').isVisible()===(width<=800),'compact selector follows viewport',{scope});
  for(const {id,name}of modules){
   console.log('MODULE '+scope+'/'+id);
   if(width<=800)await page.selectOption('#module-quick',id);else await page.locator('#module-list a[href="#'+id+'"]').click();
   await page.waitForFunction(name=>document.getElementById('selected-title').textContent===name,name);
   const handle=await page.locator('#frames iframe:not([hidden])').elementHandle(),frame=await handle.contentFrame();
   await frame.waitForSelector('svg path,svg polyline,svg rect',{state:'attached',timeout:15000});
   await frame.locator('svg:visible').first().waitFor({timeout:15000});
   const z=await frame.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.body.querySelectorAll('*')].filter(x=>x.getBoundingClientRect().right>document.documentElement.clientWidth+2).slice(0,12).map(x=>({tag:x.tagName,id:x.id,cls:x.className?.baseVal??x.className,right:x.getBoundingClientRect().right})),bad:[...document.querySelectorAll('svg path,svg polyline,svg rect')].some(x=>/NaN|Infinity/.test(x.getAttribute('d')||x.getAttribute('points')||''))}));
   check(z.scroll<=z.client+2&&!z.bad,'module/'+id,{scope,...z});await metrics(page,'workspace/'+id,scope);
   const layout=await frame.evaluate(()=>{const r=[...document.querySelectorAll('.teaching-results')].find(x=>x.getBoundingClientRect().height>0),d=[...document.querySelectorAll('.teaching-inputs')].find(x=>x.getBoundingClientRect().height>0);return {wrapped:!!d,open:d?.open,resultY:r?.getBoundingClientRect().top,inputsY:d?.getBoundingClientRect().top}});
   check(layout.wrapped,'module has collapsible inputs/'+id,{scope});
   if(width<=800){const d=frame.locator('details.teaching-inputs:visible').first();await d.locator(':scope > summary').click();check(await d.getAttribute('open')!==null,'mobile input disclosure opens/'+id,{scope});await d.locator(':scope > summary').click();}
   if(width<=800)check(!layout.open&&layout.resultY<=layout.inputsY,'mobile results before collapsed inputs/'+id,{scope,...layout});
   {
    const before=await frame.locator('input:not([type=file])').evaluateAll(xs=>xs.map(x=>x.value));
    await page.locator('#presentation-toggle').click();
    check(await page.locator('body').evaluate(x=>x.classList.contains('presentation-view'))&&await frame.locator('body').evaluate(x=>x.classList.contains('presentation-view')),'presentation mode reaches active module',{scope});
    await metrics(page,'presentation/'+id,scope);
    await frame.waitForFunction(()=>[...document.querySelectorAll('.teaching-results svg')].filter(x=>x.getBoundingClientRect().width).every(x=>x.style.getPropertyValue('--teaching-chart-height')));
    // Measure after the scheduled sizing and the resulting browser layout.
    await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const fitting=await frame.evaluate(()=>{
     const charts=[...document.querySelectorAll('.teaching-results svg')].filter(x=>x.getBoundingClientRect().width);
     return {height:innerHeight,charts:charts.map(x=>{const b=x.getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:b.height,overflow:getComputedStyle(x).overflow}}),hiddenMeaning:[...document.querySelectorAll('#module-title,#module-description,.heading')].filter(x=>!x.closest('[hidden]')).some(x=>getComputedStyle(x).display==='none')};
    });
    check(!fitting.hiddenMeaning,'presentation retains module description/'+id,{scope});
    check(fitting.charts.every(x=>x.height<=Math.max(180,fitting.height-32)+1),'presentation caps complete chart height/'+id,{scope,...fitting});
    if(width>=801&&height>=650&&['trim','crank'].includes(id))check(fitting.charts.every(x=>x.bottom<=fitting.height+2),'presentation chart axes fit viewport/'+id,{scope,...fitting});
    if(['desktop','wide-short','phone-landscape'].includes(device)&&['trim','crank'].includes(id))await page.screenshot({path:path.join(output,'presentation-'+id+'-'+device+'.png')});

    if(device==='desktop'&&id===modules[0].id){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(output,'presentation-desktop.png'),fullPage:true});}
    await frame.locator('details.teaching-inputs:visible > summary').first().press('Escape');
    check(await page.locator('#presentation-toggle').getAttribute('aria-pressed')==='false','Escape exits presentation',{scope});
    check(JSON.stringify(before)===JSON.stringify(await frame.locator('input:not([type=file])').evaluateAll(xs=>xs.map(x=>x.value))),'presentation preserves inputs',{scope});
   }
  }
  // Save representative screenshots, including the compact picker and embedded chart.
  if(width<=800)await page.selectOption('#module-quick','trim');
  else await page.locator('#module-list a[href="#trim"]').click();
  await page.waitForFunction(()=>document.getElementById('selected-title').textContent==='Trim & draft changes');
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(output,'workspace-'+device+'.png'),fullPage:true});
  if(device==='desktop'){
   await page.goto(base+'/students/mollier.html');await page.waitForSelector('#hs-chart path',{state:'attached'});
   const pending=page.waitForEvent('download');await page.locator('#export-report').click();const download=await pending,reportPath=path.join(output,'mollier-report.html');await download.saveAs(reportPath);
   const report=fs.readFileSync(reportPath,'utf8');check(report.includes('study-snapshot')&&report.includes('<svg'),'actual HTML download',{scope});
   const reportPage=await context.newPage();await reportPage.goto('file://'+reportPath);await reportPage.waitForSelector('svg');await reportPage.emulateMedia({media:'print'});await reportPage.screenshot({path:path.join(output,'report-print.png'),fullPage:true});
   if(engine==='chromium'){await reportPage.pdf({path:path.join(output,'mollier-report.pdf'),format:'A4',printBackground:true});check(fs.statSync(path.join(output,'mollier-report.pdf')).size>10000,'actual Chromium PDF',{scope});}
   await reportPage.close();
  }
  // Reproduce the user's full-window examples as well as the embedded workspace.
  for(const id of ['trim','crank']){
   await page.goto(base+'/students/examples.html#'+id);
   await page.waitForSelector('#chart path, #chart polyline',{state:'attached'});
   await page.locator('#presentation-toggle').click();
   await page.waitForFunction(()=>document.getElementById('chart').style.getPropertyValue('--teaching-chart-height'));
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const m=await page.locator('#chart').evaluate(x=>({bottom:x.getBoundingClientRect().bottom,height:x.getBoundingClientRect().height,viewport:innerHeight}));
   if(width>=801&&height>=650)check(m.bottom<=m.viewport+2,'standalone presentation includes lower axis/'+id,{scope,...m});
   check(await page.locator('#module-description').isVisible(),'standalone description remains available/'+id,{scope});
   if(device==='wide-short')await page.screenshot({path:path.join(output,'standalone-'+id+'-'+device+'.png')});
   await page.locator('#chart').scrollIntoViewIfNeeded();
   const reached=await page.locator('#chart').evaluate(x=>({top:x.getBoundingClientRect().top,bottom:x.getBoundingClientRect().bottom,viewport:innerHeight}));
   check(reached.top>=-2&&reached.bottom<=reached.viewport+2,'whole standalone chart reachable/'+id,{scope,...reached});
   await page.locator('#presentation-toggle').press('Escape');
   check(await page.locator('#presentation-toggle').getAttribute('aria-pressed')==='false','standalone Escape exits/'+id,{scope});
  }
  await context.close();
 }
})().catch(e=>{errors.push({scope:engine,message:e.stack||String(e)});}).finally(async()=>{
 if(browser)await browser.close();await new Promise(r=>server.close(r));
 const summary={engine,tests:results.length,failures:results.filter(x=>!x.ok).length,errors,scope:'Real headless browser engines, local checkout, external providers blocked; responsive/touch emulation, not physical device certification.',results};
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({engine,tests:summary.tests,failures:summary.failures,errors}));if(summary.failures||errors.length)process.exitCode=1;
});
