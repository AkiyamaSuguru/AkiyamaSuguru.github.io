# Fonts

The book's typefaces are served from this folder instead of Google Fonts or a CDN, so the pages never wait on services that are often blocked or slow, as they are in mainland China. `fonts.css` declares them; a browser downloads only the slices that hold the characters on screen.

**These fonts are not the author's work.** Each belongs to its authors and is licensed under the **SIL Open Font License 1.1** (OFL). Its copyright notice and license are in `OFL.txt` in its folder. The fonts are not covered by this site's AGPL-3.0, and they are not part of the reserved design described in [NOTICE.md](../../NOTICE.md). The OFL lets anyone use, study, modify and redistribute them, but not sell them by themselves.

| Folder | Typeface | Copyright | Files |
| --- | --- | --- | --- |
| `cinzel/` | Cinzel, weights 400–700 | 2020 The Cinzel Project Authors | Google Fonts web font slices (cinzel v26), unchanged |
| `cinzel-decorative/` | Cinzel Decorative Bold | 2012 Natanael Gama, Reserved Font Name "Cinzel" | The original TrueType file from github.com/google/fonts (`ofl/cinzeldecorative`), unmodified. A subset would be a Modified Version, which may not carry the reserved name, so the whole original file is used. |
| `eb-garamond/` | EB Garamond 400, 500 and italic 400 | 2017 The EB Garamond Project Authors | Google Fonts web font slices (ebgaramond v33), unchanged |
| `noto-serif-sc/` | Noto Serif SC, weights 500 and 700 | 2012 Google Inc. | Google Fonts web font slices (notoserifsc v36), unchanged |
| `lxgw-wenkai/` | LXGW WenKai (霞鹜文楷) Regular | 2021–2026 LXGW, and 2020 The Klee Project Authors; Reserved Font Names "霞鹜", "霞鶩", "落霞孤鹜", "落霞孤鶩" and "LXGW" | Web font slices from the npm package lxgw-wenkai-webfont 1.7.0 by Chawye Hsu, unchanged. LXGW's additional permission (at the top of `OFL.txt`) allows the reserved names in versions subsetted or converted to WOFF2 solely for web font delivery, provided they are not offered as installable desktop fonts; here they only display this site. The package's `@font-face` rules, used in `fonts.css`, are under the MIT License, Copyright (c) 2021 Chawye Hsu: `LICENSE-webfont.txt`. |

To update a font, replace its files from the same source and keep its license files.

---

**字体说明：** 本书使用的字体都放在这个文件夹里由本站自己提供，不再依赖 Google Fonts 或 CDN（这些服务在中国大陆常常无法访问）。这些字体不是作者的作品，各自属于原作者，采用 SIL 开放字体许可证 1.1（OFL），版权声明与许可证见各文件夹中的 `OFL.txt`；它们不适用本站的 AGPL-3.0，也不属于 NOTICE.md 所述的保留设计。所有字体文件都是发布方提供的网页字体原样，未作修改。霞鹜文楷的保留字体名称依其附加许可，可用于仅供网页显示的子集化 WOFF2 版本，前提是不作为可安装的桌面字体提供；本站只用它来显示网页。
