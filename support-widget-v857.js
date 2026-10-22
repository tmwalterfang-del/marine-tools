(() => {
  'use strict';
  const WIDGET_ID='bmc-wbtn';
  const HIDE_ON_MOBILE=new Set(['weather','route-intelligence','live-experimental']);

  function activePage(){return document.querySelector('.page.active')?.id||'home'}
  function shouldHide(){
    const sidebar=document.getElementById('sidebar');
    return (innerWidth<=760&&HIDE_ON_MOBILE.has(activePage()))||Boolean(sidebar?.classList.contains('open'));
  }
  function syncVisibility(){document.body.classList.toggle('mt-bmc-hidden',shouldHide())}
  function dedupe(){
    const widgets=[...document.querySelectorAll('#'+WIDGET_ID)];
    widgets.slice(1).forEach(el=>el.remove());
    syncVisibility();
  }
  function wakeWidget(){dedupe()}
  function loadWidget(){if(document.getElementById(WIDGET_ID)){syncVisibility();return}const a=document.createElement('a');a.id=WIDGET_ID;a.className='mt-support-link';a.href='https://buymeacoffee.com/marinetools';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Support Marine Tools';document.body.append(a);syncVisibility()}

  const style=document.createElement('style');
  style.textContent=`body.mt-bmc-hidden #${WIDGET_ID}{display:none!important}@media(max-width:760px){#${WIDGET_ID}{right:10px!important;bottom:74px!important;transform:scale(.86);transform-origin:bottom right}}`;
  document.head.appendChild(style);

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-page],[data-go],#mobileMenu')){setTimeout(syncVisibility,60);setTimeout(dedupe,850)}
  },true);
  addEventListener('resize',syncVisibility,{passive:true});
  syncVisibility();
  if('requestIdleCallback'in window)requestIdleCallback(loadWidget,{timeout:3000});else setTimeout(loadWidget,1800);
})();
