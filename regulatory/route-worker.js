"use strict";
importScripts(
  "../navigation-math.js",
  "nox-core.js",
  "spatial-core.js",
  "rules-core.js",
);
function hex(bytes) {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
function cells(points) {
  const route = MT_REGULATORY_GEO.route(points),
    keys = new Set();
  for (const part of route.segments) {
    const end = part.from[0] + MT_NAV_MATH.delta(part.from[0], part.to[0]);
    for (
      let x = Math.floor(Math.min(part.from[0], end) / 2);
      x <= Math.floor(Math.max(part.from[0], end) / 2);
      x++
    )
      for (
        let y = Math.floor(Math.min(part.from[1], part.to[1]) / 2);
        y <= Math.floor(Math.max(part.from[1], part.to[1]) / 2);
        y++
      )
        keys.add((((((x + 90) % 180) + 180) % 180) - 90) * 2 + "," + y * 2);
  }
  return keys;
}
function mapCells(bounds) {
  if (
    !Array.isArray(bounds) ||
    bounds.length !== 4 ||
    !bounds.every(Number.isFinite) ||
    bounds[2] - bounds[0] > 120 ||
    bounds[3] - bounds[1] > 80
  )
    throw Error("MAP_VIEW_TOO_WIDE");
  const keys = new Set();
  for (let x = Math.floor(bounds[0] / 2); x <= Math.floor(bounds[2] / 2); x++)
    for (
      let y = Math.floor(Math.max(-90, bounds[1]) / 2);
      y <= Math.floor(Math.min(89.999999, bounds[3]) / 2);
      y++
    ) {
      keys.add((((((x + 90) % 180) + 180) % 180) - 90) * 2 + "," + y * 2);
      if (keys.size > 64) throw Error("MAP_VIEW_TOO_WIDE");
    }
  return keys;
}
async function json(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw Error("REGULATORY_DATA_UNAVAILABLE");
  return response.json();
}
self.onmessage = async (event) => {
  try {
    const { points, options, vessel } = event.data;
    if (!self.DecompressionStream)
      throw Error("REGULATORY_BROWSER_UNSUPPORTED");
    const [catalogue, index] = await Promise.all([
        json("catalogue.json"),
        json("data/tile-index.json"),
      ]),
      needed =
        event.data.action === "map"
          ? mapCells(event.data.bounds)
          : cells(points),
      selected = index.tiles.filter((tile) => needed.has(tile.cell)),
      geometries = new Map(
        index.areaIds.map((id) => [
          id,
          index.inlineGeometries?.[id] || {
            type: "MultiPolygon",
            coordinates: [],
          },
        ]),
      ),
      areas = new Map(
        catalogue.areas.map((a) => [
          a.id,
          { id: a.id, geometry: geometries.get(a.geometryId || a.id) || null },
        ]),
      );
    const total = selected.length,
      packDefinitions = new Map(index.packs.map((p) => [p.file, p])),
      packCache = new Map();
    let done = 0;
    async function tileBytes(tile) {
      if (
        !/^packs\/[a-z0-9-]+\.bin$/.test(tile.file) ||
        !Number.isSafeInteger(tile.offset) ||
        tile.offset < 0
      )
        throw Error("REGULATORY_DATA_INVALID");
      const pack = packDefinitions.get(tile.file);
      if (
        !pack ||
        pack.bytes > 20 * 1024 * 1024 ||
        tile.offset + tile.bytes > pack.bytes
      )
        throw Error("REGULATORY_DATA_INVALID");
      if (!packCache.has(pack.file))
        packCache.set(
          pack.file,
          (async () => {
            const response = await fetch("data/" + pack.file, {
              credentials: "same-origin",
            });
            if (!response.ok) throw Error("REGULATORY_DATA_UNAVAILABLE");
            const bytes = await response.arrayBuffer();
            if (
              bytes.byteLength !== pack.bytes ||
              hex(await crypto.subtle.digest("SHA-256", bytes)) !== pack.sha256
            )
              throw Error("REGULATORY_DATA_INTEGRITY");
            return bytes;
          })(),
        );
      return (await packCache.get(pack.file)).slice(
        tile.offset,
        tile.offset + tile.bytes,
      );
    }
    async function consume() {
      while (selected.length) {
        const tile = selected.shift();
        const bytes = await tileBytes(tile);
        if (
          bytes.byteLength !== tile.bytes ||
          hex(await crypto.subtle.digest("SHA-256", bytes)) !== tile.sha256
        )
          throw Error("REGULATORY_DATA_INTEGRITY");
        const decompressed = await new Response(
          new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream("gzip")),
        ).text();
        if (decompressed.length > 20 * 1024 * 1024)
          throw Error("REGULATORY_DATA_INVALID");
        const data = JSON.parse(decompressed);
        for (const f of data.features) {
          const geometry = geometries.get(f.properties.id);
          if (
            !geometry ||
            !["Polygon", "MultiPolygon"].includes(f.geometry?.type)
          )
            throw Error("REGULATORY_DATA_INVALID");
          geometry.coordinates.push(
            ...(f.geometry.type === "Polygon"
              ? [f.geometry.coordinates]
              : f.geometry.coordinates),
          );
        }
        self.postMessage({ progress: ++done, total });
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(4, selected.length) }, consume),
    );
    if (event.data.action === "map") {
      self.postMessage({
        mapFeatures: [...areas.values()]
          .filter(
            (a) =>
              (event.data.ids || []).includes(a.id) &&
              a.geometry?.type === "MultiPolygon",
          )
          .map((a) => ({
            type: "Feature",
            properties: { id: a.id },
            geometry: a.geometry,
          })),
      });
      return;
    }
    const result = MT_REGULATORY_GEO.analyze(points, [...areas.values()], {
      ...options,
      transitions: MT_REGULATORY_RULES.transitions(catalogue).concat(
        (options.additionalTransitions || []).filter(
          (d) =>
            typeof d === "string" && /^\d{4}-\d{2}-\d{2}T00:00:00Z$/.test(d),
        ),
      ),
    });
    self.postMessage({
      result: {
        ...MT_REGULATORY_RULES.annotate(result, catalogue, vessel),
        geographyVersion: index.version,
        geographySources: index.sources,
        loadedTileCount: done,
        precision: {
          ...result.precision,
          coastalSimplificationDegrees: index.coastalSimplificationDegrees,
          overviewUsedForAnalysis: false,
        },
      },
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
