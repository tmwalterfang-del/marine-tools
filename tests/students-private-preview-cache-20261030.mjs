import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('sw.js','utf8');let checks=0;
for(const hostname of ['feature-education-next.marine-tools-frontend-preview.pages.dev','marine-tools-education-next.fondbook66.chatgpt.site']){
 const handlers={},deleted=[],requests=[];let cacheOpens=0,offline=false;const self={location:{hostname,origin:'https://'+hostname},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(source,{self,location:self.location,URL,Response,caches:{keys:async()=>['marine-tools-old','other-application'],delete:async key=>{deleted.push(key);return true;},open:async()=>{cacheOpens++;throw Error('Private preview must not open a source cache.');}},fetch:async(req,options)=>{requests.push(options);if(offline)throw Error('Offline');return new Response('Network response');}});
 let pending;handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['marine-tools-old']);checks++;
 function get(mode='navigate'){let result;handlers.fetch({request:{method:'GET',url:self.location.origin+'/students/advanced-lab.html',mode},respondWith:p=>result=p});return result;}
 let response=await get();assert.equal(await response.text(),'Network response');assert.equal(requests[0].cache,'no-store');assert.equal(cacheOpens,0);checks+=3;
 offline=true;response=await get();assert.equal(response.status,503);assert.match(await response.text(),/sign in/);assert.equal(cacheOpens,0);checks+=3;response=await get('cors');assert.equal(response.type,'error');checks++;
}
console.log(JSON.stringify({status:'PASS',checks,scope:'Both private preview origin families purge old source caches and use network-only no-store requests; offline navigation fails closed.'}));
