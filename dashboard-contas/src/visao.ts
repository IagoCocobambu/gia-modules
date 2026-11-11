import { montarCatalogo, RAZOES, type Catalogo, type Direcao, type Unidade } from './catalogo'
import { fmtBRLCompacto, fmtMult, fmtPct } from './formato'
import { valorDe, type Agregado } from './matriz'
import type { RecorteCalculado } from './recorte'
import type { SerieDeContas } from './types'

// O que a Visão geral mostra, em funções puras: os CARTÕES, a COMPOSIÇÃO do
// faturamento e das despesas e a SÉRIE da evolução.
//
// ── DESPESAS TOTAIS = 2 + 3 + 4 ─────────────────────────────────────────────
//
// Matéria-prima, impostos e custos operacionais — tudo o que sai do faturamento
// para chegar ao 7 LUCRO LÍQUIDO (sem investimentos). É o que fecha a conta do
// cartão: faturamento − despesas = lucro. Os investimentos (5) ficam de fora,
// como no lucro.
//
// A composição das despesas usa os INDICADORES GERENCIAIS (10100 a 10700), que
// particionam exatamente essa soma: conferido no DW de produção em 18/09/2026, o
// 11000 (faturamento menos os gerenciais) é igual ao 7000 em todos os 1.800
// planos de jan/25 a ago/26.

export interface Cartao {
  id: string
  rotulo: string
  /**
   * O rótulo na FAIXA de indicadores, onde só há uma linha para dez itens:
   * "MP restaurante" no lugar de "Matéria-prima sobre venda restaurante". O
   * nome inteiro continua na dica e no gráfico.
   */
  curto?: string
  /** "Conta 10101" — a origem, no rodapé do cartão. */
  codigo: string
  ajuda: string
  unidade: Unidade
  direcao: Direcao
  /** Como a variação se lê: relativa (reais) ou em pontos (percentuais). */
  variacao: 'relativa' | 'pontos'
  calcular: (ag: Agregado, cat: Catalogo) => number | null
}

function razao(num: number | null, den: number | null): number | null {
  if (num == null || den == null || Math.abs(den) < 1e-9) return null
  return num / den
}

export function despesasTotais(ag: Agregado, cat: Catalogo): number | null {
  const partes = [2000, 3000, 4000].map((i) => valorDe(ag, cat, i))
  if (partes.every((p) => p == null)) return null
  return partes.reduce<number>((s, p) => s + (p ?? 0), 0)
}

const sobreFaturamento =
  (indice: number) =>
  (ag: Agregado, cat: Catalogo): number | null =>
    razao(valorDe(ag, cat, indice), valorDe(ag, cat, 1000))

/** Os quatro cartões grandes do topo. */
export const CARTOES_PRINCIPAIS: readonly Cartao[] = [
  {
    id: 'faturamento',
    rotulo: 'Faturamento total',
    codigo: 'Conta 1',
    ajuda: '1 FATURAMENTO: restaurante, delivery, eventos e as demais receitas das lojas na conta.',
    unidade: 'brl',
    direcao: 'maior',
    variacao: 'relativa',
    calcular: (ag, cat) => valorDe(ag, cat, 1000),
  },
  {
    id: 'despesas',
    rotulo: 'Despesas totais',
    codigo: 'Contas 2 + 3 + 4',
    ajuda:
      'Matéria-prima (2) + impostos (3) + custos operacionais (4): tudo o que sai do faturamento até o lucro líquido sem investimentos.',
    unidade: 'brl',
    direcao: 'menor',
    variacao: 'relativa',
    calcular: despesasTotais,
  },
  {
    id: 'lucro',
    rotulo: 'Lucro líquido',
    codigo: 'Conta 6 (7000)',
    ajuda:
      '6 LUCRO LÍQUIDO (sem investimentos): faturamento menos matéria-prima, impostos e custos operacionais.',
    unidade: 'brl',
    direcao: 'maior',
    variacao: 'relativa',
    calcular: (ag, cat) => valorDe(ag, cat, 7000),
  },
  {
    id: 'rentabilidade',
    rotulo: 'Rentabilidade',
    codigo: 'Conta 10000',
    ajuda:
      '10000 RENTABILIDADE: lucro líquido (sem investimentos) ÷ faturamento, recalculado sobre as somas das lojas na conta.',
    unidade: 'pct',
    direcao: 'maior',
    variacao: 'pontos',
    calcular: (ag, cat) => valorDe(ag, cat, 10000),
  },
]

/** Os cartões menores: os percentuais do plano e os indicadores gerenciais. */
export const CARTOES_INDICADORES: readonly Cartao[] = [
  {
    id: 'cmv',
    rotulo: 'Matéria-prima (CMV)',
    curto: 'CMV',
    codigo: 'Conta 2 ÷ 1',
    ajuda: '2 MATÉRIA-PRIMA sobre o faturamento.',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: sobreFaturamento(2000),
  },
  {
    id: 'labor',
    rotulo: 'Labor',
    curto: 'Labor',
    codigo: 'Conta 10200 ÷ 1',
    ajuda:
      '10200 LABOR sobre o faturamento. O labor é a folha (4.1) mais encargos (3.2), indiretos de pessoal (4.2), vale-transporte, 13º, férias e rescisões.',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: sobreFaturamento(10200),
  },
  {
    id: 'impostos',
    rotulo: 'Impostos',
    curto: 'Impostos',
    codigo: 'Conta 3 ÷ 1',
    ajuda: '3 IMPOSTOS (sobre faturamento, folha e insumos) sobre o faturamento.',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: sobreFaturamento(3000),
  },
  {
    id: 'custos',
    rotulo: 'Custos operacionais',
    curto: 'Custos op.',
    codigo: 'Conta 4 ÷ 1',
    ajuda: '4 CUSTOS OPERACIONAIS sobre o faturamento.',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: sobreFaturamento(4000),
  },
  {
    id: 'lucro-c-invest',
    rotulo: 'Lucro líq. com investimentos',
    curto: 'Lucro c/ inv.',
    codigo: 'Conta 7 ÷ 1',
    ajuda: '7 LUCRO LÍQUIDO (descontando os investimentos) sobre o faturamento.',
    unidade: 'pct',
    direcao: 'maior',
    variacao: 'pontos',
    calcular: sobreFaturamento(8000),
  },
  {
    id: 'rentabilidade-estoque',
    rotulo: 'Rentabilidade (variação de estoque)',
    curto: 'Rent. c/ estoque',
    codigo: 'Conta 10001',
    ajuda:
      '10001: (lucro líquido sem investimentos + variação de estoque 10103) ÷ faturamento. Corrige o resultado pelo estoque que entrou ou saiu no período.',
    unidade: 'pct',
    direcao: 'maior',
    variacao: 'pontos',
    calcular: (ag, cat) => valorDe(ag, cat, 10001),
  },
  {
    id: 'mp-restaurante',
    rotulo: 'Matéria-prima sobre venda restaurante',
    curto: 'MP restaurante',
    codigo: 'Conta 10101',
    ajuda:
      '10101: matéria-prima ÷ faturamento do restaurante (o total menos couvert, taxas de entrega, parquinho, estacionamento, gorjeta e outras receitas).',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: (ag, cat) => valorDe(ag, cat, 10101),
  },
  {
    id: 'motoboy-delivery',
    rotulo: 'Motoboy sobre receita de delivery',
    curto: 'Motoboy/delivery',
    codigo: 'Conta 20001',
    ajuda: '20001: 4.10.1 Motoboys delivery ÷ 1.2 DELIVERY.',
    unidade: 'pct',
    direcao: 'menor',
    variacao: 'pontos',
    calcular: (ag, cat) => valorDe(ag, cat, 20001),
  },
  {
    id: 'vinhos',
    rotulo: 'Receita com vinhos / despesa com vinho',
    curto: 'Vinhos',
    codigo: 'Conta 20002',
    ajuda:
      '20002: 1.1.3 Vinhos (receita) ÷ 2.2.2 Vinhos (despesa). Quantas vezes a venda de vinho cobre o custo do vinho.',
    unidade: 'mult',
    direcao: 'maior',
    variacao: 'relativa',
    calcular: (ag, cat) => valorDe(ag, cat, 20002),
  },
  {
    id: 'couvert',
    rotulo: 'Receita com couvert / despesa com músicos',
    curto: 'Couvert',
    codigo: 'Conta 20003',
    ajuda:
      '20003: 1.1.4 Couvert artístico ÷ 4.10.2 Músicos. Quantas vezes o couvert cobre o custo da música.',
    unidade: 'mult',
    direcao: 'maior',
    variacao: 'relativa',
    calcular: (ag, cat) => valorDe(ag, cat, 20003),
  },
]

/** A variação de um cartão: relativa em reais e múltiplos, em pontos nos percentuais. */
export function variacaoDoCartao(
  cartao: Pick<Cartao, 'variacao'>,
  atual: number | null,
  anterior: number | null
): number | null {
  if (atual == null || anterior == null) return null
  if (cartao.variacao === 'pontos') return atual - anterior
  if (Math.abs(anterior) < 1e-9) return null
  return (atual - anterior) / Math.abs(anterior)
}

/** Todos os cartões por id — a faixa guarda o id do indicador escolhido. */
export const CARTAO_POR_ID: ReadonlyMap<string, Cartao> = new Map(
  [...CARTOES_PRINCIPAIS, ...CARTOES_INDICADORES].map((c) => [c.id, c])
)

/** O número de um cartão e a variação dele — a mesma conta no cartão e na faixa. */
export function medirCartao(
  cartao: Cartao,
  recorte: RecorteCalculado,
  cat: Catalogo
): { valor: number | null; variacao: number | null } {
  const valor = cartao.calcular(recorte.consolidado, cat)
  const variacao =
    recorte.nasDuasPontas.size > 0
      ? variacaoDoCartao(
          cartao,
          cartao.calcular(recorte.mesmasAtual, cat),
          cartao.calcular(recorte.mesmasAnterior, cat)
        )
      : null
  return { valor, variacao }
}

/** O valor de um cartão na unidade dele. */
export function formatarCartao(cartao: Pick<Cartao, 'unidade'>, v: number | null): string {
  if (cartao.unidade === 'pct') return fmtPct(v)
  if (cartao.unidade === 'mult') return fmtMult(v)
  return fmtBRLCompacto(v)
}

// ── COMPOSIÇÃO ──────────────────────────────────────────────────────────────

export interface ParteDaComposicao {
  indice: number
  nome: string
}

/** As áreas do faturamento: os filhos diretos da conta 1. */
export const PARTES_DO_FATURAMENTO: readonly ParteDaComposicao[] = [
  { indice: 1100, nome: 'Restaurante' },
  { indice: 1200, nome: 'Delivery' },
  { indice: 1300, nome: 'Eventos' },
  { indice: 1400, nome: 'Compra coletiva' },
  { indice: 1500, nome: 'Parquinho' },
  { indice: 1600, nome: 'Estacionamento / vallet' },
  { indice: 1700, nome: 'Gorjeta' },
  { indice: 1800, nome: 'Outras receitas' },
]

/** As despesas pelos indicadores gerenciais, que somam exatamente 2 + 3 + 4. */
export const PARTES_DAS_DESPESAS: readonly ParteDaComposicao[] = [
  { indice: 10100, nome: 'Matéria-prima' },
  { indice: 10200, nome: 'Labor' },
  { indice: 10300, nome: 'Ocupação e indiretos' },
  { indice: 10400, nome: 'Impostos' },
  { indice: 10500, nome: 'Administrativas' },
  { indice: 10601, nome: 'Marketing' },
  { indice: 10602, nome: 'Despesas financeiras' },
  { indice: 10603, nome: 'Outras despesas' },
  { indice: 10700, nome: 'Despesas corporativas' },
]

export interface LinhaDaComposicao {
  indice: number
  nome: string
  valor: number
  /** Parte do total da composição (faturamento, ou despesas totais). */
  participacao: number | null
  /** Variação relativa do valor contra o período anterior, nas mesmas lojas. */
  variacao: number | null
}

export function composicao(
  partes: readonly ParteDaComposicao[],
  atual: Agregado,
  mesmasAtual: Agregado | null,
  mesmasAnterior: Agregado | null,
  cat: Catalogo
): { linhas: LinhaDaComposicao[]; total: number; variacaoTotal: number | null } {
  const valor = (ag: Agregado, i: number) => valorDe(ag, cat, i) ?? 0
  const total = partes.reduce((s, p) => s + valor(atual, p.indice), 0)
  const linhas = partes
    .map((p) => {
      const v = valor(atual, p.indice)
      const a = mesmasAtual ? valor(mesmasAtual, p.indice) : null
      const b = mesmasAnterior ? valor(mesmasAnterior, p.indice) : null
      return {
        indice: p.indice,
        nome: p.nome,
        valor: v,
        participacao: Math.abs(total) < 1e-9 ? null : v / total,
        variacao: a == null || b == null || Math.abs(b) < 1e-9 ? null : (a - b) / Math.abs(b),
      }
    })
    .sort((x, y) => y.valor - x.valor)
  const somaA = mesmasAtual ? partes.reduce((s, p) => s + valor(mesmasAtual, p.indice), 0) : null
  const somaB = mesmasAnterior
    ? partes.reduce((s, p) => s + valor(mesmasAnterior, p.indice), 0)
    : null
  const variacaoTotal =
    somaA == null || somaB == null || Math.abs(somaB) < 1e-9
      ? null
      : (somaA - somaB) / Math.abs(somaB)
  return { linhas, total, variacaoTotal }
}

// ── SÉRIE DA EVOLUÇÃO ───────────────────────────────────────────────────────

/** Um mês da evolução, para as lojas na conta que têm plano nele. */
export interface PontoDaSerie {
  ano: number
  mes: number
  /** Quantas lojas da conta têm plano no mês. */
  lojas: number
  /** O agregado do mês; `null` = nenhuma loja da conta tem plano nele. */
  ag: Agregado | null
}

export interface SerieCalculada {
  /**
   * O catálogo DA SÉRIE: só as contas que o handler desce, mais as razões. É
   * ele que `Cartao.calcular` recebe ao desenhar um indicador no tempo —
   * qualquer conta fora dele valeria zero em silêncio, e é por isso que o
   * handler desce todas as parcelas das razões (ver `src/server/serie.ts`).
   */
  cat: Catalogo
  pontos: PontoDaSerie[]
}

const CATALOGOS_DA_SERIE = new WeakMap<SerieDeContas, Catalogo>()

function catalogoDaSerie(serie: SerieDeContas): Catalogo {
  let cat = CATALOGOS_DA_SERIE.get(serie)
  if (!cat) {
    // As razões entram mesmo sem vir do servidor: elas são CALCULADAS, e
    // precisam de uma posição no vetor para `valores()` escrever nelas.
    const indices = [...new Set([...serie.contas, ...RAZOES.keys()])]
    cat = montarCatalogo(
      indices.map((indice) => ({
        indice,
        formatado: String(indice),
        descricao: '',
        isInput: false,
        isGroup: false,
      }))
    )
    CATALOGOS_DA_SERIE.set(serie, cat)
  }
  return cat
}

/**
 * A evolução mês a mês das lojas `refs`. Cada mês soma as lojas COM PLANO nele —
 * loja sem plano no mês é ausência, e o número de lojas vai junto para a dica
 * dizer quantas entraram.
 *
 * O mês vira um `Agregado` como o de qualquer recorte, então o mesmo
 * `Cartao.calcular` que faz o número do cartão faz o ponto da linha: uma regra
 * só, e nenhuma chance de o cartão e o gráfico discordarem.
 */
export function serieDasLojas(serie: SerieDeContas, refs: ReadonlySet<string>): SerieCalculada {
  const cat = catalogoDaSerie(serie)
  const n = cat.contas.length
  const destino = serie.contas.map((c) => cat.pos.get(c) ?? -1)
  const pontos = serie.meses.map(({ ano, mes }, i) => {
    const bruto = new Float64Array(n)
    const comPlano: string[] = []
    for (const loja of serie.lojas) {
      if (!refs.has(loja.ref)) continue
      const v = loja.porMes[i]
      if (!v) continue
      comPlano.push(loja.ref)
      for (let j = 0; j < v.length; j += 1) {
        const p = destino[j]!
        if (p >= 0) bruto[p] += v[j] ?? 0
      }
    }
    if (comPlano.length === 0) return { ano, mes, lojas: 0, ag: null }
    // Um mês só: a média mensal de cada loja é o próprio mês.
    return {
      ano,
      mes,
      lojas: comPlano.length,
      ag: { bruto, mediaMensal: new Float64Array(bruto), refs: comPlano },
    }
  })
  return { cat, pontos }
}

/** O valor de um cartão num mês da série; `null` no mês sem loja com plano. */
export function valorNoMes(cartao: Cartao, ponto: PontoDaSerie, cat: Catalogo): number | null {
  return ponto.ag ? cartao.calcular(ponto.ag, cat) : null
}

/** A série de um cartão nos meses da evolução — o risquinho e a linha do tempo. */
export function serieDoCartao(cartao: Cartao, serie: SerieCalculada): Array<number | null> {
  return serie.pontos.map((p) => valorNoMes(cartao, p, serie.cat))
}
