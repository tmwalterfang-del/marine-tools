const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
(async()=>{
 let browser;
 for(let i=0;i<60;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222');break}catch{await new Promise(r=>setTimeout(r,500))}}
 if(!browser)throw Error('Native WebView2 debug target unavailable');
 try{
  const context=browser.contexts()[0];let page;
  for(let i=0;i<60;i++){page=context.pages().find(p=>/tauri\.localhost|tauri:/.test(p.url()));if(page)break;await new Promise(r=>setTimeout(r,500))}
  assert.ok(page,'Tauri application page');await page.waitForFunction(()=>!!window.MT_APP_NAV);
  if(await page.locator('#mtReleaseDialog[open]').count())await page.locator('#mtReleaseDone').click();
  await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/3.20 m/);
  assert.equal(await page.evaluate(()=>MT_PLATFORM.kind),'desktop');
  await page.evaluate(()=>MT_PLATFORM.copyText('Marine Tools native clipboard check'));
  const copied=execFileSync('powershell',['-NoProfile','-Command','Get-Clipboard'],{encoding:'utf8'}).trim();assert.equal(copied,'Marine Tools native clipboard check');
  const target=path.join(process.env.RUNNER_TEMP,'marine-tools-native-export.json');
  const saving=page.evaluate(()=>MT_PLATFORM.saveText('marine-tools-native-export.json','{"native":true}','application/json'));
  await new Promise(r=>setTimeout(r,500));
  execFileSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/app/windows-save-dialog.ps1','-Destination',target],{stdio:'inherit',timeout:30000});
  const result=await saving;assert.equal(result.message,'File saved.');assert.equal(fs.readFileSync(target,'utf8'),'{"native":true}');
  fs.mkdirSync('app-artifacts/windows',{recursive:true});await page.screenshot({path:'app-artifacts/windows/native-webview.png',animations:'disabled'});
  fs.writeFileSync('app-artifacts/windows/native-results.json',JSON.stringify({status:'PASS',version:'0.2.0',calculation:'3.20 m',clipboard:'Actual OS clipboard verified',saveAs:'Actual native dialog and selected-path file contents verified',host:'GitHub Windows runner, physical Windows 10/11 unverified'},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
