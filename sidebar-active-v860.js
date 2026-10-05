(() => {
'use strict';
const QUICK_TARGETS={
  'Vessel Profile':'profile',
  'Settings':'settings'
};
function currentPage(){return document.querySelector('.main-content .page.active')?.id||document.querySelector('.page.active')?.id||'home'}
function targetFor(btn){
  if(btn.dataset.page)return btn.dataset.page;
  if(btn.dataset.sidebarPage)return btn.dataset.sidebarPage;
  if(btn.closest('.mt-sidebar-quick')){
    const text=(btn.textContent||'').trim();
    for(const [label,page] of Object.entries(QUICK_TARGETS))if(text.includes(label))return page;
  }
  return '';
}
function sync(){
  const page=currentPage();
  document.querySelectorAll('.sidebar .nav-btn').forEach(btn=>{
    if(btn.classList.contains('brand'))return;
    const target=targetFor(btn);if(!target)return;
    const active=target===page;
    btn.classList.toggle('active',active);
    if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
  });
  const project=document.querySelector('.sidebar .nav-project');
  if(project){
    const childActive=[...project.querySelectorAll('.nav-btn[data-page]')].some(btn=>btn.dataset.page===page);
    project.classList.toggle('mt-has-active',childActive);
  }
}
function init(){
  sync();
  const main=document.querySelector('.main-content')||document.querySelector('main');
  if(main)new MutationObserver(sync).observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
  const sidebar=document.querySelector('.sidebar');
  if(sidebar)new MutationObserver(sync).observe(sidebar,{subtree:true,childList:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page],[data-go],.mt-sidebar-quick .nav-btn'))setTimeout(sync,0)});
  window.addEventListener('popstate',sync);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
