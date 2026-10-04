/**
 * Catálogo de modelos Whisper (formato GGML do Whisper.cpp, quantizados).
 *
 * O modelo é baixado UMA vez e guardado no Cache Storage do navegador.
 * A partir daí, toda transcrição acontece offline. Para máquinas sem internet,
 * o arquivo .bin pode ser importado manualmente.
 */
export interface WhisperModel {
  id: string;
  name: string;
  label: string;
  sizeMB: number;
  /** memória aproximada necessária durante a transcrição */
  ramMB: number;
  description: string;
  recommended?: boolean;
}

const HF_BASE = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';

export const MODELS: WhisperModel[] = [
  {
    id: 'tiny-q5_1',
    name: 'Tiny',
    label: 'Ultrarrápido',
    sizeMB: 31,
    ramMB: 300,
    description: 'Ideal para áudios curtos e máquinas modestas. Precisão básica.',
  },
  {
    id: 'base-q5_1',
    name: 'Base',
    label: 'Equilibrado',
    sizeMB: 57,
    ramMB: 400,
    description: 'Bom equilíbrio entre velocidade e qualidade para o dia a dia.',
    recommended: true,
  },
  {
    id: 'small-q5_1',
    name: 'Small',
    label: 'Preciso',
    sizeMB: 181,
    ramMB: 850,
    description: 'Excelente para português, nomes próprios e termos técnicos.',
  },
  {
    id: 'medium-q5_0',
    name: 'Medium',
    label: 'Profissional',
    sizeMB: 514,
    ramMB: 1800,
    description: 'Alta precisão para gravações longas e áudios com ruído. Mais lento.',
  },
  {
    id: 'large-v3-turbo-q5_0',
    name: 'Large v3 Turbo',
    label: 'Máxima precisão',
    sizeMB: 547,
    ramMB: 2000,
    description: 'O mais preciso. Recomendado para computadores com 8 GB+ de RAM.',
  },
];

export const DEFAULT_MODEL_ID = 'base-q5_1';

const CACHE_NAME = 'lex-audio-models-v1';
const cacheKey = (id: string) => new URL(`/__lex_models__/${id}.bin`, window.location.origin).href;

export const modelUrl = (id: string) => `${HF_BASE}/ggml-${id}.bin`;
export const getModel = (id: string) => MODELS.find((m) => m.id === id);

export async function listInstalledModels(): Promise<string[]> {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  return keys.map((r) => r.url.match(/__lex_models__\/(.+)\.bin$/)?.[1]).filter((x): x is string => !!x);
}

export async function readModel(id: string): Promise<ArrayBuffer | null> {
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match(cacheKey(id));
  return res ? res.arrayBuffer() : null;
}

export async function deleteModel(id: string): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.delete(cacheKey(id));
}

async function storeModel(id: string, data: Blob) {
  // Pede armazenamento persistente para o navegador não apagar o modelo
  await navigator.storage?.persist?.().catch(() => false);
  const cache = await caches.open(CACHE_NAME);
  await cache.put(cacheKey(id), new Response(data, { headers: { 'Content-Type': 'application/octet-stream' } }));
}

/**
 * Baixa o modelo (única operação de rede do app — nenhum áudio ou texto sai do computador).
 */
export async function downloadModel(
  id: string,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const model = getModel(id);
  const res = await fetch(modelUrl(id), { signal, mode: 'cors' });
  if (!res.ok || !res.body) throw new Error(`Falha no download do modelo (HTTP ${res.status}).`);
  const total = Number(res.headers.get('Content-Length')) || (model ? model.sizeMB * 1024 * 1024 : 0);
  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress(loaded, total);
  }
  await storeModel(id, new Blob(chunks));
}

/** Importa um arquivo ggml-*.bin já baixado (uso em máquinas sem internet). */
export async function importModelFile(file: File): Promise<string> {
  const match = file.name.match(/ggml-(.+)\.bin$/i);
  const id = match?.[1] ?? file.name.replace(/\.bin$/i, '');
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  // Arquivos GGML do Whisper começam com o "magic" 0x67676d6c ("ggml" little-endian = "lmgg")
  const magic = String.fromCharCode(...head);
  if (magic !== 'lmgg' && magic !== 'ggml') {
    throw new Error('Este arquivo não parece ser um modelo GGML do Whisper.cpp.');
  }
  await storeModel(id, file);
  return id;
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  const est = await navigator.storage?.estimate?.();
  return est ? { usage: est.usage ?? 0, quota: est.quota ?? 0 } : null;
}
