import { defineHandler, envOptional, HttpError } from '@gia-cb/sdk/server'

// Lançamentos financeiros da 99Food (Financial API, `getShopBillDetail`) de UMA página
// de UMA loja da 99 no mês — a aba Lançamentos e a base de todas as outras abas.
//
// A API devolve até 31 dias por consulta (o mês inteiro numa "janela" só) e até 200
// linhas por página. O navegador chama este handler uma vez por página (a fila do
// `use-consulta-mensal`), com a mesma resposta do Fechamento iFood Mensal.
//
// Cada linha da 99 (um pedido, um estorno ou um lançamento avulso, valores em
// centavos) vira os "lançamentos" no formato do iFood — Entrada Financeira, Promoção
// custeada pela 99, Promoção custeada pela loja, Comissão… —, para as abas e as regras
// do iFood Mensal valerem iguais. A soma dos lançamentos com impacto no repasse é o
// `settlementAmount` da linha (conferido nos exemplos da documentação).
//
// ⚠️ MAPEAMENTO PROVISÓRIO (decisão de 17/11/2026, PRD §11): não há tela antiga da 99
// e a documentação não explica os códigos de pagamento. Tudo aqui está "a validar
// pelo financeiro" antes da entrega.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

const INTEGRACAO = '99food'
/** A API aceita no máximo 31 dias por consulta: o mês inteiro numa janela só. */
const MAX_DIAS_JANELA = 31
/** Máximo da API. */
const LINHAS_POR_PAGINA = 200
/** Tempo limite de cada chamada (padrão 14 do workspace). Estourou: 504, sem repetir. */
const TIMEOUT_MS = 30_000

interface Body {
  /** Empresa (loja) escolhida — o fechamento junta todas as operações dela. */
  empresaId: number
  /** `app_shop_id` da loja na 99Food — um dos vínculos 99FOOD da Empresa (conferido aqui). */
  merchant: string
  /** Competência `AAAA-MM`. */
  mes: string
  /** Sempre 1 (o mês cabe numa consulta). */
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
  /** `DD/MM/AAAA` ou vazio. */
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

/** Mesmo formato do Fechamento iFood Mensal; a 99 não informa cota (sempre `null`). */
interface Resposta {
  linhas: LinhaLedger[]
  janela: number
  totalJanelas: number
  pagina: number
  totalPaginas: number
  inicio: string
  fim: string
  /** A 99 recusou esta loja (sem autorização): ela fica de fora e a tela avisa. */
  aviso: string | null
  cota: null
  repeticoes: number
  adiar: null
}

type Json = Record<string, unknown>

function str(o: Json | undefined, k: string, padrao = ''): string {
  const v = o?.[k]
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return padrao
}
/** Valor em centavos (inteiro) → reais. */
function centavos(o: Json, k: string): number {
  const v = o[k]
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0
  return Number.isFinite(n) ? n : 0
}
function obj(v: unknown): Json | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : undefined
}
const reais = (c: number) => Math.round(c) / 100

// ── Datas ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
const compacta = (d: Date) => iso(d).replace(/-/g, '')
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
 * Dia do movimento a partir do `businessDateTime` ("2025-08-15 03:25:36"), como no
 * iFood: a data e a hora como vêm (sem converter fuso) e, antes das 6h, o dia anterior.
 * (Fuso do campo a confirmar com a 99 — PRD §11.)
 */
function dataDoPedido(dataHora: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2})/.exec(dataHora)
  if (!m) return ''
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  if (+m[4] < 6) d.setUTCDate(d.getUTCDate() - 1)
  return iso(d)
}

/** `expectSettleDate` ("2025-08-20") → `DD/MM/AAAA`. */
function dataBR(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// ── Mapeamento provisório da linha da 99 ─────────────────────────────────────
/** `orderType` da 99 → fato gerador no vocabulário do iFood Mensal. */
function fatoGerador(orderType: number): string {
  if (orderType === 1) return 'Venda'
  if (orderType === 2) return 'Cancelamento Total'
  if (orderType === 3) return 'Cancelamento Parcial'
  if (orderType === 4) return 'Estorno pós-venda'
  return 'Ocorrência Avulsa'
}

const DESC_ENTRADA = 'Entrada Financeira'
const DESC_PROMO_99 = 'Promoção custeada pela 99'
const DESC_PROMO_LOJA = 'Promoção custeada pela loja'

/** Classificação (coluna da aba Lançamentos e cards). */
const CLASSIFICACAO: Record<string, string> = {
  [DESC_ENTRADA]: 'Pedidos com pagamento via 99Food',
  [DESC_PROMO_99]: DESC_PROMO_99,
  [DESC_PROMO_LOJA]: DESC_PROMO_LOJA,
  'Comissão da 99': 'Comissão da 99',
  'Taxa de pagamento': 'Taxa de pagamento',
}

/** TOTAL: como no iFood, só Venda/Cancelamento Total e só estas descrições. */
const DESCRICOES_DO_TOTAL = [DESC_ENTRADA, DESC_PROMO_99]
function totalDoLancamento(fato: string, descricao: string, valor: number): number {
  if (fato !== 'Venda' && fato !== 'Cancelamento Total') return 0
  return DESCRICOES_DO_TOTAL.includes(descricao) ? valor : 0
}

/**
 * Status: vale-refeição (`mealVoucherAmount`) → ONLINE VR; o resto → ONLINE. OFFLINE
 * (pagamento na entrega) só quando a 99 mandar a tabela dos códigos de pagamento.
 */
function statusDaLinha(linha: Json): LinhaLedger['status'] {
  return centavos(linha, 'mealVoucherAmount') !== 0 ? 'ONLINE VR' : 'ONLINE'
}

/** Os códigos vêm sem tabela na documentação: mostramos como vieram, para mapear depois. */
function metodoPagamento(linha: Json): string {
  if (centavos(linha, 'mealVoucherAmount') !== 0) return 'Vale refeição'
  const codigos = ['paymentMethod', 'paymentChannel', 'paymentMethodDetail'].map((k) =>
    str(linha, k, '0')
  )
  return codigos.every((c) => c === '0') ? '' : `Código ${codigos.join('/')}`
}

function linhasDaLinhaBill(linha: Json, competencia: string, rotulo: string): LinhaLedger[] {
  const orderType = Math.trunc(centavos(linha, 'orderType'))
  const fato = fatoGerador(orderType)
  const avulso = orderType === 5
  const data = avulso ? 'Ocorrências' : dataDoPedido(str(linha, 'businessDateTime'))
  const comum = {
    status: statusDaLinha(linha),
    data,
    competencia,
    competenciaLabel: rotulo,
    dataRepasse: dataBR(str(linha, 'expectSettleDate')),
    fatoGerador: fato,
    pedidoId: str(linha, 'orderId'),
    pedidoCurto: str(linha, 'orderIndex'),
    metodoPagamento: metodoPagamento(linha),
    bandeira: str(linha, 'cardBrand'),
  }
  const c = (k: string) => centavos(linha, k)
  const repasse = c('settlementAmount')

  const itens: Array<{
    descricao: string
    tipo: string
    centavos: number
    impacto: 'SIM' | 'NÃO'
    base?: number
    percentual?: number
    sempre?: boolean
  }> = []
  if (avulso) {
    itens.push({
      descricao: 'Lançamento avulso',
      tipo: 'Ocorrência',
      centavos: repasse,
      impacto: 'SIM',
      sempre: true,
    })
  } else {
    const promoLoja =
      c('shopActivityOutcome') +
      c('shopActivitySubsidy') +
      c('freeDeliveryOutcome') +
      c('freeDeliverySubsidy')
    itens.push(
      {
        // O que o cliente pagou: itens + entrega, já com todos os descontos.
        descricao: DESC_ENTRADA,
        tipo: 'Entrada Financeira',
        centavos:
          c('mealOriginalAmount') +
          c('shopDeliveryAmount') +
          c('shopActivityOutcome') +
          c('freeDeliveryOutcome'),
        impacto: 'SIM',
        sempre: true,
      },
      {
        descricao: DESC_PROMO_99,
        tipo: 'Subsídio',
        centavos: c('shopActivitySubsidy') + c('freeDeliverySubsidy'),
        impacto: 'SIM',
      },
      // Informativo (já está dentro da Entrada Financeira): a parte do desconto que a
      // loja bancou. Como o STORE_SUBSIDY do iFood, sem impacto no repasse.
      { descricao: DESC_PROMO_LOJA, tipo: 'Subsídio', centavos: promoLoja, impacto: 'NÃO' },
      {
        descricao: 'Gorjeta antecipada',
        tipo: 'Ocorrência',
        centavos: c('shopPreTips'),
        impacto: 'SIM',
      },
      {
        descricao: 'Comissão da 99',
        tipo: 'Cobrança',
        centavos: c('commissionAmount'),
        impacto: 'SIM',
        base: reais(c('commissionBaseAmount')),
        // `commissionRate` vem em centésimos de ponto percentual (3500 = 35%).
        percentual: c('commissionRate') / 100,
      },
      {
        descricao: 'Subsídio de comissão da 99',
        tipo: 'Subsídio',
        centavos: c('commissionSubsidyAmount'),
        impacto: 'SIM',
      },
      {
        descricao: 'Entrega da 99',
        tipo: 'Cobrança',
        centavos: c('b2pDeliveryAmount'),
        impacto: 'SIM',
      },
      {
        descricao: 'Taxa de pagamento',
        tipo: 'Cobrança',
        centavos: c('payCommissionAmount'),
        impacto: 'SIM',
      },
      {
        descricao: 'Complemento de pedido mínimo',
        tipo: 'Ocorrência',
        centavos: c('minValueDifferenceAmount'),
        impacto: 'SIM',
      }
    )
    // O que sobra até o `settlementAmount` (estorno pós-venda, perda, contestação,
    // imposto, mensalidade…): uma linha só, para o repasse fechar com a 99.
    const somado = itens.filter((i) => i.impacto === 'SIM').reduce((s, i) => s + i.centavos, 0)
    itens.push({
      descricao: 'Ajustes do repasse',
      tipo: 'Ocorrência',
      centavos: repasse - somado,
      impacto: 'SIM',
    })
  }

  return itens
    .filter((i) => i.sempre || i.centavos !== 0)
    .map((i) => {
      const valor = reais(i.centavos)
      return {
        ...comum,
        total: totalDoLancamento(fato, i.descricao, valor),
        classificacao: CLASSIFICACAO[i.descricao] ?? i.descricao,
        tipoLancamento: i.tipo,
        descricao: i.descricao,
        valor,
        baseCalculo: i.base ?? 0,
        percentualTaxa: i.percentual ?? 0,
        impactoRepasse: i.impacto,
      }
    })
}

/**
 * Os ids da 99 têm 19 dígitos (64 bits): o `JSON.parse` arredonda número desse tamanho.
 * A documentação manda `orderId` como texto, mas, se vier número, vira texto antes.
 */
function lerJsonComIdsLongos(texto: string): unknown {
  return JSON.parse(texto.replace(/("(?:orderId|dayPaymentId|shopId)"\s*:\s*)(\d{16,})/g, '$1"$2"'))
}

/** Código de erro (`errno`) da 99 → status e mensagem curta. */
function erroDa99(errno: number, errmsg: string): HttpError {
  const dev = envOptional('GIA_DEV_CRED_99FOOD_TOKEN') !== undefined
  if (errno === 110004) {
    return new HttpError(
      422,
      'A 99Food só devolve os lançamentos dos últimos 3 meses. Escolha um mês mais recente.'
    )
  }
  if ([10101, 10102, 14105, 14106].includes(errno)) {
    return new HttpError(
      424,
      dev
        ? `A 99Food recusou a credencial (erro ${errno}). Confira o GIA_DEV_CRED_99FOOD_TOKEN no .env e reinicie o gia dev.`
        : `A 99Food recusou a credencial (erro ${errno}). Avise o administrador do portal (hub de Credenciais, integração 99food).`
    )
  }
  console.error(`[fechamento-99food-mensal] a 99Food respondeu errno ${errno}:`, errmsg)
  return new HttpError(
    502,
    `A 99Food não conseguiu responder agora (erro ${errno}). Tente consultar de novo em alguns minutos; se continuar, avise o suporte.`
  )
}

// ── Modo demonstração (só `gia dev`, sem credencial da 99) ──────────────────
/** Linhas fictícias no formato do `getShopBillDetail`, para ver a tela no dev. */
function linhasDemo(
  inicio: Date,
  fim: Date,
  pagina: number
): { linhas: Json[]; totalPaginas: number } {
  const linhas: Json[] = []
  let semente = inicio.getUTCMonth() * 7919 + pagina * 104729
  const rnd = () => (semente = (semente * 48271) % 2147483647) / 2147483647
  for (let d = new Date(inicio); d <= fim; d.setUTCDate(d.getUTCDate() + 1)) {
    if ((d.getUTCDate() % 2 === 0) !== (pagina === 1)) continue // 2 páginas
    const qtd = 3 + Math.floor(rnd() * 4)
    for (let i = 0; i < qtd; i++) {
      const itens = Math.round((40 + rnd() * 160) * 100)
      const entrega = rnd() < 0.5 ? 799 : 0
      const desconto = rnd() < 0.3 ? -Math.round(itens * 0.15) : 0
      const subsidio = desconto ? Math.round(-desconto * 0.4) : 0
      const vr = rnd() < 0.15
      const cancelado = rnd() < 0.05
      const sinal = cancelado ? -1 : 1
      const comissao = -Math.round((itens + desconto) * 0.12)
      const taxaPg = -Math.round((itens + desconto) * 0.03)
      const repasse = new Date(d)
      repasse.setUTCDate(repasse.getUTCDate() + 7)
      const hora = pad(11 + Math.floor(rnd() * 12))
      const settlement = sinal * (itens + entrega + desconto + subsidio + comissao + taxaPg)
      linhas.push({
        orderId: `57646${iso(d).replace(/-/g, '')}${pagina}${pad(i)}`,
        orderIndex: String(100000 + Math.floor(rnd() * 900000)),
        orderType: cancelado ? 2 : 1,
        businessDateTime: `${iso(d)} ${hora}:20:00`,
        mealOriginalAmount: sinal * itens,
        shopDeliveryAmount: sinal * entrega,
        shopActivityOutcome: sinal * desconto,
        shopActivitySubsidy: sinal * subsidio,
        freeDeliveryOutcome: 0,
        freeDeliverySubsidy: 0,
        commissionBaseAmount: itens + desconto,
        commissionRate: 1200,
        commissionAmount: sinal * comissao,
        payCommissionAmount: sinal * taxaPg,
        paymentMethod: vr ? 3 : 1,
        paymentChannel: vr ? 300 : 150,
        paymentMethodDetail: vr ? 301 : 102,
        cardBrand: vr ? 'alelo' : 'visa',
        mealVoucherAmount: vr ? sinal * (itens + entrega + desconto) : 0,
        settlementAmount: settlement,
        expectSettleDate: iso(repasse),
      })
    }
  }
  if (pagina === 1) {
    linhas.push({ orderId: '', orderType: 5, settlementAmount: -9900, expectSettleDate: iso(fim) })
  }
  return { linhas, totalPaginas: 2 }
}

interface Loja99 {
  /** `operacao_ref` da operação dona do vínculo (ex.: "17 cb"). */
  operacao: string
  /** `app_shop_id` na 99Food. */
  merchant: string
}

/**
 * Lojas da 99Food desta Empresa: os vínculos 99FOOD ativos de todas as operações dela,
 * do cadastro do portal (`ctx.operacoes()` → `integracoes`). `locRef` = `app_shop_id`
 * (A CONFIRMAR com o time GIA — PRD §11). A MESMA função está em `lojas.ts` (handler
 * auto-contido): mude as duas.
 */
function restaurantesDaLoja(
  operacoes: { ref: string; empresaId: number; integracoes: { tipo: string; locRef: string }[] }[],
  empresaId: number
): Loja99[] {
  const vistos = new Set<string>()
  return operacoes
    .filter((o) => o.empresaId === empresaId)
    .flatMap((o) =>
      (o.integracoes ?? [])
        .filter((i) => i.tipo === '99FOOD' && i.locRef?.trim())
        .map((i) => ({ operacao: o.ref, merchant: i.locRef.trim() }))
    )
    .filter((r) => !vistos.has(r.merchant) && Boolean(vistos.add(r.merchant)))
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-99food-mensal.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
  // 403 se a Empresa está fora do escopo do usuário.
  await ctx.requireEmpresa(empresaId)

  const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
  const ano = mm ? Number(mm[1]) : 0
  const mesNum = mm ? Number(mm[2]) : 0
  if (ano < 2000 || mesNum < 1 || mesNum > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

  // A loja da 99 do body só vale se for um dos vínculos 99FOOD das operações da Empresa.
  const appShopId = typeof ctx.body.merchant === 'string' ? ctx.body.merchant.trim() : ''
  const daLoja = restaurantesDaLoja(await ctx.operacoes(), empresaId).map((r) => r.merchant)
  if (!appShopId || !daLoja.includes(appShopId)) {
    throw new HttpError(422, 'Esta loja da 99Food não é desta Empresa.')
  }

  const inicio = new Date(Date.UTC(ano, mesNum - 1, 1))
  const fim = new Date(Date.UTC(ano, mesNum, 0))
  const totalJanelas = Math.ceil(fim.getUTCDate() / MAX_DIAS_JANELA)
  const janela = Number(ctx.body.janela)
  const pagina = Number(ctx.body.pagina)
  if (janela !== 1 || totalJanelas !== 1) throw new HttpError(422, 'Janela inválida (só 1).')
  if (!Number.isInteger(pagina) || pagina < 1) throw new HttpError(422, 'Página inválida.')

  const competencia = `${ano}-${pad(mesNum)}`
  const rotulo = `${MESES_PT[mesNum - 1]}/${String(ano).slice(2)}`
  const responder = (
    linhas: LinhaLedger[],
    totalPaginas: number,
    aviso: string | null = null
  ): Resposta => ({
    linhas,
    janela,
    totalJanelas,
    pagina,
    totalPaginas,
    inicio: iso(inicio),
    fim: iso(fim),
    aviso,
    cota: null,
    repeticoes: 0,
    adiar: null,
  })

  let brutas: unknown[]
  let totalPaginas: number
  if (envOptional('GIA_DEV_99FOOD_MENSAL_DEMO') === '1') {
    const atraso = Number(envOptional('GIA_DEV_99FOOD_MENSAL_DEMO_ATRASO_MS') ?? 0)
    if (atraso > 0) await new Promise((r) => setTimeout(r, atraso))
    const demo = linhasDemo(inicio, fim, pagina)
    brutas = demo.linhas
    totalPaginas = demo.totalPaginas
  } else {
    const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
    const url = `${baseUrl.replace(/\/+$/, '')}/v3/finance/finance/getShopBillDetail`
    let r: Response
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          acceptor_code: appShopId,
          page_no: pagina,
          page_size: LINHAS_POR_PAGINA,
          start_date: compacta(inicio),
          end_date: compacta(fim),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (e) {
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
        throw new HttpError(504, 'A 99Food demorou demais para responder. Tente consultar de novo.')
      }
      console.error('[fechamento-99food-mensal] falha de rede ao chamar a 99Food:', e)
      throw new HttpError(
        502,
        'Não foi possível falar com a 99Food agora. Tente consultar de novo em alguns minutos.'
      )
    }
    const texto = await r.text()
    if (r.status === 401) {
      throw new HttpError(
        424,
        'A 99Food recusou a credencial (401). Avise o administrador do portal (hub de Credenciais, integração 99food).'
      )
    }
    if (r.status === 403) {
      // Sem a autorização especial da Financial API para esta loja: só ela fica de fora.
      return responder(
        [],
        1,
        'A 99Food negou o acesso aos lançamentos desta loja (403): a Financial API precisa de autorização da 99. Os lançamentos dela ficaram de fora.'
      )
    }
    if (!r.ok) {
      console.error(
        `[fechamento-99food-mensal] a 99Food respondeu ${r.status} (página ${pagina}):`,
        texto.slice(0, 300)
      )
      throw new HttpError(
        502,
        `A 99Food não conseguiu responder agora (código ${r.status}). Tente consultar de novo em alguns minutos; se continuar, avise o suporte.`
      )
    }
    let corpo: Json | undefined
    try {
      corpo = obj(lerJsonComIdsLongos(texto))
    } catch {
      corpo = undefined
    }
    if (!corpo)
      throw new HttpError(502, 'A Financial API da 99Food devolveu um formato inesperado.')
    const errno = Number(corpo.errno ?? 0)
    if (errno !== 0) {
      throw erroDa99(errno, str(corpo, 'errmsg'))
    }
    const dados = obj(corpo.data)
    brutas = Array.isArray(dados?.data) ? dados.data : []
    totalPaginas = Math.max(1, Math.floor(Number(dados?.total_page) || 1))
  }

  const linhas: LinhaLedger[] = []
  for (const b of brutas) {
    const linha = obj(b)
    if (linha) linhas.push(...linhasDaLinhaBill(linha, competencia, rotulo))
  }
  return responder(linhas, totalPaginas)
})

export const config = { integracoes: ['99food'], secrets: [] }
