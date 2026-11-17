"""Public geographic derivation for Marine Tools.

Inputs are VLIZ ECA 2020 and IHO v3 GeoJSON downloaded from the source URLs in
regulatory/data/source-files.json, plus the reviewed legal coordinate register.
Requirements: Shapely 2.1.2, pyproj 3.7.2 and NumPy.
Write full-resolution intermediates outside the Git checkout; then run
tile-regulatory-geography.py to produce the shipped web/app packs.
Reference coastline accuracy is unspecified. No rectangular or circular
approximation is substituted for a regulatory boundary.
"""
from pathlib import Path
import re,json,math,hashlib,argparse
import numpy as np
from functools import lru_cache
from shapely.geometry import shape,mapping,Polygon,Point,LineString,box
from shapely.ops import unary_union,split
from shapely import make_valid
from pyproj import Geod
parser=argparse.ArgumentParser(description='Derive maritime reference boundaries from reviewed source geometry and legal coordinate facts.')
parser.add_argument('--source-dir',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
parser.add_argument('--vertices',type=Path,default=Path(__file__).resolve().parent.parent/'regulatory/data/legal-vertices.json')
args=parser.parse_args();p=args.source_dir;out=args.out;out.mkdir(parents=True,exist_ok=True)
source_register=Path(__file__).resolve().parent.parent/'regulatory/data/source-files.json'
for record in json.loads(source_register.read_text())['files']:
 if hashlib.sha256((p/record['file']).read_bytes()).hexdigest()!=record['sha256']:raise ValueError('Source differs from reviewed snapshot: '+record['file'])
geod=Geod(ellps='WGS84')
vertices=json.loads(args.vertices.read_text(encoding='utf-8'))
no=vertices['norwegian-sea'];ca={int(k):v for k,v in vertices['canadian-arctic'].items()};nea={int(k):v for k,v in vertices['north-east-atlantic'].items()}
assert len(no)==29 and set(ca)==set(range(1,180)) and set(nea)==set(range(1,158))
(out/'legal-vertices.json').write_text(json.dumps(vertices,separators=(',',':')),encoding='utf-8')
# A metre-scale topology-preserving coastline tessellation; never use bounding
# rectangles as regulatory areas. Bounding boxes here only accelerate overlays.
def fix(g):return make_valid(g) if not g.is_valid else g
raw=json.loads((p/'iho-original.geojson').read_text(encoding='utf-8'))
sea={f['properties']['name']:fix(shape(f['geometry'])).simplify(.00001,preserve_topology=True) for f in raw['features']}
print('Coastal reference loaded.',flush=True)
@lru_cache(maxsize=12)
def ocean_mask(bounds):
 query=box(*bounds);return fix(unary_union([g.intersection(query) for g in sea.values() if g.intersects(query)]))
def dense(points,closed=False):
 coords=list(points)
 if closed and coords[-1]!=coords[0]:coords.append(coords[0])
 result=[]
 for a,b in zip(coords,coords[1:]):
  _,_,distance=geod.inv(*a,*b);count=max(1,math.ceil(distance/1852))
  result.extend([a]+(geod.npts(*a,*b,count-1) if count>1 else []))
 return result+[coords[-1]]
def poly(coords):return fix(Polygon(dense(coords,True)))
def export(id,g,source,notes,**props):
 if g.is_empty:raise ValueError('Empty '+id)
 g=fix(g)
 if g.geom_type=='GeometryCollection':g=unary_union([q for q in g.geoms if q.geom_type in ['Polygon','MultiPolygon']])
 assert g.is_valid and g.geom_type in ['Polygon','MultiPolygon'],(id,g.geom_type)
 f={'type':'Feature','properties':{'id':id,'geometrySource':source,'verifiedOn':'2026-11-03','coastlineSource':'VLIZ IHO Sea Areas v3; source coastline positional accuracy unspecified','processing':'Legal geodesics tessellated at ≤1 NM with WGS84 ellipsoid; source coastline topology-preserving simplification ≤0.00001 degree before overlays','geometryNotes':notes,**props},'geometry':mapping(g)}
 data=json.dumps(f,separators=(',',':'));(out/(id+'.geojson')).write_text(data,encoding='utf-8');print(json.dumps({'area':id,'bytes':len(data),'valid':g.is_valid}),flush=True);return f
def dense_legacy_ring(ring,id):
 a=np.asarray(ring.coords);_,_,ds=geod.inv(a[:-1,0],a[:-1,1],a[1:,0],a[1:,1]);out=[]
 for i,d in enumerate(ds):
  x=a[i].tolist();y=a[i+1].tolist();n=max(1,math.ceil(d/1852));out.append(x)
  if n>1:
   parallel=id in ['baltic-sea','north-sea'] and abs(x[1]-y[1])<1e-8 and any(abs(x[1]-v)<1e-6 for v in [62,48.5,57+44.8/60])
   if parallel:out.extend([[x[0]+(y[0]-x[0])*j/n,x[1]] for j in range(1,n)])
   else:out.extend(geod.npts(*x,*y,n-1))
 return out+[a[-1].tolist()]
def legacy_geometry(g,id):
 parts=list(g.geoms) if hasattr(g,'geoms') else [g]
 from shapely.geometry import MultiPolygon
 return fix(MultiPolygon([Polygon(dense_legacy_ring(q.exterior,id),[dense_legacy_ring(r,id) for r in q.interiors]) for q in parts]))
legacy=json.loads((p/'eca-reg14-original.geojson').read_text(encoding='utf-8'))
legacy_groups={}
for f in legacy['features']:
 name=f['properties']['area'];id='baltic-sea' if name=='Baltic Sea area' else 'north-sea' if name=='North Sea area' else 'us-caribbean' if 'Caribbean' in name else 'north-american'
 legacy_groups.setdefault(id,[]).append(fix(shape(f['geometry'])).simplify(.00001,preserve_topology=True))
features=[];old={}
for id,geoms in legacy_groups.items():
 g=legacy_geometry(fix(unary_union(geoms)),id);old[id]=g;features.append(export(id,g,'https://doi.org/10.14284/397','VLIZ 2020 published ECA outline (processed June 2019); older source used only for these four unchanged designations.',coastlineSource='ESRI Countries 2014 as provided in VLIZ ECA 2020; positional accuracy unspecified',processing='Published VLIZ outline simplified 0.00001 degree, with WGS84 geodesic tessellation at <=1 NM; defined North Sea/Baltic parallel limits remain parallels.',license='CC-BY-4.0',attribution='Flanders Marine Institute (VLIZ), Belgium (2020), DOI:10.14284/397',sourceVersion='2020'))
# Norwegian Sea: the legal offshore chain closes through mainland land; ocean
# clipping creates the coastline, rather than drawing an invented marine edge.
g=poly(no).intersection(ocean_mask((-2,61.9,37,75)))
features.append(export('norwegian-sea',g,'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.315%2874%29.pdf','MARPOL II/13.9.4 legal coordinate chain; designation by MEPC.392(82). The reference coastline is not a hydrographic chart.',legalVertexCount=29,license='CC-BY-4.0 (coastal data); IMO legal coordinates'))
# Mediterranean IHO sub-basins are coastal reference only; legal Gibraltar,
# Canakkale and Suez limits replace their cartographic entrances.
mednames=['Mediterranean Sea - Western Basin','Mediterranean Sea - Eastern Basin','Alboran Sea','Balearic (Iberian Sea)','Ligurian Sea','Tyrrhenian Sea','Ionian Sea','Adriatic Sea','Aegean Sea','Strait of Gibraltar']
med=fix(unary_union([sea[n] for n in mednames]))
# Half-plane clipping is applied along the exact legal entrance lines, not a
# rectangular geographic approximation. Large inland helper vertices close it.
traf=[-6-2/60,36+11/60];spart=[-5-55/60,35+48/60];meh=[26+11/60,40+3/60];kum=[26+12/60,40+1/60]
west=Polygon(dense([traf,spart,[40,25],[40,50],[0,50],traf],False));med=med.intersection(west)
# Source Aegean shore extends into Dardanelles. Exclude all waters beyond the
# true Canakkale cross-strait boundary; north closure passes on mainland land.
canakkale=Polygon(dense([meh,kum,[35,45],[25,45],meh],False));med=med.difference(canakkale)
suez=poly([[32+16/60,31+29/60],[32+28.48/60,31+29/60],[32+32.62/60,31+14/60],[32+16/60,31+14/60]])
med=med.difference(suez)
features.append(export('mediterranean',med,'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.361%2879%29.pdf','Legal Gibraltar/Canakkale entrance lines and Suez exclusion, over VLIZ IHO reference coastline.',license='CC-BY-4.0 (coastal data); IMO legal coordinates'))
# Canadian Arctic two legal chains join through Hans Island and a mainland
# interior closure. The closure is discarded by intersection with sea areas.
ca_points=[ca[i] for i in range(1,180)]+[[-64.30,59.96],[-64.31,59.95],[-64.75,58.33],[-65,58],[-66,56],[-67,55],[-72,48],[-85,48],[-110,55],[-130,65],[-137,68],ca[1]]
canada=poly(ca_points).intersection(ocean_mask((-141,49.9,-55,87)))
features.append(export('canadian-arctic',canada,'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.392%2882%29.pdf','MEPC.392(82) Appendix VII 5.1 and 5.2: points 1–179, joined through Hans Island and mainland coastline. Coastal overlay remains a reference dataset.',legalVertexCount=179,license='CC-BY-4.0 (coastal data); IMO legal coordinates'))
# NE Atlantic perimeter uses the adopted 157 points plus the referenced Canadian
# Arctic chains in REVERSE, not the earlier proposal's coordinate table.
helpers_uk=[[-3,57],[-2,55],[-1,53],[-1,51],[-3,50]]
helpers_continent=[[-3,49],[0,47],[1,44],[-3,40],[-5.9,37.4],traf]
parallel_steps=math.ceil(geod.inv(*nea[27],*nea[28])[2]/1852)
parallel_62=[[nea[27][0]+(nea[28][0]-nea[27][0])*i/parallel_steps,62] for i in range(parallel_steps+1)]
chain=[nea[i] for i in range(1,28)]+parallel_62[1:]+[nea[29]]+helpers_uk+[nea[30]]+helpers_continent+[nea[i] for i in range(31,158)]+[ca[i] for i in range(173,50,-1)]+[ca[i] for i in range(50,22,-1)]+[nea[1]]
# The UK/coastal gaps are completed only through land or the already excluded
# North Sea. Any exposed helper line is an audit failure rather than a boundary.
mask=ocean_mask((-67,34,7,88));ne=poly(chain).intersection(mask).difference(old['north-sea'])
features.append(export('north-east-atlantic',ne,'https://ltsa.lrv.lt/public/canonical/1787556830/2290/MEPC.407%2884%29.pdf','Adopted MEPC.407(84) points 1–157 and referenced Canadian Arctic sections; existing North Sea excluded. Inland helper closures removed by coastal overlay.',legalVertexCount=157,license='CC-BY-4.0 (coastal data); IMO legal coordinates'))

polygon=poly
# The Mediterranean discharge Special Area has no ECA-specific Suez exclusion.
mednames=['Mediterranean Sea - Western Basin','Mediterranean Sea - Eastern Basin','Alboran Sea','Balearic (Iberian Sea)','Ligurian Sea','Tyrrhenian Sea','Ionian Sea','Adriatic Sea','Aegean Sea','Strait of Gibraltar'];med=unary_union([sea[n] for n in mednames]);traf=[-6-2/60,36+11/60];spart=[-5-55/60,35+48/60];meh=[26+11/60,40+3/60];kum=[26+12/60,40+1/60]
med=med.intersection(polygon([traf,spart,[40,25],[40,50],[0,50]])).difference(polygon([meh,kum,[35,45],[25,45]]))
features.append(export('mediterranean-special',med,'https://www.imo.org/en/ourwork/environment/pages/special-areas-marpol.aspx','MARPOL Annex I/V Mediterranean Special Area: Gibraltar and Canakkale limits; not the ECA-specific Suez exclusion.'))
# NW Mediterranean PSSA, MEPC.380(80), annex 1, A–J. H–I follows Sardinia coast.
coords=vertices['nw-mediterranean-pssa'];A,H,I,J=[coords[k] for k in ['A','H','I','J']]
sardinia=[[8.236,40.9],[8.282,40.842],[8.5,40.6],[9,40.6],[9.52,41.144]];europe=[[11.6,43],[10.5,44.5],[9,45],[7,45],[1,44],[-1,40]]
chain=[coords[k] for k in 'ABCDEFGH']+sardinia+[I,J]+europe+[A];wm=ocean_mask((-2,38,13,45));pssa=polygon(chain).intersection(wm)
for label,helper in [('sardinia',[H]+sardinia+[I]),('europe',[J]+europe+[A])]:
 g=LineString(dense(helper)).intersection(wm)
 if label=='sardinia':assert g.length<1e-9,'Helper line became a marine boundary'
 else:
  for point in (list(g.geoms) if hasattr(g,'geoms') else [g]):
   for xy in point.coords:assert min(geod.inv(*xy,*A)[2],geod.inv(*xy,*J)[2])<700,'Unexpected offshore closure'
features.append(export('nw-mediterranean-pssa',pssa,'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.380%2880%29.pdf','MEPC.380(80) annex 1 coordinates A–J. H–I follows the northern Sardinia coast. Source coast/reference endpoints require boundary review.'))
# Fjord components are selected after cutting actual water polygons at the legal
# entrance cross-sections. A computational crop must never bound a selected fjord.
wm=ocean_mask((6.4,60.7,7.8,62.6))
def cut(g,a,b):
 az,back,d=geod.inv(*a,*b);aa=geod.fwd(*a,az+180,1000)[:2];bb=geod.fwd(*b,back+180,1000)[:2];line=LineString(dense([aa,a,b,bb]));parts=[]
 for q in (list(g.geoms) if hasattr(g,'geoms') else [g]):
  if q.geom_type=='Polygon':parts.extend(split(q,line).geoms)
 return parts

def component(parts,seeds):
 result=[]
 for seed in seeds:
  candidates=[g for g in parts if g.covers(Point(seed))]
  if not candidates:raise ValueError('Seed missing '+str(seed))
  result+=candidates
 return unary_union(result)
def dms(d,m,s=0):return d+m/60+s/3600
geir_a=[dms(7,2,30),dms(62,13,42)];geir_b=[dms(7,0,30),dms(62,13,48)]
g=component(cut(wm,geir_a,geir_b),[[6.99042,62.15497]])
hell_a=[dms(6,54,18),dms(62,5,42)];hell_b=[dms(6,54,42),dms(62,6,30)]
g=component(cut(g,hell_a,hell_b),[[6.99042,62.15497]])
taf_a=[dms(7,19,48),dms(62,17,12)];taf_b=[dms(7,20,12),dms(62,17,36)]
taf=component(cut(wm,taf_a,taf_b),[[7.38809,62.2639]])
naer_a=[dms(7,2,54),dms(61,3,36)];naer_b=[dms(7,0,54),dms(61,3,24)]
naer=component(cut(wm,naer_a,naer_b),[[6.95593,60.9599]])
for id,part in [('geiranger-tafjord',unary_union([g,taf])),('naeroy-aurland',naer)]:
 assert part.boundary.intersection(box(6.4,60.7,7.8,62.6).boundary).is_empty,'Crop became a boundary '+id
 features.append(export(id,part,'https://www.sdir.no/siteassets/engelske-forskrifter-pdf/30-may-2012-no.-488-environmental-safety-for-ships-and-mobile-offshore-units.pdf','Environmental Safety Regulations §10a legal entrance lines; Hellesylt excluded, Tafjord included. Crops never bound the selected fjords.'))
for id in ['antarctic-special','antarctic-polar']:
 record={'id':id,'geometry':{'type':'LatitudeBand','south':-90,'north':-60},'geometrySource':'https://www.imo.org/en/ourwork/environment/pages/special-areas-marpol.aspx','verifiedOn':'2026-11-03','geometryNotes':'Exact legal sea-area parallel south of 60°S, represented as a latitude band, not an approximate circle.'};features.append({'type':'Feature','properties':{k:v for k,v in record.items() if k!='geometry'},'geometry':record['geometry']})

# Hainan is a separate national DECA. Its unconfirmed source datum is retained
# as a warning in the catalogue; it is never labelled an IMO NOx ECA.
hainan=list(vertices['china-hainan'].values());assert len(hainan)==20
g=poly(hainan).intersection(ocean_mask((107,17,112,21)))
features.append(export('china-hainan',g,'https://xxgk.mot.gov.cn/2020/xzgfxwj/202303/t20230316_3775697.html','MOT 2018 table 2, twenty successive legal coordinate facts. WGS84/geodesic interpretation requires datum/interpolation confirmation; no inferred distance buffer.',legalVertexCount=20))
manifest={'version':1,'verifiedOn':'2026-11-03','worldwideComplete':False,'features':[]}
for f in features:
 props=f['properties'];id=props['id']
 if f['geometry']['type']=='LatitudeBand':manifest['features'].append({**props,'geometry':f['geometry']})
 else:manifest['features'].append({**props,'file':id+'.geojson','sha256':hashlib.sha256((out/(id+'.geojson')).read_bytes()).hexdigest()})
(out/'geometry-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
