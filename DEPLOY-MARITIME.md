# BridgeKit Maritime Operations Upgrade — deployment guide

This package upgrades both the GitHub Pages front-end and the Cloudflare Worker while keeping the existing domain architecture:

- `www.marinetools.app` / `marinetools.app` → GitHub Pages
- `api.marinetools.app` → Cloudflare Worker `marine-tools-api`

## Before you start

Do not delete your existing `CNAME` file. Do not put BarentsWatch client IDs or secrets in GitHub.

Your Cloudflare Worker Production runtime must continue to contain these encrypted secrets:

```text
BW_AIS_CLIENT_ID
BW_AIS_CLIENT_SECRET
BW_API_CLIENT_ID
BW_API_CLIENT_SECRET
```

## 1. Back up the current repository

On GitHub, open `tmwalterfang-del/marine-tools` and use **Code → Download ZIP**. This is only a rollback copy.

## 2. Upload the front-end upgrade to GitHub

At the repository root, replace/upload:

```text
index.html
bridgekit.css
bridgekit-pro.css
app.js
bridgekit-pro.js
manifest.webmanifest
sw.js
assets/bridgekit-mark.svg
assets/icons.svg
assets/icon-192.png
assets/icon-512.png
```

Keep:

```text
CNAME
LICENSE
README.md (unless you want to replace it separately)
```

The new files must be at repository root exactly as shown. Do not upload an enclosing `bridgekit-maritime-suite` folder.

Suggested commit message:

```text
Major BridgeKit maritime operations upgrade
```

GitHub Pages should deploy automatically from `main`.

## 3. Verify the front-end deploy

After GitHub Pages succeeds, open:

```text
https://www.marinetools.app/
```

Hard refresh:

```text
Ctrl + Shift + R
```

If an older layout persists:

1. Press F12.
2. Application → Service Workers → Unregister.
3. Application → Storage → Clear site data.
4. Close the tab completely.
5. Re-open `www.marinetools.app`.

The upgrade uses a new service-worker cache namespace, so old cached layouts should be removed on activation.

## 4. Update the Cloudflare Worker

If Cloudflare Builds is still connected to GitHub with:

```text
Repository: tmwalterfang-del/marine-tools
Production branch: main
Root directory: /worker
Deploy command: npx wrangler deploy
```

then uploading the package's `worker/worker.js` and `worker/wrangler.jsonc` to GitHub will trigger the Worker deploy automatically.

If it does not trigger, open Cloudflare → Workers & Pages → `marine-tools-api` → Deployments and redeploy the latest Git commit.

## 5. Confirm runtime secrets remain present

Cloudflare → `marine-tools-api` → Settings → Runtime variables and secrets → Production.

You should see four encrypted secrets:

```text
BW_AIS_CLIENT_ID
BW_AIS_CLIENT_SECRET
BW_API_CLIENT_ID
BW_API_CLIENT_SECRET
```

Do not add them under Build variables.

## 6. Test authentication

Open:

```text
https://api.marinetools.app/api/auth/status
```

Expected:

```json
{
  "ais": {"configured": true, "authenticated": true},
  "api": {"configured": true, "authenticated": true}
}
```

## 7. Test API health

Open:

```text
https://api.marinetools.app/api/health
```

Expected service name:

```text
BridgeKit API
```

## 8. Test live AIS

Open:

```text
https://api.marinetools.app/api/ais/latest?minLat=59.0&maxLat=59.6&minLon=10.0&maxLon=11.0
```

You should receive real AIS targets.

## 9. Test route forecast adapter

Create a route in BridgeKit, then open **Weather Along Route → Refresh forecast**.

The Worker uses the current BarentsWatch point endpoint families:

```text
v1/waveforecastpoint/nearest/all
v1/windforecastpoint/nearest/all
v1/seacurrent/nearest/all
```

It tries the common coordinate parameter forms and never substitutes demo values. If an upstream point schema differs, BridgeKit shows missing values instead of presenting fake live data. The diagnostic endpoint remains available:

```text
/api/barentswatch/probe?endpoint=wave&...
```

## 10. Initial BridgeKit setup

Recommended first-run sequence:

1. **Vessel Profiles** → enter vessel particulars.
2. **Operational Limits** → enter Hs, wind, current, UKC, CPA and corridor limits.
3. **Passage Planner** → build or import a route.
4. Save the route.
5. **Voyages** → create a voyage using the saved route.
6. Choose your role in the top bar: General / Navigator / Engineer / Electrician.
7. **AIS Traffic** → Refresh AIS.
8. **Weather Along Route** → Refresh forecast.
9. **Route Intelligence** → Run analysis.

## 11. What is included

### Navigation
- Passage Planner with GPX/RTZ
- Route Intelligence
- live AIS traffic map
- AIS filters and vectors
- CPA/TCPA screening and visualization
- Weather Along Route
- Navigation Warnings
- UKC
- Route Compare

### Engineering
- ROB / endurance
- fuel changeover
- tank transfer
- generator optimizer
- running-hours planner
- load sharing
- SFOC
- ESS
- pumps
- sounding interpolation

### Electrical
- three-phase power
- phase-current imbalance
- battery bank / endurance
- shore-power capacity/checklist
- insulation-resistance log + CSV export

### Operations
- role workspaces
- pinned tools
- watch snapshot
- live data age / stale status
- Operations Board
- equipment cards
- operational limits
- reports

## 12. Operational limitation

BridgeKit remains a planning/support tool. It is not approved navigation equipment and does not replace ECDIS, official charts/publications, approved vessel procedures, the official Oil Record Book, approved electrical/protection calculations, class/flag requirements, or responsible professional judgement.
