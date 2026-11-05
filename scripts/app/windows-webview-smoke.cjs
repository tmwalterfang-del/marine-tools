const {assertAppLayout,assertReachable}=require('../../tests/helpers/app-layout.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
(async()=>{
 let browser,lastError;
 for(let i=0;i<60;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222');break}catch(e){lastError=String(e);await new Promise(r=>setTimeout(r,500))}}
 if(!browser)throw Error('Native WebView2 debug target unavailable: '+lastError);
 try{
  const context=browser.contexts()[0];let page;
  for(let i=0;i<60;i++){page=context.pages().find(p=>/tauri\.localhost|tauri:/.test(p.url()));if(page)break;await new Promise(r=>setTimeout(r,500))}
  assert.ok(page,'Tauri application page');await page.waitForFunction(()=>!!window.MT_APP_NAV);
  // The first-run dialog opens asynchronously after the app shell. Await its
  // real user action before interacting with content behind the modal.
  await page.locator('#mtReleaseDialog[open] #mtReleaseDone').click();
  await page.locator('#mtReleaseDialog[open]').waitFor({state:'hidden'});
  const layouts=[];
  for(const [width,height] of [[640,480],[900,600],[1280,800]]){
   execFileSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/app/windows-window-bounds.ps1','-Width',String(width),'-Height',String(height)],{stdio:'inherit',timeout:30000});
   for(const route of ['home','vessel-calcs','settings']){
    await page.evaluate(id=>MT_APP_NAV.go(id),route);
    layouts.push(await assertAppLayout(page,`native Windows ${width}x${height}/${route}`));
    if(route==='vessel-calcs')await assertReachable(page,'#calcAirDraft','native resized calculation button');
   }
   await page.screenshot({path:`app-artifacts/windows/layout-${width}x${height}.png`,animations:'disabled'});
  }
  fs.writeFileSync('app-artifacts/windows/layout-results.json',JSON.stringify({status:'PASS',actualNativeWindowResize:true,layouts,physicalDpiChanges:'UNVERIFIED'},null,2));
  await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/3.20 m/);
  assert.equal(await page.evaluate(()=>MT_PLATFORM.kind),'desktop');console.log('MT_WIN_CALC_OK');
  await page.evaluate(()=>MT_PLATFORM.copyText('Marine Tools native clipboard check'));
  const copied=execFileSync('powershell',['-NoProfile','-Command','Get-Clipboard'],{encoding:'utf8'}).trim();assert.equal(copied,'Marine Tools native clipboard check');console.log('MT_WIN_CLIPBOARD_OK');
  const target=path.join(process.env.RUNNER_TEMP,'marine-tools-native-export.json');
  const saving=page.evaluate(()=>MT_PLATFORM.saveText('marine-tools-native-export.json','{"native":true}','application/json')).then(value=>({value}),error=>({error:error.message}));
  await new Promise(r=>setTimeout(r,500));
  execFileSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/app/windows-save-dialog.ps1','-Destination',target],{stdio:'inherit',timeout:30000});
  const outcome=await saving;assert.ifError(outcome.error);const result=outcome.value;console.log('MT_WIN_SAVE_DIALOG_OK');assert.equal(result.message,'File saved.');assert.equal(fs.readFileSync(target,'utf8'),'{"native":true}');
  fs.mkdirSync('app-artifacts/windows',{recursive:true});await page.screenshot({path:'app-artifacts/windows/native-webview.png',animations:'disabled'});
  fs.writeFileSync('app-artifacts/windows/native-results.json',JSON.stringify({status:'PASS',version:'0.2.0',calculation:'3.20 m',clipboard:'Actual OS clipboard verified',saveAs:'Actual native dialog and selected-path file contents verified',host:'GitHub Windows runner, physical Windows 10/11 unverified'},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
