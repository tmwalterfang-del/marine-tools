/* Public-host launch behavior against exact checkout assets; no live requests. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',root=path.resolve(__dirname,'..');
let browser;
(async()=>{
 browser=await pw[engine].launch(engine==='chromium'&&process.env.STUDENTS_BROWSER_EXECUTABLE?{executablePath:process.env.STUDENTS_BROWSER_EXECUTABLE}:{});
 const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:1366,height:900}}),requests=[],errors=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());requests.push(u.href);if(!['www.marinetools.app','marine-tools-education-next.fondbook66.chatgpt.site'].includes(u.hostname))return r.abort();let file=path.resolve(root,'.'+u.pathname);if(!file.startsWith(root+path.sep)&&file!==root)return r.fulfill({status:403,body:''});if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))return r.fulfill({status:404,body:''});return r.fulfill({status:200,contentType:({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('release-fixture')){localStorage.setItem('release-fixture','1');localStorage.setItem('mt.lastSeenReleaseBuild','20261019-v8-7-0');localStorage.setItem('mt.profile',JSON.stringify({name:'Retained release fixture'}));localStorage.setItem('mt.settings',JSON.stringify({usageAnalytics:false}));}});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto('https://www.marinetools.app/');await p.locator('#mtReleaseDialog[open]').waitFor();
 assert.match(await p.locator('#mtReleaseSubtitle').textContent(),/v8\.8\.0 · 2026-11-01/);
 assert.match(await p.locator('.mt-release-current').textContent(),/45 interactive modules, 60 calculators and 292 practice questions/);
 await p.evaluate(()=>MT_I18N.set('nb'));assert.match(await p.locator('.mt-release-current').textContent(),/Utdanning og arbeidsområdet ditt/);
 await p.locator('#mtReleaseDone').click();await p.reload();await p.waitForTimeout(800);assert.equal(await p.locator('#mtReleaseDialog[open]').count(),0);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('mt.profile')).name),'Retained release fixture');
 assert.equal(await p.locator('a[href*="play.google.com"],a[href*="downloads.html"]').count(),0);
 await p.goto('https://www.marinetools.app/workspace.html#learn');await p.locator('#workspace-view[aria-busy=false]').waitFor();
 assert.equal(await p.evaluate(()=>MT_WORKSPACE_APP.capabilities.accountServices),false);assert.equal(await p.locator('[data-section=account]:visible').count(),0);
 for(const view of ['account','classes','teach']){await p.evaluate(view=>location.hash=view,view);await p.waitForFunction(view=>document.getElementById('workspace-view')?.dataset.view===view,view);assert.equal(await p.locator('#sync-enable,#class-create,#class-join,a[href^="#classes"],a[href^="#account"]').count(),0);assert.equal(await p.locator('#workspace-error:visible').count(),0);}
 assert.equal(requests.filter(url=>new URL(url).pathname.startsWith('/api/workspace')).length,0,'Public local workspace must not call unavailable account services');
 await p.goto('https://www.marinetools.app/students/');assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'index,follow');assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://www.marinetools.app/students/');
 await p.goto('https://marine-tools-education-next.fondbook66.chatgpt.site/workspace.html#account');await p.locator('#sync-enable').waitFor();assert.equal(await p.evaluate(()=>MT_WORKSPACE_APP.capabilities.accountServices),true);assert.equal(await p.locator('[data-section=account]').isVisible(),true);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',engine,scope:'8.8 release notice EN/NB, update persistence, retained data, public local workspace and protected account capability'}));await ctx.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
