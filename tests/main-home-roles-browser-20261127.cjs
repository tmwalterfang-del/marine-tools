/* "Start with your job" on the home page: every role opens, every tool button opens its page and card,
 * every link points at an existing file, Norwegian labels, and no horizontal scroll at 320 px with all roles open. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const page=await (await browser.newContext({viewport:{width:1280,height:900}})).newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.waitForTimeout(700);
 const roles=await page.$$eval('.home-role',rs=>rs.map(r=>({id:r.dataset.role,tools:[...r.querySelectorAll('button[data-go]')].map(b=>({go:b.dataset.go,tool:b.dataset.toolTarget||''})),links:[...r.querySelectorAll('a')].map(a=>a.getAttribute('href'))})));
 assert.ok(roles.length>=8,'at least 8 role entries');
 for(const l of roles.flatMap(r=>r.links)){const p=l.split('#')[0];const f=path.join(root,p.endsWith('/')?p+'index.html':p);assert.ok(fs.existsSync(f),'link target exists: '+l);}
 for(const r of roles)for(const t of r.tools){
  await page.goto(base+'/');await page.waitForTimeout(500);
  await page.locator(`.home-role[data-role="${r.id}"] summary`).click();
  await page.locator(`.home-role[data-role="${r.id}"] button[data-go="${t.go}"]${t.tool?`[data-tool-target="${t.tool}"]`:''}`).first().click();await page.waitForTimeout(500);
  const st=await page.evaluate(([pg,title])=>{const p=document.getElementById(pg);return {active:!!p&&p.classList.contains('active'),card:!title||!![...p.querySelectorAll('.tool-card')].find(c=>c.dataset.toolTitle===title)}},[t.go,t.tool]);
  assert.ok(st.active&&st.card,`${r.id}: ${t.tool||t.go} opens`);
 }
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.setViewportSize({width:320,height:800});
 await page.goto(base+'/');await page.waitForTimeout(1200);await page.$$eval('.home-role',rs=>rs.forEach(r=>r.open=true));await page.waitForTimeout(400);
 const nb=await page.evaluate(()=>({eyebrow:document.querySelector('.home-roles-section .eyebrow')?.textContent||'',role:document.querySelector('.home-role b')?.textContent||'',scroll:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}));
 assert.match(nb.eyebrow,/START MED JOBBEN DIN/,'section label translated');assert.match(nb.role,/kadett/i,'role translated');assert.ok(nb.scroll,'no horizontal scroll at 320 px');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`home roles (${engine}): ${roles.length} roles, ${roles.reduce((n,r)=>n+r.tools.length,0)} tool buttons, nb + 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
