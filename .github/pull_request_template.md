## Summary

Describe the user-facing change and why it is needed.

## Safety / privacy

- [ ] No route or Weather coordinates are sent to analytics.
- [ ] No calculation inputs, vessel-profile values or search text are sent to analytics.
- [ ] Navigation / Weather / AIS changes remain planning/supporting aids only.

## Functional QA

- [ ] Cloudflare preview build and deployment succeeded.
- [ ] Weather tested inland.
- [ ] Weather tested in a Norwegian sea area.
- [ ] Global wave fallback tested when relevant.
- [ ] AIS tested in Norway and globally when relevant.
- [ ] Navigation / DDM checked when relevant.

## Mobile QA

- [ ] Portrait: sidebar, Weather map, DDM fields and tables checked.
- [ ] Landscape: sidebar, Weather map, DDM fields and tables checked.
- [ ] No overlapping controls or unusable horizontal clipping.

## Product / analytics

- [ ] 7-day and 30-day analytics reviewed for non-safety feature work.
- [ ] Technical health reviewed before changing live-data providers.
- [ ] Release/changelog metadata updated when this is a production release.

See `RELEASE_CHECKLIST.md` for the full release procedure.
