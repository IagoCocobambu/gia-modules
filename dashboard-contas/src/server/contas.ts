import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Handler BFF — a matriz do Plano de Contas de UM mês: as 169 contas de cada loja
// do escopo que tem plano vigente, sem consolidar.
//
// ── POR QUE O MÊS INTEIRO, E NÃO SÓ O QUE A TELA MOSTRA ─────────────────────
//
// As grades leem o plano inteiro: a árvore do Plano de contas desce até o
// nível 3, os Comparativos também, e os indicadores gerenciais dependem de contas
// de todos os grupos. Medido no DW de produção em 18/09/2026: jun/26 são 16.055
// linhas (95 lojas × 169 contas), ~0,7 s. É consulta síncrona comum; um período
// de 12 meses são 12 chamadas deste tamanho, cada uma no cache do mês.
//
// A consolidação NÃO acontece aqui: é função pura no cliente, e o usuário troca
// seleção, agrupamento e referência o tempo todo. Buscar uma vez por mês e
// recalcular no cliente troca uma ida à rede por clique por nenhuma.
//
// ── O ESCOPO É O DO USUÁRIO, E O CORPO NÃO CARREGA LOJA ─────────────────────
//
// As lojas saem de `ctx.operacoes()`. Handler que recebesse loja no corpo
// precisaria de `ctx.requireOperacao` — não recebendo, o problema não existe.
// O `loc_ref` é comparado sem caixa e sem espaço nas pontas, porque foi digitado
// por gente ao longo de anos.
//
// ── ARMADILHAS ──────────────────────────────────────────────────────────────
//
//   • `plano_conta.planos.id` é bigint, e o postgres.js o entrega como string.
//   • O resumo casa pelo `plano_id` dos planos VIGENTES, resolvidos antes: a
//     `resumo_uk` começa por `indice`, e o join por (ano, mês, loc_ref) faz uma
//     busca por linha (medido pelo `plano-contas`: ~510 ms contra ~150 ms).
//   • numeric chega como string — normalizado por `num()`.
//   • Razões e as contas 11003/11004 descem como estão gravadas. O dado gravado
//     não é homogêneo (dois sinais no 11003, razões arredondadas a 2 casas), e
//     quem as refaz é o domínio do cliente, num lugar só e testado.

interface IndiceDb {
  indice: number
  descricao: string | null
  indice_formatado: string | null
  is_input: boolean | null
  is_group: boolean | null
}

interface PlanoDb {
  id: string | number
  loc_ref: string
  entregue: boolean | null
  auditado: boolean | null
}

interface ValorDb {
  plano_id: string | number
  indice: number
  valor: string | number | null
}

interface OrcadoDb {
  loc_ref: string
  indice: number
  valor: string | number | null
}

type StatusPlano = 'Pendente' | 'Entregue' | 'Auditado'

interface IndiceOut {
  indice: number
  formatado: string
  descricao: string
  isInput: boolean
  isGroup: boolean
}

interface LojaOut {
  ref: string
  status: StatusPlano
  valores: Array<number | null>
}

interface MatrizOut {
  ano: number
  mes: number
  indices: IndiceOut[]
  lojas: LojaOut[]
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function mesValido(ano: unknown, mes: unknown): { ano: number; mes: number } {
  const a = Number(ano)
  const m = Number(mes)
  if (!Number.isInteger(a) || !Number.isInteger(m) || a < 2000 || a > 2100 || m < 1 || m > 12) {
    throw new HttpError(400, 'Mês inválido.')
  }
  return { ano: a, mes: m }
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
// Medido em produção em 28/09/2026: ago/26 do orçado são 15.886 linhas (94
// lojas × 169 contas), de 0,2 a 0,8 s — o custo da matriz do realizado.
//
// O STATUS do orçado não existe para o painel: toda loja sai "Entregue", e nada
// o lê — o filtro de status e as pendências olham só o realizado.
type Fonte = 'realizado' | 'orcado'

export default defineHandler<
  { ano: number; mes: number; lojas?: LojaDoPedido[]; fonte?: Fonte },
  MatrizOut
>(async (ctx) => {
  await ctx.requirePermission('dashboard-contas.ler')
  const { ano, mes } = mesValido(ctx.body?.ano, ctx.body?.mes)

  const indicesDb = await sql<IndiceDb[]>`
    SELECT i.indice, i.descricao, i.indice_formatado, i.is_input, i.is_group
    FROM "plano_conta"."indices" i
    ORDER BY i.indice
  `
  const indices: IndiceOut[] = indicesDb.map((i) => ({
    indice: i.indice,
    formatado: (i.indice_formatado ?? String(i.indice)).trim(),
    descricao: (i.descricao ?? '').trim(),
    isInput: !!i.is_input,
    isGroup: !!i.is_group,
  }))

  // A comparação com o data-warehouse é sem caixa e sem espaço nas pontas: o
  // `loc_ref` de lá foi digitado por gente ao longo de anos.
  const universo = await universoDeLojas(ctx)
  if (universo.size === 0) return { ano, mes, indices, lojas: [] }
  const refPorNorm = new Map([...universo].map(([norm, l]) => [norm, l.ref]))
  const refsNorm = [...refPorNorm.keys()]

  if (ctx.body?.fonte === 'orcado') {
    const linhas = await sql<OrcadoDb[]>`
      SELECT TRIM(UPPER(r.loc_ref)) AS loc_ref, r.indice, r.valor
      FROM "plano_orcamento"."resumo" r
      WHERE r.ano = ${ano}
        AND r.mes = ${mes}
        AND COALESCE(r.is_last, TRUE) = TRUE
        AND TRIM(UPPER(r.loc_ref)) = ANY(${refsNorm})
    `
    const posicaoDoOrcado = new Map(indices.map((i, k) => [i.indice, k]))
    const porRef = new Map<string, LojaOut>()
    for (const l of linhas) {
      const ref = refPorNorm.get(l.loc_ref)
      const k = posicaoDoOrcado.get(l.indice)
      if (!ref || k === undefined) continue
      let loja = porRef.get(ref)
      if (!loja) {
        loja = { ref, status: 'Entregue', valores: indices.map(() => null) }
        porRef.set(ref, loja)
      }
      loja.valores[k] = num(l.valor)
    }
    return { ano, mes, indices, lojas: [...porRef.values()] }
  }

  const planos = await sql<PlanoDb[]>`
    SELECT p.id, TRIM(UPPER(p.loc_ref)) AS loc_ref, p.entregue, p.auditado
    FROM "plano_conta"."planos" p
    WHERE p.ano = ${ano}
      AND p.mes = ${mes}
      AND p.deletado_em IS NULL
      AND COALESCE(p.is_last, TRUE) = TRUE
      AND TRIM(UPPER(p.loc_ref)) = ANY(${refsNorm})
  `
  if (planos.length === 0) return { ano, mes, indices, lojas: [] }

  // Um plano por loja. O vigente é único pela regra de `is_last`, mas lixo antigo
  // com dois vigentes no mesmo mês faria a loja aparecer duas vezes e dobrar a
  // conta da rede: fica o de id maior, o mais novo.
  const vigentePorRef = new Map<string, PlanoDb>()
  for (const p of planos) {
    const atual = vigentePorRef.get(p.loc_ref)
    if (!atual || BigInt(String(p.id)) > BigInt(String(atual.id))) vigentePorRef.set(p.loc_ref, p)
  }
  const vigentes = [...vigentePorRef.values()]
  const ids = vigentes.map((p) => String(p.id))
  const valores = await sql<ValorDb[]>`
    SELECT r.plano_id, r.indice, r.valor
    FROM "plano_conta"."resumo" r
    WHERE r.plano_id = ANY(${ids}::bigint[])
  `

  const posicao = new Map(indices.map((i, k) => [i.indice, k]))
  const porPlano = new Map<string, LojaOut>()
  for (const p of vigentes) {
    const ref = refPorNorm.get(p.loc_ref)
    if (!ref) continue
    // A situação é a regra do próprio `plano-contas`: não há coluna de status.
    const status: StatusPlano = p.entregue ? (p.auditado ? 'Auditado' : 'Entregue') : 'Pendente'
    porPlano.set(String(p.id), { ref, status, valores: indices.map(() => null) })
  }
  for (const v of valores) {
    const loja = porPlano.get(String(v.plano_id))
    const k = posicao.get(v.indice)
    if (!loja || k === undefined) continue
    loja.valores[k] = num(v.valor)
  }

  return { ano, mes, indices, lojas: [...porPlano.values()] }
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
