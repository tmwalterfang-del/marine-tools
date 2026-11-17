"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const sandbox = {};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, "../regulatory/nox-core.js"), "utf8"),
  sandbox,
);
const N = sandbox.MT_NOX;

/*
 * Independent hand references: every expected quantity below is a literal.
 * No expected value is computed with MT_NOX, its rate table, or a second copy
 * of its formula. Factors, measurements and membership records are synthetic
 * test inputs, not approved factors or evidence of actual tax liability.
 *
 * Absolute tolerances (not relative): mass 1e-9 kg, energy 1e-8 kWh,
 * money 1e-8 NOK, rate 1e-12 NOK/kg. Status/null/validation checks are exact.
 * Valid arithmetic domain: finite nonnegative amounts, power, hours and factors
 * up to 1e12 each; volume density > 0 and <= 3000 kg/m3; final mass <= 1e15 kg.
 * SCR additionally needs an untreated inlet factor, efficiency 0..100 percent,
 * treated operating fraction 0..1, and a nonblank source. Measured/outlet
 * emissions cannot receive another SCR deduction. Each case uses this domain
 * unless its comment explicitly identifies an invalid or unsupported input.
 *
 * Rate source cross-check performed 2026-11-17 (no network needed to run tests):
 * https://www.noxfondet.no/artikler/innbetalingssatser/
 * Its "Innbetalingssatser fra 2017" table independently supplies all three
 * columns for 2017..2026, transcribed below. Low = ordinary; high = extraction.
 * https://www.skatteetaten.no/satser/saravgift---nox/
 * independently confirms the 2026 government rate 26.94 NOK/kg. Historical
 * government rates were checked against the Fund table, not separately against
 * each historical Skatteetaten circular.
 * Threshold reference: Skatteetaten, 2026 NOx circular, section 2.1, pp. 5-6:
 * https://www.skatteetaten.no/globalassets/rettskilder/avgiftsrundskriv/avgift-pa-nox-2026.pdf
 * Propulsion strictly > 750 kW or combustion thermal input strictly > 10 MW;
 * auxiliary/manoeuvring output and electric machinery do not add propulsion.
 * These tests cover arithmetic and explicit assessment assumptions, not a
 * complete legal assessment or acceptance of real documents/accounts.
 */
const TOL = { mass: 1e-9, energy: 1e-8, money: 1e-8, rate: 1e-12 };
let cases = 0;
let checks = 0;
let currentCase = "";
function test(name, run) {
  currentCase = name;
  run();
  cases++;
}
function close(actual, expected, tolerance, label) {
  checks++;
  assert.ok(
    typeof actual === "number" &&
      Number.isFinite(actual) &&
      Math.abs(actual - expected) <= tolerance,
    `${currentCase}: ${label}: ${actual} != ${expected} (absolute ${tolerance})`,
  );
}
function equal(actual, expected, label) {
  checks++;
  assert.equal(actual, expected, `${currentCase}: ${label}`);
}
function rejects(run, error) {
  checks++;
  assert.throws(run, error, currentCase);
}

const evidence = {
  fuel: "mgo",
  quality: "documented",
  source: "Synthetic factor for independent hand reference",
};
const energy = {
  ...evidence,
  method: "energy",
  powerKw: 1250.5,
  hours: 2.4,
  factor: 8.5,
};
const fuelKg = {
  ...evidence,
  method: "fuel",
  fuelUnit: "kg",
  fuelAmount: 2375,
  factor: 42.4,
};
const fuelVolume = {
  ...evidence,
  method: "fuel",
  fuelUnit: "m3",
  fuelAmount: 1.75,
  densityKgM3: 840,
  factor: 45,
};
const measured = {
  fuel: "lng",
  method: "measured",
  measuredKg: 12.375,
  quality: "measured",
  source: "Synthetic measured mass for hand reference",
};
const scr = {
  ...evidence,
  method: "energy",
  powerKw: 900,
  hours: 4,
  factor: 10,
  factorPosition: "inlet",
  scr: {
    enabled: true,
    efficiencyPercent: 85,
    activeFraction: 0.4,
    source: "Synthetic SCR planning assumption",
  },
};
const context = {
  date: "2026-06-01",
  operation: "domestic-norway",
  flag: "NO",
  engines: [{ kind: "propulsion", ratedKw: 1000 }],
  fund: { participates: false },
};
const historicalAssessment = {
  status: "liable",
  source: "Synthetic explicit historical applicability assumption",
};
const membership = {
  participates: true,
  joined: "2017-01-01",
  category: "ordinary",
  source: "Synthetic dated membership assumption",
};

test("energy in numeric and comma-decimal representations", () => {
  // Inputs: 1250.5 kW, 2.4 h, 8.5 g/kWh (also all three as comma strings).
  // Hand: 1250.5 x 2.4 = 3001.2 kWh; 3001.2 x 8.5 = 25510.2 g;
  // 25510.2 / 1000 = 25.5102 kg. Range: nonnegative energy inputs above.
  // Expected: 3001.2 kWh, 25.5102 kg untreated/final, 0 reduction.
  // Tolerance: energy 1e-8 kWh; mass 1e-9 kg.
  for (const input of [
    energy,
    { ...energy, powerKw: "1250,5", hours: "2,4", factor: "8,5" },
  ]) {
    const result = N.emissions(input);
    close(result.energyKwh, 3001.2, TOL.energy, "energy");
    close(result.untreatedKg, 25.5102, TOL.mass, "untreated mass");
    close(result.kgNOx, 25.5102, TOL.mass, "final mass");
    close(result.reductionKg, 0, TOL.mass, "reduction");
    equal(result.fuelKg, null, "no implied fuel consumption");
  }
});

const fuelCases = [
  // Inputs: 2375 kg, 42.4 kg/t. Hand: 2375 / 1000 = 2.375 t;
  // 2.375 x 42.4 = 100.7 kg. Range: nonnegative mass/factor domain.
  // Expected fuel 2375 kg, NOx 100.7 kg; tolerance 1e-9 kg for both.
  { name: "fuel in kg", input: fuelKg, fuel: 2375, nox: 100.7 },
  // Inputs: 3.6 t, 47.5 kg/t. Hand: 3.6 x 1000 = 3600 kg fuel;
  // 3.6 x 47.5 = 171 kg NOx. Range: nonnegative mass/factor domain.
  // Expected fuel 3600 kg, NOx 171 kg; tolerance 1e-9 kg for both.
  {
    name: "fuel in tonnes with comma decimals",
    input: { ...fuelKg, fuelUnit: "t", fuelAmount: "3,6", factor: "47,5" },
    fuel: 3600,
    nox: 171,
  },
  // Inputs: 1.75 m3, 840 kg/m3, 45 kg/t. Hand: 1.75 x 840 = 1470 kg;
  // 1470 / 1000 = 1.47 t; 1.47 x 45 = 66.15 kg NOx.
  // Range: nonnegative volume/factor, density (0, 3000] kg/m3.
  // Expected fuel 1470 kg, NOx 66.15 kg; tolerance 1e-9 kg for both.
  { name: "fuel in cubic metres", input: fuelVolume, fuel: 1470, nox: 66.15 },
  // Inputs: 1750 L, 840 kg/m3, 45 kg/t. Hand: 1750 / 1000 = 1.75 m3;
  // 1.75 x 840 = 1470 kg; 1.47 x 45 = 66.15 kg NOx.
  // Range: nonnegative volume/factor, density (0, 3000] kg/m3.
  // Expected fuel 1470 kg, NOx 66.15 kg; tolerance 1e-9 kg for both.
  {
    name: "fuel in litres",
    input: { ...fuelVolume, fuelUnit: "L", fuelAmount: 1750 },
    fuel: 1470,
    nox: 66.15,
  },
];
for (const fixture of fuelCases) {
  test(fixture.name, () => {
    const result = N.emissions(fixture.input);
    close(result.fuelKg, fixture.fuel, TOL.mass, "fuel mass");
    close(result.untreatedKg, fixture.nox, TOL.mass, "untreated mass");
    close(result.kgNOx, fixture.nox, TOL.mass, "final mass");
    equal(result.energyKwh, null, "no implied energy");
  });
}

test("measured outlet mass is retained", () => {
  // Input: 12.375 kg measured (number and comma string), no factor/density.
  // Hand: 12.375 kg entered = 12.375 kg output, 0 kg further reduction.
  // Range: measured mass [0, 1e12] kg with measured evidence, no SCR.
  // Expected final/untreated 12.375 kg, reduction 0; tolerance 1e-9 kg.
  for (const measuredKg of [12.375, "12,375"]) {
    const result = N.emissions({ ...measured, measuredKg });
    close(result.kgNOx, 12.375, TOL.mass, "measured mass");
    close(result.untreatedKg, 12.375, TOL.mass, "entered mass");
    close(result.reductionKg, 0, TOL.mass, "no double removal");
    equal(result.quality, "measured", "quality");
    equal(result.factor, null, "no assumed factor");
  }
});

test("SCR efficiency applies only to the treated operating fraction", () => {
  // Inputs: 900 kW, 4 h, 10 g/kWh, inlet factor, 85% removal for 0.4 of work.
  // Hand: 900 x 4 x 10 / 1000 = 36 kg untreated;
  // 36 x 0.85 x 0.4 = 12.24 kg removed; 36 - 12.24 = 23.76 kg emitted.
  // Range: inlet-factor SCR domain above. Tolerance: mass 1e-9 kg.
  const result = N.emissions(scr);
  close(result.untreatedKg, 36, TOL.mass, "untreated");
  close(result.reductionKg, 12.24, TOL.mass, "removed");
  close(result.kgNOx, 23.76, TOL.mass, "emitted");
  equal(result.quality, "estimated", "SCR assumptions change quality");
});

const scrLimits = [
  // Same 36 kg inlet. Hand: 36 x 0 x 0.4 = 0 removed; 36 - 0 = 36 emitted.
  // Range: valid 0% endpoint; tolerance 1e-9 kg.
  { efficiency: 0, active: 0.4, removed: 0, emitted: 36 },
  // Same 36 kg inlet. Hand: 36 x 0.85 x 0 = 0 removed; 36 - 0 = 36 emitted.
  // Range: valid zero treated-fraction endpoint; tolerance 1e-9 kg.
  { efficiency: 85, active: 0, removed: 0, emitted: 36 },
  // Same 36 kg inlet. Hand: 36 x 1 x 1 = 36 removed; 36 - 36 = 0 emitted.
  // Range: valid 100%/fully treated endpoints; tolerance 1e-9 kg.
  { efficiency: 100, active: 1, removed: 36, emitted: 0 },
];
for (const fixture of scrLimits) {
  test(`SCR endpoint ${fixture.efficiency}% / ${fixture.active}`, () => {
    const result = N.emissions({
      ...scr,
      scr: {
        ...scr.scr,
        efficiencyPercent: fixture.efficiency,
        activeFraction: fixture.active,
      },
    });
    close(result.reductionKg, fixture.removed, TOL.mass, "removed");
    close(result.kgNOx, fixture.emitted, TOL.mass, "emitted");
  });
}

test("zero activity and zero measurement are valid, unlike blanks", () => {
  // Inputs: 0 kW x 2.4 h x 8.5 g/kWh; 0 kg fuel x 42.4 kg/t; 0 kg measured.
  // Hand: 0 x 2.4 x 8.5 / 1000 = 0; 0 / 1000 x 42.4 = 0; 0 = 0 kg.
  // Range: valid zero endpoints. Expected all 0 kg; tolerance 1e-9 kg.
  for (const input of [
    { ...energy, powerKw: 0 },
    { ...fuelKg, fuelAmount: 0 },
    { ...measured, measuredKg: 0 },
  ]) close(N.emissions(input).kgNOx, 0, TOL.mass, "zero mass");
});

test("propulsion threshold excludes auxiliary and electric output", () => {
  // Inputs: 400 + 350 kW propulsion, 900 kW auxiliary, 5000 kW electric.
  // Hand: 400 + 350 = 750 kW counted; 750 is not > 750, thermal input = 0.
  // Range: 2026 domestic operation, complete thermal configuration, nonnegative
  // rated powers. Expected outside, 750 kW propulsion, 0 kW thermal input.
  // Tolerance: 1e-9 kW, exact status (no tolerance).
  const result = N.assessment({
    ...context,
    thermalConfigurationComplete: true,
    engines: [
      { kind: "propulsion", ratedKw: 400 },
      { kind: "propulsion", ratedKw: 350 },
      { kind: "auxiliary", ratedKw: 900 },
      { kind: "electric", ratedKw: 5000 },
    ],
  });
  equal(result.status, "outside", "750 kW endpoint");
  close(result.propulsionKw, 750, 1e-9, "counted propulsion");
  close(result.thermalInputKw, 0, 1e-9, "thermal input");
});

test("diesel-electric propulsion just above threshold includes all sources", () => {
  // Inputs: diesel-electric 500.25 and 250 kW, auxiliary 100 kW.
  // Hand: 500.25 + 250 = 750.25 kW > 750 kW; auxiliary adds 0 propulsion.
  // Range: 2026 domestic operation, nonnegative rated powers; comma accepted.
  // Expected liable, all sources included, 750.25 kW; tolerance 1e-9 kW,
  // exact status/boolean.
  const result = N.assessment({
    ...context,
    engines: [
      { kind: "diesel-electric", ratedKw: "500,25" },
      { kind: "diesel-electric", ratedKw: 250 },
      { kind: "auxiliary", ratedKw: 100 },
    ],
  });
  equal(result.status, "liable", "above 750 kW");
  equal(result.allSourcesIncluded, true, "all emission sources counted");
  close(result.propulsionKw, 750.25, 1e-9, "counted propulsion");
});

const thermalCases = [
  // Inputs: boiler 6250.5 kW + turbine 3749.5 kW thermal, rated output 0 each.
  // Hand: 6250.5 + 3749.5 = 10000 kW = 10 MW, not > 10 MW.
  // Range: 2026 domestic, complete combustion configuration.
  // Expected outside, 10000 kW thermal, 0 propulsion; tolerance 1e-9 kW.
  { second: "3749,5", total: 10000, status: "outside" },
  // Inputs: boiler 6250.5 kW + turbine 3750 kW thermal, rated output 0 each.
  // Hand: 6250.5 + 3750 = 10000.5 kW > 10000 kW.
  // Range: 2026 domestic, complete combustion configuration.
  // Expected liable, 10000.5 kW thermal, 0 propulsion; tolerance 1e-9 kW.
  { second: 3750, total: 10000.5, status: "liable" },
];
for (const fixture of thermalCases) {
  test(`thermal input threshold ${fixture.total} kW`, () => {
    const result = N.assessment({
      ...context,
      thermalConfigurationComplete: true,
      engines: [
        { kind: "boiler", ratedKw: 0, thermalInputKw: "6250,5" },
        { kind: "turbine", ratedKw: 0, thermalInputKw: fixture.second },
      ],
    });
    equal(result.status, fixture.status, "thermal threshold");
    close(result.thermalInputKw, fixture.total, 1e-9, "summed thermal input");
    close(result.propulsionKw, 0, 1e-9, "no propulsion");
  });
}

// Each row is an independent source lookup, not an arithmetic calculation:
// input dates January 1 and December 31 of the stated year; expected columns
// are the literal NOK/kg figures in the Fund source table cited above.
// Valid range: each stated calendar year, [January 1, next January 1).
// Rate tolerance: 1e-12 NOK/kg; date, currency and basis comparisons are exact.
const sourceRates = [
  [2017, 21.59, 4, 11],
  [2018, 21.94, 6, 12],
  [2019, 22.27, 8.5, 14.5],
  [2020, 22.69, 10.5, 16.5],
  [2021, 23.48, 10.5, 16.5],
  [2022, 23.79, 10.5, 16.5],
  [2023, 24.46, 11, 17],
  [2024, 25.59, 11.5, 17.5],
  [2025, 26.36, 12, 18],
  [2026, 26.94, 15, 21],
];
for (const [year, government, ordinary, extraction] of sourceRates) {
  test(`source rate table ${year} and calendar endpoints`, () => {
    for (const day of [`${year}-01-01`, `${year}-12-31`]) {
      const rate = N.ratesAt(day);
      assert.ok(rate, `${currentCase}: missing rate for ${day}`);
      checks++;
      close(rate.government, government, TOL.rate, "government NOK/kg");
      close(rate.fundOrdinary, ordinary, TOL.rate, "ordinary NOK/kg");
      close(rate.fundExtraction, extraction, TOL.rate, "extraction NOK/kg");
      equal(rate.from, `${year}-01-01`, "inclusive start");
      equal(rate.until, `${year + 1}-01-01`, "exclusive end");
      equal(rate.currency, "NOK", "currency");
      equal(rate.basis, "kg NOx", "rate basis");
    }
  });
}

const chargeCases = [
  // Input 12.5 kg at 2025-12-31, explicit historical liability, no Fund.
  // Hand: 12.5 x 26.36 = 329.5 NOK government, 0 Fund, 329.5 total.
  // Range: 2025 rate, historical applicability supplied; tolerance 1e-8 NOK.
  { date: "2025-12-31", category: null, government: 329.5, fund: 0, total: 329.5, rate: 26.36 },
  // Input 12.5 kg at 2025-12-31, documented ordinary Fund membership.
  // Hand: 12.5 x 12 = 150 NOK Fund, 0 government, 150 total.
  // Range: 2025 rate, membership active, historical applicability supplied;
  // tolerance 1e-8 NOK, rate 1e-12 NOK/kg.
  { date: "2025-12-31", category: "ordinary", government: 0, fund: 150, total: 150, rate: 12 },
  // Input 12.5 kg at 2025-12-31, extraction Fund membership.
  // Hand: 12.5 x 18 = 225 NOK Fund, 0 government, 225 total.
  // Range: as preceding case; tolerance 1e-8 NOK, rate 1e-12 NOK/kg.
  { date: "2025-12-31", category: "oil-gas-extraction", government: 0, fund: 225, total: 225, rate: 18 },
  // Input 12.5 kg at exactly 2026-01-01, domestic 1000 kW, no Fund.
  // Hand: 12.5 x 26.94 = 336.75 NOK government, 0 Fund, 336.75 total.
  // Range: 2026 rate starts inclusively; tolerance 1e-8 NOK, rate 1e-12 NOK/kg.
  { date: "2026-01-01", category: null, government: 336.75, fund: 0, total: 336.75, rate: 26.94 },
  // Input 12.5 kg at exactly 2026-01-01, ordinary Fund membership.
  // Hand: 12.5 x 15 = 187.5 NOK Fund, 0 government, 187.5 total.
  // Range: active membership and 2026 rate; tolerance 1e-8 NOK, rate 1e-12.
  { date: "2026-01-01", category: "ordinary", government: 0, fund: 187.5, total: 187.5, rate: 15 },
  // Input 12.5 kg at exactly 2026-01-01, extraction Fund membership.
  // Hand: 12.5 x 21 = 262.5 NOK Fund, 0 government, 262.5 total.
  // Range: active membership and 2026 rate; tolerance 1e-8 NOK, rate 1e-12.
  { date: "2026-01-01", category: "oil-gas-extraction", government: 0, fund: 262.5, total: 262.5, rate: 21 },
];
for (const fixture of chargeCases) {
  test(`charges ${fixture.date} ${fixture.category || "government"}`, () => {
    const result = N.charges("12,5", {
      ...context,
      date: fixture.date,
      ...(fixture.date === "2025-12-31" ? { historicalAssessment } : {}),
      fund: fixture.category
        ? { ...membership, category: fixture.category }
        : { participates: false },
    });
    close(result.governmentNok, fixture.government, TOL.money, "government");
    close(result.fundNok, fixture.fund, TOL.money, "Fund");
    close(result.totalNok, fixture.total, TOL.money, "total");
    close(result.rateNokKg, fixture.rate, TOL.rate, "rate");
    equal(result.assessment.status, "liable", "confirmed applicability");
    equal(result.scheme, fixture.category ? "nox-fund" : "government", "scheme");
  });
}

test("charges retain fractional ore rather than rounding each operation", () => {
  // Inputs: 0.125 kg, 2026 domestic 1000 kW, no Fund.
  // Hand: 0.125 x 26.94 = 3.3675 NOK government and total, 0 Fund.
  // Range: nonnegative charge mass <= 1e12 kg, 2026; tolerance 1e-8 NOK.
  const result = N.charges(0.125, context);
  close(result.governmentNok, 3.3675, TOL.money, "unrounded government");
  close(result.fundNok, 0, TOL.money, "Fund");
  close(result.totalNok, 3.3675, TOL.money, "unrounded total");
});

test("outside and confirmed exempt operations cost zero", () => {
  // Inputs: 12.5 kg in 2026; either foreign-port voyage or confirmed direct
  // international voyage. Hand: no applicable charge = 0 government + 0 Fund
  // = 0 NOK total. Range: these explicit voyage facts only, valid mass/date.
  // Expected outside/exempt respectively; tolerance 1e-8 NOK, exact status.
  for (const [operation, status] of [
    ["foreign-ports", "outside"],
    ["direct-international", "exempt"],
  ]) {
    const result = N.charges(12.5, {
      ...context,
      operation,
      directConditionsConfirmed: true,
    });
    equal(result.assessment.status, status, "voyage status");
    close(result.governmentNok, 0, TOL.money, "government");
    close(result.fundNok, 0, TOL.money, "Fund");
    close(result.totalNok, 0, TOL.money, "total");
  }
});

test("Fund membership starts inclusively and ends exclusively", () => {
  // Inputs: 12.5 kg, ordinary Fund joined 2026-01-01, until 2026-02-01.
  // Hand: on Jan 1 and Jan 31, 12.5 x 15 = 187.5 NOK; on Feb 1 the
  // membership is no longer confirmed, so charge is unknown (null), not zero.
  // Range: 2026 liability, exact calendar membership interval [join, until).
  // Tolerance: 1e-8 NOK for valid costs; null/status exact.
  const fund = { ...membership, joined: "2026-01-01", until: "2026-02-01" };
  for (const date of ["2026-01-01", "2026-01-31"]) {
    close(N.charges(12.5, { ...context, date, fund }).totalNok, 187.5, TOL.money, date);
  }
  const result = N.charges(12.5, { ...context, date: "2026-02-01", fund });
  equal(result.totalNok, null, "membership expiry is unknown");
  equal(result.assessment.reason, "fund-membership-period-unconfirmed", "reason");
});

test("calculate sums four independently worked rows across New Year", () => {
  // Inputs: energy row 2025-12-31; fuel-kg, SCR and measured rows 2026-01-01;
  // explicit historical liability and no Fund. Hand, using the cases above:
  // energy 25.5102 x 26.36 = 672.448872 NOK;
  // fuel 100.7 x 26.94 = 2712.858 NOK;
  // SCR 23.76 x 26.94 = 640.0944 NOK;
  // measured 12.375 x 26.94 = 333.3825 NOK.
  // 25.5102 + 100.7 + 23.76 + 12.375 = 162.3452 kg;
  // 672.448872 + 2712.858 + 640.0944 + 333.3825 = 4358.783772 NOK.
  // Range: 1..200 valid rows, each in its own supported date interval; context
  // date deliberately differs (2024) to detect using one rate for all rows.
  // Expected government/total 4358.783772, Fund 0, quality estimated.
  // Tolerance: mass 1e-9 kg, money 1e-8 NOK; quality exact.
  const result = N.calculate([
    { ...energy, date: "2025-12-31" },
    { ...fuelKg, date: "2026-01-01" },
    { ...scr, date: "2026-01-01" },
    { ...measured, date: "2026-01-01" },
  ], { ...context, date: "2024-01-01", historicalAssessment });
  equal(result.items.length, 4, "row count");
  close(result.kgNOx, 162.3452, TOL.mass, "total mass");
  close(result.items[0].charges.totalNok, 672.448872, TOL.money, "2025 row");
  close(result.items[1].charges.totalNok, 2712.858, TOL.money, "fuel row");
  close(result.items[2].charges.totalNok, 640.0944, TOL.money, "SCR row");
  close(result.items[3].charges.totalNok, 333.3825, TOL.money, "measured row");
  close(result.governmentNok, 4358.783772, TOL.money, "government sum");
  close(result.fundNok, 0, TOL.money, "Fund sum");
  close(result.totalNok, 4358.783772, TOL.money, "total sum");
  equal(result.quality, "estimated", "aggregate evidence quality");
});

for (const fixture of [
  // Inputs: measured 12.5 kg on 2025-12-31 and 2026-01-01, ordinary Fund.
  // Hand: 12.5 + 12.5 = 25 kg; 150 + 187.5 = 337.5 NOK Fund/total.
  // Range: valid dated membership/historical applicability; mass 1e-9 kg,
  // money 1e-8 NOK, government 0, all-measured quality exact.
  { category: "ordinary", total: 337.5 },
  // Same measured rows, extraction category. Hand: 12.5 + 12.5 = 25 kg;
  // 225 + 262.5 = 487.5 NOK Fund/total, government 0.
  // Range/tolerances as preceding case.
  { category: "oil-gas-extraction", total: 487.5 },
]) {
  test(`calculate Fund aggregate ${fixture.category}`, () => {
    const result = N.calculate([
      { ...measured, measuredKg: 12.5, date: "2025-12-31" },
      { ...measured, measuredKg: 12.5, date: "2026-01-01" },
    ], {
      ...context,
      historicalAssessment,
      fund: { ...membership, category: fixture.category },
    });
    close(result.kgNOx, 25, TOL.mass, "mass sum");
    close(result.governmentNok, 0, TOL.money, "government sum");
    close(result.fundNok, fixture.total, TOL.money, "Fund sum");
    close(result.totalNok, fixture.total, TOL.money, "total sum");
    equal(result.quality, "measured", "all rows measured");
  });
}

test("unknown applicability prevents a misleading partial cost sum", () => {
  // Inputs: measured 12.5 kg on 2025-12-31 and 2026-01-01, no historical
  // applicability evidence, no Fund. Hand: 12.5 + 12.5 = 25 kg; 2026 row
  // costs 12.5 x 26.94 = 336.75 NOK, but unknown 2025 cost + 336.75 remains
  // unknown. Range: 2026 automatic scope only; older rate availability alone
  // does not prove liability. Expected all aggregate costs null, not 336.75.
  // Tolerance: mass 1e-9 kg, money 1e-8 NOK; null/status exact.
  const result = N.calculate([
    { ...measured, measuredKg: 12.5, date: "2025-12-31" },
    { ...measured, measuredKg: 12.5, date: "2026-01-01" },
  ], context);
  close(result.kgNOx, 25, TOL.mass, "complete mass sum");
  equal(result.items[0].charges.assessment.status, "unconfirmed", "2025 scope");
  close(result.items[1].charges.totalNok, 336.75, TOL.money, "2026 known cost");
  equal(result.governmentNok, null, "unknown government aggregate");
  equal(result.fundNok, null, "unknown Fund aggregate");
  equal(result.totalNok, null, "unknown total aggregate");
});

// For every numeric entry point below, vary only the named input of an otherwise
// valid fixture. Hand/domain checks: blank is missing, not 0; -0.01 < 0 is
// outside the nonnegative domain; NaN/infinity are not finite; "1,2,3" is not
// one decimal number. Expected: rejection, no numeric result, exact (no tolerance).
const invalidNumbers = [
  ["blank", "", /is required/],
  ["whitespace", " \t ", /is required/],
  ["null", null, /is required/],
  ["missing", undefined, /is required/],
  ["negative", -0.01, /outside the supported range/],
  ["negative comma", "-0,01", /outside the supported range/],
  ["NaN", NaN, /finite number/],
  ["infinity", Infinity, /finite number/],
  ["multiple commas", "1,2,3", /finite number/],
];
const numericEntryPoints = [
  ["energy power", (value) => N.emissions({ ...energy, powerKw: value })],
  ["energy hours", (value) => N.emissions({ ...energy, hours: value })],
  ["energy factor", (value) => N.emissions({ ...energy, factor: value })],
  ["fuel amount", (value) => N.emissions({ ...fuelKg, fuelAmount: value })],
  ["fuel factor", (value) => N.emissions({ ...fuelKg, factor: value })],
  ["fuel density", (value) => N.emissions({ ...fuelVolume, densityKgM3: value })],
  ["measured mass", (value) => N.emissions({ ...measured, measuredKg: value })],
  ["SCR efficiency", (value) => N.emissions({ ...scr, scr: { ...scr.scr, efficiencyPercent: value } })],
  ["SCR fraction", (value) => N.emissions({ ...scr, scr: { ...scr.scr, activeFraction: value } })],
  ["rated power", (value) => N.assessment({ ...context, engines: [{ kind: "propulsion", ratedKw: value }] })],
  ["thermal input", (value) => N.assessment({ ...context, engines: [{ kind: "boiler", ratedKw: 0, thermalInputKw: value }] })],
  ["charge mass", (value) => N.charges(value, context)],
];
for (const [field, invoke] of numericEntryPoints) {
  // Empty string/undefined thermal input means an optional unknown thermal
  // configuration in this API, rather than a numeric claim; test that below.
  const optionalThermal = field === "thermal input";
  for (const [name, value, error] of invalidNumbers) {
    if (optionalThermal && (value === "" || value === undefined)) continue;
    test(`reject ${field}: ${name}`, () => rejects(() => invoke(value), error));
  }
}

test("missing optional thermal configuration stays unconfirmed", () => {
  // Inputs: boiler 0 kW rated, thermal input blank or absent, no completeness
  // confirmation. Hand: 0 propulsion <= 750; unknown thermal input cannot be
  // compared to 10000 kW. Expected unconfirmed, not outside or liable.
  // Range: optional unknown thermal input, 2026 scope; exact status/reason.
  for (const thermalInputKw of ["", undefined]) {
    const result = N.assessment({
      ...context,
      engines: [{ kind: "boiler", ratedKw: 0, thermalInputKw }],
    });
    equal(result.status, "unconfirmed", "missing thermal input");
    equal(result.reason, "thermal-configuration-unconfirmed", "reason");
  }
});

test("physical bounds reject zero density and excess SCR percentages", () => {
  // Inputs: m3 density 0 or 3000.01; SCR efficiency 100.01% or active 1.01.
  // Hand: 0 is not > 0; 3000.01 > 3000; 100.01 > 100; 1.01 > 1.
  // Range: each deliberately outside its documented domain. Expected throw;
  // no numerical result/tolerance. Zero density must not silently erase mass.
  for (const densityKgM3 of [0, 3000.01]) {
    rejects(() => N.emissions({ ...fuelVolume, densityKgM3 }), /outside the supported range/);
  }
  rejects(() => N.emissions({ ...scr, scr: { ...scr.scr, efficiencyPercent: 100.01 } }), /outside the supported range/);
  rejects(() => N.emissions({ ...scr, scr: { ...scr.scr, activeFraction: 1.01 } }), /outside the supported range/);
});

test("SCR cannot deduct from already treated emissions", () => {
  // Inputs: 36 kg energy result but outlet/unconfirmed factor position, or
  // 12.375 kg measured outlet mass with SCR enabled. Hand: an outlet mass
  // already includes removal; a second deduction has no valid untreated basis.
  // Range: intentionally invalid SCR evidence; expected throw, exact validation.
  for (const factorPosition of ["outlet", undefined]) {
    rejects(() => N.emissions({ ...scr, factorPosition }), /apply SCR twice|untreated inlet/);
  }
  rejects(() => N.emissions({ ...measured, scr: scr.scr }), /apply SCR twice/);
});

test("valid but unsupported dates have no rate and no invented charge", () => {
  // Inputs: 2016-12-31 and exactly 2027-01-01, 12.5 kg and explicit liability.
  // Hand: table covers [2017-01-01, 2027-01-01); both dates are outside it.
  // Without a rate, 12.5 kg has unknown cost, not 0 NOK. Expected null rate
  // and all costs null; exact comparisons, no numeric tolerance.
  for (const date of ["2016-12-31", "2027-01-01"]) {
    equal(N.ratesAt(date), null, "no rate outside table");
    const result = N.charges(12.5, { ...context, date, historicalAssessment });
    equal(result.governmentNok, null, "unknown government cost");
    equal(result.fundNok, null, "unknown Fund cost");
    equal(result.totalNok, null, "unknown total cost");
  }
});

test("invalid dates are rejected at every dated entry point", () => {
  // Inputs: blank, 2026-02-29 (not a leap year), 2026-02-30, month 13,
  // non-padded date, and a timestamp instead of a date. Hand: none represents
  // a valid YYYY-MM-DD calendar date. Range: deliberately invalid; expected
  // rejection by ratesAt/assessment/charges/calculate, exact (no tolerance).
  for (const date of ["", "2026-02-29", "2026-02-30", "2026-13-01", "2026-1-01", "2026-01-01T00:00:00Z"]) {
    rejects(() => N.ratesAt(date), /valid ISO calendar date/);
    rejects(() => N.assessment({ ...context, date }), /valid ISO calendar date/);
    rejects(() => N.charges(12.5, { ...context, date }), /valid ISO calendar date/);
    rejects(() => N.calculate([{ ...measured, date }], context), /valid ISO calendar date/);
  }
});

test("calculate accepts 200 rows and rejects empty or excessive row lists", () => {
  // Inputs: 200 measured rows of 0.125 kg at 2026-01-01, no Fund.
  // Hand: 200 x 0.125 = 25 kg; 25 x 26.94 = 673.5 NOK government/total.
  // Range: inclusive maximum 200 rows; 0 and 201 rows are invalid.
  // Tolerance: mass 1e-9 kg, money 1e-8 NOK; rejected counts exact.
  const rows = Array.from({ length: 200 }, () => ({
    ...measured, measuredKg: 0.125, date: "2026-01-01",
  }));
  const result = N.calculate(rows, context);
  close(result.kgNOx, 25, TOL.mass, "200-row mass");
  close(result.governmentNok, 673.5, TOL.money, "200-row government");
  close(result.fundNok, 0, TOL.money, "200-row Fund");
  close(result.totalNok, 673.5, TOL.money, "200-row total");
  rejects(() => N.calculate([], context), /between 1 and 200/);
  rejects(() => N.calculate([...rows, rows[0]], context), /between 1 and 200/);
});

console.log(JSON.stringify({
  status: "PASS",
  referenceCases: cases,
  assertions: checks,
  scope: "Hand-derived emissions, SCR, capacity thresholds, 2017-2026 source rates, dated charges, aggregates and invalid inputs",
}));
