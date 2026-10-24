/**
 * Perfil do usuário: dados profissionais usados no cabeçalho e na assinatura
 * dos relatórios exportados. Fica guardado apenas neste computador.
 */
export interface ProfileLogo {
  /** imagem PNG em data URL, já reduzida */
  dataUrl: string;
  width: number;
  height: number;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  profession: string;
  /** ex.: OAB/PA 12.345 */
  registry: string;
  cpf: string;
  office: string;
  cnpj: string;
  /** cidade usada na data da assinatura, ex.: Belém/PA */
  city: string;
  logo?: ProfileLogo;
  /** opções do relatório */
  letterhead: boolean;
  signature: boolean;
}

export const EMPTY_PROFILE: Profile = {
  name: '',
  email: '',
  phone: '',
  profession: '',
  registry: '',
  cpf: '',
  office: '',
  cnpj: '',
  city: '',
  letterhead: true,
  signature: true,
};

const KEY = 'lex-profile';
export const PROFILE_EVENT = 'lex-profile-change';

export function loadProfile(): Profile {
  try {
    return { ...EMPTY_PROFILE, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export function hasProfile(p: Profile): boolean {
  return Boolean(p.name.trim() || p.office.trim() || p.logo);
}

// ---------- CPF / CNPJ ----------

const digits = (v: string) => v.replace(/\D/g, '');

export function formatCpf(v: string): string {
  const d = digits(v);
  if (d.length !== 11) return v.trim();
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(v: string): string {
  const d = digits(v);
  if (d.length !== 14) return v.trim();
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function isValidCpf(v: string): boolean {
  const d = digits(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export function isValidCnpj(v: string): boolean {
  const d = digits(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + w * Number(d[i]), 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return check(12) === Number(d[12]) && check(13) === Number(d[13]);
}

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ---------- Logo ----------

const MAX_W = 800;
const MAX_H = 400;

/** Lê uma imagem (PNG, JPG, WEBP ou SVG), reduz e converte para PNG. */
export async function processLogo(file: File): Promise<ProfileLogo> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (PNG, JPG, WEBP ou SVG).');
  if (file.size > 10 * 1024 * 1024) throw new Error('A imagem tem mais de 10 MB. Escolha uma menor.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      i.src = url;
    });
    const w0 = img.naturalWidth || 400;
    const h0 = img.naturalHeight || 200;
    const scale = Math.min(1, MAX_W / w0, MAX_H / h0);
    const width = Math.max(1, Math.round(w0 * scale));
    const height = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL('image/png'), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(',')[1] ?? '');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
