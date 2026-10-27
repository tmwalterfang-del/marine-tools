import assert from 'node:assert/strict';
import {safeFilename,validateExport,permittedUrl,deepLinkPage,createPlatform} from '../apps/shared/platform-core.mjs';
let checks=0;const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++};
check(safeFilename('../../calculation.json'),'calculation.json');
for(const name of ['','..','file.exe','report.json.exe']){assert.throws(()=>safeFilename(name));checks++}
check(validateExport('measurements.csv','x,y').text,'x,y');
assert.throws(()=>validateExport('big.json','x'.repeat(8*1024*1024+1)));checks++;
for(const url of ['javascript:alert(1)','file:///etc/passwd','http://example.com','https://user:pw@example.com','mailto:other@example.com']){assert.throws(()=>permittedUrl(url));checks++}
check(permittedUrl('https://marinetools.app/?page=privacy'),'https://marinetools.app/?page=privacy');
check(deepLinkPage('marinetools-preview://tool/electrical'),'electrical');
for(const u of ['https://example.com/tool/electrical','marinetools-preview://evil/electrical','marinetools-preview://tool/admin','file:///tool/fuel'])check(deepLinkPage(u),null);
const calls=[],p=createPlatform('test',{copy:async t=>calls.push(['copy',t]),share:async(t,b)=>{calls.push(['share',t,b]);return {message:'shared'}},save:async(n,t)=>{calls.push(['save',n,t]);return {cancelled:true}},open:async u=>calls.push(['open',u])});
await p.copyText('2.3 m');await p.shareText('Result','2.3 m');check((await p.saveText('draft.json','{}')).cancelled,true);await p.openUrl('https://marinetools.app');
check(calls.map(x=>x[0]),['copy','share','save','open']);
await assert.rejects(()=>p.openUrl('file:///secret'));checks++;
await assert.rejects(()=>p.copyText({password:'no'}));checks++;
console.log(JSON.stringify({status:'PASS',checks,scope:'Adapter contracts, cancellation, path/size guards and deep-link allowlist; native OS dialogs require device testing.'}));
