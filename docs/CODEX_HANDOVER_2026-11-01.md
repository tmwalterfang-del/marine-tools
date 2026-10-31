# Handover til Codex – oppfølging etter Claude-gjennomgang

Dato: 1. november 2026. Dette er en arbeidsbestilling, ikke en godkjenning. Preview-akseptanse er **ikke** oppnådd, og ingenting her gir grunnlag for offentlig utgivelse.

## Start her

- Repository: `tmwalterfang-del/marine-tools`.
- Rettelsene fra gjennomgangen ligger i draft-PR #53, https://github.com/tmwalterfang-del/marine-tools/pull/53:
  - branch `claude/audit-fixes-20261031`
  - head `d77e227` ved skriving (kontroller aktuell head før du starter)
  - base `feature/education-next` (head `8a9dd40`)
- CI på `d77e227`: alle 10 jobber grønne, med `validate`, `integration` og `browsers`/`education-browsers` i Chromium, Firefox og WebKit.
- Cloudflare-preview av branchen står i PR-kommentarene.
- PR #52 er urørt og fortsatt draft. PR #53 er ikke flettet. Trygve bestemmer om og når den flettes; ikke flett den selv.
- Les først:
  - `docs/CLAUDE_AUDIT_REPORT_2026-10-31.md` (funn F-01–F-12, kontroller, åpne porter)
  - `docs/CLAUDE_AUDIT_STATUS_2026-10-31.csv` (status for alle 205 rader i `CLAUDE_AUDIT_INVENTORY_2026-10-31.csv`)
- Lokal rot `C:/Users/tmwal/OneDrive/Dokumenter/ChatGPT/MarineTools` sto på `8a9dd40` med CRLF i arbeidstreet.
  - Hent rettelsene med `git fetch origin` og `git switch claude/audit-fixes-20261031`. Ikke bruk `git apply` på patchene i `docs/claude-audit-20261031/`, de feiler mot CRLF.
  - Mappen `docs/claude-audit-20261031/` og `.qa-deps/claude-node-deps.tgz` / `.qa-deps/claude-sympy.tgz` er usporede reservekopier. Trygve har fått beskjed om at de kan slettes; ikke legg dem i git.

## Rammer (uendret fra handoveren 31.10.)

- Ingen publisering til hovednettstedet, ingen merge til `main`, ingen Google Play, ingen endret tilgang eller deling, ingen kontakt med eksterne.
- Bevar brukerdata: lagringsnøkler, skjemaer, ID-er, utkast og eksportformat. Brukerens egne titler, notater og importerte data skal ikke oversettes.
- De seks utelukkede historiske modellene skal ikke gjeninnføres.
- En test som speiler samme kode, er ikke uavhengig kontroll. PASS krever egen beregning eller navngitt primærreferanse.
- Manuelle porter (avsnitt 6) skal aldri rapporteres som bestått uten bevis fra Trygve.

## Det Claude har gjort (PR #53)

| ID | Funn | Status |
|---|---|---|
| F-01 | 87 numeriske lesere i `app.js` (`+$(…).value`) brøt desimalkomma i 18 hovedkort. Gyldige verdier ble avvist, «—» ble vist som gyldig resultat, eller rader ble droppet (Bunkringsoversikt telte 1 av 3) | Rettet via `inputNumber()`; regresjon i CI |
| F-02 | Tomme felt ble 0 i 7 hovedkort, også i posisjonsfeltene | Rettet med NaN- og ±90°/±180°-vakter |
| F-03 | 231 tekster var engelske i NB på hovedsiden | 120 statiske oversatt. **Resten er oppgave 1–2** |
| F-04 | Resultatsetninger engelske og med desimalpunktum i NB | **Åpen, oppgave 1** |
| F-05 | Education-kalkulatorene var i stor grad engelske i NB | Rettet (193 strenger, 3 maler, 8 modelletiketter) |
| F-06 | Horisontal rulling ved 320/360 px på fem steder | Rettet i CSS |
| F-07 | Arbeidsflyten ble ikke utløst av `app.js`/`ui-v854.js` | Rettet. **Se oppgave 5 for resten** |
| F-08 | `MT_PARSE_NUMBER("0x10")` ga 16 | Rettet |
| F-09/F-10 | `synchronous-speed` godtok 4,5 poler; `dilution-volume` godtok oppkonsentrering | Rettet |
| F-11 | Reflow-tester er fontavhengige (feilet bare med nyere Chromium) | Info |
| F-12 | Faglig like kalkulatorpar | Redaksjonelt valg, ikke endret |

Uavhengig kontrollert og funnet korrekt:
- 74 standardverdier på hovedkortene
- alle 60 Education-kalkulatorer (66 normal- og 23 grensetilfeller)
- 56 av 292 oppgaver løst på nytt, og alle 292 sjekket strukturelt
- IAPWS-IF97 mot de offisielle verifikasjonstabellene (15/15)

Lokalt besto 93/93 kommandoer i arbeidsflyten med Chromium.

## Oppgaver for Codex, i prioritert rekkefølge

### 1. F-04: norske resultatsetninger og tallformat på hovedsiden (høy, krever beslutning)

**Bekreft valget med Trygve før du implementerer.** Claudes forslag, som ikke er godkjent ennå:

- I NB vises tall med desimalkomma og norsk tekst på skjermen.
- CSV, JSON, eksport, rådata og innebygd presisjon beholder punktum og er uendret.
- EN skal være byte-identisk med i dag.

Fakta fra koden på `d77e227`:

- `app.js`: `nf()` er `(n,d)=>…toFixed(d)` og gir alltid punktum. Den har 202 kall, i tillegg kommer `formatHours()` (10 kall) og 5 direkte `toFixed`. Resultatsetningene bygges som malstrenger i `setRes(id, main, sub)`.
- Resultatteksten gjenbrukes som tekst to steder:
  - beregningshistorikken lagrer `result: res.innerText` (rundt linje 289) i `store`. Dette er brukerdata i det språket som gjaldt da den ble lagret.
  - `buildShareText()` (rundt linje 295) kopierer resultatteksten.
  - Avklar om historikken skal lagre rådata og formateres ved visning, eller beholde lagret tekst uendret. Ikke migrer eksisterende historikk uten at Trygve har godkjent det.
- `language-main-20261031.js` har 29 maler med `"generated": true`. Plassholderen i dem gjenkjenner bare punktum som desimaltegn og komma som tusenskille (`i18n-20261030.js`, `addCatalogue`). Lokaliserte tall bryter dermed denne gjenkjenningen.
  - Formater heller ved kilden med `Intl.NumberFormat(MT_I18N.numberLocale)` eller en hjelper rundt `nf()` som leser gjeldende språk, og gjengi på nytt ved språkbytte.
  - Unngå å etterbehandle ferdig tekst.
- Siste måling (`main-cards-audit.cjs` på `d77e227`, 9 sider × 3 varianter): 127 unike tekster mangler oversettelse i NB. 116 av dem er dynamiske med tall, 11 er statiske (se oppgave 2).

Akseptanse:

- Bytt EN → NB → EN på alle 44 kort. Inndata, råverdier og eksportfiler skal være uendret.
- NB viser desimalkomma, og `MT_I18N.missing` på hovedsiden inneholder ingen produkttekst.
- `tests/main-numeric-input-browser-20261031.cjs` består fortsatt.
- Legg til en ny regresjon for NB-tallformat og uendret CSV.

### 2. Resterende statiske NB-tekster på hovedsiden

1. Sjekk om disse sammenslåtte strengene er reelle mangler eller en målefeil fordi `<strong>` og `<small>` leses som én tekstnode. Hver del er oversatt separat:
   - `Check flow and diameterFlow must be nonnegative and diameter positive.`
   - `Check pressure and flowBoth must be nonnegative, explicitly supplied values.`
   - `Check volume, density and temperatureAll required inputs must be present and density positive.`
   - `Complete every active sourceHours, power and emission factors are required for all rows.`
   - `Target outside measured curveUse a speed between the lowest and highest measured points.`
2. Oversett `Click the map or drag the marker to set latitude and longitude. Forecast data loads when you press…`. Hele strengen er lengre enn utdraget; finn den i `weather-map-v854.js`/`ui-v854.js`.
3. Finn kilden til de små sidenavnene `electrical`, `engineering`, `navigation`, `quick`, `vessel calcs`, som vises i NB. De kan komme fra en etikett eller ARIA-tekst bygget av side-ID.

### 3. Hovedkort som ikke er kjørt (NOT RUN, 6 rader)

`Fuel & Energy Log`, `Bunkering history & export`, `Route fuel estimate` (både drivstoff og navigasjon), `Weather window finder` og `Closest point on active route`.

Disse krever lagret historikk, CSV-import, aktiv rute eller manuelle prognoserader. Test etter punkt 3 i handoveren fra 31.10.:
- datoer, summer og CSV inn/ut med desimalkomma og semikolon
- tom, én og mange oppføringer
- sletting og fartøyprofil

I tillegg mangler et relevant fysisk grensetilfelle per kort for de 23 PARTIAL-radene av typen `main-tool`. Det står i radens notat.

### 4. Education, PARTIAL-rader

- **45 modeller:** Hele læringssyklusen forutsi → endre → sammenlign → løs, med uavhengig referanse per modell. I tillegg eksport/import-rundtur (HTML/PDF/CSV/JSON), tastatur og grensepunkter for følsomhet og kart. Gjengivelse, reflow og NB er kontrollert; syklusen er bare dekket av eksisterende CI-tester.
- **16 emner:**
  - 236 av 292 oppgaver er ikke løst uavhengig. De 56 som er løst, er dem `practice-audit.cjs` flagger (`value-not-in-prompt`/`tolerance`). Alle ble kontrollert for hånd og stemte.
  - De 575 hovedformlene og 1 498 uttrykkene er ikke lest rad for rad.
- **12 arbeidsområdevisninger:** Flytene er bare dekket av eksisterende tester. Konto og klasser er BLOCKED.
- I Education er om lag 135 dynamiske tekster med tall (modeller og kalkulatorer) ikke kartlagt for NB. Tallet er målt før de siste oversettelsene.

### 5. Opprydding og CI (lav)

- `students/calculators-expansion-v1.js` har en død duplikatdefinisjon av `dilution-volume`. Den hoppes over fordi ID-en allerede finnes i `calculators-extension.js`. Fjern den eller samkjør den, og kontroller at testene fortsatt består.
- CI-stiene utløses fortsatt ikke av `product-v860.js`, `voyage-estimate-v861.js`, `voyage-planning-draft-v1.js`, `weather-map-v854.js` eller `index.html`. Vurder å legge dem til i `.github/workflows/students-formula-audit.yml`.
- `MT_PARSE_NUMBER('')` returnerer 0 av kompatibilitetshensyn; feltene behandler tomt separat. Gå gjennom kallstedene før du eventuelt endrer det til NaN.
- F-12 (`rc-frequency`/`rc-filter`, `engine-swept-volume`/`engine-displacement`, `refrigeration-cop`/`cooling-cop`): spør Trygve før du slår sammen eller fjerner noe.
- Den nye norske teksten fra Claude (om lag 330 strenger) trenger faglig korrektur, som resten av katalogen.

### 6. Manuelle porter – eies av Trygve

Du kan lage sjekklister eller testskript, men ikke markere disse som bestått:

- privat preview, inkludert `source-provenance.json`
- fysisk Android/iOS
- NVDA/VoiceOver
- to ekte kontoer: innlogging, klasse, oppgave, innlevering og tilgangskontroll
- ekte Moodle-import
- ekte vær-, AIS- og ruteleverandører
- offline-ZIP med native `file://`

## Reproduksjon

Kontrollskriptene ligger i `tests/claude-audit-20261031/`. De er revisjonsverktøy og ikke en del av CI; bare `tests/main-numeric-input-browser-20261031.cjs` er lagt inn i nettlesermatrisen.

```text
python3 tests/claude-audit-20261031/oracle_main.py                  # 74 håndberegninger av hovedkort
node    tests/claude-audit-20261031/calc-oracle.mjs                 # 60 kalkulatorer, 66 normal + 23 grense
node    tests/claude-audit-20261031/practice-audit.cjs              # oppgavebank, konsistens
node    tests/claude-audit-20261031/if97.cjs                        # IAPWS-IF97 verifikasjonstabeller
node    tests/claude-audit-20261031/main-cards-audit.cjs <url> out.json          # kortsveip EN/NB × standard/komma/tomt
node    tests/claude-audit-20261031/edu-audit.cjs <url> docs/CLAUDE_AUDIT_INVENTORY_2026-10-31.csv out.json
node    tests/claude-audit-20261031/reflow-all.cjs <url> <rute> [<rute> …]       # 320/360 px EN/NB
```

`<url>` er en statisk server på repo-roten, f.eks. `python -m http.server 8812`.

Miljø:
- Sett `NODE_PATH` til mappen med `playwright@1.62.1`, `jsdom@26.1.0` og `axe-core@4.11.1` (lokalt `.qa-deps/browser/node_modules`).
- Sympy 1.14.0 finnes i `.qa-deps/python`; sett `PYTHONPATH` dit hvis den ikke er installert.
- Hvis Playwright klager over feil Chromium-revisjon, pek `PLAYWRIGHT_BROWSERS_PATH` til en mappe der forventet revisjon er en symbolsk lenke til installert Chromium, eller bruk `STUDENTS_BROWSER_EXECUTABLE`.

## Ferdig betyr

- Grønn CI på testet head i alle tre motorer.
- Ingen uløste kritiske eller høye feil (F-04 inkludert).
- Hver inventarrad i statusfilen er oppdatert med head, trinn, forventet og faktisk resultat, og evidens.
- Manuelle porter står eksplisitt åpne eller er bestått med Trygves bevis.
- Lever en kort rapport tilbake i `docs/`, slik denne er levert, og ikke rapporter «alt godkjent» mens porter gjenstår.
