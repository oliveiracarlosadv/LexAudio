import type { ReactNode } from 'react';

/** Renderizador mínimo de Markdown para os documentos legais embutidos no app (títulos, listas, tabelas). */
export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const cls = ['text-xl font-semibold', 'mt-6 text-base font-semibold', 'mt-4 text-sm font-semibold'][level - 1];
      blocks.push(
        <p key={i} className={cls}>
          {inline(heading[2])}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|\s*-/.test(lines[i])) rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>{head.map((c, k) => <th key={k} className="border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, k) => (
                <tr key={k}>{r.map((c, j) => <td key={j} className="border border-zinc-200 px-2 py-1.5 align-top dark:border-white/10">{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ''));
      blocks.push(
        <ul key={i} className="list-disc space-y-1 pl-5">
          {items.map((it, k) => <li key={k}>{inline(it)}</li>)}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||[-*]\s)/.test(lines[i])) para.push(lines[i++].replace(/^>\s?/, ''));
    blocks.push(<p key={i}>{inline(para.join(' '))}</p>);
  }
  return <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{blocks}</div>;
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s)]+|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, k) => {
    if (p.startsWith('**')) return <strong key={k}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`')) return <code key={k} className="rounded bg-zinc-100 px-1 text-[0.85em] dark:bg-white/10">{p.slice(1, -1)}</code>;
    if (/^\*[^*]/.test(p)) return <em key={k}>{p.slice(1, -1)}</em>;
    if (p.startsWith('http')) return <a key={k} href={p} target="_blank" rel="noreferrer" className="text-emerald-600 underline dark:text-emerald-400">{p}</a>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <span key={k} className="font-medium">{link[1]}</span>;
    return p;
  });
}
