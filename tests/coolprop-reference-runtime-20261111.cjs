/* Helper for tests/coolprop-reference-20261111.py: evaluates the browser property code
 * (R134a table interpolator, IF97 adapter) for the sample points given as JSON on stdin. */
const fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const name of ['vendor/neutrium-if97.min.js','mollier-if97.js','discovery-core-20261030.js','advanced-core-20261030.js','refrigerant-r134a-20261030.js','advanced-mechanics-20261030.js','advanced-electrical-20261030.js','advanced-fluids-20261030.js','advanced-navigation-20261030.js','advanced-thermo-20261030.js','advanced-schemas-20261030.js'])
 vm.runInContext(fs.readFileSync('students/'+name,'utf8'),ctx,{filename:name});
const R=ctx.MT_REFRIGERANT_PROPERTY,W=ctx.MT_IF97,input=JSON.parse(fs.readFileSync(0,'utf8'));
const out={r134a:input.r134a.map(([T,offset,phase])=>{const r=R.state(T,offset,phase);return{p:r.sat[0],h:r.h,s:r.s}}),
 saturation:input.saturation.map(pBar=>{const r=W.saturation(pBar);return{T:r.T,hf:r.hf,hg:r.hg,sf:r.sf,sg:r.sg}}),
 superheated:input.superheated.map(([pBar,tC])=>{const r=W.superheated(pBar,tC);return{h:r.h,s:r.s}})};
process.stdout.write(JSON.stringify(out));
