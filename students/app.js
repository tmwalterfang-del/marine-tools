/* Marine Tools — Student workspace. Local-only: no remote API calls, tracking or accounts. */
(function(){
"use strict";
const formula=window.MT_FORMULAS||[],calc=window.MT_CALCULATORS||[],practice=window.MT_PRACTICE||[];
const el=id=>document.getElementById(id);
const enc=v=>String(v==null?"":v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const retrieve=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
const persist=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val))}catch{}};
const state={
 tab:"formulas",query:"",topic:"All",favorites:new Set(retrieve("mt-student-formulas-fav-v1",[])),
 completed:new Set(retrieve("mt-student-practice-v1",[])),savedOnly:false,
 display:48,calcid:calc[0]&&calc[0].id,examIndex:0,showSteps:true,
 theme:retrieve("mt-student-theme-v1","maritime"),lang:retrieve("mt-student-lang-v1","no")
};
const tr={
 no:{formulas:"Formler",calculators:"Kalkulatorer",practice:"Oppgaver",resources:"Kilder",
 search:"Søk: TPC, GM, trim, Ohms lov, elektro ...",all:"Alle fagområder",savedOnly:"Kun lagrede",
 loadMore:"Vis flere",noMatches:"Ingen treff. Prøv et annet søkeord eller fagområde.",copy:"Kopier",save:"Lagre",saved:"Lagret",
 openCalc:"Bruk kalkulator",working:"Vis mellomregning",hideWorking:"Skjul mellomregning",
 answer:"Kontroller svar",solution:"Vis fasit",hideSolution:"Skjul fasit",next:"Neste",previous:"Forrige",
 good:"Riktig svar innenfor toleransen.",bad:"Ikke helt riktig. Kontroller enheter og prøv igjen.",
 invalid:"Kontroller inntastede tall.",reset:"Nullstill progresjon"},
 en:{formulas:"Formulas",calculators:"Calculators",practice:"Exercises",resources:"Resources",
 search:"Search: TPC, GM, trim, Ohm's law, electrical ...",all:"All subjects",savedOnly:"Saved only",
 loadMore:"Show more",noMatches:"No matches. Try a different term or subject.",copy:"Copy",save:"Save",saved:"Saved",
 openCalc:"Open calculator",working:"Show working",hideWorking:"Hide working",
 answer:"Check answer",solution:"Show solution",hideSolution:"Hide solution",next:"Next",previous:"Previous",
 good:"Correct within tolerance.",bad:"Not quite. Check units and try again.",
 invalid:"Check your input values.",reset:"Reset progress"}
};
const tt=id=>(tr[state.lang]||tr.no)[id]||id;
const categories=[...new Set(formula.map(f=>f.category))];
const searchAliases={"stabilitet":"stability","laste":"cargo","last":"cargo","dypgang":"draft","deplasement":"displacement",
 "matematikk":"mathematics","elektro":"electrical","maskin":"machinery","fysikk":"mechanics",
 "effekt":"power","trykk":"pressure","strøm":"current","strom":"current","fart":"speed",
 "bunkers":"fuel","densitet":"density","navigasjon":"navigation","varme":"heat","temperatur":"temperature",
 "tyngdepunkt":"gravity","krenge":"heel","trefase":"three-phase","motstand":"resistance"};
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const fmt=n=>Number(n).toLocaleString(state.lang==="no"?"nb-NO":"en-GB",{maximumFractionDigits:5});
function updateHeader(){
 document.documentElement.lang=state.lang==="no"?"no":"en";
 document.documentElement.dataset.theme=state.theme;
 el("formula-total").textContent=formula.length;
 el("calculator-total").textContent=calc.length;
 el("practice-total").textContent=practice.length;
 el("saved-total").textContent=state.favorites.size;
 el("student-lang").value=state.lang;
 el("student-theme").value=state.theme;
 el("formula-search").placeholder=tt("search");
 el("saved-only-text").textContent=tt("savedOnly");
 el("topic-filter").options[0].textContent=tt("all");
 document.querySelectorAll("[data-label]").forEach(node=>{node.textContent=tt(node.dataset.label)});
}
function filtered(){
 const terms=norm(state.query).trim().split(/\s+/).filter(Boolean);
 return formula.filter(f=>{
  if(state.topic!=="All"&&f.category!==state.topic)return false;
  if(state.savedOnly&&!state.favorites.has(f.id))return false;
  const txt=norm([f.name,f.formula,f.category,f.note,f.tags].join(" "));
  return terms.every(x=>txt.includes(x)||txt.includes(searchAliases[x]||"###"));
 });
}
function renderFormulas(){
 const list=filtered();
 el("formula-count").textContent=fmt(list.length)+" / "+fmt(formula.length);
 el("formula-grid").innerHTML=list.slice(0,state.display).map(f=>{
 const fav=state.favorites.has(f.id);
 const candidate=calc.find(c=>c.category===f.category&&(norm(f.name).includes(norm(c.name).split(" ")[0])||norm(c.name).includes(norm(f.name).split(" ")[0])));
 return '<article class="formula-card"><div class="card-line"><span class="topic-pill">'+enc(f.category)+'</span>'+
 '<button type="button" data-fav="'+enc(f.id)+'" aria-pressed="'+fav+'" aria-label="'+tt(fav?"saved":"save")+'">'+(fav?"★":"☆")+'</button></div>'+
 '<h3>'+enc(f.name)+'</h3><div class="equation">'+enc(f.formula)+'</div><p>'+enc(f.note)+'</p>'+
 '<div class="card-actions"><button type="button" data-copy="'+enc(f.id)+'">'+tt("copy")+'</button>'+
 (candidate?'<button type="button" data-open="'+enc(candidate.id)+'">'+tt("openCalc")+' →</button>':"")+
 '</div></article>';
 }).join("")||'<p class="placeholder">'+tt("noMatches")+'</p>';
 el("load-more").hidden=state.display>=list.length;
 el("load-more").textContent=tt("loadMore");
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
function renderPractice(){
 const e=practice[state.examIndex];if(!e)return;
 el("exercise-index").textContent=(state.examIndex+1)+" / "+practice.length;
 el("exercise-category").textContent=e.category;
 el("exercise-question").textContent=e.prompt;
 el("exercise-unit").textContent=e.unit;
 el("exercise-answer").value="";
 el("exercise-feedback").textContent="";el("exercise-feedback").className="";
 el("exercise-solution").hidden=true;
 el("exercise-solution").innerHTML='<ol>'+e.steps.map(step=>'<li>'+enc(step)+'</li>').join("")+'</ol>';
 el("show-solution").textContent=tt("solution");
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
}
function checkAnswer(){
 const e=practice[state.examIndex],input=el("exercise-answer").value.trim().replace(",","."),
 result=Number(input),feedback=el("exercise-feedback");
 if(!input||!Number.isFinite(result)){feedback.textContent=tt("invalid");feedback.className="error";return}
 const correct=Math.abs(result-e.expected)<=Math.max(e.tolerance,Math.abs(e.expected)*0.001);
 feedback.textContent=tt(correct?"good":"bad");
 feedback.className=correct?"correct":"error";
 if(correct){state.completed.add(e.id);persist("mt-student-practice-v1",[...state.completed])}
 el("exercise-progress").textContent=state.completed.size+" / "+practice.length;
}
function setTab(name){
 if(!["formulas","calculators","practice","resources"].includes(name))name="formulas";
 state.tab=name;
 document.querySelectorAll("[data-tab]").forEach(b=>{
  const active=b.dataset.tab===name;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));
 });
 document.querySelectorAll("[data-pane]").forEach(p=>{p.hidden=p.dataset.pane!==name});
 el("formula-controls").hidden=name!=="formulas";
 el("section-title").textContent=tt(name);
 if(name==="formulas")renderFormulas();
 if(name==="calculators")renderCalculator();
 if(name==="practice")renderPractice();
}
function init(){
 const selector=el("topic-filter");
 categories.forEach(topic=>{const opt=document.createElement("option");opt.value=topic;opt.textContent=topic;selector.append(opt)});
 el("calc-selector").innerHTML=calc.map(c=>'<option value="'+enc(c.id)+'">'+enc(c.category)+' · '+enc(c.name)+'</option>').join("");
 updateHeader();
 el("formula-search").addEventListener("input",ev=>{state.query=ev.target.value;state.display=48;renderFormulas()});
 selector.addEventListener("change",ev=>{state.topic=ev.target.value;state.display=48;renderFormulas()});
 el("saved-only").addEventListener("change",ev=>{state.savedOnly=ev.target.checked;renderFormulas()});
 el("load-more").addEventListener("click",()=>{state.display+=48;renderFormulas()});
 el("formula-grid").addEventListener("click",ev=>{
 const b=ev.target.closest("button");if(!b)return;
 if(b.dataset.fav){
  state.favorites.has(b.dataset.fav)?state.favorites.delete(b.dataset.fav):state.favorites.add(b.dataset.fav);
  persist("mt-student-formulas-fav-v1",[...state.favorites]);el("saved-total").textContent=state.favorites.size;renderFormulas();
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
 el("exercise-next").addEventListener("click",()=>{state.examIndex=(state.examIndex+1)%practice.length;renderPractice()});
 el("exercise-prev").addEventListener("click",()=>{state.examIndex=(state.examIndex-1+practice.length)%practice.length;renderPractice()});
 el("show-solution").addEventListener("click",()=>{
 const node=el("exercise-solution");node.hidden=!node.hidden;el("show-solution").textContent=tt(node.hidden?"solution":"hideSolution");
 });
 el("reset-progress").addEventListener("click",()=>{if(!window.confirm("Reset local study progress?"))return;state.completed.clear();persist("mt-student-practice-v1",[]);renderPractice()});
 el("print-formulas").addEventListener("click",()=>window.print());
 el("student-lang").addEventListener("change",ev=>{state.lang=ev.target.value;persist("mt-student-lang-v1",state.lang);updateHeader();setTab(state.tab)});
 el("student-theme").addEventListener("change",ev=>{state.theme=ev.target.value;persist("mt-student-theme-v1",state.theme);updateHeader()});
 window.addEventListener("hashchange",()=>setTab(location.hash.slice(1)));
 setTab(location.hash.slice(1)||"formulas");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
