"""Regenerate test-only numerical facts with independent Python iapws==1.5.4.
Install that exact version in an isolated environment. This is not a runtime dependency.
Source implementation: https://github.com/jjgomera/iapws ; IAPWS R7-97(2012).
Do not replace the separate published-reference tests with these fixtures.
"""
import json
from pathlib import Path
from importlib.metadata import version
from iapws import IAPWS97
assert version('iapws') == '1.5.4'
rows=[]
for p in [.01,.02,.1,.5,1,2,5,10,20,40,80,100,120,150,160]:
    for x in [0,.1,.5,.9,1]:
        z=IAPWS97(P=p/10,x=x)
        rows.append(dict(p=p,x=x,T=z.T-273.15,h=z.h,s=z.s,region='wet'))
    for dt in [.001,.1,1,10,50,100,200]:
        T=IAPWS97(P=p/10,x=1).T-273.15+dt
        if T<=600:
            z=IAPWS97(P=p/10,T=T+273.15)
            rows.append(dict(p=p,T=T,h=z.h,s=z.s,region='superheated'))
    for T in [400,500,600]:
        z=IAPWS97(P=p/10,T=T+273.15)
        rows.append(dict(p=p,T=T,h=z.h,s=z.s,region='superheated'))
Path('tests/fixtures/if97-independent-20261027.json').write_text(json.dumps(dict(
    generator='Python iapws 1.5.4, independent implementation; published IAPWS examples checked separately',
    source='https://github.com/jjgomera/iapws',rows=rows),indent=2))
print(f'Generated {len(rows)} independent IF97 state references')
