import type { Catalogo, Direcao } from './catalogo'
import {
  OPORTUNIDADE_MINIMA,
  oportunidade,
  referencias,
  type Referencia,
  type Referencias,
} from './comparacao'
import { baseDaOportunidade, direcaoDaLinha, medir, type LinhaGrade, type Medida } from './grade'
import {
  agregarPorLoja,
  consolidar,
  somar,
  valorDe,
  type Agregado,
  type MesCarregado,
} from './matriz'
import type { RecorteCalculado } from './recorte'

// O que a aba Comparativos compara: as COLUNAS (operações, ou grupos delas) e, em
// cada linha do plano, a medida de cada coluna e as REFERÊNCIAS calculadas sobre
// as lojas selecionadas. Puro, sem React.
//
// ── A COLUNA DE GRUPO É UM CONSOLIDADO ──────────────────────────────────────
//
// "Colunas por: Região" soma as operações na conta de cada região — o % do grupo
// é soma sobre soma, como em qualquer consolidado do painel. A REFERÊNCIA não
// muda com o agrupamento: é sempre a média, a melhor e a pior LOJA (decisão do
// João, 18/09/2026: "a média das lojas selecionadas").

// ── ☠️ A RÉGUA NÃO É SEMPRE AS LOJAS ────────────────────────────────────────
//
// Média, melhor e pior precisam de mais de um ponto para existir. Com UMA loja
// marcada, a média das lojas é a própria loja, melhor e pior são ela também, e
// a distância dá 0,00 em todas as linhas — o painel devolvia uma tabela inteira
// de zeros que se lê como resultado, e não como "não se aplica" (relato do Davi
// Nascimento, 24/09/2026, com uma loja e doze meses marcados).
//
// Sobra um segundo eixo, e a pergunta dele é legítima: a loja contra ELA MESMA
// ao longo dos meses do período. A régua passa a ser o eixo que TEM mais de um
// ponto, e as lojas ganham quando os dois têm:
//
//   • duas unidades ou mais  → as unidades, como sempre foi;
//   • uma unidade, 2+ meses  → os meses da seleção;
//   • uma unidade, 1 mês     → nenhuma, e a tela mostra "—".
//
// ⚠️ Trocar o eixo NÃO pode trocar o significado de um rótulo em silêncio: quem
// marcar a segunda loja veria "Média" passar a medir outra coisa sem nada
// avisar. Por isso o eixo viaja dentro de cada linha (`LinhaComparada.eixo`) e a
// aba muda os rótulos junto — ver `AbaComparativos`.
//
// ⚠️ A marca de melhor e pior COLUNA só vale no eixo das unidades. No eixo dos
// meses a régua é de meses, e a coluna é uma loja: marcar "a melhor" ali diria
// que a loja é a melhor de si mesma.

/**
 * Sobre o que média, melhor e pior são calculados.
 *
 * `unidades` é o eixo principal de cada aba — as LOJAS na Comparativos, as
 * LINHAS EXIBIDAS na Por índice. Não são a mesma coisa: três lojas de uma
 * região só, com "Linhas por: Região", dão UMA linha, e a régua degenera
 * igualzinho a uma loja marcada.
 */
export type EixoDaRegua = 'unidades' | 'meses' | 'nenhum'

export interface ReguaDaComparacao {
  eixo: EixoDaRegua
  /** Os agregados que entram na conta — um por unidade, ou um por mês. */
  pontos: Agregado[]
  /**
   * A soma dos pontos, quando a MÉDIA é o índice médio (ver a nota abaixo).
   * `null` na régua dos meses e sem régua, onde a média continua sendo a
   * aritmética.
   */
  consolidado: Agregado | null
}

// ── ☠️ A MÉDIA É O ÍNDICE MÉDIO, E NÃO A MÉDIA DOS PERCENTUAIS ──────────────
//
// Na régua das UNIDADES, "Média" é a linha SOMADA dividida pelo faturamento
// SOMADO das lojas selecionadas — o índice da seleção. Não é a média aritmética
// dos percentuais de cada loja.
//
// Por que importa: as duas contas dão números diferentes sempre que as lojas
// têm tamanhos diferentes, e a aritmética dá peso igual a uma loja de 3 milhões
// e a uma de 30. Medido no relato do Davi Nascimento (24/09/2026, 8 lojas): em
// RESTAURANTE a média aritmética dava 73,31% e o índice médio dá 70,94% — 2,37
// pontos de diferença, e a comparação de cada loja saía contra a régua errada.
//
// Isto REVERTE a decisão de 18/09/2026 ("a média das lojas selecionadas"), a
// pedido do Davi e com o aval do João em 24/09. E alinha a aba com a Visão
// geral, que já usava o consolidado como régua dos rankings — as duas telas
// mostravam réguas diferentes para a mesma seleção.
//
// A coluna "Média R$" continua sendo a média aritmética dos VALORES, e isso não
// briga: a média dos valores dividida pela média dos faturamentos é a soma
// dividida pela soma. Ou seja, o "%" passou a ser exatamente o que se lê das
// duas colunas de R$ ao lado.
//
// ⚠️ NA RÉGUA DOS MESES a média continua ARITMÉTICA, de propósito. Ali a soma
// dos meses dividida pela soma dos faturamentos É o período consolidado — que é
// a própria coluna da loja —, e a distância voltaria a dar zero em tudo, que é
// justamente o defeito que a régua dos meses existe para resolver. São duas
// perguntas diferentes: contra a REDE (que é uma soma) e contra o MÊS TÍPICO
// (que é uma média).

/** O agregado da seleção em cada mês do período. */
export function agregadosPorMes(
  recorte: RecorteCalculado,
  meses: readonly MesCarregado[],
  cat: Catalogo
): Agregado[] {
  // Mês sem plano sai com faturamento zero, e o "%" da linha vira `null`, que
  // `referencias` já descarta — o mês fica de fora da média em vez de entrar
  // como zero e puxá-la para baixo.
  return meses.map((m) => consolidar(agregarPorLoja([m], cat), recorte.naConta, cat))
}

/**
 * A régua vigente: ver a nota acima.
 *
 * `principais` são os pontos do eixo principal da aba — cada aba passa os seus,
 * porque não são os mesmos.
 */
export function reguaDaComparacao(
  principais: readonly Agregado[],
  recorte: RecorteCalculado,
  meses: readonly MesCarregado[],
  cat: Catalogo
): ReguaDaComparacao {
  if (principais.length >= 2) {
    const pontos = [...principais]
    return { eixo: 'unidades', pontos, consolidado: somar(pontos, cat) }
  }
  if (principais.length === 1 && meses.length >= 2) {
    return { eixo: 'meses', pontos: agregadosPorMes(recorte, meses, cat), consolidado: null }
  }
  return { eixo: 'nenhum', pontos: [], consolidado: null }
}

/**
 * Como as colunas (ou as linhas, na aba Por índice) são agrupadas.
 *
 * NÃO existe "por matriz e filiais" aqui: quem junta o grupo é o interruptor
 * **Consolidar matriz e filiais**, do seletor de operações, que soma os planos
 * ANTES de qualquer conta e vale para as quatro abas. Ter as duas coisas era
 * ter dois controles para a mesma ideia, e o desta grade consolidava só ela
 * (decisão do João, 22/09/2026). Com o interruptor ligado, a seta no cabeçalho
 * do grupo abre as filiais ao lado do total.
 */
export type ColunasPor = 'operacao' | 'regiao' | 'estado'

export interface OperacaoParaComparar {
  ref: string
  nome: string
  estado: string
  regiao: string
  grupoId: number
  nomeDoGrupo: string
}

export interface ItemDeComparacao {
  chave: string
  nome: string
  /** As operações da coluna (uma na coluna por operação). */
  refs: string[]
  /** Os nomes das mesmas operações, para a dica "quais lojas". */
  nomes: string[]
  /** O agregado da coluna; `null` = nenhuma operação dela tem plano no período. */
  ag: Agregado | null
  /** O mesmo grupo no período de comparação; `null` sem plano lá. */
  agAnterior: Agregado | null
  faturamento: number | null
}

const ORDEM = new Intl.Collator('pt-BR', { numeric: true })

export function itensDaComparacao(
  recorte: RecorteCalculado,
  operacoes: readonly OperacaoParaComparar[],
  colunasPor: ColunasPor,
  cat: Catalogo,
  /**
   * Só as lojas com plano NOS DOIS períodos. É o que o modo "Dois períodos"
   * pede: comparar conjuntos diferentes de loja entre um período e outro mede a
   * troca de lojas, não a mudança do resultado.
   */
  soNasDuasPontas = false
): ItemDeComparacao[] {
  // Operação sem plano no período não vira coluna nem conta no grupo: seria uma
  // coluna inteira de "—", e o "NCO · 19" do cabeçalho contaria loja que não
  // entrou no número. Ela continua listada no selo de pendências do topo, e o
  // subtítulo da grade diz quantas ficaram de fora.
  const naConta = operacoes
    .filter(
      (o) =>
        recorte.naConta.has(o.ref) &&
        (soNasDuasPontas ? recorte.nasDuasPontas.has(o.ref) : recorte.porLoja.has(o.ref))
    )
    .sort((a, b) => ORDEM.compare(a.nome, b.nome))

  const nomePorRef = new Map(operacoes.map((o) => [o.ref, o.nome]))
  const item = (chave: string, nome: string, refs: string[]): ItemDeComparacao => {
    const ag = refs.length ? consolidar(recorte.porLoja, refs, cat) : null
    const comAnterior = refs.filter((r) => recorte.porLojaAnterior.has(r))
    const agAnterior = comAnterior.length
      ? consolidar(recorte.porLojaAnterior, comAnterior, cat)
      : null
    return {
      chave,
      nome,
      refs,
      nomes: refs.map((r) => nomePorRef.get(r) ?? r),
      ag,
      agAnterior,
      faturamento: ag ? valorDe(ag, cat, 1000) : null,
    }
  }

  if (colunasPor === 'operacao') return naConta.map((o) => item(o.ref, o.nome, [o.ref]))

  const grupos = new Map<string, { nome: string; refs: string[] }>()
  for (const o of naConta) {
    const [chave, nome] =
      colunasPor === 'regiao'
        ? [`regiao:${o.regiao}`, o.regiao || 'Sem região']
        : [`estado:${o.estado}`, o.estado || 'Sem estado']
    const g = grupos.get(chave)
    if (g) g.refs.push(o.ref)
    else grupos.set(chave, { nome, refs: [o.ref] })
  }
  return [...grupos.entries()]
    .map(([chave, g]) => item(chave, g.nome, g.refs))
    .sort((a, b) => {
      const semA = a.nome.startsWith('Sem ')
      const semB = b.nome.startsWith('Sem ')
      if (semA !== semB) return semA ? 1 : -1
      return ORDEM.compare(a.nome, b.nome)
    })
}

export interface CelulaComparada {
  medida: Medida | null
  /** A mesma medida no período de comparação — o modo "Dois períodos". */
  medidaAnterior: Medida | null
  /** Base em reais das Oportunidades em R$. */
  base: number | null
}

/**
 * O grupo inteiro da "Média do grupo": as unidades dele com plano no período, uma
 * por ponto, e a soma delas. Como na régua da seleção, a média é o índice médio
 * (sai da soma), e melhor e pior saem dos pontos.
 */
export interface GrupoDaComparacao {
  pontos: Agregado[]
  consolidado: Agregado
}

export interface LinhaComparada {
  linha: LinhaGrade
  /**
   * A conta está aberta na árvore? Viaja DENTRO da linha, e não numa closure da
   * coluna: coluna recriada a cada abertura faz o `DataReport` refazer a grade
   * inteira, e era isso que travava a tela por segundos (22/09/2026).
   */
  aberta: boolean
  direcao: Direcao
  unidade: Medida['unidade']
  /** Sobre o que `ref` e `mediaValor` foram calculados. */
  eixo: EixoDaRegua
  /** Média, melhor e pior do "%" entre os pontos da régua (lojas, ou meses). */
  ref: Referencias
  /** A média simples do valor em reais entre os mesmos pontos. */
  mediaValor: number | null
  /**
   * Média, melhor e pior do GRUPO — o bloco "Grupo", só com "Média do grupo"
   * escolhida. A média também está em `ref.grupo`, que é o que a distância lê.
   */
  grupo: Referencias | null
  /** O "Média R$" do GRUPO: a média simples do valor entre as lojas dele. */
  grupoValor: number | null
  /** O consolidado das lojas nas duas pontas, no período e no de comparação. */
  consolidado: Medida | null
  consolidadoAnterior: Medida | null
  celulas: CelulaComparada[]
}

/**
 * A fábrica de linhas da comparação: os agregados das lojas são preparados UMA
 * vez, e cada chamada mede uma linha do plano em todas as colunas.
 *
 * ── POR QUE FÁBRICA, E NÃO SÓ UMA FUNÇÃO DE LISTA ───────────────────────────
 *
 * Abrir uma conta na árvore muda só QUAIS linhas aparecem; as que já estavam na
 * tela continuam com o mesmo número. Com a fábrica, a aba guarda a linha pronta
 * e devolve O MESMO OBJETO — e as células, que são `memo`, não redesenham.
 * Recalcular a lista inteira custava barato (6 ms), mas trocava a identidade de
 * todas as linhas e obrigava o `DataReport` a refazer ~25 mil células: 1,5 s de
 * tela travada ao abrir uma conta com a rede inteira (medido em 22/09/2026).
 */
export function comparadorDeLinhas(
  itens: readonly ItemDeComparacao[],
  recorte: RecorteCalculado,
  cat: Catalogo,
  regua: ReguaDaComparacao,
  /** Só com "Média do grupo" escolhida — e só então o grupo é somado. */
  grupo: GrupoDaComparacao | null = null
): ComparadorDeLinhas {
  const pontos = regua.pontos
  return (linha) => {
    const direcao = direcaoDaLinha(linha)
    if (linha.tipo === 'secao') {
      return {
        linha,
        aberta: false,
        direcao,
        unidade: 'pct' as const,
        eixo: regua.eixo,
        ref: { media: null, melhor: null, pior: null, lojas: 0 },
        mediaValor: null,
        grupo: null,
        grupoValor: null,
        consolidado: null,
        consolidadoAnterior: null,
        celulas: itens.map(() => ({ medida: null, medidaAnterior: null, base: null })),
      }
    }
    const daRegua = pontos.map((ag) => medir(linha, ag, cat))
    const doGrupo = grupo ? grupo.pontos.map((ag) => medir(linha, ag, cat)) : null
    // A mesma conta da régua da seleção: melhor e pior dos pontos, e a média
    // trocada pelo índice médio (a soma do grupo).
    const refDoGrupo: Referencias | null =
      grupo && doGrupo
        ? {
            ...referencias(
              doGrupo.map((m) => m.pct),
              direcao
            ),
            media: medir(linha, grupo.consolidado, cat).pct,
          }
        : null
    const celulas = itens.map((it) => ({
      medida: it.ag ? medir(linha, it.ag, cat) : null,
      medidaAnterior: it.agAnterior ? medir(linha, it.agAnterior, cat) : null,
      base: it.ag ? baseDaOportunidade(linha, it.ag, cat) : null,
    }))
    return {
      linha,
      aberta: false,
      direcao,
      unidade: daRegua[0]?.unidade ?? celulas.find((c) => c.medida)?.medida?.unidade ?? 'pct',
      eixo: regua.eixo,
      // Melhor e pior continuam saindo dos PONTOS (são uma loja e um mês de
      // verdade); só a média troca de conta. Ver a nota do índice médio.
      ref: {
        ...comMediaDoConsolidado(
          referencias(
            daRegua.map((m) => m.pct),
            direcao
          ),
          linha,
          regua,
          cat
        ),
        ...(refDoGrupo ? { grupo: refDoGrupo.media } : {}),
      },
      mediaValor: mediaDosValores(daRegua),
      grupo: refDoGrupo,
      grupoValor: doGrupo ? mediaDosValores(doGrupo) : null,
      consolidado: recorte.nasDuasPontas.size ? medir(linha, recorte.mesmasAtual, cat) : null,
      consolidadoAnterior: recorte.nasDuasPontas.size
        ? medir(linha, recorte.mesmasAnterior, cat)
        : null,
      celulas,
    }
  }
}

/** A média simples do valor em reais entre os pontos que têm valor. */
function mediaDosValores(medidas: readonly Medida[]): number | null {
  const v = medidas.map((m) => m.valor).filter((x): x is number => x != null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

/** O que a fábrica devolve: a linha medida em todas as colunas. */
export type ComparadorDeLinhas = (linha: LinhaGrade) => LinhaComparada

// ── AS LINHAS PRONTAS FICAM GUARDADAS POR COMPARADOR ────────────────────────
//
// Abrir uma conta muda só QUAIS linhas aparecem. Guardando a linha pronta por
// chave, as que continuam na tela voltam com a MESMA identidade e o `memo` das
// células as pula — sem isso, o `DataReport` refaz ~25 mil células a cada
// abertura (1,5 s de tela travada com a rede inteira, medido em 22/09/2026).
//
// O mapa mora no MÓDULO, e não num `useMemo`: mutar valor de hook durante o
// render é proibido pelo ESLint do host. `WeakMap` pelo comparador faz a
// memória morrer junto com o recorte que a criou — o mesmo desenho do `VALORES`
// de `matriz.ts`.
const PRONTAS = new WeakMap<ComparadorDeLinhas, Map<string, LinhaComparada>>()

/** A linha pronta, reaproveitada enquanto o comparador for o mesmo. */
export function linhaComparada(
  medir: ComparadorDeLinhas,
  linha: LinhaGrade,
  aberta: boolean
): LinhaComparada {
  let guardadas = PRONTAS.get(medir)
  if (!guardadas) {
    guardadas = new Map()
    PRONTAS.set(medir, guardadas)
  }
  const pronta = guardadas.get(linha.chave)
  if (pronta && pronta.aberta === aberta) return pronta
  const nova = pronta ? { ...pronta, aberta } : { ...medir(linha), aberta }
  guardadas.set(linha.chave, nova)
  return nova
}

/** As linhas da comparação — uma medida por coluna e as referências das lojas. */
export function linhasDaComparacao(
  linhas: readonly LinhaGrade[],
  itens: readonly ItemDeComparacao[],
  recorte: RecorteCalculado,
  cat: Catalogo,
  regua: ReguaDaComparacao,
  grupo: GrupoDaComparacao | null = null
): LinhaComparada[] {
  return linhas.map(comparadorDeLinhas(itens, recorte, cat, regua, grupo))
}

// ── O RESUMO DAS COLUNAS ────────────────────────────────────────────────────

export type IndicadorDoResumo = 'cmv' | 'custos' | 'lucro'

export const INDICADORES_DO_RESUMO: Array<{
  id: IndicadorDoResumo
  rotulo: string
  indice: number
  direcao: 'maior' | 'menor'
}> = [
  { id: 'cmv', rotulo: 'Matéria-prima', indice: 2000, direcao: 'menor' },
  { id: 'custos', rotulo: 'Custos operac.', indice: 4000, direcao: 'menor' },
  { id: 'lucro', rotulo: 'Lucro líq.', indice: 7000, direcao: 'maior' },
]

/** O percentual de uma conta sobre o faturamento de um agregado. */
export function pctDoResumo(ag: Agregado, cat: Catalogo, id: IndicadorDoResumo): number | null {
  const def = INDICADORES_DO_RESUMO.find((i) => i.id === id)!
  const v = valorDe(ag, cat, def.indice)
  const f = valorDe(ag, cat, 1000)
  return v == null || f == null || Math.abs(f) < 1e-9 ? null : v / f
}

/**
 * Troca a média aritmética pelo ÍNDICE MÉDIO quando a régua tem consolidado.
 * Ver a nota do índice médio, acima.
 */
export function comMediaDoConsolidado(
  ref: Referencias,
  linha: LinhaGrade,
  regua: ReguaDaComparacao,
  cat: Catalogo
): Referencias {
  if (!regua.consolidado || linha.tipo === 'secao') return ref
  return { ...ref, media: medir(linha, regua.consolidado, cat).pct }
}

/** Média, melhor e pior de cada percentual do resumo, na régua vigente. */
export function referenciasDoResumo(
  regua: ReguaDaComparacao,
  cat: Catalogo,
  grupo: GrupoDaComparacao | null = null
): Record<IndicadorDoResumo, Referencias> {
  const saida = {} as Record<IndicadorDoResumo, Referencias>
  for (const ind of INDICADORES_DO_RESUMO) {
    const base = referencias(
      regua.pontos.map((ag) => pctDoResumo(ag, cat, ind.id)),
      ind.direcao
    )
    saida[ind.id] = {
      ...(regua.consolidado
        ? { ...base, media: pctDoResumo(regua.consolidado, cat, ind.id) }
        : base),
      ...(grupo ? { grupo: pctDoResumo(grupo.consolidado, cat, ind.id) } : {}),
    }
  }
  return saida
}

// ── ONDE ESTÁ O DINHEIRO ────────────────────────────────────────────────────
//
// A coluna IMPACTO R$ da aba "Análise Comparativa" do BI mensal, ordenada: em
// que contas de despesa uma coluna mais se afasta da referência, em reais — o
// quanto o resultado dela mudaria se a conta tivesse o percentual da referência.
// É a MESMA conta do "Ganho R$" da grade (`oportunidade`), só que ordenada, para
// responder "por onde começar".
//
// ── SÓ O NÍVEL 2, SÓ DESPESA ────────────────────────────────────────────────
//
// Somar pai e filha contaria o mesmo dinheiro duas vezes: "4.10 SERVIÇOS
// TERCEIRIZADOS" já contém "4.10.2 Músicos". O nível 2 é a granularidade em que
// os sete indicadores do BI se formam (4.1 FOLHA, 4.7 RESCISÕES, 4.12 DESPESAS
// INDIRETAS…), e o que a reunião discute. Entram as três raízes de despesa —
// matéria-prima (2), impostos (3) e custos operacionais (4) —, e só as contas
// com direção: conta neutra não tem "melhor", e o ganho dela não existe.

/** As contas de despesa de nível 2, como linhas da grade. */
export function linhasDoDinheiro(cat: Catalogo): LinhaGrade[] {
  return cat.contas
    .filter(
      (c) =>
        c.nivel === 2 &&
        (c.raiz === '2' || c.raiz === '3' || c.raiz === '4') &&
        c.natureza === 'fluxo' &&
        c.direcao !== 'neutra'
    )
    .map((conta) => ({ tipo: 'conta' as const, chave: conta.formatado, conta }))
}

export interface ContaDoDinheiro {
  linha: LinhaComparada
  /** Positivo = o que a coluna ganharia chegando à referência. */
  ganho: number
  /** O "%" da coluna e o da referência — a dica diz de onde o ganho saiu. */
  pct: number
  ref: number
}

export interface DinheiroDaColuna {
  /** As contas com ganho, do maior para o menor, no máximo `quantas`. */
  contas: ContaDoDinheiro[]
  /** A soma de TODOS os ganhos positivos, não só dos mostrados. */
  total: number
  /** Quantas contas ficam acima da referência — as mostradas e as demais. */
  acima: number
  /** Em quantas contas a coluna já está melhor que a referência. */
  melhores: number
}

/**
 * As contas em que a coluna `coluna` deixa mais dinheiro na mesa contra a
 * `referencia`. Diferença abaixo de `OPORTUNIDADE_MINIMA` é ruído de centavos e
 * fica de fora, como na grade.
 */
export function ondeEstaODinheiro(
  comparadas: readonly LinhaComparada[],
  coluna: number,
  referencia: Referencia,
  quantas = 10
): DinheiroDaColuna {
  const comGanho: ContaDoDinheiro[] = []
  let melhores = 0
  for (const linha of comparadas) {
    const c = linha.celulas[coluna]
    const ref = linha.ref[referencia]
    const pct = c?.medida?.pct ?? null
    if (!c || pct == null || ref == null) continue
    const ganho = oportunidade(pct, ref, c.base, linha.direcao)
    if (ganho == null || Math.abs(ganho) < OPORTUNIDADE_MINIMA) continue
    if (ganho > 0) comGanho.push({ linha, ganho, pct, ref })
    else melhores += 1
  }
  comGanho.sort((a, b) => b.ganho - a.ganho)
  return {
    contas: comGanho.slice(0, quantas),
    total: comGanho.reduce((s, c) => s + c.ganho, 0),
    acima: comGanho.length,
    melhores,
  }
}
