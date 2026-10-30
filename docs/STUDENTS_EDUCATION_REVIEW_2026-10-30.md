# Education review and practice expansion — 30 October 2026

Education remains in protected preview. This change does not merge to main, release the native application or publish on Google Play.

## Delivered scope

- All 1,498 registered source expressions have executed, explicitly classified evidence. Six historical models are excluded from supported calculations, rather than counted as passes.
- All 575 primary formula representations received a separate manual expression, unit and assumption review. Context hashes keep these reviews tied to the actual displayed text and symbol definitions.
- All 60 calculators have authored independent reference cases and input/unit checks. The original 36 practice questions retain their identifiers, wording, answers and saved progress.
- 256 new authored questions: 16 in every chapter, in Foundation, Applied, Intermediate and Advanced sequences. Total: 292 questions with chapter filters, hints, worked solutions and direct chapter links. Numeric answers are checked against displayed relationships, finite reference calculations or independently verified model functions.
- Six new interactive studies alongside the original fifteen: beam loads/deflection, RC/RL transients, ideal Otto/Diesel p–V cycles, pump duty/NPSH, refrigeration energy balance and suspended-load origins/counterweight. Total: 21 modules. Each new study provides units, assumptions, numerical tables, CSV, self-contained SVG, HTML/PDF reports and JSON scenarios. Optional local drafts support the new studies too.

## Corrections with practical consequences

Navigation angles and rhumb-course normalization now use their stated radian convention. Safety-factor wording distinguishes unreduced failure strength from reduced allowable capacity. External gear ratios distinguish speed magnitudes from signed opposite rotation. Calculator endpoints accept valid zero fractions; enthalpy inputs allow arbitrary signed reference datums while still checking physical ordering. Annuity formulas remain stable near zero rate. Small nonzero results and working steps remain visible in scientific notation.

Practice filters clear stale hints, solutions and answer controls when no question matches. Navigation stops at chapter/filter boundaries. Exact integer answers and very small nonzero answers receive appropriate tolerances. Scenario imports validate complete typed fields before changing the current model; rendering takes a snapshot of cached values before replacing focused controls. SVG visibility uses reflected attributes across browsers, and hidden diagrams hide their exploration controls. Mobile plots use fewer, larger tick labels; full numerical precision is retained in CSV/scenario data.

## Evidence and limits

The evidence types deliberately distinguish symbolic identities, finite numerical cases, typed unit/chemical/signal checks, exhaustive Boolean truth tables, supplied empirical coefficient contracts and synthetic hydrostatic lookup contracts. A finite reference case is not a proof over every real domain. The 575 manual reviews are not 575 independent numerical proofs. The math suite uses authored mathematical translations tied to source context, rather than a general interpreter for arbitrary textbook notation.

The six excluded historical rows are:

| Source row | Unresolved requirement |
| --- | --- |
| `book-mechanics-p48-r02` | Dished-head factor and applicable calibration/design code |
| `book-machine-p50-r07` | Weld reduction coefficient and joint/material/workmanship basis |
| `book-machine-p50-r11` | Effective weld-length deduction and applicable joint/start-stop assessment |
| `book-machine-p51-r09` | Bearing-clearance chart coefficient and applicability |
| `book-machine-p52-r02` | Bearing-friction chart coefficient and applicability |
| `book-c14-p212-r04` | Historical grain virtual-GM factor, not approved grain-stability data |

No new ordinary practice question depends on an excluded model. Real vessel KN curves, grain data, manufacturer NPSH curves and empirical chart coefficients are not invented. The heavy-lift extension explicitly uses a synthetic rectangular hull, distinguishing mass already aboard from mass added from outside. The pump extension uses separately supplied NPSHr at the duty point. Refrigeration diagrams are supplied-enthalpy balances; ideal engine cycles use constant heat capacities. Existing IF97 range/phase restrictions remain in force. Source scans and appendix tables are not redistributed.

## Verification

The complete workflow-equivalent local source/DOM/reference run passed 62 commands; the additional Education asset audit checks 122 local script/stylesheet references against the offline shell. The new model reference suite makes 1,706 assertions. The practice DOM suite grades all 292 answers and checks preserved progress, chapter ordering, filters, exact/tiny/comma/signed input and solution gating. Model DOM checks cover all six studies and 25 exports.

Real browser checks cover 1440, 390 and 320 px, all six new models and 39 plot views per engine, keyboard input, scenario download/restore, optional draft reload, invalid-output clearing, SVG/control visibility, practice and embedded chapter navigation. Screenshots are captured under `qa-education-<engine>/review-20261030/`. Final CI and protected-preview status are recorded on the draft pull request.

Detailed records: `STUDENTS_FULL_EXPRESSION_EVIDENCE_2026-10-30.csv`, `STUDENTS_PRIMARY_FORMULA_REVIEW_2026-10-30.csv`, and the frozen test context `tests/fixtures/students-full-review-context-20261030.json`. Default CI compares the frozen context; it never silently refreshes a stale review.
