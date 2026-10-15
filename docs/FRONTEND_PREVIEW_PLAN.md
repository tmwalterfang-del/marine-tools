# Permanent frontend preview — implementation plan (2026-10-15)

Status: design / setup pending. **This file does not activate any deployment.** Do not merge until approved.

## Current confirmed architecture
- The frontend is a static HTML/JS/CSS site served from the repository root; `index.html` is at root, no package.json build step.
- API is a separate Cloudflare Worker, with production custom domain `api.marinetools.app`; its `wrangler.jsonc` has Worker preview routing, which is **not** a frontend preview.
- Production source version on main: v8.6.1.
- PR #31 (`feature/voyage-planning-drafts`) is an unmerged draft with five planning prototypes.

## Recommended deployment arrangement
Create a **separate Cloudflare Pages project**, distinct from the current live production frontend project (if any), linked to GitHub repo `tmwalterfang-del/marine-tools`.

Proposed project name: `marine-tools-frontend-preview` (subject to availability); expected host after creation: `marine-tools-frontend-preview.pages.dev` (not live/verified).

Cloudflare Pages settings:
- Framework preset: None / static HTML.
- Repository: `tmwalterfang-del/marine-tools`.
- Root directory: repository root.
- Build command: `exit 0` (or blank if Pages accepts no build).
- Build output directory: `.` (repository root; confirm Pages accepts this; fallback to a copy-to-`dist` build script if necessary).
- Production branch for this **preview-only project**: select `main` for baseline, but **never attach marinetools.app or any existing production custom domain to it**.
- Preview branch deployments: All non-production branches, or explicit `feature/*` filters. Test PR #31.
- Auto production branch deployments on this **separate preview project** may be disabled once initial baseline is deployed, to avoid confusion; this does not alter the existing live project.
- Branch aliases should provide a stable host for each development branch; retrieve the actual URL from Cloudflare / GitHub before sharing it.

## Safeguards and QA gates
1. Preview must be labeled visually as preview (a separate, preview-only banner is preferred; design must not leak to main).
2. Avoid indexation: `X-Robots-Tag: noindex, nofollow` via Pages project-specific Cloudflare rules (not common code affecting main); verify response headers. Access protection can be added through Cloudflare Access where appropriate.
3. Avoid sending test analytics into real production analytics. Audit `analytics-v856.js` and API logging before testing; either gate preview origins or use a separate test dataset/worker. Do not claim isolation without verifying it.
4. API compatibility: the frontend currently points to `https://api.marinetools.app`; identify any origin allowlists/CORS and ensure preview does not run unsafe production writes. Prefer sandboxed API for tests that write state.
5. PWA/service worker: review `sw.js` and install/cache behavior for preview hosts; avoid pollution of installed production PWA. Consider disabling SW on preview without breaking offline-related tests.
6. Add smoke checks: GET root HTTP 200; required CSS/JS assets 200; no broken deep routes; no unwanted redirects to production; correct preview banner/robots header/analytics behavior.
7. Browser QA desktop, tablet and mobile; Dark Maritime and Bridge Dark; navigation; five Voyage Planning Lab prototypes; copy/print; localStorage; online/offline.
8. Never merge without explicit approval; do not change production DNS, routes, Pages project or Worker deployments during setup without a separate approval.

## Sequence
A. In Cloudflare Dashboard > Workers & Pages > Create application > Pages > Connect to Git, authorize this repository.
B. Configure dedicated preview project as above; verify initial root page and assets.
C. Commit a targeted `preview-environment` detector/banner and analytics guard on a dedicated feature branch, after reviewing existing analytics and service-worker code.
D. Validate the PR #31 preview URL against desktop/mobile QA.
E. Record working URLs, settings, and rollback steps in this document.

## Open checks
- Which Cloudflare Pages project currently serves `marinetools.app`? Confirm before using a custom domain.
- Whether output directory `.` is accepted by Pages in this repo. If not, stage static files to `dist/`.
- Existing Cloudflare production CORS/origin restrictions and what analytics records preview usage.
- Whether static assets and subdirectory pages need special build/output filtering.

References:
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/pages/configuration/branch-build-controls/
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
