import { ArrowLeft, ArrowRight, Check, CloudDownload, Loader2, Lock, PartyPopper, Pin, WifiOff, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import termos from '../../docs/TERMOS.md?raw';
import privacidade from '../../docs/PRIVACIDADE.md?raw';
import type { useModels } from '../hooks/useModels';
import { useProfile } from '../hooks/useProfile';
import type { Settings } from '../hooks/useSettings';
import { formatBytes } from '../lib/utils';
import { MODELS } from '../lib/whisper/models';
import { Logo, OliveMark } from './Logo';
import { Markdown } from './Markdown';
import { ProgressBar } from './ui';

export const SETUP_KEY = 'lex-setup-done';

export function setupDone(): boolean {
  try {
    return localStorage.getItem(SETUP_KEY) === '1';
  } catch {
    return true;
  }
}

export function markSetupDone() {
  try {
    localStorage.setItem(SETUP_KEY, '1');
  } catch {
    /* armazenamento indisponível */
  }
}

const STEPS = ['Boas-vindas', 'Termos', 'Modelo de IA', 'Perfil', 'Concluir'];
const CHOICES = ['tiny-q5_1', 'base-q5_1', 'small-q5_1'];

interface Props {
  models: ReturnType<typeof useModels>;
  updateSettings: (p: Partial<Settings>) => void;
  onFinish: (goTo: 'transcribe' | 'profile') => void;
}

/** Assistente de primeiro uso: Avançar → Avançar → Concluir. */
export function SetupWizard({ models, updateSettings, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [doc, setDoc] = useState<'termos' | 'privacidade'>('termos');
  const [choice, setChoice] = useState('base-q5_1');
  const { profile, save } = useProfile();
  const [quick, setQuick] = useState({ name: profile.name, profession: profile.profession, registry: profile.registry, office: profile.office });

  const installed = models.installed.includes(choice);
  const dl = models.downloads[choice];
  const anyInstalled = models.installed.length > 0;

  const startDownload = () => {
    updateSettings({ modelId: choice });
    if (!installed && !dl) void models.download(choice);
  };

  const canNext = [true, accepted, installed || (Boolean(dl) && !dl?.error) || anyInstalled, true, true][step];

  const next = () => {
    if (step === 3 && Object.values(quick).some((v) => v.trim())) save({ ...profile, ...quick });
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const finish = (goTo: 'transcribe' | 'profile') => {
    markSetupDone();
    onFinish(goTo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="card flex max-h-full w-full max-w-2xl animate-fade-in flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
          <Logo />
          <span className="text-xs text-zinc-500">
            Passo {step + 1} de {STEPS.length} · {STEPS[step]}
          </span>
        </div>
        <div className="flex gap-1 px-5 pt-3">
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-white/[0.08]'}`} />
          ))}
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {step === 0 && (
            <div>
              <OliveMark className="h-10 w-32" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Bem-vindo ao Lex Audio</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Transforme áudio em texto, totalmente offline. Em poucos passos o programa fica pronto para usar.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Feature icon={<WifiOff className="h-5 w-5" />} title="Sem internet" text="Depois de configurado, tudo funciona offline." />
                <Feature icon={<Lock className="h-5 w-5" />} title="Sigilo" text="Nenhum áudio ou texto sai deste computador." />
                <Feature icon={<Zap className="h-5 w-5" />} title="Relatórios" text="PDF e Word com timbre, hash e assinatura." />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold">Termos de Uso e Política de Privacidade</h2>
              <div className="mt-3 flex gap-2">
                {(['termos', 'privacidade'] as const).map((d) => (
                  <button key={d} onClick={() => setDoc(d)} className={doc === d ? 'btn-outline py-1.5 text-xs ring-1 ring-emerald-500/40' : 'btn-ghost py-1.5 text-xs'}>
                    {d === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}
                  </button>
                ))}
              </div>
              <div className="scrollbar-thin mt-3 h-64 overflow-y-auto rounded-xl border border-zinc-200 p-4 text-sm dark:border-white/[0.06]">
                <Markdown source={doc === 'termos' ? termos : privacidade} />
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                Li e aceito os Termos de Uso e a Política de Privacidade
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold">Escolha o modelo de inteligência artificial</h2>
              <p className="mt-1 text-sm text-zinc-500">
                É baixado uma única vez (precisa de internet só agora). Depois, a transcrição funciona sem internet. Você pode trocar depois na aba Modelos.
              </p>
              <div className="mt-4 grid gap-2">
                {MODELS.filter((m) => CHOICES.includes(m.id)).map((m) => {
                  const isIn = models.installed.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                        choice === m.id ? 'border-emerald-500/60 bg-emerald-500/[0.06]' : 'border-zinc-200 dark:border-white/[0.06]'
                      }`}
                    >
                      <input type="radio" name="model" className="accent-emerald-500" checked={choice === m.id} onChange={() => setChoice(m.id)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {m.name} · {m.label} {m.recommended && <span className="chip ml-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">recomendado</span>}
                        </p>
                        <p className="text-xs text-zinc-500">{m.description}</p>
                      </div>
                      <span className="shrink-0 text-xs text-zinc-500">{isIn ? <Check className="h-4 w-4 text-emerald-500" /> : `${m.sizeMB} MB`}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4">
                {installed ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" /> Modelo instalado. Clique em Avançar.
                  </p>
                ) : dl && !dl.error ? (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Baixando… você já pode avançar, o download continua.
                      </span>
                      <span>{dl.total ? `${formatBytes(dl.loaded)} de ${formatBytes(dl.total)}` : formatBytes(dl.loaded)}</span>
                    </div>
                    <ProgressBar value={dl.total ? (dl.loaded / dl.total) * 100 : 2} />
                  </div>
                ) : (
                  <>
                    <button className="btn-primary" onClick={startDownload}>
                      <CloudDownload className="h-4 w-4" /> Baixar modelo
                    </button>
                    {dl?.error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Falha no download: {dl.error}. Verifique a internet e tente de novo.</p>}
                    {anyInstalled && <p className="mt-2 text-xs text-zinc-500">Você já tem outro modelo instalado e pode avançar sem baixar.</p>}
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold">Seu perfil (opcional)</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Usado no cabeçalho e na assinatura dos relatórios. Os demais dados (CPF, CNPJ, logo, contatos) ficam na aba Perfil.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['name', 'Nome completo', 'Ex.: Maria da Silva Souza'],
                    ['profession', 'Profissão', 'Ex.: Advogado(a)'],
                    ['registry', 'Número de registro', 'Ex.: OAB/PA 12.345'],
                    ['office', 'Escritório', 'Ex.: Souza & Lima Advogados'],
                  ] as const
                ).map(([key, label, ph]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
                    <input className="input w-full" placeholder={ph} value={quick[key]} onChange={(e) => setQuick((q) => ({ ...q, [key]: e.target.value }))} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <PartyPopper className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Tudo pronto!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Arraste um áudio para a tela Transcrever e o texto aparece em instantes.
                {dl && !installed && ' O modelo ainda está sendo baixado; a transcrição começa assim que terminar.'}
              </p>
              <PinTip />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
          {step > 0 && step < STEPS.length - 1 ? (
            <button className="btn-ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {step === 2 && !canNext && (
              <button className="btn-ghost text-xs" onClick={() => setStep(3)}>
                Baixar depois
              </button>
            )}
            {step === STEPS.length - 1 ? (
              <>
                <button className="btn-outline" onClick={() => finish('profile')}>
                  Completar perfil
                </button>
                <button className="btn-primary" onClick={() => finish('transcribe')}>
                  Começar a transcrever <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={next} disabled={!canNext}>
                Avançar <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dica para deixar o ícone do Lex Audio fixo na barra do sistema (só no programa instalado). */
function PinTip() {
  if (location.port !== '47821') return null;
  const ua = navigator.userAgent;
  const text = /Windows/.test(ua)
    ? 'Para fixar o ícone na barra de tarefas: abra o menu Iniciar, clique com o botão direito em Lex Audio e escolha "Fixar na barra de tarefas".'
    : /Mac OS X|Macintosh/.test(ua)
      ? 'O ícone do Lex Audio foi colocado no Dock. Para abrir depois, é só clicar nele.'
      : 'O ícone do Lex Audio foi colocado nos Favoritos da barra. Se não aparecer, procure "Lex Audio" no menu de aplicativos e escolha "Adicionar aos favoritos".';
  return (
    <p className="mx-auto mt-4 max-w-md rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-left text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
      <Pin className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> {text}
    </p>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-white/[0.06]">
      <span className="text-emerald-500">{icon}</span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{text}</p>
    </div>
  );
}
