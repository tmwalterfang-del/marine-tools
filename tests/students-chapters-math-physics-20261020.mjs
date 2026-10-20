// Independent numeric regression examples for selected standard relations.
// This does not imply that every equation in the photographed chapter is verified.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const win={};
for(const src of ['students/formulas.js','students/formulas-extension.js','students/formulas-expansion-v1.js',
'students/learning-data.js','students/book-photos-20261020.js','students/math-chapter-20261020.js','students/physics-chapter-20261020.js','students/symbol-index.js']){
 new Function('window',read(src))(win);
}
const find=name=>{const f=win.MT_FORMULAS.find(x=>x.name===name);assert.ok(f,'Missing relationship '+name);return f};
const near=(got,want,title,tol=1e-9)=>{assert.ok(Number.isFinite(got),'Nonfinite '+title);assert.ok(Math.abs(got-want)<=tol,title+': '+got+' vs '+want);checks++};
let checks=0;
const seen=win.MT_FORMULAS;
assert.equal(seen.length,429);checks++;
for(const name of ['Spherical sine law','Derivative product rule','Binomial theorem','Specific weight',
'Latent heat of vaporization','Speed of sound in ideal gas']){
 // All selected relationships should exist with scoped unit metadata.
 const f=find(name);
 assert.ok(win.MT_STUDY.details[f.id]?.symbols?.length,'Missing symbol metadata '+name);checks++;
}
near(3+(5-1)*2,11,'arithmetic progression nth');
near(5*(3+11)/2,35,'arithmetic progression sum');
near(2/(1-0.5),4,'convergent geometric sum');
near((2+1)**4,81,'binomial expression');
near(Array.from({length:5},(_,k)=>[1,4,6,4,1][k]*2**(4-k)*1**k).reduce((a,b)=>a+b,0),81,'binomial term expansion');
near(8*6/2,24,'rhombus diagonals area');
near(2*2*(Math.PI/2)/2,Math.PI,'circular sector area in radians');
near(Math.PI*3*(4**2+4*2+2**2)/3,28*Math.PI,'conical frustum volume');
near(Math.PI*2**2*(3*5-2)/3,52*Math.PI/3,'spherical cap volume');
near(Math.sin(.3+.7),Math.sin(.3)*Math.cos(.7)+Math.cos(.3)*Math.sin(.7),'sine addition');
near(Math.cos(.3+.7),Math.cos(.3)*Math.cos(.7)-Math.sin(.3)*Math.sin(.7),'cosine addition');
near(Math.sin(2*.4),2*Math.sin(.4)*Math.cos(.4),'double-angle sine');
near((11-2)/(4-1),3,'two-point slope');
near(.3+.4-.1,.6,'probability union');
near(1000*9.81,9810,'specific weight in N per cubic metre');
near(212*5/9-32*5/9,100,'Fahrenheit Celsius temperature conversion');
near(273.15*9/5,491.67,'Kelvin Rankine temperature conversion');
near(3*2*8.314*300/2,7482.6,'monatomic gas internal energy');
near(2*(1+2*1e-5*50),2.002,'area expansion first-order');
near(1000/(1+0.001*10),990.09900990099,'density temperature relation',1e-8);
near(2*333000,666000,'heat of fusion');
near(Math.sqrt(200e9/7800),5063.696835418333,'slender rod longitudinal speed',1e-5);
near(Math.sqrt(1.4*8.314*293.15/.02897),343.1952383106029,'ideal air speed, sample approximation',1);
near(1000/10,100,'illuminance lumens/area');
near(800/10,80,'luminous efficacy');
near(100/4,25,'point source illuminance normal incidence');
near(6*4/(2*(6+4)),1.2,'lighting room index');
const limitations=win.MT_STUDY.physicsChapter20261020.notes.join(' ');
assert.ok(limitations.includes('Doppler')&&limitations.includes('273.15')&&limitations.includes('bulk'), 'Source caveats must survive');checks++;
console.log(JSON.stringify({result:'PASS',checks,formulaCount:seen.length,note:'Selected independent numeric QA only; complete subject source review pending'}));
