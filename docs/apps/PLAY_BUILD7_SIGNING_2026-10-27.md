# Play build 7 preparation — 27 October 2026

This supersedes the earlier owner decision to retain only the Preview identity.
The owner explicitly approved using **com.marinetools.app** and creating a new,
persistent upload key. The owner is preparing the Play Console fields themselves.
No store upload, declaration, submission or public app rollout is authorized for
the agent by this preparation request.

## Build identity and scope

- Version 0.2.0, versionCode 7, installed name Marine Tools.
- Android appId com.marinetools.app; previewId remains historical metadata.
- Internal-test label; production API, analytics and live AIS/weather remain off.
- Protected Education stays external and is not bundled offline.
- Public privacy source is identical to deployed main after #46, without
  editorial draft/approval notes.
- The custom link scheme is marinetools. HTTPS App Links and a production
  assetlinks.json deployment are not implied by the supplied JSON.

Changing the package ID creates a separate Android application. It does not
upgrade or automatically migrate app.marinetools.preview's local storage. The
existing Preview build-6 debug APK remains available for direct phone testing.
Backup/restore can transfer supported local data through explicit user action.

## Signing roles

The user supplied certificates.zip with deployment_cert.der,
hybrid_classical_cert.der and hybrid_pqc_cert.der. These are public app-signing
certificates, with no private upload key. The deployment certificate's SHA-256
matches the user-supplied DC:3B:7C:9A:...:AE:21 fingerprint. App Links JSON does
not sign an AAB.

A new RSA-4096 upload key was generated in a private current-user directory
outside the repository and OneDrive. Its random password is protected with
Windows DPAPI CurrentUser. Private key/password material is never committed,
uploaded to CI or included in deliverables. Only its public PEM certificate is
delivered. The key's password storage depends on this Windows user/profile;
secure backup/export is an owner action before changing or reinstalling Windows.

The Google-managed app-signing certificates and the local upload certificate
have different roles and may have different fingerprints. The supplied public
certificates cannot recreate Google's private signing keys.

## Verification and deliverables

Source syntax, isolated packaging and 44 adapter/guard checks pass. CI builds a
fresh Android project using the approved application ID and version 7, inspects
the exact package/manifest, and tests fresh-install Android behavior. The old
Preview build-4 to build-6 same-test-key upgrade remains separately proven;
there is no claim of an upgrade across different package IDs.

The release AAB is signed locally with the persistent upload key after download,
then checked with jarsigner and Google's bundletool. Validate its actual result
and certificate before calling the signed deliverable ready. No private key is
sent to a build runner. Runtime tests, source revision, bundle hash and signing
certificate evidence are recorded with the final delivery.

The APK is for direct device installation. The release-signed `.aab` is the
format for the owner's Play Console bundle field; it cannot be installed directly
on a phone. Store acceptance, legal/Data Safety/rating answers, physical-device
acceptance and Google-held signing/distribution are separate from structural
bundle/signature validation.

## Final build-7 result

Runtime/tested head: 43a5b62e15c5a865c5d82cc4ff370d5c7a7a6c1f.
CI temporary integration source: a8479c11b2a35f4bad0b1a6a169ee25551bce298
(not a main merge). Final CI run 40569434919 passed all jobs: Android build and
package inspection, Chromium/Firefox/WebKit policy and full app browser checks,
and Android emulator acceptance for the new com.marinetools.app package.
The first build-7 run compiled but was stopped by the package inspector using
the historical preview ID for the internal signature permission; that reference
was fixed without expanding the permitted permissions.

The final unsigned release bundle was independently downloaded and checked
against source/configuration/policy bytes and CI hashes, then signed locally.
The signed bundle passed jarsigner, a pinned-certificate verification of all
503 non-META-INF payload entries, Google bundletool validate, manifest checks
(package, version 7, debug false, backup/cleartext disabled), and byte-for-byte
comparison proving signing did not alter application payloads. Self-signed
upload-certificate trust-chain warnings from jarsigner are expected; the actual
signer is pinned to the approved local upload certificate below.

- Delivered file: deliverables/MarineTools-0.2.0-build7.aab (10,536,940 bytes).
- Signed AAB SHA-256: 2fd9d4018eaf70b025504bdddd36986c286913389b05778eee5959f1dad65100
- Unsigned AAB SHA-256: ef7b22f0b2d94771978a7c7786a87664cf0e72e66fe815a14ee99305bbb0a1b6
- Upload certificate SHA-256: 9E:55:82:3F:1F:08:B6:25:F7:B3:45:2D:B7:B7:D9:33:42:59:2C:95:F5:C7:2A:10:EC:5A:DD:87:94:98:38:28
- CI: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40569434919
- Unsigned CI build/package artifact: https://github.com/tmwalterfang-del/marine-tools/actions/runs/40569434919/artifacts/12765006743
- Public upload PEM, verification JSON and local signing/backup information are
  in the ignored deliverables folder; no private key is in that folder.

Native UI acceptance uses a debug build from the same checked source; local
release-bundle signature/structure checks are separate. The final Play-delivered
Google-signed APK and a physical phone have not been tested. No production-key
upgrade on-device, Play submission or app publication is claimed.

Release name: Marine Tools 0.2.0 (7), within 50 characters. en-US notes contain
282 Unicode characters within the 500-per-language limit. These texts and the
correct signed .aab file are supplied for the owner to use in Play Console.
The Preview build-6 APK remains a separate direct-install test file and cannot
be used in the AAB field. Local signing can be reproduced with
scripts/app/sign-android-bundle.ps1 and the private user-owned key paths.
Secure, recoverable key/password backup remains the owner's responsibility.
