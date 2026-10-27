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

CI results for build 6 must be checked separately after this source commit.
Do not infer a native pass from the passing browser regression or workflow code.
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
