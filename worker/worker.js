/**
 * M/OPS API proxy for Cloudflare Workers.
 *
 * Production secrets:
 *   BW_AIS_CLIENT_ID
 *   BW_AIS_CLIENT_SECRET
 *   BW_API_CLIENT_ID
 *   BW_API_CLIENT_SECRET
 *
 * Never commit actual values.
 */
const TOKEN_URL="https://id.barentswatch.no/connect/token";
const AIS_LATEST="https://live.ais.barentswatch.no/v1/latest/combined";
let tokenCache={};

const cors={
  "access-control-allow-origin":"*",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "access-control-allow-headers":"content-type"
};
const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{...cors,"content-type":"application/json;charset=utf-8"}});

async function getToken(scope,env){
  const c=tokenCache[scope];
  if(c&&c.expires>Date.now()+60000)return c.value;
  const id=scope==="ais"?env.BW_AIS_CLIENT_ID:env.BW_API_CLIENT_ID;
  const secret=scope==="ais"?env.BW_AIS_CLIENT_SECRET:env.BW_API_CLIENT_SECRET;
  if(!id||!secret)throw new Error(`Missing ${scope.toUpperCase()} client credentials`);
  const body=new URLSearchParams({client_id:id,client_secret:secret,scope,grant_type:"client_credentials"});
  const r=await fetch(TOKEN_URL,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  if(!r.ok)throw new Error(`BarentsWatch token request failed (${r.status})`);
  const j=await r.json();tokenCache[scope]={value:j.access_token,expires:Date.now()+(j.expires_in||3600)*1000};return j.access_token;
}

function bboxGeometry(url){
  const q=k=>Number(url.searchParams.get(k));
  const minLat=q("minLat"),maxLat=q("maxLat"),minLon=q("minLon"),maxLon=q("maxLon");
  if(![minLat,maxLat,minLon,maxLon].every(Number.isFinite))return null;
  return {type:"Polygon",coordinates:[[
    [minLon,minLat],[maxLon,minLat],[maxLon,maxLat],[minLon,maxLat],[minLon,minLat]
  ]]};
}

async function aisLatest(url,env){
  const access=await getToken("ais",env),geometry=bboxGeometry(url);
  const options={headers:{authorization:`Bearer ${access}`}};
  if(geometry){
    options.method="POST";
    options.headers["content-type"]="application/json";
    options.body=JSON.stringify({geometry,includePosition:true,includeStatic:true});
  }
  const r=await fetch(AIS_LATEST,options);
  if(!r.ok)throw new Error(`BarentsWatch AIS request failed (${r.status})`);
  return r.json();
}

/**
 * Forecast adapter.
 *
 * BarentsWatch currently documents point endpoints for wave, wind and sea current.
 * Their precise request schema should be confirmed in the current OpenAPI page before
 * enabling production calls. Until then this endpoint deliberately returns route samples
 * with null values rather than presenting synthetic data as live.
 */
async function forecast(url,env){
  const raw=url.searchParams.get("route");
  const route=raw?JSON.parse(raw):[];
  if(!Array.isArray(route))return [];
  // Check that normal API credentials are present/valid, without fabricating weather values.
  await getToken("api",env);
  return route.map((p,i)=>({lat:p.lat,lon:p.lon,hs:null,windKn:null,currentKn:null,index:i,source:"barentswatch-adapter-pending"}));
}

export default{
  async fetch(request,env){
    if(request.method==="OPTIONS")return new Response(null,{headers:cors});
    const url=new URL(request.url);
    try{
      if(url.pathname==="/api/health")return json({status:"ok",service:"M/OPS API"});
      if(url.pathname==="/api/ais/latest")return json(await aisLatest(url,env));
      if(url.pathname==="/api/forecast")return json(await forecast(url,env));
      return json({error:"Not found"},404);
    }catch(e){return json({error:e.message},500);}
  }
};