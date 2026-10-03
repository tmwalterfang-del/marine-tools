import previousWorker from "./worker-v852.js";

const MET_LOCATION_URL="https://api.met.no/weatherapi/locationforecast/2.0/compact";
const MET_OCEAN_URL="https://api.met.no/weatherapi/oceanforecast/2.0/complete";
const WW3_URL="https://coastwatch.pfeg.noaa.gov/erddap/griddap/NWW3_Global_Best.json";
const USER_AGENT="MarineTools/8.5.3 contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const cache=new Map();

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function msToKn(v){return v==null?null:v*1.943844}
function rad(x){return x*Math.PI/180}
function distanceNm(a,b){
  if(!a||!b)return null;
  const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon);
  const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
async function fetchMet(url){
  const r=await fetch(url,{headers:{"user-agent":USER_AGENT,accept:"application/json"}});
  const text=await r.text();
  let data=null;try{data=JSON.parse(text)}catch{}
  return r.ok?{ok:true,status:r.status,data}:{ok:false,status:r.status,error:(data?.error||text||"").slice(0,240),data};
}
function rows(d){return Array.isArray(d?.properties?.timeseries)?d.properties.timeseries:[]}
function geometry(d){
  const c=d?.geometry?.coordinates;
  if(!Array.isArray(c)||c.length<2)return null;
  const lon=num(c[0]),lat=num(c[1]),alt=num(c[2]);
  return lon==null||lat==null?null:{lat,lon,alt};
}
function detail(row,key){const v=row?.data?.instant?.details?.[key];return num(v)}
function periodDetail(row,key){for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){const v=num(row?.data?.[p]?.details?.[key]);if(v!=null)return v}return null}
function periodSummary(row,key){for(const p of ["next_1_hours","next_6_hours","next_12_hours"]){const v=row?.data?.[p]?.summary?.[key];if(v!=null)return v}return null}
function selectFuture(series,limit){
  const now=Date.now()-45*60*1000;
  const f=series.filter(r=>{const t=Date.parse(r?.time||"");return Number.isFinite(t)&&t>=now});
  return (f.length?f:series).slice(0,limit);
}
function nearest(series,time,maxMs=90*60*1000){
  if(!series?.length)return null;
  const target=Date.parse(time||"");if(!Number.isFinite(target))return series[0]||null;
  let best=null,d=Infinity;
  for(const row of series){const t=Date.parse(row?.time||"");if(!Number.isFinite(t))continue;const q=Math.abs(t-target);if(q<d){d=q;best=row}}
  return d<=maxMs?best:null;
}
function combined(locationRow,oceanRow){
  return{
    forecastTime:locationRow?.time||oceanRow?.time||null,
    hs:detail(oceanRow,"sea_surface_wave_height"),
    waveDirection:detail(oceanRow,"sea_surface_wave_from_direction"),
    wavePeriod:detail(oceanRow,"sea_surface_wave_period_at_variance_spectral_density_maximum"),
    windKn:msToKn(detail(locationRow,"wind_speed")),
    windDirection:detail(locationRow,"wind_from_direction"),
    airTemp:detail(locationRow,"air_temperature"),
    seaTemp:detail(oceanRow,"sea_water_temperature"),
    precipitation:periodDetail(locationRow,"precipitation_amount"),
    symbolCode:periodSummary(locationRow,"symbol_code"),
    source:"MET Norway"
  };
}
function isoHour(ms,ceil=false){const h=3600000,t=ceil?Math.ceil(ms/h)*h:Math.floor(ms/h)*h;return new Date(t).toISOString().replace(".000Z","Z")}
function ww3Value(row,names,name){const i=names.indexOf(name);return i<0?null:num(row[i])}
async function ww3Point(lat,lon,targetTimes=[]){
  if(lat<-77.5||lat>77.5)return{ok:false,status:"outside-coverage",series:[]};
  const targetMs=targetTimes.map(t=>Date.parse(t||"")).filter(Number.isFinite),now=Date.now();
  const start=isoHour(targetMs.length?Math.min(...targetMs):now,false),stop=isoHour(targetMs.length?Math.max(...targetMs):now+12*3600000,true);
  const lon360=((lon%360)+360)%360;
  const dims=`[(${start}):1:(${stop})][(0.0)][(${lat.toFixed(3)})][(${lon360.toFixed(3)})]`;
  const vars=["Thgt","Tdir","Tper","shgt","sdir","sper"].map(v=>`${v}${dims}`).join(",");
  const r=await fetch(`${WW3_URL}?${vars}`,{headers:{accept:"application/json","user-agent":USER_AGENT}}),text=await r.text();
  if(!r.ok)return{ok:false,status:r.status,series:[]};
  let raw;try{raw=JSON.parse(text)}catch{return{ok:false,status:"invalid-json",series:[]}}
  const table=raw?.table||{},names=Array.isArray(table.columnNames)?table.columnNames:[],rr=Array.isArray(table.rows)?table.rows:[];
  const ti=names.indexOf("time");
  const series=rr.map(row=>({
    forecastTime:ti>=0&&row[ti]?new Date(row[ti]).toISOString():null,
    hs:ww3Value(row,names,"Thgt"),waveDirection:ww3Value(row,names,"Tdir"),wavePeriod:ww3Value(row,names,"Tper"),
    swellHeight:ww3Value(row,names,"shgt"),swellDirection:ww3Value(row,names,"sdir"),swellPeriod:ww3Value(row,names,"sper")
  })).filter(x=>x.forecastTime&&x.hs!=null);
  return{ok:series.length>0,status:series.length?"ok":"no-data",series};
}
function nearestWave(series,time,maxMs=2*3600000){
  const target=Date.parse(time||"");if(!Number.isFinite(target)||!series?.length)return null;
  let best=null,d=Infinity;for(const r of series){const t=Date.parse(r.forecastTime||"");if(!Number.isFinite(t))continue;const q=Math.abs(t-target);if(q<d){d=q;best=r}}
  return d<=maxMs?best:null;
}
function mergeWave(row,w){return !w?row:{...row,hs:row.hs??w.hs,waveDirection:row.waveDirection??w.waveDirection,wavePeriod:row.wavePeriod??w.wavePeriod,swellHeight:w.swellHeight,swellDirection:w.swellDirection,swellPeriod:w.swellPeriod}}

async function pointWeather(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon")),limit=Math.max(1,Math.min(24,Number(url.searchParams.get("limit"))||12));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  const key=`${lat.toFixed(4)}:${lon.toFixed(4)}:${limit}`,hit=cache.get(key);if(hit&&hit.expires>Date.now())return json(hit.data);
  const q=`lat=${encodeURIComponent(lat.toFixed(4))}&lon=${encodeURIComponent(lon.toFixed(4))}`;
  const [location,ocean]=await Promise.all([fetchMet(`${MET_LOCATION_URL}?${q}`),fetchMet(`${MET_OCEAN_URL}?${q}`)]);
  const locationRows=location.ok?rows(location.data):[],oceanRows=ocean.ok?rows(ocean.data):[];
  if(!locationRows.length)return json({error:"Weather forecast unavailable",diagnostics:{location:{ok:false,status:location.status,error:location.error||null}}},502);

  const requested={lat,lon},locPoint=geometry(location.data),oceanPoint=geometry(ocean.data);
  const altitudeM=locPoint?.alt??null,snapNm=distanceNm(requested,oceanPoint);
  const landLikely=(altitudeM!=null&&altitudeM>10)||(altitudeM!=null&&altitudeM>0&&snapNm!=null&&snapNm>1.5);
  const oceanUsable=!landLikely&&oceanRows.length>0&&(snapNm==null||snapNm<=3);
  const base=selectFuture(locationRows,limit);
  let forecast=base.map(l=>combined(l,oceanUsable?nearest(oceanRows,l.time):null));
  let marineSource=oceanUsable&&forecast.some(x=>x.hs!=null)?"MET Norway Oceanforecast":null;
  let globalWave={ok:false,status:landLikely?"land-suppressed":"not-needed",series:[]};

  if(!landLikely&&!forecast.some(x=>x.hs!=null)){
    globalWave=await ww3Point(lat,lon,forecast.map(x=>x.forecastTime));
    if(globalWave.ok){forecast=forecast.map(r=>mergeWave(r,nearestWave(globalWave.series,r.forecastTime)));marineSource="PacIOOS WaveWatch III"}
  }

  // Point Weather deliberately omits ocean current. It is not part of this UI anymore.
  forecast=forecast.map(r=>{const x={...r};delete x.currentKn;delete x.currentDirection;return x});
  if(landLikely)forecast=forecast.map(r=>({...r,hs:null,waveDirection:null,wavePeriod:null,swellHeight:null,swellDirection:null,swellPeriod:null,seaTemp:null}));

  const data={
    lat,lon,forecast,
    sources:{weather:"MET Norway Locationforecast",marine:landLikely?null:marineSource},
    marineFallback:marineSource==="PacIOOS WaveWatch III",
    marineSuppressed:landLikely,
    diagnostics:{
      location:{ok:true,status:"ok",count:locationRows.length,altitudeM},
      ocean:{ok:ocean.ok,status:ocean.ok?"ok":ocean.status,count:oceanRows.length,error:ocean.error||null,snapNm:snapNm==null?null:Number(snapNm.toFixed(2)),suppressed:landLikely||!oceanUsable},
      globalWave:{ok:Boolean(globalWave.ok),status:globalWave.status,count:globalWave.series?.length||0}
    }
  };
  cache.set(key,{data,expires:Date.now()+10*60*1000});
  return json(data);
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==="/api/weather"&&request.method==="GET")return pointWeather(url);
    return previousWorker.fetch(request,env,ctx);
  }
};
