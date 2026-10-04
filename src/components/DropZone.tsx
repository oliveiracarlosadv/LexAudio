import { UploadCloud } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { isSupportedAudio } from '../lib/utils';

interface Props {
  onFiles: (files: File[]) => void;
  onRejected?: (names: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function DropZone({ onFiles, onRejected, disabled, compact }: Props) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const accept = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    const ok = files.filter(isSupportedAudio);
    const bad = files.filter((f) => !isSupportedAudio(f)).map((f) => f.name);
    if (ok.length) onFiles(ok);
    if (bad.length) onRejected?.(bad);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (!disabled) accept(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition
        ${compact ? 'gap-2 px-4 py-6' : 'gap-4 px-6 py-14'}
        ${over ? 'border-emerald-500 bg-emerald-500/[0.07]' : 'border-zinc-300 hover:border-emerald-500/60 hover:bg-emerald-500/[0.03] dark:border-white/10'}
        ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div
        className={`flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 transition group-hover:scale-105 dark:text-emerald-400
          ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}
      >
        <UploadCloud className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
      </div>
      <div>
        <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
          {over ? 'Solte para adicionar à fila' : 'Arraste seus áudios aqui'}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          ou <span className="text-emerald-600 underline-offset-2 group-hover:underline dark:text-emerald-400">clique para escolher</span> ·
          OGG, OPUS, MP3, WAV, M4A · vários arquivos de uma vez
        </p>
      </div>
      {!compact && (
        <div className="flex flex-wrap justify-center gap-1.5 text-[11px] text-zinc-500">
          {['WhatsApp', 'Telegram', 'Signal', 'Gravador', 'Reuniões'].map((s) => (
            <span key={s} className="chip bg-zinc-100 dark:bg-white/[0.05]">
              {s}
            </span>
          ))}
        </div>
      )}
      <input
        ref={input}
        type="file"
        multiple
        accept="audio/*,.ogg,.opus,.oga,.mp3,.wav,.m4a,.aac,.flac,.webm,.amr"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
