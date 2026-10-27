(function(){'use strict';const modules=[["lifting","Heavy lift & counterballast","examples.html#lifting"],["trim","Trim & draft changes","examples.html#trim"],["tank","Tank filling & free surface","examples.html#tank"],["pump","Pump & system curves","examples.html#pump"],["crank","Crankshaft deflection workshop","examples.html#crank"],["faults","Cooling-system fault tree","examples.html#faults"],['cargo','Loading & discharge','cargo.html'],['stability','GZ & free surface','labs.html#stability'],['controls','Signals & PID','labs.html#controls'],['engine','Engine & fuel','labs.html#engine'],['mollier','Mollier h–s chart','mollier.html'],['rlc','RLC resonance','explorers.html#rlc'],['heat','Heat exchanger','explorers.html#heat'],['current','Course & current','explorers.html#current'],['finance','Investment','explorers.html#finance']],frames=new Map(),nav=document.getElementById('module-list');
const groups=[['Ship & navigation',['cargo','stability','lifting','trim','tank','current']],['Machinery & energy',['engine','pump','heat','mollier']],['Electrical & control',['controls','rlc']],['Maintenance',['crank','faults']],['Economics',['finance']]];
const quick=document.getElementById('module-quick');
for(const [label,ids]of groups){const optgroup=document.createElement('optgroup');optgroup.label=label;for(const id of ids){const m=modules.find(m=>m[0]===id),o=document.createElement('option');o.value=id;o.textContent=m[1];optgroup.append(o)}quick.append(optgroup)}
quick.addEventListener('change',()=>{location.hash=quick.value});
for(const [label,ids]of groups){const h=document.createElement('h3');h.textContent=label;h.dataset.group=label;nav.append(h);for(const id of ids){const m=modules.find(m=>m[0]===id);if(!m)continue;const a=document.createElement('a');a.href='#'+id;a.textContent=m[1];a.dataset.group=label;nav.append(a)}}
function filter(){const q=document.getElementById('module-search').value.trim().toLowerCase();for(const a of nav.querySelectorAll('a'))a.hidden=!(a.textContent+' '+a.dataset.group).toLowerCase().includes(q);for(const h of nav.querySelectorAll('h3'))h.hidden=![...nav.querySelectorAll('a')].some(a=>a.dataset.group===h.dataset.group&&!a.hidden);document.getElementById('module-no-results').hidden=[...nav.querySelectorAll('a')].some(a=>!a.hidden)}
document.getElementById('module-search').addEventListener('input',filter);
const embedded = new WeakMap();
const listToggle = document.getElementById('toggle-module-list');
listToggle?.addEventListener('click', () => {
 const picker = document.getElementById('module-picker');
 const open = picker.hidden;
 picker.hidden = !open;
 picker.closest('.workspace').classList.toggle('module-list-open', open);
 listToggle.setAttribute('aria-expanded', String(open));
 listToggle.textContent = open ? 'Hide module list' : 'Show module list';
 window.dispatchEvent(new Event('resize'));
});
function decorateFrame(frame) {
 embedded.get(frame)?.disconnect();
 embedded.delete(frame);
 frame.removeAttribute('scrolling');
 try {
  const doc = frame.contentDocument, view = frame.contentWindow;
  if (!doc?.body || !doc.querySelector('main') || !doc.querySelector('#module,#cargo-form,#hs-chart,#stability')) return;
  if (!doc.getElementById('workspace-embed-style')) {
   const style = doc.createElement('style');
   style.id = 'workspace-embed-style';
   style.textContent = 'html,body{height:auto!important;min-height:0!important;overflow-y:hidden!important;scrollbar-width:none!important;scrollbar-gutter:auto!important;background:transparent!important}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0}header,.topbar,.lab-nav,.hero,.teaching-toolbar,footer{display:none!important}main{padding:0!important;max-width:none!important}.lab{scroll-margin-top:16px!important}#workspace-content{display:flow-root;min-width:0}';
   doc.head.append(style);
  }
  // A flow-root measures the natural content, independent of iframe viewport
  // height. Using document.scrollHeight would prevent a tall module shrinking.
  let content = doc.getElementById('workspace-content');
  if (!content) {
   content = doc.createElement('div');content.id = 'workspace-content';
   content.append(...doc.body.childNodes);doc.body.append(content);
  }
  for (const a of doc.querySelectorAll('a[href]')) {
   const u = new URL(a.getAttribute('href'), doc.baseURI);
   if (u.origin === location.origin && (/^\/students\/(?:index(?:\.html)?)?$/.test(u.pathname) || /^\/students\/(?:chapters|interactive)(?:\.html)?$/.test(u.pathname) || u.pathname === '/')) a.target = '_top';
  }
  const selector = doc.getElementById('module');
  if (selector) selector.closest('label').hidden = true;
  let pending = false;
  const schedule = () => {
   if (pending) return;pending = true;
   const measure = () => {
    pending = false;
    if (frame.hidden || !frame.getBoundingClientRect().width) return;
    const height = Math.ceil(Math.max(content.getBoundingClientRect().height, content.scrollHeight)) + 4;
    if (height > 4 && frame.style.height !== height + 'px') frame.style.height = height + 'px';
    frame.setAttribute('scrolling', 'no');
    frame.dataset.contentSized = 'true';
    if (view.scrollY) view.scrollTo(0, 0);
   };
   if (window.requestAnimationFrame) window.requestAnimationFrame(measure);
   else window.setTimeout(measure, 0);
  };
  const resize = view.ResizeObserver ? new view.ResizeObserver(schedule) : null;
  resize?.observe(content);
  const mutations = new view.MutationObserver(schedule);
  mutations.observe(content, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','open']});
  window.addEventListener('resize', schedule);
  embedded.set(frame, {schedule,disconnect(){resize?.disconnect();mutations.disconnect();window.removeEventListener('resize',schedule);}});
  view.MT_TEACHING_VIEW?.setPresentation(!!window.MT_TEACHING_VIEW?.presenting);
  schedule();
 } catch {
  // Never modify or bypass an Access/login page; the full-window link remains.
 }
}
function select(){const [id,title,url]=modules.find(m=>m[0]===location.hash.slice(1))||modules[0];quick.value=id;for(const a of nav.querySelectorAll('a')){if(a.hash==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}for(const f of frames.values())f.hidden=true;if(!frames.has(id)){const f=document.createElement('iframe');f.title=title+' interactive module';f.addEventListener('load',()=>decorateFrame(f));f.src=url;document.getElementById('frames').append(f);frames.set(id,f)}const active=frames.get(id);active.hidden=false;embedded.get(active)?.schedule();window.dispatchEvent(new Event('resize')); document.getElementById('selected-title').textContent=title;document.getElementById('standalone').href=url}window.addEventListener('hashchange',select);if(!location.hash){try{const last=localStorage.getItem('mt.study.last-module.v1');if(modules.some(m=>m[0]===last))history.replaceState(null,'','#'+last)}catch{}}select();window.addEventListener('hashchange',()=>{try{localStorage.setItem('mt.study.last-module.v1',quick.value)}catch{}});})();
