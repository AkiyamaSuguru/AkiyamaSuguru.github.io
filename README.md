# The Book of Star Trails · Jay Ma

**Live site: https://akiyamasuguru.github.io/**

The homepage of Jay Ma, bound as a book. A hardcover case waits under a night sky: turn the astrolabe's rule and the doors swing open, the book rises out of the case, and its pages turn with the sound of paper. Inside are a preface, the author, the open-source projects (OpenXPSAnalyzer, opengma and this book), research, publications, a timeline, methods and letters.

English by default, with a Chinese edition. No build step: plain HTML, CSS and native ES modules, served by GitHub Pages.

## Reading

- **Open the case:** click the astrolabe's rule, or anywhere on the case. **Skip** (or Esc) jumps to the end of the opening.
- **Turn pages:** the arrow buttons, ← / →, Page Up / Page Down, Home / End, a click on a page's outer half, or drag a page.
- **Keys:** T for contents, L for language, M for sound.
- **Phones and portrait screens** show one page at a time.
- **Every page has its own address**, and the browser's Back button turns back. For example: https://akiyamasuguru.github.io/#opengma
- https://akiyamasuguru.github.io/?still turns off motion, as does the system's reduce-motion setting.

Page addresses, in order: `cover` `title` `contents` `preface` `about` `open-source` `openxpsanalyzer` `opengma` `star-trails` `binding` `research` `cross-section` `stages` `early-work` `publications` `cite` `timeline` `years` `methods` `tools` `letters` `letter` `the-end` `back-cover`

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | The book: 13 leaves (26 pages) and **all English text** |
| `assets/css/book.css` | All styles: the case, the book, each page, the phone layout, Chinese overrides |
| `assets/js/book/main.js` | Entry point: draws the artwork, sizes the book, keeps the page address in the URL |
| `assets/js/book/casket.js` | The case and its opening: latch, doors on springs, light and gold dust, the book rising |
| `assets/js/book/book.js` | Page-turning engine: leaves, drag and peek, shadows, single-page mode, addresses, keys |
| `assets/js/book/pages.js` | Interactive pages: copy buttons, citation slip, cross-section, map and years, star charts, sealed letter |
| `assets/js/book/ornaments.js` | Shared SVG artwork: gradients, eight-point star lattices, acanthus, laurel, astrolabe, covers, page frames |
| `assets/js/book/illustrations.js` | Page illustrations: ex libris, cameo, back cover, cross-section, crystal, map, star charts, envelope, binding diagram |
| `assets/js/book/emblem.js` | The author's emblem. **Reserved, not open source** (see License) |
| `assets/js/book/scene.js` | The night sky: stars, constellations, shooting stars, gold dust |
| `assets/js/book/sound.js` | Sounds synthesized with Web Audio: latch, chime, doors, pages, seal |
| `assets/js/book/motion.js` | Tweens, springs and waits, all of which can be skipped |
| `assets/js/book/xps.js` | The XPS spectrum drawn on the OpenXPSAnalyzer plate |
| `assets/js/i18n.js` | Language switch: reads English from the page, swaps in Chinese, remembers the choice |
| `assets/js/locales/zh.js` | **All Chinese text**, keyed like the `data-i18n` attributes in `index.html` |
| `assets/img/emblem.svg`, `favicon.png`, `apple-touch-icon.png`, `social.jpg` | Tab, home-screen and link-preview images. **Reserved, not open source** |
| `LICENSE` | What is open source and what is not, followed by the GNU AGPL-3.0 |

## Editing text

- **English:** edit the text in `index.html`. English mode stays English throughout.
- **Chinese:** edit the value with the same key in `assets/js/locales/zh.js`. Chinese mode may keep English where it reads better, such as the motto, file names and the English title.
- **New text:** add `data-i18n="some.key"` to the element in `index.html`, then `'some.key': '…'` to `zh.js`.
  For attributes use `data-i18n-attr="aria-label:some.key"`. Text without a Chinese entry stays in English.
- **Text that only JavaScript shows** (the notes for the cross-section and the star charts, "Copied", the language button's label) is in the `en` dictionary in `assets/js/i18n.js`, with its Chinese in `zh.js`.

## Adding or moving pages

Each leaf is a `<div class="leaf page">` holding two `<section class="face … paper" data-page="address">`: the `front` face is a right-hand page, the `back` face the left-hand page after it.
When you add or remove a leaf, renumber the folios (`<p class="folio">`) and the page numbers in the contents.
Pages size their type with container units (`cqw`, `cqh`), so check that each page's text still fits inside its frame, in both languages.

## Language

English, unless the address has `?lang=zh` or the visitor chose Chinese before. Visitors switch with the EN / 中 pill or the **L** key.

- English: https://akiyamasuguru.github.io/?lang=en
- 中文: https://akiyamasuguru.github.io/?lang=zh

## Deploy

GitHub Pages publishes the root of `main` (Settings → Pages → Deploy from a branch → `main` / root) at **https://akiyamasuguru.github.io/**.
Every push to `main` goes live about a minute later.

## License

**Only the code is open source.**

- **Code** (HTML, CSS, JavaScript): [GNU AGPL-3.0](LICENSE). You may use, change and share it. If you share a changed version, or run it as a website, you must offer its source under the same license.
- **Not open source: the emblem and all icon designs.** The author's emblem (an "M" above two star trails) in every form, including the ex libris, cameo, wax seal and back-cover emblem; the image files in `assets/img/` (`emblem.svg`, `favicon.png`, `apple-touch-icon.png`, `social.jpg`); and `assets/js/book/emblem.js`, which draws the emblem. © 2026 Jay Ma. All rights reserved. **Commercial use is prohibited.**
- **Not open source: the personal content.** The text about the author and the author's research, publications and letters. © 2026 Jay Ma. All rights reserved.

If you build on this code, replace the emblem, the icons and the personal content with your own.

### 许可说明

**本项目只开源代码部分。**

- **代码**（HTML、CSS、JavaScript）采用 [GNU AGPL-3.0](LICENSE)：可以使用、修改和分享；分享修改后的版本或将其作为网站运行时，必须以同一许可公开源代码。
- **徽标与所有图标设计不开源**：作者徽标（两道星轨之上的 “M”）的一切形式，包括藏书票、肖像章、火漆印与封底徽标；`assets/img/` 中的图片文件（`emblem.svg`、`favicon.png`、`apple-touch-icon.png`、`social.jpg`）；以及绘制徽标的 `assets/js/book/emblem.js`。© 2026 Jay Ma，保留所有权利，**禁止商用**。
- **个人内容不开源**：关于作者及其研究、论文与书信的文字。© 2026 Jay Ma，保留所有权利。

基于本项目开发时，请将徽标、图标与个人内容替换为你自己的。
