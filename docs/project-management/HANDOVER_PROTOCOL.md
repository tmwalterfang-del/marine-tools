# Assignment and handover protocol

GitHub owns code/version history. These reviewed docs own shared status and recorded decisions. Chat transcripts provide context, not guaranteed synchronized state. Every new turn refreshes relevant remote heads and policies before writing.

## Before implementation

Read PROJECT_STATUS, TASK_REGISTER, RELEASE_POLICY, this protocol and the role brief. Identify existing PRs and AGENTS.md in the actual checkout. Reserve the task/files with role 01. Start a dedicated branch from the agreed base; do not modify another role's branch without explicit coordination. For #35/#40, start with review and preserve the ongoing work. A new chat does not take ownership of an already active writer.

Assignment record: task ID; objective; acceptance criteria; writing role; independent reviewer; base SHA; branch/head SHA; allowed files; excluded scope; dependencies; account access; approval boundaries. Shared status files have one writer. Security testing uses synthetic/local fixtures first, without production event writes or provider-cost/load tests.

## End-of-assignment handover (copy template)

```text
Task ID / responsible role / date:
Objective and acceptance criteria:
Base SHA / final head SHA / environment:
Implemented changes (or review-only findings):
Files modified and rationale:
Tests executed (exact command, environment, fixture/live, result):
Existing CI results inspected (run URL and SHA; distinguish from reruns):
Verified results and evidence:
Failures / remaining problems / untested cases:
Security, privacy, engineering and user-data impact:
Dependencies / conflicting files / next owner:
GitHub branch / Draft PR:
Deployment state (not deployed unless independently confirmed):
Owner approvals already granted (exact scope) / approvals still required:
Recommended next steps:
Proposed PROJECT_STATUS / TASK_REGISTER / DECISION_LOG deltas:
```

## Independent acceptance

Implementation author supplies tests and evidence. A separate review assignment inspects assumptions, code paths and failure modes rather than endorsing its own patch. In the ten-role structure, 03 verifies security and 02 implements remediation; if 03 implements a fix, arrange a separate reviewer before security closure. 06 authors educational content; 05 validates formulas with independent derivation/reference and domain boundaries. A self-test or model-generated answer alone is not independent confirmation.

If evidence is unavailable, report BLOCKED or UNVERIFIED and continue independent work. Do not mark a whole chapter verified from representative samples. Update review evidence when expression/conditions/symbol hashes change. No thresholds or expected outputs may be changed merely to hide failure.

## Shared update and history

Role 01 integrates dated domain reports into this directory on its own docs branch. Status is always pinned to a commit/environment. Never store secrets, vessel data, accounting records or copyrighted source scans here. Retain old documents; point to newer authoritative evidence and explain supersession. Owner approval is required before deleting chats, branches or documents. Do not send external reports/messages unless separately instructed.
