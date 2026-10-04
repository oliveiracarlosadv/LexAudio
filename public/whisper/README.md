# Motor Whisper (WebAssembly)

Esta pasta recebe os arquivos gerados por `npm run build:whisper`:

- `lex-whisper.js` — runtime Emscripten + ponte (`wasm/lex_whisper.cpp`)
- `lex-whisper.wasm` — Whisper.cpp compilado com SIMD e pthreads

`whisper-worker.js` é escrito à mão e já faz parte do repositório.
