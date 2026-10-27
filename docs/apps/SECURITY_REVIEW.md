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

## Native dependency audit follow-up

CI run 40529639047 adds a real RustSec scan of the locked native dependency graph,
with no advisory ignore list or OS/CPU filter. It inspected 498 dependencies
against 1,380 advisories (database commit
99670cfc0bc574433034b75876a4b791ccaa2efb, updated 27 October 2026).
The vulnerability-class list is empty, but there are five informational warnings;
this must not be summarized as a clean report with no findings.

| Locked package | Version | Warning | Advisory |
|---|---|---|---|
| proc-macro-error | 1.0.4 | unmaintained | RUSTSEC-2024-0370 |
| zbus_names | 4.3.5 | unmaintained | RUSTSEC-2026-0371 |
| zvariant | 5.15.1 | unmaintained | RUSTSEC-2026-0370 |
| zvariant_derive | 5.15.1 | unmaintained | RUSTSEC-2026-0372 |
| glib | 0.18.5 | unsound | RUSTSEC-2024-0429 |

The GLib warning concerns unsound iterator implementation and must not be ignored
merely because the job exits successfully. The full lockfile includes optional
platform graphs. None of these five package names appeared in the fresh Windows
compilation lines of run 40527790674; that is evidence about this build, not a
replacement for a target-specific dependency-path review. Android uses the
Java/Kotlin Capacitor shell and does not build this Rust graph. Before enabling
additional desktop platforms or changing native dependencies, trace/update the
relevant upstream paths and rerun the audit. No advisory was suppressed and no
unrelated dependency upgrade was made to force a green status.

[Complete JSON audit artifact](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40529639047/artifacts/12746975060).
The earlier statement that no Rust scan had been performed describes the inherited
checkpoint; this scan is new evidence. Source/configuration and physical-device
security checks remain separate. CI also emits a Node 20 action-runtime
compatibility warning while forcing older action majors onto Node 24; schedule
an action-major maintenance pass rather than confusing that with an app CVE.
