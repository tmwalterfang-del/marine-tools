# Android focus checkpoint — 27 October 2026

Owner requested wrap-up and Android/Google Play priority. Further Windows and
website implementation is paused. Owner reports Google/Android administrative
readiness; console permissions and production identity have not been verified
by this implementation checkpoint. No upload/publication authorization inferred.

## Test candidate and evidence

Draft PR #43: https://github.com/tmwalterfang-del/marine-tools/pull/43
Branch: feature/android-windows-app. Candidate head:
`f961a2eb2b4b543ce2c7dc8834c928d02235bef6`.
CI tests the temporary PR integration ref `cdcca60f13f4b151afa5f129a7e5ec817576610f`;
this is not a merge into main.
Run: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40550376376

Android 0.2.0 / versionCode 3: debug APK, unsigned release APK and unsigned AAB
built; merged manifests and package isolation pass. The downloaded debug APK
hash matches package-inspection.json:
`14d44c96270bfe92669d12bdba8da2763f516f52951faedd218ada551280a7f7`.
Target SDK 36, min SDK 24, cleartext and backups disabled. No protected Education,
production API, analytics or production secrets are bundled.

Download: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40550376376/artifacts/12755595497
Unzip and install `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`.
AAB is for future Play testing/submission, not direct phone installation.
CI debug signing is ephemeral: export important local work before uninstalling
an older Preview if Android rejects an in-place upgrade due to certificate mismatch.
Do not uninstall solely to obtain routine production updates; store releases need
stable identity/signing and a real upgrade test.

One shared normal-flow sticky header replaces overlapping fixed bars. Phone home
search is no longer duplicated in the toolbar. Safe status/navigation/cutout
insets, compact landscape/portrait layouts and fluid calculator grids implemented.
No formula change. See PHONE_LAYOUT_FIX_2026-10-27.md for the exact contract.

Latest run: quality, npm audit, Rust audit, Android build, Chromium and WebKit
passed. Chromium/WebKit each pass 455 browser checks, covering 26 viewport
profiles, both existing themes, simulated insets, 125/150/200% CSS enlargement,
actual hit tests and reachable controls. Firefox browser installation and the
new Android emulator rotation/keyboard suite were still running at this snapshot;
their success is NOT claimed. Prior 40546929081 passed 455 checks in each of the
three browsers for the same frontend layout. Neither proves physical phone QA.

Windows latest native job passed NSIS install/start/uninstall, shipping window
containment, three actual outer-window resize requests (largest clamped to runner
work area), geometry tests, clipboard and native Save As/exact file contents.
Unsigned MSIX packaged, not installed. Physical DPI/multiple-monitor and Windows
10/11 hardware acceptance remain unverified. Further Windows work is paused.
Windows evidence: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40550376376/artifacts/12754373358

## Separate unfinished update work

Saved on feature/app-update-hardening; not included in the above APK or Windows
installer. This snapshot must not replace the tested candidate without review:

- Website worker pins its installed shell to its own cache and stops silent
  forced activation; online services remain network-only. Public updates wait
  until old clients close; private Pages Access behavior remains network-only.
- Website background checks and normal-flow update notice added.
- App PWA checks on foreground/reconnect/15-minute interval; flushes unfinished
  inputs before user-applied update and blocks activation when other tabs exist.
- Added real-browser multi-tab and unfinished-input regression scenarios.

Local syntax (31), package isolation and adapter/guard (42) checks pass. The new
update scenarios and website cache migration have NOT been browser-tested or
built into a new native candidate. Multi-tab races, protected-preview behavior,
failed installation and first public cache transition need acceptance.

Native store updates should use stable signed packages through Google Play and
Microsoft Store. The downloaded debug APK/NSIS candidates have no automatic
update channel. Existing Windows MSIX package version derives only semantic
version and must be corrected/monotonically checked before future Store updates;
first-component/fourth-component Store requirements also need validation.
No independent remote-code updater or unapproved update endpoint is added.

## Android next acceptance/release gates

1. Inspect latest emulator result; verify actual phone portrait/landscape,
   keyboard, back, accessibility, exports and offline reopening on owner's device.
2. Confirm Play production application ID, account access and app-signing/upload
   key strategy. Preview identity is app.marinetools.preview; production ID is
   only proposed, not verified/reserved.
3. Configure secure stable signing and increment versionCode for future releases;
   verify same-key upgrade preserves inputs/settings and recomputes results.
4. Complete English listing/screenshots, public app privacy policy, Data Safety,
   content rating and testing-track requirements against implemented functionality.
5. Obtain explicit approval for the named test-track upload/store submission and
   separately for public rollout. No merge, production deploy or upload done.

Store assets/listing drafts, source documentation and build workflow already
exist; they remain drafts. Both stores: NOT SUBMITTED / NOT PUBLISHED. App analytics
remains disabled; test usage is not sent to the production analytics dashboard.
