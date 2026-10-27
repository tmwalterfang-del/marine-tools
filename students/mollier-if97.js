/* Marine Tools IF97 state adapter for Mollier lab.
 Upstream solver: NeutriumJS.thermo.IAPWS97, CC BY 4.0. See IF97_ATTRIBUTION.md.
 NOTE: high-pressure Region 3 saturation not handled here; strict limits below 16.529 MPa.
 */
(function (root) {
  "use strict";
  const vendor = root.NeutriumJS?.thermo?.IAPWS97;
  if (
    !vendor?.PT?.solve ||
    !vendor.PT.r1 ||
    !vendor.PT.r2 ||
    !vendor.PT.r4_P_Tsat
  ) {
    root.MT_IF97 = {
      ready: false,
      reason: "Local IF97 solver failed to initialise.",
    };
    return;
  }
  const isFiniteN = Number.isFinite;
  function saturation(pBar) {
    if (!isFiniteN(pBar) || pBar < 0.01 || pBar > 160)
      throw RangeError("IF97 saturation mode supports 0.01–160 bar absolute.");
    const p = pBar / 10; // bar → MPa
    const T = vendor.PT.r4_P_Tsat(p); // Region 4 saturation boundary in kelvin
    if (!isFiniteN(T) || T < 273.15 || T >= 623.15)
      throw RangeError("IF97 saturation temperature outside Regions 1 and 2.");
    const f = vendor.PT.r1(p, T),
      g = vendor.PT.r2(p, T);
    const fields = [f.h, f.s, g.h, g.s];
    if (fields.some((z) => !isFiniteN(z)))
      throw RangeError("IF97 returned a non-finite property.");
    return {
      p: pBar,
      T: T - 273.15,
      hf: f.h,
      hg: g.h,
      sf: f.s,
      sg: g.s,
      interpolated: false,
      source: "IAPWS-IF97 Regions 1/2/4",
    };
  }
  function wet(pBar, x) {
    if (!isFiniteN(x) || x < 0 || x > 1)
      throw RangeError("Dryness fraction must be from 0 to 1.");
    const sat = saturation(pBar);
    return {
      ...sat,
      x,
      h: sat.hf + x * (sat.hg - sat.hf),
      s: sat.sf + x * (sat.sg - sat.sf),
      phase: "wet",
      source: sat.source,
    };
  }
  function superheated(pBar, tC) {
    if (!isFiniteN(pBar) || pBar < 0.01 || pBar > 160)
      throw RangeError("IF97 superheated mode supports 0.01–160 bar absolute.");
    if (!isFiniteN(tC) || tC > 600)
      throw RangeError("Superheated temperature must not exceed 600 °C.");
    const saturationTemperature = vendor.PT.r4_P_Tsat(pBar / 10) - 273.15;
    if (tC <= saturationTemperature + 1e-7)
      throw RangeError(
        "Temperature must exceed saturation by more than 0.0000001 °C.",
      );
    const result = vendor.PT.solve(pBar / 10, tC + 273.15);
    if (!isFiniteN(result.h) || !isFiniteN(result.s) || !isFiniteN(result.t))
      throw RangeError("Non-finite superheated property returned.");
    return {
      p: pBar,
      T: tC,
      h: result.h,
      s: result.s,
      x: null,
      phase: "superheated",
      T_sat: saturationTemperature,
      source: "IAPWS-IF97 Region 2",
    };
  }
  // Inversions are bracketed within the independently checked Region 2 range.
  // No Region 3 call, empirical interpolation, or uncontrolled extrapolation.
  function fromProperty(pBar, value, key) {
    if (!isFiniteN(value))
      throw RangeError("Enter a finite " + key + " value.");
    const sat = saturation(pBar),
      low = key === "h" ? sat.hf : sat.sf,
      high = key === "h" ? sat.hg : sat.sg;
    const tol = key === "h" ? 1e-7 : 1e-10;
    if (value < low - tol)
      throw RangeError("Target is in the unsupported subcooled-liquid region.");
    if (value <= high + tol)
      return wet(pBar, Math.max(0, Math.min(1, (value - low) / (high - low))));
    let a = sat.T + 1e-6,
      b = 600,
      max = superheated(pBar, b);
    if (value > max[key] + tol)
      throw RangeError("Target exceeds the 600 °C Region 2 limit.");
    if (value < superheated(pBar, a)[key])
      throw RangeError(
        "Target is too close to saturation for the stated numerical tolerance.",
      );
    for (let i = 0; i < 65; i++) {
      const mid = (a + b) / 2,
        z = superheated(pBar, mid);
      if (z[key] < value) a = mid;
      else b = mid;
    }
    return superheated(pBar, (a + b) / 2);
  }
  const statePS = (p, s) => fromProperty(p, s, "s"),
    statePH = (p, h) => fromProperty(p, h, "h");
  function expansion(inlet, pOut, mode = "isentropic", efficiency = 1) {
    if (
      !inlet ||
      !isFiniteN(inlet.h) ||
      !isFiniteN(inlet.s) ||
      !isFiniteN(inlet.p)
    )
      throw TypeError("A valid inlet state is required.");
    const verified = statePH(inlet.p, inlet.h);
    if (Math.abs(verified.s - inlet.s) > 1e-6)
      throw RangeError(
        "Inlet enthalpy and entropy are inconsistent with the supported IF97 state.",
      );
    if (!isFiniteN(pOut) || pOut >= inlet.p)
      throw RangeError("Outlet pressure must be lower than inlet pressure.");
    if (!["isentropic", "throttle", "turbine"].includes(mode))
      throw RangeError("Select a supported expansion model.");
    if (mode === "throttle") {
      const outlet = statePH(pOut, inlet.h);
      if (outlet.s < inlet.s - 1e-7)
        throw RangeError("The proposed throttle would reduce entropy.");
      return {
        outlet,
        ideal: null,
        work: 0,
        mode,
        path: Array.from({ length: 33 }, (_, i) =>
          statePH(inlet.p * Math.pow(pOut / inlet.p, i / 32), inlet.h),
        ),
      };
    }
    const ideal = statePS(pOut, inlet.s),
      drop = inlet.h - ideal.h;
    if (drop <= 0)
      throw RangeError(
        "No positive ideal turbine enthalpy drop in the selected domain.",
      );
    if (
      mode === "turbine" &&
      (!isFiniteN(efficiency) || efficiency <= 0 || efficiency > 1)
    )
      throw RangeError(
        "Isentropic efficiency must be greater than zero and at most one.",
      );
    const eta = mode === "isentropic" ? 1 : efficiency,
      outlet = eta === 1 ? ideal : statePH(pOut, inlet.h - eta * drop);
    if (outlet.s < inlet.s - 1e-7)
      throw RangeError("Outlet violates the adiabatic entropy condition.");
    return {
      outlet,
      ideal,
      work: eta * drop,
      efficiency: eta,
      mode,
      path:
        mode === "isentropic"
          ? Array.from({ length: 33 }, (_, i) =>
              statePS(inlet.p * Math.pow(pOut / inlet.p, i / 32), inlet.s),
            )
          : [],
    };
  }
  root.MT_IF97 = {
    ready: true,
    apiVersion: 2,
    saturation,
    wet,
    superheated,
    statePS,
    statePH,
    expansion,
    limits: { minPressure: 0.01, maxPressure: 160, maxTemperature: 600 },
    license: "CC BY 4.0",
    source: "NeutriumJS.thermo.IAPWS97 (deprecated)",
  };
})(window);
