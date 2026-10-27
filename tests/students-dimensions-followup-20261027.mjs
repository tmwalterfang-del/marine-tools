import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import {
  checkRow,
  DimensionError,
  parse,
  U,
  equal,
} from "./lib/students-dimensions.mjs";
const w = {},
  ctx = vm.createContext({ window: w });
for (const m of fs
  .readFileSync("students/index.html", "utf8")
  .matchAll(/src="([^"?]+\.js)/g)) {
  if (m[1] === "app.js") break;
  vm.runInContext(fs.readFileSync("students/" + m[1], "utf8"), ctx);
}
const results = [];
for (const r of w.MT_STUDY.sourceEquationRegister) {
  let outcome = "DIMENSIONAL_PASS",
    reason = "";
  try {
    checkRow(r);
  } catch (e) {
    outcome =
      e instanceof DimensionError
        ? "DIMENSIONAL_FAILURE"
        : "SPECIAL_REVIEW_REQUIRED";
    reason = e.message;
  }
  results.push({
    id: r.id,
    chapter: r.chapter ?? 1,
    page: r.page,
    formula: r.formula,
    outcome,
    reason,
  });
}
const counts = Object.fromEntries(
  ["DIMENSIONAL_PASS", "DIMENSIONAL_FAILURE", "SPECIAL_REVIEW_REQUIRED"].map(
    (x) => [x, results.filter((r) => r.outcome === x).length],
  ),
);
if (process.argv[2])
  fs.writeFileSync(
    process.argv[2],
    JSON.stringify({ counts, results }, null, 2) + "\n",
  );
console.log(
  JSON.stringify({
    counts,
    failures: results.filter((x) => x.outcome === "DIMENSIONAL_FAILURE"),
  }),
);
assert.ok(equal(parse("2log10(10)", {}), U.dimensionless));
assert.ok(
  equal(
    parse("ρgh", {
      ρ: U.kg.map((x, i) => x - (i === 1 ? 3 : 0)),
      g: U.m.map((x, i) => x - (i === 2 ? 2 : 0)),
      h: U.m,
    }),
    U.Pa,
  ),
);
assert.throws(() => parse("m+s", U), DimensionError);
assert.throws(() => parse("log10(m)", U), DimensionError);
assert.throws(() => parse("sin(m)", U), DimensionError);

assert.equal(
  counts.DIMENSIONAL_FAILURE,
  0,
  "No dimensional contradictions in parsed rows",
);
assert.ok(counts.DIMENSIONAL_PASS >= 1346, "Parser coverage regression");
const baseline = JSON.parse(
  fs.readFileSync("tests/fixtures/dimensional-baseline-20261027.json"),
);
assert.equal(baseline.unparsedIDs.length, 487);
assert.equal(results.length, 1498);
for (const c of Array.from({ length: 16 }, (_, i) => i + 1))
  assert.ok(results.some((r) => r.chapter === c));
const gained = results.filter(
  (r) =>
    baseline.unparsedIDs.includes(r.id) && r.outcome === "DIMENSIONAL_PASS",
).length;
assert.ok(gained >= 335, "Coverage of the original 487 gaps must not regress");
assert.throws(() => parse("KN(θ,Δ,trim)", {θ:U.rad,Δ:U.t,trim:U.s}), DimensionError);
assert.throws(() => parse("KN(θ,Δ,trim)", {θ:U.m,Δ:U.t,trim:U.m}), DimensionError);
assert.throws(() => parse("KN(θ,Δ)", {θ:U.rad,Δ:U.t}));
const bending = w.MT_STUDY.sourceEquationRegister.find(r=>r.id==='book-c14-p214-r02');
assert.throws(()=>checkRow({...bending,symbols:bending.symbols.map(s=>s.symbol==='V'?{...s,unit:'m'}:s)}),DimensionError);
assert.throws(()=>checkRow({...bending,formula:bending.formula+'+x'}));
