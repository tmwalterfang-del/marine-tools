# Website privacy change for owner review — 27 October 2026

Status: policy text remains DRAFT. The owner subsequently authorized the isolated
website implementation/deployment in PR #45. Public deployment still needs verification;
no store upload or app-stack merge is authorized.
This branch starts at main `6e10a5017428373079cdce26f0fb19175565bb20`.
It does not depend on Education #35, app #42/#43 or security #40.

## Concrete change

- Add the static directory document `privacy/index.html`, its local stylesheet,
  and the single editable English source `privacy/policy.fragment` from #44.
- Reuse that text in existing Privacy & Data through `privacy-policy.js`.
  The only app.js change is the privacy renderer. Preserve main's Education and
  professional links, settings, calculations, providers and analytics behavior.
- Extend the existing service-worker shell with the policy assets and explicit
  `/privacy` alias handling that serves the canonical cached document when the
  origin is unavailable. Static hosting redirects to `/privacy/` online. Rotate only the relevant asset/cache identifiers.
- Limit the generator to the website outputs because main has no native app tree.
  LF attributes make byte-parity checks reproducible on Windows and Linux.
- Correct one inherited wording error: Suggestions uses email; Survey uses Tally.
  Synchronize this correction with the app branch before selecting another APK.

The source and generated page remain visibly marked as a draft. The complete
review text is in `privacy/policy.fragment`; do not edit generated copies.
Unknown legal bases, account settings, retention and transfer arrangements cannot
truthfully be replaced with an approved final statement yet.

## Verification

Local automated engines: Chromium (Microsoft Edge), Firefox and WebKit on Windows.
Eight profiles: 320×568, 568×320, 412×915, 915×412, 768×1024, 1024×768,
1366×768 and 2560×1440. Direct directory routing, refresh, no JavaScript,
complete text, section navigation, local-only page assets and horizontal fit
passed. The viewport screenshot was visually inspected.

Existing website navigation, retained profile/preferences, analytics opt-out,
an actual JSON backup download and independent air-clearance references
(3.20 m at default inputs, 2.70 m with 1.5 m margin) passed. Actual service-worker
installation and `/privacy` navigation/refresh with the origin stopped passed
in all engines. Chromium additionally passed browser offline emulation. Firefox/
WebKit offline emulation bypassed the initial controlled navigation; the test
therefore uses a genuinely unreachable origin for those engines. Generated parity
and syntax passed. Navigation smoke and release metadata are also checked.

Reproduce:

```sh
node scripts/build-privacy.mjs --check
node tests/privacy-main-browser.cjs chromium
node tests/navigation-smoke.mjs
node tests/qa-release-metadata-20261018.mjs
```

The browser test requires Playwright (`NODE_PATH` can point to its installation).
`MT_QA_BROWSER_PATH` optionally selects a local Chromium executable. Read-only
CI checks run Chromium, Firefox and WebKit independently and save screenshots
and JSON reports on Windows runners, avoiding the stalled Ubuntu dependency
installation. Inspect actual CI results; a workflow definition is not a pass.
Cloudflare email_off markers preserve contact links without a decoding script;
see [Cloudflare documentation](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/).

Read-only unauthenticated HTTPS GET still returned **404** for the production
`https://www.marinetools.app/privacy` in this continuation. Local/CI results
are not production publication evidence. No physical Android device was tested.

## Facts established without owner input

Evidence checked on 27 October 2026; provider documentation describes its product,
not a complete inspection of the owner's configuration.

| Processing | Confirmed evidence | What remains unknown |
|---|---|---|
| Website events | Both Wrangler configurations bind Analytics Engine dataset `marine_tools_usage`. Cloudflare documents three months of Analytics Engine storage. | Deployed bindings, any copied/exported events, query exports, separate logs and deletion/request procedures. Three months is not a promise about every copy. |
| Worker logs | Cloudflare currently documents 3 days for Workers Free and 7 for Paid. This repository does not explicitly configure observability. | Actual plan, dashboard-enabled logging, sampling and Logpush/other destinations. Do not infer no logs from absent source settings. |
| GitHub Pages | GitHub documents visitor IP logging for security. | Account-specific retention and any Cloudflare layer in front of Pages. |
| Tally | Connected account lists the published Marine Tools survey `5BWVZQ`. Read-only form inspection finds optional free-text answers and hidden `utm_source`, `utm_medium`, `utm_campaign` fields. No response contents were read. | The returned settings show redirect/progress configuration, with no retention or email-notification configuration shown. Omission alone does not prove a particular plan or deletion schedule. |
| Tally vendor retention | Tally documents form-creator control, optional Business retention settings and a 90-day Trash period after deletion unless emptied earlier. | Actual configured duration, exports/integrations and whether the owner's deletion procedure empties Trash. |
| Tally roles/transfers | Tally describes itself as processor for form responses, an account-terms DPA for professional users and European form-data storage. Optional email notifications use a US provider according to its subprocessor list. | Applicable account terms, enabled notifications/integrations and actual transfer assessment. EU primary storage does not establish that no international processing occurs. |
| Cloudflare contracts | Cloudflare publishes a customer DPA with transfer provisions. | Evidence that the applicable account/customer accepted the relevant terms and which services/subprocessors/transfers apply. |
| Support email | Public MX records route `marinetools.app` through Cloudflare Email Routing. | The forwarding destination, mailbox retention, backups, who monitors requests and response/deletion procedures. DNS and messages addressed to the alias do not prove monitoring. No test email was sent. |

Sources:

- [Analytics Engine limits/retention](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection)
- [Tally GDPR/roles/DPA/subprocessors](https://tally.so/help/gdpr)
- [Tally deletion/Trash](https://tally.so/help/how-to-delete-and-recover-form-data)
- [Tally configurable retention](https://tally.so/help/submissions-data-retention)
- [Cloudflare customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/)

The Windows browser-control and Node REPL helpers failed at initialization with
`CryptUnprotectData failed: 2148073483`. Terminal work succeeded outside that
broken sandbox. No Cloudflare dashboard login/settings inspection is claimed.
The connected Tally tool does not expose a dedicated raw retention-account read.

## Approval and publication gates

The owner explicitly chose to retain **only** `app.marinetools.preview` for now.
Do not assign/reserve a production package identity or infer store authorization.

Before approving final wording, establish actual log/export retention, Tally
deletion/notification settings, email retention/monitoring, applicable vendor
contracts/transfer arrangements and the lawful basis/consent for website tracking.
The current default opt-out is not evidence of prior consent; #40 is separate.

Review this small main-based diff independently. After explicit approval of its
final text and named deployment, the person doing deployment must verify public
HTTPS `/privacy` unauthenticated, fresh-storage, refresh and no-JS access. Check
actual edge injection/access/geographic rules as well. Do not deploy the app and
Education stack merely to make this route public.

Google references reviewed again:
[User Data full policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
and [Data safety form guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
Local-only inputs are distinct from controlled browser flows. Pseudonymous IDs
and ephemeral off-device processing must still be assessed; required disclosure
and affirmative consent belong in normal app use when the policy requires them.
Do not submit a blanket no-data answer before the final signed app and owned
browser flows are verified. No declaration or form was submitted.
