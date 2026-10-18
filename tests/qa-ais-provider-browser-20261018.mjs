import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
import worker from '../worker/worker-v860-dashboard.js';
const root=fileURLToPath(new URL('../',import.meta.url)), out=path.resolve(process.env.QA_OUTPUT||'qa-artifacts/ais-provider-browser');
const leaflet=process.env.QA_LEAFLET_DIR||path.join(root,'node_modules/leaflet/dist');await fs.mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(path.relative(root,f).startsWith('..')||path.isAbsolute(path.relative(root,f)))throw Error();if((await fs.stat(f)).isDirectory())f=path.join(f,'index.html');res.setHeader('content-type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream');res.end(await fs.readFile(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(8789,'127.0.0.1',r));
let phase='missing';const providerCalls=[];
globalThis.fetch=async input=>{const url=String(input?.url??input);providerCalls.push(new URL(url).origin+new URL(url).pathname);if(url.includes('connect/token'))return Response.json({access_token:'synthetic-fixture-only',expires_in:3600});if(url.includes('live.ais.barentswatch.no'))return ['outage','initialOutage'].includes(phase)?new Response('Synthetic outage',{status:503}):Response.json(phase==='empty'?[]:[{mmsi:123456789,name:'SYNTHETIC head-on',latitude:.1,longitude:0,speedOverGround:10,courseOverGround:180,timestamp:new Date().toISOString()}]);throw Error('Unexpected network blocked');};
const b=await chromium.launch({executablePath:process.env.QA_CHROMIUM||chromium.executablePath(),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--disable-dev-shm-usage']});const records=[];
try{for(const [width,height]of [[1920,1080],[1366,768],[1024,768],[768,1024],[390,844],[360,640]])for(const theme of ['dark','bridge']){
 phase='missing';const record={width,height,theme,checks:[],errors:[],api:[]};const c=await b.newContext({viewport:{width,height},serviceWorkers:'block'});
 await c.addInitScript(t=>{localStorage.setItem('mt.theme',JSON.stringify(t));localStorage.setItem('mt.settings',JSON.stringify({usageAnalytics:false}));localStorage.setItem('mt.route',JSON.stringify([{lat:0,lon:0},{lat:.2,lon:0}]));localStorage.setItem('mt.profile',JSON.stringify({name:'Synthetic QA vessel',serviceSpeed:10,fuelDay:4,cpaAlert:1,corridor:5,maxHs:3,maxWind:30}));},theme);
 await c.route('**/*',async r=>{const url=r.request().url();if(url.startsWith('http://127.0.0.1:'))return r.continue();if(url.includes('/api/ais/latest')){
 const u=new URL(url);u.hostname='feature-qa-integrated-preview-20261015.api.marinetools.app';
 const env=phase==='missing'?{}:{BW_AIS_CLIENT_ID:'synthetic-fixture-only',BW_AIS_CLIENT_SECRET:'synthetic-fixture-only'};
 const response=await worker.fetch(new Request(u,{headers:{origin:'https://qa-emulation.marine-tools-frontend-preview.pages.dev'}}),env,{});const body=await response.text();record.api.push({phase,status:response.status,body:JSON.parse(body)});
 return r.fulfill({status:response.status,headers:{'access-control-allow-origin':'*','content-type':'application/json'},body});}
 if(url.includes('/api/forecast'))return r.fulfill({json:[],headers:{'access-control-allow-origin':'*'}});return r.abort();});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>record.errors.push(e.message));
 try{await p.goto('http://127.0.0.1:8789/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1000);const got=p.getByRole('button',{name:'Got it',exact:true});if(await got.isVisible())await got.click();await p.addScriptTag({path:path.join(leaflet,'leaflet.js')});await p.addStyleTag({path:path.join(leaflet,'leaflet.css')});if(await p.locator('#mobileMenu').isVisible())await p.locator('#mobileMenu').click();await p.locator('#sidebar button[data-page="live-experimental"]').click();await p.getByRole('button',{name:'Open Route Intelligence',exact:true}).click();
 // Credentials are constant within a real Worker isolate. After the first
 // missing-secret case, use provider outage instead of mutating secrets under a cached token.
 for(const mode of [records.length===0?'missing':'initialOutage','populated','outage','empty','recovered']){phase=mode;await p.locator('#runAnalysis').click();await p.waitForFunction(()=>!document.querySelector('#riDataAge').textContent.includes('LOADING'));
 const actual=await p.evaluate(()=>({ais:document.querySelector('#riAis').innerText,cpa:document.querySelector('#riCpa').innerText,status:document.querySelector('#riDataAge').innerText,table:document.querySelector('#aisTable').innerText,changes:document.querySelector('#changeBox').innerText,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2}));
 const unavailable=['missing','outage','initialOutage'].includes(mode),empty=mode==='empty';
 const pass=(!unavailable||!/AIS targets\s*\d+ → \d+|CPA alerts\s*\d+ → \d+/.test(actual.changes))&&!actual.overflow&&(unavailable?actual.cpa==='—'&&/AIS unavailable/.test(actual.status)&&!/AIS updated/.test(actual.status)&&/previous targets cleared/.test(actual.table)&&!/SYNTHETIC/.test(actual.table):empty?actual.ais==='0'&&actual.cpa==='0'&&/AIS updated/.test(actual.status)&&/No AIS targets/.test(actual.table):actual.ais==='1'&&actual.cpa==='1'&&/0\.00/.test(actual.table)&&/18 min/.test(actual.table));
 record.checks.push({name:mode,status:pass?'PASS':'FAIL',actual});if(!pass)await p.screenshot({path:path.join(out,`FAIL-${width}-${theme}-${mode}.png`),fullPage:true});}
 }catch(e){record.checks.push({name:'continuation',status:'BLOCKED',error:e.message});}finally{records.push(record);await c.close();}
}}finally{await b.close();server.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify({mode:'Real Chromium + actual full corrected Worker module chain; provider HTTP intercepted in Node; local source, not deployed live acceptance',records,providerCalls},null,2));}
const checks=records.flatMap(r=>r.checks);console.log(JSON.stringify({total:checks.length,failed:checks.filter(r=>r.status!=='PASS').length,errors:records.flatMap(r=>r.errors)}));process.exitCode=checks.length!==60||checks.some(r=>r.status!=='PASS')||records.some(r=>r.errors.length)?1:0;
