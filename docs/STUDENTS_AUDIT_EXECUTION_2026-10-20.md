# Students formula verification — measured CI checkpoint (20 October 2026)

GitHub Actions run: https://github.com/tmwalterfang-del/marine-tools/actions/runs/39397257190

## Actually executed on PR #35 feature branch

- Catalogue smoke: PASS, 244 checks, 499 formulas, 59 calculators, 36 exercises.
- Simulated UI smoke: PASS, 24 checks.
- Math/physics selected references: PASS, 35 checks, historical test-fixture count 429 (not full catalogue).
- Mechanics/Mollier selected references: PASS, 35 checks, historical fixture count 444 (not full catalogue).
- Mollier reference interpolation: PASS, 40 checks.
- IAPWS IF97 selected reference points: PASS, 38 assertions.
- Formula editorial metadata audit executed: 499 formulas; 190 have explicit and structurally complete symbol definitions; 309 lack complete editorial metadata; 107 have photo-review annotations; 392 lack individual equation photo-review.
- Machine-readable audit artifact: https://github.com/tmwalterfang-del/marine-tools/actions/runs/39397257190/artifacts/12252760502

## Interpretation

Automated test PASS demonstrates integrity of the implemented features, **not** that all 499 equations have been numerically proven or checked against every one of the 284 textbook images.
The photo review labels denote editorial comparison of selected notation, **not** independent mathematical validation.
All formulas missing symbol metadata must remain visibly incomplete until properly defined; do not auto-infer units from glyphs (e.g. Q and P are context-dependent).
The archived source images are not stored in this public repository, and the publisher's images must not be committed to the public repository.

## Current acceptance blockers

1. 309 current formulas missing complete specific symbol tables.
2. Full printed-page-to-equation index for all 284 images absent.
3. Independent numerical/domain verification still missing for most formula entries.
4. Real browser/mobile QA missing.
5. No production merge or deployment authorized.
