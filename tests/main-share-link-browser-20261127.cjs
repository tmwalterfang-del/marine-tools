/* "Copy link with these values": the card's inputs travel in the link (&inputs=…). Opening it fills the same card only,
 * keeps raw values (decimal comma stays), never calculates or stores anything, ignores ids from other cards, bad ids and
 * oversized values, and the notice is localized and fits at 320 px. Real browser checks. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const page=await ctx.newPage();await ctx.route('https://api.marinetools.app/**',r=>{const h=r.request().headers(),o=h.origin||'null';r.fulfill({status:r.request().method()==='OPTIONS'?204:200,contentType:'application/json',headers:{'access-control-allow-origin':o,'access-control-allow-credentials':'true','access-control-allow-headers':h['access-control-request-headers']||'content-type','access-control-allow-methods':h['access-control-request-method']||'GET,POST','vary':'Origin'},body:r.request().method()==='OPTIONS'?'':'{}'})}); // no live API in tests (WebKit reports CORS failures as page errors)
 
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const closeRelease=()=>page.evaluate(()=>document.querySelector('#mtReleaseDialog[open]')?.close()); // the What's new dialog is modal and makes the fields inert
 const card='.tool-card[data-tool-title="Fuel ROB & endurance"]';
 // build a link from typed values (decimal comma kept as typed)
 await page.goto(base+'/?tool=rob');await page.waitForTimeout(900);await closeRelease();
 assert.equal(await page.locator(card+' [data-copy-tool-link][data-with-values]').count(),1,'copy-with-values control on the card');
 await page.fill('#rob','250,5');await page.fill('#robDay','12');await page.fill('#robRes','5');
 const link=await page.evaluate(()=>window.__marineToolsShareLink('Fuel ROB & endurance'));
 const u=new URL(link),ins=new URLSearchParams(u.searchParams.get('inputs')||'');
 assert.equal(u.searchParams.get('tool'),'fuel-rob-and-endurance','link names the tool');
 assert.deepEqual([ins.get('rob'),ins.get('robDay'),ins.get('robRes')],['250,5','12','5'],'link carries the raw input values');
 // open it fresh: same values, notice, nothing stored, result reproducible
 // baseline = opening the same tool without values (the fuel page itself records recent/history on open; that is existing behaviour)
 const keys=()=>page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mt.')).sort());
 await page.evaluate(()=>localStorage.clear());await page.goto(base+'/?tool=rob');await page.waitForTimeout(1300);const before=await keys();
 await page.evaluate(()=>localStorage.clear());
 await page.goto(link);await page.waitForTimeout(1300);await closeRelease();
 const got=await page.evaluate(()=>({rob:document.getElementById('rob').value,day:document.getElementById('robDay').value,res:document.getElementById('robRes').value,note:document.querySelector('.tool-example-note')?.textContent||'',result:(document.getElementById('resRob')?.textContent||'').trim()}));
 assert.deepEqual([got.rob,got.day,got.res],['250,5','12','5'],'shared values filled');
 assert.match(got.note,/shared link/,'shared-link notice shown');assert.doesNotMatch(got.result,/days/,'nothing calculated automatically');
 const after=await keys();
 assert.deepEqual(after.filter(k=>!before.includes(k)),[],'a shared link stores nothing beyond a plain visit');
 const hist=await page.evaluate(()=>JSON.parse(localStorage.getItem('mt.history')||'[]'));
 assert.ok(!hist.some(h=>h.title==='Fuel ROB & endurance'),'shared values are not written to calculation history');
 await page.click('#calcRob');await page.waitForTimeout(400);
 // hand calculation: usable = 250.5 × (1 − 0.05) = 237.975 m³; endurance = 237.975 / 12 = 19.83 days
 assert.match(await page.textContent('#resRob'),/19\.8\s*days/,'shared values reproduce the hand-calculated result');
 // hostile/foreign input: another card's id, a bad id, an oversized value and markup are ignored or kept as plain text
 const bad=new URLSearchParams({tool:'rob',inputs:new URLSearchParams({genCap:'999','<img>':'1',robDay:'9'.repeat(80),rob:'<b>7</b>'}).toString()});
 await page.goto(base+'/?'+bad.toString());await page.waitForTimeout(1300);
 const hb=await page.evaluate(()=>({gen:document.getElementById('genCap')?.value??null,day:document.getElementById('robDay').value,rob:document.getElementById('rob').value,html:document.querySelectorAll('.tool-card b').length}));
 assert.notEqual(hb.gen,'999','field outside the linked card is not filled');assert.notEqual(hb.day,'9'.repeat(80),'oversized value ignored');
 assert.equal(hb.rob,'<b>7</b>','markup stays plain text in the field');
 // shared values win over example=1
 await page.goto(link+'&example=1');await page.waitForTimeout(1300);assert.equal(await page.inputValue('#rob'),'250,5','shared values take precedence over the example');
 // Norwegian notice + 320 px
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(link);await page.waitForTimeout(1700);
 const nb=await page.evaluate(()=>{const n=document.querySelector('.tool-example-note'),b=document.querySelector('[data-with-values]');return {text:n?.textContent||'',btn:b?.textContent||'',fits:n?n.scrollWidth<=n.clientWidth+1:false,page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}});
 assert.match(nb.text,/delt lenke/,'notice translated');assert.match(nb.btn,/Kopier lenke med disse verdiene/,'button translated');
 assert.ok(nb.fits,'notice fits at 320 px');assert.ok(nb.page,'no horizontal page scroll at 320 px');
 // QR code: library loaded only on demand, QR shown inside the card, fits at 320 px, closes again
 await closeRelease();
 assert.equal(await page.evaluate(()=>!!document.querySelector('script[src*="qrcode-generator"]')||!!window.qrcode),false,'QR library not loaded before it is needed');
 await page.evaluate(c=>document.querySelectorAll(c+' details.tool-details').forEach(d=>d.open=true),card); // the actions sit in the card's collapsible section, as a user would open it
 await page.click(card+' [data-qr-tool]');await page.waitForSelector(card+' ~ .tool-qr svg, '+card+' .tool-qr svg',{timeout:10000});
 await page.waitForFunction(()=>/Skann/.test(document.querySelector('.tool-qr p')?.textContent||''),null,{timeout:5000}).catch(()=>{}); // the translator runs on DOM changes
 const qr=await page.evaluate(()=>{const b=document.querySelector('.tool-qr');return {paths:b.querySelectorAll('svg path,svg rect').length,text:b.querySelector('p').textContent,page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}});
 assert.ok(qr.paths>0,'QR code drawn');assert.match(qr.text,/Skann med mobilkameraet/,'QR help text translated');assert.ok(qr.page,'QR fits at 320 px');
 await page.click('.tool-qr button');assert.equal(await page.locator('.tool-qr').count(),0,'QR closes');
 // phone: "Copy link with these values" opens the share sheet with the same link
 const mctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:engine!=='firefox'});const m=await mctx.newPage();
 await m.addInitScript(()=>{window.__shared=[];Object.defineProperty(navigator,'share',{configurable:true,value:d=>{window.__shared.push(d);return Promise.resolve()}});const mm=window.matchMedia.bind(window);window.matchMedia=q=>q==='(pointer:coarse)'?{matches:true,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:mm(q)});
 await m.goto(link);await m.waitForTimeout(1500);await m.evaluate(()=>document.querySelector('#mtReleaseDialog[open]')?.close());
 await m.evaluate(c=>document.querySelectorAll(c+' details.tool-details').forEach(d=>d.open=true),card);await m.click(card+' [data-copy-tool-link][data-with-values]');await m.waitForTimeout(300);
 const shared=await m.evaluate(()=>window.__shared);assert.equal(shared.length,1,'share sheet used on a touch device');
 assert.equal(new URL(shared[0].url).searchParams.get('inputs'),new URL(link).searchParams.get('inputs'),'shared link carries the same values');
 await mctx.close();
 assert.deepEqual(errors,[],'no page errors');
 console.log(`share link (${engine}): values round-trip, nothing stored or calculated, foreign/bad input ignored, QR on demand, phone share sheet, nb and 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
