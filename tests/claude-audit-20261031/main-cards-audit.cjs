// Claude audit 2026-10-31: main-page card sweep in EN/NB with default, decimal-comma and blank inputs.
// Usage: node main-cards-audit.cjs <baseUrl> <out.json>
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2], out = process.argv[3];
const pages = ['fuel', 'engineering', 'electrical', 'vessel-calcs', 'quick', 'weather', 'navigation', 'energy-log', 'voyage-estimate'];
const variants = ['default', 'comma', 'blank'];
const BAD = /\bNaN\b|undefined|Infinity|\[object /;
const DASH = /^result\s*(?!.*caution)[^:]*::.*(?:—\s*(?:°|kn|NM|m³|t\b|%|m\b|bar|kW|A\b|V\b|h\b|days))/;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.STUDENTS_BROWSER_EXECUTABLE });
  const report = { cards: [], missingNb: new Set(), pageErrors: [] };
  for (const page of pages) for (const locale of ['en', 'nb']) for (const variant of variants) {
    const ctx = await browser.newContext();
    await ctx.addInitScript(l => { try { localStorage.setItem('mt.locale.v1', JSON.stringify(l)); } catch {} }, locale);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r => r.abort());
    const p = await ctx.newPage();
    p.on('pageerror', e => report.pageErrors.push({ page, locale, variant, error: String(e).slice(0, 300) }));
    await p.goto(`${base}/index.html?page=${page}`, { waitUntil: 'load' });
    await p.waitForTimeout(900);
    const n = await p.locator('article.tool-card').count();
    for (let i = 0; i < n; i++) {
      const cardRes = await p.evaluate(async ({ i, variant }) => {
        const card = document.querySelectorAll('article.tool-card')[i];
        const title = card.dataset.toolTitle;
        const inputs = [...card.querySelectorAll('input')].filter(x => x.dataset.mtNumeric === 'true');
        if (variant === 'comma') for (const x of inputs) { if (/^-?\d+(\.\d+)?$/.test(x.value)) { x.value = x.value.includes('.') ? x.value.replace('.', ',') : x.value + ',0'; x.dispatchEvent(new Event('input', { bubbles: true })); } }
        if (variant === 'blank') for (const x of inputs) { x.value = ''; x.dispatchEvent(new Event('input', { bubbles: true })); }
        const results = [];
        for (const x of inputs) x.dispatchEvent(new Event('change', { bubbles: true }));
        const buttons = [...card.querySelectorAll('.tool-card-work button')].filter(b => (/^calc/i.test(b.id) || /^(calculate|compute|compare|convert|find|estimate|analy[sz]e|check)\b/i.test(b.textContent.trim())) && !b.disabled);
        if (!buttons.length) { await new Promise(r => setTimeout(r, 150)); results.push({ button: '(auto)', text: [...card.querySelectorAll('.result')].map(r => r.className + ' :: ' + r.innerText.replace(/\s+/g, ' ').trim()).join(' || ').slice(0, 1200) }); }
        for (const b of buttons) {
          try { b.click(); } catch (e) { results.push({ button: b.id, error: String(e) }); continue; }
          await new Promise(r => setTimeout(r, 120));
          results.push({ button: b.id || b.textContent.trim().slice(0, 30), text: [...card.querySelectorAll('.result')].map(r => r.className + ' :: ' + r.innerText.replace(/\s+/g, ' ').trim()).join(' || ').slice(0, 1200) });
        }
        return { title, numericInputs: inputs.length, buttons: buttons.length, results };
      }, { i, variant });
      report.cards.push({ page, locale, variant, index: i, ...cardRes, bad: cardRes.results.some(r => BAD.test(r.text || '')), dash: cardRes.results.some(r => DASH.test(r.text || '')) });
    }
    if (locale === 'nb') for (const m of await p.evaluate(() => [...(window.MT_I18N?.missing || [])])) report.missingNb.add(page + ' :: ' + m);
    await ctx.close();
    process.stdout.write(`${page}/${locale}/${variant}: ${n} cards\n`);
  }
  await browser.close();
  report.missingNb = [...report.missingNb];
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('cards', report.cards.length, 'bad', report.cards.filter(c => c.bad).length, 'missingNb', report.missingNb.length, 'pageErrors', report.pageErrors.length);
})().catch(e => { console.error(e); process.exit(1); });
