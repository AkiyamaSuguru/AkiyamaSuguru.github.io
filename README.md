# Jay Ma · Personal Homepage

A bilingual (English / 中文) personal homepage with a pixel-art, sci-fi look, served by GitHub Pages.
No build step: plain HTML, CSS and native ES modules.

Section order: hero → open-source projects → research → publications → about → timeline → methods → contact.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Page structure and **all English text** |
| `assets/js/locales/zh.js` | **All Chinese text**, keyed like the `data-i18n` attributes in `index.html` |
| `assets/css/main.css` | Styles, in numbered sections (tokens, nav, hero, open source, research, …, Chinese overrides, responsive) |
| `assets/img/avatar.png` | Pixel-art avatar as a 64 × 32 sprite sheet: left 32 × 32 = the portrait, right 32 × 32 = the blink frame |
| `assets/img/avatar-512.png` | The portrait scaled up 16×, used as the fallback image and the social preview |
| `assets/img/favicon.png` | 32 × 32 portrait for the tab icon and the header logo |
| `assets/js/main.js` | Entry point; starts each module below |
| `assets/js/i18n.js` | Language switch: reads English from the page, swaps in Chinese, remembers the choice |
| `assets/js/pixel.js` | Pixel engine: draws a bitmap as particles that fly or scan in, react to the pointer, glitch, blink |
| `assets/js/hero.js` | Pixel name, pixel avatar, typed overline, HUD clock, Konami-code warp |
| `assets/js/fx.js` | Text effects: typing and "decoding" section titles |
| `assets/js/sky.js` | Pixel starfield background with meteors and warp speed |
| `assets/js/nav.js` | Header, reading progress, back-to-top, mobile drawer, active section |
| `assets/js/reveal.js` | Scroll reveal, number count-up, title decoding, pausing off-screen animations |
| `assets/js/projects.js` | Project cards: pointer light, last update and latest commit from the GitHub API |
| `assets/js/research.js` | Interactive SiC-coating diagram and research phases |
| `assets/js/cite.js` | Paper citation panel (BibTeX / APA / GB/T 7714) |
| `assets/js/extras.js` | Timeline highlight, copy buttons, footer year |
| `assets/js/toast.js` | Toast message and clipboard helper |

## Editing text

- **English:** edit the text in `index.html`.
- **Chinese:** edit the value with the same key in `assets/js/locales/zh.js`.
- **New text:** add `data-i18n="some.key"` to the element in `index.html`, then add `'some.key': '…'` to `zh.js`.
  For attributes use `data-i18n-attr="aria-label:some.key"`. Anything without a Chinese entry stays in English.

## Editing the avatar

Open `assets/img/avatar.png` in any pixel editor (Aseprite, Piskel, Photoshop with nearest-neighbour).
Keep it 64 × 32: draw the portrait in the left half and copy it to the right half with the eyes closed.
Transparent pixels are left out, so the round shape comes from the transparency.
Regenerate `avatar-512.png` and `favicon.png` from the left half if you want the fallback and icon to match.

The hero name is drawn from the small pixel font in `assets/js/pixel.js` (`FONT`); it only has the letters J, A, Y and M.

## Language

The language is chosen in this order: `?lang=en` / `?lang=zh` in the URL, the visitor's last choice, then the browser language.
Visitors switch with the EN / 中 pill in the header, the footer link, or the **L** key.

## Easter egg

Type ↑ ↑ ↓ ↓ ← → ← → B A (or click the arrows in the footer) to jump to warp speed. Clicking the name or the avatar scatters its pixels.

## Local preview

ES modules do not load from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Add `?still` to the URL to turn off all motion.

## Deploy

Push to `main`; GitHub Pages serves the repository root (Settings → Pages → Deploy from a branch → `main` / root).
