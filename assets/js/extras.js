/* Smaller touches: avatar tilt, timeline focus, copy buttons, Shanghai clock, footer year. */
import {getLang, onLangChange} from './i18n.js';
import {copyText} from './toast.js';

export function initExtras({reduce}) {
  /* ---------- avatar tilts gently towards the pointer ---------- */
  const avatar = document.getElementById('avatar');
  const hero = document.getElementById('top');
  if (avatar && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = avatar.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        avatar.classList.add('tracking');
        avatar.style.setProperty('--rx', `${(dx * 16).toFixed(2)}deg`);
        avatar.style.setProperty('--ry', `${(-dy * 16).toFixed(2)}deg`);
      });
    });
    hero.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      avatar.classList.remove('tracking');
      avatar.style.setProperty('--rx', '0deg');
      avatar.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- timeline: highlight the entry in the middle of the screen ---------- */
  const rows = [...document.querySelectorAll('#log li')];
  const tio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) rows.forEach(r => r.classList.toggle('current', r === e.target));
  }), {rootMargin: '-45% 0px -45% 0px'});
  rows.forEach(r => tio.observe(r));

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy)));

  /* ---------- Shanghai time ---------- */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false});
  const tick = () => { clock.textContent = fmt.format(new Date()) + (getLang() === 'zh' ? '' : ' CST'); };
  tick(); setInterval(tick, 15000); onLangChange(tick);
  document.getElementById('yr').textContent = new Date().getFullYear();
}
