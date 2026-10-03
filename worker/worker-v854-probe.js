import previousWorker from "./worker-v853-fastland.js";

const NOAA_ROOT="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod";
const KARTVERKET_WFS="https://wfs.geonorge.no/skwms1/wfs.dybdedata?request=GetCapabilities&service=WFS";
const KARTVERKET_TIDE="https://vannstand.kartverket.no/tideapi.php?tide_request=levels&lang=en";
const GEBCO_WMS="https://wms.gebco.net/2026/mapserv?request=getcapabilities&service=wms&version=1.3.0";
const USER_AGENT="MarineTools/8.5.4 probe contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function pad(n,w=2){return String(n).padStart(w,"0")}
function cycleCandidates(now=new Date()){
  const t=new Date(now.getTime());
  t.setUTCMinutes(0,0,0);
  t.setUTCHours(Math.floor(t.getUTCHours()/6)*6);
  const out=[];
  for(let i=0;i<5;i++){
    const d=new Date(t.getTime()-i*6*3600000);
    out.push({date:`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`,hour:pad(d.getUTCHours())});
  }
  return out;
}
async function timedFetch(url,init={},timeoutMs=4500){
  const ac=new AbortController();
  const timer=setTimeout(()=>ac.abort("timeout"),timeoutMs);
  try{return await fetch(url,{...init,signal:ac.signal,headers:{"user-agent":USER_AGENT,...(init.headers||{})}})}
  finally{clearTimeout(timer)}
}
function idxEntries(text){
  const lines=String(text||"").trim().split(/\r?\n/).filter(Boolean);
  const parsed=lines.map((line,i)=>{
    const p=line.split(":");
    const offset=Number(p[1]);
    return {line,index:i,offset:Number.isFinite(offset)?offset:null,varName:p[3]||"",level:p[4]||"",forecast:p.slice(5).join(":")};
  }).filter(x=>x.offset!=null);
  return parsed.map((x,i)=>({...x,nextOffset:parsed[i+1]?.offset??null}));
}
async function findWaveFile(){
  for(const c of cycleCandidates()){
    const fh="003";
    const file=`gfswave.t${c.hour}z.global.0p25.f${fh}.grib2`;
    const base=`${NOAA_ROOT}/gfs.${c.date}/${c.hour}/wave/gridded/${file}`;
    try{
      const r=await timedFetch(`${base}.idx`,{headers:{accept:"text/plain"}},3500);
      if(!r.ok)continue;
      const text=await r.text();
      const entries=idxEntries(text);
      if(entries.some(e=>e.varName==="HTSGW"))return{cycle:c,forecastHour:Number(fh),file,base,entries};
    }catch{}
  }
  return null;
}
async function fetchRecordMeta(base,entry){
  const end=entry.nextOffset!=null?entry.nextOffset-1:null;
  const range=end!=null?`bytes=${entry.offset}-${end}`:`bytes=${entry.offset}-`;
  const r=await timedFetch(base,{headers:{Range:range,accept:"application/octet-stream"}},4500);
  const b=new Uint8Array(await r.arrayBuffer());
  const magic=b.length>=4?String.fromCharCode(...b.slice(0,4)):"";
  return{ok:r.ok||r.status===206,status:r.status,range,bytes:b.byteLength,gribMagic:magic==="GRIB"};
}
async function waveProbe(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon"));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  const found=await findWaveFile();
  if(!found)return json({ok:false,provider:"NOAA/NCEP GFS-Wave",reason:"No recent GFS-Wave file found within probe window",lat,lon},503);
  const wanted=["HTSGW","PERPW","DIRPW"];
  const records={};
  for(const v of wanted){
    const e=found.entries.find(x=>x.varName===v&&/surface/i.test(x.level))||found.entries.find(x=>x.varName===v);
    if(!e){records[v]={ok:false,reason:"record-not-found"};continue}
    try{records[v]={...e,...await fetchRecordMeta(found.base,e)}}catch(err){records[v]={ok:false,reason:String(err?.message||err)}}
  }
  const ready=Boolean(records.HTSGW?.gribMagic&&records.PERPW?.gribMagic&&records.DIRPW?.gribMagic);
  return json({
    ok:ready,
    stage:"transport-probe",
    note:"This preview endpoint validates live NOAA GFS-Wave discovery and byte-range delivery. GRIB2 decoding to point values is the next stage.",
    provider:"NOAA/NCEP GFS-Wave",
    noSubscription:true,
    lat,lon,
    modelDate:found.cycle.date,
    cycleHourUTC:found.cycle.hour,
    forecastHour:found.forecastHour,
    file:found.file,
    records
  },ready?200:502);
}
async function probeSource(name,url,accept,timeoutMs=4500){
  const started=Date.now();
  try{
    const r=await timedFetch(url,{headers:{accept}},timeoutMs);
    const text=await r.text();
    return{name,ok:r.ok,status:r.status,latencyMs:Date.now()-started,contentType:r.headers.get("content-type"),sample:text.slice(0,120)};
  }catch(err){return{name,ok:false,status:null,latencyMs:Date.now()-started,error:String(err?.message||err)}}
}
async function ukcSourceProbe(){
  const [depthNorway,waterNorway,bathyGlobal]=await Promise.all([
    probeSource("Kartverket Sjøkart Dybdedata WFS",KARTVERKET_WFS,"application/xml,text/xml,*/*"),
    probeSource("Kartverket water level/tide API",KARTVERKET_TIDE,"application/xml,text/xml,*/*"),
    probeSource("GEBCO 2026 WMS",GEBCO_WMS,"application/xml,text/xml,*/*")
  ]);
  return json({
    ok:depthNorway.ok&&waterNorway.ok&&bathyGlobal.ok,
    stage:"source-connectivity-probe",
    productionUKC:false,
    planningOnly:true,
    norway:{
      depth:{...depthNorway,datum:"Sjøkartnull / EPSG:9672",classification:"planning-only candidate"},
      waterLevel:{...waterNorway,datum:"Sjøkartnull when requested as Chart Datum (CD)",classification:"planning-only candidate"},
      datumCompatibility:"promising; point lookup and exact response parsing still to be validated"
    },
    global:{
      bathymetry:{...bathyGlobal,datum:"GEBCO MSL-assumed / heterogeneous shallow-water sources",classification:"planning-only"},
      tide:{name:"FES2022B",ok:false,status:"not-runtime-integrated",classification:"candidate; registration/licence acceptance and datum chain still required"},
      datumCompatibility:"not yet sufficient for an automatic global UKC calculation"
    },
    next:"Implement decoded NOAA wave point values, then /api/bathymetry point lookup before /api/water-level and /api/ukc."
  });
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/wave/probe")return waveProbe(url);
    if(request.method==="GET"&&url.pathname==="/api/ukc/source-probe")return ukcSourceProbe();
    return previousWorker.fetch(request,env,ctx);
  }
};
