import type { Transcript } from '../types';
import { buildDocModel, DOC_STYLE as S } from './layout';

const pt = (n: number) => Math.round(n * 20); // pontos → twips
const cm = (n: number) => Math.round((n / 2.54) * 1440); // centímetros → twips

export async function toDocx(t: Transcript): Promise<Blob> {
  const d = await import('docx');
  const { AlignmentType, BorderStyle, Document, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType, LineRuleType } = d;
  const model = buildDocModel(t);

  const p = (runs: InstanceType<typeof TextRun>[], align?: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    new Paragraph({ children: runs, alignment: align });
  const run = (text: string, bold = false) => new TextRun({ text, bold });

  const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text: string, opts: { bold?: boolean; header?: boolean; width: number }) =>
    new TableCell({
      borders,
      width: { size: opts.width, type: WidthType.PERCENTAGE },
      shading: opts.header ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8F5EF' } : undefined,
      margins: { left: 100, right: 100 },
      children: [p([run(text, opts.bold || opts.header)])],
    });
  const widths = [22, 39, 39];

  const partiesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: model.parties.columns.map((c, i) => cell(c, { header: true, width: widths[i] })) }),
      ...model.parties.rows.map(
        (r) => new TableRow({ children: r.map((c, i) => cell(c, { bold: i === 0, width: widths[i] })) }),
      ),
    ],
  });

  const doc = new Document({
    creator: 'Lex Audio',
    title: `Transcrição — ${t.fileName}`,
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
            margin: { top: cm(S.marginsCm.top), left: cm(S.marginsCm.left), bottom: cm(S.marginsCm.bottom), right: cm(S.marginsCm.right) },
          },
        },
        children: [
          p([run(model.title, true)], AlignmentType.CENTER),
          partiesTable,
          ...model.info.map(([label, value]) => p([run(`${label}: `, true), run(value)])),
          p([run('CONTEÚDO TRANSCRITO', true)]),
          ...model.segments.map((s) => p([run(`${s.time} `, true), run(s.text)], AlignmentType.JUSTIFIED)),
          p([new TextRun({ text: model.footer, italics: true })]),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}
