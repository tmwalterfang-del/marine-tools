# Assignment provenance and interactive workspace — 2026-10-20

The pre-existing 36 numerical practice exercises are authored study examples. The implementation audit did not establish that these are transcriptions or adaptations of the uploaded assignments. The practice page now states this explicitly. Its existing discipline filters cover Mathematics & Physics, Ship Stability & Cargo, Marine Engineering & Energy, Electrical & Electronics, Nautical Studies, Mechanics & Materials, Chemistry and Engineering Economics, plus three difficulty levels. Available exercise counts vary by filter.

## Uploaded documents inspected in this update

- `Arbeidskrav 2 VDL.docx`, 9 pages: pump replacement, crankshaft deflection, planned maintenance, fault trees, ISM, job analysis and drydock planning. The document's internal heading says Arbeidskrav 1. These maintenance questions have not been imported into the numerical exercise bank.
- `EKSAMEN(2).docx`, 4 pages: maintenance/NDT, crankshaft deflection, condition monitoring, risk assessment, docking and electrical isolation. Not imported as numerical practice exercises.
- `k48-7.pdf`, pages 133–139: roll period, GM/GZ targets, combined stability and cargo exercises. This update uses actual starting values from page 139 task 10 (M/S Linda) page 134 task 3 (Mercandian Importer), and page 137 task 5 (M/S Sidus discharge and ballast). These are structured templates, not complete ship calculations.

This is a targeted review, not a claim that all uploaded assignments have been processed. User documents may contain student answers; these are not assumed to be authoritative operating instructions.

## Implemented

`students/interactive.html` is one workspace for nine modules. Switching retains the existing module document and its input state for the current page session. Standalone pages remain accessible. This does not persist all module states across a browser reload; use the existing JSON exports.

The cargo workshop handles up to 60 ordered loading, discharge and shift operations. It calculates mass, vertical/longitudinal/transverse moments, KG/LCG/TCG and FSC for each complete stage. Optional constant KM produces illustrative GM only. A volume/stowage-factor helper calculates cargo mass. HTML reports include the graph, all input operations, the ledger, source provenance and model limits; SVG, CSV and validated JSON round-trip are included.

The default demonstration uses invented data and says so. Named-ship templates retain only source starting values and leave missing LCG/hydrostatic/tank data blank. TCG=0 is explicitly a centreline study assumption. No missing ship tables are reconstructed from answer values. M/S Linda requires hold capacities/centres and summer displacement to reproduce its full task; Importer requires tank centres/FSM changes and hydrostatics. The current workshop does not calculate draft, trim, load-line headroom, GZ or structural loads, and cannot certify a loading condition. The separate synthetic GZ lab does not represent a named ship's curve.

## Verification

31 independent numerical/DOM/export checks cover balance identities, sequential conditions, shift invariance, free-surface moments, missing values, invalid discharges, transactional scenario validation, escaped provenance, stowage conversion and workspace navigation/state retention. Existing tests are rerun before delivery. The Cloudflare preview login was completed and its main page visibly verified; updated page browser checks are recorded after deployment.
