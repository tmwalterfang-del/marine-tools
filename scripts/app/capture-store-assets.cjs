/* Actual shared app UI references; these are not physical-device screenshots. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),pw=require('playwright');
const root=path.resolve('app-dist'),out=path.resolve('store-assets/0.2.0');let server,browser;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/feature-graphic.svg'){res.setHeader('Content-Type','image/svg+xml');return res.end(fs.readFileSync('apps/store/feature-graphic.svg'))}const f=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw.chromium.launch();const captures=[];
 const graphic=await browser.newPage({viewport:{width:1024,height:500}});await graphic.goto(base+'/feature-graphic.svg');await graphic.screenshot({path:path.join(out,'google-feature-graphic-draft-1024x500.png')});await graphic.close();
 for(const profile of [{name:'android-web-reference',width:360,height:640,scale:3},{name:'windows-web-reference',width:1920,height:1080,scale:1},{name:'iphone-web-reference',width:440,height:956,scale:3},{name:'ipad-web-reference',width:1032,height:1376,scale:2},{name:'tablet-landscape-web-reference',width:1024,height:768,scale:1}]){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.scale,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('mt.lastSeenReleaseBuild','20261019-v8-7-0'));await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  const page=await context.newPage();await page.goto(base+'/index.html');await page.waitForFunction(()=>!!window.MT_APP_NAV);
  for(const scene of ['home','vessel-calcs','electrical']){
   await page.evaluate(id=>MT_APP_NAV.go(id),scene);
   if(scene==='vessel-calcs'){await page.locator('#calcAirDraft').click();await page.locator('#resAirDraft').scrollIntoViewIfNeeded()}
   if(scene==='electrical'){await page.locator('#calc3p').click();await page.locator('#res3p').scrollIntoViewIfNeeded()}
   if(profile.name==='windows-web-reference')await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   const file=profile.name+'-'+scene+'.png';await page.screenshot({path:path.join(out,file),animations:'disabled'});captures.push({file,scene,pixels:[profile.width*profile.scale,profile.height*profile.scale],source:'Actual shared app in Chromium; NOT a native or physical-device capture'});
  }await context.close();
 }
 fs.copyFileSync('assets/icon-512.png',path.join(out,'marine-tools-icon-512.png'));
 fs.writeFileSync(path.join(out,'capture-manifest.json'),JSON.stringify({version:'0.2.0',status:'DRAFT_OWNER_REVIEW',captures,nativeIos:'See iOS candidate artifact for real Simulator captures; device acceptance remains unverified'},null,2));console.log('Captured '+captures.length+' shared-UI references and feature graphic.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
