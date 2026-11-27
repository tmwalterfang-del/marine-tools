/* Term explanations in calculators: generated hints data is in sync with the glossary; tool cards show a "Terms:" row
 * from their labels without changing the labels; tap/click opens the explanation with a glossary link; Escape closes;
 * Norwegian chrome; 320 px; no page errors. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),vm=require('node:vm'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 execFileSync(process.execPath,[path.join(root,'scripts/build-glossary-hints.mjs'),'--check'],{stdio:'pipe'}); // throws if stale
 const ctxv=vm.createContext({window:{}});for(const f of ['glossary-data.js','glossary-data-more.js','glossary-data-3.js','glossary-data-4.js','glossary-data-5.js','glossary-data-6.js'])vm.runInContext(fs.readFileSync(path.join(root,'glossary',f),'utf8'),ctxv);
 const G=Object.fromEntries(ctxv.window.MT_GLOSSARY.map(t=>[t.id,t]));
 assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes("'./glossary/glossary-hints.js'"),'hints work offline');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({viewport:{width:1280,height:900}});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const close=()=>page.evaluate(()=>document.querySelector('#mtReleaseDialog[open]')?.close());
 const card='.tool-card[data-tool-title="Fuel ROB & endurance"]';
 await page.goto(base+'/?tool=rob');await page.waitForTimeout(1500);await close();
 assert.ok((await page.$$eval(card+' .mt-term',b=>b.map(x=>x.textContent))).includes('ROB'),'ROB card lists the ROB term');
 assert.equal(await page.locator(card+' label .mt-term, '+card+' label .tool-terms').count(),0,'labels are not changed');
 assert.equal(await page.evaluate(c=>document.querySelector(c+' label').firstChild.textContent.trim(),card),'ROB m³','label text intact');
 await page.click(card+' .mt-term[data-term="rob"]');
 const pop=await page.evaluate(c=>{const p=document.querySelector(c+' .tool-term-pop');return p&&{t:p.querySelector('b').textContent,d:p.querySelector('p').textContent,href:p.querySelector('a').getAttribute('href')}},card);
 assert.deepEqual(pop,{t:G.rob.term,d:G.rob.d,href:'glossary.html#rob'},'explanation matches the glossary and links to it');
 assert.equal(await page.getAttribute(card+' .mt-term[data-term="rob"]','aria-expanded'),'true','button reports expanded');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.tool-term-pop').count(),0,'Escape closes');
 assert.match(await page.getAttribute(card+' .mt-term[data-term="rob"]','title'),/remaining on board/,'hover text');
 // another page (electrical) is decorated when opened
 await page.goto(base+'/?tool=three-phase');await page.waitForTimeout(1500);await close();
 assert.ok((await page.$$eval('.tool-card[data-tool-title="Three-phase power"] .mt-term',b=>b.map(x=>x.dataset.term))).includes('power-factor'),'power factor explained on the electrical page');
 // Norwegian chrome, term stays English, 320 px
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(base+'/?tool=rob');await page.waitForTimeout(1800);await close();
 await page.click(card+' .mt-term[data-term="rob"]');await page.waitForTimeout(400);
 const nb=await page.evaluate(c=>({label:document.querySelector(c+' .tool-terms-label').textContent,link:document.querySelector(c+' .tool-term-pop a').textContent,term:document.querySelector(c+' .mt-term').textContent,fits:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}),card);
 assert.equal(nb.label,'Begreper:','row label translated');assert.equal(nb.link,'Mer i ordlisten →','link translated');assert.equal(nb.term,'ROB','term stays English');assert.ok(nb.fits,'no horizontal scroll at 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`glossary hints (${engine}): data in sync, labels untouched, explanation + glossary link, Escape, other pages, nb and 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
