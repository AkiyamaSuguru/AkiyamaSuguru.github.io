// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: AGPL-3.0-only
/* The book. Until the case opens it is a closed volume lying in its case, in 3D. flatten() then
   hands it to the reader, which is flat, like an e-book:
   - spread: two pages side by side. Positions run from 0 (closed, front cover) to N (closed, back
     cover); spread s shows pages 2s-1 and 2s, with the endpapers as the boards beneath.
   - single: one page at a time, for phones and portrait screens. Positions count the pages in
     reading order, leaving out the endpapers.
   Paper pages turn with a page curl that follows the pointer (curl.js); the two boards of the
   cover swing over on their hinge. Pages turn by click or tap, by dragging the page, with the
   keyboard, or from links (#slug); on wide screens a corner lifts a little under the pointer. */
import {tween, easeInOut, easeOut, lerp} from './motion.js';
import {t, onLangChange} from '../i18n.js';
import {curl, reflect, turnedPath, flapPath, normal} from './curl.js';

const smooth = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const m6 = m => `matrix(${m.map(v => +v.toFixed(5)).join(',')})`;

export function createBook({sound, still}) {
  const book = document.getElementById('book'), body = document.body, root = document.documentElement;
  const leaves = [...book.querySelectorAll('.leaf')], N = leaves.length;
  /* pages in reading order: leaf i front = page 2i, leaf i back = page 2i + 1 */
  const pages = leaves.flatMap(l => [l.querySelector('.face.front'), l.querySelector('.face.back')]);
  const slugs = pages.map(p => p.dataset.page);

  /* page numbers are counted, not written in: the front matter in roman numerals from the endpaper
     on, the main text in arabic from the page marked data-folio-start; the contents take the
     numbers of the pages they point to, so adding or moving a leaf renumbers everything */
  const roman = n => { let s = ''; for (const [v, r] of [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]) while (n >= v) { s += r; n -= v; } return s; };
  const first = Math.max(0, pages.findIndex(p => p.hasAttribute('data-folio-start')));
  pages.forEach((p, k) => { const f = p.querySelector('.folio'); if (f) f.textContent = k < first ? roman(k) : k - first + 1; });
  book.querySelectorAll('.toc-list a[href^="#"]').forEach(a => {
    const k = slugs.indexOf(decodeURIComponent(a.hash.slice(1))), em = a.querySelector('em');
    if (k >= 0 && em) em.textContent = pages[k].querySelector('.folio')?.textContent ?? '';
  });
  const order = pages.map((_, k) => k).filter(k => !pages[k].hasAttribute('data-minor'));
  const LB = 1, RB = 2 * N - 2, BACK = 2 * N - 1;   /* the endpapers (inside the boards) and the back cover */
  const prevBtn = document.getElementById('prev'), nextBtn = document.getElementById('next'), indicator = document.getElementById('indicator');
  const listeners = new Set();

  /* the shadows of a turning page, the stacks of pages beneath, the book's own shadow */
  const el = (cls, parent = book, tag = 'div') => { const n = document.createElement(tag); n.className = cls; parent.append(n); return n; };
  const shade = el('book-shadow'), stackL = el('stack l'), stackR = el('stack r');
  const fx = el('curl');
  const underBox = el('curl-under', fx), underStrip = el('', underBox, 'i');
  const edgeBox = el('curl-edge', fx), edgeA = el('', edgeBox, 'i'), edgeB = el('', edgeBox, 'i');
  const hold = el('curl-hold', fx);
  const hardR = el('hard-shade r'), hardL = el('hard-shade l');

  let mode = 'spread', pos = 0, flat = false, active = false, busy = false;
  let queued = 0, pendingTarget = null, wantSlug = null;
  let D = dims(), T = null, animId = 0;

  function dims() {
    const cs = getComputedStyle(root), P = parseFloat(cs.getPropertyValue('--P')), H = parseFloat(cs.getPropertyValue('--H'));
    return {P, H, W: P * .982, Hp: H * .976, top: H * .012};
  }
  const count = () => mode === 'spread' ? N + 1 : order.length;
  /* which pages are open at a position */
  const visibleAt = p => mode === 'single' ? [order[p]] : p === 0 ? [0] : p === N ? [BACK] : [2 * p - 1, 2 * p];
  const hardMove = (lo, hi) => mode === 'spread' ? lo === 0 || hi === N : lo === 0;

  /* ---------- the closed book in its case, and the flat book ---------- */
  const SLOTS = ['bl', 'br', 'pl', 'pr'];
  function place(face, slot, z) {
    face.classList.add('on');
    for (const s of SLOTS) face.classList.toggle('slot-' + s, s === slot);
    face.style.zIndex = z;
  }
  function clearFace(f) {
    f.style.clipPath = f.style.transform = f.style.zIndex = f.style.willChange = f.style.transformOrigin = '';
    f.classList.remove('flap'); f.style.removeProperty('--fold'); f.style.removeProperty('--fold-o');
  }
  /* the faces to lay out at a position: [page, slot] */
  function faceSet(p) {
    if (mode === 'single') { const k = order[p]; return [[k, k === 0 || k === BACK ? 'br' : 'pr']]; }
    if (p === 0) return [[0, 'br']];
    if (p === N) return [[BACK, 'bl']];
    const out = [[LB, 'bl'], [RB, 'br']];
    if (2 * p - 1 !== LB) out.push([2 * p - 1, 'pl']);
    if (2 * p !== RB) out.push([2 * p, 'pr']);
    return out;
  }
  const zOf = k => k === LB || k === RB ? 1 : 3;
  const bxAt = p => (mode === 'single' ? -.5 : p === 0 ? -.5 : p === N ? .5 : 0) * D.P;

  function rest() {
    T = null;
    animId++;
    fx.className = 'curl';
    hold.replaceChildren();
    hardR.style.opacity = hardL.style.opacity = 0;
    leaves.forEach(l => { l.classList.remove('hardturn'); l.style.transform = l.style.opacity = ''; l.style.removeProperty('--shade'); });
    pages.forEach(clearFace);
    D = dims();
    if (!flat) {
      pages.forEach(f => { f.classList.remove('on'); f.inert = true; });
      book.style.setProperty('--bx', -.5 * D.P + 'px');
      return;
    }
    const set = faceSet(pos), shown = new Set(set.map(([k]) => k));
    pages.forEach((f, k) => { if (!shown.has(k)) f.classList.remove('on'); f.inert = !active || !shown.has(k); });
    for (const [k, slot] of set) place(pages[k], slot, zOf(k));
    book.style.setProperty('--bx', bxAt(pos) + 'px');
    stacks(pos);
  }

  /* the edges of the pages still to read on the right, and of the pages read on the left */
  function stacks(p) {
    let l = 0, r = 0;
    if (mode === 'single') r = Math.max(0, order.length - 2 - p) * .16;
    else if (p > 0 && p < N) { l = (p - 1) * .34; r = (N - 1 - p) * .34; }
    const edges = (n, side) => Array.from({length: Math.round(n)}, (_, i) =>
      `${side * (i + 1)}px ${(i + 1) * .6}px 0 ${i % 2 ? '#c9b48c' : '#ebdfc4'}`).join(',') || 'none';
    stackL.style.boxShadow = edges(l ? 1 + l : 0, -1);
    stackR.style.boxShadow = edges(r ? 1 + r : 0, 1);
    shade.dataset.span = mode === 'single' || p === 0 ? 'r' : p === N ? 'l' : 'both';
  }

  /* ---------- the page curl ---------- */
  /* what a turn between positions lo < hi shows, told as the forward turn (the sheet travels from
     right to left); turning back plays the same turn in reverse */
  function curlDesc(lo, hi) {
    if (mode === 'single') return {single: true, sheet: pages[order[lo]], under: pages[order[hi]]};
    return {single: false, sheet: pages[2 * lo], back: pages[2 * hi - 1], under: pages[2 * hi], left: pages[2 * lo - 1]};
  }
  const slotOf = f => f.classList.contains('cover-front') ? 'br' : 'pr';
  /* where the corner rests before the turn, and after it */
  const cornerAt = fy => ({x: D.W - 1, y: fy + (fy > 0 ? -1 : 1)});
  const turnedAt = (fy, single) => ({x: single ? -1.25 * D.W : -D.W, y: fy});

  function beginCurl(desc, fy, a0) {
    D = dims();
    const shown = new Set();
    const show = (f, slot, z) => { place(f, slot, z); shown.add(f); };
    if (desc.single) {
      show(desc.under, slotOf(desc.under), 3);
      show(desc.sheet, 'pr', 5);
      /* the back of a single page: the same page seen through the paper, mirrored */
      const ghost = desc.sheet.cloneNode(true);
      ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      ghost.className = desc.sheet.className.replace(/\b(on|slot-\w+)\b/g, '') + ' ghost flap';
      ghost.removeAttribute('data-page');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.inert = true;
      ghost.style.cssText = '';
      hold.replaceChildren(ghost);
    } else {
      show(pages[LB], 'bl', 1);
      show(pages[RB], 'br', 1);
      if (desc.left !== pages[LB]) show(desc.left, 'pl', 3);
      if (desc.under !== pages[RB]) show(desc.under, 'pr', 3);
      show(desc.sheet, 'pr', 5);
      show(desc.back, 'pl', 7);
      desc.back.classList.add('flap');
      desc.back.style.transformOrigin = '0 0';
      desc.back.style.willChange = 'transform';
    }
    pages.forEach(f => { if (!shown.has(f)) f.classList.remove('on'); f.inert = true; });
    fx.className = 'curl on ' + (desc.single ? 'single' : 'spread');
    T = {desc, fy, a: {...a0}, mode: 'auto'};
    renderCurl(T.a);
  }

  function renderCurl(a) {
    const {desc, fy} = T, {W, Hp} = D;
    const progress = (W - a.x) / (2 * W);
    /* a sewn page flattens as it settles on the left; a single page may leave the book entirely */
    const kappa = desc.single ? 1 : 1 - smooth(.55, 1, progress);
    const G = curl(a.x, a.y, fy, W, {kappa, bound: desc.single ? a.x > 0 : true});
    T.G = G;
    desc.sheet.style.clipPath = `path(evenodd,"M0 0H${W.toFixed(1)}V${Hp.toFixed(1)}H0Z${turnedPath(G)}")`;

    /* the flap: the back of the sheet, folded over. local() takes a point on the book to the
       flap's own page: single pages show their own face mirrored; in a spread, the left-hand page
       is the other side of the sheet, so mirror it onto the sheet, then fold */
    const [R0, R1, R2, R3] = G.R, g = G.g;
    let flap, local;
    if (desc.single) {
      flap = hold.firstChild;
      local = q => reflect(G, q);
      flap.style.transform = m6([R0, R2, R1, R3, g.x - (R0 * g.x + R1 * g.y), g.y - (R2 * g.x + R3 * g.y)]);
    } else {
      flap = desc.back;
      local = q => { const s = reflect(G, q); return {x: W - s.x, y: s.y}; };
      const tx = g.x + R0 * (W - g.x) - R1 * g.y, ty = g.y + R2 * (W - g.x) - R3 * g.y;
      flap.style.transform = m6([-R0, -R2, R1, R3, tx + W, ty]);
    }
    flap.style.clipPath = `path("${flapPath(G, local)}")`;

    /* light and shadow: the page beneath darkens under the roll, the flap throws a shadow along its
       edges, and the roll itself has a crease and a highlight */
    const fade = smooth(0, W * .1, G.dist) * (1 - smooth(.86, 1, progress));
    const L = 4 * (W + Hp);
    let n = normal(G.c, G.j, G.f);
    const ws = Math.min(W * .3, Math.max(14, G.dist * .3));
    underStrip.style.width = ws.toFixed(1) + 'px';
    underStrip.style.height = L + 'px';
    underStrip.style.transform = m6([n.nx, n.ny, n.vx, n.vy, G.c.x - n.vx * L / 2, G.c.y - n.vy * L / 2]);
    underStrip.style.opacity = fade.toFixed(3);

    const ox = desc.single ? 0 : W;   /* the edge box starts at the left page in a spread */
    const cen = {x: (G.d.x + G.b.x + G.a.x + G.k.x + G.i.x) / 5, y: (G.d.y + G.b.y + G.a.y + G.k.y + G.i.y) / 5};
    const we = Math.max(6, Math.min(22, W * .05));
    [[edgeA, G.b], [edgeB, G.k]].forEach(([s, p2]) => {
      const q = normal(G.a, p2, cen), len = Math.hypot(p2.x - G.a.x, p2.y - G.a.y);
      s.style.width = we + 'px';
      s.style.height = Math.min(len, L).toFixed(1) + 'px';
      s.style.transform = m6([-q.nx, -q.ny, q.vx, q.vy, G.a.x + ox, G.a.y]);
      s.style.opacity = (fade * .9).toFixed(3);
    });

    /* the crease and highlight run along the crest of the roll; drawn on the flap's own page,
       so a CSS gradient laid across that page in its coordinates */
    const d = local(G.d), i = local(G.i), c = local(G.a);
    n = normal(d, i, c);
    const deg = Math.atan2(n.nx, -n.ny) * 180 / Math.PI, Lg = Math.abs(W * n.nx) + Math.abs(Hp * n.ny);
    const p0 = (d.x - (W / 2 - n.nx * Lg / 2)) * n.nx + (d.y - (Hp / 2 - n.ny * Lg / 2)) * n.ny;
    const wf = Math.max(10, (c.x - d.x) * n.nx + (c.y - d.y) * n.ny), at = k => (p0 + k * wf).toFixed(1) + 'px';
    flap.style.setProperty('--fold', `linear-gradient(${deg.toFixed(2)}deg,rgba(46,30,10,0) ${at(-.002)},rgba(46,30,10,.36) ${at(0)},` +
      `rgba(255,250,236,.36) ${at(.06)},rgba(255,250,236,.08) ${at(.2)},rgba(46,30,10,.03) ${at(.58)},rgba(46,30,10,.16) ${at(1)})`);
    flap.style.setProperty('--fold-o', (.35 + .65 * fade).toFixed(3));
  }

  /** move the corner to `to`, rising by `lift` on the way */
  function moveCorner(to, dur, ease = easeInOut, lift = 0) {
    const id = ++animId, from = {...T.a};
    return tween({dur, ease, onUpdate: e => {
      if (id !== animId || !T) return;
      T.a = {x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) + lift * Math.sin(Math.PI * e)};
      renderCurl(T.a);
    }});
  }
  const liftFor = fy => (fy > 0 ? -1 : 1) * .14 * D.Hp;

  async function curlStep(lo, hi, dir, quick) {
    const desc = curlDesc(lo, hi), fy = dims().Hp;
    const start = cornerAt(fy), end = turnedAt(fy, desc.single);
    beginCurl(desc, fy, dir > 0 ? start : end);
    if (!quick) sound.play('page');
    await moveCorner(dir > 0 ? end : start, quick ? 520 : desc.single ? 600 : 760, easeInOut, liftFor(fy));
  }

  /* ---------- the boards ---------- */
  function beginHard(lo, hi) {
    D = dims();
    const single = mode === 'single', leaf = single || lo === 0 ? leaves[0] : leaves[N - 1];
    const shown = new Set([...leaf.children]);
    if (single) { const u = pages[order[hi]]; place(u, slotOf(u), 3); shown.add(u); }
    else if (lo === 0) { place(pages[2], 'pr', 3); place(pages[RB], 'br', 1); shown.add(pages[2]).add(pages[RB]); }
    else { place(pages[2 * N - 3], 'pl', 3); place(pages[LB], 'bl', 1); shown.add(pages[2 * N - 3]).add(pages[LB]); }
    pages.forEach(f => { if (!shown.has(f)) f.classList.remove('on'); f.inert = true; });
    for (const f of leaf.children) { f.classList.remove('on'); clearFace(f); }
    leaf.classList.add('hardturn');
    const bx0 = single ? -.5 * D.P : lo === 0 ? -.5 * D.P : 0, bx1 = single ? -.5 * D.P : lo === 0 ? 0 : .5 * D.P;
    T = {hard: true, leaf, single, bx0, bx1, lo, hi, p: 0};
    stacks(single ? hi : lo === 0 ? 1 : N - 1);
  }
  /** p from 0 (board lying on the right) to 1 (on the left) */
  function renderHard(p) {
    const {leaf, single} = T, deg = -180 * p, up = Math.sin(Math.PI * p);
    T.p = p;
    leaf.style.transform = `perspective(${(D.P * 3.4).toFixed(0)}px) rotateY(${deg.toFixed(2)}deg)`;
    leaf.style.setProperty('--shade', (up * .3).toFixed(3));
    leaf.style.opacity = single ? Math.min(1, (1 - p) / .3).toFixed(3) : '';
    hardR.style.opacity = (p < .5 ? up * .55 : 0).toFixed(3);
    hardL.style.opacity = (!single && p > .5 ? up * .55 : 0).toFixed(3);
    book.style.setProperty('--bx', lerp(T.bx0, T.bx1, easeInOut(p)).toFixed(1) + 'px');
  }
  async function hardStep(lo, hi, dir) {
    beginHard(lo, hi);
    sound.play('cover');
    const id = ++animId;
    renderHard(dir > 0 ? 0 : 1);
    await tween({dur: mode === 'single' ? 900 : 1150, ease: easeInOut, onUpdate: e => { if (id === animId) renderHard(dir > 0 ? e : 1 - e); }});
  }

  /* ---------- moving ---------- */
  /* the moves from one position to another: board swings, and one curl for any run of paper pages */
  function plan(from, to) {
    const dir = Math.sign(to - from), steps = [];
    if (mode === 'single') {
      const lo = Math.min(from, to), hi = Math.max(from, to);
      return [{hard: hardMove(lo, hi), lo, hi, dir}];
    }
    let p = from;
    while (p !== to) {
      if (dir > 0 && (p === 0 || p === N - 1)) { steps.push({hard: true, lo: p, hi: p + 1, dir}); p++; continue; }
      if (dir < 0 && (p === 1 || p === N)) { steps.push({hard: true, lo: p - 1, hi: p, dir}); p--; continue; }
      const q = dir > 0 ? Math.min(to, N - 1) : Math.max(to, 1);
      steps.push({hard: false, lo: Math.min(p, q), hi: Math.max(p, q), dir});
      p = q;
    }
    return steps;
  }

  async function go(target, {push = true, slug = null} = {}) {
    target = Math.max(0, Math.min(count() - 1, target));
    if (busy) { pendingTarget = target; wantSlug = slug; return; }
    if (T && T.peek) rest();
    if (target === pos) { changed(push, slug); return; }
    busy = true;
    const steps = flat ? plan(pos, target) : [];
    if (steps.some(s => s.hi - s.lo > 1)) sound.play('riffle');
    for (const s of steps) {
      if (!still) {
        if (s.hard) await hardStep(s.lo, s.hi, s.dir);
        else await curlStep(s.lo, s.hi, s.dir, s.hi - s.lo > 1);
      }
      pos = s.dir > 0 ? s.hi : s.lo;
      rest();
    }
    if (!steps.length) { pos = target; rest(); }
    busy = false;
    changed(push, slug);
    afterMove();
  }

  /** one page forward or back; extra presses while a page is turning are remembered */
  function nudge(dir) {
    if (T && T.peek && !T.peek.leaving && T.peek.dir === dir && !busy) return commitPeek();
    if (busy) { queued = Math.max(-3, Math.min(3, queued + dir)); return; }
    go(pos + dir);
  }

  function afterMove() {
    if (pendingTarget !== null) { const p = pendingTarget, s = wantSlug; pendingTarget = wantSlug = null; go(p, {slug: s}); return; }
    if (queued) { const d = Math.sign(queued); queued -= d; go(pos + d); }
  }

  function changed(push, slug) {
    prevBtn.disabled = pos === 0;
    nextBtn.disabled = pos === count() - 1;
    indicator.textContent = indicatorText();
    for (const fn of listeners) fn({pos, push, slug: slug && visibleAt(pos).some(k => slugs[k] === slug) ? slug : slugFor(pos)});
  }

  function indicatorText() {
    const vis = visibleAt(pos);
    if (vis.length === 1 && vis[0] === 0) return t('ui.cover');
    if (vis.length === 1 && vis[0] === BACK) return t('ui.backcover');
    const folios = vis.map(k => pages[k].querySelector('.folio')?.textContent).filter(Boolean);
    return folios.length ? folios.join(' · ') : '✦';
  }

  /* ---------- addresses ---------- */
  /** a position is named after its first page in reading order, skipping endpapers */
  function slugFor(p) {
    const vis = visibleAt(p).map(k => pages[k]);
    return (vis.find(f => !f.hasAttribute('data-minor')) || vis[0]).dataset.page;
  }
  function posOfPage(k) {
    if (mode === 'spread') return Math.ceil(k / 2);
    if (pages[k].hasAttribute('data-minor')) k += k % 2 ? 1 : -1;   /* an endpaper: its facing page */
    return Math.max(0, order.indexOf(k));
  }
  function posFor(slug) {
    const k = slugs.indexOf(slug);
    return k < 0 ? null : posOfPage(k);
  }

  /* ---------- pointer: tap, drag, and the corner that lifts under the mouse ---------- */
  let drag = null, suppressClick = false;
  const toSheet = e => { const r = book.getBoundingClientRect(); return {x: e.clientX - r.left - D.P, y: e.clientY - r.top - D.top}; };
  const turnDir = s => mode === 'spread' ? (s.x >= 0 ? 1 : -1) : (s.x > D.W * .4 ? 1 : -1);
  const canMove = dir => pos + dir >= 0 && pos + dir < count();
  const rowOf = y => y < D.Hp * .5 ? 0 : D.Hp;

  book.addEventListener('pointerdown', e => {
    if (!active || !flat || busy || e.button > 0 || e.target.closest('a, button, [tabindex], .no-turn, .slip')) return;
    D = dims();
    const s = toSheet(e), dir = turnDir(s);
    if (!canMove(dir)) return;
    drag = {id: e.pointerId, x0: e.clientX, s0: s, dir, started: false, track: [[e.clientX, performance.now()]]};
  });
  addEventListener('pointermove', e => {
    if (drag && e.pointerId === drag.id) return dragMove(e);
    if (e.pointerType === 'mouse' && active && flat && !busy && mode === 'spread') hover(e);
  }, {passive: true});
  addEventListener('pointerup', e => { if (drag && e.pointerId === drag.id) dragEnd(); });
  addEventListener('pointercancel', e => { if (drag && e.pointerId === drag.id) { drag.cancel = true; dragEnd(); } });

  function dragMove(e) {
    drag.track.push([e.clientX, performance.now()]);
    if (drag.track.length > 6) drag.track.shift();
    const dx = e.clientX - drag.x0;
    if (!drag.started) {
      if (Math.abs(dx) < 7) return;
      if (Math.sign(dx) === drag.dir) { drag = null; return; }   /* pulled the wrong way */
      drag.started = true;
      busy = true;
      const lo = drag.dir > 0 ? pos : pos - 1, hi = lo + 1;
      if (hardMove(lo, hi)) {
        if (T && T.peek) rest();
        beginHard(lo, hi);
        drag.hard = true;
        renderHard(drag.dir > 0 ? 0 : 1);
        sound.play('cover');
      } else {
        const peeking = T && T.peek && T.peek.dir === drag.dir;
        if (T && !peeking) rest();
        const fy = peeking ? T.fy : rowOf(drag.s0.y);
        if (!peeking) beginCurl(curlDesc(lo, hi), fy, drag.dir > 0 ? cornerAt(fy) : turnedAt(fy, mode === 'single'));
        animId++;
        T.peek = null;
        T.mode = 'drag';
        drag.middle = Math.abs(drag.s0.y - D.Hp / 2) < D.Hp * .16;
        sound.play('page');
        requestAnimationFrame(follow);
      }
      try { book.setPointerCapture(drag.id); } catch {}
    }
    if (drag.hard) {
      const p = Math.max(0, Math.min(1, (drag.dir > 0 ? -dx : dx) / (D.P * 1.15)));
      renderHard(drag.dir > 0 ? p : 1 - p);
    } else {
      const s = toSheet(e);
      /* from the middle of the page the fold stays upright; from near a corner, the corner follows */
      if (drag.middle) s.y = T.fy + (T.fy > 0 ? -2 : 2) + (s.y - drag.s0.y) * .25;
      drag.target = s;
    }
  }

  /* the corner glides after the pointer rather than jumping to it */
  function follow() {
    if (!drag || !T || T.mode !== 'drag') return;
    if (drag.target) {
      T.a = {x: T.a.x + (drag.target.x - T.a.x) * .38, y: T.a.y + (drag.target.y - T.a.y) * .38};
      renderCurl(T.a);
    }
    requestAnimationFrame(follow);
  }

  async function dragEnd() {
    const d = drag;
    drag = null;
    if (!d.started) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    const [x0, t0] = d.track[0], [x1, t1] = d.track[d.track.length - 1];
    const v = (x1 - x0) / Math.max(1, t1 - t0) * -d.dir;   /* px/ms in the turning direction */
    let commit;
    if (d.hard) {
      const p = d.dir > 0 ? T.p : 1 - T.p;
      commit = !d.cancel && (p > .4 || (v > .35 && p > .05));
      const id = ++animId, from = T.p, to = (d.dir > 0) === commit ? 1 : 0;
      await tween({dur: Math.max(220, 900 * Math.abs(to - from)), ease: easeOut, onUpdate: e => { if (id === animId) renderHard(lerp(from, to, e)); }});
    } else {
      T.mode = 'auto';
      const {W} = D, single = T.desc.single;
      const along = d.dir > 0 ? (W - T.a.x) / (2 * W) : (T.a.x + W) / (2 * W);
      commit = !d.cancel && (along > .42 || (v > .35 && along > .04));
      const to = (d.dir > 0) === commit ? turnedAt(T.fy, single) : cornerAt(T.fy);
      const dist = Math.abs(to.x - T.a.x) / (2 * W);
      await moveCorner(to, Math.max(200, (single ? 620 : 720) * dist), easeOut);
    }
    if (commit) pos += d.dir;
    rest();
    busy = false;
    if (commit) changed(true);
    afterMove();
  }

  /* lift the corner of the page under the mouse a little, as a hint that it turns */
  function hover(e) {
    const s = toSheet(e), {W, Hp} = D;
    const row = s.y < Hp * .2 ? 0 : s.y > Hp * .8 ? Hp : null;
    let dir = 0;
    if (row !== null && s.y > -8 && s.y < Hp + 8) {
      if (s.x > W * .8 && s.x < W + 8) dir = 1;
      else if (s.x < -W * .8 && s.x > -W - 8) dir = -1;
    }
    const lo = dir > 0 ? pos : pos - 1;
    if (dir && (!canMove(dir) || hardMove(lo, lo + 1))) dir = 0;
    if (T && T.peek) {
      if (dir === T.peek.dir && row === T.fy && !T.peek.leaving) return;
      if (!T.peek.leaving) dropPeek();
      return;
    }
    if (!dir || T) return;
    beginCurl(curlDesc(lo, lo + 1), row, dir > 0 ? cornerAt(row) : turnedAt(row, false));
    T.peek = {dir};
    const up = row > 0 ? -1 : 1;
    moveCorner({x: dir > 0 ? W * .88 : -W * .88, y: row + up * Hp * .07}, 320, easeOut);
  }
  async function dropPeek() {
    const {dir} = T.peek, fy = T.fy;
    T.peek.leaving = true;
    await moveCorner(dir > 0 ? cornerAt(fy) : turnedAt(fy, false), 240, easeOut);
    if (T && T.peek && T.peek.leaving && !busy) rest();
  }
  async function commitPeek() {
    const dir = T.peek.dir;
    T.peek = null;
    busy = true;
    sound.play('page');
    await moveCorner(dir > 0 ? turnedAt(T.fy, false) : cornerAt(T.fy), 640, easeInOut, liftFor(T.fy) * .5);
    pos += dir;
    rest();
    busy = false;
    changed(true);
    afterMove();
  }
  book.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && T && T.peek && !T.peek.leaving && !busy) dropPeek(); });

  book.addEventListener('click', e => {
    if (!active || !flat || suppressClick || e.target.closest('a, button, [tabindex], .no-turn')) return;
    D = dims();
    nudge(turnDir(toSheet(e)));
  });

  /* ---------- links inside the book, buttons, keys ---------- */
  book.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const slug = a.getAttribute('href').slice(1), p = posFor(slug);
    if (p === null) return;
    e.preventDefault();
    go(p, {slug});
  });
  prevBtn.addEventListener('click', () => nudge(-1));
  nextBtn.addEventListener('click', () => nudge(1));
  addEventListener('keydown', e => {
    /* leave keys alone when something on the page has used them (the citation tabs use the arrows) */
    if (!active || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('[role=tab], input, textarea, select, [contenteditable]')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); nudge(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); nudge(-1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(count() - 1);
    else if (k.toLowerCase() === 't') go(posFor('contents'), {slug: 'contents'});
    else if (k.toLowerCase() === 'e') go(posFor('letter'), {slug: 'letter'});
  });
  onLangChange(() => { indicator.textContent = indicatorText(); });

  rest();
  changed(false);
  return {
    go, nudge, posFor, slugFor,
    get pos() { return pos; },
    get count() { return count(); },
    get mode() { return mode; },
    onChange(fn) { listeners.add(fn); },
    /** jump without animation */
    jump(p) { pos = Math.max(0, Math.min(count() - 1, p)); rest(); changed(false); },
    /** back into the case: closed, in 3D */
    reset() {
      pos = 0; busy = false; queued = 0; pendingTarget = null; active = false; flat = false; drag = null;
      book.classList.remove('flat');
      body.classList.remove('flat');
      rest();
      changed(false);
    },
    /** out of the case: from here on the book is flat */
    flatten() {
      flat = true;
      book.classList.add('flat');
      body.classList.add('flat');
      rest();
    },
    refresh: rest,
    activate(on) { active = on; rest(); changed(false); },
    /** switch layout, keeping the reader on the same pages */
    setMode(m) {
      busy = false;
      drag = null;
      if (m === mode) { rest(); return; }
      const vis = visibleAt(pos), k = vis.find(i => !pages[i].hasAttribute('data-minor')) ?? vis[0];
      mode = m;
      pos = posOfPage(k);
      rest();
      changed(false);
    },
  };
}
