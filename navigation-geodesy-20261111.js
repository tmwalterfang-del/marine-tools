/* Marine Tools navigation geodesy.
 * Distances, courses and positions on the WGS84 ellipsoid with GeographicLib
 * (Karney 2013), and route-leg geometry with Turf. Exposes window.MT_GEO.
 * Positions are {lat, lon} in decimal degrees; distances in nautical miles (1852 m).
 * Callers keep their spherical code as a fallback when this module is absent. */
(function(root){'use strict';
const lib=root.geodesic,turf=root.turf;
if(!lib||!lib.Geodesic||!lib.Geodesic.WGS84)return;
const G=lib.Geodesic.WGS84,NM=1852,a=G.a,f=G.f,e2=f*(2-f),e=Math.sqrt(e2),D2R=Math.PI/180;
const norm=x=>((x%360)+360)%360,wrapLon=x=>((x+540)%360+360)%360-180;
const valid=p=>!!p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90;

/** Geodesic (shortest path on the ellipsoid) between two positions. */
function inverse(A,B){const r=G.Inverse(A.lat,A.lon,B.lat,B.lon);return{distanceNm:r.s12/NM,initialCourse:norm(r.azi1),finalCourse:norm(r.azi2)}}
/** Position reached after sailing a geodesic from A on an initial course for a distance. */
function direct(A,course,nm){const r=G.Direct(A.lat,A.lon,course,nm*NM);return{lat:r.lat2,lon:wrapLon(r.lon2),finalCourse:norm(r.azi2)}}

// Rhumb line (loxodrome) on the ellipsoid: course from isometric latitude, distance from the meridian arc.
const isoLat=phi=>Math.atanh(Math.sin(phi))-e*Math.atanh(e*Math.sin(phi));
const meridianArc=lat=>lat===0?0:Math.sign(lat)*G.Inverse(0,0,Math.abs(lat),0).s12;
const parallelRadius=lat=>{const s=Math.sin(lat*D2R);return a*Math.cos(lat*D2R)/Math.sqrt(1-e2*s*s)};
/** Constant-course track between two positions (shorter way round in longitude). */
function rhumb(A,B){
 const dl=wrapLon(B.lon-A.lon)*D2R,dm=meridianArc(B.lat)-meridianArc(A.lat);
 if(Math.abs(A.lat)===90||Math.abs(B.lat)===90)return{distanceNm:Math.abs(dm)/NM,course:dm>=0?0:180};
 const dpsi=isoLat(B.lat*D2R)-isoLat(A.lat*D2R);
 // dm/dpsi tends to the radius of the parallel as dpsi -> 0 (east-west track).
 const q=Math.abs(dpsi)>1e-9?dm/dpsi:parallelRadius((A.lat+B.lat)/2);
 return{distanceNm:Math.abs(q)*Math.hypot(dpsi,dl)/NM,course:norm(Math.atan2(dl,dpsi)/D2R)};
}

/** Sum of geodesic leg lengths of a route [{lat,lon},...]. */
function routeDistanceNm(route){let n=0;for(let i=1;i<route.length;i++)n+=inverse(route[i-1],route[i]).distanceNm;return n}
/** Legs with geodesic length, initial and final course. */
function routeLegs(route){const out=[];for(let i=1;i<route.length;i++){const r=inverse(route[i-1],route[i]);out.push({from:i-1,to:i,distanceNm:r.distanceNm,initialCourse:r.initialCourse,finalCourse:r.finalCourse})}return out}

/** Nearest point on a route to a position: Turf locates it on the route legs,
 *  GeographicLib measures the distances on the ellipsoid. */
function nearestOnRoute(route,p){
 if(!turf||!Array.isArray(route)||route.length<2||!valid(p))return null;
 // Unwrap longitudes so a route across 180° stays one continuous line for Turf.
 const coords=[];let prev=null;for(const w of route){let lon=w.lon;if(prev!==null)lon=prev+wrapLon(lon-prev);coords.push([lon,w.lat]);prev=lon}
 const ref=coords[0][0],plon=ref+wrapLon(p.lon-ref);
 const hit=turf.nearestPointOnLine(turf.lineString(coords),turf.point([plon,p.lat]),{units:'kilometers'});
 const [lon,lat]=hit.geometry.coordinates,point={lat,lon:wrapLon(lon)},index=Math.min(hit.properties.index,route.length-2);
 const along=routeDistanceNm(route.slice(0,index+1))+inverse(route[index],point).distanceNm;
 return{distanceNm:inverse(p,point).distanceNm,point,legIndex:index,alongNm:along,routeNm:routeDistanceNm(route)};
}

root.MT_GEO=Object.freeze({ellipsoid:'WGS84',a,f,inverse,direct,rhumb,routeDistanceNm,routeLegs,nearestOnRoute,valid,
 version:{geographiclib:lib.Constants&&lib.Constants.version_string,turf:turf?'7.4.0 (subset)':null}});
})(typeof window!=='undefined'?window:globalThis);
