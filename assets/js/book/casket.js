// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* The case. While it is closed it is an object in 3D: drag it (or use the arrow keys) to turn it
   round and look at it from any side; the light falls on each face as it turns. Press the
   astrolabe's rule to open it: the case turns back to face you, the rule swings upright and
   unlocks, a line of light appears at the seam, the doors spring loose and swing all the way open
   until they lie flat, light and gold dust spill out, the book rises out of the case while the case
   sinks away, and the book, now flat on the table, opens its cover. */
import {tween, spring, wait, motion, easeInOut, easeOut, easeIn, lerp} from './motion.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RAD = Math.PI / 180;

export function createCase({sound, scene, book, still, onOpened}) {
  const body = document.body, stage = document.getElementById('stage');
  const world = document.getElementById('world'), box = document.getElementById('case'), bookEl = document.getElementById('book');
  const doorL = document.getElementById('door-l'), doorR = document.getElementById('door-r'), latch = document.getElementById('latch');
  const px = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  const set = (el, k, v) => el.style.setProperty(k, v);
  const angle = {L: 0, R: 0};
  let opening = false;

  function door(side, a) {
    angle[side] = a;
    const el = side === 'L' ? doorL : doorR, r = Math.abs(a) * RAD;
    set(box, side === 'L' ? '--aL' : '--aR', a.toFixed(2));
    set(el, '--shade', Math.min(.55, Math.sin(Math.min(r, Math.PI / 2)) * .5 * (a > 90 ? Math.max(0, (150 - a) / 60) : 1)).toFixed(3));
    set(el, '--lit', Math.max(0, Math.min(.16, (Math.abs(a) - 70) / 260)).toFixed(3));
    set(box, '--glow', Math.min(1, Math.max(angle.L, angle.R) / 95).toFixed(3));
    /* the rule rides on the left door; it fades as the door folds back, before it can show past the edge */
    if (side === 'L') latch.style.opacity = clamp((115 - a) / 30, 0, 1).toFixed(3);
  }

  /* ---------- turning the closed case ---------- */
  let yaw = 0, pitch = 0, tilt = -12, vy = 0, vp = 0, held = null, coasting = 0, dragged = false;
  /* the light comes from just above and to the left of the viewer, as in an object viewer: whatever
     side faces you is lit, and faces turned edge-on darken */
  const LIGHT = (() => { const v = [-.22, -.32, .92], l = Math.hypot(...v); return v.map(c => c / l); })();
  /* halfway between the light and the eye: a glossy surface shines brightest where it faces this */
  const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], l = Math.hypot(...v); return v.map(c => c / l); })();
  const FACES = {front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, -1, 0], bottom: [0, 1, 0]};
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function orient() {
    set(world, '--yaw', yaw.toFixed(2) + 'deg');
    set(world, '--pitch', pitch.toFixed(2) + 'deg');
    const cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), x = (tilt + pitch) * RAD, cx = Math.cos(x), sx = Math.sin(x);
    /* rotateY(yaw), then rotateX(tilt + pitch), as CSS applies them */
    const turn = ([vx, vy, vz]) => { const x1 = vx * cy + vz * sy, z1 = -vx * sy + vz * cy; return [x1, vy * cx - z1 * sx, vy * sx + z1 * cx]; };
    for (const [name, n] of Object.entries(FACES)) {
      const lit = .38 + .62 * Math.max(0, dot(turn(n), LIGHT));
      set(box, '--sh-' + name, ((1 - lit) * .85).toFixed(3));
    }
    /* front and back alike: a broad glint slides across the cloth as the case turns, brightest when
       the face meets the light; each face measures it along its own x axis (the back's points left) */
    for (const [k, n, across] of [['f', FACES.front, [1, 0, 0]], ['b', FACES.back, [-1, 0, 0]]]) {
      const u = dot(turn(across), HALF), v = dot(turn([0, 1, 0]), HALF);
      set(box, `--glare-${k}x`, clamp(50 + u * 110, 8, 92).toFixed(1) + '%');
      set(box, `--glare-${k}y`, clamp(40 + v * 80, 6, 80).toFixed(1) + '%');
      set(box, `--glare-${k}`, (.26 * Math.max(0, dot(turn(n), HALF)) ** 2).toFixed(3));
    }
  }
  const atCase = () => body.classList.contains('at-case') && !opening;

  stage.addEventListener('pointerdown', e => {
    if (!atCase() || e.button > 0) return;
    held = {id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), moved: false};
    cancelAnimationFrame(coasting);
  });
  addEventListener('pointermove', e => {
    if (!held || e.pointerId !== held.id) return;
    if (!held.moved) {
      if (Math.hypot(e.clientX - held.x0, e.clientY - held.y0) < 6) return;
      held.moved = true;
      body.classList.add('turning-case');
      try { stage.setPointerCapture(held.id); } catch {}
    }
    const now = performance.now(), dt = Math.max(8, now - held.t);
    const dyaw = (e.clientX - held.x) * .45, dpitch = -(e.clientY - held.y) * .32;
    yaw += dyaw;
    pitch = clamp(pitch + dpitch, -52, 40);
    vy = dyaw / dt * 16.7; vp = dpitch / dt * 16.7;   /* degrees per frame */
    held.x = e.clientX; held.y = e.clientY; held.t = now;
    orient();
  }, {passive: true});
  const release = e => {
    if (!held || e.pointerId !== held.id) return;
    const moved = held.moved;
    held = null;
    body.classList.remove('turning-case');
    if (!moved) return;
    dragged = true;
    setTimeout(() => { dragged = false; }, 0);
    coast();
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  /* let go, it keeps turning a little and slows down */
  function coast() {
    let last = performance.now();
    cancelAnimationFrame(coasting);
    (function f(now) {
      const k = Math.min(3, (now - last) / 16.7);
      last = now;
      yaw += vy * k; pitch = clamp(pitch + vp * k, -52, 40);
      vy *= Math.pow(.94, k); vp *= Math.pow(.86, k);
      orient();
      if (Math.abs(vy) > .02 || Math.abs(vp) > .02) coasting = requestAnimationFrame(f);
    })(last);
  }

  /** turn the case to (y, p), the short way round */
  function turnTo(y, p, dur = 650) {
    cancelAnimationFrame(coasting);
    const y0 = yaw, p0 = pitch, y1 = y0 + ((((y - y0) % 360) + 540) % 360 - 180);
    if (Math.abs(y1 - y0) < .5 && Math.abs(p - p0) < .5) { yaw = y1; pitch = p; orient(); return Promise.resolve(); }
    return tween({dur, ease: easeInOut, onUpdate: e => { yaw = lerp(y0, y1, e); pitch = lerp(p0, p, e); orient(); }});
  }

  addEventListener('keydown', e => {
    if (!atCase() || e.metaKey || e.ctrlKey || e.altKey) return;
    const step = {ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, 15], ArrowDown: [0, -15]}[e.key];
    if (!step) return;
    e.preventDefault();
    turnTo(yaw + step[0], clamp(pitch + step[1], -52, 40), 420);
  });

  /* ---------- the case as it was left: closed, facing you ---------- */
  function closed() {
    motion.reset();
    cancelAnimationFrame(coasting);
    body.classList.add('at-case');
    body.classList.remove('opening', 'reading');
    box.style.display = '';
    yaw = pitch = 0; tilt = -12;
    set(world, '--tilt', '-12deg'); set(world, '--zoom', .84); set(world, '--wy', '0px');
    set(box, '--case-y', '0px'); set(box, '--case-o', 1); set(box, '--seam', 0);
    door('L', 0); door('R', 0);
    set(latch, '--latch-r', '0deg'); set(latch, '--latch-s', 1);
    latch.disabled = false;
    book.reset();
    set(bookEl, '--bz', (-px('--CD') + 4) + 'px');
    scene.setAmbient(false);
    orient();
    opening = false;
  }

  /** the door swings all the way round until it lies flat, and settles against its stop */
  function swing(side, from, {k, c, delay = 0}) {
    return wait(delay).then(() => new Promise(res => {
      let x = from, v = 0, last = performance.now(), landed = false;
      (function f(now) {
        if (motion.skipping) { door(side, 180); return res(); }
        const dt = Math.min(.05, (now - last) / 1000), steps = Math.ceil(dt * 240);
        last = now;
        for (let i = 0; i < steps; i++) {
          const h = dt / steps;
          v += (-k * (x - 188) - c * v) * h;   /* it would go a little past flat; the hinge stops it */
          x += v * h;
          if (x >= 180 && v > 0) {
            if (!landed && v > 40) sound.play('land');
            landed = true;
            x = 180; v *= -.2;
          }
        }
        door(side, Math.min(180, x));
        if (landed && Math.abs(v) < 4 && x > 179) { door(side, 180); return res(); }
        requestAnimationFrame(f);
      })(last);
    }));
  }

  async function open({instant = false} = {}) {
    if (opening) return;
    opening = true;
    if (instant || still) motion.skip();
    latch.disabled = true;
    sound.unlock();
    cancelAnimationFrame(coasting);

    /* 0. if it has been turned, the case comes round to face you */
    await turnTo(0, 0, 560);
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

    /* 3. the doors swing wide and lie flat; light and gold dust spill out; the camera draws back
       far enough to see the whole opened case */
    sound.play('doors');
    const r = box.getBoundingClientRect();
    scene.burst(r.left + r.width / 2, r.top + r.height / 2, 110, r.height * .75);
    tween({dur: 700, ease: easeIn, onUpdate: e => set(box, '--seam', (1 - e).toFixed(3))});
    const single = body.classList.contains('single');
    const fit = innerWidth * .94 / (2 * px('--CW')), wide = clamp(fit, single ? .58 : .62, .92);
    tween({dur: 1900, ease: easeInOut, onUpdate: e => {
      tilt = lerp(-12, -7, e);
      set(world, '--tilt', tilt.toFixed(2) + 'deg');
      set(world, '--zoom', lerp(.84, wide, e).toFixed(4));
    }});
    await Promise.all([
      swing('L', 6, {k: 24, c: 6.6}),
      swing('R', 4.5, {k: 23, c: 6.4, delay: 90}),
    ]);
    await wait(260);

    /* 4. the book rises out of the case while the case, doors and all, sinks away */
    sound.play('lift');
    const CD = px('--CD'), CH = px('--CH'), P = px('--P'), z0 = -CD + 4;
    tween({dur: 1500, ease: easeInOut, onUpdate: e => {
      tilt = lerp(-7, 0, e);
      set(world, '--tilt', tilt.toFixed(2) + 'deg');
      set(world, '--zoom', lerp(wide, 1, e).toFixed(4));
    }});
    wait(420).then(() => tween({dur: 1100, ease: easeIn, onUpdate: e => {
      set(box, '--case-y', (e * CH * 1.05).toFixed(1) + 'px');
      set(box, '--case-o', (1 - e).toFixed(3));
    }}));
    await tween({dur: 900, ease: easeInOut, onUpdate: e => set(bookEl, '--bz', lerp(z0, P * .16, e).toFixed(1) + 'px')});
    await tween({dur: 750, ease: easeOut, onUpdate: e => set(bookEl, '--bz', lerp(P * .16, 0, e).toFixed(1) + 'px')});
    box.style.display = 'none';

    /* 5. a breath; the book is now read flat, like an e-book, and its cover opens */
    await wait(420);
    book.flatten();
    await book.go(1, {push: false});
    motion.reset();
    body.classList.remove('opening');
    body.classList.add('reading');
    scene.setAmbient(true);
    book.activate(true);
    opening = false;
    onOpened?.();
  }

  /* only the rule opens the case; the rest of it can only be turned */
  latch.addEventListener('click', e => { e.stopPropagation(); if (!dragged) open(); });
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
