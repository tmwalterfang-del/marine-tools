(() => {
'use strict';

const RELEASE={
  version:'8.5.7',
  released:'2026-10-03',
  build:'20261003-v8-5-7-navfix-1',
  notes:[
    'Unified release/version reporting across analytics, health checks and the UI.',
    'Automatic post-deploy smoke tests for API, Weather, AIS, static assets and Navigation math.',
    'Technical-health analytics with latency percentiles, failure rate and latest-error timing.',
    'Clearer live-data source and freshness information in Weather, AIS and Route Intelligence.',
    'In-app update notification so a hard refresh is no longer the normal update path.',
    'Release changelog and a fixed mobile QA checklist for future releases.'
  ],
  history:[
    {version:'8.5.7',date:'2026-10-03',title:'Release hardening',items:['Unified release metadata','Automated smoke tests','Technical health dashboard','Data freshness labels','Update available flow','Mobile release QA']},
    {version:'8.5.6',date:'2026-10-03',title:'Analytics Dashboard v2',items:['Product analytics','Search and feature usage','Live-data reliability','Weather/AIS source mix','90-day reporting']},
    {version:'8.5.5',date:'2026-10-03',title:'DDM consistency + cleanup',items:['DDM across relevant position tools','Weather/AIS copy cleanup','Retired UKC UI','Consolidated Weather/AIS worker path']},
    {version:'8.5.4',date:'2026-10-03',title:'Global waves + Navigation precision',items:['NOAA/NCEP GFS-Wave fallback','More precise Navigation output','Production Weather map']},
    {version:'8.5.3',date:'2026-10-03',title:'Weather safety improvements',items:['Weather map','Beaufort conversion','Fast inland Weather handling']}
  ]
};
window.__MARINE_TOOLS_RELEASE=RELEASE;

const API='https://api.marinetools.app';
const realFetch=window.fetch.bind(window);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DISMISS_KEY='mt.update.dismissed.version';
let registration=null,lastRemoteCheck=0,currentRemoteVersion='',silentActivation=false,reloading=false;

function versionParts(v){return String(v||'').split('.').map(x=>Number.parseInt(x,10)||0)}
function isNewer(remote,local){const a=versionParts(remote),b=versionParts(local),n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const x=a[i]||0,y=b[i]||0;if(x>y)return true;if(x<y)return false}return false}
function normalizeAnalyticsBody(url,init){
  if(url.origin!==API||url.pathname!=='/api/analytics/event'||!init?.body||typeof init.body!=='string')return init;
  try{const body=JSON.parse(init.body);body.version=RELEASE.version;return{...init,body:JSON.stringify(body)}}catch{return init}
}
function fmtUtc(v){const d=new Date(v);return Number.isFinite(d.getTime())?d.toISOString().slice(11,16)+' UTC':'—'}
function sourceName(raw){return String(raw||'').trim()||'Source unavailable'}
function dispatchFreshness(detail){window.dispatchEvent(new CustomEvent('mt:data-freshness',{detail}))}
async function inspectResponse(url,response){
  if(!response?.ok)return;
  try{
    if(url.pathname==='/api/weather'){
      const data=await response.clone().json(),row=Array.isArray(data?.forecast)?data.forecast[0]:null;
      dispatchFreshness({area:'weather',source:sourceName(data?.sources?.marine||data?.sources?.weather),validTime:row?.forecastTime||null,fetchedAt:new Date().toISOString(),fallback:Boolean(data?.marineFallback)});
    }else if(url.pathname==='/api/forecast'){
      const data=await response.clone().json(),rows=Array.isArray(data)?data:[],sources=[...new Set(rows.map(r=>r?.marineSource||r?.source).filter(Boolean))];
      dispatchFreshness({area:'route',source:sources.join(' + ')||'MET Norway / marine source',validTime:rows[0]?.forecastTime||null,fetchedAt:new Date().toISOString()});
    }else if(url.pathname==='/api/ais/latest'){
      dispatchFreshness({area:'ais',source:response.headers.get('x-marine-tools-ais-provider')||'Available AIS source',validTime:null,fetchedAt:new Date().toISOString()});
    }
  }catch{}
}
window.fetch=async function(input,init){
  let url=null;try{url=new URL(typeof input==='string'?input:input?.url,location.href)}catch{}
  const response=await realFetch(input,url?normalizeAnalyticsBody(url,init):init);
  if(url&&url.origin===API&&['/api/weather','/api/forecast','/api/ais/latest'].includes(url.pathname))inspectResponse(url,response).catch(()=>{});
  return response;
};

function injectStyles(){
  if(document.getElementById('mtRelease857Styles'))return;
  const s=document.createElement('style');s.id='mtRelease857Styles';s.textContent=`
  .mt-update-banner{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:12px;max-width:min(680px,calc(100vw - 24px));padding:11px 13px;border:1px solid #2b6b8c;border-radius:12px;background:#08283c;color:#eef7fb;box-shadow:0 14px 38px rgba(0,0,0,.36)}
  .mt-update-banner[hidden]{display:none}.mt-update-banner span{flex:1}.mt-update-banner button{white-space:nowrap}
  .mt-release-badge{display:inline-flex;align-items:center;border:1px solid rgba(120,160,190,.28);border-radius:999px;padding:3px 8px;font-size:11px;color:#9fb8c8;margin-left:7px}
  .mt-freshness{margin-top:8px;padding:7px 9px;border:1px solid rgba(120,160,190,.22);border-radius:8px;color:#9fb8c8;font-size:11px;line-height:1.4}.mt-freshness strong{color:#d9edf7;font-weight:600}
  .nav-project[open]>summary{cursor:default}.nav-project[open]>summary::marker{content:''}.nav-project[open]>summary::-webkit-details-marker{display:none}
  #mtChangelogDialog{width:min(720px,calc(100vw - 24px));max-height:82vh;border:1px solid #285871;border-radius:14px;background:#081f30;color:#eef7fb;padding:0;box-shadow:0 22px 70px rgba(0,0,0,.5)}
  #mtChangelogDialog::backdrop{background:rgba(0,10,18,.72)}.mt-change-head{position:sticky;top:0;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;background:#081f30;border-bottom:1px solid #173e56}.mt-change-head h2{margin:0;font-size:18px}.mt-change-body{padding:8px 18px 20px;overflow:auto}.mt-release-entry{padding:13px 0;border-bottom:1px solid #173e56}.mt-release-entry:last-child{border-bottom:0}.mt-release-entry h3{margin:0 0 4px;font-size:14px}.mt-release-entry small{color:#7898ab}.mt-release-entry ul{margin:8px 0 0;padding-left:20px;color:#bcd0dc}.mt-release-entry li{margin:3px 0}
  @media(max-width:650px){.mt-update-banner{bottom:10px;align-items:flex-start;flex-wrap:wrap}.mt-update-banner span{min-width:100%}.mt-update-banner button{flex:1}.mt-freshness{font-size:10px}}
  `;document.head.appendChild(s);
}
function updateBanner(){
  let el=document.getElementById('mtUpdateBanner');if(el)return el;
  el=document.createElement('div');el.id='mtUpdateBanner';el.className='mt-update-banner';el.hidden=true;
  el.innerHTML='<span><b>New MarineTools version available.</b> Refresh to update without clearing your saved local data.</span><button type="button" class="btn primary" id="mtApplyUpdate">Refresh</button><button type="button" class="btn" id="mtDismissUpdate">Later</button>';
  document.body.appendChild(el);
  el.querySelector('#mtApplyUpdate').addEventListener('click',applyUpdate);
  el.querySelector('#mtDismissUpdate').addEventListener('click',()=>{if(currentRemoteVersion)sessionStorage.setItem(DISMISS_KEY,currentRemoteVersion);el.hidden=true});
  return el;
}
function showUpdate(remoteVersion){
  if(!remoteVersion||!isNewer(remoteVersion,RELEASE.version))return;
  if(sessionStorage.getItem(DISMISS_KEY)===remoteVersion)return;
  currentRemoteVersion=remoteVersion;
  const el=updateBanner();el.querySelector('b').textContent=`MarineTools ${remoteVersion} is available.`;el.hidden=false;
}
function hideUpdate(){const el=document.getElementById('mtUpdateBanner');if(el)el.hidden=true;currentRemoteVersion=''}
function applyUpdate(){
  if(registration?.waiting){reloading=true;registration.waiting.postMessage({type:'SKIP_WAITING'});return}
  location.reload();
}
function activateWaitingSilently(worker){if(!worker)return;silentActivation=true;try{worker.postMessage({type:'SKIP_WAITING'})}catch{}}
function watchRegistration(reg){
  registration=reg;
  if(reg.waiting)activateWaitingSilently(reg.waiting);
  reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)activateWaitingSilently(w)})});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(silentActivation){silentActivation=false;return}
    if(reloading){reloading=false;location.reload()}
  });
}
async function initServiceWorker(){
  if(!('serviceWorker'in navigator)||location.protocol!=='https:')return;
  try{const reg=await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(RELEASE.build)}`,{scope:'/'});watchRegistration(reg);setTimeout(()=>reg.update().catch(()=>{}),1500)}catch{}
}
async function checkRemoteRelease(force=false){
  if(!navigator.onLine)return;const now=Date.now();if(!force&&now-lastRemoteCheck<15*60*1000)return;lastRemoteCheck=now;
  try{const r=await realFetch(`${API}/api/release`,{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d?.version&&isNewer(d.version,RELEASE.version))showUpdate(d.version);else hideUpdate()}catch{}
}
function changelogDialog(){
  let d=document.getElementById('mtChangelogDialog');if(d)return d;
  d=document.createElement('dialog');d.id='mtChangelogDialog';d.innerHTML=`<div class="mt-change-head"><div><h2>What's new</h2><small>MarineTools ${esc(RELEASE.version)}</small></div><button type="button" class="btn" id="mtCloseChanges">Close</button></div><div class="mt-change-body">${RELEASE.history.map(r=>`<section class="mt-release-entry"><h3>v${esc(r.version)} · ${esc(r.title)}</h3><small>${esc(r.date)}</small><ul>${r.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`).join('')}</div>`;
  document.body.appendChild(d);d.querySelector('#mtCloseChanges').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});return d;
}
function openChangelog(){const d=changelogDialog();if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','')}
function keepProjectNavOpen(){
  const project=document.querySelector('.nav-project');if(!project)return;
  project.open=true;
  const summary=project.querySelector('summary');if(summary){summary.setAttribute('aria-disabled','true');summary.addEventListener('click',e=>e.preventDefault())}
  project.addEventListener('toggle',()=>{if(!project.open)project.open=true});
}
function injectReleaseUi(){
  injectStyles();keepProjectNavOpen();
  const items=document.querySelector('.nav-project-items');if(items&&!document.getElementById('mtWhatsNew')){const b=document.createElement('button');b.id='mtWhatsNew';b.className='nav-btn';b.type='button';b.innerHTML='<span>↻</span>What\'s new';b.addEventListener('click',openChangelog);items.insertBefore(b,items.firstChild)}
  const footer=document.querySelector('.site-footer span:first-child');if(footer&&!footer.querySelector('.mt-release-badge')){const badge=document.createElement('span');badge.className='mt-release-badge';badge.textContent=`v${RELEASE.version}`;footer.appendChild(badge)}
}
function freshnessHost(area){if(area==='weather')return document.querySelector('#weather .weather-live-panel');if(area==='route')return document.querySelector('#route-intelligence .page-title')||document.querySelector('#route-intelligence');if(area==='ais')return document.querySelector('#live-experimental .page-title')||document.querySelector('#live-experimental');return null}
function renderFreshness(detail){setTimeout(()=>{const host=freshnessHost(detail.area);if(!host)return;let box=host.querySelector(`.mt-freshness[data-area="${detail.area}"]`);if(!box){box=document.createElement('div');box.className='mt-freshness';box.dataset.area=detail.area;host.appendChild(box)}const valid=detail.validTime?` · forecast valid ${fmtUtc(detail.validTime)}`:'';const fallback=detail.fallback?' · global wave fallback':'';box.innerHTML=`<strong>${esc(detail.source)}</strong>${valid} · fetched ${fmtUtc(detail.fetchedAt)}${fallback}`},40)}
window.addEventListener('mt:data-freshness',e=>renderFreshness(e.detail||{}));
window.addEventListener('online',()=>checkRemoteRelease(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkRemoteRelease(false)});
document.addEventListener('DOMContentLoaded',()=>{injectReleaseUi();initServiceWorker();checkRemoteRelease(true)});
window.__marineToolsReleaseUi={release:RELEASE,openChangelog,checkForUpdate:()=>checkRemoteRelease(true)};
})();
