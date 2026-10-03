#!/usr/bin/env bash
set -euo pipefail

VERSION="8.5.7"
API="https://api.marinetools.app"
SITE="https://marinetools.app"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 MarineToolsSmoke/${VERSION}"

api_curl(){
  curl -sS --http1.1 --max-time "${MT_TIMEOUT:-35}" \
    -A "$UA" \
    -H 'Accept: application/json, text/plain, */*' \
    -H 'Accept-Language: en-GB,en;q=0.9' \
    -H 'Origin: https://marinetools.app' \
    -H 'Referer: https://marinetools.app/' \
    -H 'Sec-Fetch-Site: same-site' \
    -H 'Sec-Fetch-Mode: cors' \
    -H 'Sec-Fetch-Dest: empty' \
    "$@"
}
site_curl(){
  curl -sS --http1.1 --max-time "${MT_TIMEOUT:-25}" \
    -A "$UA" \
    -H 'Accept: text/html,application/xhtml+xml,application/javascript,*/*;q=0.8' \
    -H 'Accept-Language: en-GB,en;q=0.9' \
    "$@"
}
fetch_status(){
  local mode="$1" url="$2" body="$3"; shift 3
  if [[ "$mode" == api ]]; then api_curl -o "$body" -w '%{http_code}' "$url" "$@"; else site_curl -o "$body" -w '%{http_code}' "$url" "$@"; fi
}
show_failure(){
  local label="$1" status="$2" body="$3"
  echo "::error::$label returned HTTP $status"
  head -c 800 "$body" || true
  echo
}

wait_release(){
  local body=/tmp/mt-release.json status=000
  for _ in {1..24}; do
    status=$(fetch_status api "$API/api/release" "$body" || true)
    if [[ "$status" == 200 ]] && jq -e --arg v "$VERSION" '.version == $v' "$body" >/dev/null 2>&1; then
      echo "Worker release v$VERSION is live."
      return 0
    fi
    sleep 10
  done
  show_failure 'Worker release probe' "$status" "$body"
  return 1
}
wait_frontend(){
  local body=/tmp/mt-index.html status=000
  for _ in {1..24}; do
    status=$(fetch_status site "$SITE/" "$body" || true)
    if [[ "$status" == 200 ]] && grep -q 'application-version" content="8.5.7' "$body"; then
      echo "Frontend v$VERSION is live."
      return 0
    fi
    sleep 10
  done
  show_failure 'Frontend release probe' "$status" "$body"
  return 1
}
json_check(){
  local label="$1" url="$2" filter="$3" body=/tmp/mt-check.json status
  status=$(fetch_status api "$url" "$body" || true)
  if [[ "$status" != 200 ]]; then show_failure "$label" "$status" "$body"; return 1; fi
  jq -e "$filter" "$body" >/dev/null || { echo "::error::$label returned unexpected JSON"; head -c 1200 "$body"; echo; return 1; }
}

wait_release
wait_frontend
json_check 'API health' "$API/api/health" '.status == "ok" and .release.version == "8.5.7"'
json_check 'Weather inland' "$API/api/weather?lat=59.42&lon=10.48&limit=2" '(.forecast | type == "array" and length > 0) and (.sources.weather | contains("MET Norway"))'
json_check 'Weather Norwegian sea area' "$API/api/weather?lat=58.20&lon=7.00&limit=2" '.forecast | type == "array" and length > 0'

wave_ok=0
for _ in {1..4}; do
  body=/tmp/mt-wave.json
  status=$(fetch_status api "$API/api/weather?lat=40&lon=-30&limit=2" "$body" || true)
  if [[ "$status" == 200 ]] && jq -e '(.forecast | type == "array" and length > 0) and ([.forecast[].hs != null] | any)' "$body" >/dev/null 2>&1; then wave_ok=1; break; fi
  sleep 10
done
if [[ "$wave_ok" != 1 ]]; then show_failure 'Global wave fallback' "${status:-000}" /tmp/mt-wave.json; exit 1; fi

json_check 'AIS Norway' "$API/api/ais/latest?minLat=58&maxLat=60&minLon=8&maxLon=11" 'type == "array" or type == "object"'
json_check 'AIS global' "$API/api/ais/latest?minLat=39&maxLat=41&minLon=-31&maxLon=-29" 'type == "array" or type == "object"'

body=/tmp/mt-map.js
status=$(fetch_status site "$SITE/weather-map-v854.js?v=20261003-v8-5-7" "$body" || true)
[[ "$status" == 200 ]] && grep -q 'wxShowMapV854' "$body" || { show_failure 'Weather map production asset' "$status" "$body"; exit 1; }
body=/tmp/mt-release.js
status=$(fetch_status site "$SITE/release-v857.js?v=20261003-v8-5-7" "$body" || true)
[[ "$status" == 200 ]] && grep -q "version:'8.5.7'" "$body" || { show_failure 'Release UI production asset' "$status" "$body"; exit 1; }

echo 'Production smoke checks passed.'
