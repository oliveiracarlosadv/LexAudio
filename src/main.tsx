import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

registerSW({ immediate: true });

// Em hospedagens sem cabeçalhos COOP/COEP (ex.: GitHub Pages), o service worker
// os injeta. Na primeira visita é preciso recarregar uma vez para ativá-los.
if ('serviceWorker' in navigator && !window.crossOriginIsolated) {
  const reloadOnce = () => {
    try {
      if (sessionStorage.getItem('lex-coi-reload')) return;
      sessionStorage.setItem('lex-coi-reload', '1');
    } catch {
      return;
    }
    window.location.reload();
  };
  if (navigator.serviceWorker.controller) reloadOnce();
  else navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true });
} else {
  try {
    sessionStorage.removeItem('lex-coi-reload');
  } catch {
    /* ignore */
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
