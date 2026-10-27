const fs=require('node:fs'),assert=require('node:assert/strict'),{_android:android}=require('playwright');
(async()=>{
 fs.mkdirSync('app-artifacts/android',{recursive:true});const passed=[];
 const checkpoint=step=>{passed.push(step);fs.writeFileSync('app-artifacts/android/emulator-progress.json',JSON.stringify({passed,physicalDevice:false},null,2))};
 const [device]=await android.devices();assert.ok(device,'Android emulator connected');device.setDefaultTimeout(60000);
 try{
  await device.shell('am start -W -n app.marinetools.preview/.MainActivity');
  let web=await device.webView({pkg:'app.marinetools.preview'}),page=await web.page();await page.waitForFunction(()=>!!window.MT_APP_NAV);
  await page.evaluate(()=>document.getElementById('mtReleaseDialog')?.close());assert.equal(await page.evaluate(()=>MT_PLATFORM.kind),'android');
  await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/3.20 m/);
  await page.evaluate(()=>MT_PLATFORM.copyText('Marine Tools Android clipboard check'));
  const clipboard=await page.evaluate(()=>Capacitor.Plugins.Clipboard.read());assert.equal(clipboard.value,'Marine Tools Android clipboard check');checkpoint('native UI, 3.20 m calculation and real clipboard');
  await page.evaluate(()=>{window.__nativeShare=MT_PLATFORM.saveText('android-smoke.json','{"native":true}','application/json').catch(e=>({error:e.message}));});
  let chooser=false;for(let i=0;i<30;i++){const state=(await device.shell('dumpsys activity activities')).toString();if(/ChooserActivity|ResolverActivity/.test(state)){chooser=true;break}await new Promise(r=>setTimeout(r,500))}
  assert.ok(chooser,'Native file share chooser presented');await device.shell('input keyevent KEYCODE_BACK');
  const exported=await page.evaluate(async()=>{const r=await Capacitor.Plugins.Filesystem.readdir({path:'marine-exports',directory:'CACHE'}),f=r.files.find(f=>f.name.endsWith('-android-smoke.json'));return Capacitor.Plugins.Filesystem.readFile({path:'marine-exports/'+f.name,directory:'CACHE',encoding:'utf8'})});assert.equal(exported.data,'{"native":true}');checkpoint('share chooser and actual private export contents');
  await page.evaluate(()=>MT_APP_NAV.go('electrical'));await device.shell('input keyevent KEYCODE_BACK');await page.waitForFunction(()=>MT_APP_NAV.current==='vessel-calcs');checkpoint('Android system back navigation');
  await page.locator('#airMargin').fill('1.5');await page.locator('#airMargin').dispatchEvent('change');await page.evaluate(()=>MT_APP_DRAFTS.flush());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mt.app.tool-drafts.v1')).fields.airMargin.value),'1.5');checkpoint('raw draft stored before backgrounding');
  // Normal backgrounding gives WebView storage its lifecycle flush before a
  // cold process restart. Abrupt kill during a storage write remains unverified.
  await device.shell('input keyevent KEYCODE_HOME');await new Promise(r=>setTimeout(r,2000));
  await device.shell('am force-stop app.marinetools.preview');await device.shell('cmd connectivity airplane-mode enable');await device.shell('am start -W -n app.marinetools.preview/.MainActivity');
  web=await device.webView({pkg:'app.marinetools.preview'});page=await web.page();await page.waitForFunction(()=>!!window.MT_APP_NAV);
  await page.waitForFunction(()=>document.getElementById('airMargin')?.value==='1.5',{},{timeout:10000});assert.equal(await page.locator('#airMargin').inputValue(),'1.5');await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/2.70 m/);
  fs.mkdirSync('app-artifacts/android',{recursive:true});await device.screenshot({path:'app-artifacts/android/native-emulator.png'});
  fs.writeFileSync('app-artifacts/android/emulator-results.json',JSON.stringify({status:'PASS',version:'0.2.0',nativeClipboard:true,fileChooser:true,privateExportContents:true,backNavigation:true,offlineColdReopen:true,calculation:'2.70 m with restored 1.5 m margin',physicalDevice:false,samsungDevice:false,recipientFileDelivery:'UNVERIFIED'},null,2));
 }catch(e){fs.writeFileSync('app-artifacts/android/failure.json',JSON.stringify({error:e.message,passed},null,2));await device.screenshot({path:'app-artifacts/android/failure.png'}).catch(()=>{});throw e
 }finally{await device.shell('cmd connectivity airplane-mode disable').catch(()=>{});await device.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
