// Lex Audio — esqueleto do aplicativo desktop (Electron).
// Serve o build web (dist/) por um protocolo próprio com os cabeçalhos
// COOP/COEP, habilitando as threads do Whisper.cpp sem servidor HTTP.
// Veja docs/ELECTRON.md para o plano completo de empacotamento.
const { app, BrowserWindow, net, protocol, session, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const DIST = path.join(__dirname, '..', 'dist');
const MODEL_HOSTS = ['huggingface.co', 'hf.co']; // inclui CDNs (*.hf.co) para onde os downloads redirecionam

protocol.registerSchemesAsPrivileged([
  { scheme: 'lex', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, allowServiceWorkers: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0f11',
    title: 'Lex Audio',
    icon: path.join(DIST, 'icons', 'pwa-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  void win.loadURL('lex://app/');
}

app.whenReady().then(() => {
  protocol.handle('lex', async (request) => {
    const { pathname } = new URL(request.url);
    let file = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
    if (!file.startsWith(DIST)) return new Response('Forbidden', { status: 403 });
    if (pathname === '/' || !path.extname(pathname)) file = path.join(DIST, 'index.html');

    const res = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(res.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    if (file.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
    return new Response(res.body, { status: res.status, headers });
  });

  // Privacidade: bloqueia qualquer acesso à rede, exceto o download de modelos.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = new URL(details.url);
    const allowed =
      url.protocol === 'lex:' ||
      url.protocol === 'blob:' ||
      url.protocol === 'data:' ||
      url.protocol === 'devtools:' ||
      (url.protocol === 'https:' && MODEL_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h)));
    callback({ cancel: !allowed });
  });

  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
