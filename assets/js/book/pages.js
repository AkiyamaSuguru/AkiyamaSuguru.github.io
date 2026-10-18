// SPDX-FileCopyrightText: 2026 Jay Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* Interactive parts of the pages: copy seals, the citation slip, the coating cross-section,
   the map and the year list (they light each other up), the star charts, and the sealed letter. */
import {t, onLangChange} from '../i18n.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export function initPages({book, sound, onReplay}) {
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b, b.dataset.copy)));
  citation();
  crossSection();
  mapAndYears();
  starCharts();
  letter(sound);
  $$('[data-go="end"]').forEach(b => b.addEventListener('click', () => book.go(book.count - 1)));
  $$('[data-replay]').forEach(b => b.addEventListener('click', onReplay));
}

async function copy(btn, text) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    /* no clipboard API, or it refused: copy through a hidden text box instead */
    const box = Object.assign(document.createElement('textarea'), {value: text, readOnly: true});
    box.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.append(box);
    box.focus({preventScroll: true});
    box.select();
    try { ok = document.execCommand('copy'); } catch {}
    box.remove();
    btn.focus({preventScroll: true});
  }
  if (!ok) return;
  btn.classList.add('done');
  btn.textContent = t('ui.copied');
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { btn.classList.remove('done'); btn.textContent = t('ui.copy'); }, 1600);
}

/** hover, focus or tap shows an item; a tap pins it until tapped again */
function explorer(items, show) {
  let pinned = null;
  for (const el of items) {
    const k = el.dataset.k || el.dataset.layer || el.dataset.year;
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(k); });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') show(pinned); });
    el.addEventListener('focus', () => show(k));
    el.addEventListener('blur', () => show(pinned));
    el.addEventListener('click', () => { pinned = pinned === k ? null : k; show(pinned); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = pinned === k ? null : k; show(pinned); } });
  }
}

/* ---------- citation ---------- */
const PAPER = {
  key: 'ma2026sic',
  title: 'Temperature-dependent non-stoichiometry SiC coatings on nuclear graphite and its molten salt corrosion mechanism',
  authors: [['Ma', 'Jie'], ['Song', 'Jinliang'], ['Wang', 'Mengqian'], ['Lian', 'Pengfei'], ['Huang', 'Hefei']],
  journal: 'Corrosion Science', year: 2026, volume: 272, article: '114277', doi: '10.1016/j.corsci.2026.114277',
};
const initials = g => g.split(/[\s-]+/).map(s => s[0] + '.').join('');
const FORMATS = {
  bibtex: p => `@article{${p.key},\n  title   = {${p.title}},\n  author  = {${p.authors.map(([a, b]) => `${a}, ${b}`).join(' and ')}},\n  journal = {${p.journal}},\n  volume  = {${p.volume}},\n  pages   = {${p.article}},\n  year    = {${p.year}},\n  doi     = {${p.doi}}\n}`,
  apa: p => {
    const n = p.authors.map(([a, b]) => `${a}, ${initials(b)}`);
    return `${n.slice(0, -1).join(', ')}, & ${n.at(-1)} (${p.year}). ${p.title}. ${p.journal}, ${p.volume}, ${p.article}. https://doi.org/${p.doi}`;
  },
  /* GB/T 7714-2015 lists the first three authors, then "et al." */
  gb: p => {
    const n = p.authors.map(([a, b]) => `${a.toUpperCase()} ${b.split(/[\s-]+/).map(s => s[0]).join('')}`);
    return `${n.slice(0, 3).join(', ')}, et al. ${p.title}[J]. ${p.journal}, ${p.year}, ${p.volume}: ${p.article}. DOI: ${p.doi}.`;
  },
};

function citation() {
  const code = $('#cite-code'), tabs = $$('#cite [role=tab]');
  if (!code) return;
  let fmt = 'bibtex';
  const render = () => {
    code.textContent = FORMATS[fmt](PAPER);
    tabs.forEach(b => { const on = b.dataset.fmt === fmt; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => { fmt = b.dataset.fmt; render(); });
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      fmt = next.dataset.fmt; render(); next.focus();
    });
  });
  const btn = $('[data-copy-cite]');
  btn.addEventListener('click', () => copy(btn, code.textContent));
  render();
}

/* ---------- cross-section ---------- */
function crossSection() {
  const fig = $('#xsec'), info = $('#xsec-info');
  if (!fig) return;
  let shown;
  const items = $$('[data-layer]', fig);
  const show = layer => {
    shown = layer;
    if (layer) fig.dataset.active = layer; else delete fig.dataset.active;
    items.forEach(el => el.classList.toggle('on', el.dataset.layer === layer));
    info.innerHTML = t(layer ? `rs.info.${layer}` : 'rs.info.idle');
  };
  /* labels are focusable; the drawn layers respond to pointer only */
  items.forEach(el => { if (!el.classList.contains('tag')) el.removeAttribute('tabindex'); });
  explorer(items, show);
  onLangChange(() => show(shown));
}

/* ---------- map and years ---------- */
function mapAndYears() {
  const items = [...$$('.wp'), ...$$('.years li')];
  const show = year => items.forEach(el => el.classList.toggle('on', el.dataset.year === year));
  explorer(items, show);
}

/* ---------- star charts ---------- */
function starCharts() {
  for (const chart of $$('.chart')) {
    const info = chart.nextElementSibling, stars = $$('.st', chart);
    let shown;
    const show = k => {
      shown = k;
      stars.forEach(s => s.classList.toggle('on', s.dataset.k === k));
      chart.classList.toggle('lit', !!k);
      const name = k && $(`.st[data-k="${k}"] text`, chart).textContent;
      info.innerHTML = k ? `<b>${name}</b>${t('mt.d.' + k)}` : t('mt.idle');
    };
    explorer(stars, show);
    onLangChange(() => show(shown));
  }
}

/* ---------- the sealed letter ---------- */
function letter(sound) {
  const env = $('#envelope'), seal = $('#seal'), page = $('.letter-page');
  if (!env) return;
  const open = () => {
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    page.classList.add('open');
    sound.play('seal');
  };
  seal.addEventListener('click', open);
  $('.folded', page)?.addEventListener('click', open);
}
