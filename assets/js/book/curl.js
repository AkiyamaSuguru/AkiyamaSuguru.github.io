// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* Page curl: the construction e-book readers use for their "realistic" page turn. The lifted
   corner rolls the paper over along two quadratic curves, the folded-back flap shows the other
   side, and the page beneath shows through where the sheet has lifted away.

   Sheet coordinates: the spine at x = 0 and the top edge at y = 0; the page is W wide. The free
   corner f = (W, fy), with fy = 0 (top corner) or the page height (bottom corner), has been
   lifted to a. The fold is the perpendicular bisector of a and f; it meets the corner's edge at e
   and the outer edge at h. The roll starts at c and j and its crest runs from d to i; b and k are
   where the roll meets the straight edges of the flap.
   - kappa (0 to 1) is how round the roll is; 0 is a crisp flat fold.
   - bound keeps the roll from passing the spine, as a sewn page must. */

const mid = (p, q) => ({x: (p.x + q.x) / 2, y: (p.y + q.y) / 2});
const FAR = 1e5;
const tame = v => Math.max(-FAR, Math.min(FAR, v));

function isect(p1, p2, p3, p4) {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-9) return {x: p2.x, y: p2.y};
  const u = p1.x * p2.y - p1.y * p2.x, v = p3.x * p4.y - p3.y * p4.x;
  return {x: tame((u * (p3.x - p4.x) - (p1.x - p2.x) * v) / d), y: tame((u * (p3.y - p4.y) - (p1.y - p2.y) * v) / d)};
}

export function curl(ax, ay, fy, W, {kappa = 1, bound = true} = {}) {
  const fx = W;
  /* the construction needs the corner strictly inside its own two edges */
  ax = Math.min(ax, fx - .5);
  ay = fy > 0 ? Math.min(ay, fy - .5) : Math.max(ay, fy + .5);
  const solve = (x, y) => {
    const gx = (x + fx) / 2, gy = (y + fy) / 2;
    const ex = tame(gx - (fy - gy) * (fy - gy) / (fx - gx)), hy = tame(gy - (fx - gx) * (fx - gx) / (fy - gy));
    return {ex, hy, cx: ex - kappa * (fx - ex) / 2};
  };
  let s = solve(ax, ay);
  if (bound && s.cx < 0) {
    /* pull the corner back along its path until the roll starts exactly at the spine */
    let lo = 0, hi = 1;
    for (let n = 0; n < 24; n++) {
      const m = (lo + hi) / 2;
      if (solve(fx + (ax - fx) * m, fy + (ay - fy) * m).cx < 0) hi = m; else lo = m;
    }
    ax = fx + (ax - fx) * lo; ay = fy + (ay - fy) * lo;
    s = solve(ax, ay);
  }
  const a = {x: ax, y: ay}, f = {x: fx, y: fy}, g = mid(a, f);
  const e = {x: s.ex, y: fy}, h = {x: fx, y: s.hy};
  const c = {x: s.cx, y: fy}, j = {x: fx, y: tame(s.hy - kappa * (fy - s.hy) / 2)};
  const flat = kappa < 1e-3;
  const b = flat ? e : isect(a, e, c, j), k = flat ? h : isect(a, h, c, j);
  const d = {x: (c.x + 2 * e.x + b.x) / 4, y: (c.y + 2 * e.y + b.y) / 4};
  const i = {x: (j.x + 2 * h.x + k.x) / 4, y: (j.y + 2 * h.y + k.y) / 4};
  /* the fold runs at right angles to a–f; R reflects across it, about g, which is on it */
  const len = Math.hypot(fx - ax, fy - ay) || 1, ux = (fy - ay) / len, uy = (ax - fx) / len;
  const R = [2 * ux * ux - 1, 2 * ux * uy, 2 * ux * uy, 2 * uy * uy - 1];
  return {a, f, g, e, h, c, j, b, k, d, i, R, W, dist: len};
}

/** reflect p across the fold of g */
export const reflect = (G, p) => {
  const x = p.x - G.g.x, y = p.y - G.g.y, R = G.R;
  return {x: G.g.x + R[0] * x + R[1] * y, y: G.g.y + R[2] * x + R[3] * y};
};

const pt = p => p.x.toFixed(1) + ' ' + p.y.toFixed(1);

/** the part of the sheet that has lifted away from where it lay */
export const turnedPath = (G, m = p => p) =>
  `M${pt(m(G.c))}Q${pt(m(G.e))} ${pt(m(G.b))}L${pt(m(G.a))}L${pt(m(G.k))}Q${pt(m(G.h))} ${pt(m(G.j))}L${pt(m(G.f))}Z`;

/** the folded-back flap, where the other side of the sheet shows */
export const flapPath = (G, m = p => p) =>
  `M${pt(m(G.d))}Q${pt(m(mid(G.e, G.b)))} ${pt(m(G.b))}L${pt(m(G.a))}L${pt(m(G.k))}Q${pt(m(mid(G.h, G.k)))} ${pt(m(G.i))}Z`;

/** a unit normal to the line p–q, on the side of r */
export function normal(p, q, r) {
  const vx = q.x - p.x, vy = q.y - p.y, l = Math.hypot(vx, vy) || 1;
  let nx = -vy / l, ny = vx / l;
  if ((r.x - p.x) * nx + (r.y - p.y) * ny < 0) { nx = -nx; ny = -ny; }
  return {nx, ny, vx: vx / l, vy: vy / l};
}
