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
  const total=endpoints.reduce((s,x)=>s+x.requests,0),ok=endpoints.reduce((s,x)=>s+x.ok,0),error=endpoints.reduce((s,x)=>s+x.error,0),allDur=endpoints.flatMap(x=>map.get(x.endpoint)?.durations||[]),latestError=endpoints.map(x=>x.lastError).filter(Boolean).sort().at(-1)||null;
  return{sampleLimit:5000,requests:total,errors:error,successRate:total?ok/total*100:0,avgLatencySeconds:allDur.length?allDur.reduce((a,b)=>a+b,0)/allDur.length:0,p95LatencySeconds:percentile(allDur,.95),maxLatencySeconds:allDur.length?Math.max(...allDur):0,latestError,endpoints,sources:[...sources.values()].sort((a,b)=>b.count-a.count)};
}
async function enrichAnalytics(request,env,baseResponse){
  let base;try{base=await baseResponse.clone().json()}catch{return baseResponse}
  const url=new URL(request.url),p=period(url.searchParams.get("range")||"24h");
  try{
    const q=`SELECT blob1 AS event_name, blob3 AS tool, double2 AS duration, timestamp FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('live_request_ok','live_request_error','data_source') ORDER BY timestamp DESC LIMIT 5000`;
    const r=await analyticsSql(env,q,p);base.technicalHealth=technicalHealth(r.data||[]);
  }catch(e){base.technicalHealth={error:String(e?.message||e),requests:0,errors:0,successRate:0,avgLatencySeconds:0,p95LatencySeconds:0,maxLatencySeconds:0,latestError:null,endpoints:[],sources:[]}}
  base.release={version:VERSION,build:BUILD,released:RELEASED};
  return json(base);
}
function dashboardCss(){return `
.mt-secondary-kpi{display:none!important}
.mt-health-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0 12px}
.mt-health-kpi{padding:13px;border:1px solid #173e56;background:#082033;border-radius:11px;min-width:0}
.mt-health-kpi small{display:block;color:var(--muted);margin-bottom:5px}.mt-health-kpi strong{display:block;font-size:23px;font-variant-numeric:tabular-nums}.mt-health-kpi span{display:block;color:var(--muted);font-size:11px;margin-top:3px}
.mt-health-line{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-bottom:12px}.mt-health-state{font-weight:700}.mt-health-state.good{color:var(--green)}.mt-health-state.warn{color:var(--amber)}.mt-health-state.bad{color:var(--red)}
.mt-source-list{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 13px}.mt-source-chip{display:grid;grid-template-columns:auto auto;gap:1px 8px;align-items:center;border:1px solid #173e56;background:#082033;border-radius:10px;padding:9px 10px;min-width:150px}.mt-source-chip b{font-size:14px}.mt-source-chip small{grid-column:1/-1;color:var(--muted);font-size:10px}
.mt-details,.mt-more{border:1px solid #173e56;border-radius:11px;background:#081f30;overflow:hidden}.mt-details>summary,.mt-more>summary{cursor:pointer;list-style:none;padding:12px 13px;font-weight:700;color:#cfe2ec;display:flex;align-items:center;justify-content:space-between}.mt-details>summary::-webkit-details-marker,.mt-more>summary::-webkit-details-marker{display:none}.mt-details>summary:after,.mt-more>summary:after{content:'+';font-size:18px;color:var(--cyan)}.mt-details[open]>summary:after,.mt-more[open]>summary:after{content:'–'}.mt-details-body,.mt-more-body{padding:0 12px 12px}
.mt-endpoint-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mt-endpoint{border:1px solid #173e56;background:#082033;border-radius:10px;padding:10px;min-width:0}.mt-endpoint-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.mt-endpoint-head b{overflow-wrap:anywhere}.mt-endpoint-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.mt-endpoint-grid small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.mt-endpoint-grid span{display:block;font-variant-numeric:tabular-nums}.mt-endpoint-foot{margin-top:7px;color:var(--muted);font-size:10px;overflow-wrap:anywhere}
.mt-more{margin:12px 0}.mt-more-body>.section-title:first-child{margin-top:8px}.mt-more-body>.section-title{margin-top:18px}.mt-more-body>.grid,.mt-more-body>.tables{margin-top:0}
#mtRuntimeSmoke{margin-top:12px!important;background:#082033!important}.mt-hidden-base-health{display:none!important}
@media(max-width:700px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.mt-health-summary{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mt-health-kpi{padding:10px 8px}.mt-health-kpi strong{font-size:18px}.mt-health-kpi small{font-size:10px}.mt-endpoint-list{grid-template-columns:1fr}.mt-endpoint-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.mt-source-chip{min-width:0;flex:1 1 140px}.mt-details-body,.mt-more-body{padding:0 8px 8px}.mt-more-body .panel{padding:10px}.mt-more-body table{font-size:12px}.mt-more-body th,.mt-more-body td{padding:7px 4px}}
`}
function techHtml(){return `
<div class="section-title" id="mtTechTitle">Live data health</div>
<div class="panel" id="mtTechnicalHealth">
  <div class="panel-head"><h2>Live data health</h2><span class="pill mono" id="mtReleasePill">v${VERSION}</span></div>
  <div class="mt-health-summary">
    <div class="mt-health-kpi"><small>Success rate</small><strong id="mtTechSuccess">—</strong><span>Weather · AIS · route</span></div>
    <div class="mt-health-kpi"><small>P95 response</small><strong id="mtTechP95">—</strong><span>Slower end of requests</span></div>
    <div class="mt-health-kpi"><small>Errors</small><strong id="mtTechErrors">—</strong><span>Current range</span></div>
  </div>
  <div class="mt-health-line"><span><b id="mtTechState" class="mt-health-state">Waiting</b> · <span id="mtTechRequests">0</span> requests observed</span><span id="mtTechLatestError">No recent error</span></div>
  <h2 style="margin-top:0">Source usage</h2><div id="mtSourceHealth" class="status">Loading…</div>
  <details class="mt-details" id="mtTechnicalDetails"><summary>Technical details</summary><div class="mt-details-body"><div id="mtEndpointHealth" class="status">Loading…</div><div id="mtRuntimeSlot"></div></div></details>
</div>`}
function techScript(){return `<script>(function(){
function n(v){return Number(v)||0}function pct(v){return n(v).toFixed(1)+'%'}function sec(v){v=n(v);return v<1?(v*1000).toFixed(0)+' ms':v.toFixed(2)+' s'}function when(v){if(!v)return 'None';var d=new Date(v);return isNaN(d)?String(v):d.toISOString().replace('T',' ').slice(0,16)+' UTC'}function esc(s){return String(s==null?'':s).replace(/[&<>\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]})}
function state(h){if(!n(h.requests))return{label:'Waiting',cls:''};if(n(h.successRate)>=98)return{label:'Healthy',cls:'good'};if(n(h.successRate)>=90)return{label:'Watch',cls:'warn'};return{label:'Needs attention',cls:'bad'}}
function endpointRows(items){if(!items||!items.length)return '<div class="empty">No endpoint observations in this period.</div>';return '<div class="mt-endpoint-list">'+items.map(function(x){var cls=n(x.successRate)>=98?'health-good':n(x.successRate)>=90?'health-warn':'health-bad';return '<div class="mt-endpoint"><div class="mt-endpoint-head"><b>'+esc(x.endpoint)+'</b><span class="'+cls+'">'+pct(x.successRate)+'</span></div><div class="mt-endpoint-grid"><div><small>Requests</small><span>'+n(x.requests).toLocaleString()+'</span></div><div><small>Average</small><span>'+sec(x.avgLatencySeconds)+'</span></div><div><small>P95</small><span>'+sec(x.p95LatencySeconds)+'</span></div></div><div class="mt-endpoint-foot">Max '+sec(x.maxLatencySeconds)+' · Last error '+esc(when(x.lastError))+'</div></div>'}).join('')+'</div>'}
function sourceRows(items){if(!items||!items.length)return '<div class="empty">No source observations in this period.</div>';return '<div class="mt-source-list">'+items.slice(0,8).map(function(x){return '<div class="mt-source-chip"><span>'+esc(x.source)+'</span><b>'+n(x.count).toLocaleString()+'</b><small>Last seen '+esc(when(x.lastSeen))+'</small></div>'}).join('')+'</div>'}
function sectionTitle(name){return Array.from(document.querySelectorAll('.section-title')).find(function(x){return x.textContent.trim()===name})}
function hideBaseLiveHealth(){var t=sectionTitle('Live data health');if(!t||t.id==='mtTechTitle')return;var n1=t.nextElementSibling;t.classList.add('mt-hidden-base-health');if(n1)n1.classList.add('mt-hidden-base-health')}
function hideSecondaryCards(){['searchRate','liveSuccess','pagesPerSession','telemetryCoverage'].forEach(function(id){var e=document.getElementById(id);if(e&&e.closest('.card'))e.closest('.card').classList.add('mt-secondary-kpi')})}
function buildMoreInsights(){if(document.getElementById('mtMoreInsights'))return;var product=sectionTitle('Product usage');if(!product)return;var productGrid=product.nextElementSibling;if(!productGrid)return;var d=document.createElement('details');d.className='mt-more';d.id='mtMoreInsights';d.innerHTML='<summary>More insights</summary><div class="mt-more-body"></div>';productGrid.insertAdjacentElement('afterend',d);var body=d.querySelector('.mt-more-body');
  var activity=sectionTitle('Activity');if(activity){var g=activity.nextElementSibling;body.appendChild(activity);if(g)body.appendChild(g)}
  var afterProduct=d.nextElementSibling;if(afterProduct&&afterProduct.classList.contains('tables'))body.appendChild(afterProduct);
  var feature=sectionTitle('Feature adoption & search');if(feature){var fg=feature.nextElementSibling;body.appendChild(feature);if(fg)body.appendChild(fg)}
  var tech=sectionTitle('Technical context');if(tech){var tg=tech.nextElementSibling;body.appendChild(tech);if(tg)body.appendChild(tg)}
}
function moveRuntime(){var r=document.getElementById('mtRuntimeSmoke'),slot=document.getElementById('mtRuntimeSlot');if(r&&slot&&r.parentNode!==slot)slot.appendChild(r)}
function restructure(){hideSecondaryCards();hideBaseLiveHealth();buildMoreInsights();moveRuntime()}
async function loadTech(){var active=document.querySelector('.range button.active'),range=active&&active.dataset.range||'24h';try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin'}),d=await r.json(),h=d.technicalHealth||{},s=state(h);document.getElementById('mtReleasePill').textContent='v'+((d.release&&d.release.version)||'${VERSION}');document.getElementById('mtTechRequests').textContent=n(h.requests).toLocaleString();document.getElementById('mtTechSuccess').textContent=pct(h.successRate);document.getElementById('mtTechP95').textContent=sec(h.p95LatencySeconds);document.getElementById('mtTechErrors').textContent=n(h.errors).toLocaleString();var st=document.getElementById('mtTechState');st.textContent=s.label;st.className='mt-health-state '+s.cls;document.getElementById('mtTechLatestError').textContent=h.latestError?'Latest error '+when(h.latestError):'No recent error';document.getElementById('mtEndpointHealth').innerHTML=endpointRows(h.endpoints);document.getElementById('mtSourceHealth').innerHTML=sourceRows(h.sources);restructure()}catch(e){document.getElementById('mtEndpointHealth').innerHTML='<div class="error">Technical-health data unavailable.</div>'}}
setTimeout(function(){restructure();loadTech()},0);setTimeout(restructure,700);document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){setTimeout(loadTech,80)})});document.getElementById('refresh')&&document.getElementById('refresh').addEventListener('click',function(){setTimeout(loadTech,80)});
})();</script>`}
async function enrichDashboard(baseResponse){
  if(!baseResponse.ok)return baseResponse;let html=await baseResponse.text();
  html=html.replace('</style>',dashboardCss()+'</style>');
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
