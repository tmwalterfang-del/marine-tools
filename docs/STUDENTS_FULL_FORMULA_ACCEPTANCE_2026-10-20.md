# Marine Tools for Students — complete formula acceptance criteria

The user has requested **one consolidated review of the entire 284-image source archive**, not isolated chapter deliveries.

## Source distinction
- 284 JPG scans are a photographic source archive, not evidence of review by themselves.
- Existing formula catalogue: 499 entries. Existing source matrix: 499 entries after reconciliation.
- Topical chapter correspondence must **never** be reported as an equation-level scan check.
- Source-photo review, domain/units review and independent numerical validation are **three separate statuses**.
- Copyrighted book artwork/tables/long prose must not be copied into the published application.

## Required fields for every published formula
1. Unique formula ID and topic.
2. Independently worded English title and correct mathematical relationship.
3. Conditions with sign conventions and domain restrictions.
4. Full formula-specific symbol table: symbol, physical meaning, unit (use “dimensionless” as appropriate). All variables actually used in the formula must be represented, including intermediate symbols.
5. Correct chapter/topic reference; exact printed page only after seeing that equation on that page.
6. Explicit source-review status and any uncertainty.
7. Unit/dimensional audit, worked numerical example where applicable, and documented reference value.
8. Exact calculator linkage only if the calculator actually implements the equation.

No user-facing formula is considered **editorially complete** if it falls back to “Symbol definitions are under editorial review”.

## Reproducible audit
Run:
```bash
node tests/students-formula-completeness-20261020.mjs docs/STUDENTS_FORMULA_COMPLETENESS_LATEST.csv
REQUIRE_COMPLETE_FORMULA_METADATA=1 node tests/students-formula-completeness-20261020.mjs
```
The default mode produces transparent counts without claiming success. Strict mode fails while metadata are incomplete.

## Work still needed
- Independently inspect every readable printed source page in the archive; map image file to printed page and **each printed equation**.
- Reconcile the printed equations with the existing 499 formulas; add missing relations without duplicates.
- Supply formula-specific symbol details for every existing/new entry, preferably in data packs and not inferred heuristically.
- Validate dimensions, boundary conditions and numerical examples; correct formula implementations and calculators when warranted.
- Run all student and IF97 tests; do actual browser/mobile checks.
- Do not merge PR #35 or deploy to production without user approval.

### Targeted editorial corrections in this work
- `first-law-closed-system`: internal energy, net heat inward and work outward in joules, consistent sign convention.
- `specific-fuel-oil-consumption`: g/kWh consumption, mass in g and delivered shaft energy in kWh over the same period.

These two additions are **not** claimed to complete the 284-image book audit.
