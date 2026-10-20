/* Shared teaching layouts. Existing forms and chart nodes retain their state. */
(function(){'use strict';
const main=document.querySelector('main');if(!main)return;
const narrow=window.matchMedia?window.matchMedia('(max-width:800px)'):{matches:false};
const wrappers=[];
function wrapControls(node,grid,result){
 const details=document.createElement('details'),summary=document.createElement('summary');details.className='teaching-inputs';summary.textContent='Adjust inputs';details.append(summary);node.before(details);details.append(node);details.open=!narrow.matches;wrappers.push(details);
 if(grid){grid.classList.add('teaching-grid');result.classList.add('teaching-results')}
 return details;
}
for(const grid of document.querySelectorAll('.two-col')){const form=[...grid.children].find(x=>x.tagName==='FORM'),result=[...grid.children].find(x=>x!==form);if(form&&result)wrapControls(form,grid,result)}
const controls=document.querySelector('.layout>.controls'),plot=document.querySelector('.layout>.plot-card');if(controls&&plot)wrapControls(controls,controls.parentElement,plot);
const cargo=document.getElementById('cargo-form');if(cargo){const d=wrapControls(cargo),results=document.getElementById('results')?.closest('section');if(results){results.classList.add('teaching-results');d.before(results)}const presets=document.getElementById('preset')?.closest('section');if(presets)d.insertBefore(presets,cargo)}
if(narrow.addEventListener)narrow.addEventListener('change',e=>{for(const d of wrappers)d.open=!e.matches});
const toolbar=document.createElement('div');toolbar.className='teaching-toolbar';
const toggle=document.createElement('button');toggle.type='button';toggle.id='presentation-toggle';toggle.setAttribute('aria-pressed','false');toggle.textContent='Presentation view';toolbar.append(toggle);
const hint=document.createElement('span');hint.textContent='Larger diagrams for teaching';toolbar.append(hint);main.prepend(toolbar);
let presenting=false,previousScroll=0,layoutPending=false;
// Size the whole SVG viewport, including its axes. Preserve the viewBox aspect
// ratio instead of letting a wide monitor turn the diagram into a tall poster.
function fitPresentation(){
 layoutPending=false;if(!presenting)return;
 for(const f of document.querySelectorAll('#frames iframe:not([hidden])')){
  const top=f.getBoundingClientRect().top+(window.scrollY||0);
  f.style.height=Math.max(240,window.innerHeight-top-16)+'px';
 }
 for(const value of document.querySelectorAll('.metric strong'))value.classList.toggle('teaching-text-result',value.textContent.trim().length>32);
 for(const svg of document.querySelectorAll('.teaching-results svg')){
  if(!svg.getBoundingClientRect().width)continue;
  const box=svg.viewBox?.baseVal;if(!box?.width||!box.height)continue;
  const top=svg.getBoundingClientRect().top+(window.scrollY||0);
  const legend=svg.nextElementSibling?.classList.contains('legend')?svg.nextElementSibling.getBoundingClientRect().height:0;
  const available=window.innerHeight-top-legend-32;
  const height=Math.max(180,Math.min(svg.getBoundingClientRect().width*box.height/box.width,available));
  const value=Math.round(height)+'px';if(svg.style.getPropertyValue('--teaching-chart-height')!==value)svg.style.setProperty('--teaching-chart-height',value);
 }
}
function scheduleFit(){if(!layoutPending){layoutPending=true;requestAnimationFrame(fitPresentation)}}
window.addEventListener('resize',scheduleFit);
new MutationObserver(scheduleFit).observe(main,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
if(window.ResizeObserver)new ResizeObserver(scheduleFit).observe(main);

function setPresentation(on){if(!!on===presenting){scheduleFit();return}presenting=!!on;if(presenting)previousScroll=window.scrollY||0;document.body.classList.toggle('presentation-view',presenting);toggle.textContent=presenting?'Exit presentation':'Presentation view';toggle.setAttribute('aria-pressed',String(presenting));
 for(const f of document.querySelectorAll('#frames iframe')){try{f.contentWindow.MT_TEACHING_VIEW?.setPresentation(presenting)}catch{}}
 if(!presenting)for(const f of document.querySelectorAll('#frames iframe'))f.style.removeProperty('height');
 scheduleFit();
 if(typeof window.scrollTo==='function')window.scrollTo({top:presenting?0:previousScroll,behavior:'instant'});
}
toggle.addEventListener('click',()=>setPresentation(!presenting));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&presenting){let host;try{host=window.parent!==window&&window.parent.MT_TEACHING_VIEW}catch{}if(host?.presenting)host.setPresentation(false);else setPresentation(false);toggle.focus()}});
window.MT_TEACHING_VIEW={setPresentation,get presenting(){return presenting}};
})();
