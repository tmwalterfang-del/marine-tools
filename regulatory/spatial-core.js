/* WGS84 polygon intersection, with explicit great-circle route tessellation. */
(function (root) {
  "use strict";
  const N = root.MT_NAV_MATH,
    EPS = 1e-10,
    cache = new WeakMap();
  function unwrap(ring, anchor) {
    if (!Array.isArray(ring) || ring.length < 4)
      throw Error("A polygon ring needs at least four positions.");
    const r = [];
    for (const raw of ring) {
      const p = N.coordinate(raw);
      if (r.length) p[0] = r.at(-1)[0] + N.delta(r.at(-1)[0], p[0]);
      r.push(p);
    }
    if (
      Math.abs(r[0][0] - r.at(-1)[0]) > EPS ||
      Math.abs(r[0][1] - r.at(-1)[1]) > EPS
    )
      throw Error("Polygon rings must be closed without a full-world jump.");
    const rb = bounds(r),
      centre = (rb.minX + rb.maxX) / 2,
      shift =
        anchor === undefined ? 0 : 360 * Math.round((anchor - centre) / 360);
    return r.map((p) => [p[0] + shift, p[1]]);
  }
  function bounds(points) {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const [x, y] of points) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return { minX, maxX, minY, maxY };
  }
  function prepared(geometry) {
    if (cache.has(geometry)) return cache.get(geometry);
    if (geometry?.type === "LatitudeBand") {
      if (
        !Number.isFinite(geometry.south) ||
        !Number.isFinite(geometry.north) ||
        geometry.south < -90 ||
        geometry.north > 90 ||
        geometry.south >= geometry.north
      )
        throw Error("Invalid legal latitude limits.");
      return [];
    }
    if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type))
      throw Error("Regulatory boundaries must be polygons or multipolygons.");
    const groups =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.coordinates;
    const polys = groups.map((rings) => {
      const outer = unwrap(rings[0]),
        bbox = bounds(outer),
        centre = (bbox.minX + bbox.maxX) / 2,
        all = [outer, ...rings.slice(1).map((r) => unwrap(r, centre))],
        edges = [];
      for (let ringIndex = 0; ringIndex < all.length; ringIndex++) {
        const ring = all[ringIndex];
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1],
            b = ring[i];
          edges.push({ a, b, ringIndex, ...bounds([a, b]) });
        }
      }
      const latitudeGrid = new Map();
      for (const e of edges)
        for (let y = Math.floor(e.minY / 2); y <= Math.floor(e.maxY / 2); y++) {
          if (!latitudeGrid.has(y)) latitudeGrid.set(y, []);
          latitudeGrid.get(y).push(e);
        }
      const grid = new Map();
      for (const e of edges)
        for (
          let gx = Math.floor(e.minX / 2);
          gx <= Math.floor(e.maxX / 2);
          gx++
        )
          for (
            let gy = Math.floor(e.minY / 2);
            gy <= Math.floor(e.maxY / 2);
            gy++
          ) {
            const key = gx + "," + gy;
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key).push(e);
          }
      return { rings: all, bbox, centre, grid, latitudeGrid };
    });
    const polygonGrid = new Map();
    for (const poly of polys)
      for (
        let gx = Math.floor(poly.bbox.minX / 2);
        gx <= Math.floor(poly.bbox.maxX / 2);
        gx++
      )
        for (
          let gy = Math.floor(poly.bbox.minY / 2);
          gy <= Math.floor(poly.bbox.maxY / 2);
          gy++
        ) {
          const key = ((((gx + 90) % 180) + 180) % 180) + "," + gy;
          if (!polygonGrid.has(key)) polygonGrid.set(key, new Set());
          polygonGrid.get(key).add(poly);
        }
    polys.polygonGrid = polygonGrid;
    cache.set(geometry, polys);
    return polys;
  }
  function candidates(geometry, a, b) {
    const polys = prepared(geometry),
      end = a[0] + N.delta(a[0], b[0]),
      grid = polys.polygonGrid,
      result = new Set();
    if (!grid) return polys;
    for (
      let x = Math.floor(Math.min(a[0], end) / 2);
      x <= Math.floor(Math.max(a[0], end) / 2);
      x++
    )
      for (
        let y = Math.floor(Math.min(a[1], b[1]) / 2);
        y <= Math.floor(Math.max(a[1], b[1]) / 2);
        y++
      )
        for (const p of grid.get(((((x + 90) % 180) + 180) % 180) + "," + y) ||
          [])
          result.add(p);
    return result;
  }
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0],
    subtract = (a, b) => [a[0] - b[0], a[1] - b[1]],
    overlap = (a, b) =>
      a.minX <= b.maxX + EPS &&
      a.maxX + EPS >= b.minX &&
      a.minY <= b.maxY + EPS &&
      a.maxY + EPS >= b.minY;
  function onSegment(p, a, b) {
    return (
      Math.abs(cross(subtract(p, a), subtract(b, a))) <=
        EPS * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])) &&
      overlap(bounds([p]), bounds([a, b]))
    );
  }
  function inRing(p, r) {
    let inside = false;
    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1],
        b = r[i];
      if (onSegment(p, a, b)) return "boundary";
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        inside = !inside;
    }
    return inside ? "inside" : "outside";
  }
  function classify(point, geometry) {
    N.coordinate(point);
    if (geometry?.type === "LatitudeBand") {
      prepared(geometry);
      return point[1] < geometry.south - EPS || point[1] > geometry.north + EPS
        ? "outside"
        : Math.abs(point[1] - geometry.south) <= EPS ||
            Math.abs(point[1] - geometry.north) <= EPS
          ? "boundary"
          : "inside";
    }
    for (const poly of candidates(geometry, point, point)) {
      const p = [
        point[0] + 360 * Math.round((poly.centre - point[0]) / 360),
        point[1],
      ];
      if (!overlap(bounds([p]), poly.bbox)) continue;
      const parity = new Set();
      for (const e of poly.latitudeGrid.get(Math.floor(p[1] / 2)) || []) {
        if (onSegment(p, e.a, e.b)) return "boundary";
        if (
          e.a[1] > p[1] !== e.b[1] > p[1] &&
          p[0] <
            ((e.b[0] - e.a[0]) * (p[1] - e.a[1])) / (e.b[1] - e.a[1]) + e.a[0]
        ) {
          if (parity.has(e.ringIndex)) parity.delete(e.ringIndex);
          else parity.add(e.ringIndex);
        }
      }
      if (parity.has(0) && parity.size === 1) return "inside";
    }
    return "outside";
  }
  function intersections(a, b, edge) {
    const r = subtract(b, a),
      s = subtract(edge.b, edge.a),
      q = subtract(edge.a, a),
      d = cross(r, s);
    if (Math.abs(d) > EPS) {
      const t = cross(q, s) / d,
        u = cross(q, r) / d;
      return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS
        ? [Math.max(0, Math.min(1, t))]
        : [];
    }
    if (Math.abs(cross(q, r)) > EPS) return [];
    const length = r[0] * r[0] + r[1] * r[1];
    if (length < EPS * EPS) return [];
    return [edge.a, edge.b]
      .map((p) => ((p[0] - a[0]) * r[0] + (p[1] - a[1]) * r[1]) / length)
      .filter((t) => t >= -EPS && t <= 1 + EPS)
      .map((t) => Math.max(0, Math.min(1, t)));
  }
  function cuts(a, b, geometry) {
    const result = [0, 1];
    if (geometry?.type === "LatitudeBand") {
      prepared(geometry);
      if (b[1] !== a[1])
        for (const lat of [geometry.south, geometry.north]) {
          const t = (lat - a[1]) / (b[1] - a[1]);
          if (t > 0 && t < 1) result.push(t);
        }
      return result.sort((a, b) => a - b);
    }
    for (const p of candidates(geometry, a, b)) {
      const mid = a[0] + N.delta(a[0], b[0]) / 2,
        shift = 360 * Math.round((p.centre - mid) / 360),
        aa = [a[0] + shift, a[1]],
        bb = [aa[0] + N.delta(a[0], b[0]), b[1]],
        box = bounds([aa, bb]);
      if (!overlap(box, p.bbox)) continue;
      const candidates = new Set();
      for (
        let gx = Math.floor(box.minX / 2);
        gx <= Math.floor(box.maxX / 2);
        gx++
      )
        for (
          let gy = Math.floor(box.minY / 2);
          gy <= Math.floor(box.maxY / 2);
          gy++
        )
          for (const e of p.grid.get(gx + "," + gy) || []) candidates.add(e);
      for (const e of candidates)
        if (overlap(box, e)) result.push(...intersections(aa, bb, e));
    }
    result.sort((x, y) => x - y);
    return result.filter((v, i) => !i || Math.abs(v - result[i - 1]) > 1e-9);
  }
  function normal(point) {
    return [((((point[0] + 180) % 360) + 360) % 360) - 180, point[1]];
  }
  function linear(a, b, t) {
    return normal([a[0] + N.delta(a[0], b[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  function route(points, { stepNm = 1 } = {}) {
    if (
      !Array.isArray(points) ||
      points.length < 2 ||
      points.length > 1000 ||
      !Number.isFinite(stepNm) ||
      stepNm < 0.1 ||
      stepNm > 5
    )
      throw Error("Use 2–1000 waypoints and a supported route precision.");
    const out = [],
      legs = [];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const a = N.coordinate(points[i - 1]),
        b = N.coordinate(points[i]),
        length = N.distance(a, b);
      if (length < 1e-7) throw Error("Adjacent waypoints must be distinct.");
      total += length;
      if (total > 60000)
        throw Error("The route exceeds the supported 60,000 NM range.");
      const count = Math.ceil(length / stepNm);
      for (let j = 0; j < count; j++) {
        const from = N.interpolate(a, b, j / count),
          to = N.interpolate(a, b, (j + 1) / count);
        out.push({
          from,
          to,
          leg: i - 1,
          fromNm: total - length + (length * j) / count,
          toNm: total - length + (length * (j + 1)) / count,
        });
      }
      legs.push({
        leg: i - 1,
        distanceNm: length,
        fromNm: total - length,
        toNm: total,
      });
    }
    return {
      segments: out,
      legs,
      totalNm: total,
      interpolation: "great-circle",
      sphereRadiusNm: N.R,
      tessellationMaxNm: stepNm,
    };
  }
  function analyze(
    points,
    areas,
    { departure, speedKn = 10, stepNm = 1, transitions = [] } = {},
  ) {
    if (!Number.isFinite(speedKn) || speedKn <= 0 || speedKn > 100)
      throw Error("Use a speed above zero and at most 100 kn.");
    const start = Date.parse(departure),
      calendar = String(departure).slice(0, 10);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(calendar) ||
      !Number.isFinite(Date.parse(calendar + "T00:00:00Z")) ||
      new Date(calendar + "T00:00:00Z").toISOString().slice(0, 10) !== calendar
    )
      throw Error("Invalid departure calendar date.");
    if (
      !Number.isFinite(start) ||
      !/(?:Z|[+-]\d\d:\d\d)$/.test(departure || "")
    )
      throw Error("Departure must include UTC or an explicit time offset.");
    if (!Array.isArray(areas) || areas.length > 500)
      throw Error("Invalid regulatory area catalogue.");
    const ids = new Set();
    for (const a of areas) {
      if (typeof a.id !== "string" || ids.has(a.id))
        throw Error("Regulatory area IDs must be unique.");
      ids.add(a.id);
      if (a.geometry) prepared(a.geometry);
    }
    const geometry = route(points, { stepNm }),
      spatial = areas.filter((a) => a.geometry),
      segments = [],
      events = transitions
        .map((v) => Date.parse(v))
        .filter(Number.isFinite)
        .map((t) => ((t - start) / 3600000) * speedKn)
        .filter((d) => d > 0 && d < geometry.totalNm)
        .sort((a, b) => a - b);
    for (const part of geometry.segments) {
      let ts = [0, 1];
      for (const area of spatial)
        ts.push(...cuts(part.from, part.to, area.geometry));
      for (const d of events)
        if (d > part.fromNm && d < part.toNm)
          ts.push((d - part.fromNm) / (part.toNm - part.fromNm));
      ts.sort((a, b) => a - b);
      ts = ts.filter((v, i) => !i || v - ts[i - 1] > 1e-9);
      for (let j = 1; j < ts.length; j++) {
        const a = ts[j - 1],
          b = ts[j];
        if (b - a < 1e-9) continue;
        const midpoint = linear(part.from, part.to, (a + b) / 2),
          inside = spatial
            .filter((area) => classify(midpoint, area.geometry) !== "outside")
            .map((area) => area.id)
            .sort(),
          fromNm = part.fromNm + (part.toNm - part.fromNm) * a,
          toNm = part.fromNm + (part.toNm - part.fromNm) * b;
        segments.push({
          leg: part.leg,
          from: linear(part.from, part.to, a),
          to: linear(part.from, part.to, b),
          fromNm,
          toNm,
          distanceNm: toNm - fromNm,
          hours: (toNm - fromNm) / speedKn,
          entry: new Date(start + (fromNm / speedKn) * 3600000).toISOString(),
          exit: new Date(start + (toNm / speedKn) * 3600000).toISOString(),
          areaIds: inside,
        });
      }
    }
    // Merge only equal overlaps within a waypoint leg and never across a date transition.
    const merged = [];
    for (const p of segments) {
      const last = merged.at(-1),
        dateBreak = events.some((d) => Math.abs(d - p.fromNm) < 1e-7);
      if (
        last &&
        last.leg === p.leg &&
        JSON.stringify(last.areaIds) === JSON.stringify(p.areaIds) &&
        !dateBreak
      ) {
        last.to = p.to;
        last.toNm = p.toNm;
        last.exit = p.exit;
        last.distanceNm += p.distanceNm;
        last.hours += p.hours;
      } else merged.push({ ...p });
    }
    return {
      segments: merged,
      totalNm: geometry.totalNm,
      totalHours: geometry.totalNm / speedKn,
      arrival: new Date(
        start + (geometry.totalNm / speedKn) * 3600000,
      ).toISOString(),
      geometry: geometry.segments
        .map((p) => p.from)
        .concat([geometry.segments.at(-1).to]),
      cumulativeNm: geometry.segments
        .map((p) => p.fromNm)
        .concat([geometry.totalNm]),
      missingGeometry: areas.filter((a) => !a.geometry).map((a) => a.id),
      precision: {
        sphereRadiusNm: N.R,
        routeTessellationMaxNm: stepNm,
        polygonModel:
          "GeoJSON WGS84 coordinates; geodesic boundary source vertices must be tessellated before import.",
        boundaryUncertainty:
          "Use the source-specific geographic accuracy; boundary contacts require review.",
      },
    };
  }
  root.MT_REGULATORY_GEO = { prepared, classify, cuts, route, analyze, normal };
})(typeof window === "undefined" ? globalThis : window);
