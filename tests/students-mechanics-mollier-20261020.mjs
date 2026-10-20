// Mechanics p.42 and extended Mollier wet-isentropic tests.
import fs from "node:fs";
import assert from "node:assert/strict";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const win={};
for(const p of ["students/formulas.js","students/formulas-extension.js","students/formulas-expansion-v1.js",
"students/calculators.js","students/calculators-extension.js","students/calculators-expansion-v1.js","students/learning-data.js","students/book-photos-20261020.js","students/math-chapter-20261020.js",
"students/physics-chapter-20261020.js","students/mechanics-p42-20261020.js",
"students/applied-controls-20261020.js","students/symbol-index.js","students/mollier.js"]){
 new Function("window",read(p))(win);
}
const formula=win.MT_FORMULAS,student=win.MT_STUDY,model=win.MT_MOLLIER_MODEL;
let passed=0;
function check(x,m){assert.ok(x,m);passed++}
function close(a,b,m,tol=1e-9){check(Math.abs(a-b)<tol,m)}
check(formula.length===444,"444 independent formula entries");
check(win.MT_CALCULATORS.length===59,"59 calculators");
check(win.MT_PRACTICE.length===36,"36 practices");
check(student.mechanicsPage42.formulaIds.length===7,"7 formulas from page 42");
for(const id of student.mechanicsPage42.formulaIds){
 const f=formula.find(x=>x.id===id),d=student.details[id];
 check(!!f&&d.symbols.length>=3,"symbol definitions for "+id);
 check(student.photoReview[id].page===42,"photo source reference for "+id);
}
close(15000/.003,5e6,"axial stress Pa");
close(.001/2,.0005,"engineering strain");
close(200e9*.0005,100e6,"Hooke stress Pa");
close(12000*2/(200e9*.003),.00004,"elastic bar extension m");
close(2000/.0005,4e6,"direct shear Pa");
close(10000/(2*.02*.01),25e6,"pin projected bearing stress");
close(4*10000/(2*Math.PI*.02**2),15915494.309189534,"double shear pin Pa",1e-5);
const a=model.stateAt(10,1),b=model.isentropicWetState(a,1);
close(b.s,a.s,"isentropic equality",1e-8);
check(b.x>=0&&b.x<=1,"wet quality valid");
check(b.p===1,"chosen outlet pressure");
for(const p of [0,.01,220.64]){let rejected=false;try{model.isentropicWetState({s:-1},p)}catch{rejected=true}check(rejected,"out of region entropy rejected "+p)}
check(read("students/mollier.html").includes('id="isentropic"'),"isentropic UI control present");
check(read("students/mollier.js").includes("isentropicWetState"),"isentropic routine present");
check(read("students/index.html").includes("mechanics-p42-20261020.js"),"mechanics script loaded");
check(read("sw.js").includes("'./students/mechanics-p42-20261020.js'"),"mechanics pack precached");
console.log(JSON.stringify({result:"PASS",checks:passed,formulas:formula.length,pressure:b.p,quality:b.x}));
