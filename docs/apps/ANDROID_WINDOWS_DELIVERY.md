# Android and Windows delivery — 27 October 2026


**Current delivery:** Android and Windows test candidates are built at
`f6a1bf727c9d561e48c7e93cd793ef8859bd05cd` (version 0.2.0, build 2).
Android emulator and Windows installation/native interaction acceptance pass.
Neither store is ready/submitted/published. Final artifact links, hashes and
remaining verification limits are in the final delivery section below. The
supplemental current WebKit job is still installing its browser at this snapshot;
its earlier 59-check passes are retained separately, not counted as a new pass.

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
| Shared core/PWA | Tested | Final Chromium/Firefox: 59 checks each; previous identical app core WebKit pass; current supplemental WebKit installation pending |
| Interactive layout fixes | Implemented | Existing #35 natural-height/wide workspace retained; physical QA pending |
| Android project/configuration | Built | Generated project uploaded separately; source controls also inspected locally |
| Debug APK / release AAB | Built | Final f6a1bf7 binaries downloaded, hashes and merged manifests checked; debug APK passed emulator acceptance |
| Windows NSIS/MSIX | Built | Final NSIS install/start/uninstall passed; MSIX validly packaged but unsigned and not installed |
| Native sharing/export/navigation | Tested | Actual Android emulator and instrumented Windows native interactions pass; physical-device/recipient-delivery limits remain |
| Automated QA/security report | Implemented | This report plus SECURITY_REVIEW.md; CI and physical acceptance separated |
| English listings/assets/privacy | Implemented | Drafts, not legal/store approval |
| CI/CD build configuration | Tested | Final quality, Android, emulator, Windows, Rust, Chromium/Firefox pass; supplemental WebKit runtime installation pending |
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
security/freshness handling, native dependency-path maintenance and actual deployed
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

## Native dependency audit follow-up

CI run 40529639047 adds a real RustSec scan of the locked native dependency graph,
with no advisory ignore list or OS/CPU filter. It inspected 498 dependencies
against 1,380 advisories (database commit
99670cfc0bc574433034b75876a4b791ccaa2efb, updated 27 October 2026).
The vulnerability-class list is empty, but there are five informational warnings;
this must not be summarized as a clean report with no findings.

| Locked package | Version | Warning | Advisory |
|---|---|---|---|
| proc-macro-error | 1.0.4 | unmaintained | RUSTSEC-2024-0370 |
| zbus_names | 4.3.5 | unmaintained | RUSTSEC-2026-0371 |
| zvariant | 5.15.1 | unmaintained | RUSTSEC-2026-0370 |
| zvariant_derive | 5.15.1 | unmaintained | RUSTSEC-2026-0372 |
| glib | 0.18.5 | unsound | RUSTSEC-2024-0429 |

The GLib warning concerns unsound iterator implementation and must not be ignored
merely because the job exits successfully. The full lockfile includes optional
platform graphs. None of these five package names appeared in the fresh Windows
compilation lines of run 40527790674; that is evidence about this build, not a
replacement for a target-specific dependency-path review. Android uses the
Java/Kotlin Capacitor shell and does not build this Rust graph. Before enabling
additional desktop platforms or changing native dependencies, trace/update the
relevant upstream paths and rerun the audit. No advisory was suppressed and no
unrelated dependency upgrade was made to force a green status.

[Complete JSON audit artifact](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12746975060).
The earlier statement that no Rust scan had been performed describes the inherited
checkpoint; this scan is new evidence. Source/configuration and physical-device
security checks remain separate. CI also emits a Node 20 action-runtime
compatibility warning while forcing older action majors onto Node 24; schedule
an action-major maintenance pass rather than confusing that with an app CVE.

## Final delivery: Android and Windows test candidates

Source head: `f6a1bf727c9d561e48c7e93cd793ef8859bd05cd`.
Build-info records GitHub's tested PR merge ref
`f63e166c1b51a1cfba04515bc06acbc3d883dea3`.
[Final candidate run](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047).
The subsequent report commit changes documentation only. No formula, runtime,
packaging or production code changes after this candidate are implied.

| Job / acceptance | Result | Scope |
|---|---|---|
| Quality | PASS | npm audit zero findings; 42 guards, selected 309 worked cases, 1,498 ledger entries, source/DOM/navigation checks |
| Chromium / Firefox | PASS | 59 checks each; real PWA offline navigation/update and backup download; 40 responsive/theme combinations |
| WebKit | IN PROGRESS at snapshot | Browser dependency installation; prior 59-check passes at eea5937/4257372 remain separate evidence; app core unchanged in the final Windows-test/audit follow-up |
| Android build | PASS | Debug APK, unsigned release APK/AAB, merged manifests and package isolation |
| Android emulator | PASS | API 36, native clipboard, real share chooser/private export contents, system back and offline cold reopen; 1.5 m restored margin gives 2.70 m clearance |
| Windows build/package | PASS | Release NSIS and MakeAppx-validated unsigned x64 MSIX |
| Windows installed shipping window | PASS | NSIS install, release-window startup and uninstall on runner |
| Windows native interactions | PASS | Separate CI instrumentation: 3.20 m calculation, actual OS clipboard, real Save As and exact saved JSON contents |
| RustSec audit | PASS WITH WARNINGS | 498 dependencies, zero vulnerability-class findings; four unmaintained and one unsound informational warning, documented above |
| Physical devices / signed Store upgrade | UNVERIFIED | Required before submission; unsigned MSIX installation not credited |

The earlier Windows failure was the test's delayed-modal race. The corrected
run waits for and clicks the normal Done action; no forced calculator click or
removed acceptance assertion was used. Shipping installers/MSIX were built
before CI instrumentation. The debug-port instrumentation executable is not a
shipping artifact. Its JSON records the unchanged shipping executable hash.

### Downloadable deliverables

| Artifact | Download / contents |
|---|---|
| Android binary candidates | [APK/AAB ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12746840164): installable debug APK, unsigned release APK/AAB, package inspection |
| Android native project | [Generated project ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12744833791): source/resources; SDK paths and build caches excluded |
| Android emulator evidence | [Native QA ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12746655693): screenshot, progress and actual acceptance result |
| Windows candidates | [Windows ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12747225299): NSIS installer, unsigned MSIX, native screenshot, install/export/package reports |
| PWA and store assets | [Shared app ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12744814668): staged PWA, 12 English shared-UI screenshot references, icon, feature graphic, results and readiness report |
| Native dependency assessment | [RustSec JSON ZIP](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12746975060): complete advisories including all five warnings |

Download the Android binary ZIP and select `app-debug.apk` for non-production
installation. `app-release.aab` is unsigned and cannot be directly installed.
For Windows local testing, extract and use the NSIS `x64-setup.exe`; the unsigned
MSIX is for signing/Store preparation, not a trusted installation. Follow
QA_MATRIX.md for device acceptance and SIGNING_AND_BUILDS.md for developer steps.
Do not create machine-wide certificate trust as part of this handover.

Both final native screenshots were inspected locally: Android airplane-mode
reopen with the restored 2.70 m result, and Windows with actual `File saved`
feedback. They support runner acceptance only. The Android screenshot also shows
that the legacy ONLINE badge can remain green in airplane mode: treat this as a
WebView connectivity hint, not proof of reachable services. All live services
are disabled and explicitly labelled. Correct/replace this indicator before an
online-service release; do not infer fresh weather/AIS from it.

Final downloaded binary SHA-256 values:

| Binary | SHA-256 |
|---|---|
| `app-debug.apk` | `ce523bec506ab9946ed30ff48559b59ee791b16d28ccc60249125f28a6c0052e` |
| `app-release-unsigned.apk` | `8b21aa7e73e13b4eb6491f7b248dd6867b07fb3c641ac0898d9af15f238b52dd` |
| `app-release.aab` | `de786bdfaf9050d090fd0a0b48e3b6ea4e5304370991c4ccd1491021fa45c8cf` |
| `Marine Tools Preview_0.2.0_x64-setup.exe` | `9850efa81ded89739f85405f07f950b50a2c76727ce8b8ebb6fe97c2d20c9eb1` |
| `MarineToolsPreview_0.2.0_x64_unsigned.msix` | `237370ff700e65ffcf17fc76c2e05bee025e9732673b6d9ff1f95d7563735995` |

### Remaining requirements and responsibility

Owner: complete account verification, confirm exact Google package/Windows Store
identities, approve public app-specific privacy/support information and ratings,
participate in physical-device acceptance and explicitly approve the named release.
Work handles the subsequent identity configuration and secure signed builds; the
owner is not expected to program or assemble native projects.

Technical follow-up before a full-featured Store release: verify the five native
advisory dependency paths/maintenance plan, resolve final WebKit infrastructure
status, fix the native connectivity indicator, complete physical accessibility,
clean Windows/WebView2 and signed MSIX/same-key upgrade tests. Protected Education
and live providers remain an independent authenticated-staging/security/privacy
workstream; native print/PDF and a true light theme are not implemented or claimed.
OS/browser runtime diagnostics are controlled separately by platform settings;
absence of an app telemetry SDK is not a claim that the OS sends no diagnostics.

No merge, production deployment, store submission or publication was performed.
All Store-ready/submitted/published milestones remain **Not started** until the
technical and owner release gates are actually satisfied.
