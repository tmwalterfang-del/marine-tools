/* Planning arithmetic only; jurisdiction is supplied independently of ECA areas. */
(function (root) {
  "use strict";
  const N = root.MT_NOX,
    nav = root.MT_NAV_MATH;
  function limit(segment) {
    return Math.min(
      segment.globalSulphurPercent ?? Infinity,
      ...segment.rules.map((r) => r.sulphurPercent ?? Infinity),
    );
  }
  function positionAt(result, nm) {
    if (nm < 0) return null;
    const distances = result.cumulativeNm,
      points = result.geometry;
    if (!distances || !points || distances.length !== points.length)
      throw Error("Route distance positions are missing.");
    if (nm >= result.totalNm) return points.at(-1);
    let low = 0,
      high = distances.length - 1;
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (distances[mid] <= nm) low = mid;
      else high = mid;
    }
    return nav.interpolate(
      points[low],
      points[high],
      (nm - distances[low]) / (distances[high] - distances[low]),
    );
  }
  function changeovers(result, { hours, source } = {}) {
    if (hours === undefined || hours === null || String(hours).trim() === "")
      return [];
    const duration = N.numeric(hours, "Changeover duration", { max: 168 });
    if (!String(source || "").trim())
      throw Error(
        "Identify the approved changeover procedure and assumptions.",
      );
    const speed = result.totalNm / result.totalHours,
      events = [];
    let previous = result.segments[0]?.globalSulphurPercent ?? Infinity;
    for (const s of result.segments) {
      const next = limit(s);
      if (next < previous - 1e-8) {
        const startNm = s.fromNm - duration * speed;
        events.push({
          entry: s.entry,
          entryPosition: s.from,
          areaIds: s.areaIds,
          fromLimit: previous,
          toLimit: next,
          durationHours: duration,
          latestStart: new Date(
            Date.parse(s.entry) - duration * 3600000,
          ).toISOString(),
          startNm,
          startPosition: positionAt(result, startNm),
          beforeDeparture: startNm < 0,
          source,
          model: "entered-duration-before-boundary-arrival",
        });
      }
      previous = next;
    }
    return events;
  }
  function consumption(result, { rate, carrier } = {}) {
    if (rate === undefined || rate === null || String(rate).trim() === "")
      return null;
    if (!carrier || !["kg", "t", "m3", "L"].includes(carrier.primaryUnit))
      throw Error(
        "Select a Vessel Profile fuel with a supported mass or volume unit.",
      );
    const hourly = N.numeric(rate, "Hourly fuel consumption"),
      rows = result.segments.map((s) => {
        const amount = hourly * s.hours;
        let kg = null;
        if (carrier.primaryUnit === "kg") kg = amount;
        else if (carrier.primaryUnit === "t") kg = amount * 1000;
        else if (carrier.densityKgM3 != null && carrier.densityKgM3 !== "") {
          const density = N.numeric(carrier.densityKgM3, "Fuel density", {
            min: Number.MIN_VALUE,
            max: 3000,
          });
          kg = amount * (carrier.primaryUnit === "L" ? 0.001 : 1) * density;
        }
        return { fromNm: s.fromNm, toNm: s.toNm, amount, massKg: kg };
      });
    return {
      carrierId: carrier.id,
      carrierName: carrier.name,
      unit: carrier.primaryUnit,
      hourlyRate: hourly,
      totalAmount: hourly * result.totalHours,
      totalKg: rows.every((r) => r.massKg !== null)
        ? rows.reduce((a, b) => a + b.massKg, 0)
        : null,
      segments: rows,
      assumption: "constant-user-entered-consumption-rate",
    };
  }
  function emissions(result, { profile, loads, chargeContext } = {}) {
    const engines = profile.engines.filter((e) => e.kind !== "electric");
    if (!engines.length) throw Error("No combustion machinery is configured.");
    for (const e of engines) {
      N.numeric(loads[e.id], "Planned engine load", { max: 100 });
      if (e.factorMethod !== "energy" || !e.factorSource)
        throw Error(
          "All operating engines need identified energy-based NOx factors.",
        );
      N.numeric(e.factor, "NOx factor");
      if (e.factorPosition !== "outlet")
        throw Error(
          "Voyage NOx needs an outlet factor that already accounts for treatment.",
        );
    }
    const rows = result.segments.map((s) => {
      const items = engines.map((e) => {
        const carrier = profile.carriers.find((c) => c.id === e.carrierId),
          fuel = N.fuels.includes(carrier?.catalogKey)
            ? carrier.catalogKey
            : "custom",
          input = {
            fuel,
            method: "energy",
            quality: "estimated",
            source: e.factorSource,
            powerKw:
              (N.numeric(e.ratedKw, "Rated engine power") *
                N.numeric(loads[e.id], "Planned engine load", { max: 100 })) /
              100,
            hours: s.hours,
            factor: e.factor,
            factorPosition: "outlet",
          },
          emissions = N.emissions(input);
        return {
          engineId: e.id,
          loadPercent: Number(String(loads[e.id]).replace(",", ".")),
          emissions,
          charges: N.charges(emissions.kgNOx, {
            ...chargeContext,
            date: s.entry.slice(0, 10),
          }),
        };
      });
      return {
        fromNm: s.fromNm,
        toNm: s.toNm,
        kgNOx: items.reduce((n, r) => n + r.emissions.kgNOx, 0),
        totalNok: items.every((r) => r.charges.totalNok !== null)
          ? items.reduce((n, r) => n + r.charges.totalNok, 0)
          : null,
        items,
      };
    });
    return {
      segments: rows,
      kgNOx: rows.reduce((n, r) => n + r.kgNOx, 0),
      totalNok: rows.every((r) => r.totalNok !== null)
        ? rows.reduce((n, r) => n + r.totalNok, 0)
        : null,
      quality: "estimated",
      assumption:
        "constant-user-entered-average-engine-loads-and-outlet-factors",
    };
  }
  function sulphurOxides(consumption, { factorKgT, source } = {}) {
    if (
      factorKgT === undefined ||
      factorKgT === null ||
      String(factorKgT).trim() === ""
    )
      return null;
    if (!consumption || consumption.totalKg === null)
      throw Error(
        "SO2 estimation needs fuel mass or a documented density for volume consumption.",
      );
    const factor = N.numeric(factorKgT, "Documented SO2 factor");
    if (!String(source || "").trim() || String(source).length > 600)
      throw Error("Identify the SO2 factor source and fuel applicability.");
    return {
      totalKgSO2: (consumption.totalKg / 1000) * factor,
      factorKgT: factor,
      source,
      reportingBasis: "SO2",
      quality: "estimated",
      relation: "SO2 [kg] = fuel [t] × entered factor [kg SO2/t fuel]",
      segments: consumption.segments.map((r) => ({
        fromNm: r.fromNm,
        toNm: r.toNm,
        kgSO2: (r.massKg / 1000) * factor,
      })),
    };
  }
  root.MT_VOYAGE_ENVIRONMENT = {
    limit,
    positionAt,
    changeovers,
    consumption,
    emissions,
    sulphurOxides,
  };
})(typeof window === "undefined" ? globalThis : window);
