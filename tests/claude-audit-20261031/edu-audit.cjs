// Claude audit 2026-10-31: Education sweep.
// - 45 interactive routes x {EN,NB} x {1440,320}: reflow, page errors, bad tokens, missing NB strings
// - 60 calculators x {EN,NB}: default/comma/blank/hex/negative, result text
// Usage: node edu-audit.cjs <baseUrl> <inventory.csv> <out.json>
const { chromium } = require('playwright');
const fs = require('fs');
const [base, inv, out] = process.argv.slice(2);
const rows = fs.readFileSync(inv, 'utf8').trim().split('\n').slice(1).map(l => l.match(/"([^"]*)"/g).map(s => s.slice(1, -1)));
const interactive = rows.filter(r => r[0] === 'interactive'), calcs = rows.filter(r => r[0] === 'calculator');
const BAD = /\bNaN\b|\bundefined\b|\bnull\b|\[object |Infinity|\bTODO\b|\bDRAFT\b|lorem/i;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.STUDENTS_BROWSER_EXECUTABLE });
  const report = { models: [], calcs: [], missingNb: {}, errors: [] };
  async function ctxFor(locale, width) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
    await ctx.addInitScript(l => { try { localStorage.setItem('mt.locale.v1', JSON.stringify(l)); } catch {} }, locale);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r => r.abort());
    return ctx;
  }
  const collectMissing = async (p, key) => { for (const m of await p.evaluate(() => [...(window.MT_I18N?.missing || [])]).catch(() => [])) (report.missingNb[m] ||= new Set()).add(key); };

  for (const locale of ['en', 'nb']) for (const width of [1440, 320]) {
    const ctx = await ctxFor(locale, width);
    const p = await ctx.newPage();
    let errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    for (const [, id, title, route] of interactive) {
      errs = [];
      try {
        await p.goto(`${base}/${route}`, { waitUntil: 'load', timeout: 30000 });
        await p.waitForTimeout(1200);
        const r = await p.evaluate(() => {
          const de = document.documentElement, text = document.body.innerText;
          const bad = (text.match(/.{0,40}(\bNaN\b|\bundefined\b|\[object |\bInfinity\b).{0,40}/g) || []).slice(0, 4);
          const err = [...document.querySelectorAll('[role=alert],.error,#model-error')].filter(n => n.offsetParent && n.textContent.trim()).map(n => n.textContent.trim().slice(0, 120));
          return { overflow: de.scrollWidth - de.clientWidth, bad, err, lang: de.lang, title: document.title };
        });
        report.models.push({ id, title, route, locale, width, ...r, pageErrors: errs.slice() });
        if (locale === 'nb') await collectMissing(p, 'model:' + id);
      } catch (e) { report.errors.push({ id, locale, width, error: String(e).slice(0, 200) }); }
    }
    await ctx.close();
    console.log('models', locale, width, 'done');
  }

  for (const locale of ['en', 'nb']) {
    const ctx = await ctxFor(locale, 1280);
    const p = await ctx.newPage();
    for (const [, id, title, route] of calcs) {
      const res = { id, title, locale };
      try {
        await p.goto(`${base}/${route}`, { waitUntil: 'load' });
        await p.waitForFunction(i => document.getElementById('calc-selector')?.value === i, id, { timeout: 15000 });
        await p.waitForTimeout(300);
        const read = () => p.evaluate(() => ({ out: document.getElementById('calc-output').innerText.replace(/\s+/g, ' ').trim(), steps: document.getElementById('calc-steps').innerText.replace(/\s+/g, ' ').trim().slice(0, 300) }));
        const set = async (idx, v) => { const inp = p.locator('#calc-fields input').nth(idx); await inp.fill(v); await inp.press('Tab'); await p.waitForTimeout(80); };
        const n = await p.locator('#calc-fields input').count();
        const initial = await p.locator('#calc-fields input').evaluateAll(xs => xs.map(x => x.value));
        res.default = await read();
        // decimal comma on every field (integers get ',0')
        for (let i = 0; i < n; i++) { const v = initial[i]; await set(i, /^-?\d+$/.test(v) ? v + ',0' : v.replace('.', ',')); }
        res.comma = await read();
        for (let i = 0; i < n; i++) await set(i, initial[i]);
        await set(0, ''); res.blank = await read(); await set(0, initial[0]);
        await set(0, '0x10'); res.hex = await read(); await set(0, initial[0]);
        await set(0, '−' + initial[0].replace('-', '')); res.unicodeMinus = await read(); await set(0, initial[0]);
        await set(0, '1e3'); res.sci = await read(); await set(0, initial[0]);
        await set(0, '0'); res.zero = await read(); await set(0, initial[0]);
        res.bad = [res.default, res.comma, res.blank, res.hex, res.zero].some(r => BAD.test(r.out + ' ' + r.steps));
        if (locale === 'nb') await collectMissing(p, 'calc:' + id);
      } catch (e) { res.error = String(e).slice(0, 200); }
      report.calcs.push(res);
    }
    await ctx.close();
    console.log('calcs', locale, 'done');
  }
  await browser.close();
  for (const k in report.missingNb) report.missingNb[k] = [...report.missingNb[k]].slice(0, 5);
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  const ov = report.models.filter(m => m.overflow > 1);
  console.log('models', report.models.length, 'overflow', ov.length, 'bad', report.models.filter(m => m.bad.length).length, 'pageErrors', report.models.filter(m => m.pageErrors.length).length, 'calcs', report.calcs.length, 'missingNb', Object.keys(report.missingNb).length, 'errors', report.errors.length);
})().catch(e => { console.error(e); process.exit(1); });
