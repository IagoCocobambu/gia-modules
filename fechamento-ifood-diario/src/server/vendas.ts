import { defineHandler, envOptional, HttpError } from '@gia-cb/sdk/server'

// UMA página (20 vendas, fixo) das vendas do dia de UM restaurante da loja na API
// financeira do iFood (`financial/v3.0/merchants/{id}/sales`) — a `BuscarVendasIfood`
// do legado, quebrada em páginas para a tela buscar várias ao mesmo tempo (até 4, como
// o Fechamento iFood Mensal) e mostrar o progresso. Cada venda volta só com os campos
// que o cruzamento usa (a `MergeIfoodData` do legado), já extraídos.
//
// A loja (Empresa) tem um restaurante no iFood por operação (Coco Bambu, Express,
// Pizzaria, Dani, Vasto…), no cadastro do portal (vínculos IFOOD das operações); a tela
// pede as páginas de cada um. O restaurante chega no body, mas só vale se for da loja —
// o servidor confere nos vínculos das operações da Empresa.
// Falha do iFood não derruba o fechamento (como no legado): o que é definitivo
// (credencial, 401/403) volta como `aviso`; o que é passageiro (5xx, demora) volta como
// erro, e a tela tenta de novo.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  empresaId: number
  data: string
  /** UUID do restaurante no iFood — um dos da loja (conferido aqui). */
  merchant: string
  pagina: number
}

/**
 * Uma página leva 0,4–4 s; acima de 20 s é conexão travada (visto em dev: ETIMEDOUT ao
 * conectar no iFood, ~47 s até desistir). Melhor desistir cedo: a tela tenta de novo.
 */
const TIMEOUT_IFOOD_MS = 20_000
/** Proteção contra laço: um dia de uma loja nunca chega perto disto. */
const MAX_PAGINAS_IFOOD = 200
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
 * Restaurantes do iFood da loja: os vínculos IFOOD ativos de todas as operações da
 * Empresa (cb, cbx, pzcb, dani, vst, adgcb…), do cadastro do portal. Uma operação pode
 * ter mais de um vínculo IFOOD. `locRef` = UUID do restaurante (merchant) no iFood.
 * A MESMA função está em `lojas.ts` (handler auto-contido): mude as duas.
 */
function restaurantesDaLoja(
  operacoes: { ref: string; empresaId: number; integracoes: { tipo: string; locRef: string }[] }[],
  empresaId: number
): { operacao: string; merchant: string }[] {
  const vistos = new Set<string>()
  return operacoes
    .filter((o) => o.empresaId === empresaId)
    .flatMap((o) =>
      (o.integracoes ?? [])
        .filter((i) => i.tipo === 'IFOOD' && i.locRef?.trim())
        .map((i) => ({ operacao: o.ref, merchant: i.locRef.trim().toLowerCase() }))
    )
    .filter((r) => !vistos.has(r.merchant) && Boolean(vistos.add(r.merchant)))
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

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(valores: number[]): number {
  return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
}

/** `true`/`false` do iFood como SIM/NÃO; texto como veio. */
function simNao(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'SIM' : 'NÃO'
  return texto(v) ?? ''
}

/** O que a venda do iFood traz para o pedido do DW — a `MergeIfoodData` do legado. */
interface VendaIfood {
  shortId: string
  /** Restaurante do iFood em que a venda está (UUID). */
  merchant: string
  /** `createdAt` da venda (UTC): desempata o mesmo código em dois restaurantes. */
  criadoEm: string
  /** `merchant.shortId` (vira o ID DO RESTAURANTE); `null` sem merchant na venda. */
  idLoja: string | null
  totalParceiro: number
  confirmado: 'SIM' | 'NÃO'
  tipoPedido: string
  canal: string
  dataCancelamento: string
  origemCancelamento: string
  motivoCancelamento: string
  cancelamentoContestavel: string
  motivoImpossibilidade: string
  dataLimiteContestacao: string
  cancelamentoParcial: 'SIM' | 'NÃO'
}

/** Extrai da venda os campos do cruzamento, com as mesmas regras da `MergeIfoodData`. */
function extrair(venda: Json, merchantId: string): VendaIfood | null {
  const shortId = texto(venda.shortId)
  if (!shortId) return null
  const merchant = obj(venda.merchant)
  const status = texto(venda.currentStatus) ?? ''
  const v: VendaIfood = {
    shortId,
    merchant: merchantId,
    criadoEm: texto(venda.createdAt) ?? '',
    idLoja: merchant ? String(Math.trunc(numero(merchant.shortId) ?? 0)) : null,
    totalParceiro: somar(
      lista(obj(venda.payments)?.methods).map((m) => numero(obj(m)?.value) ?? 0)
    ),
    confirmado: status === 'CONCLUDED' ? 'SIM' : 'NÃO',
    tipoPedido: texto(venda.type) ?? '',
    canal: texto(venda.salesChannel) ?? '',
    dataCancelamento: '',
    origemCancelamento: '',
    motivoCancelamento: '',
    cancelamentoContestavel: '',
    motivoImpossibilidade: '',
    dataLimiteContestacao: '',
    cancelamentoParcial: 'NÃO',
  }
  for (const item of lista(venda.orderStatusHistory)) {
    const h = obj(item)
    if (!h) continue
    const valor = texto(h.value)
    if (valor === 'PARTIAL_CANCELLATION_ORDER') v.cancelamentoParcial = 'SIM'
    if (status === 'CANCELLED' && valor === 'CANCELLED') {
      v.dataCancelamento = texto(h.createdAt) ?? ''
      const meta = obj(h.metadata)
      if (meta) {
        v.origemCancelamento = texto(meta.cancelOrigin) ?? ''
        v.motivoCancelamento = texto(meta.cancelCodeDescription) ?? ''
        const disputa = obj(meta.cancellationDispute)
        if (disputa) {
          v.cancelamentoContestavel = simNao(disputa.isContestable)
          if (Array.isArray(disputa.reasons)) {
            v.motivoImpossibilidade = disputa.reasons
              .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
              .join(', ')
          }
        }
      }
    }
  }
  // Data limite de contestação: 1º lançamento do evento financeiro FBOE.
  for (const item of lista(venda.orderEvents)) {
    const ev = obj(item)
    if (texto(ev?.fullCode) !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
    const entrada = obj(lista(obj(ev?.metadata)?.entries)[0])
    v.dataLimiteContestacao = texto(obj(entrada?.period)?.endDate) ?? ''
    break
  }
  return v
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
      console.error('[fechamento-ifood-diario] %s respondeu %d:', 'iFood', r.status, msg)
  } catch {
    // corpo não é JSON: nada a registrar
  }
}

/**
 * Mensagem para a recusa do iFood. 401 = token vencido ou inválido (quem renova é o
 * hub de Credenciais do portal; no `gia dev`, o script `npm run token:ifood`). 403 =
 * a loja não autorizou o aplicativo de vocês no Portal do Parceiro do iFood. 404 = o
 * restaurante não existe no iFood (identificador errado no cadastro).
 */
function recusaIfood(status: number): string | null {
  const dev = envOptional('GIA_DEV_CRED_IFOOD_TOKEN') !== undefined
  if (status === 401) {
    return dev
      ? 'O token do iFood venceu ou é inválido (401). Rode `npm run token:ifood` e reinicie o gia dev.'
      : 'O iFood recusou a credencial (401: token vencido ou inválido). Avise o administrador do portal (hub de Credenciais, integração ifood).'
  }
  if (status === 403) {
    return 'O iFood negou o acesso a este restaurante (403): ele não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood.'
  }
  // Restaurante que não existe no iFood (ex.: identificador com um caractere a menos no
  // cadastro da operação): definitivo, então aviso — tentar de novo só atrasa a tela.
  if (status === 404) {
    return 'O iFood não encontrou este restaurante (404): o identificador dele no cadastro da operação pode estar errado. Avise o time do Portal GIA.'
  }
  return null
}

function ehTimeout(e: unknown): boolean {
  return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
}

/** Espera `ms` milissegundos. */
function esperar(ms: number): Promise<void> {
  return new Promise((ok) => setTimeout(ok, ms))
}

/**
 * GET na API do iFood. No 429 (limite de requisições) espera o `Retry-After` — ou
 * 1,5 s, 3 s, 6 s — e tenta de novo, até 3 vezes.
 */
async function getIfood(url: string, token: string): Promise<Response> {
  for (let tentativa = 0; ; tentativa++) {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_IFOOD_MS),
    })
    if (r.status !== 429 || tentativa >= 3) return r
    const retry = Number(r.headers.get('retry-after'))
    await esperar(Number.isFinite(retry) && retry > 0 ? retry * 1000 : 1500 * 2 ** tentativa)
  }
}

/** Restaurantes da conta do iFood (id → nome) — mudam pouco: 30 min por instância. */
let cacheNomes: { em: number; nomes: Map<string, string> } | null = null
const CACHE_NOMES_MS = 30 * 60_000

/**
 * Nome do restaurante no iFood, para a coluna "Restaurante no iFood". Só informativo:
 * se a lista da conta falhar, volta `null` (a tela mostra a operação), sem aviso.
 */
async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string | null> {
  try {
    if (!cacheNomes || Date.now() - cacheNomes.em > CACHE_NOMES_MS) {
      const nomes = new Map<string, string>()
      for (let p = 1; p <= 20; p++) {
        const r = await fetch(`${base}/merchant/v1.0/merchants?page=${p}&size=100`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_IFOOD_MS),
        })
        if (r.status === 204) break
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const itens = lista(await r.json())
        for (const i of itens) {
          const m = obj(i)
          const mid = m && texto(m.id)
          if (m && mid) nomes.set(mid.toLowerCase(), texto(m.name) ?? mid)
        }
        if (itens.length < 100) break
      }
      cacheNomes = { em: Date.now(), nomes }
    }
    return cacheNomes.nomes.get(id) ?? null
  } catch (e) {
    console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
    return null
  }
}

interface Resposta {
  vendas: VendaIfood[]
  /** Nome do restaurante no iFood (só na página 1; `null` se a lista falhar). */
  restaurante: string | null
  /** Páginas do dia (a página 1 é que diz); 0 = sem vendas ou sem consulta. */
  totalPaginas: number
  /** Problema definitivo da parte do iFood (sem integração, credencial, 401/403). */
  aviso: string | null
}

function lerCorpo(bruto: string): Json | null {
  try {
    return obj(JSON.parse(bruto))
  } catch {
    return null
  }
}

/** Vendas da página que vieram sem os pagamentos (a resposta "leve" do iFood). */
function vendasLeves(corpo: Json): number {
  return lista(corpo.sales)
    .map(obj)
    .filter((v) => lista(obj(v?.payments)?.methods).length === 0).length
}

const vazio = (aviso: string | null, restaurante: string | null = null): Resposta => ({
  vendas: [],
  restaurante,
  totalPaginas: 0,
  aviso,
})

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
  // 403 se a Empresa está fora do escopo do usuário.
  await ctx.requireEmpresa(empresaId)
  const data = validarData(ctx.body.data)
  const pagina = Number(ctx.body.pagina)
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > MAX_PAGINAS_IFOOD) {
    throw new HttpError(422, 'Página inválida.')
  }
  // O restaurante do body só vale se for um dos vínculos IFOOD das operações da loja.
  const merchantId =
    typeof ctx.body.merchant === 'string' ? ctx.body.merchant.trim().toLowerCase() : ''
  const daLoja = restaurantesDaLoja(await ctx.operacoes(), empresaId)
  if (!merchantId || !daLoja.some((r) => r.merchant === merchantId)) {
    throw new HttpError(422, 'Este restaurante do iFood não é desta loja.')
  }

  let cred: { baseUrl: string; token: string }
  try {
    cred = await ctx.credencial('ifood')
  } catch (e) {
    console.error('[fechamento-ifood-diario] credencial do iFood:', e)
    // A mensagem do hub fica só no log: pode trazer detalhe da integração.
    return vazio(
      'Não foi possível obter a credencial da API do iFood. Avise o administrador do portal (hub de Credenciais, integração ifood).'
    )
  }
  const base = cred.baseUrl.replace(/\/+$/, '')
  const qs = new URLSearchParams({
    beginSalesDate: data,
    endSalesDate: data,
    page: String(pagina),
  })
  const url = `${base}/financial/v3.0/merchants/${encodeURIComponent(merchantId)}/sales?${qs}`
  const pedir = () =>
    getIfood(url, cred.token).catch((e: unknown) => {
      console.error('[fechamento-ifood-diario] API do iFood:', e)
      // O `fetch` só lança sem resposta: tempo esgotado (504) ou não conectou (503).
      throw new HttpError(
        ehTimeout(e) ? 504 : 503,
        ehTimeout(e)
          ? `A API do iFood demorou demais para responder (página ${pagina}).`
          : `Não conseguimos conectar à API do iFood (página ${pagina}).`
      )
    })
  // O nome do restaurante só na página 1 (lista da conta em cache), junto com ela.
  const nomePromise =
    pagina === 1 ? nomeDoRestaurante(base, cred.token, merchantId) : Promise.resolve(null)
  const r = await pedir()
  const restaurante = await nomePromise
  // 204 = restaurante sem vendas no dia.
  if (r.status === 204) return vazio(null, restaurante)
  if (!r.ok) {
    const recusa = recusaIfood(r.status)
    if (recusa) return vazio(recusa, restaurante)
    if (r.status === 502 || r.status === 503 || r.status === 504) {
      throw new HttpError(
        503,
        `A API do iFood está fora do ar (respondeu ${r.status}, página ${pagina}).`
      )
    }
    await registrarDetalheDoErro(r)
    throw new HttpError(502, `A API do iFood respondeu ${r.status} (página ${pagina}).`)
  }
  const bruto = await r.text()
  if (!bruto.trim()) return vazio(null, restaurante)
  let corpo = lerCorpo(bruto)
  // O iFood às vezes devolve a página "leve": vendas sem pagamentos nem eventos
  // financeiros, todas ou parte delas (medido em 10/11/2026: 2 de 6 pedidos seguidos da
  // mesma página). O status vem igual — os valores do fechamento não mudam —, mas Total
  // do parceiro e Data limite de contestação sairiam vazios. Pede de novo, até 2 vezes,
  // e fica com a resposta mais completa.
  for (let tentativa = 0; tentativa < 2 && corpo && vendasLeves(corpo) > 0; tentativa++) {
    try {
      const r2 = await pedir()
      if (!r2.ok) break
      const outro = lerCorpo(await r2.text())
      if (outro && vendasLeves(outro) < vendasLeves(corpo)) corpo = outro
    } catch {
      break
    }
  }
  if (!corpo) {
    throw new HttpError(502, `A API do iFood devolveu um formato inesperado (página ${pagina}).`)
  }
  const vendas = lista(corpo.sales)
    .map(obj)
    .filter((v): v is Json => v !== null)
    .map((v) => extrair(v, merchantId))
    .filter((v): v is VendaIfood => v !== null)
  return {
    vendas,
    restaurante,
    totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)),
    aviso: null,
  }
})

export const config = {
  integracoes: ['ifood'],
  secrets: [],
}
