(() => {
'use strict';

const QUICK_PAGES=new Map([
  ['vessel profile','profile'],
  ['settings','settings']
]);
let sidebarObserver=null;
let syncQueued=false;

function queueSync(){
  if(syncQueued)return;
  syncQueued=true;
  requestAnimationFrame(()=>{syncQueued=false;syncActivePage()});
}
function currentPage(){return document.querySelector('.main-content .page.active')?.id||'home'}
function quickPageIds(){
  document.querySelectorAll('#mtSidebarExtra .nav-btn').forEach(btn=>{
    if(btn.dataset.page)return;
    const label=String(btn.textContent||'').trim().replace(/\s+/g,' ').toLowerCase();
    const page=QUICK_PAGES.get(label);
    if(page)btn.dataset.page=page;
  });
}
function visibleLabel(btn){return String(btn?.textContent||'').trim().replace(/\s+/g,' ')}
function syncProjectContext(id){
  const project=document.querySelector('.sidebar .nav-project');
  if(!project)return;
  const active=[...project.querySelectorAll('.nav-project-items .nav-btn[data-page]')].find(btn=>btn.dataset.page===id);
  project.classList.toggle('has-active-page',Boolean(active));
  const summary=project.querySelector('summary');
  if(!summary)return;
  if(active){
    summary.dataset.currentPage=visibleLabel(active);
    summary.setAttribute('aria-label',`Project & contact — current page: ${visibleLabel(active)}`);
  }else{
    delete summary.dataset.currentPage;
    summary.removeAttribute('aria-label');
  }
}
function syncActivePage(){
  quickPageIds();
  const id=currentPage();
  document.querySelectorAll('.sidebar .nav-btn[data-page]').forEach(btn=>{
    const active=btn.dataset.page===id;
    btn.classList.toggle('active',active);
    if(active){btn.setAttribute('aria-current','page');btn.dataset.currentPage='true'}
    else{btn.removeAttribute('aria-current');delete btn.dataset.currentPage}
  });
  syncProjectContext(id);
}
function injectStyle(){
  if(document.getElementById('mtSidebarActiveStyle'))return;
  const style=document.createElement('style');
  style.id='mtSidebarActiveStyle';
  style.textContent=`
.sidebar .nav-btn[aria-current="page"]:not(.brand){position:relative;color:#fff;background:linear-gradient(90deg,rgba(11,118,189,.82),rgba(10,54,80,.78));box-shadow:inset 3px 0 0 #45c9f4,0 0 0 1px rgba(69,201,244,.08)}
.sidebar .nav-btn[aria-current="page"]:not(.brand)::after{content:"";position:absolute;right:10px;top:50%;width:6px;height:6px;border-radius:50%;transform:translateY(-50%);background:#64dcff;box-shadow:0 0 0 3px rgba(100,220,255,.12)}
.sidebar .nav-btn[aria-current="page"]>.mt-nav-icon{color:#8be7ff}
.sidebar .nav-project.has-active-page>summary{position:relative;border-color:#2e9cca;background:linear-gradient(180deg,#0d3148,#09273b);box-shadow:inset 3px 0 0 #45c9f4}
.sidebar .nav-project.has-active-page>summary::after{content:attr(data-current-page);position:absolute;right:10px;top:50%;max-width:92px;transform:translateY(-50%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#72dfff;font-size:8px;letter-spacing:.03em}
[data-theme="bridge"] .sidebar .nav-btn[aria-current="page"]:not(.brand){background:linear-gradient(90deg,rgba(115,73,24,.88),rgba(39,25,12,.82));box-shadow:inset 3px 0 0 #e0ad4d,0 0 0 1px rgba(224,173,77,.08)}
[data-theme="bridge"] .sidebar .nav-btn[aria-current="page"]:not(.brand)::after{background:#f0bf63;box-shadow:0 0 0 3px rgba(240,191,99,.12)}
[data-theme="bridge"] .sidebar .nav-project.has-active-page>summary{border-color:#8a642f;box-shadow:inset 3px 0 0 #e0ad4d}
@media(max-width:900px){.sidebar .nav-project.has-active-page>summary::after{max-width:82px}}
`;
  document.head.appendChild(style);
}
function observe(){
  const sidebar=document.getElementById('sidebar');
  if(sidebar&&!sidebarObserver){
    sidebarObserver=new MutationObserver(queueSync);
    sidebarObserver.observe(sidebar,{childList:true,subtree:true});
  }
  document.querySelectorAll('.main-content .page').forEach(page=>{
    if(page.dataset.mtActiveObserved)return;
    page.dataset.mtActiveObserved='1';
    new MutationObserver(queueSync).observe(page,{attributes:true,attributeFilter:['class']});
  });
}
function init(){injectStyle();syncActivePage();observe();document.addEventListener('click',()=>setTimeout(queueSync,0),true);window.addEventListener('pageshow',queueSync)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
