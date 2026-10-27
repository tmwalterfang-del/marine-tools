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
