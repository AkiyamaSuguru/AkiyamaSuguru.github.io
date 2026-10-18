# The Book of Star Trails · Jay Ma

**Live site: https://akiyamasuguru.github.io/**

The homepage of Jay Ma, bound as a book. While the page loads, a shooting star crosses a dark sky; then a hardcover case waits under the night sky, an object you can turn round in 3D. Press the astrolabe's rule and its doors swing open until they lie flat, the book rises out while the case sinks away, and the book, now lying flat like an e-book, opens its cover. Paper pages turn with a page curl that follows your hand; the covers swing over as boards. Inside are a preface, the author, three open-source projects (OpenXPSAnalyzer, opengma and this book) with two pages on what of this book is open and what is reserved, research, publications, a timeline, methods and letters, with a quiet piece of music in the background.

English by default, with a Chinese edition. No build step: plain HTML, CSS and native ES modules, served by GitHub Pages.

## Reading

- **The case** is an object: drag it (or use the arrow keys) to turn it and look at it from any side. Only the astrolabe's rule at its centre opens it; nothing on it can be selected. **Skip** (or Esc) jumps to the end of the opening.
- **Turn pages:** drag a page by its corner or edge (it curls under your hand; let go past halfway, or flick, and it turns), click a page, or use the arrow buttons, ← / →, Page Up / Page Down, Home / End. On a computer a corner lifts a little as the mouse comes near.
- **Keys:** T for contents, L for language, M for sound.
- **Phones and portrait screens** show one page at a time, turned with the same page curl, like an e-book reader.
- **Music** starts softly after your first click or key; the ♪ button turns it off (and remembers), the sound button mutes everything, and it pauses while the tab is hidden.
- **Every page has its own address**, and the browser's Back button turns back. For example: https://akiyamasuguru.github.io/#opengma
- https://akiyamasuguru.github.io/?still turns off motion, as does the system's reduce-motion setting.

Page addresses, in order: `cover` `title` `contents` `preface` `about` `open-source` `openxpsanalyzer` `opengma` `star-trails` `binding` `license` `reserved` `research` `cross-section` `stages` `early-work` `publications` `cite` `timeline` `years` `methods` `tools` `letters` `letter` `the-end` `back-cover`

## Files

| Path | What it holds | Rights |
| --- | --- | --- |
| `index.html` | The book: 14 leaves (28 pages) and **all English text** | Markup: AGPL-3.0. Text, personal information and icons: **reserved** |
| `assets/css/book.css` | All styles: the case, the book, each page, the phone layout, Chinese overrides | AGPL-3.0, apart from the icons embedded in it (**reserved**) |
| `assets/js/book/main.js` | Entry point: draws the artwork, sizes the book, keeps the page address in the URL, and lifts the shooting-star intro once the type has loaded | AGPL-3.0 |
| `assets/js/book/casket.js` | The case: turning it in 3D with light on each face, and its opening (latch, doors that open flat, light and gold dust, the book rising) | AGPL-3.0 |
| `assets/js/book/book.js` | The reader: two pages or one, page curls and board swings, dragging, the corner that lifts, addresses, keys | AGPL-3.0 |
| `assets/js/book/curl.js` | The geometry of the page curl: where the paper rolls over, the folded flap, the reflection that lays the other side onto it | AGPL-3.0 |
| `assets/js/book/music.js` | The music player: loads the music after the first click, loops without a seam, fades with the tab and the switches | AGPL-3.0 |
| `assets/js/book/pages.js` | Interactive pages: copy buttons, citation slip, cross-section, map and years, star charts, sealed letter | AGPL-3.0 |
| `assets/js/book/ornaments.js` | Shared SVG artwork: gradients, eight-point star lattices, acanthus, laurel, astrolabe, covers, page frames | **Reserved** |
| `assets/js/book/illustrations.js` | Page illustrations: ex libris, cameo, back cover, cross-section, crystal, map, star charts, envelope, binding diagram | **Reserved** |
| `assets/js/book/emblem.js` | The author's emblem | **Reserved** |
| `assets/js/book/scene.js` | The night sky: stars, constellations, shooting stars, gold dust | AGPL-3.0 |
| `assets/js/book/sound.js` | Sounds synthesized with Web Audio: latch, chime, doors, pages, seal | AGPL-3.0 |
| `assets/audio/a-memory-among-the-stars.m4a` | The music, about 2 MB (AAC) | **Reserved** |
| `assets/js/book/motion.js` | Tweens, springs and waits, all of which can be skipped | AGPL-3.0 |
| `assets/js/book/xps.js` | The XPS spectrum drawn on the OpenXPSAnalyzer plate | **Reserved** |
| `assets/js/i18n.js` | Language switch: reads English from the page, swaps in Chinese, remembers the choice | AGPL-3.0 |
| `assets/js/locales/zh.js` | **All Chinese text**, keyed like the `data-i18n` attributes in `index.html` | **Reserved** |
| `assets/img/emblem.svg`, `favicon.png`, `apple-touch-icon.png`, `social.jpg` | Tab, home-screen and link-preview images | **Reserved** |
| `LICENSE` | The GNU AGPL-3.0, which covers the code | |
| `NOTICE.md` | Exactly what is open source and what is reserved, in English and Chinese | |
| `robots.txt` | Search engines welcome; crawlers that gather data for AI training are asked to keep out | |
| `.well-known/tdmrep.json` | Text and data mining reserved, machine-readably (W3C TDMRep), like the `tdm-reservation` tag in `index.html` | |

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

## Music

*A Memory Among the Stars* is an original piece made for this book: piano, with violin, cello and a little harp, in 3/4 at about 64 beats a minute. It moves through four stages (a long night, a quiet struggle, a glimpse of tomorrow, and peace without forgetting) and lasts about 91 seconds before it returns to its beginning. The last bar is a suspended chord that resolves into the first, and the file loops between two exact marks, so there is no seam.

The instruments are modelled in code, not sampled, so no recordings or sound libraries are involved. The score, the renderer, the full-quality master and a MIDI file are kept outside this repository; only the 2 MB file the page plays is published here.

## Deploy

GitHub Pages publishes the root of `main` (Settings → Pages → Deploy from a branch → `main` / root) at **https://akiyamasuguru.github.io/**.
Every push to `main` goes live about a minute later.

The site is entirely static: no build step and no server code, file names are case-sensitive, and GitHub Pages sets its own caching (about ten minutes). The largest file is the music (about 2 MB), which is fetched only after the visitor's first click.

## License

**Only the code is open source.** Everything else (the personal information, the design and the content) is reserved. [NOTICE.md](NOTICE.md) gives the details, and the book explains it on two of its own pages, *What Is Open* and *What Is Reserved* (https://akiyamasuguru.github.io/#license).

- **Code: [GNU AGPL-3.0](LICENSE) (`AGPL-3.0-only`), a strong copyleft license.** The page markup, the styles and the scripts that run the book (see the Rights column above). You may use, study, change and share it. If you share a changed version, or run one as a website, you must publish its full source under the same license, keep the notices and mark your changes.
- **Reserved: personal information.** The author's name, life, research, publications, timeline, contact details and letters.
- **Reserved: design.** The emblem in every form, all icons, and every ornament, pattern, frame, cover, illustration and other design element, in whatever form, including those drawn or embedded by code (`emblem.js`, `ornaments.js`, `illustrations.js`, `xps.js`, `assets/img/`, and the icons inside `index.html` and `book.css`).
- **Reserved: content and music.** The title and all the text in both languages (`index.html`, `zh.js`), and the music (`assets/audio/`).

© 2026 Jay Ma. Everything the AGPL does not cover is reserved: **no use in any form** without written permission, commercial or not, including text and data mining and AI training. Fair use that the law allows (personal study, research, or a brief quotation that names its source) needs no permission; please keep within it.

If you build on the code, replace everything reserved with your own.

### 许可说明

**本项目只开源代码**。除代码以外的一切（个人信息、设计与内容）均保留所有权利。详见 [NOTICE.md](NOTICE.md)；书中的“开源范围”与“保留范围”两页（<https://akiyamasuguru.github.io/?lang=zh#license>）也有说明。

- **代码：[GNU AGPL-3.0](LICENSE)（`AGPL-3.0-only`），强 Copyleft 许可证**。页面标记、样式以及驱动本书的脚本（见上方文件表的 Rights 一列）。可以使用、研究、修改与分享；分享修改后的版本，或将其作为网站运行时，必须以同一许可证公开全部源代码，保留声明并注明修改。
- **保留：个人信息**。作者的姓名、经历、研究、论文、时间线、联系方式与书信。
- **保留：设计**。徽标的一切形式、所有图标，以及一切纹饰、图案、边框、封面、插图与其他设计元素，无论以何种形式存在，包括由代码绘制或嵌入代码之中的部分（`emblem.js`、`ornaments.js`、`illustrations.js`、`xps.js`、`assets/img/`，以及 `index.html` 与 `book.css` 中的图标）。
- **保留：内容与音乐**。书名与全部中英文文字（`index.html`、`zh.js`），以及背景音乐（`assets/audio/`）。

© 2026 Jay Ma。AGPL 不涵盖的一切均保留所有权利：未经书面许可，**禁止以任何形式使用**，无论商业或非商业用途，包括文本与数据挖掘及 AI 训练。法律允许的合理使用（个人学习、研究，或注明出处的适当引用）无需许可，请遵守这一界限。

基于本项目的代码开发时，请将所有保留内容替换为你自己的。
