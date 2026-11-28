/* Content-Security-Policy and referrer policy on the public top-level pages (index, glossary, regulatory):
 * the same policy everywhere, the pages load and work without any CSP violation, the external services the
 * site really uses (API, CDNs, Buy Me a Coffee, map tiles) are allowed, and anything else is blocked. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.mjs':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
const pages=['index.html','glossary.html','regulatory.html'];
const policy=f=>{const m=/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(fs.readFileSync(path.join(root,f),'utf8'));return m&&m[1]};
let browser;
(async()=>{
 // Static: one shared policy with the essential hardening directives; referrer policy present.
 const csp=policy('index.html');assert.ok(csp,'index.html has a CSP meta');
 for(const f of pages){assert.equal(policy(f),csp,f+' uses the shared CSP');assert.match(fs.readFileSync(path.join(root,f),'utf8'),/<meta name="referrer" content="strict-origin-when-cross-origin"/,f+' referrer policy');}
 for(const d of ["default-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'"])assert.ok(csp.includes(d),'CSP contains '+d);
 assert.ok(!/upgrade-insecure-requests/.test(csp),'no upgrade-insecure-requests (it breaks http://127.0.0.1 test servers in WebKit; the site is already HTTPS-only)');
 assert.ok(!/frame-ancestors|report-uri/.test(csp),'no header-only directives in the meta policy (browsers ignore them with a console error)');

 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 // No real network: every external request is answered locally (CSP is checked by the browser before this).
 await ctx.route(u=>!u.href.startsWith(base),r=>{const h=r.request().headers();r.fulfill({status:200,contentType:/\.css(\?|$)/.test(r.request().url())?'text/css':/\.js(\?|$)|\+esm/.test(r.request().url())?'application/javascript':'application/json',headers:{'access-control-allow-origin':h.origin||'*','access-control-allow-credentials':'true','access-control-allow-headers':h['access-control-request-headers']||'content-type','access-control-allow-methods':'GET,POST,OPTIONS'},body:/\.js(\?|$)|\+esm/.test(r.request().url())?'':/\.css/.test(r.request().url())?'':'{}'})});
 await ctx.addInitScript(()=>{window.__cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.__cspViolations.push(e.violatedDirective+' '+e.blockedURI))});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const f of pages){
  await page.goto(base+'/'+f);await page.waitForTimeout(1500);
  if(f==='index.html'){
   await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close?.());
   for(const id of ['weather','voyage-estimate','navigation','fuel','settings'])await page.evaluate(id=>window.__marineToolsOpenPage?.(id),id),await page.waitForTimeout(400);
  }
  const v=await page.evaluate(()=>window.__cspViolations);
  assert.deepEqual(v,[],f+': no CSP violations while loading and using the page');
 }
 // Allowed services pass, an unknown origin is blocked (proves the policy is active).
 await page.goto(base+'/index.html');await page.waitForTimeout(800);
 const probe=await page.evaluate(async()=>{const tryFetch=async u=>{try{await fetch(u,{mode:'cors'});return 'ok'}catch{return 'blocked'}};
  return {api:await tryFetch('https://api.marinetools.app/api/health'),cdn:await tryFetch('https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/dist/ports.json'),sodir:await tryFetch('https://factmaps.sodir.no/api/rest/x'),evil:await tryFetch('https://example.com/collect')}});
 // The violation event is dispatched asynchronously after the blocked request.
 await page.waitForFunction(()=>window.__cspViolations.some(x=>x.includes('example.com')),null,{timeout:5000}).catch(()=>{});probe.violations=await page.evaluate(()=>window.__cspViolations);
 assert.equal(probe.api,'ok','API allowed');assert.equal(probe.cdn,'ok','jsDelivr allowed');assert.equal(probe.sodir,'ok','Sodir factmaps allowed');
 assert.equal(probe.evil,'blocked','unknown origin blocked');assert.ok(probe.violations.some(x=>x.includes('example.com')),'violation reported for the unknown origin');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`security policy (${engine}): shared CSP + referrer on ${pages.length} pages, no violations, allowed services pass, unknown origin blocked`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
