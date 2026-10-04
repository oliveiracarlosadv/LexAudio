import type { Segment, TranscribeOptions } from '../types';
import { readModel } from './models';

type WorkerEvent =
  | { type: 'ready' }
  | { type: 'fatal'; message: string }
  | { type: 'loaded'; multilingual: boolean }
  | { type: 'load-error'; message: string }
  | { type: 'segment'; start: number; end: number; text: string }
  | { type: 'progress'; value: number }
  | { type: 'done'; code: number; canceled: boolean; language: string }
  | { type: 'error'; message: string }
  | { type: 'log'; text: string };

export interface TranscribeHandlers {
  onSegment?: (s: Segment) => void;
  onProgress?: (p: number) => void;
}

export interface TranscribeResult {
  segments: Segment[];
  language: string;
  canceled: boolean;
}

export class CanceledError extends Error {
  constructor() {
    super('Transcrição cancelada');
  }
}

/**
 * Fachada do motor Whisper.cpp. Toda a inferência acontece num Web Worker
 * (public/whisper/whisper-worker.js) para manter a interface fluida.
 */
class WhisperEngine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private loadedModel: string | null = null;
  private listener: ((e: WorkerEvent) => void) | null = null;

  get modelId() {
    return this.loadedModel;
  }

  static isSupported(): { ok: boolean; reason?: string } {
    if (typeof WebAssembly === 'undefined') return { ok: false, reason: 'Este navegador não suporta WebAssembly.' };
    if (!window.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
      return {
        ok: false,
        reason: 'O isolamento cross-origin não está ativo. Recarregue a página; se persistir, verifique os cabeçalhos COOP/COEP do servidor.',
      };
    }
    return { ok: true };
  }

  private boot(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      const worker = new Worker(`${import.meta.env.BASE_URL}whisper/whisper-worker.js`, { name: 'lex-whisper' });
      this.worker = worker;
      worker.onmessage = (e: MessageEvent<WorkerEvent>) => {
        const msg = e.data;
        if (msg.type === 'ready') return resolve();
        if (msg.type === 'fatal') {
          reject(new Error(msg.message));
          this.listener?.({ type: 'error', message: msg.message });
          this.reset();
          return;
        }
        if (msg.type === 'log') {
          if (import.meta.env.DEV) console.debug('[whisper]', msg.text);
          return;
        }
        this.listener?.(msg);
      };
      worker.onerror = (e) => {
        const message = e.message || 'Falha ao iniciar o worker do Whisper.';
        reject(new Error(message));
        this.listener?.({ type: 'error', message });
        this.reset();
      };
    });
    return this.ready;
  }

  private reset() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.loadedModel = null;
  }

  private request<T>(message: unknown, transfer: Transferable[], handle: (e: WorkerEvent, resolve: (v: T) => void, reject: (e: Error) => void) => void) {
    return new Promise<T>((resolve, reject) => {
      this.listener = (e) =>
        handle(
          e,
          (v) => {
            this.listener = null;
            resolve(v);
          },
          (err) => {
            this.listener = null;
            reject(err);
          },
        );
      this.worker!.postMessage(message, transfer);
    });
  }

  async ensureModel(modelId: string): Promise<void> {
    await this.boot();
    if (this.loadedModel === modelId) return;
    const buffer = await readModel(modelId);
    if (!buffer) throw new Error('Modelo não instalado. Baixe-o na aba "Modelos".');
    await this.request<void>({ type: 'load', model: buffer }, [buffer], (e, ok, fail) => {
      if (e.type === 'loaded') ok();
      else if (e.type === 'load-error' || e.type === 'error') fail(new Error(e.message));
    });
    this.loadedModel = modelId;
  }

  async transcribe(audio: Float32Array, opts: TranscribeOptions, handlers: TranscribeHandlers = {}): Promise<TranscribeResult> {
    if (!this.loadedModel) throw new Error('Nenhum modelo carregado.');
    const segments: Segment[] = [];
    const result = await this.request<TranscribeResult>(
      { type: 'transcribe', audio, language: opts.language, threads: opts.threads, translate: opts.translate },
      [audio.buffer as ArrayBuffer],
      (e, ok, fail) => {
        switch (e.type) {
          case 'segment': {
            const seg = { start: e.start, end: e.end, text: e.text };
            segments.push(seg);
            handlers.onSegment?.(seg);
            break;
          }
          case 'progress':
            handlers.onProgress?.(e.value);
            break;
          case 'done':
            if (e.code !== 0 && !e.canceled) fail(new Error(`O Whisper retornou erro (código ${e.code}).`));
            else ok({ segments, language: e.language, canceled: e.canceled });
            break;
          case 'error':
            fail(new Error(e.message));
            break;
        }
      },
    );
    if (result.canceled) throw new CanceledError();
    return result;
  }

  cancel() {
    this.worker?.postMessage({ type: 'cancel' });
  }
}

export const engine = new WhisperEngine();
export const engineSupport = () => WhisperEngine.isSupported();

export const defaultThreads = () => Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1));
