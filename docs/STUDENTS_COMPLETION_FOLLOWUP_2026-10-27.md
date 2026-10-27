# Marine Tools for Students — videre faglig kontroll og appberedskap

Oppfølging 27. oktober 2026 i Draft PR #35, med utgangspunkt i `4c9e59f84af39220f7b01247e1781c9c6a1cacd4`. Denne rapporten supplerer og oppdaterer tallene i den tidligere tekniske rapporten fra samme dato. Ingen merge eller produksjonsdeploy er utført. Studentrettet innhold er fortsatt på engelsk.

## Faktiske endringer

1. **286 nye regneprøver for 276 uttrykk i alle 16 kapitler.** Hvert tilfelle har konkrete inndata, forventet verdi, selvstendig forklaring og SHA-256 av det faktiske uttrykket med lokale symboler og forutsetninger. Testen leser den leverte formelens høyreside; den tester ikke bare en separat kopi av formelen. De kontrollerte signalformene sammenlignes også med numerisk integrasjon av signalet. Finansielle annuiteter sammenlignes med summen av enkeltvis diskonterte betalinger.
2. **236 tidligere PENDING-uttrykk får utvalgt numerisk referanse.** Tidligere sterkere KCL-evidens beholdes. Registeret har nå 357 uttrykk med `REFERENCE_CASE_COVERED`, 59 med tre identitetsprøver og ti med uavhengige KCL-referanser. **1 012 er fortsatt PENDING**, og seks generelle symbolske funksjonsregler mangler numeriske spesialiseringer. Dette er utvalgte regneprøver, ikke bevis for alle domener.
3. **Ni nye symbolrettinger:** lokal trim-inngang i åtte KN-uttrykk, samt skjærkraft V og integrasjonskoordinat ξ i ett bøyemomentintegral. Samlet i dagens oppfølging er 21 uttrykksrader rettet, med de tolv fra den tidligere revisjonen inkludert.
4. **1 346 dimensjonskontrollerte uttrykk**, opp fra 1 333 ved start. KN får en eksplisitt kontrakt: vinkel, deplasement og trim inn, meter rettende arm ut. Fem spesifiserte derivat-/integraluttrykk får kontroll av dimensjonen til integranden og differensialet. Dette verifiserer enheter, ikke formen på en fartøyspesifikk hydrostatisk kurve eller integralets numeriske verdi. Ukjent/endret kalkulusnotasjon avvises til ny vurdering. **152 særtilfeller er fortsatt uten maskinell dimensjonsvalidering.** Ingen tolket dimensjonsmotsetning ble funnet.
5. **Mollier-grensefeil rettet.** Den direkte overhetet-beregningen godtok temperaturer litt over metning som de inverse p–h/p–s-løserne avviste på grunn av en ti ganger større numerisk margin. Løserne bruker nå samme nedre grense. Tilstandene kan beregnes, brukes som prosessinngang og gjenåpnes fra scenario. Prosessbanens første/siste trykk beholdes eksakt, slik at avrunding i potensberegningen ikke flytter et endepunkt utenfor domenet.
6. **Appberedskap konkretisert.** Den samme IF97-adapteren støtter `window` og `globalThis` uten DOM. Tester kjører den i begge kontekster, og browser-testen kjører den også i en faktisk Web Worker. Plattformmål og gjenstående native akseptanse er dokumentert i `STUDENTS_APP_READINESS_2026-10-27.md` for Android/Google, Samsung, Windows, iPhone/iPad og Mac. Ingen appinnpakning eller butikkoppføring er opprettet.

## Status per kapittel

«Nye referanser» teller unike uttrykk i den nye fixturen; noen hadde også tidligere referansebevis. De 286 regneprøvene omfatter flere signal-/vinkeltilfeller for enkelte uttrykk.

| Kapittel | Registrerte uttrykk | Dimensjonskontrollert | Uttrykk med nye referanser | Fortsatt numerisk PENDING |
|---|---:|---:|---:|---:|
| 1 Matematikk | 262 | 178 | 20 | 177 |
| 2 Fysikk | 82 | 74 | 15 | 67 |
| 3 Mekanikk | 204 | 204 | 15 | 188 |
| 4 Maskinelementer | 53 | 53 | 19 | 34 |
| 5 Kjemi | 70 | 47 | 17 | 31 |
| 6 Elektroteknikk | 144 | 142 | 20 | 100 |
| 7 Elektronikk | 126 | 101 | 20 | 54 |
| 8 Kraftelektronikk | 51 | 50 | 14 | 31 |
| 9 Motor-/fremdriftsrelasjoner | 107 | 103 | 20 | 78 |
| 10 Damp-/turbomaskiner | 35 | 35 | 18 | 16 |
| 11 Termo-/strømningslære | 143 | 142 | 19 | 104 |
| 12 Kjøling/varmetransport | 26 | 26 | 18 | 7 |
| 13 Navigasjon | 50 | 46 | 17 | 31 |
| 14 Last og skipslære | 121 | 121 | 20 | 94 |
| 15 Økonomi | 14 | 14 | 14 | 0 |
| 16 Dypgangskorreksjoner | 10 | 10 | 10 | 0 |

Samlet analytisk disposisjon: **1 449 under oppgitte forutsetninger, 43 korrigert/kvalifisert og seks OPEN**. Dette er forskjellige kategorier fra numeriske og dimensjonale kontroller. Null PENDING i kapittel 15/16 betyr at hvert registrert uttrykk har en valgt regneprøve; det betyr ikke full gyldighetskontroll for alle finansielle eller fartøyspesifikke situasjoner.

## Originalkilde og seks åpne historiske modeller

Den opprinnelige `Teknisk formelsamling.zip` ble funnet og hentet inn: 284 JPG-filer. De fem trykte sidene **48, 50, 51, 52 og 212** ble visuelt gjenlest for de seks åpne uttrykkene. Sidefilenes navn og SHA-256 følger de individuelle registrene. Dette er målrettet ny kildekontroll; alle 218 hovedsider er ikke visuelt gjenlest på nytt i denne oppfølgingen. Ingen skann, originalgrafikk eller særpreget kildetabell er lagt i repoet.

| Åpent uttrykk | Kildekonkordans ved ny lesing | Fortsatt uavklart |
|---|---|---|
| Hvelvet trykkhode, p.48 | Den registrerte formen og oppgitte geometriforutsetninger er synlige i kilden | Historisk formfaktor og anvendelig dimensjoneringsgrunnlag er ikke uavhengig validert |
| Sveisespenning, p.50 | Den historiske grunnmaterialspenningen og sveisefaktoren gjenfinnes | Relevant skjøt, spenningsgrunnlag og vurderingsregel |
| Effektiv sveiselengde, p.50 | Endefradragsmodellen gjenfinnes | Anvendelig regel og faktisk effektiv hals ved endene |
| Lager K₁, p.51–52 | Korrelasjon og henvisning til geometri-/filmavhengig diagram er bekreftet | Uavhengig kalibrering, temperatur og drifts-/randbetingelser |
| Lager K₂, p.52 | Friksjonskorrelasjonens diagramavhengighet er bekreftet | Samme kalibrerings-/driftsgrunnlag; ingen universell konstant |
| Kornlastens GM-ledd, p.212 | Den historiske koeffisienten gjenfinnes | Godkjent kornlastmodell og gyldighet for den aktuelle geometrien |

Alle seks beholdes som **reference-only**. Kildekonkordans er nå styrket; det erstatter ikke modellvalidering. Ingen koeffisienter er valgt vilkårlig, og ingen av disse får ny kalkulator eller «validert»-merking.

## Mollier-støtte og avgrensninger

Uendret fysisk domene: metning/tofase ved **0,01–160 bar(a)**; stabil overhetet IF97 Region 2 ved **0,01–160 bar(a)**, over metning med den oppgitte numeriske marginen, til **600 °C**. h oppgis i kJ/kg og s i kJ/(kg·K). Region 3, kritisk punkt og underkjølte endepunkter støttes ikke. Ingen tabellinterpolasjon eller nettleverandør brukes som fallback.

Isentropisk ekspansjon, ideell struping og turbin med oppgitt isentropisk virkningsgrad beholder tidligere energibalanser og fortegn. Den irreversible turbinbanen tegnes fortsatt ikke som en utledet prosess. CC BY 4.0-attribusjonen følger det uendrede Neutrium-biblioteket.

## Tester og etterprøvbarhet

Lokalt gjennomført:

- 29 `students-*.mjs`-testprogrammer og tolv DOM-/eksport-/navigasjonstestprogrammer bestod.
- Nye referanseprøver: **286 tilfeller / 276 uttrykk / 16 kapitler**. Fixturen er `tests/fixtures/students-worked-cases-20261027.json`.
- Nye IF97-grense-/kontekstprøver: **1 240 kontroller**, med og uten `window`, blant annet temperaturavstander 1,1×10⁻⁷ til 100 °C over metning ved sju trykk. Disse er regresjonskontroller; de erstatter ikke uavhengige IF97-tallreferanser.
- Eksisterende IF97-test: **1 724 kontroller mot 225 uavhengige tilstander** bestod. Maksimalt observert avvik var uendret: h ca. 1,53×10⁻⁶ kJ/kg og s ca. 2,47×10⁻⁹ kJ/(kg·K).
- Hele uttrykksregisteret, lokale kontekstdigester, dimensjonsregistre og valgt numerisk evidens er synkronisert. De seks OPEN-radene beholder åpen status.

Nettleserbinærene kunne ikke installeres lokalt: nedlastingen ga ufullstendige ZIP-data. Chromium/Firefox/WebKit-kontrollene kjøres derfor i GitHub Actions på Draft-grenen. Den aktuelle kjøringens resultat skal kontrolleres i PR #35; grønn historisk CI fra forrige head gjelder ikke automatisk denne endringen. Browser-testen er utvidet med reell worker-kjøring, nær-metning-prosess og scenario-gjenåpning. Sluttstatus oppgis først etter at kjøringen er ferdig.

Nøkkelkommandoer:

```text
node tests/students-worked-cases-20261027.mjs
node tests/students-dimensions-followup-20261027.mjs
node tests/students-if97-expanded-20261027.mjs
node tests/students-if97-boundaries-20261027.mjs
node tests/students-expression-review-ledger-20261020.mjs
node tests/students-review-report-20261027.mjs
node tests/students-mollier-process-browser-20261027.cjs chromium
node tests/students-mollier-process-browser-20261027.cjs firefox
node tests/students-mollier-process-browser-20261027.cjs webkit
```

## Gjenstående akseptanse

De seks historiske modellene, 152 særgrammatikker uten maskinell dimensjonskontroll, 1 012 PENDING-uttrykk og seks generelle symbolske reglers numeriske spesialiseringer er fortsatt tydelig registrert. De 152 omfatter blant annet boolsk algebra, kjemiske strukturer, symbolsk matematikk og enhetskonvensjoner; manglende dimensjonsparsing er ikke det samme som faglig feil.

Fysisk mobil/nettbrett, Samsung Internet/aktuell WebView, native zoom, projektor, signerte apper og appbutikkflyt krever egen praktisk akseptanse. Tillatt og ikke-tillatt Cloudflare-identitet må kontrolleres i den faktiske tilgangspolicyen. Privat preview forblir nettverksbasert uten offline-cache av beskyttet innhold. Ingen brukerdata eller live tredjepartsleverandører er brukt i regresjonstestene.

Ved felles gjennomgang: prøv en våt isentrope, en struping og en turbin med virkningsgrad, gjenåpne rapport/scenario, og gjennomgå de seks åpne modellene og appmålene. PR-en beholdes Draft; publisering krever uttrykkelig klarsignal.
