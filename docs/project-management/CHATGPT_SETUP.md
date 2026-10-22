# Establish the ten MarineTools conversations

## Capability checked

The exposed tools in this session have no operation for creating, renaming, moving or grouping the owner's ChatGPT conversations. No conversations were created or modified. Use this prepared package inside the existing MarineTools Project. One Project can contain both Chat and Work; see https://learn.chatgpt.com/docs/projects and https://learn.chatgpt.com/docs/get-started-with-work (opened 22 October 2026). The mode recommendations here are workflow choices, not claims of automatic background execution.

## Minimal manual setup

1. Open the existing **MarineTools** Project. Keep this conversation as the organization Work record; reuse an existing strategy, security, development or education conversation if it already owns that work.
2. Add/reference `PROJECT_STATUS.md`, `TASK_REGISTER.md`, `RELEASE_POLICY.md`, `HANDOVER_PROTOCOL.md` and `ROLE_DIRECTORY.md` as project sources. They are provided in this package and the docs Draft branch `docs/project-organization-20261022`. Until merged, main does not contain them. Do not merge merely to make sources available.
3. For each missing role, start a new conversation **inside this Project**, choose the recommended mode, and set the exact name in the table below (or rename in the interface where available).
4. Open its role file and paste the complete opening prompt block. Attaching that role file plus the common sources also preserves the full instructions. Give business/source files only to relevant roles.
5. Start with 01. Use 03 and 05 for review; keep existing #35/#40 writers in control until coordinated handover. Create the other conversations as needed. Ten chats do not need ten simultaneous Work jobs.
6. After a role finishes, give its structured handover to 01; 01 updates the central docs on a coordinated docs branch. Chat titles/project membership do not guarantee automatic status synchronization or identical tool access.

## Creation order and first tasks

| Order | ID / exact name | Mode | Opening prompt | First outcome |
| --- | --- | --- | --- | --- |
| 1 | Marine Tools \| 01 Project Management & Strategy | Chat; Work for document consolidation | [role 01](roles/01-project-management-strategy.md) | Take ORG-01/02/03: reconcile live branch heads against the package; create a current work reservation table; assign the first review tasks and deliver a one-page owner decision brief. Reuse active chats rather than restart development. |
| 2 | Marine Tools \| 03 Security & Privacy | Work | [role 03](roles/03-security-privacy.md) | Take SEC-01/02: review current #40 at its exact head independently, reproduce relevant local negative/positive tests, separate source flaws from configuration-dependent exposure and give 02/07 a prioritized remediation/readiness list. |
| 3 | Marine Tools \| 05 Engineering & QA | Work | [role 05](roles/05-engineering-qa.md) | Take ENG-01/02/03: review chapters 2/3 first, including the open mechanics model; reconcile per-row numeric applicability/evidence, then six open model decisions and original-source coverage. Continue systematically rather than replacing work with a sample-only report. |
| 4 | Marine Tools \| 07 Infrastructure & DevOps | Work | [role 07](roles/07-infrastructure-devops.md) | Take OPS-01/02: gather read-only, redacted evidence of build production branch, Access applications, preview secrets/datasets, rate bindings and headers; map actual DNS/hosting; prepare isolated rehearsal, enforceable release-control proposal and rollback. |
| 5 | Marine Tools \| 08 Analytics & Product | Chat for interpretation; Work for verification and analysis | [role 08](roles/08-analytics-product.md) | Take ANA-01/02: verify live 24h/7d/30d/90d and refresh with owner sign-in, compare one range with authorized SQL, report configuration/failure/empty distinctions; produce consent-aware metric dictionary and prioritized product questions. |
| 6 | Marine Tools \| 02 Software Development | Work | [role 02](roles/02-software-development.md) | Take DEV-01 only after obtaining accepted findings and file reservation. First produce an integration map for #35/#40 without changing either branch. Implement the next specifically assigned fix on a separate coordinated Draft. |
| 7 | Marine Tools \| 06 Education & Content | Work | [role 06](roles/06-education-content.md) | Take EDU-01 and support ENG-03: review existing #35 and its source maps, prepare a current teaching/content gap list and teacher test brief, then improve only agreed gaps without duplicating completed modules. Carry chapter 2/3 priority into QA handover. |
| 8 | Marine Tools \| 04 UI/UX & Design | Chat for design review; Work for prototype or assigned changes | [role 04](roles/04-ui-ux-design.md) | Take UX-01 with QA-01: inspect the existing Education preview and main navigation, prioritize remaining short-screen/zoom/keyboard issues and reconcile README availability claims. Deliver annotated criteria; reserve files before implementation. |
| 9 | Marine Tools \| 09 Finance & Business | Chat; Work for workbook/document analysis | [role 09](roles/09-finance-business.md) | Take BIZ-01: resolve the latest private workbook and supporting invoices, reconcile recurring and one-off costs, distinguish documented transactions from assumptions and prepare conservative/base/upside commercial scenarios. |
| 10 | Marine Tools \| 10 Marketing & Partnerships | Chat for positioning; Work for research and deliverables | [role 10](roles/10-marketing-partnerships.md) | Take MKT-01: inventory current approved public claims/assets, prepare clarification questions for partner meetings (purpose, integration needs, data ownership, scope and commercial expectations), and draft release/teacher messaging appropriate to current status. |

## Existing conversation handling

Do not delete or interrupt existing chats. Existing Education and Security chats are valuable active records: reuse them as roles 06/02 and 03 where their scope fits, or make a short explicit handover to a new role chat after its current checkpoint. Earlier broad development chats become historical sources once their tasks are transferred. Ask the old chat for HANDOVER_PROTOCOL's template if missing; do not ask it to repeat code work already completed.

Use a dated handover with task IDs, current SHA, branch/PR, evidence, blockers and owner decisions. Role 01 records which successor owns each task. If an old chat cannot be recovered, list the exact missing context and use current source evidence; never invent prior approvals. Archive/rename old chats only when the owner chooses; no removal is part of this task.

## Suggested shared Project instruction (optional copy)

```text
Marine Tools: code/history in tmwalterfang-del/marine-tools. Refresh current GitHub state and read docs/project-management status, task register, release policy and handover protocol (use the organization Draft package until merged). Keep public content English and preserve all working functionality/user data. Work in one coordinated task/file scope per writer. Preserve active PRs #35 and #40. No main merge, production deployment/configuration changes, external sending/publishing or deletion without explicit owner instruction. Separate implementation from independent security/engineering review. Do not put secrets, copyrighted/private sources, finance or vessel data in public GitHub. Report exact SHA/environment, tests, evidence, untested limits, blockers and next owner. Send structured deltas to role 01; do not assume other chats are synchronized.
```
