# Remaining release acceptance – 18 October 2026

Candidate: v8.7.0-rc.1, PR #34. Preview-only authorization remains in effect. Do not merge or publish until the outstanding gates are completed or explicitly accepted by the owner.

## Live browser network audit

After the bot confirms the deployment URL for the exact SHA, open `/tests/qa-live-audit.html` on that confirmed Pages preview. This page runs only on the Marine Tools frontend preview project. Its iframe loads the real app with `?qa-audit=1`; no response fixtures are installed.

1. Exercise Profile, Voyage Estimate, the five Lab tools, Weather and Route Intelligence in the embedded app. Add two synthetic waypoints, analyze, then repeat in both themes.
2. Click **Run API guard checks**. Expect 8 PASS: isolation, health, auth and release 200; admin and analytics 403; other writes 405; unknown path 404.
3. Expect the preview/analytics headers, the exact permitted Pages origin, credentials=true and Vary: Origin. Only these non-secret diagnostic headers are exposed to the already-approved QA origin; no additional origin or method is authorized.
4. Refresh the summary. Inspect actual AIS status/provider and all observed production attempts. Zero production attempts is required for the exercised flow. An attempt blocked by the diagnostic is a failure, not a PASS.
5. Save only sanitized summary/records. No raw HAR containing cookies, authorization, request bodies, URL query strings or vessel records should be exported.

The in-page audit covers early fetch, XHR, beacon and ResourceTiming in that app frame. It is not a protocol-level HAR, proof about every possible flow, service-worker internal traffic, or another tab. Do not describe a local simulated-origin audit as this live test.

For a browser environment exposing Playwright network events, run `tests/qa-live-network-20261018.mjs`. Supply the confirmed URL through `QA_URL`; optional `QA_INTERACTIVE=1` lets the operator authenticate in their own headed browser before continuing. No sessions are imported/exported. Use `QA_PLAYWRIGHT_MODULE` / `QA_CHROMIUM` as in the other QA tests. If the app cannot be reached, preserve BLOCKED; do not bypass Access or forge Origin.

## Dedicated AIS access for this QA preview

The last observed QA status was AIS configured=false/authenticated=false and globalAisConfigured=false. A successful empty result is not proof of live CPA.

Use dedicated authorized QA provider credentials. In the existing named Worker Preview, configure `BW_AIS_CLIENT_ID` and `BW_AIS_CLIENT_SECRET` for BarentsWatch. `PELYR_API_KEY` is optional for authorized global/open-source coverage and requires the provider's account, permission and license conditions. Do not copy production secrets, store credentials in Git/frontend/vars, or enable analytics bindings to make this test work.

Cloudflare's native Preview configuration is separate from production. Secrets can be scoped to an existing Preview; changing Previews Base affects new Previews rather than retroactively configuring the existing one. Use the named preview `feature-qa-integrated-preview-20261015`, not a production deploy command. If using an authorized local Wrangler session (4.135.0 or later), the documented interactive command is:

```sh
cd worker
npx wrangler@4.135.0 preview secret put BW_AIS_CLIENT_ID --name feature-qa-integrated-preview-20261015
npx wrangler@4.135.0 preview secret put BW_AIS_CLIENT_SECRET --name feature-qa-integrated-preview-20261015
```

The CLI prompts privately. Never put values on a command line or in chat. A user can instead enter existing QA credentials privately in the preview's Cloudflare settings. This is configuration guidance, not a record that credentials were installed.

Primary source: https://developers.cloudflare.com/workers/previews/configuration/ .

## Live AIS / CPA acceptance

- Confirm authenticated=true before interpreting target results.
- In a supported area containing actual traffic, observe at least one target. Check provider/source, permitted attribution, target timestamp and whether it is fresh under the app's experimental threshold.
- Use the same synthetic own-vessel route/speed and one fresh target's position/SOG/COG to independently calculate CPA/TCPA. Compare units, sign/time convention and displayed rounding. Record only the minimum non-sensitive test evidence; do not claim simulated numerical fasits are live acceptance.
- Verify a real empty search separately, plus unavailable/recovery states and expiry. Existing local fixtures already cover these logic cases.
- If no actual target is returned, mark real-target CPA BLOCKED/NOT TESTED, not PASS. If the actual provider cannot be used, ask the owner to explicitly accept excluding experimental AIS before considering a reduced release.

## Physical device checklist – operator must execute

These checks cannot be replaced by emulation. Record actual device, OS/browser, date, SHA and PASS/FAIL; defaults remain NOT TESTED.

1. iPhone/Safari and Android/Chrome: portrait and landscape, open/close menu, reach all fields/buttons, no page-wide horizontal clipping.
2. Profile save → Voyage Estimate → all five Lab tools; verify values survive theme switching and rotation.
3. Scroll populated tables by touch and keyboard where available. Check focused controls and 200% native zoom; no hidden button or overlapping text.
4. Actual Weather map pan/zoom, coordinate entry and Route Intelligence map taps. Check scroll/zoom gestures do not trap the user.
5. VoiceOver/TalkBack or desktop screen reader: labels, dialogs, focus order, menu state and result announcements; manual contrast review in both themes.
6. Installed PWA: upgrade to the candidate, retain existing profile/log/curve/voyage data, and calculate offline. Do not clear real user data to obtain a PASS.

| Gate | Status | Evidence |
|---|---|---|
| Actual AIS provider access | BLOCKED pending QA credentials | |
| Fresh actual AIS targets / attribution | NOT TESTED | |
| CPA using actual target data | NOT TESTED | |
| Live scoped browser network audit | Pending deployment and execution | |
| Physical iPhone/Safari | NOT TESTED | |
| Physical Android/Chrome | NOT TESTED | |
| Screen reader / manual contrast / native zoom | NOT TESTED | |
| Physically installed PWA upgrade | NOT TESTED | |

“What’s New” is prepared as an explicitly labelled release candidate. Before a future public release, choose the final version/date, update the shared metadata and verify the same popup/history and cache upgrade again. Do not state that rc.1 was already publicly released.
