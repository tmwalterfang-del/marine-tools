/* Marine Tools — Student workspace. Local-only: no remote API calls, tracking or accounts. */
(function(){
"use strict";
const formula=window.MT_FORMULAS||[],calc=window.MT_CALCULATORS||[],practice=window.MT_PRACTICE||[];
const study=window.MT_STUDY||{groups:[],details:{},calculatorByFormula:{},topicChapters:{},figures:{}};
const byFormula=new Map(formula.map(f=>[f.id,f]));
const symbolIndex=window.MT_SYMBOLS||{entries:[],find:()=>[],coverage:{withCuratedDefinitions:0}};
const byCalculator=new Map(calc.map(c=>[c.id,c]));
const el=id=>document.getElementById(id);
const enc=v=>String(v==null?"":v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const retrieve=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
const persist=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val))}catch{}};
const state={
 tab:"formulas",chapter:"All",query:"",topic:"All",group:"All",practiceGroup:"All",practiceLevel:"All",attempted:false,favorites:new Set(retrieve("mt-student-formulas-fav-v1",[])),
 completed:new Set(retrieve("mt-student-practice-v1",[])),savedOnly:false,workedOnly:false,
 display:48,calcid:calc[0]&&calc[0].id,examIndex:0,showSteps:true,
 theme:retrieve("mt-student-theme-v1","maritime")
};
const tr={
 en:{formulas:"Formulas",symbols:"Symbols",calculators:"Calculators",practice:"Exercises",sheet:"My Formula Sheet",
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
const fmt=n=>Number(n).toLocaleString("en-GB",{maximumFractionDigits:5});
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
  if(state.chapter!=="All"&&!study.chapters?.find(c=>String(c.number)===state.chapter)?.formulaIds.includes(f.id))return false;
  if(state.group!=="All"&&!study.groups.find(g=>g.id===state.group)?.categories.includes(f.category))return false;
  if(state.topic!=="All"&&f.category!==state.topic)return false;
  if(state.savedOnly&&!state.favorites.has(f.id))return false;
  if(state.workedOnly&&!exampleCount(f))return false;
  const txt=norm([f.name,f.formula,f.category,f.note,f.tags,...(f.related||[]).flatMap(r=>[r.name,r.formula,r.conditions])].join(" "));
  return terms.every(x=>txt.includes(x)||txt.includes(searchAliases[x]||"###"));
 });
}
function symbolsHtml(f){
 const d=study.details[f.id];
 if(!d?.symbols?.length)return '<p class="annotation-pending">Symbol definitions are under editorial review for this formula. Read the stated conditions and check the unit convention before applying it.</p>';
 return '<div class="symbol-grid">'+d.symbols.map(row=>
 '<div><code>'+enc(row.symbol)+'</code><span>'+enc(row.meaning)+'</span><small>'+enc(row.unit)+'</small></div>').join('')+'</div>';
}
function analyticalReviewHtml(r){
 const v=r.analyticalReview;if(!v)return '';
 const open=v.decision==='OPEN_MODEL_OR_SOURCE_LIMIT';
 return '<p class="'+(open?'source-open-model':'photo-review')+'"><strong>'+(open?'Reference only — unresolved model/source limit: ':'Analytical review: ')+'</strong>'+enc(open?'Do not apply this model until its stated evidence gap is resolved. '+v.finding:'Reviewed under the stated assumptions; this is separate from numerical validation.')+'</p>';
}
function numericReviewText(r){
 if(r.numericStatus==='INDEPENDENT_COMPLEX_KCL_REFERENCE_CASES')return 'Displayed expression checked against independent ideal-circuit node balances; real-component limits remain separate.';
 if(r.symbolicStatus==='NOT_APPLICABLE')return ['CHEMICAL_PATTERN','REACTION'].includes(r.kind)?'Source pattern read; structural and stoichiometric verification remains separate.':'Source relationship read; its stated model and validation scope must be checked separately.';
 if(r.numericStatus==='REFERENCE_CASE_COVERED')return 'Source expression read; selected numerical reference case covered by automated tests. Full domain validation pending.';
 if(r.numericChecks?.length)return 'Symbolic evidence and '+r.numericChecks.length+' numerical samples recorded under test assumptions.';
 if(r.symbolicStatus?.startsWith('PASS'))return 'Symbolic rule checked under stated assumptions; numerical evidence is recorded separately.';
 return 'No individual numerical test recorded; analytical review is not a numerical test.';
}
function exampleCount(f){return (f.related||[]).filter(r=>study.workedExamples?.[r.id]).length;}
function workedExampleHtml(r){
 const c=study.workedExamples?.[r.id];if(!c)return '';
 const unit=symbol=>r.symbols.find(v=>v.symbol.split(',').some(s=>s.trim()===symbol))?.unit||'';
 const value=(symbol,n)=>enc(symbol)+' = '+enc(fmt(n))+(unit(symbol)==='dimensionless'?' (dimensionless)':' '+enc(unit(symbol)));
 const resultSymbol=r.formula.split(/=|≈/)[0].trim();
 return '<details class="worked-example"><summary>Worked example · '+value(resultSymbol,c.expected)+'</summary>'+
 '<div class="worked-example-body"><h6>Given</h6><ul>'+Object.entries(c.inputs).map(([symbol,n])=>'<li><code>'+value(symbol,n)+'</code></li>').join('')+'</ul>'+
 '<h6>Method</h6><p>'+enc(c.reference)+'</p><p class="worked-result"><strong>Result:</strong> '+value(resultSymbol,c.expected)+'</p>'+
 '<p class="worked-scope">Synthetic teaching values; displayed values rounded to 5 decimal places. This selected reference case is checked automatically. It does not validate the full model domain. Apply the conditions above.</p></div></details>';
}
function relatedHtml(f){
 const related=f.related||[];if(!related.length)return "";
 return '<details class="related-equations"><summary>Related expressions and variants ('+related.length+')</summary>'+related.map(r=>
 '<article class="related-expression" id="'+enc(r.id)+'"><h5>'+enc(r.name)+'</h5><div class="equation" role="math" aria-label="'+enc(r.formula)+'">'+enc(r.formula)+'</div><p><strong>Conditions:</strong> '+enc(r.conditions)+'</p><div class="symbol-grid">'+r.symbols.map(v=>'<div><code>'+enc(v.symbol)+'</code><span>'+enc(v.meaning)+'</span><small>'+enc(v.unit)+'</small></div>').join('')+'</div>'+
 (r.sourceIssue?'<p class="source-correction"><strong>Source interpretation:</strong> '+enc(r.sourceIssue)+'</p>':"")+
 workedExampleHtml(r)+analyticalReviewHtml(r)+'<p class="photo-review">Printed p. '+r.page+' · '+enc(numericReviewText(r))+'</p></article>').join('')+'</details>';
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
 '<p><strong>Conditions:</strong> '+enc(f.note)+'</p>'+
 ((f.related||[]).some(r=>r.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT')?'<p class="source-open-model">Some related source models remain unresolved. Read their individual review notes before using them.</p>':'')+
 '<details class="formula-explanation"'+(forSheet?" open":"")+'><summary>Variables, units, diagram & source status</summary>'+
 '<div class="explanation-body"><h4>Symbols and units</h4>'+symbolsHtml(f)+figure+relatedHtml(f)+
 (d.metadataStatus?'<p class="annotation-pending">'+enc(d.metadataStatus)+'</p>':"")+
 '<div class="source-status"><strong>Topic reference: </strong>'+enc(chapter)+'. <a href="'+enc(study.glossarySource)+'" target="_blank" rel="noopener noreferrer">Book catalogue ↗</a>'+
 '<p>'+enc(study.chapterLabel)+' '+enc(study.reviewLabel)+'</p>'+
 (study.photoReview?.[f.id]?'<p class="photo-review">Printed source p. '+enc(study.photoReview[f.id].page)+': '+enc(study.photoReview[f.id].status)+'</p>':"")+
 '</div></div></details>'+actions+'</article>';
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
 el("calc-title").textContent=c.name;el("calc-description").textContent=c.description;
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
  else if(field.check==="unitinterval"&&(v<=0||v>1))error=field.label+": must be in (0, 1]";
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
 if(["engine-otto","refrigeration","shaft","trim-1","energy-1"].includes(e.id))return "Advanced";
 if(["gm-1","tpc-1","res-2","fuel-2","eng-1","therm-1","chem-ph","elect-dB","steam-enthalpy","econ-real","econ-pv"].includes(e.id))return "Intermediate";
 return "Foundation";
}
function exerciseIndexes(){
 return practice.map((e,i)=>({e,i})).filter(({e})=>
 (state.practiceGroup==="All"||study.groups.find(g=>g.id===state.practiceGroup)?.categories.includes(e.category))&&
 (state.practiceLevel==="All"||levelFor(e)===state.practiceLevel)).map(x=>x.i);
}
function moveExercise(direction){
 const ids=exerciseIndexes();if(!ids.length)return;
 const pos=ids.indexOf(state.examIndex);
 state.examIndex=ids[(Math.max(0,pos)+direction+ids.length)%ids.length];renderPractice();
}
function renderPractice(){
 const ids=exerciseIndexes(),e=practice[state.examIndex];
 if(!ids.length){el("exercise-question").textContent="No exercises match these filters.";el("exercise-index").textContent="0 / 0";el("check-answer").disabled=true;el("show-hint").disabled=true;el("show-solution").disabled=true;return}
 if(!ids.includes(state.examIndex)){state.examIndex=ids[0];return renderPractice()}
 el("check-answer").disabled=false;el("show-hint").disabled=false;el("show-solution").disabled=true;
 state.attempted=false;
 el("exercise-index").textContent=(ids.indexOf(state.examIndex)+1)+" / "+ids.length;
 el("exercise-level").textContent=levelFor(e);
 el("exercise-category").textContent=e.category;
 el("exercise-question").textContent=e.prompt;
 el("exercise-unit").textContent=e.unit;
 el("exercise-answer").value="";
 el("exercise-feedback").textContent="";el("exercise-feedback").className="";
 el("exercise-hint").hidden=true;el("exercise-hint").textContent=e.steps[0]||"Start by identifying the known values and units.";
 el("show-hint").textContent="Show hint";
 el("exercise-solution").hidden=true;
 el("exercise-solution").innerHTML='<ol>'+e.steps.map(step=>'<li>'+enc(step)+'</li>').join("")+'</ol>';
 el("show-solution").textContent=tt("solution");
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
}
function checkAnswer(){
 const e=practice[state.examIndex],input=el("exercise-answer").value.trim().replace(",","."),
 result=Number(input),feedback=el("exercise-feedback");
 if(!input||!Number.isFinite(result)){feedback.textContent=tt("invalid");feedback.className="error";return}
 state.attempted=true;el("show-solution").disabled=false;
 const correct=Math.abs(result-e.expected)<=Math.max(e.tolerance,Math.abs(e.expected)*0.001);
 feedback.textContent=tt(correct?"good":"bad");
 feedback.className=correct?"correct":"error";
 if(correct){state.completed.add(e.id);persist("mt-student-practice-v1",[...state.completed])}
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
}
let symbolLimit=60,pendingSymbolVariant=null;
function openSymbolVariant(id){const variant=document.getElementById(id);if(!variant)return;for(let p=variant.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;variant.setAttribute('tabindex','-1');variant.scrollIntoView?.({block:'start'});variant.focus?.({preventScroll:true})}

function renderSymbols(){
 const matches=symbolIndex.findConcepts(el("symbol-search").value.trim(),el("symbol-discipline").value),shown=matches.slice(0,symbolLimit);
 el("symbol-count").textContent=shown.length+" of "+matches.length+" distinct meanings shown · "+matches.reduce((n,c)=>n+c.contexts.length,0)+" formula contexts. Equivalent definitions are grouped; different meanings and units stay separate.";
 el("symbol-results").innerHTML=shown.map(entry=>
 '<article class="symbol-context"><span class="symbol-glyph">'+enc(entry.symbol)+'</span><div class="symbol-context-body"><h4>'+enc(entry.meaning)+'</h4>'+
 '<p>'+enc(entry.unit)+' · '+enc(entry.subjects.join(' · '))+'</p>'+
 '<details class="symbol-references"><summary>Used in '+entry.references.length+' '+(entry.references.length===1?'formula':'formulas')+' · '+entry.contexts.length+' '+(entry.contexts.length===1?'definition':'definitions')+'</summary><ul>'+entry.references.map(ref=>
 '<li><button type="button" data-symbol-formula="'+enc(ref.formulaId)+'" class="symbol-formula-link">'+enc(ref.name)+' →</button><details class="symbol-evidence"><summary>Definitions and review status ('+ref.contexts.length+')</summary><ul>'+ref.contexts.map(c=>'<li>'+(c.variantId?'<button type="button" class="symbol-variant-link" data-symbol-formula="'+enc(c.formulaId)+'" data-symbol-variant="'+enc(c.variantId)+'">'+enc(c.variantName===c.familyName?'Source expression'+(c.page?' · p. '+c.page:''):c.variantName)+' →</button>':'<span>Primary formula</span>')+'<small>'+enc(c.meaning)+' · '+enc(c.unit)+'</small><small class="source-state">'+enc(c.status)+'</small></li>').join('')+'</ul></details></li>').join('')+'</ul></details>'+
 '</div></article>').join("")||'<p class="placeholder">No matching symbols. Try another word or discipline.</p>';
 el("symbol-more").hidden=shown.length>=matches.length;
}

function setTab(name){
 if(!["formulas","symbols","calculators","practice","sheet"].includes(name))name="formulas";
 state.tab=name;
 renderChapterContext();
 document.querySelectorAll("[data-tab]").forEach(b=>{
  const active=b.dataset.tab===name;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));
 });
 document.querySelectorAll("[data-pane]").forEach(p=>{p.hidden=p.dataset.pane!==name});
 el("formula-controls").hidden=name!=="formulas";
 el("section-title").textContent=tt(name);
 if(name==="formulas")renderFormulas();
 if(name==="symbols")renderSymbols();
 if(name==="calculators")renderCalculator();
 if(name==="practice")renderPractice();
 if(name==="sheet")renderSheet();
}
function renderChapterContext(){
 const c=study.chapters?.find(c=>String(c.number)===state.chapter);
 el("chapter-context").hidden=!c||state.tab!=="formulas";
 el("chapter-context-label").textContent=c?"Opened from chapter "+c.number+" · "+c.title:"";
}
function route(){
 const match=location.hash.match(/^#chapter-(\d+)$/);
 state.chapter=match&&study.chapters?.some(c=>c.number===Number(match[1]))?match[1]:"All";
 renderChapterContext();
 if(match){state.group="All";state.topic="All";state.query="";state.savedOnly=false;state.workedOnly=false;el("worked-only").checked=false;state.display=48;el("study-group").value="All";el("formula-search").value="";el("saved-only").checked=false;refreshTopics()}
 setTab(match?"formulas":location.hash.slice(1)||"formulas");
 if(pendingSymbolVariant){openSymbolVariant(pendingSymbolVariant);pendingSymbolVariant=null}else if(location.hash)el("study-tools").scrollIntoView?.({block:'start'});
}
function init(){
 el("clear-chapter").addEventListener("click",()=>{state.chapter="All";renderChapterContext();location.hash="formulas";renderFormulas()});
 for(const id of ['library-home-link','library-browse'])el(id).addEventListener('click',()=>{
  pendingSymbolVariant=null;state.chapter='All';state.group='All';state.topic='All';state.query='';state.savedOnly=false;state.workedOnly=false;el("worked-only").checked=false;state.display=48;
  renderChapterContext();el('study-group').value='All';el('formula-search').value='';el('saved-only').checked=false;refreshTopics();location.hash='formulas';setTab('formulas');el('study-tools').scrollIntoView?.({block:'start'});
 });
 const selector=el("topic-filter"),groupSelector=el("study-group");
 study.groups.forEach(group=>{const option=document.createElement("option");option.value=group.id;option.textContent=group.label;groupSelector.append(option)});
 refreshTopics();
 const practiceSelect=el("practice-subject");
 study.groups.forEach(group=>{const opt=document.createElement("option");opt.value=group.id;opt.textContent=group.label;practiceSelect.append(opt)});
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
 el("formula-search").addEventListener("input",ev=>{state.query=ev.target.value;state.display=48;renderFormulas()});
 selector.addEventListener("change",ev=>{state.chapter="All";renderChapterContext();state.topic=ev.target.value;state.display=48;renderFormulas()});
 groupSelector.addEventListener("change",ev=>{state.chapter="All";renderChapterContext();state.group=ev.target.value;state.display=48;refreshTopics();renderFormulas()});
 el("worked-only").addEventListener("change",ev=>{state.workedOnly=ev.target.checked;state.display=48;renderFormulas()});
 el("saved-only").addEventListener("change",ev=>{state.savedOnly=ev.target.checked;renderFormulas()});
 el("load-more").addEventListener("click",()=>{state.display+=48;renderFormulas()});
 el("formula-grid").addEventListener("click",ev=>{
 const b=ev.target.closest("button");if(!b)return;
 if(b.dataset.examples){
  const card=b.closest('.formula-card');
  card.querySelectorAll('.formula-explanation,.related-equations,.worked-example').forEach(d=>{d.open=true});
  const first=card.querySelector('.worked-example summary');first?.focus();first?.scrollIntoView?.({block:'center',behavior:'smooth'});
 }else if(b.dataset.fav){
  state.favorites.has(b.dataset.fav)?state.favorites.delete(b.dataset.fav):state.favorites.add(b.dataset.fav);
  persist("mt-student-formulas-fav-v1",[...state.favorites]);el("saved-total").textContent=state.favorites.size;renderFormulas();renderSheet();
 }else if(b.dataset.copy){
  const f=formula.find(f=>f.id===b.dataset.copy);
  if(f&&navigator.clipboard?.writeText)navigator.clipboard.writeText(f.name+"\n"+f.formula+"\n"+f.note).then(()=>{b.textContent="✓"}).catch(()=>{});
 }else if(b.dataset.open){state.calcid=b.dataset.open;location.hash="calculators";setTab("calculators")}
 });
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.tab;setTab(b.dataset.tab)}));
 el("calc-selector").addEventListener("change",ev=>{state.calcid=ev.target.value;renderCalculator()});
 el("calc-fields").addEventListener("input",calculate);
 el("working-toggle").addEventListener("click",()=>{state.showSteps=!state.showSteps;calculate()});
 el("check-answer").addEventListener("click",checkAnswer);
 el("exercise-answer").addEventListener("keydown",ev=>{if(ev.key==="Enter")checkAnswer()});
 el("exercise-next").addEventListener("click",()=>moveExercise(1));
 el("exercise-prev").addEventListener("click",()=>moveExercise(-1));
 el("practice-subject").addEventListener("change",ev=>{state.practiceGroup=ev.target.value;state.examIndex=exerciseIndexes()[0]??0;renderPractice()});
 el("practice-difficulty").addEventListener("change",ev=>{state.practiceLevel=ev.target.value;state.examIndex=exerciseIndexes()[0]??0;renderPractice()});
 el("show-hint").addEventListener("click",()=>{
 const hint=el("exercise-hint");hint.hidden=!hint.hidden;el("show-hint").textContent=hint.hidden?"Show hint":"Hide hint";
 });
 el("show-solution").addEventListener("click",()=>{if(!state.attempted)return;
 const node=el("exercise-solution");node.hidden=!node.hidden;el("show-solution").textContent=tt(node.hidden?"solution":"hideSolution");
 });
 el("reset-progress").addEventListener("click",()=>{if(!window.confirm("Reset local study progress?"))return;state.completed.clear();persist("mt-student-practice-v1",[]);renderPractice()});
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
