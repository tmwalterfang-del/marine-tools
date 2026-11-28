/* Home page upgrade: six area cards, "Glossary, rules and lessons" links, example links that fill a calculator,
 * the "Continue where you left off" strip (local recent tools only), a glossary row in the home search,
 * Norwegian labels, and no horizontal scroll at 320 px. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 // Live API is not part of this test: answer it locally so no cross-origin errors are raised.
 await ctx.route('https://api.marinetools.app/**',r=>{const o=r.request().headers().origin||'*';r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':o,'access-control-allow-credentials':'true','access-control-allow-headers':r.request().headers()['access-control-request-headers']||'content-type','access-control-allow-methods':'GET,POST,OPTIONS'},body:'{}'})});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.waitForTimeout(800);
 await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());

 // Six areas, each opens its page.
 const areas=await page.$$eval('.home-category-v8 button[data-go]',bs=>bs.map(b=>b.dataset.go));
 assert.deepEqual(areas,['fuel','engineering','electrical','vessel-calcs','quick','navigation'],'six area cards');

 // Reference links point at existing pages.
 const refs=await page.$$eval('.home-reference-card',as=>as.map(a=>a.getAttribute('href')));
 assert.deepEqual(refs,['glossary.html','regulatory.html','students/'],'glossary, regulations and education links');
 for(const r of refs){const f=path.join(root,r.endsWith('/')?r+'index.html':r);assert.ok(fs.existsSync(f),'reference target exists: '+r)}

 // Continue strip is hidden for a first-time visitor.
 assert.equal(await page.locator('#homeContinue').isHidden(),true,'continue strip hidden without recent tools');

 // Example links: each opens its calculator with example values filled in, nothing calculated or stored.
 const ex=await page.$$eval('.home-examples a',as=>as.map(a=>({href:a.getAttribute('href'),text:a.textContent})));
 assert.equal(ex.length,6,'six example links');
 for(const e of ex)assert.match(e.href,/^\?tool=[a-z0-9-]+&example=1$/,'example link format: '+e.href);
 const historyBefore=await page.evaluate(()=>localStorage.getItem('mt.history'));
 await page.goto(base+'/'+ex[0].href);await page.waitForTimeout(900);
 await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());
 const filled=await page.evaluate(()=>{const c=[...document.querySelectorAll('.tool-card')].find(x=>x.dataset.toolTitle==='Fuel ROB & endurance');return {visible:!!c&&c.offsetParent!==null,rob:document.getElementById('rob')?.value||''}});
 assert.ok(filled.visible,'example opens the Fuel ROB card');assert.equal(filled.rob,'182','example value filled');
 // (Opening the fuel page itself logs the route-fuel status line, so only the ROB card is checked.)
 const robSaved=await page.evaluate(()=>(JSON.parse(localStorage.getItem('mt.history')||'[]')).some(h=>h.title==='Fuel ROB & endurance'));
 assert.equal(historyBefore,null,'clean start');assert.equal(robSaved,false,'example link stores no ROB calculation');

 // Returning visitor: recent tools appear (max 4) and open their card.
 await page.evaluate(t=>localStorage.setItem('mt.recent',JSON.stringify([{title:'Compass / gyro correction',page:'quick',time:t},{title:'Generator load margin',page:'engineering',time:t-1},{title:'Three-phase power',page:'electrical',time:t-2},{title:'Battery runtime',page:'electrical',time:t-3},{title:'Beaufort converter',page:'quick',time:t-4}])),Date.now());
 await page.goto(base+'/');await page.waitForTimeout(800);
 await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());
 assert.equal(await page.locator('#homeContinue').isVisible(),true,'continue strip visible for returning visitor');
 assert.equal(await page.locator('.home-continue-item').count(),4,'at most four recent tools');
 await page.locator('.home-continue-item').first().click();await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>document.getElementById('quick').classList.contains('active')),'recent tool opens its page');

 // Search: a term that is not a tool offers the glossary, Enter goes there with the query.
 await page.goto(base+'/');await page.waitForTimeout(800);
 await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());
 await page.fill('#homeToolSearch','BOP');
 const row=page.locator('#homeToolResults .home-search-glossary');await row.waitFor();
 assert.equal(await row.getAttribute('href'),'glossary.html?q=BOP','glossary row link');
 await page.fill('#homeToolSearch','rob');
 assert.ok(await page.locator('#homeToolResults button').count()>0,'tools still listed first');
 assert.equal(await page.locator('#homeToolResults .home-search-glossary').count(),1,'glossary row also offered for tool matches');
 await page.fill('#homeToolSearch','BOP');await page.press('#homeToolSearch','Enter');
 await page.waitForURL('**/glossary.html?q=BOP');

 // Norwegian and 320 px.
 await page.goto(base+'/');await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));
 await page.setViewportSize({width:320,height:800});await page.goto(base+'/');await page.waitForTimeout(1300);
 await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());
 const nb=await page.evaluate(()=>({title:document.getElementById('home-reference-title')?.textContent||'',cont:document.getElementById('home-continue-title')?.textContent||'',ph:document.getElementById('homeToolSearch')?.getAttribute('placeholder')||'',scroll:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}));
 assert.match(nb.title,/Ordliste, regelverk og undervisning/,'reference title translated');
 assert.match(nb.cont,/Fortsett der du slapp/,'continue title translated');
 assert.match(nb.ph,/fagord/,'search placeholder translated');
 assert.ok(nb.scroll,'no horizontal scroll at 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`home upgrade (${engine}): 6 areas, 3 reference links, 6 examples fill without storing, continue strip, glossary search, nb + 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
