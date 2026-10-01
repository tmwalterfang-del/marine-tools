# Marine Tools

Marine Tools is an independent trial project developed and maintained by one person.

It provides practical calculation and planning helpers for seafarers, including:

- Route Intelligence with live AIS and BarentsWatch route forecast context
- Route risk context / operational envelope
- CPA/TCPA context for AIS targets in the route corridor
- Navigation calculations and coordinate tools
- Weather window finder
- Fuel, endurance, density and tank helpers
- Dynamic UKC, squat and anchor swing radius
- Engineering and electrical calculators
- Vessel Profile for shared planning values
- Survey and Suggestions links
- About this project page

## Scope

Marine Tools is a planning/calculation aid only. It is not ECDIS, approved navigation equipment, PMS,
an electronic logbook, a checklist/SMS system or a certified decision-support system.

The frontend uses the existing Cloudflare Worker at `api.marinetools.app`.
Do not place BarentsWatch client IDs or secrets in the frontend repository.

## Privacy and data principle

Marine Tools is local-first. Vessel Profile, route and settings data are stored in browser local storage.
The project does not use entered operational data for advertising, behavioural profiling, AI training,
sale to third parties, or unrelated employment/disciplinary/enforcement purposes.

Live-data features necessarily send minimum route/position context to the Marine Tools API and upstream
data providers. The current Worker has no application database and does not persist those requests itself,
but hosting/data providers can have their own technical logs and policies.

Survey and Suggestions are separate Tally-hosted forms.
