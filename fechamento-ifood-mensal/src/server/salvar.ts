import { defineHandler, getDbClient, HttpError } from '@gia-cb/sdk/server'

// Grava o que o usuário digitou no fechamento do mês, nas mesmas tabelas do legado
// (`ifood_fechamento.*` no banco do Maestro), numa transação só
// (TDmFechamentoDiarioIfood.SaveManualMensal):
//
// - cabeçalho `fechamentos_mensais` (1 por loja/mês), criado na primeira gravação;
// - `online_dia` / `adquirente_dia`: previsão, CB Descontos LOJA e comentário por dia;
// - `conferencia_breakdown`: os 4 valores do breakdown da Conferência;
// - `extrato_bancario` e `cancelados_pos`: a lista inteira é regravada — as linhas
//   ativas viram excluídas (`deletado_em`) e a lista da tela é inserida de novo.
//
// Autor: `criado_por`/`atualizado_por`/`deletado_por` recebem o id do usuário no
// GIA antigo (`legacyUserId`), para o histórico continuar coerente com o que o
// legado gravou; sem vínculo, o id do usuário no portal.
//
// Duas correções em relação ao legado (perda de dado, não regra de cálculo):
// - dia que ficou VAZIO (comentário apagado, previsão limpa) é limpo no banco — o
//   legado ignorava o dia e o valor antigo voltava na próxima consulta;
// - "Vale no cofre?" dos cancelados é um campo só (o legado lia "Veio" e gravava
//   "Vale", e a edição de uma linha já gravada se perdia).
//
// Histórico: cada gravação que muda alguma coisa vira UMA linha em
// `ifood_fechamento.historico` (mesma transação), com quem, quando e o antes →
// depois de cada campo e de cada linha incluída/removida — o handler `historico`
// lê e a tela mostra. Gravação sem mudança não gera linha.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface OnlineDia {
  previsao?: string
  cbDescontosLoja?: number | null
  comentario?: string
}
interface AdquirenteDia {
  previsao?: string
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
interface Body {
  /** `operacao_ref` da loja escolhida. */
  operacaoRef: string
  mes: string
  online: Record<string, OnlineDia>
  adquirente: Record<string, AdquirenteDia>
  conferencia: Record<string, number>
  extrato: LinhaExtrato[]
  cancelados: LinhaCancelado[]
  anulacaoVerificar: number
}
interface Resposta {
  gravadoEm: string
  /** Quantas mudanças foram para o histórico (0 = nada mudou). */
  alteracoes: number
}

/** O `getDbClient()` é o `postgres.js` cru; tipamos só o que a gravação usa. */
type Tx = <T = unknown[]>(strings: TemplateStringsArray, ...params: unknown[]) => Promise<T>
type ComTransacao = { begin: <R>(fn: (tx: Tx) => Promise<R>) => Promise<R> }

const CENTROS = ['valor_site_cc1', 'valor_site_cc2', 'valor_site_cc3', 'valor_site_cc4']
const MAX_LINHAS = 5000

const pad = (n: number) => String(n).padStart(2, '0')

function dataValida(v: unknown): v is string {
  if (typeof v !== 'string') return false
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

/** Data opcional: vazio vira `null`; preenchida e inválida é 422. */
function dataOuNull(v: unknown, campo: string): string | null {
  if (v === undefined || v === null || v === '') return null
  if (!dataValida(v)) throw new HttpError(422, `${campo}: data inválida.`)
  return v
}

function numeroOuNull(v: unknown, campo: string): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || Math.abs(n) >= 1e12)
    throw new HttpError(422, `${campo}: valor inválido.`)
  return Math.round(n * 100) / 100
}

/** Texto com o limite da coluna (varchar do schema do legado). */
function texto(v: unknown, max: number | null, campo: string): string {
  const t = typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v)
  if (max !== null && t.length > max) {
    throw new HttpError(422, `${campo}: no máximo ${max} caracteres (veio ${t.length}).`)
  }
  return t
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

// ── Histórico (antes → depois) ──────────────────────────────────────────────

type Valor = string | number | null
type Alteracao =
  | {
      secao: string
      item: string
      campo: string
      de: Valor
      para: Valor
      tipo: 'texto' | 'data' | 'moeda'
    }
  | { secao: string; item: string; acao: 'incluida' | 'removida' }

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataBR = (iso: string | null) =>
  iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : ''

const ROTULO_CENTRO: Record<string, string> = {
  valor_site_cc1: 'Breakdown — centro de custo 1',
  valor_site_cc2: 'Breakdown — centro de custo 2',
  valor_site_cc3: 'Breakdown — centro de custo 3',
  valor_site_cc4: 'Breakdown — centro de custo 4',
}

interface Gravado {
  online: Map<string, { previsao: string | null; cbLoja: number | null; comentario: string }>
  adquirente: Map<string, { previsao: string | null; comentario: string }>
  conferencia: Map<string, number>
  anulacao: number
  extrato: Array<Record<string, Valor>>
  cancelados: Array<Record<string, Valor>>
}

/** O que está gravado agora no fechamento (dentro da transação, antes de gravar). */
async function lerGravado(tx: Tx, fid: string): Promise<Gravado> {
  const [cab] = await tx<Array<{ anulacao: number }>>`
    SELECT anulacao_verificar::float8 AS anulacao FROM ifood_fechamento.fechamentos_mensais
    WHERE id = ${fid}::bigint
  `
  const online = await tx<
    Array<{ dia: string; previsao: string | null; cb_loja: number | null; comentario: string }>
  >`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
      to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao,
      cb_descontos_loja::float8 AS cb_loja, COALESCE(comentario, '') AS comentario
    FROM ifood_fechamento.online_dia WHERE fechamento_id = ${fid}::bigint
  `
  const adq = await tx<Array<{ dia: string; previsao: string | null; comentario: string }>>`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
      to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao, COALESCE(comentario, '') AS comentario
    FROM ifood_fechamento.adquirente_dia WHERE fechamento_id = ${fid}::bigint
  `
  const conf = await tx<Array<{ centro: string; valor: number }>>`
    SELECT centro_custo AS centro, COALESCE(valor, 0)::float8 AS valor
    FROM ifood_fechamento.conferencia_breakdown WHERE fechamento_id = ${fid}::bigint
  `
  const extrato = await tx<Array<Record<string, Valor>>>`
    SELECT COALESCE(loja, '') AS loja, COALESCE(banco, '') AS banco, COALESCE(tipo, '') AS tipo,
      COALESCE(mes_ano, '') AS "mesAno", COALESCE(classificacao, '') AS classificacao,
      COALESCE(sub_classificacao, '') AS "subClassificacao",
      to_char(data_movimento, 'YYYY-MM-DD') AS "dataMovimento",
      COALESCE(historico, '') AS historico, COALESCE(documento, '') AS documento,
      COALESCE(malote, 0)::float8 AS malote, COALESCE(competencia, '') AS competencia
    FROM ifood_fechamento.extrato_bancario
    WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY id
  `
  const cancelados = await tx<Array<Record<string, Valor>>>`
    SELECT to_char(data_pedido, 'YYYY-MM-DD') AS "dataPedido",
      COALESCE(estabelecimento, '') AS estabelecimento, COALESCE(cnpj, '') AS cnpj,
      COALESCE(nome_cliente, '') AS "nomeCliente", COALESCE(numero_pedido, '') AS "numeroPedido",
      COALESCE(id_ifood, '') AS "idIfood", COALESCE(valor_pedido_taxa, 0)::float8 AS "valorPedidoTaxa",
      valor_reembolso::float8 AS "valorReembolso", COALESCE(centro_venda, '') AS "centroVenda",
      COALESCE(origem_cancelamento, '') AS "origemCancelamento",
      COALESCE(justificativa, '') AS justificativa, COALESCE(andamento, '') AS andamento,
      COALESCE(protocolo, '') AS protocolo, COALESCE(vale_no_cofre, '') AS "valeNoCofre",
      to_char(data_anulacao, 'YYYY-MM-DD') AS "dataAnulacao",
      to_char(data_reembolso, 'YYYY-MM-DD') AS "dataReembolso"
    FROM ifood_fechamento.cancelados_pos
    WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY id
  `
  return {
    online: new Map(
      online.map((o) => [
        o.dia,
        { previsao: o.previsao, cbLoja: o.cb_loja, comentario: o.comentario },
      ])
    ),
    adquirente: new Map(
      adq.map((a) => [a.dia, { previsao: a.previsao, comentario: a.comentario }])
    ),
    conferencia: new Map(conf.map((c) => [c.centro, c.valor])),
    anulacao: cab?.anulacao ?? 0,
    extrato,
    cancelados,
  }
}

type Tipo = 'texto' | 'data' | 'moeda'
/** Campos da linha do extrato: rótulo e tipo, para o histórico. */
const CAMPOS_EXTRATO: Record<string, [string, Tipo]> = {
  dataMovimento: ['Data do movimento', 'data'],
  malote: ['Malote', 'moeda'],
  historico: ['Histórico', 'texto'],
  loja: ['Loja', 'texto'],
  banco: ['Banco', 'texto'],
  tipo: ['Tipo', 'texto'],
  mesAno: ['Mês / Ano', 'texto'],
  classificacao: ['Classificação', 'texto'],
  subClassificacao: ['Sub classificação', 'texto'],
  documento: ['Documento', 'texto'],
  competencia: ['Competência', 'texto'],
}
/** Campos do cancelado pós-entrega: rótulo e tipo, para o histórico. */
const CAMPOS_CANCELADO: Record<string, [string, Tipo]> = {
  dataPedido: ['Data do pedido', 'data'],
  numeroPedido: ['Nº do pedido', 'texto'],
  idIfood: ['ID iFood', 'texto'],
  valorPedidoTaxa: ['Valor (pedido + taxa)', 'moeda'],
  valorReembolso: ['Valor do reembolso', 'moeda'],
  estabelecimento: ['Estabelecimento', 'texto'],
  cnpj: ['CNPJ', 'texto'],
  nomeCliente: ['Cliente', 'texto'],
  centroVenda: ['Centro de venda', 'texto'],
  origemCancelamento: ['Origem do cancelamento', 'texto'],
  justificativa: ['Justificativa', 'texto'],
  andamento: ['Andamento', 'texto'],
  protocolo: ['Protocolo', 'texto'],
  valeNoCofre: ['Vale no cofre?', 'texto'],
  dataAnulacao: ['Data de anulação', 'data'],
  dataReembolso: ['Data de reembolso', 'data'],
}

/** Valor normalizado para comparar: vazio e `null` iguais, texto sem espaço nas pontas. */
const normal = (v: unknown): string | number =>
  v === null || v === undefined ? '' : typeof v === 'string' ? v.trim() : (v as number)

/** Chave da linha para comparar listas: todos os campos, vazio e `null` iguais. */
const chaveLinha = (l: Record<string, unknown>, campos: string[]) =>
  JSON.stringify(campos.map((c) => normal(l[c])))

/** Linhas que estão numa lista e não na outra (contando repetidas). */
function sobras<T extends Record<string, unknown>>(de: T[], menos: T[], campos: string[]): T[] {
  const conta = new Map<string, number>()
  for (const l of menos) {
    const k = chaveLinha(l, campos)
    conta.set(k, (conta.get(k) ?? 0) + 1)
  }
  return de.filter((l) => {
    const k = chaveLinha(l, campos)
    const n = conta.get(k) ?? 0
    if (n > 0) {
      conta.set(k, n - 1)
      return false
    }
    return true
  })
}

/**
 * Diferenças de uma lista (extrato/cancelados) entre o gravado e a tela. A linha
 * editada vira "campo antes → depois" (casada com a removida mais parecida: até
 * metade dos campos diferentes); o resto é linha incluída ou removida.
 */
function diferencasDaLista(
  secao: string,
  antes: Array<Record<string, unknown>>,
  depois: Array<Record<string, unknown>>,
  campos: Record<string, [string, Tipo]>,
  resumo: (l: Record<string, unknown>) => string
): Alteracao[] {
  const nomes = Object.keys(campos)
  const removidas = sobras(antes, depois, nomes)
  const incluidas = sobras(depois, antes, nomes)
  const diferentes = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    nomes.filter((c) => normal(a[c]) !== normal(b[c]))
  const out: Alteracao[] = []
  // Casamento pelo par MAIS parecido de todos (não o primeiro que serve): numa
  // exclusão + edição de linhas parecidas, a edição fica com a linha certa. Lista
  // enorme (troca de milhares de linhas) não tenta casar — vira incluída/removida.
  const limite = Math.floor(nomes.length / 2)
  const pares: Array<[number, number, number]> = []
  if (removidas.length * incluidas.length <= 250_000) {
    removidas.forEach((r, ri) =>
      incluidas.forEach((n, ii) => {
        const d = diferentes(r, n).length
        if (d <= limite) pares.push([d, ri, ii])
      })
    )
    pares.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  }
  const usadas = new Set<number>()
  const casadas = new Map<number, number>()
  for (const [, ri, ii] of pares) {
    if (casadas.has(ri) || usadas.has(ii)) continue
    casadas.set(ri, ii)
    usadas.add(ii)
  }
  removidas.forEach((r, ri) => {
    const ii = casadas.get(ri)
    if (ii === undefined) {
      out.push({ secao, item: resumo(r), acao: 'removida' })
      return
    }
    const n = incluidas[ii]
    for (const c of diferentes(r, n)) {
      const [campo, tipo] = campos[c]
      const v = (x: unknown): Valor => (x === undefined ? null : (x as Valor))
      out.push({ secao, item: resumo(r), campo, de: v(r[c]), para: v(n[c]), tipo })
    }
  })
  incluidas.forEach((n, i) => {
    if (!usadas.has(i)) out.push({ secao, item: resumo(n), acao: 'incluida' })
  })
  return out
}

const resumoExtrato = (e: Record<string, unknown>) =>
  [dataBR(e.dataMovimento as string), BRL.format(Number(e.malote) || 0), e.historico]
    .filter(Boolean)
    .join(' · ')
const resumoCancelado = (c: Record<string, unknown>) =>
  [
    dataBR(c.dataPedido as string),
    c.numeroPedido ? `pedido ${c.numeroPedido}` : c.idIfood ? `iFood ${c.idIfood}` : '',
    BRL.format(Number(c.valorPedidoTaxa) || 0),
    c.nomeCliente,
  ]
    .filter(Boolean)
    .join(' · ')

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
  console.error('[fechamento-ifood-mensal] erro ao gravar o fechamento no banco:', e)
  // Tabela de histórico ainda não criada no Maestro (INTEGRATION.md §2.1).
  const err = e as { code?: string; message?: string }
  if (err.code === '42P01' && String(err.message ?? '').includes('historico')) {
    throw new HttpError(
      503,
      'Não foi possível gravar: o banco do fechamento ainda não está preparado para o histórico. Avise o suporte.'
    )
  }
  throw new HttpError(
    503,
    'Não foi possível gravar o fechamento agora (falha no banco de dados). Tente de novo em alguns minutos; se continuar, avise o suporte.'
  )
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  try {
    await ctx.requirePermission('fechamento-ifood-mensal.editar')
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

    // ── Validação do corpo (o navegador não é confiável) ──────────────────────
    const prefixo = `${ano}-${pad(mes)}-`
    const diaDoMes = (d: string) => {
      if (!dataValida(d) || !d.startsWith(prefixo))
        throw new HttpError(422, `Dia ${d} fora do mês ${ano}-${pad(mes)}.`)
      return d
    }
    const objeto = (v: unknown) =>
      v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}

    const online = Object.entries(objeto(ctx.body.online)).map(([dia, raw]) => {
      const o = objeto(raw)
      return {
        dia: diaDoMes(dia),
        previsao: dataOuNull(o.previsao, `Online ${dia} — previsão`),
        cbLoja: numeroOuNull(o.cbDescontosLoja, `Online ${dia} — CB Descontos LOJA`),
        comentario: texto(o.comentario, null, `Online ${dia} — comentário`),
      }
    })
    const adquirente = Object.entries(objeto(ctx.body.adquirente)).map(([dia, raw]) => {
      const a = objeto(raw)
      return {
        dia: diaDoMes(dia),
        previsao: dataOuNull(a.previsao, `Adquirentes ${dia} — previsão`),
        comentario: texto(a.comentario, null, `Adquirentes ${dia} — comentário`),
      }
    })
    const conf = objeto(ctx.body.conferencia)
    const conferencia = CENTROS.map((c) => ({
      centro: c,
      valor: numeroOuNull(conf[c], `Conferência ${c}`) ?? 0,
    }))
    const anulacao = numeroOuNull(ctx.body.anulacaoVerificar, 'Anulação (verificar)') ?? 0

    const listaExtrato = Array.isArray(ctx.body.extrato) ? ctx.body.extrato : []
    const listaCancelados = Array.isArray(ctx.body.cancelados) ? ctx.body.cancelados : []
    if (listaExtrato.length > MAX_LINHAS || listaCancelados.length > MAX_LINHAS) {
      throw new HttpError(422, `No máximo ${MAX_LINHAS} linhas por lista.`)
    }
    const extrato = listaExtrato.map((raw, i) => {
      const e = objeto(raw)
      const n = `Extrato, linha ${i + 1}`
      const data = dataOuNull(e.dataMovimento, `${n} — data do movimento`)
      if (!data) throw new HttpError(422, `${n}: informe a data do movimento.`)
      return {
        loja: texto(e.loja, 20, `${n} — loja`),
        banco: texto(e.banco, 100, `${n} — banco`),
        tipo: texto(e.tipo, 100, `${n} — tipo`),
        mesAno: texto(e.mesAno, 20, `${n} — mês/ano`),
        classificacao: texto(e.classificacao, 150, `${n} — classificação`),
        subClassificacao: texto(e.subClassificacao, 150, `${n} — sub classificação`),
        dataMovimento: data,
        historico: texto(e.historico, null, `${n} — histórico`),
        documento: texto(e.documento, 100, `${n} — documento`),
        malote: numeroOuNull(e.malote, `${n} — malote`) ?? 0,
        competencia: texto(e.competencia, 7, `${n} — competência`),
      }
    })
    const cancelados = listaCancelados.map((raw, i) => {
      const c = objeto(raw)
      const n = `Cancelados pós, linha ${i + 1}`
      const data = dataOuNull(c.dataPedido, `${n} — data do pedido`)
      if (!data) throw new HttpError(422, `${n}: informe a data do pedido.`)
      return {
        dataPedido: data,
        estabelecimento: texto(c.estabelecimento, 150, `${n} — estabelecimento`),
        cnpj: texto(c.cnpj, 20, `${n} — CNPJ`),
        nomeCliente: texto(c.nomeCliente, 200, `${n} — nome do cliente`),
        numeroPedido: texto(c.numeroPedido, 50, `${n} — nº do pedido`),
        idIfood: texto(c.idIfood, 50, `${n} — ID iFood`),
        valorPedidoTaxa: numeroOuNull(c.valorPedidoTaxa, `${n} — valor`) ?? 0,
        valorReembolso: numeroOuNull(c.valorReembolso, `${n} — valor do reembolso`),
        centroVenda: texto(c.centroVenda, 100, `${n} — centro de venda`),
        origemCancelamento: texto(c.origemCancelamento, 100, `${n} — origem`),
        justificativa: texto(c.justificativa, null, `${n} — justificativa`),
        andamento: texto(c.andamento, 150, `${n} — andamento`),
        protocolo: texto(c.protocolo, 100, `${n} — protocolo`),
        valeNoCofre: texto(c.valeNoCofre, 20, `${n} — vale no cofre`),
        dataAnulacao: dataOuNull(c.dataAnulacao, `${n} — data de anulação`),
        dataReembolso: dataOuNull(c.dataReembolso, `${n} — data de reembolso`),
      }
    })

    const perfil = await ctx.perfilUsuario()
    const autor = perfil.legacyUserId ?? perfil.id
    const autorNome = (perfil.nome ?? perfil.email ?? '').slice(0, 200) || null

    const db = (await getDbClient()) as unknown as ComTransacao
    const gravado = await db.begin(async (tx) => {
      // Cabeçalho do mês: cria na primeira gravação.
      let [cab] = await tx<Array<{ id: string }>>`
      SELECT id::text FROM ifood_fechamento.fechamentos_mensais
      WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
      FOR UPDATE
    `
      if (!cab) {
        ;[cab] = await tx<Array<{ id: string }>>`
        INSERT INTO ifood_fechamento.fechamentos_mensais (loc_ref, ano, mes, criado_por)
        VALUES (${locRef}, ${ano}, ${mes}, ${autor}::uuid) RETURNING id::text
      `
      }
      const fid = cab.id

      // Antes de gravar: o que está no banco agora, para o histórico.
      const antes = await lerGravado(tx, fid)
      const alteracoes: Alteracao[] = []
      const mudou = (
        secao: string,
        item: string,
        campo: string,
        de: Valor,
        para: Valor,
        tipo: Tipo
      ) => {
        if (normal(de) !== normal(para)) alteracoes.push({ secao, item, campo, de, para, tipo })
      }
      for (const o of [...online].sort((a, b) => a.dia.localeCompare(b.dia))) {
        const a = antes.online.get(o.dia)
        const item = dataBR(o.dia)
        mudou('Online', item, 'Previsão', a?.previsao ?? null, o.previsao, 'data')
        mudou('Online', item, 'CB Descontos LOJA', a?.cbLoja ?? null, o.cbLoja, 'moeda')
        mudou('Online', item, 'Comentário', a?.comentario ?? '', o.comentario, 'texto')
      }
      for (const n of [...adquirente].sort((a, b) => a.dia.localeCompare(b.dia))) {
        const a = antes.adquirente.get(n.dia)
        const item = dataBR(n.dia)
        mudou('Adquirentes', item, 'Previsão', a?.previsao ?? null, n.previsao, 'data')
        mudou('Adquirentes', item, 'Comentário', a?.comentario ?? '', n.comentario, 'texto')
      }
      for (const c of conferencia) {
        mudou(
          'Conferência',
          ROTULO_CENTRO[c.centro] ?? c.centro,
          'Valor site',
          antes.conferencia.get(c.centro) ?? 0,
          c.valor,
          'moeda'
        )
      }
      mudou('Fechamento', 'Mês', 'Anulação (verificar)', antes.anulacao, anulacao, 'moeda')
      alteracoes.push(
        ...diferencasDaLista('Extrato', antes.extrato, extrato, CAMPOS_EXTRATO, resumoExtrato),
        ...diferencasDaLista(
          'Cancelados pós',
          antes.cancelados,
          cancelados,
          CAMPOS_CANCELADO,
          resumoCancelado
        )
      )

      const [{ agora }] = await tx<Array<{ agora: string }>>`
      UPDATE ifood_fechamento.fechamentos_mensais
      SET anulacao_verificar = ${anulacao}, atualizado_em = now(), atualizado_por = ${autor}::uuid
      WHERE id = ${fid}::bigint
      RETURNING to_char(atualizado_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS agora
    `

      // Online por dia: grava o dia com algum valor; limpa o dia que ficou vazio.
      for (const o of online) {
        const temValor = o.previsao !== null || o.cbLoja !== null || o.comentario !== ''
        if (temValor) {
          await tx`
          INSERT INTO ifood_fechamento.online_dia
            (fechamento_id, data_pedido, previsao_pagamento, cb_descontos_loja, comentario, criado_por)
          VALUES (${fid}::bigint, ${o.dia}::date, ${o.previsao}::date, ${o.cbLoja}, ${o.comentario}, ${autor}::uuid)
          ON CONFLICT (fechamento_id, data_pedido) DO UPDATE SET
            previsao_pagamento = EXCLUDED.previsao_pagamento,
            cb_descontos_loja = EXCLUDED.cb_descontos_loja,
            comentario = EXCLUDED.comentario,
            atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
        `
        } else {
          await tx`
          UPDATE ifood_fechamento.online_dia
          SET previsao_pagamento = NULL, cb_descontos_loja = NULL, comentario = '',
            atualizado_em = now(), atualizado_por = ${autor}::uuid
          WHERE fechamento_id = ${fid}::bigint AND data_pedido = ${o.dia}::date
            AND (previsao_pagamento IS NOT NULL OR cb_descontos_loja IS NOT NULL
                 OR COALESCE(comentario, '') <> '')
        `
        }
      }

      for (const a of adquirente) {
        if (a.previsao !== null || a.comentario !== '') {
          await tx`
          INSERT INTO ifood_fechamento.adquirente_dia
            (fechamento_id, data_pedido, previsao_pagamento, comentario, criado_por)
          VALUES (${fid}::bigint, ${a.dia}::date, ${a.previsao}::date, ${a.comentario}, ${autor}::uuid)
          ON CONFLICT (fechamento_id, data_pedido) DO UPDATE SET
            previsao_pagamento = EXCLUDED.previsao_pagamento, comentario = EXCLUDED.comentario,
            atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
        `
        } else {
          await tx`
          UPDATE ifood_fechamento.adquirente_dia
          SET previsao_pagamento = NULL, comentario = '',
            atualizado_em = now(), atualizado_por = ${autor}::uuid
          WHERE fechamento_id = ${fid}::bigint AND data_pedido = ${a.dia}::date
            AND (previsao_pagamento IS NOT NULL OR COALESCE(comentario, '') <> '')
        `
        }
      }

      for (const c of conferencia) {
        await tx`
        INSERT INTO ifood_fechamento.conferencia_breakdown (fechamento_id, centro_custo, valor, criado_por)
        VALUES (${fid}::bigint, ${c.centro}, ${c.valor}, ${autor}::uuid)
        ON CONFLICT (fechamento_id, centro_custo) DO UPDATE SET valor = EXCLUDED.valor,
          atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
        WHERE ifood_fechamento.conferencia_breakdown.valor IS DISTINCT FROM EXCLUDED.valor
      `
      }

      await tx`
      UPDATE ifood_fechamento.extrato_bancario SET deletado_em = now(), deletado_por = ${autor}::uuid
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL
    `
      for (const e of extrato) {
        await tx`
        INSERT INTO ifood_fechamento.extrato_bancario
          (fechamento_id, loja, banco, tipo, mes_ano, classificacao, sub_classificacao,
           data_movimento, historico, documento, malote, competencia, criado_por)
        VALUES (${fid}::bigint, ${e.loja}, ${e.banco}, ${e.tipo}, ${e.mesAno}, ${e.classificacao},
          ${e.subClassificacao}, ${e.dataMovimento}::date, ${e.historico}, ${e.documento},
          ${e.malote}, ${e.competencia}, ${autor}::uuid)
      `
      }

      await tx`
      UPDATE ifood_fechamento.cancelados_pos SET deletado_em = now(), deletado_por = ${autor}::uuid
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL
    `
      for (const c of cancelados) {
        await tx`
        INSERT INTO ifood_fechamento.cancelados_pos
          (fechamento_id, data_pedido, estabelecimento, cnpj, nome_cliente, numero_pedido,
           id_ifood, valor_pedido_taxa, valor_reembolso, centro_venda, origem_cancelamento,
           justificativa, andamento, protocolo, vale_no_cofre, data_anulacao, data_reembolso, criado_por)
        VALUES (${fid}::bigint, ${c.dataPedido}::date, ${c.estabelecimento}, ${c.cnpj}, ${c.nomeCliente},
          ${c.numeroPedido}, ${c.idIfood}, ${c.valorPedidoTaxa}, ${c.valorReembolso},
          ${c.centroVenda}, ${c.origemCancelamento}, ${c.justificativa}, ${c.andamento},
          ${c.protocolo}, ${c.valeNoCofre}, ${c.dataAnulacao}::date, ${c.dataReembolso}::date,
          ${autor}::uuid)
      `
      }
      // `::text::jsonb`: com `::jsonb` direto o postgres.js serializa a string de novo
      // e o banco guarda um texto JSON, não o array.
      if (alteracoes.length > 0) {
        await tx`
        INSERT INTO ifood_fechamento.historico
          (fechamento_id, operacao_ref, autor, autor_nome, alteracoes)
        VALUES (${fid}::bigint, ${operacao.ref.trim().slice(0, 30)}, ${autor}::uuid, ${autorNome},
          ${JSON.stringify(alteracoes)}::text::jsonb)
      `
      }
      return { agora, alteracoes: alteracoes.length }
    })

    return { gravadoEm: gravado.agora, alteracoes: gravado.alteracoes }
  } catch (e) {
    erroDeBanco(e)
  }
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
