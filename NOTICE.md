# Notice: what is open source here, and what is not

**The Book of Star Trails**, the homepage of Jay Ma: https://akiyamasuguru.github.io/
Copyright © 2026 Jay Ma (AkiyamaSuguru)

**Only the code is open source.** Everything else belongs to the author, with all rights reserved: the personal information, the design (the emblem, the icons and every other design element) and the content.

[中文版本见下方](#声明本项目的开源范围与保留权利)

## 1. The code: open source under the GNU AGPL-3.0

The code of this website is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3 (SPDX: `AGPL-3.0-only`). It is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. The full text is in [LICENSE](LICENSE).

The AGPL is a strong copyleft license. If you share a changed version, or run one as a website or any other network service, you must publish its complete source under the same license, keep the copyright and license notices, and mark what you changed.

"The code" is exactly this:

- the HTML markup of `index.html`: its structure, not the text, the personal information or the icons in it;
- `assets/css/book.css`, apart from the icons embedded in it;
- `assets/js/i18n.js`;
- in `assets/js/book/`: `main.js`, `book.js`, `curl.js`, `casket.js`, `pages.js`, `scene.js`, `sound.js`, `music.js` and `motion.js`.

Each of these files starts with `SPDX-License-Identifier: AGPL-3.0-only`. The two files that also hold reserved material, `index.html` and `book.css`, are marked `AGPL-3.0-only AND LicenseRef-All-Rights-Reserved`.

## 2. Reserved: not open source

The following are **not** covered by the AGPL or by any other license. Copyright © 2026 Jay Ma. All rights reserved.

1. **Personal information:** the author's name, biography, education, research, thesis, publications, timeline, contact details and letters, and the names and details of the other people mentioned in the book.
2. **Design:** the author's emblem in every form and variant (including the ex libris, the cameo, the wax seal and the back-cover emblem); all icons; and the ornaments, patterns, frames, covers, endpapers, the case and its lining, seals, initials, figures, charts, maps, star charts and every other illustration or design element. This holds in any form, whether image files, SVG, or artwork drawn or embedded by code, wherever it appears, including the icons inline in `index.html` and the images embedded in `book.css`.
3. **Content:** the title and all the text of the book, in English and in Chinese.
4. **Music:** *A Memory Among the Stars* and its audio files.

These files are reserved in full: everything in `assets/img/` and `assets/audio/`, and `assets/js/book/emblem.js`, `assets/js/book/ornaments.js`, `assets/js/book/illustrations.js`, `assets/js/book/xps.js` and `assets/js/locales/zh.js`. They are marked `LicenseRef-All-Rights-Reserved`.

**No use of any kind is permitted without the author's prior written permission**, whether commercial or non-commercial. In particular, you may not copy, reproduce, download for reuse, modify, adapt, translate, redistribute, publish, display or perform them elsewhere, include them in other works or products, use them as a logo or mark, or use them for text and data mining or to train machine-learning models.

Viewing them on the website, and viewing or forking this public repository on GitHub as GitHub's Terms of Service allow, give no other rights. Keeping the copyright and license notices that the AGPL requires, which name the author, needs no permission.

## 3. Fair use

This notice does not take away what the law allows without permission, such as personal study, research or appreciation, or a brief quotation for introduction, comment or criticism that names the author and the source (fair use). Please keep within it: quote sparingly, always name the source, never present this work as your own, and do not use the personal information. Anything beyond fair use needs written permission first.

## 4. If you reuse the code

Replace everything reserved with your own, or leave it out:

- your own text and personal information in `index.html` and `zh.js`;
- your own emblem, icons, ornaments and illustrations: new `emblem.js`, `ornaments.js`, `illustrations.js` and `xps.js` with the same exports, and new icons in place of those in `index.html` and `book.css`;
- your own images and music.

To ask for permission, write to the author at the address on the book's letter page (https://akiyamasuguru.github.io/#letter), or through GitHub (@AkiyamaSuguru).

---

# 声明：本项目的开源范围与保留权利

**星轨之书**（The Book of Star Trails），Jay Ma 的个人主页：https://akiyamasuguru.github.io/
版权所有 © 2026 Jay Ma (AkiyamaSuguru)

**本项目只开源代码**。除代码以外的一切均归作者所有，保留所有权利：个人信息、设计（徽标、图标及其他一切设计元素）以及内容。

## 一、代码：以 GNU AGPL-3.0 开源

本网站的代码是自由软件：你可以依据自由软件基金会发布的 GNU Affero 通用公共许可证第 3 版（SPDX：`AGPL-3.0-only`）再分发和/或修改它。发布它是希望它有用，但不提供任何担保，亦不含适销性或特定用途适用性的默示担保。许可证全文见 [LICENSE](LICENSE)。

AGPL 是强 Copyleft（具有“传染性”）的许可证：分享修改后的版本，或将其作为网站或其他网络服务运行时，必须以同一许可证公开全部源代码，保留版权与许可声明，并注明所作的修改。

“代码”仅指以下部分：

- `index.html` 的 HTML 标记：页面结构，不含其中的文字、个人信息与图标；
- `assets/css/book.css`，不含其中嵌入的图标；
- `assets/js/i18n.js`；
- `assets/js/book/` 中的 `main.js`、`book.js`、`curl.js`、`casket.js`、`pages.js`、`scene.js`、`sound.js`、`music.js` 与 `motion.js`。

这些文件开头都标有 `SPDX-License-Identifier: AGPL-3.0-only`。其中 `index.html` 与 `book.css` 同时含有保留内容，标为 `AGPL-3.0-only AND LicenseRef-All-Rights-Reserved`。

## 二、保留权利：不开源

以下内容**不适用** AGPL，也不适用任何其他许可。版权所有 © 2026 Jay Ma，保留所有权利。

1. **个人信息**：作者的姓名、简介、教育经历、研究、学位论文、论文、时间线、联系方式与书信，以及书中提及的其他人的姓名与信息。
2. **设计**：作者徽标的一切形式与变体（包括藏书票、肖像章、火漆印与封底徽标）；所有图标；以及纹饰、图案、边框、封面、环衬、书匣及其内衬、印章、首字母饰、插图、图表、地图、星图和其他一切插图与设计元素。无论以何种形式存在（图片文件、SVG，或由代码绘制、嵌入代码之中），无论出现在何处（包括 `index.html` 中的内联图标与 `book.css` 中嵌入的图像），均在此列。
3. **内容**：书名以及书中全部中英文文字。
4. **音乐**：《A Memory Among the Stars》及其音频文件。

以下文件整体保留：`assets/img/` 与 `assets/audio/` 中的全部文件，以及 `assets/js/book/emblem.js`、`assets/js/book/ornaments.js`、`assets/js/book/illustrations.js`、`assets/js/book/xps.js` 与 `assets/js/locales/zh.js`。它们标为 `LicenseRef-All-Rights-Reserved`。

**未经作者事先书面许可，禁止以任何形式使用**，无论商业或非商业用途。尤其不得复制、转载、为再利用而下载、修改、改编、翻译、再分发、发布，不得在别处展示或表演，不得收入其他作品或产品，不得用作标志或标识，也不得用于文本与数据挖掘或训练机器学习模型。

在本网站上浏览这些内容，以及 GitHub 服务条款所允许的对本公开仓库的查看与派生（fork），均不授予任何其他权利。保留 AGPL 所要求的版权与许可声明（其中含有作者姓名）无需许可。

## 三、合理使用

本声明不限制法律本身允许的、无需许可的使用，例如个人学习、研究或欣赏，或为介绍、评论、批评而适当引用并注明作者与出处（合理使用）。请遵守这一界限：适度引用，始终注明出处，不将本作品冒充为自己的作品，不使用其中的个人信息。超出合理使用范围的，须事先取得书面许可。

## 四、复用代码时

请将所有保留内容替换为你自己的，或者直接去掉：

- 在 `index.html` 与 `zh.js` 中换上你自己的文字与个人信息；
- 换上你自己的徽标、图标、纹饰与插图：以相同的导出接口重写 `emblem.js`、`ornaments.js`、`illustrations.js` 与 `xps.js`，并替换 `index.html` 与 `book.css` 中的图标；
- 换上你自己的图片与音乐。

如需许可，请通过书中书信页上的地址（<https://akiyamasuguru.github.io/#letter>）或 GitHub（@AkiyamaSuguru）联系作者。
