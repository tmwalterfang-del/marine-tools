import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const w = {},
  ctx = vm.createContext({ window: w });
for (const m of fs
  .readFileSync("students/index.html", "utf8")
  .matchAll(/src="([^"?]+\.js)/g)) {
  if (m[1] === "app.js") break;
  vm.runInContext(fs.readFileSync("students/" + m[1], "utf8"), ctx);
}
const rows = w.MT_STUDY.sourceEquationRegister,
  by = new Map(rows.map((r) => [r.id, r]));
let checks = 0;
const near = (a, b, t = 1e-10) => {
  assert.ok(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)));
  checks++;
};
// Evaluate the shipped RHS with explicit variables; no second copied formula string.
function rhs(id, values) {
  const r = by.get(id),
    names = Object.keys(values).sort((a, b) => b.length - a.length);
  let text = r.formula.split(/=|≈/)[1],
    out = "";
  while (text.length) {
    const name = names.find((n) => text.startsWith(n));
    if (name) {
      out += "(" + values[name] + ")";
      text = text.slice(name.length);
      continue;
    }
    out += text[0];
    text = text.slice(1);
  }
  out = out
    .replaceAll("·", "*")
    .replaceAll("−", "-")
    .replaceAll("³", "**3")
    .replaceAll("²", "**2")
    .replaceAll("^", "**")
    .replaceAll("sqrt", "Math.sqrt");
  assert.ok(/^[\d\s.()+*/-]+$/.test(out.replaceAll("Math.sqrt", "")));
  return Function("return " + out)();
}
near(
  rhs("book-c11-p170-r01", {
    "ρ₁": 1,
    "p₁": 100000,
    "p₂": 200000,
    "T₁": 300,
    "T₂": 400,
  }),
  1.5,
);
near(rhs("book-c11-p169-r08", { "H₁": 20, "H₂": 5, "n₁": 2, "n₂": 1 }), 4);
near(rhs("book-c11-p169-r11", { "D₁": 2, "D₂": 1, "n₁": 2, "n₂": 1 }), 16);
near(rhs("book-c11-p169-r13", { n: 25, Q: 0.04, H: 16 }), 0.625);
near(rhs("book-c11-p168-r01", { v: 2, D_h: 0.1, ν: 1e-6 }), 200000);
near(rhs("book-c11-p170-r08", { C_v: 0.98, C_c: 0.62 }), 0.6076);
near(
  rhs("book-c11-p171-r04", {
    C_d: 0.6,
    ε_exp: 0.98,
    "A₂": 0.01,
    "ρ₁": 1000,
    "p₁": 120000,
    "p₂": 100000,
    β_d: 0.5,
  }),
  0.6 * 0.98 * 0.01 * Math.sqrt(40000000 / 0.9375),
);
near(
  rhs("book-c11-p173-r03", {
    φ_v: 0.9,
    "v₁": 100,
    "h₁": 3000000,
    "h₂s": 2950000,
  }),
  0.9 * Math.sqrt(110000),
);
near(rhs("book-c9-p146-r05", { Δ: 1000, v: 10, C_A: 1 }), 100000);
// Numerical-unit conventions are deliberately outside the homogeneous SI parser.
near(rhs("book-c6-p96-r01", { "d₁": 4, "d₂": 7, k: 2 }), 4700);
near(rhs("book-c6-p97-r01", { "d₁": 4, "d₂": 7, k: 2 }) * 1e-12, 4.7e-9);
near(
  rhs("book-c9-p138-r06", {
    V_m: 22.414,
    w_C: 1,
    w_H: 0,
    w_S: 0,
    w_O: 0,
    y_O2: 0.21,
  }),
  22.414 / (12 * 0.21),
);
near(
  rhs("book-c11-p156-r02", { T_C: 30, x: 0.01 }) * 1000,
  1000 * 30 + 0.01 * (2500000 + 1900 * 30),
);
for (const r of rows) {
  assert.ok(
    r.conditions.trim() &&
      r.symbols.every((s) => s.symbol && s.meaning && s.unit),
    r.id,
  );
  checks++;
}
for (const c of w.MT_STUDY.chapters) {
  assert.ok(rows.some((r) => (r.chapter ?? 1) === c.number));
  checks++;
}
const repaired = w.MT_STUDY.reviewFollowup.changedSymbolRows;
assert.equal(repaired.length, 12);
checks++;
assert.equal(
  rows.filter(
    (r) => r.analyticalReview.decision === "OPEN_MODEL_OR_SOURCE_LIMIT",
  ).length,
  6,
);
checks++;
for (const id of w.MT_STUDY.reviewFollowup.openReviewed) {
  assert.ok(by.get(id).analyticalReview.finding.includes("2026-10-27"));
  checks++;
}
console.log(
  JSON.stringify({
    status: "PASS",
    checks,
    chapters: 16,
    expressions: 1498,
    correctedSymbolRows: 12,
    openModels: 6,
    scope:
      "Full-register local-context integrity plus targeted independent numerical conventions; no claim of numerical proof for every expression.",
  }),
);
