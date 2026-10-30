/* View-only SVG exploration. Numerical models and exported full diagrams stay unchanged. */
(function(){'use strict';
function mount(svg){
 if(svg.dataset.studyOriginalViewBox)return;
 const original=svg.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
 if(original.length!==4||original.some(x=>!Number.isFinite(x))||original[2]<=0||original[3]<=0)return;
 svg.dataset.studyOriginalViewBox=original.join(' ');svg.setAttribute('tabindex','0');
 let box=[...original],enabled=false,dragged=false,gesture=null;
 const pointers=new Map(),bar=document.createElement('div');bar.className='diagram-tools';bar.setAttribute('role','group');bar.setAttribute('aria-label','Diagram view controls');
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);bar.append(b);return b};
 const scale=()=>original[2]/box[2];
 const zoomIn=button('Zoom +',()=>zoom(1.5)),zoomOut=button('Zoom −',()=>zoom(1/1.5));
 button('Reset view',reset);
 const explore=button('Pan / pinch',()=>setEnabled(!enabled));explore.setAttribute('aria-pressed','false');
 const label=document.createElement('span');label.id='diagram-view-'+(svg.id||Math.random().toString(36).slice(2));bar.append(label);svg.setAttribute('aria-describedby',[svg.getAttribute('aria-describedby'),label.id].filter(Boolean).join(' '));svg.before(bar);
 // SVG hidden state must also hide its sibling controls.
 const visibility=()=>{bar.hidden=svg.hasAttribute('hidden');};visibility();
 new MutationObserver(visibility).observe(svg,{attributes:true,attributeFilter:['hidden']});
 function render(){
  box[2]=Math.max(original[2]/8,Math.min(original[2],box[2]));box[3]=box[2]*original[3]/original[2];
  box[0]=Math.max(original[0],Math.min(original[0]+original[2]-box[2],box[0]));box[1]=Math.max(original[1],Math.min(original[1]+original[3]-box[3],box[1]));
  svg.setAttribute('viewBox',box.join(' '));label.textContent=Math.round(scale()*100)+'%'+(enabled?' · Drag or pinch to explore; Escape exits pan mode.':' · Page scrolling enabled.');zoomIn.disabled=scale()>=8-1e-8;zoomOut.disabled=scale()<=1+1e-8;
 }
 function point(x,y){const matrix=svg.getScreenCTM();if(!matrix)return [box[0]+box[2]/2,box[1]+box[3]/2];const p=svg.createSVGPoint();p.x=x;p.y=y;const z=p.matrixTransform(matrix.inverse());return [z.x,z.y]}
 function zoom(factor,anchor=[box[0]+box[2]/2,box[1]+box[3]/2]){if(!Number.isFinite(factor)||factor<=0||!Array.isArray(anchor)||anchor.length!==2||anchor.some(x=>!Number.isFinite(x)))throw RangeError('Finite positive zoom and a finite diagram anchor are required.');const next=Math.max(1,Math.min(8,scale()*factor)),w=original[2]/next,h=original[3]/next,rx=(anchor[0]-box[0])/box[2],ry=(anchor[1]-box[1])/box[3];box=[anchor[0]-rx*w,anchor[1]-ry*h,w,h];render()}
 function setEnabled(on){enabled=!!on;pointers.clear();gesture=null;svg.classList.toggle('study-exploring',enabled);explore.setAttribute('aria-pressed',String(enabled));render()}
 function reset(){box=[...original];dragged=false;setEnabled(false)}
 svg.addEventListener('keydown',e=>{if(e.key==='Escape'&&enabled){e.stopPropagation();setEnabled(false);return}if(['+','=','-','0'].includes(e.key)){e.preventDefault();e.key==='0'?reset():zoom(e.key==='-'?1/1.5:1.5)}else if(enabled&&e.key.startsWith('Arrow')){e.preventDefault();box[0]+=(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*box[2]*.1;box[1]+=(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*box[3]*.1;render()}});
 const metrics=()=>{const p=[...pointers.values()];if(p.length===1)return {x:p[0].x,y:p[0].y,d:0};return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}};
 svg.addEventListener('pointerdown',e=>{if(!enabled||e.button>0)return;e.preventDefault();if(pointers.size===0)dragged=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);gesture=metrics()});
 svg.addEventListener('pointermove',e=>{if(!enabled||!pointers.has(e.pointerId))return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=metrics();if(gesture){const dx=m.x-gesture.x,dy=m.y-gesture.y;if(Math.abs(dx)+Math.abs(dy)>2||Math.abs(m.d-gesture.d)>2)dragged=true;const matrix=svg.getScreenCTM();if(matrix){box[0]-=dx/matrix.a;box[1]-=dy/matrix.d;}if(m.d>0&&gesture.d>0)zoom(m.d/gesture.d,point(m.x,m.y));else render()}gesture=m});
 const end=e=>{pointers.delete(e.pointerId);gesture=pointers.size?metrics():null};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
 svg.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false}},true);
 window.addEventListener('hashchange',reset);render();
 svg.MT_DIAGRAM_VIEW={reset,zoom, get scale(){return scale()},get enabled(){return enabled}};
}
for(const svg of document.querySelectorAll('main svg[viewBox]'))mount(svg);
})();
