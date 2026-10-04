# Arquitetura do Lex Audio

## Visão geral

```
┌──────────────────────────── Thread da interface (React) ────────────────────────────┐
│ DropZone → useTranscriptionQueue ──► decodeToPcm16k() ──► engine.transcribe()        │
│                │                         │ FFmpeg.wasm (worker próprio)    │          │
│                ▼                         ▼                                 ▼          │
│        TranscriptViewer ◄── segmentos ao vivo ◄──────────── postMessage ◄──┐         │
│        IndexedDB (histórico)     Cache Storage (modelos)                    │         │
└─────────────────────────────────────────────────────────────────────────────┼─────────┘
                                                                              │
┌──────────────── public/whisper/whisper-worker.js (Web Worker) ──────────────┴─────────┐
│ lex-whisper.js (Emscripten) → lex_whisper.cpp → whisper_full() numa std::thread       │
│   └─ pool de pthreads (Web Workers) para os núcleos da CPU · SharedArrayBuffer        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Fluxo de uma transcrição

1. **Entrada** — arquivos chegam pela DropZone, pelo seletor ou, no PWA instalado, por "Abrir com" (`launchQueue`).
2. **Fila** — `useTranscriptionQueue` processa um arquivo por vez (o Whisper já ocupa todos os núcleos). Cada job tem
   status `queued → decoding → transcribing → done | error | canceled`.
3. **Decodificação** — `lib/audio/decode.ts` usa FFmpeg.wasm para converter qualquer formato em PCM float32,
   mono, 16 kHz (`-ac 1 -ar 16000 -f f32le`). Se falhar, tenta `decodeAudioData` + `OfflineAudioContext`.
4. **Modelo** — `engine.ensureModel()` lê o `.bin` do Cache Storage e o transfere (zero-copy) ao worker, que o grava no
   MEMFS e chama `loadModel`. O modelo carregado é reaproveitado entre arquivos.
5. **Inferência** — `transcribe()` copia o áudio para a memória WASM e dispara `whisper_full` numa thread nativa, deixando
   a thread do runtime livre. Callbacks do Whisper emitem eventos em stdout (`@@LEX{json}`): `segment`, `progress`, `done`
   (com o idioma detectado por `whisper_full_lang_id`). O cancelamento usa o `abort_callback`.
6. **Resultado** — segmentos aparecem ao vivo; ao final, a transcrição é salva no IndexedDB e fica disponível para exportação.

## Por que estas escolhas

| Decisão | Motivo |
| --- | --- |
| Whisper.cpp em vez de ONNX/Transformers.js | Modelos GGML quantizados (q5) são menores, o runtime é enxuto e o mesmo motor roda nativo no futuro app desktop. |
| Ponte C++ própria | O exemplo oficial imprime texto solto; a ponte entrega segmentos com tempo, progresso, idioma e cancelamento estruturados. |
| Worker separado do bundle (em `public/`) | O runtime Emscripten usa `importScripts` e cria pthreads a partir da URL do script; fica mais previsível fora do bundler. |
| Cache Storage para modelos | Suporta arquivos de centenas de MB com `navigator.storage.persist()`, sem passar pelo limite de objetos do IndexedDB. |
| Service worker injetando COOP/COEP | Threads exigem `crossOriginIsolated`; isso permite hospedar em GitHub Pages sem configurar o servidor. |
| Sem roteador | Quatro abas com estado em memória: a fila continua rodando ao trocar de aba e não há problema de rotas offline. |

## Requisitos de execução

- Navegador com WebAssembly SIMD, threads e `SharedArrayBuffer` (Chrome/Edge 92+, Firefox 90+, Safari 16.4+).
- Memória: ~300 MB (Tiny) a ~2 GB (Large v3 Turbo). O WASM de 32 bits limita o uso a 4 GB.

## Pontos de extensão

- **Novos motores**: `lib/whisper/engine.ts` isola o protocolo; um motor nativo (Electron) ou WebGPU pode implementar a
  mesma interface (`ensureModel`, `transcribe`, `cancel`).
- **Diarização (quem falou)**, **edição do texto** e **player sincronizado** são as próximas evoluções naturais da interface.
