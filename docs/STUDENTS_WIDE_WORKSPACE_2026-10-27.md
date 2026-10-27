# Bred arbeidsflate og skjulte modulscrollbarer

Oppfølging av brukerens tilbakemelding 27. oktober 2026. Endringene ligger i Draft PR #35 og bygger på `2524357ab8a9bdda47e8e317cd84b4862cf2ba96`. Ingen merge eller produksjonsdeploy.

- Arbeidsområdet bruker nå skjermbredden, fremfor en 1450 px hovedkolonne med permanent sideliste og store doble marger. Ved 1920 px testes at selve modulen får minst 94 prosent av skjermbredden når listen er lukket.
- Den grupperte verktøyvelgeren ligger alltid øverst. Den søkbare sidelisten åpnes valgfritt med «Show module list» og foldes sammen igjen med «Hide module list». Inndata og åpne moduler beholdes.
- Introduksjonen er mer kompakt, og verktøyvalg, presentasjonsknapp og fullvindu-lenke deler en verktøylinje. Den dupliserte ytre modultittelen er tilgjengelig for hjelpemidler uten å ta en ekstra synlig rad. Modulens egen tittel, forklaring og forutsetninger er fortsatt synlige.
- Unødvendig rammeborder og indre marger er fjernet. På bred skjerm får eksisterende inndata-/resultatkolonner faktisk plass ved siden av hverandre.
- Modulens naturlige innholdshøyde måles fortsatt. Root-dokumentets vertikale scrollbar/gutter skjules nå også eksplisitt, og iframe-scrolling deaktiveres etter at innholdet er identifisert som en ekte Education-modul. Tabellenes egne vannrette scrollområder beholdes. Eventuell vertikal scrolling skjer på hovedsiden.
- Når rammen laster en annen type side, inkludert innlogging, fjernes iframe-overstyringen. Tilgangskontroll omgås ikke og innloggingssider får normal scrolling.

## Verifisering

`tests/education-single-scroll-20261027.cjs chromium|firefox|webkit` er utvidet med root-scrollbar/gutter-kontroll, faktisk utnyttelse av 1920 px skjermbredde, sideliste inn/ut, og side-ved-side-plassering av inndata/resultater. De eksisterende kontrollene for alle 15 moduler, mobil, presentasjon, dynamisk innhold, bevarte inndata og musehjul over modulen beholdes.

Education-akseptanse velger nå moduler via den alltid tilgjengelige toppvelgeren. Navigasjons-/DOM-testene kontrollerer også menyens tilgjengelige åpne/lukke-tilstand og at innloggingsinnhold ikke får overstyrt scrolling. Faktiske Chromium-/Firefox-/WebKit-resultater og skjermbilder følger den aktuelle CI-kjøringen i PR #35. Fysisk Windows-/Apple-/Samsung-maskinvare er fortsatt egne praktiske tester.
