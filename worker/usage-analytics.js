const DATASET='events.analyticsEngine.marine_tools_usage';
const EVENTS=new Set(['visit_started','return_visit','active_usage','tool_opened','calculation_attempt','calculation_succeeded','calculation_invalid','education_page','education_module','education_filter','education_formula','education_presentation']);
const ORIGINS=new Set(['https://marinetools.app','https://www.marinetools.app']);
const SOURCES=new Set(['direct','search','linkedin','newsletter','teaching','internal','other-referral']);
const id=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v||'')?v:'';
const name=v=>/^[a-z0-9_-]{1,80}$/i.test(v||'')?v:'';
function json(body,status,origin){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','access-control-allow-origin':origin||'null','vary':'Origin'}})}
export async function acceptUsage(request,env){
 if(request.method!=='POST')return null;
 const text=await request.clone().text();if(text.length>4096)return json({error:'Payload too large'},413);
 let body;try{body=JSON.parse(text)}catch{return null}if(!EVENTS.has(body.event))return null;
 const origin=request.headers.get('origin');if(!ORIGINS.has(origin))return json({error:'Origin not allowed'},403);
 if(!id(body.visitor)||!id(body.session)||body.schema!=='usage-v1'||!name(body.page)||body.tool&&!name(body.tool))return json({error:'Invalid usage event'},400,origin);
 if(!env.ANALYTICS)return json({error:'Analytics is unavailable'},503,origin);
 env.ANALYTICS.writeDataPoint({indexes:['marine-tools'],blobs:[body.event,body.page,body.tool||'', ['desktop','tablet','mobile'].includes(body.device)?body.device:'unknown',String(body.version||'').replace(/[^0-9.a-z-]/gi,'').slice(0,20),id(body.visitor),id(body.session),SOURCES.has(body.source)?body.source:'direct',body.visitorKind==='returning'?'returning':'new','usage-v1',String(body.label||'').replace(/[<>\u0000-\u001f]/g,'').slice(0,100)],doubles:[1,0]});
 return json({ok:true},202,origin);
}
const n=x=>Number(x)||0;
export async function enrichUsage(response,env){
 if(!response.ok)return response;const data=await response.clone().json(),period=data.period;
 if(!period||!env.ANALYTICS_SQL)return response;
 const where=`FROM ${DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob10='usage-v1' AND blob6!=''`;
 const metrics=`SELECT blob1 AS usage_event, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY blob1`;
 const overview=`SELECT COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where}`;
 const tools=`SELECT blob1 AS usage_event, blob2 AS page, blob3 AS tool, blob11 AS label, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers ${where} AND blob3!='' GROUP BY blob1,blob2,blob3,blob11 ORDER BY actions DESC LIMIT 1000`;
 const bucket=data.range==='24h'?'toStartOfHour(timestamp)':'toStartOfDay(timestamp)';
 const timeline=`SELECT ${bucket} AS bucket, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY bucket ORDER BY bucket ASC`;
 const sources=`SELECT blob8 AS source, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY blob8 ORDER BY visits DESC LIMIT 10`;
 const query=(query,params)=>env.ANALYTICS_SQL.query({query,params}).then(r=>r.data||[]);
 const cur={start:period.start,end:period.end},prev={start:period.previousStart,end:period.previousEnd};
 try{
  const [current,previous,rows,history,traffic,currentReach,previousReach]=await Promise.all([query(metrics,cur),query(metrics,prev),query(tools,cur),query(timeline,cur),query(sources,cur),query(overview,cur),query(overview,prev)]);
  const summary=rows=>{const get=event=>rows.find(r=>r.usage_event===event)||{};return{browsers:n(get('visit_started').browsers),visits:n(get('visit_started').visits),activeBrowsers:n(get('active_usage').browsers),calculations:n(get('calculation_succeeded').actions),returningBrowsers:n(get('return_visit').browsers),attempts:n(get('calculation_attempt').actions),invalid:n(get('calculation_invalid').actions)}};
  const byTool=new Map();for(const r of rows){if(!['tool_opened','calculation_attempt','calculation_succeeded','calculation_invalid'].includes(r.usage_event))continue;const key=r.page+'|'+r.tool,x=byTool.get(key)||{page:r.page,tool:r.tool,label:r.label||r.tool,openedBrowsers:0,activeBrowsers:0,attempts:0,calculations:0,invalid:0};if(r.usage_event==='tool_opened')x.openedBrowsers=n(r.browsers);if(r.usage_event==='calculation_attempt')x.attempts=n(r.actions);if(r.usage_event==='calculation_succeeded'){x.calculations=n(r.actions);x.activeBrowsers=n(r.browsers)}if(r.usage_event==='calculation_invalid')x.invalid=n(r.actions);byTool.set(key,x)}
  data.usage={schema:'usage-v1',current:{...summary(current),browsers:n(currentReach[0]?.browsers),visits:n(currentReach[0]?.visits)},previous:{...summary(previous),browsers:n(previousReach[0]?.browsers),visits:n(previousReach[0]?.visits)},tools:[...byTool.values()].sort((a,b)=>b.activeBrowsers-a.activeBrowsers||b.calculations-a.calculations),education:rows.filter(r=>r.usage_event.startsWith('education_')),timeline:history,sources:traffic,truncated:rows.length>=1000};
 }catch{data.usage={error:'Usage measurements are temporarily unavailable.'}}
 const headers=new Headers(response.headers);return new Response(JSON.stringify(data),{status:response.status,headers});
}
