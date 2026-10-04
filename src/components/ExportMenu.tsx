import { ChevronDown, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ExportFormat } from '../lib/export';

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'txt', label: 'Texto (.txt)', hint: 'Texto corrido' },
  { id: 'docx', label: 'Word (.docx)', hint: 'Com cabeçalho e marcações de tempo' },
  { id: 'srt', label: 'Legendas (.srt)', hint: 'Para vídeos e players' },
];

export function ExportMenu({ onExport, label = 'Exportar', disabled }: { onExport: (f: ExportFormat) => void; label?: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button className="btn-primary" disabled={disabled} onClick={() => setOpen((o) => !o)}>
        <Download className="h-4 w-4" />
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 animate-fade-in overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-ink-800">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setOpen(false);
                onExport(f.id);
              }}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
            >
              <span className="text-sm font-medium">{f.label}</span>
              <span className="text-[11px] text-zinc-500">{f.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
