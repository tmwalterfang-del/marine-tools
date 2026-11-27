/* Term explanations in calculators. Each tool card gets a "Terms:" row listing glossary terms found in its heading and
   field labels (labels themselves are not changed, so translation, screen readers, printing and sharing are unaffected).
   Hover shows the explanation (title); click/tap opens it with a link to the glossary. Data: glossary-hints-data.js. */
(function () {
  'use strict';
  var H = window.MT_GLOSSARY_HINTS; if (!H || !H.hints) return;
  var esc = function (s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var rules = H.hints.map(function (h) {
    var parts = [];
    if (h[1].length) parts.push({re: new RegExp('(^|[^A-Za-z0-9])(' + h[1].map(esc).join('|') + ')(?![A-Za-z0-9])'), id: h[0]});
    if (h[2].length) parts.push({re: new RegExp('(^|[^\\p{L}\\p{N}])(' + h[2].map(esc).join('|') + ')', 'iu'), id: h[0]});
    return parts;
  }).reduce(function (a, b) { return a.concat(b); }, []);
  function short(t) { var m = /^([^(]+?)\s*\(/.exec(t); return m && m[1].length <= 12 ? m[1] : t.length <= 22 ? t : t.split(/[\s(]/)[0]; }
  function textOf(card) {
    var bits = [], h = card.querySelector('.tool-card-head h3'); if (h) bits.push(h.textContent);
    card.querySelectorAll('.tool-card-work label').forEach(function (l) { l.childNodes.forEach(function (n) { if (n.nodeType === 3) bits.push(n.textContent); else if (n.nodeType === 1 && !n.matches('input,select,textarea')) bits.push(n.textContent); }); });
    return bits.join(' • ');
  }
  function decorate(card) {
    if (card.dataset.mtTerms) return; card.dataset.mtTerms = '1';
    var txt = textOf(card), found = [];
    rules.forEach(function (r) { if (found.length < 6 && found.indexOf(r.id) < 0 && r.re.test(txt)) found.push(r.id); });
    if (!found.length) return;
    var row = document.createElement('div'); row.className = 'tool-terms';
    var lab = document.createElement('span'); lab.className = 'tool-terms-label'; lab.textContent = 'Terms:'; row.appendChild(lab);
    found.forEach(function (id) {
      var t = H.terms[id]; if (!t) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mt-term'; b.dataset.term = id; b.lang = 'en'; b.setAttribute('data-no-translate', '');
      b.textContent = short(t.t); b.title = t.t + ' – ' + t.d; b.setAttribute('aria-expanded', 'false'); row.appendChild(b);
    });
    var head = card.querySelector('.tool-card-head'); (head || card.firstChild).after ? (head || card.firstElementChild).after(row) : card.prepend(row);
  }
  function scan() { document.querySelectorAll('.tool-card:not([data-mt-terms])').forEach(decorate); }
  function closeAll(except) { document.querySelectorAll('.tool-term-pop').forEach(function (p) { if (p !== except) { var b = p.previousElementSibling && p.parentElement.querySelector('.mt-term[aria-expanded="true"]'); if (b) b.setAttribute('aria-expanded', 'false'); p.remove(); } }); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.mt-term');
    if (!b) { if (!(e.target.closest && e.target.closest('.tool-term-pop'))) closeAll(); return; }
    e.preventDefault();
    var row = b.closest('.tool-terms'), open = row.querySelector('.tool-term-pop'), same = open && open.dataset.term === b.dataset.term;
    closeAll(); row.querySelectorAll('.mt-term').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    if (same) return;
    var t = H.terms[b.dataset.term]; if (!t) return;
    var pop = document.createElement('div'); pop.className = 'tool-term-pop'; pop.setAttribute('role', 'note'); pop.dataset.term = b.dataset.term;
    var h = document.createElement('b'); h.lang = 'en'; h.setAttribute('data-no-translate', ''); h.textContent = t.t;
    var p = document.createElement('p'); p.lang = 'en'; p.setAttribute('data-no-translate', ''); p.textContent = t.d;
    var a = document.createElement('a'); a.href = 'glossary.html#' + encodeURIComponent(b.dataset.term); a.textContent = 'More in the glossary →';
    pop.append(h, p, a); row.appendChild(pop); b.setAttribute('aria-expanded', 'true');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  var pending = 0;
  new MutationObserver(function () { if (pending) return; pending = setTimeout(function () { pending = 0; scan(); }, 120); }).observe(document.documentElement, {childList: true, subtree: true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
