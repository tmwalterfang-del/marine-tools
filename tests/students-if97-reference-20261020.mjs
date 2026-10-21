/* IAPWS-IF97 Region 1/2/4 reference tests for Marine Tools Mollier.
 The upstream NeutriumJS code is CC BY 4.0. Browser and manual visual QA remain separate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL('../students/'+name,import.meta.url),'utf8');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(read('vendor/neutrium-if97.min.js'),ctx);
vm.runInContext(read('mollier-if97.js'),ctx);
vm.runInContext(read('mollier.js'),ctx);
const IF=ctx.MT_IF97,M=ctx.MT_MOLLIER_MODEL;
let assertions=0;
function ok(value,reason){assert.ok(value,reason);assertions++}
function near(value,target,tolerance,reason){ok(Number.isFinite(value)&&Math.abs(value-target)<=tolerance,reason+': '+value+' expected '+target)}
function reject(fn,label){let failed=false;try{fn()}catch(e){failed=true}ok(failed,label)}
ok(IF.ready,'local CC BY IF97 vendor initialised');
ok(M.if97Ready,'Mollier picks up IF97 adapter');
const native=ctx.NeutriumJS.thermo.IAPWS97;
near(native.PT.solve(3,300).h,115.331273,.001,'IF97 published Region 1 p3MPa 300K h');
near(native.PT.solve(3,300).s,.392294792,.00001,'IF97 published Region 1 entropy');
near(native.PT.solve(.0035,700).h,3335.68375,.01,'IF97 published Region 2 p.0035MPa 700K h');
near(native.PT.solve(.0035,700).s,10.1749996,.0002,'IF97 published Region 2 entropy');
for(const [p,T,hf,hg] of [[1,99.60592,417.43649,2674.94964],[10,179.88563,762.68284,2777.11954]]){
 const sat=IF.saturation(p);
 near(sat.T,T,.02,'Saturation temperature bar '+p);
 near(sat.hf,hf,.05,'Saturation liquid enthalpy bar '+p);
 near(sat.hg,hg,.05,'Saturation vapour enthalpy bar '+p);
 near(M.stateAt(p,0).h,hf,.05,'Wet x0 liquid at bar '+p);
 near(M.stateAt(p,1).h,hg,.05,'Wet x1 vapour at bar '+p);
 near(M.stateAt(p,.5).s,(sat.sf+sat.sg)/2,.0001,'Wet x.5 entropy at bar '+p);
}
const superheat=IF.superheated(10,300);
near(superheat.h,3051.70319,.05,'10 bar 300 Celsius superheat h');
near(superheat.s,7.1247125,.0002,'10 bar 300 Celsius superheat s');
ok(superheat.x===null&&superheat.phase==='superheated','Dryness fraction not defined outside two phase zone');
ok(M.superheated(10,300).source.includes('IF97'),'Mollier uses IF97 superheat property solver');
for(const p of [.01,.1,1,2,10,50,100,150,160]){
 const sat=IF.saturation(p);ok(sat.hf<sat.hg&&sat.sf<sat.sg,'Valid saturation distinction '+p)}
reject(()=>IF.saturation(180),'Reject >160bar saturation from region 1/2 adapter');
reject(()=>IF.superheated(110,350),'Reject >100bar superheated');
reject(()=>IF.superheated(10,100),'Reject sub-saturation temperature');
reject(()=>IF.superheated(10,401),'Reject unplotted T >400 Celsius');
reject(()=>IF.wet(1,-.01),'Reject x below 0');
reject(()=>IF.wet(1,1.01),'Reject x above 1');
reject(()=>M.saturation(200),'No high-pressure fallback in Mollier model');
reject(()=>M.stateAt(160.001,.5),'No wet state outside supported IF97 domain');
console.log(JSON.stringify({status:'PASS',assertions,source:'NeutriumJS IAPWS-IF97 Regions 1/2/4; no independent Region 3 solver'}));
