/* Navigation: header state on scroll, reading progress, back-to-top, mobile drawer, active section. */
import {t, onLangChange} from './i18n.js';

export function initNav() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('to-top');
  const horizon = document.querySelector('.horizon');
  const cue = document.querySelector('.scroll-cue');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  const body = document.body;

  /* ---------- one rAF-throttled scroll handler for everything scroll-linked ---------- */
  let lastY = scrollY, ticking = false;
  function update() {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    progress.style.setProperty('--p', p);
    toTop.style.setProperty('--p', p);
    nav.classList.toggle('scrolled', y > 40);
    /* tuck the header away while reading downwards, bring it back on any upward scroll */
    const down = y > lastY + 4, up = y < lastY - 4;
    if (down && y > innerHeight * .9 && !body.classList.contains('menu-open') && !nav.contains(document.activeElement)) nav.classList.add('tuck');
    else if (up || y < innerHeight * .9) nav.classList.remove('tuck');
    toTop.classList.toggle('show', y > innerHeight * .8);
    if (y < innerHeight) {
      horizon.style.setProperty('--hy', `${y * .22}px`);
      cue.style.opacity = Math.max(0, 1 - y / 200);
    }
    if (down || up) lastY = y;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
  addEventListener('resize', update, {passive: true});
  update();
  nav.addEventListener('focusin', () => nav.classList.remove('tuck'));

  /* ---------- mobile drawer ---------- */
  drawer.querySelectorAll('nav a').forEach((a, i) => a.style.setProperty('--i', i));
  const setMenu = open => {
    if (open === body.classList.contains('menu-open')) return;
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
    drawer.inert = !open;
    if (open) drawer.querySelector('a')?.focus({preventScroll: true});
    else if (drawer.contains(document.activeElement)) burger.focus({preventScroll: true});
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.getElementById('scrim').addEventListener('click', () => setMenu(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1061px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  onLangChange(() => burger.setAttribute('aria-label', t(body.classList.contains('menu-open') ? 'nav.close' : 'nav.open')));

  /* ---------- active section in both menus ---------- */
  const links = [...document.querySelectorAll('.links a, .drawer nav a')];
  const ids = [...new Set(links.map(a => a.getAttribute('href').slice(1)))];
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['top', ...ids].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
}
