/* Independent educational h–s saturation plot; pressure anchors from public steam-property
 references. Interpolation != IAPWS-IF97 solver; no superheated/compressed states predicted. */
(function(){
"use strict";
const rows=[
[.01,7,29.3,2513.7,.1059,8.9749],[.02,17.5,73.4,2532.9,.2606,8.7226],
[.06,36.2,151.5,2566.6,.5208,8.329],[.1,45.8,191.8,2583.9,.6492,8.1488],
[.2,60.1,251.4,2608.9,.832,7.9072],[.4,75.9,317.6,2636.1,1.0261,7.669],
[.6,85.9,359.9,2652.9,1.1454,7.5311],[1,99.6,417.5,2674.9,1.3028,7.3588],
[2,120.2,504.7,2706.2,1.5302,7.1269],[4,143.6,604.7,2738.1,1.7765,6.8955],
[6,158.8,670.4,2756.1,1.9308,6.7592],[10,179.9,762.5,2777.1,2.1381,6.585],
[20,212.4,908.5,2798.3,2.4468,6.339],[40,250.4,1087.5,2800.8,2.7968,6.0696],
[60,275.6,1213.9,2784.6,3.0278,5.8901],[80,295,1317.3,2758.7,3.2081,5.745],
[100,311,1408.1,2725.5,3.3606,5.616],[140,336.7,1571,2637.9,3.6232,5.3727],
[180,357,1732.1,2509.8,3.8718,5.1061],[200,365.8,1827.2,2412.3,4.0156,4.9314],
[220.64,373.95,2084.3,2084.3,4.407,4.407]
],lo=.01,hi=220.64;
const if97=window.MT_IF97?.ready?window.MT_IF97:null;
const finite=Number.isFinite,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function saturation(p){
 if(if97&&p<=160)return if97.saturation(p);
 if(!finite(p)||p<lo||p>hi)throw RangeError("Pressure outside 0.01–220.64 bar absolute.");
 let a=0,b=rows.length-1;
 while(b-a>1){const m=(a+b)>>1;if(rows[m][0]<=p)a=m;else b=m}
 let r=rows[a],t=rows[b],f=Math.log(p/r[0])/Math.log(t[0]/r[0]);
 if(p===r[0])f=0;
 if(p===t[0])f=1;
 const v=k=>r[k]+f*(t[k]-r[k]);
 return{p,T:v(1),hf:v(2),hg:v(3),sf:v(4),sg:v(5),interpolated:!!if97||(p!==r[0]&&p!==t[0]),source:"Reference saturation interpolation"};
}
function at(p,x){
 if(!finite(x)||x<0||x>1)throw RangeError("Quality must be from 0 to 1.");
 const z=saturation(p);
 return{...z,x,h:z.hf+x*(z.hg-z.hf),s:z.sf+x*(z.sg-z.sf),phase:"wet",source:z.source||(z.interpolated?"Reference interpolation":"Reference anchor")};
}
function isentropicWetState(inlet,targetP){
 if(!inlet||!finite(inlet.s))throw TypeError("An inlet state with finite entropy is required.");
 const q=saturation(targetP),delta=q.sg-q.sf;
 if(delta<=1e-10)throw RangeError("A two-phase quality cannot be determined at the critical limit.");
 const x=(inlet.s-q.sf)/delta;
 if(x<0||x>1)throw RangeError("Isentropic endpoint is outside the saturated mixture domain. Use a validated IF97 single-phase solver.");
 return at(targetP,x);
}
const fromSlider=v=>lo*Math.pow(hi/lo,clamp(v,0,1000)/1000);
const toSlider=p=>1000*Math.log(p/lo)/Math.log(hi/lo);
const f=(v,n=2)=>Number(v).toLocaleString("en-GB",{minimumFractionDigits:n,maximumFractionDigits:n});
function superheated(p,tC){if(!if97)throw RangeError("IF97 engine is not ready.");return {...if97.superheated(p,tC),interpolated:false}}
window.MT_MOLLIER_MODEL={anchors:rows,saturation,stateAt:at,superheated,pressureFromSlider:fromSlider,sliderFromPressure:toSlider,isentropicWetState,if97Ready:!!if97};
if(typeof document==="undefined")return;
const $=id=>document.getElementById(id),svg=$("hs-chart");if(!svg)return;
const NS="http://www.w3.org/2000/svg",W=980,H=580,left=86,right=37,top=28,bottom=66,pw=W-left-right,ph=H-top-bottom;
const X=s=>left+pw*s/10,Y=h=>top+ph*(1-h/3300);
const states={a:at(10,1),b:at(1,.84)};let active="a";
const steamLines=if97?(()=>{
 const isobars=[],isotherms=[];
 for(const p of [.1,.5,1,2,5,10,20,40,80,100]){
  let sat;try{sat=if97.saturation(p)}catch{continue}
  const states=[];
  for(let k=0;k<=26;k++){const T=sat.T+1+(400-sat.T-1)*k/26;
   if(T<=sat.T+.5)continue;try{states.push(if97.superheated(p,T))}catch{}}
  if(states.length>=2)isobars.push(states);
 }
 for(const T of [200,250,300,350,400]){
  const states=[];
  for(let k=0;k<=52;k++){const p=.01*Math.pow(1e4,k/52);try{states.push(if97.superheated(p,T))}catch{}}
  if(states.length>=2)isotherms.push(states);
 }
 return{isobars,isotherms};
})():{isobars:[],isotherms:[]};
function element(tag,props={},content){
 const n=document.createElementNS(NS,tag);
 Object.entries(props).forEach(([k,v])=>n.setAttribute(k,String(v)));
 if(content!==undefined)n.textContent=content;
 svg.appendChild(n);return n;
}
function poly(pts,cls){
 return element("path",{d:pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(2)+","+p[1].toFixed(2)).join(" "),class:cls});
}
function draw(){
 while(svg.lastChild&&svg.lastChild.tagName!=="desc"&&svg.lastChild.tagName!=="title")svg.removeChild(svg.lastChild);
 for(let s=0;s<=10;s++){element("line",{x1:X(s),x2:X(s),y1:top,y2:H-bottom,class:"gridline"});
 element("text",{x:X(s),y:H-bottom+27,"text-anchor":"middle",class:"tick"},String(s))}
 for(let h=0;h<=3000;h+=500){element("line",{x1:left,x2:W-right,y1:Y(h),y2:Y(h),class:"gridline"});
 element("text",{x:left-11,y:Y(h)+4,"text-anchor":"end",class:"tick"},String(h))}
 element("text",{x:(W+left-right)/2,y:H-8,"text-anchor":"middle",class:"axis"},"Specific entropy, s   kJ/(kg·K)");
 element("text",{transform:"translate(23 "+(top+ph/2)+") rotate(-90)","text-anchor":"middle",class:"axis"},"Specific enthalpy, h   kJ/kg");
 for(const curve of steamLines.isobars){const pts=curve.filter(z=>z.h>=0&&z.h<=3300&&z.s>=0&&z.s<=10).map(z=>[X(z.s),Y(z.h)]);if(pts.length>=2)poly(pts,"super-isobar")}
 for(const curve of steamLines.isotherms){const pts=curve.filter(z=>z.h>=0&&z.h<=3300&&z.s>=0&&z.s<=10).map(z=>[X(z.s),Y(z.h)]);if(pts.length>=2)poly(pts,"super-isotherm")}
 const sample=Array.from({length:130},(_,i)=>saturation(lo*Math.pow(hi/lo,i/129)));
 const liquid=sample.map(z=>[X(z.sf),Y(z.hf)]),vapour=sample.map(z=>[X(z.sg),Y(z.hg)]);
 poly(liquid.concat([...vapour].reverse()),"wet-area");
 for(let quality=.2;quality<1;quality+=.2)poly(sample.map(z=>[X(z.sf+quality*(z.sg-z.sf)),Y(z.hf+quality*(z.hg-z.hf))]),"quality-path");
 poly(liquid,"liquid-path");poly(vapour,"vapour-path");
 for(const p of [.1,1,10,100]){const z=saturation(p);poly([[X(z.sf),Y(z.hf)],[X(z.sg),Y(z.hg)]],"isobar");
 element("text",{x:X(z.sg)+8,y:Y(z.hg)-4,class:"pressure-label"},p+" bar")}
 element("text",{x:X(3),y:Y(1910),class:"region"},"WET STEAM");
 element("text",{x:X(8.1),y:Y(1950),class:"region"},"SUPERHEATED");
 element("text",{x:X(.3),y:Y(1800),class:"region"},"LIQUID");
 element("circle",{cx:X(4.407),cy:Y(2084.3),r:5,class:"critical"});
 poly([[X(states.a.s),Y(states.a.h)],[X(states.b.s),Y(states.b.h)]],"process");
 for(const id of ["a","b"]){const z=states[id],x=X(z.s),y=Y(z.h);
 element("circle",{cx:x,cy:y,r:12,class:"halo-"+id});
 element("circle",{cx:x,cy:y,r:6,class:"mark-"+id});
 element("text",{x:x+12,y:y-12,class:"point-label"},id.toUpperCase())}
}
function update(){
 const z=states[active];
 $("phase-mode").value=z.phase||"wet";
 $("quality-field").hidden=z.phase==="superheated";
 $("superheat-field").hidden=z.phase!=="superheated";
 $("superheat-temp").value=z.phase==="superheated"?Number(z.T.toFixed(2)):250;
 $("phase-mode").disabled=!if97;
 $("model-status").textContent=if97?"IF97: wet steam to 160 bar(a); superheated to 100 bar(a) / 400 °C. High-pressure saturation remains interpolated.":"IF97 engine unavailable: saturation reference only, superheated mode disabled.";
 $("pressure").value=toSlider(z.p);
 $("pressure-number").value=Number(z.p.toPrecision(6));
 $("quality").value=z.phase==="superheated"?100:Math.round(z.x*100);
 $("pressure-display").textContent=f(z.p,3)+" bar(a)";
 $("quality-display").textContent=z.phase==="superheated"?"n/a":f(z.x*100,0)+"%";
 $("t-sat").textContent=f(z.T,1)+" °C";
 $("h-state").textContent=f(z.h,1)+" kJ/kg";
 $("s-state").textContent=f(z.s,3)+" kJ/(kg·K)";
 $("x-state").textContent=z.phase==="superheated"?"Not defined":f(z.x,3);
 for(const id of ["a","b"]){const q=states[id];
 $("state-"+id+"-details").textContent="p = "+f(q.p,3)+" bar(a) · T = "+f(q.T,1)+" °C · "+(q.phase==="superheated"?"superheated":"x = "+f(q.x,2))+" · h = "+f(q.h,1)+" kJ/kg · s = "+f(q.s,3)+" kJ/(kg·K)"}
 $("state-delta").textContent="hA − hB = "+f(states.a.h-states.b.h,1)+" kJ/kg; sB − sA = "+f(states.b.s-states.a.s,3)+" kJ/(kg·K).";
 $("chart-description").textContent="Editing state "+active.toUpperCase()+": "+f(z.p,3)+" bar(a), "+(z.phase==="superheated"?"T = "+f(z.T,1)+" °C (superheated)":"x = "+f(z.x,2))+". "+(z.source||"reference")+".";
 draw();
}
function fail(message){$("input-error").hidden=!message;$("input-error").textContent=message}
function set(p,x){try{states[active]=states[active].phase==="superheated"?superheated(p,states[active].T):at(p,x);fail("");update()}catch(e){fail(e.message)}}
function setTemp(temp){try{states[active]=superheated(states[active].p,temp);fail("");update()}catch(e){fail(e.message)}}
$("phase-mode").addEventListener("change",e=>{
 const before=states[active];
 try{states[active]=e.target.value==="superheated"?superheated(Math.min(before.p,100),Math.max(200,saturation(Math.min(before.p,100)).T+10)):at(before.p,1);fail("");update()}
 catch(err){$("phase-mode").value=before.phase||"wet";fail(err.message)}
});
$("superheat-temp").addEventListener("change",e=>{const T=Number(e.target.value);if(e.target.value.trim()===""||!finite(T)){fail("Enter a valid temperature.");return}setTemp(T)});

$("active-state").addEventListener("change",e=>{active=e.target.value;update()});
$("pressure").addEventListener("input",e=>set(fromSlider(Number(e.target.value)),states[active].x));
$("pressure-number").addEventListener("change",e=>{const p=Number(e.target.value);if(e.target.value.trim()===""||!finite(p)||p<lo||p>hi)fail("Enter 0.01–220.64 bar absolute.");else set(p,states[active].x)});
$("quality").addEventListener("input",e=>set(states[active].p,Number(e.target.value)/100));
$("save-a").addEventListener("click",()=>{states.a={...states[active]};active="a";$("active-state").value=active;update()});
$("save-b").addEventListener("click",()=>{states.b={...states[active]};active="b";$("active-state").value=active;update()});
$("reset").addEventListener("click",()=>{states.a=at(10,1);states.b=at(1,.84);active="a";$("active-state").value=active;fail("");update()});
$("isentropic").addEventListener("click",()=>{
 try{
  const z=isentropicWetState(states.a,states.b.p);
  states.b=z;active="b";$("active-state").value="b";fail("");update();
 }catch(error){fail(error.message)}
});
svg.addEventListener("click",event=>{
 const rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/W,rect.height/H);
 const px=(event.clientX-rect.left-(rect.width-W*scale)/2)/scale,py=(event.clientY-rect.top-(rect.height-H*scale)/2)/scale;
 if(px<left||px>W-right||py<top||py>H-bottom){fail("Select within the plot.");return}
 let closest={d:Infinity,p:1,x:1};
 for(let i=0;i<130;i++){const p=lo*Math.pow(hi/lo,i/129),q=saturation(p);
 for(let j=0;j<=30;j++){const x=j/30,ss=q.sf+x*(q.sg-q.sf),hh=q.hf+x*(q.hg-q.hf),d=Math.hypot(px-X(ss),py-Y(hh));
 if(d<closest.d)closest={p,x,d}}}
 if(closest.d>34){fail("Click near the two-phase saturation dome, or enter pressure and temperature for superheated steam.");return}
 set(closest.p,closest.x);
});
$("export").addEventListener("click",()=>{
 const csv=["state,p_bar_abs,T_C,phase,quality,enthalpy_kJ_per_kg,entropy_kJ_per_kgK,interpolated,source",
 ...["a","b"].map(id=>{const z=states[id];return[id.toUpperCase(),z.p,z.T,z.phase||"wet",z.x??"",z.h,z.s,z.interpolated,z.source||""].join(",")})].join("\n")+"\n";
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");
 a.href=url;a.download="marine-tools-mollier-states.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
});
update();
})();