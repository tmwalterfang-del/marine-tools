# Formula source audit — Chapters 1–2 (20 October 2026)

**PR #35 is Draft. Production/main is not part of this work.**

## Exact input scope
- Primary user-provided source: `Teknisk formelsamling.zip` (284 photographed viewer screenshots).
- Mathematic chapter: printed pp. **7–22** (16 scans).
- Physics chapter: printed pp. **23–29** (7 scans).
- Earlier physically photographed spot reviews: pp. **79, 150 and 197**.
- No source-book images, diagrams, data tables or publisher prose are copied into the public repository.
- The individual formulas are standard scientific relationships with **independent** English titles and explanations. Do not treat this release as a digital copy of the book.

## What is actually completed
### Mathematics, pp. 7–22
Thematic manual inspection of each of the 16 scanned pages; **37 additional standard formula entries** and **22 existing formula entries** enriched with symbol names, units, assumptions and approximate source-page references.
Focus: arithmetic and geometric progressions, Taylor/Maclaurin/binomial forms, area/volume, trig addition/double-angle, analytic geometry, derivatives, moments of area, spherical trig, complex numbers, probability.
**Not done:** enumerating, testing and editorially verifying every alternate printed identity, parameter branch and mathematical restriction throughout the chapter.

### Physics, pp. 23–29
Thematic manual inspection of all seven scans; **20 additional standard relations** and **8 existing formula entries** supplied/reviewed with context-level symbol definitions.
Focus: specific weight, molar volume, temperature conversions, ideal monatomic gas, thermal expansion, latent heat, ideal sound-wave speeds, illuminance and luminous efficacy.
**Not done:** all historical models and every signal/optics variant in the chapter; Doppler relationship and historical constants intentionally need deeper independent review.

### Combined student library on branch
- **429 total formula entries** (previous: 372; +57).
- **52 educational calculators**, **30 self-authored exercise examples** unchanged.
- **117 entries** currently carry context-specific symbol definition tables (some definitions provisional).
- **346 contextual symbol meanings** are indexed, including repeated glyphs with distinct per-formula identities.
- **100 formula IDs** are linked to a photographed textbook page as a topical or selected notation check. **None is thereby certified as fully independently numerically verified**.
- Two prior source-only smoke/DOM-stub suites: **203 + 23 passing checks**.
- New `tests/students-chapters-math-physics-20261020.mjs`: **35 passing selected numeric/structural independent checks**.
- **261 combined automated checks**, all isolated source/DOM/numeric checks, **not real-browser or physical-device QA**.

## Critical source cautions, not silently “corrected”
1. **Thermometric constant (printed p.24):** some expressions use ~273 K. The exact relation for Celsius-to-Kelvin offset is **273.15**. Record source's approximate presentation separately from the modern exact constant.
2. **Doppler variants (pp.27–28):** printed relationship must be scoped to source, observer, frequency convention and approximation; do not offer it as a universal exact result.
3. **Speed of sound (p.28):** `√(E/ρ)` is a specific rod longitudinal-wave approximation; using Young's modulus for a liquid without a compressibility/bulk modulus framework is inappropriate.
4. **Luminous vs acoustic vs electric symbols:** `I`, `Q`, `P`, `E` change meaning across formula/domain; only per-formula definitions may drive any UI/calculator.
5. **Spherical geometry:** sides may be measured as angular arcs, not linear lengths; trigonometric relations require angle-domain definitions.
6. **Taylor series:** derivatives and convergence domain are essential; not an equality for every infinitely differentiable function.
7. **Photographic OCR precision:** formulas were inspected visually. No large-scale OCR transcription or blanket symbol autoapproval has occurred.

## Review status files
- `docs/STUDENTS_FORMULA_AUDIT_MATRIX_2026-10-20_V2.csv`: **429 formula-level rows**, with provisional symbol table, topic photo review, calculator mapping and pending independent verification status.
- `docs/STUDENTS_BOOK_218_PAGE_REVIEW_MATRIX_2026-10-20.csv`: **218 book-page rows**, separating:
  - 23 pages with **thematic chapter scans reviewed** (NOT every equation approved).
  - 3 physically photographed pages **79, 150, 197** previously spot-checked.
  - 192 pages **not yet individually reviewed**.
- Note older `*_2026-10-19.csv` and `*_2026-10-20.csv` matrix versions are historical; V2 is now the up-to-date formula matrix.

## Next order of work (the user's full-book goal remains unchanged)
1. **Mechanics pp.30–48**, then **machine elements pp.49–54**, then **chemistry pp.55–78**.
2. Add selected independently phrased formulas, unit/symbol definitions and numerical regression cases.
3. Continue electrical pp.79–98 (with already photographed p.79), electronics, power electronics, engines, steam, thermo/fluid, refrigeration, navigation, cargo/stability, economics and corrected displacement.
4. Check exercise relevance and any real calculator link individually. Never infer a link merely from its category.
5. Request additional physical close-ups **only** where a specific printed equation/symbol is illegible.
6. Run real browser (desktop/mobile, accessibility, print PDF, offline/PWA) and full independent numeric review before asking the user for release authorization.

**No merge or deployment to production is authorized by this document.**