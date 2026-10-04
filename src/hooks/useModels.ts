import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteModel, downloadModel, importModelFile, listInstalledModels, storageEstimate } from '../lib/whisper/models';

export interface DownloadState {
  loaded: number;
  total: number;
  error?: string;
}

function omit<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

export function useModels() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const controllers = useRef<Record<string, AbortController>>({});

  const refresh = useCallback(async () => {
    try {
      setInstalled(await listInstalledModels());
      setStorage(await storageEstimate());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const download = useCallback(
    async (id: string) => {
      const ctrl = new AbortController();
      controllers.current[id] = ctrl;
      setDownloads((d) => ({ ...d, [id]: { loaded: 0, total: 0 } }));
      try {
        await downloadModel(id, (loaded, total) => setDownloads((d) => ({ ...d, [id]: { loaded, total } })), ctrl.signal);
        setDownloads((d) => omit(d, id));
        await refresh();
      } catch (err) {
        const aborted = ctrl.signal.aborted;
        setDownloads((d) =>
          aborted ? omit(d, id) : { ...d, [id]: { ...(d[id] ?? { loaded: 0, total: 0 }), error: (err as Error).message } },
        );
      } finally {
        delete controllers.current[id];
      }
    },
    [refresh],
  );

  const cancelDownload = useCallback((id: string) => controllers.current[id]?.abort(), []);

  const remove = useCallback(
    async (id: string) => {
      await deleteModel(id);
      await refresh();
    },
    [refresh],
  );

  const importFile = useCallback(
    async (file: File) => {
      const id = await importModelFile(file);
      await refresh();
      return id;
    },
    [refresh],
  );

  return { installed, downloads, storage, loading, download, cancelDownload, remove, importFile, refresh };
}
