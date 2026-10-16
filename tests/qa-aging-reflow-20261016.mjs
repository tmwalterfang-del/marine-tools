// Regression guard for the two Work rest findings (2026-10-16).
// Run: node tests/qa-aging-reflow-20261016.mjs
// Isolated logic + stylesheet checks; Work must rerun the real Chromium UI matrix.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../global-polish-v862.css',import.meta.url),'utf8');
function between(source,first,last){
 const a=source.indexOf(first),b=source.indexOf(last,a+first.length);
 assert(a!==-1&&b>a,'Could not locate '+first);
 return source.slice(a,b);
}
const ageSource=between(app,'function updateLiveAgeIndicators(){','async function checkApi()');
const cpaSource=between(app,'const MAX_AIS_AGE_MS=','function drawAis()');
let ms=Date.parse('2026-10-16T10:00:00Z'),mapRedraws=0;
const state={
 route:[{lat:0,lon:0},{lat:.2,lon:0}],forecast:[],
 ais:[{name:'SYNTHETIC approaching',latitude:.1,longitude:0,
  speedOverGround:10,courseOverGround:180,timestamp:new Date(ms).toISOString()}],
 profile:{serviceSpeed:10,corridor:5,cpaAlert:1},
 aisStatus:'ok',forecastStatus:'ok',
 aisFetchedAt:new Date(ms).toISOString(),forecastFetchedAt:new Date(ms).toISOString()
};
const els=Object.fromEntries(['#riDataAge','#riCpa','#riAis','#riDistance','#riHs','#riWind','#aisTable']
 .map(id=>[id,{className:'',textContent:'',innerHTML:''}]));
const source=[
 'const Date=class extends globalThis.Date {static now(){return currentTime()}};',
 'const $=selector=>els[selector]||null;',
 'const rad=deg=>deg*Math.PI/180;',
 'const nf=(n,decimals=1)=>Number(n).toFixed(decimals);',
 'const esc=v=>String(v);',
 'const bearing=()=>0,routeDistance=()=>12,distToRoute=()=>0;',
 'const cpaTcpa=()=>({cpa:0,tcpa:18});',
 'const drawRiskSegments=()=>{},drawAis=()=>onDraw();',
 cpaSource,ageSource,
 'return {tick:updateLiveAgeIndicators};'
].join('\n');
const {tick}=new Function('state','els','currentTime','onDraw',source)(state,els,()=>ms,()=>mapRedraws++);
let pass=0;
function check(label,condition){assert(condition,label);pass++;console.log('PASS',label)}
tick();
check('fresh synthetic AIS creates one CPA alert',els['#riCpa'].textContent===1);
check('fresh synthetic AIS table shows CPA 0.00',els['#aisTable'].innerHTML.includes('0.00'));
check('first tick creates one map redraw',mapRedraws===1);
tick();
check('unchanged validity does not redraw map',mapRedraws===1);
ms+=16*60*1000;
tick();
check('AIS expiry redraws once',mapRedraws===2);
check('expired AIS retracts numeric alert',els['#riCpa'].textContent!=='1'&&els['#riCpa'].textContent!==1);
check('expired AIS removes numeric CPA/TCPA',els['#aisTable'].innerHTML.includes('Stale AIS position')&&!els['#aisTable'].innerHTML.includes('18 min'));
check('expired AIS receives stale status',/stale/i.test(els['#riDataAge'].textContent));
tick();
check('unchanged stale validity causes no extra redraw',mapRedraws===2);
state.ais[0].timestamp=new Date(ms).toISOString();
tick();
check('renewed fresh AIS triggers redraw',mapRedraws===3);
check('renewed AIS restores valid CPA alert',els['#riCpa'].textContent===1);
const cssBlock=css.slice(css.indexOf('/* QA 2026-10-16: Route Intelligence 200%'));
check('dedicated Route Intelligence reflow stylesheet present',cssBlock.startsWith('/* QA'));
check('age chip can wrap arbitrarily long text',/#route-intelligence\s+\.map-toolbar\s+#riDataAge\s*\{[\s\S]*?overflow-wrap:\s*anywhere/.test(cssBlock));
check('age chip is constrained to panel width',/#route-intelligence\s+\.map-toolbar\s+#riDataAge\s*\{[\s\S]*?max-width:\s*100%/.test(cssBlock));
check('Route Intelligence grid children can shrink',/#route-intelligence\s+\.grid-2\s*>\s*\*/.test(cssBlock)&&/min-width:\s*0/.test(cssBlock));
check('Route Intelligence mobile grid uses one shrinkable track',/@media\(max-width:900px\)\s*\{[\s\S]*?#route-intelligence\s+\.grid-2\s*\{\s*grid-template-columns:\s*minmax\(0,1fr\)/.test(cssBlock));
check('Route Intelligence main content not hidden behind global overflow clipping',!cssBlock.includes('overflow:hidden'));
console.log(JSON.stringify({result:'PASS',assertions:pass,scope:'synthetic aging with real app functions; CSS structural guards, not browser reflow acceptance'}));
