/* Per-tool "Print or save as PDF" and "Was this helpful?": the print page carries inputs, result and working,
 * feedback answers inline, nothing is sent without analytics consent, Norwegian labels, fits 320 px. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 await ctx.addInitScript(()=>{const p=HTMLIFrameElement.prototype,d=Object.getOwnPropertyDescriptor(p,'contentWindow');Object.defineProperty(p,'contentWindow',{get(){const w=d.get.call(this);if(w&&this.id==='mt-print-frame'){try{w.print=()=>{window.__printed=(window.__printed||0)+1}}catch{}}return w}})});
 const page=await ctx.newPage();const errors=[],analytics=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/analytics\//.test(r.url()))analytics.push(r.url())});
 await page.goto(base+'/?tool=rob&example=1');await page.waitForTimeout(1300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.click('#calcRob');await page.waitForTimeout(400);
 const card='.tool-card[data-tool-title="Fuel ROB & endurance"]';
 await page.click(`${card} [data-print-tool]`);await page.waitForTimeout(900);
 const doc=await page.evaluate(()=>document.getElementById('mt-print-frame')?.srcdoc||'');
 for(const s of ['Fuel ROB','182','14.5','12.2 days','Inputs','Result','planning and calculation aid'])assert.ok(doc.includes(s),'print page contains '+s);
 assert.equal(await page.evaluate(()=>window.__printed||0),1,'print dialog requested once');
 await page.click(`${card} [data-helpful="yes"]`);assert.match(await page.textContent(`${card} .tool-helpful`),/Thanks for the feedback/,'positive feedback acknowledged');
 const other='.tool-card[data-tool-title="Tank transfer"]';await page.click(`${other} [data-helpful="no"]`);
 assert.match(await page.getAttribute(`${other} .tool-helpful a`,'href'),/^mailto:/,'negative feedback offers the report link');
 // after "No": fixed reason choices (no free text); choosing one thanks the user and keeps the report link
 assert.deepEqual(await page.$$eval(`${other} [data-helpful-reason]`,b=>b.map(x=>x.dataset.helpfulReason)),['not-found','wrong-result','hard-to-use','other'],'reason choices offered after No');
 await page.click(`${other} [data-helpful-reason="wrong-result"]`);
 assert.match(await page.textContent(`${other} .tool-helpful`),/helps us improve/,'reason acknowledged');
 assert.match(await page.getAttribute(`${other} .tool-helpful a`,'href'),/^mailto:/,'report link kept after choosing a reason');
 assert.deepEqual(analytics,[],'no analytics request without consent');
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(base+'/?tool=rob');await page.waitForTimeout(1500);
 const nb=await page.evaluate(sel=>{const a=document.querySelector(sel+' .tool-card-actions');return {label:a?.querySelector('[data-print-tool]')?.textContent||'',q:a?.querySelector('.tool-helpful-q')?.textContent||'',fits:!!a&&a.scrollWidth<=a.clientWidth+1,page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}},card);
 assert.match(nb.label,/Skriv ut/,'print label translated');assert.match(nb.q,/nyttig/,'question translated');assert.ok(nb.fits&&nb.page,'fits 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`tool feedback & print (${engine}): print page complete, feedback inline, no analytics without consent, nb + 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
