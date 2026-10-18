// Actual Worker chain; synthetic credentials and intercepted provider fetches only.
// Each scenario has a separate process so token/provider caches cannot leak.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const scenarios = {
  missing: {status:503},
  tokenFailure: {bw:true, tokenFailure:true, status:503},
  latestFailure: {bw:true, bwFailure:true, status:503},
  malformedBw: {bw:true, malformedBw:true, status:503},
  emptyBw: {bw:true, status:200, provider:'BarentsWatch', count:0},
  populatedBw: {bw:true, populatedBw:true, status:200, provider:'BarentsWatch', count:1},
  failedBwEmptyPelyr: {bw:true, bwFailure:true, pelyr:true, status:200, provider:'Pelyr-open-sources', count:0},
  emptyBwFailedPelyr: {bw:true, pelyr:true, pelyrFailure:true, status:200, provider:'BarentsWatch', count:0},
  bothFailed: {bw:true, bwFailure:true, pelyr:true, pelyrFailure:true, status:503},
  emptyPelyrOutside: {outside:true, pelyr:true, status:200, provider:'Pelyr-open-sources', count:0},
  malformedPelyr: {outside:true, pelyr:true, malformedPelyr:true, status:503},
  populatedFallback: {bw:true, pelyr:true, populatedPelyr:true, status:200, provider:'Pelyr-open-sources', count:1},
  failedPelyrEmptyBwOutside: {outside:true, bw:true, pelyr:true, pelyrFailure:true, status:200, provider:'BarentsWatch', count:0},
  productionFailure: {production:true, status:503},
  rejectedOrigin: {rejectedOrigin:true, status:403},
};

if (!process.argv[2]) {
  let failed=0;
  for (const name of Object.keys(scenarios)) {
    const r=spawnSync(process.execPath,[fileURLToPath(import.meta.url),name],{encoding:'utf8'});
    console.log(JSON.stringify({name,status:r.status===0?'PASS':'FAIL',detail:r.stdout.trim(),error:r.stderr.trim()}));
    if (r.status!==0) failed++;
  }
  console.log(JSON.stringify({result:failed?'FAIL':'PASS',scenarios:Object.keys(scenarios).length,failed}));
  process.exitCode=failed?1:0;
} else {
  const name=process.argv[2], s=scenarios[name];
  assert(s,'Unknown scenario');
  const calls=[];
  globalThis.fetch=async input=>{
    const url=new URL(String(input?.url??input));calls.push(url.origin+url.pathname);
    if(url.pathname==='/connect/token')return s.tokenFailure?new Response('synthetic failure',{status:503}):Response.json({access_token:'synthetic-fixture-only',expires_in:3600});
    if(url.hostname==='live.ais.barentswatch.no'){
      if(s.bwFailure)return new Response('synthetic failure',{status:503});
      return Response.json(s.malformedBw?{error:'bad response'}:s.populatedBw?[{mmsi:123456789,latitude:59.15,longitude:10.5,timestamp:new Date().toISOString()}]:[]);
    }
    if(url.hostname==='api.pelyr.com'){
      if(s.pelyrFailure)return new Response('synthetic failure',{status:503});
      if(url.pathname==='/v1/sources')return Response.json({sources:[{id:'qa',license:'CC-BY',source:'Synthetic QA',attribution:'Synthetic fixture'}]});
      if(url.pathname==='/v1/vessels')return Response.json(s.malformedPelyr?{error:'invalid payload'}:{vessels:s.populatedPelyr?[{mmsi:123456789,position:{lat:59.15,lon:10.5,sog:10,cog:180,license:'qa',ts:new Date().toISOString()}}]:[]});
    }
    throw Error('Unexpected network blocked: '+url.origin+url.pathname);
  };
  const {default:worker}=await import('../worker/worker-v860-dashboard.js');
  const origin=s.rejectedOrigin?'https://untrusted.invalid':s.production?'https://marinetools.app':'https://qa-emulation.marine-tools-frontend-preview.pages.dev';
  const host=s.production?'api.marinetools.app':'feature-qa-integrated-preview-20261015.api.marinetools.app';
  const bbox=s.outside?'minLat=0&maxLat=1&minLon=-31&maxLon=-30':'minLat=59&maxLat=59.3&minLon=10.3&maxLon=10.8';
  const env={...(s.bw?{BW_AIS_CLIENT_ID:'synthetic-fixture-only',BW_AIS_CLIENT_SECRET:'synthetic-fixture-only'}:{}),...(s.pelyr?{PELYR_API_KEY:'synthetic-fixture-only'}:{})};
  const response=await worker.fetch(new Request(`https://${host}/api/ais/latest?${bbox}`,{headers:{origin}}),env,{});
  const body=await response.json(),provider=response.headers.get('x-marine-tools-ais-provider');
  console.log(JSON.stringify({http:response.status,provider,body,calls}));
  assert.equal(response.status,s.status);
  if(s.status===200){assert(Array.isArray(body));assert.equal(body.length,s.count);assert.equal(provider,s.provider);}
  if(s.status===503){assert.equal(body.code,'AIS_UNAVAILABLE');assert.match(body.error,/unavailable/i);assert.equal(provider,'none');assert(!Array.isArray(body));}
  if(s.rejectedOrigin)assert.equal(calls.length,0);
  else assert.equal(response.headers.get('access-control-allow-origin'),origin);
}
