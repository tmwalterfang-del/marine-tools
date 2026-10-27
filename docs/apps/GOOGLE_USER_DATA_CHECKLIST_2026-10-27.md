# Google Play User Data — requirement-to-evidence checklist

Reference: the Google Play Console Help “User Data” page supplied by the owner,
https://support.google.com/googleplay/android-developer/answer/10144311?hl=en,
full policy reviewed 27 October 2026. Summaries/Key Considerations do not override
the full text. This is an engineering compliance checklist, not Google approval
or a declaration submitted to Play Console.

| Full-policy requirement | Implementation/evidence | Assessment / outstanding work |
|---|---|---|
| Transparency and purpose limitation | Single English source privacy/policy.fragment, actual storage/network inventory in PRIVACY_AUDIT_2026-10-27.md | Implemented draft; controller must approve exact purposes/bases and provider processing |
| Responsibility for third-party SDK/code | Locked Capacitor and WebView integrations; no enabled telemetry/ads/crash collector found in local candidate; owned Custom Tab flows explicitly included in review | Final signed SDK/native/network inventory and provider contractual practices not fully verified |
| Personal/sensitive data limited to expected functionality | Local-calculator entry/storage; exports/copy/share on user action; no location/contacts/camera/mic permission requested | No blanket finding that user-entered vessel/operational data cannot be personal or sensitive |
| Secure transmission | HTTPS external links; restrictive app CSP; Android cleartext disabled in inspected build-3 manifests, build-4 inspection in CI | Transport controls do not prove encrypted local storage or independently certified security |
| Runtime permission before gated access | No sensitive runtime permission added; file selection/export uses system facilities | Recheck final merged manifest and SDK requests before release; a future GPS feature requires its own assessment |
| No sale of personal/sensitive data | No sale path found in reviewed application code; deliberate user share is separately described | Owner must confirm commercial/provider arrangements; no unsupported certification of all vendors |
| Prominent Disclosure & Consent for unexpected sensitive access/use/sharing | Current candidate has no automatic app analytics upload; ordinary privacy text and explicit local-store/export explanations remain available | A privacy page, settings toggle or What's New dismissal is NOT a substitute for required normal-flow disclosure and affirmative consent. Any applicable controlled website/SDK flow must satisfy this before collection. No new collection authorized here |
| Consent before collection; back/home/outside tap is not consent | No new consent mechanism falsely claimed | Website source defaults analytics on; security #40's prior-consent work is separate/unmerged. This is a publication/compliance blocker, not resolved by clearer wording |
| Restrictions on finance/contacts/persistent device IDs/children | No IMEI/IMSI/SIM/advertising-ID collection or linking found in local app SDK/manifest/source; no contact publishing | Website UUIDs are pseudonymous; do not confuse them with proof of anonymity. Adult audience listing remains a proposal; owner completes audience/rating accurately |
| Data Safety complete, accurate, consistent with policy | Separate conditional questionnaire table in PRIVACY_AUDIT_2026-10-27.md; website and app scopes differentiated | Overall “no data collected” is NOT final while owned browser/support/auth flows remain unresolved. No questionnaire submitted |
| Privacy policy public, active, non-geofenced, HTML, not editable by users | Static /privacy/index.html with complete content, no JS/PDF/login requirement; existing website Privacy & Data and app use same source; generator parity test | Production /privacy returned 404. Draft wording and public access not approved/verified. Local/CI test is not a production pass |
| Developer/app identification and privacy contact | Marine Tools, Walterfang Design, source organisation number, contact@marinetools.app | Owner confirms current controller/contact details and monitored request procedure |
| Retention/deletion and security procedures | Local clear/backup/export controls and temporary Android file cleanup described; server-retention unknowns explicit | Confirm Analytics Engine, edge/API logs, form/mail/backup retention and manual/technical request procedures before final policy |
| In-app privacy access | Existing Settings/Project navigation opens full shared text; permanent public URL routed through platform browser adapter; offline copy bundled | Browser integration test plus build-4 binary inspection; final signed device test remains outstanding |
| Account deletion where account creation is offered | Bundled calculators have no account creation; site/Access authentication is separate and explicitly flagged | Do not invent account-deletion functionality or automatically mark all external authentication out of scope; inspect final enabled flows |
| App Set ID | No App Set ID collection/use found in inspected app dependencies/adapters | Recheck if SDKs added; do not repurpose a future identifier for advertising without policy review |
| Applicable privacy/transfer law and Google-supplied EEA/UK/Swiss information | GDPR rights/contact and Norwegian tracking-consent review included; no claimed DPA, adequacy or SCC arrangement | Provider/transfer legal mechanisms and any future Google-supplied user-data flow require controller verification |

## Release decision

NOT READY for an approved Google Play privacy declaration/public release.
Technical route/text integration is implemented in a Draft PR. A usable Google
privacy URL requires owner-reviewed final wording, resolved retention/consent/
provider facts, explicit production deployment approval and a real anonymous
production HTTPS test after deployment. No upload, merge or deployment occurred.

Website identifier nuance: the 180-day browser-ID age check is performed when
the collector initialises its in-memory browser record; a long-lived open page
can keep that in-memory identifier. This is a client renewal threshold, not a
server deletion promise. Visit inactivity is checked on collector context use.
