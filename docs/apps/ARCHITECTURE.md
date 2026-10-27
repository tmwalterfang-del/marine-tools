# App architecture assessment — 27 October 2026

Inspected base: 00346882550b7d21ddfc04cc7f0d6d3d677a2391 (Draft PR #35).
The main branch remains 6e10a501; security PR #40 is not merged. App work is
isolated on feature/cross-platform-app, stacked against the Education branch.
No production settings or backend handlers are changed by this assignment.

The frontend is plain HTML/CSS/JavaScript with lazy calculator renderers and
local browser storage, not a framework application. Cloudflare Pages hosts the
web UI and a Worker serves live providers and analytics. Worker configuration
selects worker-v860-dashboard.js. The deployed Access policy, rate bindings and
provider credentials cannot be verified from source alone. PR #40 addresses
known authentication/analytics issues; app distribution does not resolve those.

Reuse the existing frontend, PWA staging step, Capacitor 8 mobile projects and
Tauri 2 desktop shell. No Electron or independent platform calculator rewrite.
Windows gets MSIX around the existing lightweight Tauri executable rather than
a second remotely hosted PWA application: offline calculators remain bundled
and native file dialogs can be shared with desktop. macOS stays a secondary build.

Platform adapters isolate clipboard, file export/share, external browser and
back behavior. Public calculators keep their numerical code; adapter calls are
optional in the website and active only in staged app packages. Existing
Education natural-height frames, diagram controls and source audit are retained.

Development identity app.marinetools.preview is already established and remains
unchanged. Proposed production com.marinetools.app is not reserved or verified.
Windows Store identity/publisher and Apple Team ID must come from owner consoles.
Do not silently replace preview identities or treat suggested identifiers as owned.

The distributable candidate is local public calculators. Protected Education is
an external authenticated preview, never bundled/cached by the public app. Live
AIS/weather and telemetry stay disabled until staging authentication, disclosure
and release authorization are verified. Store copy must describe this limited
candidate honestly. Local inputs are app/browser storage, not encrypted credential
storage or cross-device sync. No authentication secrets belong in the frontend.

Build evidence from PR #35 establishes compilation, not installation, device QA
or Store approval. Current work adds release packaging and adapters; physical
Android/Samsung/iPhone/iPad/Windows testing and account-bound signing remain
explicit gates. Generated platform projects are reproducible from checked-in
configuration/overlays and pinned npm/Rust locks.
