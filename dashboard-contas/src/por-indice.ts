import { INDICE_DA_VALIDACAO, type Catalogo } from './catalogo'
import { referencias, type Referencias } from './comparacao'
import {
  comMediaDoConsolidado,
  type CelulaComparada,
  type ItemDeComparacao,
  type LinhaComparada,
  type ReguaDaComparacao,
} from './comparativos'
import { abertasAteNivel, linhasDaGrade, type LinhaGrade } from './grade'

// A aba "Por índice" — a MESMA conta da Comparativos, transposta.
//
// ── POR QUE TRANSPOR ────────────────────────────────────────────────────────
//
// A Comparativos responde "como esta loja está em cada conta": ela tem o plano
// inteiro nas linhas e as lojas nas colunas, e por isso é uma ÁRVORE — ordenar
// por coluna separaria as filhas dos seus grupos, e a ordenação fica desligada
// lá.
//
// A pergunta do Felipe (21/09/2026) é a outra ponta: "quem é o maior e o menor
// NESTE índice?". Com as lojas nas LINHAS e uns poucos índices escolhidos nas
// colunas não há árvore nenhuma — ordenar é só clicar no cabeçalho, e a mesma
// loja se lê de um índice para o outro na mesma linha.
//
// ── O NÚMERO É O MESMO DAS OUTRAS ABAS ──────────────────────────────────────
//
// Nada é recalculado aqui: `linhasDaComparacao` já mede cada linha do plano em
// cada coluna e devolve a média, a melhor e a pior LOJA. Esta camada só vira a
// matriz de lado. Um número que divergisse da Comparativos seria um defeito com
// aparência de opinião.

export interface IndiceEscolhivel {
  /** A chave da linha da grade — o que a escolha guarda. */
  chave: string
  /** "MATERIA PRIMA", "Custo líquido do motoboy". */
  rotulo: string
  /** "2", "4.10.1", "10200"; "calc." nos calculados pelo painel. */
  codigo: string
  /** 1 a 3 no plano; 0 nos indicadores. Serve para o recuo na lista. */
  nivel: number
  grupo: 'plano' | 'indicadores'
  linha: LinhaGrade
}

/**
 * Todo índice que a aba pode mostrar: o plano inteiro mais os indicadores.
 *
 * ── A LISTA É MAIOR QUE A DAS GRADES ────────────────────────────────────────
 *
 * As grades (Plano de contas e Comparativos) mostram os indicadores de
 * `INDICADORES_DA_GRADE`, que é a ordem do HTML que especifica o módulo e deixa
 * de fora os que os cartões da Visão geral já apresentam — entre eles a
 * **RENTABILIDADE (10000)**, a variante com estoque (10001) e a matéria-prima
 * sobre a venda de restaurante (10101).
 *
 * Aqui a pergunta é outra: "quem é o maior e o menor NESTE índice?". Ficar de
 * fora de uma grade não é motivo para não poder ser ordenado, e quem procurava
 * "rentabilidade" na busca não achava nada (relato do Davi, 23/09/2026). Então
 * o que a grade esconde entra no fim do grupo Indicadores, na ordem do
 * catálogo.
 *
 * A única exclusão é a linha de validação (`INDICE_DA_VALIDACAO`): ela mede se
 * o plano fecha, não como a loja foi.
 */
export function indicesEscolhiveis(cat: Catalogo): IndiceEscolhivel[] {
  // Todos os níveis abertos: a lista de escolha não tem árvore, mostra tudo.
  const daGrade = linhasDaGrade(cat, abertasAteNivel(cat, 3))
  const jaListadas = new Set(daGrade.map((l) => l.chave))
  const escondidos = cat.contas
    .filter(
      (c) => c.nivel === 0 && c.indice !== INDICE_DA_VALIDACAO && !jaListadas.has(c.formatado)
    )
    .map<LinhaGrade>((c) => ({ tipo: 'conta', chave: c.formatado, conta: c }))
  // Antes dos calculados pelo painel: os do catálogo ficam juntos, e os cinco
  // que o painel inventa continuam no fim da lista.
  const corte = daGrade.findIndex((l) => l.tipo === 'calculado')
  const todas =
    corte < 0
      ? [...daGrade, ...escondidos]
      : [...daGrade.slice(0, corte), ...escondidos, ...daGrade.slice(corte)]

  return todas.flatMap<IndiceEscolhivel>((linha) => {
    if (linha.tipo === 'secao') return []
    if (linha.tipo === 'calculado') {
      return [
        {
          chave: linha.chave,
          rotulo: linha.ind.nome,
          codigo: 'calc.',
          nivel: 0,
          grupo: 'indicadores',
          linha,
        },
      ]
    }
    const c = linha.conta
    return [
      {
        chave: linha.chave,
        rotulo: c.descricao,
        codigo: c.formatado,
        nivel: c.nivel,
        grupo: c.nivel >= 1 ? 'plano' : 'indicadores',
        linha,
      },
    ]
  })
}

/** As chaves de uma lista de índices do DW — o que a aba abre marcado. */
export function chavesDosIndices(cat: Catalogo, indices: readonly number[]): string[] {
  const chaves: string[] = []
  for (const indice of indices) {
    const pos = cat.pos.get(indice)
    const c = pos === undefined ? undefined : cat.contas[pos]
    if (c) chaves.push(c.formatado)
  }
  return chaves
}

export interface LinhaDaUnidade {
  /** A loja, ou o grupo de lojas, da linha. */
  item: ItemDeComparacao
  /** Uma célula por índice escolhido, na ordem da escolha. */
  celulas: CelulaComparada[]
  /** A posição na ordem vigente, a partir de 1. Preenchida ao ordenar. */
  posicao: number
}

/** Vira a matriz de lado: uma linha por loja, uma célula por índice. */
export function linhasPorIndice(
  itens: readonly ItemDeComparacao[],
  comparadas: readonly LinhaComparada[]
): LinhaDaUnidade[] {
  return itens.map((item, i) => ({
    item,
    celulas: comparadas.map((c) => c.celulas[i]!),
    posicao: i + 1,
  }))
}

/**
 * A média, a melhor e a pior de cada índice ENTRE AS LINHAS EXIBIDAS.
 *
 * Aqui a régua não é a mesma da Comparativos (que é sempre de LOJAS, mesmo com
 * as colunas agrupadas): esta aba é um ranking do que está na tela, e com as
 * linhas por região a melhor loja não seria nenhuma das linhas — o destaque
 * nunca apareceria e a régua do gráfico marcaria um ponto fora da lista.
 */
export function referenciasDasLinhas(
  linhas: readonly LinhaDaUnidade[],
  comparadas: readonly LinhaComparada[],
  /** Quando a régua tem consolidado, a média vira o ÍNDICE MÉDIO da seleção. */
  regua?: ReguaDaComparacao,
  cat?: Catalogo
): Referencias[] {
  return comparadas.map((c, j) => {
    const base = referencias(
      linhas.map((l) => l.celulas[j]?.medida?.pct ?? null),
      c.direcao
    )
    return regua && cat ? comMediaDoConsolidado(base, c.linha, regua, cat) : base
  })
}

export type SentidoDaOrdem = 'desc' | 'asc'

/**
 * Ordena pelo valor de uma coluna, com quem não tem valor SEMPRE no fim — em
 * qualquer sentido. Loja sem dado no índice não é "a menor de todas": ela não
 * está na conta, e jogá-la para o topo ao inverter a ordem seria dizer o
 * contrário. Empate mantém a ordem de entrada, que é a alfabética.
 */
export function ordenarPorValor<T>(
  linhas: readonly T[],
  valor: (l: T) => number | null,
  sentido: SentidoDaOrdem
): T[] {
  return linhas
    .map((l, i) => ({ l, i, v: valor(l) }))
    .sort((a, b) => {
      if (a.v == null || b.v == null) {
        if (a.v == null && b.v == null) return a.i - b.i
        return a.v == null ? 1 : -1
      }
      if (a.v === b.v) return a.i - b.i
      return sentido === 'desc' ? b.v - a.v : a.v - b.v
    })
    .map((c) => c.l)
}
