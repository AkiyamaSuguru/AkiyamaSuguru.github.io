/* Starfield background: one canvas, ~30 fps, paused while the tab is hidden.
   Stars drift with a slight parallax on scroll; the occasional meteor crosses the sky. */
export function initSky({still}) {
  const cv = document.getElementById('sky');
  if (!cv) return;
  const ctx = cv.getContext('2d', {alpha: false});
  let W, H, stars = [], meteors = [], sy = scrollY, last = 0, raf = 0, queued = false;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({length: Math.round(Math.min(320, W * H / 4500))}, () => {
      const z = Math.random();
      return {x: Math.random() * W, y: Math.random() * H, z, r: z < .9 ? .3 + z * .6 : .9 + Math.random() * .5,
              t: Math.random() * 6.283, s: .5 + Math.random() * 1.3,
              c: Math.random() < .07 ? '#ffd9c2' : Math.random() < .14 ? '#cfe0ff' : '#fff'};
    });
    draw(performance.now());
  }

  function draw(t) {
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      const base = .3 + .7 * s.z;
      ctx.globalAlpha = still ? base * .8 : base * (.6 + .4 * Math.sin(t / 1000 * s.s + s.t));
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, ((s.y - sy * (.02 + s.z * .1)) % H + H) % H, s.r, 0, 6.283); ctx.fill();
    }
    for (const m of meteors) {
      const tx = m.x - m.vx * 16, ty = m.y - m.vy * 16;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = m.life; ctx.strokeStyle = g; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < 33) return;
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
