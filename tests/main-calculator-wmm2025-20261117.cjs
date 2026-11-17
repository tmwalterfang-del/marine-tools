// Primary oracle: NOAA/NCEI WMM2025COF.zip, WMM2025COF/WMM2025_TestValues.txt.
// https://www.ncei.noaa.gov/sites/default/files/2024-12/WMM2025COF.zip
// Downloaded 2026-11-17; ZIP SHA256: 2e76569370d081f2cd7919490218bd094ca9afde347b198eff5621e0af460d03
// Test-file SHA256: e6975b093dddeb6153e0b23cc418425c438167e7c5b1dd795da379cb654f5819
// Official coefficients: WMM.COF SHA256 dfa8597825af4e0b87ff4198a5b4fb661b3c49f4cd090cd0164e0259b075582f.
// All 100 NOAA rows below are source literals, independent of the evaluator.
// Columns: decimal year, WGS84 ellipsoid altitude km, geodetic latitude, longitude,
// declination degrees, dD/dt degrees/year, horizontal intensity nT.
// Published D precision is 0.01 deg; dD/dt precision is 0.000001 deg/year.
// Additional horizontal-intensity check: absolute tolerance 0.002 nT.
// Model range: 2025.0–2030.0, latitude +/-90, longitude +/-180, altitude -1–850 km.
// UI refuses both blackout (<2000 nT) and caution (<6000 nT) zones.
// This exercises actual DOM handlers, not physical devices or navigation acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const references = [
  [2025.000000, 28, 89, -121, -99.77, 2.491706, 1504.298146],
  [2025.000000, 48, 80, -96, -29.91, 1.248417, 2164.285547],
  [2025.000000, 54, 82, 87, 54.89, 0.884574, 2302.427342],
  [2025.000000, 65, 43, 93, 0.50, -0.019813, 24300.764692],
  [2025.000000, 51, -33, 109, -5.49, 0.069861, 21838.046477],
  [2025.000000, 39, -59, -8, -15.75, 0.010988, 14918.115796],
  [2025.000000, 3, -50, -103, 27.96, -0.032104, 22106.041373],
  [2025.000000, 94, -29, -110, 15.74, -0.011062, 24181.990098],
  [2025.000000, 66, 14, 143, -0.19, -0.055086, 35003.635649],
  [2025.000000, 18, 0, 21, 1.29, 0.030544, 29282.246275],
  [2025.500000, 6, -36, -137, 20.28, 0.025348, 25353.230658],
  [2025.500000, 63, 26, 81, 0.51, 0.018525, 34803.980117],
  [2025.500000, 69, 38, -144, 12.93, -0.105300, 23096.337032],
  [2025.500000, 50, -70, -133, 57.21, -0.036998, 16656.709403],
  [2025.500000, 8, -52, -75, 14.91, -0.098427, 20005.506364],
  [2025.500000, 8, -66, 17, -33.14, -0.112991, 18154.870136],
  [2025.500000, 22, -37, 140, 9.28, 0.028818, 21688.847590],
  [2025.500000, 40, -12, -129, 10.76, -0.009568, 29105.866326],
  [2025.500000, 44, 33, -118, 11.10, -0.075717, 23678.743422],
  [2025.500000, 50, -81, -67, 28.13, -0.099291, 18292.842720],
  [2026.000000, 74, -57, 3, -22.51, -0.037845, 14362.206593],
  [2026.000000, 46, -24, -122, 14.01, 0.000271, 26638.500090],
  [2026.000000, 69, 23, 63, 1.17, 0.013234, 34565.858527],
  [2026.000000, 33, -3, -147, 9.71, -0.006185, 30957.666082],
  [2026.000000, 47, -72, -22, -6.32, -0.048225, 18392.516222],
  [2026.000000, 62, -14, 99, -1.43, 0.061400, 33448.275663],
  [2026.000000, 83, 86, -46, -30.61, 1.221388, 3000.255301],
  [2026.000000, 82, -64, 87, -81.74, -0.187260, 13974.248411],
  [2026.000000, 34, -19, 43, -14.98, -0.135700, 20212.448819],
  [2026.000000, 56, -81, 40, -59.77, -0.146798, 17877.818542],
  [2026.500000, 14, 0, 80, -3.10, 0.056431, 39489.089663],
  [2026.500000, 12, -82, -68, 29.79, -0.104864, 18497.480257],
  [2026.500000, 44, -46, -42, -11.36, 0.039043, 14140.316272],
  [2026.500000, 43, 17, 52, 1.19, -0.010785, 36002.676553],
  [2026.500000, 64, 10, 78, -1.53, 0.031231, 39441.702532],
  [2026.500000, 12, 33, -145, 11.96, -0.086620, 24672.289649],
  [2026.500000, 12, -79, 115, -137.58, -0.241722, 13023.480845],
  [2026.500000, 14, -33, -114, 18.12, -0.000322, 24613.183584],
  [2026.500000, 19, 29, 66, 2.24, 0.018224, 32749.959268],
  [2026.500000, 86, -11, 167, 10.24, 0.013426, 33105.255278],
  [2027.000000, 37, -66, -5, -17.22, -0.043630, 17159.836500],
  [2027.000000, 67, 72, -115, 13.73, -0.315901, 5026.868699],
  [2027.000000, 44, 22, 174, 6.46, -0.024375, 28867.487799],
  [2027.000000, 54, 54, 178, 0.63, -0.170729, 20617.099795],
  [2027.000000, 57, -43, 50, -48.27, -0.165742, 16833.417225],
  [2027.000000, 44, -43, -111, 24.31, -0.006299, 22462.470699],
  [2027.000000, 12, -63, 178, 57.87, 0.151793, 11720.691727],
  [2027.000000, 38, 27, -169, 8.48, -0.058765, 26106.758229],
  [2027.000000, 61, 59, -77, -16.48, 0.230418, 10884.812802],
  [2027.000000, 67, -47, -32, -13.52, 0.115550, 12805.786103],
  [2027.500000, 8, 62, 53, 19.39, 0.099601, 12997.751893],
  [2027.500000, 77, -68, -7, -16.19, -0.048399, 17262.817301],
  [2027.500000, 98, -5, 159, 7.79, -0.005671, 33857.496691],
  [2027.500000, 34, -29, -107, 15.64, -0.017007, 24446.053109],
  [2027.500000, 60, 27, 65, 1.85, 0.016699, 33079.422542],
  [2027.500000, 73, -72, 95, -102.64, -0.235287, 13306.747292],
  [2027.500000, 96, -46, -85, 17.93, -0.091418, 19914.457641],
  [2027.500000, 0, -13, -59, -17.49, -0.173690, 22401.493010],
  [2027.500000, 16, 66, -178, 0.37, -0.327448, 13821.614337],
  [2027.500000, 72, -87, 38, -65.44, -0.148310, 16661.696834],
  [2028.000000, 49, 20, 167, 5.10, -0.020383, 30251.262453],
  [2028.000000, 71, 5, -13, -6.47, 0.166481, 28323.200567],
  [2028.000000, 95, 14, 65, -0.51, 0.011924, 36933.940251],
  [2028.000000, 86, -85, -79, 41.09, -0.121705, 16867.459172],
  [2028.000000, 30, -36, -64, -4.65, -0.162162, 17398.651081],
  [2028.000000, 75, 79, 125, -18.59, -0.910648, 2582.332595],
  [2028.000000, 21, 6, -32, -14.34, 0.177960, 28453.070088],
  [2028.000000, 1, -76, -75, 29.87, -0.086171, 19597.635210],
  [2028.000000, 45, -46, -41, -11.68, 0.048411, 13897.562372],
  [2028.000000, 11, -22, -21, -23.24, 0.176027, 13528.270036],
  [2028.500000, 28, 54, -120, 15.43, -0.147623, 15286.094495],
  [2028.500000, 68, -58, 156, 41.57, 0.218259, 9282.943032],
  [2028.500000, 39, -65, -88, 29.45, -0.076076, 20609.270068],
  [2028.500000, 27, -23, 81, -13.27, 0.129297, 25625.329284],
  [2028.500000, 11, 34, 0, 1.57, 0.111314, 29089.194286],
  [2028.500000, 72, -62, 65, -67.87, -0.176819, 17434.847799],
  [2028.500000, 55, 86, 70, 67.64, 1.341225, 2370.361097],
  [2028.500000, 59, 32, 163, 0.15, -0.043407, 28217.204381],
  [2028.500000, 65, 48, 148, -9.55, -0.040524, 23693.546804],
  [2028.500000, 95, 30, 28, 4.56, 0.034245, 29786.406936],
  [2029.000000, 95, -60, -59, 8.58, -0.053323, 18095.598879],
  [2029.000000, 95, -70, 42, -55.06, -0.157751, 18202.660480],
  [2029.000000, 50, 87, -154, -73.48, 1.562405, 906.920459],
  [2029.000000, 58, 32, 19, 4.11, 0.056569, 29434.989012],
  [2029.000000, 57, 34, -13, -1.89, 0.154151, 28257.277809],
  [2029.000000, 38, -76, 49, -64.28, -0.160186, 18412.640681],
  [2029.000000, 49, -50, -179, 32.11, 0.110906, 18080.593790],
  [2029.000000, 90, -55, -171, 38.65, 0.117199, 16416.538468],
  [2029.000000, 41, 42, -19, -4.13, 0.180959, 24503.475397],
  [2029.000000, 19, 46, -22, -5.65, 0.196585, 22632.016516],
  [2029.500000, 31, 13, -132, 9.04, -0.039071, 28145.022897],
  [2029.500000, 93, -2, 158, 7.09, -0.010065, 34067.301020],
  [2029.500000, 51, -76, 40, -56.34, -0.148779, 18517.441118],
  [2029.500000, 64, 22, -132, 10.23, -0.057237, 26014.780783],
  [2029.500000, 26, -65, 55, -63.48, -0.179396, 18695.741849],
  [2029.500000, 66, -21, 32, -14.63, -0.198629, 16100.322907],
  [2029.500000, 18, 9, -172, 9.24, -0.000053, 30922.514410],
  [2029.500000, 63, 88, 26, 36.52, 1.375737, 2539.900024],
  [2029.500000, 33, 17, 5, 0.89, 0.078642, 34026.126581],
  [2029.500000, 77, -18, 138, 4.45, -0.036580, 31847.600506]
];
let checks = 0;
function near(actual, expected, tolerance, label) {
  checks++;
  assert(Number.isFinite(actual), label + ': finite');
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} +/- ${tolerance}`);
}
const sandbox = { window: {} };
vm.runInNewContext(read('wmm2025-20261117.js'), sandbox);
const model = sandbox.window.MT_WMM2025;
assert.equal(model.validFrom, 2025);
assert.equal(model.validTo, 2030);
assert.equal(references.length, 100);
for (const [year, altitude, lat, lon, declination, annualChange, horizontal] of references) {
  const result = model.declination(lat, lon, altitude, year);
  const label = [year, altitude, lat, lon].join('/');
  near(result.declination, declination, 0.005001, label + ': declination');
  near(result.annualChange, annualChange, 0.00000051, label + ': annual change degrees/year');
  near(result.annualChangeMinutes, annualChange * 60, 0.0000306, label + ': annual change minutes/year');
  near(result.horizontalIntensity, horizontal, 0.002, label + ': horizontal intensity');
  assert.equal(result.usable, horizontal >= 6000);
  assert.equal(result.blackout, horizontal < 2000);
  assert.equal(result.caution, horizontal >= 2000 && horizontal < 6000);
}
// NOAA's separately published Table 6, all 12 rows, sea level and 100 km:
// https://www.ncei.noaa.gov/sites/default/files/2025-02/WMM2025_TEST_VALUES.txt
// D and Ddot are published to 0.01 degree and 0.01 degree/year respectively.
// NOAA longitude 240 degrees is the identical meridian to -120 degrees.
const table6 = [
  [2025, 0, 80, 0, 1.28, 0.52], [2025, 0, 0, 120, -0.16, -0.03],
  [2025, 0, -80, -120, 68.78, -0.12], [2025, 100, 80, 0, 0.85, 0.52],
  [2025, 100, 0, 120, -0.15, -0.03], [2025, 100, -80, -120, 68.21, -0.11],
  [2027.5, 0, 80, 0, 2.59, 0.53], [2027.5, 0, 0, 120, -0.24, -0.03],
  [2027.5, 0, -80, -120, 68.49, -0.12], [2027.5, 100, 80, 0, 2.16, 0.52],
  [2027.5, 100, 0, 120, -0.23, -0.03], [2027.5, 100, -80, -120, 67.93, -0.11]
];
for (const [year, altitude, lat, lon, declination, annual] of table6) {
  const result = model.declination(lat, lon, altitude, year);
  near(result.declination, declination, 0.005001, 'Table 6 declination');
  near(result.annualChange, annual, 0.005001, 'Table 6 annual change');
}
for (const year of [2024.999999, 2030.000001, NaN, Infinity]) assert.throws(() => model.declination(0, 0, 0, year), /WMM_(DATE|INPUT)/);
for (const args of [[91, 0, 0, 2025], [-91, 0, 0, 2025], [0, 181, 0, 2025], [0, -181, 0, 2025], [0, 0, -1.01, 2025], [0, 0, 850.01, 2025], ['', 0, 0, 2025], [0, null, 0, 2025]]) assert.throws(() => model.declination(...args), /WMM_(INPUT|POSITION|ALTITUDE)/);
for (const lat of [-90, 90]) for (const lon of [-180, 0, 180]) {
  const r = model.declination(lat, lon, 0, 2025);
  assert([r.declination, r.annualChange, r.horizontalIntensity].every(Number.isFinite), 'Geographic pole limit');
}
near(model.declination(0, -180, 0, 2030).declination, model.declination(0, 180, 0, 2030).declination, 1e-10, 'Dateline and inclusive epoch endpoint');
assert(model.declination(90, 0, 0, 2025).blackout, 'Northern blackout');
assert(model.declination(-64, 136, 0, 2025).blackout, 'Southern blackout');
assert(model.declination(85, 0, 0, 2025).caution, 'Caution band below 6000 nT');

let dom;
(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://wmm2025.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tasks = [], errors = [];
  if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
  w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
  w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
  w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
  w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.navigator, 'onLine', { value: false });
  w.fetch = async () => { throw Error('Unexpected network request'); };
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'wmm2025-20261117.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['quick', 'vessel-calcs']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0);
  }
  await flush();
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const fields = values => { for (const [id, value] of Object.entries(values)) { const node = el(id); node.value = String(value); node.dispatchEvent(new w.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); } };
  const corrected = () => ['compVar', 'compVarAnnual', 'compVarEpoch', 'compCalcYear', 'compDev', 'compGyroError'].map(id => el(id).value);
  const now = new w.Date();
  assert.equal(el('compWmmDate').value, [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-'), 'Local today default');
  assert.equal(el('compVar').value, '2', 'Rendering never overwrites manual variation');
  assert.equal(el('compVarAnnual').value, '');
  assert.equal(el('compWmmLat').value, '');
  el('calcCompass').click();
  assert.match(el('resCompass').textContent, /91\.000° true/, 'Unchanged manual calculation');
  fields({ compC: 90, compDev: 0, compWmmLat: 80, compWmmLon: 0, compWmmDate: '2025-01-01', compVarEpoch: 2023, compCalcYear: 2029, compVarAnnual: -10 });
  el('compWmmSuggest').click();
  near(Number(el('compVar').value), 1.28, 0.005001, 'NOAA sea-level declination filled');
  near(Number(el('compVarAnnual').value) / 60, 0.52, 0.005001, 'Annual change converted to arcminutes/year');
  assert.equal(el('compVarEpoch').value, '2025');
  assert.equal(el('compCalcYear').value, '2025', 'Previous extrapolation cleared');
  assert.match(el('compWmmStatus').textContent, /WMM2025 · 2025-01-01/);
  assert.match(el('compWmmStatus').textContent, /Model estimate.*WGS84.*local magnetic anomalies.*vessel deviation/);
  el('calcCompass').click();
  const expectedTrue = 90 + Number(el('compVar').value);
  near(Number(el('resCompass').textContent.match(/([\d.]+)° true/)[1]), expectedTrue, 0.000501, 'Actual compass handler uses suggested variation without double advance');
  assert(d.querySelector('.calc-work[data-for="resCompass"]'), 'Working remains available');
  let recorded;
  const real = w.MT_WMM2025;
  w.MT_WMM2025 = { ...real, declination(...args) { recorded = args; return real.declination(...args); } };
  fields({ compWmmLat: '-0,5', compWmmLon: '120,5', compWmmDate: '2028-07-02' });
  el('compWmmSuggest').click();
  assert.deepEqual(Array.from(recorded), [-0.5, 120.5, 0, 2028.5], 'Shared comma parser and leap-year decimal date');
  const filled = corrected();
  w.MT_I18N = { locale: 'nb', t: text => text };
  w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
  assert.deepEqual(corrected(), filled, 'Language changes presentation only');
  assert.match(el('compWmmStatus').textContent, /2028-07-02.*variation.*Model estimate/, 'Translated status stays rendered');
  assert.match(el('compWmmStatus').textContent, /annual change [−-]?\d+,\d′\/year/, 'Norwegian display uses a decimal comma');
  fields({ compWmmLat: 0 });
  assert.match(el('compWmmStatus').textContent, /suggest variation again/);
  w.MT_I18N.locale = 'en';
  const refusal = (values, message) => {
    fields(values); const saved = corrected(); el('compWmmSuggest').click();
    assert.deepEqual(corrected(), saved, 'Refusal preserves all existing corrections');
    assert.match(el('compWmmStatus').textContent, message);
  };
  refusal({ compWmmLat: '', compWmmLon: 0 }, /Enter latitude/);
  refusal({ compWmmLat: 91 }, /Enter latitude/);
  refusal({ compWmmLat: 0, compWmmLon: -181 }, /Enter latitude/);
  refusal({ compWmmLon: 0, compWmmDate: '' }, /valid date/);
  refusal({ compWmmDate: '2025-02-29' }, /valid date/);
  refusal({ compWmmDate: '2024-12-31' }, /valid only from 2025\.0 to 2030\.0/);
  refusal({ compWmmDate: '2030-01-02' }, /valid only from 2025\.0 to 2030\.0/);
  refusal({ compWmmDate: '2025-01-01', compWmmLat: 90 }, /below 6000 nT/);
  refusal({ compWmmLat: -64, compWmmLon: 136 }, /below 6000 nT/);
  refusal({ compWmmLat: 85, compWmmLon: 0 }, /below 6000 nT/);
  fields({ compWmmLat: 0, compWmmLon: 120, compWmmDate: '2030-01-01' });
  el('compWmmSuggest').click();
  assert.equal(recorded[3], 2030, 'Inclusive 2030.0 endpoint');
  assert.match(el('compWmmStatus').textContent, /WMM2025 · 2030-01-01/);
  delete w.MT_WMM2025;
  refusal({ compWmmDate: '2025-01-01' }, /unavailable/);
  w.MT_WMM2025 = { declination() { throw Error('Unavailable model'); } };
  refusal({}, /could not calculate/);
  w.MT_WMM2025 = { declination() { return { declination: NaN, annualChangeMinutes: 1, horizontalIntensity: 6000 }; } };
  refusal({}, /could not calculate/);
  w.MT_WMM2025 = real;
  fields({ compMode: 'gyro', compC: 90, compGyroError: 3 });
  assert(el('compMagneticFields').hidden);
  assert(el('compWmmLat').disabled && el('compWmmDate').disabled);
  const gyroSaved = corrected(); el('compWmmSuggest').click();
  assert.deepEqual(corrected(), gyroSaved, 'Suggestion does nothing in gyro mode');
  el('calcCompass').click();
  assert.match(el('resCompass').textContent, /93\.000° true/, 'Gyro behavior unchanged');
  await flush();
  assert.deepEqual(errors, [], 'No app errors');
  console.log(JSON.stringify({ status: 'PASS', noaaReferenceRows: references.length + table6.length, numericChecks: checks, compassSuggestionDom: true }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
