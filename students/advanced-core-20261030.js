/* Bounded linear algebra and complex arithmetic for the advanced teaching lab. */
(function(root){'use strict';
const D=root.MT_DISCOVERY;
root.MT_EDUCATION_MODELS||={};root.MT_EDUCATION_MODEL_SCHEMAS||={};
function solve(matrix,rhs){
 const n=rhs.length;if(!n||matrix.length!==n||matrix.some(r=>r.length!==n))throw RangeError('A square system is required.');
 const a=matrix.map((r,i)=>[...r,rhs[i]]),scales=a.map(r=>Math.max(...r.slice(0,n).map(Math.abs)));
 if(a.some(r=>r.some(v=>!Number.isFinite(v)))||scales.some(s=>s===0))throw RangeError('The selected connections form an unconstrained or disconnected system.');
 for(let k=0;k<n;k++){
  let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(a[i][k])/scales[i]>Math.abs(a[pivot][k])/scales[pivot])pivot=i;
  if(Math.abs(a[pivot][k])/scales[pivot]<1e-11)throw RangeError('The geometry or connections are singular or too poorly conditioned.');
  [a[k],a[pivot]]=[a[pivot],a[k]];[scales[k],scales[pivot]]=[scales[pivot],scales[k]];
  for(let i=k+1;i<n;i++){const f=a[i][k]/a[k][k];a[i][k]=0;for(let j=k+1;j<=n;j++)a[i][j]-=f*a[k][j];}
 }
 const x=Array(n).fill(0);for(let i=n-1;i>=0;i--)x[i]=(a[i][n]-a[i].slice(i+1,n).reduce((s,v,j)=>s+v*x[i+1+j],0))/a[i][i];
 if(x.some(v=>!Number.isFinite(v)))throw RangeError('The solution is not finite.');return x;
}
const C={add:(a,b)=>[a[0]+b[0],a[1]+b[1]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1]],mul:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],conj:a=>[a[0],-a[1]],abs:a=>Math.hypot(...a),angle:a=>Math.atan2(a[1],a[0])*180/Math.PI,polar:(r,t)=>[r*Math.cos(t),r*Math.sin(t)]};
C.div=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];if(!Number.isFinite(d)||d<1e-24)throw RangeError('Zero complex impedance or admittance denominator.');return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];};
function exercise(label,value,unit,relation){return {prompt:label,expected:value,unit,steps:[relation,'Result = '+Number(value.toPrecision(8))+' '+unit+'.']};}
root.MT_ADVANCED={...D,solve,C,exercise};
})(typeof window==='undefined'?globalThis:window);
