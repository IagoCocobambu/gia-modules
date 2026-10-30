import { defineHandler, HttpError } from '@gia-cb/sdk/server'

// Fechamento dos pedidos de delivery do Maestro de UMA loja num período: lê os
// pedidos da API do DW (`/Delivery/`) e concilia os pagamentos de cada um.
// Só API — nada de banco: a classificação das formas de pagamento é a regra fixa
// de `REGRAS_PAGAMENTO` abaixo, aplicada ao texto que a própria API devolve.
//
// A loja chega como `empresaId` (validado contra o escopo); o `loc_ref` da API é o
// número da loja tirado do NOME da Empresa no servidor — o body não escolhe loja.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. As funções de
// data e `numeroDaLoja` se repetem em outros arquivos de propósito.

interface Body {
  empresaId: number
  de: string
  ate: string
}

type TipoPagamento = 'online' | 'adquirente' | 'offline' | 'nao_classificado'

interface Pagamento {
  descricao: string
  /** `null` quando o texto da API não traz o valor entre parênteses. */
  valor: number | null
  tipo: TipoPagamento
}

interface Desconto {
  descricao: string
  valor: number | null
}

interface PedidoFechamento {
  id: string
  n_pedido: string
  /** Dia do fechamento (`YYYY-MM-DD`): data de criação do pedido, hora de São Paulo. */
  data: string
  data_de_criacao: string | null
  origem: string | null
  status_do_pedido: string | null
  tipo_entrega: string | null
  retirada: string | null
  nome_cliente: string | null
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
  incentivo_parceiro: number
  forma_de_pagamentos: string | null
  descontos: string | null
  pagamentos: Pagamento[]
  lista_descontos: Desconto[]
  total_pago_online: number
  total_pago_adquirentes: number
  total_pago_offline: number
  total_nao_classificado: number
  total_de_descontos: number
  cancelado: boolean
  venda_concluida: boolean
  check_pagamentos: boolean
  check_descontos: boolean
  divergencias: string[]
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO = 'apidw'
/** A API aceita até 6 meses, mas 31 dias de uma loja já levam ~25 s para responder. */
const MAX_DIAS_PERIODO = 31
/** Mesmo teto do Reports Maestro (90 s); acima disso a borda da API devolve 524. */
const TIMEOUT_MS = 90_000
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Classificação das formas de pagamento — a regra do fechamento. Avaliada em
 * ordem, sobre o texto sem acento e em maiúsculas; a primeira que casar vence.
 * O que não casar com nenhuma fica "não classificado" e reprova o check de
 * pagamentos do pedido, pra alguém olhar. Forma nova da API: acrescente aqui.
 *
 * - Offline: dinheiro recebido na entrega (`CASH OFFLINE`).
 * - Online: pago antes, no app ou no parceiro (`... - PRE PAGO`, `PIX ONLINE ...`,
 *   `CREDIT ONLINE VISA ...`, `BENEFICIO IFOOD ...`).
 * - Adquirente: cartão/voucher passado na maquininha na entrega
 *   (`CREDIT OFFLINE`, `DEBIT OFFLINE`, `Master - Débito`).
 */
const REGRAS_PAGAMENTO: { tipo: Exclude<TipoPagamento, 'nao_classificado'>; padrao: RegExp }[] = [
  { tipo: 'offline', padrao: /\b(CASH|DINHEIRO)\b/ },
  { tipo: 'online', padrao: /\bPRE[\s-]?PAGO\b|\bONLINE\b/ },
  {
    tipo: 'adquirente',
    padrao: /\b(CREDIT|DEBIT|CREDITO|DEBITO|VOUCHER|VALE|TICKET|ALELO|SODEXO|PLUXEE|VR)\b/,
  },
]

/** Status que contam como venda concluída (o pedido chegou ao cliente). */
const STATUS_CONCLUIDOS = new Set(['DELIVERED', 'COMPLETED'])
const STATUS_CANCELADO = 'CANCELLED'

function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000)
}

function validarPeriodo(de: unknown, ate: unknown): { de: string; ate: string } {
  if (
    typeof de !== 'string' ||
    typeof ate !== 'string' ||
    !DATA_RE.test(de) ||
    !DATA_RE.test(ate)
  ) {
    throw new HttpError(422, 'Informe o período no formato AAAA-MM-DD.')
  }
  if (Number.isNaN(Date.parse(de)) || Number.isNaN(Date.parse(ate))) {
    throw new HttpError(422, 'Data inválida.')
  }
  if (de > ate) throw new HttpError(422, 'A data final não pode ser menor que a data inicial.')
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    throw new HttpError(
      422,
      `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
    )
  }
  return { de, ate }
}

/** "01.CB GOIANIA" → "01"; "48. VASTO SUL" → "48". Sem número antes do ponto → null. */
function numeroDaLoja(nome: string): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(nome)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function numero(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Valor em centavos inteiros — toda soma e comparação do fechamento é em centavos. */
function centavos(v: number): number {
  return Math.round(v * 100)
}

function reais(c: number): number {
  return c / 100
}

function brl(c: number): string {
  const s = (Math.abs(c) / 100).toFixed(2).replace('.', ',')
  return `${c < 0 ? '-' : ''}R$ ${s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/**
 * `"PIX ONLINE PIX - PRE PAGO (144.9), BENEFICIO IFOOD ENTREGA - PRE PAGO (4.31)"`
 * → `[{ descricao, valor }]`. A vírgula só separa itens quando o próximo trecho
 * ainda tem um valor entre parênteses — descrição com vírgula não quebra.
 */
function separarItens(bruto: string | null): { descricao: string; valor: number | null }[] {
  if (!bruto) return []
  return bruto
    .split(/,\s*(?=[^()]*\()/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => {
      const m = /^(.*?)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)\s*$/.exec(parte)
      return m ? { descricao: m[1].trim(), valor: Number(m[2]) } : { descricao: parte, valor: null }
    })
}

function classificar(descricao: string): TipoPagamento {
  const norm = descricao.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  return REGRAS_PAGAMENTO.find((r) => r.padrao.test(norm))?.tipo ?? 'nao_classificado'
}

function conciliar(raw: Record<string, unknown>): PedidoFechamento | null {
  const id = texto(raw.id)
  if (!id) return null

  const formaPgto = texto(raw.forma_de_pagamentos)
  const descontosTxt = texto(raw.descontos)
  const totalPago = numero(raw.total_pago)
  const descontoTotal = numero(raw.desconto_total)
  const status = texto(raw.status_do_pedido)
  const criacao = texto(raw.data_de_criacao_horario_sp)
  const acao = texto(raw.data_de_acao_horario_sp)

  const pagamentos: Pagamento[] = separarItens(formaPgto).map((i) => ({
    ...i,
    tipo: classificar(i.descricao),
  }))
  const listaDescontos: Desconto[] = separarItens(descontosTxt)

  const porTipo: Record<TipoPagamento, number> = {
    online: 0,
    adquirente: 0,
    offline: 0,
    nao_classificado: 0,
  }
  const divergencias: string[] = []
  for (const p of pagamentos) {
    if (p.valor === null) {
      divergencias.push(`Forma de pagamento sem valor: "${p.descricao}".`)
      continue
    }
    porTipo[p.tipo] += centavos(p.valor)
    if (p.tipo === 'nao_classificado') {
      divergencias.push(`Forma de pagamento sem classificação: "${p.descricao}".`)
    }
  }
  const somaPagamentos =
    porTipo.online + porTipo.adquirente + porTipo.offline + porTipo.nao_classificado
  if (somaPagamentos !== centavos(totalPago)) {
    divergencias.push(
      `Soma das formas de pagamento (${brl(somaPagamentos)}) diferente do total pago (${brl(centavos(totalPago))}).`
    )
  }
  const checkPagamentos = divergencias.length === 0

  let somaDescontos = 0
  for (const d of listaDescontos) {
    if (d.valor === null) divergencias.push(`Desconto sem valor: "${d.descricao}".`)
    else somaDescontos += centavos(d.valor)
  }
  const descontosSemValor = listaDescontos.some((d) => d.valor === null)
  if (somaDescontos !== centavos(descontoTotal)) {
    divergencias.push(
      `Soma dos descontos (${brl(somaDescontos)}) diferente do desconto total (${brl(centavos(descontoTotal))}).`
    )
  }
  const checkDescontos = !descontosSemValor && somaDescontos === centavos(descontoTotal)

  return {
    id,
    // n_pedido às vezes vem como número — o legado já tratava (GetJsonStr).
    n_pedido: texto(raw.n_pedido) ?? '',
    data: (criacao ?? acao ?? '').slice(0, 10),
    data_de_criacao: criacao,
    origem: texto(raw.origem),
    status_do_pedido: status,
    tipo_entrega: texto(raw.tipo_entrega),
    retirada: texto(raw.retirada),
    nome_cliente: texto(raw.nome_cliente),
    valor_do_pedido: numero(raw.valor_do_pedido),
    valor_da_entrega: numero(raw.valor_da_entrega),
    total_pago: totalPago,
    desconto_total: descontoTotal,
    incentivo_parceiro: numero(raw.incentivo_parceiro),
    forma_de_pagamentos: formaPgto,
    descontos: descontosTxt,
    pagamentos,
    lista_descontos: listaDescontos,
    total_pago_online: reais(porTipo.online),
    total_pago_adquirentes: reais(porTipo.adquirente),
    total_pago_offline: reais(porTipo.offline),
    total_nao_classificado: reais(porTipo.nao_classificado),
    total_de_descontos: reais(somaDescontos),
    cancelado: status === STATUS_CANCELADO,
    venda_concluida: status !== null && STATUS_CONCLUIDOS.has(status),
    check_pagamentos: checkPagamentos,
    check_descontos: checkDescontos,
    divergencias,
  }
}

/** Mensagem que a API devolve no corpo de um erro (`{ "detail": "..." }`), se houver. */
async function detalheDoErro(r: Response): Promise<string> {
  try {
    const corpo = (await r.json()) as { detail?: unknown }
    return typeof corpo.detail === 'string' ? ` ${corpo.detail}` : ''
  } catch {
    return ''
  }
}

export default defineHandler<Body, { pedidos: PedidoFechamento[] }>(async (ctx) => {
  await ctx.requirePermission('fechamento-maestro.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  const locRef = numeroDaLoja(empresa.nome)
  if (!locRef) {
    throw new HttpError(422, `Não há número de loja no nome "${empresa.nome}" (ex.: "01.CB ...").`)
  }

  const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
  const base = baseUrl.replace(/\/+$/, '')
  const qs = new URLSearchParams({ loc_ref: locRef, start_date: de, end_date: ate })

  let r: Response
  try {
    r = await fetch(`${base}/Delivery/?${qs}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new HttpError(
        504,
        'A API de delivery demorou demais para responder. Tente um período menor.'
      )
    }
    throw e
  }
  if (!r.ok) {
    throw new HttpError(502, `A API de delivery respondeu ${r.status}.${await detalheDoErro(r)}`)
  }

  const json = (await r.json()) as { data?: unknown }
  // 200 sem a lista `data` é falha, não "zero pedidos".
  if (!json || !Array.isArray(json.data)) {
    throw new HttpError(502, 'A API de delivery devolveu um formato inesperado.')
  }

  const pedidos: PedidoFechamento[] = []
  for (const raw of json.data as Record<string, unknown>[]) {
    const p = raw && typeof raw === 'object' ? conciliar(raw) : null
    if (p) pedidos.push(p)
  }
  pedidos.sort((a, b) => (a.data_de_criacao ?? '').localeCompare(b.data_de_criacao ?? ''))
  return { pedidos }
})

export const config = { integracoes: ['apidw'], secrets: [] }
