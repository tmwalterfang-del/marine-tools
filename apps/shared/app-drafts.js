/* Public app inputs only. No credentials, file contents or calculated results. */
(function(){'use strict';
const key='mt.app.tool-drafts.v1';let fields={},timer=null,loading=false;const seen=new WeakSet();
function status(text){window.dispatchEvent(new CustomEvent('mt-app-status',{detail:{message:text}}))}
try{const raw=localStorage.getItem(key);if(raw){if(raw.length>200000)throw Error('large');const r=JSON.parse(raw);if(r.schema!=='marine-tools-app-drafts'||r.version!==1||!r.fields||typeof r.fields!=='object'||Array.isArray(r.fields)||Object.keys(r.fields).length>1000)throw Error('shape');for(const[id,v]of Object.entries(r.fields)){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id)||!v||typeof v.type!=='string'||!(typeof v.value==='boolean'||typeof v.value==='string'&&v.value.length<=2000))throw Error('field')}fields=r.fields}}catch{fields={};setTimeout(()=>status('Saved inputs could not be restored. Defaults were kept.'),1000)}
function eligible(el){return el?.id&&el.closest('.tool-card')&&['INPUT','SELECT','TEXTAREA'].includes(el.tagName)&&!['file','password','hidden'].includes(el.type)}
function flush(){clearTimeout(timer);try{const text=JSON.stringify({schema:'marine-tools-app-drafts',version:1,fields});if(text.length>200000)throw Error('large');localStorage.setItem(key,text)}catch{status('Input saving unavailable or full. Export important work separately.')}}
function capture(e){const el=e.target;if(loading||!eligible(el))return;fields[el.id]={type:el.type,value:el.type==='checkbox'?el.checked:el.value};clearTimeout(timer);timer=setTimeout(flush,250)}
function restore(){loading=true;try{for(const el of document.querySelectorAll('.tool-card input[id],.tool-card select[id],.tool-card textarea[id]')){
 if(!eligible(el)||seen.has(el))continue;seen.add(el);const value=fields[el.id];if(!value||value.type!==el.type)continue;
 if(el.type==='checkbox'){if(typeof value.value!=='boolean')continue;el.checked=value.value}else{if(typeof value.value!=='string'||el.tagName==='SELECT'&&![...el.options].some(o=>o.value===value.value))continue;el.value=value.value}
 el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
 }
 const settings=document.getElementById('settings');if(settings?.classList.contains('active')&&!document.getElementById('mt-app-clear-drafts')){
 const section=document.createElement('section');section.className='panel';const text=document.createElement('p');text.textContent='App data: fixed calculator inputs are saved locally, including unfinished values. Results must be recalculated after reopening. No app analytics or live API data is collected. Device backups and files you explicitly share are controlled separately.';
 const b=document.createElement('button');b.id='mt-app-clear-drafts';b.className='btn';b.textContent='Clear saved calculator inputs';b.onclick=()=>{fields={};clearTimeout(timer);try{localStorage.removeItem(key);status('Saved calculator inputs cleared. Current values remain on screen.')}catch{status('Could not clear saved calculator inputs.')}};
 section.append(text,b);settings.append(section);
 for(const id of ['setAnalytics','excludeAnalytics']){const el=document.getElementById(id);if(el){el.disabled=true;if(id==='setAnalytics')el.checked=false}}
 }
 }finally{loading=false}}
for(const event of ['input','change'])document.addEventListener(event,capture);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});window.addEventListener('pagehide',flush);window.addEventListener('mt-page-change',()=>queueMicrotask(restore));document.addEventListener('DOMContentLoaded',()=>setTimeout(restore,0));
window.MT_APP_DRAFTS={flush,restore};
})();
