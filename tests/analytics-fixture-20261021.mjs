// Synthetic data only. No network calls, account credentials or analytics writes.
// CI sets this to the exact wrangler dry-run bundle that is deployed.
export const worker=(await import(process.env.MT_ANALYTICS_WORKER_MODULE||'../worker/worker-v860-dashboard.js')).default;
export const headers={'cf-access-jwt-assertion':'local-test-fixture','cf-access-authenticated-user-email':'fixture@example.invalid'};
export function fixtureBinding(mode='normal',calls=[]){return{async query(input){
 calls.push(input);const q=input.query;
 if(mode==='hang')return new Promise(()=>{});
 if(mode==='failure')throw new Error('PRIVATE SQL DIAGNOSTIC');
 if(mode==='partial'&&/LIMIT (5000|2000|800)/.test(q))throw new Error('Synthetic optional query failure');
 if(mode==='empty')return{data:[]};
 let data=[];
 if(q.includes('SUM(double2) AS duration'))data=[{event_name:'session_start',event_count:10},{event_name:'page_view',event_count:30},{event_name:'tool_use',event_count:15},{event_name:'engagement',duration:600},{event_name:'version_seen',event_count:10},{event_name:'session_tool_active',event_count:6}];
 else if(q.includes('AS views'))data=[{page:'navigation',views:30}];
 else if(q.includes('AS uses'))data=[{page:'navigation',tool:'Synthetic trim',uses:15}];
 else if(q.includes('AS seconds'))data=[{page:'navigation',seconds:600}];
 else if(q.includes('AS device'))data=[{device:'desktop',sessions:10}];
 else if(q.includes('AS version'))data=[{version:'fixture',sessions:10}];
 else if(q.includes('AVG(double2)'))data=[{event_name:'search_used',page:'home',tool:'global',event_count:3},{event_name:'search_result',page:'home',tool:'global:no-result',event_count:1},{event_name:'live_request_ok',page:'weather',tool:'weather',event_count:2,avg_duration:.2}];
 else if(q.includes('AS bucket'))data=[{bucket:input.params.start,event_name:'session_start',event_count:10}];
 else if(q.includes('AS hour'))data=[{hour:12,sessions:10}];
 else if(q.includes('LIMIT 5000'))data=[{event_name:'live_request_ok',tool:'weather',duration:.2,timestamp:input.params.start},{event_name:'live_request_error',tool:'weather',duration:.4,timestamp:input.params.start}];
 else if(q.includes('LIMIT 2000'))data=[{event_name:'runtime_smoke_error',tool:'fixture-failed-check',error:'HTTP 503',duration:.3,timestamp:input.params.start}];
 else if(q.includes('LIMIT 800'))data=[{event_name:'calculation_completed',page:'navigation',tool:'Synthetic trim',event_count:7},{event_name:'visitor_type',tool:'first',event_count:1},{event_name:'visitor_type',tool:'returning',event_count:1}];
 return{data};
}}}
export async function fixtureHtml(){const r=await worker.fetch(new Request('https://api.marinetools.app/admin/analytics',{headers}),{},{});return(await r.text()).replace('<div class="shell">','<div class="shell"><div class="banner"><b>TEST FIXTURE — synthetic data, not live analytics.</b></div>')}
export async function fixtureResponse(mode='normal',range='24h'){
 return worker.fetch(new Request('https://api.marinetools.app/admin/api/analytics?range='+range,{headers}),{ANALYTICS_SQL:fixtureBinding(mode)},{});
}
