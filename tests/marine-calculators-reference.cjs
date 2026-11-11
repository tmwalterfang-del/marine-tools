const assert=require('node:assert/strict');const m=require('../marine-calculator-models.js');const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
let r=m.tank('box',4,2,2,1,850);near(r.capacity,16);near(r.volume,8);near(r.mass,6.8);near(r.percent,50);
r=m.tank('cylinder',4,2,2,1,1000);near(r.volume,2*Math.PI);near(r.percent,50);near(m.tank('cylinder',4,2,2,0,1000).volume,0);near(m.tank('cylinder',4,2,2,2,1000).volume,4*Math.PI);
assert.throws(()=>m.tank('box',4,2,2,2.1,850));assert.throws(()=>m.tank('cylinder',4,3,2,1,850));
r=m.generator([500,500],600,0);near(r.capacity,1000);near(r.reserve,400);near(r.afterLoss,-100);near(r.afterLossPercent,120);r=m.generator([500],200,0);assert.equal(r.afterLossPercent,null);near(r.afterLoss,-200);assert.throws(()=>m.generator([],200,0));
r=m.pump(50,100,30,10,20);near(r.flow,100);near(r.head,30);r=m.pump(50,100,30,50,20);assert.equal(r.positiveFlow,false);assert.equal(r.head,null);assert.throws(()=>m.pump(50,100,50,10,20));assert.throws(()=>m.pump(50,0,30,10,20));
console.log('Marine calculator reference cases passed.');
