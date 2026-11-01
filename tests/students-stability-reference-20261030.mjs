import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.chapter===14),by=new Map(rows.map(r=>[r.id,r])),evidence={},pi=Math.PI;let assertions=0;
function check(p,r,inputs,expected,{side=1,segment=0,reference='Authored hydrostatic/mass-moment teaching state; actual vessel tables and approval remain external.',kind='DISPLAYED_EXPRESSION_REFERENCE_CASE'}={}){
 const id=`book-c14-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const actual=evaluate(row.formula.split(';')[segment].split(/=|≈/)[side].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=3e-9*Math.max(1,Math.abs(expected)),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind,reference,cases:[]}).cases.push({inputs,expected,side,segment});
}
function typed(p,r,formula,condition,reference,kind='TYPED_GEOMETRY_OR_INDEXED_BALANCE'){
 const id=`book-c14-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);assertions++;evidence[id]={kind,reference};
}
check(195,1,{'Δ_table':10250,'ρ':1,'ρ_table':1.025},10000);check(195,2,{TPC_table:20.5,'ρ':1,'ρ_table':1.025},20);check(195,3,{MCT_table:102.5,'ρ':1,'ρ_table':1.025},100);
for(const [r,v,e] of [[1,{w:100,d:3,'Δ':10000},.03],[2,{'Δ':800,KG:4,w:200,kg_i:9},5],[3,{'Δ':1000,KG:5,w:200,kg_i:9},4],[4,{'ρ_l':1,I_FS:100,'Δ':1000},.1],[5,{l_tank:12,b_tank:10},1000],[6,{SF:2},.5],[7,{L:100,B:20,C_wp:.8},1600],[8,{A_w:1600,L:100,B:20},.8]])check(196,r,v,e);
for(const [r,v,e] of [[1,{B:20,T:5,C_m:.8},80],[2,{A_m:80,B:20,T:5},.8],[3,{'∇':8000,L:100,B:20,T:5},.8],[4,{'ρ':1.025,A_w:2000},20.5],[5,{'Δ':10000,'ρ_table':1.025,'ρ':1},10250],[6,{'Δ':10000,'ρ_table':1.025,'ρ':1,TPC_table:20.5},250/20.5],[7,{I_T:1000,'∇':2000},.5],[8,{L:12,B:10},1000],[9,{B:20,C_b:1,T:5},20/3]])check(197,r,v,e);
for(const [r,v,e] of [[1,{GM:2,'θ':pi/6},1],[2,{GM:2,'θ':.1},.2],[3,{KN:4,KG_eff:6,'θ':pi/6},1],[4,{GZ_old:1,'δKG':.2,'θ':pi/6},.9],[5,{w:100,d:10,'Δ':10000,'θ':Math.atan(.05)},2],[6,{x_pend:.1,l_pend:2},.05],[7,{k_roll:2,g:10,GM_eff:1},4*pi/Math.sqrt(10)],[8,{w:100,y_hook:10,'Δ':10000},.1]])check(198,r,v,e);
// Independent cross-curve CONTRACT reference. Synthetic rectangular prism, NOT
// hydrostatics of an actual ship. Integrate the clipped strip heights, first
// moments and force directions; never infer real KN data from this example.
function integral(f,a,b,N=200){let sum=f(a)+f(b);for(let i=1;i<N;i++)sum+=(i%2?4:2)*f(a+(b-a)*i/N);return sum*(b-a)/(3*N);}
function buoyancy(mass,theta){const breadth=20,length=100,density=1,T=mass/(density*length*breadth),height=y=>T+y*Math.tan(theta);
 assert.ok(height(-10)>0&&height(10)<10,'Synthetic wall-sided geometry remains below deck and above keel');
 const area=integral(height,-10,10),y=integral(v=>v*height(v),-10,10)/area,z=integral(v=>height(v)**2/2,-10,10)/area;
 return {y,z,KN:y*Math.cos(theta)+z*Math.sin(theta),KM:T/2+breadth*breadth/(12*T)};
}
function state(weights){const mass=weights.reduce((a,p)=>a+p[0],0),vertical=weights.reduce((a,p)=>a+p[0]*p[1],0),transverse=weights.reduce((a,p)=>a+p[0]*p[2],0);return {mass,vertical,transverse,KG:vertical/mass,TCG:transverse/mass};}
const manifests={
199:[[9900,5,0],[100,8,10]],200:[[10000,5,0],[100,8,10]],
201:[[9850,5,0],[100,8,10],[50,5,-15]],202:[[9900,5,0],[100,8,10],[50,2,-15]],
203:[[9900,5,0],[100,8,10],[50,2,-15]],204:[[9950,5,0],[50,4,-15],[100,8,10]],
205:[[10000,5,0],[100,8,10],[50,2,-15]],206:[[10000,5,0],[100,8,10],[50,2,-15]],
};
function root(s){let a=0,b=.2;for(let i=0;i<65;i++){const t=(a+b)/2,B=buoyancy(s.mass,t),moment=s.mass*B.KN-s.vertical*Math.sin(t)-s.transverse*Math.cos(t);if(moment<0)a=t;else b=t;}return (a+b)/2;}
const states={};
for(const p of [199,200,201,202,203,204,205,206]){
 const s=state(manifests[p]),theta=root(s),B=buoyancy(s.mass,theta),GM=B.KM-s.KG;states[p]={...s,theta,B};
 const common={'Δ':10000,KG:5,TCG:0,w:100,c:50,z_hook:8,z_old:5,y_hook:10,y_old:0,a:10,a_c:15,z_c:2,'δz':3,'δz_c':-1,KG_eff:s.KG,TCG_new:s.TCG,'Δ_new':s.mass,'θ':theta,KN:B.KN,'KN(θ,Δ_new,trim)':B.KN,GM_eff:GM,M_y:250};
 check(p,1,common,s.mass);
 if(p===203||p===206){check(p,2,common,250);check(p,3,common,250/(s.mass*GM));}
 else {
  if(p===201)typed(p,2,'KG_new = KG+Σ(w_i·δz_i)/Δ',Math.abs((10000*5+100*3+50*0)/10000-s.KG)<1e-12,'Independently enumerated existing masses and their vertical shifts; no mass added.');
  else check(p,2,common,s.KG);
  check(p,3,common,s.TCG);
 }
 check(p,4,common,0,{side:0,kind:'SYNTHETIC_HYDROSTATIC_LOOKUP_CONTRACT',reference:'Buoyancy-centroid strip integration and independently enumerated mass points at a solved restoring equilibrium; lookup supplied explicitly, not validated for a real hull.'});
}
const inverse=p=>{const s=states[p],t=s.theta;return {'Δ':10000,KG:5,w:100,c:50,a:10,a_c:15,'δz':3,y_hook:10,z_hook:8,z_c:2,'θ':t,KN:s.B.KN,GZ_R:s.B.KN-5*Math.sin(t)};};
check(199,5,inverse(199),100);check(200,5,inverse(200),100);check(201,5,inverse(201),100);
// p202 r05 is explicitly a DIFFERENT case: an already-onboard horizontal
// countershift, so validate against p201's manifest, not the new counterweight.
check(202,5,inverse(201),50,{reference:'Existing counterweight shifted purely horizontally, fixed displacement; distinct from new-counterweight rows on the same printed page.'});
check(203,5,inverse(203),250*Math.cos(states[203].theta),{side:0});check(203,5,inverse(203),250*Math.cos(states[203].theta));
const noVerticalCounter=state([[9950,5,0],[50,5,-15],[100,8,10]]),nt=root(noVerticalCounter),nb=buoyancy(noVerticalCounter.mass,nt);
const added={'Δ':10000,KG:5,w:100,c:50,y_hook:10,z_hook:8,a_c:15,'θ':nt,KN:nb.KN};
check(204,5,added,250*Math.cos(nt),{side:0});check(204,5,added,250*Math.cos(nt));
check(205,5,inverse(205),250*Math.cos(states[205].theta),{side:0});check(205,5,inverse(205),250*Math.cos(states[205].theta));
check(206,5,inverse(206),50);
for(const [r,v,e] of [[1,{T:5,'θ':pi/6,B:20},5*Math.sqrt(3)/2+5],[2,{'Δ':10000,GM_L:100,L:100},100],[3,{'ρ':1,I_L:1e6,L:100},100],[4,{C_L:1/12,B:12,L:10},1000],[5,{M_trim:2000,MCT:100},20],[6,{'Δ':10000,x_G:.2,x_B:0},2000],[7,{w:100,x_new:20,x_old:0,MCT:100},20]])check(207,r,v,e);
for(const [r,v,e] of [[1,{MCT:100,'δtrim_cm':20,x_new:20,x_old:0},100],[2,{MCT:100,'δtrim_cm':20,w:100},20],[3,{w:100,x:20,LCF:0,MCT:100},20],[4,{MCT:100,'δtrim_cm':20,x:20,LCF:0},100]])check(208,r,v,e);
check(209,1,{w:100,TPC:20},5);check(209,2,{w:100,TPC:20,'δtrim_cm':20,L:100,LCF:0},15);check(209,3,{w:100,TPC:20,'δtrim_cm':20,L:100,LCF:0},-5);
check(209,4,{'δT_cm':7,TPC:20,x:10,LCF:0,x_load:20,L:100,MCT:100},100,{reference:'One hundred tonnes give 5 cm parallel sinkage plus 2 cm local trim increment, so measured 7 cm recovers 100 t.'});
check(210,1,{T_LCF:6.02,LCF:10,L:100,T_A:6.1,T_F:5.9},6);check(210,2,{T_M:6,LCF:10,L:100,T_A:6.1,T_F:5.9},6.02);
check(210,3,{TPC:20,LCF:10,L:100,T_A:6.1,T_F:5.9},40);check(210,4,{T_F:5,T_M:6,T_A:7},6);
for(const [r,v,e] of [[1,{V_obs:100,VCF:.98},98],[2,{V_tank:100,p_margin:.05},95],[3,{V_tank:100,p_margin:.05,VCF_max:.98},93.1],[4,{V_tank:100,p_margin:.05,VCF_max:.98,VCF_load:.95},98],[5,{GOV:100,VCF:.98},98],[6,{V_after:150,V_before:100,V_nontransfer_changes:10},40],[7,{GSV:98,'ρ_15':.8},78.4]])check(211,r,v,e);
check(212,1,{V_tank:100,V_load:95},5);check(212,2,{V_ullage:5,V_tank:100},5);check(212,3,{V_load:95,V_tank:100},.95);check(212,3,{P_ullage:5},.95,{side:2});
const grain=by.get('book-c14-p212-r04');
typed(212,4,grain.formula,grain.analyticalReview?.decision==='OPEN_MODEL_OR_SOURCE_LIMIT','Historical factor 1/5 is not independently established for approved grain stability. Excluded from supported calculations; International Grain Code loading information remains required.','EXCLUDED_FROM_SUPPORTED_CALCULATION');
check(212,5,{l:12,b:2,'α':Math.atan(.1),SF:2},.4,{reference:'Ideal rectangular-grain surface redistribution: integrate ρ·tanα·y² over width and length. This geometry example is not approved Grain Code heeling data.'});
check(212,6,{M_grain:.4,'Δ':1000,GM_eff:2},.0002);
for(const [r,v,e] of [[1,{'δT_cm':5,TPC:20},100],[2,{g:10,R_t:100},1e6],[3,{'δtrim_cm':10,MCT:100,R_t:100},10],[4,{R_t:100,KG:5,'Δ':1000},5/9],[5,{'Δ':1000,R_t:100,GM_eff:2,'θ':Math.atan(.1)},1.8],[6,{trim_cm:10,MCT:100,L:100},20],[7,{T_mean:6,T_F:5},7],[8,{'δtrim_cm':10,MCT:100,a:10},100]])check(213,r,v,e);
typed(214,1,'V(x) = integral₀ˣ(q_w−q_b)·dx',Math.abs(integral(x=>Math.cos(2*pi*x),0,1))<1e-12,'Synthetic weight 100+cos(2πx), buoyancy 100 over x∈[0,1]: net load integrates to zero; shear is sin(2πx)/(2π).');
typed(214,2,'M(x) = integral₀ˣV(ξ)·dξ',Math.abs(integral(x=>Math.sin(2*pi*x)/(2*pi),0,1))<1e-12,'Integrate the independently obtained shear: bending (1−cos(2πx))/(4π²), zero at both free ends.');
check(214,3,{M_wf:200,M_wa:200},200);check(214,4,{M_bf:180,M_ba:180},180);check(214,5,{M_w:200,M_b:180},20);
check(214,6,{W_f:100,x_f:2},200);check(214,6,{B_f:100,y_f:1.8},180,{segment:1});
check(214,7,{W_a:100,x_a:2},200);check(214,7,{B_a:100,y_a:1.8},180,{segment:1});
check(217,1,{M_light:50,M_cargo:150,M_b:180},20);check(217,2,{'ρ_air':1.2,C_D:1,A_proj:100,v:10},6000);
check(218,1,{F_h:30,'α_plan':pi/3,'β_elev':pi/3},120);
const xs=[0,1,2,3,4],ys=xs.map(x=>x*x),weights=[1,4,2,4,1],sum=xs=>xs.reduce((a,b)=>a+b,0),area=sum(ys.map((y,i)=>y*weights[i]))/3,moment=sum(ys.map((y,i)=>y*xs[i]*weights[i]))/3;
typed(218,2,'A = (h/3)·Σ(w_i·y_i)',Math.abs(area-64/3)<1e-12,'Five equally spaced full-breadth ordinates y=x²: Simpson area equals exact ∫x²dx, no removed zero endpoints.');
typed(218,3,'M_A = (h/3)·Σ(w_i·x_i·y_i)',Math.abs(moment-64)<1e-12,'Same complete ordinate set integrates first moment x³ exactly.');
typed(218,4,'x_bar = Σ(w_i·x_i·y_i)/Σ(w_i·y_i)',Math.abs(moment/area-3)<1e-12,'Centroid from independent area and first moment; the h/3 factors cancel.');
assert.equal(rows.length,121);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',expressions:121,excludedHistoricalModels:1,assertions,scope:'Displayed relations, finite weight manifests and synthetic prism buoyancy integration; real vessel KN/trim tables, grain approvals and coefficient calibration are not invented.'}));
