/* Aggregate usage only: never include inputs, results, search text or URLs. */
(() => {
'use strict';
const hosts=new Set(['marinetools.app','www.marinetools.app']);
const CONSENT='20261022-v1';
const key='mt.analytics.browser.v1',sessionKey='mt.analytics.visit.v1';
const read=(store,k,f)=>{try{return JSON.parse(store.getItem(k))||f}catch{return f}};
const write=(store,k,v)=>{try{store.setItem(k,JSON.stringify(v))}catch{}};
function enabled(){try{const settings=read(localStorage,'mt.settings',{});return hosts.has(location.hostname)&&settings.usageAnalytics===true&&settings.analyticsConsent===CONSENT&&localStorage.getItem('mt.analytics.exclude')!=='1'&&navigator.doNotTrack!=='1'&&!navigator.webdriver}catch{return false}}
let browser=null,visit=null;
function context(){
 if(!enabled())return null;
 const now=Date.now();
 if(!browser){browser=read(localStorage,key,null);if(!browser||now-browser.created>180*86400000)browser={id:crypto.randomUUID(),created:now};write(localStorage,key,browser)}
 visit=read(sessionStorage,sessionKey,null);
 if(!visit||now-visit.last>1800000){const previous=read(localStorage,'mt.analytics.lastVisit',null);visit={id:crypto.randomUUID(),last:now,returning:!!previous,source:source()};write(localStorage,'mt.analytics.lastVisit',{at:now})}
 visit.last=now;write(sessionStorage,sessionKey,visit);
 return{visitor:browser.id,session:visit.id,source:visit.source,visitorKind:visit.returning?'returning':'new',schema:'usage-v1'};
}
function source(){
 // Only coarse categories or an explicitly allowlisted campaign, never raw referrers.
 const campaign=new URLSearchParams(location.search).get('utm_source');
 if(['teaching','linkedin','newsletter'].includes(campaign))return campaign;
 try{const h=new URL(document.referrer).hostname;if(hosts.has(h))return 'internal';if(/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com)$/.test(h))return 'search';if(/(^|\.)linkedin\.com$/.test(h))return 'linkedin';return 'other-referral'}catch{return 'direct'}
}
function page(){return location.pathname.startsWith('/students')?'education':document.querySelector('.page.active')?.id||'home'}
function send(event,tool='',pageId=page(),label=''){
 const meta=context();if(!meta||!navigator.onLine)return;
 fetch('https://api.marinetools.app/api/analytics/event',{method:'POST',headers:{'content-type':'text/plain;charset=UTF-8'},keepalive:true,cache:'no-store',body:JSON.stringify({event,page:pageId,tool,device:innerWidth<=760?'mobile':innerWidth<=1100?'tablet':'desktop',version:window.__MARINE_TOOLS_RELEASE?.version||'8.7.0',consent:CONSENT,label:label||document.getElementById(tool)?.closest('.tool-card')?.dataset.toolTitle||document.getElementById(tool)?.closest('.tool-card')?.querySelector('h3')?.textContent||'',...meta})}).catch(()=>{});
}

function clearIdentity(){
 browser=null;visit=null;seenVisit='';
 for(const name of ['localStorage','sessionStorage']){try{const storage=window[name];for(let i=storage.length-1;i>=0;i--){const k=storage.key(i);if(k.startsWith('mt.analytics.')&&k!=='mt.analytics.exclude'||k==='mt.visitedBefore')storage.removeItem(k)}}catch{}}
}
function setConsent(allow){const settings=read(localStorage,'mt.settings',{});write(localStorage,'mt.settings',{...settings,usageAnalytics:!!allow,analyticsConsent:CONSENT});if(!allow)clearIdentity();document.getElementById('mtAnalyticsChoice')?.remove();window.dispatchEvent(new CustomEvent('mt-analytics-consent-change',{detail:{enabled:enabled()}}));if(allow)ensureVisit()}
function showChoice(){
 let settings;try{settings=read(localStorage,'mt.settings',{})}catch{return}if(!hosts.has(location.hostname)||settings.analyticsConsent===CONSENT||navigator.doNotTrack==='1'||navigator.webdriver)return;
 const panel=document.createElement('aside');panel.id='mtAnalyticsChoice';panel.setAttribute('aria-label','Optional usage analytics');panel.className='mt-analytics-choice';
 panel.innerHTML='<strong>Optional usage analytics</strong><p>May Marine Tools count visits and tool use with random browser and visit IDs? Calculation values stay out of analytics. All tools work if you decline.</p><div><button type="button" id="mtAllowAnalytics" class="btn">Allow analytics</button><button type="button" id="mtDeclineAnalytics" class="btn">Decline</button><button type="button" data-go="privacy" class="btn">Privacy & data</button></div>';
 document.body.append(panel);panel.querySelector('#mtAllowAnalytics').onclick=()=>setConsent(true);panel.querySelector('#mtDeclineAnalytics').onclick=()=>setConsent(false);
}

let seenVisit='',attempt=null;
function ensureVisit(){const meta=context();if(meta&&navigator.onLine&&seenVisit!==meta.session){seenVisit=meta.session;send('visit_started');if(meta.visitorKind==='returning')send('return_visit')}}
window.MT_USAGE={enabled,context,send,record:report,setConsent,exclude(on){localStorage.setItem('mt.analytics.exclude',on?'1':'0');if(on)clearIdentity();else ensureVisit()}};
function report(event,tool,pageId,label){ensureVisit();send(event,tool,pageId,label);if(['calculation_succeeded','education_module'].includes(event))send('active_usage','',pageId)}
document.addEventListener('mt-calculation-result',e=>{if(attempt&&attempt.card?.contains(e.target))attempt.outcome=e.detail.valid?'calculation_succeeded':'calculation_invalid'},true);
document.addEventListener('click',e=>{
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
function boot(){showChoice();if(!enabled())clearIdentity();if(page()==='education'&&window.parent!==window)return;ensureVisit();observeTools();
 if(page()==='education'){
  if(window.parent!==window)return; // Workspace frames must not duplicate page/module counts.
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
