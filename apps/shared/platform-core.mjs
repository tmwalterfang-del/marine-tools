export const pages=new Set(['home','fuel','energy-log','engineering','electrical','vessel-calcs','quick','profile','settings','privacy','about','contact','support','survey','suggestions','navigation','voyage-planning-lab']);
export function safeFilename(value){
 const name=String(value).split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,100);
 if(!name||name==='.'||name==='..'||!/^[\w.-]+\.(json|csv|txt|html|svg|pdf)$/i.test(name))throw Error('Unsupported export filename.');
 return name;
}
export function validateExport(name,text){
 const filename=safeFilename(name);
 if(typeof text!=='string'||new TextEncoder().encode(text).length>8*1024*1024)throw Error('Export is larger than the 8 MB app limit.');
 return {filename,text};
}
export function permittedUrl(raw){
 const url=new URL(raw);
 if(url.protocol==='https:'&&!url.username&&!url.password)return url.href;
 if(url.protocol==='mailto:'&&url.pathname.toLowerCase()==='contact@marinetools.app')return url.href;
 throw Error('This link type is not supported by the app.');
}
export function deepLinkPage(raw,scheme='marinetools-preview'){
 try{const u=new URL(raw);if(u.protocol!==scheme+':'||u.hostname!=='tool')return null;
 const id=u.pathname.replace(/^\//,'');return pages.has(id)?id:null;}catch{return null}
}
export function createPlatform(kind,api){
 return {kind,
  copyText:async text=>{if(typeof text!=='string'||text.length>1000000)throw Error('Copy text is too large.');await api.copy(text);return {message:'Copied.'}},
  shareText:async(title,text)=>{if(typeof text!=='string'||text.length>1000000)throw Error('Share text is too large.');return api.share(String(title).slice(0,200),text)},
  saveText:async(name,text,mime)=>{const f=validateExport(name,text);return api.save(f.filename,f.text,mime)},
  openUrl:async url=>api.open(permittedUrl(url)),
  exit:api.exit
 };
}
