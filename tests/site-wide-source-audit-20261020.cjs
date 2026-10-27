/* Repository-wide source/asset audit. No live providers, browser or credentials. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),files=cp.execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n'),issues=[],warnings=[];let pages=0,refs=0,scripts=0;
const exists=p=>fs.existsSync(p)&&fs.statSync(p).isFile();
function target(from,value){const u=new URL(value,'https://site.test/'+from);if(u.origin!=='https://site.test')return null;const p=decodeURIComponent(u.pathname).replace(/^\/+/,'');return path.resolve(root,p)}
for(const file of files.filter(f=>f.endsWith('.html')&&!f.startsWith('tests/'))){
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8')),d=dom.window.document;pages++;
 if(!d.querySelector('title')?.textContent.trim())issues.push(file+': missing title');
 if(!d.documentElement.lang)warnings.push(file+': no document language');
 const ids=new Set();for(const el of d.querySelectorAll('[id]')){if(ids.has(el.id))warnings.push(file+': duplicate id '+el.id);ids.add(el.id)}
 for(const el of d.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src],iframe[src]')){
 const attr=el.tagName==='LINK'?'href':'src',v=el.getAttribute(attr);if(!v||/^(data:|blob:)/.test(v))continue;const p=target(file,v);if(!p)continue;refs++;
 if(!exists(p)&&!exists(path.join(p,'index.html'))&&!exists(p+'.html'))issues.push(file+': missing '+v);
 }
 for(const a of d.querySelectorAll('a[href]')){const v=a.getAttribute('href');if(!v||/^(mailto:|tel:|javascript:|#)/.test(v))continue;let p;try{p=target(file,v)}catch{issues.push(file+': invalid URL '+v);continue}if(p&&!exists(p)&&!exists(path.join(p,'index.html'))&&!exists(p+'.html'))warnings.push(file+': route requires runtime verification '+v)}
 for(const s of d.querySelectorAll('script:not([src])')){if(s.type&&s.type!=='text/javascript'&&s.type!=='application/javascript'&&s.type!=='module')continue;if(!s.textContent.trim())continue;try{if(s.type!=='module')new vm.Script(s.textContent,{filename:file});}catch(e){issues.push(file+': inline script '+e.message)}}
 dom.window.close();
}
for(const file of files.filter(f=>f.endsWith('.js')||f.endsWith('.mjs')||f.endsWith('.cjs'))){scripts++;const r=cp.spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(r.status!==0)issues.push(file+': '+r.stderr.slice(0,500))}
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),m=sw.match(/const SHELL=(\[[\s\S]*?\]);/);assert(m,'Service-worker shell found');const shell=vm.runInNewContext(m[1]);for(const url of shell){let p=target('index.html',url);if(!exists(p)&&!exists(path.join(p,'index.html')))issues.push('Service-worker missing asset '+url)}
const report={scope:'All tracked HTML pages, JS syntax, local assets, service-worker shell; existing root regression suite and student functional tests run separately.',pages,scripts,localAssetReferences:refs,issues,warnings,notTested:['Live authentication and external providers','Visual layout and physical mobile','Installed service worker offline lifecycle','Browser file-download completion and printed PDF layout']};
fs.writeFileSync(path.join(root,'site-wide-source-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.equal(issues.length,0,'Blocking whole-site source issues');
