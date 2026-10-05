import type { Transcript } from '../types';
import { buildDocModel, DOC_STYLE as S } from './layout';

/**
 * PDF com o mesmo layout do DOCX. Usa a Helvetica embutida no PDF, que tem as
 * mesmas métricas da Arial (a Arial é da Microsoft e não pode ser embutida).
 */
export async function toPdf(t: Transcript): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const model = buildDocModel(t);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const CM = 72 / 2.54;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = { top: S.marginsCm.top * CM, left: S.marginsCm.left * CM, bottom: S.marginsCm.bottom * CM, right: S.marginsCm.right * CM };
  const W = pageW - M.left - M.right;
  // "1,5 linha" no Word = 1,5 × altura de linha simples da Arial (≈ 1,15 × corpo)
  const LH = S.sizePt * 1.15 * S.lineSpacing;
  const font = 'helvetica';
  let y = M.top;

  doc.setFont(font, 'normal');
  doc.setFontSize(S.sizePt);
  doc.setProperties({ title: `Transcrição — ${t.fileName}`, creator: 'Lex Audio' });

  const ensure = (h: number) => {
    if (y + h > pageH - M.bottom) {
      doc.addPage();
      y = M.top;
    }
  };

  /** parágrafo com prefixo opcional em negrito, quebra de linha e espaço antes/depois */
  const paragraph = (text: string, opts: { bold?: boolean; prefix?: string; align?: 'left' | 'center' | 'justify'; italic?: boolean } = {}) => {
    y += S.spaceBeforePt;
    const style = opts.italic ? 'italic' : opts.bold ? 'bold' : 'normal';
    let prefixW = 0;
    if (opts.prefix) {
      doc.setFont(font, 'bold');
      prefixW = doc.getTextWidth(opts.prefix + ' ');
    }
    doc.setFont(font, style);
    const first = doc.splitTextToSize(text, W - prefixW)[0] ?? '';
    const rest = text.slice(first.length).trim();
    const lines: string[] = [first, ...(rest ? doc.splitTextToSize(rest, W) : [])];
    lines.forEach((line, i) => {
      ensure(LH);
      const ty = y + (LH - S.sizePt) / 2;
      if (i === 0 && opts.prefix) {
        doc.setFont(font, 'bold');
        doc.text(opts.prefix, M.left, ty, { baseline: 'top' });
        doc.setFont(font, style);
      }
      const x = opts.align === 'center' ? pageW / 2 : M.left + (i === 0 ? prefixW : 0);
      const last = i === lines.length - 1;
      if (opts.align === 'justify' && !last) {
        doc.text(line, x, ty, { baseline: 'top', align: 'justify', maxWidth: W - (i === 0 ? prefixW : 0) });
      } else {
        doc.text(line, x, ty, { baseline: 'top', align: opts.align === 'center' ? 'center' : 'left' });
      }
      y += LH;
    });
    y += S.spaceAfterPt;
  };

  /** tabela dos interlocutores com bordas */
  const table = () => {
    const widths = [0.22, 0.39, 0.39].map((f) => f * W);
    const pad = 5;
    const rows: { cells: string[]; header?: boolean }[] = [
      { cells: model.parties.columns, header: true },
      ...model.parties.rows.map((r) => ({ cells: r })),
    ];
    y += S.spaceBeforePt;
    for (const row of rows) {
      const wrapped = row.cells.map((c, i) => {
        doc.setFont(font, row.header || i === 0 ? 'bold' : 'normal');
        return doc.splitTextToSize(c, widths[i] - pad * 2) as string[];
      });
      const h = Math.max(...wrapped.map((l) => l.length)) * LH;
      ensure(h);
      let x = M.left;
      wrapped.forEach((lines, i) => {
        if (row.header) {
          doc.setFillColor(232, 245, 239);
          doc.rect(x, y, widths[i], h, 'F');
        }
        doc.setDrawColor(128);
        doc.setLineWidth(0.5);
        doc.rect(x, y, widths[i], h);
        doc.setFont(font, row.header || i === 0 ? 'bold' : 'normal');
        lines.forEach((line, j) => doc.text(line, x + pad, y + j * LH + (LH - S.sizePt) / 2, { baseline: 'top' }));
        x += widths[i];
      });
      y += h;
    }
    y += S.spaceAfterPt;
  };

  paragraph(model.title, { bold: true, align: 'center' });
  table();
  for (const [label, value] of model.info) paragraph(value, { prefix: `${label}:` });
  paragraph('CONTEÚDO TRANSCRITO', { bold: true });
  for (const s of model.segments) paragraph(s.text, { prefix: s.time, align: 'justify' });
  paragraph(model.footer, { italic: true });

  // numeração de páginas no rodapé
  const pages = doc.getNumberOfPages();
  doc.setFont(font, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.text(`Página ${i} de ${pages}`, pageW - M.right, pageH - M.bottom / 2, { align: 'right' });
  }
  return doc.output('blob');
}
