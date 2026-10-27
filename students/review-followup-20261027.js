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
  const additionalSymbols = {};
  for (let page = 199; page <= 206; page++)
    additionalSymbols["book-c14-p" + page + "-r04"] = [{
      symbol: "trim",
      meaning: "Signed longitudinal draft difference supplied to the approved hydrostatic KN lookup",
      unit: "m",
    }];
  additionalSymbols["book-c14-p214-r02"] = [
    {symbol: "V", meaning: "Signed section shear as a function of longitudinal position", unit: "N"},
    {symbol: "ξ", meaning: "Longitudinal integration coordinate from the same origin as x", unit: "m"},
  ];
  for (const [id, symbols] of Object.entries(additionalSymbols)) {
    const row = by.get(id);
    row.symbols.push(...symbols);
    row.analyticalReview = {...row.analyticalReview,
      decision: "CORRECTED_OR_QUALIFIED_THIS_PASS",
      finding: "2026-10-27 follow-up: added missing local hydrostatic-function or bending-integral quantities. Dimensional function/integration contract checked; no vessel hydrostatic data or full-domain numerical validation inferred.",
    };
    changed.push(id);
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

// Selected authored numerical evidence; do not overwrite stronger prior evidence.
(function () {
  const rows = window.MT_STUDY.sourceEquationRegister;
  const ids = new Set([
  "book-math-p9-r10",
  "book-math-p9-r11",
  "book-math-p10-r01",
  "book-math-p10-r02",
  "book-math-p10-r03",
  "book-math-p10-r04",
  "book-math-p10-r09",
  "book-math-p10-r10",
  "book-math-p10-r12",
  "book-math-p10-r13",
  "book-math-p10-r14",
  "book-math-p11-r09",
  "book-math-p11-r10",
  "book-math-p11-r11",
  "book-math-p11-r14",
  "book-math-p11-r15",
  "book-math-p12-r03",
  "book-math-p12-r04",
  "book-math-p12-r05",
  "book-math-p12-r06",
  "book-physics-p23-r01",
  "book-physics-p23-r04",
  "book-physics-p23-r05",
  "book-physics-p23-r06",
  "book-physics-p23-r07",
  "book-physics-p23-r08",
  "book-physics-p23-r09",
  "book-physics-p23-r10",
  "book-physics-p23-r11",
  "book-physics-p23-r12",
  "book-physics-p24-r09",
  "book-physics-p24-r10",
  "book-physics-p24-r11",
  "book-physics-p24-r12",
  "book-physics-p24-r13",
  "book-mechanics-p30-r01",
  "book-mechanics-p30-r02",
  "book-mechanics-p30-r08",
  "book-mechanics-p30-r09",
  "book-mechanics-p30-r10",
  "book-mechanics-p31-r03",
  "book-mechanics-p31-r05",
  "book-mechanics-p33-r04",
  "book-mechanics-p33-r06",
  "book-mechanics-p33-r07",
  "book-mechanics-p33-r09",
  "book-mechanics-p34-r01",
  "book-mechanics-p34-r02",
  "book-mechanics-p34-r04",
  "book-mechanics-p35-r03",
  "book-machine-p49-r05",
  "book-machine-p49-r08",
  "book-machine-p49-r09",
  "book-machine-p49-r10",
  "book-machine-p50-r01",
  "book-machine-p50-r02",
  "book-machine-p50-r03",
  "book-machine-p50-r05",
  "book-machine-p50-r08",
  "book-machine-p50-r09",
  "book-machine-p50-r10",
  "book-machine-p50-r12",
  "book-machine-p51-r05",
  "book-machine-p51-r06",
  "book-machine-p51-r07",
  "book-machine-p51-r08",
  "book-machine-p51-r10",
  "book-machine-p52-r01",
  "book-machine-p52-r03",
  "book-chemistry-p55-r01",
  "book-chemistry-p59-r01",
  "book-chemistry-p59-r02",
  "book-chemistry-p59-r04",
  "book-chemistry-p59-r06",
  "book-chemistry-p68-r01",
  "book-chemistry-p68-r02",
  "book-chemistry-p68-r03",
  "book-chemistry-p68-r04",
  "book-chemistry-p68-r06",
  "book-chemistry-p68-r07",
  "book-chemistry-p68-r08",
  "book-chemistry-p68-r09",
  "book-chemistry-p69-r01",
  "book-chemistry-p70-r01",
  "book-chemistry-p70-r02",
  "book-chemistry-p70-r03",
  "book-c6-p79-r01",
  "book-c6-p79-r02",
  "book-c6-p79-r03",
  "book-c6-p79-r04",
  "book-c6-p79-r05",
  "book-c6-p79-r06",
  "book-c6-p79-r07",
  "book-c6-p80-r03",
  "book-c6-p80-r05",
  "book-c6-p82-r07",
  "book-c6-p82-r08",
  "book-c6-p83-r01",
  "book-c6-p83-r02",
  "book-c6-p83-r07",
  "book-c6-p84-r02",
  "book-c6-p84-r04",
  "book-c6-p84-r05",
  "book-c6-p84-r06",
  "book-c6-p84-r08",
  "book-c6-p84-r10",
  "book-c7-p102-r01",
  "book-c7-p102-r02",
  "book-c7-p102-r03",
  "book-c7-p102-r04",
  "book-c7-p102-r05",
  "book-c7-p102-r06",
  "book-c7-p102-r07",
  "book-c7-p102-r08",
  "book-c7-p103-r01",
  "book-c7-p103-r03",
  "book-c7-p103-r04",
  "book-c7-p103-r06",
  "book-c7-p107-r03",
  "book-c7-p108-r01",
  "book-c7-p108-r02",
  "book-c7-p108-r03",
  "book-c7-p109-r01",
  "book-c7-p109-r02",
  "book-c7-p109-r03",
  "book-c7-p110-r01",
  "book-c8-p122-r01",
  "book-c8-p122-r02",
  "book-c8-p128-r02",
  "book-c8-p128-r03",
  "book-c8-p128-r04",
  "book-c8-p128-r05",
  "book-c8-p128-r06",
  "book-c8-p128-r07",
  "book-c8-p129-r02",
  "book-c8-p128-r08",
  "book-c8-p128-r09",
  "book-c8-p128-r10",
  "book-c8-p128-r11",
  "book-c8-p129-r03",
  "book-c9-p134-r05",
  "book-c9-p135-r02",
  "book-c9-p135-r03",
  "book-c9-p135-r04",
  "book-c9-p135-r05",
  "book-c9-p135-r06",
  "book-c9-p135-r07",
  "book-c9-p138-r01",
  "book-c9-p138-r03",
  "book-c9-p138-r04",
  "book-c9-p138-r07",
  "book-c9-p139-r02",
  "book-c9-p140-r02",
  "book-c9-p141-r02",
  "book-c9-p141-r03",
  "book-c9-p141-r04",
  "book-c9-p141-r05",
  "book-c9-p141-r06",
  "book-c9-p141-r07",
  "book-c9-p141-r08",
  "book-c10-p149-r01",
  "book-c10-p149-r02",
  "book-c10-p149-r03",
  "book-c10-p149-r04",
  "book-c10-p149-r05",
  "book-c10-p149-r06",
  "book-c10-p149-r07",
  "book-c10-p151-r01",
  "book-c10-p151-r04",
  "book-c10-p151-r05",
  "book-c10-p151-r06",
  "book-c10-p152-r01",
  "book-c10-p152-r02",
  "book-c10-p153-r02",
  "book-c10-p153-r03",
  "book-c10-p154-r01",
  "book-c10-p154-r02",
  "book-c10-p154-r03",
  "book-c11-p155-r01",
  "book-c11-p155-r02",
  "book-c11-p155-r03",
  "book-c11-p155-r04",
  "book-c11-p155-r05",
  "book-c11-p155-r06",
  "book-c11-p155-r07",
  "book-c11-p156-r03",
  "book-c11-p156-r04",
  "book-c11-p156-r05",
  "book-c11-p157-r13",
  "book-c11-p157-r14",
  "book-c11-p158-r01",
  "book-c11-p158-r02",
  "book-c11-p158-r03",
  "book-c11-p159-r01",
  "book-c11-p159-r05",
  "book-c11-p160-r04",
  "book-c11-p160-r05",
  "book-c12-p177-r01",
  "book-c12-p177-r02",
  "book-c12-p177-r03",
  "book-c12-p177-r04",
  "book-c12-p177-r05",
  "book-c12-p177-r06",
  "book-c12-p178-r01",
  "book-c12-p178-r02",
  "book-c12-p178-r03",
  "book-c12-p178-r04",
  "book-c12-p178-r05",
  "book-c12-p179-r01",
  "book-c12-p179-r02",
  "book-c12-p179-r07",
  "book-c12-p180-r01",
  "book-c12-p180-r02",
  "book-c12-p180-r04",
  "book-c12-p180-r05",
  "book-c13-p185-r01",
  "book-c13-p185-r02",
  "book-c13-p185-r03",
  "book-c13-p186-r01",
  "book-c13-p186-r02",
  "book-c13-p187-r01",
  "book-c13-p187-r02",
  "book-c13-p188-r01",
  "book-c13-p189-r01",
  "book-c13-p189-r02",
  "book-c13-p189-r03",
  "book-c13-p189-r04",
  "book-c13-p189-r05",
  "book-c13-p189-r06",
  "book-c13-p189-r07",
  "book-c13-p189-r08",
  "book-c13-p189-r09",
  "book-c14-p195-r01",
  "book-c14-p195-r02",
  "book-c14-p195-r03",
  "book-c14-p196-r01",
  "book-c14-p196-r02",
  "book-c14-p196-r03",
  "book-c14-p196-r04",
  "book-c14-p196-r05",
  "book-c14-p196-r06",
  "book-c14-p196-r07",
  "book-c14-p196-r08",
  "book-c14-p197-r01",
  "book-c14-p197-r02",
  "book-c14-p197-r03",
  "book-c14-p197-r04",
  "book-c14-p199-r03",
  "book-c14-p200-r01",
  "book-c14-p200-r02",
  "book-c14-p200-r03",
  "book-c14-p201-r01",
  "book-c15-p219-r01",
  "book-c15-p219-r02",
  "book-c15-p219-r03",
  "book-c15-p219-r04",
  "book-c15-p219-r05",
  "book-c15-p219-r06",
  "book-c15-p220-r01",
  "book-c15-p220-r02",
  "book-c15-p220-r03",
  "book-c15-p220-r04",
  "book-c15-p220-r05",
  "book-c15-p221-r01",
  "book-c15-p221-r02",
  "book-c15-p221-r03",
  "book-c16-p222-r01",
  "book-c16-p222-r02",
  "book-c16-p222-r03",
  "book-c16-p223-r01",
  "book-c16-p223-r02",
  "book-c16-p223-r03",
  "book-c16-p223-r04",
  "book-c16-p223-r05",
  "book-c16-p223-r06",
  "book-c16-p224-r01"
]);
  for (const row of rows) {
    if (!ids.has(row.id)) continue;
    if (row.numericStatus === "PENDING") row.numericStatus = "REFERENCE_CASE_COVERED";
    row.workedCaseTestReference = "tests/students-worked-cases-20261027.mjs";
  }
  const reread = {
  "48": {
    "filename": "Screenshot_20261019_212825_Chrome.jpg",
    "sha256": "94f206f1c212b721b7974d9be108cdb4cf2ae4a45b6a9799663e1b55473816b1",
    "printedPage": 48,
    "scope": "Visual source concordance for the six historical OPEN records; coefficient validity remains unresolved."
  },
  "50": {
    "filename": "Screenshot_20261019_212841_Chrome.jpg",
    "sha256": "a68b81d19a733c92f1974df6f31c15ddf54de497d719d6623d26cf9f57a27035",
    "printedPage": 50,
    "scope": "Visual source concordance for the six historical OPEN records; coefficient validity remains unresolved."
  },
  "51": {
    "filename": "Screenshot_20261019_212844_Chrome.jpg",
    "sha256": "4d3e1884b273c33e56bb20ff2d7a14876027043a504124977e4051ff515d7cdf",
    "printedPage": 51,
    "scope": "Visual source concordance for the six historical OPEN records; coefficient validity remains unresolved."
  },
  "52": {
    "filename": "Screenshot_20261019_212847_Chrome.jpg",
    "sha256": "c293d9d101ad7f8f1b2dae193051f53e4e7f21482d6d82bc9d54f02fc9233201",
    "printedPage": 52,
    "scope": "Visual source concordance for the six historical OPEN records; coefficient validity remains unresolved."
  },
  "212": {
    "filename": "Screenshot_20261019_214107_Chrome.jpg",
    "sha256": "9c5ffdf47ddb05a1c71603f5cb905cff9ef0f73328661f9ae5f7f6d4d7a0147a",
    "printedPage": 212,
    "scope": "Visual source concordance for the six historical OPEN records; coefficient validity remains unresolved."
  }
};
  for (const id of window.MT_STUDY.reviewFollowup.openReviewed) {
    const row = rows.find(r => r.id === id);
    row.sourceReread = reread[row.page];
  }
})();
