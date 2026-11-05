import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import './stage-app.mjs';
import {configureMobile} from './app/configure-mobile.mjs';
const root=path.resolve(import.meta.dirname,'..'),[platform,command]=process.argv.slice(2);
function cli(pkg,args,cwd=root){const dir=path.join(root,'node_modules',pkg),meta=JSON.parse(fs.readFileSync(path.join(dir,'package.json'))),bin=typeof meta.bin==='string'?meta.bin:Object.values(meta.bin)[0];const r=spawnSync(process.execPath,[path.join(dir,bin),...args],{cwd,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
if(['android','ios'].includes(platform)&&command==='sync'){
 if(!fs.existsSync(path.join(root,'apps/mobile',platform)))cli('@capacitor/cli',['add',platform]);
 cli('@capacitor/cli',['sync',platform]);
 configureMobile(platform);
 const icons=path.join(root,'apps/desktop/src-tauri/icons');
 cli('@tauri-apps/cli',['icon',path.join(root,'assets/icon-512.png'),'--output',icons]);
 if(platform==='android')fs.cpSync(path.join(icons,'android'),path.join(root,'apps/mobile/android/app/src/main/res'),{recursive:true});
 else fs.copyFileSync(path.join(icons,'ios/AppIcon-512@2x.png'),path.join(root,'apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));
}else if(platform==='desktop'&&['build','dev'].includes(command)){
 const cwd=path.join(root,'apps/desktop');
 cli('@tauri-apps/cli',['icon',path.join(root,'assets/icon-512.png'),'--output',path.join(cwd,'src-tauri/icons')]);
 const bundles=process.platform==='win32'?'nsis':process.platform==='darwin'?'dmg':null;
 cli('@tauri-apps/cli',[command,...(command==='build'&&bundles?['--bundles',bundles]:[]),...(command==='build'?['--','--locked']:[])],cwd);
}else throw Error('Use android sync, ios sync, desktop build or desktop dev.');
