# Marine Tools For Students – UX and study workflow implementation
**19 October 2026 · PR #35 (Draft)**

## User-approved direction
All features remain **English only**. The three repetitive user-facing notices identified by the user have been removed from the student UI. Formula-specific assumptions, error states and calculation validity conditions remain where technically essential.

## Implemented in this phase
1. **Formula display and variables:** all 366 formulas render a detail disclosure with context/conditions, topic reference, explicit verification status and an independently authored variable/units glossary **when curated**. Initial curated glossary coverage: **22 formula entries**. Others are visibly marked as editorially pending; no guessed symbol definitions are shown.
2. **Exact calculator links:** replaced category/first-word fuzzy matching with a whitelist of **53** explicit, ID-checked formula ↔ calculator mappings. Formulas with no verified link do not show a calculator shortcut.
3. **Subject navigation:** **28 existing subject categories** arranged under eight curriculum groups (Math & Physics, Stability & Cargo, Engineering & Energy, Electrical & Electronics, Nautical, Mechanics, Chemistry, Economics). Group filter and subject filter work together.
4. **Source review:** each formula gets a topic-level chapter signpost to the provided Gyldendal book, with a prominent statement that **individual equations are not source-verified**. `docs/STUDENTS_FORMULA_AUDIT_MATRIX_2026-10-19.csv` contains **366 rows** showing subject, chapter, annotation, calculator link, diagram and remaining review action. No copyrighted book images, layout or tables were copied.
5. **Practice Mode:** original **30 exercises** may be filtered by study discipline and illustrative difficulty (Foundation / Intermediate / Advanced), with an optional progressive hint; numerical answer must be attempted to unlock the worked solution. Existing local progress is retained.
6. **My Formula Sheet:** star/bookmark selections are saved locally; added personal sheet tab with print-to-PDF action through the browser's print dialog. Print CSS focuses on the selected sheets and expands prepared glossary content. No external PDF service is required.
7. **Original technical illustrations:** five self-authored SVG diagrams (stability GM, TPC immersion, right triangle, electric circuit, pump flow/head) inserted into the corresponding formula disclosure; no licensed textbook illustrations reused.

## Source / QA boundary
- **366 formulas, 52 calculators, 30 exercises** remain.
- `tests/students-smoke-20261019.mjs`: **168/168** isolated structural/mathematical assertions.
- `tests/students-ui-smoke-20261019.mjs`: **18/18** DOM-stub interaction checks: formula search, exact link, bookmark, sheet, printing, hints, attempt-before-solution, discipline and difficulty filter.
- Together, **186 non-overlapping automated checks** covering distinct test scripts. Neither script is a browser or physical-device test. No performance, WCAG certification, printed-PDF visual review or actual offline-upgrade scenario has yet been run during this change.
- Independent substantive review of mathematical notation, dimension, limitations, regression cases and all equations remains incomplete. Only 22 entries have curated symbol metadata; do not state that all 366 formulas are fully explained or verified.
- Preview isolation from production API/analytics is intentionally preserved; the new student script makes no network or analytics calls. The service worker cache is rotated on the Draft branch.

## Manual QA checklist before requesting release approval
- Desktop + mobile: 360×640, 390×844, 768×1024, 1366×768, 1920×1080; both Dark Maritime and Bridge Dark.
- Screen reader and keyboard: tablist, disclosure, bookmark buttons, exercise feedback, and level/discipline selection.
- Search queries with multiple terms, no results, accents, and mathematical symbols.
- Bookmark management persisted across reload and offline; local data migration safe.
- Print-to-PDF in Chrome/Firefox/Safari, no cutoff/overlaps, source note visible in the selected cards.
- Smoke source status and whether formula variable definitions are complete and correctly attributed.
- Confirm preview runs on Pages and does not hit production API, analytics, or QA Worker for these local modules.
- Fagfellekontroll, including a special review of formula accuracy and source licensing.

**Release gate:** PR #35 stays **Draft**. No merge to `main` or deployment to production without explicit approval.
