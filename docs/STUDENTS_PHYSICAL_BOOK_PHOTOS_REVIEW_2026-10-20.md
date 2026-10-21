# Source-photo review: printed pages 79, 150, 197
**Date:** 2026-10-20 · **Scope:** user-supplied physical book photos · **Branch:** PR #35 (Draft)

## Source and reuse boundary
The user photographed all requested sections of their physical copy of *Teknisk formelsamling med tabeller*. Images are retained as conversation inputs, **not** embedded or redistributed in public GitHub. This report discusses standard equations and their independently written symbol/units interpretation, with book page identifiers only.

The photos are legible for the requested variable and unit checks. Image quality is no longer a blocker for these three pages. The user's handwritten annotations are independent study notes, **not** preapproved mathematical truth. We have not verified every handwritten relationship or all the published formulas in the book.

## Printed page 79 – Electrical Engineering
- Printed: charge `Q=I·t`; quantity `Q` charge **C**, `I` current **A**, `t` time **s**.
- Conductor resistance: `R=ρℓ/A`; conductor resistivity `ρ` **Ω·m**, length `ℓ` **m**, area `A` **m²**. Marine Tools may use `ρₑ` to avoid collision with mass density.
- Temperature correction: `R=R₀(1+αΔt)` where `α` **K⁻¹** and temperature difference **K**, with explicitly printed **positive heating, negative cooling** sign convention. UI version uses `ΔT` to avoid `t` being confused with elapsed time.
- `G=1/R` conductance **S**; `γ=1/ρₑ` conductivity **S/m**. Ohm: `U=RI`.
- Handwritten changes show equivalent electrical power and resistance relationships. A note that appears to multiply three-phase power by `η` must NOT become a general electrical input/output law without verifying where efficiency is applied; `√3`, power factor and current reference must be stated.

## Printed page 150 – Boiler and steam
Five numbered material streams in the boiler/reheater energy balance:
1. `ṁ₁h₁`: superheated steam leaving.
2. `ṁ₂h₂`: cooled/desuperheated steam leaving.
3. `ṁ₃h₃`: feedwater entering.
4. `ṁ₄h₄`: reheat steam entering.
5. `ṁ₅h₅`: reheated steam leaving.

Efficiency = **sum of outgoing enthalpy flows minus incoming enthalpy flows divided by fuel energy input**. Each mass flow **kg/s**, each specific enthalpy **J/kg**; denominator fuel flow `ṁ_B` **kg/s** times heating value **J/kg**. **Notational caution:** formula's denominator visually has `ṁ_B h` while the adjacent legend labels heating value `h_g`; independent UI uses `Hfuel` with explanatory mapping. No book's chart, illustration or table is copied.

The empirical Siegert flue-gas loss formula on the same page uses a fuel-dependent coefficient K. Its source graph is not digitized or reused; before inclusion as a numerical calculator it needs an independently sourced, suitable model and a clarified validity range.

## Printed page 197 – Cargo and ship hydrostatics
- Midship area `A_M=B·d·C_M`, midship-area coefficient dimensionless.
- Block coefficient `C_B=∇/(L·B·d)`, with **m³** displaced volume and consistent length, breadth and draught in **m**.
- TPC `=A_w·ρ/100` for density **t/m³**, waterplane area **m²**, outcome **t/cm**. The printed seawater substitution is `ρ=1.025 t/m³` and is **not a universal density**.
- Transverse metacentric radius `BM=I_T/∇`, with `I_T` **m⁴** and `∇` **m³**. Rectangular waterplane idealization: `I_T=L·B³/12`.
- **Deferred density and draught formula:** the photographed `Δ_dB = Δ_ds·ρ_s/ρ_B` convention can easily be confused with the distinct standard physical relationship for *mass at fixed submerged volume* `Δ_B = Δ_s·ρ_B/ρ_s`. These equations solve different reference/lookup situations and must NOT be offered interchangeably. First clarify the reference quantity being transformed from the book's legend/hydrostatic scale.
- **Deferred draft approximation:** the printed linearized draft density correction requires unit and reference checks (plus load-line vs hydrostatic conditions). Do not offer as a general vessel loading calculator yet.
- `BM ≈ 0.09·B²/d` depends on a specific approximate coefficient assumption; it is not a universally valid identity.

## Implemented as independent student relationships
Six new formula records:
- Electric charge from constant current.
- Resistance temperature correction.
- Conductance and reciprocal resistance.
- Conductivity and reciprocal resistivity.
- Midship immersed section area.
- Five-stream boiler and reheater heat balance.

Plus source/photo-specific symbol and unit explanation metadata for matching original entries including Ohm's law, conductor resistivity, block coefficient, waterplane TPC, metacentric radius and waterplane inertia.

**Catalogue after change: 372 formulas**, **52 calculators**, **30 practice exercises**. Three source pages have contextual photo status; this is **not** a claim that all 372 formulas have been verified against the book.

## Remaining work
Carry forward the systematic **full scanned book page audit**. Request clearer physical photos only when a specific unreadable equation or variable list is identified. Independent mathematical checks, source licensing review, actual browser/mobile/PWA checks and owner merge authorization remain required.

**No images of the source pages in the codebase. No production merge.**
