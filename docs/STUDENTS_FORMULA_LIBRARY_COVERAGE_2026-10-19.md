# Marine Tools for Students – utvikling og faglig dekningskontroll
**Dato:** 19. oktober 2026  
**Branch:** `feature/for-students-formula-library-20261019`  
**Status:** Implementert førsteutgave, **ikke** klar for produksjon. Ingen publisering eller merge uten godkjenning.

## Brukerens mål
En fullstendig studentseksjon for nautikk og maskin – ikke bare en PDF. Alle relevante **formler** i den utvidede *Teknisk formelsamling med tabeller* skal være søkbare og forklares med egne eksempler, supplert med maritime MARFAG-hefter. Originale boktabeller, illustrasjoner, ordlyd og bokoppsett skal ikke kopieres; Marine Tools lager egne tabeller og figurer.

## Implementert i egen branch
- Ny navigerbar studentseksjon på `/students/`, linket både fra hovedapplikasjonens «Project & contact» og `/education/`.
- **187** selvstendig beskrevne formler fordelt på **10** grupper:
  1. Mathematics (16)
  2. Geometry & Trigonometry (16)
  3. Mechanics (21)
  4. Fluids & Hydraulics (17)
  5. Thermodynamics (17)
  6. Electrical Engineering (30)
  7. Navigation (17)
  8. Ship Stability (23)
  9. Cargo & Survey (14)
  10. Machinery & Energy (16)
- **24** interaktive pedagogiske beregninger med eksplisitte formler, synlig mellomregning og grunnleggende inndatakontroll.
- **20** originale numeriske øvingsoppgaver med skjult fasit, toleranse og lokal lagring av gjennomførte oppgaver.
- Norske og engelske UI-etiketter, maritime og Bridge Dark-temaer, søk på fag/symbol/nøkkelord, bokmerker, mobil-layout og Print/PDF.
- Ingen konto, analytics, produksjons-API eller eksterne biblioteker i studentmodulen. PWA-cache er oppdatert på **branch**, ikke produksjon.
- `tests/students-smoke-20261019.mjs`: **77/77 PASS**, isolert JS- og filkonsistenskontroll.

## Litteratur og kilder
Disse opplastede PDF-ene er gjennomgått som referanser på emnenivå, men kopieres **ikke** til den offentlige GitHub-koden:
- MARFAG realfag (matematikk/fysikk).
- MARFAG F1 navigering og MARFAG F2/F3 last/trim/stabilitet.
- MARFAG K12 og K48.
- D1 last, stabilitet, farlig last og inspeksjoner.
- Oppgaver/løsningsforslag i elektroteknikk.

**Spesifikt Gyldendal-verk:** *Teknisk formelsamling med tabeller*, Svein Erik Pedersen, Jan Gustavsen, Svein Kaasa og Oddmund Olsen, Gyldendal Undervisning. Nasjonalbibliotekets bokpost: <https://www.nb.no/items/7dd9087d6a49416798fe7b2f6fdd86c2>.

Den generelle katalogen på 187 formler er utarbeidet uavhengig; **det er ikke verifisert at alle formeltyper og varianter fra Gyldendal-boken er inkludert**. Ikke påstå at full bokdekning er oppnådd.

## Full dekningskontroll av Teknisk formelsamling
For bok-dekning trenger vi lovlig tilgang til en utgave som kan brukes til faglig gjennomgang. Vi kan benytte en lovlig lesetilgang eller få en offisiell/lisensiert utgave, men ikke scrape hele Nasjonalbibliotekets bok, masseuttrekke sidene eller publisere en avskrift av bokas unike utvalg/tabeller.

**Arbeidsmetode:** Lag et kapittelregister/kompetansematrise (på egne ord) med tema, standardformel, varianter, gyldighetsområde, enheter, egne eksempeldata, referanse til kilde og QA-status. Lukk hvert dokumentert kunnskapsgap med selvstendig tekst og tester. Ikke kopier tabellverkets datainnhold eller originale figurer. Lag egne fagfigurer når faglig nyttig.

**Risikoområder for innholdskontroll:**
- Temperatur-/densitetsavhengighet, sjøvann vs ferskvann.
- GM/GZ/trim, dypgang og lastelinjer; fartøyspesifikke hydrostatikker kan ikke erstattes.
- Elektrisk 1-/3-fase, effektfaktor, stjerne/trekant og effektivverdier.
- Termodynamiske fortegnskonvensjoner, masse vs mol, absolutt temperatur og arbeidsmedium.
- Hydraulikk, tapskoeffisienter, Reynolds-område og pumpens virkningsgrad.
- Numeriske tilnærminger og formler med snevert gyldighetsområde (Simpson, små vinkel).
- Regler/koder i eldre kilder kan være utdaterte; behandles ikke som gjeldende krav.

## Videre utvikling for «alt»
1. Kilde- og dekningsrevisjon mot hele den lovlig tilgjengelige formelsamlingen.
2. Redaksjonell fagkontroll av alle 187 startformler og 24 kalkulatorer, med dimensjonsanalyse.
3. Utvid katalogen og kalkulatorer for manglende standardformler og transformerte varianter; søkefunksjon på symbolalias/norsk-engelsk.
4. Egne illustrasjoner (skipssnitt, spant, tyngdepunkt, Simpson, krafttriangler, trefase, pumpediagram) og egne tabeller **basert på dokumenterte beregningsregler, ikke kopiert fra verket**.
5. For større laste/stabilitetsmoduler: klare, separate «Study only»-moduler med eksempelhydrostatikk og QA mot fasit.
6. Autentisert og faktisk Playwright browser-QA mot ny Pages-preview på 360/390/768/1366 px, 100/200 % tekst, touch/tastatur/skjermleser, begge temaer.
7. PWA oppgraderings-/offline-QA med eksisterende produksjonslagrede data og student-bokmerker.
8. Endelig juridisk kontroll av kildelinker/lisenser og godkjenning før produktmerket «fullstendig formelsamling» brukes.

## Release gates
- Bredt nok og uavhengig kildegrunnlag til å dokumentere fagdekning; **Gyldendal-fullstendighet forblir OPEN**.
- Ingen brudd på opphavsrett: ingen original bok-PDF eller kopiert tabell-/illustrasjonsinnhold.
- 100 % matematisk enhetstest for alle beregningsmodus, manuell fagkontroll og mobil/accessibility.
- Studietjeneste kan brukes offline uten å påvirke andre Marine Tools-funksjoner.
- Kun etter brukergodkjenning: merge, deploy, indeksere `/students/` og markedsføre siden som ferdig.

**Status i dag:** Prototype implementert og kildekode-tester bestått. Neste prioritet er full browser-QA og systematisk faglig bokdekning.
