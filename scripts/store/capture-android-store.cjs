/* Capture unaltered build-9 Android UI at Play listing sizes. */
const fs=require('node:fs'),assert=require('node:assert/strict'),{_android:android}=require('playwright');
const out='store-captures',pkg='com.marinetools.app';fs.mkdirSync(out,{recursive:true});
const profiles=[{name:'phone',width:1080,height:1920,density:420},{name:'tablet-7',width:1080,height:1920,density:315},{name:'tablet-10',width:2160,height:3840,density:440}];
const watchdog=setTimeout(()=>{console.error('Store capture timed out');process.exit(1)},240000);
(async()=>{
 const [device]=await android.devices();assert.ok(device);device.setDefaultTimeout(45000);
 const captures=[];let page;
 try{
  await device.shell('settings put system accelerometer_rotation 0');await device.shell('settings put system user_rotation 0');
  for(const profile of profiles){
   await device.shell('wm size '+profile.width+'x'+profile.height);await device.shell('wm density '+profile.density);
   await device.shell('am force-stop '+pkg);await device.shell('am start -W -n '+pkg+'/.MainActivity');
   const web=await device.webView({pkg});page=await web.page();
   await page.waitForFunction(()=>!!window.MT_APP_NAV&&MT_APP_CONFIG.buildNumber===9);
   await page.evaluate(()=>{const dialog=document.getElementById('mtReleaseDialog');if(dialog?.open)dialog.close()});
   for(const [i,route]of ['home','vessel-calcs','electrical','fuel'].entries()){
    await page.evaluate(id=>{MT_APP_NAV.go(id);window.scrollTo({top:0,behavior:'instant'})},route);
    if(route==='vessel-calcs'){
     await page.locator('#airMargin').fill('1');await page.locator('#calcAirDraft').click();
     await page.locator('#resAirDraft').scrollIntoViewIfNeeded();
    }
    if(route==='electrical'){await page.locator('#calc3p').click();await page.locator('#res3p').scrollIntoViewIfNeeded();}
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('#'+route).waitFor({state:'visible'});
    await page.waitForFunction(id=>document.documentElement.dataset.mtPage===id&&MT_APP_NAV.current===id,route);
    await page.waitForTimeout(1800);
    await page.screenshot(); // Flush the WebView render before reading the Android display surface.
    await page.waitForTimeout(400);
    const file=profile.name+'-'+(i+1)+'-'+route+'.png';await device.screenshot({path:out+'/'+file});
    const actualRoute=await page.evaluate(()=>MT_APP_NAV.current);assert.equal(actualRoute,route);
    captures.push({file,route,actualRoute,profile,buildNumber:9,package:pkg,source:'Actual Android emulator screenshot; original app UI',physicalDevice:false});
   }
  }
  fs.writeFileSync(out+'/capture-manifest.json',JSON.stringify({buildNumber:9,sourceApkArtifactRun:40572913607,sourceApkArtifactName:'MarineTools-Play-build7-android',artifactNameNote:'Legacy artifact label; embedded APK and app config are build 9',captures},null,2));
  console.log(JSON.stringify({status:'PASS',captures:captures.length,buildNumber:9}));
 }finally{await device.shell('wm size reset').catch(()=>{});await device.shell('wm density reset').catch(()=>{});await device.close().catch(()=>{});}
})().then(()=>{clearTimeout(watchdog);process.exit(0)},e=>{console.error(e);clearTimeout(watchdog);process.exit(1)});
