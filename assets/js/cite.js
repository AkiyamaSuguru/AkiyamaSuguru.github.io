/* "Cite" panel for the paper: BibTeX, APA and GB/T 7714, with copy to clipboard. */
import {copyText} from './toast.js';

const PAPER = {
  key: 'ma2026sic',
  title: 'Temperature-dependent non-stoichiometry SiC coatings on nuclear graphite and its molten salt corrosion mechanism',
  authors: [['Ma', 'Jie'], ['Song', 'Jinliang'], ['Wang', 'Mengqian'], ['Lian', 'Pengfei'], ['Huang', 'Hefei']],
  journal: 'Corrosion Science', year: 2026, volume: 272, article: '114277',
  doi: '10.1016/j.corsci.2026.114277',
};

const initials = given => given.split(/[\s-]+/).map(s => s[0] + '.').join('');
const FORMATS = {
  bibtex: p => `@article{${p.key},
  title   = {${p.title}},
  author  = {${p.authors.map(([f, g]) => `${f}, ${g}`).join(' and ')}},
  journal = {${p.journal}},
  volume  = {${p.volume}},
  pages   = {${p.article}},
  year    = {${p.year}},
  doi     = {${p.doi}}
}`,
  apa: p => {
    const names = p.authors.map(([f, g]) => `${f}, ${initials(g)}`);
    const list = names.slice(0, -1).join(', ') + ', & ' + names.at(-1);
    return `${list} (${p.year}). ${p.title}. ${p.journal}, ${p.volume}, ${p.article}. https://doi.org/${p.doi}`;
  },
  /* GB/T 7714-2015: list the first three authors, then "et al." */
  gb: p => {
    const names = p.authors.map(([f, g]) => `${f.toUpperCase()} ${g.split(/[\s-]+/).map(s => s[0]).join('')}`);
    const list = names.length > 3 ? names.slice(0, 3).join(', ') + ', et al' : names.join(', ');
    return `${list}. ${p.title}[J]. ${p.journal}, ${p.year}, ${p.volume}: ${p.article}. DOI: ${p.doi}.`;
  },
};

export function initCite() {
  const toggle = document.querySelector('[data-cite-toggle]');
  const panel = document.getElementById('cite');
  if (!toggle || !panel) return;
  const code = document.getElementById('cite-code');
  const tabs = [...panel.querySelectorAll('[role=tab]')];
  let fmt = 'bibtex';

  const render = () => {
    code.textContent = FORMATS[fmt](PAPER);
    tabs.forEach(b => {
      const on = b.dataset.fmt === fmt;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
    });
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open);
    panel.hidden = !open;
    if (open) render();
  });
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => { fmt = b.dataset.fmt; render(); });
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      fmt = next.dataset.fmt; render(); next.focus();
    });
  });
  panel.querySelector('[data-copy-cite]').addEventListener('click', () => copyText(code.textContent));
}
