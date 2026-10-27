# Privacy & Google Play audit — 27 October 2026

## Decision and scope

Dedicated `feature/privacy-policy`, based on Android Draft #43 at
f961a2eb2b4b543ce2c7dc8834c928d02235bef6, carrying Education #35 at 0034688.
Security Draft #40 at 314e5bf remains separate/unmerged; its consent, verified admin
JWT, self-hosted map and widget-removal changes are NOT credited to this branch.
Unfinished update hardening on feature/app-update-hardening is also excluded.
No formula, collection payload/default, Worker source, production deployment or
API configuration changes. Existing local controls remain.

## Production observation

Unauthenticated HTTPS GET on 27 October: `https://www.marinetools.app/` returned
200; `https://www.marinetools.app/privacy` returned 404 with GitHub Pages error
HTML behind Cloudflare. This is an actual production failure, not a preview
inference. Public root includes usage-analytics.js, support-widget-v857.js and
Cloudflare email-decoding injection. Edge metadata contains Cloudflare reporting
configuration; full account-level telemetry/log settings are not known.

No public production privacy success is claimed. A directory document
`privacy/index.html` supports GitHub Pages and Cloudflare Pages static directory
routing (`/privacy` may redirect to `/privacy/`). No `_redirects`-only assumption,
SPA state, JavaScript, login, PDF or download is required. No server authentication
or geography rule is introduced. Actual global/non-geofenced accessibility must
be verified after approved deployment; this container's request is one vantage
point, not a global access test.

## Single policy implementation

`privacy/policy.html` is the ONLY editable English policy content. The generator
`scripts/build-privacy.mjs` produces the complete static `/privacy` document,
`privacy-policy.js` for the existing `renderPrivacy()` and the app/store offline
copy. The generator's `--check` rejects stale copies. Policy presentation reuses
Marine Tools branding/panels, with responsive shared CSS and visible sections.
The old Privacy & Data navigation and `?page=privacy` remain; no independent
contradictory app policy is maintained. Native app fragment links scroll within
the current policy rather than corrupting app page history.

Store URL/config: `https://www.marinetools.app/privacy`. Android source integration
uses the existing system-browser platform adapter and a bundled policy copy.
Configuration versionCode increases from 3 to 4; old build-3 APKs do not include
this work. No signing key/production ID is added. Public text is prominently a
DRAFT until the owner resolves the explicit publication blockers. It must not be
submitted as an approved final policy.

## Verified source data inventory

| Feature | Local/remote behavior | Evidence and limitation |
|---|---|---|
| Website workspace | `mt.profile`, `mt.route`, `mt.theme`, `mt.lastAnalysis`, `mt.settings`, favourites/history/recent, consumption/bunkering/weather | app.js K/store + export/import/clear handlers; no automatic account sync found |
| Profile v2/energy | `mt.profile.v2`, energy rows, workflow settings/visited marker | product-v860.js K/local JSON helpers; explicit exports can leave device |
| Voyage Estimate | Last estimate and user curve local; public route/port/dataset downloads | voyage-estimate-v861.js; voyage-planning-draft-v1.js; local route calculation, providers receive download requests |
| Weather/API | selected lat/lon in GET to Worker; Worker forwards to MET/BarentsWatch; local weather cache contains selected point | app.js weather handler; worker/worker.js weather/forecast code. Coordinate query URLs may appear in infrastructure logs |
| Experimental route | route JSON (including waypoint information) sent to Worker for forecast sampling; last analysis local | app.js refreshLive; worker routeSamples. Cannot claim all route data remains local |
| AIS | bounds sent to Worker; base Worker retrieves provider AIS then locally filters bounds | app.js API latest + worker latestAis; provider configuration in dashboard wrapper needs deployed verification |
| Maps/CDNs | OSM/OpenSeaMap tile-area requests; unpkg Leaflet; esm.sh/jsDelivr route assets; Sodir public datasets | app.js/weather-map-v854.js/voyage-estimate-v861.js. Client request metadata reaches services |
| Website analytics | event/page/tool/device/version/visible time, browser UUID, visit UUID, source category, return marker and labels | usage-analytics.js, app.js sendAnalyticsEvent, product hooks; worker usage/product allowlisted fields |
| Analytics controls | default enabled, settings opt-out, exclusion, DNT/environment guards; browser ID 180 days, visit inactivity 30 minutes | source defaults and collector logic. These are client expiry intervals, NOT server deletion guarantees; not prior consent |
| Analytics backend | Cloudflare Analytics Engine binding in root/worker wrangler configs | writer stores no IP field, but request/IP processing by edge/providers remains. Deployed logs/retention/DPA not accessible |
| Forms/support | Tally form links, mailto support, Buy Me a Coffee widget automatically loaded; LinkedIn link | app.js + support-widget-v857.js. Form responses/mail retention and actual vendor contracts unknown |
| Education | website origin local study scenarios/drafts; protected preview Access separate | Education remains external, not in public calculator package. Authentication logs/cookies/provider account controls unverified |
| App inputs | fixed tool raw inputs/drafts, last page/settings/history local | apps/shared/app-drafts.js/app-shell.js; storage quotas/errors handled. No encryption claim |
| App export/share | mobile private cache then share chooser; old cache files >24h cleaned on later startup; Windows Save As; explicit clipboard write | platform-entry.js/core.mjs. Recipient copies/backups not erased by app clear |
| App network/permissions | production API/analytics disabled, restrictive CSP; Android internet + internal signature receiver permission in build-3 inspection | stage-app.mjs/config, merged package report. No camera/location/contacts/mic/ad-ID/broad-storage request. Reinspect build 4 |
| App SDKs/crash | Capacitor core/App/Browser/Clipboard/Filesystem/Share; Tauri dialog/fs/clipboard/opener; no crash/ads analytics uploader found | package-lock + native adapters; final signed SDK inventory/physical flows remain release gates |
| External app browser | Android Browser.open uses browser Custom Tab; Windows system opener | @capacitor/browser Android source. Browser cookies/site processing may apply, including owned Education; do not blanket-classify as unrelated open web |

## Retention, security and law

No Analytics Engine event deletion/retention configuration, mail retention, form
response retention, Cloudflare/GitHub log duration, backup policy or signed
processor/transfer agreements can be proven from this repository. The base
Worker uses some five-minute in-memory forecast validity checks, not guaranteed
deletion after five minutes. Token cache contains service credentials in memory;
no production secrets enter app packages. Current backend security approval
remains separate (#40); this privacy route is not a security remediation.

Draft describes GDPR rights and contact/controller identity already present in
project source. It does NOT invent a completed legitimate-interest assessment,
consent record, DPA, transfer safeguard or server retention period. Norwegian
cookie/local-storage consent rules require review of optional tracking; default
opt-out collection is a blocker, not a consent claim. Owner must confirm actual
processing purposes/bases and approve exact retention criteria/periods before
removing the draft banner.

## Google Play Data Safety recommendations (not submitted)

Assess the exact signed Android release, including owned external browser flows,
not the website's entire feature list or only permission names.

| Form topic | Evidence-based proposed treatment | Remaining condition |
|---|---|---|
| Local calculator/profile/draft/history | On-device-only processing does not by itself count as collection off device | Verify final binary and complete flows; exported files may contain user data |
| App analytics, advertising ID, crash upload | No enabled collector found in local candidate | Recheck SDK changes/signed APK; no unconditional claim for website |
| User sharing/export | User-initiated transfer may meet Google's user-action sharing exception | Confirm user reasonably expects recipient; do not apply to automatic transmissions |
| Owned Education/website in browser facility | Must assess all actual transmitted site identifiers/interactions/positions/auth data | Cannot automatically mark “no data collected” merely because a browser is opened |
| Device/other IDs | Website browser/visit UUIDs can be device/other IDs for form purposes if in scope | Identify actual app flow and Google definition before final answer |
| App interactions/diagnostics | Website events include interactions and invalid outcomes; no app crash logger | Attribute only enabled/in-scope flows, with analytics purpose where applicable |
| Location | Bundled app has no live weather/GPS; website selected coordinates can be sensitive location | If enabled from controlled app flows, assess precise/approximate based on actual data, NOT just GPS permission |
| Name/email/support/form data | Local vessel fields are not automatically transmitted; voluntary mail/form content can identify people | Review configured support/owned web flows and recipient processing |
| Collected/shared overall | NOT FINAL. Local-only source supports no automatic app telemetry, but external controlled flows unresolved | Owner approves full data inventory before answering overall question |
| Encrypted in transit | Links use HTTPS and Android cleartext disabled; local data is not claimed encrypted | Confirm every final remote SDK/flow; don't convert transport evidence to at-rest claim |
| Deletion/account creation | No app account creation for local calculators; local clear/export controls exist | Protected site authentication is separate; verify if actual release permits account creation; server request procedure needed |
| Independent review/security certification | No supported certification claim | Do not tick a verification badge without an eligible independent review |
| Privacy URL | Use https://www.marinetools.app/privacy only after approved publication and successful public test | CURRENTLY PRODUCTION 404 and policy draft |

Microsoft Store can use the same URL/policy. Win32 privacy requirements apply;
Windows full-trust packaging, file dialogs and local data scope are disclosed.
No Microsoft declaration or app submission performed.

## Test record

Local source syntax/package/42 adapter checks passed after moving the old inline
privacy assertion to the shared policy source. Deterministic privacy DOM test
covers generated parity, no script/iframe/accordion form, all headings/fragments,
existing `?page=privacy`, analytics and exclusion controls, profile/settings
preservation and URL consistency. Existing core/source/navigation/309 worked-case
regressions run separately. Real browser responsive/direct-refresh/app-link
results belong to the dedicated privacy CI run and must be inspected before
crediting passes. Physical Android/Windows/keyboard/accessibility audit is not
represented by DOM tests. No production `/privacy` success is claimed.

## Approval and production verification

1. Resolve owner legal/operational confirmations above and separate consent work.
2. Review the exact generated English policy; change only privacy/policy.html,
   regenerate and keep parity checks. Remove draft banner only when true.
3. Explicit owner approval to merge and deploy the named privacy revision.
   Deployment uses the existing production host, not the protected preview origin.
4. Without credentials, GET /privacy, follow any /privacy/ HTTPS redirect, confirm
   200 HTML/full policy from multiple regions/devices and no Access/geofence/PDF;
   refresh with new browser storage and disabled JS. Check response/caching and
   Cloudflare injected scripts/logging against policy.
5. Verify in final signed Android release and actual device; reconcile Data Safety,
   approve the declaration, then separately authorize Play upload/submission.

No merge, deployment, legal publication or store declaration was performed.

## Authoritative review references

- Google User Data, privacy policy and Data Safety consistency:
  https://support.google.com/googleplay/android-developer/answer/10144311?hl=en
- Google's collection/sharing, WebView, on-device and user-action definitions:
  https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
- Datatilsynet, Norwegian cookie/similar technology consent:
  https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/cookies/
- Microsoft Store 10.5 privacy requirements (effective 22 October 2026):
  https://learn.microsoft.com/en-us/windows/apps/publish/store-policies

Google requires an active public non-geofenced HTML policy URL and in-app access.
A passing local/preview test does not satisfy that public-production requirement.
