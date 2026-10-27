# Android / Windows changelog

## 27 October 2026 — focused development candidate

Base: app Draft #42 a9544ff, carrying Education Draft #35 0034688.

- Scope distribution CI, metadata, English listings and screenshot references to
  Android, Windows and the shared PWA; preserve upstream optional platform code.
- Fix app history cursor across Back/Forward and new navigation.
- Flush raw input drafts on document/native background lifecycle events.
- Reject malformed imported legacy vessel numeric fields before storage/rendering;
  adapter/import regression coverage increases to 42 checks.
- Clean MSIX staging on each build; include generated Android project in artifacts.
- Add reproducible shared source syntax validation and expanded viewport/theme
  and history regressions. Release-version and Android package checks follow the
  shared configuration. Formula engines and production settings unchanged.

Evidence and limitations: ANDROID_WINDOWS_DELIVERY.md. No merge, store upload or
production deployment is authorized by this changelog.
