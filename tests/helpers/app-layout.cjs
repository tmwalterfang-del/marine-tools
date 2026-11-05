/* Actual viewport geometry/hit testing, shared by browser and native WebView QA. */
const assert=require('node:assert/strict');
async function assertAppLayout(page,label){
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const result=await page.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
  const header=document.querySelector('.topbar'),h=rect(header),style=getComputedStyle(document.documentElement);
  const inset=side=>parseFloat(style.getPropertyValue('--safe-area-inset-'+side))||0;
  const view={width:innerWidth,height:visualViewport?.height||innerHeight,left:inset('left'),right:inset('right'),top:inset('top'),bottom:inset('bottom')};
  const failures=[];
  if(document.documentElement.scrollWidth>innerWidth+2)failures.push('horizontal page overflow');
  if(h.y < -1||h.bottom>view.height-view.bottom+1)failures.push('header outside safe viewport');
  if(view.height-h.bottom-view.bottom<80)failures.push('header leaves less than 80px working height');
  const controls=[...header.querySelectorAll('button,input,#mt-app-version')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).visibility!=='hidden'});
  for(const el of controls){const r=rect(el),name=el.id||el.getAttribute('aria-label')||el.dataset.go||el.tagName;
   if(r.x<view.left-1||r.right>view.width-view.right+1||r.y<Math.max(h.y,view.top)-1||r.bottom>h.bottom+1)failures.push(name+' clipped/outside header safe area');
   const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   if(!hit||!el.contains(hit))failures.push(name+' covered at its touch point');
   if(el.tagName==='BUTTON'&&(r.width<43||r.height<43))failures.push(name+' smaller than 44px touch target');
  }
  const title=header.querySelector('#mt-app-version');if(!title)failures.push('version is not inside the shared header');
  return {failures,header:h,viewport:view,controlCount:controls.length,orientation:innerWidth>innerHeight?'landscape':'portrait'};
 });
 assert.deepEqual(result.failures,[],label+': '+JSON.stringify(result));return {label,...result};
}
async function assertReachable(page,selector,label){
 const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await el.click({trial:true});
 const info=await el.evaluate(el=>{const r=el.getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect();const style=getComputedStyle(document.documentElement),bottom=parseFloat(style.getPropertyValue('--safe-area-inset-bottom'))||0;return {top:r.top,bottom:r.bottom,headerBottom:h.bottom,viewportBottom:(visualViewport?.height||innerHeight)-bottom}});
 assert.ok(info.top>=info.headerBottom-1&&info.bottom<=info.viewportBottom+1,label+': control obscured by header/system navigation '+JSON.stringify(info));
 return {label,...info};
}
module.exports={assertAppLayout,assertReachable};
