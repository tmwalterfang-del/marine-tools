(() => {
'use strict';

const VERSION='8.5.5-ui-cleanup-1';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function ddmParts(v,lat){const n=Number(v)||0,a=Math.abs(n),d=Math.floor(a),m=(a-d)*60;return{deg:d,min:m,hem:lat?(n<0?'S':'N'):(n<0?'W':'E')}}
function ddmValue(prefix,lat){const d=Number($(`#${prefix}Deg`)?.value),m=Number($(`#${prefix}Min`)?.value),h=$(`#${prefix}Hem`)?.value;if(!Number.isFinite(d)||!Number.isFinite(m)||d<0||m<0||m>=60||d>(lat?90:180))return null;let v=d+m/60;if(h==='S'||h==='W')v=-v;return v}
function fmtDeg(d,lat){return String(d).padStart(lat?2:3,'0')}
function toDDM(v,lat,p=5){if(!Number.isFinite(Number(v)))return '—';const n=Number(v),h=lat?(n>=0?'N':'S'):(n>=0?'E':'W'),a=Math.abs(n),d=Math.floor(a),m=(a-d)*60;return `${fmtDeg(d,lat)}° ${m.toFixed(p)}′ ${h}`}
function toDMS(v,lat){if(!Number.isFinite(Number(v)))return '—';const n=Number(v),h=lat?(n>=0?'N':'S'):(n>=0?'E':'W'),a=Math.abs(n),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf),s=(mf-m)*60;return `${fmtDeg(d,lat)}° ${String(m).padStart(2,'0')}′ ${s.toFixed(2)}″ ${h}`}
function posEditor(prefix,label,lat,lon){const la=ddmParts(lat,true),lo=ddmParts(lon,false);return `<fieldset class="coord-group"><legend>${esc(label)}</legend><div class="coord-row"><span>Lat</span><label>°<input id="${prefix}LatDeg" type="number" min="0" max="90" step="1" value="${la.deg}"></label><label>Minutes<input id="${prefix}LatMin" type="number" min="0" max="59.99999" step="0.00001" value="${la.min.toFixed(5)}"></label><label>Hem<select id="${prefix}LatHem"><option${la.hem==='N'?' selected':''}>N</option><option${la.hem==='S'?' selected':''}>S</option></select></label></div><div class="coord-row"><span>Lon</span><label>°<input id="${prefix}LonDeg" type="number" min="0" max="180" step="1" value="${lo.deg}"></label><label>Minutes<input id="${prefix}LonMin" type="number" min="0" max="59.99999" step="0.00001" value="${lo.min.toFixed(5)}"></label><label>Hem<select id="${prefix}LonHem"><option${lo.hem==='E'?' selected':''}>E</option><option${lo.hem==='W'?' selected':''}>W</option></select></label></div></fieldset>`}
function readPos(prefix){const lat=ddmValue(`${prefix}Lat`,true),lon=ddmValue(`${prefix}Lon`,false);return lat==null||lon==null?null:{lat,lon}}
function setEditor(prefix,lat,lon){const la=ddmParts(lat,true),lo=ddmParts(lon,false);const values={LatDeg:la.deg,LatMin:la.min.toFixed(5),LatHem:la.hem,LonDeg:lo.deg,LonMin:lo.min.toFixed(5),LonHem:lo.hem};for(const [k,v] of Object.entries(values)){const el=$(`#${prefix}${k}`);if(el)el.value=v}}
function syncPair(prefix,latId,lonId){const p=readPos(prefix);if(!p)return false;const la=$(`#${latId}`),lo=$(`#${lonId}`);if(la){la.value=p.lat.toFixed(7);la.dispatchEvent(new Event('change',{bubbles:true}))}if(lo){lo.value=p.lon.toFixed(7);lo.dispatchEvent(new Event('change',{bubbles:true}))}return true}
function bindEditor(prefix,latId,lonId){for(const suffix of ['LatDeg','LatMin','LatHem','LonDeg','LonMin','LonHem'])$(`#${prefix}${suffix}`)?.addEventListener('change',()=>syncPair(prefix,latId,lonId))}
function hav(a,b){const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon),q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function bearing(a,b){const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon),y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);return(deg(Math.atan2(y,x))+360)%360}
function destination(a,brg,dNm){const R=3440.065,delta=dNm/R,th=rad(brg),p1=rad(a.lat),l1=rad(a.lon),p2=Math.asin(Math.sin(p1)*Math.cos(delta)+Math.cos(p1)*Math.sin(delta)*Math.cos(th)),l2=l1+Math.atan2(Math.sin(th)*Math.sin(delta)*Math.cos(p1),Math.cos(delta)-Math.sin(p1)*Math.sin(p2));return{lat:deg(p2),lon:((deg(l2)+540)%360)-180}}
function result(id,title,detail='',cls=''){const el=$(`#${id}`);if(!el)return;el.className=`result${cls?' '+cls:''}`;el.innerHTML=`<strong>${title}</strong>${detail?`<small>${detail}</small>`:''}`}

function replaceFieldsWithDdm(card,pairs){if(!card||card.dataset.ddm855==='1')return false;const fields=$('.fields',card);if(!fields)return false;const wrap=document.createElement('div');wrap.className=`coord-ddm-grid${pairs.length===1?' single':''}`;wrap.innerHTML=pairs.map(x=>posEditor(x.prefix,x.label,x.lat,x.lon)).join('');fields.hidden=true;fields.insertAdjacentElement('beforebegin',wrap);for(const x of pairs)bindEditor(x.prefix,x.latId,x.lonId);card.dataset.ddm855='1';return true}

function enhanceBearing(){const card=$('.tool-card[data-tool-title="Bearing, distance & destination"]');if(!card||card.dataset.v855==='1')return;const old={lat1:Number($('#navLat1',card)?.value)||59.42,lon1:Number($('#navLon1',card)?.value)||10.48,lat2:Number($('#navLat2',card)?.value)||58.97,lon2:Number($('#navLon2',card)?.value)||5.73};const work=$('.tool-card-work',card);if(!work)return;work.innerHTML=`<div class="coord-ddm-grid">${posEditor('navA','Position A',old.lat1,old.lon1)}${posEditor('navB','Position B / destination',old.lat2,old.lon2)}</div><div class="actions"><button class="btn primary" id="calcBearing855">Calculate</button></div><div class="result" id="resBearing855"><span>Enter positions in degrees and decimal minutes.</span></div>`;$('#calcBearing855',card).onclick=()=>{const a=readPos('navA'),b=readPos('navB');if(!a||!b)return result('resBearing855','Check coordinate inputs.','Minutes must be between 0 and 59.99999.','caution');const d=hav(a,b),br=bearing(a,b),dest=destination(a,br,d);result('resBearing855',`${d.toFixed(3)} NM · ${br.toFixed(2)}°T`,`Destination ${toDDM(dest.lat,true)} · ${toDDM(dest.lon,false)}<br>Decimal ${dest.lat.toFixed(7)}, ${dest.lon.toFixed(7)}`)};card.dataset.v855='1'}
function enhanceCoords(){const card=$('.tool-card[data-tool-title="Coordinate toolbox"]');if(!card||card.dataset.v855==='1')return;const lat=Number($('#coordLat',card)?.value)||59.4213,lon=Number($('#coordLon',card)?.value)||10.4832,work=$('.tool-card-work',card);if(!work)return;work.innerHTML=`<div class="coord-ddm-grid single">${posEditor('coord','Coordinate',lat,lon)}</div><div class="actions"><button class="btn primary" id="calcCoords855">Convert</button></div><div class="result" id="resCoords855"><span>Enter degrees and decimal minutes.</span></div>`;$('#calcCoords855',card).onclick=()=>{const p=readPos('coord');if(!p)return result('resCoords855','Check coordinate inputs.','Minutes must be between 0 and 59.99999.','caution');result('resCoords855',`${toDDM(p.lat,true)} · ${toDDM(p.lon,false)}`,`Decimal ${p.lat.toFixed(7)}, ${p.lon.toFixed(7)}<br>DMS ${toDMS(p.lat,true)} · ${toDMS(p.lon,false)}`)};card.dataset.v855='1'}
function enhanceClosest(){const card=$('.tool-card[data-tool-title="Closest point on active route"]');if(!card)return;const lat=Number($('#nearLat',card)?.value)||59.42,lon=Number($('#nearLon',card)?.value)||10.48;if(replaceFieldsWithDdm(card,[{prefix:'near',label:'Position',lat,lon,latId:'nearLat',lonId:'nearLon'}]))syncPair('near','nearLat','nearLon')}
function enhanceGc(){const card=$('.tool-card[data-tool-title="Great circle vs rhumb line"]');if(!card)return;const lat1=Number($('#gcLat1',card)?.value)||59.42,lon1=Number($('#gcLon1',card)?.value)||10.48,lat2=Number($('#gcLat2',card)?.value)||58.97,lon2=Number($('#gcLon2',card)?.value)||5.73;if(replaceFieldsWithDdm(card,[{prefix:'gcA',label:'Position A',lat:lat1,lon:lon1,latId:'gcLat1',lonId:'gcLon1'},{prefix:'gcB',label:'Position B',lat:lat2,lon:lon2,latId:'gcLat2',lonId:'gcLon2'}])){syncPair('gcA','gcLat1','gcLon1');syncPair('gcB','gcLat2','gcLon2')}}

function enhanceWeather(){const panel=$('#weather .weather-live-panel');if(!panel)return;const latEl=$('#wxLat'),lonEl=$('#wxLon');if(latEl&&lonEl&&!$('#wxDdmEditor')){const fields=latEl.closest('.fields');if(fields){const wrap=document.createElement('div');wrap.id='wxDdmEditor';wrap.className='coord-ddm-grid single';wrap.innerHTML=posEditor('wxPos','Forecast position',Number(latEl.value)||59.42,Number(lonEl.value)||10.48);fields.hidden=true;fields.insertAdjacentElement('beforebegin',wrap);bindEditor('wxPos','wxLat','wxLon')}}const head=$('.panel-head small',panel);if(head)head.textContent='MET Norway + NOAA/NCEP GFS-Wave';const coverage=$$('.coverage-strip > div',panel);if(coverage[1])coverage[1].innerHTML='<b>MARINE / WAVES</b><span>MET Norway Oceanforecast is used where available. NOAA/NCEP GFS-Wave provides a free global wave fallback. Sea temperature remains regional where supplied.</span>';const pageCopy=$('#weather .page-title p');if(pageCopy)pageCopy.textContent='Global point weather from MET Norway, regional marine data where available, and NOAA/NCEP GFS-Wave as a free global wave fallback.';$$('#weather .weather-summary .weather-metric').forEach((x,i)=>{if(i===2)x.remove()});$('#weather .weather-forecast-table')?.classList.add('no-current-col');$$('#weather .ww-current').forEach(x=>{x.value='0';const l=x.closest('label');if(l)l.hidden=true});const maxCur=$('#wwCur');if(maxCur){maxCur.value='999';const l=maxCur.closest('label');if(l)l.hidden=true}}

function syncWeatherDdm(){const lat=Number($('#wxLat')?.value),lon=Number($('#wxLon')?.value);if(Number.isFinite(lat)&&Number.isFinite(lon)&&$('#wxDdmEditor'))setEditor('wxPos',lat,lon)}

function cleanUkc(){const retired=['Dynamic UKC & squat','Draft / tide UKC'];$$('.tool-card').forEach(card=>{if(retired.includes(card.dataset.toolTitle))card.remove()});const ukc=$('#pUkc');if(ukc?.closest('label'))ukc.closest('label').remove();$$('[data-tool-target]').forEach(x=>{if(/UKC/i.test(x.dataset.toolTarget||x.textContent||''))x.remove()});$$('.source-item').forEach(x=>{if(/\bmin\s+ukc\b/i.test(x.textContent||''))x.remove()});$$('.home-popular-grid button').forEach(x=>{if(/UKC/i.test(x.textContent||''))x.remove()});$$('.home-category-v8 button').forEach(b=>{if((b.textContent||'').includes('Vessel Calculations')){const s=$('small',b);if(s)s.textContent='Draft, allowances, anchoring and clearance helpers'}});const vesselCopy=$('#vessel-calcs .page-title p');if(vesselCopy&&/UKC|under-keel|squat/i.test(vesselCopy.textContent||''))vesselCopy.textContent='Draft, allowances, anchoring and clearance helpers.'}
function cleanSearch(){for(const box of ['#searchResults','#homeToolResults']){const root=$(box);if(!root)continue;$$('[data-tool-target]',root).forEach(x=>{if(/UKC/i.test(x.dataset.toolTarget||x.textContent||''))x.remove()})}}

function updateAisCopy(){
  const live=$('#live-experimental');
  if(live){
    const cards=$$('.experimental-card',live);
    const aisCard=cards.find(c=>/AIS context/i.test(c.textContent||''));
    if(aisCard){
      const p=$('p',aisCard);if(p)p.textContent='AIS uses open-license sources where available, with BarentsWatch as fallback/coverage where relevant. Coverage varies by area and source.';
      const source=$$('.source-item',aisCard).find(x=>/^Source/i.test(x.textContent||''));
      if(source){const strong=$('strong,b',source);if(strong)strong.textContent='Open AIS sources + BarentsWatch'}
    }
    const routeCard=cards.find(c=>/Route Intelligence/i.test(c.textContent||''));
    if(routeCard){const p=$('p',routeCard);if(p)p.textContent='Route context using user-entered vessel limits, MET Norway / NOAA forecast data and available open AIS / BarentsWatch sources. This is a planning experiment, not approved navigation equipment or decision support.'}
  }
  const route=$('#route-intelligence');
  if(route){const p=$('.page-title p',route);if(p)p.textContent='Experimental planning context combining your active route, vessel limits, MET Norway / NOAA forecast data and available open AIS / BarentsWatch sources. It is not approved navigation information.'}
}

function renderRouteDdm(){const map=$('#riMap');if(!map)return;let list=$('#mtRouteDdmList');if(!list){list=document.createElement('div');list.id='mtRouteDdmList';list.className='route-ddm-list';map.insertAdjacentElement('afterend',list)}let route=[];try{route=JSON.parse(localStorage.getItem('mt.route')||'[]')||[]}catch{}list.innerHTML=route.length?`<strong>Waypoints</strong>${route.map((p,i)=>`<span><b>${esc(p.name||`WP${i+1}`)}</b> ${toDDM(Number(p.lat),true)} · ${toDDM(Number(p.lon),false)}</span>`).join('')}`:'<span class="helper">No waypoints added.</span>'}

function enhance(){enhanceBearing();enhanceCoords();enhanceClosest();enhanceGc();enhanceWeather();cleanUkc();cleanSearch();updateAisCopy();renderRouteDdm()}
function schedule(){setTimeout(enhance,0);setTimeout(enhance,100)}

const style=document.createElement('style');style.textContent=`
.coord-ddm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:8px 0 12px}.coord-ddm-grid.single{grid-template-columns:minmax(0,1fr)}.coord-group{border:1px solid var(--line,#274257);border-radius:10px;padding:10px 12px;margin:0}.coord-group legend{padding:0 6px;font-weight:700}.coord-row{display:grid;grid-template-columns:36px minmax(72px,.7fr) minmax(120px,1.4fr) minmax(76px,.7fr);gap:8px;align-items:end;margin-top:8px}.coord-row>span{font-weight:700;padding-bottom:10px}.coord-row label{font-size:.78rem}.coord-row input,.coord-row select{width:100%}
#weather .weather-forecast-table.no-current-col th:nth-child(4),#weather .weather-forecast-table.no-current-col td:nth-child(4){display:none!important}.route-ddm-list{display:grid;gap:4px;margin-top:8px;padding:10px 12px;border:1px solid rgba(120,160,190,.22);border-radius:10px}.route-ddm-list span{font-size:.82rem}.route-ddm-list b{display:inline-block;min-width:42px}
@media(max-width:760px){.coord-ddm-grid{grid-template-columns:1fr}.coord-row{grid-template-columns:34px 70px minmax(108px,1fr) 70px;gap:6px}}
`;
document.head.appendChild(style);

document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-go],[data-tool-target],#addWindowRow,#undoWp,#clearRoute,#riMap'))schedule()},true);
document.addEventListener('input',e=>{if(e.target.id==='globalSearch'||e.target.id==='homeToolSearch')setTimeout(cleanSearch,0)},true);
window.addEventListener('mt:weather-position',e=>{const d=e.detail||{};if(Number.isFinite(Number(d.lat))&&Number.isFinite(Number(d.lon))&&$('#wxDdmEditor'))setEditor('wxPos',Number(d.lat),Number(d.lon))});
window.addEventListener('pageshow',schedule);
window.__marineToolsUiEnhancements855={version:VERSION,enabled:true,refresh:schedule,syncWeather:syncWeatherDdm};
schedule();
})();
