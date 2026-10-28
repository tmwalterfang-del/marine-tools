# Education electrical reference cases — 28 October 2026

This preview-only follow-up is based on Draft PR #47 at `93dd0478e4e1a4a6ad00516834ceda4ead4fc529`. It adds educational numerical evidence and reference-case choices. It does not merge Education to main, publish it to production, or change the Android app.

## Numerical scope

Twelve previously numeric-PENDING source expressions gain 22 independently explained fixture cases: two-wire DC voltage drop, Faraday average emf, inductive back emf, perpendicular motional emf, passive RL time constant, linear inductor energy, zero-offset sine RMS current, balanced star voltage, balanced delta current, total three-phase apparent power, ideal turns ratio and ideal load-current ratio.

The new cases include zero current/speed/flux change, reversed flux/current change, reversed inductor current, and both step-down and step-up turns ratios. Units and references distinguish signed back emf from passive terminal voltage, RMS magnitudes from instantaneous/peak quantities, per-phase values from line values, and apparent VA from active W. The voltage-drop example uses one-way route length and the area of each conductor; it is an arithmetic reference, not cable-sizing approval.

The shared fixture now contains **341 cases for 321 distinct expressions across 16 chapters**. **967 expressions retain numeric PENDING status**, and six unresolved historical models remain reference only. Both evidence ledgers are synchronized. The expressions, conditions, local symbols, context digests and analytical decisions are unchanged; only twelve numeric-evidence fields are promoted. No source-book examples/images were copied or reread in this pass. The original 319 fixture cases are preserved.

A separate physical reference program makes **47 selected checks** across the same twelve expressions. It integrates squared sine samples and magnetic work, solves passive RL decay numerically, constructs 120° phasor differences, checks winding flux/current/VA balances and rejects non-finite arithmetic at selected zero denominators. A square-wave counterexample protects the pure-sine RMS assumption. These additional checks are distinct from the fixture-case count and do not establish full-domain or empirical model validity.

## Learner-facing changes

There are now 22 worked-example panels across 12 formula families, containing 32 selectable reference cases in total. Seven panels offer a labelled selector for reference, zero and/or reversed-sign cases. Selecting a case updates its inputs, method, result and summary; it keeps keyboard focus on the selector and works independently in the formula library and saved sheet.

A display bug was found when adding resistivity and conductor-area examples: fixed five-decimal rounding would display 1.72e-8 Ω·m as zero. Worked examples now use eight significant digits and scientific notation for small/large values. The DC example visibly retains 1.72E-8 Ω·m and 2.5E-6 m². This changes example display formatting only; the existing calculator formatting and formula strings are preserved.

Formulas still retain their source-specific assumptions, units and selected-case limitation. The example-opening action uses the existing reduced-motion CSS rather than forcing smooth scrolling. The one-column mobile formula list now uses ordinary document flow so WebKit recomputes the full height of long open cards during narrow reflow. Browser checks verify card actions stay inside the card and can be clicked after a resize. Desktop retains the existing grid.

## Reference basis

The physical constructions follow these primary educational/manufacturer sources; numerical inputs and prose are independently authored:

- OpenStax, [Motional Emf](https://openstax.org/books/university-physics-volume-2/pages/13-3-motional-emf): swept area, changing flux and perpendicular motion.
- OpenStax, [Energy in a Magnetic Field](https://openstax.org/books/university-physics-volume-2/pages/14-3-energy-in-a-magnetic-field): energy from integrated instantaneous power.
- OpenStax, [RL Circuits](https://openstax.org/books/university-physics-volume-2/pages/14-4-rl-circuits): Kirchhoff loop balance and characteristic decay time.
- OpenStax, [Simple AC Circuits](https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits): RMS as the root of the mean square for sinusoidal current.
- OpenStax, [Transformers](https://openstax.org/books/university-physics-volume-2/pages/15-6-transformers): shared flux per turn and ideal winding ratios.
- Schneider Electric Electrical Installation Guide, [Definition of reactive power](https://www.electrical-installation.org/enwiki/Definition_of_reactive_power): balanced three-phase apparent power and distinction between line and phase quantities. The star/delta reference calculations independently subtract rectangular phasors rather than copying a √3 multiplier.

## Validation

Local fixture, generated-data parity, per-expression ledger, full-register dimension/context, all-chapter, DOM, symbol navigation and chapter navigation checks pass. DOM tests cover small-value preservation, zero/sign alternatives, local saved-sheet choices, focus retention and HTML escaping. The browser test exercises actual selectors, results, summaries and reflow at 1440, 390 and 320 pixels in Chromium (Edge), Firefox and WebKit. The new physical reference program is included in Education CI. Remote results and protected preview URL are recorded in the stacked Draft PR.

Remaining scope includes the 967 numeric-PENDING expressions, six unresolved models, the 152 special dimensional grammars, and broader domain/physical-device acceptance. This round does not claim that every registered expression is independently numerically verified.
