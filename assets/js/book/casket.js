/* The case. Press the astrolabe's rule: it turns upright and unlocks, a line of light appears
   at the seam, the doors spring loose and swing open on damped springs (the right one a beat
   later), light and gold dust spill out, the camera leans in, the book rises and opens. */
import {tween, spring, wait, motion, easeInOut, easeOut, easeIn, lerp} from './motion.js';

export function createCase({sound, scene, book, still, onOpened}) {
  const body = document.body;
  const world = document.getElementById('world'), box = document.getElementById('case'), bookEl = document.getElementById('book');
  const doorL = document.getElementById('door-l'), doorR = document.getElementById('door-r'), latch = document.getElementById('latch');
  const px = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  const set = (el, k, v) => el.style.setProperty(k, v);
  const angle = {L: 0, R: 0};
  let opening = false;

  function door(side, a) {
    angle[side] = a;
    const el = side === 'L' ? doorL : doorR, r = Math.abs(a) * Math.PI / 180;
    set(box, side === 'L' ? '--aL' : '--aR', a.toFixed(2));
    set(el, '--shade', Math.min(.55, Math.sin(r) * .5).toFixed(3));
    set(el, '--lit', Math.max(0, Math.min(.16, (Math.abs(a) - 70) / 260)).toFixed(3));
    set(box, '--glow', Math.min(1, Math.max(angle.L, angle.R) / 95).toFixed(3));
  }

  function closed() {
    motion.reset();
    body.classList.add('at-case');
    body.classList.remove('opening', 'reading');
    box.style.display = '';
    set(world, '--tilt', '-12deg'); set(world, '--zoom', .84); set(world, '--wy', '0px');
    set(box, '--case-y', '0px'); set(box, '--case-o', 1); set(box, '--seam', 0);
    door('L', 0); door('R', 0);
    set(latch, '--latch-r', '0deg'); set(latch, '--latch-s', 1);
    latch.disabled = false;
    book.reset();
    set(bookEl, '--bz', (-px('--CD') + 4) + 'px');
    scene.setAmbient(false);
    opening = false;
  }

  async function open({instant = false} = {}) {
    if (opening) return;
    opening = true;
    if (instant || still) motion.skip();
    latch.disabled = true;
    sound.unlock();
    body.classList.add('opening');
    body.classList.remove('at-case');

    /* 1. press the rule, then let it swing upright */
    sound.play('click');
    await tween({dur: 130, ease: easeOut, onUpdate: e => set(latch, '--latch-s', (1 - .07 * e).toFixed(3))});
    sound.play('latch');
    tween({dur: 240, ease: easeOut, onUpdate: e => set(latch, '--latch-s', (.93 + .07 * e).toFixed(3))});
    await spring({from: 0, to: 90, k: 240, c: 21, onUpdate: v => set(latch, '--latch-r', v.toFixed(2) + 'deg')});

    /* 2. light at the seam; the doors spring loose a few degrees */
    sound.play('chime');
    tween({dur: 450, ease: easeOut, onUpdate: e => set(box, '--seam', e.toFixed(3))});
    await wait(240);
    await Promise.all([
      spring({from: 0, to: 6, k: 420, c: 22, onUpdate: v => door('L', v)}),
      wait(45).then(() => spring({from: 0, to: 4.5, k: 400, c: 22, onUpdate: v => door('R', v)})),
    ]);
    await wait(140);

    /* 3. the doors swing wide; light and gold dust spill out; the camera leans in */
    sound.play('doors');
    const r = box.getBoundingClientRect();
    scene.burst(r.left + r.width / 2, r.top + r.height / 2, 110, r.height * .75);
    tween({dur: 700, ease: easeIn, onUpdate: e => set(box, '--seam', (1 - e).toFixed(3))});
    tween({dur: 1800, ease: easeOut, onUpdate: e => {
      set(world, '--tilt', lerp(-12, -5, e).toFixed(2) + 'deg');
      set(world, '--zoom', lerp(.84, .95, e).toFixed(4));
    }});
    await Promise.all([
      spring({from: 6, to: 114, k: 30, c: 7.2, onUpdate: v => door('L', v)}),
      wait(90).then(() => spring({from: 4.5, to: 110, k: 28, c: 7, onUpdate: v => door('R', v)})),
    ]);

    /* 4. the book rises out of the case while the case sinks away */
    sound.play('lift');
    const CD = px('--CD'), CH = px('--CH'), P = px('--P'), z0 = -CD + 4;
    tween({dur: 1500, ease: easeInOut, onUpdate: e => {
      set(world, '--tilt', lerp(-5, 0, e).toFixed(2) + 'deg');
      set(world, '--zoom', lerp(.95, 1, e).toFixed(4));
    }});
    wait(420).then(() => tween({dur: 1100, ease: easeIn, onUpdate: e => {
      set(box, '--case-y', (e * CH * 1.05).toFixed(1) + 'px');
      set(box, '--case-o', (1 - e).toFixed(3));
    }}));
    await tween({dur: 900, ease: easeInOut, onUpdate: e => set(bookEl, '--bz', lerp(z0, P * .16, e).toFixed(1) + 'px')});
    await tween({dur: 750, ease: easeOut, onUpdate: e => set(bookEl, '--bz', lerp(P * .16, 0, e).toFixed(1) + 'px')});
    box.style.display = 'none';

    /* 5. a breath, then the cover opens */
    await wait(420);
    await book.go(1, {push: false});
    motion.reset();
    body.classList.remove('opening');
    body.classList.add('reading');
    scene.setAmbient(true);
    book.activate(true);
    opening = false;
    onOpened?.();
  }

  latch.addEventListener('click', e => { e.stopPropagation(); open(); });
  box.addEventListener('click', () => { if (body.classList.contains('at-case')) open(); });
  document.getElementById('skip').addEventListener('click', () => motion.skip());
  addEventListener('keydown', e => { if (e.key === 'Escape' && opening) motion.skip(); });

  closed();
  return {
    reset: closed,
    open,
    /* keep the book seated in the case after a resize */
    relayout() { if (body.classList.contains('at-case')) set(bookEl, '--bz', (-px('--CD') + 4) + 'px'); },
  };
}
