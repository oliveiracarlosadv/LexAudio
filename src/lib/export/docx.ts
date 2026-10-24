import { dataUrlToBytes, type Profile } from '../profile';
import type { Transcript } from '../types';
import { buildDocModel, DOC_STYLE as S, type DocTable } from './layout';

const pt = (n: number) => Math.round(n * 20); // pontos → twips
const cm = (n: number) => Math.round((n / 2.54) * 1440); // centímetros → twips
const cmPx = (n: number) => (n / 2.54) * 96; // centímetros → pixels (96 dpi)

export async function toDocx(t: Transcript, profile: Profile): Promise<Blob> {
  const d = await import('docx');
  const {
    AlignmentType, BorderStyle, Document, Footer, Header, ImageRun, Packer, PageNumber, Paragraph, ShadingType,
    Table, TableCell, TableRow, TabStopType, TextRun, WidthType, LineRuleType, VerticalAlign,
  } = d;
  type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
  const model = buildDocModel(t, profile);
  const contentW = cm(21 - S.marginsCm.left - S.marginsCm.right);
  const single = { line: 240, lineRule: LineRuleType.AUTO, before: 0, after: 0 };

  const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
    new TextRun({ text, bold: o.bold, italics: o.italics, size: o.size ? o.size * 2 : undefined, color: o.color });
  const p = (children: (InstanceType<typeof TextRun> | InstanceType<typeof ImageRun>)[], align?: Align) =>
    new Paragraph({ children, alignment: align });

  const line = { style: BorderStyle.SINGLE, size: 4, color: '969696' };
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const table = (tb: DocTable) => {
    const cell = (text: string, opts: { bold: boolean; shade: boolean; width: number }) =>
      new TableCell({
        borders: { top: line, bottom: line, left: line, right: line },
        width: { size: Math.round(opts.width * 100), type: WidthType.PERCENTAGE },
        shading: opts.shade ? { type: ShadingType.CLEAR, color: 'auto', fill: S.shadeHex } : undefined,
        margins: { left: 100, right: 100, top: 60, bottom: 60 },
        children: [new Paragraph({ spacing: single, children: [run(text, { bold: opts.bold })] })],
      });
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        ...(tb.header
          ? [new TableRow({ tableHeader: true, children: tb.header.map((c, i) => cell(c, { bold: true, shade: true, width: tb.widths[i] })) })]
          : []),
        ...tb.rows.map(
          (r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, { bold: i === 0, shade: !tb.header && i === 0, width: tb.widths[i] })) }),
        ),
      ],
    });
  };

  const heading = (text: string) =>
    new Paragraph({
      keepNext: true,
      spacing: { before: pt(12), after: pt(6), line: 240, lineRule: LineRuleType.AUTO },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: S.shadeHex },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: S.accentHex, space: 6 } },
      children: [run(text, { bold: true, color: S.accentHex })],
    });

  // ---------- corpo ----------
  const body: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    p([run(model.title, { bold: true, size: 14 })], AlignmentType.CENTER),
    p([run(model.reference, { size: 10, color: '5A5A5A' })], AlignmentType.CENTER),
  ];
  for (const b of model.blocks) {
    if (b.type === 'heading') body.push(heading(b.text));
    else if (b.type === 'table') body.push(table(b.table));
    else if (b.type === 'paragraph') body.push(p([run(b.text, { italics: b.italic })], AlignmentType.JUSTIFIED));
    else for (const s of b.items) body.push(p([run(`${s.time} `, { bold: true }), run(s.text)], AlignmentType.JUSTIFIED));
  }
  if (model.signature) {
    const sig = model.signature;
    body.push(
      new Paragraph({ keepNext: true, keepLines: true, alignment: AlignmentType.CENTER, spacing: { before: pt(24), after: pt(40) }, children: [run(sig.place)] }),
      new Paragraph({
        keepNext: true,
        alignment: AlignmentType.CENTER,
        spacing: single,
        children: [run('_____________________________________________')],
      }),
      ...sig.lines.map(
        (l, i) =>
          new Paragraph({ keepNext: i < sig.lines.length - 1, alignment: AlignmentType.CENTER, spacing: single, children: [run(l, { bold: i === 0 })] }),
      ),
    );
  }

  // ---------- cabeçalho (logo + escritório) ----------
  let header: InstanceType<typeof Header> | undefined;
  const lh = model.letterhead;
  if (lh) {
    const text = [
      new Paragraph({ spacing: single, children: [run(lh.title, { bold: true, size: 11, color: '141414' })] }),
      ...lh.lines.map((l) => new Paragraph({ spacing: single, children: [run(l, { size: S.smallPt, color: '5A5A5A' })] })),
    ];
    const noBorders = { top: none, bottom: none, left: none, right: none };
    const rule = new Paragraph({
      spacing: { before: pt(4), after: 0, line: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: S.accentHex, space: 1 } },
      children: [],
    });
    if (lh.logo) {
      const scale = Math.min(cmPx(1.4) / lh.logo.height, cmPx(4.5) / lh.logo.width);
      const logoW = Math.round(lh.logo.width * scale);
      const logoH = Math.round(lh.logo.height * scale);
      const logoCol = Math.round((logoW / 96) * 1440) + 200;
      header = new Header({
        children: [
          new Table({
            width: { size: contentW, type: WidthType.DXA },
            columnWidths: [logoCol, contentW - logoCol],
            borders: { ...noBorders, insideHorizontal: none, insideVertical: none },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    width: { size: logoCol, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        spacing: single,
                        children: [new ImageRun({ type: 'png', data: dataUrlToBytes(lh.logo.dataUrl), transformation: { width: logoW, height: logoH } })],
                      }),
                    ],
                  }),
                  new TableCell({ borders: noBorders, width: { size: contentW - logoCol, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: text }),
                ],
              }),
            ],
          }),
          rule,
        ],
      });
    } else {
      header = new Header({ children: [...text, rule] });
    }
  }

  // ---------- rodapé ----------
  const footer = new Footer({
    children: [
      new Paragraph({
        spacing: single,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'BEBEBE', space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: contentW }],
        children: [
          new TextRun({ text: model.footer, size: S.smallPt * 2, color: '6E6E6E' }),
          new TextRun({ children: ['\tPágina ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], size: S.smallPt * 2, color: '6E6E6E' }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: profile.name || profile.office || 'Lex Audio',
    title: model.fileTitle,
    styles: {
      default: {
        document: {
          run: { font: S.font, size: S.sizePt * 2 },
          paragraph: {
            spacing: {
              before: pt(S.spaceBeforePt),
              after: pt(S.spaceAfterPt),
              line: Math.round(240 * S.lineSpacing),
              lineRule: LineRuleType.AUTO,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: cm(S.marginsCm.top),
              left: cm(S.marginsCm.left),
              bottom: cm(S.marginsCm.bottom),
              right: cm(S.marginsCm.right),
              header: cm(1),
              footer: cm(0.8),
            },
          },
        },
        headers: header ? { default: header } : undefined,
        footers: { default: footer },
        children: body,
      },
    ],
  });
  return Packer.toBlob(doc);
}
