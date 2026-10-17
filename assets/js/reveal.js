/* Scroll reveal (staggered among siblings), number count-up, and pausing SVG animations off-screen. */
export function initReveal({reduce}) {
  const items = [...document.querySelectorAll('.reveal')];
  items.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--i', sibs.indexOf(el));
  });

  const show = el => {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(n => countUp(n, reduce));
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    /* reveal anything on screen, and anything already scrolled past (e.g. after a jump link) */
    if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
    show(e.target);
    io.unobserve(e.target);
  }), {threshold: .12, rootMargin: '0px 0px -5% 0px'});
  items.forEach(el => io.observe(el));

  const vis = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('playing', e.isIntersecting)));
  document.querySelectorAll('.viz, .diagram').forEach(v => vis.observe(v));
}

function countUp(el, reduce) {
  if (reduce || el.dataset.counted) return;
  el.dataset.counted = '1';
  const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now();
  (function f(now) {
    const p = Math.min(1, (now - t0) / 1600);
    el.textContent = (end * (1 - Math.pow(1 - p, 4))).toFixed(dec);
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
