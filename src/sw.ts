/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { addPlugins, cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };

/**
 * Injeta COOP/COEP em todas as respostas da própria origem. Isso habilita o
 * SharedArrayBuffer (threads do Whisper.cpp) mesmo em hospedagens estáticas
 * que não permitem configurar cabeçalhos, como o GitHub Pages.
 */
function withIsolationHeaders(response: Response): Response {
  if (!response || response.status === 0 || response.type === 'opaque') return response;
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const isolationPlugin = {
  handlerWillRespond: async ({ response }: { response: Response }) => withIsolationHeaders(response),
};

self.addEventListener('install', () => void self.skipWaiting());
clientsClaim();

addPlugins([isolationPlugin]);
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA: qualquer navegação responde com o index.html em cache (funciona offline)
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// Demais arquivos da própria origem que não estejam no precache
registerRoute(
  // /__lex/ é o canal do inicializador desktop e nunca pode vir do cache
  ({ url, request }) => url.origin === self.location.origin && request.method === 'GET' && !url.pathname.includes('/__lex/'),
  new CacheFirst({ cacheName: 'lex-runtime', plugins: [isolationPlugin] }),
);
