# Appmål for Marine Tools Education

Brukerkrav bekreftet 27. oktober 2026: videreutviklingen skal ta høyde for Google/Android, Samsung, Windows og Apple. Dette dokumentet beskriver mål og tekniske føringer. Det er ikke en apputgivelse eller en bekreftelse på butikkgodkjenning.

| Plattform | Mål | Gjenstående egen akseptanse |
|---|---|---|
| Google / Android | Android-mobiler og nettbrett; Google Play som distribusjonsmål | Signert pakke, fysisk enhet, installasjon, oppdatering og butikkkrav |
| Samsung | Galaxy-mobiler og nettbrett; vurder Galaxy Store i tillegg til Google Play | Samsung Internet/aktuell WebView, berøring, skjermtastatur og separat butikkvalidering |
| Windows | Installerbar PC-app med mus og tastatur | Valgt pakkemetode, fysisk Windows-PC, native zoom, installasjon og oppdatering |
| Apple | iPhone og iPad; støtte for Mac i den videre løsningen | Valgt iOS/iPadOS/macOS-pakke, fysisk maskinvare, signering, filflyt og butikkvalidering |

## Føringer som følges i denne revisjonen

- Formel-ID-er og formellokale symboler/enheter beholdes som felles fagdata.
- `MT_IF97` beregner tilstander og prosesser uten DOM, nettverkskall eller brukerlagring. Adapteren støtter både et nettleservindu og `globalThis` i en klassisk Web Worker. Vendorbibliotekets distribusjonsformat beholdes; dette er ikke et nytt React Native- eller Node-pakkesystem.
- Beregningsmotorens referansefixturer skal brukes av alle senere appinnpakninger. GUI, rapporter, autorisasjon og lagring er egne lag.
- Scenarioformatet beholdes, inklusive kompatibilitet med eldre A/B-filer. Appversjoner må kontrollere skjema og motstridende prosesstilstander før eksisterende data erstattes.
- Faglige domenegrenser, fortegn og CC BY 4.0-attribusjon følger beregningene også i en app.
- Privat Pages-preview beholder nettverkskravet. Appbehov gir ingen adgang til å cache beskyttet Education-innhold offline. Offentlig installasjon og beskyttet tilgang må få hver sin dokumenterte lagrings-/tilgangspolicy før publisering.

## Faktisk teknisk kontroll

`tests/students-if97-boundaries-20261027.mjs` kjører samme vendor og adapter i isolerte VM-kontekster med og uten `window`. `tests/students-mollier-process-browser-20261027.cjs` kontrollerer også en faktisk Web Worker i Chromium, Firefox og WebKit når den aktuelle CI-kjøringen består. Workerens 10 bar / 300 °C-resultat sammenlignes med den uavhengige IF97-referansen.

Nettlesermotorer er ikke det samme som signerte native apper eller fysiske enheter. Rapporten for den aktuelle committen angir hvilke tester som faktisk er kjørt. Ingen apprammeverk, utviklerkonto, butikkoppføring, signeringsnøkkel eller offentlig app er opprettet i dette arbeidet.

## Før en app kan publiseres

Velg pakkemetode etter gjennomgang av den eksisterende webkoden. Spesifiser deretter autorisasjon/tilbakekalling, offlineinnhold, sikker lokal lagring, eventuell synkronisering, oppdatering og filimport/-eksport. Utfør tilgjengelighets- og enhetstester for hver målplattform. Disse punktene blir egne leveranser etter faglig akseptanse; publisering krever brukerens klarsignal.
