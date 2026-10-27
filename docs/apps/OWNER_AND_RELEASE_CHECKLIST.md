# Eierens oppgaver og utgivelseskontroll

Utvikling og bygging er autorisert. Ingen butikkinnsending, produksjonsdeploy,
main-merge eller endring av produksjonsanalytics er utført.

## Dette må Trygve gjøre uten å programmere

1. Opprett/bekreft utviklerkontoene hos Google Play, Samsung Seller Portal,
   Microsoft Partner Center og Apple Developer/App Store Connect. Fullfør
   identitets-/virksomhetskontroll, avtaler, kontakt- og eventuelle betalingsopplysninger.
2. Reserver/bekreft offentlig appnavn og identiteter i konsollene. Nåværende
   utviklings-ID er app.marinetools.preview. com.marinetools.app er bare et
   forslag; tilgjengelighet/eierskap er ikke bekreftet. Gi korrekt offentlig
   Windows Package Identity/Publisher og Apple Team ID gjennom konsoll-/repooppsett.
3. Velg signeringsstrategi før første Android-utgivelse. Ved samme pakke-ID på
   Google og Samsung må sertifikatstrategien støtte ønskede oppdateringer på
   tvers av butikker. Google-generert appsigneringsnøkkel og en separat
   Samsung-signatur er ikke automatisk kompatible. Vurder egen appsigneringsnøkkel
   importert til Play og samme nøkkel til Galaxy-APK; bekreft i begge konsoller.
4. Opprett signeringsmateriale i de aktuelle plattformverktøyene. Legg hemmeligheter
   i GitHub Environments/Secrets eller godkjent nøkkelhåndtering. Ikke send passord,
   private nøkler, .p12-filer, provisioning-profiler eller keystores i chat.
5. Godkjenn appens personverntekst og sørg for en stabil offentlig policy-URL.
   Fullfør Data Safety/App Privacy, innholdsvurdering og eventuelle næringsdrivende-
   opplysninger. Utkast er i apps/store; de er ikke innsendte svar.
6. Skaff testere/enheter: Android, Samsung Galaxy, iPhone, iPad og Windows 10/11.
   Følg QA_MATRIX.md, særlig systemets kopiering/deling, lagring, filimport,
   tilbakeknapp, skjermtastatur, rotasjon, oppdatering og offline oppstart.
7. Bruk intern/lukket testing først. For berørte nye personlige Play-kontoer
   kreves lukket test med minst 12 påmeldte testere i 14 sammenhengende dager før
   søknad om produksjonstilgang. Kravet må bekreftes mot kontoen.
8. Godkjenn butikktekster og faktiske skjermbilder. Bildene fra web er tydelig
   referansemateriell; simulatorbilder er ikke fysisk enhetsakseptanse.
9. Gi eksplisitt godkjenning av navngitt versjon og signerte filers SHA-256 før
   noen butikkinnsending eller produksjonsutgivelse. Interne tester er også en
   konkret distribusjonshandling og skal avtales før opplasting.

## Tekniske kontroller før en signert kandidat

- Bekreft butikk-ID-er; behold separat preview-ID for utviklingsbygg.
- Bekreft at APK/AAB, MSIX og Apple-arkiv har riktig versjon, buildnummer,
  signatur, ikon, støttede enheter og personvernfiler.
- Fullfør alle uverifiserte native fil-/delingsflyter og installasjon/avinstallasjon.
- Kontroller Android target SDK 36 og Apple Xcode 26+/iOS SDK 26+ på nytt ved innsending.
- Kontroller WebView2-forutsetning på Windows 10 og korrekt MSIX Publisher fra Partner Center.
- Ikke aktiver API/analytics eller distribuér Education offline gjennom en
  navneendring eller signeringsjobb. Disse krever egne gjennomgåtte endringer.
- Kontroller økonomi-, API- og tilgangsgrenser sammen med sikkerhets-PR #40 før
  en eventuell nettbasert variant. Nåværende kandidat er lokal og isolert.

## Butikkrekkefølge

Google: AAB signert med korrekt upload key → Play intern test → testkrav/
produksjonstilgang → godkjent produksjonsinnsending.

Samsung: samme Android-kode → signert universal APK eller avtalt AAB/
Samsung-nøkkelhåndtering → kompatible Galaxy-enheter/lukket beta → godkjent innsending.

Microsoft: reserver app → sett eksakt Package Identity/Publisher → signér og
installer MSIX for test → valider sertifisering/metadata/WebView2 → godkjent innsending.

Apple: registrer Bundle ID/app → konfigurer Team/profil/distribusjonssignering →
signert archive/export → TestFlight etter avtale → enhets-/personvernakseptanse →
godkjent App Store-innsending.

Ingen av disse kontoavhengige stegene er markert som gjennomført uten bevis.
