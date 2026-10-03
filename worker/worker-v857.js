import previousWorker from "./worker-v856.js";

const VERSION="8.5.7";
const BUILD="20261003-v8-5-7";
const RELEASED="2026-10-03";
const ANALYTICS_DATASET="events.analyticsEngine.marine_tools_usage";
const cors={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8","cache-control":"no-store"}});

async function analyticsSql(env,query,params={}){
  if(!env.ANALYTICS_SQL)throw new Error("Analytics SQL binding is not configured");
  try{return await env.ANALYTICS_SQL.query({query,params})}catch(e){if(e?.retryable){await new Promise(r=>setTimeout(r,120));return env.ANALYTICS_SQL.query({query,params})}throw e}
}
function period(range){
  const allowed=new Set(["24h","7d","30d","90d"]),r=allowed.has(range)?range:"24h",days=r==="90d"?90:r==="30d"?30:r==="7d"?7:1,now=Date.now();
  return{start:new Date(now-days*86400000).toISOString(),end:new Date(now).toISOString()};
}
function percentile(values,p){
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;
  const i=Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1));return a[i];
}
function technicalHealth(rows){
  const map=new Map(),sources=new Map();
  for(const r of rows||[]){
    const event=String(r.event_name||""),tool=String(r.tool||"unknown"),ts=String(r.timestamp||"");
    if(event==="data_source"){
      const x=sources.get(tool)||{source:tool,count:0,lastSeen:null};x.count+=1;if(!x.lastSeen||ts>x.lastSeen)x.lastSeen=ts;sources.set(tool,x);continue;
    }
    if(event!=="live_request_ok"&&event!=="live_request_error")continue;
    const x=map.get(tool)||{endpoint:tool,ok:0,error:0,durations:[],lastSeen:null,lastError:null};
    if(event==="live_request_ok")x.ok+=1;else{x.error+=1;if(!x.lastError||ts>x.lastError)x.lastError=ts}
    const d=Number(r.duration);if(Number.isFinite(d)&&d>=0)x.durations.push(d);if(!x.lastSeen||ts>x.lastSeen)x.lastSeen=ts;map.set(tool,x);
  }
  const endpoints=[...map.values()].map(x=>{
    const requests=x.ok+x.error,avg=x.durations.length?x.durations.reduce((a,b)=>a+b,0)/x.durations.length:0;
    return{endpoint:x.endpoint,requests,ok:x.ok,error:x.error,successRate:requests?x.ok/requests*100:0,avgLatencySeconds:avg,p95LatencySeconds:percentile(x.durations,.95),maxLatencySeconds:x.durations.length?Math.max(...x.durations):0,lastSeen:x.lastSeen,lastError:x.lastError};
  }).sort((a,b)=>b.requests-a.requests);
  const total=endpoints.reduce((s,x)=>s+x.requests,0),ok=endpoints.reduce((s,x)=>s+x.ok,0),allDur=endpoints.flatMap(x=>map.get(x.endpoint)?.durations||[]),latestError=endpoints.map(x=>x.lastError).filter(Boolean).sort().at(-1)||null;
  return{sampleLimit:5000,requests:total,successRate:total?ok/total*100:0,avgLatencySeconds:allDur.length?allDur.reduce((a,b)=>a+b,0)/allDur.length:0,p95LatencySeconds:percentile(allDur,.95),maxLatencySeconds:allDur.length?Math.max(...allDur):0,latestError,endpoints,sources:[...sources.values()].sort((a,b)=>b.count-a.count)};
}
async function enrichAnalytics(request,env,baseResponse){
  let base;try{base=await baseResponse.clone().json()}catch{return baseResponse}
  const url=new URL(request.url),p=period(url.searchParams.get("range")||"24h");
  try{
    const q=`SELECT blob1 AS event_name, blob3 AS tool, double2 AS duration, timestamp FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('live_request_ok','live_request_error','data_source') ORDER BY timestamp DESC LIMIT 5000`;
    const r=await analyticsSql(env,q,p);base.technicalHealth=technicalHealth(r.data||[]);
  }catch(e){base.technicalHealth={error:String(e?.message||e),requests:0,successRate:0,avgLatencySeconds:0,p95LatencySeconds:0,maxLatencySeconds:0,latestError:null,endpoints:[],sources:[]}}
  base.release={version:VERSION,build:BUILD,released:RELEASED};
  return json(base);
}
function techHtml(){return `
<div class="panel" id="mtTechnicalHealth" style="margin-top:12px">
  <div class="panel-head"><h2>Technical health</h2><span class="pill mono" id="mtReleasePill">v${VERSION}</span></div>
  <div class="cards" style="grid-template-columns:repeat(5,minmax(130px,1fr));margin:0 0 12px">
    <div class="card"><small>Live requests</small><strong id="mtTechRequests">—</strong><div class="delta flat">Weather · AIS · route</div></div>
    <div class="card"><small>Success rate</small><strong id="mtTechSuccess">—</strong><div class="delta flat">Current range</div></div>
    <div class="card"><small>Average latency</small><strong id="mtTechAvg">—</strong><div class="delta flat">Client-observed</div></div>
    <div class="card"><small>P95 latency</small><strong id="mtTechP95">—</strong><div class="delta flat">Latest 5,000 events max</div></div>
    <div class="card"><small>Latest error</small><strong id="mtTechError" style="font-size:17px">—</strong><div class="delta flat">Timestamp only; no user data</div></div>
  </div>
  <div class="tables" style="margin-top:0">
    <div><h2>Endpoints</h2><div id="mtEndpointHealth" class="status">Loading…</div></div>
    <div><h2>Observed data sources</h2><div id="mtSourceHealth" class="status">Loading…</div></div>
  </div>
</div>`}
function techScript(){return `<script>(function(){
function n(v){return Number(v)||0}function pct(v){return n(v).toFixed(1)+'%'}function sec(v){v=n(v);return v<1?(v*1000).toFixed(0)+' ms':v.toFixed(2)+' s'}function when(v){if(!v)return 'None';var d=new Date(v);return isNaN(d)?String(v):d.toISOString().replace('T',' ').slice(0,16)+' UTC'}function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function rows(items,type){if(!items||!items.length)return '<div class="empty">No observations in this period.</div>';if(type==='source')return '<table><thead><tr><th>Source</th><th>Events</th><th>Last seen</th></tr></thead><tbody>'+items.map(function(x){return '<tr><td>'+esc(x.source)+'</td><td>'+n(x.count).toLocaleString()+'</td><td>'+esc(when(x.lastSeen))+'</td></tr>'}).join('')+'</tbody></table>';return '<table><thead><tr><th>Endpoint</th><th>Requests</th><th>Success</th><th>Avg</th><th>P95</th><th>Max</th><th>Last error</th></tr></thead><tbody>'+items.map(function(x){return '<tr><td>'+esc(x.endpoint)+'</td><td>'+n(x.requests).toLocaleString()+'</td><td>'+pct(x.successRate)+'</td><td>'+sec(x.avgLatencySeconds)+'</td><td>'+sec(x.p95LatencySeconds)+'</td><td>'+sec(x.maxLatencySeconds)+'</td><td>'+esc(when(x.lastError))+'</td></tr>'}).join('')+'</tbody></table>'}
async function loadTech(){var active=document.querySelector('.range button.active'),range=active&&active.dataset.range||'24h';try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin'}),d=await r.json(),h=d.technicalHealth||{};document.getElementById('mtReleasePill').textContent='v'+((d.release&&d.release.version)||'${VERSION}');document.getElementById('mtTechRequests').textContent=n(h.requests).toLocaleString();document.getElementById('mtTechSuccess').textContent=pct(h.successRate);document.getElementById('mtTechAvg').textContent=sec(h.avgLatencySeconds);document.getElementById('mtTechP95').textContent=sec(h.p95LatencySeconds);document.getElementById('mtTechError').textContent=when(h.latestError);document.getElementById('mtEndpointHealth').innerHTML=rows(h.endpoints,'endpoint');document.getElementById('mtSourceHealth').innerHTML=rows(h.sources,'source')}catch(e){document.getElementById('mtEndpointHealth').innerHTML='<div class="error">Technical-health data unavailable.</div>'}}
setTimeout(loadTech,0);document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){setTimeout(loadTech,80)})});document.getElementById('refresh')&&document.getElementById('refresh').addEventListener('click',function(){setTimeout(loadTech,80)});
})();</script>`}
async function enrichDashboard(baseResponse){
  if(!baseResponse.ok)return baseResponse;let html=await baseResponse.text();
  const section=techHtml();if(html.includes('<div class="footer">'))html=html.replace('<div class="footer">',section+'<div class="footer">');else html=html.replace('</body>',section+'</body>');
  html=html.replace('</body>',techScript()+'</body>');
  return new Response(html,{status:baseResponse.status,headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
}
async function health(request,env){
  const r=await previousWorker.fetch(request,env);let d={};try{d=await r.clone().json()}catch{}
  if(!r.ok)return r;d.release={version:VERSION,build:BUILD,released:RELEASED};d.capabilities=[...new Set([...(d.capabilities||[]),"release-metadata","technical-health-v857","post-deploy-smoke-tests"])];return json(d);
}

export default{async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==="OPTIONS")return previousWorker.fetch(request,env);
  if(url.pathname==="/api/release")return json({version:VERSION,build:BUILD,released:RELEASED,worker:"worker-v857"});
  if(url.pathname==="/api/health")return health(request,env);
  if(url.pathname==="/admin/api/analytics"){
    const base=await previousWorker.fetch(request,env);if(!base.ok)return base;return enrichAnalytics(request,env,base);
  }
  if(url.pathname==="/admin/analytics"){
    const base=await previousWorker.fetch(request,env);return enrichDashboard(base);
  }
  return previousWorker.fetch(request,env);
}};
