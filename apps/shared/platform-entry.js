import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Clipboard} from '@capacitor/clipboard';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {Browser} from '@capacitor/browser';
import {save} from '@tauri-apps/plugin-dialog';
import {writeTextFile} from '@tauri-apps/plugin-fs';
import {writeText} from '@tauri-apps/plugin-clipboard-manager';
import {openUrl} from '@tauri-apps/plugin-opener';
import {createPlatform,deepLinkPage,validateBackup} from './platform-core.mjs';
window.MT_NATIVE_APP=Capacitor.isNativePlatform()||!!window.__TAURI_INTERNALS__;
if(window.MT_NATIVE_APP&&'serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).catch(()=>{});if('caches'in window)caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marine-tools-app-preview-')).map(k=>caches.delete(k)))).catch(()=>{});}
const report=message=>window.dispatchEvent(new CustomEvent('mt-app-status',{detail:{message}}));
const done=async promise=>{try{const result=await promise;if(result?.message)report(result.message);return result}catch(e){if(e?.name==='AbortError'||/cancel/i.test(e?.message||'')){report('Action cancelled.');return {cancelled:true}}report('Action failed: '+(e.message||'Please try again.'));throw e}};
let adapter;
if(Capacitor.isNativePlatform()){
 const isAndroid=Capacitor.getPlatform()==='android';
 adapter=createPlatform(Capacitor.getPlatform(),{
  copy:text=>Clipboard.write({string:text}),
  share:async(title,text)=>{await Share.share({title,text,dialogTitle:'Share calculation'});return {message:'Share sheet closed.'}},
  save:async(name,text)=>{const path='marine-exports/'+Date.now()+'-'+name;await Filesystem.writeFile({path,data:text,directory:Directory.Cache,encoding:Encoding.UTF8,recursive:true});
   const {uri}=await Filesystem.getUri({path,directory:Directory.Cache});await Share.share({title:name,files:[uri],dialogTitle:'Save or share file'});return {message:'Use the share sheet to save the file. Temporary app copies may be cleared.'}},
  open:async url=>{if(url.startsWith('mailto:')){location.href=url;return}await Browser.open({url})},
  exit:isAndroid?()=>App.exitApp():undefined
 });
 if(isAndroid)App.addListener('backButton',()=>window.dispatchEvent(new Event('mt-native-back')));
 App.addListener('appUrlOpen',event=>{const id=deepLinkPage(event.url);if(id)window.dispatchEvent(new CustomEvent('mt-app-deep-link',{detail:{page:id}}))});
 App.getLaunchUrl().then(event=>{const id=deepLinkPage(event?.url);if(id){window.__MT_INITIAL_PAGE=id;window.MT_APP_NAV?.go(id)}}).catch(()=>{});
 // Cache exports are private and disposable. Keep recent shares readable by
 // receivers, and remove old files on a later app start rather than immediately.
 Filesystem.readdir({path:'marine-exports',directory:Directory.Cache}).then(async r=>{
  for(const f of r.files)if(/^\d+-[\w.-]+$/.test(f.name)&&f.mtime&&Date.now()-f.mtime>86400000)await Filesystem.deleteFile({path:'marine-exports/'+f.name,directory:Directory.Cache});
 }).catch(()=>{});
}else if(window.__TAURI_INTERNALS__){
 adapter=createPlatform('desktop',{
  copy:writeText,
  share:async(title,text)=>{await writeText(text);return {message:'Calculation copied for sharing.'}},
  save:async(name,text)=>{const file=await save({title:'Save Marine Tools export',defaultPath:name,filters:[{name:'Marine Tools export',extensions:[name.split('.').pop()]}]});if(!file)return {cancelled:true,message:'Save cancelled.'};await writeTextFile(file,text);return {message:'File saved.'}},
  open:openUrl
 });
}else{
 adapter=createPlatform('web',{
  copy:text=>navigator.clipboard.writeText(text),
  share:async(title,text)=>{if(navigator.share){await navigator.share({title,text});return {message:'Share sheet closed.'}}await navigator.clipboard.writeText(text);return {message:'Calculation copied for sharing.'}},
  save:async(name,text,mime)=>{const url=URL.createObjectURL(new Blob([text],{type:mime||'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return {message:'Download prepared.'}},
  open:async url=>{window.open(url,'_blank','noopener,noreferrer')}
 });
}
window.MT_PLATFORM={...adapter,validateBackup,copyText:text=>done(adapter.copyText(text)),shareText:(title,text)=>done(adapter.shareText(title,text)),saveText:(name,text,mime)=>done(adapter.saveText(name,text,mime))};
