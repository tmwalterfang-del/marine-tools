import assert from 'node:assert/strict';

const rad=d=>d*Math.PI/180;
const deg=r=>r*180/Math.PI;

function hav(a,b){
  const R=3440.065,p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon);
  const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function bearing(a,b){
  const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon);
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return(deg(Math.atan2(y,x))+360)%360;
}
function ddm(v,lat){
  const n=Number(v),h=lat?(n>=0?'N':'S'):(n>=0?'E':'W'),a=Math.abs(n),d=Math.floor(a),m=(a-d)*60;
  return `${String(d).padStart(lat?2:3,'0')}° ${m.toFixed(5)}′ ${h}`;
}

const a={lat:0,lon:0},b={lat:0,lon:1};
assert.ok(Math.abs(hav(a,b)-60.0405)<0.02,'1° longitude at the equator should be about 60.04 NM');
assert.ok(Math.abs(bearing(a,b)-90)<0.001,'eastbound initial bearing should be 090°T');
assert.equal(ddm(59.4213,true),'59° 25.27800′ N');
assert.equal(ddm(10.4832,false),'010° 28.99200′ E');
assert.equal(ddm(-10.5,false),'010° 30.00000′ W');

console.log('Navigation smoke checks passed.');
