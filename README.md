<p align="center">
  <img src="public/icons/pwa-192.png" width="96" alt="Lex Audio" />
</p>

<h1 align="center">Lex Audio</h1>
<p align="center"><strong>Transforme áudio em texto. Totalmente offline.</strong></p>

Ferramenta profissional de transcrição de áudio com IA local. O reconhecimento de fala roda no próprio
computador do usuário (Whisper.cpp compilado para WebAssembly): nenhum áudio ou texto é enviado a servidores.

## Funcionalidades

- Upload por botão ou arrastar e soltar, com fila de **transcrição em lote**
- Áudios do **WhatsApp, Telegram, Signal** e gravadores: OGG, OPUS, MP3, WAV, M4A (e AAC, FLAC, WEBM, AMR)
- **Detecção automática de idioma** (ou escolha manual) e tradução opcional para inglês
- Texto aparecendo **ao vivo** durante a transcrição, com busca nos trechos
- Exportação em **TXT, DOCX e SRT**, individual ou em lote (.zip)
- **Histórico local** (IndexedDB), com busca por nome e conteúdo
- Tema **claro e escuro**
- **PWA instalável**, funcionando 100% offline depois de instalado
- Gerenciador de modelos (Tiny → Large v3 Turbo), com importação manual de `.bin` para máquinas sem internet

## Stack

| Camada | Tecnologia |
| --- | --- |
| Interface | React 18, TypeScript, Vite 5, Tailwind CSS 3, lucide-react |
| Motor de IA | Whisper.cpp → WebAssembly (SIMD + pthreads), ponte própria em `wasm/lex_whisper.cpp` |
| Áudio | FFmpeg.wasm (conversão para PCM 16 kHz mono), com fallback para Web Audio |
| Persistência | IndexedDB (`idb`) para histórico, Cache Storage para modelos |
| Exportação | `docx`, `jszip` |
| Offline / PWA | `vite-plugin-pwa` + Workbox (service worker próprio em `src/sw.ts`) |

Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Estrutura

```
lex-audio/
├── .github/workflows/deploy.yml   # build + deploy no GitHub Pages
├── docs/
│   ├── ARCHITECTURE.md
│   └── ELECTRON.md                # estratégia do app desktop
├── electron/main.cjs              # esqueleto do app Electron
├── public/
│   ├── icons/                     # favicon, ícones PWA e marca (ramo de oliveira)
│   ├── ffmpeg/                    # núcleo FFmpeg.wasm (copiado no npm install)
│   └── whisper/
│       ├── whisper-worker.js      # Web Worker do motor
│       └── lex-whisper.{js,wasm}  # gerados por `npm run build:whisper`
├── scripts/
│   ├── build-whisper-wasm.sh
│   └── copy-ffmpeg-core.mjs
├── src/
│   ├── components/                # Nav, DropZone, TranscriptViewer, ExportMenu, ui
│   ├── hooks/                     # useTranscriptionQueue, useModels, useSettings, useTheme
│   ├── lib/
│   │   ├── audio/decode.ts        # FFmpeg.wasm → Float32Array 16 kHz
│   │   ├── whisper/engine.ts      # fachada do worker do Whisper
│   │   ├── whisper/models.ts      # catálogo, download e cache dos modelos
│   │   ├── export/index.ts        # TXT, SRT, DOCX, ZIP
│   │   └── storage/history.ts     # IndexedDB
│   ├── pages/                     # Transcrever, Histórico, Modelos, Sobre
│   ├── App.tsx  main.tsx  sw.ts  index.css
└── wasm/
    ├── CMakeLists.txt
    └── lex_whisper.cpp            # ponte C++ ↔ JS (embind)
```

## Instalação (desenvolvimento)

Pré-requisitos: **Node.js 20+** e, para compilar o motor, o **Emscripten SDK**.

```bash
npm install
```

O `postinstall` copia o FFmpeg.wasm para `public/ffmpeg/`. Em seguida, compile o motor Whisper (uma vez):

```bash
git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
~/emsdk/emsdk install latest && ~/emsdk/emsdk activate latest
source ~/emsdk/emsdk_env.sh
npm run build:whisper
```

Isso clona o Whisper.cpp (tag configurável por `WHISPER_REF`), compila com SIMD e threads e grava
`public/whisper/lex-whisper.js` e `lex-whisper.wasm`. Se preferir que quem clona o repositório não precise do
Emscripten, versione esses dois arquivos (remova as linhas comentadas no `.gitignore`).

```bash
npm run dev
```

Abra http://localhost:5173, vá em **Modelos**, baixe o **Base** (57 MB) e arraste um áudio.

## Build de produção

```bash
npm run build
npm run preview
```

O resultado fica em `dist/`. O servidor precisa enviar os cabeçalhos abaixo (o `vite preview` já envia);
onde não for possível configurá-los, o service worker do app os injeta automaticamente após o primeiro carregamento:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### GitHub Pages

O workflow `.github/workflows/deploy.yml` compila o motor, faz o build com `VITE_BASE=/<repositório>/` e publica.
No GitHub: **Settings → Pages → Source: GitHub Actions**. Depois, cada push na `main` atualiza o site.

## Privacidade

- O processamento acontece em um Web Worker local; não existe backend.
- A única requisição de rede é o download do modelo (Hugging Face), feita uma vez e sem envio de dados do usuário.
  Em ambientes isolados, importe o `.bin` manualmente.
- O histórico guarda só o texto e metadados; o áudio nunca é armazenado.

## Desktop (Electron)

Veja [docs/ELECTRON.md](docs/ELECTRON.md).

## Licenças de terceiros

Whisper.cpp e os modelos Whisper são MIT. O núcleo padrão do FFmpeg.wasm (`@ffmpeg/core`) inclui componentes GPL;
para distribuição comercial fechada, avalie compilar um núcleo LGPL só com os decodificadores de áudio necessários.

---

Criado por **Carlos Alexandre Albuquerque Oliveira** · [Lattes](https://lattes.cnpq.br/4151018791454248) · [ORCID](https://orcid.org/0000-0003-0680-4424)
