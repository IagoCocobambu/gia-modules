import { RAZOES, RECALCULADAS, type Catalogo, type Parcela } from './catalogo'
import { rotuloDoMes } from './periodo'
import type { MatrizDoMes, StatusPlano } from './types'

// A matriz do mês no cliente, e as três operações que todo número do painel
// atravessa: AGREGAR o período de uma loja, SOMAR lojas e DERIVAR as contas que
// não se somam.
//
// ── A ORDEM IMPORTA ─────────────────────────────────────────────────────────
//
//   1. cada loja agrega os meses dela: fluxo soma, saldo fica com o último mês;
//   2. os agregados de lojas SOMAM (inclusive o saldo: estoque da rede é a soma
//      dos estoques);
//   3. só no fim as razões e as contas recalculadas são DERIVADAS das somas.
//
// Derivar antes de somar dá número errado sem aviso: a rentabilidade da rede
// viraria a soma das rentabilidades.
//
// Nada aqui conhece React. As quatro abas leem por estas funções, então o mesmo
// recorte dá o mesmo número em qualquer tela.

/** Um mês carregado: os valores de cada loja com plano, na ordem do catálogo. */
export interface MesCarregado {
  ano: number
  mes: number
  rotulo: string
  lojas: ReadonlyMap<string, { status: StatusPlano; v: Float64Array }>
}

/**
 * O agregado de uma loja num período — ou de várias lojas somadas.
 *
 * `bruto` guarda o que SOMA: o fluxo somado e o saldo do último mês. As posições
 * de razão e das contas recalculadas guardam lixo (a soma do gravado) e nunca são
 * lidas daqui: leia por `valores()`.
 */
export interface Agregado {
  bruto: Float64Array
  /**
   * A média mensal de cada conta: em cada loja, a soma dividida pelos meses em
   * que ela TEM plano, e depois somada entre as lojas. Loja sem plano num mês é
   * ausência, não zero. É o "faturamento mensal" do estoque sobre faturamento e
   * do DIO.
   */
  mediaMensal: Float64Array
  /** As lojas que entraram (com ao menos um mês de plano). */
  refs: string[]
}

/** Lê a matriz do servidor na ordem do catálogo do painel. */
export function carregarMes(m: MatrizDoMes, cat: Catalogo): MesCarregado {
  const n = cat.contas.length
  // O catálogo do mês e o do painel são o mesmo hoje; casar por índice deixa o
  // painel certo mesmo se um dia uma conta nova entrar no meio.
  const destino = m.indices.map((i) => cat.pos.get(i.indice) ?? -1)
  const lojas = new Map<string, { status: StatusPlano; v: Float64Array }>()
  for (const l of m.lojas) {
    const v = new Float64Array(n)
    for (let k = 0; k < destino.length; k += 1) {
      const p = destino[k]!
      if (p >= 0) v[p] = l.valores[k] ?? 0
    }
    lojas.set(l.ref, { status: l.status, v })
  }
  return { ano: m.ano, mes: m.mes, rotulo: rotuloDoMes(m), lojas }
}

/** Posições de saldo no vetor, calculadas uma vez por catálogo. */
const SALDOS_DO_CATALOGO = new WeakMap<Catalogo, number[]>()
function posicoesDeSaldo(cat: Catalogo): number[] {
  let p = SALDOS_DO_CATALOGO.get(cat)
  if (!p) {
    p = cat.contas.flatMap((c, k) => (c.natureza === 'saldo' ? [k] : []))
    SALDOS_DO_CATALOGO.set(cat, p)
  }
  return p
}

/**
 * Os meses com as operações de cada GRUPO somadas numa unidade só — o
 * "Consolidar matriz e filiais".
 *
 * A soma acontece AQUI, antes de qualquer conta: o grupo passa a ser uma loja
 * para todo o resto do painel (cartões, rankings, grade e comparação), e as
 * razões dele saem recalculadas sobre a soma, como as da rede. Consolidar depois
 * — somando percentuais já calculados — daria número errado sem aviso.
 *
 * O STATUS do grupo no mês é o MENOS avançado entre os membros com plano: se uma
 * filial ainda não entregou, o grupo não entregou. `Sem plano` de um membro não
 * conta: o grupo existe no mês em que ao menos um membro tem plano.
 */
export function consolidarMeses(
  meses: readonly MesCarregado[],
  unidadePorRef: ReadonlyMap<string, string>,
  cat: Catalogo
): MesCarregado[] {
  const n = cat.contas.length
  const ordem: Record<StatusPlano, number> = { Pendente: 0, Entregue: 1, Auditado: 2 }
  return meses.map((mes) => {
    const lojas = new Map<string, { status: StatusPlano; v: Float64Array }>()
    for (const [ref, { status, v }] of mes.lojas) {
      const unidade = unidadePorRef.get(ref) ?? ref
      const atual = lojas.get(unidade)
      if (!atual) {
        lojas.set(unidade, { status, v: new Float64Array(v) })
        continue
      }
      for (let k = 0; k < n; k += 1) atual.v[k] += v[k]!
      if (ordem[status] < ordem[atual.status]) atual.status = status
    }
    return { ...mes, lojas }
  })
}

/** O agregado de cada loja no período — só as lojas com ao menos um mês de plano. */
export function agregarPorLoja(
  meses: readonly MesCarregado[],
  cat: Catalogo
): Map<string, Agregado> {
  const n = cat.contas.length
  const saldos = posicoesDeSaldo(cat)
  const acumulado = new Map<string, { bruto: Float64Array; meses: number }>()
  for (const mes of meses) {
    for (const [ref, { v }] of mes.lojas) {
      let a = acumulado.get(ref)
      if (!a) {
        a = { bruto: new Float64Array(n), meses: 0 }
        acumulado.set(ref, a)
      }
      for (let k = 0; k < n; k += 1) a.bruto[k] += v[k]!
      // Saldo: o último mês com plano vence. Os meses chegam em ordem.
      for (const k of saldos) a.bruto[k] = v[k]!
      a.meses += 1
    }
  }
  const saida = new Map<string, Agregado>()
  for (const [ref, a] of acumulado) {
    const mediaMensal = new Float64Array(n)
    for (let k = 0; k < n; k += 1) mediaMensal[k] = a.bruto[k]! / a.meses
    for (const k of saldos) mediaMensal[k] = a.bruto[k]!
    saida.set(ref, { bruto: a.bruto, mediaMensal, refs: [ref] })
  }
  return saida
}

/** A soma de vários agregados — o consolidado de um conjunto de lojas. */
export function somar(ags: readonly Agregado[], cat: Catalogo): Agregado {
  const n = cat.contas.length
  const bruto = new Float64Array(n)
  const mediaMensal = new Float64Array(n)
  const refs: string[] = []
  for (const a of ags) {
    for (let k = 0; k < n; k += 1) {
      bruto[k] += a.bruto[k]!
      mediaMensal[k] += a.mediaMensal[k]!
    }
    refs.push(...a.refs)
  }
  return { bruto, mediaMensal, refs }
}

/** O consolidado das lojas `refs` a partir dos agregados por loja. */
export function consolidar(
  porLoja: ReadonlyMap<string, Agregado>,
  refs: Iterable<string>,
  cat: Catalogo
): Agregado {
  const ags: Agregado[] = []
  for (const ref of refs) {
    const a = porLoja.get(ref)
    if (a) ags.push(a)
  }
  return somar(ags, cat)
}

function somaDasParcelas(v: Float64Array, cat: Catalogo, parcelas: readonly Parcela[]): number {
  let s = 0
  for (const [indice, sinal] of parcelas) {
    const p = cat.pos.get(indice)
    if (p !== undefined) s += sinal * v[p]!
  }
  return s
}

const VALORES = new WeakMap<Agregado, Float64Array>()

/**
 * Os valores de cada conta do agregado, prontos para ler: as recalculadas
 * refeitas pela regra vigente e as razões sobre as somas. Razão sem base (divisor
 * zero) é `NaN` — "sem dado", nunca zero, que sairia como a melhor loja numa
 * comparação.
 *
 * Guardado por agregado: as abas leem o mesmo objeto muitas vezes.
 */
export function valores(ag: Agregado, cat: Catalogo): Float64Array {
  const pronto = VALORES.get(ag)
  if (pronto) return pronto
  const v = new Float64Array(ag.bruto)
  for (const [indice, parcelas] of RECALCULADAS) {
    const p = cat.pos.get(indice)
    if (p !== undefined) v[p] = somaDasParcelas(v, cat, parcelas)
  }
  for (const [indice, { num, den }] of RAZOES) {
    const p = cat.pos.get(indice)
    if (p === undefined) continue
    const d = somaDasParcelas(v, cat, den)
    v[p] = Math.abs(d) < 1e-9 ? Number.NaN : somaDasParcelas(v, cat, num) / d
  }
  VALORES.set(ag, v)
  return v
}

/** O valor de uma conta no agregado; `null` quando é razão sem base. */
export function valorDe(ag: Agregado, cat: Catalogo, indice: number): number | null {
  const p = cat.pos.get(indice)
  if (p === undefined) return null
  const v = valores(ag, cat)[p]!
  return Number.isFinite(v) ? v : null
}

/** A média mensal de uma conta (fluxo), somada entre as lojas do agregado. */
export function mediaMensalDe(ag: Agregado, cat: Catalogo, indice: number): number {
  const p = cat.pos.get(indice)
  return p === undefined ? 0 : ag.mediaMensal[p]!
}

/** Os meses em que cada loja tem plano, e o status de cada um. */
export function statusPorLoja(meses: readonly MesCarregado[]): Map<string, StatusPlano[]> {
  const saida = new Map<string, StatusPlano[]>()
  for (const m of meses) {
    for (const [ref, { status }] of m.lojas) {
      const lista = saida.get(ref)
      if (lista) lista.push(status)
      else saida.set(ref, [status])
    }
  }
  return saida
}

/** A loja tem plano em TODOS os meses dados? */
export function temPlanoEmTodos(meses: readonly MesCarregado[], ref: string): boolean {
  return meses.length > 0 && meses.every((m) => m.lojas.has(ref))
}
