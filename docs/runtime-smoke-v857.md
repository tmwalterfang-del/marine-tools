# MarineTools v8.5.7 runtime smoke strategy

`api.marinetools.app` is protected by Cloudflare's managed challenge. GitHub-hosted Actions runners can be challenged before the Worker executes, so direct `curl` probes from GitHub are not a reliable production runtime signal. The same rule is applied to the public frontend so CI does not depend on whether an automated runner is challenged at the edge.

The release checks are therefore split into two layers:

1. GitHub Actions verifies JavaScript syntax and Navigation math, waits for the Cloudflare Worker deployment check and the GitHub Pages deployment check for the exact commit, and validates the release metadata/assets from the checked-out production source.
2. The Worker runs internal runtime smoke checks from Cloudflare itself every 15 minutes. The health endpoint is checked every run; Weather inland, Norwegian sea Weather, NOAA global wave fallback, AIS Norway and AIS global are checked hourly. These checks call the Worker implementation directly, so they test the deployed application logic and upstream providers without crossing the public WAF.

Results are written to the existing anonymous Analytics Engine dataset as `runtime_smoke_ok` / `runtime_smoke_error` and surfaced in the private analytics dashboard. No route coordinates, user coordinates, user identifiers, search text, vessel profile or calculation inputs are recorded.
