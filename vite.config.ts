import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Cabeçalhos de isolamento cross-origin: necessários para SharedArrayBuffer,
// que o Whisper.cpp (WASM com pthreads) usa para processar em múltiplos núcleos.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  // Para GitHub Pages: VITE_BASE=/nome-do-repositorio/
  base: process.env.VITE_BASE ?? '/',
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0') },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icons/*.png'],
      injectManifest: {
        // ffmpeg-core.wasm (~31 MB) e o motor Whisper precisam ficar no cache offline
        maximumFileSizeToCacheInBytes: 64 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,png,svg,wasm,woff2}'],
      },
      manifest: {
        name: 'Lex Audio',
        short_name: 'Lex Audio',
        description: 'Transforme áudio em texto. Totalmente offline.',
        lang: 'pt-BR',
        theme_color: '#0a0f11',
        background_color: '#0a0f11',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        categories: ['productivity', 'utilities'],
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        file_handlers: [
          {
            action: '.',
            accept: { 'audio/*': ['.ogg', '.opus', '.mp3', '.wav', '.m4a'] },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  worker: {
    format: 'es',
  },
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
});
