# Seawater density: formulation attribution and scope

`seawater-density-20261117.js` is an original, dependency-free implementation
of the **TEOS-10 Gibbs pressure derivative**, assuming Absolute Salinity equals
Reference Salinity. It contains no copied, translated or bundled GSW software.
The implementation evaluates the published coefficient sums directly.

## Numerical formulations and reuse terms

The numerical coefficients are attributed to the **International Association
for the Properties of Water and Steam (IAPWS)**:

- **IAPWS R13-08 (September 2008)**, *Release on the IAPWS Formulation 2008 for
  the Thermodynamic Properties of Seawater*, copyright 2008 IAPWS.
  [Release PDF](https://www.teos-10.org/pubs/IAPWS-08.pdf).
  Equations (3), (4), (7); Tables 1, 2 and 6. Only the 39 coefficients with
  nonzero pressure exponent enter the saline pressure derivative.
- **IAPWS SR7-09 (September 2009)**, *Supplementary Release on a Computationally
  Efficient Thermodynamic Formulation for Liquid Water for Oceanographic Use*,
  copyright 2009 IAPWS.
  [Release PDF](https://iapws.org/technical-guidance/release/OceanLiquid.download).
  Equation (1); Tables 1, 2 and 4. Only the 33 coefficients with nonzero pressure
  exponent enter the pure-water pressure derivative.

Both releases permit publication, including partial publication, with attribution
to IAPWS (cover page of each release). Keep these notices and the module header
when distributing the coefficient-based implementation, including offline/native
packages. Original project code remains governed by the repository `LICENSE`;
it does not alter the reuse permission for the attributed IAPWS material.
No IAPWS, IOC, SCOR, IAPSO or GSW endorsement or certification is claimed.

Supporting scientific references:

- Feistel, R. (2008), *A Gibbs function for seawater thermodynamics for -6 to
  80 C and salinity up to 120 g/kg*, Deep-Sea Research I 55, 1639-1671.
  [DOI: 10.1016/j.dsr.2008.07.004](https://doi.org/10.1016/j.dsr.2008.07.004).
- Feistel, R. (2003), *A new extended Gibbs thermodynamic potential of seawater*,
  Progress in Oceanography 58, 43-114.
  [DOI: 10.1016/S0079-6611(03)00088-0](https://doi.org/10.1016/S0079-6611(03)00088-0).
- IOC, SCOR and IAPSO (2010), *The international thermodynamic equation of
  seawater - 2010: Calculation and use of thermodynamic properties*, Manuals
  and Guides No. 56. [TEOS-10 Manual](https://www.teos-10.org/pubs/TEOS-10_Manual.pdf),
  sections 2.5, 2.8 and appendices G/H.

## GSW licence distinction

The checked [GSW Toolbox licence](https://www.teos-10.org/pubs/gsw/html/gsw_licence.html)
expressly permits redistribution without modification, conditional on notice
retention and other stated terms. That software permission is not used for this
module: its control flow and coefficient-sum implementation were written locally
from the IAPWS equations and tables. Using an equation does not require copying
the GSW implementation. This conclusion concerns this implementation and the
linked licence; it makes no assertion about every separately licensed GSW port.

## Inputs, pressure and composition boundary

- `sp`: **Practical Salinity**, dimensionless PSS-78, **0 to 40**. It is not a
  g/kg mass fraction. Low SP values are modelled as dilutions of Reference
  Composition Seawater, not a conductivity-to-salinity conversion.
- `tC`: **in-situ temperature**, ITS-90 degrees Celsius, **0 to 40**. Potential
  Temperature and Conservative Temperature are different inputs and cannot be
  substituted.
- `pDbar`: **sea pressure**, dbar above 101325 Pa, **0 to 9989.8675** inclusive;
  default zero. Absolute pressure is `101325 + 10000*pDbar` Pa, capped at 100 MPa.
  FWA/DWA and displacement use surface water, normally `pDbar = 0`.

The API assumes `SA = SR = (35.16504/35)*SP` g/kg and ignores the Absolute
Salinity anomaly. It does not take location, infer Baltic/coastal composition,
or account for dissolved air, suspended material or nonstandard freshwater
solutes. No measured environmental density accuracy is guaranteed from SP and
temperature alone. Its domain is a deliberately smaller rectangular subset of
the published formulations; subzero polar water and concentrated brines are
refused. It is not a freezing-point, phase-equilibrium or measurement model.

Density uses `rho = 1/(dg/dP)` with `g = gW + gS`. This directly accepts
in-situ temperature, so neither a Conservative Temperature approximation nor
the Roquet 75-term fit is involved. The saline logarithmic terms are independent
of pressure and vanish from this derivative, including at SP=0.

`valid: true` means the numeric inputs lie in the implemented domain; it does
not certify composition, input provenance or fitness for vessel operations.
Results are planning/calculation aids, not approved navigation or class-approved
calculations. The conventional 1.000/1.025 t/m3 FWA/DWA reference densities
remain conventions; the equation is not adjusted to reproduce them exactly.

## Independent verification

`tests/seawater-density-reference-20261117.cjs` uses literal values from the
official [GSW density example](https://www.teos-10.org/pubs/gsw/html/gsw_rho_t_exact.html),
the [GSW Reference Salinity example](https://www.teos-10.org/pubs/gsw/html/gsw_SR_from_SP.html),
SR7-09 Table 6 and R13-08 Table 8(a,c). These are published check data, not
generated baselines or copied software. Test comments distinguish numerical,
printed-digit and cross-formulation tolerances from physical uncertainty.
