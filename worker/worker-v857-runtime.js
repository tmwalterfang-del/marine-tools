import appWorker from "./worker-v857.js";

const VERSION="8.5.7";
const ANALYTICS_DATASET="events.analyticsEngine.marine_tools_usage";
const CORS={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...CORS,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}});

function smokeRequest(path){return new Request(`https://api.marinetools.app${path}`,{headers:{origin:"https://marinetools.app",referer:"https://marinetools.app/","user-agent":"MarineTools-Runtime-Smoke/8.5.7",accept:"application/json"}})}
function finite(v){return Number.isFinite(Number(v))}
function validWeather(data){return Array.isArray(data?.forecast)&&data.forecast.length>0}
function validWave(data){return validWeather(data)&&data.forecast.some(r=>finite(r?.hs))}
function validAis(data){return Array.isArray(data)||(data&&typeof data==="object"&&!data.error)}
function writeSmoke(env,name,ok,duration,error=""){
  if(!env.ANALYTICS)return;
  env.ANALYTICS.writeDataPoint({
    blobs:[ok?"runtime_smoke_ok":"runtime_smoke_error","runtime",name,"cloudflare-cron",VERSION,error?String(error).slice(0,120):""],
    doubles:[1,Math.max(0,Math.min(120,Number(duration)||0))],
    indexes:["marine-tools"]
  });
}
async function check(env,name,path,validator){
  const start=Date.now();
  try{
    const r=await appWorker.fetch(smokeRequest(path),env),data=await r.clone().json().catch(()=>null),ok=Boolean(r.ok&&validator(data,r));
    writeSmoke(env,name,ok,(Date.now()-start)/1000,ok?"":`HTTP ${r.status}`);
    return{check:name,ok,status:r.status,durationSeconds:(Date.now()-start)/1000};
  }catch(e){
    writeSmoke(env,name,false,(Date.now()-start)/1000,e?.message||e);
    return{check:name,ok:false,status:"error",durationSeconds:(Date.now()-start)/1000,error:String(e?.message||e)};
  }
}
async function runRuntimeSmoke(env,scheduledTime){
  const at=new Date(Number(scheduledTime)||Date.now()),minute=at.getUTCMinutes();
  const checks=[check(env,"health","/api/health",d=>d?.status==="ok"&&d?.release?.version===VERSION)];
  if(minute===0){
    checks.push(
      check(env,"weather-inland","/api/weather?lat=59.42&lon=10.48&limit=2",validWeather),
      check(env,"weather-norway-sea","/api/weather?lat=58.20&lon=7.00&limit=2",validWeather),
      check(env,"weather-global-wave","/api/weather?lat=40&lon=-30&limit=2",validWave),
      check(env,"ais-norway","/api/ais/latest?minLat=59.35&maxLat=59.50&minLon=10.35&maxLon=10.65",validAis),
      check(env,"ais-global","/api/ais/latest?minLat=39&maxLat=41&minLon=-31&maxLon=-29",validAis)
    );
  }
  return Promise.all(checks);
}

async function analyticsSql(env,query,params={}){
  if(!env.ANALYTICS_SQL)throw new Error("Analytics SQL binding is not configured");
  try{return await env.ANALYTICS_SQL.query({query,params})}catch(e){if(e?.retryable){await new Promise(r=>setTimeout(r,120));return env.ANALYTICS_SQL.query({query,params})}throw e}
}
function analyticsRange(range){
  const days=range==="90d"?90:range==="30d"?30:range==="7d"?7:1,now=Date.now();
  return{start:new Date(now-days*86400000).toISOString(),end:new Date(now).toISOString()};
}
function summarizeSmoke(rows){
  const latest=new Map();let ok=0,error=0;
  for(const r of rows||[]){
    const name=String(r.tool||"unknown"),isOk=r.event_name==="runtime_smoke_ok",ts=String(r.timestamp||"");
    if(isOk)ok++;else error++;
    const cur=latest.get(name);if(!cur||ts>cur.timestamp)latest.set(name,{check:name,ok:isOk,timestamp:ts,durationSeconds:Number(r.duration)||0,error:String(r.error||"")});
  }
  const checks=[...latest.values()].sort((a,b)=>a.check.localeCompare(b.check)),lastRun=checks.map(x=>x.timestamp).filter(Boolean).sort().at(-1)||null;
  return{ok,error,total:ok+error,lastRun,checks};
}
async function addRuntimeSmoke(request,env,response){
  let body;try{body=await response.clone().json()}catch{return response}
  const p=analyticsRange(new URL(request.url).searchParams.get("range")||"24h");
  try{
    const q=`SELECT blob1 AS event_name, blob3 AS tool, blob6 AS error, double2 AS duration, timestamp FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('runtime_smoke_ok','runtime_smoke_error') ORDER BY timestamp DESC LIMIT 2000`;
    const r=await analyticsSql(env,q,p);body.runtimeSmoke=summarizeSmoke(r.data||[]);
  }catch(e){body.runtimeSmoke={error:String(e?.message||e),ok:0,errorCount:0,total:0,lastRun:null,checks:[]}}
  return json(body);
}
function smokePanel(){return `<div class="panel" id="mtRuntimeSmoke" style="margin-top:12px"><div class="panel-head"><h2>Cloudflare runtime smoke</h2><span class="pill mono">15 min health · hourly deep check</span></div><div id="mtRuntimeSmokeBody" class="status">Loading…</div></div>`}
function smokeScript(){return `<script>(function(){function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}function when(v){if(!v)return 'Waiting for first scheduled run';var d=new Date(v);return isNaN(d)?String(v):d.toISOString().replace('T',' ').slice(0,16)+' UTC'}function sec(v){v=Number(v)||0;return v<1?(v*1000).toFixed(0)+' ms':v.toFixed(2)+' s'}async function load(){var root=document.getElementById('mtRuntimeSmokeBody');if(!root)return;var active=document.querySelector('.range button.active'),range=active&&active.dataset.range||'24h';try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin'}),d=await r.json(),s=d.runtimeSmoke||{},checks=s.checks||[];if(!checks.length){root.innerHTML='<div class="empty">'+esc(when(s.lastRun))+'</div>';return}root.innerHTML='<table><thead><tr><th>Check</th><th>Status</th><th>Latency</th><th>Last run</th></tr></thead><tbody>'+checks.map(function(x){return '<tr><td>'+esc(x.check)+'</td><td>'+(x.ok?'OK':'ERROR')+'</td><td>'+sec(x.durationSeconds)+'</td><td>'+esc(when(x.timestamp))+'</td></tr>'}).join('')+'</tbody></table>'}catch(e){root.innerHTML='<div class="error">Runtime smoke status unavailable.</div>'}}setTimeout(load,0);document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){setTimeout(load,100)})});document.getElementById('refresh')&&document.getElementById('refresh').addEventListener('click',function(){setTimeout(load,100)});})();</script>`}
async function addSmokeDashboard(response){
  if(!response.ok)return response;let html=await response.text(),panel=smokePanel();
  if(html.includes('<div class="footer">'))html=html.replace('<div class="footer">',panel+'<div class="footer">');else html=html.replace('</body>',panel+'</body>');
  html=html.replace('</body>',smokeScript()+'</body>');
  return new Response(html,{status:response.status,headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
}

export default{
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==="/admin/api/analytics"){
      const base=await appWorker.fetch(request,env);if(!base.ok)return base;return addRuntimeSmoke(request,env,base);
    }
    if(url.pathname==="/admin/analytics")return addSmokeDashboard(await appWorker.fetch(request,env));
    return appWorker.fetch(request,env);
  },
  async scheduled(controller,env,ctx){ctx.waitUntil(runRuntimeSmoke(env,controller.scheduledTime))}
};
