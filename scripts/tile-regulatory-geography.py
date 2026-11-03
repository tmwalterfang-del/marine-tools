"""Reproducible web assets from reviewed GeoJSON, not from display approximations.

Requires Shapely 2.1.2. Arguments: --source-dir reviewed full-resolution features,
--iho-file original VLIZ IHO v3 GeoJSON, --out regulatory/data.
The source manifest and attribution travel with the derived tiles. Grid clipping
is a storage partition: tile edges are not designated regulatory boundaries.
"""
from pathlib import Path
import argparse, gzip, hashlib, json, math
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from shapely import make_valid

def polygons(g):
    if g.is_empty or g.area==0:return []
    if g.geom_type == 'Polygon': return [g]
    if g.geom_type == 'MultiPolygon': return list(g.geoms)
    if g.geom_type == 'GeometryCollection': return [p for part in g.geoms for p in polygons(part)]
    return []

def compact(value):
    if isinstance(value, float): return round(value, 8)
    if isinstance(value, (list, tuple)): return [compact(v) for v in value]
    if isinstance(value, dict): return {k:compact(v) for k,v in value.items()}
    return value

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-dir',type=Path,required=True)
    parser.add_argument('--iho-file',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--display-only',action='store_true')
    args=parser.parse_args(); out=args.out; (out/'packs').mkdir(parents=True,exist_ok=True)
    manifest=json.loads((args.source_dir/'geometry-manifest.json').read_text(encoding='utf-8'))
    cells={}; overview=[]; hashes={}; inline={}
    for record in manifest['features']:
        if record.get('geometry',{}).get('type')=='LatitudeBand':
            inline[record['id']]=record['geometry'];continue
        feature=json.loads((args.source_dir/record['file']).read_text(encoding='utf-8'))
        geo=shape(feature['geometry']); assert geo.is_valid
        identifier=record['id']; hashes[identifier]=hashlib.sha256((args.source_dir/record['file']).read_bytes()).hexdigest()
        # This geometry is exclusively for display. Its tolerance is never used in analysis.
        display=geo.simplify(.012,preserve_topology=False) if geo.area>.05 else geo.simplify(.00005,preserve_topology=True)
        overview.append({'type':'Feature','properties':{'id':identifier,'displayOnly':True,'simplificationDegrees':.012},'geometry':compact(mapping(display))})
        if args.display_only:continue
        x0,y0,x1,y1=geo.bounds; count=0
        for x in range(math.floor(x0/2)*2,min(180,math.floor(x1/2)*2+2),2):
            for y in range(max(-90,math.floor(y0/2)*2),min(90,math.floor(y1/2)*2+2),2):
                g=geo.intersection(box(x,y,x+2,y+2)); parts=polygons(g)
                if not parts:continue
                g=unary_union(parts); candidate=compact(mapping(g))
                # Rounding is sub-centimetre and rejected if it changes topology validity.
                if not shape(candidate).is_valid: candidate=mapping(g)
                cells.setdefault((x,y),[]).append({'type':'Feature','properties':{'id':identifier},'geometry':candidate});count+=1
        print(json.dumps({'area':identifier,'cells':count}),flush=True)
    index={'version':'2026-11-03.1','verifiedOn':manifest['verifiedOn'],'tileSizeDegrees':2,'coastalSimplificationDegrees':.00001,'coordinateRoundingDegrees':1e-8,'worldwideComplete':False,'areaIds':[r['id'] for r in manifest['features']],'sources':manifest['features'],'sourceSha256':hashes,'inlineGeometries':inline,'tiles':[]}
    total=0; packed={}; offsets={}
    index['packs']=[]
    for (x,y),features in sorted(cells.items()):
        px=math.floor(x/10)*10; py=math.floor(y/10)*10
        name=f"packs/p{'w' if px<0 else 'e'}{abs(px)}-{'s' if py<0 else 'n'}{abs(py)}.bin"
        content=json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')).encode()
        data=gzip.compress(content,compresslevel=9,mtime=0);offset=offsets.get(name,0);packed.setdefault(name,[]).append(data);offsets[name]=offset+len(data);total+=len(data)
        index['tiles'].append({'cell':f'{x},{y}','file':name,'offset':offset,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    for name,parts in sorted(packed.items()):
        data=b''.join(parts);(out/name).write_bytes(data);index['packs'].append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    if not args.display_only:(out/'tile-index.json').write_text(json.dumps(index,separators=(',',':')),encoding='utf-8')
    (out/'overview.json').write_text(json.dumps({'type':'FeatureCollection','features':overview},separators=(',',':')),encoding='utf-8')
    seas=json.loads(args.iho_file.read_text(encoding='utf-8'))
    world={'type':'FeatureCollection','features':[],'attribution':'Flanders Marine Institute (2018), IHO Sea Areas v3, DOI:10.14284/323; CC-BY; display only'}
    for f in seas['features']:
        g=shape(f['geometry']); g=g if g.is_valid else make_valid(g)
        world['features'].append({'type':'Feature','properties':{'displayOnly':True},'geometry':compact(mapping(g.simplify(.08,preserve_topology=False)))})
    (out/'world-overview.json').write_text(json.dumps(world,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'tiles':len(cells),'compressedBytes':total,'overviewBytes':(out/'overview.json').stat().st_size,'worldOverviewBytes':(out/'world-overview.json').stat().st_size}),flush=True)

if __name__=='__main__':main()
