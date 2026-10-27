/* Steam h–s lab using the locally bundled IF97 adapter.
   Unsupported Region 3 and failed solver loading do not produce approximate states. */
(function () {
  "use strict";
  const lo = 0.01,
    hi = 160;
  const if97 = window.MT_IF97?.ready ? window.MT_IF97 : null;
  const finite = Number.isFinite,
    clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function saturation(p) {
    if (!if97)
      throw RangeError(
        "IF97 engine unavailable. Reload online to restore the local solver.",
      );
    return if97.saturation(p);
  }
  function at(p, x) {
    if (!finite(x) || x < 0 || x > 1)
      throw RangeError("Quality must be from 0 to 1.");
    const z = saturation(p);
    return {
      ...z,
      x,
      h: z.hf + x * (z.hg - z.hf),
      s: z.sf + x * (z.sg - z.sf),
      phase: "wet",
      source:
        z.source ||
        (z.interpolated ? "Reference interpolation" : "Reference anchor"),
    };
  }
  function isentropicWetState(inlet, targetP) {
    if (!inlet || !finite(inlet.s))
      throw TypeError("An inlet state with finite entropy is required.");
    const q = saturation(targetP),
      delta = q.sg - q.sf;
    if (delta <= 1e-10)
      throw RangeError(
        "A two-phase quality cannot be determined at the critical limit.",
      );
    const x = (inlet.s - q.sf) / delta;
    if (x < 0 || x > 1)
      throw RangeError(
        "Isentropic endpoint is outside the saturated mixture domain. Use a validated IF97 single-phase solver.",
      );
    return at(targetP, x);
  }
  const fromSlider = (v) => lo * Math.pow(hi / lo, clamp(v, 0, 1000) / 1000);
  const toSlider = (p) => (1000 * Math.log(p / lo)) / Math.log(hi / lo);
  const f = (v, n = 2) =>
    Number(v).toLocaleString("en-GB", {
      minimumFractionDigits: n,
      maximumFractionDigits: n,
    });
  function superheated(p, tC) {
    if (!if97) throw RangeError("IF97 engine is not ready.");
    return { ...if97.superheated(p, tC), interpolated: false };
  }
  window.MT_MOLLIER_MODEL = {
    limits: {
      minPressure: lo,
      maxWetPressure: hi,
      maxSuperheatedPressure: 160,
      maxTemperature: 600,
    },
    saturation,
    stateAt: at,
    superheated,
    pressureFromSlider: fromSlider,
    sliderFromPressure: toSlider,
    isentropicWetState,
    statePS: if97?.statePS,
    statePH: if97?.statePH,
    expansion: if97?.expansion,
    chartLimits: { maxEntropy: 12, maxEnthalpy: 4200 },
    if97Ready: !!if97,
  };
  if (typeof document === "undefined") return;
  const $ = (id) => document.getElementById(id),
    svg = $("hs-chart");
  if (!svg) return;
  if ("serviceWorker" in navigator)
    navigator.serviceWorker
      .register("../sw.js", { scope: "../" })
      .catch(() => {});
  if (!if97) {
    $("model-status").textContent =
      "IF97 engine unavailable. Reload online to restore the local solver; no state values are calculated.";
    for (const id of [
      "phase-mode",
      "pressure",
      "pressure-number",
      "quality",
      "superheat-temp",
      "save-a",
      "save-b",
      "isentropic",
      "export",
      "reset",
      "export-report",
      "export-graph",
      "export-scenario",
      "mollier-scenario",
      "quality-number",
      "process-mode",
      "process-efficiency",
      "solve-process",
    ]) {
      if ($(id)) $(id).disabled = true;
    }
    return;
  }
  const NS = "http://www.w3.org/2000/svg",
    W = 980,
    H = 580,
    left = 86,
    right = 37,
    top = 28,
    bottom = 66,
    pw = W - left - right,
    ph = H - top - bottom;
  const X = (s) => left + (pw * s) / 12,
    Y = (h) => top + ph * (1 - h / 4200);
  const states = { a: at(10, 1), b: at(1, 0.84) };
  let active = "a",
    lastProcess = null;
  const signature = () =>
    JSON.stringify([
      states.a.p,
      states.a.h,
      states.a.s,
      states.b.p,
      states.b.h,
      states.b.s,
    ]);
  const steamLines = if97
    ? (() => {
        const isobars = [],
          isotherms = [];
        for (const p of [0.1, 0.5, 1, 2, 5, 10, 20, 40, 80, 100, 160]) {
          let sat;
          try {
            sat = if97.saturation(p);
          } catch {
            continue;
          }
          const states = [];
          for (let k = 0; k <= 26; k++) {
            const T = sat.T + 1 + ((600 - sat.T - 1) * k) / 26;
            if (T <= sat.T + 0.5) continue;
            try {
              states.push(if97.superheated(p, T));
            } catch {}
          }
          if (states.length >= 2) isobars.push(states);
        }
        for (const T of [200, 300, 400, 500, 600]) {
          const states = [];
          for (let k = 0; k <= 52; k++) {
            const p = 0.01 * Math.pow(16000, k / 52);
            try {
              states.push(if97.superheated(p, T));
            } catch {}
          }
          if (states.length >= 2) isotherms.push(states);
        }
        return { isobars, isotherms };
      })()
    : { isobars: [], isotherms: [] };
  function element(tag, props = {}, content) {
    const n = document.createElementNS(NS, tag);
    Object.entries(props).forEach(([k, v]) => n.setAttribute(k, String(v)));
    if (content !== undefined) n.textContent = content;
    svg.appendChild(n);
    return n;
  }
  function poly(pts, cls) {
    return element("path", {
      d: pts
        .map(
          (p, i) => (i ? "L" : "M") + p[0].toFixed(2) + "," + p[1].toFixed(2),
        )
        .join(" "),
      class: cls,
    });
  }
  function draw() {
    while (
      svg.lastChild &&
      svg.lastChild.tagName !== "desc" &&
      svg.lastChild.tagName !== "title"
    )
      svg.removeChild(svg.lastChild);
    for (let s = 0; s <= 12; s++) {
      element("line", {
        x1: X(s),
        x2: X(s),
        y1: top,
        y2: H - bottom,
        class: "gridline",
      });
      element(
        "text",
        { x: X(s), y: H - bottom + 27, "text-anchor": "middle", class: "tick" },
        String(s),
      );
    }
    for (let h = 0; h <= 4000; h += 500) {
      element("line", {
        x1: left,
        x2: W - right,
        y1: Y(h),
        y2: Y(h),
        class: "gridline",
      });
      element(
        "text",
        { x: left - 11, y: Y(h) + 4, "text-anchor": "end", class: "tick" },
        String(h),
      );
    }
    element(
      "text",
      {
        x: (W + left - right) / 2,
        y: H - 8,
        "text-anchor": "middle",
        class: "axis",
      },
      "Specific entropy, s   kJ/(kg·K)",
    );
    element(
      "text",
      {
        transform: "translate(23 " + (top + ph / 2) + ") rotate(-90)",
        "text-anchor": "middle",
        class: "axis",
      },
      "Specific enthalpy, h   kJ/kg",
    );
    for (const curve of steamLines.isobars) {
      const pts = curve
        .filter((z) => z.h >= 0 && z.h <= 4200 && z.s >= 0 && z.s <= 12)
        .map((z) => [X(z.s), Y(z.h)]);
      if (pts.length >= 2) poly(pts, "super-isobar");
    }
    for (const curve of steamLines.isotherms) {
      const pts = curve
        .filter((z) => z.h >= 0 && z.h <= 4200 && z.s >= 0 && z.s <= 12)
        .map((z) => [X(z.s), Y(z.h)]);
      if (pts.length >= 2) poly(pts, "super-isotherm");
    }
    const sample = Array.from({ length: 130 }, (_, i) =>
      saturation(lo * Math.pow(hi / lo, i / 129)),
    );
    const liquid = sample.map((z) => [X(z.sf), Y(z.hf)]),
      vapour = sample.map((z) => [X(z.sg), Y(z.hg)]);
    poly(liquid.concat([...vapour].reverse()), "wet-area");
    for (let quality = 0.2; quality < 1; quality += 0.2)
      poly(
        sample.map((z) => [
          X(z.sf + quality * (z.sg - z.sf)),
          Y(z.hf + quality * (z.hg - z.hf)),
        ]),
        "quality-path",
      );
    poly(liquid, "liquid-path");
    poly(vapour, "vapour-path");
    for (const p of [0.1, 1, 10, 100]) {
      const z = saturation(p);
      poly(
        [
          [X(z.sf), Y(z.hf)],
          [X(z.sg), Y(z.hg)],
        ],
        "isobar",
      );
      element(
        "text",
        { x: X(z.sg) + 8, y: Y(z.hg) - 4, class: "pressure-label" },
        p + " bar",
      );
    }
    element("text", { x: X(4.5), y: Y(1910), class: "region" }, "WET STEAM");
    element("text", { x: X(9), y: Y(3100), class: "region" }, "SUPERHEATED");
    element("text", { x: X(0.3), y: Y(1800), class: "region" }, "LIQUID");
    element(
      "text",
      {
        x: X(4.4),
        y: Y(1570),
        class: "pressure-label",
        "text-anchor": "middle",
      },
      "Saturation curve stops at 160 bar(a); Region 3 omitted",
    );
    if (lastProcess?.path?.length)
      poly(
        lastProcess.path.map((z) => [X(z.s), Y(z.h)]),
        "process",
      );
    else
      poly(
        [
          [X(states.a.s), Y(states.a.h)],
          [X(states.b.s), Y(states.b.h)],
        ],
        "process",
      );
    for (const id of ["a", "b"]) {
      const z = states[id],
        x = X(z.s),
        y = Y(z.h);
      element("circle", { cx: x, cy: y, r: 12, class: "halo-" + id });
      element("circle", { cx: x, cy: y, r: 6, class: "mark-" + id });
      element(
        "text",
        { x: x + 12, y: y - 25, class: "point-label" },
        id.toUpperCase(),
      );
    }
  }
  function update() {
    if (lastProcess && lastProcess.signature !== signature())
      lastProcess = null;
    const z = states[active];
    $("phase-mode").value = z.phase || "wet";
    $("quality-field").hidden = z.phase === "superheated";
    $("superheat-field").hidden = z.phase !== "superheated";
    $("superheat-temp").value =
      z.phase === "superheated" ? Number(z.T.toFixed(2)) : 250;
    $("phase-mode").disabled = !if97;
    $("model-status").textContent =
      "IAPWS-IF97 Regions 1/2/4: wet steam 0.01–160 bar(a); superheated 0.01–160 bar(a), up to 600 °C. Region 3 and the critical point are not plotted.";
    $("pressure-number").max = hi;
    $("pressure").max = toSlider(hi);
    $("pressure-limits").textContent = "0.01–" + hi + " bar(a)";
    $("pressure").value = toSlider(z.p);
    $("pressure-number").value = Number(z.p.toPrecision(6));
    $("quality").value =
      z.phase === "superheated" ? 100 : Math.round(z.x * 100);
    $("pressure-display").textContent = f(z.p, 3) + " bar(a)";
    $("quality-number").value =
      z.phase === "superheated" ? "" : Number(z.x.toPrecision(10));
    $("quality-display").textContent =
      z.phase === "superheated" ? "n/a" : f(z.x * 100, 0) + "%";
    $("t-sat").textContent = f(z.T, 1) + " °C";
    $("h-state").textContent = f(z.h, 1) + " kJ/kg";
    $("s-state").textContent = f(z.s, 3) + " kJ/(kg·K)";
    $("x-state").textContent =
      z.phase === "superheated" ? "Not defined" : f(z.x, 3);
    for (const id of ["a", "b"]) {
      const q = states[id];
      $("state-" + id + "-details").textContent =
        "p = " +
        f(q.p, 3) +
        " bar(a) · T = " +
        f(q.T, 1) +
        " °C · " +
        (q.phase === "superheated" ? "superheated" : "x = " + f(q.x, 2)) +
        " · h = " +
        f(q.h, 1) +
        " kJ/kg · s = " +
        f(q.s, 3) +
        " kJ/(kg·K)";
    }
    $("process-result").textContent = lastProcess
      ? lastProcess.mode === "throttle"
        ? "Isenthalpic throttle: h is constant; no shaft work. Entropy increases for the supported pressure drop."
        : "Adiabatic turbine: specific work out = " +
          f(lastProcess.work, 3) +
          " kJ/kg. " +
          (lastProcess.mode === "isentropic"
            ? "The plotted path has constant entropy."
            : "η_is = " +
              f(lastProcess.efficiency, 3) +
              ". The connector joins endpoints; the irreversible path is not solved.")
      : "Endpoint comparison: no thermodynamic process has been solved.";
    $("state-delta").textContent =
      "hA − hB = " +
      f(states.a.h - states.b.h, 1) +
      " kJ/kg; sB − sA = " +
      f(states.b.s - states.a.s, 3) +
      " kJ/(kg·K).";
    $("chart-description").textContent =
      "Editing state " +
      active.toUpperCase() +
      ": " +
      f(z.p, 3) +
      " bar(a), " +
      (z.phase === "superheated"
        ? "T = " + f(z.T, 1) + " °C (superheated)"
        : "x = " + f(z.x, 2)) +
      ". " +
      (z.source || "reference") +
      ".";
    draw();
  }
  function fail(message) {
    $("input-error").hidden = !message;
    $("input-error").textContent = message;
  }
  function set(p, x) {
    try {
      states[active] =
        states[active].phase === "superheated"
          ? superheated(p, states[active].T)
          : at(p, x);
      fail("");
      update();
    } catch (e) {
      fail(e.message);
    }
  }
  function setTemp(temp) {
    try {
      states[active] = superheated(states[active].p, temp);
      fail("");
      update();
    } catch (e) {
      fail(e.message);
    }
  }
  $("phase-mode").addEventListener("change", (e) => {
    const before = states[active];
    try {
      states[active] =
        e.target.value === "superheated"
          ? superheated(before.p, Math.max(200, saturation(before.p).T + 10))
          : at(before.p, 1);
      fail("");
      update();
    } catch (err) {
      $("phase-mode").value = before.phase || "wet";
      fail(err.message);
    }
  });
  $("superheat-temp").addEventListener("change", (e) => {
    const T = Number(e.target.value);
    if (e.target.value.trim() === "" || !finite(T)) {
      fail("Enter a valid temperature.");
      return;
    }
    setTemp(T);
  });

  $("active-state").addEventListener("change", (e) => {
    active = e.target.value;
    fail("");
    update();
  });
  $("pressure").addEventListener("input", (e) =>
    set(fromSlider(Number(e.target.value)), states[active].x),
  );
  $("pressure-number").addEventListener("change", (e) => {
    const p = Number(e.target.value);
    if (e.target.value.trim() === "" || !finite(p) || p < lo || p > hi)
      fail("Enter 0.01–160 bar absolute (superheated: up to 160 bar).");
    else set(p, states[active].x);
  });
  $("quality").addEventListener("input", (e) =>
    set(states[active].p, Number(e.target.value) / 100),
  );
  $("quality-number").addEventListener("change", (e) => {
    const x = Number(e.target.value);
    if (e.target.value.trim() === "" || !finite(x) || x < 0 || x > 1) {
      fail("Enter a vapour mass fraction from 0 to 1.");
      return;
    }
    set(states[active].p, x);
  });
  $("save-a").addEventListener("click", () => {
    states.a = { ...states[active] };
    active = "a";
    $("active-state").value = active;
    update();
  });
  $("save-b").addEventListener("click", () => {
    states.b = { ...states[active] };
    active = "b";
    $("active-state").value = active;
    update();
  });
  $("reset").addEventListener("click", () => {
    states.a = at(10, 1);
    states.b = at(1, 0.84);
    active = "a";
    $("active-state").value = active;
    fail("");
    update();
  });
  function solveProcess(mode) {
    try {
      const efficiency = Number($("process-efficiency").value);
      if (mode === "turbine" && $("process-efficiency").value.trim() === "")
        throw RangeError("Enter an isentropic efficiency.");
      const result = if97.expansion(states.a, states.b.p, mode, efficiency);
      states.b = result.outlet;
      active = "b";
      $("active-state").value = "b";
      lastProcess = { ...result, signature: signature() };
      $("process-mode").value = mode;
      $("process-efficiency-field").hidden = mode !== "turbine";
      fail("");
      update();
    } catch (e) {
      fail(e.message);
    }
  }
  $("isentropic").addEventListener("click", () => solveProcess("isentropic"));
  $("solve-process").addEventListener("click", () =>
    solveProcess($("process-mode").value),
  );
  $("process-mode").addEventListener("change", () => {
    $("process-efficiency-field").hidden =
      $("process-mode").value !== "turbine";
  });
  svg.addEventListener("click", (event) => {
    const rect = svg.getBoundingClientRect(),
      scale = Math.min(rect.width / W, rect.height / H);
    const px =
        (event.clientX - rect.left - (rect.width - W * scale) / 2) / scale,
      py = (event.clientY - rect.top - (rect.height - H * scale) / 2) / scale;
    if (px < left || px > W - right || py < top || py > H - bottom) {
      fail("Select within the plot.");
      return;
    }
    let closest = { d: Infinity, p: 1, x: 1 };
    for (let i = 0; i < 130; i++) {
      const p = lo * Math.pow(hi / lo, i / 129),
        q = saturation(p);
      for (let j = 0; j <= 30; j++) {
        const x = j / 30,
          ss = q.sf + x * (q.sg - q.sf),
          hh = q.hf + x * (q.hg - q.hf),
          d = Math.hypot(px - X(ss), py - Y(hh));
        if (d < closest.d) closest = { p, x, d };
      }
    }
    if (closest.d > 34) {
      fail(
        "Click near the two-phase saturation dome, or enter pressure and temperature for superheated steam.",
      );
      return;
    }
    // Chart picking represents a saturated mixture, irrespective of the previous mode.
    try {
      states[active] = at(closest.p, closest.x);
      fail("");
      update();
    } catch (error) {
      fail(error.message);
    }
  });
  $("export").addEventListener("click", () => {
    try {
      const E = window.MT_STUDY_EXPORT,
        s = studySnapshot();
      E.download(
        "marine-tools-mollier-states.csv",
        E.csv(s.tables[0].rows),
        "text/csv;charset=utf-8",
      );
    } catch (e) {
      if ($("report-feedback")) $("report-feedback").textContent = e.message;
    }
  });
  function studySnapshot() {
    if (!$("input-error").hidden)
      throw RangeError("Correct the current state inputs before exporting.");
    const E = window.MT_STUDY_EXPORT,
      labels = ["a", "b"],
      inputs = {},
      results = {};
    for (const id of labels) {
      const z = states[id];
      inputs["State " + id.toUpperCase() + " · pressure (bar absolute)"] = z.p;
      inputs["State " + id.toUpperCase() + " · phase"] = z.phase;
      inputs[
        "State " +
          id.toUpperCase() +
          " · " +
          (z.phase === "superheated"
            ? "temperature (°C)"
            : "vapour mass fraction")
      ] = z.phase === "superheated" ? z.T : z.x;
      results["State " + id.toUpperCase() + " · h (kJ/kg)"] = z.h;
      results["State " + id.toUpperCase() + " · s (kJ/kg/K)"] = z.s;
      results["State " + id.toUpperCase() + " · T (°C)"] = z.T;
    }
    results["h_A − h_B (kJ/kg)"] = states.a.h - states.b.h;
    results["s_B − s_A (kJ/kg/K)"] = states.b.s - states.a.s;
    return {
      model: "mollier-if97",
      title: "Mollier steam state comparison",
      inputs,
      results,
      notes: [
        lastProcess
          ? "Solved model: " +
            lastProcess.mode +
            "; specific shaft work out = " +
            lastProcess.work +
            " kJ/kg. " +
            (lastProcess.mode === "turbine"
              ? "Only endpoints are solved for the irreversible turbine; no internal path is inferred."
              : "Intermediate states satisfy the selected constant-h or constant-s condition.")
          : "No process solved: A and B are independent endpoints.",
        "Local IAPWS-IF97 adapter, saturation 0.01–160 bar(a); superheated Region 2: 0.01–160 bar(a), T above saturation through 600 °C. Subcooled water, Region 3 and the critical point are omitted.",
        "A straight line joining A and B is a comparison connector. A solved reversible isentrope or ideal throttle uses intermediate IF97 states; an irreversible turbine remains endpoint-only.",
        "For a steady adiabatic turbine with negligible kinetic/potential-energy change, h_A−h_B is specific shaft work out. The constant-entropy solution is the ideal reversible limit; an ideal throttle has zero shaft work and constant enthalpy.",
        "Quality is vapour MASS fraction in two-phase equilibrium. Superheated steam has no two-phase quality.",
      ],
      charts: [
        {
          svg: E.svgSnapshot(svg),
          caption: lastProcess?.path?.length
            ? "IF97 process states along a " +
              lastProcess.mode +
              " pressure reduction."
            : "Enthalpy h (kJ/kg) against entropy s (kJ/kg/K); endpoint connector is not a process path.",
        },
      ],
      tables: [
        {
          title: "State properties",
          rows: [
            [
              "State",
              "p (bar abs)",
              "T (°C)",
              "Phase",
              "Quality",
              "h (kJ/kg)",
              "s (kJ/kg/K)",
            ],
            ...labels.map((id) => {
              const z = states[id];
              return [id.toUpperCase(), z.p, z.T, z.phase, z.x ?? "", z.h, z.s];
            }),
          ],
        },
      ],
    };
  }
  for (const [id, kind] of [
    ["export-report", "html"],
    ["export-graph", "svg"],
  ])
    $(id)?.addEventListener("click", () => {
      try {
        const E = window.MT_STUDY_EXPORT,
          s = studySnapshot();
        E.download(
          "marine-tools-mollier." + kind,
          kind === "html" ? E.report(s) : s.charts[0].svg,
          kind === "html"
            ? "text/html;charset=utf-8"
            : "image/svg+xml;charset=utf-8",
        );
        $("report-feedback").textContent =
          "Export prepared from the current valid states.";
      } catch (e) {
        $("report-feedback").textContent = e.message;
      }
    });
  function scenarioInputs() {
    const out = {};
    for (const id of ["a", "b"]) {
      const z = states[id];
      out[id] =
        z.phase === "superheated"
          ? { phase: "superheated", p: z.p, T: z.T }
          : { phase: "wet", p: z.p, x: z.x };
    }
    if (lastProcess)
      out.process = {
        mode: lastProcess.mode,
        efficiency: lastProcess.efficiency ?? 1,
      };
    return out;
  }
  function restoreScenario(text) {
    const raw = JSON.parse(text),
      fields =
        raw.inputs && Object.hasOwn(raw.inputs, "process")
          ? ["a", "b", "process"]
          : ["a", "b"];
    const data = window.MT_STUDY_EXPORT.parseScenario(
        text,
        "mollier-if97",
        fields,
      ),
      next = {};
    for (const id of ["a", "b"]) {
      const z = data[id];
      if (
        !z ||
        typeof z !== "object" ||
        !["wet", "superheated"].includes(z.phase) ||
        Object.keys(z).length !== 3 ||
        !Object.hasOwn(z, "p") ||
        !Object.hasOwn(z, z.phase === "wet" ? "x" : "T")
      )
        throw TypeError("Invalid state inputs in scenario.");
      next[id] = z.phase === "wet" ? at(z.p, z.x) : superheated(z.p, z.T);
    }
    let process = null;
    if (Object.hasOwn(data, "process")) {
      const q = data.process;
      if (
        !q ||
        typeof q !== "object" ||
        Array.isArray(q) ||
        Object.keys(q).length !== 2 ||
        !Object.hasOwn(q, "mode") ||
        !Object.hasOwn(q, "efficiency")
      )
        throw TypeError("Invalid process fields.");
      process = if97.expansion(next.a, next.b.p, q.mode, q.efficiency);
      if (
        Math.abs(process.outlet.h - next.b.h) > 1e-6 ||
        Math.abs(process.outlet.s - next.b.s) > 1e-8
      )
        throw RangeError("Stored states do not match the selected process.");
      next.b = process.outlet;
    }
    states.a = next.a;
    states.b = next.b;
    lastProcess = process ? { ...process, signature: signature() } : null;
    if (process) {
      $("process-mode").value = process.mode;
      $("process-efficiency").value = process.efficiency ?? 1;
      $("process-efficiency-field").hidden = process.mode !== "turbine";
    }
    fail("");
    update();
  }
  $("export-scenario")?.addEventListener("click", () => {
    try {
      studySnapshot();
      const E = window.MT_STUDY_EXPORT;
      E.download(
        "marine-tools-mollier-scenario.json",
        E.scenario("mollier-if97", scenarioInputs()),
        "application/json",
      );
    } catch (e) {
      $("report-feedback").textContent = e.message;
    }
  });
  $("mollier-scenario")?.addEventListener("change", async (e) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        restoreScenario(await file.text());
        $("report-feedback").textContent =
          "Both states restored and recalculated with the local IF97 solver.";
      }
    } catch (err) {
      $("report-feedback").textContent = err.message;
    }
    e.target.value = "";
  });
  window.MT_MOLLIER_RESTORE = restoreScenario;
  window.MT_MOLLIER_INPUTS = scenarioInputs;
  window.MT_MOLLIER_SNAPSHOT = studySnapshot;
  update();
})();
