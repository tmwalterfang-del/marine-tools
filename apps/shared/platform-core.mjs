export const pages=new Set(['home','fuel','energy-log','engineering','electrical','vessel-calcs','quick','profile','settings','privacy','about','contact','suggestions','navigation','voyage-planning-lab']);
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
 if(url.protocol==='https:'&&!url.username&&!url.password&&!['buymeacoffee.com','www.buymeacoffee.com','tally.so'].includes(url.hostname))return url.href;
 if(url.protocol==='mailto:'&&url.pathname.toLowerCase()==='contact@marinetools.app')return url.href;
 throw Error('This link type is not supported by the app.');
}
export function deepLinkPage(raw,scheme='marinetools-preview'){
 try{const u=new URL(raw);if(u.protocol!==scheme+':'||u.hostname!=='tool')return null;
 const id=u.pathname.replace(/^\//,'');return pages.has(id)?id:null;}catch{return null}
}
export function validateBackup(data){
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(!object(data)||data.format!==undefined&&data.format!=='Marine Tools local backup')throw Error('Unsupported backup format.');
 if(!['profile','consumption','bunkering','settings'].some(k=>data[k]!==undefined))throw Error('No Marine Tools data in backup.');
 let budget=200000;
 function visit(x,depth=0){if(--budget<0||depth>12)throw Error('Backup structure is too large or deep.');
  if(typeof x==='number'&&!Number.isFinite(x)||typeof x==='string'&&x.length>20000)throw Error('Invalid backup value.');
  if(Array.isArray(x)){if(x.length>3000)throw Error('Too many backup rows.');for(const y of x)visit(y,depth+1)}
  else if(object(x)){for(const[k,v]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe backup key.');visit(v,depth+1)}}
 }
 visit(data);
 for(const k of ['profile','settings','lastAnalysis','weatherCache','extraLocal'])if(data[k]!=null&&!object(data[k]))throw Error('Invalid backup object: '+k);
 for(const k of ['route','favorites','recent','history','consumption','bunkering'])if(data[k]!=null&&(!Array.isArray(data[k])||data[k].length>2000||data[k].some(v=>!object(v))))throw Error('Invalid backup rows: '+k);
 if(data.theme!=null&&!['dark','bridge'].includes(data.theme))throw Error('Unknown theme.');
 // Legacy profile values are rendered into numeric input attributes. Shape-only
 // validation is insufficient: imported strings must never become markup there.
 if(data.profile){
  if(data.profile.name!==undefined&&typeof data.profile.name!=='string')throw Error('Invalid vessel name.');
  for(const key of ['loa','draft','serviceSpeed','fuelDay','maxHs','maxWind','maxCurrent','minUKC','cpaAlert','corridor'])
   if(data.profile[key]!==undefined&&(typeof data.profile[key]!=='number'||!Number.isFinite(data.profile[key])))throw Error('Invalid numeric vessel field: '+key);
 }
 if(data.extraLocal){
  const e=data.extraLocal;
  if(e.profileV2!=null){if(!object(e.profileV2))throw Error('Invalid vessel profile.');
   for(const k of ['vessel','operational'])if(e.profileV2[k]!=null&&!object(e.profileV2[k]))throw Error('Invalid profile section.');
   for(const k of ['carriers','machinery','tanks'])if(e.profileV2[k]!=null&&!Array.isArray(e.profileV2[k]))throw Error('Invalid profile rows.');
  }
  if(e.energyLog!=null&&!Array.isArray(e.energyLog))throw Error('Invalid energy log.');
 }
 for(const row of data.history||[]){if(row.result!==undefined&&typeof row.result!=='string'||row.inputs!==undefined&&(!Array.isArray(row.inputs)||row.inputs.some(v=>typeof v!=='string')))throw Error('Invalid calculation history.')}
 for(const key of ['recent','favorites'])for(const row of data[key]||[])for(const field of ['title','page'])if(row[field]!==undefined&&typeof row[field]!=='string')throw Error('Invalid tool reference.');
 for(const row of data.route||[])if(!Number.isFinite(row.lat)||!Number.isFinite(row.lon)||Math.abs(row.lat)>90||Math.abs(row.lon)>180)throw Error('Invalid route coordinate.');
 if(data.extraLocal?.profileV2)for(const k of ['carriers','machinery','tanks'])if(data.extraLocal.profileV2[k]?.some(v=>!object(v)))throw Error('Invalid profile row.');
 if(data.extraLocal?.energyLog?.some(v=>!object(v)))throw Error('Invalid energy log row.');
 return data;
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
