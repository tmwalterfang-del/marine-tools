# MarineTools — preview and scientific review, 20 October 2026

This revision removes the Resources tab, corrects scientific descriptions and missing quantities, and expands reproducible checks. It targets the existing Draft PR #35 preview branch. On 20 October 2026 at 19:35 Europe/Oslo, the user explicitly authorized updating the preview while keeping the production merge blocked until testing is satisfactory. This is **not a blanket scientific approval of all 575 formula families or all 1,498 source expressions**.

## What changed

- Removed the Resources tab, content and route from the student workspace. Existing `#resources` bookmarks fall back to Formulas. Original source catalogue links remain inside formula details.
- CPA: the future-only clamp is explicit, and zero relative velocity is identified as constant separation with no unique CPA time.
- Coulomb friction: distinguished kinetic equality from the static-friction inequality.
- Hydraulic cylinder: identified differential pressure and the limitation of a single effective area. Pump efficiency is strictly positive.
- Proportional controller: positive gain with error SP−PV is reverse acting with respect to PV, matching the PID lab.
- LMTD: explicitly stated the equal-terminal-difference limit and excluded temperature crossing.
- Added missing Q_rev to reversible entropy transfer, z_c to three counterweight expressions, V_in/time to the differentiator, and arc length to the course-curvature relation. The latter's course is in radians.
- Rechecked printed p.163. Its 1.13 vertical-film condensation coefficient is retained as a labelled legacy empirical variant. It is not identified as the classical smooth-film Nusselt coefficient 0.943. A Reynolds ceiling alone does not calibrate that coefficient.
- Updated the service-worker cache version and CI checks. Formula IDs, bookmarks and module scenarios are retained.

The symbol register now has 8,041 contextual definitions grouped into 3,242 meanings. The seven added contexts define quantities actually used by the expressions; they are not invented aliases.

## Formula review scope

The displayed catalogue and relationship register were inspected across all sixteen chapters for relationships, signs, units and stated conditions. Earlier source-reading statuses were retained; this turn did **not** newly reread all 201 scanned equation pages. Printed p.163 was reopened to investigate the condensation coefficient.

Two accompanying ledgers prevent metadata completeness from being mistaken for independent verification:

- `STUDENTS_FORMULA_FAMILY_REVIEW_2026-10-20.csv`: all 575 families, conditions, symbol counts and source linkage. 334 have captured source variants; 241 do not. A missing captured variant is not, by itself, evidence of an incorrect equation.
- `STUDENTS_SCIENTIFIC_REVIEW_MATRIX_2026-10-20.csv`: all 1,498 relationships, existing source/numeric/symbolic statuses, this pass's automated dimensional result and exact reason when parsing is unsupported.

The new dimensional parser compares the shipped formula text against its own declared quantities using mass, length, time, temperature, current, amount, currency and luminous-intensity dimensions. It does not infer missing quantities. It does not certify scale factors, degree/radian conversions, physical assumptions, empirical coefficients or numerical accuracy. Zero identities and formulas containing unit-bearing numerical conversion factors are explicitly excluded from this test.

| Chapter | Relationships | Dimensional pass | Not parsed by this checker |
|---|---:|---:|---:|
| Mathematics | 262 | 20 | 242 |
| Physics | 82 | 23 | 59 |
| Mechanics | 204 | 196 | 8 |
| Machine elements | 53 | 53 | 0 |
| Chemistry | 70 | 37 | 33 |
| Electrical engineering | 144 | 132 | 12 |
| Electronics | 126 | 90 | 36 |
| Power electronics | 51 | 49 | 2 |
| Engine theory | 107 | 101 | 6 |
| Steam theory | 35 | 33 | 2 |
| Heat and flow | 143 | 102 | 41 |
| Refrigeration | 26 | 24 | 2 |
| Navigation | 50 | 29 | 21 |
| Cargo and stability | 121 | 104 | 17 |
| Economics | 14 | 8 | 6 |
| Corrected displacement | 10 | 10 | 0 |
| **Total** | **1,498** | **1,011** | **487** |

No dimensional failures remain among parsed expressions. Unsupported rows retain their separate symbolic/numeric evidence; they do not become passes. Existing numerical status labels still include pending entries even where a chapter-level test covers selected cases. This review does not manufacture per-expression numeric evidence from those aggregate tests.

## Interactive models

All fifteen selections were opened in the authenticated Cloudflare preview and populated with calculated results: loading/discharge; synthetic GZ; heavy lift; trim; tank filling; current vectors; engine/fuel; pump/system; heat exchanger; Mollier; signals/PID; RLC; crankshaft deflection; cooling fault tree; investment.

The new conservation suite runs 291 parameter cases and 24,114 assertions/sample checks. These are points on balances and curves, not 24,114 independent scientific validations. It covers heat-exchanger hot/cold energy balance, endpoint temperatures, no local crossing, zero UA and LMTD; analytic RLC half-power roots; pump/system intersection and hydraulic energy; tank mass and subdivision; lifting equilibrium; trim endpoints and LCF pivot; current-vector addition; dated cash flows; transmitter round trips; PID convergence; engine fuel energy; reversible loading/discharge.

Existing tests additionally cover GZ quadrature, IF97 published references, crankshaft examples, fault-branch priorities, invalid-input handling and scenario transactions. No new module was added during this acceptance pass.

Useful next teaching modules, without duplicating the existing ones:

1. Refrigeration cycle: input enthalpy states, COP, compressor input and condenser/evaporator energy balance, initially without claiming a complete refrigerant property solver.
2. Psychrometrics: humidity ratio, relative humidity, dew point, dry-air-basis mixing and sensible/latent cooling.
3. NPSH and cavitation margin: absolute/gauge pressure, suction elevation, vapour pressure and losses linked to the existing pump curve.
4. Battery/generator dispatch: usable energy, efficiencies, power limits and time-series load allocation with explicit example data.

## Browser, export and whole-site verification

- Authenticated preview access worked with the existing session; no access policy was changed.
- Verified the main page, Project & contact → For Students, chapter overview, symbol search and module selection. The screenshot's ∇ case remains one meaning with four formula links.
- All fifteen modules populated. Example outputs included PID PV≈60% at 180 s, pump flow≈70.7107 m³/h, engine brake power≈2,171.5 kW and the demonstration ledger ending at 10,500 t.
- A Mollier HTML report was actually downloaded through the preview. Its 67,260 bytes contained one embedded SVG, three tables and a parseable `mollier-if97` snapshot. The browser download-event waiter timed out, but the visible success message and synchronized downloaded file confirmed generation. Actual PDF printing is not claimed.
- HTML/SVG/CSV/JSON and scenario reopen behavior for the module families pass DOM integration tests, including invalid-input blocking and stale-output clearing.
- The full local run completed **37 test files with zero failures**, including existing core-site regressions and symbolic mathematics.
- Whole-site source audit checks local references and JS syntax. Core DOM tests exercise simulated providers; they are not live AIS/weather acceptance.
- Main-page live-data status showed **Live data unavailable** in this browser. Live-provider success is therefore not accepted by this review.

Remaining acceptance limits: physical-device/mobile interaction, installed offline/PWA operation, actual PDF printing, all live providers and independent numerical/domain validation of every expression. Nothing here authorizes a production merge.

## References used for disputed/precise points

- IAPWS, industrial IF97 release: https://www.iapws.org/relguide/IF97-Rev.pdf
- Purdue refrigeration-conference paper, classical condensation comparison, Eq.17: https://citeseerx.ist.psu.edu/document?doi=02b55da5e475555eb5f06a5b1f888612d0802c8d&repid=rep1&type=pdf
- Original photographed handbook p.163, inspected privately; scans are not published with the app.

## Revenue experiments

Suggested prices are proposed tests, not market estimates or revenue forecasts. The strongest options match existing work:

| Offer | Small initial experiment |
|---|---|
| Original scenario packs | 79–149 NOK for a coherent topic with worked solutions and report examples |
| Teacher/class licence | 1,500–4,000 NOK per class/year, with original assignments, teaching notes and reusable JSON scenarios |
| Custom company tool | A scoped paid pilot priced after requirements; one customer-specific calculator/report can fund free public tools |
| Workshop | 199–399 NOK per participant for a small live training session |
| Branded classroom/company edition | Setup fee plus maintenance for a private, branded study workspace |
| Embed licence | Annual fee for a school or training provider embedding selected modules |
| Sponsor by topic | Fixed-term, clearly labelled sponsor of an educational topic, with no influence over results |

The existing voluntary-support option can remain. Do not put already-promised free exports behind a paywall without a separate product decision. Any paid package should use original content or content with established reuse rights. Stripe Payment Links supports one-off sales and subscriptions, but does not itself implement gated-content access: https://stripe.com/en-no/payments/payment-links

## Delivery and release policy

The previous push attempt was blocked by automatic approval review. The user subsequently explicitly authorized updating the existing preview branch in Draft PR #35. Publication proceeds within that scope. The previous public branch head was `34026bbb7b107a8e43432115390aa905c6d649a2`; local implementation and documentation were prepared in `3255e9e` and `cb39e42`.

Keep PR #35 as Draft. Do not enable auto-merge, merge into main or deploy to production until testing is complete and the user is satisfied and explicitly authorizes release. Preview updates remain authorized while testing continues.
