/**
 * BridgeKit API proxy — BarentsWatch AIS + API
 *
 * Cloudflare Worker secrets (Production):
 *   BW_AIS_CLIENT_ID
 *   BW_AIS_CLIENT_SECRET
 *   BW_API_CLIENT_ID
 *   BW_API_CLIENT_SECRET
 *
 * Never expose these values to the browser or commit them to GitHub.
 */
// CI redeploy trigger: 2026-10-01
const TOKEN_URL = "https://id.barentswatch.no/connect/token";
const AIS_LATEST_URL = "https://live.ais.barentswatch.no/v1/latest/combined";
const BW_API_ROOT = "https://www.barentswatch.no/bwapi/";

let tokenCache = {};

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "content-type": "application/json;charset=utf-8" }
  });
}

async function getToken(scope, env) {
  const cached = tokenCache[scope];
  if (cached && cached.expires > Date.now() + 60_000) return cached.value;

  const clientId = scope === "ais" ? env.BW_AIS_CLIENT_ID : env.BW_API_CLIENT_ID;
  const clientSecret = scope === "ais" ? env.BW_AIS_CLIENT_SECRET : env.BW_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${scope.toUpperCase()} credentials in Worker secrets`);
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`BarentsWatch ${scope} token request failed (${r.status})${detail ? `: ${detail.slice(0,300)}` : ""}`);
  }

  const data = await r.json();
  tokenCache[scope] = {
    value: data.access_token,
    expires: Date.now() + (data.expires_in || 3600) * 1000
  };

  return data.access_token;
}

async function authStatus(env) {
  const result = {
    ais: { configured: Boolean(env.BW_AIS_CLIENT_ID && env.BW_AIS_CLIENT_SECRET), authenticated: false },
    api: { configured: Boolean(env.BW_API_CLIENT_ID && env.BW_API_CLIENT_SECRET), authenticated: false }
  };

  try {
    if (result.ais.configured) {
      await getToken("ais", env);
      result.ais.authenticated = true;
    }
  } catch (e) {
    result.ais.error = e.message;
  }

  try {
    if (result.api.configured) {
      await getToken("api", env);
      result.api.authenticated = true;
    }
  } catch (e) {
    result.api.error = e.message;
  }

  return result;
}

function parseBounds(url) {
  const n = key => Number(url.searchParams.get(key));
  const minLat = n("minLat"), maxLat = n("maxLat");
  const minLon = n("minLon"), maxLon = n("maxLon");
  if (![minLat, maxLat, minLon, maxLon].every(Number.isFinite)) return null;
  return { minLat, maxLat, minLon, maxLon };
}

function inBounds(v, b) {
  const lat = Number(v.latitude ?? v.lat);
  const lon = Number(v.longitude ?? v.lon);
  return Number.isFinite(lat) && Number.isFinite(lon)
    && lat >= b.minLat && lat <= b.maxLat
    && lon >= b.minLon && lon <= b.maxLon;
}

async function latestAis(url, env) {
  const access = await getToken("ais", env);
  const r = await fetch(AIS_LATEST_URL, {
    headers: { authorization: `Bearer ${access}` }
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`AIS latest request failed (${r.status})${detail ? `: ${detail.slice(0,300)}` : ""}`);
  }
  const all = await r.json();
  if (!Array.isArray(all)) return all;
  const bounds = parseBounds(url);
  return bounds ? all.filter(v => inBounds(v, bounds)) : all;
}

const ALLOWED_BW_ENDPOINTS = {
  wave: "v1/waveforecastpoint/nearest/all",
  wind: "v1/windforecastpoint/nearest/all",
  current: "v1/seacurrent/nearest/all"
};

async function probeBarentsWatch(url, env) {
  const key = url.searchParams.get("endpoint");
  const path = ALLOWED_BW_ENDPOINTS[key];
  if (!path) return { error: "Unsupported endpoint", allowed: Object.keys(ALLOWED_BW_ENDPOINTS) };

  const access = await getToken("api", env);
  const qs = new URLSearchParams(url.searchParams);
  qs.delete("endpoint");
  const target = `${BW_API_ROOT}${path}${qs.toString() ? `?${qs}` : ""}`;
  const r = await fetch(target, {
    headers: { authorization: `Bearer ${access}`, accept: "application/json" }
  });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { upstreamStatus: r.status, endpoint: path, data: body };
}

async function forecastAdapter(url, env) {
  await getToken("api", env);
  const raw = url.searchParams.get("route");
  const route = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(route)) return [];
  return route.map((p, i) => ({
    lat: Number(p.lat),
    lon: Number(p.lon),
    hs: null,
    windKn: null,
    currentKn: null,
    index: i,
    source: "barentswatch-api-authenticated-awaiting-point-schema"
  }));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return json({ status: "ok", service: "BridgeKit API" });
      if (url.pathname === "/api/auth/status") return json(await authStatus(env));
      if (url.pathname === "/api/ais/latest") return json(await latestAis(url, env));
      if (url.pathname === "/api/forecast") return json(await forecastAdapter(url, env));
      if (url.pathname === "/api/barentswatch/probe") return json(await probeBarentsWatch(url, env));
      return json({ error: "Not found" }, 404);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};