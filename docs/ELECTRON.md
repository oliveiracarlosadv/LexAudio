# Estratégia: Lex Audio Desktop (Electron)

## Objetivo

Distribuir o Lex Audio como aplicativo instalável (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`), mantendo a
mesma base React e ganhando desempenho com o Whisper.cpp **nativo**.

## Fase 1 — Empacotar o build web (esqueleto pronto em `electron/main.cjs`)

- Servir `dist/` por um protocolo privilegiado (`lex://`) com COOP/COEP → `crossOriginIsolated` sem servidor HTTP.
- Bloquear toda a rede, exceto o download de modelos (Hugging Face), via `session.webRequest`.
- `contextIsolation`, `sandbox` e links externos abertos no navegador do sistema.

```bash
npm i -D electron electron-builder
npm run build
npx electron electron/main.cjs
```

Configuração sugerida do `electron-builder` (em `package.json`):

```json
"main": "electron/main.cjs",
"build": {
  "appId": "br.adv.caao.lexaudio",
  "productName": "Lex Audio",
  "files": ["dist/**", "electron/**"],
  "directories": { "output": "electron/out" },
  "mac": { "target": "dmg", "category": "public.app-category.productivity" },
  "win": { "target": "nsis" },
  "linux": { "target": "AppImage" }
}
```

## Fase 2 — Motor nativo (ganho de 3–10× na velocidade)

- Compilar o Whisper.cpp nativo por plataforma (Metal no macOS, CUDA/Vulkan no Windows/Linux, CPU com AVX2 como base).
- Expor via **processo utilitário** (`utilityProcess.fork`) usando o binário `whisper-cli`/`whisper-server`, ou via addon
  N-API (`node-addon-api`), para não bloquear o processo principal.
- `preload.cjs` com `contextBridge` expondo uma API mínima: `transcribe(filePath, opts)`, `onSegment`, `cancel`, `models.*`.
- No renderer, `engine.ts` escolhe o motor: `window.lexNative ? NativeEngine : WasmEngine` — a interface não muda.
- Decodificação com FFmpeg nativo (binário embarcado) em vez do FFmpeg.wasm.

## Fase 3 — Integração com o sistema

- Associação de arquivos `.ogg/.opus/.m4a/.mp3/.wav` e "Abrir com Lex Audio".
- Modelos em `app.getPath('userData')/models`, compartilhados entre versões.
- Atualização automática (`electron-updater`) com GitHub Releases; assinatura de código (Apple Developer ID / certificado
  Authenticode) e notarização no macOS.
- CI com matriz `macos-latest`, `windows-latest`, `ubuntu-latest` gerando os instaladores a cada tag `v*`.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Tamanho do instalador | Não embarcar modelos; baixar no primeiro uso ou oferecer pacote "offline completo" separado. |
| GPU indisponível | Fallback automático para CPU (e para o motor WASM, que já existe). |
| Licença do FFmpeg | Usar build LGPL só com decodificadores de áudio. |
