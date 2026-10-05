import previousWorker from "./worker-v858-dashboard.js";

const VERSION="8.6.0";
const BUILD="20261005-v8-6-0-energy-sidebar1";
const RELEASED="2026-10-05";
const WORKER="worker-v860-dashboard";
const DATASET="events.analyticsEngine.marine_tools_usage";
const EVENTS=new Set(["calculation_completed","result_saved","result_exported","profile_value_used","offline_tool_used","visitor_type"]);
const ORIGINS=new Set(["https://marinetools.app","https://www.marinetools.app"]);
const CORS={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...CORS,"content-type":"application/json;charset=utf-8","cache-control":"no-store",...extra}});
const clean=(v,max)=>String(v??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,max);

async function analyticsSql(env,query,params={}){if(!env.ANALYTICS_SQL)throw new Error("Analytics SQL binding is not configured");return env.ANALYTICS_SQL.query({query,params})}
function range(value){const days=value==="90d"?90:value==="30d"?30:value==="7d"?7:1,now=Date.now();return{start:new Date(now-days*86400000).toISOString(),end:new Date(now).toISOString()}}
async function acceptProductEvent(request,env,body){
 const origin=request.headers.get("origin")||"";if(!ORIGINS.has(origin))return json({error:"Origin not allowed"},403,{"access-control-allow-origin":"null"});
 if(!env.ANALYTICS)return json({ok:false,configured:false},503);
 const event=clean(body.event,40);if(!EVENTS.has(event))return null;
 env.ANALYTICS.writeDataPoint({blobs:[event,clean(body.page,80),clean(body.tool,120),clean(body.device,20),clean(body.version,20)||VERSION],doubles:[1,Math.max(0,Math.min(3600,Number(body.duration)||0))],indexes:["marine-tools"]});
 return json({ok:true},202,{"access-control-allow-origin":origin,"vary":"Origin"});
}
async function enrichAnalytics(request,env,response){
 if(!response.ok)return response;let body;try{body=await response.clone().json()}catch{return response};const p=range(new URL(request.url).searchParams.get("range")||"24h");
 try{const q=`SELECT blob1 AS event_name, blob2 AS page, blob3 AS tool, COUNT(*) AS event_count FROM ${DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob1 IN ('calculation_completed','result_saved','result_exported','profile_value_used','offline_tool_used','visitor_type') GROUP BY event_name,page,tool ORDER BY event_count DESC LIMIT 800`;const result=await analyticsSql(env,q,p),rows=result.data||[],totals={},tools={};for(const row of rows){const event=String(row.event_name||""),count=Number(row.event_count)||0,tool=String(row.tool||"Unknown");totals[event]=(totals[event]||0)+count;if(event!=="visitor_type"){tools[tool]??={tool,calculations:0,saves:0,exports:0,profileReuse:0,offlineUses:0};if(event==="calculation_completed")tools[tool].calculations+=count;if(event==="result_saved")tools[tool].saves+=count;if(event==="result_exported")tools[tool].exports+=count;if(event==="profile_value_used")tools[tool].profileReuse+=count;if(event==="offline_tool_used")tools[tool].offlineUses+=count}}const first=rows.filter(x=>x.event_name==="visitor_type"&&x.tool==="first").reduce((s,x)=>s+Number(x.event_count||0),0),returning=rows.filter(x=>x.event_name==="visitor_type"&&x.tool==="returning").reduce((s,x)=>s+Number(x.event_count||0),0);body.productActions={totals,visitorType:{first,returning,returningShare:first+returning?returning/(first+returning)*100:0},tools:Object.values(tools).sort((a,b)=>(b.calculations+b.saves+b.exports)-(a.calculations+a.saves+a.exports)).slice(0,30)}}catch(e){body.productActions={error:String(e?.message||e),totals:{},tools:[]}}
 body.release={...(body.release||{}),version:VERSION,build:BUILD,released:RELEASED,worker:WORKER};body.worker=WORKER;return json(body);
}
async function release(response){try{return json({...await response.clone().json(),version:VERSION,build:BUILD,released:RELEASED,worker:WORKER})}catch{return response}}
async function health(response){try{const b=await response.clone().json();return json({...b,worker:WORKER,release:{...(b.release||{}),version:VERSION,build:BUILD,released:RELEASED,worker:WORKER}})}catch{return response}}
export default{async fetch(request,env,ctx){const url=new URL(request.url);if(url.pathname==="/api/analytics/event"&&request.method==="POST"){let body;try{body=JSON.parse(await request.clone().text())}catch{}if(body&&EVENTS.has(clean(body.event,40))){const r=await acceptProductEvent(request,env,body);if(r)return r}}if(url.pathname==="/admin/api/analytics")return enrichAnalytics(request,env,await previousWorker.fetch(request,env,ctx));if(url.pathname==="/api/release")return release(await previousWorker.fetch(request,env,ctx));if(url.pathname==="/api/health")return health(await previousWorker.fetch(request,env,ctx));return previousWorker.fetch(request,env,ctx)},async scheduled(controller,env,ctx){if(previousWorker.scheduled)return previousWorker.scheduled(controller,env,ctx)}};
