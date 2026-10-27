/* Isolated public calculator package; protected Education/backend never bundled. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {build} from 'esbuild';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'app-dist');
const config=JSON.parse(fs.readFileSync(path.join(root,'apps/app-config.json')));
if(config.productionApiEnabled||config.analyticsEnabled||config.channel!=='preview')throw Error('Only isolated preview packaging is enabled.');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ipc: http://ipc.localhost; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'";
const excluded=new Set(['sw.js','analytics-v856.js','usage-analytics.js','support-widget-v857.js']);
for(const name of fs.readdirSync(root).filter(n=>/\.(?:html|js|css)$/.test(n)&&!excluded.has(n))){
 let text=fs.readFileSync(path.join(root,name),'utf8');
 if(name==='index.html'){
  text=text.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover');
  text=text.replace(/<script[^>]*\bsrc=["'](?:usage-analytics|analytics-v856|support-widget-v857)\.js[^"']*["'][^>]*><\/script>/g,'');
  text=text.replace(/<meta name="robots"[^>]*>/,'<meta name="robots" content="noindex,nofollow">');
  text=text.replace('</head>','<meta http-equiv="Content-Security-Policy" content="'+csp+'"><link rel="stylesheet" href="app-shell.css"><script src="app-preview.js"></script><script defer src="native-platform.js"></script><script defer src="app-shell.js"></script><script defer src="app-drafts.js"></script></head>');
  let inline=0;
  text=text.replace(/<script([^>]*?)>([\s\S]*?)<\/script>/g,(all,attrs,body)=>{
   if(/\bsrc=/.test(attrs))return all;
   const file='app-inline-'+(++inline)+'.js';fs.writeFileSync(path.join(out,file),body);return '<script'+attrs+' src="'+file+'"></script>';
  });
 }
 if(name==='app.js'){
  text=text.replace(/const API=.*?;/,"const API='https://offline-app.invalid';");
  text=text.replace(/function analyticsEnabled\(\)\{[^}]*\}/,'function analyticsEnabled(){return false}');
  text=text.replace('function loadSupportWidget(){','function loadSupportWidget(){return;');
 }
 if(name==='release-v860.js')text=text.replace('async function initSW(){','async function initSW(){if(window.MT_APP_PREVIEW)return;').replace('async function check(){','async function check(){if(window.MT_APP_PREVIEW)return;');
 text=text.replace(/(["'])\/?students\/(?:[^"']*)\1/g,(all,q)=>q+'education.html'+q);
 fs.writeFileSync(path.join(out,name),text);
}
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));
fs.writeFileSync(path.join(out,'education.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Education access · Marine Tools</title><link rel="stylesheet" href="styles.css"><body style="padding:24px"><h1>Education</h1><p>Education is a protected Draft preview and is not included in this offline package.</p><p><a href="'+config.educationUrl+'" target="_blank" rel="noopener noreferrer">Open protected Education online</a></p><p><a href="index.html">Back to local tools</a></p></body></html>');
fs.writeFileSync(path.join(out,'app-preview.js'),"window.MT_APP_PREVIEW=true;\nwindow.MT_APP_CONFIG="+JSON.stringify(config)+";\ntry{localStorage.setItem('mt.analytics.exclude','1');const s=JSON.parse(localStorage.getItem('mt.settings')||'{}');s.usageAnalytics=false;localStorage.setItem('mt.settings',JSON.stringify(s))}catch{}\n");
await build({entryPoints:[path.join(root,'apps/shared/platform-entry.js')],outfile:path.join(out,'native-platform.js'),bundle:true,format:'iife',platform:'browser',target:['chrome110','safari15'],minify:true,legalComments:'eof'});
for(const name of ['app-shell.js','app-shell.css','app-drafts.js'])fs.copyFileSync(path.join(root,'apps/shared',name),path.join(out,name));
if(fs.existsSync(path.join(root,'apps/store/privacy-draft.html')))fs.copyFileSync(path.join(root,'apps/store/privacy-draft.html'),path.join(out,'app-privacy.html'));
const manifest={id:'marine-tools-preview',name:config.name,short_name:'Marine Tools',description:'Local maritime calculator app candidate',start_url:'./index.html',scope:'./',display:'standalone',background_color:'#061c2f',theme_color:'#061c2f',icons:[192,512].map(size=>({src:'assets/icon-'+size+'.png',sizes:size+'x'+size,type:'image/png',purpose:'any maskable'})),shortcuts:[{name:'Vessel calculations',url:'./index.html?page=vessel-calcs'},{name:'Electrical tools',url:'./index.html?page=electrical'}]};
fs.writeFileSync(path.join(out,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({name:config.name,version:config.version,buildNumber:config.buildNumber,channel:config.channel,educationBundled:false,productionApiEnabled:false,analyticsEnabled:false,targets:['android','ios','windows','macos','pwa']},null,2)+'\n');
const assets=fs.readdirSync(out).filter(f=>fs.statSync(path.join(out,f)).isFile()).map(f=>'./'+f).concat(fs.readdirSync(path.join(out,'assets')).map(f=>'./assets/'+f));
const digest=crypto.createHash('sha256');for(const asset of assets)digest.update(asset).update(fs.readFileSync(path.join(out,asset)));
const cache='marine-tools-app-preview-'+config.version+'-'+digest.digest('hex').slice(0,16);
const worker=[
 'const CACHE='+JSON.stringify(cache)+';const ASSETS='+JSON.stringify(assets)+';',
 "if(!/\\.pages\\.dev$/i.test(self.location.hostname)){",
 "self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));",
 "self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});",
 "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-app-preview-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));",
 "self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;",
 "if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));return}",
 "e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));});",
 "}"
].join('\n');
fs.writeFileSync(path.join(out,'sw.js'),worker+'\n');
console.log('Staged isolated Marine Tools '+config.version+' app with native adapters.');
