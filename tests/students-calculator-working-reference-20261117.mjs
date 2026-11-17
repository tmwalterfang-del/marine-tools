// Independent hand-calculation references for the structured Education working.
// Sources: the dimensional hand calculations beside each case, using the
// balanced RMS power triangle, gravitational energy per unit mass, elapsed
// voyage time, sensible heat, work per shaft revolution and fuel mass per kWh.
// Constants/conversions: sqrt(3) = 1.7320508075688772935,
// pi = 3.1415926535897932385, standard gravity = 9.80665 m/s²,
// 1 h = 3600 s, 1 d = 24 h, 1 kWh = 3600 kJ, 1 kW = 1000 W,
// 1 kg = 1000 g and 1 kn = 1 NM/h.
// Valid scope: finite positive voltage, density, flow, head, speed, mass,
// specific heat, rpm and output power; nonnegative current, distance, daily
// fuel, temperature rise, torque and fuel flow; 0 <= power factor <= 1.
// These ideal, steady examples do not include losses, reserve or phase change.
// All oracle numbers are literals: no calculator, formatter or executable
// engineering formula is used to generate an expected value.
import { catalogue } from './lib/students-catalogue.mjs';

// Relative error <= 1e-9 for every nonzero reference; zero must be exact.
const RELATIVE_TOLERANCE = 1e-9;
const references = [
  {
    id: 'three-phase', unit: 'kW', finalKey: 'active_kW',
    cases: [
      // 200 V * 10 A = 2 kVA before the three-phase factor.
      // S = 2 sqrt(3) = 3.4641016151377546 kVA. A 3:4:5 power
      // triangle (pf = 3/5) gives P = 2.0784609690826528 kW and
      // Q = 2.7712812921102037 kvar.
      { inputs: { u: 200, i: 10, pf: 0.6 }, expected: [
        ['apparent_kVA', 3.4641016151377546, 'kVA'],
        ['reactive_kvar', 2.7712812921102037, 'kvar'],
        ['active_kW', 2.0784609690826528, 'kW'],
      ] },
      // 230 * 12.5 = 2875 VA; S = 2.875 sqrt(3) =
      // 4.979646071760522 kVA. Unity pf means P = S and Q = 0.
      { inputs: { u: 230, i: 12.5, pf: 1 }, expected: [
        ['apparent_kVA', 4.979646071760522, 'kVA'],
        ['reactive_kvar', 0, 'kvar'],
        ['active_kW', 4.979646071760522, 'kW'],
      ] },
      // 690 * 80 = 55200 VA; S = 55.2 sqrt(3) =
      // 95.60920457780203 kVA. Zero pf means P = 0 and Q = S.
      { inputs: { u: 690, i: 80, pf: 0 }, expected: [
        ['apparent_kVA', 95.60920457780203, 'kVA'],
        ['reactive_kvar', 95.60920457780203, 'kvar'],
        ['active_kW', 0, 'kW'],
      ] },
    ],
  },
  {
    id: 'hydraulic-power', unit: 'kW', finalKey: 'power_kW',
    cases: [
      // 72/3600 = 0.02 m³/s, hence 20 kg/s at 1000 kg/m³.
      // Raising each kg by 10 m needs 98.0665 J:
      // 20 * 98.0665 = 1961.33 W = 1.96133 kW.
      { inputs: { rho: 1000, flow: 72, head: 10 }, expected: [
        ['flow_m3s', 0.02, 'm³/s'],
        ['power_W', 1961.33, 'W'],
        ['power_kW', 1.96133, 'kW'],
      ] },
      // 18/3600 = 0.005 m³/s; 1025 * 0.005 = 5.125 kg/s.
      // 9.80665 * 12.5 = 122.583125 J/kg; multiplying by 5.125
      // gives 628.238515625 W = 0.628238515625 kW.
      { inputs: { rho: 1025, flow: 18, head: 12.5 }, expected: [
        ['flow_m3s', 0.005, 'm³/s'],
        ['power_W', 628.238515625, 'W'],
        ['power_kW', 0.628238515625, 'kW'],
      ] },
      // 144/3600 = 0.04 m³/s; 850 * 0.04 = 34 kg/s.
      // 30 m needs 294.1995 J/kg; 34 * 294.1995 =
      // 10002.783 W = 10.002783 kW.
      { inputs: { rho: 850, flow: 144, head: 30 }, expected: [
        ['flow_m3s', 0.04, 'm³/s'],
        ['power_W', 10002.783, 'W'],
        ['power_kW', 10.002783, 'kW'],
      ] },
    ],
  },
  {
    id: 'voyage-fuel', unit: 'm³', finalKey: 'fuel_m3',
    cases: [
      // 480/10 = 48 h; 48/24 = 2 d; 2 * 15 = 30 m³.
      { inputs: { dist: 480, speed: 10, daily: 15 }, expected: [
        ['sea_time_h', 48, 'h'],
        ['sea_time_d', 2, 'd'],
        ['fuel_m3', 30, 'm³'],
      ] },
      // 135/7.5 = 18 h; 18/24 = 0.75 d; 0.75 * 8.4 = 6.3 m³.
      { inputs: { dist: 135, speed: 7.5, daily: 8.4 }, expected: [
        ['sea_time_h', 18, 'h'],
        ['sea_time_d', 0.75, 'd'],
        ['fuel_m3', 6.3, 'm³'],
      ] },
      // 100/8 = 12.5 h; 12.5/24 = 25/48 = 0.5208333333333333 d.
      // 9.6 * 25/48 = 240/48 = 5 m³.
      { inputs: { dist: 100, speed: 8, daily: 9.6 }, expected: [
        ['sea_time_h', 12.5, 'h'],
        ['sea_time_d', 0.5208333333333333, 'd'],
        ['fuel_m3', 5, 'm³'],
      ] },
    ],
  },
  {
    id: 'heat-energy', unit: 'kWh', finalKey: 'heat_kWh',
    cases: [
      // 360 * 2 = 720 kJ/K; 720 * 10 = 7200 kJ;
      // 7200/3600 = 2 kWh.
      { inputs: { m: 360, cp: 2, dt: 10 }, expected: [
        ['heat_kJ', 7200, 'kJ'],
        ['heat_kWh', 2, 'kWh'],
      ] },
      // 12.5 * 4.18 = 52.25 kJ/K; 52.25 * 8 = 418 kJ;
      // 418/3600 = 209/1800 = 0.11611111111111111 kWh.
      { inputs: { m: 12.5, cp: 4.18, dt: 8 }, expected: [
        ['heat_kJ', 418, 'kJ'],
        ['heat_kWh', 0.11611111111111111, 'kWh'],
      ] },
      // 80 * 0.9 = 72 kJ/K; 72 * 25 = 1800 kJ;
      // 1800/3600 = 0.5 kWh.
      { inputs: { m: 80, cp: 0.9, dt: 25 }, expected: [
        ['heat_kJ', 1800, 'kJ'],
        ['heat_kWh', 0.5, 'kWh'],
      ] },
    ],
  },
  {
    id: 'shaft-power', unit: 'kW', finalKey: 'power_kW',
    cases: [
      // 600 rpm = 10 rev/s; each turn is 2 pi rad, giving
      // 20 pi = 62.831853071795865 rad/s. Each turn at 20 N·m
      // transfers 40 pi J; ten turns/s give 400 pi =
      // 1256.6370614359173 W = 1.2566370614359173 kW.
      { inputs: { rpm: 600, torque: 20 }, expected: [
        ['omega_rads', 62.831853071795865, 'rad/s'],
        ['power_W', 1256.6370614359173, 'W'],
        ['power_kW', 1.2566370614359173, 'kW'],
      ] },
      // 75 rpm = 1.25 rev/s; 2.5 pi = 7.853981633974483 rad/s.
      // Each turn at 32 N·m transfers 64 pi J; 1.25 turns/s
      // give 80 pi = 251.32741228718346 W = 0.25132741228718347 kW.
      { inputs: { rpm: 75, torque: 32 }, expected: [
        ['omega_rads', 7.853981633974483, 'rad/s'],
        ['power_W', 251.32741228718346, 'W'],
        ['power_kW', 0.25132741228718347, 'kW'],
      ] },
      // 123.75 rpm = 2.0625 rev/s; 4.125 pi =
      // 12.959069696057897 rad/s. Each turn at 12.8 N·m transfers
      // 25.6 pi J; 2.0625 turns/s give 52.8 pi =
      // 165.8760921095411 W = 0.1658760921095411 kW.
      { inputs: { rpm: 123.75, torque: 12.8 }, expected: [
        ['omega_rads', 12.959069696057897, 'rad/s'],
        ['power_W', 165.8760921095411, 'W'],
        ['power_kW', 0.1658760921095411, 'kW'],
      ] },
    ],
  },
  {
    id: 'sfoc', unit: 'g/kWh', finalKey: 'sfoc_gkWh',
    cases: [
      // One hour uses 12 kg = 12000 g while producing 60 kWh;
      // 12000/60 = 200 g/kWh.
      { inputs: { fuel: 12, power: 60 }, expected: [
        ['fuel_gh', 12000, 'g/h'],
        ['sfoc_gkWh', 200, 'g/kWh'],
      ] },
      // One hour uses 2.75 kg = 2750 g and produces 12.5 kWh;
      // 2750/12.5 = 220 g/kWh.
      { inputs: { fuel: 2.75, power: 12.5 }, expected: [
        ['fuel_gh', 2750, 'g/h'],
        ['sfoc_gkWh', 220, 'g/kWh'],
      ] },
      // One hour uses 7 kg = 7000 g and produces 48 kWh;
      // 7000/48 = 875/6 = 145.83333333333333 g/kWh.
      { inputs: { fuel: 7, power: 48 }, expected: [
        ['fuel_gh', 7000, 'g/h'],
        ['sfoc_gkWh', 145.83333333333333, 'g/kWh'],
      ] },
    ],
  },
];

let checks = 0, cases = 0;
const failures = [];
function check(condition, label) {
  checks++;
  if (!condition) failures.push(label);
}
function near(actual, expected, label) {
  check(Number.isFinite(actual) && (expected === 0
    ? actual === 0
    : Math.abs(actual - expected) <= RELATIVE_TOLERANCE * Math.abs(expected)),
  `${label}: expected ${expected}, got ${String(actual)} (relative tolerance ${RELATIVE_TOLERANCE}; exact zero)`);
}
function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

try {
  const window = catalogue();
  check(Array.isArray(window.MT_CALCULATORS), 'MT_CALCULATORS is an array');
  const definitions = Array.isArray(window.MT_CALCULATORS) ? window.MT_CALCULATORS : [];
  for (const reference of references) {
    const matches = definitions.filter(calculator => calculator.id === reference.id);
    check(matches.length === 1, `${reference.id}: exactly one calculator definition`);
    const calculator = matches[0];
    check(Array.isArray(calculator?.assumptions) && calculator.assumptions.length > 0,
      `${reference.id}: assumptions is a non-empty array`);
    check(Array.isArray(calculator?.assumptions) && calculator.assumptions.every(nonempty),
      `${reference.id}: every assumption is a non-empty string`);
    check(nonempty(calculator?.range), `${reference.id}: range is a non-empty string`);

    for (const [index, fixture] of reference.cases.entries()) {
      cases++;
      const label = `${reference.id} case ${index + 1} ${JSON.stringify(fixture.inputs)}`;
      // Protect the hand-authored fixtures from becoming default-input smoke tests.
      check(Array.isArray(calculator?.fields) && calculator.fields.some(field =>
        Object.hasOwn(fixture.inputs, field.key) && fixture.inputs[field.key] !== field.initial),
      `${label}: uses non-default inputs`);
      let result;
      try {
        result = calculator.compute({ ...fixture.inputs });
        check(result !== null && typeof result === 'object' && !Array.isArray(result),
          `${label}: compute returns an object`);
      } catch (error) {
        check(false, `${label}: compute threw ${error.message}`);
        continue;
      }
      check(!result?.invalid, `${label}: valid reference inputs are accepted`);
      check(result?.unit === reference.unit, `${label}: result unit is ${reference.unit}`);
      const finalReference = fixture.expected.find(([key]) => key === reference.finalKey);
      near(result?.value, finalReference[1], `${label}: result value against literal reference`);
      check(Array.isArray(result?.steps) && result.steps.length > 0,
        `${label}: steps is a non-empty array`);
      const steps = Array.isArray(result?.steps) ? result.steps : [];
      const keyedSteps = [];
      for (const [stepIndex, step] of steps.entries()) {
        if (typeof step === 'string') {
          check(nonempty(step), `${label}: formula line ${stepIndex + 1} is non-empty`);
          continue;
        }
        const structured = step !== null && typeof step === 'object' && !Array.isArray(step);
        check(structured, `${label}: step ${stepIndex + 1} is a string or structured object`);
        if (!structured) continue;
        keyedSteps.push(step);
        check(nonempty(step.key), `${label}: step ${stepIndex + 1} has a non-empty key`);
        check(nonempty(step.expr), `${label}: ${String(step.key)} has a non-empty expression`);
        check(fixture.expected.some(([key]) => key === step.key),
          `${label}: recognized structured key ${String(step.key)}`);
        try {
          const rendered = String(step);
          check(nonempty(step.expr) && rendered.includes(step.expr),
            `${label}: String(${String(step.key)}) contains its expression`);
          check(nonempty(step.expr) && rendered.startsWith(`${step.expr} = `)
            && nonempty(step.unit) && rendered.endsWith(` ${step.unit}`)
            && nonempty(rendered.slice(step.expr.length + 3, -step.unit.length - 1)),
          `${label}: String(${String(step.key)}) has expression = value unit shape`);
        } catch (error) {
          check(false, `${label}: String(${String(step.key)}) threw ${error.message}`);
        }
      }
      check(keyedSteps.length === fixture.expected.length,
        `${label}: expected ${fixture.expected.length} keyed steps, got ${keyedSteps.length}`);
      check(new Set(keyedSteps.map(step => step.key)).size === keyedSteps.length,
        `${label}: structured step keys are unique`);
      for (const [key, expected, unit] of fixture.expected) {
        const matches = keyedSteps.filter(step => step.key === key);
        check(matches.length === 1, `${label}: exactly one ${key} step`);
        near(matches[0]?.value, expected, `${label}: ${key} against literal reference`);
        check(matches[0]?.unit === unit, `${label}: ${key} unit is ${unit}`);
      }
      // Reactive power is an intermediate for this contract: the final
      // three-phase keyed step must be active_kW, the calculator's result.
      const finalStep = keyedSteps.at(-1);
      check(finalStep?.key === reference.finalKey,
        `${label}: final keyed step is ${reference.finalKey}`);
      check(Number.isFinite(finalStep?.value) && finalStep.value === result?.value,
        `${label}: final keyed step equals result.value without display rounding`);
    }
  }
} catch (error) {
  check(false, `Catalogue/reference execution failed: ${error.stack || error.message}`);
}

for (const failure of failures) console.error(`FAIL: ${failure}`);
console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : 'PASS',
  calculators: references.length,
  cases,
  checks,
}));
if (failures.length) process.exitCode = 1;
