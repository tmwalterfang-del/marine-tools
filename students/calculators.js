/* Marine Tools For Students. Independent teaching examples and synthetic exercises.
   Each calculator has explicit arithmetic; no arbitrary expression evaluation. */
window.MT_STUDENT_FORMAT=n=>Number(n).toLocaleString('en-GB',{
 maximumSignificantDigits:8,
 notation:Math.abs(n)>0&&(Math.abs(n)<.0001||Math.abs(n)>=1e7)?'scientific':'standard'
});
const F=(key,label,unit,initial,check="positive")=>({key,label,unit,initial,check});
// Keyed working step: the intermediate value is kept as a number (for tests and export) and shown as "expr = value unit".
const S=(key,expr,value,unit)=>({key,expr,value,unit,toString(){return `${this.expr} = ${window.MT_STUDENT_FORMAT(this.value)}${this.unit&&this.unit!=='dimensionless'?' '+this.unit:''}`}});
window.MT_STUDENT_STEP=S;
window.MT_CALCULATORS=[
{
 id:"displacement",name:"Mass displacement",category:"Ship Stability",description:"Find displacement mass from submerged volume and water density.",
 fields:[F("volume","Submerged volume","m³",20000),F("density","Water density","t/m³",1.025)],
 compute:({volume,density})=>({value:volume*density,unit:"t",steps:[`Δ = ∇ × ρ`,S("displacement_t",`Δ = ${volume} m³ × ${density} t/m³`,volume*density,"t")]}),
 assumptions:["The submerged volume is the moulded volume at the stated draft; appendages and shell plating are included only if they are in the volume."],range:"Submerged volume > 0 m³, water density > 0 t/m³ (about 1.000–1.030 for fresh to sea water)."
},
{
 id:"deadweight",name:"Deadweight",category:"Cargo & Survey",description:"Mass that may be carried as difference between displacement and lightship.",
 fields:[F("dis","Displacement","t",28000),F("light","Lightship mass","t",8500)],
 compute:({dis,light})=>({value:dis-light,unit:"t",steps:[`DWT = Δ − LS`,S("dwt_t",`DWT = ${dis} t − ${light} t`,dis-light,"t")],invalid:light>dis?"Lightship exceeds displacement.":null}),
 assumptions:["Displacement and lightship are in the same water density and the same mass unit."],range:"Lightship ≤ displacement, both > 0 t."
},
{
 id:"add-kg",name:"New KG after loading",category:"Ship Stability",description:"Vertical center of gravity after adding a cargo mass; no free-surface correction.",
 fields:[F("dis","Initial displacement","t",10000),F("kg","Initial KG","m",6,"nonnegative"),F("load","Loaded mass","t",500,"nonnegative"),F("loadkg","Cargo KG above keel","m",12,"nonnegative")],
 compute:({dis,kg,load,loadkg})=>({value:(dis*kg+load*loadkg)/(dis+load),unit:"m",steps:[`KG₁ = (Δ × KG + w × kg) / (Δ + w)`,S("moment_initial_tm",`Old moment = ${dis} × ${kg}`,dis*kg,"tm"),S("moment_added_tm",`Added moment = ${load} × ${loadkg}`,load*loadkg,"tm"),S("displacement_new_t",`Δ₁ = ${dis} + ${load}`,dis+load,"t"),S("kg_new_m",`KG₁ = (${window.MT_STUDENT_FORMAT(dis*kg)} + ${window.MT_STUDENT_FORMAT(load*loadkg)}) / ${window.MT_STUDENT_FORMAT(dis+load)}`,(dis*kg+load*loadkg)/(dis+load),"m")]}),
 assumptions:["Moments are taken about the keel; the loaded mass acts at its own centre of gravity.","No free-surface correction: use corrected GM for slack tanks."],range:"Displacement > 0 t; loaded mass, KG and cargo KG ≥ 0."
},
{
 id:"discharge-kg",name:"New KG after discharging",category:"Ship Stability",description:"Vertical center of gravity after removing a known weight.",
 fields:[F("dis","Initial displacement","t",12000),F("kg","Initial KG","m",6,"nonnegative"),F("removed","Discharged mass","t",700,"nonnegative"),F("remkg","Removed weight KG","m",10,"nonnegative")],
 compute:({dis,kg,removed,remkg})=>({value:(dis*kg-removed*remkg)/(dis-removed),unit:"m",steps:[`New KG = (Δ × KG − w × kg) / (Δ − w)`,S("moment_initial_tm",`Old moment = ${dis} × ${kg}`,dis*kg,"tm"),S("moment_removed_tm",`Removed moment = ${removed} × ${remkg}`,removed*remkg,"tm"),S("displacement_new_t",`Δ₁ = ${dis} − ${removed}`,dis-removed,"t"),S("kg_new_m",`KG₁ = (${window.MT_STUDENT_FORMAT(dis*kg)} − ${window.MT_STUDENT_FORMAT(removed*remkg)}) / ${window.MT_STUDENT_FORMAT(dis-removed)}`,(dis*kg-removed*remkg)/(dis-removed),"m")],invalid:removed>=dis?"Discharged mass must be less than original displacement.":null}),
 assumptions:["Moments are taken about the keel; the removed mass is taken from its own centre of gravity.","No free-surface correction."],range:"0 ≤ discharged mass < displacement; KG values ≥ 0."
},
{
 id:"corrected-gm",name:"Corrected initial GM",category:"Ship Stability",description:"Demonstrates metacentric height corrected for a known free-surface deduction.",
 fields:[F("km","KM","m",9,"nonnegative"),F("kg","KG","m",7,"nonnegative"),F("fsc","Free-surface correction","m",0.25,"nonnegative")],
 compute:({km,kg,fsc})=>({value:km-kg-fsc,unit:"m",steps:[`GMcorr = KM − KG − FSC`,S("gm_solid_m",`GM = ${km} − ${kg}`,km-kg,"m"),S("gm_corrected_m",`GMcorr = ${window.MT_STUDENT_FORMAT(km-kg)} − ${fsc}`,km-kg-fsc,"m")],warning:km-kg-fsc<=0?"Non-positive initial GM: do not interpret as an operational stability approval.":null}),
 assumptions:["Initial stability only (small heel angles); KM is read for the current displacement."],range:"KM, KG and free-surface correction ≥ 0 m."
},
{
 id:"tpc",name:"Tonnes per centimetre (TPC)",category:"Ship Stability",description:"Approximate amount of mass for 1 cm parallel immersion at current waterplane.",
 fields:[F("aw","Waterplane area","m²",2000),F("rho","Water density","t/m³",1.025)],
 compute:({aw,rho})=>({value:aw*rho/100,unit:"t/cm",steps:[`TPC = Aw × ρ / 100`,S("mass_per_metre_tm",`Aw × ρ = ${aw} × ${rho}`,aw*rho,"t/m"),S("tpc_tcm",`TPC = ${window.MT_STUDENT_FORMAT(aw*rho)} / 100`,aw*rho/100,"t/cm")]}),
 assumptions:["Waterplane area is constant over the 1 cm of immersion (wall-sided hull locally)."],range:"Waterplane area > 0 m², water density > 0 t/m³."
},
{
 id:"draft-change",name:"Approximate draft change",category:"Cargo & Survey",description:"Uses a local TPC value; neglects change of TPC with draft and trim.",
 fields:[F("mass","Mass loaded","t",205,"nonnegative"),F("tpc","TPC","t/cm",20.5)],
 compute:({mass,tpc})=>({value:mass/tpc,unit:"cm",steps:[`δT = w / TPC`,S("sinkage_cm",`δT = ${mass} t / ${tpc} t/cm`,mass/tpc,"cm")]}),
 assumptions:["Parallel sinkage: the mass is loaded at the centre of flotation, so trim does not change.","TPC is taken as constant over the draft change."],range:"Loaded mass ≥ 0 t, TPC > 0 t/cm; small changes compared with the draft."
},
{
 id:"trim-change",name:"Simple trim change",category:"Cargo & Survey",description:"Calculated trim from known longitudinal trimming moment and MCT 1 cm.",
 fields:[F("weight","Weight shifted","t",100,"nonnegative"),F("distance","Longitudinal shift","m",20,"nonnegative"),F("mct","MCT 1 cm","tm/cm",200)],
 compute:({weight,distance,mct})=>({value:weight*distance/mct,unit:"cm",steps:[`Trim = w × d / MCT1cm`,S("trimming_moment_tm",`Trimming moment = w × d = ${weight} × ${distance}`,weight*distance,"tm"),S("trim_cm",`Trim = ${window.MT_STUDENT_FORMAT(weight*distance)} / ${mct}`,weight*distance/mct,"cm")],warning:"Magnitude only; the sign (trim by bow/stern) requires stated conventions."}),
 assumptions:["MCT 1 cm is taken as constant for the current draft; the shift does not change displacement."],range:"Weight and shift ≥ 0, MCT 1 cm > 0 tm/cm."
},
{
 id:"block-coefficient",name:"Block coefficient",category:"Ship Stability",description:"Ratio between immersed hull volume and enclosing box.",
 fields:[F("vol","Submerged volume","m³",18000),F("length","Reference length","m",150),F("breadth","Reference breadth","m",20),F("draft","Reference draft","m",8)],
 compute:({vol,length,breadth,draft})=>({value:vol/(length*breadth*draft),unit:"dimensionless",steps:["Cb = immersed volume / (L × B × T)",S("box_volume_m3",`L × B × T = ${length} × ${breadth} × ${draft}`,length*breadth*draft,"m³"),S("cb",`Cb = ${vol} / ${window.MT_STUDENT_FORMAT(length*breadth*draft)}`,vol/(length*breadth*draft),"dimensionless")],warning:vol>length*breadth*draft?"Cb cannot exceed 1 with consistent dimensions.":null}),
 assumptions:["L, B and T are the same reference dimensions as the volume (e.g. LPP, moulded breadth, moulded draft)."],range:"All inputs > 0; the result should lie between 0 and 1."
},
{
 id:"triangle",name:"Right-triangle hypotenuse",category:"Geometry & Trigonometry",description:"Pythagorean theorem for a right triangle.",
 fields:[F("a","Leg a","m",3,"nonnegative"),F("b","Leg b","m",4,"nonnegative")],
 compute:({a,b})=>({value:Math.hypot(a,b),unit:"m",steps:[`c = √(a² + b²)`,S("sum_squares_m2",`a² + b² = ${a}² + ${b}²`,a*a+b*b,"m²"),S("hypotenuse_m",`c = √${window.MT_STUDENT_FORMAT(a*a+b*b)}`,Math.hypot(a,b),"m")]}),
 assumptions:["The angle between legs a and b is exactly 90°."],range:"Legs ≥ 0 m in the same unit."
},
{
 id:"ohms-law",name:"Ohm's law current",category:"Electrical Engineering",description:"Current through a resistive component from voltage and resistance.",
 fields:[F("voltage","Voltage","V",230,"nonnegative"),F("res","Resistance","Ω",46)],
 compute:({voltage,res})=>({value:voltage/res,unit:"A",steps:[`I = U / R`,S("current_A",`I = ${voltage} V / ${res} Ω`,voltage/res,"A")]}),
 assumptions:["Linear resistance at the operating temperature; DC or resistive AC (RMS values)."],range:"Voltage ≥ 0 V, resistance > 0 Ω."
},
{
 id:"dc-power",name:"DC electric power",category:"Electrical Engineering",description:"Power from DC voltage and current.",
 fields:[F("u","Voltage","V",24,"nonnegative"),F("i","Current","A",30,"nonnegative")],
 compute:({u,i})=>({value:u*i,unit:"W",steps:[`P = U × I`,S("power_W",`P = ${u} V × ${i} A`,u*i,"W")]}),
 assumptions:["Steady DC values at the same point in the circuit."],range:"Voltage and current ≥ 0."
},
{
 id:"three-phase",name:"Balanced three-phase power",category:"Electrical Engineering",description:"Active power using RMS line voltage, line current and power factor.",
 fields:[F("u","Line voltage","V",440),F("i","Line current","A",120,"nonnegative"),F("pf","Power factor cos φ","0–1",0.85,"unitinterval")],
 compute:({u,i,pf})=>{const apparent=Math.sqrt(3)*u*i/1000,active=apparent*pf,reactive=apparent*Math.sqrt(Math.max(0,1-pf*pf));return{value:active,unit:"kW",steps:[`P = √3 × Uₗ × Iₗ × cos φ / 1000`,S("apparent_kVA",`S = √3 × ${u} V × ${i} A / 1000`,apparent,"kVA"),S("reactive_kvar",`Q = S × √(1 − cos²φ)`,reactive,"kvar"),S("active_kW",`P = S × cos φ = S × ${pf}`,active,"kW")]}},
 assumptions:["Balanced, sinusoidal three-phase load; Uₗ and Iₗ are RMS line values.","Harmonics and unbalance are ignored."],range:"U > 0 V, I ≥ 0 A, 0 ≤ cos φ ≤ 1."
},
{
 id:"series-resistance",name:"Series resistance",category:"Electrical Engineering",description:"Two resistors connected in series.",
 fields:[F("r1","R1","Ω",100),F("r2","R2","Ω",150)],
 compute:({r1,r2})=>({value:r1+r2,unit:"Ω",steps:[`Rtotal = R1 + R2`,S("resistance_ohm",`Rtotal = ${r1} + ${r2}`,r1+r2,"Ω")]}),
 assumptions:["Ideal resistors and connecting wires with no resistance."],range:"R1, R2 > 0 Ω."
},
{
 id:"parallel-resistance",name:"Parallel resistance",category:"Electrical Engineering",description:"Equivalent resistance of two ideal parallel resistors.",
 fields:[F("r1","R1","Ω",100),F("r2","R2","Ω",200)],
 compute:({r1,r2})=>({value:(r1*r2)/(r1+r2),unit:"Ω",steps:[`1/Rtotal = 1/R1 + 1/R2`,S("conductance_S",`1/Rtotal = 1/${r1} + 1/${r2}`,1/r1+1/r2,"S"),S("resistance_ohm",`Rtotal = (${r1} × ${r2}) / (${r1} + ${r2})`,(r1*r2)/(r1+r2),"Ω")]}),
 assumptions:["Ideal resistors; the result is always smaller than the smallest branch."],range:"R1, R2 > 0 Ω."
},
{
 id:"synchronous-speed",name:"Synchronous generator/motor speed",category:"Electrical Engineering",description:"Theoretical synchronous speed for an AC rotating magnetic field.",
 fields:[F("freq","Frequency","Hz",50),F("poles","Number of poles","count",4)],
 compute:({freq,poles})=>({value:120*freq/poles,unit:"rpm",steps:[`ns = 120 × f / p`,S("speed_rps",`ns = 2 × ${freq} / ${poles}`,2*freq/poles,"r/s"),S("speed_rpm",`ns = 120 × ${freq} / ${poles}`,120*freq/poles,"rpm")],invalid:Number.isInteger(poles)?null:"Number of poles must be a whole number.",warning:poles%2?"Typical AC machine pole count is an even integer.":null}),
 assumptions:["p is the number of poles (not pole pairs). An induction motor runs slightly below this speed (slip)."],range:"Frequency > 0 Hz; poles a positive even whole number."
},
{
 id:"hydraulic-power",name:"Ideal pump hydraulic power",category:"Fluids & Hydraulics",description:"Hydraulic power; does not account for shaft losses.",
 fields:[F("rho","Fluid density","kg/m³",1000),F("flow","Volume flow","m³/h",36),F("head","Pump head","m",20)],
 compute:({rho,flow,head})=>{const q=flow/3600,w=rho*9.80665*q*head;return{value:w/1000,unit:"kW",steps:[`P = ρ g Q H`,S("flow_m3s",`Q = ${flow} m³/h / 3600`,q,"m³/s"),S("power_W",`P = ${rho} × 9.80665 × Q × ${head}`,w,"W"),S("power_kW",`P = P[W] / 1000`,w/1000,"kW")]}},
 assumptions:["Ideal hydraulic (water) power: pump, motor and shaft losses are not included.","Standard gravity g = 9.80665 m/s²; H is the total head the pump delivers."],range:"ρ > 0, Q > 0, H > 0. Divide by pump efficiency to estimate shaft power."
},
{
 id:"pump-time",name:"Tank pumping time",category:"Fluids & Hydraulics",description:"Simple transfer duration at constant volumetric flow.",
 fields:[F("vol","Transferred volume","m³",150,"nonnegative"),F("flow","Flow","m³/h",50)],
 compute:({vol,flow})=>({value:vol/flow,unit:"h",steps:[`t = V / Q`,S("time_h",`t = ${vol} m³ / ${flow} m³/h`,vol/flow,"h")]}),
 assumptions:["Constant flow for the whole transfer; no start-up, stripping or line-filling time."],range:"Volume ≥ 0 m³, flow > 0 m³/h."
},
{
 id:"voyage-fuel",name:"Passage fuel estimate",category:"Machinery & Energy",description:"Simplified constant-speed daily fuel estimate, no reserve included.",
 fields:[F("dist","Distance","NM",1200,"nonnegative"),F("speed","Speed over ground","kn",12),F("daily","Fuel consumption","m³/day",24,"nonnegative")],
 compute:({dist,speed,daily})=>{const h=dist/speed,d=h/24;return{value:d*daily,unit:"m³",steps:[S("sea_time_h",`Sea time = ${dist} NM / ${speed} kn`,h,"h"),S("sea_time_d",`t = t[h] / 24`,d,"d"),S("fuel_m3",`V = t[d] × ${daily} m³/d`,d*daily,"m³")]}},
 assumptions:["Constant speed over ground and constant daily consumption for the whole passage.","No reserve, weather margin, port time or auxiliary consumption is included."],range:"Distance ≥ 0 NM, speed > 0 kn, consumption ≥ 0 m³/day. Planning estimate only."
},
{
 id:"battery-runtime",name:"Battery autonomy",category:"Machinery & Energy",description:"Illustrative available energy and run time for steady load.",
 fields:[F("cap","Nominal battery energy","kWh",800),F("dod","Permitted DoD","fraction",0.8,"unitinterval"),F("eta","Efficiency","fraction",0.92,"unitinterval"),F("load","Electrical demand","kW",100)],
 compute:({cap,dod,eta,load})=>({value:cap*dod*eta/load,unit:"h",steps:[`t = E × DoD × η / P`,S("usable_energy_kWh",`Usable energy = ${cap} × ${dod} × ${eta}`,cap*dod*eta,"kWh"),S("runtime_h",`Duration = ${window.MT_STUDENT_FORMAT(cap*dod*eta)} kWh / ${load} kW`,cap*dod*eta/load,"h")]}),
 assumptions:["Constant load and efficiency; ageing, temperature and C-rate effects are ignored."],range:"Energy and load > 0; 0 ≤ DoD ≤ 1; 0 ≤ efficiency ≤ 1."
},
{
 id:"heat-energy",name:"Sensible heating energy",category:"Thermodynamics",description:"Approximate heat required at constant specific heat, ignoring losses.",
 fields:[F("m","Mass","kg",100),F("cp","Specific heat","kJ/(kg·K)",4.18),F("dt","Temperature increase","K",20,"nonnegative")],
 compute:({m,cp,dt})=>{const kj=m*cp*dt;return{value:kj/3600,unit:"kWh",steps:[`Q = m × cp × ΔT`,S("heat_kJ",`Q = ${m} kg × ${cp} kJ/(kg·K) × ${dt} K`,kj,"kJ"),S("heat_kWh",`Q = Q[kJ] / 3600`,kj/3600,"kWh")]}},
 assumptions:["Constant specific heat over the temperature range; no phase change.","Heat losses to the surroundings are ignored."],range:"m > 0 kg, cp > 0, ΔT ≥ 0 K. For evaporation or boiling use enthalpy (steam tables) instead."
},
{
 id:"shaft-power",name:"Shaft power",category:"Machinery & Energy",description:"Mechanical power from rotational speed and torque.",
 fields:[F("rpm","Speed","rpm",1500),F("torque","Torque","N·m",500,"nonnegative")],
 compute:({rpm,torque})=>{const w=2*Math.PI*rpm/60,p=w*torque;return{value:p/1000,unit:"kW",steps:[`P = ω M, ω = 2π n / 60`,S("omega_rads",`ω = 2π × ${rpm} / 60`,w,"rad/s"),S("power_W",`P = ω × ${torque} N·m`,p,"W"),S("power_kW",`P = P[W] / 1000`,p/1000,"kW")]}},
 assumptions:["Steady speed and torque (mean values over a revolution)."],range:"n > 0 rpm, M ≥ 0 N·m."
},
{
 id:"sfoc",name:"Specific fuel consumption",category:"Machinery & Energy",description:"Specific fuel oil consumption from a measured fuel mass flow and output.",
 fields:[F("fuel","Fuel flow","kg/h",150,"nonnegative"),F("power","Shaft power","kW",750)],
 compute:({fuel,power})=>{const g=fuel*1000;return{value:g/power,unit:"g/kWh",steps:[`SFOC = ṁ / P`,S("fuel_gh",`ṁ = ${fuel} kg/h × 1000`,g,"g/h"),S("sfoc_gkWh",`SFOC = ṁ / ${power} kW`,g/power,"g/kWh")]}},
 assumptions:["Fuel mass flow and power are measured over the same steady period.","Not corrected to ISO reference conditions or to a standard lower heating value (ISO 3046-1)."],range:"Fuel flow ≥ 0 kg/h, power > 0 kW."
},
{
 id:"fuel-density",name:"Fuel mass from volume",category:"Machinery & Energy",description:"Use density at the same actual/reference temperature as the measured volume.",
 fields:[F("vol","Fuel volume","m³",15,"nonnegative"),F("rho","Fuel density","t/m³",0.85)],
 compute:({vol,rho})=>({value:vol*rho,unit:"t",steps:[`m = V × ρ`,S("mass_t",`m = ${vol} m³ × ${rho} t/m³`,vol*rho,"t")]}),
 assumptions:["Density is for the same temperature as the measured volume (or both corrected to 15 °C)."],range:"Volume ≥ 0 m³, density > 0 t/m³."
},
{
 id:"seawater-density",name:"Seawater density (TEOS-10)",category:"Ship Stability",description:"Density of seawater from practical salinity, in-situ temperature and sea pressure.",
 fields:[F("sp","Practical salinity (PSS-78)","1",35,"nonnegative"),F("t","In-situ temperature","°C",15,"nonnegative"),F("p","Sea pressure","dbar",0,"nonnegative")],
 compute:({sp,t,p})=>{let r;try{r=window.MT_SEAWATER.density(sp,t,p)}catch(e){return{value:NaN,unit:"kg/m³",steps:[],invalid:e&&e.message?e.message:"Seawater density could not be calculated within the supported range."}}return{value:r.rho,unit:"kg/m³",steps:[`ρ = 1 / v, v = (∂g/∂P)|SA=SR, t, p`,S("sr_gkg",`SR = 35.16504 / 35 × ${sp}`,r.referenceSalinityGPerKg,"g/kg"),S("v_m3kg",`v = vW + vS = ${window.MT_STUDENT_FORMAT(r.pureWaterSpecificVolumeM3PerKg)} + (${window.MT_STUDENT_FORMAT(r.salineSpecificVolumeM3PerKg)})`,r.specificVolumeM3PerKg,"m³/kg"),`ρ = ${window.MT_STUDENT_FORMAT(r.rhoTPerM3)} t/m³`,S("rho_kgm3",`ρ = 1 / v`,r.rho,"kg/m³")]}},
 assumptions:["Absolute Salinity is taken as Reference Salinity (local salinity anomalies ignored).","In-situ temperature (ITS-90), not potential or Conservative Temperature."],range:"Salinity 0–40, temperature 0–40 °C, sea pressure 0–9989.87 dbar. For FWA/DWA use 0 dbar (surface)."
}
];
const mk=(id,category,prompt,expected,unit,steps,tolerance=0.05)=>({id,category,prompt,expected,unit,steps,tolerance});
window.MT_PRACTICE=[
 mk("disp-1","Ship Stability","A vessel displaces 12,000 m³ in seawater of density 1.025 t/m³. Find mass displacement.",12300,"t",["Δ = ∇ × ρ","12,000 × 1.025 = 12,300 t"]),
 mk("dwt-1","Cargo & Survey","A vessel has displacement 24,500 t and lightship mass 8,250 t. Find DWT.",16250,"t",["DWT = displacement − lightship","24,500 − 8,250 = 16,250 t"]),
 mk("gm-1","Ship Stability","KM is 9.1 m, KG is 7.5 m and free-surface correction is 0.3 m. Find corrected GM.",1.3,"m",["GM = KM − KG − FSC","9.1 − 7.5 − 0.3 = 1.3 m"]),
 mk("tpc-1","Ship Stability","Waterplane area is 2,000 m² and water density 1.025 t/m³. Find TPC.",20.5,"t/cm",["TPC = Aw × ρ / 100","2000 × 1.025 / 100 = 20.5 t/cm"]),
 mk("draft-1","Cargo & Survey","If TPC is 20 t/cm, how many centimetres of parallel sinkage result from loading 100 t?",5,"cm",["Change = load / TPC","100 / 20 = 5 cm"]),
 mk("trim-1","Cargo & Survey","A 100 t weight moves 30 m longitudinally. MCT 1 cm is 250 tm/cm. Find magnitude of trim change.",12,"cm",["Moment = 100 × 30 = 3,000 tm","Trim = 3,000 / 250 = 12 cm"]),
 mk("elec-1","Electrical Engineering","A 46 Ω heater is supplied at 230 V DC. Find current.",5,"A",["I = U / R","230 / 46 = 5 A"]),
 mk("elec-2","Electrical Engineering","A DC circuit has 24 V and 20 A. Find electric power.",480,"W",["P = U × I","24 × 20 = 480 W"]),
 mk("res-1","Electrical Engineering","Two resistors, 100 Ω and 200 Ω, are in series. Find total resistance.",300,"Ω",["R = R1 + R2","100 + 200 = 300 Ω"]),
 mk("res-2","Electrical Engineering","Two equal 100 Ω resistors are connected in parallel. Find equivalent resistance.",50,"Ω",["R = R1 R2 / (R1 + R2)","10,000 / 200 = 50 Ω"]),
 mk("motor-1","Electrical Engineering","A 4-pole synchronous motor runs on 50 Hz. Find synchronous speed.",1500,"rpm",["ns = 120 f / p","120 × 50 / 4 = 1,500 rpm"]),
 mk("pump-1","Fluids & Hydraulics","A pump moves 120 m³ at 40 m³/h. How many hours?",3,"h",["t = V / Q","120 / 40 = 3 h"]),
 mk("passage-1","Navigation","A passage is 360 NM at 12 kn SOG. Find sea time.",30,"h",["t = d / v","360 / 12 = 30 h"]),
 mk("fuel-1","Machinery & Energy","A vessel consumes 24 m³/day. Estimate consumption during a 100-hour voyage.",100,"m³",["Fuel = daily rate × hours/24","24 × 100 / 24 = 100 m³"]),
 mk("fuel-2","Machinery & Energy","A tank contains 20 m³ at density 0.85 t/m³ (same measurement temperature). Find fuel mass.",17,"t",["m = ρV","0.85 × 20 = 17 t"]),
 mk("energy-1","Machinery & Energy","An 800 kWh ESS uses 80% DoD and 90% efficiency at a constant 96 kW load. Find hours.",6,"h",["Usable energy = 800 × 0.8 × 0.9 = 576 kWh","t = 576 / 96 = 6 h"]),
 mk("eng-1","Machinery & Energy","A generator produces 200 kW while consuming 40 kg of fuel per hour. Find SFOC.",200,"g/kWh",["SFOC = kg/h × 1000 / kW","40 × 1000 / 200 = 200 g/kWh"]),
 mk("mech-1","Mechanics","A 300 kg object accelerates at 2 m/s². Find net force.",600,"N",["F = ma","300 × 2 = 600 N"]),
 mk("geo-1","Geometry & Trigonometry","A right triangle has legs 3 m and 4 m. Find hypotenuse.",5,"m",["c = √(a² + b²)","√(3² + 4²) = 5 m"]),
 mk("therm-1","Thermodynamics","100 kg of liquid at cp=4.2 kJ/(kg K) warms by 10 K. Find heat in kJ.",4200,"kJ",["Q = mcΔT","100 × 4.2 × 10 = 4,200 kJ"])
];
