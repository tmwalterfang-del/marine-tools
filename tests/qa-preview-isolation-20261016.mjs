// QA preview isolation guards, independent of Cloudflare account credentials.
// Run: node tests/qa-preview-isolation-20261016.mjs
// Test real Cloudflare Access/browser/provider integration separately.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const analytics=fs.readFileSync(new URL('../analytics-v856.js',import.meta.url),'utf8');
const release=fs.readFileSync(new URL('../release-v860.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const wr=fs.readFileSync(new URL('../worker/worker-v860-dashboard.js',import.meta.url),'utf8');
const ais=fs.readFileSync(new URL('../worker/worker-v855.js',import.meta.url),'utf8');

const qaWorker='https://feature-qa-integrated-preview-20261015.api.marinetools.app';
const production='https://api.marinetools.app';
const qaPage='https://qa-test.marine-tools-frontend-preview.pages.dev';
let pass=0;
function check(label,condition){assert.ok(condition,label);pass++;console.log('PASS',label)}

const wrapper=new Function('previousWorker','URL','Response','Headers',
 wr.replace(/^import[^\n]+\n/,'').replace(/^export default/m,'return'));
const seen=[];
const original={fetch:async(request,env)=>{
 seen.push({request,env});
 return new Response(JSON.stringify({ok:true}),{headers:{'access-control-allow-origin':'*'}});
}};
const worker=wrapper(original,URL,Response,Headers);
const env={ANALYTICS:{writeDataPoint(){throw new Error('production analytics must not be called')}},
 ANALYTICS_SQL:{query(){throw new Error('production analytics query must not be called')}},
 PELYR_API_KEY:'test-provider-binding'};
const req=(url,method='GET',origin)=>new Request(url,{method,headers:origin?{Origin:origin}:{}});

const health=await worker.fetch(req(qaWorker+'/api/health','GET',qaPage),env,{});
check('QA health remains readable',health.status===200);
check('QA environment header',health.headers.get('x-marine-tools-environment')==='preview');
check('No inherited production analytics bindings',seen.at(-1).env.ANALYTICS===undefined&&seen.at(-1).env.ANALYTICS_SQL===undefined);
check('Other provider binding preserved',seen.at(-1).env.PELYR_API_KEY==='test-provider-binding');
check('Only approved origin echoed',health.headers.get('access-control-allow-origin')===qaPage);
check('Credentialed QA CORS',health.headers.get('access-control-allow-credentials')==='true');
check('Vary Origin used',health.headers.get('vary')==='Origin');
check('QA analytics event blocked',(await worker.fetch(req(qaWorker+'/api/analytics/event','POST',qaPage),env,{})).status===403);
check('QA private analytics blocked',(await worker.fetch(req(qaWorker+'/admin/api/analytics','GET',qaPage),env,{})).status===403);
check('QA method writes blocked',(await worker.fetch(req(qaWorker+'/api/health','POST',qaPage),env,{})).status===405);
check('Unlisted QA endpoint blocked',(await worker.fetch(req(qaWorker+'/api/probe','GET',qaPage),env,{})).status===404);
check('Unknown preview caller denied',(await worker.fetch(req(qaWorker+'/api/health','GET','https://attacker.invalid'),env,{})).status===403);
const options=await worker.fetch(req(qaWorker+'/api/ais/latest','OPTIONS',qaPage),env,{});
check('Approved OPTIONS preflight works',options.status===204&&options.headers.get('access-control-allow-origin')===qaPage);
check('Unapproved OPTIONS preflight denied',(await worker.fetch(req(qaWorker+'/api/ais/latest','OPTIONS','https://attacker.invalid'),env,{})).status===403);
const probe=await worker.fetch(req(qaWorker+'/api/preview-isolation','GET',qaPage),env,{});
check('Preview isolation marker',probe.status===200&&(await probe.json()).analyticsWrites===false);
await worker.fetch(req(production+'/api/health','GET','https://marinetools.app'),env,{});
check('Production still sees original bindings',seen.at(-1).env.ANALYTICS===env.ANALYTICS&&seen.at(-1).env.ANALYTICS_SQL===env.ANALYTICS_SQL);

const aStart=ais.indexOf('function productOriginAllowed(');
const aEnd=ais.indexOf('async function pelyrSources(',aStart);
check('Worker origin policy source found',aStart>0&&aEnd>aStart);
const allow=new Function('PRODUCT_ORIGINS','URL',ais.slice(aStart,aEnd)+';return productOriginAllowed')(
 new Set(['https://marinetools.app','https://www.marinetools.app']),URL);
check('QA AIS origin allowed only on QA Worker',allow(req(qaWorker+'/api/ais/latest','GET',qaPage)));
check('QA AIS origin forbidden on production Worker',!allow(req(production+'/api/ais/latest','GET',qaPage)));
check('Production AIS allowed on production Worker',allow(req(production+'/api/ais/latest','GET','https://marinetools.app')));

const script=html.match(/<script id="mt-preview-api-isolation">([\s\S]*?)<\/script>/)?.[1];
check('Early preview browser guard installed',!!script);
const calls=[];
const browser={fetch:async (...args)=>{calls.push(args);return {ok:true}}};
new Function('window','location','URL',script)(browser,
 {hostname:'qa-test.marine-tools-frontend-preview.pages.dev',href:qaPage+'/'},URL);
let prodBlocked=false;
try{await browser.fetch(production+'/api/health')}catch{prodBlocked=true}
check('Preview runtime blocks production API',prodBlocked);
await browser.fetch(qaWorker+'/api/health');
check('Only QA Worker receives Access credentials',calls.at(-1)[1].credentials==='include');
await browser.fetch('https://example.invalid/some-resource');
check('No credentials inserted for third-party URL',calls.at(-1)[1]===undefined);
const prodBrowser={fetch:async x=>x};
new Function('window','location','URL',script)(prodBrowser,
 {hostname:'marinetools.app',href:'https://marinetools.app/'},URL);
check('Production site does not activate preview guard',prodBrowser.__MARINE_TOOLS_PREVIEW_ISOLATED!==true);
check('Production preconnect removed from preview artifact',!html.includes('<link rel="preconnect" href="'+production+'"'));
for(const [name,source] of [['app.js',app],['analytics-v856.js',analytics],['release-v860.js',release]]){
 check(name+' selects dedicated preview Worker',source.includes(qaWorker)&&source.includes(production)&&source.includes('pages'));
}
check('PWA cache rotated for isolated QA build',sw.includes('marine-tools-fullscale-20261018-qa-preview-isolation-rc1'));
console.log(JSON.stringify({result:'PASS',assertions:pass,scope:'source/worker/browser-mock; authenticated Cloudflare Access and live providers NOT tested'}));
