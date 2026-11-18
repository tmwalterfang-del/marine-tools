// Independent hand-calculation references for the structured Education working
// of the core stability, cargo, electrical, controls, pump, energy and Doppler
// calculators (Claude, 2026-11-18). Same contract as
// students-calculator-working-reference-20261117.mjs (Codex).
// Sources: elementary hand arithmetic shown beside each case (mass = volume ×
// density, vertical moments about the keel, TPC = Aw ρ / 100, Pythagoras,
// Ohm's law, 120 f / p, linear 4–20 mA scaling, P-only control, NPSHa with
// g = 9.80665 m/s², steady adiabatic turbine work, 1 kJ/s = 1 kW and the
// classical acoustic Doppler relation fobs = fs (c + vo)/(c − vs)).
// Inputs are chosen so every quotient is exact or a short decimal.
// Valid scope: as stated in each calculator's range; no losses or corrections.
// All oracle numbers are literals: no calculator, formatter or executable
// engineering formula is used to generate an expected value.
import { catalogue } from './lib/students-catalogue.mjs';

// Relative error <= 1e-9 for every nonzero reference; zero must be exact.
const RELATIVE_TOLERANCE = 1e-9;
const references = [
  { id: 'displacement', unit: 't', finalKey: 'displacement_t', cases: [
    // 1000 m³ × 1.025 t/m³ = 1025 t.
    { inputs: { volume: 1000, density: 1.025 }, expected: [['displacement_t', 1025, 't']] },
    // Fresh water: 5000 × 1 = 5000 t.
    { inputs: { volume: 5000, density: 1 }, expected: [['displacement_t', 5000, 't']] },
  ] },
  { id: 'deadweight', unit: 't', finalKey: 'dwt_t', cases: [
    // 30000 − 10000 = 20000 t.
    { inputs: { dis: 30000, light: 10000 }, expected: [['dwt_t', 20000, 't']] },
    // Boundary: lightship equals displacement, DWT = 0.
    { inputs: { dis: 9000, light: 9000 }, expected: [['dwt_t', 0, 't']] },
  ] },
  { id: 'add-kg', unit: 'm', finalKey: 'kg_new_m', cases: [
    // M0 = 5000 × 4 = 20000; Mw = 1000 × 10 = 10000; Δ1 = 6000; KG1 = 30000/6000 = 5 m.
    { inputs: { dis: 5000, kg: 4, load: 1000, loadkg: 10 }, expected: [
      ['moment_initial_tm', 20000, 'tm'], ['moment_added_tm', 10000, 'tm'],
      ['displacement_new_t', 6000, 't'], ['kg_new_m', 5, 'm']] },
    // Nothing loaded: KG stays 7 m.
    { inputs: { dis: 8000, kg: 7, load: 0, loadkg: 12 }, expected: [
      ['moment_initial_tm', 56000, 'tm'], ['moment_added_tm', 0, 'tm'],
      ['displacement_new_t', 8000, 't'], ['kg_new_m', 7, 'm']] },
  ] },
  { id: 'discharge-kg', unit: 'm', finalKey: 'kg_new_m', cases: [
    // M0 = 50000; Mw = 2000 × 10 = 20000; Δ1 = 8000; KG1 = 30000/8000 = 3.75 m.
    { inputs: { dis: 10000, kg: 5, removed: 2000, remkg: 10 }, expected: [
      ['moment_initial_tm', 50000, 'tm'], ['moment_removed_tm', 20000, 'tm'],
      ['displacement_new_t', 8000, 't'], ['kg_new_m', 3.75, 'm']] },
    // Removing a low weight raises G: (24000 − 3000)/3000 = 7 m.
    { inputs: { dis: 4000, kg: 6, removed: 1000, remkg: 3 }, expected: [
      ['moment_initial_tm', 24000, 'tm'], ['moment_removed_tm', 3000, 'tm'],
      ['displacement_new_t', 3000, 't'], ['kg_new_m', 7, 'm']] },
  ] },
  { id: 'corrected-gm', unit: 'm', finalKey: 'gm_corrected_m', cases: [
    // GM = 8 − 6.5 = 1.5; GMcorr = 1.5 − 0.3 = 1.2 m.
    { inputs: { km: 8, kg: 6.5, fsc: 0.3 }, expected: [['gm_solid_m', 1.5, 'm'], ['gm_corrected_m', 1.2, 'm']] },
    // Boundary: KG = KM and no free surface, GM = 0 (warning, not invalid).
    { inputs: { km: 7, kg: 7, fsc: 0 }, expected: [['gm_solid_m', 0, 'm'], ['gm_corrected_m', 0, 'm']] },
  ] },
  { id: 'tpc', unit: 't/cm', finalKey: 'tpc_tcm', cases: [
    // 1500 × 1.025 = 1537.5 t/m; /100 = 15.375 t/cm.
    { inputs: { aw: 1500, rho: 1.025 }, expected: [['mass_per_metre_tm', 1537.5, 't/m'], ['tpc_tcm', 15.375, 't/cm']] },
    // 800 × 1 = 800 t/m; 8 t/cm.
    { inputs: { aw: 800, rho: 1 }, expected: [['mass_per_metre_tm', 800, 't/m'], ['tpc_tcm', 8, 't/cm']] },
  ] },
  { id: 'draft-change', unit: 'cm', finalKey: 'sinkage_cm', cases: [
    // 300 t / 15 t/cm = 20 cm.
    { inputs: { mass: 300, tpc: 15 }, expected: [['sinkage_cm', 20, 'cm']] },
    { inputs: { mass: 0, tpc: 12 }, expected: [['sinkage_cm', 0, 'cm']] },
  ] },
  { id: 'trim-change', unit: 'cm', finalKey: 'trim_cm', cases: [
    // 50 × 30 = 1500 tm; 1500/150 = 10 cm.
    { inputs: { weight: 50, distance: 30, mct: 150 }, expected: [['trimming_moment_tm', 1500, 'tm'], ['trim_cm', 10, 'cm']] },
    { inputs: { weight: 80, distance: 0, mct: 100 }, expected: [['trimming_moment_tm', 0, 'tm'], ['trim_cm', 0, 'cm']] },
  ] },
  { id: 'block-coefficient', unit: 'dimensionless', finalKey: 'cb', cases: [
    // Box 100 × 20 × 10 = 20000 m³; Cb = 12000/20000 = 0.6.
    { inputs: { vol: 12000, length: 100, breadth: 20, draft: 10 }, expected: [['box_volume_m3', 20000, 'm³'], ['cb', 0.6, 'dimensionless']] },
    // Upper bound: a box-shaped hull, Cb = 1.
    { inputs: { vol: 5000, length: 50, breadth: 10, draft: 10 }, expected: [['box_volume_m3', 5000, 'm³'], ['cb', 1, 'dimensionless']] },
  ] },
  { id: 'triangle', unit: 'm', finalKey: 'hypotenuse_m', cases: [
    // 5-12-13 triangle: 25 + 144 = 169; √169 = 13.
    { inputs: { a: 5, b: 12 }, expected: [['sum_squares_m2', 169, 'm²'], ['hypotenuse_m', 13, 'm']] },
    // Degenerate leg a = 0: c = b = 7.
    { inputs: { a: 0, b: 7 }, expected: [['sum_squares_m2', 49, 'm²'], ['hypotenuse_m', 7, 'm']] },
  ] },
  { id: 'ohms-law', unit: 'A', finalKey: 'current_A', cases: [
    { inputs: { voltage: 24, res: 8 }, expected: [['current_A', 3, 'A']] },
    { inputs: { voltage: 0, res: 10 }, expected: [['current_A', 0, 'A']] },
  ] },
  { id: 'dc-power', unit: 'W', finalKey: 'power_W', cases: [
    { inputs: { u: 12, i: 2.5 }, expected: [['power_W', 30, 'W']] },
    { inputs: { u: 440, i: 0 }, expected: [['power_W', 0, 'W']] },
  ] },
  { id: 'series-resistance', unit: 'Ω', finalKey: 'resistance_ohm', cases: [
    { inputs: { r1: 47, r2: 53 }, expected: [['resistance_ohm', 100, 'Ω']] },
    { inputs: { r1: 0.5, r2: 0.25 }, expected: [['resistance_ohm', 0.75, 'Ω']] },
  ] },
  { id: 'parallel-resistance', unit: 'Ω', finalKey: 'resistance_ohm', cases: [
    // 1/60 + 1/30 = 3/60 = 0.05 S; (60 × 30)/(90) = 20 Ω.
    { inputs: { r1: 60, r2: 30 }, expected: [['conductance_S', 0.05, 'S'], ['resistance_ohm', 20, 'Ω']] },
    // Equal branches halve: 0.04 S, 25 Ω.
    { inputs: { r1: 50, r2: 50 }, expected: [['conductance_S', 0.04, 'S'], ['resistance_ohm', 25, 'Ω']] },
  ] },
  { id: 'synchronous-speed', unit: 'rpm', finalKey: 'speed_rpm', cases: [
    // 2-pole 60 Hz: 2 × 60/2 = 60 r/s = 3600 rpm.
    { inputs: { freq: 60, poles: 2 }, expected: [['speed_rps', 60, 'r/s'], ['speed_rpm', 3600, 'rpm']] },
    // 6-pole 50 Hz: 100/6 = 16.666666666666668 r/s; 6000/6 = 1000 rpm.
    { inputs: { freq: 50, poles: 6 }, expected: [['speed_rps', 16.666666666666668, 'r/s'], ['speed_rpm', 1000, 'rpm']] },
  ] },
  { id: 'pump-time', unit: 'h', finalKey: 'time_h', cases: [
    { inputs: { vol: 200, flow: 80 }, expected: [['time_h', 2.5, 'h']] },
    { inputs: { vol: 0, flow: 30 }, expected: [['time_h', 0, 'h']] },
  ] },
  { id: 'battery-runtime', unit: 'h', finalKey: 'runtime_h', cases: [
    // 500 × 0.5 × 1 = 250 kWh; 250/50 = 5 h.
    { inputs: { cap: 500, dod: 0.5, eta: 1, load: 50 }, expected: [['usable_energy_kWh', 250, 'kWh'], ['runtime_h', 5, 'h']] },
    // No permitted depth of discharge: 0 kWh, 0 h.
    { inputs: { cap: 1000, dod: 0, eta: 0.9, load: 200 }, expected: [['usable_energy_kWh', 0, 'kWh'], ['runtime_h', 0, 'h']] },
  ] },
  { id: 'fuel-density', unit: 't', finalKey: 'mass_t', cases: [
    { inputs: { vol: 20, rho: 0.9 }, expected: [['mass_t', 18, 't']] },
    { inputs: { vol: 0, rho: 0.99 }, expected: [['mass_t', 0, 't']] },
  ] },
  { id: 'loop-scaling', unit: 'EU', finalKey: 'pv_EU', cases: [
    // 8 mA on 0–10: (8 − 4)/16 = 0.25; PV = 0 + 0.25 × 10 = 2.5.
    { inputs: { ma: 8, low: 0, high: 10 }, expected: [['span_EU', 10, 'EU'], ['fraction', 0.25, 'dimensionless'], ['pv_EU', 2.5, 'EU']] },
    // Top of range, live zero below 0: span 200, fraction 1, PV = −50 + 200 = 150.
    { inputs: { ma: 20, low: -50, high: 150 }, expected: [['span_EU', 200, 'EU'], ['fraction', 1, 'dimensionless'], ['pv_EU', 150, 'EU']] },
  ] },
  { id: 'loop-current', unit: 'mA', finalKey: 'current_mA', cases: [
    // 2.5 on 0–10: fraction 0.25; I = 4 + 4 = 8 mA.
    { inputs: { value: 2.5, low: 0, high: 10 }, expected: [['fraction', 0.25, 'dimensionless'], ['current_mA', 8, 'mA']] },
    // At LRV: fraction 0; I = 4 mA.
    { inputs: { value: -50, low: -50, high: 150 }, expected: [['fraction', 0, 'dimensionless'], ['current_mA', 4, 'mA']] },
  ] },
  { id: 'p-controller', unit: '%', finalKey: 'output_pct', cases: [
    // e = 60 − 55 = 5; u = 40 + 3 × 5 = 55 %.
    { inputs: { sp: 60, pv: 55, kp: 3, bias: 40 }, expected: [['error_EU', 5, 'EU'], ['output_pct', 55, '%']] },
    // Zero error: u = bias = 30 %.
    { inputs: { sp: 20, pv: 20, kp: 4, bias: 30 }, expected: [['error_EU', 0, 'EU'], ['output_pct', 30, '%']] },
  ] },
  { id: 'prop-band', unit: '%', finalKey: 'pb_pct', cases: [
    { inputs: { kp: 4 }, expected: [['pb_pct', 25, '%']] },
    { inputs: { kp: 0.5 }, expected: [['pb_pct', 200, '%']] },
  ] },
  { id: 'npsha', unit: 'm', finalKey: 'npsha_m', cases: [
    // ρg = 1000 × 9.80665 = 9806.65 N/m³. p_s − p_v = 100 − 1.9335 = 98.0665 kPa
    // = 98066.5 Pa = 10 × 9806.65, so the pressure head is 10 m; 10 + 3 − 1 = 12 m.
    { inputs: { surface: 100, vapour: 1.9335, rho: 1000, level: 3, loss: 1 }, expected: [['pressure_head_m', 10, 'm'], ['npsha_m', 12, 'm']] },
    // 50 − 0.96675 = 49.03325 kPa = 5 × 9806.65 Pa → 5 m; liquid 2 m below the pump: 5 − 2 − 0.5 = 2.5 m.
    { inputs: { surface: 50, vapour: 0.96675, rho: 1000, level: -2, loss: 0.5 }, expected: [['pressure_head_m', 5, 'm'], ['npsha_m', 2.5, 'm']] },
  ] },
  { id: 'turbine-drop', unit: 'kJ/kg', finalKey: 'work_kJkg', cases: [
    { inputs: { inlet: 3000, outlet: 2250 }, expected: [['work_kJkg', 750, 'kJ/kg']] },
    { inputs: { inlet: 2800.5, outlet: 2800 }, expected: [['work_kJkg', 0.5, 'kJ/kg']] },
  ] },
  { id: 'fuel-input-power', unit: 'kW', finalKey: 'power_kW', cases: [
    // 360 kg/h = 0.1 kg/s; 0.1 × 42700 kJ/kg = 4270 kJ/s = 4270 kW.
    { inputs: { flow: 360, lhv: 42700 }, expected: [['flow_kgs', 0.1, 'kg/s'], ['power_kW', 4270, 'kW']] },
    { inputs: { flow: 0, lhv: 40000 }, expected: [['flow_kgs', 0, 'kg/s'], ['power_kW', 0, 'kW']] },
  ] },
  { id: 'classical-doppler', unit: 'Hz', finalKey: 'fobs_Hz', cases: [
    // Observer approaches at 34 m/s: 500 × 374/340 = 500 × 1.1 = 550 Hz.
    { inputs: { fs: 500, c: 340, vo: 34, vs: 0 }, expected: [['observer_speed_ms', 374, 'm/s'], ['source_speed_ms', 340, 'm/s'], ['fobs_Hz', 550, 'Hz']] },
    // Both move the same way at 15 m/s in water: 1485/1485, no shift: 1000 Hz.
    { inputs: { fs: 1000, c: 1500, vo: -15, vs: 15 }, expected: [['observer_speed_ms', 1485, 'm/s'], ['source_speed_ms', 1485, 'm/s'], ['fobs_Hz', 1000, 'Hz']] },
  ] },
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
          // A dimensionless value is shown without a unit word ("Cb = … = 0.6").
          const shownUnit = step.unit === 'dimensionless' ? '' : ` ${step.unit}`;
          check(nonempty(step.expr) && rendered.startsWith(`${step.expr} = `)
            && nonempty(step.unit) && rendered.endsWith(shownUnit)
            && nonempty(rendered.slice(step.expr.length + 3, rendered.length - shownUnit.length)),
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
