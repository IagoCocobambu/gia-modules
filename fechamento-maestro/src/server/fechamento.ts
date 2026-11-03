import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Fechamento dos pedidos de delivery do Maestro de UMA loja num período: lê os
// pedidos da API do DW (`/Delivery/`) e concilia os pagamentos de cada um.
// O tipo de cada forma de pagamento segue a regra do legado (`classificar`
// abaixo), com a lista de formas "ONLINE VR" lida do cadastro
// `gia_relatorios.formas_pagamento` do banco do Maestro — só leitura.
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
  data_de_acao: string | null
  n_parceiro: string | null
  n_conta: string | null
  /** CPF, e-mail, telefone, número e referência: mascarados sem `ver-dados-cliente`. */
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
  tipo_entrega: string | null
  nome_loja: string | null
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
  /** ONLINE VR pago antes (" - PRE PAGO"): vale no app ou no parceiro. */
  total_pago_adquirentes_online: number
  /** ONLINE VR sem " - PRE PAGO": vale passado na entrega (ex.: VR Refeição). */
  total_pago_adquirentes_offline: number
  total_pago_offline: number
  total_nao_classificado: number
  total_de_descontos: number
  /** Incentivo que vai para Descontos parceiro (regra do legado); 0 se não se aplica. */
  desconto_parceiro: number
  /** Quanto do `desconto_parceiro` sai do Online (só se o pedido tem parte ONLINE). */
  abatimento_online: number
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

/** Forma do cadastro do legado com tipo "ONLINE VR" (o grupo Adquirentes). */
interface FormaOnlineVr {
  /** Trecho em maiúsculas procurado dentro da forma de pagamento. */
  descricao: string
  /** Chave da origem (`normalizarOrigem`); vazia = vale para todas. */
  origem: string
}

/** Sufixo que a API põe nas formas pagas antes, no app ou no parceiro. */
const PRE_PAGO = /\s*-\s*PRE\s+PAGO\s*$/i
/** Cartão mascarado no começo da forma (`**** 1234 - Amex` → `Amex`). */
const CARTAO_MASCARADO = /\*\*\*\*\s\d{4}\s-\s/

/**
 * Status que contam como venda concluída: despachado ou entregue. COMPLETED é o
 * prato pronto na cozinha, ainda não saiu. Só esses pedidos entram em Descontos loja.
 */
const STATUS_CONCLUIDOS = new Set(['DISPATCHED', 'DELIVERED'])
/** No 99Food o incentivo do parceiro não vira Descontos parceiro (regra do legado). */
const ORIGEM_SEM_DESCONTO_PARCEIRO = '99food'
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

/**
 * Chave da origem para casar o pedido com o cadastro — a `normalizeOrigemKey` do
 * legado: minúsculas, espaços viram `_`, `APP CB` = `App Coco Bambu`, `99 Food` = `99Food`.
 */
function normalizarOrigem(origem: string | null | undefined): string {
  if (!origem) return ''
  const s = origem.trim().toLowerCase().replace(/\s+/g, ' ')
  const apelidos: Record<string, string> = { 'app cb': 'app coco bambu', '99 food': '99food' }
  return (apelidos[s] ?? s).replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Tipo de uma forma de pagamento — a `classifyPaymentSegment` do legado, nesta ordem:
 * 1. vazia ou `DESCONHECIDO` → não classificado;
 * 2. contém (sem o " - PRE PAGO") uma forma "ONLINE VR" do cadastro, da mesma origem
 *    do pedido ou sem origem → adquirente (ONLINE VR);
 * 3. termina em " - PRE PAGO" → online;
 * 4. qualquer outra → offline.
 * `formasVr` vem ordenada da descrição mais longa para a mais curta.
 */
function classificar(
  descricao: string,
  origemPedido: string,
  formasVr: FormaOnlineVr[]
): TipoPagamento {
  const semCartao = descricao.trim().replace(CARTAO_MASCARADO, '').trim().toUpperCase()
  if (semCartao === '' || semCartao === 'DESCONHECIDO') return 'nao_classificado'

  const semPrePago = semCartao.replace(PRE_PAGO, '').trim()
  const vr = formasVr.some(
    (f) => (f.origem === '' || f.origem === origemPedido) && semPrePago.includes(f.descricao)
  )
  if (vr) return 'adquirente'
  return PRE_PAGO.test(descricao.trim()) ? 'online' : 'offline'
}

/** Formas "ONLINE VR" do cadastro do legado (só as ativas), da mais longa para a mais curta. */
async function carregarFormasOnlineVr(): Promise<FormaOnlineVr[]> {
  let linhas: { descricao: string | null; origem: string | null }[]
  try {
    linhas = await sql<{ descricao: string | null; origem: string | null }[]>`
      select descricao, origem
      from gia_relatorios.formas_pagamento
      where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
    `
  } catch (e) {
    console.error('[fechamento] cadastro de formas de pagamento:', e)
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

function conciliar(
  raw: Record<string, unknown>,
  formasVr: FormaOnlineVr[]
): PedidoFechamento | null {
  const id = texto(raw.id)
  if (!id) return null

  const formaPgto = texto(raw.forma_de_pagamentos)
  const descontosTxt = texto(raw.descontos)
  const totalPago = numero(raw.total_pago)
  const descontoTotal = numero(raw.desconto_total)
  const status = texto(raw.status_do_pedido)
  const criacao = texto(raw.data_de_criacao_horario_sp)
  const acao = texto(raw.data_de_acao_horario_sp)
  const origem = texto(raw.origem)
  const origemChave = normalizarOrigem(origem)

  const pagamentos: Pagamento[] = separarItens(formaPgto).map((i) => ({
    ...i,
    tipo: classificar(i.descricao, origemChave, formasVr),
  }))
  const listaDescontos: Desconto[] = separarItens(descontosTxt)

  const porTipo: Record<TipoPagamento, number> = {
    online: 0,
    adquirente: 0,
    offline: 0,
    nao_classificado: 0,
  }
  let adquirentesOnline = 0
  const divergencias: string[] = []
  for (const p of pagamentos) {
    if (p.valor === null) {
      divergencias.push(`Forma de pagamento sem valor: "${p.descricao}".`)
      continue
    }
    porTipo[p.tipo] += centavos(p.valor)
    if (p.tipo === 'adquirente' && PRE_PAGO.test(p.descricao))
      adquirentesOnline += centavos(p.valor)
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

  // Descontos parceiro (regra do legado): o incentivo do parceiro só conta em pedido
  // que não é 99Food e tem forma ONLINE VR ou OFFLINE; nesse caso ele sai do Online
  // do pedido, se houver parte ONLINE.
  const incentivo = numero(raw.incentivo_parceiro)
  const tipos = new Set(pagamentos.map((p) => p.tipo))
  const descontoParceiro =
    origemChave !== ORIGEM_SEM_DESCONTO_PARCEIRO &&
    incentivo > 0 &&
    (tipos.has('adquirente') || tipos.has('offline'))
      ? incentivo
      : 0
  const abatimentoOnline = tipos.has('online') ? descontoParceiro : 0

  return {
    id,
    // n_pedido às vezes vem como número — o legado já tratava (GetJsonStr).
    n_pedido: texto(raw.n_pedido) ?? '',
    data: (criacao ?? acao ?? '').slice(0, 10),
    data_de_criacao: criacao,
    data_de_acao: acao,
    n_parceiro: texto(raw.n_parceiro),
    n_conta: texto(raw.n_conta),
    cpf_cliente: texto(raw.cpf_cliente),
    nome_cliente: texto(raw.nome_cliente),
    quantidade_pedidos:
      texto(raw.quantidade_pedidos) === null ? null : numero(raw.quantidade_pedidos),
    email_cliente: texto(raw.email_cliente),
    telefone_cliente: texto(raw.telefone_cliente),
    street_name: texto(raw.street_name),
    street_number: texto(raw.street_number),
    reference: texto(raw.reference),
    retirada: texto(raw.retirada),
    confirmado_por: texto(raw.confirmado_por),
    cancelado_por: texto(raw.cancelado_por),
    origem,
    status_do_pedido: status,
    tipo_entrega: texto(raw.tipo_entrega),
    nome_loja: texto(raw.nome_loja),
    valor_do_pedido: numero(raw.valor_do_pedido),
    valor_da_entrega: numero(raw.valor_da_entrega),
    total_pago: totalPago,
    desconto_total: descontoTotal,
    incentivo_parceiro: incentivo,
    forma_de_pagamentos: formaPgto,
    descontos: descontosTxt,
    pagamentos,
    lista_descontos: listaDescontos,
    total_pago_online: reais(porTipo.online),
    total_pago_adquirentes_online: reais(adquirentesOnline),
    total_pago_adquirentes_offline: reais(porTipo.adquirente - adquirentesOnline),
    total_pago_offline: reais(porTipo.offline),
    total_nao_classificado: reais(porTipo.nao_classificado),
    total_de_descontos: reais(somaDescontos),
    desconto_parceiro: descontoParceiro,
    abatimento_online: abatimentoOnline,
    cancelado: status === STATUS_CANCELADO,
    venda_concluida: status !== null && STATUS_CONCLUIDOS.has(status),
    check_pagamentos: checkPagamentos,
    check_descontos: checkDescontos,
    divergencias,
  }
}

// ─── Mascaramento (sem `fechamento-maestro.ver-dados-cliente`) ───────────────
// Mesma regra do Reports Maestro.

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
function mascarar(p: PedidoFechamento): PedidoFechamento {
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
  pedidos: PedidoFechamento[]
  /** `true` quando CPF, e-mail, telefone e endereço vieram mascarados. */
  dadosClienteMascarados: boolean
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-maestro.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)
  const verDados = await ctx.hasPermission('fechamento-maestro.ver-dados-cliente')

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  const locRef = numeroDaLoja(empresa.nome)
  if (!locRef) {
    throw new HttpError(422, `Não há número de loja no nome "${empresa.nome}" (ex.: "01.CB ...").`)
  }

  // O cadastro carrega enquanto a API (bem mais lenta) responde.
  const formasVrPromise = carregarFormasOnlineVr()
  // Sem isto, um erro do banco antes da API terminar viraria "unhandled rejection".
  formasVrPromise.catch(() => {})

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

  const formasVr = await formasVrPromise
  const pedidos: PedidoFechamento[] = []
  for (const raw of json.data as Record<string, unknown>[]) {
    const p = raw && typeof raw === 'object' ? conciliar(raw, formasVr) : null
    if (p) pedidos.push(verDados ? p : mascarar(p))
  }
  pedidos.sort((a, b) => (a.data_de_criacao ?? '').localeCompare(b.data_de_criacao ?? ''))
  return { pedidos, dadosClienteMascarados: !verDados }
})

export const config = { integracoes: ['apidw'], secrets: ['GIA_SERVER_DATABASE_URL'] }
