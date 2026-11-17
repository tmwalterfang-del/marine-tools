'use strict';
// Property-based tests (fast-check 4.10.2, MIT) for shared pure calculation code:
// the comma-aware number parser, GeographicLib WGS84 geodesics and the WMM2025 evaluator.
// Properties are invariants (round trips, symmetry, bounds, continuity, range refusal), so they are
// independent of the implementation's own arithmetic. Fixed seed for reproducible CI runs;
// set FC_SEED to explore other inputs locally.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fc = require('fast-check');

const root = path.resolve(__dirname, '..');
const load = (file, extra = {}) => {
  const window = { ...extra };
  window.window = window;
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), window, { filename: file });
  return window;
};
// product-ux registers DOM handlers on load; give it an inert document and read only the parser.
const inertDocument = { readyState: 'loading', addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, documentElement: { style: { setProperty() {} } } };
const parse = load('product-ux-20261031.js', { document: inertDocument, addEventListener() {}, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, location: { href: 'http://x/', search: '' }, history: { replaceState() {} } }).MT_PARSE_NUMBER;
const geodesic = load('vendor/geographiclib-geodesic-2.2.0.min.js').geodesic;
const wmm = load('wmm2025-20261117.js').MT_WMM2025;
const nav = load('navigation-math.js').MT_NAV_MATH;
assert.equal(typeof parse, 'function', 'MT_PARSE_NUMBER loaded');
assert.ok(geodesic && geodesic.Geodesic.WGS84, 'GeographicLib loaded');
assert.equal(typeof wmm.declination, 'function', 'WMM2025 loaded');

const seed = Number(process.env.FC_SEED || 20261117);
const params = { seed, numRuns: 400 };
let properties = 0;
const check = (name, prop) => { fc.assert(prop, params); properties++; console.log('PASS ' + name); };

// --- Number parser (AGENTS.md: "8,5" must equal 8.5) -------------------------------------
const finite = fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e12, max: 1e12 });
check('parser round-trips decimal-point text of any finite number', fc.property(finite, x => Object.is(parse(String(x)), x) || (x === 0 && parse(String(x)) === 0)));
check('decimal comma equals decimal point', fc.property(finite, x => { const t = String(x); return !t.includes('e') ? parse(t.replace('.', ',')) === parse(t) : true; }));
check('Unicode minus equals ASCII minus', fc.property(fc.double({ noNaN: true, noDefaultInfinity: true, min: 1e-9, max: 1e9 }), x => parse('−' + String(x)) === -x));
check('surrounding whitespace is ignored', fc.property(finite, fc.constantFrom(' ', '  ', '\t'), (x, w) => parse(w + String(x) + w) === parse(String(x))));
check('text with letters or two separators is rejected', fc.property(fc.integer({ min: 0, max: 99999 }), fc.integer({ min: 0, max: 999 }), fc.constantFrom('a', 'kn', 'x', ',5', '.5', ' 5'), (i, f, junk) => Number.isNaN(parse(i + ',' + f + junk))));

// --- WGS84 geodesics (GeographicLib) ------------------------------------------------------
const g = geodesic.Geodesic.WGS84;
const lat = fc.double({ min: -89.9, max: 89.9, noNaN: true });
const lon = fc.double({ min: -180, max: 180, noNaN: true });
const point = fc.record({ lat, lon });
check('distance is symmetric and non-negative', fc.property(point, point, (a, b) => {
  const ab = g.Inverse(a.lat, a.lon, b.lat, b.lon).s12, ba = g.Inverse(b.lat, b.lon, a.lat, a.lon).s12;
  return ab >= 0 && Math.abs(ab - ba) <= 1e-6;
}));
check('distance never exceeds half the meridian ellipse (~20 004 km)', fc.property(point, point, (a, b) => g.Inverse(a.lat, a.lon, b.lat, b.lon).s12 <= 20003931.46 + 1e-3));
check('triangle inequality', fc.property(point, point, point, (a, b, c) => {
  const d = (p, q) => g.Inverse(p.lat, p.lon, q.lat, q.lon).s12;
  return d(a, c) <= d(a, b) + d(b, c) + 1e-6;
}));
check('direct then inverse returns the same distance and azimuth', fc.property(point, fc.double({ min: -180, max: 180, noNaN: true }), fc.double({ min: 1, max: 1.9e7, noNaN: true }), (a, azi, s) => {
  const d = g.Direct(a.lat, a.lon, azi, s), inv = g.Inverse(a.lat, a.lon, d.lat2, d.lon2);
  return Math.abs(inv.s12 - s) <= 1e-6 * Math.max(1, s / 1e6);
}));

// --- Shared spherical navigation (navigation-math.js) against GeographicLib on a sphere (f = 0) ---
// GeographicLib is an independent implementation; with a = 3440.065 NM and f = 0 it solves the same sphere.
const sphere = new geodesic.Geodesic.Geodesic(nav.R, 0);
const navLat = fc.double({ min: -89.9, max: 89.9, noNaN: true });
const notAntipodal = (a, b) => nav.distance([a.lon, a.lat], [b.lon, b.lat]) < 10700 && nav.distance([a.lon, a.lat], [b.lon, b.lat]) > 0.01;
const angleDiff = (x, y) => { const d = Math.abs(((x - y) % 360 + 360) % 360); return Math.min(d, 360 - d); };
check('shared distance and bearing match GeographicLib on the same sphere', fc.property(fc.record({ lat: navLat, lon }), fc.record({ lat: navLat, lon }), (a, b) => {
  if (!notAntipodal(a, b)) return true;
  const ref = sphere.Inverse(a.lat, a.lon, b.lat, b.lon);
  return Math.abs(nav.distance([a.lon, a.lat], [b.lon, b.lat]) - ref.s12) < 1e-6 && angleDiff(nav.bearing([a.lon, a.lat], [b.lon, b.lat]), ref.azi1) < 1e-7;
}));
check('shared destination matches GeographicLib direct on the same sphere', fc.property(fc.record({ lat: navLat, lon }), fc.double({ min: 0, max: 360, noNaN: true }), fc.double({ min: 0, max: 10000, noNaN: true }), (a, brg, nm) => {
  const ref = sphere.Direct(a.lat, a.lon, brg, nm), p = nav.destination([a.lon, a.lat], brg, nm);
  return nav.distance(p, [((ref.lon2 + 540) % 360) - 180, ref.lat2]) < 1e-6;
}));

// --- WMM2025 (NOAA) -----------------------------------------------------------------------
const year = fc.double({ min: 2025.0, max: 2030.0, noNaN: true });
const wmmLat = fc.double({ min: -90, max: 90, noNaN: true });
check('valid inputs give finite field components and declination within +/-180 deg', fc.property(wmmLat, lon, year, (la, lo, y) => {
  const r = wmm.declination(la, lo, 0, y);
  const fields = [r.north, r.east, r.down, r.horizontalIntensity, r.totalIntensity, r.inclination];
  if (!fields.every(Number.isFinite)) return false;
  if (r.horizontalIntensity > 0 && !(Math.abs(r.declination) <= 180)) return false;
  // Earth's main field is roughly 20 000-70 000 nT at the surface.
  return r.totalIntensity > 15000 && r.totalIntensity < 70000 && Math.abs(r.inclination) <= 90;
}));
check('usable flag matches the 6000 nT threshold, and blackout/caution are exclusive', fc.property(wmmLat, lon, year, (la, lo, y) => {
  const r = wmm.declination(la, lo, 0, y);
  return r.usable === (r.horizontalIntensity >= 6000) && !(r.blackout && r.caution) && !(r.usable && (r.blackout || r.caution));
}));
check('longitude -180 and +180 give the same field', fc.property(wmmLat, year, (la, y) => {
  const a = wmm.declination(la, -180, 0, y), b = wmm.declination(la, 180, 0, y);
  return Math.abs(a.north - b.north) < 1e-6 && Math.abs(a.east - b.east) < 1e-6 && Math.abs(a.down - b.down) < 1e-6;
}));
check('declination is continuous in position where the model is usable', fc.property(fc.double({ min: -80, max: 80, noNaN: true }), fc.double({ min: -179.99, max: 179.99, noNaN: true }), year, (la, lo, y) => {
  const a = wmm.declination(la, lo, 0, y);
  if (!a.usable) return true;
  const b = wmm.declination(la + 0.001, lo + 0.001, 0, y);
  return Math.abs(a.declination - b.declination) < 0.05;
}));
check('annual change matches the finite difference over 0.01 year', fc.property(fc.double({ min: -80, max: 80, noNaN: true }), lon, fc.double({ min: 2025.0, max: 2029.99, noNaN: true }), (la, lo, y) => {
  const a = wmm.declination(la, lo, 0, y);
  if (!a.usable) return true;
  const b = wmm.declination(la, lo, 0, y + 0.01);
  return Math.abs((b.declination - a.declination) - a.annualChange * 0.01) < 1e-4;
}));
check('dates, positions and non-finite inputs outside the model are refused', fc.property(
  fc.oneof(
    fc.record({ la: wmmLat, lo: lon, y: fc.double({ min: 1900, max: 2024.999, noNaN: true }), code: fc.constant('WMM_DATE') }),
    fc.record({ la: wmmLat, lo: lon, y: fc.double({ min: 2030.001, max: 2100, noNaN: true }), code: fc.constant('WMM_DATE') }),
    fc.record({ la: fc.double({ min: 90.0001, max: 1000, noNaN: true }), lo: lon, y: year, code: fc.constant('WMM_POSITION') }),
    fc.record({ la: wmmLat, lo: fc.double({ min: 180.0001, max: 1000, noNaN: true }), y: year, code: fc.constant('WMM_POSITION') }),
    fc.record({ la: fc.constantFrom(NaN, Infinity, -Infinity), lo: lon, y: year, code: fc.constant('WMM_INPUT') })),
  ({ la, lo, y, code }) => { try { wmm.declination(la, lo, 0, y); return false; } catch (e) { return e.name === 'RangeError' && e.message === code; /* vm realm: instanceof would not match */ } }));

console.log(JSON.stringify({ status: 'PASS', properties, runsEach: params.numRuns, seed }));
