/* Android back navigation for bundled Education pages. */
(function(){'use strict';
 if(!window.MT_NATIVE_APP)return;
 window.addEventListener('mt-native-back',()=>{
  if(history.length>1)history.back();
  else location.href='../index.html';
 });
})();
