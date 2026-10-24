import type { Profile } from '../profile';
import type { Transcript } from '../types';
import { buildDocModel, DOC_STYLE as S, type DocTable } from './layout';

/**
 * Relatório em PDF com o mesmo layout do DOCX. Usa a Helvetica embutida no PDF,
 * que tem as mesmas métricas da Arial (a Arial é da Microsoft e não pode ser embutida).
 */
export async function toPdf(t: Transcript, profile: Profile): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const model = buildDocModel(t, profile);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const CM = 72 / 2.54;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = { top: S.marginsCm.top * CM, left: S.marginsCm.left * CM, bottom: S.marginsCm.bottom * CM, right: S.marginsCm.right * CM };
  const W = pageW - M.left - M.right;
  // "1,5 linha" no Word = 1,5 × altura de linha simples da Arial (≈ 1,15 × corpo)
  const LH1 = S.sizePt * 1.15;
  const LH = LH1 * S.lineSpacing;
  const font = 'helvetica';
  let y = M.top;

  doc.setFont(font, 'normal');
  doc.setFontSize(S.sizePt);
  doc.setProperties({ title: model.fileTitle, creator: 'Lex Audio', author: profile.name || profile.office || 'Lex Audio' });

  const ensure = (h: number) => {
    if (y + h > pageH - M.bottom) {
      doc.addPage();
      y = M.top;
    }
  };

  /** parágrafo com prefixo opcional em negrito, quebra de linha e espaço antes/depois */
  const paragraph = (
    text: string,
    opts: { bold?: boolean; prefix?: string; align?: 'left' | 'center' | 'justify'; italic?: boolean; size?: number; gray?: boolean } = {},
  ) => {
    const size = opts.size ?? S.sizePt;
    const lh = size * 1.15 * S.lineSpacing;
    doc.setFontSize(size);
    doc.setTextColor(opts.gray ? 90 : 0);
    y += S.spaceBeforePt;
    const style = opts.italic ? 'italic' : opts.bold ? 'bold' : 'normal';
    let prefixW = 0;
    if (opts.prefix) {
      doc.setFont(font, 'bold');
      // folga de 2 pt: a justificação do jsPDF pode passar levemente da margem
      prefixW = doc.getTextWidth(opts.prefix + ' ') + 2;
    }
    doc.setFont(font, style);
    const first = (doc.splitTextToSize(text, W - prefixW - 2)[0] as string | undefined) ?? '';
    const rest = text.slice(first.length).trim();
    const lines: string[] = [first, ...(rest ? (doc.splitTextToSize(rest, W) as string[]) : [])];
    lines.forEach((line, i) => {
      ensure(lh);
      const ty = y + (lh - size) / 2;
      if (i === 0 && opts.prefix) {
        doc.setFont(font, 'bold');
        doc.text(opts.prefix, M.left, ty, { baseline: 'top' });
        doc.setFont(font, style);
      }
      const x = opts.align === 'center' ? pageW / 2 : M.left + (i === 0 ? prefixW : 0);
      const last = i === lines.length - 1;
      if (opts.align === 'justify' && !last) {
        doc.text(line, x, ty, { baseline: 'top', align: 'justify', maxWidth: W - (i === 0 ? prefixW + 2 : 0) });
      } else {
        doc.text(line, x, ty, { baseline: 'top', align: opts.align === 'center' ? 'center' : 'left' });
      }
      y += lh;
    });
    y += S.spaceAfterPt;
    doc.setFontSize(S.sizePt);
    doc.setTextColor(0);
  };

  /** título de seção: faixa verde-clara com texto em verde-escuro */
  const heading = (text: string) => {
    y += S.spaceBeforePt * 3;
    ensure(LH * 3); // não deixa o título sozinho no fim da página
    doc.setFillColor(...S.shade);
    doc.rect(M.left, y, W, LH1 + 8, 'F');
    doc.setFillColor(...S.accent);
    doc.rect(M.left, y, 3, LH1 + 8, 'F');
    doc.setFont(font, 'bold');
    doc.setTextColor(...S.accent);
    doc.text(text, M.left + 10, y + 4 + (LH1 - S.sizePt) / 2, { baseline: 'top' });
    doc.setTextColor(0);
    y += LH1 + 8 + S.spaceAfterPt * 2;
  };

  /** tabela com bordas; a 1ª coluna é sempre em negrito */
  const table = (tb: DocTable) => {
    const widths = tb.widths.map((f) => f * W);
    const pad = 5;
    const rows = [...(tb.header ? [{ cells: tb.header, header: true }] : []), ...tb.rows.map((cells) => ({ cells, header: false }))];
    for (const row of rows) {
      const wrapped = row.cells.map((c, i) => {
        doc.setFont(font, row.header || i === 0 ? 'bold' : 'normal');
        return doc.splitTextToSize(c, widths[i] - pad * 2) as string[];
      });
      const h = Math.max(...wrapped.map((l) => l.length)) * LH1 + pad * 2;
      ensure(h);
      let x = M.left;
      wrapped.forEach((lines, i) => {
        if (row.header || (!tb.header && i === 0)) {
          doc.setFillColor(...S.shade);
          doc.rect(x, y, widths[i], h, 'F');
        }
        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.rect(x, y, widths[i], h);
        doc.setFont(font, row.header || i === 0 ? 'bold' : 'normal');
        lines.forEach((line, j) => doc.text(line, x + pad, y + pad + j * LH1 + (LH1 - S.sizePt) / 2, { baseline: 'top' }));
        x += widths[i];
      });
      y += h;
    }
    y += S.spaceAfterPt;
  };

  // ---------- corpo ----------
  paragraph(model.title, { bold: true, align: 'center', size: 14 });
  paragraph(model.reference, { align: 'center', size: 10, gray: true });

  for (const b of model.blocks) {
    if (b.type === 'heading') heading(b.text);
    else if (b.type === 'table') table(b.table);
    else if (b.type === 'paragraph') paragraph(b.text, { italic: b.italic, align: 'justify' });
    else for (const s of b.items) paragraph(s.text, { prefix: s.time, align: 'justify' });
  }

  if (model.signature) {
    const sig = model.signature;
    y += LH;
    ensure(LH * 2 + 40 + sig.lines.length * LH1 + 10); // mantém o bloco inteiro na mesma página
    paragraph(sig.place, { align: 'center' });
    y += 40;
    doc.setDrawColor(0);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - 110, y, pageW / 2 + 110, y);
    y += 4;
    sig.lines.forEach((line, i) => {
      doc.setFont(font, i === 0 ? 'bold' : 'normal');
      doc.text(line, pageW / 2, y, { baseline: 'top', align: 'center' });
      y += LH1;
    });
  }

  // ---------- cabeçalho e rodapé em todas as páginas ----------
  const pages = doc.getNumberOfPages();
  const lh = model.letterhead;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    if (lh) {
      const top = 1 * CM;
      const ruleY = M.top - 0.45 * CM;
      const maxH = ruleY - top - 6;
      let textX = M.left;
      if (lh.logo) {
        const scale = Math.min(maxH / lh.logo.height, (4.5 * CM) / lh.logo.width);
        const w = lh.logo.width * scale;
        const h = lh.logo.height * scale;
        doc.addImage(lh.logo.dataUrl, 'PNG', M.left, top + (maxH - h) / 2, w, h, 'logo', 'FAST');
        textX = M.left + w + 12;
      }
      const textW = pageW - M.right - textX;
      const blockH = 13 + lh.lines.length * 11;
      let ty = top + Math.max(0, (maxH - blockH) / 2);
      doc.setFont(font, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text((doc.splitTextToSize(lh.title, textW) as string[])[0] ?? '', textX, ty, { baseline: 'top' });
      ty += 13;
      doc.setFont(font, 'normal');
      doc.setFontSize(S.smallPt);
      doc.setTextColor(90);
      for (const line of lh.lines) {
        doc.text((doc.splitTextToSize(line, textW) as string[])[0] ?? '', textX, ty, { baseline: 'top' });
        ty += 11;
      }
      doc.setDrawColor(...S.accent);
      doc.setLineWidth(0.8);
      doc.line(M.left, ruleY, pageW - M.right, ruleY);
    }

    const fy = pageH - M.bottom + 14;
    doc.setDrawColor(190);
    doc.setLineWidth(0.4);
    doc.line(M.left, fy, pageW - M.right, fy);
    doc.setFont(font, 'normal');
    doc.setFontSize(S.smallPt);
    doc.setTextColor(110);
    doc.text(model.footer, M.left, fy + 5, { baseline: 'top' });
    doc.text(`Página ${i} de ${pages}`, pageW - M.right, fy + 5, { baseline: 'top', align: 'right' });
  }
  return doc.output('blob');
}
