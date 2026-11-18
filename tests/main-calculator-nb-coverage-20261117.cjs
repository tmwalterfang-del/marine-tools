// CI check: every literal Show working label, note, validity text and word-based unit has a Norwegian catalogue entry (AGENTS.md).
// Checks that every literal label/validity/note string in setWork calls has a Norwegian catalogue entry.
const fs = require("fs");
const path = require("path"), root = path.resolve(__dirname, ".."), assert = require("assert/strict");
const [appFile, uiFile, langFile] = ["app.js", "ui-v854.js", "language-main-20261031.js"].map((f) => path.join(root, f));
global.window = {};
require(langFile);
const cat = window.MT_LOCALE_CATALOGUES.main.strings;
const common = (() => { try { global.window = { MT_LOCALE_CATALOGUES: {} }; require(langFile.replace("main", "common")); return window.MT_LOCALE_CATALOGUES.common.strings || {}; } catch { return {}; } })();
const src = fs.readFileSync(appFile, "utf8") + "\n" + fs.readFileSync(uiFile, "utf8");
const calls = [];
for (const m of src.matchAll(/(?:setWork|MT_SET_WORK\?\.)\(/g)) {
  let i = m.index + m[0].length, depth = 1, q = null;
  for (; i < src.length && depth; i++) { const c = src[i]; if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; } if (c === "'" || c === '"' || c === "`") q = c; else if (c === "(") depth++; else if (c === ")") depth--; }
  calls.push(src.slice(m.index, i));
}
const missing = new Set();
const units = new Set();
for (const c of calls) {
  // Single- or double-quoted literals.
  for (const m of c.matchAll(/(?:label|note):(['"])((?:(?!\1)[^\\]|\\.)*)\1/g)) { const s = m[2].replace(/\\(['"])/g, "$1"); if (!cat[s] && !common[s]) missing.add("label/note: " + s); }
  for (const m of c.matchAll(/note:[^,}]*\?'((?:[^'\\]|\\.)*)':'((?:[^'\\]|\\.)*)'/g)) for (const s of [m[1], m[2]]) if (!cat[s] && !common[s]) missing.add("note: " + s);
  const v = c.match(/validity:\[([\s\S]*?)\]\s*[})]/);
  if (v) for (const m of v[1].matchAll(/(['"])((?:(?!\1)[^\\]|\\.)*)\1/g)) { const s = m[2].replace(/\\(['"])/g, "$1"); if (!cat[s] && !common[s]) missing.add("validity: " + s); }
  for (const m of c.matchAll(/unit:'([^']*)'/g)) units.add(m[1]);
}
console.log("setWork calls:", calls.length);
console.log("missing nb:", missing.size);
for (const s of missing) console.log("  " + s);
const wordUnits = [...units].filter((u) => /[a-z]{3,}/i.test(u) && !cat[u] && !common[u]);
console.log("units with words lacking nb:", wordUnits.join(" | ") || "none");
// Symbol-only units are identical in Norwegian.
const SAME = new Set(["rad/s", "rad/m", "bar", "kVA", "kVAr"]);
const realWordUnits = wordUnits.filter((u) => !SAME.has(u));
// Reference, range and checking-method sentences shown in the panel.
global.window = {};
require(path.join(root, "calc-references-20261117.js"));
const refMissing = [];
for (const [tool, r] of Object.entries(window.MT_CALC_REFERENCES)) for (const k of ["basis", "range", "tolerance"]) if (r[k] && !cat[r[k]] && !common[r[k]]) refMissing.push(tool + "." + k);
assert.equal(refMissing.length, 0, "reference sentences without Norwegian: " + refMissing.length + " e.g. " + refMissing.slice(0, 5).join(", "));
assert.ok(calls.length >= 40, "expected the Show working calls to be found: " + calls.length);
assert.equal(missing.size, 0, "missing Norwegian strings: " + [...missing].join(" | "));
assert.equal(realWordUnits.length, 0, "units without Norwegian: " + realWordUnits.join(" | "));
console.log(JSON.stringify({ status: "PASS", setWorkCalls: calls.length, referenceTools: Object.keys(window.MT_CALC_REFERENCES).length }));
