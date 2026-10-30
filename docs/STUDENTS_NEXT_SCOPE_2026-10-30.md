# Education and Marine Tools workspace expansion

Requested: implement all 42 proposed improvements in a new pull request and a private preview.

Base: `feature/education-full-formula-review` at `ca9f3684801dad2c11ad91926252a6c9ec21ffaa` (PR #51).
New branch: `feature/education-next`. No merge or production release is included.
Private hosting project: `appgprj_6ae4ec2b8a048191b2ff752b81aaa387`.
Private preview origin: `https://marine-tools-education-next.fondbook66.chatgpt.site` (publication must be verified).

## Acceptance inventory

Checked entries have implementation and automated/local evidence described in STUDENTS_NEXT_IMPLEMENTATION_2026-10-30.md. Item 36 retains a manual assistive-technology/physical-device acceptance requirement.

- [x] 1. Exercise inputs transferred to models and returned to the answer.
- [x] 2. Structured learning paths with prerequisites and goals.
- [x] 3. Spaced retrieval/review scheduling.
- [x] 4. Deterministic independently checked question variants.
- [x] 5. Intermediate calculation and unit answers.
- [x] 6. Personal mistake journal and targeted practice.
- [x] 7. Formula selection from known and unknown quantities.
- [x] 8. Linked symbol, input, formula and diagram highlighting.
- [x] 9. A/B scenario curves and input differences.
- [x] 10. Sensitivity ranking and two-variable heatmaps.
- [x] 11. Explanatory questions, examples and self-assessment.
- [x] 12. Timed/weighted self-tests and selectable resources.
- [x] 13. Teaching sessions and teacher guides.
- [x] 14. Chapter workbook with notes and annotated experiments.
- [x] 15. Free-body force and moment diagrams.
- [x] 16. Truss builder and member/reaction forces.
- [x] 17. Euler column buckling.
- [x] 18. Free/restrained thermal expansion and stress.
- [x] 19. Series/parallel pipe network.
- [x] 20. Hydraulic pump/valve/cylinder circuit.
- [x] 21. Rankine steam cycle with verified water properties.
- [x] 22. Refrigeration p–h process with documented property/model limits.
- [x] 23. Kirchhoff resistor-network builder and virtual meters.
- [x] 24. Induction-motor equivalent circuit and torque/slip.
- [x] 25. Unbalanced three-phase load and neutral current.
- [x] 26. Relative navigation motion and CPA/TCPA lesson.
- [x] 27. Bearing fixes and observation uncertainty.
- [x] 28. Project folders and multiple vessel profiles.
- [x] 29. Linked calculation workflow with units and provenance.
- [x] 30. Combined multi-calculation reports.
- [x] 31. CSV/pasted-table import, mapping and preview.
- [x] 32. Selected full backup and transactional restore.
- [x] 33. Norwegian/English core interface and shared terminology (scientific source prose remains English).
- [x] 34. Contextual issue reports with selected diagnostic fields.
- [x] 35. Task-based tool search.
- [ ] 36. Accessibility: browser/keyboard implementation verified; physical-device and assistive-technology acceptance remains open.
- [x] 37. Measured first-load and weak-network improvements.
- [x] 38. App/download page with accurate availability and offline capabilities.
- [x] 39. Optional task-based walkthroughs with actual UI examples.
- [x] 40. Optional authenticated cross-device synchronization with conflict handling.
- [x] 41. Teacher/class assignments, membership and learning-platform export/integration.
- [x] 42. Explicit downloadable Education chapter packages.

## Architecture and release boundary

Existing tools and reviewed evidence remain the baseline. New numeric models use pure functions, bounded inputs, explicit assumptions, numerical alternatives and independent reference tests. New learning/workspace records remain local unless the visitor explicitly enables account synchronization or class sharing. Private server records are keyed by dispatch-provided authenticated identity, with membership checks on every class operation.

The existing `.pages.dev` service worker must keep its network-only Access policy. Offline Education uses a separate explicitly downloaded local package, never a cached authenticated preview page. Public-site and Play release actions are outside this PR.

Physical-device and screen-reader checks must be reported accurately; automation is not a substitute for user testing or certification. External LMS interoperability requires checking the actual target platform rather than calling an exported package a verified connection.
