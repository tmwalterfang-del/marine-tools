// Strict formula-local dimension algebra. Never evaluate arbitrary JS.
// Mass, length, time, temperature, current, amount, currency, luminous intensity,
// followed by abstract sequence/vector dimensions. Angles/counts are dimensionless;
// their numerical scale and affine temperature offsets require separate checks.
export const Z = Array(10).fill(0),
  u = (...x) => [...x, ...Z].slice(0, 10);
export const U = {
  dimensionless: Z,
  rad: Z,
  "°": Z,
  "rad or °": Z,
  rev: Z,
  "%": Z,
  percent: Z,
  sr: Z,
  dB: Z,
  period: Z,
  "°F": u(0, 0, 0, 1),
  "°R": u(0, 0, 0, 1),
  kg: u(1),
  t: u(1),
  g: u(1),
  m: u(0, 1),
  cm: u(0, 1),
  mm: u(0, 1),
  NM: u(0, 1),
  s: u(0, 0, 1),
  h: u(0, 0, 1),
  K: u(0, 0, 0, 1),
  "°C": u(0, 0, 0, 1),
  A: u(0, 0, 0, 0, 1),
  mol: u(0, 0, 0, 0, 0, 1),
  currency: u(0, 0, 0, 0, 0, 0, 1),
  cd: u(0, 0, 0, 0, 0, 0, 0, 1),
  N: u(1, 1, -2),
  Pa: u(1, -1, -2),
  bar: u(1, -1, -2),
  J: u(1, 2, -2),
  W: u(1, 2, -3),
  Wh: u(1, 2, -2),
  V: u(1, 2, -3, 0, -1),
  Ω: u(1, 2, -3, 0, -2),
  S: u(-1, -2, 3, 0, 2),
  C: u(0, 0, 1, 0, 1),
  F: u(-1, -2, 4, 0, 2),
  pF: u(-1, -2, 4, 0, 2),
  H: u(1, 2, -2, 0, -2),
  Wb: u(1, 2, -2, 0, -1),
  T: u(1, 0, -2, 0, -1),
  min: u(0, 0, 1),
  day: u(0, 0, 1),
  year: u(0, 0, 1),
  L: u(0, 3),
  kmol: u(0, 0, 0, 0, 0, 1),
  kJ: u(1, 2, -2),
  kWh: u(1, 2, -2),
  kn: u(0, 1, -1),
  Hz: u(0, 0, -1),
  var: u(1, 2, -3),
  VA: u(1, 2, -3),
  lm: u(0, 0, 0, 0, 0, 0, 0, 1),
  lx: u(0, -2, 0, 0, 0, 0, 0, 1),
  "sequence unit": u(0, 0, 0, 0, 0, 0, 0, 0, 1),
  "vector unit": u(0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
};
export const equal = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);
const plus = (a, b, k = 1) => a.map((v, i) => v + k * b[i]),
  scale = (a, n) => a.map((v) => v * n);
export class DimensionError extends Error {}
function same(a, b) {
  if (!equal(a, b))
    throw new DimensionError("Incompatible dimensions: " + a + " versus " + b);
}
const sup = {
  "⁻": "-",
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  ⁿ: "n",
};
const funcs = [
  "KN",
  "sum",
  "wrap2π",
  "wrap360",
  "wrap180",
  "log10",
  "atan2",
  "sqrt",
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "asin",
  "acos",
  "atan",
  "exp",
  "ln",
  "abs",
  "max",
  "min",
  "mean",
];
export function parse(text, vars) {
  text = text.replaceAll("log₁₀", "log10").replaceAll("Σ", "sum");
  const names = Object.keys(vars).sort((a, b) => b.length - a.length),
    tokens = [];
  // Read longest declared symbols before separating adjacent quantities. Function
  // names take precedence, so log10/atan2 do not become implicit log*10 or atan*2.
  for (let i = 0; i < text.length; ) {
    const rest = text.slice(i),
      c = text[i];
    if (/\s/u.test(c)) {
      i++;
      continue;
    }
    let name = funcs.find(
      (n) =>
        rest.startsWith(n) &&
        (!Object.hasOwn(vars, n) || /[([]/.test(rest[n.length] || "")),
    );
    if (name) {
      tokens.push({ fn: name });
      i += name.length;
      continue;
    }
    name = names.find((n) => rest.startsWith(n));
    if (name) {
      tokens.push({ dim: vars[name], name });
      i += name.length;
      continue;
    }
    const num = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (num) {
      tokens.push({ num: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const power = rest.match(/^[⁻⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+/);
    if (power) {
      tokens.push("^", "(");
      const p = [...power[0]].map((x) => sup[x]).join("");
      if (p === "n") tokens.push({ dim: vars.n ?? Z, name: "n" });
      else if (p === "-n") tokens.push("-", { dim: vars.n ?? Z, name: "n" });
      else tokens.push({ num: Number(p) });
      tokens.push(")");
      i += power[0].length;
      continue;
    }
    if (c === "°") {
      tokens.push({ num: 1 });
      i++;
      continue;
    }
    if (c === "π" || c === "e") {
      tokens.push({ num: c === "π" ? Math.PI : Math.E });
      i++;
      continue;
    }
    if (c === "√") {
      tokens.push({ fn: "sqrt" });
      i++;
      continue;
    }
    if ("+-−*/·()[]^,|".includes(c)) {
      tokens.push({ "−": "-", "·": "*", "[": "(", "]": ")" }[c] || c);
      i++;
      continue;
    }
    throw Error("Unrecognized notation near " + rest.slice(0, 24));
  }
  let i = 0;
  const val = (d, n = null, zero = false) => ({ d, n, zero }),
    isZero = (a) => a.zero;
  function atom() {
    const t = tokens[i++];
    if (t === "(") {
      const a = expr();
      if (tokens[i++] !== ")") throw Error("Unclosed group");
      return a;
    }
    if (t === "|") {
      const a = expr(true);
      if (tokens[i++] !== "|") throw Error("Unclosed magnitude");
      return a;
    }
    if (t === "+" || t === "-") {
      const a = power();
      return val(a.d, a.n === null ? null : t === "-" ? -a.n : a.n, a.zero);
    }
    if (t?.dim) return val(t.dim);
    if (t?.num !== undefined) return val(Z, t.num, t.num === 0);
    if (t?.fn) {
      let exponent = null;
      if (tokens[i] === "^") {
        i++;
        exponent = atom();
        same(exponent.d, Z);
        if (exponent.n === null) throw Error("Function power must be numeric");
      }
      let a, b, third;
      if (tokens[i] === "(") {
        i++;
        a = expr();
        if (tokens[i] === ",") {
          i++;
          b = expr();
        }
        if (tokens[i] === ",") {
          i++;
          third = expr();
        }
        if (tokens[i++] !== ")") throw Error("Unclosed function");
      } else a = power();
      let result;
      if (t.fn === "KN") {
        if (!b || !third) throw Error("KN requires heel, displacement and trim");
        same(a.d, Z); same(b.d, U.t); same(third.d, U.m);
        result = val(U.m);
      } else if (third) throw Error("Unexpected third function argument");
      else if (t.fn === "sqrt") result = val(scale(a.d, 0.5));
      else if (["abs", "mean", "sum"].includes(t.fn)) result = a;
      else if (["max", "min"].includes(t.fn)) {
        if (!b) throw Error("Two arguments required");
        if (!isZero(a) && !isZero(b)) same(a.d, b.d);
        result = isZero(a) ? b : a;
      } else if (t.fn === "atan2") {
        if (!b) throw Error("atan2 requires two arguments");
        same(a.d, b.d);
        result = val(Z);
      } else {
        same(a.d, Z);
        result = val(Z);
      }
      return exponent ? val(scale(result.d, exponent.n)) : result;
    }
    throw Error("Expected quantity");
  }
  function power() {
    let a = atom();
    if (tokens[i] === "^") {
      i++;
      const b = power();
      same(b.d, Z);
      if (b.n === null) {
        if (!equal(a.d, Z))
          throw Error(
            "Variable exponent needs explicit parameterized dimensional basis",
          );
        a = val(Z);
      } else a = val(scale(a.d, b.n), a.n === null ? null : a.n ** b.n);
    }
    return a;
  }
  const primary = (t) =>
    t &&
    t !== ")" &&
    t !== "," &&
    t !== "+" &&
    t !== "-" &&
    t !== "*" &&
    t !== "/" &&
    t !== "^" &&
    t !== "|";
  function product(stopBar = false) {
    let a = power();
    while (tokens[i] === "*" || tokens[i] === "/" || primary(tokens[i])) {
      const op = tokens[i] === "*" || tokens[i] === "/" ? tokens[i++] : "*",
        b = power();
      a = val(
        plus(a.d, b.d, op === "/" ? -1 : 1),
        a.n === null || b.n === null
          ? null
          : op === "/"
            ? a.n / b.n
            : a.n * b.n,
      );
    }
    return a;
  }
  function expr(stopBar = false) {
    let a = product(stopBar);
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++],
        b = product(stopBar);
      if (!isZero(a) && !isZero(b)) same(a.d, b.d);
      a = val(
        isZero(a) ? b.d : a.d,
        a.n === null || b.n === null
          ? null
          : op === "+"
            ? a.n + b.n
            : a.n - b.n,
        isZero(a) && isZero(b),
      );
    }
    return a;
  }
  const a = expr();
  if (i !== tokens.length) throw Error("Unconsumed notation");
  return a.d;
}
export function unit(text) {
  text = text.replace(/ dry air/g, "");
  if (U[text]) return U[text];
  return parse(text, U);
}
export function dimensions(row) {
  const vars = {};
  for (const s of row.symbols) {
    const d = unit(s.unit);
    for (const n of [s.symbol, ...s.symbol.split(",")]) {
      vars[n.trim()] = d;
      if (n.trim().startsWith("Σ")) vars[n.trim().slice(1)] = d;
    }
  }
  return vars;
}
export function checkRow(row) {
  const vars = dimensions(row);
  // Dimensional calculus only: the measure contributes its own dimension.
  // These exact source grammars are not evaluated as numerical quotients or
  // rectangular integrals. Changed/unknown calculus notation remains unparsed.
  const calculus = {
    "book-c7-p112-r01": [
      "V_out(t) = V_out(t₀)−(1/(R·C))·∫[t₀,t] V_in(τ)dτ",
      "V_out = V_out−(1/(R·C))·V_in·τ",
    ],
    "book-c7-p112-r02": ["V_out = −R·C·dV_in/dt", "V_out = −R·C·V_in/t"],
    "book-c13-p191-r05": ["abs(dC/ds) = abs(tan(φ)·sin(C))/R", "abs(C/s) = abs(tan(φ)·sin(C))/R"],
    "book-c14-p214-r01": ["V(x) = integral₀ˣ(q_w−q_b)·dx", "V = (q_w−q_b)·x"],
    "book-c14-p214-r02": ["M(x) = integral₀ˣV(ξ)·dξ", "M = V·ξ"],
  }[row.id];
  if (calculus) {
    if (row.formula !== calculus[0]) throw Error("Changed calculus notation requires renewed dimensional review");
    row = {...row, formula: calculus[1]};
  }
  if (row.id === "book-c7-p111-r04")
    row = { ...row, formula: row.formula.replace("H(s)", "H") };
  if (
    [
      "book-c6-p96-r01",
      "book-c6-p97-r01",
      "book-c9-p138-r06",
      "book-c13-p189-r04",
      "book-c13-p189-r05",
      "book-c13-p194-r03",
      "book-c11-p156-r02",
    ].includes(row.id) ||
    /^book-physics-p24-r(?:08|09|10|11|12|13)$/.test(row.id)
  )
    throw Error(
      "Explicit scale/affine-unit convention: independent numerical conversion test required",
    );
  if (
    /∫|integral|⇌|→|\bfor\b| over |\bconstant\b|∧|∨|¬|⊕|≡/.test(row.formula) ||
    ["CHEMICAL_PATTERN", "REACTION", "BOOLEAN", "IDENTITY"].includes(row.kind)
  )
    throw Error("Special symbolic, chemical, indexed or piecewise grammar");
  row = {
    ...row,
    formula: row.formula
      .replace(/, k=1…3/g, "")
      .replace(/, j=1…n/g, "")
      .replace(/,n≥2/g, ""),
  };
  const parts = row.formula.split(";");
  for (const part of parts) {
    const sides = part.split(/=|≈/);
    if (sides.length < 2) throw Error("No equality");
    const dims = sides
      .filter((x) => x.trim() !== "0")
      .map((x) => parse(x, vars));
    for (const d of dims.slice(1)) same(dims[0], d);
    if (dims.length === 1 && sides.length === 2) {
      /* Homogeneous zero balance: every additive term has already been checked. */
    }
  }
  return true;
}
