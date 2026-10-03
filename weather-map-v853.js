(() => {
'use strict';

const VERSION='8.5.3-weather-map-safe-1';
let map=null;
let marker=null;
let leafletPromise=null;
let bound=false;

const $=(s,r=document)=>r.querySelector(s);
const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

function injectStyles(){
  if($('#mtWxMapSafeStyles')) return;
  const style=document.createElement('style');
  style.id='mtWxMapSafeStyles';
  style.textContent=`
    .mt-wx-map-wrap{margin:12px 0 14px}
    .mt-wx-map{height:320px!important;margin-top:8px;border-radius:10px;overflow:hidden}
    .mt-wx-map-note{margin-top:7px}
    .mt-wx-map-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
    .mt-wx-map-toolbar .chip{margin:0}
    @media(max-width:760px){.mt-wx-map{height:260px!important}}
  `;
  document.head.appendChild(style);
}

function loadLeaflet(){
  if(window.L) return Promise.resolve(window.L);
  if(leafletPromise) return leafletPromise;

  leafletPromise=new Promise((resolve,reject)=>{
    if(!$('#leafletCss')&&!document.querySelector('link[href*="leaflet@1.9.4/dist/leaflet.css"]')){
      const link=document.createElement('link');
      link.id='leafletCss';
      link.rel='stylesheet';
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const finish=()=>window.L?resolve(window.L):reject(new Error('Leaflet unavailable'));
    const existing=document.querySelector('script[src*="leaflet@1.9.4/dist/leaflet.js"]');
    if(existing){
      if(window.L){resolve(window.L);return;}
      existing.addEventListener('load',finish,{once:true});
      existing.addEventListener('error',reject,{once:true});
      return;
    }

    const script=document.createElement('script');
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async=true;
    script.onload=finish;
    script.onerror=reject;
    document.head.appendChild(script);
  });

  return leafletPromise;
}

function currentPosition(){
  const lat=finite($('#wxLat')?.value);
  const lon=finite($('#wxLon')?.value);
  return {
    lat:lat==null?59.42:clamp(lat,-90,90),
    lon:lon==null?10.48:clamp(lon,-180,180)
  };
}

function setPosition(lat,lon,{pan=true,zoom=null}={}){
  lat=finite(lat);lon=finite(lon);
  if(lat==null||lon==null) return;
  lat=clamp(lat,-90,90);lon=clamp(lon,-180,180);

  const latInput=$('#wxLat');
  const lonInput=$('#wxLon');
  if(latInput) latInput.value=lat.toFixed(5);
  if(lonInput) lonInput.value=lon.toFixed(5);

  if(marker) marker.setLatLng([lat,lon]);
  if(map&&pan){
    map.panTo([lat,lon],{animate:false});
    if(zoom!=null) map.setZoom(zoom);
  }
}

function syncFromInputs(){
  const p=currentPosition();
  setPosition(p.lat,p.lon,{pan:Boolean(map)});
}

function bindControls(){
  if(bound) return;
  const page=$('#weather');
  if(!page) return;

  const lat=$('#wxLat');
  const lon=$('#wxLon');
  if(lat) lat.addEventListener('change',syncFromInputs);
  if(lon) lon.addEventListener('change',syncFromInputs);

  const route=$('#useRouteWx');
  if(route) route.addEventListener('click',()=>setTimeout(syncFromInputs,80));

  const locate=$('#wxLocateSafe');
  if(locate){
    locate.addEventListener('click',()=>{
      if(!navigator.geolocation){
        locate.textContent='Location unavailable';
        setTimeout(()=>locate.textContent='Use my position',1600);
        return;
      }
      locate.disabled=true;
      locate.textContent='Locating…';
      navigator.geolocation.getCurrentPosition(
        pos=>{
          setPosition(pos.coords.latitude,pos.coords.longitude,{pan:true,zoom:9});
          locate.disabled=false;
          locate.textContent='Use my position';
        },
        ()=>{
          locate.disabled=false;
          locate.textContent='Use my position';
        },
        {enableHighAccuracy:false,timeout:10000,maximumAge:300000}
      );
    });
  }

  bound=true;
}

async function initMap(){
  const container=$('#wxSelectMapSafe');
  if(!container) return;

  injectStyles();
  bindControls();

  try{await loadLeaflet()}catch{
    const note=$('#wxMapLoadNote');
    if(note) note.textContent='Map could not be loaded. Latitude and longitude entry still works normally.';
    return;
  }

  const p=currentPosition();
  if(map){
    setPosition(p.lat,p.lon,{pan:false});
    setTimeout(()=>map.invalidateSize(false),0);
    return;
  }

  map=L.map(container,{zoomControl:true,preferCanvas:true}).setView([p.lat,p.lon],7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:18,
    attribution:'© OpenStreetMap contributors'
  }).addTo(map);

  marker=L.marker([p.lat,p.lon],{draggable:true}).addTo(map);

  map.on('click',e=>{
    setPosition(e.latlng.lat,e.latlng.lng,{pan:false});
  });
  marker.on('dragend',e=>{
    const p=e.target.getLatLng();
    setPosition(p.lat,p.lng,{pan:false});
  });

  setTimeout(()=>map.invalidateSize(false),60);
}

function ensureWeatherMap(){
  const page=$('#weather');
  const actions=$('#loadPointWx')?.closest('.actions');
  if(!page||!actions) return false;

  injectStyles();

  if(!$('#wxLocateSafe')){
    const locate=document.createElement('button');
    locate.type='button';
    locate.className='btn';
    locate.id='wxLocateSafe';
    locate.textContent='Use my position';
    actions.appendChild(locate);
  }

  if(!$('#wxSelectMapSafe')){
    const wrap=document.createElement('div');
    wrap.className='mt-wx-map-wrap';
    wrap.innerHTML=`
      <div class="mt-wx-map-toolbar"><span class="chip">CLICK MAP TO SELECT POSITION</span></div>
      <div id="wxSelectMapSafe" class="map mt-wx-map" aria-label="Select weather forecast position on map"></div>
      <p id="wxMapLoadNote" class="helper mt-wx-map-note">Click the map or drag the marker to set latitude and longitude. Forecast data is loaded only when you press <b>Load forecast</b>.</p>
    `;
    actions.insertAdjacentElement('afterend',wrap);
  }

  bindControls();
  initMap();
  return true;
}

function tryInitWeather(attempt=0){
  if(ensureWeatherMap()) return;
  if(attempt<4) setTimeout(()=>tryInitWeather(attempt+1),60*(attempt+1));
}

document.addEventListener('click',e=>{
  const target=e.target.closest('[data-page="weather"],[data-go="weather"]');
  if(target) setTimeout(()=>tryInitWeather(0),50);
});

window.addEventListener('pageshow',()=>{
  if($('#weather')?.classList.contains('active')) setTimeout(()=>tryInitWeather(0),50);
});

window.__marineToolsWeatherMapSafe={version:VERSION,refresh:()=>map?.invalidateSize(false)};
})();
