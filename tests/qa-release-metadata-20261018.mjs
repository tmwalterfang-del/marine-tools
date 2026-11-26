import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/worker-v861-app-analytics.js';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const release=vm.runInNewContext('('+read('release-v860.js').match(/const RELEASE=(\{.*?\});window\.__MARINE_TOOLS_RELEASE/s)[1]+')');
let checks=0;const check=(name,value)=>{assert(value,name);checks++;};
globalThis.fetch=()=>{throw Error('Release metadata must not call upstream services');};
const response=await worker.fetch(new Request('https://feature-qa-integrated-preview-20261015.api.marinetools.app/api/release',{headers:{origin:'https://qa-test.marine-tools-frontend-preview.pages.dev'}}),{},{});
const api=await response.json();
check('Only safe diagnostic headers exposed',response.headers.get('access-control-expose-headers')?.includes('x-marine-tools-environment')&&!/authorization|cookie/i.test(response.headers.get('access-control-expose-headers')));
check('Release readable',response.status===200);
check('Version matches actual Worker chain',release.version===api.version);
check('Build matches actual Worker chain',release.build===api.build);
check('Date matches actual Worker chain',release.released===api.released);
check('Public release version',release.version==='8.11.0');
check('App export version matches',read('app.js').includes("const APP_VERSION='"+release.version+"'"));
check('HTML meta version matches',read('index.html').includes('name="application-version" content="'+release.version+'"'));
check('Dialog fallback matches',read('whats-new-v861.js').includes("version:'"+release.version+"',released:'"+release.released+"',build:'"+release.build+"'"));
check('Latest history is current',release.history[0].version===release.version&&release.history[0].date===release.released);
check('Public release title',release.history[0].title==='Education working, seawater density & smoother loading'&&release.history[1].title==='Calculator quality & Show working');
check('Previous public release retained',release.history[1].version==='8.10.0'&&release.history[2].version==='8.9.0'&&release.history[2].date==='2026-11-17');
check('No full AIS acceptance claimed',!release.history[0].items.some(x=>/fully tested|certified|live CPA verified/i.test(x)));
for(const file of ['release-v860.js','app.js','whats-new-v861.js'])check('Asset rotated '+file,read('index.html').includes(file+'?v='+release.build));
check('Cache rotated',read('sw.js').includes('marine-tools-education-20261117-v8'));
const shell=vm.runInNewContext(read('sw.js')+'\nSHELL',{
 self:{location:{hostname:'marinetools.app'},addEventListener(){}}
});
check('Shared navigation math precached',shell.includes('./navigation-math.js'));
check('Main-page regulatory links precached',shell.includes('./regulatory-links.js'));
check('Regulatory map data excluded from offline shell',!shell.some(entry=>entry.startsWith('./regulatory/')));
for(const entry of shell){
 const file=new URL('../'+entry,import.meta.url);
 check('Offline shell entry exists '+entry,fs.existsSync(file));
 if(fs.statSync(file).isDirectory())check('Offline shell directory has index '+entry,fs.existsSync(new URL('index.html',file)));
}
const prod=await worker.fetch(new Request('https://api.marinetools.app/api/release'),{},{});
check('Production does not expose QA diagnostic headers',!prod.headers.has('access-control-expose-headers')&&!prod.headers.has('x-marine-tools-environment'));
console.log(JSON.stringify({result:'PASS',assertions:checks,version:release.version,build:release.build,offlineShellEntries:shell.length}));
