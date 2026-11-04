const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict"),
  { chromium, firefox, webkit } = require("playwright");
const root = path.resolve(__dirname, ".."),
  mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".gz": "application/octet-stream",
  };
const profile = {
  schemaVersion: 1,
  vessel: { name: "Reference vessel", serviceSpeed: 10 },
  operational: { fuelDay: 24 },
  carriers: [
    {
      id: "mgo",
      name: "MGO",
      catalogKey: "mgo",
      category: "fuel",
      primaryUnit: "m3",
      densityKgM3: 850,
    },
  ],
  machinery: [
    {
      id: "m1",
      name: "Main engine",
      ratedPowerKw: 1000,
      type: "Main engine",
      primaryCarrierId: "mgo",
    },
    {
      id: "a1",
      name: "Auxiliary",
      ratedPowerKw: 200,
      type: "Generator",
      primaryCarrierId: "mgo",
    },
  ],
  tanks: [],
  regulatory: {
    flag: "NO",
    shipType: "cargo",
    grossTonnage: 2000,
    keelDate: "2022-01-01",
    engines: [
      {
        id: "m1",
        kind: "propulsion",
        dieselEngine: true,
        ratedKw: 1000,
        factorMethod: "energy",
        factor: 8,
        factorPosition: "outlet",
        factorSource: "Engine-specific test report",
        tier: "III",
        eiappSource: "EIAPP file A",
      },
      {
        id: "a1",
        kind: "auxiliary",
        dieselEngine: true,
        ratedKw: 200,
        factorMethod: "energy",
        factor: 6,
        factorPosition: "outlet",
        factorSource: "Auxiliary-specific test report",
        tier: "III",
        eiappSource: "EIAPP file B",
      },
    ],
  },
};
async function main() {
  const server = http.createServer((req, res) => {
    let name;
    try {
      name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const file = path.resolve(root, "." + name);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (e, data) => {
      if (e) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port,
    kind = process.env.REGULATORY_BROWSER || "chromium",
    engine = { chromium, firefox, webkit }[kind],
    browser = await engine.launch({
      headless: true,
      ...(kind === "chromium" && process.env.STUDENTS_BROWSER_EXECUTABLE
        ? { executablePath: process.env.STUDENTS_BROWSER_EXECUTABLE }
        : {}),
    }),
    context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.stack || e.message));
  try {
    await context.addInitScript((p) => {
      localStorage.setItem("mt.profile.v2", JSON.stringify(p));
    }, profile);
    await page.goto(base + "/regulatory.html#nox");
    await page.locator("#calculate-nox").waitFor();
    const first = page.locator(".nox-row").first();
    await first.locator("[name=engineId]").selectOption("m1");
    await first.locator("[name=powerKw]").fill("1000");
    await first.locator("[name=hours]").fill("10");
    await first.locator("[name=date]").fill("2026-06-01");
    await page.locator("#calculate-nox").click();
    await page.locator("#nox-result table").waitFor();
    assert.match(await page.locator("#nox-result").innerText(), /80/);
    assert.match(await page.locator("#nox-result").innerText(), /Unconfirmed/);
    await page
      .locator("#charge-context [name=operation]")
      .selectOption("domestic-norway");
    await page
      .locator("#charge-context [name=participates]")
      .selectOption("no");
    await page.locator("#calculate-nox").click();
    assert.match(await page.locator("#nox-result").innerText(), /2,155\.2/);
    await page.locator("#add-row").click();
    const second = page.locator(".nox-row").nth(1);
    await second.locator("[name=engineId]").selectOption("a1");
    await second.locator("[name=powerKw]").fill("100");
    await second.locator("[name=hours]").fill("10");
    await second.locator("[name=date]").fill("2026-06-01");
    await page.locator("#calculate-nox").click();
    assert.match(await page.locator("#nox-result").innerText(), /86/);
    assert.match(await page.locator("#nox-result").innerText(), /2,316\.84/);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#nox-json").click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "marine-tools-nox.json");
    const stream = await download.createReadStream(),
      chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const exported = JSON.parse(Buffer.concat(chunks));
    assert.equal(exported.kgNOx, 86);
    assert.equal(exported.items[0].emissions.inputs.powerKw, 1000);
    await page.locator('#tabs a[href="#profile"]').click();
    await page
      .locator("#reg-profile .vessel-config [name=name]")
      .fill("Vessel after save");
    await page.locator("#reg-profile .primary").click();
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("mt.profile")).name,
      ),
      "Vessel after save",
    );
    assert.equal(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("mt.profile.v2")).machinery.length,
      ),
      2,
    );
    await page.locator("#language").selectOption("nb");
    assert.equal(await page.locator("html").getAttribute("lang"), "nb");
    assert.match(
      await page.locator("#profile").innerText(),
      /Fartøy og sertifikater/,
    );
    assert.equal(
      await page
        .locator("#reg-profile .vessel-config [name=name]")
        .inputValue(),
      "Vessel after save",
    );
    await page.locator('#tabs a[href="#voyage"]').click();
    await page.locator(".leaflet-container").waitFor();
    await page.waitForSelector("#reg-map svg path");
    assert.equal(await page.locator('#voyage [name=speed]').inputValue(), '10');
    assert.equal(await page.locator('#voyage [name=carrierId]').inputValue(), 'mgo');
    assert.equal(await page.locator('#voyage [name=fuelRate]').inputValue(), '1');
    await page.locator('#map-inspect').click();
    const findAreaPoint = () => page.evaluate(() => {
      const map = document.querySelector('#reg-map').getBoundingClientRect();
      for (const path of document.querySelectorAll('#reg-map svg path.leaflet-interactive')) {
        const matrix = path.getScreenCTM();
        if (!matrix || path.getAttribute('fill') === 'none') continue;
        const box = path.getBBox();
        for (let x = 0.1; x < 1; x += 0.1) for (let y = 0.1; y < 1; y += 0.1) {
          const pt = new DOMPoint(box.x + x * box.width, box.y + y * box.height);
          if (!path.isPointInFill(pt)) continue;
          const screen = pt.matrixTransform(matrix);
          if (screen.x > map.left + 35 && screen.x < map.right - 35 && screen.y > map.top + 35 && screen.y < map.bottom - 35) return {x: screen.x, y: screen.y};
        }
      }
      return null;
    });
    const areaPoint = await findAreaPoint();
    assert.ok(areaPoint, 'A visible coloured area can be targeted');
    await page.locator('#map-draw').click();
    await page.mouse.click(areaPoint.x, areaPoint.y);
    assert.equal(await page.locator('.waypoint').count(), 1, 'Drawing through coloured area adds a waypoint');
    assert.equal(await page.locator('.reg-waypoint-icon').count(), 1, 'First waypoint is visible');
    const beforeDrag = await page.locator('.waypoint [name=lon]').inputValue();
    const pin = await page.locator('.reg-waypoint-icon').boundingBox();
    await page.mouse.move(pin.x + 14, pin.y + 14);
    await page.mouse.down(); await page.mouse.move(pin.x + 35, pin.y + 14, {steps: 5}); await page.mouse.up();
    assert.notEqual(await page.locator('.waypoint [name=lon]').inputValue(), beforeDrag, 'Dragging updates waypoint');
    await page.locator('[data-waypoint="0"][data-action="remove"]').click();
    await page.locator('#map-inspect').click();
    const inspectPoint = await findAreaPoint();
    await page.mouse.click(inspectPoint.x, inspectPoint.y);
    assert.equal(await page.locator('.waypoint').count(), 0, 'Inspect mode does not create a waypoint');
    await page.locator('.leaflet-popup').waitFor();
    await page.locator('#map-draw').click();
    await page
      .locator("#voyage [name=routeName]")
      .fill("Bergen–Arctic reference");
    await page.locator("#voyage [name=departure]").fill("2026-06-01T12:00");
    await page.locator("#voyage [name=speed]").fill("10");
    for (const [lon, lat] of [
      [-4, 61],
      [4, 65],
      [12, 70],
    ]) {
      await page.locator("#add-waypoint").click();
      const row = page.locator(".waypoint").last();
      await row.locator("[name=lon]").fill(String(lon));
      await row.locator("[name=lat]").fill(String(lat));
    }
    await page.locator("#analyze-route").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#route-table") ||
        document.querySelector("#message.error")?.textContent,
      {},
      { timeout: 120000 },
    );
    assert.ok(
      await page.locator("#route-table").count(),
      (await page.locator("#message").innerText()) +
        " / " +
        (await page.locator("#route-progress").innerText()) +
        " / " +
        JSON.stringify(errors),
    );
    const report = await page.locator("#route-results").innerText();
    assert.match(report, /Norskehavet/);
    assert.match(report, /Nordøst-Atlanteren/);
    assert.match(report, /Vedtatt framtidig/);
    assert.doesNotMatch(report, /undefined|NaN|Infinity/);
    for (const [id, extension] of [["route-json", ".json"], ["route-csv", ".csv"], ["route-html", ".html"]]) {
      const pending = page.waitForEvent("download");
      await page.locator(`#${id}`).click();
      const file = await pending;
      assert.ok(file.suggestedFilename().endsWith(extension));
      const data = [];
      for await (const chunk of await file.createReadStream()) data.push(chunk);
      const contents = Buffer.concat(data).toString("utf8");
      if (extension === ".json") assert.ok(JSON.parse(contents).segments.length);
      if (extension === ".csv") assert.match(contents, /Norskehavet/);
      if (extension === ".html") {
        assert.match(contents, /<svg/);
        assert.match(contents, /Norskehavet/);
      }
    }
    assert.equal(
      await page.locator("#message.error").count(),
      0,
      await page.locator("#message").innerText(),
    );
    await page.locator("#save-plan").click();
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("mt.regulatory.plans.v1")).length,
      ),
      1,
    );
    await page.locator("#voyage [name=departure]").fill("2028-06-01T12:00");
    await page.locator("#analyze-route").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#route-table") ||
        document.querySelector("#message.error")?.textContent,
      {},
      { timeout: 120000 },
    );
    assert.ok(
      await page.locator("#route-table").count(),
      (await page.locator("#message").innerText()) +
        " / " +
        (await page.locator("#route-progress").innerText()) +
        " / " +
        JSON.stringify(errors),
    );
    assert.doesNotMatch(
      await page.locator("#route-results").innerText(),
      /undefined|NaN|Infinity/,
    );
    await page
      .locator("#route-file")
      .setInputFiles({
        name: "route.gpx",
        mimeType: "application/gpx+xml",
        buffer: Buffer.from(
          '<?xml version="1.0"?><gpx><rte><rtept lat="65" lon="4"/><rtept lat="66" lon="5"/></rte></gpx>',
        ),
      });
    assert.equal(await page.locator(".waypoint").count(), 2);
    assert.equal(
      await page.locator("#route-table").count(),
      0,
      "Input changes clear stale analysis",
    );
    await page
      .locator("#route-file")
      .setInputFiles({
        name: "bad.gpx",
        mimeType: "application/gpx+xml",
        buffer: Buffer.from(
          '<!DOCTYPE gpx [<!ENTITY x SYSTEM "https://example.invalid/secret">]><gpx/>',
        ),
      });
    assert.match(await page.locator("#message").innerText(), /XML/);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const tab of ["nox", "voyage", "profile", "sources"]) {
        await page.locator('#tabs a[href="#' + tab + '"]').click();
        await page.waitForTimeout(80);
        const dimensions = await page.evaluate(() => ({
          body: document.documentElement.scrollWidth,
          view: innerWidth,
          overflow: [...document.querySelectorAll('body *')].filter(e => e.clientWidth && e.scrollWidth > e.clientWidth + 2).slice(0, 12).map(e => ({tag:e.tagName, class:String(e.className), scroll:e.scrollWidth,client:e.clientWidth,text:e.tagName==='LABEL'?e.textContent.slice(0,120):''})),
        }));
        assert.ok(
          dimensions.body <= dimensions.view + 1,
          tab + " overflows at " + width + ": " + JSON.stringify(dimensions),
        );
      }
    }
    const output = process.env.REGULATORY_QA_DIR;
    if (output) {
      fs.mkdirSync(output, { recursive: true });
      await page.locator('#tabs a[href="#voyage"]').click();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: path.join(output, kind + "-voyage.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 900 });
      await page.screenshot({
        path: path.join(output, kind + "-voyage-mobile.png"),
        fullPage: true,
      });
    }
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        status: "PASS",
        browser: kind,
        scope:
          "Actual profile, NOx amounts/charges, stale-result invalidation, JSON report, private local plans, real polygon worker, future dates, XML rejection, Norwegian and four-view reflow.",
      }),
    );
  } finally {
    await context.close();
    await browser.close();
    await new Promise((r) => server.close(r));
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
