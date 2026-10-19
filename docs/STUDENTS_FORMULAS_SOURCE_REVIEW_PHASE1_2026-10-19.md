# Gjennomgang av *Teknisk formelsamling med tabeller* – fase 1
**19. oktober 2026 | PR #35 (Draft)**

## Kilde- og omfangserklæring
Brukeren har levert `Teknisk formelsamling.zip` med **284 skjermbilder** fra Nasjonalbiblioteket; mottakskontrollen identifiserte **283 forskjellige sideområder og én dublett**. Vi har i denne fasen studert et målrettet utvalg av kapittelstarter og formelsider. Det betyr **ikke** at hver formel på hver side er lest, transkribert, matematisk kontrollert eller sammenlignet. Uklare eksponenter/indekser må kvalitetssikres før formelvarianter tas i bruk.

Boken: *Teknisk formelsamling med tabeller*, Svein Erik Pedersen, Jan Gustavsen, Svein Kaasa, Oddmund Olsen; Gyldendal Undervisning / eldre utgaver Universitetsforlaget. Katalog: https://www.nb.no/items/7dd9087d6a49416798fe7b2f6fdd86c2.

**Rettighetsgrense:** Ingen bildearkiv, originalbok, tabeller, illustrasjoner eller lengre utdrag legges i GitHub. De 84 nye oppføringene er formelrelasjoner med selvskrevne korte vilkår; ikke en gjengivelse av bokas layout eller redaksjonelle fremstilling. Fullstendig reproduksjon av verket er **ikke** leveransen.

## Verifiserbar implementeringsstatus
| Område | Før | Etter denne fasen | Oppfølging |
|---|---:|---:|---|
| Formeloppføringer | 187 | **271** | Redaksjonell og dimensjonsmessig kontroll av hver oppføring |
| Fagkategorier | 10 | **20** | Norsk-engelsk terminologi, særlig motor/prosess |
| Interaktive kalkulatorer | 24 | **39** | Uavhengige fasiter og grenseverdier for alle modeller |
| Originale øvingsoppgaver | 20 | **30** | Faglig QA og studentbrukertest |
| Isolerte automatiske smoke-kontroller | 77 | **114/114** | Nettleser/PWA/A11y ikke kjørt i denne fasen |

Nye faggrupper: Advanced Mathematics; Physics & Waves; Chemical Engineering; Electronics & Telecommunications; Power Electronics; Machine Elements & Strength; Engine Processes; Steam & Refrigeration; Engineering Economics; Marine Advanced.

## Målrettet kildegjennomgang / eksempler
Følgende trykte boksider ble særskilt inspisert som bilde i denne fasen. Dette dokumenterer **stikkprøve av emne og formelrelasjon**, ikke godkjenning av alle sidens formler:

| Trykt side | Tema fra kilden | Uavhengig implementering/oppfølging | Status |
|---:|---|---|---|
| 55–59 | Kjemi, atomstruktur og isotoper | Kjemi er opprettet som egen kategori med generelle mole-/konsentrasjonsregler. Kildens atomtabeller ikke kopiert. | Kategori etablert; betydelig rest |
| 99–104 | Elektronikk, forsterker-/motkoblingsrelasjoner | Negativ tilbakekobling og frekvens-/forsterkningsrelasjoner utvidet. | Relasjoner stikkprøvekontrollert; rest |
| 122–125 | Kraftelektronikk, likerettere og filtre | Basale ideelle likerettere og omformere innført med begrensninger. | Utvalg; sammenlign utvalgte likerettere videre |
| 134–138 | Motorlære, ideelle gassprosesser | Isoterm, adiabat, polytrop, idealisert Otto-virkningsgrad, kompresjon og slagvolum. | Relasjoner stikkprøvekontrollert; rest |
| 149–151 | Damplære og entalpi | Våt damps entalpi, spesifikt volum og enkel varmebalanse. | Må ha uavhengig dampdata, ikke kopierte tabeller |
| 155 | Varmelære/strømningslære | Utvidet via de opprinnelige termodynamikk-/fluid-formlene. | Oppfølgende kildekontroll |
| 177–179 | Kuldeteknikk, damptrykk, ytelsetall og massestrøm | Relativ fuktighet, COP ut fra entalpi, kjøleeffekt og massestrøm. | Relasjoner stikkprøvekontrollert; rest |
| 219–221 | Økonomi, realrente og nåverdi | Realrente, NPV og annuitetsrelasjoner. | Relasjoner stikkprøvekontrollert; rest |
| 222–224 | Korrigert deplasement/draft survey | Korreksjon av dypgangsmerker, tre-dypgangs-korreksjon og trim. | Kun studiemodell; ikke fartøyspesifikk lastekalkulator |

**Ytterligere opprinnelige referanser:** Brukerens MARFAG F1 og F2/F3, grunnleggende realfag og elektroteknikk med oppgaver og løsningsforslag. Kvalitetskontroll skal skille hva som faktisk finnes i boken fra nytt fagstoff/standardrelasjoner utledet på egen hånd.

## Kapittel-for-kapittel arbeid som gjenstår
Bokens 17 hovedkapitler (fra brukerens innholdsfortegnelse):
1. Matematikk (trykt s.7): især sfærisk trigonometri, statistikk og numerisk behandling.
2. Fysikk (s.23): varme, bølger, lys og lyd.
3. Mekanikk (s.30): avansert statikk, dynamikk, bøy og torsjon.
4. Maskinelementer (s.49): forbindelser, skruer og maskindimensjonering.
5. Kjemi (s.55): kjemisk teori, stoffmengde og kjemiske prosesser.
6. Elektroteknikk (s.79): maskiner, elektromagnetisme og nettverksberegning.
7. Elektronikk (s.99): analoge/digitale kretser og teleteknikk.
8. Kraftelektronikk (s.122): flere likerettere, filtre, omformere og vilkår.
9. Motorlære (s.134): forbrenning, mekanikk, virkningsgrad og karakteristikker.
10. Damplære (s.149): tilstandsdata, damptilførsel og termiske kretsløp.
11. Teknisk varme- og strømningslære (s.155): større faglig bredde.
12. Kuldeteknikk (s.177): kjølesyklus, masseflow, ytelsetall og kompressorer.
13. Navigasjon (s.181): astronomi, kursrettelser og seilasmetoder.
14. Last- og skipslære (s.195): tungløft, trim, tank, skroglaster, fortøyning og Simpson.
15. Økonomi (s.219): teknisk-økonomiske standardrelasjoner.
16. Korrigert deplasement (s.222): draft-survey-korreksjoner under bestemte vilkår.
17. Tabeller (s.225): originale datatabeller skal **ikke** kopieres; bruk åpne, kvalitetskontrollerte SI- og materialdata.

## Neste arbeidspakke / åpne QA-gates
1. Gjennomgå **alle ikke-kontrollerte formelsider i kildesamlingen** kapittelvis, og spor tema/formel til bildefil og bokside **kun i en intern arbeidslogg**. Ikke publiser noen bildefiler.
2. Lag en uavhengig **fullstendig emnedekningsmatrise** med mangler, formelvarianter og kildestatus; påstå ikke full bokdekning før det faktisk er dokumentert.
3. Kjør numeriske grense-/enhetstester og fagfellekontroll, særlig for strømretninger, per-unit, damp-/kjølemaskinsykluser, trim/draft og stabilitet.
4. Bygg egne tekniske figurer og SI-oppslag basert på offentlig gjenbrukbare fagreferanser.
5. Gjennomfør faktisk nettleser-QA, mobil + desktop, begge temaer, tastatur, forstørret tekst og PWA/offline med sikker preview-isolasjon.

**Deploy policy:** PR #35 forblir Draft. Ikke merge/deploy uten eksplisitt godkjenning. Produksjonsversjon v8.7.0 er uendret.
