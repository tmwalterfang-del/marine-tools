import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
const get=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const calls=[];
const window={fetch:(...args)=>{calls.push(args);return Promise.resolve({ok:true})}};
vm.runInNewContext(await get('preview/environment.js'),{window,document:{addEventListener(){}},URL,Request,location:{href:'https://test.pages.dev/'}});
const api='https://api.marinetools.app';
for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS'])await assert.rejects(window.fetch(api+'/api/weather',{method}));
await assert.rejects(window.fetch(new URL(api+'/api/analytics/event')));
await assert.rejects(window.fetch(new Request(api+'/api/weather',{method:'POST'})));
await assert.rejects(window.fetch(api+'/admin/api/analytics'));
assert.equal(calls.length,0);
for(const input of [api+'/api/weather?lat=1&lon=2',new URL(api+'/api/health'),new Request(api+'/api/release'),'/assets/icon-192.png'])await window.fetch(input);
assert.equal(calls.length,4);
for(const html of ['index.html','education/index.html','education/one-page.html','professionals/index.html']){
  const text=await get('.preview-dist/'+html);
  assert.match(text,/noindex,nofollow,noarchive/);
  assert.match(text,/<script src="\/preview-environment.js"><\/script>/);
  assert.match(text,/id="mtPreviewBanner"/);
  assert.doesNotMatch(text,/rel="manifest"|rel="canonical"|content="index,follow"/);
}
assert.match(await get('.preview-dist/app.js'),/function analyticsEnabled\(\)\{return false;/);
assert.match(await get('.preview-dist/app.js'),/if\(false\)navigator.serviceWorker.register/);
assert.match(await get('.preview-dist/release-v860.js'),/async function initSW\(\)\{return;/);
assert.match(await get('.preview-dist/analytics-v856.js'),/enabled:false,send\(\)\{\}\};return;/);
assert.match(await get('.preview-dist/sw.js'),/registration.unregister/);
for(const p of ['worker','wrangler.jsonc','.git','docs','sitemap.xml'])await assert.rejects(access(new URL('../.preview-dist/'+p,import.meta.url)));
console.log('Preview guard checks passed: API writes/telemetry blocked, GETs preserved, all HTML protected, both SW paths disabled, output excludes private/config files.');
