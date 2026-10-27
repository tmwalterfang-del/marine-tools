# Android and Windows delivery — 27 October 2026

This document is the current Android/Windows mandate and evidence register.
`FINAL_REPORT.md` describes the inherited, broader PR #42 work; it is historical
context, not authorization to develop or publish excluded platforms.

## Architecture and inspected baseline

Repository: tmwalterfang-del/marine-tools. Main at inspection: 6e10a501.
Education Draft #35: 00346882550b7d21ddfc04cc7f0d6d3d677a2391.
Inherited app Draft #42: a9544ff296e0d1808d6c7075379ab77472011879.
Security Draft #40 remains separate and unmerged.

Development branch: `feature/android-windows-app`, based on the existing app
work rather than duplicating it. Its Draft PR targets `feature/cross-platform-app`
so the focused changes can be reviewed without repeating #35/#42. Do not merge
any of these branches without owner approval. Other work may advance those heads;
these hashes identify the exact inspected baseline.

The core is vanilla HTML/CSS/JavaScript. Keep its calculators and Education
implementations shared. The isolated public package adds PWA offline assets,
Capacitor Android and Tauri/WebView2 Windows. Android uses bundled assets and
native clipboard, file sharing, back and lifecycle handling; a remote TWA would
add website availability/association requirements without replacing these local
capabilities. Windows retains the implemented, lightweight native WebView2 shell
and MSIX/NSIS exports. A hosted PWABuilder package is feasible but would duplicate
an existing functioning offline/native integration. No Electron is introduced.

Distribution targets for this phase: Android, Windows and their shared PWA.
Samsung Galaxy Store, iOS, macOS and Apple Store development/publication are
excluded. Previously committed optional Apple source is retained for coordination;
the active distribution workflow does not build Apple platforms. The old
`native-app-prototypes.yml` belongs to the Education branch, and is not triggered
by pushes or PRs on this branch.

## Changes in this batch

- Browser Back/Forward now tracks a history cursor; Forward no longer removes the
  previous page from the app's stack. New navigation truncates the forward branch.
- Pending calculator drafts flush when the document becomes hidden and on native
  app backgrounding, in addition to pagehide and the normal debounce.
- Explicit distribution target metadata restricts build reports to this mandate.
- Distribution CI targets Windows only on desktop, removes the iOS job, supports
  stacked review against #42, and uploads generated Android project sources with
  build caches/local machine configuration excluded.
- Store listing drafts and screenshot generation now target Android/Windows and
  Android tablet layouts. Existing brand icon and feature graphic are reused.
- Windows MSIX staging is cleaned before packaging to prevent stale staged files.
- Shared JavaScript/source syntax validation is a reproducible `npm run lint`.
  The codebase has no TypeScript application; a TypeScript check is not claimed.
- Browser regression adds Back/Forward/Back and 40 viewport/theme/page overflow
  combinations across phone portrait/landscape, tablet portrait/landscape and
  widescreen. Existing offline/update/export/calculation checks remain.

No verified formula definition, production deployment workflow, Worker handler,
production configuration or existing Education layout source is changed here.

## Functionality and limitations

Bundled local calculators, profile/history, supported input drafts, copy/share,
backup/file export, two existing themes (Dark and Bridge Dark), version controls,
PWA explicit updates and app navigation are implemented in the inherited core.
There is no existing light theme; this release does not claim light-mode coverage.
Education layout fixes and Mollier tools from #35 remain intact but Education is
protected, external and online-only. It is not bundled as public/offline content.
Real-time AIS/weather and app analytics are disabled and clearly identified.
The production website is not changed by staging these packages.

Print/PDF is not marked complete: browser print may be available, but there is no
verified Android PrintManager or Windows WebView2 print integration in this
candidate. Existing file exports are the verified route; do not advertise native
PDF printing until implemented and tested. No unnecessary permissions/account
requirement is added for local calculators.

## Builds and QA evidence

Local runtime: Linux, Node 24.22.1. CI uses Node 22, Java 21/Android SDK 36 and
Windows Rust/WebView2. This container has Java 17 and no Android SDK, Windows SDK
or native Windows session. Native compiler/install evidence must come from CI.
Browser installation in this container failed because the downloaded Chromium
archive was invalid; this is a tooling failure, not a browser-test pass.

Initial local checks passed: 31 source syntax checks, isolated package checks,
31 adapter/import/link checks, 309 worked cases for 299 expressions across all
16 chapters, 1,498 expression context entries (six open model limits), and
navigation smoke. This does not certify every formula or physical device.
Current branch browser/native CI results must be recorded below before claiming
the new revision is built/tested. Inherited CI is kept separate.

Inherited baseline run 40522743352 at a9544ff: GitHub job metadata reports quality,
Android compilation/package check, Android emulator, Windows packaging/native
smoke and three web engines successful. That establishes evidence for the base,
not for changes in this branch. Exact artifacts/logs must be used to distinguish
shipping release window tests from instrumented WebView interaction tests.

Current branch CI: pending first push/PR. Update this section with the exact
implementation SHA, run URL, failed checks and resolved failures.

## Security and privacy

See SECURITY_REVIEW.md. Production API/analytics are disabled; staging strips
telemetry and uses a restrictive CSP. Protected Education/backend/secrets are
excluded. Local inputs are not encrypted credential storage. User-exported files
can contain operational data. Android cleartext/backup are disabled and the
FileProvider is restricted to private export cache. Windows filesystem writes
require a user-selected save path. No signing keys are committed.

The separate security PR #40 and deployed Cloudflare policy/rate-binding checks
remain necessary before enabling online services. An offline app wrapper does
not prove API authentication or rate limits. npm audit, Rust audit and deployed
configuration review are separate checks; do not infer one from another.

## Store material and release procedure

English draft: apps/store/listings.en.json, DATA_AND_PRIVACY.md, privacy-draft.html
and feature-graphic.svg. Screenshot generator produces actual Chromium UI
references, explicitly labelled as references rather than physical-device images.
The current website privacy URL is a candidate; owner must approve and host the
app-specific policy before submitting. Ratings/Data Safety answers remain drafts.

Build commands and signing inputs: SIGNING_AND_BUILDS.md. Run npm ci, npm run lint,
npm run test:app, npm run test:app:unit, then the browser/calculation suites. Android:
npm run app:android:sync, Gradle assembleDebug/assembleRelease/bundleRelease.
Windows: npm run app:desktop:build followed by npm run app:windows:msix on Windows.
Use the CI artifacts for reproducible native project/build outputs. Preview
identity is app.marinetools.preview; no production ID is assumed reserved.

The pipeline has read-only repository permission and no publishing or production
deployment commands. Manual build dispatch is not submission approval. Signing,
store upload and any future release workflow require exact identities, secure
credentials and explicit owner authorization. Preserve artifact hashes, source
SHA, signing certificate and version for any candidate selected for release.

## Deliverable status

| Deliverable | Status at initial checkpoint | Evidence / remaining requirement |
|---|---|---|
| Repository/architecture inspection | Tested | Actual branches, docs, workflows and app code inspected |
| Development branch | Implemented | feature/android-windows-app |
| Draft PR | In progress | Create after focused changes are committed |
| Shared core/PWA | Implemented | Existing #42 implementation plus fixes; current revision CI pending |
| Interactive layout fixes | Implemented | Existing #35 natural-height/wide workspace retained; physical QA pending |
| Android project/configuration | Implemented | Reproducible Capacitor generator and overlays; generated project artifact |
| Debug APK / release AAB | In progress | Base builds succeeded; this branch requires its own CI outputs |
| Windows NSIS/MSIX | In progress | Base builds succeeded; this branch requires its own CI outputs |
| Native sharing/export/navigation | Implemented | Base emulator/Windows smoke; retest current branch |
| Automated QA/security report | In progress | Local checks above; CI and physical acceptance separated |
| English listings/assets/privacy | Implemented | Drafts, not legal/store approval |
| CI/CD build configuration | Implemented | Android/Windows/PWA only; artifacts, no release job |
| Physical-device acceptance | Not started | Android phone/tablet, Windows 10/11, accessibility, upgrade and clean-device tests |
| Ready for submission | Not started | Identity/signing/privacy/device/release gates outstanding |
| Submitted | Not started | Not authorized |
| Published | Not started | Not authorized |

## Owner actions and next release

The owner continues account verification/payments, confirms package/publisher
identities from the consoles and approves the public privacy/support information.
Development and unsigned/test builds do not wait for those actions. Before any
submission, select the exact release candidate, complete physical-device and
same-key upgrade acceptance, securely configure signing and explicitly authorize
that submission. Keep main, production and all store uploads untouched meanwhile.

Next release priorities: authenticated Education delivery decision, security #40
staging acceptance before online services, verified native print/PDF if needed,
physical accessibility and safe same-identity upgrades. Preserve the outstanding
scientific model/numerical review ledger rather than representing it as complete.
