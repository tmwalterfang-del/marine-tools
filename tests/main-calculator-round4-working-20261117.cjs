// Independent literal hand references through the real DOM handlers, not copies
// of their formulas. Each case documents inputs, arithmetic and valid range.
// Raw/export tolerance: 1e-10 absolute; displayed steps: half the last place
// plus 1e-9 (3 or 6 decimal places). No layout/device/translation acceptance.
// Run with jsdom@26.1.0 on NODE_PATH.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let dom;

(async () => {
  dom = new JSDOM(read('index.html'), { url: 'https://round4-working.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, tasks = [], errors = [], results = new Map(), downloads = [], snapshots = new Map();
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
  w.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:round4-' + downloads.length; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  d.addEventListener('mt-calculation-result', e => results.set(e.target.id, e.detail.valid));
  for (const file of ['product-ux-20261031.js', 'navigation-math.js', 'voyage-estimate-v861.js', 'voyage-planning-draft-v1.js', 'app.js', 'ui-v854.js']) w.eval(read(file));
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  for (const page of ['fuel', 'engineering', 'electrical']) w.__marineToolsOpenPage(page);
  async function flush() {
    for (let i = 0; i < 8; i++) { const batch = tasks.splice(0); for (const fn of batch) fn(); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(tasks.length, 0, 'Short UI tasks settled');
  }
  await flush();
  let handlerRuns = 0, numericReferences = 0, workingRuns = 0, stepReferences = 0, invalidRuns = 0;
  const el = id => { const node = d.getElementById(id); assert(node, 'Missing #' + id); return node; };
  const box = result => d.querySelector(`.calc-work[data-for="${result}"]`);
  const machine = values => Object.fromEntries(Object.entries(values).map(([key, [value, unit]]) => [key, { value, unit }]));
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
      columns.forEach(([className, type = 'text'], i) => {
        const input = d.createElement('input'); input.type = type; input.className = className; input.value = String(valuesInRow[i]); row.append(input);
      });
      host.append(row);
    }
    host.dispatchEvent(new w.Event('input', { bubbles: true }));
  }
  const endRows = values => rows('endScenarioRows', 'end-row', [['end-rate']], values.map(v => [v]));
  const speedRows = values => rows('speedFuelRows', 'speed-row', [['sf-speed'], ['sf-cons']], values);
  const bunkRows = values => rows('bunkRows', 'bunk-row', [['bunk-date', 'date'], ['bunk-vol'], ['bunk-dens']], values);
  const loRows = values => rows('loRows', 'lo-row', [['lo-date', 'date'], ['lo-hours'], ['lo-liters']], values);
  function near(actual, expected, tolerance, label) {
    numericReferences++; assert(Number.isFinite(actual), label + ': finite value');
    assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected} +/- ${tolerance}`);
  }
  function click(button, result, valid = true) {
    results.delete(result); el(button).click(); handlerRuns++;
    assert.equal(results.get(result), valid, `${button}: ${el(result).textContent}`);
    assert.doesNotMatch(el(result).textContent, /NaN|Infinity/);
    if (!valid) { invalidRuns++; assert.equal(box(result), null, result + ': invalid result removes old working/exports'); }
    return el(result).textContent;
  }
  async function download(result, type) {
    const before = downloads.length; box(result).querySelector('.calc-work-' + type).click();
    assert.equal(downloads.length, before + 1, result + ': enabled export');
    return downloads.at(-1).text();
  }
  const record = async result => JSON.parse(await download(result, 'json'));
  const cardValues = result => [...el(result).closest('.tool-card').querySelectorAll('input,select')].map(node => node.value);
  // Reference tuple: literal [label, substituted expression, hand value, unit,
  // optional display tolerance]. Null means mathematically undefined (exact).
  // Every emitted step must match one tuple.
  async function working(button, result, tool, inputs, outputs, references) {
    workingRuns++; click(button, result);
    assert.equal(d.querySelectorAll(`.calc-work[data-for="${result}"]`).length, 1, 'One working panel per result');
    const r = await record(result), csv = await download(result, 'csv');
    assert.equal(r.tool, tool); assert.deepEqual(r.inputs, machine(inputs));
    assert.deepEqual(Object.keys(r.outputs).sort(), Object.keys(outputs).sort());
    for (const [name, [value, unit]] of Object.entries(outputs)) {
      if (value === null) assert.equal(r.outputs[name].value, null, result + ': undefined output ' + name);
      else near(r.outputs[name].value, value, 1e-10, result + ': output ' + name);
      assert.equal(r.outputs[name].unit, unit);
      assert(csv.includes(`,output,${name},${r.outputs[name].value ?? ''},${unit}`), 'CSV machine value: ' + name);
    }
    const steps = [...box(result).querySelectorAll('.calc-work-steps > li')];
    assert.equal(steps.length, references.length, result + ': every step referenced');
    assert.equal(r.steps.length, references.length);
    steps.forEach((li, i) => {
      const [label, expression, value, unit, tolerance = 0.000500001] = references[i]; stepReferences++;
      assert.equal(li.querySelector('span').textContent, label);
      const parts = li.querySelector('code').textContent.split(' = ');
      assert.equal(parts.length, 2); assert.equal(parts[0], expression, result + ': substituted expression');
      if (value === null) assert.equal(parts[1], '—' + (unit ? ' ' + unit : ''), result + ': undefined displayed step ' + label);
      else {
        const number = parts[1].match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?: (.*))?$/i);
        assert(number, result + ': numeric RHS'); assert.equal(number[2] || '', unit);
        near(Number(number[1]), value, tolerance, result + ': displayed step ' + label);
      }
      assert.equal(r.steps[i].label, label); assert.equal(r.steps[i].unit, unit);
      if (value === null) assert.equal(r.steps[i].value, null, result + ': undefined raw step ' + label);
      else near(r.steps[i].value, value, 1e-10, result + ': raw step ' + label);
      assert(csv.includes(`,step,${label},${r.steps[i].value ?? ''},${unit}`), 'CSV step value: ' + label);
    });
    assert(r.validity.length > 0);
    assert.deepEqual([...box(result).querySelectorAll('.calc-work-validity li')].map(li => li.textContent), r.validity);
    snapshots.set(result, { button, record: r, inputs: cardValues(result) });
    return r;
  }

  // Endurance: ROB 50 m3, reserve 20%; usable=50*(1-.2)=40 m3.
  // Rates 4,5,8 m3/day -> 40/4=10, 40/5=8, 40/8=5 days.
  // Domain: finite ROB>=0, 0<=reserve<100; at least one positive rate.
  fields({ endRob: '50,0', endReserve: 20 }); endRows(['4,0', 5, 8]);
  await working('calcEndCompare', 'resEndCompare', 'endurance-scenarios', { remainingOnBoard: [50, 'm³'], reserve: [20, '%'], scenario1: [4, 'm³/day'], scenario2: [5, 'm³/day'], scenario3: [8, 'm³/day'] }, { usableFuel: [40, 'm³'], endurance1: [10, 'day'], endurance2: [8, 'day'], endurance3: [5, 'day'] }, [
    ['Usable fuel', '50.000 × (1 − 20.000 / 100)', 40, 'm³'],
    ['Endurance', '40.000 / 4.000', 10, 'day'], ['Endurance', '40.000 / 5.000', 8, 'day'], ['Endurance', '40.000 / 8.000', 5, 'day']
  ]);
  // Valid lower boundary: 0 ROB at 0% reserve leaves exactly 0 days.
  fields({ endRob: 0, endReserve: 0 }); endRows([4]);
  await working('calcEndCompare', 'resEndCompare', 'endurance-scenarios', { remainingOnBoard: [0, 'm³'], reserve: [0, '%'], scenario1: [4, 'm³/day'] }, { usableFuel: [0, 'm³'], endurance1: [0, 'day'] }, [['Usable fuel', '0.000 × (1 − 0.000 / 100)', 0, 'm³'], ['Endurance', '0.000 / 4.000', 0, 'day']]);

  // Speed/fuel points deliberately unsorted: (10,6),(6,2),(8,3).
  // At 7: 2+(1/2)*(3-2)=2.5; at 9: 3+(1/2)*(6-3)=4.5.
  // Endpoints 6 and 10 give exactly 2 and 6. Valid: >=2 unique finite
  // nonnegative speeds/consumptions; target in measured closed interval.
  speedRows([[10, 6], [6, 2], [8, 3]]);
  for (const [target, expected, expression] of [
    [7, 2.5, '2.000 + (7.000 − 6.000) / (8.000 − 6.000) × (3.000 − 2.000)'],
    [9, 4.5, '3.000 + (9.000 − 8.000) / (10.000 − 8.000) × (6.000 − 3.000)'],
    [6, 2, '2.000 + (6.000 − 6.000) / (8.000 − 6.000) × (3.000 − 2.000)'],
    [10, 6, '3.000 + (10.000 − 8.000) / (10.000 − 8.000) × (6.000 − 3.000)']
  ]) {
    fields({ targetSpeed: target });
    await working('calcSpeedFuel', 'resSpeedFuel', 'speed-fuel-interpolation', { targetSpeed: [target, 'kn'], speed1: [6, 'kn'], consumption1: [2, 'm³/day'], speed2: [8, 'kn'], consumption2: [3, 'm³/day'], speed3: [10, 'kn'], consumption3: [6, 'm³/day'] }, { interpolatedConsumption: [expected, 'm³/day'] }, [['Interpolated consumption', expression, expected, 'm³/day']]);
  }

  // Liquid: 10 m3 * 840 kg/m3 = 8400 kg = 8.4 t; reverse gives 10 m3
  // and 10000 L. Nonterminating reverse: 1 t / 900 kg/m3 = 10/9 m3,
  // 10000/9 L. Range: nonnegative amount, positive density at volume temp.
  const product = 'Owner blend'; const option = d.createElement('option'); option.value = option.textContent = product; el('fuProduct').append(option);
  fields({ fuProduct: product, fuMode: 'v2m', fuAmount: '10,0', fuDensity: 840 });
  await working('calcFuelUrea', 'resFuelUrea', 'liquid-volume-mass', { product: [product, ''], volume: [10, 'm³'], density: [840, 'kg/m³'] }, { massKg: [8400, 'kg'], massTonnes: [8.4, 't'] }, [[product, '10.000 × 840.000', 8400, 'kg'], ['Mass in tonnes', '8400.000 / 1000', 8.4, 't']]);
  fields({ fuMode: 'm2v', fuAmount: '8,4' });
  await working('calcFuelUrea', 'resFuelUrea', 'liquid-volume-mass', { product: [product, ''], mass: [8.4, 't'], density: [840, 'kg/m³'] }, { volume: [10, 'm³'], volumeLitres: [10000, 'L'] }, [[product, '8.400 × 1000 / 840.000', 10, 'm³'], ['Volume in litres', '10.000000 × 1000', 10000, 'L']]);
  fields({ fuAmount: 1, fuDensity: 900 });
  await working('calcFuelUrea', 'resFuelUrea', 'liquid-volume-mass', { product: [product, ''], mass: [1, 't'], density: [900, 'kg/m³'] }, { volume: [1.1111111111111112, 'm³'], volumeLitres: [1111.111111111111, 'L'] }, [[product, '1.000 × 1000 / 900.000', 1.1111111111111112, 'm³'], ['Volume in litres', '1.111111 × 1000', 1111.111111111111, 'L']]);

  // Bunkering: Jan 1 20*800=16000 kg; Jan 11 30*900=27000 kg;
  // Jan 21 10*1000=10000 kg. Total=60 m3, 53000 kg/1000=53 t;
  // weighted=53000/60=883 1/3 kg/m3; parcel=60/3=20; interval=20/2=10 d.
  // Domain: >=1 valid dated row, volume>=0, density>0. Dates sorted by app.
  bunkRows([['2026-01-21', 10, 1000], ['2026-01-01', 20, 800], ['2026-01-11', 30, 900]]);
  await working('calcBunkOverview', 'resBunkOverview', 'bunkering-overview', { date1: ['2026-01-01', ''], volume1: [20, 'm³'], density1: [800, 'kg/m³'], date2: ['2026-01-11', ''], volume2: [30, 'm³'], density2: [900, 'kg/m³'], date3: ['2026-01-21', ''], volume3: [10, 'm³'], density3: [1000, 'kg/m³'] }, { totalVolume: [60, 'm³'], totalMass: [53, 't'], weightedDensity: [883.3333333333334, 'kg/m³'], averageDelivery: [20, 'm³'], averageInterval: [10, 'day'] }, [
    ['2026-01-01', '20.000 × 800.000', 16000, 'kg'], ['2026-01-11', '30.000 × 900.000', 27000, 'kg'], ['2026-01-21', '10.000 × 1000.000', 10000, 'kg'],
    ['Total volume', '20.000 + 30.000 + 10.000', 60, 'm³'], ['Total mass in tonnes', '(16000.000 + 27000.000 + 10000.000) / 1000', 53, 't'],
    ['Weighted density', '53000.000 / 60.000', 883.3333333333334, 'kg/m³'], ['Average delivery', '60.000 / 3', 20, 'm³'], ['Average interval', '20.000 / (3 − 1)', 10, 'day']
  ]);
  // Single zero-volume record: mass and average delivery are 0; weighted
  // density is 0/0, undefined. No interval with one row.
  bunkRows([['2026-01-01', 0, 800]]);
  const emptyBunk = await working('calcBunkOverview', 'resBunkOverview', 'bunkering-overview', { date1: ['2026-01-01', ''], volume1: [0, 'm³'], density1: [800, 'kg/m³'] }, { totalVolume: [0, 'm³'], totalMass: [0, 't'], weightedDensity: [null, 'kg/m³'], averageDelivery: [0, 'm³'] }, [['2026-01-01', '0.000 × 800.000', 0, 'kg'], ['Total volume', '0.000', 0, 'm³'], ['Total mass in tonnes', '(0.000) / 1000', 0, 't'], ['Weighted density', 'No delivered volume', null, 'kg/m³'], ['Average delivery', '0.000 / 1', 0, 'm³']]);
  assert.equal(el('resBunkOverview').querySelector('tr > td').textContent, '— kg/m³');
  assert(emptyBunk.validity.includes('With zero total volume, weighted density is undefined and is not shown.'));

  // Pipe: 600 L/min * .06 = 36 m3/h; /3600=.01 m3/s; 200/1000=.2 m;
  // area=pi*.2^2/4=pi/100=.031415926535897934 m2; v=1/pi=.3183098861837907.
  // Range: nonnegative finite flow, positive finite internal diameter, full pipe.
  for (const [unit, amount, firstExpression, expectedInputUnit] of [['m3h', '36,0', '36.000 × 1.00', 'm³/h'], ['lmin', 600, '600.000 × 0.06', 'L/min']]) {
    fields({ pipeQUnit: unit, pipeQ: amount, pipeD: 200 });
    await working('calcPipe', 'resPipe', 'pipe-velocity', { flow: [unit === 'm3h' ? 36 : 600, expectedInputUnit], internalDiameter: [200, 'mm'] }, { flowM3h: [36, 'm³/h'], flowM3s: [0.01, 'm³/s'], internalArea: [0.031415926535897934, 'm²'], velocity: [0.3183098861837907, 'm/s'] }, [
      ['Flow in cubic metres per hour', firstExpression, 36, 'm³/h'], ['Internal diameter in metres', '200.000 / 1000', 0.2, 'm', 0.000000501],
      ['Internal cross-sectional area', 'π × 0.200000² / 4', 0.031415926535897934, 'm²', 0.000000501], ['Flow in cubic metres per second', '36.000 / 3600', 0.01, 'm³/s', 0.000000501], ['Mean velocity', '0.010000000 / 0.031415927', 0.3183098861837907, 'm/s']
    ]);
  }

  // Tank: coordinates 1,3; volumes 30,10. At 1,2,3 fractions=0,.5,1
  // and volumes=30,20,10. Reverse coordinate order keeps midpoint 20.
  // Range: distinct finite coordinates, nonnegative volumes; no extrapolation.
  const tank = { tankLowX: 1, tankLowV: 30, tankHighX: 3, tankHighV: 10 };
  for (const [patch, fraction, expected, expression1, expression2] of [
    [{ tankMeasure: 1 }, 0, 30, '(1.000000 − 1.000000) / (3.000000 − 1.000000)', '30.000000 + 0.000000 × (10.000000 − 30.000000)'],
    [{ tankMeasure: '2,0' }, 0.5, 20, '(2.000000 − 1.000000) / (3.000000 − 1.000000)', '30.000000 + 0.500000 × (10.000000 − 30.000000)'],
    [{ tankMeasure: 3 }, 1, 10, '(3.000000 − 1.000000) / (3.000000 − 1.000000)', '30.000000 + 1.000000 × (10.000000 − 30.000000)'],
    [{ tankLowX: 3, tankLowV: 10, tankHighX: 1, tankHighV: 30, tankMeasure: 2 }, 0.5, 20, '(2.000000 − 3.000000) / (1.000000 − 3.000000)', '10.000000 + 0.500000 × (30.000000 − 10.000000)']
  ]) {
    const values = { ...tank, ...patch }; fields(values);
    await working('calcTankInterp', 'resTankInterp', 'tank-table-interpolation', { firstCoordinate: [values.tankLowX, ''], firstVolume: [values.tankLowV, 'm³'], measuredCoordinate: [patch.tankMeasure === '2,0' ? 2 : patch.tankMeasure, ''], secondCoordinate: [values.tankHighX, ''], secondVolume: [values.tankHighV, 'm³'] }, { fraction: [fraction, ''], volume: [expected, 'm³'] }, [['Interpolation fraction', expression1, fraction, '', 0.000000501], ['Interpolated volume', expression2, expected, 'm³']]);
  }

  // Transfer: 18/12=1.5 h; 18/1.5=12 m3/h; 12*1.5=18 m3.
  // Range: nonnegative numerator/multiplicands, strictly positive divisor.
  // Inactive inputs deliberately blank; they must not enter the working record.
  for (const [mode, values, inputs, outputs, reference] of [
    ['time', { flowVol: '18,0', flowRate: 12, flowHours: '' }, { volume: [18, 'm³'], flow: [12, 'm³/h'] }, { time: [1.5, 'h'] }, ['Transfer time', '18.000 / 12.000', 1.5, 'h']],
    ['flow', { flowVol: 18, flowRate: '', flowHours: '1,5' }, { volume: [18, 'm³'], time: [1.5, 'h'] }, { flow: [12, 'm³/h'] }, ['Required flow', '18.000 / 1.500', 12, 'm³/h']],
    ['volume', { flowVol: '', flowRate: 12, flowHours: 1.5 }, { flow: [12, 'm³/h'], time: [1.5, 'h'] }, { volume: [18, 'm³'] }, ['Transferred volume', '12.000 × 1.500', 18, 'm³']]
  ]) { fields({ flowMode: mode, ...values }); await working('calcFlowTime', 'resFlowTime', 'flow-fill-time', inputs, outputs, [reference]); }

  // Hydrostatics with g=9.80665 m/s2: 10 m head at rho=1000,1025,850
  // gives 98066.5,100518.1625,83356.525 Pa respectively, /100000 =
  // .980665,1.005181625,.83356525 bar. Inverting yields 10 m.
  // Range: value>=0, rho>0; static, constant density, no flow-loss correction.
  for (const [fluid, density, pressure, input, pressureText] of [
    ['fresh', 1000, 0.980665, '0,980665', '0.980665'],
    ['sea', 1025, 1.005181625, 1.005181625, '1.005182'],
    ['custom', 850, 0.83356525, 0.83356525, '0.833565'],
    ['fuel', 850, 0.83356525, 0.83356525, '0.833565']
  ]) {
    fields({ phFluid: fluid, phDensity: density, phMode: 'bar-head', phValue: input });
    await working('calcPressureHead', 'resPressureHead', 'pressure-head', { pressure: [pressure, 'bar'], density: [density, 'kg/m³'], gravity: [9.80665, 'm/s²'] }, { head: [10, 'm'] }, [['Static head', `${pressureText} × 100000 / (${density}.000 × 9.80665)`, 10, 'm']]);
    fields({ phMode: 'head-bar', phValue: 10 });
    await working('calcPressureHead', 'resPressureHead', 'pressure-head', { head: [10, 'm'], density: [density, 'kg/m³'], gravity: [9.80665, 'm/s²'] }, { pressure: [pressure, 'bar'] }, [['Static pressure', `10.000000 × ${density}.000 × 9.80665 / 100000`, pressure, 'bar', 0.000000501]]);
  }

  // Generator: 320/500*100=64%, 500-320=180 kW. At load 600:
  // 120% and -100 kW. At 0: 0% and 500 kW. Range c>0, load>=0;
  // overload is reported rather than rejected. No equipment acceptance claim.
  for (const [load, percent, margin, status] of [[320, 64, 180, 'ok'], [600, 120, -100, 'alert'], [0, 0, 500, 'caution']]) {
    fields({ genCap: 500, genLoad: load });
    await working('calcGenMargin', 'resGenMargin', 'generator-load-margin', { onlineCapacity: [500, 'kW'], currentLoad: [load, 'kW'] }, { loadPercentage: [percent, '%'], remainingCapacity: [margin, 'kW'] }, [['Load percentage', `${load}.000 / 500.000 × 100`, percent, '%'], ['Remaining online capacity', `500.000 − ${load}.000`, margin, 'kW']]);
    assert(el('resGenMargin').classList.contains(status));
  }

  // Chemical: 20m3*25mL/m3=500mL=.5L; 20*.025L/m3=.5L;
  // 20*2.5L/100m3=.5L; 20*1000*.0025/100=.5L. A .5% dose gives
  // 100L=100000mL. Domain: vol,rate>=0; rate supplied by manufacturer.
  for (const [unit, rate, inputUnit, litres, ml, expression] of [
    ['mlm3', 25, 'mL/m³', 0.5, 500, '20.000 × 25.000000 / 1000'],
    ['lm3', '0,025', 'L/m³', 0.5, 500, '20.000 × 0.025000'],
    ['l100m3', 2.5, 'L/100 m³', 0.5, 500, '20.000 × 2.500000 / 100'],
    ['pct', 0.0025, '% v/v', 0.5, 500, '20.000 × 1000 × 0.002500 / 100'],
    ['pct', 0.5, '% v/v', 100, 100000, '20.000 × 1000 × 0.500000 / 100']
  ]) {
    fields({ chemVol: 20, chemRate: rate, chemUnit: unit });
    await working('calcChemDose', 'resChemDose', 'chemical-dosing', { systemVolume: [20, 'm³'], doseRate: [rate === '0,025' ? 0.025 : rate, inputUnit] }, { productLitres: [litres, 'L'], productMillilitres: [ml, 'mL'] }, [['Required product volume', expression, litres, 'L', 0.000000501], ['Product volume in millilitres', `${litres.toFixed(6)} × 1000`, ml, 'mL']]);
  }

  // LO: baseline Jan1 h=1000, oil=99 ignored. Jan11 h=1200 +10L:
  // 10/200*1000=50L/1000h. Jan21 h=1500 +30L:30/300*1000=100.
  // Total10+30=40L; hours200+300=500; overall40/500*1000=80;
  // latest100; Jan1->Jan21=20d, 40/20=2L/day. Range: >=2 dated
  // rows, nonnegative hours/oil; running hours strictly increase after sorting.
  loRows([['2026-01-21', 1500, 30], ['2026-01-01', 1000, 99], ['2026-01-11', 1200, 10]]);
  await working('calcLoTrend', 'resLoTrend', 'lube-oil-trend', { date1: ['2026-01-01', ''], runningHours1: [1000, 'h'], oilAdded1: [99, 'L'], date2: ['2026-01-11', ''], runningHours2: [1200, 'h'], oilAdded2: [10, 'L'], date3: ['2026-01-21', ''], runningHours3: [1500, 'h'], oilAdded3: [30, 'L'] }, { totalOil: [40, 'L'], totalRunningHours: [500, 'h'], calendarSpan: [20, 'day'], overallRate: [80, 'L/1000 h'], latestRate: [100, 'L/1000 h'], calendarRate: [2, 'L/day'] }, [
    ['2026-01-01 → 2026-01-11', '10.000 / (1200.000 − 1000.000) × 1000', 50, 'L/1000 h'], ['2026-01-11 → 2026-01-21', '30.000 / (1500.000 − 1200.000) × 1000', 100, 'L/1000 h'],
    ['Total oil after baseline', '10.000 + 30.000', 40, 'L'], ['Total running hours', '(1200.000 − 1000.000) + (1500.000 − 1200.000)', 500, 'h'], ['Overall oil consumption rate', '40.000 / 500.000 × 1000', 80, 'L/1000 h'], ['Calendar oil consumption rate', '40.000 / 20.000', 2, 'L/day']
  ]);
  assert(el('resLoTrend').classList.contains('ok'), 'Exactly 25% above overall preserves current status');
  // Same date, increasing hours: 0/200*1000=0; 200 total hours. Calendar
  // span=0, so the calendar rate is 0/0, undefined.
  loRows([['2026-01-01', 1000, 99], ['2026-01-01', 1200, 0]]);
  const sameDay = await working('calcLoTrend', 'resLoTrend', 'lube-oil-trend', { date1: ['2026-01-01', ''], runningHours1: [1000, 'h'], oilAdded1: [99, 'L'], date2: ['2026-01-01', ''], runningHours2: [1200, 'h'], oilAdded2: [0, 'L'] }, { totalOil: [0, 'L'], totalRunningHours: [200, 'h'], calendarSpan: [0, 'day'], overallRate: [0, 'L/1000 h'], latestRate: [0, 'L/1000 h'], calendarRate: [null, 'L/day'] }, [['2026-01-01 → 2026-01-01', '0.000 / (1200.000 − 1000.000) × 1000', 0, 'L/1000 h'], ['Total oil after baseline', '0.000', 0, 'L'], ['Total running hours', '(1200.000 − 1000.000)', 200, 'h'], ['Overall oil consumption rate', '0.000 / 200.000 × 1000', 0, 'L/1000 h'], ['Calendar oil consumption rate', 'No elapsed calendar days', null, 'L/day']]);
  assert.match(el('resLoTrend').textContent, /— L\/day over 0\.0 days\./);
  assert(sameDay.validity.includes('Same-day readings can have increasing running hours; with zero calendar span, the calendar rate is undefined and is not shown.'));

  // Electrical hand refs use sqrt(3)=1.7320508075688772935.
  // S=sqrt(3)*400*100/1000=40sqrt(3)=69.28203230275509 kVA;
  // P=.8*S=32sqrt(3)=55.42562584220407 kW. Valid V>0,I>=0,0<PF<=1.
  fields({ elV: 400, elA: 100, elPf: '0,8' });
  await working('calc3p', 'res3p', 'three-phase-power', { lineVoltage: [400, 'V'], lineCurrent: [100, 'A'], powerFactor: [0.8, ''] }, { apparentPower: [69.28203230275509, 'kVA'], activePower: [55.42562584220407, 'kW'] }, [['Apparent power', '√3 × 400.000 × 100.000 / 1000', 69.28203230275509, 'kVA'], ['Active power', '69.282032 × 0.800000', 55.42562584220407, 'kW']]);
  // Transformer:120kVA,600/300V -> 120000/(600sqrt3)=200/sqrt3
  // =115.47005383792515A; secondary=400/sqrt3=230.9401076758503A.
  // Range kVA,V1,V2>0, balanced nominal 3phase apparent power on both sides.
  fields({ trKva: 120, trV1: 600, trV2: 300 });
  await working('calcTransformer', 'resTransformer', 'transformer-current', { apparentPower: [120, 'kVA'], primaryLineVoltage: [600, 'V'], secondaryLineVoltage: [300, 'V'] }, { primaryCurrent: [115.47005383792515, 'A'], secondaryCurrent: [230.9401076758503, 'A'] }, [['Primary line current', '120.000 × 1000 / (√3 × 600.000)', 115.47005383792515, 'A'], ['Secondary line current', '120.000 × 1000 / (√3 × 300.000)', 230.9401076758503, 'A']]);
  // Imbalance:80,100,120 -> mean300/3=100; deviations20,0,20;
  // max20;20/100*100=20%. Equal phases ->0%. 0,0,30 ->mean10,
  // max20,200%. 1,1,2 ->mean4/3,max2/3,50% (nonterminating).
  // Range: nonnegative finite phase magnitudes; positive arithmetic mean.
  for (const [currents, avg, deviation, percent, expression1, expression2, expression3] of [
    [[80, 100, 120], 100, 20, 20, '(80.000 + 100.000 + 120.000) / 3', 'max(|80.000 − 100.000000|, |100.000 − 100.000000|, |120.000 − 100.000000|)', '20.000000 / 100.000000 × 100'],
    [[100, 100, 100], 100, 0, 0, '(100.000 + 100.000 + 100.000) / 3', 'max(|100.000 − 100.000000|, |100.000 − 100.000000|, |100.000 − 100.000000|)', '0.000000 / 100.000000 × 100'],
    [[0, 0, 30], 10, 20, 200, '(0.000 + 0.000 + 30.000) / 3', 'max(|0.000 − 10.000000|, |0.000 − 10.000000|, |30.000 − 10.000000|)', '20.000000 / 10.000000 × 100'],
    [[1, 1, 2], 1.3333333333333333, 0.6666666666666666, 50, '(1.000 + 1.000 + 2.000) / 3', 'max(|1.000 − 1.333333|, |1.000 − 1.333333|, |2.000 − 1.333333|)', '0.666667 / 1.333333 × 100']
  ]) {
    fields({ l1: currents[0], l2: currents[1], l3: currents[2] });
    await working('calcImbalance', 'resImbalance', 'phase-current-imbalance', { phase1: [currents[0], 'A'], phase2: [currents[1], 'A'], phase3: [currents[2], 'A'] }, { averageCurrent: [avg, 'A'], maximumDeviation: [deviation, 'A'], imbalance: [percent, '%'] }, [['Average phase current', expression1, avg, 'A'], ['Maximum absolute deviation', expression2, deviation, 'A'], ['Current imbalance percentage', expression3, percent, '%']]);
  }

  // A deliberately hostile translation of user text tests the raw:true labels.
  // Presentation switches to decimal commas, while input strings and machine
  // JSON/CSV remain unchanged. This is a locale contract, not catalogue review.
  assert.equal(snapshots.size, 14, 'All fourteen handlers exercised');
  w.MT_I18N = { locale: 'nb', t: text => text === product || /^2026-\d\d-\d\d/.test(text) ? 'TRANSLATED USER TEXT' : text };
  w.dispatchEvent(new w.CustomEvent('mt-locale-change'));
  for (const [result, before] of snapshots) {
    assert.match(box(result).querySelector('code').textContent, /\d,\d/, result + ': decimal comma');
    assert.deepEqual(cardValues(result), before.inputs, result + ': raw form values');
    const after = await record(result);
    for (const key of ['inputs', 'outputs', 'steps', 'validity']) assert.deepEqual(after[key], before.record[key], result + ': stable ' + key);
    const labels = [...box(result).querySelectorAll('.calc-work-steps > li > span')].map(node => node.textContent);
    // Fuel/urea product names come from a fixed list of system options and are translated on purpose
    // (Codex review of round 5); the browser test checks Urea solution → Urealøsning. User-written labels stay raw.
    if (result !== 'resFuelUrea') assert(!labels.includes('TRANSLATED USER TEXT'), result + ': raw labels bypass translation');
    const csv = await download(result, 'csv');
    for (const [name, item] of Object.entries(after.outputs)) assert(csv.includes(`,output,${name},${item.value ?? ''},${item.unit}`));
  }
  assert.equal(el('resBunkOverview').querySelector('tr > td').textContent, '— kg/m³');
  assert.match(el('resLoTrend').textContent, /— L\/day over 0,0 days\./);
  w.MT_I18N = { locale: 'en', t: text => text }; w.dispatchEvent(new w.CustomEvent('mt-locale-change'));

  // Existing invalid domains: each invalid run follows a valid result and must
  // clear its working and exports. No new validation rules are imposed here.
  for (const [button, result, reset, badCases] of [
    ['calcEndCompare', 'resEndCompare', () => { fields({ endRob: 50, endReserve: 20 }); endRows([4]); }, [() => fields({ endRob: '' }), () => fields({ endReserve: 100 }), () => endRows([0]), () => endRows([])]],
    ['calcSpeedFuel', 'resSpeedFuel', () => { speedRows([[6, 2], [8, 3]]); fields({ targetSpeed: 7 }); }, [() => fields({ targetSpeed: '' }), () => fields({ targetSpeed: 9 }), () => speedRows([[6, 2], [6, 3]]), () => speedRows([[6, ''], [8, 3]])]],
    ['calcFuelUrea', 'resFuelUrea', () => fields({ fuMode: 'v2m', fuAmount: 10, fuDensity: 840 }), [() => fields({ fuAmount: '' }), () => fields({ fuAmount: -1 }), () => fields({ fuDensity: 0 }), () => fields({ fuMode: 'm2v', fuDensity: '' })]],
    ['calcBunkOverview', 'resBunkOverview', () => bunkRows([['2026-01-01', 20, 800]]), [() => bunkRows([['', 20, 800]]), () => bunkRows([['2026-01-01', -1, 800]]), () => bunkRows([['2026-01-01', 20, 0]]), () => bunkRows([])]],
    ['calcPipe', 'resPipe', () => fields({ pipeQ: 36, pipeQUnit: 'm3h', pipeD: 200 }), [() => fields({ pipeQ: '' }), () => fields({ pipeQ: -1 }), () => fields({ pipeD: 0 })]],
    ['calcTankInterp', 'resTankInterp', () => fields({ ...tank, tankMeasure: 2 }), [() => fields({ tankMeasure: '' }), () => fields({ tankMeasure: 4 }), () => fields({ tankHighX: 1 }), () => fields({ tankLowV: -1 })]],
    ['calcFlowTime', 'resFlowTime', () => fields({ flowMode: 'time', flowVol: 18, flowRate: 12, flowHours: 1.5 }), [() => fields({ flowRate: 0 }), () => fields({ flowVol: '' }), () => fields({ flowMode: 'flow', flowHours: 0 }), () => fields({ flowMode: 'volume', flowHours: -1 })]],
    ['calcPressureHead', 'resPressureHead', () => fields({ phFluid: 'custom', phDensity: 850, phMode: 'bar-head', phValue: 1 }), [() => fields({ phValue: '' }), () => fields({ phValue: -1 }), () => fields({ phDensity: 0 }), () => fields({ phMode: 'head-bar', phDensity: '' })]],
    ['calcGenMargin', 'resGenMargin', () => fields({ genCap: 500, genLoad: 320 }), [() => fields({ genCap: 0 }), () => fields({ genLoad: '' }), () => fields({ genLoad: -1 })]],
    ['calcChemDose', 'resChemDose', () => fields({ chemVol: 20, chemRate: 25, chemUnit: 'mlm3' }), [() => fields({ chemRate: '' }), () => fields({ chemRate: -1 }), () => fields({ chemVol: '' })]],
    ['calcLoTrend', 'resLoTrend', () => loRows([['2026-01-01', 1000, 0], ['2026-01-11', 1200, 10]]), [() => loRows([['2026-01-01', 1000, 0]]), () => loRows([['2026-01-01', 1000, 0], ['2026-01-11', 1000, 10]]), () => loRows([['2026-01-01', 1000, 0], ['2026-01-11', 1200, -1]]), () => loRows([['', 1000, 0], ['2026-01-11', 1200, 10]])]],
    ['calc3p', 'res3p', () => fields({ elV: 400, elA: 100, elPf: 0.8 }), [() => fields({ elV: '' }), () => fields({ elA: -1 }), () => fields({ elPf: 0 }), () => fields({ elPf: 1.1 }), () => fields({ elV: '1e308', elA: 10 })]],
    ['calcTransformer', 'resTransformer', () => fields({ trKva: 120, trV1: 600, trV2: 300 }), [() => fields({ trKva: '' }), () => fields({ trV1: 0 }), () => fields({ trV2: -1 })]],
    ['calcImbalance', 'resImbalance', () => fields({ l1: 80, l2: 100, l3: 120 }), [() => fields({ l1: '' }), () => fields({ l1: -1 }), () => fields({ l1: 0, l2: 0, l3: 0 })]]
  ]) for (const bad of badCases) { reset(); click(button, result); assert(box(result)); bad(); click(button, result, false); }
  await flush(); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', calculators: snapshots.size, handlerRuns, workingRuns, stepReferences, numericReferences, invalidRuns, scope: 'Literal hand references for every added step; all modes, row sorting, undefined zero-denominator results, raw labels, comma inputs, stable locale exports, invalid clearing. No layout, translation, device or operational acceptance.' }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
