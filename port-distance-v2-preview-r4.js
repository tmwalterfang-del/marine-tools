console.info('Marine Tools Port Distance preview R4 loaded — bundled sea network');
const LIB_VERSION='2.3.0';
const MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0?bundle&target=es2022';
const MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/+esm';
const PORTS_URL='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/dist/ports.json';
const PORTS_MODULE_PRIMARY='https://esm.sh/searoute-ts@2.3.0/ports?bundle&target=es2022';
const PORTS_MODULE_FALLBACK='https://cdn.jsdelivr.net/npm/searoute-ts@2.3.0/ports/+esm';

const $=s=>document.querySelector(s);
const state={engine:null,ports:[],byCode:new Map(),map:null,layers:[],routes:[],selected:0};

function fmt(n,d=0){return Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:d}):'—'}
function etaHours(route){const p=route&&route.properties||{},speed=Number($('#speedKnots').value)||12;return Number.isFinite(Number(p.durationHours))?Number(p.durationHours):(Number(p.length)||0)/speed}
function etaText(hours){if(!Number.isFinite(hours))return'—';let d=Math.floor(hours/24),h=Math.round(hours-d*24);if(h===24){d+=1;h=0}return d?d+' d '+h+' h':h+' h'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function titleCase(s){return String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}

async function loadModule(){
  try{return await import(MODULE_PRIMARY)}
  catch(e1){console.warn('Primary route module failed, trying fallback',e1);return await import(MODULE_FALLBACK)}
}
function normalizePorts(data){
  let raw=Array.isArray(data)?data:Object.entries(data||{}).map(function(entry){return Object.assign({code:entry[0]},entry[1]||{})});
  return raw.map(function(p){
    const code=String(p.code||p.locode||p.unlocode||p.id||'').toUpperCase();
    const coords=p.coordinates||p.coord||p.location||[p.lon!=null?p.lon:p.longitude,p.lat!=null?p.lat:p.latitude];
    const lon=Number(coords&&coords[0]),lat=Number(coords&&coords[1]);
    return{code:code,name:p.name||p.port||code,country:p.country||p.countryName||'',coordinates:[lon,lat]};
  }).filter(function(p){return p.code&&Number.isFinite(p.coordinates[0])&&Number.isFinite(p.coordinates[1])});
}
function portLabel(p){return p?(p.name+' · '+p.code+(p.country?' · '+p.country:'')):''}
function resolvePortInput(input){
  const q=String(input||'').trim().toLowerCase();if(!q)return null;
  if(state.byCode.has(q.toUpperCase()))return state.byCode.get(q.toUpperCase());
  return state.ports.find(p=>portLabel(p).toLowerCase()===q)
      ||state.ports.find(p=>p.name.toLowerCase()===q)
      ||state.ports.find(p=>p.name.toLowerCase().startsWith(q))
      ||state.ports.find(p=>p.code.toLowerCase().startsWith(q));
}
function setPort(inputEl,code){const p=state.byCode.get(code);if(p)inputEl.value=portLabel(p)}
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
  const p=loadProfile();
  if(p.speed)$('#speedKnots').value=p.speed;
  if(p.draft)$('#draftM').value=p.draft;
  if(showHint!==false)$('#speedHint').textContent=(p.speed||p.draft||p.fuelDay)?'Loaded available values from Vessel Profile.':'No saved Vessel Profile found in this browser.';
  return p;
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
async function initEngine(){
  const status=$('#engineStatus');let stage='routing library';
  try{
    status.textContent='Loading routing library…';
    const mod=await loadModule();
    if(typeof mod.seaRoute!=='function')throw new Error('Required routing export is unavailable');
    state.engine=mod;

    stage='port directory';
    status.textContent='Loading port directory…';
    const portData=await loadPortDirectory();
    state.ports=normalizePorts(portData).sort((a,b)=>a.name.localeCompare(b.name));
    if(!state.ports.length)throw new Error('Port directory returned no usable ports');
    state.byCode=new Map(state.ports.map(p=>[p.code,p]));

    const list=$('#portList');
    list.innerHTML=state.ports.slice(0,1800).map(p=>'<option value="'+esc(portLabel(p))+'"></option>').join('');
    status.className='engine-status ready';
    status.textContent='Ready · '+state.ports.length.toLocaleString()+' ports · bundled network '+LIB_VERSION;
    $('#calculateRoute').disabled=false;
    applyProfile(false);
    setPort($('#fromPort'),'NLRTM');setPort($('#toPort'),'SGSIN');
  }catch(err){
    console.error('Port Distance preview failed while loading '+stage,err);
    const detail=String(err&&err.message||err||'unknown error').slice(0,110);
    status.className='engine-status error';
    status.textContent='Failed: '+stage;
    status.title=detail;
    $('#calculateRoute').disabled=true;
    $('.warning span').textContent='Preview failed while loading '+stage+': '+detail;
  }
}
function routeOptions(mode){
  const speed=Number($('#speedKnots').value)||12,draft=Number($('#draftM').value);
  const base={units:'nauticalmiles',speedKnots:speed,returnPassages:true,antimeridian:'split'};
  if(Number.isFinite(draft)&&draft>0)base.vesselDraftMeters=draft;
  if(mode==='suez')base.via=['suez'];
  if(mode==='panama')base.via=['panama'];
  if(mode==='cape')base.restrictions=['suez','babelmandeb'];
  if(mode==='no-panama')base.restrictions=['panama'];
  return base;
}
function getCoords(route){
  const g=route&&route.geometry;if(!g)return[];
  if(g.type==='LineString')return[g.coordinates];
  if(g.type==='MultiLineString')return g.coordinates;
  return[];
}
function routeName(route,index){
  const p=route.properties||{},pass=p.passages||[];
  if(index===0)return pass.length?'Primary · via '+pass.map(titleCase).join(', '):'Primary route';
  return pass.length?'Alternative '+(index+1)+' · via '+pass.map(titleCase).join(', '):'Alternative '+(index+1);
}
function calculateFuel(hours){
  const prof=loadProfile();if(!prof.fuelDay||!Number.isFinite(hours))return null;
  return prof.fuelDay*(hours/24);
}
function setSummary(route){
  const p=route.properties||{},speed=Number($('#speedKnots').value)||12,hours=etaHours(route);
  $('#distanceValue').textContent=fmt(p.length,0)+' NM';
  $('#etaValue').textContent=etaText(hours);$('#etaSpeed').textContent='at '+fmt(speed,1)+' kn';
  $('#detourValue').textContent=Number.isFinite(Number(p.detourRatio))?fmt(p.detourRatio,2)+'×':'—';
  const fuel=calculateFuel(hours);$('#fuelValue').textContent=fuel!=null?fmt(fuel,1)+' m³':'—';
  $('#fuelHint').textContent=fuel!=null?'using saved fuel consumption / day':'save fuel/day in Vessel Profile to estimate';
  const passages=p.passages||[];
  $('#passageChips').innerHTML=passages.length?passages.map(x=>'<span>'+esc(titleCase(x))+'</span>').join(''):'<span>No labelled chokepoints</span>';
}
function renderDetails(route,from,to){
  const p=route.properties||{},rows=[
    ['Origin',portLabel(from)],['Destination',portLabel(to)],['Network distance',fmt(p.length,1)+' NM'],
    ['Great-circle distance',Number.isFinite(Number(p.greatCircleLength))?fmt(p.greatCircleLength,1)+' NM':'—'],
    ['Detour ratio',Number.isFinite(Number(p.detourRatio))?fmt(p.detourRatio,3)+'×':'—'],
    ['Origin snap',Number.isFinite(Number(p.originSnapKm))?fmt(p.originSnapKm,1)+' km':'—'],
    ['Destination snap',Number.isFinite(Number(p.destinationSnapKm))?fmt(p.destinationSnapKm,1)+' km':'—'],
    ['Passages',(p.passages||[]).map(titleCase).join(', ')||'None labelled'],['Draft used',$('#draftM').value?$('#draftM').value+' m':'Not set'],
    ['Network','Eurostat 2025 / searoute-ts '+LIB_VERSION]
  ];
  $('#routeDetails').innerHTML=rows.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('');
}
function initMap(){
  if(state.map)return;
  state.map=L.map('routeMap',{worldCopyJump:false,minZoom:2}).setView([20,10],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:12,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
}
function clearLayers(){state.layers.forEach(l=>state.map.removeLayer(l));state.layers=[]}
function renderMap(route,from,to){
  initMap();clearLayers();const segments=getCoords(route),bounds=[];
  segments.forEach(function(coords,idx){
    const latlngs=coords.map(c=>[c[1],c[0]]);
    const line=L.polyline(latlngs,{color:idx?'#62d7f2':'#28c4f4',weight:4,opacity:.9,className:'route-line'}).addTo(state.map);
    state.layers.push(line);latlngs.forEach(x=>bounds.push(x));
  });
  const om=L.circleMarker([from.coordinates[1],from.coordinates[0]],{radius:7,color:'#32d48a',weight:3,fillColor:'#061724',fillOpacity:1}).bindTooltip(from.name).addTo(state.map);
  const dm=L.circleMarker([to.coordinates[1],to.coordinates[0]],{radius:7,color:'#f2bf49',weight:3,fillColor:'#061724',fillOpacity:1}).bindTooltip(to.name).addTo(state.map);
  state.layers.push(om,dm);bounds.push([from.coordinates[1],from.coordinates[0]],[to.coordinates[1],to.coordinates[0]]);
  if(bounds.length)state.map.fitBounds(bounds,{padding:[30,30],maxZoom:6});
  setTimeout(()=>state.map.invalidateSize(),50);
}
function renderAlternatives(from,to){
  const host=$('#alternatives');
  host.innerHTML=state.routes.map(function(r,i){
    const p=r.properties||{},pass=(p.passages||[]).map(titleCase).join(', ')||'No labelled chokepoints';
    return'<div class="alt-card'+(i===state.selected?' active':'')+'" data-alt="'+i+'"><div><b>'+esc(routeName(r,i))+'</b><small>'+esc(pass)+' · '+esc(etaText(etaHours(r)))+'</small></div><strong>'+fmt(p.length,0)+' NM</strong></div>';
  }).join('');
  host.querySelectorAll('[data-alt]').forEach(function(el){el.addEventListener('click',function(){state.selected=Number(el.dataset.alt);selectRoute(from,to)})});
}
function selectRoute(from,to){
  const r=state.routes[state.selected];if(!r)return;
  setSummary(r);renderMap(r,from,to);renderDetails(r,from,to);
  $('#routeTitle').textContent=from.name+' → '+to.name;$('#routeSubtitle').textContent=routeName(r,state.selected);renderAlternatives(from,to);
}
async function calculate(){
  if(!state.engine)return;
  const from=resolvePortInput($('#fromPort').value),to=resolvePortInput($('#toPort').value);
  if(!from||!to){alert('Select valid ports from the list.');return}
  if(from.code===to.code){alert('Choose two different ports.');return}
  const btn=$('#calculateRoute'),old=btn.textContent;btn.disabled=true;btn.textContent='Calculating…';
  try{
    const mode=$('#routeMode').value,opts=routeOptions(mode),E=state.engine;
    let routes=[];
    if(mode==='alternatives')routes=E.seaRouteAlternatives(from.coordinates,to.coordinates,Object.assign({},opts,{k:4}));
    else routes=[E.seaRoute(from.coordinates,to.coordinates,opts)];
    routes=(routes||[]).filter(Boolean);if(!routes.length)throw new Error('No route returned');
    state.routes=routes;state.selected=0;$('#resultArea').hidden=false;selectRoute(from,to);$('#resultArea').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){console.error(err);alert('No route could be calculated with these settings. Try another route preference or remove draft restrictions.')}
  finally{btn.disabled=false;btn.textContent=old}
}
function clearRoute(){
  $('#fromPort').value='';$('#toPort').value='';state.routes=[];state.selected=0;$('#resultArea').hidden=true;if(state.map)clearLayers();
}
$('#calculateRoute').addEventListener('click',calculate);
$('#swapPorts').addEventListener('click',function(){const a=$('#fromPort').value;$('#fromPort').value=$('#toPort').value;$('#toPort').value=a});
$('#useProfile').addEventListener('click',function(){applyProfile(true)});
$('#clearRoute').addEventListener('click',clearRoute);
document.querySelectorAll('[data-route]').forEach(function(b){b.addEventListener('click',function(){
  const parts=b.dataset.route.split('|'),a=parts[0],z=parts[1];setPort($('#fromPort'),a);setPort($('#toPort'),z);
  const known={NLRTM:['Rotterdam','Netherlands',[4.4777,51.9244]],SGSIN:['Singapore','Singapore',[103.8198,1.2644]],CNSHA:['Shanghai','China',[121.4737,31.2304]],USNYC:['New York','United States',[-74.006,40.7128]],USLAX:['Los Angeles','United States',[-118.2437,34.0522]],JPTYO:['Tokyo','Japan',[139.6917,35.6895]],NOOSL:['Oslo','Norway',[10.7522,59.9139]],GBABD:['Aberdeen','United Kingdom',[-2.0943,57.1497]],AEFJR:['Fujairah','United Arab Emirates',[56.3265,25.1288]]};
  [[a,$('#fromPort')],[z,$('#toPort')]].forEach(function(pair){const code=pair[0],el=pair[1];if(!el.value&&known[code]){const x=known[code],p={code:code,name:x[0],country:x[1],coordinates:x[2]};state.byCode.set(code,p);el.value=portLabel(p)}});
})});
initEngine();