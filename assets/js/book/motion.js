/* Small animation toolkit: eased tweens, damped springs and waits, all of which finish
   at once when the opening is skipped. */
let skipping = false;

export const motion = {
  skip() { skipping = true; },
  reset() { skipping = false; },
  get skipping() { return skipping; },
};

export const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeIn = t => t * t * t;
export const lerp = (a, b, t) => a + (b - a) * t;

export function wait(ms) {
  return new Promise(res => {
    const t0 = performance.now();
    (function f(now) { if (skipping || now - t0 >= ms) return res(); requestAnimationFrame(f); })(t0);
  });
}

export function tween({dur, ease = easeInOut, onUpdate}) {
  return new Promise(res => {
    const t0 = performance.now();
    (function f(now) {
      const t = skipping ? 1 : Math.min(1, (now - t0) / dur);
      onUpdate(ease(t));
      if (t < 1) requestAnimationFrame(f); else res();
    })(t0);
  });
}

/** damped spring from `from` to `to`; k = stiffness (1/s²), c = damping (1/s) */
export function spring({from, to, k, c, v = 0, onUpdate, restDelta = .15, restSpeed = .5}) {
  return new Promise(res => {
    let x = from, last = performance.now();
    (function f(now) {
      if (skipping) { onUpdate(to); return res(); }
      const dt = Math.min(.05, (now - last) / 1000), steps = Math.ceil(dt * 240);
      last = now;
      for (let i = 0; i < steps; i++) {
        const h = dt / steps;
        v += (-k * (x - to) - c * v) * h;
        x += v * h;
      }
      onUpdate(x);
      if (Math.abs(x - to) < restDelta && Math.abs(v) < restSpeed) { onUpdate(to); return res(); }
      requestAnimationFrame(f);
    })(last);
  });
}
