// Regression (Claude audit 2026-10-31): every main-site calculator card must
// 1) give the same result when every numeric field is typed with a decimal comma,
// 2) never turn blank numeric fields into a numeric "valid" result,
// 3) never render NaN/undefined/Infinity or a valid result made of "—" placeholders.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict'), pw = require('playwright');
const engine = process.argv[2] || 'chromium', root = process.cwd();
const pages = ['fuel', 'engineering', 'electrical', 'vessel-calcs', 'quick', 'weather', 'navigation'];
let browser, server;
const failures = [];
(async () => {
  server = http.createServer((req, res) => {
    let f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!f.startsWith(root + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[path.extname(f)] || 'application/octet-stream');
    res.end(fs.readFileSync(f));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  browser = await pw[engine].launch(process.env.STUDENTS_BROWSER_EXECUTABLE && engine === 'chromium' ? { executablePath: process.env.STUDENTS_BROWSER_EXECUTABLE } : {});
  let cards = 0, clicks = 0;
  for (const page of pages) {
    const results = {};
    for (const variant of ['default', 'comma', 'blank']) {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      await context.route('**/*', r => new URL(r.request().url()).origin === base ? r.continue() : r.abort());
      const p = await context.newPage();
      const errors = [];
      p.on('pageerror', e => errors.push(e.message));
      await p.goto(base + '/index.html?page=' + page);
      await p.locator('article.tool-card').first().waitFor({ state: 'attached' });
      await p.waitForTimeout(400);
      results[variant] = await p.evaluate(async variant => {
        const out = [];
        for (const card of document.querySelectorAll('article.tool-card')) {
          const inputs = [...card.querySelectorAll('input')].filter(x => x.dataset.mtNumeric === 'true');
          for (const x of inputs) {
            if (variant === 'comma' && /^-?\d+(\.\d+)?$/.test(x.value)) x.value = x.value.includes('.') ? x.value.replace('.', ',') : x.value + ',0';
            if (variant === 'blank') x.value = '';
            x.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const buttons = [...card.querySelectorAll('.tool-card-work button')].filter(b => /^calc/i.test(b.id) && !b.disabled);
          const texts = [];
          for (const b of buttons) {
            b.click();
            await new Promise(r => setTimeout(r, 60));
            texts.push([...card.querySelectorAll('.result')].map(r => r.className + ' :: ' + r.innerText.replace(/\s+/g, ' ').trim()).join(' || '));
          }
          out.push({ title: card.dataset.toolTitle, numeric: inputs.length, texts });
        }
        return out;
      }, variant);
      if (errors.length) failures.push(page + '/' + variant + ' page errors: ' + errors.join(' | '));
      await context.close();
    }
    results.default.forEach((card, i) => {
      if (!card.title || !card.texts.length) return;
      cards++; clicks += card.texts.length;
      const comma = results.comma[i], blank = results.blank[i];
      if (JSON.stringify(card.texts) !== JSON.stringify(comma.texts)) failures.push(`${page} · ${card.title}: decimal comma changes result\n   default: ${card.texts[0].slice(0, 140)}\n   comma:   ${comma.texts[0].slice(0, 140)}`);
      for (const t of [...card.texts, ...comma.texts, ...blank.texts]) {
        if (/\bNaN\b|undefined|Infinity|\[object /.test(t)) failures.push(`${page} · ${card.title}: bad token in ${t.slice(0, 160)}`);
        const [cls, body = ''] = t.split(' :: ');
        if (!/caution|invalid|error/.test(cls) && /—\s*(°|kn|NM|m³|m\/s|kW|A\b|V\b|%)/.test(body)) failures.push(`${page} · ${card.title}: placeholder rendered as valid result: ${t.slice(0, 160)}`);
      }
      if (card.numeric) for (const t of blank.texts) {
        const [cls, body = ''] = t.split(' :: ');
        if (t && !/caution|invalid|error/.test(cls) && /\d/.test(body)) failures.push(`${page} · ${card.title}: blank inputs accepted as numbers: ${t.slice(0, 160)}`);
      }
    });
  }
  assert.ok(cards >= 35, 'expected at least 35 calculator cards, saw ' + cards);
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ status: 'PASS', engine, cards, clicks, variants: ['default', 'decimal comma on every numeric field', 'all numeric fields blank'] }));
})().catch(e => { console.error(failures.length ? failures.join('\n') : e); process.exitCode = 1; }).finally(async () => { await browser?.close(); server?.close(); });
