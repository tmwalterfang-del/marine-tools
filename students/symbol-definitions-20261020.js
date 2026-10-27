/* Explicit, independently authored formula-local symbol definitions.
Metadata population is separate from printed-source and numerical validation. */
(function(){'use strict';
const S=window.MT_STUDY,F=window.MT_FORMULAS;
if(!S?.details||!Array.isArray(F))throw Error('Load formula and study packs before the symbol completion pack.');
const definitions={
  "linear-equation": [
    {
      "symbol": "a",
      "meaning": "Nonzero coefficient of x",
      "unit": "dimensionless",
      "quantityId": "formula.linear-equation.a"
    },
    {
      "symbol": "b",
      "meaning": "Constant term",
      "unit": "dimensionless",
      "quantityId": "formula.linear-equation.b"
    },
    {
      "symbol": "x",
      "meaning": "Unknown real number",
      "unit": "dimensionless",
      "quantityId": "formula.linear-equation.x"
    }
  ],
  "quadratic-equation": [
    {
      "symbol": "a",
      "meaning": "Nonzero quadratic coefficient",
      "unit": "dimensionless",
      "quantityId": "formula.quadratic-equation.a"
    },
    {
      "symbol": "b",
      "meaning": "Linear coefficient",
      "unit": "dimensionless",
      "quantityId": "formula.quadratic-equation.b"
    },
    {
      "symbol": "c",
      "meaning": "Constant term",
      "unit": "dimensionless",
      "quantityId": "formula.quadratic-equation.c"
    },
    {
      "symbol": "x",
      "meaning": "Unknown root, real only when discriminant is nonnegative",
      "unit": "dimensionless",
      "quantityId": "formula.quadratic-equation.x"
    }
  ],
  "difference-of-squares": [
    {
      "symbol": "a",
      "meaning": "First real algebraic operand",
      "unit": "dimensionless",
      "quantityId": "formula.difference-of-squares.a"
    },
    {
      "symbol": "b",
      "meaning": "Second real algebraic operand",
      "unit": "dimensionless",
      "quantityId": "formula.difference-of-squares.b"
    }
  ],
  "binomial-square": [
    {
      "symbol": "a",
      "meaning": "First real algebraic operand",
      "unit": "dimensionless",
      "quantityId": "formula.binomial-square.a"
    },
    {
      "symbol": "b",
      "meaning": "Second real algebraic operand",
      "unit": "dimensionless",
      "quantityId": "formula.binomial-square.b"
    }
  ],
  "logarithm-power": [
    {
      "symbol": "a",
      "meaning": "Real algebraic value",
      "unit": "dimensionless",
      "quantityId": "formula.logarithm-power.a"
    },
    {
      "symbol": "n",
      "meaning": "Real algebraic value",
      "unit": "dimensionless",
      "quantityId": "formula.logarithm-power.n"
    }
  ],
  "arithmetic-mean": [
    {
      "symbol": "x̄",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.arithmetic-mean.x̄"
    },
    {
      "symbol": "xᵢ",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.arithmetic-mean.xᵢ"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.arithmetic-mean.n"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.arithmetic-mean.i"
    }
  ],
  "student-v2-sample-mean": [
    {
      "symbol": "x̄",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.student-v2-sample-mean.x̄"
    },
    {
      "symbol": "xi",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.student-v2-sample-mean.xi"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-sample-mean.n"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-sample-mean.i"
    }
  ],
  "weighted-mean": [
    {
      "symbol": "x̄",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.weighted-mean.x̄"
    },
    {
      "symbol": "xᵢ",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.weighted-mean.xᵢ"
    },
    {
      "symbol": "wᵢ",
      "meaning": "Nonnegative statistical weight",
      "unit": "dimensionless",
      "quantityId": "formula.weighted-mean.wᵢ"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.weighted-mean.i"
    }
  ],
  "percentage-change": [
    {
      "symbol": "p",
      "meaning": "Signed percentage change; numeric percent, not a fraction",
      "unit": "%",
      "quantityId": "formula.percentage-change.p"
    },
    {
      "symbol": "new",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.percentage-change.new"
    },
    {
      "symbol": "old",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.percentage-change.old"
    }
  ],
  "sine-rule": [
    {
      "symbol": "a",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.sine-rule.a"
    },
    {
      "symbol": "b",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.sine-rule.b"
    },
    {
      "symbol": "c",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.sine-rule.c"
    },
    {
      "symbol": "A",
      "meaning": "Interior angle opposite side a",
      "unit": "rad or °",
      "quantityId": "formula.sine-rule.A"
    },
    {
      "symbol": "B",
      "meaning": "Interior angle opposite side b",
      "unit": "rad or °",
      "quantityId": "formula.sine-rule.B"
    },
    {
      "symbol": "C",
      "meaning": "Interior angle opposite side c; included between a and b",
      "unit": "rad or °",
      "quantityId": "formula.sine-rule.C"
    }
  ],
  "cosine-rule": [
    {
      "symbol": "a",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.cosine-rule.a"
    },
    {
      "symbol": "b",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.cosine-rule.b"
    },
    {
      "symbol": "c",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.cosine-rule.c"
    },
    {
      "symbol": "A",
      "meaning": "Interior angle opposite side a",
      "unit": "rad or °",
      "quantityId": "formula.cosine-rule.A"
    },
    {
      "symbol": "B",
      "meaning": "Interior angle opposite side b",
      "unit": "rad or °",
      "quantityId": "formula.cosine-rule.B"
    },
    {
      "symbol": "C",
      "meaning": "Interior angle opposite side c; included between a and b",
      "unit": "rad or °",
      "quantityId": "formula.cosine-rule.C"
    }
  ],
  "triangle-area": [
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.triangle-area.A"
    },
    {
      "symbol": "b",
      "meaning": "Selected triangle base length",
      "unit": "m",
      "quantityId": "formula.triangle-area.b"
    },
    {
      "symbol": "h",
      "meaning": "Height perpendicular to selected base",
      "unit": "m",
      "quantityId": "formula.triangle-area.h"
    }
  ],
  "rectangle-area": [
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.rectangle-area.A"
    },
    {
      "symbol": "a",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.rectangle-area.a"
    },
    {
      "symbol": "b",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.rectangle-area.b"
    }
  ],
  "centroid-in-one-dimension": [
    {
      "symbol": "x̄",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.centroid-in-one-dimension.x̄"
    },
    {
      "symbol": "Aᵢ",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.centroid-in-one-dimension.Aᵢ"
    },
    {
      "symbol": "xᵢ",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.centroid-in-one-dimension.xᵢ"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.centroid-in-one-dimension.i"
    }
  ],
  "polar-to-cartesian": [
    {
      "symbol": "x",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.polar-to-cartesian.x"
    },
    {
      "symbol": "y",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.polar-to-cartesian.y"
    },
    {
      "symbol": "r",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.polar-to-cartesian.r"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.polar-to-cartesian.θ"
    }
  ],
  "distance-in-plane": [
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.distance-in-plane.d"
    },
    {
      "symbol": "x₁",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.distance-in-plane.x₁"
    },
    {
      "symbol": "x₂",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.distance-in-plane.x₂"
    },
    {
      "symbol": "y₁",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.distance-in-plane.y₁"
    },
    {
      "symbol": "y₂",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.distance-in-plane.y₂"
    }
  ],
  "newton-s-second-law": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.newton-s-second-law.F"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.newton-s-second-law.m"
    },
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.newton-s-second-law.a"
    }
  ],
  "weight-force": [
    {
      "symbol": "W",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.weight-force.W"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.weight-force.m"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.weight-force.g"
    }
  ],
  "moment-torque": [
    {
      "symbol": "M",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.moment-torque.M"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.moment-torque.F"
    },
    {
      "symbol": "d⊥",
      "meaning": "Perpendicular distance from axis to line of force action",
      "unit": "m",
      "quantityId": "formula.moment-torque.d⊥"
    }
  ],
  "equilibrium-of-forces": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.equilibrium-of-forces.F"
    }
  ],
  "equilibrium-of-moments": [
    {
      "symbol": "M",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.equilibrium-of-moments.M"
    }
  ],
  "work-from-constant-force": [
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.work-from-constant-force.E"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.work-from-constant-force.F"
    },
    {
      "symbol": "s",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.work-from-constant-force.s"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.work-from-constant-force.θ"
    }
  ],
  "power": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.power.P"
    },
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.power.E"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.power.t"
    }
  ],
  "translational-kinetic-energy": [
    {
      "symbol": "Eₖ",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.translational-kinetic-energy.Eₖ"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.translational-kinetic-energy.m"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.translational-kinetic-energy.v"
    }
  ],
  "gravitational-potential-energy": [
    {
      "symbol": "Eₚ",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.gravitational-potential-energy.Eₚ"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.gravitational-potential-energy.m"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.gravitational-potential-energy.g"
    },
    {
      "symbol": "h",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.gravitational-potential-energy.h"
    }
  ],
  "linear-momentum": [
    {
      "symbol": "p",
      "meaning": "Momentum or impulse component",
      "unit": "N·s",
      "quantityId": "formula.linear-momentum.p"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.linear-momentum.m"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.linear-momentum.v"
    }
  ],
  "impulse": [
    {
      "symbol": "J",
      "meaning": "Momentum or impulse component",
      "unit": "N·s",
      "quantityId": "formula.impulse.J"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.impulse.F"
    },
    {
      "symbol": "Δt",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.impulse.Δt"
    },
    {
      "symbol": "Δp",
      "meaning": "Momentum or impulse component",
      "unit": "N·s",
      "quantityId": "formula.impulse.Δp"
    }
  ],
  "constant-speed-distance": [
    {
      "symbol": "s",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.constant-speed-distance.s"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.constant-speed-distance.v"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.constant-speed-distance.t"
    }
  ],
  "uniform-acceleration-velocity": [
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.uniform-acceleration-velocity.v"
    },
    {
      "symbol": "v₀",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.uniform-acceleration-velocity.v₀"
    },
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.uniform-acceleration-velocity.a"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.uniform-acceleration-velocity.t"
    }
  ],
  "uniform-acceleration-distance": [
    {
      "symbol": "s",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.uniform-acceleration-distance.s"
    },
    {
      "symbol": "v₀",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.uniform-acceleration-distance.v₀"
    },
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.uniform-acceleration-distance.a"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.uniform-acceleration-distance.t"
    }
  ],
  "velocity-squared-equation": [
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.velocity-squared-equation.v"
    },
    {
      "symbol": "v₀",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.velocity-squared-equation.v₀"
    },
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.velocity-squared-equation.a"
    },
    {
      "symbol": "s",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.velocity-squared-equation.s"
    }
  ],
  "centripetal-acceleration": [
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.centripetal-acceleration.a"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.centripetal-acceleration.v"
    },
    {
      "symbol": "r",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.centripetal-acceleration.r"
    }
  ],
  "sliding-friction-model": [
    {
      "symbol": "Ff",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.sliding-friction-model.Ff"
    },
    {
      "symbol": "μ",
      "meaning": "Sliding friction coefficient",
      "unit": "dimensionless",
      "quantityId": "formula.sliding-friction-model.μ"
    },
    {
      "symbol": "N",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.sliding-friction-model.N"
    }
  ],
  "bending-stress-simple-beam": [
    {
      "symbol": "σ",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.bending-stress-simple-beam.σ"
    },
    {
      "symbol": "M",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.bending-stress-simple-beam.M"
    },
    {
      "symbol": "y",
      "meaning": "Signed perpendicular distance from the neutral bending axis",
      "unit": "m",
      "quantityId": "formula.bending-stress-simple-beam.y"
    },
    {
      "symbol": "I",
      "meaning": "Second moment of section area about the same neutral bending axis",
      "unit": "m⁴",
      "quantityId": "formula.bending-stress-simple-beam.I"
    }
  ],
  "axial-stress": [
    {
      "symbol": "σ",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.axial-stress.σ"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.axial-stress.F"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.axial-stress.A"
    }
  ],
  "axial-strain": [
    {
      "symbol": "ε",
      "meaning": "Normal strain",
      "unit": "dimensionless",
      "quantityId": "formula.axial-strain.ε"
    },
    {
      "symbol": "ΔL",
      "meaning": "Change in length",
      "unit": "m",
      "quantityId": "formula.axial-strain.ΔL"
    },
    {
      "symbol": "L₀",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.axial-strain.L₀"
    }
  ],
  "hooke-s-law": [
    {
      "symbol": "σ",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.hooke-s-law.σ"
    },
    {
      "symbol": "E",
      "meaning": "Young modulus in linear elasticity",
      "unit": "Pa",
      "quantityId": "formula.hooke-s-law.E"
    },
    {
      "symbol": "ε",
      "meaning": "Normal strain",
      "unit": "dimensionless",
      "quantityId": "formula.hooke-s-law.ε"
    }
  ],
  "absolute-pressure": [
    {
      "symbol": "pabs",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.absolute-pressure.pabs"
    },
    {
      "symbol": "pgauge",
      "meaning": "Gauge pressure relative to local atmosphere",
      "unit": "Pa",
      "quantityId": "formula.absolute-pressure.pgauge"
    },
    {
      "symbol": "patm",
      "meaning": "Local atmospheric absolute pressure",
      "unit": "Pa",
      "quantityId": "formula.absolute-pressure.patm"
    }
  ],
  "buoyancy-force": [
    {
      "symbol": "Fᵦ",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.buoyancy-force.Fᵦ"
    },
    {
      "symbol": "ρfluid",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.buoyancy-force.ρfluid"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.buoyancy-force.g"
    },
    {
      "symbol": "Vdisplaced",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.buoyancy-force.Vdisplaced"
    }
  ],
  "hydrostatic-load-on-horizontal-surface": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.hydrostatic-load-on-horizontal-surface.F"
    },
    {
      "symbol": "p",
      "meaning": "Uniform pressure difference across the surface",
      "unit": "Pa",
      "quantityId": "formula.hydrostatic-load-on-horizontal-surface.p"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.hydrostatic-load-on-horizontal-surface.A"
    }
  ],
  "ideal-hydraulic-cylinder-force": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.ideal-hydraulic-cylinder-force.F"
    },
    {
      "symbol": "p",
      "meaning": "Pressure difference across an ideal piston of area A",
      "unit": "Pa",
      "quantityId": "formula.ideal-hydraulic-cylinder-force.p"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.ideal-hydraulic-cylinder-force.A"
    }
  ],
  "volumetric-flow": [
    {
      "symbol": "Q",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.volumetric-flow.Q"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.volumetric-flow.V"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.volumetric-flow.t"
    }
  ],
  "continuity-incompressible": [
    {
      "symbol": "A₁",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.continuity-incompressible.A₁"
    },
    {
      "symbol": "v₁",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.continuity-incompressible.v₁"
    },
    {
      "symbol": "A₂",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.continuity-incompressible.A₂"
    },
    {
      "symbol": "v₂",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.continuity-incompressible.v₂"
    }
  ],
  "flow-rate-from-area": [
    {
      "symbol": "Q",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.flow-rate-from-area.Q"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.flow-rate-from-area.A"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.flow-rate-from-area.v"
    }
  ],
  "mass-flow": [
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.mass-flow.ṁ"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.mass-flow.ρ"
    },
    {
      "symbol": "Q",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.mass-flow.Q"
    }
  ],
  "bernoulli-ideal": [
    {
      "symbol": "p",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.bernoulli-ideal.p"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.bernoulli-ideal.ρ"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.bernoulli-ideal.g"
    },
    {
      "symbol": "z",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.bernoulli-ideal.z"
    },
    {
      "symbol": "v",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.bernoulli-ideal.v"
    }
  ],
  "pump-shaft-power": [
    {
      "symbol": "Pshaft",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.pump-shaft-power.Pshaft"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.pump-shaft-power.ρ"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.pump-shaft-power.g"
    },
    {
      "symbol": "Q",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.pump-shaft-power.Q"
    },
    {
      "symbol": "H",
      "meaning": "Total hydraulic head increase across the pump",
      "unit": "m",
      "quantityId": "formula.pump-shaft-power.H"
    },
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.pump-shaft-power.η"
    }
  ],
  "darcy-weisbach-loss": [
    {
      "symbol": "hƒ",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.darcy-weisbach-loss.hƒ"
    },
    {
      "symbol": "f",
      "meaning": "Darcy friction factor; four times the Fanning factor",
      "unit": "dimensionless",
      "quantityId": "formula.darcy-weisbach-loss.f"
    },
    {
      "symbol": "L",
      "meaning": "Straight pipe length",
      "unit": "m",
      "quantityId": "formula.darcy-weisbach-loss.L"
    },
    {
      "symbol": "D",
      "meaning": "Internal pipe diameter",
      "unit": "m",
      "quantityId": "formula.darcy-weisbach-loss.D"
    },
    {
      "symbol": "v",
      "meaning": "Mean cross-sectional flow speed",
      "unit": "m/s",
      "quantityId": "formula.darcy-weisbach-loss.v"
    },
    {
      "symbol": "g",
      "meaning": "Local gravitational acceleration",
      "unit": "m/s²",
      "quantityId": "formula.darcy-weisbach-loss.g"
    }
  ],
  "reynolds-number": [
    {
      "symbol": "Re",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.reynolds-number.Re"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.reynolds-number.ρ"
    },
    {
      "symbol": "v",
      "meaning": "Mean cross-sectional flow speed",
      "unit": "m/s",
      "quantityId": "formula.reynolds-number.v"
    },
    {
      "symbol": "D",
      "meaning": "Internal pipe diameter",
      "unit": "m",
      "quantityId": "formula.reynolds-number.D"
    },
    {
      "symbol": "μ",
      "meaning": "Dynamic viscosity",
      "unit": "Pa·s",
      "quantityId": "formula.reynolds-number.μ"
    }
  ],
  "dynamic-from-kinematic-viscosity": [
    {
      "symbol": "μ",
      "meaning": "Dynamic viscosity",
      "unit": "Pa·s",
      "quantityId": "formula.dynamic-from-kinematic-viscosity.μ"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.dynamic-from-kinematic-viscosity.ρ"
    },
    {
      "symbol": "ν",
      "meaning": "Kinematic viscosity",
      "unit": "m²/s",
      "quantityId": "formula.dynamic-from-kinematic-viscosity.ν"
    }
  ],
  "gas-law-fixed-amount": [
    {
      "symbol": "p₁",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.gas-law-fixed-amount.p₁"
    },
    {
      "symbol": "V₁",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.gas-law-fixed-amount.V₁"
    },
    {
      "symbol": "T₁",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.gas-law-fixed-amount.T₁"
    },
    {
      "symbol": "p₂",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.gas-law-fixed-amount.p₂"
    },
    {
      "symbol": "V₂",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.gas-law-fixed-amount.V₂"
    },
    {
      "symbol": "T₂",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.gas-law-fixed-amount.T₂"
    }
  ],
  "boyle-s-law": [
    {
      "symbol": "p₁",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.boyle-s-law.p₁"
    },
    {
      "symbol": "V₁",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.boyle-s-law.V₁"
    },
    {
      "symbol": "p₂",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.boyle-s-law.p₂"
    },
    {
      "symbol": "V₂",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.boyle-s-law.V₂"
    }
  ],
  "ext-isothermal-gas-process": [
    {
      "symbol": "p₁",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-isothermal-gas-process.p₁"
    },
    {
      "symbol": "V₁",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-isothermal-gas-process.V₁"
    },
    {
      "symbol": "p₂",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-isothermal-gas-process.p₂"
    },
    {
      "symbol": "V₂",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-isothermal-gas-process.V₂"
    }
  ],
  "charles-law": [
    {
      "symbol": "V₁",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.charles-law.V₁"
    },
    {
      "symbol": "T₁",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.charles-law.T₁"
    },
    {
      "symbol": "V₂",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.charles-law.V₂"
    },
    {
      "symbol": "T₂",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.charles-law.T₂"
    }
  ],
  "gay-lussac-s-law": [
    {
      "symbol": "p₁",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.gay-lussac-s-law.p₁"
    },
    {
      "symbol": "T₁",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.gay-lussac-s-law.T₁"
    },
    {
      "symbol": "p₂",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.gay-lussac-s-law.p₂"
    },
    {
      "symbol": "T₂",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.gay-lussac-s-law.T₂"
    }
  ],
  "kelvin-conversion": [
    {
      "symbol": "T",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.kelvin-conversion.T"
    },
    {
      "symbol": "t",
      "meaning": "Temperature on Celsius scale",
      "unit": "°C",
      "quantityId": "formula.kelvin-conversion.t"
    }
  ],
  "celsius-from-kelvin": [
    {
      "symbol": "T",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.celsius-from-kelvin.T"
    },
    {
      "symbol": "t",
      "meaning": "Temperature on Celsius scale",
      "unit": "°C",
      "quantityId": "formula.celsius-from-kelvin.t"
    }
  ],
  "thermal-efficiency": [
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.thermal-efficiency.η"
    },
    {
      "symbol": "Wout",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.thermal-efficiency.Wout"
    },
    {
      "symbol": "Qin",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.thermal-efficiency.Qin"
    }
  ],
  "carnot-ideal-limit": [
    {
      "symbol": "ηC",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.carnot-ideal-limit.ηC"
    },
    {
      "symbol": "Tc",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.carnot-ideal-limit.Tc"
    },
    {
      "symbol": "Th",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.carnot-ideal-limit.Th"
    }
  ],
  "coefficient-of-performance": [
    {
      "symbol": "COPheating",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.coefficient-of-performance.COPheating"
    },
    {
      "symbol": "Qhot",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.coefficient-of-performance.Qhot"
    },
    {
      "symbol": "Win",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.coefficient-of-performance.Win"
    }
  ],
  "cooling-cop": [
    {
      "symbol": "COPcooling",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.cooling-cop.COPcooling"
    },
    {
      "symbol": "Qcold",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.cooling-cop.Qcold"
    },
    {
      "symbol": "Win",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.cooling-cop.Win"
    }
  ],
  "coefficient-of-thermal-expansion": [
    {
      "symbol": "ΔL",
      "meaning": "Change in length",
      "unit": "m",
      "quantityId": "formula.coefficient-of-thermal-expansion.ΔL"
    },
    {
      "symbol": "α",
      "meaning": "Linear or volumetric expansion coefficient as specified",
      "unit": "K⁻¹",
      "quantityId": "formula.coefficient-of-thermal-expansion.α"
    },
    {
      "symbol": "L₀",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.coefficient-of-thermal-expansion.L₀"
    },
    {
      "symbol": "ΔT",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.coefficient-of-thermal-expansion.ΔT"
    }
  ],
  "conduction-plane-wall": [
    {
      "symbol": "Q̇",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.conduction-plane-wall.Q̇"
    },
    {
      "symbol": "k",
      "meaning": "Thermal conductivity",
      "unit": "W/(m·K)",
      "quantityId": "formula.conduction-plane-wall.k"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.conduction-plane-wall.A"
    },
    {
      "symbol": "ΔT",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.conduction-plane-wall.ΔT"
    },
    {
      "symbol": "L",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.conduction-plane-wall.L"
    }
  ],
  "sensible-enthalpy-change": [
    {
      "symbol": "Δh",
      "meaning": "Specific enthalpy on a consistent reference basis",
      "unit": "J/kg",
      "quantityId": "formula.sensible-enthalpy-change.Δh"
    },
    {
      "symbol": "cp",
      "meaning": "Specific heat capacity on a mass basis",
      "unit": "J/(kg·K)",
      "quantityId": "formula.sensible-enthalpy-change.cp"
    },
    {
      "symbol": "ΔT",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.sensible-enthalpy-change.ΔT"
    }
  ],
  "energy-over-duration": [
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.energy-over-duration.E"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.energy-over-duration.P"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.energy-over-duration.t"
    }
  ],
  "dc-power": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.dc-power.P"
    },
    {
      "symbol": "U",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.dc-power.U"
    },
    {
      "symbol": "I",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.dc-power.I"
    }
  ],
  "joule-heat": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.joule-heat.P"
    },
    {
      "symbol": "I",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.joule-heat.I"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.joule-heat.R"
    }
  ],
  "resistors-in-series": [
    {
      "symbol": "Rtotal",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.resistors-in-series.Rtotal"
    },
    {
      "symbol": "Rᵢ",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.resistors-in-series.Rᵢ"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.resistors-in-series.i"
    }
  ],
  "resistors-in-parallel": [
    {
      "symbol": "Rtotal",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.resistors-in-parallel.Rtotal"
    },
    {
      "symbol": "Rᵢ",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.resistors-in-parallel.Rᵢ"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.resistors-in-parallel.i"
    }
  ],
  "voltage-divider": [
    {
      "symbol": "Uout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.voltage-divider.Uout"
    },
    {
      "symbol": "Uin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.voltage-divider.Uin"
    },
    {
      "symbol": "R₁",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.voltage-divider.R₁"
    },
    {
      "symbol": "R₂",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.voltage-divider.R₂"
    }
  ],
  "capacitor-energy": [
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.capacitor-energy.E"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.capacitor-energy.C"
    },
    {
      "symbol": "U",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.capacitor-energy.U"
    }
  ],
  "inductor-energy": [
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.inductor-energy.E"
    },
    {
      "symbol": "L",
      "meaning": "Inductance",
      "unit": "H",
      "quantityId": "formula.inductor-energy.L"
    },
    {
      "symbol": "I",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.inductor-energy.I"
    }
  ],
  "capacitor-charge": [
    {
      "symbol": "Q",
      "meaning": "Electric charge",
      "unit": "C",
      "quantityId": "formula.capacitor-charge.Q"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.capacitor-charge.C"
    },
    {
      "symbol": "U",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.capacitor-charge.U"
    }
  ],
  "ac-angular-frequency": [
    {
      "symbol": "ω",
      "meaning": "Angular frequency or angular speed",
      "unit": "rad/s",
      "quantityId": "formula.ac-angular-frequency.ω"
    },
    {
      "symbol": "f",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ac-angular-frequency.f"
    }
  ],
  "student-v2-angular-wave-frequency": [
    {
      "symbol": "ω",
      "meaning": "Angular frequency or angular speed",
      "unit": "rad/s",
      "quantityId": "formula.student-v2-angular-wave-frequency.ω"
    },
    {
      "symbol": "f",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.student-v2-angular-wave-frequency.f"
    }
  ],
  "capacitive-reactance": [
    {
      "symbol": "Xc",
      "meaning": "Reactance magnitude",
      "unit": "Ω",
      "quantityId": "formula.capacitive-reactance.Xc"
    },
    {
      "symbol": "f",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.capacitive-reactance.f"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.capacitive-reactance.C"
    }
  ],
  "impedance-series-rl": [
    {
      "symbol": "|Z|",
      "meaning": "Impedance magnitude",
      "unit": "Ω",
      "quantityId": "formula.impedance-series-rl.|Z|"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.impedance-series-rl.R"
    },
    {
      "symbol": "Xₗ",
      "meaning": "Reactance magnitude",
      "unit": "Ω",
      "quantityId": "formula.impedance-series-rl.Xₗ"
    }
  ],
  "power-factor": [
    {
      "symbol": "cos φ",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.power-factor.cos φ"
    },
    {
      "symbol": "φ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.power-factor.φ"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.power-factor.P"
    },
    {
      "symbol": "S",
      "meaning": "Apparent electrical power",
      "unit": "VA",
      "quantityId": "formula.power-factor.S"
    }
  ],
  "single-phase-real-power": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.single-phase-real-power.P"
    },
    {
      "symbol": "U",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.single-phase-real-power.U"
    },
    {
      "symbol": "I",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.single-phase-real-power.I"
    },
    {
      "symbol": "φ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.single-phase-real-power.φ"
    }
  ],
  "three-phase-apparent-power": [
    {
      "symbol": "S",
      "meaning": "Apparent electrical power",
      "unit": "VA",
      "quantityId": "formula.three-phase-apparent-power.S"
    },
    {
      "symbol": "Uₗ",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.three-phase-apparent-power.Uₗ"
    },
    {
      "symbol": "Iₗ",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.three-phase-apparent-power.Iₗ"
    }
  ],
  "three-phase-reactive-power": [
    {
      "symbol": "Q",
      "meaning": "Reactive electrical power",
      "unit": "var",
      "quantityId": "formula.three-phase-reactive-power.Q"
    },
    {
      "symbol": "Uₗ",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.three-phase-reactive-power.Uₗ"
    },
    {
      "symbol": "Iₗ",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.three-phase-reactive-power.Iₗ"
    },
    {
      "symbol": "φ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.three-phase-reactive-power.φ"
    }
  ],
  "star-line-voltage": [
    {
      "symbol": "Uₗ",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.star-line-voltage.Uₗ"
    },
    {
      "symbol": "Uphase",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.star-line-voltage.Uphase"
    }
  ],
  "delta-line-current": [
    {
      "symbol": "Iₗ",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.delta-line-current.Iₗ"
    },
    {
      "symbol": "Iphase",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.delta-line-current.Iphase"
    }
  ],
  "ideal-transformer-ratio": [
    {
      "symbol": "U₁",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ideal-transformer-ratio.U₁"
    },
    {
      "symbol": "U₂",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ideal-transformer-ratio.U₂"
    },
    {
      "symbol": "N₁",
      "meaning": "Number of winding turns or poles as specified",
      "unit": "dimensionless",
      "quantityId": "formula.ideal-transformer-ratio.N₁"
    },
    {
      "symbol": "N₂",
      "meaning": "Number of winding turns or poles as specified",
      "unit": "dimensionless",
      "quantityId": "formula.ideal-transformer-ratio.N₂"
    }
  ],
  "ideal-transformer-current-ratio": [
    {
      "symbol": "I₁",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.ideal-transformer-current-ratio.I₁"
    },
    {
      "symbol": "I₂",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.ideal-transformer-current-ratio.I₂"
    },
    {
      "symbol": "N₁",
      "meaning": "Number of winding turns or poles as specified",
      "unit": "dimensionless",
      "quantityId": "formula.ideal-transformer-current-ratio.N₁"
    },
    {
      "symbol": "N₂",
      "meaning": "Number of winding turns or poles as specified",
      "unit": "dimensionless",
      "quantityId": "formula.ideal-transformer-current-ratio.N₂"
    }
  ],
  "motor-synchronous-speed": [
    {
      "symbol": "nₛ",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.motor-synchronous-speed.nₛ"
    },
    {
      "symbol": "f",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.motor-synchronous-speed.f"
    },
    {
      "symbol": "p",
      "meaning": "Total number of magnetic poles (not pole pairs)",
      "unit": "dimensionless",
      "quantityId": "formula.motor-synchronous-speed.p"
    }
  ],
  "induction-motor-slip": [
    {
      "symbol": "s",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.induction-motor-slip.s"
    },
    {
      "symbol": "nₛ",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.induction-motor-slip.nₛ"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.induction-motor-slip.n"
    }
  ],
  "battery-energy-approx": [
    {
      "symbol": "E",
      "meaning": "Electrical energy",
      "unit": "Wh",
      "quantityId": "formula.battery-energy-approx.E"
    },
    {
      "symbol": "U",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.battery-energy-approx.U"
    },
    {
      "symbol": "C",
      "meaning": "Nominal electric charge capacity",
      "unit": "Ah",
      "quantityId": "formula.battery-energy-approx.C"
    }
  ],
  "battery-run-time-approx": [
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.battery-run-time-approx.t"
    },
    {
      "symbol": "Eusable",
      "meaning": "Electrical energy",
      "unit": "Wh",
      "quantityId": "formula.battery-run-time-approx.Eusable"
    },
    {
      "symbol": "Pload",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.battery-run-time-approx.Pload"
    }
  ],
  "electrical-energy": [
    {
      "symbol": "E",
      "meaning": "Electrical energy",
      "unit": "kWh",
      "quantityId": "formula.electrical-energy.E"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.electrical-energy.P"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.electrical-energy.t"
    }
  ],
  "efficiency": [
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.efficiency.η"
    },
    {
      "symbol": "Pout",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.efficiency.Pout"
    },
    {
      "symbol": "Pin",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.efficiency.Pin"
    }
  ],
  "coulomb-s-law": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.coulomb-s-law.F"
    },
    {
      "symbol": "k",
      "meaning": "Coulomb constant in the selected medium",
      "unit": "N·m²/C²",
      "quantityId": "formula.coulomb-s-law.k"
    },
    {
      "symbol": "q₁",
      "meaning": "Electric charge",
      "unit": "C",
      "quantityId": "formula.coulomb-s-law.q₁"
    },
    {
      "symbol": "q₂",
      "meaning": "Electric charge",
      "unit": "C",
      "quantityId": "formula.coulomb-s-law.q₂"
    },
    {
      "symbol": "r",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.coulomb-s-law.r"
    }
  ],
  "distance-at-steady-speed": [
    {
      "symbol": "d",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.distance-at-steady-speed.d"
    },
    {
      "symbol": "v",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.distance-at-steady-speed.v"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.distance-at-steady-speed.t"
    }
  ],
  "sea-time": [
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.sea-time.t"
    },
    {
      "symbol": "d",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.sea-time.d"
    },
    {
      "symbol": "v",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.sea-time.v"
    }
  ],
  "compass-to-true-course": [
    {
      "symbol": "TC",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.compass-to-true-course.TC"
    },
    {
      "symbol": "CC",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.compass-to-true-course.CC"
    },
    {
      "symbol": "deviation",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.compass-to-true-course.deviation"
    },
    {
      "symbol": "variation",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.compass-to-true-course.variation"
    }
  ],
  "current-drift-vector": [
    {
      "symbol": "Vground",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.current-drift-vector.Vground"
    },
    {
      "symbol": "Vthrough-water",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.current-drift-vector.Vthrough-water"
    },
    {
      "symbol": "Vcurrent",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.current-drift-vector.Vcurrent"
    }
  ],
  "latitude-difference": [
    {
      "symbol": "Δφ",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.latitude-difference.Δφ"
    },
    {
      "symbol": "φ₁",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.latitude-difference.φ₁"
    },
    {
      "symbol": "φ₂",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.latitude-difference.φ₂"
    }
  ],
  "shortest-longitude-difference": [
    {
      "symbol": "Δλ",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.shortest-longitude-difference.Δλ"
    },
    {
      "symbol": "λ₁",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.shortest-longitude-difference.λ₁"
    },
    {
      "symbol": "λ₂",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.shortest-longitude-difference.λ₂"
    }
  ],
  "plane-sailing-departure": [
    {
      "symbol": "Dep",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.plane-sailing-departure.Dep"
    },
    {
      "symbol": "ΔLon",
      "meaning": "Angular difference in arcminutes",
      "unit": "arcmin",
      "quantityId": "formula.plane-sailing-departure.ΔLon"
    },
    {
      "symbol": "mean latitude",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.plane-sailing-departure.mean latitude"
    }
  ],
  "plane-sailing-distance": [
    {
      "symbol": "d",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.plane-sailing-distance.d"
    },
    {
      "symbol": "ΔLat",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.plane-sailing-distance.ΔLat"
    },
    {
      "symbol": "Dep",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.plane-sailing-distance.Dep"
    }
  ],
  "great-circle-central-angle": [
    {
      "symbol": "σ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.great-circle-central-angle.σ"
    },
    {
      "symbol": "φ₁",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.great-circle-central-angle.φ₁"
    },
    {
      "symbol": "φ₂",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.great-circle-central-angle.φ₂"
    },
    {
      "symbol": "Δλ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.great-circle-central-angle.Δλ"
    }
  ],
  "great-circle-distance": [
    {
      "symbol": "d",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.great-circle-distance.d"
    },
    {
      "symbol": "R",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.great-circle-distance.R"
    },
    {
      "symbol": "σ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.great-circle-distance.σ"
    }
  ],
  "course-speed-through-water": [
    {
      "symbol": "STW",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.course-speed-through-water.STW"
    },
    {
      "symbol": "distance through water",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.course-speed-through-water.distance through water"
    },
    {
      "symbol": "time",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.course-speed-through-water.time"
    }
  ],
  "relative-bearing": [
    {
      "symbol": "TB",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.relative-bearing.TB"
    },
    {
      "symbol": "heading",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.relative-bearing.heading"
    },
    {
      "symbol": "RB",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.relative-bearing.RB"
    }
  ],
  "cpa-of-linear-relative-motion": [
    {
      "symbol": "tCPA",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.cpa-of-linear-relative-motion.tCPA"
    },
    {
      "symbol": "r",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.cpa-of-linear-relative-motion.r"
    },
    {
      "symbol": "vrel",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.cpa-of-linear-relative-motion.vrel"
    }
  ],
  "cpa-distance": [
    {
      "symbol": "dCPA",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.cpa-distance.dCPA"
    },
    {
      "symbol": "r",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.cpa-distance.r"
    },
    {
      "symbol": "vrel",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.cpa-distance.vrel"
    },
    {
      "symbol": "tCPA",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.cpa-distance.tCPA"
    }
  ],
  "under-keel-clearance": [
    {
      "symbol": "UKC",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.under-keel-clearance.UKC"
    },
    {
      "symbol": "chart depth",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.under-keel-clearance.chart depth"
    },
    {
      "symbol": "tide",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.under-keel-clearance.tide"
    },
    {
      "symbol": "draft",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.under-keel-clearance.draft"
    },
    {
      "symbol": "allowances",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.under-keel-clearance.allowances"
    }
  ],
  "required-average-speed": [
    {
      "symbol": "vreq",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.required-average-speed.vreq"
    },
    {
      "symbol": "distance",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.required-average-speed.distance"
    },
    {
      "symbol": "available underway hours",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.required-average-speed.available underway hours"
    }
  ],
  "rate-of-turn": [
    {
      "symbol": "ROT",
      "meaning": "Signed rate of turn",
      "unit": "°/min",
      "quantityId": "formula.rate-of-turn.ROT"
    },
    {
      "symbol": "Δheading",
      "meaning": "Angle measured clockwise from the stated datum",
      "unit": "°",
      "quantityId": "formula.rate-of-turn.Δheading"
    },
    {
      "symbol": "Δt",
      "meaning": "Time interval expressed in minutes",
      "unit": "min",
      "quantityId": "formula.rate-of-turn.Δt"
    }
  ],
  "discharging-mass-new-kg": [
    {
      "symbol": "KGnew",
      "meaning": "Vertical centre-of-gravity coordinate above the common keel datum",
      "unit": "m",
      "quantityId": "formula.discharging-mass-new-kg.KGnew"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.discharging-mass-new-kg.Δ"
    },
    {
      "symbol": "KG",
      "meaning": "Vertical centre-of-gravity coordinate above the common keel datum",
      "unit": "m",
      "quantityId": "formula.discharging-mass-new-kg.KG"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.discharging-mass-new-kg.w"
    },
    {
      "symbol": "kg",
      "meaning": "Vertical centre-of-gravity coordinate above the common keel datum",
      "unit": "m",
      "quantityId": "formula.discharging-mass-new-kg.kg"
    }
  ],
  "weight-shifting-vertically": [
    {
      "symbol": "GG₁",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.weight-shifting-vertically.GG₁"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.weight-shifting-vertically.w"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.weight-shifting-vertically.d"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.weight-shifting-vertically.Δ"
    }
  ],
  "weight-shifting-transversely": [
    {
      "symbol": "GG₁",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.weight-shifting-transversely.GG₁"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.weight-shifting-transversely.w"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.weight-shifting-transversely.d"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.weight-shifting-transversely.Δ"
    }
  ],
  "free-surface-correction": [
    {
      "symbol": "FSC",
      "meaning": "Virtual rise of centre of gravity due to free surface",
      "unit": "m",
      "quantityId": "formula.free-surface-correction.FSC"
    },
    {
      "symbol": "FSM",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.free-surface-correction.FSM"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.free-surface-correction.Δ"
    }
  ],
  "free-surface-moment-ideal": [
    {
      "symbol": "FSM",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.free-surface-moment-ideal.FSM"
    },
    {
      "symbol": "ρfluid",
      "meaning": "Mass density in metric tonnes per cubic metre",
      "unit": "t/m³",
      "quantityId": "formula.free-surface-moment-ideal.ρfluid"
    },
    {
      "symbol": "IFS",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.free-surface-moment-ideal.IFS"
    }
  ],
  "small-angle-righting-lever": [
    {
      "symbol": "GZ",
      "meaning": "Righting arm at the stated heel angle",
      "unit": "m",
      "quantityId": "formula.small-angle-righting-lever.GZ"
    },
    {
      "symbol": "GM",
      "meaning": "Metacentric height; positive for initial upright stability",
      "unit": "m",
      "quantityId": "formula.small-angle-righting-lever.GM"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.small-angle-righting-lever.θ"
    }
  ],
  "righting-moment": [
    {
      "symbol": "Mrighting",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.righting-moment.Mrighting"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.righting-moment.Δ"
    },
    {
      "symbol": "GZ",
      "meaning": "Righting arm at the stated heel angle",
      "unit": "m",
      "quantityId": "formula.righting-moment.GZ"
    }
  ],
  "statical-area-under-gz": [
    {
      "symbol": "A",
      "meaning": "Integral of righting arm over heel in radians",
      "unit": "m·rad",
      "quantityId": "formula.statical-area-under-gz.A"
    },
    {
      "symbol": "GZ",
      "meaning": "Righting arm at the stated heel angle",
      "unit": "m",
      "quantityId": "formula.statical-area-under-gz.GZ"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.statical-area-under-gz.θ"
    }
  ],
  "draft-change-from-loaded-mass": [
    {
      "symbol": "ΔT",
      "meaning": "Change of draught or trim",
      "unit": "cm",
      "quantityId": "formula.draft-change-from-loaded-mass.ΔT"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.draft-change-from-loaded-mass.w"
    },
    {
      "symbol": "TPC",
      "meaning": "Tonnes per centimetre of immersion",
      "unit": "t/cm",
      "quantityId": "formula.draft-change-from-loaded-mass.TPC"
    }
  ],
  "mct-1-cm-trim": [
    {
      "symbol": "MCT₁cm",
      "meaning": "Trimming mass moment per centimetre of trim",
      "unit": "t·m/cm",
      "quantityId": "formula.mct-1-cm-trim.MCT₁cm"
    },
    {
      "symbol": "trimming moment",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.mct-1-cm-trim.trimming moment"
    },
    {
      "symbol": "trim change",
      "meaning": "Change of draught or trim",
      "unit": "cm",
      "quantityId": "formula.mct-1-cm-trim.trim change"
    }
  ],
  "trimming-moment-from-shifted-weight": [
    {
      "symbol": "M",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.trimming-moment-from-shifted-weight.M"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.trimming-moment-from-shifted-weight.w"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.trimming-moment-from-shifted-weight.d"
    }
  ],
  "mean-draught": [
    {
      "symbol": "Tmean",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.mean-draught.Tmean"
    },
    {
      "symbol": "Tf",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.mean-draught.Tf"
    },
    {
      "symbol": "Ta",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.mean-draught.Ta"
    }
  ],
  "average-draught": [
    {
      "symbol": "Tavg",
      "meaning": "Arithmetic average of the corrected fore and aft draughts",
      "unit": "m",
      "quantityId": "formula.average-draught.Tavg"
    },
    {
      "symbol": "Tf",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.average-draught.Tf"
    },
    {
      "symbol": "Ta",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.average-draught.Ta"
    }
  ],
  "ext-mean-of-corrected-end-drafts": [
    {
      "symbol": "Tmean",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-mean-of-corrected-end-drafts.Tmean"
    },
    {
      "symbol": "Tf",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-mean-of-corrected-end-drafts.Tf"
    },
    {
      "symbol": "Ta",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-mean-of-corrected-end-drafts.Ta"
    }
  ],
  "loll-heel-small-angle-relation": [
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.loll-heel-small-angle-relation.θ"
    },
    {
      "symbol": "heeling moment",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.loll-heel-small-angle-relation.heeling moment"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.loll-heel-small-angle-relation.Δ"
    },
    {
      "symbol": "GM",
      "meaning": "Metacentric height; positive for initial upright stability",
      "unit": "m",
      "quantityId": "formula.loll-heel-small-angle-relation.GM"
    }
  ],
  "waterplane-coefficient": [
    {
      "symbol": "Cwp",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.waterplane-coefficient.Cwp"
    },
    {
      "symbol": "Aw",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.waterplane-coefficient.Aw"
    },
    {
      "symbol": "L",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.waterplane-coefficient.L"
    },
    {
      "symbol": "B",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.waterplane-coefficient.B"
    }
  ],
  "cargo-mass-from-volume": [
    {
      "symbol": "m",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.cargo-mass-from-volume.m"
    },
    {
      "symbol": "ρcargo",
      "meaning": "Mass density in metric tonnes per cubic metre",
      "unit": "t/m³",
      "quantityId": "formula.cargo-mass-from-volume.ρcargo"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.cargo-mass-from-volume.V"
    }
  ],
  "stowage-volume": [
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.stowage-volume.V"
    },
    {
      "symbol": "mass",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.stowage-volume.mass"
    },
    {
      "symbol": "stowage factor",
      "meaning": "Cargo volume per unit cargo mass",
      "unit": "m³/t",
      "quantityId": "formula.stowage-volume.stowage factor"
    }
  ],
  "cargo-capacity-theoretical": [
    {
      "symbol": "m",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.cargo-capacity-theoretical.m"
    },
    {
      "symbol": "hold volume",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.cargo-capacity-theoretical.hold volume"
    },
    {
      "symbol": "stowage factor",
      "meaning": "Cargo volume per unit cargo mass",
      "unit": "m³/t",
      "quantityId": "formula.cargo-capacity-theoretical.stowage factor"
    }
  ],
  "draft-survey-cargo-difference": [
    {
      "symbol": "cargo",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.draft-survey-cargo-difference.cargo"
    },
    {
      "symbol": "Δafter",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.draft-survey-cargo-difference.Δafter"
    },
    {
      "symbol": "Δbefore",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.draft-survey-cargo-difference.Δbefore"
    },
    {
      "symbol": "net noncargo changes",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.draft-survey-cargo-difference.net noncargo changes"
    }
  ],
  "oil-relative-density": [
    {
      "symbol": "SG",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.oil-relative-density.SG"
    },
    {
      "symbol": "ρliquid",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.oil-relative-density.ρliquid"
    },
    {
      "symbol": "ρreference",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.oil-relative-density.ρreference"
    }
  ],
  "api-gravity-60-f": [
    {
      "symbol": "API",
      "meaning": "API gravity at the specified 60 °F reference convention",
      "unit": "°API",
      "quantityId": "formula.api-gravity-60-f.API"
    },
    {
      "symbol": "SG₆₀°F",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.api-gravity-60-f.SG₆₀°F"
    }
  ],
  "ullage-vs-sounding": [
    {
      "symbol": "ullage",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ullage-vs-sounding.ullage"
    },
    {
      "symbol": "reference height",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ullage-vs-sounding.reference height"
    },
    {
      "symbol": "sounding",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ullage-vs-sounding.sounding"
    }
  ],
  "liquid-cargo-mass": [
    {
      "symbol": "m",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.liquid-cargo-mass.m"
    },
    {
      "symbol": "Vobserved",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.liquid-cargo-mass.Vobserved"
    },
    {
      "symbol": "ρobserved",
      "meaning": "Mass density in metric tonnes per cubic metre",
      "unit": "t/m³",
      "quantityId": "formula.liquid-cargo-mass.ρobserved"
    }
  ],
  "container-gross-mass": [
    {
      "symbol": "VGM",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.container-gross-mass.VGM"
    },
    {
      "symbol": "tare",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.container-gross-mass.tare"
    },
    {
      "symbol": "cargo",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.container-gross-mass.cargo"
    },
    {
      "symbol": "packing",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.container-gross-mass.packing"
    }
  ],
  "securing-load-basic-model": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.securing-load-basic-model.F"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.securing-load-basic-model.m"
    },
    {
      "symbol": "a",
      "meaning": "Acceleration",
      "unit": "m/s²",
      "quantityId": "formula.securing-load-basic-model.a"
    }
  ],
  "loading-rate": [
    {
      "symbol": "rate",
      "meaning": "Fuel mass flow rate",
      "unit": "kg/h",
      "quantityId": "formula.loading-rate.rate"
    },
    {
      "symbol": "loaded mass",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.loading-rate.loaded mass"
    },
    {
      "symbol": "elapsed time",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.loading-rate.elapsed time"
    }
  ],
  "remaining-cargo": [
    {
      "symbol": "remaining",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.remaining-cargo.remaining"
    },
    {
      "symbol": "planned",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.remaining-cargo.planned"
    },
    {
      "symbol": "loaded",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.remaining-cargo.loaded"
    }
  ],
  "water-added-removed-mass": [
    {
      "symbol": "m",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.water-added-removed-mass.m"
    },
    {
      "symbol": "ρwater",
      "meaning": "Mass density in metric tonnes per cubic metre",
      "unit": "t/m³",
      "quantityId": "formula.water-added-removed-mass.ρwater"
    },
    {
      "symbol": "ΔV",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.water-added-removed-mass.ΔV"
    }
  ],
  "daily-fuel-consumption": [
    {
      "symbol": "m",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.daily-fuel-consumption.m"
    },
    {
      "symbol": "consumption rate",
      "meaning": "Fuel consumption rate",
      "unit": "t/day",
      "quantityId": "formula.daily-fuel-consumption.consumption rate"
    },
    {
      "symbol": "days",
      "meaning": "Elapsed time",
      "unit": "day",
      "quantityId": "formula.daily-fuel-consumption.days"
    }
  ],
  "endurance-by-volume": [
    {
      "symbol": "days",
      "meaning": "Elapsed time",
      "unit": "day",
      "quantityId": "formula.endurance-by-volume.days"
    },
    {
      "symbol": "usable fuel volume",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.endurance-by-volume.usable fuel volume"
    },
    {
      "symbol": "daily volume consumption",
      "meaning": "Average volumetric fuel consumption per day",
      "unit": "m³/day",
      "quantityId": "formula.endurance-by-volume.daily volume consumption"
    }
  ],
  "mass-volume-conversion": [
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.mass-volume-conversion.m"
    },
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.mass-volume-conversion.ρ"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.mass-volume-conversion.V"
    }
  ],
  "fuel-from-energy-demand": [
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.fuel-from-energy-demand.m"
    },
    {
      "symbol": "Erequired",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.fuel-from-energy-demand.Erequired"
    },
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.fuel-from-energy-demand.η"
    },
    {
      "symbol": "LHV",
      "meaning": "Lower heating value per unit mass",
      "unit": "J/kg",
      "quantityId": "formula.fuel-from-energy-demand.LHV"
    }
  ],
  "shaft-power-from-torque": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.shaft-power-from-torque.P"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.shaft-power-from-torque.n"
    },
    {
      "symbol": "M",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.shaft-power-from-torque.M"
    }
  ],
  "brake-thermal-efficiency": [
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.brake-thermal-efficiency.η"
    },
    {
      "symbol": "Pshaft",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.brake-thermal-efficiency.Pshaft"
    },
    {
      "symbol": "ṁfuel",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.brake-thermal-efficiency.ṁfuel"
    },
    {
      "symbol": "LHV",
      "meaning": "Lower heating value per unit mass",
      "unit": "J/kg",
      "quantityId": "formula.brake-thermal-efficiency.LHV"
    }
  ],
  "propeller-advance-coefficient": [
    {
      "symbol": "J",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.propeller-advance-coefficient.J"
    },
    {
      "symbol": "VA",
      "meaning": "Axial advance speed at the propeller (not automatically ship speed)",
      "unit": "m/s",
      "quantityId": "formula.propeller-advance-coefficient.VA"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per second",
      "unit": "s⁻¹",
      "quantityId": "formula.propeller-advance-coefficient.n"
    },
    {
      "symbol": "D",
      "meaning": "Propeller diameter",
      "unit": "m",
      "quantityId": "formula.propeller-advance-coefficient.D"
    }
  ],
  "approximate-cubic-speed-power-law": [
    {
      "symbol": "P₂",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.approximate-cubic-speed-power-law.P₂"
    },
    {
      "symbol": "P₁",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.approximate-cubic-speed-power-law.P₁"
    },
    {
      "symbol": "v₂",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.approximate-cubic-speed-power-law.v₂"
    },
    {
      "symbol": "v₁",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.approximate-cubic-speed-power-law.v₁"
    }
  ],
  "pump-run-time": [
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.pump-run-time.t"
    },
    {
      "symbol": "tank volume",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.pump-run-time.tank volume"
    },
    {
      "symbol": "volumetric flow",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.pump-run-time.volumetric flow"
    }
  ],
  "engine-fuel-for-voyage": [
    {
      "symbol": "fuel",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.engine-fuel-for-voyage.fuel"
    },
    {
      "symbol": "rate/day",
      "meaning": "Fuel consumption rate",
      "unit": "t/day",
      "quantityId": "formula.engine-fuel-for-voyage.rate/day"
    },
    {
      "symbol": "distance",
      "meaning": "Nautical distance",
      "unit": "NM",
      "quantityId": "formula.engine-fuel-for-voyage.distance"
    },
    {
      "symbol": "SOG",
      "meaning": "Speed in nautical miles per hour",
      "unit": "kn",
      "quantityId": "formula.engine-fuel-for-voyage.SOG"
    }
  ],
  "co-from-fuel-mass": [
    {
      "symbol": "mCO₂",
      "meaning": "Mass of CO₂ on the stated emissions boundary",
      "unit": "kg",
      "quantityId": "formula.co-from-fuel-mass.mCO₂"
    },
    {
      "symbol": "fuel mass",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.co-from-fuel-mass.fuel mass"
    },
    {
      "symbol": "emission factor",
      "meaning": "Mass of emitted CO₂ per mass of fuel, on stated boundary",
      "unit": "kg CO₂/kg fuel",
      "quantityId": "formula.co-from-fuel-mass.emission factor"
    }
  ],
  "battery-usable-energy": [
    {
      "symbol": "Eusable",
      "meaning": "Electrical energy",
      "unit": "Wh",
      "quantityId": "formula.battery-usable-energy.Eusable"
    },
    {
      "symbol": "Enominal",
      "meaning": "Electrical energy",
      "unit": "Wh",
      "quantityId": "formula.battery-usable-energy.Enominal"
    },
    {
      "symbol": "permitted DoD",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.battery-usable-energy.permitted DoD"
    },
    {
      "symbol": "efficiency",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.battery-usable-energy.efficiency"
    }
  ],
  "electrical-autonomy": [
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "h",
      "quantityId": "formula.electrical-autonomy.t"
    },
    {
      "symbol": "Eusable",
      "meaning": "Electrical energy",
      "unit": "Wh",
      "quantityId": "formula.electrical-autonomy.Eusable"
    },
    {
      "symbol": "Pdemand",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.electrical-autonomy.Pdemand"
    }
  ],
  "generator-load-fraction": [
    {
      "symbol": "Load %",
      "meaning": "Actual load as a percentage of rated power",
      "unit": "%",
      "quantityId": "formula.generator-load-fraction.Load %"
    },
    {
      "symbol": "Pactual",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.generator-load-fraction.Pactual"
    },
    {
      "symbol": "Prated",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.generator-load-fraction.Prated"
    }
  ],
  "alternator-apparent-load": [
    {
      "symbol": "S",
      "meaning": "Apparent electrical power",
      "unit": "kVA",
      "quantityId": "formula.alternator-apparent-load.S"
    },
    {
      "symbol": "Uₗ",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.alternator-apparent-load.Uₗ"
    },
    {
      "symbol": "Iₗ",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.alternator-apparent-load.Iₗ"
    }
  ],
  "ext-complex-number-magnitude": [
    {
      "symbol": "|z|",
      "meaning": "Magnitude of complex number z = a + bi",
      "unit": "component unit",
      "quantityId": "formula.ext-complex-number-magnitude.|z|"
    },
    {
      "symbol": "a",
      "meaning": "Real component",
      "unit": "component unit",
      "quantityId": "formula.ext-complex-number-magnitude.a"
    },
    {
      "symbol": "b",
      "meaning": "Imaginary component",
      "unit": "component unit",
      "quantityId": "formula.ext-complex-number-magnitude.b"
    }
  ],
  "student-v2-complex-modulus": [
    {
      "symbol": "|a+bi|",
      "meaning": "Magnitude of complex number a + bi",
      "unit": "component unit",
      "quantityId": "formula.student-v2-complex-modulus.|a+bi|"
    },
    {
      "symbol": "a",
      "meaning": "Real component",
      "unit": "component unit",
      "quantityId": "formula.student-v2-complex-modulus.a"
    },
    {
      "symbol": "b",
      "meaning": "Imaginary component",
      "unit": "component unit",
      "quantityId": "formula.student-v2-complex-modulus.b"
    }
  ],
  "ext-binomial-probability": [
    {
      "symbol": "P(X = k)",
      "meaning": "Probability or proportion",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.P(X = k)"
    },
    {
      "symbol": "X",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.X"
    },
    {
      "symbol": "k",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.k"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.n"
    },
    {
      "symbol": "p",
      "meaning": "Probability or proportion",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.p"
    },
    {
      "symbol": "C(n,k)",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-binomial-probability.C(n,k)"
    }
  ],
  "ext-vector-cross-product-magnitude": [
    {
      "symbol": "|a×b|",
      "meaning": "Magnitude of cross product",
      "unit": "unit(a)·unit(b)",
      "quantityId": "formula.ext-vector-cross-product-magnitude.|a×b|"
    },
    {
      "symbol": "|a|",
      "meaning": "Magnitude of first vector",
      "unit": "unit(a)",
      "quantityId": "formula.ext-vector-cross-product-magnitude.|a|"
    },
    {
      "symbol": "|b|",
      "meaning": "Magnitude of second vector",
      "unit": "unit(b)",
      "quantityId": "formula.ext-vector-cross-product-magnitude.|b|"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.ext-vector-cross-product-magnitude.θ"
    }
  ],
  "ext-geometric-series-sum": [
    {
      "symbol": "Sₙ",
      "meaning": "Real algebraic value",
      "unit": "dimensionless",
      "quantityId": "formula.ext-geometric-series-sum.Sₙ"
    },
    {
      "symbol": "a",
      "meaning": "Real algebraic value",
      "unit": "dimensionless",
      "quantityId": "formula.ext-geometric-series-sum.a"
    },
    {
      "symbol": "r",
      "meaning": "Real algebraic value",
      "unit": "dimensionless",
      "quantityId": "formula.ext-geometric-series-sum.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-geometric-series-sum.n"
    }
  ],
  "ext-refractive-index": [
    {
      "symbol": "n",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-refractive-index.n"
    },
    {
      "symbol": "c",
      "meaning": "Speed of light in the stated medium",
      "unit": "m/s",
      "quantityId": "formula.ext-refractive-index.c"
    },
    {
      "symbol": "v",
      "meaning": "Speed of light in the stated medium",
      "unit": "m/s",
      "quantityId": "formula.ext-refractive-index.v"
    }
  ],
  "ext-sound-intensity-level": [
    {
      "symbol": "L",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.ext-sound-intensity-level.L"
    },
    {
      "symbol": "I",
      "meaning": "Sound intensity",
      "unit": "W/m²",
      "quantityId": "formula.ext-sound-intensity-level.I"
    },
    {
      "symbol": "I₀",
      "meaning": "Sound intensity",
      "unit": "W/m²",
      "quantityId": "formula.ext-sound-intensity-level.I₀"
    }
  ],
  "ext-frequency-from-period": [
    {
      "symbol": "f",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-frequency-from-period.f"
    },
    {
      "symbol": "T",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.ext-frequency-from-period.T"
    }
  ],
  "ext-amount-of-substance": [
    {
      "symbol": "n",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.ext-amount-of-substance.n"
    },
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.ext-amount-of-substance.m"
    },
    {
      "symbol": "M",
      "meaning": "Mass per mole; use kg with this SI basis",
      "unit": "kg/mol",
      "quantityId": "formula.ext-amount-of-substance.M"
    }
  ],
  "ext-mass-fraction": [
    {
      "symbol": "w",
      "meaning": "Probability or proportion",
      "unit": "dimensionless",
      "quantityId": "formula.ext-mass-fraction.w"
    },
    {
      "symbol": "msolute",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.ext-mass-fraction.msolute"
    },
    {
      "symbol": "msolution",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.ext-mass-fraction.msolution"
    }
  ],
  "ext-mass-percentage": [
    {
      "symbol": "w%",
      "meaning": "Solute mass expressed as numeric percent of total solution mass",
      "unit": "%",
      "quantityId": "formula.ext-mass-percentage.w%"
    },
    {
      "symbol": "msolute",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.ext-mass-percentage.msolute"
    },
    {
      "symbol": "msolution",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.ext-mass-percentage.msolution"
    }
  ],
  "ext-hydrogen-ion-activity-from-ph": [
    {
      "symbol": "aH⁺",
      "meaning": "Dimensionless hydrogen-ion activity",
      "unit": "dimensionless",
      "quantityId": "formula.ext-hydrogen-ion-activity-from-ph.aH⁺"
    },
    {
      "symbol": "pH",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-hydrogen-ion-activity-from-ph.pH"
    }
  ],
  "ext-ideal-reaction-yield": [
    {
      "symbol": "yield%",
      "meaning": "Reaction yield in numeric percent",
      "unit": "%",
      "quantityId": "formula.ext-ideal-reaction-yield.yield%"
    },
    {
      "symbol": "actual",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.ext-ideal-reaction-yield.actual"
    },
    {
      "symbol": "theoretical",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.ext-ideal-reaction-yield.theoretical"
    }
  ],
  "ext-negative-feedback-closed-loop-gain": [
    {
      "symbol": "Afb",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-negative-feedback-closed-loop-gain.Afb"
    },
    {
      "symbol": "A",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-negative-feedback-closed-loop-gain.A"
    },
    {
      "symbol": "β",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-negative-feedback-closed-loop-gain.β"
    }
  ],
  "ext-voltage-amplifier-gain": [
    {
      "symbol": "Av",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-voltage-amplifier-gain.Av"
    },
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-voltage-amplifier-gain.Vout"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-voltage-amplifier-gain.Vin"
    }
  ],
  "student-v2-voltage-gain-linear": [
    {
      "symbol": "Av",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-voltage-gain-linear.Av"
    },
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-voltage-gain-linear.Vout"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-voltage-gain-linear.Vin"
    }
  ],
  "ext-power-gain-in-decibels": [
    {
      "symbol": "GdB",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.ext-power-gain-in-decibels.GdB"
    },
    {
      "symbol": "Pout",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.ext-power-gain-in-decibels.Pout"
    },
    {
      "symbol": "Pin",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.ext-power-gain-in-decibels.Pin"
    }
  ],
  "student-v2-power-gain-in-db": [
    {
      "symbol": "GdB",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.student-v2-power-gain-in-db.GdB"
    },
    {
      "symbol": "Pout",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-power-gain-in-db.Pout"
    },
    {
      "symbol": "Pin",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-power-gain-in-db.Pin"
    }
  ],
  "ext-rc-cutoff-frequency": [
    {
      "symbol": "fc",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-rc-cutoff-frequency.fc"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-rc-cutoff-frequency.R"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.ext-rc-cutoff-frequency.C"
    }
  ],
  "student-v2-rc-low-pass-cutoff": [
    {
      "symbol": "fc",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.student-v2-rc-low-pass-cutoff.fc"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-rc-low-pass-cutoff.R"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.student-v2-rc-low-pass-cutoff.C"
    }
  ],
  "ext-rl-cutoff-frequency": [
    {
      "symbol": "fc",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-rl-cutoff-frequency.fc"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-rl-cutoff-frequency.R"
    },
    {
      "symbol": "L",
      "meaning": "Inductance",
      "unit": "H",
      "quantityId": "formula.ext-rl-cutoff-frequency.L"
    }
  ],
  "ext-bipolar-transistor-current-gain": [
    {
      "symbol": "β",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-bipolar-transistor-current-gain.β"
    },
    {
      "symbol": "Ic",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.ext-bipolar-transistor-current-gain.Ic"
    },
    {
      "symbol": "Ib",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.ext-bipolar-transistor-current-gain.Ib"
    }
  ],
  "ext-noninverting-op-amp-gain": [
    {
      "symbol": "Av",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-noninverting-op-amp-gain.Av"
    },
    {
      "symbol": "Rf",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-noninverting-op-amp-gain.Rf"
    },
    {
      "symbol": "Rg",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-noninverting-op-amp-gain.Rg"
    }
  ],
  "ext-inverting-op-amp-gain": [
    {
      "symbol": "Av",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-inverting-op-amp-gain.Av"
    },
    {
      "symbol": "Rf",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-inverting-op-amp-gain.Rf"
    },
    {
      "symbol": "Rin",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.ext-inverting-op-amp-gain.Rin"
    }
  ],
  "ext-nyquist-sampling-condition": [
    {
      "symbol": "fs",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-nyquist-sampling-condition.fs"
    },
    {
      "symbol": "fmax",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-nyquist-sampling-condition.fmax"
    }
  ],
  "student-v2-sampling-condition": [
    {
      "symbol": "fs",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.student-v2-sampling-condition.fs"
    },
    {
      "symbol": "fmax",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.student-v2-sampling-condition.fmax"
    }
  ],
  "ext-digital-data-rate": [
    {
      "symbol": "bit/s",
      "meaning": "Information transfer rate",
      "unit": "bit/s",
      "quantityId": "formula.ext-digital-data-rate.bit/s"
    },
    {
      "symbol": "bits transferred",
      "meaning": "Number of transferred bits",
      "unit": "bit",
      "quantityId": "formula.ext-digital-data-rate.bits transferred"
    },
    {
      "symbol": "seconds",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.ext-digital-data-rate.seconds"
    }
  ],
  "ext-ideal-full-wave-rectifier-average": [
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-ideal-full-wave-rectifier-average.Vdc"
    },
    {
      "symbol": "Vpeak",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-ideal-full-wave-rectifier-average.Vpeak"
    }
  ],
  "ext-ideal-half-wave-rectifier-average": [
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-ideal-half-wave-rectifier-average.Vdc"
    },
    {
      "symbol": "Vpeak",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-ideal-half-wave-rectifier-average.Vpeak"
    }
  ],
  "ext-bridge-rectifier-with-diode-drops": [
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-bridge-rectifier-with-diode-drops.Vdc"
    },
    {
      "symbol": "Vpeak",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-bridge-rectifier-with-diode-drops.Vpeak"
    },
    {
      "symbol": "Vd",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-bridge-rectifier-with-diode-drops.Vd"
    }
  ],
  "ext-dc-dc-boost-converter": [
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-dc-dc-boost-converter.Vout"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-dc-dc-boost-converter.Vin"
    },
    {
      "symbol": "D",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-dc-dc-boost-converter.D"
    }
  ],
  "student-v2-boost-converter-ideal-output": [
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-boost-converter-ideal-output.Vout"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-boost-converter-ideal-output.Vin"
    },
    {
      "symbol": "D",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-boost-converter-ideal-output.D"
    }
  ],
  "ext-pwm-average-voltage": [
    {
      "symbol": "Vavg",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-pwm-average-voltage.Vavg"
    },
    {
      "symbol": "D",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-pwm-average-voltage.D"
    },
    {
      "symbol": "Vhigh",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-pwm-average-voltage.Vhigh"
    },
    {
      "symbol": "Vlow",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.ext-pwm-average-voltage.Vlow"
    }
  ],
  "ext-ripple-voltage-capacitor-estimate": [
    {
      "symbol": "ΔV",
      "meaning": "RMS or peak-to-peak ripple voltage as explicitly stated",
      "unit": "V",
      "quantityId": "formula.ext-ripple-voltage-capacitor-estimate.ΔV"
    },
    {
      "symbol": "Iload",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.ext-ripple-voltage-capacitor-estimate.Iload"
    },
    {
      "symbol": "fripple",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.ext-ripple-voltage-capacitor-estimate.fripple"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.ext-ripple-voltage-capacitor-estimate.C"
    }
  ],
  "ext-ideal-inverter-power-balance": [
    {
      "symbol": "Pin",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.ext-ideal-inverter-power-balance.Pin"
    },
    {
      "symbol": "Pout",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.ext-ideal-inverter-power-balance.Pout"
    }
  ],
  "ext-axial-bolt-stress": [
    {
      "symbol": "σ",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.ext-axial-bolt-stress.σ"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.ext-axial-bolt-stress.F"
    },
    {
      "symbol": "Astress",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.ext-axial-bolt-stress.Astress"
    }
  ],
  "ext-bearing-stress": [
    {
      "symbol": "p",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.ext-bearing-stress.p"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.ext-bearing-stress.F"
    },
    {
      "symbol": "Aprojected",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.ext-bearing-stress.Aprojected"
    }
  ],
  "ext-shear-stress-average": [
    {
      "symbol": "τavg",
      "meaning": "Shear stress",
      "unit": "Pa",
      "quantityId": "formula.ext-shear-stress-average.τavg"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.ext-shear-stress-average.F"
    },
    {
      "symbol": "Ashear",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.ext-shear-stress-average.Ashear"
    }
  ],
  "ext-elastic-extension": [
    {
      "symbol": "ΔL",
      "meaning": "Change in length",
      "unit": "m",
      "quantityId": "formula.ext-elastic-extension.ΔL"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.ext-elastic-extension.F"
    },
    {
      "symbol": "L",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-elastic-extension.L"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.ext-elastic-extension.A"
    },
    {
      "symbol": "E",
      "meaning": "Young modulus in linear elasticity",
      "unit": "Pa",
      "quantityId": "formula.ext-elastic-extension.E"
    }
  ],
  "ext-solid-circular-torsion-stress": [
    {
      "symbol": "τmax",
      "meaning": "Shear stress",
      "unit": "Pa",
      "quantityId": "formula.ext-solid-circular-torsion-stress.τmax"
    },
    {
      "symbol": "T",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.ext-solid-circular-torsion-stress.T"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-solid-circular-torsion-stress.d"
    }
  ],
  "ext-solid-circular-shaft-polar-moment": [
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.ext-solid-circular-shaft-polar-moment.J"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-solid-circular-shaft-polar-moment.d"
    }
  ],
  "student-v2-polar-inertia-of-solid-shaft": [
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.student-v2-polar-inertia-of-solid-shaft.J"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-polar-inertia-of-solid-shaft.d"
    }
  ],
  "ext-torsional-twist": [
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.ext-torsional-twist.θ"
    },
    {
      "symbol": "T",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.ext-torsional-twist.T"
    },
    {
      "symbol": "L",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-torsional-twist.L"
    },
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.ext-torsional-twist.J"
    },
    {
      "symbol": "G",
      "meaning": "Shear modulus in linear elasticity",
      "unit": "Pa",
      "quantityId": "formula.ext-torsional-twist.G"
    }
  ],
  "ext-safety-factor": [
    {
      "symbol": "n",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-safety-factor.n"
    },
    {
      "symbol": "allowable limit",
      "meaning": "Capacity associated with the selected failure mode",
      "unit": "Pa",
      "quantityId": "formula.ext-safety-factor.allowable limit"
    },
    {
      "symbol": "applied demand",
      "meaning": "Applied stress associated with the same failure mode",
      "unit": "Pa",
      "quantityId": "formula.ext-safety-factor.applied demand"
    }
  ],
  "ext-adiabatic-ideal-gas-process": [
    {
      "symbol": "p",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-adiabatic-ideal-gas-process.p"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-adiabatic-ideal-gas-process.V"
    },
    {
      "symbol": "κ",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-adiabatic-ideal-gas-process.κ"
    }
  ],
  "ext-polytropic-process": [
    {
      "symbol": "p",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-polytropic-process.p"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-polytropic-process.V"
    },
    {
      "symbol": "n",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-polytropic-process.n"
    }
  ],
  "ext-compression-ratio": [
    {
      "symbol": "r",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.ext-compression-ratio.r"
    },
    {
      "symbol": "VBDC",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-compression-ratio.VBDC"
    },
    {
      "symbol": "VTDC",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-compression-ratio.VTDC"
    }
  ],
  "ext-piston-swept-volume": [
    {
      "symbol": "Vs",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-piston-swept-volume.Vs"
    },
    {
      "symbol": "B",
      "meaning": "Cylinder bore diameter",
      "unit": "m",
      "quantityId": "formula.ext-piston-swept-volume.B"
    },
    {
      "symbol": "S",
      "meaning": "Piston stroke length",
      "unit": "m",
      "quantityId": "formula.ext-piston-swept-volume.S"
    }
  ],
  "ext-total-swept-engine-volume": [
    {
      "symbol": "Vtotal",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.ext-total-swept-engine-volume.Vtotal"
    },
    {
      "symbol": "z",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-total-swept-engine-volume.z"
    },
    {
      "symbol": "B",
      "meaning": "Cylinder bore diameter",
      "unit": "m",
      "quantityId": "formula.ext-total-swept-engine-volume.B"
    },
    {
      "symbol": "S",
      "meaning": "Piston stroke length",
      "unit": "m",
      "quantityId": "formula.ext-total-swept-engine-volume.S"
    }
  ],
  "ext-mean-piston-speed": [
    {
      "symbol": "um",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.ext-mean-piston-speed.um"
    },
    {
      "symbol": "S",
      "meaning": "Piston stroke length",
      "unit": "m",
      "quantityId": "formula.ext-mean-piston-speed.S"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.ext-mean-piston-speed.n"
    }
  ],
  "ext-steam-quality-from-enthalpy": [
    {
      "symbol": "x",
      "meaning": "Vapour mass fraction of a saturated two-phase mixture; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.ext-steam-quality-from-enthalpy.x"
    },
    {
      "symbol": "h",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-steam-quality-from-enthalpy.h"
    },
    {
      "symbol": "hf",
      "meaning": "Saturated-liquid specific enthalpy at the same pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-steam-quality-from-enthalpy.hf"
    },
    {
      "symbol": "hfg",
      "meaning": "Vaporisation enthalpy hg − hf at the same pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-steam-quality-from-enthalpy.hfg"
    }
  ],
  "ext-enthalpy-of-superheated-steam-estimate": [
    {
      "symbol": "h₂",
      "meaning": "Specific enthalpy on a consistent reference basis",
      "unit": "J/kg",
      "quantityId": "formula.ext-enthalpy-of-superheated-steam-estimate.h₂"
    },
    {
      "symbol": "h₁",
      "meaning": "Specific enthalpy on a consistent reference basis",
      "unit": "J/kg",
      "quantityId": "formula.ext-enthalpy-of-superheated-steam-estimate.h₁"
    },
    {
      "symbol": "cp",
      "meaning": "Specific heat capacity on a mass basis",
      "unit": "J/(kg·K)",
      "quantityId": "formula.ext-enthalpy-of-superheated-steam-estimate.cp"
    },
    {
      "symbol": "ΔT",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.ext-enthalpy-of-superheated-steam-estimate.ΔT"
    }
  ],
  "ext-specific-volume-density-relation": [
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.ext-specific-volume-density-relation.ρ"
    },
    {
      "symbol": "v",
      "meaning": "Volume per unit mass",
      "unit": "m³/kg",
      "quantityId": "formula.ext-specific-volume-density-relation.v"
    }
  ],
  "student-v2-specific-volume-density": [
    {
      "symbol": "ρ",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.student-v2-specific-volume-density.ρ"
    },
    {
      "symbol": "v",
      "meaning": "Volume per unit mass",
      "unit": "m³/kg",
      "quantityId": "formula.student-v2-specific-volume-density.v"
    }
  ],
  "ext-heat-exchanger-energy-balance": [
    {
      "symbol": "Q̇",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.ext-heat-exchanger-energy-balance.Q̇"
    },
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.ext-heat-exchanger-energy-balance.ṁ"
    },
    {
      "symbol": "cp",
      "meaning": "Specific heat capacity on a mass basis",
      "unit": "J/(kg·K)",
      "quantityId": "formula.ext-heat-exchanger-energy-balance.cp"
    },
    {
      "symbol": "ΔT",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.ext-heat-exchanger-energy-balance.ΔT"
    }
  ],
  "ext-relative-humidity": [
    {
      "symbol": "φ",
      "meaning": "Probability or proportion",
      "unit": "dimensionless",
      "quantityId": "formula.ext-relative-humidity.φ"
    },
    {
      "symbol": "pv",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-relative-humidity.pv"
    },
    {
      "symbol": "psat(T)",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.ext-relative-humidity.psat(T)"
    },
    {
      "symbol": "T",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.ext-relative-humidity.T"
    }
  ],
  "ext-refrigeration-cooling-capacity": [
    {
      "symbol": "Q̇e",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.ext-refrigeration-cooling-capacity.Q̇e"
    },
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.ext-refrigeration-cooling-capacity.ṁ"
    },
    {
      "symbol": "h₁",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-refrigeration-cooling-capacity.h₁"
    },
    {
      "symbol": "h₄",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-refrigeration-cooling-capacity.h₄"
    }
  ],
  "ext-compressor-specific-work": [
    {
      "symbol": "w",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-compressor-specific-work.w"
    },
    {
      "symbol": "h₂",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-compressor-specific-work.h₂"
    },
    {
      "symbol": "h₁",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-compressor-specific-work.h₁"
    }
  ],
  "ext-refrigerant-mass-flow": [
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.ext-refrigerant-mass-flow.ṁ"
    },
    {
      "symbol": "Q̇e",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.ext-refrigerant-mass-flow.Q̇e"
    },
    {
      "symbol": "h₁",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-refrigerant-mass-flow.h₁"
    },
    {
      "symbol": "h₄",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-refrigerant-mass-flow.h₄"
    }
  ],
  "ext-volumetric-compressor-efficiency": [
    {
      "symbol": "ηv",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.ext-volumetric-compressor-efficiency.ηv"
    },
    {
      "symbol": "V̇suction",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.ext-volumetric-compressor-efficiency.V̇suction"
    },
    {
      "symbol": "V̇swept",
      "meaning": "Volumetric flow rate",
      "unit": "m³/s",
      "quantityId": "formula.ext-volumetric-compressor-efficiency.V̇swept"
    }
  ],
  "ext-heat-rejection-from-condenser": [
    {
      "symbol": "Q̇c",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.ext-heat-rejection-from-condenser.Q̇c"
    },
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.ext-heat-rejection-from-condenser.ṁ"
    },
    {
      "symbol": "h₂",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-heat-rejection-from-condenser.h₂"
    },
    {
      "symbol": "h₃",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.ext-heat-rejection-from-condenser.h₃"
    }
  ],
  "ext-net-present-value": [
    {
      "symbol": "NPV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-net-present-value.NPV"
    },
    {
      "symbol": "CFt",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-net-present-value.CFt"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.ext-net-present-value.r"
    },
    {
      "symbol": "t",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-net-present-value.t"
    },
    {
      "symbol": "I₀",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-net-present-value.I₀"
    }
  ],
  "ext-level-annuity-present-value": [
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-level-annuity-present-value.PV"
    },
    {
      "symbol": "A",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-level-annuity-present-value.A"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.ext-level-annuity-present-value.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-level-annuity-present-value.n"
    }
  ],
  "student-v2-annuity-present-value": [
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-annuity-present-value.PV"
    },
    {
      "symbol": "A",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-annuity-present-value.A"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-annuity-present-value.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-annuity-present-value.n"
    }
  ],
  "ext-level-annuity-payment": [
    {
      "symbol": "A",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-level-annuity-payment.A"
    },
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-level-annuity-payment.PV"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.ext-level-annuity-payment.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.ext-level-annuity-payment.n"
    }
  ],
  "student-v2-annuity-payment": [
    {
      "symbol": "A",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-annuity-payment.A"
    },
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-annuity-payment.PV"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-annuity-payment.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-annuity-payment.n"
    }
  ],
  "ext-simple-payback-period": [
    {
      "symbol": "T",
      "meaning": "Number or duration of years",
      "unit": "year",
      "quantityId": "formula.ext-simple-payback-period.T"
    },
    {
      "symbol": "I₀",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-simple-payback-period.I₀"
    },
    {
      "symbol": "annual net cash flow",
      "meaning": "Monetary flow per year",
      "unit": "currency/year",
      "quantityId": "formula.ext-simple-payback-period.annual net cash flow"
    }
  ],
  "ext-straight-line-depreciation": [
    {
      "symbol": "D",
      "meaning": "Monetary flow per year",
      "unit": "currency/year",
      "quantityId": "formula.ext-straight-line-depreciation.D"
    },
    {
      "symbol": "purchase price",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-straight-line-depreciation.purchase price"
    },
    {
      "symbol": "residual",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-straight-line-depreciation.residual"
    },
    {
      "symbol": "years",
      "meaning": "Number or duration of years",
      "unit": "year",
      "quantityId": "formula.ext-straight-line-depreciation.years"
    }
  ],
  "ext-break-even-quantity": [
    {
      "symbol": "QBE",
      "meaning": "Number of produced or sold units",
      "unit": "unit",
      "quantityId": "formula.ext-break-even-quantity.QBE"
    },
    {
      "symbol": "fixed cost",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.ext-break-even-quantity.fixed cost"
    },
    {
      "symbol": "unit price",
      "meaning": "Price or cost per produced unit",
      "unit": "currency/unit",
      "quantityId": "formula.ext-break-even-quantity.unit price"
    },
    {
      "symbol": "variable unit cost",
      "meaning": "Price or cost per produced unit",
      "unit": "currency/unit",
      "quantityId": "formula.ext-break-even-quantity.variable unit cost"
    }
  ],
  "ext-draft-mark-correction-linear-trim": [
    {
      "symbol": "δd",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-draft-mark-correction-linear-trim.δd"
    },
    {
      "symbol": "offset",
      "meaning": "Signed longitudinal offset from the mark to the target perpendicular",
      "unit": "m",
      "quantityId": "formula.ext-draft-mark-correction-linear-trim.offset"
    },
    {
      "symbol": "trim",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-draft-mark-correction-linear-trim.trim"
    },
    {
      "symbol": "Lpp",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-draft-mark-correction-linear-trim.Lpp"
    }
  ],
  "ext-hog-sag-first-correction-three-drafts": [
    {
      "symbol": "δT",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-hog-sag-first-correction-three-drafts.δT"
    },
    {
      "symbol": "Tf",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-hog-sag-first-correction-three-drafts.Tf"
    },
    {
      "symbol": "Ta",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-hog-sag-first-correction-three-drafts.Ta"
    },
    {
      "symbol": "Tmid",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-hog-sag-first-correction-three-drafts.Tmid"
    }
  ],
  "ext-trim-from-draft-readings": [
    {
      "symbol": "trim",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-trim-from-draft-readings.trim"
    },
    {
      "symbol": "Ta",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-trim-from-draft-readings.Ta"
    },
    {
      "symbol": "Tf",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-trim-from-draft-readings.Tf"
    }
  ],
  "ext-heel-from-shifted-transverse-weight": [
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.ext-heel-from-shifted-transverse-weight.θ"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.ext-heel-from-shifted-transverse-weight.w"
    },
    {
      "symbol": "d",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.ext-heel-from-shifted-transverse-weight.d"
    },
    {
      "symbol": "Δ",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.ext-heel-from-shifted-transverse-weight.Δ"
    },
    {
      "symbol": "GM",
      "meaning": "Metacentric height; positive for initial upright stability",
      "unit": "m",
      "quantityId": "formula.ext-heel-from-shifted-transverse-weight.GM"
    }
  ],
  "ext-free-surface-transverse-inertia-rectangle": [
    {
      "symbol": "I",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.ext-free-surface-transverse-inertia-rectangle.I"
    },
    {
      "symbol": "l",
      "meaning": "Liquid free-surface length along the roll axis",
      "unit": "m",
      "quantityId": "formula.ext-free-surface-transverse-inertia-rectangle.l"
    },
    {
      "symbol": "b",
      "meaning": "Liquid free-surface breadth perpendicular to the roll axis",
      "unit": "m",
      "quantityId": "formula.ext-free-surface-transverse-inertia-rectangle.b"
    }
  ],
  "ext-draft-survey-displacement-difference": [
    {
      "symbol": "cargo",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.ext-draft-survey-displacement-difference.cargo"
    },
    {
      "symbol": "Δfinal",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.ext-draft-survey-displacement-difference.Δfinal"
    },
    {
      "symbol": "Δinitial",
      "meaning": "Vessel displacement mass",
      "unit": "t",
      "quantityId": "formula.ext-draft-survey-displacement-difference.Δinitial"
    },
    {
      "symbol": "Δnoncargo",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.ext-draft-survey-displacement-difference.Δnoncargo"
    }
  ],
  "student-v2-atomic-mass-number": [
    {
      "symbol": "A",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-atomic-mass-number.A"
    },
    {
      "symbol": "Z",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-atomic-mass-number.Z"
    },
    {
      "symbol": "N",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-atomic-mass-number.N"
    }
  ],
  "student-v2-mass-from-moles": [
    {
      "symbol": "m",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-mass-from-moles.m"
    },
    {
      "symbol": "n",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.student-v2-mass-from-moles.n"
    },
    {
      "symbol": "M",
      "meaning": "Mass per mole; use kg with this SI basis",
      "unit": "kg/mol",
      "quantityId": "formula.student-v2-mass-from-moles.M"
    }
  ],
  "student-v2-particle-count": [
    {
      "symbol": "N",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-particle-count.N"
    },
    {
      "symbol": "n",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.student-v2-particle-count.n"
    },
    {
      "symbol": "Nₐ",
      "meaning": "Avogadro constant",
      "unit": "mol⁻¹",
      "quantityId": "formula.student-v2-particle-count.Nₐ"
    }
  ],
  "student-v2-dilution-solute-conserved": [
    {
      "symbol": "c₁",
      "meaning": "Amount concentration",
      "unit": "mol/m³",
      "quantityId": "formula.student-v2-dilution-solute-conserved.c₁"
    },
    {
      "symbol": "V₁",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.student-v2-dilution-solute-conserved.V₁"
    },
    {
      "symbol": "c₂",
      "meaning": "Amount concentration",
      "unit": "mol/m³",
      "quantityId": "formula.student-v2-dilution-solute-conserved.c₂"
    },
    {
      "symbol": "V₂",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.student-v2-dilution-solute-conserved.V₂"
    }
  ],
  "student-v2-mass-concentration": [
    {
      "symbol": "cₘ",
      "meaning": "Mass concentration",
      "unit": "kg/m³",
      "quantityId": "formula.student-v2-mass-concentration.cₘ"
    },
    {
      "symbol": "msolute",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-mass-concentration.msolute"
    },
    {
      "symbol": "Vsolution",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.student-v2-mass-concentration.Vsolution"
    }
  ],
  "student-v2-ideal-gas-mole-relation": [
    {
      "symbol": "n",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.student-v2-ideal-gas-mole-relation.n"
    },
    {
      "symbol": "p",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.student-v2-ideal-gas-mole-relation.p"
    },
    {
      "symbol": "V",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.student-v2-ideal-gas-mole-relation.V"
    },
    {
      "symbol": "R",
      "meaning": "Molar ideal-gas constant",
      "unit": "J/(mol·K)",
      "quantityId": "formula.student-v2-ideal-gas-mole-relation.R"
    },
    {
      "symbol": "T",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.student-v2-ideal-gas-mole-relation.T"
    }
  ],
  "student-v2-ph": [
    {
      "symbol": "pH",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-ph.pH"
    },
    {
      "symbol": "aH⁺",
      "meaning": "Dimensionless hydrogen-ion activity",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-ph.aH⁺"
    }
  ],
  "student-v2-poh-at-25-c": [
    {
      "symbol": "pOH",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-poh-at-25-c.pOH"
    },
    {
      "symbol": "pH",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-poh-at-25-c.pH"
    }
  ],
  "student-v2-reaction-yield": [
    {
      "symbol": "yield (%)",
      "meaning": "Reaction yield in numeric percent",
      "unit": "%",
      "quantityId": "formula.student-v2-reaction-yield.yield (%)"
    },
    {
      "symbol": "actual",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.student-v2-reaction-yield.actual"
    },
    {
      "symbol": "theoretical",
      "meaning": "Amount of substance",
      "unit": "mol",
      "quantityId": "formula.student-v2-reaction-yield.theoretical"
    }
  ],
  "student-v2-radioactive-remaining-fraction": [
    {
      "symbol": "N(t)",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-radioactive-remaining-fraction.N(t)"
    },
    {
      "symbol": "N₀",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-radioactive-remaining-fraction.N₀"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.student-v2-radioactive-remaining-fraction.t"
    },
    {
      "symbol": "T½",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.student-v2-radioactive-remaining-fraction.T½"
    }
  ],
  "student-v2-decay-constant": [
    {
      "symbol": "λ",
      "meaning": "Radioactive decay constant",
      "unit": "s⁻¹",
      "quantityId": "formula.student-v2-decay-constant.λ"
    },
    {
      "symbol": "T½",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.student-v2-decay-constant.T½"
    }
  ],
  "student-v2-mass-energy-equivalence": [
    {
      "symbol": "E",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.student-v2-mass-energy-equivalence.E"
    },
    {
      "symbol": "Δm",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-mass-energy-equivalence.Δm"
    },
    {
      "symbol": "c",
      "meaning": "Speed of light in the stated medium",
      "unit": "m/s",
      "quantityId": "formula.student-v2-mass-energy-equivalence.c"
    }
  ],
  "student-v2-diode-ideal-model": [
    {
      "symbol": "I",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-diode-ideal-model.I"
    },
    {
      "symbol": "Vd",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-diode-ideal-model.Vd"
    }
  ],
  "student-v2-ideal-bjt-current-gain": [
    {
      "symbol": "β",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-ideal-bjt-current-gain.β"
    },
    {
      "symbol": "Icollector",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-ideal-bjt-current-gain.Icollector"
    },
    {
      "symbol": "Ibase",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-ideal-bjt-current-gain.Ibase"
    }
  ],
  "student-v2-bjt-emitter-current": [
    {
      "symbol": "Iemitter",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-bjt-emitter-current.Iemitter"
    },
    {
      "symbol": "Icollector",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-bjt-emitter-current.Icollector"
    },
    {
      "symbol": "Ibase",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-bjt-emitter-current.Ibase"
    }
  ],
  "student-v2-ideal-inverting-amplifier": [
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ideal-inverting-amplifier.Vout"
    },
    {
      "symbol": "Rf",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-ideal-inverting-amplifier.Rf"
    },
    {
      "symbol": "Rin",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-ideal-inverting-amplifier.Rin"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ideal-inverting-amplifier.Vin"
    }
  ],
  "student-v2-ideal-noninverting-amplifier": [
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ideal-noninverting-amplifier.Vout"
    },
    {
      "symbol": "Rf",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-ideal-noninverting-amplifier.Rf"
    },
    {
      "symbol": "Rg",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-ideal-noninverting-amplifier.Rg"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ideal-noninverting-amplifier.Vin"
    }
  ],
  "student-v2-voltage-gain-in-db": [
    {
      "symbol": "GdB",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.student-v2-voltage-gain-in-db.GdB"
    },
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-voltage-gain-in-db.Vout"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-voltage-gain-in-db.Vin"
    }
  ],
  "student-v2-rc-time-constant": [
    {
      "symbol": "τ",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.student-v2-rc-time-constant.τ"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-rc-time-constant.R"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.student-v2-rc-time-constant.C"
    }
  ],
  "student-v2-rl-time-constant": [
    {
      "symbol": "τ",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.student-v2-rl-time-constant.τ"
    },
    {
      "symbol": "L",
      "meaning": "Inductance",
      "unit": "H",
      "quantityId": "formula.student-v2-rl-time-constant.L"
    },
    {
      "symbol": "R",
      "meaning": "Electrical resistance",
      "unit": "Ω",
      "quantityId": "formula.student-v2-rl-time-constant.R"
    }
  ],
  "student-v2-capacitor-current": [
    {
      "symbol": "i",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-capacitor-current.i"
    },
    {
      "symbol": "C",
      "meaning": "Capacitance",
      "unit": "F",
      "quantityId": "formula.student-v2-capacitor-current.C"
    },
    {
      "symbol": "v",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-capacitor-current.v"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.student-v2-capacitor-current.t"
    }
  ],
  "student-v2-inductor-voltage": [
    {
      "symbol": "v",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-inductor-voltage.v"
    },
    {
      "symbol": "L",
      "meaning": "Inductance",
      "unit": "H",
      "quantityId": "formula.student-v2-inductor-voltage.L"
    },
    {
      "symbol": "i",
      "meaning": "Electric current",
      "unit": "A",
      "quantityId": "formula.student-v2-inductor-voltage.i"
    },
    {
      "symbol": "t",
      "meaning": "Elapsed time",
      "unit": "s",
      "quantityId": "formula.student-v2-inductor-voltage.t"
    }
  ],
  "student-v2-boolean-and": [
    {
      "symbol": "Y",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-and.Y"
    },
    {
      "symbol": "A",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-and.A"
    },
    {
      "symbol": "B",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-and.B"
    }
  ],
  "student-v2-boolean-or": [
    {
      "symbol": "Y",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-or.Y"
    },
    {
      "symbol": "A",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-or.A"
    },
    {
      "symbol": "B",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-or.B"
    }
  ],
  "student-v2-boolean-not": [
    {
      "symbol": "Y",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-not.Y"
    },
    {
      "symbol": "A",
      "meaning": "Boolean logical value",
      "unit": "not applicable",
      "quantityId": "formula.student-v2-boolean-not.A"
    }
  ],
  "student-v2-binary-number-value": [
    {
      "symbol": "N",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-binary-number-value.N"
    },
    {
      "symbol": "bₖ",
      "meaning": "Binary digit at position k; 0 or 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-binary-number-value.bₖ"
    },
    {
      "symbol": "k",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-binary-number-value.k"
    }
  ],
  "student-v2-single-phase-half-wave-rectifier-average": [
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-single-phase-half-wave-rectifier-average.Vdc"
    },
    {
      "symbol": "Vm",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-single-phase-half-wave-rectifier-average.Vm"
    }
  ],
  "student-v2-single-phase-full-wave-rectifier-average": [
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-single-phase-full-wave-rectifier-average.Vdc"
    },
    {
      "symbol": "Vm",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-single-phase-full-wave-rectifier-average.Vm"
    }
  ],
  "student-v2-ac-peak-and-rms": [
    {
      "symbol": "Vm",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ac-peak-and-rms.Vm"
    },
    {
      "symbol": "Vrms",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-ac-peak-and-rms.Vrms"
    }
  ],
  "student-v2-buck-converter-ideal-output": [
    {
      "symbol": "Vout",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-buck-converter-ideal-output.Vout"
    },
    {
      "symbol": "D",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-buck-converter-ideal-output.D"
    },
    {
      "symbol": "Vin",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-buck-converter-ideal-output.Vin"
    }
  ],
  "student-v2-switching-period": [
    {
      "symbol": "T",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.student-v2-switching-period.T"
    },
    {
      "symbol": "fs",
      "meaning": "Frequency in cycles per second",
      "unit": "Hz",
      "quantityId": "formula.student-v2-switching-period.fs"
    }
  ],
  "student-v2-pwm-duty-cycle": [
    {
      "symbol": "D",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-pwm-duty-cycle.D"
    },
    {
      "symbol": "ton",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.student-v2-pwm-duty-cycle.ton"
    },
    {
      "symbol": "T",
      "meaning": "Period or interval duration",
      "unit": "s",
      "quantityId": "formula.student-v2-pwm-duty-cycle.T"
    }
  ],
  "student-v2-inverter-efficiency": [
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-inverter-efficiency.η"
    },
    {
      "symbol": "Pac,out",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-inverter-efficiency.Pac,out"
    },
    {
      "symbol": "Pdc,in",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-inverter-efficiency.Pdc,in"
    }
  ],
  "student-v2-mean-dc-ripple-ratio": [
    {
      "symbol": "r",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-mean-dc-ripple-ratio.r"
    },
    {
      "symbol": "Vripple,rms",
      "meaning": "RMS or peak-to-peak ripple voltage as explicitly stated",
      "unit": "V",
      "quantityId": "formula.student-v2-mean-dc-ripple-ratio.Vripple,rms"
    },
    {
      "symbol": "Vdc",
      "meaning": "Electrical potential difference",
      "unit": "V",
      "quantityId": "formula.student-v2-mean-dc-ripple-ratio.Vdc"
    }
  ],
  "student-v2-multicylinder-swept-volume": [
    {
      "symbol": "Vtotal",
      "meaning": "Volume",
      "unit": "m³",
      "quantityId": "formula.student-v2-multicylinder-swept-volume.Vtotal"
    },
    {
      "symbol": "z",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-multicylinder-swept-volume.z"
    },
    {
      "symbol": "D",
      "meaning": "Cylinder bore diameter",
      "unit": "m",
      "quantityId": "formula.student-v2-multicylinder-swept-volume.D"
    },
    {
      "symbol": "S",
      "meaning": "Piston stroke length",
      "unit": "m",
      "quantityId": "formula.student-v2-multicylinder-swept-volume.S"
    }
  ],
  "student-v2-four-stroke-intake-events": [
    {
      "symbol": "events/s",
      "meaning": "Rotational speed in revolutions per second",
      "unit": "s⁻¹",
      "quantityId": "formula.student-v2-four-stroke-intake-events.events/s"
    },
    {
      "symbol": "z",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-four-stroke-intake-events.z"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.student-v2-four-stroke-intake-events.n"
    }
  ],
  "student-v2-brake-mean-effective-pressure-4-stroke": [
    {
      "symbol": "BMEP",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-4-stroke.BMEP"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-4-stroke.P"
    },
    {
      "symbol": "Vd",
      "meaning": "Total swept volume over all cylinders",
      "unit": "m³",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-4-stroke.Vd"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-4-stroke.n"
    }
  ],
  "student-v2-brake-mean-effective-pressure-2-stroke": [
    {
      "symbol": "BMEP",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-2-stroke.BMEP"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-2-stroke.P"
    },
    {
      "symbol": "Vd",
      "meaning": "Total swept volume over all cylinders",
      "unit": "m³",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-2-stroke.Vd"
    },
    {
      "symbol": "n",
      "meaning": "Rotational speed in revolutions per minute",
      "unit": "rpm",
      "quantityId": "formula.student-v2-brake-mean-effective-pressure-2-stroke.n"
    }
  ],
  "student-v2-mechanical-efficiency": [
    {
      "symbol": "ηm",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-mechanical-efficiency.ηm"
    },
    {
      "symbol": "Pshaft",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-mechanical-efficiency.Pshaft"
    },
    {
      "symbol": "Pindicated",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-mechanical-efficiency.Pindicated"
    }
  ],
  "student-v2-volumetric-efficiency": [
    {
      "symbol": "ηv",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-volumetric-efficiency.ηv"
    },
    {
      "symbol": "actual intake",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-volumetric-efficiency.actual intake"
    },
    {
      "symbol": "theoretical intake",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-volumetric-efficiency.theoretical intake"
    }
  ],
  "student-v2-fuel-lower-heating-energy": [
    {
      "symbol": "Ein",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.student-v2-fuel-lower-heating-energy.Ein"
    },
    {
      "symbol": "mfuel",
      "meaning": "Mass",
      "unit": "kg",
      "quantityId": "formula.student-v2-fuel-lower-heating-energy.mfuel"
    },
    {
      "symbol": "LHV",
      "meaning": "Lower heating value per unit mass",
      "unit": "J/kg",
      "quantityId": "formula.student-v2-fuel-lower-heating-energy.LHV"
    }
  ],
  "student-v2-specific-fuel-mass-rate": [
    {
      "symbol": "ṁfuel",
      "meaning": "Fuel mass flow rate",
      "unit": "kg/h",
      "quantityId": "formula.student-v2-specific-fuel-mass-rate.ṁfuel"
    },
    {
      "symbol": "SFOC",
      "meaning": "Specific fuel mass consumption on a brake-energy basis",
      "unit": "g/kWh",
      "quantityId": "formula.student-v2-specific-fuel-mass-rate.SFOC"
    },
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.student-v2-specific-fuel-mass-rate.P"
    }
  ],
  "student-v2-wet-steam-specific-enthalpy": [
    {
      "symbol": "h",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-enthalpy.h"
    },
    {
      "symbol": "hf",
      "meaning": "Saturated-liquid specific enthalpy at mixture pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-enthalpy.hf"
    },
    {
      "symbol": "x",
      "meaning": "Vapour mass fraction of a saturated two-phase mixture; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-wet-steam-specific-enthalpy.x"
    },
    {
      "symbol": "hg",
      "meaning": "Saturated-vapour specific enthalpy at mixture pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-enthalpy.hg"
    }
  ],
  "student-v2-wet-steam-specific-volume": [
    {
      "symbol": "v",
      "meaning": "Volume per unit mass",
      "unit": "m³/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-volume.v"
    },
    {
      "symbol": "vf",
      "meaning": "Saturated-liquid specific volume at mixture pressure",
      "unit": "m³/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-volume.vf"
    },
    {
      "symbol": "x",
      "meaning": "Vapour mass fraction of a saturated two-phase mixture; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-wet-steam-specific-volume.x"
    },
    {
      "symbol": "vg",
      "meaning": "Saturated-vapour specific volume at mixture pressure",
      "unit": "m³/kg",
      "quantityId": "formula.student-v2-wet-steam-specific-volume.vg"
    }
  ],
  "student-v2-steam-dryness-fraction": [
    {
      "symbol": "x",
      "meaning": "Vapour mass fraction of a saturated two-phase mixture; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-steam-dryness-fraction.x"
    },
    {
      "symbol": "h",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-steam-dryness-fraction.h"
    },
    {
      "symbol": "hf",
      "meaning": "Saturated-liquid specific enthalpy at mixture pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-steam-dryness-fraction.hf"
    },
    {
      "symbol": "hg",
      "meaning": "Saturated-vapour specific enthalpy at mixture pressure",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-steam-dryness-fraction.hg"
    }
  ],
  "student-v2-approximate-superheat-enthalpy": [
    {
      "symbol": "h",
      "meaning": "Specific enthalpy on a consistent reference basis",
      "unit": "J/kg",
      "quantityId": "formula.student-v2-approximate-superheat-enthalpy.h"
    },
    {
      "symbol": "hg",
      "meaning": "Specific enthalpy on a consistent reference basis",
      "unit": "J/kg",
      "quantityId": "formula.student-v2-approximate-superheat-enthalpy.hg"
    },
    {
      "symbol": "cp",
      "meaning": "Specific heat capacity on a mass basis",
      "unit": "J/(kg·K)",
      "quantityId": "formula.student-v2-approximate-superheat-enthalpy.cp"
    },
    {
      "symbol": "T",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.student-v2-approximate-superheat-enthalpy.T"
    },
    {
      "symbol": "Tsat",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.student-v2-approximate-superheat-enthalpy.Tsat"
    }
  ],
  "student-v2-boiler-heat-transfer-rate": [
    {
      "symbol": "Qdot",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.student-v2-boiler-heat-transfer-rate.Qdot"
    },
    {
      "symbol": "ṁ",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.student-v2-boiler-heat-transfer-rate.ṁ"
    },
    {
      "symbol": "hout",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-boiler-heat-transfer-rate.hout"
    },
    {
      "symbol": "hin",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-boiler-heat-transfer-rate.hin"
    }
  ],
  "student-v2-turbine-specific-work-idealised": [
    {
      "symbol": "w",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-turbine-specific-work-idealised.w"
    },
    {
      "symbol": "hin",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-turbine-specific-work-idealised.hin"
    },
    {
      "symbol": "hout",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-turbine-specific-work-idealised.hout"
    }
  ],
  "student-v2-boiler-thermal-efficiency": [
    {
      "symbol": "η",
      "meaning": "Efficiency or utilisation fraction; 0 to 1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-boiler-thermal-efficiency.η"
    },
    {
      "symbol": "Quseful",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.student-v2-boiler-thermal-efficiency.Quseful"
    },
    {
      "symbol": "Qfuel",
      "meaning": "Energy transferred over the stated interval",
      "unit": "J",
      "quantityId": "formula.student-v2-boiler-thermal-efficiency.Qfuel"
    }
  ],
  "student-v2-refrigeration-effect-per-kilogram": [
    {
      "symbol": "qL",
      "meaning": "Specific enthalpy or specific work",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-refrigeration-effect-per-kilogram.qL"
    },
    {
      "symbol": "h1",
      "meaning": "Specific enthalpy at evaporator outlet / compressor inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-refrigeration-effect-per-kilogram.h1"
    },
    {
      "symbol": "h4",
      "meaning": "Specific enthalpy after the expansion valve / evaporator inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-refrigeration-effect-per-kilogram.h4"
    }
  ],
  "student-v2-cooling-coefficient-of-performance": [
    {
      "symbol": "COPc",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-cooling-coefficient-of-performance.COPc"
    },
    {
      "symbol": "h1",
      "meaning": "Specific enthalpy at evaporator outlet / compressor inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-cooling-coefficient-of-performance.h1"
    },
    {
      "symbol": "h4",
      "meaning": "Specific enthalpy after the expansion valve / evaporator inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-cooling-coefficient-of-performance.h4"
    },
    {
      "symbol": "h2",
      "meaning": "Specific enthalpy at compressor outlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-cooling-coefficient-of-performance.h2"
    }
  ],
  "student-v2-heating-coefficient-of-performance": [
    {
      "symbol": "COPh",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-heating-coefficient-of-performance.COPh"
    },
    {
      "symbol": "h2",
      "meaning": "Specific enthalpy at compressor outlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-heating-coefficient-of-performance.h2"
    },
    {
      "symbol": "h3",
      "meaning": "Specific enthalpy at condenser outlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-heating-coefficient-of-performance.h3"
    },
    {
      "symbol": "h1",
      "meaning": "Specific enthalpy at evaporator outlet / compressor inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-heating-coefficient-of-performance.h1"
    }
  ],
  "student-v2-refrigeration-capacity": [
    {
      "symbol": "QdotL",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.student-v2-refrigeration-capacity.QdotL"
    },
    {
      "symbol": "ṁref",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.student-v2-refrigeration-capacity.ṁref"
    },
    {
      "symbol": "h1",
      "meaning": "Specific enthalpy at evaporator outlet / compressor inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-refrigeration-capacity.h1"
    },
    {
      "symbol": "h4",
      "meaning": "Specific enthalpy after the expansion valve / evaporator inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-refrigeration-capacity.h4"
    }
  ],
  "student-v2-compressor-power-estimate": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "kW",
      "quantityId": "formula.student-v2-compressor-power-estimate.P"
    },
    {
      "symbol": "ṁref",
      "meaning": "Mass flow rate",
      "unit": "kg/s",
      "quantityId": "formula.student-v2-compressor-power-estimate.ṁref"
    },
    {
      "symbol": "h2",
      "meaning": "Specific enthalpy at compressor outlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-compressor-power-estimate.h2"
    },
    {
      "symbol": "h1",
      "meaning": "Specific enthalpy at evaporator outlet / compressor inlet",
      "unit": "kJ/kg",
      "quantityId": "formula.student-v2-compressor-power-estimate.h1"
    }
  ],
  "student-v2-ideal-carnot-refrigerator": [
    {
      "symbol": "COPCarnot",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-ideal-carnot-refrigerator.COPCarnot"
    },
    {
      "symbol": "TL",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.student-v2-ideal-carnot-refrigerator.TL"
    },
    {
      "symbol": "TH",
      "meaning": "Absolute thermodynamic temperature",
      "unit": "K",
      "quantityId": "formula.student-v2-ideal-carnot-refrigerator.TH"
    }
  ],
  "student-v2-log-mean-temperature-difference": [
    {
      "symbol": "LMTD",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.student-v2-log-mean-temperature-difference.LMTD"
    },
    {
      "symbol": "ΔT1",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.student-v2-log-mean-temperature-difference.ΔT1"
    },
    {
      "symbol": "ΔT2",
      "meaning": "Temperature difference (same numerical increment in K or °C)",
      "unit": "K",
      "quantityId": "formula.student-v2-log-mean-temperature-difference.ΔT2"
    }
  ],
  "student-v2-bolt-axial-tensile-stress": [
    {
      "symbol": "σ",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.student-v2-bolt-axial-tensile-stress.σ"
    },
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.student-v2-bolt-axial-tensile-stress.F"
    },
    {
      "symbol": "At",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.student-v2-bolt-axial-tensile-stress.At"
    }
  ],
  "student-v2-shaft-torsion-shear-stress": [
    {
      "symbol": "τmax",
      "meaning": "Shear stress",
      "unit": "Pa",
      "quantityId": "formula.student-v2-shaft-torsion-shear-stress.τmax"
    },
    {
      "symbol": "T",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.student-v2-shaft-torsion-shear-stress.T"
    },
    {
      "symbol": "r",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-shaft-torsion-shear-stress.r"
    },
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.student-v2-shaft-torsion-shear-stress.J"
    }
  ],
  "student-v2-polar-inertia-of-hollow-shaft": [
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.student-v2-polar-inertia-of-hollow-shaft.J"
    },
    {
      "symbol": "Do",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-polar-inertia-of-hollow-shaft.Do"
    },
    {
      "symbol": "Di",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-polar-inertia-of-hollow-shaft.Di"
    }
  ],
  "student-v2-angular-twist-of-shaft": [
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.student-v2-angular-twist-of-shaft.θ"
    },
    {
      "symbol": "T",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.student-v2-angular-twist-of-shaft.T"
    },
    {
      "symbol": "L",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-angular-twist-of-shaft.L"
    },
    {
      "symbol": "G",
      "meaning": "Shear modulus in linear elasticity",
      "unit": "Pa",
      "quantityId": "formula.student-v2-angular-twist-of-shaft.G"
    },
    {
      "symbol": "J",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.student-v2-angular-twist-of-shaft.J"
    }
  ],
  "student-v2-mechanical-advantage-ideal": [
    {
      "symbol": "MA",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-mechanical-advantage-ideal.MA"
    },
    {
      "symbol": "output force",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.student-v2-mechanical-advantage-ideal.output force"
    },
    {
      "symbol": "input force",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.student-v2-mechanical-advantage-ideal.input force"
    }
  ],
  "student-v2-factor-of-safety": [
    {
      "symbol": "FoS",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-factor-of-safety.FoS"
    },
    {
      "symbol": "allowable strength",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.student-v2-factor-of-safety.allowable strength"
    },
    {
      "symbol": "design stress",
      "meaning": "Normal stress",
      "unit": "Pa",
      "quantityId": "formula.student-v2-factor-of-safety.design stress"
    }
  ],
  "student-v2-shaft-power-transmission": [
    {
      "symbol": "P",
      "meaning": "Power or rate of energy transfer",
      "unit": "W",
      "quantityId": "formula.student-v2-shaft-power-transmission.P"
    },
    {
      "symbol": "T",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.student-v2-shaft-power-transmission.T"
    },
    {
      "symbol": "ω",
      "meaning": "Angular frequency or angular speed",
      "unit": "rad/s",
      "quantityId": "formula.student-v2-shaft-power-transmission.ω"
    }
  ],
  "student-v2-simple-interest": [
    {
      "symbol": "I",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-simple-interest.I"
    },
    {
      "symbol": "P",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-simple-interest.P"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-simple-interest.r"
    },
    {
      "symbol": "t",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-simple-interest.t"
    }
  ],
  "student-v2-future-value-compound": [
    {
      "symbol": "FV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-future-value-compound.FV"
    },
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-future-value-compound.PV"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-future-value-compound.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-future-value-compound.n"
    }
  ],
  "student-v2-present-value": [
    {
      "symbol": "PV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-present-value.PV"
    },
    {
      "symbol": "FV",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-present-value.FV"
    },
    {
      "symbol": "r",
      "meaning": "Rate per compounding period",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-present-value.r"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-present-value.n"
    }
  ],
  "student-v2-operating-cost-per-voyage": [
    {
      "symbol": "Cvoyage",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-operating-cost-per-voyage.Cvoyage"
    },
    {
      "symbol": "Cfuel",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-operating-cost-per-voyage.Cfuel"
    },
    {
      "symbol": "Cport",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-operating-cost-per-voyage.Cport"
    },
    {
      "symbol": "Ccrew",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-operating-cost-per-voyage.Ccrew"
    },
    {
      "symbol": "Cother",
      "meaning": "Monetary amount in a single stated currency",
      "unit": "currency",
      "quantityId": "formula.student-v2-operating-cost-per-voyage.Cother"
    }
  ],
  "student-v2-acoustic-intensity-level": [
    {
      "symbol": "LI",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.student-v2-acoustic-intensity-level.LI"
    },
    {
      "symbol": "I",
      "meaning": "Sound intensity",
      "unit": "W/m²",
      "quantityId": "formula.student-v2-acoustic-intensity-level.I"
    },
    {
      "symbol": "I0",
      "meaning": "Sound intensity",
      "unit": "W/m²",
      "quantityId": "formula.student-v2-acoustic-intensity-level.I0"
    }
  ],
  "student-v2-sound-pressure-level": [
    {
      "symbol": "Lp",
      "meaning": "Logarithmic level or gain",
      "unit": "dB",
      "quantityId": "formula.student-v2-sound-pressure-level.Lp"
    },
    {
      "symbol": "prms",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.student-v2-sound-pressure-level.prms"
    },
    {
      "symbol": "p0",
      "meaning": "Pressure; absolute for gas laws",
      "unit": "Pa",
      "quantityId": "formula.student-v2-sound-pressure-level.p0"
    }
  ],
  "student-v2-refraction-snell-s-law": [
    {
      "symbol": "n1",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-refraction-snell-s-law.n1"
    },
    {
      "symbol": "n2",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-refraction-snell-s-law.n2"
    },
    {
      "symbol": "θ1",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.student-v2-refraction-snell-s-law.θ1"
    },
    {
      "symbol": "θ2",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.student-v2-refraction-snell-s-law.θ2"
    }
  ],
  "student-v2-thin-lens-equation": [
    {
      "symbol": "f",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-thin-lens-equation.f"
    },
    {
      "symbol": "u",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-thin-lens-equation.u"
    },
    {
      "symbol": "v",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-thin-lens-equation.v"
    }
  ],
  "student-v2-euler-s-formula": [
    {
      "symbol": "e",
      "meaning": "Base of natural logarithms, a fixed mathematical constant",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-euler-s-formula.e"
    },
    {
      "symbol": "i",
      "meaning": "Imaginary unit with i² = −1",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-euler-s-formula.i"
    },
    {
      "symbol": "θ",
      "meaning": "Angle; radians for differentiation and integration",
      "unit": "rad",
      "quantityId": "formula.student-v2-euler-s-formula.θ"
    }
  ],
  "student-v2-population-variance": [
    {
      "symbol": "σ²",
      "meaning": "Variance in the square of the common data unit",
      "unit": "(data unit)²",
      "quantityId": "formula.student-v2-population-variance.σ²"
    },
    {
      "symbol": "xi",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.student-v2-population-variance.xi"
    },
    {
      "symbol": "μ",
      "meaning": "Input value in the common data unit",
      "unit": "data unit",
      "quantityId": "formula.student-v2-population-variance.μ"
    },
    {
      "symbol": "n",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-population-variance.n"
    },
    {
      "symbol": "i",
      "meaning": "Integer index or count",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-population-variance.i"
    }
  ],
  "student-v2-vector-magnitude-in-3d": [
    {
      "symbol": "|v|",
      "meaning": "Magnitude of a vector whose Cartesian components share a unit",
      "unit": "component unit",
      "quantityId": "formula.student-v2-vector-magnitude-in-3d.|v|"
    },
    {
      "symbol": "vx",
      "meaning": "Cartesian x component",
      "unit": "component unit",
      "quantityId": "formula.student-v2-vector-magnitude-in-3d.vx"
    },
    {
      "symbol": "vy",
      "meaning": "Cartesian y component",
      "unit": "component unit",
      "quantityId": "formula.student-v2-vector-magnitude-in-3d.vy"
    },
    {
      "symbol": "vz",
      "meaning": "Cartesian z component",
      "unit": "component unit",
      "quantityId": "formula.student-v2-vector-magnitude-in-3d.vz"
    }
  ],
  "student-v2-derivative-chain-rule": [
    {
      "symbol": "x",
      "meaning": "Independent differentiable variable",
      "unit": "unit(x)",
      "quantityId": "formula.student-v2-derivative-chain-rule.x"
    },
    {
      "symbol": "f",
      "meaning": "Outer differentiable function evaluated at g(x)",
      "unit": "unit(f)",
      "quantityId": "formula.student-v2-derivative-chain-rule.f"
    },
    {
      "symbol": "g",
      "meaning": "Inner differentiable function evaluated at x",
      "unit": "unit(g)",
      "quantityId": "formula.student-v2-derivative-chain-rule.g"
    },
    {
      "symbol": "f′",
      "meaning": "Derivative of outer function with respect to its argument",
      "unit": "unit(f)/unit(g)",
      "quantityId": "formula.student-v2-derivative-chain-rule.f′"
    },
    {
      "symbol": "g′",
      "meaning": "Derivative of inner function with respect to x",
      "unit": "unit(g)/unit(x)",
      "quantityId": "formula.student-v2-derivative-chain-rule.g′"
    }
  ],
  "student-v2-crane-overturning-moment": [
    {
      "symbol": "M",
      "meaning": "Force moment or torque about the stated axis",
      "unit": "N·m",
      "quantityId": "formula.student-v2-crane-overturning-moment.M"
    },
    {
      "symbol": "Fhorizontal",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.student-v2-crane-overturning-moment.Fhorizontal"
    },
    {
      "symbol": "lever arm",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-crane-overturning-moment.lever arm"
    }
  ],
  "student-v2-transverse-mass-moment": [
    {
      "symbol": "Mtrans",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.student-v2-transverse-mass-moment.Mtrans"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.student-v2-transverse-mass-moment.w"
    },
    {
      "symbol": "transverse distance",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-transverse-mass-moment.transverse distance"
    }
  ],
  "student-v2-longitudinal-mass-moment": [
    {
      "symbol": "Mlong",
      "meaning": "Mass moment; not an SI force torque",
      "unit": "t·m",
      "quantityId": "formula.student-v2-longitudinal-mass-moment.Mlong"
    },
    {
      "symbol": "w",
      "meaning": "Mass in metric tonnes",
      "unit": "t",
      "quantityId": "formula.student-v2-longitudinal-mass-moment.w"
    },
    {
      "symbol": "longitudinal distance",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-longitudinal-mass-moment.longitudinal distance"
    }
  ],
  "student-v2-free-surface-transverse-inertia-rectangle": [
    {
      "symbol": "I",
      "meaning": "Second moment of area about the stated axis",
      "unit": "m⁴",
      "quantityId": "formula.student-v2-free-surface-transverse-inertia-rectangle.I"
    },
    {
      "symbol": "l",
      "meaning": "Liquid free-surface length along the roll axis",
      "unit": "m",
      "quantityId": "formula.student-v2-free-surface-transverse-inertia-rectangle.l"
    },
    {
      "symbol": "b",
      "meaning": "Liquid free-surface breadth perpendicular to the roll axis",
      "unit": "m",
      "quantityId": "formula.student-v2-free-surface-transverse-inertia-rectangle.b"
    }
  ],
  "student-v2-draft-difference": [
    {
      "symbol": "trim",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-draft-difference.trim"
    },
    {
      "symbol": "Taft",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-draft-difference.Taft"
    },
    {
      "symbol": "Tfore",
      "meaning": "Length or distance",
      "unit": "m",
      "quantityId": "formula.student-v2-draft-difference.Tfore"
    }
  ],
  "student-v2-wind-force-drag-estimate": [
    {
      "symbol": "F",
      "meaning": "Force or resolved force component",
      "unit": "N",
      "quantityId": "formula.student-v2-wind-force-drag-estimate.F"
    },
    {
      "symbol": "ρair",
      "meaning": "Mass density",
      "unit": "kg/m³",
      "quantityId": "formula.student-v2-wind-force-drag-estimate.ρair"
    },
    {
      "symbol": "Cd",
      "meaning": "Dimensionless model coefficient or ratio",
      "unit": "dimensionless",
      "quantityId": "formula.student-v2-wind-force-drag-estimate.Cd"
    },
    {
      "symbol": "A",
      "meaning": "Area",
      "unit": "m²",
      "quantityId": "formula.student-v2-wind-force-drag-estimate.A"
    },
    {
      "symbol": "V",
      "meaning": "Linear velocity or speed",
      "unit": "m/s",
      "quantityId": "formula.student-v2-wind-force-drag-estimate.V"
    }
  ]
};
const known=new Set(F.map(f=>f.id));
for(const [id,symbols] of Object.entries(definitions)){
 if(!known.has(id))throw Error('Unknown symbol-definition formula '+id);
 S.details[id]={...(S.details[id]||{}),symbols,metadataStatus:'Explicit symbol definitions; full printed-source and numerical verification pending.'};
}
const corrections={"righting-moment":{"name":"Righting mass moment","formula":"Mmass = Δmass·GZ","note":"Δmass is displacement mass in tonnes, so Mmass is a mass moment in t·m. SI righting torque is 1000·g·Mmass in N·m. Use the separate SI righting-moment entry for torque.","symbols":[{"symbol":"Mmass","meaning":"Righting mass moment; not force torque","unit":"t·m"},{"symbol":"Δmass","meaning":"Vessel displacement mass","unit":"t"},{"symbol":"GZ","meaning":"Righting arm at the specified heel angle","unit":"m"}]},"loll-heel-small-angle-relation":{"name":"Static heel under an external heeling moment","note":"Positive GM, small quasi-static heel. Heeling mass moment in t·m must match Δ in t and GM in m. A force moment in N·m instead needs displacement weight in N. This is not a formula for angle of loll at negative GM."},"coulomb-s-law":{"name":"Coulomb electrostatic force magnitude","formula":"F = k|q₁q₂|/r²","note":"Point charges at rest in a homogeneous isotropic medium, r>0. This expression is the force magnitude; like charges repel and unlike charges attract."},"ext-hog-sag-first-correction-three-drafts":{"name":"Simpson-weighted draught from three corrected stations","formula":"δTmid = [(Tf+Ta)/2−Tmid]/3; Teff = Tmid+δTmid","note":"Source p.223 correction is ADDED to the corrected MIDSHIP draught, not to the fore/aft arithmetic mean. This gives Teff=(Tf+4Tmid+Ta)/6. A procedure-specific Simpson weighting, not the distinct quarter-mean (Tf+6Tmid+Ta)/8 method. Use the method matching vessel hydrostatics.","symbols":[{"symbol":"δTmid","meaning":"Signed correction to add to the midship draught","unit":"m"},{"symbol":"Tf","meaning":"Fore draught corrected to the fore perpendicular","unit":"m"},{"symbol":"Ta","meaning":"Aft draught corrected to the aft perpendicular","unit":"m"},{"symbol":"Tmid","meaning":"Midship draught corrected to the midship station","unit":"m"},{"symbol":"Teff","meaning":"Simpson-weighted effective draught in this stated approximation","unit":"m"}]},"ext-draft-mark-correction-linear-trim":{"note":"δd is ADDED to the draught at a mark. offset=x_target−x_mark with x increasing aft; trim=Ta−Tf between the perpendiculars and denominator=Lpp. If trim is still measured between uncorrected end marks, use their actual longitudinal separation instead of Lpp."},"joule-heat":{"name":"Resistive heating power","note":"Instantaneous P=I²R for a resistive element. With constant current and resistance over duration t, heat energy is I²Rt; I²R alone is power in watts."},"ext-bridge-rectifier-with-diode-drops":{"note":"Approximate average for an unsmoothed full-wave sinusoidal bridge with a resistive load, valid when peak input is large compared with two diode drops. Near threshold the shortened conduction interval must be integrated; do not use a negative predicted DC output."},"rate-of-turn":{"note":"Signed change in unwrapped heading divided by elapsed MINUTES gives degrees per minute. Do not divide a wrapped 359°→1° change as −358°; choose the actual turn direction and unwrap first."},"endurance-by-volume":{"note":"Usable volume in m³ divided by average consumption in m³/day gives days. Same usable-volume and consumption basis; constant average rate."},"student-v2-thin-lens-equation":{"note":"Thin paraxial lens with the real-is-positive convention: real object u>0, real image v>0, virtual image v<0; converging lens f>0 and diverging f<0. Do not mix with a Cartesian sign convention."},"ext-adiabatic-ideal-gas-process":{"note":"Reversible adiabatic (isentropic) process of a fixed ideal-gas mass with constant κ=cp/cv. Heat transfer equal to zero alone is insufficient for pV^κ=constant."},"student-v2-volumetric-efficiency":{"note":"Actual and theoretical intake must use the same stated mass basis and reference conditions. Depending on the chosen ambient/manifold reference, a boosted-engine volumetric-efficiency ratio can exceed 1."},"ext-level-annuity-present-value":{"note":"End-of-period payments A, constant effective rate r per matching period, integer n≥1 and r>−1. For r=0 use PV=nA; do not evaluate the displayed 0/0 form."},"ext-level-annuity-payment":{"note":"End-of-period payments A, matching effective rate and period count, n≥1 and r>−1. For r=0 use A=PV/n."},"student-v2-annuity-present-value":{"note":"Ordinary annuity with payments at period ends. n≥1 and r>−1, matching periods. At zero rate PV=nA."},"student-v2-annuity-payment":{"note":"Ordinary annuity with payments at period ends. n≥1 and r>−1, matching periods. At zero rate A=PV/n."},"ext-safety-factor":{"name":"Capacity-to-demand safety ratio","note":"Capacity and demand must describe the same failure mode, units and load basis; demand>0. This ratio is not an additional design factor if the capacity has already been reduced to an allowable stress."}};
for(const [id,patch] of Object.entries(corrections)){
 const f=F.find(f=>f.id===id);if(!f)throw Error('Unknown corrected formula '+id);
 const {symbols,...content}=patch;Object.assign(f,content);
 if(symbols)S.details[id]={...(S.details[id]||{}),symbols,metadataStatus:'Quantity and reference convention reviewed; full source/numeric audit remains separate.'};
}
for(const v of S.details['student-v2-volumetric-efficiency'].symbols)if(v.symbol==='ηv')v.meaning='Intake ratio on the stated reference basis; can exceed 1 under boost';
S.symbolCompletion20261020={records:Object.keys(definitions).length,sourceAuditComplete:false};
})();
