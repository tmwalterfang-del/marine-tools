const fs = require("node:fs"),
  assert = require("node:assert/strict"),
  vm = require("node:vm");
for (const file of [
  "navigation-math.js",
  "regulatory/nox-core.js",
  "regulatory/spatial-core.js",
  "regulatory/rules-core.js",
  "regulatory/voyage-core.js",
  "regulatory/route-io.js",
])
  require("../" + file);
const C = JSON.parse(fs.readFileSync("regulatory/catalogue.json")),
  R = MT_REGULATORY_RULES,
  V = MT_VOYAGE_ENVIRONMENT,
  N = MT_NOX,
  area = (id) => C.areas.find((a) => a.id === id),
  check = (a, b) =>
    assert.ok(
      Math.abs(a - b) < 1e-8 * Math.max(1, Math.abs(b)),
      a + " != " + b,
    );
const vessel = {
  keelDate: "2022-01-01",
  engines: [
    {
      id: "e",
      name: "ME",
      kind: "propulsion",
      ratedKw: 1000,
      dieselEngine: true,
      tier: "III",
      eiappSource: "Reference certificate",
    },
  ],
};
assert.equal(
  R.evaluate(area("mediterranean"), "2026-01-01", vessel, C).nox.status,
  "not-active",
  "Mediterranean is not a NOx ECA",
);
assert.equal(
  R.evaluate(area("norwegian-sea"), "2026-06-01", vessel, C).sulphurPercent,
  0.5,
);
assert.equal(
  R.evaluate(area("norwegian-sea"), "2026-06-01", vessel, C).status,
  "transitional",
);
assert.equal(
  R.evaluate(area("norwegian-sea"), "2027-03-01", vessel, C).sulphurPercent,
  0.1,
);
assert.equal(
  R.evaluate(area("canadian-arctic"), "2027-02-28", vessel, C).sulphurPercent,
  0.5,
);
assert.equal(
  R.evaluate(area("north-east-atlantic"), "2026-11-03", vessel, C).status,
  "adopted-future",
);
assert.equal(
  R.evaluate(area("north-east-atlantic"), "2027-09-01", vessel, C)
    .sulphurPercent,
  0.5,
);
assert.equal(
  R.evaluate(area("north-east-atlantic"), "2028-09-01", vessel, C)
    .sulphurPercent,
  0.1,
);
assert.equal(
  R.evaluate(area("baltic-sea"), "2010-06-30", vessel, C).sulphurPercent,
  1.5,
);
assert.equal(
  R.evaluate(area("baltic-sea"), "2010-07-01", vessel, C).sulphurPercent,
  1,
);
assert.equal(
  R.evaluate(area("baltic-sea"), "2015-01-01", vessel, C).sulphurPercent,
  0.1,
);
assert.equal(
  R.evaluate(area("baltic-sea"), "2026-01-01", vessel, C).nox.status,
  "tier-iii-required",
);
assert.equal(
  R.evaluate(area("baltic-sea"), "2026-01-01", {}, C).nox.status,
  "unconfirmed",
);
assert.equal(
  R.evaluate(
    area("baltic-sea"),
    "2026-01-01",
    { ...vessel, engines: [{ ...vessel.engines[0], ratedKw: 130 }] },
    C,
  ).nox.status,
  "outside-engine-or-construction-scope",
);
assert.equal(
  R.evaluate(
    area("baltic-sea"),
    "2026-01-01",
    { ...vessel, keelDate: "2000-01-01" },
    C,
  ).nox.status,
  "unconfirmed",
  "Installation/conversion history cannot be assumed",
);
const criteria = area("norwegian-sea").construction;
assert.equal(
  R.constructed(criteria, { contractDate: "2026-03-01" }).status,
  "applies",
);
assert.equal(
  R.constructed(criteria, { noBuildingContract: true, keelDate: "2026-09-01" })
    .status,
  "applies",
);
assert.equal(
  R.constructed(criteria, {
    contractDate: "2020-01-01",
    deliveryDate: "2030-03-01",
  }).status,
  "applies",
);
assert.equal(
  R.constructed(criteria, {
    contractDate: "2020-01-01",
    deliveryDate: "2026-01-01",
  }).status,
  "outside-construction-cutoff",
);
assert.equal(
  R.constructed(criteria, { contractDate: "2020-01-01" }).status,
  "unconfirmed",
);
assert.equal(
  R.constructed(criteria, { contractDate: "2026-03-01BAD" }).status,
  "unconfirmed",
);
const proposal = R.evaluate(
  { ...area("north-east-atlantic"), adoptionStatus: "proposed" },
  "2040-01-01",
  vessel,
  C,
);
assert.equal(proposal.status, "proposed");
assert.equal(proposal.sulphurPercent, null);
const national = area("geiranger-tafjord"),
  largePassenger = { shipType: "passenger", grossTonnage: 20000 },
  cargo = { shipType: "cargo", grossTonnage: 2000 };
assert.equal(
  R.evaluate(national, "2026-01-01", largePassenger, C).requirements.find(
    (r) => r.code === "fjord-zero-large",
  ).status,
  "adopted-future",
);
assert.equal(
  R.evaluate(national, "2032-01-01", largePassenger, C).requirements.find(
    (r) => r.code === "fjord-zero-large",
  ).status,
  "active",
);
assert.equal(
  R.evaluate(national, "2026-01-01", cargo, C).requirements.find(
    (r) => r.code === "fjord-nox-noncargo",
  ).vesselApplicability,
  "outside-scope",
);
assert.equal(
  R.evaluate(national, "2026-01-01", cargo, C).requirements.find(
    (r) => r.code === "fjord-nox-cargo",
  ).status,
  "adopted-future",
);
assert.equal(
  R.evaluate(national, "2030-01-01", cargo, C).requirements.find(
    (r) => r.code === "fjord-nox-cargo",
  ).status,
  "active",
);
assert.equal(
  R.evaluate(
    area("nw-mediterranean-pssa"),
    "2026-01-01",
    { shipType: "cargo", grossTonnage: 500 },
    C,
  ).requirements[0].strength,
  "recommended",
);
assert.equal(
  R.evaluate(
    { ...national, adoptionStatus: "proposed" },
    "2040-01-01",
    cargo,
    C,
  ).requirements.length,
  0,
);
const route = MT_REGULATORY_GEO.analyze(
    [
      [0, 0],
      [1, 0],
    ],
    [],
    { departure: "2026-06-01T00:00:00Z", speedKn: 10 },
  ),
  base = {
    ...route,
    segments: [
      {
        ...route.segments[0],
        fromNm: 0,
        toNm: 20,
        distanceNm: 20,
        hours: 2,
        entry: "2026-06-01T00:00:00Z",
        rules: [],
        globalSulphurPercent: 0.5,
      },
      {
        ...route.segments[0],
        fromNm: 20,
        toNm: route.totalNm,
        distanceNm: route.totalNm - 20,
        hours: route.totalHours - 2,
        entry: "2026-06-01T02:00:00Z",
        rules: [{ areaId: "test", sulphurPercent: 0.1 }],
        areaIds: ["test"],
        globalSulphurPercent: 0.5,
      },
    ],
  };
const switchPlan = V.changeovers(base, {
  hours: 1.5,
  source: "Approved vessel procedure",
});
assert.equal(switchPlan.length, 1);
assert.equal(switchPlan[0].latestStart, "2026-06-01T00:30:00.000Z");
check(switchPlan[0].startNm, 5);
check(MT_NAV_MATH.distance([0, 0], switchPlan[0].startPosition), 5);
assert.equal(
  V.changeovers(base, { hours: 3, source: "Procedure" })[0].beforeDeparture,
  true,
);
assert.throws(() => V.changeovers(base, { hours: 3, source: "" }));
const consumption = V.consumption(base, {
  rate: 0.1,
  carrier: { id: "f", name: "Fuel", primaryUnit: "m3", densityKgM3: 850 },
});
check(consumption.totalKg, base.totalHours * 0.1 * 850);
check(
  consumption.segments.reduce((n, r) => n + r.amount, 0),
  consumption.totalAmount,
);
assert.equal(
  V.consumption(base, { rate: 0.1, carrier: { id: "f", primaryUnit: "m3" } })
    .totalKg,
  null,
);
const sox = V.sulphurOxides(consumption, {
  factorKgT: 20,
  source: "Specific SO2 test for selected fuel",
});
check(sox.totalKgSO2, (consumption.totalKg / 1000) * 20);
assert.throws(() =>
  V.sulphurOxides(consumption, { factorKgT: 20, source: "" }),
);
assert.equal(V.sulphurOxides(consumption, {}), null);
const profile = {
    engines: [
      {
        id: "m",
        kind: "propulsion",
        ratedKw: 1000,
        factorMethod: "energy",
        factor: 8,
        factorPosition: "outlet",
        factorSource: "ME report",
        carrierId: "f",
      },
      {
        id: "a",
        kind: "auxiliary",
        ratedKw: 200,
        factorMethod: "energy",
        factor: 6,
        factorPosition: "outlet",
        factorSource: "AE report",
        carrierId: "f",
      },
    ],
    carriers: [{ id: "f", catalogKey: "hvo100" }],
  },
  context = {
    operation: "domestic-norway",
    engines: profile.engines,
    fund: {
      participates: true,
      joined: "2026-01-01",
      category: "ordinary",
      source: "Fund membership",
    },
  };
const nox = V.emissions(base, {
  profile,
  loads: { m: 50, a: 25 },
  chargeContext: context,
});
check(nox.kgNOx, 4.3 * base.totalHours);
check(nox.totalNok, nox.kgNOx * 15);
assert.equal(nox.quality, "estimated");
const foreign = V.emissions(base, {
  profile,
  loads: { m: 50, a: 25 },
  chargeContext: { ...context, operation: "foreign-ports" },
});
check(foreign.totalNok, 0);
assert.throws(() =>
  V.emissions(base, {
    profile,
    loads: { m: 101, a: 25 },
    chargeContext: context,
  }),
);
assert.throws(() =>
  V.emissions(base, {
    profile: {
      ...profile,
      engines: [{ ...profile.engines[0], factorSource: "" }],
    },
    loads: { m: 50 },
    chargeContext: context,
  }),
);
assert.equal(
  MT_ROUTE_IO.csv([[-10, '=HYPERLINK("evil")']]),
  '\uFEFF"-10","\'=HYPERLINK(""evil"")"',
);
for (const fuel of N.fuels)
  assert.throws(() =>
    N.emissions({
      fuel,
      method: "energy",
      quality: "estimated",
      powerKw: 100,
      hours: 1,
      source: "A source without a factor",
    }),
  );
const storage = new Map([
    [
      "mt.profile.v2",
      JSON.stringify({
        ...profile,
        schemaVersion: 1,
        vessel: { name: "A" },
        operational: { fuelDay: 7 },
        machinery: [{ id: "m", name: "ME", ratedPowerKw: 1000 }],
        tanks: [{ id: "t" }],
        untouched: { value: 42 },
      }),
    ],
    ["mt.profile", JSON.stringify({ name: "A", draft: 4.2 })],
  ]),
  w = {
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
  };
vm.runInNewContext(fs.readFileSync("regulatory/profile-adapter.js", "utf8"), w);
w.MT_REGULATORY_PROFILE.save({ name: "B", flag: "NO", engines: [] });
const saved = JSON.parse(storage.get("mt.profile.v2"));
assert.equal(saved.untouched.value, 42);
assert.equal(saved.tanks.length, 1);
assert.equal(saved.operational.fuelDay, 7);
assert.equal(JSON.parse(storage.get("mt.profile")).draft, 4.2);
assert.equal(JSON.parse(storage.get("mt.profile")).name, "B");
console.log(
  JSON.stringify({
    status: "PASS",
    scope:
      "Actual adopted transitions, proposals excluded, construction and engine uncertainty, national future dates, independent voyage load/fuel/changeover arithmetic, separate jurisdiction, CSV security and profile preservation.",
  }),
);
