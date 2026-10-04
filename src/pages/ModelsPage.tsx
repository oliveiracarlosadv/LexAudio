import { Check, CloudDownload, Cpu, HardDrive, Loader2, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { PageHeader, ProgressBar } from '../components/ui';
import type { Settings } from '../hooks/useSettings';
import type { useModels } from '../hooks/useModels';
import { formatBytes } from '../lib/utils';
import { MODELS, modelUrl } from '../lib/whisper/models';

interface Props {
  models: ReturnType<typeof useModels>;
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
}

export function ModelsPage({ models, settings, updateSettings }: Props) {
  const { installed, downloads, storage } = models;
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const maxThreads = Math.max(1, navigator.hardwareConcurrency || 4);

  const onImport = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const id = await models.importFile(file);
      updateSettings({ modelId: id });
    } catch (err) {
      setImportError((err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Modelos de IA"
        subtitle="Modelos Whisper executados localmente via WebAssembly. Baixe uma vez, use para sempre — sem internet."
        actions={
          <>
            <button className="btn-outline" onClick={() => fileInput.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Importar arquivo .bin
            </button>
            <input ref={fileInput} type="file" accept=".bin" className="hidden" onChange={(e) => void onImport(e.target.files?.[0])} />
          </>
        }
      />

      {importError && <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{importError}</p>}

      <div className="grid gap-3">
        {MODELS.map((m) => {
          const isInstalled = installed.includes(m.id);
          const dl = downloads[m.id];
          const active = settings.modelId === m.id && isInstalled;
          const pct = dl?.total ? (dl.loaded / dl.total) * 100 : 0;
          return (
            <div key={m.id} className={`card flex flex-wrap items-center gap-4 p-5 ${active ? 'ring-1 ring-emerald-500/40' : ''}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="min-w-[220px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{m.name}</p>
                  <span className="chip bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">{m.label}</span>
                  {m.recommended && <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Recomendado</span>}
                  {active && (
                    <span className="chip bg-emerald-500 text-ink-950">
                      <Check className="h-3 w-3" /> Em uso
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500">{m.description}</p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Download {m.sizeMB} MB · RAM ~{m.ramMB >= 1000 ? `${(m.ramMB / 1000).toFixed(1).replace('.', ',')} GB` : `${m.ramMB} MB`}
                </p>
                {dl && !dl.error && (
                  <div className="mt-3 max-w-md">
                    <ProgressBar value={pct} />
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {formatBytes(dl.loaded)} de {dl.total ? formatBytes(dl.total) : '…'} ({Math.floor(pct)}%)
                    </p>
                  </div>
                )}
                {dl?.error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{dl.error}</p>}
              </div>
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <>
                    {!active && (
                      <button className="btn-outline" onClick={() => updateSettings({ modelId: m.id })}>
                        Usar este
                      </button>
                    )}
                    <button
                      className="btn-ghost px-2.5"
                      title="Remover do computador"
                      onClick={() => confirm(`Remover o modelo ${m.name} deste computador?`) && void models.remove(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : dl && !dl.error ? (
                  <button className="btn-outline" onClick={() => models.cancelDownload(m.id)}>
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => void models.download(m.id)}>
                    <CloudDownload className="h-4 w-4" /> Baixar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <HardDrive className="h-4 w-4 text-emerald-500" /> Desempenho
          </p>
          <label className="mt-4 block text-sm">
            <span className="flex justify-between text-zinc-500">
              Núcleos de processamento <span className="font-mono text-zinc-900 dark:text-zinc-100">{settings.threads}</span>
            </span>
            <input
              type="range"
              min={1}
              max={maxThreads}
              value={Math.min(settings.threads, maxThreads)}
              onChange={(e) => updateSettings({ threads: Number(e.target.value) })}
              className="mt-2 w-full accent-emerald-500"
            />
          </label>
          {storage && (
            <p className="mt-4 text-xs text-zinc-500">
              Armazenamento local usado: {formatBytes(storage.usage)} de {formatBytes(storage.quota)} disponíveis
            </p>
          )}
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Sobre a privacidade
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            O download do modelo é a única conexão que o Lex Audio faz — e nenhum dado seu é enviado nela. Em computadores sem
            internet, baixe o arquivo em outra máquina (ex.: <code className="text-[11px]">{modelUrl('base-q5_1').split('/').pop()}</code>) e use
            “Importar arquivo .bin”.
          </p>
        </div>
      </div>
    </div>
  );
}
