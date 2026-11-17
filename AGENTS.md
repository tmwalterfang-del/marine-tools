# Working rules for coding agents

This file is read by OpenAI Codex (`AGENTS.md`) and by Claude (through `CLAUDE.md`). Both agents work in this repository, so these rules are shared. If a task instruction conflicts with this file, ask the owner before acting.

## What this repository is

- Marine Tools: a static web app (no build step) served from the repository root. It runs on GitHub Pages and Cloudflare, behind the custom domain in `CNAME`.
- `index.html` + `app.js` hold the main calculators. `students/` holds Education (interactive models, calculators, practice bank). `workspace*.js` holds the browser workspace.
- `worker/` holds the Cloudflare Worker (API, AIS/weather proxy, analytics). `apps/` holds native app wrappers (Capacitor Android/iOS, Tauri desktop); see `apps/README.md`.
- The repository is **public**. Never commit secrets, signing material, private preview URLs or personal data.

## Branches and pull requests

- **Never push to `main`.** Work on a branch and open a draft pull request. The owner reviews and merges.
- Branch prefixes: `codex/…` for Codex, `claude/…` for Claude, `feature/…` or `fix/…` for the owner. Do not commit to another agent's open branch unless the owner asks.
- One topic per pull request. State clearly in the description what was tested, what was not, and what still needs manual acceptance.
- Internal handovers, audit reports and working notes stay local (`docs/`, `.local-internal/` and the other paths in `.gitignore`). Do not add them back to Git.

## User data must survive every change

- Do not rename or reshape existing `localStorage` keys, saved drafts, history entries, backup JSON or CSV export columns. If a format must change, keep reading the old one.
- Language switching changes presentation only. Inputs, raw values, IDs, units and exports stay identical. User-written titles, notes and imported data are never translated.
- CSV and JSON exports keep machine format (decimal point). Norwegian display uses a decimal comma.

## Numbers and language

- Read numeric inputs with the shared comma-aware parsers (`inputNumber()` in `app.js`, `MT_PARSE_NUMBER` from `product-ux-20261031.js`). Never use `+el.value`, `Number(el.value)` or `parseFloat(el.value)` directly. `"8,5"` must equal `8.5`, and a blank field is invalid, not zero.
- English strings live in the code. Norwegian (`nb`) translations live in `language-*.js` catalogues. Add the Norwegian string in the same pull request as the English one.
- Layouts must work at 320 px width in both languages, because long Norwegian compounds overflow easily.

## Calculations and Education content

- Every new or changed formula needs an independent reference case: a hand calculation or a named primary source, with tolerance and valid range. A test that re-runs the same code is not independent.
- Do not reintroduce the historical models that are explicitly excluded from supported calculation.
- Keep attribution files (`students/*_ATTRIBUTION.md`) and stated model limitations. Results are planning and calculation aids, not approved navigation or class-approved calculations.

## Service worker and releases

- `sw.js` `CACHE` is asserted by `tests/qa-preview-isolation-20261016.mjs` and `tests/qa-release-metadata-20261018.mjs`. When you change the cache name, update those tests and the release metadata in the same commit.
- Every file in the offline `SHELL` list must exist. A single missing file makes the whole service-worker install fail.
- Account, class and live-data content must never be added to the offline cache.

## Tests

- CI lives in `.github/workflows/`. The main suite is `students-formula-audit.yml`; it filters on paths, so add new files to `paths:` when needed.
- Browser tests run in Chromium, Firefox and WebKit: `node tests/<name>.cjs chromium|firefox|webkit`. They need `playwright@1.62.1`, `jsdom@26.1.0` and `axe-core@4.11.1` on `NODE_PATH`. The formula tests need Python with `sympy==1.14.0`.
- A pull request is not ready while CI is red. Do not weaken or delete an existing assertion to make CI pass without explaining why in the pull request.

## Never report as passed without evidence from the owner

Physical Android/iOS devices, screen readers (TalkBack/VoiceOver/NVDA), real accounts and classes, real LMS/Moodle import and real AIS/weather providers. Simulated or emulated runs do not count as acceptance for these.
