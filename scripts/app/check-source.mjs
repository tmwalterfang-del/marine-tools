/* Syntax validation for the shared app and packaging scripts; no new transpiler. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const roots=['apps/shared','scripts/app'];
const files=fs.readdirSync('.').filter(f=>f.endsWith('.js'));
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(?:js|mjs|cjs)$/.test(file))files.push(file)}}
roots.forEach(walk);files.push('scripts/stage-app.mjs','scripts/native-app.mjs');
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)throw Error(file+'\n'+r.stderr)}
console.log(JSON.stringify({status:'PASS',syntaxChecked:files.length,staticTypes:'Not applicable: existing vanilla JavaScript project; no TypeScript sources introduced.'}));
