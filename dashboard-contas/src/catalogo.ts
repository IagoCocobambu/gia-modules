import type { IndiceCatalogo } from './types'

// O catálogo do Plano de Contas e as REGRAS de cada conta — como ela consolida,
// como se lê e para que lado é bom.
//
// ── A HIERARQUIA VEM DO CÓDIGO FORMATADO ────────────────────────────────────
//
// O pai de uma conta é o trecho antes do ÚLTIMO ponto do código ("4.10.1" →
// "4.10" → "4"). É o que o `plano-contas` usa, e o `is_group` do catálogo NÃO
// serve para isso: só 12 das 169 contas têm a flag, e linhas claramente
// intermediárias como "1.1 RESTAURANTE" não a têm. Código sem ponto e acima de
// 100 ("9999", "10200", "20001") é indicador gerencial: nível 0, sem pai.
//
// ── TRÊS NATUREZAS, TRÊS JEITOS DE CONSOLIDAR ───────────────────────────────
//
// Somar tudo dá número errado em silêncio. Entre lojas e entre meses:
//
//   • FLUXO (quase tudo): soma.
//   • SALDO (10102 estoque e 10012 pagamentos antecipados em cofre): é a posição
//     no fim do mês. Entre meses vale o ÚLTIMO mês com plano de cada loja; entre
//     lojas, soma. Somar 12 estoques daria um estoque de 12 lojas imaginárias.
//   • RAZÃO (10000, 10001, 10101, 20001–20003): recalculada SOBRE AS SOMAS. Média
//     de percentual dá um número que não existe em lugar nenhum, e parece certo.
//
// ── CONTAS RECALCULADAS: O DADO GRAVADO NÃO É HOMOGÊNEO ─────────────────────
//
// Medido no DW de produção em 18/09/2026: o 11003 (lucro corrigido pelo estoque)
// está gravado com DOIS sinais. O `plano-contas` corrigiu a fórmula para
// `11000 + 10103` em 05/08/2026; os planos calculados antes guardam
// `11000 − 10103`. De jan/25 a jun/26 ~75% dos planos estão na convenção antiga,
// e de jul/26 em diante todos na nova — no MESMO mês convivem as duas. O 11004
// (`11003 − 10014`) herda o sinal. Somar o gravado misturaria as duas regras.
//
// As razões gravadas também não servem: parte delas está arredondada a 2 casas
// (0,19 no lugar de 0,1912). Por isso toda razão e as duas contas acima são
// refeitas aqui, pela regra VIGENTE do `plano-contas`
// (`plano-contas/src/server/calcular.ts`), e nunca somadas.

export type Natureza = 'fluxo' | 'saldo' | 'razao'
/** Como o valor da conta se lê: reais, percentual ou um múltiplo ("7,57"). */
export type Unidade = 'brl' | 'pct' | 'mult'
export type Direcao = 'maior' | 'menor' | 'neutra'

/** Uma parcela de fórmula: a conta e o sinal com que entra. */
export type Parcela = readonly [indice: number, sinal: 1 | -1]

export interface Conta {
  indice: number
  formatado: string
  descricao: string
  /** 1, 2 ou 3 no plano; 0 nos indicadores gerenciais. */
  nivel: number
  /** Código formatado do pai; `null` nas raízes e nos indicadores. */
  pai: string | null
  /** A raiz do plano ("1"…"7"); `null` nos indicadores. */
  raiz: string | null
  temFilhos: boolean
  natureza: Natureza
  unidade: Unidade
  direcao: Direcao
}

export const INDICE_FATURAMENTO = 1000

/** As razões e a fórmula de cada uma — numerador ÷ denominador, sobre as somas. */
export const RAZOES: ReadonlyMap<number, { num: Parcela[]; den: Parcela[] }> = new Map([
  // 7 LUCRO LÍQUIDO (sem investimentos) ÷ 1 FATURAMENTO
  [10000, { num: [[7000, 1]], den: [[1000, 1]] }],
  // (7 + 10103 variação de estoque) ÷ 1
  [
    10001,
    {
      num: [
        [7000, 1],
        [10103, 1],
      ],
      den: [[1000, 1]],
    },
  ],
  // 2 MATÉRIA-PRIMA ÷ o faturamento do restaurante: o total menos o que não é
  // venda de restaurante (couvert, taxas de entrega, parquinho, estacionamento,
  // gorjeta e outras receitas).
  [
    10101,
    {
      num: [[2000, 1]],
      den: [
        [1000, 1],
        [1140, -1],
        [1220, -1],
        [1500, -1],
        [1600, -1],
        [1700, -1],
        [1800, -1],
      ],
    },
  ],
  // 4.10.1 Motoboys ÷ 1.2 DELIVERY
  [20001, { num: [[4911, 1]], den: [[1200, 1]] }],
  // 1.1.3 Vinhos (receita) ÷ 2.2.2 Vinhos (despesa)
  [20002, { num: [[1130, 1]], den: [[2220, 1]] }],
  // 1.1.4 Couvert artístico ÷ 4.10.2 Músicos
  [20003, { num: [[1140, 1]], den: [[4912, 1]] }],
])

/** Contas refeitas pela regra vigente, em ordem (o 11004 lê o 11003 refeito). */
export const RECALCULADAS: ReadonlyArray<readonly [number, Parcela[]]> = [
  [
    11003,
    [
      [11000, 1],
      [10103, 1],
    ],
  ],
  [
    11004,
    [
      [11003, 1],
      [10014, -1],
    ],
  ],
]

/** Posição no fim do mês: entre meses vale o último, entre lojas soma. */
export const SALDOS: ReadonlySet<number> = new Set([10102, 10012])

/**
 * De que contas cada indicador gerencial é feito — a dica "Composição" das
 * grades. Porte das fórmulas de `plano-contas/src/server/calcular.ts`.
 */
export const COMPOSICAO: ReadonlyMap<number, Parcela[]> = new Map<number, Parcela[]>([
  [10010, [[1800, 1]]],
  [10100, [[2000, 1]]],
  [
    10104,
    [
      [10100, 1],
      [10103, -1],
    ],
  ],
  [
    10200,
    [
      [4100, 1],
      [4200, 1],
      [4400, 1],
      [4500, 1],
      [4600, 1],
      [4700, 1],
      [3200, 1],
    ],
  ],
  [
    10201,
    [
      [10200, 1],
      [4150, -1],
    ],
  ],
  [
    10300,
    [
      [4300, 1],
      [4900, 1],
      [4930, 1],
      [4990, 1],
    ],
  ],
  [
    10400,
    [
      [3100, 1],
      [3300, 1],
    ],
  ],
  [10500, [[4800, 1]]],
  [
    10600,
    [
      [10601, 1],
      [10602, 1],
      [10603, 1],
    ],
  ],
  [
    10601,
    [
      [4950, 1],
      [5203, 1],
      [5207, 1],
    ],
  ],
  [10602, [[5100, 1]]],
  [
    10603,
    [
      [4910, 1],
      [4920, 1],
      [4960, 1],
      [4970, 1],
      [4980, 1],
      [5000, 1],
    ],
  ],
  [
    10700,
    [
      [5201, 1],
      [5202, 1],
      [5204, 1],
      [5205, 1],
      [5206, 1],
      [5208, 1],
      [5209, 1],
    ],
  ],
  [
    11000,
    [
      [1000, 1],
      [10100, -1],
      [10200, -1],
      [10300, -1],
      [10400, -1],
      [10500, -1],
      [10600, -1],
      [10700, -1],
    ],
  ],
  [11001, [[7000, 1]]],
  [11002, [[8000, 1]]],
  [
    11003,
    [
      [11000, 1],
      [10103, 1],
    ],
  ],
  [
    11004,
    [
      [11003, 1],
      [10014, -1],
    ],
  ],
])

/**
 * A linha de VALIDAÇÃO do plano: a soma das despesas contra o que o contas a
 * pagar registrou. Zero (o "✓" do Plano de Contas) quer dizer que o plano
 * fecha; qualquer outro valor é lançamento faltando.
 *
 * Não é indicador de desempenho, e por isso fica fora de toda escolha do
 * painel: um ranking de lojas por "o quanto o plano não fecha" compararia
 * qualidade de digitação, não resultado.
 */
export const INDICE_DA_VALIDACAO = 9999

/**
 * Os indicadores gerenciais que as grades mostram, NA ORDEM do HTML que
 * especifica o módulo ("ordem definida pelo usuário; ausentes ficam ocultos").
 * Ficam de fora 9999, 10000, 10001, 10010–10013 e 10101 — os três de
 * rentabilidade e matéria-prima estão nos cartões da Visão geral.
 *
 * ⚠️ Esta lista é a das GRADES (Plano de contas e Comparativos), e não a de
 * tudo o que o painel sabe medir. A aba Por índice oferece TAMBÉM os que estão
 * fora dela — ver `indicesEscolhiveis`, em `por-indice.ts`: o Davi perguntou em
 * 23/09/2026 por que a Rentabilidade não aparecia na busca, e a resposta era
 * esta lista.
 */
export const INDICADORES_DA_GRADE = [
  10100, 10200, 10201, 10300, 10400, 10500, 10600, 10601, 10602, 10603, 10700, 11000, 11001, 11002,
  11003, 11004, 20001, 20002, 20003, 10014, 10102, 10103, 10104,
] as const

/** Indicadores em que maior é melhor (lucros, rentabilidades, receitas extras). */
const INDICADOR_MAIOR = new Set([
  10000, 10001, 10010, 10014, 11000, 11001, 11002, 11003, 11004, 20002, 20003,
])
/** Informativos: sem direção, sem cor, fora de melhor/pior. */
const INDICADOR_NEUTRO = new Set([9999, 10012, 10013, 10102, 10103])

function unidadeDe(indice: number): Unidade {
  if (indice === 20002 || indice === 20003) return 'mult'
  return RAZOES.has(indice) ? 'pct' : 'brl'
}

export function nivelDe(formatado: string): number {
  if (formatado.includes('.')) return formatado.split('.').length
  return Number(formatado) >= 100 ? 0 : 1
}

export function paiDe(formatado: string): string | null {
  if (!formatado.includes('.')) return null
  return formatado.slice(0, formatado.lastIndexOf('.'))
}

function direcaoDe(indice: number, raiz: string | null): Direcao {
  if (raiz === null) {
    if (INDICADOR_NEUTRO.has(indice)) return 'neutra'
    return INDICADOR_MAIOR.has(indice) ? 'maior' : 'menor'
  }
  // Receitas (1) e lucros (6, 7): maior é melhor. Matéria-prima, impostos, custos
  // e investimentos (2 a 5): menor é melhor.
  return raiz === '1' || raiz === '6' || raiz === '7' ? 'maior' : 'menor'
}

/** O catálogo pronto para as contas do painel, com a posição de cada conta. */
export interface Catalogo {
  contas: Conta[]
  /** Índice → posição em `contas` (e nos vetores de valores). */
  pos: ReadonlyMap<number, number>
  /** Código formatado → conta. */
  porCodigo: ReadonlyMap<string, Conta>
}

export function montarCatalogo(indices: readonly IndiceCatalogo[]): Catalogo {
  const comPai = new Set(indices.map((i) => paiDe(i.formatado)).filter(Boolean) as string[])
  const contas: Conta[] = indices.map((i) => {
    const nivel = nivelDe(i.formatado)
    const raiz = nivel === 0 ? null : i.formatado.split('.')[0]!
    return {
      indice: i.indice,
      formatado: i.formatado,
      descricao: i.descricao,
      nivel,
      pai: paiDe(i.formatado),
      raiz,
      temFilhos: comPai.has(i.formatado),
      natureza: RAZOES.has(i.indice) ? 'razao' : SALDOS.has(i.indice) ? 'saldo' : 'fluxo',
      unidade: unidadeDe(i.indice),
      direcao: direcaoDe(i.indice, raiz),
    }
  })
  return {
    contas,
    pos: new Map(contas.map((c, k) => [c.indice, k])),
    porCodigo: new Map(contas.map((c) => [c.formatado, c])),
  }
}

/** As contas do plano (níveis 1 a 3), na ordem do catálogo. */
export function contasDoPlano(cat: Catalogo): Conta[] {
  return cat.contas.filter((c) => c.nivel >= 1)
}

/** As contas que uma conta abre — os filhos diretos. */
export function filhosDe(cat: Catalogo, formatado: string): Conta[] {
  return cat.contas.filter((c) => c.pai === formatado)
}
