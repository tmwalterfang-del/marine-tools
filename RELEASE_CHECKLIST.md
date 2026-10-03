# MarineTools release checklist

Use this checklist for every production release. Safety or bug-fix releases may skip product-growth review, but not functional QA.

## Before merge

- [ ] Release version is updated in the shared release metadata.
- [ ] `wrangler.jsonc` and `worker/wrangler.jsonc` point to the intended Worker entry.
- [ ] Cloudflare preview builds and deploys successfully.
- [ ] Weather works for an inland position.
- [ ] Weather works in a Norwegian sea area.
- [ ] Global Weather returns wave data through the configured global fallback.
- [ ] AIS endpoint responds in Norway and outside BarentsWatch coverage.
- [ ] Navigation DDM input/output remains precise and internally consistent.
- [ ] No route coordinates, Weather coordinates, vessel profile values, calculation inputs or search text are added to analytics.

## Mobile QA

Test both portrait and landscape on a phone-sized viewport.

- [ ] Sidebar opens, closes and does not cover active content after navigation.
- [ ] Home search and global search remain usable.
- [ ] Weather: `Show map`, `Use my position`, DDM fields and `Load forecast` are visible and usable.
- [ ] Weather map can be opened, tapped and dragged without freezing the page.
- [ ] Weather tables fit or scroll without clipping controls.
- [ ] Navigation DDM editors fit on screen and do not overlap.
- [ ] Bearing / distance / destination output is readable.
- [ ] Coordinate toolbox output is readable.
- [ ] Route Intelligence map and waypoint DDM list remain usable.
- [ ] Update-available banner fits without covering essential controls.
- [ ] Changelog dialog opens, scrolls and closes.

## Analytics-led product review

Before adding a non-safety feature, review the latest 7-day and 30-day dashboard periods.

- [ ] Top tools/categories reviewed.
- [ ] Search no-result rate reviewed for unmet demand.
- [ ] Feature usage reviewed before expanding or removing a feature.
- [ ] Weather/AIS source mix reviewed before changing data providers.
- [ ] Technical health reviewed: success rate, average latency, p95 latency and latest errors.
- [ ] Version adoption checked to ensure users are moving onto the current release.

## After merge

The `Production smoke test` GitHub Action must pass after production deployment.

- [ ] `/api/release` reports the new version.
- [ ] `/api/health` reports healthy status and the new release.
- [ ] Frontend reports the new application version.
- [ ] Static JavaScript syntax checks pass.
- [ ] Navigation math smoke checks pass.
- [ ] Weather inland / Norway sea / global wave checks pass.
- [ ] AIS Norway / global endpoint checks pass.
- [ ] Weather map production asset is present.

If a production smoke test fails, treat the release as incomplete until the failure is understood and resolved.
