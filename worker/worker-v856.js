import previousWorker from "./worker-v855.js";

const ANALYTICS_DATASET="events.analyticsEngine.marine_tools_usage";
const PRODUCT_ORIGINS=new Set(["https://marinetools.app","https://www.marinetools.app"]);
const CORS={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const EVENTS=new Set([
  "session_start","page_view","tool_use","engagement","analytics_enabled",
  "version_seen","session_tool_active","session_search_active","feature_use",
  "search_used","search_result","search_result_open","favorite_toggle",
  "live_request_ok","live_request_error","data_source"
]);

function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...CORS,"content-type":"application/json;charset=utf-8","cache-control":"no-store",...extra}})}
function clean(v,max){return String(v??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,max)}
function originAllowed(request){return PRODUCT_ORIGINS.has(request.headers.get("origin")||"")}
function adminAccessOk(request){return Boolean(request.headers.get("cf-access-jwt-assertion"))}
function adminUnauthorized(api=false){return api?json({error:"Private analytics requires Cloudflare Access authentication."},401):new Response("<!doctype html><meta charset=utf-8><title>Marine Tools — Private Analytics</title><body style='font:16px system-ui;background:#061724;color:#eef7fb;padding:32px'><h1>Private analytics</h1><p>This dashboard is protected by Cloudflare Access.</p></body>",{status:401,headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store"}})}

async function analyticsEvent(request,env){
  if(request.method!=="POST")return json({error:"Method not allowed"},405);
  if(!originAllowed(request))return json({error:"Origin not allowed"},403,{"access-control-allow-origin":"null"});
  if(!env.ANALYTICS)return json({ok:false,configured:false,error:"Analytics Engine binding not configured"},503);
  const len=Number(request.headers.get("content-length")||0);if(len>4096)return json({error:"Payload too large"},413);
  let body;try{body=JSON.parse(await request.text())}catch{return json({error:"Invalid JSON"},400)}
  const event=clean(body.event,40);if(!EVENTS.has(event))return json({error:"Unsupported event"},400);
  const page=clean(body.page,80),tool=clean(body.tool,120),device=clean(body.device,20),version=clean(body.version,20);
  const duration=Math.max(0,Math.min(3600,Number(body.duration)||0));
  env.ANALYTICS.writeDataPoint({blobs:[event,page,tool,device,version],doubles:[1,duration],indexes:["marine-tools"]});
  return json({ok:true},202,{"access-control-allow-origin":request.headers.get("origin")||"https://marinetools.app","vary":"Origin"});
}

async function analyticsSql(env,query,params={}){
  if(!env.ANALYTICS_SQL)throw new Error("Analytics SQL binding is not configured");
  try{return await env.ANALYTICS_SQL.query({query,params})}catch(e){if(e?.retryable){await new Promise(r=>setTimeout(r,120));return env.ANALYTICS_SQL.query({query,params})}throw e}
}
function analyticsPeriod(range){
  const allowed=new Set(["24h","7d","30d","90d"]),r=allowed.has(range)?range:"24h";
  const ms=r==="90d"?90*86400000:r==="30d"?30*86400000:r==="7d"?7*86400000:86400000,now=Date.now();
  const currentStart=new Date(now-ms).toISOString(),currentEnd=new Date(now).toISOString(),previousStart=new Date(now-ms*2).toISOString(),previousEnd=currentStart;
  return{range:r,currentStart,currentEnd,previousStart,previousEnd,bucket:r==="24h"?"hour":"day"};
}
function countMap(rows){const m=new Map();for(const r of rows||[])m.set(String(r.event_name||""),{count:Number(r.event_count)||0,duration:Number(r.duration)||0});return m}
function pct(n,d){return d>0?n/d*100:0}
function metricSummary(rows){
  const m=countMap(rows),n=e=>m.get(e)?.count||0,d=e=>m.get(e)?.duration||0;
  const sessions=n("session_start"),versionSeen=n("version_seen"),liveOk=n("live_request_ok"),liveErr=n("live_request_error"),searches=n("search_used");
  return{
    sessions,pageViews:n("page_view"),toolUses:n("tool_use"),engagedSeconds:d("engagement"),featureUses:n("feature_use"),searches,
    searchOpens:n("search_result_open"),versionSeen,toolActiveSessions:n("session_tool_active"),searchActiveSessions:n("session_search_active"),
    liveOk,liveErr,avgEngagedSecondsPerSession:sessions?d("engagement")/sessions:0,pagesPerSession:sessions?n("page_view")/sessions:0,toolsPerSession:sessions?n("tool_use")/sessions:0,
    toolActiveRate:pct(n("session_tool_active"),versionSeen),searchSessionRate:pct(n("session_search_active"),versionSeen),liveSuccessRate:pct(liveOk,liveOk+liveErr),telemetryCoverage:pct(versionSeen,sessions),searchOpenRate:pct(n("search_result_open"),searches)
  };
}
function aggregateToolRows(rows){
  const tools=new Map(),cats=new Map();
  for(const r of rows||[]){const uses=Number(r.uses)||0,tool=String(r.tool||"Unknown"),page=String(r.page||"Unknown");tools.set(tool,(tools.get(tool)||0)+uses);cats.set(page,(cats.get(page)||0)+uses)}
  return{tools,categories:cats};
}
function trendRows(cur,prev,label,countKey="uses",limit=15){
  const out=[];for(const [name,value] of cur.entries()){const p=prev.get(name)||0;out.push({[label]:name,[countKey]:value,previous:p,changePct:p?((value-p)/p)*100:(value?null:0)})}
  return out.sort((a,b)=>b[countKey]-a[countKey]).slice(0,limit);
}
function dims(rows,event){return(rows||[]).filter(r=>r.event_name===event)}
function groupCounts(rows,key="tool"){const m=new Map();for(const r of rows||[]){const k=String(r[key]||"Unknown"),n=Number(r.event_count)||0;m.set(k,(m.get(k)||0)+n)}return[...m.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)}
function liveRows(rows){
  const endpoints=new Map();
  for(const r of rows||[]){if(r.event_name!=="live_request_ok"&&r.event_name!=="live_request_error")continue;const ep=String(r.tool||"unknown"),x=endpoints.get(ep)||{endpoint:ep,ok:0,error:0,totalSeconds:0,totalCount:0};const c=Number(r.event_count)||0;if(r.event_name==="live_request_ok")x.ok+=c;else x.error+=c;x.totalSeconds+=(Number(r.avg_duration)||0)*c;x.totalCount+=c;endpoints.set(ep,x)}
  return[...endpoints.values()].map(x=>({...x,requests:x.ok+x.error,successRate:pct(x.ok,x.ok+x.error),avgLatencySeconds:x.totalCount?x.totalSeconds/x.totalCount:0})).sort((a,b)=>b.requests-a.requests);
}
function searchStats(rows){
  const all=rows||[],used=dims(all,"search_used").reduce((s,r)=>s+(Number(r.event_count)||0),0),opened=dims(all,"search_result_open").reduce((s,r)=>s+(Number(r.event_count)||0),0);
  const resultRows=dims(all,"search_result"),noResult=resultRows.filter(r=>String(r.tool||"").endsWith(":no-result")).reduce((s,r)=>s+(Number(r.event_count)||0),0),hasResult=resultRows.filter(r=>String(r.tool||"").endsWith(":has-result")).reduce((s,r)=>s+(Number(r.event_count)||0),0);
  return{used,opened,hasResult,noResult,resultOpenRate:pct(opened,used),noResultRate:pct(noResult,hasResult+noResult),surfaces:groupCounts(dims(all,"search_used"))};
}
async function adminAnalyticsSummary(request,env){
  const url=new URL(request.url),p=analyticsPeriod(url.searchParams.get("range")||"24h"),cur={start:p.currentStart,end:p.currentEnd},prev={start:p.previousStart,end:p.previousEnd};
  const summarySql=`SELECT blob1 AS event_name, COUNT(*) AS event_count, SUM(double2) AS duration FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end GROUP BY event_name ORDER BY event_count DESC`;
  const pagesSql=`SELECT blob2 AS page, COUNT(*) AS views FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='page_view' GROUP BY page ORDER BY views DESC LIMIT 20`;
  const toolDetailSql=`SELECT blob2 AS page, blob3 AS tool, COUNT(*) AS uses FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='tool_use' AND blob3!='' GROUP BY page,tool ORDER BY uses DESC LIMIT 250`;
  const engagementSql=`SELECT blob2 AS page, SUM(double2) AS seconds FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='engagement' GROUP BY page ORDER BY seconds DESC LIMIT 20`;
  const devicesSql=`SELECT blob4 AS device, COUNT(*) AS sessions FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='session_start' GROUP BY device ORDER BY sessions DESC LIMIT 10`;
  const versionsSql=`SELECT blob5 AS version, COUNT(*) AS sessions FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='version_seen' GROUP BY version ORDER BY sessions DESC LIMIT 20`;
  const dimsSql=`SELECT blob1 AS event_name, blob2 AS page, blob3 AS tool, COUNT(*) AS event_count, AVG(double2) AS avg_duration FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('feature_use','favorite_toggle','search_used','search_result','search_result_open','live_request_ok','live_request_error','data_source') GROUP BY event_name,page,tool ORDER BY event_count DESC LIMIT 500`;
  const bucketFn=p.bucket==="hour"?"toStartOfHour(timestamp)":"toStartOfDay(timestamp)";
  const timelineSql=`SELECT ${bucketFn} AS bucket, blob1 AS event_name, COUNT(*) AS event_count FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('session_start','page_view','tool_use','live_request_error') GROUP BY bucket,event_name ORDER BY bucket ASC`;
  const hoursSql=`SELECT toHour(timestamp) AS hour, COUNT(*) AS sessions FROM ${ANALYTICS_DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1='session_start' GROUP BY hour ORDER BY hour ASC`;

  const [currentSummary,previousSummary,pages,toolCurrent,toolPrevious,engagement,devices,versions,dimensions,timeline,hours]=await Promise.all([
    analyticsSql(env,summarySql,cur),analyticsSql(env,summarySql,prev),analyticsSql(env,pagesSql,cur),analyticsSql(env,toolDetailSql,cur),analyticsSql(env,toolDetailSql,prev),analyticsSql(env,engagementSql,cur),analyticsSql(env,devicesSql,cur),analyticsSql(env,versionsSql,cur),analyticsSql(env,dimsSql,cur),analyticsSql(env,timelineSql,cur),analyticsSql(env,hoursSql,cur)
  ]);

  const current=metricSummary(currentSummary.data),previous=metricSummary(previousSummary.data),ct=aggregateToolRows(toolCurrent.data),pt=aggregateToolRows(toolPrevious.data),drows=dimensions.data||[];
  const tmap=new Map();for(const r of timeline.data||[]){const key=String(r.bucket||"");if(!tmap.has(key))tmap.set(key,{bucket:key,sessions:0,pageViews:0,toolUses:0,errors:0});const x=tmap.get(key),n=Number(r.event_count)||0;if(r.event_name==="session_start")x.sessions=n;else if(r.event_name==="page_view")x.pageViews=n;else if(r.event_name==="tool_use")x.toolUses=n;else if(r.event_name==="live_request_error")x.errors=n}
  const timelineRows=[...tmap.values()].map(r=>({...r,label:p.bucket==="hour"?new Date(String(r.bucket).replace(" ","T")+"Z").toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}):String(r.bucket).slice(5,10)}));
  const featureRows=groupCounts([...dims(drows,"feature_use"),...dims(drows,"favorite_toggle")]).map(x=>({feature:x.name,uses:x.count}));
  const sourceRows=groupCounts(dims(drows,"data_source")).map(x=>({source:x.name,count:x.count}));

  return{
    range:p.range,generatedAt:new Date().toISOString(),viewer:request.headers.get("cf-access-authenticated-user-email")||"Cloudflare Access",period:{start:p.currentStart,end:p.currentEnd,previousStart:p.previousStart,previousEnd:p.previousEnd},
    current,previous,pages:(pages.data||[]).map(r=>({page:r.page||"Unknown",views:Number(r.views)||0})),
    topTools:trendRows(ct.tools,pt.tools,"tool","uses",18),categories:trendRows(ct.categories,pt.categories,"category","uses",12),
    engagementByPage:(engagement.data||[]).map(r=>({page:r.page||"Unknown",seconds:Number(r.seconds)||0})),devices:(devices.data||[]).map(r=>({device:r.device||"Unknown",sessions:Number(r.sessions)||0})),versions:(versions.data||[]).map(r=>({version:r.version||"Unknown",sessions:Number(r.sessions)||0})),
    features:featureRows.slice(0,20),search:searchStats(drows),live:liveRows(drows),sources:sourceRows.slice(0,20),timeline:timelineRows,hours:(hours.data||[]).map(r=>({hour:Number(r.hour)||0,sessions:Number(r.sessions)||0}))
  };
}

const ADMIN_DASHBOARD_HTML=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#061724">
<title>Marine Tools — Analytics Dashboard v2</title>
<style>
:root{--bg:#061724;--panel:#0b2334;--panel2:#0d2b40;--line:#1d4259;--text:#eef7fb;--muted:#8faabd;--cyan:#28c4f4;--blue:#159fe4;--green:#32d48a;--amber:#f2bf49;--red:#ff625d}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#061724,#071b29);color:var(--text);font:14px/1.45 "Segoe UI",Inter,Arial,sans-serif;min-height:100vh}button{font:inherit}.shell{max-width:1560px;margin:auto;padding:22px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}.brand{display:flex;align-items:center;gap:12px}.brand img{width:46px;height:46px;border-radius:10px}.brand h1{font-size:22px;margin:0}.brand p{margin:2px 0 0;color:var(--muted);font-size:12px}.right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:#092133;border-radius:999px;padding:7px 10px;color:#bcd0dc;font-size:12px}.range{display:flex;gap:6px;flex-wrap:wrap}.range button,.refresh{border:1px solid #285871;background:#0a2639;color:#cde0eb;border-radius:8px;padding:8px 11px;cursor:pointer}.range button.active{background:#0b76bd;border-color:#2bc2f2;color:#fff}.banner{border:1px solid #24546f;background:#092235;border-radius:12px;padding:12px 14px;color:#b7cdda;margin-bottom:14px}.cards{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:10px;margin-bottom:12px}.card,.panel{background:linear-gradient(180deg,var(--panel),#091f30);border:1px solid var(--line);border-radius:13px}.card{padding:14px}.card small{display:block;color:var(--muted);margin-bottom:6px}.card strong{font-size:25px;font-variant-numeric:tabular-nums}.delta{font-size:11px;margin-top:5px}.delta.up{color:var(--green)}.delta.down{color:var(--red)}.delta.flat{color:var(--muted)}.section-title{margin:22px 0 8px;font-size:12px;letter-spacing:.08em;color:#7fa6ba;text-transform:uppercase}.grid{display:grid;grid-template-columns:1.35fr 1fr;gap:12px}.grid.equal{grid-template-columns:1fr 1fr}.panel{padding:14px;min-width:0}.panel h2{font-size:15px;margin:0 0 12px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.chart{height:270px;position:relative;border-top:1px solid #15384d;border-bottom:1px solid #15384d;background:repeating-linear-gradient(0deg,transparent,transparent 53px,#113247 54px)}.chart svg{width:100%;height:100%;overflow:visible}.legend{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-top:9px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}.sessions{background:var(--cyan)}.views{background:var(--green)}.tools{background:var(--amber)}.errors{background:var(--red)}.tables{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #173e56;vertical-align:middle}th{font-size:10px;color:#7898ab;text-transform:uppercase;letter-spacing:.06em}td:last-child,th:last-child{text-align:right}.bar{height:7px;border-radius:999px;background:#102d41;overflow:hidden;min-width:70px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#159fe4,#28c4f4)}.trend{font-size:11px}.trend.up{color:var(--green)}.trend.down{color:var(--red)}.trend.new{color:var(--cyan)}.status{padding:14px;text-align:center;color:var(--muted)}.error{color:#ff9a95}.empty{color:#7898ab;font-style:italic}.mini-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}.mini{padding:10px;border:1px solid #173e56;background:#082033;border-radius:10px}.mini small{display:block;color:var(--muted)}.mini b{font-size:18px}.health-good{color:var(--green)}.health-warn{color:var(--amber)}.health-bad{color:var(--red)}.hours{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:end;height:160px;padding-top:12px}.hour{display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:4px}.hour i{display:block;background:#159fe4;border-radius:4px 4px 0 0;min-height:2px}.hour span{font-size:9px;color:#7898ab;text-align:center}.footer{display:flex;justify-content:space-between;gap:12px;color:#6f8da0;font-size:11px;margin-top:18px;padding:10px 2px}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
@media(max-width:1100px){.cards{grid-template-columns:repeat(2,1fr)}.grid,.grid.equal{grid-template-columns:1fr}.tables{grid-template-columns:1fr 1fr}}@media(max-width:700px){.shell{padding:12px}.top{align-items:flex-start;flex-direction:column}.cards,.tables,.mini-cards{grid-template-columns:1fr}.card strong{font-size:22px}.hours{grid-template-columns:repeat(6,1fr);height:auto}.hour{height:80px}}
</style>
</head>
<body><div class="shell">
<div class="top"><div class="brand"><img src="https://www.marinetools.app/assets/icon-192.png" alt="Marine Tools"><div><h1>Analytics Dashboard v2</h1><p>Marine Tools · product, feature and live-data health</p></div></div><div class="right"><span class="pill" id="who">Cloudflare Access</span><div class="range"><button data-range="24h" class="active">24 h</button><button data-range="7d">7 d</button><button data-range="30d">30 d</button><button data-range="90d">90 d</button></div><button class="refresh" id="refresh">Refresh</button></div></div>
<div class="banner"><b>Privacy-preserving analytics.</b> No user ID, IP address, search text, calculation inputs, vessel profile, route coordinates or weather positions are written to the product analytics dataset. Sessions are browser-tab sessions, not unique people.</div>
<div class="cards">
<div class="card"><small>Sessions</small><strong id="sessions">—</strong><div id="sessionsDelta" class="delta flat">—</div></div>
<div class="card"><small>Tool uses / session</small><strong id="toolsPerSession">—</strong><div id="toolsPerSessionDelta" class="delta flat">—</div></div>
<div class="card"><small>Tool-active rate · v8.5.6+</small><strong id="toolActiveRate">—</strong><div id="toolActiveRateDelta" class="delta flat">—</div></div>
<div class="card"><small>Search-active rate · v8.5.6+</small><strong id="searchRate">—</strong><div id="searchRateDelta" class="delta flat">—</div></div>
<div class="card"><small>Live-data success</small><strong id="liveSuccess">—</strong><div id="liveSuccessDelta" class="delta flat">—</div></div>
<div class="card"><small>Avg visible / session</small><strong id="avgVisible">—</strong><div id="avgVisibleDelta" class="delta flat">—</div></div>
<div class="card"><small>Page opens / session</small><strong id="pagesPerSession">—</strong><div id="pagesPerSessionDelta" class="delta flat">—</div></div>
<div class="card"><small>v8.5.6 telemetry coverage</small><strong id="telemetryCoverage">—</strong><div id="telemetryCoverageDelta" class="delta flat">—</div></div>
</div>
<div class="section-title">Activity</div><div class="grid"><div class="panel"><div class="panel-head"><h2>Activity over time</h2><span class="pill mono" id="periodLabel">Last 24 hours</span></div><div class="chart" id="chart"><div class="status">Loading…</div></div><div class="legend"><span><i class="dot sessions"></i>Sessions</span><span><i class="dot views"></i>Page opens</span><span><i class="dot tools"></i>Tool uses</span><span><i class="dot errors"></i>Live errors</span></div></div><div class="panel"><h2>Sessions by UTC hour</h2><div id="hours" class="status">Loading…</div></div></div>
<div class="section-title">Product usage</div><div class="grid equal"><div class="panel"><h2>Top tools · vs previous period</h2><div id="toolsTable" class="status">Loading…</div></div><div class="panel"><h2>Tool categories · vs previous period</h2><div id="categoriesTable" class="status">Loading…</div></div></div>
<div class="tables"><div class="panel"><h2>Most opened areas</h2><div id="pagesTable" class="status">Loading…</div></div><div class="panel"><h2>Visible time by area</h2><div id="engagementTable" class="status">Loading…</div></div></div>
<div class="section-title">Feature adoption & search</div><div class="grid equal"><div class="panel"><h2>Feature usage</h2><div id="featuresTable" class="status">Loading…</div></div><div class="panel"><h2>Search behaviour</h2><div class="mini-cards"><div class="mini"><small>Searches</small><b id="searches">—</b></div><div class="mini"><small>Result-open rate</small><b id="searchOpenRate">—</b></div><div class="mini"><small>No-result rate</small><b id="searchNoResultRate">—</b></div></div><div id="searchTable" class="status">Loading…</div></div></div>
<div class="section-title">Live data health</div><div class="grid equal"><div class="panel"><h2>Request reliability</h2><div id="liveTable" class="status">Loading…</div></div><div class="panel"><h2>Source mix</h2><div id="sourceTable" class="status">Loading…</div></div></div>
<div class="section-title">Technical context</div><div class="tables"><div class="panel"><h2>Devices</h2><div id="devicesTable" class="status">Loading…</div></div><div class="panel"><h2>Observed v8.5.6+ versions</h2><div id="versionsTable" class="status">Loading…</div></div></div>
<div class="footer"><span>Marine Tools v8.5.6 analytics · anonymous aggregate telemetry</span><span id="updated">Not loaded</span></div>
</div><script>
(function(){'use strict';var currentRange='24h';var labels={'24h':'Last 24 hours','7d':'Last 7 days','30d':'Last 30 days','90d':'Last 90 days'};function $(id){return document.getElementById(id)}function num(v){return Number(v)||0}function fmt(n,d){return num(n).toLocaleString(undefined,{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d==null?0:d})}function pct(v){return fmt(v,1)+'%'}function duration(sec){sec=Math.max(0,Math.round(num(sec)));if(sec<60)return sec+'s';var m=Math.floor(sec/60),s=sec%60;if(m<60)return m+'m '+s+'s';var h=Math.floor(m/60);m%=60;return h+'h '+m+'m'}function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}function delta(id,cur,prev,suffix){var el=$(id);cur=num(cur);prev=num(prev);if(prev===0){el.className='delta '+(cur>0?'up':'flat');el.textContent=cur>0?'New in this period':'No change';return}var p=(cur-prev)/Math.abs(prev)*100;el.className='delta '+(p>0?'up':p<0?'down':'flat');el.textContent=(p>0?'↑ ':p<0?'↓ ':'')+Math.abs(p).toFixed(0)+'% vs previous'+(suffix||'')}function simpleTable(rows,nameKey,valueKey,formatter){if(!rows||!rows.length)return'<div class="empty">No data in this period.</div>';var max=Math.max.apply(null,rows.map(function(r){return num(r[valueKey])}))||1;return'<table><thead><tr><th>Name</th><th>Share</th><th>Value</th></tr></thead><tbody>'+rows.map(function(r){var v=num(r[valueKey]),w=Math.max(2,v/max*100);return'<tr><td>'+esc(r[nameKey]||'Unknown')+'</td><td><div class="bar"><i style="width:'+w.toFixed(1)+'%"></i></div></td><td>'+(formatter?formatter(v):fmt(v))+'</td></tr>'}).join('')+'</tbody></table>'}function trendTable(rows,nameKey,valueKey){if(!rows||!rows.length)return'<div class="empty">No tool activity in this period.</div>';return'<table><thead><tr><th>Name</th><th>Uses</th><th>Trend</th></tr></thead><tbody>'+rows.map(function(r){var c=r.changePct,cls=c==null?'new':c>0?'up':c<0?'down':'',label=c==null?'New':(c>0?'↑ ':c<0?'↓ ':'')+Math.abs(num(c)).toFixed(0)+'%';return'<tr><td>'+esc(r[nameKey])+'</td><td>'+fmt(r[valueKey])+'</td><td><span class="trend '+cls+'">'+label+'</span></td></tr>'}).join('')+'</tbody></table>'}function chart(data){var hld=$('chart');if(!data||!data.length){hld.innerHTML='<div class="status empty">No timeline data.</div>';return}var w=900,h=250,pad=22,max=1;data.forEach(function(d){max=Math.max(max,num(d.sessions),num(d.pageViews),num(d.toolUses),num(d.errors))});function pts(key){return data.map(function(d,i){var x=data.length===1?w/2:pad+i*((w-pad*2)/(data.length-1)),y=h-pad-(num(d[key])/max)*(h-pad*2);return x.toFixed(1)+','+y.toFixed(1)}).join(' ')}var ticks=data.map(function(d,i){if(data.length>12&&i%Math.ceil(data.length/8)!==0&&i!==data.length-1)return'';var x=data.length===1?w/2:pad+i*((w-pad*2)/(data.length-1));return'<text x="'+x.toFixed(1)+'" y="'+(h-3)+'" text-anchor="middle" fill="#7898ab" font-size="9">'+esc(d.label)+'</text>'}).join('');hld.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline fill="none" stroke="#28c4f4" stroke-width="3" points="'+pts('sessions')+'"/><polyline fill="none" stroke="#32d48a" stroke-width="3" points="'+pts('pageViews')+'"/><polyline fill="none" stroke="#f2bf49" stroke-width="3" points="'+pts('toolUses')+'"/><polyline fill="none" stroke="#ff625d" stroke-width="2" points="'+pts('errors')+'"/>'+ticks+'</svg>'}function hoursChart(rows){if(!rows||!rows.length){$('hours').innerHTML='<div class="empty">No session data.</div>';return}var map={};rows.forEach(function(r){map[r.hour]=r.sessions});var max=Math.max.apply(null,Object.values(map).concat([1])),html='<div class="hours">';for(var h=0;h<24;h+=2){var total=num(map[h])+num(map[h+1]),height=Math.max(2,total/max*100);html+='<div class="hour" title="'+String(h).padStart(2,'0')+':00–'+String(h+2).padStart(2,'0')+':00 UTC · '+fmt(total)+' sessions"><i style="height:'+height.toFixed(1)+'%"></i><span>'+String(h).padStart(2,'0')+'</span></div>'}html+='</div>';$('hours').innerHTML=html}function liveTable(rows){if(!rows||!rows.length)return'<div class="empty">Live request telemetry starts with v8.5.6.</div>';return'<table><thead><tr><th>Endpoint</th><th>Requests</th><th>Success</th><th>Avg latency</th></tr></thead><tbody>'+rows.map(function(r){var cls=r.successRate>=98?'health-good':r.successRate>=90?'health-warn':'health-bad';return'<tr><td>'+esc(r.endpoint)+'</td><td>'+fmt(r.requests)+'</td><td class="'+cls+'">'+pct(r.successRate)+'</td><td>'+fmt(r.avgLatencySeconds,2)+'s</td></tr>'}).join('')+'</tbody></table>'}async function load(){document.querySelectorAll('.range button').forEach(function(b){b.disabled=true});$('refresh').disabled=true;try{var r=await fetch('/admin/api/analytics-v2?range='+encodeURIComponent(currentRange),{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error('Dashboard API returned '+r.status);var d=await r.json();if(d.error)throw new Error(d.error);var c=d.current||{},p=d.previous||{};$('who').textContent=d.viewer||'Cloudflare Access';$('periodLabel').textContent=labels[currentRange];$('sessions').textContent=fmt(c.sessions);$('toolsPerSession').textContent=fmt(c.toolsPerSession,2);$('toolActiveRate').textContent=pct(c.toolActiveRate);$('searchRate').textContent=pct(c.searchSessionRate);$('liveSuccess').textContent=pct(c.liveSuccessRate);$('avgVisible').textContent=duration(c.avgEngagedSecondsPerSession);$('pagesPerSession').textContent=fmt(c.pagesPerSession,2);$('telemetryCoverage').textContent=pct(c.telemetryCoverage);delta('sessionsDelta',c.sessions,p.sessions);delta('toolsPerSessionDelta',c.toolsPerSession,p.toolsPerSession);delta('toolActiveRateDelta',c.toolActiveRate,p.toolActiveRate);delta('searchRateDelta',c.searchSessionRate,p.searchSessionRate);delta('liveSuccessDelta',c.liveSuccessRate,p.liveSuccessRate);delta('avgVisibleDelta',c.avgEngagedSecondsPerSession,p.avgEngagedSecondsPerSession);delta('pagesPerSessionDelta',c.pagesPerSession,p.pagesPerSession);delta('telemetryCoverageDelta',c.telemetryCoverage,p.telemetryCoverage);chart(d.timeline);hoursChart(d.hours);$('toolsTable').innerHTML=trendTable(d.topTools,'tool','uses');$('categoriesTable').innerHTML=trendTable(d.categories,'category','uses');$('pagesTable').innerHTML=simpleTable(d.pages,'page','views');$('engagementTable').innerHTML=simpleTable(d.engagementByPage,'page','seconds',duration);$('featuresTable').innerHTML=simpleTable(d.features,'feature','uses');$('searches').textContent=fmt(d.search.used);$('searchOpenRate').textContent=pct(d.search.resultOpenRate);$('searchNoResultRate').textContent=pct(d.search.noResultRate);$('searchTable').innerHTML=simpleTable(d.search.surfaces,'name','count');$('liveTable').innerHTML=liveTable(d.live);$('sourceTable').innerHTML=simpleTable(d.sources,'source','count');$('devicesTable').innerHTML=simpleTable(d.devices,'device','sessions');$('versionsTable').innerHTML=simpleTable(d.versions,'version','sessions');$('updated').textContent='Updated '+new Date(d.generatedAt).toLocaleString()}catch(e){document.querySelectorAll('.status').forEach(function(x){x.innerHTML='<span class="error">'+esc(e.message)+'</span>'})}finally{document.querySelectorAll('.range button').forEach(function(b){b.disabled=false});$('refresh').disabled=false}}document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){currentRange=b.dataset.range;document.querySelectorAll('.range button').forEach(function(x){x.classList.toggle('active',x===b)});load()})});$('refresh').addEventListener('click',load);load()})();
</script></body></html>`;

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==="/api/analytics/event"){
      if(request.method==="OPTIONS"){const origin=request.headers.get("origin")||"";return new Response(null,{status:204,headers:{...CORS,"access-control-allow-origin":PRODUCT_ORIGINS.has(origin)?origin:"null","vary":"Origin"}})}
      return analyticsEvent(request,env);
    }
    if(url.pathname==="/admin/analytics"){
      if(!adminAccessOk(request))return adminUnauthorized(false);
      return new Response(ADMIN_DASHBOARD_HTML,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
    }
    if(url.pathname==="/admin/api/analytics-v2"){
      if(!adminAccessOk(request))return adminUnauthorized(true);
      try{return json(await adminAnalyticsSummary(request,env))}catch(e){return json({error:e.message},500)}
    }
    if(url.pathname==="/api/health"){
      const base=await previousWorker.fetch(request,env,ctx);if(!base.ok)return base;try{const j=await base.clone().json(),caps=Array.isArray(j.capabilities)?j.capabilities:[];for(const cap of ["anonymous-analytics-v2","private-analytics-dashboard-v2"]){if(!caps.includes(cap))caps.push(cap)}return json({...j,capabilities:caps,analyticsDashboardVersion:"2"})}catch{return base}
    }
    return previousWorker.fetch(request,env,ctx);
  }
};
