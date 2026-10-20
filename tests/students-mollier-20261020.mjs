// Mollier Lab unit and offline-integration checks (Node 22).
// Source points are saturation samples; interpolation is not a full property solver.
import fs from "node:fs";
import assert from "node:assert/strict";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const src=read("students/mollier.js"),html=read("students/mollier.html");
const home=read("students/index.html"),sw=read("sw.js"),css=read("students/mollier.css");
const mock={};
new Function("window",src)(mock);
const M=mock.MT_MOLLIER_MODEL;
let n=0;
function ok(x,msg){assert.ok(x,msg);n++}
function near(v,expected,tol,msg){ok(Math.abs(v-expected)<=tol,msg+" ("+v+")")}
ok(Array.isArray(M.anchors)&&M.anchors.length>=20,"saturation anchor coverage");
ok(M.anchors.every(r=>r.length===6&&r.every(Number.isFinite)),"anchor row units numeric");
ok(M.anchors.every((r,i)=>i===0||r[0]>M.anchors[i-1][0]),"strictly increasing pressure");
ok(M.anchors.every(r=>r[3]>=r[2]&&r[5]>=r[4]),"vapour and liquid phase order");
near(M.saturation(1).hf,417.5,.001,"1 bar saturated liquid enthalpy");
near(M.saturation(1).hg,2674.9,.001,"1 bar saturated vapour enthalpy");
near(M.saturation(1).sf,1.3028,.00001,"1 bar liquid entropy");
near(M.saturation(1).sg,7.3588,.00001,"1 bar vapour entropy");
near(M.stateAt(1,0).h,417.5,.001,"dryness zero liquid");
near(M.stateAt(1,1).h,2674.9,.001,"dryness one vapour");
near(M.stateAt(1,.5).h,(417.5+2674.9)/2,.001,"wet steam midpoint enthalpy");
near(M.stateAt(1,.5).s,(1.3028+7.3588)/2,.00001,"wet steam midpoint entropy");
near(M.saturation(10).T,179.9,.01,"10bar Tsat");
near(M.stateAt(220.64,0).h,M.stateAt(220.64,1).h,1e-8,"critical phase limit equal");
near(M.stateAt(220.64,0).s,M.stateAt(220.64,1).s,1e-8,"critical entropy limit equal");
ok(M.saturation(1.7).interpolated,"non-anchor interpolation flagged");
ok(M.saturation(10).interpolated===false,"exact anchor not interpolated");
for(const p of [.01,.03,.3,1,9,30,120,220.64])near(M.pressureFromSlider(M.sliderFromPressure(p)),p,1e-6,"pressure slider roundtrip "+p);
for(const x of [-1,.0/0,1.001]){let failed=false;try{M.stateAt(1,x)}catch(e){failed=e instanceof RangeError}ok(failed,"invalid quality rejected")}
for(const p of [0,-1,221,Infinity,NaN]){let failed=false;try{M.saturation(p)}catch(e){failed=e instanceof RangeError}ok(failed,"invalid pressure rejected")}
ok(html.includes('id="hs-chart"')&&html.includes('id="pressure-number"')&&html.includes('id="quality"'),"interactive accessible chart");
ok(html.includes('id="export"')&&src.includes('text/csv'),"local CSV export");
ok(html.includes("IAPWS-IF97")&&html.includes("interpolat"),"limitations and authoritative reference");
ok(home.includes('href="mollier.html"'),"main student entry link");
ok(["mollier.html","mollier.js","mollier.css"].every(p=>sw.includes("'./students/"+p+"'")),"three assets offline precached");
ok(css.includes("@media(max-width:690px)")&&css.includes(":focus-visible"),"mobile and keyboard styles");
ok(!/fetch\s*\(|sendBeacon|XMLHttpRequest/.test(src),"no API or analytics network calls");
console.log(JSON.stringify({status:"PASS",checks:n,anchorPoints:M.anchors.length}));
