import type { Unidade } from './catalogo'

// A planilha de um cartão de gráfico: os números que o desenho mostra, em colunas.
//
// ── NÚMERO SAI COMO NÚMERO ──────────────────────────────────────────────────
//
// A mesma regra dos outros módulos do repositório que exportam `.xlsx`: valor
// numérico vai para a célula como NÚMERO, com o formato (R$, %, p.p.) no
// `numFmt`, nunca como texto já formatado. Com texto, o Excel não soma, não
// ordena e não faz gráfico. Por isso cada coluna declara o `formato`, e o texto
// da tela ("25,76%") só entra onde ele É o dado (um rótulo, uma leitura).
//
// ── UM MONTADOR POR FORMA DE GRÁFICO ────────────────────────────────────────
//
// São sete cartões, mas só três formas de dado: a SÉRIE mensal (resultado,
// rentabilidade, indicadores), a COMPOSIÇÃO (faturamento por área, despesas por
// natureza) e o RANKING (lojas, regiões). Cada cartão chama o montador da sua
// forma com os MESMOS itens que entrega ao desenho — a planilha não refaz conta,
// e por isso não tem como discordar dele.
//
// Tudo aqui é função pura, sem React e sem `exceljs`: quem escreve o arquivo é
// `baixar-planilha.ts`, carregado só no clique.

export type Formato = 'texto' | 'inteiro' | 'decimal' | 'pct' | 'pp' | 'brl'
export type Celula = string | number | null

export interface ColunaPlanilha {
  titulo: string
  formato: Formato
}

export interface Planilha {
  colunas: ColunaPlanilha[]
  linhas: Celula[][]
  /** Linhas de texto embaixo da tabela: o total, a régua, o que ficou de fora. */
  notas?: string[]
}

/** Como o valor de uma conta vai para a célula, pela unidade dela. */
export function formatoDaUnidade(unidade: Unidade): Formato {
  if (unidade === 'pct') return 'pct'
  if (unidade === 'mult') return 'decimal'
  return 'brl'
}

interface MesDaSerie {
  rotulo: string
  /** Quantas lojas da conta têm plano no mês — vai como coluna. */
  lojas: number
}

interface SerieDaPlanilha {
  nome: string
  valores: Array<number | null>
  formato: Formato
  /**
   * Acrescenta a coluna de variação contra o MÊS DE CIMA: relativa nos valores
   * em reais, em pontos nos percentuais. Sem isto, ler "quanto mudou de jul/26
   * para ago/26" exige passar o ponteiro ponto a ponto no desenho.
   *
   * ⚠️ É a diferença entre os dois PONTOS DO DESENHO, e cada mês traz as lojas
   * que tinham plano nele. Não é a variação dos cartões do topo, que conta só as
   * lojas com plano nos dois meses — em ago/26 a primeira dá +7,6% e a segunda
   * +9,7% (89 lojas contra 91). O rótulo da coluna e a nota da planilha dizem
   * qual é qual; trocar uma pela outra aqui esconderia a troca de lojas dentro
   * de um número que parece o mesmo.
   */
  variacao?: 'relativa' | 'pontos'
}

/**
 * A nota entra SOZINHA em toda série com variação: ela explica por que este
 * número pode divergir do cartão do topo, e esquecê-la num cartão novo seria
 * deixar a divergência sem explicação.
 */
const NOTA_DA_VARIACAO =
  'A variação compara cada mês com o de cima, com as lojas que tinham plano em cada um — é a diferença entre os dois pontos do desenho. Os cartões do topo comparam só as lojas com plano nos dois meses, e por isso podem divergir.'

/** A variação de um mês para o seguinte; `null` no primeiro e sem base. */
function variacaoNoMes(
  valores: Array<number | null>,
  i: number,
  tipo: 'relativa' | 'pontos'
): number | null {
  const atual = valores[i]
  const anterior = i > 0 ? valores[i - 1] : null
  if (atual == null || anterior == null) return null
  if (tipo === 'pontos') return atual - anterior
  return Math.abs(anterior) < 1e-9 ? null : (atual - anterior) / Math.abs(anterior)
}

/**
 * A série mensal: uma linha por mês, uma coluna por série, e quantas lojas
 * entraram no mês. A contagem vai junto porque mês com menos lojas não é
 * comparável com os outros — na tela isso está na dica.
 */
export function planilhaDeSerieMensal(
  meses: readonly MesDaSerie[],
  series: readonly SerieDaPlanilha[],
  notas?: string[]
): Planilha | null {
  if (meses.length === 0 || series.length === 0) return null
  const colunasDaSerie = series.flatMap((s) => [
    { titulo: s.nome, formato: s.formato },
    ...(s.variacao
      ? [
          {
            titulo: `${s.nome} · vs. mês anterior (lojas de cada mês)`,
            formato: (s.variacao === 'pontos' ? 'pp' : 'pct') as Formato,
          },
        ]
      : []),
  ])
  const temVariacao = series.some((s) => s.variacao)
  return {
    colunas: [
      { titulo: 'Mês', formato: 'texto' },
      ...colunasDaSerie,
      { titulo: 'Lojas com plano', formato: 'inteiro' },
    ],
    linhas: meses.map((m, i) => [
      m.rotulo,
      ...series.flatMap((s) => [
        s.valores[i] ?? null,
        ...(s.variacao ? [variacaoNoMes(s.valores, i, s.variacao)] : []),
      ]),
      m.lojas,
    ]),
    notas: temVariacao ? [...(notas ?? []), NOTA_DA_VARIACAO] : notas,
  }
}

interface LinhaDeComposicaoPlanilha {
  nome: string
  valor: number
  participacao: number | null
  variacao: number | null
}

/** A composição: valor, parte no total e variação de cada área ou natureza. */
export function planilhaDeComposicao(
  linhas: readonly LinhaDeComposicaoPlanilha[],
  o: { rotuloItem: string; rotuloVariacao: string; notas?: string[] }
): Planilha | null {
  if (linhas.length === 0) return null
  return {
    colunas: [
      { titulo: o.rotuloItem, formato: 'texto' },
      { titulo: 'Valor (R$)', formato: 'brl' },
      { titulo: 'Participação', formato: 'pct' },
      { titulo: `Variação ${o.rotuloVariacao}`, formato: 'pct' },
    ],
    linhas: linhas.map((l) => [l.nome, l.valor, l.participacao, l.variacao]),
    notas: o.notas,
  }
}

interface ItemDoRankingPlanilha {
  rotulo: string
  valor: number
  /** A região da loja, ou quantas lojas a região soma. */
  detalhe?: string
}

/** O ranking: um valor por loja (ou por região), na ordem do gráfico. */
export function planilhaDeRanking(
  itens: readonly ItemDoRankingPlanilha[],
  o: { rotuloItem: string; rotuloValor: string; formato: Formato; notas?: string[] }
): Planilha | null {
  if (itens.length === 0) return null
  const temDetalhe = itens.some((i) => i.detalhe)
  return {
    colunas: [
      { titulo: o.rotuloItem, formato: 'texto' },
      { titulo: o.rotuloValor, formato: o.formato },
      ...(temDetalhe ? [{ titulo: 'Detalhe', formato: 'texto' as const }] : []),
    ],
    linhas: itens.map((i) => [i.rotulo, i.valor, ...(temDetalhe ? [i.detalhe ?? null] : [])]),
    notas: o.notas,
  }
}

// ── A GRADE COMO PLANILHA ───────────────────────────────────────────────────
//
// As quatro grades do painel (Plano de contas, Comparativos, Por índice e o
// desempenho da Visão geral) baixam em Excel, e não no CSV do `DataReport`: CSV
// chega ao Excel sem formato, e quem recebe refaz a formatação à mão (decisão
// do João, 22/09/2026).
//
// Cada grade declara as COLUNAS com o formato de cada uma e uma função que
// devolve as células de uma linha na MESMA ordem. O par vive junto de propósito:
// coluna e célula que se desencontram produzem um arquivo com o número na
// coluna errada, e é o tipo de defeito que só aparece na mão de quem recebeu.

/** A grade inteira como planilha, na ordem em que ela está na tela. */
export function planilhaDaGrade<T>(
  colunas: readonly ColunaPlanilha[],
  linhas: readonly T[],
  celulas: (linha: T) => Celula[],
  notas?: string[]
): Planilha | null {
  if (colunas.length === 0 || linhas.length === 0) return null
  const montadas = linhas.map(celulas)
  // A linha CURTA (ou comprida) é sempre erro de programação: coluna e célula
  // saíram de listas diferentes. Completar com vazio é melhor que entregar um
  // arquivo com o número na coluna errada, que ninguém percebe até usar.
  return {
    colunas: [...colunas],
    linhas: montadas.map((l) =>
      l.length === colunas.length
        ? l
        : Array.from({ length: colunas.length }, (_, i) => l[i] ?? null)
    ),
    notas,
  }
}
