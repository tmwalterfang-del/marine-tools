# Task register

Snapshot: 22 October 2026. Role 01 is the sole integrator for this register. Other roles submit deltas through their handovers; they do not concurrently edit shared status files. Owners below are functional roles, not assignments to an unseen active session. No task starts automatically when a conversation is created.

Statuses: OPEN → CLAIMED → IN PROGRESS → READY FOR INDEPENDENT REVIEW → READY FOR OWNER REVIEW → DONE. BLOCKED records the missing evidence/access; MERGED does not imply live acceptance. No estimated dates are commitments until owner capacity is agreed.

| ID | Priority | Owner | Status | Outcome | Dependencies | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| ORG-01 | P0 | 01 | READY FOR REVIEW | Review organization package and adopt coordination rules | This documentation branch | Ten role briefs, current inventory and setup ready; owner adoption recorded |
| ORG-02 | P0 | 01 | PENDING OWNER SETUP | Create or reuse ten conversations inside existing MarineTools project | ORG-01 | Each chat has exact role brief and common source links; no duplicate Projects |
| ORG-03 | P0 | 01+02 | OPEN | Coordinate #35/#40 integration and file ownership | Current PR heads | One integrator, agreed base/allowed paths; combined tests before release |
| SEC-01 | P1 | 03 | OPEN | Independent review of #40 security implementation | Existing #40, no competing edits | Findings reproduced safely at SHA; auth/privacy/abuse failures and residual risks recorded |
| OPS-01 | P0 release gate | 07+03 | BLOCKED: ACCOUNT EVIDENCE | Verify Access, rate bindings, routes, preview resources and headers | Owner account access | Redacted configuration evidence and isolated rehearsal; no production changes |
| SEC-02 | P1 | 03+09 | OPEN | Document privacy basis, consent, retention and rights process | SEC-01; actual vendor/account evidence | Owner processing decisions documented privately; public text matches behavior |
| ENG-01 | P1 | 05 | OPEN | Reconcile numerical evidence and prioritize chapters 2/3 | Current ledger; source access | 82 Physics and 204 Mechanics rows triaged individually; pending tests not marked passed |
| ENG-02 | P1 | 05 | OPEN | Resolve or constrain six open model/source relationships | Independent authoritative references | Each has source/applicability decision; remain reference-only until valid |
| ENG-03 | P1 | 05+06 | OPEN | Reconcile page-by-page source coverage and symbol meaning | Original archive and source map | Printed variants mapped; units/context checked; unreadable region requests specific |
| EDU-01 | P1 | 06 | OPEN | Complete #35 teaching and acceptance handover | ENG-01/02; existing #35 | Current module assumptions, loader order, exports, private offline refusal; teacher/device gaps explicit |
| ANA-01 | P1 | 08+07 | BLOCKED: OWNER LOGIN | Verify live dashboard and SQL ingestion | Existing merged #36–39 | 24h/7d/30d/90d, refresh, failure state and same-range SQL comparison recorded |
| ANA-02 | P1 | 08+03 | OPEN | Prepare consent-aware measurement definitions | #40 review and privacy decisions | Consenting browser reach distinguished from people, total visits and historical metrics |
| QA-01 | P1 acceptance | 05+04 | OPEN | Physical-device, accessibility and teacher identity acceptance | Available devices; normal authorized login | Real devices/native zoom/keyboard; expected identity allowed, unlisted refused; evidence scoped |
| DEV-01 | P2 | 02 | OPEN | Remediate accepted findings with focused changes | SEC/ENG/QA findings; coordinated files | Draft PR with independent regression and no feature/data loss |
| UX-01 | P2 | 04 | OPEN | Review navigation/presentation and current availability claims | #35 implementation; README discrepancy | English UI; no hidden results; both themes/short screens; UKC claim reconciled |
| OPS-02 | P2 | 07 | OPEN | Propose enforced release and repository controls | ORG-01; existing rulesets | Reviewable configuration proposal and rollback; owner approves changes |
| BIZ-01 | P2 | 09 | OPEN | Reconcile costs and finance sources; prepare scenarios | Private workbook/invoices | Cost register and cash scenarios backed by documents; tax advice separately sourced |
| MKT-01 | P2 | 10 | OPEN | Prepare partnership qualification and truthful launch drafts | Current release status; owner-held correspondence | Draft questions/content distinguish live features from previews; no messages sent |
| DONE-01 | Historical | 02+08 | MERGED | Analytics loading/bundling/usage/voyage coverage | PR #36–39 | Repository merge and CI evidence confirmed; live account acceptance remains ANA-01 |
| DONE-02 | Historical | 02+05 | MERGED | v8.7.0 integrated release | PR #34 | Merge verified; provider/device limits remain separate |
| DONE-03 | Historical | 01 | CLOSED / NOT MERGED | Older separate preview/QA proposals | PR #32/#33 | Do not treat closed proposals as active delivery branches |

## Work reservation (initial state)

| Workstream | Current branch/PR | Reservation |
| --- | --- | --- |
| Education | #35 / feature/for-students-formula-library-20261019 | Preserve existing work; confirm with its active conversation before writing |
| Security | #40 / security/full-audit-hardening-20261022 | Preserve existing work; new Security conversation reviews first |
| Organization | docs/project-organization-20261022 | Documentation author only; no runtime files |
| Live account acceptance | None | Read-only/account-assisted until separately authorized configuration changes |

Before work: record task ID, role, base/head SHA, branch, allowed files, reviewer and dependency conflicts in the assignment handover. If two roles request the same file, 01 sequences them or assigns one integrator. Idle/read-only analysis can proceed without a mutation reservation. Refresh reservations when heads change.
