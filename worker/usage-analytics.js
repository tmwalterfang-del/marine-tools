const DATASET='events.analyticsEngine.marine_tools_usage';
const EVENTS=new Set(['visit_started','return_visit','active_usage','tool_opened','calculation_attempt','calculation_succeeded','calculation_invalid','calculation_failed','result_copied','result_shared','result_exported','store_clicked','education_page','education_module','education_filter','education_formula','education_presentation','tool_feedback']);
const ORIGINS=new Set(['https://marinetools.app','https://www.marinetools.app']);
const SOURCES=new Set(['direct','search','linkedin','facebook','reddit','instagram','x','youtube','email','qr','teaching','internal','other-campaign','other-referral']);
const id=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v||'')?v:'';
const name=v=>/^[a-z0-9_-]{1,80}$/i.test(v||'')?v:'';
const token=(v,max=64)=>String(v||'').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,max);
const host=v=>String(v||'').toLowerCase().replace(/^www\./,'').replace(/[^a-z0-9.-]/g,'').slice(0,120);
const path=v=>{const s=String(v||'/').split(/[?#]/,1)[0];return s.startsWith('/')?s.replace(/[^a-z0-9/_ .-]/gi,'').slice(0,120)||'/':'/'};
function json(body,status,origin){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','access-control-allow-origin':origin||'null','vary':'Origin'}})}
export async function acceptUsage(request,env){
 if(request.method!=='POST')return null;
 const text=await request.clone().text();if(text.length>4096)return json({error:'Payload too large'},413);
 let body;try{body=JSON.parse(text)}catch{return null}if(!EVENTS.has(body.event))return null;
 const origin=request.headers.get('origin');if(!ORIGINS.has(origin))return json({error:'Origin not allowed'},403);
 if(!id(body.visitor)||!id(body.session)||body.schema!=='usage-v1'||!name(body.page)||body.tool&&!name(body.tool))return json({error:'Invalid usage event'},400,origin);
 if(!env.ANALYTICS)return json({error:'Analytics is unavailable'},503,origin);
 const country=token(request.cf?.country,8)||'unknown';
 env.ANALYTICS.writeDataPoint({indexes:['marine-tools'],blobs:[
  body.event,body.page,body.tool||'',
  ['desktop','tablet','mobile'].includes(body.device)?body.device:'unknown',
  String(body.version||'').replace(/[^0-9.a-z-]/gi,'').slice(0,20),
  id(body.visitor),id(body.session),SOURCES.has(body.source)?body.source:'direct',
  body.visitorKind==='returning'?'returning':'new','usage-v1',
  String(body.label||'').replace(/[<>\u0000-\u001f]/g,'').slice(0,100),
  host(body.referrer),token(body.utmSource),token(body.utmMedium),token(body.utmCampaign),
  path(body.landingPage),token(body.os,24)||'other',token(body.browser,32)||'other',token(body.platform,32)||'web',country
 ],doubles:[1,0]});
 return json({ok:true},202,origin);
}
const n=x=>Number(x)||0;
const aggregate=(rows,key,label=key)=>{
 const map=new Map();
 for(const r of rows){const k=String(r[key]||'').trim();if(!k)continue;const x=map.get(k)||{[label]:k,browsers:0,visits:0};x.browsers+=n(r.browsers);x.visits+=n(r.visits);map.set(k,x)}
 return [...map.values()].sort((a,b)=>b.visits-a.visits||b.browsers-a.browsers).slice(0,50);
};
/* "Was this helpful?" per tool: label = "<tool title> · helpful|not_helpful|reason:<key>". Counts are actions (clicks), with unique browsers alongside. */
const FEEDBACK_REASONS=new Set(['not-found','wrong-result','hard-to-use','other']);
export function toolFeedback(rows){const map=new Map();for(const r of rows||[]){const s=String(r.label||''),i=s.lastIndexOf(' · ');if(i<1)continue;const tool=s.slice(0,i).trim(),kind=s.slice(i+3).trim();if(!tool)continue;
 const x=map.get(tool)||{tool,helpful:0,notHelpful:0,browsers:0,reasons:{}};if(kind==='helpful'){x.helpful+=n(r.actions);x.browsers+=n(r.browsers)}else if(kind==='not_helpful'){x.notHelpful+=n(r.actions);x.browsers+=n(r.browsers)}else if(kind.startsWith('reason:')&&FEEDBACK_REASONS.has(kind.slice(7)))x.reasons[kind.slice(7)]=(x.reasons[kind.slice(7)]||0)+n(r.actions);else continue;map.set(tool,x)}
 return [...map.values()].map(x=>({...x,share:x.helpful+x.notHelpful?Math.round(100*x.helpful/(x.helpful+x.notHelpful)):null})).sort((a,b)=>(b.helpful+b.notHelpful)-(a.helpful+a.notHelpful)||a.tool.localeCompare(b.tool)).slice(0,100)}
export async function enrichUsage(response,env){
 if(!response.ok)return response;const data=await response.clone().json(),period=data.period;
 if(!period||!env.ANALYTICS_SQL)return response;
 const where=`FROM ${DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob10='usage-v1' AND blob6!=''`;
 const metrics=`SELECT blob1 AS usage_event, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY blob1`;
 const overview=`SELECT COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where}`;
 const tools=`SELECT blob1 AS usage_event, blob2 AS page, blob3 AS tool, blob11 AS label, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers ${where} AND blob3!='' GROUP BY blob1,blob2,blob3,blob11 ORDER BY actions DESC LIMIT 1000`;
 const bucket=data.range==='24h'?'toStartOfHour(timestamp)':'toStartOfDay(timestamp)';
 const timeline=`SELECT ${bucket} AS bucket, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY bucket ORDER BY bucket ASC`;
 const context=`SELECT blob8 AS source, blob12 AS referrer, blob13 AS utm_source, blob14 AS utm_medium, blob15 AS utm_campaign, blob16 AS landing_page, blob4 AS device, blob17 AS os, blob18 AS browser, blob19 AS platform, blob20 AS country, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} AND blob1='visit_started' GROUP BY source,referrer,utm_source,utm_medium,utm_campaign,landing_page,device,os,browser,platform,country ORDER BY visits DESC LIMIT 1000`;
 const feedbackQ=`SELECT blob11 AS label, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers ${where} AND blob1='tool_feedback' GROUP BY blob11 ORDER BY actions DESC LIMIT 500`;
 const query=(query,params)=>env.ANALYTICS_SQL.query({query,params}).then(r=>r.data||[]);
 const cur={start:period.start,end:period.end},prev={start:period.previousStart,end:period.previousEnd};
 try{
  const [current,previous,rows,history,contextRows,currentReach,previousReach,feedbackRows]=await Promise.all([query(metrics,cur),query(metrics,prev),query(tools,cur),query(timeline,cur),query(context,cur),query(overview,cur),query(overview,prev),query(feedbackQ,cur).catch(()=>[])]);
  const summary=rows=>{const get=event=>rows.find(r=>r.usage_event===event)||{};return{browsers:n(get('visit_started').browsers),visits:n(get('visit_started').visits),activeBrowsers:n(get('active_usage').browsers),calculations:n(get('calculation_succeeded').actions),returningBrowsers:n(get('return_visit').browsers),attempts:n(get('calculation_attempt').actions),invalid:n(get('calculation_invalid').actions),failed:n(get('calculation_failed').actions),copies:n(get('result_copied').actions),shares:n(get('result_shared').actions),exports:n(get('result_exported').actions),storeClicks:n(get('store_clicked').actions)}};
  const byTool=new Map();for(const r of rows){if(!['tool_opened','calculation_attempt','calculation_succeeded','calculation_invalid','calculation_failed','result_copied','result_shared','result_exported','store_clicked'].includes(r.usage_event))continue;const key=r.page+'|'+r.tool,x=byTool.get(key)||{page:r.page,tool:r.tool,label:r.label||r.tool,openedBrowsers:0,activeBrowsers:0,attempts:0,calculations:0,invalid:0,failed:0,copies:0,shares:0,exports:0,storeClicks:0};if(r.usage_event==='tool_opened')x.openedBrowsers=n(r.browsers);if(r.usage_event==='calculation_attempt')x.attempts=n(r.actions);if(r.usage_event==='calculation_succeeded'){x.calculations=n(r.actions);x.activeBrowsers=n(r.browsers)}if(r.usage_event==='calculation_invalid')x.invalid=n(r.actions);if(r.usage_event==='calculation_failed')x.failed=n(r.actions);if(r.usage_event==='result_copied')x.copies=n(r.actions);if(r.usage_event==='result_shared')x.shares=n(r.actions);if(r.usage_event==='result_exported')x.exports=n(r.actions);if(r.usage_event==='store_clicked')x.storeClicks=n(r.actions);byTool.set(key,x)}
  const campaigns=new Map();for(const r of contextRows){const campaign=String(r.utm_campaign||'').trim();if(!campaign)continue;const key=[r.utm_source||'',r.utm_medium||'',campaign].join('|'),x=campaigns.get(key)||{source:r.utm_source||'',medium:r.utm_medium||'',campaign,browsers:0,visits:0};x.browsers+=n(r.browsers);x.visits+=n(r.visits);campaigns.set(key,x)}
  data.usage={feedback:toolFeedback(feedbackRows),schema:'usage-v1',current:{...summary(current),browsers:n(currentReach[0]?.browsers),visits:n(currentReach[0]?.visits)},previous:{...summary(previous),browsers:n(previousReach[0]?.browsers),visits:n(previousReach[0]?.visits)},tools:[...byTool.values()].sort((a,b)=>b.activeBrowsers-a.activeBrowsers||b.calculations-a.calculations),education:rows.filter(r=>r.usage_event.startsWith('education_')),timeline:history,
   sources:aggregate(contextRows,'source'),referrers:aggregate(contextRows,'referrer'),campaigns:[...campaigns.values()].sort((a,b)=>b.visits-a.visits).slice(0,50),landingPages:aggregate(contextRows,'landing_page','landingPage'),devices:aggregate(contextRows,'device'),operatingSystems:aggregate(contextRows,'os'),browsers:aggregate(contextRows,'browser'),platforms:aggregate(contextRows,'platform'),countries:aggregate(contextRows,'country'),truncated:rows.length>=1000||contextRows.length>=1000};
 }catch{data.usage={error:'Usage measurements are temporarily unavailable.'}}
 const headers=new Headers(response.headers);return new Response(JSON.stringify(data),{status:response.status,headers});
}
