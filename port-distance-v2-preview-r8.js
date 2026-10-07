console.info('Marine Tools Port Distance preview R8 loaded — portrait + landscape mobile layouts');

const LIB_VERSION='2.3.0';
const MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0?bundle&target=es2022';
const MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/+esm';
const PORTS_URL='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/dist/ports.json';
const PORTS_MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0/ports?bundle&target=es2022';
const PORTS_MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/ports/+esm';
const FIELDS_URL='https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer/7100/query?where=1%3D1&outFields=fldName%2CfldCurrentActivitySatus%2CcmpLongName%2CfldMainSupplyBase%2CfldMainArea%2CfldNpdidField&returnGeometry=true&outSR=4326&geometryPrecision=4&f=geojson';
const FACILITIES_URL='https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/FeatureServer/304/query?where=fclSurface%3D%27Y%27&outFields=fclName%2CfclKind%2CfclPhase%2CfclFunctions%2CfclFixedOrMoveable%2CfclNpdidFacility&returnGeometry=true&outSR=4326&f=geojson';

const $=s=>document.querySelector(s);
const state={
  engine:null,ports:[],offshore:[],locations:[],byCode:new Map(),
  map:null,layers:[],routes:[],selected:0,
  counts:{ports:0,norwayPorts:0,fields:0,facilities:0}
};

function fmt(n,d=0){return Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:d}):'—'}
function etaHours(route){const p=route&&route.properties||{},speed=Number($('#speedKnots').value)||12;return Number.isFinite(Number(p.durationHours))?Number(p.durationHours):(Number(p.length)||0)/speed}
function etaText(hours){if(!Number.isFinite(hours))return'—';let d=Math.floor(hours/24),h=Math.round(hours-d*24);if(h===24){d++;h=0}return d?d+' d '+h+' h':h+' h'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function titleCase(s){return String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function typeName(x){return x.type==='field'?'Offshore field':x.type==='facility'?'Fixed facility':x.type==='custom'?'Custom position':'Port'}
function sourceName(x){return x.source|| (x.type==='port'?'UN/LOCODE':'User position')}

async function loadModule(){
  try{return await import(MODULE_PRIMARY)}
  catch(e1){console.warn('Primary route module failed, trying fallback',e1);return await import(MODULE_FALLBACK)}
}
async function loadPortDirectory(){
  try{
    const res=await fetch(PORTS_URL);
    if(!res.ok)throw new Error('Port data HTTP '+res.status);
    return await res.json();
  }catch(fetchErr){
    console.warn('ports.json fetch failed, trying module fallback',fetchErr);
    try{
      const pm=await import(PORTS_MODULE_PRIMARY);
      return pm.PORTS||pm.default||{};
    }catch(e1){
      console.warn('Primary ports module fallback failed',e1);
      const pm=await import(PORTS_MODULE_FALLBACK);
      return pm.PORTS||pm.default||{};
    }
  }
}
function normalizePorts(data){
  const raw=Array.isArray(data)?data:Object.entries(data||{}).map(entry=>Object.assign({code:entry[0]},entry[1]||{}));
  return raw.map(p=>{
    const code=String(p.code||p.locode||p.unlocode||p.id||'').toUpperCase();
    const coords=p.coordinates||p.coord||p.location||[p.lon!=null?p.lon:p.longitude,p.lat!=null?p.lat:p.latitude];
    const lon=Number(coords&&coords[0]),lat=Number(coords&&coords[1]);
    return{
      type:'port',code,name:p.name||p.port||code,country:p.country||p.countryName||'',
      coordinates:[lon,lat],source:'UN/LOCODE-derived port directory'
    };
  }).filter(p=>p.code&&Number.isFinite(p.coordinates[0])&&Number.isFinite(p.coordinates[1]));
}
function collectPairs(node,out){
  if(!Array.isArray(node))return;
  if(node.length>=2&&Number.isFinite(Number(node[0]))&&Number.isFinite(Number(node[1]))){out.push([Number(node[0]),Number(node[1])]);return}
  node.forEach(x=>collectPairs(x,out));
}
function geometryCenter(geometry){
  const pts=[];collectPairs(geometry&&geometry.coordinates,pts);
  if(!pts.length)return null;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  pts.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1])});
  return[(minX+maxX)/2,(minY+maxY)/2];
}
function normalizeFields(geo){
  return (geo&&geo.features||[]).map(f=>{
    const p=f.properties||{},c=geometryCenter(f.geometry);if(!c)return null;
    const name=String(p.fldName||'').trim();if(!name)return null;
    return{
      type:'field',code:'FIELD:'+String(p.fldNpdidField||name),name,country:'Norwegian Continental Shelf',
      coordinates:c,source:'Norwegian Offshore Directorate',geometry:f.geometry,
      meta:{status:p.fldCurrentActivitySatus||'',operator:p.cmpLongName||'',supplyBase:p.fldMainSupplyBase||'',area:p.fldMainArea||''}
    };
  }).filter(Boolean);
}
function normalizeFacilities(geo){
  return (geo&&geo.features||[]).map(f=>{
    const p=f.properties||{},coords=f.geometry&&f.geometry.coordinates;
    if(!Array.isArray(coords)||!Number.isFinite(Number(coords[0]))||!Number.isFinite(Number(coords[1])))return null;
    const fixed=String(p.fclFixedOrMoveable||'').toUpperCase();
    if(fixed&&fixed!=='FIXED')return null;
    const name=String(p.fclName||'').trim();if(!name)return null;
    return{
      type:'facility',code:'FAC:'+String(p.fclNpdidFacility||name),name,country:'Norwegian Continental Shelf',
      coordinates:[Number(coords[0]),Number(coords[1])],source:'Norwegian Offshore Directorate',
      meta:{kind:p.fclKind||'',phase:p.fclPhase||'',functions:p.fclFunctions||'',fixedOrMoveable:p.fclFixedOrMoveable||''}
    };
  }).filter(Boolean);
}
function locationLabel(x){
  if(!x)return'';
  if(x.type==='port')return'⚓ PORT · '+x.name+' · '+x.code+(x.country?' · '+x.country:'');
  if(x.type==='field')return'◇ FIELD · '+x.name+(x.meta&&x.meta.area?' · '+x.meta.area:'');
  if(x.type==='facility')return'▣ FACILITY · '+x.name+(x.meta&&x.meta.kind?' · '+x.meta.kind:'');
  return'⊕ POSITION · '+fmt(x.coordinates[1],4)+', '+fmt(x.coordinates[0],4);
}
function rebuildLocationIndex(){
  state.locations=[...state.ports,...state.offshore];
  state.byCode=new Map(state.locations.map(x=>[String(x.code||'').toUpperCase(),x]));
  const noPorts=state.ports.filter(p=>p.code.startsWith('NO')||/norway|norge/i.test(p.country));
  const offshore=state.offshore;
  const world=state.ports.filter(p=>!noPorts.includes(p)).slice(0,2600);
  const options=[...offshore,...noPorts,...world];
  $('#portList').innerHTML=options.map(x=>'<option value="'+esc(locationLabel(x))+'"></option>').join('');
  state.counts.ports=state.ports.length;state.counts.norwayPorts=noPorts.length;
}
function updateCatalogStatus(partial){
  const el=$('#catalogStatus'),text=$('#catalogText');
  const c=state.counts;
  text.textContent=c.ports.toLocaleString()+' ports ('+c.norwayPorts.toLocaleString()+' Norway) · '+c.fields.toLocaleString()+' fields · '+c.facilities.toLocaleString()+' fixed facilities';
  el.classList.remove('ready','partial');el.classList.add(partial?'partial':'ready');
}
async function fetchJson(url){
  const r=await fetch(url,{mode:'cors',credentials:'omit'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  return await r.json();
}
async function loadOffshoreCatalog(){
  const results=await Promise.allSettled([fetchJson(FIELDS_URL),fetchJson(FACILITIES_URL)]);
  let fields=[],facilities=[],partial=false;
  if(results[0].status==='fulfilled')fields=normalizeFields(results[0].value);else{partial=true;console.warn('Field catalogue unavailable',results[0].reason)}
  if(results[1].status==='fulfilled')facilities=normalizeFacilities(results[1].value);else{partial=true;console.warn('Facility catalogue unavailable',results[1].reason)}
  state.offshore=[...fields,...facilities];
  state.counts.fields=fields.length;state.counts.facilities=facilities.length;
  rebuildLocationIndex();updateCatalogStatus(partial);
  return{fields,facilities,partial};
}
function parseCustomPosition(s){
  const m=String(s||'').trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);
  if(!m)return null;
  const lat=Number(m[1]),lon=Number(m[2]);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
  return{type:'custom',code:'CUSTOM:'+lat+','+lon,name:'Custom position',country:'',coordinates:[lon,lat],source:'User-entered coordinates',meta:{}};
}
function resolveLocationInput(input){
  const custom=parseCustomPosition(input);if(custom)return custom;
  const q=String(input||'').trim().toLowerCase();if(!q)return null;
  if(state.byCode.has(q.toUpperCase()))return state.byCode.get(q.toUpperCase());
  return state.locations.find(x=>locationLabel(x).toLowerCase()===q)
    ||state.locations.find(x=>x.name.toLowerCase()===q)
    ||state.locations.find(x=>x.name.toLowerCase().startsWith(q))
    ||state.locations.find(x=>String(x.code||'').toLowerCase().startsWith(q));
}
function setLocation(inputEl,x){if(x)inputEl.value=locationLabel(x)}
function setPort(inputEl,code){setLocation(inputEl,state.byCode.get(code))}
function findNamed(type,name){
  const q=String(name).toLowerCase();
  return state.locations.find(x=>x.type===type&&x.name.toLowerCase()===q)
    ||state.locations.find(x=>x.type===type&&x.name.toLowerCase().includes(q));
}

function loadProfile(){
  try{
    const legacy=JSON.parse(localStorage.getItem('mt.profile')||'null');
    const v2=JSON.parse(localStorage.getItem('mt.profile.v2')||'null');
    const speed=Number(legacy&&legacy.serviceSpeed!=null?legacy.serviceSpeed:v2&&v2.vessel&&v2.vessel.serviceSpeed);
    const draft=Number(legacy&&legacy.draft!=null?legacy.draft:v2&&v2.vessel&&v2.vessel.draft);
    const fuel=Number(legacy&&legacy.fuelDay!=null?legacy.fuelDay:v2&&v2.operational&&v2.operational.fuelDay);
    return{speed:Number.isFinite(speed)?speed:null,draft:Number.isFinite(draft)?draft:null,fuelDay:Number.isFinite(fuel)?fuel:null};
  }catch(e){return{speed:null,draft:null,fuelDay:null}}
}
function applyProfile(showHint){
  const p=loadProfile();if(p.speed)$('#speedKnots').value=p.speed;if(p.draft)$('#draftM').value=p.draft;
  if(showHint!==false)$('#speedHint').textContent=(p.speed||p.draft||p.fuelDay)?'Loaded available values from Vessel Profile.':'No saved Vessel Profile found in this browser.';
  return p;
}
async function initEngine(){
  const status=$('#engineStatus');let stage='routing library';
  try{
    status.textContent='Loading routing library…';
    const mod=await loadModule();
    if(typeof mod.seaRoute!=='function')throw new Error('Required routing export is unavailable');
    state.engine=mod;

    stage='port directory';status.textContent='Loading port directory…';
    state.ports=normalizePorts(await loadPortDirectory()).sort((a,b)=>a.name.localeCompare(b.name));
    if(!state.ports.length)throw new Error('Port directory returned no usable ports');
    rebuildLocationIndex();updateCatalogStatus(true);

    status.className='engine-status ready';
    status.textContent='Ready · bundled sea network '+LIB_VERSION;
    $('#calculateRoute').disabled=false;applyProfile(false);
    setPort($('#fromPort'),'NLRTM');setPort($('#toPort'),'SGSIN');

    loadOffshoreCatalog().catch(err=>{console.warn('Offshore catalogue load failed',err);updateCatalogStatus(true)});
  }catch(err){
    console.error('Port Distance preview failed while loading '+stage,err);
    const detail=String(err&&err.message||err||'unknown error').slice(0,110);
    status.className='engine-status error';status.textContent='Failed: '+stage;status.title=detail;
    $('#calculateRoute').disabled=true;$('.warning span').textContent='Preview failed while loading '+stage+': '+detail;
  }
}

function routeOptions(mode){
  const speed=Number($('#speedKnots').value)||12,draft=Number($('#draftM').value);
  const base={units:'nauticalmiles',speedKnots:speed,returnPassages:true,antimeridian:'split'};
  if(Number.isFinite(draft)&&draft>0)base.vesselDraftMeters=draft;
  if(mode==='suez')base.via=['suez'];if(mode==='panama')base.via=['panama'];
  if(mode==='cape')base.restrictions=['suez','babelmandeb'];if(mode==='no-panama')base.restrictions=['panama'];
  return base;
}
function getCoords(route){const g=route&&route.geometry;if(!g)return[];if(g.type==='LineString')return[g.coordinates];if(g.type==='MultiLineString')return g.coordinates;return[]}
function routeName(route,index){
  const p=route.properties||{},pass=p.passages||[];
  if(index===0)return pass.length?'Primary · via '+pass.map(titleCase).join(', '):'Primary route';
  return pass.length?'Alternative '+(index+1)+' · via '+pass.map(titleCase).join(', '):'Alternative '+(index+1);
}
function calculateFuel(hours){const p=loadProfile();return p.fuelDay&&Number.isFinite(hours)?p.fuelDay*(hours/24):null}
function setSummary(route){
  const p=route.properties||{},speed=Number($('#speedKnots').value)||12,hours=etaHours(route);
  $('#distanceValue').textContent=fmt(p.length,0)+' NM';$('#etaValue').textContent=etaText(hours);$('#etaSpeed').textContent='at '+fmt(speed,1)+' kn';
  $('#detourValue').textContent=Number.isFinite(Number(p.detourRatio))?fmt(p.detourRatio,2)+'×':'—';
  const fuel=calculateFuel(hours);$('#fuelValue').textContent=fuel!=null?fmt(fuel,1)+' m³':'—';
  $('#fuelHint').textContent=fuel!=null?'using saved fuel consumption / day':'save fuel/day in Vessel Profile to estimate';
  const passages=p.passages||[];$('#passageChips').innerHTML=passages.length?passages.map(x=>'<span>'+esc(titleCase(x))+'</span>').join(''):'<span>No labelled chokepoints</span>';
}
function locationDetail(x){
  if(x.type==='field'){
    const m=x.meta||{};return [m.status?'Status: '+m.status:'',m.operator?'Operator: '+m.operator:'',m.supplyBase?'Supply base: '+m.supplyBase:'',m.area?'Area: '+m.area:''].filter(Boolean).join(' · ');
  }
  if(x.type==='facility'){
    const m=x.meta||{};return [m.kind?'Kind: '+m.kind:'',m.phase?'Phase: '+m.phase:'',m.functions?'Functions: '+m.functions:''].filter(Boolean).join(' · ');
  }
  return'';
}
function renderDetails(route,from,to){
  const p=route.properties||{},rows=[
    ['Origin',from.name],['Origin type',typeName(from)],['Origin source',sourceName(from)],
    ['Destination',to.name],['Destination type',typeName(to)],['Destination source',sourceName(to)],
    ['Network distance',fmt(p.length,1)+' NM'],
    ['Great-circle distance',Number.isFinite(Number(p.greatCircleLength))?fmt(p.greatCircleLength,1)+' NM':'—'],
    ['Detour ratio',Number.isFinite(Number(p.detourRatio))?fmt(p.detourRatio,3)+'×':'—'],
    ['Origin snap',Number.isFinite(Number(p.originSnapKm))?fmt(p.originSnapKm,1)+' km':'—'],
    ['Destination snap',Number.isFinite(Number(p.destinationSnapKm))?fmt(p.destinationSnapKm,1)+' km':'—'],
    ['Passages',(p.passages||[]).map(titleCase).join(', ')||'None labelled'],
    ['Draft used',$('#draftM').value?$('#draftM').value+' m':'Not set'],
    ['Network','Eurostat 2025 / searoute-ts '+LIB_VERSION]
  ];
  const fm=locationDetail(from),tm=locationDetail(to);if(fm)rows.splice(3,0,['Origin metadata',fm]);if(tm)rows.splice(7,0,['Destination metadata',tm]);
  $('#routeDetails').innerHTML=rows.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('');
}
function initMap(){
  if(state.map)return;
  state.map=L.map('routeMap',{worldCopyJump:false,minZoom:2}).setView([20,10],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:12,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
}
function clearLayers(){state.layers.forEach(l=>state.map.removeLayer(l));state.layers=[]}
function addFieldGeometry(x){
  if(x&&x.type==='field'&&x.geometry){
    const layer=L.geoJSON({type:'Feature',geometry:x.geometry,properties:{}},{style:{color:'#f2bf49',weight:2,opacity:.75,fillOpacity:.08}});
    layer.addTo(state.map);state.layers.push(layer);
  }
}
function renderMap(route,from,to){
  initMap();clearLayers();const segments=getCoords(route),bounds=[];
  addFieldGeometry(from);addFieldGeometry(to);
  segments.forEach((coords,idx)=>{
    const latlngs=coords.map(c=>[c[1],c[0]]);
    const line=L.polyline(latlngs,{color:idx?'#62d7f2':'#28c4f4',weight:4,opacity:.9,className:'route-line'}).addTo(state.map);
    state.layers.push(line);latlngs.forEach(x=>bounds.push(x));
  });
  const om=L.circleMarker([from.coordinates[1],from.coordinates[0]],{radius:7,color:'#32d48a',weight:3,fillColor:'#061724',fillOpacity:1}).bindTooltip(from.name+' · '+typeName(from)).addTo(state.map);
  const dm=L.circleMarker([to.coordinates[1],to.coordinates[0]],{radius:7,color:'#f2bf49',weight:3,fillColor:'#061724',fillOpacity:1}).bindTooltip(to.name+' · '+typeName(to)).addTo(state.map);
  state.layers.push(om,dm);bounds.push([from.coordinates[1],from.coordinates[0]],[to.coordinates[1],to.coordinates[0]]);
  if(bounds.length)state.map.fitBounds(bounds,{padding:[30,30],maxZoom:7});setTimeout(()=>state.map.invalidateSize(),50);
}
function renderAlternatives(from,to){
  const host=$('#alternatives');
  host.innerHTML=state.routes.map((r,i)=>{
    const p=r.properties||{},pass=(p.passages||[]).map(titleCase).join(', ')||'No labelled chokepoints';
    return'<div class="alt-card'+(i===state.selected?' active':'')+'" data-alt="'+i+'"><div><b>'+esc(routeName(r,i))+'</b><small>'+esc(pass)+' · '+esc(etaText(etaHours(r)))+'</small></div><strong>'+fmt(p.length,0)+' NM</strong></div>';
  }).join('');
  host.querySelectorAll('[data-alt]').forEach(el=>el.addEventListener('click',()=>{state.selected=Number(el.dataset.alt);selectRoute(from,to)}));
}
function selectRoute(from,to){
  const r=state.routes[state.selected];if(!r)return;
  setSummary(r);renderMap(r,from,to);renderDetails(r,from,to);
  $('#routeTitle').textContent=from.name+' → '+to.name;
  $('#routeSubtitle').textContent=typeName(from)+' → '+typeName(to)+' · '+routeName(r,state.selected);
  renderAlternatives(from,to);
}
async function calculate(){
  if(!state.engine)return;
  const from=resolveLocationInput($('#fromPort').value),to=resolveLocationInput($('#toPort').value);
  if(!from||!to){alert('Select valid locations from the list, or enter latitude,longitude.');return}
  if(from.code===to.code){alert('Choose two different locations.');return}
  const btn=$('#calculateRoute'),old=btn.textContent;btn.disabled=true;btn.textContent='Calculating…';
  try{
    const mode=$('#routeMode').value,opts=routeOptions(mode),E=state.engine;
    let routes=mode==='alternatives'?E.seaRouteAlternatives(from.coordinates,to.coordinates,Object.assign({},opts,{k:4})):[E.seaRoute(from.coordinates,to.coordinates,opts)];
    routes=(routes||[]).filter(Boolean);if(!routes.length)throw new Error('No route returned');
    state.routes=routes;state.selected=0;$('#resultArea').hidden=false;selectRoute(from,to);$('#resultArea').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    console.error(err);
    alert('No route could be calculated with these settings. Offshore and custom positions are snapped to the macro sea network; try another route preference or remove draft restrictions.');
  }finally{btn.disabled=false;btn.textContent=old}
}
function clearRoute(){
  $('#fromPort').value='';$('#toPort').value='';state.routes=[];state.selected=0;$('#resultArea').hidden=true;if(state.map)clearLayers();
}

$('#calculateRoute').addEventListener('click',calculate);
$('#swapPorts').addEventListener('click',()=>{const a=$('#fromPort').value;$('#fromPort').value=$('#toPort').value;$('#toPort').value=a});
$('#useProfile').addEventListener('click',()=>applyProfile(true));
$('#clearRoute').addEventListener('click',clearRoute);

document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{
  const parts=b.dataset.route.split('|');setPort($('#fromPort'),parts[0]);setPort($('#toPort'),parts[1]);
}));
document.querySelectorAll('[data-mixed-from]').forEach(b=>b.addEventListener('click',()=>{
  const from=state.byCode.get(String(b.dataset.mixedFrom||'').toUpperCase());
  const to=findNamed(b.dataset.mixedType,b.dataset.mixedName);
  if(!from){alert('The selected departure port is not available in the port catalogue.');return}
  if(!to){alert('The Norwegian offshore catalogue is still loading or this location was not returned. Try again in a moment.');return}
  setLocation($('#fromPort'),from);setLocation($('#toPort'),to);
}));

initEngine();