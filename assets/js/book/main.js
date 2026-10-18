/* Entry point for The Book of Star Trails. */
import {initI18n} from '../i18n.js';
import * as art from './ornaments.js';
import * as ill from './illustrations.js';
import {sound} from './sound.js';
import {initScene} from './scene.js';
import {createBook} from './book.js';
import {createCase} from './casket.js';
import {initPages} from './pages.js';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still');

/* artwork, drawn once and shared by every element that asks for it */
art.buildSprite();
const ARTS = {
  cover: art.coverArt, back: ill.backArt, frame: art.pageFrameArt, frontispiece: art.frontispieceArt,
  exlibris: ill.exLibrisArt, cameo: ill.cameoArt, seal: art.chapterSealArt, initial: art.initialArt,
  spectrum: art.spectrumArt, xps: art.xpsPlateArt, gma: art.gmaPlateArt, latch: art.latchArt,
  xsec: ill.crossSectionArt, crystal: ill.crystalArt, map: ill.mapArt, envelope: ill.envelopeArt,
  'chart-exp': () => ill.chartArt(51), 'chart-comp': () => ill.chartArt(73), anatomy: ill.anatomyArt,
};
const made = {};
document.querySelectorAll('[data-art]').forEach(el => { const k = el.dataset.art; el.innerHTML = made[k] ??= ARTS[k](); });

initI18n();
const scene = initScene({still});
const book = createBook({sound, still});

/* layout: two pages side by side on wide screens, one page at a time on phones and portrait screens */
function layout() {
  const w = innerWidth, h = innerHeight, single = w < 700 || w / h < 1.02;
  const P = Math.round(single ? Math.min(w - 24, (h - 120) / 1.38, 560) : Math.min(w * .44, h * .8 / 1.38, 560));
  const H = Math.round(P * 1.38);
  const v = {P, H, CW: Math.round(P * 1.14), CH: Math.round(H * 1.1), CD: Math.round(P * .2), DT: Math.max(5, Math.round(P * .016))};
  for (const [k, x] of Object.entries(v)) document.documentElement.style.setProperty('--' + k, x + 'px');
  document.body.classList.toggle('single', single);
  book.setMode(single ? 'single' : 'spread');
}
layout();

/* every page has an address; the browser's back button turns pages back */
const reading = () => document.body.classList.contains('reading');
const writeHash = (slug, push) => {
  const url = '#' + slug;
  if (location.hash !== url) history[push ? 'pushState' : 'replaceState'](null, '', url);
};
book.onChange(({push, slug}) => { if (reading()) writeHash(slug, push); });
addEventListener('popstate', () => {
  const p = book.posFor(decodeURIComponent(location.hash.slice(1)));
  if (p !== null && reading()) book.go(p, {push: false});
});

const casket = createCase({sound, scene, book, still, onOpened: () => writeHash(book.slugFor(book.pos), false)});
const replay = () => { casket.reset(); history.replaceState(null, '', location.pathname + location.search); };
initPages({book, sound, onReplay: replay});

/* a link to a page opens the book straight at that page */
const start = book.posFor(decodeURIComponent(location.hash.slice(1)));
if (start !== null) casket.open({instant: true}).then(() => { book.jump(start); writeHash(book.slugFor(book.pos), false); });

let rt;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => { layout(); casket.relayout(); }, 120);
});

/* toolbar */
const soundBtn = document.getElementById('sound');
const syncSound = () => soundBtn.setAttribute('aria-pressed', sound.on);
soundBtn.addEventListener('click', () => { sound.on = !sound.on; sound.unlock(); syncSound(); });
document.getElementById('replay').addEventListener('click', replay);
document.getElementById('contents-btn').addEventListener('click', () => book.go(book.posFor('contents'), {slug: 'contents'}));
addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey && !e.altKey) { sound.on = !sound.on; syncSound(); }
});
syncSound();
