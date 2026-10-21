// Actual rendering engines, synthetic SQL fixtures, all external traffic blocked.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',out=path.resolve('qa-education-'+engine,'analytics');fs.mkdirSync(out,{recursive:true});
let browser,mode='normal',requests=0,hold=false,releaseOld;const errors=[],checks=[];
function check(ok,label){checks.push({ok:!!ok,label});assert.ok(ok,label)}
(async()=>{
 const {fixtureHtml,fixtureResponse}=await import('./analytics-fixture-20261021.mjs'),html=await fixtureHtml();
 browser=await pw[engine].launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.origin!=='https://dashboard.example.invalid')return route.abort();
  if(u.pathname==='/admin/analytics')return route.fulfill({status:200,contentType:'text/html',body:html});
  if(u.pathname!=='/admin/api/analytics')return route.fulfill({status:404,body:''});
  requests++;const kind=mode,range=u.searchParams.get('range');if(hold&&range==='7d'){hold=false;await new Promise(resolve=>{releaseOld=resolve})}
  if(kind==='network')return route.abort();
  if(kind==='html')return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Cloudflare Access sign in</title>'});
  if(kind==='denied')return route.fulfill({status:401,contentType:'application/json',body:'{}'});
  const r=await fixtureResponse(kind,range),body=await r.text();try{await route.fulfill({status:r.status,contentType:'application/json',body})}catch(e){
   // Changing the range deliberately aborts the held 7d request.
   if(range!=='7d'||!releaseOld)throw e;
  }
 });
 const text=id=>page.locator('#'+id).textContent();
 async function loaded(){await page.waitForFunction(()=>!document.getElementById('mtAnalyticsLoadState').textContent.startsWith('Loading'));await page.waitForTimeout(200)}
 await page.goto('https://dashboard.example.invalid/admin/analytics');await loaded();
 check(requests===1&&(await text('sessions'))==='10'&&(await text('v860Calc'))==='7','one request fills all panel renderers');
 check((await text('v860Offline'))==='—'&&(await page.locator('#mtV860Product').textContent()).includes('Calculation clicks'),'honest click and offline labels');
 check((await text('searches'))==='3'&&(await text('mtRuntimeSmokeBody')).includes('ERROR'),'complete search schema and actual scheduled failure are rendered');
 await page.screenshot({path:path.join(out,'dashboard-desktop.png'),fullPage:true});
 for(const [width,height]of [[390,844],[844,390],[1440,900]]){await page.setViewportSize({width,height});await page.waitForTimeout(180);check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),'dashboard fits '+width+'x'+height);if(width===390)await page.screenshot({path:path.join(out,'dashboard-mobile.png'),fullPage:true})}
 for(const range of ['7d','30d','90d']){await page.locator('[data-range="'+range+'"]').click();await loaded();check((await text('mtAnalyticsLoadState')).includes(range),'range '+range+' loads')}
 check(requests===4,'one request per range selection');
 mode='failure';await page.locator('#refresh').click();await loaded();check((await text('sessions'))==='—'&&(await text('v860Calc'))==='—'&&(await text('mtTechState'))==='Unavailable'&&await page.locator('#chart svg').count()===0,'full failure clears stale metrics and plot');
 check((await text('mtTechLatestError'))==='Last error unavailable'&&(await text('updated')).startsWith('Last successful load '),'historical timestamps are not presented as current after failure');
 await page.screenshot({path:path.join(out,'dashboard-failure.png'),fullPage:true});
 for(const kind of ['html','denied','network']){mode=kind;await page.locator('#refresh').click();await loaded();check((await text('mtAnalyticsLoadState')).match(/sign.in|expired|connect/i)&&(await text('sessions'))==='—','friendly '+kind+' error')}
 mode='partial';await page.locator('#refresh').click();await loaded();check((await text('sessions'))==='10'&&(await text('v860Calc'))==='—'&&(await text('mtTechSuccess'))==='—'&&(await text('mtAnalyticsLoadState')).includes('Unavailable'),'optional errors retain usage and never claim zero success');
 mode='empty';await page.locator('#refresh').click();await loaded();check((await text('sessions'))==='0'&&(await text('mtTechSuccess'))==='—'&&(await text('v860Returning'))==='—','empty results distinguished from failed query');
 mode='normal';hold=true;await page.locator('[data-range="7d"]').click();while(!releaseOld)await page.waitForTimeout(20);await page.locator('[data-range="30d"]').click();await loaded();releaseOld();await page.waitForTimeout(250);check((await text('periodLabel')).includes('30')&&await page.evaluate(()=>window.__mtAnalyticsDashboardData.range==='30d'),'late old range does not overwrite current period');
 check(errors.length===0,'no page exceptions');
})().catch(e=>errors.push(e.stack||String(e))).finally(async()=>{if(browser)await browser.close();const summary={engine,tests:checks.length,failures:checks.filter(x=>!x.ok).length,errors,scope:'Synthetic Worker SQL fixtures; no live account access or analytics writes.',checks};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));if(summary.failures||errors.length)process.exitCode=1});
