import { FileAudio, History, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ExportMenu } from '../components/ExportMenu';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { EmptyState, PageHeader } from '../components/ui';
import { exportMany } from '../lib/export';
import type { AudioMeta, Transcript } from '../lib/types';
import { formatDate, formatDuration, languageName, segmentsToText } from '../lib/utils';

interface Props {
  items: Transcript[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onUpdateMeta: (id: string, meta: AudioMeta) => void;
}

export function HistoryPage({ items, onDelete, onClear, onUpdateMeta }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      [t.fileName, segmentsToText(t.segments), ...Object.values(t.meta ?? {})].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  const selected = items.find((t) => t.id === selectedId) ?? filtered[0];
  const toExport = checked.size ? items.filter((t) => checked.has(t.id)) : filtered;

  const toggle = (id: string) =>
    setChecked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Histórico"
        subtitle="Guardado apenas neste navegador (IndexedDB). Os arquivos de áudio nunca são armazenados."
        actions={
          items.length > 0 && (
            <>
              <ExportMenu
                label={checked.size ? `Exportar ${checked.size}` : 'Exportar tudo'}
                onExport={(f) => void exportMany(toExport, f)}
                disabled={!toExport.length}
              />
              <button
                className="btn-outline"
                onClick={() => confirm('Apagar todo o histórico deste computador? Esta ação não pode ser desfeita.') && onClear()}
              >
                <Trash2 className="h-4 w-4" /> Limpar
              </button>
            </>
          )
        }
      />

      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon={<History className="h-5 w-5" />} title="Nenhuma transcrição ainda">
            As transcrições concluídas aparecem aqui automaticamente.
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]">
          <div className="card flex max-h-[75vh] flex-col overflow-hidden">
            <label className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-white/[0.06]">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou conteúdo…"
                className="w-full bg-transparent outline-none placeholder:text-zinc-400"
              />
            </label>
            <ul className="scrollbar-thin flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-white/[0.04]">
              {filtered.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition ${
                    t.id === selected?.id ? 'bg-emerald-500/[0.06]' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-emerald-500"
                    checked={checked.has(t.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggle(t.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                      <FileAudio className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{t.fileName}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{segmentsToText(t.segments) || '—'}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {formatDate(t.createdAt)} · {formatDuration(t.durationSec)} · {languageName(t.language)}
                      {t.meta?.senderName && ` · de ${t.meta.senderName}`}
                    </p>
                  </div>
                  <button
                    className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100"
                    title="Excluir"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-4 py-8 text-center text-sm text-zinc-500">Nada encontrado.</li>}
            </ul>
          </div>
          {selected && (
            <TranscriptViewer
              key={selected.id}
              title={selected.fileName}
              segments={selected.segments}
              transcript={selected}
              audioMeta={selected.meta}
              onMetaChange={(meta) => onUpdateMeta(selected.id, meta)}
            />
          )}
        </div>
      )}
    </div>
  );
}
