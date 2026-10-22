import { createRemoteJWKSet, jwtVerify } from "jose";
const origins = new Set([
  "https://marinetools.app",
  "https://www.marinetools.app",
]);
const keysets = new Map();
export const previewHost = (host) =>
  /^[a-z0-9-]+\.api\.marinetools\.app$/i.test(host);
const previewOrigin = (origin) =>
  /^https:\/\/[a-z0-9-]+\.marine-tools-frontend-preview\.pages\.dev$/i.test(
    origin,
  );
const privatePath = (path) =>
  /^\/admin(?:\/|$)/i.test(path) || path === "/api/barentswatch/probe";
function reply(error, status, extra = {}) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "content-type": "application/json;charset=utf-8",
      "cache-control": "no-store",
      ...extra,
    },
  });
}
export async function readBounded(stream, max = 4096, timeoutMs = 5000) {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader(),
    chunks = [];
  let size = 0,
    timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(Error("BODY_TIMEOUT"));
      reader.cancel().catch(() => {});
    }, timeoutMs);
  });
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        reader.cancel().catch(() => {});
        throw Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of chunks) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}
export async function verifyAdmin(request, env) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token || token.length > 16384)
    return {
      error: reply("Cloudflare Access authentication is required.", 401),
    };
  const issuer = String(env.ACCESS_TEAM_DOMAIN || "").replace(/\/$/, "");
  const audience = String(env.ACCESS_AUD || "");
  if (
    !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) ||
    !audience ||
    audience.length > 256
  )
    return { error: reply("Admin authentication is not configured.", 503) };
  try {
    let keys = keysets.get(issuer);
    if (!keys) {
      if (keysets.size >= 8) keysets.delete(keysets.keys().next().value);
      keys = createRemoteJWKSet(new URL(issuer + "/cdn-cgi/access/certs"), {
        timeoutDuration: 3000,
        cooldownDuration: 30000,
        cacheMaxAge: 300000,
      });
      keysets.set(issuer, keys);
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience,
      algorithms: ["RS256"],
      clockTolerance: 5,
      requiredClaims: ["iss", "aud", "sub", "iat", "exp"],
      maxTokenAge: "24h",
    });
    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.iat !== "number" ||
      payload.iat > Date.now() / 1000 + 5 ||
      typeof payload.exp !== "number" ||
      payload.exp <= payload.iat
    )
      throw Error("Invalid claims");
    const allow = String(env.ADMIN_EMAIL_ALLOWLIST || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
    if (
      allow.length &&
      !allow.includes(String(payload.email || "").toLowerCase())
    )
      return { error: reply("Admin access is denied.", 403) };
    const headers = new Headers(request.headers);
    headers.delete("cf-access-authenticated-user-email");
    headers.set(
      "cf-access-authenticated-user-email",
      typeof payload.email === "string" ? payload.email : "Cloudflare Access",
    );
    return { request: new Request(request, { headers }) };
  } catch {
    return {
      error: reply(
        "Cloudflare Access authentication is invalid or expired.",
        401,
      ),
    };
  }
}
export async function headersFor(response, request) {
  const h = new Headers(response.headers),
    url = new URL(request.url),
    origin = request.headers.get("origin") || "",
    isPrivate = privatePath(url.pathname);
  for (const name of [...h.keys()])
    if (name.startsWith("access-control-")) h.delete(name);
  if (
    !isPrivate &&
    (origins.has(origin) ||
      (previewHost(url.hostname) && previewOrigin(origin)))
  ) {
    h.set("access-control-allow-origin", origin);
    h.set("vary", "Origin");
    h.set(
      "access-control-allow-methods",
      url.pathname === "/api/analytics/event"
        ? "POST,OPTIONS"
        : "GET,HEAD,OPTIONS",
    );
    h.set("access-control-allow-headers", "content-type");
    h.set(
      "access-control-expose-headers",
      "x-marine-tools-environment,x-marine-tools-analytics,x-marine-tools-ais-provider",
    );
    if (previewHost(url.hostname))
      h.set("access-control-allow-credentials", "true");
  }
  h.set("x-content-type-options", "nosniff");
  h.set("referrer-policy", "no-referrer");
  h.set("x-frame-options", "DENY");
  h.set("strict-transport-security", "max-age=31536000");
  h.set("permissions-policy", "camera=(), microphone=(), payment=()");
  h.set("cache-control", "no-store");
  let body = response.body;
  if (isPrivate) {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    h.set(
      "content-security-policy",
      "default-src 'none'; script-src 'nonce-" +
        nonce +
        "'; style-src 'unsafe-inline'; img-src https://www.marinetools.app; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    );
    if (response.headers.get("content-type")?.includes("text/html"))
      body = (await response.text()).replace(
        /<script\b/g,
        '<script nonce="' + nonce + '"',
      );
  }
  return new Response(request.method === "HEAD" ? null : body, {
    status: response.status,
    statusText: response.statusText,
    headers: h,
  });
}
function queryError(url) {
  if (url.href.length > 49152) return "Request URL is too large.";
  for (const key of new Set(url.searchParams.keys()))
    if (url.searchParams.getAll(key).length > 1)
      return "Duplicate query parameters are not allowed.";
  const number = (key, min, max) => {
    const raw = url.searchParams.get(key);
    return (
      raw !== null &&
      raw.trim() !== "" &&
      Number.isFinite(Number(raw)) &&
      Number(raw) >= min &&
      Number(raw) <= max
    );
  };
  if (
    url.pathname === "/api/weather" &&
    (!number("lat", -90, 90) ||
      !number("lon", -180, 180) ||
      (url.searchParams.has("limit") && !number("limit", 1, 24)))
  )
    return "Enter a valid latitude, longitude and forecast limit (1–24).";
  if (url.pathname === "/api/ais/latest") {
    if (
      !number("minLat", -90, 90) ||
      !number("maxLat", -90, 90) ||
      !number("minLon", -180, 180) ||
      !number("maxLon", -180, 180) ||
      Number(url.searchParams.get("minLat")) >
        Number(url.searchParams.get("maxLat")) ||
      Number(url.searchParams.get("minLon")) >
        Number(url.searchParams.get("maxLon"))
    )
      return "Enter a complete, ordered AIS bounding box.";
  }
  if (url.pathname === "/api/forecast") {
    let route;
    try {
      route = JSON.parse(url.searchParams.get("route"));
    } catch {
      return "Route must be valid JSON.";
    }
    if (
      !Array.isArray(route) ||
      !route.length ||
      route.length > 1000 ||
      route.some(
        (p) =>
          !p ||
          typeof p !== "object" ||
          typeof p.lat !== "number" ||
          typeof p.lon !== "number" ||
          !Number.isFinite(p.lat) ||
          !Number.isFinite(p.lon) ||
          Math.abs(p.lat) > 90 ||
          Math.abs(p.lon) > 180 ||
          (p.name !== undefined &&
            (typeof p.name !== "string" || p.name.length > 120)),
      )
    )
      return "Route must contain 1–1000 valid positions.";
  }
  return null;
}
async function limit(request, env, name) {
  const binding = env[name];
  if (!binding?.limit)
    return reply(
      "Request protection is not configured. Please try again later.",
      503,
    );
  try {
    const { success } = await binding.limit({
      key: request.headers.get("cf-connecting-ip") || "unknown",
    });
    return success
      ? null
      : reply("Too many requests. Please try again in one minute.", 429, {
          "retry-after": "60",
        });
  } catch {
    return reply("Request protection is temporarily unavailable.", 503);
  }
}
const publicPaths = new Set([
  "/api/weather",
  "/api/forecast",
  "/api/ais/latest",
  "/api/auth/status",
]);
function redactErrors(value, depth = 0) {
  if (depth > 16) return null;
  if (Array.isArray(value)) return value.map((x) => redactErrors(x, depth + 1));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (
        (key === "error" || key === "message") &&
        typeof value[key] === "string"
      )
        value[key] = "Upstream service unavailable.";
      else value[key] = redactErrors(value[key], depth + 1);
    }
  }
  return value;
}
export async function securityGateway(request, env, ctx, delegate) {
  const url = new URL(request.url),
    path = url.pathname,
    preview = previewHost(url.hostname);
  const finish = (r) => headersFor(r, request);
  if (
    url.protocol !== "https:" ||
    (url.hostname !== "api.marinetools.app" && !preview)
  )
    return finish(reply("Host is not enabled.", 403));
  // Preview cannot authenticate into, query, or write production administration.
  if (preview && (privatePath(path) || path.startsWith("/api/analytics")))
    return finish(
      reply("Analytics and admin endpoints are disabled in preview.", 403),
    );
  const origin = request.headers.get("origin");
  if (
    origin &&
    !(
      (origins.has(origin) && !preview) ||
      (preview && previewOrigin(origin)) ||
      (privatePath(path) && origin === url.origin)
    )
  )
    return finish(reply("Origin is not allowed.", 403));
  if (privatePath(path)) {
    if (!["GET", "HEAD"].includes(request.method))
      return finish(reply("Method not allowed.", 405, { allow: "GET, HEAD" }));
    const auth = await verifyAdmin(request, env);
    if (auth.error) return finish(auth.error);
    request = auth.request;
    const denied = await limit(request, env, "ADMIN_LIMITER");
    if (denied) return finish(denied);
  } else {
    const allowed =
      path === "/api/analytics/event"
        ? ["POST", "OPTIONS"]
        : ["GET", "HEAD", "OPTIONS"];
    if (!allowed.includes(request.method))
      return finish(
        reply("Method not allowed.", 405, { allow: allowed.join(", ") }),
      );
  }
  if (request.method === "OPTIONS")
    return finish(new Response(null, { status: 204 }));
  const invalid = queryError(url);
  if (invalid)
    return finish(reply(invalid, url.href.length > 49152 ? 414 : 400));
  if (publicPaths.has(path) || path === "/api/analytics/event") {
    const denied = await limit(
      request,
      env,
      path === "/api/analytics/event"
        ? "ANALYTICS_LIMITER"
        : "PUBLIC_API_LIMITER",
    );
    if (denied) return finish(denied);
  }
  if (path === "/api/analytics/event") {
    if (!origin || !origins.has(origin))
      return finish(reply("Origin is required.", 403));
    if (
      request.headers.has("content-encoding") ||
      !/^application\/json\b|^text\/plain\b/i.test(
        request.headers.get("content-type") || "",
      )
    )
      return finish(reply("Unsupported content type.", 415));
    let bytes;
    try {
      bytes = await readBounded(request.body);
    } catch (error) {
      return finish(
        reply(
          error.message === "BODY_TIMEOUT"
            ? "Analytics upload timed out."
            : "Analytics payload is too large.",
          error.message === "BODY_TIMEOUT" ? 408 : 413,
        ),
      );
    }
    let body;
    try {
      body = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      return finish(reply("Invalid analytics JSON.", 400));
    }
    const { validateAnalytics } = await import("./analytics-schema.js");
    const problem = validateAnalytics(body);
    if (problem) return finish(reply(problem, 400));
    if (body.consent !== "20261022-v1")
      return finish(
        new Response(
          JSON.stringify({
            ok: true,
            recorded: false,
            reason: "CONSENT_REQUIRED",
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        ),
      );
    const cleanHeaders = new Headers(request.headers);
    cleanHeaders.delete("content-length");
    request = new Request(request, {
      headers: cleanHeaders,
      body: JSON.stringify(body),
    });
  }
  try {
    let response = await delegate(request, env, ctx);
    if (
      publicPaths.has(path) &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      const body = await response.json();
      const clean =
        response.status >= 400
          ? {
              error: "External data is unavailable. Please try again later.",
              code: body.code || "UPSTREAM_UNAVAILABLE",
            }
          : redactErrors(body);
      response = new Response(JSON.stringify(clean), {
        status: response.status,
        headers: response.headers,
      });
    }
    return finish(response);
  } catch {
    return finish(
      reply("Service is temporarily unavailable. Please try again later.", 503),
    );
  }
}
