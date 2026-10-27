const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),pw=require('playwright');
const engine=process.argv[2]||'chromium',out=path.resolve('app-artifacts/privacy/'+engine);let server,browser;
(async()=>{
 execFileSync(process.execPath,['scripts/stage-app.mjs']);fs.mkdirSync(out,{recursive:true});
 const repo=path.resolve('.'),app=path.join(repo,'app-dist');
 // Model static-directory hosting used by GitHub Pages and Cloudflare Pages.
 server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),isApp=u.pathname.startsWith('/candidate/'),base=isApp?app:repo,route=isApp?u.pathname.slice('/candidate'.length):u.pathname;let file=path.resolve(base,'.'+route);if(!file.startsWith(base+path.sep)&&file!==base)return res.writeHead(403).end();if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){if(!u.pathname.endsWith('/'))return res.writeHead(301,{Location:u.pathname+'/'+u.search}).end();file=path.join(file,'index.html')}if(!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch(process.env.MT_QA_BROWSER_PATH?{executablePath:process.env.MT_QA_BROWSER_PATH}:{});const results=[];
 for(const size of [[320,568],[568,320],[412,915],[915,412],[768,1024],[1024,768],[1366,768],[2560,1440]]){
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},javaScriptEnabled:false,serviceWorkers:'block'}),page=await context.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));
  const response=await page.goto(origin+'/privacy');assert.equal(response.status(),200);assert(page.url().endsWith('/privacy/'));
  await page.getByRole('heading',{name:'Marine Tools Privacy Policy',exact:true}).waitFor();await page.reload();assert.equal(await page.locator('h1').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('script,iframe,details').count(),0);
  await page.getByRole('link',{name:'Android & Windows',exact:true}).click();assert(page.url().endsWith('#android-windows'));await page.locator('#policy-changes').scrollIntoViewIfNeeded();
  assert(requests.every(u=>u.startsWith(origin+'/')),'Standalone policy has no third-party requests');
  await page.screenshot({path:path.join(out,'privacy-'+size.join('x')+'.png'),fullPage:true});results.push({viewport:size,status:'PASS',javascript:false,requests});await context.close();
 }
 const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.fulfill({status:200,contentType:'application/javascript',body:''}));
 await context.addInitScript(()=>{localStorage.setItem('mt.settings',JSON.stringify({usageAnalytics:false,privacySentinel:'keep'}));localStorage.setItem('mt.profile',JSON.stringify({name:'Retained vessel'}))});
 const page=await context.newPage();await page.goto(origin+'/?page=privacy');await page.locator('#privacy .privacy-policy').waitFor();assert.equal(await page.locator('#privacy h1').textContent(),'Marine Tools Privacy Policy');await page.reload();await page.locator('#privacy .privacy-policy').waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mt.profile')).name),'Retained vessel');
 await page.goto(origin+'/candidate/index.html?page=privacy');await page.waitForFunction(()=>!!window.MT_APP_NAV);await page.locator('#mtReleaseDialog[open] #mtReleaseDone').click();await page.locator('#privacy .privacy-policy').waitFor();
 await page.getByRole('link',{name:'Android & Windows',exact:true}).click();assert.equal(await page.evaluate(()=>MT_APP_NAV.current),'privacy','Policy fragment keeps app route');
 await page.evaluate(()=>{MT_PLATFORM.openUrl=async u=>{window.__privacyOpened=u}});await page.locator('#privacy a[href="https://www.marinetools.app/privacy"]').click();assert.equal(await page.evaluate(()=>window.__privacyOpened),'https://www.marinetools.app/privacy');
 await page.evaluate(()=>MT_APP_NAV.go('settings'));assert.equal(await page.locator('#setAnalytics').isChecked(),false);await page.evaluate(()=>MT_APP_NAV.go('privacy'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mt.settings')).privacySentinel),'keep');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.waitForFunction(()=>getComputedStyle(document.getElementById('privacy')).opacity==='1'&&scrollY===0);
 await page.screenshot({path:path.join(out,'app-policy.png'),animations:'disabled'});
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',engine,profiles:results,appPolicy:true,settingsPreserved:true,productionVerified:false,physicalDevice:false},null,2));console.log(JSON.stringify({status:'PASS',engine,profiles:results.length,appPolicy:true}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.closeAllConnections();server?.close()});
