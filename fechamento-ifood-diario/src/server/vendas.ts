import { defineHandler, envOptional, HttpError } from '@gia-cb/sdk/server'

// UMA página (20 vendas, fixo) das vendas do dia do restaurante da operação na API
// financeira do iFood (`financial/v3.0/merchants/{id}/sales`) — a `BuscarVendasIfood`
// do legado, quebrada em páginas para a tela buscar várias ao mesmo tempo (até 4, como
// o Fechamento iFood Mensal) e mostrar o progresso. Cada venda volta só com os campos
// que o cruzamento usa (a `MergeIfoodData` do legado), já extraídos.
//
// O restaurante é o da Empresa dona da operação (`locRefs.IFOOD`), menos nas operações
// com canal próprio (Vasto na loja do CB), que estão na tabela abaixo. Falha do iFood
// não derruba o fechamento (como no legado): o que é definitivo (sem integração,
// credencial, 401/403) volta como `aviso`; o que é passageiro (5xx, demora) volta como
// erro, e a tela tenta de novo.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  operacaoRef: string
  data: string
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
function extrair(venda: Json): VendaIfood | null {
  const shortId = texto(venda.shortId)
  if (!shortId) return null
  const merchant = obj(venda.merchant)
  const status = texto(venda.currentStatus) ?? ''
  const v: VendaIfood = {
    shortId,
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

/**
 * Mensagem para a recusa do iFood. 401 = token vencido ou inválido (quem renova é o
 * hub de Credenciais do portal; no `gia dev`, o script `npm run token:ifood`). 403 =
 * a loja não autorizou o aplicativo de vocês no Portal do Parceiro do iFood.
 */
function recusaIfood(status: number): string | null {
  const dev = envOptional('GIA_DEV_CRED_IFOOD_TOKEN') !== undefined
  if (status === 401) {
    return dev
      ? 'O token do iFood venceu ou é inválido (401). Rode `npm run token:ifood` e reinicie o gia dev.'
      : 'O iFood recusou a credencial (401: token vencido ou inválido). Avise o administrador do portal (hub de Credenciais, integração ifood).'
  }
  if (status === 403) {
    return 'O iFood negou o acesso a esta loja (403): ela não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood.'
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

interface Resposta {
  vendas: VendaIfood[]
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

const vazio = (aviso: string | null): Resposta => ({
  vendas: [],
  totalPaginas: 0,
  aviso,
})

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  const ref = typeof ctx.body.operacaoRef === 'string' ? ctx.body.operacaoRef.trim() : ''
  if (!ref) throw new HttpError(422, 'Informe a loja.')
  // 403 se a operação está fora do escopo do usuário.
  const operacao = await ctx.requireOperacao(ref)
  const data = validarData(ctx.body.data)
  const pagina = Number(ctx.body.pagina)
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > MAX_PAGINAS_IFOOD) {
    throw new HttpError(422, 'Página inválida.')
  }

  // Operação com canal próprio: o restaurante da tabela; as demais, o da Empresa.
  const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
  const empresa = propria
    ? undefined
    : (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
  const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
  if (!merchantId) {
    return vazio(
      'A Empresa desta operação não tem a integração com o iFood no cadastro: os pedidos não foram cruzados com o iFood e contam como Cancelado.'
    )
  }

  let cred: { baseUrl: string; token: string }
  try {
    cred = await ctx.credencial('ifood')
  } catch (e) {
    console.error('[fechamento-ifood-diario] credencial do iFood:', e)
    return vazio(
      `Não foi possível obter a credencial da API do iFood${e instanceof Error ? `: ${e.message}` : '.'}`
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
      throw new HttpError(
        ehTimeout(e) ? 504 : 502,
        ehTimeout(e)
          ? `A API do iFood demorou demais para responder (página ${pagina}).`
          : `Não foi possível falar com a API do iFood (página ${pagina}).`
      )
    })
  const r = await pedir()
  // 204 = restaurante sem vendas no dia.
  if (r.status === 204) return vazio(null)
  if (!r.ok) {
    const recusa = recusaIfood(r.status)
    if (recusa) return vazio(recusa)
    throw new HttpError(
      502,
      `A API do iFood respondeu ${r.status} (página ${pagina}).${await detalheDoErro(r)}`
    )
  }
  const bruto = await r.text()
  if (!bruto.trim()) return vazio(null)
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
    .map(extrair)
    .filter((v): v is VendaIfood => v !== null)
  return {
    vendas,
    totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)),
    aviso: null,
  }
})

export const config = {
  integracoes: ['ifood'],
  secrets: [],
}
