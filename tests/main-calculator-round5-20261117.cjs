// Actual DOM handlers and downloaded JSON, with literal dimensional hand references.
// Run with jsdom@26.1.0 on NODE_PATH; no live providers or replaced calculator math.
// Numeric export tolerance is 1e-10 absolute; window membership and text are exact.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let dom;

// Parse the two leading call arguments, including the compass ternary and the
// optional MT_SET_WORK bridge; fail on a new, unrecognised tool expression.
function toolIds(source) {
  const ids = new Set();
  const calls = /\b(?:setWork|MT_SET_WORK)(?:\s*\?\.)?\s*\(\s*(['"])[^'"\r\n]+\1\s*,\s*([^,]+),/g;
  for (const call of source.matchAll(calls)) {
    const expression = call[2].trim();
    const literal = expression.match(/^(['"])([a-z0-9-]+)\1$/);
    const conditional = expression.match(/^\w+\s*\?\s*(['"])([a-z0-9-]+)\1\s*:\s*(['"])([a-z0-9-]+)\3$/);
    assert(literal || conditional, 'Unrecognised setWork tool argument: ' + expression);
    if (literal) ids.add(literal[2]);
    else { ids.add(conditional[2]); ids.add(conditional[4]); }
  }
  return ids;
}

(async () => {
  // Parser fixtures prevent the optional bridge or either conditional branch
  // from silently disappearing from the coverage check.
  assert.deepEqual([...toolIds("setWork('a','one',{}); window.MT_SET_WORK?.('b',gyro?'two':'three',{});")], ['one', 'two', 'three']);
  assert.throws(() => toolIds("setWork('a',unknownTool,{});"), /Unrecognised/);
  const appIds = toolIds(read('app.js')), uiIds = toolIds(read('ui-v854.js'));
  assert(appIds.size > 40, 'Main calls found');
  assert.deepEqual([...uiIds].sort(), ['bearing-distance', 'coordinate-conversion']);
  const ids = new Set([...appIds, ...uiIds]);

  dom = new JSDOM(read('index.html'), { url: 'https://round5.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tasks = [], errors = [], downloads = [], results = new Map();
  if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
  w.eval(read('calc-references-20261117.js'));
  const references = w.MT_CALC_REFERENCES;
  assert(Object.isFrozen(references), 'Reference map is frozen');
  assert.deepEqual(Object.keys(references).sort(), [...ids].sort(), 'Exactly every source tool ID is documented');
  let referenceFiles = 0;
  for (const id of ids) {
    assert.deepEqual(Object.keys(references[id]).sort(), ['basis', 'range', 'tolerance']);
    for (const field of ['basis', 'range', 'tolerance']) {
      const sentence = references[id][field];
      assert.equal(typeof sentence, 'string', id + ': ' + field);
      assert(sentence.trim().length > 0 && /\.$/.test(sentence), id + ': nonempty sentence for ' + field);
      for (const match of sentence.matchAll(/tests\/[A-Za-z0-9_./-]+\.(?:cjs|mjs|js|py)/g)) {
        assert(fs.statSync(path.join(root, match[0])).isFile(), id + ': existing reference file ' + match[0]);
        referenceFiles++;
      }
    }
    assert.match(references[id].tolerance, /tests\/[A-Za-z0-9_./-]+\.(?:cjs|mjs|js|py)/, id + ': named independent test');
  }

  w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
  w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
  w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
  w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.navigator, 'onLine', { value: false });
  w.fetch = async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' });
  w.Blob = Blob;
  w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:round5-' + downloads.length; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  // Two one-degree equatorial legs across the date line, not a stubbed distance.
  const route = [{ lat: 0, lon: 179 }, { lat: 0, lon: -180 }, { lat: 0, lon: -179 }];
  w.localStorage.setItem('mt.route', JSON.stringify(route));
  w.localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 10, fuelDay: 4, corridor: 5 }));
  d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['engineering', 'weather', 'navigation', 'fuel', 'profile']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0, 'Short UI work settled');
  }
  await flush();
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const box = id => { const node = d.querySelector(`.calc-work[data-for="${id}"]`); assert(node, 'Working for ' + id); return node; };
  function fields(values) {
    for (const [id, value] of Object.entries(values)) {
      const node = el(id); node.value = String(value);
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
  let numericReferences = 0, reconstructions = 0;
  function near(actual, expected, label) {
    numericReferences++;
    assert(Number.isFinite(actual), label + ': finite value');
    assert(Math.abs(actual - expected) <= 1e-10, `${label}: ${actual} != ${expected} within 1e-10`);
  }
  function click(button, result) {
    results.delete(result); el(button).click();
    assert.equal(results.get(result), true, button + ': ' + el(result).textContent);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/);
  }
  async function record(id) {
    const count = downloads.length; box(id).querySelector('.calc-work-json').click();
    assert.equal(downloads.length, count + 1, id + ': actual JSON download');
    return JSON.parse(await downloads.at(-1).text());
  }
  const value = (r, section, key, unit) => { assert.equal(r[section][key].unit, unit, key + ': unchanged unit'); return r[section][key].value; };

  function reconstructNox(r, expected) {
    reconstructions++;
    assert.equal(r.tool, 'nox-period');
    const mode = value(r, 'inputs', 'mode', '');
    const sources = value(r, 'inputs', 'sourceOperands', '');
    assert.equal(value(r, 'inputs', 'sources', ''), sources.length, 'Existing source count preserved');
    assert.deepEqual(sources, expected.operands, 'Every operand and name as entered');
    assert.deepEqual(value(r, 'outputs', 'sourceNoxKg', 'kg'), expected.kg, 'Independent per-source kg references');
    let total = 0, activity = 0;
    sources.forEach((source, i) => {
      const kg = mode === 'power' ? source.hours * source.powerKw * source.factorGPerKWh / 1000 : source.fuelTonnes * source.factorKgPerTonne;
      near(kg, expected.kg[i], 'Reconstructed source ' + i);
      total += kg;
      activity += mode === 'power' ? source.hours * source.powerKw / 1000 : source.fuelTonnes;
    });
    near(total, expected.total, 'Literal NOx total');
    near(total, value(r, 'outputs', 'noxMass', 'kg'), 'Reconstructed exported NOx total');
    near(activity, expected.activity, 'Literal activity');
    near(activity, value(r, 'outputs', 'activityBasis', mode === 'power' ? 'MWh' : 't'), 'Reconstructed exported activity');
    const ureaMode = value(r, 'inputs', 'ureaMode', '');
    assert.equal(ureaMode, expected.ureaMode);
    if (ureaMode === 'none') {
      for (const key of ['ureaEntered', 'ureaOpening', 'ureaReceived', 'ureaClosing']) assert.equal(r.inputs[key], undefined, 'Inactive ' + key);
      assert.equal(r.outputs.ureaUsed, undefined);
    } else {
      const used = ureaMode === 'balance'
        ? value(r, 'inputs', 'ureaOpening', 'L') + value(r, 'inputs', 'ureaReceived', 'L') - value(r, 'inputs', 'ureaClosing', 'L')
        : value(r, 'inputs', 'ureaEntered', 'L');
      near(used, expected.urea, 'Literal urea use');
      near(used, value(r, 'outputs', 'ureaUsed', 'L'), 'Reconstructed exported urea');
      if (ureaMode === 'balance') assert.equal(r.inputs.ureaEntered, undefined);
      else for (const key of ['ureaOpening', 'ureaReceived', 'ureaClosing']) assert.equal(r.inputs[key], undefined);
    }
  }
  const noxCases = [
    // h*kW gives kWh; multiplying by g/kWh and dividing by 1000 gives kg.
    // 10.5*100*4.125/1000=4.33125 kg; 2*250*8.125/1000=4.0625 kg;
    // total=8.39375 kg, retaining more precision than the displayed steps.
    // Activity=(1050+500)/1000=1.55 MWh; urea=100.5+20.25-70.75=50 L.
    { mode: 'power', rows: [['  DG, "one"  ', '10,5', 100, '4,125'], ['Auxiliary', 2, 250, '8,125']],
      fields: { noxUreaMode: 'balance', noxUreaStart: '100,5', noxUreaReceived: '20,25', noxUreaEnd: '70,75' },
      operands: [{ name: '  DG, "one"  ', hours: 10.5, powerKw: 100, factorGPerKWh: 4.125 }, { name: 'Auxiliary', hours: 2, powerKw: 250, factorGPerKWh: 8.125 }], kg: [4.33125, 4.0625], total: 8.39375, activity: 1.55, ureaMode: 'balance', urea: 50 },
    // t*kg/t gives kg: 2.5*40=100; 3*60=180; total=280 kg, fuel=5.5 t.
    // Direct urea remains the entered 100.25 L; no abatement is inferred.
    { mode: 'fuel', rows: [[' Fuel, A ', '2,5', '', 40], ['Fuel B', 3, '', 60]], fields: { noxUreaMode: 'total', noxUreaUsed: '100,25' },
      operands: [{ name: ' Fuel, A ', fuelTonnes: 2.5, factorKgPerTonne: 40 }, { name: 'Fuel B', fuelTonnes: 3, factorKgPerTonne: 60 }], kg: [100, 180], total: 280, activity: 5.5, ureaMode: 'total', urea: 100.25 },
    // Zero activity and zero factors are accepted by the current handler.
    // Both source kg and activity are exactly zero; urea is not tracked.
    { mode: 'power', rows: [['Idle', 0, 100, 4], ['Zero factor', 1, 0, 0]], fields: { noxUreaMode: 'none' },
      operands: [{ name: 'Idle', hours: 0, powerKw: 100, factorGPerKWh: 4 }, { name: 'Zero factor', hours: 1, powerKw: 0, factorGPerKWh: 0 }], kg: [0, 0], total: 0, activity: 0, ureaMode: 'none' }
  ];
  for (const c of noxCases) {
    fields({ noxMode: c.mode, ...c.fields });
    rows('noxRows', 'nox-row', ['nox-name', 'nox-a', 'nox-b', 'nox-factor'], c.rows);
    click('calcNox', 'resNox'); reconstructNox(await record('resNox'), c);
  }

  function reconstructWeather(r, expected) {
    reconstructions++;
    assert.equal(r.tool, 'weather-window');
    const forecast = value(r, 'inputs', 'forecastRows', ''), limits = value(r, 'inputs', 'limits', '');
    assert.deepEqual(forecast, expected.forecast, 'Parsed forecast values retain entered row order');
    assert.deepEqual(value(r, 'inputs', 'forecastRowsEntered', ''), expected.entered, 'Original forecast strings including decimal commas');
    assert.deepEqual(limits, expected.limits, 'All applied limits, including a hidden current threshold');
    assert.equal(value(r, 'inputs', 'maxWaveHeight', 'm'), limits.hs);
    assert.equal(value(r, 'inputs', 'maxWind', 'kn'), limits.wind);
    if (limits.current < 999) assert.equal(value(r, 'inputs', 'maxCurrent', 'kn'), limits.current);
    else assert.equal(r.inputs.maxCurrent, undefined, 'Existing conditional key preserved');
    const groups = []; let active = [];
    for (const row of forecast) {
      if (row.time && row.hs <= limits.hs && row.wind <= limits.wind && row.current <= limits.current) active.push(row.time);
      else if (active.length) { groups.push(active); active = []; }
    }
    if (active.length) groups.push(active);
    assert.deepEqual(groups, expected.groups, 'Literal hand window membership and times');
    assert.equal(value(r, 'outputs', 'windows', ''), expected.groups.length);
    assert.equal(value(r, 'outputs', 'rowsWithinLimits', ''), expected.matching);
    assert.equal(groups.reduce((sum, group) => sum + group.length, 0), expected.matching);
  }
  const weatherCases = [
    // Inclusive limits (2 m,20 kn,1 kn): first two and last two pass.
    // Middle rows fail Hs, wind and current respectively: exactly two runs,
    // 22:00-23:00 and 03:00-04:00, four rows, with order crossing midnight.
    { limits: { hs: 2, wind: 20, current: 1 }, raw: [['22:00', '2,0', '20', '1,0'], ['23:00', '1,5', '15', '0,8'], ['00:00', '2,001', '10', '0,5'], ['01:00', '1', '20,1', '0,5'], ['02:00', '1', '10', '1,01'], ['03:00', '1,5', '15', '0,8'], ['04:00', '1', '10', '0,5']],
      forecast: [{ time: '22:00', hs: 2, wind: 20, current: 1 }, { time: '23:00', hs: 1.5, wind: 15, current: 0.8 }, { time: '00:00', hs: 2.001, wind: 10, current: 0.5 }, { time: '01:00', hs: 1, wind: 20.1, current: 0.5 }, { time: '02:00', hs: 1, wind: 10, current: 1.01 }, { time: '03:00', hs: 1.5, wind: 15, current: 0.8 }, { time: '04:00', hs: 1, wind: 10, current: 0.5 }],
      groups: [['22:00', '23:00'], ['03:00', '04:00']], matching: 4 },
    // Current limit 999 is omitted from the old maxCurrent key but is applied:
    // 999 passes, 1000 fails, then 0 passes; two singleton runs, two rows.
    { limits: { hs: 2, wind: 20, current: 999 }, raw: [['08:00', '1', '10', '999'], ['09:00', '1', '10', '1000'], ['10:00', '1', '10', '0']],
      forecast: [{ time: '08:00', hs: 1, wind: 10, current: 999 }, { time: '09:00', hs: 1, wind: 10, current: 1000 }, { time: '10:00', hs: 1, wind: 10, current: 0 }], groups: [['08:00'], ['10:00']], matching: 2 },
    // Zero thresholds accept all-zero weather exactly: one row, one run.
    { limits: { hs: 0, wind: 0, current: 0 }, raw: [['08:00', '0', '0', '0']], forecast: [{ time: '08:00', hs: 0, wind: 0, current: 0 }], groups: [['08:00']], matching: 1 },
    // Hs 0.1 exceeds zero: no matching row or window.
    { limits: { hs: 0, wind: 20, current: 1 }, raw: [['08:00', '0,1', '0', '0']], forecast: [{ time: '08:00', hs: 0.1, wind: 0, current: 0 }], groups: [], matching: 0 },
    // A blank time splits an otherwise qualifying run; it remains in exports.
    { limits: { hs: 2, wind: 20, current: 1 }, raw: [['08:00', '1', '10', '0'], ['', '1', '10', '0'], ['10:00', '1', '10', '0']],
      forecast: [{ time: '08:00', hs: 1, wind: 10, current: 0 }, { time: '', hs: 1, wind: 10, current: 0 }, { time: '10:00', hs: 1, wind: 10, current: 0 }], groups: [['08:00'], ['10:00']], matching: 2 }
  ];
  for (const c of weatherCases) {
    fields({ wwHs: c.limits.hs, wwWind: c.limits.wind, wwCur: c.limits.current });
    rows('windowRows', 'weather-row', ['ww-time', 'ww-hs', 'ww-wind', 'ww-current'], c.raw);
    c.entered = c.raw.map(([time, hs, wind, current]) => ({ time, hs, wind, current }));
    click('findWindow', 'wwResult'); reconstructWeather(await record('wwResult'), c);
  }

  // Independent arc geometry: two equatorial degrees on radius 3440.065 NM
  // give 120.080921465237 NM; /10 = 12.008092146524 h;
  // *4/24 = 2.001348691087 m3. At zero consumption the fuel is exactly zero.
  // Valid coordinates, positive distance/speed, nonnegative consumption.
  for (const [rate, handFuel] of [[4, 2.001348691087], [0, 0]]) {
    fields({ pSpeed: '10,0', pFuel: rate }); el('saveProfile').click();
    const records = [];
    for (const [button, id] of [['calcRouteFuel', 'resRouteFuel'], ['fuelRouteBtn', 'fuelRouteRes']]) {
      click(button, id); const r = await record(id); records.push(r); reconstructions++;
      assert.equal(r.tool, 'route-fuel');
      const positions = value(r, 'inputs', 'routeCoordinates', '\u00b0');
      assert.deepEqual(positions, route, 'Actual waypoint coordinates, signs and order');
      // Along the equator an arc is radius times longitude angle, independently
      // of the application haversine implementation; the date line adds no turn.
      let arcDegrees = 0;
      for (let i = 1; i < positions.length; i++) {
        assert.equal(positions[i - 1].lat, 0); assert.equal(positions[i].lat, 0);
        const longitudeDifference = Math.abs(positions[i].lon - positions[i - 1].lon);
        arcDegrees += Math.min(longitudeDifference, 360 - longitudeDifference);
      }
      assert.equal(arcDegrees, 2, 'Literal two-degree hand route');
      const distance = arcDegrees * 3440.065 * Math.PI / 180;
      near(distance, 120.080921465237, 'Hand equatorial arc');
      near(value(r, 'inputs', 'routeDistance', 'NM'), distance, 'Reconstructed route distance');
      assert.equal(value(r, 'inputs', 'serviceSpeed', 'kn'), 10);
      assert.equal(value(r, 'inputs', 'dailyConsumption', 'm\u00b3/day'), rate);
      const hours = distance / r.inputs.serviceSpeed.value, fuel = hours / 24 * r.inputs.dailyConsumption.value;
      near(hours, 12.008092146524, 'Literal passage hours');
      near(fuel, handFuel, 'Literal route fuel');
      near(value(r, 'outputs', 'passageTime', 'h'), hours, 'Reconstructed passage time');
      near(value(r, 'outputs', 'fuel', 'm\u00b3'), fuel, 'Reconstructed exported fuel');
    }
    assert.deepEqual(records[0].inputs, records[1].inputs, 'Both route buttons export identical operands');
    assert.deepEqual(records[0].outputs, records[1].outputs);
  }

  // Locale changes must preserve raw source names, numeric operands and row text.
  const before = new Map();
  for (const id of ['resNox', 'wwResult', 'resRouteFuel', 'fuelRouteRes']) before.set(id, await record(id));
  w.MT_I18N = { locale: 'nb', t: text => text };
  w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
  for (const [id, previous] of before) {
    const after = await record(id);
    assert.deepEqual(after.inputs, previous.inputs, id + ': stable machine inputs across locale');
    assert.deepEqual(after.outputs, previous.outputs, id + ': stable machine outputs across locale');
  }
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', tools: ids.size, referenceFiles, reconstructions, numericReferences, scope: 'Source coverage and existing reference files; actual JSON downloads reconstruct NOx, urea, weather row windows and both route fuel handlers from literal hand cases; no device, layout or live-provider acceptance.' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
