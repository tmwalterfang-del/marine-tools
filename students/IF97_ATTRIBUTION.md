# IF97 library attribution / technical boundary

**Upstream library:** NeutriumJS.thermo.IAPWS97 1.x (Native Dynamics / Neutrium, © 2015).  
**Repository:** https://github.com/NativeDynamics/NeutriumJS.thermo.IAPWS97  
**License:** Creative Commons Attribution 4.0 International (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

Vendored copy in `vendor/neutrium-if97.min.js`, taken from the original upstream `dist/neutriumJS.thermo.IAPWS97.min.js`. The vendor file has an attribution banner prepended; the distribution script body is otherwise unchanged. The library is deprecated upstream; users should be aware of this and independent reference tests are mandatory. This integration does not imply any endorsement by Neutrium or IAPWS.

**IAPWS formulation:** https://www.iapws.org/relguide/IF97-Rev.html . IAPWS publishes the thermodynamic equations but is not the software supplier, and no IAPWS or Neutrium certified software endorsement is claimed.

**Phase/domain policy for Marine Tools Draft v2:**
- Saturation properties computed from IF97 Region 4 saturation temperature + Region 1 saturated liquid / Region 2 dry steam property equations for **0.01 to 160 bar(a)** (below the Region 3 transition). Above 160 bar the legacy chart's *explicitly marked interpolated reference table* remains the only plotted source, but precision claims do not carry across the high-pressure section.
- Superheated points are accepted only when physically above the saturation line and within a deliberately narrower validated Region 2 range: **0.01–100 bar(a)** and **T ≤ 550 °C**, unless later tests expand it.
- Quality is defined *only* in saturated two-phase region. Superheated steam has no quality x.
- This integration must pass independent IAPWS example tests and browser regression checks before any release. A correct equation of state does not by itself certify process or vessel work calculations.
