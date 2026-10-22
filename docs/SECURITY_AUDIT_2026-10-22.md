# Marine Tools security audit and hardening — 22 October 2026

Status: implementation on a separate security branch; deployment is NOT approved. Main and the separate Education preview have not been changed. This report records source and isolated verification, not a certification of production security or GDPR compliance.

## Scope and evidence boundary

Baseline: `6e10a5017428373079cdce26f0fb19175565bb20`. Reviewed the configured Worker entry point and its full imported chain, analytics collectors/queries/dashboard, frontend rendering/import/export, public provider integrations, both Wrangler configurations, security policy and GitHub workflows. Production websites: marinetools.app and api.marinetools.app.

Cloudflare settings could not be read: Google required device verification; an authorized direct Cloudflare login returned `API Request Failed (403)`. This does not establish an incorrect password or a bot block. No security settings were changed. Four low-volume HEAD observations returned an intermediary Envoy 403, so they cannot establish the actual site's headers or endpoint protection. No forged-token, provider-cost, load or bulk analytics tests were sent to production.

The GitHub repository is public. All credentials used in regression tests are ephemeral synthetic RSA keys, UUIDs and example.invalid identities. No production JWT, secret or user record is included in this report or tests.

## Findings

Severity describes potential impact and preconditions; live exposure is stated separately.

| ID | Severity | Finding and affected surface | Evidence | Change / remaining condition |
|---|---|---|---|---|
| S01 | High | Admin authentication trusted the presence of `cf-access-jwt-assertion`; all `/admin/*`, including `/admin/api/analytics` and v2 | Baseline isolated Worker accepted a synthetic non-JWT assertion: HTTP 200 and 21 synthetic SQL queries. Confirmed source flaw; actual external exploitability depends on Access routing/policy. | New entry-point gateway verifies RS256 signature using fixed team JWKS, issuer, audience, subject, iat, exp, nbf and token age. Spoofed identity header is replaced with the signed email. Optional exact email allowlist. Missing config fails closed. Edge Access still needs verification. |
| S02 | High | `/api/barentswatch/probe` could invoke credentialed diagnostics without admin authentication | Baseline synthetic request without login returned 200 and made two mocked upstream calls. Confirmed code behavior; no live probe performed. | Same cryptographic admin gate, method policy and admin rate limit now protect it. |
| S03 | Medium | Public API abuse and unbounded/invalid inputs; `/api/weather`, `/api/forecast`, `/api/ais/latest`, `/api/auth/status` | No configured request-rate binding; missing numeric parameters could coerce to zero; route array/ranges were not fully validated before provider work. | Dedicated rate binding, finite/range/ordered-bound checks, duplicate query rejection, 1–1000 route positions, 49,152-character URL ceiling and method policy. Auth-status results cached briefly. Cloudflare account-wide WAF/spend limits still required for distributed abuse. |
| S04 | Medium | Analytics ingestion integrity and resource limits, `/api/analytics/event` | Body previously read before effective byte bounds; arbitrary legacy dimensions accepted. Origin can be forged by non-browser clients. | Streaming 4 KiB byte cap, JSON/type checks, fixed events/pages/static labels, safe tool IDs, duration limits, separate rate limiter, versioned consent before storage. Existing UUID and metadata allowlist retained. Origin/rate checks cannot prove a human or prevent distributed fabrication. |
| S05 | Medium | Optional persistent analytics identifiers collected without prior affirmative choice | Browser ID persisted up to 180 days; visit ID 30-minute inactivity. Pseudonymous identifiers are not anonymous persons. | Default off; equally available Allow/Decline; versioned local consent; withdrawal stops collection and clears analytics IDs while retaining operational data; imported backup cannot grant consent. Server refuses collection without consent version. Controller/DPA/transfers/erasure processes still require owner/legal review. |
| S06 | Medium | Stored markup injection through local/imported profile fields and identifiers; `app.js`, `product-v860.js` | Unsafe interpolation in attributes and nominal numeric fields. A malicious backup is a required entry path; this is not a demonstrated remote unauthenticated compromise. | Escape identifiers, profile values, units and navigation attributes. DOM regression renders malicious values inertly. Backup maximum 10 MB. CSV export prefixes formula-like string cells. Broader schema validation and eliminating HTML string rendering remain useful follow-up. |
| S07 | Medium | Upstream response/resource exhaustion, redirects, raw provider errors; base Worker and v855/runtime | Unbounded caches and reads; no common bounded response/deadline policy. Fixed upstream URLs, not a confirmed arbitrary-URL SSRF. | Fixed HTTPS host allowlist, redirect rejection, six-second fetch deadline and five-second bounded body reads, response byte caps (token 64 KiB, AIS 16 MiB, others 4 MiB), bounded caches, public error redaction and coarse scheduled error records. Token cache now checks credentials first and keys by credential configuration to prevent preview reusing cached production tokens. NOAA fan-out and total distributed cost remain monitoring concerns. |
| S08 | Medium | Preview inherited production provider secrets in runtime environment | Preview previously stripped analytics but retained provider credentials. Both config files use keep_vars; actual inherited account values not accessible. | Preview runtime removes Analytics/SQL and BarentsWatch/Pelyr credentials; admin/analytics denied before delegation. Unknown hosts denied. Separate preview Worker/resources and branch deployment controls still must be verified in Cloudflare. Runtime stripping is defense in depth, not resource isolation by itself. |
| S09 | Medium | Third-party script trust and incomplete frontend CSP | Automatic support widget and runtime Leaflet CDN scripts execute in the app's realm; Voyage Estimate still imports pinned remote searoute code. No verified production CSP/header observation. | Support becomes an ordinary external link; Leaflet 1.9.4 vendored with license; PWA cache refreshed. Admin HTML gets per-response nonce CSP and frame denial. `_headers` adds Pages-compatible baseline policy. Full frontend script CSP and vendoring the route engine remain open; inline handlers/dynamic imports need a measured compatibility migration. GitHub Pages does not apply `_headers`. |
| S10 | Low | Dependency/deployment hygiene | No root lockfile; Actions referenced floating major tags; no dedicated security regression suite. | Locked jose dependency, npm audit, pinned Actions commit SHAs, read-only CI permissions, Dependabot, dedicated security tests and a route/binding-free test build config. Actual repository protection, workflow permissions, deployment credentials and Cloudflare build settings remain unverified. |

## Changed implementation

- `worker/security.js`: centralized entry gate, authentication, CORS, byte/schema validation, rate limiting and response headers.
- `worker/provider-security.js`, `worker/worker.js`, `worker/worker-v855.js`, `worker/worker-v857-runtime.js`: outbound policy, bounded storage and error minimization.
- `worker/worker-v860-dashboard.js`: gateway wrapping the entire configured Worker chain and preview secret stripping. Lower historical handlers are not safe independent deployment entry points; only this gateway-wrapped entry is supported.
- `worker/analytics-schema.js`, `worker/analytics-catalog.js`, `scripts/build-analytics-catalog.mjs`: static metadata restrictions and reproducible catalog.
- `usage-analytics.js`, `analytics-v856.js`, `app.js`, `product-v860.js`: consent, withdrawal, import/export/rendering hardening and preserved analytics outcomes.
- `support-widget-v857.js`, `weather-map-v854.js`, `vendor/leaflet/`, `styles.css`, `index.html`, `sw.js`, `_headers`: third-party reduction, consent UI, caching and header support.
- Root/Worker Wrangler rate bindings, isolated build config, locked dependency, CI workflows, Dependabot and security policy.

No calculation formulas or operational safety limits were intentionally changed. Public visitors continue to use tools without login. Analytics now measures consenting browsers only: lower counts are expected and must not be presented as total visitors or unique people.

## Verification

All provider, SQL and authentication fixtures are isolated; unexpected external calls fail. Tests do not use a magic authentication bypass in application code: admin fixtures sign real ephemeral RSA tokens and serve a mocked JWKS.

| Check | Result |
|---|---|
| Baseline admin header verification reproduction | Confirmed locally: 200 / 21 synthetic queries |
| Baseline unauthenticated diagnostics reproduction | Confirmed locally: 200 / 2 mocked upstream requests |
| Security gateway/provider/schema regression | 69 checks passed locally |
| Consent, withdrawal, imported markup, backup consent, CSV DOM regression | 11 checks passed locally |
| Existing analytics dashboard acceptance | 32 checks passed locally, including actual Wrangler bundle |
| Collector and real calculator validation/outcome acceptance | 85 checks passed locally, including schema compatibility |
| Preview isolation | 30 assertions passed locally |
| Release metadata | 18 assertions passed locally |
| Navigation calculation smoke | Passed locally |
| Wrangler build | Dry-run successful; no deployment performed |
| npm production dependency audit | Zero reported vulnerabilities in locked root dependency at audit time; not proof against unknown vulnerabilities or all remotely imported code |
| Chromium / Firefox / WebKit | Passed in CI for Chromium, Firefox and WebKit against synthetic SQL and blocked external traffic, including actual admin nonce CSP. Tested dashboard viewports: 390×844, 844×390, 1440×900. Local engine download was unavailable; results come from GitHub runners. |

Coverage includes missing/forged/expired/incorrect issuer or audience tokens, future claims, unknown key, wrong subject, signed identity substitution, email policy, preview restrictions, invalid coordinates/routes, rate rejection, missing protection fail-closed, CORS, nonce CSP, oversized/malformed/unconsented events and provider constraints. It does not prove every security property, upstream provider behavior or live account setting.

CI evidence for implementation commit `252c4b1c4092734252e6d6c2b51b674e307837ec`:
- Security regression: https://github.com/tmwalterfang-del/marine-tools/actions/runs/39732888510
- Worker integration and all three browser engines: https://github.com/tmwalterfang-del/marine-tools/actions/runs/39732888471
- Draft review: https://github.com/tmwalterfang-del/marine-tools/pull/40

## Analytics privacy and data integrity

Operational inputs, vessel names, coordinates, raw search text, raw referrers and email addresses are not part of the analytics storage allowlist. Coarse source and static tool labels are permitted. Random browser/visit identifiers are pseudonymous; a shared classroom browser is one browser, and multiple devices are multiple observations.

Cloudflare documents three-month Analytics Engine retention. Verify the actual account dataset, log products, exports and any additional copies before describing an organization-wide retention policy. Browser ID lifetime and server event retention are separate. Withdrawal removes local IDs and prevents future submissions; it does not automatically erase stored events. Do not promise per-person deletion before verifying the provider's supported process and how a requester can be identified without collecting additional unnecessary data.

Remaining owner work: controller contact and processing record, documented lawful basis and consent evidence policy, Cloudflare DPA/subprocessors and transfer safeguards, provider/log retention, a rights-request/erasure procedure, and assessment of analytics previously collected without this choice. No historical dataset was deleted or migrated. This audit is not a legal compliance certification.

SQL uses fixed query structure and bound period parameters. No source-confirmed user-controlled arbitrary SQL was identified in the reviewed paths. Public analytics is inherently susceptible to fabricated allowed events; these counts must not support billing, entitlement or safety decisions without stronger integrity controls.

## Deployment gates and prioritized owner actions

Do not deploy until these are reviewed and explicitly approved. Missing new variables or rate bindings intentionally causes protected functionality to return 503.

1. **P0 — Access configuration/read access:** inspect the exact Access application covering `api.marinetools.app/admin/*` and `/api/barentswatch/probe`. Confirm no Bypass/Everyone policy, only intended identities, expected session duration, all alternate routes, and audience. Configure `ACCESS_TEAM_DOMAIN` as the exact `https://<team>.cloudflareaccess.com` issuer and `ACCESS_AUD` as that application's AUD. If probe uses a separate Access application, align the routing/application audience before rollout. Optionally set `ADMIN_EMAIL_ALLOWLIST` to the owner's exact verified identity. Do not use an empty or permissive fallback. Consider Worker “Protect with Access” as additional protection, while preserving public API availability.
2. **P0 — Rate bindings and isolated rehearsal:** verify namespace IDs are dedicated/available, then provision proposed PUBLIC_API_LIMITER (120/60s), ANALYTICS_LIMITER (600/60s), ADMIN_LIMITER (30/60s). These are starting limits, not a measured optimum. Rehearse with separate datasets/secrets and expected classroom/NAT traffic. Confirm 429/503 behavior and valid owner access before production approval.
3. **P0 — Deployment isolation:** verify Cloudflare git production branch is exclusively main, preview has separate Worker identity/bindings/provider credentials or no credentials, no production cron, Access-protected preview, workers.dev/preview URLs disabled where intended. keep_vars is not evidence of separation. Do not attach production secrets to a test branch. Verify Pages public hosting vs the separate private Education preview. A Draft PR may trigger CI/preview builds; it must not deploy production.
4. **P1 — Edge abuse and headers:** inspect existing WAF/rate/bot rules, add cost-aware controls and spending alerts with approval, verify Cloudflare overwrites client-IP header, set conservative timeouts. Worker rate limits are per-location/eventually consistent, not strict global quotas. Apply HSTS/nosniff/referrer/CSP/frame policy at the actual production hosting layer. `_headers` alone will not configure GitHub Pages. Keep education iframe needs in mind.
5. **P1 — Privacy/account review:** complete the privacy actions above; inspect Workers logs for token/header/query/body leakage and constrain access/retention. Keep logs to endpoint/status/provider category; avoid raw routes, inputs, Authorization or JWTs. No live retention or deletion changes have been made.
6. **P1 — GitHub controls:** require passing security + browser checks and review before merging main, least-privilege deployment token, protected production environment and manual deployment approval. Verify secret scanning/push protection and dependency alerts. A scan of reachable git diff history found zero matches for high-confidence private-key, GitHub-token and AWS-key patterns. This is not a guarantee about other secret formats, provider dashboards, unreachable history or revoked credentials.
7. **P2 — Follow-up implementation:** migrate remaining inline handlers to permit a strict frontend script CSP; vendor/review searoute and its transitive assets, test upstream field/schema drift, measure per-request fan-out/concurrency and add global cost budgets if justified. Preserve calculator UX and teacher presentation behavior while doing so.

## Rollout and rollback after approval

Keep this PR Draft until infrastructure gates, CI and a private staging rehearsal pass. Build with `npm ci --ignore-scripts`; verify the configured entry remains `worker/worker-v860-dashboard.js`. Inspect signed owner identity and denied unauthenticated access in staging, exercise a valid weather/AIS response with authorized staging credentials, withdraw/decline consent and confirm no events reach a staging dataset, and check production data is untouched. Approve frontend and Worker together so consent versions and validation agree. Existing cached clients lacking the consent marker will not record analytics until refreshed; this is intentional.

An approved deployment should have a short monitoring window for 401/403/429/503 rates and provider cost. Roll back to a reviewed artifact if needed, retaining edge Access protections; do not re-enable unauthenticated administration as a recovery shortcut.

## Primary references reviewed

- Cloudflare JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- Cloudflare application token claims: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/
- Cloudflare Worker rate bindings and consistency: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Analytics Engine limits/retention: https://developers.cloudflare.com/analytics/analytics-engine/limits/
- Datatilsynet on the Norwegian cookie/similar-technology rules effective 1 January 2025: https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2024/nye-cookie-regler-fra-1.-januar/
