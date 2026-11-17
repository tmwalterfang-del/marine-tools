/* Pure NOx arithmetic and Norwegian charge assessment. No implicit fuel factors. */
(function (root) {
  "use strict";
  const VERIFIED = "2026-11-03",
    SOURCES = Object.freeze({
      tax2026:
        "https://www.skatteetaten.no/globalassets/rettskilder/avgiftsrundskriv/avgift-pa-nox-2026.pdf",
      taxRates: "https://www.skatteetaten.no/satser/saravgift---nox/",
      fundRates: "https://www.noxfondet.no/artikler/innbetalingssatser/",
      factors:
        "https://www.sdir.no/naringsfartoy/sertifikater-tillatelser-og-dokumenter-for-fartoy/informasjon-om-nox-avgift-og-utslippsfaktorbekreftelse/",
    });
  const rows = [
    [2017, 21.59, 4, 11],
    [2018, 21.94, 6, 12],
    [2019, 22.27, 8.5, 14.5],
    [2020, 22.69, 10.5, 16.5],
    [2021, 23.48, 10.5, 16.5],
    [2022, 23.79, 10.5, 16.5],
    [2023, 24.46, 11, 17],
    [2024, 25.59, 11.5, 17.5],
    [2025, 26.36, 12, 18],
    [2026, 26.94, 15, 21],
  ];
  const RATES = Object.freeze(
    rows.map(([year, government, fundOrdinary, fundExtraction]) =>
      Object.freeze({
        from: year + "-01-01",
        until: year + 1 + "-01-01",
        government,
        fundOrdinary,
        fundExtraction,
        currency: "NOK",
        basis: "kg NOx",
        verifiedOn: VERIFIED,
        sources: [
          SOURCES.fundRates,
          ...(year === 2026 ? [SOURCES.taxRates] : []),
        ],
      }),
    ),
  );
  const fuels = [
    "mgo",
    "mdo",
    "hfo",
    "vlsfo",
    "ulsfo",
    "en590",
    "hvo100",
    "lng",
    "methanol",
    "ammonia",
    "custom",
  ];
  function numeric(v, label, { min = 0, max = 1e12 } = {}) {
    if (v === null || v === undefined || String(v).trim() === "")
      throw Error(label + " is required.");
    const s = String(v).trim().replace(/−/g, "-").replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))
      throw Error(label + " must be a finite number.");
    const n = Number(s);
    if (!Number.isFinite(n) || n < min || n > max)
      throw Error(label + " is outside the supported range.");
    return n;
  }
  function date(v) {
    if (
      typeof v !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
      !Number.isFinite(Date.parse(v + "T00:00:00Z")) ||
      new Date(v + "T00:00:00Z").toISOString().slice(0, 10) !== v
    )
      throw Error("Use a valid ISO calendar date.");
    return v;
  }
  function ratesAt(value) {
    const d = date(value);
    return RATES.find((r) => r.from <= d && d < r.until) || null;
  }
  function reference(v) {
    if (
      typeof v !== "string" ||
      !v.trim() ||
      v.length > 600 ||
      /[\u0000-\u001f]/.test(v)
    )
      throw Error("Identify the measurement or factor source.");
    return v.trim();
  }
  function emissions(input) {
    if (!input || !fuels.includes(input.fuel))
      throw Error("Choose a supported fuel or a user-defined product.");
    const method = input.method,
      source = reference(input.source);
    let before,
      energyKwh = null,
      fuelKg = null,
      relation,
      quality = input.quality;
    if (!["measured", "documented", "estimated"].includes(quality))
      throw Error("Choose measured, documented or estimated evidence.");
    if (method === "measured") {
      before = numeric(input.measuredKg, "Measured NOx");
      if (quality !== "measured")
        throw Error("Measured NOx must identify measured evidence.");
      relation = "NOx = entered measured mass";
    } else if (method === "energy") {
      const power = numeric(input.powerKw, "Operating power"),
        hours = numeric(input.hours, "Operating hours"),
        factor = numeric(input.factor, "NOx factor");
      energyKwh = power * hours;
      before = (energyKwh * factor) / 1000;
      relation = "NOx [kg] = power [kW] × hours [h] × factor [g/kWh] / 1000";
      if (quality === "measured")
        throw Error(
          "An energy-factor calculation is not a direct mass measurement.",
        );
    } else if (method === "fuel") {
      const amount = numeric(input.fuelAmount, "Fuel amount"),
        factor = numeric(input.factor, "NOx factor");
      if (input.fuelUnit === "kg") fuelKg = amount;
      else if (input.fuelUnit === "t") fuelKg = amount * 1000;
      else if (input.fuelUnit === "m3")
        fuelKg =
          amount *
          numeric(input.densityKgM3, "Fuel density", {
            min: Number.MIN_VALUE,
            max: 3000,
          });
      else if (input.fuelUnit === "L")
        fuelKg =
          (amount / 1000) *
          numeric(input.densityKgM3, "Fuel density", {
            min: Number.MIN_VALUE,
            max: 3000,
          });
      else throw Error("Choose kg, t, m3 or L for fuel amount.");
      before = (fuelKg / 1000) * factor;
      relation = "NOx [kg] = fuel mass [t] × factor [kg/t]";
      if (quality === "measured")
        throw Error(
          "A fuel-factor calculation is not a direct mass measurement.",
        );
    } else
      throw Error(
        "Choose measured mass, fuel-based or energy-based calculation.",
      );
    let reduction = 0,
      after = before;
    if (input.scr?.enabled) {
      if (method === "measured" || input.factorPosition === "outlet")
        throw Error("Do not apply SCR twice to measured or outlet emissions.");
      if (input.factorPosition !== "inlet")
        throw Error(
          "Confirm that the factor describes untreated inlet emissions.",
        );
      const efficiency =
          numeric(input.scr.efficiencyPercent, "SCR removal efficiency", {
            max: 100,
          }) / 100,
        active = numeric(
          input.scr.activeFraction,
          "Treated operating fraction",
          { max: 1 },
        );
      reference(input.scr.source);
      reduction = before * efficiency * active;
      after = before - reduction;
      quality = "estimated";
    }
    if (!Number.isFinite(after) || after > 1e15)
      throw Error(
        "The requested emissions total is outside the supported range.",
      );
    return {
      kgNOx: after,
      untreatedKg: before,
      reductionKg: reduction,
      energyKwh,
      fuelKg,
      method,
      quality,
      source,
      relation,
      fuel: input.fuel,
      scr: input.scr?.enabled ? { ...input.scr } : null,
      factor:
        method === "measured" ? null : numeric(input.factor, "NOx factor"),
      factorUnit:
        method === "energy" ? "g/kWh" : method === "fuel" ? "kg/t" : null,
      factorPosition:
        method === "measured"
          ? "measured-outlet"
          : input.factorPosition || "unconfirmed",
      inputs:
        method === "energy"
          ? {
              powerKw: numeric(input.powerKw, "Operating power"),
              hours: numeric(input.hours, "Operating hours"),
            }
          : method === "fuel"
            ? {
                amount: numeric(input.fuelAmount, "Fuel amount"),
                unit: input.fuelUnit,
                densityKgM3: ["m3", "L"].includes(input.fuelUnit)
                  ? numeric(input.densityKgM3, "Fuel density")
                  : null,
              }
            : { measuredKg: before },
      verifiedOn: VERIFIED,
      assumptions: input.scr?.enabled
        ? ["Removal and active fraction are user-entered planning assumptions."]
        : [],
    };
  }
  function assessment(input) {
    const d = date(input.date),
      basis = [SOURCES.tax2026],
      result = (status, reason) => ({
        status,
        reason,
        basis,
        verifiedOn: VERIFIED,
      });
    // These are voyage/operational facts, independent of any ECA intersection.
    if (
      ![
        "domestic-norway",
        "direct-international",
        "foreign-ports",
        "special-destinations",
        "other",
      ].includes(input.operation)
    )
      return result("unconfirmed", "voyage-type-missing");
    if (input.historicalAssessment) {
      reference(input.historicalAssessment.source);
      if (
        !["liable", "outside", "exempt"].includes(
          input.historicalAssessment.status,
        )
      )
        throw Error("Invalid historical assessment.");
      return {
        ...result(
          input.historicalAssessment.status,
          "user-documented-applicability",
        ),
        basis: [input.historicalAssessment.source],
        userConfirmed: true,
      };
    }
    if (d < "2026-01-01" || d >= "2027-01-01")
      return result("unconfirmed", "scope-not-verified-for-this-year");
    if (
      input.operation === "foreign-ports" ||
      input.operation === "special-destinations"
    )
      return result("outside", "voyage-outside-scope");
    if (input.operation === "direct-international") {
      if (input.directConditionsConfirmed !== true)
        return result("unconfirmed", "direct-voyage-conditions-unconfirmed");
      return result("exempt", "direct-international-voyage");
    }
    if (input.distantFishingConfirmed === true)
      return result("exempt", "documented-distant-water-fishing");
    let inScope = input.operation === "domestic-norway";
    if (!inScope) {
      if (input.inNorwegianMainlandWaters === true) inScope = true;
      else if (input.flag === "NO" && input.inNorwegianNearWaters === true)
        inScope = true;
      else if (
        input.inNorwegianMainlandWaters === false &&
        input.inNorwegianNearWaters === false
      )
        return result("outside", "outside-norwegian-jurisdiction");
      else return result("unconfirmed", "jurisdiction-unconfirmed");
    }
    if (!Array.isArray(input.engines) || !input.engines.length)
      return result("unconfirmed", "machinery-configuration-missing");
    let propulsion = 0,
      thermal = 0;
    for (const e of input.engines) {
      if (e.kind === "electric") continue;
      if (
        ![
          "propulsion",
          "auxiliary",
          "diesel-electric",
          "boiler",
          "turbine",
          "manoeuvring",
        ].includes(e.kind)
      )
        return result("unconfirmed", "machinery-role-missing");
      const power = numeric(e.ratedKw, "Certified rated power");
      if (["propulsion", "diesel-electric"].includes(e.kind))
        propulsion += power;
      if (e.thermalInputKw !== undefined && e.thermalInputKw !== "")
        thermal += numeric(e.thermalInputKw, "Rated thermal input");
    }
    if (propulsion > 750 || thermal > 10000)
      return {
        ...result("liable", "installed-capacity-threshold-exceeded"),
        propulsionKw: propulsion,
        thermalInputKw: thermal,
        allSourcesIncluded: true,
      };
    if (input.thermalConfigurationComplete !== true && propulsion <= 750)
      return result("unconfirmed", "thermal-configuration-unconfirmed");
    return {
      ...result("outside", "installed-capacity-threshold-not-exceeded"),
      propulsionKw: propulsion,
      thermalInputKw: thermal,
    };
  }
  function charges(kg, input) {
    kg = numeric(kg, "NOx mass");
    const a = assessment(input),
      rate = ratesAt(input.date);
    if (["outside", "exempt"].includes(a.status))
      return {
        governmentNok: 0,
        fundNok: 0,
        totalNok: 0,
        assessment: a,
        rate: null,
        scheme: "outside-or-exempt",
      };
    if (a.status !== "liable" || !rate)
      return {
        governmentNok: null,
        fundNok: null,
        totalNok: null,
        assessment: a,
        rate,
        scheme: "unconfirmed",
      };
    if (input.fund?.participates === true) {
      const f = input.fund;
      if (
        !f.joined ||
        date(f.joined) > input.date ||
        (f.until && input.date >= date(f.until)) ||
        !f.source
      )
        return {
          governmentNok: null,
          fundNok: null,
          totalNok: null,
          assessment: {
            ...a,
            status: "unconfirmed",
            reason: "fund-membership-period-unconfirmed",
          },
          rate,
          scheme: "unconfirmed",
        };
      reference(f.source);
      if (!["ordinary", "oil-gas-extraction"].includes(f.category))
        throw Error("Choose the NOx Fund contribution category.");
      const perKg =
        f.category === "oil-gas-extraction"
          ? rate.fundExtraction
          : rate.fundOrdinary;
      return {
        governmentNok: 0,
        fundNok: kg * perKg,
        totalNok: kg * perKg,
        assessment: a,
        rate,
        scheme: "nox-fund",
        rateNokKg: perKg,
        membershipSource: f.source,
      };
    }
    if (input.fund?.participates !== false)
      return {
        governmentNok: null,
        fundNok: null,
        totalNok: null,
        assessment: {
          ...a,
          status: "unconfirmed",
          reason: "fund-participation-unconfirmed",
        },
        rate,
        scheme: "unconfirmed",
      };
    return {
      governmentNok: kg * rate.government,
      fundNok: 0,
      totalNok: kg * rate.government,
      assessment: a,
      rate,
      scheme: "government",
      rateNokKg: rate.government,
    };
  }
  function calculate(rows, context) {
    if (!Array.isArray(rows) || !rows.length || rows.length > 200)
      throw Error("Use between 1 and 200 operating rows.");
    const items = rows.map((row, i) => {
      const result = emissions(row),
        charge = charges(result.kgNOx, { ...context, date: date(row.date) });
      return {
        index: i + 1,
        engineId: row.engineId || "",
        mode: row.mode || "",
        date: row.date,
        emissions: result,
        charges: charge,
      };
    });
    const kgNOx = items.reduce((s, r) => s + r.emissions.kgNOx, 0),
      allCosted = items.every((r) => r.charges.totalNok !== null);
    return {
      version: 1,
      items,
      kgNOx,
      governmentNok: allCosted
        ? items.reduce((s, r) => s + r.charges.governmentNok, 0)
        : null,
      fundNok: allCosted
        ? items.reduce((s, r) => s + r.charges.fundNok, 0)
        : null,
      totalNok: allCosted
        ? items.reduce((s, r) => s + r.charges.totalNok, 0)
        : null,
      quality: items.every((r) => r.emissions.quality === "measured")
        ? "measured"
        : items.some((r) => r.emissions.quality === "estimated")
          ? "estimated"
          : "documented-factor",
      verifiedOn: VERIFIED,
      sourceVersion: "norway-nox-2026-v1",
      sources: SOURCES,
    };
  }
  root.MT_NOX = {
    numeric,
    date,
    ratesAt,
    emissions,
    assessment,
    charges,
    calculate,
    RATES,
    SOURCES,
    fuels,
    VERIFIED,
  };
})(typeof window === "undefined" ? globalThis : window);
