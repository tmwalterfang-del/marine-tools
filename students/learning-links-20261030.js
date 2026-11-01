(function(root){'use strict';
const modules={beam:['beam','Beam loads and deflection'],transient:['transient','RC and RL transients'],cycle:['ideal-cycle','Otto and Diesel cycles'],pump:['pump-suction','Pump duty and NPSH'],refrigeration:['refrigeration-energy','Refrigeration energy balance'],heavyLift:['lift-cross-curves','Lift origins and cross curves']};
const legacy={
 'disp-1':'displacement','dwt-1':'deadweight','gm-1':'corrected-gm','tpc-1':'tpc','draft-1':'draft-change','trim-1':'trim-change','elec-1':'ohms-law','elec-2':'dc-power','res-1':'series-resistance','res-2':'parallel-resistance','motor-1':'synchronous-speed','pump-1':'pump-time','fuel-1':'voyage-fuel','fuel-2':'fuel-density','energy-1':'battery-runtime','eng-1':'sfoc','geo-1':'triangle','therm-1':'heat-energy','chem-molar':'molar-concentration','chem-ph':'ph','elect-dB':'db-gain','elec-buck':'buck-converter','engine-otto':'otto-efficiency','steam-enthalpy':'wet-steam-enthalpy','refrigeration':'refrigeration-cop','econ-real':'real-interest','econ-pv':'annuity-pv','shaft':'shaft-torsion-stress','instr-12ma':'loop-scaling','instr-4ma':'loop-scaling','instr-P':'p-controller','pumps-npsha':'npsha','steam-turbine':'turbine-drop','engine-fuel-power':'fuel-input-power'
};
function create({formulas,calculators,study}){
 const primary=new Map(formulas.map(f=>[f.id,f])),source=new Map(study.sourceEquationRegister.map(r=>[r.id,r])),calcs=new Map(calculators.map(c=>[c.id,c]));
 function resources(e){const out=[],seen=new Set(),from='?exercise='+encodeURIComponent(e.id);
  function add(kind,label,href){if(!seen.has(href)){seen.add(href);out.push({kind,label,href});}}
  function formula(id,variant){const f=primary.get(id);if(!f)return;add('formula',f.name,'#formula/'+encodeURIComponent(id)+'?from='+encodeURIComponent(e.id)+(variant?'&variant='+encodeURIComponent(variant):''));}
  function expression(id){const r=source.get(id);if(r&&r.analyticalReview?.decision!=='OPEN_MODEL_OR_SOURCE_LIMIT')formula(r.formulaId,r.id);}
  function calculator(id){const c=calcs.get(id);if(!c)return;add('calculator',c.name,'#calculator/'+encodeURIComponent(id)+'?from='+encodeURIComponent(e.id));const f=Object.entries(study.calculatorByFormula).find(([,cid])=>cid===id);if(f)formula(f[0]);}
  function model(id,label){add('model',label,'interactive.html'+from+'#'+id);}
  for(const r of e.references||[]){if(r.kind==='source')expression(r.id);else if(r.kind==='primary')formula(r.id);else if(r.kind==='calculator')calculator(r.id);else if(r.kind==='model'&&modules[r.id])model(...modules[r.id]);else if(r.kind==='finite'){
   const finite={mean:'arithmetic-mean',dot:'ext-vector-dot-product',weightedMean:e.chapter===11?'weighted-mean':'centroid-in-one-dimension',combineDecibels:'ext-power-gain-in-decibels',positionalInteger:'student-v2-binary-number-value',cycleRejection:'ext-heat-rejection-from-condenser',discountedCashFlows:r.values?.initial?'ext-net-present-value':r.values?.flows?.length>1?'ext-level-annuity-present-value':'student-v2-present-value'};
   const expressions={sum:'book-chemistry-p68-r11',invertingSummer:'book-c7-p108-r04',compassInterpolation8:'book-c13-p194-r04',cargoBalance:'book-c14-p200-r01'};
   if(r.operation==='thd')expression('book-c7-p107-r02');else if(expressions[r.operation])expression(expressions[r.operation]);else if(finite[r.operation])formula(finite[r.operation]);
  }}
  if(legacy[e.id])calculator(legacy[e.id]);if(e.id==='mech-1')expression('book-mechanics-p38-r06');if(e.id==='passage-1'||e.references?.some(r=>r.kind==='finite'&&r.operation==='quotient'))formula('sea-time');
  const topic=(e.topic||e.prompt||'').toLowerCase();
  if(e.chapter===3&&/beam|reaction/.test(topic))model('beam','Beam loads and deflection');
  if(e.chapter===6&&/rc |rl |capacitor|inductor/.test(topic))model('transient','RC and RL transients');
  if(e.chapter===6&&/rlc|impedance/.test(topic)||e.chapter===7&&/resonance|bandwidth/.test(topic))model('rlc','RLC frequency response');
  if(e.chapter===9&&/otto|diesel|compression/.test(topic))model('ideal-cycle','Otto and Diesel cycles');
  if(e.chapter===9&&/fuel|power|torque|piston/.test(topic))model('engine','Engine and fuel');
  if(e.chapter===10&&/steam|quality|wetness|turbine|nozzle/.test(topic))model('mollier','Mollier h–s diagram');
  if(e.chapter===11&&/pump|npsh|hydraulic/.test(topic))model('pump-suction','Pump duty and NPSH');
  if(e.chapter===11&&/heat exchanger|log.mean/.test(topic))model('heat','Heat exchanger');
  if(e.chapter===12&&/cop|refrigerant|compressor|cycle/.test(topic))model('refrigeration-energy','Refrigeration energy balance');
  if(e.chapter===13&&/passage|northing|easting|departure/.test(topic))model('current','Course and current vectors');
  if(e.chapter===14&&/suspend|counterweight|shift|new load/.test(topic))model('lift-cross-curves','Lift origins and cross curves');
  if(e.chapter===14&&/free.surface|righting|cross.curve|inclining|gm/.test(topic))model('stability','GZ and free surface');
  if(e.chapter===14&&/trim|sinkage|draft/.test(topic))model('trim','Trim and draft changes');
  if(e.chapter===15)model('finance','Investment cash flows');
  if(e.chapter===16&&/cargo balance|cargo mass|transfer/.test(topic))model('cargo','Loading and discharge');
  const chapter=study.chapters.find(c=>c.number===e.chapter);if(chapter)add('chapter',chapter.title+' formulas','#chapter-'+e.chapter+'?from='+encodeURIComponent(e.id));
  return out;
 }
 return {resources};
}
root.MT_LEARNING_LINKS={create};
})(typeof window!=='undefined'?window:globalThis);
