import JSZip from 'jszip';
import type { Transcript } from '../types';
import { baseName, downloadBlob, formatDate, formatDuration, formatTimestamp, languageName, segmentsToText } from '../utils';

export type ExportFormat = 'txt' | 'srt' | 'docx';

export function toTxt(t: Transcript, withTimestamps = false): string {
  if (!withTimestamps) return segmentsToText(t.segments) + '\n';
  return t.segments.map((s) => `[${formatTimestamp(s.start, '.').slice(0, 8)}] ${s.text.trim()}`).join('\n') + '\n';
}

export function toSrt(t: Transcript): string {
  return t.segments
    .filter((s) => s.text.trim())
    .map((s, i) => `${i + 1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${s.text.trim()}\n`)
    .join('\n');
}

export async function toDocx(t: Transcript): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } = await import('docx');
  const meta = (label: string, value: string) =>
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, color: '555555', size: 18 }),
        new TextRun({ text: value, color: '555555', size: 18 }),
      ],
    });

  const doc = new Document({
    creator: 'Lex Audio',
    title: `Transcrição — ${t.fileName}`,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Transcrição de áudio' })] }),
          meta('Arquivo', t.fileName),
          meta('Duração', formatDuration(t.durationSec)),
          meta('Idioma', languageName(t.language)),
          meta('Gerado em', formatDate(t.createdAt)),
          new Paragraph({
            spacing: { after: 240 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '10B981', space: 8 } },
            children: [new TextRun({ text: 'Processado localmente pelo Lex Audio — nenhum dado foi enviado a servidores.', italics: true, color: '888888', size: 16 })],
          }),
          ...t.segments
            .filter((s) => s.text.trim())
            .map(
              (s) =>
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: `[${formatTimestamp(s.start, '.').slice(0, 8)}]  `, color: '10B981', size: 18, font: 'Consolas' }),
                    new TextRun({ text: s.text.trim() }),
                  ],
                }),
            ),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}

export async function buildExport(t: Transcript, format: ExportFormat): Promise<{ blob: Blob; name: string }> {
  const name = `${baseName(t.fileName)}.${format}`;
  switch (format) {
    case 'txt':
      return { blob: new Blob([toTxt(t)], { type: 'text/plain;charset=utf-8' }), name };
    case 'srt':
      return { blob: new Blob([toSrt(t)], { type: 'application/x-subrip;charset=utf-8' }), name };
    case 'docx':
      return { blob: await toDocx(t), name };
  }
}

export async function exportTranscript(t: Transcript, format: ExportFormat) {
  const { blob, name } = await buildExport(t, format);
  downloadBlob(blob, name);
}

/** Exportação em lote: um .zip com um arquivo por transcrição. */
export async function exportMany(list: Transcript[], format: ExportFormat) {
  if (list.length === 1) return exportTranscript(list[0], format);
  const zip = new JSZip();
  const used = new Set<string>();
  for (const t of list) {
    const { blob, name } = await buildExport(t, format);
    let unique = name;
    for (let i = 2; used.has(unique); i++) unique = name.replace(/(\.\w+)$/, ` (${i})$1`);
    used.add(unique);
    zip.file(unique, blob);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(await zip.generateAsync({ type: 'blob' }), `lex-audio-${format}-${stamp}.zip`);
}
