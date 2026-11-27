/* Glossary page: search, category filter, deep links #<term-id>. Terms and explanations are in English (the working
   language at sea); the page chrome follows the app language (mt.locale.v1). */
(function () {
  'use strict';
  var TERMS = window.MT_GLOSSARY || [], CATS = window.MT_GLOSSARY_CATS || {};
  var UI = {
    en: {back: 'Back to tools', language: 'Language', eyebrow: 'GLOSSARY', title: 'Maritime glossary', intro: 'Common terms and abbreviations from the engine room, the bridge and the shipping office, each with a short explanation and a link to the calculator that uses it.', search: 'Search terms', placeholder: 'Search, e.g. FWA, SFOC or laytime', limits: 'Short explanations for learning and everyday use. They are not regulatory text – follow approved onboard documentation and the applicable rules.', all: 'All', open: 'Open the calculator →', count: function (n) { return n === 1 ? '1 term' : n + ' terms'; }, none: 'No terms match. Try another word or abbreviation.', copy: 'Copy link', copied: 'Link copied', note: ''},
    nb: {back: 'Tilbake til verktøyene', language: 'Språk', eyebrow: 'ORDLISTE', title: 'Maritim ordliste', intro: 'Vanlige begreper og forkortelser fra maskinrommet, broen og rederikontoret, hver med en kort forklaring og lenke til kalkulatoren som bruker begrepet.', search: 'Søk i begreper', placeholder: 'Søk, f.eks. FWA, SFOC eller laytime', limits: 'Korte forklaringer til læring og daglig bruk. De er ikke regelverkstekst – følg godkjent dokumentasjon om bord og gjeldende regelverk.', all: 'Alle', open: 'Åpne kalkulatoren →', count: function (n) { return n === 1 ? '1 begrep' : n + ' begreper'; }, none: 'Ingen begreper passer. Prøv et annet ord eller en annen forkortelse.', copy: 'Kopier lenke', copied: 'Lenke kopiert', note: 'Begrepene og forklaringene er på engelsk, som er arbeidsspråket til sjøs.'}
  };
  var $ = function (id) { return document.getElementById(id); };
  function readLang() { try { var v = JSON.parse(localStorage.getItem('mt.locale.v1') || 'null'); return v === 'nb' ? 'nb' : 'en'; } catch (e) { return 'en'; } }
  function saveLang(l) { try { localStorage.setItem('mt.locale.v1', JSON.stringify(l)); } catch (e) {} }
  var lang = readLang(), cat = '', q = '';
  function norm(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, ''); }
  function toolHref(t) { return !t ? '' : t.charAt(0) === '?' ? 'index.html' + t : t.replace(/^\//, ''); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function chrome() {
    var u = UI[lang]; document.documentElement.lang = lang === 'nb' ? 'nb' : 'en';
    document.querySelectorAll('[data-g]').forEach(function (n) { var k = n.getAttribute('data-g'); if (typeof u[k] === 'string') n.textContent = u[k]; });
    $('g-q').placeholder = u.placeholder; $('language').value = lang;
    var note = $('g-note'); note.textContent = u.note; note.hidden = !u.note;
    document.title = (lang === 'nb' ? 'Maritim ordliste – begreper og forkortelser' : 'Maritime glossary – terms and abbreviations') + ' · Marine Tools';
    var box = $('g-cats'); box.textContent = '';
    [['', u.all]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k][lang]]; })).forEach(function (c) {
      var b = el('button', 'g-cat', c[1]); b.type = 'button'; b.dataset.cat = c[0]; b.setAttribute('aria-pressed', String(cat === c[0])); box.appendChild(b);
    });
  }
  function render() {
    var u = UI[lang], nq = norm(q).trim();
    var hits = TERMS.filter(function (t) { return (!cat || t.cat === cat) && (!nq || norm(t.term + ' ' + t.d).indexOf(nq) >= 0); });
    // exact abbreviation / term-start matches first, then alphabetical
    hits.sort(function (a, b) { var as = nq && norm(a.term).indexOf(nq) === 0 ? 0 : 1, bs = nq && norm(b.term).indexOf(nq) === 0 ? 0 : 1; return as - bs || a.term.localeCompare(b.term, 'en'); });
    var list = $('g-list'); list.textContent = '';
    $('g-count').textContent = hits.length ? u.count(hits.length) : u.none;
    var frag = document.createDocumentFragment();
    hits.forEach(function (t) {
      var a = el('article', 'g-term'); a.id = t.id; a.lang = 'en';
      a.appendChild(el('h2', null, t.term));
      a.appendChild(el('p', 'g-def', t.d));
      var row = el('p', 'g-actions'); row.lang = lang;
      if (t.tool) { var l = el('a', 'g-open', u.open); l.href = toolHref(t.tool); row.appendChild(l); }
      var c = el('button', 'g-copy', u.copy); c.type = 'button'; c.dataset.term = t.id; row.appendChild(c);
      a.appendChild(row);
      var tag = el('span', 'g-cat-tag', (CATS[t.cat] || {})[lang] || ''); tag.lang = lang; a.appendChild(tag);
      frag.appendChild(a);
    });
    list.appendChild(frag);
    highlight();
  }
  function highlight() {
    var id = decodeURIComponent((location.hash || '').slice(1)); if (!id) return;
    var t = document.getElementById(id); if (!t || !t.classList.contains('g-term')) return;
    document.querySelectorAll('.g-term.is-target').forEach(function (x) { x.classList.remove('is-target'); });
    t.classList.add('is-target'); t.scrollIntoView({block: 'start'});
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.g-cat');
    if (b) { cat = b.dataset.cat; document.querySelectorAll('.g-cat').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); return; }
    var c = e.target.closest && e.target.closest('.g-copy');
    if (c) {
      var url = location.origin + location.pathname + '#' + c.dataset.term, done = function () { c.textContent = UI[lang].copied; setTimeout(function () { c.textContent = UI[lang].copy; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt(UI[lang].copy, url); }); else prompt(UI[lang].copy, url);
    }
  });
  $('g-q').addEventListener('input', function (e) { q = e.target.value; render(); });
  $('language').addEventListener('change', function (e) { lang = e.target.value === 'nb' ? 'nb' : 'en'; saveLang(lang); chrome(); render(); });
  window.addEventListener('hashchange', highlight);
  try { var sq = new URLSearchParams(location.search).get('q'); if (sq) { q = sq.slice(0, 60); $('g-q').value = q; } } catch (e) {}
  chrome(); render();
  try {
    var ld = {'@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'Marine Tools maritime glossary', url: 'https://www.marinetools.app/glossary.html',
      hasDefinedTerm: TERMS.map(function (t) { return {'@type': 'DefinedTerm', name: t.term, description: t.d, url: 'https://www.marinetools.app/glossary.html#' + t.id}; })};
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld).replace(/</g, '\\u003c'); document.head.appendChild(s);
  } catch (e) {}
})();
