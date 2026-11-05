import { defineHandler, HttpError } from '@gia-cb/sdk/server'

// Pedidos de delivery do Maestro de UMA loja, lidos da API do DW (`/Delivery/`).
// O token vem do hub de Credenciais do portal (ctx.credencial) — nunca do código.
//
// A loja chega como `empresaId` (validado contra o escopo); o `loc_ref` da API é o
// número da loja tirado no servidor do vínculo com a BI do Simphony
// (`locRefs.BIAPI`), com o nome da Empresa de reserva — o body não escolhe loja.
//
// Dados pessoais do cliente (CPF, e-mail, telefone, número e complemento do
// endereço) saem MASCARADOS daqui para quem não tem `reports-maestro.ver-dados-cliente`:
// o dado completo não chega ao navegador — nem à tela, nem ao Excel.
//
// ── UMA CONSULTA PARA AS DUAS ABAS ──────────────────────────────────────────
//
// A API é chamada UMA vez, com o histórico de status (`incluir_historico=true`),
// e a resposta serve às duas abas: `pedidos` (a lista, com o mascaramento) e
// `operacional` (o resumo por pedido do dashboard, com o tempo de cada etapa).
// Antes eram dois handlers e duas chamadas à mesma API — trocar de aba depois de
// pesquisar buscava tudo de novo (pedido do usuário em 05/11/2026). O histórico
// bruto não desce para o navegador: só o resumo.
//
// ── COMO CADA NÚMERO DO OPERACIONAL É CALCULADO ─────────────────────────────
//
// - Etapas (minutos): do PRIMEIRO evento de um status ao PRIMEIRO do seguinte.
//   Aceite = Recebido → Confirmado; Preparo = Confirmado → Embalado; Expedição =
//   Embalado → Despachado; Rota = Despachado → Entregue; Total = Recebido →
//   Entregue.
// - Desfecho, pelo histórico e não pelo status atual: o `status_do_pedido` é só
//   o ÚLTIMO evento registrado, e a loja que registra "despachado" depois de o
//   app de entrega marcar "entregue" deixa um pedido entregue com status
//   Despachado.
// - Quem cancelou: a `origem` do evento CANCELLED — CONSUMER (cliente ou
//   plataforma) ou STORE (loja).
//
// Ver docs/gargalos-operacionais-delivery.md.
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
  // Campos da API que o legado não mostrava — nulos quando o pedido não tem.
  tipo_entrega: string | null
  entrega_pela_origem: boolean | null
  entregue_por: string | null
  parceiro: string | null
  taxa_entrega: number | null
  taxa_extra_parceiro: number | null
  incentivo_loja: number | null
  incentivo_parceiro: number | null
  id_loja: string | null
  data_de_criacao_utc: string | null
}

type Desfecho =
  'entregue' | 'entregue-cancelado' | 'cancelado' | 'sem-entrega' | 'retirada' | 'antes-de-sair'

type QuemCancelou = 'cliente' | 'loja' | 'ambos' | 'outro'

interface PedidoOperacional {
  origem: string
  retirada: boolean
  /** `YYYY-MM-DD HH:mm:ss`, hora de São Paulo. */
  criadoEm: string
  valor: number
  desfecho: Desfecho
  aceite: number | null
  preparo: number | null
  expedicao: number | null
  rota: number | null
  total: number | null
  baixaForaDeOrdem: boolean
  cancelamento: {
    por: QuemCancelou
    minutos: number | null
  } | null
}

interface Evento {
  status: string
  t: number
  origem: string | null
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO = 'apidw'
/**
 * A API aceita até 6 meses, mas 31 dias de uma loja movimentada, com o histórico,
 * levam ~45 s para responder.
 */
const MAX_DIAS_PERIODO = 31
/** Mesmo teto do legado (90 s); acima disso a borda da API devolve 524. */
const TIMEOUT_MS = 90_000
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/
const DATA_HORA_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/

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

/**
 * Número da loja com 2 dígitos — o `loc_ref` da API. Sai primeiro do vínculo com a
 * BI do Simphony (`locRefs.BIAPI` começa sempre pelo número: "01 CB Go", "17. CB R",
 * "13CBMa", "65"); o nome da Empresa ("01.CB GOIANIA") fica de reserva.
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '') ?? /^\s*(\d{1,4})\s*\./.exec(e.nome)
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

/** Como `numero`, mas sem valor fica `null` (pedido sem parceiro não é R$ 0,00). */
function numeroOuNulo(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function booleano(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 1 || v === 'true' || v === '1') return true
  if (v === 0 || v === 'false' || v === '0') return false
  return null
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
    tipo_entrega: texto(raw.tipo_entrega),
    entrega_pela_origem: booleano(raw.entrega_pela_origem),
    entregue_por: texto(raw.entregue_por),
    parceiro: texto(raw.parceiro),
    taxa_entrega: numeroOuNulo(raw.taxa_entrega),
    taxa_extra_parceiro: numeroOuNulo(raw.taxa_extra_parceiro),
    incentivo_loja: numeroOuNulo(raw.incentivo_loja),
    incentivo_parceiro: numeroOuNulo(raw.incentivo_parceiro),
    id_loja: texto(raw.id_loja),
    data_de_criacao_utc: texto(raw.data_de_criacao_utc),
  }
}

// ─── Resumo do Operacional ──────────────────────────────────────────────────

/**
 * `YYYY-MM-DD HH:mm:ss` (hora de São Paulo, sem fuso) → milissegundos. Lê como
 * UTC de propósito: só a DIFERENÇA entre dois horários importa, e os dois estão
 * no mesmo fuso.
 */
function instante(v: unknown): number | null {
  const m = typeof v === 'string' ? DATA_HORA_RE.exec(v) : null
  if (!m) return null
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0))
}

/** Os eventos do histórico, em ordem de horário. Evento sem horário é descartado. */
function eventos(raw: unknown): Evento[] {
  if (!Array.isArray(raw)) return []
  const saida: Evento[] = []
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue
    const o = e as Record<string, unknown>
    const status = texto(o.status)
    const t = instante(o.data_horario_sp)
    if (status && t !== null) saida.push({ status, t, origem: texto(o.origem) })
  }
  return saida.sort((a, b) => a.t - b.t)
}

function primeiro(evs: Evento[], status: string): Evento | undefined {
  return evs.find((e) => e.status === status)
}

/** Minutos entre os primeiros eventos de dois status, com uma casa; `null` se faltar um. */
function minutos(evs: Evento[], de: string, ate: string): number | null {
  const a = primeiro(evs, de)
  const b = primeiro(evs, ate)
  if (!a || !b) return null
  return Math.round((b.t - a.t) / 6_000) / 10
}

function quemCancelou(evs: Evento[]): QuemCancelou {
  const origens = new Set(evs.filter((e) => e.status === 'CANCELLED').map((e) => e.origem))
  const cliente = origens.has('CONSUMER')
  const loja = origens.has('STORE')
  if (cliente && loja) return 'ambos'
  if (cliente) return 'cliente'
  if (loja) return 'loja'
  return 'outro'
}

function resumir(raw: Record<string, unknown>): PedidoOperacional | null {
  const criadoEm = texto(raw.data_de_criacao_horario_sp)
  if (!texto(raw.id) || !criadoEm) return null
  const evs = eventos(raw.historico_status)
  // Pedido sem histórico ainda tem o status atual: ele entra como um evento sem
  // horário, só para o desfecho — os tempos ficam vazios.
  const status = new Set(evs.map((e) => e.status))
  const atual = texto(raw.status_do_pedido)
  if (atual) status.add(atual)

  const retirada = texto(raw.retirada)?.toUpperCase() === 'SIM'
  const entregue = primeiro(evs, 'DELIVERED')
  const cancelado = primeiro(evs, 'CANCELLED')

  let desfecho: Desfecho
  if (status.has('CANCELLED')) {
    desfecho =
      entregue && cancelado && entregue.t < cancelado.t ? 'entregue-cancelado' : 'cancelado'
  } else if (status.has('DELIVERED') || status.has('COMPLETED')) {
    desfecho = 'entregue'
  } else if (retirada) {
    desfecho = 'retirada'
  } else if (status.has('DISPATCHED') || status.has('ON_ROUTE')) {
    desfecho = 'sem-entrega'
  } else {
    desfecho = 'antes-de-sair'
  }

  // A loja registrou embalado/despachado DEPOIS de o app de entrega já ter
  // pegado o pedido (a caminho) ou marcado a entrega.
  const appPegou = Math.min(
    primeiro(evs, 'GOING_TO_DESTINATION')?.t ?? Infinity,
    entregue?.t ?? Infinity
  )
  const lojaDepois = Math.max(
    primeiro(evs, 'PACKED')?.t ?? -Infinity,
    primeiro(evs, 'DISPATCHED')?.t ?? -Infinity
  )
  const baixaForaDeOrdem = Number.isFinite(appPegou) && lojaDepois > appPegou

  let cancelamento: PedidoOperacional['cancelamento'] = null
  if (desfecho === 'cancelado' || desfecho === 'entregue-cancelado') {
    cancelamento = {
      por: quemCancelou(evs),
      minutos: minutos(evs, 'RECEIVED', 'CANCELLED'),
    }
  }

  return {
    origem: texto(raw.origem) ?? 'Sem origem',
    retirada,
    criadoEm,
    valor: numero(raw.valor_do_pedido),
    desfecho,
    aceite: minutos(evs, 'RECEIVED', 'CONFIRMED'),
    preparo: minutos(evs, 'CONFIRMED', 'PACKED'),
    expedicao: minutos(evs, 'PACKED', 'DISPATCHED'),
    rota: minutos(evs, 'DISPATCHED', 'DELIVERED'),
    total: minutos(evs, 'RECEIVED', 'DELIVERED'),
    baixaForaDeOrdem,
    cancelamento,
  }
}

// ─── Mascaramento (sem `reports-maestro.ver-dados-cliente`) ──────────────────

const OCULTO = '***'

/** "12345678901" → "***.456.789-**". Fora do formato de CPF, oculta tudo. */
function mascararCpf(v: string): string {
  const d = v.replace(/\D/g, '')
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : OCULTO
}

/** "joao.silva@gmail.com" → "jo***@gmail.com" (usuário curto: só a 1ª letra). */
function mascararEmail(v: string): string {
  const arroba = v.lastIndexOf('@')
  if (arroba < 1) return OCULTO
  return `${v.slice(0, arroba > 2 ? 2 : 1)}***${v.slice(arroba)}`
}

/** "11987654321" → "(11) *****-4321"; sem DDD reconhecível, só os 4 últimos dígitos. */
function mascararTelefone(v: string): string {
  let d = v.replace(/\D/g, '')
  if (d.length < 8) return OCULTO
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2)
  const fim = d.slice(-4)
  return (d.length === 10 || d.length === 11) && !d.startsWith('0')
    ? `(${d.slice(0, 2)}) *****-${fim}`
    : `*****-${fim}`
}

/** Nome do cliente e nome da rua ficam: é por eles que se acha o pedido de uma reclamação. */
function mascarar(p: Pedido): Pedido {
  return {
    ...p,
    cpf_cliente: p.cpf_cliente && mascararCpf(p.cpf_cliente),
    email_cliente: p.email_cliente && mascararEmail(p.email_cliente),
    telefone_cliente: p.telefone_cliente && mascararTelefone(p.telefone_cliente),
    street_number: p.street_number && OCULTO,
    reference: p.reference && OCULTO,
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

interface Resposta {
  pedidos: Pedido[]
  /** `true` quando CPF, e-mail, telefone e endereço vieram mascarados. */
  dadosClienteMascarados: boolean
  /** O resumo por pedido do dashboard Operacional — sem dado nenhum do cliente. */
  operacional: PedidoOperacional[]
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('reports-maestro.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)
  const verDados = await ctx.hasPermission('reports-maestro.ver-dados-cliente')

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  const locRef = numeroDaLoja(empresa)
  if (!locRef) {
    throw new HttpError(
      422,
      `A loja "${empresa.nome}" não tem número de loja no cadastro (vínculo com a BI do Simphony).`
    )
  }

  const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
  const base = baseUrl.replace(/\/+$/, '')
  const qs = new URLSearchParams({
    loc_ref: locRef,
    start_date: de,
    end_date: ate,
    incluir_historico: 'true',
  })

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
  const operacional: PedidoOperacional[] = []
  for (const raw of json.data as Record<string, unknown>[]) {
    if (!raw || typeof raw !== 'object') continue
    const p = normalizar(raw)
    if (p) pedidos.push(verDados ? p : mascarar(p))
    const o = resumir(raw)
    if (o) operacional.push(o)
  }
  // Mesma ordem do legado na abertura: pela criação do pedido.
  pedidos.sort((a, b) => (a.data_de_criacao ?? '').localeCompare(b.data_de_criacao ?? ''))
  operacional.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
  return { pedidos, dadosClienteMascarados: !verDados, operacional }
})

export const config = { integracoes: ['apidw'], secrets: [] }
