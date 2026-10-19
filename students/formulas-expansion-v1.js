/* Expansion batch 1: independent standard scientific formulas.
 * Subject gaps identified by reviewing available user-supplied chapter samples.
 * Formula entries are newly worded and NOT a transcription or facsimile of the source book.
 * Requires students/formulas.js first. For teaching and dimensional checking only. */
window.MT_FORMULAS.push(...[
 {
  "id": "student-v2-atomic-mass-number",
  "category": "Chemistry",
  "name": "Atomic mass number",
  "formula": "A = Z + N",
  "note": "Z is proton number; N is neutron count",
  "tags": "atomic structure"
 },
 {
  "id": "student-v2-amount-of-substance",
  "category": "Chemistry",
  "name": "Amount of substance",
  "formula": "n = m/M",
  "note": "Mass m and molar mass M in compatible units",
  "tags": "moles"
 },
 {
  "id": "student-v2-mass-from-moles",
  "category": "Chemistry",
  "name": "Mass from moles",
  "formula": "m = nM",
  "note": "Molar mass M and amount n",
  "tags": "moles"
 },
 {
  "id": "student-v2-particle-count",
  "category": "Chemistry",
  "name": "Particle count",
  "formula": "N = nNₐ",
  "note": "Nₐ is Avogadro constant in mol⁻¹",
  "tags": "avogadro"
 },
 {
  "id": "student-v2-molar-concentration",
  "category": "Chemistry",
  "name": "Molar concentration",
  "formula": "c = n/V",
  "note": "Solution volume in litres if c in mol/L",
  "tags": "concentration"
 },
 {
  "id": "student-v2-dilution-solute-conserved",
  "category": "Chemistry",
  "name": "Dilution (solute conserved)",
  "formula": "c₁V₁ = c₂V₂",
  "note": "No solute gained or lost; same concentration basis",
  "tags": "dilution"
 },
 {
  "id": "student-v2-mass-concentration",
  "category": "Chemistry",
  "name": "Mass concentration",
  "formula": "cₘ = msolute / Vsolution",
  "note": "Mass and total solution volume in consistent units",
  "tags": "concentration"
 },
 {
  "id": "student-v2-mass-fraction",
  "category": "Chemistry",
  "name": "Mass fraction",
  "formula": "w = msolute / msolution",
  "note": "Dimensionless; for percent multiply by 100",
  "tags": "mixture"
 },
 {
  "id": "student-v2-ideal-gas-mole-relation",
  "category": "Chemistry",
  "name": "Ideal gas mole relation",
  "formula": "n = pV/(RT)",
  "note": "Absolute temperature; ideal-gas approximation",
  "tags": "gas"
 },
 {
  "id": "student-v2-ph",
  "category": "Chemistry",
  "name": "pH",
  "formula": "pH = −log₁₀(aH⁺)",
  "note": "Activity-based definition; approximating activity by concentration requires assumptions",
  "tags": "acid base"
 },
 {
  "id": "student-v2-poh-at-25-c",
  "category": "Chemistry",
  "name": "pOH at 25 °C",
  "formula": "pOH = 14 − pH",
  "note": "Approximation for dilute aqueous solution at 25 °C",
  "tags": "acid base"
 },
 {
  "id": "student-v2-reaction-yield",
  "category": "Chemistry",
  "name": "Reaction yield",
  "formula": "yield (%) = 100 × actual / theoretical",
  "note": "Theoretical yield must be nonzero",
  "tags": "stoichiometry"
 },
 {
  "id": "student-v2-radioactive-remaining-fraction",
  "category": "Chemistry",
  "name": "Radioactive remaining fraction",
  "formula": "N(t) = N₀ × 2^(−t/T½)",
  "note": "Constant half-life T½ > 0",
  "tags": "radioactivity"
 },
 {
  "id": "student-v2-decay-constant",
  "category": "Chemistry",
  "name": "Decay constant",
  "formula": "λ = ln 2 / T½",
  "note": "First-order radioactive decay",
  "tags": "radioactivity"
 },
 {
  "id": "student-v2-mass-energy-equivalence",
  "category": "Chemistry",
  "name": "Mass–energy equivalence",
  "formula": "E = Δm c²",
  "note": "Mass difference Δm in kg; energy in joules",
  "tags": "nuclear physics"
 },
 {
  "id": "student-v2-diode-ideal-model",
  "category": "Electronics & Digital",
  "name": "Diode ideal model",
  "formula": "I = 0 (reverse) or Vd ≈ 0 (forward)",
  "note": "Teaching approximation; actual diodes have losses and limits",
  "tags": "diode"
 },
 {
  "id": "student-v2-ideal-bjt-current-gain",
  "category": "Electronics & Digital",
  "name": "Ideal BJT current gain",
  "formula": "β = Icollector / Ibase",
  "note": "Forward-active transistor region",
  "tags": "transistor"
 },
 {
  "id": "student-v2-bjt-emitter-current",
  "category": "Electronics & Digital",
  "name": "BJT emitter current",
  "formula": "Iemitter = Icollector + Ibase",
  "note": "Charge conservation",
  "tags": "transistor"
 },
 {
  "id": "student-v2-ideal-inverting-amplifier",
  "category": "Electronics & Digital",
  "name": "Ideal inverting amplifier",
  "formula": "Vout = −(Rf/Rin)Vin",
  "note": "Ideal op-amp with negative feedback, unsaturated output",
  "tags": "op amp"
 },
 {
  "id": "student-v2-ideal-noninverting-amplifier",
  "category": "Electronics & Digital",
  "name": "Ideal noninverting amplifier",
  "formula": "Vout = (1 + Rf/Rg)Vin",
  "note": "Ideal op-amp with negative feedback",
  "tags": "op amp"
 },
 {
  "id": "student-v2-voltage-gain-linear",
  "category": "Electronics & Digital",
  "name": "Voltage gain (linear)",
  "formula": "Av = Vout / Vin",
  "note": "Consistent peak or RMS convention",
  "tags": "amplifier"
 },
 {
  "id": "student-v2-voltage-gain-in-db",
  "category": "Electronics & Digital",
  "name": "Voltage gain in dB",
  "formula": "GdB = 20log₁₀|Vout/Vin|",
  "note": "Same impedance reference for power interpretation",
  "tags": "decibel"
 },
 {
  "id": "student-v2-power-gain-in-db",
  "category": "Electronics & Digital",
  "name": "Power gain in dB",
  "formula": "GdB = 10log₁₀(Pout/Pin)",
  "note": "Positive power values",
  "tags": "decibel"
 },
 {
  "id": "student-v2-rc-time-constant",
  "category": "Electronics & Digital",
  "name": "RC time constant",
  "formula": "τ = RC",
  "note": "R in ohm, C in farad gives seconds",
  "tags": "filters"
 },
 {
  "id": "student-v2-rc-low-pass-cutoff",
  "category": "Electronics & Digital",
  "name": "RC low-pass cutoff",
  "formula": "fc = 1/(2πRC)",
  "note": "Ideal first-order low-pass",
  "tags": "filters"
 },
 {
  "id": "student-v2-rl-time-constant",
  "category": "Electronics & Digital",
  "name": "RL time constant",
  "formula": "τ = L/R",
  "note": "Ideal first-order RL circuit; R positive",
  "tags": "filters"
 },
 {
  "id": "student-v2-capacitor-current",
  "category": "Electronics & Digital",
  "name": "Capacitor current",
  "formula": "i = C dv/dt",
  "note": "Ideal capacitor with constant C",
  "tags": "capacitor"
 },
 {
  "id": "student-v2-inductor-voltage",
  "category": "Electronics & Digital",
  "name": "Inductor voltage",
  "formula": "v = L di/dt",
  "note": "Ideal inductor with constant L",
  "tags": "inductor"
 },
 {
  "id": "student-v2-boolean-and",
  "category": "Electronics & Digital",
  "name": "Boolean AND",
  "formula": "Y = A ∧ B",
  "note": "Boolean logic, A and B in {0,1}",
  "tags": "logic"
 },
 {
  "id": "student-v2-boolean-or",
  "category": "Electronics & Digital",
  "name": "Boolean OR",
  "formula": "Y = A ∨ B",
  "note": "Boolean logic, A and B in {0,1}",
  "tags": "logic"
 },
 {
  "id": "student-v2-boolean-not",
  "category": "Electronics & Digital",
  "name": "Boolean NOT",
  "formula": "Y = ¬A",
  "note": "Boolean logic",
  "tags": "logic"
 },
 {
  "id": "student-v2-binary-number-value",
  "category": "Electronics & Digital",
  "name": "Binary number value",
  "formula": "N = Σbₖ2ᵏ",
  "note": "Binary digits bₖ in {0,1}",
  "tags": "digital"
 },
 {
  "id": "student-v2-sampling-condition",
  "category": "Electronics & Digital",
  "name": "Sampling condition",
  "formula": "fs > 2 fmax",
  "note": "Ideal Nyquist condition for band-limited signal",
  "tags": "telecom"
 },
 {
  "id": "student-v2-single-phase-half-wave-rectifier-average",
  "category": "Power Electronics",
  "name": "Single-phase half-wave rectifier average",
  "formula": "Vdc = Vm/π",
  "note": "Ideal diode, sinusoidal input, resistive load, no smoothing",
  "tags": "rectifier"
 },
 {
  "id": "student-v2-single-phase-full-wave-rectifier-average",
  "category": "Power Electronics",
  "name": "Single-phase full-wave rectifier average",
  "formula": "Vdc = 2Vm/π",
  "note": "Ideal full-wave rectification without smoothing; Vm peak",
  "tags": "rectifier"
 },
 {
  "id": "student-v2-ac-peak-and-rms",
  "category": "Power Electronics",
  "name": "AC peak and RMS",
  "formula": "Vm = √2 Vrms",
  "note": "Pure sinusoidal waveform",
  "tags": "rms"
 },
 {
  "id": "student-v2-buck-converter-ideal-output",
  "category": "Power Electronics",
  "name": "Buck converter ideal output",
  "formula": "Vout = D Vin",
  "note": "Ideal continuous conduction, 0 ≤ D ≤ 1",
  "tags": "dc dc"
 },
 {
  "id": "student-v2-boost-converter-ideal-output",
  "category": "Power Electronics",
  "name": "Boost converter ideal output",
  "formula": "Vout = Vin/(1−D)",
  "note": "Ideal continuous conduction; 0 ≤ D < 1",
  "tags": "dc dc"
 },
 {
  "id": "student-v2-switching-period",
  "category": "Power Electronics",
  "name": "Switching period",
  "formula": "T = 1/fs",
  "note": "Switching frequency positive",
  "tags": "pwm"
 },
 {
  "id": "student-v2-pwm-duty-cycle",
  "category": "Power Electronics",
  "name": "PWM duty cycle",
  "formula": "D = ton / T",
  "note": "Duty cycle dimensionless, 0 to 1",
  "tags": "pwm"
 },
 {
  "id": "student-v2-inverter-efficiency",
  "category": "Power Electronics",
  "name": "Inverter efficiency",
  "formula": "η = Pac,out / Pdc,in",
  "note": "Power in consistent units",
  "tags": "inverter"
 },
 {
  "id": "student-v2-mean-dc-ripple-ratio",
  "category": "Power Electronics",
  "name": "Mean DC ripple ratio",
  "formula": "r = Vripple,rms / Vdc",
  "note": "Specify ripple definition and circuit model",
  "tags": "rectifier"
 },
 {
  "id": "student-v2-piston-swept-volume",
  "category": "Marine Engines",
  "name": "Piston swept volume",
  "formula": "Vs = πD²S/4",
  "note": "One cylinder, bore D and stroke S",
  "tags": "engine displacement"
 },
 {
  "id": "student-v2-multicylinder-swept-volume",
  "category": "Marine Engines",
  "name": "Multicylinder swept volume",
  "formula": "Vtotal = zπD²S/4",
  "note": "z cylinders with equal bore and stroke",
  "tags": "engine displacement"
 },
 {
  "id": "student-v2-mean-piston-speed",
  "category": "Marine Engines",
  "name": "Mean piston speed",
  "formula": "cm = 2Sn/60",
  "note": "S in m; n in rpm; output m/s",
  "tags": "piston"
 },
 {
  "id": "student-v2-four-stroke-intake-events",
  "category": "Marine Engines",
  "name": "Four-stroke intake events",
  "formula": "events/s = z n/(2 × 60)",
  "note": "n in rpm, z cylinders, four-stroke",
  "tags": "engine"
 },
 {
  "id": "student-v2-brake-mean-effective-pressure-4-stroke",
  "category": "Marine Engines",
  "name": "Brake mean effective pressure (4-stroke)",
  "formula": "BMEP = 120 P/(Vd n)",
  "note": "P in W, Vd m³, n rpm; BMEP in Pa",
  "tags": "bmep"
 },
 {
  "id": "student-v2-brake-mean-effective-pressure-2-stroke",
  "category": "Marine Engines",
  "name": "Brake mean effective pressure (2-stroke)",
  "formula": "BMEP = 60 P/(Vd n)",
  "note": "P in W, Vd m³, n rpm; BMEP in Pa",
  "tags": "bmep"
 },
 {
  "id": "student-v2-mechanical-efficiency",
  "category": "Marine Engines",
  "name": "Mechanical efficiency",
  "formula": "ηm = Pshaft/Pindicated",
  "note": "Indicated power positive",
  "tags": "engine"
 },
 {
  "id": "student-v2-volumetric-efficiency",
  "category": "Marine Engines",
  "name": "Volumetric efficiency",
  "formula": "ηv = actual intake / theoretical intake",
  "note": "Specify volume conditions and reference",
  "tags": "engine"
 },
 {
  "id": "student-v2-fuel-lower-heating-energy",
  "category": "Marine Engines",
  "name": "Fuel lower-heating energy",
  "formula": "Ein = mfuel × LHV",
  "note": "Consistent mass and LHV energy basis",
  "tags": "fuel"
 },
 {
  "id": "student-v2-specific-fuel-mass-rate",
  "category": "Marine Engines",
  "name": "Specific fuel mass rate",
  "formula": "ṁfuel = SFOC × P / 1000",
  "note": "SFOC g/kWh, P kW, result kg/h",
  "tags": "fuel"
 },
 {
  "id": "student-v2-wet-steam-specific-enthalpy",
  "category": "Steam Engineering",
  "name": "Wet-steam specific enthalpy",
  "formula": "h = hf + x(hg − hf)",
  "note": "Saturated mixture at specified pressure, 0≤dryness x≤1",
  "tags": "steam"
 },
 {
  "id": "student-v2-wet-steam-specific-volume",
  "category": "Steam Engineering",
  "name": "Wet-steam specific volume",
  "formula": "v = vf + x(vg − vf)",
  "note": "Saturated liquid and vapour at same pressure",
  "tags": "steam"
 },
 {
  "id": "student-v2-steam-dryness-fraction",
  "category": "Steam Engineering",
  "name": "Steam dryness fraction",
  "formula": "x = (h − hf)/(hg − hf)",
  "note": "Within saturation dome; hg>hf",
  "tags": "steam"
 },
 {
  "id": "student-v2-specific-volume-density",
  "category": "Steam Engineering",
  "name": "Specific-volume density",
  "formula": "ρ = 1/v",
  "note": "v > 0 and mass-based specific volume",
  "tags": "steam"
 },
 {
  "id": "student-v2-approximate-superheat-enthalpy",
  "category": "Steam Engineering",
  "name": "Approximate superheat enthalpy",
  "formula": "h ≈ hg + cp(T−Tsat)",
  "note": "Approximation with near-constant cp at given pressure",
  "tags": "steam"
 },
 {
  "id": "student-v2-boiler-heat-transfer-rate",
  "category": "Steam Engineering",
  "name": "Boiler heat transfer rate",
  "formula": "Qdot = ṁ(hout−hin)",
  "note": "Steady flow; consistent enthalpy basis",
  "tags": "boiler"
 },
 {
  "id": "student-v2-turbine-specific-work-idealised",
  "category": "Steam Engineering",
  "name": "Turbine specific work (idealised)",
  "formula": "w ≈ hin − hout",
  "note": "Steady adiabatic turbine, neglect kinetic effects",
  "tags": "steam"
 },
 {
  "id": "student-v2-boiler-thermal-efficiency",
  "category": "Steam Engineering",
  "name": "Boiler thermal efficiency",
  "formula": "η = Quseful/Qfuel",
  "note": "Same period and consistent energy basis",
  "tags": "boiler"
 },
 {
  "id": "student-v2-refrigeration-effect-per-kilogram",
  "category": "Refrigeration & Heat Pumps",
  "name": "Refrigeration effect per kilogram",
  "formula": "qL = h1 − h4",
  "note": "Vapour-compression cycle with defined state points",
  "tags": "refrigeration"
 },
 {
  "id": "student-v2-compressor-specific-work",
  "category": "Refrigeration & Heat Pumps",
  "name": "Compressor specific work",
  "formula": "wcomp = h2 − h1",
  "note": "Adiabatic compressor approximation",
  "tags": "refrigeration"
 },
 {
  "id": "student-v2-cooling-coefficient-of-performance",
  "category": "Refrigeration & Heat Pumps",
  "name": "Cooling coefficient of performance",
  "formula": "COPc = (h1−h4)/(h2−h1)",
  "note": "Steady vapour-compression cycle, positive work",
  "tags": "refrigeration"
 },
 {
  "id": "student-v2-heating-coefficient-of-performance",
  "category": "Refrigeration & Heat Pumps",
  "name": "Heating coefficient of performance",
  "formula": "COPh = (h2−h3)/(h2−h1)",
  "note": "Idealised steady heat-pump cycle",
  "tags": "heat pump"
 },
 {
  "id": "student-v2-refrigeration-capacity",
  "category": "Refrigeration & Heat Pumps",
  "name": "Refrigeration capacity",
  "formula": "QdotL = ṁref (h1−h4)",
  "note": "Consistent kg/s and J/kg",
  "tags": "refrigeration"
 },
 {
  "id": "student-v2-compressor-power-estimate",
  "category": "Refrigeration & Heat Pumps",
  "name": "Compressor power estimate",
  "formula": "P = ṁref(h2−h1)",
  "note": "Adiabatic steady flow, W from kg/s and J/kg",
  "tags": "refrigeration"
 },
 {
  "id": "student-v2-ideal-carnot-refrigerator",
  "category": "Refrigeration & Heat Pumps",
  "name": "Ideal Carnot refrigerator",
  "formula": "COPCarnot = TL/(TH−TL)",
  "note": "Absolute temperatures, TH>TL>0",
  "tags": "carnot"
 },
 {
  "id": "student-v2-log-mean-temperature-difference",
  "category": "Refrigeration & Heat Pumps",
  "name": "Log-mean temperature difference",
  "formula": "LMTD = (ΔT1−ΔT2)/ln(ΔT1/ΔT2)",
  "note": "Counterflow/coflow with positive endpoint differences",
  "tags": "heat exchanger"
 },
 {
  "id": "student-v2-bolt-axial-tensile-stress",
  "category": "Machine Elements",
  "name": "Bolt axial tensile stress",
  "formula": "σ = F/At",
  "note": "Effective tensile stress area At",
  "tags": "bolts"
 },
 {
  "id": "student-v2-shaft-torsion-shear-stress",
  "category": "Machine Elements",
  "name": "Shaft torsion shear stress",
  "formula": "τmax = Tr/J",
  "note": "Circular elastic shaft, radius r, polar inertia J",
  "tags": "torsion"
 },
 {
  "id": "student-v2-polar-inertia-of-solid-shaft",
  "category": "Machine Elements",
  "name": "Polar inertia of solid shaft",
  "formula": "J = πd⁴/32",
  "note": "Solid round cross-section",
  "tags": "torsion"
 },
 {
  "id": "student-v2-polar-inertia-of-hollow-shaft",
  "category": "Machine Elements",
  "name": "Polar inertia of hollow shaft",
  "formula": "J = π(Do⁴−Di⁴)/32",
  "note": "Concentric circular tube, Do > Di",
  "tags": "torsion"
 },
 {
  "id": "student-v2-angular-twist-of-shaft",
  "category": "Machine Elements",
  "name": "Angular twist of shaft",
  "formula": "θ = TL/(GJ)",
  "note": "Uniform circular elastic shaft",
  "tags": "torsion"
 },
 {
  "id": "student-v2-mechanical-advantage-ideal",
  "category": "Machine Elements",
  "name": "Mechanical advantage ideal",
  "formula": "MA = output force / input force",
  "note": "Consistent load units",
  "tags": "machines"
 },
 {
  "id": "student-v2-factor-of-safety",
  "category": "Machine Elements",
  "name": "Factor of safety",
  "formula": "FoS = allowable strength / design stress",
  "note": "Consistent type of stress and criteria",
  "tags": "strength"
 },
 {
  "id": "student-v2-shaft-power-transmission",
  "category": "Machine Elements",
  "name": "Shaft power transmission",
  "formula": "P = Tω",
  "note": "Torque in N·m and angular speed in rad/s",
  "tags": "shaft"
 },
 {
  "id": "student-v2-simple-interest",
  "category": "Engineering Economics",
  "name": "Simple interest",
  "formula": "I = P r t",
  "note": "Rate r per year and t in years",
  "tags": "interest"
 },
 {
  "id": "student-v2-future-value-compound",
  "category": "Engineering Economics",
  "name": "Future value compound",
  "formula": "FV = PV(1+r)ⁿ",
  "note": "Constant rate r per period",
  "tags": "interest"
 },
 {
  "id": "student-v2-present-value",
  "category": "Engineering Economics",
  "name": "Present value",
  "formula": "PV = FV/(1+r)ⁿ",
  "note": "Discount rate r > −1",
  "tags": "discount"
 },
 {
  "id": "student-v2-net-present-value",
  "category": "Engineering Economics",
  "name": "Net present value",
  "formula": "NPV = Σ CFt/(1+r)^t − I0",
  "note": "Cash flows by period and upfront investment",
  "tags": "npv"
 },
 {
  "id": "student-v2-annuity-present-value",
  "category": "Engineering Economics",
  "name": "Annuity present value",
  "formula": "PV = A[1−(1+r)^−n]/r",
  "note": "Constant r ≠ 0 and equal payments",
  "tags": "annuity"
 },
 {
  "id": "student-v2-annuity-payment",
  "category": "Engineering Economics",
  "name": "Annuity payment",
  "formula": "A = PV r/[1−(1+r)^−n]",
  "note": "n positive periods, r ≠ 0; for r=0 A=PV/n",
  "tags": "annuity"
 },
 {
  "id": "student-v2-simple-payback-period",
  "category": "Engineering Economics",
  "name": "Simple payback period",
  "formula": "t = investment / annual net cash inflow",
  "note": "Constant positive annual inflow",
  "tags": "payback"
 },
 {
  "id": "student-v2-straight-line-depreciation",
  "category": "Engineering Economics",
  "name": "Straight-line depreciation",
  "formula": "annual = (cost−salvage)/useful life",
  "note": "Useful life positive; ignores tax effects",
  "tags": "depreciation"
 },
 {
  "id": "student-v2-operating-cost-per-voyage",
  "category": "Engineering Economics",
  "name": "Operating cost per voyage",
  "formula": "Cvoyage = Cfuel + Cport + Ccrew + Cother",
  "note": "Define accounting scope and period",
  "tags": "cost"
 },
 {
  "id": "student-v2-wave-speed",
  "category": "Acoustics & Waves",
  "name": "Wave speed",
  "formula": "v = fλ",
  "note": "Frequency and wavelength in compatible units",
  "tags": "waves"
 },
 {
  "id": "student-v2-wave-period",
  "category": "Acoustics & Waves",
  "name": "Wave period",
  "formula": "T = 1/f",
  "note": "f positive",
  "tags": "waves"
 },
 {
  "id": "student-v2-angular-wave-frequency",
  "category": "Acoustics & Waves",
  "name": "Angular wave frequency",
  "formula": "ω = 2πf",
  "note": "Harmonic oscillation",
  "tags": "waves"
 },
 {
  "id": "student-v2-acoustic-intensity-level",
  "category": "Acoustics & Waves",
  "name": "Acoustic intensity level",
  "formula": "LI = 10log₁₀(I/I0)",
  "note": "I0 reference intensity; I>0",
  "tags": "acoustics"
 },
 {
  "id": "student-v2-sound-pressure-level",
  "category": "Acoustics & Waves",
  "name": "Sound pressure level",
  "formula": "Lp = 20log₁₀(prms/p0)",
  "note": "Reference pressure p0>0, matching medium",
  "tags": "acoustics"
 },
 {
  "id": "student-v2-refraction-snell-s-law",
  "category": "Acoustics & Waves",
  "name": "Refraction (Snell's law)",
  "formula": "n1 sin θ1 = n2 sin θ2",
  "note": "Angles from the normal",
  "tags": "optics"
 },
 {
  "id": "student-v2-thin-lens-equation",
  "category": "Acoustics & Waves",
  "name": "Thin lens equation",
  "formula": "1/f = 1/u + 1/v",
  "note": "Paraxial thin-lens sign convention required",
  "tags": "optics"
 },
 {
  "id": "student-v2-complex-modulus",
  "category": "Advanced Mathematics",
  "name": "Complex modulus",
  "formula": "|a+bi| = √(a²+b²)",
  "note": "Real a,b",
  "tags": "complex"
 },
 {
  "id": "student-v2-euler-s-formula",
  "category": "Advanced Mathematics",
  "name": "Euler's formula",
  "formula": "e^(iθ) = cos θ + i sin θ",
  "note": "θ in radians",
  "tags": "complex"
 },
 {
  "id": "student-v2-complex-multiplication",
  "category": "Advanced Mathematics",
  "name": "Complex multiplication",
  "formula": "(a+bi)(c+di) = (ac−bd)+i(ad+bc)",
  "note": "i² = −1",
  "tags": "complex"
 },
 {
  "id": "student-v2-sample-mean",
  "category": "Advanced Mathematics",
  "name": "Sample mean",
  "formula": "x̄ = (Σxi)/n",
  "note": "n > 0",
  "tags": "statistics"
 },
 {
  "id": "student-v2-population-variance",
  "category": "Advanced Mathematics",
  "name": "Population variance",
  "formula": "σ² = Σ(xi−μ)²/n",
  "note": "Population of n observations",
  "tags": "statistics"
 },
 {
  "id": "student-v2-sample-variance",
  "category": "Advanced Mathematics",
  "name": "Sample variance",
  "formula": "s² = Σ(xi−x̄)²/(n−1)",
  "note": "n > 1",
  "tags": "statistics"
 },
 {
  "id": "student-v2-vector-dot-product",
  "category": "Advanced Mathematics",
  "name": "Vector dot product",
  "formula": "a·b = ax bx + ay by + az bz",
  "note": "Cartesian orthonormal axes",
  "tags": "vectors"
 },
 {
  "id": "student-v2-vector-magnitude-in-3d",
  "category": "Advanced Mathematics",
  "name": "Vector magnitude in 3D",
  "formula": "|v| = √(vx²+vy²+vz²)",
  "note": "Cartesian components",
  "tags": "vectors"
 },
 {
  "id": "student-v2-derivative-chain-rule",
  "category": "Advanced Mathematics",
  "name": "Derivative chain rule",
  "formula": "d[f(g(x))]/dx = f′(g(x))g′(x)",
  "note": "Differentiable composite",
  "tags": "calculus"
 },
 {
  "id": "student-v2-apparent-weight-while-lifting",
  "category": "Additional Ship Operations",
  "name": "Apparent weight while lifting",
  "formula": "GZ correction depends on suspended load's suspension point",
  "note": "Suspended-load stability requires proper approved model",
  "tags": "heavy lift"
 },
 {
  "id": "student-v2-crane-overturning-moment",
  "category": "Additional Ship Operations",
  "name": "Crane overturning moment",
  "formula": "M = Fhorizontal × lever arm",
  "note": "Simplified horizontal overturning moment; actual crane loading complex",
  "tags": "heavy lift"
 },
 {
  "id": "student-v2-transverse-mass-moment",
  "category": "Additional Ship Operations",
  "name": "Transverse mass moment",
  "formula": "Mtrans = w × transverse distance",
  "note": "Use defined sign convention",
  "tags": "heel"
 },
 {
  "id": "student-v2-longitudinal-mass-moment",
  "category": "Additional Ship Operations",
  "name": "Longitudinal mass moment",
  "formula": "Mlong = w × longitudinal distance",
  "note": "Reference datum must be stated",
  "tags": "trim"
 },
 {
  "id": "student-v2-free-surface-transverse-inertia-rectangle",
  "category": "Additional Ship Operations",
  "name": "Free-surface transverse inertia (rectangle)",
  "formula": "I = l b³/12",
  "note": "Unobstructed rectangular free surface, l longitudinal, b transverse",
  "tags": "free surface"
 },
 {
  "id": "student-v2-waterplane-second-moment-rectangle",
  "category": "Additional Ship Operations",
  "name": "Waterplane second moment (rectangle)",
  "formula": "I = L B³/12",
  "note": "Rectangular approximation only",
  "tags": "hydrostatics"
 },
 {
  "id": "student-v2-draft-difference",
  "category": "Additional Ship Operations",
  "name": "Draft difference",
  "formula": "trim = Taft − Tfore",
  "note": "Sign convention: positive stern trim",
  "tags": "trim"
 },
 {
  "id": "student-v2-tons-per-cm-from-density",
  "category": "Additional Ship Operations",
  "name": "Tons per cm from density",
  "formula": "TPC = Aw ρwater/100",
  "note": "Recalculate when water density/area changes",
  "tags": "draft"
 },
 {
  "id": "student-v2-wind-force-drag-estimate",
  "category": "Additional Ship Operations",
  "name": "Wind force drag estimate",
  "formula": "F ≈ 0.5 ρair Cd A V²",
  "note": "Effective Cd and projected area; simplified",
  "tags": "wind"
 }
]);
