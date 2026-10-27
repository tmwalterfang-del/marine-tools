/* Explicit public-only app package. Never copy the repository or private Education. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'app-dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const preview='https://feature-for-students-formula.marine-tools-frontend-preview.pages.dev/students/';
const excluded=new Set(['sw.js','analytics-v856.js','usage-analytics.js']);
const names=fs.readdirSync(root).filter(name=>/\.(?:html|js|css)$/.test(name)&&!excluded.has(name));
for(const name of names){
 let text=fs.readFileSync(path.join(root,name),'utf8');
 if(name==='index.html'){
  text=text.replace(/<script[^>]*\bsrc=["'](?:usage-analytics|analytics-v856)\.js[^"']*["'][^>]*><\/script>/g,'');
  text=text.replace(/<meta name="robots"[^>]*>/,'<meta name="robots" content="noindex,nofollow">');
  text=text.replace('</head>',`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'"><script src="app-preview.js"></script></head>`);
 }
 if(name==='app.js'){
  text=text.replace(/const API=.*?;/,"const API='https://offline-app.invalid';");
  text=text.replace(/function analyticsEnabled\(\)\{[^}]*\}/,'function analyticsEnabled(){return false}');
 }
 text=text.replace(/(["'])\/?students\/(?:[^"']*)\1/g,(all,quote)=>quote+'education.html'+quote);
 fs.writeFileSync(path.join(out,name),text);
}
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));
fs.writeFileSync(path.join(out,'education.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Education access · Marine Tools</title><link rel="stylesheet" href="styles.css"><body style="padding:24px"><h1>Education</h1><p>Education is a protected Draft preview. It is not included in this offline app package.</p><p><a href="${preview}interactive.html" target="_blank" rel="noopener noreferrer">Open the protected Education workspace online</a></p><p><a href="index.html">Back to local tools</a></p></body></html>`);
fs.writeFileSync(path.join(out,'app-preview.js'),`/* Private app prototype: local calculators, no production API or analytics. */
window.MT_APP_PREVIEW=true;
try{localStorage.setItem('mt.analytics.exclude','1');const s=JSON.parse(localStorage.getItem('mt.settings')||'{}');s.usageAnalytics=false;localStorage.setItem('mt.settings',JSON.stringify(s))}catch{}
document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('aside');b.setAttribute('role','status');b.style.cssText='padding:10px 18px;background:#173146;color:#eef5f9;border-bottom:1px solid #29495e;font:13px/1.5 system-ui';b.textContent='Marine Tools Preview · Local calculators available · Live AIS/weather disabled in this test build';document.body.prepend(b)});
`);
const manifest={id:'marine-tools-preview',name:'Marine Tools Preview',short_name:'Marine Tools',description:'Local maritime calculator app prototype',start_url:'./index.html',scope:'./',display:'standalone',background_color:'#061c2f',theme_color:'#061c2f',icons:[192,512].map(size=>({src:`assets/icon-${size}.png`,sizes:`${size}x${size}`,type:'image/png',purpose:'any maskable'}))};
fs.writeFileSync(path.join(out,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
const assets=fs.readdirSync(out).filter(f=>fs.statSync(path.join(out,f)).isFile()&&f!=='sw.js').map(f=>'./'+f).concat(fs.readdirSync(path.join(out,'assets')).map(f=>'./assets/'+f));
const digest=crypto.createHash('sha256');for(const asset of assets)digest.update(asset).update(fs.readFileSync(path.join(out,asset)));
fs.writeFileSync(path.join(out,'sw.js'),`const CACHE='marine-tools-app-preview-0.1.0-${digest.digest('hex').slice(0,16)}';const ASSETS=${JSON.stringify(assets)};
if(!/\\.pages\\.dev$/i.test(self.location.hostname)){self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-app-preview-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='GET'&&u.origin===self.location.origin)e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});}
`);
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({name:'Marine Tools Preview',version:'0.1.0',educationBundled:false,productionApiEnabled:false,analyticsEnabled:false,targets:['android','ios','windows','macos','pwa']},null,2)+'\n');
console.log('Staged public-only Marine Tools app prototype in app-dist.');
