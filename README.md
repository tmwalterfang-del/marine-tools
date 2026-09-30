# Marine Tools v0.5

A lightweight open-source toolkit for maritime navigation, bunkering and engineering calculations.

## Included

### Navigation
- Passage Planner
  - interactive map
  - manual or map-click waypoints
  - course, leg distance, cumulative distance
  - departure time and ETA
  - route reverse
  - JSON import/export
- Route Intelligence
  - route corridor
  - weather limit checks
  - AIS corridor scan
  - navigation-warning corridor scan
  - local/demo fallbacks
- CPA / TCPA calculator
- UKC calculator
- Voyage time and fuel calculator
- Kystverket Coastal Navigation Warnings / NAVAREA XIX adapter

### Bunkering
- ORB Part I Code H draft generator
- Bunker distribution planner

### Engineering
- Fuel quantity calculator
- Three-phase generator load calculator
- Unit converter

### Interface
- responsive desktop/mobile layout
- blue maritime design
- light/dark mode
- Aptos-first font stack
- local browser settings

## Important operational disclaimer

Marine Tools is a planning aid only.

It is **not** approved navigation equipment and does not replace ECDIS, official charts, Notices to Mariners, the vessel's approved Oil Record Book, MARPOL requirements, company procedures, class/flag requirements or professional judgement.

Verify all calculations and externally sourced data before operational use.

## Aptos font

The CSS uses:

```css
font-family: Aptos, "Segoe UI", Arial, sans-serif;
```

Aptos is therefore used when installed on the visitor's device. No Microsoft font files are included or redistributed in this repository.

## Run locally

You can open `index.html` directly, but the map and live web requests work more reliably through a local web server:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new public GitHub repository, for example `marine-tools`.
2. Upload everything in this repository **except that you never add real API secrets**.
3. Commit and push to `main`.
4. Open the repository on GitHub.
5. Go to **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select:
   - Branch: `main`
   - Folder: `/ (root)`
8. Save.

GitHub will publish the site at a URL similar to:

```text
https://YOUR-USERNAME.github.io/marine-tools/
```

## Custom .app or .io domain

You must first buy a domain such as:

```text
marinetools.app
marinetools.io
```

from a domain registrar.

Then:

1. In GitHub open **Settings → Pages**.
2. Enter your domain under **Custom domain**.
3. At your registrar configure the apex/root domain with GitHub Pages DNS records:

```text
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
```

4. Configure `www` as:

```text
CNAME  www  YOUR-USERNAME.github.io
```

5. Wait for DNS to propagate.
6. Back in **Settings → Pages**, enable **Enforce HTTPS** when it becomes available.

GitHub also recommends verifying your custom domain in your GitHub account to reduce domain-takeover risk.

### .app note

`.app` is HTTPS-only in normal modern browsers because the entire TLD is HSTS-preloaded. Make sure GitHub Pages has successfully issued the TLS certificate and **Enforce HTTPS** is enabled.

## Live data architecture

The static website can call Kystverket's public navigation-warning endpoints directly when browser access is permitted.

BarentsWatch AIS and API access uses OAuth client credentials. **Do not put a BarentsWatch client secret in `app.js`.**

The repository therefore contains:

```text
worker/worker.js
```

which is a minimal Cloudflare Worker proxy example.

### BarentsWatch setup

Create clients from BarentsWatch developer access / My Page:

- AIS client → scope `ais`
- API client → scope `api`

Store credentials as Worker secrets, not repository variables exposed to the browser.

Suggested Worker secrets:

```text
BW_AIS_CLIENT_ID
BW_AIS_CLIENT_SECRET
BW_API_CLIENT_ID
BW_API_CLIENT_SECRET
```

The frontend currently understands:

```text
GET /api/health
GET /api/ais/latest
GET /api/forecast?route=...
```

The AIS endpoint is implemented against BarentsWatch latest combined positions.

The forecast endpoint is intentionally a safe adapter placeholder. It returns route points with `null` forecast values until the BarentsWatch wave/wind/current point forecast request schema is connected and verified. The frontend automatically uses demo forecast values when a real forecast service is not available.

## Public data endpoints used

Kystverket:

```text
https://api.kystverket.no/data/navigationwarnings/coastal/
https://api.kystverket.no/data/navigationwarnings/navareaxix/
```

BarentsWatch token service:

```text
https://id.barentswatch.no/connect/token
```

BarentsWatch AIS latest positions:

```text
https://live.ais.barentswatch.no/v1/latest/combined
```

## Project structure

```text
marine-tools-v0.5/
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
├── .gitignore
└── worker/
    └── worker.js
```

## Suggested next releases

### v0.6
- GPX import/export
- RTZ import/export
- draggable waypoint ordering
- route naming and local route library
- forecast time interpolation against ETA

### v0.7
- proper BarentsWatch point forecast integration
- AIS bounding-box filtering in the proxy
- vessel-specific route limits
- route weather timeline

### v0.8
- tide/water-level source integration
- port/fairway lookup
- route report / print view
- offline/PWA shell

## License

MIT
