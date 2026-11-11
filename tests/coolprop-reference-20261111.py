"""Independent CoolProp check of the Education thermodynamic property code.

The browser never runs CoolProp. This compares what the pages compute against direct
CoolProp 7.2.0 solves at points that are NOT on the R134a table grid:

- R134a (HEOS) superheated vapour and subcooled liquid, from the bounded teaching table
  and its linear/log interpolator (students/advanced-thermo-20261030.js).
- Water, IAPWS-IF97 (CoolProp's own IF97 backend), against the NeutriumJS-based adapter
  (students/mollier-if97.js): saturation from 0.01 to 160 bar and superheated Region 2.

Tolerances: the R134a limits are 2-4x the interpolation error estimated by leave-one-out
checks of the table (max 0.09 % in pressure and 0.08 % in h and s). IF97 is the same
formulation in both, so it must agree to 1e-6 relative (1e-5 K for temperature).

Run: python3 tests/coolprop-reference-20261111.py   (needs CoolProp==7.2.0 and node)
"""
import json
import subprocess
import CoolProp
from CoolProp.CoolProp import PropsSI

assert CoolProp.__version__ == "7.2.0", CoolProp.__version__
R134A, WATER = "HEOS::R134a", "IF97::Water"

# Off-grid samples: odd-degree saturation temperatures, superheat/subcooling between grid values.
temperatures = [-29, -21, -13, -5, 3, 11, 19, 27, 35, 43, 51, 59]
superheat = [1, 3.5, 7.5, 15, 25, 35, 50, 70, 90, 110]
subcool = [1, 3.5, 7.5, 12.5, 17.5]
r134a = [[t, o, "vapour"] for t in temperatures for o in superheat] + [[t, o, "liquid"] for t in temperatures for o in subcool]
saturation = [0.01, 0.02, 0.05, 0.1, 0.5, 1, 2, 5, 10, 20, 50, 100, 140, 160]
superheated = [[p, t] for p in [0.05, 0.5, 1, 5, 10, 40, 80, 120] for t in [250, 350, 450, 550, 600]]
superheated = [[p, t] for p, t in superheated if t > PropsSI("T", "P", p * 1e5, "Q", 1, WATER) - 273.15 + 5]

runtime = json.loads(subprocess.run(["node", "tests/coolprop-reference-runtime-20261111.cjs"], check=True, capture_output=True, text=True,
                                    input=json.dumps({"r134a": r134a, "saturation": saturation, "superheated": superheated})).stdout)
worst, failures, checks = {}, [], 0


def compare(label, value, target, relative=None, absolute=None):
    global checks
    error = abs(value - target)
    limit = absolute if absolute is not None else relative * abs(target)
    key = label.split(" ")[0]
    worst[key] = max(worst.get(key, 0.0), error / abs(target) if relative is not None else error)
    checks += 1
    if not error <= limit:
        failures.append(f"{label}: page {value:.9g}, CoolProp {target:.9g}")


for (t, offset, phase), page in zip(r134a, runtime["r134a"]):
    tk = t + 273.15
    p = PropsSI("P", "T", tk, "Q", 1 if phase == "vapour" else 0, R134A)
    state_t = tk + offset if phase == "vapour" else tk - offset
    compare(f"R134a-p {phase} {t} °C", page["p"], p / 1000, relative=1e-3)
    compare(f"R134a-h {phase} {t} °C {offset} K", page["h"], PropsSI("H", "P", p, "T", state_t, R134A) / 1000, relative=2e-3)
    compare(f"R134a-s {phase} {t} °C {offset} K", page["s"], PropsSI("S", "P", p, "T", state_t, R134A) / 1000, relative=2e-3)

for p_bar, page in zip(saturation, runtime["saturation"]):
    pa = p_bar * 1e5
    compare(f"IF97-Tsat {p_bar} bar", page["T"], PropsSI("T", "P", pa, "Q", 0, WATER) - 273.15, absolute=1e-5)
    for key, prop, q in [("hf", "H", 0), ("hg", "H", 1), ("sf", "S", 0), ("sg", "S", 1)]:
        compare(f"IF97-sat {key} {p_bar} bar", page[key], PropsSI(prop, "P", pa, "Q", q, WATER) / 1000, relative=1e-6)

for (p_bar, t), page in zip(superheated, runtime["superheated"]):
    for key, prop in [("h", "H"), ("s", "S")]:
        compare(f"IF97-R2 {key} {p_bar} bar {t} °C", page[key], PropsSI(prop, "P", p_bar * 1e5, "T", t + 273.15, WATER) / 1000, relative=1e-6)

print(json.dumps({"status": "FAIL" if failures else "PASS", "checks": checks, "coolprop": CoolProp.__version__,
                  "maxRelativeError": {k: float(f"{v:.3g}") for k, v in worst.items()}, "failures": failures[:20]}, ensure_ascii=False))
raise SystemExit(1 if failures else 0)
