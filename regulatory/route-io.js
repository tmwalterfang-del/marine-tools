/* Bounded, inert route exchange: no remote resources, DTDs or executable fields. */
(function (root) {
  "use strict";
  const MAX = 2 * 1024 * 1024;
  function clean(points) {
    if (!Array.isArray(points) || points.length < 2 || points.length > 1000)
      throw Error("Use 2–1000 waypoints.");
    return points.map((p) => root.MT_NAV_MATH.coordinate(p));
  }
  function decode(text, name) {
    if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX)
      throw Error("Route files must be at most 2 MB.");
    if (/\.(?:json|geojson)$/i.test(name)) {
      const data = JSON.parse(text),
        g = data.type === "Feature" ? data.geometry : data;
      if (g?.type !== "LineString")
        throw Error("GeoJSON must contain one LineString.");
      return clean(g.coordinates);
    }
    if (!/\.(?:gpx|rtz)$/i.test(name))
      throw Error("Choose GPX, GeoJSON or RTZ.");
    if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(text))
      throw Error(
        "External XML resources and document types are not supported.",
      );
    const xml = new DOMParser().parseFromString(text, "application/xml");
    if (xml.getElementsByTagName("parsererror").length)
      throw Error("Invalid route XML.");
    const all = Array.from(xml.getElementsByTagName("*"));
    let rows;
    if (/\.gpx$/i.test(name)) {
      if (xml.documentElement.localName !== "gpx")
        throw Error("Invalid GPX document.");
      const routes = all.filter((e) => e.localName === "rte"),
        tracks = all.filter((e) => e.localName === "trkseg");
      if (routes.length + tracks.length !== 1)
        throw Error("Import exactly one GPX route or track segment.");
      rows = all.filter(
        (e) => e.localName === (routes.length ? "rtept" : "trkpt"),
      );
    } else {
      if (xml.documentElement.localName !== "route")
        throw Error("Invalid RTZ document.");
      rows = all
        .filter((e) => e.localName === "waypoint")
        .map((e) =>
          Array.from(e.getElementsByTagName("*")).find(
            (x) => x.localName === "position",
          ),
        );
      if (rows.some((e) => !e)) throw Error("RTZ waypoints need positions.");
    }
    return clean(
      rows.map((e) => {
        const lon = e.getAttribute("lon"),
          lat = e.getAttribute("lat");
        if (lon === null || lat === null || !lon.trim() || !lat.trim())
          throw Error("Waypoint coordinates are missing.");
        return [Number(lon), Number(lat)];
      }),
    );
  }
  function geojson(points, name = "Marine Tools route") {
    return JSON.stringify(
      {
        type: "Feature",
        properties: {
          name: String(name).slice(0, 120),
          purpose: "regulatory-planning-reference",
        },
        geometry: { type: "LineString", coordinates: clean(points) },
      },
      null,
      2,
    );
  }
  function csv(rows) {
    return (
      "\uFEFF" +
      rows
        .map((r) =>
          r
            .map((v) => {
              let s = String(v ?? "");
              if (typeof v !== "number" && /^[\s]*[=+@-]/.test(s)) s = "'" + s;
              return '"' + s.replaceAll('"', '""') + '"';
            })
            .join(","),
        )
        .join("\r\n")
    );
  }
  root.MT_ROUTE_IO = { decode, geojson, csv, clean, MAX };
})(typeof window === "undefined" ? globalThis : window);
