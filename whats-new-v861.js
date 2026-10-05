(() => {
'use strict';
const SEEN_KEY='mt.lastSeenReleaseBuild';
const release=()=>window.__MARINE_TOOLS_RELEASE||{version:'8.6.0',released:'2026-10-05',build:'20261005-v8-6-0',history:[]};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function getSeen(){try{return localStorage.getItem(SEEN_KEY)||''}catch{return''}}
function setSeen(v){try{localStorage.setItem(SEEN_KEY,String(v||''))}catch{}}
function ensureButton(){
 const project=document.querySelector('.sidebar .nav-project');if(!project)return null;
 let btn=document.getElementById('mtWhatsNew');
 if(btn&&project.contains(btn)){btn.remove();btn=null}
 if(!btn){
  btn=document.createElement('button');btn.type='button';btn.id='mtWhatsNew';btn.className='nav-btn';btn.dataset.icon='whats-new';
  btn.innerHTML='<span class="mt-nav-icon" aria-hidden="true"></span><span class="mt-whats-new-copy">What\'s new</span><span class="mt-whats-new-badge">NEW</span>';
  project.insertAdjacentElement('beforebegin',btn);
  btn.addEventListener('click',()=>openDialog(false));
 }
 const r=release(),badge=btn.querySelector('.mt-whats-new-badge'),label='v'+r.version;if(badge&&badge.textContent!==label)badge.textContent=label;
 return btn;
}
function historyHtml(){
 const r=release(),items=Array.isArray(r.history)?r.history:[],current=items[0]||{version:r.version,date:r.released,title:'Latest update',items:[]},older=items.slice(1);
 const list=(current.items||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 const olderHtml=older.map(x=>`<div class="mt-release-item"><b>v${esc(x.version)} · ${esc(x.title||'Update')}</b><small>${esc(x.date||'')}</small>${Array.isArray(x.items)&&x.items.length?`<ul>${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</div>`).join('');
 return `<div class="mt-release-current"><div class="mt-release-current-top"><div><div class="eyebrow">LATEST RELEASE</div><h3>${esc(current.title||'Marine Tools update')}</h3></div><span class="mt-release-version">v${esc(current.version||r.version)}</span></div><ul class="mt-release-list">${list}</ul></div>${older.length?`<details class="mt-release-history"><summary>Previous releases</summary><div class="mt-release-history-inner">${olderHtml}</div></details>`:''}`;
}
function ensureDialog(){
 let d=document.getElementById('mtReleaseDialog');if(d)return d;
 d=document.createElement('dialog');d.id='mtReleaseDialog';d.className='mt-release-dialog';d.setAttribute('aria-labelledby','mtReleaseTitle');
 d.innerHTML='<div class="mt-release-shell"><div class="mt-release-head"><div><div class="eyebrow">MARINE TOOLS</div><h2 id="mtReleaseTitle">What\'s new</h2><p id="mtReleaseSubtitle"></p></div><button type="button" class="mt-release-close" aria-label="Close">×</button></div><div class="mt-release-body"><div id="mtReleaseContent"></div><div class="mt-release-actions"><button type="button" class="btn primary" id="mtReleaseDone">Got it</button></div></div></div>';
 document.body.appendChild(d);
 const close=()=>{if(d.open)d.close();else d.removeAttribute('open')};d.querySelector('.mt-release-close').addEventListener('click',close);d.querySelector('#mtReleaseDone').addEventListener('click',close);d.addEventListener('click',e=>{if(e.target===d)close()});
 return d;
}
function openDialog(auto){
 const r=release(),d=ensureDialog();d.querySelector('#mtReleaseSubtitle').textContent=`v${r.version} · ${r.released||''}${auto?' · Updated since your last visit':''}`;d.querySelector('#mtReleaseContent').innerHTML=historyHtml();setSeen(r.build||r.version);
 if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
}
function maybeAutoOpen(){const r=release(),key=r.build||r.version;if(!key||getSeen()===key)return;setTimeout(()=>openDialog(true),650)}
function init(){ensureButton();ensureDialog();maybeAutoOpen();const sidebar=document.getElementById('sidebar');if(sidebar)new MutationObserver(()=>ensureButton()).observe(sidebar,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
