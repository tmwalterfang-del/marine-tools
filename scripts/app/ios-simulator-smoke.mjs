import fs from 'node:fs';
import {execFileSync,spawn} from 'node:child_process';
const run=(args,timeout=60000)=>{console.log('xcrun '+args.join(' '));return execFileSync('xcrun',args,{encoding:'utf8',timeout})};
const bootReady=udid=>new Promise((resolve,reject)=>{
 const child=spawn('xcrun',['simctl','bootstatus',udid,'-b']);
 child.stdout.on('data',x=>process.stdout.write(x));child.stderr.on('data',x=>process.stderr.write(x));
 const timer=setTimeout(()=>{child.kill();reject(Error('Simulator first boot exceeded ten minutes'))},600000);
 child.on('error',e=>{clearTimeout(timer);reject(e)});child.on('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('Simulator boot failed: '+code))});
});
const devices=JSON.parse(run(['simctl','list','devices','available','--json'])).devices;
const available=Object.entries(devices).filter(([runtime])=>runtime.includes('iOS')).flatMap(([,list])=>list).filter(d=>d.isAvailable);
const output='app-artifacts/ios';fs.mkdirSync(output,{recursive:true});const tests=[];
for(const [kind,pattern]of [['iphone',/^iPhone/],['ipad',/^iPad/]]){
 const d=available.find(d=>pattern.test(d.name)&&(kind==='iphone'?d.name.includes('Pro Max'):d.name.includes('13-inch')))||available.find(d=>pattern.test(d.name));
 if(!d){tests.push({kind,status:'UNVERIFIED',reason:'No available simulator'});continue}
 try{
 if(d.state!=='Booted')run(['simctl','boot',d.udid]);await bootReady(d.udid);
 run(['simctl','install',d.udid,'ios-build/Build/Products/Debug-iphonesimulator/App.app']);
 let logs='';
 const child=spawn('xcrun',['simctl','launch','--console-pty',d.udid,'app.marinetools.preview'],{env:{...process.env,SIMCTL_CHILD_MT_CI_SMOKE:'1'}});
 child.stdout.on('data',x=>{logs+=x;process.stdout.write(x)});child.stderr.on('data',x=>{logs+=x;process.stderr.write(x)});
 console.log('Waiting up to four minutes for native UI on '+d.name);
 const deadline=Date.now()+240000;
 while(Date.now()<deadline&&!logs.includes('MT_CI_SMOKE_FINISHED')&&!logs.includes('MT_CI_READY_TIMEOUT'))await new Promise(r=>setTimeout(r,1000));
 fs.writeFileSync(output+'/'+kind+'-native-console.log',logs);
 // Image export is a separate diagnostic, never proof of native behavior.
 // Simulator image encoding can exceed a minute on a cold shared runner.
 let captureStatus='PASS',captureError=null;
 try{
  run(['simctl','io',d.udid,'screenshot',output+'/'+kind+'-simulator.png'],180000);
  execFileSync('sips',['-s','format','jpeg',output+'/'+kind+'-simulator.png','--out',output+'/'+kind+'-simulator.jpg'],{stdio:'ignore',timeout:60000});
 }catch(e){captureStatus='FAIL';captureError=e.message;console.error('Native screenshot unavailable for '+kind+': '+e.message);fs.rmSync(output+'/'+kind+'-simulator.png',{force:true});fs.rmSync(output+'/'+kind+'-simulator.jpg',{force:true});}
 const required=['MT_CI_APP_READY','MT_CI_CALC_OK','MT_CI_CLIPBOARD_OK','MT_CI_SHARE_PRESENTED','MT_CI_EXPORT_CACHE_OK','MT_CI_SMOKE_FINISHED'],missing=required.filter(marker=>!logs.includes(marker));
 tests.push({kind,device:d.name,status:missing.length?'FAIL':'PASS',captureStatus,captureError,missing,physicalDevice:false,scope:'Actual WKWebView calculation, system clipboard write/read, share sheet presentation, private export contents; recipient delivery not tested'});
 child.kill();
 }catch(e){tests.push({kind,device:d.name,status:'FAIL',physicalDevice:false,error:e.message});fs.writeFileSync(output+'/'+kind+'-runner-failure.txt',String(e.stack||e));
 }finally{
 try{run(['simctl','terminate',d.udid,'app.marinetools.preview'],15000)}catch{}
 try{run(['simctl','shutdown',d.udid],30000)}catch{}
 fs.writeFileSync(output+'/simulator-results.json',JSON.stringify(tests,null,2));
 }
}
fs.writeFileSync(output+'/simulator-results.json',JSON.stringify(tests,null,2));console.log(JSON.stringify(tests));
if(!tests.length||tests.some(t=>t.status!=='PASS'))throw Error('Native simulator acceptance failed; inspect console and screenshots');
