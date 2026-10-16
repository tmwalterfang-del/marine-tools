// QA-only regression checks for the six Oct 2026 findings.
// Run: node tests/qa-six-fixes-20261016.mjs
// No network access or user data. Does not replace Playwright/live provider QA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../worker/worker-v855.js',import.meta.url),'utf8');
const slice=(source,start,end)=>{
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert(a>=0&&b>a,`Missing source anchors: ${start}`);
 return source.slice(a,b);
};
const state={route:[{lat:0,lon:0},{lat:.2,lon:0}],profile:{serviceSpeed:10,corridor:5,cpaAlert:1},ais:[],forecast:[],aisStatus:'never',forecastStatus:'never'};
const geometry=slice(app,'function shortestLonDelta(','function riskFor(');
const ais=slice(app,'const MAX_AIS_AGE_MS=','function drawRiskSegments(');
const core=new Function('state',`
const rad=x=>x*Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),bearing=()=>0;
const $=()=>null,nf=String,esc=String;
${geometry}
${ais}
return {routeBBox,distToRoute,cpaTcpa,aisMotion,aisAgeReason,safeWaveHs,cpaTargets,isCpaAlert};
`)(state);
let passed=0;
const check=(name,actual,expected,tolerance=0)=>{
 if(tolerance)assert(Math.abs(actual-expected)<=tolerance,`${name}: ${actual} != ${expected}`);
 else assert.deepEqual(actual,expected,name);
 passed++;console.log('PASS',name);
};
const own={lat:0,lon:0,sog:10,cog:0};
const golden=[
 ['Head-on',own,{lat:.1,lon:0,sog:10,cog:180},0,18],
 ['Crossing',own,{lat:1/60,lon:1/60,sog:10,cog:270},0,6],
 ['Parallel',own,{lat:0,lon:1/60,sog:10,cog:0},1,0],
 ['Overtaking',{...own,sog:12},{lat:1/60,lon:0,sog:6,cog:0},0,10],
 ['Stationary',own,{lat:2/60,lon:.5/60,sog:0,cog:0},.5,12],
 ['Diverging',{...own,cog:180},{lat:.1,lon:0,sog:10,cog:0},6,0],
 ['Dateline',{lat:0,lon:179.99,sog:10,cog:90},{lat:0,lon:-179.99,sog:10,cog:270},0,3.6]
];
for(const [name,o,t,cpa,tcpa]of golden){
 const result=core.cpaTcpa(o,t);
 check(name+' CPA',result.cpa,cpa,.001);
 check(name+' TCPA',result.tcpa,tcpa,.001);
}
const boxes=core.routeBBox([{lat:0,lon:179.99},{lat:0,lon:-179.99}],8).boxes;
check('Dateline requests split',boxes.length,2);
check('Dateline west boundary',boxes[0].maxLon,180);
check('Dateline east boundary',boxes[1].minLon,-180);
check('Dateline corridor geometry',core.distToRoute({lat:0,lon:-179.99},[{lat:0,lon:179.98},{lat:0,lon:-179.98}])<.001,true);
check('Unknown motion omitted',core.aisMotion({speedOverGround:null,courseOverGround:null}),null);
check('Known zero SOG preserved',core.aisMotion({speedOverGround:0,courseOverGround:null})?.sog,0);
check('AIS sentinel rejected',core.aisMotion({speedOverGround:102.3,courseOverGround:360}),null);
check('24h old target is stale',core.aisAgeReason({timestamp:new Date(Date.now()-86400000).toISOString()}),'Stale AIS position');
check('Missing AIS time is unknown',core.aisAgeReason({}),'AIS time unknown');
check('Recent AIS accepted',core.aisAgeReason({timestamp:new Date().toISOString()}),null);
state.ais=[{latitude:.1,longitude:0,speedOverGround:null,courseOverGround:null,timestamp:new Date().toISOString()}];
check('Unknown CPA is not an alert',core.cpaTargets().filter(core.isCpaAlert).length,0);
state.ais=[{latitude:.1,longitude:0,speedOverGround:10,courseOverGround:180,timestamp:new Date(Date.now()-86400000).toISOString()}];
check('Stale CPA is not an alert',core.cpaTargets().filter(core.isCpaAlert).length,0);
check('Extreme frontend Hs rejected',core.safeWaveHs('999900026055400882176'),null);
check('Normal frontend Hs retained',core.safeWaveHs(3.7),3.7);
const wk=new Function(slice(worker,'function num(v)','function msToKn(')+'return safeHs')();
check('Extreme API Hs rejected',wk('999900026055400882176'),null);
check('Missing API Hs is unknown',wk(null),null);
check('Normal API Hs retained',wk(3.7),3.7);
const fields={'#pName':{value:'QA ship'},'#pCpa':{value:'0.4'}};
const profileState={profile:{name:'Old ship',loa:80,draft:4,serviceSpeed:8,fuelDay:4,maxHs:3,maxWind:30,maxCurrent:2,minUKC:1.25,cpaAlert:1,corridor:5}};
let saved;
new Function('state','$','store','K','toast','renderEnvelope','updateHome',
 slice(app,'function saveProfile(){','function localDataStats(')+'saveProfile()'
)(profileState,id=>fields[id]??null,{set:(key,value)=>{saved=value}},{profile:'test'},()=>{},()=>{},()=>{});
check('Missing #pUkc preserves minimum UKC',saved.minUKC,1.25);
check('CPA threshold still saves',saved.cpaAlert,.4);
const live={...state,ais:[{timestamp:new Date().toISOString()}],forecast:[],route:[{lat:0,lon:0},{lat:.2,lon:0}],profile:{corridor:5},aisStatus:'ok',forecastStatus:'ok'};
let aisCalls=0;
const mockFetch=async url=>url.includes('/api/ais/latest')?
 (++aisCalls===1?{ok:true,json:async()=>[{latitude:.1,longitude:0,speedOverGround:10,courseOverGround:180,timestamp:new Date().toISOString()}]}:{ok:false,status:503})
 :{ok:true,json:async()=>[{hs:2}]};
const analysis=new Function('state','routeBBox','sourceStatus','API','fetch','cleanForecast','nowUTC','drawAis','updateRiSummary','updateLiveAgeIndicators','toast','compareAnalysis',
 slice(app,'async function runAnalysis(showToast=true){','function snapshot(')+'return runAnalysis'
)(live,()=>({boxes:[{minLat:-.2,maxLat:.3,minLon:-.2,maxLon:.2}]}),()=>{},'https://example.invalid',mockFetch,rows=>rows,()=>new Date().toISOString(),()=>{},()=>{},()=>{},()=>{},()=>{});
await analysis(false);
check('AIS loads on successful refresh',live.ais.length,1);
await analysis(false);
check('503 clears prior AIS targets',live.ais.length,0);
check('503 marks AIS unavailable',live.aisStatus,'error');
check('503 leaves forecast independently usable',live.forecastStatus,'ok');
new Function(app); // full JS parse
new Function(worker.replace(/^import[^\n]+\n/,'').replace(/^export default/m,'const exported ='));
console.log(JSON.stringify({result:'PASS',assertions:passed,scope:'isolated source-code execution (not browser / live providers)'}));
