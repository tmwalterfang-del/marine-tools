import previousWorker from "./worker-v854-probe.js";

const KARTVERKET_DTM_WCS_BASE="https://wms.geonorge.no/skwms1/wms.dtm2";
const KARTVERKET_DTM_WCS=`${KARTVERKET_DTM_WCS_BASE}?request=GetCapabilities&service=WCS`;
const USER_AGENT="MarineTools/8.5.4 probe contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};
const KNOWN_COVERAGES=new Set(["bathymetry50m","bathymetry25m","bathymetry05m"]);

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
async function timedFetch(url,timeoutMs=6000,accept="application/xml,text/xml,*/*"){
  const ac=new AbortController();
  const timer=setTimeout(()=>ac.abort("timeout"),timeoutMs);
  try{return await fetch(url,{signal:ac.signal,headers:{"user-agent":USER_AGENT,accept}})}
  finally{clearTimeout(timer)}
}
function coverageNames(xml){
  const out=[];
  const add=v=>{const s=String(v||'').trim();if(s&&!out.includes(s)&&out.length<50)out.push(s)};
  let m;
  const idRe=/<(?:(?:\w+):)?CoverageId\b[^>]*>([^<]+)<\/(?:(?:\w+):)?CoverageId>/gi;
  while((m=idRe.exec(xml))&&out.length<50)add(m[1]);
  if(out.length)return out;
  const briefRe=/<(?:\w+:)?CoverageOfferingBrief\b[\s\S]*?<(?:(?:\w+):)?name>([^<]+)<\/(?:(?:\w+):)?name>/gi;
  while((m=briefRe.exec(xml))&&out.length<50)add(m[1]);
  if(out.length)return out;
  const nameRe=/<(?:(?:\w+):)?name>([^<]+)<\/(?:(?:\w+):)?name>/gi;
  while((m=nameRe.exec(xml))&&out.length<50)add(m[1]);
  return out;
}
function firstMatch(text,re){const m=re.exec(text);return m?m[1].trim():null}
function allMatches(text,re,limit=20){const out=[];let m;while((m=re.exec(text))&&out.length<limit){const v=(m[1]||'').trim();if(v)out.push(v)}return out}
function describeMeta(xml){
  const envelopeTag=firstMatch(xml,/<(?:(?:\w+):)?Envelope\b([^>]*)>/i)||'';
  const srsName=firstMatch(envelopeTag,/\bsrsName=["']([^"']+)["']/i)||firstMatch(xml,/\bsrsName=["']([^"']+)["']/i);
  const axisLabels=firstMatch(envelopeTag,/\baxisLabels=["']([^"']+)["']/i)||firstMatch(xml,/\baxisLabels=["']([^"']+)["']/i);
  const lowerCorner=firstMatch(xml,/<(?:(?:\w+):)?lowerCorner\b[^>]*>([^<]+)</i);
  const upperCorner=firstMatch(xml,/<(?:(?:\w+):)?upperCorner\b[^>]*>([^<]+)</i);
  const origin=firstMatch(xml,/<(?:(?:\w+):)?pos\b[^>]*>([^<]+)</i);
  const offsetVectors=allMatches(xml,/<(?:(?:\w+):)?offsetVector\b[^>]*>([^<]+)</gi,8);
  const gridLow=firstMatch(xml,/<(?:(?:\w+):)?low\b[^>]*>([^<]+)</i);
  const gridHigh=firstMatch(xml,/<(?:(?:\w+):)?high\b[^>]*>([^<]+)</i);
  const fieldNames=allMatches(xml,/<(?:(?:\w+):)?field\b[^>]*name=["']([^"']+)["']/gi,20);
  return{coverageId:firstMatch(xml,/<(?:(?:\w+):)?CoverageId\b[^>]*>([^<]+)</i),srsName,axisLabels,lowerCorner,upperCorner,origin,offsetVectors,gridLow,gridHigh,fieldNames};
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
      note:"This validates the current Kartverket WCS endpoint and discovers WCS 2.0 CoverageId values."
    },r.ok&&coverages.length?200:502);
  }catch(err){
    return json({ok:false,stage:"norway-depth-wcs-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,error:String(err?.message||err),latencyMs:Date.now()-started},502);
  }
}
async function depthCoverageProbe(url){
  const coverage=String(url.searchParams.get("coverage")||"bathymetry50m").trim();
  if(!KNOWN_COVERAGES.has(coverage))return json({error:"Unknown coverage",allowed:[...KNOWN_COVERAGES]},400);
  const endpoint=`${KARTVERKET_DTM_WCS_BASE}?service=WCS&version=2.0.1&request=DescribeCoverage&coverageId=${encodeURIComponent(coverage)}`;
  const started=Date.now();
  try{
    const r=await timedFetch(endpoint,7000);
    const text=await r.text();
    const meta=describeMeta(text);
    const exception=/ExceptionReport|ExceptionText/i.test(text);
    const ok=r.ok&&!exception&&Boolean(meta.srsName||meta.axisLabels||meta.lowerCorner||meta.offsetVectors.length);
    return json({
      ok,
      stage:"norway-depth-coverage-probe",
      provider:"Kartverket Dybdedata terrengmodeller DTM WCS",
      planningOnly:true,
      coverage,
      status:r.status,
      latencyMs:Date.now()-started,
      contentType:r.headers.get("content-type"),
      endpoint,
      metadata:meta,
      sample:text.replace(/\s+/g," ").slice(0,1000),
      next:ok?"Use the returned CRS/axis metadata to build a tiny GetCoverage request around one sea point, then decode the returned raster value.":"Inspect the DescribeCoverage response before attempting GetCoverage."
    },ok?200:502);
  }catch(err){
    return json({ok:false,stage:"norway-depth-coverage-probe",provider:"Kartverket Dybdedata terrengmodeller DTM WCS",planningOnly:true,coverage,error:String(err?.message||err),latencyMs:Date.now()-started},502);
  }
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/ukc/depth-wcs-probe")return depthWcsProbe();
    if(request.method==="GET"&&url.pathname==="/api/ukc/depth-coverage-probe")return depthCoverageProbe(url);
    return previousWorker.fetch(request,env,ctx);
  }
};
