# Public privacy copy correction — 27 October 2026

Owner instruction: remove draft language from the live privacy page; draft
labels and internal review notes must not appear in public product copy.

This follow-up is based only on published main 71648f2899ed198a81f415daba8626b24e131db8.
It removes the editorial banner and owner/release-review paragraphs from the
single policy source and generated public/SPA views. It preserves the factual
pseudonymous/default-opt-out analytics description, online data flows, local-data
controls, rights and app/website distinctions. Unknown legal bases or agreements
are not replaced with invented assertions. The retention paragraph cites the
provider's documented three-month Analytics Engine service retention and keeps
other records distinct.

The generated page preserves Cloudflare email_off markers for no-JS contact
links. Policy script and service-worker cache identifiers are rotated so online
reloads and the next cache installation receive the corrected copy.

Local Chromium passed eight no-JS viewport profiles, direct access/refresh,
public-copy assertions, retained profile/preferences, backup download,
3.20 m/2.70 m calculator references and offline policy access. Existing release
metadata passed 18 checks. CI checks the final head in all three engines.

The release gate checks explicitly reject the old banner, implementation-draft
wording and owner-confirmation/review instructions in the rendered policy.
Actual post-deployment HTTPS access and absence of those notes must still be
verified on the public URL. Removing editorial text is not evidence that every
account-level retention/consent/transfer question from the internal audit is
resolved, nor authorization for a Google Play upload or app-stack merge.
