# Marine Tools

**Practical tools for seafarers.**

Marine Tools is an independent, free collection of calculation, planning and technical helper tools for maritime use. It is designed and maintained by one person with a focused goal: make common maritime calculations and planning tasks easier to access, understand and verify.

## Main tools

Marine Tools includes:

- Route Intelligence with live AIS and route forecast context
- Operational-envelope and route-risk context
- CPA/TCPA context for relevant AIS targets
- Navigation, bearing, distance and coordinate tools
- Great-circle vs rhumb-line comparison
- Set & drift and true/apparent wind calculations
- Passage speed/time/fuel scenario comparison
- Weather-window and wave-encounter helpers
- Fuel ROB, endurance scenarios, density, blending and tank calculations
- Fuel / urea conversion and row-based bunkering overview
- Chemical dosing calculator using user-entered manufacturer rates
- NOx period reporting helper with separate engine/source fields and SCR/urea consumption tracking
- Lube-oil consumption trend analysis with separate reading fields
- Dynamic UKC, squat, FWA/DWA, anchor swing radius and air-draft clearance
- Simplified hydraulic power, pump speed change, pipe velocity, tank interpolation, flow/fill time and pressure/head tools
- Everyday and advanced electrical tool views for three-phase power, motor current, transformer, batteries, imbalance, voltage drop and power-factor correction
- Vessel Profile for reusable planning values
- Unit conversions and quick technical utilities

## Interface and workflow

- **Dark Maritime** — standard display mode.
- **Bridge Dark** — lower-luminance amber/red-biased mode for dark environments.
- **My Tools** — star frequently used calculators.
- **Recent Tools** — locally remembers tools used recently.
- **Calculation History** — keeps the latest calculations locally in the browser.
- **Copy / Share Result** — creates a clean calculation summary with inputs, result and timestamp.
- **How to use** — every calculator includes a short practical instruction.
- **Tool information** — purpose, formula, assumptions, units, update date and limitations are available directly on each calculator.
- **Sanity warnings** — unusual numeric inputs are highlighted without replacing professional judgement.
- **Offline status** — clearly separates local tools from live-data functions.
- **Live-data age** — AIS and forecast context show fetch age and stale-data status.

## Safety

Marine Tools is a **planning and calculation aid**. It is not ECDIS, approved navigation equipment, a certified decision-support system, PMS, electronic logbook or checklist/SMS system. Users remain responsible for verifying inputs, units, assumptions and results against approved systems, official sources, vessel-specific documentation and applicable procedures.

## Privacy

Marine Tools follows a local-first approach. Vessel Profile values, route waypoints, favourites, recent tools and calculation history are stored in the user's browser. Marine Tools does not use entered operational data for advertising, behavioural profiling, sale to third parties, AI-model training or unrelated employment, disciplinary, enforcement or commercial assessment.

Live-data tools send only the route or position context needed to return the requested result. Internet requests may pass through hosting, maritime-data, map and network providers that have their own technical logging and data-processing practices.

## Branding assets

The website package includes:

- `assets/marine-tools-shield.png` — main Marine Tools logo
- `assets/marine-tools-tally-header.png` — wide header artwork suitable for forms/social presentation
- `assets/icon-192.png` and `assets/icon-512.png` — PWA/app icons

## License

Marine Tools source code is proprietary. See [LICENSE](LICENSE) for use restrictions and [BRAND.md](BRAND.md) for name/logo/brand terms.


## Support

Marine Tools includes a built-in support page linking to https://buymeacoffee.com/marinetools.


### Homepage v7.2
The homepage uses a calmer visual-first hero, a dedicated tool search, six primary tool categories, a compact project/support strip, and a collapsed dashboard that preserves route status, live data, recent tools, calculation history and favourites without crowding the landing view.


## Support widget

- Floating Buy Me a Coffee support widget on the live website


## Visual update

- Homepage hero updated to use a real maritime photo
- Buy Me a Coffee widget color tuned to the Marine Tools blue palette


## Responsive hero

- Responsive hero image set:
  - desktop: `assets/hero-lantern-desktop.jpg`
  - tablet: `assets/hero-lantern-tablet.jpg`
  - mobile: `assets/hero-lantern-mobile.jpg`
- CSS automatically selects the appropriate hero crop for the screen size.

- Business & Contact page with Walterfang Design legal information and direct Custom Tool request link

- Help shape Marine Tools remains the Tally-based survey.
- Suggestions now open a prepared email to contact@marinetools.app.
- Custom Tool requests now open a structured email template to contact@marinetools.app.

- Business & Contact page no longer publishes the business street address.

- Site-wide footer with Marine Tools / Walterfang Design, organisation number and contact email.
- Homepage includes a subtle Custom Tool email shortcut.
- Custom development wording states that scope and price are agreed before paid work begins and out-of-scope work is quoted separately.
- Every calculator/tool card has a prepared “Report a problem” email link with the tool name included automatically.
- Business & Contact clarifies that invoices and paid custom development are provided by Walterfang Design.


## v8.0 product direction
- Main navigation now prioritises Fuel & Bunkering, Engineering, Electrical, Vessel Calculations and Quick Tools.
- Weather and Navigation are under More; AIS/Route Intelligence are under Live & Experimental.
- Vessel Profile and Settings moved to top-bar shortcuts.
- Home is search-first and searches individual calculator cards, not just categories.
- Weather no longer depends on Route Intelligence: it loads a BarentsWatch point forecast from latitude/longitude.
- Worker adds `/api/weather` and more defensive point-forecast parsing, including future-time selection and partial-source diagnostics.
- Route Intelligence now tolerates AIS or forecast failure independently instead of treating one source failure as a total failure.

- v8.1: Weather now uses MET Norway Locationforecast and Oceanforecast instead of parsing BarentsWatch point responses.
- Weather combines wind/air forecast with wave/current data and no longer labels empty rows as “Normal”.
- Experimental route forecast also uses the MET Norway point forecast stack; AIS remains BarentsWatch-based.
- MET Norway requests include a dedicated Marine Tools User-Agent as required by api.met.no.

- v8.2: calculator-first design refresh across Home, sidebar, Weather, tool cards, results and mobile layouts.
- v8.2: guidance and technical details collapse below each calculator so inputs/results stay primary.
- v8.2: Weather has Wind/Waves/Current summary cards and a mobile card-style forecast layout.
- v8.2: Live & Experimental is visually separated from core tools and remains secondary in navigation.
- v8.2 performance: only Home renders on initial load; other pages render on demand.
- v8.2 performance: Leaflet loads only when Experimental Route Intelligence is opened.
- v8.2 performance: Buy Me a Coffee loads during browser idle time instead of blocking initial rendering.
- v8.2 performance: responsive hero images are WebP-preloaded by viewport with JPEG fallback.
- v8.2 search: a static complete tool index preserves search while pages render lazily.

- v8.3: Daily Consumption & Reporting for fuel, urea solution and lube oil with local history, running-hour rate, 7/30-day averages, trend, copy summary and CSV export.
- v8.3: Persistent local Bunkering History & Export with mass calculation, weighted density, average delivery and interval.
- v8.3: Weather keeps the last successful MET Norway forecast locally so it can still be viewed when the live request is unavailable.
- v8.3: Offline shell explicitly caches responsive hero assets; local calculators and saved reporting history remain available offline.
- v8.3: Local-data JSON export and Privacy & Data now include consumption history, bunkering history and cached weather.
- Marine Tools remains a calculation/reporting helper and does not become an electronic or statutory logbook.

- v8.4: Privacy-preserving first-party usage analytics groundwork using Cloudflare Workers Analytics Engine. Tracks anonymous session starts, in-app page opens, tool-use events and visible-time seconds only; no calculation inputs, vessel profile, route coordinates, weather positions or persistent user IDs.
- v8.4: Analytics can be disabled in Settings and automatically stays off when the browser sends Do Not Track.
- v8.4: Added `ANALYTICS` Workers Analytics Engine dataset binding (`marine_tools_usage`). The dataset is created automatically after Worker deployment and first event.
- v8.4: Cloudflare Web Analytics remains the source for normal site visits/pageviews; the custom dataset is intended for future feature-usage and engagement dashboards.
- v8.4: Settings now shows local-data counts and size, supports downloadable JSON backup and restore, and explains analytics scope.
- v8.4: Consumption reporting adds optional activity/operation and notes, clearer period comparison, and CSV import.
- v8.4: Bunkering history adds optional supplier, BDN/reference and notes, plus CSV import.
- v8.4: Weather clearly distinguishes global Locationforecast weather data from regional Oceanforecast marine data.
- v8.4: Added a compact online/offline/cached-weather status in the top bar.
- v8.4: Search ranking prioritises Daily Consumption and Bunkering History for relevant queries.

- v8.4.1: Performance and analytics reliability maintenance release.
- v8.4.1: Home hero is now present in the initial HTML and uses a responsive `<picture>` image with high fetch priority, so the LCP image no longer waits for app.js to render the homepage.
- v8.4.1: The 1.1 MB sidebar/survey shield source is no longer loaded during normal use; the existing 192 px app icon is used instead.
- v8.4.1: Service Worker precache no longer downloads the unused ~1.6 MB Tally header or the large shield image, and static assets use a stale-while-revalidate style cache for faster repeat loads.
- v8.4.1: Analytics page-hide events now use `fetch(..., keepalive:true)` instead of `sendBeacon`, avoiding the Firefox beacon network error seen during testing.
- v8.4.1: Below-the-fold home sections use `content-visibility:auto` to reduce initial rendering work.
- v8.4.1: Home search now uses the same relevance scoring as the global search.
