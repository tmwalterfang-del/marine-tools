(() => {
'use strict';

const VERSION='8.5.4-weather-map-prod-2';
let map=null,marker=null,leafletPromise=null,bound=false;
const $=(s,r=document)=>r.querySelector(s);
const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

function injectStyles(){
  if($('#mtWxMapV854Styles'))return;
  const style=document.createElement('style');
  style.id='mtWxMapV854Styles';
  style.textContent=`
    .mt-wx-map-wrap{margin:12px 0 14px}
    .mt-wx-map-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}
    .mt-wx-map{height:320px!important;margin-top:8px;border-radius:10px;overflow:hidden}
    .mt-wx-map .leaflet-control-attribution{font-size:10px}
    .mt-wx-map-note{margin-top:7px}
    .mt-wx-map-placeholder{min-height:72px;display:flex;align-items:center;padding:12px;border:1px solid rgba(120,160,190,.25);border-radius:10px}
    @media(max-width:760px){.mt-wx-map{height:245px!important}}
  `;
  document.head.appendChild(style);
}
function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    if(!$('#leafletCss')&&!document.querySelector('link[href*="leaflet@1.9.4/dist/leaflet.css"]')){
      const link=document.createElement('link');link.id='leafletCss';link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(link);
    }
    const finish=()=>window.L?resolve(window.L):reject(new Error('Leaflet unavailable'));
    const existing=document.querySelector('script[src*="leaflet@1.9.4/dist/leaflet.js"]');
    if(existing){if(window.L){resolve(window.L);return}existing.addEventListener('load',finish,{once:true});existing.addEventListener('error',reject,{once:true});return}
    const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.async=true;script.onload=finish;script.onerror=reject;document.head.appendChild(script);
  });
  return leafletPromise;
}
function currentPosition(){const lat=finite($('#wxLat')?.value),lon=finite($('#wxLon')?.value);return{lat:lat==null?59.42:clamp(lat,-90,90),lon:lon==null?10.48:clamp(lon,-180,180)}}
function setPosition(lat,lon,{pan=true,zoom=null}={}){lat=finite(lat);lon=finite(lon);if(lat==null||lon==null)return;lat=clamp(lat,-90,90);lon=clamp(lon,-180,180);const latInput=$('#wxLat'),lonInput=$('#wxLon');if(latInput)latInput.value=lat.toFixed(5);if(lonInput)lonInput.value=lon.toFixed(5);if(marker)marker.setLatLng([lat,lon]);if(map&&pan){map.panTo([lat,lon],{animate:false});if(zoom!=null)map.setZoom(zoom)}}
function syncFromInputs(){const p=currentPosition();setPosition(p.lat,p.lon,{pan:Boolean(map)})}
function bindControls(){if(bound)return;const lat=$('#wxLat'),lon=$('#wxLon');if(lat)lat.addEventListener('change',syncFromInputs);if(lon)lon.addEventListener('change',syncFromInputs);const route=$('#useRouteWx');if(route)route.addEventListener('click',()=>setTimeout(syncFromInputs,80));bound=true}
async function initMap(){
  const container=$('#wxSelectMapV854');if(!container)return;
  const btn=$('#wxShowMapV854');if(btn){btn.disabled=true;btn.textContent='Loading map…'}
  try{await loadLeaflet()}catch{if(btn){btn.disabled=false;btn.textContent='Retry map'}const note=$('#wxMapLoadNoteV854');if(note)note.textContent='Map could not be loaded. Latitude and longitude entry still works normally.';return}
  if(btn)btn.remove();$('#wxMapPlaceholderV854')?.remove();container.hidden=false;const p=currentPosition();
  if(map){setPosition(p.lat,p.lon,{pan:false});setTimeout(()=>map.invalidateSize(false),0);return}
  map=L.map(container,{zoomControl:true,preferCanvas:true}).setView([p.lat,p.lon],7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
  marker=L.marker([p.lat,p.lon],{draggable:true}).addTo(map);
  map.on('click',e=>setPosition(e.latlng.lat,e.latlng.lng,{pan:false}));
  marker.on('dragend',e=>{const p=e.target.getLatLng();setPosition(p.lat,p.lng,{pan:false})});
  setTimeout(()=>map.invalidateSize(false),50);
}
function useMyPosition(button){if(!navigator.geolocation){button.textContent='Location unavailable';return}button.disabled=true;button.textContent='Locating…';navigator.geolocation.getCurrentPosition(pos=>{setPosition(pos.coords.latitude,pos.coords.longitude,{pan:true,zoom:9});button.disabled=false;button.textContent='Use my position'},()=>{button.disabled=false;button.textContent='Use my position'},{enableHighAccuracy:false,timeout:10000,maximumAge:300000})}
function ensureWeatherMap(){
  const actions=$('#loadPointWx')?.closest('.actions');if(!actions)return false;
  injectStyles();bindControls();
  if(!$('#wxSelectMapV854')){
    $('#wxSelectMapSafe')?.closest('.mt-wx-map-wrap')?.remove();
    const wrap=document.createElement('div');wrap.className='mt-wx-map-wrap';wrap.innerHTML=`<div class="mt-wx-map-actions"><button type="button" class="btn" id="wxShowMapV854">Show map</button><button type="button" class="btn" id="wxLocateV854">Use my position</button></div><div id="wxMapPlaceholderV854" class="mt-wx-map-placeholder helper">Open the map to choose the forecast position.</div><div id="wxSelectMapV854" class="map mt-wx-map" aria-label="Select weather forecast position on map" hidden></div><p id="wxMapLoadNoteV854" class="helper mt-wx-map-note">Click the map or drag the marker to set latitude and longitude. Forecast data loads when you press <b>Load forecast</b>.</p>`;actions.insertAdjacentElement('afterend',wrap);
    $('#wxShowMapV854')?.addEventListener('click',initMap);const locate=$('#wxLocateV854');if(locate)locate.addEventListener('click',()=>useMyPosition(locate));
  }
  return true;
}
function tryInitWeather(attempt=0){if(ensureWeatherMap())return;if(attempt<12)setTimeout(()=>tryInitWeather(attempt+1),60*(attempt+1))}
function scheduleInit(){setTimeout(()=>tryInitWeather(0),30)}
document.addEventListener('click',e=>{if(e.target.closest('[data-page="weather"],[data-go="weather"]'))scheduleInit()},true);
window.addEventListener('pageshow',()=>{if($('#weather')?.classList.contains('active'))scheduleInit()});
window.addEventListener('DOMContentLoaded',()=>{if($('#weather')?.classList.contains('active'))scheduleInit()});
window.__marineToolsWeatherMap={version:VERSION,enabled:true,init:scheduleInit,refresh:()=>map?.invalidateSize(false)};
})();
