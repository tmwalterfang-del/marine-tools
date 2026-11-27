/* Maritime glossary (glossary.html): data integrity (unique ids, term + short English explanation, valid categories,
 * every calculator link resolves to an existing tool or file), search incl. abbreviations, category filter, page language
 * shared with the app (mt.locale.v1; terms stay English), deep links #<id>, structured data, entry links from
 * home/footer/Education, sitemap and 320 px layout. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
const slug=t=>String(t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
let browser;
(async()=>{
 // data integrity, without a browser
 const sb={window:{}};const ctxv=vm.createContext(sb);for(const f of ['glossary-data.js','glossary-data-more.js','glossary-data-3.js','glossary-data-4.js','glossary-data-5.js','glossary-data-6.js'])vm.runInContext(fs.readFileSync(path.join(root,'glossary',f),'utf8'),ctxv);
 const T=sb.window.MT_GLOSSARY,C=sb.window.MT_GLOSSARY_CATS;assert.ok(T.length>=1250,'at least 1250 terms');
 assert.equal(new Set(T.map(t=>t.id)).size,T.length,'term ids are unique');
 assert.equal(new Set(T.map(t=>t.term.toLowerCase())).size,T.length,'term names are unique');
 for(const t of T){assert.match(t.id,/^[a-z0-9-]+$/,'id format '+t.id);assert.ok(C[t.cat],'known category for '+t.id);assert.ok(t.term&&typeof t.d==='string'&&t.d.length>20&&t.d.length<300,'term and short explanation for '+t.id)}
 for(const k of Object.keys(C))assert.ok(T.some(t=>t.cat===k),'category in use: '+k);
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8'),index=JSON.parse(src.match(/const STATIC_TOOL_INDEX=(\[[\s\S]*?\]);/)[1]),ids=new Set(index.map(x=>slug(x.title)));
 const aliases=Function('return '+src.match(/const TOOL_LINK_ALIASES=(\{[^;]*\});/)[1])();
 for(const t of T.filter(x=>x.tool)){if(t.tool.startsWith('?tool=')){const id=t.tool.slice(6);assert.ok(ids.has(aliases[id]||id),'tool link resolves for '+t.id+' ('+id+')')}else{const p=t.tool.split('#')[0].replace(/^\//,'');assert.ok(fs.existsSync(path.join(root,p))&&(fs.statSync(path.join(root,p)).isFile()||fs.existsSync(path.join(root,p,'index.html'))),'page exists for '+t.id)}}
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({viewport:{width:1280,height:900}});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/glossary.html');await page.waitForTimeout(500);
 assert.equal(await page.locator('.g-term').count(),T.length,'all terms listed');
 assert.ok(await page.evaluate(()=>{const s=document.querySelector('script[type="application/ld+json"]');const j=s&&JSON.parse(s.textContent);return j&&j['@type']==='DefinedTermSet'&&j.hasDefinedTerm.length>=1250}),'DefinedTermSet structured data');
 // search: abbreviations rank first, case-insensitive, words inside explanations also match
 await page.fill('#g-q','sfoc');assert.equal((await page.$$eval('.g-term',x=>x.map(e=>e.id)))[0],'sfoc','abbreviation ranks first');
 await page.fill('#g-q','LAYTIME');assert.ok((await page.$$eval('.g-term',x=>x.map(e=>e.id))).includes('laytime'),'case-insensitive search');
 await page.fill('#g-q','fwa');assert.ok((await page.$$eval('.g-term',x=>x.map(e=>e.id))).includes('fwa'),'abbreviation search');
 await page.fill('#g-q','zzzz');assert.equal(await page.locator('.g-term').count(),0,'no hits');assert.match(await page.textContent('#g-count'),/No terms match/,'empty state explained');
 await page.fill('#g-q','');await page.click('.g-cat[data-cat="electrical"]');
 assert.ok(await page.$$eval('.g-term',x=>x.length>0&&x.every(e=>/Electrical/.test(e.querySelector('.g-cat-tag').textContent))),'category filter');
 assert.equal(await page.locator('#fwa').count(),0,'filtered-out terms are not rendered');
 await page.click('.g-cat[data-cat=""]');assert.equal(await page.getAttribute('#rob .g-open','href'),'index.html?tool=rob','calculator link');
 assert.equal(await page.locator('#g-note').isVisible(),false,'no language note in English'); assert.ok(await page.$$eval('#fwa .g-related a',x=>x.map(e=>e.getAttribute('href')).includes('#displacement')),'related terms link to other entries');assert.ok(await page.$$eval('.g-az-l',x=>x.length>=20&&x.every(e=>/^#[a-z0-9-]+$/.test(e.getAttribute('href')))),'A–Z bar links to the first term of each letter');await page.fill('#g-q','gm');assert.equal(await page.locator('#g-az').isVisible(),false,'A–Z bar hidden while searching');await page.fill('#g-q','');
 // page language shared with the app; terms stay English
 await page.selectOption('#language','nb');
 assert.equal(await page.textContent('h1'),'Maritim ordliste','heading in Norwegian');assert.equal(await page.textContent('#variation h2'),'Variation','terms stay in English');
 assert.match(await page.textContent('#g-note'),/arbeidsspråket/,'Norwegian note explains English terms');assert.equal(await page.textContent('#rob .g-open'),'Åpne kalkulatoren →','actions follow the page language');
 assert.equal(await page.evaluate(()=>localStorage.getItem('mt.locale.v1')),'"nb"','language saved in the app setting');
 await page.goto(base+'/glossary.html#fwa');await page.waitForTimeout(500);
 assert.equal(await page.textContent('h1'),'Maritim ordliste','language remembered');assert.ok(await page.evaluate(()=>document.getElementById('fwa').classList.contains('is-target')),'deep link highlights the term');
 // 320 px
 await page.setViewportSize({width:320,height:800});await page.goto(base+'/glossary.html');await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'no horizontal scroll at 320 px');
 // entry links
 await page.evaluate(()=>localStorage.setItem('mt.locale.v1',JSON.stringify('en')));await page.setViewportSize({width:1280,height:900});
 await page.goto(base+'/');await page.waitForTimeout(900);
 assert.ok(await page.locator('.home-role a[href="glossary.html"]').count()>=1,'home role links to the glossary');assert.equal(await page.locator('.site-footer a[href="glossary.html"]').count(),1,'footer link');
 await page.goto(base+'/students/');await page.waitForTimeout(600);assert.equal(await page.locator('#lessons a[href="../glossary.html"]').count(),1,'Education lessons section links to the glossary');
 assert.ok(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('https://www.marinetools.app/glossary.html'),'listed in sitemap');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`glossary (${engine}): ${T.length} terms in ${Object.keys(C).length} categories, links resolve, search, filter, language, deep link, 320 px OK`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
