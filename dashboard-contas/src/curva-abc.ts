// A CURVA ABC do faturamento — a do fim da aba RANKING do BI mensal (colunas AG a
// AN): as unidades em ordem de faturamento, a fatia de cada uma no total, a soma
// acumulada das fatias e a letra.
//
// ── OS CORTES SÃO OS DO BI ──────────────────────────────────────────────────
//
// A até 70% do faturamento acumulado, B até 90%, C o resto. Conferidos na própria
// planilha de agosto/2026: RECIFE fecha a classe A com 69,41% (célula AL33) e
// MEIRELES + VASTO FORTALEZA abre a B com 70,96% (AL34); CB IGUATEMI BSB fecha a
// B com 89,40% (AL48) e CB SUL abre a C com 90,51% (AL49). Fixos, iguais aos do
// BI — decisão do João, 28/09/2026.
//
// O acumulado de cada unidade INCLUI a própria fatia: é o que a coluna AL da
// planilha mostra, e é a leitura que reproduz as letras dela (o teste confere as
// 58). A única exceção é a primeira, que é sempre A. Com duas ou três lojas
// marcadas, a maior pode passar sozinha de 70%, e a regra do BI a mandaria para a
// B — a maior loja da seleção classificada como intermediária.
//
// ── É DAS UNIDADES CONSULTADAS ──────────────────────────────────────────────
//
// O total é o das unidades na conta, não o da rede: o painel compara o que o
// usuário consultou (decisão do João, 28/09/2026). Com a rede inteira marcada, a
// curva é a do BI. Unidade sem faturamento — sem plano no período, ou com
// faturamento zero ou negativo — fica fora da curva: ela não tem fatia.

export type ClasseAbc = 'A' | 'B' | 'C'

/** Até onde vai cada classe, em faturamento acumulado (de 0 a 1). */
export const CORTES_ABC = { A: 0.7, B: 0.9 } as const

export interface PontoDaCurva<T> {
  item: T
  /** 1 para a unidade de maior faturamento. */
  posicao: number
  faturamento: number
  /** A fatia no total das unidades da curva, de 0 a 1. */
  participacao: number
  /** A soma das fatias até esta, inclusive, de 0 a 1. */
  acumulado: number
  classe: ClasseAbc
}

/** A letra de um acumulado. A folga absorve o ruído da soma de frações. */
export function classeDoAcumulado(acumulado: number): ClasseAbc {
  if (acumulado <= CORTES_ABC.A + 1e-9) return 'A'
  if (acumulado <= CORTES_ABC.B + 1e-9) return 'B'
  return 'C'
}

/**
 * A curva: só as unidades com faturamento positivo, do maior para o menor.
 * Empate mantém a ordem de entrada.
 */
export function curvaAbc<T>(
  itens: readonly T[],
  faturamentoDe: (item: T) => number | null
): PontoDaCurva<T>[] {
  const comFaturamento = itens
    .map((item) => ({ item, faturamento: faturamentoDe(item) }))
    .filter(
      (x): x is { item: T; faturamento: number } =>
        x.faturamento != null && Number.isFinite(x.faturamento) && x.faturamento > 0
    )
    .sort((a, b) => b.faturamento - a.faturamento)
  const total = comFaturamento.reduce((s, x) => s + x.faturamento, 0)
  if (total <= 0) return []
  let acumulado = 0
  return comFaturamento.map((x, i) => {
    const participacao = x.faturamento / total
    acumulado += participacao
    return {
      item: x.item,
      posicao: i + 1,
      faturamento: x.faturamento,
      participacao,
      acumulado,
      classe: i === 0 ? 'A' : classeDoAcumulado(acumulado),
    }
  })
}

export interface ResumoDaClasse {
  unidades: number
  /** A soma das fatias da classe, de 0 a 1. */
  participacao: number
}

/** Quantas unidades e quanto do faturamento cada classe tem. */
export function resumoDaCurva<T>(
  pontos: readonly PontoDaCurva<T>[]
): Record<ClasseAbc, ResumoDaClasse> {
  const r: Record<ClasseAbc, ResumoDaClasse> = {
    A: { unidades: 0, participacao: 0 },
    B: { unidades: 0, participacao: 0 },
    C: { unidades: 0, participacao: 0 },
  }
  for (const p of pontos) {
    r[p.classe].unidades += 1
    r[p.classe].participacao += p.participacao
  }
  return r
}
