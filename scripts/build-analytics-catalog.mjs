import fs from "node:fs";
const files = [
  "app.js",
  "analytics-v856.js",
  "product-v860.js",
  "voyage-planning-draft-v1.js",
  "voyage-estimate-v861.js",
];
const titles = new Set(["Port Distance & Sea Time"]);
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(
    /\b(?:card|groupedCard)\('([^']+)'(?:,'([^']+)')?/g,
  ))
    titles.add(m[2] && m[0].startsWith("grouped") ? m[2] : m[1]);
  for (const m of text.matchAll(/<h3>([^<$]+)<\/h3>/g)) titles.add(m[1]);
  for (const m of text.matchAll(/data-tool-title="([^"$]+)"/g))
    titles.add(m[1]);
}
fs.writeFileSync(
  "worker/analytics-catalog.js",
  "// Static display titles only; never operational/user input. Regenerate with scripts/build-analytics-catalog.mjs.\nexport const toolTitles=new Set(" +
    JSON.stringify([...titles].sort()) +
    ");\n",
);
