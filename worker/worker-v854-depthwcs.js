import previousWorker from "./worker-v854-probe.js";

const KARTVERKET_DTM_WCS="https://wms.geonorge.no/skwms1/wms.dtm2?request=GetCapabilities&service=WCS";
const USER_AGENT="MarineTools/8.5.4 probe contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
async function timedFetch(url,timeoutMs=6000){
  const ac=new AbortController();
  const timer=setTimeout(()=>ac.abort("timeout"),timeoutMs);
  try{return await fetch(url,{signal:ac.signal,headers:{"user-agent":USER_AGENT,accept:"application/xml,text/xml,*/*"}})}
  finally{clearTimeout(timer)}
}
function coverageNames(xml){
  const out=[];
  const re=/<(?:\w+:)?CoverageOfferingBrief\b[\s\S]*?<(?:(?:\w+):)?name>([^<]+)<\/(?:(?:\w+):)?name>/gi;
  let m;
  while((m=re.exec(xml))&&out.length<50)out.push(m[1].trim());
  if(out.length)return out;
  const fallback=/<(?:(?:\w+):)?name>([^<]+)<\/(?:(?:\w+):)?name>/gi;
  while((m=fallback.exec(xml))&&out.length<50){
    const v=m[1].trim();
    if(v&&!out.includes(v))out.push(v);
  }
  return out;
}
async function depthWcsProbe(){
  const started=Date.now();
  try{
    const r=await timedFetch(KARTVERKET_DTM_WCS,7000);
    const text=await r.text();
    const coverages=coverageNames(text);
    return json({
      ok:r.ok&&coverages.length>0,
      stage:"norway-depth-wcs-probe",
      provider:"Kartverket Dybdedata terrengmodeller DTM WCS",
      planningOnly:true,
      status:r.status,
      latencyMs:Date.now()-started,
      contentType:r.headers.get("content-type"),
      endpoint:KARTVERKET_DTM_WCS,
      coverages,
      sample:text.replace(/\s+/g," ").slice(0,500),
      note:"This validates the current Kartverket WCS endpoint and discovers coverage identifiers. The next step is a tiny GetCoverage request and GeoTIFF point decode before automatic UKC."
    },r.ok&&coverages.length?200:502);
  }catch(err){
    return json({ok:false,stage:"norway-depth-wcs-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,error:String(err?.message||err),latencyMs:Date.now()-started},502);
  }
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/ukc/depth-wcs-probe")return depthWcsProbe();
    return previousWorker.fetch(request,env,ctx);
  }
};
