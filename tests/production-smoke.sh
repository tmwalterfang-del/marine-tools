#!/usr/bin/env bash
set -euo pipefail

VERSION="8.5.7"
: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
: "${GITHUB_API_URL:=https://api.github.com}"

CHECKS_URL="$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/$GITHUB_SHA/check-runs"
CHECKS_BODY=/tmp/mt-check-runs.json

github_checks(){
  curl -fsSL --max-time 20 \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H 'Accept: application/vnd.github+json' \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    "$CHECKS_URL" -o "$CHECKS_BODY"
}

wait_for_check(){
  local label="$1" filter="$2" status conclusion count
  for _ in {1..60}; do
    github_checks
    count=$(jq --argjson f "$filter" '[.check_runs[] | select(.name == $f.name) | select(($f.environment == null) or (.deployment.environment == $f.environment))] | length' "$CHECKS_BODY")
    if [[ "$count" -gt 0 ]]; then
      status=$(jq -r --argjson f "$filter" '[.check_runs[] | select(.name == $f.name) | select(($f.environment == null) or (.deployment.environment == $f.environment))] | sort_by(.started_at) | last | .status' "$CHECKS_BODY")
      conclusion=$(jq -r --argjson f "$filter" '[.check_runs[] | select(.name == $f.name) | select(($f.environment == null) or (.deployment.environment == $f.environment))] | sort_by(.started_at) | last | (.conclusion // "")' "$CHECKS_BODY")
      if [[ "$status" == "completed" && "$conclusion" == "success" ]]; then
        echo "$label succeeded for $GITHUB_SHA."
        return 0
      fi
      if [[ "$status" == "completed" && "$conclusion" != "success" ]]; then
        echo "::error::$label concluded: $conclusion"
        return 1
      fi
    fi
    sleep 5
  done
  echo "::error::Timed out waiting for $label."
  return 1
}

# Do not curl marinetools.app/api.marinetools.app from GitHub-hosted runners.
# Cloudflare may challenge the runner before the request reaches the app.
wait_for_check 'Cloudflare Worker deployment' '{"name":"Workers Builds: marine-tools-api","environment":null}'
wait_for_check 'GitHub Pages deployment' '{"name":"deploy","environment":"github-pages"}'

# Validate the exact production source that the successful deployments were built from.
grep -q '<meta name="application-version" content="8.5.7">' index.html || { echo '::error::Frontend release metadata is not v8.5.7.'; exit 1; }
grep -q 'release-v857.js?v=20261003-v8-5-7' index.html || { echo '::error::Release UI is not wired into index.html.'; exit 1; }
test -f weather-map-v854.js || { echo '::error::Weather map production asset is missing.'; exit 1; }
grep -q 'wxShowMapV854' weather-map-v854.js || { echo '::error::Weather map production asset failed integrity check.'; exit 1; }
test -f release-v857.js || { echo '::error::Release UI production asset is missing.'; exit 1; }
grep -q "version:'8.5.7'" release-v857.js || { echo '::error::Release UI version metadata failed integrity check.'; exit 1; }
grep -q 'worker/worker-v857-runtime.js' wrangler.jsonc || { echo '::error::Production Wrangler is not pointing at the runtime-smoke wrapper.'; exit 1; }
grep -Fq '*/15 * * * *' wrangler.jsonc || { echo '::error::Cloudflare runtime smoke cron is missing.'; exit 1; }

echo 'Deployment checks passed. Backend health, Weather, global-wave and AIS runtime checks execute inside Cloudflare, where the public WAF cannot block the synthetic runner.'
