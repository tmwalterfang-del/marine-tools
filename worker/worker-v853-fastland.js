import previousWorker from "./worker-v853.js";

const MET_LOCATION_URL="https://api.met.no/weatherapi/locationforecast/2.0/compact";
const USER_AGENT="MarineTools/8.5.3 contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const cache=new Map();

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function msToKn(v){return v==null?null:v*1.943844}
function rows(d){return Array.isArray(d?.properties?.timeseries)?d.properties.timeseries:[]}
function geometry(d){
  const c=d?.geometry?.coordinates;
  if(!Array.isArray(c)||c.length<3)return null;
  const lon=num(c[0]),lat=num(c[1]),alt=num(c[2]);
  return lon==null||lat==null?null:{lat,lon,alt};
}
function detail(row,key){return num(row?.data?.instant?.details?.[key])}
function periodDetail(row,key){for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){const v=num(row?.data?.[p]?.details?.[key]);if(v!=null)return v}return null}
function periodSummary(row,key){for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){const v=row?.data?.[p]?.summary?.[key];if(v!=null)return v}return null}
function selectFuture(series,limit){
  const now=Date.now()-45*60*1000;
  const future=series.filter(r=>{const t=Date.parse(r?.time||"");return Number.isFinite(t)&&t>=now});
  return (future.length?future:series).slice(0,limit);
}
async function fetchLocation(lat,lon){
  const q=`lat=${encodeURIComponent(lat.toFixed(4))}&lon=${encodeURIComponent(lon.toFixed(4))}`;
  const r=await fetch(`${MET_LOCATION_URL}?${q}`,{headers:{"user-agent":USER_AGENT,accept:"application/json"}});
  const text=await r.text();
  let data=null;try{data=JSON.parse(text)}catch{}
  return r.ok?{ok:true,status:r.status,data}:{ok:false,status:r.status,error:(data?.error||text||"").slice(0,240),data};
}
function inlandForecast(locationRows,limit){
  return selectFuture(locationRows,limit).map(row=>({
    forecastTime:row?.time||null,
    hs:null,
    waveDirection:null,
    wavePeriod:null,
    swellHeight:null,
    swellDirection:null,
    swellPeriod:null,
    windKn:msToKn(detail(row,"wind_speed")),
    windDirection:detail(row,"wind_from_direction"),
    airTemp:detail(row,"air_temperature"),
    seaTemp:null,
    precipitation:periodDetail(row,"precipitation_amount"),
    symbolCode:periodSummary(row,"symbol_code"),
    source:"MET Norway"
  }));
}

async function fastInlandWeather(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon")),limit=Math.max(1,Math.min(24,Number(url.searchParams.get("limit"))||12));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return null;

  const key=`${lat.toFixed(4)}:${lon.toFixed(4)}:${limit}`;
  const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.response.clone();

  const location=await fetchLocation(lat,lon);
  if(!location.ok)return null;
  const locationRows=rows(location.data);
  if(!locationRows.length)return null;

  const altitudeM=geometry(location.data)?.alt??null;
  // A positive terrain height above 10 m is a strong inland signal. In that case
  // skip Oceanforecast and WaveWatch entirely so land forecasts return quickly.
  if(!(altitudeM!=null&&altitudeM>10))return null;

  const response=json({
    lat,lon,
    forecast:inlandForecast(locationRows,limit),
    sources:{weather:"MET Norway Locationforecast",marine:null},
    marineFallback:false,
    marineSuppressed:true,
    diagnostics:{
      location:{ok:true,status:"ok",count:locationRows.length,altitudeM},
      ocean:{ok:false,status:"skipped-land",count:0,error:null,snapNm:null,suppressed:true},
      globalWave:{ok:false,status:"land-suppressed",count:0}
    }
  });
  cache.set(key,{response:response.clone(),expires:Date.now()+10*60*1000});
  return response;
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==="/api/weather"&&request.method==="GET"){
      const fast=await fastInlandWeather(url);
      if(fast)return fast;
    }
    return previousWorker.fetch(request,env,ctx);
  }
};
