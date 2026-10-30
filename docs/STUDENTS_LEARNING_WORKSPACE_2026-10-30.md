# Education learning workspace — 30 October 2026

Scope: the protected Education preview on `feature/education-full-formula-review`, PR #51. No production or Android release is included.

## Delivered behavior

- **Progress:** overall completion and 16 chapter cards, four difficulty counts, chapter continuation and a global continue action. Completion means a question has been answered correctly at least once; it is not a mastery assessment.
- **Exercise resources:** 717 validated links across 292 exercises. Links open the exact formula family and expression where available, a matching calculator, an applicable interactive model, or the chapter. Returning restores the typed answer. A model link does not copy the exercise values into the model.
- **Practice feedback:** decimal comma, Unicode minus and scientific notation; feedback for observed sign, angle, percent and conversion-factor patterns, with authored hints as the fallback. A valid attempt unlocks optional steps one at a time and the existing complete worked solution.
- **Self-tests:** select any chapters and one/all difficulty levels; choose 1–50 questions from the eligible pool, sampled without replacement. An unfinished test saves its answers and position. Submission requires a separate confirmation. No correctness, worked solution, hint or resource panel appears in the running test. Submitted results include chapter counts and worked review, and can prepare another test of weaker chapters.
- **Accessibility:** named tabs/panels with manual arrow/Home/End navigation; Enter/Space activate. Skip links, field error semantics, visible focus, reduced motion, keyboard diagram zoom/pan and explicit pan buttons, and focusable named table regions. Existing diagram exports and numerical models are unchanged.

## Persistence and boundaries

`mt-student-learning-v2` contains a version-1 object: known completed IDs, answer drafts/attempt counts, last question, one unfinished test, and at most 10 submitted tests. The previous `mt-student-practice-v1` completions migrate and remain mirrored for compatibility. Reset clears learning answers, completion and test history; formula bookmarks and interactive-module drafts remain separate.

Storage errors fall back to the current session and display a relevant message. A saved format from a newer version is preserved without writing over it. Imported state is bounded and validated. Submitted tests keep question/answer-tolerance snapshots so a later exercise-bank update does not change their displayed score.

This is a local educational self-test, not a supervised or secure examination. All questions and expected answers are available in client code. Data is device/browser-local; no account sync is added. A correct self-test answer contributes to the same practice completion as a correct exercise answer.

The 575 primary formula records, 1,498 expression records, independent evidence fixtures, 60 calculator models, 292 exercise questions and 21 interactive numerical models retain their previous reviewed content.

## Verification

- `tests/students-learning-engine-20261030.mjs`: parsing, zero/tiny/exact tolerances, diagnostic patterns, migration, malformed/newer/unavailable storage, ordered continuation, filtered unique selection, deferred grading, frozen result history, reset, and every resource target.
- `tests/students-learning-ui-20261030.cjs`: actual index integration, all seven tabs, completion, restored answers, solution gating, exact expression/back links, unfinished-test reload, explicit submission, results, weaker-chapter setup and reset.
- `tests/students-learning-browser-20261030.cjs`: Chromium/Firefox/WebKit; 1440, 390 and 320 px; progress, test and result reflow; answer restoration from a model; unfinished-test reload; tabs, errors, skip-link activation, diagram zoom/pan, numerical table focus and reduced motion. Twenty-four text/surface theme contrast pairs exceed 4.5:1. WebKit skip-link activation uses explicit focus because the automation environment's native link-Tab preference differs; Chromium/Firefox additionally check the first Tab destination.
- The full validation job has 65 test commands. Existing cross-browser suites continue to cover all 21 modules, numerical exports, report downloads, sessions, responsive layout, single page scrolling, Mollier interactions and the rest of the application.

This verifies automated semantics, keyboard behavior and sampled contrast. It does not constitute a WCAG certification or a physical NVDA/VoiceOver assessment. Accessibility references: [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [visible focus](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html).

## Additional interactive proposals (not implemented)

1. A three-phase phasor and power triangle with power-factor compensation.
2. A composite cross-section builder showing centroid, second moments of area and the effect of holes.
3. Wave interference and Doppler exploration with adjustable source/observer motion.

These require a separate choice before implementation.
