/* Explicit editorial corrections and conservative synonym rules.
   Only the exact broad source-label + glyph pairs below are rewritten.
   Formula conditions, units, source text and verification states remain separate. */
(function(){'use strict';
const rules=[
 ['Specific gas constant and heat capacities',{'R':'Specific gas constant','c_p':'Specific heat capacity at constant pressure','c_v':'Specific heat capacity at constant volume','c_n':'Specific heat capacity for the stated process'}],
 ['Work out, technical work out, heat in, internal and enthalpy changes',{'Q':'Heat transferred to the system; positive inward','W':'Work done by the system; positive outward','W_tech':'Technical work output','ΔH':'Enthalpy change','ΔU':'Internal energy change'}],
 ['Specific enthalpy or specific work',{'h':'Specific enthalpy','h₁':'Specific enthalpy at state 1','h₂':'Specific enthalpy at state 2','h₃':'Specific enthalpy at state 3','h₄':'Specific enthalpy at state 4','hin':'Inlet specific enthalpy','hout':'Outlet specific enthalpy','qL':'Specific refrigeration effect','w':'Specific work'}],
 ['Pressure; absolute for gas laws',{'BMEP':'Brake mean effective pressure','prms':'RMS sound pressure','psat(T)':'Saturation vapour pressure at temperature T','pv':'Vapour pressure'}],
 ['Vessel and moved/added signed masses',{'Δ':'Vessel mass displacement','w':'Signed mass loaded, discharged or shifted'}],
 ['Initial/new displacement and load/counterweight masses',{'Δ_new':'New mass displacement'}],
 ['Crank radius, connecting rod length and displacement',{'R':'Crank radius','L':'Connecting rod length'}],
 ['Darcy/minor-loss/discharge/velocity/contraction factors, diameter ratio, Mach and heat-capacity ratio',{'C_d':'Discharge coefficient','f_D':'Darcy friction factor','K_loss':'Minor-loss coefficient','M':'Mach number','β_d':'Diameter ratio','κ':'Heat-capacity ratio'}],
 ['Ideal, indicated, brake, mechanical, relative and shaft efficiencies',{'η_i':'Indicated efficiency','η_b':'Brake efficiency','η_m':'Mechanical efficiency','η_rel':'Relative efficiency','η_sh':'Shaft efficiency'}],
 ['Indicated, brake, propeller-shaft and fuel thermal powers',{'P_b':'Brake power','P_i':'Indicated power'}],
 ['Mass and mole fractions',{'w_i':'Mass fraction of component i','y_i':'Mole fraction of component i'}],
 ['Angular speed and natural frequency',{'ω_n':'Natural angular frequency'}],
 ['Input, output, total and per-transistor dissipations',{'P_in':'Input power','P_out':'Output power','P_loss':'Total power dissipation','P_loss_each':'Power dissipation per transistor'}]
];
const corrections=[];
function review(row,formulaId,variantId){for(const [old,meanings]of rules){if(row.meaning===old&&Object.hasOwn(meanings,row.symbol)){const meaning=meanings[row.symbol];corrections.push({formulaId,variantId:variantId||null,symbol:row.symbol,unit:row.unit,originalMeaning:old,meaning});row.meaning=meaning;break}}}
for(const f of window.MT_FORMULAS||[]){for(const row of window.MT_STUDY?.details[f.id]?.symbols||[])review(row,f.id);for(const variant of f.related||[])for(const row of variant.symbols||[])review(row,f.id,variant.id)}
const synonyms=[
 {symbols:['∇'],units:['m³'],meaning:'Displacement volume (submerged hull)',aliases:['Submerged volume','Displacement volume','Volume of water displaced']},
 {symbols:['′'],units:['per independent-variable unit'],meaning:'Derivative with respect to the independent variable',aliases:['Derivative','Derivative with respect to chosen variable']},
 {symbols:['ρ'],units:['kg/m³','t/m³'],meaning:'Mass density',aliases:['Mass density','Fluid density','Fluid mass density','Density','Rod mass density','Coolant density','Displaced-fluid density']},
 {symbols:['E'],units:['Pa','N/mm²','GPa'],meaning:"Young's modulus",aliases:['Young modulus','Young modulus in linear elasticity',"Young's modulus",'Young’s modulus']},
 {symbols:['P'],units:['W','kW'],meaning:'Active electrical power',aliases:['Active electrical power','Active power component','Active power','Electrical power']},
 {symbols:['P'],units:['W','kW'],meaning:'Shaft power',aliases:['Shaft power','Mechanical shaft power','Shaft mechanical power']},
 {symbols:['Q'],units:['m³/s','m³/h'],meaning:'Volumetric flow rate',aliases:['Volumetric flow rate','Volume flow']},
 {symbols:['t'],units:['s','h','min'],meaning:'Elapsed time',aliases:['Elapsed time','Duration']},
 {symbols:['T'],units:['K'],meaning:'Absolute temperature',aliases:['Absolute thermodynamic temperature','Absolute temperature','Absolute gas temperature','Absolute temperatures','Kelvin temperature']}
];
const normal=s=>String(s).normalize('NFC').trim().replace(/\s+/g,' ');
function canonical(e){const match=synonyms.find(r=>r.symbols.includes(e.symbol)&&r.units.includes(e.unit)&&r.aliases.includes(e.meaning));return{symbol:normal(e.symbol),meaning:match?match.meaning:normal(e.meaning),unit:normal(e.unit)}}
window.MT_SYMBOL_REVIEW={rules,synonyms,corrections,canonical};
})();
