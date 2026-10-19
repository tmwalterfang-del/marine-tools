/* Marine Tools For Students — authored curriculum metadata and diagram assets.
   No publisher tables/graphics/source scans are included. Full textbook equation-level
   review remains pending; the chapter links are topical signposts, not verification. */
(function(){
'use strict';
const groups=[
 {id:"math",label:"Mathematics & Physics",categories:["Mathematics","Advanced Mathematics","Geometry & Trigonometry","Physics & Waves","Acoustics & Waves"]},
 {id:"stability",label:"Ship Stability & Cargo",categories:["Ship Stability","Cargo & Survey","Marine Advanced","Additional Ship Operations"]},
 {id:"machinery",label:"Marine Engineering & Energy",categories:["Machinery & Energy","Marine Engines","Engine Processes","Thermodynamics","Steam Engineering","Steam & Refrigeration","Refrigeration & Heat Pumps"]},
 {id:"electrical",label:"Electrical & Electronics",categories:["Electrical Engineering","Electronics & Telecommunications","Electronics & Digital","Power Electronics"]},
 {id:"navigation",label:"Nautical Studies",categories:["Navigation"]},
 {id:"mechanics",label:"Mechanics & Materials",categories:["Mechanics","Machine Elements","Machine Elements & Strength","Fluids & Hydraulics"]},
 {id:"chemistry",label:"Chemistry",categories:["Chemistry","Chemical Engineering"]},
 {id:"economics",label:"Engineering Economics",categories:["Engineering Economics"]}
];
const rawLinks={
 "weight-displacement":"displacement","deadweight":"deadweight","loading-a-single-mass-new-kg":"add-kg",
 "discharging-mass-new-kg":"discharge-kg","corrected-gm":"corrected-gm","waterplane-tpc":"tpc",
 "draft-change-from-loaded-mass":"draft-change","trim-change":"trim-change",
 "trimming-moment-from-shifted-weight":"trim-change","block-coefficient":"block-coefficient",
 "pythagorean-theorem":"triangle","ohm-s-law":"ohms-law","dc-power":"dc-power",
 "three-phase-real-power":"three-phase","resistors-in-series":"series-resistance",
 "resistors-in-parallel":"parallel-resistance","motor-synchronous-speed":"synchronous-speed",
 "pump-hydraulic-power":"hydraulic-power","pump-run-time":"pump-time","engine-fuel-for-voyage":"voyage-fuel",
 "battery-run-time-approx":"battery-runtime","battery-usable-energy":"battery-runtime",
 "heat-transfer-sensible":"heat-energy","shaft-power-from-torque":"shaft-power",
 "specific-fuel-oil-consumption":"sfoc","mass-volume-conversion":"fuel-density",
 "ext-molar-concentration":"molar-concentration","ext-dilution-relation":"dilution-volume",
 "ext-ph-from-hydrogen-ion-activity":"ph",
 "ext-negative-feedback-closed-loop-gain":"amp-feedback",
 "ext-voltage-gain-in-decibels":"db-gain",
 "ext-rc-cutoff-frequency":"rc-frequency",
 "ext-dc-dc-buck-converter":"buck-converter",
 "ext-solid-circular-torsion-stress":"shaft-torsion-stress",
 "ext-otto-cycle-ideal-efficiency":"otto-efficiency",
 "ext-total-swept-engine-volume":"engine-swept-volume",
 "ext-wet-steam-enthalpy":"wet-steam-enthalpy",
 "ext-refrigeration-cop-from-enthalpy":"refrigeration-cop",
 "ext-relative-humidity":"relative-humidity",
 "ext-exact-fisher-real-interest":"real-interest",
 "ext-level-annuity-present-value":"annuity-pv",
 "student-v2-radioactive-remaining-fraction":"radioactive-half-life",
 "ext-power-gain-in-decibels":"sound-db",
 "student-v2-single-phase-full-wave-rectifier-average":"fullwave-rectifier",
 "student-v2-multicylinder-swept-volume":"engine-displacement",
 "ext-mean-piston-speed":"mean-piston-speed",
 "student-v2-boiler-heat-transfer-rate":"steam-boiler-heat",
 "student-v2-cooling-coefficient-of-performance":"cooling-cop",
 "student-v2-polar-inertia-of-solid-shaft":"shaft-torsion",
 "ext-level-annuity-payment":"annuity-payment",
 "ext-net-present-value":"npv",
 "ext-wave-speed":"wave-speed",
 "student-v2-sound-pressure-level":"sound-level"
};
const S=(symbol,meaning,unit)=>({symbol,meaning,unit});
const details={
 "weight-displacement":{symbols:[S("Δ","Displacement mass","t"),S("ρwater","Water density","t/m³"),S("∇","Submerged volume","m³")]},
 "deadweight":{symbols:[S("DWT","Deadweight","t"),S("Δ","Loaded mass displacement","t"),S("lightship","Lightship mass","t")]},
 "initial-gm":{symbols:[S("GM","Initial transverse metacentric height","m"),S("KM","Keel to transverse metacentre","m"),S("KG","Keel to centre of gravity","m")],figure:"stability"},
 "corrected-gm":{symbols:[S("GMcorrected","Free-surface-corrected initial GM","m"),S("FSC","Free-surface correction","m"),S("KM","Keel to metacentre","m"),S("KG","Keel to centre of gravity","m")],figure:"stability"},
 "loading-a-single-mass-new-kg":{symbols:[S("Δ","Original displacement","t"),S("KG","Original gravity centre above keel","m"),S("w","Added mass","t"),S("kg","Height of added mass centre above keel","m")]},
 "waterplane-tpc":{symbols:[S("TPC","Mass for 1 cm immersion","t/cm"),S("Aw","Waterplane area","m²"),S("ρwater","Water density","t/m³")],figure:"tpc"},
 "trim-change":{symbols:[S("Δtrim","Change of trim magnitude","cm"),S("M","Longitudinal trimming moment","t·m"),S("MCT₁cm","Moment to change trim 1 cm","t·m/cm")]},
 "block-coefficient":{symbols:[S("Cb","Block coefficient","dimensionless"),S("∇","Displaced volume","m³"),S("L, B, T","Reference length, beam and draught","m")]},
 "pythagorean-theorem":{symbols:[S("a, b","Perpendicular triangle legs","length"),S("c","Hypotenuse","length")],figure:"triangle"},
 "ohm-s-law":{symbols:[S("U","Voltage","V"),S("I","Current","A"),S("R","Resistance","Ω")],figure:"circuit"},
 "three-phase-real-power":{symbols:[S("P","Active electrical power","W"),S("Uₗ","RMS line-to-line voltage","V"),S("Iₗ","RMS line current","A"),S("cos φ","Power factor","dimensionless")]},
 "pump-hydraulic-power":{symbols:[S("Pₕ","Hydraulic output power","W"),S("ρ","Fluid density","kg/m³"),S("Q","Volume flow","m³/s"),S("H","Pump head","m")],figure:"pump"},
 "heat-transfer-sensible":{symbols:[S("Q","Sensible heat exchanged","J"),S("m","Heated mass","kg"),S("c","Specific heat capacity","J/(kg·K)"),S("ΔT","Temperature change","K")]},
 "ext-molar-concentration":{symbols:[S("c","Molar concentration","mol/L"),S("n","Amount of dissolved solute","mol"),S("V","Final solution volume","L")]},
 "ext-dilution-relation":{symbols:[S("c₁, c₂","Initial and final concentration","mol/L"),S("V₁, V₂","Initial and final solution volume","L")]},
 "ext-ph-from-hydrogen-ion-activity":{symbols:[S("pH","Acidity index","dimensionless"),S("aH⁺","Hydrogen ion activity","dimensionless")]},
 "ext-voltage-gain-in-decibels":{symbols:[S("GdB","Voltage gain on logarithmic scale","dB"),S("Vout, Vin","Signal voltage amplitudes","V")]},
 "ext-dc-dc-buck-converter":{symbols:[S("Vout","Output voltage","V"),S("Vin","Input voltage","V"),S("D","Switching duty ratio","0–1")]},
 "ext-otto-cycle-ideal-efficiency":{symbols:[S("η","Ideal thermal efficiency","dimensionless"),S("r","Geometric compression ratio","dimensionless"),S("κ","Ratio of specific heat capacities","dimensionless")]},
 "ext-wet-steam-enthalpy":{symbols:[S("h","Wet-steam specific enthalpy","kJ/kg"),S("hf","Saturated liquid specific enthalpy","kJ/kg"),S("hfg","Latent specific enthalpy","kJ/kg"),S("x","Steam quality","0–1")]},
 "ext-refrigeration-cop-from-enthalpy":{symbols:[S("COP","Cooling performance coefficient","dimensionless"),S("h₁, h₂, h₄","Cycle state specific enthalpies","kJ/kg")]},
 "ext-exact-fisher-real-interest":{symbols:[S("rreal","Real interest per period","fraction"),S("inominal","Nominal interest per period","fraction"),S("inflation","Inflation per period","fraction")]}
};
const topicChapters={
 "Mathematics":"1 – Mathematics","Advanced Mathematics":"1 – Mathematics","Geometry & Trigonometry":"1 – Mathematics",
 "Physics & Waves":"2 – Physics","Acoustics & Waves":"2 – Physics","Mechanics":"3 – Mechanics",
 "Machine Elements":"4 – Machine Elements","Machine Elements & Strength":"4 – Machine Elements",
 "Chemistry":"5 – Chemistry","Chemical Engineering":"5 – Chemistry",
 "Electrical Engineering":"6 – Electrical Engineering",
 "Electronics & Telecommunications":"7 – Electronics","Electronics & Digital":"7 – Electronics",
 "Power Electronics":"8 – Power Electronics",
 "Marine Engines":"9 – Engine Processes","Engine Processes":"9 – Engine Processes",
 "Steam Engineering":"10 – Steam","Steam & Refrigeration":"10/12 – Steam and Refrigeration",
 "Thermodynamics":"11 – Heat and Flow","Fluids & Hydraulics":"11 – Heat and Flow",
 "Refrigeration & Heat Pumps":"12 – Refrigeration",
 "Navigation":"13 – Navigation","Ship Stability":"14 – Ship and Cargo",
 "Cargo & Survey":"14/16 – Cargo and Displacement","Marine Advanced":"14/16 – Cargo and Displacement",
 "Additional Ship Operations":"14 – Ship and Cargo",
 "Machinery & Energy":"9/11 – Engines and Energy",
 "Engineering Economics":"15 – Economics"
};
const ids=Object.keys(rawLinks);
window.MT_STUDY={
 groups, calculatorByFormula:rawLinks,details,topicChapters,
 reviewLabel:"Individual equation not yet independently source-audited",
 chapterLabel:"Topical chapter reference only — not evidence of equation-level verification.",
 glossarySource:"https://www.nb.no/items/7dd9087d6a49416798fe7b2f6fdd86c2",
 figures:{
  triangle:'<svg viewBox="0 0 320 180" role="img" aria-label="Right-angled triangle with perpendicular legs a and b and hypotenuse c"><path d="M52 140 L52 28 L272 140 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M52 124 h16 v16" stroke="currentColor" fill="none"/><text x="32" y="82">a</text><text x="161" y="160">b</text><text x="174" y="70">c</text></svg>',
  stability:'<svg viewBox="0 0 320 180" role="img" aria-label="Simplified vessel cross-section with G below M, vertical metacentric height GM shown"><path d="M65 100 Q70 156 160 158 Q250 156 255 100 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M160 24 V160" stroke="currentColor" stroke-dasharray="5 5"/><circle cx="160" cy="115" r="5" fill="#e8be78"/><circle cx="160" cy="52" r="5" fill="#63daed"/><path d="M178 53 V114 M173 53 h10 M173 114 h10" stroke="currentColor" fill="none"/><text x="186" y="85">GM</text><text x="144" y="45">M</text><text x="144" y="132">G</text><text x="146" y="175">K</text></svg>',
  tpc:'<svg viewBox="0 0 320 180" role="img" aria-label="Waterplane area and one-centimetre parallel sinkage illustrated as two waterlines"><path d="M46 62 H277 M46 80 H277" stroke="#63daed" stroke-width="2" stroke-dasharray="5 5"/><path d="M65 42 L73 128 Q160 169 248 128 L255 42" stroke="currentColor" fill="none" stroke-width="3"/><path d="M276 62 V80 M272 62 H280 M272 80 H280" stroke="currentColor"/><text x="285" y="77">1 cm</text><text x="140" y="52">Aᵥ</text></svg>',
  circuit:'<svg viewBox="0 0 320 180" role="img" aria-label="Simple closed DC circuit with source and resistor"><path d="M70 45 H244 V134 H70 V45 M69 78 V100" stroke="currentColor" stroke-width="3" fill="none"/><path d="M57 78 H81 M63 100 H75" stroke="currentColor" stroke-width="3"/><rect x="130" y="35" width="62" height="20" fill="var(--panel)" stroke="currentColor" stroke-width="2"/><text x="150" y="26">R</text><text x="36" y="97">U</text><text x="253" y="91">I →</text></svg>',
  pump:'<svg viewBox="0 0 320 180" role="img" aria-label="Pump with volumetric flow Q and head H shown symbolically"><path d="M31 100 H94 M205 100 H291" stroke="currentColor" stroke-width="4"/><circle cx="148" cy="100" r="54" stroke="currentColor" fill="none" stroke-width="3"/><path d="M121 125 L175 100 L121 76 Z" stroke="#63daed" fill="none" stroke-width="3"/><path d="M237 92 L256 100 L237 108" stroke="currentColor" fill="none" stroke-width="3"/><text x="266" y="84">Q</text><text x="136" y="23">H</text></svg>'
 }
};
})();