import assert from "node:assert/strict";
import fs from "node:fs";
import { securityGateway, readBounded } from "../worker/security.js";
import { providerFetch, BoundedMap } from "../worker/provider-security.js";
import {
  securityEnv,
  token,
  headers,
  installJwksFetch,
} from "./security-fixture-20261022.mjs";
import fullWorker from "../worker/worker-v860-dashboard.js";
const restore = installJwksFetch();
let checks = 0,
  calls = 0;
const check = (name, condition) => {
  assert.ok(condition, name);
  checks++;
  console.log("PASS " + name);
};
const delegate = async (req) => {
  calls++;
  return new Response(
    JSON.stringify({
      email: req.headers.get("cf-access-authenticated-user-email"),
    }),
    { headers: { "content-type": "application/json" } },
  );
};
const request = (path = "/admin/analytics", init = {}) =>
  new Request("https://api.marinetools.app" + path, init);
const run = (req, env = securityEnv, fn = delegate) =>
  securityGateway(req, env, {}, fn);
for (const path of [
  "/admin",
  "/admin/analytics",
  "/admin/analytics/data",
  "/admin/status",
  "/admin/unknown",
  "/ADMIN/a",
  "/api/barentswatch/probe",
]) {
  const before = calls;
  check(
    "unauthenticated " + path,
    (await run(request(path))).status === 401 && calls === before,
  );
  check(
    "forged assertion " + path,
    (
      await run(
        request(path, { headers: { "cf-access-jwt-assertion": "anything" } }),
      )
    ).status === 401 && calls === before,
  );
}
let r = await run(request(undefined, { headers }));
check("real RSA token accepted", r.status === 200);
check(
  "identity comes from signed token",
  (await r.json()).email === "owner@example.invalid",
);
const now = Math.floor(Date.now() / 1000);
for (const [name, claims, opts] of [
  ["expired", { iat: now - 7200, exp: now - 3600 }],
  ["wrong issuer", { iss: "https://evil.invalid" }],
  ["wrong audience", { aud: "other" }],
  ["future iat", { iat: now + 600 }],
  ["future nbf", { nbf: now + 600 }],
  ["empty subject", { sub: "" }],
  ["invalid lifetime", { exp: now - 100 }],
  ["unknown key", {}, { kid: "other" }],
]) {
  const t = await token(claims, opts);
  check(
    name + " denied",
    (
      await run(
        request(undefined, { headers: { "cf-access-jwt-assertion": t } }),
      )
    ).status === 401,
  );
}
check(
  "unsigned token rejected",
  (
    await run(
      request(undefined, {
        headers: {
          "cf-access-jwt-assertion":
            "eyJhbGciOiJub25lIn0.eyJzdWIiOiJvd25lciJ9.",
        },
      }),
    )
  ).status === 401,
);
check(
  "missing configuration fails closed",
  (await run(request(undefined, { headers }), {})).status === 503,
);
check(
  "email allowlist is enforced",
  (
    await run(request(undefined, { headers }), {
      ...securityEnv,
      ADMIN_EMAIL_ALLOWLIST: "another@example.invalid",
    })
  ).status === 403,
);
check(
  "matching allowlist accepted",
  (
    await run(request(undefined, { headers }), {
      ...securityEnv,
      ADMIN_EMAIL_ALLOWLIST: "OWNER@example.invalid",
    })
  ).status === 200,
);
for (const path of [
  "/admin/analytics",
  "/api/analytics/event",
  "/api/barentswatch/probe",
])
  check(
    "preview blocks " + path,
    (
      await run(
        new Request("https://test.api.marinetools.app" + path, { headers }),
      )
    ).status === 403,
  );
check(
  "alternate host denied",
  (
    await run(
      new Request("https://worker.workers.dev/admin/analytics", { headers }),
    )
  ).status === 403,
);
check(
  "foreign origin denied",
  (
    await run(
      request("/api/weather?lat=58&lon=8", {
        headers: { origin: "https://evil.invalid" },
      }),
    )
  ).status === 403,
);
for (const path of [
  "/api/weather?lat=91&lon=8",
  "/api/weather?lat=&lon=8",
  "/api/weather?lat=58&lat=59&lon=8",
  "/api/weather?lat=58&lon=8&limit=999",
  "/api/ais/latest",
  "/api/ais/latest?minLat=60&maxLat=50&minLon=1&maxLon=2",
  "/api/forecast?route=oops",
  "/api/forecast?route=" +
    encodeURIComponent(JSON.stringify([{ lat: 999, lon: 0 }])),
]) {
  const before = calls;
  check(
    "invalid request rejected " + path.slice(0, 60),
    (await run(request(path))).status === 400 && calls === before,
  );
}
check(
  "valid weather allowed",
  (await run(request("/api/weather?lat=58&lon=8"))).status === 200,
);
check(
  "public limiter missing fails closed",
  (await run(request("/api/weather?lat=58&lon=8"), {})).status === 503,
);
let key;
const blocked = {
  async limit(x) {
    key = x.key;
    return { success: false };
  },
};
r = await run(
  request("/api/weather?lat=58&lon=8", {
    headers: { "cf-connecting-ip": "192.0.2.1" },
  }),
  { ...securityEnv, PUBLIC_API_LIMITER: blocked },
);
check(
  "rate exceeded returns retry delay",
  r.status === 429 && r.headers.get("retry-after") === "60",
);
check("rate uses trusted Cloudflare client IP", key === "192.0.2.1");
check(
  "admin POST denied",
  (await run(request("/admin/analytics", { method: "POST", headers })))
    .status === 405,
);
r = await run(
  request("/api/health", { headers: { origin: "https://marinetools.app" } }),
);
check(
  "CORS only reflects approved origin",
  r.headers.get("access-control-allow-origin") === "https://marinetools.app",
);
check(
  "response prevents caching and MIME sniffing",
  r.headers.get("cache-control") === "no-store" &&
    r.headers.get("x-content-type-options") === "nosniff",
);
r = await run(
  request(undefined, { headers }),
  securityEnv,
  async () =>
    new Response("<script>window.ok=1</script>", {
      headers: { "content-type": "text/html" },
    }),
);
const csp = r.headers.get("content-security-policy"),
  html = await r.text();
check(
  "admin nonce CSP matches script",
  csp.includes("script-src 'nonce-") &&
    html.includes('nonce="' + csp.match(/nonce-([^']+)/)[1] + '"'),
);
check("admin forbids framing", csp.includes("frame-ancestors 'none'"));
const event = {
  event: "visit_started",
  page: "home",
  tool: "",
  device: "desktop",
  version: "8.7.0",
  schema: "usage-v1",
  visitor: crypto.randomUUID(),
  session: crypto.randomUUID(),
  source: "direct",
  visitorKind: "first",
};
const post = (body, type = "application/json") =>
  request("/api/analytics/event", {
    method: "POST",
    headers: { origin: "https://marinetools.app", "content-type": type },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const fullHealth = await fullWorker.fetch(
  request("/api/health"),
  securityEnv,
  {},
);
check("real Worker chain public health preserved", fullHealth.status === 200);
check(
  "real Worker chain denies fake admin token",
  (
    await fullWorker.fetch(
      request("/admin/api/analytics", {
        headers: { "cf-access-jwt-assertion": "fake" },
      }),
      securityEnv,
      {},
    )
  ).status === 401,
);
const before = calls;
r = await run(post(event));
check("no consent never writes", r.status === 202 && calls === before);
check(
  "explicit consent accepted",
  (await run(post({ ...event, consent: "20261022-v1" }))).status === 200,
);
check(
  "analytics unknown fields rejected",
  (await run(post({ ...event, email: "secret@example.invalid" }))).status ===
    400,
);
check(
  "analytics arbitrary labels rejected",
  (await run(post({ ...event, label: "vessel private name" }))).status === 400,
);
check(
  "analytics byte limit enforced",
  (await run(post(JSON.stringify({ ...event, label: "ø".repeat(3000) }))))
    .status === 413,
);
check(
  "analytics content type enforced",
  (await run(post(event, "text/html"))).status === 415,
);
check(
  "analytics malformed JSON rejected",
  (await run(post("{"))).status === 400,
);
let cancelled = false;
const stream = new ReadableStream({
  start(c) {
    c.enqueue(new Uint8Array(4097));
  },
  cancel() {
    cancelled = true;
  },
});
await assert.rejects(readBounded(stream), /BODY_TOO_LARGE/);
check("oversized stream is cancelled", cancelled);
let slowCancelled = false;
await assert.rejects(
  readBounded(
    new ReadableStream({
      cancel() {
        slowCancelled = true;
      },
    }),
    4096,
    15,
  ),
  /BODY_TIMEOUT/,
);
check("slow body has a deadline and is cancelled", slowCancelled);
const cache = new BoundedMap(2);
cache.set("a", 1).set("b", 2).set("c", 3);
check("provider cache is bounded", cache.size === 2 && !cache.has("a"));
await assert.rejects(providerFetch("https://evil.invalid/"), /not allowed/);
checks++;
restore();
let captured;
globalThis.fetch = async (url, init) => {
  captured = init;
  return new Response("{}");
};
await providerFetch("https://api.met.no/test");
check(
  "provider redirects forbidden and deadline attached",
  captured.redirect === "error" && captured.signal instanceof AbortSignal,
);
globalThis.fetch = async () =>
  new Response("x", { headers: { "content-length": "999999999" } });
await assert.rejects(providerFetch("https://api.met.no/test"), /too large/);
checks++;
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
check("analytics defaults off", app.includes("usageAnalytics:false"));
for (const f of ["app.js", "weather-map-v854.js"])
  check(
    "Leaflet self hosted in " + f,
    fs
      .readFileSync(new URL("../" + f, import.meta.url), "utf8")
      .includes("vendor/leaflet/leaflet.js"),
  );
check(
  "third party support script removed",
  !fs
    .readFileSync(new URL("../support-widget-v857.js", import.meta.url), "utf8")
    .includes("createElement('script')"),
);
console.log(
  JSON.stringify({
    result: "PASS",
    checks,
    scope:
      "Isolated synthetic RSA/JWKS, rate limiter, provider and collector fixtures; no production traffic or writes.",
  }),
);
