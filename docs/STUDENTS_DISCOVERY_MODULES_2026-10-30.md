# Interactive learning cycles and eleven additional modules

Scope: protected Education preview, `feature/education-full-formula-review`, PR #51. The shared catalogue contains 32 modules: the 21 existing modules and all 11 requested additions. No production or Android release is part of this change.

## Learning cycle

Every module has the same expandable **Predict → change → compare → solve** activity:

1. Choose a finite result, predict its direction and optionally its value, and record a proposed change/reasoning. This locks an immutable baseline from the current valid model.
2. Change at least one actual model input. A formatting-only edit is canonicalised and does not count. Invalid model states cannot be compared.
3. Compare the selected quantity with its baseline in the same unit. The other numerical results can also be compared. A changed quantity definition or unit requires a new prediction.
4. Solve an applied question generated from the compared model state. A worked solution becomes available after a valid attempt. Changing the model again blocks grading until it is compared again.

The applied questions cover mass moments, tank mass, transmitter scaling, fuel/heat/energy balances, resonance, navigation distance, discounting, uncertainty, geometry, units and the other module relations. Fault-tree activity uses the fraction of flagged observations, explicitly not a failure probability. No live machinery diagnosis or vessel acceptance is inferred.

Cycle state is stored separately per public module ID in `mt-student-cycle-v1:<id>`. Baselines, predictions, comparison states, question snapshots and raw answer drafts survive reload. Invalid/newer storage formats are guarded; unavailable storage falls back to the current session. Correct applied answers update `mt-student-cycles-completed-v1`; the progress dashboard lists all 32 cycles separately from the existing 292 curated exercises. Resetting learning progress clears both learning systems, while bookmarks and interactive input drafts remain separate.

## Added models

| ID | Model | Teaching boundary |
| --- | --- | --- |
| `section` | Six-component rectangle/circle/hole builder; centroid, parallel-axis and principal second moments; coordinate/drag editing, geometry export and Ix transfer to the beam | Nonoverlapping solid components; nonoverlapping holes inside one solid; geometry only |
| `three-phase` | Balanced star/delta R+jX load, source voltage/current phasors, RMS traces, power triangle and capacitor bank | Sinusoidal balanced source and identical branches; no protection, switching or harmonic assessment |
| `gears` | Two-to-four external gears or a four-gear compound train; signed speed, torque and mesh power loss | Ideal kinematics with supplied mesh efficiency; no tooth strength/backlash model |
| `psychrometrics` | Heating, cooling/drain condensation, equal-pressure dry-air mixing, humidity chart | Ideal gas mixture, liquid-water saturation 0–50 °C; no extrapolated subzero dew point or fog mixture |
| `waves` | Travelling-wave superposition, beats and one-way source/observer Doppler | Linear 1-D stationary medium, subsonic signed velocities; resolved frequency ratios |
| `units` | Scale/offset conversions through SI, including powers of length and temperature differences | Compatible dimensions only; absolute temperatures cannot be below 0 K |
| `mohr` | Plane-stress tensor rotation, principal stresses and Mohr circle | Stated shear convention, maximum **in-plane** shear; no allowable stress assessment |
| `harmonics` | Fundamental plus five distinct integer harmonics, RMS spectrum, THD and sampled waveform/crest factor | No DC or interharmonics; RMS/THD analytical, peaks explicitly sampled |
| `hydrostatics` | Synthetic hull station areas, trapezoid/Simpson integration, displacement, waterplane, local TPC and KB | Defined hull family, equal station spacing, no real-vessel tables or loading approval |
| `uncertainty` | Independent uniform input intervals, first-order propagation, exact monotonic extrema and seeded sampling | 4,096 samples; empirical percentiles are not promised coverage intervals |
| `titration` | Strong/weak monoprotic acid plus strong base, charge/mass/water equilibrium across equivalence | Ideal concentrations, additive volumes, 25 °C, no activity/heat/polyprotic model |

All models expose finite numerical alternatives to their graphs, explicit units and assumptions, scenario JSON, CSV and HTML reports. Data tables initially show 25 rows with a further-rows control; exports retain the complete plotted series. Geometry-bearing models also include their sketch in reports and offer a separate SVG download. Animations are optional and stop when their module is hidden. Existing module IDs and the reviewed formula/calculator records remain stable.

## Verification and references

- `tests/students-discovery-reference-20261030.mjs`: 1,429 independent numeric, invariant and invalid-domain checks covering all eleven models.
- `tests/students-learning-cycle-engine-20261030.mjs`: immutable snapshots, changed-input and unit checks, grading gates, stale-state rejection and persistence boundaries.
- `tests/students-learning-cycle-ui-20261030.cjs`: actual six module pages and all 32 learning cycles, from prediction to correct applied answer and stored completion.
- `tests/students-model-lab-ui-20261030.cjs`: all 17 engineering model views and export paths, retained inputs and transactional imports.
- `tests/students-discovery-cycle-browser-20261030.cjs`: all 32 cycles in real browsers, both phone widths, reload, geometry export/transfer, phasors, animation and dashboard integration.
- Existing responsive, acceptance and single-scroll browser suites now traverse all 32 modules. Full formula/source evidence and previous independent model tests remain in the validation job.

Primary references used for model review: [MIT stress transformations](https://web.mit.edu/course/3/3.11/www/Lectures/Lecture16.pdf), [PsychroLib documented psychrometric relations](https://psychrometrics.github.io/psychrolib/_modules/psychrolib.html), [JCGM uncertainty guides](https://www.bipm.org/en/committees/jc/jcgm/publications), [GUM first-order propagation](https://www.iso.org/sites/JCGM/GUM/JCGM100/C045315e-html/C045315e_FILES/MAIN_C045315e/05_e.html), [OpenStax acid–base titrations](https://openstax.org/books/chemistry-2e/pages/14-7-acid-base-titrations), and [UCLA Doppler explanation](https://dbauer.physics.ucla.edu/5b/22-doppler-effect/). The remaining models are checked with independent geometry, circuit/energy identities, analytic integrals and unit definitions. See `students/PSYCHROMETRIC_ATTRIBUTION.md` for upstream attribution.

Automated browser and semantic checks do not constitute physical-device or screen-reader certification. Learning cycles are local educational activities, not supervised examinations.
