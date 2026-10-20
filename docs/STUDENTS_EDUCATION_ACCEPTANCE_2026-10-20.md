# Education – faglig uttrykkskontroll og visuelle endringer

Dato: 20. oktober 2026. Gjelder preview i Draft PR #35. Ingen merge eller produksjonsutgivelse er godkjent.

## Resultat

**Alle de 1 498 registrerte, normaliserte kildeuttrykkene er gjennomlest analytisk i denne runden, kapittel for kapittel.** 1 470 er vurdert som konsistente under de oppgitte vilkårene; 22 har fått rettet uttrykk, presisert topologi/vilkår eller korrigert lokal symboldefinisjon; 6 har uavklarte modell-/kildebegrensninger. En gjennomført vurdering er ikke det samme som en godkjenning av alle uttrykkene.

Kontrollen omfatter matematisk/fysisk sammenheng, fortegn, enhetsgrunnlag, lokale symboldefinisjoner og gyldighetsvilkår. Numeriske og symbolske testbevis beholdes som egne felt. Ikke-testede uttrykk blir ikke omklassifisert til numerisk bestått.

## Avgrensning som påvirker godkjenning

Registeret inneholder normaliserte relasjoner, grupperte varianter og enkelte selvstendige erstatninger for problematiske bokuttrykk. Det er ikke en ordrett, uttømmende transkripsjon av hver trykte likning, empiriske tabell og kurve i boken. Den tidligere sideoversikten har derfor fortsatt ikke sertifisert at hver trykte side er uttømmende dekket. Denne rapporten hevder ikke at alle bokens mulige kildeuttrykk er ferdigverifisert.

Alle registrerte formler og vilkår ble lest i denne runden. Tidligere visuelle kildeavlesninger er beholdt som tidligere bevis. Originalsidene 48, 50, 51, 52, 109, 110, 111, 161, 163, 212 og 223 ble åpnet på nytt for konkrete krets-/korrelasjonskontroller; øvrige originalsider er ikke visuelt lest på nytt i denne runden. Den automatiske dimensjonskontrollen dekker 1 011 uttrykk, mens 487 ikke kan parses av denne kontrollen. Dimensjonslikhet alene beviser ikke koeffisient, skala, domene eller fysisk anvendelighet.

## Kapittelvis dekning

| Kapittel | Uttrykk gjennomgått | Rettet/presisert | Uavklart modell/kilde |
|---|---:|---:|---:|
| 1. Matematikk | 262 | 0 | 0 |
| 2. Fysikk | 82 | 0 | 0 |
| 3. Mekanikk | 204 | 0 | 1 |
| 4. Maskinelementer | 53 | 0 | 4 |
| 5. Kjemi | 70 | 0 | 0 |
| 6. Elektroteknikk | 144 | 1 | 0 |
| 7. Elektronikk | 126 | 8 | 0 |
| 8. Kraftelektronikk | 51 | 0 | 0 |
| 9. Motorteori | 107 | 0 | 0 |
| 10. Dampteori | 35 | 1 | 0 |
| 11. Varme og strømning | 143 | 8 | 0 |
| 12. Kjøleteknikk | 26 | 0 | 0 |
| 13. Navigasjon | 50 | 0 | 0 |
| 14. Last og stabilitet | 121 | 2 | 1 |
| 15. Økonomi | 14 | 0 | 0 |
| 16. Korrigert deplasement | 10 | 2 | 0 |

## Konkrete rettinger

- Gyrator på s.109: tidligere konstant induktans og forenklet Q erstattet av frekvensavhengige, ideelle portuttrykk utledet fra kretsens nodebalanser. Resistorenes koblingspunkter og tilnærmingsvilkår er eksplisitte.
- Kapasitansmultiplikator på s.110: eksakt serieekvivalent kapasitans er C(1+R₂/R₁). Med den fysiske kondensatoren C er tapsfaktoren ωCR₂. Den tidligere ωCR₁ er feil for kretsen som er tegnet.
- MFB-båndpass og notch: komponentkoblingene beskrives eksplisitt. Notchens passbåndsforsterkning er 2Q²/(1+2Q²), ikke nødvendigvis 1. Komponentuttrykkene er kontrollert mot uavhengige nodebalanser og halverte effektpunkter.
- Elektrisk felt F/q: komponenter kan være fortegnsbestemte; størrelsesberegning bruker absoluttladning eller positiv prøveladning.
- Isotermt idealgassarbeid: reversibel/kvasistatisk isoterm prosess kreves for logaritmeformelen. Entropiformelen med bare volumleddet krever like start-/sluttemperaturer.
- Naturlig konveksjon: vertikal plate og horisontal sylinder får riktig geometri og karakteristisk lengde uttrykkelig angitt.
- Pumpeeffekt: Δp i ΔpQ er ekvivalent total trykkøkning, ikke alltid bare statisk differansetrykk mellom flensene.
- Strålekraft: platevinkelen angis mot selve plateflaten; uttrykket gjelder normal kraft, ikke automatisk aksial skyvekraft.
- Turbinens reaksjonsgrad: Eulerarbeid er lik trinnets statiske entalpifall bare når absolutt kinetisk energi er lik ved trinnets innløp og utløp.
- GZ=KN−KGsinθ krever TCG=0; sideforskjøvet tyngdepunkt gir et ekstra cosθ-ledd.
- Krengningspendel: tangensformelen bruker den faste avstanden til måleplanet, ikke lengden av den skrå pendeltråden.

## Seks gjenværende modell-/kildeforhold

| Uttrykks-ID | Hva som fortsatt mangler |
|---|---|
| book-mechanics-p48-r02 | Historical dished-head stress approximation has no independently established modern geometry/design applicability. Requires an applicable validated head model; not accepted as design thickness. |
| book-machine-p50-r07 | Allowable weld multiplier v lacks a specified validated material/joint/design assessment. Arithmetic is coherent; resistance calibration is not established. |
| book-machine-p50-r11 | Historical effective-weld-length end deduction is not tied to a stated applicable assessment rule; do not use as a universal rule. |
| book-machine-p51-r09 | Original K₁ chart is available on p.52 and has been reread. Its independent calibration, operating assumptions and applicability remain unverified. |
| book-machine-p52-r02 | Original K₂ chart is available on p.52 and has been reread. Its independent calibration, operating assumptions and applicability remain unverified. |
| book-c14-p212-r04 | Historical grain effective-GM coefficient 1/5 is not tied to an independently established grain geometry/approved heeling model. |

Disse forholdene er merket i previewen ved de aktuelle kildevariantene. Ingen universell koeffisient, original diagramkalibrering eller moderne dimensjoneringsgodkjenning er konstruert for å få listen til å se ferdig ut.

## Individuell sporbarhet

- `STUDENTS_EXPRESSION_REVIEW_2026-10-20.csv`: én rad per registrert uttrykk, med uttrykk, vilkår, beslutning, individuelt avvik, teststatus og kontrollsum for uttrykk/vilkår/symboler.
- `STUDENTS_EXPRESSION_REVIEW_BASIS_2026-10-20.json`: analytisk begrunnelse per kapittel og side; hver CSV-rad peker til én begrunnelse.
- `STUDENTS_EXPRESSION_CHANGES_2026-10-20.json`: nøyaktig før/etter for alle endrede uttrykkskontekster.
- `tests/students-expression-review-ledger-20261020.mjs`: avviser en foreldet vurdering dersom uttrykk, vilkår eller lokale symboler endres uten oppdatert kontrolljournal.

## Visuelle endringer

- Resultater og diagrammer står foran sammenleggbare inndata på små skjermer. Samme skjemaer, beregninger og scenarier beholdes.
- Rapporttabeller viser inntil seks signifikante sifre. Den innebygde beregningskopien og CSV-/JSON-data beholder full presisjon; ingen beregning avrundes på forhånd.
- Presentasjonsvisning gir større diagrammer/nøkkeltall og frigjør plass fra navigasjonen. Knapp og Escape avslutter visningen; inndata beholdes.
- Mobilheaderen ruller med siden, slik at den ikke dekker en stor del av små skjermer.

## Testbevis og gjenværende akseptanse

Kretskontrollen løser uavhengige komplekse nodebalanser i 176 komponent-/frekvenstilfeller med 416 sammenligninger for ti registrerte uttrykk. Dette er idealiserte op-amp-modeller, ikke validering av en fysisk komponent med begrenset båndbredde eller utgangssving.

Nettlesermatrisen omfatter Chromium, Firefox og WebKit med åtte størrelser, inkludert 320×568, 844×390 og 2048×774, alle femten moduler, undervisningsvisning, mobilkontroller og rapporteksport. Resultatlogg, skjermbilder og faktiske eksportfiler lagres i GitHub Actions for denne revisjonen. Nettleseremulering på Linux er ikke fysisk iOS-/Android-/Windows-/macOS-testing.

Før produksjonsgodkjenning gjenstår lukking eller produktmessig avgrensning av de seks åpne modellforholdene, vurdering av uregistrert bokinnhold dersom full bokdekning kreves, fysisk enhetstest, installert offline/PWA-bruk og live dataleverandører. Ingen av disse er automatisk bestått gjennom en grønn testkjøring.

## Referansegrunnlag

Primært grunnlag er brukerens tekniske formelsamling og de eksisterende individuelle kildeavlesningene. Nye kretsuttrykk er utledet fra de gjenåpnede koblingsskjemaene. Eksterne primærreferanser brukt som kontrollgrunnlag:

- NIST DLMF §4.21, trigonometriske identiteter: https://dlmf.nist.gov/4.21
- NIST DLMF §4.20 og §4.26, derivasjon/integrasjon: https://dlmf.nist.gov/4.20 og https://dlmf.nist.gov/4.26
- NIST SP811, enhetsomregninger: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
- NSK Technical Insight TI/E/0102, grunnleggende lagerlevetid, lastgrunnlag og eksponenter: https://www.nsk.com/content/dam/nsk/eu/en_gb/documents/bearings-europe/P_TI-0102_EN.pdf
- IAPWS IF97, med eksisterende tester mot publiserte referanseverdier: https://iapws.org/technical-guidance/release/IF97-Rev

Forsøk på å hente MITs varmeoverføringsbok i denne runden ga tidsavbrudd og brukes ikke som nytt verifikasjonsbevis. Historiske korrelasjoner får ikke en ny kalibreringsgodkjenning på det grunnlaget.

## Oppfølging: skjermtilpasning og to varmeoverføringsmodeller

Begge brukerens skjermbilder (trim og veivakseldefleksjon) ble åpnet. Brede, lave skjermer ga en graf som fortsatte under skjermkanten. Presentasjon måler nå tilgjengelig høyde og setter hele SVG-visningsflaten med bevart viewBox-format. Resultater, akser, bildetekster, modulbeskrivelser og modellvilkår skjules ikke. På små skjermer og ved mye tekst brukes rulling; det loves ikke at et helt undervisningsopplegg får plass samtidig på enhver skjerm. Escape inne i en innebygd modul avslutter også den ytre presentasjonen. Skjemaene beholdes.

- `book-c11-p161-r04`: den korrupte lengdebetingelsen er ikke rekonstruert. Undervisningsversjonen bruker den dokumenterte 0.027-korrelasjonen og krever uttrykkelig fullt utviklet strømning, med Re>10000, det konservative kildeintervallet 0.7<Pr<700 og korrekte bulk-/veggviskositeter. Innløpseffekter må vurderes separat. Referanse: https://ht.readthedocs.io/en/latest/ht.conv_internal.html#ht.conv_internal.turbulent_Sieder_Tate . Referansen opplyser også om historiske attribusjons-/koeffisientvarianter.
- `book-c11-p163-r04`: historisk 1.13 er erstattet av en tydelig selvstendig Nusselt-modell med avrundet 0.943 for glatt laminær film på vertikal isoterm plate. Den opprinnelige 1.13 er ikke faglig godkjent. Geometri, midlet filmkoeffisient, egenskapsnivå og utelatte effekter står ved uttrykket. Referanse: https://ht.readthedocs.io/en/latest/ht.condensation.html#ht.condensation.Nusselt_laminar .
- Ny test kontrollerer tre publiserte referansepunkter og ni uavhengige filmstrømningsbalanser. Forskjellen mellom avrundet 0.943 og eksakt 2√2/3 håndteres uttrykkelig i toleransen. Dette er ikke en full empirisk domenekalibrering.
- De seks øvrige forholdene forblir åpne og er merket «Reference only» med en eksplisitt beskjed om at modellen ikke skal anvendes før dokumentasjonsgapet er lukket. K₁/K₂-kurvene finnes i originalen på s.52 og er nå gjenåpnet; gapet gjelder uavhengig kalibrering og anvendelighet. Material-/sveiseforutsetninger og historiske hode-/kornkoeffisienter har heller ikke tilstrekkelig grunnlag for generell anvendelse.

E-post til ekstern underviser skal presentere dette som en utviklingspreview for avgrenset undervisningsutprøving og faglige tilbakemeldinger, ikke som en ferdig faglig sertifisering. Brukeren har bedt om et e-postutkast; ingen e-post sendes.

## Oppfølging: én-tredels skrogmodell

To ytterligere punkter (`book-c16-p223-r04/r05`) er avgrenset til en selvstendig utledet undervisningsmodell: konstant langskips vannlinjebredde, små volumendringer og kvadratisk dypgangsprofil. Integrasjon gir T_equiv=(T_F+4T_M+T_A)/6 og dermed δT=(T_mean−T_M)/3. Dette gjør samme algebra faglig etterprøvbar under klart angitte forutsetninger; det godkjenner ikke den historiske regelen for et vilkårlig skip. Testen integrerer 18 profiler uavhengig og viser med et moteksempel at varierende vannlinjebredde bryter den uvektede én-tredelsregelen.

Sluttstatus i registeret: 1 470 vurdert under oppgitte forutsetninger, 22 rettet/presisert og 6 fortsatt åpne. Fire av de opprinnelige ti åpne punktene har dermed fått selvstendige, avgrensede undervisningsmodeller. Den tidligere bokteksten/koeffisienten er fortsatt ikke sertifisert som universell.

På brede skjermer fra 1600 px og minst 650 px høyde står nøkkeltallene ved siden av grafen i de todelte modulene. Dermed brukes skjermhøyden på en lesbar graf fremfor to rader resultatkort over grafen. Nettlesertesten krever minst 300 px grafhøyde i trim-/veivakseleksemplene ved 2048×774.
