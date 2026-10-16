# Marine Tools – avsluttende QA: preview-isolasjon og autentisert live-aksept

**Dato:** 16.10.2026  
**PR:** [#34](https://github.com/tmwalterfang-del/marine-tools/pull/34), `feature/qa-integrated-preview-20261015` (Draft)  
**Baseline fra Work:** lokal QA på `4e795878adc299404283a72f52c78458324b0ab3` bestått.  
**Denne fasen:** nytt QA-only sikkerhets- og integrasjonsarbeid etter baseline; siste commit må leses fra PR før retest.  
**Produksjon:** ingen merge eller prod-deploy er tillatt uten uttrykkelig brukerbeslutning.

## 1. Endringer som er gjort i QA-branchen

- `app.js`, `analytics-v856.js` og `release-v860.js` velger stabil **Worker-preview** fra en `*.pages.dev`-frontend:
  `https://feature-qa-integrated-preview-20261015.api.marinetools.app`
  Produksjonsfrontenden fortsetter å bruke `https://api.marinetools.app`.
- En tidlig guard i `index.html` avviser `window.fetch` til produksjons-API-et fra Pages-preview og setter `credentials: include` kun for godkjent Worker-preview. Produksjons-API-preconnect er fjernet.
- `worker/worker-v860-dashboard.js` behandler bare preview-hostnavn som QA: returnerer isolasjonsstatus, avviser /api/analytics og /admin, tillater kun `GET/HEAD/OPTIONS` på seks godkjente leseendepunkter og skjuler `env.ANALYTICS` / `env.ANALYTICS_SQL` for underliggende handlers.
- Preview-CORS sender tilbake kun verifisert Marine Tools Pages-preview-Origin, `Vary: Origin`, `Access-Control-Allow-Credentials: true`. Fremmede Origin avvises.
- `worker/worker-v855.js` aksepterer Pages-preview-Origin **kun når serverens Worker-host er et preview-hostnavn**. Vanlig produksjons-Origin-policy er beholdt.
- Ressursversjoner og PWA-cache er oppdatert for å unngå blanding med eldre JavaScript.
- Ny, kjørbar test: `node tests/qa-preview-isolation-20261016.mjs`. Denne ble utført mot aktuelle kildefiler i isolert V8-mock og ga **30/30 PASS**.

**Begrensning:** Dette er verifikasjon av kildekode og simulerte HTTP-kall. Det beviser ikke at Cloudflare Access gir riktig nettleserautentisering, at en oppdatert Worker-preview er aktivert i Cloudflare, eller at virkelige AIS-/værleverandører returnerer korrekte data.

## 2. Viktig sikkerhetsforbehold: Cloudflare-kontoens deploy-konfigurasjon

Arbeidet har ikke endret Wrangler/Cloudflare-konfigurasjon eller tilgangspolicyer. Eksisterende `wrangler.jsonc` viser produksjonsdataset `marine_tools_usage` og cron `*/15 * * * *`.

HTTP-kall på preview kan ikke skrive eller lese analytics via de tillatte endepunktene, men **Work må i Cloudflare-dashboard verifisere at preview-deployment ikke kjører cron/scheduled som kan arve produksjonsbindinger**. Det skal ikke antas bestått bare fordi HTTP-testene består. Hvis preview-cron er aktiv, skal dette håndteres i separat staging-konfigurasjon uten prod Analytics-binding og med cron deaktivert. Ikke skru av produksjonscron.

Kontroller at Worker-previewen bruker riktig kode og ingen produksjonsrute (`api.marinetools.app`) er endret ved opprettelse av preview.

## 3. Autentisert live-aksept – kjørerekkefølge for Work

### A. Autorisert tilgang – stopp ved 403 uten innlogging

1. Åpne Cloudflare Pages-preview og Worker-preview med egen, eksplisitt autorisert Cloudflare Access-sesjon. Bruk den normale Access-påloggingen. Ikke endre Access/CORS for å tvinge en grønn test.
2. Sjekk GitHub-boten under PR #34 og bruk **deployment-URL for nyeste commit**, ikke tidligere `58956d15` fra `4e79587`.
3. Kall via autorisert nettleser:
   `GET https://feature-qa-integrated-preview-20261015.api.marinetools.app/api/preview-isolation`
   Forvent 200 JSON: `environment=preview`, `analyticsWrites=false`, `analyticsQueries=false`. Verifiser `x-marine-tools-environment: preview`.
4. Hvis Cloudflare Access returnerer 403, login-side eller browser-CORS/third-party-cookie-blokkering, marker dette som **BLOCKED – AUTH** og rapporter nøyaktig hvilket kall som stoppes. Ikke overfør cookies, service tokens eller hemmeligheter inn i testartefakter. En løsning kan være en separat, Access-beskyttet same-origin staging-proxy/service binding, men det krever egen gjennomgang.

### B. Nettverks- og analytics-isolasjon – RELEASE GATE

1. Åpne DevTools/Playwright og registrer **alle** requests fra frontend-preview mens man bruker profile, Voyage Estimate, Lab, Route Intelligence, Weather og offline-modus.
2. **0 requests, preconnects, beacons eller redirects til `https://api.marinetools.app`** fra preview; hvis noen finnes: **FAIL**.
3. Forvent alle Marine Tools API-kall mot stabil Worker-preview. Legitim Access-innlogging kan gi egne Access-URL-er.
4. Med riktig Origin: `OPTIONS /api/ais/latest` → 204 med eksakt godkjent Origin og credential CORS. Med ukjent Origin: 403.
5. `POST /api/analytics/event` på Worker-preview → 403; `GET /admin/api/analytics` → 403. Ukjent GET-endepunkt → 404, annet skrivekall → 405. Ingen prod analytics datapunkt/telleverk må øke som følge av QA-browsing (kontroller på kontonivå ved behov).
6. Arbeid aldri direkte med prod-analytics-API for å teste blokkeringen. Kontrollér produksjonskode med repo-regresjonstest.

### C. Live AIS – lesetest uten operativ navigasjonsbruk

- `GET /api/auth/status` og `GET /api/health` på QA Worker; rapporter om provider-credentials er konfigurert og fungerer, uten å logge hemmeligheter.
- Prøv en **liten norsk AIS-boks** (for eksempel `minLat=59.0&maxLat=59.3&minLon=10.3&maxLon=10.8`) og minst én utenfor BarentsWatch-dekning for den dokumenterte Pelyr-/åpen-lisens-fallbacken. Tomme resultater er ikke nødvendigvis providerfeil.
- For observerte poster: valider tidsstempel fra kilde, UTC-alder, latitude/longitude, SOG/COG missing/sentinel, MMSI-format, provider-header og lisens/attribusjon. Rediger bort person-/fartøysidentifikatorer fra delt rapport ved behov.
- Test en rute over 180° med to gyldige boksforespørsler, deduplisering og korrekt CPA/TCPA. Bekreft at ukjent og over 15 min gammel AIS gir «utilgjengelig», ikke et fabrikert tall; etter gyldighetsgrensen skal tidligere varsel trekkes tilbake uten ny analyse.
- Bekreft at mislykket AIS-request (503) gir tydelig «AIS unavailable», uten gamle varselverdier eller grønn «oppdatert»-status.

### D. Live vær / bølger

- `GET /api/weather?lat=59.15&lon=10.5&limit=12`: vurder MET-atmosfære og eventuell regional Oceanforecast uten å anta bølgedata.
- `GET /api/weather?lat=0&lon=-30&limit=12`: globalt havområde for NOAA/GFS-Wave fallback. Gjenta gjerne i Stillehavet med `lat=20&lon=150`.
- Kontroller `forecastTime`/modellsyklus, Hs (m), periode (s), bølgeretning og `sources/diagnostics`. Ugyldig/sentinel Hs skal gi `null`/«—», aldri astronomisk tall eller antatt 0 m. Bekreft plausible resultater mot uavhengig oppdatert meteorologisk kilde; numerisk range-guard alene er ikke full datakvalitetsaksept.
- `GET /api/forecast?route=...` på en avgrenset, faktisk rute for å bekrefte voyage/route-kobling og datastruktur.
- Skill HTTP/authfeil, tomme værdata, marine kilde uten dekning og legitime stille perioder. Ikke merk «live PASS» uten gyldig autentisert providersvar.

### E. Funksjon, PWA og manuell tilgjengelighet

- Kjør tidligere Work-harness på **nyeste commit**: full 6×2-responsiv matrise, AIS-aldring, 200 % tekst, CPA/GRIB-fasiter, Profile→Lab, 346-identifiserte kontrollers paritet og 240 bildepar.
- Verifiser main→ny service worker-cache uten tap av `mt.profile`, moderne profil, energilogg, forbrukskurve og sist brukte reise. Test offline Lab.
- Kontroller fysisk iOS Safari og Android Chromium når utstyr er tilgjengelig, navngitte tabellrulleområder, reflow/native tekstzoom, kontrast og skjermleser ved tilgjengelighet.

## 4. Godkjenningskriterier og beslutning

**For å gå fra HOLD til brukertest/aksept:**
- Eksakt commit og deploy-hash dokumentert.
- Ingen kall fra preview til produksjons-API, og ingen analytics-lesing/-skriving/-cron til produksjonsdatasett fra QA.
- Autentisert AIS og vær evaluert som faktisk live PASS, eller bevisst *klart avgrenset* som ikke tilgjengelig / skjult for publikumsbruk.
- Lokal og integrert regressjonsmatrise bestått, uten nye P0/P1.
- Tilgjengelighet/PWA-mangler enten løst eller eksplisitt avgrenset med risiko og brukergodkjenning.

**Fortsett PR #34 som Draft; ikke merge eller deploy til produksjon før eieren gir uttrykkelig godkjenning.**

**Rapporter tilbake:** `PASS / FAIL / BLOCKED / NOT TESTED` per gate, konkret dato/URL/commit, HAR eller anonymisert network-logg, providerkilde, modellsyklus og eventuelle nye GitHub commits. Ingen hemmeligheter, Access tokens, rå personidentifiserbare AIS-records eller privat Cloudflare-data i ZIP/handover.
