import type { FiltroSituacao, Mesa, Ordem, Situacao } from './types'

// Regras de exibição das mesas (docs/conceito.md §5, R6–R14). Só leitura: nada daqui
// volta ao servidor.

/**
 * Situação de UM contador (couvert ou buffet) contra as pessoas da mesa:
 * - 0 pessoas → Sem pessoas (R9), qualquer que seja o valor: não dá para conferir;
 * - igual às pessoas → Tudo lançado (R6);
 * - 0 → Sem lançamento (R7);
 * - senão → Divergente (R8).
 */
export function situacaoDoContador(pessoas: number, valor: number): Situacao {
  if (pessoas <= 0) return 'sem-pessoas'
  if (valor === pessoas) return 'tudo-lancado'
  if (valor === 0) return 'sem-lancamento'
  return 'divergente'
}

const PESO: Record<Situacao, number> = {
  divergente: 0,
  'sem-lancamento': 1,
  'sem-pessoas': 2,
  'tudo-lancado': 3,
}

/**
 * Situação da mesa: a pior entre o couvert e, na loja com itens de buffet
 * configurados, o buffet (R14 — suposição): Divergente > Sem lançamento > Tudo
 * lançado. O quadrinho do buffet aparece sempre (como no legado), mas em loja sem
 * buffet ele não conta: senão toda mesa ficaria "Sem lançamento".
 */
export function situacao(m: Mesa, temBuffet: boolean): Situacao {
  const couvert = situacaoDoContador(m.pessoas, m.couvert)
  if (!temBuffet) return couvert
  const buffet = situacaoDoContador(m.pessoas, m.buffet)
  return PESO[buffet] < PESO[couvert] ? buffet : couvert
}

/** Selo de um contador: `−2`, `+1`, ou nada. Mesa sem pessoas não tem selo de diferença. */
export function selo(pessoas: number, valor: number): string | null {
  if (pessoas <= 0 || situacaoDoContador(pessoas, valor) !== 'divergente') return null
  const d = valor - pessoas
  return d > 0 ? `+${d}` : `−${Math.abs(d)}`
}

export interface Contagem {
  todas: number
  divergente: number
  'sem-lancamento': number
  'sem-pessoas': number
  'tudo-lancado': number
}

/** Quantas mesas em cada situação, na pesquisa inteira (R11). */
export function contar(mesas: Mesa[], temBuffet: boolean): Contagem {
  const c: Contagem = {
    todas: mesas.length,
    divergente: 0,
    'sem-lancamento': 0,
    'sem-pessoas': 0,
    'tudo-lancado': 0,
  }
  for (const m of mesas) c[situacao(m, temBuffet)]++
  return c
}

const NOME = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

const porMesa = (a: Mesa, b: Mesa) =>
  NOME.compare(a.mesa, b.mesa) || (a.grupo ?? 0) - (b.grupo ?? 0)

/** Busca (R13), filtro do chip (R11) e ordem (R12). */
export function mesasVisiveis(
  mesas: Mesa[],
  temBuffet: boolean,
  filtro: FiltroSituacao,
  busca: string,
  ordem: Ordem
): Mesa[] {
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const lista = mesas.filter(
    (m) =>
      (filtro === 'todas' || situacao(m, temBuffet) === filtro) &&
      (!termo || m.mesa.toLocaleLowerCase('pt-BR').includes(termo))
  )
  const peso = (m: Mesa) => PESO[situacao(m, temBuffet)]
  return lista.sort(ordem === 'atencao' ? (a, b) => peso(a) - peso(b) || porMesa(a, b) : porMesa)
}

export const ROTULO_SITUACAO: Record<Situacao, string> = {
  divergente: 'Divergente',
  'sem-lancamento': 'Sem lançamento',
  'sem-pessoas': 'Sem pessoas',
  'tudo-lancado': 'Tudo lançado',
}
