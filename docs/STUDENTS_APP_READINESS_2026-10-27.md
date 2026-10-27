# Appmål for Marine Tools Education

Brukerkrav bekreftet 27. oktober 2026: videreutviklingen skal ta høyde for Google/Android, Samsung, Windows og Apple. Dette dokumentet beskriver mål og tekniske føringer. Det er ikke en apputgivelse eller en bekreftelse på butikkgodkjenning.

Implementasjonsoppfølging samme dag: Capacitor er valgt for Android/iOS og Tauri
for Windows/macOS. Testbygg for alle fire er gjennomført. Se
[implementasjon og testresultater](STUDENTS_APP_IMPLEMENTATION_2026-10-27.md)
og [byggveiledningen](../apps/README.md). Education er fortsatt beskyttet på nett;
den første apppakken inneholder bare de offentlige lokale hovedverktøyene.

| Plattform | Mål | Gjenstående egen akseptanse |
|---|---|---|
| Google / Android | Android-mobiler og nettbrett; Google Play som distribusjonsmål | Signert pakke, fysisk enhet, installasjon, oppdatering og butikkkrav |
| Samsung | Galaxy-mobiler og nettbrett; vurder Galaxy Store i tillegg til Google Play | Samsung Internet/aktuell WebView, berøring, skjermtastatur og separat butikkvalidering |
| Windows | Installerbar PC-app med mus og tastatur | Fysisk Windows-PC, native zoom, signering, installasjon og oppdatering |
| Apple | iPhone og iPad; støtte for Mac i den videre løsningen | Fysisk maskinvare, signering, filflyt og butikkvalidering; simulatorpakken er ikke en iPhone-installasjon |

## Føringer som følges i denne revisjonen

- Formel-ID-er og formellokale symboler/enheter beholdes som felles fagdata.
- `MT_IF97` beregner tilstander og prosesser uten DOM, nettverkskall eller brukerlagring. Adapteren støtter både et nettleservindu og `globalThis` i en klassisk Web Worker. Vendorbibliotekets distribusjonsformat beholdes; dette er ikke et nytt React Native- eller Node-pakkesystem.
- Beregningsmotorens referansefixturer skal brukes av alle senere appinnpakninger. GUI, rapporter, autorisasjon og lagring er egne lag.
- Scenarioformatet beholdes, inklusive kompatibilitet med eldre A/B-filer. Appversjoner må kontrollere skjema og motstridende prosesstilstander før eksisterende data erstattes.
- Faglige domenegrenser, fortegn og CC BY 4.0-attribusjon følger beregningene også i en app.
- Privat Pages-preview beholder nettverkskravet. Appbehov gir ingen adgang til å cache beskyttet Education-innhold offline. Offentlig installasjon og beskyttet tilgang må få hver sin dokumenterte lagrings-/tilgangspolicy før publisering.

## Faktisk teknisk kontroll

`tests/students-if97-boundaries-20261027.mjs` kjører samme vendor og adapter i isolerte VM-kontekster med og uten `window`. `tests/students-mollier-process-browser-20261027.cjs` kontrollerer også en faktisk Web Worker i Chromium, Firefox og WebKit når den aktuelle CI-kjøringen består. Workerens 10 bar / 300 °C-resultat sammenlignes med den uavhengige IF97-referansen.

Nettlesermotorer og vellykket kompilering er ikke det samme som akseptanse på
fysiske enheter. Rapporten angir hvilke tester som faktisk er kjørt. Apprammeverk
og utviklingsbygg er nå etablert; utviklerkonto, butikkoppføring, produksjonssignering
og offentlig apputgivelse er ikke opprettet i dette arbeidet.

## Før en app kan publiseres

Pakkemetoden er valgt. Spesifiser videre autorisasjon/tilbakekalling, Education-innhold,
lokal lagring, eventuell synkronisering, oppdatering og native filimport/-eksport.
Utfør tilgjengelighets- og enhetstester for hver målplattform. Publisering krever
brukerens klarsignal.
