(() => {
  'use strict';
  window.__MARINE_TOOLS_PREVIEW=true;
  const api='https://api.marinetools.app';
  const readPaths=new Set(['/api/health','/api/release','/api/auth/status','/api/weather','/api/forecast','/api/ais/latest']);
  const realFetch=window.fetch.bind(window);
  // Defense in depth: prevent preview writes even if another feature starts
  // emitting telemetry. GETs below still reach production and its request logs.
  window.fetch=function(input,init){
    const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);
    const method=String(init?.method||input?.method||'GET').toUpperCase();
    if(url.origin===api&&(method!=='GET'||!readPaths.has(url.pathname))){
      return Promise.reject(new TypeError('Production API write blocked in frontend preview'));
    }
    return realFetch(input,init);
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const banner=document.getElementById('mtPreviewBanner');
    const resize=()=>document.documentElement.style.setProperty('--mt-preview-height',`${banner.offsetHeight}px`);
    resize();new ResizeObserver(resize).observe(banner);
    // Registrations and caches are scoped to this preview origin. Do not clear
    // localStorage: vessel profiles and test histories must survive a reload.
    if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.map(r=>r.unregister()))).catch(()=>{});
    if('caches'in window)caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-')).map(k=>caches.delete(k)))).catch(()=>{});
  });
})();
