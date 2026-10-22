# Marine Tools — verified project status

Snapshot: 22 October 2026. This is a repository and organizational review, not a new production penetration test, full mathematical validation or compliance certificate. Refresh the SHA and evidence before every assignment. Documentation branch: `docs/project-organization-20261022`. Owner retains merge and deployment authority.

## Repository and architecture

Public repository: https://github.com/tmwalterfang-del/marine-tools; default branch `main`, observed at `6e10a5017428373079cdce26f0fb19175565bb20`. Seven branches were returned by the branch inventory, including two active Draft workstreams and four retained analytics branches. The branch response reports `protected=false` for main; policy in this package does not enforce technical branch protection. DevOps must verify rulesets and deployment controls before claiming enforcement.

| Component | Verified repository/configuration evidence | Boundary |
| --- | --- | --- |
| Public frontend | Static HTML/CSS/JavaScript, root `index.html`, `app.js`, layered versioned scripts/CSS, `sw.js`, `CNAME`; GitHub Pages build/deploy checks succeeded on main | The original brief's Cloudflare-only hosting description is incomplete. GitHub Pages deployment exists; Cloudflare Pages is also used for previews. DNS/proxy configuration was not read directly. |
| API | Both Wrangler configs point to `worker/worker-v860-dashboard.js` (relative path in nested config), custom route `api.marinetools.app`, Workers build succeeded on main | Cloudflare's live environment variables, secrets and Access policy were not inspected in this session. |
| Analytics | `ANALYTICS` dataset binding, `ANALYTICS_SQL`, scheduled 15-minute checks; collector and private dashboard in Worker chain | Working fixtures and successful deployment do not prove signed-in SQL ingestion. |
| External data | Weather/AIS implementation and existing QA identify MET Norway, NOAA GFS-Wave, BarentsWatch and Pelyr; Voyage Estimate routing uses external code | Actual provider availability, entitlements and current terms remain separate live acceptance. |
| Preview | Separate Education branch and Pages preview lineage; source tests distinguish preview and production | Cloudflare Access identity acceptance and provider/resource isolation remain account checks. |
| Local state | Vessel profiles, saved curves, calculation history and Education state are browser-local features | Preserve data during cache, backup and consent changes. |

## Current workstreams

| Work | Verified GitHub status | Next action |
| --- | --- | --- |
| Education #35 | OPEN/DRAFT, `df66bb27c923d9e25a30b344d5f27c38a8dc56ac` | Preserve branch. Independent engineering QA and acceptance; no publication authority. |
| Security #40 | OPEN/DRAFT, `314e5bf7c7a18274c9579e4ba6dee84a3cbd1375` | Independent review and isolated deployment rehearsal; keep Draft. |
| Analytics #36–39 | All merged; latest main contains voyage outcome instrumentation | Complete authenticated live dashboard/SQL acceptance. Do not rebuild fixed loading code from an old snapshot. |
| Release #34 | Merged; v8.7.0 release lineage | Use current main, which also contains later analytics commits. |
| Earlier #32/#33 | Closed, unmerged | Treat as historical inputs; #34 integrated preview/QA work. No automatic reopening or deletion. |

Education and Security touch `index.html` and `sw.js` in common. GitHub currently reports each individually mergeable; that does not establish that their combined result is compatible. Before any approved release, assign one integrator and verify consent, script order, precache, private-preview refusal and all relevant tests on the combined tree. Do not merge one active branch into the other during this organization task.

## Education inventory reconciled from code

At `df66bb27c923d9e25a30b344d5f27c38a8dc56ac`, executed data scripts in their `students/index.html` order in an isolated Node VM, excluding the UI app and network collector. All selected scripts loaded without exceptions.

| Item | Observed count | Meaning |
| --- | --- | --- |
| Formula catalogue records | 575 | 575 unique IDs; historical 499 is superseded |
| Calculator definitions | 60 | Loaded definitions, not independent certification |
| Practice exercises | 36 | Loaded records |
| Categories / study groups | 29 / 8 | Current taxonomy |
| Study detail records | 575 | Presence only |
| Contextual symbol entries | 8043 | Includes expression contexts; not 8,043 unique physical quantities |
| Source expression register | 1498 | Normalized relationships/variants, distinct from catalogue cards |
| Interactive modules | 15 | Counted from students/interactive.js |

Independently parsed the current expression CSV: **1,470 REVIEWED_UNDER_STATED_ASSUMPTIONS; 22 CORRECTED_OR_QUALIFIED_THIS_PASS; six OPEN_MODEL_OR_SOURCE_LIMIT**. These are recorded review decisions, not a fresh independent endorsement of their mathematics.

Numeric evidence fields: 1,260 `PENDING`; 59 identity-sample passes; 109 reference cases; ten independent complex-KCL cases; six general-function symbolic rules with numerical specializations pending; 54 not applicable. Do not describe all 1,498 as numerically tested. Existing documentation reports dimensional parsing of 1,011, leaving 487 unparsed; this session did not rerun that parser.

Chapter 2 has 82 registered expressions; Chapter 3 has 204 and includes one open model. The six open items concern dished-head applicability, two weld rules, two bearing chart/calibration relationships and a grain GM rule. QA must resolve or explicitly exclude their application before acceptance; do not invent calibration factors.

Historical source archive: 284 images including one duplicate; printed formula pages 7–224 span 218 pages, followed by reference tables. These counts are supported by earlier source receipt reports, not by reopening all images in this session. Original archive was located in the owner's files, but not downloaded or exhaustively inspected. The registered expression set is not proof of exhaustive coverage of every printed equation/table/chart.

The current interactive workspace includes a **steam Mollier h–s** module, not a humid-air h–x chart. Preserve the distinction; a new h–x or refrigerant p–h request needs its own requirements and permitted property source.

## Evidence and unresolved acceptance

- Main: production-smoke run [39668327534](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39668327534), analytics run [39668327505](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39668327505), Pages run [39668326772](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39668326772) all returned success. Commit check-runs also returned successful Workers Builds and Cloudflare Pages checks. No new deployment was initiated here.
- Education current head: source-audit run [39668343270](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39668343270) and analytics [39668343271](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39668343271) returned success. These results were read, not rerun locally. Linux browser engines and fixtures do not certify physical devices, projector/native zoom or live provider behavior.
- Security current head: [39733238745](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39733238745) and [39733238777](https://github.com/tmwalterfang-del/marine-tools/actions/runs/39733238777) returned success. Detailed finding evidence remains with the existing security workstream; no exploit details or credentials are duplicated here.
- Owner/DevOps checks: live Access policy and intended identity acceptance, alternate routes, separate preview resources, bindings, deployment branch, production headers and dashboard SQL.
- Owner/privacy review: processing records, lawful basis/consent, vendor terms, retention, rights requests and historical collection. Compliance is not established by code tests.
- Physical/browser acceptance and external teacher login remain outstanding. No email or invitation was sent.

See [PROJECT_INVENTORY.md](PROJECT_INVENTORY.md), [TASK_REGISTER.md](TASK_REGISTER.md) and [SOURCE_INDEX.md](SOURCE_INDEX.md).
