"""Generate bounded R134a teaching tables and independent full-cycle cases.

Requires CoolProp==7.2.0. Runtime calculations use local interpolation only.
All enthalpy/entropy values retain the same CoolProp reference convention.
"""
import json
from pathlib import Path
import CoolProp
from CoolProp.CoolProp import PropsSI

assert CoolProp.__version__ == '7.2.0'
ROOT = Path(__file__).resolve().parents[1]
FLUID = 'HEOS::R134a'
TEMPERATURES = list(range(-30, 61, 2))
SUPERHEAT = [0, 2, 5, 10, 20, 30, 40, 60, 80, 100, 120]
SUBCOOL = [0, 2, 5, 10, 15, 20]
def neat(v):
    return float(f'{v:.11g}')
def prop(out, a, av, b, bv):
    return PropsSI(out, a, av, b, bv, FLUID)
rows = []
for tc in TEMPERATURES:
    temperature = tc + 273.15
    pressure = prop('P', 'T', temperature, 'Q', 0)
    sat = [pressure / 1000] + [prop(key, 'T', temperature, 'Q', phase) / 1000 for key, phase in [('H', 0), ('H', 1), ('S', 0), ('S', 1)]]
    vapour = [[prop(key, 'T', temperature, 'Q', 1) / 1000 if sh == 0 else prop(key, 'P', pressure, 'T', temperature + sh) / 1000 for key in ['H', 'S']] for sh in SUPERHEAT]
    liquid = [[prop(key, 'T', temperature, 'Q', 0) / 1000 if sc == 0 else prop(key, 'P', pressure, 'T', temperature - sc) / 1000 for key in ['H', 'S']] for sc in SUBCOOL]
    rows.append({'T': tc, 'sat': [neat(v) for v in sat], 'vapour': [[neat(v) for v in pair] for pair in vapour], 'liquid': [[neat(v) for v in pair] for pair in liquid]})
data = {'fluid': 'R134a', 'generator': 'CoolProp 7.2.0 HEOS', 'units': {'pressure': 'kPa(a)', 'enthalpy': 'kJ/kg', 'entropy': 'kJ/(kg K)', 'temperature': '°C'}, 'superheat': SUPERHEAT, 'subcool': SUBCOOL, 'rows': rows}
(ROOT / 'students/refrigerant-r134a-20261030.js').write_text('/* Bounded teaching table; see REFRIGERANT_ATTRIBUTION.md. */\n(function(root){"use strict";root.MT_R134A_TABLE=' + json.dumps(data, separators=(',', ':')) + ';})(typeof window==="undefined"?globalThis:window);\n', encoding='utf-8')
cases = []
for te, tc, sh, sc, efficiency in [(-10, 40, 5, 5, .75), (-20, 50, 10, 10, .7), (0, 30, 0, 0, 1), (-13, 37, 7, 3, .82), (-7, 43, 12, 8, .65), (5, 25, 15, 2, .9)]:
    pe, pc = prop('P', 'T', te + 273.15, 'Q', 1), prop('P', 'T', tc + 273.15, 'Q', 0)
    h1 = prop('H', 'P', pe, 'T', te + 273.15 + sh) if sh else prop('H', 'P', pe, 'Q', 1)
    s1 = prop('S', 'P', pe, 'T', te + 273.15 + sh) if sh else prop('S', 'P', pe, 'Q', 1)
    h2s = prop('H', 'P', pc, 'S', s1)
    h2 = h1 + (h2s - h1) / efficiency
    h3 = prop('H', 'P', pc, 'T', tc + 273.15 - sc) if sc else prop('H', 'P', pc, 'Q', 0)
    cases.append({'inputs': {'evaporating': te, 'condensing': tc, 'superheat': sh, 'subcool': sc, 'efficiency': efficiency, 'flow': .05}, 'expected': {'pe': pe / 1000, 'pc': pc / 1000, 'h1': h1 / 1000, 'h2': h2 / 1000, 'h3': h3 / 1000, 'COP': (h1 - h3) / (h2 - h1), 'T2': prop('T', 'P', pc, 'H', h2) - 273.15}})
(ROOT / 'tests/fixtures/refrigerant-cycles-20261030.json').write_text(json.dumps({'source': 'CoolProp 7.2.0 HEOS direct state solves, not the runtime interpolator', 'cases': cases}, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'rows': len(rows), 'independentCycles': len(cases)}))
rankine = []
for pb, pc, inlet, et, ep in [(40, .1, 400, .8, .8), (20, .2, 350, 1, 1), (100, .05, 550, .9, .85), (10, 1, 300, .7, .65)]:
    boiler, condenser, tin = pb * 1e5, pc * 1e5, inlet + 273.15
    def water(key, a, av, b, bv):
        return PropsSI(key, a, av, b, bv, 'IF97::Water')
    h1 = water('H', 'P', condenser, 'Q', 0)
    pump = (boiler - condenser) / water('D', 'P', condenser, 'Q', 0) / ep
    h2 = h1 + pump
    h3 = water('H', 'P', boiler, 'T', tin)
    s3 = water('S', 'P', boiler, 'T', tin)
    h4s = water('H', 'P', condenser, 'S', s3)
    h4 = h3 - et * (h3 - h4s)
    rankine.append({'inputs': {'boiler': pb, 'condenser': pc, 'temperature': inlet, 'turbineEfficiency': et, 'pumpEfficiency': ep, 'flow': 1}, 'expected': {'wt': (h3 - h4) / 1000, 'wp': pump / 1000, 'qin': (h3 - h2) / 1000, 'qout': (h4 - h1) / 1000, 'net': (h3 - h4 - pump) / 1000, 'efficiency': (h3 - h4 - pump) / (h3 - h2)}})
(ROOT / 'tests/fixtures/rankine-cycles-20261030.json').write_text(json.dumps({'source': 'CoolProp 7.2.0 independent IF97 implementation', 'cases': rankine}, indent=2) + '\n', encoding='utf-8')
