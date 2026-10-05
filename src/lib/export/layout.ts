import type { Transcript } from '../types';
import { formatDate, formatDateTimeLocal, formatDuration, formatTimestamp, languageName } from '../utils';
import { getModel } from '../whisper/models';

/**
 * Padrão visual dos documentos exportados (DOCX e PDF):
 * Arial 12, entrelinhas 1,5, 3 pt antes e depois de cada parágrafo,
 * margens ABNT (3 cm superior/esquerda, 2 cm inferior/direita).
 */
export const DOC_STYLE = {
  font: 'Arial',
  sizePt: 12,
  lineSpacing: 1.5,
  spaceBeforePt: 3,
  spaceAfterPt: 3,
  marginsCm: { top: 3, left: 3, bottom: 2, right: 2 },
} as const;

const NA = 'Não informado';

export interface DocModel {
  title: string;
  /** cabeçalho dos interlocutores: [rótulo, remetente, destinatário] */
  parties: { columns: [string, string, string]; rows: [string, string, string][] };
  info: [string, string][];
  segments: { time: string; text: string }[];
  footer: string;
}

export function buildDocModel(t: Transcript): DocModel {
  const m = t.meta ?? {};
  const v = (s?: string) => s?.trim() || NA;
  return {
    title: 'TRANSCRIÇÃO DE ÁUDIO',
    parties: {
      columns: ['Interlocutores', 'Remetente (quem enviou)', 'Destinatário (quem recebeu)'],
      rows: [
        ['Nome', v(m.senderName), v(m.recipientName)],
        ['Telefone', v(m.senderPhone), v(m.recipientPhone)],
        ['Data e hora', m.sentAt ? `Envio: ${formatDateTimeLocal(m.sentAt)}` : `Envio: ${NA}`, m.receivedAt ? `Recebimento: ${formatDateTimeLocal(m.receivedAt)}` : `Recebimento: ${NA}`],
      ],
    },
    info: [
      ['Arquivo de áudio', t.fileName],
      ['Duração', formatDuration(t.durationSec)],
      ['Idioma', languageName(t.language)],
      ['Modelo de IA', getModel(t.modelId)?.name ?? t.modelId],
      ['Transcrito em', formatDate(t.createdAt)],
    ],
    segments: t.segments
      .filter((s) => s.text.trim())
      .map((s) => ({ time: `[${formatTimestamp(s.start, '.').slice(0, 8)}]`, text: s.text.trim() })),
    footer: 'Transcrição gerada localmente pelo Lex Audio (Whisper), sem envio de dados a servidores.',
  };
}
