# Ekstra akseptansetester – 21. oktober 2026

Kun preview i Draft PR #35. Ingen merge eller produksjonsutgivelse.

## Det som testes

`tests/education-acceptance-20261021.cjs` utfører følgende mot den aktuelle utsjekkingen i faktiske headless Chromium-, Firefox- og WebKit-motorer:

- Alle 15 moduler: endrede inndata, bytte til annen modul og tilbake, faktiske JSON-/HTML-nedlastinger, rapportens innebygde tall mot beregningskopien, gjenåpning gjennom filvelgeren og ny beregning.
- Tomme felt, ekstremt store verdier, null og negative verdier vurdert mot den enkelte modellens domene. Negative veivakselavlesninger og null strøm-/investeringsverdier skal ikke avvises automatisk.
- Feil modul i importfil skal gi beskjed og bevare eksisterende gyldige data.
- En uavhengig referanse følger endret skipslengde gjennom trimvisningen til forre og aktre dypgang.
- CSS-zoom 125/150/200 %, tilgjengelig diagram/modulbeskrivelse, Escape og endring av vindusstørrelse mens presentasjon er aktiv. Dette er ikke native Windows/Firefox-zoom eller projektortesting.
- Chromium: faktisk installert service worker, oppgradering fra en eldre cache, bevaring og gjenåpning av lagrede laboratorieinndata, offline offentlig app og avvist offline-navigasjon i privat preview.

## Funn fra kildegjennomgangen

Visuell kontroll ved 200 % CSS-zoom avdekket at et desimaltall kunne deles over to linjer i resultatkortet. Numeriske presentasjonsresultater holdes nå på én linje, og skriftstørrelsen tilpasses kortets bredde. En egen kontroll krever at tallene både forblir samlet og holder seg innenfor kortet ved alle tre zoomnivåer i trim- og veivakselmodulene.

Den tidligere service workeren hadde samme offline-cache på privat preview og offentlig app. Dessuten manglet `teaching-view.js` og `source-review-20261020.js` i precache-listen. Ny worker bruker nettverk uten offline-fallback på Pages-preview, aktiveres straks der, og rydder tidligere Marine Tools-cacher. Lokal brukerdata i localStorage fjernes ikke. Offentlig app beholder offline-modus og får de manglende ressursene og ny cacheversjon.

Dette stanser service workerens gjenbruk av beskyttet innhold uten nett. Det beviser ikke at en bruker som allerede har lastet en side, mister innholdet fra en åpen fane, eller at filer brukeren bevisst har lastet ned kan tilbakekalles.

I lokal worker-test velger testserveren preview-grenen med et kjent Pages-hostnavn. Den faktiske worker-logikken kjøres installert i Chromium, men denne testen er ikke en Cloudflare Access-test.

## Krever separat bekreftelse

- Aleksanders egen e-postinnlogging og reell avvisning av en annen identitet krever normal Cloudflare Access-innlogging/policykontroll. Ingen andres e-postkode eller innboks brukes.
- Fysisk mobil/nettbrett, skjermtastatur, native zoom på brukerens PC og faktisk projektor kan ikke sertifiseres med nettleseremulering.
- Live dataleverandører og de seks åpne faglige modellforholdene forblir egne akseptansepunkter.

Kjøringsresultater, skjermbilder og faktiske eksportfiler følger commitens GitHub Actions-artefakter. Grønne resultater skal først oppgis når den aktuelle kjøringen er fullført.
