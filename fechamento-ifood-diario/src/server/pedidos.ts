import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Pedidos de delivery de UMA loja (Empresa) num dia, da API do DW (`/Delivery/`) — a
// 1ª metade da `BuscarFechamento` do legado (`MapApiItemToTransaction`) — e a lista de
// formas "ONLINE VR" do cadastro `gia_relatorios.formas_pagamento` do Maestro (só
// leitura). O cruzamento com o iFood e as contas são feitos na tela, que busca as
// vendas de cada restaurante do iFood em paralelo (handler `vendas`) e mostra o
// progresso.
//
// A loja junta TODAS as operações dela: o DW devolve os pedidos de todas no mesmo
// `loc_ref` (o número da loja), e aqui ficam os dos canais do iFood — "iFood" (Coco
// Bambu, Express, Pizzaria, Dani…) e "iFood Vasto" —, cruzados na tela com as vendas de
// todos os restaurantes do iFood da loja.
//
// A loja chega como `empresaId`, validada com `requireEmpresa`.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. Validação de data,
// `numeroDaLoja` e `normalizarOrigem` se repetem em `lojas.ts`, `vendas.ts` e
// `src/regras.ts` de propósito.

interface Body {
  empresaId: number
  data: string
}

/** Mesmo teto do Fechamento Maestro (90 s); acima disso a borda da API do DW devolve 524. */
const TIMEOUT_DW_MS = 90_000
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

/** Hoje em São Paulo, `AAAA-MM-DD`. */
function hojeSp(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function validarData(data: unknown): string {
  if (typeof data !== 'string' || !DATA_RE.test(data)) {
    throw new HttpError(422, 'Informe a data no formato AAAA-MM-DD.')
  }
  // Date.parse aceita "2026-02-30" (vira 02/03); a volta para texto tem que bater.
  const t = Date.parse(`${data}T00:00:00Z`)
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== data) {
    throw new HttpError(422, 'Data inválida.')
  }
  if (data > hojeSp()) throw new HttpError(422, 'A data não pode ser futura.')
  return data
}

/**
 * Número da loja com 2 dígitos — o `loc_ref` do DW.
 * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
 * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
 * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
 * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/** Canais do iFood no DW (`normalizarOrigem`): a loja e o Vasto na loja. */
const CANAIS_IFOOD = new Set(['ifood', 'ifood_vasto'])

type Json = Record<string, unknown>

function obj(v: unknown): Json | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null
}

/**
 * Texto de um campo — a `GetJsonStr` do legado: número vira inteiro em texto
 * (`n_pedido`/`shortId` vêm como número), `null`/ausente/outro tipo = `null`.
 */
function texto(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  return null
}

/** Número de um campo — a `GetJsonNum` do legado: `null`/ausente/inválido = `null`. */
function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** A `GetJsonBool` do legado: `true`, ou texto SIM/TRUE/1/S/YES. */
function booleano(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string')
    return ['SIM', 'TRUE', '1', 'S', 'YES'].includes(v.trim().toUpperCase())
  return false
}

/**
 * Chave da origem — a `normalizeOrigemKey` do legado: minúsculas, espaços viram `_`,
 * `APP CB` = `App Coco Bambu`, `99 Food` = `99Food`.
 */
function normalizarOrigem(origem: string | null | undefined): string {
  if (!origem) return ''
  const s = origem.trim().toLowerCase().replace(/\s+/g, ' ')
  const apelidos: Record<string, string> = { 'app cb': 'app coco bambu', '99 food': '99food' }
  return (apelidos[s] ?? s).replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

/** Forma do cadastro com tipo "ONLINE VR". */
interface FormaOnlineVr {
  /** Trecho em maiúsculas procurado dentro da forma de pagamento. */
  descricao: string
  /** Chave da origem (`normalizarOrigem`); vazia = vale para todas. */
  origem: string
}

/** Formas "ONLINE VR" ativas do cadastro, da descrição mais longa para a mais curta. */
async function carregarFormasOnlineVr(): Promise<FormaOnlineVr[]> {
  let linhas: { descricao: string | null; origem: string | null }[]
  try {
    linhas = await sql<{ descricao: string | null; origem: string | null }[]>`
      select descricao, origem
      from gia_relatorios.formas_pagamento
      where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
    `
  } catch (e) {
    console.error('[fechamento-ifood-diario] cadastro de formas de pagamento:', e)
    // Não conectou (banco fora, rede) é passageiro: 503. O resto (senha, permissão,
    // tabela) é configuração e não passa sozinho: 502, para o suporte.
    if (ehFalhaDeConexao(e)) {
      throw new HttpError(503, 'Não conseguimos conectar ao banco do Maestro.')
    }
    throw new HttpError(
      502,
      'O banco do Maestro recusou a leitura do cadastro de formas de pagamento.'
    )
  }
  return (
    linhas
      .map((l) => ({
        descricao: (l.descricao ?? '').trim().toUpperCase(),
        origem: normalizarOrigem(l.origem),
      }))
      // Descrição vazia casaria com qualquer forma de pagamento.
      .filter((f) => f.descricao !== '')
      .sort((a, b) => b.descricao.length - a.descricao.length)
  )
}

/** Pedido do DW no formato do legado (`MapApiItemToTransaction`), antes do cruzamento. */
function doDw(raw: Json, nomeLojaPadrao: string, data: string) {
  const totalPagoDw = numero(raw.total_pago) ?? numero(raw.total) ?? numero(raw.amount) ?? 0
  const retirada = booleano(raw.retirada)
  return {
    id: texto(raw.id) || texto(raw.order_id) || '',
    n_pedido: texto(raw.n_pedido) ?? texto(raw.order_id) ?? '',
    n_parceiro: texto(raw.n_parceiro) ?? '',
    data_calc: data,
    data_de_criacao: texto(raw.data_de_criacao_horario_sp) ?? texto(raw.data_de_criacao_utc) ?? '',
    // Desempata, no cruzamento, pedidos com o mesmo código em dois restaurantes do iFood.
    criado_utc: texto(raw.data_de_criacao_utc) ?? '',
    origem: texto(raw.origem) ?? texto(raw.channel) ?? 'iFood',
    valor_do_pedido: numero(raw.valor_do_pedido) ?? numero(raw.order_value) ?? totalPagoDw,
    valor_da_entrega: numero(raw.valor_da_entrega) ?? numero(raw.delivery_fee) ?? 0,
    total_pago_dw: totalPagoDw,
    desconto_total: numero(raw.desconto_total) ?? numero(raw.discount) ?? 0,
    forma_de_pagamentos: texto(raw.forma_de_pagamentos) ?? texto(raw.payment_method) ?? '',
    nome_loja: texto(raw.nome_loja) ?? nomeLojaPadrao,
    id_loja: texto(raw.id_loja) ?? '',
    // AGENDADO do legado sai do campo `retirada` do DW.
    agendado: retirada ? 'SIM' : 'NÃO',
    incentivo_parceiro: numero(raw.incentivo_parceiro) ?? 0,
    incentivo_loja: numero(raw.incentivo_loja) ?? 0,
    taxa_extra_parceiro: numero(raw.taxa_extra_parceiro) ?? 0,
    confirmado_por: '',
    total_parceiro: 0,
    tipo_pedido: '',
    data_cancelamento: '',
    origem_cancelamento: '',
    motivo_cancelamento: '',
    cancelamento_contestavel: '',
    motivo_impossibilidade: '',
    data_limite_contestacao: '',
    cancelamento_parcial: '',
    encontrado_no_ifood: false,
    merchant_ifood: '',
    operacao_ifood: '',
  }
}

type PedidoDw = ReturnType<typeof doDw>

interface Resposta {
  /** Pedidos dos canais do iFood da loja, no formato do legado, antes do cruzamento. */
  pedidos: PedidoDw[]
  /** Formas "ONLINE VR" do cadastro, da descrição mais longa para a mais curta. */
  formasVr: FormaOnlineVr[]
}

/**
 * Registra no log do servidor a mensagem que a API devolveu no corpo do erro. Ela NÃO vai
 * para a tela: é texto de terceiro, sem controle do que traz (ids, caminhos, eco da
 * requisição). A tela recebe só o status; o suporte acha o detalhe pelo ID da chamada.
 */
async function registrarDetalheDoErro(r: Response): Promise<void> {
  try {
    const corpo = (await r.json()) as { detail?: unknown; message?: unknown }
    const msg = corpo.detail ?? corpo.message
    if (typeof msg === 'string')
      console.error('[fechamento-ifood-diario] %s respondeu %d:', 'DW', r.status, msg)
  } catch {
    // corpo não é JSON: nada a registrar
  }
}

/** Códigos de "não conectou" — do Node (rede/DNS) e do driver `postgres`. */
const CODIGOS_CONEXAO = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'CONNECT_TIMEOUT',
  'CONNECTION_CLOSED',
  'CONNECTION_ENDED',
  'CONNECTION_DESTROYED',
  '57P01', // admin_shutdown
  '57P03', // cannot_connect_now
  '53300', // too_many_connections
])

/** O erro é de conexão (passageiro), não de configuração ou de dado. */
function ehFalhaDeConexao(e: unknown): boolean {
  const codigo = (x: unknown) =>
    x && typeof x === 'object' && 'code' in x ? String((x as { code: unknown }).code) : ''
  const causa = e && typeof e === 'object' && 'cause' in e ? (e as { cause: unknown }).cause : null
  // O Node às vezes junta as tentativas (IPv4/IPv6) num AggregateError, em `errors`.
  const juntos =
    causa && typeof causa === 'object' && 'errors' in causa
      ? ((causa as { errors: unknown }).errors as unknown[])
      : []
  return [e, causa, ...(Array.isArray(juntos) ? juntos : [])].some((x) =>
    CODIGOS_CONEXAO.has(codigo(x))
  )
}

function ehTimeout(e: unknown): boolean {
  return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
  // 403 se a Empresa está fora do escopo do usuário.
  await ctx.requireEmpresa(empresaId)
  const data = validarData(ctx.body.data)
  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')

  const locRef = numeroDaLoja(empresa)
  if (!locRef) {
    throw new HttpError(
      422,
      `A loja "${empresa.nome}" não tem número de loja no cadastro (vínculo BIAPI ou número no nome).`
    )
  }

  // O cadastro carrega enquanto a API do DW (bem mais lenta) responde.
  const formasVrPromise = carregarFormasOnlineVr()
  // Sem isto, um erro do banco antes da API terminar viraria "unhandled rejection".
  formasVrPromise.catch(() => {})

  const { baseUrl, token } = await ctx.credencial('apidw')
  const qs = new URLSearchParams({ loc_ref: locRef, start_date: data, end_date: data })
  let r: Response
  try {
    r = await fetch(`${baseUrl.replace(/\/+$/, '')}/Delivery/?${qs}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_DW_MS),
    })
  } catch (e) {
    if (ehTimeout(e)) {
      throw new HttpError(504, 'A API de delivery do DW demorou demais para responder.')
    }
    // O `fetch` só lança sem resposta: DNS, conexão recusada, rede.
    console.error('[fechamento-ifood-diario] API de delivery do DW:', e)
    throw new HttpError(503, 'Não conseguimos conectar à API de delivery do DW.')
  }
  if (r.status === 502 || r.status === 503 || r.status === 504) {
    throw new HttpError(503, `A API de delivery do DW está fora do ar (respondeu ${r.status}).`)
  }
  if (!r.ok) {
    await registrarDetalheDoErro(r)
    throw new HttpError(502, `A API de delivery do DW respondeu ${r.status}.`)
  }
  const json = (await r.json()) as unknown
  // Como no legado: lista na raiz, ou em `results`, `data` ou `orders`.
  const raiz = obj(json)
  const linhas = Array.isArray(json)
    ? json
    : (raiz && [raiz.results, raiz.data, raiz.orders].find(Array.isArray)) || null
  // 200 sem a lista é falha, não "zero pedidos".
  if (!linhas) throw new HttpError(502, 'A API de delivery do DW devolveu um formato inesperado.')

  const pedidos = (linhas as unknown[])
    .map(obj)
    .filter((l): l is Json => l !== null)
    .filter((l) =>
      CANAIS_IFOOD.has(normalizarOrigem(texto(l.origem) ?? texto(l.channel) ?? 'iFood'))
    )
    .map((l) => doDw(l, `Loja ${locRef}`, data))

  return { pedidos, formasVr: await formasVrPromise }
})

export const config = {
  integracoes: ['apidw'],
  secrets: ['GIA_SERVER_DATABASE_URL'],
}
