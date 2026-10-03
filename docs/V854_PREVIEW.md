# v8.5.4 preview validation

This file documents the active preview validation endpoints for the free global wave + source-backed UKC work.

Preview endpoints:
- `/api/wave/probe?lat=40&lon=-30` — NOAA GFS-Wave transport/byte-range probe.
- `/api/wave/point-probe?lat=40&lon=-30` — NOAA point decode probe for significant wave height, primary wave period and primary wave direction.
- `/api/ukc/source-probe` — source connectivity summary.
- `/api/ukc/depth-probe?lat=59.1&lon=10.5` — Kartverket Dybdedata WMS GetFeatureInfo probe.

These endpoints are preview-only. They do not enable production UKC or change the existing production Weather flow.
