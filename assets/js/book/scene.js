// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* The night sky behind the case: soft twinkling stars with a little parallax, faint
   constellations, the odd shooting star, and drifting gold dust (bursts when the case opens).
   Drawn cheaply: stars are tiny squares batched by colour, glows are one pre-drawn sprite, and
   both canvases run at 30 frames a second except while the dust bursts. */
export function initScene({still}) {
  const sky = document.getElementById('sky'), dust = document.getElementById('dust');
  const sc = sky.getContext('2d'), dc = dust.getContext('2d');
  let W, H, stars = [], parts = [], meteors = [], mx = 0, my = 0, px = 0, py = 0, ambient = false, raf = 0, last = 0, burstUntil = 0;
  const COLOURS = ['255,250,240', '190,210,255', '255,214,170'];

  /* constellations in screen fractions: the Plough and Cassiopeia */
  const FIGURES = [
    {pts: [[.08, .2], [.12, .17], [.155, .19], [.18, .235], [.215, .225], [.23, .27], [.195, .285]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]},
    {pts: [[.8, .74], [.83, .79], [.86, .755], [.89, .8], [.92, .765]], links: [[0, 1], [1, 2], [2, 3], [3, 4]]},
  ];

  /* one soft glow, drawn once and stamped behind the brightest stars */
  const glow = document.createElement('canvas');
  glow.width = glow.height = 32;
  {
    const g = glow.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, 'rgba(255,248,232,.55)'); r.addColorStop(.35, 'rgba(255,248,232,.16)'); r.addColorStop(1, 'rgba(255,248,232,0)');
    g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  }

  function resize() {
    const small = innerWidth < 700, dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2), R = Math.random;
    W = innerWidth; H = innerHeight;
    for (const c of [sky, dust]) { c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr); }
    sc.setTransform(dpr, 0, 0, dpr, 0, 0);
    dc.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({length: Math.round(Math.min(small ? 260 : 560, W * H / 2800))}, () => {
      const z = R();
      return {x: R() * W, y: R() * H, z, r: .25 + z * z * 1.45, a: .22 + z * .78, tw: .5 + R() * 2.2, ph: R() * 6.28,
              c: R() < .1 ? 2 : R() < .28 ? 1 : 0};
    }).sort((a, b) => a.c - b.c);
    if (!raf) drawSky(performance.now());
  }

  function drawSky(t) {
    px += (mx - px) * .05; py += (my - py) * .05;
    sc.clearRect(0, 0, W, H);
    sc.globalAlpha = 1;
    sc.strokeStyle = 'rgba(212,176,106,.13)';
    sc.lineWidth = .8;
    sc.fillStyle = 'rgba(255,236,200,.75)';
    for (const f of FIGURES) {
      sc.beginPath();
      for (const [a, b] of f.links) { sc.moveTo(f.pts[a][0] * W + px * 6, f.pts[a][1] * H + py * 4); sc.lineTo(f.pts[b][0] * W + px * 6, f.pts[b][1] * H + py * 4); }
      sc.stroke();
      for (const [x, y] of f.pts) sc.fillRect(x * W + px * 6 - 1.3, y * H + py * 4 - 1.3, 2.6, 2.6);
    }
    let colour = -1;
    for (const s of stars) {
      if (s.c !== colour) { colour = s.c; sc.fillStyle = `rgb(${COLOURS[colour]})`; }
      const a = still ? s.a : s.a * (.62 + .38 * Math.sin(t / 1000 * s.tw + s.ph));
      const x = s.x + px * s.z * 16, y = s.y + py * s.z * 11, d = s.r * 1.7;
      sc.globalAlpha = a;
      sc.fillRect(x - d / 2, y - d / 2, d, d);
      if (s.r > 1.15) { sc.globalAlpha = a * .8; sc.drawImage(glow, x - s.r * 4.5, y - s.r * 4.5, s.r * 9, s.r * 9); }
    }
    sc.globalAlpha = 1;
    if (!still && Math.random() < .007 && meteors.length < 1)
      meteors.push({x: W * (.3 + Math.random() * .7), y: H * Math.random() * .35, vx: -(14 + Math.random() * 8), vy: 5.2 + Math.random() * 3.2, life: 1});
    for (const m of meteors) {
      const g = sc.createLinearGradient(m.x, m.y, m.x - m.vx * 7, m.y - m.vy * 7);
      g.addColorStop(0, `rgba(255,246,225,${m.life})`); g.addColorStop(1, 'rgba(255,246,225,0)');
      sc.strokeStyle = g; sc.lineWidth = 1.3;
      sc.beginPath(); sc.moveTo(m.x, m.y); sc.lineTo(m.x - m.vx * 7, m.y - m.vy * 7); sc.stroke();
      m.x += m.vx; m.y += m.vy; m.life -= .044;
    }
    meteors = meteors.filter(m => m.life > 0);
  }

  function drawDust(t, step) {
    if (!parts.length && !ambient) return;
    dc.clearRect(0, 0, W, H);
    if (ambient && !still && Math.random() < .12 * step) {
      const R = Math.random;
      parts.push({x: W * (.25 + R() * .5), y: H * (.35 + R() * .5), vx: (R() - .5) * .15, vy: -(.12 + R() * .3), life: 1, decay: .003 + R() * .003, size: .5 + R() * 1.2, tw: R() * 6});
    }
    for (const p of parts) {
      p.x += p.vx * step; p.y += p.vy * step; p.vy *= Math.pow(.996, step); p.vx *= Math.pow(.995, step); p.life -= p.decay * step;
      const a = Math.max(0, p.life) * (.55 + .45 * Math.sin(t * .008 + p.tw));
      dc.globalAlpha = a * .22;
      dc.drawImage(glow, p.x - p.size * 3.5, p.y - p.size * 3.5, p.size * 7, p.size * 7);
      dc.globalAlpha = a;
      dc.fillStyle = 'rgb(255,244,214)';
      dc.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    dc.globalAlpha = 1;
    parts = parts.filter(p => p.life > 0);
    if (!parts.length) dc.clearRect(0, 0, W, H);
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    const fast = t < burstUntil;
    if (!fast && t - last < 33) return;
    const step = Math.min(3, (t - last) / 16.7);
    last = t;
    drawSky(t);
    drawDust(t, step);
  }

  resize();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  addEventListener('pointermove', e => { mx = e.clientX / W - .5; my = e.clientY / H - .5; }, {passive: true});
  if (!still) {
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); raf = document.hidden ? 0 : requestAnimationFrame(loop); });
  }

  return {
    /** gold dust rising from a vertical slit centred on (x, y) */
    burst(x, y, n = 70, spread = 200) {
      if (still) return;
      const R = Math.random;
      burstUntil = performance.now() + 4000;
      for (let i = 0; i < n; i++)
        parts.push({x: x + (R() - .5) * 30, y: y + (R() - .5) * spread, vx: (R() - .5) * 1.4, vy: -(.2 + R() * 1.3), life: 1, decay: .004 + R() * .006, size: .5 + R() * 1.6, tw: R() * 6});
    },
    setAmbient(on) { ambient = on && innerWidth >= 700; },
  };
}
