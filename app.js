(() => {
'use strict';
const API='https://api.marinetools.app';
const SURVEY_URL='https://tally.so/r/5BWVZQ';
const SUGGEST_URL='mailto:contact@marinetools.app?subject=Marine%20Tools%20suggestion&body=Hi%2C%0A%0AI%20have%20a%20suggestion%20for%20Marine%20Tools.%0A%0AArea%20/%20tool%3A%0ASuggestion%20or%20problem%3A%0AWhat%20would%20make%20this%20better%3A%0AOptional%20context%3A%0A%0ARegards%2C%0A';
const SUPPORT_URL='https://buymeacoffee.com/marinetools';
const CONTACT_EMAIL='contact@marinetools.app';
const CUSTOM_TOOL_URL='mailto:contact@marinetools.app?subject=Custom%20Marine%20Tools%20request&body=Hi%2C%0A%0AI%20would%20like%20to%20discuss%20a%20custom%20Marine%20Tools%20tool.%0A%0ACompany%20/%20vessel%3A%0AYour%20role%3A%0AArea%3A%0AWhat%20do%20you%20need%20the%20tool%20to%20do%3A%0AHow%20do%20you%20handle%20this%20today%3A%0APreferred%20output%20/%20result%3A%0AShould%20this%20be%20private%20for%20one%20vessel/company%2C%20or%20could%20it%20become%20part%20of%20public%20Marine%20Tools%3F%3A%0AWould%20you%20like%20a%20price%20estimate%3F%3A%0A%0AYou%20can%20attach%20screenshots%2C%20spreadsheets%20or%20example%20calculations%20to%20this%20email.%0A%0ARegards%2C%0A';
const K={profile:'mt.profile',route:'mt.route',theme:'mt.theme',lastAnalysis:'mt.lastAnalysis',settings:'mt.settings',favorites:'mt.favorites',history:'mt.history',recent:'mt.recent',consumption:'mt.consumption',bunkHistory:'mt.bunkHistory',weatherCache:'mt.weatherCache'};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const nf=(n,d=1)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const store={get(k,f=null){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
const cachedWeather=store.get(K.weatherCache,{forecast:[],fetchedAt:null,lat:null,lon:null,diagnostics:null});
const state={
  profile:store.get(K.profile,{name:'',loa:80,draft:4,serviceSpeed:8,fuelDay:4,maxHs:3,maxWind:30,maxCurrent:2,minUKC:1,cpaAlert:1,corridor:5}),
  route:store.get(K.route,[]),
  theme:['dark','bridge'].includes(store.get(K.theme,'dark'))?store.get(K.theme,'dark'):'dark',
  ais:[], forecast:[], weather:Array.isArray(cachedWeather.forecast)?cachedWeather.forecast:[], map:null, routeLayer:null, aisLayer:null, riskLayer:null, lastRefresh:null, lastRefreshAt:null, weatherFetchedAt:cachedWeather.fetchedAt||null
};
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)}
function setTheme(v){
 state.theme=v==='bridge'?'bridge':'dark';
 store.set(K.theme,state.theme);
 document.documentElement.dataset.theme=state.theme==='bridge'?'bridge':'';
 const b=$('#themeToggle');
 if(b){b.textContent=state.theme==='bridge'?'BRG':'◐';b.title=state.theme==='bridge'?'Switch to Dark':'Switch to Bridge Dark'}
}
function nowUTC(){const d=new Date();return d.toISOString().slice(11,16)}

function localDateISO(d=new Date()){const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)}
function csvCell(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function downloadCsv(filename,rows){
 const csv=rows.map(r=>r.map(csvCell).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=filename;a.click();URL.revokeObjectURL(a.href)
}
function parseLocalDate(s){if(!s)return null;const d=new Date(`${s}T12:00:00`);return Number.isFinite(d.getTime())?d:null}
function daysBetween(a,b){return Math.abs(b-a)/86400000}

function updateClock(){const e=$('#utcClock');if(e)e.textContent=`UTC ${nowUTC()}`}
let leafletPromise=null,bmcLoaded=false;
const renderedPages=new Set();
function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);if(leafletPromise)return leafletPromise;
 leafletPromise=new Promise((resolve,reject)=>{if(!document.getElementById('leafletCss')){const l=document.createElement('link');l.id='leafletCss';l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l)}const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.async=true;s.onload=()=>resolve(window.L);s.onerror=reject;document.head.appendChild(s)});return leafletPromise;
}
function loadSupportWidget(){if(bmcLoaded)return;bmcLoaded=true;const s=document.createElement('script');s.src='https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';s.async=true;s.dataset.name='BMC-Widget';s.dataset.cfasync='false';s.dataset.id='marinetools';s.dataset.description='Support Marine Tools on Buy Me a Coffee';s.dataset.message='Enjoying Marine Tools? Support continued development and help keep the tools free.';s.dataset.color='#159fe4';s.dataset.position='Right';s.dataset.x_margin='18';s.dataset.y_margin='18';document.body.appendChild(s)}
function scheduleIdle(fn,timeout=2500){if('requestIdleCallback'in window)requestIdleCallback(fn,{timeout});else setTimeout(fn,timeout)}
const PAGE_RENDERERS={'home':renderHome,'live-experimental':renderLiveExperimental,'route-intelligence':renderRouteIntelligence,'navigation':renderNavigation,'weather':renderWeather,'fuel':renderFuel,'vessel-calcs':renderVessel,'engineering':renderEngineering,'electrical':renderElectrical,'quick':renderQuick,'profile':renderProfile,'settings':renderSettings,'survey':renderSurvey,'suggestions':renderSuggestions,'support':renderSupport,'contact':renderContact,'about':renderAbout,'privacy':renderPrivacy};
function ensurePage(id){if(renderedPages.has(id))return;const fn=PAGE_RENDERERS[id];if(fn){fn();renderedPages.add(id);syncFavoriteButtons()}}
function page(id){ensurePage(id);$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));$$('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===id));$('#sidebar').classList.remove('open');if(id==='route-intelligence')loadLeaflet().then(()=>setTimeout(initRouteMap,40)).catch(()=>toast('Map library could not be loaded.'));if(id==='support')loadSupportWidget();window.scrollTo({top:0,behavior:'smooth'})}
function openTool(pageId,title=''){page(pageId);if(title)setTimeout(()=>{const card=$$('.tool-card').find(x=>x.dataset.toolTitle===title);if(card){if(card.hidden&&card.dataset.toolGroup){const sel=pageId==='fuel'?$('#fuelView'):pageId==='engineering'?$('#engView'):null;if(sel){sel.value=card.dataset.toolGroup;sel.dispatchEvent(new Event('change'))}}card.scrollIntoView({behavior:'smooth',block:'start'});card.classList.add('tool-focus');setTimeout(()=>card.classList.remove('tool-focus'),1600)}},80)}
function button(label,pageId,cls='btn primary'){return `<button class="${cls}" data-go="${pageId}">${label}</button>`}

const TOOL_META={
 'Daily consumption & reporting':{how:'Record fuel, urea or lube-oil consumption from a reading difference or a directly entered amount, then save it locally.',formula:'Reading mode: consumed volume = current reading − previous reading. Mass = volume × density. Specific rate = mass / running hours when hours are entered.',units:'m³ or litres, kg/m³, kg, tonnes, hours and kg/h.',assume:'The entered readings or direct amount represent consumption for the selected date/period.',limits:'Local operational helper only. It does not replace an approved engine, fuel, emissions or statutory logbook.'},
 'Bunkering history & export':{how:'Save each bunkering locally with date, grade, volume and density, then review totals and export the history.',formula:'Mass = volume × density. Weighted density = total mass / total volume.',units:'m³, kg/m³ and tonnes.',assume:'Entered quantities and density are taken from the relevant delivery documentation.',limits:'Local analysis history only — not a BDN, Oil Record Book or statutory bunkering record.'},
 'Bearing, distance & destination':{how:'Enter two positions, then calculate distance and initial true bearing.',formula:'Spherical great-circle distance and initial bearing.',units:'Degrees, nautical miles, degrees true.',assume:'Positions use WGS-84-style latitude/longitude input.',limits:'Planning helper only; use approved navigation systems for the voyage plan.'},
 'Coordinate toolbox':{how:'Enter a decimal latitude and longitude to show DDM and DMS formats.',formula:'Direct angular-format conversion.',units:'Decimal degrees, DDM and DMS.',assume:'North/east positive; south/west negative.',limits:'Does not transform between chart datums.'},
 'Current-corrected ETA':{how:'Enter distance, speed through water and the current component along the route.',formula:'SOG = STW + along-track current; time = distance / SOG.',units:'NM, kn, hours.',assume:'Current remains constant and is already resolved along the track.',limits:'Does not model cross-current or changing tidal streams.'},
 'Wind component':{how:'Enter vessel course, wind-from direction and wind speed.',formula:'Wind vector resolved into longitudinal and transverse components.',units:'Degrees true and knots.',assume:'Directions are true and wind is entered as “from”.',limits:'Does not correct for vessel motion; use True / apparent wind for that.'},
 'Closest point on active route':{how:'If you use the experimental route feature, enter a position to calculate its shortest distance from that saved route.',formula:'Shortest point-to-segment distance in a local nautical-mile projection.',units:'Latitude/longitude and NM.',assume:'Suitable for local route-segment checks.',limits:'Not a cross-track-error function from approved navigation equipment.'},
 'Great circle vs rhumb line':{how:'Enter departure and arrival positions and compare the two sailing methods.',formula:'Haversine great-circle versus Mercator rhumb-line sailing.',units:'Degrees and NM.',assume:'Spherical Earth approximation.',limits:'Use approved route-planning methods for final navigation.'},
 'True / apparent wind':{how:'Enter course, vessel speed, apparent wind direction relative to the bow and apparent wind speed.',formula:'Vector addition of vessel velocity and apparent-wind velocity.',units:'Degrees and knots.',assume:'0° relative is ahead; 90° is starboard.',limits:'Ignores sensor correction, heel, leeway and vertical wind.'},
 'Passage scenario compare':{how:'Enter route distance and a reference fuel rate, then list the speeds you want to compare.',formula:'Time = distance/speed; simple fuel rate ∝ speed³.',units:'NM, kn, m³/day, m³.',assume:'Cubic fuel model is only a comparison model.',limits:'Replace with vessel-specific speed/consumption curves whenever available.'},
 'Set & drift':{how:'Enter heading and speed through water plus the current set-to direction and drift speed.',formula:'Through-water velocity vector + current vector = ground velocity vector.',units:'Degrees true and knots.',assume:'Current set is entered as the direction the water moves toward.',limits:'Constant vectors; no wind/leeway model.'},
 'Route fuel estimate':{how:'Create a route and Vessel Profile, then update the estimate.',formula:'Route distance / service speed × daily fuel rate.',units:'NM, hours, m³.',assume:'Constant service speed and daily fuel consumption.',limits:'Weather, manoeuvring and load changes are not modelled.'},
 'Fuel ROB & endurance':{how:'Enter ROB, expected daily consumption and the reserve you want to keep.',formula:'Usable ROB = ROB × (1 − reserve); endurance = usable ROB / daily rate.',units:'m³, %, days.',assume:'Constant average daily consumption.',limits:'Does not include unusable tank volume unless included in your reserve.'},
 'Endurance scenario compare':{how:'Enter ROB and reserve, then list several daily-consumption scenarios.',formula:'Endurance = usable ROB / scenario consumption.',units:'m³/day and days.',assume:'Constant consumption in each scenario.',limits:'Planning comparison only.'},
 'Fuel consumption by speed':{how:'Paste measured speed,consumption pairs and enter the target speed.',formula:'Linear interpolation between the nearest supplied points.',units:'kn and m³/day.',assume:'Input points represent comparable operating conditions.',limits:'Avoid extrapolating far outside measured points.'},
 'Fuel volume / density correction':{how:'Enter observed volume, density, temperature, reference temperature and expansion coefficient.',formula:'Simple thermal volume correction and mass = volume × density.',units:'m³, kg/m³, °C, tonnes.',assume:'User-supplied coefficient represents the product.',limits:'Use BDN/table-standard corrections where required.'},
 'Tank transfer':{how:'Enter receiving-tank capacity, current volume, transfer volume and pump rate.',formula:'Final volume = current + transfer; time = transfer / rate.',units:'m³, %, hours.',assume:'Constant transfer rate.',limits:'Does not include line contents, trim/list or tank-specific max-fill rules.'},
 'Fuel blending':{how:'Enter volume, density and sulphur content for both fuels.',formula:'Mass-weighted density and sulphur balance.',units:'m³, kg/m³, % m/m.',assume:'Simple complete mixing.',limits:'Does not assess fuel compatibility, stability or statutory suitability.'},
 'Dynamic UKC & squat':{how:'Enter depth, draft and speed. Block coefficient and channel factor are available under Advanced inputs.',formula:'Simplified squat = channel factor × Cb × speed² / 100.',units:'m, kn.',assume:'Simplified planning relation.',limits:'Vessel-specific squat data and approved UKC procedures take precedence.'},
 'Anchor swing radius':{how:'Enter chain paid out, water depth and vessel length.',formula:'Horizontal chain reach ≈ √(chain² − depth²); radius adds vessel length.',units:'m.',assume:'Simple geometric estimate.',limits:'Catenary, tide, yaw, seabed and antenna position are not fully modelled.'},
 'Draft / tide UKC':{how:'Enter chart depth, water-level correction, draft and chosen safety allowance.',formula:'UKC = depth + tide − draft − allowance.',units:'m.',assume:'All vertical references are compatible.',limits:'Datum errors, squat and dynamic motion must be handled separately.'},
 'FWA / DWA':{how:'Enter displacement, TPC and dock-water density.',formula:'FWA ≈ displacement/(4×TPC); DWA scales FWA by density difference.',units:'tonnes, t/cm, t/m³, mm.',assume:'Standard approximate relation.',limits:'Use approved hydrostatic data for vessel-specific work.'},
 'Air draft / bridge clearance':{how:'Enter published vertical clearance, actual water level above its reference, vessel air draft and your safety margin.',formula:'Remaining clearance = published clearance − water-level increase − air draft − margin.',units:'m.',assume:'Published clearance and water level use compatible vertical references.',limits:'Always verify bridge datum, tide/water level, vessel squat/heel and official restrictions.'},
 'Hydraulic power':{how:'Enter pressure and flow. Only enable the efficiency option if you also want an estimated input-power requirement.',formula:'Hydraulic kW = bar × L/min / 600; optional input power = hydraulic power / efficiency.',units:'bar, L/min, %, kW.',assume:'Steady flow and pressure.',limits:'Losses outside the entered efficiency are not separately modelled.'},
 'Pump speed change':{how:'Enter the current pump RPM, flow, head and power, then enter the new RPM.',formula:'Q∝N, H∝N², P∝N³.',units:'RPM, m³/h, m, kW.',assume:'Same pump, fluid and broadly similar efficiency.',limits:'Actual system curve and pump efficiency can change the result.'},
 'Pipe velocity':{how:'Enter volumetric flow and internal pipe diameter.',formula:'Velocity = flow / cross-sectional area.',units:'m³/h, mm, m/s.',assume:'Full circular pipe.',limits:'Does not calculate friction loss or cavitation margin.'},
 'Generator load margin':{how:'Enter the total generator capacity currently online and the present total load.',formula:'Load % = load/capacity; margin = capacity − load.',units:'kW and %.',assume:'Online capacity is correctly defined for the operating condition.',limits:'Manufacturer limits, transient response and redundancy philosophy are not modelled.'},
 'Tank table interpolation':{how:'Copy the lower and upper surrounding values from the approved tank table, then enter the measured sounding or ullage.',formula:'Linear interpolation between the lower and upper table values.',units:'User-defined sounding/ullage unit and m³.',assume:'The two entered table values surround the measurement and use the correct tank/trim condition.',limits:'Use vessel-approved tank tables and corrections where required.'},
 'Flow / fill time':{how:'Choose whether you want to find transfer time, required flow or transferred volume. Only the two needed input fields are shown.',formula:'Volume = flow × time.',units:'m³, m³/h, hours.',assume:'Constant flow rate.',limits:'Does not include ramp-up, valve changes or line losses.'},
 'Pressure ↔ head':{how:'Choose the conversion and fluid. Density is filled automatically for fresh water and sea water, or can be entered for fuel/oil and custom fluids.',formula:'Head = pressure/(ρg).',units:'bar, metres, kg/m³.',assume:'Static fluid column and standard gravity.',limits:'Dynamic pressure losses are not included.'},
 'Three-phase power':{how:'Enter line voltage, line current and power factor.',formula:'kVA = √3VI/1000; active electrical power kW = kVA×PF.',units:'V, A, kVA, kW.',assume:'Balanced three-phase system.',limits:'Harmonics and unbalance are not included.'},
 'Voltage drop':{how:'Enter current, one-way cable length, conductor resistance and system voltage.',formula:'Simplified 3-phase ΔV = √3 × I × R × length.',units:'A, m, Ω/km, V, %.',assume:'Resistive balanced circuit.',limits:'Reactance, temperature, installation method and regulations are not fully modelled.'},
 'Battery runtime':{how:'Enter nominal energy, current/minimum SOC, load and usable efficiency.',formula:'Usable energy = capacity × SOC window × efficiency; runtime = usable energy/load.',units:'kWh, %, kW, hours.',assume:'Constant load and efficiency.',limits:'BMS limits, temperature, C-rate and degradation can change actual runtime.'},
 'Current imbalance':{how:'Enter the three phase currents.',formula:'Maximum deviation from phase average / average.',units:'A and %.',assume:'Simultaneous representative readings.',limits:'Does not diagnose the cause of imbalance.'},
 'Motor current':{how:'Enter motor output power, voltage, power factor and efficiency.',formula:'I = Pout /(√3 × V × PF × efficiency).',units:'kW, V, A.',assume:'Balanced three-phase motor at steady load.',limits:'Starting current, harmonics and nameplate/service-factor details are not modelled.'},
 'Power factor correction':{how:'Enter active power, present power factor and target power factor.',formula:'Required kVAr = P × (tan φ1 − tan φ2).',units:'kW, PF, kVAr.',assume:'Steady load and valid PF values between 0 and 1.',limits:'Capacitor steps, harmonics and resonance require engineering review.'},
 'Transformer calculator':{how:'Enter transformer kVA and primary/secondary line voltages.',formula:'3-phase line current = kVA×1000 /(√3×V).',units:'kVA, V, A.',assume:'Three-phase apparent-power rating.',limits:'Losses, vector group and inrush are not included.'},
 'Speed · distance · time':{how:'Enter distance and speed to calculate passage time.',formula:'Time = distance / speed.',units:'NM, kn, hours.',assume:'Constant speed.',limits:'Does not include manoeuvring or current.'},
 'Beaufort converter':{how:'Enter wind speed in knots to show the approximate Beaufort force.',formula:'Lookup against standard approximate knot ranges.',units:'kn and Beaufort force.',assume:'Wind speed is representative.',limits:'Sea state depends on fetch, duration and local conditions.'},
 'Unit converter':{how:'Enter a value and select the conversion.',formula:'Direct unit conversion.',units:'Depends on the selected conversion.',assume:'Input unit matches the selected conversion.',limits:'Reference conversion only.'},
 'Compass / gyro correction':{how:'Enter observed course and signed corrections; east is positive and west negative.',formula:'True = observed + variation + deviation/error.',units:'Degrees.',assume:'The selected sign convention matches your procedure.',limits:'Always verify the convention and instrument-specific correction method.'},
 'Wave encounter period':{how:'Enter vessel course/speed plus wave-from direction and wave period.',formula:'Deep-water encounter frequency using relative motion between vessel and wave propagation.',units:'Degrees, kn, seconds.',assume:'Deep water, regular waves and steady course/speed.',limits:'Real seas are multi-directional and vessel response is not predicted.'},
 'Fuel / Urea converter':{how:'Choose the product and whether you have volume or mass, then enter the amount and product density.',formula:'Mass = volume × density; volume = mass / density.',units:'m³, litres, kg/m³, kg and tonnes.',assume:'Entered density applies to the product and relevant temperature.',limits:'Use the density from the BDN, SDS or product data where required.'},
 'Chemical dosing':{how:'Enter the system or tank volume and the dosing rate stated by the product manufacturer.',formula:'Required amount = system volume × entered dose rate, converted according to the selected unit.',units:'m³, mL, L and % v/v.',assume:'The user supplies the correct product-specific dosing rate.',limits:'Marine Tools does not recommend chemical dose rates. Follow the product data sheet, vessel procedure and SDS.'},
 'Bunkering overview':{how:'Add each bunkering using separate date, volume and density fields.',formula:'Total mass = Σ(volume × density); weighted density = total mass / total volume.',units:'m³, kg/m³, tonnes and days.',assume:'Entered density applies to each delivery.',limits:'This is an analysis summary, not an Oil Record Book or statutory bunkering record.'},
 'NOx reporting helper':{how:'Choose the calculation basis, add each engine/source in separate fields, and enter period urea consumption if SCR/urea is used.',formula:'Power basis: kg NOx = hours × kW × g/kWh ÷ 1000. Fuel basis: kg NOx = fuel tonnes × kg/t. Urea is reported separately and is not used to infer an emission reduction.',units:'hours, kW, g/kWh, tonnes fuel, kg NOx and litres urea solution.',assume:'Input factors and activity data are valid for the reporting method used onboard.',limits:'Not an official NOx reporting system. Urea volume alone does not define NOx reduction; use vessel-approved factors and the required reporting method.'},
 'Lube oil trend':{how:'Add readings using separate date, cumulative running-hours and oil-added fields. The first row is the baseline.',formula:'Consumption rate = litres filled / running-hour increase; daily rate uses elapsed calendar time.',units:'L, running hours, L/1000 h and L/day.',assume:'Filled quantity represents consumption since the previous row and running hours are cumulative.',limits:'A trend helper only; does not replace machinery logs, PMS records or oil-condition analysis.'},
 'Weather window finder':{how:'Add forecast rows using separate time, wave, wind and current fields, then enter your chosen limits.',formula:'Finds consecutive supplied rows within all thresholds.',units:'m, kn and user-supplied time labels.',assume:'Each row represents the intended planning interval.',limits:'Manual planning aid; verify official forecasts and operating limits.'}
};
function toolMeta(title){return TOOL_META[title]||{how:'Enter the requested values, calculate, then check the result and assumptions before use.',formula:'See the result description and supplied inputs.',units:'Shown beside each input and result.',assume:'Inputs represent the condition being assessed.',limits:'Planning/calculation aid only; verify against vessel-specific documentation.'}}

function reportIssueUrl(title){
 const subject=`Marine Tools problem — ${title}`;
 const body=`Hi,

I found a problem or something unclear in Marine Tools.

Tool: ${title}
What happened:
What did you expect:
Inputs used:
Device / browser (optional):

Please do not include passwords, API keys or other sensitive information.

Regards,
`;
 return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function reportIssueLink(title){
 return `<div class="tool-feedback"><a href="${reportIssueUrl(title)}">Report a problem with this tool →</a></div>`;
}

function toolUsage(title){const m=toolMeta(title);return `<div class="tool-how"><b>How to use</b><span>${m.how}</span></div>`}
function toolInformation(title,desc){const m=toolMeta(title);return `<details class="tool-info"><summary>Tool information</summary><dl><dt>Purpose</dt><dd>${desc}</dd><dt>Formula</dt><dd>${m.formula}</dd><dt>Assumptions</dt><dd>${m.assume}</dd><dt>Units</dt><dd>${m.units}</dd><dt>Last updated</dt><dd>01 Oct 2026</dd><dt>Limitations</dt><dd>${m.limits}</dd></dl></details>`}

function card(title,desc,body,id=''){return `<article class="panel tool-card" ${id?`id="${id}"`:''} data-tool-title="${title}"><div class="tool-card-head"><div><h3>${title}</h3><p>${desc}</p></div><button class="fav-toggle" type="button" data-fav-title="${title}" title="Add to My Tools" aria-label="Add ${title} to My Tools">☆</button></div><div class="tool-card-work">${body}</div><details class="tool-details"><summary>Guidance & details</summary><div class="tool-details-inner">${toolUsage(title)}${toolInformation(title,desc)}${reportIssueLink(title)}</div></details></article>`}
function groupedCard(group,title,desc,body,id=''){return card(title,desc,body,id).replace('class="panel tool-card"',`class="panel tool-card" data-tool-group="${group}"`)}


function formulaBox(){return ''}

function calcButton(id,label='Calculate'){return `<div class="actions"><button class="btn primary calc-action" id="${id}">${label}</button><button class="btn copy-result" type="button">Copy result</button><button class="btn share-result" type="button">Share result</button></div>`}
function result(id,text='Enter values to calculate.'){return `<div class="result" id="${id}"><small>${text}</small></div>`}
function hav(a,b){const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon);const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function bearing(a,b){const y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));return (deg(Math.atan2(y,x))+360)%360}

function rhumb(a,b){
 const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=p2-p1;
 let dl=rad(b.lon-a.lon);if(Math.abs(dl)>Math.PI)dl=dl>0?-(2*Math.PI-dl):(2*Math.PI+dl);
 const dpsi=Math.log(Math.tan(Math.PI/4+p2/2)/Math.tan(Math.PI/4+p1/2));
 const q=Math.abs(dpsi)>1e-12?dp/dpsi:Math.cos(p1);
 const dist=Math.sqrt(dp*dp+q*q*dl*dl)*R;
 const brg=(deg(Math.atan2(dl,dpsi))+360)%360;
 return{distance:dist,bearing:brg}
}

function destination(a,brg,nm){const R=3440.065,d=nm/R,p1=rad(a.lat),l1=rad(a.lon),t=rad(brg);const p2=Math.asin(Math.sin(p1)*Math.cos(d)+Math.cos(p1)*Math.sin(d)*Math.cos(t));const l2=l1+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(p1),Math.cos(d)-Math.sin(p1)*Math.sin(p2));return{lat:deg(p2),lon:((deg(l2)+540)%360)-180}}
function routeDistance(r=state.route){let n=0;for(let i=1;i<r.length;i++)n+=hav(r[i-1],r[i]);return n}
function routeBBox(r=state.route,padNm=8){if(!r.length)return null;const lats=r.map(p=>p.lat),lons=r.map(p=>p.lon),mid=lats.reduce((a,b)=>a+b,0)/lats.length;const dLat=padNm/60,dLon=padNm/(60*Math.max(.25,Math.cos(rad(mid))));return{minLat:Math.min(...lats)-dLat,maxLat:Math.max(...lats)+dLat,minLon:Math.min(...lons)-dLon,maxLon:Math.max(...lons)+dLon}}
function nmPointLine(p,a,b){const lat0=rad((a.lat+b.lat+p.lat)/3),sx=60*Math.cos(lat0),sy=60;const ax=a.lon*sx,ay=a.lat*sy,bx=b.lon*sx,by=b.lat*sy,px=p.lon*sx,py=p.lat*sy,dx=bx-ax,dy=by-ay;const t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-(ax+t*dx),py-(ay+t*dy))}
function distToRoute(p,r=state.route){if(r.length<2)return Infinity;let d=Infinity;for(let i=1;i<r.length;i++)d=Math.min(d,nmPointLine(p,r[i-1],r[i]));return d}
function mpsToKn(x){return x*1.943844}
function vectorFrom(sog,cog){return{x:sog*Math.sin(rad(cog)),y:sog*Math.cos(rad(cog))}}
function cpaTcpa(own,target){const lat0=rad((own.lat+target.lat)/2),rx=(target.lon-own.lon)*60*Math.cos(lat0),ry=(target.lat-own.lat)*60;const vo=vectorFrom(own.sog,own.cog),vt=vectorFrom(target.sog,target.cog),vx=vt.x-vo.x,vy=vt.y-vo.y;const vv=vx*vx+vy*vy;let t=vv?-(rx*vx+ry*vy)/vv:0;t=Math.max(0,t);const cx=rx+vx*t,cy=ry+vy*t;return{cpa:Math.hypot(cx,cy),tcpa:t*60}}
function riskFor(f,p=state.profile){let score=0,reasons=[];if(Number.isFinite(f.hs)){const q=f.hs/p.maxHs;if(q>1){score=2;reasons.push(`Hs ${nf(f.hs)} m > ${p.maxHs} m`)}else if(q>.8){score=Math.max(score,1);reasons.push(`Hs near limit`)}}if(Number.isFinite(f.windKn)){const q=f.windKn/p.maxWind;if(q>1){score=2;reasons.push(`Wind ${nf(f.windKn,0)} kn > ${p.maxWind} kn`)}else if(q>.8){score=Math.max(score,1);reasons.push('Wind near limit')}}if(Number.isFinite(f.currentKn)){const q=f.currentKn/p.maxCurrent;if(q>1){score=2;reasons.push(`Current ${nf(f.currentKn)} kn > ${p.maxCurrent} kn`)}else if(q>.8){score=Math.max(score,1);reasons.push('Current near limit')}}return{score,label:['Normal','Caution','Alert'][score],reasons}}
function sourceStatus(id,status,text){const e=$(id);if(!e)return;e.className=`chip ${status}`;e.textContent=text}

const tools=[
 ['Fuel & bunkering','fuel','◧'],['Engineering','engineering','⚙'],['Electrical','electrical','ϟ'],['Vessel calculations','vessel-calcs','⚓'],['Quick tools','quick','▦'],
 ['Weather','weather','☁'],['Navigation','navigation','△'],['Live & Experimental','live-experimental','◉'],['Route Intelligence (experimental)','route-intelligence','◉'],
 ['Vessel profile','profile','⚓'],['Settings','settings','☷'],['Help shape Marine Tools','survey','▥'],['Suggestions','suggestions','✧'],['Support Marine Tools','support','☕'],['Business & contact','contact','✉'],['About this project','about','ⓘ'],['Privacy & data','privacy','◈']
];
const STATIC_TOOL_INDEX=[{"title":"Bearing, distance & destination","page":"navigation","icon":"→","tool":"Bearing, distance & destination"},{"title":"Closest point on active route","page":"navigation","icon":"→","tool":"Closest point on active route"},{"title":"Coordinate toolbox","page":"navigation","icon":"→","tool":"Coordinate toolbox"},{"title":"Current-corrected ETA","page":"navigation","icon":"→","tool":"Current-corrected ETA"},{"title":"Great circle vs rhumb line","page":"navigation","icon":"→","tool":"Great circle vs rhumb line"},{"title":"Passage scenario compare","page":"navigation","icon":"→","tool":"Passage scenario compare"},{"title":"Route fuel estimate","page":"navigation","icon":"→","tool":"Route fuel estimate"},{"title":"Set & drift","page":"navigation","icon":"→","tool":"Set & drift"},{"title":"True / apparent wind","page":"navigation","icon":"→","tool":"True / apparent wind"},{"title":"Wind component","page":"navigation","icon":"→","tool":"Wind component"},{"title":"Wave encounter period","page":"weather","icon":"→","tool":"Wave encounter period"},{"title":"Weather window finder","page":"weather","icon":"→","tool":"Weather window finder"},{"title":"Bunkering overview","page":"fuel","icon":"→","tool":"Bunkering overview"},{"title":"Endurance scenario compare","page":"fuel","icon":"→","tool":"Endurance scenario compare"},{"title":"Fuel / Urea converter","page":"fuel","icon":"→","tool":"Fuel / Urea converter"},{"title":"Fuel ROB & endurance","page":"fuel","icon":"→","tool":"Fuel ROB & endurance"},{"title":"Fuel blending","page":"fuel","icon":"→","tool":"Fuel blending"},{"title":"Fuel consumption by speed","page":"fuel","icon":"→","tool":"Fuel consumption by speed"},{"title":"Fuel temperature correction","page":"fuel","icon":"→","tool":"Fuel temperature correction"},{"title":"Route fuel estimate","page":"fuel","icon":"→","tool":"Route fuel estimate"},{"title":"Tank transfer","page":"fuel","icon":"→","tool":"Tank transfer"},{"title":"Air draft / bridge clearance","page":"vessel-calcs","icon":"→","tool":"Air draft / bridge clearance"},{"title":"Anchor swing radius","page":"vessel-calcs","icon":"→","tool":"Anchor swing radius"},{"title":"Draft / tide UKC","page":"vessel-calcs","icon":"→","tool":"Draft / tide UKC"},{"title":"Dynamic UKC & squat","page":"vessel-calcs","icon":"→","tool":"Dynamic UKC & squat"},{"title":"FWA / DWA","page":"vessel-calcs","icon":"→","tool":"FWA / DWA"},{"title":"Chemical dosing","page":"engineering","icon":"→","tool":"Chemical dosing"},{"title":"Flow / fill time","page":"engineering","icon":"→","tool":"Flow / fill time"},{"title":"Generator load margin","page":"engineering","icon":"→","tool":"Generator load margin"},{"title":"Hydraulic power","page":"engineering","icon":"→","tool":"Hydraulic power"},{"title":"Lube oil trend","page":"engineering","icon":"→","tool":"Lube oil trend"},{"title":"NOx reporting helper","page":"engineering","icon":"→","tool":"NOx reporting helper"},{"title":"Pipe velocity","page":"engineering","icon":"→","tool":"Pipe velocity"},{"title":"Pressure ↔ head","page":"engineering","icon":"→","tool":"Pressure ↔ head"},{"title":"Pump speed change","page":"engineering","icon":"→","tool":"Pump speed change"},{"title":"Tank table interpolation","page":"engineering","icon":"→","tool":"Tank table interpolation"},{"title":"Battery runtime","page":"electrical","icon":"→","tool":"Battery runtime"},{"title":"Current imbalance","page":"electrical","icon":"→","tool":"Current imbalance"},{"title":"Motor current","page":"electrical","icon":"→","tool":"Motor current"},{"title":"Power factor correction","page":"electrical","icon":"→","tool":"Power factor correction"},{"title":"Three-phase power","page":"electrical","icon":"→","tool":"Three-phase power"},{"title":"Transformer calculator","page":"electrical","icon":"→","tool":"Transformer calculator"},{"title":"Voltage drop","page":"electrical","icon":"→","tool":"Voltage drop"},{"title":"Beaufort converter","page":"quick","icon":"→","tool":"Beaufort converter"},{"title":"Compass / gyro correction","page":"quick","icon":"→","tool":"Compass / gyro correction"},{"title":"Speed · distance · time","page":"quick","icon":"→","tool":"Speed · distance · time"},{"title":"Unit converter","page":"quick","icon":"→","tool":"Unit converter"},{"title":"Daily consumption & reporting","page":"fuel","icon":"→","tool":"Daily consumption & reporting"},{"title":"Bunkering history & export","page":"fuel","icon":"→","tool":"Bunkering history & export"}];
function toolSearchIndex(){
 const found=[...tools.map(x=>({title:x[0],page:x[1],icon:x[2],tool:''})),...STATIC_TOOL_INDEX];
 return found.filter((x,i,a)=>a.findIndex(y=>y.title===x.title&&y.page===x.page)===i);
}
function pageLabel(id){return({'fuel':'Fuel & Bunkering','engineering':'Engineering','electrical':'Electrical','vessel-calcs':'Vessel Calculations','quick':'Quick Tools','weather':'Weather','navigation':'Navigation','live-experimental':'Live & Experimental','route-intelligence':'Experimental','profile':'Vessel Profile','settings':'Settings'}[id]||id.replaceAll('-',' '))}
function toolSearchText(x){const meta=TOOL_META[x.title]||{};return `${x.title} ${pageLabel(x.page)} ${meta.how||''} ${meta.units||''}`.toLowerCase()}



function recentTools(){return store.get(K.recent,[])||[]}
function calcHistory(){return store.get(K.history,[])||[]}
function toolPage(card){return card?.closest('.page')?.id||'home'}
function collectInputs(card){
 return [...card.querySelectorAll('label')].map(l=>{
   const el=l.querySelector('input,select,textarea'); if(!el)return null;
   const label=[...l.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim()||l.textContent.split('\n')[0].trim();
   return `${label}: ${el.value}`;
 }).filter(Boolean)
}
function recordToolUse(card){
 if(!card)return;
 const title=card.dataset.toolTitle||card.querySelector('h3')?.textContent||'Tool';
 const pageId=toolPage(card);
 let recent=recentTools().filter(x=>x.title!==title);
 recent.unshift({title,page:pageId,time:new Date().toISOString()});
 store.set(K.recent,recent.slice(0,8));
 const res=card.querySelector('.result');
 if(res&&res.innerText.trim()){
   let h=calcHistory();
   h.unshift({title,page:pageId,time:new Date().toISOString(),inputs:collectInputs(card),result:res.innerText.trim()});
   store.set(K.history,h.slice(0,20));
 }
 renderRecentHome();renderHistoryHome();
}
function buildShareText(card){
 const title=card.dataset.toolTitle||'Marine Tools calculation';
 const inputs=collectInputs(card);
 const resultText=card.querySelector('.result')?.innerText.trim()||'No result';
 return [`Marine Tools — ${title}`,`Time: ${new Date().toISOString()}`,inputs.length?'Inputs:':'',...inputs,`Result: ${resultText}`,'Planning/calculation aid only — verify inputs and result against vessel-specific documentation and approved sources.'].filter(Boolean).join('\n');
}
async function shareResult(btn){
 const card=btn.closest('.tool-card');if(!card)return;
 const text=buildShareText(card);
 try{
   if(navigator.share)await navigator.share({title:`Marine Tools — ${card.dataset.toolTitle}`,text});
   else{await navigator.clipboard.writeText(text);toast('Share text copied.')}
 }catch(e){if(e?.name!=='AbortError')toast('Share unavailable.')}
}
function renderRecentHome(){
 const box=$('#recentToolsHome');if(!box)return;
 const r=recentTools();
 box.innerHTML=r.length?r.map(x=>`<button class="tool-link" data-go="${x.page}" data-tool-target="${esc(x.title)}"><span>↻</span>${esc(x.title)}<small>${timeAgo(x.time)}</small></button>`).join(''):'<p class="helper">Tools you calculate with will appear here.</p>';
}
function renderHistoryHome(){
 const box=$('#historyHome');if(!box)return;
 const h=calcHistory().slice(0,6);
 box.innerHTML=h.length?h.map((x,i)=>`<div class="history-row"><div><b>${esc(x.title)}</b><small>${timeAgo(x.time)} · ${esc(x.result.split('\n')[0])}</small></div><button class="btn mini" data-history-copy="${i}">Copy</button></div>`).join(''):'<p class="helper">Your recent calculations are stored locally in this browser.</p>';
}
function timeAgo(iso){
 const ms=Date.now()-new Date(iso).getTime(); if(!Number.isFinite(ms))return '—';
 const min=Math.max(0,Math.floor(ms/60000)); if(min<1)return 'just now'; if(min<60)return `${min} min ago`;
 const h=Math.floor(min/60); if(h<24)return `${h} h ago`; return `${Math.floor(h/24)} d ago`
}
function copyHistoryIndex(i){
 const h=calcHistory().slice(0,6)[i];if(!h)return;
 const text=[`Marine Tools — ${h.title}`,`Time: ${h.time}`,'Inputs:',...(h.inputs||[]),`Result: ${h.result}`].join('\n');
 navigator.clipboard?.writeText(text).then(()=>toast('Calculation copied.'));
}
function clearHistory(){store.set(K.history,[]);store.set(K.recent,[]);renderHistoryHome();renderRecentHome();toast('Local calculation history cleared.')}
function sanityCheckInput(input){
 if(input.type!=='number')return;
 const raw=input.value;if(raw===''){input.classList.remove('sanity-bad');return}
 const v=Number(raw),label=(input.closest('label')?.textContent||'').toLowerCase();
 let bad=!Number.isFinite(v),why='';
 if(!bad && /(speed|distance|volume|density|capacity|flow|pressure|head|draft|depth|length|load|current a|voltage|power|rpm|kwh|tpc|displacement|chain|diameter|rate)/.test(label) && v<0){bad=true;why='Negative value is unusual for this input.'}
 if(!bad && /%/.test(label) && (v<0||v>100)){bad=true;why='Percentage is normally between 0 and 100.'}
 if(!bad && /power factor/.test(label) && (v<=0||v>1)){bad=true;why='Power factor should normally be above 0 and at most 1.'}
 if(!bad && /(course|direction|wind from|set)/.test(label) && (v<0||v>360)){bad=true;why='Direction is normally entered from 0° to 360°.'}
 input.classList.toggle('sanity-bad',bad);input.title=bad?why:'';
 const card=input.closest('.tool-card');if(card){
   let note=card.querySelector('.sanity-note');
   if(bad&&!note){note=document.createElement('div');note.className='sanity-note';note.textContent='Check highlighted input — the value is outside a typical range.';card.insertBefore(note,card.querySelector('.tool-info'))}
   if(note&&!card.querySelector('.sanity-bad'))note.remove()
 }
}

function copyResult(el){
 const r=el.closest('.tool-card')?.querySelector('.result');if(!r)return;
 const text=r.innerText.trim();if(!text)return;
 navigator.clipboard?.writeText(text).then(()=>toast('Result copied.')).catch(()=>toast('Copy unavailable.'));
}

function favorites(){return store.get(K.favorites,[])||[]}
function isFavorite(title){return favorites().some(x=>x.title===title)}
function toggleFavorite(title,pageId){
 let f=favorites(),i=f.findIndex(x=>x.title===title);
 if(i>=0){f.splice(i,1);toast(`${title} removed from My Tools.`)}
 else{f.push({title,page:pageId});toast(`${title} added to My Tools.`)}
 store.set(K.favorites,f);syncFavoriteButtons();renderFavoriteHome();
}
function syncFavoriteButtons(){
 $$('.fav-toggle').forEach(b=>{
   const on=isFavorite(b.dataset.favTitle);
   b.textContent=on?'★':'☆';b.classList.toggle('on',on);
   b.title=on?'Remove from My Tools':'Add to My Tools';
 });
}
function renderFavoriteHome(){
 const box=$('#favoriteHome'); if(!box)return;
 const f=favorites();
 const fallback=[
  {title:'Fuel consumption by speed',page:'fuel'},
  {title:'Dynamic UKC & squat',page:'vessel-calcs'},
  {title:'Coordinate toolbox',page:'navigation'},
  {title:'Generator load margin',page:'engineering'}
 ];
 const items=f.length?f:fallback;
 box.innerHTML=items.slice(0,8).map(x=>`<button class="tool-link" data-go="${x.page}" data-tool-target="${esc(x.title)}"><span>${f.length?'★':'☆'}</span> ${esc(x.title)}</button>`).join('');
 const sub=$('#favoriteSub');if(sub)sub.textContent=f.length?'Your starred tools':'Star any calculation card to build your own quick list';
}

function bindGlobal(){
 document.addEventListener('click',e=>{
 const copy=e.target.closest('.copy-result');if(copy){copyResult(copy);return}
 const share=e.target.closest('.share-result');if(share){shareResult(share);return}
 const hc=e.target.closest('[data-history-copy]');if(hc){copyHistoryIndex(+hc.dataset.historyCopy);return}
 const calc=e.target.closest('.calc-action');if(calc){const c=calc.closest('.tool-card');setTimeout(()=>recordToolUse(c),0)}
 const fav=e.target.closest('.fav-toggle');
 if(fav){e.preventDefault();e.stopPropagation();const pg=fav.closest('.page')?.id||'home';toggleFavorite(fav.dataset.favTitle,pg);return}
 const g=e.target.closest('[data-go]');if(g){openTool(g.dataset.go,g.dataset.toolTarget||'');return}
 const n=e.target.closest('.nav-btn[data-page]');if(n)page(n.dataset.page)
});
 $('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open'); $('#themeToggle').onclick=()=>setTheme(state.theme==='bridge'?'dark':'bridge');
 $('#globalSearch').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase(),box=$('#searchResults');if(!q){box.hidden=true;return}const hits=toolSearchIndex().filter(x=>toolSearchText(x).includes(q)).slice(0,12);box.innerHTML=hits.map(x=>`<button data-go="${x.page}"${x.tool?` data-tool-target="${esc(x.tool)}"`:''}><span>${x.icon}</span><span><b>${esc(x.title)}</b><small>${esc(pageLabel(x.page))}</small></span></button>`).join('')||'<button>No matching tool</button>';box.hidden=false});
 document.addEventListener('click',e=>{if(!e.target.closest('.searchbox'))$('#searchResults').hidden=true});
 document.addEventListener('input',e=>{if(e.target.matches('input[type="number"]'))sanityCheckInput(e.target)});
 window.addEventListener('online',()=>{updateConnectivity();checkApi()});window.addEventListener('offline',updateConnectivity);
 setInterval(()=>{updateClock();updateLiveAgeIndicators()},1000);updateClock();updateConnectivity();setTheme(state.theme);syncFavoriteButtons();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});scheduleIdle(checkApi,1600);scheduleIdle(loadSupportWidget,5500);
}

function updateConnectivity(){
 const b=$('#offlineBanner');if(b)b.hidden=navigator.onLine;
 if(!navigator.onLine){const t=$('#apiText');if(t)t.textContent='Offline · local tools available'}
}
function liveAge(){
 if(!state.lastRefreshAt)return null;return Math.max(0,Date.now()-new Date(state.lastRefreshAt).getTime())
}
function liveAgeText(){
 const ms=liveAge();if(ms==null)return 'Not loaded';
 const min=Math.floor(ms/60000);if(min<1)return 'just now';if(min<60)return `${min} min ago`;return `${Math.floor(min/60)} h ago`
}
function liveFreshness(){
 const ms=liveAge();if(ms==null)return 'neutral';return ms>30*60000?'bad':ms>15*60000?'warn':'ok'
}
function updateLiveAgeIndicators(){
 const txt=liveAgeText(),fresh=liveFreshness();
 const ri=$('#riDataAge');if(ri&&state.lastRefreshAt){ri.className=`chip ${fresh}`;ri.textContent=`AIS + route forecast · ${txt}${fresh==='bad'?' · STALE':''}`}
 const ws=$('#wxStatus');if(ws&&state.weatherFetchedAt){const ms=Math.max(0,Date.now()-new Date(state.weatherFetchedAt).getTime()),min=Math.floor(ms/60000),age=min<1?'just now':min<60?`${min} min ago`:`${Math.floor(min/60)} h ago`,cls=min>30?'bad':min>15?'warn':'ok';ws.innerHTML=`<span class="chip ${cls}">MET Norway · ${age}${cls==='bad'?' · STALE':''}</span>`}
}

async function checkApi(){try{const [h,a]=await Promise.allSettled([fetch(`${API}/api/health`,{cache:'no-store'}).then(r=>r.json()),fetch(`${API}/api/auth/status`,{cache:'no-store'}).then(r=>r.json())]);const health=h.status==='fulfilled'&&h.value?.status==='ok',ais=a.status==='fulfilled'&&Boolean(a.value?.ais?.authenticated);$('#apiDot').className=health?'ok':'';$('#apiText').textContent=health?(ais?'Weather ready · AIS experimental':'Weather ready · AIS unavailable'):'Live data unavailable'}catch{$('#apiText').textContent='Offline / API unavailable'}}

function renderHome(){
 $('#home').innerHTML=`
 <section class="home-hero-a home-hero-v8">
   <div class="home-hero-overlay"></div>
   <div class="home-hero-content">
     <div class="eyebrow">PRACTICAL TOOLS FOR SEAFARERS</div>
     <h1>Marine Tools</h1>
     <p>Quick maritime calculators and technical helpers for everyday work at sea.</p>
     <div class="home-tool-search">
       <span class="search-icon">⌕</span>
       <input id="homeToolSearch" autocomplete="off" placeholder="Search for a tool…" aria-label="Search Marine Tools">
       <button type="button" id="homeSearchGo" aria-label="Open first matching tool">→</button>
       <div id="homeToolResults" class="home-tool-results" hidden></div>
     </div>
     <div class="home-hero-actions"><button class="btn primary" id="homeBrowse">Browse tools ↓</button></div>
     <div class="home-custom-link"><span>Need something specific?</span><a href="${CUSTOM_TOOL_URL}">Request a custom tool →</a></div>
   </div>
 </section>

 <section class="home-primary-section" id="homePrimaryTools">
   <div class="home-section-head"><div><span class="eyebrow">CORE TOOLS</span><h2>Choose an area</h2></div><span>Fast access to the tools most useful in everyday maritime work.</span></div>
   <div class="home-category-a home-category-v8">
     <button data-go="fuel"><span class="home-cat-icon">◧</span><b>Fuel & Bunkering</b><small>Fuel, endurance, bunkering and tank helpers</small></button>
     <button data-go="engineering"><span class="home-cat-icon">⚙</span><b>Engineering</b><small>Pumps, machinery, NOx and consumables</small></button>
     <button data-go="electrical"><span class="home-cat-icon">ϟ</span><b>Electrical</b><small>Power, motors, batteries and load</small></button>
     <button data-go="vessel-calcs"><span class="home-cat-icon">⚓</span><b>Vessel Calculations</b><small>UKC, squat, draft and anchoring</small></button>
     <button data-go="quick"><span class="home-cat-icon">⇄</span><b>Quick Tools</b><small>Units, speed, time and everyday conversions</small></button>
   </div>
 </section>

 <section class="home-popular-section">
   <div class="home-section-head"><div><span class="eyebrow">POPULAR</span><h2>Common jobs</h2></div></div>
   <div class="home-popular-grid">
     <button data-go="fuel" data-tool-target="Fuel ROB & endurance"><span>◧</span><b>Fuel & endurance</b><small>ROB, reserve and endurance</small></button>
     <button data-go="fuel" data-tool-target="Bunkering overview"><span>◧</span><b>Bunkering overview</b><small>Volume, density and delivery summary</small></button>
     <button data-go="engineering" data-tool-target="Generator load margin"><span>⚙</span><b>Generator load</b><small>Load and available margin</small></button>
     <button data-go="engineering" data-tool-target="Pump speed change"><span>⚙</span><b>Pump speed change</b><small>Flow, head and power after RPM change</small></button>
     <button data-go="electrical" data-tool-target="Three-phase power"><span>ϟ</span><b>Three-phase power</b><small>Voltage, current and power factor</small></button>
     <button data-go="vessel-calcs" data-tool-target="Dynamic UKC & squat"><span>⚓</span><b>Dynamic UKC</b><small>Draft, squat and remaining clearance</small></button>
   </div>
 </section>

 <section class="home-more-section">
   <div class="home-more-links">
     <button data-go="weather"><span>☁</span><b>Weather</b><small>MET Norway point forecast and weather helpers</small><strong>→</strong></button>
     <button data-go="navigation"><span>△</span><b>Navigation</b><small>Distance, bearing, coordinates and passage maths</small><strong>→</strong></button>
     <button data-go="live-experimental"><span>◉</span><b>Live & Experimental</b><small>AIS and route-context experiments, clearly separated from core tools</small><strong>→</strong></button>
   </div>
 </section>

 <details class="home-dashboard-fold home-local-fold">
   <summary><span><b>Your tools & history</b><small>Favourites, recent tools and calculations stored on this device</small></span><strong>Open</strong></summary>
   <div class="home-dashboard-inner">
     <div class="grid-3 home-local-grid">
       <article class="panel"><div class="panel-head"><div><h3>★ My Tools</h3><small id="favoriteSub">Your starred tools</small></div></div><div class="panel-body popular-grid" id="favoriteHome"></div></article>
       <article class="panel"><div class="panel-head"><div><h3>↻ Recent tools</h3><small>Stored only on this device</small></div></div><div class="panel-body recent-tools" id="recentToolsHome"></div></article>
       <article class="panel"><div class="panel-head"><div><h3>Calculation history</h3><small>Last 20 calculations · local only</small></div><button class="btn mini" id="clearHistoryHome">Clear</button></div><div class="panel-body history-list" id="historyHome"></div></article>
     </div>
   </div>
 </details>`;

 const homeSearch=$('#homeToolSearch'),results=$('#homeToolResults');
 const showHomeSearch=()=>{const q=homeSearch.value.trim().toLowerCase();if(!q){results.hidden=true;results.innerHTML='';return []}const hits=toolSearchIndex().filter(x=>toolSearchText(x).includes(q)).sort((a,b)=>(a.title.toLowerCase().startsWith(q)?-1:0)-(b.title.toLowerCase().startsWith(q)?-1:0)).slice(0,10);results.innerHTML=hits.length?hits.map(x=>`<button type="button" data-go="${x.page}"${x.tool?` data-tool-target="${esc(x.tool)}"`:''}><span>${x.icon}</span><span class="home-search-copy"><b>${esc(x.title)}</b><small>${esc(pageLabel(x.page))}${TOOL_META[x.title]?.how?` · ${esc(TOOL_META[x.title].how)}`:''}</small></span><strong>→</strong></button>`).join(''):'<div class="home-search-empty">No matching tool found.</div>';results.hidden=false;return hits};
 homeSearch.addEventListener('input',showHomeSearch);
 homeSearch.addEventListener('keydown',e=>{if(e.key==='Enter'){const hits=showHomeSearch();if(hits[0])openTool(hits[0].page,hits[0].tool)}});
 $('#homeSearchGo').onclick=()=>{const hits=showHomeSearch();if(hits[0])openTool(hits[0].page,hits[0].tool);else homeSearch.focus()};
 $('#homeBrowse').onclick=()=>$('#homePrimaryTools').scrollIntoView({behavior:'smooth',block:'start'});
 $('#clearHistoryHome').onclick=clearHistory;
 document.addEventListener('click',e=>{if(!e.target.closest('.home-tool-search')&&results)results.hidden=true});
 updateHome();renderFavoriteHome();renderRecentHome();renderHistoryHome();
}
function updateHome(){renderFavoriteHome();renderRecentHome();renderHistoryHome()}
function cat(icon,title,desc,p,cls){return `<button class="category-card ${cls}" data-go="${p}"><span class="ico">${icon}</span><h3>${title}</h3><p>${desc}</p><b>→</b></button>`}
function srow(label,value,cls=''){return `<div class="status-row ${cls}"><i></i><span>${label}</span><span class="value">${value}</span></div>`}
function overallRisk(r){return r.some(x=>x.score===2)?'Alert':r.some(x=>x.score===1)?'Caution':'Normal'}

function renderLiveExperimental(){
 $('#live-experimental').innerHTML=`<div class="page-title experimental-page-title"><div><div class="eyebrow">MORE · EXPERIMENTAL</div><h1>Live & Experimental</h1><p>Live-data features are kept separate from the core calculators while they are tested and refined.</p></div></div>
 <div class="grid-2">
   <article class="panel experimental-card"><div class="panel-body"><span class="experimental-badge">EXPERIMENTAL</span><h2>Route Intelligence</h2><p>Route context using user-entered vessel limits, MET Norway forecast data and BarentsWatch AIS. This is a planning experiment, not approved navigation equipment or decision support.</p><div class="actions">${button('Open Route Intelligence','route-intelligence','btn primary')}</div></div></article>
   <article class="panel experimental-card"><div class="panel-body"><span class="experimental-badge">LIVE DATA</span><h2>AIS context</h2><p>AIS is currently used only inside Route Intelligence. It is intentionally not part of the main Marine Tools workflow.</p><div class="source-box"><div class="source-item"><span>Source</span><strong>BarentsWatch AIS</strong></div><div class="source-item"><span>Use</span><strong>Supporting context only</strong></div></div></div></article>
 </div>
 <article class="panel" style="margin-top:12px"><div class="panel-body"><h3>Why is this separate?</h3><p class="helper">Marine Tools is primarily a fast calculator and technical-helper collection. Live AIS and route analysis add more dependencies, data-age questions and operational interpretation, so they stay available without defining the main product.</p></div></article>`;
}

function renderRouteIntelligence(){
 $('#route-intelligence').innerHTML=`<div class="page-title"><div><div class="eyebrow">EXPERIMENTAL · LIVE ROUTE CONTEXT</div><h1>Route Intelligence</h1><p>Experimental planning context combining your active route, vessel limits, BarentsWatch forecast data and live AIS. It is not approved navigation information.</p><div class="notice mini-notice">This feature is intentionally separated from the core Marine Tools calculators while it is tested and refined.</div><a class="page-feedback-link" href="${reportIssueUrl('Route Intelligence')}">Report a problem →</a></div><div class="actions"><button class="btn primary" id="runAnalysis">Run analysis</button><button class="btn" id="clearRoute">Clear route</button></div></div>
 <div class="analysis-summary"><div class="metric"><small>Route distance</small><strong id="riDistance">—</strong></div><div class="metric"><small>AIS in corridor</small><strong id="riAis">—</strong></div><div class="metric"><small>CPA alerts</small><strong id="riCpa">—</strong></div><div class="metric"><small>Max Hs</small><strong id="riHs">—</strong></div><div class="metric"><small>Max wind</small><strong id="riWind">—</strong></div></div>
 <div class="grid-2"><article class="panel"><div class="panel-head"><h2>Route situation</h2><div class="legend"><span>Normal</span><span class="caution">Caution</span><span class="alert">Alert</span></div></div><div class="panel-body"><div class="map-toolbar"><button class="btn" id="fitRoute">Fit route</button><button class="btn" id="undoWp">Undo waypoint</button><span class="chip" id="riDataAge">NOT LOADED</span></div><div id="riMap" class="map"></div><p class="helper">Click the map to add waypoints. Dragging is intentionally not used here to reduce accidental edits. Route and vessel profile are stored only in this browser.</p></div></article>
 <div class="right-stack"><article class="panel"><div class="panel-head"><h3>Operational envelope</h3></div><div class="panel-body" id="envelopeBox"></div></article><article class="panel"><div class="panel-head"><h3>What changed?</h3><small>Since previous analysis</small></div><div class="panel-body change-list" id="changeBox"><span class="helper">Run an analysis twice to compare.</span></div></article><article class="panel"><div class="panel-head"><h3>Relevant AIS targets</h3></div><div class="panel-body" style="max-height:280px;overflow:auto"><table class="table"><thead><tr><th>Vessel</th><th>SOG</th><th>CPA</th><th>TCPA</th></tr></thead><tbody id="aisTable"></tbody></table></div></article></div></div>`;
 $('#runAnalysis').onclick=()=>runAnalysis(true);$('#clearRoute').onclick=()=>{state.route=[];store.set(K.route,[]);drawRoute();updateRiSummary();toast('Route cleared')};$('#fitRoute').onclick=fitRoute;$('#undoWp').onclick=()=>{state.route.pop();store.set(K.route,state.route);drawRoute();updateRiSummary()};renderEnvelope();updateRiSummary();
}
function initRouteMap(){if(state.map)return;const el=$('#riMap');if(!el)return;state.map=L.map(el,{zoomControl:true}).setView([59.2,10.5],7);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(state.map);L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenSeaMap'}).addTo(state.map);state.routeLayer=L.layerGroup().addTo(state.map);state.riskLayer=L.layerGroup().addTo(state.map);state.aisLayer=L.layerGroup().addTo(state.map);state.map.on('click',e=>{state.route.push({lat:+e.latlng.lat.toFixed(5),lon:+e.latlng.lng.toFixed(5),name:`WP${state.route.length+1}`});store.set(K.route,state.route);drawRoute();updateRiSummary()});drawRoute();fitRoute()}
function drawRoute(){if(!state.routeLayer)return;state.routeLayer.clearLayers();state.riskLayer.clearLayers();if(state.route.length){state.route.forEach((p,i)=>L.circleMarker([p.lat,p.lon],{radius:5,color:'#75ddff',fillColor:'#092a3c',fillOpacity:1,weight:2}).bindTooltip(p.name||`WP${i+1}`).addTo(state.routeLayer));if(state.route.length>1)L.polyline(state.route.map(p=>[p.lat,p.lon]),{color:'#39c5f3',weight:3,dashArray:'8 7'}).addTo(state.routeLayer)}drawRiskSegments()}
function fitRoute(){if(state.map&&state.route.length)state.map.fitBounds(L.latLngBounds(state.route.map(p=>[p.lat,p.lon])).pad(.18));}
function renderEnvelope(){const p=state.profile;$('#envelopeBox').innerHTML=`<div class="source-box"><div class="source-item"><span>Max Hs</span><b>${p.maxHs} m</b></div><div class="source-item"><span>Max wind</span><b>${p.maxWind} kn</b></div><div class="source-item"><span>Max current</span><b>${p.maxCurrent} kn</b></div><div class="source-item"><span>Min UKC</span><b>${p.minUKC} m</b></div><div class="source-item"><span>CPA alert</span><b>${p.cpaAlert} NM</b></div><div class="source-item"><span>AIS corridor</span><b>${p.corridor} NM</b></div></div><div class="actions">${button('Edit vessel profile','profile','btn')}</div>`}
function updateRiSummary(){const d=routeDistance(),corr=corridorTargets(),cpa=cpaTargets().filter(x=>x.cpa<state.profile.cpaAlert);const maxHs=Math.max(...state.forecast.map(x=>Number(x.hs)||0),0),maxW=Math.max(...state.forecast.map(x=>Number(x.windKn)||0),0);$('#riDistance')&&($('#riDistance').textContent=d?`${nf(d,1)} NM`:'—');$('#riAis')&&($('#riAis').textContent=state.ais.length?corr.length:'—');$('#riCpa')&&($('#riCpa').textContent=state.ais.length?cpa.length:'—');$('#riHs')&&($('#riHs').textContent=maxHs?`${nf(maxHs)} m`:'—');$('#riWind')&&($('#riWind').textContent=maxW?`${nf(maxW,0)} kn`:'—');renderAisTable();drawRiskSegments();}
function corridorTargets(){return state.ais.filter(v=>{const lat=Number(v.latitude??v.lat),lon=Number(v.longitude??v.lon);return Number.isFinite(lat)&&Number.isFinite(lon)&&distToRoute({lat,lon})<=state.profile.corridor})}
function cpaTargets(){if(state.route.length<2)return[];const own={lat:state.route[0].lat,lon:state.route[0].lon,sog:state.profile.serviceSpeed,cog:bearing(state.route[0],state.route[1])};return corridorTargets().map(v=>{const t={lat:Number(v.latitude??v.lat),lon:Number(v.longitude??v.lon),sog:Number(v.speedOverGround??v.sog)||0,cog:Number(v.courseOverGround??v.cog)||0};return{v,...cpaTcpa(own,t)}}).sort((a,b)=>a.cpa-b.cpa)}
function renderAisTable(){const tb=$('#aisTable');if(!tb)return;tb.innerHTML=cpaTargets().slice(0,20).map(x=>`<tr><td>${esc(x.v.name||x.v.shipName||String(x.v.mmsi||'Unknown'))}</td><td>${nf(x.v.speedOverGround??x.v.sog,1)}</td><td class="${x.cpa<state.profile.cpaAlert?'delta up':''}">${nf(x.cpa,2)}</td><td>${nf(x.tcpa,0)} min</td></tr>`).join('')||'<tr><td colspan="4" class="helper">No AIS targets loaded.</td></tr>'}
function drawAis(){if(!state.aisLayer)return;state.aisLayer.clearLayers();corridorTargets().forEach(v=>{const lat=Number(v.latitude??v.lat),lon=Number(v.longitude??v.lon),cog=Number(v.courseOverGround??v.cog)||0,sog=Number(v.speedOverGround??v.sog)||0;const cpa=cpaTargets().find(x=>x.v===v);const col=cpa&&cpa.cpa<state.profile.cpaAlert?'#ff625d':'#60d6ff';L.circleMarker([lat,lon],{radius:4,color:col,fillColor:col,fillOpacity:.75,weight:1}).bindPopup(`<b>${esc(v.name||v.shipName||'AIS target')}</b><br>MMSI ${esc(String(v.mmsi||'—'))}<br>SOG ${nf(sog)} kn · COG ${nf(cog,0)}°${cpa?`<br>CPA ${nf(cpa.cpa,2)} NM · TCPA ${nf(cpa.tcpa,0)} min`:''}`).addTo(state.aisLayer)})}
function drawRiskSegments(){if(!state.riskLayer||state.route.length<2||!state.forecast.length)return;state.riskLayer.clearLayers();for(let i=1;i<state.route.length;i++){const f=state.forecast[Math.round((i-1)*(state.forecast.length-1)/Math.max(1,state.route.length-2))]||{};const r=riskFor(f),col=r.score===2?'#ff625d':r.score===1?'#f2bf49':'#32d48a';L.polyline([[state.route[i-1].lat,state.route[i-1].lon],[state.route[i].lat,state.route[i].lon]],{color:col,weight:7,opacity:.72}).bindTooltip(`${r.label}${r.reasons.length?`: ${r.reasons.join(', ')}`:''}`).addTo(state.riskLayer)}}
async function runAnalysis(showToast=true){
 if(state.route.length<2){if(showToast)toast('Add at least two route waypoints first.');return}
 const box=routeBBox(state.route,Math.max(8,state.profile.corridor+2));
 sourceStatus('#riDataAge','warn','LOADING');
 const jobs=await Promise.allSettled([
   fetch(`${API}/api/ais/latest?minLat=${box.minLat}&maxLat=${box.maxLat}&minLon=${box.minLon}&maxLon=${box.maxLon}`,{cache:'no-store'}),
   fetch(`${API}/api/forecast?route=${encodeURIComponent(JSON.stringify(state.route))}`,{cache:'no-store'})
 ]);
 let aisOk=false,wxOk=false;
 try{if(jobs[0].status==='fulfilled'&&jobs[0].value.ok){const a=await jobs[0].value.json();state.ais=Array.isArray(a)?a:[];aisOk=true}}catch{}
 try{if(jobs[1].status==='fulfilled'&&jobs[1].value.ok){const w=await jobs[1].value.json();state.forecast=Array.isArray(w)?w:[];wxOk=true}}catch{}
 if(!aisOk&&!wxOk){sourceStatus('#riDataAge','bad','LIVE DATA ERROR');if(showToast)toast('Could not load experimental live data.');return}
 state.lastRefresh=nowUTC();state.lastRefreshAt=new Date().toISOString();
 sourceStatus('#riDataAge',aisOk&&wxOk?'ok':'warn',aisOk&&wxOk?'AIS + route forecast · just now':aisOk?'AIS loaded · forecast unavailable':'Forecast loaded · AIS unavailable');
 drawAis();updateRiSummary();compareAnalysis();updateLiveAgeIndicators();
 if(showToast)toast(aisOk&&wxOk?'Experimental route context updated.':'Partial live data loaded.');
}
function snapshot(){const cpa=cpaTargets().filter(x=>x.cpa<state.profile.cpaAlert).length;return{time:new Date().toISOString(),ais:corridorTargets().length,cpa,maxHs:Math.max(...state.forecast.map(x=>Number(x.hs)||0),0),maxWind:Math.max(...state.forecast.map(x=>Number(x.windKn)||0),0),maxCurrent:Math.max(...state.forecast.map(x=>Number(x.currentKn)||0),0)}}
function compareAnalysis(){const cur=snapshot(),old=store.get(K.lastAnalysis,null),box=$('#changeBox');if(box){if(!old)box.innerHTML='<span class="helper">Baseline saved. Run analysis again later to compare.</span>';else box.innerHTML=[['AIS targets',old.ais,cur.ais,''],['CPA alerts',old.cpa,cur.cpa,''],['Max Hs',old.maxHs,cur.maxHs,' m'],['Max wind',old.maxWind,cur.maxWind,' kn'],['Max current',old.maxCurrent,cur.maxCurrent,' kn']].map(([n,a,b,u])=>{const d=b-a,cls=d>0?'up':d<0?'down':'same';return `<div class="change-row"><span>${n}</span><b>${nf(a,n.includes('AIS')||n.includes('CPA')?0:1)} → ${nf(b,n.includes('AIS')||n.includes('CPA')?0:1)}${u}</b><span class="delta ${cls}">${d?`${d>0?'+':''}${nf(d,1)}`:'No change'}</span></div>`}).join('')}store.set(K.lastAnalysis,cur)}

function renderNavigation(){
 $('#navigation').innerHTML=pageTitle('Navigation','Everyday navigation calculations and route helpers. These tools supplement — never replace — approved navigation equipment.')+`<div class="tool-grid">
 ${card('Bearing, distance & destination','Great-circle distance, initial bearing and destination point.',`<div class="fields"><label>Lat A<input id="navLat1" type="number" step="any" value="59.42"></label><label>Lon A<input id="navLon1" type="number" step="any" value="10.48"></label><label>Lat B<input id="navLat2" type="number" step="any" value="58.97"></label><label>Lon B<input id="navLon2" type="number" step="any" value="5.73"></label></div>${calcButton('calcBearing')}${result('resBearing')}`)}
 ${card('Coordinate toolbox','Convert decimal degrees to degrees and decimal minutes (DDM) and DMS.',`<div class="fields"><label>Latitude<input id="coordLat" type="number" step="any" value="59.4213"></label><label>Longitude<input id="coordLon" type="number" step="any" value="10.4832"></label></div>${calcButton('calcCoords')}${result('resCoords')}`)}
 ${card('Current-corrected ETA','Estimate speed over ground and ETA using a current component along the course.',`<div class="fields"><label>Distance NM<input id="etaDist" type="number" value="120"></label><label>Speed through water kn<input id="etaStw" type="number" value="8"></label><label>Current component kn<input id="etaCur" type="number" step=".1" value="0.5"></label></div>${calcButton('calcEta')}${result('resEta')}`)}
 ${card('Wind component','Resolve wind into head/tailwind and crosswind relative to vessel course.',`<div class="fields"><label>Course °T<input id="windCourse" type="number" value="90"></label><label>Wind from °T<input id="windDir" type="number" value="230"></label><label>Wind speed kn<input id="windSpeed" type="number" value="20"></label></div>${calcButton('calcWindComp')}${result('resWindComp')}`)}
 ${card('Closest point on active route','Check how far a coordinate lies from the active route.',`<div class="fields"><label>Latitude<input id="nearLat" type="number" step="any"></label><label>Longitude<input id="nearLon" type="number" step="any"></label></div>${calcButton('calcNearest')}${result('resNearest')}`)}


 ${card('Set & drift','Combine through-water motion and current to estimate COG and SOG.',`<div class="fields"><label>Heading / course through water °T<input id="sdCourse" type="number" value="90"></label><label>Speed through water kn<input id="sdStw" type="number" step=".1" value="8"></label><label>Current set to °T<input id="sdSet" type="number" value="30"></label><label>Current drift kn<input id="sdDrift" type="number" step=".1" value="1.2"></label></div>${calcButton('calcSetDrift')}${result('resSetDrift')}`)}

 ${card('Great circle vs rhumb line','Compare great-circle and rhumb-line distance and initial course.',`<div class="fields"><label>Lat A<input id="gcLat1" type="number" step="any" value="59.42"></label><label>Lon A<input id="gcLon1" type="number" step="any" value="10.48"></label><label>Lat B<input id="gcLat2" type="number" step="any" value="58.97"></label><label>Lon B<input id="gcLon2" type="number" step="any" value="5.73"></label></div>${calcButton('calcGcRhumb','Compare')}${result('resGcRhumb')}${formulaBox('Formula & assumptions','Great-circle uses a spherical Earth haversine distance and initial bearing. Rhumb line uses Mercator sailing with constant course. For official passage planning, use approved chart/ECDIS methods and vessel procedures.')}`)}
 ${card('True / apparent wind','Convert apparent wind at the vessel into estimated true wind.',`<div class="fields"><label>Vessel course °T<input id="twCourse" type="number" value="90"></label><label>Vessel speed kn<input id="twShip" type="number" step=".1" value="8"></label><label>Apparent wind from ° relative<input id="twRel" type="number" value="30"></label><label>Apparent wind speed kn<input id="twAws" type="number" step=".1" value="20"></label></div>${calcButton('calcTrueWind')}${result('resTrueWind')}${formulaBox('Formula & assumptions','Relative direction is entered clockwise from the bow: 0° = ahead, 90° = starboard, 180° = astern. The calculation vector-adds vessel velocity to apparent-wind velocity. It assumes steady speed/course and ignores sensor corrections, heel, leeway and vertical wind components.')}`)}
 ${card('Passage scenario compare','Compare time and fuel at several planned speeds.',`<div class="fields three"><label>Distance NM<input id="scDist" type="number" step=".1" value="120"></label><label>Fuel at reference speed m³/day<input id="scFuel" type="number" step=".1" value="4"></label><label>Reference speed kn<input id="scRef" type="number" step=".1" value="8"></label></div><div class="mini-section"><b>Speeds to compare</b><div id="scSpeedRows" class="dynamic-list"><div class="dynamic-row simple-row"><label>Speed kn<input class="sc-speed" type="number" step=".1" value="6"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row simple-row"><label>Speed kn<input class="sc-speed" type="number" step=".1" value="8"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row simple-row"><label>Speed kn<input class="sc-speed" type="number" step=".1" value="10"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addScSpeed">+ Add speed</button></div>${calcButton('calcScenarios','Compare scenarios')}${result('resScenarios')}`)}

 ${card('Route fuel estimate','Estimate passage time and fuel from the active route and vessel profile.',`${result('resRouteFuel','Optional: create a route under Live & Experimental and a vessel profile.')}${calcButton('calcRouteFuel','Update estimate')}`)}
 </div>`;
 bindNavigation();
}
function bindNavigation(){
 $('#calcBearing').onclick=()=>{const a={lat:+$('#navLat1').value,lon:+$('#navLon1').value},b={lat:+$('#navLat2').value,lon:+$('#navLon2').value},d=hav(a,b),br=bearing(a,b),dest=destination(a,br,d);setRes('resBearing',`${nf(d,2)} NM · ${nf(br,1)}°T`,`Destination check: ${nf(dest.lat,5)}, ${nf(dest.lon,5)}`)};
 $('#calcCoords').onclick=()=>{const la=+$('#coordLat').value,lo=+$('#coordLon').value;setRes('resCoords',`${toDDM(la,true)} · ${toDDM(lo,false)}`,`${toDMS(la,true)} · ${toDMS(lo,false)}`)};
 $('#calcEta').onclick=()=>{const d=+$('#etaDist').value,s=+$('#etaStw').value,c=+$('#etaCur').value,sog=s+c,h=d/Math.max(.01,sog);setRes('resEta',`${nf(sog,2)} kn SOG · ${formatHours(h)}`,`Assumes constant current component over ${d} NM.`)};
 $('#calcWindComp').onclick=()=>{const c=rad(+$('#windCourse').value),from=rad(+$('#windDir').value),s=+$('#windSpeed').value;const rel=from-c,head=-s*Math.cos(rel),cross=s*Math.sin(rel);setRes('resWindComp',`${head>=0?'Headwind':'Tailwind'} ${nf(Math.abs(head),1)} kn`,`Crosswind ${nf(Math.abs(cross),1)} kn from ${cross>0?'starboard':'port'}.`)};
 $('#calcNearest').onclick=()=>{if(state.route.length<2)return setRes('resNearest','No active route','Add at least two route waypoints first.','caution');const p={lat:+$('#nearLat').value,lon:+$('#nearLon').value},d=distToRoute(p);setRes('resNearest',`${nf(d,2)} NM from route`,d<=state.profile.corridor?'Inside configured AIS corridor.':'Outside configured AIS corridor.');};


 $('#calcSetDrift').onclick=()=>{const c=rad(+$('#sdCourse').value),stw=+$('#sdStw').value,set=rad(+$('#sdSet').value),dr=+$('#sdDrift').value;if(stw<0||dr<0)return setRes('resSetDrift','Check speed inputs.','','caution');const x=stw*Math.sin(c)+dr*Math.sin(set),y=stw*Math.cos(c)+dr*Math.cos(set),sog=Math.hypot(x,y),cog=(deg(Math.atan2(x,y))+360)%360;setRes('resSetDrift',`${nf(cog,1)}°T COG · ${nf(sog,2)} kn SOG`,`Current ${nf(dr,1)} kn set to ${nf(+$('#sdSet').value,0)}°T.`)};

 $('#calcGcRhumb').onclick=()=>{const a={lat:+$('#gcLat1').value,lon:+$('#gcLon1').value},b={lat:+$('#gcLat2').value,lon:+$('#gcLon2').value},gc=hav(a,b),gb=bearing(a,b),rh=rhumb(a,b),diff=rh.distance-gc;setRes('resGcRhumb',`GC ${nf(gc,2)} NM · ${nf(gb,1)}°T`,`Rhumb ${nf(rh.distance,2)} NM · ${nf(rh.bearing,1)}°T · distance difference ${nf(diff,2)} NM.`)};
 $('#calcTrueWind').onclick=()=>{const c=rad(+$('#twCourse').value),vs=+$('#twShip').value,rel=rad(+$('#twRel').value),aws=+$('#twAws').value;const appFrom=c+rel,appTo=appFrom+Math.PI;const ax=aws*Math.sin(appTo),ay=aws*Math.cos(appTo),vx=vs*Math.sin(c),vy=vs*Math.cos(c),tx=ax+vx,ty=ay+vy,tws=Math.hypot(tx,ty),to=Math.atan2(tx,ty),from=(deg(to+Math.PI)+360)%360;setRes('resTrueWind',`${nf(tws,1)} kn from ${nf(from,0)}°T`,`Calculated from apparent wind ${nf(aws,1)} kn at ${nf(+$('#twRel').value,0)}° relative and vessel ${nf(vs,1)} kn / ${nf(+$('#twCourse').value,0)}°T.`)};
 const scRows=$('#scSpeedRows');
 $('#addScSpeed').onclick=()=>scRows.insertAdjacentHTML('beforeend','<div class="dynamic-row simple-row"><label>Speed kn<input class="sc-speed" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 scRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.dynamic-row',scRows).length>2)e.target.closest('.dynamic-row').remove()});
 $('#calcScenarios').onclick=()=>{const d=+$('#scDist').value,base=+$('#scFuel').value,ref=+$('#scRef').value,speeds=$$('.sc-speed',scRows).map(x=>+x.value).filter(x=>x>0&&Number.isFinite(x)).slice(0,8);if(!speeds.length)return setRes('resScenarios','Enter one or more speeds.','','caution');const rows=speeds.map(s=>{const h=d/s,day=base*Math.pow(s/ref,3),fuel=day*h/24;return `<tr><td>${nf(s,1)} kn</td><td>${formatHours(h)}</td><td>${nf(day,2)} m³/day</td><td>${nf(fuel,2)} m³</td></tr>`}).join('');$('#resScenarios').className='result';$('#resScenarios').innerHTML=`<strong>Scenario comparison</strong><div class="table-wrap"><table class="table compact"><thead><tr><th>Speed</th><th>Time</th><th>Modelled rate</th><th>Fuel</th></tr></thead><tbody>${rows}</tbody></table></div><small>Simple cubic speed/fuel model for comparison only.</small>`};

 $('#calcRouteFuel').onclick=()=>updateRouteFuel();updateRouteFuel();
}
function updateRouteFuel(){const d=routeDistance(),s=state.profile.serviceSpeed||0,h=d/Math.max(.01,s),f=h/24*(state.profile.fuelDay||0);setRes('resRouteFuel',d?`${nf(d,1)} NM · ${formatHours(h)} · ${nf(f,2)} m³`:'No active route',d?'Uses service speed and daily fuel consumption from Vessel Profile.':'Create an experimental route under Live & Experimental.');}
function toDDM(v,lat){const h=lat?(v>=0?'N':'S'):(v>=0?'E':'W'),a=Math.abs(v),d=Math.floor(a),m=(a-d)*60;return `${d}° ${m.toFixed(3)}' ${h}`}
function toDMS(v,lat){const h=lat?(v>=0?'N':'S'):(v>=0?'E':'W'),a=Math.abs(v),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf),s=(mf-m)*60;return `${d}° ${m}' ${s.toFixed(1)}\" ${h}`}
function formatHours(h){if(!Number.isFinite(h))return'—';return `${Math.floor(h)} h ${Math.round((h%1)*60)} min`}

function renderWeather(){
 $('#weather').innerHTML=pageTitle('Weather','Point weather and sea forecast from MET Norway, plus manual weather-planning helpers.')+`
 <div class="grid-2">
  <article class="panel weather-live-panel"><div class="panel-head"><div><h2>Point forecast</h2><small>MET Norway Locationforecast + Oceanforecast</small></div><div id="wxStatus" class="source-status"><span class="chip">Not loaded</span></div></div><div class="panel-body">
   <p class="tool-how"><b>How to use</b><span>Enter a latitude and longitude, then load the next forecast periods. Weather and sea data are fetched independently of Route Intelligence.</span></p>
   <div class="fields"><label>Latitude<input id="wxLat" type="number" step="any" value="59.42"></label><label>Longitude<input id="wxLon" type="number" step="any" value="10.48"></label></div>
   <div class="actions"><button class="btn primary" id="loadPointWx">Load forecast</button><button class="btn" id="useRouteWx">Use route start</button></div>
   <div class="weather-summary" id="wxSummary"><div class="weather-metric"><span>Wind</span><strong>—</strong><small>Load forecast</small></div><div class="weather-metric"><span>Waves</span><strong>—</strong><small>Significant Hs</small></div><div class="weather-metric"><span>Current</span><strong>—</strong><small>Surface current</small></div></div>
   <div class="table-wrap weather-table-wrap"><table class="table weather-forecast-table"><thead><tr><th>Time</th><th>Hs</th><th>Wind</th><th>Current</th><th>Air / weather</th><th>Status</th></tr></thead><tbody id="wxPointTable"><tr><td colspan="6" class="helper">Enter a position and load the forecast.</td></tr></tbody></table></div>
   <div id="wxDiagnostics" class="helper" style="margin-top:8px"></div>
   <div class="notice mini-notice">Forecast data is supporting context only. Check source time, official MET Norway forecasts and vessel-specific limits before operational use.</div>
  </div></article>
  <article class="panel tool-card" data-tool-title="Weather window finder"><button class="fav-toggle" type="button" data-fav-title="Weather window finder">☆</button><div class="tool-card-head"><div><h3>Weather window finder</h3><p>Find consecutive manual forecast rows that stay inside your chosen limits.</p></div></div><div id="windowRows" class="dynamic-list"><div class="dynamic-row weather-row"><label>Time<input class="ww-time" type="time" value="08:00"></label><label>Hs m<input class="ww-hs" type="number" step=".1" value="1.2"></label><label>Wind kn<input class="ww-wind" type="number" step=".1" value="18"></label><label>Current kn<input class="ww-current" type="number" step=".1" value=".6"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row weather-row"><label>Time<input class="ww-time" type="time" value="09:00"></label><label>Hs m<input class="ww-hs" type="number" step=".1" value="1.4"></label><label>Wind kn<input class="ww-wind" type="number" step=".1" value="20"></label><label>Current kn<input class="ww-current" type="number" step=".1" value=".7"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row weather-row"><label>Time<input class="ww-time" type="time" value="10:00"></label><label>Hs m<input class="ww-hs" type="number" step=".1" value="2.2"></label><label>Wind kn<input class="ww-wind" type="number" step=".1" value="25"></label><label>Current kn<input class="ww-current" type="number" step=".1" value=".8"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addWindowRow">+ Add forecast row</button><div class="fields three"><label>Max Hs<input id="wwHs" type="number" step=".1" value="2.5"></label><label>Max wind<input id="wwWind" type="number" value="28"></label><label>Max current<input id="wwCur" type="number" step=".1" value="1.5"></label></div>${calcButton('findWindow','Find windows')}${result('wwResult')}<details class="tool-details"><summary>Guidance & details</summary><div class="tool-details-inner">${toolUsage('Weather window finder')}${toolInformation('Weather window finder','Find consecutive manual forecast rows that stay inside your chosen limits.')}${reportIssueLink('Weather window finder')}</div></details></article>
 </div>
 <div class="tool-grid" style="margin-top:12px">
 ${card('Wave encounter period','Estimate the wave period experienced by a moving vessel in deep water.',`<div class="fields"><label>Vessel course °T<input id="weCourse" type="number" value="90"></label><label>Vessel speed kn<input id="weSpeed" type="number" step=".1" value="8"></label><label>Wave from °T<input id="weFrom" type="number" value="270"></label><label>Wave period s<input id="wePeriod" type="number" step=".1" value="8"></label></div>${calcButton('calcEncounter')}${result('resEncounter')}`)}
 </div>`;
 $('#loadPointWx').onclick=loadPointWeather;
 $('#useRouteWx').onclick=()=>{if(!state.route.length)return toast('No experimental route saved on this device.');$('#wxLat').value=state.route[0].lat;$('#wxLon').value=state.route[0].lon;loadPointWeather()};
 const windowRows=$('#windowRows');
 $('#addWindowRow').onclick=()=>windowRows.insertAdjacentHTML('beforeend','<div class="dynamic-row weather-row"><label>Time<input class="ww-time" type="time"></label><label>Hs m<input class="ww-hs" type="number" step=".1"></label><label>Wind kn<input class="ww-wind" type="number" step=".1"></label><label>Current kn<input class="ww-current" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 windowRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.weather-row',windowRows).length>2)e.target.closest('.weather-row').remove()});
 $('#findWindow').onclick=findWeatherWindow;$('#calcEncounter').onclick=calcWaveEncounter;
 const cw=store.get(K.weatherCache,null);
 if(cw&&Array.isArray(cw.forecast)&&cw.forecast.length){
   if(Number.isFinite(Number(cw.lat)))$('#wxLat').value=cw.lat;
   if(Number.isFinite(Number(cw.lon)))$('#wxLon').value=cw.lon;
   $('#wxDiagnostics').textContent=`Cached forecast · saved ${cw.fetchedAt?forecastTimeLabel(cw.fetchedAt):'previously'} · load again when online for fresh data.`;
 }
 renderPointWeather();syncFavoriteButtons();
}
function forecastTimeLabel(v){if(!v)return'—';const d=new Date(v);if(!Number.isFinite(d.getTime()))return esc(v);return `${d.toISOString().slice(5,16).replace('T',' ')} UTC`}
function weatherLabel(code){
 if(!code)return'—';
 return String(code).replace(/_(day|night|polartwilight)$/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
}
function renderPointWeather(){
 const tb=$('#wxPointTable');if(!tb)return;const rows=Array.isArray(state.weather)?state.weather:[];const first=rows.find(f=>[f.hs,f.windKn,f.currentKn,f.airTemp].some(v=>v!=null&&Number.isFinite(Number(v))))||null;const sum=$('#wxSummary');if(sum){const wind=first?.windKn==null?'—':`${nf(first.windKn,0)} kn`,waves=first?.hs==null?'—':`${nf(first.hs,1)} m`,cur=first?.currentKn==null?'—':`${nf(first.currentKn,1)} kn`,wd=first?.windDirection==null?'Forecast wind':`${nf(first.windDirection,0)}° from`,cd=first?.currentDirection==null?'Surface current':`${nf(first.currentDirection,0)}° to`;sum.innerHTML=`<div class="weather-metric"><span>Wind</span><strong>${wind}</strong><small>${wd}</small></div><div class="weather-metric"><span>Waves</span><strong>${waves}</strong><small>Significant Hs</small></div><div class="weather-metric"><span>Current</span><strong>${cur}</strong><small>${cd}</small></div>`}tb.innerHTML=rows.length?rows.map(f=>{const hasData=[f.hs,f.windKn,f.currentKn,f.airTemp].some(v=>v!=null&&Number.isFinite(Number(v))),r=hasData?riskFor(f):{score:1,label:'No data'},air=f.airTemp==null?'—':`${nf(f.airTemp,1)}°C`,wx=weatherLabel(f.symbolCode),precip=f.precipitation==null?'':` · ${nf(f.precipitation,1)} mm`;return `<tr><td data-label="Time">${forecastTimeLabel(f.forecastTime||f.time)}</td><td data-label="Hs">${f.hs==null?'—':nf(f.hs,1)+' m'}</td><td data-label="Wind">${f.windKn==null?'—':nf(f.windKn,0)+' kn'}</td><td data-label="Current">${f.currentKn==null?'—':nf(f.currentKn,1)+' kn'}</td><td data-label="Air / weather">${air}${wx==='—'?'':` · ${esc(wx)}`}${precip}</td><td data-label="Status"><span class="chip ${r.score===2?'bad':r.score===1?'warn':'ok'}">${r.label}</span></td></tr>`}).join(''):'<tr><td colspan="6" class="helper">Enter a position and load the forecast.</td></tr>';updateLiveAgeIndicators();}
async function loadPointWeather(){
 const lat=+$('#wxLat').value,lon=+$('#wxLon').value,tb=$('#wxPointTable'),diag=$('#wxDiagnostics');
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180){sourceStatus('#wxStatus','bad','CHECK POSITION');return}
 sourceStatus('#wxStatus','warn','LOADING');tb.innerHTML='<tr><td colspan="6" class="helper">Loading MET Norway forecast…</td></tr>';diag.textContent='';
 try{
   const r=await fetch(`${API}/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&limit=12`,{cache:'no-store'}),text=await r.text();
   let j;try{j=JSON.parse(text)}catch{j={error:text||`HTTP ${r.status}`}}
   if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);
   state.weather=Array.isArray(j.forecast)?j.forecast:[];state.weatherFetchedAt=new Date().toISOString();store.set(K.weatherCache,{lat,lon,forecast:state.weather,fetchedAt:state.weatherFetchedAt,diagnostics:j.diagnostics||null});
   const d=j.diagnostics||{};
   const parts=[
     `weather: ${d.location?.ok?'ok':d.location?.status||'unavailable'}`,
     `ocean: ${d.ocean?.ok?'ok':d.ocean?.status||'unavailable'}`
   ];
   diag.textContent=`MET Norway · ${parts.join(' · ')} · updated ${new Date().toISOString().slice(11,16)} UTC`;
   const usable=state.weather.some(f=>[f.hs,f.windKn,f.currentKn,f.airTemp].some(v=>v!=null&&Number.isFinite(Number(v))));
   if(state.weather.length&&usable){sourceStatus('#wxStatus','ok','FORECAST LOADED');renderPointWeather()}
   else if(state.weather.length){sourceStatus('#wxStatus','warn','NO VALUES');renderPointWeather()}
   else{sourceStatus('#wxStatus','warn','NO USABLE DATA');tb.innerHTML='<tr><td colspan="6" class="helper">MET Norway returned no usable forecast rows for this position.</td></tr>'}
 }catch(e){
   const cw=store.get(K.weatherCache,null);
   if(cw&&Array.isArray(cw.forecast)&&cw.forecast.length){
     state.weather=cw.forecast;state.weatherFetchedAt=cw.fetchedAt||null;renderPointWeather();
     sourceStatus('#wxStatus','warn','CACHED FORECAST');
     diag.textContent=`Offline/live request unavailable — showing the last forecast saved on this device${cw.fetchedAt?` from ${forecastTimeLabel(cw.fetchedAt)}`:''}.`;
   }else{
     state.weather=[];sourceStatus('#wxStatus','bad','FORECAST ERROR');
     tb.innerHTML=`<tr><td colspan="6" class="helper">Could not load forecast: ${esc(e.message)}</td></tr>`;
     diag.textContent='Check the live API status or try another position.';
   }
 }
}
function findWeatherWindow(){const rows=$$('.weather-row',$('#windowRows')).map(r=>({t:$('.ww-time',r).value,hs:+$('.ww-hs',r).value,w:+$('.ww-wind',r).value,c:+$('.ww-current',r).value})).filter(x=>x.t&&[x.hs,x.w,x.c].every(Number.isFinite));const lim={hs:+$('#wwHs').value,w:+$('#wwWind').value,c:+$('#wwCur').value};let groups=[],cur=[];for(const r of rows){if(r.hs<=lim.hs&&r.w<=lim.w&&r.c<=lim.c)cur.push(r);else if(cur.length){groups.push(cur);cur=[]}}if(cur.length)groups.push(cur);const txt=groups.length?groups.map(g=>`${g[0].t} → ${g[g.length-1].t} (${g.length} consecutive row${g.length>1?'s':''})`).join('<br>'):'No matching window in the supplied rows.';setRes('wwResult',txt,'Manual planning aid — verify against official forecasts.')}


function calcWaveEncounter(){
 const course=rad(+$('#weCourse').value),speed=+$('#weSpeed').value*0.514444,from=+$('#weFrom').value,period=+$('#wePeriod').value;
 if(!(period>0&&speed>=0))return setRes('resEncounter','Check period and speed.','','caution');
 const g=9.80665,w=2*Math.PI/period,k=w*w/g,waveTo=rad((from+180)%360),rel=course-waveTo;
 const we=w-k*speed*Math.cos(rel),te=2*Math.PI/Math.max(.00001,Math.abs(we));
 const note=Math.abs(we)<0.08?'Encounter frequency is close to zero; small input changes can cause a very large period.':'Deep-water regular-wave estimate.';
 setRes('resEncounter',`${nf(te,2)} s encounter period`,note,Math.abs(we)<0.08?'caution':'');
}


function renderFuel(){
 $('#fuel').innerHTML=pageTitle('Fuel & Bunkering','Practical fuel, endurance and bunkering helpers with straightforward inputs.')+`
 <article class="panel tool-selector"><div class="panel-body"><label>Show tools<select id="fuelView"><option value="everyday">Everyday fuel & bunkering</option><option value="reporting">Consumption & reporting</option><option value="planning">Performance & planning</option><option value="advanced">Advanced fuel calculations</option><option value="all">Show all</option></select></label><p class="helper">Start with the everyday tools. More specialised calculations are still available from the dropdown.</p></div></article>
 <div class="tool-grid">
 ${card('Daily consumption & reporting','Track fuel, urea or lube-oil consumption locally, compare recent averages and export a clean CSV.',`
  <div class="consumption-local-note"><span>LOCAL-FIRST</span><small>Saved only in this browser unless you export it.</small></div>
  <div class="fields three">
   <label>Product<select id="consProduct"><option value="Fuel">Fuel</option><option value="Urea">Urea solution</option><option value="Lube oil">Lube oil</option></select></label>
   <label>Date<input id="consDate" type="date"></label>
   <label>Entry mode<select id="consMode"><option value="difference">Reading difference</option><option value="direct">Direct consumed / added amount</option></select></label>
  </div>
  <div id="consDifferenceWrap" class="fields">
   <label>Previous reading<input id="consPrevious" type="number" step=".001" placeholder="e.g. 1245.6"></label>
   <label>Current reading<input id="consCurrent" type="number" step=".001" placeholder="e.g. 1252.9"></label>
  </div>
  <div id="consDirectWrap" hidden><label>Consumed / added amount<input id="consDirect" type="number" step=".001" placeholder="e.g. 7.3"></label></div>
  <div class="fields three">
   <label>Reading / amount unit<select id="consUnit"><option value="m3">m³</option><option value="L">litres</option></select></label>
   <label>Density kg/m³<input id="consDensity" type="number" step=".1" value="840"></label>
   <label>Running hours in period <span class="optional">optional</span><input id="consHours" type="number" step=".1" placeholder="e.g. 22.4"></label>
  </div>
  <div class="actions consumption-actions">
   <button class="btn primary" id="calcConsumption">Calculate</button>
   <button class="btn" id="saveConsumption">Save entry</button>
   <button class="btn" id="copyConsumption">Copy summary</button>
   <button class="btn" id="exportConsumption">Export CSV</button>
  </div>
  ${result('resConsumption')}
  <div class="consumption-history">
   <div class="history-toolbar"><div><b>Saved consumption</b><small>Local history for trend and reporting support.</small></div><label>Show<select id="consHistoryFilter"><option>Fuel</option><option>Urea solution</option><option>Lube oil</option><option value="all">All products</option></select></label></div>
   <div id="consSummary" class="history-summary"></div>
   <div class="table-wrap"><table class="table compact data-history-table"><thead><tr><th>Date</th><th>Product</th><th>Volume</th><th>Mass</th><th>Hours</th><th>Rate</th><th></th></tr></thead><tbody id="consHistoryRows"></tbody></table></div>
  </div>
 `)}
 ${groupedCard('everyday','Fuel ROB & endurance','Estimate usable ROB and endurance after reserve.',`<div class="fields"><label>ROB m³<input id="rob" type="number" step=".1" value="38"></label><label>Consumption m³/day<input id="robDay" type="number" step=".1" value="4.2"></label><label>Reserve %<input id="robRes" type="number" value="20"></label></div>${calcButton('calcRob')}${result('resRob')}`)}

 ${groupedCard('planning','Endurance scenario compare','Compare endurance at several possible daily consumption rates.',`<div class="fields"><label>ROB m³<input id="endRob" type="number" step=".1" value="38"></label><label>Reserve %<input id="endReserve" type="number" value="20"></label></div><div class="mini-section"><b>Consumption scenarios</b><div id="endScenarioRows" class="dynamic-list"><div class="dynamic-row simple-row end-row"><label>Consumption m³/day<input class="end-rate" type="number" step=".1" value="3.5"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row simple-row end-row"><label>Consumption m³/day<input class="end-rate" type="number" step=".1" value="4.2"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row simple-row end-row"><label>Consumption m³/day<input class="end-rate" type="number" step=".1" value="5.0"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addEndRate">+ Add scenario</button></div>${calcButton('calcEndCompare','Compare endurance')}${result('resEndCompare')}`)}

 ${groupedCard('planning','Fuel consumption by speed','Interpolate between your own measured speed and consumption points.',`<div id="speedFuelRows" class="dynamic-list"><div class="dynamic-row speed-row"><label>Speed kn<input class="sf-speed" type="number" step=".1" value="6"></label><label>Consumption m³/day<input class="sf-cons" type="number" step=".1" value="2.1"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row speed-row"><label>Speed kn<input class="sf-speed" type="number" step=".1" value="8"></label><label>Consumption m³/day<input class="sf-cons" type="number" step=".1" value="3.4"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row speed-row"><label>Speed kn<input class="sf-speed" type="number" step=".1" value="10"></label><label>Consumption m³/day<input class="sf-cons" type="number" step=".1" value="5.8"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addSpeedFuel">+ Add measured point</button><label>Target speed kn<input id="targetSpeed" type="number" step=".1" value="9"></label>${calcButton('calcSpeedFuel')}${result('resSpeedFuel')}`)}

 ${groupedCard('advanced','Fuel temperature correction','Correct a supplied volume between temperatures using a user-supplied expansion coefficient.',`<div class="fields"><label>Volume at observed temp m³<input id="fuelVol" type="number" step=".01" value="30"></label><label>Density kg/m³<input id="fuelDensity" type="number" step=".1" value="839.3"></label><label>Observed temp °C<input id="fuelTemp" type="number" value="20"></label><label>Reference temp °C<input id="fuelRef" type="number" value="15"></label><label>Expansion coefficient /°C<input id="fuelAlpha" type="number" step=".00001" value="0.00083"></label></div>${calcButton('calcFuelDensity')}${result('resFuelDensity')}`)}

 ${groupedCard('everyday','Tank transfer','Estimate receiving-tank final volume, fill percentage and transfer time.',`<div class="fields"><label>Receiving tank capacity m³<input id="tankCap" type="number" value="20"></label><label>Current volume m³<input id="tankNow" type="number" value="8"></label><label>Transfer volume m³<input id="tankMove" type="number" value="6"></label><label>Pump rate m³/h<input id="tankRate" type="number" value="12"></label></div>${calcButton('calcTransfer')}${result('resTransfer')}`)}

 ${groupedCard('planning','Fuel blending','Blend two fuels by volume and estimate resulting density and sulphur content.',`<div class="subgroup"><h4>Fuel A</h4><div class="fields three"><label>Volume m³<input id="blendVA" type="number" step=".1" value="20"></label><label>Density kg/m³<input id="blendDA" type="number" step=".1" value="840"></label><label>Sulphur % m/m<input id="blendSA" type="number" step=".001" value=".10"></label></div></div><div class="subgroup"><h4>Fuel B</h4><div class="fields three"><label>Volume m³<input id="blendVB" type="number" step=".1" value="10"></label><label>Density kg/m³<input id="blendDB" type="number" step=".1" value="890"></label><label>Sulphur % m/m<input id="blendSB" type="number" step=".001" value=".50"></label></div></div>${calcButton('calcBlend')}${result('resBlend')}`)}

 ${groupedCard('everyday','Fuel / Urea converter','Convert fuel, urea solution or another liquid between volume and mass.',`<div class="fields"><label>Product<select id="fuProduct"><option>Fuel</option><option>Urea solution</option><option>Other liquid</option></select></label><label>I have<select id="fuMode"><option value="v2m">Volume</option><option value="m2v">Mass</option></select></label><label><span id="fuAmountText">Volume m³</span><input id="fuAmount" type="number" step=".001" value="10"></label><label>Product density kg/m³<input id="fuDensity" type="number" step=".1" value="840"></label></div><p class="helper">Use density from the BDN, SDS or product documentation at the relevant temperature.</p>${calcButton('calcFuelUrea')}${result('resFuelUrea')}`)}

 ${groupedCard('reporting','Bunkering history & export','Keep a simple local history of bunkerings and export it to CSV when needed.',`
   <div class="fields three"><label>Date<input id="bhDate" type="date"></label><label>Grade / product<input id="bhGrade" type="text" placeholder="e.g. EN590 / MDO"></label><label>Volume m³<input id="bhVolume" type="number" step=".01"></label><label>Density kg/m³<input id="bhDensity" type="number" step=".1"></label></div>
   <div class="actions"><button class="btn primary" id="saveBunkHistory">Save bunkering</button><button class="btn" id="exportBunkHistory">Export CSV</button></div>
   <div id="bunkHistorySummary" class="history-summary"></div>
   <div class="table-wrap"><table class="table compact data-history-table"><thead><tr><th>Date</th><th>Grade</th><th>Volume</th><th>Density</th><th>Mass</th><th></th></tr></thead><tbody id="bunkHistoryRows"></tbody></table></div>
 `)}

 ${groupedCard('everyday','Bunkering overview','Summarise previous bunkerings with total volume/mass, weighted density and average interval.',`<div id="bunkRows" class="dynamic-list"><div class="dynamic-row bunk-row"><label>Date<input class="bunk-date" type="date" value="2026-07-01"></label><label>Volume m³<input class="bunk-vol" type="number" step=".01" value="25"></label><label>Density kg/m³<input class="bunk-dens" type="number" step=".1" value="839"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row bunk-row"><label>Date<input class="bunk-date" type="date" value="2026-08-03"></label><label>Volume m³<input class="bunk-vol" type="number" step=".01" value="31.5"></label><label>Density kg/m³<input class="bunk-dens" type="number" step=".1" value="841.2"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row bunk-row"><label>Date<input class="bunk-date" type="date" value="2026-09-10"></label><label>Volume m³<input class="bunk-vol" type="number" step=".01" value="28"></label><label>Density kg/m³<input class="bunk-dens" type="number" step=".1" value="840.1"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addBunkRow">+ Add bunkering</button>${calcButton('calcBunkOverview','Analyse bunkerings')}${result('resBunkOverview')}`)}

 ${groupedCard('everyday','Route fuel estimate','Use active route and vessel profile.',`${result('fuelRouteRes')}${calcButton('fuelRouteBtn','Update')}`)}
 </div>`;bindFuel();
}
function consumptionHistory(){return store.get(K.consumption,[])||[]}
function bunkeringHistory(){return store.get(K.bunkHistory,[])||[]}
let consumptionDraft=null;

function consumptionDefaults(product){
 return product==='Urea solution'?{density:1090,unit:'m3'}:product==='Lube oil'?{density:880,unit:'L'}:{density:840,unit:'m3'}
}
function calculateConsumptionDraft(showResult=true){
 const product=$('#consProduct')?.value||'Fuel',date=$('#consDate')?.value,mode=$('#consMode')?.value||'difference',unit=$('#consUnit')?.value||'m3';
 const density=+$('#consDensity')?.value,hours=+$('#consHours')?.value||0;
 let amount;
 if(mode==='difference'){
   const prev=+$('#consPrevious')?.value,cur=+$('#consCurrent')?.value;
   if(!Number.isFinite(prev)||!Number.isFinite(cur)||cur<prev){if(showResult)setRes('resConsumption','Check previous and current readings.','Current reading must be equal to or above the previous reading.','caution');return null}
   amount=cur-prev;
 }else{
   amount=+$('#consDirect')?.value;
   if(!Number.isFinite(amount)||amount<0){if(showResult)setRes('resConsumption','Check consumed / added amount.','','caution');return null}
 }
 if(!date||!(density>0)){if(showResult)setRes('resConsumption','Add a date and valid density.','','caution');return null}
 const liters=unit==='L'?amount:amount*1000,m3=liters/1000,massKg=m3*density,massT=massKg/1000,kgH=hours>0?massKg/hours:null;
 consumptionDraft={id:`c${Date.now()}`,date,product,mode,unit,amount,liters,m3,density,massKg,massT,hours,kgH,createdAt:new Date().toISOString()};
 if(showResult){
   const primary=product==='Lube oil'?`${nf(liters,1)} L · ${nf(massKg,1)} kg`:`${nf(m3,3)} m³ · ${nf(massT,3)} t`;
   const rate=kgH==null?'Running hours not entered.':`${nf(kgH,1)} kg/h over ${nf(hours,1)} h.`;
   setRes('resConsumption',primary,`${product} consumption for ${date}. ${rate}`,'ok')
 }
 return consumptionDraft
}
function periodStats(entries,days,offset=0){
 const end=new Date();end.setHours(23,59,59,999);end.setDate(end.getDate()-offset);
 const start=new Date(end);start.setHours(0,0,0,0);start.setDate(start.getDate()-(days-1));
 const rows=entries.filter(x=>{const d=parseLocalDate(x.date);return d&&d>=start&&d<=end});
 const uniqueDays=new Set(rows.map(x=>x.date)).size,totalKg=rows.reduce((s,x)=>s+(+x.massKg||0),0),totalL=rows.reduce((s,x)=>s+(+x.liters||0),0);
 return{rows,uniqueDays,totalKg,totalL,avgKg:uniqueDays?totalKg/uniqueDays:0,avgL:uniqueDays?totalL/uniqueDays:0}
}
function renderConsumptionHistory(){
 const tb=$('#consHistoryRows'),sum=$('#consSummary');if(!tb||!sum)return;
 const all=consumptionHistory().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.createdAt).localeCompare(String(a.createdAt)));
 const filter=$('#consHistoryFilter')?.value||'Fuel',rows=filter==='all'?all:all.filter(x=>x.product===filter);
 const s7=periodStats(rows,7),s30=periodStats(rows,30),prev7=periodStats(rows,7,7);
 const trend=prev7.avgKg>0?((s7.avgKg-prev7.avgKg)/prev7.avgKg*100):null;
 const formatAvg=s=>s.uniqueDays?`${nf(s.avgKg/1000,3)} t/day · ${nf(s.avgL,0)} L/day`:'—';
 sum.innerHTML=`<div><span>7-day avg</span><strong>${formatAvg(s7)}</strong><small>${s7.uniqueDays} recorded day${s7.uniqueDays===1?'':'s'}</small></div><div><span>30-day avg</span><strong>${formatAvg(s30)}</strong><small>${s30.uniqueDays} recorded day${s30.uniqueDays===1?'':'s'}</small></div><div><span>7-day trend</span><strong>${trend==null?'—':`${trend>=0?'+':''}${nf(trend,1)}%`}</strong><small>vs previous 7 recorded-day average</small></div>`;
 tb.innerHTML=rows.length?rows.slice(0,20).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.product)}</td><td>${nf(x.liters,1)} L</td><td>${nf(x.massKg/1000,3)} t</td><td>${x.hours>0?nf(x.hours,1):'—'}</td><td>${x.kgH!=null?nf(x.kgH,1)+' kg/h':'—'}</td><td><button class="btn mini" data-cons-delete="${esc(x.id)}">Delete</button></td></tr>`).join(''):'<tr><td colspan="7" class="helper">No saved consumption entries for this filter yet.</td></tr>'
}
function saveConsumptionEntry(){
 const x=calculateConsumptionDraft(false);if(!x)return setRes('resConsumption','Nothing saved.','Check the consumption inputs first.','caution');
 const h=consumptionHistory();h.push(x);store.set(K.consumption,h.slice(-1000));renderConsumptionHistory();toast('Consumption entry saved locally.');calculateConsumptionDraft(true)
}
function copyConsumptionSummary(){
 const x=consumptionDraft||calculateConsumptionDraft(false);if(!x)return toast('Calculate a valid consumption entry first.');
 const text=[`Marine Tools — Daily consumption`,`Date: ${x.date}`,`Product: ${x.product}`,`Consumed: ${nf(x.liters,1)} L (${nf(x.m3,3)} m³)`,`Mass: ${nf(x.massKg,1)} kg (${nf(x.massT,3)} t)`,`Density: ${nf(x.density,1)} kg/m³`,x.hours>0?`Running hours: ${nf(x.hours,1)} h`:null,x.kgH!=null?`Average: ${nf(x.kgH,1)} kg/h`:null,'Planning/reporting helper only — verify against vessel records and approved reporting requirements.'].filter(Boolean).join('\n');
 navigator.clipboard?.writeText(text).then(()=>toast('Consumption summary copied.')).catch(()=>toast('Copy unavailable.'))
}
function exportConsumptionCsv(){
 const h=consumptionHistory().slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 if(!h.length)return toast('No consumption history to export.');
 downloadCsv('marine-tools-consumption-history.csv',[
   ['Date','Product','Mode','Entered unit','Entered amount','Volume L','Volume m3','Density kg/m3','Mass kg','Mass t','Running hours','kg per hour'],
   ...h.map(x=>[x.date,x.product,x.mode,x.unit,x.amount,x.liters,x.m3,x.density,x.massKg,x.massT,x.hours||'',x.kgH??''])
 ]);toast('Consumption CSV exported.')
}
function renderBunkeringHistory(){
 const tb=$('#bunkHistoryRows'),sum=$('#bunkHistorySummary');if(!tb||!sum)return;
 const rows=bunkeringHistory().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.createdAt).localeCompare(String(a.createdAt)));
 const totalV=rows.reduce((s,x)=>s+(+x.volume||0),0),totalKg=rows.reduce((s,x)=>s+(+x.massKg||0),0),weighted=totalV?totalKg/totalV:0,avg=rows.length?totalV/rows.length:0;
 const asc=rows.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))),interval=asc.length>1?daysBetween(parseLocalDate(asc[0].date),parseLocalDate(asc.at(-1).date))/(asc.length-1):null;
 sum.innerHTML=`<div><span>Total volume</span><strong>${rows.length?nf(totalV,2)+' m³':'—'}</strong><small>${rows.length} saved bunkering${rows.length===1?'':'s'}</small></div><div><span>Total mass</span><strong>${rows.length?nf(totalKg/1000,2)+' t':'—'}</strong><small>Weighted density ${rows.length?nf(weighted,1)+' kg/m³':'—'}</small></div><div><span>Average delivery</span><strong>${rows.length?nf(avg,2)+' m³':'—'}</strong><small>${interval==null?'Average interval —':`Average interval ${nf(interval,1)} days`}</small></div>`;
 tb.innerHTML=rows.length?rows.slice(0,20).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.grade||'—')}</td><td>${nf(x.volume,2)} m³</td><td>${nf(x.density,1)} kg/m³</td><td>${nf(x.massKg/1000,2)} t</td><td><button class="btn mini" data-bunk-delete="${esc(x.id)}">Delete</button></td></tr>`).join(''):'<tr><td colspan="6" class="helper">No saved bunkerings yet.</td></tr>'
}
function saveBunkeringEntry(){
 const date=$('#bhDate')?.value,grade=$('#bhGrade')?.value.trim(),volume=+$('#bhVolume')?.value,density=+$('#bhDensity')?.value;
 if(!date||!grade||!(volume>0)||!(density>0))return toast('Add date, grade, volume and density.');
 const h=bunkeringHistory();h.push({id:`b${Date.now()}`,date,grade,volume,density,massKg:volume*density,createdAt:new Date().toISOString()});store.set(K.bunkHistory,h.slice(-1000));renderBunkeringHistory();toast('Bunkering saved locally.')
}
function exportBunkeringCsv(){
 const h=bunkeringHistory().slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 if(!h.length)return toast('No bunkering history to export.');
 downloadCsv('marine-tools-bunkering-history.csv',[
   ['Date','Grade / product','Volume m3','Density kg/m3','Mass kg','Mass t'],
   ...h.map(x=>[x.date,x.grade,x.volume,x.density,x.massKg,x.massKg/1000])
 ]);toast('Bunkering CSV exported.')
}

function bindFuel(){
 const applyFuelView=()=>{const v=$('#fuelView').value;$$('#fuel .tool-card[data-tool-group]').forEach(c=>c.hidden=v!=='all'&&c.dataset.toolGroup!==v)};
 $('#fuelView').onchange=applyFuelView;applyFuelView();

 // Daily consumption & reporting
 $('#consDate').value=localDateISO();
 $('#bhDate').value=localDateISO();
 const applyConsMode=()=>{$('#consDifferenceWrap').hidden=$('#consMode').value!=='difference';$('#consDirectWrap').hidden=$('#consMode').value!=='direct'};
 $('#consMode').onchange=applyConsMode;applyConsMode();
 $('#consProduct').onchange=()=>{const d=consumptionDefaults($('#consProduct').value);$('#consDensity').value=d.density;$('#consUnit').value=d.unit;$('#consHistoryFilter').value=$('#consProduct').value;consumptionDraft=null;renderConsumptionHistory()};
 $('#calcConsumption').onclick=()=>calculateConsumptionDraft(true);
 $('#saveConsumption').onclick=saveConsumptionEntry;
 $('#copyConsumption').onclick=copyConsumptionSummary;
 $('#exportConsumption').onclick=exportConsumptionCsv;
 $('#consHistoryFilter').onchange=renderConsumptionHistory;
 $('#consHistoryRows').addEventListener('click',e=>{const id=e.target.dataset.consDelete;if(!id)return;store.set(K.consumption,consumptionHistory().filter(x=>x.id!==id));renderConsumptionHistory();toast('Consumption entry deleted.')});
 renderConsumptionHistory();

 // Persistent bunkering history
 $('#saveBunkHistory').onclick=saveBunkeringEntry;
 $('#exportBunkHistory').onclick=exportBunkeringCsv;
 $('#bunkHistoryRows').addEventListener('click',e=>{const id=e.target.dataset.bunkDelete;if(!id)return;store.set(K.bunkHistory,bunkeringHistory().filter(x=>x.id!==id));renderBunkeringHistory();toast('Bunkering entry deleted.')});
 renderBunkeringHistory();

 $('#calcRob').onclick=()=>{const r=+$('#rob').value,d=+$('#robDay').value,res=+$('#robRes').value,usable=r*(1-res/100),days=usable/Math.max(.0001,d);setRes('resRob',`${nf(usable,1)} m³ usable · ${nf(days,1)} days`,`${nf(r-usable,1)} m³ held as reserve.`)};

 const endRows=$('#endScenarioRows');
 $('#addEndRate').onclick=()=>endRows.insertAdjacentHTML('beforeend','<div class="dynamic-row simple-row end-row"><label>Consumption m³/day<input class="end-rate" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 endRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.end-row',endRows).length>2)e.target.closest('.end-row').remove()});
 $('#calcEndCompare').onclick=()=>{const rob=+$('#endRob').value,res=+$('#endReserve').value,usable=rob*(1-res/100),rates=$$('.end-rate',endRows).map(x=>+x.value).filter(x=>x>0&&Number.isFinite(x)).slice(0,10);if(!(rob>=0&&res>=0&&res<100&&rates.length))return setRes('resEndCompare','Check ROB, reserve and consumption scenarios.','','caution');const rows=rates.map(r=>`<tr><td>${nf(r,2)} m³/day</td><td>${nf(usable/r,2)} days</td><td>${formatHours(usable/r*24)}</td></tr>`).join('');$('#resEndCompare').className='result';$('#resEndCompare').innerHTML=`<strong>${nf(usable,1)} m³ usable after reserve</strong><div class="table-wrap"><table class="table compact"><thead><tr><th>Consumption</th><th>Endurance</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></div>`};

 const speedRows=$('#speedFuelRows');
 $('#addSpeedFuel').onclick=()=>speedRows.insertAdjacentHTML('beforeend','<div class="dynamic-row speed-row"><label>Speed kn<input class="sf-speed" type="number" step=".1"></label><label>Consumption m³/day<input class="sf-cons" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 speedRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.speed-row',speedRows).length>2)e.target.closest('.speed-row').remove()});
 $('#calcSpeedFuel').onclick=()=>{const pts=$$('.speed-row',speedRows).map(r=>[+$('.sf-speed',r).value,+$('.sf-cons',r).value]).filter(x=>x.every(Number.isFinite)&&x[0]>=0&&x[1]>=0).sort((a,b)=>a[0]-b[0]),s=+$('#targetSpeed').value;if(pts.length<2)return setRes('resSpeedFuel','Need at least two measured points.','','caution');let a=pts[0],b=pts[1];for(let i=1;i<pts.length;i++){if(s<=pts[i][0]){a=pts[i-1];b=pts[i];break}a=pts[i-1];b=pts[i]}const f=a[1]+(s-a[0])/(b[0]-a[0]||1)*(b[1]-a[1]);setRes('resSpeedFuel',`${nf(f,2)} m³/day at ${nf(s,1)} kn`,`Linear interpolation between ${a[0]} kn / ${a[1]} and ${b[0]} kn / ${b[1]}.`)};

 $('#calcFuelDensity').onclick=()=>{const v=+$('#fuelVol').value,rho=+$('#fuelDensity').value,t=+$('#fuelTemp').value,tr=+$('#fuelRef').value,a=+$('#fuelAlpha').value,vr=v/(1+a*(t-tr)),mass=v*rho/1000;setRes('resFuelDensity',`${nf(vr,3)} m³ @ ${tr}°C · ${nf(mass,3)} t`,`Simple thermal-volume correction using user-supplied coefficient.`)};
 $('#calcTransfer').onclick=()=>{const cap=+$('#tankCap').value,n=+$('#tankNow').value,m=+$('#tankMove').value,r=+$('#tankRate').value,final=n+m,pct=final/cap*100,time=m/r;setRes('resTransfer',`${nf(final,2)} m³ · ${nf(pct,1)}% · ${formatHours(time)}`,pct>90?'Receiving tank exceeds 90% fill.':'Check tank-specific maximum fill and procedures.',pct>100?'alert':pct>90?'caution':'ok')};
 $('#calcBlend').onclick=()=>{const va=+$('#blendVA').value,da=+$('#blendDA').value,sa=+$('#blendSA').value,vb=+$('#blendVB').value,db=+$('#blendDB').value,sb=+$('#blendSB').value;if(!(va>=0&&vb>=0&&da>0&&db>0&&va+vb>0))return setRes('resBlend','Check blend inputs.','','caution');const ma=va*da,mb=vb*db,mt=ma+mb,vt=va+vb,rho=mt/vt,s=(ma*sa+mb*sb)/mt;setRes('resBlend',`${nf(vt,2)} m³ · ${nf(rho,1)} kg/m³ · ${nf(s,3)}% S`,`Mass basis: Fuel A ${nf(ma/1000,2)} t + Fuel B ${nf(mb/1000,2)} t. Compatibility/stability is not evaluated.`)};

 $('#fuMode').onchange=()=>{$('#fuAmountText').textContent=$('#fuMode').value==='v2m'?'Volume m³':'Mass tonnes'};
 $('#calcFuelUrea').onclick=()=>{const amount=+$('#fuAmount').value,d=+$('#fuDensity').value,mode=$('#fuMode').value,product=$('#fuProduct').value;if(!(amount>=0&&d>0))return setRes('resFuelUrea','Check amount and density.','','caution');if(mode==='v2m'){const kg=amount*d,t=kg/1000;setRes('resFuelUrea',`${nf(t,3)} t · ${nf(kg,0)} kg`,`${nf(amount,3)} m³ ${product.toLowerCase()} at ${nf(d,1)} kg/m³.`)}else{const m3=amount*1000/d;setRes('resFuelUrea',`${nf(m3,3)} m³ · ${nf(m3*1000,0)} L`,`${nf(amount,3)} t ${product.toLowerCase()} at ${nf(d,1)} kg/m³.`)}};

 const bunkRows=$('#bunkRows');
 $('#addBunkRow').onclick=()=>bunkRows.insertAdjacentHTML('beforeend','<div class="dynamic-row bunk-row"><label>Date<input class="bunk-date" type="date"></label><label>Volume m³<input class="bunk-vol" type="number" step=".01"></label><label>Density kg/m³<input class="bunk-dens" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 bunkRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.bunk-row',bunkRows).length>1)e.target.closest('.bunk-row').remove()});
 $('#calcBunkOverview').onclick=()=>{const rows=$$('.bunk-row',bunkRows).map(r=>({date:new Date($('.bunk-date',r).value),vol:+$('.bunk-vol',r).value,dens:+$('.bunk-dens',r).value})).filter(x=>!Number.isNaN(x.date.getTime())&&x.vol>=0&&x.dens>0).sort((a,b)=>a.date-b.date);if(!rows.length)return setRes('resBunkOverview','No valid bunkering rows found.','','caution');const totalV=rows.reduce((s,r)=>s+r.vol,0),totalKg=rows.reduce((s,r)=>s+r.vol*r.dens,0),totalT=totalKg/1000,weighted=totalV?totalKg/totalV:0,avgParcel=totalV/rows.length,days=rows.length>1?(rows.at(-1).date-rows[0].date)/86400000/(rows.length-1):0;$('#resBunkOverview').className='result';$('#resBunkOverview').innerHTML=`<strong>${rows.length} bunkering${rows.length===1?'':'s'} · ${nf(totalV,2)} m³ · ${nf(totalT,2)} t</strong><div class="table-wrap"><table class="table compact"><tbody><tr><th>Weighted density</th><td>${nf(weighted,1)} kg/m³</td></tr><tr><th>Average delivery</th><td>${nf(avgParcel,2)} m³</td></tr><tr><th>Average interval</th><td>${rows.length>1?`${nf(days,1)} days`:'—'}</td></tr><tr><th>Period</th><td>${rows[0].date.toISOString().slice(0,10)} → ${rows.at(-1).date.toISOString().slice(0,10)}</td></tr></tbody></table></div><small>Analysis summary only — not a statutory bunkering record.</small>`};

 $('#fuelRouteBtn').onclick=()=>{const d=routeDistance(),h=d/Math.max(.01,state.profile.serviceSpeed),f=h/24*state.profile.fuelDay;setRes('fuelRouteRes',d?`${nf(f,2)} m³ for ${nf(d,1)} NM`:'No active route',d?`${formatHours(h)} at ${state.profile.serviceSpeed} kn.`:'Create an experimental route under Live & Experimental.')};$('#fuelRouteBtn').click();
}

function renderVessel(){
 $('#vessel-calcs').innerHTML=pageTitle('Vessel Calculations','Draft, under-keel clearance, squat and anchoring helpers.')+`<div class="tool-grid">
 ${card('Dynamic UKC & squat','Estimate squat and resulting UKC from depth, draft and speed.',`<div class="fields three"><label>Charted / actual depth m<input id="ukcDepth" type="number" step=".1" value="8"></label><label>Draft m<input id="ukcDraft" type="number" step=".1" value="4"></label><label>Speed kn<input id="ukcSpeed" type="number" step=".1" value="8"></label></div><details class="advanced-inputs"><summary>Advanced inputs</summary><div class="fields"><label>Block coefficient Cb<input id="ukcCb" type="number" step=".01" value=".65"></label><label>Channel factor<input id="ukcCh" type="number" step=".1" value="1"></label></div></details>${calcButton('calcUkc')}${result('resUkc')}`)}
 ${card('Anchor swing radius','Estimate maximum horizontal swing radius from chain length, water depth and vessel length.',`<div class="fields"><label>Chain paid out m<input id="anchorChain" type="number" value="120"></label><label>Water depth m<input id="anchorDepth" type="number" value="20"></label><label>Bow to stern / LOA m<input id="anchorLoa" type="number" value="80"></label></div>${calcButton('calcAnchor')}${result('resAnchor')}`)}
 ${card('Draft / tide UKC','Simple static UKC including tide or water-level correction.',`<div class="fields"><label>Chart depth m<input id="staticDepth" type="number" step=".1" value="6"></label><label>Tide / water level m<input id="staticTide" type="number" step=".1" value="0.8"></label><label>Draft m<input id="staticDraft" type="number" step=".1" value="4"></label><label>Safety allowance m<input id="staticAllow" type="number" step=".1" value="0.5"></label></div>${calcButton('calcStaticUkc')}${result('resStaticUkc')}`)}
 ${card('FWA / DWA','Estimate Fresh Water Allowance and Dock Water Allowance.',`<div class="fields"><label>Displacement t<input id="fwaDisp" type="number" step="1" value="5000"></label><label>TPC t/cm<input id="fwaTpc" type="number" step=".1" value="12"></label><label>Dock-water density t/m³<input id="fwaDensity" type="number" step=".001" value="1.010"></label></div>${calcButton('calcFwa')}${result('resFwa')}${formulaBox('Formula & assumptions','Approximate FWA(mm) = displacement ÷ (4 × TPC). DWA = FWA × (1.025 − dock-water density) ÷ 0.025. Use vessel hydrostatic data where available; this calculator is a quick planning approximation.')}`)}

 ${card('Air draft / bridge clearance','Estimate remaining vertical clearance using compatible reference levels.',`<div class="fields"><label>Published clearance m<input id="airPublished" type="number" step=".01" value="25"></label><label>Water level above clearance reference m<input id="airWater" type="number" step=".01" value="0.8"></label><label>Vessel air draft m<input id="airDraft" type="number" step=".01" value="20"></label><label>Safety margin m<input id="airMargin" type="number" step=".01" value="1"></label></div>${calcButton('calcAirDraft')}${result('resAirDraft')}`)}

 </div>`;bindVessel();
}
function bindVessel(){
 $('#calcUkc').onclick=()=>{const dep=+$('#ukcDepth').value,dr=+$('#ukcDraft').value,s=+$('#ukcSpeed').value,cb=+$('#ukcCb').value,ch=+$('#ukcCh').value;const squat=ch*cb*s*s/100,ukc=dep-dr-squat,set=state.profile.minUKC||0;setRes('resUkc',`Squat ${nf(squat,2)} m · Dynamic UKC ${nf(ukc,2)} m`,`Simplified planning formula Cb × V² / 100 × channel factor. Vessel-specific squat data takes precedence.`,ukc<set?'alert':ukc<set*1.25?'caution':'ok')};
 $('#calcAnchor').onclick=()=>{const c=+$('#anchorChain').value,d=+$('#anchorDepth').value,l=+$('#anchorLoa').value,h=Math.sqrt(Math.max(0,c*c-d*d)),r=h+l;setRes('resAnchor',`${nf(r,0)} m maximum approximate swing radius`,`Geometric estimate only; add safety margin for catenary, tide, yaw, GPS antenna position and local requirements.`)};
 $('#calcStaticUkc').onclick=()=>{const u=+$('#staticDepth').value+ +$('#staticTide').value- +$('#staticDraft').value- +$('#staticAllow').value;setRes('resStaticUkc',`${nf(u,2)} m remaining UKC`,`After user-entered safety allowance.`,u<state.profile.minUKC?'alert':u<state.profile.minUKC*1.25?'caution':'ok')};

 $('#calcAirDraft').onclick=()=>{const pc=+$('#airPublished').value,wl=+$('#airWater').value,ad=+$('#airDraft').value,m=+$('#airMargin').value,remain=pc-wl-ad-m;setRes('resAirDraft',`${nf(remain,2)} m remaining clearance`,`Published ${nf(pc,2)} − water level ${nf(wl,2)} − air draft ${nf(ad,2)} − margin ${nf(m,2)}.`,remain<0?'alert':remain<1?'caution':'ok')};

 $('#calcFwa').onclick=()=>{const disp=+$('#fwaDisp').value,tpc=+$('#fwaTpc').value,rho=+$('#fwaDensity').value;if(!(disp>0&&tpc>0&&rho>0))return setRes('resFwa','Check inputs.','','caution');const fwa=disp/(4*tpc),ratio=(1.025-rho)/.025,dwa=fwa*ratio;setRes('resFwa',`FWA ${nf(fwa,1)} mm · DWA ${nf(dwa,1)} mm`,`Dock-water density ${nf(rho,3)} t/m³ · DWA is ${nf(ratio*100,0)}% of FWA.`)};
}


function renderEngineering(){
 $('#engineering').innerHTML=pageTitle('Engineering','Practical engineering calculations grouped by the job you are doing.')+`
 <article class="panel tool-selector"><div class="panel-body"><label>Engineering area<select id="engView"><option value="power">Generator & power</option><option value="pumps">Pumps & hydraulics</option><option value="tanks">Tanks & transfer</option><option value="consumables">Consumables & reporting</option><option value="all">Show all engineering tools</option></select></label><p class="helper">Only one area is shown at a time by default, so the page stays easier to scan.</p></div></article>
 <div class="tool-grid">
 ${groupedCard('pumps','Hydraulic power','Calculate hydraulic power from pressure and flow.',`<div class="fields"><label>Pressure bar<input id="hydP" type="number" value="180"></label><label>Flow L/min<input id="hydQ" type="number" value="80"></label><label>Result detail<select id="hydMode"><option value="hyd">Hydraulic power only</option><option value="input">Include estimated input power</option></select></label><label id="hydEffWrap" hidden>Estimated efficiency %<input id="hydEff" type="number" value="85"></label></div>${calcButton('calcHyd')}${result('resHyd')}`)}

 ${groupedCard('pumps','Pump speed change','Estimate flow, head and power after changing pump RPM.',`<div class="subgroup"><h4>Current condition</h4><div class="fields"><label>Current RPM<input id="pumpN1" type="number" value="1500"></label><label>Current flow m³/h<input id="pumpQ1" type="number" value="50"></label><label>Current head m<input id="pumpH1" type="number" value="30"></label><label>Current power kW<input id="pumpW1" type="number" value="8"></label></div></div><div class="subgroup"><h4>New condition</h4><label>New RPM<input id="pumpN2" type="number" value="1200"></label></div>${calcButton('calcAffinity')}${result('resAffinity')}`)}

 ${groupedCard('pumps','Pipe velocity','Calculate fluid velocity from flow and internal diameter.',`<div class="fields"><label>Flow<input id="pipeQ" type="number" value="30"></label><label>Flow unit<select id="pipeQUnit"><option value="m3h">m³/h</option><option value="lmin">L/min</option></select></label><label>Internal diameter mm<input id="pipeD" type="number" value="100"></label></div>${calcButton('calcPipe')}${result('resPipe')}`)}

 ${groupedCard('tanks','Tank table interpolation','Interpolate volume using the lower and upper approved tank-table values surrounding your measurement.',`<div class="subgroup"><h4>Lower table value</h4><div class="fields"><label>Sounding / ullage<input id="tankLowX" type="number" step=".001" value="1"></label><label>Volume m³<input id="tankLowV" type="number" step=".001" value="9.9"></label></div></div><div class="subgroup"><h4>Measured</h4><label>Sounding / ullage<input id="tankMeasure" type="number" step=".001" value="1.2"></label></div><div class="subgroup"><h4>Upper table value</h4><div class="fields"><label>Sounding / ullage<input id="tankHighX" type="number" step=".001" value="1.5"></label><label>Volume m³<input id="tankHighV" type="number" step=".001" value="15.2"></label></div></div>${calcButton('calcTankInterp')}${result('resTankInterp')}`)}

 ${groupedCard('tanks','Flow / fill time','Calculate transfer time, required flow or transferred volume.',`<label>What do you want to find?<select id="flowMode"><option value="time">Transfer time</option><option value="flow">Required flow</option><option value="volume">Transferred volume</option></select></label><div class="fields"><label id="flowVolWrap">Volume m³<input id="flowVol" type="number" step=".01" value="18"></label><label id="flowRateWrap">Flow m³/h<input id="flowRate" type="number" step=".01" value="12"></label><label id="flowTimeWrap" hidden>Time hours<input id="flowHours" type="number" step=".01" value="1.5"></label></div>${calcButton('calcFlowTime')}${result('resFlowTime')}`)}

 ${groupedCard('tanks','Pressure ↔ head','Convert static pressure and fluid head.',`<div class="fields"><label>Conversion<select id="phMode"><option value="bar-head">bar → m head</option><option value="head-bar">m head → bar</option></select></label><label>Value<input id="phValue" type="number" step=".001" value="2"></label><label>Fluid<select id="phFluid"><option value="fresh">Fresh water</option><option value="sea">Sea water</option><option value="fuel">Fuel / oil</option><option value="custom">Custom</option></select></label><label id="phDensityWrap" hidden>Density kg/m³<input id="phDensity" type="number" step=".1" value="850"></label></div>${calcButton('calcPressureHead')}${result('resPressureHead')}`)}

 ${groupedCard('power','Generator load margin','Calculate present generator loading and remaining online capacity.',`<div class="fields"><label>Total generator capacity currently online kW<input id="genCap" type="number" value="500"></label><label>Current total load kW<input id="genLoad" type="number" value="320"></label></div>${calcButton('calcGenMargin')}${result('resGenMargin')}`)}

 ${groupedCard('consumables','Chemical dosing','Calculate required product quantity from the dosing rate stated by the product manufacturer.',`<div class="fields"><label>System / tank volume m³<input id="chemVol" type="number" step=".01" value="20"></label><label>Dose from product instructions<input id="chemRate" type="number" step=".001" placeholder="Enter stated rate"></label><label>Dose-rate unit<select id="chemUnit"><option value="mlm3">mL per m³</option><option value="lm3">L per m³</option><option value="l100m3">L per 100 m³</option><option value="pct">% v/v</option></select></label></div><p class="helper">Marine Tools does not recommend a chemical dose. Use the rate from the product data sheet or vessel procedure.</p>${calcButton('calcChemDose')}${result('resChemDose')}`)}

 ${groupedCard('consumables','NOx reporting helper','Summarise period NOx calculations and SCR/urea consumption without requiring CSV-style input.',`<label>Calculation basis<select id="noxMode"><option value="power">Running hours + average power</option><option value="fuel">Fuel consumed</option></select></label><div class="mini-section"><b>Engines / sources</b><div id="noxRows" class="dynamic-list"></div><button type="button" class="btn small" id="addNoxRow">+ Add engine / source</button></div><div class="subgroup"><h4>SCR / urea solution</h4><label>Urea tracking<select id="noxUreaMode"><option value="none">Not used / not included</option><option value="total">Enter total urea solution used</option><option value="balance">Calculate from tank balance</option></select></label><div id="noxUreaTotalWrap" hidden><label>Urea solution used in period L<input id="noxUreaUsed" type="number" step=".1"></label></div><div id="noxUreaBalanceWrap" class="fields three" hidden><label>Start ROB L<input id="noxUreaStart" type="number" step=".1"></label><label>Received / bunkered L<input id="noxUreaReceived" type="number" step=".1" value="0"></label><label>End ROB L<input id="noxUreaEnd" type="number" step=".1"></label></div><p class="helper">Urea consumption is reported alongside the NOx result. Marine Tools does not infer an NOx reduction from urea volume alone.</p></div>${calcButton('calcNox','Calculate period summary')}${result('resNox')}`)}

 ${groupedCard('consumables','Lube oil trend','Calculate lube-oil consumption from filling records and cumulative running hours.',`<p class="helper">Use the first row as the baseline. Enter oil added on each later reading.</p><div id="loRows" class="dynamic-list"><div class="dynamic-row lo-row"><label>Date<input class="lo-date" type="date" value="2026-07-01"></label><label>Cumulative running hours<input class="lo-hours" type="number" step=".1" value="10000"></label><label>Oil added L<input class="lo-liters" type="number" step=".1" value="0"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row lo-row"><label>Date<input class="lo-date" type="date" value="2026-08-01"></label><label>Cumulative running hours<input class="lo-hours" type="number" step=".1" value="10420"></label><label>Oil added L<input class="lo-liters" type="number" step=".1" value="18"></label><button type="button" class="btn small remove-row">Remove</button></div><div class="dynamic-row lo-row"><label>Date<input class="lo-date" type="date" value="2026-09-01"></label><label>Cumulative running hours<input class="lo-hours" type="number" step=".1" value="10880"></label><label>Oil added L<input class="lo-liters" type="number" step=".1" value="23"></label><button type="button" class="btn small remove-row">Remove</button></div></div><button type="button" class="btn small" id="addLoRow">+ Add reading</button>${calcButton('calcLoTrend','Analyse trend')}${result('resLoTrend')}`)}
 </div>`;bindEngineering();
}
function bindEngineering(){
 const applyEngView=()=>{const v=$('#engView').value;$$('#engineering .tool-card[data-tool-group]').forEach(c=>c.hidden=v!=='all'&&c.dataset.toolGroup!==v)};
 $('#engView').onchange=applyEngView;applyEngView();

 $('#hydMode').onchange=()=>{$('#hydEffWrap').hidden=$('#hydMode').value!=='input'};$('#hydMode').onchange();
 $('#calcHyd').onclick=()=>{const p=+$('#hydP').value,q=+$('#hydQ').value,hyd=p*q/600;if($('#hydMode').value==='input'){const e=+$('#hydEff').value/100;if(!(e>0&&e<=1))return setRes('resHyd','Check efficiency.','','caution');const input=hyd/e;setRes('resHyd',`${nf(hyd,2)} kW hydraulic · ${nf(input,2)} kW estimated input`,`Based on P(kW)=bar×L/min÷600.`)}else setRes('resHyd',`${nf(hyd,2)} kW hydraulic`,`Based on P(kW)=bar×L/min÷600.`)};

 $('#calcAffinity').onclick=()=>{const n1=+$('#pumpN1').value,n2=+$('#pumpN2').value;if(!(n1>0&&n2>0))return setRes('resAffinity','Check RPM values.','','caution');const r=n2/n1,q=+$('#pumpQ1').value*r,h=+$('#pumpH1').value*r*r,w=+$('#pumpW1').value*r*r*r;setRes('resAffinity',`${nf(q,1)} m³/h · ${nf(h,1)} m head · ${nf(w,2)} kW`,`Ideal affinity-law estimate from ${nf(n1,0)} to ${nf(n2,0)} RPM.`)};

 $('#calcPipe').onclick=()=>{let q=+$('#pipeQ').value;if($('#pipeQUnit').value==='lmin')q=q*.06;const qm=q/3600,d=+$('#pipeD').value/1000,a=Math.PI*d*d/4,v=qm/a;setRes('resPipe',`${nf(v,2)} m/s`,`Flow ${nf(q,2)} m³/h · internal area ${nf(a,4)} m².`)};

 $('#calcTankInterp').onclick=()=>{const x1=+$('#tankLowX').value,v1=+$('#tankLowV').value,x=+$('#tankMeasure').value,x2=+$('#tankHighX').value,v2=+$('#tankHighV').value;if(![x1,v1,x,x2,v2].every(Number.isFinite)||x2===x1)return setRes('resTankInterp','Check the two surrounding table values.','','caution');if(x<Math.min(x1,x2)||x>Math.max(x1,x2))return setRes('resTankInterp','Measured value must lie between the lower and upper table values.','','caution');const v=v1+(x-x1)/(x2-x1)*(v2-v1);setRes('resTankInterp',`${nf(v,3)} m³`,`Interpolated between ${x1} → ${v1} m³ and ${x2} → ${v2} m³.`)};

 const updateFlowMode=()=>{const m=$('#flowMode').value;$('#flowVolWrap').hidden=m==='volume';$('#flowRateWrap').hidden=m==='flow';$('#flowTimeWrap').hidden=m==='time'};$('#flowMode').onchange=updateFlowMode;updateFlowMode();
 $('#calcFlowTime').onclick=()=>{const m=$('#flowMode').value,v=+$('#flowVol').value,q=+$('#flowRate').value,h=+$('#flowHours').value;if(m==='time'){if(!(v>=0&&q>0))return setRes('resFlowTime','Check volume and flow.','','caution');setRes('resFlowTime',`${formatHours(v/q)}`,`${nf(v,2)} m³ at ${nf(q,2)} m³/h.`)}else if(m==='flow'){if(!(v>=0&&h>0))return setRes('resFlowTime','Check volume and time.','','caution');setRes('resFlowTime',`${nf(v/h,2)} m³/h required`,`${nf(v,2)} m³ over ${nf(h,2)} hours.`)}else{if(!(q>=0&&h>=0))return setRes('resFlowTime','Check flow and time.','','caution');setRes('resFlowTime',`${nf(q*h,2)} m³ transferred`,`${nf(q,2)} m³/h for ${nf(h,2)} hours.`)}};

 const updateFluid=()=>{$('#phDensityWrap').hidden=!['fuel','custom'].includes($('#phFluid').value)};$('#phFluid').onchange=updateFluid;updateFluid();
 $('#calcPressureHead').onclick=()=>{const v=+$('#phValue').value,mode=$('#phMode').value,fluid=$('#phFluid').value,g=9.80665,rho=fluid==='fresh'?1000:fluid==='sea'?1025:+$('#phDensity').value;if(!(rho>0&&v>=0))return setRes('resPressureHead','Check value and density.','','caution');const fluidName=fluid==='fresh'?'fresh water':fluid==='sea'?'sea water':'selected fluid';if(mode==='bar-head'){const h=v*100000/(rho*g);setRes('resPressureHead',`${nf(h,2)} m head`,`${nf(v,3)} bar in ${fluidName} at ${nf(rho,1)} kg/m³.`)}else{const bar=v*rho*g/100000;setRes('resPressureHead',`${nf(bar,3)} bar`,`${nf(v,2)} m head in ${fluidName} at ${nf(rho,1)} kg/m³.`)}};

 $('#calcGenMargin').onclick=()=>{const c=+$('#genCap').value,l=+$('#genLoad').value;if(!(c>0&&l>=0))return setRes('resGenMargin','Check capacity and load.','','caution');const p=l/c*100,m=c-l;setRes('resGenMargin',`${nf(p,1)}% load · ${nf(m,0)} kW margin`,p>95?'Very little remaining margin.':p<30?'Low loading — check engine-specific operating guidance.':'Present online capacity and load shown above.',p>95?'alert':p<30?'caution':'ok')};

 $('#calcChemDose').onclick=()=>{const vol=+$('#chemVol').value,rate=+$('#chemRate').value,unit=$('#chemUnit').value;if(!(vol>=0&&rate>=0))return setRes('resChemDose','Enter a valid system volume and manufacturer dose rate.','','caution');let liters=0,detail='';if(unit==='mlm3'){liters=vol*rate/1000;detail=`${nf(rate,3)} mL/m³`}else if(unit==='lm3'){liters=vol*rate;detail=`${nf(rate,3)} L/m³`}else if(unit==='l100m3'){liters=vol*rate/100;detail=`${nf(rate,3)} L/100 m³`}else{liters=vol*1000*rate/100;detail=`${nf(rate,4)}% v/v`}setRes('resChemDose',liters<1?`${nf(liters*1000,1)} mL required`:`${nf(liters,3)} L required`,`${nf(vol,2)} m³ system at entered rate ${detail}. Verify against the product data sheet and vessel procedure.`)};

 const noxRows=$('#noxRows');
 const noxRowHtml=(mode,name='',a='',b='',factor='')=>mode==='power'
  ?`<div class="dynamic-row nox-row"><label>Source<input class="nox-name" value="${name}"></label><label>Running hours<input class="nox-a" type="number" step=".1" value="${a}"></label><label>Average power kW<input class="nox-b" type="number" step=".1" value="${b}"></label><label>NOx factor g/kWh<input class="nox-factor" type="number" step=".01" value="${factor}"></label><button type="button" class="btn small remove-row">Remove</button></div>`
  :`<div class="dynamic-row nox-row"><label>Source<input class="nox-name" value="${name}"></label><label>Fuel used t<input class="nox-a" type="number" step=".01" value="${a}"></label><label>NOx factor kg/t<input class="nox-factor" type="number" step=".01" value="${factor}"></label><button type="button" class="btn small remove-row">Remove</button></div>`;
 const rebuildNoxRows=()=>{const m=$('#noxMode').value;noxRows.innerHTML=m==='power'?noxRowHtml(m,'DG1','240','350','7.5')+noxRowHtml(m,'DG2','185','310','7.5'):noxRowHtml(m,'DG1','18.2','','42')+noxRowHtml(m,'DG2','14.6','','42')};
 $('#noxMode').onchange=rebuildNoxRows;rebuildNoxRows();
 $('#addNoxRow').onclick=()=>noxRows.insertAdjacentHTML('beforeend',noxRowHtml($('#noxMode').value));
 noxRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.nox-row',noxRows).length>1)e.target.closest('.nox-row').remove()});

 const updateUreaMode=()=>{const m=$('#noxUreaMode').value;$('#noxUreaTotalWrap').hidden=m!=='total';$('#noxUreaBalanceWrap').hidden=m!=='balance'};$('#noxUreaMode').onchange=updateUreaMode;updateUreaMode();

 $('#calcNox').onclick=()=>{
   const mode=$('#noxMode').value,rows=$$('.nox-row',noxRows);
   let totalKg=0,basisTotal=0,basisLabel='',factorLabel='';
   if(mode==='power'){
     const d=rows.map(r=>({name:$('.nox-name',r).value.trim(),h:+$('.nox-a',r).value,kw:+$('.nox-b',r).value,f:+$('.nox-factor',r).value})).filter(x=>x.name&&x.h>=0&&x.kw>=0&&x.f>=0);
     if(!d.length)return setRes('resNox','Add at least one valid engine/source.','','caution');
     basisTotal=d.reduce((s,x)=>s+x.h*x.kw,0);totalKg=d.reduce((s,x)=>s+x.h*x.kw*x.f/1000,0);basisLabel=`${nf(basisTotal/1000,1)} MWh`;factorLabel=`${nf(basisTotal?totalKg*1000/basisTotal:0,2)} g/kWh weighted factor`;
   }else{
     const d=rows.map(r=>({name:$('.nox-name',r).value.trim(),fuel:+$('.nox-a',r).value,f:+$('.nox-factor',r).value})).filter(x=>x.name&&x.fuel>=0&&x.f>=0);
     if(!d.length)return setRes('resNox','Add at least one valid engine/source.','','caution');
     basisTotal=d.reduce((s,x)=>s+x.fuel,0);totalKg=d.reduce((s,x)=>s+x.fuel*x.f,0);basisLabel=`${nf(basisTotal,2)} t fuel`;factorLabel=`${nf(basisTotal?totalKg/basisTotal:0,2)} kg/t weighted factor`;
   }
   const um=$('#noxUreaMode').value;let urea=null;
   if(um==='total')urea=+$('#noxUreaUsed').value;
   if(um==='balance')urea=+$('#noxUreaStart').value + +$('#noxUreaReceived').value - +$('#noxUreaEnd').value;
   if(urea!=null && (!Number.isFinite(urea)||urea<0))return setRes('resNox','Check urea quantities.','Calculated urea use cannot be negative.','caution');
   let ureaText='Urea not included in this period summary.';
   if(urea!=null){
     const ratio=mode==='power'?(basisTotal>0?urea/(basisTotal/1000):0):(basisTotal>0?urea/basisTotal:0);
     ureaText=`Urea solution used: ${nf(urea,1)} L · ${nf(ratio,2)} ${mode==='power'?'L/MWh':'L/t fuel'}.`;
   }
   $('#resNox').className='result';
   $('#resNox').innerHTML=`<strong>${nf(totalKg,1)} kg NOx · ${nf(totalKg/1000,3)} t</strong><div class="table-wrap"><table class="table compact"><tbody><tr><th>Activity basis</th><td>${basisLabel}</td></tr><tr><th>NOx factor summary</th><td>${factorLabel}</td></tr><tr><th>SCR / urea</th><td>${ureaText}</td></tr></tbody></table></div><small>Urea use is tracked alongside the calculation and is not automatically converted into an NOx reduction. Verify the reporting basis, emission factors and required report format.</small>`;
 };

 const loRows=$('#loRows');
 $('#addLoRow').onclick=()=>loRows.insertAdjacentHTML('beforeend','<div class="dynamic-row lo-row"><label>Date<input class="lo-date" type="date"></label><label>Cumulative running hours<input class="lo-hours" type="number" step=".1"></label><label>Oil added L<input class="lo-liters" type="number" step=".1"></label><button type="button" class="btn small remove-row">Remove</button></div>');
 loRows.addEventListener('click',e=>{if(e.target.matches('.remove-row')&&$$('.lo-row',loRows).length>2)e.target.closest('.lo-row').remove()});
 $('#calcLoTrend').onclick=()=>{const rows=$$('.lo-row',loRows).map(r=>({date:new Date($('.lo-date',r).value),hours:+$('.lo-hours',r).value,liters:+$('.lo-liters',r).value})).filter(x=>!Number.isNaN(x.date.getTime())&&x.hours>=0&&x.liters>=0).sort((a,b)=>a.date-b.date);if(rows.length<2)return setRes('resLoTrend','Need a baseline plus at least one later reading.','','caution');let totalL=0,totalH=0,intervals=[];for(let i=1;i<rows.length;i++){const dh=rows[i].hours-rows[i-1].hours;if(dh>0){const l=rows[i].liters,rate=l/dh*1000;intervals.push({rate});totalL+=l;totalH+=dh}}if(!intervals.length)return setRes('resLoTrend','Running hours must increase between readings.','','caution');const spanDays=(rows.at(-1).date-rows[0].date)/86400000,overall=totalL/totalH*1000,latest=intervals.at(-1).rate,lpd=spanDays>0?totalL/spanDays:0,ratio=overall?latest/overall:1,status=ratio>1.25?'caution':'ok',trend=ratio>1.25?'Latest interval is more than 25% above the overall rate.':ratio<0.75?'Latest interval is more than 25% below the overall rate.':'Latest interval is broadly in line with the overall rate.';setRes('resLoTrend',`${nf(overall,2)} L/1000 h overall · ${nf(latest,2)} L/1000 h latest`,`${nf(totalL,1)} L over ${nf(totalH,0)} running hours · ${nf(lpd,2)} L/day over ${nf(spanDays,1)} days. ${trend}`,status)};
}


function renderElectrical(){
 $('#electrical').innerHTML=pageTitle('Electrical','Common electrical calculations first, with specialist tools available under Advanced.')+`
 <article class="panel tool-selector"><div class="panel-body"><label>Show tools<select id="elView"><option value="everyday">Everyday electrical tools</option><option value="advanced">Advanced electrical tools</option><option value="all">Show all</option></select></label></div></article>
 <div class="tool-grid">
 ${groupedCard('everyday','Three-phase power','Calculate electrical kW and kVA from voltage, current and power factor.',`<div class="fields three"><label>Line voltage V<input id="elV" type="number" value="400"></label><label>Current A<input id="elA" type="number" value="143"></label><label>Power factor<input id="elPf" type="number" step=".01" value=".85"></label></div>${calcButton('calc3p')}${result('res3p')}`)}

 ${groupedCard('advanced','Voltage drop','Estimate 3-phase voltage drop from current, length and conductor resistance.',`<div class="fields"><label>Current A<input id="vdA" type="number" value="80"></label><label>One-way length m<input id="vdL" type="number" value="50"></label><label>Resistance Ω/km<input id="vdR" type="number" step=".001" value=".727"></label><label>System voltage V<input id="vdV" type="number" value="400"></label></div>${calcButton('calcVD')}${result('resVD')}`)}

 ${groupedCard('everyday','Battery runtime','Estimate runtime from nominal energy, SOC range and load.',`<div class="fields"><label>Battery capacity kWh<input id="batKwh" type="number" value="500"></label><label>Current SOC %<input id="batSoc" type="number" value="80"></label><label>Minimum SOC %<input id="batMin" type="number" value="20"></label><label>Load kW<input id="batLoad" type="number" value="100"></label></div><details class="advanced-inputs"><summary>Advanced input</summary><label>Usable efficiency %<input id="batEff" type="number" value="92"></label></details>${calcButton('calcBat')}${result('resBat')}`)}

 ${groupedCard('everyday','Motor current','Estimate three-phase running current from motor output power.',`<div class="subgroup"><h4>Motor</h4><div class="fields"><label>Output power kW<input id="motKw" type="number" step=".1" value="75"></label><label>Line voltage V<input id="motV" type="number" value="400"></label></div></div><details class="advanced-inputs"><summary>Motor data</summary><div class="fields"><label>Power factor<input id="motPf" type="number" step=".01" value=".85"></label><label>Efficiency %<input id="motEff" type="number" value="92"></label></div></details>${calcButton('calcMotor')}${result('resMotor')}`)}

 ${groupedCard('advanced','Power factor correction','Estimate capacitor reactive power required to improve power factor.',`<div class="fields"><label>Active power kW<input id="pfKw" type="number" step=".1" value="300"></label><label>Present power factor<input id="pfNow" type="number" step=".01" value=".75"></label><label>Target power factor<input id="pfTarget" type="number" step=".01" value=".95"></label></div>${calcButton('calcPfCorr')}${result('resPfCorr')}`)}

 ${groupedCard('everyday','Transformer calculator','Calculate nominal primary and secondary line currents for a three-phase transformer.',`<div class="fields"><label>Transformer rating kVA<input id="trKva" type="number" step=".1" value="500"></label><label>Primary voltage V<input id="trV1" type="number" value="690"></label><label>Secondary voltage V<input id="trV2" type="number" value="400"></label></div>${calcButton('calcTransformer')}${result('resTransformer')}`)}

 ${groupedCard('everyday','Current imbalance','Calculate phase-current imbalance.',`<div class="fields three"><label>L1 A<input id="l1" type="number" value="141"></label><label>L2 A<input id="l2" type="number" value="148"></label><label>L3 A<input id="l3" type="number" value="137"></label></div>${calcButton('calcImbalance')}${result('resImbalance')}`)}
 </div>`;bindElectrical();
}
function bindElectrical(){
 const applyElView=()=>{const v=$('#elView').value;$$('#electrical .tool-card[data-tool-group]').forEach(c=>c.hidden=v!=='all'&&c.dataset.toolGroup!==v)};
 $('#elView').onchange=applyElView;applyElView();

 $('#calc3p').onclick=()=>{const v=+$('#elV').value,a=+$('#elA').value,pf=+$('#elPf').value;if(!(v>0&&a>=0&&pf>0&&pf<=1))return setRes('res3p','Check voltage, current and power factor.','','caution');const kva=Math.sqrt(3)*v*a/1000,kw=kva*pf;setRes('res3p',`${nf(kw,1)} kW · ${nf(kva,1)} kVA`,`Electrical input power at power factor ${nf(pf,2)}.`)};
 $('#calcVD').onclick=()=>{const a=+$('#vdA').value,l=+$('#vdL').value,r=+$('#vdR').value,v=+$('#vdV').value,drop=Math.sqrt(3)*a*r*(l/1000),pct=drop/v*100;setRes('resVD',`${nf(drop,2)} V · ${nf(pct,2)}%`,`Simplified resistive 3-phase estimate; reactance, temperature and installation method are not included.`,pct>5?'caution':'ok')};
 $('#calcBat').onclick=()=>{const k=+$('#batKwh').value,s=+$('#batSoc').value,m=+$('#batMin').value,l=+$('#batLoad').value,e=+$('#batEff').value/100,usable=k*Math.max(0,s-m)/100*e,h=usable/l;setRes('resBat',`${nf(usable,1)} kWh usable · ${formatHours(h)}`,`From ${s}% to ${m}% SOC at constant ${l} kW load.`)};
 $('#calcMotor').onclick=()=>{const p=+$('#motKw').value,v=+$('#motV').value,pf=+$('#motPf').value,eff=+$('#motEff').value/100;if(!(p>=0&&v>0&&pf>0&&pf<=1&&eff>0&&eff<=1))return setRes('resMotor','Check voltage, power factor and efficiency.','','caution');const a=p*1000/(Math.sqrt(3)*v*pf*eff);setRes('resMotor',`${nf(a,1)} A estimated running current`,`For ${nf(p,1)} kW motor output at PF ${nf(pf,2)} and ${nf(eff*100,0)}% efficiency.`)};
 $('#calcPfCorr').onclick=()=>{const p=+$('#pfKw').value,p1=+$('#pfNow').value,p2=+$('#pfTarget').value;if(!(p>=0&&p1>0&&p1<=1&&p2>0&&p2<=1&&p2>p1))return setRes('resPfCorr','Target PF must be greater than present PF and both ≤ 1.','','caution');const q=p*(Math.tan(Math.acos(p1))-Math.tan(Math.acos(p2)));setRes('resPfCorr',`${nf(q,1)} kVAr correction`,`Approximate capacitor reactive power from PF ${nf(p1,2)} to ${nf(p2,2)}.`)};
 $('#calcTransformer').onclick=()=>{const kva=+$('#trKva').value,v1=+$('#trV1').value,v2=+$('#trV2').value;if(!(kva>0&&v1>0&&v2>0))return setRes('resTransformer','Check kVA and voltages.','','caution');const i1=kva*1000/(Math.sqrt(3)*v1),i2=kva*1000/(Math.sqrt(3)*v2);setRes('resTransformer',`Primary ${nf(i1,1)} A · Secondary ${nf(i2,1)} A`,`Nominal 3-phase currents at ${nf(kva,1)} kVA.`)};
 $('#calcImbalance').onclick=()=>{const a=[+$('#l1').value,+$('#l2').value,+$('#l3').value],avg=a.reduce((x,y)=>x+y,0)/3,max=Math.max(...a.map(x=>Math.abs(x-avg))),pct=max/avg*100;setRes('resImbalance',`${nf(avg,1)} A average · ${nf(pct,2)}% max imbalance`,`Calculated as maximum deviation from average / average.`)};
}

function renderQuick(){
 $('#quick').innerHTML=pageTitle('Quick Tools','Fast everyday conversions and reference helpers.')+`<div class="tool-grid">
 ${card('Speed · distance · time','Calculate any simple passage-time relationship.',`<div class="fields"><label>Distance NM<input id="qDist" type="number" value="80"></label><label>Speed kn<input id="qSpeed" type="number" value="8"></label></div>${calcButton('calcDST')}${result('resDST')}`)}
 ${card('Beaufort converter','Approximate Beaufort force from wind speed.',`<label>Wind speed kn<input id="bfKn" type="number" value="22"></label>${calcButton('calcBf')}${result('resBf')}`)}
 ${card('Unit converter','Common nautical and engineering units.',`<div class="fields"><label>Value<input id="unitVal" type="number" value="10"></label><label>Conversion<select id="unitType"><option value="nm-km">NM → km</option><option value="km-nm">km → NM</option><option value="kn-ms">kn → m/s</option><option value="ms-kn">m/s → kn</option><option value="bar-kpa">bar → kPa</option><option value="kw-hp">kW → hp</option><option value="c-f">°C → °F</option></select></label></div>${calcButton('calcUnit')}${result('resUnit')}`)}
 ${card('Compass / gyro correction','Apply variation and deviation / gyro error using signed east-positive convention.',`<div class="fields"><label>Observed / compass course °<input id="compC" type="number" value="90"></label><label>Variation ° (+E / −W)<input id="compVar" type="number" value="2"></label><label>Deviation or gyro error ° (+E / −W)<input id="compDev" type="number" value="-1"></label></div>${calcButton('calcCompass')}${result('resCompass')}`)}
 </div>`;bindQuick();
}
function bindQuick(){
 $('#calcDST').onclick=()=>{const d=+$('#qDist').value,s=+$('#qSpeed').value,h=d/s;setRes('resDST',`${formatHours(h)}`,`${nf(d,1)} NM at ${nf(s,1)} kn.`)};
 $('#calcBf').onclick=()=>{const k=+$('#bfKn').value,b=beaufort(k);setRes('resBf',`Beaufort ${b.force} · ${b.desc}`,`${b.range} kn approximate range.`)};
 $('#calcUnit').onclick=()=>{const v=+$('#unitVal').value,t=$('#unitType').value,fn={"nm-km":x=>[x*1.852,'km'],"km-nm":x=>[x/1.852,'NM'],"kn-ms":x=>[x/1.943844,'m/s'],"ms-kn":x=>[x*1.943844,'kn'],"bar-kpa":x=>[x*100,'kPa'],"kw-hp":x=>[x*1.34102,'hp'],"c-f":x=>[x*9/5+32,'°F']}[t],r=fn(v);setRes('resUnit',`${nf(r[0],3)} ${r[1]}`,'')};
 $('#calcCompass').onclick=()=>{const c=+$('#compC').value,v=+$('#compVar').value,d=+$('#compDev').value,t=(c+v+d+360)%360;setRes('resCompass',`${nf(t,1)}° true`,`Uses signed east-positive corrections. Confirm convention against your vessel procedures.`)};
}
function beaufort(k){const rows=[[1,'Calm','0–1'],[3,'Light air','1–3'],[6,'Light breeze','4–6'],[10,'Gentle breeze','7–10'],[16,'Moderate breeze','11–16'],[21,'Fresh breeze','17–21'],[27,'Strong breeze','22–27'],[33,'Near gale','28–33'],[40,'Gale','34–40'],[47,'Strong gale','41–47'],[55,'Storm','48–55'],[63,'Violent storm','56–63'],[999,'Hurricane','64+']];for(let i=0;i<rows.length;i++)if(k<=rows[i][0])return{force:i,desc:rows[i][1],range:rows[i][2]}}

function renderProfile(){const p=state.profile;$('#profile').innerHTML=pageTitle('Vessel Profile','Shared vessel values are used by route, fuel and operational-envelope calculations.')+`<article class="panel"><div class="panel-body"><div class="fields three"><label>Vessel name<input id="pName" value="${esc(p.name)}"></label><label>LOA m<input id="pLoa" type="number" step=".1" value="${p.loa}"></label><label>Draft m<input id="pDraft" type="number" step=".1" value="${p.draft}"></label><label>Service speed kn<input id="pSpeed" type="number" step=".1" value="${p.serviceSpeed}"></label><label>Fuel consumption m³/day<input id="pFuel" type="number" step=".1" value="${p.fuelDay}"></label><label>Max Hs m<input id="pHs" type="number" step=".1" value="${p.maxHs}"></label><label>Max wind kn<input id="pWind" type="number" value="${p.maxWind}"></label><label>Max current kn<input id="pCur" type="number" step=".1" value="${p.maxCurrent}"></label><label>Minimum UKC m<input id="pUkc" type="number" step=".1" value="${p.minUKC}"></label><label>CPA alert NM<input id="pCpa" type="number" step=".1" value="${p.cpaAlert}"></label><label>AIS route corridor NM<input id="pCorr" type="number" step=".1" value="${p.corridor}"></label></div><div class="actions"><button class="btn primary" id="saveProfile">Save profile</button></div><p class="helper">Operational limits are user-defined planning values. Marine Tools does not determine safe limits for your vessel.</p></div></article>`;$('#saveProfile').onclick=saveProfile}
function saveProfile(){state.profile={name:$('#pName').value.trim(),loa:+$('#pLoa').value,draft:+$('#pDraft').value,serviceSpeed:+$('#pSpeed').value,fuelDay:+$('#pFuel').value,maxHs:+$('#pHs').value,maxWind:+$('#pWind').value,maxCurrent:+$('#pCur').value,minUKC:+$('#pUkc').value,cpaAlert:+$('#pCpa').value,corridor:+$('#pCorr').value};store.set(K.profile,state.profile);toast('Vessel profile saved.');renderEnvelope();updateHome()}

function renderSettings(){$('#settings').innerHTML=pageTitle('Settings','Local-only application preferences and data controls.')+`<div class="grid-2"><article class="panel"><div class="panel-body"><h3>Appearance</h3><label>Theme<select id="setTheme"><option value="dark">Dark maritime</option><option value="bridge">Bridge Dark</option></select></label><div class="actions"><button class="btn primary" id="saveSet">Save</button></div></div></article><article class="panel"><div class="panel-body"><h3>Local data</h3><p class="helper">Profile, route and comparison snapshot are stored in this browser. They are not automatically synced to a user account or project database.</p><div class="actions"><button class="btn" id="exportData">Export JSON</button><button class="btn" id="clearData">Clear local data</button><button class="btn" id="clearHistorySet">Clear calculation history</button>${button('Privacy & data','privacy','btn')}</div></div></article></div><article class="panel" style="margin-top:12px"><div class="panel-body"><h3>Data principle</h3><p class="helper">Marine Tools is designed to keep entered operational data local where possible. A live-data feature only sends the minimum route or position context needed to return the requested live result.</p></div></article>`;$('#setTheme').value=state.theme;$('#saveSet').onclick=()=>{setTheme($('#setTheme').value);toast('Settings saved.')};$('#exportData').onclick=exportData;$('#clearHistorySet').onclick=clearHistory;$('#clearData').onclick=()=>{if(confirm('Clear Marine Tools local data in this browser?')){Object.values(K).forEach(k=>localStorage.removeItem(k));location.reload()}}}
function exportData(){const data={profile:state.profile,route:state.route,lastAnalysis:store.get(K.lastAnalysis,null),favorites:favorites(),recent:recentTools(),history:calcHistory(),consumption:consumptionHistory(),bunkering:bunkeringHistory(),weatherCache:store.get(K.weatherCache,null),exported:new Date().toISOString()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='marine-tools-data.json';a.click();URL.revokeObjectURL(a.href)}

function renderSurvey(){$('#survey').innerHTML=pageTitle('Survey','Share what would make Marine Tools more useful in everyday work at sea.')+`<article class="panel survey-card"><img src="assets/marine-tools-shield.png" alt="Marine Tools"><h2>Help shape Marine Tools</h2><p>Marine Tools is an independent project developed and maintained by one person. The short survey asks seafarers which calculations, planning aids and technical helpers are genuinely useful. It takes about 2–3 minutes and does not require your name, employer or vessel name.</p><a class="btn primary" href="${SURVEY_URL}" target="_blank" rel="noopener">Take the survey →</a></article>`}
function renderSuggestions(){$('#suggestions').innerHTML=pageTitle('Suggestions','Suggest a new tool, improvement or report a problem.')+`<article class="panel survey-card"><div style="font-size:54px">✧</div><h2>Suggest something</h2><p>Ideas are welcome for practical calculations, planning aids, live maritime context and quick technical utilities. Click below to open a prepared email to Marine Tools.</p><a class="btn primary" href="${SUGGEST_URL}">Email a suggestion →</a><p class="helper" style="margin-top:12px">${CONTACT_EMAIL}</p></article>`}
function renderSupport(){
 $('#support').innerHTML=pageTitle('Support Marine Tools','Voluntary support for an independently developed maritime toolbox.')+`
 <article class="panel survey-card">
   <div style="font-size:54px">☕</div>
   <h2>Support continued development</h2>
   <p>Marine Tools is independently developed and maintained. If the tools are useful to you, you can support continued development and help cover hosting, services and future improvements.</p>
   <div class="notice" style="text-align:left;max-width:720px;margin:14px auto"><b>Marine Tools remains free to use.</b> Support is voluntary and does not unlock different calculation results, priority access or safety-related functionality.</div>
   <a class="btn primary" href="${SUPPORT_URL}" target="_blank" rel="noopener noreferrer">Support Marine Tools →</a>
   <p class="helper" style="margin-top:12px">Support is handled securely through Buy Me a Coffee.</p>
 </article>`;
}

function renderContact(){
 $('#contact').innerHTML=pageTitle('Business & contact','Business information, custom development requests and contact routes for Marine Tools.')+`
 <div class="grid-2">
   <article class="panel">
     <div class="panel-body">
       <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
         <img src="assets/marine-tools-shield.png" alt="Marine Tools" style="width:72px;height:72px;object-fit:contain">
         <div><div class="eyebrow">MARINE TOOLS</div><h2 style="margin:2px 0 0">Business information</h2></div>
       </div>
       <div class="source-box">
         <div class="source-item"><span>Legal entity</span><strong>WALTERFANG DESIGN</strong></div>
         <div class="source-item"><span>Organisation no.</span><strong>938 606 242</strong></div>
         
         <div class="source-item"><span>Website</span><strong>marinetools.app</strong></div><div class="source-item"><span>Email</span><strong><a href="mailto:contact@marinetools.app">contact@marinetools.app</a></strong></div>
       </div>
       <p class="helper" style="margin-top:14px">Marine Tools is a brand and project operated by Walterfang Design, a Norwegian sole proprietorship.</p><p class="helper">Invoices and paid custom development are provided by Walterfang Design.</p>
     </div>
   </article>
   <article class="panel">
     <div class="panel-body">
       <h2 style="margin-top:0">Custom maritime tools</h2>
       <p>Need a calculator or technical helper adapted to a vessel, company or recurring task? Use the custom-tool request form to describe the workflow, inputs and output you need.</p>
       <a class="btn primary" href="${CUSTOM_TOOL_URL}">Email a custom tool request →</a><p class="helper" style="margin-top:10px">The email opens with a short template. You can attach screenshots, spreadsheets or example calculations before sending.</p>
       <div class="notice" style="margin-top:16px"><b>Scope and price are agreed in writing before paid work begins.</b><br>Work outside the agreed scope is quoted separately before it is started.</div>
       <h3 style="margin-top:22px">Other enquiries</h3>
       <p class="helper">For general product ideas or bug reports, use Suggestions or email contact@marinetools.app. For voluntary project support, use Support Marine Tools.</p>
       <div class="actions">
         ${button('Send a suggestion','suggestions','btn')}
         ${button('Support Marine Tools','support','btn')}
       </div>
     </div>
   </article>
 </div>`;
}
function renderAbout(){
 $('#about').innerHTML=`<div class="about-hero"><div class="eyebrow">ABOUT THIS PROJECT</div><h1>Why Marine Tools exists</h1><p>Marine Tools is an independent maritime helper-tool project created to make common calculations, planning tasks and technical lookups easier to access in one place.</p></div>
 <div class="about-columns">
   <article class="panel bullet-box"><h3>What it is</h3><ul>
     <li>Calculation tools for navigation, engineering, electrical work, fuel and vessel operations</li>
     <li>Optional experimental live-data features kept separate from the core calculators</li>
     <li>Quick converters and technical utilities designed for PC, tablet and mobile use</li>
     <li>A free project shaped by practical feedback from seafarers</li>
   </ul></article>
   <article class="panel bullet-box"><h3>What it is not</h3><ul>
     <li>Not ECDIS or approved navigation equipment</li>
     <li>Not a PMS, electronic logbook or checklist/SMS system</li>
     <li>Not a certified decision-support system</li>
     <li>Not a replacement for vessel procedures, official publications or professional judgement</li>
   </ul></article>
 </div>
 <article class="panel" style="margin-top:12px"><div class="panel-body">
   <h2>Independent and focused</h2>
   <p>Marine Tools is currently designed, developed and maintained by <b>one person</b>. The scope is intentionally focused on practical helper tools that can save time or make routine calculations easier to verify.</p>
   <p>Features such as watch handover, maintenance management, checklists and electronic records are outside the intended purpose. The focus is simple: <b>useful tools for seafarers</b>.</p>
   <div class="notice"><b>Safety boundary:</b> All outputs are planning or calculation aids. Users remain responsible for checking data, assumptions, units and results against approved systems, official sources, vessel-specific documentation and applicable procedures.</div>
   <div class="actions" style="margin-top:16px">${button('Take the survey →','survey')}${button('Send a suggestion','suggestions','btn')}${button('Support Marine Tools','support','btn')}${button('Business & contact','contact','btn')}</div>
 </div></article>
 <div class="grid-2" style="margin-top:12px">
   <article class="panel bullet-box"><h3>Live data</h3><p>Weather point forecasts are provided as supporting context. AIS and route-context functions are explicitly marked experimental and kept separate from the core calculators. Source, data age and limitations must always be considered.</p></article>
   <article class="panel bullet-box"><h3>Privacy by design</h3><p>Vessel Profile, route and local settings are stored in this browser. Live-data requests send only the context needed to obtain the requested result. Marine Tools does not use operational data for advertising, profiling or unrelated purposes.</p><div class="actions" style="margin-top:12px">${button("Read Privacy & data","privacy","btn")}</div></article>
 </div>`;
}
function renderPrivacy(){
 $('#privacy').innerHTML=`<div class="about-hero"><div class="eyebrow">PRIVACY & DATA</div><h1>Local-first by design</h1><p>Marine Tools uses only the data needed to perform the calculation, save your local setup or return the live-data request you choose to make.</p></div>
 <div class="about-columns">
   <article class="panel bullet-box"><h3>Stored on your device</h3><ul>
     <li>Vessel Profile values</li>
     <li>Route waypoints created in the optional experimental Route Intelligence feature</li>
     <li>Theme and local application settings</li>
     <li>The previous route-analysis snapshot used for “What changed?”</li><li>Saved fuel, urea and lube-oil consumption history</li><li>Saved bunkering history</li><li>The last successful weather forecast for offline reference</li>
   </ul><p class="helper">These values are stored in your browser on the device you are using. They are not automatically synced to a Marine Tools account or central project database.</p></article>
   <article class="panel bullet-box"><h3>Not used for unrelated purposes</h3><ul>
     <li>No advertising or behavioural profiling</li>
     <li>No sale of vessel, route or calculation data</li>
     <li>No use of entered operational data to train AI models</li>
     <li>No intentional use for employment, disciplinary, enforcement or commercial assessment</li>
   </ul><p class="helper">Marine Tools has no user-account database and no function that lets another Marine Tools user retrieve your locally stored operational data.</p></article>
 </div>
 <article class="panel" style="margin-top:12px"><div class="panel-body">
   <h2>When live data is requested</h2>
   <p>Some tools require internet access. Only the route or position context needed to return the requested live result is sent to the Marine Tools API. Marine Tools does not intentionally store those requests in an application database for later unrelated use.</p>
   <div class="notice"><b>External infrastructure:</b> Internet requests necessarily pass through hosting, maritime-data, map and network providers. Those providers may process or retain technical request logs according to their own systems and policies.</div>
 </div></article>
 <div class="grid-2" style="margin-top:12px">
   <article class="panel bullet-box"><h3>Maps & live-data sources</h3><p>Map tiles and live maritime data are requested from external services when the relevant feature is used. Those services receive the technical information necessary to return the requested content.</p></article>
   <article class="panel bullet-box"><h3>Survey & suggestions</h3><p>Survey and suggestion submissions are handled through an external form service and are separate from locally stored Marine Tools operational data. Avoid submitting confidential vessel, company or personal information unless it is necessary.</p></article>
 </div>
 <article class="panel" style="margin-top:12px"><div class="panel-body">
   <h2>Your control</h2>
   <p>You can export your local Marine Tools data as JSON or erase it from this browser under <b>Settings → Local data</b>. Clearing browser site data will also remove locally stored Marine Tools data.</p>
   <p><b>Data principle:</b> collect as little as possible, keep user-entered operational data local where possible, and send only what is necessary when a live-data feature explicitly requires a network request.</p>
 </div></article>`;
}
function pageTitle(h,p){return `<div class="page-title"><div><div class="eyebrow">MARINE TOOLS</div><h1>${h}</h1><p>${p}</p></div></div>`}
function setRes(id,main,sub='',cls=''){const e=$('#'+id);if(!e)return;e.className=`result ${cls}`;e.innerHTML=`<strong>${main}</strong>${sub?`<small>${sub}</small>`:''}`}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function init(){renderHome();renderedPages.add('home');bindGlobal();syncFavoriteButtons();renderFavoriteHome();renderRecentHome();renderHistoryHome();updateHome();}
document.addEventListener('DOMContentLoaded',init);
})();
