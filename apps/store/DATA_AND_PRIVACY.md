# App data and privacy assessment — DRAFT, 27 October 2026

Scope: isolated local-calculator candidate 0.2.0, not the public website, API,
protected Education site or future online app. Owner approval is required
before using these answers in any store questionnaire.

| Data / feature | Candidate behavior | Proposed disclosure / action |
|---|---|---|
| Calculator inputs, vessel profile, history | Local WebView/browser storage; fixed inputs can reopen unfinished | Explain local storage, clear controls and backup behavior; do not describe it as encrypted credential storage |
| File exports | User action; mobile writes a private cache file then opens system share sheet; desktop opens Save As | Users choose recipients/destinations; recipients' handling is outside app control |
| Temporary mobile export files | Private cache, cleanup of files older than 24 hours on later app start; OS may clear earlier | Do not promise durable storage until user saves a copy |
| Clipboard | Explicit copy/share fallback; write-only app capability | Clipboard is a system feature and can be visible to OS/other apps; do not claim private vault storage |
| Android backups | allowBackup=false | Device installation/data-reset testing still required |
| App analytics / crash telemetry / ads | Not enabled or bundled as collectors | Proposed app answers: no analytics/tracking data collection; verify final signed binary and any later SDK changes |
| AIS/weather / API authentication | Production API disabled; CSP denies production network | Do not claim an authenticated online service or completed backend security approval |
| Protected Education | Explicit external browser action, website authentication remains separate | Account/email handling belongs to that site's policy and must be considered in final app disclosures |
| Optional website/email links | User-initiated external browser/mail flow | Account for feedback/support information received outside the app; do not reuse a blanket website privacy answer |

No camera, microphone, precise location, contacts, advertising ID or push
permission is requested by the app source. File import uses the platform's
existing file chooser; there is no blanket storage permission. Inspect merged
Android permissions and third-party SDK behavior in
the final build, not only the source overlay.

For Google Data Safety and Microsoft Store privacy declarations, assess the final application and
its complete user flows, including external Education/support. The draft
local-only design supports no app telemetry collection, but a final "no data
collected" answer must be approved by the owner after the external flows,
privacy URL and SDK inventory are reviewed. Do not reuse these answers for an
online/analytics-enabled variant.

The public policy URL is https://www.marinetools.app/privacy. It was published
through isolated main-based PRs #45/#46 with explicit owner approval. The public
copy has no editorial draft or internal approval notes. Fresh unauthenticated
HTTPS access, refresh and no-JS rendering passed on three production viewports.
This does not complete the app's final Data Safety or signed-device assessment.

## 27 October privacy-route follow-up

Superseding policy source: `privacy/policy.fragment`; generated existing website,
standalone and offline app copies share the same revision. Public URL:
https://www.marinetools.app/privacy. The earlier 404 is superseded by the actual
production 200/no-JS verification after PR #46 on 27 October 2026.
See `docs/apps/PRIVACY_AUDIT_2026-10-27.md` for actual data inventory, conditional
Data Safety answers and unresolved account/legal questions. Public product copy
has no draft banner. Build 6 uses the current public text and adds Android
keyboard-focus handling; builds 4/5 contain the earlier editorial policy copy.
See docs/apps/CONTINUATION_ANDROID_PRIVACY_2026-10-27.md and the later delivery
record for exact build/test evidence. No store declaration was submitted.
