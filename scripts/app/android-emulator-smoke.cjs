const {assertAppLayout,assertReachable}=require('../../tests/helpers/app-layout.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict'),{_android:android}=require('playwright');
const {execFileSync}=require('node:child_process');
const expectedBuild=JSON.parse(fs.readFileSync('apps/app-config.json','utf8')).buildNumber;
const watchdog=setTimeout(()=>{fs.writeFileSync('app-artifacts/android/timeout.json',JSON.stringify({status:'FAIL',reason:'Native acceptance exceeded four minutes',physicalDevice:false}));process.exit(1)},240000);
(async()=>{
 fs.mkdirSync('app-artifacts/android',{recursive:true});const passed=[];
 const checkpoint=step=>{passed.push(step);fs.writeFileSync('app-artifacts/android/emulator-progress.json',JSON.stringify({passed,physicalDevice:false},null,2))};
 const [device]=await android.devices();assert.ok(device,'Android emulator connected');device.setDefaultTimeout(60000);
 let page;
 try{
  await device.shell('input keyevent KEYCODE_WAKEUP');await device.shell('wm dismiss-keyguard');
  await device.shell('am start -W -n app.marinetools.preview/.MainActivity');
  let web=await device.webView({pkg:'app.marinetools.preview'});page=await web.page();await page.waitForFunction(()=>!!window.MT_APP_NAV);
  await page.waitForFunction(()=>innerWidth>=300&&innerHeight>=200&&document.visibilityState==='visible',null,{timeout:60000});assert.equal(await page.evaluate(()=>MT_PLATFORM.kind),'android');
  // The button belongs to HTML inside the WebView, not Android's native text
  // selector tree. Wait for a usable WebView, then dispatch real pointer input.
  await page.locator('#mtReleaseDialog[open] #mtReleaseDone').click({timeout:15000});
  await page.waitForFunction(()=>!document.getElementById('mtReleaseDialog')?.open);
  checkpoint('startup HTML dialog dismissed through WebView pointer input');
  if(process.env.MT_ANDROID_UPGRADE_APK){
   await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));
   await page.locator('#airMargin').fill('1.5');await page.locator('#airMargin').dispatchEvent('change');await page.evaluate(()=>MT_APP_DRAFTS.flush());
   await device.shell('input keyevent KEYCODE_HOME');await new Promise(r=>setTimeout(r,2000));
   await device.shell('am force-stop app.marinetools.preview');
   execFileSync('adb',['install','-r',process.env.MT_ANDROID_UPGRADE_APK],{timeout:90000,stdio:'inherit'});
   const packageState=(await device.shell('dumpsys package app.marinetools.preview')).toString();
   assert.match(packageState,new RegExp('versionCode='+expectedBuild+'\\b'));
   await device.shell('am start -W -n app.marinetools.preview/.MainActivity');
   web=await device.webView({pkg:'app.marinetools.preview'});page=await web.page();await page.waitForFunction(()=>!!window.MT_APP_NAV);
   assert.equal(await page.evaluate(()=>MT_APP_CONFIG.buildNumber),expectedBuild);
   await page.waitForFunction(()=>document.getElementById('airMargin')?.value==='1.5');
   await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/2.70 m/);
   checkpoint('build 4 upgraded to build '+expectedBuild+' using the same test key; input preserved without uninstall');
   await page.locator('#airMargin').fill('1');await page.locator('#airMargin').dispatchEvent('change');await page.evaluate(()=>MT_APP_DRAFTS.flush());
  }
  await page.evaluate(()=>{MT_APP_NAV.go('vessel-calcs');window.scrollTo({top:0,behavior:'instant'})});await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/3.20 m/);
  const layouts=[];
  for(const rotation of [0,1,0]){
   await device.shell('settings put system accelerometer_rotation 0');await device.shell('settings put system user_rotation '+rotation);
   await page.waitForFunction(wide=>wide?innerWidth>innerHeight:innerHeight>innerWidth,rotation===1);
   for(const route of ['home','vessel-calcs','settings']){
    await page.evaluate(id=>MT_APP_NAV.go(id),route);
    layouts.push(await assertAppLayout(page,'native rotation '+rotation+'/'+route));
    if(route==='home')await assertReachable(page,'#homeSearchGo','native home search');
    if(route==='vessel-calcs'){await assertReachable(page,'#calcAirDraft','native calculate');await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/3.20 m/)}
   }
   // Real OS keyboard, including landscape: verify the focused field stays reachable.
   await device.shell('settings put secure show_ime_with_hard_keyboard 1');
   await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));
   const beforeKeyboard=await page.evaluate(()=>visualViewport?.height||innerHeight);
   await page.locator('#airMargin').click();
   await page.waitForFunction(before=>(visualViewport?.height||innerHeight)<before-60,beforeKeyboard,{timeout:15000});
   await page.waitForFunction(()=>{const field=document.activeElement;if(field?.id!=='airMargin')return false;const r=field.getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect();return r.top>=h.bottom&&r.bottom<=(visualViewport?.height||innerHeight)},{},{timeout:15000});
   layouts.push(await assertReachable(page,'#airMargin','native keyboard rotation '+rotation));
   await device.screenshot({path:'app-artifacts/android/keyboard-'+(rotation?'landscape':'portrait')+'.png'});
   await device.shell('input keyevent KEYCODE_BACK');
   await page.waitForFunction(before=>(visualViewport?.height||innerHeight)>=before-10,beforeKeyboard,{timeout:15000});
   await page.evaluate(()=>MT_APP_NAV.go('home'));await page.locator('#mobileMenu').click();await page.locator('#sidebar [data-page="electrical"]').click();
   await page.evaluate(()=>MT_APP_NAV.go('home'));await assertAppLayout(page,'native after menu '+rotation);
   await device.screenshot({path:'app-artifacts/android/layout-'+(rotation?'landscape':'portrait')+'.png'});
  }
  fs.writeFileSync('app-artifacts/android/layout-results.json',JSON.stringify({status:'PASS',actualAndroidRotation:true,layouts,physicalDevice:false},null,2));
  checkpoint('portrait/landscape/portrait native rotation, safe bounds and actionable controls');
  await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));
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
  await device.shell('am force-stop app.marinetools.preview');
  await device.shell('cmd connectivity airplane-mode enable');await device.shell('am start -W -n app.marinetools.preview/.MainActivity');
  web=await device.webView({pkg:'app.marinetools.preview'});page=await web.page();await page.waitForFunction(()=>!!window.MT_APP_NAV);
  assert.equal(await page.evaluate(()=>MT_APP_CONFIG.buildNumber),expectedBuild);
  await page.waitForFunction(()=>document.getElementById('airMargin')?.value==='1.5',{},{timeout:10000});assert.equal(await page.locator('#airMargin').inputValue(),'1.5');await page.locator('#calcAirDraft').click();assert.match(await page.locator('#resAirDraft').textContent(),/2.70 m/);
  fs.mkdirSync('app-artifacts/android',{recursive:true});await device.screenshot({path:'app-artifacts/android/native-emulator.png'});
  await page.evaluate(()=>MT_APP_NAV.go('privacy'));await page.locator('#privacy .privacy-policy').waitFor();
  assert.match(await page.locator('#privacy').textContent(),/Website survey links use Tally\. Suggestion links open your email application\./);
  checkpoint('bundled policy remains readable offline after upgrade');
  fs.writeFileSync('app-artifacts/android/emulator-results.json',JSON.stringify({status:'PASS',version:'0.2.0',buildNumber:await page.evaluate(()=>MT_APP_CONFIG.buildNumber),sameDebugKeyUpgrade:!!process.env.MT_ANDROID_UPGRADE_APK,productionSigningTested:false,nativeClipboard:true,fileChooser:true,privateExportContents:true,backNavigation:true,offlineColdReopen:true,offlinePolicy:true,calculation:'2.70 m with restored 1.5 m margin',physicalDevice:false,samsungDevice:false,recipientFileDelivery:'UNVERIFIED'},null,2));
 }catch(e){if(page)try{console.error(JSON.stringify(await page.evaluate(()=>({url:location.href,viewport:[innerWidth,innerHeight,visualViewport?.width,visualViewport?.height],scroll:[scrollX,scrollY,document.scrollingElement?.scrollHeight],bodyClass:document.body.className,dialogOpen:document.getElementById('mtReleaseDialog')?.open,button:document.getElementById('calcAirDraft')?.getBoundingClientRect().toJSON(),draft:localStorage.getItem('mt.app.tool-drafts.v1')}))))}catch{};fs.writeFileSync('app-artifacts/android/failure.json',JSON.stringify({error:e.message,passed},null,2));await device.screenshot({path:'app-artifacts/android/failure.png'}).catch(()=>{});throw e
 }finally{await Promise.race([(async()=>{await device.shell('settings put system user_rotation 0').catch(()=>{});await device.shell('settings put system accelerometer_rotation 1').catch(()=>{});await device.shell('cmd connectivity airplane-mode disable').catch(()=>{});await device.close()})(),new Promise(resolve=>setTimeout(resolve,5000))])}
})().then(()=>{clearTimeout(watchdog);process.exit(0)},e=>{console.error(e);clearTimeout(watchdog);process.exit(1)});
