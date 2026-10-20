// Independent expected values transcribed from IAPWS R7-97(2012), Tables 5, 15, 35, 36.
// https://iapws.org/technical-guidance/release/IF97-Rev.download
// Native solver checks outside the narrower UI domain are explicitly labelled.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['vendor/neutrium-if97.min.js','mollier-if97.js'])
 vm.runInContext(fs.readFileSync(new URL('../students/'+file,import.meta.url),'utf8'),ctx);
const PT=ctx.NeutriumJS.thermo.IAPWS97.PT, rows=[];
function verify(table,region,inputs,quantity,expected,computed,absoluteTolerance,scope){
 const absoluteError=Math.abs(computed-expected);
 const pass=Number.isFinite(computed)&&absoluteError<=absoluteTolerance;
 rows.push({table,region,inputs,quantity,expected,computed,absoluteError,relativeError:absoluteError/Math.abs(expected),absoluteTolerance,scope,status:pass?'PASS':'FAIL'});
}
for(const [p,T,h,s] of [[3,300,115.331273,.392294792],[80,300,184.142828,.368563852],[3,500,975.542239,2.58041912]]){
 const z=PT.solve(p,T);
 verify(5,1,{p_MPa:p,T_K:T},'h_kJ_kg',h,z.h,.00001,'vendor only; compressed liquid is outside lab');
 verify(5,1,{p_MPa:p,T_K:T},'s_kJ_kgK',s,z.s,.00000005,'vendor only; compressed liquid is outside lab');
}
for(const [p,T,h,s] of [[.0035,300,2549.91145,8.52238967],[.0035,700,3335.68375,10.1749996],[30,700,2631.49474,5.17540298]]){
 const z=PT.solve(p,T);
 verify(15,2,{p_MPa:p,T_K:T},'h_kJ_kg',h,z.h,.00001,'vendor; 700 K and 30 MPa outside lab limits');
 verify(15,2,{p_MPa:p,T_K:T},'s_kJ_kgK',s,z.s,.00000005,'vendor; 700 K and 30 MPa outside lab limits');
}
for(const [T,p] of [[300,.00353658941],[500,2.63889776],[600,12.3443146]])
 verify(35,4,{T_K:T},'p_MPa',p,PT.r4_T_Psat(T),.00000005,'saturation boundary');
for(const [p,T] of [[.1,372.755919],[1,453.035632],[10,584.149488]])
 verify(36,4,{p_MPa:p},'T_K',T,ctx.MT_IF97.saturation(p*10).T+273.15,.000005,'adapter; bar/MPa and Celsius/Kelvin conversion');
assert.equal(rows.length,18);
console.log(JSON.stringify({source:'IAPWS R7-97(2012)',referenceURL:'https://iapws.org/technical-guidance/release/IF97-Rev.download',cases:rows,passed:rows.filter(r=>r.status==='PASS').length},null,2));
assert.ok(rows.every(r=>r.status==='PASS'),'all published reference cases pass');
