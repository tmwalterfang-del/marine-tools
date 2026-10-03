(() => {
  'use strict';
  const WIDGET_ID='bmc-wbtn';
  const SCRIPT_SRC='https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
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
  function wakeWidget(){
    try{window.dispatchEvent(new Event('DOMContentLoaded'))}catch{}
    setTimeout(dedupe,80);setTimeout(dedupe,500);
  }
  function loadWidget(){
    if(document.getElementById(WIDGET_ID)){syncVisibility();return}
    const existing=document.querySelector('script[data-name="BMC-Widget"]');
    if(existing){wakeWidget();return}
    const s=document.createElement('script');
    s.src=SCRIPT_SRC;s.async=true;s.dataset.name='BMC-Widget';s.dataset.cfasync='false';s.dataset.id='marinetools';
    s.dataset.description='Support Marine Tools on Buy Me a Coffee';
    s.dataset.message='Enjoying Marine Tools? Support continued development and help keep the tools free.';
    s.dataset.color='#159fe4';s.dataset.position='Right';s.dataset.x_margin='18';s.dataset.y_margin='18';
    s.onload=wakeWidget;s.onerror=()=>{};document.body.appendChild(s);
  }

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
