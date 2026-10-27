import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const c = {};
c.window = c;
vm.createContext(c);
for (const f of [
  "vendor/neutrium-if97.min.js",
  "mollier-if97.js",
  "mollier.js",
])
  vm.runInContext(fs.readFileSync("students/" + f, "utf8"), c);
const I = c.MT_IF97;
let checks = 0,
  maxH = 0,
  maxS = 0;
const near = (a, b, t, label) => {
  assert.ok(
    Number.isFinite(a) && Math.abs(a - b) <= t,
    label + ": " + a + " / " + b,
  );
  checks++;
};
const reject = (fn) => {
  assert.throws(fn);
  checks++;
};
for (const r of JSON.parse(
  fs.readFileSync("tests/fixtures/if97-independent-20261027.json"),
).rows) {
  const z = r.region === "wet" ? I.wet(r.p, r.x) : I.superheated(r.p, r.T);
  near(z.h, r.h, 1e-5, "Independent h");
  near(z.s, r.s, 1e-7, "Independent s");
  maxH = Math.max(maxH, Math.abs(z.h - r.h));
  maxS = Math.max(maxS, Math.abs(z.s - r.s));
  const ph = I.statePH(r.p, z.h),
    ps = I.statePS(r.p, z.s);
  near(ph.h, z.h, 2e-6, "p,h roundtrip");
  near(ps.s, z.s, 2e-8, "p,s roundtrip");
  near(ph.s, z.s, 2e-8, "p,h reconstructed entropy");
  near(ps.h, z.h, 2e-6, "p,s reconstructed enthalpy");
}
for (const p of [0.01, 0.1, 1, 10, 100, 160]) {
  const sat = I.saturation(p);
  near(
    sat.hg - sat.hf - (sat.T + 273.15) * (sat.sg - sat.sf),
    0,
    0.012,
    "IF97 saturation Gibbs consistency, release Table 44 (kJ/kg)",
  );
  for (const x of [0, 0.25, 0.5, 0.75, 1]) {
    const z = I.wet(p, x);
    near(z.h, (1 - x) * sat.hf + x * sat.hg, 1e-9, "Mass-weighted h");
    near(z.s, (1 - x) * sat.sf + x * sat.sg, 1e-11, "Mass-weighted s");
  }
}
// Published IAPWS Table 15 points now inside the expanded adapter domain.
for(const [T,h,s]of [[300,2549.91145,8.52238967],[700,3335.68375,10.1749996]]){const z=I.superheated(.035,T-273.15);near(z.h,h,1e-5,'Published Region 2 adapter enthalpy');near(z.s,s,5e-8,'Published Region 2 adapter entropy')}
const inlet = I.superheated(40, 450);
for (const pressure of [0.1, 1, 5, 20]) {
  const ideal = I.expansion(inlet, pressure, "isentropic"),
    throttle = I.expansion(inlet, pressure, "throttle"),
    real = I.expansion(inlet, pressure, "turbine", 0.85);
  near(ideal.outlet.s, inlet.s, 1e-8, "Isentropic entropy");
  near(throttle.outlet.h, inlet.h, 1e-6, "Throttle enthalpy");
  near(real.work, 0.85 * ideal.work, 1e-7, "Efficiency convention");
  near(real.outlet.h, inlet.h - real.work, 1e-7, "Steady adiabatic energy");
  assert.ok(real.outlet.s >= inlet.s && throttle.outlet.s >= inlet.s);
  checks++;
  assert.equal(
    real.path.length,
    0,
    "Irreversible internal path is not invented",
  );
  checks++;
  for (const z of ideal.path) near(z.s, inlet.s, 1e-8, "Isentropic path state");
  for (const z of throttle.path)
    near(z.h, inlet.h, 1e-6, "Isenthalpic path state");
}
for (const x of [NaN, Infinity, -1, 161]) reject(() => I.saturation(x));
for (const eta of [0, -1, 1.01, NaN])
  reject(() => I.expansion(inlet, 1, "turbine", eta));
reject(() => I.expansion(inlet, 40));
reject(() => I.expansion(inlet, 50));
reject(() => I.statePH(1, 100));
reject(() => I.statePS(1, 0));
reject(() => I.statePH(1, 1e9));
reject(() => I.superheated(1, 601));
reject(() => I.superheated(1, I.saturation(1).T));
const sh = I.superheated(1, 500);
assert.equal(I.expansion(sh, 0.5, "isentropic").outlet.phase, "superheated");
checks++;
console.log(
  JSON.stringify({
    status: "PASS",
    checks,
    independentStates: 225,
    maxAbsoluteEnthalpyError: maxH,
    maxAbsoluteEntropyError: maxS,
    domain:
      "0.01–160 bar(a), stable superheated Region 2 to 600 C; no Region 3",
  }),
);
