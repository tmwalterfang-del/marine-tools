// Independent numerical references through the real app.js DOM handlers.
// Run with jsdom@26.1.0 on NODE_PATH. No extracted/reimplemented handlers,
// substituted navigation math, provider calls, generated baselines or snapshots.
// All reference numbers below are literals from the accompanying hand workings.
// Tolerances are half of the last displayed decimal place (or exact for counts
// and clock fields); unrounded hand values are retained where appropriate.
// This verifies arithmetic and DOM text, not layout, devices or operational use.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const N = '(-?\\d+(?:\\.\\d+)?)'; // English display numbers, not an input parser.
const rx = text => new RegExp(text.replaceAll('#', N), 'u');
let dom;

(async () => {
  dom = new JSDOM(read('index.html'), {
    url: 'https://reference.invalid/', runScripts: 'outside-only',
    pretendToBeVisual: true, virtualConsole: new VirtualConsole()
  });
  const w = dom.window, d = w.document, errors = [], tasks = [], results = new Map();
  if (d.readyState === 'loading') await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve, { once: true }));
  w.addEventListener('error', e => { errors.push(e.message); e.preventDefault(); });
  w.setTimeout = (fn, delay = 0) => { if (delay <= 100) tasks.push(fn); return tasks.length; };
  w.setInterval = w.requestIdleCallback = w.requestAnimationFrame = () => 0;
  w.scrollTo = w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.navigator, 'onLine', { value: false });
  w.fetch = async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' });
  // Two equatorial one-degree arcs. This exercises real routeDistance() and
  // navigation-math.js, rather than returning a stubbed distance to the handler.
  w.localStorage.setItem('mt.route', JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }, { lat: 0, lon: 2 }]));
  w.localStorage.setItem('mt.profile', JSON.stringify({ serviceSpeed: 10, fuelDay: 4, corridor: 5 }));
  d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  async function flush() {
    for (let i = 0; i < 8; i++) {
      const batch = tasks.splice(0);
      for (const fn of batch) fn();
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.equal(tasks.length, 0, 'UI work settled');
  }
  for (const page of ['engineering', 'vessel-calcs', 'fuel', 'navigation', 'weather', 'profile']) w.__marineToolsOpenPage(page);
  await flush();
  assert.notEqual(w.MT_I18N?.locale, 'nb', 'Reference text must be English');

  const counts = {}, failures = [], panels = new Set();
  let current = '', assertions = 0, noteAssertions = 0, handlerRuns = 0, panelRuns = 0;
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  function fields(values) {
    for (const [id, value] of Object.entries(values)) {
      el(id).value = String(value);
      el(id).dispatchEvent(new w.Event('input', { bubbles: true }));
    }
  }
  function near(actual, expected, tolerance, label) {
    assertions++;
    assert(Number.isFinite(actual), `${label}: expected ${expected}, actual ${actual}`);
    assert(Math.abs(actual - expected) <= tolerance + 1e-10,
      `${label}: expected ${expected} +/- ${tolerance}, actual ${actual}`);
  }
  // Record all numeric disagreements in a case, including panel disagreements.
  function verify(fn) {
    try { fn(); } catch (error) { failures.push({ case: current, finding: error.message }); }
  }
  function numbers(text, pattern, expected, tolerances, label) {
    const match = text.match(pattern);
    verify(() => assert(match, `${label}: expected ${pattern}, actual ${JSON.stringify(text)}`));
    if (!match) return;
    assert.equal(match.length - 1, expected.length, 'Reference capture count: ' + label);
    for (let i = 0; i < expected.length; i++) verify(() => near(Number(match[i + 1]), expected[i], tolerances[i], `${label} [${i + 1}]`));
  }
  function click(button, result) {
    results.delete(result);
    el(button).click(); handlerRuns++;
    assert.equal(results.get(result), true, `${button}: ${el(result).textContent}`);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/u);
    return el(result);
  }
  function text(result, selector = 'strong') {
    const node = el(result).querySelector(selector);
    assert(node, `Missing ${selector} in #${result}`);
    return node.textContent.trim();
  }
  function rowText(result, heading) {
    const row = [...el(result).querySelectorAll('tr')].find(r => r.querySelector('th')?.textContent === heading);
    assert(row, `Missing ${heading} row in #${result}`);
    return row.querySelector('td').textContent.trim();
  }
  // Each displayed step must match a named, literal hand reference:
  // [label pattern, value, tolerance] or [label pattern, expected status note].
  // The fuel-page route result has no panel yet; check it if one is added.
  // Fail on every added step without a reference, never silently skip it.
  function work(result, references, required = true) {
    const boxes = d.querySelectorAll(`.calc-work[data-for="${result}"]`);
    if (!required && !boxes.length) return;
    verify(() => assert.equal(boxes.length, 1, result + ' working panel count'));
    if (boxes.length !== 1) return;
    panels.add(result); panelRuns++;
    const rows = [...boxes[0].querySelectorAll('.calc-work-steps > li')];
    verify(() => assert(rows.length > 0, result + ' has working steps'));
    for (const row of rows) {
      const label = row.querySelector('span')?.textContent.trim();
      const reference = references.find(([pattern]) => pattern.test(label));
      verify(() => assert(reference, `${result}: no independent reference for working step ${JSON.stringify(label)}`));
      if (!reference) continue;
      const code = row.querySelector('code')?.textContent || '';
      if (typeof reference[1] === 'string') {
        noteAssertions += 2;
        const note = code.match(/ — (.*)$/u)?.[1];
        verify(() => assert.equal(note, reference[1], `${result} working: ${label}: status note`));
        verify(() => assert.doesNotMatch(code, /=/u,
          `${result} working: ${label}: expected a status note without '= value', actual ${JSON.stringify(code)}`));
        continue;
      }
      if (reference[1] === null) {
        verify(() => assert.match(code, /=\s*(?:—|undefined|indeterminate)(?:\s|$)/iu,
          `${result} working: ${label}: expected undefined direction, actual ${JSON.stringify(code)}`));
        continue;
      }
      // Only the RHS is parsed: coefficients, exponents and substituted input
      // values on the LHS cannot accidentally satisfy the result assertion.
      const match = code.match(new RegExp('=\\s*' + N + '(?:\\s|$)', 'u'));
      verify(() => assert(match, result + ': unreadable working value ' + code));
      if (match) verify(() => near(Number(match[1]), reference[1], reference[2], `${result} working: ${label}`));
    }
    if (required) {
      verify(() => assert.equal(rows.length, references.length, result + ' reference step count'));
      for (const [pattern] of references) verify(() => assert(rows.some(row => pattern.test(row.querySelector('span')?.textContent.trim())), `${result}: missing working step ${pattern}`));
    }
  }
  async function reference(calculator, name, fn) {
    current = calculator + ': ' + name;
    counts[calculator] = (counts[calculator] || 0) + 1;
    const before = failures.length;
    verify(fn);
    await flush();
    console.log((failures.length === before ? 'PASS ' : 'FAIL ') + current);
  }
  function nox(mode, rows, urea) {
    el('noxMode').value = mode;
    el('noxMode').dispatchEvent(new w.Event('change', { bubbles: true }));
    const nodes = [...d.querySelectorAll('#noxRows .nox-row')];
    assert.equal(nodes.length, rows.length);
    rows.forEach((values, i) => {
      for (const [selector, value] of Object.entries(values)) nodes[i].querySelector(selector).value = String(value);
    });
    fields(urea);
    el('noxUreaMode').dispatchEvent(new w.Event('change', { bubbles: true }));
    click('calcNox', 'resNox');
  }

  // calcNox: dimensional hand balances, g/kWh * kWh / 1000 = kg;
  // kg/t * t = kg. Positive total activity makes weighted factors and urea
  // ratios defined. Urea is accounted separately, without claiming abatement.
  await reference('calcNox', 'two power sources and balanced urea', () => {
    // Valid: finite nonnegative h, kW, factors, L; named sources; activity > 0.
    // A: 10 * 100 = 1000 kWh, 1000 * 5 / 1000 = 5 kg.
    // B: 5 * 200 = 1000 kWh, 1000 * 10 / 1000 = 10 kg.
    // Total 2000 kWh = 2 MWh; 5 + 10 = 15 kg = 0.015 t;
    // weighted factor = 15000 / 2000 = 7.5 g/kWh.
    // Urea = 100 + 20 - 70 = 50 L; 50 / 2 = 25 L/MWh.
    // Tolerances: source kg 0.005; total kg/MWh/L 0.05; t 0.0005;
    // factor/ratio 0.005.
    nox('power', [
      { '.nox-name': 'A', '.nox-a': 10, '.nox-b': 100, '.nox-factor': 5 },
      { '.nox-name': 'B', '.nox-a': 5, '.nox-b': 200, '.nox-factor': 10 }
    ], { noxUreaMode: 'balance', noxUreaStart: 100, noxUreaReceived: 20, noxUreaEnd: 70 });
    numbers(text('resNox'), rx('^# kg NOx · # t$'), [15, 0.015], [0.05, 0.0005], 'NOx total');
    numbers(rowText('resNox', 'Activity basis'), rx('^# MWh$'), [2], [0.05], 'Power basis');
    numbers(rowText('resNox', 'NOx factor summary'), rx('^# g/kWh weighted factor$'), [7.5], [0.005], 'Power factor');
    numbers(rowText('resNox', 'SCR / urea'), rx('^Urea solution used: # L · # L/MWh\\.$'), [50, 25], [0.05, 0.005], 'Power urea');
    work('resNox', [[/^A$/, 5, 0.005], [/^B$/, 10, 0.005], [/^Total NOx$/, 15, 0.05]]);
  });
  await reference('calcNox', 'two fuel sources and total urea', () => {
    // Valid: named sources; finite fuel >= 0, factors >= 0, total fuel > 0.
    // A: 2 * 40 = 80 kg; B: 3 * 60 = 180 kg.
    // 80 + 180 = 260 kg = 0.260 t; fuel 2 + 3 = 5 t;
    // 260 / 5 = 52 kg/t; entered urea 100 L / 5 t = 20 L/t.
    // Tolerances: source kg 0.005; total kg/L 0.05; t NOx 0.0005;
    // fuel/factor/ratio 0.005.
    nox('fuel', [
      { '.nox-name': 'A', '.nox-a': 2, '.nox-factor': 40 },
      { '.nox-name': 'B', '.nox-a': 3, '.nox-factor': 60 }
    ], { noxUreaMode: 'total', noxUreaUsed: 100 });
    numbers(text('resNox'), rx('^# kg NOx · # t$'), [260, 0.260], [0.05, 0.0005], 'NOx total');
    numbers(rowText('resNox', 'Activity basis'), rx('^# t fuel$'), [5], [0.005], 'Fuel basis');
    numbers(rowText('resNox', 'NOx factor summary'), rx('^# kg/t weighted factor$'), [52], [0.005], 'Fuel factor');
    numbers(rowText('resNox', 'SCR / urea'), rx('^Urea solution used: # L · # L/t fuel\\.$'), [100, 20], [0.05, 0.005], 'Fuel urea');
    work('resNox', [[/^A$/, 80, 0.005], [/^B$/, 180, 0.005], [/^Total NOx$/, 260, 0.05]]);
  });
  await reference('calcNox', 'zero factor, inactive source and zero urea', () => {
    // Valid boundary: zero hours/factors/urea allowed; total activity > 0.
    // A: 10 * 100 = 1000 kWh, 1000 * 0 = 0 g.
    // B: 0 * 200 = 0 kWh, 0 * 10 = 0 g. Total 1 MWh, 0 kg = 0 t;
    // 0 / 1000 = 0 g/kWh; 0 L / 1 MWh = 0 L/MWh.
    // Tolerances: source kg 0.005; total kg/MWh/L 0.05; t 0.0005;
    // factor/ratio 0.005.
    nox('power', [
      { '.nox-name': 'A', '.nox-a': 10, '.nox-b': 100, '.nox-factor': 0 },
      { '.nox-name': 'B', '.nox-a': 0, '.nox-b': 200, '.nox-factor': 10 }
    ], { noxUreaMode: 'total', noxUreaUsed: 0 });
    numbers(text('resNox'), rx('^# kg NOx · # t$'), [0, 0], [0.05, 0.0005], 'Zero NOx');
    numbers(rowText('resNox', 'Activity basis'), rx('^# MWh$'), [1], [0.05], 'Power basis');
    numbers(rowText('resNox', 'NOx factor summary'), rx('^# g/kWh weighted factor$'), [0], [0.005], 'Zero factor');
    numbers(rowText('resNox', 'SCR / urea'), rx('^Urea solution used: # L · # L/MWh\\.$'), [0, 0], [0.05, 0.005], 'Zero urea');
    work('resNox', [[/^A$/, 0, 0.005], [/^B$/, 0, 0.005], [/^Total NOx$/, 0, 0.05]]);
  });
  await reference('calcNox', 'zero fuel emission factors without urea tracking', () => {
    // Valid boundary: factors may be 0, fuel positive, urea mode none.
    // 2 * 0 + 3 * 0 = 0 kg = 0 t; 2 + 3 = 5 t fuel;
    // 0 / 5 = 0 kg/t. No urea ratio is claimed when not tracked.
    // Tolerances: source kg 0.005; total kg 0.05; t NOx 0.0005;
    // fuel/factor 0.005.
    nox('fuel', [
      { '.nox-name': 'A', '.nox-a': 2, '.nox-factor': 0 },
      { '.nox-name': 'B', '.nox-a': 3, '.nox-factor': 0 }
    ], { noxUreaMode: 'none' });
    numbers(text('resNox'), rx('^# kg NOx · # t$'), [0, 0], [0.05, 0.0005], 'Zero NOx');
    numbers(rowText('resNox', 'Activity basis'), rx('^# t fuel$'), [5], [0.005], 'Fuel basis');
    numbers(rowText('resNox', 'NOx factor summary'), rx('^# kg/t weighted factor$'), [0], [0.005], 'Zero factor');
    assert.match(rowText('resNox', 'SCR / urea'), /Urea not included/);
    work('resNox', [[/^A$/, 0, 0.005], [/^B$/, 0, 0.005], [/^Total NOx$/, 0, 0.05]]);
  });

  for (const c of [
    // Valid: published > 0, water signed, air draft/margin >= 0, same datum.
    // 25 - 0.8 - 20 - 1 = 3.2 m. Result/step tolerance 0.005 m.
    { name: 'typical clearance', input: { airPublished: 25, airWater: 0.8, airDraft: 20, airMargin: 1 }, expected: 3.2 },
    // Valid boundary: zero margin, other dimensions as above.
    // 25 - 0.8 - 20 - 0 = 4.2 m. Result/step tolerance 0.005 m.
    { name: 'zero margin', input: { airPublished: 25, airWater: 0.8, airDraft: 20, airMargin: 0 }, expected: 4.2 },
    // Valid boundary: water below the shared reference is negative; margin 0.
    // 20 - (-1) - 21 - 0 = 0 m. Result/step tolerance 0.005 m.
    { name: 'exact clearance with water below reference', input: { airPublished: 20, airWater: -1, airDraft: 21, airMargin: 0 }, expected: 0 }
  ]) await reference('calcAirDraft', c.name, () => {
    fields(c.input); click('calcAirDraft', 'resAirDraft');
    numbers(text('resAirDraft'), rx('^# m remaining clearance$'), [c.expected], [0.005], 'Clearance');
    work('resAirDraft', [[/^Remaining clearance$/, c.expected, 0.005]]);
  });

  for (const c of [
    // Valid: chain >= depth >= 0, LOA > 0; straight taut chain, no hawse height.
    // Right triangle: 50^2 - 30^2 = 2500 - 900 = 1600; sqrt(1600) = 40 m;
    // swing 40 + 20 = 60 m. Reach tol 0.05 m, rounded radius tol 0.5 m.
    { name: '3-4-5 chain triangle', input: { anchorChain: 50, anchorDepth: 30, anchorLoa: 20 }, reach: 40, radius: 60 },
    // Valid boundary: chain = depth = 30 m; LOA positive, same geometry model.
    // 30^2 - 30^2 = 0; sqrt(0) = 0 m; 0 + 20 = 20 m.
    // Reach tol 0.05 m; rounded radius tol 0.5 m.
    { name: 'chain exactly reaches depth', input: { anchorChain: 30, anchorDepth: 30, anchorLoa: 20 }, reach: 0, radius: 20 }
  ]) await reference('calcAnchor', c.name, () => {
    fields(c.input); click('calcAnchor', 'resAnchor');
    numbers(text('resAnchor'), rx('^# m maximum approximate swing radius$'), [c.radius], [0.5], 'Swing radius');
    work('resAnchor', [[/^Horizontal chain reach$/, c.reach, 0.05], [/^Swing radius$/, c.radius, 0.5]]);
  });

  for (const c of [
    // Valid: ROB >= 0, consumption > 0, reserve in [0,100]%, constant rate.
    // Reserve 100 * 20/100 = 20 m3; usable 100 - 20 = 80; 80 / 4 = 20 d.
    // All result/step tolerances 0.05 in the stated m3 or day units.
    { name: 'typical reserve', reserve: 20, usable: 80, days: 20, held: 20 },
    // Valid boundary: reserve 0%; ROB 100 m3, consumption 4 m3/day.
    // Held 100 * 0/100 = 0; usable 100; 100 / 4 = 25 d; tol 0.05.
    { name: 'zero percent reserve', reserve: 0, usable: 100, days: 25, held: 0 },
    // Valid boundary: reserve 100%; ROB 100 m3, consumption 4 m3/day.
    // Held 100 * 100/100 = 100; usable 0; 0 / 4 = 0 d; tol 0.05.
    { name: 'all fuel reserved', reserve: 100, usable: 0, days: 0, held: 100 }
  ]) await reference('calcRob', c.name, () => {
    fields({ rob: 100, robDay: 4, robRes: c.reserve }); click('calcRob', 'resRob');
    numbers(text('resRob'), rx('^# m³ usable · # days$'), [c.usable, c.days], [0.05, 0.05], 'ROB/endurance');
    numbers(text('resRob', 'small'), rx('^# m³ held as reserve\\.$'), [c.held], [0.05], 'Reserve held');
    work('resRob', [[/^Usable fuel$/, c.usable, 0.05], [/^Endurance$/, c.days, 0.05]]);
  });

  for (const c of [
    // Valid: capacity/rate > 0; 0 <= current <= capacity; move >= 0; steady pump.
    // 8 + 6 = 14 m3; 14/40 * 100 = 35%; 6/12 = 0.5 h = 0 h 30 min.
    // Tols: volume/h 0.005, fill 0.05%, clock fields exact.
    { name: 'typical transfer', input: { tankCap: 40, tankNow: 8, tankMove: 6, tankRate: 12 }, final: 14, fill: 35, hours: 0.5, clock: [0, 30] },
    // Valid boundary: current + move exactly capacity, positive rate.
    // 8 + 12 = 20 m3; 20/20 * 100 = 100%; 12/8 = 1.5 h = 1 h 30 min.
    // Tols: volume/h 0.005, fill 0.05%, clock fields exact.
    { name: 'receiving tank exactly full', input: { tankCap: 20, tankNow: 8, tankMove: 12, tankRate: 8 }, final: 20, fill: 100, hours: 1.5, clock: [1, 30] },
    // Valid boundary: no transfer into an already full tank; rate > 0.
    // 20 + 0 = 20 m3; 20/20 * 100 = 100%; 0/12 = 0 h = 0 h 0 min.
    // Tols: volume/h 0.005, fill 0.05%, clock fields exact.
    { name: 'zero transfer', input: { tankCap: 20, tankNow: 20, tankMove: 0, tankRate: 12 }, final: 20, fill: 100, hours: 0, clock: [0, 0] }
  ]) await reference('calcTransfer', c.name, () => {
    fields(c.input); click('calcTransfer', 'resTransfer');
    numbers(text('resTransfer'), rx('^# m³ · #% · # h # min$'), [c.final, c.fill, ...c.clock], [0.005, 0.05, 0, 0], 'Transfer');
    work('resTransfer', [[/^Final volume$/, c.final, 0.005], [/^Fill level$/, c.fill, 0.05], [/^Transfer time$/, c.hours, 0.005]]);
  });

  for (const c of [
    // Valid: V >= 0, observed rho > 0, finite temperatures; expansion > 0.
    // Linear expansion only, small alpha*dT; not petroleum custody tables.
    // 35 - 15 = 20 C; 0.0005 * 20 = 0.01; expansion 1.01.
    // 10.1/1.01 = 10 m3; 10.1 * 800 = 8080 kg = 8.080 t.
    // Tols: factor 0.0000005, V/mass 0.0005, reference temperature exact.
    { name: 'warm observed volume', input: { fuelVol: 10.1, fuelDensity: 800, fuelTemp: 35, fuelRef: 15, fuelAlpha: 0.0005 }, factor: 1.01, volume: 10, mass: 8.08 },
    // Valid boundary: observed and reference temperatures both 15 C, rho > 0.
    // 15 - 15 = 0; 1 + 0.00083 * 0 = 1; 12/1 = 12 m3;
    // 12 * 850 = 10200 kg = 10.200 t. Same tolerances as above.
    { name: 'no temperature difference', input: { fuelVol: 12, fuelDensity: 850, fuelTemp: 15, fuelRef: 15, fuelAlpha: 0.00083 }, factor: 1, volume: 12, mass: 10.2 },
    // Valid: colder observed fuel, positive expansion factor, linear model.
    // 5 - 15 = -10 C; 1 + 0.001 * (-10) = 0.99;
    // 9.9/0.99 = 10 m3; 9.9 * 800 = 7920 kg = 7.920 t.
    // Factor tol 0.0000005; V/mass 0.0005; reference temperature exact.
    { name: 'cold observed volume', input: { fuelVol: 9.9, fuelDensity: 800, fuelTemp: 5, fuelRef: 15, fuelAlpha: 0.001 }, factor: 0.99, volume: 10, mass: 7.92 }
  ]) await reference('calcFuelDensity', c.name, () => {
    fields(c.input); click('calcFuelDensity', 'resFuelDensity');
    numbers(text('resFuelDensity'), rx('^# m³ @ #°C · # t$'), [c.volume, 15, c.mass], [0.0005, 0, 0.0005], 'Temperature correction');
    work('resFuelDensity', [[/^Expansion factor$/, c.factor, 0.0000005], [/^Volume at reference temperature$/, c.volume, 0.0005], [/^Mass$/, c.mass, 0.0005]]);
  });

  for (const c of [
    // Valid: V >= 0, total V > 0, rho > 0, S in [0,100]% m/m;
    // common reference temperature, additive volumes, no compatibility claim.
    // A: 10*800 = 8000 kg = 8 t, sulphur 8000*0.1/100 = 8 kg.
    // B: 20*1000 = 20000 kg = 20 t, sulphur 20000*0.5/100 = 100 kg.
    // Total V 30 m3, mass 28000 kg; density 28000/30 = 933.3333333333;
    // sulphur 108/28000 * 100 = 0.385714285714% (not a volume average).
    // Tols: V/mass in summary 0.005, density 0.05, S/step mass 0.0005.
    { name: 'unequal densities, mass-weighted sulphur', input: { blendVA: 10, blendDA: 800, blendSA: 0.1, blendVB: 20, blendDB: 1000, blendSB: 0.5 }, volume: 30, density: 933.3333333333, sulphur: 0.385714285714, ma: 8, mb: 20 },
    // Valid boundary: equal positive densities, same temperature, additive V.
    // 10*840 = 8400 kg; 30*840 = 25200 kg; total 33600 kg in 40 m3;
    // rho = 33600/40 = 840; S mass = 8.4 + 126 = 134.4 kg;
    // 134.4/33600 * 100 = 0.4%. Same tolerances as above.
    { name: 'equal component densities', input: { blendVA: 10, blendDA: 840, blendSA: 0.1, blendVB: 30, blendDB: 840, blendSB: 0.5 }, volume: 40, density: 840, sulphur: 0.4, ma: 8.4, mb: 25.2 },
    // Valid boundary: zero A volume, positive densities; S may reach 100%.
    // A: 0*800 = 0 kg, 0 kg sulphur even with 100% input.
    // B: 10*900 = 9000 kg = 9 t; S = 9000*0.5/100 = 45 kg;
    // rho = 9000/10 = 900; S = 45/9000 * 100 = 0.5%. Same tolerances.
    { name: 'zero-volume component', input: { blendVA: 0, blendDA: 800, blendSA: 100, blendVB: 10, blendDB: 900, blendSB: 0.5 }, volume: 10, density: 900, sulphur: 0.5, ma: 0, mb: 9 }
  ]) await reference('calcBlend', c.name, () => {
    fields(c.input); click('calcBlend', 'resBlend');
    numbers(text('resBlend'), rx('^# m³ · # kg/m³ · #% S$'), [c.volume, c.density, c.sulphur], [0.005, 0.05, 0.0005], 'Blend');
    numbers(text('resBlend', 'small'), rx('^Mass basis: Fuel A # t \\+ Fuel B # t\\.'), [c.ma, c.mb], [0.005, 0.005], 'Component masses');
    work('resBlend', [[/^Mass of fuel A$/, c.ma, 0.0005], [/^Mass of fuel B$/, c.mb, 0.0005], [/^Blend density$/, c.density, 0.05], [/^Sulphur content \(mass-weighted\)$/, c.sulphur, 0.0005]]);
  });

  // Arc length, independently of the haversine implementation: the documented
  // model sphere has radius 3440.065 NM. On the equator each 1-degree leg is
  // 3440.065 * 3.141592653589793 / 180 = 60.040460732619 NM.
  // Two legs sum to 120.080921465237 NM; / 10 kn = 12.008092146524 h,
  // or 720.48552879144 min, rounded to 12 h 0 min.
  for (const c of [
    // Valid: finite coordinates, nonzero route, speed > 0, fuel/day >= 0.
    // At 4 m3/day: 12.008092146524 / 24 * 4 = 2.001348691087 m3.
    // Tols: distance 0.05 NM; fuel 0.005 m3; clock fields exact;
    // working time 0.005 h (2 dp).
    { name: 'two equatorial legs, both buttons', rate: 4, fuel: 2.001348691087 },
    // Valid boundary: same route/speed, zero daily fuel consumption.
    // 12.008092146524 / 24 * 0 = 0 m3; distance/time unchanged.
    // Same distance/time tolerances; fuel 0.005 m3.
    { name: 'zero consumption, both buttons', rate: 0, fuel: 0 }
  ]) await reference('calcRouteFuel', c.name, () => {
    fields({ pSpeed: 10, pFuel: c.rate }); el('saveProfile').click();
    for (const [button, result] of [['calcRouteFuel', 'resRouteFuel'], ['fuelRouteBtn', 'fuelRouteRes']]) {
      click(button, result);
      if (result === 'resRouteFuel') numbers(text(result), rx('^# NM · # h # min · # m³$'), [120.080921465237, 12, 0, c.fuel], [0.05, 0, 0, 0.005], result);
      else {
        numbers(text(result), rx('^# m³ for # NM$'), [c.fuel, 120.080921465237], [0.005, 0.05], result);
        numbers(text(result, 'small'), rx('^# h # min at # kn\\.$'), [12, 0, 10], [0, 0, 0], result + ' time');
      }
      work(result, [[/^Passage time$/, 12.008092146524, 0.005], [/^Fuel for the passage$/, c.fuel, 0.005]], result === 'resRouteFuel');
    }
  });

  // calcTrueWind convention checked from FIRST PRINCIPLES (Galilean relative
  // velocity): air velocity relative to vessel = earth air velocity - vessel
  // velocity, hence earth air velocity = apparent TO vector + vessel vector.
  // Coordinates below are (east,north), bearings clockwise from north.
  // Wind direction is FROM: reverse the resulting air-velocity TO vector.
  // Relative FROM angle is positive clockwise from the bow (starboard +90),
  // negative to port (-90), 0 ahead, 180 astern. Speeds must be finite >= 0;
  // course/angle finite; steady, horizontal motion without sensor corrections.
  // For every case, speed tolerance is 0.05 kn and FROM tolerance 0.5 degree;
  // any displayed component steps use 0.005 kn (2 dp) or tighter precision.
  // Apparent FROM bearings are hand sums of course + relative angle, wrapped
  // to [0,360): 36.869897645844, 0, 180, 90, -90 + 360 = 270,
  // 90 + 90 = 180, and 0 degrees T; displayed bearing tolerance 0.5 degree.
  for (const c of [
    // Valid steady oblique case. cos(36.869897645844)=4/5, sin=3/5.
    // Apparent 5 kn FROM starboard bow -> TO (-3,-4) kn;
    // vessel (0,+3) -> true (-3,-1). Speed sqrt(9+1)=3.162277660168 kn;
    // FROM vector (+3,+1), atan(3/1)=71.565051177078 degrees T.
    { name: 'oblique wind by 3-4-5 components', course: 0, ship: 3, rel: 36.869897645844, aws: 5, appFrom: 36.869897645844, speed: 3.162277660168, from: 71.565051177078, ax: -3, ay: -4, vx: 0, vy: 3, tx: -3, ty: -1 },
    // Valid headwind boundary at relative 0. Apparent TO (0,-15), ship
    // (0,+5), true (0,-10): 10 kn FROM north = 0 degrees T.
    { name: 'headwind', course: 0, ship: 5, rel: 0, aws: 15, appFrom: 0, speed: 10, from: 0, ax: 0, ay: -15, vx: 0, vy: 5, tx: 0, ty: -10 },
    // Valid tailwind boundary at relative 180. Apparent TO (0,+5), ship
    // (0,+5), true (0,+10): 10 kn FROM south = 180 degrees T.
    { name: 'tailwind', course: 0, ship: 5, rel: 180, aws: 5, appFrom: 180, speed: 10, from: 180, ax: 0, ay: 5, vx: 0, vy: 5, tx: 0, ty: 10 },
    // Valid starboard beam boundary, +90 relative. Apparent TO (-4,0), ship
    // (0,+3), true (-4,+3): sqrt(16+9)=5 kn; FROM (+4,-3),
    // 180 - atan(4/3) = 126.869897645844 degrees T.
    { name: 'positive starboard beam angle', course: 0, ship: 3, rel: 90, aws: 4, appFrom: 90, speed: 5, from: 126.869897645844, ax: -4, ay: 0, vx: 0, vy: 3, tx: -4, ty: 3 },
    // Valid signed port beam boundary, -90 relative. Apparent TO (+4,0), ship
    // (0,+3), true (+4,+3): 5 kn; FROM (-4,-3),
    // 180 + atan(4/3) = 233.130102354156 degrees T.
    { name: 'negative port beam angle', course: 0, ship: 3, rel: -90, aws: 4, appFrom: 270, speed: 5, from: 233.130102354156, ax: 4, ay: 0, vx: 0, vy: 3, tx: 4, ty: 3 },
    // Valid eastbound case, +90 relative. Apparent FROM south -> TO (0,+4),
    // ship (+3,0), true (+3,+4): 5 kn; FROM (-3,-4),
    // 180 + atan(3/4) = 216.869897645844 degrees T (rotation check).
    { name: 'beam wind with eastbound vessel', course: 90, ship: 3, rel: 90, aws: 4, appFrom: 180, speed: 5, from: 216.869897645844, ax: 0, ay: 4, vx: 3, vy: 0, tx: 3, ty: 4 },
    // Valid calm boundary: apparent TO (0,-10) + ship (0,+10) = (0,0).
    // Speed = 0 kn (tol 0.05); FROM has NO direction, because a zero vector
    // has no bearing. An arbitrary numeric FROM bearing is a disagreement.
    { name: 'cancelling headwind has undefined direction', course: 0, ship: 10, rel: 0, aws: 10, appFrom: 0, speed: 0, from: null, ax: 0, ay: -10, vx: 0, vy: 10, tx: 0, ty: 0 }
  ]) await reference('calcTrueWind', c.name, () => {
    fields({ twCourse: c.course, twShip: c.ship, twRel: c.rel, twAws: c.aws }); click('calcTrueWind', 'resTrueWind');
    if (c.from === null) {
      numbers(text('resTrueWind'), rx('^# kn'), [0], [0.05], 'Calm true wind');
      verify(() => assert.match(text('resTrueWind'), /undefined|indeterminate|calm.*direction|direction.*calm/i,
        `Expected 0 kn with undefined FROM direction; actual ${JSON.stringify(text('resTrueWind'))}`));
    } else numbers(text('resTrueWind'), rx('^# kn from #°T$'), [c.speed, c.from], [0.05, 0.5], 'True wind speed/FROM');
    work('resTrueWind', [
      [/^Apparent wind direction \(from\)$/, c.appFrom, 0.5],
      [/^True wind east component$/, c.tx, 0.005], [/^True wind north component$/, c.ty, 0.005],
      [/^True wind speed$/, c.speed, 0.05]
    ]);
  });

  function weather(rows, limits) {
    fields(limits);
    while (d.querySelectorAll('#windowRows .weather-row').length < rows.length) el('addWindowRow').click();
    while (d.querySelectorAll('#windowRows .weather-row').length > rows.length) d.querySelector('#windowRows .remove-row').click();
    [...d.querySelectorAll('#windowRows .weather-row')].forEach((node, i) => {
      ['.ww-time', '.ww-hs', '.ww-wind', '.ww-current'].forEach((selector, j) => { node.querySelector(selector).value = String(rows[i][j]); });
    });
    click('findWindow', 'wwResult');
  }
  for (const c of [
    // Valid: finite Hs/wind/current >= 0; limits >= 0; ordered supplied rows.
    // Limits (2 m,20 kn,1 kn). Rows 08/09 pass; 10 fails Hs 3>2,
    // 11 fails wind 30>20, 12 fails current 2>1; 13/14 pass.
    // Two runs: 08:00-09:00 (2 rows), 13:00-14:00 (2 rows).
    // Counts/clock fields exact; these are row runs, not interpolated durations.
    { name: 'separate windows and each rejecting limit', limits: { wwHs: 2, wwWind: 20, wwCur: 1 }, rows: [['08:00', 1, 10, 0.5], ['09:00', 1.5, 15, 0.8], ['10:00', 3, 10, 0.5], ['11:00', 1, 30, 0.5], ['12:00', 1, 10, 2], ['13:00', 1.5, 15, 0.8], ['14:00', 1, 10, 0.5]], groups: [[8, 0, 9, 0, 2], [13, 0, 14, 0, 2]], windows: 2, checked: 7, matching: 4,
      steps: [[/^08:00$/, 'within limits'], [/^09:00$/, 'within limits'], [/^10:00$/, 'outside limits'], [/^11:00$/, 'outside limits'], [/^12:00$/, 'outside limits'], [/^13:00$/, 'within limits'], [/^14:00$/, 'within limits']] },
    // Valid inclusive boundary: limits (2,20,1), first two rows equal ALL
    // limits and pass; third Hs 2.001 > 2 fails. One 08:00-09:00 run of 2.
    // Counts and clock fields exact; nonnegative complete chronological rows.
    { name: 'Hs, wind and current exactly at limits', limits: { wwHs: 2, wwWind: 20, wwCur: 1 }, rows: [['08:00', 2, 20, 1], ['09:00', 2, 20, 1], ['10:00', 2.001, 20, 1]], groups: [[8, 0, 9, 0, 2]], windows: 1, checked: 3, matching: 2,
      steps: [[/^08:00$/, 'within limits'], [/^09:00$/, 'within limits'], [/^10:00$/, 'outside limits']] },
    // Valid zero boundary: all three limits 0; all measurements 0 <= 0.
    // 08,09,10 form one run, 08:00-10:00, exactly 3 rows; counts/time tol 0.
    { name: 'zero limits and zero weather', limits: { wwHs: 0, wwWind: 0, wwCur: 0 }, rows: [['08:00', 0, 0, 0], ['09:00', 0, 0, 0], ['10:00', 0, 0, 0]], groups: [[8, 0, 10, 0, 3]], windows: 1, checked: 3, matching: 3,
      steps: [[/^08:00$/, 'within limits'], [/^09:00$/, 'within limits'], [/^10:00$/, 'within limits']] },
    // Valid: nonnegative complete rows, zero Hs limit. Every Hs 0.1 > 0;
    // no row passes, so 0 matching rows and 0 windows (exact counts).
    { name: 'no matching window', limits: { wwHs: 0, wwWind: 20, wwCur: 1 }, rows: [['08:00', 0.1, 0, 0], ['09:00', 0.1, 0, 0], ['10:00', 0.1, 0, 0]], groups: [], windows: 0, checked: 3, matching: 0,
      steps: [[/^08:00$/, 'outside limits'], [/^09:00$/, 'outside limits'], [/^10:00$/, 'outside limits']] }
  ]) await reference('findWindow', c.name, () => {
    weather(c.rows, c.limits);
    const main = el('wwResult').querySelector('strong'); assert(main);
    const lines = main.innerHTML.split(/<br\s*\/?\s*>/iu).map(html => {
      const node = d.createElement('span'); node.innerHTML = html; return node.textContent.trim();
    });
    if (c.groups.length) {
      verify(() => assert.equal(lines.length, c.windows, 'Window count'));
      c.groups.forEach((group, i) => numbers(lines[i] || '', rx('^#:# → #:# \\(# consecutive rows?\\)$'), group, [0, 0, 0, 0, 0], 'Window ' + (i + 1)));
    } else verify(() => assert.equal(main.textContent, 'No matching window in the supplied rows.'));
    work('wwResult', c.steps);
  });

  await flush();
  verify(() => assert.deepEqual(errors, [], 'Uncaught app errors'));
  console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', cases: Object.values(counts).reduce((a, b) => a + b, 0), casesPerCalculator: counts, handlerRuns, numericAssertions: assertions, noteAssertions, panelRuns, checkedPanels: [...panels], disagreements: failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
