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
        ok(!/NaN|undefined|Infinity/.test(await box.locator(".calc-work-steps").textContent()), `${btn} ${lang}: no invalid numbers in the steps: ${text}`);
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
    // Phase 2 calculators: true wind, route fuel, weather window and NOx (Norwegian, 320 px).
    {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 800 } });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => {
        localStorage.setItem("mt.locale.v1", '"nb"');
        localStorage.setItem("mt.route", JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
        localStorage.setItem("mt.profile", JSON.stringify({ serviceSpeed: 12, fuelDay: 24, corridor: 5 }));
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const run = async (pageId, btn, res, prepare) => {
        await page.goto(base + "/index.html?page=" + pageId, { waitUntil: "domcontentloaded" });
        await page.locator("#" + btn).waitFor({ state: "attached" });
        await page.waitForTimeout(300);
        if (prepare) await page.evaluate(prepare);
        await page.evaluate((id) => document.getElementById(id).click(), btn);
        const box = page.locator(`.calc-work[data-for="${res}"]`);
        ok(await box.count() === 1, `${btn}: working panel appears`);
        await box.evaluate((d) => { d.open = true; });
        const text = await box.innerText();
        ok(!/NaN|undefined|Infinity/.test(await box.locator(".calc-work-steps").textContent()), `${btn}: no invalid numbers in the steps: ${text}`);
        ok(/Vis utregning/.test(text) && /Gyldighet og forutsetninger/.test(text), `${btn}: Norwegian headings`);
        const dims = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
        ok(dims.s <= dims.c + 1, `${btn}: no horizontal page overflow at 320 px`);
        return text;
      };
      const tw = await run("navigation", "calcTrueWind", "resTrueWind");
      ok(/Sann vindhastighet/.test(tw), "true wind: Norwegian step label");
      // Route of 1° along the equator ≈ 60.04 NM at 12 kn ≈ 5.0 h; 24 m³/day → ≈ 5.0 m³.
      const rf = await run("navigation", "calcRouteFuel", "resRouteFuel");
      ok(/Seilingstid/.test(rf) && /Drivstoff for seilasen/.test(rf), "route fuel: Norwegian step labels");
      const ww = await run("weather", "findWindow", "wwResult");
      ok(/innenfor grensene|utenfor grensene/.test(ww), "weather window: row status translated");
      ok(!/strøm/.test(await page.locator('.calc-work[data-for="wwResult"] .calc-work-steps').textContent()), "weather window: hidden current column is not shown in the steps");
      // User-written source names are never translated (AGENTS.md): "Total" exists in a catalogue as "Sum".
      const nox = await run("engineering", "calcNox", "resNox", () => {
        const n = document.querySelector(".nox-row .nox-name");
        n.value = "Total";
        n.dispatchEvent(new Event("input", { bubbles: true }));
      });
      ok(/Samlet NOx/.test(nox), "NOx: total step translated");
      ok(await page.locator('.calc-work[data-for="resNox"] .calc-work-steps li span').first().innerText() === "Total", "NOx: user-written source name kept as entered");
      // Display units in the working panel are translated (exports keep English units).
      const unitText = await run("quick", "calcUnit", "resUnit", () => { const s = document.getElementById("unitType"); s.value = "kw-hp"; s.dispatchEvent(new Event("change", { bubbles: true })); });
      ok(/hk \(mekanisk\)/.test(unitText) && !/hp \(mechanical\)/.test(unitText), "unit: horsepower unit translated in working: " + unitText.slice(0, 200));
      ok(errors.length === 0, `phase 2: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Stale results, accessible invalid fields and printing one calculation.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => {
        localStorage.setItem("mt.locale.v1", '"en"');
        window.__printed = [];
        window.print = () => window.__printed.push({
          body: document.body.classList.contains("print-one-card"),
          target: !!document.querySelector(".tool-card.print-target"),
          meta: document.querySelector(".print-target .print-meta")?.textContent || "",
          working: !!document.querySelector(".print-target .calc-work[open]"),
        });
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (t) => { (window.__copied ||= []).push(t); } } });
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/index.html?page=vessel-calcs", { waitUntil: "domcontentloaded" });
      await page.locator("#calcAnchor").waitFor({ state: "attached" });
      await page.evaluate(() => document.querySelector("#mtReleaseDialog[open]")?.close());
      ok(await page.locator("#resAnchor").getAttribute("role") === "status", "results are announced (role=status)");
      await page.evaluate(() => document.getElementById("calcAnchor").click());
      const card = page.locator('.tool-card:has(#resAnchor)');
      ok(!(await card.evaluate((c) => c.classList.contains("calc-stale"))), "fresh after calculating");
      // Edit an input: the result becomes stale; export, copy and print are blocked.
      await page.evaluate(() => { const x = document.getElementById("anchorChain"); x.value = "200"; x.dispatchEvent(new Event("input", { bubbles: true })); });
      await page.waitForTimeout(50);
      ok(await card.evaluate((c) => c.classList.contains("calc-stale")), "edit marks the result stale");
      ok(/Calculate again/.test(await card.locator(".result-stale-note").innerText()), "stale note explains what to do");
      ok(await card.locator(".calc-work-csv").isDisabled(), "CSV export disabled while stale");
      await card.locator(".copy-result").evaluate((b) => b.click());
      await page.waitForTimeout(50);
      ok(!(await page.evaluate(() => (window.__copied || []).length)), "copy refused while stale");
      ok(/Calculate again before copying/.test(await page.locator("#toast").innerText()), "copy explains why");
      // Recalculate: fresh again, note removed, new panel enabled.
      await page.evaluate(() => document.getElementById("calcAnchor").click());
      ok(!(await card.evaluate((c) => c.classList.contains("calc-stale"))) && await card.locator(".result-stale-note").count() === 0, "recalculation clears stale state");
      ok(!(await card.locator(".calc-work-csv").isDisabled()), "export enabled after recalculation");
      // Print exactly this card, working expanded, with version and time; cleaned up afterwards.
      await card.locator(".calc-work-print").evaluate((b) => b.click());
      const printed = await page.evaluate(() => window.__printed[0]);
      ok(printed && printed.body && printed.target && printed.working, "print shows only the card with working expanded");
      ok(/Marine Tools \d+\.\d+\.\d+ · .+ · printed \d{4}-\d\d-\d\d \d\d:\d\d UTC/.test(printed.meta), "print header has version, tool and time: " + printed.meta);
      await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
      ok(await page.evaluate(() => !document.body.classList.contains("print-one-card") && !document.querySelector(".print-target,.print-meta")), "print state cleaned up");
      // Invalid input: the blank field is marked aria-invalid and points at the message.
      await page.goto(base + "/index.html?page=fuel", { waitUntil: "domcontentloaded" });
      await page.locator("#calcRob").waitFor({ state: "attached" });
      await page.evaluate(() => { const d = document.getElementById("robDay"); d.value = ""; d.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcRob").click(); });
      ok(await page.locator("#robDay").getAttribute("aria-invalid") === "true" && await page.locator("#robDay").getAttribute("aria-describedby") === "resRob", "blank field marked invalid and described by the result");
      ok(await page.locator("#rob").getAttribute("aria-invalid") === null, "valid fields are not marked invalid");
      await page.evaluate(() => { const d = document.getElementById("robDay"); d.value = "20"; d.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcRob").click(); });
      ok(await page.locator("#robDay").getAttribute("aria-invalid") === null, "invalid mark removed after a valid result");
      // Existing descriptions are kept: only the result id is added and removed.
      await page.evaluate(() => { const d = document.getElementById("robDay"); d.setAttribute("aria-describedby", "existing-help"); d.value = ""; d.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcRob").click(); });
      ok(await page.locator("#robDay").getAttribute("aria-describedby") === "existing-help resRob", "existing aria-describedby kept when marking invalid");
      await page.evaluate(() => { const d = document.getElementById("robDay"); d.value = "20"; d.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcRob").click(); });
      ok(await page.locator("#robDay").getAttribute("aria-describedby") === "existing-help", "existing aria-describedby restored after a valid result");
      // A history filter is not a calculation input.
      await page.evaluate(() => document.getElementById("calcRob").click());
      const robCard = page.locator(".tool-card:has(#resRob)");
      // Daily consumption: readings 100 → 102 m³ at 840 kg/m³. Hand: 2 m³ × 840 kg/m³ = 1680 kg.
      const consCard = page.locator(".tool-card:has(#consHistoryFilter)");
      ok(await consCard.count() === 1, "daily consumption card present");
      const setCons = (prev, cur) => page.evaluate(([p, c]) => {
        const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); };
        const m = document.getElementById("consMode"); m.value = "difference"; m.dispatchEvent(new Event("change", { bubbles: true }));
        const u = document.getElementById("consUnit"); if (u) { u.value = "m3"; u.dispatchEvent(new Event("change", { bubbles: true })); }
        set("consPrevious", p); set("consCurrent", c); set("consDensity", "840");
        const d = document.getElementById("consDate"); if (!d.value) { d.value = "2026-11-17"; d.dispatchEvent(new Event("input", { bubbles: true })); }
      }, [prev, cur]);
      const copySummary = async () => { await page.evaluate(() => { window.__copied = []; document.getElementById("copyConsumption").click(); }); await page.waitForTimeout(80); return page.evaluate(() => window.__copied.slice()); };
      await setCons("100", "102");
      await page.evaluate(() => document.getElementById("calcConsumption").click());
      let copied = await copySummary();
      ok(copied.length === 1 && /1\s?680(\.0)? kg/.test(copied[0]), "valid summary copies 1680 kg: " + copied.join(" | "));
      // A history filter is not a calculation input.
      await page.evaluate(() => { const f = document.getElementById("consHistoryFilter"); f.selectedIndex = (f.selectedIndex + 1) % f.options.length; f.dispatchEvent(new Event("change", { bubbles: true })); });
      await page.waitForTimeout(50);
      ok(!(await consCard.evaluate((c) => c.classList.contains("calc-stale"))), "history filter does not mark the result stale");
      // Editing an input: stale, Copy summary refused.
      await setCons("100", "104");
      await page.waitForTimeout(50);
      ok(await consCard.evaluate((c) => c.classList.contains("calc-stale")), "edited consumption input marks stale");
      copied = await copySummary();
      ok(copied.length === 0, "Copy summary refused while stale");
      // Invalid recalculation (current below previous): the old summary must not be copied.
      await setCons("100", "90");
      await page.evaluate(() => document.getElementById("calcConsumption").click());
      copied = await copySummary();
      ok(copied.length === 0, "Copy summary refused after an invalid recalculation");
      // Valid recalculation restores copying with the new value: 4 m³ × 840 = 3360 kg.
      await setCons("100", "104");
      await page.evaluate(() => document.getElementById("calcConsumption").click());
      copied = await copySummary();
      ok(copied.length === 1 && /3\s?360(\.0)? kg/.test(copied[0]), "valid recalculation copies 3360 kg: " + copied.join(" | "));
      ok(!(await robCard.evaluate((c) => c.classList.contains("calc-stale"))), "ROB fresh after recalculation");
      // Adding or removing a row marks the result stale.
      await page.goto(base + "/index.html?page=engineering", { waitUntil: "domcontentloaded" });
      await page.locator("#calcNox").waitFor({ state: "attached" });
      await page.evaluate(() => document.getElementById("calcNox").click());
      const noxCard = page.locator(".tool-card:has(#resNox)");
      ok(!(await noxCard.evaluate((c) => c.classList.contains("calc-stale"))), "NOx fresh after calculating");
      await page.evaluate(() => document.getElementById("addNoxRow").click());
      await page.waitForTimeout(50);
      ok(await noxCard.evaluate((c) => c.classList.contains("calc-stale")), "adding a row marks the result stale");
      // Optional fields inside <details> are never marked invalid.
      await page.goto(base + "/index.html?page=quick", { waitUntil: "domcontentloaded" });
      await page.locator("#calcCompass").waitFor({ state: "attached" });
      await page.evaluate(() => { const c = document.getElementById("compC"); c.value = ""; c.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcCompass").click(); });
      ok(await page.locator("#compC").getAttribute("aria-invalid") === "true", "blank compass course marked invalid");
      ok(await page.evaluate(() => [...document.querySelector(".tool-card:has(#compC) details").querySelectorAll("input")].every((x) => !x.hasAttribute("aria-invalid"))), "optional variation-year fields not marked invalid");
      // Print hides other content with display:none and cleans up after the dialog without afterprint.
      await page.evaluate(() => { const c = document.getElementById("compC"); c.value = "90"; c.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcCompass").click(); window.__printed = []; window.print = () => window.__printed.push(document.querySelectorAll(".print-hidden").length); });
      await page.locator('.calc-work[data-for="resCompass"] .calc-work-print').evaluate((b) => b.click());
      ok((await page.evaluate(() => window.__printed[0])) > 0, "print hides the rest of the page (print-hidden)");
      await page.waitForTimeout(20);
      await page.evaluate(() => window.dispatchEvent(new Event("pointermove")));
      ok(await page.evaluate(() => !document.querySelector(".print-hidden,.print-target,.print-meta") && !document.body.classList.contains("print-one-card")), "print cleanup without afterprint");
      // Enhanced navigation results are announced too.
      await page.goto(base + "/index.html?page=navigation", { waitUntil: "domcontentloaded" });
      await page.locator("#calcBearing855").waitFor({ state: "attached" });
      await page.evaluate(() => document.getElementById("calcBearing855").click());
      ok(await page.locator("#resBearing855").getAttribute("role") === "status" && await page.locator("#resBearing855").getAttribute("aria-live") === "polite", "enhanced navigation result announced");
      ok(errors.length === 0, `stale/print/a11y: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Round 3: ETA and set & drift working (hand references), guidance fit at 320 px, retired UKC gone.
    {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => localStorage.setItem("mt.locale.v1", '"en"'));
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const steps = (res) => page.$$eval(`.calc-work[data-for="${res}"] .calc-work-steps code`, (cs) => cs.map((c) => Number(c.textContent.split("=").pop().trim().split(" ")[0].replace(/,/g, ""))));
      const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
      await page.goto(base + "/index.html?page=navigation", { waitUntil: "domcontentloaded" });
      await page.locator("#calcEta").waitFor({ state: "attached" });
      // ETA: 120 NM, STW 10 kn, current +2 kn along track. Hand: SOG = 12 kn; time = 120 / 12 = 10 h. Tolerance 0.005.
      await page.evaluate(() => { for (const [id, v] of [["etaDist", "120"], ["etaStw", "10"], ["etaCur", "2"]]) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("calcEta").click(); });
      const eta = await steps("resEta");
      near(eta[0], 12, 0.005, "ETA SOG step"); near(eta[1], 10, 0.005, "ETA time step");
      // Set & drift: course 000°, STW 10 kn, set 090°, drift 2 kn. Hand: east 2, north 10, SOG √104 = 10.198 kn,
      // COG = atan2(2, 10) = 11.31°. Tolerances 0.0005 kn / 0.05°.
      await page.evaluate(() => { for (const [id, v] of [["sdCourse", "0"], ["sdStw", "10"], ["sdSet", "90"], ["sdDrift", "2"]]) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("calcSetDrift").click(); });
      const sd = await steps("resSetDrift");
      near(sd[0], 2, 0.0005, "set/drift east"); near(sd[1], 10, 0.0005, "set/drift north"); near(sd[2], 10.198, 0.005, "set/drift SOG"); near(sd[3], 11.31, 0.05, "set/drift COG");
      // Guidance on electrical cards fits at 320 px in English and Norwegian.
      for (const lang of ["en", "nb"]) {
        await page.evaluate((l) => window.MT_I18N.set(l), lang);
        await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" }); await page.waitForTimeout(800); await page.evaluate(() => { document.querySelector("#mtReleaseDialog[open]")?.close(); document.querySelector('.nav-btn[data-page="electrical"]').click(); });
        await page.waitForTimeout(500);
        const measure = () => page.evaluate(() => [...document.querySelectorAll("#electrical .tool-how")].filter((h) => h.getBoundingClientRect().width > 0).flatMap((h) => [h, ...h.children]).filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > (e.closest(".tool-card")?.getBoundingClientRect().right ?? Infinity) + 1).map((e) => e.className || e.tagName));
        // Default view (where the 6 px overflow was found) and with every group and guidance opened.
        const badDefault = await measure();
        ok(badDefault.length === 0, `electrical guidance fits at 320 px, default view (${lang}): ${badDefault.join(", ")}`);
        await page.evaluate(() => { for (const v of document.querySelectorAll("#electrical [id$=View]")) { v.value = "all"; v.dispatchEvent(new Event("change", { bubbles: true })); } for (const d of document.querySelectorAll("#electrical details")) d.open = true; });
        ok(await page.evaluate(() => [...document.querySelectorAll("#electrical .tool-how")].filter((h) => h.offsetParent).length) > 0, `electrical guidance visible for measuring (${lang})`);
        const bad = await measure();
        ok(bad.length === 0, `electrical guidance fits at 320 px, all open (${lang}): ${bad.join(", ")}`);
      }
      // Retired UKC calculators are not built at all and nothing links to them.
      await page.goto(base + "/index.html?page=vessel-calcs", { waitUntil: "domcontentloaded" });
      await page.locator("#calcAnchor").waitFor({ state: "attached" });
      ok(await page.evaluate(() => !document.querySelector('[data-tool-title="Dynamic UKC & squat"],[data-tool-title="Draft / tide UKC"],#calcUkc,#calcStaticUkc,[data-tool-target*="UKC"]')), "retired UKC calculators absent");
      ok(errors.length === 0, `round 3: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Round 4: Show working on the remaining navigation, quick and consumption tools, with hand references.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => {
        localStorage.setItem("mt.locale.v1", '"en"');
        localStorage.setItem("mt.route", JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
        localStorage.setItem("mt.profile", JSON.stringify({ serviceSpeed: 12, fuelDay: 24, corridor: 5 }));
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const vals = (res) => page.$$eval(`.calc-work[data-for="${res}"] .calc-work-steps code`, (cs) => cs.map((c) => (c.textContent.includes("=") ? Number(c.textContent.split("=").pop().trim().split(" ")[0].replace(/,/g, "")) : null)));
      const near = (a, b, tol, m) => ok(typeof a === "number" && Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
      const setFields = (pairs) => page.evaluate((pairs) => { for (const [id, v] of pairs) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); x.dispatchEvent(new Event("change", { bubbles: true })); } }, pairs);
      const ddm = (p, lat, lon) => [[p + "LatDeg", String(Math.floor(Math.abs(lat)))], [p + "LatMin", String((Math.abs(lat) % 1) * 60)], [p + "LatHem", lat < 0 ? "S" : "N"], [p + "LonDeg", String(Math.floor(Math.abs(lon)))], [p + "LonMin", String((Math.abs(lon) % 1) * 60)], [p + "LonHem", lon < 0 ? "W" : "E"]];
      const click = (id) => page.evaluate((id) => document.getElementById(id).click(), id);
      await page.goto(base + "/index.html?page=navigation", { waitUntil: "domcontentloaded" });
      await page.locator("#calcBearing855").waitFor({ state: "attached" });
      await page.waitForTimeout(400);
      // Wind components: course 000, wind from 030 at 20 kn. Hand: rel 30°, head 20·cos30 = 17.3205, cross 20·sin30 = 10. Tol 0.005.
      await setFields([["windCourse", "0"], ["windDir", "30"], ["windSpeed", "20"]]); await click("calcWindComp");
      let v = await vals("resWindComp"); near(v[0], 30, 0.5, "wind rel"); near(v[1], 17.3205, 0.005, "wind head"); near(v[2], 10, 0.005, "wind cross");
      // Spherical R = 3440.065 NM: 1° of arc = 3440.065·π/180 = 60.0405 NM. A (0,0) → B (0,1): GC 60.0405 NM course 090; rhumb identical, difference 0.
      await setFields([...ddm("gcA", 0, 0), ...ddm("gcB", 0, 1)]); await click("calcGcRhumb");
      v = await vals("resGcRhumb"); near(v[0], 60.0405, 0.005, "GC distance"); near(v[1], 90, 0.05, "GC course"); near(v[2], 60.0405, 0.005, "rhumb distance"); near(v[3], 90, 0.05, "rhumb course"); near(v[4], 0, 0.005, "rhumb extra");
      ok(/q = cos φ₁/.test(await page.locator('.calc-work[data-for="resGcRhumb"]').textContent()), "rhumb same-latitude branch shown (q = cos φ1, not 0/0)");
      await setFields([...ddm("navA", 0, 0), ...ddm("navB", 0, 1)]); await click("calcBearing855");
      v = await vals("resBearing855"); near(v[0], 60.0405, 0.001, "bearing tool distance (shown to 3 decimals; hand 60.04046)"); near(v[1], 90, 0.005, "bearing tool course");
      // Coordinate toolbox: 59° 25.278′ N, 10° 28.992′ E. Hand: 59 + 25.278/60 = 59.4213; 10 + 28.992/60 = 10.4832. Tol 1e-6.
      await setFields([["coordLatDeg", "59"], ["coordLatMin", "25.278"], ["coordLatHem", "N"], ["coordLonDeg", "10"], ["coordLonMin", "28.992"], ["coordLonHem", "E"]]); await click("calcCoords855");
      v = await vals("resCoords855"); near(v[0], 59.4213, 1e-6, "coord lat"); near(v[1], 10.4832, 1e-6, "coord lon");
      // Closest route point: route (0,0)-(0,1); point 0°06′N 0°30′E. Hand (flat leg): 0.1° lat × 60 = 6.0 NM. Tol 0.01.
      await setFields(ddm("near", 0.1, 0.5)); await click("calcNearest");
      v = await vals("resNearest"); near(v[0], 6, 0.01, "closest route distance");
      // 6 NM from the route with a 5 NM corridor: outside.
      ok(/— outside/.test(await page.locator('.calc-work[data-for="resNearest"]').textContent()), "closest route corridor note: 6 NM is outside a 5 NM corridor");
      // Passage scenarios: 1200 NM, 30 m³/day at 12 kn, scenario 10 kn. Hand: 30·(10/12)³·1200/10/24 = 30·0.578704·5 = 86.8056 m³. Tol 0.01.
      await page.evaluate(() => { const rows = [...document.querySelectorAll(".sc-speed")]; rows.forEach((r, i) => { r.value = i === 0 ? "10" : r.value; r.dispatchEvent(new Event("input", { bubbles: true })); }); });
      await setFields([["scDist", "1200"], ["scFuel", "30"], ["scRef", "12"]]); await click("calcScenarios");
      v = await vals("resScenarios"); near(v[0], 86.8056, 0.01, "scenario fuel at 10 kn");
      await page.evaluate(() => window.MT_I18N.set("nb")); await page.waitForTimeout(200);
      ok(await page.locator('.calc-work[data-for="resScenarios"] .calc-work-steps li span').first().textContent() === "10,0 kn", "scenario label follows language");
      await page.evaluate(() => window.MT_I18N.set("en")); await page.waitForTimeout(200);
      await page.goto(base + "/index.html?page=weather", { waitUntil: "domcontentloaded" });
      await page.locator("#calcEncounter").waitFor({ state: "attached" });
      // Encounter: course 000, 10 kn (5.14444 m/s), waves from 180 (following), T 8 s. Hand: ω = 2π/8 = 0.785398;
      // k = ω²/9.80665 = 0.062901; ωe = 0.785398 − 0.062901·5.14444·cos0 = 0.461806; Te = 2π/0.461806 = 13.6057 s. Tol 0.005 s.
      await setFields([["weCourse", "0"], ["weSpeed", "10"], ["weFrom", "180"], ["wePeriod", "8"]]); await click("calcEncounter");
      v = await vals("resEncounter"); near(v[0], 0.785398, 1e-5, "wave frequency"); near(v[1], 0.062901, 1e-5, "wave number"); near(v[2], 0.461806, 1e-4, "encounter frequency"); near(v[3], 13.6057, 0.005, "encounter period");
      ok(/max\(0\.00001/.test(await page.locator('.calc-work[data-for="resEncounter"]').textContent()), "encounter shows the frequency lower bound");
      await page.goto(base + "/index.html?page=quick", { waitUntil: "domcontentloaded" });
      await page.locator("#calcDST").waitFor({ state: "attached" });
      // Speed·distance·time: 120 NM at 12 kn = 10 h. Beaufort: 15 kn lies in 11–16 kn = force 4.
      await setFields([["qDist", "120"], ["qSpeed", "12"]]); await click("calcDST");
      v = await vals("resDST"); near(v[0], 10, 0.0005, "DST time");
      await setFields([["bfKn", "15"]]); await click("calcBf");
      v = await vals("resBf"); near(v[0], 4, 0, "Beaufort force");
      await page.goto(base + "/index.html?page=fuel", { waitUntil: "domcontentloaded" });
      await page.locator("#calcConsumption").waitFor({ state: "attached" });
      // Daily consumption: 100 → 102 m³ at 840 kg/m³. Hand: 2 m³; 2 × 840 = 1680 kg.
      await setFields([["consMode", "difference"], ["consUnit", "m3"], ["consPrevious", "100"], ["consCurrent", "102"], ["consDensity", "840"], ["consDate", "2026-11-17"]]); await click("calcConsumption");
      v = await vals("resConsumption"); near(v[0], 2, 1e-6, "consumed amount"); near(v[1], 2, 1e-6, "consumption volume"); near(v[2], 1680, 0.05, "consumption mass");
      ok(errors.length === 0, `round 4: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Round 5: every Show working panel fits at 320 px in English and Norwegian.
    for (const lang of ["en", "nb"]) {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript((l) => {
        localStorage.setItem("mt.locale.v1", JSON.stringify(l));
        localStorage.setItem("mt.route", JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
        localStorage.setItem("mt.profile", JSON.stringify({ serviceSpeed: 12, fuelDay: 24, corridor: 5 }));
      }, lang);
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      let panels = 0;
      for (const pageId of ["navigation", "quick", "fuel", "vessel-calcs", "engineering", "electrical", "weather"]) {
        await page.goto(base + "/index.html?page=" + pageId, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(700);
        const r = await page.evaluate(async () => {
          for (const v of document.querySelectorAll("section.page.active [id$=View]")) { v.value = "all"; v.dispatchEvent(new Event("change", { bubbles: true })); }
          for (const b of document.querySelectorAll("section.page.active button.calc-action, section.page.active #calcConsumption")) { b.click(); await new Promise((r) => setTimeout(r, 20)); }
          const view = document.documentElement.clientWidth, bad = [];
          const boxes = [...document.querySelectorAll("section.page.active .calc-work")];
          for (const d of boxes) {
            d.open = true;
            const card = d.closest(".tool-card")?.getBoundingClientRect();
            for (const e of [d, ...d.querySelectorAll("*")]) {
              const rr = e.getBoundingClientRect();
              if (rr.width && (rr.right > (card ? card.right : view) + 1 || e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === "visible")) { bad.push(d.dataset.for + ":" + e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0]); break; }
            }
          }
          return { panels: boxes.length, bad, page: document.documentElement.scrollWidth <= view + 1 };
        });
        panels += r.panels;
        ok(r.bad.length === 0, `${lang} ${pageId}: working panels fit at 320 px: ${r.bad.join(", ")}`);
        ok(r.page, `${lang} ${pageId}: no horizontal page overflow at 320 px`);
      }
      ok(panels >= 40, `${lang}: Show working panels rendered across pages: ${panels}`);
      ok(errors.length === 0, `${lang} all panels: no page errors: ${errors.join(" | ")}`);
      await ctx.close();
    }
    // Round 5: Codex findings — profile save stales route fuel, user text untranslated, CSV numbers, calculatedAt, angle wrap.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => {
        localStorage.setItem("mt.locale.v1", '"en"');
        localStorage.setItem("mt.route", JSON.stringify([{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }]));
        localStorage.setItem("mt.profile", JSON.stringify({ serviceSpeed: 10, fuelDay: 24, corridor: 5 }));
      });
      const page = await ctx.newPage();
      const download = async (sel) => { const p = page.waitForEvent("download"); await page.locator(sel).evaluate((b) => b.click()); const f = await p; const c = []; for await (const x of await f.createReadStream()) c.push(x); return Buffer.concat(c).toString("utf8"); };
      await page.goto(base + "/index.html?page=navigation", { waitUntil: "domcontentloaded" });
      await page.locator("#calcRouteFuel").waitFor({ state: "attached" });
      await page.evaluate(() => document.getElementById("calcRouteFuel").click());
      const rfCard = page.locator(".tool-card:has(#resRouteFuel)");
      ok(!(await rfCard.evaluate((c) => c.classList.contains("calc-stale"))), "route fuel fresh");
      await page.evaluate(() => window.dispatchEvent(new Event("mt-profile-saved")));
      ok(await rfCard.evaluate((c) => c.classList.contains("calc-stale")), "saving the vessel profile marks route fuel stale");
      // Set & drift with course 270°, STW 10, zero drift: north component is ~ -1.8e-15; CSV must hold a parseable number.
      await page.evaluate(() => { for (const [id, v] of [["sdCourse", "270"], ["sdStw", "10"], ["sdSet", "0"], ["sdDrift", "0"]]) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("calcSetDrift").click(); });
      const csv1 = await download('.calc-work[data-for="resSetDrift"] .calc-work-csv');
      const north = csv1.split("\n").find((l) => l.includes("North component"));
      ok(north && !north.includes("'") && Number.isFinite(Number(north.split(",")[3])), "CSV keeps tiny negative numbers parseable: " + north);
      // calculatedAt is fixed at calculation time: two downloads give the same timestamp.
      const j1 = JSON.parse(await download('.calc-work[data-for="resSetDrift"] .calc-work-json'));
      await page.waitForTimeout(1100);
      const j2 = JSON.parse(await download('.calc-work[data-for="resSetDrift"] .calc-work-json'));
      ok(j1.calculatedAt && j1.calculatedAt === j2.calculatedAt, "calculatedAt does not change between downloads");
      // True wind 350° + 20° shows the mod-360 wrap.
      await page.evaluate(() => { for (const [id, v] of [["twCourse", "350"], ["twShip", "10"], ["twRel", "20"], ["twAws", "15"]]) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("calcTrueWind").click(); });
      ok(/mod 360 = 10/.test(await page.locator('.calc-work[data-for="resTrueWind"]').textContent()), "true wind apparent direction shows mod 360 = 10");
      // Changing the shared route (undo last waypoint) also marks route fuel and closest-route results stale.
      await page.evaluate(() => { document.getElementById("calcRouteFuel").click(); document.getElementById("calcNearest").click(); });
      ok(!(await rfCard.evaluate((c) => c.classList.contains("calc-stale"))), "route fuel fresh after recalculation");
      // Open Route Intelligence through the app's own data-go navigation (keeps this page state).
      await page.evaluate(() => { const b = document.createElement("button"); b.dataset.go = "route-intelligence"; document.body.appendChild(b); b.click(); b.remove(); });
      await page.locator("#undoWp").waitFor({ state: "attached" });
      await page.evaluate(() => document.getElementById("undoWp").click());
      ok(await rfCard.evaluate((c) => c.classList.contains("calc-stale")), "route change marks route fuel stale");
      ok(await page.locator(".tool-card:has(#resNearest)").evaluate((c) => c.classList.contains("calc-stale")), "route change marks closest-route stale");
      // A NOx source named "Fuel" stays "Fuel" in Norwegian.
      await page.goto(base + "/index.html?page=engineering", { waitUntil: "domcontentloaded" });
      await page.locator("#calcNox").waitFor({ state: "attached" });
      await page.evaluate(() => { const n = document.querySelector(".nox-row .nox-name"); n.value = "Fuel"; n.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("calcNox").click(); });
      await page.evaluate(() => window.MT_I18N.set("nb"));
      await page.waitForTimeout(400);
      ok(await page.locator('.calc-work[data-for="resNox"] .calc-work-steps li span').first().textContent() === "Fuel", "user-written NOx source name not translated");
      // A built-in product name is system text and is translated: Urea solution → Urealøsning.
      await page.goto(base + "/index.html?page=fuel", { waitUntil: "domcontentloaded" });
      await page.locator("#calcFuelUrea").waitFor({ state: "attached" });
      await page.evaluate(() => { const p = document.getElementById("fuProduct"); p.value = "Urea solution"; p.dispatchEvent(new Event("change", { bubbles: true })); document.getElementById("calcFuelUrea").click(); });
      await page.evaluate(() => window.MT_I18N.set("nb"));
      await page.waitForTimeout(300);
      ok(await page.locator('.calc-work[data-for="resFuelUrea"] .calc-work-steps li span').first().textContent() === "Urealøsning", "built-in product name translated in Norwegian working");
      await ctx.close();
    }
    // History keeps the structured working (additive 'work' field); old entries without it still load.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await ctx.addInitScript(() => {
        localStorage.setItem("mt.locale.v1", '"en"');
        if (!sessionStorage.getItem("seeded")) {
          sessionStorage.setItem("seeded", "1");
          localStorage.setItem("mt.history", JSON.stringify([{ title: "Old entry", page: "fuel", time: "2026-01-01T00:00:00.000Z", inputs: ["ROB m³: 100"], result: "90 m³ usable" }]));
        }
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/index.html?page=fuel", { waitUntil: "domcontentloaded" });
      await page.locator("#calcRob").waitFor({ state: "attached" });
      // ROB 300 m³, 20 m³/day, reserve 10 %. Hand: usable 270 m³; endurance 13.5 days.
      await page.evaluate(() => { for (const [id, v] of [["rob", "300"], ["robDay", "20"], ["robRes", "10"]]) { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("calcRob").click(); });
      await page.waitForTimeout(150);
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mt.history")));
      const old = stored.find((x) => x.title === "Old entry"), robEntry = stored.find((x) => x.work?.tool === "fuel-endurance");
      ok(old && old.result === "90 m³ usable" && !old.work, "old history entry kept unchanged");
      ok(robEntry && stored[0] === robEntry && Math.abs(robEntry.work.outputs.usableFuel.value - 270) < 1e-9 && Math.abs(robEntry.work.outputs.endurance.value - 13.5) < 1e-9, "new history entry stores the working (270 m³, 13.5 days)");
      await page.goto(base + "/index.html?page=home", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      ok(await page.locator("[data-history-json]").count() === stored.slice(0, 6).filter((x) => x.work).length && await page.locator("[data-history-copy]").count() === stored.slice(0, 6).length, "history shows JSON/CSV only for entries with working");
      const p = page.waitForEvent("download");
      await page.locator("[data-history-json]").first().evaluate((b) => b.click());
      const f = await p; const chunks = []; for await (const c of await f.createReadStream()) chunks.push(c);
      const j = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      ok(j.tool === "fuel-endurance" && j.outputs.usableFuel.value === 270, "history JSON export matches the calculation");
      const p2 = page.waitForEvent("download");
      await page.locator("[data-history-csv]").first().evaluate((b) => b.click());
      const f2 = await p2; const c2 = []; for await (const c of await f2.createReadStream()) c2.push(c);
      ok(/^tool,section,name,value,unit/.test(Buffer.concat(c2).toString("utf8")), "history CSV export has the machine header");
      ok(errors.length === 0, `history: no page errors: ${errors.join(" | ")}`);
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
