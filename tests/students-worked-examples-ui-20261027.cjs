const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const read=p=>fs.readFileSync('students/'+p,'utf8');
(async()=>{
 const dom=new JSDOM(read('index.html'),{url:'https://example.test/students/#formulas',runScripts:'outside-only'}),w=dom.window,d=w.document;
 await new Promise(r=>w.addEventListener('load',r,{once:true}));
 for(const m of read('index.html').matchAll(/src="([^"?]+\.js)/g))w.eval(read(m[1]));
 const change=id=>d.getElementById(id).dispatchEvent(new w.Event('change'));
 const cards=()=>[...d.querySelectorAll('#formula-grid .formula-card')];
 const examples=w.MT_STUDY.workedExamples;
 assert.equal(Object.keys(examples).length,22);
 const openModels=w.MT_STUDY.sourceEquationRegister.filter(r=>r.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT');
 assert.equal(openModels.length,6);assert.ok(openModels.every(r=>!examples[r.id]));
 d.getElementById('worked-only').checked=true;change('worked-only');
 assert.equal(cards().length,12);assert.equal(d.querySelectorAll('#formula-grid .worked-example').length,22);
 assert.equal(d.getElementById('formula-count').textContent,'12 / 575');
 for(const [id,c] of Object.entries(examples)){
  const source=d.getElementById(id),example=source.querySelector('.worked-example');
  assert.ok(example);assert.equal(example.open,false);
  for(const key of Object.keys(c.inputs))assert.ok(example.querySelector('ul').textContent.includes(key+' = '));
  assert.ok(example.textContent.includes(c.reference));
  assert.ok(example.textContent.includes('Use the stated conditions.'));
  assert.ok(source.textContent.includes('Conditions:'));
 }
 assert.ok(d.querySelector('#book-mechanics-p32-r03 .worked-result').textContent.includes('20 N'));
 assert.ok(d.querySelector('#book-mechanics-p33-r02 .worked-result').textContent.includes('6.2831853 mm'));
 assert.ok(d.querySelector('#book-mechanics-p32-r04 .worked-result').textContent.includes('0.02 (dimensionless)'));
 // Small electrical quantities must remain nonzero in the display.
 const drop=d.querySelector('#book-c6-p81-r10 .worked-example');
 assert.ok(drop.textContent.includes('1.72E-8 Ω·m'));
 assert.ok(drop.textContent.includes('2.5E-6 m²'));
 assert.ok(drop.textContent.includes('2.752 V'));
 const dropChoice=drop.querySelector('select');drop.open=true;dropChoice.focus();dropChoice.value='1';dropChoice.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(drop.querySelector('summary').textContent.includes('0 V'));
 assert.ok(drop.querySelector('.worked-case-content').textContent.includes('zero current'));
 assert.equal(d.activeElement,dropChoice);assert.ok(drop.open);
 const emf=d.querySelector('#book-c6-p85-r06 .worked-example'),choose=emf.querySelector('select');
 assert.ok(emf.querySelector('summary').textContent.includes('−6 V')||emf.querySelector('summary').textContent.includes('-6 V'));
 choose.value='1';choose.dispatchEvent(new w.Event('change',{bubbles:true}));assert.ok(emf.querySelector('.worked-result').textContent.includes('6 V'));assert.ok(emf.textContent.includes('loses 0.6'));
 choose.value='2';choose.dispatchEvent(new w.Event('change',{bubbles:true}));assert.ok(emf.querySelector('.worked-result').textContent.includes('0 V'));assert.ok(emf.textContent.includes('No change in flux linkage'));
 const energy=d.querySelector('#book-c6-p86-r04 .worked-example'),energyChoice=energy.querySelector('select');energyChoice.value='1';energyChoice.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(energy.querySelector('.worked-case-content').textContent.includes('I = -3 A'));assert.ok(energy.querySelector('.worked-result').textContent.includes('1.8 J'));
 // A saved sheet has its own local choice and no duplicate selector ID.
 d.querySelector('[data-fav="resistance-from-resistivity"]').click();
 const savedDrop=d.querySelector('#sheet-formulas [data-worked-id="book-c6-p81-r10"]');assert.ok(savedDrop);savedDrop.value='1';savedDrop.dispatchEvent(new w.Event('change',{bubbles:true}));assert.ok(savedDrop.closest('.worked-example').querySelector('.worked-result').textContent.includes('0 V'));
 d.querySelector('[data-fav="resistance-from-resistivity"]').click();
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
 console.log(JSON.stringify({status:'PASS',examples:22,families:12,scope:'Units, assumptions, filter intersections/reset, saved sheet, keyboard focus and escaped example text'}));w.close();
})().catch(e=>{console.error(e);process.exitCode=1});
