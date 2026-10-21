# Audience and actual tool use — 21 October 2026

## Scope
Analytics-only production change. Education PR #35 remains Draft and unmerged. Education instrumentation is also prepared in that preview; preview emits no production analytics. No emails or Access changes.

## New measurements
- Estimated browsers, visits, active browsers, successfully produced calculation results and returning browsers; current versus preceding equal period.
- Per-tool readable title and stable button ID, browsers opening visible cards, browsers producing results, attempts, results and explicit validation failures.
- Traffic sources: direct, search, LinkedIn, newsletter, teaching, internal and other referral. Only these coarse labels are transmitted. A teacher link may use `?utm_source=teaching`.
- Visits and browsers by hour/day; browser counts across buckets and source categories must not be added to infer unique people.
- Education pages, modules, discipline/subject filters, formula opens and presentation activation, ready for the separate Education release. One teacher showing a class is one browser, not a class-sized audience.
- Existing page usage, devices, engagement, search and live-data failures retained.

## Definitions and boundaries
New schema `usage-v1` starts at deployment; historical click events cannot reconstruct successful calculations or unique browsers. The existing click panel remains historical/legacy data and is labelled accordingly. No invented backfill.

A random UUID is stored locally per browser for 180 days from creation. A visit UUID expires after 30 minutes of inactivity, or when the browser tab session is discarded. No cross-device or cross-origin identity matching. Browser data clearing, blocked analytics, private browsing and multiple devices affect estimates. Returning means a later visit observed in that browser, not a verified returning person. Returning-browser KPI counts returning visits starting in the selected period. Active means a produced calculation result or an Education module selected. The application validator accepting a result is not independent mathematical certification.

Success is emitted from explicit result-producing code paths while a calculation action is in progress; invalid outcomes are separate from valid caution/alert styling. Fresh success must never be inferred from an old result still visible in the DOM. Direct table result renderers are instrumented too. No mathematical expressions changed.

## Collection controls
- Production host and Origin allowlists. QA Worker and `.pages.dev` remain isolated.
- Settings → Exclude this browser from analytics, for the owner's testing; must be enabled separately on each browser/device.
- Existing analytics opt-out, Do Not Track, and automated-browser exclusion apply to all frontend collectors.
- Settings/privacy explain random identifiers. No calculation inputs/results, vessel names, positions, email, raw referrer, search text, arbitrary campaign values or fingerprints in new events.
- Server accepts only UUID identifiers and explicit metadata fields; no secret payload passthrough.

## Query/rendering reliability
One shared dashboard HTTP request, 21 SQL queries including seven new parallel queries. All share the same absolute ten-second query deadline and period boundaries. Optional usage query failures are unavailable, not zero. Refresh clears stale audience data. Browser scripts are literal strings, safe under Wrangler helper injection; CI exercises the actual deployable bundle.

Cloudflare SQL reference checked: COUNT(DISTINCT) is supported for Workers Analytics Engine datasets (https://developers.cloudflare.com/analytics/sql-api/sql-reference/). Distinct browser counts are estimates if sampling or missing events affects observed IDs.

## Validation
Local Worker/DOM acceptance and real calculator outcome checks; preview isolation and release metadata checks. CI additionally tests Wrangler bundle plus Chromium, Firefox and WebKit, desktop/mobile/landscape, audience rendering, failures, range switching, real frontend valid/invalid calculations and analytics exclusion. All browser traffic is intercepted; fixture data are explicitly synthetic.

Authenticated account SQL/data ingestion and live dashboard cannot be certified from fixture tests. New numbers start accumulating only after deployment and visits from analytics-enabled browsers. Actual SQL binding/account configuration remains a live verification boundary.
