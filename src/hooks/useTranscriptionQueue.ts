import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeToPcm16k, SAMPLE_RATE } from '../lib/audio/decode';
import { CanceledError, engine } from '../lib/whisper/engine';
import { saveTranscript } from '../lib/storage/history';
import type { AudioMeta, Job, Transcript } from '../lib/types';
import { uid } from '../lib/utils';
import type { Settings } from './useSettings';

const DECODE_SHARE = 12; // % da barra reservado à conversão do áudio

export function useTranscriptionQueue(
  settings: Settings,
  onSaved?: (t: Transcript) => void,
  onUpdated?: (t: Transcript) => void,
) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const settingsRef = useRef(settings);
  const canceled = useRef(new Set<string>());
  const jobsRef = useRef(jobs);
  settingsRef.current = settings;
  jobsRef.current = jobs;

  const patch = useCallback((id: string, p: Partial<Job> | ((j: Job) => Partial<Job>)) => {
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, ...(typeof p === 'function' ? p(j) : p) } : j)));
  }, []);

  const run = useCallback(
    async (job: Job) => {
      setActiveId(job.id);
      const { modelId, language, translate, threads } = settingsRef.current;
      const started = performance.now();
      try {
        patch(job.id, { status: 'decoding', progress: 0 });
        const pcm = await decodeToPcm16k(job.file, (p) => patch(job.id, { progress: Math.round(p * DECODE_SHARE) }));
        const durationSec = pcm.length / SAMPLE_RATE;
        if (canceled.current.has(job.id)) throw new CanceledError();

        patch(job.id, { status: 'transcribing', progress: DECODE_SHARE, durationSec });
        await engine.ensureModel(modelId);
        if (canceled.current.has(job.id)) throw new CanceledError();

        const result = await engine.transcribe(
          pcm,
          { language, translate, threads },
          {
            onSegment: (s) =>
              patch(job.id, (j) => ({
                segments: [...j.segments, s],
                // progresso estimado pela posição do áudio, refinado pelo callback do Whisper
                progress: Math.max(j.progress, DECODE_SHARE + Math.round(((s.end / 1000) / durationSec) * (100 - DECODE_SHARE))),
              })),
            onProgress: (p) =>
              patch(job.id, (j) => ({ progress: Math.max(j.progress, DECODE_SHARE + Math.round(p * (100 - DECODE_SHARE) / 100)) })),
          },
        );

        const transcript: Transcript = {
          id: uid(),
          fileName: job.file.name,
          fileSize: job.file.size,
          durationSec,
          language: result.language || (language === 'auto' ? '' : language),
          modelId,
          segments: result.segments,
          createdAt: Date.now(),
          processingMs: Math.round(performance.now() - started),
          // dados preenchidos pelo usuário enquanto o áudio era processado
          meta: jobsRef.current.find((j) => j.id === job.id)?.meta,
        };
        await saveTranscript(transcript);
        patch(job.id, { status: 'done', progress: 100, segments: result.segments, language: transcript.language, transcript });
        onSaved?.(transcript);
      } catch (err) {
        if (err instanceof CanceledError) patch(job.id, { status: 'canceled' });
        else patch(job.id, { status: 'error', error: (err as Error).message });
      } finally {
        canceled.current.delete(job.id);
        setActiveId(null);
      }
    },
    [patch, onSaved],
  );

  // Processa a fila em ordem, um arquivo por vez (o Whisper já usa todos os núcleos).
  useEffect(() => {
    if (activeId) return;
    const next = jobs.find((j) => j.status === 'queued');
    if (next) void run(next);
  }, [jobs, activeId, run]);

  const addFiles = useCallback((files: File[]) => {
    const added: Job[] = files.map((file) => ({ id: uid(), file, status: 'queued', progress: 0, segments: [] }));
    setJobs((list) => [...list, ...added]);
    return added;
  }, []);

  const cancel = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (!job) return;
      if (job.status === 'queued') patch(id, { status: 'canceled' });
      else if (job.status === 'decoding' || job.status === 'transcribing') {
        canceled.current.add(id);
        engine.cancel();
      }
    },
    [jobs, patch],
  );

  const updateMeta = useCallback(
    (id: string, meta: AudioMeta) => {
      const job = jobsRef.current.find((j) => j.id === id);
      if (!job) return;
      const transcript = job.transcript ? { ...job.transcript, meta } : undefined;
      patch(id, { meta, transcript });
      if (transcript) void saveTranscript(transcript).then(() => onUpdated?.(transcript));
    },
    [patch, onUpdated],
  );

  const retry = useCallback((id: string) => patch(id, { status: 'queued', progress: 0, segments: [], error: undefined }), [patch]);
  const remove = useCallback((id: string) => setJobs((list) => list.filter((j) => j.id !== id || j.id === activeId)), [activeId]);
  const clearFinished = useCallback(
    () => setJobs((list) => list.filter((j) => j.status === 'queued' || j.id === activeId)),
    [activeId],
  );

  return { jobs, activeId, addFiles, cancel, retry, remove, clearFinished, updateMeta };
}
