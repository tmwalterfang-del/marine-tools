import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {worker,headers,fixtureBinding} from './analytics-fixture-20261021.mjs';
const {JSDOM}=createRequire(import.meta.url)('jsdom');let checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('PASS '+label)}
const uuid='12345678-1234-4234-8234-123456789abc',written=[];
const payload={event:'calculation_succeeded',page:'electrical',tool:'calc3p',label:'Three-phase power',visitor:uuid,session:uuid,schema:'usage-v1',source:'teaching',visitorKind:'returning',secret:'must not be stored',value:999};
const post=(body=payload,origin='https://www.marinetools.app',host='api.marinetools.app')=>worker.fetch(new Request('https://'+host+'/api/analytics/event',{method:'POST',headers:{origin},body:JSON.stringify(body)}),{ANALYTICS:{writeDataPoint:x=>written.push(x)}},{});
check((await post()).status===202&&written.length===1,'new usage events are accepted on production');
check(written[0].blobs[5]===uuid&&written[0].blobs[7]==='teaching'&&!JSON.stringify(written).includes('must not')&&!JSON.stringify(written).includes('999'),'storage uses explicit metadata allowlist and never input fields');
check((await post(payload,'https://evil.invalid')).status===403&&written.length===1,'foreign origins cannot submit usage events');
check((await post({...payload,visitor:'email@example.com'})).status===400,'identities must be random UUIDs');
check((await post(payload,'https://www.marinetools.app','qa.api.marinetools.app')).status===403&&written.length===1,'preview remains isolated even for new collector');
const calls=[],data=await(await worker.fetch(new Request('https://api.marinetools.app/admin/api/analytics',{headers}),{ANALYTICS_SQL:fixtureBinding('normal',calls)},{})).json();
check(data.usage.current.browsers===8&&data.usage.current.visits===10&&data.usage.current.calculations===7,'visitors, visits and results remain separate');
check(data.usage.tools.find(x=>x.tool==='calc3p').activeBrowsers===3,'tool reach is unique browsers rather than result count');
check(calls.filter(x=>x.query.includes("blob10='usage-v1'")).every(x=>x.query.includes('COUNT(DISTINCT blob6)')),'audience queries deduplicate random browser IDs within period');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../usage-analytics.js',import.meta.url),'utf8');
async function dom(url='https://www.marinetools.app/',settings={},flags={}){
 const sent=[],d=new JSDOM(index,{url,runScripts:'outside-only',pretendToBeVisual:true});const w=d.window;
 w.fetch=async(u,init)=>{if(String(u).includes('/api/analytics/event'))sent.push(JSON.parse(init.body));return new Response('{}',{headers:{'content-type':'application/json'}})};
 w.scrollTo=()=>{};Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent}});w.localStorage.setItem('mt.settings',JSON.stringify(settings));
 if(flags.dnt)Object.defineProperty(w.navigator,'doNotTrack',{value:'1'});if(flags.automation)Object.defineProperty(w.navigator,'webdriver',{value:true});w.eval(js);w.eval(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'));await new Promise(r=>setTimeout(r,30));
 return{d,w,sent,close:()=>w.close()};
}
const a=await dom();
check(a.sent.filter(x=>x.event==='visit_started').length===1,'one visit starts per tab session');
a.w.document.querySelector('[data-page="electrical"]').click();await new Promise(r=>setTimeout(r,20));
const click=()=>a.w.document.getElementById('calc3p').click();
a.w.document.getElementById('elV').value='0';click();await new Promise(r=>setTimeout(r,20));
check(a.sent.filter(x=>x.event==='calculation_invalid').length===1&&!a.sent.some(x=>x.event==='calculation_succeeded'),'real calculator invalid input never counts as success');
a.w.document.getElementById('elV').value='400';a.w.document.getElementById('elA').value='100';a.w.document.getElementById('elPf').value='.8';click();await new Promise(r=>setTimeout(r,20));
check(a.sent.filter(x=>x.event==='calculation_succeeded').length===1&&a.sent.some(x=>x.event==='active_usage'),'real calculator result counts as success and active use');
const successful=a.sent.find(x=>x.event==='calculation_succeeded');check(successful.tool==='calc3p'&&successful.label==='Three-phase power'&&!('value' in successful)&&!('result' in successful),'stable tool ID and readable label without calculation content');
for(const section of ['navigation','fuel','engineering','electrical','vessel-calcs','quick','weather']){const nav=a.w.document.querySelector('[data-page="'+section+'"]');if(!nav)continue;nav.click();await new Promise(r=>setTimeout(r,5));for(const button of a.w.document.querySelectorAll('.page.active .calc-action')){const start=a.sent.length;button.click();await new Promise(r=>setTimeout(r,5));check(a.sent.slice(start).filter(x=>['calculation_succeeded','calculation_invalid'].includes(x.event)).length===1,'exactly one explicit outcome for '+button.id)}}
const original=a.w.MT_USAGE.context();check(a.w.MT_USAGE.context().visitor===original.visitor&&a.w.MT_USAGE.context().session===original.session,'repeated actions reuse browser and visit IDs');
const saved=JSON.parse(a.w.sessionStorage.getItem('mt.analytics.visit.v1'));saved.last=Date.now()-1800001;a.w.sessionStorage.setItem('mt.analytics.visit.v1',JSON.stringify(saved));const next=a.w.MT_USAGE.context();check(next.visitor===original.visitor&&next.session!==original.session&&next.visitorKind==='returning','a later visit preserves browser identity and marks returning');
const settingsButton=a.w.document.createElement('button');settingsButton.dataset.go='settings';a.w.document.body.append(settingsButton);settingsButton.click();const count=a.sent.length;a.w.document.getElementById('excludeAnalytics').click();a.w.MT_USAGE.send('visit_started');check(a.sent.length===count&&!a.w.MT_USAGE.enabled(),'Settings exclusion suppresses all new usage events immediately');
const b=await dom('https://feature.marine-tools-frontend-preview.pages.dev/');check(!b.sent.length,'preview emits no legacy or new events');b.close();
const c=await dom('https://www.marinetools.app/',{usageAnalytics:false});check(!c.sent.length,'existing opt-out suppresses legacy and new events');c.close();
check(!a.sent.some(x=>x.event==='calculation_completed'),'new collector does not mislabel click as completed');a.close();
for(const flags of [{dnt:true},{automation:true}]){const x=await dom('https://www.marinetools.app/',{},flags);check(x.sent.length===0,'tracking suppressed for '+JSON.stringify(flags));x.close()}
const eduEvents=[],edu=new JSDOM('<select id="module-quick"><option value="trim">Trim</option><option value="tank">Tank</option></select><select id="topic-filter"><option>Thermodynamics</option></select><article data-formula-id="heat-1"><details><summary>Show formula</summary></details></article>',{url:'https://www.marinetools.app/students/interactive.html#trim',runScripts:'outside-only',pretendToBeVisual:true});
edu.window.fetch=async(u,init)=>{eduEvents.push(JSON.parse(init.body));return new Response('{}')};edu.window.eval(js);await new Promise(r=>setTimeout(r,20));
check(eduEvents.filter(x=>x.event==='education_module').length===1&&eduEvents.some(x=>x.event==='active_usage'),'Education initial module counts active use');
const select=edu.window.document.getElementById('module-quick');select.value='tank';select.dispatchEvent(new edu.window.Event('change',{bubbles:true}));edu.window.location.hash='tank';await new Promise(r=>setTimeout(r,20));
check(eduEvents.filter(x=>x.event==='education_module').length===2,'module dropdown and hash change do not duplicate selection');
edu.window.document.getElementById('topic-filter').dispatchEvent(new edu.window.Event('change',{bubbles:true}));
check(eduEvents.some(x=>x.event==='education_filter'&&x.tool==='topic-filter-thermodynamics'),'Education subject selection is recorded with a fixed option label');
edu.window.document.querySelector('summary').click();check(eduEvents.some(x=>x.event==='education_formula'&&x.tool==='heat-1'),'formula details record stable formula ID');
edu.window.document.dispatchEvent(new edu.window.CustomEvent('mt-presentation-change',{detail:{presenting:true}}));check(eduEvents.some(x=>x.event==='education_presentation'),'presentation activation is recorded');
edu.window.close();
console.log(JSON.stringify({result:'PASS',checks,scope:'New event collector, real calculator validation, storage exclusions and audience queries'}));
