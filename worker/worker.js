const TOKEN_URL="https://id.barentswatch.no/connect/token";
const AIS_LATEST_URL="https://live.ais.barentswatch.no/v1/latest/combined";
const BW_API_ROOT="https://www.barentswatch.no/bwapi/";
const ENDPOINTS={wave:"v1/waveforecastpoint/nearest/all",wind:"v1/windforecastpoint/nearest/all",current:"v1/seacurrent/nearest/all"};
let tokenCache={},forecastCache=new Map(),paramStyle={};
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};
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
async function pointData(lat,lon,env){
 const [wave,wind,current]=await Promise.all([bwSeries("wave",lat,lon,env),bwSeries("wind",lat,lon,env),bwSeries("current",lat,lon,env)]);
 return{wave,wind,current};
}
async function forecast(url,env){
 const raw=url.searchParams.get("route"),route=raw?JSON.parse(raw):[];if(!Array.isArray(route))return[];
 const pts=routeSamples(route,8);
 return Promise.all(pts.map(async(p,i)=>{const lat=Number(p.lat),lon=Number(p.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return{index:i,source:"invalid-point"};const d=await pointData(lat,lon,env),w=bestNow(d.wave.series),wi=bestNow(d.wind.series),c=bestNow(d.current.series);return{index:i,name:p.name||`P${i+1}`,lat,lon,hs:w.hs??null,windKn:wi.windKn??null,windDirection:wi.windDirection??null,currentKn:c.currentKn??null,currentDirection:c.currentDirection??null,forecastTime:w.forecastTime||wi.forecastTime||c.forecastTime||null,source:"BarentsWatch point forecast",diagnostics:{wave:d.wave.ok?"ok":d.wave.status,wind:d.wind.ok?"ok":d.wind.status,current:d.current.ok?"ok":d.current.status}}}))
}
async function weather(url,env){
 const lat=Number(url.searchParams.get("lat")),lon=Number(url.searchParams.get("lon")),limit=Math.max(1,Math.min(24,Number(url.searchParams.get("limit"))||12));
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return{error:"Invalid latitude/longitude"};
 const d=await pointData(lat,lon,env),sources=[d.wave.series,d.wind.series,d.current.series],base=sources.find(s=>s.some(x=>Number.isFinite(Date.parse(x.forecastTime||""))))||sources.find(s=>s.length)||[];
 const now=Date.now()-60*60*1000;let baseRows=base.filter(x=>{const t=Date.parse(x.forecastTime||"");return !Number.isFinite(t)||t>=now});if(!baseRows.length)baseRows=base;
 const seen=new Set(),forecast=[];
 for(const row of baseRows){if(forecast.length>=limit)break;const time=row.forecastTime||null,key=time||`row-${forecast.length}`;if(seen.has(key))continue;seen.add(key);const w=nearest(d.wave.series,time),wi=nearest(d.wind.series,time),c=nearest(d.current.series,time);forecast.push({forecastTime:time||w.forecastTime||wi.forecastTime||c.forecastTime||null,hs:w.hs??null,windKn:wi.windKn??null,windDirection:wi.windDirection??null,currentKn:c.currentKn??null,currentDirection:c.currentDirection??null,source:"BarentsWatch point forecast"})}
 if(!forecast.length){const w=bestNow(d.wave.series),wi=bestNow(d.wind.series),c=bestNow(d.current.series);if(w.hs!=null||wi.windKn!=null||c.currentKn!=null)forecast.push({forecastTime:w.forecastTime||wi.forecastTime||c.forecastTime||null,hs:w.hs??null,windKn:wi.windKn??null,windDirection:wi.windDirection??null,currentKn:c.currentKn??null,currentDirection:c.currentDirection??null,source:"BarentsWatch point forecast"})}
 return{lat,lon,forecast,diagnostics:{wave:{ok:d.wave.ok,status:d.wave.status||"ok",count:d.wave.series.length},wind:{ok:d.wind.ok,status:d.wind.status||"ok",count:d.wind.series.length},current:{ok:d.current.ok,status:d.current.status||"ok",count:d.current.series.length}}};
}
const ALLOWED={wave:ENDPOINTS.wave,wind:ENDPOINTS.wind,current:ENDPOINTS.current};
async function probe(url,env){const kind=url.searchParams.get("endpoint"),path=ALLOWED[kind];if(!path)return{error:"Unsupported endpoint",allowed:Object.keys(ALLOWED)};const access=await getToken("api",env),qs=new URLSearchParams(url.searchParams);qs.delete("endpoint");const r=await fetch(`${BW_API_ROOT}${path}${qs.toString()?`?${qs}`:""}`,{headers:{authorization:`Bearer ${access}`,accept:"application/json"}});const text=await r.text();let body;try{body=JSON.parse(text)}catch{body=text}return{upstreamStatus:r.status,endpoint:path,data:body}}

export default{async fetch(request,env){
 if(request.method==="OPTIONS")return new Response(null,{headers:cors});const url=new URL(request.url);
 try{
   if(url.pathname==="/api/health")return json({status:"ok",service:"Marine Tools API",capabilities:["ais-experimental","barentswatch-point-weather","route-forecast-experimental"]});
   if(url.pathname==="/api/auth/status")return json(await authStatus(env));
   if(url.pathname==="/api/ais/latest")return json(await latestAis(url,env));
   if(url.pathname==="/api/forecast")return json(await forecast(url,env));
   if(url.pathname==="/api/weather")return json(await weather(url,env));
   if(url.pathname==="/api/barentswatch/probe")return json(await probe(url,env));
   return json({error:"Not found"},404);
 }catch(e){return json({error:e.message},500)}
}};
