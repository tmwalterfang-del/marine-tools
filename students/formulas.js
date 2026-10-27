/* Marine Tools for Students · independent factual formula references.
   Formulas are mathematical relationships, not copied book pages.
   All explanations, examples and UI are independently authored.
   Teaching/reference use only; vessel-specific data and approved loading software govern operational use. */
window.MT_FORMULAS = [
 {
  "id": "linear-equation",
  "category": "Mathematics",
  "name": "Linear equation",
  "formula": "ax + b = 0 ⇒ x = −b/a",
  "note": "a ≠ 0",
  "tags": "algebra, rearrange"
 },
 {
  "id": "quadratic-equation",
  "category": "Mathematics",
  "name": "Quadratic equation",
  "formula": "ax² + bx + c = 0 ⇒ x = (−b ± √(b² − 4ac))/(2a)",
  "note": "a ≠ 0; real roots when discriminant ≥ 0",
  "tags": "roots"
 },
 {
  "id": "difference-of-squares",
  "category": "Mathematics",
  "name": "Difference of squares",
  "formula": "a² − b² = (a − b)(a + b)",
  "note": "Factorisation identity",
  "tags": "algebra"
 },
 {
  "id": "binomial-square",
  "category": "Mathematics",
  "name": "Binomial square",
  "formula": "(a + b)² = a² + 2ab + b²",
  "note": "Algebraic identity",
  "tags": "algebra"
 },
 {
  "id": "laws-of-exponents",
  "category": "Mathematics",
  "name": "Laws of exponents",
  "formula": "aᵐ · aⁿ = aᵐ⁺ⁿ",
  "note": "For compatible powers and defined expressions",
  "tags": "powers"
 },
 {
  "id": "negative-exponent",
  "category": "Mathematics",
  "name": "Negative exponent",
  "formula": "a⁻ⁿ = 1/aⁿ",
  "note": "a ≠ 0",
  "tags": "powers"
 },
 {
  "id": "logarithm-product",
  "category": "Mathematics",
  "name": "Logarithm product",
  "formula": "log(ab) = log(a) + log(b)",
  "note": "Positive arguments; same valid base",
  "tags": "log"
 },
 {
  "id": "logarithm-power",
  "category": "Mathematics",
  "name": "Logarithm power",
  "formula": "log(aⁿ) = n log(a)",
  "note": "a > 0",
  "tags": "log"
 },
 {
  "id": "arithmetic-mean",
  "category": "Mathematics",
  "name": "Arithmetic mean",
  "formula": "x̄ = Σxᵢ / n",
  "note": "n > 0",
  "tags": "statistics"
 },
 {
  "id": "weighted-mean",
  "category": "Mathematics",
  "name": "Weighted mean",
  "formula": "x̄ = Σ(wᵢxᵢ)/Σwᵢ",
  "note": "Weights sum nonzero",
  "tags": "statistics, cg"
 },
 {
  "id": "percentage-change",
  "category": "Mathematics",
  "name": "Percentage change",
  "formula": "p = 100(new − old)/old",
  "note": "old ≠ 0",
  "tags": "percent"
 },
 {
  "id": "compound-growth",
  "category": "Mathematics",
  "name": "Compound growth",
  "formula": "A = P(1 + r)ⁿ",
  "note": "r per period in decimal",
  "tags": "interest"
 },
 {
  "id": "derivative-power-law",
  "category": "Mathematics",
  "name": "Derivative power law",
  "formula": "d(xⁿ)/dx = nxⁿ⁻¹",
  "note": "Differentiable where applied",
  "tags": "calculus"
 },
 {
  "id": "integral-power-rule",
  "category": "Mathematics",
  "name": "Integral power rule",
  "formula": "∫xⁿ dx = xⁿ⁺¹/(n + 1) + C",
  "note": "n ≠ −1",
  "tags": "calculus"
 },
 {
  "id": "radians-from-degrees",
  "category": "Mathematics",
  "name": "Radians from degrees",
  "formula": "θrad = θdeg · π/180",
  "note": "Angle conversion",
  "tags": "angle"
 },
 {
  "id": "degrees-from-radians",
  "category": "Mathematics",
  "name": "Degrees from radians",
  "formula": "θdeg = θrad · 180/π",
  "note": "Angle conversion",
  "tags": "angle"
 },
 {
  "id": "pythagorean-theorem",
  "category": "Geometry & Trigonometry",
  "name": "Pythagorean theorem",
  "formula": "c² = a² + b²",
  "note": "Right triangle, c hypotenuse",
  "tags": "triangle"
 },
 {
  "id": "sine-rule",
  "category": "Geometry & Trigonometry",
  "name": "Sine rule",
  "formula": "a/sin A = b/sin B = c/sin C",
  "note": "Triangle angles opposite sides",
  "tags": "triangle"
 },
 {
  "id": "cosine-rule",
  "category": "Geometry & Trigonometry",
  "name": "Cosine rule",
  "formula": "c² = a² + b² − 2ab cos C",
  "note": "Any triangle; C between a and b",
  "tags": "triangle"
 },
 {
  "id": "tangent-ratio",
  "category": "Geometry & Trigonometry",
  "name": "Tangent ratio",
  "formula": "tan θ = opposite/adjacent",
  "note": "Right triangle, adjacent nonzero",
  "tags": "triangle"
 },
 {
  "id": "circle-area",
  "category": "Geometry & Trigonometry",
  "name": "Circle area",
  "formula": "A = πr²",
  "note": "Radius r",
  "tags": "area"
 },
 {
  "id": "circle-circumference",
  "category": "Geometry & Trigonometry",
  "name": "Circle circumference",
  "formula": "C = 2πr",
  "note": "Radius r",
  "tags": "distance"
 },
 {
  "id": "triangle-area",
  "category": "Geometry & Trigonometry",
  "name": "Triangle area",
  "formula": "A = bh/2",
  "note": "Base b and perpendicular height h",
  "tags": "area"
 },
 {
  "id": "trapezium-area",
  "category": "Geometry & Trigonometry",
  "name": "Trapezium area",
  "formula": "A = (a + b)h/2",
  "note": "Parallel sides a,b; height h",
  "tags": "area"
 },
 {
  "id": "rectangle-area",
  "category": "Geometry & Trigonometry",
  "name": "Rectangle area",
  "formula": "A = ab",
  "note": "Side lengths a and b",
  "tags": "area"
 },
 {
  "id": "cylinder-volume",
  "category": "Geometry & Trigonometry",
  "name": "Cylinder volume",
  "formula": "V = πr²h",
  "note": "Circular cylinder",
  "tags": "volume"
 },
 {
  "id": "sphere-volume",
  "category": "Geometry & Trigonometry",
  "name": "Sphere volume",
  "formula": "V = 4πr³/3",
  "note": "Radius r",
  "tags": "volume"
 },
 {
  "id": "cone-volume",
  "category": "Geometry & Trigonometry",
  "name": "Cone volume",
  "formula": "V = πr²h/3",
  "note": "Right circular cone",
  "tags": "volume"
 },
 {
  "id": "simpson-s-1-3-rule",
  "category": "Geometry & Trigonometry",
  "name": "Simpson's 1/3 rule",
  "formula": "∫f(x)dx ≈ h/3 [y₀ + 4y₁ + 2y₂ + … + 4yₙ₋₁ + yₙ]",
  "note": "Even number of equal subintervals",
  "tags": "hydrostatics, integration"
 },
 {
  "id": "centroid-in-one-dimension",
  "category": "Geometry & Trigonometry",
  "name": "Centroid in one dimension",
  "formula": "x̄ = Σ(Aᵢxᵢ)/ΣAᵢ",
  "note": "Positive area elements",
  "tags": "centroid"
 },
 {
  "id": "polar-to-cartesian",
  "category": "Geometry & Trigonometry",
  "name": "Polar to Cartesian",
  "formula": "x = r cos θ; y = r sin θ",
  "note": "Consistent angle units",
  "tags": "coordinates"
 },
 {
  "id": "distance-in-plane",
  "category": "Geometry & Trigonometry",
  "name": "Distance in plane",
  "formula": "d = √[(x₂−x₁)² + (y₂−y₁)²]",
  "note": "Euclidean coordinates",
  "tags": "geometry"
 },
 {
  "id": "newton-s-second-law",
  "category": "Mechanics",
  "name": "Newton's second law",
  "formula": "F = ma",
  "note": "Net force, constant mass",
  "tags": "dynamics"
 },
 {
  "id": "weight-force",
  "category": "Mechanics",
  "name": "Weight force",
  "formula": "W = mg",
  "note": "Local gravitational acceleration g",
  "tags": "force"
 },
 {
  "id": "moment-torque",
  "category": "Mechanics",
  "name": "Moment / torque",
  "formula": "M = Fd⊥",
  "note": "Perpendicular lever arm d⊥",
  "tags": "torque"
 },
 {
  "id": "equilibrium-of-forces",
  "category": "Mechanics",
  "name": "Equilibrium of forces",
  "formula": "ΣF = 0",
  "note": "Static translational equilibrium",
  "tags": "statics"
 },
 {
  "id": "equilibrium-of-moments",
  "category": "Mechanics",
  "name": "Equilibrium of moments",
  "formula": "ΣM = 0",
  "note": "Static rotational equilibrium",
  "tags": "statics"
 },
 {
  "id": "work-from-constant-force",
  "category": "Mechanics",
  "name": "Work from constant force",
  "formula": "E = Fs cos θ",
  "note": "Straight displacement at angle θ",
  "tags": "work"
 },
 {
  "id": "power",
  "category": "Mechanics",
  "name": "Power",
  "formula": "P = E/t",
  "note": "Mean power for energy E over time t",
  "tags": "energy"
 },
 {
  "id": "translational-kinetic-energy",
  "category": "Mechanics",
  "name": "Translational kinetic energy",
  "formula": "Eₖ = mv²/2",
  "note": "Nonrelativistic",
  "tags": "energy"
 },
 {
  "id": "gravitational-potential-energy",
  "category": "Mechanics",
  "name": "Gravitational potential energy",
  "formula": "Eₚ = mgh",
  "note": "Uniform g over height h",
  "tags": "energy"
 },
 {
  "id": "linear-momentum",
  "category": "Mechanics",
  "name": "Linear momentum",
  "formula": "p = mv",
  "note": "Constant mass",
  "tags": "dynamics"
 },
 {
  "id": "impulse",
  "category": "Mechanics",
  "name": "Impulse",
  "formula": "J = FΔt = Δp",
  "note": "Constant resultant force or mean force",
  "tags": "dynamics"
 },
 {
  "id": "constant-speed-distance",
  "category": "Mechanics",
  "name": "Constant speed distance",
  "formula": "s = vt",
  "note": "Constant speed",
  "tags": "motion"
 },
 {
  "id": "uniform-acceleration-velocity",
  "category": "Mechanics",
  "name": "Uniform acceleration velocity",
  "formula": "v = v₀ + at",
  "note": "Constant acceleration",
  "tags": "motion"
 },
 {
  "id": "uniform-acceleration-distance",
  "category": "Mechanics",
  "name": "Uniform acceleration distance",
  "formula": "s = v₀t + at²/2",
  "note": "Constant acceleration",
  "tags": "motion"
 },
 {
  "id": "velocity-squared-equation",
  "category": "Mechanics",
  "name": "Velocity-squared equation",
  "formula": "v² = v₀² + 2as",
  "note": "Constant acceleration",
  "tags": "motion"
 },
 {
  "id": "centripetal-acceleration",
  "category": "Mechanics",
  "name": "Centripetal acceleration",
  "formula": "a = v²/r",
  "note": "Uniform circular motion",
  "tags": "motion"
 },
 {
  "id": "sliding-friction-model",
  "category": "Mechanics",
  "name": "Sliding friction model",
  "formula": "Ff = μN",
  "note": "Sliding kinetic friction magnitude uses kinetic μ. Static friction instead satisfies |Ff|≤μsN, reaching equality only at impending slip.",
  "tags": "friction"
 },
 {
  "id": "bending-stress-simple-beam",
  "category": "Mechanics",
  "name": "Bending stress (simple beam)",
  "formula": "σ = My/I",
  "note": "Elastic straight-beam theory",
  "tags": "strength"
 },
 {
  "id": "axial-stress",
  "category": "Mechanics",
  "name": "Axial stress",
  "formula": "σ = F/A",
  "note": "Uniform axial load assumption",
  "tags": "strength"
 },
 {
  "id": "axial-strain",
  "category": "Mechanics",
  "name": "Axial strain",
  "formula": "ε = ΔL/L₀",
  "note": "Original length L₀ > 0",
  "tags": "strength"
 },
 {
  "id": "hooke-s-law",
  "category": "Mechanics",
  "name": "Hooke's law",
  "formula": "σ = Eε",
  "note": "Linear elastic range only",
  "tags": "strength"
 },
 {
  "id": "density",
  "category": "Fluids & Hydraulics",
  "name": "Density",
  "formula": "ρ = m/V",
  "note": "Mass divided by volume",
  "tags": "density"
 },
 {
  "id": "hydrostatic-pressure",
  "category": "Fluids & Hydraulics",
  "name": "Hydrostatic pressure",
  "formula": "p = ρgh",
  "note": "Gauge pressure at depth h in static fluid",
  "tags": "pressure"
 },
 {
  "id": "absolute-pressure",
  "category": "Fluids & Hydraulics",
  "name": "Absolute pressure",
  "formula": "pabs = pgauge + patm",
  "note": "Consistent pressure units",
  "tags": "pressure"
 },
 {
  "id": "pressure-from-force",
  "category": "Fluids & Hydraulics",
  "name": "Pressure from force",
  "formula": "p = F/A",
  "note": "Normal load over area",
  "tags": "pressure"
 },
 {
  "id": "buoyancy-force",
  "category": "Fluids & Hydraulics",
  "name": "Buoyancy force",
  "formula": "Fᵦ = ρfluid g Vdisplaced",
  "note": "Archimedes' principle",
  "tags": "buoyancy"
 },
 {
  "id": "hydrostatic-load-on-horizontal-surface",
  "category": "Fluids & Hydraulics",
  "name": "Hydrostatic load on horizontal surface",
  "formula": "F = pA",
  "note": "Uniform pressure p",
  "tags": "pressure"
 },
 {
  "id": "volumetric-flow",
  "category": "Fluids & Hydraulics",
  "name": "Volumetric flow",
  "formula": "Q = V/t",
  "note": "Average volumetric flow",
  "tags": "pump"
 },
 {
  "id": "continuity-incompressible",
  "category": "Fluids & Hydraulics",
  "name": "Continuity (incompressible)",
  "formula": "A₁v₁ = A₂v₂",
  "note": "Steady incompressible one-stream flow",
  "tags": "flow"
 },
 {
  "id": "flow-rate-from-area",
  "category": "Fluids & Hydraulics",
  "name": "Flow rate from area",
  "formula": "Q = Av",
  "note": "Mean velocity through section",
  "tags": "flow"
 },
 {
  "id": "mass-flow",
  "category": "Fluids & Hydraulics",
  "name": "Mass flow",
  "formula": "ṁ = ρQ",
  "note": "Density consistent with volumetric flow",
  "tags": "flow"
 },
 {
  "id": "bernoulli-ideal",
  "category": "Fluids & Hydraulics",
  "name": "Bernoulli (ideal)",
  "formula": "p + ρgz + ρv²/2 = constant",
  "note": "Steady inviscid incompressible streamline; no work/losses",
  "tags": "bernoulli"
 },
 {
  "id": "pump-hydraulic-power",
  "category": "Fluids & Hydraulics",
  "name": "Pump hydraulic power",
  "formula": "Pₕ = ρgQH",
  "note": "Q in m³/s; head H in metres",
  "tags": "pump"
 },
 {
  "id": "pump-shaft-power",
  "category": "Fluids & Hydraulics",
  "name": "Pump shaft power",
  "formula": "Pshaft = ρgQH/η",
  "note": "Positive pump efficiency 0<η≤1; Q in m³/s, density kg/m³ and head m give watts.",
  "tags": "pump"
 },
 {
  "id": "darcy-weisbach-loss",
  "category": "Fluids & Hydraulics",
  "name": "Darcy–Weisbach loss",
  "formula": "hƒ = f(L/D)(v²/2g)",
  "note": "Straight-pipe friction, Darcy f",
  "tags": "pipe"
 },
 {
  "id": "reynolds-number",
  "category": "Fluids & Hydraulics",
  "name": "Reynolds number",
  "formula": "Re = ρvD/μ",
  "note": "Characteristic diameter D",
  "tags": "flow"
 },
 {
  "id": "dynamic-from-kinematic-viscosity",
  "category": "Fluids & Hydraulics",
  "name": "Dynamic from kinematic viscosity",
  "formula": "μ = ρν",
  "note": "Consistent SI units",
  "tags": "viscosity"
 },
 {
  "id": "ideal-hydraulic-cylinder-force",
  "category": "Fluids & Hydraulics",
  "name": "Ideal hydraulic cylinder force",
  "formula": "F = pA",
  "note": "Pressure DIFFERENCE across the effective piston area, not absolute pressure. No-loss single-area model; unequal rod/cap areas require separate pressure-force terms.",
  "tags": "hydraulics"
 },
 {
  "id": "heat-transfer-sensible",
  "category": "Thermodynamics",
  "name": "Heat transfer (sensible)",
  "formula": "Q = mcΔT",
  "note": "Approximate constant specific heat c",
  "tags": "heat"
 },
 {
  "id": "first-law-closed-system",
  "category": "Thermodynamics",
  "name": "First law (closed system)",
  "formula": "ΔU = Q − W",
  "note": "W is work done by system",
  "tags": "energy"
 },
 {
  "id": "ideal-gas-law",
  "category": "Thermodynamics",
  "name": "Ideal gas law",
  "formula": "pV = nRT",
  "note": "Ideal gas assumption; absolute temperature",
  "tags": "gas"
 },
 {
  "id": "gas-law-fixed-amount",
  "category": "Thermodynamics",
  "name": "Gas law (fixed amount)",
  "formula": "p₁V₁/T₁ = p₂V₂/T₂",
  "note": "Ideal gas, fixed n; kelvin",
  "tags": "gas"
 },
 {
  "id": "boyle-s-law",
  "category": "Thermodynamics",
  "name": "Boyle's law",
  "formula": "p₁V₁ = p₂V₂",
  "note": "Ideal gas at constant temperature",
  "tags": "gas"
 },
 {
  "id": "charles-law",
  "category": "Thermodynamics",
  "name": "Charles' law",
  "formula": "V₁/T₁ = V₂/T₂",
  "note": "Fixed pressure and gas amount",
  "tags": "gas"
 },
 {
  "id": "gay-lussac-s-law",
  "category": "Thermodynamics",
  "name": "Gay-Lussac's law",
  "formula": "p₁/T₁ = p₂/T₂",
  "note": "Fixed volume and gas amount",
  "tags": "gas"
 },
 {
  "id": "kelvin-conversion",
  "category": "Thermodynamics",
  "name": "Kelvin conversion",
  "formula": "T(K) = t(°C) + 273.15",
  "note": "Temperature scale",
  "tags": "temperature"
 },
 {
  "id": "celsius-from-kelvin",
  "category": "Thermodynamics",
  "name": "Celsius from kelvin",
  "formula": "t(°C) = T(K) − 273.15",
  "note": "Temperature scale",
  "tags": "temperature"
 },
 {
  "id": "thermal-efficiency",
  "category": "Thermodynamics",
  "name": "Thermal efficiency",
  "formula": "η = Wout/Qin",
  "note": "Same energy units",
  "tags": "engine"
 },
 {
  "id": "carnot-ideal-limit",
  "category": "Thermodynamics",
  "name": "Carnot ideal limit",
  "formula": "ηC = 1 − Tc/Th",
  "note": "Absolute temperatures, Th > Tc > 0",
  "tags": "engine"
 },
 {
  "id": "coefficient-of-performance",
  "category": "Thermodynamics",
  "name": "Coefficient of performance",
  "formula": "COPheating = Qhot/Win",
  "note": "Heat pump ideal performance metric",
  "tags": "refrigeration"
 },
 {
  "id": "cooling-cop",
  "category": "Thermodynamics",
  "name": "Cooling COP",
  "formula": "COPcooling = Qcold/Win",
  "note": "Refrigeration system metric",
  "tags": "refrigeration"
 },
 {
  "id": "coefficient-of-thermal-expansion",
  "category": "Thermodynamics",
  "name": "Coefficient of thermal expansion",
  "formula": "ΔL = αL₀ΔT",
  "note": "Small temperature difference linear approximation",
  "tags": "expansion"
 },
 {
  "id": "conduction-plane-wall",
  "category": "Thermodynamics",
  "name": "Conduction (plane wall)",
  "formula": "Q̇ = kAΔT/L",
  "note": "Steady 1D conduction, constant k",
  "tags": "heat"
 },
 {
  "id": "sensible-enthalpy-change",
  "category": "Thermodynamics",
  "name": "Sensible enthalpy change",
  "formula": "Δh ≈ cpΔT",
  "note": "Approximate constant-pressure heat capacity",
  "tags": "heat"
 },
 {
  "id": "energy-over-duration",
  "category": "Thermodynamics",
  "name": "Energy over duration",
  "formula": "E = Pt",
  "note": "Constant power",
  "tags": "energy"
 },
 {
  "id": "ohm-s-law",
  "category": "Electrical Engineering",
  "name": "Ohm's law",
  "formula": "U = IR",
  "note": "Resistive element",
  "tags": "dc"
 },
 {
  "id": "dc-power",
  "category": "Electrical Engineering",
  "name": "DC power",
  "formula": "P = UI",
  "note": "DC voltage and current",
  "tags": "dc"
 },
 {
  "id": "joule-heat",
  "category": "Electrical Engineering",
  "name": "Joule heat",
  "formula": "P = I²R",
  "note": "Resistive load",
  "tags": "dc"
 },
 {
  "id": "resistance-from-resistivity",
  "category": "Electrical Engineering",
  "name": "Resistance from resistivity",
  "formula": "R = ρₑL/A",
  "note": "ρₑ electrical resistivity, conductor length L",
  "tags": "cable"
 },
 {
  "id": "resistors-in-series",
  "category": "Electrical Engineering",
  "name": "Resistors in series",
  "formula": "Rtotal = ΣRᵢ",
  "note": "Ideal series network",
  "tags": "circuit"
 },
 {
  "id": "resistors-in-parallel",
  "category": "Electrical Engineering",
  "name": "Resistors in parallel",
  "formula": "1/Rtotal = Σ(1/Rᵢ)",
  "note": "Positive branch resistances",
  "tags": "circuit"
 },
 {
  "id": "voltage-divider",
  "category": "Electrical Engineering",
  "name": "Voltage divider",
  "formula": "Uout = Uin R₂/(R₁ + R₂)",
  "note": "Unloaded ideal divider",
  "tags": "circuit"
 },
 {
  "id": "capacitor-energy",
  "category": "Electrical Engineering",
  "name": "Capacitor energy",
  "formula": "E = CU²/2",
  "note": "Ideal capacitor",
  "tags": "electronics"
 },
 {
  "id": "inductor-energy",
  "category": "Electrical Engineering",
  "name": "Inductor energy",
  "formula": "E = LI²/2",
  "note": "Ideal linear inductor",
  "tags": "electronics"
 },
 {
  "id": "capacitor-charge",
  "category": "Electrical Engineering",
  "name": "Capacitor charge",
  "formula": "Q = CU",
  "note": "Capacitance C",
  "tags": "electronics"
 },
 {
  "id": "ac-angular-frequency",
  "category": "Electrical Engineering",
  "name": "AC angular frequency",
  "formula": "ω = 2πf",
  "note": "Frequency in hertz",
  "tags": "ac"
 },
 {
  "id": "inductive-reactance",
  "category": "Electrical Engineering",
  "name": "Inductive reactance",
  "formula": "Xₗ = 2πfL",
  "note": "Sinusoidal steady state",
  "tags": "ac"
 },
 {
  "id": "capacitive-reactance",
  "category": "Electrical Engineering",
  "name": "Capacitive reactance",
  "formula": "Xc = 1/(2πfC)",
  "note": "f,C positive; sinusoidal steady state",
  "tags": "ac"
 },
 {
  "id": "impedance-series-rl",
  "category": "Electrical Engineering",
  "name": "Impedance (series RL)",
  "formula": "|Z| = √(R² + Xₗ²)",
  "note": "Ideal R-L series load",
  "tags": "ac"
 },
 {
  "id": "power-factor",
  "category": "Electrical Engineering",
  "name": "Power factor",
  "formula": "cos φ = P/S",
  "note": "Sinusoidal balanced system basis",
  "tags": "ac"
 },
 {
  "id": "single-phase-real-power",
  "category": "Electrical Engineering",
  "name": "Single-phase real power",
  "formula": "P = UI cos φ",
  "note": "RMS voltage/current",
  "tags": "ac"
 },
 {
  "id": "three-phase-real-power",
  "category": "Electrical Engineering",
  "name": "Three-phase real power",
  "formula": "P = √3 Uₗ Iₗ cos φ",
  "note": "Balanced sinusoidal three-phase; line values",
  "tags": "three phase"
 },
 {
  "id": "three-phase-apparent-power",
  "category": "Electrical Engineering",
  "name": "Three-phase apparent power",
  "formula": "S = √3 Uₗ Iₗ",
  "note": "Balanced sinusoidal three-phase",
  "tags": "three phase"
 },
 {
  "id": "three-phase-reactive-power",
  "category": "Electrical Engineering",
  "name": "Three-phase reactive power",
  "formula": "Q = √3 Uₗ Iₗ sin φ",
  "note": "Balanced sinusoidal three-phase",
  "tags": "three phase"
 },
 {
  "id": "star-line-voltage",
  "category": "Electrical Engineering",
  "name": "Star line voltage",
  "formula": "Uₗ = √3 Uphase",
  "note": "Balanced star-connected AC",
  "tags": "three phase"
 },
 {
  "id": "delta-line-current",
  "category": "Electrical Engineering",
  "name": "Delta line current",
  "formula": "Iₗ = √3 Iphase",
  "note": "Balanced delta-connected AC",
  "tags": "three phase"
 },
 {
  "id": "ideal-transformer-ratio",
  "category": "Electrical Engineering",
  "name": "Ideal transformer ratio",
  "formula": "U₁/U₂ = N₁/N₂",
  "note": "Ideal transformer",
  "tags": "transformer"
 },
 {
  "id": "ideal-transformer-current-ratio",
  "category": "Electrical Engineering",
  "name": "Ideal transformer current ratio",
  "formula": "I₁/I₂ = N₂/N₁",
  "note": "Ideal transformer",
  "tags": "transformer"
 },
 {
  "id": "motor-synchronous-speed",
  "category": "Electrical Engineering",
  "name": "Motor synchronous speed",
  "formula": "nₛ = 120f/p",
  "note": "rpm; p is number of poles",
  "tags": "motor"
 },
 {
  "id": "induction-motor-slip",
  "category": "Electrical Engineering",
  "name": "Induction motor slip",
  "formula": "s = (nₛ − n)/nₛ",
  "note": "nₛ > 0",
  "tags": "motor"
 },
 {
  "id": "battery-energy-approx",
  "category": "Electrical Engineering",
  "name": "Battery energy (approx.)",
  "formula": "E(Wh) ≈ U(V) × C(Ah)",
  "note": "Nominal energy before efficiency / DoD corrections",
  "tags": "battery"
 },
 {
  "id": "battery-run-time-approx",
  "category": "Electrical Engineering",
  "name": "Battery run time (approx.)",
  "formula": "t ≈ Eusable/Pload",
  "note": "Steady load; energy and power in consistent units",
  "tags": "battery"
 },
 {
  "id": "electrical-energy",
  "category": "Electrical Engineering",
  "name": "Electrical energy",
  "formula": "E(kWh) = P(kW)t(h)",
  "note": "Constant power",
  "tags": "energy"
 },
 {
  "id": "efficiency",
  "category": "Electrical Engineering",
  "name": "Efficiency",
  "formula": "η = Pout/Pin",
  "note": "Power ratio; 0 < η ≤ 1 for ordinary system",
  "tags": "power"
 },
 {
  "id": "coulomb-s-law",
  "category": "Electrical Engineering",
  "name": "Coulomb's law",
  "formula": "F = kq₁q₂/r²",
  "note": "Point charges; magnitude uses absolute charges",
  "tags": "electrostatics"
 },
 {
  "id": "distance-at-steady-speed",
  "category": "Navigation",
  "name": "Distance at steady speed",
  "formula": "d(NM) = v(kn) t(h)",
  "note": "Speed over ground for ground distance",
  "tags": "passage"
 },
 {
  "id": "sea-time",
  "category": "Navigation",
  "name": "Sea time",
  "formula": "t(h) = d(NM)/v(kn)",
  "note": "Constant nonzero SOG",
  "tags": "passage"
 },
 {
  "id": "compass-to-true-course",
  "category": "Navigation",
  "name": "Compass to true course",
  "formula": "TC = CC + deviation + variation",
  "note": "East positive; normalize to 0–360°",
  "tags": "course"
 },
 {
  "id": "current-drift-vector",
  "category": "Navigation",
  "name": "Current/drift vector",
  "formula": "Vground = Vthrough-water + Vcurrent",
  "note": "Vector addition, consistent units",
  "tags": "set drift"
 },
 {
  "id": "latitude-difference",
  "category": "Navigation",
  "name": "Latitude difference",
  "formula": "Δφ = φ₂ − φ₁",
  "note": "Signed degrees; N positive",
  "tags": "coordinates"
 },
 {
  "id": "shortest-longitude-difference",
  "category": "Navigation",
  "name": "Shortest longitude difference",
  "formula": "Δλ = normalize(λ₂ − λ₁ to −180°…180°)",
  "note": "Antimeridian-aware",
  "tags": "coordinates"
 },
 {
  "id": "plane-sailing-departure",
  "category": "Navigation",
  "name": "Plane-sailing departure",
  "formula": "Dep(NM) ≈ ΔLon(min) cos(mean latitude)",
  "note": "Short distances, mid-latitudes",
  "tags": "navigation"
 },
 {
  "id": "plane-sailing-distance",
  "category": "Navigation",
  "name": "Plane-sailing distance",
  "formula": "d ≈ √(ΔLat(NM)² + Dep(NM)²)",
  "note": "Plane-sailing approximation",
  "tags": "navigation"
 },
 {
  "id": "great-circle-central-angle",
  "category": "Navigation",
  "name": "Great-circle central angle",
  "formula": "cos σ = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ",
  "note": "Angles in radians",
  "tags": "navigation"
 },
 {
  "id": "great-circle-distance",
  "category": "Navigation",
  "name": "Great-circle distance",
  "formula": "d = Rσ",
  "note": "Sphere approximation; R in desired distance unit",
  "tags": "navigation"
 },
 {
  "id": "course-speed-through-water",
  "category": "Navigation",
  "name": "Course speed through water",
  "formula": "STW = distance through water / time",
  "note": "Steady movement approximation",
  "tags": "navigation"
 },
 {
  "id": "relative-bearing",
  "category": "Navigation",
  "name": "Relative bearing",
  "formula": "TB = (heading + RB) mod 360°",
  "note": "Clockwise relative bearing from bow",
  "tags": "bearing"
 },
 {
  "id": "cpa-of-linear-relative-motion",
  "category": "Navigation",
  "name": "CPA of linear relative motion",
  "formula": "tCPA = max(0, −r·vrel/|vrel|²)",
  "note": "Future-only CPA for constant planar relative motion. Requires |vrel|>0. If relative velocity is zero, separation stays |r| and no unique CPA time exists. For an unconstrained signed TCPA omit max(0,...); time units must match position and velocity.",
  "tags": "ais cpa"
 },
 {
  "id": "cpa-distance",
  "category": "Navigation",
  "name": "CPA distance",
  "formula": "dCPA = |r + vrel·tCPA|",
  "note": "Constant-velocity planar approximation",
  "tags": "ais cpa"
 },
 {
  "id": "under-keel-clearance",
  "category": "Navigation",
  "name": "Under-keel clearance",
  "formula": "UKC = chart depth + tide − draft − allowances",
  "note": "Allowances include squat and operational margins",
  "tags": "ukc"
 },
 {
  "id": "required-average-speed",
  "category": "Navigation",
  "name": "Required average speed",
  "formula": "vreq = distance / available underway hours",
  "note": "Positive available underway time",
  "tags": "eta"
 },
 {
  "id": "rate-of-turn",
  "category": "Navigation",
  "name": "Rate of turn",
  "formula": "ROT = Δheading/Δt",
  "note": "Angle change and time in consistent units",
  "tags": "shiphandling"
 },
 {
  "id": "weight-displacement",
  "category": "Ship Stability",
  "name": "Weight displacement",
  "formula": "Δ = ρwater ∇",
  "note": "Density in t/m³ and immersed volume in m³",
  "tags": "hydrostatics"
 },
 {
  "id": "deadweight",
  "category": "Ship Stability",
  "name": "Deadweight",
  "formula": "DWT = Δ − lightship mass",
  "note": "Same loading condition",
  "tags": "hydrostatics"
 },
 {
  "id": "initial-gm",
  "category": "Ship Stability",
  "name": "Initial GM",
  "formula": "GM = KM − KG",
  "note": "Small-angle initial metacentric height",
  "tags": "gm"
 },
 {
  "id": "corrected-gm",
  "category": "Ship Stability",
  "name": "Corrected GM",
  "formula": "GMcorrected = KM − KG − FSC",
  "note": "FSC is free-surface correction in metres",
  "tags": "gm"
 },
 {
  "id": "loading-a-single-mass-new-kg",
  "category": "Ship Stability",
  "name": "Loading a single mass: new KG",
  "formula": "KGnew = (Δ·KG + w·kg)/(Δ + w)",
  "note": "w added mass, kg its vertical center",
  "tags": "kg"
 },
 {
  "id": "discharging-mass-new-kg",
  "category": "Ship Stability",
  "name": "Discharging mass: new KG",
  "formula": "KGnew = (Δ·KG − w·kg)/(Δ − w)",
  "note": "w discharged mass; Δ > w",
  "tags": "kg"
 },
 {
  "id": "weight-shifting-vertically",
  "category": "Ship Stability",
  "name": "Weight shifting vertically",
  "formula": "GG₁ = w·d/Δ",
  "note": "Weight transferred within ship; constant total displacement",
  "tags": "kg"
 },
 {
  "id": "weight-shifting-transversely",
  "category": "Ship Stability",
  "name": "Weight shifting transversely",
  "formula": "GG₁ = w·d/Δ",
  "note": "Small-angle transverse shift; known direction",
  "tags": "heel"
 },
 {
  "id": "free-surface-correction",
  "category": "Ship Stability",
  "name": "Free-surface correction",
  "formula": "FSC = FSM/Δ",
  "note": "FSM and Δ in consistent tonne-metre units; consult tank data",
  "tags": "free surface"
 },
 {
  "id": "free-surface-moment-ideal",
  "category": "Ship Stability",
  "name": "Free-surface moment (ideal)",
  "formula": "FSM = ρfluid IFS",
  "note": "Constant tank section; IFS free-surface second moment",
  "tags": "free surface"
 },
 {
  "id": "small-angle-righting-lever",
  "category": "Ship Stability",
  "name": "Small-angle righting lever",
  "formula": "GZ ≈ GM sin θ",
  "note": "Initial stability approximation; small heel",
  "tags": "gz"
 },
 {
  "id": "righting-moment",
  "category": "Ship Stability",
  "name": "Righting moment",
  "formula": "Mrighting = Δ·GZ",
  "note": "Use consistent force/mass units as required",
  "tags": "gz"
 },
 {
  "id": "statical-area-under-gz",
  "category": "Ship Stability",
  "name": "Statical area under GZ",
  "formula": "A = ∫GZ(θ) dθ",
  "note": "Angles in radians for righting-energy interpretation",
  "tags": "gz"
 },
 {
  "id": "waterplane-tpc",
  "category": "Ship Stability",
  "name": "Waterplane TPC",
  "formula": "TPC = ρwater Aw/100",
  "note": "Aw m²; ρwater t/m³; TPC t/cm",
  "tags": "tpc"
 },
 {
  "id": "draft-change-from-loaded-mass",
  "category": "Ship Stability",
  "name": "Draft change from loaded mass",
  "formula": "ΔT(cm) ≈ w(t)/TPC(t/cm)",
  "note": "Local TPC approximately constant",
  "tags": "draft"
 },
 {
  "id": "mct-1-cm-trim",
  "category": "Ship Stability",
  "name": "MCT 1 cm trim",
  "formula": "MCT₁cm = trimming moment / trim change(cm)",
  "note": "Hydrostatic MCT at loading condition",
  "tags": "trim"
 },
 {
  "id": "trim-change",
  "category": "Ship Stability",
  "name": "Trim change",
  "formula": "Δtrim(cm) = trimming moment / MCT₁cm",
  "note": "Sign per stated convention; MCT nonzero",
  "tags": "trim"
 },
 {
  "id": "trimming-moment-from-shifted-weight",
  "category": "Ship Stability",
  "name": "Trimming moment from shifted weight",
  "formula": "M = w·d",
  "note": "Longitudinal weight shift d in metres",
  "tags": "trim"
 },
 {
  "id": "mean-draught",
  "category": "Ship Stability",
  "name": "Mean draught",
  "formula": "Tmean = (Tf + Ta)/2",
  "note": "Simple forward/aft mean; not necessarily hydrostatic mean",
  "tags": "draft"
 },
 {
  "id": "loll-heel-small-angle-relation",
  "category": "Ship Stability",
  "name": "Loll/heel small-angle relation",
  "formula": "tan θ ≈ heeling moment/(Δ·GM)",
  "note": "Small angles, GM>0, consistent moments",
  "tags": "heel"
 },
 {
  "id": "block-coefficient",
  "category": "Ship Stability",
  "name": "Block coefficient",
  "formula": "Cb = ∇/(L·B·T)",
  "note": "L,B,T chosen consistently",
  "tags": "coefficients"
 },
 {
  "id": "waterplane-coefficient",
  "category": "Ship Stability",
  "name": "Waterplane coefficient",
  "formula": "Cwp = Aw/(L·B)",
  "note": "Waterplane dimensions",
  "tags": "coefficients"
 },
 {
  "id": "metacentric-radius",
  "category": "Ship Stability",
  "name": "Metacentric radius",
  "formula": "BM = Iwp/∇",
  "note": "Transverse waterplane second moment Iwp",
  "tags": "gm"
 },
 {
  "id": "cargo-mass-from-volume",
  "category": "Cargo & Survey",
  "name": "Cargo mass from volume",
  "formula": "m = ρcargo V",
  "note": "Density and volume at same reference conditions",
  "tags": "cargo"
 },
 {
  "id": "stowage-volume",
  "category": "Cargo & Survey",
  "name": "Stowage volume",
  "formula": "V = mass × stowage factor",
  "note": "Stowage factor m³/t",
  "tags": "cargo"
 },
 {
  "id": "cargo-capacity-theoretical",
  "category": "Cargo & Survey",
  "name": "Cargo capacity (theoretical)",
  "formula": "m = hold volume / stowage factor",
  "note": "Geometric approximation; excludes restrictions",
  "tags": "cargo"
 },
 {
  "id": "average-draught",
  "category": "Cargo & Survey",
  "name": "Average draught",
  "formula": "Tavg = (Tf + Ta)/2",
  "note": "Simplified draft survey context",
  "tags": "draft"
 },
 {
  "id": "draft-survey-cargo-difference",
  "category": "Cargo & Survey",
  "name": "Draft survey cargo difference",
  "formula": "cargo = Δafter − Δbefore − net noncargo changes",
  "note": "Displacement values corrected to same reference",
  "tags": "draft survey"
 },
 {
  "id": "oil-relative-density",
  "category": "Cargo & Survey",
  "name": "Oil relative density",
  "formula": "SG = ρliquid/ρreference",
  "note": "Reference density and temperatures stated",
  "tags": "tank"
 },
 {
  "id": "api-gravity-60-f",
  "category": "Cargo & Survey",
  "name": "API gravity (60°F)",
  "formula": "API = 141.5/SG₆₀°F − 131.5",
  "note": "Petroleum SG at 60°F",
  "tags": "tank"
 },
 {
  "id": "ullage-vs-sounding",
  "category": "Cargo & Survey",
  "name": "Ullage vs sounding",
  "formula": "ullage = reference height − sounding",
  "note": "Only for matching reference datum",
  "tags": "tank"
 },
 {
  "id": "liquid-cargo-mass",
  "category": "Cargo & Survey",
  "name": "Liquid cargo mass",
  "formula": "m = Vobserved ρobserved",
  "note": "Both measured at same temperature",
  "tags": "tank"
 },
 {
  "id": "container-gross-mass",
  "category": "Cargo & Survey",
  "name": "Container gross mass",
  "formula": "VGM = tare + cargo + packing",
  "note": "Certified verification method required in practice",
  "tags": "container"
 },
 {
  "id": "securing-load-basic-model",
  "category": "Cargo & Survey",
  "name": "Securing load basic model",
  "formula": "F = ma",
  "note": "Acceleration according to accepted lashing method",
  "tags": "securing"
 },
 {
  "id": "loading-rate",
  "category": "Cargo & Survey",
  "name": "Loading rate",
  "formula": "rate = loaded mass / elapsed time",
  "note": "Mean loading rate",
  "tags": "bulk"
 },
 {
  "id": "remaining-cargo",
  "category": "Cargo & Survey",
  "name": "Remaining cargo",
  "formula": "remaining = planned − loaded",
  "note": "Same unit and reference",
  "tags": "cargo"
 },
 {
  "id": "water-added-removed-mass",
  "category": "Cargo & Survey",
  "name": "Water added/removed mass",
  "formula": "m = ρwater ΔV",
  "note": "Uniform fluid density",
  "tags": "ballast"
 },
 {
  "id": "daily-fuel-consumption",
  "category": "Machinery & Energy",
  "name": "Daily fuel consumption",
  "formula": "m = consumption rate × days",
  "note": "Rate consistent with mass or volume unit",
  "tags": "fuel"
 },
 {
  "id": "specific-fuel-oil-consumption",
  "category": "Machinery & Energy",
  "name": "Specific fuel oil consumption",
  "formula": "SFOC = fuel mass(g)/shaft energy(kWh)",
  "note": "Consistent observation interval",
  "tags": "fuel"
 },
 {
  "id": "endurance-by-volume",
  "category": "Machinery & Energy",
  "name": "Endurance by volume",
  "formula": "days = usable fuel volume / daily volume consumption",
  "note": "Steady consumption, usable ROB",
  "tags": "fuel"
 },
 {
  "id": "mass-volume-conversion",
  "category": "Machinery & Energy",
  "name": "Mass/volume conversion",
  "formula": "m = ρV",
  "note": "Density at actual or declared reference temperature",
  "tags": "fuel"
 },
 {
  "id": "fuel-from-energy-demand",
  "category": "Machinery & Energy",
  "name": "Fuel from energy demand",
  "formula": "m = Erequired/(η × LHV)",
  "note": "LHV and E in consistent energy units",
  "tags": "fuel"
 },
 {
  "id": "shaft-power-from-torque",
  "category": "Machinery & Energy",
  "name": "Shaft power from torque",
  "formula": "P = 2πnM/60",
  "note": "n rpm, M N·m, result watts",
  "tags": "engine"
 },
 {
  "id": "brake-thermal-efficiency",
  "category": "Machinery & Energy",
  "name": "Brake thermal efficiency",
  "formula": "η = Pshaft/(ṁfuel × LHV)",
  "note": "Fuel mass flow kg/s, LHV J/kg",
  "tags": "engine"
 },
 {
  "id": "propeller-advance-coefficient",
  "category": "Machinery & Energy",
  "name": "Propeller advance coefficient",
  "formula": "J = VA/(nD)",
  "note": "n revolutions per second, D diameter",
  "tags": "propeller"
 },
 {
  "id": "approximate-cubic-speed-power-law",
  "category": "Machinery & Energy",
  "name": "Approximate cubic speed-power law",
  "formula": "P₂/P₁ ≈ (v₂/v₁)³",
  "note": "Similar vessel condition; rough planning only",
  "tags": "voyage"
 },
 {
  "id": "pump-run-time",
  "category": "Machinery & Energy",
  "name": "Pump run time",
  "formula": "t = tank volume / volumetric flow",
  "note": "Steady flow and usable volume",
  "tags": "pump"
 },
 {
  "id": "engine-fuel-for-voyage",
  "category": "Machinery & Energy",
  "name": "Engine fuel for voyage",
  "formula": "fuel = rate/day × distance/(24 × SOG)",
  "note": "SOG constant, hours/day=24",
  "tags": "voyage"
 },
 {
  "id": "co-from-fuel-mass",
  "category": "Machinery & Energy",
  "name": "CO₂ from fuel mass",
  "formula": "mCO₂ = fuel mass × emission factor",
  "note": "Correct fuel-specific emission factor and basis",
  "tags": "emission"
 },
 {
  "id": "battery-usable-energy",
  "category": "Machinery & Energy",
  "name": "Battery usable energy",
  "formula": "Eusable = Enominal × permitted DoD × efficiency",
  "note": "Fractions 0–1; simplification",
  "tags": "battery"
 },
 {
  "id": "electrical-autonomy",
  "category": "Machinery & Energy",
  "name": "Electrical autonomy",
  "formula": "t = Eusable/Pdemand",
  "note": "Steady demand; consistent kWh and kW",
  "tags": "battery"
 },
 {
  "id": "generator-load-fraction",
  "category": "Machinery & Energy",
  "name": "Generator load fraction",
  "formula": "Load % = 100 × Pactual/Prated",
  "note": "Correct compatible ratings",
  "tags": "generator"
 },
 {
  "id": "alternator-apparent-load",
  "category": "Machinery & Energy",
  "name": "Alternator apparent load",
  "formula": "S(kVA) = √3 Uₗ(V) Iₗ(A)/1000",
  "note": "Balanced three-phase",
  "tags": "generator"
 }
];
