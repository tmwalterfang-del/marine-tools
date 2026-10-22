# Role directory and responsibility matrix

These are ten functional conversations within one existing MarineTools Project, not ten employees, autonomous agents or new Projects. Owner retains product, spending, external communication and release authority. 01 coordinates; creation of a role chat does not authorize competing implementation.

| ID | Exact conversation name / handover | Responsible role | Preferred mode |
| --- | --- | --- | --- |
| 01 | [Marine Tools \| 01 Project Management & Strategy](roles/01-project-management-strategy.md) | Project Director / CTO | Chat; Work for document consolidation |
| 02 | [Marine Tools \| 02 Software Development](roles/02-software-development.md) | Senior Full-Stack Engineer | Work |
| 03 | [Marine Tools \| 03 Security & Privacy](roles/03-security-privacy.md) | Security Engineer / Privacy Advisor | Work |
| 04 | [Marine Tools \| 04 UI/UX & Design](roles/04-ui-ux-design.md) | Senior Product Designer | Chat for design review; Work for prototype or assigned changes |
| 05 | [Marine Tools \| 05 Engineering & QA](roles/05-engineering-qa.md) | Maritime Engineering QA Lead | Work |
| 06 | [Marine Tools \| 06 Education & Content](roles/06-education-content.md) | Maritime Technical Educator | Work |
| 07 | [Marine Tools \| 07 Infrastructure & DevOps](roles/07-infrastructure-devops.md) | Cloudflare / DevOps Engineer | Work |
| 08 | [Marine Tools \| 08 Analytics & Product](roles/08-analytics-product.md) | Product Data Analyst | Chat for interpretation; Work for verification and analysis |
| 09 | [Marine Tools \| 09 Finance & Business](roles/09-finance-business.md) | Financial Controller | Chat; Work for workbook/document analysis |
| 10 | [Marine Tools \| 10 Marketing & Partnerships](roles/10-marketing-partnerships.md) | Growth & Business Development Manager | Chat for positioning; Work for research and deliverables |

## Responsibility matrix

R = produces work; V = independent verification; C = consulted. Owner approval is separate from authorship and verification.

| Area | R | V | C | Owner decision |
| --- | --- | --- | --- | --- |
| Strategy/shared register | 01 | relevant domain evidence | all | priorities/adoption |
| Application changes | 02 | 05; 03 if security relevant | 04,06,07,08 | merge/release |
| Security remediation | 02 | 03 (separate assignment) | 07,08 | risk/config/release |
| Security implementation by 03 | 03 | separately assigned independent reviewer | 02,07 | approval after independent review |
| UX/presentation | 04 with 02 implementation | 05 functional; 06 teaching | 08 | significant product direction |
| Education/formulas | 06 with 02 implementation | 05 | 04 | scope/acceptance/release |
| Infrastructure | 07 | 03 security; 02 runtime | 08 | live configuration/deployment |
| Analytics | 08 definitions, 02 implementation | 03 privacy, 07 live evidence | 01,09 | processing/product decisions |
| Finance | 09 | owner/accountant | 07,08,10 | spending/filing/pricing |
| Marketing/partnerships | 10 | 01 claims; 05/06 technical | 04,08,09 | send/publish/commitment |

A reviewer who implements the change cannot close the independent verification gate for that change. If an independent reviewer is unavailable, leave acceptance pending rather than inventing independence.
