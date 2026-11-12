/* WGS 84 navigation geodesy (navigation-geodesy-20261111.js) against independent references:
 * - GeographicLib's published geodesic test lines (GeodTest subset, Karney),
 * - Vincenty (1975) inverse formula written here from the paper,
 * - rhumb lines from numerical integration of the meridian radius,
 * - published WGS 84 constants (quarter meridian, equatorial degree),
 * - brute-force nearest-point search for route geometry.
 * Run: node tests/navigation-geodesy-20261111.cjs */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['geographiclib-geodesic-2.2.0.min.js','turf-7.4.0-subset.min.js','navigation-geodesy-20261111.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const M=ctx.MT_GEO;assert.ok(M,'MT_GEO loaded');let checks=0;
const close=(a,b,tol,msg)=>{assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b} (tol ${tol})`);checks++};
const NM=1852,a=6378137,f=1/298.257223563,b=a*(1-f),e2=f*(2-f),D=Math.PI/180;
const angle=(x,y)=>Math.abs(((x-y+540)%360)-180);

// 1. GeographicLib test lines (first entries of geodesic/test/geodesictest.js, MIT, C. Karney): lat1 lon1 azi1 lat2 lon2 azi2 s12[m].
for(const [lat1,lon1,azi1,lat2,lon2,azi2,s12] of [
 [35.60777,-139.44815,111.098748429560326,-11.17491,-69.95921,129.289270889708762,8935244.5604818305],
 [55.52454,106.05087,22.020059880982801,77.03196,197.18234,109.112041110671519,4105086.1713924406],
 [-21.97856,142.59065,-32.44456876433189,41.84138,98.56635,-41.84359951440466,8394328.894657671],
 [-66.99028,112.2363,173.73491240878403,-12.70631,285.90344,2.512956620913668,11150344.2312080241],
 [-17.42761,173.34268,-159.033557661192928,-15.84784,5.93557,-20.787484651536988,16076603.1631180673],
 [32.84994,48.28919,150.492927788121982,-56.28556,202.29132,48.113449399816759,16727068.9438164461]]){
 const r=M.inverse({lat:lat1,lon:lon1},{lat:lat2,lon:lon2});
 close(r.distanceNm*NM,s12,1e-6,'GeodTest s12');close(angle(r.initialCourse,azi1),0,1e-9,'GeodTest azi1');close(angle(r.finalCourse,azi2),0,1e-9,'GeodTest azi2');
 const d=M.direct({lat:lat1,lon:lon1},azi1,s12/NM);close(d.lat,lat2,1e-9,'GeodTest direct lat');close(angle(d.lon,lon2),0,1e-9,'GeodTest direct lon');
}

// 2. Vincenty inverse (Survey Review XXIII/176, 1975), iterative, for non-antipodal pairs.
function vincenty(p1,p2){const L=(p2.lon-p1.lon)*D,U1=Math.atan((1-f)*Math.tan(p1.lat*D)),U2=Math.atan((1-f)*Math.tan(p2.lat*D));
 const sU1=Math.sin(U1),cU1=Math.cos(U1),sU2=Math.sin(U2),cU2=Math.cos(U2);let l=L,lp,sS,cS,s,sA,c2a,c2m;
 for(let i=0;i<200;i++){const sl=Math.sin(l),cl=Math.cos(l);sS=Math.hypot(cU2*sl,cU1*sU2-sU1*cU2*cl);cS=sU1*sU2+cU1*cU2*cl;s=Math.atan2(sS,cS);sA=cU1*cU2*sl/sS;c2a=1-sA*sA;c2m=c2a?cS-2*sU1*sU2/c2a:0;const C=f/16*c2a*(4+f*(4-3*c2a));lp=l;l=L+(1-C)*f*sA*(s+C*sS*(c2m+C*cS*(-1+2*c2m*c2m)));if(Math.abs(l-lp)<1e-13)break}
 const u2=c2a*(a*a-b*b)/(b*b),A=1+u2/16384*(4096+u2*(-768+u2*(320-175*u2))),B=u2/1024*(256+u2*(-128+u2*(74-47*u2)));
 const ds=B*sS*(c2m+B/4*(cS*(-1+2*c2m*c2m)-B/6*c2m*(-3+4*sS*sS)*(-3+4*c2m*c2m)));
 const az=Math.atan2(cU2*Math.sin(l),cU1*sU2-sU1*cU2*Math.cos(l))/D;return{s:b*A*(s-ds),az:(az+360)%360}}
const pairs=[[{lat:59.42,lon:10.48},{lat:58.97,lon:5.73}],[{lat:60.39,lon:5.32},{lat:51.95,lon:4.13}],[{lat:-33.86,lon:151.21},{lat:-36.85,lon:174.76}],[{lat:10,lon:179},{lat:10,lon:-179}],[{lat:0,lon:0},{lat:0,lon:30}],[{lat:-70,lon:-60},{lat:70,lon:60}]];
for(const [p,q] of pairs){const v=vincenty(p,q),r=M.inverse(p,q);close(r.distanceNm*NM,v.s,1e-3,'Vincenty distance');close(angle(r.initialCourse,v.az),0,1e-7,'Vincenty course')}

// 3. Rhumb lines: published constants and an independent numerical integration.
close(M.rhumb({lat:0,lon:0},{lat:90,lon:0}).distanceNm*NM,10001965.7293,1e-3,'WGS 84 quarter meridian');
close(M.rhumb({lat:0,lon:0},{lat:0,lon:1}).distanceNm*NM,a*D,1e-6,'Equatorial degree of longitude');
{const s=Math.sin(60*D);close(M.rhumb({lat:60,lon:10},{lat:60,lon:11}).distanceNm*NM,a*Math.cos(60*D)/Math.sqrt(1-e2*s*s)*D,1e-6,'Degree of longitude at 60°N')}
const e=Math.sqrt(e2),psi=phi=>Math.log(Math.tan(Math.PI/4+phi/2)*Math.pow((1-e*Math.sin(phi))/(1+e*Math.sin(phi)),e/2));
const meridianRadius=phi=>a*(1-e2)/Math.pow(1-e2*Math.sin(phi)**2,1.5);
function rhumbByIntegration(p,q){const p1=p.lat*D,p2=q.lat*D,dl=((q.lon-p.lon+540)%360-180)*D,course=Math.atan2(dl,psi(p2)-psi(p1));
 const n=20000,h=(p2-p1)/n;let m=meridianRadius(p1)+meridianRadius(p2);for(let i=1;i<n;i++)m+=(i%2?4:2)*meridianRadius(p1+i*h);return{s:Math.abs(m*h/3/Math.cos(course)),course:(course/D+360)%360}}
for(const [p,q] of [[{lat:59.42,lon:10.48},{lat:58.97,lon:5.73}],[{lat:60.39,lon:5.32},{lat:51.95,lon:4.13}],[{lat:-33.86,lon:151.21},{lat:-36.85,lon:174.76}],[{lat:40,lon:-74},{lat:51,lon:-1}],[{lat:10,lon:179},{lat:12,lon:-179}]]){
 const r=M.rhumb(p,q),x=rhumbByIntegration(p,q);close(r.distanceNm*NM,x.s,1e-3,'Rhumb distance (integration)');close(angle(r.course,x.course),0,1e-9,'Rhumb course');
 assert.ok(r.distanceNm>=M.inverse(p,q).distanceNm-1e-9,'rhumb is never shorter than the geodesic');checks++}

// 4. Route geometry: brute-force nearest point (Vincenty distances to densely sampled great-circle legs).
function slerp(p,q,t){const v=(x)=>[Math.cos(x.lat*D)*Math.cos(x.lon*D),Math.cos(x.lat*D)*Math.sin(x.lon*D),Math.sin(x.lat*D)],A=v(p),B=v(q),w=Math.acos(Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]));
 if(w<1e-12)return p;const k1=Math.sin((1-t)*w)/Math.sin(w),k2=Math.sin(t*w)/Math.sin(w),c=[0,1,2].map(i=>k1*A[i]+k2*B[i]);return{lat:Math.atan2(c[2],Math.hypot(c[0],c[1]))/D,lon:Math.atan2(c[1],c[0])/D}}
function bruteNearest(route,p){let best=Infinity;for(let i=1;i<route.length;i++)for(let k=0;k<=4000;k++)best=Math.min(best,vincenty(p,slerp(route[i-1],route[i],k/4000)).s);return best}
const routes=[
 {route:[{lat:58,lon:5},{lat:62,lon:5}],p:{lat:60,lon:6}},
 {route:[{lat:59.9,lon:10.7},{lat:59.0,lon:10.5},{lat:58.0,lon:7.5},{lat:58.9,lon:5.6}],p:{lat:58.3,lon:8.2}},
 {route:[{lat:10,lon:179},{lat:10,lon:-179}],p:{lat:10.5,lon:180}},
 {route:[{lat:51.95,lon:4.13},{lat:53.5,lon:4.5},{lat:57.0,lon:7.0}],p:{lat:55.0,lon:3.0}}];
for(const {route,p} of routes){const n=M.nearestOnRoute(route,p),bf=bruteNearest(route,p);close(n.distanceNm*NM,bf,Math.max(5,1e-4*bf),'Nearest point distance');
 assert.ok(n.alongNm>=0&&n.alongNm<=n.routeNm+1e-9,'along-route distance within route');checks++}
{const n=M.nearestOnRoute([{lat:58,lon:5},{lat:62,lon:5}],{lat:60,lon:6});close(n.alongNm*NM,vincenty({lat:58,lon:5},n.point).s,1e-3,'Along-route distance on a meridian')}
close(M.routeDistanceNm([{lat:0,lon:0},{lat:0,lon:1},{lat:0,lon:2}])*NM,2*a*D,1e-6,'Route length along the equator');
assert.equal(M.nearestOnRoute([{lat:0,lon:0}],{lat:0,lon:0}),null);assert.equal(M.nearestOnRoute([{lat:0,lon:0},{lat:1,lon:0}],{lat:NaN,lon:0}),null);checks+=2;

// 5. The page loads the libraries before the code that uses them, and the offline shell lists them.
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),order=['geographiclib-geodesic-2.2.0.min.js','turf-7.4.0-subset.min.js','navigation-geodesy-20261111.js','voyage-estimate-v861.js','app.js','ui-v854.js'].map(x=>html.indexOf('src="'+x));
assert.ok(order.every((x,i)=>x>0&&(i===0||x>order[i-1])),'script order: libraries before navigation users');for(const x of order.slice(0,3))assert.ok(x>0);
for(const x of ['geographiclib-geodesic-2.2.0.min.js','turf-7.4.0-subset.min.js','navigation-geodesy-20261111.js'])assert.ok(sw.includes("'./"+x+"'")&&fs.existsSync(x),'offline shell: '+x);checks+=4;
console.log(JSON.stringify({status:'PASS',checks,references:'GeodTest (Karney), Vincenty 1975, WGS 84 constants, Simpson-integrated rhumb, brute-force nearest point',geographiclib:M.version.geographiclib,turf:M.version.turf}));
