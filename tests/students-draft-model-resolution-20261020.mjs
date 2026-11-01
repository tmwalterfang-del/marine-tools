import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w});for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx)}
const rows=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r]));let cases=0;
// Integrate T(x)=a+b*x+c*x² on x∈[-1,1]. Use an independent midpoint
// quadrature rather than substituting the displayed formula into itself.
for(const a of [3,7])for(const b of [-.5,0,.7])for(const c of [-.4,0,.6]){
 const T=x=>a+b*x+c*x*x,F=T(-1),A=T(1),M=T(0),delta=((F+A)/2-M)/3,equiv=M+delta;
 const N=20000;let volume=0;for(let i=0;i<N;i++)volume+=T(-1+(i+.5)*2/N)/N;
 assert.ok(Math.abs(equiv-volume)<1e-8);assert.ok(Math.abs(equiv-(a+c/3))<1e-12);cases++;
}
// A variable-breadth hull invalidates the same unweighted one-third result.
let volume=0,area=0;for(let i=0;i<20000;i++){const x=-1+(i+.5)/10000,B=1-x*x;area+=B;volume+=B*(6+.6*x*x)}
assert.ok(Math.abs(volume/area-(6+.6/3))>.05);
for(const id of ['book-c16-p223-r04','book-c16-p223-r05']){const r=rows.get(id);assert.match(r.conditions,/constant longitudinal waterplane breadth/);assert.match(r.conditions,/not a universal/);assert.equal(r.analyticalReview.decision,'CORRECTED_OR_QUALIFIED_THIS_PASS')}
console.log(JSON.stringify({status:'PASS',independentQuadraticProfileIntegrals:cases,variableBreadthCounterexample:true}));
