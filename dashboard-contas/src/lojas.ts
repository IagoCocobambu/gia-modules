import type { Catalogo } from './catalogo'
import { consolidar, valorDe, type Agregado } from './matriz'
import type { RecorteCalculado } from './recorte'
import { despesasTotais } from './visao'

// O desempenho de cada LOJA e de cada REGIÃO — a tabela e os rankings do fim da
// Visão geral.
//
// A variação de cada linha compara a loja (ou a região) com ela mesma no período
// anterior, e só com as lojas que têm plano nos dois — a mesma regra dos cartões.
// Loja sem plano no período anterior mostra "—" na variação, não um número.

export interface LinhaDeDesempenho {
  chave: string
  nome: string
  /** Região da rede; vazio quando o cadastro não informa. */
  regiao: string
  /** Quantas lojas a linha soma (1 na loja). */
  lojas: number
  faturamento: number | null
  despesas: number | null
  lucro: number | null
  rentabilidade: number | null
  cmv: number | null
  labor: number | null
  delivery: number | null
  varFaturamento: number | null
  varDespesas: number | null
  varLucro: number | null
  /** Em pontos. */
  varRentabilidade: number | null
}

export interface OperacaoParaDesempenho {
  ref: string
  nome: string
  regiao: string
}

function relativa(a: number | null, b: number | null): number | null {
  if (a == null || b == null || Math.abs(b) < 1e-9) return null
  return (a - b) / Math.abs(b)
}

function sobre(num: number | null, den: number | null): number | null {
  if (num == null || den == null || Math.abs(den) < 1e-9) return null
  return num / den
}

function medir(ag: Agregado, cat: Catalogo) {
  const fat = valorDe(ag, cat, 1000)
  return {
    faturamento: fat,
    despesas: despesasTotais(ag, cat),
    lucro: valorDe(ag, cat, 7000),
    rentabilidade: valorDe(ag, cat, 10000),
    cmv: sobre(valorDe(ag, cat, 2000), fat),
    labor: sobre(valorDe(ag, cat, 10200), fat),
    delivery: valorDe(ag, cat, 1200),
  }
}

function linha(
  chave: string,
  nome: string,
  regiao: string,
  refs: string[],
  recorte: RecorteCalculado,
  cat: Catalogo
): LinhaDeDesempenho | null {
  const comPlano = refs.filter((r) => recorte.porLoja.has(r))
  if (comPlano.length === 0) return null
  const atual = medir(consolidar(recorte.porLoja, comPlano, cat), cat)
  const pontas = refs.filter((r) => recorte.nasDuasPontas.has(r))
  const a = pontas.length ? medir(consolidar(recorte.porLoja, pontas, cat), cat) : null
  const b = pontas.length ? medir(consolidar(recorte.porLojaAnterior, pontas, cat), cat) : null
  return {
    chave,
    nome,
    regiao,
    lojas: comPlano.length,
    ...atual,
    varFaturamento: a && b ? relativa(a.faturamento, b.faturamento) : null,
    varDespesas: a && b ? relativa(a.despesas, b.despesas) : null,
    varLucro: a && b ? relativa(a.lucro, b.lucro) : null,
    varRentabilidade:
      a && b && a.rentabilidade != null && b.rentabilidade != null
        ? a.rentabilidade - b.rentabilidade
        : null,
  }
}

/** Uma linha por operação na conta com plano no período. */
export function desempenhoPorLoja(
  recorte: RecorteCalculado,
  operacoes: readonly OperacaoParaDesempenho[],
  cat: Catalogo
): LinhaDeDesempenho[] {
  const saida: LinhaDeDesempenho[] = []
  for (const o of operacoes) {
    if (!recorte.naConta.has(o.ref)) continue
    const l = linha(o.ref, o.nome, o.regiao, [o.ref], recorte, cat)
    if (l) saida.push(l)
  }
  return saida
}

export const SEM_REGIAO = 'Sem região'

/** Uma linha por região da rede, somando as operações na conta dela. */
export function desempenhoPorRegiao(
  recorte: RecorteCalculado,
  operacoes: readonly OperacaoParaDesempenho[],
  cat: Catalogo
): LinhaDeDesempenho[] {
  const porRegiao = new Map<string, string[]>()
  for (const o of operacoes) {
    if (!recorte.naConta.has(o.ref)) continue
    const r = o.regiao || SEM_REGIAO
    const lista = porRegiao.get(r)
    if (lista) lista.push(o.ref)
    else porRegiao.set(r, [o.ref])
  }
  const saida: LinhaDeDesempenho[] = []
  for (const [regiao, refs] of porRegiao) {
    const l = linha(`regiao:${regiao}`, regiao, regiao, refs, recorte, cat)
    if (l) saida.push(l)
  }
  return saida
}

// ── A ORDEM DA TABELA ───────────────────────────────────────────────────────
//
// Quem ordena a tabela de desempenho é o PAINEL, e não o `DataReport`. A grade
// lê o tamanho da página só ao nascer; para a tela cheia mostrar todas as lojas,
// ela é montada de novo — e a ordem que mora dentro dela voltaria ao
// faturamento a cada expandir. Aqui fora ela sobrevive (29/09/2026).

/** A ordem de uma coluna, no formato do cabeçalho da grade. */
export interface OrdemDaColuna {
  id: string
  desc: boolean
}

const NOMES = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

/**
 * As linhas na ordem do cabeçalho. Sem ordem, como vieram. Linha sem o dado
 * ("—") vai para o FIM nos dois sentidos: invertida, ela subiria para o topo
 * justamente onde se procura o maior valor.
 */
export function ordenarDesempenho(
  linhas: readonly LinhaDeDesempenho[],
  ordem: readonly OrdemDaColuna[]
): LinhaDeDesempenho[] {
  const primeira = ordem[0]
  if (!primeira) return [...linhas]
  const campo = primeira.id as keyof LinhaDeDesempenho
  return [...linhas].sort((a, b) => {
    const va = a[campo]
    const vb = b[campo]
    const semA = va == null || va === ''
    const semB = vb == null || vb === ''
    if (semA || semB) return semA === semB ? 0 : semA ? 1 : -1
    const c =
      typeof va === 'string' && typeof vb === 'string'
        ? NOMES.compare(va, vb)
        : Number(va) - Number(vb)
    return primeira.desc ? -c : c
  })
}
