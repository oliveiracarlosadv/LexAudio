import { AudioLines, Cpu, History, Info, Moon, ShieldCheck, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import { Logo } from './Logo';

export type Tab = 'transcribe' | 'history' | 'models' | 'about';

const ITEMS: { id: Tab; label: string; icon: typeof AudioLines }[] = [
  { id: 'transcribe', label: 'Transcrever', icon: AudioLines },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'models', label: 'Modelos', icon: Cpu },
  { id: 'about', label: 'Sobre', icon: Info },
];

interface Props {
  tab: Tab;
  onTab: (t: Tab) => void;
  theme: Theme;
  onToggleTheme: () => void;
  historyCount: number;
}

export function Sidebar({ tab, onTab, theme, onToggleTheme, historyCount }: Props) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white/70 p-4 backdrop-blur md:flex dark:border-white/[0.06] dark:bg-ink-900/60">
      <div className="px-2 pb-6 pt-1">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTab(id)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === id
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1 text-left">{label}</span>
            {id === 'history' && historyCount > 0 && (
              <span className="rounded-md bg-zinc-100 px-1.5 text-[11px] text-zinc-500 dark:bg-white/[0.06]">{historyCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> Privacidade total
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            Seus áudios são processados apenas neste computador. Nada é enviado para servidores.
          </p>
        </div>
        <button onClick={onToggleTheme} className="btn-ghost w-full justify-start">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </button>
      </div>
    </aside>
  );
}

export function MobileHeader({ theme, onToggleTheme }: Pick<Props, 'theme' | 'onToggleTheme'>) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur md:hidden dark:border-white/[0.06] dark:bg-ink-900/80">
      <Logo />
      <button onClick={onToggleTheme} className="btn-ghost px-2.5" aria-label="Alternar tema">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  );
}

export function MobileTabs({ tab, onTab }: Pick<Props, 'tab' | 'onTab'>) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-white/[0.06] dark:bg-ink-900/90">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTab(id)}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            tab === id ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </nav>
  );
}
