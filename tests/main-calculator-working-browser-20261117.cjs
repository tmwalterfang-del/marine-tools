// Browser test: "Show working" panel (steps, validity, CSV/JSON export) and narrow coordinate rows.
// Usage: node tests/main-calculator-working-browser-20261117.cjs [chromium|firefox|webkit]
const http = require("http"), fs = require("fs"), path = require("path"), assert = require("assert/strict");
const playwright = require("playwright");
const engine = process.argv[2] || "chromium";
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(d); });
});

// [calculate button, result element, page]
const CALCS = [
  ["calcRob", "resRob", "fuel"],
  ["calcFuelDensity", "resFuelDensity", "fuel"],
  ["calcTransfer", "resTransfer", "fuel"],
  ["calcBlend", "resBlend", "fuel"],
  ["calcAnchor", "resAnchor", "vessel-calcs"],
  ["calcAirDraft", "resAirDraft", "vessel-calcs"],
];

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await playwright[engine].launch();
  let checks = 0;
  const ok = (v, m) => { assert.ok(v, m); checks++; };
  try {
    for (const lang of ["en", "nb"]) {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 800 }, acceptDownloads: true });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript((l) => localStorage.setItem("mt.locale.v1", JSON.stringify(l)), lang);
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const [btn, res, pageId] of CALCS) {
        await page.goto(base + "/index.html?page=" + pageId, { waitUntil: "domcontentloaded" });
        await page.locator("#" + btn).waitFor({ state: "attached" });
        await page.evaluate(() => document.querySelector("#mtReleaseDialog[open]")?.close());
        await page.evaluate((id) => document.getElementById(id).click(), btn);
        const box = page.locator(`.calc-work[data-for="${res}"]`);
        ok(await box.count() === 1, `${btn} ${lang}: working panel appears`);
        await box.evaluate((d) => { d.open = true; });
        const text = await box.innerText();
        ok(!/NaN|undefined|Infinity/.test(text), `${btn} ${lang}: no invalid numbers: ${text}`);
        ok(await box.locator(".calc-work-steps li").count() >= 1, `${btn} ${lang}: has steps`);
        ok(await box.locator(".calc-work-validity li").count() >= 1, `${btn} ${lang}: has validity notes`);
        if (lang === "nb") {
          ok(/Vis utregning/.test(text) && /Gyldighet og forutsetninger/.test(text), `${btn}: Norwegian headings`);
          ok(!/Validity and assumptions|Show working/.test(text), `${btn}: no English headings in Norwegian`);
        }
        const dims = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
        ok(dims.s <= dims.c + 1, `${btn} ${lang}: no horizontal page overflow at 320 px`);
        // CSV export stays in machine format and English keys in every language (AGENTS.md).
        const pending = page.waitForEvent("download");
        await box.locator(".calc-work-csv").evaluate((b) => b.click());
        const file = await pending;
        const chunks = [];
        for await (const c of await file.createReadStream()) chunks.push(c);
        const csv = Buffer.concat(chunks).toString("utf8");
        ok(csv.split("\n")[0] === "tool,section,name,value,unit", `${btn} ${lang}: CSV header`);
        ok(!/\d,\d{1,3}(,|$)/m.test(csv.split("\n").filter((l) => /,(input|output|step),/.test(l)).map((l) => l.split(",").slice(3, 4).join("")).join("\n")), `${btn} ${lang}: decimal point in values`);
        ok(!/[æøå]/i.test(csv), `${btn} ${lang}: CSV not translated`);
      }
      // A new invalid result removes the stale working panel.
      await page.goto(base + "/index.html?page=fuel", { waitUntil: "domcontentloaded" });
      await page.locator("#calcRob").waitFor({ state: "attached" });
      await page.evaluate(() => { document.getElementById("calcRob").click(); const d = document.getElementById("robDay"); d.value = ""; d.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcRob").click(); });
      ok(await page.locator('.calc-work[data-for="resRob"]').count() === 0, `${lang}: invalid result clears working`);
      // Coordinate row label is fully visible at 320 px.
      await page.goto(base + "/index.html?page=navigation", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      const clipped = await page.evaluate(() => [...document.querySelectorAll(".coord-row>span")].filter((s) => s.offsetParent && s.scrollWidth > s.clientWidth + 1).map((s) => s.innerText));
      ok(clipped.length === 0, `${lang}: coordinate labels not clipped at 320 px: ${clipped.join(", ")}`);
      ok(errors.length === 0, `${lang}: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Language switch re-renders an open panel.
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await ctx.addInitScript(() => localStorage.setItem("mt.locale.v1", '"en"'));
    const page = await ctx.newPage();
    await page.goto(base + "/index.html?page=vessel-calcs", { waitUntil: "domcontentloaded" });
    await page.locator("#calcAnchor").waitFor({ state: "attached" });
    await page.evaluate(() => document.getElementById("calcAnchor").click());
    ok(/Show working/.test(await page.locator('.calc-work[data-for="resAnchor"]').innerText()), "English before switch");
    await page.evaluate(() => window.MT_I18N.set("nb"));
    await page.waitForTimeout(200);
    ok(/Vis utregning/.test(await page.locator('.calc-work[data-for="resAnchor"]').innerText()), "Norwegian after switch");
    await ctx.close();
  } finally {
    await browser.close();
    server.close();
  }
  console.log(JSON.stringify({ status: "PASS", engine, checks }));
})().catch((e) => { console.error(e); process.exit(1); });
