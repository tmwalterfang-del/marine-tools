// Numeric-range regressions through actual DOM handlers and downloaded JSON.
// Fixtures use finite inputs: 1e308*2 overflows binary64; 1e-200 squared
// underflows to zero. No calculator arithmetic or result paths are replaced.
// Run with jsdom@26.1.0 on NODE_PATH. No device/provider/layout acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
let dom;
(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://round5b.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tasks = [], errors = [], downloads = [], events = [];
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
  w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:round5b-' + downloads.length; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  w.localStorage.setItem('mt.route', JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
  w.localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 10, fuelDay: 4, corridor: 5 }));
  d.addEventListener('mt-calculation-result', e => events.push([e.target.id, e.detail.valid]));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['navigation', 'weather', 'fuel', 'vessel-calcs', 'engineering', 'electrical', 'quick', 'profile']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { for (const fn of tasks.splice(0)) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0);
  }
  await flush();
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const box = id => d.querySelector(`.calc-work[data-for="${id}"]`);
  function fields(values) {
    for (const [id, value] of Object.entries(values)) {
      const node = el(id); node.value = String(value);
      assert.equal(node.value, String(value), id + ': finite fixture survives the input element');
      node.dispatchEvent(new w.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }
  }
  function rows(container, rowClass, columns, values) {
    const host = el(container); host.replaceChildren();
    for (const valuesInRow of values) {
      const row = d.createElement('div'); row.className = 'dynamic-row ' + rowClass;
      columns.forEach((className, i) => { const input = d.createElement('input'); input.className = className; input.value = String(valuesInRow[i]); row.append(input); });
      host.append(row);
    }
    host.dispatchEvent(new w.Event('input', { bubbles: true }));
  }
  let invalidRuns = 0, validRuns = 0;
  function click(button, result, valid, message = /Result exceeds the numeric range\./) {
    events.length = 0; el(button).click();
    assert.deepEqual(events.filter(e => e[0] === result), [[result, valid]], button + ': exactly one result event; ' + el(result).textContent);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/);
    if (valid) validRuns++;
    else {
      invalidRuns++;
      assert.match(el(result).textContent, message, button);
      assert.match(el(result).className, /caution/);
      assert.equal(box(result), null, button + ': no working or exports for invalid result');
    }
  }
  async function record(result) {
    assert(box(result), result + ': working exists');
    box(result).querySelector('.calc-work-json').click();
    return JSON.parse(await downloads.at(-1).text());
  }
  // Exercise legacy handlers before the DDM UI replaces their DOM.
  fields({ coordLat: 1e308, coordLon: 0 }); click('calcCoords', 'resCoords', false);
  fields({ navLat1: 0, navLon1: 0, navLat2: 0, navLon2: 1 }); click('calcBearing', 'resBearing', true);
  // At the south pole the Mercator log ratio is 0/0; the rhumb course is NaN.
  fields({ gcLat1: -90, gcLon1: 0, gcLat2: -90, gcLon2: 1 }); click('calcGcRhumb', 'resGcRhumb', false);
  w.eval(read('ui-v854.js')); await flush();
  // Exact antipodes (8N 1E to 8S 179W). The old local copy here was unclamped (q rounded to 1.0000000000000002,
  // so sqrt(1-q) was NaN and the result was refused). It now uses the shared navigation-math.js distance,
  // which clamps, like the main calculator: distance is pi*R = 10807.283 NM and every initial course reaches B.
  fields({ navALatDeg: 8, navALatMin: 0, navALatHem: 'N', navALonDeg: 1, navALonMin: 0, navALonHem: 'E', navBLatDeg: 8, navBLatMin: 0, navBLatHem: 'S', navBLonDeg: 179, navBLonMin: 0, navBLonHem: 'W' });
  click('calcBearing855', 'resBearing855', true);
  assert.match(el('resBearing855').textContent, /10807.283 NM/, 'antipodal distance is pi*R');
  assert.match(el('resBearing855').textContent, /08° 0.00000′ S · 179° 0.00000′ W/, 'antipodal destination is B');
  // Review regression: 82N 0E to the North Pole is a valid 480.324 NM leg (the shared destination clamps asin).
  fields({ navALatDeg: 82, navALatMin: 0, navALatHem: 'N', navALonDeg: 0, navALonMin: 0, navALonHem: 'E', navBLatDeg: 90, navBLatMin: 0, navBLatHem: 'N', navBLonDeg: 0, navBLonMin: 0, navBLonHem: 'E' });
  click('calcBearing855', 'resBearing855', true);
  assert.match(el('resBearing855').textContent, /480.324 NM/, '82N to the pole is 480.324 NM (8 deg x 60.04 NM/deg on R = 3440.065 NM)');
  // Review regression: fractional degrees plus minutes beyond 90 deg / 180 deg are refused, not thrown.
  for (const over of [{ navALatDeg: 89.5, navALatMin: 59 }, { navALatDeg: 82, navALatMin: 0, navALonDeg: 179.5, navALonMin: 59 }]) {
    fields(over);
    click('calcBearing855', 'resBearing855', false, /Check coordinate inputs./);
  }
  // Coordinate conversion's supported domain bounds every derived number.
  fields({ coordLatDeg: 90, coordLatMin: 0, coordLatHem: 'N', coordLonDeg: 180, coordLonMin: 0, coordLonHem: 'E' });
  click('calcCoords855', 'resCoords855', true);
  assert.equal((await record('resCoords855')).outputs.longitudeDecimal.value, 180);
  fields({ coordLatDeg: 1e308 }); click('calcCoords855', 'resCoords855', false, /Check coordinate inputs/);

  const cases = [
    ['calcEta', 'resEta', { etaDist: 1, etaStw: 1e308, etaCur: 1e308 }],
    ['calcEta', 'resEta', { etaDist: 1e307, etaStw: 1, etaCur: 0 }], // minutes overflow
    ['calcWindComp', 'resWindComp', { windCourse: -5e307, windDir: 5e307, windSpeed: 1 }], // relative degrees overflow in working
    ['calcSetDrift', 'resSetDrift', { sdCourse: 0, sdStw: 1e308, sdSet: 0, sdDrift: 1e308 }],
    ['calcTrueWind', 'resTrueWind', { twCourse: 0, twShip: 1e308, twRel: 180, twAws: 1e308 }],
    ['calcEncounter', 'resEncounter', { weCourse: 0, weSpeed: 1, weFrom: 0, wePeriod: 1e-200 }], // wave number overflow, period itself would look finite
    ['calcConsumption', 'resConsumption', { consDate: '2026-11-17', consMode: 'direct', consDirect: 1e308, consUnit: 'm3', consDensity: 840 }],
    ['calcConsumption', 'resConsumption', { consDirect: 1, consHours: 1e-308 }], // volume/mass finite, hourly rate overflows
    ['calcRob', 'resRob', { rob: 1e308, robDay: 0.5, robRes: 0 }],
    ['calcFuelDensity', 'resFuelDensity', { fuelVol: 1e308, fuelDensity: 840, fuelTemp: 15, fuelRef: 15, fuelAlpha: 0 }],
    ['calcFuelDensity', 'resFuelDensity', { fuelVol: 1, fuelDensity: 840, fuelTemp: 1e308, fuelRef: -1e308, fuelAlpha: 1 }], // finite headline, nonfinite expansion step
    ['calcTransfer', 'resTransfer', { tankCap: 1e308, tankNow: 1e308, tankMove: 1e308, tankRate: 1 }],
    ['calcBlend', 'resBlend', { blendVA: 1e308, blendDA: 840, blendSA: 1, blendVB: 1, blendDB: 840, blendSB: 1 }],
    ['calcFuelUrea', 'resFuelUrea', { fuMode: 'v2m', fuAmount: 1e308, fuDensity: 840 }],
    ['calcFuelUrea', 'resFuelUrea', { fuMode: 'm2v', fuAmount: 1e302, fuDensity: 0.001 }], // m3 finite, L export overflows
    ['calcAnchor', 'resAnchor', { anchorChain: 1e200, anchorDepth: 1e200, anchorLoa: 10 }], // infinity - infinity
    ['calcAirDraft', 'resAirDraft', { airPublished: 1e308, airWater: -1e308, airDraft: 1, airMargin: 1 }],
    ['calcHyd', 'resHyd', { hydMode: 'hyd', hydP: 1e308, hydQ: 2 }],
    ['calcAffinity', 'resAffinity', { pumpN1: 1e-200, pumpN2: 1e200, pumpQ1: 0, pumpH1: 0, pumpW1: 0 }],
    ['calcPipe', 'resPipe', { pipeQ: 1, pipeD: 1e-200 }], // area underflows to zero
    ['calcFlowTime', 'resFlowTime', { flowMode: 'time', flowVol: 1e308, flowRate: 0.5 }],
    ['calcFlowTime', 'resFlowTime', { flowMode: 'flow', flowVol: 1e308, flowHours: 0.5 }],
    ['calcFlowTime', 'resFlowTime', { flowMode: 'volume', flowRate: 1e308, flowHours: 2 }],
    ['calcPressureHead', 'resPressureHead', { phMode: 'bar-head', phValue: 1e308 }],
    ['calcPressureHead', 'resPressureHead', { phMode: 'head-bar', phValue: 1e308 }],
    ['calcGenMargin', 'resGenMargin', { genCap: 1, genLoad: 1e308 }],
    ['calcChemDose', 'resChemDose', { chemVol: 1e308, chemRate: 2, chemUnit: 'lm3' }],
    ['calcChemDose', 'resChemDose', { chemVol: 1e306, chemRate: 1, chemUnit: 'lm3' }], // L finite, mL export overflows
    ['calcVD', 'resVD', { vdA: 1e308, vdL: 1000, vdR: 2, vdV: 400 }],
    ['calcBat', 'resBat', { batKwh: 1e308, batSoc: 100, batMin: 0, batLoad: 1, batEff: 100 }],
    ['calcMotor', 'resMotor', { motKw: 1e308, motV: 400, motPf: 0.8, motEff: 90 }],
    ['calcMotor', 'resMotor', { motKw: 1, motV: 1e308, motPf: 1, motEff: 1e-308 }], // A finite, p/eff export overflows
    ['calcPfCorr', 'resPfCorr', { pfKw: 1e308, pfNow: 0.1, pfTarget: 1 }],
    ['calcTransformer', 'resTransformer', { trKva: 1e308, trV1: 400, trV2: 230 }],
    ['calcImbalance', 'resImbalance', { l1: 1e308, l2: 1e308, l3: 1e308 }],
    ['calcDST', 'resDST', { qDist: 1e308, qSpeed: 0.5 }],
    // Existing range checks remain in force as well.
    ['calc3p', 'res3p', { elV: 1e308, elA: 1e308, elPf: 1 }, /Power calculation exceeds/],
    ['calcUnit', 'resUnit', { unitVal: 1e308, unitType: 'nm-m' }, /Conversion exceeds/],
    ['calcCompass', 'resCompass', { compMode: 'gyro', compC: 1e308, compGyroError: 1e308 }, /Correction exceeds/],
    ['calcFwa', 'resFwa', { fwaDisp: 1e308, fwaTpc: 1e-308, fwaDensity: 1010, fwaDensityUnit: 'kg-m3' }, /Check displacement/],
    ['calcTankInterp', 'resTankInterp', { tankLowX: -1e308, tankLowV: 0, tankMeasure: 0, tankHighX: 1e308, tankHighV: 1 }, /Interpolation exceeds/]
  ];
  // Do not set unsupported select values silently; every fixture is executable.
  for (const [button, result, values, message] of cases) { fields(values); click(button, result, false, message); }
  fields({ scDist: 1, scFuel: 4, scRef: 1e-200 }); rows('scSpeedRows', 'simple-row', ['sc-speed'], [[1e200]]);
  click('calcScenarios', 'resScenarios', false);
  fields({ endRob: 1e308, endReserve: 0 }); rows('endScenarioRows', 'end-row', ['end-rate'], [[0.5]]);
  click('calcEndCompare', 'resEndCompare', false);
  rows('bunkRows', 'bunk-row', ['bunk-date', 'bunk-vol', 'bunk-dens'], [['2026-11-17', 1e308, 840]]);
  click('calcBunkOverview', 'resBunkOverview', false);
  rows('loRows', 'lo-row', ['lo-date', 'lo-hours', 'lo-liters'], [['2026-11-16', 0, 0], ['2026-11-17', 1, 1e308]]);
  click('calcLoTrend', 'resLoTrend', false);
  fields({ noxMode: 'power', noxUreaMode: 'none' }); rows('noxRows', 'nox-row', ['nox-name', 'nox-a', 'nox-b', 'nox-factor'], [['Engine', 1e308, 2, 1]]);
  click('calcNox', 'resNox', false);
  // Weighted factor can overflow even when kg and activity remain finite.
  rows('noxRows', 'nox-row', ['nox-name', 'nox-a', 'nox-b', 'nox-factor'], [['Engine A', 1e305, 1, 1000], ['Engine B', 1e305, 1, 1000]]);
  click('calcNox', 'resNox', false);
  fields({ noxMode: 'fuel' }); rows('noxRows', 'nox-row', ['nox-name', 'nox-a', 'nox-b', 'nox-factor'], [['Engine', 1e308, 0, 2]]);
  click('calcNox', 'resNox', false);
  fields({ noxMode: 'power', noxUreaMode: 'total', noxUreaUsed: 1 });
  rows('noxRows', 'nox-row', ['nox-name', 'nox-a', 'nox-b', 'nox-factor'], [['Engine', 1e-320, 1, 0]]);
  click('calcNox', 'resNox', false); // MWh denominator underflows to zero
  fields({ pSpeed: 1e-308, pFuel: 4 }); el('saveProfile').click();
  for (const [button, result] of [['calcRouteFuel', 'resRouteFuel'], ['fuelRouteBtn', 'fuelRouteRes']]) click(button, result, false);

  // Deliberate undefined directions, weighted density, and calendar rate.
  for (const [button, result, values, key] of [
    ['calcSetDrift', 'resSetDrift', { sdCourse: 0, sdStw: 0, sdSet: 0, sdDrift: 0 }, 'courseOverGround'],
    ['calcTrueWind', 'resTrueWind', { twCourse: 0, twShip: 0, twRel: 0, twAws: 0 }, 'trueWindFrom']
  ]) {
    fields(values); click(button, result, true);
    assert.equal((await record(result)).outputs[key].value, null);
    assert.match(el(result).textContent, /undefined/);
  }
  rows('bunkRows', 'bunk-row', ['bunk-date', 'bunk-vol', 'bunk-dens'], [['2026-11-17', 0, 840]]);
  click('calcBunkOverview', 'resBunkOverview', true);
  assert.equal((await record('resBunkOverview')).outputs.weightedDensity.value, null);
  rows('loRows', 'lo-row', ['lo-date', 'lo-hours', 'lo-liters'], [['2026-11-17', 0, 0], ['2026-11-17', 10, 1]]);
  click('calcLoTrend', 'resLoTrend', true);
  assert.equal((await record('resLoTrend')).outputs.calendarRate.value, null);
  // An invalid recalculation must remove a previous valid working/export panel.
  fields({ sdStw: 1e308, sdDrift: 1e308 }); click('calcSetDrift', 'resSetDrift', false);
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', invalidRuns, validRuns, scope: 'Finite-input overflow/underflow, one invalid event without exports, and intentional null outcomes through real DOM handlers.' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
