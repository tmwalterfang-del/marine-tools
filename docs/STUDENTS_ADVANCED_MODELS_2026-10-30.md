# Thirteen connected engineering models

Part of the 42-item expansion in PR #52, based on the reviewed Education branch. The private preview scope remains separate from public Education and app publication.

The catalogue now contains 45 public module IDs. The 13 additions run on `students/advanced-lab.html`, reuse the numerical table/report/scenario components and participate in the existing prediction/comparison/applied-question learning cycle. Individual schemas state the physical boundary and sign/unit conventions.

| Module | Numerical method and boundary |
| --- | --- |
| Free-body diagram | Cartesian vector sum and moment transport; a balancing force/couple, not assumed support reactions |
| Plane truss | Linear 2-D axial finite elements; pin plus vertical roller; singular mechanisms rejected |
| Euler column | Effective-length elastic bifurcation with supplied proportional-limit comparison; no allowable-load claim |
| Thermal restraint | Uniform thermal strain plus imposed axial compatibility; constant properties |
| Pipe network | Fixed Darcy/minor-loss quadratic resistances; exact common/parallel or series balance |
| Hydraulic circuit | Incompressible fixed pump delivery, cap/annulus areas, opposing load, relief and end-stop balances |
| Rankine | Qualified local IF97 Regions 1/2/4 states, incompressible pump work, turbine isentropic efficiency |
| Refrigeration p–h | R134a HEOS-generated bounded tables, entropy/enthalpy inversion, isenthalpic valve and cycle energy balance |
| Kirchhoff network | Conductance matrix with grounded ideal source; ideal probes and independent power/KCL checks |
| Induction motor | Referred per-phase T circuit and Thevenin check; developed mechanical power before mechanical losses |
| Unbalanced three-phase | Complex neutral-node equation for ideal/finite/floating neutral; phasor/power conservation |
| Relative motion | Constant planar velocity vectors; signed TCPA and future-time-constrained CPA |
| Bearing fix | Least-squares line geometry; first-order independent Gaussian bearing covariance and approximate 95% ellipse |

## Evidence

`tests/students-advanced-reference-20261030.mjs` checks all schemas and finite outputs, explicit analytic cases, matrix scale invariance, conservation laws, singular and invalid states, four full cycles from an independent IF97 implementation and six full refrigeration cycles from direct CoolProp state solves. Its 18,092 assertions include recursive finite-value checks; that count is not a claim of 18,092 independent physical reference cases. Maximum COP relative error in those six frozen interpolation comparisons is 0.000796 (about 0.080%); this sampled result is not a global interpolation-error guarantee.

`tests/students-advanced-ui-20261030.cjs` exercises the actual HTML, all 13 valid default models and 52 report/scenario/data/diagram exports. The shared DOM learning-cycle test covers all 45 modules across seven actual pages. The shared discovery browser test passes all 45 cycles and 66 mobile plot views in local Chromium, Firefox and WebKit, including pointer editing, reload, exports and progress. Broader CI checks are run on the PR head before completion.

Generated R134a properties and the two independent cycle fixtures are reproducible with `scripts/generate-refrigerant-reference-20261030.py` and CoolProp 7.2.0. The browser ships no Python or CoolProp executable. Existing IF97 attribution remains in `students/IF97_ATTRIBUTION.md`; new table attribution and the upstream MIT licence are in `students/REFRIGERANT_ATTRIBUTION.md`.

Primary references: [OpenStax Kirchhoff rules](https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules), [MIT induction machines](https://www.ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/01f878366fe651f1b95e9ed7fc24c644_MIT6_061S11_ch10.pdf), [CoolProp R134a](https://coolprop.org/fluid_properties/fluids/R134a.html). Geometric, axial-stiffness, flow and energy equations are independently constrained by the stated analytic reference cases and invariants.

## Private and offline boundary

The service worker treats both `.pages.dev` and `.chatgpt.site` as private online previews. Neither caches protected pages or source. Any explicitly downloaded offline Education package is built separately; it does not relax either origin's authentication boundary.
