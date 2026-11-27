/* "Watch the guide video" on tool cards: hidden while no URL is configured, shown only for tools in a published
 * guide, only for YouTube URLs, opens in a new tab, translated. Real browser checks. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
let browser;
const links=page=>page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#fuel .tool-card')].map(c=>[c.dataset.toolTitle,[...c.querySelectorAll('a.tool-watch')].map(a=>({href:a.href,target:a.target,text:a.textContent}))])));
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 // every tool id in the guide table must exist (catches renamed tools)
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8'),slug=t=>String(t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 const ids=new Set(JSON.parse(src.match(/const STATIC_TOOL_INDEX=(\[[\s\S]*?\]);/)[1]).map(x=>slug(x.title))),guide=Function('return '+src.match(/const TOOL_GUIDE=(\{[^;]*\});/)[1])();
 assert.deepEqual(Object.keys(guide).filter(k=>!ids.has(k)),[],'all guide tool ids exist');
 browser=await pw[engine].launch();
 // 1) default: no URLs configured → no links anywhere
 let ctx=await browser.newContext();let page=await ctx.newPage();await page.goto(base+'/?page=fuel');await page.waitForTimeout(800);
 assert.equal(Object.values(await links(page)).flat().length,0,'no watch links without configured URLs');await ctx.close();
 // 2) guide B published → bunkering tools link to it, other tools do not
 ctx=await browser.newContext();await ctx.addInitScript(()=>{window.MT_GUIDE_VIDEO_URLS={B:'https://www.youtube.com/watch?v=abc123',C:'http://evil.example/x'}});page=await ctx.newPage();
 await page.goto(base+'/?page=fuel');await page.waitForTimeout(800);let l=await links(page);
 assert.equal(l['Fuel ROB & endurance'].length,1,'ROB card links to guide B');assert.equal(l['Fuel ROB & endurance'][0].href,'https://www.youtube.com/watch?v=abc123');assert.equal(l['Fuel ROB & endurance'][0].target,'_blank');
 assert.equal((l['Fuel consumption by speed']||[]).length,0,'tool not in a guide has no link');
 await page.goto(base+'/?page=navigation');await page.waitForTimeout(800);
 assert.equal(await page.locator('#navigation a.tool-watch').count(),0,'non-YouTube URL is ignored');
 // 3) Norwegian label
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('nb')));await page.goto(base+'/?page=fuel');await page.waitForTimeout(1400);l=await links(page);
 assert.match(l['Fuel ROB & endurance'][0].text,/Se guidevideoen/,'label translated');
 console.log(`guide video links (${engine}): hidden by default, guide B shown on its tools only, URL allow-list, nb OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
