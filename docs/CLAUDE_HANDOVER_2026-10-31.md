# Handover til Claude – full gjennomgang av Marine Tools

Dato: 31. oktober 2026. Dette er en gjennomgangsbestilling og en beskrivelse av levert kode, ikke en erklæring om at manuell sluttgodkjenning er utført.

## Start her

- Repository: `tmwalterfang-del/marine-tools`, branch `feature/education-next`.
- PR: https://github.com/tmwalterfang-del/marine-tools/pull/52. Behold som draft til akseptansepunktene nedenfor er dokumentert.
- Privat preview: https://marine-tools-education-next.fondbook66.chatgpt.site/workspace.html#learn.
- Hovedside i samme private preview: https://marine-tools-education-next.fondbook66.chatgpt.site/index.html.
- Sites-prosjekt: `appgprj_6ae4ec2b8a048191b2ff752b81aaa387`. Behold eksisterende eiertilgang. Ikke endre deling.
- Lokal rot: `C:/Users/tmwal/OneDrive/Dokumenter/ChatGPT/MarineTools`.
- Kontroller aktuell PR-head og previewens `source-provenance.json` før testen. Ikke bruk eldre Cloudflare-kommentarer som bevis på hvilken privat versjon du tester.

Brukeren har bedt om en fullstendig faglig og teknisk gjennomgang av hovedsiden og Education. Rett påviste feil innenfor preview-branchen, bevar brukerdata og dokumenter nye tester. Publisering til hovednettstedet, merge til main, Google Play, endret tilgang og kontakt med eksterne er ikke del av oppdraget.

## Implementert i denne oppryddingen

| Punkt | Levert endring | Viktigste kode |
|---|---|---|
| 1. App-promotering | Get the app/Hent appen og Play-lenker fjernet fra synlig hovednavigasjon, startside og arbeidsområde. Den gamle nedlastingssiden forklarer eksplisitt Education-pakken uten nett. | `index.html`, `downloads.html`, `workspace.html`, `sidebar-v858.js` |
| 2. Sidemeny | Sammenhengende utforming, gruppene Verktøy, Læring og arbeid, Innstillinger og informasjon. Sanntidsdata har nedtonet eksperimentmerke. Nyheter ligger med informasjon. Tom nylig-liste skjules; maksimalt tre verktøy. Separat språk-/statusfot og ett rulleområde. | `sidebar-v858.js`, `product-cleanup-20261031.css` |
| 3. Stabil Education-melding | Hele navigasjonsskinnen og lagringsstatusen har stabil plassering sammen med toppfeltet. Høyden følger faktisk toppfelt, vindusstørrelse og språk. Mobil tastaturvisning komprimerer navigasjonen. | `workspace-next-20261030.css`, `product-ux-20261031.js` |
| 4. Referanser | Synlige kapittelnumre og kapittelhenvisninger blir emnenavn. Interne ID-er, URL-fragmenter, dataskjemaer og faglig sporbarhet beholdes. Teknisk kilde-/testprosa omskrives ved presentasjon. Moodle-kategorier bruker emnenavn. | `i18n-20261030.js`, `workspace-lms-20261030.js` |
| 5. EN/NB | Reversibel oversettelse av hovedside, Education, fagforklaringer, symboldefinisjoner, oppgaver og modellgrensesnitt. Felles språkvalg lagres og synkroniseres med rammer. Feilet språkinnlasting gir forklaring og ny prøve, uten falskt norsk språkvalg. | `language-common-20261031.js`, `language-main-20261031.js`, `language-education-20261031.js`, `i18n-20261030.js` |
| 6. Tall og kontekst | Desimalkomma/-punkt, Unicode-minus, grense- og trinnkontroll, tastaturtrinn og norsk tallvisning. Skjemaverdier, maskinpresisjon og data-ID-er oversettes ikke. Tilbakekobling til opprinnelig side tar vare på kontekst. Opprinnelige numeriske utkastnøkler er bevart. | `product-ux-20261031.js`, numeriske UI-lesere, `students/study-tools.js` |
| 7. Verifikasjon/handover | Ny 160-punkts nettlesertest med alle 45 modeller og 19 hovedsider, integrert i CI. Eksisterende tester og eksport/offline-regresjoner beholdes. Full testbestilling og inventar følger denne handoveren. | `tests/students-product-cleanup-browser-20261031.cjs`, arbeidsflyt i `.github/workflows/` |

Oversettelsene bygger på gjennomgåtte setninger og begrensede maler for tall, ikke fri automatisk oversettelse av ligninger. Symboler, kodenavn, standardforkortelser og selve matematikken skal kunne stå uendret. Norsk fagterminologi trenger fortsatt uavhengig faglig korrektur. Hovedsidens norske katalog lastes separat fra den større Education-katalogen.

Brukerens egne prosjektnavn, notater, annotasjoner og importerte celledata merkes som brukerinnhold og skal ikke endres av språkvalg. HTML-rapporter lokaliseres som presentasjon; innebygd JSON beholder rådata og presisjon. Den offentlige service-worker-cachen er ikke utvidet; konto-/klasseinnhold skal ikke havne i offline-cache. ZIP-pakken er en uttrykkelig lokal eksport uten kontodata eller personlige prosjekter.

## Tidligere implementert – skal også gjennomgås

Det eksisterende arbeidet i PR52 omfatter læringsstier, repetisjon/feillogg, selvtester, veiledede tallvarianter, formelfinner ut fra kjente størrelser, prosjekt- og fartøybibliotek, koblede beregninger med proveniens, CSV-import/enhetsmapping, selektiv backup/gjenoppretting, arbeidsbok med revisjoner/diagramannotasjoner, analyse av to scenarioer, lokal følsomhet og toinndatakart, undervisningspakker/Moodle, frivillig kontosynk og lærer-/klasse-/oppgaveflyt.

Alle 45 interaktive moduler har læringssyklusen **forutsi → endre modellen → sammenlign → løs oppgaven**. Det skal være en reell endring i modellen før sammenligning, og et nytt endret scenario må ikke godkjennes med et gammelt svar. Fasit skal være skjult frem til riktig stadium.

Supplerende implementasjonsdokumenter: `STUDENTS_NEXT_IMPLEMENTATION_2026-10-30.md`, `STUDENTS_NEXT_SCOPE_2026-10-30.md`, `STUDENTS_ADVANCED_MODELS_2026-10-30.md`, `STUDENTS_LEARNING_WORKSPACE_2026-10-30.md`. Eldre utsagn om at fagprosa bare er engelsk er erstattet av denne oppryddingen. Skill mellom tidligere dokumentert testkjøring og kontroll på aktuell head.

## Inventar – ingen stikkprøve som erstatning for full dekning

`CLAUDE_AUDIT_INVENTORY_2026-10-31.csv` lister 19 hovedsider, 50 verktøykort i den innlastede hovednavigasjonen, 15 arbeidsområdevisninger, alle 16 emner, 60 Education-kalkulatorer og 45 modeller med ruter og testoppdrag. Hvert kort kan inneholde flere beregninger. Inventaret er et utgangspunkt: inkluder også dynamiske undermenyer, dialoger, søk, favoritter, nyheter og tilstander som oppstår etter inndata.

Oppgavebanken har 292 oppgaver, 17–22 per emne, i tillegg til veiledede tallvarianter for alle 16 emner. Fagregisteret har 575 hovedrepresentasjoner og 1 498 registrerte uttrykk. Emneoversikten for arbeidsområdet inneholder et utvalg av disse; den er ikke hele fagregisteret.

`STUDENTS_PRIMARY_FORMULA_REVIEW_2026-10-30.csv` og `STUDENTS_FULL_EXPRESSION_EVIDENCE_2026-10-30.csv` angir faglig kontekst og evidenstype. Seks historiske modeller er uttrykkelig utelukket fra støttet beregning. De må ikke gjeninnføres som gyldige. Full raddekning betyr ikke 575 eller 1 498 uavhengige numeriske valideringer eller operasjonell sertifisering.

## Test hovedsiden

1. Åpne alle inventarruter via meny, søk, kort, favoritt og direkte URL. Test tilbake/frem, oppfrisking, valgt verktøy og språk.
2. For hvert verktøykort: minst ett uavhengig håndberegnet normaltilfelle, en relevant fysisk grense og ugyldige/ufullstendige data. Kontroller formler, dimensjoner, enhetsomregning, fortegn, avrunding og at resultater ryddes ved feil.
3. Test drivstoff-/bunkringshistorikk, energi- og flerbrensellogg, datoer, summer, CSV og fartøyprofil. Ikke anta at eksisterende lavnivåtester dekker hver brukerflyt.
4. Test alle sidemenygrupper, Nyheter, kontakt-/personvernlenker, språkfot og nylig-liste ved tomme, én og mange oppføringer. Ingen Get the app/Play-promotering skal synes.
5. Vær/AIS/ruteestimat: kontroller venting, tomt svar, feil, frakobling og gammelt vs ferskt innhold med simulerte leverandører. Test deretter ekte leverandørtilgang separat. Et simulert vellykket svar godkjenner ikke en faktisk ekstern integrasjon. Eksterne skjemaer kontrolleres uten å sende inn noe.

## Test hele Education

1. Les alle 575 hovedformler, relevante uttrykksvarianter, symboldefinisjoner, enheter, gyldighetsområder og fortegnskonvensjoner. Verifiser faglige påstander mot primærkilder når nødvendig. Ikke fjern reelle modellbegrensninger, attribution eller sikkerhetsrelevant informasjon som «redaksjonell tekst».
2. Gå gjennom alle 292 oppgaver og alle 16 variantfamilier: konsistent spørsmål/enhet/fasit/toleranse, riktige mellomtrinn, rimelig vanskelighetsrekkefølge og ressurser som åpner riktig modell med riktige tall.
3. For hver av de 60 kalkulatorene: normal/grense/ugyldig tilstand, nullnevner, min/maks, desimalkomma, vitenskapelig notasjon, enheter og lenket formel. Regn et uavhengig referansetilfelle.
4. For alle 45 modeller: gjennomfør hele læringssyklusen, endre minst to ulike inndata, kontroller ligninger/grafakser/enheter, tabell, markør, tilgjengelig beskrivelse og feiltilstand. Test tastatur, zoom/pan/reset, scenariolagring, råutkast, import, HTML/PDF/CSV/JSON og gjenåpning. Sensitiviteter/kart krever kontroll av gyldig område, feilpunkt og rangering.
5. Mollier/Rankine/kjøling: bruk de uavhengige IAPWS/referanse-fixturene, kontroller fase-/regiongrenser, absolutt trykk, entalpireferanse og solverfeil. Ekstrapolasjon skal ikke vises som gyldig resultat.
6. Prøv læringsstier, feilsvar/repetisjon, selvtest med avbrudd/gjenopptakelse, score og skjult fasit. Kontroller import av gammel fremdrift.
7. Prosjekter/koblede beregninger: omregning, kildeidentitet, slette-/endre-kilde, foreldet resultat, samlet rapport og forskjell på brukerens tittel og systemetikett.
8. CSV/backup: deklarert separator og desimalskilletegn, anførselstegn, ugyldige kolonner, endret enhetsmapping som invaliderer forhåndsvisning, selektiv import og gjenopprettingskopi. Kontroller at brukerdata ikke oversettes.
9. Arbeidsbok: tekst, revisjoner, sletting, SVG-annotasjoner med mus og tastatur, rapport/utskrift. Test lange norske tekster og spesialtegn.
10. Konto/klasse: to faktisk forskjellige brukere; innlogging/utlogging, konflikt, sletting/tombstone, læreropprettelse, kodebasert innmelding, tilgangskontroll, oppgave, frist, innlevering, poeng og eksport. En elev skal aldri få skjult fasit eller en annens data. Lokale identitets-fixturer er ikke godkjenning av virkelig innlogging.
11. Pakk ut valgt offline-ZIP og åpne filene med nettet av. Bytt EN/NB, løs en oppgave, åpne en modell og eksporter. Navigasjon skal bli i levert innhold; konto/klasser/sanntidsdata skal ikke tilbys som tilgjengelige uten nett.

## Felles språk-, visnings- og tilgjengelighetsakseptanse

- Test EN → NB → EN og oppfrisking på begge sider av systemet, inklusive eksisterende og nyåpnede rammer. Inndata, råresultater, modell-ID og enhetsvalg skal være identiske. Bare presentasjon skal endres.
- Norsk fagprosa, knapper, etiketter, feilmeldinger, hjelpetekster, aria-etiketter og eksporter skal være forståelige og konsekvente. Ingen «undefined», tomme etiketter, forfatterinstruksjoner, bok-/kapittelhenvisninger eller draft-merker i produktteksten. Legitimerte lokale kladder er en egen lagringstilstand og kan omtales som det.
- Tast faktisk `1,5`, `1.5`, `−1,5e2`, tom verdi, for mange skilletegn, utenfor min/maks og trinnavvik. Ingen `1,5` → `15`. Taster opp/ned skal respektere trinn og grenser; gamle utkast skal fortsatt kunne gjenåpnes.
- Kontroller lagringsmeldingen mens dokumentet og navigasjonen rulles, ved 320/360/390 px, liggende telefon, kort vindu, 200 % zoom og lange norske menyer. Den skal beholde sin plass og ikke skjule felter eller knapper.
- Fysisk Android/iOS: åpne/lukk tastatur, flytt fokus, roter, gå tilbake fra modell, og kontroller at aktivt felt er synlig. Nettleseremulering erstatter ikke dette.
- Tastatur: hoppelenker, fokusmarkering, logisk rekkefølge, faner, Escape, kontroller og grafalternativ. Manuell skjermleserprøve med NVDA/VoiceOver. Automatiske axe-tester alene er ikke full tilgjengelighetsgodkjenning.

## Reproduserbar automatisk verifikasjon

CI-arbeidsflyten er `.github/workflows/students-formula-audit.yml`: 76 faglige/kjerne-/DOM-/servertester og nettlesermatrisen Chromium/Firefox/WebKit. Ny oppryddingstest kjøres i samme matrise. Kontroller konklusjonen på aktuell head, ikke bare en grønn eldre kjøring.

Eksempel med Node, Playwright 1.62.1, jsdom 26.1.0, axe-core 4.11.1 og Python/sympy 1.14.0:

```text
node tests/students-product-cleanup-browser-20261031.cjs chromium
node tests/students-next-workspace-browser-20261030.cjs chromium
node tests/students-discovery-cycle-browser-20261030.cjs chromium
node tests/students-model-practice-browser-20261030.cjs chromium
node tests/students-session-browser-20261027.cjs chromium
node tests/students-workspace-accessibility-20261030.cjs
node tests/students-full-reference-20261030.mjs
node tests/students-calculator-reference-20261029.mjs
node tests/students-practice-bank-reference-20261030.mjs
node tests/students-lms-export-20261030.cjs
```

Kjør tilsvarende nettlesertester med `firefox` og `webkit`, samt resten av arbeidsflyten. Sett `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH` og `STUDENTS_PYTHON` etter faktisk lokal installasjon. På Windows er Chromium prøvd via Edge med `STUDENTS_BROWSER_EXECUTABLE`; CI bruker installert Chromium. WebKit-kontrollen av offline-pakken bruker bare innhold fra ZIP over en lokal fixturetransport med alle andre forespørsler blokkert; den dokumenterer ikke native `file://`-atferd i Safari.

Lokal evidens fra denne oppryddingen: den nye oppryddingstesten har bestått 160 kontroller i hver motor; faglige/kjerne-/DOM-/servertester er kjørt, inklusive full raddekning, 292 spørsmål og 60 kalkulatorer. De 12 automatiserte tilgjengelighetsvisningene hadde ingen A/AA-brudd; engelsk førstegangsvisning var brukbar etter 5.2 s ved simulert 150 ms/500 kbit/s, med 274 808 byte/17 forespørsler. Dette er en måling, ikke garanti for alle sider eller norsk førstegangsinnlasting. Rå nettleserresultater/skjermbilder ligger lokalt under `qa-education-*/`; CI laster opp egne artefakter.

## Hva er et godkjent resultat?

**PASS** for en inventarrad krever identifisert head/URL, utførte trinn, forventet og faktisk resultat, evidens og kontroll av både normal- og feiltilstand. Faglige rader må ha en selvstendig beregning eller navngitt primærreferanse, toleranse og gyldighetsområde. En eksisterende test som speiler samme kode er ikke alene en uavhengig kontroll.

**FAIL** skal ha reproduksjon, alvorlighet, side/modell/ID, språk, enheter, inndata og konsekvens. Rett feilen, legg til en meningsfull regresjon og test berørt flyt på nytt. **BLOCKED** eller **NOT RUN** brukes når faktisk konto, fysisk enhet, skjermleser, ekstern LMS eller leverandørtilgang mangler. Disse radene er ikke bestått.

Samlet preview-akseptanse krever grønn CI på testet kode, ingen uløste kritiske/høye feil, komplett inventar uten tause hull, korrekte tall/enheter/forutsetninger, bevart brukerdata og fungerende EN/NB. Manuelle enhets-, skjermleser-, innloggings-, reell elev- og LMS-porter skal enten være bestått med bevis eller stå eksplisitt åpne. Ikke rapporter «alt godkjent» mens slike porter gjenstår.

Lever en gjennomgangsrapport med inventarstatus, feil/rettelser, testmatrise, lenker til evidens og gjenstående porter. Brukeren beslutter eventuell senere offentlig utgivelse; denne handoveren gir ingen slik godkjenning.
