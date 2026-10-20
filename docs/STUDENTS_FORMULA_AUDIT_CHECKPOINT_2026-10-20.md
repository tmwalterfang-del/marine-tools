# Formelgjennomgang – arbeidsstatus 20. oktober 2026

Arbeidet fortsetter i Draft PR #35. Dette dokumentet gjelder leveransen etter labmodulene på `c704c277080b535800e7459b526183c9320e1aa1`, og er **ikke en ferdigmelding for alle bokkapitlene**.

## Gjennomført i denne arbeidsrunden

- Alle **499 opprinnelige app-ID-er er bevart**, kontrollert mot en egen baseline-fixture. De **309 oppføringene uten symboltabell** har fått eksplisitte, formelspesifikke definisjoner og enheter. Dette er innholds-/metadatadekning, ikke en generell numerisk godkjenning.
- Fire nye, selvstendige fysikkoppføringer: klassisk akustisk Doppler, molekylært gasstrykk med RMS-hastighet, lysfluks og luminans med projisert areal. Totalt **503 appoppføringer**, alle med symboltabeller.
- En ny Doppler-kalkulator med eksplisitt kilde-/observatørkonvensjon og avvisning av soniske/ugyldige inndata. Totalt **60 kalkulatorer** og fortsatt **36 øvingsoppgaver**.
- **3342 kontekstuelle symbolrader** i oppslaget, inkludert symbolene i kildevariantene. Dette er radforekomster i ulike formler og varianter, ikke 3342 forskjellige fysiske størrelser.
- Visuelt lest matematikkens trykte sider **7–22** og fysikkens **23–29**, med **262 matematikkrelasjoner** og **82 fysikkrelasjoner/varianter** registrert. Totalt **344 normaliserte uttrykk** knyttet til **96 appoppføringer**. Uttrykkene er gruppert som relaterte former under eksisterende formelfamilier, og er søkbare. Ingen skannede sider eller originale tabeller/figurer er lagt i repoet.
- En full lokal filintegritets-/OCR-indeks finnes for alle **284 kildebilder**. OCR er kun lesestøtte og telles ikke som faglig eller visuell verifikasjon. Privat revisjonsregister beholder kildebildefilnavn og SHA-256.

## Konkrete avklaringer og rettelser

- **Trykt p.14:** tangenssummen/-differansen øverst til høyre har en feilaktig sin-produktnevner. De registrerte appvariantene bruker cos(α)cos(β), med riktig differanseretning. Avviket er dokumentert, og de korrigerte identitetene er kontrollert symbolsk og numerisk.
- **Trykt p.13:** tan(90°) er udefinert; en divergent ensidig grense er ikke en funksjonsverdi.
- **Trykt p.11:** konisk frustums πs(R+r) er sideflate uten endeflater. Den presenteres ikke som total lukket overflate.
- **Trykt p.16:** kildens vertikale parabel x²=2py bruker p som avstand mellom brennpunkt og styrelinje. Appens eksisterende y²=4px bruker annen akseretning og p som toppunkt–brennpunkt-avstand. Begge konvensjonene er uttrykkelig skilt.
- **Trykte pp.18–19:** reelle logaritmiske antideriverte bruker absoluttverdier og riktige intervallvilkår.
- **Trykt p.22:** absolutt og relativ frekvens skilles. Varians med nevner n er ikke samme estimator som korrigert utvalgsvarians med n−1.
- **Trykte pp.24–25:** eksakt 273,15/459,67 brukes ved skalaomregning; molekyltall er dimensjonsløst, stoffmengde har enhet mol, og kinetisk gasstrykk krever middelkvadrat-/RMS-hastighet.
- **Trykte pp.27–28:** bevegelig kilde og bevegelig observatør skilles i Doppler-modellen. Stavbølger bruker Youngs modul; væskelyd krever passende bulkmodul. Dette er ikke én universell lydhastighetsformel.
- **Trykt p.29:** lysintensitet i cd skilles fra elektrisk strøm i A; luminans bruker projisert areal, og lysutbytte i lm/W er ikke en dimensjonsløs virkningsgrad.
- En målrettet kontroll av **pp.222–224** avklarte hvor korreksjonen for hog/sag skal brukes: kildens tredelskorreksjon legges til midtskipsdypgangen, slik at Teff=(Tf+4Tmid+Ta)/6. Den er ikke den separate quarter-mean-metoden. Korrigering av dypgangsmerker krever samsvar mellom trimgrunnlag og lengdegrunnlag.
- Generelle appavklaringer: massmoment i t·m skilles fra kraftmoment i N·m; positiv-GM statisk krengning kalles ikke loll; I²R angir effekt; Celsius-/Rankine-offset, minutter i ROT, døgn i volumutholdenhet, reversible adiabatvilkår og nullrentegrensen i annuiteter er presisert.

## Faktisk verifikasjon

| Kontrolltype | Resultat | Hva resultatet betyr |
|---|---|---|
| Alle primære symboltabeller | 503/503 har obligatoriske felt | Ingen oppføring mangler en tabell; ikke en komplett dimensjonsbevisføring |
| Baseline-ID-er | 499/499 bevart | Ingen tidligere lagrede formel-ID-er er slettet |
| Matematikk – symbolske identiteter | 65 passerte | SymPy 1.14 med dokumenterte testantakelser; ikke bevis for ethvert reelt/komplekst randtilfelle |
| Matematikk – numeriske prøver | 177 passerte | Utvalgte prøver til identitetskontrollene |
| Fysikk – referanseberegninger | 11 passerte | Utvalgte Doppler-, gasstrykk- og fotometrieksempler; ikke alle 82 uttrykk |
| Fysikk – ugyldige inndata | Kjørte kontroller passerte | Bl.a. null frekvens og soniske grenser |
| Node-studenttester | Alle kjørte `students-*.mjs` passerte lokalt | Omfatter metadata, register, app-logikk og tidligere regresjoner; testtyper skal ikke summeres til ett faglig godkjenningstall |
| Labs med jsdom | 19 passerte | HTML/JavaScript-integrasjon; ingen nettleserlayoutmotor |
| Syntaks og whitespace | Passert | Ingen erstatning for fag- eller nettleserverifikasjon |

Reproduserbare nye tester: `students-symbol-completion-20261020.mjs`, `students-physics-audit-20261020.mjs` og `students-math-equations-20261020.py`. Sistnevnte krever `sympy==1.14.0`. Den oppdaterte offentlige appmatrisen er `STUDENTS_FORMULA_AUDIT_MATRIX_2026-10-20_V3.csv`.

Uavhengig Doppler-grunnlag: OpenStax, University Physics Vol. 1, §17.7: https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect . Konstanter og SI-grunnlag: https://www.bipm.org/en/measurement-units/si-defining-constants . Forklaringer, eksempler og kode er selvstendig formulert; ingen bokillustrasjoner er gjengitt.

## Fortsatt åpent

- **197 registrerte matematikkuttrykk** står fortsatt uten den symbolske/numeriske evidensen som er etablert for de 65 øvrige. Generelle funksjonsregler og full domene-/randtilfelledekning krever videre kontroll. Alle 82 fysikkrader beholder foreløpig konservativ individuell numerisk status; de 11 testeksemplene dekker bare et utvalg.
- Registrering av uttrykk på 23 sider er **ikke sertifisert som uttømmende transkripsjon av hvert tegn/alle grafiske uttrykk på disse sidene**. Detaljer og kildeavvik kontrolleres videre. De resterende bokkapitlene og referansedelen er ikke ferdig gjennomgått.
- Privat kildeinventar, bokbilder og eventuelle private fag-/fartøysdokumenter skal fortsatt holdes utenfor offentlig repo.
- Ekte desktop-/mobil-, tastatur-/skjermleser-, CSV-nedlastings-, utskrifts- og installert offline-/oppgraderingstest av siste appversjon gjenstår. Previewen er beskyttet med eksisterende Cloudflare Access. Ingen tilgangskontroll eller produksjon er endret.
