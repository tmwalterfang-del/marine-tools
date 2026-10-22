# Release and approval policy

Owner mandate: do not merge to `main`, deploy to production, change production configuration or remove existing chats/branches/documents without explicit authorization. This organization package authorizes documentation preparation on a separate branch/Draft PR only. Existing release permissions do not carry over to new scopes.

## Allowed within an assigned scope

Read-only inspection; isolated local fixes/tests; a dedicated branch and Draft PR; source/evidence documentation; draft messages and configuration proposals. A Draft PR is not approval to release. Do not run live destructive, bulk telemetry, load or provider-cost tests. Preserve local user data and private content.

## Candidate gates

1. Confirm exact base/head and diff; coordinate ownership and current active PRs. Only intended changes belong in a candidate.
2. Pass relevant static, numerical, browser, preview-isolation, metadata and deployable-bundle tests. Report untested/live limits.
3. Obtain independent security/engineering review where affected; preserve specific model limitations and privacy behavior.
4. DevOps supplies redacted environment evidence, isolated configuration rehearsal and rollback plan. New protection that fails closed must have required account settings verified before release.
5. Owner approves the concrete candidate and merge scope explicitly. Owner separately authorizes production deployment/configuration, or explicitly approves a release operation that includes both. Approval may state conditions; record them.
6. Before an approved merge, determine whether GitHub Pages/Cloudflare integration auto-deploys on main. If merge auto-deploys, it requires production authorization too; do not use separate words to bypass that consequence.
7. Follow existing [RELEASE_CHECKLIST.md](https://github.com/tmwalterfang-del/marine-tools/blob/6e10a5017428373079cdce26f0fb19175565bb20/RELEASE_CHECKLIST.md). Check deployed frontend/API versions, actual build status, cache upgrade and smoke results; diagnose failures and report release incomplete until resolved. Execute rollback only within its explicit authorization.

## Current holds

- Education #35 remains Draft/unmerged; teacher/physical-device/scientific acceptance is incomplete.
- Security #40 remains Draft/unmerged; live configuration and isolated readiness need review.
- Integrating them must preserve `index.html` script order, `sw.js` public/private caching, analytics consent/schema and existing features. Neither PR's isolated green status proves combined acceptance.

## Existing authority remains

SECURITY.md governs private vulnerability reporting. RELEASE_CHECKLIST supplies functional acceptance. This file adds coordination/approval controls; it does not replace those documents. Proposal: DevOps review rulesets, merge protection and deployment environments. Current organizational policy is not evidence that those controls are enforced in GitHub/Cloudflare.
