import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {worker,fixtureBinding,fixtureHtml,fixtureResponse,headers,securityEnv} from './analytics-fixture-20261021.mjs';
const require=createRequire(import.meta.url),{JSDOM,VirtualConsole}=require('jsdom');
let checks=0;function check(condition,label){assert.ok(condition,label);checks++;console.log('PASS '+label)}
const req=(path,auth=true)=>new Request('https://api.marinetools.app'+path,{headers:auth?headers:{}});
const calls=[];const env={...securityEnv,ANALYTICS_SQL:fixtureBinding('normal',calls),ANALYTICS:{writeDataPoint(){throw Error('No analytics writes in dashboard tests')}}};
for(const path of ['/admin/api/analytics','/admin/api/analytics-v2','/admin/analytics'])check((await worker.fetch(req(path,false),env,{})).status===401,'authentication preserved '+path);
check(calls.length===0,'unauthenticated requests perform no queries');
const preview=await worker.fetch(new Request('https://qa.api.marinetools.app/admin/api/analytics',{headers}),env,{});
check(preview.status===403&&calls.length===0,'QA preview cannot access production analytics');
const response=await worker.fetch(req('/admin/api/analytics?range=90d'),env,{}),data=await response.json();
check(response.status===200&&data.current.sessions===10&&data.topTools[0].uses===15&&data.search.used===3,'canonical endpoint provides complete dashboard schema');
check(calls.length===21,'one shared dashboard request uses twenty-one bounded SQL queries including audience metrics');
check(calls.every(x=>x.params.end===data.period.end||x.params.end===data.period.start),'all panels use the same period boundaries');
check(data.technicalHealth.requests===2&&data.runtimeSmoke.error===1&&data.productActions.totals.calculation_completed===7,'technical, scheduled and product sections preserved');
const missing=await worker.fetch(req('/admin/api/analytics'),securityEnv,{});
check(missing.status===503&&(await missing.json()).code==='ANALYTICS_NOT_CONFIGURED','missing binding produces actionable failure status');
const failure=await fixtureResponse('failure'),fb=await failure.json();check(failure.status===503&&fb.code==='ANALYTICS_QUERY_FAILED'&&!JSON.stringify(fb).includes('PRIVATE'),'query failures remain failures without leaking SQL diagnostics');
const partial=await(await fixtureResponse('partial')).json();check(partial.current.sessions===10&&typeof partial.technicalHealth.error==='string'&&partial.productActions.error,'optional failures retain useful usage data with explicit errors');
const started=Date.now(),hung=await fixtureResponse('hang');check(hung.status===503&&(await hung.json()).code==='ANALYTICS_TIMEOUT'&&Date.now()-started<8500,'hung queries time out within the request budget');
let retried=false;const retryBinding=fixtureBinding();let attempts=0;
const retry=await worker.fetch(req('/admin/api/analytics'),{...securityEnv,ANALYTICS_SQL:{async query(input){if(input.query.includes('AS views')){attempts++;if(!retried){retried=true;throw Object.assign(new Error('Transient'),{retryable:true})}}return retryBinding.query(input)}}},{});
check(retry.ok&&attempts===2,'retryable binding failure is retried once');

let mode='normal',fetches=0,delayOld=null,releaseOld,dom;
const pageErrors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>pageErrors.push(e.message));
dom=new JSDOM(await fixtureHtml(),{url:'https://dashboard.example.invalid/admin/analytics',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.Response=Response;w.AbortController=AbortController;
 const timeout=w.setTimeout.bind(w);w.setTimeout=(fn,ms,...args)=>timeout(fn,ms===12000?100:ms,...args); // Accelerate only the transport deadline.
 w.fetch=async url=>{fetches++;const range=new URL(url,w.location.href).searchParams.get('range');if(delayOld===range){delayOld=null;await new Promise(resolve=>{releaseOld=resolve})}if(mode==='client-hang')return new Promise(()=>{});if(mode==='html')return new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}});if(mode==='denied')return new Response('{}',{status:401,headers:{'content-type':'application/json'}});if(mode==='unconfigured')return new Response(JSON.stringify({error:'Unavailable',code:'ANALYTICS_NOT_CONFIGURED'}),{status:503,headers:{'content-type':'application/json'}});return fixtureResponse(mode,range)};
}});
const w=dom.window,d=w.document;
check(typeof w.MT_DASHBOARD_REQUEST==='function','deployable Worker initializes the browser transport without server-only helpers');
async function wait(test,label){for(let i=0;i<150;i++){if(test())return;await new Promise(r=>setTimeout(r,20))}throw Error('Timeout: '+label)}
const text=id=>d.getElementById(id).textContent;
async function loaded(){await wait(()=>!text('mtAnalyticsLoadState').startsWith('Loading'),'dashboard status');await new Promise(r=>setTimeout(r,180))}
await loaded();
check(fetches===1&&text('sessions')==='10'&&text('v860Calc')==='7','all four renderers share one request and render their own data');
check(d.body.textContent.includes('Calculation clicks')&&text('v860Offline')==='—','clicks are labelled honestly and unmeasured offline usage is not zero');
check(text('mtRuntimeSmokeBody').includes('ERROR')&&!text('mtAnalyticsLoadState').includes('Unavailable'),'failed scheduled checks are observations, not query failures');
check(text('searches')==='3'&&!pageErrors.length,'search panel renders without schema exceptions');
for(const next of ['7d','30d','90d']){d.querySelector('[data-range="'+next+'"]').click();await loaded();check(text('periodLabel').includes(next==='7d'?'7':next==='30d'?'30':'90'),'range '+next+' loads');}
check(fetches===4,'one HTTP request for each selected range');
mode='unconfigured';d.getElementById('refresh').click();await loaded();check(text('mtAnalyticsLoadState').includes('not configured')&&text('sessions')==='—'&&text('v860Calc')==='—'&&text('mtTechState')==='Unavailable'&&!d.querySelector('#chart svg'),'failed refresh clears prior values and chart, with a useful configuration message');
check(text('mtTechLatestError')==='Last error unavailable'&&text('updated').startsWith('Last successful load '),'failed refresh does not label historical timestamps as current observations');
for(const kind of ['html','denied']){mode=kind;d.getElementById('refresh').click();await loaded();check(/sign.in|session has expired/i.test(text('mtAnalyticsLoadState'))&&text('sessions')==='—','Access response handled without JSON parse errors/'+kind);}
mode='client-hang';d.getElementById('refresh').click();await loaded();check(text('mtAnalyticsLoadState').includes('too long')&&text('sessions')==='—'&&!d.getElementById('refresh').disabled,'a hung HTTP request times out and restores the retry button');
mode='partial';d.getElementById('refresh').click();await loaded();check(text('sessions')==='10'&&text('v860Calc')==='—'&&text('mtTechSuccess')==='—'&&text('mtTechState')==='Unavailable'&&text('mtAnalyticsLoadState').includes('Unavailable'),'optional failures never display successful zero metrics');
mode='empty';d.getElementById('refresh').click();await loaded();check(text('sessions')==='0'&&text('v860Returning')==='—'&&text('mtTechSuccess')==='—'&&text('mtAnalyticsLoadState').includes('Analytics loaded'),'valid empty data is distinct from failure or measured success');
mode='normal';delayOld='7d';d.querySelector('[data-range="7d"]').click();await wait(()=>!!releaseOld,'old request starts');d.querySelector('[data-range="30d"]').click();await loaded();releaseOld();await new Promise(r=>setTimeout(r,250));check(text('periodLabel').includes('30')&&w.__mtAnalyticsDashboardData.range==='30d'&&text('mtAnalyticsLoadState').includes('30d'),'late response cannot overwrite a newly selected period');
check(pageErrors.length===0,'no dashboard script exceptions');
w.close();console.log(JSON.stringify({result:'PASS',checks,scope:'Real Worker chain and DOM with synthetic SQL fixtures; no live Cloudflare data or writes.'}));
