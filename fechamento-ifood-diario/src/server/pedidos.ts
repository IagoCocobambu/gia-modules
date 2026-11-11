import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Pedidos de delivery de UMA operação num dia, da API do DW (`/Delivery/`) — a 1ª
// metade da `BuscarFechamento` do legado (`MapApiItemToTransaction`) — e a lista de
// formas "ONLINE VR" do cadastro `gia_relatorios.formas_pagamento` do Maestro (só
// leitura). O cruzamento com o iFood e as contas são feitos na tela, que busca as
// vendas do iFood em paralelo (handler `vendas`) e mostra o progresso.
//
// O DW junta as operações do mesmo número (ex.: `08 cb` e `08 vst`); aqui ficam só os
// pedidos do canal da operação — "iFood" na principal, "iFood Vasto" no Vasto — ANTES
// do cruzamento, porque o shortId do iFood (4 dígitos) de um restaurante pode coincidir
// com o n_parceiro de um pedido do outro.
//
// A loja chega como `operacaoRef` (exceção deste módulo: busca por OPERAÇÃO), validada
// com `requireOperacao`. O `loc_ref` do DW é o número do `operacao_ref`.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. Validação de data,
// tabela das operações Vasto e `normalizarOrigem` se repetem em `vendas.ts` e em
// `src/regras.ts` de propósito.

interface Body {
  operacaoRef: string
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
 * Operações que dividem o número de loja com outra e têm canal e merchant próprios no
 * iFood. O DW devolve as duas juntas no mesmo `loc_ref` e as separa pela `origem` do
 * pedido: "iFood" é a operação principal, "iFood Vasto" a do Vasto. O SDK não tem
 * vínculo iFood por operação (só por Empresa, um por Empresa), então o merchant destas
 * fica aqui — PROVISÓRIO até o SDK expor `locRefs` em `GiaOperacao`. Operação nova
 * nessa situação precisa entrar nesta tabela (e na de lojas.ts).
 * Merchants: lista `GET /merchant/v1.0/merchants` da conta iFood da Coco Bambu.
 */
const OPERACOES_IFOOD_PROPRIO: Record<string, { canal: string; merchant: string }> = {
  '08 vst': { canal: 'iFood Vasto', merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
  '17 vst': { canal: 'iFood Vasto', merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
  '25 vst': { canal: 'iFood Vasto', merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
  '69 vst': { canal: 'iFood Vasto', merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
  '86 vst': { canal: 'iFood Vasto', merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
}

/** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
function chaveOperacao(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Número da loja com 2 dígitos — o `loc_ref` da API do DW ("54 cb" → "54"). */
function numeroDaOperacao(ref: string): string | null {
  const m = /^\s*(\d{1,4})/.exec(ref)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

type Json = Record<string, unknown>

function obj(v: unknown): Json | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null
}

function lista(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
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
    throw new HttpError(
      502,
      'Não foi possível ler o cadastro de formas de pagamento do Maestro. Tente de novo.'
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
  }
}

type PedidoDw = ReturnType<typeof doDw>

/** Restaurante do iFood (merchant) da operação, como nas vendas. */
interface MerchantDaConta {
  id: string
  name: string
  corporateName: string
}

/** Restaurantes da conta do iFood — mudam pouco: guardados 30 min por instância. */
let cacheMerchants: { em: number; lista: MerchantDaConta[] } | null = null
const CACHE_MERCHANTS_MS = 30 * 60_000

async function merchantsDaConta(base: string, token: string): Promise<MerchantDaConta[]> {
  if (cacheMerchants && Date.now() - cacheMerchants.em < CACHE_MERCHANTS_MS) {
    return cacheMerchants.lista
  }
  const todos: MerchantDaConta[] = []
  for (let pagina = 1; pagina <= 20; pagina++) {
    const r = await fetch(`${base}/merchant/v1.0/merchants?page=${pagina}&size=100`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (r.status === 204) break
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const itens = lista(await r.json())
    for (const i of itens) {
      const m = obj(i)
      const id = m && texto(m.id)
      if (m && id) {
        todos.push({ id, name: texto(m.name) ?? id, corporateName: texto(m.corporateName) ?? '' })
      }
    }
    if (itens.length < 100) break
  }
  cacheMerchants = { em: Date.now(), lista: todos }
  return todos
}

/**
 * Nome do restaurante no iFood, para a coluna "Restaurante no iFood". Só informativo:
 * se a lista da conta falhar, vai um nome genérico, sem aviso. Fica aqui (e não nas
 * vendas) porque a chamada ao DW é mais lenta: o nome sai sem atrasar o progresso.
 */
async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string> {
  try {
    return (await merchantsDaConta(base, token)).find((m) => m.id === id)?.name ?? 'iFood'
  } catch (e) {
    console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
    return 'iFood'
  }
}

interface Resposta {
  /** Pedidos do canal da operação, no formato do legado, antes do cruzamento. */
  pedidos: PedidoDw[]
  /** Formas "ONLINE VR" do cadastro, da descrição mais longa para a mais curta. */
  formasVr: FormaOnlineVr[]
  /** Operação com canal próprio (Vasto na loja do CB): não filtra o canal do iFood. */
  canalProprio: boolean
  /** Nome do restaurante da operação no iFood; `null` sem integração ou sem a lista. */
  restaurante: string | null
}

/** Mensagem que a API devolve no corpo de um erro, se houver. */
async function detalheDoErro(r: Response): Promise<string> {
  try {
    const corpo = (await r.json()) as { detail?: unknown; message?: unknown }
    const msg = corpo.detail ?? corpo.message
    return typeof msg === 'string' ? ` ${msg}` : ''
  } catch {
    return ''
  }
}

function ehTimeout(e: unknown): boolean {
  return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  const ref = typeof ctx.body.operacaoRef === 'string' ? ctx.body.operacaoRef.trim() : ''
  if (!ref) throw new HttpError(422, 'Informe a loja.')
  // 403 se a operação está fora do escopo do usuário.
  const operacao = await ctx.requireOperacao(ref)
  const data = validarData(ctx.body.data)

  const locRef = numeroDaOperacao(operacao.ref)
  if (!locRef) {
    throw new HttpError(
      422,
      `A operação "${operacao.nome}" não tem número de loja no código (${operacao.ref}).`
    )
  }
  const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
  const canal = normalizarOrigem(propria?.canal ?? 'iFood')

  // O cadastro e o nome do restaurante carregam enquanto a API do DW (bem mais lenta)
  // responde. O restaurante é o da tabela (Vasto na loja do CB) ou o da Empresa.
  const formasVrPromise = carregarFormasOnlineVr()
  const restaurantePromise = (async (): Promise<string | null> => {
    const empresa = propria
      ? undefined
      : (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
    const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
    if (!merchantId) return null
    try {
      const cred = await ctx.credencial('ifood')
      return await nomeDoRestaurante(cred.baseUrl.replace(/\/+$/, ''), cred.token, merchantId)
    } catch {
      return null
    }
  })()
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
    throw e
  }
  if (!r.ok) {
    throw new HttpError(
      502,
      `A API de delivery do DW respondeu ${r.status}.${await detalheDoErro(r)}`
    )
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
    .filter((l) => normalizarOrigem(texto(l.origem) ?? texto(l.channel) ?? 'iFood') === canal)
    .map((l) => doDw(l, `Loja ${locRef}`, data))

  const [formasVr, restaurante] = await Promise.all([formasVrPromise, restaurantePromise])
  return { pedidos, formasVr, canalProprio: propria !== undefined, restaurante }
})

export const config = {
  integracoes: ['apidw', 'ifood'],
  secrets: ['GIA_SERVER_DATABASE_URL'],
}
