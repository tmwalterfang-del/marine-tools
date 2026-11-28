/* All-time usage history.
   Analytics Engine keeps about three months of events, so the Worker sums every finished UTC day into D1 (binding
   ANALYTICS_DB). Only counts per dimension are stored: no browser or visit identifiers, calculation values or IP
   addresses. The newest day is rolled up after 01:00 UTC so late events are included; missing days are filled in,
   oldest first, a few per cron run (the Analytics Engine window is about 90 days, so older days can no longer be added). */
const DATASET='events.analyticsEngine.marine_tools_usage';
const WINDOW_DAYS=89,DAYS_PER_RUN=2,ROLL_AFTER_UTC_HOUR=1;
const CONTEXT={source:'blob8',referrer:'blob12',campaign:'blob15',landing:'blob16',device:'blob4',os:'blob17',browser:'blob18',platform:'blob19',country:'blob20',version:'blob5'};
const DIMS=['total','event','page','tool',...Object.keys(CONTEXT)];
const SCHEMA=[
 "CREATE TABLE IF NOT EXISTS usage_daily(day TEXT NOT NULL,dim TEXT NOT NULL,key TEXT NOT NULL,label TEXT NOT NULL DEFAULT '',actions INTEGER NOT NULL DEFAULT 0,browsers INTEGER NOT NULL DEFAULT 0,visits INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,dim,key))",
 'CREATE TABLE IF NOT EXISTS usage_days(day TEXT PRIMARY KEY,rolled_at TEXT NOT NULL,row_count INTEGER NOT NULL)',
 // Last outcomes of the rollup (no user data): makes a failing cron visible from the dashboard and D1.
 "CREATE TABLE IF NOT EXISTS usage_rollup_log(at TEXT NOT NULL,day TEXT NOT NULL DEFAULT '',status TEXT NOT NULL,message TEXT NOT NULL DEFAULT '')"
];
const n=x=>Number(x)||0;
const dayOf=ms=>new Date(ms).toISOString().slice(0,10);
const text=(v,max=120)=>String(v==null?'':v).replace(/[\u0000-\u001f<>]/g,'').slice(0,max);
async function ensureSchema(db){await db.batch(SCHEMA.map(s=>db.prepare(s)))}

/* Sums one UTC day from Analytics Engine into rows {dim,key,label,actions,browsers,visits}.
   Browsers and visits are distinct within the day; across days they are added up (shown as "browser-days"). */
export async function summariseDay(env,day){
 const start=day+'T00:00:00.000Z',end=new Date(Date.parse(start)+86400000).toISOString();
 const where=`FROM ${DATASET} WHERE timestamp >= $start AND timestamp < $end AND blob10='usage-v1' AND blob6!=''`;
 const q=query=>env.ANALYTICS_SQL.query({query,params:{start,end}}).then(r=>r.data||[]);
 const cols=Object.entries(CONTEXT).map(([k,b])=>`${b} AS ${k}`).join(', ');
 const [total,events,tools,context]=await Promise.all([
  q(`SELECT COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where}`),
  q(`SELECT blob1 AS ev, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY ev`),
  q(`SELECT blob1 AS ev, blob2 AS page, blob3 AS tool, blob11 AS label, COUNT(*) AS actions, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} GROUP BY ev,page,tool,label ORDER BY actions DESC LIMIT 2000`),
  q(`SELECT ${cols}, COUNT(DISTINCT blob6) AS browsers, COUNT(DISTINCT blob7) AS visits ${where} AND blob1='visit_started' GROUP BY ${Object.keys(CONTEXT).join(',')} ORDER BY visits DESC LIMIT 2000`)
 ]);
 const rows=new Map(),add=(dim,key,label,r)=>{key=text(key,160);if(!key)return;const id=dim+'\u0001'+key,x=rows.get(id)||{dim,key,label:'',actions:0,browsers:0,visits:0};if(label&&!x.label)x.label=text(label,100);x.actions+=n(r.actions);x.browsers+=n(r.browsers);x.visits+=n(r.visits);rows.set(id,x)};
 if(total[0])add('total','all','',total[0]);
 for(const r of events)add('event',r.ev,'',r);
 for(const r of tools){add('page',r.page,'',{actions:r.actions});if(r.tool)add('tool',[r.ev,r.page,r.tool].join('|'),r.label,r)}
 for(const r of context)for(const dim of Object.keys(CONTEXT))add(dim,r[dim]||(dim==='referrer'||dim==='campaign'?'':'unknown'),'',{browsers:r.browsers,visits:r.visits});
 return [...rows.values()];
}
export async function rollupHistory(env,now=Date.now()){
 if(!env.ANALYTICS_DB||!env.ANALYTICS_SQL)return{status:'not-configured'};
 const db=env.ANALYTICS_DB;await ensureSchema(db);
 const today=Date.parse(dayOf(now)+'T00:00:00Z'),hour=new Date(now).getUTCHours();
 const want=[];for(let i=WINDOW_DAYS;i>=1;i--){if(i===1&&hour<ROLL_AFTER_UTC_HOUR)continue;want.push(dayOf(today-i*86400000))}
 if(!want.length)return{status:'waiting',rolled:[]};
 const have=new Set(((await db.prepare('SELECT day FROM usage_days WHERE day >= ?').bind(want[0]).all()).results||[]).map(r=>r.day));
 const todo=want.filter(d=>!have.has(d)).slice(0,DAYS_PER_RUN),rolled=[];
 const log=(day,status,message='')=>db.prepare('INSERT INTO usage_rollup_log(at,day,status,message) VALUES (?,?,?,?)').bind(new Date().toISOString(),day,status,text(message,300)).run().catch(()=>{});
 for(const day of todo){
  let rows;try{rows=await summariseDay(env,day)}catch(e){await log(day,'query-error',e&&e.message);console.error('history rollup query failed',day,e&&e.message);return{status:'error',stage:'query',day,rolled,error:text(e&&e.message,300)}}
  const ins=db.prepare('INSERT INTO usage_daily(day,dim,key,label,actions,browsers,visits) VALUES (?,?,?,?,?,?,?)');
  try{await db.batch([db.prepare('DELETE FROM usage_daily WHERE day = ?').bind(day),...rows.map(r=>ins.bind(day,r.dim,r.key,r.label,r.actions,r.browsers,r.visits)),db.prepare('INSERT OR REPLACE INTO usage_days(day,rolled_at,row_count) VALUES (?,?,?)').bind(day,new Date(now).toISOString(),rows.length)])}catch(e){await log(day,'store-error',e&&e.message);console.error('history rollup store failed',day,e&&e.message);return{status:'error',stage:'store',day,rolled,error:text(e&&e.message,300)}}
  rolled.push(day);await log(day,'ok',rows.length+' rows');
 }
 return{status:'ok',rolled,remaining:want.filter(d=>!have.has(d)).length-rolled.length};
}

function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}})}
/* GET /admin/api/analytics-history?days=0|30|90|365 (0 = all time). Caller must already be authorised (Cloudflare Access). */
export async function historyApi(request,env,now=Date.now()){
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 if(!env.ANALYTICS_DB)return json({status:'not-configured',generatedAt:new Date(now).toISOString()});
 const db=env.ANALYTICS_DB;
 try{
  await ensureSchema(db);
  const raw=parseInt(new URL(request.url).searchParams.get('days')||'0',10),days=[30,90,365].includes(raw)?raw:0;
  const since=days?dayOf(now-days*86400000):'0000-00-00';
  const all=(sql,...b)=>db.prepare(sql).bind(...b).all().then(r=>r.results||[]);
  const top=(dim,limit=50)=>all('SELECT key, MAX(label) AS label, SUM(actions) AS actions, SUM(browsers) AS browserDays, SUM(visits) AS visits, COUNT(DISTINCT day) AS days FROM usage_daily WHERE dim = ? AND day >= ? GROUP BY key ORDER BY visits DESC, actions DESC LIMIT ?',dim,since,limit);
  const lastRuns=await all('SELECT at, day, status, message FROM usage_rollup_log ORDER BY at DESC LIMIT 5');
  const [cov,timeline,events,toolRows,...ctx]=await Promise.all([
   all('SELECT MIN(day) AS first, MAX(day) AS last, COUNT(*) AS days FROM usage_days WHERE day >= ?',since),
   all("SELECT day, visits, browsers, actions FROM usage_daily WHERE dim = 'total' AND day >= ? ORDER BY day",since),
   top('event',100),top('tool',2000),top('page'),...Object.keys(CONTEXT).map(d=>top(d))
  ]);
  const ev=k=>events.find(e=>e.key===k)||{};
  const tools=new Map();for(const r of toolRows){const [e,page,tool]=String(r.key).split('|');if(!tool)continue;const id=page+'|'+tool,x=tools.get(id)||{page,tool,label:r.label||tool,opened:0,attempts:0,calculations:0,copies:0,shares:0,exports:0,features:0};
   if(e==='tool_opened')x.opened+=n(r.browserDays);else if(e==='calculation_attempt')x.attempts+=n(r.actions);else if(e==='calculation_succeeded')x.calculations+=n(r.actions);else if(e==='result_copied')x.copies+=n(r.actions);else if(e==='result_shared')x.shares+=n(r.actions);else if(e==='result_exported')x.exports+=n(r.actions);else if(e==='feature_used')x.features+=n(r.actions);else continue;if(r.label&&x.label===tool)x.label=r.label;tools.set(id,x)}
  const features=toolRows.filter(r=>/^(feature_used|reference_page|education_page|education_module)\|/.test(r.key)).map(r=>{const [e,page,tool]=String(r.key).split('|');return{event:e,page,feature:tool,label:r.label||'',actions:n(r.actions),browserDays:n(r.browserDays)}}).sort((a,b)=>b.actions-a.actions).slice(0,100);
  const months=new Map();for(const t of timeline){const m=t.day.slice(0,7),x=months.get(m)||{month:m,visits:0,browserDays:0,days:0};x.visits+=n(t.visits);x.browserDays+=n(t.browsers);x.days++;months.set(m,x)}
  const [pages,...context]=ctx,ctxOut={};Object.keys(CONTEXT).forEach((d,i)=>{ctxOut[d]=context[i].map(r=>({key:r.key,visits:n(r.visits),browserDays:n(r.browserDays)}))});
  return json({status:'ready',generatedAt:new Date(now).toISOString(),days:days||'all',lastRuns,coverage:{first:cov[0]?.first||null,last:cov[0]?.last||null,days:n(cov[0]?.days)},
   totals:{visits:timeline.reduce((s,t)=>s+n(t.visits),0),browserDays:timeline.reduce((s,t)=>s+n(t.browsers),0),calculations:n(ev('calculation_succeeded').actions),activeBrowserDays:n(ev('active_usage').browserDays),returningVisits:n(ev('return_visit').visits),copies:n(ev('result_copied').actions),shares:n(ev('result_shared').actions),exports:n(ev('result_exported').actions),features:n(ev('feature_used').actions)},
   timeline:timeline.map(t=>({day:t.day,visits:n(t.visits),browsers:n(t.browsers)})),months:[...months.values()],
   events:events.map(e=>({event:e.key,actions:n(e.actions),browserDays:n(e.browserDays)})),
   tools:[...tools.values()].sort((a,b)=>b.calculations-a.calculations||b.opened-a.opened).slice(0,200),features,
   pages:pages.map(r=>({page:r.key,actions:n(r.actions)})).sort((a,b)=>b.actions-a.actions),context:ctxOut});
 }catch(e){return json({status:'error',error:'History could not be read.'},500)}
}
export const HISTORY_DIMENSIONS=DIMS;
