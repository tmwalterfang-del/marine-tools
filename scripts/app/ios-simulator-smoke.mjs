import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const run=args=>execFileSync('xcrun',args,{encoding:'utf8',timeout:240000});
const devices=JSON.parse(run(['simctl','list','devices','available','--json'])).devices;
const available=Object.entries(devices).filter(([runtime])=>runtime.includes('iOS')).flatMap(([,list])=>list).filter(d=>d.isAvailable);
const output='app-artifacts/ios';fs.mkdirSync(output,{recursive:true});const tests=[];
for(const [kind,pattern]of [['iphone',/^iPhone/],['ipad',/^iPad/]]){
 const d=available.find(d=>pattern.test(d.name));if(!d){tests.push({kind,status:'UNVERIFIED',reason:'No available simulator'});continue}
 if(d.state!=='Booted')run(['simctl','boot',d.udid]);run(['simctl','bootstatus',d.udid,'-b']);
 run(['simctl','install',d.udid,'ios-build/Build/Products/Debug-iphonesimulator/App.app']);
 const launch=run(['simctl','launch',d.udid,'app.marinetools.preview']);
 await new Promise(r=>setTimeout(r,4000));
 run(['simctl','io',d.udid,'screenshot',output+'/'+kind+'-simulator.png']);
 tests.push({kind,device:d.name,status:'LAUNCHED',launch:launch.trim(),interaction:'UNVERIFIED',physicalDevice:false});
 run(['simctl','terminate',d.udid,'app.marinetools.preview']);run(['simctl','shutdown',d.udid]);
}
fs.writeFileSync(output+'/simulator-results.json',JSON.stringify(tests,null,2));console.log(JSON.stringify(tests));
if(!tests.some(t=>t.status==='LAUNCHED'))throw Error('No simulator launch verified');
