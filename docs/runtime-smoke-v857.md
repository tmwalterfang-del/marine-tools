# MarineTools v8.5.7 runtime smoke strategy

`api.marinetools.app` is protected by Cloudflare's managed challenge. GitHub-hosted Actions runners can be challenged before the Worker executes, so direct `curl` probes from GitHub are not a reliable production runtime signal.

The release checks are therefore split into two layers:

1. GitHub Actions verifies JavaScript syntax, Navigation math, the Cloudflare Worker deployment check for the exact commit, the live GitHub Pages frontend version, and required production assets.
2. The Worker runs internal runtime smoke checks from Cloudflare itself every 15 minutes. The health endpoint is checked every run; Weather inland, Norwegian sea Weather, NOAA global wave fallback, AIS Norway and AIS global are checked hourly. These checks call the Worker implementation directly, so they test the deployed application logic and upstream providers without crossing the public WAF.

Results are written to the existing anonymous Analytics Engine dataset as `runtime_smoke_ok` / `runtime_smoke_error` and surfaced in the private analytics dashboard. No route coordinates, user coordinates, user identifiers, search text, vessel profile or calculation inputs are recorded.
