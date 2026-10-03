(() => {
'use strict';

// Emergency stability hotfix for v8.5.2.
// The first global-data enhancement layer used recursive DOM updates that could
// lock up mobile browsers. Keep the script path valid while disabling that
// enhancement layer. Backend weather/AIS fallbacks remain active in the Worker.
window.__marineToolsGlobalData={
  version:'2026-10-03-v8.5.2-hotfix1',
  disabled:true,
  reason:'mobile-stability-hotfix'
};
})();
