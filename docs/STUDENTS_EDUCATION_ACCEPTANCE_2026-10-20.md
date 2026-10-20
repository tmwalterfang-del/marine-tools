# Education – faglig uttrykkskontroll og visuelle endringer

Dato: 20. oktober 2026. Gjelder preview i Draft PR #35. Ingen merge eller produksjonsutgivelse er godkjent.

## Resultat

**Alle de 1 498 registrerte, normaliserte kildeuttrykkene er gjennomlest analytisk i denne runden, kapittel for kapittel.** 1 470 er vurdert som konsistente under de oppgitte vilkårene; 18 har fått rettet uttrykk, presisert topologi/vilkår eller korrigert lokal symboldefinisjon; 10 har uavklarte modell-/kildebegrensninger. En gjennomført vurdering er ikke det samme som en godkjenning av alle uttrykkene.

Kontrollen omfatter matematisk/fysisk sammenheng, fortegn, enhetsgrunnlag, lokale symboldefinisjoner og gyldighetsvilkår. Numeriske og symbolske testbevis beholdes som egne felt. Ikke-testede uttrykk blir ikke omklassifisert til numerisk bestått.

## Avgrensning som påvirker godkjenning

Registeret inneholder normaliserte relasjoner, grupperte varianter og enkelte selvstendige erstatninger for problematiske bokuttrykk. Det er ikke en ordrett, uttømmende transkripsjon av hver trykte likning, empiriske tabell og kurve i boken. Den tidligere sideoversikten har derfor fortsatt ikke sertifisert at hver trykte side er uttømmende dekket. Denne rapporten hevder ikke at alle bokens mulige kildeuttrykk er ferdigverifisert.

Alle registrerte formler og vilkår ble lest i denne runden. Tidligere visuelle kildeavlesninger er beholdt som tidligere bevis. Originalsidene 109, 110, 111, 161 og 163 ble åpnet på nytt for konkrete krets-/korrelasjonskontroller; øvrige originalsider er ikke visuelt lest på nytt i denne runden. Den automatiske dimensjonskontrollen dekker 1 011 uttrykk, mens 487 ikke kan parses av denne kontrollen. Dimensjonslikhet alene beviser ikke koeffisient, skala, domene eller fysisk anvendelighet.

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
| 11. Varme og strømning | 143 | 6 | 2 |
| 12. Kjøleteknikk | 26 | 0 | 0 |
| 13. Navigasjon | 50 | 0 | 0 |
| 14. Last og stabilitet | 121 | 2 | 1 |
| 15. Økonomi | 14 | 0 | 0 |
| 16. Korrigert deplasement | 10 | 0 | 2 |

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

## Ti uavklarte modell-/kildeforhold

| Uttrykks-ID | Hva som fortsatt mangler |
|---|---|
| book-mechanics-p48-r02 | Historical dished-head stress approximation has no independently established modern geometry/design applicability. Requires an applicable validated head model; not accepted as design thickness. |
| book-machine-p50-r07 | Allowable weld multiplier v lacks a specified validated material/joint/design assessment. Arithmetic is coherent; resistance calibration is not established. |
| book-machine-p50-r11 | Historical effective-weld-length end deduction is not tied to a stated applicable assessment rule; do not use as a universal rule. |
| book-machine-p51-r09 | Journal-bearing K1 chart/model data and its geometry/film regime are absent; coefficient calibration cannot be confirmed. |
| book-machine-p52-r02 | Journal-bearing K2 chart/model data and its geometry/film regime are absent; friction calibration cannot be confirmed. |
| book-c11-p161-r04 | Printed turbulent Sieder-Tate length condition is corrupt. The fit structure is recognizable, but its exact source validity condition is not recoverable from this line. |
| book-c11-p163-r04 | Source coefficient 1.13 has no independent film-regime calibration here and differs from classical smooth-film 0.943. Retained as legacy, not validated heat-transfer prediction. |
| book-c14-p212-r04 | Historical grain effective-GM coefficient 1/5 is not tied to an independently established grain geometry/approved heeling model. |
| book-c16-p223-r04 | Historical one-third hull-deflection correction is not independently validated for a specified hull/procedure; differs from quarter-mean rule. |
| book-c16-p223-r05 | Depends on the unresolved one-third deflection model in the preceding expression; signed addition itself is correct. |

Disse forholdene er merket i previewen ved de aktuelle kildevariantene. Ingen universell koeffisient, original diagramkalibrering eller moderne dimensjoneringsgodkjenning er konstruert for å få listen til å se ferdig ut.

## Individuell sporbarhet

- `STUDENTS_EXPRESSION_REVIEW_2026-10-20.csv`: én rad per registrert uttrykk, med uttrykk, vilkår, beslutning, individuelt avvik, teststatus og kontrollsum for uttrykk/vilkår/symboler.
- `STUDENTS_EXPRESSION_REVIEW_BASIS_2026-10-20.json`: analytisk begrunnelse per kapittel og side; hver CSV-rad peker til én begrunnelse.
- `STUDENTS_EXPRESSION_CHANGES_2026-10-20.json`: nøyaktig før/etter for de 18 endrede uttrykkskontekstene.
- `tests/students-expression-review-ledger-20261020.mjs`: avviser en foreldet vurdering dersom uttrykk, vilkår eller lokale symboler endres uten oppdatert kontrolljournal.

## Visuelle endringer

- Resultater og diagrammer står foran sammenleggbare inndata på små skjermer. Samme skjemaer, beregninger og scenarier beholdes.
- Rapporttabeller viser inntil seks signifikante sifre. Den innebygde beregningskopien og CSV-/JSON-data beholder full presisjon; ingen beregning avrundes på forhånd.
- Presentasjonsvisning gir større diagrammer/nøkkeltall og frigjør plass fra navigasjonen. Knapp og Escape avslutter visningen; inndata beholdes.
- Mobilheaderen ruller med siden, slik at den ikke dekker en stor del av små skjermer.

## Testbevis og gjenværende akseptanse

Kretskontrollen løser uavhengige komplekse nodebalanser i 176 komponent-/frekvenstilfeller med 416 sammenligninger for ti registrerte uttrykk. Dette er idealiserte op-amp-modeller, ikke validering av en fysisk komponent med begrenset båndbredde eller utgangssving.

Nettlesermatrisen omfatter Chromium, Firefox og WebKit med seks størrelser fra 320×568 til 1440×900, alle femten moduler, undervisningsvisning, mobilkontroller og rapporteksport. Resultatlogg, skjermbilder og faktiske eksportfiler lagres i GitHub Actions for denne revisjonen. Nettleseremulering på Linux er ikke fysisk iOS-/Android-/Windows-/macOS-testing.

Før produksjonsgodkjenning gjenstår lukking eller produktmessig avgrensning av de ti åpne modellforholdene, vurdering av uregistrert bokinnhold dersom full bokdekning kreves, fysisk enhetstest, installert offline/PWA-bruk og live dataleverandører. Ingen av disse er automatisk bestått gjennom en grønn testkjøring.

## Referansegrunnlag

Primært grunnlag er brukerens tekniske formelsamling og de eksisterende individuelle kildeavlesningene. Nye kretsuttrykk er utledet fra de gjenåpnede koblingsskjemaene. Eksterne primærreferanser brukt som kontrollgrunnlag:

- NIST DLMF §4.21, trigonometriske identiteter: https://dlmf.nist.gov/4.21
- NIST DLMF §4.20 og §4.26, derivasjon/integrasjon: https://dlmf.nist.gov/4.20 og https://dlmf.nist.gov/4.26
- NIST SP811, enhetsomregninger: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
- NSK Technical Insight TI/E/0102, grunnleggende lagerlevetid, lastgrunnlag og eksponenter: https://www.nsk.com/content/dam/nsk/eu/en_gb/documents/bearings-europe/P_TI-0102_EN.pdf
- IAPWS IF97, med eksisterende tester mot publiserte referanseverdier: https://iapws.org/technical-guidance/release/IF97-Rev

Forsøk på å hente MITs varmeoverføringsbok i denne runden ga tidsavbrudd og brukes ikke som nytt verifikasjonsbevis. Historiske korrelasjoner får ikke en ny kalibreringsgodkjenning på det grunnlaget.
