/* Smaller touches: timeline focus, copy buttons, footer year. */
import {copyText} from './toast.js';

export function initExtras() {
  /* ---------- timeline: highlight the entry in the middle of the screen ---------- */
  const rows = [...document.querySelectorAll('#log li')];
  const tio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) rows.forEach(r => r.classList.toggle('current', r === e.target));
  }), {rootMargin: '-45% 0px -45% 0px'});
  rows.forEach(r => tio.observe(r));

  /* ---------- copy buttons (email, quick-start commands) ---------- */
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy)));

  document.getElementById('yr').textContent = new Date().getFullYear();
}
