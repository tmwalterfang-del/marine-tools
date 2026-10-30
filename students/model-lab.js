(function(){'use strict';
const $=id=>document.getElementById(id),M=window.MT_EDUCATION_MODELS,S=window.MT_EDUCATION_MODEL_SCHEMAS,E=window.MT_STUDY_EXPORT,NS='http://www.w3.org/2000/svg';
const fmt=E.displayValue,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const saved=Object.create(null),views=Object.create(null);let active='beam',last=null;
for(const [id,schema] of Object.entries(S)){const option=document.createElement('option');option.value=id;option.textContent=schema.title;$('module').append(option);}
function raw(){return Object.fromEntries(S[active].fields.map(f=>[f.key,$('experiment').elements.namedItem(f.key).value]));}
const visible=(f,p)=>!f.when||Object.entries(f.when).every(([key,value])=>p[key]===value);
function fieldLabel(f,p){if(active==='transient'&&f.key==='storage')return p.circuit==='rc'?'Capacitance (µF)':'Inductance (mH)';if(active==='transient'&&f.key==='initial')return p.circuit==='rc'?'Initial capacitor voltage (V)':'Initial inductor current (A)';return f.label+(f.unit?' ('+f.unit+')':'');}
function read(){const p=raw(),inputs={};for(const f of S[active].fields){if(f.options){inputs[f.key]=p[f.key];continue;}const value=Number(p[f.key]);if(!visible(f,p)){inputs[f.key]=p[f.key].trim()&&Number.isFinite(value)?value:f.value;continue;}if(!p[f.key].trim()||!Number.isFinite(value))throw RangeError('Complete '+fieldLabel(f,p)+'.');inputs[f.key]=value;}return inputs;}
function labels(){const p=raw();for(const f of S[active].fields){const input=$('experiment').elements.namedItem(f.key),label=input.closest('label');label.hidden=!visible(f,p);label.querySelector('span').textContent=fieldLabel(f,p);}}
function node(parent,tag,attrs={},text){const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));if(text!==undefined)el.textContent=text;parent.append(el);return el;}
function begin(svg,title,description){svg.replaceChildren();const prefix=svg.id;node(svg,'title',{id:prefix==='model-chart'?'model-chart-title':'beam-sketch-title'},title);node(svg,'desc',{id:prefix==='model-chart'?'model-chart-desc':'beam-sketch-desc'},description);}
function flowChart(model){const svg=$('model-chart');begin(svg,'Refrigeration cycle energy flow','Supplied enthalpy balance. '+fmt(model.cooling)+' kW absorbed plus '+fmt(model.work)+' kW compressor input equals '+fmt(model.rejected)+' kW rejected. Exact values are also in the table.');
 const width=value=>Math.max(4,70*value/model.rejected),blue='#126b91',gold='#9a6100',purple='#7140a0';
 function arrow(x1,y1,x2,y2,w,color){if(y1===y2){const head=Math.min(20,Math.abs(x2-x1)/4);node(svg,'polygon',{points:`${x1},${y1-w/2} ${x2-head},${y1-w/2} ${x2-head},${y1-w} ${x2},${y1} ${x2-head},${y1+w} ${x2-head},${y1+w/2} ${x1},${y1+w/2}`,fill:color});}else{node(svg,'polygon',{points:`${x1-w/2},${y1} ${x1+w/2},${y1} ${x1+w/2},${y2-20} ${x1+w},${y2-20} ${x1},${y2} ${x1-w},${y2-20} ${x1-w/2},${y2-20}`,fill:color});}}
 arrow(65,255,290,255,width(model.cooling),blue);arrow(400,75,400,195,width(model.work),gold);arrow(510,255,735,255,width(model.rejected),purple);
 node(svg,'rect',{x:290,y:195,width:220,height:120,rx:12,fill:'#edf3f6',stroke:'#526d7b'});
 node(svg,'text',{x:400,y:242,'text-anchor':'middle',fill:'#263d4b','font-size':19},'Refrigeration cycle');node(svg,'text',{x:400,y:273,'text-anchor':'middle',fill:'#263d4b','font-size':17},'COPcool = '+fmt(model.cop));
 for(const [x,y,label,value]of [[170,340,'Heat absorbed',model.cooling],[400,40,'Compressor input',model.work],[630,340,'Heat rejected',model.rejected]]){node(svg,'text',{x,y,'text-anchor':'middle',class:'tick'},label);node(svg,'text',{x,y:y+25,'text-anchor':'middle',class:'tick'},fmt(value)+' kW');}
 node(svg,'text',{x:400,y:410,'text-anchor':'middle',class:'tick'},'Heat rejected = heat absorbed + compressor input');$('model-legend').textContent='Band widths represent power in kW. Supplied enthalpies share one reference datum.';
}
function chart(){if(!last)return;const model=last.result,plot=model.plots.find(p=>p.id===$('plot-selector').value)||model.plots[0],svg=$('model-chart');svg.removeAttribute('hidden');
 const compact=svg.clientWidth>0&&svg.clientWidth<450;svg.classList.toggle('compact-plot',compact);
 if(plot.type==='flow'){flowChart(model);return;}
 const markers=(model.markers||[]).filter(m=>m.plot===plot.id),xs=model.data.map(p=>p[plot.x]),ys=model.data.flatMap(p=>plot.series.map(([key])=>p[key]));markers.forEach(m=>{xs.push(m.x);ys.push(m.y);});
 let xmin=Math.min(0,...xs),xmax=Math.max(...xs),ymin=Math.min(0,...ys),ymax=Math.max(0,...ys);if(xmax===xmin)xmax=xmin+1;if(ymax===ymin){ymax+=1;ymin-=1;}
 const yp=(ymax-ymin)*.08;ymin-=yp;ymax+=yp;
 const left=compact?140:88,right=768,top=32,bottom=365,X=x=>left+(x-xmin)/(xmax-xmin)*(right-left),Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top),divisions=compact?3:5,tick=value=>compact?(Math.abs(value)>=1e4||value!==0&&Math.abs(value)<.001?value.toExponential(1).replace('e+','e'):String(Number(value.toPrecision(3)))):fmt(value);
 begin(svg,S[active].title+' — '+plot.label,plot.x+' ('+plot.xUnit+') versus '+plot.label+' ('+plot.yUnit+'). '+plot.series.map(([,label])=>label).join('; ')+'. Full precision values appear in the numerical table.');
 for(let i=0;i<=divisions;i++){const x=xmin+i*(xmax-xmin)/divisions,y=ymin+i*(ymax-ymin)/divisions;node(svg,'line',{x1:X(x),x2:X(x),y1:top,y2:bottom,class:'grid'});node(svg,'text',{x:X(x),y:bottom+32,'text-anchor':i===0?'start':i===divisions?'end':'middle',class:'tick'},tick(x));node(svg,'line',{x1:left,x2:right,y1:Y(y),y2:Y(y),class:'grid'});node(svg,'text',{x:left-12,y:Y(y)+5,'text-anchor':'end',class:'tick'},tick(y));}
 node(svg,'line',{x1:left,x2:right,y1:Y(0),y2:Y(0),class:'axis'});node(svg,'line',{x1:X(0),x2:X(0),y1:top,y2:bottom,class:'axis'});
 node(svg,'text',{x:(left+right)/2,y:430,'text-anchor':'middle',class:'tick'},(plot.x==='x'?'Position':plot.x==='t'?'Time':plot.x==='volume'?'Volume':plot.x==='flow'?'Volume flow':plot.x==='heel'?'Heel':'Cycle state')+' ('+plot.xUnit+')');
 node(svg,'text',{x:18,y:200,transform:'rotate(-90 18 200)','text-anchor':'middle',class:'tick'},plot.label+' ('+plot.yUnit+')');
 const colors=['blue','gold','purple'];plot.series.forEach(([key,label],i)=>{node(svg,'polyline',{points:model.data.map(p=>X(p[plot.x]).toFixed(3)+','+Y(p[key]).toFixed(3)).join(' '),class:'curve curve-'+colors[i%3],'aria-label':label});});
 for(const mark of markers){node(svg,'circle',{cx:X(mark.x),cy:Y(mark.y),r:6,fill:'#9a6100',stroke:'#fff','stroke-width':2});node(svg,'text',{x:Math.min(right-5,X(mark.x)+9),y:Math.max(top+18,Y(mark.y)-12),'text-anchor':X(mark.x)>right-170?'end':'start',class:'tick'},mark.label);}
 if(model.kind==='cycle')for(const state of model.states){node(svg,'circle',{cx:X(state.volume),cy:Y(state.pressure),r:4,fill:'#9a6100'});node(svg,'text',{x:X(state.volume)+(state.state===1||state.state===4?-10:10),y:Y(state.pressure)-10,'text-anchor':state.state===1||state.state===4?'end':'start',class:'model-stage-label'},String(state.state));}
 $('model-legend').innerHTML=plot.series.map(([,label],i)=>'<span class="'+colors[i%3]+'">'+esc(label)+'</span>').join('');
}
function sketch(){const svg=$('beam-sketch'),hidden=!last||last.result.kind!=='beam';svg.toggleAttribute('hidden',hidden);if(hidden)return;const c=last.inputs,m=last.result,x=v=>90+620*v/c.length;
 begin(svg,'Beam supports and load positions','Span '+c.length+' m; point load '+c.force+' kN at '+c.position+' m; uniform load '+c.distributed+' kN per metre. Left reaction '+fmt(m.left)+' kN and right reaction '+fmt(m.right)+' kN.');
 node(svg,'line',{x1:90,x2:710,y1:115,y2:115,stroke:'#126b91','stroke-width':6});
 if(c.support==='simple')for(const pos of [90,710])node(svg,'polygon',{points:`${pos},118 ${pos-15},145 ${pos+15},145`,fill:'#9a6100'});
 else{node(svg,'line',{x1:90,x2:90,y1:75,y2:155,stroke:'#9a6100','stroke-width':7});for(let j=0;j<5;j++)node(svg,'line',{x1:73,x2:90,y1:80+j*16,y2:70+j*16,stroke:'#9a6100','stroke-width':2});}
 function down(pos,from,label){node(svg,'line',{x1:pos,x2:pos,y1:from,y2:104,stroke:'#7140a0','stroke-width':2});node(svg,'polygon',{points:`${pos},113 ${pos-6},101 ${pos+6},101`,fill:'#7140a0'});if(label)node(svg,'text',{x:pos,y:from-8,'text-anchor':'middle',class:'tick'},label);}
 if(c.distributed>0){for(let j=0;j<7;j++)down(110+580*j/6,83);node(svg,'text',{x:400,y:72,'text-anchor':'middle',class:'tick'},'q = '+fmt(c.distributed)+' kN/m');}
 if(c.force>0)down(x(c.position),35,'F = '+fmt(c.force)+' kN');
 node(svg,'text',{x:90,y:177,'text-anchor':'start',class:'tick'},'RA = '+fmt(m.left)+' kN');node(svg,'text',{x:710,y:177,'text-anchor':'end',class:'tick'},c.support==='simple'?'RB = '+fmt(m.right)+' kN':'L = '+fmt(c.length)+' m');
}
function metrics(model){switch(model.kind){
 case 'beam':return [['Left reaction',model.left,'kN'],['Right reaction',model.right,'kN'],['Maximum deflection',model.maxDeflection,'mm'],['Position of maximum',model.maximumX,'m'],['Maximum |moment|',model.maxMoment,'kN·m']];
 case 'transient':return [['Time constant τ',model.tau,'s'],['Final state',model.final,model.circuit==='rc'?'V':'A'],['Energy at displayed end',model.storedEnergy,'J']];
 case 'cycle':return [['Net cycle work',model.work,'kJ'],['Heat added',model.Qin,'kJ'],['Heat rejected',model.Qout,'kJ'],['Ideal efficiency',model.efficiency*100,'%']];
 case 'pump':return [['Operating flow',model.operating?model.flow:null,'m³/h'],['Operating head',model.head,'m'],['Shaft estimate',model.shaftPower,'kW'],['Available NPSH at duty',model.npshAvailable,'m'],['Supplied NPSHr at duty',model.npshRequired,'m'],['NPSH difference',model.npshMargin,'m']];
 case 'refrigeration':return [['Cooling effect',model.cooling,'kW'],['Compressor input',model.work,'kW'],['Heat rejected',model.rejected,'kW'],['Cooling COP',model.cop,''],['Heating COP',model.heatingCop,'']];
 case 'heavy':return [['Resulting displacement',model.mass,'t'],['Resulting KG',model.newKG,'m'],['Resulting TCG',model.TCG,'m'],['Initial GM after change',model.GM,'m'],['Restoring equilibrium',model.equilibrium,'°'],['Box-model angle limit',model.maximumAngle,'°']];
 default:throw Error('Unknown model result');}}
function tables(model){const rows=(headers,keys,data=model.data)=>({title:'Calculated data',rows:[headers,...data.map(p=>keys.map(key=>p[key]))]});switch(model.kind){
 case 'beam':return [rows(['Position (m)','Downward deflection (mm)','Bending moment (kN·m)','Shear (kN)'],['x','deflection','moment','shear'])];
 case 'transient':return [rows(['Time (s)','State ('+(model.circuit==='rc'?'V':'A')+')','Current (A)',(model.circuit==='rc'?'Capacitor':'Inductor')+' voltage (V)','Stored energy (J)'],['t','state','current','voltage','energy'])];
 case 'cycle':return [rows(['Process','Volume (L)','Absolute pressure (bar)'],['stage','volume','pressure']),{title:'Cycle state points',rows:[['State','Volume (L)','Absolute pressure (bar)','Temperature (K)'],...model.states.map(s=>[s.state,s.volume,s.pressure,s.temperature])]}];
 case 'pump':return [rows(['Flow (m³/h)','Pump head (m)','System head (m)','Available NPSH (m)'],['flow','pump','system','npsh'])];
 case 'refrigeration':return [{title:'Energy rates',rows:[['Transfer','Power (kW)'],...model.energy.map(e=>[e.name,e.value])]},rows(['State','Supplied enthalpy (kJ/kg)'],['stage','h'])];
 case 'heavy':return [rows(['Heel (°)','Initial lever (m)','Resulting net lever (m)','Resulting net mass moment (t·m)'],['heel','baseline','net','massMoment'])];
 default:throw Error('Unknown table model');}}
function renderTables(){const list=tables(last.result);$('model-data').innerHTML=list.map(table=>'<table><caption>'+esc(table.title)+'</caption><thead><tr>'+table.rows[0].map(label=>'<th scope="col">'+esc(label)+'</th>').join('')+'</tr></thead><tbody>'+table.rows.slice(1).map(row=>'<tr>'+row.map(value=>'<td>'+esc(fmt(value))+'</td>').join('')+'</tr>').join('')+'</tbody></table>').join('');}
function clear(error){last=null;$('model-error').textContent=error.message||String(error);$('model-error').hidden=false;$('model-results').replaceChildren();$('model-warning').hidden=true;$('model-chart').setAttribute('hidden','');$('beam-sketch').setAttribute('hidden','');$('model-legend').textContent='';$('model-data').textContent='Enter a valid state to calculate this model.';$('plot-selector').disabled=true;for(const button of document.querySelectorAll('[data-model-save]'))button.disabled=true;}
function update(){labels();saved[active]=raw();try{const inputs=read(),result=M[S[active].fn](inputs);last={inputs,result};$('model-error').hidden=true;$('model-warning').hidden=!result.warning;$('model-warning').textContent=result.warning||'';$('model-results').innerHTML=metrics(result).map(([label,value,unit])=>'<div class="metric"><small>'+esc(label)+'</small><strong>'+(value===null?'—':esc(fmt(value)))+(unit?' <small>'+esc(unit)+'</small>':'')+'</strong></div>').join('');
  const selected=views[active]||result.plots[0].id;$('plot-selector').innerHTML=result.plots.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.label)+'</option>').join('');$('plot-selector').value=result.plots.some(p=>p.id===selected)?selected:result.plots[0].id;$('plot-selector').disabled=false;
  chart();sketch();renderTables();for(const button of document.querySelectorAll('[data-model-save]'))button.disabled=false;
 }catch(error){clear(error);}}
// Snapshot cached values before replacing focused controls: browser blur/change can reenter update.
function select(id){if(last)saved[active]=raw();active=Object.hasOwn(S,id)?id:'beam';const schema=S[active],restored={...(saved[active]||{})};$('module').value=active;$('model-title').textContent=schema.title;$('model-description').textContent=schema.description;$('model-chapter').innerHTML='<a target="_top" href="./#chapter-'+schema.chapter+'">Open chapter '+schema.chapter+' formulas →</a> · <a target="_top" href="./#practice-chapter-'+schema.chapter+'">Try chapter '+schema.chapter+' exercises →</a>';$('model-notes').innerHTML=schema.notes.map(note=>'<li>'+esc(note)+'</li>').join('');$('model-fields').innerHTML=schema.fields.map(f=>'<label><span>'+esc(fieldLabel(f,{}))+'</span>'+(f.options?'<select name="'+esc(f.key)+'">'+f.options.map(([value,label])=>'<option value="'+esc(value)+'">'+esc(label)+'</option>').join('')+'</select>':'<input type="number" required step="any" name="'+esc(f.key)+'" min="'+f.min+'" max="'+f.max+'">')+'</label>').join('');for(const f of schema.fields)$('experiment').elements.namedItem(f.key).value=restored[f.key]??f.value;$('model-feedback').textContent='';update();}
function snapshot(){if(!last)throw Error('Calculate a valid model before exporting.');const result=last.result,inputNames=Object.fromEntries(S[active].fields.map(f=>[fieldLabel(f,last.inputs),last.inputs[f.key]])),resultNames=Object.fromEntries(metrics(result).map(([label,value,unit])=>[label+(unit?' ('+unit+')':''),value]));return {model:'education-model-'+active,modelVersion:'2026-10-30',title:S[active].title,inputs:inputNames,results:resultNames,notes:S[active].notes,charts:[{svg:E.svgSnapshot($('model-chart')),caption:$('plot-selector').selectedOptions[0].textContent}],tables:tables(result)};}
function save(kind){try{if(!last)throw Error('Calculate a valid model first.');const name='MarineTools-'+active;
 if(kind==='json')E.download(name+'.json',E.scenario('education-model-'+active,last.inputs),'application/json');
 else if(kind==='svg')E.download(name+'.svg',E.svgSnapshot($('model-chart')),'image/svg+xml');
 else if(kind==='html')E.download(name+'.html',E.report(snapshot()),'text/html');
 else if(kind==='csv'){const data=tables(last.result),rows=[];for(const table of data){if(rows.length)rows.push([]);rows.push([table.title],...table.rows);}E.download(name+'.csv',E.csv(rows),'text/csv');}
 $('model-feedback').textContent='Saved '+kind.toUpperCase()+' for the current valid state.';
 }catch(error){$('model-feedback').textContent=error.message;}}
$('module').addEventListener('change',()=>{location.hash=$('module').value;});window.addEventListener('hashchange',()=>select(location.hash.slice(1)));
$('experiment').addEventListener('submit',event=>{event.preventDefault();update();});$('experiment').addEventListener('input',update);$('experiment').addEventListener('change',update);
$('plot-selector').addEventListener('change',()=>{views[active]=$('plot-selector').value;chart();});$('reset-model').addEventListener('click',()=>{delete saved[active];delete views[active];last=null;select(active);});
for(const button of document.querySelectorAll('[data-model-save]'))button.addEventListener('click',()=>save(button.dataset.modelSave));
$('model-scenario').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{
 const text=await file.text(),inputs=E.parseScenario(text,'education-model-'+active,S[active].fields.map(f=>f.key));for(const f of S[active].fields){const value=inputs[f.key];if(f.options?!f.options.some(([key])=>key===value):typeof value!=='number'||!Number.isFinite(value)||value<f.min||value>f.max)throw Error('Invalid scenario field: '+f.key);}M[S[active].fn](inputs);
 // Validate the complete scenario BEFORE replacing any current input or result.
 saved[active]=Object.fromEntries(Object.entries(inputs).map(([key,value])=>[key,String(value)]));last=null;select(active);$('model-feedback').textContent='Scenario restored and recalculated.';
 }catch(error){$('model-feedback').textContent=error.message;}finally{event.target.value='';}});
window.MT_EDUCATION_SNAPSHOT=snapshot;
window.addEventListener('resize',()=>{if(last)chart();});
select(location.hash.slice(1));
})();
