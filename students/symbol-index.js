/* Marine Tools student symbol disambiguation; each term is scoped to its formula.
 No copyrighted images, book tables, or copied descriptions; verification status stays explicit. */
(function(){
"use strict";
const formulas=window.MT_FORMULAS||[],study=window.MT_STUDY||{details:{}},byId=new Map(formulas.map(f=>[f.id,f]));
const examples=[
 ["Q","Electric charge","C","capacitor-charge","electric.charge"],
 ["Q","Volumetric flow rate","m³/s","volumetric-flow","fluids.volume_flow"],
 ["Q","Sensible heat energy","J","heat-transfer-sensible","thermal.heat_energy"],
 ["P","Active electrical power","W","dc-power","electric.active_power"],
 ["P","Mechanical power","W","power","mechanics.power"],
 ["p","Hydrostatic pressure","Pa","hydrostatic-pressure","fluids.pressure"],
 ["p","Pressure","Pa","pressure-from-force","fluids.pressure"],
 ["P","Active power component","W","power-factor","electric.active_power"],
 ["P","Proportional band","%",null,"control.proportional_band"]
];
const registry=new Map(), status="Draft definition — independent equation-level verification pending.";
const key=(id,symbol)=>(id||"pending")+":"+symbol;
for(const f of formulas){
 for(const v of study.details[f.id]?.symbols||[]){
  registry.set(key(f.id,v.symbol),{formulaId:f.id,formulaName:f.name,subject:f.category,symbol:v.symbol,meaning:v.meaning,unit:v.unit,quantityId:"formula."+f.id+"."+v.symbol,status});
 }
}
for(const [symbol,meaning,unit,id,quantityId] of examples){
 const f=id?byId.get(id):null;
 if(id&&!f)throw Error("Unknown formula reference "+id);
 const formulaId=f?.id||null;
 registry.set(key(formulaId,symbol),{formulaId,formulaName:f?.name||"Proportional band (not yet catalogued)",subject:f?.category||"Instrumentation & Control",symbol,meaning,unit,quantityId,status});
}
const entries=[...registry.values()].sort((a,b)=>a.symbol.localeCompare(b.symbol)||a.subject.localeCompare(b.subject));
window.MT_SYMBOLS={entries,coverage:{formulas:formulas.length,withCuratedDefinitions:formulas.filter(f=>(study.details[f.id]?.symbols||[]).length).length},
 find(term){const q=String(term||"").trim().toLowerCase();return entries.filter(e=>!q||[e.symbol,e.meaning,e.unit,e.subject,e.formulaName].some(s=>String(s||"").toLowerCase().includes(q)))}
};
})();