# Education: readable mechanics examples — 27 October 2026

This preview follow-up is based on Education PR #35 at `00346882550b7d21ddfc04cc7f0d6d3d677a2391`. It remains separate from main and production.

Learners can select **With worked examples** to find three formula families with ten new examples: rolling resistance force/coefficient, uniform-pressure pivot torque, gear reduction by diameter/teeth/speed, ideal compound-hoist force gain, and circular-pitch/module relationships. Each example shows given values, units, a physical/geometrical explanation and a result. A card action opens the examples and moves keyboard focus to the first one. Search and saved-only filters combine; chapter, library and symbol destinations clear the example filter so it cannot conceal the destination.

The learner data is generated from the independent worked-case fixture. CI checks the generated copy for exact agreement. Each numerical case remains bound to the SHA-256 digest of its expression, assumptions and local symbol definitions. Only the ten newly covered rows change numeric evidence status. Existing formula text, review decisions and source-reading records are retained; no source images or book examples were copied or reread in this pass.

There are now **319 selected numeric cases for 309 expressions across all 16 chapters**, up from 309 cases / 299 expressions. **979 expressions still have numeric PENDING status.** These cases do not establish full-domain validity. The six unresolved historical models remain reference only. Dimensional results remain 1,346 passes and 152 individually classified special grammars.

The gear geometry examples use the definitions of module and circular pitch described by gear manufacturer KG Stock Gears in its [Technical Data, fundamental dimensions](https://www.kggear.co.jp/en/wp-content/themes/bizvektor-global-edition/pdf/TechnicalData_KGSTOCKGEARS.pdf), printed page 13: the pitch-circle circumference is shared by the tooth count, and module is diameter divided by tooth count. Numerical inputs and explanations here are independently authored.

Validation completed locally:

- 319 independent worked cases, generated-data parity and both 1,498-row review ledgers.
- Catalogue smoke (247 checks), mechanics audit (338 checks), all-chapter integrity (21,345 checks), dimensional follow-up and assumption/context follow-up (1,535 checks).
- New DOM integration: inputs/units/results, assumptions, six unresolved models excluded, filter intersections, saved sheet, destination resets, keyboard focus and HTML escaping.
- Existing interface smoke, chapter navigation, symbol navigation and study export tests.
- New real-browser interactions in Chromium (Microsoft Edge), Firefox and WebKit at 1,440, 390 and 320 pixels: no horizontal page/example overflow, keyboard expansion, focus, search, library reset and chapter reset. Mobile screenshot reviewed. Screenshots are local QA artifacts, not source assets.

The existing Education CI now runs the generated-data check and new DOM/browser tests. Remote CI results are tracked in the follow-up Draft PR. No main merge, production publication or app-store submission is part of this change.
