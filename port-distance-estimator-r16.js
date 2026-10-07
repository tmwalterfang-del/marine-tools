console.info('Marine Tools Port Distance & Sea Time R16 estimator loaded');

const LIB_VERSION='2.3.0';
const MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0?bundle&target=es2022';
const MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/+esm';
const MARNET20_MODULE='https://esm.sh/searoute-ts@2.3.0/marnet-20km?bundle&target=es2022';
const MARNET50_MODULE='https://esm.sh/searoute-ts@2.3.0/marnet-50km?bundle&target=es2022';
const PORTS_URL='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/dist/ports.json';
const PORTS_MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0/ports?bundle&target=es2022';
const PORTS_MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/ports/+esm';
const FIELDS_URL='https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer/7100/query?where=1%3D1&outFields=fldName%2CfldCurrentActivitySatus%2CcmpLongName%2CfldMainSupplyBase%2CfldMainArea%2CfldNpdidField&returnGeometry=true&outSR=4326&geometryPrecision=4&f=geojson';
const FACILITIES_URL='https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/FeatureServer/304/query?where=fclSurface%3D%27Y%27&outFields=fclName%2CfclKind%2CfclPhase%2CfclFunctions%2CfclFixedOrMoveable%2CfclNpdidFacility&returnGeometry=true&outSR=4326&f=geojson';

const $=s=>document.querySelector(s);
const state={engine:null,ports:[],offshore:[],locations:[],byCode:new Map(),coastalNetwork:null,coastalResolutionKm:null,coastalNetworkPromise:null};

function fmt(n,d=0){return Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:d}):'—'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function titleCase(s){return String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function etaText(hours){if(!Number.isFinite(hours))return'—';let d=Math.floor(hours/24),h=Math.round(hours-d*24);if(h===24){d++;h=0}return d?d+' d '+h+' h':h+' h'}
function typeName(x){return x.type==='field'?'Offshore field':x.type==='facility'?'Fixed facility':x.type==='custom'?'Custom position':'Major port'}
function sourceName(x){return x.source||(x.type==='port'?'UN/LOCODE-derived port directory':'User position')}
function haversineKm(a,b){const R=6371,rad=Math.PI/180,lat1=a[1]*rad,lat2=b[1]*rad,dlat=(b[1]-a[1])*rad,dlon=(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
function greatCircleNm(a,b){return haversineKm(a,b)/1.852}
function isNorwayLocation(x){return !!x&&(String(x.code||'').startsWith('NO')||/norway|norwegian continental shelf/i.test(String(x.country||''))||x.type==='field'||x.type==='facility')}
function needsCoastalNetwork(from,to){return isNorwayLocation(from)||isNorwayLocation(to)||haversineKm(from.coordinates,to.coordinates)<=750}
function showAlert(kind,message){const el=$('#routeAlert');if(!message){el.hidden=true;el.className='route-alert';el.textContent='';return}el.hidden=false;el.className='route-alert '+kind;el.innerHTML=message}

async function loadModule(){try{return await import(MODULE_PRIMARY)}catch(e){console.warn('Primary route module failed',e);return await import(MODULE_FALLBACK)}}
async function loadPortDirectory(){
  try{const r=await fetch(PORTS_URL);if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}
  catch(e){
    try{const m=await import(PORTS_MODULE_PRIMARY);return m.PORTS||m.default||{}}
    catch(e2){const m=await import(PORTS_MODULE_FALLBACK);return m.PORTS||m.default||{}}
  }
}
async function ensureCoastalNetwork(){
  if(state.coastalNetwork)return{network:state.coastalNetwork,resolutionKm:state.coastalResolutionKm};
  if(state.coastalNetworkPromise)return state.coastalNetworkPromise;
  state.coastalNetworkPromise=(async()=>{
    let last;
    for(const [resolution,url] of [[20,MARNET20_MODULE],[50,MARNET50_MODULE]]){
      try{
        const mod=await import(url),network=mod.DEFAULT_MARNET||mod.default;
        if(!network||!Array.isArray(network.features))throw new Error('Invalid network');
        state.coastalNetwork=network;state.coastalResolutionKm=resolution;return{network,resolutionKm:resolution};
      }catch(e){last=e}
    }
    throw last||new Error('Coastal network unavailable');
  })();
  try{return await state.coastalNetworkPromise}finally{state.coastalNetworkPromise=null}
}
function normalizePorts(data){
  const raw=Array.isArray(data)?data:Object.entries(data||{}).map(([code,v])=>Object.assign({code},v||{}));
  return raw.map(p=>{
    const code=String(p.code||p.locode||p.unlocode||p.id||'').toUpperCase();
    const coords=p.coordinates||p.coord||p.location||[p.lon!=null?p.lon:p.longitude,p.lat!=null?p.lat:p.latitude];
    const lon=Number(coords&&coords[0]),lat=Number(coords&&coords[1]);
    return{type:'port',code,name:p.name||p.port||code,country:p.country||p.countryName||'',coordinates:[lon,lat],source:'UN/LOCODE-derived port directory'};
  }).filter(p=>p.code&&Number.isFinite(p.coordinates[0])&&Number.isFinite(p.coordinates[1]));
}
function collectPairs(node,out){if(!Array.isArray(node))return;if(node.length>=2&&Number.isFinite(Number(node[0]))&&Number.isFinite(Number(node[1]))){out.push([Number(node[0]),Number(node[1])]);return}node.forEach(x=>collectPairs(x,out))}
function geometryCenter(geometry){const pts=[];collectPairs(geometry&&geometry.coordinates,pts);if(!pts.length)return null;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;pts.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1])});return[(minX+maxX)/2,(minY+maxY)/2]}
function normalizeFields(geo){
  return(geo&&geo.features||[]).map(f=>{const p=f.properties||{},c=geometryCenter(f.geometry),name=String(p.fldName||'').trim();if(!c||!name)return null;return{type:'field',code:'FIELD:'+String(p.fldNpdidField||name),name,country:'Norwegian Continental Shelf',coordinates:c,source:'Norwegian Offshore Directorate',meta:{status:p.fldCurrentActivitySatus||'',operator:p.cmpLongName||'',supplyBase:p.fldMainSupplyBase||'',area:p.fldMainArea||''}}}).filter(Boolean)
}
function normalizeFacilities(geo){
  return(geo&&geo.features||[]).map(f=>{const p=f.properties||{},coords=f.geometry&&f.geometry.coordinates;if(!Array.isArray(coords)||!Number.isFinite(Number(coords[0]))||!Number.isFinite(Number(coords[1])))return null;const fixed=String(p.fclFixedOrMoveable||'').toUpperCase();if(fixed&&fixed!=='FIXED')return null;const name=String(p.fclName||'').trim();if(!name)return null;return{type:'facility',code:'FAC:'+String(p.fclNpdidFacility||name),name,country:'Norwegian Continental Shelf',coordinates:[Number(coords[0]),Number(coords[1])],source:'Norwegian Offshore Directorate',meta:{kind:p.fclKind||'',phase:p.fclPhase||'',functions:p.fclFunctions||'',fixedOrMoveable:p.fclFixedOrMoveable||''}}}).filter(Boolean)
}
function locationLabel(x){
  if(x.type==='port')return'⚓ PORT · '+x.name+' · '+x.code+(x.country?' · '+x.country:'');
  if(x.type==='field')return'◇ FIELD · '+x.name+(x.meta&&x.meta.area?' · '+x.meta.area:'');
  if(x.type==='facility')return'▣ FACILITY · '+x.name+(x.meta&&x.meta.kind?' · '+x.meta.kind:'');
  return'⊕ POSITION · '+fmt(x.coordinates[1],4)+', '+fmt(x.coordinates[0],4)
}
function rebuildIndex(){state.locations=[...state.offshore,...state.ports];state.byCode=new Map(state.locations.map(x=>[String(x.code||'').toUpperCase(),x]));$('#portList').innerHTML=state.locations.slice(0,3000).map(x=>'<option value="'+esc(locationLabel(x))+'"></option>').join('')}
function parseCustomPosition(s){const m=String(s||'').trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;return{type:'custom',code:'CUSTOM:'+lat+','+lon,name:'Custom position',country:'',coordinates:[lon,lat],source:'User-entered coordinates',meta:{}}}
function resolveLocation(input){
  const custom=parseCustomPosition(input);if(custom)return custom;
  const q=String(input||'').trim().toLowerCase();if(!q)return null;
  if(state.byCode.has(q.toUpperCase()))return state.byCode.get(q.toUpperCase());
  return state.locations.find(x=>locationLabel(x).toLowerCase()===q)||state.locations.find(x=>x.name.toLowerCase()===q)||state.locations.find(x=>x.name.toLowerCase().startsWith(q))||state.locations.find(x=>String(x.code||'').toLowerCase().startsWith(q))
}
function setLocation(el,x){if(x)el.value=locationLabel(x)}
function setPort(el,code){setLocation(el,state.byCode.get(code))}
function findNamed(type,name){const q=String(name).toLowerCase();return state.locations.find(x=>x.type===type&&x.name.toLowerCase()===q)||state.locations.find(x=>x.type===type&&x.name.toLowerCase().includes(q))}
async function loadOffshore(){
  const results=await Promise.allSettled([fetch(FIELDS_URL).then(r=>r.json()),fetch(FACILITIES_URL).then(r=>r.json())]);
  const fields=results[0].status==='fulfilled'?normalizeFields(results[0].value):[];
  const facilities=results[1].status==='fulfilled'?normalizeFacilities(results[1].value):[];
  state.offshore=[...fields,...facilities];rebuildIndex();
}
function loadProfile(){
  try{
    const legacy=JSON.parse(localStorage.getItem('mt.profile')||'null'),v2=JSON.parse(localStorage.getItem('mt.profile.v2')||'null');
    const speed=Number(legacy&&legacy.serviceSpeed!=null?legacy.serviceSpeed:v2&&v2.vessel&&v2.vessel.serviceSpeed);
    const draft=Number(legacy&&legacy.draft!=null?legacy.draft:v2&&v2.vessel&&v2.vessel.draft);
    const fuel=Number(legacy&&legacy.fuelDay!=null?legacy.fuelDay:v2&&v2.operational&&v2.operational.fuelDay);
    return{speed:Number.isFinite(speed)?speed:null,draft:Number.isFinite(draft)?draft:null,fuelDay:Number.isFinite(fuel)?fuel:null};
  }catch{return{speed:null,draft:null,fuelDay:null}}
}
function applyProfile(show=true){const p=loadProfile();if(p.speed)$('#speedKnots').value=p.speed;if(p.draft)$('#draftM').value=p.draft;if(show)$('#speedHint').textContent=(p.speed||p.draft||p.fuelDay)?'Loaded available values from Vessel Profile.':'No saved Vessel Profile found in this browser.';return p}
function routeOptions(mode,networkInfo){
  const speed=Number($('#speedKnots').value)||12,draft=Number($('#draftM').value);
  const o={units:'nauticalmiles',speedKnots:speed,returnPassages:true};
  if(networkInfo&&networkInfo.network){o.network=networkInfo.network;o.maxSnapDistanceKm=networkInfo.resolutionKm<=20?35:65}
  if(Number.isFinite(draft)&&draft>0)o.vesselDraftMeters=draft;
  if(mode==='suez')o.via=['suez'];
  if(mode==='panama')o.via=['panama'];
  if(mode==='cape')o.restrictions=['suez','babelmandeb'];
  if(mode==='no-panama')o.restrictions=['panama'];
  return o
}
function fuelEstimate(hours){const p=loadProfile();return p.fuelDay&&Number.isFinite(hours)?p.fuelDay*(hours/24):null}
function routeBasis(mode,route){const p=route.properties||{},pass=p.passages||[];if(mode==='suez')return['Via Suez',pass];if(mode==='panama')return['Via Panama',pass];if(mode==='cape')return['Via Cape / avoid Suez',pass];if(mode==='no-panama')return['Avoid Panama',pass];return['Automatic estimate',pass]}
function detailsRows(from,to,route,mode,speed){
  const p=route.properties||{},distance=Number(p.length)||0,hours=Number.isFinite(Number(p.durationHours))?Number(p.durationHours):distance/speed,gc=greatCircleNm(from.coordinates,to.coordinates),ratio=gc?distance/gc:null,[basis,pass]=routeBasis(mode,route);
  return[
    ['From',from.name+' · '+typeName(from)],
    ['To',to.name+' · '+typeName(to)],
    ['Estimated distance',fmt(distance,1)+' NM'],
    ['Selected speed',fmt(speed,1)+' kn'],
    ['Estimated sea time',etaText(hours)],
    ['Route preference',basis],
    ['Detected passages',pass.length?pass.map(titleCase).join(', '):'None labelled'],
    ['Great-circle reference',fmt(gc,1)+' NM'],
    ['Distance / great-circle',Number.isFinite(ratio)?fmt(ratio,2)+'×':'—'],
    ['Origin source',sourceName(from)],
    ['Destination source',sourceName(to)],
    ['Estimate engine','searoute-ts '+LIB_VERSION+' macro maritime network']
  ]
}
function renderEstimate(from,to,route,mode){
  const p=route.properties||{},distance=Number(p.length)||0,speed=Number($('#speedKnots').value)||12,hours=Number.isFinite(Number(p.durationHours))?Number(p.durationHours):distance/speed;
  const fuel=fuelEstimate(hours),[basis,pass]=routeBasis(mode,route);
  $('#distanceValue').textContent=fmt(distance,0)+' NM';
  $('#etaValue').textContent=etaText(hours);$('#etaSpeed').textContent='at '+fmt(speed,1)+' kn';
  $('#fuelValue').textContent=fuel!=null?fmt(fuel,1)+' m³':'—';$('#fuelHint').textContent=fuel!=null?'using saved fuel/day':'save fuel/day in Vessel Profile to estimate';
  $('#routeBasisValue').textContent=basis;$('#passageValue').textContent=pass.length?pass.map(titleCase).join(', '):'macro estimate';
  $('#estimateTitle').textContent=from.name+' → '+to.name;$('#estimateSubtitle').textContent='Approximate voyage estimate only.';
  $('#estimateDetails').innerHTML=detailsRows(from,to,route,mode,speed).map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('');
  $('#resultArea').hidden=false;$('#resultArea').scrollIntoView({behavior:'smooth',block:'start'})
}
async function calculate(){
  showAlert(null,null);
  const from=resolveLocation($('#fromPort').value),to=resolveLocation($('#toPort').value);
  if(!from||!to){showAlert('error','<b>Invalid location.</b> Select a major port, offshore field/facility, or enter latitude,longitude.');return}
  if(from.code===to.code){showAlert('error','<b>Choose two different locations.</b>');return}
  const btn=$('#calculateRoute'),old=btn.textContent;btn.disabled=true;btn.textContent='Calculating estimate…';
  try{
    let networkInfo=null;
    if(needsCoastalNetwork(from,to)){
      try{networkInfo=await ensureCoastalNetwork()}catch(e){console.warn('Fine coastal network unavailable; using standard estimate network',e)}
    }
    const mode=$('#routeMode').value,opts=routeOptions(mode,networkInfo);
    const route=state.engine.seaRoute(from.coordinates,to.coordinates,opts);
    if(!route||!route.properties||!Number.isFinite(Number(route.properties.length)))throw new Error('No distance estimate returned');
    renderEstimate(from,to,route,mode);
  }catch(e){
    console.error(e);$('#resultArea').hidden=true;showAlert('error','<b>Estimate unavailable.</b> '+esc(String(e&&e.message||e||'Unknown error')))
  }finally{btn.disabled=false;btn.textContent=old}
}
function clearAll(){$('#fromPort').value='';$('#toPort').value='';$('#resultArea').hidden=true;showAlert(null,null)}
async function init(){
  const status=$('#engineStatus');
  try{
    state.engine=await loadModule();
    state.ports=normalizePorts(await loadPortDirectory()).sort((a,b)=>a.name.localeCompare(b.name));
    if(!state.ports.length)throw new Error('No port data');
    rebuildIndex();applyProfile(false);loadOffshore().catch(e=>console.warn('Offshore catalogue unavailable',e));
    setPort($('#fromPort'),'NLRTM');setPort($('#toPort'),'SGSIN');
    status.className='engine-status ready';status.textContent='Ready · estimate engine '+LIB_VERSION;$('#calculateRoute').disabled=false;
  }catch(e){
    console.error(e);status.className='engine-status error';status.textContent='Estimator failed to load';showAlert('error','<b>Estimator failed to load.</b> '+esc(String(e&&e.message||e)))
  }
}
document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{const[a,z]=b.dataset.route.split('|');setPort($('#fromPort'),a);setPort($('#toPort'),z)}));
document.querySelectorAll('[data-mixed-from]').forEach(b=>b.addEventListener('click',()=>{const from=state.byCode.get(String(b.dataset.mixedFrom||'').toUpperCase()),to=findNamed(b.dataset.mixedType,b.dataset.mixedName);if(!from||!to){showAlert('warn','The offshore example is not ready yet. Try again in a moment.');return}setLocation($('#fromPort'),from);setLocation($('#toPort'),to)}));
$('#calculateRoute').addEventListener('click',calculate);
$('#swapPorts').addEventListener('click',()=>{const a=$('#fromPort').value;$('#fromPort').value=$('#toPort').value;$('#toPort').value=a});
$('#useProfile').addEventListener('click',()=>applyProfile(true));
$('#clearRoute').addEventListener('click',clearAll);
init();
