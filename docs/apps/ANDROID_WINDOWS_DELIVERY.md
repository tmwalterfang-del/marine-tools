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
work rather than duplicating it. [Draft PR #43](https://github.com/tmwalterfang-del/marine-tools/pull/43) targets `feature/cross-platform-app`
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
- Imported legacy vessel numeric fields must be finite numbers before rendering;
  malicious markup in numeric attributes is rejected before any storage write.
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

First branch CI: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40525921835
at 5d60093c2e6361cf15fa9cdf05dd456fd926fa6a. Quality and all three browser
jobs passed, including the expanded viewport/history checks. Native builds were
still running at this checkpoint. A follow-up packaging-only revision separates
Android project source and binary artifacts to preserve both, checks shared
release versions and removes excluded-store privacy wording. That revision passed all three web engines (59 checks each), quality, Android
compilation/inspection and Android emulator. Windows was still compiling at
this checkpoint. A final import-hardening change adds 11 numeric-profile
regressions (42 adapter/guard checks total); final results below identify its
separate candidate revision.

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
| Draft PR | Implemented | #43, open Draft against #42 |
| Shared core/PWA | Tested | 59 checks in each of Chromium/Firefox/WebKit on 4257372; final import-hardening revision retested in final evidence below |
| Interactive layout fixes | Implemented | Existing #35 natural-height/wide workspace retained; physical QA pending |
| Android project/configuration | Built | Generated project uploaded separately; source controls also inspected locally |
| Debug APK / release AAB | Built | Current-branch compilation and merged-manifest inspection passed on 4257372; final candidate below |
| Windows NSIS/MSIX | In progress | Base builds succeeded; this branch requires its own CI outputs |
| Native sharing/export/navigation | In progress | Android emulator passed on 4257372; Windows/final revision evidence below |
| Automated QA/security report | Implemented | This report plus SECURITY_REVIEW.md; CI and physical acceptance separated |
| English listings/assets/privacy | Implemented | Drafts, not legal/store approval |
| CI/CD build configuration | Tested | Current-branch browser/quality/Android jobs; final Windows evidence below |
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

## Current source change inventory

Relative to the inspected app base a9544ff; inherited #35/#42 code is deliberately
not claimed as newly authored in this batch.

| Files | Result |
|---|---|
| `.github/workflows/app-distribution.yml` | Focused target builds and separate generated Android source artifact |
| `apps/app-config.json`, `scripts/stage-app.mjs` | Explicit Android/Windows/PWA distribution metadata |
| `apps/shared/app-shell.js` | Correct Back/Forward cursor and forward-history truncation |
| `apps/shared/app-drafts.js`, `apps/shared/platform-entry.js` | Background lifecycle draft flush |
| `apps/shared/platform-core.mjs`, `tests/app-adapters-20261027.mjs` | Numeric profile import guard and 42 regression checks |
| `scripts/app/check-source.mjs`, `package.json` | Shared release version/syntax validation command |
| `scripts/app/check-android-package.py` | Package checks follow shared identity, SDK, version and targets |
| `scripts/app/package-windows.ps1` | Clean staging before MSIX generation |
| `scripts/app/release-readiness.mjs` | Android/Windows-specific release status and blockers |
| `tests/app-browser-20261027.cjs`, `tests/app-package-20261027.mjs` | History, responsive overflow, packaging target regression |
| `scripts/app/capture-store-assets.cjs`, `apps/store/listings.en.json`, `apps/store/DATA_AND_PRIVACY.md` | Focused English store drafts and 12 shared-UI screenshot references |
| `docs/apps/ANDROID_WINDOWS_DELIVERY.md`, `CHANGELOG_ANDROID_WINDOWS.md`, `FINAL_REPORT.md`, `SIGNING_AND_BUILDS.md`, `SECURITY_REVIEW.md` | Current evidence, scope, handover and security documentation |

## Acceptance distinctions

A successful unsigned AAB/MSIX compilation is **Built**, not Store-ready. The
Android debug APK can be installed by a tester; the unsigned release artifacts
require the intended identity/signing path. The Windows NSIS runner test covers
installation/uninstallation of that installer, not a signed Store MSIX. Windows
native interaction testing uses a separate instrumented executable; the normal
shipping executable receives its own installed-window startup check.

The 42 guard tests use mocked adapters; native OS interactions require the
separate emulator/Windows jobs. Browser clipboard is stubbed only in the web
suite; browser file download and PWA server-stopped reload/update are real.
The 40 overflow combinations cover five viewport sizes, two existing themes and
four representative routes; they are not exhaustive app/device accessibility
acceptance. Education's previous 15-module scroll/diagram evidence is retained
at its own source checkpoint, not represented as a newly executed physical test.

Remaining technical limits are explicit: physical phone/tablet and Windows 10/11
clean-device acceptance, signed MSIX installation and upgrades, native print/PDF,
light theme, external authenticated Education/native delivery, online provider
security/freshness handling, Rust vulnerability audit and actual deployed
Cloudflare configuration verification. These do not block unsigned local-tool
test builds; they do block claims that the full website is packaged offline or
that every requested feature is Store-ready.

## Initial candidate evidence register

Initial runtime source head: `eea5937c9b53432d875f80cd92603c16746b73e2`.
CI run: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40527790674.
GitHub built its PR merge ref `66506066c17eb62d2b8fb1f328587caded8db299`, as
recorded inside build-info.json and the downloaded Android package inspection.
Later documentation-only changes do not change this runtime candidate.

At this revision, quality and all three browser jobs passed. Each browser passed
59 checks; the guard suite passed 42 checks, source syntax/version validation
passed 31 script checks, worked cases passed 309 cases/299 expressions and the
1,498-row expression ledger passed its context checks. npm audit reported zero
findings. This is not a Rust audit or certification of the whole formula domain.

Android compilation and package inspection passed. Downloaded APK/AAB bytes were
independently hashed locally and matched the CI report. Merged debug and release
manifests contain only INTERNET plus AndroidX's signature-protected internal
receiver permission; target 36/min 24, allowBackup=false, cleartext=false.
No .so library is packaged in these candidates. Protected Education and live API
configuration remain excluded/disabled.

| Android binary | SHA-256 |
|---|---|
| `app-debug.apk` | `2f1170873cab8cb3cd4b03b288bc345d2ab48501d449d6ce9be4366d4ed4c1b1` |
| `app-release-unsigned.apk` | `494357c623f1419bd2839381da2b4793dd8101c7c56b769d7dee30b704951662` |
| `app-release.aab` | `6e8c0504873176d152ed0f615ae92d014a92c3cde6f53c0cb5030b953abc060a` |

Android artifacts in that run:

- [Binary candidates](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40527790674/artifacts/12745720075): debug APK, unsigned release APK/AAB and inspection report.
- [Generated Android project](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40527790674/artifacts/12744278910): platform sources/resources without build caches or local SDK paths.
- [PWA and English store graphics](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40527790674/artifacts/12744273710): staged app, 12 Chromium screenshot references, icon, feature graphic, capture manifest and web QA results.

Graphics reviewed locally: mobile air-clearance workspace, widescreen electrical
workspace and branded feature graphic. They show the actual shared UI; they are
not presented as physical Android/Windows screenshots. Native physical-device
images and final Store image review remain separate.

### Windows failure and correction

Run 40527790674 built Android APK/AAB, Windows NSIS and MakeAppx-validated MSIX.
Android emulator passed. Windows native interaction failed before its calculation
assertion: the asynchronous first-run What's New dialog intercepted the click.
This is recorded as FAIL, not native acceptance. The follow-up test awaits and
closes the actual dialog before using the calculator. A separate RustSec audit
job is added to assess the existing native dependency lockfile. Final rerun
results and their source revision follow below after completion.
