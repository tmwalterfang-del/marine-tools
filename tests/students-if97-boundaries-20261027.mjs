import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function engine(windowPresent) {
  const c={};if(windowPresent)c.window=c;vm.createContext(c);
  for(const f of ['vendor/neutrium-if97.min.js','mollier-if97.js'])vm.runInContext(fs.readFileSync('students/'+f,'utf8'),c);
  return c.MT_IF97;
}
let checks=0;
for(const browser of [true,false]){
  const I=engine(browser);assert.ok(I.ready);checks++;
  for(const p of [.01,.1,1,10,40,100,160]){
    const sat=I.saturation(p);
    for(const dt of [1.1e-7,2e-7,5e-7,1e-6,.01,1,100]){
      const z=I.superheated(p,sat.T+dt);
      for(const [method,key,tol] of [['statePH','h',2e-7],['statePS','s',2e-10]]){
        const back=I[method](p,z[key]);
        assert.ok(Math.abs(back[key]-z[key])<=tol,`${p} bar, ${dt} C: ${method}`);
        assert.equal(back.phase,'superheated');checks+=2;
      }
    }
    for(const mode of ['isentropic','throttle']){
      if(p===.01)continue;
      const result=I.expansion(I.wet(p,1),.01,mode);
      assert.equal(result.path[0].p,p);assert.equal(result.path.at(-1).p,.01);checks+=2;
      for(const state of result.path){assert.ok(state.p>=.01 && state.p<=160);checks++;}
    }
  }
  for(const p of [.009999999,160.0000001]){assert.throws(()=>I.wet(p,.5));checks++;}
  assert.throws(()=>I.superheated(10,I.saturation(10).T));checks++;
}
console.log(JSON.stringify({status:'PASS',checks,contexts:['browser','worker without window or DOM'],scope:'Near-saturation roundtrips and exact process pressure endpoints; original domain retained.'}));
