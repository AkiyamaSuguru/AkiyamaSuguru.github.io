/* The book: leaves that turn on the spine, in two layouts.
   - spread: two pages side by side. The position is the spread s, from 0 (closed, front cover)
     to N (closed, back cover); spread s shows the back of leaf s-1 and the front of leaf s.
   - single: one page at a time, for phones and portrait screens. The position is the page f in
     reading order (0 … 2N-1). Forward from a right-hand page turns the leaf and the view follows
     it onto its back; forward from a left-hand page glides across to the facing page.
   Pages turn by click or tap, by dragging the page, with the keyboard, or from links (#slug). */
import {tween, easeInOut, easeOut, lerp} from './motion.js';
import {t, onLangChange} from '../i18n.js';

export function createBook({sound, still}) {
  const book = document.getElementById('book');
  const leaves = [...book.querySelectorAll('.leaf')];
  const N = leaves.length;
  /* pages in reading order: leaf i front = page 2i, leaf i back = page 2i + 1 */
  const pages = leaves.flatMap(l => [l.querySelector('.face.front'), l.querySelector('.face.back')]);
  const slugs = pages.map(p => p.dataset.page);
  const prevBtn = document.getElementById('prev'), nextBtn = document.getElementById('next'), indicator = document.getElementById('indicator');
  const pagePx = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--P'));
  const isCover = i => leaves[i].classList.contains('cover');
  const listeners = new Set();

  let mode = 'spread', pos = 0, busy = false, active = false, queued = 0, pendingTarget = null, wantSlug = null;

  const count = () => mode === 'spread' ? N + 1 : 2 * N;
  const spreadOf = p => mode === 'spread' ? p : Math.ceil(p / 2);
  /* horizontal offset of the book (in pages) that centres what should be seen */
  const offsetOf = p => mode === 'single' ? (p % 2 ? .5 : -.5) : p === 0 ? -.5 : p === N ? .5 : 0;
  /* pages visible at a position */
  const visibleAt = p => mode === 'single' ? [p] : [2 * p - 1, 2 * p].filter(k => k >= 0 && k < 2 * N);

  /** the move from position p one step in direction dir */
  function stepOf(p, dir) {
    if (mode === 'spread') return {type: 'flip', leaf: dir > 0 ? p : p - 1, forward: dir > 0, dir};
    const right = p % 2 === 0;
    if (dir > 0) return right ? {type: 'flip', leaf: p / 2, forward: true, dir} : {type: 'pan', dir};
    return right ? {type: 'pan', dir} : {type: 'flip', leaf: (p - 1) / 2, forward: false, dir};
  }

  /* ---------- drawing a resting position ---------- */
  function rest() {
    const s = spreadOf(pos), vis = visibleAt(pos);
    leaves.forEach((leaf, i) => {
      const flipped = i < s;
      leaf.style.transition = '';
      leaf.style.transform = `translateZ(${flipped ? i * .5 : (N - i) * .5}px) rotateY(${flipped ? -180 : 0}deg)`;
      leaf.style.setProperty('--fs', 0);
      leaf.classList.remove('turning');
    });
    pages.forEach((p, k) => { p.style.setProperty('--cast', 0); p.inert = !active || !vis.includes(k); });
    book.style.setProperty('--bx', offsetOf(pos) * pagePx() + 'px');
    placeBlock(s);
    peekSide = 0;
  }

  /* the page block under the leaves and the shadow follow the open or closed book */
  function placeBlock(s) {
    const v = s === 0 ? ['50%', '0%', '50%', '.9%'] : s === N ? ['0%', '50%', '.9%', '50%'] : ['0%', '0%', '.9%', '.9%'];
    ['sl', 'sr', 'bl', 'br'].forEach((k, i) => book.style.setProperty('--' + k, v[i]));
  }

  /* ---------- drawing a step part-way (p from 0 to 1) ---------- */
  function render(st, from, p) {
    const P = pagePx();
    book.style.setProperty('--bx', lerp(offsetOf(from), offsetOf(from + st.dir), p) * P + 'px');
    if (st.type !== 'flip') return;
    const i = st.leaf, leaf = leaves[i];
    const a = st.forward ? -180 * p : -180 * (1 - p), lift = Math.sin(Math.PI * Math.abs(a) / 180);
    leaf.style.transition = '';
    leaf.classList.add('turning');
    leaf.style.transform = `translateZ(${N + 2 + lift * (isCover(i) ? 10 : 22)}px) rotateY(${a}deg)`;
    leaf.style.setProperty('--fs', (lift * .3).toFixed(3));
    /* the leaf throws a shadow on the page it uncovers, then on the page it is about to cover */
    const k = Math.sin(Math.PI * p) * .34;
    const uncovered = pages[st.forward ? 2 * i + 2 : 2 * i - 1], covered = pages[st.forward ? 2 * i - 1 : 2 * i + 2];
    uncovered?.style.setProperty('--cast', (k * (1 - p)).toFixed(3));
    covered?.style.setProperty('--cast', (k * p).toFixed(3));
  }

  function animate(st, from, p0, p1, quick) {
    if (st.type === 'flip' && p0 === 0 && !quick) placeBlock(spreadOf(from + st.dir));
    const full = st.type === 'pan' ? 560 : quick ? 360 : isCover(st.leaf) ? 1150 : 900;
    return tween({dur: Math.max(140, full * Math.abs(p1 - p0)), ease: p0 === 0 && p1 === 1 ? easeInOut : easeOut,
                  onUpdate: e => render(st, from, lerp(p0, p1, e))});
  }

  const playFor = st => sound.play(st.type === 'pan' ? 'slide' : isCover(st.leaf) ? 'cover' : 'page');

  /* ---------- moving ---------- */
  async function go(target, {push = true, slug = null} = {}) {
    target = Math.max(0, Math.min(count() - 1, target));
    if (busy) { pendingTarget = target; wantSlug = slug; return; }
    if (target === pos) { changed(push, slug); return; }
    busy = true;
    const many = Math.abs(target - pos) > 1;
    if (many) sound.play('riffle');
    while (pos !== target) {
      const st = stepOf(pos, target > pos ? 1 : -1);
      if (!still) {
        if (!many) playFor(st);
        await animate(st, pos, 0, 1, many && !(st.type === 'flip' && isCover(st.leaf)));
      }
      pos += st.dir;
      rest();
    }
    busy = false;
    changed(push, slug);
    afterMove();
  }

  /** one page forward or back; extra presses while a page is turning are remembered */
  function nudge(dir) {
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
    if (vis.includes(0) && vis.length === 1 || (mode === 'spread' && pos === 0)) return t('ui.cover');
    if (pos === count() - 1) return t('ui.backcover');
    const folios = vis.map(k => pages[k].querySelector('.folio')?.textContent).filter(Boolean);
    return folios.length ? folios.join(' · ') : '✦';
  }

  /* ---------- addresses ---------- */
  /** a spread is named after its first page in reading order, skipping endpapers */
  function slugFor(p) {
    const vis = visibleAt(p).map(k => pages[k]);
    return (vis.find(el => !el.hasAttribute('data-minor')) || vis[0]).dataset.page;
  }
  function posFor(slug) {
    const k = slugs.indexOf(slug);
    return k < 0 ? null : mode === 'spread' ? Math.ceil(k / 2) : k;
  }

  /* ---------- pointer: click, drag, peek ---------- */
  let drag = null, suppressClick = false, peekSide = 0;

  book.addEventListener('pointerdown', e => {
    if (!active || busy || e.button > 0 || e.target.closest('a, button, [tabindex], .no-turn')) return;
    drag = {id: e.pointerId, x0: e.clientX, started: false, p: 0, track: [[e.clientX, performance.now()]]};
  });
  addEventListener('pointermove', e => {
    if (drag && e.pointerId === drag.id) return dragMove(e);
    if (active && !busy && mode === 'spread' && e.pointerType === 'mouse') hoverPeek(e);
  }, {passive: true});
  addEventListener('pointerup', e => { if (drag && e.pointerId === drag.id) dragEnd(e); });
  addEventListener('pointercancel', e => { if (drag && e.pointerId === drag.id) { drag.cancel = true; dragEnd(e); } });

  function dragMove(e) {
    const dx = e.clientX - drag.x0;
    drag.track.push([e.clientX, performance.now()]);
    if (drag.track.length > 6) drag.track.shift();
    if (!drag.started) {
      if (Math.abs(dx) < 8) return;
      const dir = dx < 0 ? 1 : -1;
      if (pos + dir < 0 || pos + dir >= count()) { drag = null; return; }
      drag.started = true;
      drag.st = stepOf(pos, dir);
      busy = true;
      unpeek(true);
      playFor(drag.st);
      try { book.setPointerCapture(e.pointerId); } catch {}
    }
    const span = drag.st.type === 'flip' ? pagePx() * (mode === 'spread' ? 1.5 : 1.1) : pagePx();
    drag.p = Math.max(0, Math.min(1, -dx * drag.st.dir / span));
    render(drag.st, pos, drag.p);
  }

  async function dragEnd() {
    const d = drag;
    drag = null;
    if (!d.started) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    const [[x0, t0], [x1, t1]] = [d.track[0], d.track[d.track.length - 1]];
    const v = (x1 - x0) / Math.max(1, t1 - t0) * -d.st.dir;   /* px/ms in the turning direction */
    const commit = !d.cancel && (d.p > .4 || (v > .45 && d.p > .06));
    await animate(d.st, pos, d.p, commit ? 1 : 0);
    if (commit) pos += d.st.dir;
    rest();
    busy = false;
    if (commit) changed(true);
    afterMove();
  }

  book.addEventListener('click', e => {
    if (!active || suppressClick || e.target.closest('a, button, [tabindex], .no-turn')) return;
    const r = book.getBoundingClientRect();
    const forward = mode === 'single' ? e.clientX > innerWidth / 2 : e.clientX > r.left + r.width / 2;
    nudge(forward ? 1 : -1);
  });

  /* lift the corner of the page under the pointer a little, as a hint that it turns */
  function hoverPeek(e) {
    const r = book.getBoundingClientRect(), edge = r.width * .1;
    const side = e.clientX > r.right - edge && e.clientX < r.right + 8 && pos < N ? 1
               : e.clientX < r.left + edge && e.clientX > r.left - 8 && pos > 0 ? -1 : 0;
    if (side === peekSide) return;
    unpeek();
    peekSide = side;
    if (!side) return;
    const leaf = leaves[side > 0 ? pos : pos - 1];
    leaf.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1)';
    leaf.style.transform = `translateZ(${N + 2}px) rotateY(${side > 0 ? -9 : -171}deg)`;
  }
  function unpeek(now) {
    if (!peekSide) return;
    const i = peekSide > 0 ? pos : pos - 1, flipped = peekSide < 0, leaf = leaves[i];
    leaf.style.transition = now ? '' : 'transform .35s cubic-bezier(.2,.7,.2,1)';
    leaf.style.transform = `translateZ(${flipped ? i * .5 : (N - i) * .5}px) rotateY(${flipped ? -180 : 0}deg)`;
    peekSide = 0;
  }
  book.addEventListener('pointerleave', () => { if (!busy) unpeek(); });

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
    if (!active || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); nudge(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); nudge(-1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(count() - 1);
    else if (k.toLowerCase() === 't') go(posFor('contents'), {slug: 'contents'});
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
    reset() { pos = 0; busy = false; queued = 0; pendingTarget = null; active = false; rest(); changed(false); },
    refresh: rest,
    activate(on) { active = on; rest(); changed(false); },
    /** switch layout, keeping the reader on the same pages */
    setMode(m) {
      if (m === mode) { rest(); return; }
      const page = mode === 'spread' ? (pos === N ? 2 * N - 1 : 2 * pos) : pos;
      mode = m;
      pos = m === 'spread' ? Math.ceil(page / 2) : page;
      rest();
      changed(false);
    },
  };
}
