(function(){'use strict';window.MT_EXAMPLE_SCHEMAS={
  "lifting": {
    "title": "Heavy lift & counterballast",
    "description": "Move an existing deck load to a suspension point, then explore outreach and transverse ballast transfer.",
    "chapter": 13,
    "fields": [
      [
        "delta",
        "Displacement including load and ballast (t)",
        10000
      ],
      [
        "kg",
        "Initial KG (m)",
        7
      ],
      [
        "km",
        "Constant KM (m)",
        9
      ],
      [
        "mass",
        "Suspended mass already aboard (t)",
        200
      ],
      [
        "deck",
        "Original load VCG (m)",
        5
      ],
      [
        "hook",
        "Suspension point above keel (m)",
        25
      ],
      [
        "outreach",
        "Load TCG, starboard positive (m)",
        10
      ],
      [
        "ballast",
        "Ballast mass to transfer (t)",
        100
      ],
      [
        "from",
        "Ballast source TCG (m)",
        6
      ],
      [
        "to",
        "Ballast destination TCG (m)",
        -6
      ],
      [
        "fsm",
        "Total unchanged FSM (t·m)",
        600
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "The load is already included in displacement. Suspension raises its effective VCG to the suspension point: KG₂ = KG₁ + m(h_hook − h_deck)/Δ. Ballast moves horizontally at unchanged VCG and unchanged total FSM.",
      "TCG = [m·outreach + m_ballast(toTCG−fromTCG)]/Δ. GM = KM−KG₂−FSM/Δ. Net arm = GM sinθ−TCG cosθ; equilibrium uses tanθ = TCG/GM only for positive GM.",
      "The graph covers ±10° only. An equilibrium outside that range is explicitly not resolved by this small-angle exercise. No real KN curves, crane dynamics, wind, sea state, lifting limits or structural checks. The initial curve assumes centred cargo and ballast before transfer."
    ]
  },
  "trim": {
    "title": "Trim & draft changes",
    "description": "Load, discharge or shift a mass and compare forward and aft drafts using constant study hydrostatics.",
    "chapter": 13,
    "fields": [
      [
        "length",
        "Length between perpendiculars (m)",
        140
      ],
      [
        "lcf",
        "LCF from AP (m)",
        70
      ],
      [
        "draft",
        "Initial draft at LCF (m)",
        6
      ],
      [
        "initialTrim",
        "Initial trim, aft minus forward (m)",
        0
      ],
      [
        "mass",
        "Mass (t)",
        500
      ],
      [
        "xFrom",
        "Shift source LCG from AP (m)",
        40
      ],
      [
        "xTo",
        "Cargo / shift destination LCG from AP (m)",
        100
      ],
      [
        "tpc",
        "Constant TPC (t/cm)",
        30
      ],
      [
        "mct",
        "Constant MCT 1 cm (t·m/cm)",
        150
      ],
      [
        "operation",
        "Operation",
        "load",
        [
          [
            "load",
            "Load"
          ],
          [
            "discharge",
            "Discharge"
          ],
          [
            "shift",
            "Shift aboard"
          ]
        ]
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "TPC, MCT 1 cm and LCF remain constant. Positive trim means aft draft exceeds forward draft. Longitudinal coordinates increase from AP towards FP.",
      "For loading/discharge: δT = signed mass / TPC / 100 metres; trimming moment = signed mass·(LCF−cargo LCG). For shifting: moment = mass·(source LCG−destination LCG), with zero sinkage. Δtrim in metres = moment / MCT 1 cm / 100.",
      "Draft(x) = draft_at_LCF + trim·(LCF−x)/LBP. The initial draft input is at LCF, not automatically mean draft. Source LCG is used for shifts only. No density correction, hog/sag, draft-mark offsets, changing hydrostatics, load-line or strength checks."
    ]
  },
  "tank": {
    "title": "Tank filling & free surface",
    "description": "Add liquid to an ideal rectangular tank. Compare changes in weight, KG and free-surface correction, with isolated longitudinal compartments.",
    "chapter": 13,
    "fields": [
      [
        "delta",
        "Displacement before filling (t)",
        10000
      ],
      [
        "kg",
        "KG before filling (m)",
        7
      ],
      [
        "km",
        "Constant KM (m)",
        9
      ],
      [
        "length",
        "Tank length (m)",
        12
      ],
      [
        "breadth",
        "Total tank breadth (m)",
        8
      ],
      [
        "height",
        "Tank height (m)",
        6
      ],
      [
        "bottom",
        "Tank bottom above keel (m)",
        0.5
      ],
      [
        "density",
        "Liquid density (t/m³)",
        1.025
      ],
      [
        "fill",
        "Fill (%)",
        50
      ],
      [
        "divisions",
        "Equal isolated longitudinal compartments",
        1
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "m = ρLBHf; liquid VCG = tank bottom + Hf/2. New KG follows the vertical moment balance including the added liquid. KM is deliberately held constant while displacement changes.",
      "For 0 < fill < 100%, FSM = ρLB³/(12n²) for n equal, isolated longitudinal compartments. FSC = FSM/new displacement; GM = KM−KG−FSC. All compartments fill equally.",
      "An ideal empty or pressed-full tank has zero FSM; the abrupt endpoints of this rectangular upright approximation are intentional. For a slack rectangular tank, FSM is independent of depth in this approximation. No cross-connections, sloshing, tank shape corrections or finite-angle free-surface calculation."
    ]
  },
  "pump": {
    "title": "Pump & system curves",
    "description": "Move the operating point by changing speed, static head and pipe resistance. Compare flow, head and estimated shaft input.",
    "chapter": 10,
    "fields": [
      [
        "h0",
        "Reference pump shutoff head (m)",
        40
      ],
      [
        "a",
        "Pump curve coefficient (m / (m³/h)²)",
        0.004
      ],
      [
        "staticHead",
        "System static head (m)",
        10
      ],
      [
        "k",
        "System resistance coefficient (m / (m³/h)²)",
        0.002
      ],
      [
        "speed",
        "Speed / reference speed",
        1
      ],
      [
        "efficiency",
        "Constant pump efficiency (0–1)",
        0.7
      ],
      [
        "density",
        "Liquid density (t/m³)",
        1.025
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "Reference pump H = H₀−aQ². At speed ratio r, affinity scaling gives H_pump(Q) = H₀r²−aQ². System H = H_static+kQ²; Q is in m³/h.",
      "When H₀r² > H_static, Q = √[(H₀r²−H_static)/(a+k)]. Otherwise there is no positive steady-flow intersection. Power = ρg(Q/3600)H/η; density in t/m³ gives power in kW. Zero delivered flow gives zero hydraulic estimate, not zero actual motor input.",
      "Constant efficiency, incompressible liquid and ideal quadratic curves. No NPSH/cavitation, motor efficiency, minimum flow, unstable operation, parallel pumps or impeller trimming. Source for the general curve/affinity method: DOE Fundamentals Handbook, Thermodynamics, Heat Transfer and Fluid Flow, Volume 3."
    ]
  },
  "crank": {
    "title": "Crankshaft deflection workshop",
    "description": "Enter five illustrative readings, estimate the inaccessible bottom position and compare vertical and horizontal differences.",
    "chapter": 3,
    "fields": [
      [
        "b1",
        "Near-bottom reading B1 (µm)",
        -5
      ],
      [
        "b2",
        "Near-bottom reading B2 (µm)",
        -7
      ],
      [
        "top",
        "Top reading T (µm)",
        12
      ],
      [
        "port",
        "Port reading P (µm)",
        3
      ],
      [
        "starboard",
        "Starboard reading S (µm)",
        2
      ],
      [
        "reference",
        "Illustrative comparison reference (µm)",
        20
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "Based on the measurement topic in the uploaded Arbeidskrav 2 VDL.docx and EKSAMEN(2).docx. The numeric readings and comparison level are invented. Bottom estimate B = (B1+B2)/2; vertical difference = T−B; horizontal difference = P−S.",
      "Opening is positive; closing is negative. Graph positions are illustrative: B1 at 15°, S at 90°, T at 180°, P at 270°, B2 at 345°. The joining lines are not a measured continuous trace.",
      "The residual (T+B)−(P+S) is shown as a harmonic consistency observation, not a manufacturer acceptance criterion. Actual instrument position, crank geometry, temperature, load condition and maker sign convention govern real measurements. The example reference is not an engine service limit."
    ]
  },
  "faults": {
    "title": "Cooling-system fault tree",
    "description": "Change six observations and follow a transparent example decision tree. Review every flagged observation, including simultaneous faults.",
    "chapter": 10,
    "fields": [
      [
        "running",
        "Pump reported running",
        "yes",
        [
          [
            "yes",
            "Yes"
          ],
          [
            "no",
            "No"
          ]
        ]
      ],
      [
        "valve",
        "Required valve reported open",
        "yes",
        [
          [
            "yes",
            "Yes"
          ],
          [
            "no",
            "No"
          ]
        ]
      ],
      [
        "suction",
        "Suction pressure, gauge (bar)",
        0.8
      ],
      [
        "filter",
        "Filter differential pressure (bar)",
        0.2
      ],
      [
        "flow",
        "Measured cooling flow (m³/h)",
        50
      ],
      [
        "temperature",
        "Outlet temperature (°C)",
        80
      ]
    ],
    "notes": [
      "Invented teaching inputs. Change values to explore cause and effect. No connection to a vessel, plant or control system.",
      "Adapted from the cooling and fault-tree topics in the uploaded maintenance assignments; the branches and thresholds below are invented for training.",
      "Decision order: pump status → valve lineup → suction pressure below 0.3 bar gauge → filter differential above 0.5 bar → flow below 30 m³/h → outlet temperature above 85°C. The first flagged branch is highlighted, while every flagged observation remains in the table/results.",
      "The graph is a binary attention flag (0 or 1) for each numbered observation; it does not plot pressures, temperatures or probabilities on one scale. Multiple flags can coexist.",
      "This is a transparent example reasoning aid, not an automatic diagnosis or an instruction to operate machinery. Measurement quality, sensor faults and causes outside these six observations require separate reasoning."
    ]
  }
};for(const s of Object.values(window.MT_EXAMPLE_SCHEMAS))s.present=z=>z;})();
