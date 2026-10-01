# Marine Tools full-scale deployment

This package is intended to replace the current frontend at the repository root.

## KEEP

Do not delete:

- `CNAME`
- `LICENSE`
- `worker/`

The existing `worker/` contains the working Cloudflare Worker and BarentsWatch integration.

## DELETE FROM THE CURRENT REPOSITORY ROOT

Delete these old frontend / old documentation files before uploading the new package:

- `DEPLOY-MARITIME.md`
- `README-MARITIME.md`
- `app.js`
- `bridgekit-pro.css`
- `bridgekit-pro.js`
- `bridgekit.css`
- `index.html`
- `manifest.webmanifest`
- `sw.js`
- the entire old `assets/` folder

If you created a previous `/next/` preview folder, delete `/next/` as well after the root version is live.

## UPLOAD

Upload these files from this package to the repository root:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `sw.js`
- `README.md`
- `DEPLOY.md`
- the entire new `assets/` folder

The final repository root should look roughly like:

```
CNAME
LICENSE
README.md
DEPLOY.md
index.html
app.js
styles.css
manifest.webmanifest
sw.js
assets/
  marine-tools-logo.svg
  hero-sea.svg
  icon-192.png
  icon-512.png
worker/
  worker.js
  wrangler.jsonc
```

## AFTER THE GITHUB COMMIT

1. Wait for GitHub Pages to deploy.
2. Keep the existing Cloudflare Worker and all four Production Runtime Secrets unchanged:
   - `BW_AIS_CLIENT_ID`
   - `BW_AIS_CLIENT_SECRET`
   - `BW_API_CLIENT_ID`
   - `BW_API_CLIENT_SECRET`
3. Confirm `https://api.marinetools.app/api/auth/status` still returns authenticated=true for AIS and API.
4. Open `https://www.marinetools.app`.
5. Hard refresh with `Ctrl + Shift + R`.
6. If the old frontend remains cached:
   - F12 → Application → Service Workers → Unregister
   - Storage → Clear site data
   - reopen the site.
7. Publish the Tally survey `5BWVZQ` and suggestion form `5BWVzN` before sharing those pages publicly.

## FIRST FUNCTIONAL TEST

- Open Vessel Profile and save planning limits.
- Open Route Intelligence and click 2–4 waypoints on the map.
- Click Run analysis.
- Confirm AIS targets load.
- Confirm forecast values load where BarentsWatch returns them.
- Check Weather, Navigation, Fuel, Engineering and Electrical calculators.
- Open Survey, Suggestions and About this project.

The application should remain useful offline for cached frontend pages and local calculators, while live AIS and weather clearly depend on the API connection.

## PRIVACY PAGE CHECK

After deployment, open `Privacy & data` from the sidebar and verify that it explains:

- local browser storage,
- what is sent for live-data requests,
- no advertising/profiling/AI-training use by Marine Tools,
- third-party infrastructure caveat,
- Tally as the host for survey/suggestions,
- export/clear controls.
