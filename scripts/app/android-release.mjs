import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..'),cwd=path.join(root,'apps/mobile/android'),win=process.platform==='win32';
const result=spawnSync(win?'gradlew.bat':'./gradlew',['assembleRelease','bundleRelease'],{cwd,stdio:'inherit',shell:win});
if(result.error)throw result.error;process.exitCode=result.status||0;
