(() => {
'use strict';

const UKC_TITLES=new Set(['Dynamic UKC & squat','Draft / tide UKC']);
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function ddmParts(v,lat){
  const n=Number(v)||0,a=Math.abs(n),d=Math.floor(a),m=(a-d)*60;
  return{deg:d,min:m,hem:lat?(n<0?'S':'N'):(n<0?'W':'E')};
}
function ddmValue(prefix,lat){
  const d=Number($(`#${prefix}Deg`)?.value),m=Number($(`#${prefix}Min`)?.value),h=$(`#${prefix}Hem`)?.value;
  if(!Number.isFinite(d)||!Number.isFinite(m)||d<0||m<0||m>=60||d>(lat?90:180))return null;
  let v=d+m/60;if(h==='S'||h==='W')v=-v;return v;
}
function fmtDeg(d,lat){return String(d).padStart(lat?2:3,'0')}
function toDDM(v,lat,p=5){const h=lat?(v>=0?'N':'S'):(v>=0?'E':'W'),a=Math.abs(v),d=Math.floor(a),m=(a-d)*60;return `${fmtDeg(d,lat)}° ${m.toFixed(p)}′ ${h}`}
function toDMS(v,lat){const h=lat?(v>=0?'N':'S'):(v>=0?'E':'W'),a=Math.abs(v),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf),s=(mf-m)*60;return `${fmtDeg(d,lat)}° ${String(m).padStart(2,'0')}′ ${s.toFixed(2)}″ ${h}`}
function posEditor(prefix,label,lat,lon){
  const la=ddmParts(lat,true),lo=ddmParts(lon,false);
  return `<fieldset class="coord-group"><legend>${esc(label)}</legend><div class="coord-row"><span>Lat</span><label>°<input id="${prefix}LatDeg" type="number" min="0" max="90" step="1" value="${la.deg}"></label><label>Minutes<input id="${prefix}LatMin" type="number" min="0" max="59.99999" step="0.00001" value="${la.min.toFixed(5)}"></label><label>Hem<select id="${prefix}LatHem"><option${la.hem==='N'?' selected':''}>N</option><option${la.hem==='S'?' selected':''}>S</option></select></label></div><div class="coord-row"><span>Lon</span><label>°<input id="${prefix}LonDeg" type="number" min="0" max="180" step="1" value="${lo.deg}"></label><label>Minutes<input id="${prefix}LonMin" type="number" min="0" max="59.99999" step="0.00001" value="${lo.min.toFixed(5)}"></label><label>Hem<select id="${prefix}LonHem"><option${lo.hem==='E'?' selected':''}>E</option><option${lo.hem==='W'?' selected':''}>W</option></select></label></div></fieldset>`;
}
function readPos(prefix){const lat=ddmValue(`${prefix}Lat`,true),lon=ddmValue(`${prefix}Lon`,false);return lat==null||lon==null?null:{lat,lon}}
function hav(a,b){const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon),q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function bearing(a,b){const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon),y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);return(deg(Math.atan2(y,x))+360)%360}
function destination(a,brg,dNm){const R=3440.065,delta=dNm/R,th=rad(brg),p1=rad(a.lat),l1=rad(a.lon),p2=Math.asin(Math.sin(p1)*Math.cos(delta)+Math.cos(p1)*Math.sin(delta)*Math.cos(th)),l2=l1+Math.atan2(Math.sin(th)*Math.sin(delta)*Math.cos(p1),Math.cos(delta)-Math.sin(p1)*Math.sin(p2));return{lat:deg(p2),lon:((deg(l2)+540)%360)-180}}
function result(id,title,detail='',cls='') {const el=$(`#${id}`);if(!el)return;el.className=`result${cls?' '+cls:''}`;el.innerHTML=`<strong>${title}</strong>${detail?`<small>${detail}</small>`:''}`}

function enhanceBearing(){
  const card=$('.tool-card[data-tool-title="Bearing, distance & destination"]');if(!card||card.dataset.v854==='1')return;
  const old={lat1:Number($('#navLat1',card)?.value)||59.42,lon1:Number($('#navLon1',card)?.value)||10.48,lat2:Number($('#navLat2',card)?.value)||58.97,lon2:Number($('#navLon2',card)?.value)||5.73};
  const work=$('.tool-card-work',card);if(!work)return;
  work.innerHTML=`<div class="coord-ddm-grid">${posEditor('navA','Position A',old.lat1,old.lon1)}${posEditor('navB','Position B / destination',old.lat2,old.lon2)}</div><div class="actions"><button class="btn primary" id="calcBearing854">Calculate</button></div><div class="result" id="resBearing854"><span>Enter positions in degrees and decimal minutes.</span></div>`;
  $('#calcBearing854',card).onclick=()=>{const a=readPos('navA'),b=readPos('navB');if(!a||!b)return result('resBearing854','Check coordinate inputs.','Minutes must be between 0 and 59.99999.','caution');const d=hav(a,b),br=bearing(a,b),dest=destination(a,br,d);result('resBearing854',`${d.toFixed(3)} NM · ${br.toFixed(2)}°T`,`Destination ${toDDM(dest.lat,true)} · ${toDDM(dest.lon,false)}<br>Decimal ${dest.lat.toFixed(7)}, ${dest.lon.toFixed(7)}`)};
  card.dataset.v854='1';
}
function enhanceCoords(){
  const card=$('.tool-card[data-tool-title="Coordinate toolbox"]');if(!card||card.dataset.v854==='1')return;
  const lat=Number($('#coordLat',card)?.value)||59.4213,lon=Number($('#coordLon',card)?.value)||10.4832,work=$('.tool-card-work',card);if(!work)return;
  work.innerHTML=`<div class="coord-ddm-grid single">${posEditor('coord','Coordinate',lat,lon)}</div><div class="actions"><button class="btn primary" id="calcCoords854">Convert</button></div><div class="result" id="resCoords854"><span>Enter degrees and decimal minutes.</span></div>`;
  $('#calcCoords854',card).onclick=()=>{const p=readPos('coord');if(!p)return result('resCoords854','Check coordinate inputs.','Minutes must be between 0 and 59.99999.','caution');result('resCoords854',`${toDDM(p.lat,true)} · ${toDDM(p.lon,false)}`,`Decimal ${p.lat.toFixed(7)}, ${p.lon.toFixed(7)}<br>DMS ${toDMS(p.lat,true)} · ${toDMS(p.lon,false)}`)};
  card.dataset.v854='1';
}
function cleanUkc(){
  $$('.tool-card').forEach(card=>{if(UKC_TITLES.has(card.dataset.toolTitle))card.remove()});
  const ukcInput=$('#pUkc');if(ukcInput?.closest('label'))ukcInput.closest('label').hidden=true;
  $$('.source-item').forEach(x=>{if(/\bmin\s+ukc\b/i.test(x.textContent||''))x.remove()});
  $$('[data-tool-target]').forEach(x=>{if(/UKC/i.test(x.dataset.toolTarget||''))x.remove()});
  const vessel=$('#vessel-calcs');if(vessel){const intro=$('.page-title p',vessel)||$('header p',vessel);if(intro&&/under-keel|UKC|squat/i.test(intro.textContent||''))intro.textContent='Vessel draft, allowance, anchoring and clearance helpers.'}
  $$('.home-category-v8 button').forEach(b=>{if((b.textContent||'').includes('Vessel Calculations')){const s=$('small',b);if(s)s.textContent='Draft, allowances, anchoring and clearance helpers'}});
}
function cleanSearch(){for(const box of ['#searchResults','#homeToolResults']){const root=$(box);if(!root)continue;$$('[data-tool-target]',root).forEach(x=>{if(/UKC/i.test(x.dataset.toolTarget||x.textContent||''))x.remove()})}}
function enhance(){enhanceBearing();enhanceCoords();cleanUkc();cleanSearch()}
function schedule(){setTimeout(enhance,0);setTimeout(enhance,80)}

const style=document.createElement('style');style.textContent=`.coord-ddm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.coord-ddm-grid.single{grid-template-columns:minmax(0,1fr)}.coord-group{border:1px solid var(--line,#274257);border-radius:10px;padding:10px 12px;margin:0}.coord-group legend{padding:0 6px;font-weight:700}.coord-row{display:grid;grid-template-columns:36px minmax(72px,.7fr) minmax(120px,1.4fr) minmax(76px,.7fr);gap:8px;align-items:end;margin-top:8px}.coord-row>span{font-weight:700;padding-bottom:10px}.coord-row label{font-size:.78rem}.coord-row input,.coord-row select{width:100%}@media(max-width:760px){.coord-ddm-grid{grid-template-columns:1fr}.coord-row{grid-template-columns:34px 70px minmax(108px,1fr) 70px;gap:6px}}`;
document.head.appendChild(style);

document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-go],[data-tool-target]'))schedule()},true);
for(const id of ['globalSearch','homeToolSearch'])document.addEventListener('input',e=>{if(e.target.id===id)setTimeout(cleanSearch,0)},true);
schedule();
})();
