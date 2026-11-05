/* Phone portrait/landscape geometry and real controls, not just page width. */
const fs=require('node:fs');
const {assertAppLayout,assertReachable}=require('./helpers/app-layout.cjs');
const profiles=[
 [320,568],[360,640],[384,832],[412,915],
 [568,320],[640,360],[832,384],[915,412],
 [768,1024],[1024,768],[1440,900],[1920,1080],
 [800,600],[900,600],[901,600],[1024,600],[1199,700],[1200,700],[1201,700],
 [1280,720],[1280,800],[1366,768],[1536,864],[960,540],[2560,1440],[3440,1440]
];
module.exports=async function phoneLayouts(page,out){
 const records=[];
 for(const [width,height] of profiles){
  await page.setViewportSize({width,height});
  const phone=width<=412||height<=412;
  const insets=phone?(width>height?{top:0,right:28,bottom:24,left:28}:{top:28,right:0,bottom:48,left:0}):{top:0,right:0,bottom:0,left:0};
  await page.evaluate(v=>{for(const [side,n] of Object.entries(v))document.documentElement.style.setProperty('--safe-area-inset-'+side,n+'px')},insets);
  for(const theme of ['dark','bridge']){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   for(const route of ['home','fuel','vessel-calcs','electrical','settings']){
    await page.evaluate(id=>MT_APP_NAV.go(id),route);
    const label=`${width}x${height}/${theme}/${route}`;
    records.push(await assertAppLayout(page,label));
    if(route==='home'){records.push(await assertReachable(page,'#homeSearchGo',label+'/home-search'));if(phone){const h=records.at(-2);if(h.header.height-h.viewport.top>70)throw Error(label+' home header uses more than one compact toolbar row')}}
    if(route==='vessel-calcs'){
     records.push(await assertReachable(page,'#calcAirDraft',label+'/calculate'));await page.locator('#calcAirDraft').click();
     if(!(await page.locator('#resAirDraft').textContent()).includes('3.20'))throw Error(label+' calculation changed');
    }
    if(route==='settings')records.push(await assertReachable(page,'#exportData',label+'/export'));
   }
  }
  if(phone){
   await page.locator('#mobileMenu').click();await page.locator('#sidebar [data-page="electrical"]').click();
   if(await page.locator('#sidebar').evaluate(el=>el.classList.contains('open')))throw Error('Mobile menu did not close after selecting a tool');
   await page.evaluate(()=>MT_APP_NAV.go('home'));await assertAppLayout(page,width+'x'+height+'/after-menu');
   await page.screenshot({path:out+`/phone-${width}x${height}.png`,animations:'disabled'});
  }
 }
 // CSS zoom is an additional enlargement/reflow simulation, not an OS-DPI claim.
 for(const [width,height,zoom] of [[1280,720,1.25],[1366,768,1.5],[1920,1080,2],[412,915,1.25],[915,412,1.25]]){
  await page.setViewportSize({width,height});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
  for(const route of ['home','vessel-calcs','settings']){
   await page.evaluate(id=>MT_APP_NAV.go(id),route);
   records.push(await assertAppLayout(page,`${width}x${height}/zoom-${zoom}/${route}`));
   if(route==='vessel-calcs')records.push(await assertReachable(page,'#calcAirDraft','enlarged calculation control'));
  }
  await page.evaluate(()=>document.documentElement.style.removeProperty('zoom'));
 }
 await page.evaluate(()=>{for(const side of ['top','right','bottom','left'])document.documentElement.style.removeProperty('--safe-area-inset-'+side)});
 // Reproduce the usable landscape area left above the Android keyboard.
 // The native probe separately verifies the real IME and the same field bounds.
 await page.setViewportSize({width:863,height:392});await page.evaluate(()=>MT_APP_NAV.go('vessel-calcs'));
 await page.locator('#airMargin').focus();await page.setViewportSize({width:863,height:164});
 await page.waitForFunction(()=>{const r=document.getElementById('airMargin').getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect();return r.top>=h.bottom&&r.bottom<=innerHeight});
 records.push(await assertReachable(page,'#airMargin','landscape field after keyboard-sized viewport reduction'));
 fs.writeFileSync(out+'/phone-layout-results.json',JSON.stringify({status:'PASS',profiles:profiles.length,records,scope:'Simulated viewport and system inset values; native emulator rotation is tested separately'},null,2));
 return records.length;
};
