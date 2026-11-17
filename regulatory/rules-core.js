/* Date-aware rules. Area rules and vessel evidence remain separate. */
(function (root) {
  "use strict";
  function day(value) {
    const s = String(value).slice(0, 10);
    return root.MT_NOX.date(s);
  }
  function rate(rows, date) {
    return rows.filter((r) => r.from <= date).at(-1)?.percent ?? null;
  }
  function constructed(criteria, vessel) {
    if (!criteria)
      return { status: "not-applicable", reason: "no-nox-designation" };
    const valid = (v) => {
      try {
        return root.MT_NOX.date(v);
      } catch {
        return null;
      }
    };
    if (criteria.keel) {
      const d = valid(vessel.keelDate);
      return d
        ? {
            status:
              d >= criteria.keel ? "applies" : "outside-construction-cutoff",
            reason: "keel-date",
          }
        : { status: "unconfirmed", reason: "keel-date-missing" };
    }
    const contract = valid(vessel.contractDate),
      keel = valid(vessel.keelDate),
      delivery = valid(vessel.deliveryDate);
    if (
      (delivery && delivery >= criteria.delivery) ||
      (contract && contract >= criteria.contract) ||
      (vessel.noBuildingContract === true &&
        keel &&
        keel >= criteria.noContractKeel)
    )
      return { status: "applies", reason: "construction-criteria-met" };
    if (
      !delivery ||
      (!contract && vessel.noBuildingContract !== true) ||
      (vessel.noBuildingContract === true && !keel)
    )
      return {
        status: "unconfirmed",
        reason: "construction-records-incomplete",
      };
    return {
      status: "outside-construction-cutoff",
      reason: "construction-before-cutoffs",
    };
  }
  function engines(area, vessel, at) {
    if (!area.noxFrom || at < area.noxFrom)
      return { status: "not-active", engines: [] };
    const construction = constructed(area.construction, vessel);
    if (!Array.isArray(vessel.engines) || !vessel.engines.length)
      return {
        status: "unconfirmed",
        construction,
        engines: [],
        reason: "engine-records-missing",
      };
    const records = vessel.engines.map((e) => {
      const base = {
        id: e.id || "",
        name: e.name || "",
        tier: e.tier || null,
        eiappSource: e.eiappSource || null,
      };
      if (e.kind === "electric" || e.emergencyOnly === true)
        return {
          ...base,
          status: "excluded",
          reason: e.kind === "electric" ? "electric-drive" : "emergency-only",
        };
      if (
        e.dieselEngine !== true ||
        !Number.isFinite(Number(e.ratedKw)) ||
        e.ratedKw === "" ||
        e.ratedKw == null
      )
        return {
          ...base,
          status: "unconfirmed",
          reason: "diesel-engine-scope-unconfirmed",
        };
      if (Number(e.ratedKw) <= 130)
        return { ...base, status: "excluded", reason: "at-most-130-kw" };
      if (e.majorConversion === true || e.replacement === true)
        return {
          ...base,
          status: "unconfirmed",
          reason: "replacement-or-conversion-review",
        };
      if (
        construction.status === "outside-construction-cutoff" &&
        e.conversionHistoryReviewed !== true
      )
        return {
          ...base,
          status: "unconfirmed",
          reason: "engine-installation-history-missing",
        };
      if (construction.status !== "applies")
        return {
          ...base,
          status: construction.status,
          reason: construction.reason,
        };
      if (vessel.exemptionClaim)
        return {
          ...base,
          status: "unconfirmed",
          reason: "exemption-requires-administration-review",
        };
      return {
        ...base,
        status: "tier-iii-required",
        reason: "area-and-construction-scope",
        evidence:
          e.tier === "III" && Boolean(e.eiappSource)
            ? "tier-iii-record-provided"
            : "tier-iii-evidence-missing",
      };
    });
    return {
      status: records.some((e) => e.status === "unconfirmed")
        ? "unconfirmed"
        : records.some((e) => e.status === "tier-iii-required")
          ? "tier-iii-required"
          : "outside-engine-or-construction-scope",
      construction,
      engines: records,
    };
  }
  function evaluate(area, value, vessel = {}, catalogue) {
    if (area.category !== "emissions")
      return otherRules(area, value, vessel, catalogue);
    const at = day(value);
    if (area.adoptionStatus === "proposed")
      return {
        areaId: area.id,
        date: at,
        status: "proposed",
        classification: area.classification,
        sulphurPercent: null,
        nox: { status: "not-adopted" },
        sources: area.sources,
        verifiedOn: area.verifiedOn,
      };
    const global = rate(catalogue.globalSulphur, at),
      designated = at >= area.designationFrom,
      sulphurActive = designated && at >= area.sulphurFrom,
      local = sulphurActive ? rate(catalogue.ecaSulphur, at) : null;
    const status = !designated
      ? "adopted-future"
      : !sulphurActive
        ? "transitional"
        : "active";
    return {
      areaId: area.id,
      date: at,
      status,
      classification: area.classification,
      sulphurPercent:
        local === null ? global : Math.min(global ?? local, local),
      sulphurBasis: sulphurActive ? "eca" : "global",
      equivalentSystemsRequireApproval: true,
      nox: engines(area, vessel, at),
      changes: [area.designationFrom, area.sulphurFrom, area.noxFrom]
        .filter((d) => d && d > at)
        .sort(),
      sources: area.sources,
      verifiedOn: area.verifiedOn,
    };
  }
  function applicability(rule, vessel) {
    const a = rule.applicability || {},
      missing = [];
    if (a.flags) {
      if (!vessel.flag) missing.push("flag");
      else if (!a.flags.includes(vessel.flag)) return "outside-scope";
    }
    if (a.shipTypes) {
      if (!vessel.shipType) missing.push("ship-type");
      else if (!a.shipTypes.includes(vessel.shipType)) return "outside-scope";
    }
    if (a.excludeTypes && !vessel.shipType) missing.push("ship-type");
    if (a.excludeTypes?.includes(vessel.shipType)) return "outside-scope";
    if (a.minGt !== undefined || a.maxGtExclusive !== undefined) {
      if (vessel.grossTonnage == null || vessel.grossTonnage === "")
        missing.push("gross-tonnage");
      else if (!Number.isFinite(Number(vessel.grossTonnage)))
        missing.push("gross-tonnage");
      else if (
        (a.minGt !== undefined && Number(vessel.grossTonnage) < a.minGt) ||
        (a.maxGtExclusive !== undefined &&
          Number(vessel.grossTonnage) >= a.maxGtExclusive)
      )
        return "outside-scope";
    }
    if (a.requireAdministrationReview || vessel.exemptionClaim)
      missing.push("administration-review");
    return missing.length ? "unconfirmed" : "potentially-applicable";
  }
  function otherRules(area, value, vessel, catalogue) {
    const at = day(value);
    if (area.adoptionStatus === "proposed")
      return {
        areaId: area.id,
        date: at,
        status: "proposed",
        classification: area.classification,
        sulphurPercent: null,
        nox: { status: "not-adopted" },
        requirements: [],
        changes: [],
        sources: area.sources,
        verifiedOn: area.verifiedOn,
      };
    const requirements = (area.requirements || [])
        .filter((r) => !r.until || at < r.until)
        .map((r) => ({
          ...r,
          status: at < r.from ? "adopted-future" : "active",
          vesselApplicability: applicability(r, vessel),
        })),
      active = at >= area.designationFrom,
      limits = requirements
        .filter(
          (r) => r.status === "active" && r.fuelSulphurPercent !== undefined,
        )
        .map((r) => r.fuelSulphurPercent),
      global = rate(catalogue.globalSulphur, at);
    return {
      areaId: area.id,
      date: at,
      status: active ? "active" : "adopted-future",
      classification: area.classification,
      geographyWarning: area.geometryCaveat || null,
      sulphurPercent: limits.length
        ? Math.min(global ?? Infinity, ...limits)
        : global,
      sulphurBasis: limits.length ? "national" : "global",
      nox: { status: "not-applicable", engines: [] },
      requirements,
      changes: requirements.filter((r) => r.from > at).map((r) => r.from),
      sources: area.sources,
      verifiedOn: area.verifiedOn,
    };
  }
  function transitions(catalogue) {
    return [
      ...new Set(
        [...catalogue.globalSulphur, ...catalogue.ecaSulphur]
          .map((r) => r.from)
          .concat(root.MT_NOX.RATES.flatMap((r) => [r.from, r.until]))
          .concat(
            catalogue.areas
              .flatMap((a) => [
                a.designationFrom,
                a.sulphurFrom,
                a.noxFrom,
                ...(a.requirements || []).flatMap((r) => [r.from, r.until]),
              ])
              .filter(Boolean),
          ),
      ),
    ]
      .sort()
      .map((d) => d + "T00:00:00Z");
  }
  function annotate(result, catalogue, vessel = {}) {
    const byId = new Map(catalogue.areas.map((a) => [a.id, a]));
    return {
      ...result,
      catalogueVersion: catalogue.version,
      verifiedOn: catalogue.verifiedOn,
      segments: result.segments.map((s) => ({
        ...s,
        rules: s.areaIds.map((id) =>
          byId.has(id)
            ? evaluate(byId.get(id), s.entry, vessel, catalogue)
            : { areaId: id, status: "unverified" },
        ),
        globalSulphurPercent: rate(catalogue.globalSulphur, day(s.entry)),
      })),
      coverage: catalogue.coverage,
      limitations: catalogue.limitations,
    };
  }
  root.MT_REGULATORY_RULES = {
    rate,
    constructed,
    evaluate,
    transitions,
    annotate,
  };
})(typeof window === "undefined" ? globalThis : window);
