const TOKEN_URL="https://id.barentswatch.no/connect/token";
const AIS_LATEST_URL="https://live.ais.barentswatch.no/v1/latest/combined";
const BW_API_ROOT="https://www.barentswatch.no/bwapi/";
const MET_LOCATION_URL="https://api.met.no/weatherapi/locationforecast/2.0/compact";
const MET_OCEAN_URL="https://api.met.no/weatherapi/oceanforecast/2.0/complete";
const MET_USER_AGENT="MarineTools/8.5 contact@marinetools.app";
let metCache=new Map();

const ENDPOINTS={wave:"v1/waveforecastpoint/nearest/all",wind:"v1/windforecastpoint/nearest/all",current:"v1/seacurrent/nearest/all"};
let tokenCache={},forecastCache=new Map(),paramStyle={};
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}});

async function getToken(scope,env){
 const c=tokenCache[scope];if(c&&c.expires>Date.now()+60000)return c.value;
 const id=scope==="ais"?env.BW_AIS_CLIENT_ID:env.BW_API_CLIENT_ID,secret=scope==="ais"?env.BW_AIS_CLIENT_SECRET:env.BW_API_CLIENT_SECRET;
 if(!id||!secret)throw new Error(`Missing ${scope.toUpperCase()} credentials in Worker secrets`);
 const body=new URLSearchParams({grant_type:"client_credentials",client_id:id,client_secret:secret,scope});
 const r=await fetch(TOKEN_URL,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
 if(!r.ok){const d=await r.text().catch(()=>"");throw new Error(`BarentsWatch ${scope} token request failed (${r.status})${d?`: ${d.slice(0,240)}`:""}`)}
 const j=await r.json();tokenCache[scope]={value:j.access_token,expires:Date.now()+(j.expires_in||3600)*1000};return j.access_token;
}
async function authStatus(env){
 const result={ais:{configured:Boolean(env.BW_AIS_CLIENT_ID&&env.BW_AIS_CLIENT_SECRET),authenticated:false},api:{configured:Boolean(env.BW_API_CLIENT_ID&&env.BW_API_CLIENT_SECRET),authenticated:false}};
 for(const s of ["ais","api"]){try{if(result[s].configured){await getToken(s,env);result[s].authenticated=true}}catch(e){result[s].error=e.message}}
 return result;
}
function parseBounds(url){const n=k=>Number(url.searchParams.get(k)),b={minLat:n("minLat"),maxLat:n("maxLat"),minLon:n("minLon"),maxLon:n("maxLon")};return Object.values(b).every(Number.isFinite)?b:null}
function inBounds(v,b){const lat=Number(v.latitude??v.lat),lon=Number(v.longitude??v.lon);return Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=b.minLat&&lat<=b.maxLat&&lon>=b.minLon&&lon<=b.maxLon}
async function latestAis(url,env){
 const access=await getToken("ais",env),r=await fetch(AIS_LATEST_URL,{headers:{authorization:`Bearer ${access}`}});
 if(!r.ok){const d=await r.text().catch(()=>"");throw new Error(`AIS latest request failed (${r.status})${d?`: ${d.slice(0,240)}`:""}`)}
 const all=await r.json();if(!Array.isArray(all))return all;const b=parseBounds(url);return b?all.filter(v=>inBounds(v,b)):all;
}

function extractItems(data){
 if(Array.isArray(data))return data;
 if(!data||typeof data!=="object")return [];
 for(const k of ["items","data","forecasts","forecast","values","results"]){if(Array.isArray(data[k]))return data[k]}
 for(const v of Object.values(data)){if(Array.isArray(v)&&v.some(x=>x&&typeof x==="object"))return v}
 return [data];
}
function flatten(obj,prefix="",out={}){
 if(obj==null)return out;
 if(Array.isArray(obj)){obj.slice(0,12).forEach((v,i)=>flatten(v,`${prefix}[${i}]`,out));return out}
 if(typeof obj==="object"){for(const [k,v] of Object.entries(obj))flatten(v,prefix?`${prefix}.${k}`:k,out);return out}
 out[prefix]=obj;return out;
}
function matchNumber(flat,patterns){for(const [k,v] of Object.entries(flat)){const n=Number(v);if(!Number.isFinite(n))continue;if(patterns.some(p=>p.test(k)))return{key:k,value:n}}return null}
function matchText(flat,patterns){for(const [k,v] of Object.entries(flat)){if(typeof v!=="string")continue;if(patterns.some(p=>p.test(k)))return{key:k,value:v}}return null}
function parseTime(flat){
 const hit=matchText(flat,[/forecast.*time/i,/valid.*time/i,/timestamp/i,/date.*time/i,/(^|\.)time$/i,/(^|\.)date$/i]);
 if(!hit)return null;const ms=Date.parse(hit.value);return Number.isFinite(ms)?new Date(ms).toISOString():hit.value;
}
function speedToKn(hit,flat){
 if(!hit)return null;
 const units=Object.entries(flat).filter(([k,v])=>/unit/i.test(k)&&typeof v==="string").map(([,v])=>v.toLowerCase()).join(" ");
 const key=hit.key.toLowerCase();
 if(/knot|\bkn\b/.test(units)||/knot|(^|\.)kn($|\.)/.test(key))return hit.value;
 if(/km\/?h|kph|kilomet/.test(units)||/kph|kmh/.test(key))return hit.value*0.539957;
 if(/m\/?s|mps|metre.*second|meter.*second/.test(units)||/mps|meterpersecond|metrespersecond/.test(key))return hit.value*1.943844;
 // BarentsWatch Waveforecast point-speed fields use SI speed values when the unit is not repeated in each JSON item.
 return hit.value*1.943844;
}
function normalizeItem(kind,item){
 const flat=flatten(item),time=parseTime(flat);
 if(kind==="wave"){
   const hs=matchNumber(flat,[/significant.*wave.*height/i,/total.*wave.*height/i,/wave.*height/i,/waveheight/i,/(^|\.)hs$/i]);
   return{forecastTime:time,hs:hs?.value??null,rawKey:hs?.key||null};
 }
 if(kind==="wind"){
   const sp=matchNumber(flat,[/wind.*speed/i,/windspeed/i,/speed.*wind/i,/velocity/i,/(^|\.)speed$/i]),dir=matchNumber(flat,[/wind.*direction/i,/winddirection/i,/direction.*wind/i,/(^|\.)direction$/i]);
   return{forecastTime:time,windKn:speedToKn(sp,flat),windRaw:sp?.value??null,windDirection:dir?.value??null,rawKey:sp?.key||null};
 }
 const sp=matchNumber(flat,[/current.*speed/i,/currentspeed/i,/speed.*current/i,/velocity/i,/(^|\.)speed$/i]),dir=matchNumber(flat,[/current.*direction/i,/currentdirection/i,/direction.*current/i,/(^|\.)direction$/i]);
 return{forecastTime:time,currentKn:speedToKn(sp,flat),currentRaw:sp?.value??null,currentDirection:dir?.value??null,rawKey:sp?.key||null};
}
function normalizeSeries(kind,raw){
 return extractItems(raw).map(x=>normalizeItem(kind,x)).filter(x=>x.forecastTime||x.hs!=null||x.windKn!=null||x.currentKn!=null).sort((a,b)=>{
   const aa=Date.parse(a.forecastTime||"")||0,bb=Date.parse(b.forecastTime||"")||0;return aa-bb;
 });
}
async function bwSeries(kind,lat,lon,env){
 const key=`series:${kind}:${lat.toFixed(3)}:${lon.toFixed(3)}`,cached=forecastCache.get(key);if(cached&&cached.expires>Date.now())return cached.data;
 const access=await getToken("api",env),path=ENDPOINTS[kind],styles=paramStyle[kind]?[paramStyle[kind]]:["latitude","lat","coords"];
 let lastStatus=0,lastBody="";
 for(const style of styles){
   const qs=new URLSearchParams();if(style==="latitude"){qs.set("latitude",String(lat));qs.set("longitude",String(lon))}else if(style==="lat"){qs.set("lat",String(lat));qs.set("lon",String(lon))}else{qs.set("coordinates",`${lon},${lat}`)}
   const r=await fetch(`${BW_API_ROOT}${path}?${qs}`,{headers:{authorization:`Bearer ${access}`,accept:"application/json"}});lastStatus=r.status;const text=await r.text();lastBody=text;
   if(r.ok){paramStyle[kind]=style;let raw;try{raw=JSON.parse(text)}catch{raw=text}const series=normalizeSeries(kind,raw),data={ok:true,kind,endpoint:path,style,series};forecastCache.set(key,{data,expires:Date.now()+5*60*1000});return data}
 }
 return{ok:false,kind,endpoint:path,status:lastStatus,error:lastBody.slice(0,240),series:[]};
}
function bestNow(series){
 if(!Array.isArray(series)||!series.length)return{};const now=Date.now()-30*60*1000;
 const timed=series.filter(x=>Number.isFinite(Date.parse(x.forecastTime||"")));
 if(!timed.length)return series[0];
 return timed.find(x=>Date.parse(x.forecastTime)>=now)||timed[timed.length-1];
}
function nearest(series,time){
 if(!series?.length)return{};const target=Date.parse(time||"");if(!Number.isFinite(target))return bestNow(series);
 let best=null,d=Infinity;for(const row of series){const t=Date.parse(row.forecastTime||"");if(!Number.isFinite(t))continue;const q=Math.abs(t-target);if(q<d){d=q;best=row}}
 return d<=2*60*60*1000?(best||{}):{};
}
function routeSamples(route,max=8){if(!Array.isArray(route)||!route.length)return[];if(route.length<=max)return route;const out=[];for(let i=0;i<max;i++)out.push(route[Math.round(i*(route.length-1)/(max-1))]);return out}

async function fetchMet(url){
 const r=await fetch(url,{headers:{"user-agent":MET_USER_AGENT,"accept":"application/json"}});
 const text=await r.text();
 if(!r.ok)return{ok:false,status:r.status,error:text.slice(0,300),data:null};
 let data;try{data=JSON.parse(text)}catch{return{ok:false,status:r.status,error:"MET Norway returned invalid JSON",data:null}}
 return{ok:true,status:r.status,data};
}
function metTimeseries(data){return Array.isArray(data?.properties?.timeseries)?data.properties.timeseries:[]}
function detail(row,key){const v=row?.data?.instant?.details?.[key];return Number.isFinite(Number(v))?Number(v):null}
function periodDetail(row,key){
 for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){
   const v=row?.data?.[p]?.details?.[key];if(Number.isFinite(Number(v)))return Number(v);
 }
 return null;
}
function periodSummary(row,key){
 for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){
   const v=row?.data?.[p]?.summary?.[key];if(v!=null)return v;
 }
 return null;
}
function msToKn(v){return v==null?null:v*1.943844}
function nearestMetRow(rows,time,maxMs=90*60*1000){
 if(!Array.isArray(rows)||!rows.length)return null;
 const target=Date.parse(time||"");if(!Number.isFinite(target))return rows[0]||null;
 let best=null,d=Infinity;
 for(const row of rows){const t=Date.parse(row?.time||"");if(!Number.isFinite(t))continue;const q=Math.abs(t-target);if(q<d){d=q;best=row}}
 return d<=maxMs?best:null;
}
async function metPoint(lat,lon){
 const lat4=lat.toFixed(4),lon4=lon.toFixed(4),key=`met:${lat4}:${lon4}`,cached=metCache.get(key);
 if(cached&&cached.expires>Date.now())return cached.data;
 const q=`lat=${encodeURIComponent(lat4)}&lon=${encodeURIComponent(lon4)}`;
 const [location,ocean]=await Promise.all([fetchMet(`${MET_LOCATION_URL}?${q}`),fetchMet(`${MET_OCEAN_URL}?${q}`)]);
 const data={location,ocean,locationRows:location.ok?metTimeseries(location.data):[],oceanRows:ocean.ok?metTimeseries(ocean.data):[]};
 metCache.set(key,{data,expires:Date.now()+10*60*1000});return data;
}
function metRowCombined(locationRow,oceanRow){
 const windMs=detail(locationRow,"wind_speed"),currentMs=detail(oceanRow,"sea_water_speed");
 return{
   forecastTime:locationRow?.time||oceanRow?.time||null,
   hs:detail(oceanRow,"sea_surface_wave_height"),
   waveDirection:detail(oceanRow,"sea_surface_wave_from_direction"),
   windKn:msToKn(windMs),
   windDirection:detail(locationRow,"wind_from_direction"),
   currentKn:msToKn(currentMs),
   currentDirection:detail(oceanRow,"sea_water_to_direction"),
   airTemp:detail(locationRow,"air_temperature"),
   seaTemp:detail(oceanRow,"sea_water_temperature"),
   precipitation:periodDetail(locationRow,"precipitation_amount"),
   symbolCode:periodSummary(locationRow,"symbol_code"),
   source:"MET Norway"
 };
}
function selectFutureRows(rows,limit){
 const now=Date.now()-45*60*1000;
 const future=rows.filter(r=>{const t=Date.parse(r?.time||"");return Number.isFinite(t)&&t>=now});
 return (future.length?future:rows).slice(0,limit);
}
async function weather(url){
 const lat=Number(url.searchParams.get("lat")),lon=Number(url.searchParams.get("lon")),limit=Math.max(1,Math.min(24,Number(url.searchParams.get("limit"))||12));
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return{error:"Invalid latitude/longitude"};
 const d=await metPoint(lat,lon);
 const base=d.locationRows.length?selectFutureRows(d.locationRows,limit):selectFutureRows(d.oceanRows,limit);
 const forecast=base.map(row=>{
   const time=row?.time||null;
   const locationRow=d.locationRows.length?(d.locationRows.includes(row)?row:nearestMetRow(d.locationRows,time)):null;
   const oceanRow=d.oceanRows.length?(d.oceanRows.includes(row)?row:nearestMetRow(d.oceanRows,time)):null;
   return metRowCombined(locationRow,oceanRow);
 });
 return{
   lat,lon,forecast,
   diagnostics:{
     location:{ok:d.location.ok,status:d.location.ok?"ok":d.location.status,count:d.locationRows.length,error:d.location.error||null},
     ocean:{ok:d.ocean.ok,status:d.ocean.ok?"ok":d.ocean.status,count:d.oceanRows.length,error:d.ocean.error||null}
   }
 };
}
async function forecast(url){
 const raw=url.searchParams.get("route"),route=raw?JSON.parse(raw):[];if(!Array.isArray(route))return[];
 const pts=routeSamples(route,8);
 return Promise.all(pts.map(async(p,i)=>{
   const lat=Number(p.lat),lon=Number(p.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return{index:i,source:"invalid-point"};
   const d=await metPoint(lat,lon),l=selectFutureRows(d.locationRows,1)[0]||null,o=nearestMetRow(d.oceanRows,l?.time)||selectFutureRows(d.oceanRows,1)[0]||null,f=metRowCombined(l,o);
   return{index:i,name:p.name||`P${i+1}`,lat,lon,...f,diagnostics:{location:d.location.ok?"ok":d.location.status,ocean:d.ocean.ok?"ok":d.ocean.status}};
 }))
}
const ALLOWED={wave:ENDPOINTS.wave,wind:ENDPOINTS.wind,current:ENDPOINTS.current};
async function probe(url,env){const kind=url.searchParams.get("endpoint"),path=ALLOWED[kind];if(!path)return{error:"Unsupported endpoint",allowed:Object.keys(ALLOWED)};const access=await getToken("api",env),qs=new URLSearchParams(url.searchParams);qs.delete("endpoint");const r=await fetch(`${BW_API_ROOT}${path}${qs.toString()?`?${qs}`:""}`,{headers:{authorization:`Bearer ${access}`,accept:"application/json"}});const text=await r.text();let body;try{body=JSON.parse(text)}catch{body=text}return{upstreamStatus:r.status,endpoint:path,data:body}}



const ADMIN_DASHBOARD_HTML="<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<meta name=\"theme-color\" content=\"#061724\">\n<title>Marine Tools — Private Analytics</title>\n<style>\n:root{--bg:#061724;--panel:#0b2334;--panel2:#0d2b40;--line:#1d4259;--text:#eef7fb;--muted:#8faabd;--cyan:#28c4f4;--blue:#159fe4;--green:#32d48a;--amber:#f2bf49;--red:#ff625d}\n*{box-sizing:border-box}\nbody{margin:0;background:linear-gradient(180deg,#061724,#071b29);color:var(--text);font:14px/1.45 \"Segoe UI\",Inter,Arial,sans-serif;min-height:100vh}\nbutton{font:inherit}.shell{max-width:1500px;margin:auto;padding:22px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}\n.brand{display:flex;align-items:center;gap:12px}.brand img{width:46px;height:46px;border-radius:10px}.brand h1{font-size:22px;margin:0}.brand p{margin:2px 0 0;color:var(--muted);font-size:12px}\n.right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:#092133;border-radius:999px;padding:7px 10px;color:#bcd0dc;font-size:12px}\n.range{display:flex;gap:6px}.range button,.refresh{border:1px solid #285871;background:#0a2639;color:#cde0eb;border-radius:8px;padding:8px 11px;cursor:pointer}.range button.active{background:#0b76bd;border-color:#2bc2f2;color:white}\n.banner{border:1px solid #24546f;background:#092235;border-radius:12px;padding:12px 14px;color:#b7cdda;margin-bottom:14px}\n.cards{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:10px;margin-bottom:12px}.card,.panel{background:linear-gradient(180deg,var(--panel),#091f30);border:1px solid var(--line);border-radius:13px}\n.card{padding:14px}.card small{display:block;color:var(--muted);margin-bottom:6px}.card strong{font-size:26px;font-variant-numeric:tabular-nums}.delta{font-size:11px;margin-top:5px}.delta.up{color:var(--green)}.delta.down{color:var(--red)}.delta.flat{color:var(--muted)}\n.grid{display:grid;grid-template-columns:1.35fr 1fr;gap:12px}.panel{padding:14px}.panel h2{font-size:15px;margin:0 0 12px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.chart{height:270px;position:relative;border-top:1px solid #15384d;border-bottom:1px solid #15384d;background:repeating-linear-gradient(0deg,transparent,transparent 53px,#113247 54px)}\n.chart svg{width:100%;height:100%;overflow:visible}.legend{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-top:9px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}.sessions{background:var(--cyan)}.views{background:var(--green)}.tools{background:var(--amber)}\n.tables{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #173e56}th{font-size:10px;color:#7898ab;text-transform:uppercase;letter-spacing:.06em}td:last-child,th:last-child{text-align:right}\n.bar{height:7px;border-radius:999px;background:#102d41;overflow:hidden;min-width:70px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#159fe4,#28c4f4)}\n.status{padding:14px;text-align:center;color:var(--muted)}.error{color:#ff9a95}.empty{color:#7898ab;font-style:italic}.footer{display:flex;justify-content:space-between;gap:12px;color:#6f8da0;font-size:11px;margin-top:18px;padding:10px 2px}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}\n@media(max-width:1050px){.cards{grid-template-columns:repeat(3,1fr)}.grid{grid-template-columns:1fr}.tables{grid-template-columns:1fr 1fr}}\n@media(max-width:650px){.shell{padding:12px}.top{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:repeat(2,1fr)}.tables{grid-template-columns:1fr}.card strong{font-size:22px}}\n</style>\n</head>\n<body>\n<div class=\"shell\">\n <div class=\"top\">\n  <div class=\"brand\"><img src=\"https://www.marinetools.app/assets/icon-192.png\" alt=\"Marine Tools\"><div><h1>Private Analytics</h1><p>Marine Tools · product usage dashboard</p></div></div>\n  <div class=\"right\"><span class=\"pill\" id=\"who\">Cloudflare Access</span><div class=\"range\"><button data-range=\"24h\" class=\"active\">24 h</button><button data-range=\"7d\">7 d</button><button data-range=\"30d\">30 d</button></div><button class=\"refresh\" id=\"refresh\">Refresh</button></div>\n </div>\n <div class=\"banner\">Anonymous product analytics only. Sessions are browser-tab sessions, not unique people. Visible time is measured while the page is visible. Calculation inputs, vessel profile, route coordinates and weather positions are not included.</div>\n <div class=\"cards\">\n  <div class=\"card\"><small>Sessions</small><strong id=\"sessions\">—</strong><div id=\"sessionsDelta\" class=\"delta flat\">—</div></div>\n  <div class=\"card\"><small>Page opens</small><strong id=\"pageViews\">—</strong><div id=\"pageViewsDelta\" class=\"delta flat\">—</div></div>\n  <div class=\"card\"><small>Tool uses</small><strong id=\"toolUses\">—</strong><div id=\"toolUsesDelta\" class=\"delta flat\">—</div></div>\n  <div class=\"card\"><small>Visible time</small><strong id=\"engaged\">—</strong><div id=\"engagedDelta\" class=\"delta flat\">—</div></div>\n  <div class=\"card\"><small>Avg visible / session</small><strong id=\"avgSession\">—</strong><div class=\"delta flat\">Visible-time estimate</div></div>\n  <div class=\"card\"><small>Page opens / session</small><strong id=\"pagesPerSession\">—</strong><div class=\"delta flat\">SPA navigation</div></div>\n </div>\n <div class=\"grid\">\n  <div class=\"panel\"><div class=\"panel-head\"><h2>Activity over time</h2><span class=\"pill mono\" id=\"periodLabel\">Last 24 hours</span></div><div class=\"chart\" id=\"chart\"><div class=\"status\">Loading…</div></div><div class=\"legend\"><span><i class=\"dot sessions\"></i>Sessions</span><span><i class=\"dot views\"></i>Page opens</span><span><i class=\"dot tools\"></i>Tool uses</span></div></div>\n  <div class=\"panel\"><h2>Most opened areas</h2><div id=\"pagesTable\" class=\"status\">Loading…</div></div>\n </div>\n <div class=\"tables\">\n  <div class=\"panel\"><h2>Most used tools</h2><div id=\"toolsTable\" class=\"status\">Loading…</div></div>\n  <div class=\"panel\"><h2>Visible time by area</h2><div id=\"engagementTable\" class=\"status\">Loading…</div></div>\n  <div class=\"panel\"><h2>Devices</h2><div id=\"devicesTable\" class=\"status\">Loading…</div></div>\n  <div class=\"panel\"><h2>App versions</h2><div id=\"versionsTable\" class=\"status\">Loading…</div></div>\n </div>\n <div class=\"footer\"><span>Marine Tools v8.5 analytics</span><span id=\"updated\">Not loaded</span></div>\n</div>\n<script>\n(function(){\n'use strict';\nvar currentRange='24h';\nvar labels={'24h':'Last 24 hours','7d':'Last 7 days','30d':'Last 30 days'};\nfunction $(id){return document.getElementById(id)}\nfunction num(v){return Number(v)||0}\nfunction fmt(n){return Math.round(num(n)).toLocaleString()}\nfunction duration(sec){sec=Math.max(0,Math.round(num(sec)));if(sec<60)return sec+'s';var m=Math.floor(sec/60),s=sec%60;if(m<60)return m+'m '+s+'s';var h=Math.floor(m/60);m%=60;return h+'h '+m+'m'}\nfunction delta(el,cur,prev){var node=$(el);cur=num(cur);prev=num(prev);if(prev===0){node.className='delta '+(cur>0?'up':'flat');node.textContent=cur>0?'New in this period':'No change';return}var p=((cur-prev)/prev)*100,arrow=p>0?'↑':p<0?'↓':'';node.className='delta '+(p>0?'up':p<0?'down':'flat');node.textContent=arrow+' '+Math.abs(p).toFixed(0)+'% vs previous period'}\nfunction escapeHtml(s){return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]})}\nfunction rowsTable(rows,nameKey,valueKey,formatter){if(!rows||!rows.length)return '<div class=\"empty\">No data in this period.</div>';var max=Math.max.apply(null,rows.map(function(r){return num(r[valueKey])}))||1;return '<table><thead><tr><th>Name</th><th>Share</th><th>Value</th></tr></thead><tbody>'+rows.map(function(r){var val=num(r[valueKey]),pct=Math.max(2,(val/max)*100);return '<tr><td>'+escapeHtml(r[nameKey]||'Unknown')+'</td><td><div class=\"bar\"><i style=\"width:'+pct.toFixed(1)+'%\"></i></div></td><td>'+(formatter?formatter(val):fmt(val))+'</td></tr>'}).join('')+'</tbody></table>'}\nfunction chart(data){var holder=$('chart');if(!data||!data.length){holder.innerHTML='<div class=\"status empty\">No timeline data in this period.</div>';return}var w=900,h=250,pad=22,max=1;data.forEach(function(d){max=Math.max(max,num(d.sessions),num(d.pageViews),num(d.toolUses))});function points(key){return data.map(function(d,i){var x=data.length===1?w/2:pad+i*((w-pad*2)/(data.length-1));var y=h-pad-(num(d[key])/max)*(h-pad*2);return x.toFixed(1)+','+y.toFixed(1)}).join(' ')}var ticks=data.map(function(d,i){if(data.length>12&&i%Math.ceil(data.length/8)!==0&&i!==data.length-1)return '';var x=data.length===1?w/2:pad+i*((w-pad*2)/(data.length-1));return '<text x=\"'+x.toFixed(1)+'\" y=\"'+(h-3)+'\" text-anchor=\"middle\" fill=\"#7898ab\" font-size=\"9\">'+escapeHtml(d.label)+'</text>'}).join('');holder.innerHTML='<svg viewBox=\"0 0 '+w+' '+h+'\" preserveAspectRatio=\"none\"><polyline fill=\"none\" stroke=\"#28c4f4\" stroke-width=\"3\" points=\"'+points('sessions')+'\"/><polyline fill=\"none\" stroke=\"#32d48a\" stroke-width=\"3\" points=\"'+points('pageViews')+'\"/><polyline fill=\"none\" stroke=\"#f2bf49\" stroke-width=\"3\" points=\"'+points('toolUses')+'\"/>'+ticks+'</svg>'}\nasync function load(){document.querySelectorAll('.range button').forEach(function(b){b.disabled=true});$('refresh').disabled=true;try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(currentRange),{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error('Dashboard API returned '+r.status);var d=await r.json();if(d.error)throw new Error(d.error);$('who').textContent=d.viewer||'Cloudflare Access';$('periodLabel').textContent=labels[currentRange];$('sessions').textContent=fmt(d.current.sessions);$('pageViews').textContent=fmt(d.current.pageViews);$('toolUses').textContent=fmt(d.current.toolUses);$('engaged').textContent=duration(d.current.engagedSeconds);$('avgSession').textContent=duration(d.current.avgEngagedSecondsPerSession);$('pagesPerSession').textContent=d.current.sessions?(d.current.pageViews/d.current.sessions).toFixed(1):'0.0';delta('sessionsDelta',d.current.sessions,d.previous.sessions);delta('pageViewsDelta',d.current.pageViews,d.previous.pageViews);delta('toolUsesDelta',d.current.toolUses,d.previous.toolUses);delta('engagedDelta',d.current.engagedSeconds,d.previous.engagedSeconds);$('pagesTable').innerHTML=rowsTable(d.pages,'page','views');$('toolsTable').innerHTML=rowsTable(d.tools,'tool','uses');$('engagementTable').innerHTML=rowsTable(d.engagementByPage,'page','seconds',duration);$('devicesTable').innerHTML=rowsTable(d.devices,'device','sessions');$('versionsTable').innerHTML=rowsTable(d.versions,'version','sessions');chart(d.timeline);$('updated').textContent='Updated '+new Date(d.generatedAt).toLocaleString()}catch(e){['pagesTable','toolsTable','engagementTable','devicesTable','versionsTable'].forEach(function(id){$(id).innerHTML='<div class=\"error\">'+escapeHtml(e.message)+'</div>'});$('chart').innerHTML='<div class=\"status error\">'+escapeHtml(e.message)+'</div>'}finally{document.querySelectorAll('.range button').forEach(function(b){b.disabled=false});$('refresh').disabled=false}}\ndocument.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){currentRange=b.getAttribute('data-range');document.querySelectorAll('.range button').forEach(function(x){x.classList.toggle('active',x===b)});load()})});\n$('refresh').addEventListener('click',load);load();\n})();\n</script>\n</body>\n</html>";
const ANALYTICS_DATASET="events.analyticsEngine.marine_tools_usage";

function adminAccessOk(request){
 return Boolean(request.headers.get("cf-access-jwt-assertion"));
}
function adminUnauthorized(api=false){
 const body={error:"Private analytics requires Cloudflare Access authentication."};
 if(api)return json(body,401);
 return new Response("<!doctype html><meta charset=utf-8><title>Marine Tools — Private Analytics</title><body style='font:16px system-ui;background:#061724;color:#eef7fb;padding:32px'><h1>Private analytics</h1><p>This dashboard is protected by Cloudflare Access.</p></body>",{status:401,headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store"}});
}
async function analyticsSql(env,query,params={}){
 if(!env.ANALYTICS_SQL)throw new Error("Analytics SQL binding is not configured");
 try{return await env.ANALYTICS_SQL.query({query,params})}catch(e){if(e?.retryable){await new Promise(r=>setTimeout(r,120));return env.ANALYTICS_SQL.query({query,params})}throw e}
}
function analyticsPeriod(range){
 const now=Date.now(),ms=range==="30d"?30*86400000:range==="7d"?7*86400000:86400000;
 const currentStart=new Date(now-ms).toISOString(),currentEnd=new Date(now).toISOString(),previousStart=new Date(now-ms*2).toISOString(),previousEnd=currentStart;
 return{range:range==="30d"?"30d":range==="7d"?"7d":"24h",currentStart,currentEnd,previousStart,previousEnd,bucket:range==="24h"?"hour":"day"};
}
function eventSummary(rows){
 const out={sessions:0,pageViews:0,toolUses:0,engagedSeconds:0};
 for(const r of rows||[]){const n=Number(r.event_count)||0,d=Number(r.duration)||0;if(r.event_name==="session_start")out.sessions=n;else if(r.event_name==="page_view")out.pageViews=n;else if(r.event_name==="tool_use")out.toolUses=n;else if(r.event_name==="engagement")out.engagedSeconds=d}
 out.avgEngagedSecondsPerSession=out.sessions?out.engagedSeconds/out.sessions:0;return out;
}
async function adminAnalyticsSummary(request,env){
 const url=new URL(request.url),p=analyticsPeriod(url.searchParams.get("range")||"24h");
 const summarySql=`SELECT blob1 AS event_name, COUNT(*) AS event_count, SUM(double2) AS duration FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end GROUP BY event_name ORDER BY event_count DESC`;
 const pagesSql=`SELECT blob2 AS page, COUNT(*) AS views FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 = 'page_view' GROUP BY page ORDER BY views DESC LIMIT 12`;
 const toolsSql=`SELECT blob3 AS tool, COUNT(*) AS uses FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 = 'tool_use' AND blob3 != '' GROUP BY tool ORDER BY uses DESC LIMIT 12`;
 const engagementSql=`SELECT blob2 AS page, SUM(double2) AS seconds FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 = 'engagement' GROUP BY page ORDER BY seconds DESC LIMIT 12`;
 const devicesSql=`SELECT blob4 AS device, COUNT(*) AS sessions FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 = 'session_start' GROUP BY device ORDER BY sessions DESC LIMIT 10`;
 const versionsSql=`SELECT blob5 AS version, COUNT(*) AS sessions FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 = 'session_start' GROUP BY version ORDER BY sessions DESC LIMIT 10`;
 const bucketFn=p.bucket==="hour"?"toStartOfHour(timestamp)":"toStartOfDay(timestamp)";
 const timelineSql=`SELECT ${bucketFn} AS bucket, blob1 AS event_name, COUNT(*) AS event_count FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND (blob1 = 'session_start' OR blob1 = 'page_view' OR blob1 = 'tool_use') GROUP BY bucket,event_name ORDER BY bucket ASC`;
 const cur={start:p.currentStart,end:p.currentEnd},prev={start:p.previousStart,end:p.previousEnd};
 const [currentSummary,previousSummary,pages,tools,engagement,devices,versions,timeline]=await Promise.all([analyticsSql(env,summarySql,cur),analyticsSql(env,summarySql,prev),analyticsSql(env,pagesSql,cur),analyticsSql(env,toolsSql,cur),analyticsSql(env,engagementSql,cur),analyticsSql(env,devicesSql,cur),analyticsSql(env,versionsSql,cur),analyticsSql(env,timelineSql,cur)]);
 const tmap=new Map();for(const r of timeline.data||[]){const raw=String(r.bucket||""),key=raw;if(!tmap.has(key))tmap.set(key,{bucket:raw,sessions:0,pageViews:0,toolUses:0});const row=tmap.get(key),n=Number(r.event_count)||0;if(r.event_name==="session_start")row.sessions=n;else if(r.event_name==="page_view")row.pageViews=n;else if(r.event_name==="tool_use")row.toolUses=n}
 const timelineRows=[...tmap.values()].map(r=>({...r,label:p.bucket==="hour"?new Date(String(r.bucket).replace(" ","T")+"Z").toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}):String(r.bucket).slice(5,10)}));
 const current=eventSummary(currentSummary.data),previous=eventSummary(previousSummary.data);
 return{range:p.range,generatedAt:new Date().toISOString(),viewer:request.headers.get("cf-access-authenticated-user-email")||"Cloudflare Access",period:{start:p.currentStart,end:p.currentEnd,previousStart:p.previousStart,previousEnd:p.previousEnd},current,previous,pages:(pages.data||[]).map(r=>({page:r.page||"Unknown",views:Number(r.views)||0})),tools:(tools.data||[]).map(r=>({tool:r.tool||"Unknown",uses:Number(r.uses)||0})),engagementByPage:(engagement.data||[]).map(r=>({page:r.page||"Unknown",seconds:Number(r.seconds)||0})),devices:(devices.data||[]).map(r=>({device:r.device||"Unknown",sessions:Number(r.sessions)||0})),versions:(versions.data||[]).map(r=>({version:r.version||"Unknown",sessions:Number(r.sessions)||0})),timeline:timelineRows};
}

const ANALYTICS_EVENTS=new Set(["session_start","page_view","tool_use","engagement","analytics_enabled"]);
function analyticsOriginAllowed(request){
 const origin=request.headers.get("origin")||"";
 return origin==="https://marinetools.app"||origin==="https://www.marinetools.app";
}
function cleanText(v,max){return String(v??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,max)}
async function analyticsEvent(request,env){
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 if(!analyticsOriginAllowed(request))return json({error:"Origin not allowed"},403);
 if(!env.ANALYTICS)return json({ok:false,configured:false,error:"Analytics Engine binding not configured"},503);
 const len=Number(request.headers.get("content-length")||0);if(len>4096)return json({error:"Payload too large"},413);
 let body;try{body=JSON.parse(await request.text())}catch{return json({error:"Invalid JSON"},400)}
 const event=cleanText(body.event,40);if(!ANALYTICS_EVENTS.has(event))return json({error:"Unsupported event"},400);
 const page=cleanText(body.page,80),tool=cleanText(body.tool,120),device=cleanText(body.device,20),version=cleanText(body.version,20);
 const duration=Math.max(0,Math.min(3600,Number(body.duration)||0));
 env.ANALYTICS.writeDataPoint({blobs:[event,page,tool,device,version],doubles:[1,duration],indexes:["marine-tools"]});
 return json({ok:true},202)
}

export default{async fetch(request,env){
 if(request.method==="OPTIONS")return new Response(null,{headers:cors});const url=new URL(request.url);
 try{
   if(url.pathname==="/admin/analytics"){
     if(!adminAccessOk(request))return adminUnauthorized(false);
     return new Response(ADMIN_DASHBOARD_HTML,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
   }
   if(url.pathname==="/admin/api/analytics"){
     if(!adminAccessOk(request))return adminUnauthorized(true);
     return json(await adminAnalyticsSummary(request,env));
   }

   if(url.pathname==="/api/health")return json({status:"ok",service:"Marine Tools API",capabilities:["ais-experimental","met-norway-point-weather","route-forecast-experimental","anonymous-usage-analytics","private-analytics-dashboard"],analyticsConfigured:Boolean(env.ANALYTICS),analyticsQueryConfigured:Boolean(env.ANALYTICS_SQL)});
   if(url.pathname==="/api/auth/status")return json(await authStatus(env));
   if(url.pathname==="/api/ais/latest")return json(await latestAis(url,env));
   if(url.pathname==="/api/forecast")return json(await forecast(url));
   if(url.pathname==="/api/weather")return json(await weather(url));
   if(url.pathname==="/api/analytics/event")return analyticsEvent(request,env);
   if(url.pathname==="/api/barentswatch/probe")return json(await probe(url,env));
   return json({error:"Not found"},404);
 }catch(e){return json({error:e.message},500)}
}};
