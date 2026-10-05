import type { AudioMeta } from './types';

export const uid = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${units[i]}`;
}

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec)) return '--:--';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return h ? `${h}:${mm}:${String(r).padStart(2, '0')}` : `${mm}:${String(r).padStart(2, '0')}`;
}

/** 00:01:02,345 (SRT) ou 00:01:02.345 */
export function formatTimestamp(ms: number, sep: ',' | '.' = ','): string {
  const t = Math.max(0, Math.round(ms));
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  const s = Math.floor((t % 60_000) / 1000);
  const r = t % 1000;
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(r, 3)}`;
}

/** [01:02] — rótulo curto para a interface */
export function formatClock(ms: number): string {
  return formatDuration(ms / 1000);
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(ts);
}

/** "2026-10-04T14:30" → "04/10/2026 14:30" */
export function formatDateTimeLocal(value?: string): string {
  if (!value) return '';
  const [date, time = ''] = value.split('T');
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}${time ? ` ${time.slice(0, 5)}` : ''}`;
}

/** Formata telefones brasileiros; outros formatos (ex.: com +) ficam como digitados. */
export function formatPhone(value: string): string {
  const v = value.trim();
  if (v.startsWith('+')) return v;
  const digits = v.replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return v;
}

/** Linhas "Rótulo: valor" só com os campos preenchidos. */
export function metaLines(meta?: AudioMeta): [string, string][] {
  if (!meta) return [];
  const person = (name?: string, phone?: string) => [name?.trim(), phone?.trim()].filter(Boolean).join(' · ');
  const lines: [string, string][] = [
    ['Remetente', person(meta.senderName, meta.senderPhone)],
    ['Destinatário', person(meta.recipientName, meta.recipientPhone)],
    ['Data de envio', formatDateTimeLocal(meta.sentAt)],
    ['Data de recebimento', formatDateTimeLocal(meta.receivedAt)],
  ];
  return lines.filter(([, v]) => v);
}

export function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

export function segmentsToText(segments: { text: string }[]): string {
  return segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.!?;:])/g, '$1');
}

export const LANGUAGES: Record<string, string> = {
  auto: 'Detecção automática',
  pt: 'Português',
  en: 'Inglês',
  es: 'Espanhol',
  fr: 'Francês',
  it: 'Italiano',
  de: 'Alemão',
  ja: 'Japonês',
  zh: 'Chinês',
  ru: 'Russo',
  ar: 'Árabe',
  nl: 'Holandês',
  ko: 'Coreano',
  hi: 'Hindi',
};

export const languageName = (code?: string) => (code ? LANGUAGES[code] ?? code.toUpperCase() : '—');

export const SUPPORTED_EXTENSIONS = ['ogg', 'opus', 'oga', 'mp3', 'wav', 'm4a', 'aac', 'mp4', 'webm', 'flac', 'amr'];

export function isSupportedAudio(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return SUPPORTED_EXTENSIONS.includes(ext) || file.type.startsWith('audio/');
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
