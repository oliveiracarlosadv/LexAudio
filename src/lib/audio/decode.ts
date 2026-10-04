import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export const SAMPLE_RATE = 16_000;

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

/** Carrega o FFmpeg.wasm a partir dos arquivos locais em /ffmpeg (nada de CDN). */
function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return Promise.resolve(ffmpeg);
  if (loading) return loading;
  loading = (async () => {
    const instance = new FFmpeg();
    const base = new URL(`${import.meta.env.BASE_URL}ffmpeg/`, window.location.href).href;
    await instance.load({
      coreURL: `${base}ffmpeg-core.js`,
      wasmURL: `${base}ffmpeg-core.wasm`,
    });
    ffmpeg = instance;
    return instance;
  })();
  loading.catch(() => (loading = null));
  return loading;
}

/**
 * Converte qualquer áudio suportado (OGG/OPUS do WhatsApp, MP3, M4A, WAV...)
 * para PCM float32, mono, 16 kHz — o formato que o Whisper espera.
 */
export async function decodeToPcm16k(file: File, onProgress?: (p: number) => void): Promise<Float32Array> {
  try {
    return await decodeWithFFmpeg(file, onProgress);
  } catch (err) {
    console.warn('[lex-audio] FFmpeg falhou, tentando decodificador nativo do navegador', err);
    return decodeWithWebAudio(file);
  }
}

async function decodeWithFFmpeg(file: File, onProgress?: (p: number) => void): Promise<Float32Array> {
  const ff = await getFFmpeg();
  const id = Math.random().toString(36).slice(2);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const input = `in-${id}.${ext}`;
  const output = `out-${id}.f32`;

  const handler = ({ progress }: { progress: number }) => onProgress?.(Math.max(0, Math.min(1, progress)));
  ff.on('progress', handler);
  try {
    await ff.writeFile(input, await fetchFile(file));
    const code = await ff.exec(['-i', input, '-vn', '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 'f32le', '-acodec', 'pcm_f32le', output]);
    if (code !== 0) throw new Error(`FFmpeg terminou com código ${code}`);
    const data = (await ff.readFile(output)) as Uint8Array;
    if (!data.byteLength) throw new Error('Áudio vazio após a conversão');
    return new Float32Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  } finally {
    ff.off('progress', handler);
    await ff.deleteFile(input).catch(() => {});
    await ff.deleteFile(output).catch(() => {});
  }
}

async function decodeWithWebAudio(file: File): Promise<Float32Array> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await file.arrayBuffer());
    const frames = Math.ceil(decoded.duration * SAMPLE_RATE);
    const offline = new OfflineAudioContext(1, frames, SAMPLE_RATE);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0).slice();
  } catch {
    throw new Error('Formato de áudio não reconhecido ou arquivo corrompido.');
  } finally {
    void ctx.close();
  }
}
