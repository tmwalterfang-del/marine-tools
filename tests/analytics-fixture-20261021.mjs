// Synthetic data only. No network calls, account credentials or analytics writes.
// CI sets this to the exact wrangler dry-run bundle that is deployed.
export const worker=(await import(process.env.MT_ANALYTICS_WORKER_MODULE||'../worker/worker-v861-app-analytics.js')).default;
export const headers={'cf-access-jwt-assertion':'local-test-fixture','cf-access-authenticated-user-email':'fixture@example.invalid'};
export function fixtureBinding(mode='normal',calls=[]){return{async query(input){
 calls.push(input);const q=input.query;
 if(mode==='hang')return new Promise(()=>{});
 if(mode==='failure')throw new Error('PRIVATE SQL DIAGNOSTIC');
 if(mode==='partial'&&/LIMIT (5000|2000|800)/.test(q))throw new Error('Synthetic optional query failure');
 if(mode==='empty')return{data:[]};
 let data=[];
 if(q.includes("blob10='usage-v1'")){if(!q.includes('GROUP BY'))data=[{browsers:8,visits:10}];else if(q.includes('AS source'))data=[{source:'linkedin',referrer:'linkedin.com',utm_source:'linkedin',utm_medium:'social',utm_campaign:'launch-2026',landing_page:'/',device:'mobile',os:'android',browser:'chrome',platform:'web',country:'NO',browsers:4,visits:6}];else if(q.includes("blob1='tool_feedback'"))data=[{label:'Three-phase power · helpful',actions:5,browsers:4},{label:'Three-phase power · not_helpful',actions:2,browsers:2},{label:'Three-phase power · reason:wrong-result',actions:2,browsers:2},{label:'Three-phase power · reason:<script>',actions:9,browsers:1},{label:'Tank transfer · not_helpful',actions:1,browsers:1},{label:'no separator',actions:4,browsers:1}];else if(q.includes('AS bucket'))data=[{bucket:input.params.start,browsers:4,visits:6}];else if(q.includes('AS tool'))data=[{usage_event:'tool_opened',page:'electrical',tool:'calc3p',label:'Three-phase power',actions:10,browsers:5},{usage_event:'calculation_succeeded',page:'electrical',tool:'calc3p',label:'Three-phase power',actions:7,browsers:3},{usage_event:'calculation_invalid',page:'electrical',tool:'calc3p',actions:2,browsers:1},{usage_event:'education_module',page:'education',tool:'trim',actions:6,browsers:2}];else data=[{usage_event:'visit_started',browsers:8,visits:10},{usage_event:'return_visit',browsers:3,visits:4},{usage_event:'active_usage',browsers:5},{usage_event:'calculation_succeeded',actions:7}];}
 else if(q.includes('SUM(double2) AS duration'))data=[{event_name:'session_start',event_count:10},{event_name:'page_view',event_count:30},{event_name:'tool_use',event_count:15},{event_name:'engagement',duration:600},{event_name:'version_seen',event_count:10},{event_name:'session_tool_active',event_count:6}];
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

export function storeFixture(){
 return {providers:{
  googlePlay:{status:'ready',package:'app.marinetools',freshness:'2026-11-20',totals:{installs:42,uninstalls:3,activeInstalls:35,currentInstalls:38,storeVisitors:120,storeAcquisitions:30,storeConversionRate:0.25},countries:[{name:'NO',installs:30,uninstalls:2,activeInstalls:26}],versions:[{name:'12',installs:42,uninstalls:3,activeInstalls:35}],storeTraffic:[{name:'Google Play search',visitors:80,acquisitions:24,conversionRate:0.3}],crash:{weightedDailyRate:0.004},anr:{weightedDailyRate:0.002},warnings:[],source:'fixture'},
  microsoftStore:{status:'ready',kind:'msix',appId:'fixture-store-id',totals:{acquisitions:18,installs:15,dailyActiveUsers:7,monthlyActiveUsers:12,sessions:44,failures:1},ratings:{count:4,average:4.75,stars:{one:0,two:0,three:0,four:1,five:3}},markets:[{name:'NO',value:12}],versions:[{name:'0.2.0',value:44}],source:'fixture'}
 }};
}
export async function storeFixtureResponse(range='24h'){
 return worker.fetch(new Request('https://api.marinetools.app/admin/api/store-analytics?range='+range,{headers}),{STORE_ANALYTICS_FIXTURE:storeFixture()},{});
}
