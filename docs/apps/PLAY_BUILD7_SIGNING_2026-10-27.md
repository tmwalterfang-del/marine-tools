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
