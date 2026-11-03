(function (root) {
  "use strict";
  const KEY = "mt.profile.v2";
  function read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }
  function profile() {
    const p = read(KEY, {}),
      legacy = read("mt.profile", {}),
      r = p.regulatory || {};
    return {
      ...p,
      vessel: {
        ...(p.vessel || {}),
        ...r,
        name: legacy.name ?? p.vessel?.name ?? "",
        serviceSpeed: legacy.serviceSpeed ?? p.vessel?.serviceSpeed ?? null,
      },
      operational: {
        ...(p.operational || {}),
        fuelDay: legacy.fuelDay ?? p.operational?.fuelDay ?? null,
      },
      carriers: Array.isArray(p.carriers) ? p.carriers : [],
      engines: (p.machinery || []).map((m) => ({
        ...r.engines?.find((e) => e.id === m.id),
        id: m.id,
        name: m.name,
        ratedKw: m.ratedPowerKw,
        carrierId: m.primaryCarrierId,
        profileType: m.type,
      })),
    };
  }
  function save(regulatory, machinery) {
    const beforeProfile = localStorage.getItem(KEY);
    const beforeLegacy = localStorage.getItem("mt.profile");
    const p = read(KEY, {}),
      legacy = read("mt.profile", {});
    if (p.schemaVersion && p.schemaVersion !== 1)
      throw Error("Unsupported Vessel Profile version.");
    const next = {
      schemaVersion: 1,
      ...p,
      vessel: p.vessel || {
        name: legacy.name || "",
        serviceSpeed: legacy.serviceSpeed ?? null,
      },
      operational: p.operational || { fuelDay: legacy.fuelDay ?? null },
      carriers: p.carriers || [],
      tanks: p.tanks || [],
      machinery: machinery || p.machinery || [],
      regulatory: { ...p.regulatory, ...regulatory },
      updatedAt: new Date().toISOString(),
    };
    if (typeof regulatory.name === "string") {
      next.vessel.name = regulatory.name;
      legacy.name = regulatory.name;
    }
    if (regulatory.loa !== undefined && regulatory.loa !== "") {
      next.vessel.loa = regulatory.loa;
      legacy.loa = regulatory.loa;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      localStorage.setItem("mt.profile", JSON.stringify(legacy));
    } catch (error) {
      for (const [key, value] of [[KEY, beforeProfile], ["mt.profile", beforeLegacy]]) {
        try {
          if (value === null) localStorage.removeItem(key);
          else localStorage.setItem(key, value);
        } catch {}
      }
      throw error;
    }
    return profile();
  }
  function energyEntries() {
    const rows = read("mt.energyLog.v1", []);
    return Array.isArray(rows)
      ? rows.filter((r) => r.activity === "consumed" && r.amount != null)
      : [];
  }
  function route() {
    const rows = read("mt.route", []);
    return Array.isArray(rows)
      ? rows
          .map((p) => [Number(p.lon), Number(p.lat)])
          .filter((p) => p.every(Number.isFinite))
      : [];
  }
  root.MT_REGULATORY_PROFILE = { profile, save, energyEntries, route };
})(typeof window === "undefined" ? globalThis : window);
