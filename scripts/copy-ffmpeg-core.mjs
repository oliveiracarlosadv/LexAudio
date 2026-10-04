// Copia o núcleo do FFmpeg.wasm para public/ffmpeg, para que ele seja servido
// pela própria aplicação (e entre no cache offline do PWA) em vez de vir de uma CDN.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const dest = join(root, 'public', 'ffmpeg');

if (!existsSync(src)) {
  console.warn('[lex-audio] @ffmpeg/core não encontrado; pulei a cópia do núcleo do FFmpeg.');
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  cpSync(join(src, file), join(dest, file));
}
console.log('[lex-audio] Núcleo do FFmpeg.wasm copiado para public/ffmpeg/');
