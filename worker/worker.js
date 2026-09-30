
/**
 * Marine Tools API proxy — Cloudflare Worker example.
 *
 * Add these Worker secrets:
 *   BW_AIS_CLIENT_ID
 *   BW_AIS_CLIENT_SECRET
 *   BW_API_CLIENT_ID
 *   BW_API_CLIENT_SECRET
 *
 * Never commit the secret values.
 *
 * This worker intentionally keeps the public interface small. Review BarentsWatch
 * terms, rate limits and response schemas before production use.
 */

const TOKEN_URL = "https://id.barentswatch.no/connect/token";
let tokenCache = {};

async function token(scope, env) {
  const cache = tokenCache[scope];
  if (cache && cache.expires > Date.now() + 60000) return cache.value;

  const clientId = scope === "ais" ? env.BW_AIS_CLIENT_ID : env.BW_API_CLIENT_ID;
  const clientSecret = scope === "ais" ? env.BW_AIS_CLIENT_SECRET : env.BW_API_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error(`Missing ${scope.toUpperCase()} credentials`);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {"content-type":"application/x-www-form-urlencoded"},
    body
  });
  if (!r.ok) throw new Error(`Token request failed: ${r.status}`);
  const j = await r.json();
  tokenCache[scope] = {value:j.access_token, expires:Date.now() + (j.expires_in || 3600)*1000};
  return j.access_token;
}

const cors = {
  "access-control-allow-origin":"*",
  "access-control-allow-methods":"GET,OPTIONS",
  "access-control-allow-headers":"content-type"
};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json;charset=utf-8"}})}

async function latestAis(env) {
  const access = await token("ais", env);
  const r = await fetch("https://live.ais.barentswatch.no/v1/latest/combined", {
    headers:{authorization:`Bearer ${access}`}
  });
  if (!r.ok) throw new Error(`AIS request failed: ${r.status}`);
  return r.json();
}

/**
 * Forecast adapter placeholder.
 *
 * BarentsWatch has point forecast endpoints such as:
 *   /v1/waveforecastpoint/nearest/all
 *   /v1/windforecastpoint/nearest/all
 *   /v1/seacurrent/nearest/all
 *
 * Their precise query model should be wired here after choosing how densely
 * Marine Tools samples a route. Keeping this server-side avoids exposing API
 * credentials and lets the frontend stay static on GitHub Pages.
 */
async function forecastForRoute(url, env) {
  const raw = url.searchParams.get("route");
  const route = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(route) || !route.length) return [];

  // Safe placeholder result: no fabricated "live" values.
  // Replace with authenticated point-forecast requests before enabling in production.
  return route.map(p => ({
    lat:p.lat, lon:p.lon, hs:null, windKn:null, currentKn:null,
    source:"proxy-placeholder"
  }));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return json({status:"ok"});
      if (url.pathname === "/api/ais/latest") return json(await latestAis(env));
      if (url.pathname === "/api/forecast") return json(await forecastForRoute(url,env));
      return json({error:"Not found"},404);
    } catch (e) {
      return json({error:e.message},500);
    }
  }
};
