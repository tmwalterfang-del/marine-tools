const fs = require("fs"),
  vm = require("vm"),
  assert = require("node:assert/strict"),
  w = {};
for (const p of ["navigation-math.js", "regulatory/spatial-core.js"])
  vm.runInNewContext(fs.readFileSync(p, "utf8"), w);
const G = w.MT_REGULATORY_GEO,
  N = w.MT_NAV_MATH,
  rect = (a, b, c, d) => ({
    type: "Polygon",
    coordinates: [
      [
        [a, b],
        [c, b],
        [c, d],
        [a, d],
        [a, b],
      ],
    ],
  }),
  options = { departure: "2026-12-31T23:00:00Z", speedKn: 60, stepNm: 2 };
let checks = 0;
const close = (a, b, tol = 1e-7) => {
  checks++;
  assert.ok(Math.abs(a - b) < tol * Math.max(1, Math.abs(b)), a + " != " + b);
};
// Synthetic fixtures test geometry only: no regulatory boundary is represented by a test rectangle.
const area = { id: "A", geometry: rect(0, -2, 10, 2) },
  over = { id: "B", geometry: rect(5, -2, 15, 2) };
assert.equal(G.classify([5, 0], area.geometry), "inside");
assert.equal(G.classify([0, 0], area.geometry), "boundary");
assert.equal(G.classify([-1, 0], area.geometry), "outside");
let z = G.analyze(
  [
    [-5, 0],
    [20, 0],
  ],
  [area, over],
  options,
);
close(z.totalNm, N.distance([-5, 0], [20, 0]));
close(
  z.segments.reduce((s, r) => s + r.distanceNm, 0),
  z.totalNm,
);
close(
  z.segments
    .filter((r) => r.areaIds.includes("A"))
    .reduce((s, r) => s + r.distanceNm, 0),
  N.distance([0, 0], [10, 0]),
);
assert.ok(z.segments.some((r) => r.areaIds.join(",") === "A,B"));
assert.ok(z.segments[0].areaIds.length === 0);
assert.ok(z.segments.at(-1).areaIds.length === 0);
const holed = rect(0, -5, 10, 5);
holed.coordinates.push(rect(2, -1, 4, 1).coordinates[0]);
assert.equal(G.classify([3, 0], holed), "outside");
assert.equal(G.classify([1, 0], holed), "inside");
z = G.analyze(
  [
    [-1, 0],
    [11, 0],
  ],
  [{ id: "hole", geometry: holed }],
  options,
);
close(
  z.segments
    .filter((r) => r.areaIds.includes("hole"))
    .reduce((s, r) => s + r.distanceNm, 0),
  N.distance([0, 0], [8, 0]),
);
const dateLine = {
  type: "Polygon",
  coordinates: [
    [
      [170, -10],
      [-170, -10],
      [-170, 10],
      [170, 10],
      [170, -10],
    ],
  ],
};
assert.equal(G.classify([179, 0], dateLine), "inside");
assert.equal(G.classify([-179, 0], dateLine), "inside");
assert.equal(G.classify([0, 0], dateLine), "outside");
z = G.analyze(
  [
    [160, 0],
    [-160, 0],
  ],
  [{ id: "D", geometry: dateLine }],
  options,
);
close(
  z.segments
    .filter((r) => r.areaIds.includes("D"))
    .reduce((s, r) => s + r.distanceNm, 0),
  N.distance([170, 0], [-170, 0]),
);
z = G.analyze(
  [
    [-1, 0],
    [5, 0],
    [-1, 0],
    [5, 0],
  ],
  [area],
  options,
);
assert.equal(z.segments.filter((r) => r.areaIds.includes("A")).length, 3);
assert.ok(z.segments.every((r) => Date.parse(r.exit) >= Date.parse(r.entry)));
close(z.totalHours, z.totalNm / 60);
z = G.analyze(
  [
    [-1, 0],
    [5, 0],
  ],
  [area],
  { ...options, transitions: ["2027-01-01T00:00:00Z"] },
);
assert.ok(z.segments.some((r) => r.exit === "2027-01-01T00:00:00.000Z"));
assert.ok(z.segments.some((r) => r.entry === "2027-01-01T00:00:00.000Z"));
const polar = {
  id: "antarctic",
  geometry: { type: "LatitudeBand", south: -90, north: -60 },
};
assert.equal(G.classify([179, -70], polar.geometry), "inside");
z = G.analyze(
  [
    [0, -59],
    [0, -61],
  ],
  [polar],
  options,
);
close(
  z.segments.find((r) => r.areaIds.length).distanceNm,
  N.distance([0, -60], [0, -61]),
);
const multi = {
  type: "MultiPolygon",
  coordinates: [rect(0, 0, 1, 1).coordinates, rect(5, 0, 6, 1).coordinates],
};
assert.equal(G.classify([5.5, 0.5], multi), "inside");
assert.equal(G.classify([3, 0.5], multi), "outside");
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [180, 0],
    ],
    [area],
    options,
  ),
);
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [1, 1],
    ],
    [area],
    { ...options, speedKn: 0 },
  ),
);
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [1, 1],
    ],
    [area],
    { ...options, departure: "2026-02-30T00:00:00Z" },
  ),
);
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [0, 0],
    ],
    [area],
    options,
  ),
);
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [200, 0],
    ],
    [area],
    options,
  ),
);
assert.throws(() =>
  G.analyze(
    [
      [0, 0],
      [1, 1],
    ],
    [area, area],
    options,
  ),
);
assert.equal(
  G.analyze(
    [
      [0, 0],
      [1, 1],
    ],
    [{ id: "missing" }],
    options,
  ).missingGeometry[0],
  "missing",
);
console.log(
  JSON.stringify({
    status: "PASS",
    numericChecks: checks,
    scope:
      "Exact synthetic intersections, holes, overlaps, repeated entries, legal latitude caps, dateline, temporal splits, WGS84 validation and consistent spherical distance/time.",
  }),
);
