// CI instrumentation only. Shipping installers/MSIX must already exist.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
if(process.platform!=='win32'||process.env.CI!=='true')throw Error('Disposable Windows CI runner required.');
const root=path.resolve(import.meta.dirname,'../..'),desktop=path.join(root,'apps/desktop');
const config=JSON.parse(fs.readFileSync(path.join(desktop,'src-tauri/tauri.conf.json')));
const binary=path.join(desktop,'src-tauri/target/release/marine-tools-preview.exe');
const shippingHash=crypto.createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
const override={app:{windows:config.app.windows.map(w=>({...w,additionalBrowserArgs:'--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --autoplay-policy=no-user-gesture-required --remote-debugging-port=9222'}))}};
const file=path.join(os.tmpdir(),'marine-tools-ci-webview.json');
fs.writeFileSync(file,JSON.stringify(override));
const pkg=path.join(root,'node_modules/@tauri-apps/cli'),meta=JSON.parse(fs.readFileSync(path.join(pkg,'package.json')));
const bin=typeof meta.bin==='string'?meta.bin:Object.values(meta.bin)[0];
try{
 const result=spawnSync(process.execPath,[path.join(pkg,bin),'build','--no-bundle','--config',file,'--','--locked'],{cwd:desktop,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
 const out=path.join(root,'app-artifacts/windows');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'ci-instrumentation.json'),JSON.stringify({shippingExecutableSha256:shippingHash,shippingInstallerModified:false,shippingMsixModified:false,testExecutable:'CI-only additionalBrowserArgs overlay; never bundled or uploaded',shippingRemoteDebugPortConfigured:false,nativeInteractionEvidence:'Instrumented executable, same UI/adapters/plugins; signed target-device acceptance still required'},null,2));
}finally{fs.rmSync(file,{force:true})}
