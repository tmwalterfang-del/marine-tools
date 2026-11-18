/* Independent educational calculators; benchmark inputs are synthetic. */
(function(){
 const S=window.MT_STUDENT_STEP;
 if(typeof S!=="function")throw Error("Load calculators.js first: MT_STUDENT_STEP is unavailable");

 const F=(key,label,unit,initial,check="positive")=>({key,label,unit,initial,check});
 const R=(value,unit,steps,extra={})=>({value,unit,steps,...extra});
 const extra=[
  {id:"molar-concentration",name:"Molar concentration",category:"Chemistry",
   description:"Concentration from dissolved solute amount and solution volume.",
   fields:[F("n","Amount","mol",0.5),F("v","Solution volume","L",2)],
   compute:({n,v})=>R(n/v,"mol/L",["c = n / V",n+" mol / "+v+" L"])},
  {id:"radioactive-half-life",name:"Remaining mass after half-lives",category:"Chemistry",
   description:"Mathematical decay model; not for radiation safety decisions.",
   fields:[F("initial","Initial mass","g",100),F("time","Elapsed time","days",12,"nonnegative"),F("half","Half-life","days",6)],
   compute:({initial,time,half})=>R(initial*Math.pow(2,-time/half),"g",["m(t) = m₀ × 2^(−t/T½)",S("half_lives",`t / T½ = ${time} / ${half}`,time/half,"dimensionless"),S("remaining_fraction","2^(−t/T½)",Math.pow(2,-time/half),"dimensionless"),S("mass_g",`m(t) = ${initial} × 2^(−t/T½)`,initial*Math.pow(2,-time/half),"g")]),
   assumptions:["A single isotope decays with a constant half-life; daughter products and external sources are excluded."],
   range:"m₀ > 0 g; t ≥ 0 days; T½ > 0 days."
  },
  {id:"sound-db",name:"Power gain in decibels",category:"Electronics & Digital",
   description:"Logarithmic power ratio.",
   fields:[F("out","Output power","W",100),F("input","Input power","W",10)],
   compute:({out,input})=>R(10*Math.log10(out/input),"dB",["G = 10 log₁₀(P₂ / P₁)",S("power_ratio",`P₂ / P₁ = ${out} / ${input}`,out/input,"ratio"),S("gain_dB","G = 10 log₁₀(P₂ / P₁)",10*Math.log10(out/input),"dB")]),
   assumptions:["Both powers use compatible measurement conditions; the result is an unweighted power ratio."],
   range:"P₁ > 0 W; P₂ > 0 W."
  },
  {id:"rc-filter",name:"RC low-pass cutoff",category:"Electronics & Digital",
   description:"Ideal first-order RC cutoff.",
   fields:[F("r","Resistance","kΩ",10),F("c","Capacitance","µF",1)],
   compute:({r,c})=>R(1/(2*Math.PI*(r*1000)*(c*1e-6)),"Hz",["fc = 1 / (2πRC)",S("resistance_ohm",`R = ${r} × 1000`,r*1000,"Ω"),S("capacitance_F",`C = ${c} × 10⁻⁶`,c*1e-6,"F"),S("time_constant_s","τ = RC",(r*1000)*(c*1e-6),"s"),S("cutoff_Hz","fc = 1 / (2πτ)",1/(2*Math.PI*(r*1000)*(c*1e-6)),"Hz")]),
   assumptions:["Ideal first-order RC low-pass circuit; source impedance, loading and component parasitics are ignored."],
   range:"R > 0 kΩ; C > 0 µF."
  },
  {id:"fullwave-rectifier",name:"Full-wave rectifier mean DC",category:"Power Electronics",
   description:"Unfiltered ideal single-phase full-wave sinusoidal rectifier.",
   fields:[F("rms","Input RMS voltage","V",24)],
   compute:({rms})=>R(2*Math.SQRT2*rms/Math.PI,"V DC mean",["V̄ = 2√2 Vrms / π",S("peak_V",`Vm = √2 × ${rms}`,Math.SQRT2*rms,"V"),S("mean_V","V̄ = 2Vm / π",2*Math.SQRT2*rms/Math.PI,"V DC mean")]),
   assumptions:["Sinusoidal input and ideal diodes with no smoothing capacitor; diode drops and source impedance are ignored."],
   range:"Vrms > 0 V."
  },
  {id:"buck-converter",name:"Ideal buck converter",category:"Power Electronics",
   description:"Ideal continuous-conduction steady-state buck model.",
   fields:[F("vin","Input voltage","V",48),F("d","Duty cycle","0–1",0.5,"unitinterval")],
   compute:({vin,d})=>R(vin*d,"V",["Vout = D × Vin"])},
  {id:"engine-displacement",name:"Engine swept volume",category:"Marine Engines",
   description:"Swept volume from bore, stroke and number of cylinders.",
   fields:[F("bore","Cylinder bore","mm",300),F("stroke","Piston stroke","mm",400),F("cyl","Cylinders","count",6)],
   compute:({bore,stroke,cyl})=>R(Math.PI*(bore/1000)**2*(stroke/1000)*cyl/4*1000,"L",["V = zπD²S / 4","Convert mm to m; convert m³ to litres by ×1000.",S("bore_m",`D = ${bore} / 1000`,bore/1000,"m"),S("stroke_m",`S = ${stroke} / 1000`,stroke/1000,"m"),S("cylinder_volume_m3","V₁ = πD²S / 4",Math.PI*(bore/1000)**2*(stroke/1000)/4,"m³"),S("total_volume_m3",`V = ${cyl} × V₁`,Math.PI*(bore/1000)**2*(stroke/1000)*cyl/4,"m³"),S("total_volume_L","V[L] = V[m³] × 1000",Math.PI*(bore/1000)**2*(stroke/1000)*cyl/4*1000,"L")],{invalid:Number.isInteger(cyl)?null:"Cylinder count must be whole."}),
   assumptions:["All cylinders have identical circular bores and strokes; clearance volume is excluded."],
   range:"D > 0 mm; S > 0 mm; z is a positive integer."
  },
  {id:"mean-piston-speed",name:"Mean piston speed",category:"Marine Engines",
   description:"Piston travel distance per unit time.",
   fields:[F("stroke","Stroke","m",0.5),F("rpm","Engine speed","rpm",600)],
   compute:({stroke,rpm})=>R(2*stroke*rpm/60,"m/s",["cₘ = 2Sn / 60",S("travel_per_rev_m",`2S = 2 × ${stroke}`,2*stroke,"m"),S("speed_revs",`n = ${rpm} / 60`,rpm/60,"rev/s"),S("piston_speed_ms",`cₘ = 2 × ${stroke} × ${rpm} / 60`,2*stroke*rpm/60,"m/s")]),
   assumptions:["The piston travels two strokes per crankshaft revolution; this is mean speed, not peak speed."],
   range:"S > 0 m; n > 0 rpm."
  },
  {id:"wet-steam-enthalpy",name:"Wet steam: specific enthalpy",category:"Steam Engineering",
   description:"Ideal saturated mixture: enter independently sourced h values at same pressure.",
   fields:[F("hf","Saturated-liquid enthalpy","kJ/kg",670,"nonnegative"),F("hg","Saturated-vapour enthalpy","kJ/kg",2750,"nonnegative"),F("x","Dryness fraction","0–1",0.9,"unitinterval")],
   compute:({hf,hg,x})=>R(hf+x*(hg-hf),"kJ/kg",["h = hf + x(hg − hf)"],
    {invalid:hg>hf?null:"Vapour enthalpy must exceed liquid enthalpy."})},
  {id:"steam-boiler-heat",name:"Steam boiler heat duty",category:"Steam Engineering",
   description:"Steady-flow heat duty ignoring losses and kinetic energy.",
   fields:[F("flow","Mass flow","kg/h",2000),F("hout","Outlet enthalpy","kJ/kg",2800,"any"),F("hin","Inlet enthalpy","kJ/kg",400,"any")],
   compute:({flow,hout,hin})=>R(flow*(hout-hin)/3600,"kW",["Q̇ = ṁ(h₂ − h₁)",S("flow_kgs",`ṁ = ${flow} / 3600`,flow/3600,"kg/s"),S("enthalpy_rise_kJkg",`Δh = ${hout} − ${hin}`,hout-hin,"kJ/kg"),S("heat_kW",`Q̇ = ${flow} × Δh / 3600`,flow*(hout-hin)/3600,"kW")]),
   assumptions:["Steady flow with enthalpies on one reference datum; heat losses, shaft work and kinetic and potential energy changes are ignored."],
   range:"ṁ > 0 kg/h; finite h₁ and h₂ in kJ/kg; a negative duty denotes heat removal."
  },
  {id:"cooling-cop",name:"Cooling COP from enthalpies",category:"Refrigeration & Heat Pumps",
   description:"Illustrative vapour-compression cycle with defined state points.",
   fields:[F("h1","Compressor inlet h1","kJ/kg",400,"any"),F("h2","Compressor outlet h2","kJ/kg",450,"any"),F("h4","Evaporator inlet h4","kJ/kg",250,"any")],
   compute:({h1,h2,h4})=>R((h1-h4)/(h2-h1),"dimensionless",["COP = (h1 − h4) / (h2 − h1)",S("evaporator_heat_kJkg",`qL = ${h1} − ${h4}`,h1-h4,"kJ/kg"),S("compressor_work_kJkg",`w = ${h2} − ${h1}`,h2-h1,"kJ/kg"),S("cop","COP = qL / w",(h1-h4)/(h2-h1),"dimensionless")],{invalid:h2>h1&&h1>h4?null:"Require h2 > h1 > h4."}),
   assumptions:["Steady vapour-compression cycle with negligible kinetic and potential energy changes; auxiliary power is excluded.","All enthalpies refer to the same refrigerant and reference datum."],
   range:"Finite enthalpies in kJ/kg with h2 > h1 > h4."
  },
  {id:"shaft-torsion",name:"Solid shaft polar moment",category:"Machine Elements",
   description:"Polar second moment of area for a solid circular shaft.",
   fields:[F("d","Diameter","mm",100)],
   compute:({d})=>R(Math.PI*d**4/32,"mm⁴",["J = πd⁴ / 32",S("diameter_fourth_mm4",`d⁴ = ${d}⁴`,d**4,"mm⁴"),S("polar_moment_mm4","J = πd⁴ / 32",Math.PI*d**4/32,"mm⁴")]),
   assumptions:["Geometric polar second moment for a uniform solid circular section; hollow and non-circular sections require other models."],
   range:"d > 0 mm."
  },
  {id:"annuity-payment",name:"Equal periodic loan payment",category:"Engineering Economics",
   description:"Fixed-rate end-of-period loan payment, excluding fees.",
   fields:[F("pv","Present amount","NOK",100000),F("rate","Interest per period","%",5,"nonnegative"),F("periods","Periods","count",10)],
   compute:({pv,rate,periods})=>{
    const r=rate/100,a=r===0?pv/periods:pv*r/(-Math.expm1(-periods*Math.log1p(r)));
    return R(a,"NOK / period",[r===0?"A = PV / n (r = 0)":"A = PV × r / (1 − (1+r)^−n)",S("rate_fraction",`r = ${rate} / 100`,r,"dimensionless"),S("annuity_factor",r===0?`a = ${periods}`:"a = [1 − (1+r)^−n] / r",r===0?periods:(-Math.expm1(-periods*Math.log1p(r)))/r,"dimensionless"),S("payment_NOK",`A = ${pv} / a`,a,"NOK / period")],
     {invalid:Number.isInteger(periods)&&periods<=1000?null:"Periods must be a whole number ≤ 1000."});
   },
   assumptions:["Equal payments occur at each period end at a fixed effective interest rate; fees and taxes are excluded."],
   range:"PV > 0 NOK; rate ≥ 0 % per period; n is an integer from 1 to 1000."
  },
  {id:"npv",name:"NPV for constant annual flow",category:"Engineering Economics",
   description:"Fixed discount rate; equal year-end inflows; no taxes or residual values.",
   fields:[F("cost","Initial investment","NOK",100000),F("flow","Annual net inflow","NOK/year",30000,"nonnegative"),F("rate","Discount rate","%",6,"nonnegative"),F("years","Years","count",4)],
   compute:({cost,flow,rate,years})=>{
    const r=rate/100;let pv=0;
    const steps=["NPV = Σ CFₜ / (1+r)^t − I₀",S("rate_fraction",`r = ${rate} / 100`,r,"dimensionless")];
    if(Number.isInteger(years)&&years<=100)for(let i=1;i<=years;i++){
     const discounted=flow/(1+r)**i;
     pv+=discounted;
     steps.push(S(`pv_year_${i}`,`PV${i} = ${flow} / (1+${r})^${i}`,discounted,"NOK"));
    }
    steps.push(S("inflows_pv_NOK","PV = Σ CFₜ / (1+r)^t",pv,"NOK"),S("npv_NOK",`NPV = PV − ${cost}`,pv-cost,"NOK"));
    return R(pv-cost,"NOK",steps,
     {invalid:Number.isInteger(years)&&years<=100?null:"Years must be a whole number ≤ 100."});
   },
   assumptions:["Equal net inflows occur at each year end at a fixed effective annual discount rate; taxes and residual value are excluded."],
   range:"I₀ > 0 NOK; annual inflow ≥ 0 NOK/year; rate ≥ 0 %; n is an integer from 1 to 100."
  },
  {id:"wave-speed",name:"Wave speed",category:"Acoustics & Waves",
   description:"Wave speed from frequency and wavelength.",
   fields:[F("freq","Frequency","Hz",50),F("lambda","Wavelength","m",6)],
   compute:({freq,lambda})=>R(freq*lambda,"m/s",["v = fλ",S("speed_ms",`v = ${freq} × ${lambda}`,freq*lambda,"m/s")]),
   assumptions:["Frequency and wavelength describe the same wave in the same medium; the result is phase speed."],
   range:"f > 0 Hz; λ > 0 m."
  },
  {id:"sound-level",name:"Sound pressure level",category:"Acoustics & Waves",
   description:"RMS pressure level relative to chosen reference; different media have different references.",
   fields:[F("p","RMS pressure","Pa",0.02),F("p0","Reference pressure","Pa",0.00002)],
   compute:({p,p0})=>R(20*Math.log10(p/p0),"dB re reference",["Lp = 20 log₁₀(p / p₀)",S("pressure_ratio",`p / p₀ = ${p} / ${p0}`,p/p0,"ratio"),S("level_dB","Lp = 20 log₁₀(p / p₀)",20*Math.log10(p/p0),"dB re reference")]),
   assumptions:["Pressure is RMS and the reference pressure is appropriate to the medium; no frequency weighting is applied."],
   range:"p > 0 Pa; p₀ > 0 Pa."
  }
 ];
 const existing=new Set(window.MT_CALCULATORS.map(c=>c.id));
 window.MT_CALCULATORS.push(...extra.filter(c=>!existing.has(c.id)));
})();
