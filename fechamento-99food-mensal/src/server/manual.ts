import { defineHandler, envOptional, HttpError, sql } from '@gia-cb/sdk/server'

// A parte do fechamento que NÃO vem da 99Food, lida do banco do Maestro:
//
// 1. Borderô (`bordero.borderos`, só leitura): o que a loja lançou no caixa por dia —
//    CB Online (`din_ifood_online`), CB Descontos 99Food (`din_desconto_ifood`) e
//    Adquirentes caixa (`ent_ifood_adquirentes`). Vale a versão vigente de cada
//    borderô (a última alteração, ou o original quando não há alteração) — a mesma
//    consulta do legado (GetBorderoFood99Batch).
// 2. O que o usuário digitou e gravou (`fechamento_99food.*`): previsão de pagamento,
//    CB Descontos LOJA e comentário por dia, breakdown da Conferência, extrato
//    bancário e cancelados pós-entrega (LoadManualMensalJson).
//
// O dia junta os dois: borderô primeiro, o gravado por cima (MergeManualMensalJson).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  /** Empresa (loja) escolhida — o fechamento é da loja inteira (todas as operações). */
  empresaId: number
  mes: string
}

interface OnlineDia {
  previsao?: string
  cbOnline?: number
  cbDescontosFood99?: number
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
  idFood99: string
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
  /** Dias do mês com algum campo da 99 no borderô. */
  diasComBordero: number
  /** Campos da 99 no borderô que NÃO entram na conferência (somados no mês). */
  camposFora: CampoForaDaConferencia[]
}
interface CampoForaDaConferencia {
  /** `din` ou `ent`. */
  grupo: string
  /** Nome do campo como a loja escreveu (em minúsculas). */
  nome: string
  motivo: 'cancelado' | 'offline' | 'sem_sufixo' | 'nao_reconhecido'
  valor: number
  dias: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Campos da 99 no borderô, fictícios, para o `gia dev` sem banco (GIA_DEV_99FOOD_MENSAL_DEMO=1). */
function borderoDemo(ano: number, mes: number) {
  const dias = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const linhas: { dia: string; grupo: string; nome: string; valor: number }[] = []
  for (let d = 1; d <= dias; d++) {
    const dia = `${ano}-${pad(mes)}-${pad(d)}`
    linhas.push({ dia, grupo: 'din', nome: '99food_online', valor: 700 + ((d * 37) % 300) })
    linhas.push({ dia, grupo: 'din', nome: 'desconto_99food', valor: (d * 13) % 40 })
    linhas.push({ dia, grupo: 'ent', nome: '99food_adquirentes', valor: 80 + ((d * 17) % 90) })
    if (d % 5 === 0) linhas.push({ dia, grupo: 'din', nome: 'vale_99food_cancel', valor: 35 })
    if (d % 7 === 0) linhas.push({ dia, grupo: 'din', nome: '99pay', valor: 52.4 })
  }
  return linhas
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * "99" como número isolado no nome do campo (pega `99food`, `99_online`, `desc.99`;
 * deixa de fora `0095998`, `1999`). O `_` do ILIKE é coringa, por isso regex.
 */
const RE_99_SQL = '(^|[^0-9])99([^0-9]|$)'

type CategoriaCampo =
  'online' | 'desconto' | 'adquirentes' | 'cancelado' | 'offline' | 'sem_sufixo' | 'nao_reconhecido'

/**
 * Classifica o nome LIVRE que cada loja deu ao campo da 99 no borderô (ex.: loja 1
 * `99_food`, loja 2 `99food_online`, loja 3 `99_online`). Decisões de 17/11/2026 (PRD
 * §11): entram na conferência só Online, Desconto pago pela 99 e Adquirentes, os três
 * que o Fechamento iFood Mensal lê do borderô. Cancelado, offline, os nomes sem sufixo
 * (`99food`, `99_food`, `99`: online ou offline? — pendente) e os não reconhecidos
 * (`99pay`, `f.o_delivery_99`, `vale_99food`…: pendentes) ficam fora e aparecem no
 * aviso da tela. A ordem das regras importa: cancelado e offline antes de online.
 */
function classificarCampo(nome: string): CategoriaCampo {
  const n = nome
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  if (/cancel|(^|_)canc($|_)|estorno/.test(n)) return 'cancelado'
  if (/off/.test(n)) return 'offline'
  if (/adquirente/.test(n)) return 'adquirentes'
  if (/(^|_)desc/.test(n)) return 'desconto'
  if (/online/.test(n)) return 'online'
  if (/^(99|99_?foods?)$/.test(n)) return 'sem_sufixo'
  return 'nao_reconhecido'
}

/**
 * Número da loja com 2 dígitos — o `loc_ref` do fechamento no banco e do DW.
 * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
 * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
 * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
 * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/**
 * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
 * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
 */
function ehTabelaAusente(e: unknown): boolean {
  const code = (e as { code?: unknown } | null)?.code
  return code === '42P01' || code === '3F000'
}

function ehFalhaDoBanco(e: unknown): boolean {
  return typeof (e as { code?: unknown } | null)?.code === 'string'
}

/**
 * Erro inesperado do banco (conexão, constraint, coluna…) não vai cru para a tela:
 * o detalhe fica no log do servidor e o usuário recebe uma mensagem curta. Os
 * `HttpError` (validação) passam como estão.
 */
function erroDeBanco(e: unknown): never {
  if (e instanceof HttpError || !ehFalhaDoBanco(e)) throw e
  console.error('[fechamento-99food-mensal] erro ao ler o fechamento no banco:', e)
  throw new HttpError(
    503,
    'Não foi possível ler o fechamento agora (falha no banco de dados). Tente de novo em alguns minutos; se continuar, avise o suporte.'
  )
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  try {
    await ctx.requirePermission('fechamento-99food-mensal.ler')
    // A loja é a Empresa: o fechamento junta todas as operações dela. O número da loja
    // (do nome da Empresa, ou do BIAPI) é a chave no banco do Maestro — o `loc_ref` do
    // fechamento (como no legado) e o `property_number` do borderô.
    const empresaId = Number(ctx.body.empresaId)
    if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
    // 403 se a Empresa está fora do escopo do usuário.
    await ctx.requireEmpresa(empresaId)
    const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
    if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
    // Só Empresa (loja) tem fechamento — como no seletor (`lojas.ts`). Uma propriedade
    // com número no nome apontaria para a loja de mesmo número, talvez fora do escopo.
    if (empresa.tipoRegistro !== 'empresa')
      throw new HttpError(422, `"${empresa.nome}" não é uma loja (Empresa).`)
    const locRef = numeroDaLoja(empresa)
    if (!locRef) {
      throw new HttpError(
        422,
        `A loja "${empresa.nome}" não tem o número da loja no nome nem no vínculo BIAPI.`
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
      camposFora: [],
    }

    const demo =
      envOptional('GIA_DEV_99FOOD_MENSAL_DEMO') === '1' && !envOptional('GIA_SERVER_DATABASE_URL')

    // 1. Borderô vigente por dia: os campos da 99 em `bordero.fields` dos borderôs
    //    vigentes (o original sem alteração, ou a última alteração — ela copia todos os
    //    campos do original). Só os grupos `din` e `ent` e só nomes com "99" isolado.
    type CampoBordero = { dia: string; grupo: string; nome: string; valor: number }
    // O borderô é por número de loja (`property_number`).
    const propriedade = Number(locRef)
    const campos: CampoBordero[] = demo
      ? borderoDemo(ano, mes)
      : propriedade <= 0
        ? []
        : await sql<CampoBordero[]>`
        WITH original AS (
          SELECT b.id, b.bus_dt::date AS bus_dt,
            NOT EXISTS (SELECT 1 FROM bordero.borderos bc WHERE bc.parent_id = b.id) AS is_last
          FROM bordero.borderos b
          WHERE b.property_number = ${propriedade}
            AND b.bus_dt::date BETWEEN ${inicio}::date AND ${fim}::date
            AND b.parent_id IS NULL
            AND b."isTemp" = FALSE
        ), alteracoes AS (
          SELECT b.id, b.bus_dt::date AS bus_dt,
            b.id = (SELECT MAX(bc.id) FROM bordero.borderos bc WHERE bc.parent_id = b.parent_id) AS is_last
          FROM bordero.borderos b
          WHERE b.parent_id IN (SELECT id FROM original)
        ), vigentes AS (
          SELECT id, bus_dt FROM original WHERE is_last
          UNION ALL
          SELECT id, bus_dt FROM alteracoes WHERE is_last
        )
        SELECT to_char(v.bus_dt, 'YYYY-MM-DD') AS dia,
          LOWER(f.field_group) AS grupo,
          LOWER(TRIM(f.field_name)) AS nome,
          SUM(f.value)::float8 AS valor
        FROM vigentes v
        JOIN bordero.fields f ON f.bordero_id = v.id
        WHERE LOWER(f.field_group) IN ('din', 'ent')
          AND f.field_name ~* ${RE_99_SQL}
        GROUP BY 1, 2, 3
        ORDER BY 1, 2, 3
      `
    const fora = new Map<string, CampoForaDaConferencia>()
    const diasComCampo = new Set<string>()
    for (const c of campos) {
      diasComCampo.add(c.dia)
      const categoria = classificarCampo(c.nome)
      if (categoria === 'online' || categoria === 'desconto') {
        const dia: OnlineDia = { ...resposta.online[c.dia] }
        if (categoria === 'online') dia.cbOnline = round2((dia.cbOnline ?? 0) + c.valor)
        else dia.cbDescontosFood99 = round2((dia.cbDescontosFood99 ?? 0) + c.valor)
        resposta.online[c.dia] = dia
      } else if (categoria === 'adquirentes') {
        const dia: AdquirenteDia = { ...resposta.adquirente[c.dia] }
        dia.caixa = round2((dia.caixa ?? 0) + c.valor)
        resposta.adquirente[c.dia] = dia
      } else {
        const chave = `${c.grupo}:${c.nome}`
        const item = fora.get(chave) ?? {
          grupo: c.grupo,
          nome: c.nome,
          motivo: categoria,
          valor: 0,
          dias: 0,
        }
        item.valor = round2(item.valor + c.valor)
        item.dias += 1
        fora.set(chave, item)
      }
    }
    // Campo lançado zerado o mês inteiro não tem o que conferir: fica fora do aviso.
    resposta.camposFora = [...fora.values()]
      .filter((c) => c.valor !== 0)
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
    resposta.diasComBordero = diasComCampo.size
    if (demo) return resposta

    // 2. O que foi gravado no fechamento do mês. Enquanto o sql-maestro/001_schema.sql
    //    não roda, o schema `fechamento_99food` não existe: a consulta segue só com o
    //    borderô (nada gravado) e o Salvar/Histórico respondem que o banco não está
    //    preparado (padrão 13 do workspace).
    let cabecalhos: Array<{ id: string; anulacao_verificar: number; gravado_em: string | null }>
    try {
      cabecalhos = await sql<
        Array<{ id: string; anulacao_verificar: number; gravado_em: string | null }>
      >`
      SELECT id::text, anulacao_verificar::float8 AS anulacao_verificar,
        to_char(COALESCE(atualizado_em, criado_em) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS gravado_em
      FROM fechamento_99food.fechamentos_mensais
      WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
    `
    } catch (e) {
      if (ehTabelaAusente(e)) {
        console.warn(
          '[fechamento-99food-mensal] schema fechamento_99food ainda não criado — consulta só com o borderô'
        )
        return resposta
      }
      throw e
    }
    const [cab] = cabecalhos
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
    FROM fechamento_99food.online_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
  `
    const adq = await sql<
      Array<{ dia: string; previsao: string | null; comentario: string | null }>
    >`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
      to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao, comentario
    FROM fechamento_99food.adquirente_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
  `
    const conf = await sql<Array<{ centro_custo: string; valor: number }>>`
    SELECT centro_custo, valor::float8 AS valor
    FROM fechamento_99food.conferencia_breakdown WHERE fechamento_id = ${fid}::bigint
  `
    const extrato = await sql<Array<Record<string, string | number | null>>>`
    SELECT COALESCE(loja, '') AS loja, COALESCE(banco, '') AS banco, COALESCE(tipo, '') AS tipo,
      COALESCE(mes_ano, '') AS mes_ano, COALESCE(classificacao, '') AS classificacao,
      COALESCE(sub_classificacao, '') AS sub_classificacao,
      to_char(data_movimento, 'YYYY-MM-DD') AS data_movimento,
      COALESCE(historico, '') AS historico, COALESCE(documento, '') AS documento,
      malote::float8 AS malote, COALESCE(competencia, '') AS competencia
    FROM fechamento_99food.extrato_bancario
    WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY data_movimento, id
  `
    const cancelados = await sql<Array<Record<string, string | number | null>>>`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS data_pedido,
      COALESCE(estabelecimento, '') AS estabelecimento, COALESCE(cnpj, '') AS cnpj,
      COALESCE(nome_cliente, '') AS nome_cliente, COALESCE(numero_pedido, '') AS numero_pedido,
      COALESCE(id_99food, '') AS id_99food, COALESCE(valor_pedido_taxa, 0)::float8 AS valor_pedido_taxa,
      valor_reembolso::float8 AS valor_reembolso, COALESCE(centro_venda, '') AS centro_venda,
      COALESCE(origem_cancelamento, '') AS origem_cancelamento,
      COALESCE(justificativa, '') AS justificativa, COALESCE(andamento, '') AS andamento,
      COALESCE(protocolo, '') AS protocolo, COALESCE(vale_no_cofre, '') AS vale_no_cofre,
      COALESCE(to_char(data_anulacao, 'YYYY-MM-DD'), '') AS data_anulacao,
      COALESCE(to_char(data_reembolso, 'YYYY-MM-DD'), '') AS data_reembolso
    FROM fechamento_99food.cancelados_pos
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
      idFood99: s(c.id_99food),
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
