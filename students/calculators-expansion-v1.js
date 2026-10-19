/* Independent educational calculators; benchmark inputs are synthetic. */
(function(){
 const F=(key,label,unit,initial,check="positive")=>({key,label,unit,initial,check});
 const R=(value,unit,steps,extra={})=>({value,unit,steps,...extra});
 const extra=[
  {id:"molar-concentration",name:"Molar concentration",category:"Chemistry",
   description:"Concentration from dissolved solute amount and solution volume.",
   fields:[F("n","Amount","mol",0.5),F("v","Solution volume","L",2)],
   compute:({n,v})=>R(n/v,"mol/L",["c = n / V",n+" mol / "+v+" L"])},
  {id:"dilution-volume",name:"Dilution: final volume",category:"Chemistry",
   description:"Conservation of solute during dilution without reactions.",
   fields:[F("c1","Initial concentration","mol/L",2),F("v1","Initial volume","L",0.1),F("c2","Target concentration","mol/L",0.5)],
   compute:({c1,v1,c2})=>R(c1*v1/c2,"L",["c₁V₁ = c₂V₂","V₂ = c₁V₁ / c₂"],{warning:c1<c2?"Concentrating a solution requires more than simple dilution.":null})},
  {id:"radioactive-half-life",name:"Remaining mass after half-lives",category:"Chemistry",
   description:"Mathematical decay model; not for radiation safety decisions.",
   fields:[F("initial","Initial mass","g",100),F("time","Elapsed time","days",12,"nonnegative"),F("half","Half-life","days",6)],
   compute:({initial,time,half})=>R(initial*Math.pow(2,-time/half),"g",["m(t) = m₀ × 2^(−t/T½)"])},
  {id:"sound-db",name:"Power gain in decibels",category:"Electronics & Digital",
   description:"Logarithmic power ratio.",
   fields:[F("out","Output power","W",100),F("input","Input power","W",10)],
   compute:({out,input})=>R(10*Math.log10(out/input),"dB",["G = 10 log₁₀(Pout / Pin)"])},
  {id:"rc-filter",name:"RC low-pass cutoff",category:"Electronics & Digital",
   description:"Ideal first-order RC cutoff.",
   fields:[F("r","Resistance","kΩ",10),F("c","Capacitance","µF",1)],
   compute:({r,c})=>R(1/(2*Math.PI*(r*1000)*(c*1e-6)),"Hz",["fc = 1/(2πRC)","Convert kΩ to Ω and µF to F."])},
  {id:"fullwave-rectifier",name:"Full-wave rectifier mean DC",category:"Power Electronics",
   description:"Unfiltered ideal single-phase full-wave sinusoidal rectifier.",
   fields:[F("rms","Input RMS voltage","V",24)],
   compute:({rms})=>R(2*Math.SQRT2*rms/Math.PI,"V DC mean",["Vm = √2 × Vrms","Vmean = 2 Vm / π"])},
  {id:"buck-converter",name:"Ideal buck converter",category:"Power Electronics",
   description:"Ideal continuous-conduction steady-state buck model.",
   fields:[F("vin","Input voltage","V",48),F("d","Duty cycle","0–1",0.5,"unitinterval")],
   compute:({vin,d})=>R(vin*d,"V",["Vout = D × Vin"])},
  {id:"engine-displacement",name:"Engine swept volume",category:"Marine Engines",
   description:"Swept volume from bore, stroke and number of cylinders.",
   fields:[F("bore","Cylinder bore","mm",300),F("stroke","Piston stroke","mm",400),F("cyl","Cylinders","count",6)],
   compute:({bore,stroke,cyl})=>R(Math.PI*(bore/1000)**2*(stroke/1000)*cyl/4*1000,"L",[
    "V = z πD²S/4","Convert mm to m; convert m³ to litres by ×1000."],
    {invalid:Number.isInteger(cyl)?null:"Cylinder count must be whole."})},
  {id:"mean-piston-speed",name:"Mean piston speed",category:"Marine Engines",
   description:"Piston travel distance per unit time.",
   fields:[F("stroke","Stroke","m",0.5),F("rpm","Engine speed","rpm",600)],
   compute:({stroke,rpm})=>R(2*stroke*rpm/60,"m/s",["Mean piston speed = 2 × stroke × rpm / 60"])},
  {id:"wet-steam-enthalpy",name:"Wet steam: specific enthalpy",category:"Steam Engineering",
   description:"Ideal saturated mixture: enter independently sourced h values at same pressure.",
   fields:[F("hf","Saturated-liquid enthalpy","kJ/kg",670,"nonnegative"),F("hg","Saturated-vapour enthalpy","kJ/kg",2750,"nonnegative"),F("x","Dryness fraction","0–1",0.9,"unitinterval")],
   compute:({hf,hg,x})=>R(hf+x*(hg-hf),"kJ/kg",["h = hf + x(hg − hf)"],
    {invalid:hg>hf?null:"Vapour enthalpy must exceed liquid enthalpy."})},
  {id:"steam-boiler-heat",name:"Steam boiler heat duty",category:"Steam Engineering",
   description:"Steady-flow heat duty ignoring losses and kinetic energy.",
   fields:[F("flow","Mass flow","kg/h",2000),F("hout","Outlet enthalpy","kJ/kg",2800),F("hin","Inlet enthalpy","kJ/kg",400,"nonnegative")],
   compute:({flow,hout,hin})=>R(flow*(hout-hin)/3600,"kW",["Qdot = mass flow × (hout − hin)","kg/h × kJ/kg ÷ 3600 = kW"])},
  {id:"cooling-cop",name:"Cooling COP from enthalpies",category:"Refrigeration & Heat Pumps",
   description:"Illustrative vapour-compression cycle with defined state points.",
   fields:[F("h1","Compressor inlet h1","kJ/kg",400),F("h2","Compressor outlet h2","kJ/kg",450),F("h4","Evaporator inlet h4","kJ/kg",250,"nonnegative")],
   compute:({h1,h2,h4})=>R((h1-h4)/(h2-h1),"dimensionless",["COP = (h1 − h4)/(h2 − h1)"],
    {invalid:h2>h1&&h1>h4?null:"Require h2 > h1 > h4."})},
  {id:"shaft-torsion",name:"Solid shaft polar moment",category:"Machine Elements",
   description:"Polar second moment of area for a solid circular shaft.",
   fields:[F("d","Diameter","mm",100)],
   compute:({d})=>R(Math.PI*d**4/32,"mm⁴",["J = πd⁴ / 32"])},
  {id:"annuity-payment",name:"Equal periodic loan payment",category:"Engineering Economics",
   description:"Fixed-rate end-of-period loan payment, excluding fees.",
   fields:[F("pv","Present amount","NOK",100000),F("rate","Interest per period","%",5,"nonnegative"),F("periods","Periods","count",10)],
   compute:({pv,rate,periods})=>{
    const r=rate/100,a=r===0?pv/periods:pv*r/(1-(1+r)**(-periods));
    return R(a,"NOK / period",["A = PV × r / (1 − (1+r)^−n)","If interest is zero: A = PV/n"],
     {invalid:Number.isInteger(periods)&&periods<=1000?null:"Periods must be a whole number ≤ 1000."});
   }},
  {id:"npv",name:"NPV for constant annual flow",category:"Engineering Economics",
   description:"Fixed discount rate; equal year-end inflows; no taxes or residual values.",
   fields:[F("cost","Initial investment","NOK",100000),F("flow","Annual net inflow","NOK/year",30000,"nonnegative"),F("rate","Discount rate","%",6,"nonnegative"),F("years","Years","count",4)],
   compute:({cost,flow,rate,years})=>{
    const r=rate/100;let pv=0;
    if(Number.isInteger(years)&&years<=100)for(let i=1;i<=years;i++)pv+=flow/(1+r)**i;
    return R(pv-cost,"NOK",["NPV = Σ(CFt/(1+r)^t) − investment"],
     {invalid:Number.isInteger(years)&&years<=100?null:"Years must be a whole number ≤ 100."});
   }},
  {id:"wave-speed",name:"Wave speed",category:"Acoustics & Waves",
   description:"Wave speed from frequency and wavelength.",
   fields:[F("freq","Frequency","Hz",50),F("lambda","Wavelength","m",6)],
   compute:({freq,lambda})=>R(freq*lambda,"m/s",["v = f × λ"])},
  {id:"sound-level",name:"Sound pressure level",category:"Acoustics & Waves",
   description:"RMS pressure level relative to chosen reference; different media have different references.",
   fields:[F("p","RMS pressure","Pa",0.02),F("p0","Reference pressure","Pa",0.00002)],
   compute:({p,p0})=>R(20*Math.log10(p/p0),"dB re reference",["Lp = 20 log₁₀(prms/p0)"])}
 ];
 const existing=new Set(window.MT_CALCULATORS.map(c=>c.id));
 window.MT_CALCULATORS.push(...extra.filter(c=>!existing.has(c.id)));
})();
