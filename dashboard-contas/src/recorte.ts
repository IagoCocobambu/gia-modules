import type { Catalogo } from './catalogo'
import {
  agregarPorLoja,
  consolidar,
  statusPorLoja,
  temPlanoEmTodos,
  type Agregado,
  type MesCarregado,
} from './matriz'
import type { StatusNoMes, StatusPlano } from './types'

// O RECORTE aplicado, calculado uma vez e lido pelas quatro abas: quais lojas estão
// na conta, o agregado de cada uma no período e no período anterior, e os
// consolidados que as variações comparam.
//
// ── AS MESMAS LOJAS NAS DUAS PONTAS ─────────────────────────────────────────
//
// Toda variação (cartões, composição, tabela de lojas, árvore) compara só as
// lojas com plano nos DOIS períodos — a regra do Dashboard de RH (João,
// 15/09/2026). Sem ela, um mês entregue em parte faria a rede "perder" o
// faturamento de quem ainda não entregou. Quem fica de fora é listado, com o
// motivo, para a tela dizer.
//
// O filtro "Mesmas lojas" vai além: tira do painel INTEIRO quem não tem plano em
// todos os meses dos dois períodos.

export interface ForaDaVariacao {
  ref: string
  motivo: string
}

export interface RecorteCalculado {
  /** As operações na conta: marcadas, com status que passa no filtro. */
  naConta: ReadonlySet<string>
  /** Agregado de cada loja no período (só as com ao menos um mês de plano). */
  porLoja: ReadonlyMap<string, Agregado>
  /** Agregado de cada loja no período anterior. */
  porLojaAnterior: ReadonlyMap<string, Agregado>
  /** O consolidado das operações na conta, no período. */
  consolidado: Agregado
  /** As lojas na conta com plano nos dois períodos — a base das variações. */
  nasDuasPontas: ReadonlySet<string>
  /** O consolidado de `nasDuasPontas` no período e no anterior. */
  mesmasAtual: Agregado
  mesmasAnterior: Agregado
  /** As lojas na conta que ficaram fora da variação, e por quê. */
  foraDaVariacao: ForaDaVariacao[]
  /** Status de cada operação em cada mês do período (na ordem dos meses). */
  statusPorLoja: ReadonlyMap<string, StatusNoMes[]>
  /**
   * O GRUPO: as unidades do `universo` — marcadas ou não — que passam nos mesmos
   * filtros de status e de "Mesmas lojas" da seleção. É a base da "Média do
   * grupo" da aba Comparativos. Vazio quando o universo não é informado.
   */
  grupo: ReadonlySet<string>
}

export type FiltroDeStatus = 'Todos' | StatusPlano

export function calcularRecorte(opcoes: {
  cat: Catalogo
  meses: readonly MesCarregado[]
  mesesAnteriores: readonly MesCarregado[]
  marcadas: readonly string[]
  status: FiltroDeStatus
  mesmasLojas: boolean
  rotuloAnterior: string
  /**
   * Todas as unidades que o usuário enxerga, sem as de teste — o grupo da "Média
   * do grupo". O plano delas já vem na mesma consulta das marcadas: a matriz de
   * cada mês traz a rede inteira, e a seleção só filtra aqui.
   */
  universo?: readonly string[]
}): RecorteCalculado {
  const { cat, meses, mesesAnteriores, marcadas, status, mesmasLojas, rotuloAnterior } = opcoes
  const comPlano = statusPorLoja(meses)
  // O status de cada loja MÊS A MÊS, com "Sem plano" onde ela não tem — é o que o
  // selo de pendências e a dica de meses usam.
  const statusMensal = new Map<string, StatusNoMes[]>()
  for (const ref of marcadas) {
    statusMensal.set(
      ref,
      meses.map((m) => m.lojas.get(ref)?.status ?? 'Sem plano')
    )
  }

  // O mesmo filtro para a seleção e para o grupo: comparar a loja com um grupo
  // filtrado de outro jeito mediria a diferença entre os filtros.
  const passa = (ref: string) =>
    (status === 'Todos' || (comPlano.get(ref) ?? []).includes(status)) &&
    (!mesmasLojas || (temPlanoEmTodos(meses, ref) && temPlanoEmTodos(mesesAnteriores, ref)))
  const naConta = new Set(marcadas.filter(passa))
  const grupo = new Set((opcoes.universo ?? []).filter(passa))

  const porLoja = agregarPorLoja(meses, cat)
  const porLojaAnterior = agregarPorLoja(mesesAnteriores, cat)
  const consolidado = consolidar(porLoja, naConta, cat)

  const nasDuasPontas = new Set<string>()
  const foraDaVariacao: ForaDaVariacao[] = []
  for (const ref of naConta) {
    const agora = porLoja.has(ref)
    const antes = porLojaAnterior.has(ref)
    if (agora && antes) nasDuasPontas.add(ref)
    // Loja sem plano nas duas pontas não está em número nenhum: não é listada.
    else if (agora) foraDaVariacao.push({ ref, motivo: `Sem plano em ${rotuloAnterior}` })
    else if (antes) foraDaVariacao.push({ ref, motivo: 'Sem plano no período escolhido' })
  }

  return {
    naConta,
    porLoja,
    porLojaAnterior,
    consolidado,
    nasDuasPontas,
    mesmasAtual: consolidar(porLoja, nasDuasPontas, cat),
    mesmasAnterior: consolidar(porLojaAnterior, nasDuasPontas, cat),
    foraDaVariacao,
    statusPorLoja: statusMensal,
    grupo,
  }
}
