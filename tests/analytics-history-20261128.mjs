/* Long-term usage history: daily rollup into D1 (a real SQLite database stands in for D1) from mocked Analytics Engine
 * rows, the all-time API, the Access guard, the dashboard panel and the privacy rule (no identifiers are stored). */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
let sqlite;
try{sqlite=await import('node:sqlite')}catch{
 // Node 22 before 22.13 needs the flag; re-run once with it.
 if(!process.execArgv.includes('--experimental-sqlite')){const r=spawnSync(process.execPath,['--experimental-sqlite',...process.argv.slice(1)],{stdio:'inherit'});process.exit(r.status??1)}
 throw new Error('node:sqlite unavailable');
}
const {rollupHistory,historyApi,summariseDay,HISTORY_DIMENSIONS}=await import('../worker/analytics-history.js');
const worker=(await import(process.env.MT_ANALYTICS_WORKER_MODULE||'../worker/worker-v861-app-analytics.js')).default;

// Minimal D1 shim on SQLite: prepare().bind().all()/run(), batch().
function d1(){const db=new sqlite.DatabaseSync(':memory:');const stmt=(sql,args=[])=>({bind:(...a)=>stmt(sql,a),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>{db.prepare(sql).run(...args);return{success:true}},_exec(){/^\s*(select)/i.test(sql)?db.prepare(sql).all(...args):db.prepare(sql).run(...args)}});
 return{raw:db,prepare:sql=>stmt(sql),batch:async list=>{db.exec('BEGIN');try{for(const s of list)s._exec();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return list.map(()=>({success:true}))}}}

// Mock Analytics Engine: answers the four rollup queries for any day; records the queried windows.
const asked=[];
const sql={query:async({query,params})=>{asked.push(params.start);const day=params.start.slice(0,10),k=day==='2026-11-26'?2:1;
 if(/GROUP BY ev,page,tool,label/.test(query))return{data:[{ev:'calculation_succeeded',page:'fuel',tool:'robBtn',label:'Fuel ROB & endurance',actions:3*k,browsers:2,visits:2},{ev:'tool_opened',page:'fuel',tool:'robBtn',label:'Fuel ROB & endurance',actions:4,browsers:3,visits:3},{ev:'feature_used',page:'home',tool:'home-example',label:'fuel-rob-and-endurance',actions:2,browsers:2,visits:2},{ev:'reference_page',page:'glossary',tool:'glossary',label:'',actions:5,browsers:4,visits:4}]};
 if(/GROUP BY ev/.test(query))return{data:[{ev:'visit_started',actions:10*k,browsers:8,visits:10*k},{ev:'calculation_succeeded',actions:3*k,browsers:2,visits:2},{ev:'feature_used',actions:2,browsers:2,visits:2}]};
 if(/blob1='visit_started'/.test(query))return{data:[{source:'search',referrer:'google.com',campaign:'',landing:'/',device:'mobile',os:'android',browser:'chrome',platform:'web',country:'no',version:'8.12.0',browsers:6,visits:7*k},{source:'direct',referrer:'',campaign:'shorts',landing:'/glossary.html',device:'desktop',os:'windows',browser:'edge',platform:'android-app',country:'se',version:'8.13.0',browsers:2,visits:3}]};
 return{data:[{actions:30*k,browsers:8,visits:10*k}]}}};

const db=d1(),env={ANALYTICS_DB:db,ANALYTICS_SQL:sql};
// 1) Rollup: 00:30 UTC on 28 Nov – yesterday is not rolled yet, oldest days first, at most two per run.
const t0=Date.parse('2026-11-28T00:30:00Z');
const r1=await rollupHistory(env,t0);
assert.equal(r1.status,'ok');assert.equal(r1.rolled.length,2,'two days per run');assert.equal(r1.rolled[0],'2026-08-31','oldest day in the 89-day window first');
assert.ok(!r1.rolled.includes('2026-11-27'),'yesterday waits until after 01:00 UTC');
let guard=0,last;while((last=await rollupHistory(env,t0)).rolled.length&&++guard<60);
assert.equal(last.remaining,0,'window filled');
const before=db.raw.prepare('SELECT COUNT(*) AS c FROM usage_days').get().c;assert.equal(before,88,'88 days before 01:00');
const r2=await rollupHistory(env,Date.parse('2026-11-28T02:00:00Z'));assert.deepEqual(r2.rolled,['2026-11-27'],'yesterday rolled after 01:00 UTC');
const r3=await rollupHistory(env,Date.parse('2026-11-28T02:15:00Z'));assert.deepEqual(r3.rolled,[],'no day rolled twice');

// 2) Privacy: only counts and short keys; no identifiers or values.
const cols=db.raw.prepare("SELECT name FROM pragma_table_info('usage_daily')").all().map(c=>c.name);
assert.deepEqual(cols,['day','dim','key','label','actions','browsers','visits'],'only aggregate columns');
assert.ok(db.raw.prepare('SELECT COUNT(*) AS c FROM usage_daily WHERE key LIKE \'%-%-%-%-%\' AND length(key)=36').get().c===0,'no UUIDs stored');
for(const r of db.raw.prepare('SELECT DISTINCT dim FROM usage_daily').all())assert.ok(HISTORY_DIMENSIONS.includes(r.dim),'known dimension: '+r.dim);

// 3) API: all-time sums every stored day; 30-day view only the last 30.
const api=async days=>{const res=await historyApi(new Request('https://api.marinetools.app/admin/api/analytics-history?days='+days),env,Date.parse('2026-11-28T09:00:00Z'));return res.json()};
const all=await api(0),d30=await api(30);
assert.equal(all.status,'ready');assert.equal(all.coverage.days,89);assert.equal(all.coverage.first,'2026-08-31');assert.equal(all.coverage.last,'2026-11-27');
assert.equal(all.totals.visits,88*10+20,'visits summed over all days (26 Nov counted double)');assert.equal(all.totals.calculations,88*3+6);
assert.equal(d30.coverage.days,30);assert.equal(d30.totals.visits,29*10+20);
assert.equal(all.tools[0].label,'Fuel ROB & endurance');assert.equal(all.tools[0].calculations,88*3+6);
assert.ok(all.features.some(f=>f.event==='feature_used'&&f.feature==='home-example'),'site features listed');
assert.ok(all.features.some(f=>f.event==='reference_page'&&f.feature==='glossary'),'glossary page views listed');
assert.deepEqual(all.context.version.map(v=>v.key),['8.12.0','8.13.0'],'versions listed');assert.ok(all.context.platform.some(p=>p.key==='android-app'),'app platform listed');
assert.equal(all.months.length,4,'Aug–Nov');assert.equal(all.context.campaign[0].key,'shorts','campaigns listed');
const bad=await historyApi(new Request('https://api.marinetools.app/admin/api/analytics-history?days=7'),env,Date.parse('2026-11-28T09:00:00Z')).then(r=>r.json());assert.equal(bad.days,'all','unknown period falls back to all time');

// 3b) Failures are logged (no user data) and reported by the API instead of disappearing.
const dbf=d1(),failing={ANALYTICS_DB:dbf,ANALYTICS_SQL:{query:async()=>{throw new Error('synthetic SQL failure')}}};
const rf=await rollupHistory(failing,Date.parse('2026-11-28T03:00:00Z'));assert.equal(rf.status,'error');assert.equal(rf.stage,'query');
const logged=dbf.raw.prepare('SELECT status, message FROM usage_rollup_log').all();assert.equal(logged[0].status,'query-error');assert.match(logged[0].message,/synthetic SQL failure/);
const fapi=await historyApi(new Request('https://x/admin/api/analytics-history'),failing).then(r=>r.json());assert.equal(fapi.lastRuns[0].status,'query-error','API shows the last rollup outcome');
assert.equal(all.lastRuns[0].status,'ok','successful runs are logged too');

// 4) Not configured: clear status instead of an error.
const nc=await historyApi(new Request('https://x/admin/api/analytics-history'),{}).then(r=>r.json());assert.equal(nc.status,'not-configured');
assert.equal((await rollupHistory({})).status,'not-configured');

// 5) Worker routing: Access required; dashboard contains the panel; cron runs the rollup.
const denied=await worker.fetch(new Request('https://api.marinetools.app/admin/api/analytics-history'),env,{waitUntil(){}});assert.equal(denied.status,401,'Access required');
const ok=await worker.fetch(new Request('https://api.marinetools.app/admin/api/analytics-history',{headers:{'cf-access-jwt-assertion':'test'}}),env,{waitUntil(){}});assert.equal(ok.status,200);assert.equal((await ok.json()).status,'ready');
const {historyPanel,historyScript}=await import('../worker/analytics-history-panel.js');
assert.match(historyPanel(),/id="mtHistory"/);assert.match(historyPanel(),/data-history-days="0" class="active">All time/);assert.match(historyScript(),/\/admin\/api\/analytics-history\?days=/);
const db2=d1(),waits=[];await worker.scheduled({scheduledTime:Date.parse('2026-11-28T03:00:00Z')},{...env,ANALYTICS_DB:db2},{waitUntil:p=>waits.push(p)});await Promise.all(waits);
assert.ok(db2.raw.prepare('SELECT COUNT(*) AS c FROM usage_days').get().c>0,'scheduled run stores days');
console.log(JSON.stringify({status:'PASS',daysRolled:89,dims:HISTORY_DIMENSIONS.length,api:'all/30',access:'guarded',queries:asked.length}));
