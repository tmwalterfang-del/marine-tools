// IAPWS-IF97 (R7-97(2012)) verification values, Tables 5 and 15, and Table 35 (saturation pressure).
const fs=require('fs'),vm=require('vm');const root={};root.window=root;const ctx=vm.createContext(root);
for(const m of fs.readFileSync('students/mollier.html','utf8').matchAll(/src="([^"?]+\.js)/g)){const f='students/'+m[1];if(!/neutrium|iapws|if97|IAPWS/i.test(f))continue;vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});}
const V=root.NeutriumJS.thermo.IAPWS97.PT;
const t=[['r1',3,300,'h',115.331273],['r1',80,300,'h',184.142828],['r1',3,500,'h',975.542239],['r1',3,300,'s',0.392294792],['r1',80,300,'s',0.368563852],['r1',3,500,'s',2.58041912],
['r2',0.0035,300,'h',2549.91145],['r2',0.0035,700,'h',3335.68375],['r2',30,700,'h',2631.49474],['r2',0.0035,300,'s',8.52238967],['r2',0.0035,700,'s',10.1749996],['r2',30,700,'s',5.17540298]];
let ok=0;for(const [r,p,T,k,e] of t){const v=V[r](p,T)[k];const pass=Math.abs(v-e)<=1e-6*Math.abs(e)+1e-8;ok+=pass;console.log(pass?'PASS':'FAIL',r,p,'MPa',T,'K',k,v,'ref',e);}
// saturation: Table 35 reverse: T=300K psat=0.353658941e-2 MPa ; T=500 psat=0.263889776e1 ; T=600 psat=0.123443146e2  -> test Tsat(p)
for(const [p,T] of [[0.1,372.755919],[1,453.035632],[10,584.149488]]){const v=V.r4_P_Tsat(p);const pass=Math.abs(v-T)<1e-5;ok+=pass;console.log(pass?'PASS':'FAIL','Tsat',p,'MPa',v,'ref',T);}
console.log(ok,'/',t.length+3);
