export interface Segment {
  /** início em milissegundos */
  start: number;
  /** fim em milissegundos */
  end: number;
  text: string;
}

/** Dados opcionais sobre a origem do áudio (ex.: mensagem de WhatsApp). */
export interface AudioMeta {
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  /** data/hora no formato do <input type="datetime-local">: AAAA-MM-DDTHH:mm */
  sentAt?: string;
  receivedAt?: string;
}

export interface Transcript {
  id: string;
  fileName: string;
  fileSize: number;
  durationSec: number;
  language: string;
  modelId: string;
  segments: Segment[];
  createdAt: number;
  processingMs: number;
  meta?: AudioMeta;
}

export type JobStatus = 'queued' | 'decoding' | 'transcribing' | 'done' | 'error' | 'canceled';

export interface Job {
  id: string;
  file: File;
  status: JobStatus;
  /** 0–100 */
  progress: number;
  segments: Segment[];
  language?: string;
  durationSec?: number;
  error?: string;
  transcript?: Transcript;
  meta?: AudioMeta;
}

export interface TranscribeOptions {
  language: string;
  translate: boolean;
  threads: number;
}
