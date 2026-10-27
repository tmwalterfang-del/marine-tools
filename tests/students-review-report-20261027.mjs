// Full-register disposition: never promote unsupported notation to a machine pass.
import fs from "node:fs";
import vm from "node:vm";
import { checkRow, DimensionError } from "./lib/students-dimensions.mjs";
import crypto from "node:crypto";
const w = {},
  ctx = vm.createContext({ window: w });
for (const m of fs
  .readFileSync("students/index.html", "utf8")
  .matchAll(/src="([^"?]+\.js)/g)) {
  if (m[1] === "app.js") break;
  vm.runInContext(fs.readFileSync("students/" + m[1], "utf8"), ctx);
}
const baseline = JSON.parse(
    fs.readFileSync("tests/fixtures/dimensional-baseline-20261027.json"),
  ),
  basis = JSON.parse(
    fs.readFileSync("docs/STUDENTS_EXPRESSION_REVIEW_BASIS_2026-10-20.json"),
  );
const out = w.MT_STUDY.sourceEquationRegister.map((r) => {
  let dimension = "DIMENSIONAL_PASS",
    reason = "";
  try {
    checkRow(r);
  } catch (e) {
    dimension =
      e instanceof DimensionError
        ? "DIMENSIONAL_FAILURE"
        : "NOT_MACHINE_DIMENSION_VALIDATED";
    reason = e.message;
  }
  const chapter = r.chapter ?? 1;
  let disposition =
    dimension === "DIMENSIONAL_PASS"
      ? "DECLARED_UNIT_CONSISTENCY_ONLY"
      : chapter === 5 || r.formula.includes("→")
        ? "CHEMICAL_STRUCTURE_ACTIVITY_OR_STOICHIOMETRY"
        : /[∧∨¬⊕]/.test(r.formula)
          ? "BOOLEAN_ALGEBRA"
          : reason.startsWith("Explicit scale")
            ? "NUMERICAL_UNIT_CONVENTION"
            : r.formula.includes("KN(")
              ? "EXTERNAL_HYDROSTATIC_LOOKUP_CONTRACT"
              : /Σ|∫|integral|d\(|dC\/ds|dV_in|constant/.test(r.formula)
                ? "INDEXED_CALCULUS_OR_PARAMETERIZED_MODEL"
                : chapter === 1
                  ? "SYMBOLIC_MATH_GRAMMAR"
                  : r.id === "book-physics-p25-r03"
                    ? "TEMPERATURE_INTERVAL_CONVENTION"
                    : r.formula.includes(" over ")
                      ? "TIME_WINDOW_MODEL_DEFINITION"
                      : r.formula.includes(" for ")
                        ? "PIECEWISE_DOMAIN_MODEL"
                        : r.formula.includes("phon")
                          ? "PSYCHOACOUSTIC_REFERENCE_DEFINITION"
                          : r.id === "book-c13-p190-r02"
                            ? "ANGULAR_NUMERICAL_UNIT_CONVENTION"
                            : "REQUIRES_EXPLICIT_REVIEW";
  return {
    id: r.id,
    chapter,
    page: r.page,
    name: r.name,
    expression: r.formula,
    context_sha256: crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          formula: r.formula,
          conditions: r.conditions,
          symbols: r.symbols,
        }),
      )
      .digest("hex"),
    in_original_487: baseline.unparsedIDs.includes(r.id),
    dimension_status: dimension,
    disposition,
    parser_reason: reason,
    analytical_decision: r.analyticalReview.decision,
    numeric_status: r.numericStatus || "PENDING",
    symbolic_status: r.symbolicStatus || "PENDING",
    review_basis: basis[chapter][r.page],
    source_reread: "NO; existing source-reading record retained",
  };
});
if (
  out.some(
    (r) =>
      r.dimension_status === "DIMENSIONAL_FAILURE" ||
      r.disposition === "REQUIRES_EXPLICIT_REVIEW",
  )
)
  throw Error(
    "Unresolved disposition or dimensional contradiction: " +
      JSON.stringify(
        out
          .filter((r) => r.disposition === "REQUIRES_EXPLICIT_REVIEW")
          .map((r) => ({
            id: r.id,
            formula: r.expression,
            reason: r.parser_reason,
          })),
      ),
  );
const header = Object.keys(out[0]),
  cell = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
fs.writeFileSync(
  "docs/STUDENTS_REVIEW_FOLLOWUP_2026-10-27.csv",
  [header, ...out.map((r) => header.map((k) => r[k]))]
    .map((row) => row.map(cell).join(","))
    .join("\n") + "\n",
);
const counts = Object.fromEntries(
  [...new Set(out.map((r) => r.disposition))].map((k) => [
    k,
    out.filter((r) => r.disposition === k).length,
  ]),
);
console.log(
  JSON.stringify({
    rows: out.length,
    counts,
    original487NowParsed: out.filter(
      (r) => r.in_original_487 && r.dimension_status === "DIMENSIONAL_PASS",
    ).length,
  }),
);
