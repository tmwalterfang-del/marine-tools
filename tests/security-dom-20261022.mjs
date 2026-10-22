import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const { JSDOM } = createRequire(import.meta.url)("jsdom");
let checks = 0;
const check = (condition, name) => {
  assert.ok(condition, name);
  checks++;
  console.log("PASS " + name);
};
const html = fs.readFileSync("index.html", "utf8"),
  usage = fs.readFileSync("usage-analytics.js", "utf8");
const d = new JSDOM(html, {
  url: "https://www.marinetools.app/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const w = d.window,
  sent = [];
w.scrollTo = () => {};
w.fetch = async (u, i) => {
  if (String(u).includes("/api/analytics/event")) sent.push(JSON.parse(i.body));
  return new Response("{}");
};
w.eval(usage);
await new Promise((r) => setTimeout(r, 10));
check(
  !sent.length && !w.localStorage.getItem("mt.analytics.browser.v1"),
  "no collection or analytics identity before consent",
);
check(
  w.document.getElementById("mtAllowAnalytics") &&
    w.document.getElementById("mtDeclineAnalytics"),
  "allow and decline are equally available",
);
w.document.getElementById("mtDeclineAnalytics").click();
check(!w.MT_USAGE.enabled() && !sent.length, "decline suppresses collection");
w.MT_USAGE.setConsent(true);
check(
  w.MT_USAGE.enabled() &&
    sent.some(
      (x) => x.event === "visit_started" && x.consent === "20261022-v1",
    ),
  "allow enables versioned consent and events",
);
w.localStorage.setItem(
  "mt.profile",
  JSON.stringify({ name: "Operational data" }),
);
w.MT_USAGE.setConsent(false);
const count = sent.length;
w.MT_USAGE.send("visit_started");
check(
  !w.MT_USAGE.enabled() && sent.length === count,
  "withdrawal stops collection immediately",
);
check(
  !Array.from({ length: w.localStorage.length }, (_, i) =>
    w.localStorage.key(i),
  ).some((k) => k.startsWith("mt.analytics.") && k !== "mt.analytics.exclude"),
  "withdrawal clears analytics identity",
);
check(
  w.localStorage.getItem("mt.profile").includes("Operational data"),
  "withdrawal preserves operational data",
);
// Malicious backup values are inert text, including IDs and nominal numeric fields.
const attack =
  '\"><img data-audit-injection src=x onerror="window.__auditXss=1">';
w.localStorage.setItem(
  "mt.profile.v2",
  JSON.stringify({
    schemaVersion: 1,
    vessel: {},
    operational: {},
    carriers: [
      {
        id: attack,
        name: attack,
        category: "fuel",
        primaryUnit: "m3",
        densityKgM3: attack,
        densityRefTempC: attack,
        lhvMjKg: attack,
        capacityKwh: attack,
      },
    ],
    machinery: [{ id: attack, name: attack, type: attack }],
    tanks: [{ id: attack, name: attack, unit: attack, capacity: 1 }],
  }),
);
w.eval(
  fs
    .readFileSync("app.js", "utf8")
    .replace(
      "function init(){renderHome();",
      "window.__auditImport=importDataBackup;function init(){renderHome();",
    ),
);
w.eval(fs.readFileSync("product-v860.js", "utf8"));
w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
await new Promise((r) => setTimeout(r, 150));
const go = w.document.createElement("button");
go.dataset.go = "profile";
w.document.body.append(go);
go.click();
await new Promise((r) => setTimeout(r, 150));
check(
  w.document.getElementById("mtCarrierRows")?.textContent.includes("Remove"),
  "profile rendered for injection regression",
);
check(
  !w.document.querySelector("[data-audit-injection]") && !w.__auditXss,
  "imported identifiers, numeric fields and units cannot inject markup",
);
w.confirm = () => true;
await w.__auditImport({
  size: 100,
  text: async () =>
    JSON.stringify({
      settings: { usageAnalytics: true, analyticsConsent: "20261022-v1" },
    }),
});
check(
  JSON.parse(w.localStorage.getItem("mt.settings")).usageAnalytics === false,
  "imported backup cannot grant analytics consent",
);
const product = fs.readFileSync("product-v860.js", "utf8"),
  exportFn = product.slice(
    product.indexOf("function exportEnergy()"),
    product.indexOf(
      "function importBunk",
      product.indexOf("function exportEnergy()"),
    ),
  );
let csv = "";
new Function(
  "profile",
  "entries",
  "download",
  "localDate",
  "track",
  "carrier",
  exportFn + ";exportEnergy()",
)(
  () => ({ carriers: [] }),
  () => [{ date: "=1+1", carrierName: "+cmd", notes: "@SUM(1,2)", amount: 12 }],
  (name, text) => {
    csv = text;
  },
  () => "2026-10-22",
  () => {},
  () => null,
);
check(
  csv.includes("'=1+1") && csv.includes("'+cmd") && csv.includes("'@SUM"),
  "CSV formula strings are neutralized while numbers remain usable",
);
w.close();
console.log(
  JSON.stringify({
    result: "PASS",
    checks,
    scope:
      "Isolated DOM, synthetic consent and malicious backup values; no network requests.",
  }),
);
