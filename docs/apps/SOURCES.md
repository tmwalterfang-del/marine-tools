# Primary references checked 27 October 2026

- Google target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878?hl=en
  New apps/updates target API 36 under the current published schedule; candidate targets 36.
- Google new personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
  Apply account-specific requirements; do not assume they apply to every organization account.
- Apple technical upload requirements: https://developer.apple.com/news/upcoming-requirements/
  Current published floor is Xcode 26 with the corresponding iOS/iPadOS 26 SDK;
  actual candidate build logs name the installed toolchain.
- Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
  Match console device families/dimensions; web reference images are not device acceptance.
- Samsung registration: https://developer.samsung.com/galaxy-store/launch.html
- Samsung package/signing FAQ: https://developer.samsung.com/galaxy-store/faq.html
  AAB handling involves Samsung signing management; APK reuse still requires the right certificate strategy.
- Windows MakeAppx: https://learn.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool
  Package creation/manifest validation does not establish install or Store certification.
- Capacitor Filesystem: https://capacitorjs.com/docs/apis/filesystem
- Capacitor Share: https://capacitorjs.com/docs/apis/share
- Capacitor App navigation: https://capacitorjs.com/docs/apis/app
- Tauri dialog and filesystem scopes: https://v2.tauri.app/plugin/dialog/ and https://v2.tauri.app/plugin/file-system/
  Official plugin source confirms selected dialog paths are added to filesystem scope.
- Microsoft native WebView2 automation: https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/playwright
- Playwright Android/WebView automation: https://playwright.dev/docs/api/class-android
  Experimental emulator support is not a substitute for Samsung/physical-device testing.

These are technical preparation references, not legal approval or proof that a
console registration/signing step has been completed. Recheck requirements and
account-specific portal validation before the final submission.

Compatibility floor: iOS/iPadOS 15.4. The shared UI uses native HTML dialog and Array.prototype.at; Apple's Safari 15.4 notes identify their introduction. This is a configured minimum, not a claim of physical-device acceptance on every supported version.
https://developer.apple.com/documentation/safari-release-notes/safari-15_4-release-notes
