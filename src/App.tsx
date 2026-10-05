import { useCallback, useEffect, useMemo, useState } from 'react';
import { MobileHeader, MobileTabs, Sidebar, type Tab } from './components/Nav';
import { useModels } from './hooks/useModels';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useTranscriptionQueue } from './hooks/useTranscriptionQueue';
import { clearHistory, deleteTranscript, listTranscripts, saveTranscript } from './lib/storage/history';
import type { AudioMeta, Transcript } from './lib/types';
import { isSupportedAudio } from './lib/utils';
import { engineSupport } from './lib/whisper/engine';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelsPage } from './pages/ModelsPage';
import { TranscribePage } from './pages/TranscribePage';

export default function App() {
  const { theme, toggle } = useTheme();
  const { settings, update } = useSettings();
  const models = useModels();
  const [tab, setTab] = useState<Tab>('transcribe');
  const [history, setHistory] = useState<Transcript[]>([]);
  const support = useMemo(() => engineSupport(), []);

  useEffect(() => {
    void listTranscripts().then(setHistory);
  }, []);

  const onSaved = useCallback((t: Transcript) => setHistory((h) => [t, ...h]), []);
  const onUpdated = useCallback((t: Transcript) => setHistory((h) => h.map((x) => (x.id === t.id ? t : x))), []);
  const queue = useTranscriptionQueue(settings, onSaved, onUpdated);

  // Arquivos abertos pelo sistema operacional ("Abrir com… Lex Audio") quando instalado como PWA
  useEffect(() => {
    window.launchQueue?.setConsumer(async ({ files }) => {
      const list = (await Promise.all(files.map((h) => h.getFile()))).filter(isSupportedAudio);
      if (list.length) {
        setTab('transcribe');
        queue.addFiles(list);
      }
    });
  }, []);

  const onDelete = async (id: string) => {
    await deleteTranscript(id);
    setHistory((h) => h.filter((t) => t.id !== id));
  };
  const onUpdateMeta = async (id: string, meta: AudioMeta) => {
    const t = history.find((x) => x.id === id);
    if (!t) return;
    const updated = { ...t, meta };
    await saveTranscript(updated);
    onUpdated(updated);
  };
  const onClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <div className="flex h-full">
      <Sidebar tab={tab} onTab={setTab} theme={theme} onToggleTheme={toggle} historyCount={history.length} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader theme={theme} onToggleTheme={toggle} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-8 md:pb-10 md:pt-10">
          {tab === 'transcribe' && (
            <TranscribePage
              queue={queue}
              settings={settings}
              updateSettings={update}
              installedModels={models.installed}
              support={support}
              onGoToModels={() => setTab('models')}
            />
          )}
          {tab === 'history' && <HistoryPage items={history} onDelete={onDelete} onClear={onClear} onUpdateMeta={onUpdateMeta} />}
          {tab === 'models' && <ModelsPage models={models} settings={settings} updateSettings={update} />}
          {tab === 'about' && <AboutPage />}
        </main>
      </div>
      <MobileTabs tab={tab} onTab={setTab} />
    </div>
  );
}
