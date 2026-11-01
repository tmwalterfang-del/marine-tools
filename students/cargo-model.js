/* Mass/moment ledger. No ship hydrostatics are inferred from an assignment answer. */
(function(root){'use strict';
const number=(x,label,min=-1e9,max=1e9)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw RangeError(label+' is missing or outside the supported range.');return x};
function calculate(p){
number(p.displacement,'Initial displacement',.001,1e7);number(p.kg,'Initial KG',0,100);number(p.lcg,'Initial LCG',-1000,1000);number(p.tcg,'Initial TCG',-100,100);number(p.fsm,'Initial free-surface moment',0,1e8);
if(p.km!==null)number(p.km,'Illustrative constant KM',0,100);if(!Array.isArray(p.operations)||p.operations.length>60)throw RangeError('Use at most 60 operations.');
let d=p.displacement,v=d*p.kg,l=d*p.lcg,t=d*p.tcg,fsm=p.fsm;
const rows=[];function record(label){const kg=v/d,lcg=l/d,tcg=t/d,fsc=fsm/d,gm=p.km===null?null:p.km-kg-fsc;rows.push({stage:rows.length,label,displacement:d,verticalMoment:v,longitudinalMoment:l,transverseMoment:t,kg,lcg,tcg,fsm,fsc,gm})}record('Initial condition');
for(const [i,o]of p.operations.entries()){
 if(!['load','discharge','shift'].includes(o.type))throw TypeError('Choose load, discharge or shift.');if(typeof o.name!=='string'||o.name.length>100)throw TypeError('Operation name must be short text.');
 number(o.mass,'Operation '+(i+1)+' mass',.001,1e7);for(const k of ['vcg','lcg','tcg'])number(o[k],'Operation '+(i+1)+' '+k,k==='vcg'?0:-1000,1000);number(o.fsmChange,'Free-surface moment change',-1e8,1e8);
 if(o.type==='shift'){for(const k of ['toVcg','toLcg','toTcg'])number(o[k],'Shift destination '+k,k==='toVcg'?0:-1000,1000);if(o.mass>d)throw RangeError('Shifted mass exceeds displacement.');v+=o.mass*(o.toVcg-o.vcg);l+=o.mass*(o.toLcg-o.lcg);t+=o.mass*(o.toTcg-o.tcg)}
 else{const sign=o.type==='load'?1:-1;if(d+sign*o.mass<=0)throw RangeError('Discharge would leave no positive displacement.');d+=sign*o.mass;v+=sign*o.mass*o.vcg;l+=sign*o.mass*o.lcg;t+=sign*o.mass*o.tcg}
 fsm+=o.fsmChange;if(fsm<0||v<0)throw RangeError('Operation '+(i+1)+' gives a negative total FSM or vertical moment.');record(o.name||o.type);
}
return {rows,final:rows.at(-1)};
}
root.MT_CARGO={calculate};
})(typeof window==='undefined'?globalThis:window);
