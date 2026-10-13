#!/usr/bin/env bash
set -euo pipefail

VERSION="8.6.1"
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
grep -q '<meta name="application-version" content="8.6.1">' index.html || { echo '::error::Frontend release metadata is not v8.6.1.'; exit 1; }
grep -q 'release-v860.js?v=20261013-v8-6-1' index.html || { echo '::error::Release UI is not wired into index.html.'; exit 1; }
test -f weather-map-v854.js || { echo '::error::Weather map production asset is missing.'; exit 1; }
grep -q 'wxShowMapV854' weather-map-v854.js || { echo '::error::Weather map production asset failed integrity check.'; exit 1; }
test -f release-v860.js || { echo '::error::Release UI production asset is missing.'; exit 1; }
grep -q "version:'8.6.1'" release-v860.js || { echo '::error::Release UI version metadata failed integrity check.'; exit 1; }
test -f voyage-estimate-v861.js || { echo '::error::Voyage Estimate JavaScript asset is missing.'; exit 1; }
test -f voyage-estimate-v861.css || { echo '::error::Voyage Estimate CSS asset is missing.'; exit 1; }
test -f voyage-planning-draft-v1.js || { echo '::error::Voyage Planning Lab JavaScript asset is missing.'; exit 1; }
test -f voyage-planning-draft-v1.css || { echo '::error::Voyage Planning Lab CSS asset is missing.'; exit 1; }
grep -q 'voyage-planning-lab' index.html || { echo '::error::Voyage Planning Lab page is not wired into index.html.'; exit 1; }
grep -q 'Bunker Requirement / Stem Planner' voyage-planning-draft-v1.js || { echo '::error::Voyage Planning Lab bunker draft is missing.'; exit 1; }
grep -q 'Vessel Consumption Curve' voyage-planning-draft-v1.js || { echo '::error::Voyage Planning Lab consumption-curve draft is missing.'; exit 1; }
test -f global-polish-v862.css || { echo '::error::Global visual polish CSS asset is missing.'; exit 1; }
grep -q 'global-polish-v862.css' index.html || { echo '::error::Global visual polish is not wired into index.html.'; exit 1; }
grep -q 'Port Distance & Sea Time' voyage-estimate-v861.js || { echo '::error::Voyage Estimate content failed integrity check.'; exit 1; }
grep -q 'originSnapKm' voyage-estimate-v861.js || { echo '::error::Voyage Estimate endpoint-distance allowance check is missing.'; exit 1; }
grep -q 'veViaSuez' voyage-estimate-v861.js || { echo '::error::Voyage Estimate route-preference checkboxes are missing.'; exit 1; }
grep -q 'CANAL_MAX_DRAFT_M' voyage-estimate-v861.js || { echo '::error::Voyage Estimate draft-gating integration is missing.'; exit 1; }
grep -q 'veDraftGateStatus' voyage-estimate-v861.js || { echo '::error::Voyage Estimate draft availability feedback is missing.'; exit 1; }
grep -q 'data-page="voyage-estimate"' index.html || { echo '::error::Voyage Estimate is not wired into production navigation.'; exit 1; }
grep -Fq 'function page(id){ensurePage(id);$' app.js || { echo '::error::Page navigation selector regression detected.'; exit 1; }
grep -q 'overflow-y:auto!important' sidebar-v858.css || { echo '::error::Sidebar scrolling fix is missing.'; exit 1; }
grep -q 'position:static' sidebar-v858.css || { echo '::error::Expanded Project menu must remain inside the scroll flow.'; exit 1; }
grep -q 'worker/worker-v860-dashboard.js' wrangler.jsonc || { echo '::error::Production Wrangler is not pointing at the current dashboard wrapper.'; exit 1; }
grep -Fq '*/15 * * * *' wrangler.jsonc || { echo '::error::Cloudflare runtime smoke cron is missing.'; exit 1; }

echo 'Deployment checks passed. Backend health, Weather, global-wave and AIS runtime checks execute inside Cloudflare, where the public WAF cannot block the synthetic runner.'
