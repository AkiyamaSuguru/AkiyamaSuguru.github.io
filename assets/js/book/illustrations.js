/* Page illustrations: the ex libris, cameo and back cover (set around the emblem from emblem.js),
   the coating cross-section, a crystal sketch, the Yangtze map, the star charts, the envelope and
   the binding diagram. Ink on paper unless noted. */
import {GOLD, INK, f, pol, pt, rng, khatam, laurel, wreath, rose, spark, scatter} from './ornaments.js';
import {emblem, FLAME} from './emblem.js';

const NAVY = '#1a2340';
const PAPER = '#f2e7cf';

/** ex libris: the emblem inside an eight-point star and a laurel wreath, 100 x 100 */
export function exLibrisArt() {
  return `<g fill="${INK}" stroke="${INK}">${wreath(50, 50, 40, 98, 248, 9, .78)}${wreath(50, 50, 40, 82, -68, 9, .78)}` +
         `<polygon points="${khatam(50, 50, 29)}" fill="none" stroke-width="1"/><polygon points="${khatam(50, 50, 24)}" fill="none" stroke-width=".4"/>` +
         `<circle cx="50" cy="50" r="19" fill="${PAPER}" stroke-width=".6"/></g>` +
         `<g transform="translate(50 61) scale(.25)">${emblem(FLAME, 1.5)}</g>`;
}

/** cameo for the author page: an oval frame with beads, laurel and the emblem, 120 x 150 */
export function cameoArt() {
  let s = `<g fill="${INK}" stroke="${INK}">`;
  s += `<ellipse cx="60" cy="74" rx="44" ry="56" fill="none" stroke-width="1.3"/><ellipse cx="60" cy="74" rx="39" ry="51" fill="none" stroke-width=".45"/>`;
  s += `<ellipse cx="60" cy="74" rx="41.5" ry="53.5" fill="none" stroke-width="1.6" stroke-dasharray="0 4.2" stroke-linecap="round"/>`;
  s += laurel([[60, 136], [38, 134], [18, 116], [14, 88]], 6, .72) + laurel([[60, 136], [82, 134], [102, 116], [106, 88]], 6, .72);
  s += `<path d="M60 134c-6-6-13-4-11 2s8 2 11-2c3 4 9 8 11 2s-5-8-11-2z" stroke="none"/>`;
  s += `<polygon points="${khatam(60, 16, 6.5)}" fill="${PAPER}" stroke-width=".8"/><polygon points="${khatam(60, 16, 2.8)}" stroke="none"/>`;
  s += `<ellipse cx="60" cy="74" rx="36" ry="48" fill="#ece0c4" stroke="none"/>`;
  s += scatter(41, 16, [28, 30, 64, 88], (x, y) => ((x - 60) / 33) ** 2 + ((y - 74) / 45) ** 2 > 1 || Math.abs(y - 74) < 22, .7);
  s += '</g>';
  return s + `<g transform="translate(60 94) scale(.5)">${emblem(FLAME, 1.15)}</g>`;
}

/** back cover in gold: star border, wreath, the emblem as a maker's mark, the motto on an arc */
export function backArt() {
  let s = `<g fill="${GOLD}" stroke="${GOLD}">`;
  s += `<rect x="7" y="7" width="286" height="400" fill="none" stroke-width="1.8"/><rect x="21" y="21" width="258" height="372" fill="none" stroke-width=".6"/>`;
  s += `<rect x="14" y="14" width="272" height="386" fill="none" stroke-width="1"/>`;
  s += scatter(9, 46, [26, 26, 248, 362], (x, y) => Math.hypot(x - 150, y - 200) < 112);
  s += wreath(150, 196, 60, 100, 246, 11, .95) + wreath(150, 196, 60, 80, -66, 11, .95);
  s += `<circle cx="150" cy="196" r="44" fill="none" stroke-width=".7"/><circle cx="150" cy="196" r="41" fill="none" stroke-width="1.4" stroke-dasharray="0 4" stroke-linecap="round"/>`;
  /* the motto, in two arcs under the wreath */
  [[86, 'LANGUAGE IS INFORMATION,'], [99, 'INFORMATION IS EVERYTHING']].forEach(([r, line], i) => {
    const x = f(r * Math.cos(Math.PI / 18)), y = f(196 + r * Math.sin(Math.PI / 18));
    s += `<path id="motto-arc-${i}" d="M${f(150 - x)} ${y}A${r} ${r} 0 0 0 ${f(150 + +x)} ${y}" fill="none" stroke="none"/>` +
         `<text font-family="Cinzel, serif" font-size="7.2" letter-spacing="1.25" stroke="none"><textPath href="#motto-arc-${i}" startOffset="50%" text-anchor="middle">${line}</textPath></text>`;
  });
  for (const [x, y, sx, sy] of [[0, 0, 1, 1], [300, 0, -1, 1], [0, 414, 1, -1], [300, 414, -1, -1]])
    s += `<g transform="translate(${x} ${y}) scale(${sx * .95} ${sy * .95})"><path d="M0 0H50C38 6 27 13 19 21C12 29 6 39 0 50Z" stroke="none"/>` +
         `<path d="M6 6H34C26 10 19 15 14 20C10 25 7 30 6 36Z" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".8"/></g>`;
  s += '</g>';
  return s + `<g transform="translate(150 219) scale(.62)" style="filter:drop-shadow(0 1px 0 rgba(0,0,0,.6))">${emblem('url(#g-gold) #d4b06a', 1.2, 'rgba(255,250,230,.7)')}</g>`;
}

/** Plate III: CVD-SiC coating on nuclear graphite under molten salt and ion irradiation, 400 x 230.
   Each layer is a group with data-layer so the page can highlight it. */
export function crossSectionArt() {
  const R = rng(17);
  let s = `<g class="layer" data-layer="ion"><rect x="20" y="4" width="230" height="52" fill="transparent"/><g stroke="${INK}" stroke-width="1.1" fill="none">`;
  for (let i = 0; i < 7; i++) {
    const x = 38 + i * 32;
    s += `<g class="beam" style="animation-delay:${f(i * .28)}s"><path d="M${x} 10V46"/><path d="M${x - 4} 40L${x} 47L${x + 4} 40"/></g>`;
  }
  s += `</g></g>`;
  /* molten salt */
  let wave = 'M20 66';
  for (let x = 20; x < 250; x += 23) wave += `Q${x + 11.5} ${x % 2 ? 58 : 60} ${x + 23} 66`;
  s += `<g class="layer" data-layer="salt"><g filter="url(#f-wash)"><path d="${wave}V98H20Z" fill="#c4532d" fill-opacity=".32"/></g>` +
       `<path d="${wave}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
  for (let i = 0; i < 9; i++) s += `<circle cx="${f(30 + R() * 210)}" cy="${f(72 + R() * 20)}" r="${f(1.4 + R() * 2.4)}" fill="none" stroke="${INK}" stroke-width=".55"/>`;
  s += `</g>`;
  /* CVD-SiC coating with columnar grains and a few pits */
  s += `<g class="layer" data-layer="sic"><g filter="url(#f-wash)"><rect x="20" y="98" width="230" height="26" fill="#3d5f9e" fill-opacity=".34"/></g><g stroke="${INK}" stroke-width=".45" stroke-opacity=".75">`;
  for (let x = 26; x < 250; x += 7) s += `<path d="M${x} 99L${f(x + (R() - .5) * 3)} 123"/>`;
  s += `</g><g fill="${INK}" fill-opacity=".7">`;
  for (const x of [64, 118, 171, 222]) s += `<path d="M${x - 3} 98L${x} 104L${x + 3} 98Z"/>`;
  s += `</g></g>`;
  /* nuclear graphite with pores */
  s += `<g class="layer" data-layer="graphite"><g filter="url(#f-wash)"><rect x="20" y="124" width="230" height="82" fill="#5f5a52" fill-opacity=".3"/></g><g fill="${INK}" fill-opacity=".55">`;
  for (let i = 0; i < 26; i++) s += `<ellipse cx="${f(28 + R() * 214)}" cy="${f(132 + R() * 68)}" rx="${f(1.8 + R() * 4.6)}" ry="${f(1 + R() * 2)}"/>`;
  s += `</g><path d="M20 150Q90 144 160 152T250 148M20 178Q100 170 170 180T250 176" fill="none" stroke="${INK}" stroke-width=".5" stroke-opacity=".6"/></g>`;
  s += `<rect x="20" y="58" width="230" height="148" fill="none" stroke="${INK}" stroke-width="1.1"/>`;
  s += `<path d="M20 98H250M20 124H250" fill="none" stroke="${INK}" stroke-width=".8"/>`;
  return s;
}

/** a hexagonal crystal sketch, 200 x 150 */
export function crystalArt() {
  const cx = 100, top = 36, bot = 112, rx = 58, ry = 18;
  const v = y => Array.from({length: 6}, (_, k) => pol(cx, y, 1, k * 60).map((n, i) => i ? f(y + ry * Math.sin(k * Math.PI / 3)) : f(cx + rx * Math.cos(k * Math.PI / 3))));
  const T = v(top), B = v(bot), back = k => k === 4 || k === 5;
  let s = `<g fill="none" stroke="${INK}" stroke-width="1">`;
  for (let k = 0; k < 6; k++) {
    const n = (k + 1) % 6, dashed = back(k) || back(n) ? ' stroke-dasharray="3 3" stroke-opacity=".6"' : '';
    s += `<path d="M${T[k]}L${T[n]}"/><path d="M${B[k]}L${B[n]}"${dashed}/>`;
    s += `<path d="M${T[k]}L${B[k]}"${back(k) ? ' stroke-dasharray="3 3" stroke-opacity=".6"' : ''}/>`;
  }
  s += `<path d="M${cx} ${top}L${cx} ${bot}" stroke-dasharray="1 3" stroke-opacity=".6"/>`;
  s += `<path d="M${T[0]}L${cx} ${top}L${T[3]}M${B[1]}L${cx} 74L${B[4]}" stroke-width=".45" stroke-opacity=".55"/></g>`;
  s += `<g stroke="${INK}" stroke-width=".7">`;
  for (const p of [...T, ...B]) s += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#9fb0cf"/>`;
  s += `<circle cx="${cx}" cy="${top}" r="5.2" fill="#d98a6a"/><circle cx="${cx}" cy="${bot}" r="5.2" fill="#d98a6a"/><circle cx="${cx}" cy="74" r="6" fill="#d98a6a"/>`;
  for (const k of [0, 2, 4]) { const [x, y] = pol(cx, 74, 30, k * 60 + 30); s += `<circle cx="${x}" cy="${f(74 + (y - 74) * .35)}" r="3.4" fill="#c9b78f"/>`; }
  return s + '</g>';
}

const mountain = (x, y, s) =>
  `<path d="M${x - 9 * s} ${y}L${x} ${f(y - 11 * s)}L${f(x + 9 * s)} ${y}" fill="none"/><path d="M${x} ${f(y - 11 * s)}L${f(x + 3 * s)} ${y}M${f(x + 2 * s)} ${f(y - 8 * s)}L${f(x + 5 * s)} ${y}" fill="none" stroke-width=".45"/>`;

/** Map I: the Yangtze from Wuhan to Shanghai, in the manner of an old chart, 300 x 300 */
export function mapArt() {
  const river = 'M6 138C24 132 44 146 62 150S100 176 122 168S160 150 186 172S214 204 236 206S256 214 270 212';
  let s = `<g stroke="${INK}" fill="none">`;
  s += `<rect x="6" y="6" width="288" height="288" stroke-width="1.2"/><rect x="11" y="11" width="278" height="278" stroke-width=".45"/>`;
  for (let i = 1; i < 14; i++) s += `<path d="M${6 + i * 20.6} 6V11M${6 + i * 20.6} 289V294M6 ${6 + i * 20.6}H11M289 ${6 + i * 20.6}H294" stroke-width=".5"/>`;
  s += `</g>`;
  /* the sea and the coast */
  s += `<path d="M289 120C276 150 262 176 264 200C266 222 280 236 274 256C270 270 278 282 289 289Z" fill="#7fa4c9" fill-opacity=".28" stroke="${INK}" stroke-width=".8"/>`;
  s += `<g stroke="${INK}" stroke-width=".45" fill="none" stroke-opacity=".6"><path d="M276 160q4-3 8 0M280 230q4-3 8 0M272 250q4-3 8 0M282 270q3-2 6 0"/></g>`;
  /* lakes */
  s += `<path d="M118 186c6-4 14-2 15 4s-5 12-11 10-9-9-4-14z" fill="#7fa4c9" fill-opacity=".3" stroke="${INK}" stroke-width=".6"/>`;
  s += `<path d="M30 186c8-5 18-1 16 6s-12 8-17 4-5-6 1-10z" fill="#7fa4c9" fill-opacity=".3" stroke="${INK}" stroke-width=".6"/>`;
  /* the river: a thick ink stroke with a lighter water stroke on top gives the double line */
  s += `<path d="M40 64C48 92 54 124 62 150" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M40 64C48 92 54 124 62 150" fill="none" stroke="#c9d8e8" stroke-width="1.4"/>`;
  s += `<path d="${river}" fill="none" stroke="${INK}" stroke-width="6"/><path d="${river}" fill="none" stroke="#c9d8e8" stroke-width="4"/>`;
  /* the route, mountains, cities */
  s += `<path d="M62 146S100 170 122 162S160 144 186 166S214 198 236 202" fill="none" stroke="#a8402a" stroke-width="1.1" stroke-dasharray="4 3"/>`;
  s += `<g stroke="${INK}" stroke-width=".8">`;
  for (const [x, y, k] of [[34, 238, 1.2], [52, 248, .9], [84, 232, 1.1], [104, 246, .8], [150, 236, 1], [170, 252, .8], [120, 92, 1], [140, 84, .8], [170, 98, 1.1], [200, 88, .9], [96, 60, .8]])
    s += mountain(x, y, k);
  s += `</g>`;
  s += `<g stroke="${INK}" stroke-width=".5" stroke-dasharray="1.5 2" fill="none"><path d="M40 126L62 150M86 122L62 150M204 180L236 206M238 166L236 206M270 190L236 206"/></g>`;
  s += `<g fill="${INK}"><circle cx="62" cy="150" r="4.2"/><circle cx="236" cy="206" r="4.2"/></g><g fill="${PAPER}"><circle cx="62" cy="150" r="1.8"/><circle cx="236" cy="206" r="1.8"/></g>`;
  s += `<g transform="translate(258 44)" fill="${INK}" stroke="${INK}">${rose(0, 0, 18, 10, 3.2)}</g>`;
  s += `<text x="258" y="20" font-family="Cinzel, serif" font-size="8" text-anchor="middle" fill="${INK}">N</text>`;
  return s;
}

/** background of a star chart (the named stars are in the page markup), 300 x 250 */
export function chartArt(seed) {
  let s = `<g fill="none" stroke="${INK}">`;
  s += `<circle cx="150" cy="122" r="118" stroke-width=".9"/><circle cx="150" cy="122" r="113" stroke-width=".35"/>`;
  for (let d = 0; d < 360; d += 6) s += `<path d="M${pt(150, 122, 113, d)}L${pt(150, 122, d % 30 ? 116 : 118, d)}" stroke-width=".4"/>`;
  s += `<g stroke-opacity=".28" stroke-width=".45"><circle cx="150" cy="122" r="78"/><circle cx="150" cy="122" r="40"/>`;
  for (let a = 0; a < 360; a += 30) s += `<path d="M${pt(150, 122, 12, a)}L${pt(150, 122, 113, a)}"/>`;
  s += `</g></g><g fill="${INK}" stroke="${INK}">`;
  s += scatter(seed, 60, [36, 8, 228, 228], (x, y) => Math.hypot(x - 150, y - 122) > 110, .7);
  return s + '</g>';
}

/** a sealed envelope, 240 x 170. Back to front: the inside, the opened flap (hidden until the
   envelope opens), the letter, the pocket, the closed flap and the seal. Opening swaps the two
   flaps, so the letter can rise in front of the opened one. */
export function envelopeArt() {
  let s = `<rect x="20" y="40" width="200" height="120" fill="#d9c79e" stroke="${INK}" stroke-width=".8"/>`;
  s += `<g class="env-flap-open"><path d="M20 40L120-22L220 40Z" fill="#e4d4b0" stroke="${INK}" stroke-width=".9"/></g>`;
  s += `<g class="env-letter"><rect x="34" y="46" width="172" height="104" fill="#f8f1e1" stroke="${INK}" stroke-width=".6"/>` +
       `<path d="M50 60H190M50 71H176M50 82H186M50 93H150" stroke="${INK}" stroke-width=".7" stroke-opacity=".5"/></g>`;
  s += `<path d="M20 40L120 100L220 40V160H20Z" fill="#efe3c6" stroke="${INK}" stroke-width="1"/>`;
  s += `<path d="M20 160L120 106L220 160" fill="none" stroke="${INK}" stroke-width=".7" stroke-opacity=".6"/>`;
  s += `<g stroke="${INK}" stroke-width=".6" fill="none" stroke-opacity=".7"><circle cx="54" cy="136" r="12"/><circle cx="54" cy="136" r="8.6"/><path d="M68 130q8-4 16 0t16 0M68 136q8-4 16 0t16 0M68 142q8-4 16 0t16 0"/></g>`;
  s += `<text x="54" y="138" font-family="Cinzel, serif" font-size="4.8" text-anchor="middle" fill="${INK}" fill-opacity=".8">MMXXVI</text>`;
  s += `<g class="env-flap"><path d="M20 40L120 104L220 40Z" fill="#e4d4b0" stroke="${INK}" stroke-width=".9"/></g>`;
  s += `<g class="env-seal"><path d="M120 86c7-1 13 3 15 9s1 13-5 16-14 3-19-2-6-12-2-17 6-6 11-6z" fill="#9a2f1d"/>` +
       `<circle cx="120" cy="100" r="10.5" fill="#b8432a"/><g transform="translate(120 105.5) scale(.16)">${emblem('#f3d2b8', 2.1, null)}</g></g>`;
  return s;
}

/** "The Binding": an exploded view of the case (a), cover (b), page block (c) and ornament
   sheet (d), with the words (e) and the sky and sound (f) beside them; 300 x 160 */
export function anatomyArt() {
  const W = 128, DX = 40, DY = 22, T = 7;
  /* a point on a slab's top face: a runs along the front edge, b into the depth */
  const at = (x, y, a, b) => `${f(x + a * W + b * DX)} ${f(y + DY - b * DY)}`;
  const quad = (x, y, ia, ib) => `M${at(x, y, ia, ib)}L${at(x, y, 1 - ia, ib)}L${at(x, y, 1 - ia, 1 - ib)}L${at(x, y, ia, 1 - ib)}Z`;
  /* draw something lying flat on a face, centred at (a, b) */
  const flat = (x, y, a, b, inner) => `<g transform="translate(${at(x, y, a, b)}) matrix(1 0 -.91 .5 0 0)">${inner}</g>`;
  const slab = (x, y, top, side, edges = '', extra = '') =>
    `<path d="M${x} ${y + DY}H${x + W}V${y + DY + T}H${x}ZM${x + W} ${y + DY}L${x + W + DX} ${y}V${y + T}L${x + W} ${y + DY + T}Z" fill="${side}" stroke="${INK}" stroke-width=".7"/>` + edges +
    `<path d="M${x} ${y + DY}L${x + DX} ${y}H${x + W + DX}L${x + W} ${y + DY}Z" fill="${top}" stroke="${INK}" stroke-width=".8"/>` + extra;
  /* a guide from one slab's centre to the next, passing behind the upper slab */
  const guide = (x, y) => `<path d="M${x + 84} ${y + 11}L${x + 94} ${y - 14}" fill="none" stroke="${INK}" stroke-width=".5" stroke-dasharray="1.6 2.2"/>`;
  const tooling = (x, y) => `<path d="${quad(x, y, .035, .13)}${quad(x, y, .055, .2)}" fill="none" stroke="${GOLD}" stroke-width=".55"/>`;

  let s = `<path d="M${56 + 6} ${118 + DY + T + 6}L${56 + DX + 6} ${118 + T + 6}H${56 + W + DX + 6}L${56 + W + 6} ${118 + DY + T + 6}Z" fill="#3a2c1e" fill-opacity=".1"/>`;
  /* a: the case, with the astrolabe on its door */
  s += slab(56, 118, '#26325a', '#1a2340', '', tooling(56, 118) +
    flat(56, 118, .5, .5, `<circle r="13" fill="none" stroke="${GOLD}" stroke-width=".7"/><circle r="9.5" fill="none" stroke="${GOLD}" stroke-width=".35"/><polygon points="${khatam(0, 0, 6.5)}" fill="${GOLD}"/>`));
  s += guide(56, 118);
  /* b: the cover, gold-tooled, with a star at its heart */
  s += slab(66, 86, '#2c3a68', '#1d2748', '', tooling(66, 86) +
    flat(66, 86, .5, .5, `<polygon points="${khatam(0, 0, 8)}" fill="none" stroke="${GOLD}" stroke-width=".6"/><g fill="${GOLD}">${spark(0, 0, .5)}</g>`));
  s += guide(66, 86);
  /* c: the page block, its fore-edge drawn leaf by leaf */
  let edges = '';
  for (let i = 1; i < 6; i++) {
    const yy = 54 + DY + i * T / 6;
    edges += `<path d="M76 ${f(yy)}H${76 + W}L${76 + W + DX} ${f(yy - DY)}" fill="none" stroke="${INK}" stroke-width=".3" stroke-opacity=".55"/>`;
  }
  let text = '';
  for (const b of [.28, .42, .56, .7]) text += `<path d="M${at(76, 54, .14, b)}L${at(76, 54, b === .7 ? .62 : .86, b)}" stroke="${INK}" stroke-width=".45" stroke-opacity=".45"/>`;
  s += slab(76, 54, PAPER, '#e2d0aa', edges, text);
  s += guide(76, 54);
  /* d: the ornament sheet, eight-pointed stars lying flat in a row */
  let stars = '';
  for (let i = 0; i < 7; i++) stars += flat(86, 22, (i + .5) / 7, .5, `<polygon points="${khatam(0, 0, 5.2)}" fill="none" stroke="${INK}" stroke-width=".55"/><circle r="1.1" fill="${INK}"/>`);
  s += slab(86, 22, 'rgba(242,231,207,.45)', 'rgba(226,208,170,.5)', '', `<path d="${quad(86, 22, .03, .12)}" fill="none" stroke="${INK}" stroke-width=".4"/>` + stars);

  /* letters: leaders start on each slab's side */
  s += `<g font-family="Cinzel, serif" font-size="11" font-style="italic" fill="${INK}">`;
  [['a', 56, 118], ['b', 66, 86], ['c', 76, 54], ['d', 86, 22]].forEach(([l, x, y]) => {
    s += `<circle cx="${x + 150}" cy="${y + 14}" r="1.1"/><path d="M${x + 150} ${y + 14}H250" stroke="${INK}" stroke-width=".5"/><text x="256" y="${y + 18}">${l}</text>`;
  });
  s += `<text x="16" y="76">e</text><text x="16" y="128">f</text></g>`;
  /* e: two overlapping speech bubbles; f: stars over a sound wave */
  const bubble = (x, y, left) => `<path d="M${x + 2} ${y}h12a2 2 0 012 2v7a2 2 0 01-2 2h${left ? -9 : -3}l-3 3.2v-3.2h${left ? -2 : -8}a2 2 0 01-2-2v-7a2 2 0 012-2z" fill="${PAPER}" stroke="${INK}" stroke-width=".7"/>`;
  s += bubble(29, 61, 1) + `<path d="M33 65h8M33 68h6" stroke="${INK}" stroke-width=".55"/>`;
  s += bubble(38, 67, 0) + `<path d="M42 71h8M42 74h5" stroke="${INK}" stroke-width=".55"/>`;
  s += `<g fill="${INK}">${spark(33, 122, .3)}${spark(43, 116, .22)}</g><path d="M30 131q4-4 8 0t8 0t8 0" fill="none" stroke="${INK}" stroke-width=".7"/>`;
  return s;
}
