// Independent WGS84 references through the vendored browser build and real DOM
// handlers/JSON/CSV exports. Run with jsdom@26.1.0 on NODE_PATH; no network.
// NGA defining parameters: https://earth-info.nga.mil/?action=wgs84&dir=wgs84
// At the equator a one-degree arc is a*pi/180, a=6378137 m: 111319.490793 m
// (rounded to micrometres), with initial/final forward azimuths both 90 degrees.
// Karney's published WGS84 data, downloaded 2026-11-17:
// https://sourceforge.net/projects/geographiclib/files/testdata/GeodTest-short.dat.gz
// Compressed bytes: 803843; SHA256:
// 31d376e8158f7af26277d887d7a1e7726e14d172db5a848a1730dd4886ab6121
// Documentation: https://geographiclib.sourceforge.io/C++/doc/geodesic.html#testgeod
// Rows below are 1-based. Columns used: lat1 lon1 azi1 lat2 lon2 azi2 s12.
// Frozen primary values, never generated with the library under test.
// Raw distance tolerance 1 mm; forward azimuth tolerance 1e-8 degrees;
// direct endpoint tolerance 1e-9 degrees. Display tolerance: half last place.
// Valid inputs: latitude +/-90, longitude +/-180; selected reference bearings
// are unique, with no exact coincident/antipodal endpoints or rhumb poles.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const vendor = 'vendor/geographiclib-geodesic-2.2.0.min.js';
const references = [
  { name: 'NGA equatorial degree', row: [0, 0, 90, 0, 1, 90, 111319.490793] },
  { name: 'NGA equatorial degree westbound', row: [0, 0, -90, 0, -1, -90, 111319.490793] },
  { name: 'GeodTest row 4001: polar', row: [89.997817345644, 0, 2.624783190362, 39.575446357285395097, 177.375133897726011603, 179.999870061583075319, 5619818.6599569] },
  { name: 'GeodTest row 13', row: [20.017743473813, 0, 152.852480192977, -32.277331448997229965, 27.232414127345381918, 149.549845470230186451, 6473814.5689877] },
  // An ellipsoid of revolution is invariant under a shared longitude rotation.
  // Rotate row 13 by +170 degrees (wrap into +/-180) to cross the dateline;
  // retain its published distance and both published azimuths unchanged.
  { name: 'GeodTest row 13: dateline rotation', shift: 170, row: [20.017743473813, 0, 152.852480192977, -32.277331448997229965, 27.232414127345381918, 149.549845470230186451, 6473814.5689877] },
  { name: 'GeodTest row 2036: near antipodal', row: [58.620040570722, 0, 4.255684150044, -58.59069165720269893, 179.97245968221015101, 175.747886416360576059, 20000602.9448215] }
];
const wrap = lon => ((lon + 540) % 360) - 180;
let checks = 0, handlerRuns = 0, exportsChecked = 0;
function near(actual, expected, tolerance, label) {
  checks++;
  assert(Number.isFinite(actual), label + ': finite');
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} +/- ${tolerance}`);
}
function angle(actual, expected, tolerance, label) { near(wrap(actual - expected), 0, tolerance, label); }

async function exercise(loadVendor) {
  const dom = new JSDOM(read('index.html'), { url: 'https://wgs84.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  try {
    const w = dom.window, d = w.document, tasks = [], errors = [], results = new Map(), downloads = [];
    if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
    w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
    w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
    w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
    w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
    Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
    w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
    Object.defineProperty(w.navigator, 'onLine', { value: false });
    w.fetch = async () => { throw Error('Unexpected network request'); };
    w.Blob = Blob;
    w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:wgs84-' + downloads.length; };
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = () => {};
    w.localStorage.setItem('mt.route', JSON.stringify([{ lat: 0, lon: 179 }, { lat: 0, lon: -180 }, { lat: 0, lon: -179 }]));
    w.localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 10, fuelDay: 4, corridor: 5 }));
    d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
    if (loadVendor) w.eval(read(vendor));
    for (const file of ['calc-references-20261117.js', 'product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
    d.dispatchEvent(new w.Event('DOMContentLoaded'));
    w.__marineToolsOpenPage('navigation');
    async function flush() {
      for (let i = 0; i < 8; i++) { for (const fn of tasks.splice(0)) fn(); await new Promise(resolve => setImmediate(resolve)); }
      assert.equal(tasks.length, 0, 'Short UI tasks settled');
    }
    await flush();
    const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
    const box = id => d.querySelector(`.calc-work[data-for="${id}"]`);
    function click(button, id, valid = true, fullDecimalPrecision = false) {
      results.delete(id);
      // The GC click capture bridge rounds DDM coordinates to 7 decimal places.
      // For millimetre primary references invoke the actual assigned handler on
      // the full-precision decimal fields. Normal editor clicks are tested below.
      if (fullDecimalPrecision) el(button).onclick();
      else el(button).click();
      handlerRuns++;
      assert.equal(results.get(id), valid, button + ': ' + el(id).textContent);
      assert.doesNotMatch(el(id).textContent, /NaN|Infinity|undefined/);
      if (!valid) assert.equal(box(id), null, 'Invalid input clears working/exports');
      return el(id).textContent;
    }
    async function download(id, format) {
      const before = downloads.length;
      box(id).querySelector('.calc-work-' + format).click();
      assert.equal(downloads.length, before + 1, 'One ' + format + ' download');
      exportsChecked++;
      return downloads.at(-1).text();
    }
    const record = async id => JSON.parse(await download(id, 'json'));
    function ddm(prefix, lat, lon) {
      for (const [axis, value, positive, negative] of [['Lat', lat, 'N', 'S'], ['Lon', lon, 'E', 'W']]) {
        const degrees = Math.floor(Math.abs(value));
        el(prefix + axis + 'Deg').value = String(degrees);
        // Preserve primary-data precision; production input step is a UI hint.
        el(prefix + axis + 'Min').value = String((Math.abs(value) - degrees) * 60);
        el(prefix + axis + 'Hem').value = value < 0 ? negative : positive;
      }
    }
    function positions(lat1, lon1, lat2, lon2) {
      ddm('gcA', lat1, lon1); ddm('gcB', lat2, lon2);
      ddm('navA', lat1, lon1); ddm('navB', lat2, lon2);
      // calcGcRhumb consumes these existing decimal fields. Assign the full
      // published precision directly; the DDM event bridge rounds to 7 dp.
      for (const [id, value] of Object.entries({ gcLat1: lat1, gcLon1: lon1, gcLat2: lat2, gcLon2: lon2 })) el(id).value = String(value);
    }
    const outputs = r => Object.fromEntries(Object.entries(r.outputs).filter(([key]) => !/wgs84/i.test(key)));
    let equatorial;
    for (const c of loadVendor ? references : references.slice(0, 1)) {
      const [lat1, publishedLon1, azi1, lat2, publishedLon2, azi2, metres] = c.row;
      const lon1 = c.shift ? wrap(publishedLon1 + c.shift) : publishedLon1;
      const lon2 = c.shift ? wrap(publishedLon2 + c.shift) : publishedLon2;
      positions(lat1, lon1, lat2, lon2);
      if (loadVendor) {
        const geod = w.geodesic.Geodesic.WGS84;
        const inv = geod.Inverse(lat1, lon1, lat2, lon2);
        near(inv.s12, metres, 0.001, c.name + ': inverse metres');
        angle(inv.azi1, azi1, 1e-8, c.name + ': inverse initial azimuth');
        angle(inv.azi2, azi2, 1e-8, c.name + ': inverse final azimuth');
        // Independent direct test: published azi1 AND published distance as
        // operands, comparing to published endpoints/azi2, not inverse output.
        const direct = geod.Direct(lat1, lon1, azi1, metres);
        near(direct.lat2, lat2, 1e-9, c.name + ': direct latitude');
        angle(direct.lon2, lon2, 1e-9, c.name + ': direct longitude');
        angle(direct.azi2, azi2, 1e-8, c.name + ': direct final azimuth');
      }
      for (const [button, id] of [['calcGcRhumb', 'resGcRhumb'], ['calcBearing855', 'resBearing855']]) {
        const text = click(button, id, true, id === 'resGcRhumb'), r = await record(id), csv = await download(id, 'csv');
        assert.equal(csv.replace(/^\uFEFF/, '').split(/\r?\n/)[0], 'tool,section,name,value,unit', 'Existing CSV columns');
        if (loadVendor) {
          assert.match(text, /WGS84 .* NM · initial .*°T · final .*°T/);
          near(r.outputs.wgs84Distance.value * 1852, metres, 0.001, c.name + ': handler distance');
          assert.equal(r.outputs.wgs84Distance.unit, 'NM');
          angle(r.outputs.initialWgs84Course.value, azi1, 1e-8, c.name + ': handler initial course');
          angle(r.outputs.finalWgs84Course.value, azi2, 1e-8, c.name + ': handler final course');
          for (const key of ['initialWgs84Course', 'finalWgs84Course']) {
            assert.equal(r.outputs[key].unit, '°T');
            assert(r.outputs[key].value >= 0 && r.outputs[key].value < 360, key + ': normalized');
          }
          const shown = text.match(/WGS84 ([-\d.]+) NM · initial ([-\d.]+)°T · final ([-\d.]+)°T/);
          near(Number(shown[1]), metres / 1852, 0.000500001, 'Displayed WGS84 distance');
          angle(Number(shown[2]), azi1, 0.005000001, 'Displayed initial course');
          angle(Number(shown[3]), azi2, 0.005000001, 'Displayed final course');
          assert(csv.includes(',output,wgs84Distance,' + r.outputs.wgs84Distance.value + ',NM'));
          const expectedLabels = ['WGS84 geodesic distance', 'Initial WGS84 course', 'Final WGS84 course'];
          if (id === 'resBearing855') {
            expectedLabels.push('WGS84 destination latitude', 'WGS84 destination longitude');
            near(r.outputs.wgs84DestinationLatitude.value, lat2, 1e-9, c.name + ': handler destination latitude');
            angle(r.outputs.wgs84DestinationLongitude.value, lon2, 1e-9, c.name + ': handler destination longitude');
            assert.match(text, /WGS84 destination /);
          }
          assert.deepEqual(r.steps.filter(s => /WGS84/.test(s.label)).map(s => s.label), expectedLabels);
          for (const label of expectedLabels) assert(box(id).textContent.includes(label), 'Rendered working: ' + label);
        } else {
          assert.doesNotMatch(text, /WGS84/);
          assert.deepEqual(r.outputs, outputs(r), 'No WGS84 outputs without library');
          assert(!r.steps.some(s => /WGS84/.test(s.label)), 'No WGS84 steps without library');
          assert.doesNotMatch(csv, /wgs84/i);
        }
        if (c === references[0]) {
          const distanceKey = id === 'resGcRhumb' ? 'greatCircleDistance' : 'distance';
          near(r.outputs[distanceKey].value, 60.04046073261873, 1e-10, 'Preserved spherical one-degree distance');
          if (loadVendor && id === 'resBearing855') equatorial = { record: r, csv };
        }
      }
    }
    if (loadVendor) {
      // Normal editor click includes existing 7-dp coordinate rounding (up to
      // centimetres in distance), while the full-precision handler above is 1 mm.
      const c = references.find(c => c.name === 'GeodTest row 13');
      positions(c.row[0], c.row[1], c.row[3], c.row[4]);
      click('calcGcRhumb', 'resGcRhumb');
      const editor = await record('resGcRhumb');
      near(editor.outputs.wgs84Distance.value * 1852, c.row[6], 0.02, 'GC editor 7-dp distance');
      angle(editor.outputs.initialWgs84Course.value, c.row[2], 1e-6, 'GC editor initial azimuth');
      angle(editor.outputs.finalWgs84Course.value, c.row[5], 1e-6, 'GC editor final azimuth');
      // Presentation-only locale change retains machine values and CSV rows.
      positions(0, 0, 0, 1); click('calcBearing855', 'resBearing855');
      const before = await record('resBearing855'), csv = await download('resBearing855', 'csv');
      // Keep the established spherical destination template keys intact.
      const translated = { 'Destination {0} · {1}': 'Mål {0} · {1}', 'Decimal {0}, {1}': 'Desimal {0}, {1}' };
      w.MT_I18N = { locale: 'nb', t: s => translated[s] ?? s };
      w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
      assert.match(el('resBearing855').textContent, /WGS84 60,108 NM/);
      assert.match(el('resBearing855').textContent, /Mål .*Desimal /);
      assert.deepEqual((await record('resBearing855')).outputs, before.outputs);
      assert.equal(await download('resBearing855', 'csv'), csv);
      w.MT_I18N.locale = 'en'; w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
      // Removing the library after a successful result must clear WGS84 data.
      delete w.geodesic;
      click('calcBearing855', 'resBearing855');
      assert.doesNotMatch(el('resBearing855').textContent, /WGS84/);
      const fallback = await record('resBearing855');
      assert.deepEqual(fallback.outputs, outputs(equatorial.record));
      assert(!fallback.steps.some(s => /WGS84/.test(s.label)));
    }
    // With the vendor loaded, shared navigation and route fuel stay spherical.
    if (loadVendor) w.eval(read(vendor));
    near(w.MT_NAV_MATH.distance([0, 0], [1, 0]), 60.04046073261873, 1e-10, 'Shared spherical model');
    click('calcRouteFuel', 'resRouteFuel');
    const route = await record('resRouteFuel');
    near(route.inputs.routeDistance.value, 120.08092146523746, 1e-10, 'Spherical routeDistance');
    assert.deepEqual(route.outputs, outputs(route), 'Route outputs remain spherical');
    // Decimal-comma operands still use the existing shared input parsers.
    positions(0, 0, 0, 1);
    el('navALatMin').value = el('navBLatMin').value = '30,5';
    click('calcBearing855', 'resBearing855');
    near((await record('resBearing855')).inputs.latitudeA.value, 0.5083333333333333, 1e-15, 'Comma-aware DDM input');
    // Both handlers retain rejection and clear previous exports on blank input.
    el('navALatMin').value = ''; click('calcBearing855', 'resBearing855', false);
    positions(0, 0, 0, 1); click('calcGcRhumb', 'resGcRhumb');
    el('gcALatMin').value = ''; click('calcGcRhumb', 'resGcRhumb', false);
    await flush();
    assert.deepEqual(errors, [], 'No browser script errors with or without GeographicLib');
  } finally { dom.window.close(); }
}

(async () => {
  const html = read('index.html');
  assert(html.indexOf('src="' + vendor) >= 0 && html.indexOf('src="' + vendor) < html.indexOf('src="app.js'), 'Vendored browser script precedes app.js');
  await exercise(true);
  await exercise(false);
  console.log(JSON.stringify({ status: 'PASS', frozenCases: references.length, primaryGeodTestRows: [13, 2036, 4001], checks, handlerRuns, exportsChecked, scope: 'jsdom; vendor inverse/direct primary references, real calculator handlers/exports, missing-library fallback and spherical route isolation; no layout/device/provider acceptance' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
