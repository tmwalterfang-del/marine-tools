# Student navigation and symbol review — 20 October 2026

## Navigation

All eight student pages now share Formula library, Interactive modules and Chapters, with Main site as the exit link. The landing page has two starting actions rather than seven overlapping module/library links. Chapter links open modules in the shared workspace; standalone module URLs remain usable. The fifteen modules are grouped into five subject areas and can be searched. Embedded modules hide their duplicate headers and experiment selectors so the workspace menu stays authoritative. Formula links return to the full library; exact source-variant links open the matching expression and its disclosure panels.

## Symbol findings and changes

The old lookup rendered every formula-local definition as a separate card. The initial register had 8,035 contextual entries. One unsupported P-as-proportional-band example was removed: the actual catalogued formula uses PB. The remaining **8,034 contexts** are all retained, grouped into **3,236 symbol/meaning/unit cards**. This is presentation consolidation, not removal of source definitions.

The screenshot's ∇ entries are one displacement-volume card with six contextual definitions and four formula-family references. The two prime/derivative labels are one card. Exact repeated meanings and a small, explicitly enumerated synonym list are consolidated. Letter case, different meanings, different units and individual source statuses are retained. Q as charge, volume flow and heat, C as capacitance versus integration constant, and P as power versus bearing load are not conflated. The full register is searchable; single-glyph queries prefer the exact case-sensitive symbol. Eight discipline filters and incremental pages of sixty cards keep the lookup manageable.

**123 contextual labels were clarified** through exact source-label/glyph rules, without changing units or equation conditions. Examples: cp/cv distinguish constant-pressure/constant-volume heat capacity; R in the specific-gas-constant group is not a heat capacity; BMEP is brake mean effective pressure rather than absolute gas pressure; Q/W/ΔH/ΔU distinguish heat, work, enthalpy change and internal-energy change; mass and mole fractions are distinguished. The explicit rules and synonym list are in students/symbol-review-20261020.js. Chemical/non-symbolic expressions no longer receive a misleading generic “symbolic rule checked” status in the lookup.

This is a full structural pass over the symbol register, selected editorial corrections and reviewed equivalence rules. It is not an independent proof of every physical assumption or every equation. Remaining source validation status is visible inside each formula's details, not repeated as a warning on every top-level card.

## Verification

The focused DOM test checks lossless grouping, unit separation, every reference count, the screenshot examples, Q/PB disambiguation, corrected definitions, honest source status, pagination, discipline filtering, precise source-variant navigation after hash routing, shared navigation, module search and embedded controls. Existing student, full-site source and core DOM regression tests are rerun. The public preview and browser checks are reported separately from these automated checks.

Local verification: all 35 test files passed. The source audit covered 12 HTML pages, 111 JS files and 97 local resource references with no issues or warnings. The focused symbol/navigation suite passed 6,640 structural/DOM checks; these are not 6,640 independent scientific proofs.
