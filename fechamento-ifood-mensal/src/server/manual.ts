import { defineHandler, envOptional, HttpError, sql } from '@gia-cb/sdk/server'

// A parte do fechamento que NÃO vem do iFood, lida do banco do Maestro:
//
// 1. Borderô (`bordero.borderos`, só leitura): o que a loja lançou no caixa por dia —
//    CB Online (`din_ifood_online`), CB Descontos iFood (`din_desconto_ifood`) e
//    Adquirentes caixa (`ent_ifood_adquirentes`). Vale a versão vigente de cada
//    borderô (a última alteração, ou o original quando não há alteração) — a mesma
//    consulta do legado (GetBorderoIfoodBatch).
// 2. O que o usuário digitou e gravou (`ifood_fechamento.*`): previsão de pagamento,
//    CB Descontos LOJA e comentário por dia, breakdown da Conferência, extrato
//    bancário e cancelados pós-entrega (LoadManualMensalJson).
//
// O dia junta os dois: borderô primeiro, o gravado por cima (MergeManualMensalJson).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  /** `operacao_ref` da loja escolhida. */
  operacaoRef: string
  mes: string
}

interface OnlineDia {
  previsao?: string
  cbOnline?: number
  cbDescontosIfood?: number
  cbDescontosLoja?: number | null
  comentario?: string
}
interface AdquirenteDia {
  previsao?: string
  caixa?: number
  comentario?: string
}
interface LinhaExtrato {
  loja: string
  banco: string
  tipo: string
  mesAno: string
  classificacao: string
  subClassificacao: string
  dataMovimento: string
  historico: string
  documento: string
  malote: number
  competencia: string
}
interface LinhaCancelado {
  dataPedido: string
  estabelecimento: string
  cnpj: string
  nomeCliente: string
  numeroPedido: string
  idIfood: string
  valorPedidoTaxa: number
  valorReembolso: number | null
  centroVenda: string
  origemCancelamento: string
  justificativa: string
  andamento: string
  protocolo: string
  valeNoCofre: string
  dataAnulacao: string
  dataReembolso: string
}
interface Resposta {
  locRef: string
  online: Record<string, OnlineDia>
  adquirente: Record<string, AdquirenteDia>
  conferencia: Record<string, number>
  extrato: LinhaExtrato[]
  cancelados: LinhaCancelado[]
  anulacaoVerificar: number
  /** Última gravação do fechamento deste mês (ISO), ou `null` se nunca foi gravado. */
  gravadoEm: string | null
  /** Dias do mês com borderô lançado. */
  diasComBordero: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Borderô fictício para o `gia dev` sem banco (GIA_DEV_IFOOD_MENSAL_DEMO=1). */
function borderoDemo(ano: number, mes: number) {
  const dias = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const linhas = []
  for (let d = 1; d <= dias; d++) {
    linhas.push({
      dia: `${ano}-${pad(mes)}-${pad(d)}`,
      cb_online: 700 + ((d * 37) % 300),
      cb_descontos_ifood: (d * 13) % 40,
      adquirentes_caixa: 80 + ((d * 17) % 90),
    })
  }
  return linhas
}

/**
 * Número da loja com 2 dígitos a partir do `operacao_ref` ("02 cb" → "02"): a chave
 * do fechamento no banco do Maestro (`loc_ref`, como no legado) e o
 * `property_number` do borderô. "08 cb" e "08 vst" dividem o mesmo fechamento —
 * o legado também juntava.
 */
function numeroDaOperacao(ref: string): string | null {
  const m = /^\s*(\d{1,4})/.exec(ref)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/**
 * Erro inesperado do banco (conexão, constraint, coluna…) não vai cru para a tela:
 * o detalhe fica no log do servidor e o usuário recebe uma mensagem curta. Os
 * `HttpError` (validação) passam como estão.
 */
/**
 * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
 * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
 */
function ehFalhaDoBanco(e: unknown): boolean {
  return typeof (e as { code?: unknown } | null)?.code === 'string'
}

function erroDeBanco(e: unknown): never {
  if (e instanceof HttpError || !ehFalhaDoBanco(e)) throw e
  console.error('[fechamento-ifood-mensal] erro ao ler o fechamento no banco:', e)
  throw new HttpError(
    503,
    'Não foi possível ler o fechamento agora (falha no banco de dados). Tente de novo em alguns minutos; se continuar, avise o suporte.'
  )
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  try {
    await ctx.requirePermission('fechamento-ifood-mensal.ler')
    // Exceção deste módulo: a busca é por OPERAÇÃO (não por Empresa). O número do
    // `operacao_ref` ("02 cb" → "02") é a chave da loja no banco do Maestro — o
    // `loc_ref` do fechamento (como no legado) e o `property_number` do borderô.
    const operacao = await ctx.requireOperacao(String(ctx.body.operacaoRef ?? '').trim())
    const locRef = numeroDaOperacao(operacao.ref)
    if (!locRef) {
      throw new HttpError(
        422,
        `A operação "${operacao.nome}" (${operacao.ref}) não começa pelo número da loja.`
      )
    }

    const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
    const ano = mm ? Number(mm[1]) : 0
    const mes = mm ? Number(mm[2]) : 0
    if (ano < 2000 || mes < 1 || mes > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

    const inicio = `${ano}-${pad(mes)}-01`
    const fim = `${ano}-${pad(mes)}-${pad(new Date(Date.UTC(ano, mes, 0)).getUTCDate())}`
    const resposta: Resposta = {
      locRef,
      online: {},
      adquirente: {},
      conferencia: {},
      extrato: [],
      cancelados: [],
      anulacaoVerificar: 0,
      gravadoEm: null,
      diasComBordero: 0,
    }

    const demo =
      envOptional('GIA_DEV_IFOOD_MENSAL_DEMO') === '1' && !envOptional('GIA_SERVER_DATABASE_URL')

    // 1. Borderô vigente por dia.
    type Bordero = {
      dia: string
      cb_online: number
      cb_descontos_ifood: number
      adquirentes_caixa: number
    }
    // O borderô é por número de loja (`property_number`).
    const propriedade = Number(locRef)
    const bordero: Bordero[] = demo
      ? borderoDemo(ano, mes)
      : propriedade <= 0
        ? []
        : await sql<Bordero[]>`
        WITH original AS (
          SELECT b.id, b.bus_dt::date AS bus_dt,
            COALESCE(b.din_ifood_online, 0) AS din_ifood_online,
            COALESCE(b.din_desconto_ifood, 0) AS din_desconto_ifood,
            COALESCE(b.ent_ifood_adquirentes, 0) AS ent_ifood_adquirentes,
            NOT EXISTS (SELECT 1 FROM bordero.borderos bc WHERE bc.parent_id = b.id) AS is_last
          FROM bordero.borderos b
          WHERE b.property_number = ${propriedade}
            AND b.bus_dt::date BETWEEN ${inicio}::date AND ${fim}::date
            AND b.parent_id IS NULL
            AND b."isTemp" = FALSE
        ), alteracoes AS (
          SELECT b.bus_dt::date AS bus_dt,
            COALESCE(b.din_ifood_online, 0) AS din_ifood_online,
            COALESCE(b.din_desconto_ifood, 0) AS din_desconto_ifood,
            COALESCE(b.ent_ifood_adquirentes, 0) AS ent_ifood_adquirentes,
            b.id = (SELECT MAX(bc.id) FROM bordero.borderos bc WHERE bc.parent_id = b.parent_id) AS is_last
          FROM bordero.borderos b
          WHERE b.parent_id IN (SELECT id FROM original)
        ), vigentes AS (
          SELECT bus_dt, din_ifood_online, din_desconto_ifood, ent_ifood_adquirentes
            FROM original WHERE is_last
          UNION ALL
          SELECT bus_dt, din_ifood_online, din_desconto_ifood, ent_ifood_adquirentes
            FROM alteracoes WHERE is_last
        )
        SELECT to_char(bus_dt, 'YYYY-MM-DD') AS dia,
          SUM(din_ifood_online)::float8 AS cb_online,
          SUM(din_desconto_ifood)::float8 AS cb_descontos_ifood,
          SUM(ent_ifood_adquirentes)::float8 AS adquirentes_caixa
        FROM vigentes GROUP BY bus_dt ORDER BY bus_dt
      `
    for (const b of bordero) {
      resposta.online[b.dia] = { cbOnline: b.cb_online, cbDescontosIfood: b.cb_descontos_ifood }
      resposta.adquirente[b.dia] = { caixa: b.adquirentes_caixa }
    }
    resposta.diasComBordero = bordero.length
    if (demo) return resposta

    // 2. O que foi gravado no fechamento do mês.
    const [cab] = await sql<
      Array<{ id: string; anulacao_verificar: number; gravado_em: string | null }>
    >`
    SELECT id::text, anulacao_verificar::float8 AS anulacao_verificar,
      to_char(COALESCE(atualizado_em, criado_em) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS gravado_em
    FROM ifood_fechamento.fechamentos_mensais
    WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
  `
    if (!cab) return resposta
    resposta.anulacaoVerificar = cab.anulacao_verificar
    resposta.gravadoEm = cab.gravado_em
    const fid = cab.id

    // Em sequência: são consultas pequenas, e assim usam uma conexão só.
    const online = await sql<
      Array<{
        dia: string
        previsao: string | null
        cb_loja: number | null
        comentario: string | null
      }>
    >`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
      to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao,
      cb_descontos_loja::float8 AS cb_loja, comentario
    FROM ifood_fechamento.online_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
  `
    const adq = await sql<
      Array<{ dia: string; previsao: string | null; comentario: string | null }>
    >`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
      to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao, comentario
    FROM ifood_fechamento.adquirente_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
  `
    const conf = await sql<Array<{ centro_custo: string; valor: number }>>`
    SELECT centro_custo, valor::float8 AS valor
    FROM ifood_fechamento.conferencia_breakdown WHERE fechamento_id = ${fid}::bigint
  `
    const extrato = await sql<Array<Record<string, string | number | null>>>`
    SELECT COALESCE(loja, '') AS loja, COALESCE(banco, '') AS banco, COALESCE(tipo, '') AS tipo,
      COALESCE(mes_ano, '') AS mes_ano, COALESCE(classificacao, '') AS classificacao,
      COALESCE(sub_classificacao, '') AS sub_classificacao,
      to_char(data_movimento, 'YYYY-MM-DD') AS data_movimento,
      COALESCE(historico, '') AS historico, COALESCE(documento, '') AS documento,
      malote::float8 AS malote, COALESCE(competencia, '') AS competencia
    FROM ifood_fechamento.extrato_bancario
    WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY data_movimento, id
  `
    const cancelados = await sql<Array<Record<string, string | number | null>>>`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS data_pedido,
      COALESCE(estabelecimento, '') AS estabelecimento, COALESCE(cnpj, '') AS cnpj,
      COALESCE(nome_cliente, '') AS nome_cliente, COALESCE(numero_pedido, '') AS numero_pedido,
      COALESCE(id_ifood, '') AS id_ifood, COALESCE(valor_pedido_taxa, 0)::float8 AS valor_pedido_taxa,
      valor_reembolso::float8 AS valor_reembolso, COALESCE(centro_venda, '') AS centro_venda,
      COALESCE(origem_cancelamento, '') AS origem_cancelamento,
      COALESCE(justificativa, '') AS justificativa, COALESCE(andamento, '') AS andamento,
      COALESCE(protocolo, '') AS protocolo, COALESCE(vale_no_cofre, '') AS vale_no_cofre,
      COALESCE(to_char(data_anulacao, 'YYYY-MM-DD'), '') AS data_anulacao,
      COALESCE(to_char(data_reembolso, 'YYYY-MM-DD'), '') AS data_reembolso
    FROM ifood_fechamento.cancelados_pos
    WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY data_pedido, id
  `

    for (const o of online) {
      const dia: OnlineDia = { ...resposta.online[o.dia] }
      if (o.previsao) dia.previsao = o.previsao
      if (o.cb_loja !== null) dia.cbDescontosLoja = o.cb_loja
      if (o.comentario) dia.comentario = o.comentario
      resposta.online[o.dia] = dia
    }
    for (const a of adq) {
      const dia: AdquirenteDia = { ...resposta.adquirente[a.dia] }
      if (a.previsao) dia.previsao = a.previsao
      if (a.comentario) dia.comentario = a.comentario
      resposta.adquirente[a.dia] = dia
    }
    for (const c of conf) resposta.conferencia[c.centro_custo] = c.valor
    const s = (v: string | number | null | undefined) =>
      v === null || v === undefined ? '' : String(v)
    resposta.extrato = extrato.map((e) => ({
      loja: s(e.loja),
      banco: s(e.banco),
      tipo: s(e.tipo),
      mesAno: s(e.mes_ano),
      classificacao: s(e.classificacao),
      subClassificacao: s(e.sub_classificacao),
      dataMovimento: s(e.data_movimento),
      historico: s(e.historico),
      documento: s(e.documento),
      malote: Number(e.malote) || 0,
      competencia: s(e.competencia),
    }))
    resposta.cancelados = cancelados.map((c) => ({
      dataPedido: s(c.data_pedido),
      estabelecimento: s(c.estabelecimento),
      cnpj: s(c.cnpj),
      nomeCliente: s(c.nome_cliente),
      numeroPedido: s(c.numero_pedido),
      idIfood: s(c.id_ifood),
      valorPedidoTaxa: Number(c.valor_pedido_taxa) || 0,
      valorReembolso: c.valor_reembolso === null ? null : Number(c.valor_reembolso),
      centroVenda: s(c.centro_venda),
      origemCancelamento: s(c.origem_cancelamento),
      justificativa: s(c.justificativa),
      andamento: s(c.andamento),
      protocolo: s(c.protocolo),
      valeNoCofre: s(c.vale_no_cofre),
      dataAnulacao: s(c.data_anulacao),
      dataReembolso: s(c.data_reembolso),
    }))
    return resposta
  } catch (e) {
    erroDeBanco(e)
  }
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
