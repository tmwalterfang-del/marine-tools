# Teknisk formelsamling – kilde- og formelrevisjon (første utviklingsrunde)
**Dato:** 2026-10-19  
**Status:** Påbegynt, ikke fullstendig faglig kontroll  
**Arbeidsbranch:** `feature/for-students-formula-library-20261019` · **PR #35 (Draft)**  
**Kilde:** Brukeropplastet ZIP med 284 JPG-skjermbilder fra Nasjonalbibliotekets visning av *Teknisk formelsamling med tabeller*. Kildebilder distribueres ikke i repoet.

## Kildeintegritet / kapittelomfang
- ZIP ble åpnet, sideindeks basert på tidsstemplede bildefilnavn og synlige trykte boksidenummer.
- **Trykte sider 7–224: 218/218 finnes i bildematerialet (ingen påvist manglende sider i dette intervallet).**
- **Trykte sider 225–284: 60/60 finnes** (tabeller og oppslag som ikke skal kopieres).
- Trykt bokside **211** finnes to ganger. Ulike UI-sider i NB (293 totalt) samsvarer ikke direkte med bokpagineringen; omslag/forsats/siste visningssider kan mangle.
- Denne kildekontrollen bekrefter **bildetilstedeværelse**, ikke transkripsjon eller matematisk validering av alle formler.

## Fagdelene i gjennomgåtte bildeintervaller
Status `PAGE_PRESENT` betyr bare at alle bilder fra intervallet foreligger.
Status `SAMPLED` betyr at relevante eksempler er lest visuelt. Status `FULLY_VERIFIED` er **ikke oppnådd** for noe av kapitlene.

| Bokkapittel | Trykte sider | Bilder | Kontrollnivå | Marine Tools-status |
|---|---:|---:|---|---|
| 1 Matematikk | 7–22 | 16 | PAGE_PRESENT, eksempelstart vurdert | Grunnformler + avansert matematikk utvidet |
| 2 Fysikk | 23–29 | 7 | PAGE_PRESENT, eksempelstart vurdert | Bølge-/lydformler utvidet |
| 3 Mekanikk | 30–48 | 19 | PAGE_PRESENT, eksempelstart vurdert | Mekanikk og fasthet delvis dekket |
| 4 Maskinelementer | 49–54 | 6 | PAGE_PRESENT, eksempelstart vurdert | Ny gruppe for maskinelementer |
| 5 Kjemi | 55–78 | 24 | PAGE_PRESENT, SAMPLED: 55, 56, 59, 60 | Ny kjemigruppe, 3 nye kalkulatorer |
| 6 Elektroteknikk | 79–98 | 20 | PAGE_PRESENT, eksempelstart vurdert | Videreført/breddet |
| 7 Elektronikk og teleteknikk | 99–121 | 23 | PAGE_PRESENT, eksempelstart vurdert | Elektronikk, logikk og filter |
| 8 Kraftelektronikk | 122–133 | 12 | PAGE_PRESENT, SAMPLED: 123 | Likeretter- og DC/DC-formler |
| 9 Motorlære | 134–148 | 15 | PAGE_PRESENT, eksempelstart vurdert | Mer motorgeometri/ytelse |
| 10 Damplære | 149–154 | 6 | PAGE_PRESENT, SAMPLED: 149 | Dampentalpi og kjelvarme |
| 11 Varmelære og strømningslære | 155–176 | 22 | PAGE_PRESENT, eksempelstart vurdert | Varme- og fluidmodeller utvidet |
| 12 Kuldeteknikk | 177–180 | 4 | PAGE_PRESENT, SAMPLED: 177 | COP, kjølekrets og kompressor |
| 13 Navigasjon | 181–194 | 14 | PAGE_PRESENT, eksempelstart vurdert | Videreført; astronomisk navigasjon mangler detaljer |
| 14 Laste- og skipslære | 195–218 | 25 (inkl. side 211 dobbelt) | PAGE_PRESENT, eksempelstart vurdert | GM/KG, trim, TPC, last; avanserte metoder åpne |
| 15 Økonomi | 219–221 | 3 | PAGE_PRESENT, SAMPLED: 219 | Nåverdi, renteberegninger og annuitet |
| 16 Korrigert deplasement | 222–224 | 3 | PAGE_PRESENT, eksempelstart vurdert | Grunnmodell finnes, spesialtilfeller åpne |
| 17 Tabeller/oppslag | 225–284 | 60 | PAGE_PRESENT, eksempler vurdert | Ikke kopi av boktabeller; uavhengige kilder kreves |

**Totalt:** 278 forskjellige trykte sider i intervallet 7–284, hvorav 218 sider før tabellseksjonen. Bokside 211 gir ett ekstra bilde.

## Konkrete eksempler i bildematerialet
- **Side 55 (kjemi):** atomstruktur, protontall/nøytrontall og massetall. Formelkatalogen er supplert med `A = Z + N`.
- **Side 59–60 (kjemi):** nuklidehenfall/halveringstid og masse–energi-relasjon; vi har lagt inn generelle pedagogiske standardformler.
- **Side 123 (kraftelektronikk):** likeretter- og rippelmodeller. Vi har laget en selvstendig kalkulator for idealisert enfase helbølgelikeretting. Detaljert ripple med last/filter gjenstår.
- **Side 149 (damplære):** entalpi for våt og overhetet damp og spesifikt volum. Vi har lagt inn pedagogiske relasjoner med brukeroppgitte `hf/hg` og tørrhetsgrad; ingen kopierte damptabeller.
- **Side 177 (kuldeteknikk):** kjøle-COP basert på entalpier, massestrøm og kompressormodeller. De første av disse finnes nå i biblioteket.
- **Side 219 (økonomi):** realrente, nåverdi og tilbakebetaling. Vi har lagt inn egne standarduttrykk og kalkulatorer for annuitet og netto nåverdi.

## Implementert etter førsteutgaven
- To utvidelsespakker er **samordnet**, ikke dobbeltregistrert i brukergrensesnittet.
- **366 unike formeloppføringer, 28 fagkategorier, 52 kalkulatorer og 30 øvingsoppgaver.**
- Originalt brukergrensesnitt bevares; egenskaper og tester oppdateres.
- Alle filer i `/students/` lastes lokalt uten API/analytics. Offline-cache oppdatert **kun i utviklingsbranch**.
- Pakkene har innhold og eksempler formulert selvstendig; den opphavsrettslig beskyttede bokas skann, tabeller og redaksjonelle oppsett er **ikke** lagt i GitHub.

## Hva «ferdig med hele boken» vil kreve
1. Radvis register av **hver matematisk formel/variant** med manuell inspeksjon av bilde og egen tolkning; innhold som trenger bekreftelse merkes uavklart. 218 bildesider innebærer omfattende arbeid.
2. Uavhengig faglig kontroll (dimensjoner, forutsetninger, fortegnskonvensjoner, gyldighetsområde, eksakte symboler) av alle 366 eksisterende og påfølgende oppføringer.
3. Egne fagillustrasjoner, figurer og tabeller; ingen kopiering av den unike tabellsamlingen.
4. Flere maritime avanserte verktøy: sjøvannskorrigert draft survey, skrogbøyning, fortøyning, tungløft, GZ/KN med fartøyspesifikke data – kun undervisning.
5. Browser/tilgjengelighetskontroll (desktop, mobil, touch, navigasjon med tastatur, reflow, tema) og reell PWA-offline med oppgradering.
6. Rettighets- og fagreview før nettstedet indekseres eller markedsføres med påstanden «fullstendig».

**Ikke-oppnådd:** Full linje-for-linje/formel-for-formel-kontroll; alle tabeller; komplett matematisk regression på tvers av tillatte inndataverdier; produksjonsklar status.

## Sluttkontroll og frigivelse
Ingen merge, produksjonsdeploy eller omdøping til offisiell `v8.8.0` uten eksplisitt godkjenning. PR #35 skal fortsatt være Draft.
