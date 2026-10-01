# Deploy / update M/OPS on marinetools.app

This guide assumes the existing architecture:

- `marinetools.app` → GitHub Pages
- `api.marinetools.app` → Cloudflare Worker
- domain registered / DNS managed in Cloudflare

## A. Back up the current GitHub site

Before replacing files:

1. Open the `marine-tools` repository on GitHub.
2. Confirm the current `main` branch is deployed.
3. Do **not** delete the existing `CNAME` file.
4. Optionally download the current repository as a ZIP.

The existing `CNAME` should continue to contain:

```text
marinetools.app
```

## B. Update the front-end

Unzip the M/OPS package.

Upload these files/folders to the **root** of the GitHub repository:

```text
index.html
styles.css
app.js
manifest.webmanifest
sw.js
assets/
README.md
DEPLOY.md
LICENSE
.gitignore
worker/
```

Important:
- `index.html` must be at repository root.
- `assets/` must be a folder at repository root.
- keep your existing `CNAME`.
- there must not be an extra enclosing folder such as `mops-marine-operations-workspace/`.

### GitHub web UI

1. Repository → **Add file → Upload files**
2. Drag in the replacement root files.
3. Upload the `assets` files into `/assets`.
4. Commit directly to `main` (or use a branch if preferred).
5. Wait for the GitHub Pages deployment.

A suitable commit message:

`Rebrand Marine Tools to M/OPS and add operations workspace`

## C. Verify GitHub Pages

Open:

`https://marinetools.app`

Then hard-refresh:

- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- macOS: `Cmd + Shift + R`

Check:
- M/OPS branding is shown.
- light theme is default for a new browser.
- sidebar navigation works.
- Passage Planner opens.
- map loads.
- Vessel Profiles opens.
- local vessel profile can be saved.
- a route can be saved.
- a voyage can be created.
- Quick Tools calculate.

## D. Update the Cloudflare Worker

The new `worker/worker.js` adds:
- `/api/health`
- `/api/ais/latest`
- `/api/forecast`
- optional AIS geographic filtering from the front-end

Cloudflare:

1. **Workers & Pages**
2. Open `marine-tools-api`
3. Edit code
4. Replace the Worker code with `worker/worker.js`
5. Deploy

## E. Required Cloudflare Worker secrets

Under the Worker:

**Settings → Variables and Secrets**

Production should contain:

```text
BW_AIS_CLIENT_ID
BW_AIS_CLIENT_SECRET
BW_API_CLIENT_ID
BW_API_CLIENT_SECRET
```

Mark all four as **Secret**.

Never place their values in:
- GitHub
- `app.js`
- `worker.js`
- README files
- screenshots

If you currently only have the AIS client, the AIS endpoints can be configured first. The forecast endpoint will need the separate normal BarentsWatch API client.

## F. Test the API

Test:

```text
https://api.marinetools.app/api/health
```

Expected:

```json
{"status":"ok","service":"M/OPS API"}
```

Then, after AIS secrets are configured:

```text
https://api.marinetools.app/api/ais/latest
```

This can return a large JSON array if no geographic filter is supplied.

The M/OPS Route Intelligence page asks the Worker for a bounding box around the planned route so the Worker can submit a geometry filter to BarentsWatch.

## G. Live navigation warnings

M/OPS loads official Kystverket warning records from:

```text
https://api.kystverket.no/data/navigationwarnings/coastal/
https://api.kystverket.no/data/navigationwarnings/navareaxix/
```

If a browser/network prevents a live request, M/OPS reports that the request failed. It does not label demonstration data as live.

## H. BarentsWatch forecast status

The UI and route-intelligence data model support:

- wave height
- wind
- sea current

The Worker includes a safe `/api/forecast` adapter.

It currently returns `null` forecast values after authenticating rather than guessing the API request or generating synthetic live values.

Before activating this for operational use, wire the current BarentsWatch point endpoints documented in their current OpenAPI:
- wave forecast point nearest/all
- wind forecast point nearest/all
- sea-current nearest/all

## I. PWA / installable site

The package includes:

```text
manifest.webmanifest
sw.js
assets/icon-192.png
assets/icon-512.png
```

Because `marinetools.app` runs over HTTPS, supported browsers can offer installation as an app.

The service worker caches only the local application shell. Live AIS, warnings and weather still require a network connection.

## J. Existing local data

The rebrand uses new `mops_*` local-storage keys.

Your old Marine Tools local browser settings are not automatically migrated.

Use **Settings → Export all local data** after you start using M/OPS to keep a portable backup.

## K. Recommended test sequence

1. API health
2. Create vessel profile
3. Add vessel tanks
4. Create passage with 3+ waypoints
5. Save route
6. Export GPX
7. Export RTZ
8. Create voyage
9. Print passage report
10. Run Route Intelligence
11. Load Kystverket warnings
12. Test CPA/TCPA
13. Test UKC
14. Run Bunker Distribution
15. Run BDN check
16. Generate ORB draft
17. Test engineering calculators
18. Switch light → dark → bridge theme
19. Test mobile layout
20. Install as PWA if browser supports it
