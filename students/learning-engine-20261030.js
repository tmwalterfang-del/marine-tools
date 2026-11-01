/* Local learning state and self-test scoring. No network or account dependency. */
(function(root){'use strict';
const KEY='mt-student-learning-v2',LEVELS=['Foundation','Applied','Intermediate','Advanced'];
const clone=value=>JSON.parse(JSON.stringify(value));
function parseAnswer(raw){const text=String(raw??'').trim().replace(/−/g,'-').replace(',','.');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)&&Number.isFinite(Number(text))?Number(text):null;}
function grade(question,raw){const value=parseAnswer(raw);return {valid:value!==null,value,correct:value!==null&&Math.abs(value-question.expected)<=Math.max(question.tolerance??0,Math.abs(question.expected)*(question.relativeTolerance??.001))};}
function feedback(question,raw){const result=grade(question,raw);if(!result.valid)return {...result,message:'Enter a finite number using a decimal point or comma, without thousands separators.'};if(result.correct)return {...result,message:'Correct within the answer tolerance.'};
 const answer=question.expected,near=(a,b)=>Math.abs(a-b)<=Math.max(Math.abs(b)*.002,Number.MIN_VALUE),unit=question.unit||'',value=result.value;
 let message='Not quite. '+(question.hint||'Write down the known values, choose the relation and check the requested unit.');
 if(answer!==0&&near(value,-answer))message='The magnitude matches, but the sign is opposite. Check the positive direction and any subtraction in your calculation.';
 else if(unit==='rad'&&near(value,answer*180/Math.PI))message='Your value matches the angle expressed in degrees. The requested unit is radians: a full turn is 2π rad.';
 else if(unit==='°'&&near(value,answer*Math.PI/180))message='Your value matches the angle expressed in radians. The requested unit is degrees: a full turn is 360°.';
 else if(unit==='%'&&near(value,answer/100))message='The answer is requested as a percentage. Convert a fractional value to percent by multiplying by 100.';
 else if(!unit&&/fraction|fractional/i.test(question.prompt)&&near(value,answer*100))message='Enter a fraction rather than a percentage. Divide a percentage by 100.';
 else if(answer!==0){const ratio=value/answer;const factor=[1e6,1000,100,60,3600,.000001,.001,.01,1/60,1/3600].find(n=>near(ratio,n));if(factor&&unit){const scale=factor<1?1/factor:factor;message='Your value differs by a factor of '+Number(scale.toPrecision(6)).toLocaleString('en-GB')+'. Check the unit conversions'+(/²/.test(unit)?'; area conversions use the square of the length factor':/³/.test(unit)?'; volume conversions use the cube of the length factor':'')+'.';}}
 return {...result,message};
}
function questionSnapshot(e){return {id:e.id,prompt:e.prompt,expected:e.expected,unit:e.unit||'',chapter:e.chapter,level:e.level||'Foundation',difficulty:e.difficulty??0,hint:e.hint||e.steps?.[0]||'',steps:[...(e.steps||[])],tolerance:e.tolerance??0,relativeTolerance:e.relativeTolerance??.001};}
function validItem(e){return e&&typeof e.id==='string'&&e.id.length<120&&typeof e.prompt==='string'&&e.prompt.length<=2000&&Number.isFinite(e.expected)&&typeof e.unit==='string'&&e.unit.length<100&&Number.isInteger(e.chapter)&&e.chapter>=1&&e.chapter<=16&&LEVELS.includes(e.level)&&Number.isFinite(e.tolerance)&&e.tolerance>=0&&Number.isFinite(e.relativeTolerance)&&e.relativeTolerance>=0&&Array.isArray(e.steps)&&e.steps.length<=30&&e.steps.every(s=>typeof s==='string'&&s.length<=3000);}
function create({bank,chapters=[],read=()=>null,write=()=>false,legacyCompleted=[],now=()=>Date.now(),random=Math.random}){
 const byId=new Map(bank.map(e=>[e.id,e])),ordered=[...bank].sort((a,b)=>a.chapter-b.chapter||a.difficulty-b.difficulty),ids=new Set(byId.keys());
 let writable=true,storageState='saved',data={version:1,completed:[],practice:{},lastQuestion:null,activeTest:null,history:[]};
 let stored;try{stored=read(KEY);}catch{storageState='unavailable';}
 const known=list=>Array.isArray(list)?[...new Set(list.filter(id=>ids.has(id)))]:[];
 const cleanTest=(t,submitted)=>{if(!t||typeof t.id!=='string'||t.id.length>100||!Array.isArray(t.items)||t.items.length<1||t.items.length>50||!t.items.every(validItem)||new Set(t.items.map(q=>q.id)).size!==t.items.length||!Number.isFinite(t.startedAt))return null;
  if(!submitted&&t.items.some(q=>!ids.has(q.id)))return null;
  const answers={};for(const q of t.items)if(typeof t.answers?.[q.id]==='string')answers[q.id]=t.answers[q.id].slice(0,100);
  const test={id:t.id,items:clone(t.items),answers,startedAt:t.startedAt,index:Math.max(0,Math.min(t.items.length-1,Number.isInteger(t.index)?t.index:0))};
  if(submitted){if(!Number.isFinite(t.submittedAt))return null;test.submittedAt=t.submittedAt;test.grades=test.items.map(q=>({id:q.id,...grade(q,answers[q.id]??''),raw:answers[q.id]??'',unanswered:!(answers[q.id]??'').trim()}));test.score=test.grades.filter(g=>g.correct).length;}return test;
 };
 if(stored&&stored.version!==1){writable=false;storageState='incompatible';}
 else if(stored){data.completed=known(stored.completed);if(stored.practice&&typeof stored.practice==='object'&&!Array.isArray(stored.practice)){for(const id of ids){const p=stored.practice[id];if(p&&typeof p==='object')data.practice[id]={raw:typeof p.raw==='string'?p.raw.slice(0,100):'',attempts:Number.isInteger(p.attempts)?Math.max(0,Math.min(p.attempts,1e7)):0};}}
  if(ids.has(stored.lastQuestion))data.lastQuestion=stored.lastQuestion;data.activeTest=cleanTest(stored.activeTest,false);data.history=(Array.isArray(stored.history)?stored.history:[]).map(t=>cleanTest(t,true)).filter(Boolean).slice(0,10);
 }
 data.completed=known([...data.completed,...known(legacyCompleted)]);
 function save(){if(!writable)return false;try{const ok=write(KEY,clone(data));storageState=ok===false?'unavailable':'saved';return ok!==false;}catch{storageState='unavailable';return false;}}
 function record(id,raw){if(!ids.has(id))throw Error('Exercise not found.');const p=data.practice[id]||(data.practice[id]={raw:'',attempts:0});p.raw=String(raw??'').slice(0,100);return p;}
 function resume(chapter){const candidates=ordered.filter(e=>!chapter||e.chapter===Number(chapter)),last=byId.get(data.lastQuestion),complete=new Set(data.completed);if(last&&candidates.includes(last)&&!complete.has(last.id))return last.id;return candidates.find(e=>!complete.has(e.id))?.id??candidates[0]?.id??null;}
 function attempt(id,raw){const q=byId.get(id),p=record(id,raw),result=feedback(q,raw);if(result.valid){p.attempts++;if(result.correct&&!data.completed.includes(id))data.completed.push(id);}data.lastQuestion=id;save();return result;}
 function startTest({chapters:selected,level='All',count=10}){if(data.activeTest)throw Error('Resume or discard the current self-test before starting another.');const choices=[...new Set(selected??[])].filter(c=>Number.isInteger(c)&&c>=1&&c<=16);if(!choices.length)throw Error('Choose at least one chapter.');if(level!=='All'&&!LEVELS.includes(level))throw Error('Choose a valid difficulty.');const pool=bank.filter(e=>choices.includes(e.chapter)&&(level==='All'||e.level===level));if(!Number.isInteger(count)||count<1||count>50||count>pool.length)throw Error('Choose between 1 and '+Math.min(50,pool.length)+' questions.');
  const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const r=random();if(!Number.isFinite(r)||r<0||r>=1)throw Error('Question selection failed.');const j=Math.floor(r*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const time=now();data.activeTest={id:'test-'+time+'-'+Math.floor(random()*1e9).toString(36),items:shuffled.slice(0,count).map(questionSnapshot),answers:{},startedAt:time,index:0};save();return clone(data.activeTest);
 }
 function submitTest(){const t=data.activeTest;if(!t)throw Error('No self-test is active.');const result=cleanTest({...t,submittedAt:now()},true);for(const q of result.items){const r=result.grades.find(g=>g.id===q.id);if(ids.has(q.id)&&r.valid){const p=record(q.id,r.raw);p.attempts++;if(r.correct&&!data.completed.includes(q.id))data.completed.push(q.id);}}
  data.history=[result,...data.history.filter(h=>h.id!==result.id)].slice(0,10);data.activeTest=null;save();return clone(result);
 }
 return {
  key:KEY,levels:[...LEVELS],get storageState(){return storageState;},get completed(){return [...data.completed];},
  summary(){const complete=new Set(data.completed);return chapters.map(c=>{const questions=bank.filter(e=>e.chapter===c.number);return {number:c.number,title:c.title,total:questions.length,completed:questions.filter(e=>complete.has(e.id)).length,levels:LEVELS.map(level=>({level,total:questions.filter(e=>e.level===level).length,completed:questions.filter(e=>e.level===level&&complete.has(e.id)).length})),resume:resume(c.number)};});},
  resume,open(id){if(ids.has(id)){data.lastQuestion=id;save();}},draft(id){return clone(data.practice[id]??{raw:'',attempts:0});},setAnswer(id,raw){record(id,raw);save();},attempt,
  pool(selected,level='All'){return bank.filter(e=>selected.includes(e.chapter)&&(level==='All'||e.level===level));},
  startTest,get activeTest(){return clone(data.activeTest);},get history(){return clone(data.history);},
  answerTest(id,raw){const t=data.activeTest;if(!t||!t.items.some(q=>q.id===id))throw Error('Question not in the active self-test.');t.answers[id]=String(raw??'').slice(0,100);save();},
  moveTest(index){const t=data.activeTest;if(t&&Number.isInteger(index)&&index>=0&&index<t.items.length){t.index=index;save();}},
  submitTest,discardTest(){data.activeTest=null;save();},
  reset(){data={version:1,completed:[],practice:{},lastQuestion:null,activeTest:null,history:[]};save();},flush:save
 };
}
root.MT_LEARNING_ENGINE={create,parseAnswer,grade,feedback,questionSnapshot,levels:LEVELS,key:KEY};
})(typeof window!=='undefined'?window:globalThis);
