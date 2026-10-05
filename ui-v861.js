(() => {
'use strict';
const ICONS={
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-7h6v7"/>',
 fuel:'<path d="M5 4h9v17H5z"/><path d="M8 8h3"/><path d="M14 8h2.5l2 2.5V17a2 2 0 0 0 2 2"/><path d="M17.5 11H20"/>',
 engineering:'<path d="M14.8 6.1a4.3 4.3 0 0 0-5.2 5.4L3.4 17.7a1.6 1.6 0 0 0 0 2.3l.6.6a1.6 1.6 0 0 0 2.3 0l6.2-6.2a4.3 4.3 0 0 0 5.4-5.2l-2.7 2.7-3.1-3.1 2.7-2.7Z"/>',
 electrical:'<path d="M13.5 2 5.5 14h6l-1 8 8-12h-6l1-8Z"/>',
 'vessel-calcs':'<path d="M12 3v8M8 7h8"/><path d="m4 12 8-3 8 3-2.2 6H6.2L4 12Z"/><path d="M4 21c1.2 0 1.8-1 3-1s1.8 1 3 1 1.8-1 3-1 1.8 1 3 1 1.8-1 3-1"/>',
 profile:'<path d="M4 15.5 12 12l8 3.5-2 4.5H6l-2-4.5Z"/><path d="M12 4v8M9 7h6"/><path d="M17.5 4.5h3v3"/><path d="M20.5 4.5 17 8"/>',
 quick:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
 weather:'<path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.3 8.7 4.5 4.5 0 0 0 7 18Z"/><path d="M8 21h8"/>',
 navigation:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"/>',
 'live-experimental':'<circle cx="12" cy="12" r="2.5"/><path d="M5.8 18.2a8.8 8.8 0 0 1 0-12.4M18.2 5.8a8.8 8.8 0 0 1 0 12.4"/><path d="M8.3 15.7a5.2 5.2 0 0 1 0-7.4M15.7 8.3a5.2 5.2 0 0 1 0 7.4"/>',
 'energy-log':'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h5M8 11h4M8 15h3"/><path d="m15 11-2 4h2l-1 4 4-5h-2l1-3h-2Z"/>',
 survey:'<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h4M9 16h5"/>',
 suggestions:'<path d="M9 18h6M10 21h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-1.2.9-1.5 1.5-1.5 2.5h-4c0-1-.3-1.6-1.5-2.5Z"/>',
 custom:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
 support:'<path d="M6 8h10v7a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M6 21h12"/>',
 contact:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
 about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 privacy:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z"/><path d="m9 12 2 2 4-4"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.13-1.35l2-1.55-2-3.46-2.46 1A7 7 0 0 0 14 5.25L13.65 3h-4L9.3 5.25a7 7 0 0 0-2.41 1.39l-2.46-1-2 3.46 2 1.55A7 7 0 0 0 4.3 12c0 .46.04.91.13 1.35l-2 1.55 2 3.46 2.46-1a7 7 0 0 0 2.41 1.39l.35 2.25h4l.35-2.25a7 7 0 0 0 2.41-1.39l2.46 1 2-3.46-2-1.55c.09-.44.13-.89.13-1.35Z"/>',
 'whats-new':'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',
 recent:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/>',
 search:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 bridge:'<path d="M4 17h16M6 17V9M18 17V9M6 11h12M9 11V7h6v4"/><path d="M3 20h18"/>',
 dark:'<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4a8 8 0 1 0 10 10.5Z"/>',
 save:'<path d="M5 4h12l2 2v14H5Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
 export:'<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 13v7h14v-7"/>',
 import:'<path d="M12 15V3M8 11l4 4 4-4"/><path d="M5 13v7h14v-7"/>',
 remove:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
 add:'<path d="M12 5v14M5 12h14"/>',
 calculate:'<path d="M5 4h14v16H5Z"/><path d="M8 8h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
 update:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.2 12a6.5 6.5 0 0 0-11-4.7L4 12M5.8 12a6.5 6.5 0 0 0 11 4.7L20 12"/>',
 gauge:'<path d="M5 19a8 8 0 1 1 14 0"/><path d="m12 12 4-3M8 19h8"/>',
 daily:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 2v4M16 2v4M4 9h16M8 13h3M8 16h6"/>',
 generator:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h3"/>',
 pump:'<circle cx="11" cy="12" r="4"/><path d="M15 12h6M3 12h4M11 8V4"/><path d="M8.5 14.5 13.5 9.5"/>'
};
const PAGE_ICONS={home:'home',fuel:'fuel','energy-log':'energy-log',engineering:'engineering',electrical:'electrical','vessel-calcs':'vessel-calcs',quick:'quick',weather:'weather',navigation:'navigation','live-experimental':'live-experimental',survey:'survey',suggestions:'suggestions',support:'support',contact:'contact',about:'about',privacy:'privacy',profile:'profile',settings:'settings'};
const TOOL_ICONS={
 'Fuel ROB & endurance':'gauge',
 'Daily consumption & reporting':'daily',
 'Bunkering overview':'fuel',
 'Generator load margin':'generator',
 'Pump speed change':'pump',
 'Three-phase power':'electrical'
};
function svg(key){const body=ICONS[key];return body?`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`:''}
function setIcon(host,key,cls='mt-ui-icon'){
 if(!host||!ICONS[key])return;
 if(host.dataset.mtIconKey===key&&host.querySelector('svg'))return;
 host.dataset.mtIconKey=key;host.classList.add(cls);host.innerHTML=svg(key);
}
function sidebar(){
 document.querySelectorAll('.sidebar .nav-btn[data-page]').forEach(btn=>{const key=PAGE_ICONS[btn.dataset.page];if(key)setIcon(btn.querySelector(':scope > span:first-child'),key,'mt-nav-icon')});
 document.querySelectorAll('.sidebar .nav-mail').forEach(btn=>setIcon(btn.querySelector(':scope > span:first-child'),'custom','mt-nav-icon'));
 const wn=document.getElementById('mtWhatsNew');if(wn)setIcon(wn.querySelector(':scope > span:first-child'),'whats-new','mt-nav-icon');
}
function topbar(){
 const profile=document.querySelector('.top-actions [data-go="profile"]');if(profile){profile.classList.add('mt-icon-button');setIcon(profile,'profile')}
 const settings=document.querySelector('.top-actions [data-go="settings"]');if(settings){settings.classList.add('mt-icon-button');setIcon(settings,'settings')}
 const theme=document.getElementById('themeToggle');if(theme){theme.classList.add('mt-icon-button');setIcon(theme,document.documentElement.dataset.theme==='bridge'?'dark':'bridge')}
 const mobile=document.getElementById('mobileMenu');if(mobile){mobile.classList.add('mt-icon-button');setIcon(mobile,'menu')}
 const gs=document.querySelector('.searchbox>span:first-child');if(gs)setIcon(gs,'search');
 const hs=document.querySelector('.home-tool-search>.search-icon');if(hs)setIcon(hs,'search');
}
function home(){
 document.querySelectorAll('.home-category-a button[data-go]').forEach(btn=>{const key=PAGE_ICONS[btn.dataset.go];const host=btn.querySelector(':scope > .home-cat-icon');if(key&&host){btn.classList.add('mt-icon-upgraded');setIcon(host,key)}});
 document.querySelectorAll('.home-popular-grid button,.home-more-links button').forEach(btn=>{const key=TOOL_ICONS[btn.dataset.toolTarget]||PAGE_ICONS[btn.dataset.go];const host=btn.querySelector(':scope > span:first-child');if(key&&host){btn.classList.add('mt-icon-upgraded');setIcon(host,key)}});
}
function actionKey(btn){
 const id=btn.id||'',txt=String(btn.textContent||'').trim().toLowerCase();
 if(/export|download/.test(id.toLowerCase())||/^export\b|^download\b/.test(txt))return'export';
 if(/import|restore/.test(id.toLowerCase())||/^import\b|^restore\b/.test(txt))return'import';
 if(/save/.test(id.toLowerCase())||/^save\b/.test(txt))return'save';
 if(/remove|delete|clear/.test(id.toLowerCase())||/^(remove|delete)\b/.test(txt))return'remove';
 if(/add/.test(id.toLowerCase())||/^add\b/.test(txt))return'add';
 if(/calculate|calc/.test(id.toLowerCase())||/^calculate\b/.test(txt))return'calculate';
 if(/refresh|update/.test(id.toLowerCase())||/^(refresh|update)\b/.test(txt))return'update';
 return null;
}
function actions(){
 document.querySelectorAll('.page .btn').forEach(btn=>{
  if(btn.classList.contains('mini')||btn.classList.contains('small')||btn.dataset.mtActionDone)return;
  const key=actionKey(btn);if(!key)return;
  const icon=document.createElement('span');icon.className='mt-ui-icon';setIcon(icon,key);btn.prepend(icon);btn.classList.add('mt-action-icon');btn.dataset.mtActionDone='1';
 });
}
let queued=false;function upgrade(){queued=false;sidebar();topbar();home();actions()}
function queue(){if(queued)return;queued=true;requestAnimationFrame(upgrade)}
function init(){upgrade();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});document.addEventListener('click',e=>{if(e.target.closest('#themeToggle'))setTimeout(queue,0)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
