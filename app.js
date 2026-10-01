
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const num = id => parseFloat($(id)?.value);
const fmt = (v,d=2) => Number.isFinite(v) ? v.toFixed(d) : "—";
const toRad = d => d*Math.PI/180, toDeg = r => r*180/Math.PI;
const EARTH_NM = 3440.065;
const KEYS = {
  vessel:"mops_vessel", routes:"mops_routes", voyages:"mops_voyages",
  settings:"mops_settings", theme:"mops_theme", checklist:"mops_bunker_checklist", vessels:"mops_vessels"
};
const store = {
  get(k,fallback){ try { const v=localStorage.getItem(k); return v?JSON.parse(v):fallback; } catch { return fallback; } },
  set(k,v){ localStorage.setItem(k,JSON.stringify(v)); },
  del(k){ localStorage.removeItem(k); }
};
const state = {
  vessel: store.get(KEYS.vessel, {}),
  vessels: store.get(KEYS.vessels, []),
  routes: store.get(KEYS.routes, []),
  voyages: store.get(KEYS.voyages, []),
  settings: store.get(KEYS.settings, {proxy:"https://api.marinetools.app",units:"nautical",language:"en"}),
  route:{name:"New passage",speed:9,departure:"",waypoints:[],nogos:[]},
  currentVoyageId:null, map:null, line:null, markers:[], nogoLayers:[], seamark:null, baseLayer:null,
  installPrompt:null, shortcutPrefix:false
};

// ---------- navigation / shell ----------
function showPage(id){
  $$(".page").forEach(p=>p.classList.remove("active"));
  $$(".nav").forEach(n=>n.classList.remove("active"));
  $(id)?.classList.add("active");
  document.querySelector(`.nav[data-page="${id}"]`)?.classList.add("active");
  document.querySelector(".sidebar")?.classList.remove("open");
  if(id==="passage" && state.map) setTimeout(()=>state.map.invalidateSize(),80);
  if(id==="voyages") renderVoyages();
  if(id==="vessel") fillVesselForm();
  if(id==="compare") refreshRouteSelectors();
  if(id==="bunkering") ensureBunkerRows();
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$("mobileMenu")?.addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));

function applyTheme(theme){
  document.documentElement.classList.remove("dark","bridge");
  if(theme==="dark") document.documentElement.classList.add("dark");
  if(theme==="bridge") document.documentElement.classList.add("bridge");
  localStorage.setItem(KEYS.theme,theme);
  if($("themeSelect")) $("themeSelect").value=theme;
}
const savedTheme = localStorage.getItem(KEYS.theme) || "light";
applyTheme(savedTheme);
$("themeBtn")?.addEventListener("click",()=>{
  const cur=document.documentElement.classList.contains("bridge")?"bridge":document.documentElement.classList.contains("dark")?"dark":"light";
  applyTheme(cur==="light"?"dark":cur==="dark"?"bridge":"light");
});
$("themeSelect")?.addEventListener("change",e=>applyTheme(e.target.value));

function isoLocalNow(){
  const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16);
}
state.route.departure=isoLocalNow();
$("routeDeparture").value=state.route.departure;
$("oDate").value=new Date().toISOString().slice(0,10);
$("voyDeparture").value=isoLocalNow();

// ---------- search ----------
const SEARCH_ITEMS = [
 ["Command","dashboard"],["Voyages","voyages"],["Passage Planner","passage"],["Route Intelligence","intelligence"],
 ["Route Compare","compare"],["CPA / TCPA","cpa"],["Under-keel Clearance","ukc"],["Navigation Warnings","warnings"],
 ["Vessel Profile","vessel"],["Bunkering & ORB","bunkering"],["Engineering Toolkit","engineering"],["Quick Tools","quick"],["Settings","settings"]
];
function renderSearch(){
  const q=$("globalSearch").value.trim().toLowerCase(), box=$("searchDrop");
  if(!q){ box.hidden=true; box.innerHTML=""; return; }
  const matches=SEARCH_ITEMS.filter(([n])=>n.toLowerCase().includes(q)).slice(0,8);
  box.innerHTML=matches.length?matches.map(([n,id])=>`<button data-search="${id}"><span>${n}</span><small>Open</small></button>`).join(""):`<div class="source-status">No matching tools.</div>`;
  box.hidden=false;
  $$("[data-search]").forEach(b=>b.addEventListener("click",()=>{showPage(b.dataset.search);$("globalSearch").value="";box.hidden=true;}));
}
$("globalSearch").addEventListener("input",renderSearch);
$("globalSearch").addEventListener("keydown",e=>{if(e.key==="Escape"){$("globalSearch").value="";$("searchDrop").hidden=true;}});
document.addEventListener("click",e=>{if(!e.target.closest(".search"))$("searchDrop").hidden=true;});

// ---------- geometry ----------
function havNm(a,b){
  const p1=toRad(a.lat),p2=toRad(b.lat),dp=toRad(b.lat-a.lat),dl=toRad(b.lon-a.lon);
  const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*EARTH_NM*Math.asin(Math.sqrt(h));
}
function bearing(a,b){
  const p1=toRad(a.lat),p2=toRad(b.lat),dl=toRad(b.lon-a.lon);
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function localXY(lat,lon,lat0,lon0){
  return {x:(lon-lon0)*60*Math.cos(toRad((lat+lat0)/2)),y:(lat-lat0)*60};
}
function pointSegNm(p,a,b){
  const lat0=(a.lat+b.lat+p.lat)/3, A=localXY(a.lat,a.lon,lat0,0),B=localXY(b.lat,b.lon,lat0,0),P=localXY(p.lat,p.lon,lat0,0);
  const vx=B.x-A.x,vy=B.y-A.y,wx=P.x-A.x,wy=P.y-A.y,c2=vx*vx+vy*vy;
  const t=c2?Math.max(0,Math.min(1,(wx*vx+wy*vy)/c2)):0;
  return Math.hypot(P.x-(A.x+t*vx),P.y-(A.y+t*vy));
}
function routePointDistance(p,route=state.route.waypoints){
  if(route.length<2) return Infinity;
  let best=Infinity; for(let i=1;i<route.length;i++) best=Math.min(best,pointSegNm(p,route[i-1],route[i])); return best;
}
function routeMetrics(route=state.route){
  let distance=0,hours=0; const legs=[];
  for(let i=1;i<route.waypoints.length;i++){
    const a=route.waypoints[i-1],b=route.waypoints[i],d=havNm(a,b),c=bearing(a,b);
    const s=parseFloat(a.speed)||parseFloat(route.speed)||9;
    const h=s>0?d/s:0;
    distance+=d;hours+=h;legs.push({distance:d,course:c,hours:h,speed:s});
  }
  return {distance,hours,legs};
}
function duration(h){if(!Number.isFinite(h))return"—";const hh=Math.floor(h),mm=Math.round((h-hh)*60);return`${hh} h ${mm} min`}
function dateFmt(d){return d instanceof Date&&!isNaN(d)?d.toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"—"}
function uuid(){return crypto?.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2)}

// ---------- map / passage ----------
function initMap(){
  if(!window.L){$("map").innerHTML='<div class="source-status">Map library unavailable.</div>';return;}
  state.map=L.map("map").setView([59.15,10.35],7);
  setBaseMap("osm");
  state.seamark=L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",{maxZoom:18,attribution:"OpenSeaMap"}).addTo(state.map);
  state.map.on("click",e=>{
    state.route.waypoints.push({name:`WP${state.route.waypoints.length+1}`,lat:e.latlng.lat,lon:e.latlng.lng,speed:+$("routeSpeed").value||9,notes:""});
    updateRouteUI(true);
  });
}
function setBaseMap(kind){
  if(!state.map)return;
  if(state.baseLayer)state.baseLayer.remove();
  const url=kind==="dark"?"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const att=kind==="dark"?"© OpenStreetMap © CARTO":"© OpenStreetMap contributors";
  state.baseLayer=L.tileLayer(url,{maxZoom:19,attribution:att}).addTo(state.map);
  state.baseLayer.bringToBack();
}
$("mapBase").addEventListener("change",e=>setBaseMap(e.target.value));
$("seamarks").addEventListener("change",e=>{if(!state.map||!state.seamark)return;e.target.checked?state.seamark.addTo(state.map):state.seamark.remove();});
function redrawMap(fit=false){
  if(!state.map)return;
  state.markers.forEach(x=>x.remove()); state.markers=[];
  if(state.line)state.line.remove();
  state.nogoLayers.forEach(x=>x.remove());state.nogoLayers=[];
  state.route.waypoints.forEach((p,i)=>{
    const m=L.marker([p.lat,p.lon],{draggable:true}).addTo(state.map).bindTooltip(`${i+1}. ${p.name||"WP"}`);
    m.on("dragend",e=>{const ll=e.target.getLatLng();p.lat=ll.lat;p.lon=ll.lng;updateRouteUI();});
    state.markers.push(m);
  });
  if(state.route.waypoints.length>1){
    state.line=L.polyline(state.route.waypoints.map(p=>[p.lat,p.lon]),{color:"#25aaf0",weight:4}).addTo(state.map);
    if(fit)state.map.fitBounds(state.line.getBounds(),{padding:[30,30]});
  }
  state.route.nogos.forEach(n=>{
    const c=L.circle([n.lat,n.lon],{radius:n.radius*1852,color:"#d95359",fillColor:"#d95359",fillOpacity:.13,weight:2}).addTo(state.map).bindTooltip(n.name||"No-go area");
    state.nogoLayers.push(c);
  });
}
function updateRouteUI(fit=false){
  state.route.name=$("routeName").value||"New passage";state.route.speed=+$("routeSpeed").value||9;state.route.departure=$("routeDeparture").value;
  const m=routeMetrics(),dep=new Date(state.route.departure);
  $("routeDistance").textContent=`${fmt(m.distance,1)} NM`;
  $("routeTime").textContent=duration(m.hours);
  $("routeEta").textContent=!isNaN(dep)?dateFmt(new Date(dep.getTime()+m.hours*3600000)):"—";
  $("routeCount").textContent=state.route.waypoints.length;
  const tb=$("waypointRows");tb.innerHTML="";let cumH=0;
  state.route.waypoints.forEach((p,i)=>{
    let leg="—",cog="—",eta="—";if(i>0){const l=m.legs[i-1];leg=fmt(l.distance,1);cog=`${fmt(l.course,0)}°`;cumH+=l.hours;}
    if(!isNaN(dep))eta=dateFmt(new Date(dep.getTime()+cumH*3600000));
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${i+1}</td>
      <td><input data-wp="${i}" data-key="name" value="${escAttr(p.name||"")}"></td>
      <td><input data-wp="${i}" data-key="lat" type="number" step=".000001" value="${p.lat.toFixed(6)}"></td>
      <td><input data-wp="${i}" data-key="lon" type="number" step=".000001" value="${p.lon.toFixed(6)}"></td>
      <td>${cog}</td><td>${leg}</td>
      <td><input data-wp="${i}" data-key="speed" type="number" step=".1" value="${p.speed||state.route.speed}"></td>
      <td>${eta}</td>
      <td><input data-wp="${i}" data-key="notes" value="${escAttr(p.notes||"")}"></td>
      <td><button class="danger-soft small" data-delwp="${i}">×</button></td>`;
    tb.appendChild(tr);
  });
  $$("[data-wp]").forEach(inp=>inp.addEventListener("change",()=>{
    const i=+inp.dataset.wp,k=inp.dataset.key;state.route.waypoints[i][k]=["lat","lon","speed"].includes(k)?+inp.value:inp.value;updateRouteUI();
  }));
  $$("[data-delwp]").forEach(b=>b.addEventListener("click",()=>{state.route.waypoints.splice(+b.dataset.delwp,1);updateRouteUI();}));
  redrawMap(fit);renderNogo();updateDashboard();
}
["routeName","routeSpeed","routeDeparture"].forEach(id=>$(id).addEventListener("change",()=>updateRouteUI()));
$("clearRoute").addEventListener("click",()=>{if(confirm("Clear the current route?")){state.route.waypoints=[];state.route.nogos=[];updateRouteUI();}});
$("fullscreenMap").addEventListener("click",()=>{$("map").requestFullscreen?.();});
$("addNogo").addEventListener("click",()=>{
  const n={id:uuid(),name:$("nogoName").value||"Caution area",lat:num("nogoLat"),lon:num("nogoLon"),radius:num("nogoRadius")||1};
  if(!Number.isFinite(n.lat)||!Number.isFinite(n.lon))return alert("Enter latitude and longitude.");
  state.route.nogos.push(n);redrawMap();renderNogo();
});
function renderNogo(){
  $("nogoList").innerHTML=state.route.nogos.map(n=>`<span class="tag">${esc(n.name)} · ${fmt(n.radius,1)} NM <button data-delnogo="${n.id}">×</button></span>`).join("");
  $$("[data-delnogo]").forEach(b=>b.addEventListener("click",()=>{state.route.nogos=state.route.nogos.filter(n=>n.id!==b.dataset.delnogo);redrawMap();renderNogo();}));
}
$("saveRoute").addEventListener("click",()=>{
  updateRouteUI(); if(state.route.waypoints.length<2)return alert("Add at least two waypoints.");
  const copy=JSON.parse(JSON.stringify(state.route));copy.id=state.route.id||uuid();copy.updated=new Date().toISOString();state.route.id=copy.id;
  const idx=state.routes.findIndex(r=>r.id===copy.id);idx>=0?state.routes.splice(idx,1,copy):state.routes.unshift(copy);store.set(KEYS.routes,state.routes);refreshRouteSelectors();alert("Route saved locally.");
});
$("loadSavedRoute").addEventListener("click",()=>{
  const r=state.routes.find(x=>x.id===$("savedRouteSelect").value); if(!r)return;
  state.route=JSON.parse(JSON.stringify(r)); $("routeName").value=state.route.name||"Route"; $("routeSpeed").value=state.route.speed||9; $("routeDeparture").value=state.route.departure||isoLocalNow(); updateRouteUI(true);
});
function download(name,text,type="application/octet-stream"){
  const a=document.createElement("a"),blob=new Blob([text],{type});a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
$("exportGPX").addEventListener("click",()=>{
  const pts=state.route.waypoints.map(p=>`<rtept lat="${p.lat}" lon="${p.lon}"><name>${xml(p.name)}</name><desc>${xml(p.notes||"")}</desc></rtept>`).join("");
  download((slug(state.route.name)||"route")+".gpx",`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="MOPS" xmlns="http://www.topografix.com/GPX/1/1"><rte><name>${xml(state.route.name)}</name>${pts}</rte></gpx>`,"application/gpx+xml");
});
$("exportRTZ").addEventListener("click",()=>{
  const pts=state.route.waypoints.map((p,i)=>`<waypoint id="${i+1}" revision="0"><position lat="${p.lat}" lon="${p.lon}"/><name>${xml(p.name)}</name></waypoint>`).join("");
  download((slug(state.route.name)||"route")+".rtz",`<?xml version="1.0" encoding="UTF-8"?><route xmlns="http://www.cirm.org/RTZ/1/0" version="1.0"><routeInfo routeName="${xmlAttr(state.route.name)}"/><waypoints>${pts}</waypoints></route>`,"application/xml");
});
$("importGPX").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{
  const doc=new DOMParser().parseFromString(await f.text(),"application/xml");
  const pts=[...doc.querySelectorAll("rtept, trkpt")].map((n,i)=>({name:n.querySelector("name")?.textContent||`WP${i+1}`,lat:+n.getAttribute("lat"),lon:+n.getAttribute("lon"),speed:+$("routeSpeed").value||9,notes:n.querySelector("desc")?.textContent||""})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
  if(pts.length<2)throw new Error("No route points found");state.route.waypoints=pts;updateRouteUI(true);
}catch(err){alert("Could not import GPX: "+err.message)}});
$("importRTZ").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{
  const doc=new DOMParser().parseFromString(await f.text(),"application/xml");
  const pts=[...doc.querySelectorAll("waypoint")].map((w,i)=>{const p=w.querySelector("position");return{name:w.querySelector("name")?.textContent||`WP${i+1}`,lat:+p?.getAttribute("lat"),lon:+p?.getAttribute("lon"),speed:+$("routeSpeed").value||9,notes:""}}).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
  if(pts.length<2)throw new Error("No RTZ waypoints found");state.route.name=doc.querySelector("routeInfo")?.getAttribute("routeName")||f.name.replace(/\.rtz$/i,"");$("routeName").value=state.route.name;state.route.waypoints=pts;updateRouteUI(true);
}catch(err){alert("Could not import RTZ: "+err.message)}});

// ---------- vessel ----------
const vesselIds={name:"vName",call:"vCall",mmsi:"vMmsi",imo:"vImo",loa:"vLoa",beam:"vBeam",draft:"vDraft",speed:"vSpeed",maxHs:"vHs",maxWind:"vWind",maxCurrent:"vCurrent",minUkc:"vUkc",corridor:"vCorridor",cpa:"vCpa",fuelDay:"vFuelDay",density:"vDensity",genRating:"vGen",ess:"vEss"};
function fillVesselForm(){
  Object.entries(vesselIds).forEach(([k,id])=>{if($(id))$(id).value=state.vessel[k]??"";});
  renderVesselTanks();
}
function readVessel(){
  const v={};Object.entries(vesselIds).forEach(([k,id])=>v[k]=["name","call","mmsi","imo"].includes(k)?$(id).value:+$(id).value||0);
  v.tanks=[...$("vTankRows").querySelectorAll("tr")].map(tr=>({name:tr.querySelector(".vt-name").value,capacity:+tr.querySelector(".vt-cap").value||0,maxFill:+tr.querySelector(".vt-fill").value||90})).filter(t=>t.name&&t.capacity>0);
  return v;
}
function renderVesselTanks(){
  const tanks=state.vessel.tanks||[];$("vTankRows").innerHTML="";
  tanks.forEach(t=>addVesselTankRow(t));
}
function addVesselTankRow(t={name:"",capacity:"",maxFill:90}){
  const tr=document.createElement("tr");tr.innerHTML=`<td><input class="vt-name" value="${escAttr(t.name)}"></td><td><input class="vt-cap" type="number" step=".01" value="${t.capacity}"></td><td><input class="vt-fill" type="number" step=".1" value="${t.maxFill}"></td><td><button class="danger-soft small vt-del">×</button></td>`;$("vTankRows").appendChild(tr);tr.querySelector(".vt-del").addEventListener("click",()=>tr.remove());
}
$("addVesselTank").addEventListener("click",()=>addVesselTankRow());
function refreshVesselProfiles(){
  if(!state.vessels.length && state.vessel && Object.keys(state.vessel).length){
    state.vessel.id=state.vessel.id||uuid(); state.vessels=[JSON.parse(JSON.stringify(state.vessel))]; store.set(KEYS.vessels,state.vessels);
  }
  if(!$("vesselProfiles")) return;
  $("vesselProfiles").innerHTML=state.vessels.map(v=>`<option value="${v.id}" ${v.id===state.vessel.id?"selected":""}>${esc(v.name||"Untitled vessel")}</option>`).join("") || '<option value="">No profiles</option>';
}
$("vesselProfiles").addEventListener("change",()=>{
  const v=state.vessels.find(x=>x.id===$("vesselProfiles").value); if(!v)return;
  state.vessel=JSON.parse(JSON.stringify(v)); store.set(KEYS.vessel,state.vessel); fillVesselForm(); prefillFromVessel(); updateDashboard();
});
$("newVesselProfile").addEventListener("click",()=>{
  state.vessel={id:uuid(),tanks:[]}; fillVesselForm(); refreshVesselProfiles();
});
$("saveVessel").addEventListener("click",()=>{
  const v=readVessel(); v.id=state.vessel.id||uuid(); state.vessel=v;
  const i=state.vessels.findIndex(x=>x.id===v.id); i>=0?state.vessels.splice(i,1,JSON.parse(JSON.stringify(v))):state.vessels.push(JSON.parse(JSON.stringify(v)));
  store.set(KEYS.vessel,state.vessel); store.set(KEYS.vessels,state.vessels); refreshVesselProfiles(); updateDashboard(); prefillFromVessel(); alert("Vessel profile saved locally.");
});
function prefillFromVessel(){
  if(state.vessel.draft)$("uDraft").value=state.vessel.draft;if(state.vessel.minUkc)$("uReq").value=state.vessel.minUkc;
  if(state.vessel.genRating)$("lsRating").value=state.vessel.genRating;if(state.vessel.ess)$("essCap").value=state.vessel.ess;
  if(state.vessel.density)$("sfDensity").value=state.vessel.density;if(state.vessel.fuelDay)$("qCons").value=state.vessel.fuelDay;
}

// ---------- voyages ----------
function routeOptions(selected=""){return `<option value="">Select route…</option>`+state.routes.map(r=>`<option value="${r.id}" ${r.id===selected?"selected":""}>${esc(r.name)}</option>`).join("")}
function refreshRouteSelectors(){
  ["voyRoute","compareA","compareB","savedRouteSelect"].forEach(id=>{if($(id)){const cur=$(id).value;$(id).innerHTML=routeOptions(cur);}});
}
function renderVoyages(){
  refreshRouteSelectors();$("voyVessel").value=state.vessel.name||"No vessel profile";
  const box=$("voyageList");if(!state.voyages.length){box.innerHTML='<div class="source-status">No saved voyages yet.</div>';return;}
  box.innerHTML=state.voyages.map(v=>{const r=state.routes.find(x=>x.id===v.routeId);return`<div class="list-item"><div><strong>${esc(v.name)}</strong><small>${esc(v.status)} · ${r?esc(r.name):"Route missing"}</small></div><div class="actions"><button class="soft small" data-editvoy="${v.id}">Open</button><button class="danger-soft small" data-delvoy="${v.id}">Delete</button></div></div>`}).join("");
  $$("[data-editvoy]").forEach(b=>b.addEventListener("click",()=>loadVoyage(b.dataset.editvoy)));
  $$("[data-delvoy]").forEach(b=>b.addEventListener("click",()=>{if(confirm("Delete this voyage?")){state.voyages=state.voyages.filter(v=>v.id!==b.dataset.delvoy);store.set(KEYS.voyages,state.voyages);renderVoyages();updateDashboard();}}));
}
function loadVoyage(id){
  const v=state.voyages.find(x=>x.id===id);if(!v)return;state.currentVoyageId=id;
  $("voyName").value=v.name;$("voyStatus").value=v.status;$("voyRoute").value=v.routeId||"";$("voyDeparture").value=v.departure||"";$("voyReserve").value=v.reserve??20;$("voyNotes").value=v.notes||"";
}
$("newVoyage").addEventListener("click",()=>{state.currentVoyageId=null;$("voyName").value="";$("voyStatus").value="Planning";$("voyRoute").value="";$("voyDeparture").value=isoLocalNow();$("voyReserve").value=20;$("voyNotes").value="";});
$("saveVoyage").addEventListener("click",()=>{
  const v={id:state.currentVoyageId||uuid(),name:$("voyName").value.trim()||"Untitled voyage",status:$("voyStatus").value,routeId:$("voyRoute").value,departure:$("voyDeparture").value,reserve:+$("voyReserve").value||0,notes:$("voyNotes").value,updated:new Date().toISOString()};
  const i=state.voyages.findIndex(x=>x.id===v.id);i>=0?state.voyages.splice(i,1,v):state.voyages.unshift(v);state.currentVoyageId=v.id;store.set(KEYS.voyages,state.voyages);renderVoyages();updateDashboard();
});
function selectedVoyage(){
  return state.voyages.find(v=>v.id===state.currentVoyageId) || {name:$("voyName").value,status:$("voyStatus").value,routeId:$("voyRoute").value,departure:$("voyDeparture").value,reserve:+$("voyReserve").value||0,notes:$("voyNotes").value};
}
$("printVoyage").addEventListener("click",()=>printPassageReport(selectedVoyage()));
$("shareVoyage").addEventListener("click",()=>download((slug($("voyName").value)||"voyage")+".mops.json",JSON.stringify({type:"mops-voyage",voyage:selectedVoyage(),route:state.routes.find(r=>r.id===$("voyRoute").value),vessel:state.vessel},null,2),"application/json"));
$("qrVoyage").addEventListener("click",()=>{
  const data={v:selectedVoyage(),r:state.routes.find(r=>r.id===$("voyRoute").value)};
  const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(data))));const url=`${location.origin}${location.pathname}?share=${encodeURIComponent(encoded)}`;
  const box=$("qrArea");box.hidden=false;box.innerHTML=`<img alt="QR code" src="https://quickchart.io/qr?size=180&text=${encodeURIComponent(url)}"><small>QR generation uses QuickChart only when you request it. The encoded share link contains voyage/route planning data.</small><div class="actions"><button class="soft small" id="copyShare">Copy share link</button></div>`;
  $("copyShare").addEventListener("click",()=>navigator.clipboard.writeText(url));
});
function printPassageReport(voy){
  const r=state.routes.find(x=>x.id===voy.routeId)||state.route,m=routeMetrics(r),dep=new Date(voy.departure||r.departure),eta=new Date(dep.getTime()+m.hours*3600000);
  const rows=r.waypoints.map((p,i)=>{const leg=i?m.legs[i-1]:null;return`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${p.lat.toFixed(5)}</td><td>${p.lon.toFixed(5)}</td><td>${leg?fmt(leg.course,0)+"°":"—"}</td><td>${leg?fmt(leg.distance,1):"—"}</td><td>${p.speed||r.speed}</td></tr>`}).join("");
  const w=window.open("","_blank");w.document.write(`<!doctype html><html><head><title>${esc(voy.name||"Passage report")}</title><style>body{font-family:Aptos,Arial,sans-serif;margin:34px;color:#173047}h1{margin-bottom:4px}small{color:#687b8e}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0}.box{padding:12px;border:1px solid #ddd;border-radius:8px}.warn{margin-top:24px;padding:12px;border-left:4px solid #c8861d;background:#fff7ea}@media print{button{display:none}}</style></head><body><h1>${esc(voy.name||r.name)}</h1><small>M/OPS Passage Plan Summary</small><div class="grid"><div class="box"><b>Vessel</b><br>${esc(state.vessel.name||"—")}</div><div class="box"><b>Distance</b><br>${fmt(m.distance,1)} NM</div><div class="box"><b>Departure</b><br>${dateFmt(dep)}</div><div class="box"><b>ETA</b><br>${dateFmt(eta)}</div></div><p>${esc(voy.notes||"")}</p><table><thead><tr><th>#</th><th>Waypoint</th><th>Lat</th><th>Lon</th><th>COG</th><th>NM</th><th>kn</th></tr></thead><tbody>${rows}</tbody></table><div class="warn"><b>Planning aid only.</b> Verify against ECDIS, official charts, navigation warnings, vessel procedures and responsible officers.</div><p>Master / OOW: ____________________ &nbsp;&nbsp; Date: ____________</p><button onclick="print()">Print / Save PDF</button></body></html>`);w.document.close();
}

// ---------- dashboard ----------
function updateDashboard(){
  $("heroVessel").textContent=state.vessel.name||"Not configured";
  const v=state.voyages[0];if(!v){$("dashVoyageSub").textContent="Create a voyage to begin.";$("dashRoute").textContent="—";$("dashDistance").textContent="—";$("dashEta").textContent="—";$("dashFuel").textContent="—";return;}
  const r=state.routes.find(x=>x.id===v.routeId);$("dashVoyageSub").textContent=`${v.name} · ${v.status}`;
  if(!r)return;
  const m=routeMetrics(r), dep=new Date(v.departure||r.departure),eta=new Date(dep.getTime()+m.hours*3600000),fuel=(state.vessel.fuelDay||0)*m.hours/24,req=fuel*(1+(v.reserve||0)/100);
  $("dashRoute").textContent=r.name;$("dashDistance").textContent=`${fmt(m.distance,1)} NM`;$("dashEta").textContent=dateFmt(eta);$("dashFuel").textContent=req?`${fmt(req,2)} m³`:"Set vessel consumption";
}

// ---------- API ----------
async function api(path){
  const base=(state.settings.proxy||"https://api.marinetools.app").replace(/\/$/,"");const r=await fetch(base+path);if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();
}
async function testApi(silent=false){
  try{const j=await api("/api/health");$("apiBadge").className="badge ok";$("apiBadge").textContent="API connected";$("heroApi").textContent="Connected";$("sideApiDot").className="ok";$("sideApiText").textContent="API connected";if(!silent)$("apiTest").textContent=`Connected · ${j.status||"ok"}`;return true}
  catch(e){$("apiBadge").className="badge neutral";$("apiBadge").textContent="API offline";$("heroApi").textContent="Offline / local";$("sideApiDot").className="";$("sideApiText").textContent="API unavailable";if(!silent)$("apiTest").textContent=e.message;return false}
}
$("testApi").addEventListener("click",()=>{state.settings.proxy=$("proxyUrl").value.trim();testApi();});
$("saveSettings").addEventListener("click",()=>{state.settings.proxy=$("proxyUrl").value.trim();state.settings.units=$("unitsPref").value;store.set(KEYS.settings,state.settings);$("apiTest").textContent="Settings saved locally.";});
$("proxyUrl").value=state.settings.proxy||"https://api.marinetools.app";$("unitsPref").value=state.settings.units||"nautical";

// ---------- route intelligence ----------
function cpaForTarget(target, route=state.route){
  if(route.waypoints.length<2)return null;const own=route.waypoints[0],next=route.waypoints[1],ownCog=bearing(own,next),ownSog=parseFloat(own.speed)||route.speed||9;
  const lat=+(target.latitude??target.lat),lon=+(target.longitude??target.lon),tcog=+(target.courseOverGround??target.cog??0),tsog=+(target.speedOverGround??target.sog??0);
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  const r=localXY(lat,lon,own.lat,own.lon),vo={x:ownSog*Math.sin(toRad(ownCog)),y:ownSog*Math.cos(toRad(ownCog))},vt={x:tsog*Math.sin(toRad(tcog)),y:tsog*Math.cos(toRad(tcog))},rv={x:vt.x-vo.x,y:vt.y-vo.y},vv=rv.x**2+rv.y**2;
  const tcpa=vv>1e-9?-(r.x*rv.x+r.y*rv.y)/vv:Infinity,cpaT=Math.max(0,tcpa),cx=r.x+rv.x*cpaT,cy=r.y+rv.y*cpaT;
  return{cpa:Math.hypot(cx,cy),tcpaHours:tcpa};
}
function renderLimits(){
  const v=state.vessel;$("limitSummary").innerHTML=[
    ["Max Hs",v.maxHs?`${v.maxHs} m`:"Not set"],["Max wind",v.maxWind?`${v.maxWind} kn`:"Not set"],["Max current",v.maxCurrent?`${v.maxCurrent} kn`:"Not set"],
    ["AIS corridor",`${v.corridor||5} NM`],["CPA alert",`${v.cpa||1} NM`],["Min UKC",`${v.minUkc||1} m`]
  ].map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
}
$("runIntel").addEventListener("click",async()=>{
  if(state.route.waypoints.length<2)return alert("Create or load a route first.");
  renderLimits();$("intelFeed").className="intel-feed";$("intelFeed").innerHTML='<div class="source-status">Analysing available sources…</div>';
  const corridor=state.vessel.corridor||5,cpaLimit=state.vessel.cpa||1;let ais=[],forecasts=[],warnings=[],sources=[];
  try{
    const lats=state.route.waypoints.map(p=>p.lat),lons=state.route.waypoints.map(p=>p.lon),pad=(corridor||5)/60;
    const qs=new URLSearchParams({minLat:Math.min(...lats)-pad,maxLat:Math.max(...lats)+pad,minLon:Math.min(...lons)-pad,maxLon:Math.max(...lons)+pad});
    const a=await api("/api/ais/latest?"+qs.toString());ais=Array.isArray(a)?a:(a.items||a.data||[]);sources.push("AIS live");
  }catch{sources.push("AIS unavailable")}
  try{const f=await api("/api/forecast?route="+encodeURIComponent(JSON.stringify(state.route.waypoints)));forecasts=Array.isArray(f)?f:(f.items||[]);sources.push("Forecast adapter");}catch{sources.push("Forecast unavailable")}
  try{const r=await fetch("https://api.kystverket.no/data/navigationwarnings/coastal/");if(r.ok){const j=await r.json();warnings=Array.isArray(j)?j:(j.items||j.features||[]);sources.push("Warnings live")}}catch{}
  const nearby=ais.map(t=>{const p={lat:+(t.latitude??t.lat),lon:+(t.longitude??t.lon)};return{t,p,d:routePointDistance(p),c:cpaForTarget(t)}}).filter(x=>Number.isFinite(x.d)&&x.d<=corridor);
  const close=nearby.filter(x=>x.c&&x.c.tcpaHours>=0&&x.c.cpa<=cpaLimit);
  const wxValid=forecasts.filter(x=>Number.isFinite(+x.hs)||Number.isFinite(+x.windKn)||Number.isFinite(+x.currentKn));
  const wxEx=wxValid.filter(x=>(state.vessel.maxHs&&+x.hs>state.vessel.maxHs)||(state.vessel.maxWind&&+x.windKn>state.vessel.maxWind)||(state.vessel.maxCurrent&&+x.currentKn>state.vessel.maxCurrent));
  const geoWarn=warnings.map((w,i)=>({w,p:warningPoint(w),i})).filter(x=>x.p&&routePointDistance(x.p)<=corridor);
  $("intelWeather").textContent=wxValid.length?(wxEx.length?`${wxEx.length} exceedance(s)`:"Within limits"):"No live values";
  $("intelTraffic").textContent=`${nearby.length} target(s)`;$("intelWarnings").textContent=`${geoWarn.length} near route`;$("intelCpa").textContent=`${close.length} alert(s)`;
  const items=[
    {l:wxEx.length?"warn":"ok",t:"Weather / sea state",s:wxValid.length?(wxEx.length?`${wxEx.length} forecast samples exceed vessel limits.`:`${wxValid.length} forecast samples checked; no entered limit exceeded.`):"Forecast proxy returned no numeric live values yet."},
    {l:nearby.length?"warn":"ok",t:"AIS corridor",s:`${nearby.length} target(s) found within ${corridor} NM of route geometry.`},
    {l:close.length?"bad":"ok",t:"CPA screening",s:`${close.length} target(s) have calculated future CPA ≤ ${cpaLimit} NM using route-start course/speed. Not a COLREG decision tool.`},
    {l:geoWarn.length?"warn":"ok",t:"Navigation warnings",s:`${geoWarn.length} geolocated warning(s) found within ${corridor} NM.`},
    {l:"",t:"Sources",s:sources.join(" · ")}
  ];
  $("intelFeed").innerHTML=items.map(i=>`<div class="intel-item"><i class="${i.l}"></i><span><strong>${i.t}</strong><small>${i.s}</small></span><b>${i.l==="bad"?"ALERT":i.l==="warn"?"CHECK":"INFO"}</b></div>`).join("");
  $("aisRows").innerHTML=nearby.slice(0,100).map(x=>{const t=x.t,c=x.c;return`<tr><td>${esc(t.name||t.shipName||t.vesselName||"Unknown")}</td><td>${esc(String(t.mmsi||"—"))}</td><td>${fmt(+(t.speedOverGround??t.sog),1)}</td><td>${fmt(+(t.courseOverGround??t.cog),0)}°</td><td>${fmt(x.d,2)} NM</td><td>${c?fmt(c.cpa,2)+" NM":"—"}</td><td>${c&&Number.isFinite(c.tcpaHours)?fmt(c.tcpaHours*60,0)+" min":"—"}</td></tr>`}).join("");
});
function warningPoint(w){
  const p=w.properties||w;if(Number.isFinite(+p.lat)&&Number.isFinite(+p.lon))return{lat:+p.lat,lon:+p.lon};if(Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude))return{lat:+p.latitude,lon:+p.longitude};if(w.geometry?.type==="Point")return{lat:+w.geometry.coordinates[1],lon:+w.geometry.coordinates[0]};return null;
}

// ---------- route compare ----------
$("compareRoutes").addEventListener("click",()=>{
  const a=state.routes.find(r=>r.id===$("compareA").value),b=state.routes.find(r=>r.id===$("compareB").value);if(!a||!b)return alert("Select two routes.");
  const cards=[a,b].map(r=>{const m=routeMetrics(r),fuel=(state.vessel.fuelDay||0)*m.hours/24;return`<article class="card compare-route"><h2>${esc(r.name)}</h2><div class="compare-line"><span>Distance</span><strong>${fmt(m.distance,1)} NM</strong></div><div class="compare-line"><span>Sailing time</span><strong>${duration(m.hours)}</strong></div><div class="compare-line"><span>Waypoints</span><strong>${r.waypoints.length}</strong></div><div class="compare-line"><span>Fuel estimate</span><strong>${fuel?fmt(fuel,2)+" m³":"Set vessel consumption"}</strong></div><div class="compare-line"><span>No-go areas</span><strong>${(r.nogos||[]).length}</strong></div></article>`});
  $("compareResults").innerHTML=cards.join("");
});

// ---------- CPA / UKC ----------
$("calcCPA").addEventListener("click",()=>{
  const o={lat:num("cOwnLat"),lon:num("cOwnLon"),cog:num("cOwnCog"),sog:num("cOwnSog")},t={lat:num("cTarLat"),lon:num("cTarLon"),cog:num("cTarCog"),sog:num("cTarSog")};
  if(Object.values(o).concat(Object.values(t)).some(v=>!Number.isFinite(v)))return;
  const r=localXY(t.lat,t.lon,o.lat,o.lon),vo={x:o.sog*Math.sin(toRad(o.cog)),y:o.sog*Math.cos(toRad(o.cog))},vt={x:t.sog*Math.sin(toRad(t.cog)),y:t.sog*Math.cos(toRad(t.cog))},rv={x:vt.x-vo.x,y:vt.y-vo.y},vv=rv.x**2+rv.y**2,tcpa=vv>1e-9?-(r.x*rv.x+r.y*rv.y)/vv:Infinity,ct=Math.max(0,tcpa),cpa=Math.hypot(r.x+rv.x*ct,r.y+rv.y*ct);
  $("cRange").textContent=`${fmt(Math.hypot(r.x,r.y),2)} NM`;$("cCPA").textContent=`${fmt(cpa,2)} NM`;$("cTCPA").textContent=Number.isFinite(tcpa)?`${fmt(tcpa*60,0)} min`:"Parallel";$("cStatus").textContent=!Number.isFinite(tcpa)?"No relative motion":tcpa<0?"Opening":cpa<1?"Close approach":"Approach";
});
$("calcUKC").addEventListener("click",()=>{
  const water=num("uDepth")+num("uTide"),dyn=num("uDraft")+num("uSquat")+num("uHeel")+num("uWave"),avail=water-dyn,req=Math.max(num("uReq")||0,(num("uDraft")||0)*(num("uPct")||0)/100),margin=avail-req;
  $("uWater").textContent=`${fmt(water,2)} m`;$("uDyn").textContent=`${fmt(dyn,2)} m`;$("uAvail").textContent=`${fmt(avail,2)} m`;$("uMargin").textContent=`${fmt(margin,2)} m`;
  $("ukcNote").className=`notice ${margin>=0?"good":"bad"}`;$("ukcNote").innerHTML=margin>=0?`Calculated UKC meets the entered minimum by <b>${fmt(margin,2)} m</b>.`:`Calculated UKC is <b>${fmt(Math.abs(margin),2)} m below</b> the entered minimum.`;
});

// ---------- warnings ----------
async function loadWarnings(type){
  const url=type==="navarea"?"https://api.kystverket.no/data/navigationwarnings/navareaxix/":"https://api.kystverket.no/data/navigationwarnings/coastal/";
  $("warnStatus").textContent="Loading…";
  try{const r=await fetch(url);if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json(),arr=Array.isArray(j)?j:(j.items||j.features||[]);
    $("warnStatus").className="source-status ok";$("warnStatus").textContent=`Loaded ${arr.length} live record(s) from Kystverket.`;
    $("warningList").className="warning-list";$("warningList").innerHTML=arr.slice(0,100).map((w,i)=>{const p=w.properties||w,t=p.title||p.name||p.id||`Warning ${i+1}`,d=p.description||p.text||p.message||p.warningText||"Open official source for complete details.";return`<article class="warning-card"><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`}).join("")||'<div class="source-status">No warning records returned.</div>';
  }catch(e){$("warnStatus").className="source-status";$("warnStatus").textContent=`Could not load live warnings: ${e.message}`;$("warningList").innerHTML="";}
}
$("loadCoastal").addEventListener("click",()=>loadWarnings("coastal"));$("loadNavarea").addEventListener("click",()=>loadWarnings("navarea"));

// ---------- bunkering ----------
function ensureBunkerRows(){if(!$("bunkerRows").children.length)loadProfileTanks();}
function loadProfileTanks(){
  const tanks=state.vessel.tanks||[];$("bunkerRows").innerHTML="";
  (tanks.length?tanks:[{name:"Tank 1",capacity:0,maxFill:90},{name:"Tank 2",capacity:0,maxFill:90}]).forEach(t=>addBunkerRow(t));
}
function addBunkerRow(t){const tr=document.createElement("tr");tr.innerHTML=`<td><input class="b-name" value="${escAttr(t.name||"")}"></td><td><input class="b-cap" type="number" step=".01" value="${t.capacity||""}"></td><td><input class="b-before" type="number" step=".01"></td><td><input class="b-max" type="number" step=".1" value="${t.maxFill||90}"></td><td class="b-av">—</td><td class="b-tr">—</td><td class="b-after">—</td><td class="b-pct">—</td>`;$("bunkerRows").appendChild(tr);}
$("loadProfileTanks").addEventListener("click",loadProfileTanks);
$("calcBunker").addEventListener("click",()=>{
  const qty=num("bQty"),fallback=num("bFill")||90,rows=[...$("bunkerRows").querySelectorAll("tr")];if(!Number.isFinite(qty)||qty<0)return alert("Enter quantity.");
  const ts=rows.map(row=>{const cap=+row.querySelector(".b-cap").value,before=+row.querySelector(".b-before").value,max=(+row.querySelector(".b-max").value||fallback)/100;return{row,cap,before,max,av:Math.max(0,cap*max-before),tr:0}});
  if(ts.some(t=>!Number.isFinite(t.cap)||t.cap<=0||!Number.isFinite(t.before)||t.before<0))return alert("Complete tank capacity and before volume.");
  const av=ts.reduce((s,t)=>s+t.av,0),plan=Math.min(qty,av);ts.forEach(t=>t.tr=av?plan*t.av/av:0);
  ts.forEach(t=>{const after=t.before+t.tr;t.row.querySelector(".b-av").textContent=fmt(t.av);t.row.querySelector(".b-tr").textContent=fmt(t.tr);t.row.querySelector(".b-after").textContent=fmt(after);t.row.querySelector(".b-pct").textContent=fmt(after/t.cap*100,1)+" %"});
  $("bunkerMetrics").innerHTML=`<div><span>Requested</span><strong>${fmt(qty)} m³</strong></div><div><span>Planned</span><strong>${fmt(plan)} m³</strong></div><div><span>Available</span><strong>${fmt(av)} m³</strong></div><div><span>Unallocated</span><strong>${fmt(Math.max(0,qty-plan))} m³</strong></div>`;
});
$("printBunker").addEventListener("click",()=>{const w=window.open("","_blank"),html=$("bunkerPlan").innerHTML;w.document.write(`<html><head><title>Bunker Plan</title><link rel="stylesheet" href="${location.origin}${location.pathname.replace(/[^/]*$/,"")}styles.css"></head><body style="padding:30px"><h1>Bunker Plan — ${esc(state.vessel.name||"Vessel")}</h1>${html}<p><b>Planning aid only.</b> Verify against vessel procedures and tank tables.</p><script>setTimeout(()=>print(),300)<\/script></body></html>`);w.document.close();});
$("checkBDN").addEventListener("click",()=>{
  const vol=num("bdnVol"),den=num("bdnDensity"),mass=num("bdnMass"),recv=num("bdnReceived"),tol=num("bdnTol")||.5,sul=num("bdnSulfur"),calcMass=vol*den/1000,diff=recv&&vol?Math.abs(recv-vol)/vol*100:NaN;
  const items=[];if(Number.isFinite(calcMass)&&Number.isFinite(mass))items.push({l:Math.abs(calcMass-mass)/mass*100<=tol?"ok":"warn",t:"Mass / density cross-check",s:`Calculated ${fmt(calcMass,3)} t vs BDN ${fmt(mass,3)} t.`});
  if(Number.isFinite(diff))items.push({l:diff<=tol?"ok":"warn",t:"Received quantity",s:`Difference from BDN volume: ${fmt(diff,2)} % (entered tolerance ${fmt(tol,2)} %).`});
  if(Number.isFinite(den))items.push({l:den>600&&den<1100?"ok":"warn",t:"Density sanity",s:`Entered density ${fmt(den,1)} kg/m³.`});
  if(Number.isFinite(sul))items.push({l:"",t:"Sulfur",s:`Entered sulfur ${fmt(sul,3)} % m/m. Verify against the fuel requirement applicable to the vessel and voyage.`});
  $("bdnResults").innerHTML=items.map(i=>`<div class="intel-item"><i class="${i.l}"></i><span><strong>${i.t}</strong><small>${i.s}</small></span><b>${i.l==="warn"?"CHECK":"INFO"}</b></div>`).join("");
});
$("generateORB").addEventListener("click",()=>{
  const lines=["H. BUNKERING OF FUEL OIL","",`Date: ${$("oDate").value||"[date]"}`,`Place: ${$("oPlace").value||"[place]"}`];
  if($("oStart").value||$("oEnd").value)lines.push(`Time: ${$("oStart").value||"[start]"} – ${$("oEnd").value||"[end]"}`);
  lines.push(`Fuel grade: ${$("oGrade").value||"[grade]"}`,`Quantity received: ${$("oQty").value||"[quantity]"} m³`);
  if($("oDensity").value)lines.push(`Density: ${$("oDensity").value} kg/m³`);if($("oSulfur").value)lines.push(`Sulfur content: ${$("oSulfur").value} % m/m`);
  lines.push("","Tank distribution:",$("oTanks").value||"[tank distribution]","","DRAFT ONLY — verify wording, numbering and required particulars against the vessel's approved Oil Record Book, MARPOL Annex I and company procedures before making an official entry.");
  $("orbOutput").value=lines.join("\n");
});
$("copyORB").addEventListener("click",()=>navigator.clipboard.writeText($("orbOutput").value||""));
const checklistItems=["Bunkering plan agreed and tank capacities verified","Scuppers / save-alls and spill response arrangements checked","Communications and emergency stop arrangements agreed","Correct fuel grade / BDN particulars confirmed","Transfer hoses / connections checked as applicable","Initial transfer rate agreed and leak check completed","Tank levels monitored during transfer","Final quantity / tank distribution checked","BDN and samples handled per applicable procedure","ORB / company records prepared after completion"];
function renderChecklist(){
  const saved=store.get(KEYS.checklist,{});
  $("bunkerChecklist").innerHTML=checklistItems.map((t,i)=>`<label class="checkrow"><input type="checkbox" data-ci="${i}" ${saved[i]?"checked":""}><span>${t}</span></label>`).join("");
  $$("[data-ci]").forEach(c=>c.addEventListener("change",()=>{const s=store.get(KEYS.checklist,{});s[c.dataset.ci]=c.checked;store.set(KEYS.checklist,s);}));
}
$("resetChecklist").addEventListener("click",()=>{store.set(KEYS.checklist,{});renderChecklist();});
$$(".tab").forEach(t=>t.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".tabpage").forEach(x=>x.classList.remove("active"));t.classList.add("active");$(t.dataset.tab).classList.add("active");}));

// ---------- engineering ----------
$("calcRH").addEventListener("click",()=>{
  const vals=$$(".rh").map(i=>({name:i.dataset.name,h:+i.value})).filter(x=>Number.isFinite(x.h)),int=num("rhInterval");
  if(!vals.length)return;const min=[...vals].sort((a,b)=>a.h-b.h)[0];
  const lines=vals.map(x=>`${x.name}: ${fmt(x.h,0)} h${int?` · ${fmt(int-(x.h%int),0)} h to next ${int} h interval`:""}`);
  $("rhOut").innerHTML=`Lowest running hours: <b>${min.name}</b> (${fmt(min.h,0)} h).<br>${lines.join("<br>")}<br><small>Use vessel procedures and operating constraints when selecting a running/standby unit.</small>`;
});
$("calcLS").addEventListener("click",()=>{const load=num("lsLoad"),count=num("lsCount"),rating=num("lsRating"),target=num("lsTarget");if(!(load>=0&&count>0&&rating>0))return;const per=load/count,pct=per/rating*100;$("lsOut").innerHTML=`Per generator: <b>${fmt(per,1)} kW</b> · <b>${fmt(pct,1)} %</b> load.${pct<target?`<br>Below entered target minimum of ${fmt(target,0)} %.`:""}`;});
$("calcSFOC").addEventListener("click",()=>{const p=num("sfPower"),h=num("sfHours"),s=num("sfSfoc"),d=num("sfDensity");if(!(p>=0&&h>=0&&s>0&&d>0))return;const kg=p*h*s/1000;$("sfOut").innerHTML=`Fuel: <b>${fmt(kg,1)} kg</b> · <b>${fmt(kg/1000,3)} t</b> · <b>${fmt(kg/d,3)} m³</b>.`;});
$("calcESS").addEventListener("click",()=>{const c=num("essCap"),s=num("essStart"),e=num("essEnd"),p=num("essPower"),eff=(num("essEff")||100)/100;if(!(c>0&&p>0))return;const delta=Math.abs(s-e)/100*c*eff;$("essOut").innerHTML=`Usable energy between entered SOC values: <b>${fmt(delta,1)} kWh</b> · idealized time at ${fmt(p,1)} kW: <b>${fmt(delta/p,2)} h</b>.`;});
$("calcSP").addEventListener("click",()=>{const v=num("spV"),a=num("spA"),pf=num("spPF");if(!(v>0&&a>=0&&pf>=0))return;const kva=Math.sqrt(3)*v*a/1000,kw=kva*pf;$("spOut").innerHTML=`Three-phase apparent power <b>${fmt(kva,1)} kVA</b> · active power <b>${fmt(kw,1)} kW</b>.`;});
$("calcPump").addEventListener("click",()=>{const f=num("pFlow"),m=num("pTime"),head=num("pHead");if(!(f>=0&&m>=0))return;const vol=f*m/60;$("pOut").innerHTML=`Transferred volume: <b>${fmt(vol,2)} m³</b>${Number.isFinite(head)?` · entered head ${fmt(head,1)} m`:``}.`;});
$("calcSound").addEventListener("click",()=>{const target=num("soundValue"),pairs=$("soundTable").value.split(/\n+/).map(l=>l.split(/[,;\s]+/).map(Number)).filter(x=>x.length>=2&&x.every(Number.isFinite)).sort((a,b)=>a[0]-b[0]);if(!Number.isFinite(target)||pairs.length<2)return;$("soundOut").innerHTML=interp(target,pairs);});
function interp(x,pairs){if(x<pairs[0][0]||x>pairs.at(-1)[0])return"Target is outside the entered table range.";for(let i=1;i<pairs.length;i++)if(x<=pairs[i][0]){const [x0,y0]=pairs[i-1],[x1,y1]=pairs[i],y=y0+(x-x0)/(x1-x0)*(y1-y0);return`Interpolated volume: <b>${fmt(y,3)} m³</b> between ${x0} and ${x1}.`}}
$("calcTL").addEventListener("click",()=>{const b=num("tlBase"),t=num("tlTrim")||0,l=num("tlList")||0;if(!Number.isFinite(b))return;$("tlOut").innerHTML=`Corrected volume: <b>${fmt(b+t+l,3)} m³</b> (base + vessel-table corrections).`;});

// ---------- quick tools ----------
$("qTimeCalc").addEventListener("click",()=>{const d=num("qDist"),s=num("qSpeed");$("qTimeOut").innerHTML=s>0?`Time: <b>${duration(d/s)}</b>`:"Enter speed.";});
$("qSpeedCalc").addEventListener("click",()=>{const d=num("qrDist"),h=num("qrHours");$("qSpeedOut").innerHTML=h>0?`Required average speed: <b>${fmt(d/h,2)} kn</b>`:"Enter hours.";});
$("qEndCalc").addEventListener("click",()=>{const f=num("qFuel"),c=num("qCons"),r=num("qReserve")||0,usable=f*(1-r/100);$("qEndOut").innerHTML=c>0?`Usable fuel ${fmt(usable,2)} m³ · endurance <b>${fmt(usable/c,2)} days</b> (${duration(usable/c*24)}).`:"Enter consumption.";});
$("qAvgCalc").addEventListener("click",()=>{const d=num("qaDist"),h=num("qaHours");$("qAvgOut").innerHTML=h>0?`Average speed: <b>${fmt(d/h,2)} kn</b>`:"Enter hours.";});
$("qSlipCalc").addEventListener("click",()=>{const t=num("qsTheory"),a=num("qsActual");$("qSlipOut").innerHTML=t>0?`Slip: <b>${fmt((t-a)/t*100,2)} %</b>`:"Enter theoretical speed.";});
$("qRpmCalc").addEventListener("click",()=>{const rr=num("qrpmRef"),rs=num("qrpmSpeed"),n=num("qrpmNew");$("qRpmOut").innerHTML=rr>0?`Linear reference estimate: <b>${fmt(rs*n/rr,2)} kn</b>. Actual propeller/vessel response is generally non-linear.`:"Enter reference RPM.";});
function ddm(v,isLat){const hemi=v>=0?(isLat?"N":"E"):(isLat?"S":"W"),a=Math.abs(v),d=Math.floor(a),m=(a-d)*60;return`${d}° ${m.toFixed(3)}′ ${hemi}`}
$("qCoordCalc").addEventListener("click",()=>{const la=num("qcLat"),lo=num("qcLon");$("qCoordOut").innerHTML=Number.isFinite(la)&&Number.isFinite(lo)?`<b>${ddm(la,true)}</b><br><b>${ddm(lo,false)}</b>`:"Enter decimal coordinates.";});
$("qBearCalc").addEventListener("click",()=>{const a={lat:num("qbLat1"),lon:num("qbLon1")},b={lat:num("qbLat2"),lon:num("qbLon2")};$("qBearOut").innerHTML=Object.values(a).concat(Object.values(b)).every(Number.isFinite)?`Distance <b>${fmt(havNm(a,b),2)} NM</b> · initial bearing <b>${fmt(bearing(a,b),1)}°</b>.`:"Enter both coordinates.";});
const unitDefs={speed:{kn:1,"km/h":1.852,"m/s":.514444},distance:{NM:1,km:1.852,m:1852},pressure:{bar:1,kPa:100,psi:14.5037738},power:{kW:1,hp:1.34102209,PS:1.35962162},volume:{"m³":1,L:1000}};
function fillUnitSelects(){const d=unitDefs[$("qUnitCat").value],ks=Object.keys(d);$("qUnitFrom").innerHTML=ks.map(k=>`<option>${k}</option>`).join("");$("qUnitTo").innerHTML=ks.map((k,i)=>`<option ${i===1?"selected":""}>${k}</option>`).join("")}
$("qUnitCat").addEventListener("change",fillUnitSelects);fillUnitSelects();
$("qUnitCalc").addEventListener("click",()=>{const d=unitDefs[$("qUnitCat").value],v=num("qUnitVal"),f=$("qUnitFrom").value,t=$("qUnitTo").value,out=v/d[f]*d[t];$("qUnitOut").innerHTML=Number.isFinite(out)?`<b>${fmt(v,4)} ${f}</b> = <b>${fmt(out,4)} ${t}</b>`:"Enter a value.";});
$("qNoonCalc").addEventListener("click",()=>{
  const a={lat:num("qnLat1"),lon:num("qnLon1")},b={lat:num("qnLat2"),lon:num("qnLon2")},h=num("qnHours");
  if(!Object.values(a).concat(Object.values(b)).every(Number.isFinite)||!(h>0))return;
  const d=havNm(a,b),c=bearing(a,b); $("qNoonOut").innerHTML=`Distance made good: <b>${fmt(d,2)} NM</b> · course made good: <b>${fmt(c,1)}°</b> · average speed: <b>${fmt(d/h,2)} kn</b>.`;
});
$("qCompassCalc").addEventListener("click",()=>{
  const c=num("qComp"),dev=num("qDev")||0,v=num("qVar")||0;if(!Number.isFinite(c))return;
  const mag=(c+dev+360)%360,trueC=(mag+v+360)%360; $("qCompassOut").innerHTML=`Magnetic course: <b>${fmt(mag,1)}°</b> · true course: <b>${fmt(trueC,1)}°</b>.<br><small>Convention used: East positive, West negative.</small>`;
});
$("qUtcCalc").addEventListener("click",()=>{const raw=$("qUtc").value;if(!raw)return;const d=new Date(raw+"Z");$("qUtcOut").innerHTML=`UTC: <b>${d.toISOString().replace("T"," ").slice(0,16)}</b><br>Browser local: <b>${dateFmt(d)}</b>`;});


const NAV_NO = {
  dashboard:"Kommando", voyages:"Seilaser", passage:"Ruteplanlegging", intelligence:"Ruteanalyse",
  compare:"Sammenlign ruter", cpa:"CPA / TCPA", ukc:"UKC", warnings:"Navigasjonsvarsler",
  vessel:"Fartøyprofiler", bunkering:"Bunkring & ORB", engineering:"Maskinverktøy", quick:"Hurtigverktøy", settings:"Innstillinger"
};
function applyLanguage(lang){
  state.settings.language=lang; store.set(KEYS.settings,state.settings);
  $$(".nav[data-page]").forEach(b=>{
    const id=b.dataset.page;
    if(!b.dataset.enlabel) b.dataset.enlabel=b.childNodes[b.childNodes.length-1]?.textContent?.trim()||b.textContent.trim();
    const icon=b.querySelector("span")?.outerHTML||"";
    const label=lang==="no"?(NAV_NO[id]||b.dataset.enlabel):b.dataset.enlabel;
    b.innerHTML=icon+label;
  });
}
$("language").addEventListener("change",e=>applyLanguage(e.target.value));

// ---------- local data ----------
$("exportLocal").addEventListener("click",()=>download("mops-local-data.json",JSON.stringify({vessel:state.vessel,routes:state.routes,voyages:state.voyages,settings:state.settings},null,2),"application/json"));
$("importLocal").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(j.vessel){state.vessel=j.vessel;store.set(KEYS.vessel,j.vessel)}if(j.routes){state.routes=j.routes;store.set(KEYS.routes,j.routes)}if(j.voyages){state.voyages=j.voyages;store.set(KEYS.voyages,j.voyages)}if(j.settings){state.settings=j.settings;store.set(KEYS.settings,j.settings)}location.reload()}catch{alert("Invalid M/OPS data file.")}});
$("clearLocal").addEventListener("click",()=>{if(confirm("Clear vessel, routes, voyages and local settings from this browser?")){Object.values(KEYS).forEach(store.del);location.reload();}});

// ---------- share import ----------
(function loadShare(){
  const q=new URLSearchParams(location.search).get("share");if(!q)return;try{const d=JSON.parse(decodeURIComponent(escape(atob(q))));if(d.r){state.route=JSON.parse(JSON.stringify(d.r));$("routeName").value=state.route.name||"Shared route";$("routeSpeed").value=state.route.speed||9;$("routeDeparture").value=state.route.departure||isoLocalNow();setTimeout(()=>updateRouteUI(true),200);showPage("passage");}}catch{}
})();

// ---------- PWA ----------
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.installPrompt=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(state.installPrompt){state.installPrompt.prompt();await state.installPrompt.userChoice;state.installPrompt=null;$("installBtn").hidden=true;}});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

// ---------- shortcuts ----------
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("globalSearch").focus();return;}
  if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;
  if(e.key.toLowerCase()==="g"){state.shortcutPrefix=true;setTimeout(()=>state.shortcutPrefix=false,1200);return;}
  if(state.shortcutPrefix){state.shortcutPrefix=false;const k=e.key.toLowerCase();if(k==="p")showPage("passage");if(k==="v")showPage("voyages");if(k==="d")showPage("dashboard");}
});

// ---------- utilities ----------
function slug(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escAttr(s){return esc(s).replace(/`/g,"&#96;")}
function xml(s){return String(s??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]))}
function xmlAttr(s){return xml(s)}

function init(){
  initMap();refreshVesselProfiles();fillVesselForm();prefillFromVessel();renderChecklist();refreshRouteSelectors();renderVoyages();renderLimits();loadProfileTanks();updateRouteUI();updateDashboard();testApi(true);
  if(!$("uDraft").value&&state.vessel.draft)$("uDraft").value=state.vessel.draft;
  if(!$("uReq").value&&state.vessel.minUkc)$("uReq").value=state.vessel.minUkc;
  $("language").value=state.settings.language||"en";applyLanguage(state.settings.language||"en");
}
init();
