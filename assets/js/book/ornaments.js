// SPDX-FileCopyrightText: 2026 Jay Ma
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
// Design: all rights reserved, not open source; no use in any form without permission (see NOTICE.md).
/* Ornament library: builds the inline SVG sprite and the artwork for the case, covers,
   endpapers, page frames and figures.
   Two traditions meet here. From the Middle East: eight-point star lattices, geometric
   rosettes, star charts and the astrolabe. From Europe: acanthus scrolls, laurel, the
   classical arcade and the compass rose. Gold artwork is painted with url(#g-gold);
   artwork printed on paper uses url(#g-ink). */
import XPS from './xps.js';

export const GOLD = 'url(#g-gold) #d4b06a';
export const INK = 'url(#g-ink) #86663a';
const NAVY = '#1a2340';
const PAPER = '#f2e7cf';

/* ---------- geometry helpers ---------- */
const f = n => Math.round(n * 100) / 100;
const pol = (cx, cy, r, deg) => { const a = deg * Math.PI / 180; return [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))]; };
const pt = (cx, cy, r, deg) => pol(cx, cy, r, deg).join(' ');
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* star polygon with n points; khatam is the eight-point star of two overlapping squares */
const starPts = (cx, cy, R, r, n, rot = -90) =>
  Array.from({length: 2 * n}, (_, i) => pt(cx, cy, i % 2 ? r : R, rot + i * 180 / n)).join(' ');
const khatam = (cx, cy, R) => starPts(cx, cy, R, R * .7654, 8);

/* ---------- motifs ---------- */
const ACANTHUS = 'M0 0C5-7 13-9 17-5C16-10 22-12 25-7C25-11 30-11 32-6C27-2 20 1 0 0Z';
const VEIN = 'M3-.6C11-2 20-3.6 29-5.6';
const ALMOND = 'M0 0C3-3.4 9-3.4 12 0C9 3.4 3 3.4 0 0Z';
const FLAME = 'M0 0C-3.2-5-2.2-11 2.6-16C.8-10 3.8-5.6 0 0Z';
const STAR4 = 'M0-10L2.1-2.1L10 0L2.1 2.1L0 10L-2.1 2.1L-10 0L-2.1-2.1Z';

const leaf = (x, y, rot, s) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="${ACANTHUS}" stroke="none"/><path d="${VEIN}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".7"/></g>`;
const spark = (x, y, s) => `<path d="${STAR4}" transform="translate(${x} ${y}) scale(${s})" stroke="none"/>`;
const rosette = (cx, cy, r, n = 6) =>
  `<g transform="translate(${cx} ${cy})">${Array.from({length: n}, (_, i) =>
    `<ellipse cx="${f(r * .55)}" rx="${f(r * .5)}" ry="${f(r * .23)}" transform="rotate(${f(i * 360 / n)})" stroke="none"/>`).join('')}<circle r="${f(r * .24)}" fill="#000" fill-opacity=".35" stroke="none"/></g>`;

/* cubic Bézier sampling, used to grow laurel along a curve */
const bez = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
const bezTan = (p, t) => { const u = 1 - t; return [0, 1].map(k => 3 * u * u * (p[1][k] - p[0][k]) + 6 * u * t * (p[2][k] - p[1][k]) + 3 * t * t * (p[3][k] - p[2][k])); };
const deg = ([dx, dy]) => Math.atan2(dy, dx) * 180 / Math.PI;

function leafPair(x, y, a, k) {
  return `<path d="${ALMOND}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a - 34)}) scale(${f(k)})" stroke="none"/>` +
         `<path d="${ALMOND}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a + 34)}) scale(${f(k)})" stroke="none"/>`;
}

/** laurel branch along a cubic curve p = [p0, c1, c2, p3] */
function laurel(p, n, s = 1) {
  let out = `<path d="M${p[0]}C${p[1]} ${p[2]} ${p[3]}" fill="none" stroke-width="${f(.9 * s)}"/>`;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + .6), [x, y] = bez(p, t), a = deg(bezTan(p, t)), k = s * (1.05 - t * .35);
    out += leafPair(x, y, a, k);
    if (i % 3 === 2) { const [bx, by] = pol(x, y, 7 * k, a + 90); out += `<circle cx="${bx}" cy="${by}" r="${f(1.3 * k)}" stroke="none"/>`; }
  }
  return out + `<path d="${ALMOND}" transform="translate(${p[3][0]} ${p[3][1]}) rotate(${f(deg(bezTan(p, 1)))}) scale(${f(s * .8)})" stroke="none"/>`;
}

/** laurel along a circular arc from angle a0 to a1 (degrees, clockwise when a1 > a0) */
function wreath(cx, cy, r, a0, a1, n, s = 1) {
  const dir = a1 > a0 ? 1 : -1;
  let out = `<path d="M${pt(cx, cy, r, a0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${dir > 0 ? 1 : 0} ${pt(cx, cy, r, a1)}" fill="none" stroke-width="${f(.9 * s)}"/>`;
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i + .5) / n, [x, y] = pol(cx, cy, r, a);
    out += leafPair(x, y, a + 90 * dir, s * (1 - .25 * i / n));
  }
  return out;
}

/** a band of eight-point stars strung on a frame line (Islamic border) */
function starBand(x, y, w, h, step, R, bg) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke-width="1"/>`;
  const nx = Math.max(1, Math.round(w / step)), ny = Math.max(1, Math.round(h / step)), pts = [];
  for (let i = 1; i < nx; i++) pts.push([x + i * w / nx, y], [x + i * w / nx, y + h]);
  for (let j = 1; j < ny; j++) pts.push([x, y + j * h / ny], [x + w, y + j * h / ny]);
  for (const [cx, cy] of pts)
    s += `<polygon points="${khatam(f(cx), f(cy), R)}" fill="${bg}" stroke-width=".9"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * .3)}" stroke="none"/>`;
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]])
    s += `<polygon points="${khatam(cx, cy, R * 1.45)}" fill="${bg}" stroke-width="1.1"/><polygon points="${khatam(cx, cy, R * .62)}" stroke="none"/>`;
  return s;
}

function constellation(stars, links, s = 1) {
  let out = links.map(([a, b]) => `<path d="M${stars[a]}L${stars[b]}" fill="none" stroke-width="${f(.55 * s)}" stroke-opacity=".7"/>`).join('');
  stars.forEach(([x, y], i) => {
    out += i % 3 === 0 ? spark(x, y, f(.4 * s)) : `<circle cx="${x}" cy="${y}" r="${f((1.2 + (i % 2) * .6) * s)}" stroke="none"/>`;
  });
  return out;
}

/** scattered stars inside box [x, y, w, h], skipping points where avoid(x, y) is true */
function scatter(seed, n, box, avoid, s = 1) {
  const R = rng(seed);
  let out = '';
  for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
    const x = f(box[0] + R() * box[2]), y = f(box[1] + R() * box[3]), z = R();
    if (avoid && avoid(x, y)) continue;
    out += z > .87 ? spark(x, y, f((.24 + R() * .3) * s))
                   : `<circle cx="${x}" cy="${y}" r="${f((.35 + z * .9) * s)}" fill-opacity="${f(.4 + z * .6)}" stroke="none"/>`;
    i++;
  }
  return out;
}

/** compass rose with faceted points (European chart ornament) */
function rose(cx, cy, Llong, Lshort, w) {
  let s = '';
  for (const long of [false, true]) for (let k = long ? 0 : 1; k < 8; k += 2) {
    const a = k * 45 - 90, L = long ? Llong : Lshort, tip = pt(cx, cy, L, a), b1 = pt(cx, cy, w, a - 90), b2 = pt(cx, cy, w, a + 90);
    s += `<path d="M${cx} ${cy}L${b1}L${tip}Z" stroke="none"/><path d="M${cx} ${cy}L${b2}L${tip}Z" stroke="none"/>` +
         `<path d="M${cx} ${cy}L${b2}L${tip}Z" stroke="none" fill="#000" fill-opacity=".32"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${f(w * .8)}" stroke="none"/>`;
}

/** European scroll cartouche */
const cartouche = (cx, cy, hw, bg) =>
  `<path d="M${cx - hw} ${cy}C${cx - hw} ${cy - 12} ${cx - hw + 12} ${cy - 14} ${cx - hw + 20} ${cy - 8}H${cx + hw - 20}C${cx + hw - 12} ${cy - 14} ${cx + hw} ${cy - 12} ${cx + hw} ${cy}` +
  `C${cx + hw} ${cy + 12} ${cx + hw - 12} ${cy + 14} ${cx + hw - 20} ${cy + 8}H${cx - hw + 20}C${cx - hw + 12} ${cy + 14} ${cx - hw} ${cy + 12} ${cx - hw} ${cy}Z" fill="${bg}" stroke-width="1.1"/>` +
  `<path d="M${cx - hw - 3} ${cy}c-10-2-14-12-6-14c6-1 8 6 3 7" fill="none" stroke-width=".9"/>` +
  `<path d="M${cx + hw + 3} ${cy}c10-2 14-12 6-14c-6-1-8 6-3 7" fill="none" stroke-width=".9"/>`;

/** metal book corner with an engraved line and a rivet; drawn for the top-left corner */
const bookCorner = `<path d="M0 0H50C38 6 27 13 19 21C12 29 6 39 0 50Z" stroke="none"/>` +
  `<path d="M6 6H34C26 10 19 15 14 20C10 25 7 30 6 36Z" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".8"/>` +
  `<circle cx="11" cy="11" r="2.6" fill="#000" fill-opacity=".3" stroke="none"/><circle cx="10.4" cy="10.4" r="1.5" fill="#fff6d8" fill-opacity=".7" stroke="none"/>`;
const corners = (w, h, s = 1) => [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]]
  .map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx * s} ${sy * s})">${bookCorner}</g>`).join('');

/* ---------- reusable groups (live in <defs>) ---------- */
function acanthusCorner() {
  const half =
    `<path d="M16 16C38 8 60 8 76 16C90 23 94 38 84 44C76 49 68 42 72 35C75 30 82 31 83 36" fill="none" stroke-width="1.7"/>` +
    `<path d="M24 22C36 28 50 28 60 22" fill="none" stroke-width=".7"/>` +
    leaf(26, 14, -16, .8) + leaf(47, 10, 2, .78) + leaf(68, 14, 34, .6) +
    `<circle cx="92" cy="19" r="1.9" stroke="none"/><circle cx="99" cy="25" r="1.3" stroke="none"/><circle cx="104" cy="32" r=".9" stroke="none"/>`;
  return `<g>${half}</g><g transform="matrix(0 1 1 0 0 0)">${half}</g>${leaf(20, 20, 45, .95)}${rosette(14, 14, 7)}`;
}

function rosette12() {
  const v = Array.from({length: 12}, (_, k) => pol(0, 0, 25, k * 30 - 90));
  let d = '';
  for (let i = 0; i <= 12; i++) d += (i ? 'L' : 'M') + v[(i * 5) % 12].join(' ');
  return `<polygon points="${starPts(0, 0, 30, 23, 12)}" fill="none" stroke-width="1"/>` +
         `<path d="${d}Z" fill="none" stroke-width=".6"/><circle r="12.5" fill="none" stroke-width=".8"/>` +
         `<polygon points="${khatam(0, 0, 9)}" stroke="none"/><circle r="3" fill="#000" fill-opacity=".3" stroke="none"/>`;
}

/** the astrolabe: throne, rim with degree scale, tympan, rete with star pointers; wrapped in laurel */
function astrolabe(bg) {
  let s = wreath(0, 0, 117, 98, 244, 14, 1.25) + wreath(0, 0, 117, 82, -64, 14, 1.25);
  s += `<path d="M0 117C-9 108-19 111-16 120C-13 127-5 123 0 117C5 123 13 127 16 120C19 111 9 108 0 117Z" stroke="none"/>` +
       `<path d="M-3 121L-11 137M3 121L11 137" fill="none" stroke-width="1.6"/>`;
  s += `<path d="M-33-96C-37-114-21-123-12-120C-14-131-6-139 0-144C6-139 14-131 12-120C21-123 37-114 33-96Z" fill="${bg}" stroke-width="1.8"/>` +
       `<path d="M-20-100C-21-110-10-113 0-125C10-113 21-110 20-100" fill="none" stroke-width=".9"/>` +
       `<polygon points="${khatam(0, -111, 6.5)}" stroke="none"/>` +
       `<circle cx="0" cy="-153" r="7" fill="none" stroke-width="2.2"/><path d="M0-146V-141" fill="none" stroke-width="2.4"/>`;
  s += `<circle r="100" fill="${bg}" stroke-width="3.2"/><circle r="94.5" fill="none" stroke-width="1"/>`;
  for (let d = 0; d < 360; d += 2.5) {
    const len = d % 30 === 0 ? 9 : d % 10 === 0 ? 6 : 3.4;
    s += `<path d="M${pt(0, 0, 94.5, d)}L${pt(0, 0, 94.5 - len, d)}" fill="none" stroke-width="${d % 30 === 0 ? 1.2 : .6}"/>`;
  }
  s += `<circle r="84" fill="none" stroke-width="1"/><g clip-path="url(#cp-tympan)" fill="none" stroke-opacity=".5">`;
  for (let i = 1; i <= 7; i++) s += `<circle cx="0" cy="${f(-i * 5.6)}" r="${f(84 - i * 10.6)}" stroke-width=".55"/>`;
  s += `<path d="M-84 6H84M0-84V84" stroke-width=".5"/></g>`;
  s += `<circle cx="0" cy="-20" r="58" fill="none" stroke-width="2.6"/><circle cx="0" cy="-20" r="51.5" fill="none" stroke-width=".8"/>`;
  for (let k = 0; k < 12; k++) s += `<path d="M${pt(0, -20, 51.5, k * 30)}L${pt(0, -20, 58, k * 30)}" fill="none" stroke-width=".9"/>`;
  for (let k = 0; k < 6; k++) {
    const a = k * 60 + 15, p1 = pt(0, 0, 13, a), c1 = pt(0, 0, 44, a - 14), c2 = pt(0, 0, 62, a + 38), p2 = pt(0, 0, 82, a + 28);
    s += `<path d="M${p1}C${c1} ${c2} ${p2}" fill="none" stroke-width="1.5"/>`;
  }
  const R = rng(7);
  for (let k = 0; k < 9; k++) {
    const a = k * 40 + R() * 20, rr = 30 + R() * 44, [x, y] = pol(0, 0, rr, a), [tx, ty] = pol(x, y, 16, a);
    s += `<path d="${FLAME}" transform="translate(${x} ${y}) rotate(${f(a + 90)})" stroke="none"/><circle cx="${tx}" cy="${ty}" r="1.5" stroke="none"/>`;
  }
  return s + `<circle r="13" fill="${bg}" stroke-width="1.6"/><polygon points="${khatam(0, 0, 8.5)}" stroke="none"/>`;
}

/** tapered rule with diamonds and an eight-point star, centred on 0,0, about 300 wide */
function divider() {
  return `<path d="M-146 0C-112-1.6-74-1.6-44 0C-74 1.6-112 1.6-146 0Z" stroke="none"/><path d="M146 0C112-1.6 74-1.6 44 0C74 1.6 112 1.6 146 0Z" stroke="none"/>` +
         `<path d="M-38 0L-31-4.5L-24 0L-31 4.5Z" stroke="none"/><path d="M38 0L31-4.5L24 0L31 4.5Z" stroke="none"/>` +
         `<circle cx="-17" r="1.6" stroke="none"/><circle cx="17" r="1.6" stroke="none"/>` +
         `<polygon points="${khatam(0, 0, 10)}" fill="none" stroke-width="1"/><polygon points="${khatam(0, 0, 4.6)}" stroke="none"/>`;
}

/** the astrolabe's rule (alidade), used as the case latch; viewBox -120 -24 240 48 */
export function latchArt() {
  return `<g fill="${GOLD}" stroke="${GOLD}">` +
    `<path d="M-116 0L-96-5.5H-18L-14-8H14L18-5.5H96L116 0L96 5.5H18L14 8H-14L-18 5.5H-96Z" stroke="#3b2a12" stroke-width=".8"/>` +
    `<path d="M-94 0H-22M22 0H94" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".8"/>` +
    `<rect x="-66" y="-12" width="7" height="24" rx="1.2" stroke="#3b2a12" stroke-width=".7"/><rect x="59" y="-12" width="7" height="24" rx="1.2" stroke="#3b2a12" stroke-width=".7"/>` +
    `<circle r="16" stroke="#3b2a12" stroke-width=".8"/><circle r="11" fill="${NAVY}" stroke-width="1"/>` +
    `<polygon points="${khatam(0, 0, 8)}" stroke="none"/><circle r="2.2" fill="#000" fill-opacity=".35" stroke="none"/></g>`;
}

/* ---------- the sprite ---------- */
export function buildSprite() {
  const defs = `
    <linearGradient id="g-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="34" y2="58" spreadMethod="reflect">
      <stop offset="0" stop-color="#fbeec4"/><stop offset=".38" stop-color="#e0bd76"/><stop offset=".7" stop-color="#a77d3a"/><stop offset="1" stop-color="#f0d593"/></linearGradient>
    <linearGradient id="g-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="30" y2="50" spreadMethod="reflect">
      <stop offset="0" stop-color="#9a7238"/><stop offset=".5" stop-color="#6b4c22"/><stop offset="1" stop-color="#b08a4c"/></linearGradient>
    <pattern id="p-khatam" width="40" height="40" patternUnits="userSpaceOnUse">
      <polygon points="${khatam(20, 20, 20)}" fill="none" stroke="#d4b06a" stroke-width=".8"/>
      <polygon points="${khatam(20, 20, 8)}" fill="none" stroke="#d4b06a" stroke-width=".5"/>
      <circle cx="20" cy="20" r="1.6" fill="#d4b06a"/>
      <circle r="1.4" fill="#d4b06a"/><circle cx="40" r="1.4" fill="#d4b06a"/><circle cy="40" r="1.4" fill="#d4b06a"/><circle cx="40" cy="40" r="1.4" fill="#d4b06a"/></pattern>
    <pattern id="p-khatam-sm" width="20" height="20" patternUnits="userSpaceOnUse">
      <polygon points="${khatam(10, 10, 10)}" fill="none" stroke="#d4b06a" stroke-width=".5"/><circle cx="10" cy="10" r="1" fill="#d4b06a"/></pattern>
    <radialGradient id="g-hole" cx="300" cy="400" r="245" gradientUnits="userSpaceOnUse">
      <stop offset=".76" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
    <mask id="m-medal" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="800"><rect width="600" height="800" fill="url(#g-hole)"/></mask>
    <clipPath id="cp-tympan"><circle r="84"/></clipPath>
    <clipPath id="cp-spandrel"><path clip-rule="evenodd" d="M21 21H279V200H21ZM40 382V160C40 112 106 100 150 48C194 100 260 112 260 160V382Z"/></clipPath>
    <clipPath id="cp-lining"><rect x="16" y="16" width="268" height="768"/></clipPath>
    <clipPath id="cp-arch"><path d="M48 374V161C48 118 111 107 150 60C189 107 252 118 252 161V374Z"/></clipPath>
    <filter id="f-wash" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation=".7"/></filter>
    <g id="o-acanthus">${acanthusCorner()}</g>
    <g id="o-divider">${divider()}</g>
    <g id="o-rosette12">${rosette12()}</g>
    <g id="o-astrolabe">${astrolabe(NAVY)}</g>
    <g id="art-case-front">${caseFrontArt()}</g>
    <g id="art-lining">${liningArt()}</g>
    <g id="art-atlas">${atlasArt()}</g>`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>${defs}</defs>`;
  document.body.prepend(svg);
}

/* ---------- artwork ---------- */

/** front of the case, 600 x 800; each door shows one half */
function caseFrontArt() {
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="58" y="58" width="484" height="684" fill="url(#p-khatam)" stroke="none" opacity=".5" mask="url(#m-medal)"/>`;
  s += `<rect x="12" y="12" width="576" height="776" fill="none" stroke-width="2.6"/><rect x="19" y="19" width="562" height="762" fill="none" stroke-width=".7"/>`;
  s += starBand(32, 32, 536, 736, 33.5, 7.5, NAVY);
  s += `<rect x="46" y="46" width="508" height="708" fill="none" stroke-width=".7"/><rect x="54" y="54" width="492" height="692" fill="none" stroke-width="1.4"/>`;
  for (const [x, y, sx, sy] of [[54, 54, 1, 1], [546, 54, -1, 1], [54, 746, 1, -1], [546, 746, -1, -1]])
    s += `<use href="#o-acanthus" transform="translate(${x} ${y}) scale(${sx * 1.3} ${sy * 1.3})"/>`;
  s += constellation([[112, 214], [142, 200], [170, 210], [192, 232], [220, 226], [232, 252], [206, 262]],
                     [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]);
  s += constellation([[382, 590], [398, 608], [416, 594], [434, 612], [452, 598]], [[0, 1], [1, 2], [2, 3], [3, 4]]);
  s += scatter(11, 44, [72, 72, 456, 656], (x, y) => Math.hypot(x - 300, y - 400) < 212 || (Math.abs(x - 300) < 90 && (Math.abs(y - 112) < 26 || Math.abs(y - 690) < 26)));
  s += cartouche(300, 112, 62, NAVY) + `<polygon points="${khatam(300, 112, 7)}" stroke="none"/>` + spark(268, 112, .35) + spark(332, 112, .35);
  s += cartouche(300, 690, 80, NAVY) +
       `<text x="300" y="694.5" text-anchor="middle" font-family="Cinzel, serif" font-size="12.5" letter-spacing="3" stroke="none">MMXXVI</text>`;
  s += `<use href="#o-astrolabe" transform="translate(300 400) scale(1.2)"/>`;
  return s + '</g>';
}

/** inside of a door, 300 x 800: a star chart */
function liningArt() {
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="10" y="10" width="280" height="780" fill="none" stroke-width="1.6"/><rect x="16" y="16" width="268" height="768" fill="none" stroke-width=".5"/>`;
  s += `<g clip-path="url(#cp-lining)" fill="none" stroke-width=".55" stroke-opacity=".42">`;
  for (const r of [55, 100, 145, 190, 235]) s += `<circle cx="150" cy="400" r="${r}"/>`;
  for (let a = 0; a < 360; a += 30) s += `<path d="M${pt(150, 400, 30, a)}L${pt(150, 400, 420, a)}"/>`;
  s += `<circle cx="150" cy="372" r="168" stroke-dasharray="2 4"/></g>`;
  s += constellation([[112, 262], [170, 256], [128, 312], [140, 316], [152, 320], [118, 372], [180, 366], [146, 236]],
                     [[7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]]);
  s += constellation([[196, 520], [212, 538], [202, 560], [186, 546], [224, 500]], [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4]]);
  s += constellation([[70, 600], [88, 612], [102, 632], [108, 656], [98, 678], [80, 686], [72, 670]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]);
  s += scatter(23, 74, [20, 20, 260, 760], (x, y) => Math.hypot(x - 150, y - 400) < 34);
  s += `<use href="#o-rosette12" transform="translate(150 400) scale(.85)"/>`;
  for (const [x, y] of [[10, 10], [290, 10], [10, 790], [290, 790]]) s += `<polygon points="${khatam(x, y, 9)}" fill="${NAVY}" stroke-width="1"/><polygon points="${khatam(x, y, 4)}" stroke="none"/>`;
  return s + '</g>';
}

/** endpaper, 300 x 414: a celestial atlas with a cartouche and a compass rose */
function atlasArt() {
  const cx = 150, cy = 184, R = 114;
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="9" y="9" width="282" height="396" fill="none" stroke-width=".9"/><rect x="13" y="13" width="274" height="388" fill="none" stroke-width=".35"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${R - 6}" fill="none" stroke-width=".45"/>`;
  for (let d = 0; d < 360; d += 5) s += `<path d="M${pt(cx, cy, R - 6, d)}L${pt(cx, cy, d % 30 ? R - 3 : R, d)}" fill="none" stroke-width="${d % 30 ? .4 : .8}"/>`;
  s += `<g fill="none" stroke-width=".4" stroke-opacity=".5">`;
  for (const r of [28, 56, 84]) s += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
  for (let a = 0; a < 360; a += 30) s += `<path d="M${pt(cx, cy, 10, a)}L${pt(cx, cy, R - 6, a)}"/>`;
  s += `</g><circle cx="${cx}" cy="${cy - 14}" r="86" fill="none" stroke-width=".6" stroke-dasharray="2 3"/>`;
  s += constellation([[92, 128], [110, 138], [124, 150], [138, 160], [160, 158], [166, 178], [144, 182]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]], .9);
  s += constellation([[176, 94], [190, 108], [204, 98], [218, 112], [234, 102]], [[0, 1], [1, 2], [2, 3], [3, 4]], .9);
  s += constellation([[168, 228], [204, 224], [178, 252], [186, 254], [194, 256], [170, 284], [208, 280], [186, 210]],
                     [[7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]], .9);
  s += scatter(31, 150, [cx - R, cy - R, 2 * R, 2 * R], (x, y) => Math.hypot(x - cx, y - cy) > R - 9, .85);
  s += `<g transform="translate(46 354)">${rose(0, 0, 19, 11, 3.6)}</g><text x="46" y="328" font-size="8" text-anchor="middle" font-family="Cinzel, serif" stroke="none">N</text>`;
  s += cartouche(180, 356, 82, NAVY) + `<text x="180" y="359.5" text-anchor="middle" font-family="Cinzel, serif" font-size="9.5" letter-spacing="2.4" stroke="none">CELESTIAL CHART</text>`;
  for (const [x, y] of [[9, 9], [291, 9], [9, 405], [291, 405]]) s += `<polygon points="${khatam(x, y, 6)}" fill="${NAVY}" stroke-width=".8"/><polygon points="${khatam(x, y, 2.6)}" stroke="none"/>`;
  return s + '</g>';
}

/** front cover, 300 x 414: Islamic star border and pointed arch, sun emblem, European laurel */
export function coverArt() {
  const cx = 150, cy = 148;
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="7" y="7" width="286" height="400" fill="none" stroke-width="1.8"/>`;
  s += starBand(14, 14, 272, 386, 21.5, 4.6, NAVY);
  s += `<rect x="21" y="21" width="258" height="372" fill="none" stroke-width=".6"/>`;
  s += `<rect x="21" y="21" width="258" height="180" fill="url(#p-khatam-sm)" stroke="none" opacity=".55" clip-path="url(#cp-spandrel)"/>`;
  s += `<use href="#o-acanthus" transform="translate(21 21) scale(.62)"/><use href="#o-acanthus" transform="translate(279 21) scale(-.62 .62)"/>`;
  s += `<path d="M40 382V160C40 112 106 100 150 48C194 100 260 112 260 160V382Z" fill="${NAVY}" stroke-width="1.6"/>`;
  s += `<path d="M47 375V161C47 117 110 106 150 59C190 106 253 117 253 161V375Z" fill="none" stroke-width=".55"/>`;
  const inArch = (x, y) => x > 52 && x < 248 && y < 368 && (y > 160 || Math.abs(x - 150) < (y - 62) * .95);
  s += scatter(5, 40, [52, 66, 196, 300], (x, y) => !inArch(x, y) || Math.hypot(x - cx, y - cy) < 52 || (y > 196 && y < 322));
  /* star trails: arcs around the emblem, as in a long exposure of the night sky */
  const T = rng(13);
  s += `<g clip-path="url(#cp-arch)" fill="none" stroke-linecap="round">`;
  for (let r = 52; r <= 106; r += 3.6) {
    const a0 = 188 + T() * 112, a1 = Math.min(352, a0 + 22 + T() * 52), o = f(.38 + T() * .45);
    s += `<path d="M${pt(cx, cy, r, a0)}A${r} ${r} 0 0 1 ${pt(cx, cy, r, a1)}" stroke-width="${f(.55 + T() * .6)}" stroke-opacity="${o}"/>`;
    if (T() > .55) { const [x, y] = pol(cx, cy, r, a1); s += `<circle cx="${x}" cy="${y}" r="1.1" stroke="none" fill-opacity="${o}"/>`; }
  }
  s += `</g>`;
  s += `<polygon points="${khatam(cx, cy, 45)}" fill="${NAVY}" stroke-width=".9"/><polygon points="${khatam(cx, cy, 38)}" fill="none" stroke-width=".45"/>`;
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5 - 90, L = k % 2 ? 27 : 35;
    s += `<path d="M${pt(cx, cy, 15, a - 7)}L${pt(cx, cy, L, a)}L${pt(cx, cy, 15, a + 7)}Z" stroke="none"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="14.5" stroke="none"/><circle cx="${cx}" cy="${cy}" r="10" fill="${NAVY}" stroke-width=".8"/><polygon points="${khatam(cx, cy, 6.2)}" stroke="none"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="64" ry="15" transform="rotate(-14 ${cx} ${cy})" fill="none" stroke-width=".7"/>`;
  const ang = -14 * Math.PI / 180, ex = 64 * Math.cos(3.5), ey = 15 * Math.sin(3.5);   /* a planet on the tilted orbit */
  s += `<circle cx="${f(cx + ex * Math.cos(ang) - ey * Math.sin(ang))}" cy="${f(cy + ex * Math.sin(ang) + ey * Math.cos(ang))}" r="3.4" stroke="none"/>`;
  s += laurel([[150, 370], [118, 366], [84, 350], [70, 318]], 7, .95) + laurel([[150, 370], [182, 366], [216, 350], [230, 318]], 7, .95);
  s += `<circle cx="150" cy="370" r="3" stroke="none"/>`;
  s += corners(300, 414, .95);
  return s + '</g>';
}

/** back cover, 300 x 414 */
export function backArt() {
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="7" y="7" width="286" height="400" fill="none" stroke-width="1.8"/>`;
  s += starBand(14, 14, 272, 386, 21.5, 4.6, NAVY);
  s += `<rect x="21" y="21" width="258" height="372" fill="none" stroke-width=".6"/>`;
  s += scatter(9, 50, [26, 26, 248, 362], (x, y) => Math.hypot(x - 150, y - 207) < 70);
  s += wreath(150, 207, 54, 96, 250, 10, .9) + wreath(150, 207, 54, 84, -70, 10, .9);
  s += `<use href="#o-rosette12" transform="translate(150 207) scale(1.15)"/>`;
  s += corners(300, 414, .95);
  return s + '</g>';
}

/** frame for ordinary pages, 300 x 414 */
export function pageFrameArt() {
  let s = `<g fill="${INK}" stroke="${INK}">`;
  s += `<rect x="13" y="13" width="274" height="388" fill="none" stroke-width=".9"/><rect x="17" y="17" width="266" height="380" fill="none" stroke-width=".35"/>`;
  for (const [x, y, sx, sy] of [[17, 17, 1, 1], [283, 17, -1, 1], [17, 397, 1, -1], [283, 397, -1, -1]])
    s += `<use href="#o-acanthus" transform="translate(${x} ${y}) scale(${sx * .34} ${sy * .34})"/>`;
  return s + '</g>';
}

/** title page frontispiece, 300 x 414: a classical arcade of Ionic columns with a geometric rosette */
export function frontispieceArt() {
  let s = `<g fill="${INK}" stroke="${INK}">`;
  s += `<rect x="13" y="13" width="274" height="388" fill="none" stroke-width=".9"/><rect x="17" y="17" width="266" height="380" fill="none" stroke-width=".35"/>`;
  s += `<use href="#o-acanthus" transform="translate(17 17) scale(.46)"/><use href="#o-acanthus" transform="translate(283 17) scale(-.46 .46)"/>`;
  s += `<path d="M42 154A108 108 0 0 1 258 154" fill="none" stroke-width="1.5"/><path d="M50 154A100 100 0 0 1 250 154" fill="none" stroke-width=".55"/>` +
       `<path d="M57 154A93 93 0 0 1 243 154" fill="none" stroke-width=".5" stroke-dasharray=".5 3.5" stroke-linecap="round"/>`;
  s += `<path d="M143 42H157L154 58H146Z" stroke="none"/>` + `<path d="${STAR4}" transform="translate(150 49.5) scale(.38)" fill="${PAPER}" stroke="none"/>`;
  for (const x of [41, 259]) s += column(x, 154, 360);
  s += `<path d="M22 362H278M22 366H278" fill="none" stroke-width=".6"/>`;
  s += `<use href="#o-rosette12" transform="translate(150 88) scale(.56)"/>`;
  s += laurel([[150, 108], [130, 109], [114, 102], [104, 88]], 4, .58) + laurel([[150, 108], [170, 109], [186, 102], [196, 88]], 4, .58);
  return s + '</g>';
}

function column(cx, top, bottom) {
  let s = `<rect x="${cx - 13}" y="${top - 1}" width="26" height="3.2" stroke="none"/><path d="M${cx - 10} ${top + 5}H${cx + 10}" fill="none" stroke-width=".7"/>`;
  for (const sx of [-1, 1]) s += `<circle cx="${cx + sx * 10.5}" cy="${top + 6.5}" r="3.6" fill="none" stroke-width=".8"/><circle cx="${cx + sx * 10.5}" cy="${top + 6.5}" r="1.3" stroke="none"/>`;
  s += `<path d="M${cx - 8} ${top + 10}Q${cx} ${top + 13} ${cx + 8} ${top + 10}" fill="none" stroke-width=".6"/>`;
  const st = top + 12, sb = bottom - 12;
  s += `<path d="M${cx - 7.4} ${st}L${cx - 8} ${sb}M${cx + 7.4} ${st}L${cx + 8} ${sb}" fill="none" stroke-width=".8"/>`;
  for (const o of [-4.4, -1.5, 1.5, 4.4]) s += `<path d="M${f(cx + o)} ${st + 2}L${f(cx + o * 1.07)} ${sb - 2}" fill="none" stroke-width=".35"/>`;
  return s + `<path d="M${cx - 9} ${sb}H${cx + 9}" fill="none" stroke-width=".6"/><rect x="${cx - 10}" y="${sb + 1.5}" width="20" height="3" rx="1.5" fill="none" stroke-width=".6"/>` +
         `<rect x="${cx - 12}" y="${sb + 5.5}" width="24" height="6" stroke="none"/>`;
}

/** ex libris seal: an eight-point star inside a laurel wreath, 100 x 100 */
export function exLibrisArt() {
  return `<g fill="${INK}" stroke="${INK}">${wreath(50, 50, 40, 98, 248, 9, .78)}${wreath(50, 50, 40, 82, -68, 9, .78)}` +
         `<polygon points="${khatam(50, 50, 29)}" fill="none" stroke-width="1"/><polygon points="${khatam(50, 50, 24)}" fill="none" stroke-width=".4"/>` +
         `<circle cx="50" cy="50" r="17" fill="none" stroke-width=".6"/></g>`;
}

/** chapter seal: geometric rosette inside a laurel wreath, 100 x 100 */
export function chapterSealArt() {
  return `<g fill="${INK}" stroke="${INK}">${wreath(50, 50, 44, 98, 248, 10, .82)}${wreath(50, 50, 44, 82, -68, 10, .82)}` +
         `<polygon points="${starPts(50, 50, 34, 27, 12)}" fill="none" stroke-width="1"/><circle cx="50" cy="50" r="22" fill="${PAPER}" stroke-width=".8"/>` +
         `<circle cx="50" cy="50" r="19" fill="none" stroke-width=".35"/></g>`;
}

/** illuminated initial box (European manuscript style), 100 x 100; the letter is HTML on top */
export function initialArt() {
  let s = `<rect x="2" y="2" width="96" height="96" fill="#22407c"/><g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="2" y="2" width="96" height="96" fill="none" stroke-width="2.4"/><rect x="7" y="7" width="86" height="86" fill="none" stroke-width=".6"/>`;
  s += `<path d="M14 86C24 62 12 44 30 30C40 22 52 30 46 38C42 43 36 40 38 35" fill="none" stroke-width="1" stroke-opacity=".75"/>`;
  s += `<path d="M86 14C76 38 88 56 70 70C60 78 48 70 54 62C58 57 64 60 62 65" fill="none" stroke-width="1" stroke-opacity=".75"/>`;
  s += leaf(20, 76, -60, .45) + leaf(80, 24, 120, .45) + spark(84, 84, .45) + spark(16, 16, .45);
  return s + '</g>';
}

/** chapter figure, 400 x 200: an XPS spectrum drawn as a constellation */
export function spectrumArt() {
  let s = `<g fill="none" stroke="${INK}">`;
  s += `<path d="M20 40H380M20 80H380M20 120H380" stroke-width=".4" stroke-opacity=".35" stroke-dasharray="1 3"/>`;
  s += `<path d="M20 160H380" stroke-width=".8"/>`;
  for (let x = 40; x <= 380; x += 40) s += `<path d="M${x} 160V165" stroke-width=".6"/>`;
  s += `<path d="${XPS.envelope}" stroke-width="1.4"/></g>`;
  const peaks = [[120, 122], [174, 50], [240, 100]];
  s += `<g fill="none" stroke="${INK}" stroke-width=".7" stroke-dasharray="2 3"><path d="M${peaks[0]}L${peaks[1]}L${peaks[2]}"/></g>`;
  s += `<g fill="${INK}" stroke="${INK}">` + peaks.map(([x, y]) => `<polygon points="${khatam(x, y - 9, 6)}" stroke="none"/>`).join('') + '</g>';
  return s;
}

/** plate figure, 400 x 200: fitted XPS spectrum in ink and watercolour */
export function xpsPlateArt() {
  const washes = ['#c4532d', '#3d5f9e', '#b58a3c'];
  let s = `<g fill="none" stroke="${INK}"><path d="M20 40H380M20 80H380M20 120H380M60 24V160M100 24V160M140 24V160M180 24V160M220 24V160M260 24V160M300 24V160M340 24V160" stroke-width=".35" stroke-opacity=".3"/>` +
          `<path d="M20 160H380" stroke-width=".8"/></g>`;
  s += `<g filter="url(#f-wash)">` + XPS.peaks.map((d, i) => `<path d="${d}" fill="${washes[i]}" fill-opacity=".34"/>`).join('') + '</g>';
  s += `<g fill="none" stroke="${INK}">` + XPS.peaks.map(d => `<path d="${d}" stroke-width=".6" stroke-opacity=".8"/>`).join('') +
       `<path d="${XPS.background}" stroke-width=".7" stroke-dasharray="3 3"/><path d="${XPS.envelope}" stroke-width="1.5"/></g>`;
  s += `<g fill="#5a4220">` + XPS.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.25"/>`).join('') + '</g>';
  return s;
}

/** plate figure, 400 x 200: OpenGMA reads many formats into one structure and feeds four uses */
export function gmaPlateArt() {
  const doc = (x, y) => `<path d="M${x} ${y}h20l8 8v26h-28z" fill="${PAPER}"/><path d="M${x + 20} ${y}v8h8M${x + 5} ${y + 15}h16M${x + 5} ${y + 21}h12M${x + 5} ${y + 27}h15" fill="none"/>`;
  let s = `<g stroke="${INK}" stroke-width=".9" fill="none">${doc(36, 30)}${doc(36, 84)}${doc(36, 138)}`;
  s += `<path d="M70 48C112 48 118 100 160 100M70 102H160M70 156C112 156 118 100 160 100" stroke-dasharray="3 3"/>`;
  s += `<path d="M232 100C262 100 258 40 290 40M232 100C262 100 262 80 290 80M232 100C262 100 262 120 290 120M232 100C262 100 258 160 290 160" stroke-dasharray="3 3"/>`;
  s += `<polygon points="${hexPts(196, 100, 36)}" fill="${PAPER}" stroke-width="1.4"/>`;
  s += `<polygon points="${hexPts(196, 100, 30)}" stroke-width=".5"/></g>`;
  s += `<g fill="${INK}"><polygon points="${khatam(196, 86, 5)}"/></g>`;
  for (const y of [40, 80, 120, 160]) s += `<g stroke="${INK}" fill="${PAPER}" stroke-width=".8"><rect x="290" y="${y - 11}" width="84" height="22" rx="11"/></g>`;
  return s;
}
const hexPts = (cx, cy, r) => Array.from({length: 6}, (_, k) => pt(cx, cy, r, k * 60 - 90)).join(' ');

/* shared helpers for the page illustrations (illustrations.js) */
export {f, pol, pt, rng, starPts, khatam, laurel, wreath, rose, spark, scatter, cartouche, leaf};
