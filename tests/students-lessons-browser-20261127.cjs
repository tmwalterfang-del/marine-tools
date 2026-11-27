/* "Ready-made 45-minute lessons" on the Education page: titles and question counts match the learning catalogue,
 * every lesson opens the workspace teaching session (plan, models, teacher guide, exports), Norwegian, 320 px. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const g={};new Function('window','self','globalThis',fs.readFileSync(path.join(root,'students/learning-catalogue-20261030.js'),'utf8'))(g,g,g);const cat=g.MT_LEARNING_CATALOGUE.chapters;
 browser=await pw[engine].launch();const page=await (await browser.newContext({viewport:{width:1280,height:900}})).newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/students/');await page.waitForTimeout(900);
 const cards=await page.$$eval('#lessons .lesson-card',as=>as.map(a=>({href:a.getAttribute('href'),num:+a.querySelector('.lesson-num').textContent,title:a.querySelector('b').textContent.trim(),q:+a.querySelector('.lesson-q').textContent})));
 assert.equal(cards.length,cat.length,'one lesson per subject');
 for(const c of cards){const ch=cat.find(x=>x.number===c.num);assert.ok(ch,'chapter exists '+c.num);assert.equal(c.title,ch.title,'title matches catalogue '+c.num);assert.equal(c.q,ch.count,'question count matches catalogue '+c.num);assert.equal(c.href,`../workspace.html#teach?chapter=${c.num}&minutes=45`,'lesson link '+c.num);}
 for(const n of [14,6]){await page.goto(base+`/workspace.html#teach?chapter=${n}&minutes=45`);await page.waitForTimeout(1800);
  const v=await page.evaluate(()=>({h1:document.querySelector('h1')?.textContent||'',min:document.getElementById('teaching-minutes')?.value,guide:!!document.querySelector('details summary'),pack:!!document.getElementById('teaching-export'),moodle:!!document.getElementById('teaching-moodle'),body:document.body.innerText}));
  assert.match(v.h1,/Teaching session/,'teaching session opens for chapter '+n);assert.equal(v.min,'45','45-minute plan');assert.ok(v.guide&&v.pack&&v.moodle,'teacher guide and exports present');assert.ok(v.body.includes(cat.find(x=>x.number===n).title),'chapter title shown');}
 await page.goto(base+'/');await page.waitForTimeout(600);assert.equal(await page.locator('.home-role a[href="students/#lessons"]').count(),1,'home teaching entry links to the lessons');
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(base+'/students/');await page.waitForTimeout(1500);await page.$eval('#lessons .lessons-more',d=>d.open=true);await page.waitForTimeout(300);
 const nb=await page.evaluate(()=>({h:document.getElementById('lessons-title')?.textContent||'',card:[...document.querySelectorAll('#lessons .lesson-card b')].map(b=>b.textContent).join('|'),small:document.querySelector('#lessons .lesson-card small')?.textContent||'',scroll:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}));
 assert.match(nb.h,/Ferdige 45-minutters timer/,'heading translated');assert.match(nb.card,/Last og skipsstabilitet/,'subject translated');assert.match(nb.small,/øvingsoppgaver/,'count label translated');assert.ok(nb.scroll,'no horizontal scroll at 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`lessons (${engine}): ${cards.length} lessons match the catalogue, teaching sessions open with guide + exports, nb + 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
