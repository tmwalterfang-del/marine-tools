# Marine Tools Education — teknisk og faglig revisjon 27. oktober 2026

**Senere oppfølging samme dag:** Se [oppdatert kontroll og appberedskap](STUDENTS_COMPLETION_FOLLOWUP_2026-10-27.md). Den oppfølgingen oppdaterer tallene nedenfor, dokumenterer ny tilgang til originalskannene og beholder denne rapportens tidligere kontrollgrunnlag.

Arbeid i eksisterende Draft PR #35, fra `df66bb27c923d9e25a30b344d5f27c38a8dc56ac`. Ingen merge eller produksjonsdeploy er godkjent eller utført. Alt nytt studentrettet innhold er på engelsk.

## Resultat og avgrensning

Alle **1 498 registrerte, normaliserte uttrykk i 16 kapitler** er behandlet i den nye kontrollen og har en individuell, kontekstbundet rad i `STUDENTS_REVIEW_FOLLOWUP_2026-10-27.csv`. De opprinnelige 218 sidevurderingene, kildekonkordansen og tidligere rettingene er beholdt. En maskinell dimensjonskontroll er ikke et bevis på fortegn, koeffisienter, gyldighet eller numerisk riktighet.

- Tolket dimensjonskontroll er utvidet fra **1 011 til 1 333** uttrykk. Ingen tidligere godkjent rad har mistet dekning. **322 av de opprinnelige 487** er nå maskinelt kontrollert uten dimensjonsbrudd.
- De siste **165** er individuelt klassifisert, ikke automatisk godkjent: symbolsk matematikk, kalkulus/indekserte modeller, kjemiske mønstre/reaksjoner, boolsk algebra, numeriske enhetskonvensjoner og eksterne hydrostatiske funksjoner. Disse er fortsatt **ikke maskinelt dimensjonsvalidert**.
- **12 uttrykksrader er rettet** med manglende eller uklare lokale symboler/enheter. Samlet analytisk registerstatus: **1 458 vurdert under oppgitte forutsetninger, 34 korrigert/kvalifisert, 6 åpne historiske modeller**.
- Numerisk status er fortsatt eksplisitt: **1 248 PENDING**, 121 med utvalgt referansetilfelle, 59 med tre identitetsprøver, 10 med uavhengige komplekse KCL-referanser, 54 ikke numerisk anvendelige og seks generelle symbolske funksjonsregler med numeriske spesialiseringer utestående. Dette arbeidet kan derfor ikke beskrives som uavhengig numerisk bevisføring av hvert uttrykk.

Originale bokskann ble ikke hentet inn i denne økten. Lokalt tilgjengelig eldre overleverings-ZIP inneholder tre dokumenter, ikke de 284 bildene. To søk etter kildefilene ga ingen tilgjengelige treff. Ingen ny fotografisk side-for-side-konkordans påstås. Registrerte uttrykk og tidligere kildeavvik beholdes; ingen boksider, figurer eller særpregede tabeller er kopiert inn i produktet.

## Gjennomgang per kapittel

| Kapittel | Uttrykk | Maskinelt dimensjonskontrollert | Åpne historiske modeller | Faglig kontrollgrunnlag |
|---|---:|---:|---:|---|
| 1 Matematikk | 262 | 178 | 0 | Geometri, radianer, fortegn/absoluttverdier, integral-/derivatregler, konvergens og tidligere symbolske bevis |
| 2 Fysikk | 82 | 74 | 0 | Absolutt temperatur/trykk, bevaringslover, bølger/optikk, logaritmiske lydnivåer og temperaturintervaller |
| 3 Mekanikk | 204 | 204 | 1 | Kraft-/momentbalanse, definerte akser, energi, stivhet, bjelker, torsjon og begrensninger for trykkhoder |
| 4 Maskinelementer | 53 | 53 | 4 | Effektivt sveisetverrsnitt, lagergeometri, viskositet/turtall, belastnings- og kalibreringsforutsetninger |
| 5 Kjemi | 70 | 47 | 0 | Stoffmengde/masse/ladning, aktiviteter, standardtilstander, støkiometri kontra kjemiske strukturmønstre |
| 6 Elektroteknikk | 144 | 142 | 0 | Kirchhoff, RMS/faser, reaktiv/aktiv effekt, komponentkoding og enhetsfaktorer |
| 7 Elektronikk | 126 | 99 | 0 | Fortegn i forsterkere, tilbakekobling, Laplace-tidskonstanter, lognivåer og boolske identiteter |
| 8 Kraftelektronikk | 51 | 50 | 0 | Ledningsvinkler, middel/RMS, avgrensede lastmodeller og spenningsformfaktor |
| 9 Motor-/fremdriftsrelasjoner | 107 | 103 | 0 | Idealgassforutsetninger, forbrenningsmengder, effekt/turtall og enhetsavhengige empiriske koeffisienter |
| 10 Turbomaskiner | 35 | 35 | 0 | Hastighetstrekanter, aksedefinisjoner og energi per massestrøm |
| 11 Termo-/strømningslære | 143 | 142 | 0 | Varme inn/arbeid ut, entropi, fuktig luft, pumpelikhet, differansetrykk og dyseenergi |
| 12 Varme-/ventilasjonsrelasjoner | 26 | 26 | 0 | Varmegjennomgang, massegrunnlag og entalpiforskjeller |
| 13 Navigasjon | 50 | 45 | 0 | Vinkelinnpakking, atan2, grader/radianer, nautiske mil og numeriske tids-/vinkelkonvensjoner |
| 14 Last og skipslære | 121 | 111 | 1 | GM/KG/TCG, fri overflate, godkjente hydrostatiske funksjoner, bøyning og kornmodellens manglende kalibrering |
| 15 Økonomi | 14 | 14 | 0 | Betalingsbeløp per diskret periode, positive tids-/diskonteringsbetingelser og singulære grenser |
| 16 Dypgangskorreksjoner | 10 | 10 | 0 | Tidligere eksplisitt avgrensede kvadratiske/konstant-bredde-modeller og tetthetsgrunnlag |

Kapittelnavnene over er korte fagbeskrivelser; gjeldende kapittelinndeling i produktet er autoritativ. «Kontrollert» i dimensjonskolonnen gjelder deklarert enhetskonsistens, ikke full fysisk modellvalidering.

De 165 særtilfellene fordeler seg slik: 35 symbolsk matematikk; 55 kalkulus/indekserte eller parameteriserte modeller; 25 kjemiske strukturer/reaksjoner; 24 boolske relasjoner; 13 numeriske enhetskonvensjoner; åtte eksterne hydrostatiske funksjoner; og fem særskilte definisjoner/konvensjoner. Hver rad beholder uttrykk, årsak, sidegrunnlag, eksisterende numerisk/symbolsk evidens og SHA-256 av uttrykk, forutsetninger og lokale symboler. Ingen rester skjules som «bestått».

## Implementerte faglige rettinger

- Gasstetthet ved to tilstander manglet eksplisitte `T₁,T₂` i kelvin.
- To pumpelikhetsuttrykk manglet `H₁,H₂` i meter.
- Idealgassens volumfraksjon manglet komponentvolumet `V_i` ved samme temperatur og trykk.
- Spenningsformfaktoren manglet den øyeblikkelige spenningen `v`.
- Summen av lokale tap manglet `v_local` og tilhørende hastighetsgrunnlag.
- Reynolds-tallet og utvalgte dyse-/utløpskoeffisienter hadde en uavklart felles enhetstekst. De har nå egne betydninger og dimensjonsløse enheter.
- Pumpens `n_q=n·sqrt(Q)/H^0.75` er **dimensjonalt**, med `m^0.75/s^1.5` når n er i s⁻¹. En rpm-basert tallverdi er 60 ganger større; dette er ikke den dimensjonsløse hastighetsparameteren med `(gH)^0.75` i nevneren.
- Admiralitetskoeffisientens enhet er bundet til de faktisk deklarerte W, m/s og tonn, uten å gi den en universell tallverdi.

Disse endringene er lokale per uttrykk. `Q` eller `P` får ingen global enhet eller betydning. Eksisterende trigonometriske rettinger, Sieder–Tate-/Nusselt-avgrensninger og dypgangskorreksjoner er ikke opphevet. Den opprinnelige CSV-en er oppdatert slik at kontekstdigester ikke beholder en gammel godkjenning etter en symbolendring.

## De seks historiske OPEN-tilfellene

Alle seks er undersøkt på nytt. De forblir reference-only; ingen av dem brukes til en ny kalkulator med vilkårlige koeffisienter.

| Uttrykk | Ny vurdering | Hva som faktisk mangler |
|---|---|---|
| Dished head, p.48 | Et selvstendig sfærisk membranbalanseargument gir `pD/(4σ)`. Det verifiserer ikke den historiske formfaktoren 3 eller torisfærisk knokkelbøyning. | Anvendelig geometri, material-/sveisefaktor, kodegrunnlag og validering av den konkrete formen |
| Weld strength, p.50 | JRCs modell bruker separate halsnormal-/skjærspenninger og material-/korrelasjons-/sikkerhetsfaktorer. En ubestemt multiplikator på grunnmaterialspenningen er ikke tilsvarende kalibrering. | Relevant skjøt, lastretning, tillatt spenningsgrunnlag og metode/utgave |
| Effective weld length, p.50 | Inaktive start-/sluttsoner avhenger av oppnådd hals og vurderingsregel. `l−2a` kan ikke ukritisk brukes på enhver sveis. | Autoritativ regel som gjelder den opprinnelige historiske skjøten, inkludert full hals ved endene |
| Journal bearing K₁, p.51 | NASA-utledningen viser avhengighet av eksentrisitet, klaring og rand-/kavitasjonsbetingelser. Dimensjonsløshet kalibrerer ikke kurven. | Uavhengig chart-/modellkalibrering og drift-/temperaturforutsetninger |
| Journal bearing K₂, p.52 | En konsentrisk Couette-grense er ikke dokumentasjon for friksjon i det lastede lageret. | Tilsvarende dokumentasjon for friksjon, filmform og grensebetingelser |
| Grain GM, p.212 | Godkjente volumetriske krengemomenter og lastgeometri er nødvendig. IMO-endringen MSC.552(108), gjeldende i 2026, dokumenterer ikke en universell 1/5-faktor. | Godkjent kornlastmodell; korreksjonen må ikke erstattes med en væskeoverflateformel |

Dette er reelle gjenstående faglige forhold, ikke parserfeil som kan fjernes ved mer kode. Moderne veiledning brukes som sammenligningsgrunnlag; den er ikke påstått å legitimere enhver historisk variant.

## Mollier: implementert og verifisert

Det lokale Neutrium-biblioteket og CC BY 4.0-attribusjonen er beholdt. Det er ikke innført tabellfallback, Region 3 eller en påstand om IAPWS-sertifisering.

- **Metning/tofase:** 0,01–160 bar(a), IF97 Region 4 med Region 1/2-endepunkter; x er dampens massefraksjon.
- **Overhetet:** 0,01–160 bar(a), stabil Region 2 over metning, maksimalt 600 °C. Region 3 trengs ikke innen denne avgrensningen; metning ved 16 MPa ligger under 623,15 K.
- p–h og p–s løses ved braketert biseksjon innen disse grensene. Underkjølte endepunkter og utfall over domenet avvises.
- Isentropisk ekspansjon og ideell struping beregner likevektstilstander ved avtakende trykk. Konstant-h-kurven er en likevektskurve, ikke en løsning av strømningen inne i en strupeventil. Turbin med oppgitt isentropisk virkningsgrad beregner endepunkt og positivt arbeid ut. Den irreversible banen blir **ikke** diktet opp.
- Stasjonær strømning, neglisjerbar kinetisk/potensiell energiforskjell og adiabatisk turbin/ideell struping er eksplisitte forutsetninger.
- Entalpiaksen er utvidet til 4 200 kJ/kg. Presis numerisk kvalitetsinngang er lagt til. Manuell endring av et punkt fjerner en utdatert prosessforklaring. Prosessresultatet vises også utenfor de sammenfoldbare mobilinngangene, slik at arbeid og modelltype ikke blir skjult sammen med kontrollene.
- Scenarioeksport kan ta med valgt prosess og virkningsgrad. Gamle A/B-filer støttes fortsatt. Ny import verifiserer endepunktene mot prosessen før begge tilstander erstattes. Rapport/CSV/SVG viser gjeldende gyldige tilstander.

**Uavhengig tallkontroll:** 225 tilstander fra Python `iapws==1.5.4`, separat fra Neutrium. Maksimalt observert avvik: h `1,53×10⁻⁶ kJ/kg`; s `2,47×10⁻⁹ kJ/(kg·K)`. Disse tallene viser implementasjonsenighet, ikke fysisk måleusikkerhet. Publiserte IAPWS-eksempler i tabell 5/15/35/36 beholdes som spesifikasjonsankre. Metningskontrollen bruker den dokumenterte Gibbs-konsistensen i tabell 44 fremfor å kreve eksakt likhet mellom separate regiontilpasninger.

## Tester og reproduksjon

Nye tester:

- `node tests/students-dimensions-followup-20261027.mjs`: alle 1 498 uttrykk, ingen dimensjonsbrudd, minst 1 333 tolket, minst 322 av de opprinnelige 487 lukket maskinelt; negative kontrolltilfeller for ugyldig addisjon/log/trig-enheter.
- `node tests/students-followup-reference-20261027.mjs`: 1 535 kontroller; hele registerets kontekstintegritet, 16 kapitler og utvalgte selvstendige regne-/enhetstilfeller. Antallet er ikke 1 535 uavhengige numeriske bevis.
- `node tests/students-if97-expanded-20261027.mjs`: 1 724 kontroller, 225 uavhengige tilstander, inverse tilstander, fasegrenser, blandingsregler, prosesser, virkningsgrad og feilinput.
- `node tests/students-review-report-20261027.mjs`: reproduserbar individuell CSV med ærlige særdisposisjoner.
- `node tests/students-mollier-process-browser-20261027.cjs chromium|firefox|webkit`: faktisk UI, utvidet domene, prosess-/scenario-/rapportflyt, feilbevaring og fire skjermstørrelser. CI-resultater følger aktuell commit; ikke forveksle tidligere grønne kjøringer med ny kode.

De eksisterende kilde-, matematikk-, mekanikk-, kjemi-, bevarings-, eksport-, visnings- og øvrige Education-testene beholdes. Full nettleserakseptanse kjøres i CI mot isolerte data med eksterne forespørsler blokkert/simulert. Ingen testforespørsler med elever eller sensitive data sendes til produksjons-API.

### Faktisk CI-evidens

Implementasjonscommit `40481fe3afcea8563f1f4a4569e758ef72224a24` bestod kilde-/DOM-/symbolsk validering og alle tre Education-nettleserjobbene i [kjøring 40473740368](https://github.com/tmwalterfang-del/marine-tools/actions/runs/40473740368). De første nye Mollier-browserkontrollene ga 20 beståtte per motor. Eksisterende Education-akseptanse/responsivkontroll ga henholdsvis 173/1552 i Chromium og 165/1551 i Firefox og WebKit; disse tallene inkluderer funksjons- og layoutkontroller, ikke tilsvarende antall faglige bevis. Den videre UI-kontrollen dekker i tillegg synlige prosessresultater med sammenfoldede mobilinnganger, tilgjengelige kontroller og komplett SVG i Mollier-presentasjon.

Chromium-skjermbilder ved 390 og 1440 piksler ble visuelt gjennomgått. CI har også bilder ved 844 og 2048 piksler, faktiske rapportnedlastinger og tidligere Education-rapport/PDF-kontroll. Fysiske enheter er fortsatt ikke sertifisert. Gjeldende slutthead og siste kontrollstatus fremgår av Draft PR #35; en eventuell senere endring krever egne grønne kontroller.

## Appberedskap

`MT_IF97` har et rent tilstands-/prosess-API uten DOM eller nettverksavhengighet. Visning og eksport ligger utenfor egenskapsberegningene. Formeldata, stabile uttrykks-ID-er, testfixturer og versjonerte scenariofiler kan gjenbrukes i PWA eller en senere mobil-WebView/Capacitor-app. Nytt API har versjon 2 og eksplisitte domenegrenser.

Offentlig PWA-cache får ny versjon og den nye revisjonsfilen. Privat Pages-preview forblir nettverksbasert uten offline-gjenbruk av beskyttet innhold. Dette er ikke endret for å gjøre appstøtte enklere. En native app krever egen plan for autorisasjon/tilbakekalling, lagring/sikkerhetskopi, tilgjengelighet, appbutikker, signering og oppdateringer. Ingen app eller Education er publisert. Biblioteklisens og attribusjon må følge eventuell appdistribusjon.

## Gjenstår og anbefalt felles gjennomgang

1. Ta stilling til de seks historiske modellene: behold dem som referanse, eller fremskaff anvendelig original-/standard-/kalibreringsgrunnlag. Ingen av dem bør få «validert»-merking nå.
2. De 165 særtilfellene har dokumentert vurderingsspor, men ikke maskinell dimensjonsvalidering. De 1 248 PENDING-radene mangler fortsatt individuell numerisk referanse. Full kildekonkordans mot originale fotosider/tabeller krever tilgang til disse.
3. Prøv én overhetet ekspansjon, én våt isentrope og én struping sammen, inklusive enhets-/fortegnsforklaring og rapportgjenåpning.
4. Fysisk mobil/nettbrett, native zoom, projektor, tastatur-/berøringsopplevelse og Aleksanders tillatte/ikke-tillatte Cloudflare-identitet gjenstår som separat akseptanse. Ingen automatisert browser-test sertifiserer disse.
5. Velg PWA først eller en separat mobilapp etter faglig akseptanse. Hold PR #35 Draft og Education upublisert frem til uttrykkelig godkjenning.

## Primærkilder og proveniens

- IAPWS R7-97(2012), regionsgrenser, verifikasjonseksempler og konsistenstabell 44: https://iapws.org/technical-guidance/release/IF97-Rev
- Uavhengig testimplementasjon Python iapws 1.5.4: https://github.com/jjgomera/iapws ; regenerering: `scripts/generate-if97-reference-20261027.py`.
- Europakommisjonens JRC, *Bolts, welds, column base*, F. Wald, 2014, sveiseundervisning: https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/06_Eurocodes_Steel_Workshop_WALD.pdf
- NASA, *Hydrodynamic Journal Bearings—Analytical Solutions*: https://ntrs.nasa.gov/api/citations/19910021217/downloads/19910021217.pdf ; de tilgjengelige analytiske avsnittene erstatter ikke originalkurvenes kalibrering.
- IMO MSC.552(108), original endringsresolusjon: https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.552%28108%29.pdf
- Offentlig myndighetsversjon av Grain Code: https://puc.overheid.nl/nsi/doc/PUC_2405_14/

Ingen redaksjonelle boktekster, skannede figurer eller særegne tabeller er lagt inn i produktet. Rapporten beskriver egne kontroller og avgrensninger, ikke rett til å republisere originalmaterialet.
