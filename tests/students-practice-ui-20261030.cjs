const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const read=p=>fs.readFileSync('students/'+p,'utf8'),dom=new JSDOM(read('index.html'),{url:'https://example.test/students/#practice-chapter-1',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document,errors=[];
 w.addEventListener('error',e=>errors.push(e.message));await new Promise(r=>w.addEventListener('load',r,{once:true}));w.localStorage.setItem('mt-student-practice-v1',JSON.stringify(['disp-1']));
 let original;for(const match of read('index.html').matchAll(/src="([^"?]+\.js)/g)){if(match[1]==='practice-bank-20261030.js')original=w.MT_PRACTICE.map(e=>({id:e.id,prompt:e.prompt,expected:e.expected,steps:[...e.steps]}));w.eval(read(match[1]));}
 const $=id=>d.getElementById(id),change=(id,value)=>{$(id).value=String(value);$(id).dispatchEvent(new w.Event('change',{bubbles:true}));},current=()=>$('exercise-question').dataset.exerciseId;
 assert.equal(w.MT_PRACTICE.length,292);assert.equal($('practice-total').textContent,'292');assert.equal($('practice-chapter').options.length,17);
 for(const e of original){const kept=w.MT_PRACTICE.find(q=>q.id===e.id);assert.equal(kept.prompt,e.prompt);assert.equal(kept.expected,e.expected);assert.deepEqual([...kept.steps],e.steps);}
 assert.equal(current(),'practice-c01-q01');assert.ok($('exercise-prev').disabled);assert.ok($('exercise-progress').textContent.startsWith('1 /'));
 let checked=0;for(let chapter=1;chapter<=16;chapter++){
  change('practice-subject','All');change('practice-difficulty','All');change('practice-chapter',chapter);
  const expected=w.MT_PRACTICE.filter(e=>e.chapter===chapter).sort((a,b)=>a.difficulty-b.difficulty),seen=[];let previous=-Infinity;
  for(const e of expected){assert.equal(current(),e.id);assert.ok(e.difficulty>=previous);previous=e.difficulty;seen.push(e.id);
   assert.equal($('exercise-chapter').getAttribute('href'),'#chapter-'+chapter);assert.equal($('exercise-level').textContent,e.level);assert.ok($('exercise-solution').hidden);assert.ok($('show-solution').disabled);
   $('show-hint').click();assert.ok(!$('exercise-hint').hidden);assert.equal($('exercise-hint').textContent,e.hint||e.steps[0]);
   $('exercise-answer').value=String(e.expected);$('check-answer').click();assert.equal($('exercise-feedback').className,'correct',e.id);$('show-solution').click();assert.ok(!$('exercise-solution').hidden);assert.ok($('exercise-solution').textContent.includes(e.steps.at(-1)));
   checked++;if(e!==expected.at(-1))$('exercise-next').click();
  }
  assert.ok($('exercise-next').disabled);$('exercise-next').click();assert.equal(current(),seen.at(-1),'No wrap back to an easier question');
 }
 assert.equal(checked,292);assert.equal(new Set(JSON.parse(w.localStorage.getItem('mt-student-practice-v1'))).size,292);
 change('practice-chapter',1);change('practice-difficulty','Applied');assert.equal($('exercise-level').textContent,'Applied');
 change('practice-subject','electrical');assert.match($('exercise-question').textContent,/No exercises/);assert.equal($('exercise-index').textContent,'0 / 0');
 for(const id of ['exercise-answer','show-hint','show-solution','check-answer','exercise-prev','exercise-next'])assert.ok($(id).disabled,id);
 assert.equal($('exercise-hint').textContent,'');assert.equal($('exercise-solution').textContent,'');assert.equal($('exercise-feedback').textContent,'');
 $('exercise-answer').value='0';$('exercise-answer').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'}));assert.equal($('exercise-feedback').textContent,'');
 w.location.hash='practice-chapter-5';await new Promise(r=>w.setTimeout(r,5));assert.equal($('practice-subject').value,'All');assert.equal($('practice-difficulty').value,'All');assert.equal($('practice-chapter').value,'5');
 while(current()!=='practice-c05-q10')$('exercise-next').click();$('exercise-answer').value='0';$('check-answer').click();assert.equal($('exercise-feedback').className,'error','Zero must not pass a 1e-10 answer');
 $('exercise-answer').value='1e-10';$('check-answer').click();assert.equal($('exercise-feedback').className,'correct');
 change('practice-chapter',1);change('practice-difficulty','Intermediate');while(current()!=='practice-c01-q09')$('exercise-next').click();$('exercise-answer').value='2.0001';$('check-answer').click();assert.equal($('exercise-feedback').className,'error','Exact integer question');
 change('practice-difficulty','All');change('practice-chapter',6);while(current()!=='practice-c06-q05')$('exercise-next').click();$('exercise-answer').value='2,0';$('check-answer').click();assert.equal($('exercise-feedback').className,'correct');
 change('practice-chapter',1);$('exercise-answer').value='−2';$('check-answer').click();assert.equal($('exercise-feedback').className,'correct');
 await new Promise(r=>w.setTimeout(r,20));assert.deepEqual(errors,[]);dom.window.close();console.log(JSON.stringify({status:'PASS',exercisesChecked:checked,scope:'Actual index, all answers, preserved original content/progress, sixteen chapter sequences, four levels, hints/solution gating, empty filters, bounded navigation, deep links, tiny/exact/decimal-comma/signed inputs.'}));
})().catch(e=>{console.error(e);process.exitCode=1});
