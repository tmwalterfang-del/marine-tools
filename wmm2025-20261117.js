/*
 * NOAA/NCEI World Magnetic Model 2025 (WMM2025), epoch 2025.0.
 * Validity: 2025.0–2030.0. Degree/order 12; coefficients in nT and nT/year.
 * Official WMM.COF, downloaded 2026-11-17 from:
 * https://www.ncei.noaa.gov/sites/default/files/2024-12/WMM2025COF.zip
 * WMM.COF SHA-256: dfa8597825af4e0b87ff4198a5b4fb661b3c49f4cd090cd0164e0259b075582f
 * NOAA US Government material: public domain, not subject to copyright.
 * Model credit: NOAA NCEI Geomagnetic Modeling Team / British Geological Survey.
 * Equations: WMM2025 Technical Report, section 1.2, equations 1–19:
 * https://doi.org/10.25923/prbc-s316
 * WGS84 geodetic latitude/ellipsoid height -> geocentric spherical harmonics,
 * Schmidt semi-normalized Legendre functions, then rotation to geodetic N/E/down.
 * annualChange is instantaneous dD/dt in DEGREES/year, east-positive;
 * annualChangeMinutes is the same derivative in arcminutes/year (not D(t+1)-D(t)).
 * Altitude is km above the WGS84 ellipsoid, supported here from -1 to 850 km.
 * Model estimates omit local magnetic anomalies and vessel compass deviation.
 */
(function (root) {
  'use strict';
  // n, m, g, h, dg/dt, dh/dt — official literals, without rescaling/rounding.
  const COEFFICIENTS = [
    [1, 0, -29351.8, 0, 12, 0],
    [1, 1, -1410.8, 4545.4, 9.7, -21.5],
    [2, 0, -2556.6, 0, -11.6, 0],
    [2, 1, 2951.1, -3133.6, -5.2, -27.7],
    [2, 2, 1649.3, -815.1, -8, -12.1],
    [3, 0, 1361, 0, -1.3, 0],
    [3, 1, -2404.1, -56.6, -4.2, 4],
    [3, 2, 1243.8, 237.5, 0.4, -0.3],
    [3, 3, 453.6, -549.5, -15.6, -4.1],
    [4, 0, 895, 0, -1.6, 0],
    [4, 1, 799.5, 278.6, -2.4, -1.1],
    [4, 2, 55.7, -133.9, -6, 4.1],
    [4, 3, -281.1, 212, 5.6, 1.6],
    [4, 4, 12.1, -375.6, -7, -4.4],
    [5, 0, -233.2, 0, 0.6, 0],
    [5, 1, 368.9, 45.4, 1.4, -0.5],
    [5, 2, 187.2, 220.2, 0, 2.2],
    [5, 3, -138.7, -122.9, 0.6, 0.4],
    [5, 4, -142, 43, 2.2, 1.7],
    [5, 5, 20.9, 106.1, 0.9, 1.9],
    [6, 0, 64.4, 0, -0.2, 0],
    [6, 1, 63.8, -18.4, -0.4, 0.3],
    [6, 2, 76.9, 16.8, 0.9, -1.6],
    [6, 3, -115.7, 48.8, 1.2, -0.4],
    [6, 4, -40.9, -59.8, -0.9, 0.9],
    [6, 5, 14.9, 10.9, 0.3, 0.7],
    [6, 6, -60.7, 72.7, 0.9, 0.9],
    [7, 0, 79.5, 0, 0, 0],
    [7, 1, -77, -48.9, -0.1, 0.6],
    [7, 2, -8.8, -14.4, -0.1, 0.5],
    [7, 3, 59.3, -1, 0.5, -0.8],
    [7, 4, 15.8, 23.4, -0.1, 0],
    [7, 5, 2.5, -7.4, -0.8, -1],
    [7, 6, -11.1, -25.1, -0.8, 0.6],
    [7, 7, 14.2, -2.3, 0.8, -0.2],
    [8, 0, 23.2, 0, -0.1, 0],
    [8, 1, 10.8, 7.1, 0.2, -0.2],
    [8, 2, -17.5, -12.6, 0, 0.5],
    [8, 3, 2, 11.4, 0.5, -0.4],
    [8, 4, -21.7, -9.7, -0.1, 0.4],
    [8, 5, 16.9, 12.7, 0.3, -0.5],
    [8, 6, 15, 0.7, 0.2, -0.6],
    [8, 7, -16.8, -5.2, 0, 0.3],
    [8, 8, 0.9, 3.9, 0.2, 0.2],
    [9, 0, 4.6, 0, 0, 0],
    [9, 1, 7.8, -24.8, -0.1, -0.3],
    [9, 2, 3, 12.2, 0.1, 0.3],
    [9, 3, -0.2, 8.3, 0.3, -0.3],
    [9, 4, -2.5, -3.3, -0.3, 0.3],
    [9, 5, -13.1, -5.2, 0, 0.2],
    [9, 6, 2.4, 7.2, 0.3, -0.1],
    [9, 7, 8.6, -0.6, -0.1, -0.2],
    [9, 8, -8.7, 0.8, 0.1, 0.4],
    [9, 9, -12.9, 10, -0.1, 0.1],
    [10, 0, -1.3, 0, 0.1, 0],
    [10, 1, -6.4, 3.3, 0, 0],
    [10, 2, 0.2, 0, 0.1, 0],
    [10, 3, 2, 2.4, 0.1, -0.2],
    [10, 4, -1, 5.3, 0, 0.1],
    [10, 5, -0.6, -9.1, -0.3, -0.1],
    [10, 6, -0.9, 0.4, 0, 0.1],
    [10, 7, 1.5, -4.2, -0.1, 0],
    [10, 8, 0.9, -3.8, -0.1, -0.1],
    [10, 9, -2.7, 0.9, 0, 0.2],
    [10, 10, -3.9, -9.1, 0, 0],
    [11, 0, 2.9, 0, 0, 0],
    [11, 1, -1.5, 0, 0, 0],
    [11, 2, -2.5, 2.9, 0, 0.1],
    [11, 3, 2.4, -0.6, 0, 0],
    [11, 4, -0.6, 0.2, 0, 0.1],
    [11, 5, -0.1, 0.5, -0.1, 0],
    [11, 6, -0.6, -0.3, 0, 0],
    [11, 7, -0.1, -1.2, 0, 0.1],
    [11, 8, 1.1, -1.7, -0.1, 0],
    [11, 9, -1, -2.9, -0.1, 0],
    [11, 10, -0.2, -1.8, -0.1, 0],
    [11, 11, 2.6, -2.3, -0.1, 0],
    [12, 0, -2, 0, 0, 0],
    [12, 1, -0.2, -1.3, 0, 0],
    [12, 2, 0.3, 0.7, 0, 0],
    [12, 3, 1.2, 1, 0, -0.1],
    [12, 4, -1.3, -1.4, 0, 0.1],
    [12, 5, 0.6, 0, 0, 0],
    [12, 6, 0.6, 0.6, 0.1, 0],
    [12, 7, 0.5, -0.1, 0, 0],
    [12, 8, -0.1, 0.8, 0, 0],
    [12, 9, -0.4, 0.1, 0, 0],
    [12, 10, -0.2, -1, -0.1, 0],
    [12, 11, -1.3, 0.1, 0, 0],
    [12, 12, -0.7, 0.2, -0.1, -0.1]
  ];
  const DEG = Math.PI / 180, EPOCH = 2025.0, END = 2030.0, ORDER = 12;
  const matrix = () => Array.from({ length: ORDER + 1 }, () => Array(ORDER + 1).fill(0));
  const schmidt = matrix(), recurrence = matrix();
  schmidt[0][0] = 1;
  for (let n = 1; n <= ORDER; n++) {
    schmidt[n][0] = schmidt[n - 1][0] * (2 * n - 1) / n;
    for (let m = 0; m <= n; m++) {
      recurrence[n][m] = n === 1 ? 0 : ((n - 1) ** 2 - m * m) / ((2 * n - 1) * (2 * n - 3));
      if (m) schmidt[n][m] = schmidt[n][m - 1] * Math.sqrt((n - m + 1) * (m === 1 ? 2 : 1) / (n + m));
    }
  }

  function declination(latDeg, lonDeg, altitudeKm, decimalYear) {
    if (![latDeg, lonDeg, altitudeKm, decimalYear].every(Number.isFinite)) throw new RangeError('WMM_INPUT');
    if (latDeg < -90 || latDeg > 90 || lonDeg < -180 || lonDeg > 180) throw new RangeError('WMM_POSITION');
    if (altitudeKm < -1 || altitudeKm > 850) throw new RangeError('WMM_ALTITUDE');
    if (decimalYear < EPOCH || decimalYear > END) throw new RangeError('WMM_DATE');

    // WGS84 a=6378.137 km, 1/f=298.257223563; report equations 5–6.
    const phi = latDeg * DEG, lambda = lonDeg * DEG, sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
    const flattening = 1 / 298.257223563, e2 = flattening * (2 - flattening);
    const curvature = 6378.137 / Math.sqrt(1 - e2 * sinPhi * sinPhi);
    const rho = (curvature + altitudeKm) * cosPhi, z = (curvature * (1 - e2) + altitudeKm) * sinPhi;
    const radius = Math.hypot(rho, z), ct = z / radius, st = rho / radius;
    const rotation = phi - Math.atan2(z, rho), ca = Math.cos(rotation), sa = Math.sin(rotation);
    const p = matrix(), dp = matrix(), polar = Array(ORDER + 1).fill(0);
    p[0][0] = 1;
    for (let n = 1; n <= ORDER; n++) {
      for (let m = 0; m <= n; m++) {
        if (n === m) {
          p[n][m] = st * p[n - 1][m - 1];
          dp[n][m] = st * dp[n - 1][m - 1] + ct * p[n - 1][m - 1];
        } else {
          const k = recurrence[n][m], previous = n > 1 ? p[n - 2][m] : 0, derivative = n > 1 ? dp[n - 2][m] : 0;
          p[n][m] = ct * p[n - 1][m] - k * previous;
          dp[n][m] = ct * dp[n - 1][m] - st * p[n - 1][m] - k * derivative;
        }
      }
      // Analytic limit P(n,1)/sin(theta) at either geographic pole.
      polar[n] = n === 1 ? 1 : ct * polar[n - 1] - recurrence[n][1] * polar[n - 2];
    }

    let br = 0, bt = 0, bp = 0, dbr = 0, dbt = 0, dbp = 0;
    for (const [n, m, g0, h0, dg, dh] of COEFFICIENTS) {
      const g = g0 + (decimalYear - EPOCH) * dg, h = h0 + (decimalYear - EPOCH) * dh;
      const cos = Math.cos(m * lambda), sin = Math.sin(m * lambda), scale = (6371.2 / radius) ** (n + 2) * schmidt[n][m];
      const field = g * cos + h * sin, secular = dg * cos + dh * sin;
      br += (n + 1) * scale * field * p[n][m];
      bt -= scale * field * dp[n][m];
      dbr += (n + 1) * scale * secular * p[n][m];
      dbt -= scale * secular * dp[n][m];
      if (m) {
        const quotient = Math.abs(st) > 1e-10 ? p[n][m] / st : m === 1 ? polar[n] : 0;
        bp += m * scale * (g * sin - h * cos) * quotient;
        dbp += m * scale * (dg * sin - dh * cos) * quotient;
      }
    }
    const north = -bt * ca - br * sa, east = bp, down = bt * sa - br * ca;
    const northChange = -dbt * ca - dbr * sa, eastChange = dbp, downChange = dbt * sa - dbr * ca;
    const horizontalIntensity = Math.hypot(north, east), totalIntensity = Math.hypot(horizontalIntensity, down);
    const annualChange = horizontalIntensity === 0 ? NaN : (north * eastChange - east * northChange) / (horizontalIntensity ** 2) / DEG;
    return {
      declination: horizontalIntensity === 0 ? NaN : Math.atan2(east, north) / DEG,
      annualChange, annualChangeMinutes: annualChange * 60,
      horizontalIntensity, totalIntensity, inclination: Math.atan2(down, horizontalIntensity) / DEG,
      north, east, down, northChange, eastChange, downChange,
      blackout: horizontalIntensity < 2000, caution: horizontalIntensity >= 2000 && horizontalIntensity < 6000,
      usable: horizontalIntensity >= 6000, model: 'WMM2025', decimalYear, altitudeKm
    };
  }
  root.MT_WMM2025 = Object.freeze({ declination, validFrom: EPOCH, validTo: END });
})(window);
