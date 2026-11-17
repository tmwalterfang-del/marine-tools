// DOM integration of the actual app and enhancement scripts. This verifies
// event wiring and saved calculation records; it does not verify layout.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..'), read = file => fs.readFileSync(path.join(root, file), 'utf8');
let dom;
(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://validation.marine-tools-frontend-preview.pages.dev/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, errors = [], tasks = [], results = {}, copied = [], shared = [];
  if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
  w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
  // Keep just short UI/history work, with no background polling or live services.
  w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
  w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
  w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.navigator, 'onLine', { value: false });
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { copied.push(text); } } });
  Object.defineProperty(w.navigator, 'share', { value: async data => { shared.push(data); } });
  w.fetch = async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' });
  w.localStorage.setItem('mt.route', JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
  w.localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 0, fuelDay: 4, corridor: 5 }));
  d.addEventListener('mt-calculation-result', e => { results[e.target.id] = e.detail.valid; });
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  w.__marineToolsOpenPage('navigation');
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0, 'UI tasks settled');
  }
  await flush();
  function fields(values, event = 'input') { for (const [id, value] of Object.entries(values)) { const el = d.getElementById(id); assert(el, id); el.value = String(value); if (event) el.dispatchEvent(new w.Event(event, { bubbles: true })); } }
  const position = (prefix, lat = 0, min = 0, lon = 0, lonMin = 0) => ({ [prefix + 'LatDeg']: lat, [prefix + 'LatMin']: min, [prefix + 'LatHem']: 'N', [prefix + 'LonDeg']: lon, [prefix + 'LonMin']: lonMin, [prefix + 'LonHem']: 'E' });
  let checks = 0;
  function click(button, result, valid) {
    d.getElementById(button).click(); assert.equal(results[result], valid, button + ': ' + d.getElementById(result).textContent);
    assert.doesNotMatch(d.getElementById(result).textContent, /NaN|Infinity/); checks++;
    return d.getElementById(result).textContent;
  }
  fields({ ...position('near'), ...position('gcA'), ...position('gcB', 0, 0, 1) });
  assert.match(click('calcNearest', 'resNearest', true), /0.00 NM/);
  assert.match(click('calcGcRhumb', 'resGcRhumb', true), /GC 60.04 NM/);
  for (const [prefix, latId, lonId, button, result] of [['near', 'nearLat', 'nearLon', 'calcNearest', 'resNearest'], ['gcA', 'gcLat1', 'gcLon1', 'calcGcRhumb', 'resGcRhumb'], ['gcB', 'gcLat2', 'gcLon2', 'calcGcRhumb', 'resGcRhumb']]) {
    for (const suffix of ['LatDeg', 'LatMin', 'LonDeg', 'LonMin']) {
      const id = prefix + suffix, old = d.getElementById(id).value;
      for (const event of ['input', 'change', null]) {
        fields({ [id]: '' }, event);
        if (event) { assert.equal(d.getElementById(latId).value, ''); assert.equal(d.getElementById(lonId).value, ''); }
        click(button, result, false);
        fields({ [id]: old }); click(button, result, true);
      }
    }
  }
  fields({ ...position('gcA', 0, '30,5'), ...position('gcB', 0, '30,5', 1) }); click('calcGcRhumb', 'resGcRhumb', true);
  assert.equal(d.getElementById('gcLat1').value, '0.5083333');
  for (const [prefix, button, result, title] of [['navA', 'calcBearing855', 'resBearing855', 'Bearing, distance & destination'], ['coord', 'calcCoords855', 'resCoords855', 'Coordinate toolbox']]) {
    fields(position(prefix, 12, '59,99999', 10, '30,5')); if (prefix === 'navA') fields(position('navB', 13, 0, 11));
    await flush(); w.localStorage.setItem('mt.history', '[]');
    const output = click(button, result, true); await flush();
    const history = JSON.parse(w.localStorage.getItem('mt.history'));
    assert.equal(history.length, 1); assert.equal(history[0].title, title); assert.equal(history[0].result, output);
    const card = d.querySelector(`[data-tool-title="${title}"]`);
    assert(d.getElementById(button).matches('.calc-action'));
    card.querySelector('.copy-result').click(); await flush(); assert.equal(copied.pop(), output);
    card.querySelector('.share-result').click(); await flush(); const share = shared.pop(); assert(share.text.includes(output)); assert(share.text.includes('59,99999'));
    const id = prefix + 'LatMin', old = d.getElementById(id).value; fields({ [id]: '' }); click(button, result, false); fields({ [id]: old });
  }
  // Integer unit rounding: 59.99999 minutes is 59m 59.9994s, rounding to
  // the next degree at the displayed hundredth-second precision.
  assert.match(click('calcCoords855', 'resCoords855', true), /13° 00′ 0.00″ N/);
  fields({ coordLatHem: 'S', coordLonDeg: 179, coordLonMin: '59,99999', coordLonHem: 'W' });
  const out = click('calcCoords855', 'resCoords855', true); assert.match(out, /13° 00′ 0.00″ S/); assert.match(out, /180° 00′ 0.00″ W/); assert.doesNotMatch(out, /60.00″/);
  // Round-trip initialization of a value whose minutes round to 60 at 5 dp.
  const map = d.createElement('div'); map.id = 'riMap'; d.body.append(map);
  w.localStorage.setItem('mt.route', JSON.stringify([{ lat: 12 + 59.999999 / 60, lon: -179 - 59.999999 / 60 }]));
  w.__marineToolsUiEnhancements855.refresh(); await flush();
  assert.match(d.getElementById('mtRouteDdmList').textContent, /13° 0.00000′ N · 180° 0.00000′ W/);
  w.__marineToolsOpenPage('weather'); w.__marineToolsUiEnhancements855.refresh(); await flush();
  w.dispatchEvent(new w.CustomEvent('mt:weather-position', { detail: { lat: 12 + 59.999999 / 60, lon: -179 - 59.999999 / 60 } }));
  assert.equal(d.getElementById('wxPosLatDeg').value, '13'); assert.equal(d.getElementById('wxPosLatMin').value, '0.00000'); assert.equal(d.getElementById('wxPosLonDeg').value, '180');
  fields({ wwHs: '' }); click('findWindow', 'wwResult', false);
  fields({ wwHs: '2,5' }); const hs = d.querySelector('.ww-hs'); hs.value = '-1'; click('findWindow', 'wwResult', false);
  fields({ weCourse: '', weFrom: 270, weSpeed: 0, wePeriod: 8 }); click('calcEncounter', 'resEncounter', false);
  fields({ weCourse: 90 }); assert.match(click('calcEncounter', 'resEncounter', true), /8.00 s/);
  w.__marineToolsOpenPage('navigation'); click('calcRouteFuel', 'resRouteFuel', false);
  w.__marineToolsOpenPage('fuel'); click('fuelRouteBtn', 'fuelRouteRes', false);
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', checks, scope: 'jsdom actual app/editor events, mocked Copy/Share, history, decimal comma and rounding; no browser layout or real providers/devices' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
