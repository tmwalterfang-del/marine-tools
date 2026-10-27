// Independent published reference points and gravity-film integration.
// These checks do not establish an empirical correlation's accuracy in all flows.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w});for(const m of fs.readFileSync('students/index.html','utf8').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(fs.readFileSync('students/'+m[1],'utf8'),ctx)}
const rows=new Map(w.MT_STUDY.sourceEquationRegister.map(r=>[r.id,r]));
const st=rows.get('book-c11-p161-r04'),film=rows.get('book-c11-p163-r04');
function close(a,b,tol=1e-10){assert.ok(Math.abs(a-b)<=tol*Math.abs(b),`${a} != ${b}`)}
const Nu=(Re,Pr,mu,muw)=>.027*Re**.8*Math.cbrt(Pr)*(mu/muw)**.14;
// ht's official API examples, retained independently of our data files.
close(Nu(1e5,1.2,1,1),286.9178136793052);
close(Nu(1e5,1.2,.01,.067),219.84016455766044);
assert.match(st.conditions,/fully developed/);assert.match(st.conditions,/bulk temperature/);assert.match(st.sourceIssue,/not a reconstruction/);
assert.equal(film.formula,'h ≈ 0.943·(g·ρ_l·(ρ_l−ρ_v)·h_fg·k³/(μ·ΔT·L))^0.25');
// Independent balance: integrate u(y)=g(ρl−ρv)(δy−y²/2)/μ
// to get Γ=ρl*g*(ρl−ρv)*δ³/(3μ), and energy Γ*hfg=k*ΔT*integral(dx/δ).
// With δ⁴=4μkΔT*x/(ρl*g*(ρl−ρv)*hfg), mean h=(4/3)k/δ(L).
let checks=0;
for(const L of [.1,1,3])for(const dt of [5,20,40]){
 const rl=585,rv=7,k=.091,mu=158.9e-6,hfg=776900,g=9.80665;
 const delta=(4*mu*k*dt*L/(rl*g*(rl-rv)*hfg))**.25;
 const integrated=4*k/(3*delta);
 const displayed=.943*(g*rl*(rl-rv)*hfg*k**3/(mu*dt*L))**.25;
 close(displayed,integrated,2.1e-4);checks++;
 if(L===.1&&dt===20)close(integrated,1482.206403453679);
}
assert.match(film.conditions,/not overall U/);assert.match(film.sourceIssue,/does not validate the original 1.13/);
for(const r of [st,film]){assert.equal(r.analyticalReview.decision,'CORRECTED_OR_QUALIFIED_THIS_PASS');assert.equal(r.numericStatus,'REFERENCE_CASE_COVERED')}
// Unavailable calibrations must not be silently promoted by this resolution.
for(const id of ['book-mechanics-p48-r02','book-machine-p50-r07','book-machine-p50-r11','book-machine-p51-r09','book-machine-p52-r02','book-c14-p212-r04'])assert.equal(rows.get(id).analyticalReview.decision,'OPEN_MODEL_OR_SOURCE_LIMIT');
console.log(JSON.stringify({status:'PASS',publishedReferencePoints:3,independentFilmBalances:checks,remainingUnresolved:6}));
