import { CalendarClock, ChevronDown, UserRound } from 'lucide-react';
import { useEffect, useState, type InputHTMLAttributes } from 'react';
import type { AudioMeta } from '../lib/types';
import { formatPhone, metaLines } from '../lib/utils';

interface Props {
  value?: AudioMeta;
  onChange: (meta: AudioMeta) => void;
}

/** Campos opcionais sobre a origem do áudio: quem enviou, quem recebeu e quando. */
export function AudioMetaForm({ value, onChange }: Props) {
  const filled = metaLines(value);
  const [open, setOpen] = useState(filled.length > 0);
  const [draft, setDraft] = useState<AudioMeta>(value ?? {});

  useEffect(() => setDraft(value ?? {}), [value]);

  const set = (key: keyof AudioMeta, v: string) => setDraft((d) => ({ ...d, [key]: v }));
  const commit = (next: AudioMeta = draft) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v?.trim())) as AudioMeta;
    if (JSON.stringify(clean) !== JSON.stringify(value ?? {})) onChange(clean);
  };
  const commitPhone = (key: 'senderPhone' | 'recipientPhone') => {
    const next = { ...draft, [key]: formatPhone(draft[key] ?? '') };
    setDraft(next);
    commit(next);
  };

  const field = (key: keyof AudioMeta, label: string, props: Partial<InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</span>
      <input
        className="input w-full py-1.5"
        value={draft[key] ?? ''}
        onChange={(e) => {
          set(key, e.target.value);
          // seletores de data podem não disparar blur: salva na hora
          if (props.type === 'datetime-local') commit({ ...draft, [key]: e.target.value });
        }}
        onBlur={() => commit()}
        {...props}
      />
    </label>
  );

  return (
    <div className="border-b border-zinc-200 dark:border-white/[0.06]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-5 py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/[0.02]"
      >
        <UserRound className="h-4 w-4 text-emerald-500" />
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Dados do áudio</span>
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
          {filled.length ? filled.map(([l, v]) => `${l}: ${v}`).join(' · ') : 'opcional: remetente, destinatário e datas'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid animate-fade-in gap-4 px-5 pb-4 pt-1 sm:grid-cols-2">
          <fieldset className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-white/[0.06]">
            <legend className="px-1 text-xs font-semibold">Quem enviou</legend>
            {field('senderName', 'Nome', { placeholder: 'Ex.: Maria Souza', autoComplete: 'off' })}
            {field('senderPhone', 'Telefone', {
              type: 'tel',
              placeholder: '(91) 99999-9999',
              inputMode: 'tel',
              onBlur: () => commitPhone('senderPhone'),
            })}
          </fieldset>
          <fieldset className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-white/[0.06]">
            <legend className="px-1 text-xs font-semibold">Quem recebeu</legend>
            {field('recipientName', 'Nome', { placeholder: 'Ex.: João Lima', autoComplete: 'off' })}
            {field('recipientPhone', 'Telefone', {
              type: 'tel',
              placeholder: '(91) 99999-9999',
              inputMode: 'tel',
              onBlur: () => commitPhone('recipientPhone'),
            })}
          </fieldset>
          <fieldset className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:col-span-2 sm:grid-cols-2 dark:border-white/[0.06]">
            <legend className="flex items-center gap-1 px-1 text-xs font-semibold">
              <CalendarClock className="h-3.5 w-3.5" /> Datas
            </legend>
            {field('sentAt', 'Data de envio', { type: 'datetime-local' })}
            {field('receivedAt', 'Data de recebimento', { type: 'datetime-local' })}
          </fieldset>
        </div>
      )}
    </div>
  );
}
