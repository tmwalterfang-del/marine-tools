# Android and privacy continuation — 27 October 2026

## Release boundary and owner instructions

Continue Android/Google Play. Windows remains paused; other platforms are outside
this work. The owner explicitly chose **only app.marinetools.preview for now**.
The existing proposed production ID is historical/unverified and is not selected,
reserved or configured as a production identity by this continuation.

The owner subsequently authorized implementing/publishing the isolated `/privacy`
change now. That authorization concerns website PR #45 only. Verify its actual
merge/deployment and public result separately; it does not authorize an Android
upload, Google declaration, signed store release or app/Education-stack merge.

## Candidate and verification changes

- Prepare Preview 0.2.0 / build **5**. Correct the shared policy's statement about
  Suggestions: Survey uses Tally; Suggestions opens email. This matches the text
  in the isolated main-based website PR #45. No calculation formula changes.
- Replace the failed native text selector for the HTML startup button with
  WebView pointer input after positive viewport/visibility checks. An Android
  native text selector could not locate that HTML button in the previous run.
- Bound the native probe and cleanup. A failed assertion must produce evidence
  and exit nonzero instead of hanging until the whole emulator job is cancelled.
- Add privacy-workflow Android emulator acceptance without Windows/Apple builds.
  Rebuild exact prior source `3c68ecda1908ec3d9e96228f0b9a813916a43ad9` (build 4)
  and current build 5 in one CI job. Compare verified public APK certificates.
  Install the rebuilt baseline, exercise native flows, then install build 5
  with `adb install -r`, preserving a 1.5 m input and recalculating 2.70 m offline.
- Verify final package configuration/build number and exact policy bytes in APK
  and AAB, plus manifest identity/version, disabled backup and cleartext settings.

This tests an **ephemeral CI debug key** shared by these two newly built APKs.
It does not prove production signing readiness or guarantee an upgrade from the
previously downloaded build-4 APK, whose debug certificate can differ. The prior
build-4 download remains the previous artifact; do not call it build 5.

The native probe covers portrait/landscape/portrait, real IME appearance and input
reachability, menu navigation, native clipboard, share chooser/private exported
file contents, system Back, background/cold restart, offline calculation and the
bundled policy. A receiving app's saved file, accessibility certification, small/
large native devices and Trygve's physical phone still need separate acceptance.
Existing browser layout tests are not physical-device approval.

Source checks passed locally: 32 syntax checks, isolated public-only package and
42 adapter/guard checks. New native build/device/upgrade results must be read
from CI; no pass is inferred from adding this workflow.

## Retention/provider follow-up

The owner asked us to investigate actual arrangements. The read-only connected
Tally account exposes the published Marine Tools survey. Its returned ledger
shows redirect/progress settings, optional text fields and UTM hidden fields,
but no explicit retention configuration. No submissions were read or changed.

Public DNS uses Cloudflare Email Routing. Targeted Gmail metadata searches did
not establish inbound forwarding/monitoring for the support alias. Addressed or
sent messages are not proof of a monitored privacy-request mailbox. No email
was sent. Mailbox retention and backup/deletion arrangements remain unverified.

Cloudflare documents three-month Analytics Engine storage; that narrows the
earlier blanket unknown but does not establish retention of exported copies or
other logs. Deployed logging, contracts/transfers and the actual Tally deletion
schedule still need account evidence. Windows browser-control initialization
failed with `CryptUnprotectData failed: 2148073483`, so no authenticated Cloudflare
dashboard inspection is claimed. Repository and provider evidence, links and
remaining account checks are recorded in
[the website review report](https://github.com/tmwalterfang-del/marine-tools/blob/feature/privacy-main-review/docs/PRIVACY_MAIN_REVIEW_2026-10-27.md).

## Data Safety worksheet — do not submit

Reviewed against Google's current
[User Data full policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
and [Data safety guidance/form](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
This is a source-based worksheet, not a completed Play Console declaration.

| Form area | Current evidence and conditional answer | Release evidence still needed |
|---|---|---|
| Any data collected/shared | Bundled calculators have telemetry/API disabled and local drafts. Do not select a blanket No yet. | Final signed binary and all permitted owned online flows. |
| Device/other identifiers; app interactions | Website uses pseudonymous browser/visit IDs and page/tool events, enabled by default. | Controlled browser flow inclusion and actual online network behavior. |
| Location | Local calculations do not transmit input coordinates. Website weather/route/AIS use selected points/bounds. | Enabled app-linked flows; distinguish selected maritime points from user/device location. |
| Personal information/authentication | Local calculator has no account creation; external protected Education uses separate authentication. | Final app-access behavior, configured identity provider and applicable account deletion. |
| Files/documents and sharing | User explicitly chooses clipboard/export/share; native export uses scoped private cache. | Confirm expected user action and actual recipient; do not apply the sharing exception to automatic requests. |
| Ephemeral processing | No blanket exemption for coordinate/API traffic or network logs. | Actual retention of each transmitted item, including infrastructure and exports. |
| Encryption in transit | App cleartext is disabled; permitted external links use HTTPS. | Whole final flow and SDK traffic before a universal Yes. Local-storage encryption is a separate claim. |
| Deletion | Local clearing controls exist; they do not delete server events/forms/mail/recipient copies. | Working request channel, identity matching and actual deletion procedures. |
| Independent security review | No certification established. | Do not claim one. |
| Optional/required; purposes | Determine per confirmed data type and flow. | Do not invent final flags from permission names alone. |

Google exempts exclusively internal-track apps from the Data Safety form's
inclusion requirement; closed/open/production tracks require it. This does not
waive privacy or other policy obligations or authorize an internal upload.

The platform adapter permits HTTPS destinations generally except listed
Tally/Buy Me a Coffee hosts; it is not a strict own-domain allowlist. Website,
contact/provider links and protected Education must therefore be exercised in
the final app. Browser Custom Tabs do not by themselves prove an open-web
exception for developer-controlled content. Required prominent disclosure and
affirmative consent cannot be replaced by the What's New button or policy text.

## Signing and internal-track preparation

Existing local release configuration remains available in
`apps/mobile/config/release.gradle` and `docs/apps/SIGNING_AND_BUILDS.md`.
No production private key was generated, imported or added to CI.

Keep upload keys separate from the Google-held app-signing key when using Play
App Signing. Keep private keystores/passwords out of repository, reports and
artifacts. Record public certificate fingerprints and backup custody through an
approved secure process. Production identity/signing decisions remain deferred.
References: [Android signing](https://developer.android.com/studio/publish/app-signing)
and [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en).

Listing text, branded graphics and reviewer drafts already exist in `apps/store/`
and the capture scripts. They remain drafts. Before any separately approved
upload, verify the public final policy, production identity, secure upload key,
reviewer access for any protected links, rating/content answers and physical
phone acceptance. No Google Play account or form was changed in this work.
