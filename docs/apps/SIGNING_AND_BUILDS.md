# Reproducible builds and signing

Current phase: Android and Windows only. Node 22+, npm ci; Android Java 21/SDK 36;
Windows Rust, Windows SDK MakeAppx and WebView2.
Generated native projects remain ignored; pinned templates plus checked-in
overlays reproduce them. The preview identity is not a reserved production ID.

## Local development
    npm ci
    npm run test:app
    npm run test:app:unit
    npm run app:serve
    npm run app:android:sync
    npm run app:android:release
    npm run app:desktop:build
    npm run app:windows:msix

Android unsigned outputs:
apps/mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk
apps/mobile/android/app/build/outputs/bundle/release/app-release.aab
Debug APK: outputs/apk/debug/app-debug.apk.
The Android source project is uploaded separately as
`MarineTools-0.2.0-android-project`; binary candidates remain in
`MarineTools-0.2.0-android-candidates`. Restore files under apps/mobile/android
in a checkout of the same source revision and run npm ci / Android sync before
building. Generated build caches and local SDK paths are intentionally excluded. Release AAB/APK are not upload-ready
without correct signing. The debug APK uses a debug key and is not a release key.

The Gradle overlay accepts MT_ANDROID_KEYSTORE (secure runner-local file path),
MT_ANDROID_STORE_PASSWORD, MT_ANDROID_KEY_ALIAS and MT_ANDROID_KEY_PASSWORD.
Provide all through protected CI secrets after approval. The script contains
no key/password. Without the key path it builds unsigned release candidates.
Use a persistent app-signing strategy across releases; never ship with a new
temporary key. Verify release signatures with Android apksigner/jarsigner and
record package ID, versionCode and certificate SHA-256 before upload.

Windows builds Tauri's NSIS installer and an additional unsigned MSIX using
Windows SDK MakeAppx full manifest validation. Preview Publisher is explicitly
CN=Marine Tools Development, not a Store registration. Supply the real
MT_WINDOWS_STORE_IDENTITY, MT_WINDOWS_STORE_PUBLISHER and
MT_WINDOWS_IDENTITY_CONFIRMED=true only after Partner Center confirmation.
Use SignTool with an approved certificate and matching Publisher for local
installation; do not turn on machine-wide test trust on the owner's PC through
automation. MSIX packaging success is not install/uninstall or Store certification.
WebView2 Evergreen must be present; test a clean target Windows system.

Previously committed Apple helpers are inherited source and are outside this
phase. Current distribution CI builds Android, Windows and shared PWA only.

## Release controls

app-distribution.yml builds artifacts only: it has contents:read, no store
credentials, no upload/publish command and no production API/analytics toggle.
workflow_dispatch is a manual build, not release approval. Configure protected
GitHub Environments with owner reviewers before adding any future signing or
upload job. An unchecked environment name alone is not an approval guarantee.
Never add automatic store uploads to the feature-branch push trigger.

Candidate assets/version metadata are public; secrets must not be committed.
Retain the exact source commit, npm/Cargo locks, artifact filenames, SHA-256 and
test report alongside each approved signed release. Store material is a draft
until matched to that exact final binary.
