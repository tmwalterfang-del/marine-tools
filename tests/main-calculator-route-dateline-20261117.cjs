"use strict";
// Regression (Codex review of PR #65): a route saved from a map panned across the dateline can hold
// longitudes beyond +/-180 (Leaflet keeps unwrapped longitudes). Route fuel must still calculate.
// Independent hand reference: 179.5 E to 181 E (= 179 W) along the equator is 1.5 deg of arc,
// 1.5 * pi/180 * 3440.065 NM = 90.06 NM, displayed as 90.1 NM.
const http = require("http"), fs = require("fs"), path = require("path"), assert = require("assert/strict");
const playwright = require("playwright");
const engine = process.argv[2] || "chromium";
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { r.writeHead(403); r.end(); return; }
  fs.readFile(file, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } const t = types[path.extname(p)]; r.writeHead(200, t ? { "content-type": t } : {}); r.end(d); });
});
server.listen(0, "127.0.0.1", async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await playwright[engine].launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    // Stored data written before this fix: keep reading it unchanged (AGENTS.md).
    await ctx.addInitScript(() => localStorage.setItem("mt.route", JSON.stringify([{ lat: 0, lon: 179.5, name: "WP1" }, { lat: 0, lon: 181, name: "WP2" }])));
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/index.html?page=navigation");
    await page.locator("#calcRouteFuel").waitFor({ state: "attached" });
    await page.locator("#calcRouteFuel").evaluate((b) => b.click());
    const text = await page.locator("#resRouteFuel").innerText();
    assert.match(text, /^90\.1 NM/, "dateline route distance: " + text);
    assert.deepEqual(errors, [], "no page errors");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mt.route")));
    assert.equal(stored[1].lon, 181, "stored route is not rewritten");
    console.log(JSON.stringify({ status: "PASS", engine, text: text.split("\n")[0] }));
  } finally {
    await browser.close();
    server.close();
  }
});
