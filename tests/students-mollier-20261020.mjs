// Mollier Lab unit and offline-integration checks (Node 22).
// Loads the same solver and adapter as the browser; no tabular fallback.
import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const src=read("students/mollier.js"),html=read("students/mollier.html");
const home=read("students/index.html"),sw=read("sw.js"),css=read("students/mollier.css");
const mock={};
mock.window=mock;vm.createContext(mock);
for(const file of ["students/vendor/neutrium-if97.min.js","students/mollier-if97.js","students/mollier.js"])vm.runInContext(read(file),mock);
const M=mock.MT_MOLLIER_MODEL;
let n=0;
function ok(x,msg){assert.ok(x,msg);n++}
function near(v,expected,tol,msg){ok(Math.abs(v-expected)<=tol,msg+" ("+v+")")}
ok(M.if97Ready,"real IF97 engine loaded");
ok(M.limits.maxWetPressure===160,"Region 3 is outside the supported domain");
near(M.saturation(1).hf,417.43649,.001,"1 bar saturated liquid enthalpy");
near(M.saturation(1).hg,2674.94964,.001,"1 bar saturated vapour enthalpy");
near(M.saturation(1).sf,1.30256017,.00001,"1 bar liquid entropy");
near(M.saturation(1).sg,7.35880664,.00001,"1 bar vapour entropy");
near(M.stateAt(1,0).h,417.43649,.001,"dryness zero liquid");
near(M.stateAt(1,1).h,2674.94964,.001,"dryness one vapour");
near(M.stateAt(1,.5).h,(417.43649+2674.94964)/2,.001,"wet steam midpoint enthalpy");
near(M.stateAt(1,.5).s,(1.30256017+7.35880664)/2,.00001,"wet steam midpoint entropy");
near(M.saturation(10).T,179.88563,.0001,"10bar Tsat");
ok(M.saturation(1.7).interpolated===false,"off-anchor pressure is calculated by IF97");
ok(!src.includes("Reference saturation interpolation"),"no legacy table fallback");
for(const p of [.01,.03,.3,1,9,30,120,160])near(M.pressureFromSlider(M.sliderFromPressure(p)),p,1e-6,"pressure slider roundtrip "+p);
for(const x of [-1,.0/0,1.001]){let failed=false;try{M.stateAt(1,x)}catch(e){failed=e.name==="RangeError"}ok(failed,"invalid quality rejected")}
for(const p of [0,-1,160.001,220.64,Infinity,NaN]){let failed=false;try{M.saturation(p)}catch(e){failed=e.name==="RangeError"}ok(failed,"invalid pressure rejected")}
ok(html.includes('id="hs-chart"')&&html.includes('id="pressure-number"')&&html.includes('id="quality"'),"interactive accessible chart");
ok(html.includes('id="export"')&&src.includes('text/csv'),"local CSV export");
ok(html.includes("IAPWS-IF97")&&html.includes("Region 3"),"limitations and authoritative reference");
ok(home.includes('href="mollier.html"'),"main student entry link");
ok(["mollier.html","mollier.js","mollier.css"].every(p=>sw.includes("'./students/"+p+"'")),"three assets offline precached");
ok(css.includes("@media(max-width:690px)")&&css.includes(":focus-visible"),"mobile and keyboard styles");
ok(!/fetch\s*\(|sendBeacon|XMLHttpRequest/.test(src),"no API or analytics network calls");
console.log(JSON.stringify({status:"PASS",checks:n,model:"IF97 Regions 1/2/4"}));
