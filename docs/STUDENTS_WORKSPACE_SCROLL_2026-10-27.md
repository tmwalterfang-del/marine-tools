# Interaktive verktøy — én vertikal scroll

Brukerens layout-/scrolltilbakemelding 27. oktober 2026 er fulgt opp i Draft PR #35. Arbeidet bygger på `93e418e579699ede59ca33a3daf410f119b0fa5a`. Ingen merge eller produksjonsdeploy.

## Årsak og endring

Arbeidsområdet brukte iframe-høyder på 82/85 vh med minimum 500/600 px. Presentasjonsvisningen satte også en fast rammehøyde. Lange moduler fikk derfor en scrollbar inne i rammen i tillegg til hovedsidens scrollbar.

Den innebygde modulen måles nå i en egen naturlig innholdsblokk. Rammens høyde følger hele innholdet. ResizeObserver og DOM-observer fanger blant annet åpning/lukking av inndata, endrede resultater, nye operasjoner, feilmeldinger og endret skjermbredde. Målingen bruker ikke dokumentets scrollHeight som høydegrunnlag; det ville hindret en høy ramme i å krympe igjen. Ingen overflyt klippes bort for å skjule problemet.

Presentasjonsvisningen tilpasser fortsatt selve diagrammet til den ytre skjermhøyden, mens hele modulinnholdet følger hovedsidens scroll. Dette hindrer også at diagrammets vh-baserte dimensjoner og automatisk rammehøyde driver hverandre til stadig større størrelser. Presentasjonsvisning og Escape beholder inndata og grafnoder.

Innebygde moduler viser ikke en ekstra navigasjonslinje, hero, verktøylinje eller footer. Modulens navn, forklaring, forutsetninger, inndata, resultater og eksport er bevart. Moduler gjenbrukes fortsatt når man bytter, slik at utfylte verdier beholdes. Standalone-lenken er tilgjengelig. Tilgangs-/innloggingssider dekoreres ikke eller omgås.

Brede datatabeller kan fortsatt rulles vannrett i sin tabellbeholder på små skjermer. Endringen gjelder den unødvendige doble vertikale scrollingen; den fjerner ikke nødvendig tilgang til brede tabeller.

## Kontroller

`tests/education-single-scroll-20261027.cjs chromium|firefox|webkit` kontrollerer alle 15 moduler ved 1440 og 390 px bredde, i vanlig visning, presentasjon og etter tilbakeføring:

- Ingen vertikal overflyt eller indre scrollposisjon i modulrammen.
- Ingen sidebred vannrett overflyt og ingen ustabil vekst over flere layoutbilder.
- Inndatafelter kan åpnes/lukkes og høyden følger med.
- Dynamisk innhold øker høyden; fjerning krymper den igjen.
- Endrede inndata beholdes etter modulbytte.
- Faktisk musehjul over modulen flytter den ytre siden, mens den indre scrollposisjonen forblir null.
- Skjermbilder av PC-/mobilvisning lagres som CI-artefakter etter at siden er rullet til toppen.

Eksisterende Education-akseptanse tester også beregninger, scenarioimport/-eksport, rapporter, presentasjonsvisning og tastatur. De lokale DOM-testene for navigasjon, undervisningsvisning og bevart modulstatus bestod før commit. Resultatet fra den aktuelle Chromium-/Firefox-/WebKit-kjøringen fremgår av PR #35; eldre grønne kjøringer sertifiserer ikke denne endringen.

Fysisk mobil, native app-/WebView-miljø og faktisk projektor er fortsatt egne praktiske kontroller.
