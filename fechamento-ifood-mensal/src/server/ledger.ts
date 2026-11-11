import { defineHandler, envOptional, HttpError } from '@gia-cb/sdk/server'

// Lançamentos financeiros do iFood (API Financial v3, "sales") de UMA página de
// UMA janela do mês — a aba Lançamentos e a base de todas as outras abas.
//
// Por que janela + página: a API não devolve o mês inteiro de uma vez. O legado
// (TDmFechamentoDiarioIfood.BuscarLedgerJanelaUnica) quebra o mês em janelas de
// no máximo 8 dias e pagina cada janela. Aqui o navegador chama este handler uma
// vez por página (até 4 ao mesmo tempo) — cada chamada é curta (~4 s; cabe no tempo
// da Edge Function) e a tela mostra o progresso real.
//
// O mapeamento de cada lançamento (descrição, tipo, classificação, fato gerador,
// TOTAL e STATUS) é o do legado, linha a linha (AppendLedgerLineMensal e as
// funções Map*/Calc*Ledger do Model Delphi).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

const INTEGRACAO = 'ifood'
const MAX_DIAS_JANELA = 8
/**
 * Uma página leva ~4 s. Passou de 30 s, desiste (504) e a tela NÃO repete: chamada
 * lenta repetida só prende o usuário (padrão 9 do workspace). O legado esperava 90 s.
 */
const TIMEOUT_MS = 30_000

interface Body {
  /** `operacao_ref` da loja escolhida. */
  operacaoRef: string
  /** Competência `AAAA-MM`. */
  mes: string
  /** 1..totalJanelas */
  janela: number
  /** 1..totalPaginas */
  pagina: number
}

interface LinhaLedger {
  total: number
  status: 'ONLINE' | 'ONLINE VR' | 'OFFLINE'
  /** `AAAA-MM-DD` do pedido (antes das 6h conta no dia anterior) ou `Ocorrências`. */
  data: string
  competencia: string
  competenciaLabel: string
  /** `DD/MM/AAAA` (formato do legado) ou vazio. */
  dataRepasse: string
  classificacao: string
  fatoGerador: string
  tipoLancamento: string
  descricao: string
  valor: number
  baseCalculo: number
  percentualTaxa: number
  impactoRepasse: 'SIM' | 'NÃO'
  pedidoId: string
  pedidoCurto: string
  metodoPagamento: string
  bandeira: string
}

interface Resposta {
  linhas: LinhaLedger[]
  janela: number
  totalJanelas: number
  pagina: number
  /** Páginas da janela (o navegador usa o valor da página 1). */
  totalPaginas: number
  inicio: string
  fim: string
}

type Json = Record<string, unknown>

// ── Leitura tolerante do JSON (GetJsonStr/Num/Bool do legado) ──────────────
function str(o: Json | undefined, k: string, padrao = ''): string {
  const v = o?.[k]
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return padrao
}
function num(o: Json | undefined, k: string, padrao = 0): number {
  const v = o?.[k]
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : padrao
  }
  return padrao
}
function bool(o: Json | undefined, k: string): boolean {
  const v = o?.[k]
  return v === true || (typeof v === 'string' && v.toLowerCase() === 'true')
}
function obj(v: unknown): Json | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : undefined
}
const igual = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// ── Datas ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
const MESES_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/**
 * Data do pedido a partir do `createdAt` (ParseCreatedAtLocalDate): usa a data e a
 * hora como vêm escritas (sem converter fuso) e, antes das 6h, conta no dia anterior
 * — o pedido da madrugada pertence ao movimento do dia que começou na véspera.
 */
function dataDoPedido(createdAt: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2})/.exec(createdAt)
  if (!m) return ''
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  if (+m[4] < 6) d.setUTCDate(d.getUTCDate() - 1)
  return iso(d)
}

/** `expectedPaymentDate` (ISO ou DD/MM/AAAA) → `DD/MM/AAAA`. */
function dataBR(s: string): string {
  const p = s.slice(0, 10)
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(p)
  return m ? p : ''
}

// ── Mapeamentos do legado ───────────────────────────────────────────────────
function metodoPagamento(m: string): string {
  const mapa: Record<string, string> = {
    DIGITAL_WALLET: 'Carteira digital',
    PIX: 'Pix',
    MEAL_VOUCHER: 'Vale refeição',
    CREDIT: 'Crédito',
    DEBIT: 'Débito',
    CASH: 'Dinheiro',
    BANK_PAY: 'Banco',
  }
  return mapa[m.toUpperCase()] ?? m
}

function responsavel(l: string): string {
  if (igual(l, 'IFOOD')) return 'IFOOD'
  if (igual(l, 'MERCHANT')) return 'LOJA'
  return l
}

function descricaoDoLancamento(entrada: string, descricao: string): string {
  if (igual(entrada, 'ORDER_PAYMENT')) return 'Entrada Financeira'
  if (igual(entrada, 'SERVICE_FEE')) return 'Taxa de serviço iFood cobrada do cliente'
  if (igual(entrada, 'PAYMENT_TRANSACTION_FEE')) return 'Taxa de transação'
  if (igual(entrada, 'ORDER_COMMISSION')) return 'Comissão do iFood (entrega própria da loja)'
  if (igual(entrada, 'IFOOD_SUBSIDY')) {
    if (igual(descricao, 'NETWORK_PROMOTION') || igual(descricao, 'PROMOTION_NETWORK'))
      return 'Promoção custeada pela rede'
    if (igual(descricao, 'INDUSTRY_PROMOTION') || igual(descricao, 'PROMOTION_INDUSTRY'))
      return 'Promoção custeada pela Indústria'
    return 'Promoção custeada pelo iFood'
  }
  if (igual(entrada, 'STORE_SUBSIDY')) {
    if (igual(descricao, 'BENEFIT_PARTNER')) return 'Promoção custeada pela loja'
    return 'Promoção custeada pela loja no delivery'
  }
  return descricao
}

function tipoDoLancamento(entrada: string): string {
  if (igual(entrada, 'ORDER_PAYMENT')) return 'Entrada Financeira'
  if (igual(entrada, 'SERVICE_FEE')) return 'Retenção'
  if (igual(entrada, 'PAYMENT_TRANSACTION_FEE') || igual(entrada, 'ORDER_COMMISSION'))
    return 'Cobrança'
  if (igual(entrada, 'IFOOD_SUBSIDY') || igual(entrada, 'STORE_SUBSIDY')) return 'Subsídio'
  return 'Ocorrência'
}

function classificacao(descricao: string): string {
  const mapa: Record<string, string> = {
    'entrada financeira': 'Pedidos com pagamento via iFood',
    'promoção custeada pelo ifood': 'Promoção custeada pelo iFood',
    'taxa de serviço ifood cobrada do cliente': 'Taxa de serviço iFood cobrada do cliente',
    'taxa de transação': 'Taxa de transação (3%)',
    'taxa de transação ifood beneficios': 'Taxa de transação (3%)',
    'comissão do ifood (entrega própria da loja)': 'Comissão iFood (7%)',
    'promoção custeada pela rede': 'Promoção custeada pela rede',
    'promoção custeada pela indústria': 'Promoção custeada pela Indústria',
    'promoção custeada pela loja': 'Promoção custeada pela loja',
    'promoção custeada pela loja no delivery': 'Promoção custeada pela loja',
  }
  return mapa[descricao.toLowerCase()] ?? descricao
}

/** TOTAL (CalcTotalLedger): só Venda/Cancelamento Total e só estas descrições. */
const DESCRICOES_DO_TOTAL = [
  'entrada financeira',
  'promoção custeada pelo ifood',
  'promoção custeada pela rede',
  'promoção custeada pela indústria',
  'taxa de serviço ifood cobrada do cliente',
  'taxa de conveniência por pagamento parcelado',
]
function totalDoLancamento(fato: string, descricao: string, valor: number): number {
  if (!(igual(fato, 'Venda') || igual(fato, 'Cancelamento Total'))) return 0
  return DESCRICOES_DO_TOTAL.includes(descricao.toLowerCase()) ? valor : 0
}

/** STATUS (CalcStatusLedger). */
function statusDoLancamento(
  resp: string,
  tipo: string,
  impacto: string,
  metodo: string,
  bandeira: string
): LinhaLedger['status'] {
  if (igual(resp, 'IFOOD')) {
    return igual(metodo, 'Vale refeição') && !igual(bandeira, 'IFOOD_MEAL_VOUCHER')
      ? 'ONLINE VR'
      : 'ONLINE'
  }
  return igual(tipo, 'Entrada Financeira') && igual(resp, 'LOJA') && igual(impacto, 'SIM')
    ? 'ONLINE'
    : 'OFFLINE'
}

function linhasDaVenda(venda: Json, competencia: string, rotulo: string): LinhaLedger[] {
  const eventos = venda.orderEvents
  if (!Array.isArray(eventos)) return []
  const pedidoId = str(venda, 'id')
  const pedidoCurto = str(venda, 'shortId')
  const tipoVenda = str(venda, 'type', 'ORDER')
  const fato = pedidoId && igual(tipoVenda, 'ORDER') ? 'Venda' : 'Ocorrência Avulsa'
  const data = pedidoId ? dataDoPedido(str(venda, 'createdAt')) : 'Ocorrências'

  let metodo = ''
  let bandeira = ''
  let resp = 'IFOOD'
  const metodos = obj(venda.payments)?.methods
  const primeiro = Array.isArray(metodos) ? obj(metodos[0]) : undefined
  if (primeiro) {
    metodo = metodoPagamento(str(primeiro, 'method'))
    bandeira = str(obj(primeiro.card), 'brand')
    resp = responsavel(str(primeiro, 'liability', 'IFOOD'))
  }

  const linhas: LinhaLedger[] = []
  for (const ev of eventos) {
    const evento = obj(ev)
    if (!evento || str(evento, 'fullCode') !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
    const entradas = obj(evento.metadata)?.entries
    if (!Array.isArray(entradas)) continue
    for (const e of entradas) {
      const entrada = obj(e)
      if (!entrada) continue
      const nomeEntrada = str(entrada, 'financialEntryName')
      const valor = num(entrada, 'amount')
      const descricao = descricaoDoLancamento(nomeEntrada, str(entrada, 'description'))
      const tipo = tipoDoLancamento(nomeEntrada)
      const impacto = bool(entrada, 'hasTransferImpact') ? 'SIM' : 'NÃO'
      linhas.push({
        total: totalDoLancamento(fato, descricao, valor),
        status: statusDoLancamento(resp, tipo, impacto, metodo, bandeira),
        data,
        competencia,
        competenciaLabel: rotulo,
        dataRepasse: dataBR(str(entrada, 'expectedPaymentDate')),
        classificacao: classificacao(descricao),
        fatoGerador: fato,
        tipoLancamento: tipo,
        descricao,
        valor,
        baseCalculo: num(
          entrada,
          'feeBaseValue',
          num(entrada, 'baseValue', num(entrada, 'calculationBase'))
        ),
        percentualTaxa: num(
          entrada,
          'feePercentage',
          num(entrada, 'percentage', num(entrada, 'rate'))
        ),
        impactoRepasse: impacto,
        pedidoId,
        pedidoCurto,
        metodoPagamento: metodo,
        bandeira,
      })
    }
  }
  return linhas
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

// ── Modo demonstração (só `gia dev`, sem credencial do iFood) ───────────────
/** Vendas fictícias no formato da API, para ver a tela funcionando no dev. */
function vendasDemo(inicio: Date, fim: Date, pagina: number): { sales: Json[]; pageCount: number } {
  const sales: Json[] = []
  let semente = inicio.getUTCDate() * 7919 + pagina * 104729
  const rnd = () => (semente = (semente * 48271) % 2147483647) / 2147483647
  for (let d = new Date(inicio); d <= fim; d.setUTCDate(d.getUTCDate() + 1)) {
    const qtd = 4 + Math.floor(rnd() * 5)
    for (let i = 0; i < qtd; i++) {
      const valor = Math.round((40 + rnd() * 160) * 100) / 100
      const vr = rnd() < 0.15
      const promo = rnd() < 0.3
      const hora = pad(11 + Math.floor(rnd() * 12))
      const repasse = new Date(d)
      repasse.setUTCDate(repasse.getUTCDate() + 30)
      const entry = (financialEntryName: string, amount: number, extra: Json = {}) => ({
        financialEntryName,
        amount,
        hasTransferImpact: true,
        expectedPaymentDate: iso(repasse),
        ...extra,
      })
      const entries: Json[] = [
        entry('ORDER_PAYMENT', valor),
        entry('ORDER_COMMISSION', -Math.round(valor * 7) / 100, {
          feeBaseValue: valor,
          feePercentage: 7,
        }),
        entry('PAYMENT_TRANSACTION_FEE', -Math.round(valor * 3) / 100, {
          feeBaseValue: valor,
          feePercentage: 3,
        }),
      ]
      if (promo) entries.push(entry('IFOOD_SUBSIDY', 10))
      if (rnd() < 0.2)
        entries.push(entry('STORE_SUBSIDY', -8, { hasTransferImpact: false, description: 'X' }))
      sales.push({
        id: `demo-${iso(d)}-${pagina}-${i}`,
        shortId: String(1000 + Math.floor(rnd() * 9000)),
        type: 'ORDER',
        createdAt: `${iso(d)}T${hora}:15:00`,
        payments: {
          methods: [
            vr
              ? { method: 'MEAL_VOUCHER', liability: 'IFOOD', card: { brand: 'ALELO' } }
              : { method: rnd() < 0.5 ? 'PIX' : 'CREDIT', liability: 'IFOOD' },
          ],
        },
        orderEvents: [{ fullCode: 'FINANCIAL_BILLED_ORDER_ENTRY', metadata: { entries } }],
      })
    }
  }
  return { sales, pageCount: 2 }
}

/**
 * Corpo da resposta de erro do iFood — vai só para o log do servidor (pode trazer
 * detalhe interno da API); o usuário recebe a mensagem curta.
 */
async function detalheDoErro(r: Response): Promise<string> {
  try {
    return (await r.text()).trim().slice(0, 300)
  } catch {
    return ''
  }
}

/**
 * Operações que dividem o número de loja com outra e têm merchant próprio no iFood
 * (Vasto na loja do CB). O SDK não tem vínculo iFood por operação (só por Empresa),
 * então o merchant destas fica aqui — PROVISÓRIO até o SDK expor `locRefs` em
 * `GiaOperacao`. Mesma tabela do Fechamento iFood Diário (manter as duas iguais).
 */
const OPERACOES_IFOOD_PROPRIO: Record<string, { merchant: string }> = {
  '08 vst': { merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
  '17 vst': { merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
  '25 vst': { merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
  '69 vst': { merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
  '86 vst': { merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
}

/** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
function chaveOperacao(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, ' ')
}

const esperar = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms))

/** Vendas da página sem nenhum evento financeiro (a resposta "leve" do iFood). */
function vendasLeves(corpo: { sales?: unknown }): number {
  if (!Array.isArray(corpo.sales)) return 0
  return corpo.sales.filter((s) => {
    const eventos = obj(s)?.orderEvents
    return !(
      Array.isArray(eventos) &&
      eventos.some((e) => obj(e)?.fullCode === 'FINANCIAL_BILLED_ORDER_ENTRY')
    )
  }).length
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-mensal.ler')
  // Exceção deste módulo: a busca é por OPERAÇÃO (não por Empresa).
  const operacao = await ctx.requireOperacao(String(ctx.body.operacaoRef ?? '').trim())

  const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
  const ano = mm ? Number(mm[1]) : 0
  const mesNum = mm ? Number(mm[2]) : 0
  if (ano < 2000 || mesNum < 1 || mesNum > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

  // O merchant do iFood é o da Empresa dona da operação (a integração mora no
  // cadastro da Empresa), menos nas operações com merchant próprio (Vasto na loja
  // do CB), que estão em `OPERACOES_IFOOD_PROPRIO`.
  const empresa = (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
  const merchantId =
    OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]?.merchant ??
    empresa?.locRefs?.IFOOD?.trim()
  const demo = envOptional('GIA_DEV_IFOOD_MENSAL_DEMO') === '1'
  if (!merchantId && !demo) {
    throw new HttpError(
      422,
      `A operação "${operacao.nome}" não tem integração iFood (merchant id na Empresa ${empresa?.nome ?? operacao.empresaId}).`
    )
  }

  const primeiroDia = new Date(Date.UTC(ano, mesNum - 1, 1))
  const ultimoDia = new Date(Date.UTC(ano, mesNum, 0))
  const dias = ultimoDia.getUTCDate()
  const totalJanelas = Math.ceil(dias / MAX_DIAS_JANELA)
  const janela = Number(ctx.body.janela)
  const pagina = Number(ctx.body.pagina)
  if (!Number.isInteger(janela) || janela < 1 || janela > totalJanelas)
    throw new HttpError(422, `Janela inválida (1 a ${totalJanelas}).`)
  if (!Number.isInteger(pagina) || pagina < 1) throw new HttpError(422, 'Página inválida.')

  const inicio = new Date(primeiroDia)
  inicio.setUTCDate(1 + (janela - 1) * MAX_DIAS_JANELA)
  const fim = new Date(inicio)
  fim.setUTCDate(fim.getUTCDate() + MAX_DIAS_JANELA - 1)
  if (fim > ultimoDia) fim.setTime(ultimoDia.getTime())

  const competencia = `${ano}-${pad(mesNum)}`
  const rotulo = `${MESES_PT[mesNum - 1]}/${String(ano).slice(2)}`
  const base = { janela, totalJanelas, pagina, inicio: iso(inicio), fim: iso(fim) }

  let corpo: { sales?: unknown; total?: unknown; pageCount?: unknown }
  if (demo) {
    // Só no dev: atraso por página para simular a demora da API e testar a consulta em paralelo.
    const atraso = Number(envOptional('GIA_DEV_IFOOD_MENSAL_DEMO_ATRASO_MS') ?? 0)
    if (atraso > 0) await new Promise((r) => setTimeout(r, atraso))
    corpo = vendasDemo(inicio, fim, pagina)
  } else {
    const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
    const qs = new URLSearchParams({
      beginSalesDate: iso(inicio),
      endSalesDate: iso(fim),
      page: String(pagina),
    })
    const url = `${baseUrl.replace(/\/+$/, '')}/financial/v3.0/merchants/${encodeURIComponent(merchantId!)}/sales?${qs}`
    /** Uma chamada à API. No 429 (limite) espera o `Retry-After` — ou 1,5 s, 3 s, 6 s — até 3 vezes. */
    const pedir = async (): Promise<Response> => {
      for (let tentativa = 0; ; tentativa++) {
        let r: Response
        try {
          r = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: AbortSignal.timeout(TIMEOUT_MS),
          })
        } catch (e) {
          if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
            throw new HttpError(
              504,
              'O iFood demorou demais para responder. Tente consultar de novo.'
            )
          }
          console.error('[fechamento-ifood-mensal] falha de rede ao chamar o iFood:', e)
          throw new HttpError(
            502,
            'Não foi possível falar com o iFood agora. Tente consultar de novo em alguns minutos.'
          )
        }
        if (r.status !== 429 || tentativa >= 3) return r
        const retry = Number(r.headers.get('retry-after'))
        await esperar(Number.isFinite(retry) && retry > 0 ? retry * 1000 : 1500 * 2 ** tentativa)
      }
    }
    /** Lê a resposta; erro do iFood vira `HttpError` (recusa 424, limite 429, resto 502). */
    const ler = async (r: Response): Promise<typeof corpo | null> => {
      // 204 = janela sem vendas (legado: encerra a janela).
      if (r.status === 204) return null
      if (!r.ok) {
        const recusa = recusaIfood(r.status)
        // 424: o iFood recusou (credencial/autorização) — tentar de novo não resolve.
        if (recusa) throw new HttpError(424, recusa)
        console.error(
          `[fechamento-ifood-mensal] iFood respondeu ${r.status} (janela ${janela}, página ${pagina}):`,
          await detalheDoErro(r)
        )
        throw new HttpError(
          r.status === 429 ? 429 : 502,
          r.status === 429
            ? 'O iFood limitou as consultas por alguns instantes (muitas requisições). Tente consultar de novo em 1 minuto.'
            : `O iFood não conseguiu responder agora (código ${r.status}). Tente consultar de novo em alguns minutos; se continuar, avise o suporte.`
        )
      }
      const c = (await r.json()) as typeof corpo
      if (!c || typeof c !== 'object') {
        throw new HttpError(502, 'A API Financial do iFood devolveu um formato inesperado.')
      }
      return c
    }

    const primeira = await ler(await pedir())
    if (!primeira) return { ...base, linhas: [], totalPaginas: pagina }
    corpo = primeira
    // Página "leve": o iFood às vezes devolve as vendas SEM os eventos financeiros —
    // a página inteira ou parte dela —, e cada venda leve vira zero lançamento.
    // Medido em 11/11/2026 (loja 01, out/2026): 19 de 49 páginas vieram leves na 1ª
    // chamada e todas vieram completas ao pedir de novo; nenhuma venda ficou sem
    // evento. Pede de novo (até 4 vezes) e fica com a mais completa; se ainda faltar,
    // erro (a tela tenta de novo) — nunca um mês com lançamentos faltando.
    for (let tentativa = 0; tentativa < 4 && vendasLeves(corpo) > 0; tentativa++) {
      await esperar(500 * (tentativa + 1))
      const outra = await ler(await pedir())
      if (outra && vendasLeves(outra) < vendasLeves(corpo)) corpo = outra
    }
    const leves = vendasLeves(corpo)
    if (leves > 0) {
      console.error(
        `[fechamento-ifood-mensal] página incompleta do iFood (janela ${janela}, página ${pagina}): ${leves} venda(s) sem evento financeiro após 5 pedidos`
      )
      throw new HttpError(
        502,
        'O iFood devolveu uma página incompleta (vendas sem os lançamentos financeiros). Tente consultar de novo em alguns minutos.'
      )
    }
  }

  // Página 1 com total 0: janela sem vendas.
  if (pagina === 1 && corpo.total === 0) return { ...base, linhas: [], totalPaginas: 1 }
  const totalPaginas = Math.max(1, Math.floor(Number(corpo.pageCount) || 1))
  const linhas: LinhaLedger[] = []
  if (Array.isArray(corpo.sales)) {
    for (const s of corpo.sales) {
      const venda = obj(s)
      if (venda) linhas.push(...linhasDaVenda(venda, competencia, rotulo))
    }
  }
  return { ...base, linhas, totalPaginas }
})

export const config = { integracoes: ['ifood'], secrets: [] }
