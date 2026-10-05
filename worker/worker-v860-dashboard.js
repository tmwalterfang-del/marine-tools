import previousWorker from "./worker-v860-product.js";
const VERSION="8.6.0";
const WORKER="worker-v860-dashboard";

function enhance(html){
  html=html.replace(/Analytics Dashboard v2/g,"Analytics Dashboard v3").replace("Marine Tools v8.5.6 analytics","Marine Tools v8.6.0 analytics");
  const hasPanel=html.includes('id="mtV860Product"');
  const panel=`<div class="section-title">Workflow adoption</div><div class="panel" id="mtV860Product"><div class="panel-head"><h2>Product actions</h2><span class="pill mono">Analytics v3</span></div><div class="cards"><div class="card"><small>Calculations</small><strong id="v860Calc">—</strong></div><div class="card"><small>Saves</small><strong id="v860Save">—</strong></div><div class="card"><small>Exports</small><strong id="v860Export">—</strong></div><div class="card"><small>Profile reuse</small><strong id="v860Reuse">—</strong></div><div class="card"><small>Offline uses</small><strong id="v860Offline">—</strong></div><div class="card"><small>Returning browsers</small><strong id="v860Returning">—</strong></div></div><div id="v860Tools" class="status">Loading…</div></div>`;
  const script=`<script id="mtV860AnalyticsScript">(function(){function n(v){return Number(v)||0}function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}async function load(){var active=document.querySelector('.range button.active'),range=active&&active.dataset.range||'24h';try{var r=await fetch('/admin/api/analytics?range='+encodeURIComponent(range),{cache:'no-store',credentials:'same-origin'}),d=await r.json(),p=d.productActions||{},t=p.totals||{},v=p.visitorType||{};document.getElementById('v860Calc').textContent=n(t.calculation_completed);document.getElementById('v860Save').textContent=n(t.result_saved);document.getElementById('v860Export').textContent=n(t.result_exported);document.getElementById('v860Reuse').textContent=n(t.profile_value_used);document.getElementById('v860Offline').textContent=n(t.offline_tool_used);document.getElementById('v860Returning').textContent=n(v.returningShare).toFixed(0)+'%';var rows=p.tools||[],h=document.getElementById('v860Tools');h.innerHTML=rows.length?'<table><thead><tr><th>Tool</th><th>Calculations</th><th>Saves</th><th>Exports</th><th>Profile reuse</th><th>Offline</th></tr></thead><tbody>'+rows.slice(0,18).map(function(x){return'<tr><td>'+esc(x.tool)+'</td><td>'+n(x.calculations)+'</td><td>'+n(x.saves)+'</td><td>'+n(x.exports)+'</td><td>'+n(x.profileReuse)+'</td><td>'+n(x.offlineUses)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="empty">No Analytics v3 actions observed yet.</div>'}catch(e){var h=document.getElementById('v860Tools');if(h)h.innerHTML='<div class="error">Analytics v3 data unavailable.</div>'}}setTimeout(load,0);document.querySelectorAll('.range button').forEach(function(b){b.addEventListener('click',function(){setTimeout(load,100)})});document.getElementById('refresh')&&document.getElementById('refresh').addEventListener('click',function(){setTimeout(load,100)})})();</script>`;
  if(!hasPanel){const anchor='<div class="section-title">Product usage</div>';html=html.includes(anchor)?html.replace(anchor,panel+anchor):html.includes('<div class="footer">')?html.replace('<div class="footer">',panel+'<div class="footer">'):html.replace('</body>',panel+'</body>')}
  if(!html.includes('id="mtV860AnalyticsScript"'))html=html.replace('</body>',script+'</body>');
  return html;
}

async function identify(response,path){
  if(!response.ok)return response;
  let body;try{body=await response.clone().json()}catch{return response}
  if(path==="/api/release")body.worker=WORKER;
  else if(path==="/api/health")body.release={...(body.release||{}),worker:WORKER};
  else if(path==="/admin/api/analytics")body.release={...(body.release||{}),worker:WORKER};
  else return response;
  const headers=new Headers(response.headers);headers.set("content-type","application/json;charset=utf-8");headers.set("cache-control","no-store");headers.set("x-marine-tools-worker",WORKER);
  return new Response(JSON.stringify(body),{status:response.status,headers});
}

export default{async fetch(request,env,ctx){const path=new URL(request.url).pathname;const response=await previousWorker.fetch(request,env,ctx);if(path==="/api/release"||path==="/api/health"||path==="/admin/api/analytics")return identify(response,path);if(path!=="/admin/analytics"||!response.ok)return response;const headers=new Headers(response.headers);headers.set("content-type","text/html;charset=utf-8");headers.set("cache-control","no-store");headers.set("x-frame-options","DENY");headers.set("x-marine-tools-dashboard",VERSION);headers.set("x-marine-tools-worker",WORKER);return new Response(enhance(await response.text()),{status:response.status,headers})},async scheduled(controller,env,ctx){if(previousWorker.scheduled)return previousWorker.scheduled(controller,env,ctx)}};
