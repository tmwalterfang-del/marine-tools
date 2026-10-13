(() => {
'use strict';

const CURVE_KEY='mt.voyageConsumptionCurve.v1';
const LAST_VOYAGE_KEY='mt.voyageEstimate.last';
const IMO_FACTORS={
  mdo:{label:'Diesel / Gas Oil',factor:3.206},
  lfo:{label:'Light Fuel Oil (LFO)',factor:3.151},
  hfo:{label:'Heavy Fuel Oil (HFO)',factor:3.114},
  lpgp:{label:'LPG · Propane',factor:3.000},
  lpgb:{label:'LPG · Butane',factor:3.030},
  lng:{label:'LNG',factor:2.750},
  methanol:{label:'Methanol',factor:1.375},
  ethanol:{label:'Ethanol',factor:1.913}
};

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const num=(v)=>Number(v);
const ok=(v)=>Number.isFinite(Number(v));
const fmt=(v,d=1)=>ok(v)?Number(v).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hoursText=h=>!ok(h)?'—':h>=24?(h/24).toFixed(1)+' d':h.toFixed(1)+' h';

function readJson(key,fallback=null){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function loadProfile(){
  const legacy=readJson('mt.profile',{})||{},v2=readJson('mt.profile.v2',{})||{};
  const speed=num(legacy.serviceSpeed??v2?.vessel?.serviceSpeed),draft=num(legacy.draft??v2?.vessel?.draft),fuelDay=num(legacy.fuelDay??v2?.operational?.fuelDay);
  return{speed:speed>0?speed:null,draft:draft>0?draft:null,fuelDay:fuelDay>0?fuelDay:null,name:String(legacy.name??v2?.vessel?.name??'').trim()};
}
function loadCurve(){
  const raw=readJson(CURVE_KEY,[]);
  if(!Array.isArray(raw))return[];
  return raw.map(x=>({speed:num(x.speed),fuelDay:num(x.fuelDay)}))
    .filter(x=>x.speed>0&&x.fuelDay>=0)
    .sort((a,b)=>a.speed-b.speed)
    .filter((x,i,a)=>!i||Math.abs(x.speed-a[i-1].speed)>.0001);
}
function curveRate(speed){
  const pts=loadCurve(),s=num(speed);
  if(!(s>0)||pts.length<2)return null;
  const exact=pts.find(p=>Math.abs(p.speed-s)<.0001);
  if(exact)return{rate:exact.fuelDay,source:'saved curve · exact point'};
  if(s<pts[0].speed||s>pts[pts.length-1].speed)return null;
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i];
    if(s>=a.speed&&s<=b.speed){
      const t=(s-a.speed)/(b.speed-a.speed);
      return{rate:a.fuelDay+t*(b.fuelDay-a.fuelDay),source:'saved curve · linear interpolation'};
    }
  }
  return null;
}
function shared(){
  return{
    distance:num($('#vpdDistance')?.value),
    speed:num($('#vpdSpeed')?.value),
    fuelDay:num($('#vpdFuelDay')?.value)
  };
}
function effectiveRate(speed=shared().speed){
  const curve=curveRate(speed);
  if(curve)return curve;
  const manual=num($('#vpdFuelDay')?.value);
  return manual>=0&&ok(manual)?{rate:manual,source:'manual / Vessel Profile fuel-day value'}:null;
}
function setResult(id,main,sub='',cls=''){
  const el=$('#'+id);if(!el)return;
  el.className='result '+cls;
  el.innerHTML='<strong>'+esc(main)+'</strong>'+(sub?'<small>'+esc(sub)+'</small>':'');
}
function setSharedStatus(text,kind=''){
  const el=$('#vpdBasisStatus');if(!el)return;
  el.className='vpd-basis-status '+kind;el.textContent=text;
}
function useProfile(){
  const p=loadProfile();
  if(p.speed)$('#vpdSpeed').value=p.speed;
  if(p.fuelDay!=null)$('#vpdFuelDay').value=p.fuelDay;
  setSharedStatus(p.speed||p.fuelDay?'Loaded available Vessel Profile values.':'No saved speed/fuel-day value found in Vessel Profile.',p.speed||p.fuelDay?'ok':'warn');
  refreshCurveHint();
}
function useLastVoyage(){
  const last=readJson(LAST_VOYAGE_KEY,null);
  if(!last||!(num(last.distanceNm)>0)){
    setSharedStatus('No saved Voyage Estimate result found in this browser.','warn');return;
  }
  $('#vpdDistance').value=num(last.distanceNm).toFixed(1);
  if(num(last.speedKnots)>0)$('#vpdSpeed').value=num(last.speedKnots).toFixed(1);
  setSharedStatus('Loaded '+String(last.from||'voyage')+' → '+String(last.to||'destination')+' from the last Voyage Estimate.','ok');
  refreshCurveHint();
}
function validateBasis(){
  const b=shared();
  if(!(b.distance>0))return{error:'Enter a voyage distance above 0 NM.'};
  if(!(b.speed>0&&b.speed<=40))return{error:'Enter a planned speed from above 0 to 40 kn.'};
  return b;
}
function bunker(){
  const b=validateBasis();if(b.error)return setResult('vpdBunkerResult',b.error,'','caution');
  const rate=effectiveRate(b.speed);
  if(!rate||!(rate.rate>=0))return setResult('vpdBunkerResult','Enter daily fuel consumption or save a usable consumption curve.','','caution');
  const rob=num($('#vpdRob').value),arrival=num($('#vpdArrivalRob').value),reserve=num($('#vpdReservePct').value);
  if([rob,arrival,reserve].some(v=>!ok(v)||v<0))return setResult('vpdBunkerResult','Check ROB, arrival ROB and reserve inputs.','','caution');
  const h=b.distance/b.speed,cons=rate.rate*h/24,reserveVol=cons*reserve/100,total=cons+reserveVol+arrival,stem=Math.max(0,total-rob);
  setResult('vpdBunkerResult',fmt(stem,1)+' m³ estimated bunker requirement',
    'Voyage '+fmt(cons,1)+' m³ + reserve '+fmt(reserveVol,1)+' m³ + arrival ROB '+fmt(arrival,1)+' m³ − current ROB '+fmt(rob,1)+' m³ · '+rate.source,
    stem>0?'':'ok');
}
function parseSpeeds(){
  return String($('#vpdScenarioSpeeds')?.value||'').split(/[;,\s]+/).map(num).filter(v=>v>0&&v<=40).slice(0,8);
}
function scenarioRate(speed,basis){
  const c=curveRate(speed);
  if(c)return{...c,model:'Curve'};
  if(!(basis.speed>0&&basis.fuelDay>=0))return null;
  return{rate:basis.fuelDay*Math.pow(speed/basis.speed,3),source:'cubic comparison model',model:'Cubic'};
}
function scenarios(){
  const b=validateBasis();if(b.error)return setResult('vpdScenarioResult',b.error,'','caution');
  const baseRate=effectiveRate(b.speed);
  const basis={...b,fuelDay:baseRate?.rate};
  const speeds=parseSpeeds();
  if(!speeds.length)return setResult('vpdScenarioResult','Enter one or more speeds to compare.','','caution');
  if(!(basis.fuelDay>=0))return setResult('vpdScenarioResult','Enter daily fuel consumption or save a usable curve first.','','caution');
  const rows=speeds.map(s=>{
    const r=scenarioRate(s,basis);
    if(!r)return'<tr><td>'+fmt(s,1)+' kn</td><td colspan="4">No usable fuel model</td></tr>';
    const h=b.distance/s,fuel=r.rate*h/24;
    return'<tr><td>'+fmt(s,1)+' kn</td><td>'+hoursText(h)+'</td><td>'+fmt(r.rate,2)+' m³/day</td><td>'+fmt(fuel,1)+' m³</td><td>'+esc(r.model)+'</td></tr>';
  }).join('');
  const el=$('#vpdScenarioResult');
  el.className='result vpd-table-result';
  el.innerHTML='<strong>Voyage scenario comparison</strong><div class="table-wrap"><table class="table compact"><thead><tr><th>Speed</th><th>Sea time</th><th>Fuel rate</th><th>Voyage fuel</th><th>Model</th></tr></thead><tbody>'+rows+'</tbody></table></div><small>Saved curve values are linearly interpolated inside the curve range. Other speeds use the simple cubic comparison model from the planned-speed reference.</small>';
}
function localDateTimeInputValue(d){
  const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
}
function arrivalPlanner(){
  const b=validateBasis();if(b.error)return setResult('vpdArrivalResult',b.error,'','caution');
  const dep=new Date($('#vpdDeparture').value);
  if(!Number.isFinite(dep.getTime()))return setResult('vpdArrivalResult','Enter a valid departure date and time.','','caution');
  const plannedHours=b.distance/b.speed,eta=new Date(dep.getTime()+plannedHours*3600000);
  const targetRaw=$('#vpdTargetArrival').value;
  let sub='ETA at '+fmt(b.speed,1)+' kn: '+eta.toLocaleString();
  let main='Planned sea time '+hoursText(plannedHours);
  if(targetRaw){
    const target=new Date(targetRaw);
    const available=(target-dep)/3600000;
    if(!(available>0))return setResult('vpdArrivalResult','Target arrival must be after departure.','','caution');
    const req=b.distance/available,delta=req-b.speed;
    main='Required average speed '+fmt(req,1)+' kn';
    sub='Available '+hoursText(available)+' · planned '+fmt(b.speed,1)+' kn · '+(delta>=0?'+':'')+fmt(delta,1)+' kn versus plan';
  }
  setResult('vpdArrivalResult',main,sub,main.includes('Required')&&num(main.match(/[\d.]+/)?.[0])>40?'caution':'');
}
function factorForSelection(){
  const key=$('#vpdFuelType').value;
  if(key==='custom')return num($('#vpdCustomFactor').value);
  return IMO_FACTORS[key]?.factor;
}
function updateFactorUi(){
  const key=$('#vpdFuelType').value,f=IMO_FACTORS[key]?.factor,custom=key==='custom';
  $('#vpdCustomFactorWrap').hidden=!custom;
  $('#vpdFactorText').textContent=custom?'Enter company / approved factor.':(ok(f)?'IMO C_F '+fmt(f,3)+' t-CO₂/t-fuel.':'');
}
function emissions(){
  const b=validateBasis();if(b.error)return setResult('vpdEmissionResult',b.error,'','caution');
  const rate=effectiveRate(b.speed);
  if(!rate)return setResult('vpdEmissionResult','Enter daily fuel consumption or save a usable curve.','','caution');
  const density=num($('#vpdDensity').value),cf=factorForSelection();
  if(!(density>0&&density<2000))return setResult('vpdEmissionResult','Enter a valid fuel density in kg/m³.','','caution');
  if(!(cf>0&&cf<10))return setResult('vpdEmissionResult','Enter or select a valid CO₂ conversion factor.','','caution');
  const h=b.distance/b.speed,volume=rate.rate*h/24,massT=volume*density/1000,co2=massT*cf;
  const fuelLabel=$('#vpdFuelType option:checked')?.textContent||'Selected fuel';
  setResult('vpdEmissionResult',fmt(co2,1)+' t CO₂ estimate',
    fuelLabel+' · '+fmt(volume,1)+' m³ · '+fmt(massT,1)+' t fuel · C_F '+fmt(cf,3)+' · '+rate.source);
}
function curveRow(point={speed:'',fuelDay:''}){
  return'<div class="vpd-curve-row"><label>Speed kn<input class="vpd-curve-speed" type="number" min="0.1" max="40" step="0.1" value="'+esc(point.speed)+'"></label><label>Fuel m³/day<input class="vpd-curve-fuel" type="number" min="0" step="0.01" value="'+esc(point.fuelDay)+'"></label><button type="button" class="btn small vpd-remove-curve">Remove</button></div>';
}
function renderCurveRows(){
  const host=$('#vpdCurveRows');if(!host)return;
  const pts=loadCurve();
  host.innerHTML=(pts.length?pts:[{},{},{}]).map(curveRow).join('');
  refreshCurveHint();
}
function refreshCurveHint(){
  const hint=$('#vpdCurveHint');if(!hint)return;
  const pts=loadCurve(),s=num($('#vpdSpeed')?.value);
  if(pts.length<2){hint.textContent='Save at least two speed / consumption points to enable interpolation.';return}
  const r=curveRate(s);
  hint.textContent='Saved '+pts.length+' points from '+fmt(pts[0].speed,1)+' to '+fmt(pts[pts.length-1].speed,1)+' kn.'+(r?' At planned speed: '+fmt(r.rate,2)+' m³/day.':' Planned speed is outside the saved curve range.');
}
function saveCurve(){
  const rows=$$('.vpd-curve-row','#vpdCurveRows').map(r=>({speed:num($('.vpd-curve-speed',r).value),fuelDay:num($('.vpd-curve-fuel',r).value)}))
    .filter(x=>x.speed>0&&x.speed<=40&&x.fuelDay>=0&&ok(x.fuelDay)).sort((a,b)=>a.speed-b.speed);
  const unique=rows.filter((x,i,a)=>!i||Math.abs(x.speed-a[i-1].speed)>.0001);
  if(unique.length<2)return setResult('vpdCurveResult','Add at least two valid, unique speed points.','','caution');
  writeJson(CURVE_KEY,unique);
  renderCurveRows();
  setResult('vpdCurveResult','Consumption curve saved locally',unique.length+' points · linear interpolation only inside the saved speed range.','ok');
}
function clearCurve(){
  localStorage.removeItem(CURVE_KEY);renderCurveRows();setResult('vpdCurveResult','Saved curve cleared','','');
}
function addCurveRow(){
  $('#vpdCurveRows').insertAdjacentHTML('beforeend',curveRow());
}
function bind(){
  $('#vpdUseLastVoyage').onclick=useLastVoyage;
  $('#vpdUseProfile').onclick=useProfile;
  $('#vpdSpeed').addEventListener('input',refreshCurveHint);
  $('#vpdCalcBunker').onclick=bunker;
  $('#vpdCalcScenarios').onclick=scenarios;
  $('#vpdCalcArrival').onclick=arrivalPlanner;
  $('#vpdFuelType').onchange=updateFactorUi;
  $('#vpdCalcEmission').onclick=emissions;
  $('#vpdAddCurve').onclick=addCurveRow;
  $('#vpdSaveCurve').onclick=saveCurve;
  $('#vpdClearCurve').onclick=clearCurve;
  $('#vpdCurveRows').addEventListener('click',e=>{if(e.target.closest('.vpd-remove-curve'))e.target.closest('.vpd-curve-row').remove()});
}
function seedInputs(){
  const p=loadProfile(),last=readJson(LAST_VOYAGE_KEY,null);
  if(last?.distanceNm>0)$('#vpdDistance').value=num(last.distanceNm).toFixed(1);
  if(last?.speedKnots>0)$('#vpdSpeed').value=num(last.speedKnots).toFixed(1);
  else if(p.speed)$('#vpdSpeed').value=p.speed;
  if(p.fuelDay!=null)$('#vpdFuelDay').value=p.fuelDay;
  const dep=new Date();dep.setMinutes(Math.ceil(dep.getMinutes()/15)*15,0,0);
  $('#vpdDeparture').value=localDateTimeInputValue(dep);
  renderCurveRows();updateFactorUi();
  if(last?.distanceNm>0)setSharedStatus('Loaded the last Voyage Estimate as a starting point.','ok');
  else if(p.speed||p.fuelDay)setSharedStatus('Loaded available Vessel Profile values.','ok');
}
function render(host){
  if(!host||host.dataset.voyagePlanningDraftRendered)return;
  host.dataset.voyagePlanningDraftRendered='1';
  host.innerHTML=`
    <div class="page-title vpd-title">
      <div>
        <div class="eyebrow">MARINE TOOLS · DRAFT PROTOTYPES</div>
        <h1>Voyage Planning Lab</h1>
        <p>Five connected planning concepts built on Voyage Estimate and Vessel Profile. These are drafts for testing, not final production tools.</p>
      </div>
      <span class="vpd-draft-badge">DRAFT</span>
    </div>

    <div class="notice vpd-warning"><b>Planning prototypes only.</b> Verify all assumptions, fuel figures, emission factors, reserves and operational requirements against vessel/company procedures and approved systems.</div>

    <article class="panel vpd-basis">
      <div class="panel-head"><div><h2>Shared voyage basis</h2><small>Used by the draft calculators below.</small></div><div class="actions"><button class="btn" id="vpdUseLastVoyage">Use last Voyage Estimate</button><button class="btn" id="vpdUseProfile">Use Vessel Profile</button></div></div>
      <div class="panel-body">
        <div class="fields three">
          <label>Distance NM<input id="vpdDistance" type="number" min="0" step="0.1" value="1000"></label>
          <label>Planned speed kn<input id="vpdSpeed" type="number" min="0.1" max="40" step="0.1" value="12"></label>
          <label>Reference fuel m³/day<input id="vpdFuelDay" type="number" min="0" step="0.01" placeholder="Optional if curve is saved"></label>
        </div>
        <div id="vpdBasisStatus" class="vpd-basis-status">Enter values manually or reuse locally saved voyage/profile data.</div>
      </div>
    </article>

    <div class="vpd-grid">
      <article class="tool-card vpd-card">
        <div class="tool-card-head"><div><span class="vpd-number">01</span><h3>Bunker Requirement / Stem Planner</h3><p>Estimate required bunker quantity from voyage consumption, reserve and desired arrival ROB.</p></div></div>
        <div class="tool-card-work">
          <div class="fields three">
            <label>Current ROB m³<input id="vpdRob" type="number" min="0" step="0.1" value="100"></label>
            <label>Required arrival ROB m³<input id="vpdArrivalRob" type="number" min="0" step="0.1" value="25"></label>
            <label>Voyage reserve %<input id="vpdReservePct" type="number" min="0" step="0.1" value="10"></label>
          </div>
          <div class="actions"><button id="vpdCalcBunker" class="btn primary">Calculate bunker requirement</button></div>
          <div id="vpdBunkerResult" class="result"><strong>—</strong><small>Uses the shared voyage basis and saved curve when available.</small></div>
        </div>
      </article>

      <article class="tool-card vpd-card">
        <div class="tool-card-head"><div><span class="vpd-number">02</span><h3>Voyage Scenario Compare</h3><p>Compare sea time and estimated fuel at several speeds for the same distance.</p></div></div>
        <div class="tool-card-work">
          <label>Speeds to compare · kn<input id="vpdScenarioSpeeds" value="8, 10, 12, 14" placeholder="e.g. 8, 10, 12"></label>
          <div class="actions"><button id="vpdCalcScenarios" class="btn primary">Compare scenarios</button></div>
          <div id="vpdScenarioResult" class="result"><strong>—</strong><small>Saved curve is preferred; other speeds use a cubic comparison model.</small></div>
        </div>
      </article>

      <article class="tool-card vpd-card">
        <div class="tool-card-head"><div><span class="vpd-number">03</span><h3>Arrival / Departure Planner</h3><p>Calculate ETA at planned speed or required average speed for a target arrival.</p></div></div>
        <div class="tool-card-work">
          <div class="fields">
            <label>Departure<input id="vpdDeparture" type="datetime-local"></label>
            <label>Target arrival · optional<input id="vpdTargetArrival" type="datetime-local"></label>
          </div>
          <div class="actions"><button id="vpdCalcArrival" class="btn primary">Calculate timing</button></div>
          <div id="vpdArrivalResult" class="result"><strong>—</strong><small>No weather, traffic, port or speed-change allowance is included.</small></div>
        </div>
      </article>

      <article class="tool-card vpd-card">
        <div class="tool-card-head"><div><span class="vpd-number">04</span><h3>Fuel & CO₂ Voyage Estimate</h3><p>Convert estimated voyage fuel volume to fuel mass and a tank-to-wake CO₂ estimate.</p></div></div>
        <div class="tool-card-work">
          <div class="fields three">
            <label>Fuel type<select id="vpdFuelType">
              <option value="mdo">Diesel / Gas Oil</option><option value="lfo">Light Fuel Oil (LFO)</option><option value="hfo">Heavy Fuel Oil (HFO)</option>
              <option value="lpgp">LPG · Propane</option><option value="lpgb">LPG · Butane</option><option value="lng">LNG</option><option value="methanol">Methanol</option><option value="ethanol">Ethanol</option><option value="custom">Custom factor</option>
            </select><small id="vpdFactorText"></small></label>
            <label>Density kg/m³<input id="vpdDensity" type="number" min="1" step="0.1" placeholder="Enter actual / approved value"></label>
            <label id="vpdCustomFactorWrap" hidden>Custom C_F t-CO₂/t-fuel<input id="vpdCustomFactor" type="number" min="0.001" step="0.001" value="3.206"></label>
          </div>
          <div class="actions"><button id="vpdCalcEmission" class="btn primary">Estimate fuel & CO₂</button></div>
          <div id="vpdEmissionResult" class="result"><strong>—</strong><small>IMO C_F factors are provided for the listed fossil/standard fuel categories. Not an EU ETS or FuelEU compliance calculation.</small></div>
        </div>
      </article>

      <article class="tool-card vpd-card vpd-curve-card">
        <div class="tool-card-head"><div><span class="vpd-number">05</span><h3>Vessel Consumption Curve</h3><p>Save vessel-specific speed / daily-consumption points locally and reuse them in the planning drafts.</p></div></div>
        <div class="tool-card-work">
          <div id="vpdCurveRows" class="vpd-curve-rows"></div>
          <div class="actions"><button id="vpdAddCurve" class="btn">+ Add point</button><button id="vpdSaveCurve" class="btn primary">Save curve</button><button id="vpdClearCurve" class="btn">Clear saved curve</button></div>
          <p id="vpdCurveHint" class="helper"></p>
          <div id="vpdCurveResult" class="result"><strong>—</strong><small>Stored only in this browser. Linear interpolation is used only between saved speed points.</small></div>
        </div>
      </article>
    </div>

    <details class="panel vpd-method">
      <summary><span><b>Draft assumptions & formulas</b><small>How these prototypes currently calculate</small></span><strong>Show</strong></summary>
      <div class="panel-body vpd-method-grid">
        <div><b>Bunker requirement</b><span>Voyage fuel + percentage reserve + desired arrival ROB − current ROB. Result is floored at zero.</span></div>
        <div><b>Scenario compare</b><span>Fuel curve interpolation is used inside its saved range. Otherwise the draft uses a simple cubic speed/fuel comparison from the planned-speed reference.</span></div>
        <div><b>Arrival planning</b><span>Sea time = distance / speed. Required average speed = distance / available hours.</span></div>
        <div><b>CO₂ estimate</b><span>Fuel volume × density = fuel mass; fuel mass × IMO C_F = tank-to-wake CO₂ estimate.</span></div>
        <div><b>Consumption curve</b><span>Locally saved speed / m³-day points with linear interpolation only between known points.</span></div>
      </div>
    </details>

    <div class="actions vpd-footer-actions"><button class="btn" data-go="voyage-estimate">← Back to Voyage Estimate</button><button class="btn" data-go="profile">Open Vessel Profile</button></div>
  `;
  bind();seedInputs();
}

window.__marineToolsVoyagePlanningDraft={render};
})();