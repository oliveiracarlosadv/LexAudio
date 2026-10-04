import { Award, BookOpen, Briefcase, ExternalLink, GraduationCap, Lock, Scale, ShieldCheck, WifiOff, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { OliveMark } from '../components/Logo';

const FORMACAO = [
  { period: '2025 – 2026', title: 'Pós-graduação em Direito Tributário e Processo Tributário', place: 'Faculdade Legale (FALEG), São Paulo' },
  { period: '2023 – 2024', title: 'Especialização em Direito e Processo do Trabalho', place: 'Universidade da Amazônia (UNAMA), Belém' },
  { period: '2021 – 2022', title: 'Especialização em Direito Penal e Processo Penal', place: 'Centro Universitário Internacional (UNINTER), Curitiba' },
  { period: '2020 – 2021', title: 'Especialização em Direito Penal e Criminologia', place: 'Instituto de Criminologia e Política Criminal (ICPC), Curitiba' },
  { period: '2015 – 2019', title: 'Bacharelado em Direito', place: 'Estácio FAP, Belém — TCC: “A falibilidade do instituto do reconhecimento de pessoas no processo criminal”' },
];

const ATUACAO = [
  { period: '2026 – atual', title: 'Carlos A. A. Oliveira — Assessoria e Consultoria Jurídica', role: 'Advogado especialista, com ênfase em compliance empresarial e trabalhista' },
  { period: '2020 – 2026', title: 'Sampaio & Oliveira Advogados', role: 'Sócio · advogado criminalista e trabalhista · coordenador geral, planejamento e marketing' },
  { period: '2017 – 2019', title: 'Centro de Perícias Científicas Renato Chaves', role: 'Servidor público · assistente de coordenação' },
  { period: '2017 – 2018', title: 'Instituto Brasileiro de Ciências Criminais (IBCCRIM)', role: 'Laboratório de Ciências Criminais (360 h)' },
];

const PILARES = [
  { icon: WifiOff, title: '100% offline', text: 'Depois de instalado, funciona sem internet — no escritório, no fórum ou em viagem.' },
  { icon: Lock, title: 'Sigilo preservado', text: 'Nenhum áudio ou texto sai do computador. Compatível com o dever de sigilo profissional e com a LGPD.' },
  { icon: Zap, title: 'IA de ponta', text: 'Whisper.cpp compilado para WebAssembly, com SIMD e processamento em múltiplos núcleos.' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50/60 px-6 py-10 sm:px-10 dark:border-white/[0.06] dark:from-ink-900 dark:to-emerald-950/30">
        <OliveMark className="h-12 w-40" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Sobre o Lex Audio</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          O Lex Audio é uma ferramenta profissional de transcrição de áudio para texto que roda inteiramente no seu computador. Foi
          pensado para quem lida diariamente com informações sensíveis — mensagens de clientes, depoimentos, reuniões e audiências — e
          não pode abrir mão da confidencialidade.
        </p>
        <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">“Transforme áudio em texto. Totalmente offline.”</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PILARES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <Icon className="h-5 w-5 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">O criador</p>
        <div className="mt-3 card p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-xl font-semibold text-white">
              CA
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight">Carlos Alexandre Albuquerque Oliveira</h2>
              <p className="mt-0.5 text-sm text-zinc-500">Advogado · Belém, Pará</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn-outline py-1.5 text-xs" href="https://lattes.cnpq.br/4151018791454248" target="_blank" rel="noreferrer">
                  Currículo Lattes <ExternalLink className="h-3 w-3" />
                </a>
                <a className="btn-outline py-1.5 text-xs" href="https://orcid.org/0000-0003-0680-4424" target="_blank" rel="noreferrer">
                  ORCID <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
            <p>
              Carlos Alexandre Albuquerque Oliveira é advogado militante, com experiência consolidada nas áreas cível, trabalhista e
              penal. Bacharel em Direito pela Estácio FAP (2019) e inscrito na Ordem dos Advogados do Brasil desde 2022, atua desde
              junho de 2026 de forma autônoma sob a denominação <em>Carlos A. A. Oliveira — Assessoria e Consultoria Jurídica</em>, com
              ênfase em compliance empresarial e trabalhista.
            </p>
            <p>
              É especialista em Direito Penal e Criminologia (ICPC, 2021), em Direito Penal e Processo Penal (UNINTER, 2022) e em
              Direito e Processo do Trabalho (UNAMA, 2024), e cursa pós-graduação em Direito Tributário e Processo Tributário. Dedica-se à
              gestão jurídica, ao compliance trabalhista, a procedimentos estratégicos na advocacia e à estruturação de programas de
              integridade corporativa.
            </p>
            <p>
              Foi sócio do escritório Sampaio &amp; Oliveira Advogados, com atuação direta em demandas consultivas e contenciosas e na
              coordenação geral, planejamento e marketing. Ex-servidor público, passou pela Polícia Civil e pelo Centro de Perícias
              Científicas Renato Chaves, acumulando experiência em gestão de unidades, cadeia de custódia, procedimentos administrativos
              e transferência de provas. Integrou o Laboratório de Ciências Criminais do IBCCRIM (2017–2018).
            </p>
            <p>
              A formação complementar em proteção de dados — LGPD, proteção de dados no setor público e a transformação da fé pública
              pela digitalização — está na origem do Lex Audio: uma ferramenta que leva a transcrição por inteligência artificial à rotina
              jurídica sem expor o conteúdo de clientes a serviços de nuvem de terceiros.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Timeline icon={<GraduationCap className="h-4 w-4" />} title="Formação acadêmica" items={FORMACAO.map((f) => ({ period: f.period, title: f.title, sub: f.place }))} />
        <Timeline icon={<Briefcase className="h-4 w-4" />} title="Atuação profissional" items={ATUACAO.map((a) => ({ period: a.period, title: a.title, sub: a.role }))} />
      </section>

      <section className="card p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Award className="h-4 w-4 text-emerald-500" /> Formação complementar em destaque
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2 dark:text-zinc-400">
          {[
            'Formação do Advogado Trabalhista — FALEG (60 h)',
            'Execução Penal — ESMPU (30 h)',
            'Lei Geral de Proteção de Dados: noções introdutórias — ESA-PA',
            'Proteção de Dados no Setor Público — ESA-DF',
            'A Efetivação da Proteção de Dados no Brasil e no Mundo — ESA-DF',
            'Defesa dos Direitos Humanos no Ciberespaço — ESA-DF',
            'SEEU: Sistema Eletrônico de Execução Unificado — STJ',
            'Direito Penal Tributário — EBRADI',
          ].map((c) => (
            <li key={c} className="flex gap-2">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Scale className="h-4 w-4 text-emerald-500" /> Tecnologia
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          React, TypeScript, Vite e Tailwind CSS na interface; Whisper.cpp (OpenAI Whisper em C/C++) compilado para WebAssembly como
          motor de reconhecimento de fala; FFmpeg.wasm para converter áudios de WhatsApp, Telegram, Signal e gravadores; IndexedDB para o
          histórico local; Service Worker para funcionamento offline e instalação como aplicativo (PWA).
        </p>
        <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5" /> Lex Audio v{__APP_VERSION__} · © {new Date().getFullYear()} Carlos Alexandre Albuquerque Oliveira
        </p>
      </section>
    </div>
  );
}

function Timeline({ icon, title, items }: { icon: ReactNode; title: string; items: { period: string; title: string; sub: string }[] }) {
  return (
    <div className="card p-6">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-emerald-500">{icon}</span> {title}
      </p>
      <ol className="relative mt-5 space-y-5 border-l border-zinc-200 pl-5 dark:border-white/10">
        {items.map((i) => (
          <li key={i.title} className="relative">
            <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
            <p className="font-mono text-[11px] text-zinc-400">{i.period}</p>
            <p className="text-sm font-medium">{i.title}</p>
            <p className="text-xs leading-relaxed text-zinc-500">{i.sub}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
