/* Research diagram: hover a layer, a label, a chip or a research phase to highlight that layer
   and explain it; click or tap to pin the choice. Each phase maps to the layer it studies. */
import {t, onLangChange} from './i18n.js';

export function initResearch() {
  const fig = document.getElementById('diagram');
  if (!fig) return;
  const text = document.getElementById('layer-text');
  const targets = [...document.querySelectorAll('#diagram .layer, #diagram .tag-layer, .phases li[data-layer]')];
  const chips = [...fig.querySelectorAll('.layer-chips button')];
  let pinned = null, shown;

  function show(layer, force) {
    if (layer === shown && !force) return;
    shown = layer;
    if (layer) fig.dataset.active = layer; else delete fig.dataset.active;
    targets.forEach(el => el.classList.toggle('on', el.dataset.layer === layer));
    /* quick cross-fade of the explanation text */
    text.classList.add('swap');
    setTimeout(() => {
      text.innerHTML = t(layer ? `rs.info.${layer}` : 'rs.info.idle');
      text.classList.remove('swap');
    }, force ? 0 : 140);
  }
  const pin = layer => {
    pinned = pinned === layer ? null : layer;
    chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.layer === pinned));
    show(pinned);
  };

  for (const el of targets) {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(el.dataset.layer); });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') show(pinned); });
    el.addEventListener('click', () => pin(el.dataset.layer));
  }
  /* phases are focusable list items: preview on focus, pin with Enter / Space */
  document.querySelectorAll('.phases li[data-layer]').forEach(li => {
    li.addEventListener('focus', () => show(li.dataset.layer));
    li.addEventListener('blur', () => show(pinned));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(li.dataset.layer); }
    });
  });
  chips.forEach(c => {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', () => pin(c.dataset.layer));
  });

  onLangChange(() => show(shown, true));
}
