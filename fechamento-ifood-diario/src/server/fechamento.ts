import { defineHandler, envOptional, HttpError, sql } from '@gia-cb/sdk/server'

// Fechamento iFood de UMA loja num dia — a `BuscarFechamento` do legado
// (`model.ifood.fechamentoDiario.pas`) mais as contas do `App.tsx` do front antigo:
//
// 1. pedidos de delivery da loja no dia, da API do DW (`/Delivery/`);
// 2. vendas do dia na API financeira do iFood (`financial/v3.0/merchants/{id}/sales`),
//    paginadas; o merchant vem da Empresa dona da operação (`locRefs.IFOOD`);
// 3. cruza as duas pelo `n_parceiro` do DW = `shortId` do iFood (`MergeIfoodData`);
// 4. classifica cada forma de pagamento (ONLINE / ONLINE VR / OFFLINE) com o cadastro
//    `gia_relatorios.formas_pagamento` do Maestro — só leitura;
// 5. calcula as colunas do legado (Total, Desconto copart, iFood reembolsa?, Cancelamento)
//    e devolve só os pedidos do canal iFood (a tela do legado só mostra esses).
//
// A loja chega como `operacaoRef` (exceção deste módulo: a busca é por OPERAÇÃO, não
// por Empresa), validado com `requireOperacao`. O `loc_ref` do DW é o número do
// `operacao_ref` e o merchant vem da Empresa da operação — o body não escolhe nenhum.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaOperacao` e
// `normalizarOrigem` se repetem em outros arquivos de propósito.

interface Body {
  operacaoRef: string
  data: string
}

type TipoPagamento = 'ONLINE' | 'ONLINE VR' | 'OFFLINE' | 'SEM_CLASSIFICACAO'

interface Pagamento {
  /** Texto antes do `(valor)`, como veio da API. */
  descricao: string
  /** `null` quando o trecho não traz o valor entre parênteses. */
  valor: number | null
  tipo: TipoPagamento
}

interface PedidoIfood {
  id: string
  n_pedido: string
  n_parceiro: string
  /** Dia pesquisado (`YYYY-MM-DD`) — a coluna DATA do legado. */
  data_calc: string
  data_de_criacao: string
  /** Canal de venda: o `salesChannel` do iFood quando o pedido foi achado lá. */
  origem: string
  valor_do_pedido: number
  valor_da_entrega: number
  /** TOTAL DO PEDIDO do legado: entrega + itens − incentivo da loja. */
  total_pago: number
  /** Total pago que veio do DW (o legado troca pelo calculado). */
  total_pago_dw: number
  desconto_total: number
  forma_de_pagamentos: string
  nome_loja: string
  id_loja: string
  agendado: string
  incentivo_parceiro: number
  incentivo_loja: number
  taxa_extra_parceiro: number
  // Do iFood (vazios quando o pedido não foi achado na API do iFood)
  confirmado_por: string
  total_parceiro: number
  tipo_pedido: string
  data_cancelamento: string
  origem_cancelamento: string
  motivo_cancelamento: string
  cancelamento_contestavel: string
  motivo_impossibilidade: string
  data_limite_contestacao: string
  cancelamento_parcial: string
  // Calculados (regra do legado)
  ifood_reembolsa: 'N/A' | 'SIM' | 'NÃO' | 'VERIFICAR'
  /** Incentivo do iFood − taxa de serviço. */
  desconto_copart: number
  /** CANCELAMENTO do legado: OK = sem origem de cancelamento e confirmado (CONCLUDED). */
  venda_concluida: 'OK' | 'Cancelado'
  /** Tipos das formas de pagamento, sem repetir, na ordem em que aparecem. */
  tipos: TipoPagamento[]
  pagamentos: Pagamento[]
  total_pago_online: number
  total_pago_adquirentes: number
  total_pago_offline: number
  /** Trechos de pagamento sem classificação (vazios ou DESCONHECIDO). */
  qtd_sem_classificacao: number
  valor_sem_classificacao: number
  formas_sem_classificacao: string[]
  /** O pedido do DW foi achado na API financeira do iFood. */
  encontrado_no_ifood: boolean
  /** Restaurante do iFood (merchant) em que o pedido foi achado. */
  merchant_ifood: string
}

interface Resposta {
  pedidos: PedidoIfood[]
  /** Avisos sobre a parte do iFood (cadastro, credencial, resposta da API). */
  avisos: string[]
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO_DW = 'apidw'
/** Id da integração da Merchant API do iFood no hub de Credenciais. */
const INTEGRACAO_IFOOD = 'ifood'
/** Mesmo teto do Fechamento Maestro (90 s); acima disso a borda da API do DW devolve 524. */
const TIMEOUT_DW_MS = 90_000
const TIMEOUT_IFOOD_MS = 60_000
/** Proteção contra laço: um dia de uma loja nunca chega perto disto. */
const MAX_PAGINAS_IFOOD = 200
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

/** Sufixo que a API põe nas formas pagas antes, no app ou no parceiro. */
const PRE_PAGO = /\s*-\s*PRE\s+PAGO\s*$/i
/** Cartão mascarado (`**** 1234 - Amex` → `Amex`) — a `trimPaymentDescription` do legado. */
const CARTAO_MASCARADO = /\*\*\*\*\s\d{4}\s-\s/

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

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(valores: number[]): number {
  return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
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

/**
 * Tipo de um trecho de pagamento — a `classifyPaymentSegment` do legado, nesta ordem:
 * 1. vazio ou `DESCONHECIDO` → SEM_CLASSIFICACAO;
 * 2. contém (sem o " - PRE PAGO") uma forma "ONLINE VR" do cadastro, da mesma origem
 *    do pedido ou sem origem → ONLINE VR;
 * 3. termina em " - PRE PAGO" → ONLINE;
 * 4. qualquer outro → OFFLINE.
 */
function classificar(
  descricao: string,
  origemPedido: string,
  formasVr: FormaOnlineVr[]
): TipoPagamento {
  const bruto = descricao.trim()
  const semCartao = bruto.replace(CARTAO_MASCARADO, '').trim().toUpperCase()
  if (semCartao === '' || semCartao === 'DESCONHECIDO') return 'SEM_CLASSIFICACAO'
  const semPrePago = semCartao.replace(PRE_PAGO, '').trim()
  const vr = formasVr.some(
    (f) => (f.origem === '' || f.origem === origemPedido) && semPrePago.includes(f.descricao)
  )
  if (vr) return 'ONLINE VR'
  return PRE_PAGO.test(bruto) ? 'ONLINE' : 'OFFLINE'
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

/** `true`/`false` do iFood como SIM/NÃO; texto como veio. */
function simNao(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'SIM' : 'NÃO'
  return texto(v) ?? ''
}

/** Campos que a venda do iFood traz para o pedido — a `MergeIfoodData` do legado. */
function cruzar(p: PedidoDw, venda: Json): void {
  p.encontrado_no_ifood = true

  const merchant = obj(venda.merchant)
  if (merchant) p.id_loja = String(Math.trunc(numero(merchant.shortId) ?? 0))

  const metodos = lista(obj(venda.payments)?.methods)
  p.total_parceiro = somar(metodos.map((m) => numero(obj(m)?.value) ?? 0))

  const status = texto(venda.currentStatus) ?? ''
  p.confirmado_por = status === 'CONCLUDED' ? 'SIM' : 'NÃO'
  p.tipo_pedido = texto(venda.type) ?? ''
  p.origem = texto(venda.salesChannel) ?? ''

  let parcial = false
  for (const item of lista(venda.orderStatusHistory)) {
    const h = obj(item)
    if (!h) continue
    const valor = texto(h.value)
    if (valor === 'PARTIAL_CANCELLATION_ORDER') parcial = true
    if (status === 'CANCELLED' && valor === 'CANCELLED') {
      p.data_cancelamento = texto(h.createdAt) ?? ''
      const meta = obj(h.metadata)
      if (meta) {
        p.origem_cancelamento = texto(meta.cancelOrigin) ?? ''
        p.motivo_cancelamento = texto(meta.cancelCodeDescription) ?? ''
        const disputa = obj(meta.cancellationDispute)
        if (disputa) {
          p.cancelamento_contestavel = simNao(disputa.isContestable)
          if (Array.isArray(disputa.reasons)) {
            p.motivo_impossibilidade = disputa.reasons
              .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
              .join(', ')
          }
        }
      }
    }
  }
  p.cancelamento_parcial = parcial ? 'SIM' : 'NÃO'

  // Data limite de contestação: 1º lançamento do evento financeiro FBOE.
  for (const item of lista(venda.orderEvents)) {
    const ev = obj(item)
    if (texto(ev?.fullCode) !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
    const entrada = obj(lista(obj(ev?.metadata)?.entries)[0])
    p.data_limite_contestacao = texto(obj(entrada?.period)?.endDate) ?? ''
    break
  }
}

/** `forma_de_pagamentos` → trechos, como o legado: separa em toda vírgula ou ponto e vírgula. */
function separarPagamentos(bruto: string): { descricao: string; valor: number | null }[] {
  return bruto
    .split(/[,;]/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => {
      const m = /^(.*?)\s*\(([\d.,]+)\)$/.exec(parte)
      return m
        ? { descricao: m[1].trim(), valor: parseFloat(m[2].replace(',', '.')) }
        : { descricao: parte, valor: null }
    })
}

/** As contas do `App.tsx` do legado (`enrichedTransactions` + parte do `calculateSummary`). */
function calcular(p: PedidoDw, formasVr: FormaOnlineVr[]): PedidoIfood {
  const origemChave = normalizarOrigem(p.origem)
  const trechosBrutos = p.forma_de_pagamentos ? p.forma_de_pagamentos.split(/[,;]/).length : 0
  const pagamentos: Pagamento[] = separarPagamentos(p.forma_de_pagamentos).map((t) => ({
    ...t,
    tipo: classificar(t.descricao, origemChave, formasVr),
  }))

  const total = somar([p.valor_da_entrega, p.valor_do_pedido, -p.incentivo_loja])
  // Trecho sem "(valor)": vale o total do pedido se for o único, senão zero (legado).
  // As colunas por grupo usavam o total do DW; o card "sem classificação", o calculado.
  const valorDe = (pg: Pagamento, totalSemValor: number) =>
    pg.valor ?? (trechosBrutos === 1 ? totalSemValor : 0)
  const doTipo = (tipo: TipoPagamento) =>
    somar(pagamentos.filter((pg) => pg.tipo === tipo).map((pg) => valorDe(pg, p.total_pago_dw)))
  const semClassificacao = pagamentos.filter((pg) => pg.tipo === 'SEM_CLASSIFICACAO')

  const incLoja = p.incentivo_loja
  const reembolsa =
    incLoja === 0 ? 'N/A' : incLoja === 12 ? 'SIM' : incLoja <= 10 ? 'NÃO' : 'VERIFICAR'
  const ok = p.origem_cancelamento.trim() === '' && p.confirmado_por.trim().toUpperCase() === 'SIM'

  return {
    ...p,
    total_pago: total,
    ifood_reembolsa: reembolsa,
    desconto_copart: somar([p.incentivo_parceiro, -p.taxa_extra_parceiro]),
    venda_concluida: ok ? 'OK' : 'Cancelado',
    tipos: [...new Set(pagamentos.map((pg) => pg.tipo))],
    pagamentos,
    total_pago_online: doTipo('ONLINE'),
    total_pago_adquirentes: doTipo('ONLINE VR'),
    total_pago_offline: doTipo('OFFLINE'),
    qtd_sem_classificacao: semClassificacao.length,
    valor_sem_classificacao: somar(semClassificacao.map((pg) => valorDe(pg, total))),
    formas_sem_classificacao: [
      ...new Set(
        semClassificacao
          .map((pg) => pg.descricao.replace(CARTAO_MASCARADO, '').trim() || pg.descricao.trim())
          .filter(Boolean)
      ),
    ],
  }
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

/** Restaurante do iFood (merchant) consultado. */
interface Merchant {
  id: string
  nome: string
}

/** Venda do iFood com o restaurante de onde veio. */
interface VendaIfood {
  venda: Json
  merchant: Merchant
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

/**
 * Uma página de vendas do dia de UM restaurante na API financeira do iFood (20 por
 * página, fixo). `null` = falhou (aviso registrado); 204 = dia sem vendas.
 */
async function paginaDeVendas(
  base: string,
  token: string,
  merchant: Merchant,
  data: string,
  pagina: number,
  avisos: string[]
): Promise<{ vendas: VendaIfood[]; totalPaginas: number } | null> {
  const qs = new URLSearchParams({ beginSalesDate: data, endSalesDate: data, page: String(pagina) })
  const onde = `${merchant.nome}, página ${pagina}`
  let r: Response
  try {
    r = await getIfood(
      `${base}/financial/v3.0/merchants/${encodeURIComponent(merchant.id)}/sales?${qs}`,
      token
    )
  } catch (e) {
    console.error('[fechamento-ifood-diario] API do iFood:', e)
    avisos.push(
      ehTimeout(e)
        ? `A API do iFood demorou demais para responder (${onde}).`
        : `Não foi possível falar com a API do iFood (${onde}).`
    )
    return null
  }
  if (r.status === 204) return { vendas: [], totalPaginas: 0 }
  if (!r.ok) {
    avisos.push(
      recusaIfood(r.status) ??
        `A API do iFood respondeu ${r.status} (${onde}).${await detalheDoErro(r)}`
    )
    return null
  }
  const bruto = await r.text()
  if (!bruto.trim()) return { vendas: [], totalPaginas: 0 }
  let corpo: Json | null
  try {
    corpo = obj(JSON.parse(bruto))
  } catch {
    corpo = null
  }
  if (!corpo) {
    avisos.push(`A API do iFood devolveu um formato inesperado (${onde}).`)
    return null
  }
  const vendas: VendaIfood[] = []
  for (const item of lista(corpo.sales)) {
    const venda = obj(item)
    if (venda && texto(venda.shortId)) vendas.push({ venda, merchant })
  }
  return { vendas, totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)) }
}

/**
 * Todas as vendas do dia de UM restaurante — a `BuscarVendasIfood` do legado. Falha
 * não derruba o fechamento (como no legado): volta o que já veio e um aviso.
 */
async function vendasIfood(
  base: string,
  token: string,
  merchant: Merchant,
  data: string,
  avisos: string[]
): Promise<VendaIfood[]> {
  const primeira = await paginaDeVendas(base, token, merchant, data, 1, avisos)
  if (!primeira) return []
  const vendas = [...primeira.vendas]
  // As demais páginas, 3 por vez (a página tem 20 vendas fixas; o limite de
  // requisições do iFood não aguenta todas de uma vez).
  const total = Math.min(primeira.totalPaginas, MAX_PAGINAS_IFOOD)
  for (let pagina = 2; pagina <= total; pagina += 3) {
    const lote = [pagina, pagina + 1, pagina + 2].filter((n) => n <= total)
    const pgs = await Promise.all(
      lote.map((n) => paginaDeVendas(base, token, merchant, data, n, avisos))
    )
    for (const pg of pgs) if (pg) vendas.push(...pg.vendas)
    if (pgs.some((pg) => !pg)) break
  }
  return vendas
}

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
    const r = await getIfood(`${base}/merchant/v1.0/merchants?page=${pagina}&size=100`, token)
    if (r.status === 204) break
    if (!r.ok) throw new Error(recusaIfood(r.status) ?? `HTTP ${r.status}`)
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
 * se a lista da conta falhar, vai um nome genérico, sem aviso.
 */
async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string> {
  try {
    return (await merchantsDaConta(base, token)).find((m) => m.id === id)?.name ?? 'iFood'
  } catch (e) {
    console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
    return 'iFood'
  }
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
  // Operação com canal próprio (Vasto na loja do CB): merchant e canal da tabela. As
  // demais: canal "iFood" e o merchant da Empresa dona da operação (regra do legado).
  const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
  const canal = normalizarOrigem(propria?.canal ?? 'iFood')
  const empresa = (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
  const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
  const avisos: string[] = []

  // O cadastro e o iFood carregam enquanto a API do DW (bem mais lenta) responde.
  const formasVrPromise = carregarFormasOnlineVr()
  // Só o restaurante da operação, como no legado (decisão de 2026-11-09): pedidos de
  // outras marcas da loja no iFood (Express, Pizzaria, Dani…) não são achados nele e
  // ficam como Cancelado — os números batem com a tela antiga.
  const ifoodPromise: Promise<VendaIfood[]> = (async () => {
    if (!merchantId) {
      avisos.push(
        'A Empresa desta operação não tem a integração com o iFood no cadastro: os pedidos não foram cruzados com o iFood e contam como Cancelado.'
      )
      return []
    }
    let cred: { baseUrl: string; token: string }
    try {
      cred = await ctx.credencial(INTEGRACAO_IFOOD)
    } catch (e) {
      console.error('[fechamento-ifood-diario] credencial do iFood:', e)
      avisos.push(
        `Não foi possível obter a credencial da API do iFood${e instanceof Error ? `: ${e.message}` : '.'}`
      )
      return []
    }
    const base = cred.baseUrl.replace(/\/+$/, '')
    const [nome, vendas] = await Promise.all([
      nomeDoRestaurante(base, cred.token, merchantId),
      vendasIfood(base, cred.token, { id: merchantId, nome: 'iFood' }, data, avisos),
    ])
    for (const v of vendas) v.merchant = { id: merchantId, nome }
    return vendas
  })()
  // Sem isto, um erro antes da API do DW terminar viraria "unhandled rejection".
  formasVrPromise.catch(() => {})
  ifoodPromise.catch(() => {})

  const { baseUrl, token } = await ctx.credencial(INTEGRACAO_DW)
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

  const doDia = (linhas as unknown[]).map(obj).filter((l): l is Json => l !== null)
  // Só os pedidos do canal da operação, ANTES de cruzar: o DW junta CB e Vasto no mesmo
  // nº de loja, e o shortId do iFood (4 dígitos) de um merchant pode coincidir com o
  // n_parceiro de um pedido do outro.
  const pedidosDw = doDia
    .filter((l) => normalizarOrigem(texto(l.origem) ?? texto(l.channel) ?? 'iFood') === canal)
    .map((l) => doDw(l, `Loja ${locRef}`, data))

  const [formasVr, vendasDoDia] = await Promise.all([formasVrPromise, ifoodPromise])
  // n_parceiro do DW = shortId do iFood (`MergeIfoodData`). O legado tirava a venda do
  // dicionário ao cruzar: dois pedidos com o mesmo n_parceiro, só o primeiro leva.
  const vendas = new Map<string, VendaIfood>()
  for (const v of vendasDoDia) {
    const k = texto(v.venda.shortId)
    if (k) vendas.set(k, v)
  }
  for (const p of pedidosDw) {
    const v = p.n_parceiro ? vendas.get(p.n_parceiro) : undefined
    if (!v) continue
    vendas.delete(p.n_parceiro)
    cruzar(p, v.venda)
    p.merchant_ifood = v.merchant.nome
  }

  // Operação principal, como no legado: o canal (do iFood, quando cruzado; senão o do
  // DW) tem que ser iFood — sai, por exemplo, o IFOOD_SHOP. Na operação com canal
  // próprio, o filtro de canal do DW acima já basta (o iFood devolve "IFOOD" nelas).
  const entra = (p: PedidoDw) =>
    propria !== undefined || normalizarOrigem(p.origem || 'Outros') === 'ifood'
  const pedidos = pedidosDw
    .filter(entra)
    .map((p) => calcular(p, formasVr))
    .sort((a, b) => a.data_de_criacao.localeCompare(b.data_de_criacao))

  return {
    pedidos,
    avisos,
  }
})

export const config = {
  integracoes: ['apidw', 'ifood'],
  secrets: ['GIA_SERVER_DATABASE_URL'],
}
