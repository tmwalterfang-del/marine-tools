# Marine Tools for Students — focused workstream 2 + 3
**2026-10-20 | Draft PR #35 | no main/production merge**

## 2. Full formula-book review — what was completed this session
- Reopened the user's physical-book ZIP locally: **284 images**.
- Inspected the mechanics/machine elements portion visually, including printed **p. 42** (source photo clearly shows axial stress, Hooke's law, bar elongation, direct shear and pin/joint stress).
- Added **seven independent descriptions of standard equations** on source p. 42 with formula-specific symbol, SI-unit and assumptions dictionaries:
  - average axial stress
  - engineering strain
  - linear elastic Hooke law
  - elastic bar extension
  - average direct shear stress
  - simplified projected pin bearing pressure
  - round-pin shear stress with n effective planes
- These are contextual source readings, not an independent certification of all mechanical models, and are not copied diagrams or publisher prose.
- New entries use unique IDs; the only formulas added this round are the seven printed-p.42 mechanics relationships. **Current Draft total: 444 formulas**, **59 calculators**, **36 exercises**.
- Source photos for the rest of the book remain available, but a complete *equation-by-equation* review of the remaining printed pages has **not** been completed. Do not imply 16 chapters have been verified.
- Mechanics terminology and idealizations to recheck: one vs. multiple shear planes, tension vs. compression sign, local stress concentrations in pins, fatigue factors.

## 3. Mollier h–s diagram — current implementation and extension
- Existing interactive chart: browser-based saturation dome, quality lines, pressure-to-property interpolation from 21 tabulated anchors, two states A/B, enthalpy and entropy delta, local CSV export.
- Added a **wet-region isentropic endpoint** control: keeping state A's entropy, solve vapour quality at state B's pressure, then recompute enthalpy. The algorithm **rejects** any endpoint outside 0≤x≤1 instead of inventing a superheated/compressed-liquid state.
- Added a dedicated user-facing button **Set B: isentropic from A**.
- Test `tests/students-mechanics-mollier-20261020.mjs`: **35/35 PASS**, covering 444 catalog count, seven mechanics symbol contexts, numeric dimensional examples, and isentropic wet-state calculations and range rejection.
- Earlier `tests/students-mollier-20261020.mjs` had **40/40 PASS** (base interpolation and UI/offline structural assertions), but these are isolated logic tests, **not browser/instrument QA**.

## Next step: complete IF97 property engine (not installed or claimed complete)
**Primary standard:** IAPWS R7-97(2012), [official technical release](https://iapws.org/technical-guidance/release/IF97-Rev). The release supplies industrial water/steam properties, regions and official verification cases.
**Candidate implementation:** [@neutrium/thermo.eos.iapws97](https://github.com/neutrium/thermo.eos.iapws97), TypeScript/JavaScript CommonJS library requiring a browser bundle; repository identifies CC BY 4.0 as its license. Before integration, verify current package release, notices, redistribution and compile footprint.
**Acceptance gates:**
1. Vendor/build deterministic browser bundle with version pinned and proper credit/license; confirm bundle never calls remote APIs.
2. Verify p-T and p-s region selections against official IAPWS test values at region boundaries.
3. Handle regions 1, 2, 3, 4 and 5 explicitly, including pressure/temp/entropy validity and critical/near-critical cases.
4. Offer superheated region plotting and true process trajectories only after validated EOS computations.
5. Add unit-control and error messages for nonphysical states; do not confuse pressure bar(a) with gauge pressure or specific enthalpy with mechanical work.
6. Benchmark on desktop and actual mobile, run accessibility checks and offline PWA upgrade tests.
**Current blocker:** The isolated coding container cannot reach npm registry. No complete IF97 dependency has been fetched, bundled or certified this session. The existing saturation interpolation and wet-steam isentropic features remain accessible in Draft preview.

## Release gates
- Full school/source book formula-and-symbol audit across 16 chapters **PENDING**.
- Complete physical device/browser PDF/a11y verification **PENDING**.
- Current composite regression suite needs counts refreshed for 444 entries and to be run together.
- Draft PR only, explicit owner signoff for merge.
