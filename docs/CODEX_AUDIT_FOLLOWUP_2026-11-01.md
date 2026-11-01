# Oppfølging av Claude-gjennomgangen – 1. november 2026

Arbeidet bygger på `dde8ecef29f1c502927896346dd00018fb92deaf`, inkludert Claudes ni commits etter `8a9dd40`. PR #52 og #53 ble observert lukket uten fletting under oppfølgingen. De gjenåpnes ikke. Rettelsene samles på `codex/claude-audit-followup-20261101`, mot `feature/education-next`, og skal bare vises i eksisterende private preview. Ingen fletting til main, offentlig lansering eller Google Play-publisering er godkjent her.

## Rettelser og akseptanse

| Funn | Endring | Godkjent teknisk resultat |
|---|---|---|
| F-03, gjenstående hovedsidetekst | Lesbare sidenavn i «siste verktøy» erstatter tekniske side-ID-er. Kartveiledning, koordinatvalidering og trendmeldinger er oversatt. Lagrede side-ID-er beholdes. | Bokmål vises i de kontrollerte systemtekstene; navigasjonen bruker de opprinnelige ID-ene. |
| F-04, norske resultater | Resultattekstene i app.js og koordinatverktøyets separate UI bruker utsatte tekstmaler med egne tallverdier. Bokmål bruker desimalkomma; engelsk beholder tidligere tekst, presisjon og avrunding. Resultatet kan skifte språk uten ny beregning. | Sist beregnede resultat beholdes selv om et felt er redigert etter beregningen. Språkbytte endrer ikke felt, fokus, rådata eller historikk. |
| F-04, eksport og historikk | Den eksisterende maskinformateringen `nf()` er beholdt. Tidligere lagret beregningstittel og resultat vises ordrett. Nye beregninger lagres med den eksisterende mekanismen og resultatet som ble vist ved beregningen. | CSV og sikkerhetskopi-JSON har identiske nedlastede bytes på EN/NB med identiske data/tidsstempler. Ingen migrering av gamle poster. |
| F-05, Education | Flere dynamiske mellomregninger er oversatt: opprinnelig/tilført moment, ny KG, dypgang, trim, seilingstid, drivstoff, batterivarighet og masse. Enkelte modelloverskrifter og enhetsforklaringer er oversatt. | Norske forklaringer og uendrede inngangsverdier. Tilbake til engelsk gjenoppretter den opprinnelige forklaringen. Dette er ikke en påstand om full språklig sluttgodkjenning av alt innhold. |
| F-07, CI-utløsning | index.html, product-v860.js, voyage-estimate-v861.js, voyage-planning-draft-v1.js og weather-map-v854.js er lagt til stifilteret. Ny språkregresjon kjøres i nettlesermatrisen. | Endringer i disse filene utløser samme kontroll som Education/hovedverktøyene. |
| F-10, død definisjon | Bare den ubrukte `dilution-volume`-definisjonen i calculators-expansion-v1.js er fjernet. Claudes rettelse i aktiv definisjon beholdes. | Samme 60 aktive kalkulatorer; konsentrering godtas ikke som fortynning. |
| CI-feil på dde8ece | Responsivtesten venter nå på at iframe-adapterens modell-ID er riktig, i tillegg til tittel og SVG. Samme iframe gjenbrukes av flere modeller. Feilutskriften inkluderer modell og felter før/etter. | Testen sammenligner den ønskede modellens felter. Den opprinnelige kontrollen om uendrede inndata beholdes. |
| Preview-sporbarhet | Stageskriptet skriver faktisk Git-branch i source-provenance.json, i stedet for hardkodet feature/education-next. | Previewens kilde kan knyttes til denne oppfølgingsbranchen og den eksakte committen. |

## Testbevis

- Alle 76 lokale kommandoer i validate-delen av students-formula-audit.yml bestod. Python/Sympy bruker eksplisitt Python-miljø. Ingen faglige registre er endret av genereringen.
- `education-responsive-20261020.cjs chromium`: 3 892 kontroller, null feil, åtte skjermstørrelser og 45 modeller. Lokalt brukes Edge med Chromium-motor; Linux CI bruker Playwright Chromium.
- `main-numeric-input-browser-20261031.cjs`: 44 beregningskort med standardverdier, desimalkomma og tomme felt, bestått i Chromium/Edge, Firefox og WebKit.
- `main-result-locale-browser-20261101.cjs`: 46 beregningsknapper, EN→NB→EN, ventende feltendring og fokus, negative/store/nullverdier, historikk, faktisk lagret forbrukspost, nedlastet CSV og JSON. I tillegg fem Education-kalkulatorers dynamiske forklaringer. Se PR-kontrollene for alle tre motorers resultat på endelig kode.
- Engelsk resultat-HTML og feltverdier er sammenlignet mot en separat opptakskjøring på uendret dde8ece: ingen forskjeller for de samme knappene i standard-/komma-/tom-felt-kjøringene.
- Claude-sveipet av hovedkort: 288 kort/variant/språk-rader, null ugyldige resultatmarkører og null JavaScript-feil. Ingen live leverandør er godkjent av denne testen. Diagnoseutdata inkluderer også datoer, enheter, forbigående tekst og feilmeldinger fra bevisst blokkerte leverandører; antall «missing» alene er ikke en måling av synlige oversettelsesfeil.
- Claude-sveipet av Education: 180 modellvisninger (45 × to språk × to bredder), null overflyt, ugyldige resultatmarkører eller JavaScript-feil; 120 kalkulator/språk-kjøringer med flere inndatavarianter. Dette sveipet ble kjørt før de siste ekstra mellomregningsoversettelsene; språkregresjonen dekker de nye forklaringene.
- De uavhengige kontrollprogrammene er kjørt igjen: hovedsidens 74 referansetall, 66 Education-normaltilfeller og 23 grenser/ugyldige tilfeller, oppgavebankens strukturelle audit og 15 IAPWS-punkter. Hovedsidens oracle inneholder tidligere avleste referanser; HTML-sammenligningen og nettlesertestene knytter resultatene til aktuell implementering. Strukturell oppgaveaudit er ikke en ny håndløsning av alle oppgaver.
- Produktoppryddingens nettlesertest bestod lokalt med 162 kontroller, 19 hovedsider og 45 modelltilstander. Hele PR-matrisen er den endelige CI-kontrollen.

CI på utgangspunktet dde8ece var ikke helt grønn: Chromium-jobb 124692934151 i run 41253913586 feilet på «presentation preserves inputs» ved current/laptop. Andre motorer og validate bestod. Venting på faktisk modell-ID fjerner en identifisert mulighet for å lese forrige modell; den lokale gjennomgangen er grønn. Endelig CI-status skal leses på oppfølgingens PR, ikke utledes av Claudes historiske rapport.

## Fortsatt åpent før samlet sluttgodkjenning

Claudes inventar med 205 rader beholdes uten generelle oppgraderinger av PARTIAL, NOT RUN eller BLOCKED: [opprinnelig status](CLAUDE_AUDIT_STATUS_2026-10-31.csv). En rettet språklig feil betyr ikke at alle øvrige krav for en rad er kontrollert.

Fysiske Android/iOS-enheter med tastatur/rotasjon, NVDA/VoiceOver, to ekte kontoer/klasse, faktisk LMS/Moodle-import, ekte vær/AIS/ruteleverandører og manuell native file://-offlinebruk gjenstår. Hele registeret på 575 hovedformler / 1 498 uttrykk og alle 292 oppgaver er ikke nykontrollert rad for rad eller håndløst i denne oppfølgingen.

F-12 (faglig like kalkulatorpar) og F-11 (fontobservasjon) er ikke endret. Ingen innholdssammenslåing, lagringsmigrering, databaseendring eller utvidelse av privat preview-tilgang inngår.

Preview skal beholde én eier og ingen eksterne mottakere. Deploy må være vellykket fra den oppgitte kildecommitten; dette gir teknisk preview-oppdatering, ikke full manuell brukerakseptanse. Godkjent resultat for denne oppfølgingen er de spesifiserte rettelsene med beståtte relevante tester og sporbar kilde. Samlet offentlig sluttgodkjenning er fortsatt ikke oppnådd.
