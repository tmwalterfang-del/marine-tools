# Analytics dashboard review — 21 October 2026

Isolated analytics update prepared from main. The user explicitly authorized publishing this dashboard update on 21 October. Education PR #35 is excluded. Tests use synthetic SQL data and never write analytics events.

## Confirmed findings and changes

- The main dashboard queried `/admin/api/analytics-v2`, while three extension panels queried `/admin/api/analytics`. The latter delegated to the original smaller summary rather than the v2 summary. One view consequently received different schemas and independently executed four full requests (44 SQL queries). The canonical endpoint now returns the full v2 summary plus the three extensions; four renderers share one validated browser request (14 queries).
- All extensions use the same current-period boundaries as the main summary. Range changes cancel the old browser request and ignore its late results. Refresh clears previous numbers and plots rather than showing an old period under a new heading.
- Individual SQL waits are bounded at six seconds with a shared ten-second request deadline. The browser has a twelve-second deadline. These stop waiting for unresponsive queries; the Analytics SQL binding itself does not support cancellation. Missing bindings, query errors, expired sessions/sign-in HTML, network errors and timeouts have distinct actionable messages. Only retryable binding failures receive the existing bounded retry.
- A failed optional query leaves other usage panels available, with an explicit partial-data message. Failed queries display unavailable values, not successful zero metrics. A scheduled check that actually failed is still displayed as a failed check; its numeric error count is not confused with a query error.
- The existing `calculation_completed` event is emitted from a calculation-button click handler, so its displayed label now says **Calculation clicks**. The offline counter displays an unmeasured value because the collector drops events while offline and has no later-upload queue. Returning visits are not unique people. P95 health is labelled as a recent sample (up to 5,000 events), not a complete-period percentile.
- Wide tables scroll within their panel on mobile. Preview-origin analytics isolation, Access requirements and the existing event collector are preserved. This change adds no new tracking.

## Verification

### Production packaging regression

The first release passed source-level fixtures but failed after Wrangler bundled it. Serializing the browser initializer with `Function.toString()` also serialized injected `__name` calls, whose helper only exists in the Worker bundle. The browser consequently threw `__name is not defined`; panel loaders then reported `MT_DASHBOARD_REQUEST is not a function`. This was reproduced against a real Wrangler 4.151.3 dry-run bundle.

The initializer is now an explicit browser-script literal, so bundling cannot insert Worker-only helper references into it. CI builds once with pinned Wrangler and runs both Worker/DOM acceptance and Chromium/Firefox/WebKit against that exact artifact. Transport initialization is checked explicitly. Authentication and the existing analytics collection are unchanged.

`tests/analytics-dashboard-20261021.mjs` exercises the actual Worker chain and DOM using a fake SQL binding: schema, query count, shared periods, authentication, preview isolation, missing bindings, SQL failures, real SQL timeout, bounded retry, failed/empty/partial states, four-renderer request sharing, accelerated browser HTTP timeout and stale-period races.

`tests/analytics-dashboard-browser-20261021.cjs` uses real Chromium, Firefox and WebKit with the same Worker-generated HTML and synthetic SQL results. It covers panel rendering, request sharing, four ranges, desktop/mobile/landscape widths, Access HTML/401 responses, network/SQL failure, partial data, empty data, recovery and period switching. All external requests are blocked. Screenshots are clearly labelled TEST FIXTURE.

Live data and account configuration were not verified: Google sign-in could not be completed. The user will check the live version after this isolated analytics release. Preview's admin endpoints intentionally remain disabled against the production analytics dataset. Browser fixture checks cannot verify the account's actual SQL entitlement, binding or Access policy.

## Recommended measurement priorities

| Priority | Measure | Decision supported |
|---|---|---|
| 1 | Valid calculations, validation failures and module opens, by stable tool/module ID | Which tools work, and where users get stuck |
| 1 | Successful report/scenario exports and successful scenario reopen | Whether users complete a useful workflow |
| 1 | Weather/AIS/route errors and response time, separated by source | What needs technical attention |
| 2 | Education module usage, presentation entry/exit and formula/filter usage | What helps teachers and students; Education pages currently lack this coverage |
| 2 | Searches with/without results and result opens, without storing search text | Which content or navigation is missing |
| 2 | Visible engaged time, sessions, device class and app version | Where to invest development and compatibility work |
| 3 | Optional subscription-interest clicks and completed enquiries | Whether paid reports, school licences or other offers attract interest |

Keep calculation inputs, results, vessel names/profiles, positions, raw search terms and email addresses out of the product-event payload. Any added collection should respect the existing analytics setting and Do Not Track. Do not use the counts as unique-user statistics. Implement successful-completion instrumentation at the calculation/export completion point rather than inferring it from button clicks. Keep preview/test activity separate from production, including any future offline queue.

## Manual release acceptance

After the isolated Worker release: sign into the private dashboard, verify 24h/7d/30d/90d and Refresh, confirm one analytics HTTP request per action, inspect the live binding/error status, and compare one selected time range against Cloudflare's own SQL results. Only the isolated analytics update is authorized; Education remains in preview.
