/* Deep links to single tools: ?tool=<id> opens the right card, &example=1 fills the guide-video example values
 * without calculating or saving anything, aliases work, unknown ids fall back to home, and the notice is localized
 * and fits at 320 px. Real browser checks. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
const slug=t=>String(t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({viewport:{width:1280,height:900}});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8'),index=JSON.parse(src.match(/const STATIC_TOOL_INDEX=(\[[\s\S]*?\]);/)[1]);
 const settle=()=>page.waitForTimeout(700);
 // every campaign alias and every example must point at an existing tool id (catches renamed titles)
 const ids=new Set(index.map(x=>slug(x.title)));
 const aliases=Function('return '+src.match(/const TOOL_LINK_ALIASES=(\{[^;]*\});/)[1])(),examples=Function('return '+src.match(/const TOOL_EXAMPLES=(\{[\s\S]*?\n\});/)[1])();
 assert.deepEqual(Object.entries(aliases).filter(([,v])=>!ids.has(v)),[],'all aliases resolve');assert.deepEqual(Object.keys(examples).filter(k=>!ids.has(k)),[],'all examples resolve');
 // every indexed tool opens its own card on its own page
 // a title listed on two pages (e.g. Route fuel estimate) links to its first listing
 for(const t of index.filter((x,i,a)=>a.findIndex(y=>slug(y.title)===slug(x.title))===i)){
  await page.goto(base+'/?tool='+slug(t.title));await settle();
  const st=await page.evaluate(([pg,title])=>{const p=document.getElementById(pg),cards=p?[...p.querySelectorAll('.tool-card')]:[];return {active:!!p&&p.classList.contains('active'),pageIsTool:cards.length===0,card:!!cards.find(c=>c.dataset.toolTitle===title)}},[t.page,t.title]);
  assert.ok(st.active,`page ${t.page} active for ${t.title}`);assert.ok(st.card||st.pageIsTool,`card rendered for ${t.title}`);
 }
 // alias + example: fields filled, notice shown, nothing stored or calculated
 await page.goto(base+'/');await settle();const before=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mt.')).sort());
 await page.goto(base+'/?tool=rob&example=1');await page.waitForTimeout(1200);
 const ex=await page.evaluate(()=>({rob:document.getElementById('rob').value,day:document.getElementById('robDay').value,res:document.getElementById('robRes').value,note:document.querySelector('.tool-example-note')?.textContent||'',history:localStorage.getItem('mt.history.v1')}));
 assert.deepEqual([ex.rob,ex.day,ex.res],['182','14.5','3'],'example values filled');assert.match(ex.note,/Example values/,'example notice shown');
 const after=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mt.')).sort());
 assert.deepEqual(after.filter(k=>!['mt.recent.v1','mt.analytics.v1'].includes(k)&&!before.includes(k)),[],'no new stored data from opening an example');
 await page.click('#calcRob');await page.waitForTimeout(400);assert.match(await page.textContent('#resRob'),/12\.2\s*days/,'example reproduces the guide result');
 // copy-link control present on the card
 assert.equal(await page.locator('.tool-card[data-tool-title="Fuel ROB & endurance"] [data-copy-tool-link]:not([data-with-values])').count(),1,'copy link control');
 // unknown id falls back to home without errors
 await page.goto(base+'/?tool=does-not-exist');await settle();assert.ok(await page.evaluate(()=>document.getElementById('home').classList.contains('active')),'unknown tool falls back to home');
 // Norwegian notice + 320 px layout
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(base+'/?tool=generator&example=1');await page.waitForTimeout(1600);
 const nb=await page.evaluate(()=>{const n=document.querySelector('.tool-example-note');return {text:n?.textContent||'',fits:n?n.scrollWidth<=n.clientWidth+1:false,page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}});
 assert.match(nb.text,/Eksempelverdier/,'notice translated to Norwegian');assert.ok(nb.fits,'notice fits at 320 px');assert.ok(nb.page,'no horizontal page scroll at 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`tool links (${engine}): ${index.length} tools open by link; example, alias, fallback, nb and 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
