export function OliveMark({ className = 'h-6 w-20' }: { className?: string }) {
  return <span aria-hidden className={`olive-mark inline-block ${className}`} />;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src={`${import.meta.env.BASE_URL}icons/pwa-192.png`} alt="" className="h-9 w-9 rounded-xl shadow-glow" />
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">
            Lex <span className="text-emerald-500 dark:text-emerald-400">Audio</span>
          </div>
          <div className="text-[11px] text-zinc-500">IA local · 100% offline</div>
        </div>
      )}
    </div>
  );
}
