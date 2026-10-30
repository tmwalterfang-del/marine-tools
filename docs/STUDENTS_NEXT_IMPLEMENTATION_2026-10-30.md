# Education and workspace implementation

Review branch: `feature/education-next`, PR #52, based on PR #51. The production branch and Android packages are outside this change.

## User flows

`workspace.html` provides learning paths, chapter practice, scheduled reviews, mistakes, timed/weighted self-tests, formula selection, teaching packs, projects, vessels, linked calculations, workbook notes, selected backup/restore, optional account transfer, classes and help. Chapter content loads on demand. The original 292 questions, 575 primary formulas and their reviewed identities remain intact. Sixteen deterministic variant families add checked intermediate steps and units; changing numerical size is not presented as an increase in conceptual difficulty.

Exercise-to-model transfer is offered only where the question defines a complete compatible scenario. Other links remain related explorations. Transfers use a same-origin, expiring session record; applying a scenario validates all fields before replacement. Returning a calculated value fills the answer without grading it automatically. Placeholders such as `$answer` never become model inputs.

Every one of the 45 experiments has project capture, immutable A/B snapshots, curves on common physical axes, numerical input/result differences, local sensitivity and a 20 × 20 two-input map. Invalid states produce explicit domain messages rather than invented values. Integer settings are not silently rounded. Model limits and the thirteen additional numeric modules are documented in `STUDENTS_ADVANCED_MODELS_2026-10-30.md`.

Projects retain scenarios, results, tables and sanitized diagrams. Linked calculations carry the declared source unit and record identity; unknown or incompatible units cannot be selected as numerical sources. Changing an entered source value removes the previous provenance. Combined HTML reports can be printed to PDF. Workbook annotations retain normalized coordinates and a reference to the captured experiment.

Table imports require explicit column/decimal separators, a reviewed unit mapping and a valid preview. Mapping changes invalidate the preview. Backups include only the selected documented data groups. Restore downloads a recovery copy and rolls back partially written local records on failure. Newer or malformed stored workspace/learning formats are preserved instead of being silently replaced.

The shared language control translates curated navigation, controls, workspace guidance and terminology between English and Norwegian. Scientific source prose, questions and model qualifications retain their English wording; this is not a claim that the entire scientific library has been translated. Numerical input values, equations, units and exported numerical data are not translated. The help view includes a bilingual technical glossary.

Task search links to actual tools. Walkthroughs are opt-in and highlight real controls without filling or submitting data. Contextual issue reports are reviewed/downloaded locally; diagnostic context and entered values are opt-in, and no support message is sent automatically. The Android page links to availability/testing on Google Play without claiming that the previously pending rollout has completed. Android 0.2.0's offline capabilities are distinguished from Education chapter packages.

## Private account backend

`preview-server/` contains the D1 schema, versioned migration, API routes and service. `scripts/stage-private-preview-20261030.mjs` stages the allowlisted frontend and these sources into the registered Sites project, without repository history, Android signing material, private data or local database state.

The hosted platform supplies the authenticated identity. Missing identity returns 401; each account/class/assignment operation rechecks owner or membership. Client-provided owner identities are not accepted. Account synchronization is opt-in and selected by group. The user compares complete records, can choose each record's local/account version, and uses revision-checked uploads. Conflicts invalidate the comparison. Deletion clears the snapshot payload and keeps only its monotonic revision tombstone, preventing stale-device overwrites after a delete/recreate sequence.

Class owners create frozen assignments, learners join with a code and chosen display name, and the server grades numeric answers. Expected answers and working are omitted from learner responses until submission. Owners see only their own class roster. Leaving a class removes that learner's submissions; deleting an assignment/class cascades its dependent data. These are practice assignments, with visible repeat attempts, not a secure examination system. Moodle numerical-question XML and grade CSV are export files; no live Moodle connection is claimed.

The Site remains owner-private. A class code does not grant access to the Site itself. Live-tool requests use an allowlisted GET-only proxy to the existing preview API; usage events are disabled on private preview origins. No production API write or Play publication is part of this change.

## Offline boundary

Authenticated `.pages.dev` and `.chatgpt.site` previews keep their network-only service-worker policy and purge previous source caches. New workspace dependencies are deliberately outside the root shell cache. Offline use is an explicit chapter ZIP containing selected formulas/questions and allowlisted local experiment dependencies. It contains no account data, cookies, saved answers, credentials or database. Extracting and opening `index.html` is a separate local study workflow; account and live services require the online workspace. Package navigation returns to included chapter content, and project/account actions that are absent from the package are removed. The extracted landing page, answer check, local experiment and A/B curves are tested through file URLs with the browser network disabled in Chromium/Firefox. WebKit's automated offline/file navigation returned an engine error, so its package test fulfills requests exclusively from extracted local bundle files and blocks all other requests; direct Safari file opening remains manual acceptance.

## Verification and remaining manual checks

- Pure workspace tests cover physical units, immutable records, malformed/newer formats, quotas, CSV parsing, source provenance and transactional restore.
- Variant tests use independent inverse/energy identities for 80 generated cases, retrieval scheduling, mistake classification, deadlines, weighting and frozen historical results.
- Advanced-model references include independent IF97 and CoolProp cycle fixtures; all original formula/reference suites remain required.
- Browser tests in Chromium, Firefox and WebKit cover all 45 analysis adapters, exact agreement with displayed baselines, shared axes and 400-cell maps. Workspace tests cover projects, linked calculations, CSV invalidation, calculator/model round trips, language/input preservation, workbook edits, known quantities, keyboard walkthroughs, selected diagnostics and ZIP creation.
- Actual local Worker + D1 + browser tests cover anonymous rejection, synchronization conflicts, teacher/learner membership, hidden solutions, submissions and rosters using explicitly local identity fixtures. Hosted sign-in must not be represented as verified by a service bypass token.
- Twelve workspace views passed axe-core WCAG A/AA automated checks; keyboard skip/focus and 360 px layouts were checked. A cold first learning view transferred approximately 260 kB with only chapter 1 loaded; under 150 ms latency / 500 kbit/s download emulation it became usable in approximately five seconds. Exact measurements and screenshots are test artifacts, not a field performance guarantee.

Physical Android/iOS devices, NVDA/VoiceOver behavior, a real external learner account and import into a live school LMS still require manual acceptance. Automated browser checks are not assistive-technology certification. The PR remains draft for that review, independently of the private deployment.
