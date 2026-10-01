# BridgeKit update

This package is designed to replace the current M/OPS front-end without touching your Cloudflare API Worker.

## Replace / add these files in the GitHub repository root

Replace:
- index.html
- app.js
- manifest.webmanifest
- sw.js

Add:
- bridgekit.css
- assets/bridgekit-mark.svg

Also upload:
- assets/icon-192.png
- assets/icon-512.png

Do not delete or replace:
- CNAME
- worker/ and its Cloudflare API code
- GitHub Pages settings

The existing styles.css can remain in the repository; BridgeKit no longer references it.

## Why this avoids the broken layout

The previous screenshot is consistent with HTML and CSS/service-worker versions being mixed.
BridgeKit uses a brand-new stylesheet filename (`bridgekit.css`) plus a new service-worker cache namespace,
so the browser cannot accidentally combine the new HTML with an old cached stylesheet.

## After GitHub Pages deploys

1. Open https://www.marinetools.app/
2. Press Ctrl+Shift+R.
3. If the old layout still appears:
   - F12
   - Application
   - Service Workers
   - Unregister
   - Storage / Clear site data
   - close and reopen the site

## Backend

No Worker redeploy is required just for this visual rebrand.
Your BarentsWatch/AIS Cloudflare secrets and API domain remain unchanged.
