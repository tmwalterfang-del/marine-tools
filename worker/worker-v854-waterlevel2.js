import previousWorker from "./worker-v854-waterlevel.js";

const TIDE_API="https://vannstand.kartverket.no/tideapi.php";
const USER_AGENT="MarineTools/8.5.4 probe contact@marinetools.app";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type"};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}})}
function num(v){if(v==null||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null}
function attr(tag,name){const m=new RegExp(`${name}=["']([^"']*)["']`,`i`).exec(tag);return m?m[1]:null}
function fmtUtcMinute(d){return d.toISOString().slice(0,16)}
function parseTarget(v){if(!v)return new Date();const d=new Date(v);return Number.isFinite(d.getTime())?d:null}
function unitToMetres(value,unit){const u=String(unit||'cm').toLowerCase();if(u==='m')return value;if(u==='mm')return value/1000;return value/100}
function parseWaterLevelXml(xml,targetMs){
  const childRef=(/<reflevelcode>([^<]+)<\/reflevelcode>/i.exec(xml)?.[1]||null)?.trim()||null;
  const locTag=/<location\b[^>]*>/i.exec(xml)?.[0]||"";
  const location={
    name:attr(locTag,"name"),code:attr(locTag,"code"),latitude:num(attr(locTag,"latitude")),longitude:num(attr(locTag,"longitude")),
    delayMinutes:num(attr(locTag,"delay")),factor:num(attr(locTag,"factor")),observationName:attr(locTag,"obsname"),observationCode:attr(locTag,"obscode"),description:attr(locTag,"descr")
  };
  const series=[];let reflevel=childRef;
  const dataRe=/<data\b([^>]*)>([\s\S]*?)<\/data>/gi;let dm;
  while((dm=dataRe.exec(xml))){
    const open=`<data${dm[1]}>`,body=dm[2],type=attr(open,"type"),unit=attr(open,"unit"),qualityFlag=attr(open,"qualityFlag"),qualityClass=attr(open,"qualityClass"),qualityDescription=attr(open,"qualityDescription"),dataRef=attr(open,"reflevelcode");
    if(!reflevel&&dataRef)reflevel=dataRef;
    const points=[];const wlRe=/<waterlevel\b([^>]*)\/?\s*>/gi;let wm;
    while((wm=wlRe.exec(body))){
      const tag=`<waterlevel${wm[1]}>`,value=num(attr(tag,"value")),time=attr(tag,"time"),flag=attr(tag,"flag"),uncertainty=num(attr(tag,"uncertainty"));
      const ms=time?Date.parse(time):NaN;
      if(value!=null&&Number.isFinite(ms))points.push({value,time,flag,uncertainty,deltaMinutes:Math.round((ms-targetMs)/60000)});
    }
    if(points.length)series.push({type,unit,qualityFlag,qualityClass,qualityDescription,reflevel:dataRef||reflevel,points});
  }
  const candidates=[];
  for(const s of series)for(const p of s.points)candidates.push({...p,valueM:Number(unitToMetres(p.value,s.unit).toFixed(3)),type:s.type,unit:s.unit,qualityFlag:s.qualityFlag,qualityClass:s.qualityClass,reflevel:s.reflevel});
  candidates.sort((a,b)=>Math.abs(a.deltaMinutes)-Math.abs(b.deltaMinutes));
  return{reflevel,location,series,nearest:candidates[0]||null};
}
async function timedFetch(url,timeoutMs=7000){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort("timeout"),timeoutMs);
  try{return await fetch(url,{signal:ac.signal,headers:{"user-agent":USER_AGENT,accept:"application/xml,text/xml,*/*"}})}finally{clearTimeout(timer)}
}
async function waterLevelProbe(url){
  const lat=num(url.searchParams.get("lat")),lon=num(url.searchParams.get("lon")),target=parseTarget(url.searchParams.get("time"));
  if(lat==null||lon==null||lat<-90||lat>90||lon<-180||lon>180)return json({error:"Invalid latitude/longitude"},400);
  if(!target)return json({error:"Invalid time; use ISO 8601"},400);
  const from=new Date(target.getTime()-60*60000),to=new Date(target.getTime()+60*60000);
  const p=new URLSearchParams({lat:String(lat),lon:String(lon),fromtime:fmtUtcMinute(from),totime:fmtUtcMinute(to),datatype:"all",refcode:"cd",lang:"en",interval:"10",dst:"0",tzone:"0",uncertainty:"1",tide_request:"locationdata"});
  const endpoint=`${TIDE_API}?${p.toString()}`;const started=Date.now();
  try{
    const r=await timedFetch(endpoint,8000),text=await r.text(),parsed=parseWaterLevelXml(text,target.getTime());
    const apiError=/<error\b[^>]*>([^<]*)<\/error>/i.exec(text)?.[1]?.trim()||null;
    const datumOk=String(parsed.reflevel||"").toUpperCase()==="CD";
    const nearest=parsed.nearest||null;
    const ok=r.ok&&!apiError&&datumOk&&Boolean(nearest&&Number.isFinite(nearest.valueM));
    return json({
      ok,stage:"norway-water-level-probe",provider:"Kartverket water level/tide API",planningOnly:true,
      lat,lon,requestedTime:target.toISOString(),referenceLevel:parsed.reflevel,datum:"Sjøkartnull / Chart Datum (CD)",datumCompatibleWithNorwegianChartDepths:datumOk,
      status:r.status,latencyMs:Date.now()-started,contentType:r.headers.get("content-type"),location:parsed.location,nearest,
      series:parsed.series.map(s=>({type:s.type,unit:s.unit,reflevel:s.reflevel,qualityFlag:s.qualityFlag,qualityClass:s.qualityClass,qualityDescription:s.qualityDescription,count:s.points.length,first:s.points[0]||null,last:s.points.at(-1)||null})),
      apiError,endpoint:ok?undefined:endpoint,sample:ok?undefined:text.replace(/\s+/g," ").slice(0,1200),
      note:ok?"Kartverket returned a position-based numeric water level referenced to Chart Datum. This validates the water-level side of the Norwegian planning UKC datum chain.":"Water-level response did not yet validate a CD-referenced numeric value."
    },ok?200:502);
  }catch(err){return json({ok:false,stage:"norway-water-level-probe",provider:"Kartverket water level/tide API",planningOnly:true,lat,lon,error:String(err?.message||err),latencyMs:Date.now()-started},502)}
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(request.method==="GET"&&url.pathname==="/api/ukc/water-level-probe")return waterLevelProbe(url);
    return previousWorker.fetch(request,env,ctx);
  }
};
