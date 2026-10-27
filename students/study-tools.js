/* Local input drafts only. No source-page cache, accounts or telemetry. */
(function(){'use strict';
const main=document.querySelector('main');if(!main)return;
const page=location.pathname.split('/').pop(),prefix='mt.study.draft.v1:',preference='mt.study.autosave.enabled.v1';
const status=document.createElement('p');status.className='study-connectivity';status.setAttribute('role','status');
function connection(){const offline=navigator.onLine===false;status.dataset.offline=String(offline);status.textContent=offline?(/\.pages\.dev$/i.test(location.hostname)?'Offline · open calculations still work. Reopening this protected preview requires a connection.':'Offline · local calculations available. Live AIS and weather require a connection.'):'Connection available · these study calculations run locally, without live AIS or weather data.';}
(document.querySelector('.workspace-toolbar')||main).append(status);window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
// Supplementary content remains in the DOM for reports and accessibility.
const extras=new Set([...document.querySelectorAll('.export-panel,.study-export,main>.explanation,#model-limits,.lower>.support')]);
const notes=document.getElementById('notes');if(notes)extras.add(notes.closest('section'));
for(const section of extras){if(!section||section.closest('details'))continue;const h=section.querySelector('h2,h3');if(!h)continue;const d=document.createElement('details'),s=document.createElement('summary');d.className='study-extra';s.textContent=h.textContent;section.before(d);d.append(s,section);}
let printState=[];window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('details.study-extra')].map(d=>[d,d.open]);for(const[d]of printState)d.open=true});window.addEventListener('afterprint',()=>{for(const[d,open]of printState)d.open=open});
if(!['examples.html','explorers.html','cargo.html','labs.html','mollier.html'].includes(page))return;
if(page==='mollier.html'&&typeof window.MT_MOLLIER_INPUTS!=='function')return;
function moduleId(){const h=location.hash.slice(1);return page==='examples.html'?('example:'+(['lifting','trim','tank','pump','crank','faults'].includes(h)?h:'lifting')):page==='explorers.html'?('explorer:'+(['rlc','heat','current','finance'].includes(h)?h:'rlc')):page==='labs.html'?('labs:'+(['stability','controls','engine'].includes(h)?h:'stability')):page==='cargo.html'?'cargo':'mollier';}
function scope(){if(page==='labs.html')return document.getElementById(moduleId().split(':')[1]);return document.getElementById('experiment');}
const fields=()=>[...(scope()?.querySelectorAll('input,select,textarea')||[])].filter(x=>x.type!=='file'&&(x.name||x.id));
const keyOf=x=>(x.form?.id||'')+':'+(x.id||x.name)+':'+(x.type||x.tagName);
function raw(){return fields().map(x=>({key:keyOf(x),value:x.type==='checkbox'?x.checked:x.value}));}
function capture(){if(page==='cargo.html')return window.MT_CARGO_UI.draft();if(page==='mollier.html'){const error=document.getElementById('input-error');return {scenario:window.MT_MOLLIER_INPUTS(),active:document.getElementById('active-state').value,error:error.hidden?'':error.textContent,raw:error.hidden?[]:['pressure-number','quality-number','superheat-temp','process-efficiency'].map(id=>({id,value:document.getElementById(id).value}))};}return raw();}
function restore(data){
 if(page==='cargo.html'){window.MT_CARGO_UI.restoreDraft(data);return;}
 if(page==='mollier.html'){
  if(!data||!['a','b'].includes(data.active)||typeof data.error!=='string'||data.error.length>2000||!Array.isArray(data.raw)||data.raw.length>4)throw Error('Invalid saved state.');
  for(const x of data.raw)if(!['pressure-number','quality-number','superheat-temp','process-efficiency'].includes(x.id)||typeof x.value!=='string'||x.value.length>200)throw Error('Invalid saved field.');
  window.MT_MOLLIER_RESTORE(window.MT_STUDY_EXPORT.scenario('mollier-if97',data.scenario));
  const active=document.getElementById('active-state');active.value=data.active;active.dispatchEvent(new Event('change',{bubbles:true}));
  if(data.error){for(const x of data.raw)document.getElementById(x.id).value=x.value;const e=document.getElementById('input-error');e.textContent=data.error;e.hidden=false;}
  return;
 }
 const current=fields();if(!Array.isArray(data)||data.length!==current.length)throw Error('Saved fields changed.');
 for(let i=0;i<current.length;i++){const x=current[i],v=data[i];if(!v||v.key!==keyOf(x)||(x.type==='checkbox'?typeof v.value!=='boolean':typeof v.value!=='string'||v.value.length>2000)||x.tagName==='SELECT'&&![...x.options].some(o=>o.value===v.value))throw Error('Invalid saved fields.');}
 for(let i=0;i<current.length;i++){const x=current[i];if(x.type==='checkbox')x.checked=data[i].value;else x.value=data[i].value;}
 for(const form of new Set(current.map(x=>x.form).filter(Boolean)))form.dispatchEvent(new Event('change',{bubbles:true}));
}
const bar=document.createElement('div');bar.className='study-session';
const label=document.createElement('label'),enabled=document.createElement('input');enabled.type='checkbox';label.append(enabled,document.createTextNode('Save drafts on this device'));bar.append(label);
const message=document.createElement('span');message.setAttribute('role','status');message.setAttribute('aria-live','polite');bar.append(message);
const clear=document.createElement('button');clear.type='button';clear.textContent='Clear saved study drafts';bar.append(clear);main.prepend(bar);
let pending=null,timer=null,restoring=false,currentId=moduleId(),fingerprint='';
try{enabled.checked=localStorage.getItem(preference)!=='false';}catch{enabled.checked=false;message.textContent='Local saving unavailable. Use Scenario (JSON) to keep your work.';}
function flush(){clearTimeout(timer);timer=null;if(!pending||!enabled.checked)return;try{localStorage.setItem(prefix+pending.module,JSON.stringify(pending));message.textContent='Draft saved locally · '+new Date(pending.savedAt).toLocaleTimeString('en-GB');pending=null;}catch{message.textContent='Local saving unavailable or full. Use Scenario (JSON) to keep your work.';}}
function queue(){if(restoring||!enabled.checked)return;try{const data=capture(),text=JSON.stringify(data);if(text===fingerprint)return;if(text.length>180000)throw Error('Draft is too large.');fingerprint=text;pending={schema:'marine-tools-local-draft',version:1,module:currentId,savedAt:new Date().toISOString(),data};clearTimeout(timer);timer=setTimeout(flush,200);}catch{message.textContent='Draft could not be saved. Use Scenario (JSON) for valid inputs.';}}
function load(){currentId=moduleId();restoring=true;try{if(enabled.checked){const text=localStorage.getItem(prefix+currentId);if(text){if(text.length>200000)throw Error('Draft is too large.');const record=JSON.parse(text);if(record.schema!=='marine-tools-local-draft'||record.version!==1||record.module!==currentId)throw Error('Draft format changed.');restore(record.data);message.textContent='Draft restored locally. Review any marked inputs.';}else message.textContent='Changes will be saved locally. JSON exports remain available.';}else if(!message.textContent)message.textContent='Automatic local saving is off.';}catch{message.textContent='Saved draft could not be restored. Current inputs were kept; JSON import remains available.';}finally{restoring=false;fingerprint=JSON.stringify(capture());}}
enabled.addEventListener('change',()=>{try{localStorage.setItem(preference,String(enabled.checked));if(enabled.checked){fingerprint='';queue();}else{pending=null;clearTimeout(timer);message.textContent='Automatic local saving is off.';}}catch{message.textContent='Local saving unavailable.';}});
clear.addEventListener('click',()=>{pending=null;clearTimeout(timer);try{for(const key of Object.keys(localStorage))if(key.startsWith(prefix)||key==='mt-student-labs-v1')localStorage.removeItem(key);fingerprint=JSON.stringify(capture());message.textContent='Saved study drafts cleared. Current inputs remain on screen.';}catch{message.textContent='Could not clear local drafts.';}});
window.addEventListener('storage',e=>{if(e.key===preference){enabled.checked=e.newValue!=='false';if(!enabled.checked){pending=null;clearTimeout(timer);message.textContent='Automatic local saving is off.';}}if(e.key?.startsWith(prefix)&&e.newValue===null){pending=null;clearTimeout(timer);fingerprint=JSON.stringify(capture());}});
for(const event of ['input','change','click'])document.addEventListener(event,e=>{if(e.target.id==='module'||e.target.closest('.study-session,.diagram-tools,.lab-nav'))return;queueMicrotask(queue);});
document.addEventListener('mt-study-changed',queue);window.addEventListener('pagehide',()=>{queue();flush()});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){queue();flush()}});
window.addEventListener('hashchange',()=>{flush();load()});
window.MT_STUDY_DRAFT={capture,flush:()=>{queue();flush()},get key(){return prefix+currentId}};
load();
})();
