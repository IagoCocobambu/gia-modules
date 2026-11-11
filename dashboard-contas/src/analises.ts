import { COMPOSICAO, INDICE_FATURAMENTO, paiDe, type Catalogo, type Direcao } from './catalogo'
import { oportunidade } from './comparacao'
import {
  baseDaOportunidade,
  direcaoDaLinha,
  linhasDaGrade,
  medir,
  type LinhaGrade,
  type Medida,
} from './grade'
import { consolidar, valorDe, type Agregado } from './matriz'

// As contas da aba ANÁLISES ADICIONAIS — o que o painel ainda não tinha do BI
// mensal ("Print Mensal BI", agosto/2026), trazido para uma aba própria (decisão
// do João, 28/09/2026).
//
// ── O QUE ESTA ABA TEM QUE AS OUTRAS NÃO TÊM ────────────────────────────────
//
// Duas fontes a mais: o ANO PASSADO (os mesmos meses, um ano antes) e o ORÇADO
// (os mesmos meses, no Plano de Orçamentos da loja). As outras abas comparam um
// período com outro, um de cada vez; aqui o realizado, o ano passado e o orçado
// aparecem juntos, como nos cartões do BI.
//
// Nada aqui conhece React. A aba só desenha.

/** Uma unidade da seleção com o agregado dela no período. */
export interface UnidadeComAgregado {
  ref: string
  nome: string
  ag: Agregado
}

type LinhaDeConta = Extract<LinhaGrade, { tipo: 'conta' }>

/** O consolidado das `refs` que existem no mapa; `null` se nenhuma existe. */
export function consolidarQuemTem(
  mapa: ReadonlyMap<string, Agregado>,
  refs: readonly string[],
  cat: Catalogo
): Agregado | null {
  const tem = refs.filter((r) => mapa.has(r))
  return tem.length ? consolidar(mapa, tem, cat) : null
}

/** A linha da grade de uma conta do catálogo; `null` se ela não existir. */
export function linhaDaConta(cat: Catalogo, indice: number): LinhaDeConta | null {
  const pos = cat.pos.get(indice)
  if (pos === undefined) return null
  const conta = cat.contas[pos]!
  return { tipo: 'conta', chave: conta.formatado, conta }
}

// ── O CARTÃO DA LOJA ────────────────────────────────────────────────────────
//
// O cartão das abas GRUPO 1 a 5 do BI (células B16 a K23 de cada cartão): as
// sete linhas e, para cada uma, 2026, 2025, ORÇADO, MÉDIA, GAP P/ MÉDIA, MELHOR,
// GAP P/ MELHOR e MELHOR LOJA — mais o IMPACTO R$ da aba "Análise Comparativa".
//
// A MÉDIA é o índice médio das unidades consultadas (a linha somada dividida
// pelo faturamento somado — a mesma conta do BI), e a MELHOR é a melhor entre
// elas: o painel compara as lojas que o usuário consultou (decisão do João,
// 28/09/2026). Com a rede inteira marcada, os dois são os do BI.
//
// Com UMA unidade só não há média nem melhor que não seja ela mesma: as duas
// colunas ficam vazias em vez de mostrar zeros, que se leriam como resultado.

// ── OS SETE INDICADORES DO BI MENSAL ────────────────────────────────────────
//
// As sete linhas de todo cartão do caderno da reunião (abas GRUPO 1 a 5 do "Print
// Mensal BI", células B17 a B23 de cada cartão): CMV corrigido, labor, ocupação e
// indiretos, administrativas, marketing, despesas financeiras e outras despesas.
// Os sete já existiam no catálogo, com os mesmos códigos. Na tela, são o
// Resultado da loja com "Contra: Lojas".
export const INDICADORES_DO_BI = [10104, 10200, 10300, 10500, 10601, 10602, 10603] as const

/** Como cada indicador do BI se chama no cartão. */
export const ROTULO_NO_BI: ReadonlyMap<number, string> = new Map([
  [10104, 'CMV corrigido'],
  [10200, 'Labor'],
  [10300, 'Ocupação e indiretos'],
  [10500, 'Administrativas'],
  [10601, 'Marketing'],
  [10602, 'Despesas financeiras'],
  [10603, 'Outras despesas'],
])

export interface LinhaDoCartao {
  indice: number
  rotulo: string
  direcao: Direcao
  /** O % da unidade no período. */
  realizado: number | null
  /** O % da unidade nos mesmos meses um ano antes. */
  anoPassado: number | null
  /** O % do orçado da unidade no período. */
  orcado: number | null
  media: number | null
  /** realizado − média, em pontos. Positivo = acima da média. */
  gapMedia: number | null
  melhor: number | null
  /** realizado − melhor, em pontos. */
  gapMelhor: number | null
  melhorUnidade: string | null
  /**
   * Quanto o resultado mudaria em reais se a linha tivesse o % da média — o
   * IMPACTO R$ do BI. Positivo = dinheiro a recuperar (a unidade está pior).
   */
  impacto: number | null
}

/** A unidade que ganha num indicador, e o agregado dela. */
export interface MelhorNoIndicador {
  ref: string
  nome: string
  ag: Agregado
  pct: number
}

/**
 * A melhor unidade num indicador: o menor percentual nas despesas, o maior nos
 * lucros. `null` sem unidade com dado.
 */
export function melhorNoIndicador(
  cat: Catalogo,
  indice: number,
  unidades: readonly UnidadeComAgregado[]
): MelhorNoIndicador | null {
  const linha = linhaDaConta(cat, indice)
  if (!linha) return null
  const direcao = direcaoDaLinha(linha)
  let melhor: MelhorNoIndicador | null = null
  for (const u of unidades) {
    const p = medir(linha, u.ag, cat).pct
    if (p == null) continue
    if (!melhor || (direcao === 'maior' ? p > melhor.pct : p < melhor.pct)) {
      melhor = { ref: u.ref, nome: u.nome, ag: u.ag, pct: p }
    }
  }
  return melhor
}

const dif = (a: number | null | undefined, b: number | null | undefined) =>
  a == null || b == null ? null : a - b

export function cartaoDaUnidade(o: {
  cat: Catalogo
  /** O realizado da unidade — ou o consolidado, quando o cartão é o da seleção. */
  alvo: Agregado
  anoPassado: Agregado | null
  orcado: Agregado | null
  /** As unidades consultadas com plano no período: a régua de média e melhor. */
  unidades: readonly UnidadeComAgregado[]
  /** O consolidado das mesmas unidades — o índice médio. */
  consolidado: Agregado
}): LinhaDoCartao[] {
  const { cat, alvo, anoPassado, orcado, unidades, consolidado } = o
  const comRegua = unidades.length >= 2
  return INDICADORES_DO_BI.flatMap((indice) => {
    const linha = linhaDaConta(cat, indice)
    if (!linha) return []
    const direcao = direcaoDaLinha(linha)
    const realizado = medir(linha, alvo, cat).pct
    const media = comRegua ? medir(linha, consolidado, cat).pct : null
    const m = comRegua ? melhorNoIndicador(cat, indice, unidades) : null
    const melhor = m?.pct ?? null
    const melhorUnidade = m?.nome ?? null

    return [
      {
        indice,
        rotulo: ROTULO_NO_BI.get(indice) ?? linha.conta.descricao,
        direcao,
        realizado,
        anoPassado: anoPassado ? medir(linha, anoPassado, cat).pct : null,
        orcado: orcado ? medir(linha, orcado, cat).pct : null,
        media,
        gapMedia: dif(realizado, media),
        melhor,
        gapMelhor: dif(realizado, melhor),
        melhorUnidade,
        impacto: oportunidade(realizado, media, baseDaOportunidade(linha, alvo, cat), direcao),
      },
    ]
  })
}

// ── O CADERNO DA REUNIÃO ────────────────────────────────────────────────────
//
// As abas GRUPO 1 a GRUPO 5 e PRINT RESUMO COA - ACUMULADO do BI: o cartão de
// cada unidade, um embaixo do outro, para imprimir. O primeiro é o da seleção
// inteira (o GRUPO CB do BI, PRINT RESUMO B3:K11); depois cada unidade, na
// ordem em que o seletor da aba as lista. Os cinco "grupos" do BI são só
// paginação (11, 10, 11, 10 e 11 unidades), e aqui não existem.

export interface CartaoDoCaderno {
  /** O nome da unidade — ou o da seleção, no primeiro. */
  titulo: string
  linhas: LinhaDoCartao[]
}

export function cadernoDaReuniao(o: {
  cat: Catalogo
  /** As unidades consultadas com plano, na ordem do caderno. */
  unidades: readonly UnidadeComAgregado[]
  consolidado: Agregado
  anoPassado: ReadonlyMap<string, Agregado>
  orcado: ReadonlyMap<string, Agregado>
  tituloDaSelecao: string
}): CartaoDoCaderno[] {
  const { cat, unidades, consolidado, anoPassado, orcado, tituloDaSelecao } = o
  const refs = unidades.map((u) => u.ref)
  const selecao: CartaoDoCaderno = {
    titulo: tituloDaSelecao,
    linhas: cartaoDaUnidade({
      cat,
      alvo: consolidado,
      anoPassado: consolidarQuemTem(anoPassado, refs, cat),
      orcado: consolidarQuemTem(orcado, refs, cat),
      unidades,
      consolidado,
    }),
  }
  return [
    selecao,
    ...unidades.map((u) => ({
      titulo: u.nome,
      linhas: cartaoDaUnidade({
        cat,
        alvo: u.ag,
        anoPassado: anoPassado.get(u.ref) ?? null,
        orcado: orcado.get(u.ref) ?? null,
        unidades,
        consolidado,
      }),
    })),
  ]
}

// ── O PLANO DE CONTAS INTEIRO DA LOJA ───────────────────────────────────────
//
// A aba Análise Comparativa do BI: as 169 contas de UMA unidade, com 2026,
// 2025, ORÇADO, MÉDIA, GAP P/ MÉDIA, MELHOR, GAP P/ MELHOR, MELHOR LOJA e
// IMPACTO R$ (B14:Q183 na planilha de agosto/2026). As linhas são as da aba
// Plano de contas (`linhasDaGrade`), com a mesma árvore.
//
// ── A MELHOR É A DO INDICADOR, NÃO A DA CONTA ───────────────────────────────
//
// Na coluna MELHOR 2026 da planilha, as linhas de CMV mostram TODAS a CB
// UBERLANDIA (M30 a M42): a loja com o melhor CMV corrigido, e o número dela
// NAQUELA conta. É a leitura que interessa — de onde vem a vantagem da melhor
// loja, conta a conta. A melhor conta a conta seria quase sempre uma loja com
// zero na conta, e não diria nada.
//
// Cada conta pertence a um dos sete indicadores pela coluna LEGENDA da
// planilha (A15:A183), ou a nenhum. O painel não copia a legenda à mão: ela sai
// da composição de cada indicador no catálogo (`COMPOSICAO`), aberta até as
// contas. Assim "3.2 FOLHA" (os impostos sobre a folha) cai no LABOR, "4.20.3
// Folha Marketing" no MARKETING, e "4.20 DESPESAS CORPORATIVAS", "3.1" e o
// faturamento em nenhum — exatamente como na planilha.

/** As contas de que um indicador é feito, abertas até o fim (10104 → 10100 → 2000). */
function partesDe(indice: number, saida: Set<number> = new Set()): Set<number> {
  for (const [parte] of COMPOSICAO.get(indice) ?? []) {
    if (saida.has(parte)) continue
    saida.add(parte)
    partesDe(parte, saida)
  }
  return saida
}

const DO_BI: ReadonlySet<number> = new Set(INDICADORES_DO_BI)
const PARTES_DO_BI: ReadonlyArray<readonly [number, ReadonlySet<number>]> = INDICADORES_DO_BI.map(
  (i) => [i, partesDe(i)] as const
)

/** O indicador do BI a que a linha pertence — a LEGENDA da planilha; `null` se nenhum. */
export function indicadorDaLinha(cat: Catalogo, linha: LinhaGrade): number | null {
  if (linha.tipo !== 'conta') return null
  const c = linha.conta
  if (DO_BI.has(c.indice)) return c.indice
  // A conta, ou o antepassado mais próximo dela, entre as partes de um indicador.
  for (let f: string | null = c.formatado; f; f = paiDe(f)) {
    const indice = cat.porCodigo.get(f)?.indice
    if (indice == null) continue
    for (const [ind, partes] of PARTES_DO_BI) if (partes.has(indice)) return ind
  }
  // Um indicador feito de UM indicador do BI — 10201, o labor sem diretores.
  // Feito de vários (10600, o lucro), não é de nenhum.
  const doBi = (COMPOSICAO.get(c.indice) ?? []).map(([p]) => p).filter((p) => DO_BI.has(p))
  return doBi.length === 1 ? doBi[0]! : null
}

export interface LinhaDoPlanoDaLoja {
  linha: LinhaGrade
  /** O indicador do BI a que a linha pertence; `null` se nenhum. */
  indicador: number | null
  realizado: Medida
  anoPassado: Medida | null
  orcado: Medida | null
  /** O índice médio das unidades consultadas; `null` com uma unidade só. */
  media: Medida | null
  gapMedia: number | null
  /** O IMPACTO R$ do BI, com o sinal do cartão: positivo = a loja está pior. */
  impacto: number | null
  /** A unidade que ganha no indicador da linha, e a medida DELA nesta linha. */
  melhor: { nome: string; medida: Medida } | null
  gapMelhor: number | null
  /**
   * O gap p/ melhor em REAIS: os pontos de diferença × a base da loja (o
   * faturamento, nas contas em reais) — quanto a linha mudaria se a loja tivesse
   * o percentual da melhor. Mesmo sinal do `gapMelhor`. Os reais da melhor não
   * entram: são de outra loja, de outro tamanho. Só nas linhas em percentual.
   */
  gapMelhorReais: number | null
}

export function planoDaUnidade(o: {
  cat: Catalogo
  /** As contas abertas da árvore. */
  abertas: ReadonlySet<string>
  alvo: Agregado
  anoPassado: Agregado | null
  orcado: Agregado | null
  unidades: readonly UnidadeComAgregado[]
  consolidado: Agregado
}): LinhaDoPlanoDaLoja[] {
  const { cat, abertas, alvo, anoPassado, orcado, unidades, consolidado } = o
  const comRegua = unidades.length >= 2
  const melhores = new Map<number, MelhorNoIndicador | null>(
    INDICADORES_DO_BI.map((i) => [i, comRegua ? melhorNoIndicador(cat, i, unidades) : null])
  )
  return linhasDaGrade(cat, abertas).map((linha) => {
    const realizado = medir(linha, alvo, cat)
    const media = comRegua ? medir(linha, consolidado, cat) : null
    const indicador = indicadorDaLinha(cat, linha)
    const m = indicador != null ? melhores.get(indicador) : null
    const melhor = m ? { nome: m.nome, medida: medir(linha, m.ag, cat) } : null
    // O faturamento é a base do percentual: 100% em toda loja, e o gap dele não
    // mede nada (o mesmo caso do Resultado).
    const base = linha.tipo === 'conta' && linha.conta.indice === INDICE_FATURAMENTO
    const gapMelhor = base ? null : dif(realizado.pct, melhor?.medida.pct)
    const baseEmReais = baseDaOportunidade(linha, alvo, cat)
    return {
      linha,
      indicador,
      realizado,
      anoPassado: anoPassado ? medir(linha, anoPassado, cat) : null,
      orcado: orcado ? medir(linha, orcado, cat) : null,
      media,
      gapMedia: base ? null : dif(realizado.pct, media?.pct),
      impacto: media
        ? oportunidade(
            realizado.pct,
            media.pct,
            baseDaOportunidade(linha, alvo, cat),
            direcaoDaLinha(linha)
          )
        : null,
      melhor,
      gapMelhor,
      gapMelhorReais:
        gapMelhor != null && baseEmReais != null && realizado.unidade === 'pct'
          ? gapMelhor * baseEmReais
          : null,
    }
  })
}

// ── O RESULTADO CONTRA O ANO PASSADO E CONTRA O ORÇADO ──────────────────────
//
// As abas COA - ACUMULADO (2026 contra 2025) e REAL VS ORÇADO do BI têm o
// MESMO desenho: doze linhas, o realizado, o comparado e três gaps — em reais,
// em percentual do valor comparado e em pontos percentuais. Muda só o lado
// comparado, e a aba o escolhe num controle.
//
// "# " marca as três parcelas de "Outras despesas", como no BI.

export const LINHAS_DO_RESULTADO: ReadonlyArray<{
  indice: number
  rotulo: string
  parcela?: true
}> = [
  { indice: INDICE_FATURAMENTO, rotulo: 'Faturamento' },
  { indice: 10104, rotulo: 'CMV corrigido' },
  { indice: 10200, rotulo: 'Labor' },
  { indice: 10300, rotulo: 'Ocupação e indiretos' },
  { indice: 10400, rotulo: 'Impostos' },
  { indice: 10500, rotulo: 'Administrativas' },
  { indice: 10600, rotulo: 'Outras despesas' },
  { indice: 10601, rotulo: '# Marketing', parcela: true },
  { indice: 10602, rotulo: '# Despesas financeiras', parcela: true },
  { indice: 10603, rotulo: '# Outras despesas', parcela: true },
  { indice: 10700, rotulo: 'Despesas corporativas' },
  { indice: 11003, rotulo: 'Lucro líquido corrigido' },
]

export interface LinhaDoResultado {
  indice: number
  rotulo: string
  parcela: boolean
  direcao: Direcao
  atual: Medida
  comparado: Medida | null
  /** Quanto o valor mudou em reais. */
  gapValor: number | null
  /** A mesma mudança sobre o valor comparado. */
  gapRelativo: number | null
  /** A mudança do % sobre o faturamento, em pontos. */
  gapPontos: number | null
}

export function resultadoContra(
  cat: Catalogo,
  atual: Agregado,
  comparado: Agregado | null
): LinhaDoResultado[] {
  return LINHAS_DO_RESULTADO.flatMap(({ indice, rotulo, parcela }) => {
    const linha = linhaDaConta(cat, indice)
    if (!linha) return []
    const a = medir(linha, atual, cat)
    const b = comparado ? medir(linha, comparado, cat) : null
    const temValor = a.valor != null && b?.valor != null
    return [
      {
        indice,
        rotulo,
        parcela: !!parcela,
        direcao: direcaoDaLinha(linha),
        atual: a,
        comparado: b,
        gapValor: temValor ? a.valor! - b!.valor! : null,
        gapRelativo:
          temValor && Math.abs(b!.valor!) > 1e-9
            ? (a.valor! - b!.valor!) / Math.abs(b!.valor!)
            : null,
        // O faturamento é a base do percentual: 100% contra 100%, sempre. O
        // "0,00 p.p." dele não mede nada, e no meio dos gaps de verdade parecia
        // resultado (29/09/2026).
        gapPontos:
          indice !== INDICE_FATURAMENTO && a.pct != null && b?.pct != null ? a.pct - b.pct : null,
      },
    ]
  })
}

// ── O ATINGIMENTO DO ORÇADO, LOJA A LOJA ────────────────────────────────────
//
// O faturamento realizado de cada unidade sobre o orçado dela no período, menos
// 1: +5% = faturou 5% acima do orçado. Só entram as unidades com orçado de
// faturamento positivo — sem orçamento não há meta a atingir.

export interface AtingimentoDaUnidade {
  ref: string
  nome: string
  realizado: number
  orcado: number
  /** realizado ÷ orçado − 1. */
  atingimento: number
}

export function atingimentoDoFaturamento(
  unidades: readonly UnidadeComAgregado[],
  orcadoPorRef: ReadonlyMap<string, Agregado>,
  cat: Catalogo
): AtingimentoDaUnidade[] {
  return unidades
    .flatMap((u) => {
      const orc = orcadoPorRef.get(u.ref)
      const realizado = valorDe(u.ag, cat, INDICE_FATURAMENTO)
      const orcado = orc ? valorDe(orc, cat, INDICE_FATURAMENTO) : null
      if (realizado == null || orcado == null || orcado <= 0) return []
      return [{ ref: u.ref, nome: u.nome, realizado, orcado, atingimento: realizado / orcado - 1 }]
    })
    .sort((a, b) => b.atingimento - a.atingimento)
}
