(() => {
'use strict';
const icons={
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-7h6v7"/>',
  fuel:'<path d="M6 3h9v18H6z"/><path d="M9 7h3"/><path d="M15 7h2.5l2 2.5V17a2 2 0 0 0 2 2"/><path d="M18 10h2"/>',
  engineering:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.7.64.98.29.29.66.49 1.06.58H21v4h-.1c-.4.09-.77.29-1.06.58-.28.28-.5.61-.64.98z"/>',
  electrical:'<path d="M13 2 5 14h7l-1 8 8-12h-7z"/>',
  'vessel-calcs':'<path d="M12 3v14"/><path d="M8 7h8"/><path d="M5 13c1.2 4 3.5 6 7 6s5.8-2 7-6"/><path d="M3 13h4M17 13h4"/>',
  quick:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h8"/>',
  weather:'<path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.3 8.7 4.5 4.5 0 0 0 7 18z"/><path d="M8 21h8"/>',
  navigation:'<path d="M4 20 12 3l8 17-8-4z"/><path d="M12 3v13"/>',
  'live-experimental':'<circle cx="12" cy="12" r="3"/><path d="M2.5 12a9.5 9.5 0 0 1 19 0M5.5 12a6.5 6.5 0 0 1 13 0"/>',
  survey:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h6"/>',
  suggestions:'<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-1.2.9-1.5 1.5-1.5 2.5h-4c0-1-.3-1.6-1.5-2.5z"/>',
  support:'<path d="M7 8h9v7a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M6 21h12"/>',
  contact:'<path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/>',
  about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  privacy:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  custom:'<path d="M12 5v14M5 12h14"/>'
};
function svg(body){return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`}
function upgrade(button,key){
  if(!button||!icons[key])return;
  const old=button.querySelector(':scope > span:first-child');
  if(!old||old.classList.contains('mt-nav-icon'))return;
  old.className='mt-nav-icon';
  old.innerHTML=svg(icons[key]);
}
function init(){
  document.querySelectorAll('.sidebar .nav-btn[data-page]').forEach(btn=>upgrade(btn,btn.dataset.page));
  document.querySelectorAll('.sidebar .nav-mail').forEach(btn=>upgrade(btn,'custom'));
  const project=document.querySelector('.sidebar .nav-project');
  if(project){
    project.open=false;
    project.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{project.open=false}));
    document.addEventListener('click',e=>{
      if(project.open&&!project.contains(e.target))project.open=false;
    });
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
