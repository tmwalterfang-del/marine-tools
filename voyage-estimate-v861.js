(() => {
'use strict';

const LIB_VERSION='2.3.0';
const DRAFT_LIMITS_FALLBACK={panama:15.2,suez:20.1,kiel:7.0,corinth:7.3};
const CORE_MODULES=[
  'https://esm.sh/searoute-ts@2.3.0?bundle&target=es2022',
  'https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/+esm'
];
const COASTAL_MODULES={
  20:[
    'https://esm.sh/searoute-ts@2.3.0/marnet-20km?bundle&target=es2022',
    'https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/marnet-20km/+esm'
  ],
  50:[
    'https://esm.sh/searoute-ts@2.3.0/marnet-50km?bundle&target=es2022',
    'https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/marnet-50km/+esm'
  ]
};
const PORTS_URL='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/dist/ports.json';
const PORT_MODULES=[
  'https://esm.sh/searoute-ts@2.3.0/ports?bundle&target=es2022',
  'https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/ports/+esm'
];
const FIELDS_URL='https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer/7100/query?where=1%3D1&outFields=fldName%2CfldCurrentActivitySatus%2CcmpLongName%2CfldMainSupplyBase%2CfldMainArea%2CfldNpdidField&returnGeometry=true&outSR=4326&geometryPrecision=4&f=geojson';
const FACILITIES_URL='https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/FeatureServer/304/query?where=fclSurface%3D%27Y%27&outFields=fclName%2CfclKind%2CfclPhase%2CfclFunctions%2CfclFixedOrMoveable%2CfclNpdidFacility&returnGeometry=true&outSR=4326&f=geojson';

const state={
  engine:null,ports:[],offshore:[],locations:[],byCode:new Map(),
  coastalNetwork:null,coastalResolutionKm:null,coastalNetworkPromise:null,
  initPromise:null,ready:false
};

const $=s=>document.querySelector(s);
const fmt=(n,d=0)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:d}):'—';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titleCase=s=>String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

function etaText(hours){
  if(!Number.isFinite(hours))return'—';
  let d=Math.floor(hours/24),h=Math.round(hours-d*24);
  if(h===24){d++;h=0}
  return d?d+' d '+h+' h':h+' h';
}
function typeName(x){return x.type==='field'?'Offshore field':x.type==='facility'?'Fixed facility':x.type==='custom'?'Custom position':'Port'}
function sourceName(x){return x.source||(x.type==='port'?'UN/LOCODE-derived port directory':'User position')}
function haversineKm(a,b){const R=6371,rad=Math.PI/180,lat1=a[1]*rad,lat2=b[1]*rad,dlat=(b[1]-a[1])*rad,dlon=(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
function greatCircleNm(a,b){return haversineKm(a,b)/1.852}
function isNorwayLocation(x){return !!x&&(String(x.code||'').startsWith('NO')||/norway|norwegian continental shelf/i.test(String(x.country||''))||x.type==='field'||x.type==='facility')}
function needsCoastalNetwork(from,to){return isNorwayLocation(from)||isNorwayLocation(to)||haversineKm(from.coordinates,to.coordinates)<=750}
function showAlert(kind,message){
  const el=$('#veRouteAlert');if(!el)return;
  if(!message){el.hidden=true;el.className='ve-route-alert';el.textContent='';return}
  el.hidden=false;el.className='ve-route-alert '+kind;el.innerHTML=message;
}
function setStatus(kind,text){
  const el=$('#veEngineStatus');if(!el)return;
  el.className='ve-engine-status '+kind;el.textContent=text;
}
async function importFirst(urls){
  let last;
  for(const url of urls){let timer;try{return await Promise.race([import(url),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Network module loading timed out after 12 seconds')),12000)})])}catch(e){last=e}finally{clearTimeout(timer)}}
  throw last||new Error('Module unavailable');
}
async function loadPortDirectory(){
  try{
    const r=await fetch(PORTS_URL,{cache:'force-cache'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return await r.json();
  }catch(e){
    const m=await importFirst(PORT_MODULES);
    return m.PORTS||m.default||{};
  }
}
async function ensureCoastalNetwork(){
  if(state.coastalNetwork)return{network:state.coastalNetwork,resolutionKm:state.coastalResolutionKm};
  if(state.coastalNetworkPromise)return state.coastalNetworkPromise;
  state.coastalNetworkPromise=(async()=>{
    let last;
    for(const resolution of [20,50]){
      try{
        const mod=await importFirst(COASTAL_MODULES[resolution]);
        const network=mod.DEFAULT_MARNET||mod.default;
        if(!network||!Array.isArray(network.features))throw new Error('Invalid network');
        state.coastalNetwork=network;state.coastalResolutionKm=resolution;
        return{network,resolutionKm:resolution};
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
function collectPairs(node,out){
  if(!Array.isArray(node))return;
  if(node.length>=2&&Number.isFinite(Number(node[0]))&&Number.isFinite(Number(node[1]))){out.push([Number(node[0]),Number(node[1])]);return}
  node.forEach(x=>collectPairs(x,out));
}
function geometryCenter(geometry){
  const pts=[];collectPairs(geometry&&geometry.coordinates,pts);if(!pts.length)return null;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  pts.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1])});
  return[(minX+maxX)/2,(minY+maxY)/2];
}
function normalizeFields(geo){
  return(geo&&geo.features||[]).map(f=>{
    const p=f.properties||{},c=geometryCenter(f.geometry),name=String(p.fldName||'').trim();
    if(!c||!name)return null;
    return{type:'field',code:'FIELD:'+String(p.fldNpdidField||name),name,country:'Norwegian Continental Shelf',coordinates:c,source:'Norwegian Offshore Directorate',meta:{status:p.fldCurrentActivitySatus||'',operator:p.cmpLongName||'',supplyBase:p.fldMainSupplyBase||'',area:p.fldMainArea||''}};
  }).filter(Boolean);
}
function normalizeFacilities(geo){
  return(geo&&geo.features||[]).map(f=>{
    const p=f.properties||{},coords=f.geometry&&f.geometry.coordinates;
    if(!Array.isArray(coords)||!Number.isFinite(Number(coords[0]))||!Number.isFinite(Number(coords[1])))return null;
    const fixed=String(p.fclFixedOrMoveable||'').toUpperCase();if(fixed&&fixed!=='FIXED')return null;
    const name=String(p.fclName||'').trim();if(!name)return null;
    return{type:'facility',code:'FAC:'+String(p.fclNpdidFacility||name),name,country:'Norwegian Continental Shelf',coordinates:[Number(coords[0]),Number(coords[1])],source:'Norwegian Offshore Directorate',meta:{kind:p.fclKind||'',phase:p.fclPhase||'',functions:p.fclFunctions||'',fixedOrMoveable:p.fclFixedOrMoveable||''}};
  }).filter(Boolean);
}
function locationLabel(x){
  if(x.type==='port')return'PORT · '+x.name+' · '+x.code+(x.country?' · '+x.country:'');
  if(x.type==='field')return'FIELD · '+x.name+(x.meta&&x.meta.area?' · '+x.meta.area:'');
  if(x.type==='facility')return'FACILITY · '+x.name+(x.meta&&x.meta.kind?' · '+x.meta.kind:'');
  return'POSITION · '+fmt(x.coordinates[1],4)+', '+fmt(x.coordinates[0],4);
}
function rebuildIndex(){
  state.locations=[...state.offshore,...state.ports];
  state.byCode=new Map(state.locations.map(x=>[String(x.code||'').toUpperCase(),x]));
  const list=$('#vePortList');if(list)list.innerHTML=state.locations.slice(0,3000).map(x=>'<option value="'+esc(locationLabel(x))+'"></option>').join('');
  const summary=$('#veCatalogText');
  if(summary)summary.textContent=state.offshore.length
    ?fmt(state.ports.length,0)+' ports · '+fmt(state.offshore.length,0)+' Norwegian offshore locations'
    :fmt(state.ports.length,0)+' ports · loading Norwegian offshore locations…';
}
function parseCustomPosition(s){
  const m=String(s||'').trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);
  if(!m)return null;
  const lat=Number(m[1]),lon=Number(m[2]);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
  return{type:'custom',code:'CUSTOM:'+lat+','+lon,name:'Custom position',country:'',coordinates:[lon,lat],source:'User-entered coordinates',meta:{}};
}
function resolveLocation(input){
  const custom=parseCustomPosition(input);if(custom)return custom;
  const q=String(input||'').trim().toLowerCase();if(!q)return null;
  if(state.byCode.has(q.toUpperCase()))return state.byCode.get(q.toUpperCase());
  return state.locations.find(x=>locationLabel(x).toLowerCase()===q)
    ||state.locations.find(x=>x.name.toLowerCase()===q)
    ||state.locations.find(x=>x.name.toLowerCase().startsWith(q))
    ||state.locations.find(x=>String(x.code||'').toLowerCase().startsWith(q));
}
function setLocation(el,x){if(el&&x)el.value=locationLabel(x)}
function setPort(el,code){setLocation(el,state.byCode.get(code))}
function findNamed(type,name){const q=String(name).toLowerCase();return state.locations.find(x=>x.type===type&&x.name.toLowerCase()===q)||state.locations.find(x=>x.type===type&&x.name.toLowerCase().includes(q))}
async function loadOffshore(){
  const fetchJson=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()};
  const results=await Promise.allSettled([fetchJson(FIELDS_URL),fetchJson(FACILITIES_URL)]);
  const fields=results[0].status==='fulfilled'?normalizeFields(results[0].value):[];
  const facilities=results[1].status==='fulfilled'?normalizeFacilities(results[1].value):[];
  state.offshore=[...fields,...facilities];rebuildIndex();
  const note=$('#veCatalogText');
  if(note&&!state.offshore.length)note.textContent=fmt(state.ports.length,0)+' ports · Norwegian offshore catalogue unavailable';
}
function loadProfile(){
  try{
    const legacy=JSON.parse(localStorage.getItem('mt.profile')||'null');
    const v2=JSON.parse(localStorage.getItem('mt.profile.v2')||'null');
    const speed=Number(legacy&&legacy.serviceSpeed!=null?legacy.serviceSpeed:v2&&v2.vessel&&v2.vessel.serviceSpeed);
    const draft=Number(legacy&&legacy.draft!=null?legacy.draft:v2&&v2.vessel&&v2.vessel.draft);
    const fuel=Number(legacy&&legacy.fuelDay!=null?legacy.fuelDay:v2&&v2.operational&&v2.operational.fuelDay);
    return{speed:Number.isFinite(speed)?speed:null,draft:Number.isFinite(draft)?draft:null,fuelDay:Number.isFinite(fuel)?fuel:null};
  }catch{return{speed:null,draft:null,fuelDay:null}}
}
function applyProfile(show=true){
  const p=loadProfile();
  if(p.speed>0)$('#veSpeedKnots').value=p.speed;
  if(p.draft>0)$('#veDraftM').value=p.draft;
  if(show){
    const hint=$('#veSpeedHint');
    if(hint)hint.textContent=(p.speed||p.draft||p.fuelDay)?'Loaded available values from Vessel Profile.':'No saved Vessel Profile found in this browser.';
  }
  updateRouteOptionAvailability();
  return p;
}
function draftLimits(){
  return state.engine&&state.engine.CANAL_MAX_DRAFT_M?state.engine.CANAL_MAX_DRAFT_M:DRAFT_LIMITS_FALLBACK;
}
function currentDraft(){
  const raw=$('#veDraftM')?.value?.trim();
  if(raw==null||raw==='')return null;
  const value=Number(raw);
  return Number.isFinite(value)&&value>=0?value:null;
}
function draftBlockedPassages(draft=currentDraft()){
  if(!(draft>0))return[];
  const limits=draftLimits();
  return Object.entries(limits)
    .filter(([,limit])=>Number.isFinite(Number(limit))&&draft>Number(limit))
    .map(([passage,limit])=>({passage,limit:Number(limit)}));
}
function passageLabel(p){return({suez:'Suez',panama:'Panama',kiel:'Kiel',corinth:'Corinth',babelmandeb:'Bab-el-Mandeb'})[p]||titleCase(p)}
function option(id){return document.getElementById(id)}
function setOptionVisual(input,disabled,reason=''){
  if(!input)return;
  input.disabled=disabled;
  const label=input.closest('.ve-route-option');
  if(label){label.classList.toggle('is-disabled',disabled);const note=label.querySelector('.ve-option-note');if(note)note.textContent=reason}
}
function updateRouteOptionAvailability(){
  const viaSuez=option('veViaSuez'),avoidSuez=option('veAvoidSuez'),viaPanama=option('veViaPanama'),avoidPanama=option('veAvoidPanama');
  if(!viaSuez||!avoidSuez||!viaPanama||!avoidPanama)return;

  for(const input of [viaSuez,avoidSuez,viaPanama,avoidPanama]){
    input.checked=input.dataset.userChecked==='1';
    setOptionVisual(input,false,'');
  }

  const draft=currentDraft(),limits=draftLimits(),blocked=draftBlockedPassages(draft);
  const blockedNames=new Set(blocked.map(x=>x.passage));

  const applyPair=(via,avoid,passage,avoidName)=>{
    const limit=Number(limits[passage]);
    if(blockedNames.has(passage)){
      via.checked=false;
      setOptionVisual(via,true,'Unavailable: draft exceeds '+fmt(limit,1)+' m model limit.');
      avoid.checked=true;
      setOptionVisual(avoid,true,'Applied automatically from entered draft.');
      return;
    }
    if(avoid.checked){
      via.checked=false;
      setOptionVisual(via,true,'Unavailable while '+avoidName+' is selected.');
    }else if(via.checked){
      avoid.checked=false;
      setOptionVisual(avoid,true,'Unavailable while Via '+passageLabel(passage)+' is selected.');
    }
  };
  applyPair(viaSuez,avoidSuez,'suez','Avoid Suez / Bab-el-Mandeb');
  applyPair(viaPanama,avoidPanama,'panama','Avoid Panama');

  const status=$('#veDraftGateStatus');
  if(status){
    if(!(draft>0))status.innerHTML='<b>No draft entered.</b> Enter draft or use Vessel Profile to apply the estimator\'s canal draft gates.';
    else if(blocked.length)status.innerHTML='<b>Draft '+esc(fmt(draft,1))+' m:</b> model automatically blocks '+blocked.map(x=>esc(passageLabel(x.passage))+' ('+esc(fmt(x.limit,1))+' m)').join(', ')+'.';
    else status.innerHTML='<b>Draft '+esc(fmt(draft,1))+' m:</b> no modelled canal draft limit is exceeded.';
  }
}
function routePreferences(){
  const via=[],restrictions=[],labels=[];
  const viaSuez=option('veViaSuez'),avoidSuez=option('veAvoidSuez'),viaPanama=option('veViaPanama'),avoidPanama=option('veAvoidPanama');
  if(viaSuez?.checked&&!viaSuez.disabled){via.push('suez');labels.push('Via Suez')}
  if(viaPanama?.checked&&!viaPanama.disabled){via.push('panama');labels.push('Via Panama')}
  if(avoidSuez?.checked){restrictions.push('suez','babelmandeb');labels.push('Avoid Suez / Bab-el-Mandeb')}
  if(avoidPanama?.checked){restrictions.push('panama');labels.push('Avoid Panama')}
  return{via,restrictions:[...new Set(restrictions)],labels};
}
function routeOptions(preferences,networkInfo){
  const speed=Number($('#veSpeedKnots').value),draft=currentDraft();
  const o={units:'nauticalmiles',speedKnots:speed,returnPassages:true};
  if(networkInfo&&networkInfo.network){o.network=networkInfo.network;o.maxSnapDistanceKm=networkInfo.resolutionKm<=20?35:65}
  if(Number.isFinite(draft)&&draft>0)o.vesselDraftMeters=draft;
  if(preferences.via.length)o.via=preferences.via;
  if(preferences.restrictions.length)o.restrictions=preferences.restrictions;
  return o;
}
function routeBasis(preferences,route){
  const pass=route.properties&&route.properties.passages||[];
  return[preferences.labels.length?preferences.labels.join(' · '):'Automatic estimate',pass];
}
function routeMetrics(route,speed){
  const p=route.properties||{};
  const networkNm=Number(p.length)||0;
  const originSnapKm=Math.max(0,Number(p.originSnapKm)||0),destinationSnapKm=Math.max(0,Number(p.destinationSnapKm)||0);
  const endpointNm=(originSnapKm+destinationSnapKm)/1.852;
  const distanceNm=networkNm+endpointNm;
  const hours=speed>0?distanceNm/speed:NaN;
  return{networkNm,originSnapKm,destinationSnapKm,endpointNm,distanceNm,hours};
}
function fuelEstimate(hours){const p=loadProfile();return p.fuelDay>0&&Number.isFinite(hours)?p.fuelDay*(hours/24):null}
function detailsRows(from,to,route,preferences,speed){
  const m=routeMetrics(route,speed),gc=greatCircleNm(from.coordinates,to.coordinates),ratio=gc?m.distanceNm/gc:null,[basis,pass]=routeBasis(preferences,route),draft=currentDraft(),blocked=draftBlockedPassages(draft);
  const rows=[
    ['From',from.name+' · '+typeName(from)],
    ['To',to.name+' · '+typeName(to)],
    ['Estimated distance',fmt(m.distanceNm,1)+' NM'],
    ['Selected speed',fmt(speed,1)+' kn'],
    ['Draft',draft!=null?fmt(draft,1)+' m':'Not entered'],
    ['Estimated sea time',etaText(m.hours)],
    ['Route preferences',basis],
    ['Draft restrictions (model)',blocked.length?blocked.map(x=>passageLabel(x.passage)+' > '+fmt(x.limit,1)+' m').join(', '):draft!=null?'None triggered':'Not assessed'],
    ['Detected passages',pass.length?pass.map(titleCase).join(', '):'None labelled']
  ];
  if(m.endpointNm>0.05)rows.push(['Endpoint connection allowance',fmt(m.endpointNm,1)+' NM']);
  rows.push(
    ['Great-circle reference',fmt(gc,1)+' NM'],
    ['Distance / great-circle',Number.isFinite(ratio)?fmt(ratio,2)+'×':'—'],
    ['Origin source',sourceName(from)],
    ['Destination source',sourceName(to)],
    ['Estimate engine','searoute-ts '+LIB_VERSION+' · Eurostat maritime network']
  );
  return rows;
}
function renderEstimate(from,to,route,preferences){
  const speed=Number($('#veSpeedKnots').value),m=routeMetrics(route,speed),fuel=fuelEstimate(m.hours),[basis,pass]=routeBasis(preferences,route);
  $('#veDistanceValue').textContent=fmt(m.distanceNm,0)+' NM';
  $('#veEtaValue').textContent=etaText(m.hours);
  $('#veEtaSpeed').textContent='at '+fmt(speed,1)+' kn';
  $('#veFuelValue').textContent=fuel!=null?fmt(fuel,1)+' m³':'—';
  $('#veFuelHint').textContent=fuel!=null?'using saved fuel/day':'save fuel/day in Vessel Profile to estimate';
  $('#veRouteBasisValue').textContent=basis;
  $('#vePassageValue').textContent=pass.length?pass.map(titleCase).join(', '):'macro estimate';
  $('#veEstimateTitle').textContent=from.name+' → '+to.name;
  $('#veEstimateSubtitle').textContent='Approximate voyage estimate only.';
  $('#veEstimateDetails').innerHTML=detailsRows(from,to,route,preferences,speed).map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('');
  try{localStorage.setItem('mt.voyageEstimate.last',JSON.stringify({from:from.name,to:to.name,distanceNm:m.distanceNm,speedKnots:speed,hours:m.hours,fuelEstimateM3:fuel,routeBasis:basis,savedAt:new Date().toISOString()}))}catch{}
  $('#veResultArea').hidden=false;
  window.MT_USAGE?.record('calculation_succeeded','veCalculateRoute','voyage-estimate','Port Distance & Sea Time');
  $('#veResultArea').scrollIntoView({behavior:'smooth',block:'start'});
}
async function calculate(){
  window.MT_USAGE?.record('calculation_attempt','veCalculateRoute','voyage-estimate','Port Distance & Sea Time');
  const invalid=(kind,message)=>{window.MT_USAGE?.record('calculation_invalid','veCalculateRoute','voyage-estimate','Port Distance & Sea Time');showAlert(kind,message)};
  showAlert(null,null);
  if(!state.ready){invalid('warn','<b>Estimator is still loading.</b> Try again when the status shows Ready.');return}
  const from=resolveLocation($('#veFromPort').value),to=resolveLocation($('#veToPort').value);
  const speed=Number($('#veSpeedKnots').value),draftRaw=$('#veDraftM').value.trim(),draft=draftRaw===''?null:Number(draftRaw);
  if(!from||!to){invalid('error','<b>Invalid location.</b> Select a port, Norwegian offshore field/facility, or enter latitude,longitude.');return}
  if(from.code===to.code){invalid('error','<b>Choose two different locations.</b>');return}
  if(!(speed>=1&&speed<=40)){invalid('error','<b>Check speed.</b> Enter a value from 1 to 40 kn.');return}
  if(draft!=null&&(!(draft>=0)||draft>30)){invalid('error','<b>Check draft.</b> Enter 0–30 m or leave it blank.');return}
  const btn=$('#veCalculateRoute'),old=btn.textContent;btn.disabled=true;btn.textContent='Calculating estimate…';
  try{
    let networkInfo=null;
    if(needsCoastalNetwork(from,to)){
      try{networkInfo=await ensureCoastalNetwork()}catch(e){console.warn('Fine coastal network unavailable; using standard estimate network',e)}
    }
    updateRouteOptionAvailability();
    const preferences=routePreferences(),opts=routeOptions(preferences,networkInfo);
    const route=state.engine.seaRoute(from.coordinates,to.coordinates,opts);
    if(!route||!route.properties||!Number.isFinite(Number(route.properties.length)))throw new Error('No distance estimate returned');
    renderEstimate(from,to,route,preferences);
  }catch(e){
    console.error(e);$('#veResultArea').hidden=true;
    const msg=String(e&&e.message||e||'Unknown error');
    window.MT_USAGE?.record('calculation_failed','veCalculateRoute','voyage-estimate','Port Distance & Sea Time');showAlert('error','<b>Estimate unavailable.</b> '+esc(msg));
  }finally{btn.disabled=false;btn.textContent=old}
}
function clearAll(){
  $('#veFromPort').value='';$('#veToPort').value='';$('#veResultArea').hidden=true;showAlert(null,null);
}
function bind(){
  $('#veCalculateRoute').addEventListener('click',calculate);
  $('#veSwapPorts').addEventListener('click',()=>{const a=$('#veFromPort').value;$('#veFromPort').value=$('#veToPort').value;$('#veToPort').value=a});
  $('#veUseProfile').addEventListener('click',()=>applyProfile(true));
  $('#veDraftM').addEventListener('input',updateRouteOptionAvailability);
  const pairs={veViaSuez:'veAvoidSuez',veAvoidSuez:'veViaSuez',veViaPanama:'veAvoidPanama',veAvoidPanama:'veViaPanama'};
  for(const id of Object.keys(pairs)){
    const input=option(id);if(!input)continue;
    input.dataset.userChecked=input.checked?'1':'0';
    input.addEventListener('change',()=>{
      input.dataset.userChecked=input.checked?'1':'0';
      if(input.checked){const other=option(pairs[id]);if(other)other.dataset.userChecked='0'}
      updateRouteOptionAvailability();
    });
  }
  updateRouteOptionAvailability();
  $('#veClearRoute').addEventListener('click',clearAll);
  document.querySelectorAll('#voyage-estimate [data-route]').forEach(b=>b.addEventListener('click',()=>{const[a,z]=b.dataset.route.split('|');setPort($('#veFromPort'),a);setPort($('#veToPort'),z)}));
  document.querySelectorAll('#voyage-estimate [data-mixed-from]').forEach(b=>b.addEventListener('click',()=>{
    const from=state.byCode.get(String(b.dataset.mixedFrom||'').toUpperCase()),to=findNamed(b.dataset.mixedType,b.dataset.mixedName);
    if(!from||!to){showAlert('warn','The offshore example is still loading. Try again in a moment.');return}
    setLocation($('#veFromPort'),from);setLocation($('#veToPort'),to);
  }));
}
async function init(){
  if(state.ready)return;
  if(state.initPromise)return state.initPromise;
  state.initPromise=(async()=>{
    if(navigator.onLine===false){
      setStatus('error','Connection required');
      showAlert('warn','<b>Internet connection required.</b> The route engine and location catalogues are loaded when Voyage Estimate is opened.');
      return;
    }
    setStatus('loading','Loading estimator…');
    try{
      state.engine=await importFirst(CORE_MODULES);
      state.ports=normalizePorts(await loadPortDirectory()).sort((a,b)=>a.name.localeCompare(b.name));
      if(!state.ports.length)throw new Error('No port data');
      rebuildIndex();applyProfile(false);
      setPort($('#veFromPort'),'NLRTM');setPort($('#veToPort'),'SGSIN');
      state.ready=true;setStatus('ready','Ready · engine '+LIB_VERSION);
      updateRouteOptionAvailability();
      $('#veCalculateRoute').disabled=false;
      loadOffshore().catch(e=>console.warn('Offshore catalogue unavailable',e));
    }catch(e){
      console.error(e);setStatus('error','Estimator failed to load');
      showAlert('error','<b>Estimator failed to load.</b> '+esc(String(e&&e.message||e)));
    }
  })();
  try{return await state.initPromise}finally{if(!state.ready)state.initPromise=null}
}
function render(host){
  if(!host||host.dataset.voyageEstimateRendered)return;
  host.dataset.voyageEstimateRendered='1';window.MT_USAGE?.record('tool_opened','veCalculateRoute','voyage-estimate','Port Distance & Sea Time');
  host.innerHTML=`
    <div class="page-title ve-page-title">
      <div>
        <div class="eyebrow">MARINE TOOLS · VOYAGE ESTIMATE</div>
        <h1>Port Distance & Sea Time</h1>
        <p>Quick approximate voyage distance and sea-time estimates between ports and Norwegian offshore locations.</p>
      </div>
      <span id="veEngineStatus" class="ve-engine-status loading">Loading estimator…</span>
    </div>

    <div class="notice ve-warning"><b>Estimate only.</b> This is not a passage plan or navigational route. Actual sailed distance and time will vary with the vessel's passage plan, weather, traffic, restrictions, speed changes and operational requirements.</div>

    <div class="ve-draft-launch"><div><b>Voyage planning prototypes</b><span>Draft concepts for bunker requirement, speed scenarios, arrival planning, CO₂ estimates and vessel consumption curves.</span></div><button class="btn" type="button" data-go="voyage-planning-lab">Open planning drafts →</button></div>

    <article class="panel ve-builder">
      <div class="panel-head"><div><h2>Estimate voyage</h2><small>Select two locations and a speed. Marine Tools estimates distance, sea time and optional fuel use.</small></div></div>
      <div class="panel-body">
        <div class="ve-route-grid">
          <label><span>From location</span><input id="veFromPort" list="vePortList" autocomplete="off" placeholder="Port, field, facility or lat,lon"></label>
          <button id="veSwapPorts" class="btn ve-swap" type="button" title="Swap locations" aria-label="Swap locations">⇄</button>
          <label><span>To location</span><input id="veToPort" list="vePortList" autocomplete="off" placeholder="Port, field, facility or lat,lon"></label>
          <datalist id="vePortList"></datalist>
          <label><span>Speed kn</span><input id="veSpeedKnots" type="number" min="1" max="40" step="0.1" value="12"><small id="veSpeedHint">Used for estimated sea time.</small></label>
          <label><span>Draft m</span><input id="veDraftM" type="number" min="0" max="30" step="0.1" placeholder="Optional"><small>Applies supported canal draft gates.</small></label>
        </div>
        <div class="ve-route-options-wrap">
          <div class="ve-route-options-head"><div><b>Route preferences</b><small>Optional · combine where relevant</small></div><span>Automatic if none selected</span></div>
          <div class="ve-route-options">
            <label class="ve-route-option"><input id="veViaSuez" type="checkbox"><span><b>Via Suez</b><small class="ve-option-note"></small></span></label>
            <label class="ve-route-option"><input id="veViaPanama" type="checkbox"><span><b>Via Panama</b><small class="ve-option-note"></small></span></label>
            <label class="ve-route-option"><input id="veAvoidSuez" type="checkbox"><span><b>Avoid Suez / Bab-el-Mandeb</b><small class="ve-option-note"></small></span></label>
            <label class="ve-route-option"><input id="veAvoidPanama" type="checkbox"><span><b>Avoid Panama</b><small class="ve-option-note"></small></span></label>
          </div>
          <div class="ve-draft-meta"><div id="veDraftGateStatus" class="ve-draft-status"><b>No draft entered.</b> Canal draft gating is inactive.</div><span class="ve-draft-model-note">Fixed model limits · not live clearance</span></div>
        </div>
        <div class="ve-catalog"><span class="ve-dot"></span><span id="veCatalogText">Loading location catalogue…</span></div>
        <div class="ve-quick-routes"><span>Examples</span>
          <button data-route="NLRTM|SGSIN">Rotterdam → Singapore</button>
          <button data-route="USNYC|NLRTM">New York → Rotterdam</button>
          <button data-route="SGSIN|AEFJR">Singapore → Fujairah</button>
          <button data-mixed-from="NOBGO" data-mixed-type="field" data-mixed-name="TROLL">Bergen → Troll field</button>
          <button data-mixed-from="NOSVG" data-mixed-type="field" data-mixed-name="JOHAN SVERDRUP">Stavanger → Johan Sverdrup</button>
        </div>
        <div id="veRouteAlert" class="ve-route-alert" hidden></div>
        <div class="actions ve-actions">
          <button id="veCalculateRoute" class="btn primary" disabled>Calculate estimate</button>
          <button id="veUseProfile" class="btn">Use Vessel Profile</button>
          <button id="veClearRoute" class="btn">Clear</button>
        </div>
      </div>
    </article>

    <section id="veResultArea" class="ve-result-area" hidden>
      <div class="ve-summary-grid">
        <article><small>ESTIMATED DISTANCE</small><strong id="veDistanceValue">—</strong><span>nautical miles</span></article>
        <article><small>ESTIMATED SEA TIME</small><strong id="veEtaValue">—</strong><span id="veEtaSpeed">at selected speed</span></article>
        <article><small>ESTIMATED FUEL</small><strong id="veFuelValue">—</strong><span id="veFuelHint">from Vessel Profile if available</span></article>
        <article><small>ROUTE BASIS</small><strong id="veRouteBasisValue">—</strong><span id="vePassageValue">automatic estimate</span></article>
      </div>
      <article class="panel ve-details-panel">
        <div class="panel-head"><div><h2 id="veEstimateTitle">Estimate details</h2><small id="veEstimateSubtitle">Approximate voyage planning values.</small></div></div>
        <div class="panel-body"><dl id="veEstimateDetails" class="ve-estimate-details"></dl></div>
      </article>
    </section>

    <details class="panel ve-methodology">
      <summary><span><b>Estimator details</b><small>Sources, assumptions and limitations</small></span><strong>Show</strong></summary>
      <div class="panel-body ve-method-grid">
        <div><b>Distance</b><span>Estimated sea distance including endpoint connection allowance.</span></div>
        <div><b>Sea time</b><span>Distance divided by selected speed.</span></div>
        <div><b>Fuel</b><span>Uses saved daily fuel consumption when available.</span></div>
        <div><b>Locations</b><span>Ports plus Norwegian offshore fields and fixed facilities.</span></div>
        <div><b>Draft & passages</b><span>Supported canal limits and selected route preferences are applied to the estimate.</span></div>
      </div>
    </details>
  `;
  bind();init();
}
window.addEventListener('online',()=>{if($('#voyage-estimate')?.dataset.voyageEstimateRendered&&!state.ready)init()});
window.__marineToolsVoyageEstimate={render};
})();