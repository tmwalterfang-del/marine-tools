// Real editor events, decimal comma, invalid-result signals, Copy/Share/history,
// rounding and coordinate row layout (full width; 320 px is covered by main-calculator-working-browser-20261117.cjs). External providers and service workers are blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const pw = require('playwright');
const root = path.resolve(__dirname, '..'), engine = process.argv[2] || 'chromium';
let browser, server, checks = 0;
(async () => {
  server = http.createServer((req, res) => {
    let file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  browser = await pw[engine].launch(engine === 'chromium' && process.env.STUDENTS_BROWSER_EXECUTABLE ? { executablePath: process.env.STUDENTS_BROWSER_EXECUTABLE } : {});
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  await context.addInitScript(() => {
    localStorage.setItem('mt.route', JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
    localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 0, fuelDay: 4, corridor: 5 }));
    window.testResults = {}; window.testCopied = []; window.testShared = [];
    document.addEventListener('mt-calculation-result', e => { window.testResults[e.target.id] = e.detail.valid; });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.testCopied.push(text); } } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.testShared.push(data); } });
  });
  const p = await context.newPage(), errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(base + '/index.html?page=navigation');
  await p.locator('#calcBearing855').waitFor(); await p.evaluate(() => document.querySelector('#mtReleaseDialog[open]')?.close()); // Validation test, not layout: full width keeps cards expanded.
  await p.waitForFunction(() => document.getElementById('gcALatMin')?.dataset.mtNumeric === 'true');
  await p.evaluate(() => MT_I18N.ready); await p.evaluate(() => MT_I18N.set('en'));
  async function fields(values, dispatch = true) {
    await p.evaluate(({ values, dispatch }) => { for (const [id, value] of Object.entries(values)) { const el = document.getElementById(id); el.value = String(value); if (dispatch) el.dispatchEvent(new Event('input', { bubbles: true })); } }, { values, dispatch });
  }
  async function click(id, result, valid) {
    await p.evaluate(id => document.getElementById(id).click(), id);
    assert.equal(await p.evaluate(id => window.testResults[id], result), valid, id + ' result validity');
    const out = await p.locator('#' + result).innerText(); assert.doesNotMatch(out, /NaN|Infinity/);
    if (!valid) assert.match(await p.locator('#' + result).getAttribute('class'), /caution/);
    checks++; return out;
  }
  function position(prefix, latDeg = 0, latMin = 0, lonDeg = 0, lonMin = 0) {
    return { [prefix + 'LatDeg']: latDeg, [prefix + 'LatMin']: latMin, [prefix + 'LatHem']: 'N', [prefix + 'LonDeg']: lonDeg, [prefix + 'LonMin']: lonMin, [prefix + 'LonHem']: 'E' };
  }
  // A point at a route endpoint is 0 NM away. Along the equator, a degree is
  // approximately 60.04 NM (spherical model, tolerance 0.02 NM).
  await fields({ ...position('near'), ...position('gcA'), ...position('gcB', 0, 0, 1, 0) });
  assert.match(await click('calcNearest', 'resNearest', true), /0.00 NM/);
  assert.match(await click('calcGcRhumb', 'resGcRhumb', true), /GC 60.04 NM/);
  for (const locale of ['en', 'nb']) {
    await p.evaluate(locale => MT_I18N.set(locale), locale);
    // The coordinate editors re-render after a language change; wait so fill() targets the new fields.
    await p.waitForTimeout(500);
    for (const [prefix, latId, lonId, button, result] of [['near', 'nearLat', 'nearLon', 'calcNearest', 'resNearest'], ['gcA', 'gcLat1', 'gcLon1', 'calcGcRhumb', 'resGcRhumb'], ['gcB', 'gcLat2', 'gcLon2', 'calcGcRhumb', 'resGcRhumb']]) {
      for (const suffix of ['LatDeg', 'LatMin', 'LonDeg', 'LonMin']) {
        const id = prefix + suffix, old = await p.locator('#' + id).inputValue();
        // Clear with an input event only (no blur/change) and assert immediately. Playwright fill() is
        // unreliable here after a programmatic MT_I18N.set; real keyboard clearing was verified manually.
        await fields({ [id]: '' });
        assert.equal(await p.locator('#' + latId).inputValue(), '', locale + '/' + id + ' clears hidden latitude');
        assert.equal(await p.locator('#' + lonId).inputValue(), '', locale + '/' + id + ' clears hidden longitude');
        await click(button, result, false);
        await fields({ [id]: old }); await click(button, result, true);
      }
      // Also cover programmatic restoration with no input/change events: capture
      // sync must happen before the calculator's onclick reads hidden decimals.
      const id = prefix + 'LatMin', old = await p.locator('#' + id).inputValue();
      await fields({ [id]: '' }, false); await click(button, result, false);
      await fields({ [id]: old }); await click(button, result, true);
    }
    const issues = await p.locator('#navigation .coord-row').evaluateAll(rows => rows.flatMap(row => {
      const box = row.getBoundingClientRect(), inputs = [...row.querySelectorAll('input,select')].map(el => el.getBoundingClientRect());
      return inputs.flatMap((r, i) => r.left < box.left - 1 || r.right > box.right + 1 || i > 0 && r.left < inputs[i - 1].right - 1 ? [i] : []);
    }));
    assert.deepEqual(issues, [], locale + ' coordinate inputs fit their row'); checks++;
  }
  await p.evaluate(() => MT_I18N.set('en'));
  await fields({ ...position('gcA', 0, '30,5'), ...position('gcB', 0, '30,5', 1, 0) });
  await click('calcGcRhumb', 'resGcRhumb', true);
  assert.equal(await p.locator('#gcLat1').inputValue(), '0.5083333');
  // Copy/Share exercise existing handlers through the restored class names.
  for (const [prefix, button, result, title] of [['navA', 'calcBearing855', 'resBearing855', 'Bearing, distance & destination'], ['coord', 'calcCoords855', 'resCoords855', 'Coordinate toolbox']]) {
    await fields(position(prefix, 12, '59,99999', 10, '30,5'));
    if (prefix === 'navA') await fields(position('navB', 13, 0, 11, 0));
    await p.waitForTimeout(40); // Finish previous history callbacks before counting.
    await p.evaluate(() => localStorage.setItem('mt.history', '[]'));
    const before = await p.evaluate(() => JSON.parse(localStorage.getItem('mt.history') || '[]').length);
    const output = await click(button, result, true);
    await p.waitForFunction(({ title, result }) => JSON.parse(localStorage.getItem('mt.history') || '[]')[0]?.title === title && JSON.parse(localStorage.getItem('mt.history') || '[]')[0]?.result === document.getElementById(result).innerText.trim(), { title, result });
    const history = await p.evaluate(() => JSON.parse(localStorage.getItem('mt.history')));
    assert.equal(history.length, Math.min(20, before + 1)); assert.equal(history[0].result, output.trim());
    const card = p.locator(`[data-tool-title="${title}"]`);
    await card.locator('.copy-result').evaluate(b => b.click()); await p.waitForFunction(() => window.testCopied.length > 0);
    assert.equal(await p.evaluate(() => window.testCopied.pop()), output.trim());
    await card.locator('.share-result').evaluate(b => b.click()); await p.waitForFunction(() => window.testShared.length > 0);
    const shared = await p.evaluate(() => window.testShared.pop()); assert(shared.text.includes(output.trim())); assert(shared.text.includes('59,99999'));
    const id = prefix + 'LatMin', old = await p.locator('#' + id).inputValue(); await fields({ [id]: '' }); await click(button, result, false); await fields({ [id]: old });
  }
  // 59.99999 minutes = 59 minutes 59.9994 seconds, so DMS at 0.01 s
  // precision is 13 degrees 00 minutes 0.00 seconds, never 12 degrees 59'60".
  await click('calcCoords855', 'resCoords855', true);
  assert.match(await p.locator('#resCoords855').innerText(), /13° 00′ 0.00″ N/);
  await fields({ coordLatHem: 'S', coordLonDeg: 179, coordLonMin: '59,99999', coordLonHem: 'W' });
  await click('calcCoords855', 'resCoords855', true);
  const rounded = await p.locator('#resCoords855').innerText(); assert.match(rounded, /13° 00′ 0.00″ S/); assert.match(rounded, /180° 00′ 0.00″ W/);
  assert.doesNotMatch(rounded, /60.00″/);
  // Editor initialization and setEditor must carry minutes that round to 60.
  await p.evaluate(() => { __marineToolsOpenPage('route-intelligence'); localStorage.setItem('mt.route', JSON.stringify([{ lat: 12 + 59.999999 / 60, lon: -179 - 59.999999 / 60 }])); __marineToolsUiEnhancements855.refresh(); });
  await p.waitForFunction(() => document.getElementById('mtRouteDdmList')?.textContent.includes('13° 0.00000′ N'));
  assert.match(await p.locator('#mtRouteDdmList').innerText(), /180° 0.00000′ W/);
  await p.evaluate(() => __marineToolsOpenPage('weather'));
  // Attached (not necessarily scrolled into view) is enough to receive the position event;
  // then wait until the handler has written the fields before asserting the exact values.
  await p.locator('#wxPosLatMin').waitFor({ state: 'attached', timeout: 60000 });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent('mt:weather-position', { detail: { lat: 12 + 59.999999 / 60, lon: -179 - 59.999999 / 60 } })));
  await p.waitForFunction(() => document.getElementById('wxPosLatDeg')?.value === '13' && document.getElementById('wxPosLonHem')?.value === 'W', null, { timeout: 15000 });
  assert.equal(await p.locator('#wxPosLatDeg').inputValue(), '13'); assert.equal(await p.locator('#wxPosLatMin').inputValue(), '0.00000');
  assert.equal(await p.locator('#wxPosLonDeg').inputValue(), '180'); assert.equal(await p.locator('#wxPosLonHem').inputValue(), 'W');
  // The binding wrappers must be used in the real page as well.
  await fields({ wwHs: '' }); await click('findWindow', 'wwResult', false);
  await fields({ wwHs: '2,5' }); await p.locator('.ww-hs').first().evaluate(el => { el.value = '-1'; el.dispatchEvent(new Event('input', { bubbles: true })); }); await click('findWindow', 'wwResult', false);
  await fields({ weCourse: '', weFrom: 270, weSpeed: 0, wePeriod: 8 }); await click('calcEncounter', 'resEncounter', false);
  await fields({ weCourse: 90 }); assert.match(await click('calcEncounter', 'resEncounter', true), /8.00 s/);
  // Saved zero service speed invalidates both route-fuel presentations.
  await p.evaluate(() => __marineToolsOpenPage('navigation')); await p.locator('#calcRouteFuel').waitFor(); await click('calcRouteFuel', 'resRouteFuel', false);
  await p.evaluate(() => __marineToolsOpenPage('fuel')); await p.locator('#fuelRouteBtn').waitFor(); await click('fuelRouteBtn', 'fuelRouteRes', false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', engine, checks, scope: 'Coordinate input events, calculation history, mocked clipboard/share, rounding, EN/NB row layout; no real providers/devices' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); if (server) await new Promise(resolve => server.close(resolve)); });
