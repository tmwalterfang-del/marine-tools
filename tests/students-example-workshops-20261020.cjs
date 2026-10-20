const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++},near=(v,e)=>ok(Math.abs(v-e)<1e-8,JSON.stringify({v,e}));
const dom=new JSDOM(read('students/examples.html'),{url:'https://example.test/students/examples.html#lifting',runScripts:'outside-only'}),w=dom.window,d=w.document;
for(const f of ['example-models.js','study-export.js','example-schemas.js','examples.js'])w.eval(read('students/'+f));
const M=w.MT_EXAMPLE_MODELS,UI=w.MT_EXAMPLE_UI,defs=w.MT_EXAMPLE_SCHEMAS,E=w.MT_STUDY_EXPORT,defaults=id=>Object.fromEntries(defs[id].fields.map(f=>[f[0],f[2]]));
near(M.lifting(defaults('lifting')).results['Suspended-load KG (m)'],7.4);
near(M.lifting(defaults('lifting')).results['Corrected GM (m)'],1.54);
near(M.lifting({...defaults('lifting'),ballast:2000/12}).results['TCG (m)'],0);
const t=M.trim(defaults('trim')).results;near(t['Trim change (cm)'],-100);near(t['Forward draft (m)'],20/3);near(t['Aft draft (m)'],17/3);
near(M.trim({...defaults('trim'),operation:'shift'}).results['Parallel sinkage (m)'],0);
near(M.trim({...defaults('trim'),operation:'discharge'}).results['Trim change (cm)'],100);
near(M.tank(defaults('tank')).results['FSM (t m)'],524.8);
near(M.tank({...defaults('tank'),divisions:2}).results['FSM (t m)'],131.2);
near(M.tank({...defaults('tank'),fill:0}).results['Free-surface correction (m)'],0);
near(M.tank({...defaults('tank'),fill:100}).results['Free-surface correction (m)'],0);
near(M.pump(defaults('pump')).results['Operating flow (m3/h)'],Math.sqrt(5000));
near(M.pump(defaults('pump')).results['System head at operating flow (m)'],20);
near(M.pump({...defaults('pump'),speed:.4}).results['Operating flow (m3/h)'],0);
const c=M.crank(defaults('crank')).results;near(c['Estimated bottom reading (µm)'],-6);near(c['Vertical difference T−B (µm)'],18);near(c['Horizontal difference P−S (µm)'],1);near(c['Harmonic closure residual (µm)'],1);
const fault=M.faults({...defaults('faults'),running:'no',valve:'no',flow:10}).results;near(fault['Flagged checks'],3);ok(fault['First branch']==='Pump not running','Decision priority visible');ok(fault['All flagged observations'].includes('Low measured flow'),'Concurrent observations are not hidden');
for(const id of Object.keys(defs)){
 UI.select(id);ok(!d.getElementById('error').hidden===false,id+' valid defaults render');
 const s=UI.snapshot();ok(s.charts[0].svg.includes('<svg')&&s.tables[0].rows.length>2,id+' graph and data');
 ok(!new w.DOMParser().parseFromString(s.charts[0].svg,'image/svg+xml').querySelector('parsererror'),id+' valid standalone SVG');
 ok(E.report(s).includes(defs[id].title),id+' report');ok(E.csv(s.tables[0].rows).length>30,id+' CSV');
 const p=defaults(id);UI.restore(E.scenario('explorer-'+id,p));ok(d.getElementById('chart').querySelector('path'),id+' imported scenario recomputes graph');
 const field=defs[id].fields.find(f=>!f[3])[0],el=d.getElementById('experiment').elements.namedItem(field),previous=el.value;
 const bad={...p,[field]:null};assert.throws(()=>UI.restore(E.scenario('explorer-'+id,bad)));checks++;ok(el.value===previous,id+' invalid import is transactional');
 el.value='';el.dispatchEvent(new w.Event('input',{bubbles:true}));ok(!d.getElementById('error').hidden&&!d.getElementById('chart').children.length,id+' missing input clears stale output');assert.throws(()=>UI.snapshot());checks++;
 UI.restore(E.scenario('explorer-'+id,p));
}
for(const [id,extra]of [['tank',{divisions:1.5}],['pump',{efficiency:0}],['lifting',{mass:20000}],['trim',{mct:0}],['crank',{top:Infinity}],['faults',{running:'unknown'}]]){assert.throws(()=>M[id]({...defaults(id),...extra}));checks++}
console.log(checks+' example workshop checks passed');w.close();
