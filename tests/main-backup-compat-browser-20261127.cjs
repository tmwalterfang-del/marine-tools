/* Backups move both ways without reshaping stored data: an app backup (Settings → Download backup) is accepted by
 * Workspace → Data & backup, and a workspace backup is accepted by the app (app records only). Real browser checks. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.resolve(__dirname,'..'),engine=process.argv[2]||'chromium';
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root)return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return res.writeHead(404).end();res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
const APP_KEYS=['mt.profile','mt.favorites','mt.bunkHistory','mt.settings'];
const snap=(page,keys)=>page.evaluate(k=>Object.fromEntries(k.map(x=>[x,localStorage.getItem(x)])),keys);
let browser;const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mt-backup-'));
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch();const ctx=await browser.newContext({acceptDownloads:true});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 // seed app data, then download the app backup through the real Settings button
 await page.goto(base+'/');await page.waitForTimeout(600);
 await page.evaluate(()=>{localStorage.setItem('mt.profile',JSON.stringify({name:'MV Demo',loa:150,draft:8.2,serviceSpeed:12.5,fuelDay:14.5}));localStorage.setItem('mt.favorites',JSON.stringify(['Fuel ROB & endurance']));localStorage.setItem('mt.bunkHistory',JSON.stringify([{date:'2026-12-14',grade:'VLSFO',volume:292.7,density:991,ref:'BDN-0412'}]));localStorage.setItem('mt.settings',JSON.stringify({theme:'dark'}))});
 const original=await snap(page,APP_KEYS);
 await page.goto(base+'/?page=settings');await page.waitForTimeout(900);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const [dl]=await Promise.all([page.waitForEvent('download'),page.click('#exportData')]);const appFile=path.join(tmp,'app-backup.json');await dl.saveAs(appFile);
 const appBackup=JSON.parse(fs.readFileSync(appFile,'utf8'));assert.equal(appBackup.format,'Marine Tools local backup','app export format unchanged');
 // what the app's own restore writes for these records (the export may add default settings)
 const expected={'mt.profile':JSON.stringify(appBackup.profile),'mt.favorites':JSON.stringify(appBackup.favorites),'mt.bunkHistory':JSON.stringify(appBackup.bunkering),'mt.settings':JSON.stringify(appBackup.settings)};
 assert.equal(JSON.parse(expected['mt.profile']).name,'MV Demo','seeded profile exported');
 // workspace: converter keeps the exact stored strings; the Data & backup preview accepts the file and says it was converted
 await page.goto(base+'/workspace.html');await page.waitForTimeout(1500);
 const converted=await page.evaluate(b=>{const w=window.MT_WORKSPACE,c=w.validateBackup(w.fromAppBackup(b));return c.entries},appBackup);
 for(const k of APP_KEYS)assert.equal(converted[k],expected[k],'converted record identical: '+k);
 await page.evaluate(()=>localStorage.clear());
 await page.evaluate(b=>window.MT_WORKSPACE.restore(localStorage,window.MT_WORKSPACE.fromAppBackup(b)),appBackup);
 assert.deepEqual(await snap(page,APP_KEYS),expected,'workspace restore of an app backup reproduces the app data');
 await page.goto(base+'/workspace.html#data');await page.waitForTimeout(1500);const hasUi=await page.evaluate(()=>!!document.getElementById('backup-file'));assert.ok(hasUi,'workspace Data & backup view has the file picker');
 if(hasUi){await page.setInputFiles('#backup-file',appFile);await page.waitForTimeout(700);assert.match(await page.textContent('#backup-preview'),/app backup recognised/i,'preview explains the conversion');}
 // app: a workspace backup restores the app records only
 const wsBackup={schema:'marine-tools-backup',version:1,created:new Date().toISOString(),entries:{...converted,'mt-student-progress-test':JSON.stringify({x:1})}};
 const wsFile=path.join(tmp,'ws-backup.json');fs.writeFileSync(wsFile,JSON.stringify(wsBackup));
 await page.goto(base+'/');await page.evaluate(()=>localStorage.clear());await page.goto(base+'/?page=settings');await page.waitForTimeout(900);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await Promise.all([page.waitForEvent('load',{timeout:8000}).catch(()=>null),page.setInputFiles('#importDataFile',wsFile)]);await page.waitForTimeout(1500);
 assert.deepEqual(await snap(page,APP_KEYS),expected,'app restore of a workspace backup reproduces the app data');
 assert.equal(await page.evaluate(()=>localStorage.getItem('mt-student-progress-test')),null,'Education/workspace records are not written by the app');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`backup compatibility (${engine}): app→workspace and workspace→app round trips identical${hasUi?', preview note shown':''}`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close();fs.rmSync(tmp,{recursive:true,force:true})});
