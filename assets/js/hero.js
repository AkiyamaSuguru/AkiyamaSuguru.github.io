/* Hero: pixel-matrix name, pixel-art avatar, typed overline and the HUD clock.
   Click the name or the avatar to scatter its pixels; the Konami code (or the footer hint)
   jumps to warp speed. */
import {PixelSprite, textCells, imageCells} from './pixel.js';
import {typeOut} from './fx.js';
import {onLangChange} from './i18n.js';

export async function initHero({still}) {
  const root = document.documentElement;
  const sprites = [];

  /* ---------- name ---------- */
  const name = document.getElementById('name');
  try {
    const t = textCells(name.querySelector('.name-text').textContent.trim(), {shadow: 'rgba(255,106,61,.5)'});
    sprites.push(new PixelSprite(name.querySelector('canvas'), {
      ...t, box: name, maxCell: 15, gap: .1, ghost: 'rgba(255,255,255,.028)', intro: 'fly', still, repel: 64,
    }));
    name.classList.add('ready');
  } catch (e) {
    root.classList.add('px-fail');
  }

  /* ---------- avatar (sprite sheet: art + blink frame) ---------- */
  const avatar = document.getElementById('avatar');
  try {
    const frame = avatar.querySelector('.px-frame');
    const data = await imageCells('assets/img/avatar.png', 32);
    sprites.push(new PixelSprite(frame.querySelector('canvas'), {
      ...data, box: frame, intro: 'scan', still, hover: 'glow', repel: 66, blink: [2400, 5200], glitch: [6000, 12000], scan: [6500, 11000],
    }));
    avatar.classList.add('ready');
  } catch (e) {
    root.classList.add('px-fail');
  }

  /* ---------- warp: scatter both sprites as the stars streak past ---------- */
  addEventListener('warp', () => sprites.forEach(s => s.burst({x: s.o.cols / 2, y: s.o.rows / 2}, 1.6)));

  /* ---------- typed overline, retyped after a language switch ---------- */
  const line = document.querySelector('[data-fx=type]');
  if (line && !still) {
    typeOut(line, {delay: 300});
    onLangChange(() => typeOut(line));
  }

  /* ---------- HUD clock (Shanghai) ---------- */
  const clock = document.getElementById('hud-clock');
  const fmt = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);
}

/* ↑ ↑ ↓ ↓ ← → ← → B A */
export function initKonami() {
  const code = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let i = 0;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    i = k === code[i] ? i + 1 : k === code[0] ? 1 : 0;
    if (i === code.length) { i = 0; dispatchEvent(new Event('warp')); }
  });
  document.querySelectorAll('[data-warp]').forEach(b => b.addEventListener('click', () => dispatchEvent(new Event('warp'))));
}
