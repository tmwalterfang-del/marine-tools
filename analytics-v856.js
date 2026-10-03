(() => {
'use strict';

const API='https://api.marinetools.app';
const VERSION='8.5.6';
const EVENT_URL=`${API}/api/analytics/event`;
const SEARCH_IDS=new Map([
  ['globalSearch',{surface:'global',results:'#searchResults'}],
  ['homeToolSearch',{surface:'home',results:'#homeToolResults'}]
]);
const searchState=new WeakMap();
const nativeFetch=window.fetch.bind(window);

function settings(){
  try{return JSON.parse(localStorage.getItem('mt.settings')||'{}')||{}}catch{return{}}
}
function enabled(){return settings().usageAnalytics!==false&&navigator.doNotTrack!=='1'}
function deviceClass(){return innerWidth<=760?'mobile':innerWidth<=1100?'tablet':'desktop'}
function currentPage(){return document.querySelector('.page.active')?.id||'home'}
function clean(v,max){return String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max)}
function send(event,{page=currentPage(),tool='',duration=0}={}){
  if(!enabled()||!navigator.onLine)return;
  const payload={event:clean(event,40),page:clean(page,80),tool:clean(tool,120),device:deviceClass(),version:VERSION,duration:Math.max(0,Math.min(3600,Number(duration)||0))};
  try{nativeFetch(EVENT_URL,{method:'POST',headers:{'content-type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),keepalive:true,cache:'no-store'}).catch(()=>{})}catch{}
}
function oncePerSession(key,event,opts={}){
  try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch{}
  send(event,opts);
}
function markToolSession(){oncePerSession('mt.analytics.v856.tool-active','session_tool_active')}
function markSearchSession(){oncePerSession('mt.analytics.v856.search-active','session_search_active')}

function normalizeSource(raw,prefix){
  const s=String(raw||'').toLowerCase();
  if(prefix==='weather'){
    if(s.includes('noaa')||s.includes('gfs'))return'weather:noaa-gfs-wave';
    if(s.includes('oceanforecast'))return'weather:met-ocean';
    return'weather:atmospheric-only';
  }
  if(prefix==='ais'){
    if(s.includes('barentswatch'))return'ais:barentswatch';
    if(s.includes('pelyr')||s.includes('open'))return'ais:open-licence';
    return'ais:unknown';
  }
  return`${prefix}:unknown`;
}
async function inspectLive(url,response,elapsed){
  const path=url.pathname;
  let endpoint=null;
  if(path==='/api/weather')endpoint='weather';
  else if(path==='/api/ais/latest')endpoint='ais';
  else if(path==='/api/forecast')endpoint='route-forecast';
  if(!endpoint)return;

  send(response.ok?'live_request_ok':'live_request_error',{page:endpoint==='route-forecast'?'route-intelligence':endpoint,tool:endpoint,duration:elapsed});
  if(!response.ok)return;

  try{
    if(endpoint==='ais'){
      const provider=response.headers.get('x-marine-tools-ais-provider')||'';
      send('data_source',{page:'route-intelligence',tool:normalizeSource(provider,'ais')});
      return;
    }
    const data=await response.clone().json();
    if(endpoint==='weather'){
      send('data_source',{page:'weather',tool:normalizeSource(data?.sources?.marine,'weather')});
      return;
    }
    const rows=Array.isArray(data)?data:[];
    const names=new Set(rows.map(r=>String(r?.marineSource||'')).filter(Boolean));
    let source='weather:atmospheric-only';
    if([...names].some(x=>/NOAA|GFS/i.test(x)))source='weather:noaa-gfs-wave';
    else if([...names].some(x=>/Oceanforecast/i.test(x)))source='weather:met-ocean';
    send('data_source',{page:'route-intelligence',tool:`route-${source}`});
  }catch{}
}

window.fetch=async function(input,init){
  let url=null;
  try{url=new URL(typeof input==='string'?input:input?.url,location.href)}catch{}
  const shouldTrack=Boolean(url&&url.origin===API&&!url.pathname.startsWith('/api/analytics/'));
  const start=shouldTrack?performance.now():0;
  try{
    const response=await nativeFetch(input,init);
    if(shouldTrack)inspectLive(url,response,(performance.now()-start)/1000).catch(()=>{});
    return response;
  }catch(err){
    if(shouldTrack){
      const path=url.pathname;
      const endpoint=path==='/api/weather'?'weather':path==='/api/ais/latest'?'ais':path==='/api/forecast'?'route-forecast':null;
      if(endpoint)send('live_request_error',{page:endpoint==='route-forecast'?'route-intelligence':endpoint,tool:endpoint,duration:(performance.now()-start)/1000});
    }
    throw err;
  }
};

function searchMeta(input){return SEARCH_IDS.get(input.id)||null}
function searchHasResult(meta){
  const box=document.querySelector(meta.results);if(!box)return false;
  return Boolean(box.querySelector('[data-tool-target],[data-go],button,a,.search-result,.home-tool-result'));
}
function commitSearch(input){
  const meta=searchMeta(input),st=searchState.get(input);if(!meta||!st?.dirty)return;
  if(String(input.value||'').trim().length<2){st.dirty=false;return}
  st.dirty=false;markSearchSession();send('search_used',{tool:meta.surface});
  setTimeout(()=>send('search_result',{tool:`${meta.surface}:${searchHasResult(meta)?'has-result':'no-result'}`}),60);
}

function featureClick(target){
  if(target.closest('#wxShowMapV854'))send('feature_use',{page:'weather',tool:'weather_map_open'});
  else if(target.closest('#wxLocateV854'))send('feature_use',{page:'weather',tool:'weather_geolocate'});
  else if(target.closest('#useRouteWx'))send('feature_use',{page:'weather',tool:'weather_use_route_start'});
  else if(target.closest('#runAnalysis'))send('feature_use',{page:'route-intelligence',tool:'route_analysis'});
  else if(target.closest('#fitRoute'))send('feature_use',{page:'route-intelligence',tool:'route_fit'});
  else if(target.closest('#undoWp'))send('feature_use',{page:'route-intelligence',tool:'route_undo_waypoint'});
  else if(target.closest('#clearRoute'))send('feature_use',{page:'route-intelligence',tool:'route_clear'});

  const fav=target.closest('.fav-toggle');
  if(fav)send('favorite_toggle',{tool:fav.dataset.favTitle||fav.closest('.tool-card')?.dataset.toolTitle||'favorite'});

  const card=target.closest('.tool-card');
  const action=target.closest('button');
  if(card&&action&&!action.classList.contains('fav-toggle')&&!action.classList.contains('remove-row'))markToolSession();

  const result=target.closest('[data-tool-target]');
  if(result){
    const input=result.closest('#searchResults')?document.querySelector('#globalSearch'):result.closest('#homeToolResults')?document.querySelector('#homeToolSearch'):null;
    if(input){commitSearch(input);const meta=searchMeta(input);send('search_result_open',{tool:`${meta.surface}|${result.dataset.toolTarget||result.textContent||'tool'}`})}
  }
}

document.addEventListener('click',e=>featureClick(e.target),true);
document.addEventListener('input',e=>{
  const input=e.target;if(!SEARCH_IDS.has(input.id))return;
  const st=searchState.get(input)||{dirty:false};st.dirty=String(input.value||'').trim().length>=2;searchState.set(input,st);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&SEARCH_IDS.has(e.target.id))commitSearch(e.target)},true);
document.addEventListener('focusout',e=>{if(SEARCH_IDS.has(e.target.id))setTimeout(()=>commitSearch(e.target),120)},true);

oncePerSession('mt.analytics.v856.version','version_seen',{page:'home',tool:'analytics-v2'});
window.__marineToolsAnalyticsV2={version:VERSION,enabled:enabled(),send};
})();
