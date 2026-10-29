import { defineHandler, HttpError } from '@gia-cb/sdk/server'

// Pedidos de delivery do Maestro de UMA loja, lidos da API do DW (`/Delivery/`).
// O token vem do hub de Credenciais do portal (ctx.credencial) — nunca do código.
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

interface Pedido {
  id: string
  n_pedido: string
  data_de_criacao: string | null
  data_de_acao: string | null
  n_parceiro: string | null
  n_conta: string | null
  cpf_cliente: string | null
  nome_cliente: string | null
  quantidade_pedidos: number | null
  email_cliente: string | null
  telefone_cliente: string | null
  street_name: string | null
  street_number: string | null
  reference: string | null
  retirada: string | null
  confirmado_por: string | null
  cancelado_por: string | null
  origem: string | null
  status_do_pedido: string | null
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
  forma_de_pagamentos: string | null
  descontos: string | null
  nome_loja: string | null
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO = 'apidw'
/** A API aceita até 6 meses, mas 31 dias de uma loja já levam ~25 s para responder. */
const MAX_DIAS_PERIODO = 31
/** Mesmo teto do legado (90 s); acima disso a borda da API devolve 524. */
const TIMEOUT_MS = 90_000
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

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

function normalizar(raw: Record<string, unknown>): Pedido | null {
  const id = texto(raw.id)
  if (!id) return null
  const qtd = Number(raw.quantidade_pedidos)
  return {
    id,
    // n_pedido às vezes vem como número — o legado já tratava (GetJsonStr).
    n_pedido: texto(raw.n_pedido) ?? '',
    data_de_criacao: texto(raw.data_de_criacao_horario_sp),
    data_de_acao: texto(raw.data_de_acao_horario_sp),
    n_parceiro: texto(raw.n_parceiro),
    n_conta: texto(raw.n_conta),
    cpf_cliente: texto(raw.cpf_cliente),
    nome_cliente: texto(raw.nome_cliente),
    quantidade_pedidos: raw.quantidade_pedidos != null && Number.isFinite(qtd) ? qtd : null,
    email_cliente: texto(raw.email_cliente),
    telefone_cliente: texto(raw.telefone_cliente),
    street_name: texto(raw.street_name),
    street_number: texto(raw.street_number),
    reference: texto(raw.reference),
    retirada: texto(raw.retirada),
    confirmado_por: texto(raw.confirmado_por),
    cancelado_por: texto(raw.cancelado_por),
    origem: texto(raw.origem),
    status_do_pedido: texto(raw.status_do_pedido),
    valor_do_pedido: numero(raw.valor_do_pedido),
    valor_da_entrega: numero(raw.valor_da_entrega),
    total_pago: numero(raw.total_pago),
    desconto_total: numero(raw.desconto_total),
    forma_de_pagamentos: texto(raw.forma_de_pagamentos),
    descontos: texto(raw.descontos),
    nome_loja: texto(raw.nome_loja),
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

export default defineHandler<Body, { pedidos: Pedido[] }>(async (ctx) => {
  await ctx.requirePermission('reports-maestro.ler')
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

  const pedidos: Pedido[] = []
  for (const raw of json.data as Record<string, unknown>[]) {
    const p = raw && typeof raw === 'object' ? normalizar(raw) : null
    if (p) pedidos.push(p)
  }
  // Mesma ordem do legado na abertura: pela criação do pedido.
  pedidos.sort((a, b) => (a.data_de_criacao ?? '').localeCompare(b.data_de_criacao ?? ''))
  return { pedidos }
})

export const config = { integracoes: ['apidw'], secrets: [] }
