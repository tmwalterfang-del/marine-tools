// Entire navigation source chapter: vector geometry, spherical path integration,
// finite compass calibration and explicit degree/radian contracts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.chapter===13);
const by=new Map(rows.map(r=>[r.id,r])),evidence={},pi=Math.PI;
let assertions=0;
function check(p,r,inputs,expected,{side=1,degrees=false,reference='Independent planar or spherical reference construction.'}={}) {
 const id=`book-c13-p${p}-r${String(r).padStart(2,'0')}`,row=by.get(id);assert.ok(row,id);
 const part=row.formula.split(/=|≈/)[side].split(';')[0].trim();
 const actual=evaluate(part,inputs,degrees);
 assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=5e-9*Math.max(1,Math.abs(expected)),id+': '+actual+' vs '+expected);assertions++;
 (evidence[id]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected,side,degrees});
}
function typed(p,r,formula,condition,reference) {
 const id=`book-c13-p${p}-r${String(r).padStart(2,'0')}`;assert.equal(by.get(id)?.formula,formula,id);assert.ok(condition,id);assertions++;
 evidence[id]={kind:'FINITE_SUM_OR_CONVENTION_CHECK',reference};
}
const wrap=x=>(x%(2*pi)+2*pi)%(2*pi);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(...a),unit=a=>a.map(x=>x/norm(a));
const point=(lat,lon)=>[Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)];
function bearing(at,tangent){const lat=Math.asin(at[2]),lon=Math.atan2(at[1],at[0]);return wrap(Math.atan2(dot(tangent,[-Math.sin(lon),Math.cos(lon),0]),dot(tangent,[-Math.sin(lat)*Math.cos(lon),-Math.sin(lat)*Math.sin(lon),Math.cos(lat)])));}
const integrate=(f,a,b,N=20000)=>{let sum=0;for(let i=0;i<N;i++)sum+=f(a+(i+.5)*(b-a)/N);return sum*(b-a)/N;};
check(185,1,{H_comp:355,dev:10},5);
check(185,2,{H_mag:5,var:-10},355);
check(185,3,{H_true:355,var:-10,dev:10},355);
check(186,1,{'φ₁':-10,'Δφ':15},5);
check(186,2,{'φ₂':5,'φ₁':-10},15);
check(187,1,{'φ₂':-10,'φ₁':5},-15);
check(187,2,{'λ₁':175,'Δλ':10},-175);
check(188,1,{'λ₂':-175,'λ₁':175},10);
check(189,1,{'φ₁':20,'φ₂':40},30);
check(189,2,{d:10,C:Math.acos(.6)},6);
check(189,3,{d:10,C:Math.acos(.6)},8);
check(189,4,{'Δλ':1,'φ_m':60},30,{degrees:true});
check(189,5,{Dep:30,'φ_m':60},1,{degrees:true});
check(189,6,{Dep:-4,DLat:3},306.869897645844,{degrees:true});
check(189,7,{DLat:6,Dep:8},10);
check(189,8,{DLat:6,C:Math.acos(.6)},10);
check(189,9,{Dep:8,C:Math.acos(.6)},10);
// Mercator ordinate from the defining integral of sec(latitude).
const phi=.4,psi=integrate(t=>1/Math.cos(t),0,phi);
check(190,1,{'φ':phi},psi,{reference:'Isometric spherical latitude independently integrated as ∫secφ dφ.'});
check(190,2,{'ψ':psi},180*psi/pi);
typed(190,2,'M_deg = (180/π)·ψ; M_min = 60·M_deg',Math.abs(60*(180*psi/pi)-(10800/pi)*psi)<1e-10,'Both scaling relations checked; neither scaled Mercator ordinate is geographic latitude.');
const dphi=.2,dpsi=integrate(t=>1/Math.cos(t),.2,.4),dlambda=.3,q=dphi/dpsi,C=Math.atan2(dlambda,dpsi);
check(190,3,{'Δλ':dlambda,'Δψ':dpsi},C);
check(190,3,{'Δλ':-dlambda,'Δψ':dpsi},2*pi-C);
check(190,4,{'Δφ':dphi,'Δψ':dpsi},q);
// Integrate the spherical metric along λ'(φ)=tan(C)secφ.
const distance=integrate(t=>Math.sqrt(1+Math.cos(t)**2*(Math.tan(C)/Math.cos(t))**2),.2,.4);
check(190,5,{R:1,'Δφ':dphi,'Δλ':dlambda,q},distance);
check(190,6,{d:distance,C},dphi);
for(const r of rows.filter(r=>r.page===190&&r.id!=='book-c13-p190-r02'))for(const symbol of r.symbols)
 assert.notEqual(symbol.unit,'°',r.id+' spherical basis must not be labelled degrees');
// Great-circle reference from a unit-vector plane and tangent at departure.
const lat1=.3,lon1=-.6,lat2=.7,lon2=.4,P=point(lat1,lon1),Q=point(lat2,lon2),N=unit(cross(P,Q));
const sigma=Math.atan2(norm(cross(P,Q)),dot(P,Q)),T=unit(cross(N,P)),course=bearing(P,T);
check(191,1,{'φ₁':lat1,'φ₂':lat2,'Δλ':lon2-lon1},dot(P,Q));
check(191,2,{R:100,'σ':sigma},100*sigma);
// The printed initial atan2 is signed; normalization is an explicit condition.
check(191,3,{'φ₁':lat1,'φ₂':lat2,'Δλ':lon2-lon1},course>pi?course-2*pi:course);
check(191,4,{'φ₁':lat1,'φ₂':lat2,'σ':sigma},Math.cos(course));
const step=1e-5;
function atArc(ds){const at=P.map((v,i)=>v*Math.cos(ds)+T[i]*Math.sin(ds));return bearing(at,unit(cross(N,at)));}
const derivative=(atArc(step)-atArc(-step))/(2*step);
check(191,5,{'φ':lat1,C:course,R:1},Math.abs(derivative));
check(191,6,{'φ':lat1,C:course,R:1},(pi/180)/Math.abs(derivative));
// Select a north vertex at longitude zero; project backward along its great circle.
const vertexLat=pi/3,delta=pi/4,startLat=Math.atan(Math.cos(delta)*Math.tan(vertexLat)),start=point(startLat,-delta),vertex=point(vertexLat,0);
const plane=unit(cross(start,vertex)),toVertex=unit(cross(plane,start)),vertexCourse=bearing(start,toVertex),arc=Math.atan2(norm(cross(start,vertex)),dot(start,vertex));
check(192,1,{C:vertexCourse,'φ₁':startLat},Math.cos(vertexLat));
check(192,2,{'φ₁':startLat,'φ_v':vertexLat},Math.cos(delta));
check(192,3,{'Δλ_v':delta,'φ₁':startLat},Math.sin(arc));
check(192,4,{'Δλ_v':delta,'φ_v':vertexLat},Math.cos(vertexCourse));
check(192,5,{'Δλ_m':-delta,'φ_v':vertexLat},Math.tan(startLat));
check(192,6,{'φ_m':startLat,'φ_v':vertexLat},Math.cos(delta));
check(192,7,{R:100,'Δλ_parallel':-.2,'φ_v':pi/3},10);
// Celestial line of sight expressed directly in local north/east/up components.
const lat=.5,dec=.2,hour=.7,observer=point(lat,0),star=point(dec,-hour),up=dot(observer,star),north=dot(star,[-Math.sin(lat),0,Math.cos(lat)]),east=star[1],alt=Math.asin(up),az=wrap(Math.atan2(east,north));
check(192,8,{'φ':lat,'δ':dec,H:hour},up);
check(192,9,{'φ':lat,'δ':dec,h:alt},Math.cos(az));
check(193,1,{'δ':0,'φ':.5},0);
check(193,2,{'φ':lat,'δ':dec,H:hour},az);
check(193,3,{'φ':lat,h:alt,A_true:az},Math.sin(dec));
check(193,4,{'φ':lat,'δ':dec,h:alt},Math.cos(hour));
check(194,1,{GHA:6,'λ':.5},wrap(6.5));
check(194,2,{LHA:.2,GHA_Aries:6,'λ':.5},wrap(-6.3));
check(194,3,{H_east_deg:32,v_kn:60,C_deg:90,'φ_deg':0},2,{degrees:true});
// An arbitrary eight-point dataset; recover coefficients by solving its linear
// system with pivoted Gaussian elimination, independently of DFT normalization.
const observations=[2,-3,5,1,4,0,-2,7],headings=observations.map((_,j)=>j*pi/4);
const basis=theta=>[1,...[1,2,3].flatMap(k=>[Math.sin(k*theta),Math.cos(k*theta)]),Math.cos(4*theta)];
const matrix=headings.map((theta,j)=>[...basis(theta),observations[j]]);
for(let col=0;col<8;col++){
 let pivot=col;for(let i=col+1;i<8;i++)if(Math.abs(matrix[i][col])>Math.abs(matrix[pivot][col]))pivot=i;
 [matrix[pivot],matrix[col]]=[matrix[col],matrix[pivot]];const scale=matrix[col][col];assert.ok(Math.abs(scale)>1e-10);
 for(let k=col;k<=8;k++)matrix[col][k]/=scale;
 for(let i=0;i<8;i++)if(i!==col){const factor=matrix[i][col];for(let k=col;k<=8;k++)matrix[i][k]-=factor*matrix[col][k];}
}
const coefficients=matrix.map(r=>r[8]),sum=xs=>xs.reduce((a,b)=>a+b,0),near=(a,b)=>Math.abs(a-b)<1e-10;
typed(194,4,'d(θ) = A+Σ(B_k·sin(k·θ)+C_k·cos(k·θ))+K·cos(4·θ), k=1…3',headings.every((theta,j)=>near(dot(coefficients,basis(theta)),observations[j])),'Eight independent interpolation equations solved with pivoted elimination; sine fourth harmonic omitted because it vanishes at samples.');
typed(194,5,'A = Σd_j/8',near(sum(observations)/8,coefficients[0]),'Eight-point mean agrees with independently solved constant coefficient.');
typed(194,6,'B_k = Σ(d_j·sin(k·θ_j))/4, k=1…3',[1,2,3].every(k=>near(sum(observations.map((d,j)=>d*Math.sin(k*headings[j])))/4,coefficients[2*k-1])),'All three sine coefficients checked against the independently solved system.');
typed(194,7,'C_k = Σ(d_j·cos(k·θ_j))/4, k=1…3',[1,2,3].every(k=>near(sum(observations.map((d,j)=>d*Math.cos(k*headings[j])))/4,coefficients[2*k])),'All three cosine coefficients checked against the independently solved system.');
typed(194,8,'K = Σ(d_j·cos(4·θ_j))/8',near(sum(observations.map((d,j)=>d*Math.cos(4*headings[j])))/8,coefficients[7]),'Nyquist coefficient requires divisor eight; ordinary harmonics require four.');
assert.equal(rows.length,50);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',coveredExpressions:50,assertions,scope:'Displayed arithmetic, independent spherical vectors/path integration and eight-observation linear solve; model geometry and operational data remain explicit.'}));
