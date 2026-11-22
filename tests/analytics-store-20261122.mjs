import assert from 'node:assert/strict';
const worker=(await import(process.env.MT_ANALYTICS_WORKER_MODULE||'../worker/worker-v861-app-analytics.js')).default;
const adminHeaders={'cf-access-jwt-assertion':'local-test-fixture','cf-access-authenticated-user-email':'fixture@example.invalid'};
let checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('PASS '+label)}
const endpoint='https://api.marinetools.app/admin/api/store-analytics?range=30d';

const denied=await worker.fetch(new Request(endpoint),{},{});
check(denied.status===401,'store analytics requires Cloudflare Access');

const empty=await worker.fetch(new Request(endpoint,{headers:adminHeaders}),{},{});
const emptyBody=await empty.json();
check(empty.status===200&&emptyBody.providers.googlePlay.status==='not-configured'&&emptyBody.providers.microsoftStore.status==='not-configured','missing provider credentials produce explicit not-configured state');
check(!JSON.stringify(emptyBody).match(/client_secret|private_key|service_account/i),'configuration response exposes no credential values');

const fixture={providers:{
 googlePlay:{status:'ready',totals:{installs:42,uninstalls:3,activeInstalls:35,currentInstalls:38,storeVisitors:120,storeAcquisitions:30,storeConversionRate:.25},countries:[{name:'NO',installs:30}],versions:[{name:'12',installs:42}],storeTraffic:[{name:'Google Play search',visitors:80,acquisitions:24,conversionRate:.3}],crash:{weightedDailyRate:.004},anr:{weightedDailyRate:.002}},
 microsoftStore:{status:'ready',kind:'msix',totals:{acquisitions:18,installs:15,dailyActiveUsers:7,monthlyActiveUsers:12,sessions:44,failures:1},ratings:{average:4.75},markets:[{name:'NO',value:12}],versions:[{name:'0.2.0',value:44}]}
}};
const seeded=await worker.fetch(new Request(endpoint,{headers:adminHeaders}),{STORE_ANALYTICS_FIXTURE:fixture},{});
const seededBody=await seeded.json();
check(seeded.status===200&&seededBody.providers.googlePlay.totals.installs===42&&seededBody.providers.microsoftStore.totals.acquisitions===18,'synthetic provider aggregates pass through protected API');
check(seededBody.range==='30d'&&seededBody.period.start&&seededBody.period.end,'store endpoint follows dashboard range');

const preview=await worker.fetch(new Request('https://feature-check.api.marinetools.app/admin/api/store-analytics?range=30d',{headers:{origin:'https://qa-test.marine-tools-frontend-preview.pages.dev','cf-access-jwt-assertion':'local-test-fixture'}}),{STORE_ANALYTICS_FIXTURE:fixture},{});
check(preview.status===403,'QA preview cannot read store analytics even with an inherited admin header');

const page=await worker.fetch(new Request('https://api.marinetools.app/admin/analytics',{headers:adminHeaders}),{},{});
const html=await page.text();
check(page.status===200&&html.includes('id="mtApps"')&&html.includes('/admin/api/store-analytics'),'private dashboard contains Apps section and protected store endpoint client');
check(!/GOOGLE_PLAY_SERVICE_ACCOUNT_JSON|MICROSOFT_STORE_CLIENT_SECRET/.test(html),'dashboard HTML contains no provider credential names or values');

const release=await worker.fetch(new Request('https://api.marinetools.app/api/release'),{},{});
const releaseBody=await release.json();
check(releaseBody.worker==='worker-v861-app-analytics','release metadata identifies app analytics Worker');

console.log(JSON.stringify({result:'PASS',checks,scope:'Protected app-store endpoint, preview isolation, dashboard injection and synthetic provider data; no real provider accounts.'}));
