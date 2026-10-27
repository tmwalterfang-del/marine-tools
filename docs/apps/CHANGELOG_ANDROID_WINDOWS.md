# Android / Windows changelog

## 27 October 2026 — focused development candidate

Base: app Draft #42 a9544ff, carrying Education Draft #35 0034688.

- Scope distribution CI, metadata, English listings and screenshot references to
  Android, Windows and the shared PWA; preserve upstream optional platform code.
- Fix app history cursor across Back/Forward and new navigation.
- Flush raw input drafts on document/native background lifecycle events.
- Reject malformed imported legacy vessel numeric fields before storage/rendering;
  adapter/import regression coverage increases to 42 checks.
- Clean MSIX staging on each build; include generated Android project in artifacts.
- Add reproducible shared source syntax validation and expanded viewport/theme
  and history regressions. Release-version and Android package checks follow the
  shared configuration. Formula engines and production settings unchanged.

Evidence and limitations: ANDROID_WINDOWS_DELIVERY.md. No merge, store upload or
production deployment is authorized by this changelog.

## Windows acceptance follow-up

The first final-candidate Windows native smoke failed because the delayed
first-run release dialog opened after a conditional presence check and blocked
the calculator click. Compilation/MSIX creation succeeded; native interaction
acceptance was not credited. The test now awaits the visible dialog and clicks
its real Done button, then waits for it to close. No forced clicks, removed
assertions or application UI suppression are used. Add a separate RustSec audit
job so the dependency report includes the native Rust lockfile as well as npm.

## 27 October 2026 — privacy route and common policy, build 4 source

Expose a script-free static `/privacy` directory page and reuse its single
English content source in the existing Privacy & Data renderer and app offline
policy. Add a canonical public link, consistent listing metadata and in-app
fragment navigation. Correct the distinction between pseudonymous website usage
and disabled app telemetry, disclose online coordinates/external services, and
flag unverified retention/legal/provider claims instead of inventing them.
Add generated-copy parity, privacy/control/storage regressions and browser/Android
CI. No analytics behavior, formulas, Worker source or production deployment change.
Publication remains blocked on explicit review, legal/operational confirmations
and deployment approval; production `/privacy` returned 404 on inspection.
