/* Marine Tools IF97 state adapter for Mollier lab.
 Upstream solver: NeutriumJS.thermo.IAPWS97, CC BY 4.0. See IF97_ATTRIBUTION.md.
 NOTE: high-pressure Region 3 saturation not handled here; strict limits below 16.529 MPa.
 */
(function(root){
"use strict";
const vendor=root.NeutriumJS?.thermo?.IAPWS97;
if(!vendor?.PT?.solve||!vendor.PT.r1||!vendor.PT.r2||!vendor.PT.r4_P_Tsat){
 root.MT_IF97={ready:false,reason:"Local IF97 solver failed to initialise."};return;
}
const isFiniteN=Number.isFinite;
function saturation(pBar){
 if(!isFiniteN(pBar)||pBar<.01||pBar>160)throw RangeError("IF97 saturation mode supports 0.01–160 bar absolute.");
 const p=pBar/10; // bar → MPa
 const T=vendor.PT.r4_P_Tsat(p); // Region 4 saturation boundary in kelvin
 if(!isFiniteN(T)||T<273.15||T>=623.15)throw RangeError("IF97 saturation temperature outside Regions 1 and 2.");
 const f=vendor.PT.r1(p,T),g=vendor.PT.r2(p,T);
 const fields=[f.h,f.s,g.h,g.s];
 if(fields.some(z=>!isFiniteN(z)))throw RangeError("IF97 returned a non-finite property.");
 return{p:pBar,T:T-273.15,hf:f.h,hg:g.h,sf:f.s,sg:g.s,interpolated:false,source:"IAPWS-IF97 Regions 1/2/4"};
}
function wet(pBar,x){
 if(!isFiniteN(x)||x<0||x>1)throw RangeError("Dryness fraction must be from 0 to 1.");
 const sat=saturation(pBar);
 return{...sat,x,h:sat.hf+x*(sat.hg-sat.hf),s:sat.sf+x*(sat.sg-sat.sf),phase:"wet",source:sat.source};
}
function superheated(pBar,tC){
 if(!isFiniteN(pBar)||pBar<.01||pBar>100)throw RangeError("IF97 superheated mode supports 0.01–100 bar absolute.");
 if(!isFiniteN(tC)||tC>400)throw RangeError("Superheated temperature must not exceed 400 °C.");
 const saturationTemperature=vendor.PT.r4_P_Tsat(pBar/10)-273.15;
 if(tC<=saturationTemperature+.5)throw RangeError("Temperature must exceed saturation by more than 0.5 °C.");
 const result=vendor.PT.solve(pBar/10,tC+273.15);
 if(!isFiniteN(result.h)||!isFiniteN(result.s)||!isFiniteN(result.t))throw RangeError("Non-finite superheated property returned.");
 return{p:pBar,T:tC,h:result.h,s:result.s,x:null,phase:"superheated",T_sat:saturationTemperature,source:"IAPWS-IF97 Region 2"};
}
root.MT_IF97={ready:true,saturation,wet,superheated,license:"CC BY 4.0",source:"NeutriumJS.thermo.IAPWS97 (deprecated)"};
})(window);
