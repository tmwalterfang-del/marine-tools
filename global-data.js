(() => {
'use strict';

const ENHANCEMENT_VERSION='2026-10-03-global-1';
let weatherMap=null,weatherMarker=null,leafletPromise=null;
let lastWeatherMeta=null,lastAisMeta=null,lastRouteForecastMeta=null;

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return [...r.querySelectorAll(s)]}
function finite(v){const n=Number(v);return Number.isFinite(n)?n:null}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function uniq(a){return [...new Set(a.filter(Boolean))]}
function fmt(v,d=1){const n=finite(v);return n==null?'—':n.toFixed(d)}
function escText(v){return String(v??'')}

function injectStyles(){
 if(qs('#mtGlobalDataStyles'))return;
 const style=document.createElement('style');style.id='mtGlobalDataStyles';style.textContent=`
 .mt-weather-map-block{margin:12px 0 14px}.mt-weather-map{height:340px!important;margin-top:9px}.mt-weather-map .leaflet-control-attribution{font-size:10px}.mt-map-note{margin-top:7px}.mt-source-box{margin-top:10px;padding:10px 12px;border:1px solid #1d465f;border-radius:9px;background:#071b29;color:#91acbd;font-size:12px;line-height:1.5}.mt-source-box b{color:#ddecf4}.mt-marine-detail{margin-top:9px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.mt-marine-detail>div{padding:9px;border:1px solid #1b455e;border-radius:8px;background:#0a2639}.mt-marine-detail span{display:block;color:#7f9caf;font-size:11px}.mt-marine-detail strong{display:block;margin-top:2px;font-size:13px}.mt-global-chip{margin-left:auto}.mt-attribution-list{margin-top:4px;color:#7797aa;font-size:11px}.mt-attribution-list div+div{margin-top:2px}
 @media(max-width:760px){.mt-weather-map{height:290px!important}.mt-marine-detail{grid-template-columns:1fr}}
 `;document.head.appendChild(style);
}

function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 if(leafletPromise)return leafletPromise;
 leafletPromise=new Promise((resolve,reject)=>{
   if(!qs('#leafletCss')&&!qs('link[href*="leaflet@1.9.4/dist/leaflet.css"]')){
     const l=document.createElement('link');l.id='leafletCss';l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);
   }
   const done=()=>window.L?resolve(window.L):reject(new Error('Leaflet did not load'));
   const existing=qs('script[src*="leaflet@1.9.4/dist/leaflet.js"]');
   if(existing){existing.addEventListener('load',done,{once:true});existing.addEventListener('error',reject,{once:true});setTimeout(()=>{if(window.L)resolve(window.L)},1500);return}
   const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.async=true;s.onload=done;s.onerror=reject;document.head.appendChild(s);
 });
 return leafletPromise;
}

function weatherPosition(){
 const lat=finite(qs('#wxLat')?.value),lon=finite(qs('#wxLon')?.value);
 return{lat:lat==null?59.42:clamp(lat,-90,90),lon:lon==null?10.48:clamp(lon,-180,180)};
}
function setWeatherPosition(lat,lon,{pan=true,zoom=null}={}){
 lat=finite(lat);lon=finite(lon);if(lat==null||lon==null)return;
 lat=clamp(lat,-90,90);lon=clamp(lon,-180,180);
 const latEl=qs('#wxLat'),lonEl=qs('#wxLon');if(latEl)latEl.value=lat.toFixed(5);if(lonEl)lonEl.value=lon.toFixed(5);
 if(weatherMarker)weatherMarker.setLatLng([lat,lon]);
 if(weatherMap&&pan){weatherMap.panTo([lat,lon]);if(zoom!=null)weatherMap.setZoom(zoom)}
}
async function initWeatherMap(){
 const el=qs('#wxSelectMap');if(!el)return;
 try{await loadLeaflet()}catch{return}
 const p=weatherPosition();
 if(weatherMap){weatherMap.invalidateSize();setWeatherPosition(p.lat,p.lon,{pan:false});return}
 weatherMap=L.map(el,{zoomControl:true}).setView([p.lat,p.lon],7);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(weatherMap);
 L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenSeaMap'}).addTo(weatherMap);
 weatherMarker=L.marker([p.lat,p.lon],{draggable:true}).addTo(weatherMap);
 weatherMap.on('click',e=>setWeatherPosition(+e.latlng.lat.toFixed(5),+e.latlng.lng.toFixed(5),{pan:false}));
 weatherMarker.on('dragend',e=>{const p=e.target.getLatLng();setWeatherPosition(+p.lat.toFixed(5),+p.lng.toFixed(5),{pan:false})});
}

function enhanceWeather(){
 const page=qs('#weather');if(!page||!qs('.weather-live-panel',page))return;
 injectStyles();
 const panel=qs('.weather-live-panel .panel-body',page);if(!panel)return;
 const headSmall=qs('.weather-live-panel .panel-head small',page);if(headSmall)headSmall.textContent='MET Norway + global WaveWatch III fallback';
 const strip=qs('.coverage-strip',page);if(strip){
   const blocks=qsa(':scope > div',strip);if(blocks[1]){const b=qs('b',blocks[1]),s=qs('span',blocks[1]);if(b)b.textContent='GLOBAL MARINE WAVES';if(s)s.textContent='MET Norway Oceanforecast is preferred where available. Outside its coverage, Marine Tools can fall back to the PacIOOS WaveWatch III global wave model.'}
 }
 if(!qs('#wxSelectMap',page)){
   const actions=qs('#loadPointWx',page)?.closest('.actions');
   if(actions){
     if(!qs('#wxLocate',actions)){const locate=document.createElement('button');locate.type='button';locate.className='btn';locate.id='wxLocate';locate.textContent='Use my position';actions.appendChild(locate);locate.addEventListener('click',()=>{
       if(!navigator.geolocation)return;
       locate.disabled=true;locate.textContent='Locating…';
       navigator.geolocation.getCurrentPosition(pos=>{setWeatherPosition(pos.coords.latitude,pos.coords.longitude,{pan:true,zoom:9});locate.disabled=false;locate.textContent='Use my position'},()=>{locate.disabled=false;locate.textContent='Use my position'},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
     })}
     const block=document.createElement('div');block.className='mt-weather-map-block';block.innerHTML='<div class="map-toolbar"><span class="chip">CLICK MAP TO SELECT FORECAST POSITION</span></div><div id="wxSelectMap" class="map mt-weather-map" aria-label="Select weather forecast position on map"></div><p class="helper mt-map-note">Click the map or drag the marker to select a position. Weather is loaded only when you press <b>Load forecast</b>. Map tiles come from OpenStreetMap/OpenSeaMap; Marine Tools analytics does not store the selected coordinates.</p>';
     actions.insertAdjacentElement('afterend',block);
   }
 }
 if(!qs('#mtWxSources',page)){
   const diag=qs('#wxDiagnostics',page);if(diag){const box=document.createElement('div');box.id='mtWxSources';box.className='mt-source-box';box.textContent='Data sources will appear after the forecast is loaded.';diag.insertAdjacentElement('afterend',box)}
 }
 if(!qs('#mtMarineDetail',page)){
   const sum=qs('#wxSummary',page);if(sum){const detail=document.createElement('div');detail.id='mtMarineDetail';detail.className='mt-marine-detail';detail.hidden=true;sum.insertAdjacentElement('afterend',detail)}
 }
 const sync=()=>{const p=weatherPosition();setWeatherPosition(p.lat,p.lon,{pan:true})};
 const lat=qs('#wxLat',page),lon=qs('#wxLon',page);if(lat&&!lat.dataset.mtMapSync){lat.dataset.mtMapSync='1';lat.addEventListener('change',sync)}if(lon&&!lon.dataset.mtMapSync){lon.dataset.mtMapSync='1';lon.addEventListener('change',sync)}
 const routeBtn=qs('#useRouteWx',page);if(routeBtn&&!routeBtn.dataset.mtMapSync){routeBtn.dataset.mtMapSync='1';routeBtn.addEventListener('click',()=>setTimeout(sync,50))}
 initWeatherMap();if(lastWeatherMeta)setTimeout(()=>applyWeatherMeta(lastWeatherMeta),0);
}

function applyWeatherMeta(j){
 if(!j||!Array.isArray(j.forecast))return;lastWeatherMeta=j;enhanceWeather();
 const page=qs('#weather');if(!page)return;
 const weatherSource=j?.sources?.weather||'MET Norway Locationforecast';
 const marineSource=j?.sources?.marine||null;
 const sourceBox=qs('#mtWxSources',page);
 if(sourceBox){
   const parts=[`Weather: ${weatherSource}`,`Marine: ${marineSource||'unavailable for this position'}`];
   if(j.marineFallback)parts.push('global wave fallback active');
   sourceBox.textContent=parts.join(' · ');
   if(j.marineAttribution){const a=document.createElement('div');a.className='mt-attribution-list';a.textContent=j.marineAttribution;sourceBox.appendChild(a)}
 }
 if(j.marineFallback){
   const status=qs('#wxStatus',page);if(status)status.innerHTML='<span class="chip ok">GLOBAL FORECAST</span>';
   const diag=qs('#wxDiagnostics',page);if(diag)diag.textContent=`Global weather loaded · global wave model loaded · updated ${new Date().toISOString().slice(11,16)} UTC`;
 }
 const first=j.forecast.find(r=>[r?.hs,r?.wavePeriod,r?.swellHeight,r?.seaTemp].some(v=>finite(v)!=null));
 const detail=qs('#mtMarineDetail',page);if(detail&&first){
   const wave=first.hs==null?'—':`${fmt(first.hs,1)} m${first.waveDirection==null?'':` · ${fmt(first.waveDirection,0)}° from`}${first.wavePeriod==null?'':` · ${fmt(first.wavePeriod,1)} s`}`;
   const swell=first.swellHeight==null?'—':`${fmt(first.swellHeight,1)} m${first.swellDirection==null?'':` · ${fmt(first.swellDirection,0)}° from`}${first.swellPeriod==null?'':` · ${fmt(first.swellPeriod,1)} s`}`;
   const sea=first.seaTemp==null?'—':`${fmt(first.seaTemp,1)} °C`;
   detail.innerHTML=`<div><span>Wave detail</span><strong>${escText(wave)}</strong></div><div><span>Swell</span><strong>${escText(swell)}</strong></div><div><span>Sea temperature</span><strong>${escText(sea)}</strong></div>`;detail.hidden=false;
 }
}

function patchLiveCopy(){
 const live=qs('#live-experimental');if(live&&live.children.length){
   qsa('p',live).forEach(p=>{if(p.textContent.includes('BarentsWatch AIS'))p.textContent=p.textContent.replace('BarentsWatch AIS','global/open AIS data');});
   qsa('.source-item',live).forEach(row=>{const label=qs('span',row),strong=qs('strong',row);if(label?.textContent.trim()==='Source'&&strong)strong.textContent='Open-licence AIS sources + BarentsWatch fallback'});
 }
 const route=qs('#route-intelligence');if(route&&route.children.length){
   qsa('.page-title p',route).forEach(p=>{if(p.textContent.includes('BarentsWatch forecast data and live AIS'))p.textContent='Experimental planning context combining your active route, vessel limits, MET Norway weather, global wave-model fallback and live AIS context. It is not approved navigation information.'});
   const helper=qs('#riMap',route)?.nextElementSibling;
   if(helper&&!qs('#mtRouteSources',route)){const box=document.createElement('div');box.id='mtRouteSources';box.className='mt-source-box';box.textContent='Live-data source details will appear after analysis.';helper.insertAdjacentElement('afterend',box)}
   renderRouteSources();
 }
}
function collectAttributions(arr){return uniq((Array.isArray(arr)?arr:[]).flatMap(v=>Array.isArray(v?.attributions)?v.attributions:[]))}
function applyAisMeta(arr){if(!Array.isArray(arr))return;lastAisMeta=arr;patchLiveCopy();renderRouteSources()}
function applyRouteForecastMeta(arr){if(!Array.isArray(arr))return;lastRouteForecastMeta=arr;patchLiveCopy();renderRouteSources()}
function renderRouteSources(){
 const box=qs('#mtRouteSources');if(!box)return;
 const aisAttrs=collectAttributions(lastAisMeta);const aisProviders=uniq((lastAisMeta||[]).map(v=>v?.source));
 const marineProviders=uniq((lastRouteForecastMeta||[]).map(v=>v?.marineSource||((v?.hs!=null||v?.currentKn!=null||v?.seaTemp!=null)?'MET Norway Oceanforecast':null)));
 const marineAttrs=uniq((lastRouteForecastMeta||[]).map(v=>v?.marineAttribution));
 box.textContent='';
 const line=document.createElement('div');line.textContent=`AIS: ${aisProviders.length?aisProviders.join(' + '):'not loaded'} · Marine forecast: ${marineProviders.length?marineProviders.join(' + '):'not loaded'}`;box.appendChild(line);
 const attrs=uniq([...aisAttrs,...marineAttrs]);if(attrs.length){const list=document.createElement('div');list.className='mt-attribution-list';attrs.forEach(a=>{const d=document.createElement('div');d.textContent=a;list.appendChild(d)});box.appendChild(list)}
 const note=document.createElement('div');note.className='mt-attribution-list';note.textContent='AIS and model data are supporting context only. Coverage may be sampled, delayed, incomplete or unavailable and must not be used for navigation or collision avoidance.';box.appendChild(note);
}

function observeRenderedPages(){
 const observer=new MutationObserver(()=>{enhanceWeather();patchLiveCopy()});
 for(const id of ['weather','live-experimental','route-intelligence']){const el=qs(`#${id}`);if(el)observer.observe(el,{childList:true,subtree:true})}
 document.addEventListener('click',e=>{const go=e.target.closest('[data-page]');if(!go)return;const id=go.dataset.page;if(id==='weather')setTimeout(enhanceWeather,60);if(id==='live-experimental'||id==='route-intelligence')setTimeout(patchLiveCopy,60)});
}

function wrapFetch(){
 if(window.__mtGlobalFetchWrapped)return;window.__mtGlobalFetchWrapped=true;
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async function(input,init){
   const response=await nativeFetch(input,init);
   const href=typeof input==='string'?input:(input&&input.url)||'';
   if(href.includes('/api/weather?'))response.clone().json().then(j=>setTimeout(()=>applyWeatherMeta(j),80)).catch(()=>{});
   if(href.includes('/api/ais/latest?'))response.clone().json().then(j=>setTimeout(()=>applyAisMeta(j),100)).catch(()=>{});
   if(href.includes('/api/forecast?'))response.clone().json().then(j=>setTimeout(()=>applyRouteForecastMeta(j),100)).catch(()=>{});
   return response;
 };
}

injectStyles();wrapFetch();observeRenderedPages();enhanceWeather();patchLiveCopy();
window.__marineToolsGlobalData={version:ENHANCEMENT_VERSION,refreshWeatherMap:()=>weatherMap?.invalidateSize()};
})();