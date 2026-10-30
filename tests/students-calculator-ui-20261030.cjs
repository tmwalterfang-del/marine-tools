const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const read=p=>fs.readFileSync('students/'+p,'utf8'),dom=new JSDOM(read('index.html'),{url:'https://example.test/students/#calculators',runScripts:'outside-only'}),w=dom.window,d=w.document;
 await new Promise(r=>w.addEventListener('load',r,{once:true}));
 for(const match of read('index.html').matchAll(/src="([^"?]+\.js)/g))w.eval(read(match[1]));
 function calculate(id,values){const select=d.getElementById('calc-selector');select.value=id;select.dispatchEvent(new w.Event('change'));for(const [key,value] of Object.entries(values)){const input=d.querySelector('#calc-fields [name="'+key+'"]');assert.ok(input,id+' '+key);input.value=String(value);}d.getElementById('calc-fields').dispatchEvent(new w.Event('input',{bubbles:true}));return d.getElementById('calc-output');}
 for(const [id,values,expected] of [
  ['three-phase',{pf:0},'0'],['buck-converter',{duty:0},'0'],
  ['wet-steam-enthalpy',{x:0},'500'],['amp-feedback',{beta:0},'100'],
  ['battery-runtime',{dod:0},'0'],['refrigeration-cop',{h1:-700,h2:-650,h4:-900},'4'],
  ['cooling-cop',{h1:-700,h2:-650,h4:-900},'4'],['turbine-drop',{inlet:-800,outlet:-1100},'300'],
  ['annuity-pv',{payment:100,r:1e-14,periods:5},'500'],['annuity-payment',{pv:500,rate:1e-14,periods:5},'100'],
 ]){const result=calculate(id,values);assert.ok(!result.querySelector('.error'),id+' valid UI input');assert.ok(result.querySelector('strong').textContent.startsWith(expected+' '),id+': '+result.textContent);}
 for(const value of [-.01,1.01])assert.ok(calculate('buck-converter',{duty:value}).querySelector('.error'),'Duty outside closed interval rejected');
 assert.ok(calculate('ohms-law',{res:0}).querySelector('.error'),'A denominator still requires positive resistance');
 assert.ok(calculate('refrigeration-cop',{h1:300,h2:300,h4:100}).querySelector('.error'),'Equal enthalpies cannot create an infinite COP');
 const tiny=calculate('displacement',{volume:1e-8,density:1});assert.ok(tiny.querySelector('strong').textContent.includes('1E-8'),'A small nonzero answer stays visible');
 assert.ok(d.getElementById('calc-steps').textContent.includes('1E-8'),'Worked final step does not round the same result to zero');
 function sourceCard(id){const row=w.MT_STUDY.sourceEquationRegister.find(r=>r.id===id),formula=w.MT_FORMULAS.find(f=>f.id===row.formulaId),search=d.getElementById('formula-search');search.value=formula.name;search.dispatchEvent(new w.Event('input'));const card=d.getElementById(id);assert.ok(card,id+' rendered after library search');return card;}
 const rhumb=sourceCard('book-c13-p190-r03');assert.ok(rhumb.textContent.includes('Reference-case checks recorded'),'Fresh evidence visible in source record');
 assert.ok(rhumb.textContent.includes('RADIANS'),'Corrected rhumb angular basis visible');
 assert.ok(sourceCard('book-mechanics-p48-r02').textContent.includes('excluded from supported calculations'),'Unsupported historical head is not shown as a passed calculation');
 dom.window.close();console.log(JSON.stringify({status:'PASS',scope:'Actual calculator DOM: closed endpoints, negative enthalpy datum, near-zero rates, rejected singular inputs, scientific tiny results and visible review evidence.'}));
})().catch(e=>{console.error(e);process.exitCode=1});
