
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const fmt = (n,d=2) => Number.isFinite(n) ? n.toFixed(d) : "—";
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const toRad = d => d*Math.PI/180, toDeg = r => r*180/Math.PI;
const EARTH_NM = 3440.065;
const state = {
  route: [],
  settings: {
    proxyUrl: localStorage.getItem("marineToolsProxyUrl") || "",
    dataMode: localStorage.getItem("marineToolsDataMode") || "auto"
  },
  map:null, routeLine:null, markers:[]
};

function showTool(id){
  $$(".tool").forEach(x=>x.classList.remove("active"));
  $$(".nav").forEach(x=>x.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelector(`.nav[data-tool="${id}"]`)?.classList.add("active");
  if(id==="passage" && state.map) setTimeout(()=>state.map.invalidateSize(),50);
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav").forEach(b=>b.addEventListener("click",()=>showTool(b.dataset.tool)));
$$(".jump").forEach(b=>b.addEventListener("click",()=>showTool(b.dataset.jump)));

function setTheme(theme){
  document.documentElement.classList.toggle("dark",theme==="dark");
  localStorage.setItem("marineToolsTheme",theme);
}
setTheme(localStorage.getItem("marineToolsTheme") || (matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));
$("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.classList.contains("dark")?"light":"dark"));

function isoLocalNow(){
  const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16);
}
$("routeDeparture").value = isoLocalNow();
$("orbDate").value = new Date().toISOString().slice(0,10);

// ---------- Map / Passage Planner ----------
function initMap(){
  if(!window.L){ $("map").innerHTML='<div class="empty-state">Map library could not be loaded.</div>'; return; }
  state.map=L.map("map",{zoomControl:true}).setView([59.2,10.4],7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:18,attribution:'&copy; OpenStreetMap contributors'
  }).addTo(state.map);
  state.map.on("click",e=>{ state.route.push({lat:e.latlng.lat,lon:e.latlng.lng,name:`WP${state.route.length+1}`}); updateRoute(); });
}
function haversineNm(a,b){
  const p1=toRad(a.lat), p2=toRad(b.lat), dp=toRad(b.lat-a.lat), dl=toRad(b.lon-a.lon);
  const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*EARTH_NM*Math.asin(Math.sqrt(h));
}
function bearing(a,b){
  const p1=toRad(a.lat),p2=toRad(b.lat),dl=toRad(b.lon-a.lon);
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function routeMetrics(){
  let total=0; const legs=[];
  for(let i=1;i<state.route.length;i++){ const d=haversineNm(state.route[i-1],state.route[i]); total+=d; legs.push({d,c:bearing(state.route[i-1],state.route[i])}); }
  return {total,legs};
}
function formatDuration(hours){
  if(!Number.isFinite(hours)) return "—"; const h=Math.floor(hours), m=Math.round((hours-h)*60); return `${h} h ${m} min`;
}
function fmtDateTime(d){ return d instanceof Date && !isNaN(d)?d.toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"—"; }
function updateRoute(){
  const speed=parseFloat($("routeSpeed").value), dep=new Date($("routeDeparture").value), {total,legs}=routeMetrics();
  $("routeDistance").textContent=`${fmt(total,1)} NM`;
  $("routeWpCount").textContent=state.route.length;
  $("routeDuration").textContent=speed>0?formatDuration(total/speed):"—";
  $("routeEta").textContent=speed>0 && !isNaN(dep) ? fmtDateTime(new Date(dep.getTime()+total/speed*3600000)):"—";

  if(state.map){
    state.markers.forEach(m=>m.remove()); state.markers=[];
    if(state.routeLine) state.routeLine.remove();
    if(state.route.length){
      state.route.forEach((p,i)=>{
        const m=L.marker([p.lat,p.lon],{draggable:true}).addTo(state.map).bindTooltip(`WP${i+1}`);
        m.on("dragend",e=>{ const ll=e.target.getLatLng(); state.route[i]={...state.route[i],lat:ll.lat,lon:ll.lng}; updateRoute(); });
        state.markers.push(m);
      });
      state.routeLine=L.polyline(state.route.map(p=>[p.lat,p.lon]),{color:"#0b82c9",weight:4}).addTo(state.map);
      if(state.route.length>1) state.map.fitBounds(state.routeLine.getBounds(),{padding:[30,30]});
    }
  }
  const tbody=$("routeTableBody"); tbody.innerHTML="";
  let cumulative=0;
  state.route.forEach((p,i)=>{
    const tr=document.createElement("tr");
    let leg="—",course="—",eta="—";
    if(i>0){ const l=legs[i-1]; cumulative+=l.d; leg=`${fmt(l.d,1)} NM`; course=`${fmt(l.c,0)}°`; }
    if(speed>0 && !isNaN(dep)) eta=fmtDateTime(new Date(dep.getTime()+cumulative/speed*3600000));
    tr.innerHTML=`<td>${i+1}</td><td>${p.lat.toFixed(5)}</td><td>${p.lon.toFixed(5)}</td><td>${course}</td><td>${leg}</td><td>${fmt(cumulative,1)} NM</td><td>${eta}</td><td><button class="secondary small" data-rm="${i}">Remove</button></td>`;
    tbody.appendChild(tr);
  });
  $$("[data-rm]").forEach(b=>b.addEventListener("click",()=>{state.route.splice(+b.dataset.rm,1);updateRoute()}));
}
$("routeSpeed").addEventListener("input",updateRoute); $("routeDeparture").addEventListener("change",updateRoute);
$("addManualWaypoint").addEventListener("click",()=>{
  const lat=parseFloat($("manualLat").value),lon=parseFloat($("manualLon").value);
  if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180){state.route.push({lat,lon,name:`WP${state.route.length+1}`});updateRoute();}
});
$("clearRoute").addEventListener("click",()=>{state.route=[];updateRoute()});
$("reverseRoute").addEventListener("click",()=>{state.route.reverse();updateRoute()});
$("exportRoute").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({version:"0.5",speed:+$("routeSpeed").value,departure:$("routeDeparture").value,waypoints:state.route},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="marine-tools-route.json";a.click();URL.revokeObjectURL(a.href);
});
$("importRoute").addEventListener("change",async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{const j=JSON.parse(await f.text());state.route=(j.waypoints||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lon)).map(p=>({lat:+p.lat,lon:+p.lon,name:p.name||""}));
    if(j.speed)$("routeSpeed").value=j.speed;if(j.departure)$("routeDeparture").value=j.departure;updateRoute();}
  catch{alert("Invalid route JSON file.");}
});

// ---------- CPA / TCPA ----------
function localXY(lat,lon,lat0,lon0){
  return {x:(lon-lon0)*60*Math.cos(toRad((lat+lat0)/2)),y:(lat-lat0)*60};
}
function velocity(cog,sog){return{x:sog*Math.sin(toRad(cog)),y:sog*Math.cos(toRad(cog))}}
$("calculateCpa").addEventListener("click",()=>{
  const o={lat:+$("cpaOwnLat").value,lon:+$("cpaOwnLon").value,cog:+$("cpaOwnCog").value,sog:+$("cpaOwnSog").value};
  const t={lat:+$("cpaTarLat").value,lon:+$("cpaTarLon").value,cog:+$("cpaTarCog").value,sog:+$("cpaTarSog").value};
  if(Object.values(o).concat(Object.values(t)).some(v=>!Number.isFinite(v)))return;
  const r=localXY(t.lat,t.lon,o.lat,o.lon),vo=velocity(o.cog,o.sog),vt=velocity(t.cog,t.sog),rv={x:vt.x-vo.x,y:vt.y-vo.y};
  const vv=rv.x**2+rv.y**2,tcpa=vv>1e-9?-(r.x*rv.x+r.y*rv.y)/vv:Infinity;
  const cpaT=Math.max(0,tcpa),cx=r.x+rv.x*cpaT,cy=r.y+rv.y*cpaT,cpa=Math.hypot(cx,cy),range=Math.hypot(r.x,r.y);
  $("cpaRange").textContent=`${fmt(range,2)} NM`;$("cpaValue").textContent=`${fmt(cpa,2)} NM`;
  $("tcpaValue").textContent=Number.isFinite(tcpa)?`${fmt(tcpa*60,0)} min`:"No relative motion";
  $("cpaStatus").textContent=!Number.isFinite(tcpa)?"Parallel":tcpa<0?"Opening":cpa<1?"Close approach":"Approach";
});

// ---------- UKC ----------
$("calculateUkc").addEventListener("click",()=>{
  const depth=+$("ukcDepth").value,tide=+$("ukcTide").value,draft=+$("ukcDraft").value,squat=+$("ukcSquat").value,heel=+$("ukcHeel").value,wave=+$("ukcWave").value,req=+$("ukcRequired").value,pct=+$("ukcPercent").value;
  const vals=[depth,tide,draft,squat,heel,wave,req,pct];if(vals.some(v=>!Number.isFinite(v)))return;
  const water=depth+tide,dynamic=draft+squat+heel+wave,avail=water-dynamic,required=Math.max(req,draft*pct/100),margin=avail-required;
  $("ukcWaterDepth").textContent=`${fmt(water,2)} m`;$("ukcDynamicDraft").textContent=`${fmt(dynamic,2)} m`;$("ukcAvailable").textContent=`${fmt(avail,2)} m`;$("ukcMargin").textContent=`${fmt(margin,2)} m`;
  const box=$("ukcResult"); box.className=`notice ${margin>=0?"success":"danger"}`; box.innerHTML=margin>=0?`<strong>Calculated UKC meets the entered requirement.</strong> Required UKC: ${fmt(required,2)} m.`:`<strong>Calculated UKC is below the entered requirement.</strong> Shortfall: ${fmt(Math.abs(margin),2)} m.`;
});

// ---------- Voyage ----------
function calcVoy(){
  const d=+$("voyDistance").value,s=+$("voySpeed").value,c=+$("voyConsumption").value,r=+$("voyReserve").value;
  if([d,s,c,r].some(v=>!Number.isFinite(v))||s<=0)return;
  const h=d/s,f=c*h/24,res=f*r/100,total=f+res;
  $("voyTimeOut").textContent=formatDuration(h);$("voyFuelOut").textContent=`${fmt(f,2)} m³`;$("voyReserveOut").textContent=`${fmt(res,2)} m³`;$("voyTotalOut").textContent=`${fmt(total,2)} m³`;
}
$("calculateVoyage").addEventListener("click",calcVoy);
$("useRouteDistance").addEventListener("click",()=>{$("voyDistance").value=routeMetrics().total.toFixed(1);calcVoy()});

// ---------- Kystverket warnings ----------
const demoWarnings=[
  {title:"DEMO — Navigation warning near planned route",description:"Demonstration item. Replace with live Kystverket data when available.",lat:59.0,lon:10.2,id:"DEMO-001"},
  {title:"DEMO — Temporary marine activity",description:"Demonstration item for route corridor testing.",lat:58.6,lon:9.8,id:"DEMO-002"}
];
async function loadWarnings(type="coastal", silent=false){
  const endpoint=type==="navarea"?"https://api.kystverket.no/data/navigationwarnings/navareaxix/":"https://api.kystverket.no/data/navigationwarnings/coastal/";
  if(state.settings.dataMode==="demo") return {items:demoWarnings,live:false};
  try{
    const r=await fetch(endpoint);if(!r.ok)throw new Error(`HTTP ${r.status}`);const data=await r.json();
    const arr=Array.isArray(data)?data:(data.items||data.features||[]);
    return {items:arr,live:true};
  }catch(e){if(!silent)$("warningStatus").textContent=`Live request unavailable (${e.message}). Showing demonstration data.`;return {items:demoWarnings,live:false};}
}
function warningText(w,i){
  const p=w.properties||w;
  return {title:p.title||p.name||p.warningTitle||p.navwarnTitle||p.id||`Warning ${i+1}`,desc:p.description||p.text||p.message||p.warningText||"See source data for details."};
}
async function renderWarnings(type){
  $("warningStatus").textContent="Loading…";const {items,live}=await loadWarnings(type);
  $("dataModeBadge").className=`status-badge ${live?"live":"demo"}`;$("dataModeBadge").textContent=live?"Live data":"Demo data";
  $("warningStatus").textContent=live?`Loaded ${items.length} live warning record(s) from Kystverket.`:`Showing ${items.length} demonstration record(s).`;
  $("warningList").classList.remove("empty-state");$("warningList").innerHTML=items.slice(0,50).map((w,i)=>{const t=warningText(w,i);return `<div class="result-item"><span class="result-dot ${live?"warn":""}"></span><div><h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.desc)}</p></div><small>${live?"LIVE":"DEMO"}</small></div>`}).join("");
}
$("loadCoastalWarnings").addEventListener("click",()=>renderWarnings("coastal"));$("loadNavareaWarnings").addEventListener("click",()=>renderWarnings("navarea"));

// ---------- Route Intelligence ----------
function distPointToSegmentNm(p,a,b){
  const lat0=(a.lat+b.lat+p.lat)/3, A=localXY(a.lat,a.lon,lat0,0),B=localXY(b.lat,b.lon,lat0,0),P=localXY(p.lat,p.lon,lat0,0);
  const vx=B.x-A.x,vy=B.y-A.y,wx=P.x-A.x,wy=P.y-A.y,c2=vx*vx+vy*vy;
  const t=c2?clamp((wx*vx+wy*vy)/c2,0,1):0;return Math.hypot(P.x-(A.x+t*vx),P.y-(A.y+t*vy));
}
function routeDistanceToPoint(p){let best=Infinity;for(let i=1;i<state.route.length;i++)best=Math.min(best,distPointToSegmentNm(p,state.route[i-1],state.route[i]));return best}
async function getProxy(path){
  const base=state.settings.proxyUrl.replace(/\/$/,""); if(!base)throw new Error("Proxy URL not configured");
  const r=await fetch(base+path);if(!r.ok)throw new Error(`Proxy HTTP ${r.status}`);return r.json();
}
function demoForecast(){
  return state.route.map((p,i)=>({lat:p.lat,lon:p.lon,hs:1.1+(i%3)*.8,windKn:14+(i%4)*5,currentKn:.2+(i%2)*.25,time:new Date().toISOString()}));
}
function demoAis(){
  if(state.route.length<2)return[];const a=state.route[0],b=state.route[Math.min(1,state.route.length-1)];
  return [{name:"DEMO TARGET",latitude:(a.lat+b.lat)/2+.02,longitude:(a.lon+b.lon)/2+.02,speedOverGround:11.2,courseOverGround:210,mmsi:999000001}];
}
async function getForecast(){if(state.settings.dataMode==="demo"||!state.settings.proxyUrl)return {items:demoForecast(),live:false};try{return{items:await getProxy("/api/forecast?route="+encodeURIComponent(JSON.stringify(state.route))),live:true}}catch{return{items:demoForecast(),live:false}}}
async function getAis(){if(state.settings.dataMode==="demo"||!state.settings.proxyUrl)return{items:demoAis(),live:false};try{return{items:await getProxy("/api/ais/latest"),live:true}}catch{return{items:demoAis(),live:false}}}
function extractWarningPoint(w){
  const p=w.properties||w;if(Number.isFinite(+p.lat)&&Number.isFinite(+p.lon))return{lat:+p.lat,lon:+p.lon};
  if(Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude))return{lat:+p.latitude,lon:+p.longitude};
  if(w.geometry?.type==="Point")return{lat:+w.geometry.coordinates[1],lon:+w.geometry.coordinates[0]};return null;
}
$("runIntelligence").addEventListener("click",async()=>{
  if(state.route.length<2){$("intelResults").textContent="Create at least two waypoints in Passage Planner first.";return}
  $("intelResults").className="result-list";$("intelResults").innerHTML='<div class="empty-state">Analysing route…</div>';
  const maxHs=+$("intelMaxHs").value,maxWind=+$("intelMaxWind").value,corridor=+$("intelCorridor").value;
  const [f,a,w]=await Promise.all([getForecast(),getAis(),loadWarnings("coastal",true)]);
  const forecasts=Array.isArray(f.items)?f.items:[],ais=Array.isArray(a.items)?a.items:[],warnings=Array.isArray(w.items)?w.items:[];
  const wxExceeded=forecasts.filter(x=>(+x.hs>maxHs)||(+x.windKn>maxWind));
  const nearbyAis=ais.filter(x=>Number.isFinite(+x.latitude)&&Number.isFinite(+x.longitude)&&routeDistanceToPoint({lat:+x.latitude,lon:+x.longitude})<=corridor);
  const nearbyWarn=warnings.map((x,i)=>({raw:x,p:extractWarningPoint(x),i})).filter(x=>x.p&&routeDistanceToPoint(x.p)<=corridor);
  $("intelWeatherMetric").textContent=wxExceeded.length?`${wxExceeded.length} exceedance(s)`:"Within entered limits";
  $("intelAisMetric").textContent=`${nearbyAis.length} target(s) in corridor`;
  $("intelWarnMetric").textContent=`${nearbyWarn.length} warning(s) in corridor`;
  $("intelRouteMetric").textContent=`${fmt(routeMetrics().total,1)} NM`;
  const results=[
    {level:wxExceeded.length?"warn":"good",title:"Weather thresholds",text:wxExceeded.length?`${wxExceeded.length} forecast point(s) exceed Hs ${maxHs} m or wind ${maxWind} kn.`:"No forecast points exceeded the entered limits.",src:f.live?"LIVE":"DEMO"},
    {level:nearbyAis.length?"warn":"good",title:"AIS route corridor",text:`${nearbyAis.length} vessel target(s) found within ${corridor} NM of the route geometry. This is not a COLREG assessment.`,src:a.live?"LIVE":"DEMO"},
    {level:nearbyWarn.length?"warn":"good",title:"Navigation warnings",text:`${nearbyWarn.length} geolocated warning(s) found within ${corridor} NM of the route.`,src:w.live?"LIVE":"DEMO"},
    {level:"good",title:"Route summary",text:`${state.route.length} waypoints, ${fmt(routeMetrics().total,1)} NM planned distance.`,src:"LOCAL"}
  ];
  $("intelResults").innerHTML=results.map(r=>`<div class="result-item"><span class="result-dot ${r.level}"></span><div><h4>${r.title}</h4><p>${r.text}</p></div><small>${r.src}</small></div>`).join("");
});

// ---------- ORB ----------
$("orbGenerate").addEventListener("click",()=>{
  const vals={date:$("orbDate").value,start:$("orbStart").value,end:$("orbEnd").value,place:$("orbPlace").value.trim(),grade:$("orbGrade").value.trim(),qty:+$("orbQty").value,density:$("orbDensity").value,sulfur:$("orbSulfur").value,tanks:$("orbTanks").value.trim()};
  const missing=[];["date","place","grade"].forEach(k=>{if(!vals[k])missing.push(k)});if(!Number.isFinite(vals.qty))missing.push("quantity");
  const lines=["H. BUNKERING OF FUEL OIL","",`Date: ${vals.date||"[date]"}`,`Place: ${vals.place||"[place]"}`];
  if(vals.start||vals.end)lines.push(`Time: ${vals.start||"[start]"} – ${vals.end||"[end]"}`);
  lines.push(`Fuel grade: ${vals.grade||"[grade]"}`,`Quantity received: ${Number.isFinite(vals.qty)?fmt(vals.qty,2):"[quantity]"} m³`);
  if(vals.density)lines.push(`Density: ${vals.density} kg/m³`);if(vals.sulfur)lines.push(`Sulfur content: ${vals.sulfur} % m/m`);
  lines.push("","Tank distribution:",vals.tanks||"[tank distribution]","","DRAFT ONLY — verify wording, numbering and required particulars against the vessel's approved Oil Record Book, MARPOL Annex I and company procedures before making an official entry.");
  $("orbOutput").value=lines.join("\n");
  const v=$("orbValidation");v.textContent=missing.length?`Missing: ${missing.join(", ")}`:"Draft fields complete";v.className=`validation-pill ${missing.length?"warn":"good"}`;
});
$("orbCopy").addEventListener("click",async()=>{if(!$("orbOutput").value)return;try{await navigator.clipboard.writeText($("orbOutput").value)}catch{$("orbOutput").select();document.execCommand("copy")}});

// ---------- Bunker planner ----------
const tbody=document.querySelector("#tankTable tbody");
function addTankRow(name="",cap="",before=""){
  const tr=document.createElement("tr");tr.innerHTML=`<td><input class="tank-name" value="${name}"></td><td><input class="tank-cap" type="number" step="0.01" value="${cap}"></td><td><input class="tank-before" type="number" step="0.01" value="${before}"></td><td class="tank-avail">—</td><td class="tank-transfer">—</td><td class="tank-after">—</td><td class="tank-pct">—</td>`;tbody.appendChild(tr);
}
addTankRow("Tank 1");addTankRow("Tank 2");$("addTank").addEventListener("click",()=>addTankRow(`Tank ${tbody.children.length+1}`));
$("calculateBunker").addEventListener("click",()=>{
  const requested=+$("bpRequested").value,maxFill=+$("bpMaxFill").value/100,rows=[...tbody.querySelectorAll("tr")];
  if(!Number.isFinite(requested)||requested<0||!Number.isFinite(maxFill)||maxFill<=0||maxFill>1)return;
  const tanks=rows.map(row=>{const cap=+row.querySelector(".tank-cap").value,before=+row.querySelector(".tank-before").value;return{row,cap,before,avail:Math.max(0,cap*maxFill-before),transfer:0}});
  if(tanks.some(t=>!Number.isFinite(t.cap)||t.cap<=0||!Number.isFinite(t.before)||t.before<0)){alert("Complete all tank capacities and before-volumes.");return}
  const totalAvail=tanks.reduce((s,t)=>s+t.avail,0),plan=Math.min(requested,totalAvail);
  tanks.forEach(t=>t.transfer=totalAvail?plan*(t.avail/totalAvail):0);
  tanks.forEach(t=>{const after=t.before+t.transfer;t.row.querySelector(".tank-avail").textContent=fmt(t.avail);t.row.querySelector(".tank-transfer").textContent=fmt(t.transfer);t.row.querySelector(".tank-after").textContent=fmt(after);t.row.querySelector(".tank-pct").textContent=`${fmt(after/t.cap*100,1)} %`});
  $("bunkerResult").innerHTML=`<div class="metric"><span>Requested</span><strong>${fmt(requested)} m³</strong></div><div class="metric"><span>Planned</span><strong>${fmt(plan)} m³</strong></div><div class="metric"><span>Safe capacity</span><strong>${fmt(totalAvail)} m³</strong></div><div class="metric"><span>Unallocated</span><strong>${fmt(Math.max(0,requested-plan))} m³</strong></div>`;
});

// ---------- Fuel / Generator ----------
$("calculateFuel").addEventListener("click",()=>{const v=+$("fuelVolume").value,d=+$("fuelDensity").value;if(!Number.isFinite(v)||!Number.isFinite(d)||d<=0)return;const kg=v*d;
  $("fuelResult").innerHTML=`<div class="metric"><span>Volume</span><strong>${fmt(v,3)} m³</strong></div><div class="metric"><span>Mass</span><strong>${fmt(kg,1)} kg</strong></div><div class="metric"><span>Tonnes</span><strong>${fmt(kg/1000,3)} t</strong></div><div class="metric"><span>Density</span><strong>${fmt(d,1)} kg/m³</strong></div>`;
});
$("calculateGenerator").addEventListener("click",()=>{const v=+$("genVoltage").value,a=+$("genCurrent").value,pf=+$("genPf").value,r=+$("genRated").value;if([v,a,pf].some(x=>!Number.isFinite(x))||v<=0||a<0||pf<0||pf>1)return;const kva=Math.sqrt(3)*v*a/1000,kw=kva*pf,load=r>0?kw/r*100:NaN;
  $("generatorResult").innerHTML=`<div class="metric"><span>Apparent power</span><strong>${fmt(kva)} kVA</strong></div><div class="metric"><span>Active power</span><strong>${fmt(kw)} kW</strong></div><div class="metric"><span>Power factor</span><strong>${fmt(pf,2)}</strong></div><div class="metric"><span>Generator load</span><strong>${Number.isFinite(load)?fmt(load,1)+" %":"—"}</strong></div>`;
});

// ---------- Unit converter ----------
const units={
  speed:{kn:1,"km/h":1.852,"m/s":0.514444},
  distance:{NM:1,km:1.852,m:1852},
  pressure:{bar:1,kPa:100,psi:14.5037738},
  power:{kW:1,hp:1.34102209,PS:1.35962162},
  volume:{"m³":1,L:1000}
};
function fillUnits(){const u=Object.keys(units[$("unitCategory").value]);$("unitFrom").innerHTML=u.map(x=>`<option>${x}</option>`).join("");$("unitTo").innerHTML=u.map((x,i)=>`<option ${i===1?"selected":""}>${x}</option>`).join("")}
$("unitCategory").addEventListener("change",fillUnits);fillUnits();
$("convertUnit").addEventListener("click",()=>{const cat=$("unitCategory").value,val=+$("unitValue").value,from=$("unitFrom").value,to=$("unitTo").value;if(!Number.isFinite(val))return;const base=val/units[cat][from],out=base*units[cat][to];
  $("unitResult").innerHTML=`<div class="metric"><span>Input</span><strong>${fmt(val,4)} ${from}</strong></div><div class="metric"><span>Converted</span><strong>${fmt(out,4)} ${to}</strong></div>`;
});

// ---------- Settings ----------
$("proxyUrl").value=state.settings.proxyUrl;$("dataMode").value=state.settings.dataMode;
$("saveSettings").addEventListener("click",()=>{state.settings.proxyUrl=$("proxyUrl").value.trim();state.settings.dataMode=$("dataMode").value;localStorage.setItem("marineToolsProxyUrl",state.settings.proxyUrl);localStorage.setItem("marineToolsDataMode",state.settings.dataMode);$("proxyStatus").textContent="Settings saved in this browser."});
$("testProxy").addEventListener("click",async()=>{try{const j=await getProxy("/api/health");$("proxyStatus").textContent=`Proxy reachable: ${j.status||"OK"}`;$("dataModeBadge").className="status-badge live";$("dataModeBadge").textContent="Live-capable"}catch(e){$("proxyStatus").textContent=`Proxy test failed: ${e.message}`}});
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

initMap();updateRoute();calcVoy();
