const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict"),
  pw = require("playwright");
const engine = process.argv[2] || "chromium",
  root = path.resolve("."),
  out = path.resolve("qa-education-" + engine, "mollier-followup");
fs.mkdirSync(out, { recursive: true });
let server,
  browser,
  checks = 0;
const ok = (v, s) => {
  assert.ok(v, s);
  checks++;
};
(async () => {
  server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://localhost"),
      p = path.resolve(root, "." + decodeURIComponent(u.pathname));
    if (
      !p.startsWith(root + path.sep) ||
      !fs.existsSync(p) ||
      !fs.statSync(p).isFile()
    ) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader(
      "content-type",
      p.endsWith(".js")
        ? "application/javascript"
        : p.endsWith(".css")
          ? "text/css"
          : p.endsWith(".html")
            ? "text/html"
            : "application/octet-stream",
    );
    res.end(fs.readFileSync(p));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  browser = await pw[engine].launch({ headless: true });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === base
      ? route.continue()
      : route.abort(),
  );
  await page.goto(base + "/students/mollier.html");
  await page.evaluate(() =>
    MT_MOLLIER_RESTORE(
      MT_STUDY_EXPORT.scenario("mollier-if97", {
        a: { phase: "superheated", p: 40, T: 450 },
        b: { phase: "wet", p: 1, x: 0.9 },
      }),
    ),
  );
  await page.locator("#process-mode").selectOption("isentropic");
  await page.locator("#solve-process").click();
  ok(
    (await page.locator("#process-result").textContent()).includes(
      "constant entropy",
    ),
    "Solved isentrope shown",
  );
  let snap = await page.evaluate(() => MT_MOLLIER_SNAPSHOT());
  const get = (s, id, name) => s.results["State " + id + " · " + name];
  ok(
    Math.abs(get(snap, "A", "s (kJ/kg/K)") - get(snap, "B", "s (kJ/kg/K)")) <
      1e-8,
    "Browser entropy conserved",
  );
  await page.locator("#process-mode").selectOption("throttle");
  await page.locator("#solve-process").click();
  snap = await page.evaluate(() => MT_MOLLIER_SNAPSHOT());
  ok(
    Math.abs(get(snap, "A", "h (kJ/kg)") - get(snap, "B", "h (kJ/kg)")) < 1e-6,
    "Browser throttle enthalpy conserved",
  );
  await page.locator("#process-mode").selectOption("turbine");
  await page.locator("#process-efficiency").fill("0.85");
  await page.locator("#solve-process").click();
  ok(
    (await page.locator("#process-result").textContent()).includes(
      "irreversible path is not solved",
    ),
    "Irreversible path limitation visible",
  );
  const saved = await page.evaluate(() =>
    MT_STUDY_EXPORT.scenario("mollier-if97", MT_MOLLIER_INPUTS()),
  );
  await page.locator("#reset").click();
  await page.evaluate((text) => MT_MOLLIER_RESTORE(text), saved);
  ok(
    (await page.locator("#process-result").textContent()).includes("0.850"),
    "Scenario restores and verifies process efficiency",
  );
  const download = page.waitForEvent("download");
  await page.locator("#export-report").click();
  const d = await download;
  await d.saveAs(path.join(out, "mollier-turbine-report.html"));
  ok(
    fs
      .readFileSync(path.join(out, "mollier-turbine-report.html"), "utf8")
      .includes("turbine"),
    "Actual report includes solved process",
  );
  const before = await page.evaluate(() => JSON.stringify(MT_MOLLIER_INPUTS()));
  await page.locator("#process-efficiency").fill("1.2");
  await page.locator("#solve-process").click();
  ok(
    await page.locator("#input-error").isVisible(),
    "Invalid efficiency rejected",
  );
  ok(
    (await page.evaluate(() => JSON.stringify(MT_MOLLIER_INPUTS()))) === before,
    "Invalid process preserves valid states",
  );
  await page.locator("#process-efficiency").fill("0.85");
  await page.locator("#solve-process").click();
  await page.locator("#active-state").selectOption("a");
  await page.locator("#pressure-number").fill("160");
  await page.locator("#pressure-number").press("Tab");
  await page.locator("#superheat-temp").fill("600");
  await page.locator("#superheat-temp").press("Tab");
  ok(
    !(await page.locator("#input-error").isVisible()),
    "160 bar 600 C boundary accepted",
  );
  snap = await page.evaluate(() => MT_MOLLIER_SNAPSHOT());
  ok(get(snap, "A", "h (kJ/kg)") < 4200, "Expanded state fits enthalpy axis");
  ok(
    (await page.locator("#process-result").textContent()).includes(
      "no thermodynamic process",
    ),
    "Manual edit clears stale process attribution",
  );
  for (const [width, height] of [
    [390, 844],
    [844, 390],
    [1440, 900],
    [2048, 774],
  ]) {
    await page.setViewportSize({ width, height });
    ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 2,
      ),
      "No horizontal overflow " + width,
    );
    ok(await page.locator("#hs-chart").isVisible(), "Chart available " + width);
    await page.screenshot({
      path: path.join(out, "mollier-" + width + ".png"),
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("details.teaching-inputs").evaluate((el) => {
    el.open = false;
  });
  ok(
    await page.locator("#process-summary").isVisible(),
    "Process result remains outside collapsed mobile inputs",
  );
  await page.locator("details.teaching-inputs > summary").click();
  ok(
    await page.locator("#process-mode").isVisible(),
    "Mobile process controls expand",
  );
  ok(
    await page.locator("#solve-process").isVisible(),
    "Mobile process action reachable",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#presentation-toggle").click();
  await page.waitForFunction(() =>
    document
      .getElementById("hs-chart")
      .style.getPropertyValue("--teaching-chart-height"),
  );
  const bounds = await page
    .locator("#hs-chart")
    .evaluate((el) => ({
      top: el.getBoundingClientRect().top,
      bottom: el.getBoundingClientRect().bottom,
    }));
  ok(
    bounds.top >= 0 && bounds.bottom <= 900 + 2,
    "Mollier presentation retains the complete SVG and axes",
  );
  await page.locator("#presentation-toggle").press("Escape");
  ok(
    (await page
      .locator("#presentation-toggle")
      .getAttribute("aria-pressed")) === "false",
    "Mollier presentation exits with Escape",
  );
  const oversized=await page.evaluate(()=>{try{MT_MOLLIER_RESTORE('{'.repeat(50001));return false}catch(e){return e.name==='RangeError'&&e.message.includes('too large')}});
  ok(oversized,'Oversized scenario rejected before JSON parsing');
  ok(errors.length === 0, "No page exceptions");
  const result = {
    engine,
    checks,
    errors,
    status: "PASS",
    scope:
      "Local static fixture; no production, Access login or provider requests",
  };
  fs.writeFileSync(
    path.join(out, "results.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server?.close();
  });
