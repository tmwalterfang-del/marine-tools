# App security review — 27 October 2026

Scope: source and isolated candidate artifacts, not a penetration-test certificate
or verification of deployed Cloudflare account settings.

| Finding | Evidence / severity | Current action and remaining gate |
|---|---|---|
| Backend trust of assertion header | worker/worker.js adminAccessOk checks header presence; import chain reaches the configured dashboard Worker. High if edge protection is absent or bypassable; actual edge policy unverified | PR #40 separately introduces cryptographic JWT verification. No backend merge/deploy here. Candidate API and analytics stay disabled; no API credentials are bundled |
| Public resource abuse / rate bindings | Source configuration does not prove deployed Access/rate binding settings | Do not enable native online providers until PR #40 and isolated staging acceptance are completed |
| Native filesystem escalation | Dialog save grants a selected path; no general filesystem read/default scope or remote native capability is granted | Only dialog:allow-save and fs:allow-write-text-file, scoped by the actual user selection. Clipboard is write-only. Actual OS dialog acceptance remains to test |
| Untrusted link handling | Adapter rejects HTTP, file:, javascript:, credential-bearing HTTPS and non-support mailto | Explicit HTTPS links open outside the privileged local calculator UI. External browser visits have their own privacy implications |
| Imported backup corruption | App JSON import previously accepted top-level values with limited shape checks | App now rejects non-numeric legacy vessel fields before they can reach numeric input attributes, limits file size before reading and checks known object/array sections, depth, row count and unsafe prototype keys before confirmation/storage writes. Storage quota failure is still reported by existing import handling |
| Export paths / private cache | Adapter strips paths, limits names/types and 8 MB payloads. Android FileProvider originally covered external storage and all cache | Provider now exposes only private marine-exports cache. Temporary shares are retained for receiving apps; old files cleaned on a later launch |
| Script execution surface | Website contains inline bootstrap scripts and optional external support script | Staging extracts inline JS into self-hosted files, script-src self, no unsafe-eval, no automatic support widget, no frame or object content. Style inline remains for existing UI styling |
| Native IPC | Tauri requires local IPC transport | CSP permits only self and Tauri IPC schemes/localhost endpoint; production APIs remain blocked. No shell command or remote native origin permission |
| Platform permissions / backups | Android source disables cleartext and allowBackup. Cache export needs no broad storage permission | Inspect merged manifest and actual installed permissions. iOS OS backup behavior is not claimed disabled |
| Privacy manifests / telemetry | Filesystem timestamps and native settings are used; telemetry collectors are excluded/disabled | App privacy manifest included with technical reasons, SDK manifests still require final-binary review and owner approval |
| Secrets / release automation | No signing material or publisher account presumed; CI builds only | Read-only GitHub contents permission; no store upload/deploy step. Future signing/release environments need verified owner protection, not merely an environment name |

Dependency evidence: the first audit found three moderate development dependency findings through xcode/uuid. The xcode subtree is pinned to the compatible CommonJS uuid 11.1.1; native project configuration was retested. A new complete npm audit reported zero findings, as did the runtime-only audit. CI repeats the audit. Results and timestamps are recorded in the final report.
This is not a Rust vulnerability audit; Rust dependency locks/checksums and native
builds are separate evidence. Keep dependencies pinned and reassess before release.

The offline local-calculator package can be evaluated independently of the backend,
but publishing a variant with protected Education, online providers or analytics
requires a new end-to-end privacy/authentication assessment. Do not treat browser
CORS, hidden URLs, the app ID or WebView wrappers as authentication.

Residual boundaries: imported operational data must be checked by users; local
storage is not credential storage, portable exports are user-controlled copies,
and screenshots/build success do not establish physical-device security. No
production configuration, analytics setting, credentials or store account changed.
