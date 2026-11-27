/* Glossary page: search, category filter, EN/NB (shares mt.locale.v1 with the app), deep links #<term-id>. */
(function () {
  'use strict';
  var TERMS = window.MT_GLOSSARY || [], CATS = window.MT_GLOSSARY_CATS || {};
  var UI = {
    en: {back: 'Back to tools', language: 'Language', eyebrow: 'GLOSSARY', title: 'Maritime glossary', intro: 'Common terms from the engine room, the bridge and the classroom, in English and Norwegian, each with a short explanation and a link to the calculator that uses it.', search: 'Search terms', placeholder: 'Search, e.g. FWA or misvisning', limits: 'Short explanations for learning and everyday use. They are not regulatory text – follow approved onboard documentation and the applicable rules.', all: 'All', open: 'Open the calculator →', count: function (n) { return n === 1 ? '1 term' : n + ' terms'; }, none: 'No terms match. Try another word, in English or Norwegian.', copy: 'Copy link', copied: 'Link copied', other: 'Norwegian'},
    nb: {back: 'Tilbake til verktøyene', language: 'Språk', eyebrow: 'ORDLISTE', title: 'Maritim ordliste', intro: 'Vanlige begreper fra maskinrommet, broen og klasserommet, på engelsk og norsk, hver med en kort forklaring og lenke til kalkulatoren som bruker begrepet.', search: 'Søk i begreper', placeholder: 'Søk, f.eks. FWA eller misvisning', limits: 'Korte forklaringer til læring og daglig bruk. De er ikke regelverkstekst – følg godkjent dokumentasjon om bord og gjeldende regelverk.', all: 'Alle', open: 'Åpne kalkulatoren →', count: function (n) { return n === 1 ? '1 begrep' : n + ' begreper'; }, none: 'Ingen begreper passer. Prøv et annet ord, på engelsk eller norsk.', copy: 'Kopier lenke', copied: 'Lenke kopiert', other: 'Engelsk'}
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
    document.title = (lang === 'nb' ? 'Maritim ordliste – engelsk og norsk' : 'Maritime glossary – English and Norwegian') + ' · Marine Tools';
    var box = $('g-cats'); box.textContent = '';
    [['', u.all]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k][lang]]; })).forEach(function (c) {
      var b = el('button', 'g-cat', c[1]); b.type = 'button'; b.dataset.cat = c[0]; b.setAttribute('aria-pressed', String(cat === c[0])); box.appendChild(b);
    });
  }
  function render() {
    var u = UI[lang], other = lang === 'nb' ? 'en' : 'nb', nq = norm(q).trim();
    var hits = TERMS.filter(function (t) { return (!cat || t.cat === cat) && (!nq || norm([t.en, t.nb, t.d.en, t.d.nb].join(' ')).indexOf(nq) >= 0); })
      .sort(function (a, b) { return a[lang].localeCompare(b[lang], lang); });
    var list = $('g-list'); list.textContent = '';
    $('g-count').textContent = hits.length ? u.count(hits.length) : u.none;
    hits.forEach(function (t) {
      var a = el('article', 'g-term'); a.id = t.id;
      var h = el('h2', null, t[lang]); a.appendChild(h);
      var alt = el('p', 'g-alt'); alt.appendChild(el('span', 'g-alt-k', u.other + ': ')); alt.appendChild(document.createTextNode(t[other])); a.appendChild(alt);
      a.appendChild(el('p', 'g-def', t.d[lang]));
      var row = el('p', 'g-actions');
      if (t.tool) { var l = el('a', 'g-open', u.open); l.href = toolHref(t.tool); row.appendChild(l); }
      var c = el('button', 'g-copy', u.copy); c.type = 'button'; c.dataset.term = t.id; row.appendChild(c);
      a.appendChild(row);
      a.appendChild(el('span', 'g-cat-tag', (CATS[t.cat] || {})[lang] || ''));
      list.appendChild(a);
    });
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
  // optional search from the URL: glossary.html?q=fwa
  try { var sq = new URLSearchParams(location.search).get('q'); if (sq) { q = sq.slice(0, 60); $('g-q').value = q; } } catch (e) {}
  chrome(); render();
  // structured data for search engines (DefinedTermSet), built from the same list
  try {
    var ld = {'@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'Marine Tools maritime glossary', url: 'https://www.marinetools.app/glossary.html',
      hasDefinedTerm: TERMS.map(function (t) { return {'@type': 'DefinedTerm', name: t.en, alternateName: t.nb, description: t.d.en, url: 'https://www.marinetools.app/glossary.html#' + t.id}; })};
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld).replace(/</g, '\\u003c'); document.head.appendChild(s);
  } catch (e) {}
})();
