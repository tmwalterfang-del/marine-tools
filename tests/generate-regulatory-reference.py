"""Independent spherical route / polygon references using pyproj and GEOS.

Run with --source-dir containing the full-resolution reviewed derivation and
--out pointing to tests/fixtures/regulatory-reference.json. Source SHA values
bind the reference to the geometry snapshot used by the shipped packs.
These are geographic reference transects, not approved navigational routes.
"""
from pathlib import Path
import argparse,json,math,hashlib
from shapely.geometry import shape,LineString,box
from shapely.affinity import translate
from pyproj import Geod

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path,required=True);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
    root=Path(__file__).resolve().parent.parent
    catalogue=json.loads((root/'regulatory/catalogue.json').read_text(encoding='utf-8'))
    manifest=json.loads((args.source_dir/'geometry-manifest.json').read_text(encoding='utf-8'))
    sphere=Geod(a=3440.065*1852,b=3440.065*1852);geometries={};hashes={}
    for r in manifest['features']:
        if r.get('geometry',{}).get('type')=='LatitudeBand':
            geometries[r['id']]=box(-180,r['geometry']['south'],180,r['geometry']['north']);continue
        raw=(args.source_dir/r['file']).read_bytes();hashes[r['id']]=hashlib.sha256(raw).hexdigest();geometries[r['id']]=shape(json.loads(raw)['geometry'])
    cases=[
        ('norway-atlantic',[[-4,61],[4,65],[12,70]],'2026-06-01T12:00:00Z',10),
        ('atlantic-america',[[-68,39],[-63,41],[-58,46]],'2026-04-01T00:00:00Z',12),
        ('caribbean-reentry',[[-70,16],[-66,18],[-62,19],[-65.5,18.3]],'2026-04-01T00:00:00Z',12),
        ('hawaii',[[-165,23],[-157,20],[-148,21]],'2026-04-01T00:00:00Z',14),
        ('mediterranean-overlap',[[-8,35.5],[-4.5,35.9],[0,38],[3,40],[6,42],[9,43],[11,42]],'2026-06-01T00:00:00Z',12),
        ('norwegian-transition',[[0,64],[5,66]],'2027-02-28T23:00:00Z',10),
        ('dateline',[[179,35],[-179,35],[-174,33]],'2026-04-01T00:00:00Z',12),
        ('antarctic-reentry',[[-45,-59],[-44,-62],[-42,-58]],'2026-04-01T00:00:00Z',10),
        ('hainan',[[107.9,18],[109.6,18.2],[111.5,19]],'2026-07-01T00:00:00Z',8),
        ('fjord-boundary',[[6.99,62.24],[6.99042,62.15497],[7.165,62.11]],'2030-06-01T00:00:00Z',8),
    ]
    output={'sourceSha256':hashes,'method':'pyproj Geod sphere R=3440.065 NM; independent GEOS intersection; 3D line measures track distance; geodesic fragment lengths independently cross-checked.','cases':[]}
    for name,points,departure,speed in cases:
        measured=[];total=0;last_lon=None
        for a,b in zip(points,points[1:]):
            _,_,metres=sphere.inv(*a,*b);nm=metres/1852;n=max(1,math.ceil(nm));leg=[a]+(sphere.npts(*a,*b,n-1) if n>1 else [])+[b]
            for i,p in enumerate(leg[:-1]):
                lon,lat=p
                if last_lon is not None:lon+=360*round((last_lon-lon)/360)
                measured.append((lon,lat,total+nm*i/n));last_lon=lon
            total+=nm
        lon,lat=points[-1];lon+=360*round((last_lon-lon)/360);measured.append((lon,lat,total));line=LineString(measured);areas={}
        for area in catalogue['areas']:
            geo=geometries.get(area.get('geometryId',area['id']))
            if geo is None:continue
            pieces=[]
            for offset in [-360,0,360]:
                shifted=geo if offset==0 else translate(geo,xoff=offset)
                if not shifted.intersects(line):continue
                intersection=line.intersection(shifted)
                candidates=list(intersection.geoms) if hasattr(intersection,'geoms') else [intersection]
                pieces.extend(g for g in candidates if g.geom_type=='LineString' and not g.is_empty and g.length>1e-12)
            if not pieces:continue
            distance=0;spans=[]
            for piece in pieces:
                coords=list(piece.coords);geodesic=sphere.line_length([p[0] for p in coords],[p[1] for p in coords])/1852
                measured_distance=abs(coords[-1][2]-coords[0][2]);assert abs(geodesic-measured_distance)<.01
                distance+=geodesic;spans.append({'fromNm':min(coords[0][2],coords[-1][2]),'toNm':max(coords[0][2],coords[-1][2])})
            if distance>1e-6:areas[area['id']]={'distanceNm':distance,'spans':sorted(spans,key=lambda s:s['fromNm'])}
        output['cases'].append({'name':name,'points':points,'departure':departure,'speedKn':speed,'totalNm':total,'areas':areas})
        print(json.dumps({'case':name,'distanceNm':round(total,3),'areas':list(areas)}),flush=True)
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()
