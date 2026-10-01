# M/OPS — Marine Operations Workspace

M/OPS is the rebranded successor to the original Marine Tools interface.

The public site can continue to use:

`https://marinetools.app`

The new brand is **M/OPS — Marine Operations Workspace**.

## Product direction

M/OPS is designed around one workflow:

**Vessel → Route → Live data → Analysis → Voyage → Report**

Instead of being a collection of unrelated calculators, vessel data, routes, voyages, bunkering tools and engineering calculations now share local context.

## Included functionality

### Command dashboard
- active voyage summary
- route / ETA / fuel summary
- API readiness
- links into navigation, vessel, bunkering and engineering workflows

### Vessel Profiles
- multiple local vessel profiles
- MMSI / IMO / call sign
- dimensions and draft
- service speed
- fuel consumption / density
- generator rating
- ESS capacity
- operational limits (Hs / wind / current / CPA / UKC)
- vessel fuel-tank list

### Voyage Workspace
- locally saved voyages
- route + vessel context
- voyage status / departure / reserve / notes
- printable passage summary
- portable JSON share file
- optional QR share link

### Passage Planner
- interactive Leaflet map
- OpenStreetMap / dark base map
- OpenSeaMap seamark overlay
- clickable and draggable waypoints
- waypoint names / notes / leg speeds
- distance, COG, sailing time and ETA
- saved local routes
- GPX import/export
- RTZ import/export
- user-defined no-go / caution circles
- fullscreen map

### Route Intelligence
- route corridor geometry
- BarentsWatch AIS adapter
- filtered AIS request through Cloudflare Worker
- AIS targets near route
- automatic screening CPA/TCPA
- vessel-defined CPA alert threshold
- Kystverket navigation-warning corridor checks
- weather / sea-state adapter surface
- vessel operational limit checks

### Route Compare
- compare saved routes
- distance
- sailing time
- waypoint count
- estimated fuel
- no-go areas

### Navigation calculators
- standalone CPA / TCPA
- UKC with tide, draft, squat and allowances
- navigation warnings

### Bunkering & ORB toolbox
- vessel-profile tank import
- before / transfer / after distribution
- max-fill limits
- BDN volume / density / mass cross-check
- received-volume difference check
- sulfur field
- ORB Part I Code H draft
- bunkering checklist
- printable bunker plan

### Engineering Toolkit
- running-hours comparison / service interval display
- generator load sharing
- SFOC fuel calculation
- ESS energy / endurance
- shore power kVA / kW
- pump transfer calculation
- sounding-table interpolation
- trim/list correction using vessel-provided corrections

### Quick Tools
- distance / time / speed
- speed required
- fuel endurance
- average speed
- propeller slip
- RPM / speed reference estimate
- coordinate conversion to degrees + decimal minutes
- bearing / distance
- noon position calculation
- compass → magnetic → true course
- common marine unit converter
- UTC → browser local time

### Application / UI
- full M/OPS rebrand
- Aptos-first typography
- light theme
- dark theme
- low-luminance bridge/night theme
- global tool search
- keyboard shortcuts
- local settings
- local data export/import
- PWA manifest
- offline app-shell service worker
- responsive mobile layout

## Storage and privacy

Vessel profiles, routes and voyages are stored in the browser using `localStorage`.

There is no account system in this release.

QR sharing is opt-in. The QR image is requested from QuickChart only after the user presses the QR button; route/voyage information is encoded in the generated share URL.

## Important operational limitation

M/OPS is a planning and calculation aid only.

It is **not approved navigation equipment** and must not replace:
- ECDIS
- approved nautical charts
- official Notices to Mariners / navigation warnings
- the vessel's Safety Management System
- approved stability / tank / sounding documentation
- the official Oil Record Book
- regulatory requirements
- professional judgement and responsible officers

## Repository files

```text
index.html
styles.css
app.js
manifest.webmanifest
sw.js
assets/
  logo.svg
  hero.svg
  icon-192.png
  icon-512.png
worker/
  worker.js
README.md
DEPLOY.md
LICENSE
.gitignore
```

## External data

The Cloudflare Worker uses BarentsWatch OAuth client credentials for AIS and the standard BarentsWatch API.

The front-end also calls the Norwegian Coastal Administration navigation-warning API.

The forecast UI is included, but the Worker deliberately does not fabricate wave/wind/current values. Before production live weather is enabled, the current BarentsWatch point-forecast request schema should be wired against the current OpenAPI documentation.

See `DEPLOY.md`.
