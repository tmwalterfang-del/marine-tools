import previousWorker from "./worker-v853-fastland.js";

const NOAA_ROOT="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod";
const NOAA_FILTER="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfswave.pl";
const KARTVERKET_WFS="https://wfs.geonorge.no/skwms1/wfs.dybdedata?request=GetCapabilities&service=WFS";
const KARTVERKET_WMS="https://openwms.statkart.no/skwms1/wms.dybdedata";
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
    const dir=`/gfs.${c.date}/${c.hour}/wave/gridded`;
    const base=`${NOAA_ROOT}${dir}/${file}`;
    try{
      const r=await timedFetch(`${base}.idx`,{headers:{accept:"text/plain"}},3500);
      if(!r.ok)continue;
      const text=await r.text();
      const entries=idxEntries(text);
      if(entries.some(e=>e.varName==="HTSGW"))return{cycle:c,forecastHour:Number(fh),file,dir,base,entries};
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
  return json({ok:ready,stage:"transport-probe",provider:"NOAA/NCEP GFS-Wave",noSubscription:true,lat,lon,modelDate:found.cycle.date,cycleHourUTC:found.cycle.hour,forecastHour:found.forecastHour,file:found.file,records},ready?200:502);
}

function u32(b,o){return new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(o,false)}
function i16(b,o){return new DataView(b.buffer,b.byteOffset,b.byteLength).getInt16(o,false)}
function f32(b,o){return new DataView(b.buffer,b.byteOffset,b.byteLength).getFloat32(o,false)}
function gribSections(bytes){
  if(bytes.length<20||String.fromCharCode(...bytes.slice(0,4))!=="GRIB")throw new Error("Not a GRIB2 message");
  const out={};let p=16;
  while(p+5<=bytes.length){
    if(String.fromCharCode(...bytes.slice(p,p+4))==="7777")break;
    const len=u32(bytes,p),no=bytes[p+4];
    if(!(len>=5)||p+len>bytes.length)throw new Error(`Invalid GRIB2 section ${no}`);
    out[no]={start:p,length:len};p+=len;
  }
  return out;
}
function readBits(bytes,bitOffset,width){
  let v=0;
  for(let i=0;i<width;i++){
    const q=bitOffset+i,byte=bytes[q>>3],bit=7-(q&7);
    v=v*2+((byte>>bit)&1);
  }
  return v;
}
function decodeSimpleFirst(bytes){
  const s=gribSections(bytes),s5=s[5],s6=s[6],s7=s[7];
  if(!s5||!s7)throw new Error("Missing GRIB2 data sections");
  const template=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint16(s5.start+9,false);
  const points=u32(bytes,s5.start+5);
  if(template!==0)return{ok:false,packingTemplate:template,points,reason:"packing-template-not-yet-supported"};
  const reference=f32(bytes,s5.start+11),binaryScale=i16(bytes,s5.start+15),decimalScale=i16(bytes,s5.start+17),bits=bytes[s5.start+19];
  const bitmapIndicator=s6?bytes[s6.start+5]:255;
  if(bitmapIndicator!==255&&bitmapIndicator!==0)return{ok:false,packingTemplate:template,points,reason:`bitmap-indicator-${bitmapIndicator}-unsupported`};
  if(bits===0)return{ok:true,packingTemplate:template,points,value:reference*Math.pow(10,-decimalScale),reference,binaryScale,decimalScale,bits};
  const packed=bytes.subarray(s7.start+5,s7.start+s7.length);
  let packedIndex=0;
  if(bitmapIndicator===0){
    const bitmap=bytes.subarray(s6.start+6,s6.start+s6.length);
    let firstValid=-1;
    for(let i=0;i<points;i++){if(readBits(bitmap,i,1)){firstValid=i;break}}
    if(firstValid<0)return{ok:false,packingTemplate:template,points,reason:"bitmap-has-no-valid-points"};
    packedIndex=0;
  }
  const x=readBits(packed,packedIndex*bits,bits);
  const value=(reference+x*Math.pow(2,binaryScale))*Math.pow(10,-decimalScale);
  return{ok:true,packingTemplate:template,points,value,reference,binaryScale,decimalScale,bits};
}
function noaaFilterUrl(found,varName,lat,lon){
  const d=0.13;
  const p=new URLSearchParams();
  p.set("file",found.file);p.set(`var_${varName}`,"on");p.set("lev_surface","on");p.set("subregion","");
  p.set("leftlon",String(Math.max(-180,lon-d)));p.set("rightlon",String(Math.min(180,lon+d)));
  p.set("toplat",String(Math.min(90,lat+d)));p.set("bottomlat",String(Math.max(-90,lat-d)));
  p.set("dir",found.dir);
  return `${NOAA_FILTER}?${p.toString()}`;
}
async function decodeWaveField(found,varName,lat,lon){
  const endpoint=noaaFilterUrl(found,varName,lat,lon);
  const started=Date.now();
  const r=await timedFetch(endpoint,{headers:{accept:"application/octet-stream"}},6500);
  const bytes=new Uint8Array(await r.arrayBuffer());
  if(!r.ok)return{ok:false,status:r.status,latencyMs:Date.now()-started,bytes:bytes.length,reason:"filter-request-failed"};
  try{return{...decodeSimpleFirst(bytes),status:r.status,latencyMs:Date.now()-started,bytes:bytes.length}}
  catch(err){return{ok:false,status:r.status,latencyMs:Date.now()-started,bytes:bytes.length,reason:String(err?.message||err)}}
}
async function wavePointProbe(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon"));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  const found=await findWaveFile();
  if(!found)return json({ok:false,stage:"decode-probe",provider:"NOAA/NCEP GFS-Wave",reason:"No recent GFS-Wave file found"},503);
  const [hs,period,direction]=await Promise.all([
    decodeWaveField(found,"HTSGW",lat,lon),decodeWaveField(found,"PERPW",lat,lon),decodeWaveField(found,"DIRPW",lat,lon)
  ]);
  const ok=Boolean(hs.ok&&period.ok&&direction.ok);
  return json({ok,stage:"decode-probe",provider:"NOAA/NCEP GFS-Wave",noSubscription:true,lat,lon,modelDate:found.cycle.date,cycleHourUTC:found.cycle.hour,forecastHour:found.forecastHour,file:found.file,wave:{heightM:hs.ok?Number(hs.value.toFixed(3)):null,periodS:period.ok?Number(period.value.toFixed(2)):null,directionDeg:direction.ok?Number(direction.value.toFixed(1)):null},diagnostics:{HTSGW:hs,PERPW:period,DIRPW:direction},note:ok?"Decoded point values from NOAA filtered GRIB2 subset.":"Transport works, but this response reports the GRIB2 packing details needed for the next decoder step."},ok?200:422);
}

async function probeSource(name,url,accept,timeoutMs=4500){
  const started=Date.now();
  try{
    const r=await timedFetch(url,{headers:{accept}},timeoutMs);
    const text=await r.text();
    return{name,ok:r.ok,status:r.status,latencyMs:Date.now()-started,contentType:r.headers.get("content-type"),sample:text.slice(0,160)};
  }catch(err){return{name,ok:false,status:null,latencyMs:Date.now()-started,error:String(err?.message||err)}}
}
function depthInfoUrl(lat,lon,layer="Dybdepunkt"){
  const d=0.02,p=new URLSearchParams();
  p.set("service","WMS");p.set("version","1.1.1");p.set("request","GetFeatureInfo");
  p.set("layers",layer);p.set("query_layers",layer);p.set("styles","");p.set("srs","EPSG:4326");
  p.set("bbox",`${lon-d},${lat-d},${lon+d},${lat+d}`);p.set("width","101");p.set("height","101");
  p.set("x","50");p.set("y","50");p.set("feature_count","10");p.set("format","image/png");p.set("info_format","text/plain");
  return `${KARTVERKET_WMS}?${p.toString()}`;
}
async function depthProbe(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon"));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  const capsUrl=`${KARTVERKET_WMS}?service=WMS&request=GetCapabilities&version=1.1.1`;
  const cap=await probeSource("Kartverket Dybdedata WMS",capsUrl,"application/xml,text/xml,*/*",5000);
  if(!cap.ok)return json({ok:false,stage:"norway-depth-probe",provider:"Kartverket Dybdedata WMS",lat,lon,capabilities:cap},502);
  const candidates=["Dybdepunkt","DYBDEPUNKT"];
  const attempts=[];
  for(const layer of candidates){
    const endpoint=depthInfoUrl(lat,lon,layer),started=Date.now();
    try{
      const r=await timedFetch(endpoint,{headers:{accept:"text/plain,text/html,application/vnd.ogc.gml,*/*"}},5500);
      const text=await r.text();
      const clean=text.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
      const numbers=[...clean.matchAll(/(?:dybde|depth)[^\d-]{0,24}(-?\d+(?:[.,]\d+)?)/ig)].map(m=>Number(m[1].replace(",","."))).filter(Number.isFinite);
      const attempt={layer,ok:r.ok,status:r.status,latencyMs:Date.now()-started,contentType:r.headers.get("content-type"),sample:clean.slice(0,500),depthCandidates:numbers.slice(0,10)};
      attempts.push(attempt);
      if(r.ok&&clean&&!/ServiceException|LayerNotDefined/i.test(text))return json({ok:true,stage:"norway-depth-probe",provider:"Kartverket Dybdedata WMS",planningOnly:true,lat,lon,datum:"Sjøkartnull",datumCode:"EPSG:9672",layer,featureInfo:attempt,note:"A successful GetFeatureInfo response confirms the runtime path. Depth parsing will be locked to the exact returned field name before production UKC."});
    }catch(err){attempts.push({layer,ok:false,error:String(err?.message||err)})}
  }
  return json({ok:false,stage:"norway-depth-probe",provider:"Kartverket Dybdedata WMS",planningOnly:true,lat,lon,datum:"Sjøkartnull",capabilities:cap,attempts},502);
}
async function ukcSourceProbe(){
  const [depthNorwayWfs,depthNorwayWms,waterNorway,bathyGlobal]=await Promise.all([
    probeSource("Kartverket Sjøkart Dybdedata WFS",KARTVERKET_WFS,"application/xml,text/xml,*/*"),
    probeSource("Kartverket Sjøkart Dybdedata WMS",`${KARTVERKET_WMS}?service=WMS&request=GetCapabilities&version=1.1.1`,"application/xml,text/xml,*/*"),
    probeSource("Kartverket water level/tide API",KARTVERKET_TIDE,"application/xml,text/xml,*/*"),
    probeSource("GEBCO 2026 WMS",GEBCO_WMS,"application/xml,text/xml,*/*")
  ]);
  return json({
    ok:(depthNorwayWfs.ok||depthNorwayWms.ok)&&waterNorway.ok&&bathyGlobal.ok,
    stage:"source-connectivity-probe",productionUKC:false,planningOnly:true,
    norway:{depth:{wfs:{...depthNorwayWfs,datum:"Sjøkartnull / EPSG:9672"},wms:{...depthNorwayWms,datum:"Sjøkartnull / EPSG:9672"},classification:"planning-only candidate"},waterLevel:{...waterNorway,datum:"Sjøkartnull when requested as Chart Datum (CD)",classification:"planning-only candidate"},datumCompatibility:"promising; point lookup and exact response parsing still to be validated"},
    global:{bathymetry:{...bathyGlobal,datum:"GEBCO MSL-assumed / heterogeneous shallow-water sources",classification:"planning-only"},tide:{name:"FES2022B",ok:false,status:"not-runtime-integrated",classification:"candidate; registration/licence acceptance and datum chain still required"},datumCompatibility:"not yet sufficient for an automatic global UKC calculation"},
    next:"Validate /api/wave/point-probe and /api/ukc/depth-probe, then implement /api/bathymetry and /api/water-level before /api/ukc."
  });
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/wave/probe")return waveProbe(url);
    if(request.method==="GET"&&url.pathname==="/api/wave/point-probe")return wavePointProbe(url);
    if(request.method==="GET"&&url.pathname==="/api/ukc/source-probe")return ukcSourceProbe();
    if(request.method==="GET"&&url.pathname==="/api/ukc/depth-probe")return depthProbe(url);
    return previousWorker.fetch(request,env,ctx);
  }
};
