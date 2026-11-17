/* Add the IMO MEPC.226(64) Saba Bank PSSA legal coordinate polygon. Run after tiling. */
const fs = require('node:fs');
const root = require('node:path').resolve(__dirname, '..');
const file = name => require('node:path').join(root, 'regulatory', name);
const read = name => JSON.parse(fs.readFileSync(file(name), 'utf8'));
const write = (name, data, pretty = false) => fs.writeFileSync(file(name), JSON.stringify(data, null, pretty ? 2 : 0) + '\n');
const id = 'saba-bank-pssa';
const raw = [[27.06,56.14],[29,55.09],[27.94,43.32],[38.03,27.41],[43.35,32.74],[45.98,29.98],[40.34,21.10],[30.88,10.92],[23.80,11.25],[16.27,15.85],[13.44,26.89],[10.55,41.81],[20.85,49.89]];
const ring = raw.map(([lat,lon]) => [-63-lon/60,17+lat/60]); ring.push(ring[0]);
const geometry = {type:'MultiPolygon',coordinates:[[ring]]};
const url='https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.226%2864%29.pdf';
const record={id,geometry,geometrySource:url,verifiedOn:'2026-11-04',legalVertexCount:13,license:'IMO legal coordinate facts',geometryNotes:'WGS84 coordinates from IMO MEPC.226(64), Annex 1. Line interpolation is not stated; straight coordinate segments are a reference assumption. Verify boundaries and associated routing measures against current official charts.'};
const manifest=read('data/geometry-manifest.json');manifest.features=manifest.features.filter(x=>x.id!==id);manifest.features.push(record);write('data/geometry-manifest.json',manifest,true);
const idx=read('data/tile-index.json');idx.areaIds=[...idx.areaIds.filter(x=>x!==id),id];idx.inlineGeometries[id]=geometry;idx.sources=idx.sources.filter(x=>x.id!==id);idx.sources.push(record);write('data/tile-index.json',idx);
const overview=read('data/overview.json');overview.features=overview.features.filter(x=>x.properties.id!==id);overview.features.push({type:'Feature',properties:{id,displayOnly:true},geometry});write('data/overview.json',overview);
const c=read('catalogue.json');c.sources=c.sources.filter(x=>x.id!=='imo-saba-bank');c.sources.push({id:'imo-saba-bank',title:'IMO MEPC.226(64) · Saba Bank PSSA',url,scope:'WGS84 PSSA boundary and associated protective measures.'});
c.areas=c.areas.filter(x=>x.id!==id);c.areas.push({id,geometryId:id,name:{en:'Saba Bank · PSSA',nb:'Saba Bank · PSSA'},category:'pssa',classification:'pssa',designationFrom:'2012-10-05',sources:['imo-saba-bank'],requirements:[{code:'saba-bank-pssa',summary:{en:'PSSA with associated area-to-be-avoided and no-anchoring measures. These measures have their own boundaries and vessel applicability: consult current official charts and notices.',nb:'PSSA med tilknyttede områder som skal unngås og ankreforbud. Tiltakene har egne grenser og virkeområder: kontroller gjeldende offisielle kart og kunngjøringer.'},sources:['imo-saba-bank'],strength:'information',from:'2012-10-05'}],verifiedOn:'2026-11-04',adoptionStatus:'adopted',geographyWarning:{en:'Reference boundary: line interpolation is not specified in the resolution. Confirm against official charts.',nb:'Referansegrense: linjetolkning er ikke angitt i resolusjonen. Kontroller mot offisielle kart.'}});
c.coverage.pssa.areas=[...c.coverage.pssa.areas.filter(x=>x!==id),id];write('catalogue.json',c,true);
console.log('Added Saba Bank PSSA using 13 IMO legal coordinates.');
