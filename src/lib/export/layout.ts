import { hasProfile, type Profile, type ProfileLogo } from '../profile';
import type { Transcript } from '../types';
import { formatBytes, formatDate, formatDateTimeLocal, formatDuration, formatTimestamp, languageName } from '../utils';
import { getModel } from '../whisper/models';

/**
 * Padrão visual dos relatórios exportados (DOCX e PDF):
 * Arial 12, entrelinhas 1,5, 3 pt antes e depois de cada parágrafo,
 * margens ABNT (3 cm superior/esquerda, 2 cm inferior/direita).
 * Tabelas usam entrelinhas simples para ficarem compactas.
 */
export const DOC_STYLE = {
  font: 'Arial',
  sizePt: 12,
  smallPt: 9,
  lineSpacing: 1.5,
  spaceBeforePt: 3,
  spaceAfterPt: 3,
  marginsCm: { top: 3, left: 3, bottom: 2, right: 2 },
  /** verde escuro da identidade visual (títulos de seção e filete do cabeçalho) */
  accent: [4, 120, 87] as [number, number, number],
  accentHex: '047857',
  /** fundo dos títulos de seção e do cabeçalho das tabelas */
  shade: [232, 245, 239] as [number, number, number],
  shadeHex: 'E8F5EF',
} as const;

const NA = 'Não informado';

export interface DocTable {
  header?: string[];
  rows: string[][];
  /** larguras relativas das colunas (somam 1) */
  widths: number[];
}

export type DocBlock =
  | { type: 'heading'; text: string }
  | { type: 'table'; table: DocTable }
  | { type: 'paragraph'; text: string; italic?: boolean }
  | { type: 'segments'; items: { time: string; text: string }[] };

export interface DocModel {
  /** cabeçalho de todas as páginas (logo e dados do escritório) */
  letterhead?: { logo?: ProfileLogo; title: string; lines: string[] };
  title: string;
  /** "Relatório nº ... · emitido em ..." */
  reference: string;
  blocks: DocBlock[];
  signature?: { place: string; lines: string[] };
  /** texto do rodapé, à esquerda do número da página */
  footer: string;
  fileTitle: string;
}

export const reportNumber = (t: Transcript) => `LA-${t.id.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`;

/** hash em grupos de 8 caracteres, para quebrar linha de forma legível */
const groupHash = (h: string) => h.match(/.{1,8}/g)?.join(' ') ?? h;

const longDate = (d: Date) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d);

function letterhead(p: Profile): DocModel['letterhead'] {
  if (!p.letterhead || !hasProfile(p)) return undefined;
  const office = p.office.trim();
  const name = p.name.trim();
  const contact = [p.email.trim(), p.phone.trim()].filter(Boolean).join(' · ');
  const lines = office
    ? [p.cnpj.trim() && `CNPJ ${p.cnpj.trim()}`, contact]
    : [[p.profession.trim(), p.registry.trim()].filter(Boolean).join(' · '), contact];
  return { logo: p.logo, title: office || name, lines: lines.filter(Boolean) as string[] };
}

function signature(p: Profile, now: Date): DocModel['signature'] {
  if (!p.signature || !p.name.trim()) return undefined;
  const city = p.city.trim();
  return {
    place: `${city ? `${city}, ` : ''}${longDate(now)}.`,
    lines: [
      p.name.trim(),
      [p.profession.trim(), p.registry.trim()].filter(Boolean).join(' — '),
      p.cpf.trim() && `CPF ${p.cpf.trim()}`,
    ].filter(Boolean) as string[],
  };
}

export function buildDocModel(t: Transcript, profile: Profile, now = new Date()): DocModel {
  const m = t.meta ?? {};
  const v = (s?: string) => s?.trim() || NA;
  const number = reportNumber(t);
  const ext = t.fileName.includes('.') ? t.fileName.split('.').pop()!.toUpperCase() : '—';
  const model = getModel(t.modelId)?.name ?? t.modelId;

  const fileRows: string[][] = [
    ['Arquivo', t.fileName],
    ['Formato', ext],
    ['Tamanho', t.fileSize ? formatBytes(t.fileSize) : '—'],
    ['Duração', formatDuration(t.durationSec)],
    ['Hash SHA-256', t.sha256 ? groupHash(t.sha256) : 'Não calculado (transcrição anterior à versão 1.3)'],
    ['Idioma', languageName(t.language)],
    ['Modelo de IA', `Whisper ${model}`],
    ['Transcrito em', formatDate(t.createdAt)],
  ];

  const segments = t.segments
    .filter((s) => s.text.trim())
    .map((s) => ({ time: `[${formatTimestamp(s.start, '.').slice(0, 8)}]`, text: s.text.trim() }));

  const notes = [
    `Transcrição automática realizada localmente pelo software Lex Audio, versão ${__APP_VERSION__}, com o modelo de inteligência artificial Whisper ${model}, sem envio do áudio ou do texto a servidores externos.`,
    'As marcações entre colchetes indicam o tempo decorrido no áudio (horas:minutos:segundos). O texto pode conter imprecisões, sobretudo em nomes próprios e trechos com ruído, e deve ser conferido com o áudio original.',
    t.sha256
      ? 'O código SHA-256 identifica o arquivo de áudio de forma única: qualquer alteração no arquivo produz um código diferente, o que permite confirmar que o áudio conferido é o mesmo que foi transcrito.'
      : '',
  ].filter(Boolean);

  return {
    letterhead: letterhead(profile),
    title: 'RELATÓRIO DE TRANSCRIÇÃO DE ÁUDIO',
    reference: `Relatório nº ${number} · emitido em ${formatDate(now.getTime())}`,
    blocks: [
      { type: 'heading', text: '1. IDENTIFICAÇÃO DO ARQUIVO' },
      { type: 'table', table: { rows: fileRows, widths: [0.3, 0.7] } },
      { type: 'heading', text: '2. INTERLOCUTORES' },
      {
        type: 'table',
        table: {
          header: ['', 'Remetente (quem enviou)', 'Destinatário (quem recebeu)'],
          rows: [
            ['Nome', v(m.senderName), v(m.recipientName)],
            ['Telefone', v(m.senderPhone), v(m.recipientPhone)],
            ['Data e hora', m.sentAt ? formatDateTimeLocal(m.sentAt) : NA, m.receivedAt ? formatDateTimeLocal(m.receivedAt) : NA],
          ],
          widths: [0.22, 0.39, 0.39],
        },
      },
      { type: 'heading', text: '3. CONTEÚDO TRANSCRITO' },
      segments.length
        ? { type: 'segments', items: segments }
        : { type: 'paragraph', text: 'Nenhuma fala foi identificada no áudio.', italic: true },
      { type: 'heading', text: '4. OBSERVAÇÕES' },
      ...notes.map((text) => ({ type: 'paragraph' as const, text })),
    ],
    signature: signature(profile, now),
    footer: `Lex Audio · Relatório nº ${number}`,
    fileTitle: `Relatório de transcrição — ${t.fileName}`,
  };
}

/** Transcrição fictícia para o botão "Ver exemplo em PDF" do Perfil. */
export function sampleTranscript(): Transcript {
  const lines = [
    'Bom dia, doutor. Estou enviando este áudio para explicar o que aconteceu ontem na empresa.',
    'Cheguei às oito horas, como sempre, e o gerente me chamou na sala dele.',
    'Ele disse que eu seria transferido para outra unidade, sem nenhum aviso prévio e sem explicar o motivo.',
    'Pedi que ele colocasse isso por escrito, mas ele se recusou. Fico no aguardo da sua orientação. Obrigado.',
  ];
  return {
    id: 'exemplo0-0000-0000-0000-000000000000',
    fileName: 'AUDIO-2026-10-23-WA0001.opus',
    fileSize: 184_320,
    durationSec: 42,
    language: 'pt',
    modelId: 'base-q5_1',
    segments: lines.map((text, i) => ({ start: i * 10_500, end: (i + 1) * 10_500, text })),
    createdAt: Date.now(),
    processingMs: 6000,
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    meta: {
      senderName: 'João da Silva (exemplo)',
      senderPhone: '(91) 98888-7777',
      recipientName: 'Escritório',
      sentAt: '2026-10-23T09:15',
      receivedAt: '2026-10-23T09:16',
    },
  };
}
