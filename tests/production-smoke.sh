#!/usr/bin/env bash
set -euo pipefail

VERSION="8.5.7"
SITE="https://marinetools.app"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 MarineToolsSmoke/${VERSION}"
: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
: "${GITHUB_API_URL:=https://api.github.com}"

site_curl(){
  curl -sS --http1.1 --max-time "${MT_TIMEOUT:-25}" \
    -A "$UA" \
    -H 'Accept: text/html,application/xhtml+xml,application/javascript,*/*;q=0.8' \
    -H 'Accept-Language: en-GB,en;q=0.9' \
    "$@"
}
show_failure(){
  local label="$1" status="$2" body="$3"
  echo "::error::$label returned HTTP $status"
  [[ -f "$body" ]] && head -c 1200 "$body" || true
  echo
}

wait_worker_deploy(){
  local url="$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/$GITHUB_SHA/check-runs" body=/tmp/mt-check-runs.json
  for _ in {1..36}; do
    curl -fsSL --max-time 20 \
      -H "Authorization: Bearer $GH_TOKEN" \
      -H 'Accept: application/vnd.github+json' \
      -H 'X-GitHub-Api-Version: 2022-11-28' \
      "$url" -o "$body"
    local found status conclusion
    found=$(jq '[.check_runs[] | select(.name == "Workers Builds: marine-tools-api")] | length' "$body")
    if [[ "$found" -gt 0 ]]; then
      status=$(jq -r '[.check_runs[] | select(.name == "Workers Builds: marine-tools-api")] | sort_by(.started_at) | last | .status' "$body")
      conclusion=$(jq -r '[.check_runs[] | select(.name == "Workers Builds: marine-tools-api")] | sort_by(.started_at) | last | (.conclusion // "")' "$body")
      if [[ "$status" == "completed" && "$conclusion" == "success" ]]; then
        echo "Cloudflare Worker deployment succeeded for $GITHUB_SHA."
        return 0
      fi
      if [[ "$status" == "completed" && "$conclusion" != "success" ]]; then
        echo "::error::Cloudflare Worker deployment concluded: $conclusion"
        return 1
      fi
    fi
    sleep 5
  done
  echo "::error::Timed out waiting for Cloudflare Worker deployment check."
  return 1
}

wait_frontend(){
  local body=/tmp/mt-index.html status=000
  for _ in {1..36}; do
    status=$(site_curl -o "$body" -w '%{http_code}' "$SITE/" || true)
    if [[ "$status" == 200 ]] && grep -q 'application-version" content="8.5.7' "$body"; then
      echo "Frontend v$VERSION is live."
      return 0
    fi
    sleep 5
  done
  show_failure 'Frontend release probe' "$status" "$body"
  return 1
}

asset_check(){
  local label="$1" url="$2" pattern="$3" body=/tmp/mt-asset status
  status=$(site_curl -o "$body" -w '%{http_code}' "$url" || true)
  [[ "$status" == 200 ]] && grep -q "$pattern" "$body" || { show_failure "$label" "$status" "$body"; return 1; }
}

wait_worker_deploy
wait_frontend
asset_check 'Weather map production asset' "$SITE/weather-map-v854.js?v=20261003-v8-5-7" 'wxShowMapV854'
asset_check 'Release UI production asset' "$SITE/release-v857.js?v=20261003-v8-5-7" "version:'8.5.7'"

grep -q 'worker/worker-v857-runtime.js' wrangler.jsonc || { echo '::error::Production Wrangler is not pointing at the runtime-smoke wrapper.'; exit 1; }
grep -Fq '*/15 * * * *' wrangler.jsonc || { echo '::error::Cloudflare runtime smoke cron is missing.'; exit 1; }

echo 'Deployment/frontend smoke passed. Backend Weather/AIS runtime checks execute inside Cloudflare every 15 minutes, with an hourly deep check, so they are not blocked by the public WAF challenge.'
