// Local browser QA with mocked external services; no production calls.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=fileURLToPath(new URL('../.preview-dist/',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(!file.startsWith(root))throw Error('Invalid path');
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
try{
  const header=await readFile(path.join(root,'_headers'),'utf8');
  assert.match(header,/X-Robots-Tag: noindex, nofollow, noarchive/);
  for(const file of ['wrangler.jsonc','worker/worker.js','.git/config','sitemap.xml'])assert.equal((await fetch(`${origin}/${file}`)).status,404,file);
  for(const width of [390,820,1440])for(const theme of ['dark','bridge']){
    const context=await browser.newContext({viewport:{width,height:950}});
    const page=await context.newPage(),errors=[],badAssets=[],apiRequests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)badAssets.push(r.url())});
    await context.route('**/*',async route=>{
      const req=route.request(),url=req.url();
      if(url.startsWith(origin))return route.continue();
      if(url.startsWith('https://api.marinetools.app')){
        apiRequests.push({url,method:req.method()});
        return route.fulfill({json:{status:'ok',release:{version:'8.6.1'},version:'8.6.1',ais:{authenticated:false}}});
      }
      return route.abort();
    });
    await page.addInitScript(t=>localStorage.setItem('mt.theme',JSON.stringify(t)),theme);
    await page.goto(origin,{waitUntil:'networkidle'});
    // Wait past both automatic widget timers and API startup checks.
    await page.waitForTimeout(6000);
    await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme||'dark'),theme);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow,noarchive');
    assert.equal(await page.locator('link[rel="manifest"]').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow');
    const banner=await page.locator('#mtPreviewBanner').boundingBox();
    const bar=await page.locator('.topbar').boundingBox();
    assert.ok(bar.y>=banner.height-1,'banner covers topbar');
    if(width<=900)await page.locator('#mobileMenu').click();
    await page.locator('#sidebar [data-page="engineering"]').click();
    await page.locator('#engineering.active').waitFor();
    assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),0);
    assert.equal(await page.evaluate(()=>window.__marineToolsAnalyticsV2.enabled),false);
    const blocked=await page.evaluate(async()=>{
      const inputs=[['https://api.marinetools.app/api/analytics/event',{method:'POST'}],[new URL('https://api.marinetools.app/api/analytics/event'),{}],[new Request('https://api.marinetools.app/api/weather',{method:'POST'}),{}]];
      return Promise.all(inputs.map(async([input,init])=>{try{await fetch(input,init);return false}catch{return true}}));
    });
    assert.deepEqual(blocked,[true,true,true]);
    assert.ok(apiRequests.every(r=>r.method==='GET'&&!r.url.includes('/analytics/')),'preview sent analytics/write');
    assert.deepEqual(errors,[],'browser errors');assert.deepEqual(badAssets,[],'missing local assets');
    console.log(`PASS ${width}px / ${theme}: navigation, layout, assets, analytics, API guard, SW`);
    if(width===1440&&theme==='dark')for(const url of ['/education/','/education/one-page.html','/professionals/']){
      await page.goto(origin+url,{waitUntil:'networkidle'});
      assert.equal(await page.locator('#mtPreviewBanner').count(),1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow,noarchive');
    }
    await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
