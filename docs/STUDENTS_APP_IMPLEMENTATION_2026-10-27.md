# Education sessions, diagram controls and app foundation

All 15 interactive Education modules now save raw local drafts, including
unfinished inputs. Invalid input remains marked and cannot be exported as a
valid calculation. Cargo drafts preserve operation rows; Mollier preserves
validated A/B/process state and separately restores unfinished controls.
Autosave can be disabled and study drafts cleared. Browser/device storage is
local, can be unavailable or evicted, and does not replace JSON export or
provide account synchronisation.

SVG diagrams have keyboard/button zoom, opt-in pointer pan/pinch and reset.
Page scrolling remains the default. Export uses the original complete viewBox;
zoom does not alter the numerical model. Supplementary explanations and export
panels are disclosures and expand for printing. Connectivity status explicitly
distinguishes local calculations from live data. Protected previews still need
network access when reopened and are not cached for offline access.

23 additional selected worked cases cover remaining numeric PENDING entries
in chapters 10 and 12. Total worked coverage is 309 cases for 299 expressions
across all 16 chapters. These cases do not establish full-domain model validity.
One indexed heat-flow expression is tested only as a single-layer/single-term
specialization, not general summation. There remain 989 numeric PENDING rows
and six historical OPEN model limits in the 1,498-row register. Those six
remain reference-only. Both evidence ledgers retain their distinction between
unit consistency, selected numerical cases and model validity.

The app foundation is documented in `apps/README.md`. It reuses public tools
with Capacitor (Android/iOS) and Tauri (Windows/macOS). Education remains behind
the existing protected online preview. Initial native builds are development
artifacts, not signed production releases. No main-branch merge, production
deployment or app-store submission is part of this change.

Validation: `students-session-tools-20261027.cjs` checks all 15 draft adapters,
invalid states, storage failure, clear/disable, SVG reset/export. The new real
browser suite checks reload round trips, pointer/keyboard controls and status
in Chromium, Firefox and WebKit; existing acceptance, scientific, source and
single-scroll suites remain required. Native build results must be read from
the Actions run; configuration alone is not evidence of a successful build.

## Completed verification checkpoints

- 51 source/DOM programs passed locally; the session suite passed 141 checks.
- Native implementation `313e19c9777383ecc7178a965dcb7f10081d62b2`:
  [all four native jobs passed](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40497734392).
  Artifacts are Android debug APK, iOS Simulator app, Windows x64 NSIS installer
  and macOS Apple Silicon DMG. Desktop builds used the committed Cargo.lock
  with --locked. APK contents were spot-checked for public-only packaging and
  disabled production API configuration.
- Education implementation `3596cd78bc581d5dc4c5b50a3fc8b8a3d40ac617`:
  [source/DOM, Chromium and WebKit passed](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40499033092).
  Each completed engine passed 153 draft/diagram checks, 10 app-package browser
  checks, 30 Mollier worker/process checks and 448 single-scroll checks.
  Responsive acceptance covered 15 modules over eight viewport configurations;
  actual scenario/report downloads and print output were exercised.
- Firefox's completed full-suite checkpoint is `13da1303a71dbc724fef86f7c97e56eabdb99484`
  in [run 40498894212](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40498894212).
  The following implementation change only reduces presentation toolbar margins
  for short laptop viewports; its newer Firefox dependency-install jobs are not
  counted here as completed acceptance.
- The staged PWA was reopened after the HTTP fixture server was stopped and
  calculated the independent clearance case 25 - 0.8 - 20 - 1 = 3.20 m.
  Versioned resource URLs resolved from the asset-content-versioned cache.
  The protected Education directory was absent from this package/cache.

Desktop/mobile Education and app screenshots were reviewed. Physical device
installation, native file/share behavior, store signing and protected-identity
policy acceptance are separate remaining work; compilation is not a substitute.
