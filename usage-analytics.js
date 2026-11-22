/* Consent-gated first-party usage analytics. Never include inputs, results, search text or full URLs. */
(() => {
'use strict';
const hosts=new Set(['marinetools.app','www.marinetools.app']);
const key='mt.analytics.browser.v1',sessionKey='mt.analytics.visit.v1',consentKey='mt.analytics.consent.v1';
const consentRevision='2026-11-22';
const read=(store,k,f)=>{try{return JSON.parse(store.getItem(k))??f}catch{return f}};
const write=(store,k,v)=>{try{store.setItem(k,JSON.stringify(v))}catch{}};
const safe=(v,max=64)=>String(v||'').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,max);
const cleanHost=v=>String(v||'').toLowerCase().replace(/^www\./,'').replace(/[^a-z0-9.-]/g,'').slice(0,120);
const pathOnly=()=>String(location.pathname||'/').replace(/[^a-z0-9/_ .-]/gi,'').slice(0,120)||'/';
function consentStatus(){const row=read(localStorage,consentKey,null);if(row&&row.revision===consentRevision&&['granted','denied'].includes(row.status))return row.status;const legacy=read(localStorage,'mt.settings',{});return legacy?.usageAnalytics===false?'denied':'unset'}
function settings(){return read(localStorage,'mt.settings',{})||{}}
function enabled(){return hosts.has(location.hostname)&&consentStatus()==='granted'&&settings().usageAnalytics!==false&&localStorage.getItem('mt.analytics.exclude')!=='1'&&navigator.doNotTrack!=='1'&&!navigator.webdriver}
function clearIdentifiers(){
 for(const k of [key,'mt.analytics.lastVisit'])localStorage.removeItem(k);
 for(const k of [sessionKey,'mt.analytics.session'])sessionStorage.removeItem(k);
 browser=null;visit=null;seenVisit='';
}
function device(){return innerWidth<=760?'mobile':innerWidth<=1100?'tablet':'desktop'}
function os(){
 const u=navigator.userAgent||'',p=navigator.platform||'';
 if(/android/i.test(u))return'android';if(/iphone|ipad|ipod/i.test(u)||/mac/i.test(p)&&navigator.maxTouchPoints>1)return'ios';
 if(/windows/i.test(u+p))return'windows';if(/cros/i.test(u))return'chromeos';if(/mac/i.test(u+p))return'macos';if(/linux/i.test(u+p))return'linux';return'other';
}
function browserFamily(){
 const u=navigator.userAgent||'';
 if(/edg\//i.test(u))return'edge';if(/samsungbrowser\//i.test(u))return'samsung-internet';if(/opr\//i.test(u))return'opera';
 if(/firefox\//i.test(u))return'firefox';if(/chrome\//i.test(u)||/crios\//i.test(u))return'chrome';if(/safari\//i.test(u))return'safari';return'other';
}
function platform(){
 try{if(window.Capacitor?.isNativePlatform?.())return safe(window.Capacitor.getPlatform?.()||'native',24)||'native'}catch{}
 try{if(window.__TAURI_INTERNALS__)return'windows-app'}catch{}
 if(matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true)return'pwa';
 return'web';
}
function referral(){
 let referrer='';
 try{referrer=cleanHost(new URL(document.referrer).hostname)}catch{}
 const q=new URLSearchParams(location.search),utmSource=safe(q.get('utm_source')),utmMedium=safe(q.get('utm_medium')),utmCampaign=safe(q.get('utm_campaign'));
 let source='direct';
 if(referrer&&hosts.has(referrer))source='internal';
 else if(/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com)$/.test(referrer))source='search';
 else if(/(^|\.)linkedin\.com$/.test(referrer))source='linkedin';
 else if(/(^|\.)facebook\.com$|(^|\.)fb\.com$/.test(referrer))source='facebook';
 else if(/(^|\.)reddit\.com$/.test(referrer))source='reddit';
 else if(/(^|\.)instagram\.com$/.test(referrer))source='instagram';
 else if(/(^|\.)(x\.com|twitter\.com)$/.test(referrer))source='x';
 else if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(referrer))source='youtube';
 else if(referrer)source='other-referral';
 if(utmMedium==='email'||utmMedium==='newsletter')source='email';
 else if(utmMedium==='qr')source='qr';
 else if(utmSource&&['linkedin','facebook','reddit','instagram','x','youtube','teaching','newsletter'].includes(utmSource))source=utmSource==='newsletter'?'email':utmSource;
 else if(utmSource&&source==='direct')source='other-campaign';
 return{source,referrer,utmSource,utmMedium,utmCampaign,landingPage:pathOnly(),os:os(),browser:browserFamily(),platform:platform()};
}
let browser=null,visit=null,seenVisit='',attempt=null;
function context(){
 if(!enabled())return null;
 const now=Date.now();
 if(!browser){browser=read(localStorage,key,null);if(!browser||now-browser.created>180*86400000)browser={id:crypto.randomUUID(),created:now};write(localStorage,key,browser)}
 visit=read(sessionStorage,sessionKey,null);
 if(!visit||now-visit.last>1800000){
  const previous=read(localStorage,'mt.analytics.lastVisit',null);
  visit={id:crypto.randomUUID(),last:now,returning:!!previous,...referral()};
  write(localStorage,'mt.analytics.lastVisit',{at:now});
 }else if(!visit.landingPage)visit={...visit,...referral()};
 visit.last=now;write(sessionStorage,sessionKey,visit);
 return{visitor:browser.id,session:visit.id,source:visit.source||'direct',visitorKind:visit.returning?'returning':'new',schema:'usage-v1',referrer:visit.referrer||'',utmSource:visit.utmSource||'',utmMedium:visit.utmMedium||'',utmCampaign:visit.utmCampaign||'',landingPage:visit.landingPage||'/',os:visit.os||'other',browser:visit.browser||'other',platform:visit.platform||'web'};
}
function page(){return location.pathname.startsWith('/students')?'education':document.querySelector('.page.active')?.id||'home'}
function send(event,tool='',pageId=page(),label=''){
 const meta=context();if(!meta||!navigator.onLine)return;
 fetch('https://api.marinetools.app/api/analytics/event',{method:'POST',headers:{'content-type':'text/plain;charset=UTF-8'},keepalive:true,cache:'no-store',body:JSON.stringify({event,page:pageId,tool,device:device(),version:window.__MARINE_TOOLS_RELEASE?.version||'8.9.0',label:label||document.getElementById(tool)?.closest('.tool-card')?.dataset.toolTitle||document.getElementById(tool)?.closest('.tool-card')?.querySelector('h3')?.textContent||'',...meta})}).catch(()=>{});
}
function ensureVisit(){const meta=context();if(meta&&navigator.onLine&&seenVisit!==meta.session){seenVisit=meta.session;send('visit_started');if(meta.visitorKind==='returning')send('return_visit')}}
function removeConsentUi(){document.getElementById('mt-analytics-consent')?.remove()}
function showConsent(){
 if(!hosts.has(location.hostname)||consentStatus()!=='unset'||localStorage.getItem('mt.analytics.exclude')==='1'||navigator.doNotTrack==='1'||navigator.webdriver||document.getElementById('mt-analytics-consent'))return;
 const style=document.createElement('style');style.id='mt-analytics-consent-style';style.textContent='.mt-analytics-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:100001;max-width:760px;margin:auto;padding:16px;border:1px solid #31566d;border-radius:14px;background:#071b29f7;color:#eef8fd;box-shadow:0 16px 50px #0009;font:14px/1.45 system-ui,sans-serif}.mt-analytics-consent h2{font-size:17px;margin:0 0 6px}.mt-analytics-consent p{margin:5px 0;color:#c3d7e2}.mt-analytics-consent .mt-consent-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.mt-analytics-consent button,.mt-analytics-consent a{min-height:42px;padding:9px 13px;border-radius:9px;border:1px solid #3d667e;background:#0b2b40;color:#fff;font-weight:700;text-decoration:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.mt-analytics-consent button{flex:1 1 145px}.mt-analytics-consent a{font-weight:600}.mt-analytics-consent .mt-consent-close{position:absolute;right:8px;top:7px;min-height:32px;width:32px;padding:0;border:0;background:transparent;font-size:20px;flex:none}@media(max-width:360px){.mt-analytics-consent{left:6px;right:6px;bottom:6px;padding:13px}.mt-analytics-consent .mt-consent-actions{display:grid;grid-template-columns:1fr}}';
 document.head.append(style);
 const box=document.createElement('section');box.id='mt-analytics-consent';box.className='mt-analytics-consent';box.setAttribute('role','dialog');box.setAttribute('aria-labelledby','mt-consent-title');
 box.innerHTML='<button type="button" class="mt-consent-close" aria-label="Close analytics choice">×</button><h2 id="mt-consent-title">Usage analytics</h2><p>Marine Tools would like to use optional analytics to understand traffic sources, device and platform mix, and which tools are useful. Analytics can use a random browser and visit identifier. Calculation values, routes, vessel data and full referring URLs are not collected.</p><p><b>Analytics is optional. Marine Tools works without it.</b></p><div class="mt-consent-actions"><button type="button" data-consent="denied">Reject analytics</button><button type="button" data-consent="granted">Allow analytics</button><a href="/?page=privacy">Read Privacy &amp; data</a></div>';
 box.addEventListener('click',e=>{const choice=e.target.closest('[data-consent]')?.dataset.consent;if(choice)setConsent(choice);else if(e.target.closest('.mt-consent-close'))setConsent('denied')});
 document.body.append(box);window.MT_I18N?.translate(document);
}
function setConsent(status){
 if(!['granted','denied'].includes(status))return;
 write(localStorage,consentKey,{status,revision:consentRevision,at:new Date().toISOString()});
 const s=settings();write(localStorage,'mt.settings',{...s,usageAnalytics:status==='granted'});
 if(status==='denied')clearIdentifiers();
 removeConsentUi();
 window.dispatchEvent(new CustomEvent('mt-analytics-consent-change',{detail:{status}}));
 if(status==='granted')ensureVisit();
}
window.MT_USAGE={enabled,context,send,record:report,consentStatus,setConsent,showConsent,exclude(on){localStorage.setItem('mt.analytics.exclude',on?'1':'0');if(on)clearIdentifiers();else ensureVisit()}};
function report(event,tool,pageId,label){ensureVisit();send(event,tool,pageId,label);if(['calculation_succeeded','education_module'].includes(event))send('active_usage','',pageId)}
function actionTool(target){const card=target.closest('.tool-card');return card?.querySelector('.calc-action[id],[data-usage-action][id]')?.id||''}
document.addEventListener('mt-calculation-result',e=>{if(attempt&&attempt.card?.contains(e.target))attempt.outcome=e.detail.valid?'calculation_succeeded':'calculation_invalid'},true);
document.addEventListener('click',e=>{
 const copy=e.target.closest('.copy-result,[data-history-copy],#copyConsumption');if(copy){const tool=actionTool(copy)||safe(copy.id||'copy',80);report('result_copied',tool,page());return}
 const share=e.target.closest('.share-result');if(share){report('result_shared',actionTool(share)||'share',page());return}
 const exported=e.target.closest('[id^="export"],[data-usage-export]');if(exported){report('result_exported',actionTool(exported)||safe(exported.id||'export',80),page());return}
 const storeLink=e.target.closest('a[data-store],a[href*="play.google.com"],a[href*="apps.microsoft.com"]');if(storeLink){let store=safe(storeLink.dataset.store,40);if(!store){try{store=new URL(storeLink.href).hostname.includes('google')?'google-play':'microsoft-store'}catch{store='store'}}report('store_clicked',store,page());return}
 const button=e.target.closest('.calc-action,[data-usage-action]');if(!button)return;
 ensureVisit();const card=button.closest('.tool-card'),tool=button.id;if(!tool)return;
 const pending=attempt={card,tool,page:page(),outcome:null};send('calculation_attempt',tool,pending.page);
 setTimeout(()=>{if(pending.outcome)report(pending.outcome,tool,pending.page);if(attempt===pending)attempt=null},0);
},true);
let observed=new WeakSet();
function observeTools(){
 if(!window.IntersectionObserver)return;
 const observer=new IntersectionObserver(entries=>{for(const x of entries){if(!x.isIntersecting||x.target.hidden)continue;const button=x.target.querySelector('.calc-action[id],[data-usage-action][id]');if(button){report('tool_opened',button.id,x.target.closest('.page')?.id||page());observer.unobserve(x.target)}}},{threshold:.35});
 function scan(){document.querySelectorAll('.page.active .tool-card').forEach(card=>{if(!observed.has(card)){observed.add(card);observer.observe(card)}})}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});scan();
}
function boot(){if(page()==='education'&&window.parent!==window)return;showConsent();ensureVisit();observeTools();
 if(page()==='education'){
  if(window.parent!==window)return;
  report('education_page',location.pathname.split('/').pop()?.replace(/\.html$/,'')||'index');
  let lastModule='';const module=()=>{const id=document.getElementById('module-quick')?.value||document.getElementById('module')?.value||(['lifting','trim','tank','pump','crank','faults','cargo','stability','controls','engine','mollier','rlc','heat','current','finance'].includes(location.hash.slice(1))?location.hash.slice(1):'');if(id&&id!==lastModule&&/^[a-z0-9-]{1,50}$/i.test(id)){lastModule=id;report('education_module',id)}};
  module();window.addEventListener('hashchange',module);
  document.addEventListener('change',e=>{if(['module','module-quick'].includes(e.target.id))module();else if(e.target.matches('select')&&/discipline|subject|study-group|topic-filter/i.test(e.target.id))report('education_filter',(e.target.id+'-'+e.target.value).toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,80))});
  document.addEventListener('click',e=>{const card=e.target.closest('[data-formula-id]');if(card&&e.target.closest('summary,[data-open]'))report('education_formula',card.dataset.formulaId)});
  document.addEventListener('mt-presentation-change',e=>{if(e.detail.presenting)report('education_presentation','presentation')});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
