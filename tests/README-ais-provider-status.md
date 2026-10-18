# AIS provider availability regression

Run the actual complete Worker chain with mocked upstream responses:

```sh
node tests/qa-ais-provider-status-20261018.mjs
node tests/qa-ais-comparison-20261018.mjs
```

Each scenario uses a fresh process to isolate provider and token caches. All credentials are synthetic; provider requests are intercepted and unexpected requests fail. Cases cover missing credentials, token/upstream failures, malformed responses, successful empty responses, populated responses, provider fallbacks, preview/production request routing and rejection of untrusted origins. Production request routing is simulated locally; this command does not call production.

For Chromium integration with the actual Worker chain and mocked providers, install Playwright and Leaflet in a temporary dependency folder (no production credentials):

```sh
npm install --prefix /tmp/marine-tools-qa playwright@1.64.0 leaflet@1.9.4
/tmp/marine-tools-qa/node_modules/.bin/playwright install --with-deps chromium
QA_PLAYWRIGHT_MODULE=file:///tmp/marine-tools-qa/node_modules/playwright/index.mjs \
QA_LEAFLET_DIR=/tmp/marine-tools-qa/node_modules/leaflet/dist \
node tests/qa-ais-provider-browser-20261018.mjs
```

`QA_CHROMIUM` may specify an existing compatible browser executable. `QA_OUTPUT` sets the output directory (default `qa-artifacts/ais-provider-browser`). Run from the repository root. Port 8789 must be free.

The browser suite checks all six viewport sizes in both themes. It verifies initial unavailability, populated CPA, an outage clearing previously displayed targets and numeric CPA, genuine empty success, and recovery. The missing-secret case runs before any token is cached; subsequent initial failures use a provider outage with fixed synthetic credentials, matching the lifetime of a real Worker environment. The separate-process Node suite tests missing secrets independently.

These are actual local browser/Worker tests. Providers, route weather and remote assets are controlled fixtures; this is not authenticated deployment, real AIS target or live CPA acceptance. JSON results and failure screenshots are written locally. Do not commit generated artifacts or session data.
