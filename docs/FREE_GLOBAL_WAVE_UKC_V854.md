# Marine Tools — free global wave + UKC plan

Status: implementation plan, 2026-10-03

## Objective

Replace the expired PacIOOS WaveWatch fallback with a no-subscription global wave source, and prepare UKC integration without presenting planning data as navigation-approved data.

## Global waves — preferred free path

### NOAA/NCEP GFS-Wave

Preferred primary global fallback outside MET Norway Oceanforecast coverage.

Why:
- operational global wave forecast
- updated every 6 hours
- direct NOAA/NCEP source
- no paid API subscription or commercial API fee
- GRIB2 files and `.idx` inventories are published through NOMADS/NOAA Open Data
- expected wave fields include significant wave height, wave direction/period and swell fields depending on product

Implementation approach for Cloudflare Worker:
1. Determine latest complete GFS-Wave cycle (00/06/12/18 UTC).
2. Use NOAA index/GRIB filter or byte-range requests to retrieve only required GRIB2 message(s), not full global files.
3. Decode only the required records in the Worker using a bundled open-source GRIB2 decoder/WASM module.
4. Cache cycle metadata and point results aggressively.
5. Return source timestamp, model cycle, forecast hour and provider metadata.
6. Fall back to MET Oceanforecast where available; NOAA is the global fallback, not a replacement for MET in its core area.

Candidate decoder: `@trkbt10/grib2-wasm` (Apache-2.0), pure WebAssembly with browser/JS support and NCEP GFS verified by the project. It must be validated in Cloudflare Workers before production use.

Alternative decoder candidate: `@mattnucc/gribberish` (MIT), supports NOAA `.idx` plus HTTP range access, but its WASI path must be verified against Cloudflare Worker runtime compatibility.

### Copernicus Marine — free fallback option

Copernicus Marine global wave forecast is also free for commercial and non-commercial use with required acknowledgement. Product `GLOBAL_ANALYSISFORECAST_WAV_001_027` provides global 1/12-degree forecasts including VHM0, VMDR, VTPK/VTM02 and swell partitions.

Constraint: supported programmatic access is primarily through the Copernicus Marine Toolbox/Python API with free account credentials. That is less direct for the current JavaScript Cloudflare Worker than NOAA GRIB2, so NOAA is the preferred runtime implementation.

## Weather performance rule

The existing PacIOOS `NWW3_Global_Best` fallback must be removed from the active forecast chain because its forecast coverage ended in 2026-07.

Point Weather target flow:

`MET Locationforecast + MET Oceanforecast in parallel`

- clear inland point: return Locationforecast immediately and suppress marine fields
- valid MET marine point: use Oceanforecast
- no usable MET marine data: query NOAA GFS-Wave
- if NOAA is temporarily unavailable: return atmospheric weather immediately with marine fields unavailable; do not block the entire Weather response for a long timeout

## UKC — current frontend

Marine Tools already contains manual planning calculators:
- dynamic UKC with simplified squat
- static UKC using user-entered depth + tide/water level + draught + allowance
- vessel profile minimum UKC

These remain manual/planning aids until source-backed depth and water level are integrated.

## UKC Norway — preferred source pair

### Depth
Kartverket `Sjøkart - Dybdedata WFS`
- public/open data, CC BY 4.0
- depth referenced to Sjøkartnull / chart datum (EPSG:9672)
- public vectorized dataset with roughly 50 m point spacing under current release rules
- continuously updated
- source for official chart products, but the WFS dataset itself is explicitly not a navigation product

### Water level
Kartverket water-level/tide API
- open and free
- CC BY 4.0
- position-based predictions/observations
- can return values relative to Sjøkartnull

Norway planning UKC can therefore use an explicitly compatible datum pair when both values are requested/reported relative to Sjøkartnull.

Required output metadata:
- `planningOnly: true`
- `depthSource`
- `depthDatum: Sjøkartnull / EPSG:9672`
- `waterLevelSource`
- `waterLevelDatum: Sjøkartnull`
- `depthQuality` / survey metadata when available
- `sourceTimestamp`
- `draught`
- `squat` and all other corrections separately
- `minimumUKC`
- warnings

## Global UKC — free planning-data candidates

### Bathymetry: GEBCO_2026
- global 15 arc-second terrain/bathymetry grid
- public domain, free including commercial use
- WGS84 horizontal reference
- values are generated under an assumption of Mean Sea Level, but GEBCO explicitly warns that some shallow-water source data can use other vertical datums
- TID grid can expose source-type/data-quality context
- explicitly not for navigation or safety-at-sea use

Classification: `planningOnly` / broad bathymetry context, never `chartedDepth`.

### Tide: FES2022B heights
- global tide elevation model
- heights are available for all uses, including commercial use, after free AVISO registration/license acceptance
- 2-minute Cartesian grids plus official PyFES prediction code
- official tide-prediction software is GPL
- global tide solution has improved coastal resolution relative to earlier versions

Important datum gate:
FES2022 tide height is a model tide elevation/correction and GEBCO is a heterogeneous MSL-assumed bathymetry grid. Marine Tools must not label `GEBCO depth + FES tide` as navigational UKC until the vertical-reference relationship is documented for this use.

Initial global implementation may expose:
- `modelBathymetry` from GEBCO
- `tideCorrection` from FES2022
- source/reference metadata
- `planningOnly: true`
- a warning that datum compatibility is not chart-datum equivalent

A final global calculated UKC should remain gated until datum compatibility/transformation is verified.

## API stages

### Stage 1 — `/api/bathymetry`
Point lookup only.
- Norway: Kartverket where available
- Global fallback: GEBCO_2026
- always return provider, vertical reference, quality class and planning-only status

### Stage 2 — `/api/water-level`
- Norway: Kartverket Sjøkartnull prediction/observation
- Global: FES2022 tide prediction after access/runtime path is implemented

### Stage 3 — `/api/ukc`
Only calculate automatically when the backend can state whether the depth and water-level references are compatible.

Suggested response fields:
- `planningOnly`
- `latitude`, `longitude`, `time`
- `depthValue`, `depthSource`, `depthDatum`, `depthQuality`
- `waterLevel`, `waterLevelSource`, `waterLevelDatum`
- `datumCompatible`
- `draught`
- `squat`, `heelAllowance`, `trimAllowance`, `waveAllowance`, `densityAllowance`, `otherAllowance`
- `availableDepth`
- `ukc`
- `minimumUKC`
- `status`
- `warnings`

## Safety/product boundary

No source in the global planning path replaces approved ECDIS/ENC, official voyage planning or vessel UKC procedures. Marine Tools must surface source, timestamp, datum, quality and limitations next to the number, not only in a generic disclaimer.
