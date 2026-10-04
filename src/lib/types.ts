export interface Segment {
  /** início em milissegundos */
  start: number;
  /** fim em milissegundos */
  end: number;
  text: string;
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
}

export interface TranscribeOptions {
  language: string;
  translate: boolean;
  threads: number;
}
