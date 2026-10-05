import { AlertTriangle, Cpu, FileAudio, Languages, RotateCcw, Trash2, X, Zap } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { DropZone } from '../components/DropZone';
import { OliveMark } from '../components/Logo';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { EmptyState, ProgressBar, StatusBadge } from '../components/ui';
import type { Settings } from '../hooks/useSettings';
import { exportMany, type ExportFormat } from '../lib/export';
import type { AudioMeta, Job } from '../lib/types';
import { formatBytes, formatDuration, LANGUAGES } from '../lib/utils';
import { MODELS } from '../lib/whisper/models';
import { ExportMenu } from '../components/ExportMenu';

interface Props {
  queue: {
    jobs: Job[];
    activeId: string | null;
    addFiles: (f: File[]) => Job[];
    cancel: (id: string) => void;
    retry: (id: string) => void;
    remove: (id: string) => void;
    clearFinished: () => void;
    updateMeta: (id: string, meta: AudioMeta) => void;
  };
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  installedModels: string[];
  support: { ok: boolean; reason?: string };
  onGoToModels: () => void;
}

export function TranscribePage({ queue, settings, updateSettings, installedModels, support, onGoToModels }: Props) {
  const { jobs, activeId } = queue;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);

  const hasModel = installedModels.includes(settings.modelId);
  const usable = MODELS.filter((m) => installedModels.includes(m.id));
  const extraModels = installedModels.filter((id) => !MODELS.some((m) => m.id === id));

  // Se o modelo escolhido não está instalado, usa o primeiro disponível
  useEffect(() => {
    if (!hasModel && installedModels.length) updateSettings({ modelId: usable[0]?.id ?? installedModels[0] });
  }, [hasModel, installedModels]);

  // Acompanha automaticamente o arquivo em processamento
  useEffect(() => {
    if (activeId) setSelectedId(activeId);
  }, [activeId]);

  const selected = jobs.find((j) => j.id === selectedId) ?? jobs.find((j) => j.status === 'done') ?? jobs[0];
  const done = jobs.filter((j) => j.transcript);
  const ready = support.ok && hasModel;

  const onFiles = (files: File[]) => {
    setRejected([]);
    const added = queue.addFiles(files);
    if (!activeId && added[0]) setSelectedId(added[0].id);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {jobs.length === 0 && (
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50/60 px-6 py-10 sm:px-10 dark:border-white/[0.06] dark:from-ink-900 dark:to-emerald-950/30">
          <OliveMark className="pointer-events-none absolute -right-10 -top-4 h-40 w-[30rem] rotate-[-8deg] opacity-[0.12]" />
          <span className="chip bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
            <Zap className="h-3 w-3" /> IA local com Whisper · zero nuvem
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Transforme áudio em texto.{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Totalmente offline.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Transcreva áudios do WhatsApp, Telegram, Signal, reuniões e audiências sem que um único byte saia do seu computador.
          </p>
        </section>
      )}

      {!support.ok && (
        <Banner tone="danger" title="Motor de IA indisponível neste navegador">
          {support.reason}
        </Banner>
      )}
      {support.ok && !hasModel && (
        <Banner tone="warn" title="Instale um modelo de IA para começar" action={<button className="btn-primary" onClick={onGoToModels}>Escolher modelo</button>}>
          O modelo é baixado uma única vez e fica guardado neste computador. Depois disso, tudo funciona sem internet.
        </Banner>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <Cpu className="h-4 w-4 text-zinc-400" />
          <select className="input py-1.5" value={settings.modelId} onChange={(e) => updateSettings({ modelId: e.target.value })} disabled={!installedModels.length}>
            {!installedModels.length && <option>Nenhum modelo instalado</option>}
            {usable.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.label}
              </option>
            ))}
            {extraModels.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Languages className="h-4 w-4 text-zinc-400" />
          <select className="input py-1.5" value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })}>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            className="accent-emerald-500"
            checked={settings.translate}
            onChange={(e) => updateSettings({ translate: e.target.checked })}
          />
          Traduzir para inglês
        </label>
      </div>

      <div className={jobs.length ? 'grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]' : ''}>
        <div className="space-y-4">
          <DropZone onFiles={onFiles} onRejected={setRejected} disabled={!ready} compact={jobs.length > 0} />
          {rejected.length > 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400">Formato não suportado: {rejected.join(', ')}</p>
          )}

          {jobs.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/[0.06]">
                <p className="text-sm font-semibold">
                  Fila <span className="font-normal text-zinc-500">· {jobs.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  {done.length > 1 && (
                    <ExportMenu label="Lote" onExport={(f: ExportFormat) => void exportMany(done.map((j) => j.transcript!), f)} />
                  )}
                  <button className="btn-ghost px-2" onClick={queue.clearFinished} title="Limpar concluídos">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ul className="scrollbar-thin max-h-[52vh] divide-y divide-zinc-100 overflow-y-auto dark:divide-white/[0.04]">
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    selected={job.id === selected?.id}
                    onSelect={() => setSelectedId(job.id)}
                    onCancel={() => queue.cancel(job.id)}
                    onRetry={() => queue.retry(job.id)}
                    onRemove={() => queue.remove(job.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="min-h-0">
            {selected ? (
              selected.status === 'error' ? (
                <div className="card">
                  <EmptyState icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} title="Não foi possível transcrever">
                    {selected.error}
                  </EmptyState>
                </div>
              ) : (
                <TranscriptViewer
                  title={selected.file.name}
                  segments={selected.segments}
                  transcript={selected.transcript}
                  live={selected.status === 'decoding' || selected.status === 'transcribing' || selected.status === 'queued'}
                  info={{ durationSec: selected.durationSec, language: selected.language }}
                  audioMeta={selected.meta}
                  onMetaChange={(meta) => queue.updateMeta(selected.id, meta)}
                />
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ job, selected, onSelect, onCancel, onRetry, onRemove }: {
  job: Job;
  selected: boolean;
  onSelect: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const busy = job.status === 'decoding' || job.status === 'transcribing';
  return (
    <li
      onClick={onSelect}
      className={`cursor-pointer px-4 py-3 transition ${selected ? 'bg-emerald-500/[0.06]' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.02]'}`}
    >
      <div className="flex items-center gap-3">
        <FileAudio className={`h-4 w-4 shrink-0 ${selected ? 'text-emerald-500' : 'text-zinc-400'}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{job.file.name}</p>
          <p className="text-[11px] text-zinc-500">
            {formatBytes(job.file.size)}
            {job.durationSec !== undefined && ` · ${formatDuration(job.durationSec)}`}
            {job.transcript && ` · ${(job.transcript.processingMs / 1000).toFixed(1).replace('.', ',')} s`}
          </p>
        </div>
        <StatusBadge status={job.status} />
        <div className="flex" onClick={(e) => e.stopPropagation()}>
          {(busy || job.status === 'queued') && (
            <button className="btn-ghost p-1.5" onClick={onCancel} title="Cancelar">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {(job.status === 'error' || job.status === 'canceled') && (
            <button className="btn-ghost p-1.5" onClick={onRetry} title="Tentar novamente">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          {!busy && job.status !== 'queued' && (
            <button className="btn-ghost p-1.5" onClick={onRemove} title="Remover da fila">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {busy && <ProgressBar value={job.progress} className="mt-2.5" />}
    </li>
  );
}

function Banner({ tone, title, children, action }: { tone: 'warn' | 'danger'; title: string; children: ReactNode; action?: ReactNode }) {
  const cls =
    tone === 'danger'
      ? 'border-rose-500/30 bg-rose-500/[0.06] text-rose-800 dark:text-rose-200'
      : 'border-amber-500/30 bg-amber-500/[0.06] text-amber-900 dark:text-amber-100';
  return (
    <div className={`mb-6 flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4 ${cls}`}>
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm opacity-80">{children}</p>
      </div>
      {action}
    </div>
  );
}
