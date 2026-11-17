// Independent literal hand references through the actual app.js DOM handlers.
// Run: NODE_PATH=<jsdom@26.1.0 node_modules> node tests/main-calculator-units-compass-density-20261117.cjs
// No extracted handlers, generated baselines or live services. This is not
// browser layout, Norwegian translation, device or operational acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let dom;

(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://units-compass-density.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
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
  // Capture real working downloads without changing their record builder.
  w.Blob = Blob;
  w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:test-' + downloads.length; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['quick', 'vessel-calcs']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0, 'Short UI tasks settled');
  }
  await flush();
  let runs = 0, references = 0, invalidRuns = 0;
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const box = result => d.querySelector(`.calc-work[data-for="${result}"]`);
  function fields(values) {
    for (const [id, value] of Object.entries(values)) {
      const node = el(id); node.value = String(value);
      node.dispatchEvent(new w.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }
  }
  function near(actual, expected, tolerance, label) {
    references++;
    assert(Number.isFinite(actual), label + ': finite value required');
    assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} +/- ${tolerance}`);
  }
  function click(button, result, valid = true) {
    results.delete(result); el(button).click(); runs++;
    assert.equal(results.get(result), valid, `${button}: ${el(result).textContent}`);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/);
    if (valid) { assert(box(result), result + ': Show working'); assert.equal(d.querySelectorAll(`.calc-work[data-for="${result}"]`).length, 1); }
    else { invalidRuns++; assert.equal(box(result), null, 'Invalid result clears old working'); }
    return el(result).textContent;
  }
  async function record(result) {
    const before = downloads.length; box(result).querySelector('.calc-work-json').click();
    assert.equal(downloads.length, before + 1); return JSON.parse(await downloads.at(-1).text());
  }
  async function csv(result) { box(result).querySelector('.calc-work-csv').click(); return downloads.at(-1).text(); }
  function working(result, expected) {
    const rows = [...box(result).querySelectorAll('.calc-work-steps > li')];
    assert.equal(rows.length, expected.length, result + ': every working step has a hand reference');
    rows.forEach((row, i) => {
      const [label, value, tolerance] = expected[i];
      assert.equal(row.querySelector('span').textContent, label);
      const match = row.querySelector('code').textContent.match(/=\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:\s|$)/i);
      assert(match, result + ': numeric RHS'); near(Number(match[1]), value, tolerance, result + ': ' + label);
    });
  }

  // Conversion range: finite signed inputs with a finite result. These are
  // unit transformations, not a model of permissible physical temperatures.
  // Hand definitions: NM = 1852 m, kn = 1852/3600 m/s, bar = 100 kPa.
  // Mechanical hp: 550 * 0.3048 * 0.45359237 * 9.80665
  // = 745.69987158227022 W. PS: 75 * 9.80665 = 735.49875 W.
  // Fahrenheit: 0*9/5+32=32; 100*9/5+32=212; inverse (F-32)*5/9.
  // Literal inverse references are long division of these definitions.
  // Raw tolerances: <=1e-12 for ratios, <=1e-10 W for power constants.
  // Display tolerance: 0.000000501 (half of six displayed decimal places).
  const conversionCases = [
    ['nm-km', 1, 1.852, 'NM', 'km', 1e-12],
    ['km-nm', 100, 53.99568034557235, 'km', 'NM', 1e-12],
    ['nm-m', 1, 1852, 'NM', 'm', 0],
    ['m-nm', 1852, 1, 'm', 'NM', 1e-12],
    ['kn-ms', 10, 5.144444444444444, 'kn', 'm/s', 1e-14],
    ['ms-kn', 10, 19.43844492440605, 'm/s', 'kn', 1e-12],
    ['bar-kpa', 1, 100, 'bar', 'kPa', 0],
    ['kpa-bar', 100, 1, 'kPa', 'bar', 0],
    ['kw-hp', 1, 1.3410220895950277, 'kW', 'hp (mechanical)', 1e-12],
    ['hp-kw', 1, 0.7456998715822702, 'hp (mechanical)', 'kW', 1e-14],
    ['hp-w', 1, 745.69987158227022, 'hp (mechanical)', 'W', 1e-10],
    ['w-hp', 745.69987158227022, 1, 'W', 'hp (mechanical)', 1e-12],
    ['kw-ps', 1, 1.3596216173039043, 'kW', 'PS (metric)', 1e-12],
    ['ps-kw', 1, 0.73549875, 'PS (metric)', 'kW', 1e-14],
    ['ps-w', 1, 735.49875, 'PS (metric)', 'W', 1e-10],
    ['w-ps', 735.49875, 1, 'W', 'PS (metric)', 1e-12],
    ['c-f', 0, 32, '°C', '°F', 0],
    ['c-f', 100, 212, '°C', '°F', 0],
    ['f-c', 32, 0, '°F', '°C', 1e-12],
    ['f-c', 212, 100, '°F', '°C', 1e-12],
    ['c-f', -40, -40, '°C', '°F', 0],
    ['kn-ms', '-10,5', -5.401666666666667, 'kn', 'm/s', 1e-14]
  ];
  for (const value of ['nm-km', 'km-nm', 'kn-ms', 'ms-kn', 'bar-kpa', 'kw-hp', 'c-f']) assert(el('unitType').querySelector(`option[value="${value}"]`), 'Legacy conversion option: ' + value);
  assert.match(el('unitType').querySelector('option[value="kw-hp"]').textContent, /mechanical/);
  for (const [type, value, expected, from, to, tolerance] of conversionCases) {
    fields({ unitType: type, unitVal: value }); click('calcUnit', 'resUnit');
    const r = await record('resUnit');
    assert.equal(r.tool, 'unit-converter'); assert.equal(r.inputs.conversion.value, type);
    assert.equal(r.inputs.value.unit, from); assert.equal(r.outputs.convertedValue.unit, to);
    near(r.outputs.convertedValue.value, expected, tolerance, type + ': raw');
    near(Number(el('resUnit').querySelector('strong').textContent.split(' ')[0]), expected, 0.000000501, type + ': display');
    working('resUnit', [['Unit conversion', expected, 0.000000000501]]);
    assert.match(box('resUnit').textContent, /Rounding is for display only/);
  }
  fields({ unitType: 'kn-ms', unitVal: 10 }); click('calcUnit', 'resUnit');
  const precise = await record('resUnit'), unitCsv = await csv('resUnit');
  assert.notEqual(precise.outputs.convertedValue.value, 5.144444, 'No display rounding in working exports');
  assert(unitCsv.includes(',output,convertedValue,' + precise.outputs.convertedValue.value + ',m/s'));
  for (const value of ['', 'abc', '1,2.3', '1e309']) { fields({ unitVal: value }); click('calcUnit', 'resUnit', false); }
  fields({ unitType: 'nm-m', unitVal: '1e308' }); click('calcUnit', 'resUnit', false);
  fields({ unitType: '', unitVal: 1 }); click('calcUnit', 'resUnit', false);

  // Bowditch-style signed east-positive compass arithmetic, with no use of
  // the implementation to obtain expected values. Finite angles may be outside
  // one revolution; the true course is in [0,360). Raw tolerance 1e-12 degree;
  // display tolerance 0.000501 degree, working tolerance 0.000000501 degree.
  // 358+5+6=369 -> 009 T. Gyro 358+5=363 -> 003 T.
  // Variation 5 + (-10)*(2026-2023)/60 = 4.5 E.
  // Before epoch: 5 + (-10)*(2020-2023)/60 = 5.5 E.
  const magneticDefaults = { compMode: 'magnetic', compC: 358, compVar: 5, compDev: 6, compVarEpoch: '', compVarAnnual: '', compCalcYear: '' };
  async function compass(values, expected, sum, variation, advanced = false) {
    fields(values); const output = click('calcCompass', 'resCompass');
    const r = await record('resCompass');
    near(r.outputs.trueCourse.value, expected, 1e-12, 'True course raw');
    assert(r.outputs.trueCourse.value >= 0 && r.outputs.trueCourse.value < 360);
    near(Number(output.match(/^(-?[\d.]+)° true/)[1]), expected >= 359.9995 ? 0 : expected, 0.000501, 'True course display');
    const steps = [];
    if (advanced) steps.push(['Variation at calculation year', variation, 0.000000501]);
    steps.push(['Unwrapped true course', sum, 0.000000501], ['True course (0–360°)', expected, 0.000000501]);
    working('resCompass', steps);
    if (variation !== null) near(r.outputs.appliedVariation.value, variation, 1e-12, 'Applied variation');
    return r;
  }
  await compass(magneticDefaults, 9, 369, 5);
  assert.equal(el('compMagneticFields').hidden, false); assert.equal(el('compGyroFields').hidden, true);
  assert.equal(el('compGyroError').disabled, true);
  await compass({ ...magneticDefaults, compC: 1, compVar: -5, compDev: -6 }, 350, -10, -5);
  await compass({ ...magneticDefaults, compC: 720, compVar: 0, compDev: 0 }, 0, 720, 0);
  await compass({ ...magneticDefaults, compC: -721, compVar: 0, compDev: 0 }, 359, -721, 0);
  await compass({ ...magneticDefaults, compC: '359,9999', compVar: 0, compDev: 0 }, 359.9999, 359.9999, 0);
  const advanced = { ...magneticDefaults, compDev: 0, compVarEpoch: 2023, compVarAnnual: -10, compCalcYear: 2026 };
  const epochRecord = await compass(advanced, 2.5, 362.5, 4.5, true);
  assert.equal(epochRecord.inputs.variationEpoch.value, 2023); assert.equal(epochRecord.inputs.annualChange.unit, '′/year');
  await compass({ compCalcYear: 2020 }, 3.5, 363.5, 5.5, true);
  await compass({ compCalcYear: 2026, compVarAnnual: '10,5' }, 3.525, 363.525, 5.525, true);
  await compass({ compCalcYear: 2023, compVarAnnual: 0 }, 3, 363, 5, true);
  // Gyro ignores even blank/invalid magnetic and epoch fields, preserving them
  // while disabled so switching modes does not alter saved raw values.
  const gyroRecord = await compass({ compMode: 'gyro', compC: 358, compGyroError: 5, compVar: 'bad', compDev: '', compVarEpoch: '', compVarAnnual: '', compCalcYear: 'bad' }, 3, 363, null);
  assert.equal(el('compMagneticFields').hidden, true); assert.equal(el('compGyroFields').hidden, false);
  assert.equal(el('compVar').disabled, true); assert.equal(el('compGyroError').disabled, false);
  assert.equal(gyroRecord.tool, 'gyro-correction'); assert.equal(gyroRecord.inputs.gyroError.value, 5);
  for (const key of ['variation', 'deviation', 'variationEpoch', 'annualChange', 'calculationYear']) assert.equal(gyroRecord.inputs[key], undefined);
  assert.match(box('resCompass').textContent, /gyro error only/);
  await compass({ compC: 1, compGyroError: -5 }, 356, -4, null);
  fields({ compMode: 'magnetic' }); assert.equal(el('compVar').value, 'bad'); assert.equal(el('compDev').value, '');
  click('calcCompass', 'resCompass', false);
  for (const bad of [{ compC: '' }, { compVar: '' }, { compDev: '' }, { compVarEpoch: 2023 }, { compVarAnnual: 0 }, { compCalcYear: 2026 }, { compVarEpoch: '2023.5', compVarAnnual: 0, compCalcYear: 2026 }, { compVarEpoch: 0, compVarAnnual: 0, compCalcYear: 2026 }, { compVarEpoch: 2023, compVarAnnual: 0, compCalcYear: 10000 }, { compVarEpoch: 2023, compVarAnnual: 'bad', compCalcYear: 2026 }]) {
    await compass(magneticDefaults, 9, 369, 5); fields(bad); click('calcCompass', 'resCompass', false);
  }
  fields({ ...magneticDefaults, compC: '1e308', compVar: '1e308' }); click('calcCompass', 'resCompass', false);
  fields({ compMode: 'gyro', compC: 10, compGyroError: '' }); click('calcCompass', 'resCompass', false);

  // FWA hand balance: 10000/(4*20)=125 mm, positive displacement t and
  // seawater TPC t/cm. Standard DWA range 1000 <= rho <= 1025 kg/m3.
  // 1010 kg/m3 = 1.010 t/m3; (1025-1010)/25 = 0.6; 125*0.6=75 mm.
  // At 1000:125 mm; at 1025:0 mm. Outside the interval DWA is withheld.
  // Raw tolerance 1e-10; displayed mm 0.050001; working mm 0.000501.
  assert.equal(el('fwaDensity').value, '1.010', 'Legacy density stays t/m³ by default');
  assert.equal(el('fwaDensityUnit').value, 't-m3'); assert.equal(el('fwaDensitySource').value, 'assumed');
  assert.match(el('fwaDensity').closest('.tool-card').textContent, /FWA = displacement \/ \(4 × TPC\) in mm/);
  const densityDefaults = { fwaDisp: 10000, fwaTpc: 20, fwaDensity: '1.010', fwaDensityUnit: 't-m3', fwaDensitySource: 'assumed' };
  async function density(values, rho, dwa) {
    fields(values); const output = click('calcFwa', 'resFwa'), r = await record('resFwa');
    near(r.outputs.freshWaterAllowance.value, 125, 1e-10, 'FWA raw');
    near(r.outputs.densityKgM3.value, rho, 1e-10, 'Density kg/m³ raw');
    assert.match(output, new RegExp(rho.toFixed(3) + ' kg/m³'));
    const steps = [['Density in kg/m³', rho, 0.000000501], ['Fresh Water Allowance', 125, 0.000501]];
    if (dwa !== null) {
      near(r.outputs.dockWaterAllowance.value, dwa, 1e-10, 'DWA raw');
      assert.match(output, /FWA 125.0 mm · DWA/);
      const displayed = output.match(/DWA (-?[\d.]+) mm/); assert(displayed); near(Number(displayed[1]), dwa, 0.050001, 'DWA display');
      steps.push(['Dock Water Allowance', dwa, 0.000501]);
    } else {
      assert.match(output, /DWA unavailable/); assert.match(output, /outside 1000–1025 kg\/m³/);
      assert(el('resFwa').classList.contains('caution'));
      assert.equal(r.outputs.dockWaterAllowance, undefined, 'No extrapolated DWA in exports');
      assert.match(r.validity.join(' '), /outside 1000–1025/);
      assert.doesNotMatch(await csv('resFwa'), /dockWaterAllowance|Dock Water Allowance/);
    }
    working('resFwa', steps); return r;
  }
  const assumed = await density(densityDefaults, 1010, 75);
  assert.equal(assumed.inputs.densitySource.value, 'assumed'); assert.match(el('resFwa').textContent, /Assumed preset \/ estimate/);
  const measured = await density({ fwaDensity: '1010,0', fwaDensityUnit: 'kg-m3', fwaDensitySource: 'measured' }, 1010, 75);
  assert.equal(measured.inputs.dockWaterDensity.value, 1010); assert.equal(measured.inputs.dockWaterDensity.unit, 'kg/m³');
  assert.equal(measured.inputs.densitySource.value, 'measured'); assert.match(el('resFwa').textContent, /Measured density/);
  await density({ fwaDensity: '1,010', fwaDensityUnit: 't-m3' }, 1010, 75);
  for (const [unit, value, rho, dwa] of [['kg-m3', 1000, 1000, 125], ['kg-m3', 1025, 1025, 0], ['t-m3', '1.000', 1000, 125], ['t-m3', '1.025', 1025, 0], ['kg-m3', 999, 999, null], ['kg-m3', 1026, 1026, null], ['t-m3', '1.026', 1026, null], ['kg-m3', '1.025', 1.025, null], ['t-m3', 1025, 1025000, null]]) await density({ fwaDensityUnit: unit, fwaDensity: value }, rho, dwa);
  for (const bad of [{ fwaDisp: '' }, { fwaDisp: 0 }, { fwaDisp: -1 }, { fwaTpc: '' }, { fwaTpc: 0 }, { fwaTpc: -1 }, { fwaDensity: '' }, { fwaDensity: 0 }, { fwaDensity: -1 }, { fwaDensity: 'bad' }, { fwaDensity: '1e308' }, { fwaDisp: '1e308', fwaTpc: '1e-308' }]) {
    await density(densityDefaults, 1010, 75); fields(bad); click('calcFwa', 'resFwa', false);
  }

  // Locale is presentation only. A minimal translation stub checks deferred
  // decimal-comma rendering and unchanged inputs/machine-format working exports;
  // Norwegian wording itself is deliberately left for the translation owner.
  fields({ unitType: 'kn-ms', unitVal: '10,5' }); click('calcUnit', 'resUnit');
  await compass(advanced, 2.5, 362.5, 4.5, true);
  await density(densityDefaults, 1010, 75);
  const beforeLocale = await Promise.all(['resUnit', 'resCompass', 'resFwa'].map(record));
  const raw = ['unitVal', 'compC', 'compVar', 'compDev', 'compVarAnnual', 'fwaDensity'].map(id => el(id).value);
  w.MT_I18N = { locale: 'nb', t: text => text }; w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
  assert.match(el('resUnit').textContent, /5,401667/); assert.match(el('resCompass').textContent, /2,500° true/); assert.match(el('resFwa').textContent, /125,0 mm/);
  assert.match(box('resUnit').querySelector('code').textContent, /10,500000000/);
  assert.deepEqual(['unitVal', 'compC', 'compVar', 'compDev', 'compVarAnnual', 'fwaDensity'].map(id => el(id).value), raw);
  for (const [i, id] of ['resUnit', 'resCompass', 'resFwa'].entries()) {
    const after = await record(id); assert.deepEqual(after.inputs, beforeLocale[i].inputs); assert.deepEqual(after.outputs, beforeLocale[i].outputs);
    const machineCsv = await csv(id); assert.match(machineCsv, /,output,/); assert.doesNotMatch(machineCsv, /5,401667/);
  }
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', handlerRuns: runs, numericReferences: references, invalidRuns, scope: 'actual jsdom handlers, literal hand references, working JSON/CSV precision, legacy IDs/options, decimal comma and mode/density validation; no layout/devices/live-provider acceptance' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
