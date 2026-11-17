/* Shared spherical navigation math, preserving Marine Tools' existing radius. */
(function (root) {
  "use strict";
  const R = 3440.065,
    D = Math.PI / 180;
  function coordinate(p) {
    if (
      !Array.isArray(p) ||
      p.length < 2 ||
      !Number.isFinite(p[0]) ||
      !Number.isFinite(p[1]) ||
      p[0] < -180 ||
      p[0] > 180 ||
      p[1] < -90 ||
      p[1] > 90
    )
      throw Error("Use WGS84 longitude/latitude coordinates.");
    return [p[0], p[1]];
  }
  const delta = (a, b) => ((((b - a + 540) % 360) + 360) % 360) - 180;
  function distance(a, b, radius = R) {
    coordinate(a);
    coordinate(b);
    if (!Number.isFinite(radius) || radius <= 0)
      throw Error("Invalid navigation sphere radius.");
    const x = (b[1] - a[1]) * D,
      y = delta(a[0], b[0]) * D,
      h =
        Math.sin(x / 2) ** 2 +
        Math.cos(a[1] * D) * Math.cos(b[1] * D) * Math.sin(y / 2) ** 2;
    return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function interpolate(a, b, f) {
    coordinate(a);
    coordinate(b);
    if (!Number.isFinite(f) || f < 0 || f > 1)
      throw Error("Interpolation fraction must be between zero and one.");
    if (f === 0) return a.slice(0, 2);
    if (f === 1) return b.slice(0, 2);
    const angle = distance(a, b) / R;
    if (angle < 1e-12) return a.slice(0, 2);
    if (Math.PI - angle < 1e-7)
      throw Error("Add an intermediate waypoint for an antipodal leg.");
    const A = Math.sin((1 - f) * angle) / Math.sin(angle),
      B = Math.sin(f * angle) / Math.sin(angle),
      x =
        A * Math.cos(a[1] * D) * Math.cos(a[0] * D) +
        B * Math.cos(b[1] * D) * Math.cos(b[0] * D),
      y =
        A * Math.cos(a[1] * D) * Math.sin(a[0] * D) +
        B * Math.cos(b[1] * D) * Math.sin(b[0] * D),
      z = A * Math.sin(a[1] * D) + B * Math.sin(b[1] * D);
    return [Math.atan2(y, x) / D, Math.atan2(z, Math.hypot(x, y)) / D];
  }
  root.MT_NAV_MATH = { R, coordinate, delta, distance, interpolate };
})(typeof window === "undefined" ? globalThis : window);
