import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Handler BFF — a série da EVOLUÇÃO: poucas contas, por loja, nos meses que
// terminam no mês pedido (12 por padrão).
//
// ── POR QUE UMA CONSULTA À PARTE ────────────────────────────────────────────
//
// Os gráficos de evolução da Visão geral precisam de 12 meses, e esticar a
// matriz inteira (`contas`, 169 contas) por 12 meses seriam ~190 mil linhas para
// desenhar oito números por mês. Aqui descem só as contas que os gráficos usam
// (~9 mil linhas num ano de 95 lojas). O mesmo arranjo do `historico` do
// Dashboard de RH.
//
// As contas são FIXAS e não vêm do corpo: o cliente não escolhe o que o servidor
// lê. A consolidação (somar as lojas selecionadas, recalcular a rentabilidade)
// continua no cliente, pelas mesmas funções da matriz.
//
// O escopo é o de `ctx.operacoes()`; o corpo não carrega loja.

/**
 * As contas que descem, na ordem em que entram no vetor de cada mês (a posição é
 * contrato com `src/visao.ts`, que monta o catálogo da série a partir de
 * `contas`).
 *
 * Os oito primeiros desenham o gráfico de resultado: 1 faturamento ·
 * 2 matéria-prima · 3 impostos · 4 custos operacionais · 5 investimentos ·
 * 6 lucro s/ invest. · 7 lucro c/ invest. · 10103 variação de estoque.
 *
 * ⚠️ Os demais são as PARCELAS das razões que a faixa de indicadores desenha no
 * tempo, e a lista tem de conter TODAS elas: razão a que falte uma parcela é
 * calculada com a parcela valendo zero, e sai um número errado sem aviso.
 *
 * - 10200 LABOR (sobre o faturamento);
 * - 10101 = 2 ÷ (1 − 1.1.4 − 1.2.2 − 1.5 − 1.6 − 1.7 − 1.8);
 * - 20001 = 4.10.1 ÷ 1.2 · 20002 = 1.1.3 ÷ 2.2.2 · 20003 = 1.1.4 ÷ 4.10.2.
 *
 * São 20 contas: num ano de 95 lojas, ~22 mil linhas — a matriz inteira (169
 * contas) daria ~190 mil para desenhar uma linha por mês.
 */
export const CONTAS = [
  1000, 2000, 3000, 4000, 6000, 7000, 8000, 10103, 10200, 1130, 1140, 1200, 1220, 1500, 1600, 1700,
  1800, 2220, 4911, 4912,
]

const TETO_DE_MESES = 24

interface PlanoDb {
  id: string | number
  ano: number
  mes: number
  loc_ref: string
}

interface ValorDb {
  plano_id: string | number
  indice: number
  valor: string | number | null
}

interface OrcadoDb {
  loc_ref: string
  ano: number
  mes: number
  indice: number
  valor: string | number | null
}

interface SerieOut {
  meses: Array<{ ano: number; mes: number }>
  contas: number[]
  lojas: Array<{ ref: string; porMes: Array<Array<number | null> | null> }>
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

// ── QUAIS LOJAS ENTRAM NA CONTA ─────────────────────────────────────────────
//
// `ctx.operacoes()` é sempre o ESCOPO DE EMPRESA do usuário, e a SDK não tem
// modo amplo para LISTAR. Quem conhece a rede inteira é o cliente, que lê o
// cadastro do portal e manda a lista em `lojas`.
//
// Por isso o universo é "escopo ∪ lista do cliente", e a união só acontece para
// quem tem `dashboard-contas.ler-rede`. Sem a chave, a lista do corpo é ignorada
// por inteiro e o painel responde pelo escopo.
//
// Ampliar aqui não amplia escrita: este módulo não grava em lugar nenhum. Loja
// inventada no corpo não vira acesso a nada — ela é só chave de busca no
// data-warehouse, que devolve zero linha para quem não tem plano. E a loja do
// ESCOPO nunca é sobrescrita pelo que o cliente mandou.
//
// ⚠️ DUPLICADO nos dois handlers de propósito: cada um é empacotado sozinho pelo
// `gia pack`, e handler que importa arquivo local não é o padrão do repositório.
// Mudança aqui é mudança nos dois.
export interface LojaDoPedido {
  ref: string
  nome: string
}

export interface ContextoDeLojas {
  body: { lojas?: LojaDoPedido[] }
  operacoes: () => Promise<Array<{ ref: string; nome: string }>>
  hasPermission: (permission: string) => Promise<boolean>
}

/**
 * Exportada para os testes. O handler não é testável — depende de `ctx` e do
 * banco —, mas esta é a regra que decide QUAIS LOJAS entram na conta, e errar
 * nela é mostrar loja demais ou de menos sem nada acusar.
 */
export async function universoDeLojas(ctx: ContextoDeLojas): Promise<Map<string, LojaDoPedido>> {
  const universo = new Map<string, LojaDoPedido>()
  for (const o of await ctx.operacoes()) {
    const norm = o.ref.trim().toUpperCase()
    if (norm) universo.set(norm, { ref: o.ref, nome: o.nome })
  }
  if (await ctx.hasPermission('dashboard-contas.ler-rede')) {
    for (const l of ctx.body.lojas ?? []) {
      const norm = String(l?.ref ?? '')
        .trim()
        .toUpperCase()
      if (norm && !universo.has(norm)) universo.set(norm, { ref: l.ref, nome: l.nome || l.ref })
    }
  }
  return universo
}

// ── O ORÇADO, PELA MESMA PORTA ──────────────────────────────────────────────
//
// `fonte: 'orcado'` troca o Plano de Contas pelo Plano de Orçamentos da loja —
// o Contra: Orçado da aba Análises adicionais, a aba REAL VS ORÇADO do BI. Os 169
// índices de `plano_orcamento.indices` são os MESMOS de `plano_conta.indices`
// (conferidos um a um em produção, 25/09/2026), então o que desce aqui se lê
// pelas mesmas funções do realizado.
//
// A fonte é um de dois valores fixos, e qualquer outro cai no realizado: o
// cliente escolhe QUAL dos dois planos, nunca uma tabela.
//
// O orçamento não tem tabela de planos: o `is_last` mora na linha do resumo, e
// não há `deletado_em` — o mesmo que o Dashboard de RH encontrou ao ler a mesma
// tabela. Nenhuma linha vigente duplicada em 2026 (conferido em 28/09/2026).
//
// Medido em produção em 28/09/2026: os 12 meses de 2026 em 9 contas são ~10 mil
// linhas, 0,3 s.
type Fonte = 'realizado' | 'orcado'

export default defineHandler<
  { ano: number; mes: number; meses?: number; lojas?: LojaDoPedido[]; fonte?: Fonte },
  SerieOut
>(async (ctx) => {
  await ctx.requirePermission('dashboard-contas.ler')
  const ano = Number(ctx.body?.ano)
  const mes = Number(ctx.body?.mes)
  const quantos = ctx.body?.meses == null ? 12 : Number(ctx.body.meses)
  if (
    !Number.isInteger(ano) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(quantos) ||
    ano < 2000 ||
    ano > 2100 ||
    mes < 1 ||
    mes > 12 ||
    quantos < 1 ||
    quantos > TETO_DE_MESES
  ) {
    throw new HttpError(400, 'Período inválido.')
  }

  // A janela em "número de mês" (ano × 12 + mês − 1): comparar um inteiro só
  // dispensa a aritmética de virada de ano no SQL.
  const fim = ano * 12 + (mes - 1)
  const inicio = fim - (quantos - 1)
  const meses = Array.from({ length: quantos }, (_, i) => ({
    ano: Math.floor((inicio + i) / 12),
    mes: ((inicio + i) % 12) + 1,
  }))

  const universo = await universoDeLojas(ctx)
  if (universo.size === 0) return { meses, contas: CONTAS, lojas: [] }
  const refPorNorm = new Map([...universo].map(([norm, l]) => [norm, l.ref]))
  const refsNorm = [...refPorNorm.keys()]
  const posicaoConta = new Map(CONTAS.map((c, k) => [c, k]))

  if (ctx.body?.fonte === 'orcado') {
    const linhas = await sql<OrcadoDb[]>`
      SELECT TRIM(UPPER(r.loc_ref)) AS loc_ref, r.ano, r.mes, r.indice, r.valor
      FROM "plano_orcamento"."resumo" r
      WHERE (r.ano * 12 + r.mes - 1) BETWEEN ${inicio} AND ${fim}
        AND COALESCE(r.is_last, TRUE) = TRUE
        AND r.indice = ANY(${CONTAS}::int[])
        AND TRIM(UPPER(r.loc_ref)) = ANY(${refsNorm})
    `
    const doOrcado = new Map<string, { ref: string; porMes: Array<Array<number | null> | null> }>()
    for (const l of linhas) {
      const ref = refPorNorm.get(l.loc_ref)
      const k = posicaoConta.get(l.indice)
      if (!ref || k === undefined) continue
      let loja = doOrcado.get(ref)
      if (!loja) {
        loja = { ref, porMes: meses.map(() => null) }
        doOrcado.set(ref, loja)
      }
      const i = l.ano * 12 + l.mes - 1 - inicio
      let vetor = loja.porMes[i]
      if (!vetor) {
        vetor = CONTAS.map(() => null)
        loja.porMes[i] = vetor
      }
      vetor[k] = num(l.valor)
    }
    return { meses, contas: CONTAS, lojas: [...doOrcado.values()] }
  }

  const planos = await sql<PlanoDb[]>`
      SELECT p.id, p.ano, p.mes, TRIM(UPPER(p.loc_ref)) AS loc_ref
      FROM "plano_conta"."planos" p
      WHERE (p.ano * 12 + p.mes - 1) BETWEEN ${inicio} AND ${fim}
        AND p.deletado_em IS NULL
        AND COALESCE(p.is_last, TRUE) = TRUE
        AND TRIM(UPPER(p.loc_ref)) = ANY(${refsNorm})
    `
  if (planos.length === 0) return { meses, contas: CONTAS, lojas: [] }

  // Um plano por loja e mês — o de id maior, se houver lixo com dois vigentes.
  const vigente = new Map<string, PlanoDb>()
  for (const p of planos) {
    const chave = `${p.loc_ref}|${p.ano * 12 + p.mes - 1}`
    const atual = vigente.get(chave)
    if (!atual || BigInt(String(p.id)) > BigInt(String(atual.id))) vigente.set(chave, p)
  }
  const ids = [...vigente.values()].map((p) => String(p.id))

  const valores = await sql<ValorDb[]>`
      SELECT r.plano_id, r.indice, r.valor
      FROM "plano_conta"."resumo" r
      WHERE r.plano_id = ANY(${ids}::bigint[])
        AND r.indice = ANY(${CONTAS}::int[])
    `

  const lojas = new Map<string, { ref: string; porMes: Array<Array<number | null> | null> }>()
  const vetorPorPlano = new Map<string, Array<number | null>>()
  for (const p of vigente.values()) {
    const ref = refPorNorm.get(p.loc_ref)
    if (!ref) continue
    let loja = lojas.get(ref)
    if (!loja) {
      loja = { ref, porMes: meses.map(() => null) }
      lojas.set(ref, loja)
    }
    const vetor: Array<number | null> = CONTAS.map(() => null)
    loja.porMes[p.ano * 12 + p.mes - 1 - inicio] = vetor
    vetorPorPlano.set(String(p.id), vetor)
  }
  for (const v of valores) {
    const vetor = vetorPorPlano.get(String(v.plano_id))
    const k = posicaoConta.get(v.indice)
    if (!vetor || k === undefined) continue
    vetor[k] = num(v.valor)
  }

  return { meses, contas: CONTAS, lojas: [...lojas.values()] }
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
