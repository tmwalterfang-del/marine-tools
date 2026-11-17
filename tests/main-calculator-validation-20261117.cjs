// Execute the owning handlers, with explicit reference outcomes rather than
// duplicating their arithmetic. No network, browser or third-party dependency.
// Valid ranges: finite geographic coordinates; positive speeds/RPM/periods;
// non-negative quantities; complete rows; strictly increasing running hours.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const lines = source.split(/\r?\n/);
const plain = (parts, ...values) => parts.reduce((s, part, i) => s + (i ? values[i - 1] : '') + part, '');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS', name); }
function harness() {
  const nodes = new Map(), lists = {}, state = { route: [{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }], profile: { serviceSpeed: 10, fuelDay: 4, corridor: 5 } };
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { value: '', events: [], innerHTML: '', dispatchEvent(e) { this.events.push(e); }, click() { this.onclick(); } });
    return nodes.get(selector);
  }
  const context = vm.createContext({
    Number, Math, Date, state, globalThis: {},
    $: (s, r) => r ? r.fields[s] : node(s),
    $$: (s, r) => (r?.lists || lists)[s] || [],
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    mainText: plain, mainHTML: plain, mainNumber: (n, p) => n.toFixed(p), mainJoin: (items, glue) => items.join(glue), mainPlural: (n, one, many) => n === 1 ? one : many,
    setRichRes: (id, html) => { node('#' + id).innerHTML = html; },
    rad: d => d * Math.PI / 180, deg: r => r * 180 / Math.PI,
    formatHours: h => `${h} h`, routeDistance: () => 120,
    distToRoute: () => 0, hav: () => 60.04046, bearing: () => 90, rhumb: () => ({ distance: 60.04046, bearing: 90 })
  });
  // Use the actual comma-aware parser and blank guard, plus the shared result path.
  const parser = fs.readFileSync(path.join(root, 'product-ux-20261031.js'), 'utf8').split(/\r?\n/);
  vm.runInContext(parser.find(s => s.startsWith('const DECIMAL=')), context);
  vm.runInContext(parser.find(s => s.startsWith('root.MT_PARSE_NUMBER=')).replace('root.MT_PARSE_NUMBER=', 'globalThis.MT_PARSE_NUMBER='), context);
  for (const start of ['const inputNumber=', 'function setInvalidRes(', 'function setRes(']) vm.runInContext(lines.find(s => s.startsWith(start)), context);
  // The Show working panel is covered by main-calculator-working-browser-20261117.cjs; stub it here.
  vm.runInContext('function setWork(){}', context);
  function install(id) {
    const line = lines.find(s => s.trimStart().startsWith(`$('#${id}').onclick=`));
    assert(line, 'missing handler ' + id);
    vm.runInContext(line, context);
  }
  function fields(values) { for (const [id, value] of Object.entries(values)) node(id).value = String(value); }
  function rows(name, selector, values) {
    const container = node('#' + name);
    context[name] = container;
    container.lists = { [selector]: values.map(value => typeof value === 'object' ? { fields: Object.fromEntries(Object.entries(value).map(([s, v]) => [s, { value: String(v) }])) } : { value: String(value) }) };
    return container.lists[selector];
  }
  function result(id, valid) {
    const n = node('#' + id);
    assert.equal(n.events.at(-1)?.detail.valid, valid, `${id}: ${n.innerHTML}`);
    if (!valid) assert.match(n.className, /caution/);
    assert.doesNotMatch(n.innerHTML, /NaN|Infinity/);
    return n.innerHTML;
  }
  return { node, context, state, install, fields, rows, result, run: s => vm.runInContext(s, context) };
}

check('nearest position: blank/out-of-range is invalid, valid zero coordinate is accepted', () => {
  const h = harness(); h.install('calcNearest');
  h.fields({ '#nearLat': 0, '#nearLon': 0 }); h.node('#calcNearest').click(); assert.match(h.result('resNearest', true), /0.00 NM/);
  for (const [lat, lon] of [['', 0], [0, ''], [91, 0], [0, 181]]) { h.fields({ '#nearLat': lat, '#nearLon': lon }); h.node('#calcNearest').click(); h.result('resNearest', false); }
});
check('both GC positions reject blank decimals after editor invalidation', () => {
  const h = harness(); h.install('calcGcRhumb');
  h.fields({ '#gcLat1': 0, '#gcLon1': 0, '#gcLat2': 0, '#gcLon2': 1 });
  for (const id of ['#gcLat1', '#gcLon1', '#gcLat2', '#gcLon2']) { const old = h.node(id).value; h.node(id).value = ''; h.node('#calcGcRhumb').click(); h.result('resGcRhumb', false); h.node(id).value = old; }
});
check('zero vectors and opposing 5 kn vectors have undefined COG; eastward 5 kn has 90 degrees', () => {
  const h = harness(); h.install('calcSetDrift');
  for (const [stw, drift, set] of [[0, 0, 0], [5, 5, 270]]) { h.fields({ '#sdCourse': 90, '#sdStw': stw, '#sdSet': set, '#sdDrift': drift }); h.node('#calcSetDrift').click(); assert.match(h.result('resSetDrift', true), /COG undefined · 0.00 kn SOG/); }
  h.fields({ '#sdDrift': 0 }); h.node('#calcSetDrift').click(); assert.match(h.result('resSetDrift', true), /90.0°T COG · 5.00 kn SOG/);
});
check('120 NM / 10 kn = 12 h; 4 m3/day * 12/24 = 2 m3; zero/blank speed invalid in both helpers', () => {
  const h = harness(); h.run(lines.find(s => s.startsWith('function updateRouteFuel('))); h.install('fuelRouteBtn');
  for (const [panel, run] of [['resRouteFuel', () => h.run('updateRouteFuel()')], ['fuelRouteRes', () => h.node('#fuelRouteBtn').click()]]) {
    h.state.profile.serviceSpeed = 10; run();
    assert.match(h.result(panel, true), /2.00 m³/);
  }
  assert.match(h.result('resRouteFuel', true), /12 h/);
  for (const speed of [0, '', ' ', -1, 'bad', Infinity, null, undefined]) {
    h.state.profile.serviceSpeed = speed; h.run('updateRouteFuel()'); h.result('resRouteFuel', false); h.node('#fuelRouteBtn').click(); h.result('fuelRouteRes', false);
  }
  h.state.profile.serviceSpeed = '10,0'; h.run('updateRouteFuel()'); assert.match(h.result('resRouteFuel', true), /2.00 m³/);
});
check('passage scenarios: every active speed required; 120 NM at 10 kn and 4 m3/day = 2 m3', () => {
  const h = harness(), rows = h.rows('scRows', '.sc-speed', [10, '']); h.install('calcScenarios');
  h.fields({ '#scDist': 120, '#scFuel': 4, '#scRef': 10 });
  for (const speed of ['', 0, -2, 'bad']) { rows[1].value = String(speed); h.node('#calcScenarios').click(); h.result('resScenarios', false); }
  rows[1].value = '10,0'; h.node('#calcScenarios').click(); assert.match(h.result('resScenarios', true), /2.00 m³/);
});
check('endurance: incomplete scenario invalid; 100 m3 less 20% / 4 m3/day = 20 days', () => {
  const h = harness(), rows = h.rows('endRows', '.end-rate', [4, '']); h.install('calcEndCompare'); h.fields({ '#endRob': 100, '#endReserve': 20 });
  for (const rate of ['', 0, -1, 'bad']) { rows[1].value = String(rate); h.node('#calcEndCompare').click(); h.result('resEndCompare', false); }
  rows[1].value = '4,0'; h.node('#calcEndCompare').click(); assert.match(h.result('resEndCompare', true), /20.00 days/);
});
check('speed curve: missing/negative/duplicate point invalid; (6,2) to (10,6) gives 4 at 8 kn', () => {
  const h = harness(), rows = h.rows('speedRows', '.speed-row', [{ '.sf-speed': 6, '.sf-cons': 2 }, { '.sf-speed': 10, '.sf-cons': 6 }, { '.sf-speed': '', '.sf-cons': 7 }]);
  h.install('calcSpeedFuel'); h.fields({ '#targetSpeed': 8 }); h.node('#calcSpeedFuel').click(); h.result('resSpeedFuel', false);
  rows.pop(); h.node('#calcSpeedFuel').click(); assert.match(h.result('resSpeedFuel', true), /4.00 m³\/day/);
  rows[1].fields['.sf-speed'].value = '6,0'; h.node('#calcSpeedFuel').click(); assert.match(h.result('resSpeedFuel', false), /unique/);
  rows[1].fields['.sf-speed'].value = '10'; rows[1].fields['.sf-cons'].value = '-1'; h.node('#calcSpeedFuel').click(); h.result('resSpeedFuel', false);
});
check('bunkering: each date/volume/density required; 10*800 + 20*900 = 26 t in 30 m3', () => {
  const h = harness(), rows = h.rows('bunkRows', '.bunk-row', [{ '.bunk-date': '2026-11-01', '.bunk-vol': 10, '.bunk-dens': 800 }, { '.bunk-date': '2026-11-11', '.bunk-vol': 20, '.bunk-dens': 900 }]); h.install('calcBunkOverview');
  h.node('#calcBunkOverview').click(); const out = h.result('resBunkOverview', true); assert.match(out, /30.00 m³ · 26.00 t/); assert.match(out, /866.7 kg\/m³/);
  for (const key of ['.bunk-date', '.bunk-vol', '.bunk-dens']) { const old = rows[1].fields[key].value; rows[1].fields[key].value = ''; h.node('#calcBunkOverview').click(); h.result('resBunkOverview', false); rows[1].fields[key].value = old; }
  rows[1].fields['.bunk-dens'].value = '-1'; h.node('#calcBunkOverview').click(); h.result('resBunkOverview', false);
});
check('affinity: doubling RPM gives 20 m3/h, 16 m, 24 kW from 10,4,3; blank/negative base values invalid', () => {
  const h = harness(); h.install('calcAffinity'); h.fields({ '#pumpN1': 1000, '#pumpN2': 2000, '#pumpQ1': 10, '#pumpH1': 4, '#pumpW1': 3 });
  h.node('#calcAffinity').click(); assert.match(h.result('resAffinity', true), /20.0 m³\/h · 16.0 m head · 24.00 kW/);
  for (const id of ['#pumpN1', '#pumpN2', '#pumpQ1', '#pumpH1', '#pumpW1']) { const old = h.node(id).value; h.node(id).value = ''; h.node('#calcAffinity').click(); h.result('resAffinity', false); h.node(id).value = old; }
  for (const id of ['#pumpQ1', '#pumpH1', '#pumpW1']) { const old = h.node(id).value; h.node(id).value = '-1'; h.node('#calcAffinity').click(); h.result('resAffinity', false); h.node(id).value = old; }
  h.fields({ '#pumpQ1': 0, '#pumpH1': 0, '#pumpW1': 0 }); h.node('#calcAffinity').click(); assert.match(h.result('resAffinity', true), /0.0 m³\/h · 0.0 m head · 0.00 kW/);
});
check('urea: 100 + 20 - 70 = 50 L; each term non-negative and present, closing cannot exceed available', () => {
  const h = harness(); h.rows('noxRows', '.nox-row', [{ '.nox-name': 'DG', '.nox-a': 10, '.nox-b': 100, '.nox-factor': 5 }]);
  h.fields({ '#noxMode': 'power', '#noxUreaMode': 'balance', '#noxUreaStart': 100, '#noxUreaReceived': 20, '#noxUreaEnd': 70 });
  h.run(source.slice(source.indexOf(" $('#calcNox').onclick=()=>{"), source.indexOf('\n };', source.indexOf(" $('#calcNox').onclick=()=>{")) + 4));
  h.node('#calcNox').click(); assert.match(h.result('resNox', true), /Urea solution used: 50.0 L/);
  for (const id of ['#noxUreaStart', '#noxUreaReceived', '#noxUreaEnd']) {
    const old = h.node(id).value;
    for (const value of ['', -1, 'bad']) { h.node(id).value = String(value); h.node('#calcNox').click(); h.result('resNox', false); }
    h.node(id).value = old;
  }
  h.fields({ '#noxUreaEnd': 121 }); h.node('#calcNox').click(); h.result('resNox', false);
});
check('oil trend: 30 L / 200 h = 150 L/1000 h; any zero or decreasing interval invalidates whole result', () => {
  const h = harness(), rows = h.rows('loRows', '.lo-row', [{ '.lo-date': '2026-11-01', '.lo-hours': 1000, '.lo-liters': 0 }, { '.lo-date': '2026-11-02', '.lo-hours': 1100, '.lo-liters': 10 }, { '.lo-date': '2026-11-03', '.lo-hours': 1200, '.lo-liters': 20 }]); h.install('calcLoTrend');
  h.node('#calcLoTrend').click(); assert.match(h.result('resLoTrend', true), /150.00 L\/1000 h overall · 200.00 L\/1000 h latest/);
  for (const hours of [1000, 900]) { rows[1].fields['.lo-hours'].value = String(hours); h.node('#calcLoTrend').click(); assert.match(h.result('resLoTrend', false), /must increase/); }
  rows[1].fields['.lo-hours'].value = '1100'; rows[2].fields['.lo-liters'].value = ''; h.node('#calcLoTrend').click(); h.result('resLoTrend', false);
});
check('weather: blank max Hs invalid; negative forecast Hs never matches; stationary encounter period = 8 s', () => {
  const h = harness(); h.rows('windowRows', '.weather-row', [{ '.ww-time': '08:00', '.ww-hs': 1, '.ww-wind': 10, '.ww-current': 0 }]);
  h.run(lines.find(s => s.startsWith('function findWeatherWindow(')));
  const start = source.indexOf('function calcWaveEncounter(){'); h.run(source.slice(start, source.indexOf('\n}', start) + 2));
  h.install('findWindow'); h.fields({ '#wwHs': 2, '#wwWind': 20, '#wwCur': 1 });
  h.node('#findWindow').click(); assert.match(h.result('wwResult', true), /08:00 → 08:00 \(1 consecutive row\)/);
  h.node('#wwHs').value = ''; h.node('#findWindow').click(); h.result('wwResult', false);
  h.node('#wwHs').value = '2'; h.node('#windowRows').lists['.weather-row'][0].fields['.ww-hs'].value = '-1'; h.node('#findWindow').click(); h.result('wwResult', false);
  h.fields({ '#weCourse': 90, '#weSpeed': 0, '#weFrom': 270, '#wePeriod': 8 }); h.node('#calcEncounter').click(); assert.match(h.result('resEncounter', true), /8.00 s encounter period/);
  for (const id of ['#weCourse', '#weSpeed', '#weFrom', '#wePeriod']) { const old = h.node(id).value; h.node(id).value = ''; h.node('#calcEncounter').click(); h.result('resEncounter', false); h.node(id).value = old; }
});
check('coordinate rounding: 12 degrees 59.99999 minutes carries, including negative values and 180-degree boundary', () => {
  const h = harness(); h.run(lines.find(s => s.startsWith('function toDDM('))); h.run(lines.find(s => s.startsWith('function toDMS(')));
  for (const [value, lat, ddm, dms] of [[12 + 59.99999 / 60, true, "13° 0.000' N", '13° 0\' 0.0" N'], [-12 - 59.99999 / 60, false, "13° 0.000' W", '13° 0\' 0.0" W'], [179 + 59.99999 / 60, false, "180° 0.000' E", '180° 0\' 0.0" E']]) {
    assert.equal(h.run(`String(toDDM(${value},${lat}))`), ddm); assert.equal(h.run(`String(toDMS(${value},${lat}))`), dms);
  }
});
console.log(JSON.stringify({ status: 'PASS', checks, scope: 'Owning calculator handlers; explicit arithmetic and invalid-result expectations; no live providers' }));
