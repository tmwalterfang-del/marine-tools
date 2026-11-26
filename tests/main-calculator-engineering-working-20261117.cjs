// Independent literal hand references through the real app.js DOM handlers.
// Run with jsdom@26.1.0 on NODE_PATH. No extracted or replaced handlers.
// References, tolerances and valid ranges are documented beside each case.
// This checks DOM/exports, not layout, translations, devices or operational use.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let dom;

(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://engineering-working.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tasks = [], errors = [], results = new Map(), downloads = [];
  if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
  w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
  w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
  w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
  w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.navigator, 'onLine', { value: false });
  w.fetch = async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' });
  w.Blob = Blob;
  w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:test-' + downloads.length; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['engineering', 'electrical']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0, 'Short UI tasks settled');
  }
  await flush();
  let handlerRuns = 0, numericReferences = 0, invalidRuns = 0, workingRuns = 0;
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const box = result => d.querySelector(`.calc-work[data-for="${result}"]`);
  function fields(values) {
    for (const [id, value] of Object.entries(values)) {
      const node = el(id); node.value = String(value);
      node.dispatchEvent(new w.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }
  }
  function near(actual, expected, tolerance, label) {
    numericReferences++;
    assert(Number.isFinite(actual), label + ': finite value required');
    assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} +/- ${tolerance}`);
  }
  function click(button, result, valid = true) {
    results.delete(result); el(button).click(); handlerRuns++;
    assert.equal(results.get(result), valid, `${button}: ${el(result).textContent}`);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/);
    if (!valid) { invalidRuns++; assert.equal(box(result), null, 'Invalid result clears old working'); }
    return el(result).querySelector('strong').textContent;
  }
  async function download(result, type) {
    const before = downloads.length; box(result).querySelector('.calc-work-' + type).click();
    assert.equal(downloads.length, before + 1, result + ': enabled download');
    return downloads.at(-1).text();
  }
  const record = async result => JSON.parse(await download(result, 'json'));
  // Each tuple is [label, literal substituted expression, literal hand value,
  // plain unit, display tolerance]. Raw JSON/CSV tolerance is 1e-10 by default;
  // display tolerance is half of the last displayed place plus 0.000001.
  async function working(result, tool, expectedInputs, expectedOutputs, references) {
    workingRuns++;
    assert.equal(d.querySelectorAll(`.calc-work[data-for="${result}"]`).length, 1);
    const rows = [...box(result).querySelectorAll('.calc-work-steps > li')];
    assert.equal(rows.length, references.length, result + ': every step has an independent reference');
    const r = await record(result), csv = await download(result, 'csv');
    assert.equal(r.tool, tool); assert.deepEqual(r.inputs, expectedInputs);
    assert.deepEqual(Object.keys(r.outputs).sort(), Object.keys(expectedOutputs).sort());
    for (const [name, [value, unit]] of Object.entries(expectedOutputs)) {
      near(r.outputs[name].value, value, 1e-10, result + ': output ' + name);
      assert.equal(r.outputs[name].unit, unit);
      assert(csv.includes(`,output,${name},${r.outputs[name].value},${unit}`), 'CSV preserves full machine-format value: ' + name);
    }
    assert.equal(r.steps.length, references.length);
    rows.forEach((row, i) => {
      const [label, expr, value, unit, tolerance = 0.000501] = references[i];
      assert.equal(row.querySelector('span').textContent, label);
      const parts = row.querySelector('code').textContent.split(' = ');
      assert.equal(parts.length, 2); assert.equal(parts[0], expr, result + ': substituted expression');
      const match = parts[1].match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?: (.*))?$/i);
      assert(match, result + ': numeric step RHS'); assert.equal(match[2] || '', unit);
      near(Number(match[1]), value, tolerance, result + ': displayed ' + label);
      assert.equal(r.steps[i].label, label); assert.equal(r.steps[i].unit, unit);
      near(r.steps[i].value, value, 1e-10, result + ': raw ' + label);
    });
    assert(r.validity.length > 0, result + ': honest assumptions are present');
    assert.deepEqual([...box(result).querySelectorAll('.calc-work-validity li')].map(li => li.textContent), r.validity);
    return r;
  }

  // Hydraulic hand reference: 180 bar * 100000 Pa/bar * 80 L/min
  // * 0.001 m3/L / 60 s/min = 24000 W = 24 kW. At 80% overall
  // efficiency: 24 / 0.8 = 30 kW input. Valid p,q >= 0; 0 < eta <= 100%.
  const hyd = { hydP: '180,0', hydQ: '80,0', hydMode: 'hyd', hydEff: '' };
  const hydInputs = { pressureDifference: { value: 180, unit: 'bar' }, flow: { value: 80, unit: 'L/min' } };
  const hydSteps = [['Hydraulic power', '180.000 × 80.000 / 600', 24, 'kW']];
  fields(hyd); assert.equal(click('calcHyd', 'resHyd'), '24.00 kW hydraulic');
  await working('resHyd', 'hydraulic-power', hydInputs, { hydraulicPower: [24, 'kW'] }, hydSteps);
  fields({ hydMode: 'input', hydEff: '80,0' });
  assert.equal(click('calcHyd', 'resHyd'), '24.00 kW hydraulic · 30.00 kW estimated input');
  const hydInputRecord = await working('resHyd', 'hydraulic-power', { ...hydInputs, efficiency: { value: 80, unit: '%' } }, { hydraulicPower: [24, 'kW'], estimatedInputPower: [30, 'kW'] }, [...hydSteps, ['Estimated input power', '24.000 / (80.000 / 100)', 30, 'kW']]);
  assert.match(hydInputRecord.validity.join(' '), /pressure difference.*overall efficiency/);
  // Non-terminating division: 24 / 0.85 = 480/17 = 28.235294117647058.
  fields({ hydEff: 85 }); click('calcHyd', 'resHyd');
  await working('resHyd', 'hydraulic-power', { ...hydInputs, efficiency: { value: 85, unit: '%' } }, { hydraulicPower: [24, 'kW'], estimatedInputPower: [28.235294117647058, 'kW'] }, [...hydSteps, ['Estimated input power', '24.000 / (85.000 / 100)', 28.235294117647058, 'kW']]);

  // Pump hand reference: RPM ratio = 1200/1500 = 0.8; Q2 = 50*0.8
  // = 40 m3/h; H2 = 30*0.64 = 19.2 m; W2 = 8*0.512 = 4.096 kW.
  // Range: positive RPM; nonnegative Q,H,W; same impeller/fluid and
  // approximately constant efficiency. No assertion about the actual duty point.
  const pump = { pumpN1: 1500, pumpN2: 1200, pumpQ1: 50, pumpH1: 30, pumpW1: 8 };
  const pumpInputs = { currentSpeed: { value: 1500, unit: 'RPM' }, newSpeed: { value: 1200, unit: 'RPM' }, currentFlow: { value: 50, unit: 'm³/h' }, currentHead: { value: 30, unit: 'm' }, currentPower: { value: 8, unit: 'kW' } };
  const pumpOutputs = { speedRatio: [0.8, ''], estimatedFlow: [40, 'm³/h'], estimatedHead: [19.2, 'm'], estimatedPower: [4.096, 'kW'] };
  const pumpSteps = [['Speed ratio', '1200.000 / 1500.000', 0.8, '', 0.000000501], ['Estimated flow', '50.000 × 0.800000', 40, 'm³/h'], ['Estimated head', '30.000 × 0.800000²', 19.2, 'm'], ['Estimated pump power', '8.000 × 0.800000³', 4.096, 'kW']];
  fields(pump); assert.equal(click('calcAffinity', 'resAffinity'), '40.0 m³/h · 19.2 m head · 4.10 kW');
  const pumpRecord = await working('resAffinity', 'pump-speed-change', pumpInputs, pumpOutputs, pumpSteps);
  assert.match(pumpRecord.validity.join(' '), /same impeller.*system curves.*cavitation/);

  // Battery hand reference: 80-20=60 percentage points; 500*60/100
  // = 300 kWh in SOC window; 300*0.9=270 kWh usable; 270/100=2.7 h
  // = 2 h 42 min. Range: kWh/load > 0, 0 <= min <= SOC <= 100,
  // 0 < eta <= 100%, constant load/efficiency. Raw tolerance 1e-10.
  const battery = { batKwh: 500, batSoc: 80, batMin: 20, batLoad: 100, batEff: '90,0' };
  const batteryInputs = { nominalEnergy: { value: 500, unit: 'kWh' }, currentSOC: { value: 80, unit: '%' }, minimumSOC: { value: 20, unit: '%' }, load: { value: 100, unit: 'kW' }, usableEfficiency: { value: 90, unit: '%' } };
  const batteryOutputs = { socWindow: [60, '%'], usableEnergy: [270, 'kWh'], runtime: [2.7, 'h'] };
  const batterySteps = [['SOC window', '80.000 − 20.000', 60, '%'], ['Usable energy', '500.000 × (80.000 − 20.000) / 100 × (90.000 / 100)', 270, 'kWh'], ['Runtime', '270.000 / 100.000', 2.7, 'h']];
  fields(battery); assert.equal(click('calcBat', 'resBat'), '270.0 kWh usable · 2 h 42 min');
  const batteryRecord = await working('resBat', 'battery-runtime', batteryInputs, batteryOutputs, batterySteps);
  assert.match(batteryRecord.validity.join(' '), /constant load.*ageing.*cutoffs/);

  // Motor hand reference: shaft output 72 kW / 0.9 = 80 kW input.
  // I = 80000/(sqrt(3)*400*0.8) = 250/sqrt(3)
  // = 144.33756729740644 A (sqrt(3) = 1.7320508075688772935).
  // Range: output >= 0, line V > 0, 0 < PF,eta <= 1; balanced steady load.
  const motor = { motKw: 72, motV: 400, motPf: '0,8', motEff: 90 };
  const motorInputs = { outputPower: { value: 72, unit: 'kW' }, lineVoltage: { value: 400, unit: 'V' }, powerFactor: { value: 0.8, unit: '' }, efficiency: { value: 90, unit: '%' } };
  const motorOutputs = { electricalInputPower: [80, 'kW'], runningCurrent: [144.33756729740644, 'A'] };
  const motorSteps = [['Estimated electrical input power', '72.000 / 0.900000', 80, 'kW'], ['Estimated running current', '72.000 × 1000 / (√3 × 400.000 × 0.800000 × 0.900000)', 144.33756729740644, 'A']];
  fields(motor); assert.equal(click('calcMotor', 'resMotor'), '144.3 A estimated running current');
  const motorRecord = await working('resMotor', 'motor-current', motorInputs, motorOutputs, motorSteps);
  assert.match(motorRecord.validity.join(' '), /balanced.*line-to-line.*Starting current/);

  // Voltage-drop hand reference: one-way 100/1000 = 0.1 km;
  // drop = sqrt(3)*100*0.5*0.1 = 5*sqrt(3) = 8.660254037844386 V;
  // drop/400*100 = 2.1650635094610964%. Range: I,L,R >= 0, V > 0;
  // balanced resistive estimate at unity PF, no reactance/temperature correction.
  const voltage = { vdA: 100, vdL: 100, vdR: '0,5', vdV: 400 };
  const voltageInputs = { current: { value: 100, unit: 'A' }, oneWayLength: { value: 100, unit: 'm' }, conductorResistance: { value: 0.5, unit: 'Ω/km' }, systemVoltage: { value: 400, unit: 'V' } };
  const voltageOutputs = { voltageDrop: [8.660254037844386, 'V'], voltageDropPercent: [2.1650635094610964, '%'] };
  const voltageSteps = [['One-way length in kilometres', '100.000 / 1000', 0.1, 'km', 0.000000501], ['Voltage drop', '√3 × 100.000 × 0.500000 × 0.100000', 8.660254037844386, 'V'], ['Voltage drop percentage', '8.660254 / 400.000 × 100', 2.1650635094610964, '%']];
  fields(voltage); assert.equal(click('calcVD', 'resVD'), '8.66 V · 2.17%');
  assert(el('resVD').classList.contains('ok'));
  const voltageRecord = await working('resVD', 'voltage-drop', voltageInputs, voltageOutputs, voltageSteps);
  assert.match(voltageRecord.validity.join(' '), /unity power factor.*one-way.*reactance.*5%.*display aid/);

  // Power-factor hand reference independent of acos/tan implementation:
  // right triangle PF=3/5 gives Q/P=4/3; PF=4/5 gives Q/P=3/4.
  // At P=120 kW: Qnow=160 kVAr, Qtarget=90 kVAr; capacitor=70 kVAr.
  // Range: P >= 0; 0 < PFnow < PFtarget <= 1; constant lagging active load.
  const correction = { pfKw: 120, pfNow: '0,6', pfTarget: '0,8' };
  const correctionInputs = { activePower: { value: 120, unit: 'kW' }, presentPowerFactor: { value: 0.6, unit: '' }, targetPowerFactor: { value: 0.8, unit: '' } };
  const correctionOutputs = { presentReactivePower: [160, 'kVAr'], targetReactivePower: [90, 'kVAr'], capacitorReactivePower: [70, 'kVAr'] };
  const correctionSteps = [['Present reactive power', '120.000 × tan(acos(0.600000))', 160, 'kVAr'], ['Target reactive power', '120.000 × tan(acos(0.800000))', 90, 'kVAr'], ['Capacitor reactive power', '120.000 × (tan(acos(0.600000)) − tan(acos(0.800000)))', 70, 'kVAr']];
  fields(correction); assert.equal(click('calcPfCorr', 'resPfCorr'), '70.0 kVAr correction');
  const correctionRecord = await working('resPfCorr', 'power-factor-correction', correctionInputs, correctionOutputs, correctionSteps);
  assert.match(correctionRecord.validity.join(' '), /lagging load.*constant active power.*harmonics.*resonance/);
  // Unity target is allowed: Qtarget=0; 160-0=160 kVAr.
  fields({ pfTarget: 1 }); click('calcPfCorr', 'resPfCorr');
  await working('resPfCorr', 'power-factor-correction', { ...correctionInputs, targetPowerFactor: { value: 1, unit: '' } }, { presentReactivePower: [160, 'kVAr'], targetReactivePower: [0, 'kVAr'], capacitorReactivePower: [160, 'kVAr'] }, [['Present reactive power', '120.000 × tan(acos(0.600000))', 160, 'kVAr'], ['Target reactive power', '120.000 × tan(acos(1.000000))', 0, 'kVAr'], ['Capacitor reactive power', '120.000 × (tan(acos(0.600000)) − tan(acos(1.000000)))', 160, 'kVAr']]);

  // Legitimate zeros: multiplication by zero yields zero power/current/drop;
  // SOC=min leaves zero energy and runtime; ratio remains 0.8 for a stopped-flow
  // base point. Exact zero tolerance; these are valid numeric boundaries only.
  for (const [base, patch, button, result, zeroNames] of [
    [hyd, { hydP: 0 }, 'calcHyd', 'resHyd', ['hydraulicPower']],
    [hyd, { hydQ: 0, hydMode: 'input', hydEff: 80 }, 'calcHyd', 'resHyd', ['hydraulicPower', 'estimatedInputPower']],
    [pump, { pumpQ1: 0, pumpH1: 0, pumpW1: 0 }, 'calcAffinity', 'resAffinity', ['estimatedFlow', 'estimatedHead', 'estimatedPower']],
    [battery, { batSoc: 20 }, 'calcBat', 'resBat', ['socWindow', 'usableEnergy', 'runtime']],
    [motor, { motKw: 0 }, 'calcMotor', 'resMotor', ['electricalInputPower', 'runningCurrent']],
    [voltage, { vdA: 0 }, 'calcVD', 'resVD', ['voltageDrop', 'voltageDropPercent']],
    [correction, { pfKw: 0 }, 'calcPfCorr', 'resPfCorr', ['presentReactivePower', 'targetReactivePower', 'capacitorReactivePower']]
  ]) {
    fields({ ...base, ...patch }); click(button, result); const r = await record(result);
    for (const name of zeroNames) near(r.outputs[name].value, 0, 0, result + ': valid zero ' + name);
    if (result === 'resAffinity') near(r.steps[0].value, 0.8, 1e-12, 'Zero-flow speed ratio');
    else if (result === 'resVD') near(r.steps[0].value, 0.1, 1e-12, 'Zero-current length conversion');
    const zeroSteps = r.steps.slice(result === 'resAffinity' || result === 'resVD' ? 1 : 0);
    for (const step of zeroSteps) near(step.value, 0, 0, result + ': valid zero step ' + step.label);
  }
  // Four times the cable length gives four times the drop: 34.64101615137754 V,
  // 8.660254037844386%; preserve existing >5% caution, not an approval criterion.
  fields({ ...voltage, vdL: 400 }); click('calcVD', 'resVD');
  assert(el('resVD').classList.contains('caution'));
  near((await record('resVD')).outputs.voltageDrop.value, 34.64101615137754, 1e-10, 'Long cable');

  // Invalid input after a valid result must remove all previous working/exports.
  for (const [base, button, result, badCases] of [
    [hyd, 'calcHyd', 'resHyd', [{ hydP: '' }, { hydP: -1 }, { hydQ: -1 }, { hydMode: 'input', hydEff: '' }, { hydMode: 'input', hydEff: 0 }, { hydMode: 'input', hydEff: 101 }]],
    [pump, 'calcAffinity', 'resAffinity', [{ pumpN1: '' }, { pumpN1: 0 }, { pumpN2: -1 }, { pumpQ1: '' }, { pumpH1: -1 }, { pumpW1: -1 }]],
    [battery, 'calcBat', 'resBat', [{ batKwh: '' }, { batKwh: 0 }, { batLoad: 0 }, { batSoc: 19 }, { batSoc: 101 }, { batMin: -1 }, { batEff: '' }, { batEff: 101 }]],
    [motor, 'calcMotor', 'resMotor', [{ motKw: '' }, { motKw: -1 }, { motV: 0 }, { motPf: 0 }, { motPf: 1.1 }, { motEff: '' }, { motEff: 101 }]],
    [voltage, 'calcVD', 'resVD', [{ vdA: '' }, { vdA: -1 }, { vdL: -1 }, { vdR: -1 }, { vdV: 0 }]],
    [correction, 'calcPfCorr', 'resPfCorr', [{ pfKw: '' }, { pfKw: -1 }, { pfNow: 0 }, { pfTarget: 0.6 }, { pfTarget: 0.5 }, { pfTarget: 1.01 }]]
  ]) for (const bad of badCases) {
    fields(base); click(button, result); assert(box(result));
    fields(bad); click(button, result, false);
  }

  // Tank hand reference: table (1 m,10 m3),(3 m,30 m3). Fraction at 1,2,3
  // is 0,1/2,1; volumes 10,20,30. Ullage is allowed to decrease with volume:
  // (1,30),(3,10) -> midpoint 20, endpoints 30,10. Reverse row order is valid.
  // Range: distinct finite coordinates, volumes >= 0, measurement inside the
  // closed interval. No extrapolation. Display tolerance 0.000501 m3.
  const tank = { tankLowX: 1, tankLowV: 10, tankHighX: 3, tankHighV: 30, tankMeasure: 2 };
  for (const [patch, expected] of [
    [{ tankMeasure: 1 }, 10], [{ tankMeasure: 2 }, 20], [{ tankMeasure: 3 }, 30],
    [{ tankLowV: 30, tankHighV: 10, tankMeasure: 1 }, 30],
    [{ tankLowV: 30, tankHighV: 10, tankMeasure: 2 }, 20],
    [{ tankLowV: 30, tankHighV: 10, tankMeasure: 3 }, 10],
    [{ tankLowX: 3, tankLowV: 10, tankHighX: 1, tankHighV: 30, tankMeasure: 1 }, 30],
    [{ tankLowX: 3, tankLowV: 10, tankHighX: 1, tankHighV: 30, tankMeasure: 2 }, 20],
    [{ tankLowX: 3, tankLowV: 10, tankHighX: 1, tankHighV: 30, tankMeasure: 3 }, 10],
    [{ tankLowV: 0, tankHighV: 0 }, 0], [{ tankLowV: 0, tankMeasure: 1 }, 0],
    [{ tankMeasure: '1,5' }, 15]
  ]) {
    fields({ ...tank, ...patch }); const text = click('calcTankInterp', 'resTankInterp');
    near(Number(text.replace(' m³', '')), expected, 0.000501, 'Tank interpolation');
  }
  for (const bad of [
    { tankLowV: -1 }, { tankHighV: -1 }, { tankLowV: -1, tankHighV: -1 },
    { tankHighX: 1 }, { tankHighX: 1, tankHighV: 10 },
    { tankMeasure: 0 }, { tankMeasure: 4 },
    { tankLowX: 3, tankHighX: 1, tankMeasure: 0 },
    { tankLowX: 3, tankHighX: 1, tankMeasure: 4 },
    { tankLowX: '' }, { tankLowV: '' }, { tankHighX: '' }, { tankHighV: '' }, { tankMeasure: '' },
    { tankLowV: '1e309' }, { tankLowX: '-1e308', tankHighX: '1e308', tankMeasure: 0 }
  ]) { fields(tank); click('calcTankInterp', 'resTankInterp'); fields(bad); click('calcTankInterp', 'resTankInterp', false); }

  // Three-phase hand reference: S=sqrt(3)*400*100/1000
  // = 69.28203230275509 kVA; P=0.8*S=55.42562584220407 kW.
  // Valid V>0, I>=0, 0<PF<=1; every input/derived result must be finite.
  // Display tolerance 0.050001; zero current gives exact zero.
  const threePhase = { elV: 400, elA: 100, elPf: '0,8' };
  fields(threePhase); const power = click('calc3p', 'res3p').match(/^([\d.]+) kW · ([\d.]+) kVA$/);
  assert(power); near(Number(power[1]), 55.42562584220407, 0.050001, 'Three-phase kW');
  near(Number(power[2]), 69.28203230275509, 0.050001, 'Three-phase kVA');
  for (const patch of [{ elA: 0 }, { elA: 0, elPf: 1 }, { elV: '1e100', elA: 0 }]) {
    fields({ ...threePhase, ...patch }); assert.equal(click('calc3p', 'res3p'), '0.0 kW · 0.0 kVA');
  }
  // Finite 1e308 V * 10 A overflows binary64's ~1.798e308 maximum.
  // PF=0.001 still leaves infinite S and P; sqrt(3)*1.5e308*0 is NaN.
  for (const bad of [{ elV: '1e308', elA: 10 }, { elV: '1e308', elA: 10, elPf: 0.001 }, { elV: '1.5e308', elA: 0 }, { elV: '1e309' }, { elA: '1e309' }, { elV: '' }, { elA: '' }, { elPf: '' }, { elV: 0 }, { elA: -1 }, { elPf: 0 }, { elPf: 1.01 }]) {
    fields(threePhase); click('calc3p', 'res3p'); fields(bad); click('calc3p', 'res3p', false);
  }

  // Presentation-only locale change: deferred steps use decimal commas, while
  // raw input strings and JSON/CSV retain identical units and machine numbers.
  const panels = [
    [hyd, { hydMode: 'input', hydEff: 80 }, 'calcHyd', 'resHyd'],
    [pump, {}, 'calcAffinity', 'resAffinity'], [battery, {}, 'calcBat', 'resBat'],
    [motor, {}, 'calcMotor', 'resMotor'], [voltage, {}, 'calcVD', 'resVD'],
    [correction, {}, 'calcPfCorr', 'resPfCorr']
  ];
  const beforeLocale = [], rawInputs = [];
  for (const [base, patch, button, result] of panels) {
    fields({ ...base, ...patch }); click(button, result);
    beforeLocale.push(await record(result));
    rawInputs.push(Object.keys(base).map(id => el(id).value));
  }
  w.MT_I18N = { locale: 'nb', t: text => text }; w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
  for (const [i, [base, , , result]] of panels.entries()) {
    assert.match(box(result).querySelector('code').textContent, /\d,\d/);
    assert.deepEqual(Object.keys(base).map(id => el(id).value), rawInputs[i]);
    const after = await record(result);
    for (const key of ['inputs', 'outputs', 'steps', 'validity']) assert.deepEqual(after[key], beforeLocale[i][key]);
    const csv = await download(result, 'csv');
    for (const [name, item] of Object.entries(after.outputs)) assert(csv.includes(`,output,${name},${item.value},${item.unit}`));
  }
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', handlerRuns, numericReferences, invalidRuns, workingRuns, scope: 'six real working panels and exports; tank endpoints/reversed ullage/domain; three-phase overflow/zero; decimal comma. No layout, translation, device or operational acceptance.' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
