const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const read=p=>fs.readFileSync('students/'+p,'utf8'),dom=new JSDOM(read('model-lab.html'),{url:'https://example.test/students/model-lab.html#beam',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document,errors=[];
 w.addEventListener('error',event=>errors.push(event.error||event.message));
 await new Promise(r=>w.addEventListener('load',r,{once:true}));
 for(const m of read('model-lab.html').matchAll(/src="([^"?]+\.js)/g))w.eval(read(m[1]));
 const downloads=[];w.MT_STUDY_EXPORT.download=(name,text,type)=>downloads.push({name,text,type});
 const tick=()=>new Promise(r=>w.setTimeout(r,5));
 async function select(id){const selector=d.getElementById('module');selector.value=id;selector.dispatchEvent(new w.Event('change'));await tick();assert.equal(d.getElementById('model-title').textContent,w.MT_EDUCATION_MODEL_SCHEMAS[id].title);}
 function input(key,value){const field=d.querySelector('#experiment [name="'+key+'"]');assert.ok(field,key);field.value=String(value);field.dispatchEvent(new w.Event('input',{bubbles:true}));}
 function valid(){assert.ok(d.getElementById('model-error').hidden,d.getElementById('model-error').textContent);assert.ok(!d.getElementById('model-chart').hasAttribute('hidden'));assert.ok(d.querySelectorAll('#model-results .metric').length>=3);assert.ok(d.querySelectorAll('#model-data th[scope="col"]').length>0);assert.ok(!/NaN|Infinity|undefined/.test(d.getElementById('model-results').textContent));}
 assert.equal(d.getElementById('module').options.length,17);
 for(const id of Object.keys(w.MT_EDUCATION_MODEL_SCHEMAS)){
  await select(id);valid();assert.ok(d.getElementById('model-chapter').querySelector('a').href.includes('#chapter-'));
  const plot=d.getElementById('plot-selector');for(const option of [...plot.options]){plot.value=option.value;plot.dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('#model-chart title').textContent.length>5);assert.ok(d.querySelector('#model-chart desc').textContent.length>20);}
  for(const kind of ['json','csv','svg','html']){d.querySelector('[data-model-save="'+kind+'"]').click();const download=downloads.at(-1);assert.ok(download.name.endsWith('.'+kind));assert.ok(download.text.length>100,kind+' nonempty');if(kind==='json'){const value=JSON.parse(download.text);assert.equal(value.model,'education-model-'+id);}if(kind==='svg'){assert.ok(download.text.startsWith('<svg'));assert.ok(!/<script|foreignObject|xlink:href/.test(download.text));}if(kind==='html'){assert.ok(download.text.includes('Model, equations and assumptions'));assert.ok(download.text.includes('study-snapshot'));}}
 }
 await select('beam');input('position',9);assert.ok(!d.getElementById('model-error').hidden);assert.ok(d.getElementById('model-chart').hasAttribute('hidden'));assert.ok([...d.querySelectorAll('[data-model-save]')].every(b=>b.disabled));input('position',3);valid();
 await select('transient');input('resistance',123);await select('cycle');await select('transient');assert.equal(d.querySelector('[name="resistance"]').value,'123');
 input('circuit','rl');assert.ok(d.querySelector('[name="storage"]').closest('label').textContent.includes('Inductance (mH)'));assert.ok(d.querySelector('[name="initial"]').closest('label').textContent.includes('(A)'));valid();
 await select('cycle');input('cycle','diesel');assert.ok(d.querySelector('[name="hot"]').closest('label').hidden);assert.ok(!d.querySelector('[name="cutoff"]').closest('label').hidden);valid();
 await select('refrigeration');input('h1',-600);input('h2',-550);input('h3',-800);valid();assert.ok(d.getElementById('model-results').textContent.includes('20'));input('h2',-600);assert.ok(!d.getElementById('model-error').hidden);input('h2',-550);valid();
 await select('lift-origins');input('loadMode','added');input('counterMode','added');valid();assert.ok(d.getElementById('model-results').textContent.includes('10150'));assert.ok(d.querySelector('[name="oldHeight"]').closest('label').hidden);
 // A mismatched/malicious scenario is rejected BEFORE replacing valid fields.
 const scenario=d.getElementById('model-scenario'),before=d.getElementById('model-results').textContent,raw=d.querySelector('[name="kg"]').value;
 Object.defineProperty(scenario,'files',{configurable:true,value:[{text:async()=>JSON.stringify({schema:'marine-tools-study-scenario',version:1,model:'education-model-beam',inputs:{kg:'<img src=x onerror=alert(1)>'}})}]});scenario.dispatchEvent(new w.Event('change'));await tick();
 assert.equal(d.querySelector('[name="kg"]').value,raw);assert.equal(d.getElementById('model-results').textContent,before);assert.ok(!d.querySelector('img[src="x"]'));
 d.querySelector('[data-model-save="json"]').click();const current=downloads.at(-1).text;
 input('weight',120);Object.defineProperty(scenario,'files',{configurable:true,value:[{text:async()=>current}]});scenario.dispatchEvent(new w.Event('change'));await tick();assert.equal(d.querySelector('[name="weight"]').value,'100');valid();
 assert.deepEqual(errors,[]);dom.window.close();console.log(JSON.stringify({status:'PASS',models:17,exports:downloads.length,scope:'Actual model DOM, all plot views and exports, per-model input retention, conditional fields, invalid-state clearing, signed enthalpies and transactional scenario import.'}));
})().catch(e=>{console.error(e);process.exitCode=1});
