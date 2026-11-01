/* Independently checked representative examples of printed page 12 geometry.
   Source: user-provided scan 009.jpg. Does not prove all book equations.
*/
import assert from 'node:assert/strict';
const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-10,label);
const pi=Math.PI;
near(12*6/3,24,'pyramid volume');
near(6*(16+4+Math.sqrt(16*4))/3,56,'pyramid frustum volume');
near(4*pi*3**3/3,36*pi,'sphere volume');
near(4*pi*3**2,36*pi,'sphere area');
near(2*pi*3**2*1/3,6*pi,'spherical sector volume');
near(2*pi*3*2,12*pi,'spherical zone curved area');
near(pi*1**2*(3-1/3),8*pi/3,'spherical cap volume');
near(4*pi*3**3/3*(90/360),9*pi,'spherical wedge volume');
near(4*pi*3**2*(90/360)+pi*3**2,18*pi,'spherical wedge total surface');
console.log(JSON.stringify({status:'PASS',page:12,checks:9,note:'Independent sample arithmetic, not proof of full chapter or complete 284-image audit'}));
