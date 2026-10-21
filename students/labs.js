(function(){
'use strict';
const M=window.MT_LABS,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const f=(v,d=2)=>v.toLocaleString('en-GB',{maximumFractionDigits:d,minimumFractionDigits:d});
const datasets={},invalid={};
const formIds=['stability','signal','pid','engine'];
function values(form){const out={};for(const input of form.elements){if(!input.name)continue;if(input.type==='checkbox'){out[input.name]=input.checked;continue}if(input.type==='number'){if(!input.value.trim())throw RangeError('Complete every numerical input.');out[input.name]=Number(input.value)}else out[input.name]=input.value}return out}
function persist(){try{const state={version:1};for(const id of formIds)state[id]=values($(id+'-form'));localStorage.setItem('mt-student-labs-v1',JSON.stringify(state))}catch{}}
try{const saved=JSON.parse(localStorage.getItem('mt-student-labs-v1'));if(saved?.version===1)for(const id of formIds)for(const input of $(id+'-form').elements){if(!input.name||saved[id]?.[input.name]===undefined)continue;if(input.type==='checkbox')input.checked=saved[id][input.name]===true;else input.value=saved[id][input.name]}}catch{}
function metric(label,value){return '<div class="metric"><small>'+label+'</small><strong>'+value+'</strong></div>'}
function table(id,caption,headers,rows){$(id).innerHTML='<div class="table-wrap"><table><caption>'+caption+'</caption><thead><tr>'+headers.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function element(svg,tag,attrs,text){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;svg.appendChild(n);return n}
function clear(svg){for(const n of [...svg.children])if(!['title','desc'].includes(n.tagName.toLowerCase()))n.remove()}
function chart(id,series,{xmin=0,xmax,ymin,ymax,xLabel,yLabel,stepX,stepY}){
 const svg=$(id);clear(svg);const l=68,t=25,w=660,h=285,X=x=>l+(x-xmin)/(xmax-xmin)*w,Y=y=>t+h-(y-ymin)/(ymax-ymin)*h;
 for(let x=xmin;x<=xmax+.0001;x+=stepX){element(svg,'line',{x1:X(x),x2:X(x),y1:t,y2:t+h,class:'grid'});element(svg,'text',{x:X(x),y:t+h+25,class:'tick','text-anchor':'middle'},f(x,0))}
 for(let y=ymin;y<=ymax+.0001;y+=stepY){element(svg,'line',{x1:l,x2:l+w,y1:Y(y),y2:Y(y),class:'grid'});element(svg,'text',{x:l-8,y:Y(y)+4,class:'tick','text-anchor':'end'},f(y,yLabel.includes('GZ')?1:0))}
 if(ymin<0&&ymax>0)element(svg,'line',{x1:l,x2:l+w,y1:Y(0),y2:Y(0),class:'axis'});
 element(svg,'text',{x:l+w/2,y:365,class:'tick','text-anchor':'middle'},xLabel);
 element(svg,'text',{transform:'translate(17 '+(t+h/2)+') rotate(-90)',class:'tick','text-anchor':'middle'},yLabel);
 for(const s of series)element(svg,'path',{d:s.points.map((p,i)=>(i?'L':'M')+X(p.x).toFixed(2)+','+Y(p.y).toFixed(2)).join(' '),class:'curve curve-'+s.color});
}
function stability(){const a=values($('stability-form')),z=M.stability(a);datasets.stability=[['heel_deg','baseline_GZ_m','adjusted_GZ_m'],...z.curve.map(p=>[p.angle,p.baseline,p.gz])];
 $('stability-results').innerHTML=metric('Corrected GM',f(z.gm)+' m')+metric('Free-surface correction',f(z.fsc,3)+' m')+metric('KG after relocation',f(z.movedKG,3)+' m')+metric('Maximum sampled GZ',f(z.maximum.gz)+' m')+metric('Signed area 0–30°',f(z.area30,3)+' m·rad')+metric('Initial positive range ends',z.zero===null?'Not reported':f(z.zero,1)+'°');
 const min=Math.floor(Math.min(...z.curve.flatMap(p=>[p.gz,p.baseline]))),max=Math.max(1,Math.ceil(Math.max(...z.curve.flatMap(p=>[p.gz,p.baseline]))));
 chart('gz-chart',[{color:'blue',points:z.curve.map(p=>({x:p.angle,y:p.baseline}))},{color:'gold',points:z.curve.map(p=>({x:p.angle,y:p.gz}))}],{xmax:90,ymin:min,ymax:max,stepX:10,stepY:Math.max(1,Math.ceil((max-min)/8)),xLabel:'Heel angle (degrees)',yLabel:'Righting arm GZ (m)'});
 $('stability-working').textContent='Weight shift: '+f(a.weight,0)+' × '+f(a.lift)+' / '+f(a.displacement,0)+' = '+f(a.weight*a.lift/a.displacement,3)+' m. I_FS = '+f(z.inertia,2)+' m⁴; FSM = '+f(z.fsm,2)+' t·m; effective KG = '+f(z.effectiveKG,3)+' m. Area 0–40° = '+f(z.area40,3)+' m·rad. '+(z.gm<=0?'Initial GM is nonpositive in this synthetic case.':'');
 table('gz-table','Synthetic KN and GZ every 10 degrees',['Heel (°)','KN (m)','Baseline GZ (m)','Adjusted GZ (m)'],z.curve.filter((_,i)=>i%20===0).map(p=>[f(p.angle,0),f(M.kn(p.angle),3),f(p.baseline,3),f(p.gz,3)]));
}
function signal(){const a=values($('signal-form')),inverse=a.inverse==='true',v=M.scale(a.value,a.lrv,a.urv,inverse);$('signal-result').textContent=f(v,3)+(inverse?' engineering units':' mA')}
function pid(){const a=values($('pid-form')),rows=M.pid(a),last=rows.at(-1);datasets.controls=[['time_s','setpoint_percent','process_percent','output_percent'],...rows.map(p=>[p.t,p.sp,p.pv,p.u])];
 chart('pid-chart',[{color:'gold',points:rows.map(p=>({x:p.t,y:p.sp}))},{color:'blue',points:rows.map(p=>({x:p.t,y:p.pv}))},{color:'purple',points:rows.map(p=>({x:p.t,y:p.u}))}],{xmax:180,ymin:0,ymax:120,stepX:30,stepY:20,xLabel:'Time (s)',yLabel:'SP, PV and output (%)'});
 $('pid-results').textContent='At 180 s: PV '+f(last.pv)+'%, output '+f(last.u)+'%, error '+f(last.sp-last.pv)+' percentage points. '+(a.direction==='direct'?'Direct action gives positive feedback for this process.':'Reverse action gives negative feedback for this process.')+' Ti = 0 disables integral action.';
 table('pid-table','Response sampled at 10-second intervals',['Time (s)','Setpoint (%)','PV (%)','Output (%)'],rows.filter((_,i)=>i%100===0).map(p=>[f(p.t,0),f(p.sp,1),f(p.pv,2),f(p.u,2)]));
}
function engine(){const a=values($('engine-form'));a.cycles=Number(a.cycles);const z=M.engine(a);
 $('engine-results').innerHTML=metric('Brake power',f(z.brake,1)+' kW')+metric('Indicated power',f(z.indicated,1)+' kW')+metric('Fuel flow, entered LHV',f(z.fuel,1)+' kg/h')+metric('Calculated SFOC',f(z.sfoc,1)+' g/kWh')+metric('Swept volume, total',f(z.volume*1000,2)+' L')+metric('Mean piston speed',f(z.pistonSpeed,2)+' m/s');
 const fuels=[['MGO',42.7],['HFO',40.4],['LNG',50],['Methanol',19.9]].map(([name,lhv])=>({name,lhv,...M.engine({...a,lhv})}));
 datasets.engine=[['fuel','assumed_LHV_MJ_kg','brake_power_kW','assumed_brake_efficiency','fuel_kg_h','SFOC_g_kWh'],...fuels.map(p=>[p.name,p.lhv,p.brake,a.brakeEfficiency,p.fuel,p.sfoc])];
 const svg=$('fuel-chart');clear(svg);const maximum=Math.max(...fuels.map(p=>p.fuel));
 fuels.forEach((p,i)=>{const y=40+i*72;element(svg,'text',{x:10,y:y+22,class:'tick'},p.name);element(svg,'rect',{x:100,y,width:450*p.fuel/maximum,height:32,fill:i===3?'#f8ce81':'#69d5ed'});element(svg,'text',{x:110+450*p.fuel/maximum,y:y+22,class:'tick'},f(p.fuel,0)+' kg/h')});
 element(svg,'text',{x:380,y:365,class:'tick','text-anchor':'middle'},'Equal brake power and assumed brake efficiency');
 table('fuel-table','Illustrative fuel assumptions and predicted consumption',['Fuel','LHV (MJ/kg)','Fuel (kg/h)','SFOC (g/kWh)'],fuels.map(p=>[p.name,f(p.lhv,1),f(p.fuel,1),f(p.sfoc,1)]));
 $('engine-working').textContent='Total swept volume '+f(z.volume,6)+' m³. Brake power '+f(z.brake,2)+' kW; indicated power '+f(z.indicated,2)+' kW; mechanical loss '+f(z.mechanicalLoss,2)+' kW. Thermal input '+f(z.thermal,2)+' kW at the entered brake efficiency. Fuel mass '+f(z.fuel,2)+' kg/h using LHV '+f(a.lhv,2)+' MJ/kg.';
}
const run={stability,signal,pid,engine};
function update(id){try{run[id]();invalid[id]=false;$(id+'-error').hidden=true;persist()}catch(e){invalid[id]=true;$(id+'-error').textContent=e.message+' The displayed result is from the last valid inputs.';$(id+'-error').hidden=false}}
for(const id of formIds){$(id+'-form').addEventListener('submit',e=>{e.preventDefault();update(id)});$(id+'-form').addEventListener('change',()=>update(id));update(id)}
function choose(){const requested=location.hash.slice(1),active=['stability','controls','engine'].includes(requested)?requested:'stability';for(const id of ['stability','controls','engine'])$(id).hidden=id!==active;for(const a of document.querySelectorAll('.lab-nav a')){if(a.getAttribute('href')==='#'+active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}document.title={stability:'Stability & GZ',controls:'4–20 mA & PID',engine:'Engines & fuel'}[active]+' · Marine Tools Labs'}
window.addEventListener('hashchange',choose);choose();
$('signal-check').addEventListener('click',()=>{const input=$('signal-answer').value;if(!input.trim()){$('signal-feedback').textContent='Enter your answer first.';return}const value=Number(input);$('signal-feedback').textContent=Math.abs(value-5)<.01?'Correct: (12 − 4)/16 × 10 = 5 bar.':'Try again: subtract the 4 mA live zero, then divide by the 16 mA span and multiply by 10 bar.'});
function activeLab(){return ['stability','controls','engine'].find(id=>!$(id).hidden)||'stability'}
function validated(id){const ids=id==='controls'?['signal','pid']:[id];for(const key of ids){if(invalid[key])throw RangeError('Correct the current '+key+' inputs before exporting.');run[key]()}return ids}
function snapshot(id){const E=window.MT_STUDY_EXPORT,ids=validated(id),inputs={};for(const key of ids){const form=$(key+'-form');for(const input of form.elements){if(!input.name)continue;const label=input.closest('label')?.textContent.trim().replace(/\s+/g,' ')||input.name;inputs[key+' · '+label]=input.type==='checkbox'?input.checked:input.value}}
 const node=$(id),charts=[...node.querySelectorAll('svg')].map(svg=>({svg:E.svgSnapshot(svg),caption:svg.querySelector('title')?.textContent||svg.id}));
 const results={};for(const key of ids){const n=$(key+'-results')||$(key+'-result');if(n)results[key]=n.textContent.trim()}
 const notes=[...node.querySelectorAll('details.panel p')].map(n=>n.textContent.trim()).filter(Boolean);if(id==='controls')notes.push('Synthetic positive-gain plant: dy/dt=(20+u−y)/tau. SP steps at 10 s; sample step 0.1 s; output 0–100%. Derivative acts on filtered PV, integral anti-windup is conditional. Direct action gives positive feedback for this plant.');
 const data=datasets[id],sample=id==='controls'?data.filter((_,i)=>i===0||(i-1)%100===0):data;
 return {model:'labs-'+id,title:{stability:'Stability, GZ and free surface',controls:'4–20 mA and PID response',engine:'Engine power and illustrative fuel comparison'}[id],inputs,results,notes,charts,tables:data?[{title:id==='controls'?'Response at 10-second intervals':'Calculated numerical results',rows:sample}]:[]};
}
function exportAction(fn){try{fn();$('export-feedback').textContent='Export prepared from the current valid calculation.'}catch(e){$('export-feedback').textContent=e.message}}
for(const button of document.querySelectorAll('[data-export]'))button.addEventListener('click',()=>exportAction(()=>{const id=button.dataset.export;validated(id);window.MT_STUDY_EXPORT.download('marine-tools-'+id+'-lab.csv',window.MT_STUDY_EXPORT.csv(datasets[id]),'text/csv;charset=utf-8')}));
$('report-html').addEventListener('click',()=>exportAction(()=>{const id=activeLab(),E=window.MT_STUDY_EXPORT;E.download('marine-tools-'+id+'-report.html',E.report(snapshot(id)),'text/html;charset=utf-8')}));
$('report-svg').addEventListener('click',()=>exportAction(()=>{const id=activeLab(),s=snapshot(id),E=window.MT_STUDY_EXPORT;E.download('marine-tools-'+id+'-graph.svg',s.charts[0].svg,'image/svg+xml;charset=utf-8')}));
$('report-json').addEventListener('click',()=>exportAction(()=>{const id=activeLab(),E=window.MT_STUDY_EXPORT,ids=validated(id),inputs={};for(const key of ids)inputs[key]=values($(key+'-form'));E.download('marine-tools-'+id+'-scenario.json',E.scenario('labs-'+id,inputs),'application/json')}));
$('scenario-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const id=activeLab(),ids=id==='controls'?['signal','pid']:[id],data=window.MT_STUDY_EXPORT.parseScenario(await file.text(),'labs-'+id,ids),backup={};for(const key of ids){backup[key]=Object.fromEntries([...$(key+'-form').elements].filter(x=>x.name).map(x=>[x.name,x.type==='checkbox'?x.checked:x.value]));const allowed=[...$(key+'-form').elements].filter(x=>x.name).map(x=>x.name);if(Object.keys(data[key]||{}).length!==allowed.length||allowed.some(k=>!Object.hasOwn(data[key],k)))throw TypeError('Scenario input fields do not match this module.');for(const x of $(key+'-form').elements){if(!x.name)continue;const v=data[key][x.name];if(x.type==='number'&&(typeof v!=='number'||!Number.isFinite(v))||x.type==='checkbox'&&typeof v!=='boolean'||x.tagName==='SELECT'&&![...x.options].some(o=>o.value===v))throw TypeError('Invalid scenario value for '+x.name+'.')}}
 function apply(all){for(const key of ids)for(const input of $(key+'-form').elements){if(!input.name)continue;const value=all[key][input.name];if(input.type==='checkbox')input.checked=value===true;else input.value=String(value)}}
 try{apply(data);for(const key of ids)run[key]();for(const key of ids)update(key);$('export-feedback').textContent='Scenario restored and recalculated.'}catch(err){apply(backup);for(const key of ids)update(key);throw err}
 }catch(err){$('export-feedback').textContent=err.message}e.target.value=''});
window.MT_LAB_SNAPSHOT=id=>snapshot(id);
$('print-labs').addEventListener('click',()=>window.print());
if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../'}).catch(()=>{});
})();
