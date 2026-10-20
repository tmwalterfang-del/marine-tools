# Marine Tools For Students – arbeidsrapport, 20. oktober 2026

Dette er en avgrenset implementeringsleveranse, ikke ferdigmelding for hele overleveringsoppdraget. PR #35 skal fortsatt være Draft/HOLD. Utgangspunkt: `8f702d71d3d22345bad6bb90d86e2c4a384e2182`. Den eksakte leveransecommiten fremgår av PR-head og commit-historikken som inkluderer denne rapporten.

## Implementert

- Ny studentside `students/labs.html`, med direktevalg `#stability`, `#controls` og `#engine`, koblet fra studentsidens hovedinngang. Hver modul har engelsk forklaring, synlige modellvilkår, egne figurer, talltabeller og CSV-eksport. Inndata lagres lokalt i et versjonert skjema. Utskrift viser valgt modul.
- **Stabilitet/GZ:** original syntetisk KN-funksjon, vertikal flytting av eksisterende vekt ved konstant deplasement, KG/GM, rektangulær fri væskeoverflate, separate langskips tankrom, kurvesammenligning, signerte arealer og syntetisk nullkryssing. Ikke basert på et virkelig fartøys hydrostatikk. Den konstante virtuelle KG-korreksjonen er uttrykkelig merket som en tilnærming ved store vinkler. Ingen nedstrømnings-/skadestabilitetsmodell eller myndighetsgodkjenning beregnes.
- **Instrumentering/PID:** toveis nominell 4–20 mA-omregning med LRV/URV; oppgave med svarrespons; deterministisk P/PI/PD/PID-simulering av førsteordens prosess, revers/direkte virkning, utgangsmetning, valgfri betinget integrasjon mot windup og filtrert derivert på PV. Ingen kobling til utstyr.
- **Motor/fuel:** to-/firetakts effektmodell med eksplisitt net IMEP/BMEP, mekanisk virkningsgrad, bremsetermisk virkningsgrad, brennverdi på LHV-basis, massestrøm, beregnet SFOC og middelstempelhastighet. Fire illustrative drivstoff sammenlignes ved lik effekt og antatt lik virkningsgrad. Pilotfuel, utslipp, tankvolum og faktisk motorkompatibilitet inngår ikke.
- **Mollier:** fjernet gamle tredjepartstabeller og interpolasjonsreserve. Våt damp begrenset til IF97 0,01–160 bar(a), overhetet til 0,01–100 bar(a), maks. 400 °C. Region 3 og kritisk punkt er utelatt. Manglende solver deaktiverer beregninger. Klikk i våtdampområdet skifter faktisk fase; fasevalg senker ikke lenger trykket stille. Aksetekst/kurvestiler rettet, entropiakse utvidet og A–B-linjen forklart som endepunktsammenligning.
- Nye modulressurser og IF97-attribusjon lagt i previewens PWA-shell. Direkte inngang til labs/Mollier registrerer eksisterende service worker. Ny cacheversjon; ingen endring i API-kode eller tilgangskontroll.

## Kjørte kontroller

Alle 11 `tests/students-*.mjs`-skript passerte lokalt etter endringene. Dette omfatter forskjellige testtyper, ikke 11 faglige godkjenninger:

| Kontroll | Resultat | Avgrensning |
|---|---|---|
| Nye labmodeller | 59/59 | Uavhengige regneeksempler, grenser og statisk integrasjon |
| IAPWS publiserte testverdier | 18/18 | h/s i Region 1/2, metningstrykk og -temperatur i Region 4; noen vendor-tester ligger utenfor UI-området |
| IF97-adapter/regresjon | 39/39 | Utvalg punkter, fase- og domenegrenser |
| Mollier modell/integrasjon | 37/37 | Faktisk IF97 lastes i stedet for gammel tabellmodell |
| Mollier DOM-stub | 13/13 | Fasebytte, ugyldige inndata, isentropisk valg og manglende solver |
| Labs HTML/JS med jsdom | 19/19 | Faktisk HTML, rendering av SVG-elementer, skjemaendringer, dypkoblinger, oppgaver og lokal lagring; ingen layoutmotor |
| Øvrige studenttester | Passert | Katalog, kalkulatorer, oppgaver og eksisterende utvalgte formeltester |
| JavaScript syntaks og `git diff --check` | Passert | Ikke faglig eller visuell godkjenning |

IAPWS-fasiter, beregnede tall, toleranser og avvik ligger i `STUDENTS_IF97_PUBLISHED_REFERENCE_RESULTS_2026-10-20.json`. Kilde: IAPWS R7-97(2012), tabell 5, 15, 35 og 36: https://iapws.org/technical-guidance/release/IF97-Rev.download . Testen er reproducerbar med `node tests/students-if97-published-20261020.mjs`.

jsdom-testen krever separat installert `jsdom`, og kjøres med `node tests/students-labs-dom-20261020.cjs` når pakken kan løses. Den erstatter ikke Chromium.

## Ikke verifisert / gjenstående

- Nettleserens hovedside og Mollier-preview åpnet til Cloudflare Access-innlogging. Ingen innlogging eller tilgangsendring utført. Appens faktiske layout og funksjon bak innlogging ble dermed ikke kontrollert. Lokal Chromium manglet; installasjon av nettleser feilet ved nedlasting. Reell desktop/mobil, 200 % zoom, skjermleser, konsoll, CSV-nedlasting, utskrift og installert offline-/cacheoppgradering er fortsatt åpne.
- Koden inneholder fortsatt **499 formeloppføringer, 59 kalkulatordefinisjoner og 36 øvingsoppgaver**. De tre nye labmodulene er egne moduler og øker ikke disse katalogtallene. **190 formeloppføringer har symboltabell; 309 mangler fortsatt.** Symboltabeller betyr ikke at alle symbolene er faglig godkjent.
- **Ingen nye boksider/formeluttrykk ble visuelt sluttverifisert i denne leveransen.** Bokarkivet med 284 bilder er tilgjengelig, men tilgjengelighet er ikke gjennomgang. Fullstendig formel-for-formel-gjennomgang av 16 kapitler, referansedelen, resten av kildematerialet og komplett privat revisjonsregister gjenstår.
- Region 3, fullstendige damp-/Rankine-prosessforløp, kjølemediebasert p–h, trefase/phasor, pumpe/NPSH, trim/dypgang og navigasjonsmoduler er ikke ferdigstilt i denne leveransen.
- Originale skrog-/prosessmodeller er egne implementasjoner. Neutrium IF97 beholder CC BY 4.0-attribusjon; vendor-kroppen er uendret. Ingen bokbilder, private dokumenter, originale kildetabeller eller fartøysdata inngår i endringen.

## Navigasjon ved gjennomgang

Previewens hovedside → **Project & contact** i sidemenyen → **For Students (preview)** → **Interactive learning labs** → velg **Stability & GZ**, **Instrumentation & PID** eller **Engines & fuel**. Mollier kan åpnes med **Interactive Mollier chart** fra studentsiden eller **Steam Mollier** fra labnavigasjonen.

Gjennomgå først GZ-tilnærmingen og tankoppdeling, deretter signalomregning/PID og motorenes effekt-/fuelbasis. Full fagkontroll, ekte nettlesertester og samlet kildegjennomgang må stå åpne til de faktisk er utført.
