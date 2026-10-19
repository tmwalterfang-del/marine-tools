/* Marine Tools For Students. Independent teaching examples and synthetic exercises.
   Each calculator has explicit arithmetic; no arbitrary expression evaluation. */
const F=(key,label,unit,initial,check="positive")=>({key,label,unit,initial,check});
window.MT_CALCULATORS=[
{
 id:"displacement",name:"Mass displacement",category:"Ship Stability",description:"Find displacement mass from submerged volume and water density.",
 fields:[F("volume","Submerged volume","m³",20000),F("density","Water density","t/m³",1.025)],
 compute:({volume,density})=>({value:volume*density,unit:"t",steps:[`Δ = ∇ × ρ = ${volume} × ${density}`,`Δ = ${(volume*density).toFixed(3)} t`]})
},
{
 id:"deadweight",name:"Deadweight",category:"Cargo & Survey",description:"Mass that may be carried as difference between displacement and lightship.",
 fields:[F("dis","Displacement","t",28000),F("light","Lightship mass","t",8500)],
 compute:({dis,light})=>({value:dis-light,unit:"t",steps:[`DWT = Δ − LS = ${dis} − ${light}`],invalid:light>dis?"Lightship exceeds displacement.":null})
},
{
 id:"add-kg",name:"New KG after loading",category:"Ship Stability",description:"Vertical center of gravity after adding a cargo mass; no free-surface correction.",
 fields:[F("dis","Initial displacement","t",10000),F("kg","Initial KG","m",6,"nonnegative"),F("load","Loaded mass","t",500,"nonnegative"),F("loadkg","Cargo KG above keel","m",12,"nonnegative")],
 compute:({dis,kg,load,loadkg})=>({value:(dis*kg+load*loadkg)/(dis+load),unit:"m",steps:[`Old moment = ${dis} × ${kg} = ${(dis*kg).toFixed(2)} tm`,`Added moment = ${load} × ${loadkg} = ${(load*loadkg).toFixed(2)} tm`,`New KG = (${(dis*kg).toFixed(2)} + ${(load*loadkg).toFixed(2)}) / ${(dis+load).toFixed(2)}`]})
},
{
 id:"discharge-kg",name:"New KG after discharging",category:"Ship Stability",description:"Vertical center of gravity after removing a known weight.",
 fields:[F("dis","Initial displacement","t",12000),F("kg","Initial KG","m",6,"nonnegative"),F("removed","Discharged mass","t",700,"nonnegative"),F("remkg","Removed weight KG","m",10,"nonnegative")],
 compute:({dis,kg,removed,remkg})=>({value:(dis*kg-removed*remkg)/(dis-removed),unit:"m",steps:[`New KG = (Δ × KG − w × kg) / (Δ − w)`],invalid:removed>=dis?"Discharged mass must be less than original displacement.":null})
},
{
 id:"corrected-gm",name:"Corrected initial GM",category:"Ship Stability",description:"Demonstrates metacentric height corrected for a known free-surface deduction.",
 fields:[F("km","KM","m",9,"nonnegative"),F("kg","KG","m",7,"nonnegative"),F("fsc","Free-surface correction","m",0.25,"nonnegative")],
 compute:({km,kg,fsc})=>({value:km-kg-fsc,unit:"m",steps:[`GMcorr = KM − KG − FSC = ${km} − ${kg} − ${fsc}`],warning:km-kg-fsc<=0?"Non-positive initial GM: do not interpret as an operational stability approval.":null})
},
{
 id:"tpc",name:"Tonnes per centimetre (TPC)",category:"Ship Stability",description:"Approximate amount of mass for 1 cm parallel immersion at current waterplane.",
 fields:[F("aw","Waterplane area","m²",2000),F("rho","Water density","t/m³",1.025)],
 compute:({aw,rho})=>({value:aw*rho/100,unit:"t/cm",steps:[`TPC = Aw × ρ / 100 = ${aw} × ${rho} / 100`]})
},
{
 id:"draft-change",name:"Approximate draft change",category:"Cargo & Survey",description:"Uses a local TPC value; neglects change of TPC with draft and trim.",
 fields:[F("mass","Mass loaded","t",205,"nonnegative"),F("tpc","TPC","t/cm",20.5)],
 compute:({mass,tpc})=>({value:mass/tpc,unit:"cm",steps:[`Draft change = loaded mass / TPC = ${mass} / ${tpc}`]})
},
{
 id:"trim-change",name:"Simple trim change",category:"Cargo & Survey",description:"Calculated trim from known longitudinal trimming moment and MCT 1 cm.",
 fields:[F("weight","Weight shifted","t",100,"nonnegative"),F("distance","Longitudinal shift","m",20,"nonnegative"),F("mct","MCT 1 cm","tm/cm",200)],
 compute:({weight,distance,mct})=>({value:weight*distance/mct,unit:"cm",steps:[`Trimming moment = w × d = ${weight} × ${distance} tm`,`Trim change = moment / MCT 1 cm = ${(weight*distance).toFixed(3)} / ${mct}`],warning:"Magnitude only; the sign (trim by bow/stern) requires stated conventions."})
},
{
 id:"block-coefficient",name:"Block coefficient",category:"Ship Stability",description:"Ratio between immersed hull volume and enclosing box.",
 fields:[F("vol","Submerged volume","m³",18000),F("length","Reference length","m",150),F("breadth","Reference breadth","m",20),F("draft","Reference draft","m",8)],
 compute:({vol,length,breadth,draft})=>({value:vol/(length*breadth*draft),unit:"dimensionless",steps:["Cb = immersed volume / (L × B × T)"],warning:vol>length*breadth*draft?"Cb cannot exceed 1 with consistent dimensions.":null})
},
{
 id:"triangle",name:"Right-triangle hypotenuse",category:"Geometry & Trigonometry",description:"Pythagorean theorem for a right triangle.",
 fields:[F("a","Leg a","m",3,"nonnegative"),F("b","Leg b","m",4,"nonnegative")],
 compute:({a,b})=>({value:Math.hypot(a,b),unit:"m",steps:[`c = √(a² + b²) = √(${a}² + ${b}²)`]})
},
{
 id:"ohms-law",name:"Ohm's law current",category:"Electrical Engineering",description:"Current through a resistive component from voltage and resistance.",
 fields:[F("voltage","Voltage","V",230,"nonnegative"),F("res","Resistance","Ω",46)],
 compute:({voltage,res})=>({value:voltage/res,unit:"A",steps:[`I = U/R = ${voltage}/${res}`]})
},
{
 id:"dc-power",name:"DC electric power",category:"Electrical Engineering",description:"Power from DC voltage and current.",
 fields:[F("u","Voltage","V",24,"nonnegative"),F("i","Current","A",30,"nonnegative")],
 compute:({u,i})=>({value:u*i,unit:"W",steps:[`P = U × I = ${u} × ${i}`]})
},
{
 id:"three-phase",name:"Balanced three-phase power",category:"Electrical Engineering",description:"Active power using RMS line voltage, line current and power factor.",
 fields:[F("u","Line voltage","V",440),F("i","Line current","A",120,"nonnegative"),F("pf","Power factor cos φ","0–1",0.85,"unitinterval")],
 compute:({u,i,pf})=>({value:Math.sqrt(3)*u*i*pf/1000,unit:"kW",steps:[`P = √3 × Uₗ × Iₗ × cos φ / 1000`,`P = √3 × ${u} × ${i} × ${pf} / 1000`]})
},
{
 id:"series-resistance",name:"Series resistance",category:"Electrical Engineering",description:"Two resistors connected in series.",
 fields:[F("r1","R1","Ω",100),F("r2","R2","Ω",150)],
 compute:({r1,r2})=>({value:r1+r2,unit:"Ω",steps:[`Rtotal = R1 + R2 = ${r1} + ${r2}`]})
},
{
 id:"parallel-resistance",name:"Parallel resistance",category:"Electrical Engineering",description:"Equivalent resistance of two ideal parallel resistors.",
 fields:[F("r1","R1","Ω",100),F("r2","R2","Ω",200)],
 compute:({r1,r2})=>({value:(r1*r2)/(r1+r2),unit:"Ω",steps:[`1/Rtotal = 1/R1 + 1/R2`,`Rtotal = (${r1} × ${r2}) / (${r1} + ${r2})`]})
},
{
 id:"synchronous-speed",name:"Synchronous generator/motor speed",category:"Electrical Engineering",description:"Theoretical synchronous speed for an AC rotating magnetic field.",
 fields:[F("freq","Frequency","Hz",50),F("poles","Number of poles","count",4)],
 compute:({freq,poles})=>({value:120*freq/poles,unit:"rpm",steps:[`ns = 120 × f / p = 120 × ${freq} / ${poles}`],warning:poles%2?"Typical AC machine pole count is an even integer.":null})
},
{
 id:"hydraulic-power",name:"Ideal pump hydraulic power",category:"Fluids & Hydraulics",description:"Hydraulic power; does not account for shaft losses.",
 fields:[F("rho","Fluid density","kg/m³",1000),F("flow","Volume flow","m³/h",36),F("head","Pump head","m",20)],
 compute:({rho,flow,head})=>({value:rho*9.80665*(flow/3600)*head/1000,unit:"kW",steps:[`Q = ${flow} / 3600 m³/s`,`P = ρgQH / 1000`]})
},
{
 id:"pump-time",name:"Tank pumping time",category:"Fluids & Hydraulics",description:"Simple transfer duration at constant volumetric flow.",
 fields:[F("vol","Transferred volume","m³",150,"nonnegative"),F("flow","Flow","m³/h",50)],
 compute:({vol,flow})=>({value:vol/flow,unit:"h",steps:[`t = V / Q = ${vol} / ${flow}`]})
},
{
 id:"voyage-fuel",name:"Passage fuel estimate",category:"Machinery & Energy",description:"Simplified constant-speed daily fuel estimate, no reserve included.",
 fields:[F("dist","Distance","NM",1200,"nonnegative"),F("speed","Speed over ground","kn",12),F("daily","Fuel consumption","m³/day",24,"nonnegative")],
 compute:({dist,speed,daily})=>({value:dist/speed/24*daily,unit:"m³",steps:[`Sea time = ${dist} / ${speed} = ${(dist/speed).toFixed(2)} h`,`Fuel = sea time / 24 × ${daily}`]})
},
{
 id:"battery-runtime",name:"Battery autonomy",category:"Machinery & Energy",description:"Illustrative available energy and run time for steady load.",
 fields:[F("cap","Nominal battery energy","kWh",800),F("dod","Permitted DoD","fraction",0.8,"unitinterval"),F("eta","Efficiency","fraction",0.92,"unitinterval"),F("load","Electrical demand","kW",100)],
 compute:({cap,dod,eta,load})=>({value:cap*dod*eta/load,unit:"h",steps:[`Usable energy = ${cap} × ${dod} × ${eta} = ${(cap*dod*eta).toFixed(2)} kWh`,`Duration = usable energy / ${load}`]})
},
{
 id:"heat-energy",name:"Sensible heating energy",category:"Thermodynamics",description:"Approximate heat required at constant specific heat, ignoring losses.",
 fields:[F("m","Mass","kg",100),F("cp","Specific heat","kJ/(kg·K)",4.18),F("dt","Temperature increase","K",20,"nonnegative")],
 compute:({m,cp,dt})=>({value:m*cp*dt/3600,unit:"kWh",steps:[`Q = m × cp × ΔT = ${m} × ${cp} × ${dt} kJ`,`Convert kJ to kWh: ÷3600`]})
},
{
 id:"shaft-power",name:"Shaft power",category:"Machinery & Energy",description:"Mechanical power from rotational speed and torque.",
 fields:[F("rpm","Speed","rpm",1500),F("torque","Torque","N·m",500,"nonnegative")],
 compute:({rpm,torque})=>({value:2*Math.PI*rpm*torque/60000,unit:"kW",steps:[`P = 2π n M / (60 × 1000)`,`n = ${rpm} rpm; M = ${torque} N·m`]})
},
{
 id:"sfoc",name:"Specific fuel consumption",category:"Machinery & Energy",description:"Specific fuel oil consumption from a measured fuel mass flow and output.",
 fields:[F("fuel","Fuel flow","kg/h",150,"nonnegative"),F("power","Shaft power","kW",750)],
 compute:({fuel,power})=>({value:fuel*1000/power,unit:"g/kWh",steps:[`SFOC = (${fuel} kg/h × 1000 g/kg) / ${power} kW`]})
},
{
 id:"fuel-density",name:"Fuel mass from volume",category:"Machinery & Energy",description:"Use density at the same actual/reference temperature as the measured volume.",
 fields:[F("vol","Fuel volume","m³",15,"nonnegative"),F("rho","Fuel density","t/m³",0.85)],
 compute:({vol,rho})=>({value:vol*rho,unit:"t",steps:[`Mass = volume × density = ${vol} × ${rho}`]})
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
