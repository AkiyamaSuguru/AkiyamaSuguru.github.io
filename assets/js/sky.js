/* Pixel starfield: square stars snapped to the pixel grid with stepped twinkling,
   pixel-trail meteors, slight parallax on scroll, and a warp-speed mode (event "warp").
   ~30 fps normally, 60 fps during warp, paused while the tab is hidden. */
export function initSky({still}) {
  const cv = document.getElementById('sky');
  if (!cv) return;
  const ctx = cv.getContext('2d', {alpha: false});
  let W, H, stars = [], meteors = [], sy = scrollY, last = 0, raf = 0, queued = false, warp = null;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({length: Math.round(Math.min(340, W * H / 4200))}, () => {
      const z = Math.random();
      return {x: Math.random() * W, y: Math.random() * H, z, size: z > .8 ? 2 : 1, cross: z > .975,
              t: Math.random() * 6.283, s: .4 + Math.random() * 1.2,
              c: Math.random() < .08 ? '#ffd9c2' : Math.random() < .16 ? '#bcd4ff' : '#fff'};
    });
    draw(performance.now());
  }

  function draw(t) {
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const dim = warp ? 1 - .7 * warpLevel(t) : 1;
    for (const s of stars) {
      const base = .3 + .7 * s.z;
      let a = still ? base * .8 : base * (.55 + .45 * Math.sin(t / 1000 * s.s + s.t));
      a = Math.round(a * 4) / 4 * dim;           // stepped, 8-bit style twinkle
      if (a <= 0) continue;
      const x = Math.round(s.x), y = Math.round(((s.y - sy * (.02 + s.z * .1)) % H + H) % H), r = s.size;
      ctx.globalAlpha = a; ctx.fillStyle = s.c;
      ctx.fillRect(x, y, r, r);
      if (s.cross && a > .5) {
        ctx.globalAlpha = a * .4;
        ctx.fillRect(x - r, y, r, r); ctx.fillRect(x + r, y, r, r);
        ctx.fillRect(x, y - r, r, r); ctx.fillRect(x, y + r, r, r);
      }
    }
    for (const m of meteors) {
      for (let i = 0; i < 18; i++) {
        ctx.globalAlpha = m.life * (1 - i / 18);
        ctx.fillStyle = i < 2 ? '#fff' : '#bcd4ff';
        ctx.fillRect(Math.round(m.x - m.vx * i * .32), Math.round(m.y - m.vy * i * .32), 2, 2);
      }
    }
    if (warp) drawWarp(t);
  }

  /* ---------- warp ---------- */
  const warpLevel = t => {
    const k = (t - warp.t0) / 2800;
    return k < .18 ? k / .18 : k > .7 ? Math.max(0, (1 - k) / .3) : 1;
  };
  const streak = () => ({a: Math.random() * 6.283, r: 4 + Math.random() * 60, v: .6 + Math.random() * 1.6,
                         c: Math.random() < .15 ? '#ffb38f' : Math.random() < .35 ? '#9cc6ff' : '#fff'});
  function drawWarp(t) {
    const L = warpLevel(t), cx = W / 2, cy = H * .42, max = Math.hypot(W, H) * .6;
    ctx.lineCap = 'square';
    for (const s of warp.streaks) {
      const r0 = s.r;
      s.r += s.v * (1 + L * 22) * (.25 + s.r / 140);
      if (s.r > max) Object.assign(s, streak(), {r: 4 + Math.random() * 30});
      const c = Math.cos(s.a), n = Math.sin(s.a);
      ctx.globalAlpha = Math.min(1, L * (.35 + s.r / max));
      ctx.strokeStyle = s.c;
      ctx.lineWidth = 1 + s.r / max * 2.5;
      ctx.beginPath(); ctx.moveTo(cx + c * r0, cy + n * r0); ctx.lineTo(cx + c * s.r, cy + n * s.r); ctx.stroke();
    }
    if (t - warp.t0 > 2800) warp = null;
  }
  addEventListener('warp', () => {
    if (still) return;
    warp = {t0: performance.now(), streaks: Array.from({length: 260}, streak)};
  });

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!warp && t - last < 33) return;           // ~30 fps is plenty for a background
    last = t;
    if (Math.random() < .004 && meteors.length < 2)
      meteors.push({x: W * (.2 + Math.random() * .8), y: H * Math.random() * .45, vx: -(9 + Math.random() * 5), vy: 4 + Math.random() * 2, life: 1});
    for (const m of meteors) { m.x += m.vx; m.y += m.vy; m.life -= .028; }
    meteors = meteors.filter(m => m.life > 0);
    draw(t);
  }

  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  addEventListener('scroll', () => {
    sy = scrollY;
    if (still && !queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(0); }); }
  }, {passive: true});
  if (!still) {
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    });
  }
}
