/* Formula-local symbol corrections. No scanned pages or copyrighted tables. */
(function () {
  "use strict";
  const rows = window.MT_STUDY.sourceEquationRegister,
    by = new Map(rows.map((r) => [r.id, r]));
  const patches = {
    "book-c11-p171-r02": [
      {
        symbol: "v_local",
        meaning:
          "Local mean velocity used with each specified minor-loss coefficient",
        unit: "m/s",
      },
    ],
    "book-c8-p128-r13": [
      {
        symbol: "v",
        meaning:
          "Instantaneous periodic output voltage in the mean-absolute-value denominator",
        unit: "V",
      },
    ],
    "book-c11-p157-r02": [
      {
        symbol: "V_i",
        meaning:
          "Component gas volume at the same pressure and temperature as the total ideal-gas mixture",
        unit: "m³",
      },
    ],
    "book-c11-p169-r08": [
      {
        symbol: "H₁,H₂",
        meaning: "Pump heads at corresponding homologous operating points",
        unit: "m",
      },
    ],
    "book-c11-p169-r11": [
      {
        symbol: "H₁,H₂",
        meaning: "Pump heads at corresponding homologous operating points",
        unit: "m",
      },
    ],
    "book-c11-p170-r01": [
      {
        symbol: "T₁,T₂",
        meaning: "Positive absolute ideal-gas temperatures at states 1 and 2",
        unit: "K",
      },
    ],
  };
  const specific = {
    "book-c11-p168-r01": {
      Re: ["Reynolds number based on hydraulic diameter", "dimensionless"],
    },
    "book-c11-p169-r13": {
      n_q: [
        "Dimensional pump specific speed for n in revolutions/second, Q in m³/s and H in metres",
        "m^0.75/s^1.5",
      ],
    },
    "book-c11-p170-r08": { C_d: ["Discharge coefficient", "dimensionless"] },
    "book-c11-p171-r04": {
      C_d: ["Discharge coefficient", "dimensionless"],
      ε_exp: [
        "Gas expansibility correction for the specified differential-pressure flow model",
        "dimensionless",
      ],
    },
    "book-c11-p173-r03": {
      φ_v: [
        "Nozzle velocity coefficient; actual speed divided by the ideal speed from the stated inlet kinetic energy and enthalpy drop",
        "dimensionless",
      ],
    },
    "book-c9-p146-r05": {
      C_A: [
        "Admiralty coefficient in the exact units implied by W, m/s and tonnes; recalibrate if any input unit changes",
        "t^(2/3)·m³/(s³·W)",
      ],
    },
  };
  const changed = [];
  for (const r of rows) {
    if (!patches[r.id] && !specific[r.id]) continue;
    if (specific[r.id]) {
      const fields = specific[r.id],
        next = [];
      for (const s of r.symbols) {
        const names = s.symbol
          .split(",")
          .map((x) => x.trim())
          .filter((n) => !fields[n]);
        if (names.length) next.push({ ...s, symbol: names.join(",") });
      }
      for (const [symbol, [meaning, unit]] of Object.entries(fields))
        next.push({ symbol, meaning, unit });
      r.symbols = next;
    }
    if (patches[r.id]) r.symbols.push(...patches[r.id]);
    if (r.id === "book-c11-p169-r13")
      r.conditions +=
        " The displayed n_q is dimensional (m^0.75/s^1.5 with n in s⁻¹); rpm-based numerical specific speeds differ by a factor of 60. It is not the dimensionless similarity speed ω·sqrt(Q)/(g·H)^0.75.";
    const finding =
      "2026-10-27: corrected missing or ambiguous formula-local quantity definitions and units. Dimension analysis and independent reference cases: tests/students-followup-reference-20261027.mjs. Original scanned page not reread in this pass.";
    r.analyticalReview = {
      ...r.analyticalReview,
      decision: "CORRECTED_OR_QUALIFIED_THIS_PASS",
      finding,
    };
    changed.push(r.id);
  }
  const numericalRows = [
    "book-c11-p170-r01",
    "book-c11-p169-r08",
    "book-c11-p169-r11",
    "book-c11-p169-r13",
    "book-c11-p168-r01",
    "book-c11-p170-r08",
    "book-c11-p171-r04",
    "book-c11-p173-r03",
    "book-c9-p146-r05",
    "book-c6-p96-r01",
    "book-c6-p97-r01",
    "book-c9-p138-r06",
    "book-c11-p156-r02",
  ];
  for (const id of numericalRows) {
    const r = by.get(id);
    r.numericStatus = "REFERENCE_CASE_COVERED";
    r.followupTestReference = "tests/students-followup-reference-20261027.mjs";
  }
  // Explain why these historical models remain reference-only, without inventing coefficients.
  const openNotes = {
    "book-mechanics-p48-r02":
      "2026-10-27: membrane balance for a spherical head gives pD/(4σ), not this 3pD/(4σ) historical shape factor. Torispherical knuckle bending, joint efficiency, material allowables and code edition are not established by dimensional consistency. The historical factor remains unvalidated.",
    "book-machine-p50-r07":
      "2026-10-27: the European Commission JRC welded-joint teaching model uses throat normal/shear components, material strength, correlation and partial factors. A single unspecified base-stress multiplier does not establish the corresponding resistance. Keep this historical calibration open.",
    "book-machine-p50-r11":
      "2026-10-27: end deductions depend on whether the specified effective throat is achieved at the starts/stops and on the adopted joint assessment method. No authoritative applicability to the original historical joint was established. Do not silently treat physical and effective length as interchangeable.",
    "book-machine-p51-r09":
      "2026-10-27: NASA journal-bearing analysis makes pressure/film behavior depend on eccentricity, clearance and boundary/cavitation assumptions. Dimensional similarity cannot calibrate the original K₁ chart. The historical chart remains reference-only.",
    "book-machine-p52-r02":
      "2026-10-27: viscous shear/friction depends on film shape, load, viscosity and the chosen boundary conditions. The concentric Couette limit is not validation of the finite-load K₂ chart. The historical chart remains reference-only.",
    "book-c14-p212-r04":
      "2026-10-27: International Grain Code calculations use approved volumetric heeling moments and loading geometry; MSC.552(108), effective 2026, adds a particular compartment loading case. Neither source establishes this universal 1/5 virtual-GM factor. Do not substitute a liquid free-surface correction.",
  };
  for (const [id, note] of Object.entries(openNotes)) {
    const r = by.get(id);
    r.analyticalReview = {
      ...r.analyticalReview,
      finding: r.analyticalReview.finding + " " + note,
    };
  }
  window.MT_STUDY.reviewFollowup = {
    date: "2026-10-27",
    changedSymbolRows: changed,
    openReviewed: Object.keys(openNotes),
    scope:
      "All registered relationships rechecked; historical model calibration is separate from algebra/dimensions.",
  };
  window.MT_STUDY.expressionReview = {
    ...window.MT_STUDY.expressionReview,
    date: "2026-10-27",
  };
})();
