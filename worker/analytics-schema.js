import { toolTitles } from "./analytics-catalog.js";
const events = new Set([
  "session_start",
  "page_view",
  "tool_use",
  "engagement",
  "analytics_enabled",
  "version_seen",
  "session_tool_active",
  "session_search_active",
  "feature_use",
  "search_used",
  "search_result",
  "search_result_open",
  "favorite_toggle",
  "live_request_ok",
  "live_request_error",
  "data_source",
  "calculation_completed",
  "result_saved",
  "result_exported",
  "profile_value_used",
  "offline_tool_used",
  "visitor_type",
  "visit_started",
  "return_visit",
  "active_usage",
  "tool_opened",
  "calculation_attempt",
  "calculation_succeeded",
  "calculation_invalid",
  "calculation_failed",
  "education_page",
  "education_module",
  "education_filter",
  "education_formula",
  "education_presentation",
]);
const pages = new Set([
  "home",
  "fuel",
  "engineering",
  "electrical",
  "vessel-calcs",
  "voyage-estimate",
  "voyage-planning",
  "voyage-planning-lab",
  "energy-log",
  "quick",
  "weather",
  "navigation",
  "route-intelligence",
  "route-forecast",
  "ais",
  "profile",
  "settings",
  "privacy",
  "about",
  "survey",
  "support",
  "suggestions",
  "contact",
  "live-experimental",
  "education",
]);
const keys = new Set([
  "event",
  "page",
  "tool",
  "device",
  "version",
  "duration",
  "visitor",
  "session",
  "source",
  "visitorKind",
  "schema",
  "label",
  "consent",
]);
const fixed = new Set([
  "",
  "first",
  "returning",
  "analytics-v2",
  "profile-carrier",
  "profile-machinery",
  "profile-tank",
  "vessel-profile",
  "vessel-profile-import",
  "fuel-energy-log",
  "bunkering-to-energy-log",
  "fuel-converter",
  "bunkering",
  "vessel-consumption-curve",
  "global",
  "home",
  "global:has-result",
  "global:no-result",
  "home:has-result",
  "home:no-result",
  "weather",
  "ais",
  "route-forecast",
  "weather_map_open",
  "weather_geolocate",
  "weather_use_route_start",
  "route_analysis",
  "route_fit",
  "route_undo_waypoint",
  "route_clear",
]);
const sources = new Set([
  "weather:noaa-gfs-wave",
  "weather:met-ocean",
  "weather:atmospheric-only",
  "ais:barentswatch",
  "ais:open-licence",
  "ais:unknown",
  "route-weather:noaa-gfs-wave",
  "route-weather:met-ocean",
  "route-weather:atmospheric-only",
]);
export function validateAnalytics(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => !keys.has(k))
  )
    return "Unsupported analytics fields.";
  if (
    !events.has(body.event) ||
    !pages.has(body.page) ||
    !["desktop", "tablet", "mobile"].includes(body.device) ||
    typeof body.version !== "string" ||
    !/^[a-z0-9.-]{1,32}$/i.test(body.version)
  )
    return "Invalid analytics dimensions.";
  if (
    body.duration !== undefined &&
    (typeof body.duration !== "number" ||
      !Number.isFinite(body.duration) ||
      body.duration < 0 ||
      body.duration > 3600)
  )
    return "Invalid duration.";
  const tool = body.tool || "";
  if (typeof tool !== "string" || tool.length > 120) return "Invalid tool.";
  if (body.schema === "usage-v1") {
    if (tool && !/^[a-z0-9_-]{1,80}$/i.test(tool))
      return "Invalid tool identifier.";
    if (body.label && !toolTitles.has(body.label))
      return "Unsupported tool label.";
  } else if (
    !fixed.has(tool) &&
    !toolTitles.has(tool) &&
    !sources.has(tool) &&
    !["global|", "home|"].some(
      (p) => tool.startsWith(p) && toolTitles.has(tool.slice(p.length)),
    )
  )
    return "Unsupported tool dimension.";
  return null;
}
