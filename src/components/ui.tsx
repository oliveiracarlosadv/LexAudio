import type { ReactNode } from 'react';
import type { JobStatus } from '../lib/types';

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.06] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-[width] duration-300"
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

const STATUS: Record<JobStatus, { label: string; cls: string }> = {
  queued: { label: 'Na fila', cls: 'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400' },
  decoding: { label: 'Convertendo', cls: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  transcribing: { label: 'Transcrevendo', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  done: { label: 'Concluído', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  error: { label: 'Erro', cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  canceled: { label: 'Cancelado', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS[status];
  return (
    <span className={`chip ${s.cls}`}>
      {(status === 'decoding' || status === 'transcribing') && <Equalizer />}
      {s.label}
    </span>
  );
}

export function Equalizer({ className = 'h-2.5' }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[2px] ${className}`} aria-hidden>
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="h-full w-[2px] origin-bottom animate-pulse-bar rounded bg-current" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[0.04]">{icon}</div>
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-zinc-500">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
