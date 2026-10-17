/* Pixel sprites: a bitmap drawn as square particles on a canvas.
   The particles fly or scan in, push away from the pointer and spring back, burst on click,
   and now and then glitch (RGB split), catch a scan light, or blink (alternate colours).
   Positions are kept in grid cells and snapped to device pixels, so the art stays crisp. */

const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = t => 1 - Math.pow(1 - t, 3);

export class PixelSprite {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} o
   *   cells   [{x, y, color, alt?}] in grid units (alt = colour while blinking)
   *   cols, rows   grid size
   *   box     element whose width sets the size (defaults to the canvas parent)
   *   maxCell largest cell size in CSS px
   *   gap     gap between cells as a fraction of a cell (LED look)
   *   ghost   colour of unlit cells drawn behind the sprite, or null
   *   intro   'fly' | 'scan'
   *   still   no animation at all (reduced motion)
   *   hover   'repel' (pixels move out of the pointer's way) or 'glow' (a light follows the pointer)
   *   repel, force  pointer radius (CSS px) and push strength
   *   blink   [min, max] ms between blinks, or null
   */
  constructor(canvas, o) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = {gap: 0, ghost: null, intro: 'fly', still: false, blink: null, maxCell: 64, repel: 70, force: .5, hover: 'repel',
              glitch: [4500, 9000], scan: [5000, 9000], ...o};
    this.box = o.box || canvas.parentElement;
    this.parts = o.cells.map(c => ({...c, px: c.x, py: c.y, vx: 0, vy: 0, a: 1, t0: 0, sx: c.x, sy: c.y}));
    this.ptr = null;
    this.raf = 0;
    this.visible = true;
    this.dirty = true;
    this.fx = {glitchUntil: 0, bands: [], scanFrom: -1e9, blinkUntil: 0};
    const now = performance.now();
    this.next = {glitch: now + rand(2500, 4500), scan: now + rand(1800, 3000), blink: now + rand(2000, 4000)};

    this.resize();
    if (!this.o.still) this.introduce(this.o.intro);
    new ResizeObserver(() => this.resize()).observe(this.box);
    this.bind();
  }

  /* ---------- sizing ---------- */
  resize() {
    const {cols, rows, maxCell} = this.o;
    const dpr = this.dpr = Math.min(devicePixelRatio || 1, 2);
    const avail = this.box.clientWidth || cols;
    const cellDev = Math.max(1, Math.floor(Math.min(avail / cols, maxCell) * dpr));
    if (cellDev === this.cellDev) return;
    this.cellDev = cellDev;
    this.cv.width = cellDev * cols;
    this.cv.height = cellDev * rows;
    this.cv.style.width = `${this.cv.width / dpr}px`;
    this.cv.style.height = `${this.cv.height / dpr}px`;
    this.ghostLayer = null;
    if (this.o.ghost) {
      const g = this.ghostLayer = document.createElement('canvas');
      g.width = this.cv.width; g.height = this.cv.height;
      const c = g.getContext('2d'), gap = Math.max(1, Math.round(this.o.gap * cellDev));
      c.fillStyle = this.o.ghost;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
        c.fillRect(x * cellDev, y * cellDev, cellDev - gap, cellDev - gap);
    }
    this.dirty = true;
    if (!this.raf) this.draw(performance.now());
  }

  /* ---------- entrance ---------- */
  introduce(kind) {
    const now = performance.now(), {cols, rows} = this.o;
    this.introDur = kind === 'scan' ? 520 : 1100;
    let last = 0;
    for (const p of this.parts) {
      if (kind === 'scan') {
        /* materialise row by row behind a scan line, with a little sideways jitter */
        p.t0 = now + 120 + (p.y / rows) * 900 + rand(0, 140);
        p.sx = p.x + rand(-1.6, 1.6); p.sy = p.y + rand(-.4, .4);
      } else {
        /* fly in from a scattered cloud, left letters first */
        p.t0 = now + 150 + (p.x / cols) * 380 + rand(0, 260);
        p.sx = p.x + rand(-cols * .5, cols * .5); p.sy = p.y + rand(-rows * 2.2, rows * 2.2);
      }
      p.px = p.sx; p.py = p.sy; p.a = 0;
      last = Math.max(last, p.t0);
    }
    this.introKind = kind;
    this.introEnd = last + this.introDur;
    this.fx.scanFrom = kind === 'scan' ? now + 120 : -1e9;
    this.wake();
  }

  /* ---------- interaction ---------- */
  bind() {
    if (this.o.still) return;
    const local = e => {
      const r = this.cv.getBoundingClientRect(), cell = this.cellDev / this.dpr;
      return {x: (e.clientX - r.left) / cell, y: (e.clientY - r.top) / cell};
    };
    this.cv.addEventListener('pointermove', e => { this.ptr = local(e); this.dirty = true; this.wake(); });
    this.cv.addEventListener('pointerleave', () => { this.ptr = null; this.dirty = true; this.wake(); });
    this.cv.addEventListener('pointerdown', e => this.burst(local(e)));
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.visible ? this.wake() : this.sleep(); }).observe(this.cv);
    document.addEventListener('visibilitychange', () => document.hidden ? this.sleep() : this.wake());
  }

  burst(at, power = 1) {
    if (this.o.still) return;
    for (const p of this.parts) {
      const dx = p.px + .5 - at.x, dy = p.py + .5 - at.y, d = Math.hypot(dx, dy) || 1;
      const f = power * rand(.5, 1.2) * (.6 + 3 / (d + 2));
      p.vx += dx / d * f + rand(-.4, .4);
      p.vy += dy / d * f + rand(-.4, .4);
    }
    this.glitch(280);
    this.wake();
  }

  glitch(ms = rand(140, 260)) {
    const {rows} = this.o, bands = [];
    for (let i = 0, n = 2 + (Math.random() * 3 | 0); i < n; i++) {
      const y0 = Math.random() * rows | 0;
      bands.push({y0, y1: y0 + 1 + (Math.random() * rows * .25 | 0), dx: (Math.random() < .5 ? -1 : 1) * Math.ceil(rand(.3, 2.5))});
    }
    this.fx.bands = bands;
    this.fx.glitchUntil = performance.now() + ms;
    this.wake();
  }

  /* ---------- loop ---------- */
  wake() {
    if (this.raf || !this.visible || document.hidden) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  sleep() { cancelAnimationFrame(this.raf); clearTimeout(this.idle); this.raf = 0; }

  tick = now => {
    this.raf = 0;
    const dt = Math.min(3, (now - this.last) / 16.667);
    this.last = now;
    const moving = this.step(now, dt);
    const effects = this.schedule(now);
    if (moving || effects || this.dirty) { this.draw(now); this.dirty = moving || effects; }
    /* keep ticking while anything moves; otherwise idle until the next timed effect */
    if (moving || effects || this.ptr) this.raf = requestAnimationFrame(this.tick);
    else if (!this.o.still) {
      const wait = Math.max(16, Math.min(this.next.glitch, this.next.scan, this.o.blink ? this.next.blink : Infinity) - now);
      clearTimeout(this.idle);
      this.idle = setTimeout(() => this.wake(), wait);
    }
  };

  step(now, dt) {
    if (this.o.still) return false;
    let moving = false;
    const intro = now < this.introEnd;
    const cell = this.cellDev / this.dpr, R = this.o.repel / cell, R2 = R * R, ptr = this.ptr;
    const k = .085 * dt, damp = Math.pow(.8, dt);
    for (const p of this.parts) {
      if (intro && now < p.t0 + this.introDur) {
        const t = (now - p.t0) / this.introDur;
        if (t <= 0) { p.a = 0; moving = true; continue; }
        const e = easeOut(t);
        p.px = p.sx + (p.x - p.sx) * e;
        p.py = p.sy + (p.y - p.sy) * e;
        p.a = Math.min(1, t * 2.4);
        p.flash = this.introKind === 'scan' && t < .45;
        moving = true;
        continue;
      }
      p.a = 1; p.flash = false;
      if (ptr && this.o.hover === 'repel') {
        const dx = p.px + .5 - ptr.x, dy = p.py + .5 - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || .01, f = (1 - d / R) * this.o.force * dt;
          p.vx += dx / d * f; p.vy += dy / d * f;
        }
      }
      p.vx = (p.vx + (p.x - p.px) * k) * damp;
      p.vy = (p.vy + (p.y - p.py) * k) * damp;
      p.px += p.vx * dt; p.py += p.vy * dt;
      if (Math.abs(p.vx) + Math.abs(p.vy) > .003 || Math.abs(p.x - p.px) + Math.abs(p.y - p.py) > .003) moving = true;
      else { p.px = p.x; p.py = p.y; p.vx = p.vy = 0; }
    }
    return moving;
  }

  /* timed effects; returns true while one is running */
  schedule(now) {
    const fx = this.fx, o = this.o;
    if (!o.still) {
      if (now >= this.next.glitch) { this.glitch(); this.next.glitch = now + rand(...o.glitch); }
      if (now >= this.next.scan) { fx.scanFrom = now; this.next.scan = now + rand(...o.scan); }
      if (o.blink && now >= this.next.blink) { fx.blinkUntil = now + 150; this.next.blink = now + rand(...o.blink); }
    }
    return now < fx.glitchUntil || now - fx.scanFrom < 1300 || now < fx.blinkUntil;
  }

  /* ---------- drawing ---------- */
  draw(now) {
    const {ctx, cellDev: s, parts, fx} = this, W = this.cv.width, H = this.cv.height;
    const gap = this.o.gap ? Math.max(1, Math.round(this.o.gap * s)) : 0;
    const glitching = now < fx.glitchUntil, blinking = now < fx.blinkUntil;
    const shift = y => { for (const b of fx.bands) if (y >= b.y0 && y < b.y1) return b.dx; return 0; };

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (this.ghostLayer) ctx.drawImage(this.ghostLayer, 0, 0);

    const rect = (p, dx = 0) => {
      const x = (p.px + dx) * s, y = p.py * s, X = Math.round(x), Y = Math.round(y);
      ctx.fillRect(X, Y, Math.round(x + s) - X - gap, Math.round(y + s) - Y - gap);
    };
    let col = null, alpha = 1;
    for (const p of parts) {
      if (p.a <= 0) continue;
      const c = p.flash ? '#eaf4ff' : blinking && p.alt ? p.alt : p.color;
      if (c !== col) { ctx.fillStyle = col = c; }
      if (p.a !== alpha) { ctx.globalAlpha = alpha = p.a; }
      rect(p, glitching ? shift(p.y) : 0);
    }
    ctx.globalAlpha = 1;

    if (glitching) {
      /* chromatic aberration: red and cyan ghosts pulled apart */
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .5;
      for (const [color, off] of [['#ff2a6d', .35], ['#21e6ff', -.35]]) {
        ctx.fillStyle = color;
        for (const p of parts) if (p.a > 0) rect(p, shift(p.y) + off);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    if (this.ptr && this.o.hover === 'glow') {
      /* a stepped light around the pointer, cell by cell */
      const R = this.o.repel / (s / this.dpr), {x: mx, y: my} = this.ptr;
      for (const p of parts) {
        const d = Math.hypot(p.px + .5 - mx, p.py + .5 - my);
        if (d >= R || p.a <= 0) continue;
        ctx.globalAlpha = Math.ceil((1 - d / R) * 4) / 4 * .42;
        ctx.fillStyle = '#a8eeff';
        rect(p);
      }
      ctx.globalAlpha = 1;
    }

    const st = (now - fx.scanFrom) / 1300;
    if (st >= 0 && st < 1) {
      /* a light band sweeping down, painted only where there are pixels */
      const y = (-.15 + st * 1.3) * H, h = H * .14;
      const g = ctx.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, 'rgba(120,220,255,0)');
      g.addColorStop(.5, 'rgba(160,235,255,.55)');
      g.addColorStop(1, 'rgba(120,220,255,0)');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = g;
      ctx.fillRect(0, y - h, W, h * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}

/* ---------- a tiny bold pixel font (only the letters the name needs; add more as required) ---------- */
const FONT = {
  A: ['.####.', '##..##', '##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##', '##..##', '##..##'],
  J: ['..####', '....##', '....##', '....##', '....##', '....##', '....##', '##..##', '##..##', '##..##', '.####.'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##'],
  Y: ['##..##', '##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
};

/** Lay out text in the pixel font; a drop shadow sits one cell down and right. */
export function textCells(text, {fill = '#f6f8fb', fill2 = '#dde6fb', shadow = null, space = 3, tracking = 1} = {}) {
  const rows = 11, cells = [], main = [];
  let x = 0;
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch];
    if (!g) { x += space; continue; }
    g.forEach((line, y) => [...line].forEach((v, i) => { if (v === '#') main.push({x: x + i, y}); }));
    x += g[0].length + tracking;
  }
  const cols = x - tracking + (shadow ? 1 : 0);
  if (shadow) for (const c of main) cells.push({x: c.x + 1, y: c.y + 1, color: shadow});
  /* cool the lower half very slightly for a bit of depth */
  for (const c of main) cells.push({...c, color: c.y > 5 ? fill2 : fill});
  return {cols, rows: rows + (shadow ? 1 : 0), cells};
}

/** Read a sprite sheet image: frame 0 is the art, frame 1 (to its right) the blink frame. */
export async function imageCells(src, size) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d', {willReadFrequently: true});
  ctx.drawImage(img, 0, 0);
  const {data, width} = ctx.getImageData(0, 0, c.width, c.height);
  const at = (x, y) => {
    const i = (y * width + x) * 4;
    return data[i + 3] ? `rgb(${data[i]},${data[i + 1]},${data[i + 2]})` : null;
  };
  const cells = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const color = at(x, y);
    if (!color) continue;
    const alt = width >= size * 2 ? at(x + size, y) : null;
    cells.push(alt && alt !== color ? {x, y, color, alt} : {x, y, color});
  }
  return {cols: size, rows: size, cells};
}
