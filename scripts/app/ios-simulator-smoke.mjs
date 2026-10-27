import fs from 'node:fs';
import {execFileSync,spawn} from 'node:child_process';
const run=args=>execFileSync('xcrun',args,{encoding:'utf8',timeout:240000});
const devices=JSON.parse(run(['simctl','list','devices','available','--json'])).devices;
const available=Object.entries(devices).filter(([runtime])=>runtime.includes('iOS')).flatMap(([,list])=>list).filter(d=>d.isAvailable);
const output='app-artifacts/ios';fs.mkdirSync(output,{recursive:true});const tests=[];
for(const [kind,pattern]of [['iphone',/^iPhone/],['ipad',/^iPad/]]){
 const d=available.find(d=>pattern.test(d.name)&&(kind==='iphone'?d.name.includes('Pro Max'):d.name.includes('13-inch')))||available.find(d=>pattern.test(d.name));
 if(!d){tests.push({kind,status:'UNVERIFIED',reason:'No available simulator'});continue}
 if(d.state!=='Booted')run(['simctl','boot',d.udid]);run(['simctl','bootstatus',d.udid,'-b']);
 run(['simctl','install',d.udid,'ios-build/Build/Products/Debug-iphonesimulator/App.app']);
 let logs='';
 const child=spawn('xcrun',['simctl','launch','--console-pty',d.udid,'app.marinetools.preview'],{env:{...process.env,SIMCTL_CHILD_MT_CI_SMOKE:'1'}});
 child.stdout.on('data',x=>{logs+=x;process.stdout.write(x)});child.stderr.on('data',x=>{logs+=x;process.stderr.write(x)});
 const deadline=Date.now()+100000;
 while(Date.now()<deadline&&!logs.includes('MT_CI_SMOKE_FINISHED')&&!logs.includes('MT_CI_READY_TIMEOUT'))await new Promise(r=>setTimeout(r,1000));
 fs.writeFileSync(output+'/'+kind+'-native-console.log',logs);
 run(['simctl','io',d.udid,'screenshot',output+'/'+kind+'-simulator.png']);
 execFileSync('sips',['-s','format','jpeg',output+'/'+kind+'-simulator.png','--out',output+'/'+kind+'-simulator.jpg'],{stdio:'ignore'});
 const required=['MT_CI_APP_READY','MT_CI_CALC_OK','MT_CI_CLIPBOARD_OK','MT_CI_SHARE_PRESENTED','MT_CI_EXPORT_CACHE_OK','MT_CI_SMOKE_FINISHED'],missing=required.filter(marker=>!logs.includes(marker));
 tests.push({kind,device:d.name,status:missing.length?'FAIL':'PASS',missing,physicalDevice:false,scope:'Actual WKWebView calculation, system clipboard write/read, share sheet presentation, private export contents; recipient delivery not tested'});
 run(['simctl','terminate',d.udid,'app.marinetools.preview']);child.kill();run(['simctl','shutdown',d.udid]);
}
fs.writeFileSync(output+'/simulator-results.json',JSON.stringify(tests,null,2));console.log(JSON.stringify(tests));
if(!tests.length||tests.some(t=>t.status!=='PASS'))throw Error('Native simulator acceptance failed; inspect console and screenshots');
