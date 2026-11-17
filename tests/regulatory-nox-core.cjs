const fs = require("fs"),
  vm = require("vm"),
  assert = require("node:assert/strict");
const w = {};
vm.runInNewContext(fs.readFileSync("regulatory/nox-core.js", "utf8"), w);
const N = w.MT_NOX;
let checks = 0;
const close = (a, b) => {
  checks++;
  assert.ok(Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b)), a + " != " + b);
};
const context = {
  date: "2026-06-01",
  operation: "domestic-norway",
  flag: "NO",
  engines: [{ id: "m1", kind: "propulsion", ratedKw: 1000 }],
  fund: { participates: false },
};
close(
  N.emissions({
    method: "energy",
    fuel: "mgo",
    powerKw: 1000,
    hours: 10,
    factor: 8,
    quality: "documented",
    source: "Engine factor report A",
  }).kgNOx,
  80,
);
close(
  N.emissions({
    method: "fuel",
    fuel: "mgo",
    fuelAmount: 2,
    fuelUnit: "t",
    factor: 40,
    quality: "estimated",
    source: "User estimate",
  }).kgNOx,
  80,
);
close(
  N.emissions({
    method: "fuel",
    fuel: "mgo",
    fuelAmount: 2,
    fuelUnit: "m3",
    densityKgM3: 850,
    factor: 40,
    quality: "documented",
    source: "Engine factor report A",
  }).kgNOx,
  68,
);
close(
  N.emissions({
    method: "fuel",
    fuel: "mgo",
    fuelAmount: 2000,
    fuelUnit: "L",
    densityKgM3: 850,
    factor: 40,
    quality: "documented",
    source: "Engine factor report A",
  }).kgNOx,
  68,
);
const e = {
  method: "energy",
  fuel: "ammonia",
  powerKw: 1000,
  hours: 10,
  factor: 8,
  quality: "documented",
  source: "Engine-specific ammonia test",
  factorPosition: "inlet",
  scr: {
    enabled: true,
    efficiencyPercent: 80,
    activeFraction: 0.75,
    source: "SCR performance evidence",
  },
};
const z = N.emissions(e);
close(z.kgNOx, 32);
close(z.reductionKg, 48);
assert.equal(z.quality, "estimated");
assert.throws(() => N.emissions({ ...e, factorPosition: "outlet" }));
assert.throws(() =>
  N.emissions({
    ...e,
    method: "measured",
    measuredKg: 80,
    quality: "measured",
  }),
);
assert.throws(() => N.emissions({ ...e, factor: undefined }));
assert.throws(() => N.emissions({ ...e, source: "" }));
assert.throws(() => N.emissions({ ...e, hours: -1 }));
close(N.charges(80, context).totalNok, 2155.2);
assert.equal(
  N.assessment({
    ...context,
    engines: [{ kind: "propulsion", ratedKw: 750 }],
    thermalConfigurationComplete: true,
  }).status,
  "outside",
);
assert.equal(
  N.assessment({
    ...context,
    engines: [
      { kind: "propulsion", ratedKw: 751 },
      { kind: "auxiliary", ratedKw: 200 },
    ],
  }).allSourcesIncluded,
  true,
);
assert.equal(
  N.assessment({
    ...context,
    engines: [
      { kind: "propulsion", ratedKw: 500 },
      { kind: "auxiliary", ratedKw: 500 },
    ],
    thermalConfigurationComplete: true,
  }).status,
  "outside",
);
assert.equal(
  N.assessment({
    ...context,
    engines: [
      { kind: "diesel-electric", ratedKw: 500 },
      { kind: "diesel-electric", ratedKw: 500 },
    ],
  }).status,
  "liable",
);
close(
  N.charges(80, {
    ...context,
    fund: {
      participates: true,
      joined: "2026-01-01",
      category: "ordinary",
      source: "Membership confirmation",
    },
  }).totalNok,
  1200,
);
close(
  N.charges(80, {
    ...context,
    fund: {
      participates: true,
      joined: "2026-01-01",
      category: "oil-gas-extraction",
      source: "Membership confirmation",
    },
  }).totalNok,
  1680,
);
assert.equal(
  N.charges(80, {
    ...context,
    fund: {
      participates: true,
      joined: "2026-07-01",
      category: "ordinary",
      source: "Membership",
    },
  }).totalNok,
  null,
);
close(
  N.charges(80, {
    ...context,
    operation: "direct-international",
    directConditionsConfirmed: true,
  }).totalNok,
  0,
);
assert.equal(
  N.charges(80, { ...context, operation: "direct-international" }).totalNok,
  null,
);
close(N.charges(80, { ...context, operation: "foreign-ports" }).totalNok, 0);
assert.equal(
  N.charges(80, { ...context, operation: "other", flag: "US" }).totalNok,
  null,
);
assert.equal(
  N.assessment({
    ...context,
    operation: "other",
    flag: "US",
    inNorwegianMainlandWaters: true,
  }).status,
  "liable",
);
assert.equal(
  N.assessment({
    ...context,
    operation: "other",
    flag: "NO",
    inNorwegianNearWaters: true,
  }).status,
  "liable",
);
assert.equal(
  N.assessment({
    ...context,
    operation: "other",
    flag: "US",
    inNorwegianMainlandWaters: false,
    inNorwegianNearWaters: false,
  }).status,
  "outside",
);
for (const [year, rate] of [
  [2017, 21.59],
  [2020, 22.69],
  [2025, 26.36],
  [2026, 26.94],
])
  close(N.ratesAt(year + "-01-01").government, rate);
assert.equal(N.ratesAt("2027-01-01"), null);
assert.equal(N.ratesAt("2016-12-31"), null);
assert.equal(N.charges(80, { ...context, date: "2025-01-01" }).totalNok, null);
close(
  N.charges(80, {
    ...context,
    date: "2025-01-01",
    historicalAssessment: {
      status: "liable",
      source: "Verified 2025 applicability assessment",
    },
  }).totalNok,
  2108.8,
);
const rows = [
  {
    engineId: "m1",
    date: "2026-01-01",
    method: "measured",
    fuel: "lng",
    measuredKg: 100,
    quality: "measured",
    source: "CEMS record 1",
  },
  {
    engineId: "a1",
    date: "2026-01-01",
    method: "energy",
    fuel: "hvo100",
    powerKw: 100,
    hours: 2,
    factor: 5,
    quality: "documented",
    source: "Engine-specific HVO factor",
  },
];
const result = N.calculate(rows, context);
close(result.kgNOx, 101);
close(result.totalNok, 2720.94);
assert.equal(result.items[0].emissions.method, "measured");
assert.throws(() => N.date("2026-02-30"));
assert.throws(() => N.numeric("", "value"));
assert.throws(() => N.numeric("Infinity", "value"));
close(N.numeric("1,25", "value"), 1.25);
console.log(
  JSON.stringify({
    status: "PASS",
    arithmeticChecks: checks,
    scope:
      "Independent fuel/energy/measurement arithmetic, SCR coverage/no double removal, alternative-fuel evidence, charge thresholds, domestic/foreign jurisdiction, historical rate boundaries and fund dates.",
  }),
);
