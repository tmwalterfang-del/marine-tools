# Marine Tools — Next preview

This is a visual and functional preview of the next Marine Tools frontend.

## What is included

- New maritime visual design based on the approved concept mockup
- Marine Tools branding and local SVG logo
- Home dashboard with live-data status, tool categories, survey, suggestions and project context
- Route Intelligence with OpenStreetMap/OpenSeaMap, active route, BarentsWatch AIS, point forecast, vessel-defined operational envelope, CPA context, route risk colours and "What changed?"
- Navigation helpers: bearing/distance, destination point, coordinate conversion, current-corrected ETA, wind component, closest point to route and route fuel estimate
- Weather: live route table plus manual weather-window finder
- Fuel & Bunkering: ROB/endurance, speed/consumption interpolation, density/temperature correction, tank transfer, mass-volume and route fuel estimate
- Vessel calculations: dynamic UKC/squat, anchor swing radius and static UKC
- Engineering: hydraulic power, pump affinity laws, pipe velocity and generator load margin
- Electrical: three-phase power, voltage drop, battery runtime and current imbalance
- Quick tools: distance/time, Beaufort, unit conversion and compass/gyro correction
- Vessel Profile stored locally in the browser
- Survey page linked to Tally form `5BWVZQ`
- Suggestions page linked to Tally form `5BWVzN`
- About this project page clearly explaining the one-person trial-project scope
- Dark/light modes and PWA app-shell cache

## Important scope

Marine Tools is a planning and calculation aid only. It is not ECDIS, approved navigation equipment, PMS, an electronic logbook, a checklist/SMS system or a certified decision-support system.

## Preview deployment — recommended

Do not replace the current live site first.

1. In the GitHub repository `tmwalterfang-del/marine-tools`, create a folder named `next`.
2. Upload the **contents** of this package into `/next/` so that `/next/index.html` exists.
3. Commit to `main`.
4. GitHub Pages should then make the preview available at:
   `https://www.marinetools.app/next/`
5. Test the preview, especially Route Intelligence, AIS, forecast, mobile layout and the Tally links.
6. Publish the two Tally forms before sharing the Survey/Suggestions pages publicly.
7. Once approved, the next version can be promoted to the repository root while keeping `CNAME`, `LICENSE` and the Worker configuration.

## Backend

No BarentsWatch secrets or Worker changes are required for this preview. It calls the existing API at `https://api.marinetools.app`.
