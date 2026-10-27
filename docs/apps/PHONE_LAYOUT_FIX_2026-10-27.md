# Phone layout correction — 27 October 2026, build 3

Owner-provided physical Android portrait screenshot rejected the previous layout:
the fixed preview/status bar covered part of the website navigation, the landing
hero occupied excessive phone height, and bottom navigation safety was unreliable.
The previous horizontal-overflow tests were insufficient evidence of usable phone
layout. Earlier test passes do not establish acceptance of this correction.

## Implementation

- One existing header now contains menu/back, application identity, search and
  settings/theme controls. It is sticky in normal document flow; there is no
  separately fixed preview banner or body padding calculation to overlap it.
- On the phone home screen, the main tool search replaces the duplicate header
  search; it remains available in the header on other routes. The home toolbar
  is verified to fit a single compact row.
- App/version information is compact. Status text and install/update controls
  sit in normal flow below navigation. Operational notifications use the existing
  toast with safe bottom spacing and no pointer interception.
- Use Capacitor 8's injected `--safe-area-inset-*` values with standard environment
  fallbacks, including status bar, display cutout, side insets and Android bottom
  navigation. Header measurements affect scroll targets/menu bounds only.
- Phone landscape remains in phone navigation even above the old 900px desktop
  threshold. Short landscape viewports use a single toolbar row and two-column
  home content. The phone hero has natural height and smaller typography.
- Do not hide horizontal overflow to make a width test pass. The page keeps one
  content scroll surface. Sidebar navigation and transient search suggestions
  retain their necessary bounded scrolling, with no content made inaccessible.
- The top profile shortcut on phone is available through the existing sidebar;
  the theme and settings controls remain directly accessible. Existing formulas,
  calculator engines, production website styling and Worker code are unchanged.
- The legacy provider ONLINE indicator is not shown in this local-only candidate;
  the app does not infer service reachability from a WebView's connectivity hint.

## Verification contract

`tests/helpers/app-layout.cjs` checks actual control rectangles, safe viewport
bounds, 44px touch targets, center-point hit tests (covered controls fail), useful
working height and scroll-to-control visibility below the sticky header.

The three-browser app suite runs 26 viewport profiles: 320×568, 360×640, 384×832,
412×915 and their landscape equivalents, plus tablet/desktop profiles through 3440×1440, small 1024×600 laptops,
1280×720/800, 1366×768, 1536×864, 960×540 effective viewports and breakpoint
boundaries at 900/901 and 1199/1200/1201 pixels. It checks
five representative routes in both existing themes, simulated status/navigation/
cutout insets, actual menu selection and reachable search/calculate/export buttons.
It also tests 125%, 150% and 200% CSS enlargement at representative
phone/laptop viewports. CSS zoom/effective viewport simulation does not establish
actual Windows display-DPI or hardware coverage. These simulated insets are not
represented as physical-device evidence.

The Android emulator suite rotates the real installed WebView portrait →
landscape → portrait. It verifies home/calculator/settings geometry, actual menu
selection and calculation, and captures OS-level screenshots for both orientations.
The native OS keyboard is also opened in each orientation and the focused input
must remain reachable above it. Existing clipboard, file sharing, system back and
offline cold-reopen checks remain.
Windows minimum window height is reduced from 600 to 240 logical pixels. Initial
window sizing uses the current monitor work area and scale factor, leaving room
for the taskbar and window decorations. The shipping window must fit the runner
work area, and the instrumented native window is resized to three real outer
sizes with the same geometry/hit tests. This is not a claim of physical multi-
monitor/DPI coverage. Numerical source/guard tests remain as regressions.

Local source/package/adapter checks run before committing. A browser could not be
installed in this container because its CDN archive was invalid; actual visual/
geometry evidence must come from CI, not a local browser pass claim. The new CI
artifact `layout-results.json`, per-browser `phone-layout-results.json` and native
`layout-portrait.png` / `layout-landscape.png` are the acceptance record. Inspect
those artifacts before accepting this build; physical Samsung/Android 17 rotation
and keyboard/accessibility remain owner-device acceptance rather than emulator proof.

## Test installation

Android versionCode is 3; application version stays 0.2.0. This is still an isolated
unsigned-release/debug test candidate. Download the new CI debug APK, not the older
build-2 links. Different ephemeral CI debug keys can prevent an in-place upgrade.
If Android reports a certificate conflict, export any important local data first,
uninstall the old Preview and then install the new debug APK. Store signing and
production identities remain separate approval gates. No merge, production deploy
or store publication is authorized by this correction.
