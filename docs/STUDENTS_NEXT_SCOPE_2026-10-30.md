# Education and Marine Tools workspace expansion

Requested: implement all 42 proposed improvements in a new pull request and a private preview.

Base: `feature/education-full-formula-review` at `ca9f3684801dad2c11ad91926252a6c9ec21ffaa` (PR #51).
New branch: `feature/education-next`. No merge or production release is included.
Private hosting project: `appgprj_6ae4ec2b8a048191b2ff752b81aaa387`.
Private preview origin: `https://marine-tools-education-next.fondbook66.chatgpt.site` (publication must be verified).

## Acceptance inventory

Unchecked entries are pending implementation and verification, not delivered features.

- [ ] 1. Exercise inputs transferred to models and returned to the answer.
- [ ] 2. Structured learning paths with prerequisites and goals.
- [ ] 3. Spaced retrieval/review scheduling.
- [ ] 4. Deterministic independently checked question variants.
- [ ] 5. Intermediate calculation and unit answers.
- [ ] 6. Personal mistake journal and targeted practice.
- [ ] 7. Formula selection from known and unknown quantities.
- [ ] 8. Linked symbol, input, formula and diagram highlighting.
- [ ] 9. A/B scenario curves and input differences.
- [ ] 10. Sensitivity ranking and two-variable heatmaps.
- [ ] 11. Explanatory questions, examples and self-assessment.
- [ ] 12. Timed/weighted self-tests and selectable resources.
- [ ] 13. Teaching sessions and teacher guides.
- [ ] 14. Chapter workbook with notes and annotated experiments.
- [ ] 15. Free-body force and moment diagrams.
- [ ] 16. Truss builder and member/reaction forces.
- [ ] 17. Euler column buckling.
- [ ] 18. Free/restrained thermal expansion and stress.
- [ ] 19. Series/parallel pipe network.
- [ ] 20. Hydraulic pump/valve/cylinder circuit.
- [ ] 21. Rankine steam cycle with verified water properties.
- [ ] 22. Refrigeration p–h process with documented property/model limits.
- [ ] 23. Kirchhoff resistor-network builder and virtual meters.
- [ ] 24. Induction-motor equivalent circuit and torque/slip.
- [ ] 25. Unbalanced three-phase load and neutral current.
- [ ] 26. Relative navigation motion and CPA/TCPA lesson.
- [ ] 27. Bearing fixes and observation uncertainty.
- [ ] 28. Project folders and multiple vessel profiles.
- [ ] 29. Linked calculation workflow with units and provenance.
- [ ] 30. Combined multi-calculation reports.
- [ ] 31. CSV/pasted-table import, mapping and preview.
- [ ] 32. Selected full backup and transactional restore.
- [ ] 33. Norwegian/English interface and shared terminology.
- [ ] 34. Contextual issue reports with selected diagnostic fields.
- [ ] 35. Task-based tool search.
- [ ] 36. Accessibility: real browser/keyboard checks and assistive-technology verification.
- [ ] 37. Measured first-load and weak-network improvements.
- [ ] 38. App/download page with accurate availability and offline capabilities.
- [ ] 39. Optional task-based walkthroughs with actual UI examples.
- [ ] 40. Optional authenticated cross-device synchronization with conflict handling.
- [ ] 41. Teacher/class assignments, membership and learning-platform export/integration.
- [ ] 42. Explicit downloadable Education chapter packages.

## Architecture and release boundary

Existing tools and reviewed evidence remain the baseline. New numeric models use pure functions, bounded inputs, explicit assumptions, numerical alternatives and independent reference tests. New learning/workspace records remain local unless the visitor explicitly enables account synchronization or class sharing. Private server records are keyed by dispatch-provided authenticated identity, with membership checks on every class operation.

The existing `.pages.dev` service worker must keep its network-only Access policy. Offline Education uses a separate explicitly downloaded local package, never a cached authenticated preview page. Public-site and Play release actions are outside this PR.

Physical-device and screen-reader checks must be reported accurately; automation is not a substitute for user testing or certification. External LMS interoperability requires checking the actual target platform rather than calling an exported package a verified connection.
