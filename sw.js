const CACHE='marine-tools-fullscale-20261003-v8-5-5-cleanup1';
const SHELL=[
  './','./index.html','./styles.css','./app.js','./ui-v854.js','./weather-map-v854.js','./manifest.webmanifest',
  './assets/icon-192.png',
  './assets/hero-lantern-desktop.webp','./assets/hero-lantern-tablet.webp','./assets/hero-lantern-mobile.webp'
];
self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;

  const isNavigation=e.request.mode==='navigate';
  const isCode=/\.(?:css|js)$/i.test(u.pathname);
  const isStatic=u.pathname.startsWith('/assets/') || /\.(?:css|js|webmanifest|png|jpg|jpeg|webp|svg|ico)$/i.test(u.pathname);

  if(isNavigation){
    e.respondWith(fetch(e.request).then(r=>{
      const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }

  if(isCode){
    e.respondWith(fetch(e.request).then(r=>{
      if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r;
    }).catch(async()=>await caches.match(e.request)||await caches.match(u.pathname)));
    return;
  }

  if(isStatic){
    e.respondWith(caches.match(e.request).then(cached=>{
      const update=fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>null);
      if(cached){e.waitUntil(update);return cached}return update.then(r=>r||caches.match(e.request));
    }));
    return;
  }

  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
