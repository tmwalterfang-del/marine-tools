# Permanent frontend preview — isolated build foundation

Updated 2026-10-15. Implementation on `feature/frontend-preview-foundation`, draft PR #32. **No Cloudflare project/deployment has been created or changed by this work. No merge authorized.**

## Architecture and audited behavior

Production frontend is static HTML/JS/CSS at repository root. Production API is a separate Worker (`worker/worker-v860-dashboard.js` in root `wrangler.jsonc`). Root Wrangler config must not be used to deploy the frontend.

Frontend audit found two analytics senders (`app.js`, `analytics-v856.js`), two service-worker registration paths (`app.js`, `release-v860.js`), and two automatic Buy Me a Coffee widget loaders (`app.js`, `support-widget-v857.js`). Product analytics delegates to the analytics-v856 API. Worker wrapper chain was inspected through the product, dashboard, runtime, AIS and base workers.

- Worker analytics ingestion in `worker-v860-product.js`, `worker-v856.js` and `worker.js` allows only `https://marinetools.app` and `https://www.marinetools.app` origins before writing data points.
- AIS origin validation in `worker-v855.js` also allows only those production origins. A Pages preview should expect AIS to be unavailable. Do not broaden the production allowlist as part of preview setup.
- Scheduled runtime smoke writes in `worker-v857-runtime.js` belong to the existing Worker cron and are independent of this frontend build.
- Weather/forecast CORS and provider compatibility still require a deployed-origin test. Source inspection is not live verification.

## Implemented build

Run `node scripts/build-frontend-preview.mjs` with Node 22 or later. It produces `.preview-dist/` and never deploys anything. No npm install is needed to build.

The build copies root public frontend files and `assets/`, `education/`, `professionals/`; excludes Workers, Wrangler config, Git metadata, tests and docs. It does not copy the production sitemap. It fails if any expected analytics/SW/widget patch no longer matches exactly once, requiring a fresh audit when source changes.

Only the generated output changes:

1. Visible English preview banner across all four HTML pages. Banner height adjusts the fixed sidebar and sticky topbar.
2. Static `noindex,nofollow,noarchive` metadata, preview `robots.txt`, and Pages `_headers` with `X-Robots-Tag`, `Cache-Control: no-store` and environment identification. Production canonical/structured-data/manifest links are removed from output.
3. Both analytics implementations are disabled; the optional product tracking API remains a harmless no-op. Settings cannot override preview isolation.
4. Early fetch guard blocks writes and unknown production API endpoints. Only GET `/api/health`, `/api/release`, `/api/auth/status`, `/api/weather`, `/api/forecast`, `/api/ais/latest` are allowed. URL strings, URL objects and Request objects are covered. These GET requests still reach production and its ordinary request logs/provider usage; this is **not full infrastructure isolation**.
5. Both SW registration paths are disabled; any old preview registrations and Marine Tools caches on the current origin are cleaned up. `sw.js` is replaced with an unregistering worker. The production PWA is unchanged because the preview uses a different origin. Offline/PWA installation is deliberately not covered by this preview and needs a separate test environment.
6. Automatic donation widgets are disabled in preview. User-initiated external links remain available; do not submit test messages/payments/forms to real external services.

`index.html`, `app.js`, `analytics-v856.js`, `release-v860.js`, `sw.js`, other production source assets and Worker configurations remain unchanged in the repository. All transformations happen in the generated directory. These safeguards are not authentication; add Cloudflare Access separately if private preview is desired.

## Dedicated Cloudflare Pages setup — user action pending

First identify the existing project serving `marinetools.app`, without editing it. Create a **separate** Pages project using Git integration with `tmwalterfang-del/marine-tools`.

| Setting | Value |
| --- | --- |
| Suggested project | `marine-tools-frontend-preview` (availability unverified) |
| Framework preset | None |
| Initial production branch of this separate preview project | `feature/frontend-preview-foundation` |
| Root | Repository root |
| Build command | `node scripts/build-frontend-preview.mjs` |
| Build output directory | `.preview-dist` |
| Node version | 22 or later |
| Custom domains | None |
| Additional preview branches | Only branches containing this preview build foundation |

**This supersedes the original `exit 0` / root output / main-baseline proposal.** Main and PR #31 do not yet contain the build script or safeguards. Do not deploy their raw root as an initial preview. Cloudflare's term “production branch” here refers only to the new, separate preview project and has no relationship to the existing production domain.

No API tokens or passwords need to be shared. The actual `*.pages.dev` address, project name and successful build are unverified. Record them below after setup. No DNS, domain attachment, Worker deployment, existing Pages settings or Access rules have been changed.

## Validation and remaining gates

Local checks passed on 2026-10-15:

- Preview build and syntax checks for every generated root JS file.
- `node tests/frontend-preview-guards.mjs`: all HTML has preview metadata/banner; both analytics/SW paths disabled; output filtering; blocked production API write methods, unknown endpoints and Request/URL variants; allowed GET preservation.
- `node tests/navigation-smoke.mjs`: existing navigation calculations.

`tests/frontend-preview-smoke.mjs` implements Chromium checks at 390, 820 and 1440 px for Dark Maritime and Bridge Dark, navigation, banner spacing, local assets, no analytics/write requests, no SW registrations, plus the education/professionals pages. External services are mocked; it does not verify live CORS or provider data. Local execution was blocked because no Chromium was installed and its download failed. **No visual/browser pass is claimed.**

GitHub workflow `Frontend preview checks` runs the isolated build, guard checks, navigation checks and browser checks on PRs targeting main, with read-only permissions and no deployment step. Browser QA requires Playwright 1.62.1 and `npx playwright install --with-deps chromium`; CI results must be inspected before claiming it passed.

After the first real Pages deployment:

- Verify root and assets, HTTP `X-Robots-Tag`, no unwanted production redirects, branch URL and actual deployed commit.
- Inspect browser requests: no product analytics POSTs, no production mutations, allowed live GETs only; confirm weather CORS and expected AIS limitation.
- Review visual desktop/tablet/mobile behavior, calculations, copy/print and local persistence. No full offline/PWA claim.
- Integrate the foundation into a separate PR #31 test branch without merging either PR into main. Build the Voyage Planning Lab there, verify all five prototypes, and record its actual branch URL.
- Any fixes to PR #31 go through a feature branch/PR. Never merge #31 or #32 without explicit user approval.

## Deployment record

- Existing production Pages project: **pending user confirmation**.
- Dedicated preview project: **not created/verified**.
- First Pages build, URL and deployed SHA: **pending**.
- PR #31 preview URL and browser QA: **pending**.

Rollback for a future preview: stop builds or remove only the new preview project after explicit authorization. Never touch production DNS, domains or the production Worker. The repository changes alone do not activate hosting.

## References

- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/pages/configuration/branch-build-controls/
