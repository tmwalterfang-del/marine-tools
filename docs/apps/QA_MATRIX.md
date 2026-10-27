# Cross-platform QA matrix

Evidence must name an exact commit, runner/browser/device and artifact. A mock
adapter test does not prove that an OS share sheet or native save dialog works.

| Area | Automated evidence / approach | Remaining physical acceptance |
|---|---|---|
| Shared mathematical behavior | Existing 309 worked cases/299 expressions; 1,498-row context ledger; independent app clearance 3.20 m; existing whole-site source/DOM regression | Operational/vessel-specific review remains; no certification claim |
| Public PWA | Chromium/Firefox/WebKit, real backup download, clipboard adapter, app back, raw-input reopening, server-stopped fresh navigation | Browser installation/update/keyboard on actual devices |
| Android | Debug and release APK, release AAB; SDK 36, min 24; merged permissions/package inspection | Phone installation, screen keyboard, Android back/double-back exit, share/save/import, airplane-mode cold launch, update with same signing key |
| Samsung | Same universal Android implementation; no Google Play services dependency introduced | Galaxy hardware, Samsung Internet/WebView, tablet/landscape; Seller Portal signing and device compatibility |
| Windows | Native Tauri installer and MakeAppx-validated MSIX, explicit identity/publisher; scoped native capabilities | Signed MSIX and NSIS install/uninstall on Windows 10/11, WebView2 on clean machine, clipboard/native Save As, high DPI and keyboard |
| iPhone | Xcode simulator build, actual Simulator install/launch and screenshot; unsigned device archive | Signed iPhone installation/TestFlight, native share cache delivery, chooser, safe area/notch, back, interruptions and hardware accessibility |
| iPad | Actual Simulator install/launch screenshot where available; web tablet portrait/landscape | Signed iPad, multitasking/split view, software/hardware keyboard, rotation, share sheet |
| Education layout | Prior three-engine 15-module suite: natural frame height, 448 scroll checks, 153 draft/diagram checks, exports and eight viewport profiles | Real touch pinch/projector/native zoom; Education is NOT bundled/offline in candidate |
| Network failures | Public package works after server stopped; production endpoints denied; no live AIS/weather representation | Slow network, captive portal and external Education authentication on real devices |
| Accessibility | Native HTML controls, focus styles, keyboard zoom/back, text contrast, reduced motion | VoiceOver/TalkBack/Narrator, large system fonts, switch control and physical touch targets |
| Theme | Shared Dark/Bridge styling and web screenshots | Native status/nav bars, OS contrast themes and screen brightness on devices |
| Update / persistence | Content-hashed PWA cache, explicit apply-update flow; local drafts/history, version/build metadata | Store-to-store certificates, native upgrades, interrupted writes, uninstall retention/erasure, backup restore and PWA old/new worker transition |
| Native adapters | Contract/cancellation/path/size/protocol tests and successful native compilation | Clipboard/share/save/import completion on each OS. Never label compilation as completed interaction testing |

## Device test procedure (owner/testers; no programming required)

1. Record device, OS/WebView/browser version, build filename/source hash and theme.
2. Start offline after installation. Open a local tool and confirm no live-data claim.
3. Air clearance: 25 m - 0.8 m - 20 m - 1 m = 3.20 m. Try blank/invalid inputs;
   check that messages/results remain understandable and no value is silently assumed.
4. Change an input, reopen the app, recalculate and compare. Clear saved calculator
   inputs; verify that current values remain until you leave/reopen the tool.
5. Copy/share a result. Save a backup file, reopen it through the chooser and
   verify expected fields. Cancel each native dialog; no success should be claimed.
6. Test portrait/landscape, keyboard open/closed, long forms, wide tables, large
   font/zoom, keyboard-only navigation and screen reader.
7. Test menu/back/root-exit, external Education sign-in/return and network errors.
8. Install an upgrade signed with the same identity/key; verify local data and
   version. Uninstall; verify OS prompts and documented data behavior.
9. Record PASS/FAIL/UNVERIFIED per step with screenshot/log and reviewer, not an
   overall approval based solely on launch success.
