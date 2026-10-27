/* Syntax validation for the shared app and packaging scripts; no new transpiler. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(fs.readFileSync('apps/app-config.json'));
const json=file=>JSON.parse(fs.readFileSync(file));
assert.match(config.version,/^\d+\.\d+\.\d+$/);assert.ok(Number.isInteger(config.buildNumber)&&config.buildNumber>0);
for(const version of [json('package.json').version,json('package-lock.json').version,json('package-lock.json').packages[''].version,json('apps/desktop/src-tauri/tauri.conf.json').version])assert.equal(version,config.version,'Shared release version must match');
const cargo=fs.readFileSync('apps/desktop/src-tauri/Cargo.toml','utf8').match(/^version = "([^"]+)"/m);assert.equal(cargo?.[1],config.version);
assert.deepEqual(config.distributionTargets,['android','windows','pwa']);
const roots=['apps/shared','scripts/app'];
const files=fs.readdirSync('.').filter(f=>f.endsWith('.js'));
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(?:js|mjs|cjs)$/.test(file))files.push(file)}}
roots.forEach(walk);files.push('scripts/stage-app.mjs','scripts/native-app.mjs');
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)throw Error(file+'\n'+r.stderr)}
console.log(JSON.stringify({status:'PASS',syntaxChecked:files.length,staticTypes:'Not applicable: existing vanilla JavaScript project; no TypeScript sources introduced.'}));
