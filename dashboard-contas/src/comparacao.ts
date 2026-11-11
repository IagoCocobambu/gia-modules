import type { Direcao, Unidade } from './catalogo'

// As regras da aba Comparativos: a REFERÊNCIA de cada linha, a ESCALA DE COR da
// diferença e as OPORTUNIDADES EM R$. Puro, sem React — os testes leem daqui.
//
// ── A REFERÊNCIA É A MÉDIA DAS LOJAS SELECIONADAS ───────────────────────────
//
// Decisão do João (18/09/2026): cada coluna se compara com a MÉDIA DAS LOJAS
// selecionadas no topo. A MÉDIA é o índice médio — a linha somada sobre o
// faturamento somado (ver `comparativos.ts`) —, e melhor e pior saem do % de cada loja, com cada loja
// pesando igual (a "loja típica"). É diferente do % do consolidado, que é soma
// sobre soma e pesa pelo faturamento; os dois aparecem na tela com esses nomes.
//
// A referência é sempre calculada sobre LOJAS, mesmo com as colunas agrupadas
// por região ou estado: "SPC está 1,2 p.p. acima da loja média".
//
// ── E A MÉDIA DO GRUPO ──────────────────────────────────────────────────────
//
// Pedido do Davi Nascimento (20/10/2026): comparar também com a média do GRUPO
// INTEIRO — todas as lojas da rede, marcadas ou não. É o mesmo índice médio da
// seleção (a linha somada sobre o faturamento somado), só que sobre o grupo:
// a coluna MÉDIA GRUPO do BI mensal. Escolhida, ela abre o bloco "Grupo" ao lado
// do das lojas selecionadas, com a média, a melhor e a pior loja da rede (João,
// 20/10/2026); a distância de cada coluna se mede contra a MÉDIA do grupo.
//
// Melhor e pior seguem a direção do bom da linha; informativo não tem nem um
// nem outro. Loja sem dado na linha (razão sem base) fica fora das três.

export type Referencia = 'media' | 'melhor' | 'pior' | 'grupo'

export interface Referencias {
  media: number | null
  melhor: number | null
  pior: number | null
  /**
   * Quantos PONTOS DA RÉGUA entraram na conta da linha — lojas, ou meses quando
   * a régua é de meses (ver `reguaDaComparacao`). O nome ficou do tempo em que
   * só havia o eixo das lojas.
   */
  lojas: number
  /**
   * O índice médio do GRUPO inteiro — todas as lojas da rede, marcadas ou não.
   * Só existe com "Média do grupo" escolhida; sem ela, ausente. Mora aqui para
   * `ref[referencia]` valer com qualquer referência; o bloco "Grupo" inteiro
   * (média, melhor e pior) está em `LinhaComparada.grupo`.
   */
  grupo?: number | null
}

export function referencias(valores: ReadonlyArray<number | null>, direcao: Direcao): Referencias {
  const v = valores.filter((x): x is number => x != null && Number.isFinite(x))
  if (v.length === 0) return { media: null, melhor: null, pior: null, lojas: 0 }
  const media = v.reduce((a, b) => a + b, 0) / v.length
  if (direcao === 'neutra') return { media, melhor: null, pior: null, lojas: v.length }
  const max = Math.max(...v)
  const min = Math.min(...v)
  return direcao === 'maior'
    ? { media, melhor: max, pior: min, lojas: v.length }
    : { media, melhor: min, pior: max, lojas: v.length }
}

/**
 * A intensidade da diferença: 0 = ruído, 1 a 4 = cada vez mais longe da
 * referência. Faixas do HTML de especificação — em pontos percentuais 0,2 / 0,4
 * / 0,8 / 1,6; em dias (DIO) 2 / 4 / 8 / 16. O múltiplo (vinhos, couvert) usa a
 * mesma régua dos percentuais, como o HTML.
 */
export function intensidade(diferenca: number, unidade: Unidade | 'dias'): 0 | 1 | 2 | 3 | 4 {
  const a = unidade === 'dias' ? Math.abs(diferenca) : Math.abs(diferenca) * 100
  const faixas = unidade === 'dias' ? [2, 4, 8, 16] : [0.2, 0.4, 0.8, 1.6]
  if (a < faixas[0]!) return 0
  if (a < faixas[1]!) return 1
  if (a < faixas[2]!) return 2
  if (a < faixas[3]!) return 3
  return 4
}

/** A diferença está a favor? `null` = sem direção ou sem diferença. */
export function aFavor(diferenca: number, direcao: Direcao): boolean | null {
  if (direcao === 'neutra' || diferenca === 0) return null
  return direcao === 'maior' ? diferenca > 0 : diferenca < 0
}

// ── A ESCALA DE COR ─────────────────────────────────────────────────────────
//
// Uma regra só para as duas grades que mostram diferença (Comparativos e Por
// índice): a COR vem da direção do bom da linha, e a INTENSIDADE, da distância.
// Classes em texto puro, sem `cn`: este arquivo não conhece React nem a SDK.

const TONS_A_FAVOR = [
  '',
  'bg-success/10 text-success',
  'bg-success/20 text-success',
  'bg-success/30 text-success',
  'bg-success text-success-foreground',
]
const TONS_CONTRA = [
  '',
  'bg-destructive/10 text-destructive',
  'bg-destructive/20 text-destructive',
  'bg-destructive/30 text-destructive',
  'bg-destructive text-destructive-foreground',
]

export function classeDaDiferenca(
  diferenca: number,
  direcao: Direcao,
  unidade: Unidade | 'dias',
  /**
   * Só o lado CONTRA ganha cor — é o modo "Em R$", onde a cor pertence às
   * oportunidades e a vantagem vira texto discreto (como no HTML de
   * especificação).
   */
  soContra = false
): { classe: string; favor: boolean | null } {
  const favor = aFavor(diferenca, direcao)
  const n = intensidade(diferenca, unidade)
  if (n === 0 || favor === null) return { classe: 'text-muted-foreground', favor }
  if (favor && soContra) return { classe: 'text-muted-foreground', favor }
  const tons = favor ? TONS_A_FAVOR : TONS_CONTRA
  return { classe: `${tons[n]}${n === 4 ? ' font-semibold' : ''}`, favor }
}

/**
 * Quanto o resultado mudaria se a coluna tivesse o % da referência:
 * (% da referência − % da coluna) × base, com o sinal pela direção do bom.
 * Positivo = ganho disponível; negativo = a coluna já está melhor que a
 * referência. `null` sem base ou sem direção.
 */
export function oportunidade(
  pct: number | null,
  ref: number | null,
  base: number | null,
  direcao: Direcao
): number | null {
  if (pct == null || ref == null || base == null || direcao === 'neutra') return null
  const d = pct - ref
  return direcao === 'maior' ? -d * base : d * base
}

/**
 * Abaixo disto a oportunidade é a própria referência (ou ruído de centavos): a
 * célula fica em branco, como no HTML.
 */
export const OPORTUNIDADE_MINIMA = 500

// ── COMO A REFERÊNCIA SE LÊ NUMA FRASE ─────────────────────────────────────
//
// "Diferença para a média das lojas", "acima do melhor mês". Dois jogos, porque a
// régua pode ser das lojas ou dos meses de uma loja só (ver `reguaDaComparacao`).

/** A referência quando a régua são as lojas. */
export const NOME_DA_REFERENCIA: Record<Referencia, string> = {
  media: 'a média das lojas',
  melhor: 'a melhor loja',
  pior: 'a pior loja',
  grupo: 'a média do grupo',
}

/** O mesmo, quando a régua são os meses de uma loja só. */
export const NOME_POR_MES: Record<Referencia, string> = {
  media: 'a média dos meses',
  melhor: 'o melhor mês',
  pior: 'o pior mês',
  // O grupo é sempre de lojas, mesmo quando a régua da seleção vira de meses.
  grupo: 'a média do grupo',
}
