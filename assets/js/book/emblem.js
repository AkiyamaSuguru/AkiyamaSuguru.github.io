// SPDX-FileCopyrightText: 2026 Jie Ma
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
/* The author's emblem: an M above two star trails, redrawn for this book from its TikZ original.

   Copyright (C) 2026 Jie Ma. All rights reserved: no use in any form without permission.
   This file and the emblem it draws are design, NOT covered by the GNU AGPL-3.0 that licenses the
   code (see NOTICE.md). If you reuse the code, replace this file with a mark of your own. */
import {f, khatam, spark} from './ornaments.js';

export const FLAME = '#b4461f';   /* the emblem's colour: the original "flame", deepened towards the book's vermilion */

/** the author's emblem, after its TikZ original: an M above two logarithmic arcs
   y = ln(0.3x + 1) + 0.9 and a triangle (x scaled by 10, y by 20, as in the original axis).
   Redrawn for the book: the arcs are star trails that taper outward and end in stars, a jewel
   marks where they meet, stars crown the M, and fine lines give the strokes an engraved look.
   Centred on x = 0; spans y from about -80 to 0. */
export function emblem(color = FLAME, k = 1, light = 'rgba(255,244,214,.55)') {
  const trail = sgn => {
    const n = 40, top = [], bottom = [];
    for (let i = 0; i <= n; i++) {
      const x = 6 * i / n, X = sgn * x * 10, Y = -20 * (Math.log(.3 * x + 1) + .9);
      const tx = sgn * 10, ty = -20 * .3 / (.3 * x + 1), len = Math.hypot(tx, ty);
      const w = (1 - .74 * i / n) * k, nx = -ty / len * w, ny = tx / len * w;
      top.push(`${f(X + nx)} ${f(Y + ny)}`);
      bottom.push(`${f(X - nx)} ${f(Y - ny)}`);
    }
    return `<path d="M${top.join('L')}L${bottom.reverse().join('L')}Z" stroke="none"/>`;
  };
  const M = 'M-30-30L-20-70L0-40L20-70L30-30';
  let s = `<g fill="${color}" stroke="${color}" stroke-linejoin="miter" stroke-miterlimit="10">`;
  s += trail(-1) + trail(1);
  s += spark(-61.5, -39, f(.42 * k)) + spark(61.5, -39, f(.42 * k));
  s += `<path d="M-30 0H30L0-18Z" fill="none" stroke-width="${f(1.35 * k)}"/>`;
  s += `<path d="M-23.6-1.6H23.6L0-15.9Z" fill="none" stroke-width="${f(.45 * k)}"/>`;
  s += `<circle cx="-30" cy="0" r="${f(1 * k)}" stroke="none"/><circle cx="30" cy="0" r="${f(1 * k)}" stroke="none"/>`;
  s += `<path d="${M}" fill="none" stroke-width="${f(2.7 * k)}"/>`;
  if (light) s += `<path d="${M}" fill="none" stroke="${light}" stroke-width="${f(.6 * k)}" transform="translate(-.55 -.5)"/>`;
  s += spark(-20, -79, f(.36 * k)) + spark(20, -79, f(.36 * k));
  s += `<polygon points="${khatam(0, -18, 3.4 * k)}" stroke="none"/>`;
  if (light) s += `<circle cx="0" cy="-18" r="${f(.9 * k)}" fill="${light}" stroke="none"/>`;
  return s + '</g>';
}
