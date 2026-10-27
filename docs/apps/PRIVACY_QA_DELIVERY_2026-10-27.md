# Privacy policy technical delivery — 27 October 2026

Draft PR: https://github.com/tmwalterfang-del/marine-tools/pull/44
Branch: feature/privacy-policy, stacked on Android Draft #43. Neither PR merged.
Tested runtime/source: `da91ff95863f59befd46dc67bc7959d63853cd5a`.
CI temporary integration checkout: `9e7cc3d4b3d9ab154a2e21eb2ddb57f258cd1231`.
This temporary PR checkout is NOT a merge into main. Any later commit adding
this delivery record changes documentation only.

## Outcome

Implemented one shared English policy source, script-free static `/privacy`
route, existing website Privacy & Data reuse, app/offline text and public URL
integration, matching store metadata, data-flow audit and conditional Data
Safety recommendations. Analytics collection/defaults, formulas, Worker source
and production infrastructure are unchanged. The owner-supplied Google User Data
full policy is mapped in GOOGLE_USER_DATA_CHECKLIST_2026-10-27.md.

**Technical implementation: tested. Production publication: blocked.** The
public URL returned 404 at inspection; no deployment was authorized/performed.
The text is visibly a draft until actual retention, legal bases/consent, provider
agreements/transfers and request-handling arrangements are confirmed. Google
Play's public privacy URL requirement is therefore NOT yet satisfied.

## Changed-file overview

- Single editable text: privacy/policy.fragment.
- Generator and generated views: scripts/build-privacy.mjs, privacy/index.html,
  privacy-policy.js, apps/store/privacy-draft.html. `--check` enforces parity.
- Shared presentation: privacy-policy.css; existing website index.html/app.js/sw.js.
- Android/Windows shared integration: apps/shared/app-shell.js,
  apps/app-config.json (0.2.0/build 4), scripts/stage-app.mjs. Existing privacy
  navigation remains. App fragment navigation preserves current route.
- Store metadata/assessment: apps/store/listings.en.json, DATA_AND_PRIVACY.md.
- Tests: tests/privacy-policy-20261027.cjs, privacy-browser-20261027.cjs,
  updated existing package/core-DOM policy loading assertions.
- CI: .github/workflows/privacy-policy.yml (read-only build/test/artifact jobs).
- Audit/evidence/checklist/changelog and this delivery report: docs/apps/.

## Test results

[Final privacy CI run](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40557491652):

| Check | Result | Scope/limit |
|---|---|---|
| Chromium privacy suite | PASS | Eight viewport profiles; actual DOM/render/browser actions |
| Firefox privacy suite | PASS | Same contract |
| WebKit privacy suite | PASS | Same contract; browser engine test, no Apple app work |
| Direct `/privacy` and refresh | PASS in static test host | Models directory hosting, including redirect to /privacy/; not production |
| No-JS/public-page rendering | PASS | Fresh contexts, complete policy, no script/iframe/accordion/form requirement |
| Responsive geometry | PASS | 320×568, 568×320, 412×915, 915×412, 768×1024, 1024×768, 1366×768, 2560×1440 |
| App policy/canonical link/fragment | PASS in browser package | Link reaches platform adapter; fragment remains on privacy route |
| Analytics/exclusion/local profile/settings controls | PASS | Actual existing renderer/handlers; no production analytics writes |
| Generated policy parity | PASS | Standalone, shared JS and app/store copy match source |
| Whole tracked source audit | PASS | 14 HTML documents, 169 scripts, no issues/warnings; template explicitly a fragment |
| Source syntax/package/adapter guards | PASS | 32 syntax checks, isolated package, 42 adapter/guard checks |
| Existing core DOM | PASS locally | 20 pages and 46 calculator handlers; no runtime errors |
| Worked numerical examples | PASS locally | 309 cases / 299 expressions; unchanged formulas, not universal certification |
| Usage collector regression | PASS locally | 84 checks; expected synthetic route/error diagnostics are not real-provider passes |
| Android debug APK + unsigned AAB | BUILT and INSPECTED | Correct build 4/policy bytes, source metadata, hashes and two merged manifests |
| Physical Android/Windows, browser Custom Tab final flow, accessibility certification | NOT TESTED | Remain device/release acceptance |
| Production `/privacy` | FAIL / NOT DEPLOYED | Actual unauthenticated HTTPS inspection returned 404; root returned 200 |

Separate Analytics dashboard CI 40557491434: integration, Chromium and Firefox
passed at this checkpoint; WebKit was still running. These regressions are kept
separate from the fully successful privacy matrix; no latest dashboard WebKit
pass is credited here.

Browser QA artifacts:
- [Chromium screenshots/results](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40557491652/artifacts/12757947652)
- [Firefox screenshots/results](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40557491652/artifacts/12758910284)
- [WebKit screenshots/results](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40557491652/artifacts/12757588440)

The Chromium app screenshot was inspected at its actual viewport size after
scrolling to the top and waiting for the existing page animation to finish.
Earlier full-page app captures could represent a sticky header at a stitched
scroll offset; those are not used as the final app viewport acceptance image.

## Android build output

[Final build-4 APK/AAB and package report](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40557491652/artifacts/12758715637).
Unzip; install `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`
for non-production testing. The AAB is unsigned and is not for direct install.
This is still preview identity app.marinetools.preview, not a production release.
CI debug keys can differ; export important local work before removing an earlier
Preview if Android rejects an upgrade due to certificate mismatch.

Downloaded packages were independently opened and checked against repository
policy JS bytes, build number 4, disabled app analytics/production API, and the
CI package-inspection hashes:

| File | SHA-256 |
|---|---|
| app-debug.apk | ae5710a1496f85a38895903ddbca248d26b45139abbb258b93084ac966b16ff0 |
| app-release.aab | 3d7467206e6cef7616577432eab93b05ed09e05760e3dc9f80ef8956b5adc846 |

The declared permissions remain INTERNET and the app-internal signature receiver
permission. Target 36/min 24, cleartext disabled and Android backup disabled.
No physical-device pass or signed Play upgrade test is inferred from packaging.
Windows shared policy source is implemented; no new Windows binary was built
in this privacy workstream.

## Publication blockers and owner decisions

1. Confirm actual server analytics/edge/API/form/mail/backup retention and
   deletion criteria; source browser-ID renewal is not server retention.
2. Resolve default-on website tracking and its legal/consent basis. Security #40
   is separate/unmerged; a privacy page alone does not supply prior consent.
3. Confirm provider roles/contracts, processing locations, international transfer
   arrangements and a monitored privacy-request process. GDPR/Norwegian privacy
   and electronic-communications obligations require actual operational facts.
4. Approve final English wording and removal of its draft label only once true.
5. Explicitly approve the named minimal website integration/deployment, without
   implicitly deploying the entire #35/#43 dependency stack. Then verify actual
   public HTTPS /privacy access, refresh, new-storage/no-JS behavior, no Access
   or geographic gate and account-level Cloudflare injection/logging from multiple
   regions. Current local/CI evidence is not that production verification.
6. Verify the final signed Android/owned-browser flows and reconcile Data Safety;
   separately approve any Google Play declaration/upload/submission/public rollout.

No Google Play/Microsoft declarations, store submissions, production deployment,
merges or app publication were performed. Neither store is ready for submission
on the basis of this privacy work alone.
