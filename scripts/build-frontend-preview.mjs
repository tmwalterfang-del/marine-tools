// Dedicated Pages preview build. Never use for the production Pages project.
import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'.preview-dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
// Only public frontend files; never ship Worker configs, docs, tests or .git.
for(const item of await readdir(root,{withFileTypes:true})){
  if(item.isFile()&&/\.(?:html|css|js|webmanifest)$/.test(item.name))await cp(path.join(root,item.name),path.join(out,item.name));
}
for(const dir of ['assets','education','professionals'])await cp(path.join(root,dir),path.join(out,dir),{recursive:true});
for(const name of ['environment.js','environment.css'])await cp(path.join(root,'preview',name),path.join(out,'preview-'+name));
async function replaceOnce(file,from,to){
  const target=path.join(out,file),text=await readFile(target,'utf8');
  if(text.split(from).length!==2)throw new Error(`Preview build: expected exactly one ${from} in ${file}`);
  await writeFile(target,text.replace(from,to));
}
// Disable both telemetry implementations, both SW registration paths, and the
// two automatic third-party donation widgets. Source files stay untouched.
await replaceOnce('app.js','function analyticsEnabled(){','function analyticsEnabled(){return false;');
await replaceOnce('analytics-v856.js',"'use strict';","'use strict';\nwindow.__marineToolsAnalyticsV2={enabled:false,send(){}};return;");
await replaceOnce('app.js',"if('serviceWorker' in navigator)","if(false)");
await replaceOnce('release-v860.js','async function initSW(){','async function initSW(){return;');
await replaceOnce('app.js','function loadSupportWidget(){','function loadSupportWidget(){return;');
await replaceOnce('support-widget-v857.js',"'use strict';","'use strict';return;");
async function htmlFiles(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())await htmlFiles(file);
    else if(entry.name.endsWith('.html')){
      let text=await readFile(file,'utf8');
      text=text.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi,'')
        .replace(/<link\b[^>]*rel=["'](?:manifest|canonical)["'][^>]*>/gi,'')
        .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
      text=text.replace(/<head>/i,'<head>\n<meta name="robots" content="noindex,nofollow,noarchive">\n<link rel="stylesheet" href="/preview-environment.css">\n<script src="/preview-environment.js"></script>');
      text=text.replace(/<body([^>]*)>/i,'<body$1><aside id="mtPreviewBanner" aria-label="Preview environment"><strong>MARINE TOOLS · PREVIEW</strong><span>Test data only · Analytics and PWA disabled · Live services may be restricted</span></aside>');
      await writeFile(file,text);
    }
  }
}
await htmlFiles(out);
// Also replace any previously installed preview SW, without installing a cache.
await writeFile(path.join(out,'sw.js'),`self.addEventListener('install',()=>self.skipWaiting());\nself.addEventListener('activate',e=>e.waitUntil(self.registration.unregister().then(()=>self.clients.claim())));\n`);
await writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
await writeFile(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-store\n  X-Marine-Tools-Environment: preview\n');
console.log('Frontend preview built in .preview-dist (no deployment performed).');
