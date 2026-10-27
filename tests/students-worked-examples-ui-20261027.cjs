const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const read=p=>fs.readFileSync('students/'+p,'utf8');
(async()=>{
 const dom=new JSDOM(read('index.html'),{url:'https://example.test/students/#formulas',runScripts:'outside-only'}),w=dom.window,d=w.document;
 await new Promise(r=>w.addEventListener('load',r,{once:true}));
 for(const m of read('index.html').matchAll(/src="([^"?]+\.js)/g))w.eval(read(m[1]));
 const change=id=>d.getElementById(id).dispatchEvent(new w.Event('change'));
 const cards=()=>[...d.querySelectorAll('#formula-grid .formula-card')];
 const examples=w.MT_STUDY.workedExamples;
 assert.equal(Object.keys(examples).length,10);
 const openModels=w.MT_STUDY.sourceEquationRegister.filter(r=>r.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT');
 assert.equal(openModels.length,6);assert.ok(openModels.every(r=>!examples[r.id]));
 d.getElementById('worked-only').checked=true;change('worked-only');
 assert.equal(cards().length,3);assert.equal(d.querySelectorAll('#formula-grid .worked-example').length,10);
 assert.equal(d.getElementById('formula-count').textContent,'3 / 575');
 for(const [id,c] of Object.entries(examples)){
  const source=d.getElementById(id),example=source.querySelector('.worked-example');
  assert.ok(example);assert.equal(example.open,false);
  for(const key of Object.keys(c.inputs))assert.ok(example.querySelector('ul').textContent.includes(key+' = '));
  assert.ok(example.textContent.includes(c.reference));
  assert.ok(example.textContent.includes('full model domain'));
  assert.ok(source.textContent.includes('Conditions:'));
 }
 assert.ok(d.querySelector('#book-mechanics-p32-r03 .worked-result').textContent.includes('20 N'));
 assert.ok(d.querySelector('#book-mechanics-p33-r02 .worked-result').textContent.includes('6.28319 mm'));
 assert.ok(d.querySelector('#book-mechanics-p32-r04 .worked-result').textContent.includes('0.02 (dimensionless)'));
 const button=d.querySelector('[data-examples="sliding-friction-model"]');button.click();
 const card=button.closest('.formula-card');
 assert.ok([...card.querySelectorAll('.formula-explanation,.related-equations,.worked-example')].every(n=>n.open));
 assert.equal(d.activeElement,card.querySelector('.worked-example summary'));
 card.querySelector('[data-fav]').click();d.getElementById('saved-only').checked=true;change('saved-only');
 assert.equal(cards().length,1);assert.equal(d.querySelectorAll('#sheet-formulas .worked-example').length,3);
 d.getElementById('library-home-link').click();await new Promise(r=>w.setTimeout(r,30));assert.equal(cards().length,48);assert.equal(d.getElementById('worked-only').checked,false);
 d.getElementById('worked-only').checked=true;change('worked-only');
 const search=d.getElementById('formula-search');search.value='rolling';search.dispatchEvent(new w.Event('input'));assert.equal(cards().length,1);
 search.value='nonexistent topic';search.dispatchEvent(new w.Event('input'));assert.equal(cards().length,0);assert.ok(d.querySelector('#formula-grid .placeholder'));
 w.location.hash='chapter-2';await new Promise(r=>w.setTimeout(r,0));assert.equal(d.getElementById('worked-only').checked,false);assert.ok(cards().length>0);
 // Authored text is still escaped if a future fixture contains HTML-like content.
 examples['book-mechanics-p32-r03'].reference='<img src=x onerror="alert(1)">';d.getElementById('library-home-link').click();search.value='rolling';search.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelectorAll('.worked-example img').length,0);assert.ok(d.querySelector('.worked-example').textContent.includes('<img'));
 console.log(JSON.stringify({status:'PASS',examples:10,families:3,scope:'Units, assumptions, filter intersections/reset, saved sheet, keyboard focus and escaped example text'}));w.close();
})().catch(e=>{console.error(e);process.exitCode=1});
