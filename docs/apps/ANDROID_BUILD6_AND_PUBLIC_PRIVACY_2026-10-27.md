# Android build 6 and public privacy — 27 October 2026

## Published website

The owner explicitly approved merging PR #45 to main and publishing `/privacy`.
The owner then required that draft wording never appear in live product copy.
PR #46 removed the editorial banner and internal owner/approval notes, preserving
truthful data-flow descriptions without inventing unverified operational facts.

- #45 merge: `71648f2899ed198a81f415daba8626b24e131db8`.
- #46 merge: `eb467b32544f0d2dbb88a51f025826006cd3f52a`.
- Each PR's final website privacy CI passed Chromium, Firefox and WebKit with
  eight viewport profiles each. Main deployment/build and production smoke ran.
- Actual public `https://www.marinetools.app/privacy` returned 200, redirecting
  to `/privacy/`. Verified at 18:56:43 UTC (19:56:43 Europe/Oslo) with fresh
  unauthenticated browser contexts, JavaScript disabled, refresh, complete current
  text, visible contact links and horizontal fit at 320×568, 915×412, 1366×768.
- No old draft banner or internal review/approval notes remain in that response.
  Cloudflare email decoding is unnecessary for the contact links.
- SHA-256 of the inspected public HTML:
  `4353120d1ed7c528c75ba7b2c7842ca0d7fd7c1f6d3ea6c9c2b2f5a7eac58201`.
  This is one execution vantage, not a global availability certification.

Only the isolated website changes were merged. App/Education/security branches
remain separate; no store upload/declaration/submission/public app release.

## Android investigation and correction

Build 5 passed native compilation, APK/AAB inspection and independent downloaded
package/configuration/policy/hash verification in run 40561791505. Its build-4
baseline and build-5 candidate share a verified ephemeral CI debug certificate.
However native acceptance **failed** on a real emulator landscape-IME geometry
check: a focused 44px field ended at 173px in a 164px usable viewport. The old
startup-dialog selector failure is fixed and the probe now fails promptly.
No full build-5 device/upgrade pass is claimed.

Build 6 adds app-only focused-field scrolling after viewport/focus changes.
It preserves full input visibility between the sticky header and keyboard,
without hiding overflow or changing any formula. A regression reproduces the
863×164 usable landscape area. Local Chromium passed **456** complete app
checks, including profiles/themes/insets/zoom, that focus regression, real backup
download, references, navigation, draft reopening, update flow and offline use.
Source syntax (32), public package isolation, adapters (42) and policy parity
also passed. The app's source uses the current public policy without editorial
draft/approval notes.

The native probe now first preserves an input while upgrading rebuilt source
build 4 to the current build, then tests the current candidate's keyboard/layout.
This avoids treating the old baseline's known geometry defect as a new-candidate
failure. It still asserts real Android keyboard visibility and focused-field
bounds, native clipboard/share contents, Back and offline cold restart.

Build 6 native acceptance PASSED in run 40564921693 / job 122405399585.
The downloaded emulator-results.json confirms build 6, same-debug-key upgrade,
clipboard, share chooser/private contents, Back, offline cold reopen and offline
policy. Actual portrait/landscape keyboard screenshots were reviewed.
The debug key is temporary; stable production signing and a physically installed
signed-release upgrade remain unverified. Only preview identity
`app.marinetools.preview` is selected. Windows native work remains paused.

## Account/privacy facts still requiring evidence

Cloudflare documents three-month Analytics Engine service retention. This does
not establish exported-copy/log retention. Tally's connected form ledger did not
show an automatic retention configuration; response contents were not read.
Public MX uses Cloudflare Email Routing, but inbound forwarding/monitoring and
mailbox retention could not be proven. Account-level logging, deletion,
agreements/transfers and website tracking consent remain internal audit issues.
The browser-control helper's Windows encryption error prevented authenticated
Cloudflare settings inspection. These limitations are not editorial notes in the
public policy, and removing those notes does not resolve the underlying facts.

Trygve's remaining release actions are physical phone acceptance in both
orientations/with keyboard/offline/export, future production identity/signing
decisions, actual account evidence, final app/owned-browser Data Safety/rating/
reviewer-access review and a separate explicit approval for any store upload.

## Exact build-6 evidence and delivery

Runtime head: e180dcc6f59faffc9398957365e6f56f1cd15aae.
CI temporary integration source: ca89b9791577196107d8c49506369cd6d644a0f5
(not a merge into main). Any following test-fixture/documentation commit leaves
app runtime code unchanged.

- Build/package and emulator: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40564921693
- APK/AAB and signing/package reports: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40564921693/artifacts/12763330424
- Native screenshots/results: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40564921693/artifacts/12763161709
- APK SHA-256: 5379617bb86076c8759e6e7042693b5f78d793d31d658d335fee6057227c58c0
- AAB SHA-256: 451d899c73b588c5dc8d0417e8b8c9f4017bb9b96b7bf3ef3975924ea997e655

Downloaded APK/AAB bytes match CI hashes, build 6, complete packaged configuration,
current policy and keyboard-focus source. A test APK copy is delivered locally as
deliverables/MarineTools-Preview-0.2.0-build6.apk. This is debug-signed for direct
testing; the AAB is unsigned. Neither is a signed Play submission candidate.

Chromium and WebKit full browser regressions passed in CI; local Firefox full
regression passed all 456 checks. The first Firefox privacy CI fixture expected
an unrelated release dialog already acknowledged in its reused context. The
fixture now seeds that acknowledgement for the privacy test; a separate fresh
full app test continues exercising the real startup dialog. The repaired Firefox
privacy test passed eight profiles locally. No claim that the original failed
Firefox CI job passed is made. Later test-only CI is distinct from the validated
runtime/APK source above.

The public SPA was also inspected with synthetic local settings and outgoing
writes blocked: current policy matches, no editorial notes, and 3.20 m/2.70 m
calculations pass. A same-origin Cloudflare challenge-platform POST was observed
and blocked by the probe. This confirms an infrastructure browser flow, not its
retention settings; account-level review remains necessary. No analytics events
or other write requests were sent by the test.

Release metadata supplied to the owner: Marine Tools Preview 0.2.0 (6), 30/50
characters; English en-US notes, 282/500 characters, in apps/store/release-*.txt.
Language tags must match a language enabled in Play Console. These are copyable
texts only; no console field or store release was created or submitted.
