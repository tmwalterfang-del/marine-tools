(function(){'use strict';
const allowed=new Set(['home','fuel','energy-log','engineering','electrical','vessel-calcs','quick','profile','settings','privacy','about','contact','suggestions','navigation','voyage-planning-lab']);
let suppress=false,stack=[],lastBack=0,installPrompt=null;
function status(message){const el=document.getElementById('mt-app-status');if(el)el.textContent=message}
function remember(id){try{localStorage.setItem('mt.app.last-page.v1',id)}catch{}}
function go(id,push=true){if(!allowed.has(id))return false;suppress=true;window.__marineToolsOpenPage(id);suppress=false;if(push&&stack.at(-1)!==id){stack.push(id);history.pushState({mtPage:id},'',pageUrl(id))}remember(id);updateBack();return true}
function pageUrl(id){const u=new URL(location.href);if(['http:','https:'].includes(u.protocol))u.searchParams.set('page',id);else u.hash='page='+id;return u.href}
function updateBack(){const b=document.getElementById('mt-app-back');if(b)b.disabled=stack.length<2}
function back(){const menu=document.getElementById('sidebar');if(menu?.classList.contains('open')){menu.classList.remove('open');document.getElementById('mobileMenu')?.setAttribute('aria-expanded','false');return true}if(stack.length>1){history.back();return true}return false}
window.addEventListener('mt-native-back',()=>{if(back())return;if(window.MT_PLATFORM?.exit){if(Date.now()-lastBack<2000)window.MT_PLATFORM.exit();else{lastBack=Date.now();status('Press back again to close Marine Tools.')}}});
window.addEventListener('popstate',e=>{const id=e.state?.mtPage||'home';if(stack.length>1)stack.pop();go(id,false)});
window.addEventListener('mt-app-deep-link',e=>go(e.detail.page));
window.addEventListener('mt-page-change',e=>{const id=e.detail.page;if(suppress||!allowed.has(id))return;if(stack.at(-1)!==id){stack.push(id);history.pushState({mtPage:id},'',pageUrl(id))}remember(id);updateBack()});
window.addEventListener('mt-app-status',e=>status(e.detail.message));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=document.getElementById('mt-app-install');if(b)b.hidden=false});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.getElementById('mt-app-install').hidden=true;status('Marine Tools installed.')});
document.addEventListener('click',e=>{const nav=e.target.closest('[data-go],[data-page]'),id=nav?.dataset.go||nav?.dataset.page;if(id&&!allowed.has(id)){e.preventDefault();e.stopImmediatePropagation();status('This online feature is not included in the local app candidate.');return}const a=e.target.closest('a[href]');if(!a||a.download||e.defaultPrevented)return;const u=new URL(a.href,location.href);if(u.pathname.endsWith('/education.html')){e.preventDefault();window.MT_PLATFORM.openUrl(window.MT_APP_CONFIG.educationUrl).catch(err=>status(err.message));return}if(u.protocol==='https:'&&u.origin!==location.origin||u.protocol==='mailto:'){e.preventDefault();window.MT_PLATFORM.openUrl(u.href).catch(err=>status(err.message))}},true);
document.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();back()}});
function init(){
 document.documentElement.classList.add('mt-app');
 const bar=document.createElement('div');bar.className='mt-app-bar';bar.innerHTML='<button id="mt-app-back" type="button" aria-label="Previous tool">← Back</button><span id="mt-app-version"></span><button id="mt-app-install" type="button" hidden>Install app</button><button id="mt-app-update" type="button" hidden>Apply update</button><span id="mt-app-status" role="status" aria-live="polite"></span>';document.body.prepend(bar);
 document.getElementById('mt-app-version').textContent='Marine Tools Preview · '+window.MT_APP_CONFIG.version;
 document.getElementById('mt-app-back').onclick=back;document.getElementById('mt-app-install').hidden=!installPrompt;
 document.getElementById('mt-app-install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;document.getElementById('mt-app-install').hidden=true}};
 status('Local calculators · live AIS/weather disabled · no app analytics.');
 const offlineCopy=document.querySelector('#offlineBanner span');if(offlineCopy)offlineCopy.textContent='Local calculators and saved inputs remain available. This app candidate includes no live or cached weather/AIS. Protected Education requires an internet connection.';
 let saved='home';try{saved=localStorage.getItem('mt.app.last-page.v1')||'home'}catch{}
 const initial=window.__MT_INITIAL_PAGE||(location.hash.startsWith('#page=')?location.hash.slice(6):new URL(location.href).searchParams.get('page'))||saved;
 const id=allowed.has(initial)?initial:'home';stack=[id];history.replaceState({mtPage:id},'',pageUrl(id));go(id,false);
 const size=new ResizeObserver(()=>document.documentElement.style.setProperty('--mt-app-bar-height',Math.ceil(bar.getBoundingClientRect().height)+'px'));size.observe(bar);
 // Do not advertise network-only pages as available local app features.
 for(const n of document.querySelectorAll('.nav-btn[data-page]'))if(!allowed.has(n.dataset.page))n.hidden=true;
 if(!window.MT_NATIVE_APP&&'serviceWorker'in navigator)navigator.serviceWorker.ready.then(reg=>{
  const show=()=>{if(!reg.waiting)return;const b=document.getElementById('mt-app-update');b.hidden=false;b.onclick=()=>{status('Applying update. Local drafts remain on this device.');navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});reg.waiting.postMessage({type:'SKIP_WAITING'})}};
  show();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',show));
 }).catch(()=>{});
 window.MT_APP_NAV={go,back,canOpen:id=>allowed.has(id),get current(){return stack.at(-1)}};
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});
})();
