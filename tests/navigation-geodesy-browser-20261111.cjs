/* Browser check: navigation calculators use WGS 84 geodesy on the live page, in EN and NB.
 * Expected values: Vincenty (1975) for the geodesic and Simpson-integrated rhumb line,
 * computed in tests/navigation-geodesy-20261111.cjs; rounded here as displayed.
 * Run: node tests/navigation-geodesy-browser-20261111.cjs chromium|firefox|webkit */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',root=process.cwd();let browser,server;
(async()=>{
 server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch(process.env.STUDENTS_BROWSER_EXECUTABLE&&engine==='chromium'?{executablePath:process.env.STUDENTS_BROWSER_EXECUTABLE}:{});
 let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
 for(const locale of ['en','nb']){
  const context=await browser.newContext({serviceWorkers:'block'});await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  // Saved route: Oslofjord – Lindesnes – Stavanger approach, for the closest-point card.
  await context.addInitScript(([l,route])=>{try{localStorage.setItem('mt.locale.v1',JSON.stringify(l));localStorage.setItem('mt.route',JSON.stringify(route))}catch{}},[locale,[{lat:59.9,lon:10.7},{lat:59.0,lon:10.5},{lat:58.0,lon:7.5},{lat:58.9,lon:5.6}]]);
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/index.html?page=navigation');await p.locator('#calcGcRhumb').waitFor({state:'attached'});await p.evaluate(()=>window.MT_I18N&&MT_I18N.ready);
  ok(await p.evaluate(()=>!!window.MT_GEO&&MT_GEO.ellipsoid==='WGS84'),'geodesy module loaded');
  await p.evaluate(()=>document.getElementById('calcGcRhumb').click());await p.waitForTimeout(100);
  const gc=(await p.locator('#resGcRhumb').innerText()).replace(/\s+/g,' ');
  // Geodesic 149.02 NM, initial course 261.6°T; rhumb 149.05 NM, 259.5°T (spherical model gave 148.50 / 148.53 NM).
  ok(/GC 149[.,]02 NM · 261[.,]6°T/.test(gc),'geodesic distance and course: '+gc);ok(/149[.,]05 NM · 259[.,]5°T/.test(gc),'ellipsoidal rhumb line: '+gc);
  if(locale==='nb')ok(/149,02/.test(gc),'Norwegian decimal comma');
  await p.evaluate(()=>{document.getElementById('nearLat').value='58,3';document.getElementById('nearLon').value='8,2';document.getElementById('calcNearest').click()});await p.waitForTimeout(100);
  const near=(await p.locator('#resNearest').innerText()).replace(/\s+/g,' ');
  // 2.78 NM from leg 2 (59.0N 10.5E – 58.0N 7.5E); same case is brute-force checked with Vincenty in the unit test.
  ok(/2[.,]78 NM (from route|fra ruten)/.test(near)&&/(leg|etappe) 2,/.test(near),'closest point names the route leg: '+near);
  await p.evaluate(()=>{document.getElementById('nearLat').value='';document.getElementById('calcNearest').click()});await p.waitForTimeout(50);
  ok(/caution|invalid/.test(await p.locator('#resNearest').getAttribute('class')),'blank position is rejected');
  if(locale==='nb')ok(!(await p.evaluate(()=>[...(window.MT_I18N?.missing||[])])).some(m=>/along the route|WGS 84 ellipsoid|configured AIS corridor/.test(m)),'new texts translated');
  // Position editor layout: every degree/minute/hemisphere field stays inside its fieldset and fields never overlap.
  for(const width of [1440,1100,980,390,320]){
   await p.setViewportSize({width,height:900});await p.waitForTimeout(80);
   const bad=await p.evaluate(()=>{const out=[];for(const g of document.querySelectorAll('.coord-group')){if(!g.offsetParent)continue;const gr=g.getBoundingClientRect();
    for(const row of g.querySelectorAll('.coord-row')){const els=[...row.querySelectorAll('input,select')].map(e=>e.getBoundingClientRect());
     els.forEach((r,i)=>{if(r.left<gr.left-1||r.right>gr.right+1)out.push(`${g.querySelector('legend')?.textContent} field ${i} outside fieldset`);
      if(i&&r.left<els[i-1].right-1&&r.top<els[i-1].bottom-1&&r.bottom>els[i-1].top+1)out.push(`${g.querySelector('legend')?.textContent} fields ${i-1}/${i} overlap`)})}}return out});
   ok(bad.length===0,`position editor layout at ${width}px: `+bad.slice(0,4).join('; '));
  }
  ok(errors.length===0,'no page errors: '+errors.join('; '));
  await context.close();
 }
 console.log(JSON.stringify({status:'PASS',engine,checks}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
