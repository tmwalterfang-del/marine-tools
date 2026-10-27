# IF97 library attribution / technical boundary

**Upstream library:** NeutriumJS.thermo.IAPWS97 1.x (Native Dynamics / Neutrium, © 2015).  
**Repository:** https://github.com/NativeDynamics/NeutriumJS.thermo.IAPWS97  
**License:** Creative Commons Attribution 4.0 International (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

Vendored copy in `vendor/neutrium-if97.min.js`, taken from the original upstream `dist/neutriumJS.thermo.IAPWS97.min.js`. The vendor file has an attribution banner prepended; the distribution script body is otherwise unchanged. The library is deprecated upstream; users should be aware of this and independent reference tests are mandatory. This integration does not imply any endorsement by Neutrium or IAPWS.

**IAPWS formulation:** https://www.iapws.org/relguide/IF97-Rev.html . IAPWS publishes the thermodynamic equations but is not the software supplier, and no IAPWS or Neutrium certified software endorsement is claimed.

**Historical phase/domain policy for Marine Tools Draft v2 (superseded below):**
- Saturation properties computed from IF97 Region 4 saturation temperature + Region 1 saturated liquid / Region 2 dry steam property equations for **0.01 to 160 bar(a)** (below the Region 3 transition). Saturation above 160 bar(a), the critical point and Region 3 are not plotted or calculated. The former third-party reference anchors and interpolation fallback have been removed. A missing solver disables the lab rather than substituting a different property model.
- Superheated points are accepted only when physically above the saturation line and within a deliberately narrower validated Region 2 range: **0.01–100 bar(a)** and **T ≤ 400 °C**, unless later tests expand it.
- Quality is defined *only* in saturated two-phase region. Superheated steam has no quality x.
- This integration must pass independent IAPWS example tests and browser regression checks before any release. A correct equation of state does not by itself certify process or vessel work calculations.

**Integration changes (20 October 2026):** Strict domain and solver availability checks, no reference-table fallback, explicit wet-state chart picking, endpoint-only connector description, and expanded entropy axis. The vendored solver body is unchanged.

## Verified extension — 27 October 2026

The Region 2 adapter now accepts 0.01–160 bar(a), above saturation (numerical margin 1e-7 °C) through 600 °C. At 16 MPa, saturation is below 623.15 K; stable vapour in this bounded pressure interval does not require Region 3. The wet domain remains 0.01–160 bar(a). The former 100 bar / 400 °C limits above describe the earlier draft and are superseded by this tested extension.

An independent Python `iapws==1.5.4` implementation generated 225 state fixtures (provenance in `tests/fixtures/if97-independent-20261027.json`). Published IAPWS Tables 5/15/35/36 remain the independent specification anchors. This verifies implementation agreement within the tested domain, not experimental property uncertainty or IAPWS certification. IF97 permits small Gibbs inconsistencies at the saturation boundary; Table 44 is used for that tolerance rather than forcing exact coexistence between independently fitted Region 1/2 equations.

Pressure/enthalpy and pressure/entropy inversions use bounded bisection over these equations. No tabular fallback or Region 3 call is introduced. Reversible adiabatic and ideal throttling paths solve intermediate states. An adiabatic turbine with specified isentropic efficiency solves endpoints and work only; its irreversible internal path is not inferred. Kinetic/potential energy changes are neglected and work out is positive. Subcooled endpoints, non-expansion pressure changes and states above the validated bounds are rejected.

The pure `MT_IF97` state/process API has no DOM or network dependency and can be reused by a PWA or mobile WebView. UI, chart and exports remain a separate layer. The vendored engine is unchanged and its CC BY 4.0 attribution remains required in apps and exported distributions.

A plotted throttle curve is an equilibrium constant-enthalpy locus. It is not a resolved flow field inside a valve. Published Region 2 points at 0.0035 MPa / 300 and 700 K are additionally checked through the expanded bar/Celsius adapter.
