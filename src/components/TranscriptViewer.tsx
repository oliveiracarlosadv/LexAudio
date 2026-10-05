import { Check, Copy, FileAudio, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { exportTranscript, type ExportFormat } from '../lib/export';
import type { AudioMeta, Segment, Transcript } from '../lib/types';
import { formatClock, formatDuration, languageName, segmentsToText } from '../lib/utils';
import { getModel } from '../lib/whisper/models';
import { AudioMetaForm } from './AudioMetaForm';
import { ExportMenu } from './ExportMenu';
import { Equalizer } from './ui';

interface Props {
  title: string;
  segments: Segment[];
  transcript?: Transcript;
  live?: boolean;
  info?: { durationSec?: number; language?: string };
  audioMeta?: AudioMeta;
  onMetaChange?: (meta: AudioMeta) => void;
}

export function TranscriptViewer({ title, segments, transcript, live, info, audioMeta, onMetaChange }: Props) {
  const [mode, setMode] = useState<'segments' | 'text'>('segments');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (live) bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [segments.length, live]);

  const text = useMemo(() => segmentsToText(segments), [segments]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? segments.filter((s) => s.text.toLowerCase().includes(q)) : segments;
  }, [segments, query]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onExport = (f: ExportFormat) => transcript && void exportTranscript({ ...transcript, meta: audioMeta ?? transcript.meta }, f);
  const duration = transcript?.durationSec ?? info?.durationSec;
  const language = transcript?.language ?? info?.language;
  const words = text ? text.split(/\s+/).length : 0;

  return (
    <div className="card flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileAudio className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500">
              {duration !== undefined && <span>{formatDuration(duration)}</span>}
              {language && <span>· {languageName(language)}</span>}
              {transcript && <span>· {getModel(transcript.modelId)?.name ?? transcript.modelId}</span>}
              {words > 0 && <span>· {words.toLocaleString('pt-BR')} palavras</span>}
              {live && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  · <Equalizer /> ao vivo
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-zinc-100 p-0.5 text-xs dark:bg-white/[0.05]">
            {(['segments', 'text'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition ${mode === m ? 'bg-white shadow-sm dark:bg-ink-700' : 'text-zinc-500'}`}
              >
                {m === 'segments' ? 'Trechos' : 'Texto'}
              </button>
            ))}
          </div>
          <button className="btn-outline px-2.5" onClick={copy} disabled={!text} title="Copiar texto">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <ExportMenu onExport={onExport} disabled={!transcript} />
        </div>
      </div>

      {onMetaChange && <AudioMetaForm value={audioMeta} onChange={onMetaChange} />}

      {mode === 'segments' && segments.length > 0 && (
        <div className="border-b border-zinc-200 px-5 py-2.5 dark:border-white/[0.06]">
          <label className="flex items-center gap-2 text-sm text-zinc-500">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar na transcrição…"
              className="w-full bg-transparent py-1 outline-none placeholder:text-zinc-400"
            />
          </label>
        </div>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
        {segments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-sm text-zinc-500">
            {live ? (
              <>
                <Equalizer className="h-6 text-emerald-500" />
                Preparando o áudio e o modelo de IA…
              </>
            ) : (
              'Nenhum texto reconhecido neste áudio.'
            )}
          </div>
        ) : mode === 'text' ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7">{text}</p>
        ) : (
          <ol className="space-y-1">
            {filtered.map((s, i) => (
              <li key={`${s.start}-${i}`} className="group flex animate-fade-in gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                <span className="w-14 shrink-0 pt-0.5 font-mono text-[11px] text-emerald-600/80 dark:text-emerald-400/70">{formatClock(s.start)}</span>
                <span className="text-[15px] leading-7">{highlight(s.text.trim(), query)}</span>
              </li>
            ))}
          </ol>
        )}
        <div ref={bottom} />
      </div>
    </div>
  );
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-emerald-400/30 px-0.5 text-inherit">
        {p}
      </mark>
    ) : (
      p
    ),
  );
}
