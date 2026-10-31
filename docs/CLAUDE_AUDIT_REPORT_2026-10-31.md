# Gjennomgangsrapport – Marine Tools hovedside og Education

Dato: 31. oktober 2026. Utført av Claude etter `CLAUDE_HANDOVER_2026-10-31.md`.
Denne rapporten er **ikke** en godkjenning for offentlig utgivelse. Flere manuelle porter står åpne (se avsnitt 6).

## 1. Hva som er testet

| | |
|---|---|
| Testet head | `8a9dd40` (`feature/education-next`, PR #52, draft). Lokal PC-kopi var identisk og ren. |
| Rettelser | Branch `claude/audit-fixes-20261031`, 7 commits oppå `8a9dd40` (se avsnitt 4). **Ikke pushet**: GitHub-appen har ikke skrivetilgang til repoet. Rettelsene ligger som patch-filer i `docs/claude-audit-20261031/`. |
| CI på head | Grønn: validate, integration, browsers ×3, education-browsers ×3, Cloudflare. |
| Lokal kjøring | Hele `students-formula-audit.yml` kjørt lokalt med Chromium på både head og rettet kode (resultat i avsnitt 5). Sympy-testene ble kjørt i Linux-VM-en på PC-en. Firefox og WebKit var ikke tilgjengelige lokalt; der gjelder CI. |
| Privat preview | **Ikke testet.** Previewen (`*.chatgpt.site`) er privat og nås ikke fra mitt miljø. Alle nettlesertester er kjørt mot en lokal server med samme commit. `source-provenance.json` på previewen er derfor ikke kontrollert. |

Statusen for hver av de 205 inventarradene ligger i `CLAUDE_AUDIT_STATUS_2026-10-31.csv`:

| Status | Antall | Betydning |
|---|---|---|
| PASS | 58 | Uavhengig referanse, grense/ugyldig og EN/NB kontrollert |
| FAIL → FIXED | 28 | Feil påvist på head, rettet på branchen og testet på nytt |
| PARTIAL | 111 | Deler av akseptansen er kontrollert; resten er spesifisert i radens notat |
| NOT RUN | 6 | Flyter med lagret historikk, aktiv rute eller manuelle prognoserader |
| BLOCKED | 2 | Konto og klasser krever ekte brukere og backend |

Ingen rad med PARTIAL, NOT RUN eller BLOCKED skal leses som bestått.

## 2. Funn

| ID | Alvorlighet | Område | Funn | Status |
|---|---|---|---|---|
| F-01 | **Høy** | Hovedside, 18 kort | Desimalkomma: `app.js` leste 87 felt med `+$(…).value`. «8,5» ble NaN. Kortene avviste da gyldig inndata (FWA/DWA, Tanktabell, Generator, Batteri, Pumpe, Bølgeperiode m.fl.), viste «—» som et *gyldig* resultat (Set & drift, Storsirkel, Vindkomponent, Sann vind, Rørhastighet), eller droppet rader uten varsel (Bunkringsoversikt telte 1 av 3 leveranser, Utholdenhet og Fartsscenarioer). Handoverens punkt 6 gjaldt bare Education og arbeidsområdet. | Rettet: alle lesere bruker `inputNumber()`. Regresjon `tests/main-numeric-input-browser-20261031.cjs` feiler på head med 27 avvik og består på rettet kode. |
| F-02 | **Høy** | Hovedside, 7 kort | Tomme felt ble stille regnet som 0 og ga «gyldige» resultater (Trykk↔løftehøyde, Peiling/distanse, Koordinater, Vind, Set & drift, Storsirkel, Sann vind). Posisjonsfeltene tolket blanke grader/minutter som 0°. | Rettet, med vakter for NaN og breddegrad/lengdegrad innenfor ±90°/±180°. Dekket av samme regresjon. |
| F-03 | **Høy** | Hovedside NB | Alle valideringsmeldinger og de fleste hjelpetekstene i kalkulatorresultatene var engelske i norsk modus (`MT_I18N.missing`: 231 tekster). | Delvis rettet: 120 statiske tekster oversatt. |
| F-04 | **Høy (åpen)** | Hovedside NB | Selve resultatsetningene er fortsatt engelske og bruker desimalpunktum i NB, f.eks. «30.4 m³ usable · 7.2 days» og «FWA 104.2 mm». Dette er dynamisk tekst og krever maler for tallformat eller lokalisering ved kilden i `app.js`. | **Åpen.** Krever et designvalg om tallformat i NB-resultater og om CSV/eksport skal beholde punktum. |
| F-05 | Middels | Education NB | Kalkulatorvisningen (`students/#calculator/*`) var i stor grad engelsk i NB: feltnavn, beskrivelser, advarsler, ugyldig-meldinger, «RESULT» og feltvalidering «X: must be > 0». | Rettet: 193 strenger og 3 maler, pluss 8 korte etiketter på modellsidene. Gjenstår bare formler og enheter, som bevisst står uendret. |
| F-06 | Middels | Reflow 320/360 px | Horisontal rulling på fem steder: værsiden (36 px, begge språk; posisjonseditor med faste kolonner), kontakt (NB, 77 px), arbeidsområdets formelvisning (NB, 58 px), varmevekslermodellen (NB, 6 px; langt sammensatt ord i tittelen) og pumpemodellen (11 px; uavbrutt formel i notatene). | Rettet med `overflow-wrap` på overskrifter, legend-elementer og notater, `fieldset{min-width:0}` og krympbare koordinatkolonner ≤420 px. Kontrollert på nytt for 19 hovedsider, 15 arbeidsområdevisninger og 45 modeller. |
| F-07 | Middels | CI-dekning | Arbeidsflyten utløses ikke av endringer i `app.js` eller `ui-v854.js`. Hovedsidens kalkulatorer kunne endres uten at Education-arbeidsflyten kjørte. | Rettet: stiene er lagt til, og regresjonen er lagt inn i nettlesermatrisen. |
| F-08 | Lav | Felles tallparser | `MT_PARSE_NUMBER("0x10")` ga 16 (også `0b11`); Education-kalkulatorene godtok dette (displacement: «0x10» → 16,4 t). | Rettet: ikke-desimal syntaks gir NaN. Tom streng gir fortsatt 0 av kompatibilitetshensyn; felt behandler tomt separat. |
| F-09 | Lav | Kalkulator `synchronous-speed` | 4,5 poler ga resultat (bare advarsel). | Rettet: ikke-heltall er ugyldig. |
| F-10 | Lav | Kalkulator `dilution-volume` | Sluttkonsentrasjon over startkonsentrasjon ble godtatt som «fortynning». Varselet fantes bare i en død duplikatdefinisjon i `calculators-expansion-v1.js`, som hoppes over for eksisterende ID. | Rettet i den aktive definisjonen. Duplikatet kan ryddes bort. |
| F-11 | Info | Testmiljø | Testene `model-practice` (reflow) og varmemodellen feilet bare med nyere Chromium-skrift. CI-ens Chromium hadde andre fontmål. Reflow-testene er altså fontavhengige. | Rettet i CSS (F-06); risikoen gjelder generelt. |
| F-12 | Info | Kalkulatorduplikater | `rc-frequency`/`rc-filter`, `engine-swept-volume`/`engine-displacement` og `refrigeration-cop`/`cooling-cop` er faglig like (enheten «ratio» vs «dimensionless»). | Ikke endret. Redaksjonell beslutning. |

Ingen kritiske feil er funnet. Det er ikke funnet feil i formler eller fasiter i noe av det som er regnet uavhengig.

## 3. Uavhengige faglige kontroller

| Kontroll | Omfang | Resultat |
|---|---|---|
| Håndberegning av hovedkortene | 74 verdier i 36 kort, egne formler; NOx, peiling/distanse og koordinatverktøy er i tillegg regnet manuelt (`tests/claude-audit-20261031/oracle_main.py`): restbeholdning/utholdenhet, interpolasjon, temperaturkorreksjon, blanding (massevektet svovel), bunkring, affinitetslover, rør, tanktabell, trykk/løftehøyde, NOx (141,35 MWh × 7,5 g/kWh), smøreolje, trefase, spenningsfall, batteri, motorstrøm, fasekompensering, trafo, ubalanse, ankerradius, FWA/DWA, luftdypgående, bølgeperiode (medsjø), storsirkel og loksodrom, ETA, vind, set & drift, sann vind, kubisk forbruksmodell | 74/74 |
| Education-kalkulatorer | Alle 60, med 66 egne normaltilfeller med andre inndata enn den eksisterende testen, og 23 grense-/ugyldige tilfeller (`calc-oracle.mjs`) | 66/66 normal. 21/23 grense på head; de 2 avvikene er F-09 og F-10, nå 23/23 |
| Kalkulator-UI | 60 × EN/NB: standard, desimalkomma på alle felt, tomt, `0x10`, Unicode-minus, `1e3`, null | Desimalkomma gir identisk resultat; tomt avvises. På head ga `0x10` i «Neddykket volum» resultatet 16,4 t (F-08); etter rettingen avvises det |
| IAPWS-IF97 | Offisielle verifikasjonsverdier fra R7-97: region 1 (h, s ved 3/80 MPa, 300/500 K), region 2 (0,0035/30 MPa, 300/700 K) og Tsat(p) ved 0,1/1/10 MPa (`if97.cjs`) | 15/15 innenfor 1e-6 relativt |
| Oppgavebank | Alle 292 oppgaver kontrollert for samsvar mellom tall i oppgaveteksten og beregningsinndata, svartrinn mot fasit, toleranse, ID-duplikater og fordeling. 56 oppgaver løst helt på nytt for hånd/egen kode (bl.a. sentroide med hull, linse, belysning, skråplan, Euler-knekk, gjengemoment, lagerlevetid, von Mises, likeretter med tenningsvinkel, veivakselakselerasjon, polytrop, sfærisk trigonometri, åttepunkts deviasjonsinterpolasjon, stabilitet og annuiteter) | 56/56 stemmer. Ingen inkonsistente tall, ingen duplikater, 16 per emne i oppgavebanken |
| Matematikk (sympy) | `students-math-equations-20261020.py` i PC-VM med sympy 1.14.0 | PASS (65 identiteter, 177 numeriske prøver) |

Disse kontrollene erstatter **ikke** en rad-for-rad lesing av de 575 hovedformlene og 1 498 uttrykkene, som ikke er gjort (se avsnitt 6).

## 4. Rettelser (branch `claude/audit-fixes-20261031`)

| Commit | Innhold |
|---|---|
| `4388de9` | Desimalkomma og tomme felt i hovedkortene; NaN-vakter; posisjonsfelt; reflow for modellnotater |
| `6c4fedf` | Streng desimalparser; fortynning og antall poler |
| `ae1b4c1` | 120 norske tekster for hovedsiden; regresjonstest og CI-stier |
| `a4d9206` | Reflow for lange norske overskrifter og posisjonseditoren |
| `ed8efde` | 193 norske tekster og 3 maler for Education-kalkulatorene |
| `1a18b1c` | Korte etiketter på modellsidene |
| (siste) | Denne rapporten, statusfil og reproduserbare kontrollskript i `tests/claude-audit-20261031/` |

Brukerdata er ikke berørt. Ingen lagringsnøkler, skjemaer, ID-er eller eksportformater er endret. Rettelsene endrer bare lesing og validering av inndata, presentasjon og CSS. Oversettelsene er mine og bør leses gjennom av en norsk fagperson, på samme måte som den eksisterende katalogen.

Slik tas rettelsene inn: `git am docs/claude-audit-20261031/*.patch` på `feature/education-next`. Alternativt kan GitHub-appen få skrivetilgang, så pusher jeg branchen.

## 5. Testmatrise

| Kjøring | Kode | Resultat |
|---|---|---|
| CI (GitHub) | `8a9dd40` | Alle jobber grønne |
| Lokal arbeidsflyt, Chromium | `8a9dd40` | 82/92 i første forsøk. 9 feilet på miljø (sympy, Chromium-revisjon) og besto etter retting av miljøet. 1 reell feil: `model-practice` reflow 320 (F-06/F-11) |
| Lokal arbeidsflyt, Chromium | rettet kode | 93/93: 91 i hovedkjøringen + 2 sympy-tester kjørt separat med sympy 1.14.0. De genererte evidensfilene er uendret (`git diff` tom) |
| Sympy-tester (PC-VM) | `8a9dd40` | PASS |
| Ny regresjon `main-numeric-input` | head / rettet | FAIL (27 avvik) / PASS (44 kort) |
| Firefox, WebKit | rettet kode | NOT RUN lokalt. Kjøres av CI når branchen pushes |

## 6. Åpne porter – ikke bestått

- **Privat preview.** Ikke testet; ikke tilgjengelig fra mitt miljø.
- **Fysisk Android/iOS** (tastatur, rotasjon, aktivt felt): NOT RUN.
- **Skjermleser** (NVDA/VoiceOver): NOT RUN. Automatiske axe-tester er grønne i CI, men er ikke full godkjenning.
- **Konto og klasse med to ekte brukere**, ekte innlogging og tilgangskontroll: BLOCKED.
- **Ekte LMS/Moodle-import:** BLOCKED.
- **Ekte vær-/AIS-/ruteleverandører:** NOT RUN. Bare de eksisterende simulerte testene er kjørt.
- **Offline-ZIP med native `file://` og nettet av:** NOT RUN manuelt. Den eksisterende CI-testen med lokal transport er grønn.
- **Rad-for-rad faglig lesing av 575 hovedformler / 1 498 uttrykk, og alle 292 oppgaver for hånd:** ikke utført. Oppgavebanken er kontrollert strukturelt, og 56 oppgaver er løst uavhengig.
- **Fysiske grensetilfeller per hovedkort, menyer/søk/favoritter/tilbake-frem, eksport/import-rundtur i arbeidsområdet og full læringssyklus per modell:** dekket av eksisterende CI-tester, ikke uavhengig gjentatt.
- **F-04** (norske resultatsetninger og tallformat på hovedsiden) er åpen.

Samlet preview-akseptanse er derfor **ikke** oppnådd. Det gjenstår minst F-04, previewkontroll, grønn CI på rettet kode i alle tre motorer og de manuelle portene over.
