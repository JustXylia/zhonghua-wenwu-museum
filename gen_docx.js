const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak
} = require("docx");

const cjkFont = { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" };
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 2340, type: WidthType.DXA },
    shading: opts.header ? { fill: "D5E8F0", type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text, bold: !!opts.header, font: cjkFont, size: 20 })]
    })]
  });
}

function row(cells, opts = {}) {
  return new TableRow({
    cantSplit: true,
    children: cells.map(c => cell(c, opts))
  });
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, font: cjkFont, size: level === HeadingLevel.HEADING_1 ? 32 : 28 })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: cjkFont, size: 22, ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: cjkFont, size: 22 })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: cjkFont, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: cjkFont },
        paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0, keepNext: false, keepLines: false } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: cjkFont },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1, keepNext: false, keepLines: false } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: cjkFont },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2, keepNext: false, keepLines: false } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "\u4E2D\u534E\u6587\u7269\u7F51\u7AD9 \u00B7 \u67B6\u6784\u6846\u67B6", font: cjkFont, size: 18, color: "999999" })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "\u7B2C ", font: cjkFont, size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: cjkFont, size: 18, color: "999999" }), new TextRun({ text: " \u9875", font: cjkFont, size: 18, color: "999999" })]
      })] })
    },
    children: [
      // ========== 标题 ==========
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [new TextRun({ text: "\u4E2D\u534E\u6587\u7269\u6570\u5B57\u535A\u7269\u9986", bold: true, font: cjkFont, size: 44, color: "c9a962" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 100 },
        children: [new TextRun({ text: "\u7F51\u7AD9\u67B6\u6784\u6846\u67B6\u68B3\u7406", bold: true, font: cjkFont, size: 36, color: "c9a962" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 },
        children: [new TextRun({ text: "\u57FA\u4E8E\u7F51\u7AD9\u5B9E\u9645\u4EE3\u7801\u53CD\u5411\u68B3\u7406 \u00B7 23\u4E2AHTML\u9875\u9762 \u00B7 157\u5F20\u56FE\u7247 \u00B7 6\u7EC4Canvas\u7C92\u5B50 \u00B7 4\u4E2AThree.js 3D\u6A21\u578B", font: cjkFont, size: 20, color: "8b949e" })]
      }),

      // ========== 一、统一导航栏 ==========
      heading("\u4E00\u3001\u7EDF\u4E00\u5BFC\u822A\u680F\uFF085\u94FE\u63A5\u5236\uFF09", HeadingLevel.HEADING_1),
      para("\u5168\u7AD923\u4E2A\u9875\u9762\u5747\u91C7\u7528\u7EDF\u4E00\u7684\u56FA\u5B9A\u5BFC\u822A\u680F\uFF0C\u786C\u7F16\u7801\u989C\u8272\uFF08\u91D1\u8272 #c9a962 / \u7070\u8272 #8a8578\uFF09\uFF0C768px\u4EE5\u4E0B\u54CD\u5E94\u5F0F\u7F29\u51CF\u95F4\u8DDD\u3002"),
      para("\u5BFC\u822A\u94FE\u63A5\u987A\u5E8F\uFF1A\u9996\u9875 \u2192 \u6587\u660E\u957F\u5377 \u2192 \u6587\u7269\u4FEE\u590D \u2192 \u5C71\u6CB3\u76FC\u5F52 \u2192 \u63A8\u5E7F", { bold: true }),

      // ========== 二、页面层级架构 ==========
      heading("\u4E8C\u3001\u9875\u9762\u5C42\u7EA7\u67B6\u6784", HeadingLevel.HEADING_1),

      heading("Tier 1 \u00B7 \u6838\u5FC3\u9875\u9762\uFF08\u5BFC\u822A\u680F\u76F4\u8FBE\uFF09", HeadingLevel.HEADING_2),
      bullet("index.html \u9996\u9875 \u00B7 2893\u884C / 105KB \u2014 Hero\u7A7F\u8D8A\u533A + \u516D\u5927\u677F\u5757\u6982\u89C8\uFF0C6\u4E2ACanvas\u7C92\u5B50\u7CFB\u7EDF\uFF08hero/vessels/stone/history/restoration/promotion\uFF09\uFF0C\u9F20\u6807\u4EA4\u4E92\u7A7F\u8D8A\u6548\u679C"),
      bullet("heritage-unified.html \u6587\u660E\u957F\u5377 \u00B7 714\u884C / 32KB \u2014 \u4E09\u97F5\u5408\u4E00\uFF08\u5668\u4E4B\u7075 + \u77F3\u4E4B\u97F5 + \u53F2\u4E4B\u75D5\uFF09\uFF0C\u542Bhero-bg-canvas\u7C92\u5B50\u80CC\u666F"),
      bullet("restoration-cover.html \u6587\u7269\u4FEE\u590D \u00B7 1207\u884C / 41KB \u2014 \u6570\u5B57\u5316\u4FEE\u590D\u6982\u89C8\uFF0C\u56DB\u6BB5\u5F0F\u7ED3\u6784\uFF08hero + intro + preview + timeline\uFF09"),
      bullet("shanhe-pangui.html \u5C71\u6CB3\u76FC\u5F52 \u00B7 1023\u884C / 38KB \u2014 \u6D77\u5916\u9057\u73CD\u4E13\u9898\uFF0C12\u4EF6\u6D41\u5931\u6587\u7269\uFF0Cstarfield\u661F\u7A7A\u7C92\u5B50 + \u8F6E\u64AD\u80CC\u666F\uFF0C\u542B\u6D41\u5931\u4E4B\u8C31\u6570\u636E\u77E9\u9635\u3001\u673A\u6784\u6E05\u5355\u3001\u8FD8\u9001\u65F6\u95F4\u7EBF"),
      bullet("promotion-cover.html \u63A8\u5E7F \u00B7 1389\u884C / 50KB \u2014 \u6587\u521B\u4E0E\u6D3B\u52A8\u6982\u89C8\uFF0C\u4E92\u52A8\u4F53\u9A8C\u5206\u533A\u524D\u7F6E"),

      heading("Tier 2 \u00B7 \u677F\u5757\u5C01\u9762\u4E0E\u8BE6\u60C5\u9875", HeadingLevel.HEADING_2),
      bullet("vessels-cover.html + vessels-detail.html \u5668\u4E4B\u7075 \u2014 \u9752\u94DC\u793C\u5668 / \u7389\u77F3\u793C\u5668 / \u91D1\u94F6\u5668\u76D4 / \u9676\u74F7\u7CBE\u54C1\uFF0C\u56DB\u6BB5\u5F0F\u7ED3\u6784"),
      bullet("stone-cover.html + stone-detail.html \u77F3\u4E4B\u97F5 \u2014 \u5927\u8DB3 / \u4E91\u5188 / \u9F99\u95E8 / \u9EA6\u79EF\u5C71 / \u6566\u714C\u83AB\u9AD8\u7A9F / \u4E50\u5C71\u5927\u4F5B"),
      bullet("history-cover.html + history-detail.html \u53F2\u4E4B\u75D5 \u2014 \u9B4F\u664B\u4E66\u6CD5 / \u5510\u5B8B\u7ED8\u753B / \u660E\u6E05\u975E\u9057 / \u8FD1\u73B0\u4EE3\u4F20\u627F"),
      bullet("restoration-detail.html \u4FEE\u590D\u6280\u672F\u8BE6\u60C5 \u00B7 442\u884C \u2014 \u6570\u5B57\u5B6A\u751F / AI\u8272\u5F69\u8FD8\u539F / VR\u6C89\u6D78 / \u533A\u5757\u94FE\u5B58\u8BC1\uFF0C\u542B\u7EB9\u9970\u9274\u8BC6\u8DF3\u8F6C"),
      bullet("shanhe-detail.html \u5C71\u6CB3\u76FC\u5F52\u5355\u4EF6\u8BE6\u60C5 \u00B7 1000\u884C \u2014 \u6D41\u6563\u5370\u8BB0\u73BB\u7483\u65F6\u95F4\u8F74 + 4\u00D74\u62D6\u62FD\u62FC\u56FE\u5C0F\u6E38\u620F\uFF08\u542B\u89E6\u6478\u652F\u6301 + \u5B8C\u6210\u5F39\u7A97 + \u85CF\u5934\u8BD7\uFF09"),
      bullet("promotion-detail.html \u63A8\u5E7F\u8BE6\u60C5 \u00B7 741\u884C \u2014 \u6587\u521B\u4EA7\u54C1 / NFT / \u4E3B\u9898\u5C55\u89C8 / \u7814\u5B66\u6559\u80B2 / \u4E91\u5C55\u89C8 / \u56FD\u9645\u4EA4\u6D41"),

      heading("Tier 3 \u00B7 \u4E92\u52A8\u4F53\u9A8C\u9875\u9762", HeadingLevel.HEADING_2),
      bullet("museum-3d.html \u6307\u5C16\u535A\u7269\u9986 \u00B7 1223\u884C / 111KB \u2014 174\u4EF6\u6587\u7269\u00B78\u5927\u7C7B\u522B\u00B719\u671D\u4EE3\uFF0C\u5206\u7C7B\u7B5B\u9009 + \u6587\u7269\u7F51\u683C\uFF0C3D\u89D2\u6807 + \u5F39\u7A97"),
      bullet("song-painting.html \u5B8B\u753B\u96C5\u8DA3 \u00B7 3781\u884C / 154KB \u2014 5\u4E2ACanvas\uFF08bg/paint/guide/reveal/aiParticle\uFF09\uFF0C8\u4E2A\u5B8B\u4EE3\u7ED8\u753B\u4E3B\u9898\uFF0CWeb Audio API\u53E4\u7434\u97F3\u8272"),
      bullet("pattern-atlas.html \u7EB9\u9970\u56FE\u9274 \u00B7 812\u884C \u2014 AR\u7EB9\u6837\u9274\u8BC6\u4E0E\u5C55\u793A"),
      bullet("dazu-rock-carvings.html \u5927\u8DB3\u77F3\u523B\u4E13\u9898 \u00B7 1040\u884C \u2014 \u72EC\u7ACB\u4E13\u9898\u9875\uFF0C\u542C6\u4E2Asection"),

      heading("Tier 4 \u00B7 Three.js \u4E09\u7EF4\u6587\u7269\u5355\u4EF6\u9875\u9762", HeadingLevel.HEADING_2),
      bullet("museum-huniu.html \u864E\u599E\u6DF3\u4E8E \u00B7 Three.js"),
      bullet("museum-jiagu.html \u51FB\u9F13\u8BF4\u5531\u4FD1 \u00B7 Three.js"),
      bullet("museum-niao.html \u9752\u94DC\u9E1F \u00B7 Three.js"),
      bullet("sanyangzun-3d.html \u4E09\u7F8A\u5C0A \u00B7 Three.js"),
      bullet("museum-index.html \u6307\u5C16\u535A\u7269\u9986\u5165\u53E3\u9875 \u00B7 289\u884C"),

      // ========== 三、用户浏览路径 ==========
      heading("\u4E09\u3001\u7528\u6237\u6D4F\u89C8\u8DEF\u5F84", HeadingLevel.HEADING_1),
      para("\u8DEF\u5F841\uFF1A\u9996\u9875 \u2192 \u6587\u660E\u957F\u5377 \u2192 \u5668\u4E4B\u7075\u8BE6\u60C5", { bold: true }),
      para("\u8DEF\u5F842\uFF1A\u9996\u9875 \u2192 \u6587\u7269\u4FEE\u590D \u2192 \u4FEE\u590D\u6280\u672F\u8BE6\u60C5 \u2192 \u7EB9\u9970\u56FE\u9274", { bold: true }),
      para("\u8DEF\u5F843\uFF1A\u9996\u9875 \u2192 \u5C71\u6CB3\u76FC\u5F52 \u2192 \u5355\u4EF6\u6587\u7269\u8BE6\u60C5 \u2192 \u62FC\u56FE\u5C0F\u6E38\u620F", { bold: true }),
      para("\u8DEF\u5F844\uFF1A\u9996\u9875 \u2192 \u63A8\u5E7F \u2192 \u6307\u5C16\u535A\u7269\u9986 \u2192 3D\u5355\u4EF6\u9875\u9762\uFF084\u4E2A\uFF09", { bold: true }),
      para("\u8DEF\u5F855\uFF1A\u63A8\u5E7F\u9875 \u2192 \u5B8B\u753B\u96C5\u8DA3 \u2192 \u4E34\u6FBE\u4F5C\u753B\uFF085\u5C42Canvas\uFF09", { bold: true }),

      // ========== 四、技术栈 ==========
      heading("\u56DB\u3001\u6280\u672F\u6808", HeadingLevel.HEADING_1),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2200, 3300, 3820],
        rows: [
          row(["\u5206\u7C7B", "\u6280\u672F", "\u5E94\u7528\u573A\u666F"], { header: true }),
          row(["\u524D\u7AEF\u6846\u67B6", "\u7EAF\u539F\u751F HTML/CSS/JavaScript", "\u5168\u7AD9\u65E0 React/Vue \u7B49\u6846\u67B6"]),
          row(["3D\u5F15\u64CE", "Three.js (jsdelivr CDN)", "4\u4E2A\u6587\u72693D\u5355\u4EF6\u9875\u9762\uFF0CDRACOLoader\u52A0\u8F7D\u538B\u7F29GLB"]),
          row(["\u7C92\u5B50\u7CFB\u7EDF", "Canvas + Float32Array (SoA)", "\u9996\u98756\u7EC4 + \u5C71\u6CB3\u76FC\u5F52\u661F\u7A7A\uFF0C\u7CBE\u7075\u56FE\u9884\u6E32\u67D3+lighter\u6DF7\u5408"]),
          row(["\u97F3\u9891", "Web Audio API", "\u5B8B\u753B\u96C5\u8DA3\u53E4\u7434\u97F3\u8272\u5408\u6210"]),
          row(["\u5B57\u4F53", "loli.net \u955C\u50CF", "Ma Shan Zheng / ZCOOL XiaoWei / Noto Serif SC / Cinzel / Cormorant Garamond"]),
          row(["\u61D2\u52A0\u8F7D", "loading=lazy + Intersection Observer", "\u5168\u7AD9\u56FE\u7247\u5EF6\u8FDF\u52A0\u8F7D"]),
          row(["CDN", "jsdelivr + loli.net", "Three.js + Google Fonts \u56FD\u5185\u52A0\u901F"]),
          row(["\u6258\u7BA1", "GitHub Pages + Netlify CDN", "\u53CC\u7EBF\u90E8\u7F72\uFF0CNetlify CDN\u542B\u9999\u6E2F\u8282\u70B9"]),
        ]
      }),

      // ========== 五、首页六大板块 ==========
      heading("\u4E94\u3001\u9996\u9875\u516D\u5927\u677F\u5757\u7ED3\u6784", HeadingLevel.HEADING_1),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [800, 1400, 2200, 2000, 2920],
        rows: [
          row(["\u5E8F\u53F7", "\u677F\u5757\u540D", "\u8DF3\u8F6C\u9875\u9762", "Canvas", "\u5185\u5BB9"], { header: true }),
          row(["\u58F9", "\u5668\u4E4B\u7075", "vessels-cover.html", "vessels-canvas", "\u9752\u94DC\u793C\u5668 / \u7389\u77F3\u793C\u5668 / \u91D1\u94F6\u5668\u76D4 / \u9676\u74F7\u7CBE\u54C1"]),
          row(["\u8D30", "\u77F3\u4E4B\u97F5", "stone-cover.html", "stone-canvas", "\u5927\u8DB3 / \u4E91\u5188 / \u9F99\u95E8 / \u9EA6\u79EF\u5C71 / \u6566\u714C / \u4E50\u5C71"]),
          row(["\u53C1", "\u53F2\u4E4B\u75D5", "history-cover.html", "history-canvas", "\u9B4D\u664B\u4E66\u6CD5 / \u5510\u5B8B\u7ED8\u753B / \u660E\u6E05\u975E\u9057 / \u8FD1\u73B0\u4EE3\u4F20\u627F"]),
          row(["\u8086", "\u6587\u7269\u4FEE\u590D", "restoration-cover.html", "restoration-canvas", "\u6570\u5B57\u5B6A\u751F / AI\u8272\u5F69\u8FD8\u539F / VR\u6C89\u6D78 / \u533A\u5757\u94FE\u5B58\u8BC1"]),
          row(["\u4F0D", "\u63A8\u5E7F", "promotion-cover.html", "promotion-canvas", "\u6587\u521B\u4EA7\u54C1 / NFT / \u4E3B\u9898\u5C55\u89C8 / \u7814\u5B66\u6559\u80B2 / \u4E91\u5C55\u89C8 / \u56FD\u9645\u4EA4\u6D41"]),
          row(["\u9646", "\u6307\u5C16\u535A\u7269\u9986", "museum-3d.html", "\u2014", "174\u4EF6\u6587\u7269 / 8\u5927\u7C7B\u522B / 19\u671D\u4EE3 / 4\u4E2A3D\u5355\u4EF6"]),
        ]
      }),

      // ========== 六、项目文件目录 ==========
      heading("\u516D\u3001\u9879\u76EE\u6587\u4EF6\u76EE\u5F55", HeadingLevel.HEADING_1),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [3500, 1500, 4320],
        rows: [
          row(["\u6587\u4EF6\u540D", "\u5927\u5C0F", "\u8BF4\u660E"], { header: true }),
          row(["index.html", "105KB", "\u9996\u9875 - \u516D\u5927\u677F\u5757 + Hero\u7A7F\u8D8A"]),
          row(["heritage-unified.html", "32KB", "\u6587\u660E\u957F\u5377 - \u4E09\u97F5\u5408\u4E00"]),
          row(["vessels-cover.html", "37KB", "\u5668\u4E4B\u7075\u5C01\u9762"]),
          row(["vessels-detail.html", "27KB", "\u5668\u4E4B\u7075\u8BE6\u60C5"]),
          row(["stone-cover.html", "40KB", "\u77F3\u4E4B\u97F5\u5C01\u9762"]),
          row(["stone-detail.html", "30KB", "\u77F3\u4E4B\u97F5\u8BE6\u60C5"]),
          row(["history-cover.html", "37KB", "\u53F2\u4E4B\u75D5\u5C01\u9762"]),
          row(["history-detail.html", "27KB", "\u53F2\u4E4B\u75D5\u8BE6\u60C5"]),
          row(["restoration-cover.html", "41KB", "\u6587\u7269\u4FEE\u590D\u5C01\u9762"]),
          row(["restoration-detail.html", "14KB", "\u4FEE\u590D\u6280\u672F\u8BE6\u60C5"]),
          row(["shanhe-pangui.html", "38KB", "\u5C71\u6CB3\u76FC\u5F52\u4E13\u9898"]),
          row(["shanhe-detail.html", "42KB", "\u5C71\u6CB3\u76FC\u5F52\u5355\u4EF6\u8BE6\u60C5+\u62FC\u56FE"]),
          row(["promotion-cover.html", "50KB", "\u63A8\u5E7F\u5C01\u9762"]),
          row(["promotion-detail.html", "29KB", "\u63A8\u5E7F\u8BE6\u60C5"]),
          row(["museum-3d.html", "111KB", "\u6307\u5C16\u535A\u7269\u99863D\u9274\u8D4F"]),
          row(["museum-index.html", "8KB", "\u6307\u5C16\u535A\u7269\u9986\u5165\u53E3"]),
          row(["museum-huniu.html", "21KB", "3D: \u864E\u599E\u6DF3\u4E8E"]),
          row(["museum-jiagu.html", "21KB", "3D: \u51FB\u9F13\u8BF4\u5531\u4FD1"]),
          row(["museum-niao.html", "21KB", "3D: \u9752\u94DC\u9E1F"]),
          row(["sanyangzun-3d.html", "20KB", "3D: \u4E09\u7F8A\u5C0A"]),
          row(["song-painting.html", "154KB", "\u5B8B\u753B\u96C5\u8DA3\u4E34\u6FBE\u5C0F\u6E38\u620F"]),
          row(["pattern-atlas.html", "26KB", "\u7EB9\u9970\u56FE\u9274AR\u9274\u8BC6"]),
          row(["dazu-rock-carvings.html", "43KB", "\u5927\u8DB3\u77F3\u523B\u4E13\u9898"]),
          row(["images/ \u76EE\u5F55", "18.2MB", "157\u5F20\u56FE\u7247"]),
          row(["frames/ \u76EE\u5F55", "\u2014", "\u5E27\u5E8F\u5217\u56FE\u7247"]),
        ]
      }),

      // ========== 七、部署信息 ==========
      heading("\u4E03\u3001\u90E8\u7F72\u4FE1\u606F", HeadingLevel.HEADING_1),
      para("Netlify CDN\uFF08\u4E3B\u529B\uFF09", { bold: true }),
      para("https://chinecrelics.netlify.app"),
      bullet("\u5168\u7403CDN\u52A0\u901F\uFF08\u542B\u9999\u6E2F\u8282\u70B9\uFF09\uFF0C\u56FD\u5185\u8BBF\u95EE\u66F4\u5FEB"),
      bullet("\u65E0\u9700\u767B\u5F55\uFF0CNetlify Drop \u90E8\u7F72"),
      bullet("\u7AD9\u70B9\u5DF2\u8BBE\u4E3A\u516C\u5F00\uFF0C\u4EFB\u4F55\u4EBA\u53EF\u8BBF\u95EE"),
      para("GitHub Pages\uFF08\u5907\u7528\uFF09", { bold: true }),
      para("https://justxylia.github.io/zhonghua-wenwu-museum/"),
      bullet("\u6C38\u4E45\u7A33\u5B9A\u5907\u4EFD\uFF0C\u6BCF\u6B21git push\u81EA\u52A8\u66F4\u65B0"),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\a0712\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a1e8f1a871f68dd8b293711\\\u7F51\u7AD9\u67B6\u6784\u6846\u67B6.docx", buffer);
  console.log("DOCX generated successfully");
});
