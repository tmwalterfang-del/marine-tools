// Independent hand-calculation references for the structured Education working.
// Sources: the dimensional hand calculations beside each case, using the
// balanced RMS power triangle, gravitational energy per unit mass, elapsed
// voyage time, sensible heat, work per shaft revolution and fuel mass per kWh.
// Constants/conversions: sqrt(3) = 1.7320508075688772935,
// pi = 3.1415926535897932385, standard gravity = 9.80665 m/s²,
// 1 h = 3600 s, 1 d = 24 h, 1 kWh = 3600 kJ, 1 kW = 1000 W,
// 1 kg = 1000 g and 1 kn = 1 NM/h.
// Valid scope: finite positive voltage, density, flow, head, speed, mass,
// specific heat, rpm and output power; nonnegative current, distance, daily
// fuel, temperature rise, torque and fuel flow; 0 <= power factor <= 1.
// These ideal, steady examples do not include losses, reserve or phase change.
// All oracle numbers are literals: no calculator, formatter or executable
// engineering formula is used to generate an expected value.
import { catalogue } from './lib/students-catalogue.mjs';

// Relative error <= 1e-9 for every nonzero reference; zero must be exact.
const RELATIVE_TOLERANCE = 1e-9;
const references = [
  {
    id: 'three-phase', unit: 'kW', finalKey: 'active_kW',
    cases: [
      // 200 V * 10 A = 2 kVA before the three-phase factor.
      // S = 2 sqrt(3) = 3.4641016151377546 kVA. A 3:4:5 power
      // triangle (pf = 3/5) gives P = 2.0784609690826528 kW and
      // Q = 2.7712812921102037 kvar.
      { inputs: { u: 200, i: 10, pf: 0.6 }, expected: [
        ['apparent_kVA', 3.4641016151377546, 'kVA'],
        ['reactive_kvar', 2.7712812921102037, 'kvar'],
        ['active_kW', 2.0784609690826528, 'kW'],
      ] },
      // 230 * 12.5 = 2875 VA; S = 2.875 sqrt(3) =
      // 4.979646071760522 kVA. Unity pf means P = S and Q = 0.
      { inputs: { u: 230, i: 12.5, pf: 1 }, expected: [
        ['apparent_kVA', 4.979646071760522, 'kVA'],
        ['reactive_kvar', 0, 'kvar'],
        ['active_kW', 4.979646071760522, 'kW'],
      ] },
      // 690 * 80 = 55200 VA; S = 55.2 sqrt(3) =
      // 95.60920457780203 kVA. Zero pf means P = 0 and Q = S.
      { inputs: { u: 690, i: 80, pf: 0 }, expected: [
        ['apparent_kVA', 95.60920457780203, 'kVA'],
        ['reactive_kvar', 95.60920457780203, 'kvar'],
        ['active_kW', 0, 'kW'],
      ] },
    ],
  },
  {
    id: 'hydraulic-power', unit: 'kW', finalKey: 'power_kW',
    cases: [
      // 72/3600 = 0.02 m³/s, hence 20 kg/s at 1000 kg/m³.
      // Raising each kg by 10 m needs 98.0665 J:
      // 20 * 98.0665 = 1961.33 W = 1.96133 kW.
      { inputs: { rho: 1000, flow: 72, head: 10 }, expected: [
        ['flow_m3s', 0.02, 'm³/s'],
        ['power_W', 1961.33, 'W'],
        ['power_kW', 1.96133, 'kW'],
      ] },
      // 18/3600 = 0.005 m³/s; 1025 * 0.005 = 5.125 kg/s.
      // 9.80665 * 12.5 = 122.583125 J/kg; multiplying by 5.125
      // gives 628.238515625 W = 0.628238515625 kW.
      { inputs: { rho: 1025, flow: 18, head: 12.5 }, expected: [
        ['flow_m3s', 0.005, 'm³/s'],
        ['power_W', 628.238515625, 'W'],
        ['power_kW', 0.628238515625, 'kW'],
      ] },
      // 144/3600 = 0.04 m³/s; 850 * 0.04 = 34 kg/s.
      // 30 m needs 294.1995 J/kg; 34 * 294.1995 =
      // 10002.783 W = 10.002783 kW.
      { inputs: { rho: 850, flow: 144, head: 30 }, expected: [
        ['flow_m3s', 0.04, 'm³/s'],
        ['power_W', 10002.783, 'W'],
        ['power_kW', 10.002783, 'kW'],
      ] },
    ],
  },
  {
    id: 'voyage-fuel', unit: 'm³', finalKey: 'fuel_m3',
    cases: [
      // 480/10 = 48 h; 48/24 = 2 d; 2 * 15 = 30 m³.
      { inputs: { dist: 480, speed: 10, daily: 15 }, expected: [
        ['sea_time_h', 48, 'h'],
        ['sea_time_d', 2, 'd'],
        ['fuel_m3', 30, 'm³'],
      ] },
      // 135/7.5 = 18 h; 18/24 = 0.75 d; 0.75 * 8.4 = 6.3 m³.
      { inputs: { dist: 135, speed: 7.5, daily: 8.4 }, expected: [
        ['sea_time_h', 18, 'h'],
        ['sea_time_d', 0.75, 'd'],
        ['fuel_m3', 6.3, 'm³'],
      ] },
      // 100/8 = 12.5 h; 12.5/24 = 25/48 = 0.5208333333333333 d.
      // 9.6 * 25/48 = 240/48 = 5 m³.
      { inputs: { dist: 100, speed: 8, daily: 9.6 }, expected: [
        ['sea_time_h', 12.5, 'h'],
        ['sea_time_d', 0.5208333333333333, 'd'],
        ['fuel_m3', 5, 'm³'],
      ] },
    ],
  },
  {
    id: 'heat-energy', unit: 'kWh', finalKey: 'heat_kWh',
    cases: [
      // 360 * 2 = 720 kJ/K; 720 * 10 = 7200 kJ;
      // 7200/3600 = 2 kWh.
      { inputs: { m: 360, cp: 2, dt: 10 }, expected: [
        ['heat_kJ', 7200, 'kJ'],
        ['heat_kWh', 2, 'kWh'],
      ] },
      // 12.5 * 4.18 = 52.25 kJ/K; 52.25 * 8 = 418 kJ;
      // 418/3600 = 209/1800 = 0.11611111111111111 kWh.
      { inputs: { m: 12.5, cp: 4.18, dt: 8 }, expected: [
        ['heat_kJ', 418, 'kJ'],
        ['heat_kWh', 0.11611111111111111, 'kWh'],
      ] },
      // 80 * 0.9 = 72 kJ/K; 72 * 25 = 1800 kJ;
      // 1800/3600 = 0.5 kWh.
      { inputs: { m: 80, cp: 0.9, dt: 25 }, expected: [
        ['heat_kJ', 1800, 'kJ'],
        ['heat_kWh', 0.5, 'kWh'],
      ] },
    ],
  },
  {
    id: 'shaft-power', unit: 'kW', finalKey: 'power_kW',
    cases: [
      // 600 rpm = 10 rev/s; each turn is 2 pi rad, giving
      // 20 pi = 62.831853071795865 rad/s. Each turn at 20 N·m
      // transfers 40 pi J; ten turns/s give 400 pi =
      // 1256.6370614359173 W = 1.2566370614359173 kW.
      { inputs: { rpm: 600, torque: 20 }, expected: [
        ['omega_rads', 62.831853071795865, 'rad/s'],
        ['power_W', 1256.6370614359173, 'W'],
        ['power_kW', 1.2566370614359173, 'kW'],
      ] },
      // 75 rpm = 1.25 rev/s; 2.5 pi = 7.853981633974483 rad/s.
      // Each turn at 32 N·m transfers 64 pi J; 1.25 turns/s
      // give 80 pi = 251.32741228718346 W = 0.25132741228718347 kW.
      { inputs: { rpm: 75, torque: 32 }, expected: [
        ['omega_rads', 7.853981633974483, 'rad/s'],
        ['power_W', 251.32741228718346, 'W'],
        ['power_kW', 0.25132741228718347, 'kW'],
      ] },
      // 123.75 rpm = 2.0625 rev/s; 4.125 pi =
      // 12.959069696057897 rad/s. Each turn at 12.8 N·m transfers
      // 25.6 pi J; 2.0625 turns/s give 52.8 pi =
      // 165.8760921095411 W = 0.1658760921095411 kW.
      { inputs: { rpm: 123.75, torque: 12.8 }, expected: [
        ['omega_rads', 12.959069696057897, 'rad/s'],
        ['power_W', 165.8760921095411, 'W'],
        ['power_kW', 0.1658760921095411, 'kW'],
      ] },
    ],
  },
  {
    id: 'sfoc', unit: 'g/kWh', finalKey: 'sfoc_gkWh',
    cases: [
      // One hour uses 12 kg = 12000 g while producing 60 kWh;
      // 12000/60 = 200 g/kWh.
      { inputs: { fuel: 12, power: 60 }, expected: [
        ['fuel_gh', 12000, 'g/h'],
        ['sfoc_gkWh', 200, 'g/kWh'],
      ] },
      // One hour uses 2.75 kg = 2750 g and produces 12.5 kWh;
      // 2750/12.5 = 220 g/kWh.
      { inputs: { fuel: 2.75, power: 12.5 }, expected: [
        ['fuel_gh', 2750, 'g/h'],
        ['sfoc_gkWh', 220, 'g/kWh'],
      ] },
      // One hour uses 7 kg = 7000 g and produces 48 kWh;
      // 7000/48 = 875/6 = 145.83333333333333 g/kWh.
      { inputs: { fuel: 7, power: 48 }, expected: [
        ['fuel_gh', 7000, 'g/h'],
        ['sfoc_gkWh', 145.83333333333333, 'g/kWh'],
      ] },
    ],
  },
];

// Extension/expansion references: elementary dimensional hand calculations.
// Valid ranges are stated on each calculator and exercised below; strictly
// positive-only domains have no valid zero endpoint. Shared constants above
// also give sqrt(2) = 1.4142135623730950488 and 1 L = 0.001 m³.
// Financial factors below are independently summed discounted payments,
// not evaluations of the implementation's log1p/expm1 expressions.
references.push(
  {
    id: 'molar-concentration', unit: 'mol/L', finalKey: 'concentration_molL',
    cases: [
      // Three moles in twelve litres: each litre contains 3/12 = 0.25 mol.
      { inputs: { moles: 3, litres: 12 }, expected: [
        ['concentration_molL', 0.25, 'mol/L'],
      ] },
      // One mole in half a litre is two moles per litre.
      { inputs: { moles: 1, litres: 0.5 }, expected: [
        ['concentration_molL', 2, 'mol/L'],
      ] },
    ],
  },
  {
    id: 'dilution-volume', unit: 'L', finalKey: 'volume_L',
    cases: [
      // 3 mol/L * 0.4 L = 1.2 mol; at 0.6 mol/L this needs 2 L.
      { inputs: { c1: 3, v1: 0.4, c2: 0.6 }, expected: [
        ['solute_mol', 1.2, 'mol'], ['volume_L', 2, 'L'],
      ] },
      // No-dilution boundary: 1.5 * 0.2 = 0.3 mol; the same
      // 1.5 mol/L concentration keeps the volume at 0.2 L.
      { inputs: { c1: 1.5, v1: 0.2, c2: 1.5 }, expected: [
        ['solute_mol', 0.3, 'mol'], ['volume_L', 0.2, 'L'],
      ] },
    ],
  },
  {
    id: 'ph', unit: 'pH', finalKey: 'ph',
    cases: [
      // 10^-8 has common logarithm -8; negating gives pH 8.
      { inputs: { activity: 0.00000001 }, expected: [
        ['log_activity', -8, 'dimensionless'], ['ph', 8, 'pH'],
      ] },
      // Unit activity: log10(1) = 0, hence pH = 0.
      { inputs: { activity: 1 }, expected: [
        ['log_activity', 0, 'dimensionless'], ['ph', 0, 'pH'],
      ] },
    ],
  },
  {
    id: 'amp-feedback', unit: 'ratio', finalKey: 'feedback_gain',
    cases: [
      // 20 * 0.15 = 3; denominator 1 + 3 = 4; gain 20/4 = 5.
      { inputs: { gain: 20, beta: 0.15 }, expected: [
        ['loop_gain', 3, 'ratio'], ['feedback_denominator', 4, 'ratio'],
        ['feedback_gain', 5, 'ratio'],
      ] },
      // Zero feedback: loop gain 8 * 0 = 0, denominator 1, gain 8.
      { inputs: { gain: 8, beta: 0 }, expected: [
        ['loop_gain', 0, 'ratio'], ['feedback_denominator', 1, 'ratio'],
        ['feedback_gain', 8, 'ratio'],
      ] },
    ],
  },
  {
    id: 'db-gain', unit: 'dB', finalKey: 'gain_dB',
    cases: [
      // V2/V1 = 1/10 = 0.1; log10(0.1) = -1; 20 * -1 = -20 dB.
      { inputs: { vin: 10, vout: 1 }, expected: [
        ['voltage_ratio', 0.1, 'ratio'], ['gain_dB', -20, 'dB'],
      ] },
      // Unity voltage ratio is the zero-decibel boundary: 20 log10(1) = 0.
      { inputs: { vin: 2, vout: 2 }, expected: [
        ['voltage_ratio', 1, 'ratio'], ['gain_dB', 0, 'dB'],
      ] },
    ],
  },
  {
    id: 'rc-frequency', unit: 'Hz', finalKey: 'cutoff_Hz',
    cases: [
      // 2 µF = 0.000002 F; 500 Ω gives τ = 0.001 s.
      // One radian time τ means fc = 1000/(2pi) = 159.15494309189535 Hz.
      { inputs: { res: 500, cap: 2 }, expected: [
        ['capacitance_F', 0.000002, 'F'], ['time_constant_s', 0.001, 's'],
        ['cutoff_Hz', 159.15494309189535, 'Hz'],
      ] },
      // 1000 * 0.000002 = 0.002 s; fc = 500/(2pi) = 79.57747154594767 Hz.
      { inputs: { res: 1000, cap: 2 }, expected: [
        ['capacitance_F', 0.000002, 'F'], ['time_constant_s', 0.002, 's'],
        ['cutoff_Hz', 79.57747154594767, 'Hz'],
      ] },
    ],
  },
  {
    id: 'buck-converter', unit: 'V', finalKey: 'output_V',
    cases: [
      // A quarter of each ideal switching period at 24 V averages to 6 V.
      { inputs: { vin: 24, duty: 0.25 }, expected: [['output_V', 6, 'V']] },
      // Ideal lower duty endpoint: the input is never connected, so 0 V.
      { inputs: { vin: 12, duty: 0 }, expected: [['output_V', 0, 'V']] },
      // Ideal upper duty endpoint: continuous connection gives the full 12 V.
      { inputs: { vin: 12, duty: 1 }, expected: [['output_V', 12, 'V']] },
    ],
  },
  {
    id: 'shaft-torsion-stress', unit: 'MPa', finalKey: 'shear_MPa',
    cases: [
      // 100 N·m = 100000 N·mm; 20³ = 8000 mm³.
      // 16 * 100000 / 8000 = 200; 200/pi = 63.66197723675813 N/mm² = MPa.
      { inputs: { torque: 100, diameter: 20 }, expected: [
        ['torque_Nmm', 100000, 'N·mm'], ['diameter_cubed_mm3', 8000, 'mm³'],
        ['shear_MPa', 63.66197723675813, 'MPa'],
      ] },
      // 1 N·m = 1000 N·mm; 10³ = 1000 mm³.
      // 16 * 1000 / (1000pi) = 16/pi = 5.092958178940651 MPa.
      { inputs: { torque: 1, diameter: 10 }, expected: [
        ['torque_Nmm', 1000, 'N·mm'], ['diameter_cubed_mm3', 1000, 'mm³'],
        ['shear_MPa', 5.092958178940651, 'MPa'],
      ] },
    ],
  },
  {
    id: 'otto-efficiency', unit: '%', finalKey: 'efficiency_pct',
    cases: [
      // κ = 2 gives exponent 1: 4^1 = 4; rejected heat fraction 1/4.
      // Remaining fraction 3/4 = 0.75, hence 75% efficiency.
      { inputs: { ratio: 4, kappa: 2 }, expected: [
        ['exponent', 1, 'dimensionless'], ['temperature_ratio', 4, 'ratio'],
        ['efficiency_fraction', 0.75, 'dimensionless'], ['efficiency_pct', 75, '%'],
      ] },
      // Exponent 1 again: compression ratio 2 leaves 1 - 1/2 = 0.5 = 50%.
      { inputs: { ratio: 2, kappa: 2 }, expected: [
        ['exponent', 1, 'dimensionless'], ['temperature_ratio', 2, 'ratio'],
        ['efficiency_fraction', 0.5, 'dimensionless'], ['efficiency_pct', 50, '%'],
      ] },
    ],
  },
  {
    id: 'engine-swept-volume', unit: 'm³', finalKey: 'total_volume_m3',
    cases: [
      // 1000 mm = 1 m for bore and stroke. Each cylinder sweeps pi/4
      // = 0.7853981633974483 m³; four cylinders sweep pi m³.
      { inputs: { bore: 1000, stroke: 1000, cylinders: 4 }, expected: [
        ['bore_m', 1, 'm'], ['stroke_m', 1, 'm'],
        ['cylinder_volume_m3', 0.7853981633974483, 'm³'],
        ['total_volume_m3', 3.141592653589793, 'm³'],
      ] },
      // Minimum cylinder count 1: 100 mm = 0.1 m; radius 0.05 m.
      // Area 0.0025pi m² * stroke 0.1 m = pi/4000 m³.
      { inputs: { bore: 100, stroke: 100, cylinders: 1 }, expected: [
        ['bore_m', 0.1, 'm'], ['stroke_m', 0.1, 'm'],
        ['cylinder_volume_m3', 0.0007853981633974483, 'm³'],
        ['total_volume_m3', 0.0007853981633974483, 'm³'],
      ] },
    ],
  },
  {
    id: 'wet-steam-enthalpy', unit: 'kJ/kg', finalKey: 'enthalpy_kJkg',
    cases: [
      // One-quarter vapour contributes 0.25 * 1800 = 450 kJ/kg;
      // adding liquid enthalpy 300 gives 750 kJ/kg.
      { inputs: { hf: 300, hfg: 1800, x: 0.25 }, expected: [
        ['latent_contribution_kJkg', 450, 'kJ/kg'], ['enthalpy_kJkg', 750, 'kJ/kg'],
      ] },
      // Saturated liquid endpoint: x = 0, latent contribution 0; h = hf = 600.
      { inputs: { hf: 600, hfg: 2000, x: 0 }, expected: [
        ['latent_contribution_kJkg', 0, 'kJ/kg'], ['enthalpy_kJkg', 600, 'kJ/kg'],
      ] },
      // Saturated vapour endpoint: x = 1; 600 + 2000 = 2600 kJ/kg.
      { inputs: { hf: 600, hfg: 2000, x: 1 }, expected: [
        ['latent_contribution_kJkg', 2000, 'kJ/kg'], ['enthalpy_kJkg', 2600, 'kJ/kg'],
      ] },
    ],
  },
  {
    id: 'refrigeration-cop', unit: 'ratio', finalKey: 'cop_ratio',
    cases: [
      // Each kg absorbs 300 - 100 = 200 kJ and needs 350 - 300 = 50 kJ;
      // the heat/work ratio is 200/50 = 4.
      { inputs: { h1: 300, h2: 350, h4: 100 }, expected: [
        ['evaporator_heat_kJkg', 200, 'kJ/kg'], ['compressor_work_kJkg', 50, 'kJ/kg'],
        ['cop_ratio', 4, 'ratio'],
      ] },
      // Zero reference enthalpy is valid: 0 - (-120) = 120;
      // 20 - 0 = 20; 120/20 = 6 (no enthalpy-difference zero is valid).
      { inputs: { h1: 0, h2: 20, h4: -120 }, expected: [
        ['evaporator_heat_kJkg', 120, 'kJ/kg'], ['compressor_work_kJkg', 20, 'kJ/kg'],
        ['cop_ratio', 6, 'ratio'],
      ] },
    ],
  },
  {
    id: 'relative-humidity', unit: '%', finalKey: 'humidity_pct',
    cases: [
      // 600 Pa is 1/4 of 2400 Pa saturation pressure: 25% RH.
      { inputs: { pv: 600, psat: 2400 }, expected: [
        ['pressure_ratio', 0.25, 'ratio'], ['humidity_pct', 25, '%'],
      ] },
      // Saturation endpoint: equal 1500 Pa pressures give ratio 1 and 100% RH.
      { inputs: { pv: 1500, psat: 1500 }, expected: [
        ['pressure_ratio', 1, 'ratio'], ['humidity_pct', 100, '%'],
      ] },
    ],
  },
  {
    id: 'real-interest', unit: '%', finalKey: 'real_rate_pct',
    cases: [
      // Inflation 25% is fraction 0.25, factor 1.25. The rate spread is
      // 10 - 25 = -15 percentage points; -15/1.25 = -12%.
      { inputs: { nominal: 10, inflation: 25 }, expected: [
        ['inflation_fraction', 0.25, 'dimensionless'], ['inflation_factor', 1.25, 'ratio'],
        ['rate_spread_pct', -15, '%'], ['real_rate_pct', -12, '%'],
      ] },
      // Zero-rate endpoints: no price change and no nominal return give 0% real.
      { inputs: { nominal: 0, inflation: 0 }, expected: [
        ['inflation_fraction', 0, 'dimensionless'], ['inflation_factor', 1, 'ratio'],
        ['rate_spread_pct', 0, '%'], ['real_rate_pct', 0, '%'],
      ] },
    ],
  },
  {
    id: 'annuity-pv', unit: 'NOK', finalKey: 'pv_NOK',
    cases: [
      // At 10%, payments 121 discount separately to 110 and 100 NOK.
      // PV = 210 NOK; unit-payment factor = 210/121 = 1.7355371900826446.
      { inputs: { payment: 121, r: 10, periods: 2 }, expected: [
        ['rate_fraction', 0.1, 'dimensionless'],
        ['annuity_factor', 1.7355371900826446, 'dimensionless'], ['pv_NOK', 210, 'NOK'],
      ] },
      // Zero discount: four payments of 250 retain full value; factor 4, PV 1000.
      { inputs: { payment: 250, r: 0, periods: 4 }, expected: [
        ['rate_fraction', 0, 'dimensionless'], ['annuity_factor', 4, 'dimensionless'],
        ['pv_NOK', 1000, 'NOK'],
      ] },
    ],
  },
  {
    id: 'radioactive-half-life', unit: 'g', finalKey: 'mass_g',
    cases: [
      // 15/5 = 3 half-lives; successive halving of 64 g gives 32, 16, 8 g.
      // Remaining fraction is 1/8 = 0.125.
      { inputs: { initial: 64, time: 15, half: 5 }, expected: [
        ['half_lives', 3, 'dimensionless'], ['remaining_fraction', 0.125, 'dimensionless'],
        ['mass_g', 8, 'g'],
      ] },
      // Zero elapsed time: zero half-lives, whole fraction 1, mass unchanged at 7 g.
      { inputs: { initial: 7, time: 0, half: 4 }, expected: [
        ['half_lives', 0, 'dimensionless'], ['remaining_fraction', 1, 'dimensionless'],
        ['mass_g', 7, 'g'],
      ] },
    ],
  },
  {
    id: 'sound-db', unit: 'dB', finalKey: 'gain_dB',
    cases: [
      // 1 W / 100 W = 0.01 = 10^-2; ten times its logarithm is -20 dB.
      { inputs: { out: 1, input: 100 }, expected: [
        ['power_ratio', 0.01, 'ratio'], ['gain_dB', -20, 'dB'],
      ] },
      // Equal powers: 3/3 = 1; log10(1) = 0 gives the zero-gain boundary.
      { inputs: { out: 3, input: 3 }, expected: [
        ['power_ratio', 1, 'ratio'], ['gain_dB', 0, 'dB'],
      ] },
    ],
  },
  {
    id: 'rc-filter', unit: 'Hz', finalKey: 'cutoff_Hz',
    cases: [
      // 1 kΩ = 1000 Ω and 1 µF = 0.000001 F: τ = 0.001 s;
      // fc = 1000/(2pi) = 159.15494309189535 Hz.
      { inputs: { r: 1, c: 1 }, expected: [
        ['resistance_ohm', 1000, 'Ω'], ['capacitance_F', 0.000001, 'F'],
        ['time_constant_s', 0.001, 's'], ['cutoff_Hz', 159.15494309189535, 'Hz'],
      ] },
      // 2 kΩ = 2000 Ω, 0.25 µF = 0.00000025 F: τ = 0.0005 s;
      // fc = 2000/(2pi) = 318.3098861837907 Hz.
      { inputs: { r: 2, c: 0.25 }, expected: [
        ['resistance_ohm', 2000, 'Ω'], ['capacitance_F', 0.00000025, 'F'],
        ['time_constant_s', 0.0005, 's'], ['cutoff_Hz', 318.3098861837907, 'Hz'],
      ] },
    ],
  },
  {
    id: 'fullwave-rectifier', unit: 'V DC mean', finalKey: 'mean_V',
    cases: [
      // A sinusoid at 10 V RMS peaks at 10 sqrt(2) = 14.142135623730951 V.
      // The rectified sine area over pi radians is 2Vm, giving mean 9.003163161571061 V.
      { inputs: { rms: 10 }, expected: [
        ['peak_V', 14.142135623730951, 'V'], ['mean_V', 9.003163161571061, 'V DC mean'],
      ] },
      // At 1 V RMS, peak is sqrt(2); the same normalized area gives
      // 2sqrt(2)/pi = 0.9003163161571061 V mean. Zero input is excluded by validation.
      { inputs: { rms: 1 }, expected: [
        ['peak_V', 1.4142135623730951, 'V'], ['mean_V', 0.9003163161571061, 'V DC mean'],
      ] },
    ],
  },
  {
    id: 'engine-displacement', unit: 'L', finalKey: 'total_volume_L',
    cases: [
      // Bore and stroke 100 mm = 0.1 m: one cylinder sweeps pi/4000 m³.
      // Four cylinders sweep pi/1000 m³ = pi L (1 m³ = 1000 L).
      { inputs: { bore: 100, stroke: 100, cyl: 4 }, expected: [
        ['bore_m', 0.1, 'm'], ['stroke_m', 0.1, 'm'],
        ['cylinder_volume_m3', 0.0007853981633974483, 'm³'],
        ['total_volume_m3', 0.003141592653589793, 'm³'], ['total_volume_L', 3.141592653589793, 'L'],
      ] },
      // Minimum cylinder count 1: the same pi/4000 m³ is pi/4 L.
      { inputs: { bore: 100, stroke: 100, cyl: 1 }, expected: [
        ['bore_m', 0.1, 'm'], ['stroke_m', 0.1, 'm'],
        ['cylinder_volume_m3', 0.0007853981633974483, 'm³'],
        ['total_volume_m3', 0.0007853981633974483, 'm³'], ['total_volume_L', 0.7853981633974483, 'L'],
      ] },
    ],
  },
  {
    id: 'mean-piston-speed', unit: 'm/s', finalKey: 'piston_speed_ms',
    cases: [
      // Two 0.2 m strokes = 0.4 m per turn; 300 rpm = 5 turns/s;
      // piston distance per second is 0.4 * 5 = 2 m/s.
      { inputs: { stroke: 0.2, rpm: 300 }, expected: [
        ['travel_per_rev_m', 0.4, 'm'], ['speed_revs', 5, 'rev/s'], ['piston_speed_ms', 2, 'm/s'],
      ] },
      // 60 rpm = 1 turn/s and two 0.1 m strokes give 0.2 m/s.
      { inputs: { stroke: 0.1, rpm: 60 }, expected: [
        ['travel_per_rev_m', 0.2, 'm'], ['speed_revs', 1, 'rev/s'], ['piston_speed_ms', 0.2, 'm/s'],
      ] },
    ],
  },
  {
    id: 'steam-boiler-heat', unit: 'kW', finalKey: 'heat_kW',
    cases: [
      // 360 kg/h = 0.1 kg/s; each kg gains 1500 - 500 = 1000 kJ;
      // 0.1 * 1000 = 100 kJ/s = 100 kW.
      { inputs: { flow: 360, hout: 1500, hin: 500 }, expected: [
        ['flow_kgs', 0.1, 'kg/s'], ['enthalpy_rise_kJkg', 1000, 'kJ/kg'], ['heat_kW', 100, 'kW'],
      ] },
      // Equal enthalpy boundary: 1800 kg/h = 0.5 kg/s, Δh = 0, duty 0.
      { inputs: { flow: 1800, hout: 500, hin: 500 }, expected: [
        ['flow_kgs', 0.5, 'kg/s'], ['enthalpy_rise_kJkg', 0, 'kJ/kg'], ['heat_kW', 0, 'kW'],
      ] },
      // Signed heat removal is accepted: 720 kg/h = 0.2 kg/s;
      // -100 - 400 = -500 kJ/kg gives -100 kW.
      { inputs: { flow: 720, hout: -100, hin: 400 }, expected: [
        ['flow_kgs', 0.2, 'kg/s'], ['enthalpy_rise_kJkg', -500, 'kJ/kg'], ['heat_kW', -100, 'kW'],
      ] },
    ],
  },
  {
    id: 'cooling-cop', unit: 'dimensionless', finalKey: 'cop',
    cases: [
      // Absorbed heat 300 - 100 = 200 kJ/kg; work 350 - 300 = 50;
      // 200/50 gives COP 4, without a unit word in the rendered step.
      { inputs: { h1: 300, h2: 350, h4: 100 }, expected: [
        ['evaporator_heat_kJkg', 200, 'kJ/kg'], ['compressor_work_kJkg', 50, 'kJ/kg'],
        ['cop', 4, 'dimensionless'],
      ] },
      // Zero reference enthalpy is valid: 0 - (-100) = 100 kJ/kg;
      // 50 - 0 = 50 kJ/kg, so COP = 2.
      { inputs: { h1: 0, h2: 50, h4: -100 }, expected: [
        ['evaporator_heat_kJkg', 100, 'kJ/kg'], ['compressor_work_kJkg', 50, 'kJ/kg'],
        ['cop', 2, 'dimensionless'],
      ] },
    ],
  },
  {
    id: 'shaft-torsion', unit: 'mm⁴', finalKey: 'polar_moment_mm4',
    cases: [
      // Diameter 2 mm gives d⁴ = 16 mm⁴ and J = 16pi/32 = pi/2 mm⁴.
      { inputs: { d: 2 }, expected: [
        ['diameter_fourth_mm4', 16, 'mm⁴'], ['polar_moment_mm4', 1.5707963267948966, 'mm⁴'],
      ] },
      // Diameter 1 mm gives d⁴ = 1 mm⁴; J = pi/32 = 0.09817477042468103 mm⁴.
      { inputs: { d: 1 }, expected: [
        ['diameter_fourth_mm4', 1, 'mm⁴'], ['polar_moment_mm4', 0.09817477042468103, 'mm⁴'],
      ] },
    ],
  },
  {
    id: 'annuity-payment', unit: 'NOK / period', finalKey: 'payment_NOK',
    cases: [
      // A payment of 121 repays 210 at 10% over two periods: interest
      // 21 leaves principal repayment 100; next balance 110 accrues 11,
      // then the second 121 clears it. Factor 210/121 = 1.7355371900826446.
      { inputs: { pv: 210, rate: 10, periods: 2 }, expected: [
        ['rate_fraction', 0.1, 'dimensionless'], ['annuity_factor', 1.7355371900826446, 'dimensionless'],
        ['payment_NOK', 121, 'NOK / period'],
      ] },
      // Zero interest: three equal repayments divide 600 NOK into 200 each.
      { inputs: { pv: 600, rate: 0, periods: 3 }, expected: [
        ['rate_fraction', 0, 'dimensionless'], ['annuity_factor', 3, 'dimensionless'],
        ['payment_NOK', 200, 'NOK / period'],
      ] },
    ],
  },
  {
    id: 'npv', unit: 'NOK', finalKey: 'npv_NOK',
    cases: [
      // 121 received after one year at 10% is worth 110 today, after
      // two years 100; total 210 less initial cost 200 gives NPV 10.
      { inputs: { cost: 200, flow: 121, rate: 10, years: 2 }, expected: [
        ['rate_fraction', 0.1, 'dimensionless'], ['pv_year_1', 110, 'NOK'],
        ['pv_year_2', 100, 'NOK'], ['inflows_pv_NOK', 210, 'NOK'], ['npv_NOK', 10, 'NOK'],
      ] },
      // Lower endpoints: zero inflow, zero discount, minimum one year.
      // No money is recovered: PV 0 and NPV = -300 NOK initial cost.
      { inputs: { cost: 300, flow: 0, rate: 0, years: 1 }, expected: [
        ['rate_fraction', 0, 'dimensionless'], ['pv_year_1', 0, 'NOK'],
        ['inflows_pv_NOK', 0, 'NOK'], ['npv_NOK', -300, 'NOK'],
      ] },
      // Zero discount with positive inflow: 50 + 50 + 50 = 150 NOK;
      // less initial investment 100 leaves NPV 50 NOK.
      { inputs: { cost: 100, flow: 50, rate: 0, years: 3 }, expected: [
        ['rate_fraction', 0, 'dimensionless'], ['pv_year_1', 50, 'NOK'],
        ['pv_year_2', 50, 'NOK'], ['pv_year_3', 50, 'NOK'],
        ['inflows_pv_NOK', 150, 'NOK'], ['npv_NOK', 50, 'NOK'],
      ] },
    ],
  },
  {
    id: 'wave-speed', unit: 'm/s', finalKey: 'speed_ms',
    cases: [
      // Four 3 m wavelengths pass each second: 12 m/s.
      { inputs: { freq: 4, lambda: 3 }, expected: [['speed_ms', 12, 'm/s']] },
      // One 2 m wavelength every two seconds (0.5 Hz) travels at 1 m/s.
      { inputs: { freq: 0.5, lambda: 2 }, expected: [['speed_ms', 1, 'm/s']] },
    ],
  },
  {
    id: 'sound-level', unit: 'dB re reference', finalKey: 'level_dB',
    cases: [
      // 0.002 / 0.00002 = 100; log10(100) = 2; 20 * 2 = 40 dB.
      { inputs: { p: 0.002, p0: 0.00002 }, expected: [
        ['pressure_ratio', 100, 'ratio'], ['level_dB', 40, 'dB re reference'],
      ] },
      // Reference-pressure boundary: p = p0 gives ratio 1 and level 0 dB.
      { inputs: { p: 0.01, p0: 0.01 }, expected: [
        ['pressure_ratio', 1, 'ratio'], ['level_dB', 0, 'dB re reference'],
      ] },
    ],
  },
);

let checks = 0, cases = 0;
const failures = [];
function check(condition, label) {
  checks++;
  if (!condition) failures.push(label);
}
function near(actual, expected, label) {
  check(Number.isFinite(actual) && (expected === 0
    ? actual === 0
    : Math.abs(actual - expected) <= RELATIVE_TOLERANCE * Math.abs(expected)),
  `${label}: expected ${expected}, got ${String(actual)} (relative tolerance ${RELATIVE_TOLERANCE}; exact zero)`);
}
function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

try {
  const window = catalogue();
  check(Array.isArray(window.MT_CALCULATORS), 'MT_CALCULATORS is an array');
  const definitions = Array.isArray(window.MT_CALCULATORS) ? window.MT_CALCULATORS : [];
  for (const reference of references) {
    const matches = definitions.filter(calculator => calculator.id === reference.id);
    check(matches.length === 1, `${reference.id}: exactly one calculator definition`);
    const calculator = matches[0];
    check(Array.isArray(calculator?.assumptions) && calculator.assumptions.length > 0,
      `${reference.id}: assumptions is a non-empty array`);
    check(Array.isArray(calculator?.assumptions) && calculator.assumptions.every(nonempty),
      `${reference.id}: every assumption is a non-empty string`);
    check(nonempty(calculator?.range), `${reference.id}: range is a non-empty string`);

    for (const [index, fixture] of reference.cases.entries()) {
      cases++;
      const label = `${reference.id} case ${index + 1} ${JSON.stringify(fixture.inputs)}`;
      // Protect the hand-authored fixtures from becoming default-input smoke tests.
      check(Array.isArray(calculator?.fields) && calculator.fields.some(field =>
        Object.hasOwn(fixture.inputs, field.key) && fixture.inputs[field.key] !== field.initial),
      `${label}: uses non-default inputs`);
      let result;
      try {
        result = calculator.compute({ ...fixture.inputs });
        check(result !== null && typeof result === 'object' && !Array.isArray(result),
          `${label}: compute returns an object`);
      } catch (error) {
        check(false, `${label}: compute threw ${error.message}`);
        continue;
      }
      check(!result?.invalid, `${label}: valid reference inputs are accepted`);
      check(result?.unit === reference.unit, `${label}: result unit is ${reference.unit}`);
      const finalReference = fixture.expected.find(([key]) => key === reference.finalKey);
      near(result?.value, finalReference[1], `${label}: result value against literal reference`);
      check(Array.isArray(result?.steps) && result.steps.length > 0,
        `${label}: steps is a non-empty array`);
      const steps = Array.isArray(result?.steps) ? result.steps : [];
      const keyedSteps = [];
      for (const [stepIndex, step] of steps.entries()) {
        if (typeof step === 'string') {
          check(nonempty(step), `${label}: formula line ${stepIndex + 1} is non-empty`);
          continue;
        }
        const structured = step !== null && typeof step === 'object' && !Array.isArray(step);
        check(structured, `${label}: step ${stepIndex + 1} is a string or structured object`);
        if (!structured) continue;
        keyedSteps.push(step);
        check(nonempty(step.key), `${label}: step ${stepIndex + 1} has a non-empty key`);
        check(nonempty(step.expr), `${label}: ${String(step.key)} has a non-empty expression`);
        check(fixture.expected.some(([key]) => key === step.key),
          `${label}: recognized structured key ${String(step.key)}`);
        try {
          const rendered = String(step);
          check(nonempty(step.expr) && rendered.includes(step.expr),
            `${label}: String(${String(step.key)}) contains its expression`);
          const suffix = step.unit === 'dimensionless' ? '' : ` ${step.unit}`;
          check(nonempty(step.expr) && rendered.startsWith(`${step.expr} = `)
            && nonempty(step.unit) && rendered.endsWith(suffix)
            && nonempty(rendered.slice(step.expr.length + 3, suffix ? -suffix.length : undefined))
            && (step.unit !== 'dimensionless' || !rendered.endsWith(' dimensionless')),
          `${label}: String(${String(step.key)}) has expression = value with the applicable unit suffix`);
        } catch (error) {
          check(false, `${label}: String(${String(step.key)}) threw ${error.message}`);
        }
      }
      check(keyedSteps.length === fixture.expected.length,
        `${label}: expected ${fixture.expected.length} keyed steps, got ${keyedSteps.length}`);
      check(new Set(keyedSteps.map(step => step.key)).size === keyedSteps.length,
        `${label}: structured step keys are unique`);
      for (const [key, expected, unit] of fixture.expected) {
        const matches = keyedSteps.filter(step => step.key === key);
        check(matches.length === 1, `${label}: exactly one ${key} step`);
        near(matches[0]?.value, expected, `${label}: ${key} against literal reference`);
        check(matches[0]?.unit === unit, `${label}: ${key} unit is ${unit}`);
      }
      // Reactive power is an intermediate for this contract: the final
      // three-phase keyed step must be active_kW, the calculator's result.
      const finalStep = keyedSteps.at(-1);
      check(finalStep?.key === reference.finalKey,
        `${label}: final keyed step is ${reference.finalKey}`);
      check(Number.isFinite(finalStep?.value) && finalStep.value === result?.value,
        `${label}: final keyed step equals result.value without display rounding`);
      check(finalStep?.unit === result?.unit,
        `${label}: final keyed step unit equals result.unit`);
    }
  }
} catch (error) {
  check(false, `Catalogue/reference execution failed: ${error.stack || error.message}`);
}

for (const failure of failures) console.error(`FAIL: ${failure}`);
console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : 'PASS',
  calculators: references.length,
  cases,
  checks,
}));
if (failures.length) process.exitCode = 1;
