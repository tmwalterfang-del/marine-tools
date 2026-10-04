(() => {
'use strict';
const RECENT_KEY='mt.recent';
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
  custom:'<path d="M12 5v14M5 12h14"/>',
  profile:'<path d="M12 3v14"/><path d="M8 7h8"/><path d="M5 13c1.2 4 3.5 6 7 6s5.8-2 7-6"/><path d="M3 13h4M17 13h4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.13-1.35l2-1.55-2-3.46-2.46 1A7 7 0 0 0 14 5.25L13.65 3h-4L9.3 5.25a7 7 0 0 0-2.41 1.39l-2.46-1-2 3.46 2 1.55A7 7 0 0 0 4.3 12c0 .46.04.91.13 1.35l-2 1.55 2 3.46 2.46-1a7 7 0 0 0 2.41 1.39l.35 2.25h4l.35-2.25a7 7 0 0 0 2.41-1.39l2.46 1 2-3.46-2-1.55c.09-.44.13-.89.13-1.35z"/>',
  recent:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>'
};
function svg(body){return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`}
function iconSpan(key){const s=document.createElement('span');s.className='mt-nav-icon';s.innerHTML=svg(icons[key]||icons.recent);return s}
function upgrade(button,key){
  if(!button||!icons[key])return;
  const old=button.querySelector(':scope > span:first-child');
  if(!old||old.classList.contains('mt-nav-icon'))return;
  old.className='mt-nav-icon';
  old.innerHTML=svg(icons[key]);
}
function readRecent(){try{const v=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function clickExistingPage(page){
  const nav=[...document.querySelectorAll('.sidebar .nav-btn[data-page]')].find(b=>b.dataset.page===page);
  if(nav){nav.click();return true}
  const top=document.querySelector(`.top-actions [data-go="${page}"]`);
  if(top){top.click();return true}
  return false;
}
function openRecentTool(item){
  if(!item||!item.page)return;
  clickExistingPage(item.page);
  setTimeout(()=>{
    const cards=[...document.querySelectorAll(`#${item.page} .tool-card`)];
    const card=cards.find(c=>(c.dataset.toolTitle||c.querySelector('h3')?.textContent||'').trim()===String(item.title||'').trim());
    if(card){
      if(card.hidden&&card.dataset.toolGroup){const sel=document.querySelector(item.page==='fuel'?'#fuelView':item.page==='engineering'?'#engView':'');if(sel){sel.value=card.dataset.toolGroup;sel.dispatchEvent(new Event('change'))}}
      setTimeout(()=>{card.scrollIntoView({behavior:'smooth',block:'start'});card.classList.add('tool-focus');setTimeout(()=>card.classList.remove('tool-focus'),1600)},50)
    }
  },100)
}
function makeQuickButton(label,page,key){
  const b=document.createElement('button');b.type='button';b.className='nav-btn';b.append(iconSpan(key));b.append(document.createTextNode(label));b.addEventListener('click',()=>{const p=document.querySelector('.nav-project');if(p)p.open=false;clickExistingPage(page)});return b
}
function renderRecent(){
  const host=document.getElementById('mtSidebarRecentList');if(!host)return;host.innerHTML='';
  const recent=readRecent().filter(x=>x&&x.title&&x.page).slice(0,3);
  if(!recent.length){const empty=document.createElement('div');empty.className='mt-sidebar-empty';empty.textContent='Your last used calculators will appear here.';host.appendChild(empty);return}
  recent.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='nav-btn';b.append(iconSpan('recent'));
    const copy=document.createElement('span');copy.className='mt-recent-copy';const title=document.createElement('b');title.textContent=item.title;const sub=document.createElement('small');sub.textContent=(item.page||'tool').replaceAll('-',' ');copy.append(title,sub);b.append(copy);b.addEventListener('click',()=>openRecentTool(item));host.appendChild(b)
  })
}
function injectExtras(project){
  if(document.getElementById('mtSidebarExtra'))return;
  const extra=document.createElement('div');extra.id='mtSidebarExtra';extra.className='mt-sidebar-extra';
  const quick=document.createElement('section');quick.className='mt-sidebar-section mt-sidebar-quick';const qt=document.createElement('div');qt.className='mt-sidebar-title';qt.textContent='Quick access';quick.append(qt,makeQuickButton('Vessel Profile','profile','profile'),makeQuickButton('Settings','settings','settings'));
  const recent=document.createElement('section');recent.className='mt-sidebar-section mt-sidebar-recent';const rt=document.createElement('div');rt.className='mt-sidebar-title';rt.textContent='Recent tools';const list=document.createElement('div');list.id='mtSidebarRecentList';recent.append(rt,list);
  extra.append(quick,recent);project.insertAdjacentElement('afterend',extra);renderRecent()
}
function init(){
  document.querySelectorAll('.sidebar .nav-btn[data-page]').forEach(btn=>upgrade(btn,btn.dataset.page));
  document.querySelectorAll('.sidebar .nav-mail').forEach(btn=>upgrade(btn,'custom'));
  const project=document.querySelector('.sidebar .nav-project');
  if(project){
    project.open=false;
    const eyebrow=project.querySelector('summary>span');if(eyebrow)eyebrow.textContent='PROJECT';
    project.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{project.open=false}));
    document.addEventListener('click',e=>{if(project.open&&!project.contains(e.target))project.open=false});
    injectExtras(project)
  }
  document.addEventListener('click',e=>{if(e.target.closest?.('.tool-card button'))setTimeout(renderRecent,160)});
  window.addEventListener('storage',e=>{if(e.key===RECENT_KEY)renderRecent()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
