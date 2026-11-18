/*
 * Marine Tools seawater density, 2026-11-17. No dependencies or UI effects.
 *
 * Model: TEOS-10 Gibbs pressure derivative, with SA assumed equal to SR.
 * SR [g/kg] = (35.16504 / 35) SP; SP is dimensionless PSS-78.
 * tC is in-situ ITS-90 Celsius, NOT potential/Conservative Temperature.
 * pDbar is sea (gauge) pressure; P [Pa] = 101325 + 10000 pDbar.
 *
 * Equations and numerical coefficient tables, independently implemented here:
 * - IAPWS R13-08 (2008), Eqs. (3), (4), (7), Tables 1, 2, 6:
 *   https://www.teos-10.org/pubs/IAPWS-08.pdf
 *   Feistel (2008), https://doi.org/10.1016/j.dsr.2008.07.004
 * - IAPWS SR7-09 (2009), Eq. (1), Tables 1, 2, 4:
 *   https://iapws.org/technical-guidance/release/OceanLiquid.download
 *   Feistel (2003), https://doi.org/10.1016/S0079-6611(03)00088-0
 * - IOC/SCOR/IAPSO (2010), TEOS-10 Manual, sections 2.5, 2.8,
 *   appendices G/H: https://www.teos-10.org/pubs/TEOS-10_Manual.pdf
 *
 * g = gW + gS; v = (dg/dP)_(SA,t); rho = 1/v.
 * Let x = sqrt(SA / (40 * 35.16504/35)), y = tC/40, z = pDbar/10000.
 * vW = 1e-8 sum(k * gW_jk * y^j * z^(k-1)),
 * vS = 1e-8 sum(k * gS_ijk * x^i * y^j * z^(k-1)).
 * Terms with k=0 (including the logarithmic saline terms) differentiate
 * to zero; only the nonzero k>=1 coefficients are needed below.
 * The pressure derivative is per Pa, not per dbar.
 * This direct in-situ-temperature route needs no CT or potential-temperature
 * approximation and does not use the Roquet 75-term specific-volume fit.
 *
 * Coefficient attribution: (c) 2008, 2009 International Association for the
 * Properties of Water and Steam (IAPWS). Both releases allow publication in
 * whole or part with attribution. Original implementation follows the repo
 * LICENSE; see SEAWATER_ATTRIBUTION.md. No GSW software is redistributed or
 * translated, and no IAPWS/GSW endorsement or certification is claimed.
 *
 * Deliberately bounded liquid-water subset: SP 0..40, tC 0..40,
 * pDbar 0..9989.8675 (P <= 100 MPa), inclusive. No extrapolation/clamping.
 * SA anomaly, location corrections, dissolved air and nonstandard solutes
 * are not modelled. SP=0 is the pure-water limit, not every natural fresh
 * water composition. valid=true means supported inputs, not measured accuracy.
 * FWA/DWA/displacement callers normally use surface pressure pDbar=0.
 * Callers must parse fields using the shared comma-aware parser before calling;
 * strings, blank fields, null and booleans are refused, never coerced to zero.
 */
(function (root) {
  'use strict';

  const SALINITY_FACTOR = 35.16504 / 35;
  const MODEL = 'TEOS-10-SA=SR-GIBBS';
  const validRange = Object.freeze({
    sp: Object.freeze({ min: 0, max: 40, scale: 'PSS-78', unit: '1' }),
    tC: Object.freeze({ min: 0, max: 40, scale: 'ITS-90', unit: 'degC' }),
    pDbar: Object.freeze({ min: 0, max: 9989.8675, unit: 'dbar', reference: 'sea' })
  });

  // IAPWS SR7-09 Table 2: [temperature exponent j, pressure exponent k, gW_jk].
  // Retain the P-dependent Gibbs coefficients, not rounded density fit values.
  const WATER = [
    [0, 1, 100015.695367145],
    [0, 2, -2544.57654203630],
    [0, 3, 284.517778446287],
    [0, 4, -33.3146754253611],
    [0, 5, 4.20263108803084],
    [0, 6, -0.546428511471039],
    [1, 1, -270.983805184062],
    [1, 2, 776.153611613101],
    [1, 3, -196.512550881220],
    [1, 4, 28.9796526294175],
    [1, 5, -2.13290083518327],
    [2, 1, 1455.03645404680],
    [2, 2, -756.558385769359],
    [2, 3, 273.479662323528],
    [2, 4, -55.5604063817218],
    [2, 5, 4.34420671917197],
    [3, 1, -672.507783145070],
    [3, 2, 499.360390819152],
    [3, 3, -239.545330654412],
    [3, 4, 48.8012518593872],
    [3, 5, -1.66307106208905],
    [4, 1, 397.968445406972],
    [4, 2, -301.815380621876],
    [4, 3, 152.196371733841],
    [4, 4, -26.3748377232802],
    [5, 1, -194.618310617595],
    [5, 2, 120.520654902025],
    [5, 3, -55.2723052340152],
    [5, 4, 6.48190668077221],
    [6, 1, 63.5113936641785],
    [6, 2, -22.2897317140459],
    [6, 3, 8.17060541818112],
    [7, 1, -9.63108119393062]
  ];

  // IAPWS R13-08 Table 2: [salinity exponent i, j, k, gS_ijk], k>=1 only.
  const SALINE = [
    [2, 0, 1, -3310.49154044839],
    [3, 0, 1, 199.459603073901],
    [4, 0, 1, -54.7919133532887],
    [5, 0, 1, 36.0284195611086],
    [2, 1, 1, 729.116529735046],
    [3, 1, 1, -175.292041186547],
    [4, 1, 1, -22.6683558512829],
    [2, 2, 1, -860.764303783977],
    [3, 2, 1, 383.058066002476],
    [2, 3, 1, 694.244814133268],
    [3, 3, 1, -460.319931801257],
    [2, 4, 1, -297.728741987187],
    [3, 4, 1, 234.565187611355],
    [2, 0, 2, 384.794152978599],
    [3, 0, 2, -52.2940909281335],
    [4, 0, 2, -4.08193978912261],
    [2, 1, 2, -343.956902961561],
    [3, 1, 2, 83.1923927801819],
    [2, 2, 2, 337.409530269367],
    [3, 2, 2, -54.1917262517112],
    [2, 3, 2, -204.889641964903],
    [2, 4, 2, 74.7261411387560],
    [2, 0, 3, -96.5324320107458],
    [3, 0, 3, 68.0444942726459],
    [4, 0, 3, -30.1755111971161],
    [2, 1, 3, 124.687671116248],
    [3, 1, 3, -29.4830643494290],
    [2, 2, 3, -178.314556207638],
    [3, 2, 3, 25.6398487389914],
    [2, 3, 3, 113.561697840594],
    [2, 4, 3, -36.4872919001588],
    [2, 0, 4, 15.8408172766824],
    [3, 0, 4, -3.41251932441282],
    [2, 1, 4, -31.6569643860730],
    [2, 2, 4, 44.2040358308000],
    [2, 3, 4, -11.1282734326413],
    [2, 0, 5, -2.62480156590992],
    [2, 1, 5, 7.04658803315449],
    [2, 2, 5, -7.92001547211682]
  ];

  function refuse(code, field, message) {
    const error = new RangeError(message);
    error.code = code;
    error.field = field;
    throw error;
  }

  function density(sp, tC, pDbar = 0) {
    if (!Number.isFinite(sp)) {
      refuse('E_SP_NOT_FINITE', 'sp', 'Practical Salinity must be a finite number.');
    }
    if (!Number.isFinite(tC)) {
      refuse('E_TEMPERATURE_NOT_FINITE', 'tC', 'In-situ temperature must be a finite number.');
    }
    if (!Number.isFinite(pDbar)) {
      refuse('E_PRESSURE_NOT_FINITE', 'pDbar', 'Sea pressure must be a finite number.');
    }
    if (sp < validRange.sp.min || sp > validRange.sp.max) {
      refuse('E_SP_RANGE', 'sp', 'Practical Salinity must be between 0 and 40 (PSS-78).');
    }
    if (tC < validRange.tC.min || tC > validRange.tC.max) {
      refuse('E_TEMPERATURE_RANGE', 'tC', 'In-situ temperature must be between 0 and 40 \u00b0C (ITS-90).');
    }
    if (pDbar < validRange.pDbar.min || pDbar > validRange.pDbar.max) {
      refuse('E_PRESSURE_RANGE', 'pDbar', 'Sea pressure must be between 0 and 9989.8675 dbar.');
    }

    const referenceSalinityGPerKg = SALINITY_FACTOR * sp;
    const assumedAbsoluteSalinityGPerKg = referenceSalinityGPerKg;
    const salinityRoot = Math.sqrt(assumedAbsoluteSalinityGPerKg / (40 * SALINITY_FACTOR));
    const temperatureRatio = tC / 40;
    const pressureRatio = pDbar / 10000;
    let waterSum = 0;
    let salineSum = 0;
    for (const [j, k, coefficient] of WATER) {
      waterSum += k * coefficient * temperatureRatio ** j * pressureRatio ** (k - 1);
    }
    for (const [i, j, k, coefficient] of SALINE) {
      salineSum += k * coefficient * salinityRoot ** i * temperatureRatio ** j * pressureRatio ** (k - 1);
    }
    const pureWaterSpecificVolumeM3PerKg = waterSum * 1e-8;
    const salineSpecificVolumeM3PerKg = salineSum * 1e-8;
    const specificVolumeM3PerKg = pureWaterSpecificVolumeM3PerKg + salineSpecificVolumeM3PerKg;
    const rho = 1 / specificVolumeM3PerKg;
    if (!(specificVolumeM3PerKg > 0) || !Number.isFinite(rho)) {
      refuse('E_DENSITY_RESULT', null, 'Seawater density could not be calculated within the supported range.');
    }
    return Object.freeze({
      rho,
      rhoTPerM3: rho / 1000,
      sp,
      tC,
      pDbar,
      referenceSalinityGPerKg,
      assumedAbsoluteSalinityGPerKg,
      assumedAbsoluteSalinityAnomalyGPerKg: 0,
      absolutePressurePa: 101325 + 10000 * pDbar,
      salinityRoot,
      temperatureRatio,
      pressureRatio,
      pureWaterSpecificVolumeM3PerKg,
      salineSpecificVolumeM3PerKg,
      specificVolumeM3PerKg,
      model: MODEL,
      valid: true
    });
  }

  root.MT_SEAWATER = Object.freeze({ density, validRange });
})(typeof window === 'undefined' ? globalThis : window);
