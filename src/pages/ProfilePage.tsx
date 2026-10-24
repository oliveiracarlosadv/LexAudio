import { Building2, Check, FileText, ImagePlus, Loader2, Save, Trash2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { PageHeader } from '../components/ui';
import { useProfile } from '../hooks/useProfile';
import { exportSample } from '../lib/export';
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  processLogo,
  type Profile,
} from '../lib/profile';
import { formatPhone } from '../lib/utils';

type TextKey = Exclude<keyof Profile, 'logo' | 'letterhead' | 'signature'>;

export function validateProfile(p: Profile): Partial<Record<TextKey, string>> {
  const e: Partial<Record<TextKey, string>> = {};
  if (p.email.trim() && !isValidEmail(p.email)) e.email = 'E-mail inválido.';
  if (p.cpf.trim() && !isValidCpf(p.cpf)) e.cpf = 'CPF inválido. Confira os números.';
  if (p.cnpj.trim() && !isValidCnpj(p.cnpj)) e.cnpj = 'CNPJ inválido. Confira os números.';
  return e;
}

export function ProfilePage() {
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<'logo' | 'sample' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(profile), [profile]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const set = (patch: Partial<Profile>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus(null);
  };

  const onSave = () => {
    const clean: Profile = {
      ...draft,
      phone: formatPhone(draft.phone),
      cpf: formatCpf(draft.cpf),
      cnpj: formatCnpj(draft.cnpj),
      email: draft.email.trim(),
    };
    const errs = validateProfile(clean);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus({ ok: false, text: 'Corrija os campos destacados.' });
      return;
    }
    const err = save(clean);
    setStatus(err ? { ok: false, text: err } : { ok: true, text: 'Perfil salvo neste computador.' });
  };

  const onLogo = async (file?: File) => {
    if (!file) return;
    setBusy('logo');
    try {
      set({ logo: await processLogo(file) });
    } catch (e) {
      setStatus({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const onSample = async () => {
    setBusy('sample');
    try {
      await exportSample(draft);
    } finally {
      setBusy(null);
    }
  };

  const field = (key: TextKey, label: string, props: Partial<InputHTMLAttributes<HTMLInputElement>> = {}, format?: (v: string) => string) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      <input
        className={`input w-full ${errors[key] ? 'border-rose-500/70' : ''}`}
        value={draft[key]}
        onChange={(e) => set({ [key]: e.target.value })}
        onBlur={format ? () => set({ [key]: format(draft[key]) }) : undefined}
        {...props}
      />
      {errors[key] && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <PageHeader
        title="Perfil"
        subtitle="Seus dados aparecem no cabeçalho e na assinatura dos relatórios em PDF e Word. Ficam guardados apenas neste computador."
        actions={
          <>
            <button className="btn-outline" onClick={() => void onSample()} disabled={busy === 'sample'}>
              {busy === 'sample' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Ver exemplo em PDF
            </button>
            <button className="btn-primary" onClick={onSave} disabled={!dirty}>
              <Save className="h-4 w-4" /> Salvar
            </button>
          </>
        }
      />

      {status && (
        <p className={`mb-4 flex items-center gap-1.5 text-sm ${status.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {status.ok && <Check className="h-4 w-4" />} {status.text}
        </p>
      )}

      <div className="space-y-5">
        <Section icon={<UserRound className="h-4 w-4" />} title="Dados pessoais">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{field('name', 'Nome completo', { placeholder: 'Ex.: Maria da Silva Souza', autoComplete: 'name' })}</div>
            {field('email', 'E-mail', { type: 'email', placeholder: 'nome@exemplo.com.br', autoComplete: 'email' })}
            {field('phone', 'Telefone', { type: 'tel', inputMode: 'tel', placeholder: '(91) 99999-9999', autoComplete: 'tel' }, formatPhone)}
            {field('profession', 'Profissão', { placeholder: 'Ex.: Advogado(a)' })}
            {field('registry', 'Número de registro profissional', { placeholder: 'Ex.: OAB/PA 12.345' })}
            {field('cpf', 'CPF', { inputMode: 'numeric', placeholder: '000.000.000-00' }, formatCpf)}
            {field('city', 'Cidade (para a data da assinatura)', { placeholder: 'Ex.: Belém/PA' })}
          </div>
        </Section>

        <Section icon={<Building2 className="h-4 w-4" />} title="Escritório">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('office', 'Nome do escritório', { placeholder: 'Ex.: Souza & Lima Advogados' })}
            {field('cnpj', 'CNPJ', { inputMode: 'numeric', placeholder: '00.000.000/0000-00' }, formatCnpj)}
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-xs font-medium text-zinc-500">Logo (aparece no cabeçalho dos relatórios)</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-white p-2 dark:border-white/15">
                {draft.logo ? (
                  <img src={draft.logo.dataUrl} alt="Logo do escritório" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-zinc-400">Sem logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button className="btn-outline" onClick={() => fileInput.current?.click()} disabled={busy === 'logo'}>
                  {busy === 'logo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {draft.logo ? 'Trocar logo' : 'Escolher logo'}
                </button>
                {draft.logo && (
                  <button className="btn-ghost text-rose-600 dark:text-rose-400" onClick={() => set({ logo: undefined })}>
                    <Trash2 className="h-4 w-4" /> Remover logo
                  </button>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => void onLogo(e.target.files?.[0])}
                />
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-zinc-500">PNG, JPG, WEBP ou SVG. Prefira imagem horizontal com fundo branco ou transparente.</p>
            </div>
          </div>
        </Section>

        <Section icon={<FileText className="h-4 w-4" />} title="Relatório">
          <div className="space-y-3">
            <Toggle checked={draft.letterhead} onChange={(v) => set({ letterhead: v })} label="Cabeçalho com logo e dados do escritório em todas as páginas" />
            <Toggle checked={draft.signature} onChange={(v) => set({ signature: v })} label="Bloco de assinatura com nome, profissão, registro e CPF ao final" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <span className="text-emerald-500">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
