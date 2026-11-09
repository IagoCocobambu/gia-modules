// Cores dos gráficos. SVG/CSS escritos à mão, e não de biblioteca: a `@gia-cb/ui`
// não tem gráfico e as bibliotecas pintam com cor própria, que briga com o tema
// do portal (trocado em tempo de execução por variável CSS). Com os tokens, claro
// e escuro saem certos sem configuração.
//
// Paleta categórica copiada do Reports Maestro (`reports-maestro/src/graficos.ts`),
// na mesma ordem de uso: primárias, secundárias e terciárias. Um gráfico com N
// séries usa as N primeiras; a cor nunca vai sozinha — toda fatia tem legenda
// com o nome e os números.

export const PALETA = [
  'var(--color-blue-500, #2b7fff)',
  'var(--color-red-500, #fb2c36)',
  'var(--color-yellow-400, #fdc700)',
  'var(--color-green-500, #00c950)',
  'var(--color-orange-500, #ff6900)',
  'var(--color-violet-500, #8e51ff)',
  'var(--color-orange-600, #f54900)',
  'var(--color-amber-500, #fe9a00)',
  'var(--color-lime-500, #7ccf00)',
  'var(--color-teal-500, #00bba7)',
  'var(--color-indigo-500, #615fff)',
  'var(--color-fuchsia-600, #c800de)',
] as const

/** Cor da série única (barras por hora). */
export const COR_SERIE = 'var(--color-primary)'

/** Cor da fatia `i`; passadas as 12 cores, as demais ficam cinza (a legenda diz o nome). */
export function corDaFatia(i: number): string {
  return PALETA[i] ?? 'var(--color-muted-foreground)'
}

export function formatPct(fracao: number): string {
  const pct = fracao * 100
  if (pct > 0 && pct < 1) return '<1%'
  return `${Math.round(pct)}%`
}
