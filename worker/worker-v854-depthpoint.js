import previousWorker from "./worker-v854-depthwcs.js";

const WCS_BASE="https://wms.geonorge.no/skwms1/wms.dtm2";
const USER_AGENT="MarineTools/8.5.4 probe contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};
const COVERAGES=new Set(["bathymetry50m","bathymetry25m","bathymetry05m"]);

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function rad(d){return d*Math.PI/180}
function etrs89Utm33(lat,lon){
  const a=6378137.0,f=1/298.257222101,k0=0.9996,lon0=rad(15),phi=rad(lat),lam=rad(lon);
  const e2=f*(2-f),ep2=e2/(1-e2),s=Math.sin(phi),c=Math.cos(phi),t=Math.tan(phi);
  const N=a/Math.sqrt(1-e2*s*s),T=t*t,C=ep2*c*c,A=c*(lam-lon0);
  const e4=e2*e2,e6=e4*e2;
  const M=a*((1-e2/4-3*e4/64-5*e6/256)*phi-(3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*phi)+(15*e4/256+45*e6/1024)*Math.sin(4*phi)-(35*e6/3072)*Math.sin(6*phi));
  const x=500000+k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120);
  const y=k0*(M+N*t*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));
  return{x,y};
}
async function timedFetch(url,timeoutMs=8000){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort("timeout"),timeoutMs);
  try{return await fetch(url,{signal:ac.signal,headers:{"user-agent":USER_AGENT,accept:"image/tiff,application/octet-stream,*/*"}})}
  finally{clearTimeout(timer)}
}
function typeSize(t){return({1:1,2:1,3:2,4:4,5:8,6:1,7:1,8:2,9:4,10:8,11:4,12:8})[t]||0}
function parseTiff(bytes){
  if(bytes.length<8)throw new Error("TIFF response too short");
  const little=bytes[0]===0x49&&bytes[1]===0x49,big=bytes[0]===0x4d&&bytes[1]===0x4d;
  if(!little&&!big)throw new Error("Response is not TIFF");
  const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),le=little;
  const u16=o=>dv.getUint16(o,le),u32=o=>dv.getUint32(o,le),i16=o=>dv.getInt16(o,le),i32=o=>dv.getInt32(o,le),f32=o=>dv.getFloat32(o,le),f64=o=>dv.getFloat64(o,le);
  if(u16(2)!==42)throw new Error("Unsupported TIFF magic");
  const ifd=u32(4);if(ifd+2>bytes.length)throw new Error("Invalid TIFF IFD");
  const count=u16(ifd),tags=new Map();
  function vals(entry){
    const type=u16(entry+2),n=u32(entry+4),sz=typeSize(type);if(!sz||n>100000)return[];
    const total=sz*n,base=total<=4?entry+8:u32(entry+8);if(base<0||base+total>bytes.length)return[];
    const out=[];
    for(let i=0;i<n;i++){
      const o=base+i*sz;
      if(type===1||type===6||type===7)out.push(bytes[o]);
      else if(type===2)out.push(String.fromCharCode(bytes[o]));
      else if(type===3)out.push(u16(o));else if(type===4)out.push(u32(o));else if(type===8)out.push(i16(o));else if(type===9)out.push(i32(o));else if(type===11)out.push(f32(o));else if(type===12)out.push(f64(o));
    }
    return type===2?[out.join('').replace(/\0+$/,'')]:out;
  }
  for(let i=0;i<count;i++){const e=ifd+2+i*12;if(e+12>bytes.length)break;tags.set(u16(e),vals(e))}
  const one=t=>tags.get(t)?.[0]??null,arr=t=>tags.get(t)||[];
  const width=one(256),height=one(257),bits=one(258)||8,compression=one(259)||1,samples=one(277)||1,sampleFormat=one(339)||1,rowsPerStrip=one(278)||height;
  const stripOffsets=arr(273),stripByteCounts=arr(279),tileOffsets=arr(324),tileByteCounts=arr(325),nodata=one(42113);
  const meta={byteOrder:le?"II":"MM",width,height,bitsPerSample:bits,compression,samplesPerPixel:samples,sampleFormat,rowsPerStrip,stripOffsets,stripByteCounts,tileOffsets,tileByteCounts,nodata};
  let value=null,decodeReason=null;
  if(compression!==1)decodeReason=`compression-${compression}-not-yet-decoded`;
  else if(!width||!height)decodeReason="missing-raster-dimensions";
  else if(!stripOffsets.length)decodeReason=tileOffsets.length?"tiled-tiff-not-yet-decoded":"missing-strip-offset";
  else if(![8,16,32,64].includes(bits))decodeReason=`bits-${bits}-unsupported`;
  else{
    const row=Math.floor(height/2),col=Math.floor(width/2),rps=Math.max(1,rowsPerStrip||height),strip=Math.min(stripOffsets.length-1,Math.floor(row/rps));
    const rowIn=row-strip*rps,bps=bits/8,offset=stripOffsets[strip]+((rowIn*width+col)*samples)*bps;
    if(offset+bps>bytes.length)decodeReason="sample-outside-response";
    else if(sampleFormat===3&&bits===32)value=f32(offset);
    else if(sampleFormat===3&&bits===64)value=f64(offset);
    else if(sampleFormat===2&&bits===16)value=i16(offset);
    else if(sampleFormat===2&&bits===32)value=i32(offset);
    else if(sampleFormat===1&&bits===8)value=bytes[offset];
    else if(sampleFormat===1&&bits===16)value=u16(offset);
    else if(sampleFormat===1&&bits===32)value=u32(offset);
    else decodeReason=`sample-format-${sampleFormat}-bits-${bits}-unsupported`;
  }
  return{meta,value,decodeReason};
}
function getCoverageUrl(coverage,x,y){
  const p=new URLSearchParams();
  p.set("service","WCS");p.set("version","2.0.1");p.set("request","GetCoverage");p.set("coverageId",coverage);
  p.append("subset",`x(${(x-1).toFixed(3)},${(x+1).toFixed(3)})`);p.append("subset",`y(${(y-1).toFixed(3)},${(y+1).toFixed(3)})`);p.set("format","image/tiff");
  return `${WCS_BASE}?${p.toString()}`;
}
async function depthPointProbe(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon")),coverage=String(url.searchParams.get("coverage")||"bathymetry50m");
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  if(!COVERAGES.has(coverage))return json({error:"Unknown coverage",allowed:[...COVERAGES]},400);
  const projected=etrs89Utm33(lat,lon),endpoint=getCoverageUrl(coverage,projected.x,projected.y),started=Date.now();
  try{
    const r=await timedFetch(endpoint,9000),contentType=r.headers.get("content-type")||"",ab=await r.arrayBuffer(),bytes=new Uint8Array(ab);
    if(!r.ok||/xml|text/i.test(contentType)){
      const text=new TextDecoder().decode(bytes).replace(/\s+/g," ").slice(0,1000);
      return json({ok:false,stage:"norway-depth-point-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,coverage,lat,lon,projected:{crs:"EPSG:25833",easting:Number(projected.x.toFixed(3)),northing:Number(projected.y.toFixed(3))},status:r.status,latencyMs:Date.now()-started,contentType,bytes:bytes.length,sample:text},502);
    }
    let parsed;try{parsed=parseTiff(bytes)}catch(err){return json({ok:false,stage:"norway-depth-point-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,coverage,lat,lon,projected:{crs:"EPSG:25833",easting:Number(projected.x.toFixed(3)),northing:Number(projected.y.toFixed(3))},status:r.status,latencyMs:Date.now()-started,contentType,bytes:bytes.length,error:String(err?.message||err)},502)}
    const decoded=Number.isFinite(parsed.value);
    return json({ok:decoded,stage:"norway-depth-point-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,coverage,lat,lon,projected:{crs:"EPSG:25833",easting:Number(projected.x.toFixed(3)),northing:Number(projected.y.toFixed(3))},status:r.status,latencyMs:Date.now()-started,contentType,bytes:bytes.length,raster:{valueM:decoded?parsed.value:null,...parsed.meta},decodeReason:parsed.decodeReason,note:decoded?"A numeric Kartverket raster value was decoded. Sign convention and vertical reference still need to be locked before this becomes an automatic UKC depth.":"GetCoverage succeeded, but the TIFF metadata shows what decoder support is still needed."},decoded?200:422);
  }catch(err){return json({ok:false,stage:"norway-depth-point-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,coverage,lat,lon,error:String(err?.message||err),latencyMs:Date.now()-started},502)}
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/ukc/depth-point-probe")return depthPointProbe(url);
    return previousWorker.fetch(request,env,ctx);
  }
};
