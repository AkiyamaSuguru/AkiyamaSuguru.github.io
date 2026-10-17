/* Bilingual text (English / Chinese).
   - English is read from the page once at start-up; Chinese comes from locales/zh.js.
   - <el data-i18n="key"> swaps innerHTML; data-i18n-attr="aria-label:key;alt:key" swaps attributes.
   - The choice is kept in localStorage and can be forced with ?lang=en / ?lang=zh. */
import zh from './locales/zh.js';

/* English for strings that only JavaScript shows (everything else is read from the DOM). */
const en = {
  'meta.title': 'Jay Ma',
  'meta.desc': 'Jay Ma, M.S. candidate in Condensed Matter Physics at Shanghai University and SINAP, CAS. Research on SiC coatings for molten salt reactors.',
  'nav.close': 'Close menu',
  'rs.info.ion': '<b>Ion irradiation</b>Ions stand in for in-reactor radiation damage. SRIM gives the ion range and displacement damage (dpa) profile used to set the irradiation parameters.',
  'rs.info.salt': '<b>Molten salt</b>The reactor coolant. Static corrosion tests show how the salt attacks the coating and which coating structure resists it best.',
  'rs.info.sic': '<b>CVD-SiC coating</b>Deposited by chemical vapour deposition at different temperatures; crystallinity and Si/C stoichiometry govern its resistance to molten salt.',
  'rs.info.graphite': '<b>Nuclear graphite</b>The substrate. The coating keeps molten salt out of the porous graphite.',
  'js.copied': 'Copied to clipboard',
  'js.copyFail': 'Copy failed. Please select the text manually.',
  'js.toEn': 'Switch to English',
  'js.toZh': '切换到中文',
  'js.updated': 'Updated',
};
const dicts = {en, zh};
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const listeners = new Set();
let lang = root.dataset.lang === 'zh' ? 'zh' : 'en';

const textNodes = [...document.querySelectorAll('[data-i18n]')];
const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')].map(el => ({
  el,
  pairs: el.dataset.i18nAttr.split(';').map(p => p.split(':').map(s => s.trim())),
}));

/* snapshot the English that ships in the HTML */
for (const n of textNodes) if (!(n.dataset.i18n in en)) en[n.dataset.i18n] = n.innerHTML;
for (const {el, pairs} of attrNodes) for (const [attr, key] of pairs) if (!(key in en)) en[key] = el.getAttribute(attr) ?? '';

export const t = key => dicts[lang][key] ?? en[key] ?? key;
export const getLang = () => lang;
export const onLangChange = fn => listeners.add(fn);

function apply() {
  for (const n of textNodes) {
    const v = t(n.dataset.i18n);
    if (n.innerHTML !== v) n.innerHTML = v;
  }
  for (const {el, pairs} of attrNodes) for (const [attr, key] of pairs) el.setAttribute(attr, t(key));

  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  root.dataset.lang = lang;
  document.title = t('meta.title');
  document.querySelector('meta[name=description]')?.setAttribute('content', t('meta.desc'));

  const next = lang === 'zh' ? 'js.toEn' : 'js.toZh';
  document.querySelectorAll('[data-lang-toggle]').forEach(b => {
    b.setAttribute('aria-label', dicts[lang === 'zh' ? 'en' : 'zh'][next] ?? en[next]);
  });
  listeners.forEach(fn => fn(lang));
}

export function setLang(next) {
  if (next === lang || !(next in dicts)) return;
  lang = next;
  try { localStorage.setItem('lang', lang); } catch {}
  const url = new URL(location.href);
  if (url.searchParams.has('lang')) { url.searchParams.set('lang', lang); history.replaceState(null, '', url); }
  if (document.startViewTransition && !reduce) document.startViewTransition(apply);
  else apply();
}

export function initI18n() {
  apply();
  root.classList.remove('i18n-wait');
  const toggle = () => setLang(lang === 'zh' ? 'en' : 'zh');
  document.querySelectorAll('[data-lang-toggle]').forEach(b => b.addEventListener('click', toggle));
  /* press L to switch, unless typing or using a shortcut */
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'l' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    toggle();
  });
}
