/* Marine Tools — Student workspace. Local-only: no remote API calls, tracking or accounts. */
(function(){
"use strict";
const formula=window.MT_FORMULAS||[],calc=window.MT_CALCULATORS||[],practice=window.MT_PRACTICE||[];
const study=window.MT_STUDY||{groups:[],details:{},calculatorByFormula:{},topicChapters:{},figures:{}};
const byFormula=new Map(formula.map(f=>[f.id,f]));
const byExpression=new Map((study.sourceEquationRegister||[]).map(r=>[r.id,r]));
const symbolIndex=window.MT_SYMBOLS||{entries:[],find:()=>[],coverage:{withCuratedDefinitions:0}};
const byCalculator=new Map(calc.map(c=>[c.id,c]));
const el=id=>document.getElementById(id);
const enc=v=>String(v==null?"":v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const retrieve=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
const retrieveList=key=>{const value=retrieve(key,[]);return Array.isArray(value)?value:[]};
const persist=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val))}catch{}};
const state={
 tab:"formulas",chapter:"All",query:"",topic:"All",group:"All",practiceChapter:"All",practiceGroup:"All",practiceLevel:"All",attempted:false,favorites:new Set(retrieveList("mt-student-formulas-fav-v1")),
 completed:new Set(retrieveList("mt-student-practice-v1")),savedOnly:false,workedOnly:false,
 display:48,calcid:calc[0]&&calc[0].id,examIndex:0,showSteps:true,
 theme:retrieve("mt-student-theme-v1","maritime")
};
const learning=window.MT_LEARNING_ENGINE?.create({bank:practice,chapters:study.chapters,legacyCompleted:[...state.completed],read:key=>JSON.parse(localStorage.getItem(key)),write:(key,value)=>{localStorage.setItem(key,JSON.stringify(value));return true}});
let learningUI,focusFormula=null,returnExercise=null,testRoute=null,renderedHash=null;
if(learning)state.completed=new Set(learning.completed);
function syncProgress(){if(learning)state.completed=new Set(learning.completed);persist('mt-student-practice-v1',[...state.completed]);el('exercise-progress').textContent=state.completed.size+' / '+practice.length;}
const tr={
 en:{formulas:"Formulas",symbols:"Symbols",calculators:"Calculators",practice:"Exercises",sheet:"My Formula Sheet",progress:"Progress",selftest:"Self-test",
 search:"Search: TPC, GM, trim, Ohm's law, electrical ...",all:"All subjects",savedOnly:"Saved only",
 loadMore:"Show more",noMatches:"No matches. Try a different term or subject.",copy:"Copy",save:"Save",saved:"Saved",
 openCalc:"Open calculator",working:"Show working",hideWorking:"Hide working",
 answer:"Check answer",solution:"Show solution",hideSolution:"Hide solution",next:"Next",previous:"Previous",
 good:"Correct within tolerance.",bad:"Not quite. Check units and try again.",
 invalid:"Check your input values.",reset:"Reset progress"}
};
const tt=id=>tr.en[id]||id;
const categories=[...new Set(formula.map(f=>f.category))];
const searchAliases={"stabilitet":"stability","laste":"cargo","last":"cargo","dypgang":"draft","deplasement":"displacement",
 "matematikk":"mathematics","elektro":"electrical","maskin":"machinery","fysikk":"mechanics",
 "effekt":"power","trykk":"pressure","strøm":"current","strom":"current","fart":"speed",
 "bunkers":"fuel","densitet":"density","navigasjon":"navigation","varme":"heat","temperatur":"temperature",
 "tyngdepunkt":"gravity","krenge":"heel","trefase":"three-phase","motstand":"resistance"};
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const fmt=window.MT_STUDENT_FORMAT||((n)=>Number(n).toLocaleString("en-GB",{maximumSignificantDigits:8,notation:Math.abs(n)>0&&(Math.abs(n)<.0001||Math.abs(n)>=1e7)?'scientific':'standard'}));
function updateHeader(){
 document.documentElement.lang="en";
 document.documentElement.dataset.theme=state.theme;
 el("formula-total").textContent=formula.length;
 el("calculator-total").textContent=calc.length;
 el("practice-total").textContent=practice.length;
 el("saved-total").textContent=state.favorites.size;
 el("student-theme").value=state.theme;
 el("formula-search").placeholder=tt("search");
 el("saved-only-text").textContent=tt("savedOnly");
 el("topic-filter").options[0].textContent=tt("all");
 document.querySelectorAll("[data-label]").forEach(node=>{node.textContent=tt(node.dataset.label)});
}
function filtered(){
 const terms=norm(state.query).trim().split(/\s+/).filter(Boolean);
 return formula.filter(f=>{
  if(focusFormula&&f.id!==focusFormula)return false;
  if(state.chapter!=="All"&&!study.chapters?.find(c=>String(c.number)===state.chapter)?.formulaIds.includes(f.id))return false;
  if(state.group!=="All"&&!study.groups.find(g=>g.id===state.group)?.categories.includes(f.category))return false;
  if(state.topic!=="All"&&f.category!==state.topic)return false;
  if(state.savedOnly&&!state.favorites.has(f.id))return false;
  if(state.workedOnly&&!exampleCount(f))return false;
  const txt=norm([f.name,f.formula,f.category,publicConditions(f),f.tags,...(f.related||[]).flatMap(r=>[r.name,r.formula,publicConditions(r)])].join(" "));
  return terms.every(x=>txt.includes(x)||txt.includes(searchAliases[x]||"###"));
 });
}
// Presentation copy keeps editorial history in the audit data, outside the UI.
const conditionCopy={
 'ext-hog-sag-first-correction-three-drafts':'Add the correction to the corrected midship draught: Teff=(Tf+4Tmid+Ta)/6. This Simpson weighting differs from the quarter-mean (Tf+6Tmid+Ta)/8. Use the method matching the vessel hydrostatics.',
 'photo-20261020-multistream-boiler-efficiency':'Steady-state enthalpy balance for five numbered streams. Use consistent energy units and the specified fuel heating value.',
 'source-expansion-20261020-displacement-mass-at-fixed-submerged-volume':'For the same submerged volume or draught in water of different densities. A ship with fixed mass changes draught rather than displacement mass.',
 'chapter-11-reviewed-20261020-convection-correlation':'Empirical turbulent smooth-tube correlation: Re>10000, 0.7<Pr<160 and L/D>60; n=0.4 for heating and 0.3 for cooling the fluid. Limited property variation and no phase change.',
 'book-mechanics-p34-r08':'Serial tension transmission with 0<α≤1, where α is the fraction transmitted at each sheave. It is not a universal hoist efficiency. n counts the supported tension terms.',
 'book-mechanics-p34-r09':'Reverse tension transmission with 0<α≤1. No additional brake or self-locking model.',
 'book-mechanics-p35-r08':'Kinematic lead model: s is worm axial lead, 2πRw is wheel pitch circumference, and the drum is attached to the wheel.',
 'book-mechanics-p43-r14':'Ellipse semiaxes a horizontal and c vertical; both are half-dimensions.',
 'book-mechanics-p43-r15':'Ellipse semiaxes a horizontal and c vertical; both are half-dimensions.',
 'book-mechanics-p43-r16':'Ellipse semiaxes a horizontal and c vertical; both are half-dimensions.',
 'book-mechanics-p43-r17':'Ellipse semiaxes a horizontal and c vertical; both are half-dimensions.',
 'book-mechanics-p47-r10':'Ideal fixed/pinned column. Effective-length factors 0.7 or 0.71 are rounded approximations. Ideal restraints and no sidesway unless specified.',
 'book-mechanics-p48-r02':'Outside diameter D, head rise H=0.2D, knuckle radius r=0.1D, crown radius R≥D and straight flange length>4s. Not a general head-thickness formula; an applicable pressure-vessel design method is required.',
 'book-machine-p49-r09':'Approximate annular contact model. Width across flats is an approximate outer diameter, not an exact hexagonal contact integral.',
 'book-machine-p50-r07':'Allowable-stress approach. The reduction factor v must be established for the material, weld geometry, workmanship and assessment method.',
 'book-machine-p50-r11':'End deduction for one weld segment with l>2a. Use the effective length required by the applicable joint assessment.',
 'book-machine-p51-r09':'K₁ depends on bearing geometry l/d and minimum-film fraction εf=hmin/(R−r). Use calibrated coefficients within their valid range. Dynamic viscosity must match lubricant temperature; p=F/(d·l), ω=2πn.',
 'book-machine-p52-r01':'ψ=(R−r)/r and εf=hmin/(R−r). The minimum-film fraction is not the eccentricity ratio.',
 'book-machine-p52-r02':'K₂ depends on bearing geometry l/d and minimum-film fraction εf=hmin/(R−r). Use calibrated coefficients within their valid range. Dynamic viscosity must match lubricant temperature; p=F/(d·l), ω=2πn.',
 'book-chemistry-p76-r01':'Composition pattern for many carbohydrates, not a definition covering every carbohydrate or derivative.',
 'book-c6-p94-r03':'The peak multiplier depends on circuit X/R, fault timing and the applicable method. There is no universal κ value.',
 'book-c6-p97-r01':'Two-digit capacitor marking, giving capacitance in pF. Match the marking, tolerance and voltage code to the manufacturer.',
 'book-c7-p109-r05':'Voltage-follower gyrator with R₂>R₁>0. Q=Im(Zin)/Re(Zin). The approximation ωR₂C also requires R₂≫R₁ and ω²R₁R₂C²≪1.',
 'book-c7-p110-r01':'Ideal follower: R₁ connects input port to output; R₂ connects input port to the noninverting node; C connects that node to ground; the inverting node follows the output. Zin=R₁R₂/(R₁+R₂)+1/[jωC(1+R₂/R₁)]. The expression R₂C/R₁ is a large-R₂/R₁ approximation.',
 'book-c8-p128-r09':'One pulse per 2π. Use the full period when calculating the average.',
 'book-c8-p128-r11':'Two equal rectified pulses. Use the stated RMS waveform convention.',
 'book-c8-p129-r03':'0≤α≤π; one pulse per 2π.',
 'book-c8-p131-r04':'0≤α≤π/3, up to the extinction boundary.',
 'book-c8-p131-r05':'π/3≤α≤2π/3; zero beyond 2π/3.',
 'book-c9-p142-r06':'The physical inertia reaction opposes acceleration. Keep the chosen force-direction convention consistent.',
 'book-c10-p153-r08':'Blade angles are in radians.',
 'book-c10-p153-r04':'Use signed absolute tangential velocity components.',
 'book-c11-p156-r02':'The numerical coefficients give kJ/kg dry air. Approximation for moderate HVAC conditions.',
 'book-c11-p158-r02':'Dimensionless absolute-pressure ratio.',
 'book-c11-p158-r03':'Dimensionless absolute-temperature ratio; use kelvin.',
 'book-c11-p159-r12':'Use the convective film coefficient h in h/(ρ·v·cp).',
 'book-c11-p161-r03':'Developing laminar tube flow; Re<2500 and Graetz number Re·Pr·Dh/L>10. Establish laminar flow separately; transition is not covered.',
 'book-c11-p161-r04':'Sieder–Tate correlation for smooth circular tubes with fully developed turbulent forced flow: Re>10000 and 0.7<Pr<700. Evaluate Re, Pr and μ at bulk temperature and μw at wall temperature; viscosities must be positive. Entrance effects are excluded. Establish developed flow separately rather than from a fixed L/D.',
 'book-c11-p162-r01':'n=0.4 for fluid heating and 0.3 for cooling. Smooth tube, Re>10000, 0.7<Pr<160 and L/D>60; empirical correlation.',
 'book-c11-p163-r01':'Geometry- and orientation-specific coefficient C and characteristic length. Cylinder: C=0.47 for 10³<Ra<10⁸; vertical case: C=0.56 for Ra<2×10⁹. Do not mix characteristic-length conventions.',
 'book-c11-p163-r02':'Laminar natural convection at a vertical plate, using average Nusselt number based on plate height; Gr<10⁹. Use positive buoyancy magnitude and representative properties. Requires an applicable empirical coefficient; not suitable for arbitrary cylinders or orientations.',
 'book-c11-p163-r03':'Natural-convection approximation for a horizontal cylinder, with diameter as characteristic length and 10⁻²<Ra<10³. Not a vertical-plate correlation.',
 'book-c11-p164-r01':'Rayleigh number using kinematic viscosity ν and thermal diffusivity α.',
 'book-c11-p164-r02':'Arithmetic mean of absolute wall and fluid temperatures.',
 'book-c11-p165-r01':'Empirical ranges: laminar C=0.59, n=1/4 for 10⁴<Ra<10⁹; turbulent C=0.10, n=1/3 for 10⁹<Ra<10¹³.',
 'book-c11-p166-r03':'Convert degree-days to degree-hours using the factor 24 when calculating energy in Wh.',
 'book-c11-p166-r04':'cvol in Wh/(m³·K), air-change rate per hour. Fixed volume and rate, without heat recovery. Convert days to hours using the factor 24.',
 'book-c11-p169-r05':'Large-reservoir velocity is negligible; suction lift is positive upward. Compare available NPSH with manufacturer-specified required NPSH.',
 'book-c11-p171-r03':'Diameter ratio βd=D₂/D₁<1; horizontal incompressible flow.',
 'book-c11-p171-r04':'Use the specified discharge and expansion factors, upstream density and diameter ratio. Match the coefficient convention to the approach-velocity correction.',
 'book-c11-p176-r03':'Conservation of mass: include the sum of all branch mass flows.',
 'book-c12-p178-r04':'Apply separate, nonoverlapping mechanical, belt and motor efficiencies. Do not count a loss twice.',
 'book-c14-p208-r04':'Linear trim model about LCF. An inverse calculation based on LCB may require hydrostatic iteration.',
 'book-c13-p192-r05':'Δλm is measured from the vertex, not from departure.',
 'book-c14-p197-r06':'Reference-density hydrostatic table with constant local waterplane area.',
 'book-c14-p211-r01':'The VCF must match the liquid class, temperature and reference density.',
 'book-c14-p212-r03':'Divide percentages by 100 to obtain a fill fraction.',
 'book-c14-p212-r04':'Not suitable for grain-stability assessment without approved vessel-specific grain-heeling data.',
 'book-c14-p213-r06':'Assumes LCF near midships and first keel contact near an end. Contact location and vessel hydrostatics affect the result.',
 'book-c14-p214-r05':'Hogging-positive convention. Use force units, or label mass moments as t·m rather than N·m.',
 'book-c14-p214-r07':'Use the aft weight arm xa for the aft weight moment.',
 'book-c15-p219-r04':'Dimensionless net NPV-to-investment ratio. The gross profitability index is 1 plus this ratio.',
 'book-c15-p219-r06':'r>0 and 0≤I₀r/A<1; no finite payback otherwise.'
};
function publicConditions(item){return (conditionCopy[item.id]??item.conditions??item.note??'').replace('Independent mass-moment formulation of this source lifting case. ','');}
function publicMeaning(value){return String(value).replace(' (printed page legend uses h_g)','');}
function symbolsHtml(f){
 const d=study.details[f.id];
 if(!d?.symbols?.length)return '<p>Check the symbol definitions and unit convention before applying this formula.</p>';
 return '<div class="symbol-grid">'+d.symbols.map(row=>
 '<div><code>'+enc(row.symbol)+'</code><span>'+enc(publicMeaning(row.meaning))+'</span><small>'+enc(row.unit)+'</small></div>').join('')+'</div>';
}
function analyticalReviewHtml(r){
 if(r.analyticalReview?.decision!=='OPEN_MODEL_OR_SOURCE_LIMIT')return '';
 const limits={
  'book-mechanics-p48-r02':'Use an applicable pressure-vessel design standard and verified shape factors for this head geometry.',
  'book-machine-p50-r07':'The weld reduction factor must be established for the material, joint geometry, workmanship and assessment method.',
  'book-machine-p50-r11':'Use a verified effective weld length for the actual joint detail and assessment method.',
  'book-machine-p51-r09':'A bearing-specific clearance coefficient and its operating limits are required.',
  'book-machine-p52-r02':'Bearing-specific friction data and their operating limits are required.',
  'book-c14-p212-r04':'Use approved grain-heeling data for the vessel and loading condition.'
 };
 return '<p class="source-open-model"><strong>Calculation unavailable. </strong>'+enc(limits[r.id]||'Additional design data and an applicable calculation method are required.')+'</p>';
}
function exampleCount(f){return (f.related||[]).filter(r=>study.workedExamples?.[r.id]).length;}
function workedNumber(n){
 const magnitude=Math.abs(n);
 return Number(n).toLocaleString('en-GB',{maximumSignificantDigits:8,notation:magnitude>0&&(magnitude<0.0001||magnitude>=1e7)?'scientific':'standard'});
}
function workedValue(r,symbol,n){
 const unit=r.symbols.find(v=>v.symbol.split(',').some(s=>s.trim()===symbol))?.unit||'';
 return enc(symbol)+' = '+enc(workedNumber(n))+(unit==='dimensionless'?' (dimensionless)':' '+enc(unit));
}
function workedCaseHtml(r,c){
 const resultSymbol=r.formula.split(/=|≈/)[0].trim();
 return '<h6>Given</h6><ul>'+Object.entries(c.inputs).map(([symbol,n])=>'<li><code>'+workedValue(r,symbol,n)+'</code></li>').join('')+'</ul>'+
 '<h6>Method</h6><p>'+enc(c.reference)+'</p><p class="worked-result"><strong>Result:</strong> '+workedValue(r,resultSymbol,c.expected)+'</p>'+
 '<p class="worked-scope">Example values. Results are rounded to eight significant figures. Use the stated conditions.</p>';
}
function workedExampleHtml(r){
 const c=study.workedExamples?.[r.id];if(!c)return '';
 const cases=[c,...(c.alternateCases||[])],resultSymbol=r.formula.split(/=|≈/)[0].trim();
 const choice=cases.length>1?'<label class="worked-case-label">Example<select class="worked-case-select" data-worked-id="'+enc(r.id)+'" aria-label="Example for '+enc(r.name)+'">'+cases.map((v,i)=>'<option value="'+i+'">'+enc(v.label)+'</option>').join('')+'</select></label>':'';
 return '<details class="worked-example"><summary>Worked example · '+workedValue(r,resultSymbol,c.expected)+'</summary>'+
 '<div class="worked-example-body">'+choice+'<div class="worked-case-content" aria-live="polite">'+workedCaseHtml(r,c)+'</div></div></details>';
}
function changeWorkedCase(ev){
 const select=ev.target.closest('.worked-case-select');if(!select)return;
 const r=byExpression.get(select.dataset.workedId),c=study.workedExamples?.[r?.id];if(!r||!c)return;
 const cases=[c,...(c.alternateCases||[])],index=Number(select.value);
 if(!Number.isInteger(index)||!cases[index])return;
 const example=select.closest('.worked-example'),chosen=cases[index];
 example.querySelector('.worked-case-content').innerHTML=workedCaseHtml(r,chosen);
 example.querySelector('summary').innerHTML='Worked example · '+workedValue(r,r.formula.split(/=|≈/)[0].trim(),chosen.expected);
}
function relatedHtml(f){
 const related=f.related||[];if(!related.length)return "";
 return '<details class="related-equations"><summary>Related expressions and variants ('+related.length+')</summary>'+related.map(r=>
 '<article class="related-expression" id="'+enc(r.id)+'"><h5>'+enc(r.name)+'</h5><div class="equation" role="math" aria-label="'+enc(r.formula)+'">'+enc(r.formula)+'</div><p><strong>Conditions:</strong> '+enc(publicConditions(r))+'</p><div class="symbol-grid">'+r.symbols.map(v=>'<div><code>'+enc(v.symbol)+'</code><span>'+enc(publicMeaning(v.meaning))+'</span><small>'+enc(v.unit)+'</small></div>').join('')+'</div>'+
 workedExampleHtml(r)+analyticalReviewHtml(r)+'</article>').join('')+'</details>';
}
function formulaMarkup(f,forSheet=false){
 const saved=state.favorites.has(f.id),d=study.details[f.id]||{},
       dest=study.calculatorByFormula[f.id],
       candidate=dest&&byCalculator.get(dest),
       chapter=study.topicChapters[f.category]||"Technical reference";
 const figure=d.figure&&study.figures[d.figure]?
  '<div class="study-diagram">'+study.figures[d.figure]+'</div>':"";
 const actions=forSheet?"":'<div class="card-actions"><button type="button" data-copy="'+enc(f.id)+'">Copy</button>'+
  (exampleCount(f)?'<button type="button" data-examples="'+enc(f.id)+'">'+exampleCount(f)+' worked '+(exampleCount(f)===1?'example':'examples')+' →</button>':'')+
  (candidate?'<button type="button" data-open="'+enc(candidate.id)+'">Open '+enc(candidate.name)+' →</button>':"")+'</div>';
 return '<article data-formula-id="'+enc(f.id)+'" class="formula-card'+(forSheet?' sheet-card':'')+'"><div class="card-line"><span class="topic-pill">'+enc(f.category)+'</span>'+
 (forSheet?"":'<button type="button" data-fav="'+enc(f.id)+'" aria-pressed="'+saved+'" aria-label="'+(saved?"Unsave":"Save")+' '+enc(f.name)+'">'+(saved?'★':'☆')+'</button>')+'</div>'+
 '<h3>'+enc(f.name)+'</h3><div class="equation" role="math" aria-label="'+enc(f.formula)+'">'+enc(f.formula)+'</div>'+
 '<p><strong>Conditions:</strong> '+enc(publicConditions(f))+'</p>'+
 ((f.related||[]).some(r=>r.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT')?'<p class="source-open-model">Some variants require additional design data. Read their conditions before use.</p>':'')+
 '<details class="formula-explanation"'+(forSheet?" open":"")+'><summary>Variables, units and diagrams</summary>'+
 '<div class="explanation-body"><h4>Symbols and units</h4>'+symbolsHtml(f)+figure+relatedHtml(f)+
 '</div></details>'+actions+'</article>';
}
function renderFormulas(){
 const list=filtered();
 el("formula-count").textContent=fmt(list.length)+" / "+fmt(formula.length);
 el("formula-grid").innerHTML=list.slice(0,state.display).map(f=>formulaMarkup(f)).join("")||'<p class="placeholder">'+tt("noMatches")+'</p>';
 el("load-more").hidden=state.display>=list.length;el("load-more").textContent=tt("loadMore");
}
function renderSheet(){
 const saved=formula.filter(f=>state.favorites.has(f.id));
 el("sheet-count").textContent=saved.length+' saved '+(saved.length===1?'formula':'formulas');
 el("sheet-formulas").innerHTML=saved.map(f=>formulaMarkup(f,true)).join("")||
 '<p class="placeholder">No formulas saved yet. Open the Formula Library and select the star on a formula.</p>';
 el("print-sheet").disabled=!saved.length;
}
function refreshTopics(){
 const current=state.topic;
 const cats=state.group==="All"?categories:(study.groups.find(g=>g.id===state.group)?.categories||[]);
 const selector=el("topic-filter");
 selector.innerHTML='<option value="All">All subjects</option>';
 cats.forEach(topic=>{const option=document.createElement("option");option.value=topic;option.textContent=topic;selector.append(option)});
 state.topic=cats.includes(current)?current:"All";selector.value=state.topic;
}
function activeCalculator(){return calc.find(c=>c.id===state.calcid)||calc[0]}
function renderCalculator(){
 const c=activeCalculator();if(!c)return;
 el("calc-selector").value=c.id;
 el("calc-title").textContent=c.name;el("calc-description").textContent=c.id==='molar-concentration'?'Amount of solute per unit solution volume.':c.description;
 el("calc-fields").innerHTML=c.fields.map(field=>'<label class="field"><span>'+enc(field.label)+' <small>('+enc(field.unit)+')</small></span>'+
 '<input type="number" inputmode="decimal" step="any" name="'+enc(field.key)+'" value="'+enc(field.initial)+'" required></label>').join("");
 state.showSteps=true;calculate();
}
function calculate(){
 const c=activeCalculator();if(!c)return;
 const values={};let error="";
 el("calc-fields").querySelectorAll("input").forEach(input=>{
  const field=c.fields.find(f=>f.key===input.name),v=Number(input.value);
  values[input.name]=v;
  if(!input.value.trim()||!Number.isFinite(v))error=tt("invalid");
  else if(field.check==="positive"&&v<=0)error=field.label+": must be > 0";
  else if(field.check==="nonnegative"&&v<0)error=field.label+": must be ≥ 0";
  else if(field.check==="unitinterval"&&(v<0||v>1))error=field.label+": must be in [0, 1]";
  input.setAttribute('aria-invalid',String(!input.value.trim()||!Number.isFinite(v)||field.check==='positive'&&v<=0||field.check==='nonnegative'&&v<0||field.check==='unitinterval'&&(v<0||v>1)));
 });
 let result;
 if(!error){try{result=c.compute(values);if(result.invalid)error=result.invalid;else if(!Number.isFinite(result.value))error=tt("invalid")}catch{error=tt("invalid")}}
 if(error){el("calc-output").innerHTML='<p class="error" role="alert">'+enc(error)+'</p>';el("calc-steps").innerHTML="";return}
 el("calc-output").innerHTML='<span class="eyebrow">RESULT</span><strong>'+fmt(result.value)+' <small>'+enc(result.unit)+'</small></strong>'+
 (result.warning?'<p class="warning">'+enc(result.warning)+'</p>':"");
 el("calc-steps").innerHTML=state.showSteps?'<ol>'+result.steps.map(step=>'<li>'+enc(step)+'</li>').join("")+'</ol>':"";
 el("working-toggle").textContent=tt(state.showSteps?"hideWorking":"working");
}
function levelFor(e){
 if(e.level)return e.level;
 if(["engine-otto","refrigeration","shaft","trim-1","energy-1"].includes(e.id))return "Advanced";
 if(["gm-1","tpc-1","res-2","fuel-2","eng-1","therm-1","chem-ph","elect-dB","steam-enthalpy","econ-real","econ-pv"].includes(e.id))return "Intermediate";
 return "Foundation";
}
function exerciseIndexes(){
 return practice.map((e,i)=>({e,i})).filter(({e})=>
 (state.practiceChapter==="All"||String(e.chapter)===state.practiceChapter)&&
 (state.practiceGroup==="All"||study.groups.find(g=>g.id===state.practiceGroup)?.categories.includes(e.category))&&
 (state.practiceLevel==="All"||levelFor(e)===state.practiceLevel)).sort((a,b)=>(a.e.chapter??99)-(b.e.chapter??99)||(a.e.difficulty??0)-(b.e.difficulty??0)||a.i-b.i).map(x=>x.i);
}
function moveExercise(direction){
 const ids=exerciseIndexes();if(!ids.length)return;
 const pos=ids.indexOf(state.examIndex);
 state.examIndex=ids[Math.max(0,Math.min(ids.length-1,Math.max(0,pos)+direction))];renderPractice();history.replaceState(null,'','#exercise/'+practice[state.examIndex].id);el('exercise-question').focus?.();
}
function renderPractice(){
 const ids=exerciseIndexes(),e=practice[state.examIndex];
 state.attempted=false;
 el("exercise-hint").hidden=true;el("exercise-hint").textContent="";el("exercise-solution").hidden=true;el("exercise-solution").textContent="";
 el("exercise-answer").value="";el("exercise-feedback").textContent="";el("exercise-feedback").className="";
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
 for(const id of ["exercise-answer","check-answer","show-hint","show-solution","exercise-prev","exercise-next"])el(id).disabled=!ids.length;
 if(!ids.length){learningUI?.emptyPractice();el("exercise-question").textContent="No exercises match these filters.";el("exercise-index").textContent="0 / 0";for(const id of ["exercise-category","exercise-level","exercise-unit","exercise-chapter"])el(id).textContent="";el("exercise-chapter").removeAttribute("href");return}
 if(!ids.includes(state.examIndex)){state.examIndex=ids[0];return renderPractice()}
 el("check-answer").disabled=false;el("show-hint").disabled=false;el("show-solution").disabled=true;
 state.attempted=false;
 el("exercise-index").textContent=(ids.indexOf(state.examIndex)+1)+" / "+ids.length;
 el("exercise-level").textContent=levelFor(e);
 el("exercise-chapter").textContent="Chapter "+e.chapter;el("exercise-chapter").href="#chapter-"+e.chapter;
 el("exercise-question").dataset.exerciseId=e.id;
 el("exercise-prev").disabled=ids.indexOf(state.examIndex)===0;el("exercise-next").disabled=ids.indexOf(state.examIndex)===ids.length-1;
 el("exercise-category").textContent=e.category;
 el("exercise-question").textContent=e.prompt;
 el("exercise-unit").textContent=e.unit;
 el("exercise-answer").value="";
 el("exercise-feedback").textContent="";el("exercise-feedback").className="";
 el("exercise-hint").hidden=true;el("exercise-hint").textContent=e.hint||e.steps[0]||"Start by identifying the known values and units.";
 el("show-hint").textContent="Show hint";
 el("exercise-solution").hidden=true;
 el("exercise-solution").innerHTML='<ol>'+e.steps.map(step=>'<li>'+enc(step)+'</li>').join("")+'</ol>';
 el("show-solution").textContent=tt("solution");
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
 if(learningUI)state.attempted=learningUI.practice(e);
}
function checkAnswer(){
 if(!exerciseIndexes().includes(state.examIndex))return;
 if(learning){const e=practice[state.examIndex],result=learning.attempt(e.id,el('exercise-answer').value);el('exercise-feedback').textContent=result.message;el('exercise-feedback').className=result.correct?'correct':'error';state.attempted=state.attempted||result.valid;el('show-solution').disabled=!state.attempted;learningUI.checked(result);syncProgress();return;}
 const e=practice[state.examIndex],input=el("exercise-answer").value.trim().replace(/−/g,"-").replace(",","."),
 result=Number(input),feedback=el("exercise-feedback");
 if(!input||!Number.isFinite(result)){feedback.textContent=tt("invalid");feedback.className="error";return}
 state.attempted=true;el("show-solution").disabled=false;
 const correct=Math.abs(result-e.expected)<=Math.max(e.tolerance??0,Math.abs(e.expected)*(e.relativeTolerance??0.001));
 feedback.textContent=tt(correct?"good":"bad");
 feedback.className=correct?"correct":"error";
 if(correct){state.completed.add(e.id);persist("mt-student-practice-v1",[...state.completed])}
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
}
let symbolLimit=60,pendingSymbolVariant=null;
function openSymbolVariant(id){const variant=document.getElementById(id);if(!variant)return;for(let p=variant.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;variant.setAttribute('tabindex','-1');variant.scrollIntoView?.({block:'start'});variant.focus?.({preventScroll:true})}

function renderSymbols(){
 const matches=symbolIndex.findConcepts(el("symbol-search").value.trim(),el("symbol-discipline").value),shown=matches.slice(0,symbolLimit);
 el("symbol-count").textContent=shown.length+" of "+matches.length+" symbol meanings shown.";
 el("symbol-results").innerHTML=shown.map(entry=>
 '<article class="symbol-context"><span class="symbol-glyph">'+enc(entry.symbol)+'</span><div class="symbol-context-body"><h4>'+enc(publicMeaning(entry.meaning))+'</h4>'+
 '<p>'+enc(entry.unit)+' · '+enc(entry.subjects.join(' · '))+'</p>'+
 '<details class="symbol-references"><summary>Used in '+entry.references.length+' '+(entry.references.length===1?'formula':'formulas')+' · '+entry.contexts.length+' '+(entry.contexts.length===1?'definition':'definitions')+'</summary><ul>'+entry.references.map(ref=>
 '<li><button type="button" data-symbol-formula="'+enc(ref.formulaId)+'" class="symbol-formula-link">'+enc(ref.name)+' →</button><details class="symbol-evidence"><summary>Definitions ('+ref.contexts.length+')</summary><ul>'+ref.contexts.map(c=>'<li>'+(c.variantId?'<button type="button" class="symbol-variant-link" data-symbol-formula="'+enc(c.formulaId)+'" data-symbol-variant="'+enc(c.variantId)+'">'+enc(c.variantName===c.familyName?'Expression':c.variantName)+' →</button>':'<span>Primary formula</span>')+'<small>'+enc(publicMeaning(c.meaning))+' · '+enc(c.unit)+'</small></li>').join('')+'</ul></details></li>').join('')+'</ul></details>'+
 '</div></article>').join("")||'<p class="placeholder">No matching symbols. Try another word or discipline.</p>';
 el("symbol-more").hidden=shown.length>=matches.length;
}

function setTab(name){
 renderedHash=location.hash;
 if(!["formulas","symbols","calculators","practice","sheet","progress","selftest"].includes(name))name="formulas";
 state.tab=name;
 renderChapterContext();
 document.querySelectorAll("[data-tab]").forEach(b=>{
  const active=b.dataset.tab===name;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));b.setAttribute('tabindex',active?'0':'-1');
 });
 document.querySelectorAll("[data-pane]").forEach(p=>{p.hidden=p.dataset.pane!==name});
 el("formula-controls").hidden=name!=="formulas";
 el("section-title").textContent=tt(name);
 if(name==="formulas")renderFormulas();
 if(name==="symbols")renderSymbols();
 if(name==="calculators")renderCalculator();
 if(name==="practice")renderPractice();
 if(name==="sheet")renderSheet();
 learningUI?.tabChanged(name,testRoute);
 const banner=el('learning-return');if(banner){banner.hidden=!returnExercise||name==='practice';banner.innerHTML=returnExercise?'<a href="#exercise/'+encodeURIComponent(returnExercise)+'">← Back to exercise</a>':'';}
}
function renderChapterContext(){
 const c=study.chapters?.find(c=>String(c.number)===state.chapter);
 el("chapter-context").hidden=!c||state.tab!=="formulas";
 el("chapter-context-label").textContent=c?"Chapter "+c.number+" · "+c.title:"";
}
function route(){
 if(renderedHash===location.hash)return;
 const [path,query='']=location.hash.slice(1).split('?'),params=new URLSearchParams(query),from=params.get('from');returnExercise=practice.some(q=>q.id===from)?from:null;focusFormula=null;testRoute=null;
 const exerciseMatch=path.match(/^exercise\/(.+)$/),formulaMatch=path.match(/^formula\/(.+)$/),calculatorMatch=path.match(/^calculator\/(.+)$/),testMatch=path.match(/^selftest(?:\/(.+))?$/);
 if(exerciseMatch){const index=practice.findIndex(q=>q.id===exerciseMatch[1]);if(index>=0){state.practiceChapter=String(practice[index].chapter);state.practiceGroup='All';state.practiceLevel='All';el('practice-chapter').value=state.practiceChapter;el('practice-subject').value='All';el('practice-difficulty').value='All';state.examIndex=index;setTab('practice');el('exercise-question').focus?.();return;}}
 if(testMatch){testRoute=testMatch[1]||null;setTab('selftest');el('study-tools').scrollIntoView?.({block:'start'});return;}
 if(formulaMatch&&byFormula.has(formulaMatch[1])){focusFormula=formulaMatch[1];state.chapter='All';state.group='All';state.topic='All';state.query='';state.savedOnly=false;state.workedOnly=false;state.display=48;el('formula-search').value='';el('study-group').value='All';el('saved-only').checked=false;el('worked-only').checked=false;refreshTopics();setTab('formulas');const variant=params.get('variant');if(variant&&byExpression.get(variant)?.formulaId===focusFormula)openSymbolVariant(variant);else el('study-tools').scrollIntoView?.({block:'start'});return;}
 if(calculatorMatch&&byCalculator.has(calculatorMatch[1])){state.calcid=calculatorMatch[1];setTab('calculators');el('study-tools').scrollIntoView?.({block:'start'});return;}
 const practiceMatch=path.match(/^practice-chapter-(\d+)$/);
 if(practiceMatch&&study.chapters?.some(c=>c.number===Number(practiceMatch[1]))){state.practiceChapter=practiceMatch[1];state.practiceGroup="All";state.practiceLevel="All";el("practice-chapter").value=state.practiceChapter;el("practice-subject").value="All";el("practice-difficulty").value="All";state.examIndex=exerciseIndexes()[0]??0;setTab("practice");el("study-tools").scrollIntoView?.({block:'start'});return}
 const match=path.match(/^chapter-(\d+)$/);
 state.chapter=match&&study.chapters?.some(c=>c.number===Number(match[1]))?match[1]:"All";
 renderChapterContext();
 if(match){state.group="All";state.topic="All";state.query="";state.savedOnly=false;state.workedOnly=false;el("worked-only").checked=false;state.display=48;el("study-group").value="All";el("formula-search").value="";el("saved-only").checked=false;refreshTopics()}
 setTab(match?"formulas":path||"formulas");
 if(pendingSymbolVariant){openSymbolVariant(pendingSymbolVariant);pendingSymbolVariant=null}else if(location.hash)el("study-tools").scrollIntoView?.({block:'start'});
}
function init(){
 if(learning&&window.MT_LEARNING_WORKSPACE&&window.MT_LEARNING_LINKS)learningUI=window.MT_LEARNING_WORKSPACE.create({engine:learning,links:window.MT_LEARNING_LINKS.create({formulas:formula,calculators:calc,study}),bank:practice,chapters:study.chapters,onProgress:syncProgress,onReset:()=>{if(state.tab==='practice')renderPractice();}});
 document.querySelectorAll('[data-tab]').forEach(b=>{b.id='tab-'+b.dataset.tab;b.setAttribute('aria-controls','pane-'+b.dataset.tab);const pane=document.querySelector('[data-pane="'+b.dataset.tab+'"]');if(pane){pane.id='pane-'+b.dataset.tab;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',b.id);}});
 document.querySelector('[role="tablist"]')?.addEventListener('keydown',ev=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;const tabs=[...document.querySelectorAll('[data-tab]')],index=tabs.indexOf(document.activeElement);if(index<0)return;ev.preventDefault();const next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(index+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs.forEach((b,i)=>b.setAttribute('tabindex',i===next?'0':'-1'));tabs[next].focus();});
 el("clear-chapter").addEventListener("click",()=>{state.chapter="All";renderChapterContext();location.hash="formulas";renderFormulas()});
 for(const id of ['library-home-link','library-browse'])el(id).addEventListener('click',()=>{
  pendingSymbolVariant=null;focusFormula=null;returnExercise=null;state.chapter='All';state.group='All';state.topic='All';state.query='';state.savedOnly=false;state.workedOnly=false;el("worked-only").checked=false;state.display=48;
  renderChapterContext();el('study-group').value='All';el('formula-search').value='';el('saved-only').checked=false;refreshTopics();location.hash='formulas';setTab('formulas');el('study-tools').scrollIntoView?.({block:'start'});
 });
 const selector=el("topic-filter"),groupSelector=el("study-group");
 study.groups.forEach(group=>{const option=document.createElement("option");option.value=group.id;option.textContent=group.label;groupSelector.append(option)});
 refreshTopics();
 const practiceSelect=el("practice-subject");
 study.groups.forEach(group=>{const opt=document.createElement("option");opt.value=group.id;opt.textContent=group.label;practiceSelect.append(opt)});
 study.chapters.forEach(chapter=>{const option=document.createElement("option");option.value=String(chapter.number);option.textContent=chapter.number+" · "+chapter.title;el("practice-chapter").append(option)});
 state.examIndex=exerciseIndexes()[0]??0;
 el("calc-selector").innerHTML=calc.map(c=>'<option value="'+enc(c.id)+'">'+enc(c.category)+' · '+enc(c.name)+'</option>').join("");
 updateHeader();
 const symbolSubject=el("symbol-discipline");
 study.groups.forEach(group=>{const option=document.createElement("option");option.value=group.id;option.textContent=group.label;symbolSubject.append(option)});
 el("symbol-search").addEventListener("input",()=>{symbolLimit=60;renderSymbols()});
 symbolSubject.addEventListener("change",()=>{symbolLimit=60;renderSymbols()});
 el("symbol-more").addEventListener("click",()=>{symbolLimit+=60;renderSymbols()});
 el("symbol-results").addEventListener("click",ev=>{
  const b=ev.target.closest("button[data-symbol-formula]");if(!b)return;
  const f=byFormula.get(b.dataset.symbolFormula);if(!f)return;
  state.chapter="All";renderChapterContext();state.group="All";state.topic="All";state.savedOnly=false;state.workedOnly=false;el("worked-only").checked=false;state.query=f.name;state.display=48;
  el("study-group").value="All";refreshTopics();el("saved-only").checked=false;el("formula-search").value=f.name;
  pendingSymbolVariant=b.dataset.symbolVariant||null;
  location.hash="formulas";setTab("formulas");
  if(pendingSymbolVariant)openSymbolVariant(pendingSymbolVariant);else el("study-tools").scrollIntoView?.({block:'start'});
 });
 el("formula-search").addEventListener("input",ev=>{focusFormula=null;state.query=ev.target.value;state.display=48;renderFormulas()});
 selector.addEventListener("change",ev=>{state.chapter="All";renderChapterContext();focusFormula=null;state.topic=ev.target.value;state.display=48;renderFormulas()});
 groupSelector.addEventListener("change",ev=>{state.chapter="All";renderChapterContext();focusFormula=null;state.group=ev.target.value;state.display=48;refreshTopics();renderFormulas()});
 el("worked-only").addEventListener("change",ev=>{focusFormula=null;state.workedOnly=ev.target.checked;state.display=48;renderFormulas()});
 el("saved-only").addEventListener("change",ev=>{focusFormula=null;state.savedOnly=ev.target.checked;renderFormulas()});
 el("load-more").addEventListener("click",()=>{state.display+=48;renderFormulas()});
 el("formula-grid").addEventListener("change",changeWorkedCase);
 el("sheet-formulas").addEventListener("change",changeWorkedCase);
 el("formula-grid").addEventListener("click",ev=>{
 const b=ev.target.closest("button");if(!b)return;
 if(b.dataset.examples){
  const card=b.closest('.formula-card');
  card.querySelectorAll('.formula-explanation,.related-equations,.worked-example').forEach(d=>{d.open=true});
  const first=card.querySelector('.worked-example summary');first?.focus();first?.scrollIntoView?.({block:'center'});
 }else if(b.dataset.fav){
  state.favorites.has(b.dataset.fav)?state.favorites.delete(b.dataset.fav):state.favorites.add(b.dataset.fav);
  persist("mt-student-formulas-fav-v1",[...state.favorites]);el("saved-total").textContent=state.favorites.size;renderFormulas();renderSheet();
 }else if(b.dataset.copy){
  const f=formula.find(f=>f.id===b.dataset.copy);
  if(f&&navigator.clipboard?.writeText)navigator.clipboard.writeText(f.name+"\n"+f.formula+"\n"+publicConditions(f)).then(()=>{b.textContent="✓"}).catch(()=>{});
 }else if(b.dataset.open){state.calcid=b.dataset.open;location.hash='calculator/'+encodeURIComponent(state.calcid)+(returnExercise?'?from='+encodeURIComponent(returnExercise):'');setTab('calculators')}
 });
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{focusFormula=null;returnExercise=null;testRoute=null;location.hash=b.dataset.tab;if(renderedHash===location.hash)setTab(b.dataset.tab);else route()}));
 el("calc-selector").addEventListener("change",ev=>{state.calcid=ev.target.value;renderCalculator()});
 el("calc-fields").addEventListener("input",calculate);
 el("working-toggle").addEventListener("click",()=>{state.showSteps=!state.showSteps;calculate()});
 el("check-answer").addEventListener("click",checkAnswer);
 el("exercise-answer").addEventListener("keydown",ev=>{if(ev.key==="Enter")checkAnswer()});
 el("exercise-next").addEventListener("click",()=>moveExercise(1));
 el("exercise-prev").addEventListener("click",()=>moveExercise(-1));
 el("practice-subject").addEventListener("change",ev=>{state.practiceGroup=ev.target.value;state.examIndex=exerciseIndexes()[0]??0;renderPractice()});
 el("practice-difficulty").addEventListener("change",ev=>{state.practiceLevel=ev.target.value;state.examIndex=exerciseIndexes()[0]??0;renderPractice()});
 el("practice-chapter").addEventListener("change",ev=>{state.practiceChapter=ev.target.value;state.examIndex=exerciseIndexes()[0]??0;history.replaceState(null,"",state.practiceChapter==="All"?"#practice":"#practice-chapter-"+state.practiceChapter);renderPractice()});
 el("show-hint").addEventListener("click",()=>{
 const hint=el("exercise-hint");hint.hidden=!hint.hidden;el("show-hint").textContent=hint.hidden?"Show hint":"Hide hint";
 });
 el("show-solution").addEventListener("click",()=>{if(!state.attempted)return;
 const node=el("exercise-solution");node.hidden=!node.hidden;el("show-solution").textContent=tt(node.hidden?"solution":"hideSolution");
 });
 el("reset-progress").addEventListener("click",()=>{if(learningUI){learningUI.reset();return;}if(!window.confirm("Reset local study progress?"))return;state.completed.clear();persist("mt-student-practice-v1",[]);renderPractice()});
 el("print-formulas").addEventListener("click",()=>window.print());
 el("print-sheet").addEventListener("click",()=>{
  if(!state.favorites.size)return;
  document.body.classList.add("print-sheet");
  window.print();
 });
 window.addEventListener("afterprint",()=>document.body.classList.remove("print-sheet"));
 el("clear-sheet").addEventListener("click",()=>{
  if(!state.favorites.size||!window.confirm("Clear all saved formulas from this device?"))return;
  state.favorites.clear();persist("mt-student-formulas-fav-v1",[]);updateHeader();renderSheet();
 });
 el("student-theme").addEventListener("change",ev=>{state.theme=ev.target.value;persist("mt-student-theme-v1",state.theme);updateHeader()});
 window.addEventListener("hashchange",route);
 route();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
