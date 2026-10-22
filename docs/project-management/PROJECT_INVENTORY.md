# Project inventory

Snapshot: 22 October 2026; main `6e10a5017428373079cdce26f0fb19175565bb20`, Education `df66bb27c923d9e25a30b344d5f27c38a8dc56ac`, Security `314e5bf7c7a18274c9579e4ba6dee84a3cbd1375`. Do not treat all branch contents as published.

## Source and runtime map

| Surface | Paths | Primary owner / reviewer |
| --- | --- | --- |
| Frontend shell | index.html; app.js; styles.css; sidebar-*.js/css; product-v860.js; ui-v861.js | 02 / 04,05 |
| Navigation and voyage | voyage-estimate-v861.js; voyage-planning-draft-v1.js; weather-map-v854.js; tests/navigation-smoke.mjs | 02 / 05 |
| API/analytics entry | worker/worker-v860-dashboard.js; worker/worker-v860-product.js; worker/worker-v858-dashboard.js; worker/worker-v857*.js; worker/worker-v856.js; worker/worker-v855.js; worker/worker.js | 02 / 03,07,08 |
| Usage collection | usage-analytics.js; analytics-v856.js; worker/usage-analytics.js | 08 defines metrics; 02 implements; 03 reviews privacy |
| Deployment/PWA | wrangler.jsonc; worker/wrangler.jsonc; sw.js; .github/workflows/; CNAME | 07 / 03,02 |
| Education Draft only | students/index.html; formulas*.js; calculators*.js; chapter-*-audit-20261020.js; *-equation-audit-20261020.js; symbol-*.js; source-review-20261020.js | 06 / independent 05 |
| Interactive Draft only | students/interactive.html/js; examples*; labs*; explorers*; cargo*; mollier*; teaching-view.js; study-export.js | 06 content, 02 implementation / 04,05 |
| Security Draft only | worker/security.js; worker/provider-security.js; worker/analytics-schema.js; tests/security-*; wrangler.security-test.jsonc; package.json/lock; _headers | 03 verification; 02 remediation; 07 account configuration |
| Existing governance | SECURITY.md; RELEASE_CHECKLIST.md; ACCESSIBILITY.md; BRAND.md; LICENSE; .github/pull_request_template.md | 01 / relevant domain owners |
| Marketing | marketing/linkedin-demo-pack.md; BRAND.md; permitted public assets | 10 / 01,04 |

No AGENTS.md was present in the three recursively inspected trees. No central project-management directory was present on main. This package adds that directory rather than replacing existing security, QA, licensing or release records.

## Pull requests

All 39 PR records returned by repository-scoped search are listed below (number 5 is not a PR in these results). Metadata was inspected; older patches were not all re-reviewed.

| PR | Title | Status | Head branch |
| --- | --- | --- | --- |
| [40](https://github.com/tmwalterfang-del/marine-tools/pull/40) | Security hardening: verified admin JWTs, API limits and consent-based analytics | OPEN/DRAFT | security/full-audit-hardening-20261022 |
| [39](https://github.com/tmwalterfang-del/marine-tools/pull/39) | Cover dedicated voyage calculators in usage analytics | MERGED | fix/analytics-voyage-coverage-20261021 |
| [38](https://github.com/tmwalterfang-del/marine-tools/pull/38) | Track browser reach, successful calculations and tool adoption | MERGED | feature/analytics-usage-insights-20261021 |
| [37](https://github.com/tmwalterfang-del/marine-tools/pull/37) | Fix analytics initialization after Wrangler bundling | MERGED | fix/analytics-bundled-runtime-20261021 |
| [36](https://github.com/tmwalterfang-del/marine-tools/pull/36) | Fix private analytics loading, timeouts and misleading empty metrics | MERGED | fix/analytics-dashboard-20261021 |
| [35](https://github.com/tmwalterfang-del/marine-tools/pull/35) | Education: formula library, interactive teaching views and expression audit | OPEN/DRAFT | feature/for-students-formula-library-20261019 |
| [34](https://github.com/tmwalterfang-del/marine-tools/pull/34) | Release v8.7.0: Voyage Planning Lab and reliability fixes | MERGED | feature/qa-integrated-preview-20261015 |
| [33](https://github.com/tmwalterfang-del/marine-tools/pull/33) | QA: repair calculation, data, responsive and preview findings | CLOSED/UNMERGED | fix/qa-audit-20261015 |
| [32](https://github.com/tmwalterfang-del/marine-tools/pull/32) | Build isolated permanent frontend preview | CLOSED/UNMERGED | feature/frontend-preview-foundation |
| [31](https://github.com/tmwalterfang-del/marine-tools/pull/31) | Draft connected voyage-planning tools | MERGED | feature/voyage-planning-drafts |
| [30](https://github.com/tmwalterfang-del/marine-tools/pull/30) | Hotfix sidebar navigation and publish v8.6.1 | MERGED | hotfix-sidebar-release-v861 |
| [29](https://github.com/tmwalterfang-del/marine-tools/pull/29) | Implement Voyage Estimate from clean production base | MERGED | feature/voyage-estimate-production |
| [28](https://github.com/tmwalterfang-del/marine-tools/pull/28) | Add Marine Tools professionals landing page | MERGED | feature/professionals-landing-page |
| [27](https://github.com/tmwalterfang-del/marine-tools/pull/27) | Add Marine Tools education landing page | MERGED | feature/education-landing-page |
| [26](https://github.com/tmwalterfang-del/marine-tools/pull/26) | Fix Vessel Profile v2 consistency and carrier deletion guard | MERGED | fix/v860-profile-consistency |
| [25](https://github.com/tmwalterfang-del/marine-tools/pull/25) | Bridge Dark, unified icons and What's new UX | MERGED | feature/bridge-icons-whats-new |
| [24](https://github.com/tmwalterfang-del/marine-tools/pull/24) | Fix sidebar current-page state and Analytics v3 identity | MERGED | fix/sidebar-active-worker-identity |
| [23](https://github.com/tmwalterfang-del/marine-tools/pull/23) | v8.6 hotfix: active sidebar state and release worker identity | CLOSED/UNMERGED | fix/sidebar-active-v860-release-worker |
| [22](https://github.com/tmwalterfang-del/marine-tools/pull/22) | v8.6.0: Fuel & Energy workflows, Vessel Profile 2.0 and Analytics v3 | MERGED | feature/v8-6-energy-workflows |
| [21](https://github.com/tmwalterfang-del/marine-tools/pull/21) | v8.5.8: replace home icons with coherent line set | MERGED | fix/home-icons-v8-5-8 |
| [20](https://github.com/tmwalterfang-del/marine-tools/pull/20) | v8.5.8: balance home shortcuts | MERGED | fix/home-shortcut-layout-v8-5-8 |
| [19](https://github.com/tmwalterfang-del/marine-tools/pull/19) | v8.5.8: refresh Common jobs cards | MERGED | fix/common-jobs-icons-v8-5-8 |
| [18](https://github.com/tmwalterfang-del/marine-tools/pull/18) | v8.5.8: roomier sidebar with quick access | MERGED | feature/sidebar-quick-access-v8-5-8 |
| [17](https://github.com/tmwalterfang-del/marine-tools/pull/17) | Fix sidebar Project & contact panel placement | MERGED | fix/sidebar-project-panel-v8-5-8 |
| [16](https://github.com/tmwalterfang-del/marine-tools/pull/16) | v8.5.8: clearer analytics + compact sidebar | MERGED | feature/analytics-context-v8-5-8 |
| [15](https://github.com/tmwalterfang-del/marine-tools/pull/15) | fix: stop repeated update banner and keep Project & contact visible | MERGED | ui/update-banner-project-nav-fix |
| [14](https://github.com/tmwalterfang-del/marine-tools/pull/14) | ui: simplify analytics on mobile and restore Buy Me a Coffee widget | MERGED | ui/analytics-mobile-bmc-cleanup |
| [13](https://github.com/tmwalterfang-del/marine-tools/pull/13) | fix: make production smoke independent of Cloudflare WAF | MERGED | fix/deploy-status-only-smoke-v8-5-7 |
| [12](https://github.com/tmwalterfang-del/marine-tools/pull/12) | fix: WAF-safe production smoke checks | MERGED | fix/cloudflare-runtime-smoke-v8-5-7 |
| [11](https://github.com/tmwalterfang-del/marine-tools/pull/11) | fix: production smoke checks through Cloudflare | MERGED | fix/production-smoke-headers-v8-5-7 |
| [10](https://github.com/tmwalterfang-del/marine-tools/pull/10) | v8.5.7: release hardening, smoke tests and technical health | MERGED | feature/release-hardening-v8-5-7 |
| [9](https://github.com/tmwalterfang-del/marine-tools/pull/9) | v8.5.6: Analytics Dashboard v2 | MERGED | feature/analytics-dashboard-v2-v8-5-6 |
| [8](https://github.com/tmwalterfang-del/marine-tools/pull/8) | v8.5.5: DDM consistency + Weather/AIS cleanup | MERGED | cleanup/ddm-weather-ui-v8-5-5 |
| [7](https://github.com/tmwalterfang-del/marine-tools/pull/7) | Fix Weather map production loading | MERGED | fix/weather-map-production-v8-5-4 |
| [6](https://github.com/tmwalterfang-del/marine-tools/pull/6) | v8.5.4: free global waves + precise navigation coordinates | MERGED | feature/free-global-wave-ukc-v8-5-4 |
| [4](https://github.com/tmwalterfang-del/marine-tools/pull/4) | v8.5.3: speed up inland Weather | MERGED | perf/weather-inland-fast-v8-5-3 |
| [3](https://github.com/tmwalterfang-del/marine-tools/pull/3) | v8.5.3: land-aware Weather, no current, Beaufort units | MERGED | feature/weather-safety-beaufort-v8-5-3 |
| [2](https://github.com/tmwalterfang-del/marine-tools/pull/2) | v8.5.3 phase 1: mobile-safe Weather map | MERGED | feature/weather-map-mobile-safe-v8-5-3 |
| [1](https://github.com/tmwalterfang-del/marine-tools/pull/1) | v8.5.2: global weather waves, map selection and open AIS | MERGED | feature/global-weather-ais-v8-5-2 |

## Branch disposition

- `main`: production source lineage. Do not write directly.
- `feature/for-students-formula-library-20261019`: active #35, preserve.
- `security/full-audit-hardening-20261022`: active #40, preserve.
- `fix/analytics-dashboard-20261021`, `fix/analytics-bundled-runtime-20261021`, `feature/analytics-usage-insights-20261021`, `fix/analytics-voyage-coverage-20261021`: PRs merged; retain history. Existence is not pending development. Owner may consider later housekeeping; nothing is deleted by this package.
- `docs/project-organization-20261022`: documentation-only package prepared from main. It is not a feature or infrastructure release.

## Dependency and overlap control

The current #35 and #40 changed-file lists intersect at `index.html` and `sw.js`. Their behavioral dependencies are broader: analytics consent/schema, preview resource isolation, Education collector loading order and cache behavior. Treat a future combined integration as a separate task with explicit file ownership, SHA-pinned regression and owner release review. Mergeability metadata is only a snapshot.

README currently lists dynamic UKC among tools while historical release work retired UKC from visible runtime. Product/QA must reconcile the current UI before claiming availability or reintroducing it. No feature was removed or restored in this review.

## Private-source inventory boundary

Source scans, school materials, business records and detailed source filenames remain outside this public documentation. A private companion file in the downloadable package points to relevant owner-held references. Historical manifests are evidence of previous inventory, not confirmation that every attachment is accessible or redistributable now.
