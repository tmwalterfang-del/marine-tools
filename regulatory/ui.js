(async function () {
  "use strict";
  const $ = (s) => document.querySelector(s),
    $$ = (s) => Array.from(document.querySelectorAll(s)),
    P = window.MT_REGULATORY_PROFILE,
    N = window.MT_NOX,
    R = window.MT_REGULATORY_RULES,
    IO = window.MT_ROUTE_IO;
  const words = {
    back: ["Back to tools", "Tilbake til verktøy"],
    language: ["Language", "Språk"],
    environment: ["ENVIRONMENTAL PLANNING", "MILJØPLANLEGGING"],
    title: [
      "Emissions, areas & voyage planning",
      "Utslipp, områder og reiseplanlegging",
    ],
    intro: [
      "Calculate emissions from documented inputs and inspect environmental requirements along a planned voyage.",
      "Beregn utslipp fra dokumenterte inndata og undersøk miljøkrav langs en planlagt reise.",
    ],
    nox: ["NOx & Norwegian charges", "NOx og norske avgifter"],
    voyage: ["Regulatory map & voyage", "Regelverkskart og reise"],
    profile: ["Vessel & certification", "Fartøy og sertifikater"],
    sources: ["Sources & coverage", "Kilder og dekning"],
    limits: [
      "Planning reference only. A plotted route is not an approved passage plan, and these results do not certify compliance.",
      "Kun til planlegging. En tegnet rute er ikke en godkjent seilingsplan, og resultatene dokumenterer ikke samsvar.",
    ],
    local: [
      "Vessel settings and saved plans stay in this browser. Export files to transfer them.",
      "Fartøyinnstillinger og lagrede planer blir i denne nettleseren. Eksporter filer for å overføre dem.",
    ],
    privacy: ["Privacy", "Personvern"],
    calculate: ["Calculate", "Beregn"],
    add: ["Add operating row", "Legg til driftsrad"],
    remove: ["Remove", "Fjern"],
    engine: ["Machinery", "Maskineri"],
    date: ["Date", "Dato"],
    mode: ["Operating mode / reference", "Driftsmodus / referanse"],
    fuel: ["Fuel", "Drivstoff"],
    method: ["Method", "Metode"],
    measured: ["Measured NOx mass", "Målt NOx-masse"],
    energy: ["Energy-based factor", "Energibasert faktor"],
    fuelBased: ["Fuel-based factor", "Drivstoffbasert faktor"],
    quality: ["Evidence", "Dokumentasjon"],
    documented: ["Documented factor", "Dokumentert faktor"],
    estimated: ["Estimate", "Estimat"],
    measurement: ["Direct measurement", "Direkte måling"],
    source: ["Factor / measurement source", "Kilde for faktor / måling"],
    power: ["Operating power (kW)", "Driftseffekt (kW)"],
    hours: ["Operating hours (h)", "Driftstid (t)"],
    factor: ["NOx factor", "NOx-faktor"],
    amount: ["Fuel amount", "Drivstoffmengde"],
    unit: ["Unit", "Enhet"],
    density: ["Density (kg/m³)", "Tetthet (kg/m³)"],
    mass: ["NOx mass (kg)", "NOx-masse (kg)"],
    position: ["Factor position", "Faktorens plassering"],
    inlet: ["Before treatment", "Før rensing"],
    outlet: ["After treatment", "Etter rensing"],
    scr: ["Apply SCR estimate", "Bruk SCR-estimat"],
    scrEfficiency: ["SCR removal (%)", "SCR-rensegrad (%)"],
    scrFraction: [
      "Fraction of operation treated (0–1)",
      "Andel av drift med rensing (0–1)",
    ],
    scrSource: [
      "SCR evidence / assumptions",
      "SCR-dokumentasjon / forutsetninger",
    ],
    noDefaults: [
      "No generic emission factors are inserted. Use engine-specific documentation or identified estimates, including for alternative fuels.",
      "Ingen generelle utslippsfaktorer fylles inn. Bruk motordokumentasjon eller identifiserte estimater, også for alternative drivstoff.",
    ],
    chargeContext: [
      "Norwegian applicability assessment",
      "Vurdering av norsk avgiftsplikt",
    ],
    separateTax: [
      "ECA presence does not establish Norwegian tax liability. Assess the operation, jurisdiction, machinery and Fund participation separately.",
      "En ECA-passering fastslår ikke norsk avgiftsplikt. Vurder drift, jurisdiksjon, maskineri og fondstilknytning separat.",
    ],
    operation: ["Voyage / operation", "Reise / drift"],
    domestic: [
      "Between Norwegian ports / covered Norwegian destinations",
      "Mellom norske havner / omfattede norske destinasjoner",
    ],
    direct: ["Direct Norway–foreign voyage", "Direkte reise Norge–utland"],
    foreign: ["Between foreign ports", "Mellom utenlandske havner"],
    special: [
      "Between special destinations / foreign–special",
      "Mellom særlige destinasjoner / utland–særlig destinasjon",
    ],
    other: ["Other operation / uncertain", "Annen drift / uavklart"],
    directConfirm: [
      "Direct-voyage exemption conditions are documented",
      "Vilkårene for fritak ved direkte utenriksfart er dokumentert",
    ],
    distantFishing: [
      "Distant-water fishing exemption is documented",
      "Fritak for fiske i fjerne farvann er dokumentert",
    ],
    mainland: [
      "Operation in mainland Norwegian territorial waters",
      "Drift i norsk territorialfarvann ved fastlandet",
    ],
    near: [
      "Operation within 250 NM of mainland baselines",
      "Drift innenfor 250 nautiske mil fra fastlandets grunnlinjer",
    ],
    unknown: ["Unconfirmed", "Uavklart"],
    yes: ["Yes", "Ja"],
    no: ["No", "Nei"],
    fund: ["NOx Fund participation", "Tilknytning til NOx-fondet"],
    ordinary: [
      "Ordinary contribution category",
      "Ordinær innbetalingskategori",
    ],
    extraction: ["Oil and gas extraction", "Utvinning av olje og gass"],
    category: ["Fund category", "Fondskategori"],
    joined: ["Membership valid from", "Tilknytning gyldig fra"],
    until: [
      "Valid until (exclusive, optional)",
      "Gyldig til (eksklusiv, valgfritt)",
    ],
    membershipSource: [
      "Membership / exemption documentation",
      "Dokumentasjon for tilknytning / fritak",
    ],
    historical: [
      "Documented applicability override",
      "Dokumentert overstyring av avgiftsvurderingen",
    ],
    automatic: [
      "Use verified 2026 assessment",
      "Bruk verifisert vurdering for 2026",
    ],
    liable: ["Liable", "Avgiftspliktig"],
    outside: ["Outside scope", "Utenfor virkeområdet"],
    exempt: ["Exempt", "Fritatt"],
    historicalSource: [
      "Legal and factual basis for override",
      "Rettslig og faktisk grunnlag for overstyring",
    ],
    historicalNote: [
      "Rates are available for 2017–2026. Automatic legal-scope assessment is verified for 2026 only; other years require a documented assessment.",
      "Satser er tilgjengelige for 2017–2026. Automatisk vurdering av rettslig virkeområde er bare verifisert for 2026. Andre år krever en dokumentert vurdering.",
    ],
    results: ["Results", "Resultater"],
    government: ["Government tax (NOK)", "Statlig avgift (NOK)"],
    fundCost: ["Fund contribution (NOK)", "Fondsinnbetaling (NOK)"],
    total: ["Total charge (NOK)", "Samlet avgift / innbetaling (NOK)"],
    csv: ["Export CSV", "Eksporter CSV"],
    json: ["Export calculation JSON", "Eksporter beregning som JSON"],
    print: ["Print / save PDF", "Skriv ut / lagre PDF"],
    addEngine: ["Add machinery", "Legg til maskineri"],
    saveProfile: ["Save vessel configuration", "Lagre fartøyoppsett"],
    saved: ["Saved in this browser.", "Lagret i denne nettleseren."],
    vesselName: ["Vessel name", "Fartøynavn"],
    flag: ["Flag state (two-letter code)", "Flaggstat (kode med to bokstaver)"],
    shipType: ["Vessel type", "Fartøytype"],
    cargo: ["Cargo ship", "Lasteskip"],
    passenger: ["Passenger ship", "Passasjerskip"],
    fishing: ["Fishing vessel", "Fiskefartøy"],
    yacht: ["Pleasure yacht, not in trade", "Fritidsfartøy, ikke i næring"],
    gross: ["Gross tonnage (GT)", "Bruttotonnasje (BT)"],
    length: ["Length overall (m)", "Største lengde (m)"],
    keel: [
      "Keel laid / similar stage",
      "Kjølstrukket / tilsvarende byggetrinn",
    ],
    contract: ["Building contract date", "Dato for byggekontrakt"],
    delivery: ["Delivery date", "Leveringsdato"],
    noContract: ["There is no building contract", "Ingen byggekontrakt"],
    exemption: [
      "Other exemption claim / basis",
      "Annet påstått fritak / grunnlag",
    ],
    egcs: [
      "Approved equivalent sulphur arrangement reference",
      "Referanse til godkjent likeverdig svovelordning",
    ],
    engineName: ["Machinery name", "Navn på maskineri"],
    rated: [
      "Certified rated mechanical power (kW)",
      "Sertifisert merkeeffekt (kW)",
    ],
    thermal: [
      "Rated thermal input (kW)",
      "Nominell tilført termisk effekt (kW)",
    ],
    kind: ["Machinery role", "Maskineriets funksjon"],
    propulsion: ["Propulsion", "Framdrift"],
    auxiliary: ["Auxiliary", "Hjelpemotor"],
    dieselElectric: [
      "Diesel-electric propulsion supply",
      "Dieselelektrisk framdriftsforsyning",
    ],
    boiler: ["Boiler", "Kjel"],
    turbine: ["Turbine", "Turbin"],
    manoeuvring: ["Manoeuvring only", "Bare manøvrering"],
    electric: ["Electric drive", "Elektrisk drift"],
    diesel: ["Diesel engine", "Dieselmotor"],
    emergency: ["Solely for emergency use", "Utelukkende til nødbruk"],
    conversion: [
      "Major conversion / replacement requiring review",
      "Vesentlig ombygging / utskifting som må vurderes",
    ],
    historyReviewed: [
      "Installation and conversion history checked",
      "Installasjons- og ombyggingshistorikk er kontrollert",
    ],
    installed: ["Engine installation date", "Motorens installasjonsdato"],
    tier: ["Certified NOx Tier", "Sertifisert NOx Tier"],
    eiapp: [
      "EIAPP / Technical File reference",
      "Referanse til EIAPP / teknisk fil",
    ],
    thermalComplete: [
      "All propulsion and combustion sources, including thermal input, have been checked",
      "Alt framdrifts- og forbrenningsmaskineri, inkludert tilført termisk effekt, er kontrollert",
    ],
    profileNote: [
      "Uses the existing Vessel Profile machinery and carriers. Regulatory evidence is saved alongside that profile. Missing certification remains unconfirmed.",
      "Bruker maskineri og energibærere fra eksisterende fartøyprofil. Regelverksdokumentasjon lagres sammen med profilen. Manglende sertifikater forblir uavklart.",
    ],
    openProfile: [
      "Open existing Vessel Profile",
      "Åpne eksisterende fartøyprofil",
    ],
    noEngine: [
      "No machinery configured. Add it in Vessel & certification.",
      "Ingen maskiner er konfigurert. Legg dem til under Fartøy og sertifikater.",
    ],
    choose: ["Choose…", "Velg …"],
    energyLog: [
      "Import one fuel consumption entry",
      "Importer én drivstofforbrukspost",
    ],
    importEntry: ["Use selected entry", "Bruk valgt post"],
    noEntries: [
      "No consumed-fuel entries available",
      "Ingen drivstofforbruksposter tilgjengelig",
    ],
    taxStatus: ["Applicability", "Avgiftsvurdering"],
    untreated: ["Before treatment (kg)", "Før rensing (kg)"],
    reduction: ["Reduction (kg)", "Reduksjon (kg)"],
    details: ["Calculation details", "Beregningsdetaljer"],
    legal: ["Legal basis", "Rettslig grunnlag"],
    verify: ["Last verified", "Sist kontrollert"],
    clear: ["Clear", "Tøm"],
    failed: [
      "Could not complete the calculation.",
      "Beregningen kunne ikke fullføres.",
    ],
    profileChanged: [
      "Vessel configuration changed. Recalculate the results.",
      "Fartøyoppsettet er endret. Beregn resultatene på nytt.",
    ],
    estimateOnly: [
      "User-entered factors and SCR performance are estimates unless supported by the stated evidence.",
      "Inntastede faktorer og SCR-ytelse er estimater med mindre oppgitt dokumentasjon underbygger dem.",
    ],
  };
  let lang = (() => {
    try {
      return /^(nb|no|nn)/i.test(
        localStorage.getItem("mt.lang") ||
          JSON.parse(localStorage.getItem("mt.settings") || "{}").language ||
          "",
      )
        ? "nb"
        : "en";
    } catch {
      return "en";
    }
  })();
  const t = (k) => words[k]?.[lang === "nb" ? 1 : 0] ?? k,
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      ),
    fmt = (n, d = 2) =>
      n === null || n === undefined
        ? t("unknown")
        : Number(n).toLocaleString(lang === "nb" ? "nb-NO" : "en-GB", {
            maximumFractionDigits: d,
          });
  function field(k, name, value = "", type = "text", extra = "") {
    return `<label>${esc(t(k))}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  }
  function select(k, name, options, value = "") {
    return `<label>${esc(t(k))}<select name="${esc(name)}">${options.map(([v, text]) => `<option value="${esc(v)}"${String(v) === String(value) ? " selected" : ""}>${esc(text)}</option>`).join("")}</select></label>`;
  }
  function check(k, name, value) {
    return `<label class="check"><input type="checkbox" name="${esc(name)}"${value ? " checked" : ""}>${esc(t(k))}</label>`;
  }
  const opts = (items) => items.map(([v, k]) => [v, t(k)]),
    tri = () =>
      opts([
        ["", "unknown"],
        ["yes", "yes"],
        ["no", "no"],
      ]);
  function values(host) {
    return Object.fromEntries(
      $$In(host, "[name]").map((e) => [
        e.name,
        e.type === "checkbox" ? e.checked : e.value,
      ]),
    );
  }
  function $$In(host, s) {
    return Array.from(host.querySelectorAll(s));
  }
  function announce(message, error = false) {
    $("#message").className = error ? "error" : "success";
    $("#message").textContent = message;
  }
  function download(name, text, type = "text/plain") {
    const blob = new Blob([text], { type }),
      a = document.createElement("a"),
      url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  let catalogue,
    noxResult = null,
    noxRows = [
      {
        date: new Date().toISOString().slice(0, 10),
        fuel: "mgo",
        method: "energy",
        quality: "documented",
        factorPosition: "outlet",
      },
    ],
    chargeDraft = {},
    profileDraft = null,
    routeState = {
      points: [],
      departure: new Date().toISOString().slice(0, 16),
      speed: "",
      name: "",
      fuelRate: "",
      carrierId: "",
      changeoverHours: "",
      changeoverSource: "",
    },
    routeResult = null,
    map = null,
    mapMode = "route";
  function operationFields(value = {}) {
    return `<fieldset><legend>${t("chargeContext")}</legend><p class="muted">${t("separateTax")}</p><div class="grid">${select(
      "operation",
      "operation",
      opts([
        ["other", "other"],
        ["domestic-norway", "domestic"],
        ["direct-international", "direct"],
        ["foreign-ports", "foreign"],
        ["special-destinations", "special"],
      ]),
      value.operation || "other",
    )}${select("mainland", "mainland", tri(), value.mainland)}${select("near", "near", tri(), value.near)}${select("fund", "participates", tri(), value.participates)}${select(
      "category",
      "fundCategory",
      opts([
        ["ordinary", "ordinary"],
        ["oil-gas-extraction", "extraction"],
      ]),
      value.fundCategory,
    )}${field("joined", "joined", value.joined, "date")}${field("until", "until", value.until, "date")}${field("membershipSource", "membershipSource", value.membershipSource, "text", 'maxlength="600"')}<div>${check("directConfirm", "directConfirm", value.directConfirm)}${check("distantFishing", "distantFishing", value.distantFishing)}</div></div><details><summary>${t("historical")}</summary><p>${t("historicalNote")}</p><div class="grid two">${select(
      "historical",
      "historical",
      opts([
        ["", "automatic"],
        ["liable", "liable"],
        ["outside", "outside"],
        ["exempt", "exempt"],
      ]),
      value.historical,
    )}${field("historicalSource", "historicalSource", value.historicalSource, "text", 'maxlength="600"')}</div></details></fieldset>`;
  }
  function chargeContext() {
    const v = values($("#charge-context")),
      p = P.profile(),
      bool = (s) => (s === "yes" ? true : s === "no" ? false : undefined);
    chargeDraft = v;
    return {
      operation: v.operation,
      flag: p.vessel.flag,
      engines: p.engines,
      thermalConfigurationComplete:
        p.vessel.thermalConfigurationComplete === true,
      directConditionsConfirmed: v.directConfirm,
      distantFishingConfirmed: v.distantFishing,
      inNorwegianMainlandWaters: bool(v.mainland),
      inNorwegianNearWaters: bool(v.near),
      fund: {
        participates: bool(v.participates),
        category: v.fundCategory,
        joined: v.joined,
        until: v.until,
        source: v.membershipSource,
      },
      ...(v.historical
        ? {
            historicalAssessment: {
              status: v.historical,
              source: v.historicalSource,
            },
          }
        : {}),
    };
  }
  function renderNox() {
    const p = P.profile(),
      entries = P.energyEntries();
    $("#nox").innerHTML =
      `<h2 id="nox-title">${t("nox")}</h2><p>${t("noDefaults")}</p><p><a href="#profile">${t("profile")}</a>${!p.engines.length ? " · " + t("noEngine") : ""}</p><div id="nox-rows"></div><div class="actions"><button id="add-row">＋ ${t("add")}</button></div><details class="panel no-print"><summary>${t("energyLog")}</summary>${select("energyLog", "energyEntry", [["", t("choose")], ...entries.map((r) => [r.id, `${r.date} · ${r.carrierName} · ${r.amount} ${r.unit}`])])}<button id="use-energy" ${entries.length ? "" : "disabled"}>${t("importEntry")}</button></details><div id="charge-context">${operationFields(chargeDraft)}</div><div class="actions"><button class="primary" id="calculate-nox">${t("calculate")}</button></div><div id="nox-result"></div>`;
    renderNoxRows();
    $("#add-row").onclick = () => {
      captureRows();
      if (noxRows.length >= 200) return;
      noxRows.push({
        date: new Date().toISOString().slice(0, 10),
        fuel: "mgo",
        method: "energy",
        quality: "documented",
        factorPosition: "outlet",
      });
      renderNoxRows();
      invalidateNox();
    };
    $("#calculate-nox").onclick = calculateNox;
    $("#use-energy").onclick = () => {
      const row = entries.find((r) => r.id === $("[name=energyEntry]").value);
      if (!row) return;
      captureRows();
      const carrier = p.carriers.find((c) => c.id === row.carrierId);
      noxRows.push({
        date: row.date,
        engineId: row.sourceId || "",
        fuel:
          carrier && N.fuels.includes(carrier.catalogKey)
            ? carrier.catalogKey
            : "custom",
        method: "fuel",
        quality: "documented",
        factorPosition: "outlet",
        fuelAmount: row.amount,
        fuelUnit: row.unit,
        densityKgM3: row.densityOverrideKgM3 ?? carrier?.densityKgM3 ?? "",
        mode: row.sourceName || "",
      });
      renderNoxRows();
      invalidateNox();
    };
    if (noxResult) renderNoxResult();
    $("#charge-context").addEventListener("input", invalidateNox);
  }
  function renderNoxRows() {
    const p = P.profile();
    $("#nox-rows").innerHTML = noxRows
      .map(
        (r, i) =>
          `<article class="panel nox-row" data-index="${i}"><div class="row-head"><h3>${i + 1}. ${t("details")}</h3><button data-remove-row="${i}" ${noxRows.length < 2 ? "disabled" : ""}>${t("remove")}</button></div><div class="grid">${select("engine", "engineId", [["", t("choose")], ...p.engines.map((e) => [e.id, e.name])], r.engineId)}${field("date", "date", r.date, "date")}${field("mode", "mode", r.mode, "text", 'maxlength="120"')}${select(
            "fuel",
            "fuel",
            N.fuels.map((f) => [
              f,
              f === "custom"
                ? lang === "nb"
                  ? "Egendefinert"
                  : "User-defined"
                : f.toUpperCase(),
            ]),
            r.fuel,
          )}${select(
            "method",
            "method",
            opts([
              ["energy", "energy"],
              ["fuel", "fuelBased"],
              ["measured", "measured"],
            ]),
            r.method,
          )}${select(
            "quality",
            "quality",
            opts([
              ["documented", "documented"],
              ["estimated", "estimated"],
              ["measured", "measurement"],
            ]),
            r.quality,
          )}<div data-method="energy">${field("power", "powerKw", r.powerKw, "text", 'inputmode="decimal"')}</div><div data-method="energy">${field("hours", "hours", r.hours, "text", 'inputmode="decimal"')}</div><div data-method="fuel">${field("amount", "fuelAmount", r.fuelAmount, "text", 'inputmode="decimal"')}</div><div data-method="fuel">${select(
            "unit",
            "fuelUnit",
            ["t", "kg", "m3", "L"].map((u) => [u, u === "m3" ? "m³" : u]),
            r.fuelUnit || "t",
          )}</div><div data-method="fuel">${field("density", "densityKgM3", r.densityKgM3, "text", 'inputmode="decimal"')}</div><label data-factor>${t("factor")} <span data-factor-unit></span><input name="factor" inputmode="decimal" value="${esc(r.factor)}"></label><div data-method="measured">${field("mass", "measuredKg", r.measuredKg, "text", 'inputmode="decimal"')}</div>${field("source", "source", r.source, "text", 'maxlength="600"')}<div data-factor>${select(
            "position",
            "factorPosition",
            opts([
              ["outlet", "outlet"],
              ["inlet", "inlet"],
            ]),
            r.factorPosition,
          )}</div></div><details data-factor ${r.scrEnabled ? "open" : ""}><summary>SCR</summary>${check("scr", "scrEnabled", r.scrEnabled)}<div class="grid">${field("scrEfficiency", "scrEfficiency", r.scrEfficiency, "text", 'inputmode="decimal"')}${field("scrFraction", "scrFraction", r.scrFraction, "text", 'inputmode="decimal"')}${field("scrSource", "scrSource", r.scrSource, "text", 'maxlength="600"')}</div></details></article>`,
      )
      .join("");
    $$(".nox-row").forEach((host) => {
      updateRow(host);
      host.querySelector("[name=engineId]").onchange = () => {
        const e = p.engines.find(
          (e) => e.id === host.querySelector("[name=engineId]").value,
        );
        if (e?.factorMethod) {
          for (const [key, value] of Object.entries({
            method: e.factorMethod,
            factor: e.factor,
            source: e.factorSource,
            quality: e.factorQuality || "documented",
            factorPosition: e.factorPosition || "outlet",
          })) {
            const input = host.querySelector("[name=" + key + "]");
            if (input) input.value = value ?? "";
          }
          updateRow(host);
        }
        invalidateNox();
      };
      host.oninput = () => {
        updateRow(host);
        invalidateNox();
      };
      host.querySelector("[name=method]").onchange = () => {
        const method = host.querySelector("[name=method]").value;
        if (method === "measured") {
          host.querySelector("[name=quality]").value = "measured";
          host.querySelector("[name=scrEnabled]").checked = false;
        } else if (host.querySelector("[name=quality]").value === "measured")
          host.querySelector("[name=quality]").value = "documented";
        updateRow(host);
      };
    });
    $$("[data-remove-row]").forEach(
      (b) =>
        (b.onclick = () => {
          captureRows();
          noxRows.splice(Number(b.dataset.removeRow), 1);
          renderNoxRows();
          invalidateNox();
        }),
    );
  }
  function updateRow(host) {
    const method = host.querySelector("[name=method]").value;
    $$In(host, "[data-method]").forEach(
      (e) => (e.hidden = e.dataset.method !== method),
    );
    $$In(host, "[data-factor]").forEach(
      (e) => (e.hidden = method === "measured"),
    );
    host.querySelector("[data-factor-unit]").textContent =
      method === "fuel" ? "(kg/t)" : "(g/kWh)";
  }
  function captureRows() {
    noxRows = $$(".nox-row").map(values);
  }
  function invalidateNox() {
    noxResult = null;
    $("#nox-result").replaceChildren();
  }
  function emissionInput(v) {
    return {
      ...v,
      scr: {
        enabled: v.scrEnabled,
        efficiencyPercent: v.scrEfficiency,
        activeFraction: v.scrFraction,
        source: v.scrSource,
      },
    };
  }
  function calculateNox() {
    try {
      captureRows();
      const context = chargeContext(),
        p = P.profile();
      if (noxRows.some((r) => !p.engines.some((e) => e.id === r.engineId)))
        throw Error(t("noEngine"));
      noxResult = N.calculate(noxRows.map(emissionInput), context);
      noxResult.vessel = { ...p.vessel, engines: p.engines };
      noxResult.context = context;
      renderNoxResult();
      $("#message").textContent = "";
    } catch (e) {
      announce(errorText(e), true);
    }
  }
  function renderNoxResult() {
    const x = noxResult;
    $("#nox-result").innerHTML =
      `<article class="panel"><h3>${t("results")}</h3>${vesselSummary(x.vessel)}<div class="results"><div class="metric">NOx<strong>${fmt(x.kgNOx)} kg</strong>${esc(status(x.quality))}</div>${[
        ["government", x.governmentNok],
        ["fundCost", x.fundNok],
        ["total", x.totalNok],
      ]
        .map(
          ([k, v]) =>
            `<div class="metric">${t(k)}<strong>${fmt(v)}</strong></div>`,
        )
        .join(
          "",
        )}</div><p class="muted">${t("verify")}: ${x.verifiedOn} · ${x.sourceVersion}</p><div class="table-wrap"><table><thead><tr>${["date", "engine", "mass", "taxStatus", "government", "fundCost"].map((k) => `<th>${t(k)}</th>`).join("")}</tr></thead><tbody>${x.items.map((r) => `<tr><td>${r.date}</td><td>${esc(P.profile().engines.find((e) => e.id === r.engineId)?.name)}<small>${esc(r.mode)}</small></td><td>${fmt(r.emissions.kgNOx)}<small>${esc(status(r.emissions.quality))}</small></td><td>${esc(status(r.charges.assessment.status))}<small>${esc(reason(r.charges.assessment.reason))}</small></td><td>${fmt(r.charges.governmentNok)}</td><td>${fmt(r.charges.fundNok)}</td></tr>`).join("")}</tbody></table></div>${x.items.map((r) => `<details open><summary>${r.index}. ${t("details")}</summary><p>${esc(relation(r.emissions))}</p><p>${r.emissions.method === "energy" ? t("power") + ": " + fmt(r.emissions.inputs.powerKw) + " · " + t("hours") + ": " + fmt(r.emissions.inputs.hours) : r.emissions.method === "fuel" ? t("amount") + ": " + fmt(r.emissions.inputs.amount) + " " + esc(r.emissions.inputs.unit) + " · " + t("density") + ": " + fmt(r.emissions.inputs.densityKgM3) : ""}</p><p>${t("source")}: ${esc(r.emissions.source)} · ${r.emissions.factor == null ? "" : fmt(r.emissions.factor) + " " + r.emissions.factorUnit}</p><p>${t("untreated")}: ${fmt(r.emissions.untreatedKg)} · ${t("reduction")}: ${fmt(r.emissions.reductionKg)}</p><p>${r.emissions.scr ? esc(t("scrSource") + ": " + r.emissions.scr.source) : ""}</p><p>${t("legal")}: ${r.charges.assessment.basis.map((url) => safeLink(url)).join(" · ")}</p>${r.charges.rate ? `<p>NOK/kg: ${fmt(r.charges.rateNokKg)} · ${r.charges.rate.sources.map((url) => safeLink(url)).join(" · ")}</p>` : ""}</details>`).join("")}<div class="actions"><button id="nox-csv">${t("csv")}</button><button id="nox-json">${t("json")}</button><button id="nox-html">${lang==="nb"?"Last ned rapport":"Download report"}</button><button id="nox-print">${t("print")}</button></div><p class="muted">${t("estimateOnly")}</p></article>`;
    $("#nox-json").onclick = () =>
      download(
        "marine-tools-nox.json",
        JSON.stringify(x, null, 2),
        "application/json",
      );
    $("#nox-csv").onclick = () =>
      download(
        "marine-tools-nox.csv",
        IO.csv([
          [
            t("date"),
            t("engine"),
            t("mode"),
            t("method"),
            t("mass"),
            t("quality"),
            t("source"),
            t("factor"),
            t("unit"),
            t("untreated"),
            t("reduction"),
            t("taxStatus"),
            t("legal"),
            t("government"),
            t("fundCost"),
          ],
          ...x.items.map((r) => [
            r.date,
            r.engineId,
            r.mode,
            r.emissions.method,
            r.emissions.kgNOx,
            r.emissions.quality,
            r.emissions.source,
            r.emissions.factor,
            r.emissions.factorUnit,
            r.emissions.untreatedKg,
            r.emissions.reductionKg,
            r.charges.assessment.reason,
            r.charges.assessment.basis.join(" | "),
            r.charges.governmentNok,
            r.charges.fundNok,
          ]),
        ]),
        "text/csv",
      );
    $("#nox-html").onclick = () => exportReport($("#nox-result"),t("nox"));
    $("#nox-print").onclick = () => window.print();
  }
  function safeLink(url, label) {
    try {
      const u = new URL(url);
      return u.protocol === "https:"
        ? `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(label || u.hostname)}</a>`
        : esc(url);
    } catch {
      return esc(url);
    }
  }
  function relation(x) {
    if (lang === "en") return x.relation;
    return x.method === "energy"
      ? "NOx [kg] = effekt [kW] × driftstid [t] × faktor [g/kWh] / 1000"
      : x.method === "fuel"
        ? "NOx [kg] = drivstoffmasse [t] × faktor [kg/t]"
        : "NOx = inntastet målt masse";
  }
  // Further views and the shared localized reason dictionary follow below.

  function renderProfile() {
    const p = P.profile(),
      v = profileDraft?.vessel || p.vessel,
      engines = profileDraft?.engines || p.engines;
    $("#profile").innerHTML =
      `<h2 id="profile-title">${t("profile")}</h2><p>${t("profileNote")}</p><a href="index.html#profile">${t("openProfile")}</a><form id="reg-profile"><div class="panel grid vessel-config">${field("vesselName", "name", v.name, "text", 'maxlength="120"')}${field("flag", "flag", v.flag, "text", 'maxlength="2" pattern="[A-Za-z]{2}"')}${select(
        "shipType",
        "shipType",
        opts([
          ["", "unknown"],
          ["cargo", "cargo"],
          ["passenger", "passenger"],
          ["fishing", "fishing"],
          ["yacht", "yacht"],
          ["other", "other"],
        ]),
        v.shipType,
      )}${field("gross", "grossTonnage", v.grossTonnage, "text", 'inputmode="decimal"')}${field("length", "loa", v.loa, "text", 'inputmode="decimal"')}${field("contract", "contractDate", v.contractDate, "date")}${field("keel", "keelDate", v.keelDate, "date")}${field("delivery", "deliveryDate", v.deliveryDate, "date")}${check("noContract", "noBuildingContract", v.noBuildingContract)}${field("egcs", "egcsReference", v.egcsReference, "text", 'maxlength="600"')}${field("exemption", "exemptionClaim", v.exemptionClaim, "text", 'maxlength="600"')}</div><div id="engine-config">${engines.map(engineConfig).join("")}</div><div class="actions"><button type="button" id="add-engine">＋ ${t("addEngine")}</button></div>${check("thermalComplete", "thermalConfigurationComplete", v.thermalConfigurationComplete)}<div class="actions"><button class="primary">${t("saveProfile")}</button></div></form>`;
    $("#add-engine").onclick = () => {
      captureProfile();
      profileDraft.engines.push({
        id: crypto.randomUUID(),
        name: "",
        ratedKw: "",
        kind: "",
        dieselEngine: false,
        profileType: "Other",
      });
      renderProfile();
    };
    $$("[data-remove-engine]").forEach(
      (b) =>
        (b.onclick = () => {
          captureProfile();
          profileDraft.engines = profileDraft.engines.filter(
            (e) => e.id !== b.dataset.removeEngine,
          );
          renderProfile();
        }),
    );
    $("#reg-profile").onsubmit = (event) => {
      event.preventDefault();
      try {
        captureProfile();
        const draft = profileDraft;
        for (const k of ["grossTonnage", "loa"])
          if (draft.vessel[k] !== "")
            draft.vessel[k] = N.numeric(
              draft.vessel[k],
              t(k === "loa" ? "length" : "gross"),
            );
        for (const k of ["contractDate", "keelDate", "deliveryDate"])
          if (draft.vessel[k]) N.date(draft.vessel[k]);
        if (draft.vessel.noBuildingContract && draft.vessel.contractDate)
          throw Error(
            lang === "nb"
              ? "Fjern kontraktdatoen når det ikke finnes en byggekontrakt."
              : "Remove the contract date when no building contract exists.",
          );
        draft.vessel.flag = draft.vessel.flag.toUpperCase();
        const original = P.profile(),
          machinery = [...(original.machinery || [])];
        for (const e of draft.engines) {
          if (!e.name.trim()) throw Error(t("engineName"));
          e.ratedKw = N.numeric(e.ratedKw, t("rated"));
          if (e.thermalInputKw !== "")
            e.thermalInputKw = N.numeric(e.thermalInputKw, t("thermal"));
          if (e.installationDate) N.date(e.installationDate);
          const m = machinery.find((m) => m.id === e.id);
          if (m) {
            m.name = e.name;
            m.ratedPowerKw = e.ratedKw;
          } else
            machinery.push({
              id: e.id,
              name: e.name,
              type: e.profileType || "Other",
              ratedPowerKw: e.ratedKw,
              primaryCarrierId: e.carrierId || null,
              pilotCarrierId: null,
            });
        }
        P.save({ ...draft.vessel, engines: draft.engines }, machinery);
        profileDraft = null;
        noxResult = null;
        routeResult = null;
        renderNox();
        renderVoyage();
        renderProfile();
        announce(t("saved"));
      } catch (e) {
        announce(errorText(e), true);
      }
    };
  }
  function engineConfig(e) {
    return `<fieldset class="panel engine-config" data-id="${esc(e.id)}"><legend>${esc(e.name || t("engine"))}</legend><div class="grid">${field("engineName", "name", e.name, "text", 'maxlength="120"')}${field("rated", "ratedKw", e.ratedKw, "text", 'inputmode="decimal"')}${select(
      "kind",
      "kind",
      opts([
        ["", "unknown"],
        ["propulsion", "propulsion"],
        ["auxiliary", "auxiliary"],
        ["diesel-electric", "dieselElectric"],
        ["boiler", "boiler"],
        ["turbine", "turbine"],
        ["manoeuvring", "manoeuvring"],
        ["electric", "electric"],
      ]),
      e.kind,
    )}${field("thermal", "thermalInputKw", e.thermalInputKw, "text", 'inputmode="decimal"')}${field("installed", "installationDate", e.installationDate, "date")}${select(
      "tier",
      "tier",
      [
        ["", t("unknown")],
        ["I", "I"],
        ["II", "II"],
        ["III", "III"],
      ],
      e.tier,
    )}${field("eiapp", "eiappSource", e.eiappSource, "text", 'maxlength="600"')}${check("diesel", "dieselEngine", e.dieselEngine)}${check("emergency", "emergencyOnly", e.emergencyOnly)}${check("conversion", "majorConversion", e.majorConversion)}${check("historyReviewed", "conversionHistoryReviewed", e.conversionHistoryReviewed)}</div><details><summary>${t("factor")}</summary><div class="grid">${select(
      "method",
      "factorMethod",
      opts([
        ["", "choose"],
        ["energy", "energy"],
        ["fuel", "fuelBased"],
      ]),
      e.factorMethod,
    )}${field("factor", "factor", e.factor, "text", 'inputmode="decimal"')}${select(
      "position",
      "factorPosition",
      opts([
        ["outlet", "outlet"],
        ["inlet", "inlet"],
      ]),
      e.factorPosition,
    )}${field("source", "factorSource", e.factorSource, "text", 'maxlength="600"')}${select(
      "quality",
      "factorQuality",
      opts([
        ["documented", "documented"],
        ["estimated", "estimated"],
      ]),
      e.factorQuality,
    )}</div></details><small>${lang === "nb" ? "Fjern her sletter bare regelverksdokumentasjonen. Maskineriet i hovedprofilen beholdes." : "Removal here clears regulatory evidence only. Machinery in the main profile is retained."}</small><button type="button" data-remove-engine="${esc(e.id)}">${t("remove")}</button></fieldset>`;
  }
  function captureProfile() {
    const v = {
        ...values($("#reg-profile .vessel-config")),
        thermalConfigurationComplete: $(
          "#reg-profile > .check [name=thermalConfigurationComplete]",
        ).checked,
      },
      existing = P.profile();
    profileDraft = {
      vessel: v,
      engines: $$(".engine-config").map((e) => ({
        ...existing.engines.find((x) => x.id === e.dataset.id),
        ...values(e),
        id: e.dataset.id,
      })),
    };
  }

  Object.assign(words, {
    soxFactor: [
      "Documented SO₂ factor (kg/t fuel)",
      "Dokumentert SO₂-faktor (kg/t drivstoff)",
    ],
    soxSource: [
      "SO₂ factor source and fuel applicability",
      "SO₂-faktorens kilde og drivstoffgrunnlag",
    ],
    importGeometry: [
      "Route imports include positions and order only. Turn radii, cross-track limits and other navigation constraints must be reviewed separately.",
      "Ruteimport omfatter bare posisjoner og rekkefølge. Svingradier, sideavviksgrenser og andre navigasjonsbegrensninger må kontrolleres separat.",
    ],
    mapDetailLoaded: [
      "Detailed boundaries loaded for this view.",
      "Detaljerte grenser er lastet for denne visningen.",
    ],
    mapDetailZoom: [
      "Zoom in further for detailed boundaries.",
      "Zoom inn mer for detaljerte grenser.",
    ],
    mapDetailUnavailable: [
      "Detailed boundaries are unavailable; the display overview remains visible.",
      "Detaljerte grenser er utilgjengelige. Oversiktslaget er fortsatt synlig.",
    ],
    emissionsLayer: ["Air emissions", "Luftutslipp"],
    dischargeLayer: ["Discharge", "Utslipp til sjø"],
    pssaLayer: ["PSSAs", "PSSA-er"],
    polarLayer: ["Polar waters", "Polare farvann"],
    nationalLayer: ["National requirements", "Nasjonale krav"],
    fitMap: ["Fit voyage", "Tilpass til reisen"],
    worldMap: ["World view", "Verdenskart"],
    routeName: ["Voyage name", "Reisenavn"],
    departure: ["Departure (UTC)", "Avgang (UTC)"],
    speed: ["Speed (kn)", "Fart (knop)"],
    lat: ["Latitude (°)", "Breddegrad (°)"],
    lon: ["Longitude (°)", "Lengdegrad (°)"],
    waypoints: ["Waypoints", "Veipunkter"],
    addWaypoint: ["Add waypoint", "Legg til veipunkt"],
    up: ["Move up", "Flytt opp"],
    down: ["Move down", "Flytt ned"],
    importRoute: ["Import GPX / GeoJSON / RTZ", "Importer GPX / GeoJSON / RTZ"],
    importNavigation: ["Use route from Navigation", "Bruk rute fra Navigasjon"],
    saveRoute: ["Save plan locally", "Lagre planen lokalt"],
    savedPlans: ["Saved plans", "Lagrede planer"],
    openPlan: ["Open plan", "Åpne plan"],
    deletePlan: ["Delete selected plan", "Slett valgt plan"],
    exportRoute: ["Export GeoJSON route", "Eksporter GeoJSON-rute"],
    analyze: ["Analyze voyage", "Analyser reisen"],
    layers: ["Regulatory layers", "Regelverkslag"],
    selectedDate: ["Map date (UTC)", "Kartdato (UTC)"],
    mapHint: [
      "Click the map to add a waypoint. Coordinates and order can be edited below. Legs use great-circle interpolation and are not checked for navigational hazards or land crossings.",
      "Klikk i kartet for å legge til et veipunkt. Koordinater og rekkefølge kan endres nedenfor. Etappene følger storsirkler og kontrolleres ikke for navigasjonsfarer eller kryssing av land.",
    ],
    baseMap: [
      "Show online OpenStreetMap background",
      "Vis OpenStreetMap-bakgrunn fra nettet",
    ],
    baseMapNote: [
      "An online background sends map tile requests, including the viewed area, to OpenStreetMap. Boundary analysis uses bundled regulatory data.",
      "Nettbakgrunnen sender kartforespørsler, inkludert vist område, til OpenStreetMap. Grenseanalysen bruker medfølgende regelverksdata.",
    ],
    active: ["Active", "Gjeldende"],
    future: ["Adopted future", "Vedtatt framtidig"],
    transitional: ["Transition", "Overgangsperiode"],
    routeLegend: ["Voyage route", "Reiserute"],
    overlap: ["Overlapping areas", "Overlappende områder"],
    overview: [
      "Display outlines are simplified. Analysis uses detailed boundaries. Coastal accuracy is source-dependent.",
      "Kartomriss er forenklet for visning. Analysen bruker detaljerte grenser. Kystnøyaktigheten avhenger av kilden.",
    ],
    loading: [
      "Loading detailed boundary data…",
      "Laster detaljerte grensedata …",
    ],
    working: ["Calculating intersections…", "Beregner grensekryssinger …"],
    distance: ["Distance (NM)", "Distanse (NM)"],
    duration: ["Time (h)", "Tid (t)"],
    arrival: ["Estimated arrival (UTC)", "Beregnet ankomst (UTC)"],
    entry: ["Entry (UTC)", "Innpassering (UTC)"],
    exit: ["Exit (UTC)", "Utpassering (UTC)"],
    positionEntry: ["Entry position", "Posisjon ved innpassering"],
    positionExit: ["Exit position", "Posisjon ved utpassering"],
    areas: ["Areas / requirements", "Områder / krav"],
    sulphur: [
      "Fuel sulphur limit (% m/m)",
      "Svovelgrense i drivstoff (% masse)",
    ],
    segment: ["Segment", "Segment"],
    selectSegment: ["Show segment", "Vis strekning"],
    outsideMapped: ["No mapped area", "Ingen kartlagt sone"],
    globalOnly: [
      "Global limit shown. Other local requirements may apply; coverage is incomplete.",
      "Global grense vises. Andre lokale krav kan gjelde. Dekningen er ufullstendig.",
    ],
    areaOverview: [
      "Chronological regulatory overview",
      "Kronologisk regelverksoversikt",
    ],
    allOverlap: [
      "Every overlapping area is retained. Area distances overlap and must not be added as a voyage total.",
      "Alle overlappende områder beholdes. Områdedistanser overlapper og skal ikke summeres til total reisedistanse.",
    ],
    routeOverview: ["Voyage summary", "Reisesammendrag"],
    fuelHourly: [
      "Fuel rate (carrier units per hour)",
      "Forbruksrate (energibærerenheter per time)",
    ],
    carrier: ["Vessel Profile fuel", "Drivstoff fra fartøyprofilen"],
    useEstimate: [
      "Use Vessel Profile daily fuel estimate",
      "Bruk døgnforbruk fra fartøyprofilen",
    ],
    consumption: ["Estimated consumption", "Beregnet forbruk"],
    emissionEstimate: [
      "Estimate NOx from all documented energy-based engine factors",
      "Estimer NOx fra alle dokumenterte energibaserte motorfaktorer",
    ],
    emissionWarning: [
      "Rated power is not operating power. Enter each engine’s planned average load before estimating voyage NOx. All configured combustion sources must be included for a charge total.",
      "Merkeeffekt er ikke driftseffekt. Oppgi planlagt gjennomsnittsbelastning for hver motor før NOx-estimering. Alle konfigurerte forbrenningskilder må inkluderes for å beregne samlet avgift.",
    ],
    loadPercent: ["Planned load (%)", "Planlagt belastning (%)"],
    switching: ["Fuel changeover planning", "Planlegging av drivstoffskifte"],
    switchHours: [
      "Verified changeover duration (h)",
      "Kontrollert varighet for drivstoffskifte (t)",
    ],
    switchSource: [
      "Approved procedure / operating assumptions",
      "Godkjent prosedyre / driftsforutsetninger",
    ],
    switchLimit: [
      "Latest estimated start (UTC)",
      "Senest beregnede start (UTC)",
    ],
    switchNote: [
      "This window only subtracts the entered duration from boundary arrival. Verify fuel-system volumes, flushing, temperature limits, machinery load and approved procedures. It does not certify safe changeover.",
      "Vinduet trekker bare oppgitt varighet fra ankomst til grensen. Kontroller systemvolumer, gjennomspyling, temperaturgrenser, maskinbelastning og godkjente prosedyrer. Det bekrefter ikke sikkert drivstoffskifte.",
    ],
    beforeDeparture: [
      "Preparation would need to begin before departure.",
      "Forberedelsene må starte før avgang.",
    ],
    noSwitch: [
      "No stricter sulphur transition was found in the supported layers. Check other local and port requirements.",
      "Ingen overgang til strengere svovelkrav ble funnet i de støttede lagene. Kontroller andre lokale krav og havnekrav.",
    ],
    sourceDate: [
      "Dataset version / verification",
      "Datasettversjon / kontroll",
    ],
    coverage: ["Coverage", "Dekning"],
    incomplete: ["Incomplete coverage", "Ufullstendig dekning"],
    futureChanges: [
      "Adopted changes and application dates",
      "Vedtatte endringer og anvendelsesdatoer",
    ],
    designation: ["Designation in force", "Designasjon i kraft"],
    sulphurDate: [
      "ECA sulphur requirement from",
      "ECAs svovelkrav gjelder fra",
    ],
    noxDate: ["NOx area regime from", "NOx-områderegime gjelder fra"],
    proposalNote: [
      "Adopted future rules are separated from current obligations. Proposals, if present, are reference information and never impose a requirement in the analysis.",
      "Vedtatte framtidige regler skilles fra gjeldende plikter. Forslag vises eventuelt som referanse og utløser aldri krav i analysen.",
    ],
    noProposal: [
      "No proposal-only polygons are included in this dataset.",
      "Dette datasettet inneholder ingen polygoner som bare gjelder forslag.",
    ],
    sourceRole: ["Scope / source role", "Omfang / kilderolle"],
    reference: ["Reference", "Referanse"],
    fullCoverageWarning: [
      "Eight initial ECA regions are included. Special Areas, PSSAs, polar and national layers are listed separately as they are verified; unavailable layers are never treated as unrestricted waters.",
      "Åtte innledende ECA-regioner er inkludert. Spesialområder, PSSA-er, polare og nasjonale lag oppgis separat etter kontroll. Manglende lag tolkes aldri som fritt farvann.",
    ],
    noValidRoute: [
      "Enter at least two valid waypoints.",
      "Oppgi minst to gyldige veipunkter.",
    ],
    recalculate: [
      "Inputs changed. Analyze the voyage again.",
      "Inndata er endret. Analyser reisen på nytt.",
    ],
    noSaved: ["No saved plans", "Ingen lagrede planer"],
    nameRequired: [
      "Enter a voyage name before saving.",
      "Oppgi et reisenavn før lagring.",
    ],
    routeImported: [
      "Route imported. Check coordinates, leg geometry, speed and departure before analysis.",
      "Ruten er importert. Kontroller koordinater, etappegeometri, fart og avgang før analyse.",
    ],
    missingGeometry: [
      "Missing detailed geometry",
      "Detaljert geometri mangler",
    ],
    futureTier: ["NOx construction criteria", "Byggekriterier for NOx"],
    approvedEquivalent: [
      "An equivalent sulphur arrangement must be approved and applicable to this operation.",
      "En likeverdig svovelordning må være godkjent og gjelde for denne driften.",
    ],
    mapOffline: [
      "Online map tiles are unavailable in this app build. Bundled boundaries remain usable.",
      "Nettkart er utilgjengelig i denne apputgaven. Medfølgende områdegrenser kan fortsatt brukes.",
    ],
  });
  function planList() {
    try {
      const x = JSON.parse(
        localStorage.getItem("mt.regulatory.plans.v1") || "[]",
      );
      return Array.isArray(x) ? x.slice(0, 50) : [];
    } catch {
      return [];
    }
  }
  function renderVoyage() {
    clearTimeout(detailTimer);
    detailWorker?.terminate();
    detailWorker = null;
    detailLayer = null;
    if (map) {
      map.off("moveend", scheduleDetails);
      map.stop();
      map.remove();
      map = null;
    }
    const p = P.profile(),
      plans = planList();
    if (!routeState.speed && p.vessel.serviceSpeed)
      routeState.speed = p.vessel.serviceSpeed;
    const fuels = p.carriers.filter(c => c.category !== "battery" && c.category !== "consumable");
    if (!routeState.id && !routeState.carrierId && fuels.length === 1) routeState.carrierId = fuels[0].id;
    const selectedFuel = fuels.find(c => c.id === routeState.carrierId);
    if (!routeState.id && !routeState.fuelRate && selectedFuel?.primaryUnit === "m3" && Number(p.operational.fuelDay) > 0)
      routeState.fuelRate = Number(p.operational.fuelDay) / 24;
    $("#voyage").innerHTML =
      `<h2 id="voyage-title">${t("voyage")}</h2><p>${t("mapHint")}</p><p class="muted">${lang === "nb" ? "Fartøyprofil" : "Vessel profile"}: <strong>${esc(p.vessel.name || t("unknown"))}</strong> · ${t("speed")}: ${esc(p.vessel.serviceSpeed ?? t("unknown"))} kn · ${p.engines.length} ${lang === "nb" ? "maskiner" : "engines"} · <a href="#profile">${t("profile")}</a></p><div class="map-layout"><div class="map-column"><div class="map-workspace"><div class="workspace-heading"><div><span class="section-kicker">${lang === "nb" ? "REISEPLANLEGGER" : "VOYAGE PLANNER"}</span><h3>${lang === "nb" ? "Planlegg reisen" : "Plan your voyage"}</h3></div><span class="waypoint-count" id="waypoint-count"></span></div><div class="actions map-actions no-print"><button id="map-draw" type="button" aria-pressed="${mapMode === "route"}">${lang === "nb" ? "Tegn rute" : "Draw route"}</button><button id="map-inspect" type="button" aria-pressed="${mapMode === "inspect"}">${lang === "nb" ? "Undersøk områder" : "Inspect areas"}</button></div><p id="map-mode-hint" class="muted">${lang === "nb" ? "Klikk i kartet for å legge til veipunkter. Dra punktene for å justere ruten." : "Click the map to add waypoints. Drag points to adjust the route."}</p><div id="reg-map" role="region" aria-label="${esc(t("voyage"))}"></div><p id="map-detail-status" class="muted" role="status"></p><div class="actions map-actions map-footer no-print"><button id="undo-waypoint" type="button">${lang === "nb" ? "Angre siste punkt" : "Undo last point"}</button><button id="fit-route">${t("fitMap")}</button><button id="world-view">${t("worldMap")}</button><button id="quick-analyze" class="primary" type="button">${t("analyze")}</button></div></div><div class="legend"><span><i class="swatch"></i>${t("active")}</span><span><i class="swatch future"></i>${t("future")}</span><span><i class="swatch route"></i>${t("routeLegend")}</span><span><i class="swatch overlap"></i>${t("overlap")}</span></div><p class="muted">${t("overview")}</p><div class="panel no-print route-settings"><div class="section-heading"><span class="section-kicker">01</span><h3>${lang === "nb" ? "Reise og veipunkter" : "Voyage and waypoints"}</h3></div><div class="grid">${field("routeName", "routeName", routeState.name, "text", 'maxlength="120"')}${field("departure", "departure", routeState.departure, "datetime-local")}${field("speed", "speed", routeState.speed, "text", 'inputmode="decimal"')}</div><div class="actions"><label class="button">${t("importRoute")}<input id="route-file" type="file" accept=".gpx,.geojson,.json,.rtz" hidden></label><button id="nav-route">${t("importNavigation")}</button><button id="export-route">${t("exportRoute")}</button></div><p class="muted">${t("importGeometry")}</p><h3>${t("waypoints")}</h3><div id="waypoint-list"></div><button id="add-waypoint">＋ ${t("addWaypoint")}</button><div class="actions"><button id="save-plan">${t("saveRoute")}</button></div>${select("savedPlans", "savedPlan", [["", t("choose")], ...plans.map((x) => [x.id, x.name])])}<div class="actions"><button id="open-plan">${t("openPlan")}</button><button id="delete-plan">${t("deletePlan")}</button></div></div><details class="panel no-print"><summary><span class="section-kicker">02</span> ${t("consumption")}</summary><div class="grid two">${select("carrier", "carrierId", [["", t("choose")], ...p.carriers.filter((c) => c.category !== "battery" && c.category !== "consumable").map((c) => [c.id, `${c.name} (${c.primaryUnit})`])], routeState.carrierId)}${field("fuelHourly", "fuelRate", routeState.fuelRate, "text", 'inputmode="decimal"')}${field("soxFactor", "soxFactor", routeState.soxFactor, "text", 'inputmode="decimal"')}${field("soxSource", "soxSource", routeState.soxSource, "text", 'maxlength="600"')}</div><div class="actions"><button id="use-daily">${t("useEstimate")}</button></div>${check("emissionEstimate", "voyageNox", routeState.voyageNox)}<p class="muted">${t("emissionWarning")}</p><div id="voyage-loads" class="grid">${p.engines
        .filter((e) => e.kind !== "electric")
        .map((e) =>
          field(
            "loadPercent",
            "load-" + e.id,
            routeState.loads?.[e.id] ?? "",
            "text",
            `inputmode="decimal" aria-label="${esc(e.name + " · " + t("loadPercent"))}" data-engine="${esc(e.id)}"`,
          ).replace("<label>", "<label>" + esc(e.name) + " · "),
        )
        .join(
          "",
        )}</div><p><a href="#nox">${t("chargeContext")}</a> · <a href="#profile">${t("factor")}</a></p></details><details class="panel no-print"><summary><span class="section-kicker">03</span> ${t("switching")}</summary><div class="grid two">${field("switchHours", "changeoverHours", routeState.changeoverHours, "text", 'inputmode="decimal"')}${field("switchSource", "changeoverSource", routeState.changeoverSource, "text", 'maxlength="600"')}</div><p class="muted">${t("switchNote")}</p></details><div class="actions"><button class="primary" id="analyze-route">${t("analyze")}</button></div><p id="route-progress" role="status"></p></div><aside class="map-side no-print"><details class="panel" ${innerWidth > 760 ? "open" : ""}><summary>${t("layers")}</summary><label class="layer-search">${lang === "nb" ? "Søk etter område" : "Find an area"}<input id="layer-search" type="search" autocomplete="off" placeholder="${lang === "nb" ? "Søk i områder" : "Search areas"}"></label>${field("selectedDate", "mapDate", routeState.departure.slice(0, 10), "date")}<div class="layer-list">${[
        "emissions",
        "discharge",
        "pssa",
        "polar",
        "national",
      ]
        .map(
          (category) =>
            `<h3>${t(category + "Layer")} <button type="button" class="layer-group" data-layer-group="${category}">${lang === "nb" ? "Slå av" : "Hide all"}</button></h3>${catalogue.areas
              .filter((a) => a.category === category)
              .map(
                (a) =>
                  `<label><input type="checkbox" data-layer="${a.id}" data-category="${category}" checked><span>${esc(a.name[lang])}<small id="layer-status-${a.id}"></small></span></label>`,
              )
              .join("")}`,
        )
        .join(
          "",
        )}</div></details><details class="panel"><summary>OpenStreetMap</summary>${check("baseMap", "baseMap", false)}<p class="muted">${t("baseMapNote")}</p></details><div class="notice warning"><strong>${t("incomplete")}</strong><p>${t("fullCoverageWarning")}</p><a href="#sources">${t("sources")}</a></div><div id="segment-detail"></div></aside></div><div id="route-results"></div>`;
    const side = $(".map-side"), routePanel = $(".route-settings");
    const consumptionPanel = routePanel.nextElementSibling, switchingPanel = consumptionPanel.nextElementSibling;
    const actionPanel = switchingPanel.nextElementSibling, progress = actionPanel.nextElementSibling;
    // Keep the controls in their original order ahead of map layers.
    for (const el of [routePanel, consumptionPanel, switchingPanel, actionPanel, progress].reverse()) side.prepend(el);
    const profileCard = document.createElement("section");
    profileCard.className = "panel profile-context";
    const missing = [];
    if (!p.vessel.name) missing.push(lang === "nb" ? "fartøynavn" : "vessel name");
    if (!p.vessel.serviceSpeed) missing.push(lang === "nb" ? "servicefart" : "service speed");
    if (!p.vessel.keelDate) missing.push(lang === "nb" ? "kjølstrekksdato" : "keel date");
    if (!p.engines.length) missing.push(lang === "nb" ? "motorer" : "engines");
    profileCard.innerHTML = `<h3>${lang === "nb" ? "Skipsprofil" : "Vessel profile"}</h3><p>${esc(p.vessel.name || t("unknown"))} · ${t("speed")}: ${esc(p.vessel.serviceSpeed ?? t("unknown"))} kn · ${p.engines.length} ${lang === "nb" ? "motorer" : "engines"}</p><p class="muted">${missing.length ? (lang === "nb" ? "Mangler: " : "Missing: ") + missing.map(esc).join(", ") : (lang === "nb" ? "Grunnopplysningene er tilgjengelige." : "Basic vessel details are available.")}</p><button type="button" id="fill-profile">${lang === "nb" ? "Fyll inn manglende verdier fra profil" : "Fill missing values from profile"}</button> <a href="#profile">${t("profile")}</a>`;
    side.prepend(profileCard);
    renderWaypoints();
    bindVoyage();
    updateLayerLabels();
    if (location.hash === "#voyage") initMap();
    if (routeResult) renderRouteResult();
  }
  function captureRoute() {
    if (!$("#voyage [name=departure]")) return;
    const get = (n) => $("#voyage [name=" + n + "]");
    routeState = {
      ...routeState,
      name: get("routeName").value,
      departure: get("departure").value,
      speed: get("speed").value,
      carrierId: get("carrierId").value,
      fuelRate: get("fuelRate").value,
      soxFactor: get("soxFactor").value,
      soxSource: get("soxSource").value,
      changeoverHours: get("changeoverHours").value,
      changeoverSource: get("changeoverSource").value,
      voyageNox: get("voyageNox").checked,
      loads: Object.fromEntries(
        $$("#voyage-loads input").map((e) => [e.dataset.engine, e.value]),
      ),
    };
    routeState.points = $$(".waypoint").map((host) => {
      const v = values(host);
      return [v.lon, v.lat];
    });
  }
  function routePoints() {
    return IO.clean(
      routeState.points.map((p) =>
        p.map((v) => N.numeric(v, t("positionEntry"), { min: -180, max: 180 })),
      ),
    );
  }
  function invalidateRoute() {
    routeResult = null;
    $("#route-results").replaceChildren();
    $("#segment-detail").replaceChildren();
    $("#route-progress").textContent = t("recalculate");
    if (window.__regWorker) {
      window.__regWorker.terminate();
      window.__regWorker = null;
    }
    $("#analyze-route").disabled = false;
    drawRoute();
  }
  function renderWaypoints() {
    const count = $("#waypoint-count");
    if (count) count.textContent = routeState.points.length + (lang === "nb" ? " veipunkter" : " waypoints");
    $("#waypoint-list").innerHTML = routeState.points
      .map(
        (p, i) =>
          `<div class="waypoint"><label>${i === 0 ? (lang === "nb" ? "Avgang" : "Departure") : i === routeState.points.length - 1 ? (lang === "nb" ? "Ankomst" : "Destination") : "#" + (i + 1)} · ${t("lat")}<input name="lat" inputmode="decimal" value="${esc(p[1])}"></label><label>${t("lon")}<input name="lon" inputmode="decimal" value="${esc(p[0])}"></label><button data-waypoint="${i}" data-action="remove" aria-label="${esc(t("remove") + " " + (i + 1))}">×</button><div class="actions"><button data-waypoint="${i}" data-action="up" ${i === 0 ? "disabled" : ""}>↑ ${t("up")}</button><button data-waypoint="${i}" data-action="insert" ${i === routeState.points.length - 1 ? "disabled" : ""}>${lang === "nb" ? "Sett inn etter" : "Insert after"}</button><button data-waypoint="${i}" data-action="down" ${i === routeState.points.length - 1 ? "disabled" : ""}>↓ ${t("down")}</button></div></div>`,
      )
      .join("");
    $$(".waypoint input").forEach(
      (el) =>
        (el.oninput = () => {
          captureRoute();
          invalidateRoute();
        }),
    );
    $$("[data-waypoint]").forEach(
      (b) =>
        (b.onclick = () => {
          captureRoute();
          const i = Number(b.dataset.waypoint),
            a = b.dataset.action;
          if (a === "remove") routeState.points.splice(i, 1);
          else if (a === "insert") {
            try {
              const pair = routeState.points.slice(i, i + 2).map(p => p.map(v => N.numeric(v, t("positionEntry"), {min: -180, max: 180})));
              const middle = MT_NAV_MATH.interpolate(pair[0], pair[1], 0.5).map(v => Number(v.toFixed(6)));
              routeState.points.splice(i + 1, 0, middle);
            } catch (error) { announce(errorText(error), true); return; }
          }
          else {
            const j = a === "up" ? i - 1 : i + 1;
            [routeState.points[i], routeState.points[j]] = [
              routeState.points[j],
              routeState.points[i],
            ];
          }
          renderWaypoints();
          invalidateRoute();
        }),
    );
    drawRoute();
  }
  function bindVoyage() {
    $("#fill-profile").onclick = () => {
      const p = P.profile(), speed = $("#voyage [name=speed]"), carrier = $("#voyage [name=carrierId]"), rate = $("#voyage [name=fuelRate]");
      if (!speed.value.trim() && Number(p.vessel.serviceSpeed) > 0) speed.value = p.vessel.serviceSpeed;
      const fuels = p.carriers.filter(c => c.category !== "battery" && c.category !== "consumable");
      if (!carrier.value && fuels.length === 1) carrier.value = fuels[0].id;
      const selected = fuels.find(c => c.id === carrier.value);
      if (!rate.value.trim() && selected?.primaryUnit === "m3" && Number(p.operational.fuelDay) > 0) rate.value = Number(p.operational.fuelDay) / 24;
      captureRoute(); invalidateRoute();
      announce(lang === "nb" ? "Ledige felter er oppdatert fra skipsprofilen." : "Empty fields were filled from the vessel profile.");
    };
    $$("[data-layer-group]").forEach(button => button.onclick = () => {
      const items = $$("[data-category]").filter(input => input.dataset.category === button.dataset.layerGroup);
      const enabled = !items.every(input => input.checked);
      items.forEach(input => input.checked = enabled);
      button.textContent = enabled ? (lang === "nb" ? "Slå av" : "Hide all") : (lang === "nb" ? "Slå på" : "Show all");
      drawAreas();
    });
    for (const [id, mode] of [["map-draw", "route"], ["map-inspect", "inspect"]])
      $("#" + id).onclick = () => {
        captureRoute();
        mapMode = mode;
        $("#map-draw").setAttribute("aria-pressed", String(mode === "route"));
        $("#map-inspect").setAttribute("aria-pressed", String(mode === "inspect"));
        $("#map-mode-hint").textContent = lang === "nb" ? (mode === "route" ? "Klikk i kartet for å legge til veipunkter. Dra punktene for å justere ruten." : "Klikk et farget område for å se reglene.") : (mode === "route" ? "Click the map to add waypoints. Drag points to adjust the route." : "Click a coloured area to view its rules.");
        map?.closePopup();
        detailLayer?.remove(); detailLayer = null;
        drawAreas();
      };
    $("#quick-analyze").onclick = () => $("#analyze-route").click();
    $("#undo-waypoint").onclick = () => { captureRoute(); if (!routeState.points.length) return; routeState.points.pop(); renderWaypoints(); invalidateRoute(); };
    $("#layer-search").oninput = (event) => {
      const term = event.target.value.trim().toLocaleLowerCase();
      $$(".layer-list label").forEach(label => label.hidden = !label.textContent.toLocaleLowerCase().includes(term));
      $$(".layer-list h3").forEach(heading => { let node = heading.nextElementSibling, visible = false; while (node && node.tagName !== "H3") { if (!node.hidden) visible = true; node = node.nextElementSibling; } heading.hidden = !visible; });
    };
    $("#fit-route").onclick = fitRoute;
    $("#world-view").onclick = () =>
      map?.setView([35, 0], 2, { animate: false });
    for (const selector of [
      "[name=routeName]",
      "[name=departure]",
      "[name=speed]",
      "[name=carrierId]",
      "[name=fuelRate]",
      "[name=soxFactor]",
      "[name=soxSource]",
      "[name=voyageNox]",
      "[name=changeoverHours]",
      "[name=changeoverSource]",
      "#voyage-loads input",
    ])
      $$("#voyage " + selector).forEach((el) =>
        el.addEventListener("input", () => {
          captureRoute();
          invalidateRoute();
          if (el.name === "departure") {
            const date = routeState.departure.slice(0, 10);
            if (date) {
              $("[name=mapDate]").value = date;
              updateLayerLabels();
              drawAreas();
            }
          }
        }),
      );
    $("#add-waypoint").onclick = () => {
      captureRoute();
      if (routeState.points.length >= 1000) return;
      routeState.points.push(["", ""]);
      renderWaypoints();
      invalidateRoute();
    };
    $("#route-file").onchange = async (event) => {
      try {
        const f = event.target.files[0];
        if (!f) return;
        if (f.size > IO.MAX) throw Error("Route files must be at most 2 MB.");
        captureRoute();
        routeState.points = IO.decode(await f.text(), f.name);
        renderWaypoints();
        invalidateRoute();
        fitRoute();
        announce(t("routeImported"));
      } catch (e) {
        announce(errorText(e), true);
      } finally {
        event.target.value = "";
      }
    };
    $("#nav-route").onclick = () => {
      try {
        captureRoute();
        routeState.points = IO.clean(P.route());
        renderWaypoints();
        invalidateRoute();
        fitRoute();
        announce(t("routeImported"));
      } catch (e) {
        announce(errorText(e), true);
      }
    };
    $("#export-route").onclick = () => {
      try {
        captureRoute();
        download(
          "marine-tools-route.geojson",
          IO.geojson(routePoints(), routeState.name),
          "application/geo+json",
        );
      } catch (e) {
        announce(errorText(e), true);
      }
    };
    $("#save-plan").onclick = () => {
      try {
        captureRoute();
        routePoints();
        if (!routeState.name.trim()) throw Error(t("nameRequired"));
        const plans = planList(),
          same = plans.find((p) => p.id === routeState.id),
          id = same?.id || crypto.randomUUID(),
          plan = {
            ...routeState,
            id,
            schemaVersion: 1,
            savedAt: new Date().toISOString(),
          };
        if (same) plans[plans.indexOf(same)] = plan;
        else {
          if (plans.length >= 50)
            throw Error(
              lang === "nb"
                ? "Maksimalt 50 planer kan lagres."
                : "At most 50 plans can be saved.",
            );
          plans.unshift(plan);
        }
        localStorage.setItem("mt.regulatory.plans.v1", JSON.stringify(plans));
        routeState.id = id;
        renderVoyage();
        announce(t("saved"));
      } catch (e) {
        announce(errorText(e), true);
      }
    };
    $("#open-plan").onclick = () => {
      try {
        const p = planList().find((x) => x.id === $("[name=savedPlan]").value);
        if (!p) return;
        IO.clean(p.points.map((c) => c.map(Number)));
        routeState = { ...p };
        routeResult = null;
        renderVoyage();
        fitRoute();
      } catch (e) {
        announce(errorText(e), true);
      }
    };
    $("#delete-plan").onclick = () => {
      const id = $("[name=savedPlan]").value;
      if (!id) return;
      localStorage.setItem(
        "mt.regulatory.plans.v1",
        JSON.stringify(planList().filter((p) => p.id !== id)),
      );
      if (routeState.id === id) delete routeState.id;
      renderVoyage();
      announce(t("saved"));
    };
    $("#use-daily").onclick = () => {
      try {
        const p = P.profile(),
          carrier = p.carriers.find(
            (c) => c.id === $("[name=carrierId]").value,
          );
        if (
          !carrier ||
          carrier.primaryUnit !== "m3" ||
          p.operational.fuelDay == null
        )
          throw Error(
            lang === "nb"
              ? "Velg et drivstoff med m³ som primærenhet og oppgi døgnforbruk i fartøyprofilen."
              : "Choose a fuel with m³ as its primary unit and enter daily consumption in Vessel Profile.",
          );
        $("[name=fuelRate]").value =
          N.numeric(p.operational.fuelDay, t("amount")) / 24;
        captureRoute();
        invalidateRoute();
      } catch (e) {
        announce(errorText(e), true);
      }
    };
    $("#analyze-route").onclick = analyzeRoute;
    $("[name=mapDate]").onchange = () => {
      updateLayerLabels();
      drawAreas();
    };
    $$("[data-layer]").forEach((el) => (el.onchange = () => {
      const button = $$("[data-layer-group]").find(b => b.dataset.layerGroup === el.dataset.category);
      const any = $$("[data-category]").some(input => input.dataset.category === el.dataset.category && input.checked);
      if (button) button.textContent = any ? (lang === "nb" ? "Slå av" : "Hide all") : (lang === "nb" ? "Slå på" : "Show all");
      drawAreas();
    }));
    $("[name=baseMap]").onchange = toggleBase;
  }
  let overviewData = null,
    worldData = null,
    areaLayers = [],
    routeLayer = null,
    baseLayer = null,
    waypointLayer = null,
    entryLayer = null;
  async function initMap() {
    if (map || !$("#reg-map") || $("#voyage").hidden) return;
    map = L.map("reg-map", {
      worldCopyJump: true,
      minZoom: 1,
      maxZoom: 15,
      zoomControl: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([35, 0], 2);
    L.control
      .zoom({
        zoomInTitle: lang === "nb" ? "Zoom inn" : "Zoom in",
        zoomOutTitle: lang === "nb" ? "Zoom ut" : "Zoom out",
      })
      .addTo(map);
    map.attributionControl.setPrefix("Leaflet");
    map.attributionControl.addAttribution(
      "VLIZ / Marine Regions · CC-BY · IMO legal coordinates",
    );
    map.on("moveend", scheduleDetails);
    map.on("click", (event) => {
      if (mapMode !== "route") return;
      captureRoute();
      if (routeState.points.length >= 1000) return;
      const c = event.latlng.wrap();
      routeState.points.push([
        Number(c.lng.toFixed(6)),
        Number(c.lat.toFixed(6)),
      ]);
      renderWaypoints();
      invalidateRoute();
    });
    try {
      const instance = map;
      if (!worldData)
        worldData = await fetchJson("regulatory/data/world-overview.json");
      if (map !== instance) return;
      L.geoJSON(worldData, {
        interactive: false,
        style: {
          fillColor: "#c7dce6",
          fillOpacity: 1,
          color: "#94afba",
          weight: 0.5,
        },
      }).addTo(map);
      if (!overviewData)
        overviewData = await fetchJson("regulatory/data/overview.json");
      if (map !== instance) return;
      drawAreas();
      drawRoute();
      map.invalidateSize();
    } catch (e) {
      announce(errorText(e), true);
    }
  }
  async function fetchJson(path) {
    const r = await fetch(path, { credentials: "same-origin" });
    if (!r.ok) throw Error("REGULATORY_DATA_UNAVAILABLE");
    return r.json();
  }
  function updateLayerLabels() {
    const d = $("[name=mapDate]").value;
    for (const a of catalogue.areas) {
      try {
        const r = R.evaluate(
          a,
          d,
          { ...P.profile().vessel, engines: P.profile().engines },
          catalogue,
        );
        $("#layer-status-" + a.id).textContent =
          status(r.status) +
          " · " +
          (r.sulphurBasis === "eca" ? "ECA: " : "") +
          fmt(r.sulphurPercent) +
          "%";
      } catch {
        $("#layer-status-" + a.id).textContent = t("unknown");
      }
    }
  }
  function geometryForArea(area) {
    const id = area.geometryId || area.id,
      feature = overviewData?.features.find((f) => f.properties.id === id);
    if (feature) return feature.geometry;
    if (id === "antarctic-special" || id === "antarctic-polar")
      return {
        type: "Polygon",
        coordinates: [
          [
            [-180, -60],
            [-180, -90],
            [180, -90],
            [180, -60],
            [-180, -60],
          ],
        ],
      };
    return null;
  }
  function areaLayer(area, geometry, detailed = false) {
    const date = $("[name=mapDate]").value,
      rule = R.evaluate(
        area,
        date,
        { ...P.profile().vessel, engines: P.profile().engines },
        catalogue,
      ),
      colors = {
        emissions: "#078f9d",
        discharge: "#3871bd",
        pssa: "#cc4e9b",
        polar: "#65717c",
        national: "#c56c20",
      },
      color =
        rule.status === "adopted-future"
          ? "#a56de0"
          : rule.status === "transitional"
            ? "#b27809"
            : colors[area.category];
    return L.geoJSON(
      { type: "Feature", properties: { id: area.id }, geometry },
      {
        interactive: mapMode === "inspect",
        style: {
          color,
          weight: detailed ? 2 : 1.3,
          fillColor: color,
          fillOpacity: 0.1,
          dashArray: rule.status === "active" ? null : "5 4",
        },
      },
    ).bindPopup(
      `<strong>${esc(area.name[lang])}</strong><p>${esc(status(rule.status))}<br>${t("sulphur")}: ${fmt(rule.sulphurPercent)}%${area.sulphurFrom ? "<br>" + t("sulphurDate") + ": " + area.sulphurFrom : ""}</p>${rule.geographyWarning ? '<p class="notice warning">' + esc(rule.geographyWarning[lang]) + "</p>" : ""}${(rule.requirements || []).map((r) => "<p>" + esc(status(r.status)) + " · " + esc(r.summary[lang]) + "</p>").join("")}<small>${detailed ? (lang === "nb" ? "Detaljert referansegrense. Kontroller kystnære passeringer." : "Detailed reference boundary. Verify near-coastal crossings.") : t("overview")}</small>`,
    );
  }
  function drawAreas() {
    if (!map || !overviewData) return;
    areaLayers.forEach((layer) => layer.remove());
    areaLayers = [];
    for (const a of catalogue.areas) {
      if (!$("[data-layer=" + a.id + "]")?.checked) continue;
      const geometry = geometryForArea(a);
      if (geometry) areaLayers.push(areaLayer(a, geometry).addTo(map));
    }
    routeLayer?.bringToFront();
    scheduleDetails();
  }
  let detailWorker = null,
    detailLayer = null,
    detailTimer = null;
  function scheduleDetails() {
    clearTimeout(detailTimer);
    detailWorker?.terminate();
    detailWorker = null;
    if (!map || map.getZoom() < 7) {
      detailLayer?.remove();
      detailLayer = null;
      if ($("#map-detail-status"))
        $("#map-detail-status").textContent = t("mapDetailZoom");
      return;
    }
    detailTimer = setTimeout(() => {
      if (!map) return;
      const instance = map,
        bounds = map.getBounds(),
        ids = $$("[data-layer]:checked").map((e) => e.dataset.layer);
      detailWorker = new Worker("regulatory/route-worker.js");
      const worker = detailWorker;
      worker.onmessage = (event) => {
        if (event.data.progress !== undefined) return;
        worker.terminate();
        if (detailWorker === worker) detailWorker = null;
        if (map !== instance) return;
        if (!event.data.mapFeatures) {
          $("#map-detail-status").textContent =
            event.data.error === "MAP_VIEW_TOO_WIDE"
              ? t("mapDetailZoom")
              : t("mapDetailUnavailable");
          return;
        }
        $("#map-detail-status").textContent = t("mapDetailLoaded");
        detailLayer?.remove();
        detailLayer = L.featureGroup().addTo(map);
        for (const feature of event.data.mapFeatures) {
          const a = catalogue.areas.find((a) => a.id === feature.properties.id);
          if (a && $("[data-layer=" + a.id + "]")?.checked)
            areaLayer(a, feature.geometry, true).addTo(detailLayer);
        }
        routeLayer?.bringToFront();
        waypointLayer?.bringToFront();
      };
      worker.onerror = () => {
        worker.terminate();
        if ($("#map-detail-status"))
          $("#map-detail-status").textContent = t("mapDetailUnavailable");
      };
      worker.postMessage({
        action: "map",
        bounds: [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ],
        ids,
      });
    }, 250);
  }

  function displayLine(points) {
    let last = null;
    return points.map(([lon, lat]) => {
      if (last !== null) lon = last + MT_NAV_MATH.delta(last, lon);
      last = lon;
      return [lat, lon];
    });
  }
  function drawRoute() {
    if (!map) return;
    routeLayer?.remove();
    waypointLayer?.remove();
    entryLayer?.remove();
    routeLayer = L.featureGroup().addTo(map);
    waypointLayer = L.featureGroup().addTo(map);
    entryLayer = L.featureGroup().addTo(map);
    const points = routeState.points.map(([lon, lat]) => [Number(lon), Number(lat)]);
    if (!points.length || routeState.points.some(([lon, lat]) => String(lon).trim() === "" || String(lat).trim() === "") || points.some(([lon, lat]) => !Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90)) return;
    if (routeResult) {
      for (const [i, segment] of routeResult.segments.entries()) {
        const coords = [
          segment.from,
          ...sliceGeometry(routeResult, segment.fromNm, segment.toNm),
          segment.to,
        ];
        const layer = L.polyline(displayLine(coords), {
          color:
            segment.areaIds.length > 1
              ? "#e73b89"
              : segment.areaIds.length
                ? "#f18439"
                : "#d5a42f",
          weight: 5,
        }).addTo(routeLayer);
        layer.on("click", () => selectSegment(i));
        if (i > 0) {
          const before = new Set(routeResult.segments[i - 1].areaIds), after = new Set(segment.areaIds);
          const entered = [...after].filter(id => !before.has(id)), exited = [...before].filter(id => !after.has(id));
          if (entered.length || exited.length) {
            const label = [(entered.length ? (lang === "nb" ? "Inn: " : "Enter: ") + entered.map(areaName).join(", ") : ""), (exited.length ? (lang === "nb" ? "Ut: " : "Exit: ") + exited.map(areaName).join(", ") : "")].filter(Boolean).join(" · ");
            L.circleMarker([segment.from[1], segment.from[0]], {radius: 6, color: "#fff", weight: 2, fillColor: entered.length ? "#008f77" : "#cf6a20", fillOpacity: 1})
              .bindTooltip(esc(label)).addTo(entryLayer).on("click", () => selectSegment(i));
          }
        }
      }
    } else if (points.length > 1) {
      try {
        const route = MT_REGULATORY_GEO?.route(points);
        L.polyline(
          displayLine(
            route
              ? route.segments
                  .map((p) => p.from)
                  .concat([route.segments.at(-1).to])
              : points,
          ),
          { color: "#f18439", weight: 4 },
        ).addTo(routeLayer);
      } catch {
        L.polyline(displayLine(points), {
          color: "#f18439",
          weight: 3,
          dashArray: "5 5",
        }).addTo(routeLayer);
      }
    }
    displayLine(points).forEach((p, i) => {
      const marker = L.marker(p, {
        draggable: true,
        icon: L.divIcon({className: "reg-waypoint-icon " + (i === 0 ? "departure" : i === points.length - 1 ? "destination" : "intermediate"), html: '<span>' + (i + 1) + '</span>', iconSize: [28, 28], iconAnchor: [14, 14]})
      }).bindTooltip(String(i + 1)).addTo(waypointLayer);
      marker.on("click", e => L.DomEvent.stopPropagation(e));
      marker.on("dragend", () => {
        captureRoute();
        const c = marker.getLatLng().wrap();
        routeState.points[i] = [Number(c.lng.toFixed(6)), Number(c.lat.toFixed(6))];
        renderWaypoints(); invalidateRoute();
      });
    });
  }
  function sliceGeometry(result, from, to) {
    const a = result.cumulativeNm,
      lower = (v) => {
        let l = 0,
          h = a.length;
        while (l < h) {
          const m = Math.floor((l + h) / 2);
          if (a[m] <= v) l = m + 1;
          else h = m;
        }
        return l;
      };
    return result.geometry.slice(lower(from), lower(to - 1e-8));
  }
  function fitRoute() {
    if (!map) return;
    try {
      const bounds = L.latLngBounds(displayLine(routePoints()));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10, animate: false });
    } catch {}
  }
  function toggleBase() {
    if (baseLayer) {
      baseLayer.remove();
      baseLayer = null;
    }
    if (!$("[name=baseMap]").checked) return;
    if (window.MT_APP_PREVIEW) {
      $("[name=baseMap]").checked = false;
      announce(t("mapOffline"));
      return;
    }
    baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    baseLayer.bringToBack();
  }

  function analyzeRoute() {
    try {
      captureRoute();
      const points = routePoints(),
        speed = N.numeric(routeState.speed, t("speed"), {
          min: 0.01,
          max: 100,
        }),
        departure = routeState.departure + "Z",
        context = chargeContext();
      if (!Number.isFinite(Date.parse(departure)))
        throw Error("Invalid departure calendar date.");
      const p = P.profile();
      if (window.__regWorker) window.__regWorker.terminate();
      routeResult = null;
      $("#route-results").replaceChildren();
      $("#analyze-route").disabled = true;
      $("#route-progress").textContent = t("loading");
      const worker = new Worker("regulatory/route-worker.js");
      window.__regWorker = worker;
      worker.onerror = () => {
        worker.terminate();
        window.__regWorker = null;
        $("#analyze-route").disabled = false;
        announce(t("failed"), true);
      };
      worker.onmessage = (event) => {
        if (event.data.progress !== undefined) {
          $("#route-progress").textContent =
            t("loading") + " " + event.data.progress + "/" + event.data.total;
          return;
        }
        worker.terminate();
        window.__regWorker = null;
        $("#analyze-route").disabled = false;
        if (event.data.error) {
          announce(errorText(new Error(event.data.error)), true);
          $("#route-progress").textContent = "";
          return;
        }
        try {
          const result = event.data.result;
          result.plan = structuredClone(routeState);
          result.vessel = structuredClone({ ...p.vessel, engines: p.engines });
          result.chargeContext = context;
          result.consumption = MT_VOYAGE_ENVIRONMENT.consumption(result, {
            rate: routeState.fuelRate,
            carrier: p.carriers.find((c) => c.id === routeState.carrierId),
          });
          result.sox = MT_VOYAGE_ENVIRONMENT.sulphurOxides(result.consumption, {
            factorKgT: routeState.soxFactor,
            source: routeState.soxSource,
          });
          result.changeovers = MT_VOYAGE_ENVIRONMENT.changeovers(result, {
            hours: routeState.changeoverHours,
            source: routeState.changeoverSource,
          });
          if (routeState.voyageNox) {
            try {
              result.nox = MT_VOYAGE_ENVIRONMENT.emissions(result, {
                profile: p,
                loads: routeState.loads,
                chargeContext: context,
              });
            } catch (error) {
              result.noxUnavailable = errorText(error);
            }
          }
          routeResult = result;
          $("#route-progress").textContent = "";
          $("#message").textContent = "";
          renderRouteResult();
          drawRoute();
          fitRoute();
        } catch (e) {
          announce(errorText(e), true);
        }
      };
      worker.postMessage({
        points,
        options: {
          departure,
          speedKn: speed,
          additionalTransitions: [context.fund.joined, context.fund.until]
            .filter(Boolean)
            .map((d) => N.date(d) + "T00:00:00Z"),
        },
        vessel: { ...p.vessel, engines: p.engines },
      });
    } catch (e) {
      $("#analyze-route").disabled = false;
      announce(errorText(e), true);
    }
  }
  function pointText(point) {
    return `${fmt(point[1], 5)}°, ${fmt(point[0], 5)}°`;
  }
  function dateText(value) {
    return (
      new Date(value).toLocaleString(lang === "nb" ? "nb-NO" : "en-GB", {
        timeZone: "UTC",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " UTC"
    );
  }
  function areaName(id) {
    return catalogue.areas.find((a) => a.id === id)?.name[lang] || id;
  }
  function rulesText(segment) {
    return (
      segment.rules
        .map((rule) => {
          const a = catalogue.areas.find((a) => a.id === rule.areaId);
          return `<div><strong>${esc(a?.name[lang] || rule.areaId)}</strong> <span class="tag">${esc(status(rule.status))}</span><small>${a?.category==="emissions"||rule.sulphurBasis==="national"?t("sulphur")+": "+fmt(rule.sulphurPercent)+"% · "+(rule.sulphurBasis==="eca"?"ECA":rule.sulphurBasis==="national"?(lang==="nb"?"Nasjonalt":"National"):(lang==="nb"?"Globalt":"Global"))+"<br>":""}NOx: ${esc(status(rule.nox?.status))}${rule.nox?.construction ? " · " + esc(reason(rule.nox.construction.reason)) : ""}</small>${
            rule.nox?.engines
              ?.filter(
                (e) =>
                  e.status === "tier-iii-required" ||
                  e.status === "unconfirmed",
              )
              .map(
                (e) =>
                  `<small>${esc(e.name)}: ${esc(status(e.status))}${e.evidence ? " · " + esc(reason(e.evidence)) : ""}</small>`,
              )
              .join("") || ""
          }${rule.geographyWarning ? '<p class="notice warning">' + esc(rule.geographyWarning[lang]) + "</p>" : ""}${(rule.requirements || []).map((r) => `<p><span class="tag">${esc(status(r.status))} · ${esc(status(r.vesselApplicability))}</span> ${esc(r.summary[lang])}${r.status === "adopted-future" ? "<small>" + r.from + "</small>" : ""}</p>`).join("")}<small>${(
            a?.sources || []
          )
            .map((id) => {
              const source = catalogue.sources.find((s) => s.id === id);
              return source ? safeLink(source.url, source.title) : "";
            })
            .join(" · ")} · ${t("verify")}: ${rule.verifiedOn}</small></div>`;
        })
        .join("") ||
      `<strong>${t("outsideMapped")}</strong><small>${t("sulphur")}: ${fmt(segment.globalSulphurPercent)}%<br>${t("globalOnly")}</small>`
    );
  }
  function vesselSummary(vessel) {
    const fields = [
      [t("vesselName"), vessel.name], [t("flag"), vessel.flag],
      [t("shipType"), vessel.shipType ? t(vessel.shipType) : null],
      [t("gross"), vessel.grossTonnage], [t("keel"), vessel.keelDate],
      [t("contract"), vessel.contractDate], [t("delivery"), vessel.deliveryDate],
      [t("egcs"), vessel.egcsReference], [t("exemption"), vessel.exemptionClaim],
    ];
    return `<details class="panel" open><summary>${t("profile")}</summary><dl class="vessel-summary">${fields.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value ?? t("unknown"))}</dd></div>`).join("")}</dl>${(vessel.engines || []).map(e => `<p><strong>${esc(e.name)}</strong> · ${fmt(e.ratedKw)} kW · ${esc(t("tier"))}: ${esc(e.tier || t("unknown"))}<br>${t("eiapp")}: ${esc(e.eiappSource || t("unknown"))}</p>`).join("")}<p class="muted">${t("approvedEquivalent")}</p></details>`;
  }

  function reportMap(result) {
    if (!overviewData) return `<p>${t("mapDetailUnavailable")}</p>`;
    const route = displayLine(result.geometry).map(([lat, lon]) => [lon, lat]);
    let west=Infinity,east=-Infinity,south=Infinity,north=-Infinity;
    for (const [lon,lat] of route) {west=Math.min(west,lon);east=Math.max(east,lon);south=Math.min(south,lat);north=Math.max(north,lat);}
    const global = east-west>360;
    if (global) {west=-180;east=180;}
    const padX=Math.max(.05,(east-west)*.08),padY=Math.max(.05,(north-south)*.1);
    west-=padX;east+=padX;south=Math.max(-90,south-padY);north=Math.min(90,north+padY);
    const width=900,height=420,padding=26,center=(west+east)/2,scale=Math.min((width-2*padding)/(east-west),(height-2*padding)/(north-south));
    const left=(width-(east-west)*scale)/2,top=(height-(north-south)*scale)/2;
    function project(point) {let [lon,lat]=point;lon+=360*Math.round((center-lon)/360);return[left+(lon-west)*scale,top+(north-lat)*scale];}
    function path(points,close=false) {let previous=null,out="";for(const point of points){const xy=project(point);out+=(previous&&Math.abs(xy[0]-previous[0])<=180*scale?"L":"M")+xy.map(v=>v.toFixed(2)).join(" ");previous=xy;}return out+(close?"Z":"");}
    function geometryPath(geometry) {const polygons=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];return polygons.flatMap(poly=>poly.map(ring=>path(ring,true))).join("");}
    const coast=(worldData?.features||[]).map(f=>`<path d="${geometryPath(f.geometry)}" fill="none" stroke="#b1bec7" stroke-width=".5"/>`).join("");
    const touched=new Set(result.segments.flatMap(s=>s.areaIds)),colors={emissions:"#148c9e",discharge:"#3c70b4",pssa:"#b84487",polar:"#777777",national:"#be6b24"};
    const boundaries=catalogue.areas.filter(a=>touched.has(a.id)).map(a=>{let geometry=geometryForArea(a);if(!geometry)return"";if(a.id.startsWith('antarctic-'))geometry={type:'Polygon',coordinates:[[[west,-60],[east,-60],[east,-90],[west,-90],[west,-60]]]};return `<path d="${geometryPath(geometry)}" fill="${colors[a.category]}" fill-opacity=".07" fill-rule="evenodd" stroke="${colors[a.category]}" stroke-width="1"/>`;}).join("");
    const legs=result.segments.map(s=>`<path d="${path([s.from,...sliceGeometry(result,s.fromNm,s.toNm),s.to])}" fill="none" stroke="${s.areaIds.length>1?'#bd286e':'#cf6c24'}" stroke-width="2.5"/>`).join("");
    const markers=result.segments.map((s,i)=>{const xy=project(s.from);return `<circle cx="${xy[0].toFixed(2)}" cy="${xy[1].toFixed(2)}" r="3" fill="#fff" stroke="#173d55"/>${result.segments.length<=50?`<text x="${(xy[0]+5).toFixed(2)}" y="${(xy[1]-5).toFixed(2)}" font-size="11" fill="#173d55">${i+1}</text>`:''}`;}).join("");
    return `<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('voyage'))}" style="width:100%;height:auto;background:#f5f8fa;border:1px solid #9aabb8"><defs><clipPath id="voyage-map-clip"><rect x="${padding}" y="${padding}" width="${width-2*padding}" height="${height-2*padding}"/></clipPath></defs><g clip-path="url(#voyage-map-clip)">${coast}${boundaries}${legs}${markers}</g><text x="12" y="17" font-size="11" fill="#173d55">N ↑ · WGS84 · ${esc(t('routeOverview'))}</text><text x="12" y="${height-10}" font-size="10" fill="#173d55">VLIZ / Marine Regions · CC-BY · IMO / national legal sources</text></svg><figcaption>${esc(t('overview'))}</figcaption></figure>`;
  }

  function exportReport(host, name, mapMarkup="") {
    const copy=host.cloneNode(true);
    copy.querySelectorAll('button,.actions,.no-print').forEach(e=>e.remove());
    copy.querySelectorAll('details').forEach(e=>e.open=true);
    const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><title>${esc(name)} · Marine Tools</title><style>body{font:13px/1.5 system-ui;color:#172b39;margin:24px}h1{font-size:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #b8c6cf;padding:7px;text-align:left;vertical-align:top}small{display:block;color:#435969}a{color:#14557a}details,.panel{margin:1rem 0}dd{margin:0 0 .5rem}svg{max-height:450px}.notice{border-left:3px solid #ba862a;padding:8px}.metric{display:inline-block;min-width:150px;margin:8px}.metric strong{display:block;font-size:22px}.vessel-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tag{font-size:11px}.table-wrap{overflow:visible}@page{size:A4 landscape;margin:12mm}@media(max-width:650px){.vessel-summary{grid-template-columns:1fr}.table-wrap{overflow:auto}}@media print{body{margin:0;font-size:9pt}table{font-size:8pt}}</style></head><body><h1>Marine Tools · ${esc(name)}</h1><p>${esc(t('limits'))}</p>${mapMarkup}${copy.innerHTML}</body></html>`;
    download('marine-tools-'+(host.id==='nox-result'?'nox':'voyage')+'-report.html',html,'text/html');
  }

  function renderRouteResult() {
    const x = routeResult;
    if (!x) return;
    $("#route-results").innerHTML =
      `<article class="panel"><h3>${t("routeOverview")} · ${esc(x.plan.name || "Marine Tools")}</h3><p>${esc(x.vessel.name || t("unknown"))} · ${dateText(x.segments[0].entry)}</p><div class="results"><div class="metric">${t("distance")}<strong>${fmt(x.totalNm)}</strong></div><div class="metric">${t("duration")}<strong>${fmt(x.totalHours)}</strong></div><div class="metric">${t("arrival")}<strong style="font-size:1rem">${dateText(x.arrival)}</strong></div>${x.consumption ? `<div class="metric">${t("consumption")}<strong>${fmt(x.consumption.totalAmount)} ${esc(x.consumption.unit)}</strong>${esc(x.consumption.carrierName)}</div>` : ""}${x.sox ? `<div class="metric">SO₂<strong>${fmt(x.sox.totalKgSO2)} kg</strong>${t("estimated")}</div>` : ""}${x.nox ? `<div class="metric">NOx<strong>${fmt(x.nox.kgNOx)} kg</strong>${t("estimated")}</div><div class="metric">${t("total")}<strong>${fmt(x.nox.totalNok)}</strong></div>` : ""}</div><p class="muted">${t("sourceDate")}: ${esc(x.catalogueVersion)} / ${x.verifiedOn}</p>${x.missingGeometry.length ? `<p class="error">${t("missingGeometry")}: ${x.missingGeometry.map(areaName).map(esc).join(", ")}</p>` : ""}${x.noxUnavailable ? `<p class="notice warning">NOx: ${esc(x.noxUnavailable)}</p>` : ""}<p class="notice warning">${t("fullCoverageWarning")}</p></article>${vesselSummary(x.vessel)}<section id="report-map" class="print-map"></section><h3>${t("areaOverview")}</h3><p>${t("allOverlap")}</p><div class="table-wrap"><table id="route-table"><thead><tr><th>#</th><th>${t("entry")} / ${t("exit")}</th><th>${t("positionEntry")} / ${t("positionExit")}</th><th>${t("distance")} / ${t("duration")}</th><th>${t("areas")}</th>${x.consumption ? `<th>${t("consumption")}</th>` : ""}${x.nox ? `<th>NOx / NOK</th>` : ""}</tr></thead><tbody>${x.segments.map((s, i) => `<tr data-segment-row="${i}"><td><button class="no-print" data-segment="${i}" aria-label="${esc(t("selectSegment") + " " + (i + 1))}">${i + 1}</button><span class="print-map">${i + 1}</span></td><td>${dateText(s.entry)}<small>${dateText(s.exit)}</small></td><td>${pointText(s.from)}<small>${pointText(s.to)}</small></td><td>${fmt(s.distanceNm)} NM<small>${fmt(s.hours)} h</small><small>${t("sulphur")}: ${fmt(MT_VOYAGE_ENVIRONMENT.limit(s))}%</small></td><td>${rulesText(s)}</td>${x.consumption ? `<td>${fmt(x.consumption.segments[i].amount)} ${esc(x.consumption.unit)}${x.consumption.segments[i].massKg == null ? "" : `<small>${fmt(x.consumption.segments[i].massKg)} kg</small>`}</td>` : ""}${x.nox ? `<td>${fmt(x.nox.segments[i].kgNOx)} kg<small>${fmt(x.nox.segments[i].totalNok)} NOK</small></td>` : ""}</tr>`).join("")}</tbody></table></div>${x.changeovers.length ? `<article class="panel"><h3>${t("switching")}</h3><p>${t("switchNote")}</p>${x.changeovers.map((e) => `<p><strong>${e.areaIds.map(areaName).map(esc).join(" · ")}: ${fmt(e.fromLimit)}% → ${fmt(e.toLimit)}%</strong><br>${t("entry")}: ${dateText(e.entry)} · ${pointText(e.entryPosition)}<br>${t("switchLimit")}: ${dateText(e.latestStart)}${e.startPosition ? " · " + pointText(e.startPosition) : " · " + t("beforeDeparture")}<br>${t("source")}: ${esc(e.source)}</p>`).join("")}</article>` : x.plan.changeoverHours ? `<p>${t("noSwitch")}</p>` : ""}<article class="panel"><h3>${t("reference")}</h3><p>${t("limits")}</p>${x.limitations[lang].map((p) => `<p>${esc(p)}</p>`).join("")}<p>${t("separateTax")}</p>${x.sox ? "<p>SO₂: " + esc(t("soxSource")) + ": " + esc(x.sox.source) + " · " + fmt(x.sox.factorKgT) + " kg/t</p>" : ""}${x.nox ? `<p>${t("estimateOnly")}</p><p>${t("chargeContext")}: ${esc(reason(x.nox.segments[0]?.items[0]?.charges.assessment.reason))}</p>` : ""}<div class="actions"><button id="route-csv">${t("csv")}</button><button id="route-json">${t("json")}</button><button id="route-html">${lang==="nb"?"Last ned rapport":"Download report"}</button><button id="route-print">${t("print")}</button></div></article>`;
    const affected = [...new Set(x.segments.flatMap(s => s.areaIds))];
    const uncertain = x.segments.filter(s => s.rules.some(r => r.nox?.status === "unconfirmed" || (r.requirements || []).some(q => q.vesselApplicability === "unconfirmed"))).length;
    $("#route-results").insertAdjacentHTML("afterbegin", `<article class="panel voyage-findings"><h3>${lang === "nb" ? "Viktigste funn" : "Key findings"}</h3><p>${lang === "nb" ? "Områder langs reisen" : "Areas along the voyage"}: <strong>${affected.length ? affected.map(areaName).map(esc).join(" · ") : esc(t("outsideMapped"))}</strong></p><p>${lang === "nb" ? "Strekninger med uavklart fartøyvurdering" : "Segments with unconfirmed vessel applicability"}: <strong>${uncertain}</strong></p><p class="muted">${t("fullCoverageWarning")}</p></article>`);
    $$("[data-segment]").forEach(
      (b) => (b.onclick = () => selectSegment(Number(b.dataset.segment))),
    );
    $("#route-json").onclick = () =>
      download(
        "marine-tools-voyage-regulatory.json",
        JSON.stringify(x, null, 2),
        "application/json",
      );
    $("#route-csv").onclick = () => {
      const header = [
        t("segment"),
        t("entry"),
        t("exit"),
        t("positionEntry"),
        t("positionExit"),
        t("distance"),
        t("duration"),
        t("areas"),
        t("sulphur"),
        t("taxStatus"),
        t("legal"),
        t("verify"),
        t("consumption") +
          " (" +
          (lang === "nb"
            ? "første rad per strekning"
            : "first row per segment") +
          ")",
        "NOx kg (first row per segment)",
        "NOK (first row per segment)",
      ];
      const rows = x.segments.flatMap((s, i) =>
        (s.rules.length ? s.rules : [null]).map((rule, j) => [
          i + 1,
          s.entry,
          s.exit,
          s.from.join(" "),
          s.to.join(" "),
          s.distanceNm,
          s.hours,
          rule ? areaName(rule.areaId) : t("outsideMapped"),
          rule?.sulphurPercent ?? s.globalSulphurPercent,
          rule?.nox?.status ?? "",
          (rule?.sources || ["imo-sox"])
            .map((id) => catalogue.sources.find((a) => a.id === id)?.url)
            .filter(Boolean)
            .join(" | "),
          x.verifiedOn,
          j === 0 ? (x.consumption?.segments[i].amount ?? null) : null,
          j === 0 ? (x.nox?.segments[i].kgNOx ?? null) : null,
          j === 0 ? (x.nox?.segments[i].totalNok ?? null) : null,
        ]),
      );
      download(
        "marine-tools-voyage-regulatory.csv",
        IO.csv([header, ...rows]),
        "text/csv",
      );
    };
    $("#route-html").onclick = () => exportReport($("#route-results"), t("voyage"), reportMap(x));
    $("#route-print").onclick = () => {
      $("#report-map").innerHTML = reportMap(x);
      document.querySelectorAll("details").forEach((d) => (d.open = true));
      map?.invalidateSize();
      window.print();
    };
  }
  function selectSegment(i) {
    const s = routeResult?.segments[i];
    if (!s) return;
    $$("[data-segment-row]").forEach((row) =>
      row.classList.toggle(
        "selected-segment",
        Number(row.dataset.segmentRow) === i,
      ),
    );
    $("#segment-detail").innerHTML =
      `<article class="panel"><h3>${t("segment")} ${i + 1}</h3><p>${dateText(s.entry)}<br>${dateText(s.exit)}</p><p>${pointText(s.from)} → ${pointText(s.to)}</p><p>${fmt(s.distanceNm)} NM · ${fmt(s.hours)} h</p>${rulesText(s)}</article>`;
    if (map)
      map.fitBounds(
        L.latLngBounds(
          displayLine([
            s.from,
            ...sliceGeometry(routeResult, s.fromNm, s.toNm),
            s.to,
          ]),
        ),
        { padding: [30, 30], maxZoom: 12, animate: false },
      );
  }

  function coverageHTML() {
    const missing={
      emissions:lang==='nb'?'Åtte første ECA-regioner. Andre lokale og havnespesifikke krav må kontrolleres.':'Eight initial ECA regions. Other local and port-specific requirements need separate review.',
      discharge:lang==='nb'?'Svartehavet, Rødehavet, Gulfs-området, Adenbukta, nordvesteuropeiske farvann, Oman-området, sørafrikanske farvann og det utvidede karibiske området.':'Black Sea, Red Sea, Gulfs area, Gulf of Aden, North-West European waters, Oman area, Southern South African waters and Wider Caribbean.',
      pssa:lang==='nb'?'Andre utpekte PSSA-er og deres individuelle vernetiltak.':'Other designated PSSAs and their individual protective measures.',
      polar:lang==='nb'?'Polarkodens arktiske grense og flaggspesifikk gjennomføring.':'Arctic Polar Code boundary and flag-specific implementation.',
      national:lang==='nb'?'California-sonen, kinesiske kyst- og innenlandssoner utenfor Hainan, koreanske havneområder, EU-havnekrav og andre nasjonale krav.':'California zone, Chinese mainland coastal and inland zones outside Hainan, Korean port areas, EU port requirements and other national requirements.'
    };
    return `<div class="table-wrap"><table><thead><tr><th>${t('layers')}</th><th>${lang==='nb'?'Kartlagt i dette datasettet':'Mapped in this dataset'}</th><th>${lang==='nb'?'Ikke ferdig geografisk kontrollert':'Not geographically audited'}</th></tr></thead><tbody>${Object.entries(catalogue.coverage).map(([key,value])=>`<tr><td>${t(key+'Layer')}</td><td>${(value.areas||[]).map(areaName).map(esc).join('<br>')}</td><td>${esc(missing[key])}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function otherFutureDates() {
    const records=new Map();
    for(const area of catalogue.areas)for(const rule of area.requirements||[])for(const kind of ['from','until']) {
      const date=rule[kind];if(!date||date<catalogue.verifiedOn)continue;
      const key=rule.code+kind+date;
      if(!records.has(key))records.set(key,{date,kind,rule,names:[]});
      records.get(key).names.push(area.name[lang]);
    }
    return `<article class="panel"><h3>${lang==='nb'?'Andre vedtatte innfasinger og utløpsdatoer':'Other adopted phase-ins and expiry dates'}</h3><div class="table-wrap"><table><thead><tr><th>${t('date')}</th><th>${t('areas')}</th><th>${t('reference')}</th></tr></thead><tbody>${[...records.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(r=>`<tr><td>${r.date}<small>${r.kind==='until'?(lang==='nb'?'Opphører fra denne datoen':'Expires from this date'):(lang==='nb'?'Gjelder fra denne datoen':'Applies from this date')}</small></td><td>${r.names.map(esc).join('<br>')}</td><td>${esc(r.rule.summary[lang])}</td></tr>`).join('')}</tbody></table></div></article>`;
  }
  function renderSources() {
    $("#sources").innerHTML =
      `<h2 id="sources-title">${t("sources")}</h2><article class="panel"><h3>${t("coverage")}</h3><p>${t("fullCoverageWarning")}</p><p>${t("verify")}: ${catalogue.verifiedOn} · ${esc(catalogue.version)}</p>${catalogue.limitations[lang].map((p) => `<p>${esc(p)}</p>`).join("")}${coverageHTML()}</article><article class="panel"><h3>${t("futureChanges")}</h3><p>${t("proposalNote")}</p><p>${t("noProposal")}</p><div class="table-wrap"><table><thead><tr><th>${t("areas")}</th><th>${t("designation")}</th><th>${t("sulphurDate")}</th><th>${t("noxDate")}</th><th>${t("futureTier")}</th></tr></thead><tbody>${catalogue.areas
        .map(
          (a) =>
            `<tr><td>${esc(a.name[lang])}</td><td>${a.designationFrom}</td><td>${a.sulphurFrom || "—"}</td><td>${a.noxFrom || "—"}</td><td>${
              a.construction
                ? Object.entries(a.construction)
                    .map(([k, v]) =>
                      esc(
                        {
                          keel: t("keel"),
                          contract: t("contract"),
                          noContractKeel: t("noContract") + " · " + t("keel"),
                          delivery: t("delivery"),
                        }[k] +
                          ": " +
                          v,
                      ),
                    )
                    .join("<br>")
                : "—"
            }</td></tr>`,
        )
        .join(
          "",
        )}</tbody></table></div></article>${otherFutureDates()}<article class="panel">${catalogue.sources.map((source) => `<div class="source-item"><h3>${safeLink(source.url, source.title)}</h3><p>${esc(sourceDescription(source))}</p><small>${t("verify")}: ${source.verifiedOn}${source.role ? " · " + (lang === "nb" ? "Supplerende sammenligningskilde" : "Secondary comparison source") : ""}</small></div>`).join("")}</article>`;
  }

  const statuses = {
    "outside-scope": [
      "Outside the recorded vessel criteria",
      "Utenfor registrerte fartøyskriterier",
    ],
    "potentially-applicable": [
      "Potentially applicable; verify operating conditions",
      "Kan gjelde; kontroller driftsvilkårene",
    ],
    measured: ["Measured", "Målt"],
    documented: ["Documented factor", "Dokumentert faktor"],
    "documented-factor": ["Documented factor", "Dokumentert faktor"],
    estimated: ["Estimate", "Estimat"],
    liable: ["Liable", "Avgiftspliktig"],
    outside: ["Outside scope", "Utenfor virkeområdet"],
    exempt: ["Exempt", "Fritatt"],
    unconfirmed: ["Unconfirmed", "Uavklart"],
    active: ["Active", "Gjeldende"],
    "adopted-future": ["Adopted future", "Vedtatt framtidig"],
    transitional: ["Transition", "Overgangsperiode"],
    "not-active": [
      "NOx area regime not active on this date",
      "NOx-områderegimet er ikke gjeldende på denne datoen",
    ],
    "not-applicable": ["Not applicable", "Ikke relevant"],
    "not-adopted": [
      "Proposal; no adopted obligation",
      "Forslag; ingen vedtatt plikt",
    ],
    proposed: ["Proposal", "Forslag"],
    "tier-iii-required": [
      "Tier III requirement identified",
      "Tier III-krav identifisert",
    ],
    "outside-engine-or-construction-scope": [
      "Outside recorded engine / construction criteria",
      "Utenfor registrerte motor- / byggekriterier",
    ],
    "outside-construction-cutoff": [
      "Built before the stated construction cutoff",
      "Bygget før oppgitt byggegrense",
    ],
    applies: ["Construction criteria met", "Byggekriterier er oppfylt"],
    excluded: [
      "Engine excluded by recorded scope",
      "Motor unntatt ut fra registrert virkeområde",
    ],
    unverified: ["Not verified", "Ikke verifisert"],
  };
  function status(k) {
    return statuses[k]?.[lang === "nb" ? 1 : 0] || t("unknown");
  }
  const reasons = {
    "engine-installation-history-missing": [
      "Engine installation and conversion history requires review.",
      "Motorens installasjons- og ombyggingshistorikk må kontrolleres.",
    ],
    "voyage-type-missing": ["Choose the voyage type.", "Velg reisetype."],
    "scope-not-verified-for-this-year": [
      "Automatic legal scope is not verified for this year.",
      "Automatisk juridisk virkeområde er ikke kontrollert for dette året.",
    ],
    "voyage-outside-scope": [
      "The stated voyage is outside Norwegian scope.",
      "Den oppgitte reisen faller utenfor norsk virkeområde.",
    ],
    "direct-voyage-conditions-unconfirmed": [
      "Direct-voyage exemption conditions are not confirmed.",
      "Vilkårene for fritak ved direkte utenriksreise er ikke bekreftet.",
    ],
    "direct-international-voyage": [
      "Documented direct international voyage exemption.",
      "Dokumentert fritak for direkte utenriksreise.",
    ],
    "documented-distant-water-fishing": [
      "Documented distant-water fishing exemption.",
      "Dokumentert fritak for fiske i fjerne farvann.",
    ],
    "outside-norwegian-jurisdiction": [
      "The stated operation is outside Norwegian jurisdiction.",
      "Oppgitt drift er utenfor norsk jurisdiksjon.",
    ],
    "jurisdiction-unconfirmed": [
      "Norwegian jurisdiction is unconfirmed.",
      "Norsk jurisdiksjon er uavklart.",
    ],
    "machinery-configuration-missing": [
      "Machinery configuration is missing.",
      "Maskinoppsett mangler.",
    ],
    "machinery-role-missing": [
      "Machinery role is missing.",
      "Maskineriets funksjon mangler.",
    ],
    "installed-capacity-threshold-exceeded": [
      "Certified capacity exceeds an applicable threshold; all emission sources must be included.",
      "Sertifisert kapasitet overstiger en relevant grense. Alle utslippskilder må inkluderes.",
    ],
    "thermal-configuration-unconfirmed": [
      "Thermal input and complete machinery configuration need confirmation.",
      "Tilført termisk effekt og fullstendig maskinoppsett må bekreftes.",
    ],
    "installed-capacity-threshold-not-exceeded": [
      "The checked configuration does not exceed the applicable capacity thresholds.",
      "Det kontrollerte oppsettet overstiger ikke de relevante kapasitetsgrensene.",
    ],
    "fund-membership-period-unconfirmed": [
      "Fund membership is not documented for this date.",
      "Fondstilknytning er ikke dokumentert for denne datoen.",
    ],
    "fund-participation-unconfirmed": [
      "Fund participation is unconfirmed.",
      "Fondstilknytning er uavklart.",
    ],
    "user-documented-applicability": [
      "User-documented legal applicability assessment.",
      "Brukerdokumentert vurdering av rettslig avgiftsplikt.",
    ],
    "keel-date": [
      "Keel / equivalent construction-stage date.",
      "Dato for kjølstrekk / tilsvarende byggetrinn.",
    ],
    "keel-date-missing": [
      "Construction-stage date is missing.",
      "Dato for byggetrinn mangler.",
    ],
    "construction-criteria-met": [
      "A stated construction trigger is met.",
      "Et oppgitt byggekriterium er oppfylt.",
    ],
    "construction-records-incomplete": [
      "Contract, keel or delivery records are incomplete.",
      "Opplysninger om kontrakt, kjølstrekk eller levering er ufullstendige.",
    ],
    "construction-before-cutoffs": [
      "Recorded construction predates the stated triggers.",
      "Registrert bygging er før de oppgitte grensene.",
    ],
    "engine-records-missing": [
      "Engine configuration is missing.",
      "Motoroppsett mangler.",
    ],
    "diesel-engine-scope-unconfirmed": [
      "Engine scope under Annex VI regulation 13 is unconfirmed.",
      "Motorens virkeområde etter vedlegg VI regel 13 er uavklart.",
    ],
    "replacement-or-conversion-review": [
      "Replacement or major conversion needs an Administration-specific review.",
      "Utskifting eller vesentlig ombygging krever vurdering fra administrasjonen.",
    ],
    "exemption-requires-administration-review": [
      "The claimed exemption requires Administration review.",
      "Det påståtte fritaket må vurderes av administrasjonen.",
    ],
    "tier-iii-record-provided": [
      "A Tier III certification reference is provided; verify its applicability and operating conditions.",
      "Referanse til Tier III-sertifikat er oppgitt. Kontroller anvendelse og driftsvilkår.",
    ],
    "tier-iii-evidence-missing": [
      "Tier III certification evidence is missing.",
      "Dokumentasjon for Tier III-sertifisering mangler.",
    ],
    "no-nox-designation": [
      "No NOx ECA designation.",
      "Ingen NOx ECA-designasjon.",
    ],
    "electric-drive": [
      "Electric drive is outside the combustion-engine scope.",
      "Elektrisk drift faller utenfor forbrenningsmotorenes virkeområde.",
    ],
    "emergency-only": [
      "Recorded solely-emergency machinery exclusion.",
      "Registrert unntak for maskineri utelukkende til nødbruk.",
    ],
    "at-most-130-kw": [
      "Engine power is at most 130 kW.",
      "Motoreffekten er høyst 130 kW.",
    ],
    "area-and-construction-scope": [
      "Area and construction criteria apply.",
      "Område- og byggekriterier gjelder.",
    ],
  };
  function reason(k) {
    return reasons[k]?.[lang === "nb" ? 1 : 0] || status(k);
  }
  const errors = {
    REGULATORY_DATA_UNAVAILABLE: [
      "Required boundary data could not be loaded. No completed analysis is available.",
      "Nødvendige grensedata kunne ikke lastes. Ingen fullført analyse er tilgjengelig.",
    ],
    REGULATORY_DATA_INVALID: [
      "Boundary data failed validation.",
      "Grensedata besto ikke valideringen.",
    ],
    REGULATORY_DATA_INTEGRITY: [
      "Boundary file integrity check failed.",
      "Integritetskontrollen av grensefilen feilet.",
    ],
    REGULATORY_BROWSER_UNSUPPORTED: [
      "This browser cannot decode the detailed boundary dataset. Use a current browser.",
      "Denne nettleseren kan ikke dekode de detaljerte grensedataene. Bruk en oppdatert nettleser.",
    ],
    "Use 2–1000 waypoints.": [
      "Use 2–1000 waypoints.",
      "Bruk 2–1000 veipunkter.",
    ],
    "Route files must be at most 2 MB.": [
      "Route files must be at most 2 MB.",
      "Rutefiler må være høyst 2 MB.",
    ],
    "GeoJSON must contain one LineString.": [
      "GeoJSON must contain one LineString.",
      "GeoJSON må inneholde én LineString.",
    ],
    "Choose GPX, GeoJSON or RTZ.": [
      "Choose GPX, GeoJSON or RTZ.",
      "Velg GPX, GeoJSON eller RTZ.",
    ],
    "External XML resources and document types are not supported.": [
      "External XML resources and document types are not supported.",
      "Eksterne XML-ressurser og dokumenttyper støttes ikke.",
    ],
    "Invalid route XML.": ["Invalid route XML.", "Ugyldig rute-XML."],
    "Invalid GPX document.": ["Invalid GPX document.", "Ugyldig GPX-dokument."],
    "Import exactly one GPX route or track segment.": [
      "Import exactly one GPX route or track segment.",
      "Importer nøyaktig én GPX-rute eller ett sporsegment.",
    ],
    "Invalid RTZ document.": ["Invalid RTZ document.", "Ugyldig RTZ-dokument."],
    "RTZ waypoints need positions.": [
      "RTZ waypoints need positions.",
      "RTZ-veipunkter må ha posisjoner.",
    ],
    "Waypoint coordinates are missing.": [
      "Waypoint coordinates are missing.",
      "Veipunktkoordinater mangler.",
    ],
    "Use a valid ISO calendar date.": [
      "Use a valid ISO calendar date.",
      "Bruk en gyldig kalenderdato.",
    ],
    "Invalid departure calendar date.": [
      "Invalid departure calendar date.",
      "Ugyldig avgangsdato.",
    ],
    "Adjacent waypoints must be distinct.": [
      "Adjacent waypoints must be distinct.",
      "To påfølgende veipunkter må være forskjellige.",
    ],
    "The route exceeds the supported 60,000 NM range.": [
      "The route exceeds the supported 60,000 NM range.",
      "Ruten overstiger den støttede grensen på 60 000 nautiske mil.",
    ],
    "Identify the measurement or factor source.": [
      "Identify the measurement or factor source.",
      "Oppgi kilde for målingen eller utslippsfaktoren.",
    ],
    "Do not apply SCR twice to measured or outlet emissions.": [
      "Do not apply SCR twice to measured or outlet emissions.",
      "Ikke bruk SCR-reduksjon på nytt på målte utslipp eller utløpsfaktorer.",
    ],
    "Confirm that the factor describes untreated inlet emissions.": [
      "Confirm that the factor describes untreated inlet emissions.",
      "Bekreft at faktoren beskriver urensede utslipp før SCR.",
    ],
    "Measured NOx must identify measured evidence.": [
      "Measured NOx must identify measured evidence.",
      "Målt NOx-masse må oppgis som direkte måling.",
    ],
    "An energy-factor calculation is not a direct mass measurement.": [
      "An energy-factor calculation is not a direct mass measurement.",
      "En beregning med energifaktor er ikke en direkte massemåling.",
    ],
    "A fuel-factor calculation is not a direct mass measurement.": [
      "A fuel-factor calculation is not a direct mass measurement.",
      "En beregning med drivstoffaktor er ikke en direkte massemåling.",
    ],
    "Choose the NOx Fund contribution category.": [
      "Choose the NOx Fund contribution category.",
      "Velg innbetalingskategori i NOx-fondet.",
    ],
    "Unsupported Vessel Profile version.": [
      "Unsupported Vessel Profile version.",
      "Fartøyprofilens versjon støttes ikke.",
    ],
    "Identify the approved changeover procedure and assumptions.": [
      "Identify the approved changeover procedure and assumptions.",
      "Oppgi godkjent prosedyre for drivstoffskifte og forutsetningene.",
    ],
    "Select a Vessel Profile fuel with a supported mass or volume unit.": [
      "Select a Vessel Profile fuel with a supported mass or volume unit.",
      "Velg et drivstoff fra fartøyprofilen med støttet masse- eller volumenhet.",
    ],
    "No combustion machinery is configured.": [
      "No combustion machinery is configured.",
      "Ingen forbrenningsmaskiner er konfigurert.",
    ],
    "All operating engines need identified energy-based NOx factors.": [
      "All operating engines need identified energy-based NOx factors.",
      "Alle motorer i drift må ha kildebelagte energibaserte NOx-faktorer.",
    ],
    "Voyage NOx needs an outlet factor that already accounts for treatment.": [
      "Voyage NOx needs an outlet factor that already accounts for treatment.",
      "NOx for reisen krever en utløpsfaktor som allerede tar hensyn til rensing.",
    ],
  };
  function errorText(error) {
    if(error.name==="QuotaExceededError"||error.name==="SecurityError")return lang==="nb"?"Nettleseren kunne ikke lagre data. Eksporter planen eller rapporten, og kontroller nettleserens lagringsinnstillinger.":"The browser could not save the data. Export the plan or report and check browser storage settings.";
    const message = String(error.message || error);
    if (errors[message]) return errors[message][lang === "nb" ? 1 : 0];
    if (lang === "en") return message;
    if (
      Object.values(words).some((pair) => pair[1] === message) ||
      /[æøåÆØÅ]/.test(message)
    )
      return message;
    if (/required|missing|Identify/.test(message))
      return "Fyll ut alle obligatoriske inndata, datoer og dokumentasjonsfelt.";
    if (
      /number|finite|range|coordinate|WGS84|latitude|longitude/i.test(message)
    )
      return "Kontroller at tall og koordinater er gyldige og innenfor støttede grenser.";
    if (/date|Departure/i.test(message))
      return "Kontroller dato og avgangstid i UTC.";
    if (/antipodal/i.test(message))
      return "Del etappen med flere veipunkter. Motstående punkter gir ikke en entydig storsirkel.";
    return "Kontroller inndata, dokumentasjon og valgte enheter før du prøver igjen.";
  }
  const sourceNb = {
    "imo-sox":
      "Globale svovelgrenser og ECA-grenser, godkjente likeverdige ordninger og prosedyrer for drivstoffskifte.",
    "imo-areas":
      "Ikrafttredelsesdatoer for de eldre ECA-ene. Endrede datoer for spesialområder må kontrolleres mot nyere vedtak.",
    "imo-nox": "Motorenes virkeområde, NOx-nivåer, sertifisering og unntak.",
    "361-79": "SOx/PM-designasjon for Middelhavet og juridiske områdegrenser.",
    "392-82":
      "Kanadisk Arktis og Norskehavet: byggekriterier og juridiske koordinater.",
    "315-74":
      "Norskehavets juridiske avgrensning etter MARPOL vedlegg II regel 13.9.4.",
    "407-84":
      "Vedtatt ECA i Nordøst-Atlanteren med 157 koordinatpunkter. Ikrafttredelse 1. september 2027 og svovelkrav fra 1. september 2028.",
    "vliz-eca":
      "CC-BY-4.0. GIS-omriss fra 2020 brukes bare for de fire eldre ECA-områdene. Grunnlaget ble behandlet i juni 2019.",
    "vliz-iho":
      "Kystreferanse fra IHO Sea Areas versjon 3 (2018), CC-BY. Posisjonsnøyaktighet er ikke oppgitt.",
    "vliz-license":
      "Krav til kildeangivelse og informasjon om oppdaterte data etter CC-BY.",
    "no-tax":
      "Virkeområde, effektgrenser og fritak for norsk NOx-avgift i 2026.",
    "no-rate": "Statlig NOx-avgift i 2026: 26,94 kroner per kg NOx.",
    "no-fund":
      "Historiske satser 2017–2026. I 2026 er ordinær sats 15 kroner og utvinningssatsen 21 kroner per kg.",
    "no-factor": "Krav til motorfaktorer og dokumentasjon av målinger.",
    "netpas-overview":
      "Supplerende oversikt foreslått av eieren. Brukes til sammenligning av internasjonale krav, nasjonale krav og havnekrav, ikke som juridisk grunnlag eller analysegeometri.",
  };
  function sourceDescription(source) {
    return lang === "nb"
      ? source.scopeNb || sourceNb[source.id] || t("reference")
      : source.scope;
  }
  function showTab() {
    const name = ["nox", "voyage", "profile", "sources"].includes(
      location.hash.slice(1),
    )
      ? location.hash.slice(1)
      : "nox";
    $$(".view").forEach((e) => (e.hidden = e.id !== name));
    $$("#tabs a").forEach((a) => {
      if (a.hash === "#" + name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (name === "voyage") {
      initMap();
      requestAnimationFrame(() => map?.invalidateSize());
    }
  }
  function render() {
    document.documentElement.lang = lang;
    document.title =
      (lang === "nb" ? "Miljøplanlegging" : "Environmental planning") +
      " · Marine Tools";
    $$("[data-copy]").forEach((el) => (el.textContent = t(el.dataset.copy)));
    $("#language").value = lang;
    $("#tabs").setAttribute("aria-label", t("environment"));
    renderNox();
    renderVoyage();
    renderProfile();
    renderSources();
    showTab();
  }
  try {
    catalogue = await fetchJson("regulatory/catalogue.json");
    try {
      const transfer = JSON.parse(
        sessionStorage.getItem("mt.regulatory.route-transfer.v1") || "null",
      );
      sessionStorage.removeItem("mt.regulatory.route-transfer.v1");
      if (transfer && Date.now() - transfer.transferredAt < 3600000) {
        routeState = {
          ...routeState,
          ...transfer,
          points: IO.clean(transfer.points),
        };
      }
    } catch {}
    render();
    $("#language").onchange = () => {
      captureRows();
      chargeDraft = values($("#charge-context"));
      captureRoute();
      if (location.hash === "#profile") captureProfile();
      lang = $("#language").value;
      try {
        localStorage.setItem("mt.lang", lang);
        const settings = JSON.parse(
          localStorage.getItem("mt.settings") || "{}",
        );
        settings.language = lang;
        localStorage.setItem("mt.settings", JSON.stringify(settings));
      } catch {}
      render();
    };
    window.addEventListener("hashchange", showTab);
    window.addEventListener("storage", (event) => {
      if (event.key === "mt.profile.v2" || event.key === "mt.profile") {
        captureRoute();
        captureRows();
        noxResult = null;
        routeResult = null;
        profileDraft = null;
        render();
        announce(t("profileChanged"));
      }
    });
  } catch (e) {
    announce(errorText(e), true);
  }
})();
