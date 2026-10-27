# Marine Tools app implementation report — 27 October 2026

Version 0.2.0, build 2, preview identity `app.marinetools.preview`.
Development branch: `feature/cross-platform-app`.
Draft PR: https://github.com/tmwalterfang-del/marine-tools/pull/42

This is a working local-calculator distribution candidate. No platform is marked
Store-ready, submitted or published. Developer accounts, legal approval, final
identities, signing and physical-device acceptance remain external release gates.
No merge to main, production deployment, production analytics change or store
upload was performed.

## Inspected source and coordination

Education base commit: `00346882550b7d21ddfc04cc7f0d6d3d677a2391`, tree
`63596bf328df604acce088e798ca070033b101d7`, Draft PR #35. PR #42 is stacked
against that branch; it retains the Education work without merging #35 to main.
Main was `6e10a5017428373079cdce26f0fb19175565bb20`; security Draft PR #40
was `314e5bf7c7a18274c9579e4ba6dee84a3cbd1375` and was not merged here.

Inspected the vanilla HTML/CSS/JavaScript frontend, lazy calculator renderers,
local persistence, PWA/staging sources, existing mobile/desktop wrappers, npm
and Rust manifests, Cloudflare Pages/Worker configuration/import chain,
authentication and analytics code, existing regressions and previous handovers.
See ARCHITECTURE.md and SECURITY_REVIEW.md for findings and their limits.

## Implemented

- Shared existing calculator UI and mathematical engines; optional native hooks
  leave normal website use intact. No formula definitions changed for layout.
- App bar, version/back/install/update controls, wide workspace, mobile menu,
  safe areas, touch targets and Android back behavior. Education retains natural
  frame height and broad interactive workspaces from #35; no hidden content is
  made inaccessible merely to remove a scrollbar.
- Installable PWA manifest, branding, content-hashed offline caches, explicit
  waiting-worker update, standalone mode and preserved local work.
- Capacitor Android/iOS adapters for actual system clipboard, sharing/export,
  external browser and app lifecycle/deep links. Native shells use bundled assets
  without a PWA worker overriding their installed version.
- Tauri Windows/macOS shell, native clipboard, scoped Save As/file write and
  external link opening; no Electron or broad shell/filesystem access.
- Bounded local calculator draft restore and clearing. Backup import validates
  file size, shape, depth, known fields, route coordinates and unsafe keys.
- Android release APK/AAB and optional environment-driven signing, SDK 36/min24,
  private export-only FileProvider, disabled cleartext and Android backup.
- Windows NSIS and MakeAppx-validated MSIX with explicit preview identity.
- iPhone/iPad configuration, icons/launch assets, URL scheme, privacy manifest,
  unsigned device archive and separate debug-only simulator acceptance probe.
- English listings, review notes, feature graphic, actual shared-UI screenshot
  generator, privacy/Data Safety assessment, signing guide and owner checklist.
- Read-only CI validation/build jobs and versioned downloadable artifacts.
  There is no store-publishing or production-deployment job.

Protected Education is online-only and excluded from public native/PWA assets
and caches. Live AIS/weather, app analytics, advertising and crash telemetry are
disabled. Native access to protected Education is external and requires its
own authentication. The candidate is not a full offline copy of the website.

## Source map

| Files | Purpose |
|---|---|
| `apps/app-config.json` | Version, preview identity, offline boundaries, platform settings |
| `apps/shared/*` | Native adapters, link/import guards, app navigation/layout and local drafts |
| `scripts/stage-app.mjs`, `scripts/native-app.mjs` | Public-only shared asset staging and reproducible native projects |
| `apps/mobile/config/*`, `scripts/app/configure-mobile.mjs` | Android/iOS overlays, signing inputs, privacy and native debug probe |
| `apps/desktop/src-tauri/*` | Native desktop process, locked plugins, capabilities, CSP and packaging |
| `scripts/app/*` | Packaging, emulator/simulator/native acceptance, store captures and readiness guard |
| `app.js`, `product-v860.js` | Optional platform export/copy/share/import hooks; numerical code retained |
| `tests/app-*` | Package isolation, adapter contracts and three-browser regressions |
| `apps/store/*` | English submission drafts and app-specific privacy draft |
| `.github/workflows/app-distribution.yml` | Browser, quality, Android, Windows/macOS and iOS candidate builds |
| `docs/apps/*` | Architecture, security, QA, build/signing and release handover |

Generated Android/iOS projects and binaries are CI artifacts, not committed
platform output. Pinned dependencies, overlays and locks reproduce them.

## Verified evidence

At `5be2216c62787e708aaa0182d8b85a97c17b2e27`, run
https://github.com/tmwalterfang-del/marine-tools/actions/runs/40510041161:

- Chromium, Firefox and WebKit app regressions PASS: independent air clearance
  3.20 m and electrical reference, back navigation, clipboard adapter, real backup
  download, draft reopening, explicit PWA update preserving local data, a fresh
  navigation after stopping the HTTP server, mobile width and no runtime errors.
  Browser clipboard is stubbed here; this does not prove native OS clipboard.
- Quality job PASS: package isolation, 31 adapter/guard checks, existing worked
  cases/context ledger, whole-site source/DOM regressions and navigation smoke.
- Full npm audit and runtime-only audit: zero findings after pinning the xcode
  subtree to uuid 11.1.1. This is not a Rust vulnerability audit.
- Android debug APK, unsigned release APK and unsigned release AAB compiled.
  The first package inspection rejected AndroidX's internal signature-only
  dynamic receiver permission; the revised checker verifies that declaration
  rather than accepting arbitrary extra permissions.
- Windows release executable/NSIS and unsigned MSIX compiled/packaged. Initial
  native interaction test failed to attach to WebView2; build success alone is
  not counted as clipboard/Save As/installation acceptance.
- macOS DMG compiled; signing/notarization and physical installation unverified.

Earlier commit `377accd1078d58ab4f4e7d02e22eeb9686ce1f93`, run
https://github.com/tmwalterfang-del/marine-tools/actions/runs/40504668288,
produced the unsigned iOS archive and Simulator app. A four-second launch capture
was white, so launch success was explicitly rejected as UI acceptance. The
stronger native probe checks actual UI readiness, calculation, clipboard,
share-sheet presentation and private file contents. Its first execution timed
out during Apple's first-boot data migration, before testing the app. The revised
runner waits asynchronously with visible boot logs; failures remain failures.

## Remaining release gates

All four stores remain NOT READY. Signing, account/identity verification,
public app-specific privacy policy, store questionnaire/rating responses,
physical Android/Samsung/iPhone/iPad/Windows tests and explicit named-build
release approval are required. See OWNER_AND_RELEASE_CHECKLIST.md; the owner is
not asked to do programming work.

Windows MSIX is unsigned and not an installable trusted Store package yet.
iOS `.xcarchive` is unsigned, not a signed IPA/TestFlight upload. Android release
artifacts are unsigned; debug APKs are test-only and their generated CI signing
certificate can differ between runs. Export important test data before replacing
a debug install; same-ID upgrades require the same signing certificate.

Native export recipient delivery, signed upgrades, interruptions, assistive
technology and clean-device acceptance remain unverified until performed.
PWA browser installation is also a separate physical-device acceptance step.
The existing 1,498-expression ledger is not a certification: 989 numerical
reviews remain pending and six OPEN entries remain reference-only. Existing
worked cases cover 309 cases/299 expressions without claiming all formulas
independently verified.

Any future online provider/analytics variant must separately complete security
PR #40 and staging authentication/rate/privacy acceptance. An offline wrapper
does not fix or prove the deployed Cloudflare edge policy.
