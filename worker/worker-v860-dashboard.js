import previousWorker from "./worker-v860-product.js";
const VERSION="8.7.0";
const WORKER="worker-v860-dashboard";

// QA preview requests must never read from or write to the production analytics
// bindings, even if Cloudflare deploy preview inherited their configuration.
function qaPreviewHost(host){return host!=="api.marinetools.app"&&host.endsWith(".api.marinetools.app")}
function qaPreviewOrigin(origin){return /^https:\/\/[a-z0-9-]+\.marine-tools-frontend-preview\.pages\.dev$/i.test(origin)}
function qaHeaders(origin){
 const headers={"cache-control":"no-store","x-marine-tools-environment":"preview","x-marine-tools-analytics":"disabled"};
 if(qaPreviewOrigin(origin)){
  headers["access-control-allow-origin"]=origin;
  headers["access-control-allow-credentials"]="true";
  headers["access-control-allow-methods"]="GET,HEAD,OPTIONS";
  headers["access-control-allow-headers"]="content-type";
  headers["vary"]="Origin";
  // Only non-secret QA diagnostic metadata, for the already-approved origin.
  headers["access-control-expose-headers"]="x-marine-tools-environment,x-marine-tools-analytics,x-marine-tools-ais-provider,access-control-allow-origin,access-control-allow-credentials,vary";
 }
 return headers;
}
function qaPreviewResponse(body,status=200,origin=""){
 return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json;charset=utf-8",...qaHeaders(origin)}});
}
async function isolatedQaFetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname,origin=request.headers.get("origin")||"";
 if(origin&&!qaPreviewOrigin(origin))return qaPreviewResponse({error:"Origin not allowed in QA preview."},403);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:qaHeaders(origin)});
 if(path==="/api/preview-isolation"&&request.method==="GET"){
  return qaPreviewResponse({environment:"preview",analyticsWrites:false,analyticsQueries:false,apiHost:url.hostname},200,origin);
 }
 if(path.startsWith("/api/analytics")||path.startsWith("/admin/")){
  return qaPreviewResponse({error:"Analytics and admin endpoints are disabled in QA preview."},403,origin);
 }
 if(!["GET","HEAD"].includes(request.method)){
  return qaPreviewResponse({error:"QA preview is read-only."},405,origin);
 }
 const readOnlyPaths=new Set(["/api/health","/api/auth/status","/api/release","/api/ais/latest","/api/weather","/api/forecast"]);
 if(!readOnlyPaths.has(path))return qaPreviewResponse({error:"Endpoint not enabled in QA preview."},404,origin);
 // Even if deployment preview inherits production bindings, downstream
 // handlers cannot read analytics or publish production analytics events.
 const safeEnv={...env,ANALYTICS:undefined,ANALYTICS_SQL:undefined};
 const response=await previousWorker.fetch(request,safeEnv,ctx);
 const headers=new Headers(response.headers);
 for(const [name,value] of Object.entries(qaHeaders(origin)))headers.set(name,value);
 if(!origin){headers.delete("access-control-allow-origin");headers.delete("access-control-allow-credentials")}
 return new Response(response.body,{status:response.status,headers});
}
function enhance(html){
  html=html.replace(/Analytics Dashboard v2/g,"Analytics Dashboard v3").replace("Marine Tools v8.5.6 analytics","Marine Tools v8.7.0 analytics");
  const hasPanel=html.includes('id="mtV860Product"');
  const panel=`<div class="section-title">Workflow adoption</div><div class="panel" id="mtV860Product"><div class="panel-head"><h2>Product actions</h2><span class="pill mono">Analytics v3</span></div><div class="cards"><div class="card"><small>Calculations</small><strong id="v860Calc">—</strong></div><div class="card"><small>Saves</small><strong id="v860Save">—</strong></div><div class="card"><small>Exports</small><strong id="v860Export">—</strong></div><div class="card"><small>Profile reuse</small><strong id="v860Reuse">—</strong></div><div class="card"><small>Offline uses</small><strong id="v860Offline">—</strong></div><div class="card"><small>Returning browsers</small><strong id="v860Returning">—</strong></div></div><div id="v860Tools" class="status">Loading…</div></div>`;
  const script=`<script id="mtV860AnalyticsScript">(function(){function n(v){return Number(v)||0}function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}async function load(){var active=document.querySelector('.range button.active'),range=active&&active.dataset.range||'24h';try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin'}),d=await r.json(),p=d.productActions||{},t=p.totals||{},v=p.visitorType||{};document.getElementById('v860Calc').textContent=n(t.calculation_completed);document.getElementById('v860Save').textContent=n(t.result_saved);document.getElementById('v860Export').textContent=n(t.result_exported);document.getElementById('v860Reuse').textContent=n(t.profile_value_used);document.getElementById('v860Offline').textContent=n(t.offline_tool_used);document.getElementById('v860Returning').textContent=n(v.returningShare).toFixed(0)+'%';var rows=p.tools||[],h=document.getElementById('v860Tools');h.innerHTML=rows.length?'<table><thead><tr><th>Tool</th><th>Calculations</th><th>Saves</th><th>Exports</th><th>Profile reuse</th><th>Offline</th></tr></thead><tbody>'+rows.slice(0,18).map(function(x){return'<tr><td>'+esc(x.tool)+'</td><td>'+n(x.calculations)+'</td><td>'+n(x.saves)+'</td><td>'+n(x.exports)+'</td><td>'+n(x.profileReuse)+'</td><td>'+n(x.offlineUses)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="empty">No Analytics v3 actions observed yet.</div>'}catch(e){var h=document.getElementById('v860Tools');if(h)h.innerHTML='<div class="error">Analytics v3 data unavailable.</div>'}}setTimeout(load,0);document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){setTimeout(load,100)})});document.getElementById('refresh')&&document.getElementById('refresh').addEventListener('click',function(){setTimeout(load,100)})})();</script>`;
  if(!hasPanel){const anchor='<div class="section-title">Product usage</div>';html=html.includes(anchor)?html.replace(anchor,panel+anchor):html.includes('<div class="footer">')?html.replace('<div class="footer">',panel+'<div class="footer">'):html.replace('</body>',panel+'</body>')}
  if(!html.includes('id="mtV860AnalyticsScript"'))html=html.replace('</body>',script+'</body>');
  // Existing panel renderers share one validated request per refresh/range.
  // Keep their rendering code, but stop four independent full SQL fan-outs.
  html=html.replace(/fetch\('\/admin\/api\/analytics(?:-v2)?\?range='\+encodeURIComponent\((currentRange|range)\),\{cache:'no-store',credentials:'same-origin'\}\)/g,'window.MT_DASHBOARD_REQUEST($1)');
  html=html.replace(/async function (load|loadTech)\(\)\{/g,'async function $1(){var requestVersion=window.MT_DASHBOARD_STATE.version;');
  html=html.replace("document.querySelectorAll('.range button').forEach(function(b){b.disabled=true});",'');
  html=html.replaceAll('var d=await r.json();','var d=await r.json();if(requestVersion!==window.MT_DASHBOARD_STATE.version)return;');
  html=html.replaceAll('}catch(e){','}catch(e){if(requestVersion!==window.MT_DASHBOARD_STATE.version)return;');
  html=html.replace("finally{document.querySelectorAll('.range button')","finally{if(requestVersion!==window.MT_DASHBOARD_STATE.version)return;document.querySelectorAll('.range button')");
  html=html.replace('s=d.runtimeSmoke||{},checks=s.checks||[];','s=d.runtimeSmoke||{},checks=s.checks||[];if(typeof s.error==="string")throw new Error("Scheduled checks are unavailable.");');
  html=html.replace('h=d.technicalHealth||{},s=state(h);','h=d.technicalHealth||{},s=state(h);if(h.error)throw new Error("Technical-health data is unavailable.");');
  html=html.replace('v=p.visitorType||{};','v=p.visitorType||{};if(p.error)throw new Error("Product actions are unavailable.");');
  html=html.replace('<small>Calculations</small>','<small>Calculation clicks</small>').replace('<th>Calculations</th>','<th>Calc. clicks</th>');
  html=html.replace('<small>Returning browsers</small>','<small>Returning visits</small>');
  html=html.replace("document.getElementById('v860Offline').textContent=n(t.offline_tool_used)","document.getElementById('v860Offline').textContent='—'");
  html=html.replace('n(x.offlineUses)',"'—'");
  html=html.replace('<small>P95 response</small>','<small>P95 response (recent sample)</small>').replace('Slower end of requests','At most 5,000 recent observations');
  html=html.replace('<div class="panel" id="mtV860Product">','<div class="panel" id="mtV860Product"><p class="banner">Calculation clicks do not confirm a valid result. Offline usage is not measured by the current collector. Returning visits are browser observations, not unique people.</p>');
  html=html.replace("n(v.returningShare).toFixed(0)+'%'","(n(v.first)+n(v.returning)>0?n(v.returningShare).toFixed(0)+'%':'—')");
  html=html.replace("document.getElementById('mtTechSuccess').textContent=pct(h.successRate)","document.getElementById('mtTechSuccess').textContent=n(h.requests)?pct(h.successRate):'—'");
  html=html.replace("document.getElementById('mtTechP95').textContent=sec(h.p95LatencySeconds)","document.getElementById('mtTechP95').textContent=n(h.requests)?sec(h.p95LatencySeconds):'—'");
  html=html.replace("document.getElementById('mtEndpointHealth').innerHTML='<div class=\"error\">Technical-health data unavailable.</div>'","document.getElementById('mtTechState').textContent='Unavailable';document.getElementById('mtTechState').className='mt-health-state';document.getElementById('mtSourceHealth').textContent='Source observations are unavailable.';document.getElementById('mtEndpointHealth').innerHTML='<div class=\"error\">Technical-health data unavailable.</div>'");
  html=html.replace('<div class="banner">','<div id="mtAnalyticsLoadState" class="banner" role="status" aria-live="polite">Loading analytics…</div><div class="banner">');
  html=html.replace('<script>','<script id="mtAnalyticsTransport">'+dashboardTransportScript()+'</script><script>');
  html=html.replace('</style>','.status{min-width:0;max-width:100%;overflow-x:auto}.error{overflow-wrap:anywhere}</style>');
  return html;
}

// Keep browser code literal: bundlers inject server-only helpers into functions.
function dashboardTransportScript(){return String.raw`(function(){
 'use strict';
 var state=window.MT_DASHBOARD_STATE={version:0},entry=null;
 var nativeFetch=window.fetch.bind(window);
 function status(message,error){var el=document.getElementById('mtAnalyticsLoadState');if(el){el.textContent=message;el.classList.toggle('error',!!error)}}
 function reset(){
  document.querySelectorAll('.card strong,.mini b,.mt-health-kpi strong,.mt-activity-kpi strong').forEach(function(el){el.textContent='—'});
  document.querySelectorAll('.delta').forEach(function(el){el.textContent='—'});
  document.querySelectorAll('.status').forEach(function(el){el.textContent='Loading…'});
  var chart=document.getElementById('chart');if(chart)chart.innerHTML='<div class="status">Loading…</div>';
  var health=document.getElementById('mtTechState');if(health){health.textContent='Loading';health.className='mt-health-state'}
  var requests=document.getElementById('mtTechRequests');if(requests)requests.textContent='—';
  var lastError=document.getElementById('mtTechLatestError');if(lastError)lastError.textContent='Last error unavailable';
  var updated=document.getElementById('updated');if(updated)updated.textContent=updated.textContent.replace(/^Updated /,'Last successful load ');
  document.querySelectorAll('.mt-context-card b,[id^="mtLegend"],[id^="mtAct"][id$="Delta"]').forEach(function(el){el.textContent='—'});
  window.__mtAnalyticsDashboardData=null;window.dispatchEvent(new CustomEvent('mt-analytics-data',{detail:null}));
  status('Loading analytics…',false);
 }
 document.addEventListener('click',function(e){
  if(!e.target.closest('.range button,#refresh'))return;
  state.version++;if(entry)entry.controller.abort();entry=null;reset();
 },true);
 window.MT_DASHBOARD_REQUEST=async function(range){
  range=['24h','7d','30d','90d'].includes(range)?range:'24h';
  if(!entry||entry.range!==range||entry.version!==state.version||Date.now()-entry.finished>500){
   var version=state.version,controller=new AbortController(),timer;
   var item={range:range,version:version,controller:controller,finished:Infinity};entry=item;
   item.promise=Promise.race([
    (async function(){
     var r=await nativeFetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin',signal:controller.signal});
     if(r.status===401||r.status===403)throw new Error('Your analytics session has expired or access was denied. Sign in again, then refresh.');
     if(!(r.headers.get('content-type')||'').includes('application/json'))throw new Error('The server returned a sign-in page or an unexpected response. Sign in again, then refresh.');
     var d=await r.json();
     if(!r.ok||d.error){
      if(d.code==='ANALYTICS_NOT_CONFIGURED')throw new Error('Analytics SQL is not configured. Check the Worker analytics binding.');
      if(d.code==='ANALYTICS_TIMEOUT')throw new Error('Analytics took too long to respond. Try a shorter period or refresh.');
      throw new Error('Analytics data could not be loaded (HTTP '+r.status+'). Refresh to try again.');
     }
     if(!d.current||!d.previous||!d.search||!Array.isArray(d.topTools))throw new Error('The analytics response is incomplete. The Worker and dashboard need the same version.');
     if(version===state.version){
      var failed=[];if(d.technicalHealth&&d.technicalHealth.error)failed.push('live-data health');if(d.runtimeSmoke&&typeof d.runtimeSmoke.error==='string')failed.push('scheduled checks');if(d.productActions&&d.productActions.error)failed.push('product actions');
      status(failed.length?'Usage loaded. Unavailable: '+failed.join(', ')+'. Refresh to retry.':'Analytics loaded for '+range+'. Last updated '+new Date(d.generatedAt).toLocaleString()+'.',failed.length>0);
     }
     return new Response(JSON.stringify(d),{headers:{'content-type':'application/json'}});
    })(),
    new Promise(function(_,reject){timer=setTimeout(function(){controller.abort();reject(new Error('Analytics took too long to respond. Refresh to try again.'))},12000)})
   ]).catch(function(error){if(error.name==='TypeError')error=new Error('Could not connect to analytics. Check your connection and refresh.');if(error.name==='AbortError')error=new Error('Analytics took too long to respond. Refresh to try again.');if(version===state.version){status(error.message,true);var health=document.getElementById('mtTechState');if(health){health.textContent='Unavailable';health.className='mt-health-state'}}throw error}).finally(function(){clearTimeout(timer);item.finished=Date.now()});
  }
  return(await entry.promise).clone();
 };
 reset();
})();`;}

// A binding query cannot be cancelled. Stop awaiting it after a bounded time,
// and share one absolute deadline across the sequential enrichment layers.
function analyticsRequestEnv(env){
 if(!env.ANALYTICS_SQL?.query)return env;
 const binding=env.ANALYTICS_SQL,deadline=Date.now()+10000;
 return{...env,ANALYTICS_SQL:{async query(input){
  const remaining=Math.min(6000,deadline-Date.now());
  const timeout=()=>Object.assign(new Error('Analytics query timed out'),{retryable:false});
  if(remaining<=0)throw timeout();let timer;
  try{return await Promise.race([Promise.resolve().then(()=>binding.query(input)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(timeout()),remaining)})])}finally{clearTimeout(timer)}
 }}};
}

async function analyticsFailure(response){
 if(response.status<500)return response;
 let data;try{data=await response.clone().json()}catch{return response}
 const message=String(data.error||'');
 const code=/not configured/i.test(message)?'ANALYTICS_NOT_CONFIGURED':/timed out/i.test(message)?'ANALYTICS_TIMEOUT':'ANALYTICS_QUERY_FAILED';
 const headers=new Headers(response.headers);headers.set('cache-control','no-store');headers.set('content-type','application/json;charset=utf-8');
 return new Response(JSON.stringify({error:'Analytics data is unavailable.',code}),{status:503,headers});
}

async function identify(response,path){
  if(!response.ok)return response;
  let body;try{body=await response.clone().json()}catch{return response}
  if(path==="/api/release")body.worker=WORKER;
  else if(path==="/api/health")body.release={...(body.release||{}),worker:WORKER};
  else if(path==="/admin/api/analytics")body.release={...(body.release||{}),worker:WORKER};
  else return response;
  const headers=new Headers(response.headers);headers.set("content-type","application/json;charset=utf-8");headers.set("cache-control","no-store");headers.set("x-marine-tools-worker",WORKER);
  return new Response(JSON.stringify(body),{status:response.status,headers});
}

export default{async fetch(request,env,ctx){const url=new URL(request.url);if(qaPreviewHost(url.hostname))return isolatedQaFetch(request,env,ctx);const path=url.pathname,analyticsApi=path==="/admin/api/analytics"||path==="/admin/api/analytics-v2";let response=await previousWorker.fetch(request,analyticsApi?analyticsRequestEnv(env):env,ctx);if(analyticsApi)response=await analyticsFailure(response);if(path==="/api/release"||path==="/api/health"||path==="/admin/api/analytics")return identify(response,path);if(path!=="/admin/analytics"||!response.ok)return response;const headers=new Headers(response.headers);headers.set("content-type","text/html;charset=utf-8");headers.set("cache-control","no-store");headers.set("x-frame-options","DENY");headers.set("x-marine-tools-dashboard",VERSION);headers.set("x-marine-tools-worker",WORKER);return new Response(enhance(await response.text()),{status:response.status,headers})},async scheduled(controller,env,ctx){if(previousWorker.scheduled)return previousWorker.scheduled(controller,env,ctx)}};
