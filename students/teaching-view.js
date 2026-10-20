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
let presenting=false,previousScroll=0;
function setPresentation(on){presenting=!!on;if(presenting)previousScroll=window.scrollY||0;document.body.classList.toggle('presentation-view',presenting);toggle.textContent=presenting?'Exit presentation':'Presentation view';toggle.setAttribute('aria-pressed',String(presenting));
 for(const f of document.querySelectorAll('#frames iframe')){try{f.contentWindow.MT_TEACHING_VIEW?.setPresentation(presenting)}catch{}}
 if(typeof window.scrollTo==='function')window.scrollTo({top:presenting?0:previousScroll,behavior:'instant'});
}
toggle.addEventListener('click',()=>setPresentation(!presenting));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&presenting){setPresentation(false);toggle.focus()}});
window.MT_TEACHING_VIEW={setPresentation,get presenting(){return presenting}};
})();
