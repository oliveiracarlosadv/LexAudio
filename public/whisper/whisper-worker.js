/* Lex Audio — worker do motor Whisper.cpp (WebAssembly).
 *
 * Roda fora da thread da interface. Carrega lex-whisper.js (gerado por
 * `npm run build:whisper`), recebe o modelo e o áudio PCM 16 kHz e devolve
 * segmentos, progresso e o idioma detectado.
 *
 * Protocolo (interface → worker):
 *   { type: 'load', model: ArrayBuffer }
 *   { type: 'transcribe', audio: Float32Array, language: 'auto'|'pt'|..., threads: number, translate: boolean }
 *   { type: 'cancel' }
 * Protocolo (worker → interface):
 *   { type: 'ready' } | { type: 'fatal', message }
 *   { type: 'loaded', multilingual } | { type: 'load-error', message }
 *   { type: 'segment', start, end, text } | { type: 'progress', value }
 *   { type: 'done', code, canceled, language } | { type: 'error', message }
 *   { type: 'log', text }
 */
const BASE = self.location.href.replace(/[^/]*$/, '');
const ENGINE = BASE + 'lex-whisper.js';
const MODEL_PATH = '/model.bin';

// O Emscripten cria cada thread (pthread) abrindo de novo ESTE script, com o
// nome "em-pthread". Nesse caso, só carrega o motor e deixa o runtime cuidar
// das mensagens; o controle abaixo é exclusivo do worker principal.
if (self.name === 'em-pthread') {
  importScripts(ENGINE);
} else {
  startController();
}

function startController() {
  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));

  function onStdout(line) {
    if (typeof line === 'string' && line.startsWith('@@LEX')) {
      try {
        self.postMessage(JSON.parse(line.slice(5)));
      } catch (err) {
        self.postMessage({ type: 'log', text: 'Evento inválido do motor: ' + line });
      }
      return;
    }
    self.postMessage({ type: 'log', text: String(line) });
  }

  self.Module = {
    locateFile: (path) => BASE + path,
    print: onStdout,
    printErr: (text) => self.postMessage({ type: 'log', text: String(text) }),
    onRuntimeInitialized: () => resolveReady(),
    onAbort: (what) => self.postMessage({ type: 'fatal', message: 'O motor Whisper foi interrompido: ' + what }),
  };

  try {
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error(
        'SharedArrayBuffer indisponível. A página precisa estar em isolamento cross-origin (COOP/COEP).',
      );
    }
    importScripts(ENGINE);
    ready.then(() => self.postMessage({ type: 'ready' }));
  } catch (err) {
    self.postMessage({
      type: 'fatal',
      message:
        err && err.message && err.message.includes('SharedArrayBuffer')
          ? err.message
          : 'Motor Whisper não encontrado em /whisper/lex-whisper.js. Rode "npm run build:whisper" (veja o README).',
    });
  }

  self.onmessage = async (event) => {
    const msg = event.data;
    await ready;
    const M = self.Module;
    try {
      switch (msg.type) {
        case 'load': {
          try {
            M.FS.unlink(MODEL_PATH);
          } catch (_) {
            /* ainda não existia */
          }
          M.FS.writeFile(MODEL_PATH, new Uint8Array(msg.model));
          const rc = M.loadModel(MODEL_PATH);
          M.FS.unlink(MODEL_PATH); // o modelo já está na memória do WASM
          if (rc === 0) self.postMessage({ type: 'loaded', multilingual: M.isMultilingual() });
          else self.postMessage({ type: 'load-error', message: 'Não foi possível carregar o modelo (código ' + rc + ').' });
          break;
        }
        case 'transcribe': {
          const rc = M.transcribe(msg.audio, msg.language || 'auto', msg.threads || 4, !!msg.translate);
          if (rc !== 0) {
            const reason = rc === 1 ? 'nenhum modelo carregado' : 'já existe uma transcrição em andamento';
            self.postMessage({ type: 'error', message: 'Falha ao iniciar a transcrição: ' + reason + '.' });
          }
          break;
        }
        case 'cancel':
          M.cancel();
          break;
      }
    } catch (err) {
      self.postMessage({ type: 'error', message: String((err && err.message) || err) });
    }
  };
}
