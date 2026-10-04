import { useEffect, useState } from 'react';
import { DEFAULT_MODEL_ID } from '../lib/whisper/models';
import { defaultThreads } from '../lib/whisper/engine';

export interface Settings {
  modelId: string;
  language: string;
  translate: boolean;
  threads: number;
}

const KEY = 'lex-settings';

function load(): Settings {
  const defaults: Settings = { modelId: DEFAULT_MODEL_ID, language: 'auto', translate: false, threads: defaultThreads() };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* armazenamento indisponível */
    }
  }, [settings]);
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  return { settings, update };
}
