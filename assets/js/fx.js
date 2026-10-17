/* Text effects: typing, and "decoding" (random glyphs that settle into the real text).
   Each call cancels any earlier effect still running on the same element. */
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
const BLOCKS = '█▓▒░▚▞▙▟';
const pick = s => s[Math.random() * s.length | 0];
const isCJK = c => /[⺀-鿿豈-﫿＀-￯]/.test(c);

export function scramble(el, duration = 760) {
  const final = el.textContent;
  const id = el._fx = (el._fx || 0) + 1;
  const chars = [...final];
  const at = chars.map((_, i) => (i / Math.max(1, chars.length - 1)) * duration * .6 + Math.random() * duration * .4);
  const t0 = performance.now();
  let swap = 0;
  const frame = now => {
    if (el._fx !== id) return;
    const t = now - t0;
    if (t >= duration) { el.textContent = final; return; }
    if (now - swap > 50) {
      swap = now;
      el.textContent = chars.map((c, i) => c === ' ' || t >= at[i] ? c : pick(isCJK(c) ? BLOCKS : LATIN)).join('');
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function typeOut(el, {delay = 0, speed = 30} = {}) {
  const chars = [...el.textContent];
  const id = el._fx = (el._fx || 0) + 1;
  el.textContent = '';
  let i = 0;
  const step = () => {
    if (el._fx !== id) return;
    el.textContent = chars.slice(0, ++i).join('');
    if (i < chars.length) setTimeout(step, speed + Math.random() * 40);
  };
  setTimeout(step, delay);
}
