# Marine Tools

Marine Tools is a public, browser-based collection of navigation, bunkering and marine engineering utilities.

The current interface uses a dark maritime sidebar, a visual dashboard, light/dark mode and Aptos-first typography. Version numbers are intentionally not shown in the public website UI.

## Project structure

```text
/
├── index.html
├── styles.css
├── app.js
├── assets/
│   └── hero-maritime.svg
├── README.md
├── LICENSE
├── .gitignore
└── worker/
    └── worker.js
```

## Frontend

The frontend is static and is intended for GitHub Pages.

It includes:

- Passage Planner
- Route Intelligence
- CPA / TCPA Calculator
- UKC Calculator
- Voyage Calculator
- Navigation Warnings
- ORB Part I Code H draft generator
- Bunker Distribution Planner
- Fuel / Density Calculator
- Generator Load Calculator
- Unit Converter
- light/dark mode
- responsive layout
- global tool search

The frontend defaults to this API proxy:

```text
https://api.marinetools.app
```

This can still be changed under **Data & Settings**.

## Backend

`worker/worker.js` is the Cloudflare Worker used as the secure API proxy.

The worker exposes:

```text
GET /api/health
GET /api/ais/latest
GET /api/forecast
```

The BarentsWatch credentials must be stored as Cloudflare Worker secrets, never in GitHub.

Expected secrets:

```text
BW_AIS_CLIENT_ID
BW_AIS_CLIENT_SECRET
BW_API_CLIENT_ID
BW_API_CLIENT_SECRET
```

## Updating the website on GitHub Pages

Only the GitHub repository needs to be updated for normal frontend design changes. You do not need to change DNS, the custom domain, or the Worker when replacing `index.html`, `styles.css`, `app.js` or files under `assets/`.

### GitHub web interface

1. Download and unzip the Marine Tools update.
2. Open the `marine-tools` repository on GitHub.
3. Use **Add file → Upload files**.
4. Upload:
   - `index.html`
   - `styles.css`
   - `app.js`
   - the `assets` folder/files
   - optionally the updated `README.md`
5. Ensure the files are at repository root, not inside an extra folder.
6. Commit to `main`.
7. GitHub Pages automatically deploys the new commit.
8. Open `https://marinetools.app` and hard-refresh the browser.

## Operational disclaimer

Marine Tools is a planning and calculation aid only. It is not approved navigation equipment and does not replace ECDIS, official charts, Notices to Mariners, vessel procedures, the official Oil Record Book, regulatory requirements or professional judgement.

## Font

The project uses:

```css
font-family: Aptos, "Segoe UI Variable", "Segoe UI", Arial, sans-serif;
```

Aptos is used when installed on the visitor's device. No Microsoft font files are distributed.

## License

MIT
