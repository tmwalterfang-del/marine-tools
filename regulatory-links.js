/* Product entry points. A route transfers only after an explicit user action. */
(function () {
  "use strict";
  const definitions = [
    {
      page: "fuel",
      hash: "nox",
      title: [
        "NOx emissions & Norwegian charges",
        "NOx-utslipp og norske avgifter",
      ],
      text: [
        "Measured, fuel-based and energy-based calculations with documented factors and separate tax assessment.",
        "Målte, drivstoffbaserte og energibaserte beregninger med dokumenterte faktorer og separat avgiftsvurdering.",
      ],
    },
    {
      page: "navigation",
      hash: "voyage",
      title: [
        "Environmental areas & voyage analysis",
        "Miljøområder og reiseanalyser",
      ],
      text: [
        "Explore dated regulatory layers and inspect the requirements along an editable voyage route.",
        "Utforsk datostyrte regelverkslag og undersøk krav langs en redigerbar reiserute.",
      ],
    },
    {
      page: "profile",
      hash: "profile",
      title: ["Environmental vessel configuration", "Fartøyets miljøoppsett"],
      text: [
        "Engine factors, certification and vessel information for emissions and voyage analysis.",
        "Motorfaktorer, sertifisering og fartøyopplysninger for utslipp og reiseanalyser.",
      ],
    },
    {
      page: "voyage-estimate",
      hash: "voyage",
      title: [
        "Analyze the last calculated route",
        "Analyser den sist beregnede ruten",
      ],
      text: [
        "Transfer the calculated route geometry to the environmental planner and verify all waypoints before use.",
        "Overfør beregnet rutegeometri til miljøplanleggeren og kontroller alle veipunkter før bruk.",
      ],
      transfer: true,
    },
  ];
  let queued = false;
  function render() {
    queued = false;
    const nb = /^(nb|nn|no)/i.test(document.documentElement.lang),
      index = nb ? 1 : 0;
    for (const def of definitions) {
      const host = document.getElementById(def.page);
      if (!host?.querySelector(".page-title")) continue;
      let panel = host.querySelector("[data-regulatory-entry]");
      if (!panel) {
        panel = document.createElement("article");
        panel.className = "panel";
        panel.dataset.regulatoryEntry = "";
        panel.style.margin = "1rem 0";
        const body = document.createElement("div");
        body.className = "panel-body";
        const heading = document.createElement("h3"),
          copy = document.createElement("p"),
          link = document.createElement("a");
        link.className = "btn";
        link.href = "regulatory.html#" + def.hash;
        body.append(heading, copy, link);
        panel.append(body);
        host
          .querySelector(".page-title")
          .insertAdjacentElement("afterend", panel);
        if (def.transfer)
          link.onclick = (event) => {
            try {
              const plan =
                window.__marineToolsVoyageEstimate?.exportRegulatoryRoute?.();
              if (!plan) throw Error("missing");
              sessionStorage.setItem(
                "mt.regulatory.route-transfer.v1",
                JSON.stringify({ ...plan, transferredAt: Date.now() }),
              );
            } catch {
              event.preventDefault();
              const message = /^(nb|nn|no)/i.test(document.documentElement.lang)
                ? "Beregn en rute i Reiseestimat før du overfører den."
                : "Calculate a route in Voyage Estimate before transferring it.";
              let note = panel.querySelector("[role=status]");
              if (!note) {
                note = document.createElement("p");
                note.setAttribute("role", "status");
                body.append(note);
              }
              note.textContent = message;
            }
          };
      }
      for (const [selector, text] of [
        ["h3", def.title[index]],
        ["p", def.text[index]],
        ["a", nb ? "Åpne verktøyet" : "Open tool"],
      ]) {
        const el = panel.querySelector(selector);
        if (el.textContent !== text) el.textContent = text;
      }
    }
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(render);
    }
  }
  const start = () => {
    new MutationObserver(schedule).observe(
      document.querySelector("main") || document.body,
      { childList: true, subtree: true },
    );
    new MutationObserver(schedule).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    render();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
