import JSZip from 'jszip';
import type { Transcript } from '../types';
import { baseName, downloadBlob, formatTimestamp, metaLines, segmentsToText } from '../utils';
import { toDocx } from './docx';
import { toPdf } from './pdf';

export { toDocx, toPdf };

export type ExportFormat = 'txt' | 'srt' | 'docx' | 'pdf';

export function toTxt(t: Transcript, withTimestamps = false): string {
  const header = metaLines(t.meta).map(([label, value]) => `${label}: ${value}`);
  const body = withTimestamps
    ? t.segments.map((s) => `[${formatTimestamp(s.start, '.').slice(0, 8)}] ${s.text.trim()}`).join('\n')
    : segmentsToText(t.segments);
  return (header.length ? `Arquivo: ${t.fileName}\n${header.join('\n')}\n\n` : '') + body + '\n';
}

export function toSrt(t: Transcript): string {
  return t.segments
    .filter((s) => s.text.trim())
    .map((s, i) => `${i + 1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${s.text.trim()}\n`)
    .join('\n');
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
    case 'pdf':
      return { blob: await toPdf(t), name };
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
