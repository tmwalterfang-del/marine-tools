/* Original topic expansion from independent technical relationships; reviewed with user-provided textbook chapter samples.
 No publisher prose/tables/images are reproduced. Engineering examples are educational only. */
(function(){'use strict'; if(!Array.isArray(window.MT_FORMULAS))throw Error('Load formulas.js first');
const extra=[
 {
  "id": "ext-complex-number-magnitude",
  "category": "Advanced Mathematics",
  "name": "Complex number magnitude",
  "formula": "|z| = √(a² + b²)",
  "note": "For z = a + bi, a and b real.",
  "tags": "complex plane",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-complex-multiplication",
  "category": "Advanced Mathematics",
  "name": "Complex multiplication",
  "formula": "(a + bi)(c + di) = (ac − bd) + (ad + bc)i",
  "note": "i² = −1.",
  "tags": "complex numbers",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-euler-relation",
  "category": "Advanced Mathematics",
  "name": "Euler relation",
  "formula": "e^(iθ) = cos θ + i sin θ",
  "note": "Angle θ in radians.",
  "tags": "phasor complex",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-binomial-probability",
  "category": "Advanced Mathematics",
  "name": "Binomial probability",
  "formula": "P(X = k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ",
  "note": "n independent Bernoulli trials, 0≤p≤1.",
  "tags": "probability",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-sample-variance",
  "category": "Advanced Mathematics",
  "name": "Sample variance",
  "formula": "s² = Σ(xᵢ − x̄)²/(n−1)",
  "note": "Sample size n > 1.",
  "tags": "statistics",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-vector-dot-product",
  "category": "Advanced Mathematics",
  "name": "Vector dot product",
  "formula": "a·b = |a||b|cos θ",
  "note": "Euclidean inner product.",
  "tags": "vectors",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-vector-cross-product-magnitude",
  "category": "Advanced Mathematics",
  "name": "Vector cross product magnitude",
  "formula": "|a×b| = |a||b|sin θ",
  "note": "3D vectors.",
  "tags": "vectors",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-spherical-cosine-rule",
  "category": "Advanced Mathematics",
  "name": "Spherical cosine rule",
  "formula": "cos c = cos a cos b + sin a sin b cos C",
  "note": "Spherical triangle side angles a,b,c and included angle C.",
  "tags": "spherical trig",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-geometric-series-sum",
  "category": "Advanced Mathematics",
  "name": "Geometric series sum",
  "formula": "Sₙ = a(1−rⁿ)/(1−r)",
  "note": "r ≠ 1, n positive integer.",
  "tags": "sequences",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-wave-speed",
  "category": "Physics & Waves",
  "name": "Wave speed",
  "formula": "v = fλ",
  "note": "For a periodic travelling wave.",
  "tags": "wavelength wave",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-wave-period",
  "category": "Physics & Waves",
  "name": "Wave period",
  "formula": "T = 1/f",
  "note": "Frequency f > 0.",
  "tags": "wave",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-refractive-index",
  "category": "Physics & Waves",
  "name": "Refractive index",
  "formula": "n = c/v",
  "note": "Phase velocity v in medium.",
  "tags": "optics",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-snell-s-law",
  "category": "Physics & Waves",
  "name": "Snell's law",
  "formula": "n₁ sin θ₁ = n₂ sin θ₂",
  "note": "Angles measured from the surface normal.",
  "tags": "optics",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-sound-intensity-level",
  "category": "Physics & Waves",
  "name": "Sound intensity level",
  "formula": "L = 10 log₁₀(I/I₀)",
  "note": "I and reference I₀ positive, W/m².",
  "tags": "sound decibel",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-frequency-from-period",
  "category": "Physics & Waves",
  "name": "Frequency from period",
  "formula": "f = 1/T",
  "note": "Period T > 0.",
  "tags": "waves",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-amount-of-substance",
  "category": "Chemical Engineering",
  "name": "Amount of substance",
  "formula": "n = m/M",
  "note": "Mass m and molar mass M in compatible units.",
  "tags": "moles",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-molar-concentration",
  "category": "Chemical Engineering",
  "name": "Molar concentration",
  "formula": "c = n/V",
  "note": "Solution volume V in litres for mol/L.",
  "tags": "chemistry concentration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-dilution-relation",
  "category": "Chemical Engineering",
  "name": "Dilution relation",
  "formula": "c₁V₁ = c₂V₂",
  "note": "Conserved solute moles, no reaction.",
  "tags": "dilution",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-mass-fraction",
  "category": "Chemical Engineering",
  "name": "Mass fraction",
  "formula": "w = msolute/msolution",
  "note": "Masses in matching units.",
  "tags": "mixing",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-mass-percentage",
  "category": "Chemical Engineering",
  "name": "Mass percentage",
  "formula": "w% = 100 msolute/msolution",
  "note": "Consistent mass units.",
  "tags": "mixing",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ph-from-hydrogen-ion-activity",
  "category": "Chemical Engineering",
  "name": "pH from hydrogen ion activity",
  "formula": "pH = −log₁₀(aH⁺)",
  "note": "Dimensionless ion activity; concentration approximation requires care.",
  "tags": "acids",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-hydrogen-ion-activity-from-ph",
  "category": "Chemical Engineering",
  "name": "Hydrogen ion activity from pH",
  "formula": "aH⁺ = 10^(−pH)",
  "note": "Idealised dimensionless hydrogen ion activity.",
  "tags": "acids",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ideal-reaction-yield",
  "category": "Chemical Engineering",
  "name": "Ideal reaction yield",
  "formula": "yield% = 100 actual/theoretical",
  "note": "Same quantity units, theoretical > 0.",
  "tags": "chemical reactions",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-negative-feedback-closed-loop-gain",
  "category": "Electronics & Telecommunications",
  "name": "Negative feedback closed-loop gain",
  "formula": "Afb = A/(1 + Aβ)",
  "note": "Ideal negative feedback model; sign and loop stability matter.",
  "tags": "amplifier feedback",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-voltage-amplifier-gain",
  "category": "Electronics & Telecommunications",
  "name": "Voltage amplifier gain",
  "formula": "Av = Vout/Vin",
  "note": "Ratio of signal amplitudes on consistent basis.",
  "tags": "amplifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-voltage-gain-in-decibels",
  "category": "Electronics & Telecommunications",
  "name": "Voltage gain in decibels",
  "formula": "GdB = 20 log₁₀(|Vout/Vin|)",
  "note": "Equal reference impedances or voltage ratio definition.",
  "tags": "amplifier dB",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-power-gain-in-decibels",
  "category": "Electronics & Telecommunications",
  "name": "Power gain in decibels",
  "formula": "GdB = 10 log₁₀(Pout/Pin)",
  "note": "Positive powers.",
  "tags": "decibel",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-rc-cutoff-frequency",
  "category": "Electronics & Telecommunications",
  "name": "RC cutoff frequency",
  "formula": "fc = 1/(2πRC)",
  "note": "First-order RC filter.",
  "tags": "filter frequency",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-rl-cutoff-frequency",
  "category": "Electronics & Telecommunications",
  "name": "RL cutoff frequency",
  "formula": "fc = R/(2πL)",
  "note": "First-order RL circuit.",
  "tags": "filter",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-bipolar-transistor-current-gain",
  "category": "Electronics & Telecommunications",
  "name": "Bipolar transistor current gain",
  "formula": "β = Ic/Ib",
  "note": "Simplified forward-active BJT relation.",
  "tags": "transistor",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-noninverting-op-amp-gain",
  "category": "Electronics & Telecommunications",
  "name": "Noninverting op-amp gain",
  "formula": "Av = 1 + Rf/Rg",
  "note": "Ideal negative-feedback op-amp.",
  "tags": "operational amplifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-inverting-op-amp-gain",
  "category": "Electronics & Telecommunications",
  "name": "Inverting op-amp gain",
  "formula": "Av = −Rf/Rin",
  "note": "Ideal op-amp, linear feedback regime.",
  "tags": "operational amplifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-nyquist-sampling-condition",
  "category": "Electronics & Telecommunications",
  "name": "Nyquist sampling condition",
  "formula": "fs > 2 fmax",
  "note": "Band-limited input with ideal antialiasing.",
  "tags": "sampling telecom",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-digital-data-rate",
  "category": "Electronics & Telecommunications",
  "name": "Digital data rate",
  "formula": "bit/s = bits transferred / seconds",
  "note": "Sustained average data rate.",
  "tags": "digital",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ideal-full-wave-rectifier-average",
  "category": "Power Electronics",
  "name": "Ideal full-wave rectifier average",
  "formula": "Vdc = 2 Vpeak/π",
  "note": "Full-wave rectified sine, ideal diodes, resistive load, no smoothing.",
  "tags": "rectifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ideal-half-wave-rectifier-average",
  "category": "Power Electronics",
  "name": "Ideal half-wave rectifier average",
  "formula": "Vdc = Vpeak/π",
  "note": "Positive half-wave of sine, ideal diode, resistive load.",
  "tags": "rectifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-bridge-rectifier-with-diode-drops",
  "category": "Power Electronics",
  "name": "Bridge rectifier with diode drops",
  "formula": "Vdc ≈ (2 Vpeak/π) − 2Vd",
  "note": "Approximation assuming diode drop in conduction.",
  "tags": "rectifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-dc-dc-buck-converter",
  "category": "Power Electronics",
  "name": "DC–DC buck converter",
  "formula": "Vout ≈ D Vin",
  "note": "Ideal continuous-conduction buck, 0≤D≤1.",
  "tags": "converter",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-dc-dc-boost-converter",
  "category": "Power Electronics",
  "name": "DC–DC boost converter",
  "formula": "Vout ≈ Vin/(1−D)",
  "note": "Ideal continuous-conduction boost, 0≤D<1.",
  "tags": "converter",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-pwm-average-voltage",
  "category": "Power Electronics",
  "name": "PWM average voltage",
  "formula": "Vavg ≈ D Vhigh + (1−D)Vlow",
  "note": "Switching average, duty cycle D.",
  "tags": "pwm",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ripple-voltage-capacitor-estimate",
  "category": "Power Electronics",
  "name": "Ripple voltage capacitor estimate",
  "formula": "ΔV ≈ Iload/(fripple C)",
  "note": "Approximate capacitor discharge under constant load.",
  "tags": "filter rectifier",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-ideal-inverter-power-balance",
  "category": "Power Electronics",
  "name": "Ideal inverter power balance",
  "formula": "Pin ≈ Pout",
  "note": "Lossless converter assumption only.",
  "tags": "inverter",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-axial-bolt-stress",
  "category": "Machine Elements & Strength",
  "name": "Axial bolt stress",
  "formula": "σ = F/Astress",
  "note": "Axial force and specified tensile stress area.",
  "tags": "bolt",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-bearing-stress",
  "category": "Machine Elements & Strength",
  "name": "Bearing stress",
  "formula": "p = F/Aprojected",
  "note": "Uniform projected-area approximation.",
  "tags": "bearing",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-shear-stress-average",
  "category": "Machine Elements & Strength",
  "name": "Shear stress average",
  "formula": "τavg = F/Ashear",
  "note": "Direct shear, average over area.",
  "tags": "fastener",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-elastic-extension",
  "category": "Machine Elements & Strength",
  "name": "Elastic extension",
  "formula": "ΔL = FL/(AE)",
  "note": "Axial linear-elastic member, uniform section.",
  "tags": "elastic",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-solid-circular-torsion-stress",
  "category": "Machine Elements & Strength",
  "name": "Solid circular torsion stress",
  "formula": "τmax = 16T/(πd³)",
  "note": "Solid circular shaft, linear elastic torsion.",
  "tags": "shaft",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-solid-circular-shaft-polar-moment",
  "category": "Machine Elements & Strength",
  "name": "Solid circular shaft polar moment",
  "formula": "J = πd⁴/32",
  "note": "Circular solid cross section.",
  "tags": "shaft",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-torsional-twist",
  "category": "Machine Elements & Strength",
  "name": "Torsional twist",
  "formula": "θ = TL/(JG)",
  "note": "Linear elastic shaft, constant T,J,G.",
  "tags": "shaft",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-safety-factor",
  "category": "Machine Elements & Strength",
  "name": "Capacity-to-demand margin",
  "formula": "n = allowable limit / applied demand",
  "note": "Matching measure, positive applied demand.",
  "tags": "design",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-isothermal-gas-process",
  "category": "Engine Processes",
  "name": "Isothermal gas process",
  "formula": "p₁V₁ = p₂V₂",
  "note": "Fixed ideal gas amount, constant temperature.",
  "tags": "isothermal",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-adiabatic-ideal-gas-process",
  "category": "Engine Processes",
  "name": "Adiabatic ideal-gas process",
  "formula": "pV^κ = constant",
  "note": "Reversible adiabatic ideal gas, κ = cp/cv.",
  "tags": "otto gas",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-polytropic-process",
  "category": "Engine Processes",
  "name": "Polytropic process",
  "formula": "pVⁿ = constant",
  "note": "Approximate fitted exponent n for model.",
  "tags": "polytropic",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-otto-cycle-ideal-efficiency",
  "category": "Engine Processes",
  "name": "Otto cycle ideal efficiency",
  "formula": "η = 1 − 1/(r^(κ−1))",
  "note": "Ideal constant-heat-capacity Otto cycle, compression ratio r>1.",
  "tags": "otto",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-compression-ratio",
  "category": "Engine Processes",
  "name": "Compression ratio",
  "formula": "r = VBDC/VTDC",
  "note": "Cylinder volumes at bottom and top dead center.",
  "tags": "engine",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-piston-swept-volume",
  "category": "Engine Processes",
  "name": "Piston swept volume",
  "formula": "Vs = πB²S/4",
  "note": "Cylinder bore B and stroke S.",
  "tags": "engine",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-total-swept-engine-volume",
  "category": "Engine Processes",
  "name": "Total swept engine volume",
  "formula": "Vtotal = zπB²S/4",
  "note": "z cylinders of identical bore and stroke.",
  "tags": "engine",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-mean-piston-speed",
  "category": "Engine Processes",
  "name": "Mean piston speed",
  "formula": "um = 2Sn/60",
  "note": "Stroke S metres, engine speed n rpm.",
  "tags": "engine",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-wet-steam-enthalpy",
  "category": "Steam & Refrigeration",
  "name": "Wet steam enthalpy",
  "formula": "h = hf + x hfg",
  "note": "Saturated two-phase state at specified pressure; dryness fraction x between 0 and 1.",
  "tags": "steam",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-steam-quality-from-enthalpy",
  "category": "Steam & Refrigeration",
  "name": "Steam quality from enthalpy",
  "formula": "x = (h−hf)/hfg",
  "note": "Saturated mixture; hfg>0 and 0≤x≤1.",
  "tags": "steam",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-enthalpy-of-superheated-steam-estimate",
  "category": "Steam & Refrigeration",
  "name": "Enthalpy of superheated steam estimate",
  "formula": "h₂ ≈ h₁ + cp ΔT",
  "note": "Approximate constant cp over interval.",
  "tags": "steam",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-specific-volume-density-relation",
  "category": "Steam & Refrigeration",
  "name": "Specific volume density relation",
  "formula": "ρ = 1/v",
  "note": "Specific volume v>0.",
  "tags": "steam",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-heat-exchanger-energy-balance",
  "category": "Steam & Refrigeration",
  "name": "Heat exchanger energy balance",
  "formula": "Q̇ = ṁ cp ΔT",
  "note": "Single-phase approximation at near-constant cp.",
  "tags": "heat exchanger",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-relative-humidity",
  "category": "Steam & Refrigeration",
  "name": "Relative humidity",
  "formula": "φ = pv/psat(T)",
  "note": "Vapour partial pressure and saturation pressure at same T.",
  "tags": "humidity",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-refrigeration-cooling-capacity",
  "category": "Steam & Refrigeration",
  "name": "Refrigeration cooling capacity",
  "formula": "Q̇e = ṁ (h₁−h₄)",
  "note": "Vapour-compression cycle, states at evaporator inlet/outlet.",
  "tags": "refrigeration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-compressor-specific-work",
  "category": "Steam & Refrigeration",
  "name": "Compressor specific work",
  "formula": "w = h₂−h₁",
  "note": "Adiabatic steady-flow idealisation.",
  "tags": "refrigeration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-refrigeration-cop-from-enthalpy",
  "category": "Steam & Refrigeration",
  "name": "Refrigeration COP from enthalpy",
  "formula": "COP = (h₁−h₄)/(h₂−h₁)",
  "note": "Idealised vapor compression cycle, positive compressor work.",
  "tags": "refrigeration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-refrigerant-mass-flow",
  "category": "Steam & Refrigeration",
  "name": "Refrigerant mass flow",
  "formula": "ṁ = Q̇e/(h₁−h₄)",
  "note": "Energy basis consistent.",
  "tags": "refrigeration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-volumetric-compressor-efficiency",
  "category": "Steam & Refrigeration",
  "name": "Volumetric compressor efficiency",
  "formula": "ηv = V̇suction / V̇swept",
  "note": "Actual suction volume divided by geometric swept volume.",
  "tags": "compressor",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-heat-rejection-from-condenser",
  "category": "Steam & Refrigeration",
  "name": "Heat rejection from condenser",
  "formula": "Q̇c = ṁ(h₂−h₃)",
  "note": "Simple steady-flow condenser.",
  "tags": "refrigeration",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-exact-fisher-real-interest",
  "category": "Engineering Economics",
  "name": "Exact Fisher real interest",
  "formula": "rreal = (1 + inominal)/(1 + inflation) − 1",
  "note": "Rates as decimal fractions, inflation > −1.",
  "tags": "economics interest",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-net-present-value",
  "category": "Engineering Economics",
  "name": "Net present value",
  "formula": "NPV = Σ[CFt/(1+r)^t] − I₀",
  "note": "Discrete-period cash flows at end of periods; r > −1.",
  "tags": "npv",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-level-annuity-present-value",
  "category": "Engineering Economics",
  "name": "Level annuity present value",
  "formula": "PV = A[1−(1+r)^−n]/r",
  "note": "n positive periods; r ≠ 0, payment at period end.",
  "tags": "annuity",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-level-annuity-payment",
  "category": "Engineering Economics",
  "name": "Level annuity payment",
  "formula": "A = PV r/[1−(1+r)^−n]",
  "note": "n positive periods, r ≠ 0.",
  "tags": "annuity",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-simple-payback-period",
  "category": "Engineering Economics",
  "name": "Simple payback period",
  "formula": "T = I₀ / annual net cash flow",
  "note": "Constant positive annual net inflow, undiscounted.",
  "tags": "payback",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-straight-line-depreciation",
  "category": "Engineering Economics",
  "name": "Straight-line depreciation",
  "formula": "D = (purchase price − residual)/years",
  "note": "Years > 0, uniform annual depreciation.",
  "tags": "depreciation",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-break-even-quantity",
  "category": "Engineering Economics",
  "name": "Break-even quantity",
  "formula": "QBE = fixed cost/(unit price − variable unit cost)",
  "note": "Positive contribution margin, linear cost/revenue model.",
  "tags": "break even",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-draft-mark-correction-linear-trim",
  "category": "Marine Advanced",
  "name": "Draft mark correction (linear trim)",
  "formula": "δd = offset × trim / Lpp",
  "note": "Sign depends on mark position/reference; small trim linear geometry.",
  "tags": "draft survey",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-mean-of-corrected-end-drafts",
  "category": "Marine Advanced",
  "name": "Mean of corrected end drafts",
  "formula": "Tmean = (Tf + Ta)/2",
  "note": "Uses corrected forward/aft drafts; not automatically true hydrostatic mean.",
  "tags": "draft survey",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-hog-sag-first-correction-three-drafts",
  "category": "Marine Advanced",
  "name": "Hog/sag first correction (three drafts)",
  "formula": "δT = [(Tf + Ta)/2 − Tmid]/3",
  "note": "One commonly used three-draft approximation; validated draft-survey procedure needed.",
  "tags": "draft survey",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-trim-from-draft-readings",
  "category": "Marine Advanced",
  "name": "Trim from draft readings",
  "formula": "trim = Ta − Tf",
  "note": "State aft-positive sign convention.",
  "tags": "trim",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-heel-from-shifted-transverse-weight",
  "category": "Marine Advanced",
  "name": "Heel from shifted transverse weight",
  "formula": "tan θ ≈ w·d/(Δ·GM)",
  "note": "Small angles; positive GM; simplified upright condition.",
  "tags": "stability",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-free-surface-transverse-inertia-rectangle",
  "category": "Marine Advanced",
  "name": "Free surface transverse inertia rectangle",
  "formula": "I = lb³/12",
  "note": "Rectangular horizontal free surface, length l, breadth b.",
  "tags": "tank stability",
  "reviewStatus": "initial independent QA; full subject review pending"
 },
 {
  "id": "ext-draft-survey-displacement-difference",
  "category": "Marine Advanced",
  "name": "Draft survey displacement difference",
  "formula": "cargo ≈ Δfinal − Δinitial − Δnoncargo",
  "note": "Each displacement correctly hydrostatically and density corrected; noncargo definition explicit.",
  "tags": "draft survey",
  "reviewStatus": "initial independent QA; full subject review pending"
 }
];
const ids=new Set(window.MT_FORMULAS.map(x=>x.id));
for(const row of extra){if(ids.has(row.id))throw Error('Duplicate formula: '+row.id);ids.add(row.id)}
window.MT_FORMULAS.push(...extra);
})();
