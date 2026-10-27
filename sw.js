const CACHE='marine-tools-fullscale-20261019-v8-7-0-education-20261027-session-diagrams-6-update-coherence';
const SHELL=['./','./index.html','./styles.css','./home-commonjobs-v858.css','./home-icons-v858.css','./product-v860.css','./ui-v861.css','./release-v860.js','./app.js','./usage-analytics.js','./ui-v854.js','./weather-map-v854.js','./analytics-v856.js','./product-v860.js','./support-widget-v857.js','./sidebar-v858.css','./sidebar-v858.js','./sidebar-active-v860.js','./ui-v861.js','./whats-new-v861.js','./voyage-estimate-v861.js','./voyage-estimate-v861.css','./voyage-planning-draft-v1.js','./voyage-planning-draft-v1.css','./global-polish-v862.css','./manifest.webmanifest','./assets/icon-192.png','./assets/hero-lantern-desktop.webp','./assets/hero-lantern-tablet.webp','./assets/hero-lantern-mobile.webp','./students/','./students/index.html','./students/styles.css','./students/formulas.js','./students/formulas-expansion-v1.js','./students/formulas-extension.js','./students/calculators.js','./students/calculators-expansion-v1.js','./students/calculators-extension.js','./students/learning-data.js','./students/book-photos-20261020.js','./students/math-chapter-20261020.js','./students/physics-chapter-20261020.js','./students/labs.html','./students/labs.css','./students/lab-models.js','./students/labs.js','./students/study-export.js','./students/study-tools.css','./students/study-tools.js','./students/diagram-tools.js','./students/mollier.html','./students/mollier.css','./students/vendor/neutrium-if97.min.js','./students/IF97_ATTRIBUTION.md','./students/mollier-if97.js','./students/mollier.js','./students/applied-controls-20261020.js','./students/mechanics-p42-20261020.js','./students/chapter-topics-a-20261020.js','./students/chapter-topics-b-20261020.js','./students/symbol-definitions-20261020.js','./students/physics-equation-audit-20261020.js','./students/math-equation-audit-20261020.js','./students/mechanics-equation-audit-20261020.js','./students/machine-elements-audit-20261020.js','./students/chemistry-equation-audit-20261020.js','./students/chapter-6-audit-20261020.js','./students/chapter-7-audit-20261020.js','./students/chapter-8-audit-20261020.js','./students/chapter-9-audit-20261020.js','./students/chapter-10-audit-20261020.js','./students/chapter-11-audit-20261020.js','./students/chapter-12-audit-20261020.js','./students/chapter-13-audit-20261020.js','./students/chapter-14-audit-20261020.js','./students/chapter-15-audit-20261020.js','./students/chapter-16-audit-20261020.js','./students/chapter-index.js','./students/chapters.html','./students/interactive.html','./students/interactive.js','./students/workspace.css','./students/cargo.html','./students/cargo-model.js','./students/cargo.js','./students/examples.html','./students/example-models.js','./students/example-schemas.js','./students/examples.js','./students/explorers.html','./students/explorer-models.js','./students/explorers.js','./students/symbol-review-20261020.js','./students/teaching-view.js','./students/source-review-20261020.js','./students/review-followup-20261027.js','./students/navigation.css','./students/symbol-index.js','./students/app.js'];
// Private Pages previews must return to the Access gate after a session ends.
// Never keep an offline copy of protected HTML or code on these origins.
const PRIVATE_PREVIEW=/\.pages\.dev$/i.test(self.location.hostname);
if(PRIVATE_PREVIEW){
 self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
 self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
 self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>e.request.mode==='navigate'?new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private preview is offline</title><h1>Private preview requires an internet connection</h1><p>Reconnect and sign in through Cloudflare Access. Downloaded study reports and scenario files remain available separately.</p></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}):Response.error()));
 });
}else{
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(url=>new Request(url,{cache:'reload'}))))));
// Public website updates activate only after all old clients close.
// Legacy pages cannot force a waiting release over an active calculation.
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-fullscale-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
 // Pin the complete installed shell, including query-versioned script references,
 // to this release. Never overwrite its cache with files from a later deployment.
 const shellPath=SHELL.some(url=>new URL(url,self.location.href).pathname===u.pathname);
 if(shellPath){e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||Response.error()));return}
 // Online services and non-shell navigation remain network-only. No stale API
 // response is silently substituted for current external data.
 e.respondWith(fetch(e.request));
});

}
