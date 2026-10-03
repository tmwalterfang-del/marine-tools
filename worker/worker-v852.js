import baseWorker from "./worker.js";

const PELYR_API_ROOT="https://api.pelyr.com";
const WW3_URL="https://coastwatch.pfeg.noaa.gov/erddap/griddap/NWW3_Global_Best.json";
const DATA_USER_AGENT="MarineTools/8.5.2 contact@marinetools.app";
const PRODUCT_ORIGINS=new Set(["https://marinetools.app","https://www.marinetools.app"]);

const pelyrAisCache=new Map();
let pelyrSourcesCache={expires:0,map:null};
const ww3Cache=new Map();

const cors={
  "access-control-allow-origin":"*",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "access-control-allow-headers":"content-type"
};
function json(data,status=200,extra={}){
  return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store",...extra}});
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function parseBounds(url){
  const b={minLat:num(url.searchParams.get("minLat")),maxLat:num(url.searchParams.get("maxLat")),minLon:num(url.searchParams.get("minLon")),maxLon:num(url.searchParams.get("maxLon"))};
  if(Object.values(b).some(v=>v==null))return null;
  if(b.minLat<-90||b.maxLat>90||b.minLon<-180||b.maxLon>180||b.minLat>=b.maxLat||b.minLon>=b.maxLon)return null;
  return b;
}
function productOriginAllowed(request){
  const origin=request.headers.get("origin")||"";
  return PRODUCT_ORIGINS.has(origin);
}
function uniq(values){return [...new Set(values.filter(Boolean))]}

async function pelyrSources(env){
  if(!env.PELYR_API_KEY)throw new Error("Pelyr API key is not configured");
  if(pelyrSourcesCache.map&&pelyrSourcesCache.expires>Date.now())return pelyrSourcesCache.map;
  const r=await fetch(`${PELYR_API_ROOT}/v1/sources`,{headers:{authorization:`Bearer ${env.PELYR_API_KEY}`,accept:"application/json","user-agent":DATA_USER_AGENT}});
  if(!r.ok){const t=await r.text().catch(()=>"");throw new Error(`Pelyr sources request failed (${r.status})${t?`: ${t.slice(0,180)}`:""}`)}
  const j=await r.json();
  const map=new Map((Array.isArray(j?.sources)?j.sources:[]).map(s=>[String(s.id),s]));
  pelyrSourcesCache={map,expires:Date.now()+30*60*1000};
  return map;
}
function pelyrCacheKey(b){return [b.minLat,b.maxLat,b.minLon,b.maxLon].map(v=>Number(v).toFixed(2)).join(":")}
async function pelyrLatest(url,env){
  const b=parseBounds(url);if(!b)throw new Error("Invalid AIS bounding box");
  const key=pelyrCacheKey(b),hit=pelyrAisCache.get(key);if(hit&&hit.expires>Date.now())return hit.data;
  const sourceMap=await pelyrSources(env);
  const bbox=[b.minLon,b.minLat,b.maxLon,b.maxLat].join(",");
  const endpoint=`${PELYR_API_ROOT}/v1/vessels?bbox=${encodeURIComponent(bbox)}&max=2000`;
  const r=await fetch(endpoint,{headers:{authorization:`Bearer ${env.PELYR_API_KEY}`,accept:"application/json","user-agent":DATA_USER_AGENT}});
  if(!r.ok){const t=await r.text().catch(()=>"");throw new Error(`Pelyr AIS request failed (${r.status})${t?`: ${t.slice(0,180)}`:""}`)}
  const j=await r.json();
  const vessels=[];
  for(const vessel of Array.isArray(j?.vessels)?j.vessels:[]){
    const p=vessel?.position;if(!p)continue;
    const lat=num(p.lat),lon=num(p.lon);if(lat==null||lon==null)continue;
    const pSource=sourceMap.get(String(p.license??""));
    const openLicence=x=>Boolean(x&&(/NLOD/i.test(String(x.license||""))||/CC[-_ ]?BY/i.test(String(x.license||""))));
    if(!openLicence(pSource))continue; // Pelyr-owned/restricted AIS data must not be re-served through our API.
    const s=vessel?.static||null;
    const sSource=s?sourceMap.get(String(s.license??"")):null;
    const staticAllowed=!s||openLicence(sSource);
    const attrs=uniq([pSource?.attribution,staticAllowed?sSource?.attribution:null]);
    vessels.push({
      mmsi:vessel.mmsi,
      name:staticAllowed?(s?.name||null):null,
      shipName:staticAllowed?(s?.name||null):null,
      latitude:lat,
      longitude:lon,
      speedOverGround:num(p.sog),
      courseOverGround:num(p.cog),
      trueHeading:num(p.heading),
      navigationalStatus:num(p.nav_status),
      shipType:staticAllowed?num(s?.type):null,
      timestamp:p.ts||null,
      source:pSource?.source||"Open AIS source",
      attributions:attrs,
      dataAgeSource:p.ts||null
    });
  }
  const data={vessels,generatedAt:j?.generated_at||new Date().toISOString(),truncated:Boolean(j?.truncated)};
  pelyrAisCache.set(key,{data,expires:Date.now()+15*1000});
  return data;
}
async function aisResponse(request,env,ctx){
  const url=new URL(request.url);
  if(!productOriginAllowed(request))return json({error:"AIS context is available only inside the Marine Tools web application."},403,{"access-control-allow-origin":"null"});
  if(env.PELYR_API_KEY){
    try{
      const p=await pelyrLatest(url,env);
      return json(p.vessels,200,{"access-control-allow-origin":request.headers.get("origin")||"https://marinetools.app","vary":"Origin","x-marine-tools-ais-provider":"Pelyr-open-sources"});
    }catch(e){
      // Keep the existing BarentsWatch integration as an operational fallback.
    }
  }
  const base=await baseWorker.fetch(request,env,ctx);
  if(!base.ok)return base;
  try{
    const arr=await base.clone().json();
    if(!Array.isArray(arr))return base;
    const enriched=arr.map(v=>({...v,source:v?.source||"BarentsWatch",attributions:uniq([...(Array.isArray(v?.attributions)?v.attributions:[]),"Data delivered by BarentsWatch"])}));
    return json(enriched,200,{"access-control-allow-origin":request.headers.get("origin")||"https://marinetools.app","vary":"Origin","x-marine-tools-ais-provider":"BarentsWatch"});
  }catch{return base}
}

function isoHour(ms,ceil=false){
  const hour=3600000;
  const t=ceil?Math.ceil(ms/hour)*hour:Math.floor(ms/hour)*hour;
  return new Date(t).toISOString().replace(".000Z","Z");
}
function ww3Key(lat,lon,start,stop){return `${lat.toFixed(2)}:${lon.toFixed(2)}:${start}:${stop}`}
function ww3Value(row,names,name){const i=names.indexOf(name);return i<0?null:num(row[i])}
function ww3Time(row,names){const i=names.indexOf("time");if(i<0||!row[i])return null;const ms=Date.parse(row[i]);return Number.isFinite(ms)?new Date(ms).toISOString():String(row[i])}
async function ww3Point(lat,lon,targetTimes=[]){
  if(lat<-77.5||lat>77.5)return{ok:false,status:"outside-coverage",series:[]};
  const targetMs=targetTimes.map(t=>Date.parse(t||"")).filter(Number.isFinite);
  const now=Date.now();
  const start=isoHour(targetMs.length?Math.min(...targetMs):now,false);
  const stop=isoHour(targetMs.length?Math.max(...targetMs):now+12*3600000,true);
  const lon360=((lon%360)+360)%360;
  const key=ww3Key(lat,lon360,start,stop),hit=ww3Cache.get(key);if(hit&&hit.expires>Date.now())return hit.data;
  const dims=`[(${start}):1:(${stop})][(0.0)][(${clamp(lat,-77.5,77.5).toFixed(3)})][(${lon360.toFixed(3)})]`;
  const vars=["Thgt","Tdir","Tper","shgt","sdir","sper"].map(v=>`${v}${dims}`).join(",");
  const r=await fetch(`${WW3_URL}?${vars}`,{headers:{accept:"application/json","user-agent":DATA_USER_AGENT}});
  const text=await r.text();
  if(!r.ok){const data={ok:false,status:r.status,error:text.slice(0,220),series:[]};ww3Cache.set(key,{data,expires:Date.now()+5*60*1000});return data}
  let raw;try{raw=JSON.parse(text)}catch{const data={ok:false,status:"invalid-json",series:[]};ww3Cache.set(key,{data,expires:Date.now()+5*60*1000});return data}
  const table=raw?.table||{},names=Array.isArray(table.columnNames)?table.columnNames:[],rows=Array.isArray(table.rows)?table.rows:[];
  const series=rows.map(row=>({
    forecastTime:ww3Time(row,names),
    hs:ww3Value(row,names,"Thgt"),
    waveDirection:ww3Value(row,names,"Tdir"),
    wavePeriod:ww3Value(row,names,"Tper"),
    swellHeight:ww3Value(row,names,"shgt"),
    swellDirection:ww3Value(row,names,"sdir"),
    swellPeriod:ww3Value(row,names,"sper"),
    marineSource:"PacIOOS WaveWatch III",
    marineAttribution:"Wave forecast: PacIOOS WaveWatch III Global Wave Model, served via NOAA ERDDAP."
  })).filter(x=>x.forecastTime&&[x.hs,x.wavePeriod,x.swellHeight].some(v=>v!=null));
  const data={ok:series.length>0,status:series.length?"ok":"no-data",series};
  ww3Cache.set(key,{data,expires:Date.now()+10*60*1000});
  return data;
}
function nearestSeries(series,time,maxMs=2*3600000){
  const target=Date.parse(time||"");if(!Number.isFinite(target)||!Array.isArray(series)||!series.length)return null;
  let best=null,d=Infinity;for(const row of series){const t=Date.parse(row?.forecastTime||"");if(!Number.isFinite(t))continue;const q=Math.abs(t-target);if(q<d){d=q;best=row}}
  return d<=maxMs?best:null;
}
function mergeWave(row,w){
  if(!w)return row;
  return {...row,
    hs:row?.hs??w.hs,
    waveDirection:row?.waveDirection??w.waveDirection,
    wavePeriod:row?.wavePeriod??w.wavePeriod,
    swellHeight:row?.swellHeight??w.swellHeight,
    swellDirection:row?.swellDirection??w.swellDirection,
    swellPeriod:row?.swellPeriod??w.swellPeriod,
    marineSource:row?.hs!=null?(row?.marineSource||"MET Norway Oceanforecast"):w.marineSource,
    marineAttribution:row?.hs!=null?(row?.marineAttribution||null):w.marineAttribution
  };
}
async function weatherResponse(request,env,ctx){
  const base=await baseWorker.fetch(request,env,ctx);if(!base.ok)return base;
  let j;try{j=await base.clone().json()}catch{return base}
  if(!j||!Array.isArray(j.forecast))return base;
  const metOcean=Boolean(j?.diagnostics?.ocean?.ok)&&j.forecast.some(r=>r?.hs!=null||r?.currentKn!=null||r?.seaTemp!=null);
  const metWave=j.forecast.some(r=>r?.hs!=null);
  let globalWave={ok:false,status:"not-needed",series:[]};
  if(!metWave&&j.forecast.length){
    const lat=num(j.lat),lon=num(j.lon);
    if(lat!=null&&lon!=null)globalWave=await ww3Point(lat,lon,j.forecast.map(r=>r?.forecastTime||r?.time));
    if(globalWave.ok)j.forecast=j.forecast.map(r=>mergeWave(r,nearestSeries(globalWave.series,r?.forecastTime||r?.time)));
  }else{
    j.forecast=j.forecast.map(r=>({...r,marineSource:(r?.hs!=null||r?.currentKn!=null||r?.seaTemp!=null)?"MET Norway Oceanforecast":r?.marineSource||null}));
  }
  j.sources={weather:"MET Norway Locationforecast",marine:metWave?"MET Norway Oceanforecast":(globalWave.ok?(metOcean?"MET Norway Oceanforecast + PacIOOS WaveWatch III":"PacIOOS WaveWatch III"):(metOcean?"MET Norway Oceanforecast":null))};
  j.marineFallback=!metWave&&Boolean(globalWave.ok);
  j.marineAttribution=globalWave.ok?"Wave forecast: PacIOOS WaveWatch III Global Wave Model, served via NOAA ERDDAP.":null;
  j.diagnostics={...(j.diagnostics||{}),globalWave:{ok:Boolean(globalWave.ok),status:globalWave.status||"unavailable",count:globalWave.series?.length||0}};
  return json(j);
}
async function routeForecastResponse(request,env,ctx){
  const base=await baseWorker.fetch(request,env,ctx);if(!base.ok)return base;
  let rows;try{rows=await base.clone().json()}catch{return base}
  if(!Array.isArray(rows))return base;
  const out=await Promise.all(rows.map(async row=>{
    if(row?.hs!=null)return{...row,marineSource:"MET Norway Oceanforecast"};
    const lat=num(row?.lat),lon=num(row?.lon);if(lat==null||lon==null)return row;
    const w=await ww3Point(lat,lon,[row?.forecastTime]);
    return w.ok?mergeWave(row,nearestSeries(w.series,row?.forecastTime)):row;
  }));
  return json(out);
}
async function healthResponse(request,env,ctx){
  const base=await baseWorker.fetch(request,env,ctx);if(!base.ok)return base;
  let j;try{j=await base.clone().json()}catch{return base}
  const capabilities=Array.isArray(j?.capabilities)?j.capabilities:[];
  for(const cap of ["global-wave-fallback","global-open-ais"]){if(!capabilities.includes(cap))capabilities.push(cap)}
  return json({...j,capabilities,globalWaveConfigured:true,globalAisConfigured:Boolean(env.PELYR_API_KEY),globalAisProvider:env.PELYR_API_KEY?"Pelyr HTTPS API (open-licence sources only)":"BarentsWatch fallback"});
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS"&&url.pathname==="/api/ais/latest"){
      const origin=request.headers.get("origin")||"";
      if(!PRODUCT_ORIGINS.has(origin))return new Response(null,{status:403});
      return new Response(null,{headers:{"access-control-allow-origin":origin,"access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type","vary":"Origin"}});
    }
    if(url.pathname==="/api/ais/latest")return aisResponse(request,env,ctx);
    if(url.pathname==="/api/weather")return weatherResponse(request,env,ctx);
    if(url.pathname==="/api/forecast")return routeForecastResponse(request,env,ctx);
    if(url.pathname==="/api/health")return healthResponse(request,env,ctx);
    return baseWorker.fetch(request,env,ctx);
  }
};