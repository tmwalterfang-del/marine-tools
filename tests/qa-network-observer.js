// Opt-in preview diagnostic. Store only method, origin/path, status and safe headers.
(() => {
 'use strict';
 if(!/^[a-z0-9-]+\.marine-tools-frontend-preview\.pages\.dev$/i.test(location.hostname)||new URLSearchParams(location.search).get('qa-audit')!=='1')return;
 const safe=value=>{try{const u=new URL(value,location.href);return u.origin+u.pathname;}catch{return'unknown';}};
 const publish=record=>{if(parent!==window)parent.postMessage({type:'marine-qa-network',record},location.origin);};
 const headers=response=>Object.fromEntries(['content-type','x-marine-tools-environment','x-marine-tools-analytics','x-marine-tools-ais-provider','access-control-allow-origin','access-control-allow-credentials','vary'].map(k=>[k,response.headers.get(k)]).filter(([,v])=>v!==null));
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async(input,init)=>{
  const url=safe(typeof input==='string'?input:input?.url),method=init?.method||input?.method||'GET';
  // A diagnostic must never create a production write if a regression occurs.
  if(url.startsWith('https://api.marinetools.app/')&&!['GET','HEAD','OPTIONS'].includes(method.toUpperCase())){publish({kind:'production-write-blocked',url,method});throw Error('QA diagnostic blocked production write');}
  try{const response=await nativeFetch(input,init);publish({kind:'fetch',url,method,status:response.status,headers:headers(response)});return response;}
  catch(error){publish({kind:'fetch-failed',url,method});throw error;}
 };
 const beacon=navigator.sendBeacon?.bind(navigator);
 if(beacon)navigator.sendBeacon=(url,data)=>{const target=safe(url);if(target.startsWith('https://api.marinetools.app/')){publish({kind:'production-write-blocked',url:target,method:'BEACON'});return false;}publish({kind:'beacon',url:target,method:'BEACON'});return beacon(url,data);};
 const open=XMLHttpRequest.prototype.open,send=XMLHttpRequest.prototype.send,info=new WeakMap();
 XMLHttpRequest.prototype.open=function(method,url,...rest){info.set(this,{method:String(method),url:safe(url)});return open.call(this,method,url,...rest);};
 XMLHttpRequest.prototype.send=function(...args){const request=info.get(this);if(request?.url.startsWith('https://api.marinetools.app/')&&!['GET','HEAD','OPTIONS'].includes(request.method.toUpperCase())){publish({kind:'production-write-blocked',...request});throw Error('QA diagnostic blocked production write');}this.addEventListener('loadend',()=>publish({kind:'xhr',...request,status:this.status}),{once:true});return send.apply(this,args);};
 if(typeof PerformanceObserver==='function'){
  const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())publish({kind:'resource',url:safe(entry.name),initiator:entry.initiatorType});});
  observer.observe({type:'resource',buffered:true});
 }
 addEventListener('DOMContentLoaded',()=>publish({kind:'preconnects',urls:[...document.querySelectorAll('link[rel="preconnect"]')].map(x=>safe(x.href))}),{once:true});
})();
