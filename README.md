# Jay Ma · Personal Homepage

A bilingual (English / 中文) personal homepage in a NASA / SpaceX-inspired style, served by GitHub Pages.
No build step: plain HTML, CSS and native ES modules.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Page structure and **all English text** |
| `assets/js/locales/zh.js` | **All Chinese text**, keyed like the `data-i18n` attributes in `index.html` |
| `assets/css/main.css` | Styles, in numbered sections (tokens, nav, hero, research, …, Chinese overrides, responsive) |
| `assets/js/main.js` | Entry point; starts each module below |
| `assets/js/i18n.js` | Language switch: reads English from the page, swaps in Chinese, remembers the choice |
| `assets/js/sky.js` | Starfield background |
| `assets/js/nav.js` | Header, reading progress, back-to-top, mobile drawer, active section |
| `assets/js/reveal.js` | Scroll reveal, number count-up, pausing off-screen animations |
| `assets/js/research.js` | Interactive SiC-coating diagram and research phases |
| `assets/js/cite.js` | Paper citation panel (BibTeX / APA / GB/T 7714) |
| `assets/js/projects.js` | Project cards: pointer light, last update from the GitHub API |
| `assets/js/extras.js` | Avatar tilt, timeline highlight, copy buttons, Shanghai clock |
| `assets/js/toast.js` | Toast message and clipboard helper |
| `portrait.svg` | Profile picture |

## Editing text

- **English:** edit the text in `index.html`.
- **Chinese:** edit the value with the same key in `assets/js/locales/zh.js`.
- **New text:** add `data-i18n="some.key"` to the element in `index.html`, then add `'some.key': '…'` to `zh.js`.
  For attributes use `data-i18n-attr="aria-label:some.key"`. Anything without a Chinese entry stays in English.

## Language

The language is chosen in this order: `?lang=en` / `?lang=zh` in the URL, the visitor's last choice, then the browser language.
Visitors switch with the EN / 中 pill in the header, the footer link, or the **L** key.

## Local preview

ES modules do not load from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Add `?still` to the URL to freeze the starfield.

## Deploy

Push to `main`; GitHub Pages serves the repository root (Settings → Pages → Deploy from a branch → `main` / root).
