import { defineHandler, envOptional, HttpError, type ServerContext } from '@gia-cb/sdk/server'

// Mesas abertas de UM salão (RVC) de UMA loja, agora, com o couvert artístico e o
// buffet lançados em cada uma. Uma loja por chamada (padrão 14 e orientação do time
// do Portal GIA, 19/11/2026): `getLatestBusDt` e depois `getGuestChecks`.
//
// Regras do legado (`TDmSimDash.SimphonyGetChecks`, tela Couvert):
// - contas abertas do RVC (`where equals(guestChecks.clsdFlag,false) AND
//   equals(guestChecks.rvcNum,<RVC>)`); ficam de fora `guestCheckId <= 0`,
//   `clsdFlag` e `cancelFlag` (nas contas abertas a BI nem manda os dois flags);
// - mesa = `tblName`, grupo = `tblNum`, pessoas = `gstCnt`;
// - couvert = soma de `dspQty` das linhas cujo `menuItem.miNum` está na programação
//   artística da loja; buffet = o mesmo com os itens de buffet.
// Diferença para o legado: o dia de negócio vem do `getLatestBusDt` (o legado usava a
// data de hoje e perdia as mesas do turno que passa da meia-noite) — decidido com o
// usuário e o time do Portal GIA em 19/11/2026.
//
// Configuração da loja: `empresa.couvert` (SDK alpha.72), do cadastro de Empresas do
// portal. Token: hub de Credenciais (`simphony-bi`); o `baseUrl` já vem com a
// organização. A situação de cada mesa é da tela (`src/regras.ts`).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

const INTEGRACAO = 'simphony-bi'
/**
 * Tempo limite de cada chamada à BI. O time do Portal GIA orientou 60 s, mas em
 * 19/11/2026 (17h, Campinas, um RVC) o `getGuestChecks` levou 89 s, 77 s e 8,5 s em
 * três tentativas seguidas — com 60 s a maioria das pesquisas caía no 504. 120 s fica
 * abaixo do limite da Edge Function (150 s), e o dia de negócio tem limite próprio para as
 * duas chamadas somadas não passarem dele; combinar com o time do Portal GIA o
 * `timeout_seconds` da função `couvert` (INTEGRATION §5). O legado esperava 180 s.
 * Estourou: 504, e a tela não repete sozinha.
 */
const TIMEOUT_MS = 120_000
/** `getLatestBusDt` é leve (0,6 s medidos): 20 s + 120 s cabem nos 150 s da função. */
const TIMEOUT_DIA_MS = 20_000

interface Body {
  empresaId: number
  /** Número do RVC (salão) — um dos da loja (conferido aqui). */
  rvc: number
}

interface ItemConta {
  /** Código do item no PDV (`menuItem.miNum`); o nome vem do handler `nomes`. */
  miNum: number
  qtd: number
  valor: number
  /** Assento (`seatNum`); `null` sem assento. */
  assento: number | null
  /** Rodada de pedido (`svcRndNum`). */
  rodada: number | null
  /** Hora local do lançamento (`detailLcl`), `AAAA-MM-DDTHH:MM:SS`. */
  hora: string | null
  tipo: 'couvert' | 'buffet' | null
}

/** Conta aberta da mesa — o detalhe que abre ao tocar no card. */
interface Conta {
  numero: number | null
  /** Hora local da abertura (`opnLcl`) e do último lançamento (`lastTransLcl`). */
  abertura: string | null
  ultimoLancamento: string | null
  /** Garçom da conta (`empNum`); o nome vem do handler `nomes`. */
  garcom: number | null
  rodadas: number | null
  /** Pré-conta impressa (`numChkPrntd > 0`). */
  impressa: boolean
  subtotal: number
  desconto: number
  taxaServico: number
  total: number
  pago: number
  saldo: number
  itens: ItemConta[]
}

interface Mesa {
  /** `guestCheckId` da conta. */
  id: string
  /** Nome da mesa (`tblName`). */
  mesa: string
  /** Número do grupo da mesa (`tblNum`). */
  grupo: number | null
  pessoas: number
  couvert: number
  buffet: number
  conta: Conta
}

interface Resposta {
  /** Dia de negócio aberto na loja (`getLatestBusDt`), `AAAA-MM-DD`. */
  dia: string
  /** ISO da consulta (para o "atualizado há N min"). */
  consultadoEm: string
  /** Loja com itens de buffet configurados: o buffet conta para a situação. */
  temBuffet: boolean
  mesas: Mesa[]
}

type Json = Record<string, unknown>

const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0

const opcional = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : num(v)
const texto = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)

/** Contas da BI → mesas (regras do legado, ver o topo). */
function montarMesas(contas: unknown[], programacao: Set<number>, buffet: Set<number>): Mesa[] {
  const mesas: Mesa[] = []
  for (const bruto of contas) {
    const c = (bruto ?? {}) as Json
    if (num(c.guestCheckId) <= 0 || c.clsdFlag === true || c.cancelFlag === true) continue
    let couvert = 0
    let somaBuffet = 0
    const itens: ItemConta[] = []
    for (const linha of Array.isArray(c.detailLines) ? (c.detailLines as Json[]) : []) {
      const item = linha?.menuItem as Json | undefined
      if (!item) continue // taxa de serviço, desconto, pagamento…
      const mi = num(item.miNum)
      const tipo = programacao.has(mi) ? 'couvert' : buffet.has(mi) ? 'buffet' : null
      if (tipo === 'couvert') couvert += num(linha.dspQty)
      if (tipo === 'buffet') somaBuffet += num(linha.dspQty)
      itens.push({
        miNum: mi,
        qtd: num(linha.dspQty),
        valor: num(linha.dspTtl),
        assento: opcional(linha.seatNum),
        rodada: opcional(linha.svcRndNum),
        hora: texto(linha.detailLcl),
        tipo,
      })
    }
    const tblNum = c.tblNum === null || c.tblNum === undefined ? null : num(c.tblNum)
    mesas.push({
      id: String(c.guestCheckId),
      mesa: String(c.tblName ?? tblNum ?? '').trim() || '?',
      grupo: tblNum,
      pessoas: num(c.gstCnt),
      couvert,
      buffet: somaBuffet,
      conta: {
        numero: opcional(c.chkNum),
        abertura: texto(c.opnLcl),
        ultimoLancamento: texto(c.lastTransLcl),
        garcom: opcional(c.empNum),
        rodadas: opcional(c.numSrvcRd),
        impressa: num(c.numChkPrntd) > 0,
        subtotal: num(c.subTtl),
        desconto: num(c.dscTtl),
        // `svcChgTtl` já inclui a taxa automática (`autoSvcTtl`): somar os dois
        // dobrava a taxa (visto numa conta real em 23/11/2026: total − subtotal = svcChgTtl).
        taxaServico:
          c.svcChgTtl !== null && c.svcChgTtl !== undefined ? num(c.svcChgTtl) : num(c.autoSvcTtl),
        total: num(c.chkTtl),
        pago: num(c.payTtl),
        saldo: num(c.balDueTtl),
        itens,
      },
    })
  }
  return mesas
}

// ── Loja de demonstração (só `gia dev`) ─────────────────────────────────────
// Com GIA_DEV_COUVERT_DEMO=1 no `.env`, a Empresa cujo vínculo BIAPI é `DEMO` (as
// "999.LOJA DEMONSTRAÇÃO…" do gia.config.ts) não chama a BI: devolve contas fictícias
// no formato do `getGuestChecks`, cobrindo todos os casos que a tela trata. Em produção
// a variável não existe e nenhum cadastro real tem `DEMO`.
//
// RVCs da demonstração (configurados no gia.config.ts):
// - 101 Restaurante: uma mesa para cada situação e cada detalhe da conta (abaixo);
// - 102 Varanda: nenhuma conta aberta (estado vazio);
// - 901/902/903: simulam a BI lenta (504), a credencial recusada (424) e a BI com erro (502).
const LOCREF_DEMO = 'DEMO'

/** [miNum, qtd, preço unitário, assento|null, rodada|null, hora] */
type LinhaDemo = [number, number, number, number | null, number | null, string]
interface MesaDemo {
  caso: string
  mesa: string
  grupo?: number
  pessoas: number
  garcom?: number | null
  rodadas?: number
  impressa?: boolean
  desconto?: number
  pago?: number
  abertura: string
  linhas: LinhaDemo[]
}

// Itens: 500063/500060 couvert artístico; 23001 buffet; 3001 refrigerante; 3010 suco;
// 4020 caipirinha; 9743 pudim; 777777 item sem nome na BI. Garçom 9999 faz o handler
// `nomes` falhar (a tela mostra os códigos).
const MESAS_DEMO: MesaDemo[] = [
  {
    caso: 'tudo lançado',
    mesa: '12',
    pessoas: 2,
    garcom: 1021,
    rodadas: 1,
    abertura: '20:05',
    linhas: [
      [500063, 2, 19.9, 1, 1, '20:07'],
      [23001, 2, 89.9, 1, 1, '20:07'],
      [3001, 2, 8.9, 2, 1, '20:08'],
    ],
  },
  {
    caso: 'couvert sem lançamento',
    mesa: '18',
    pessoas: 3,
    garcom: 1043,
    rodadas: 1,
    abertura: '20:20',
    linhas: [
      [23001, 3, 89.9, 1, 1, '20:22'],
      [3010, 3, 12.9, 2, 1, '20:23'],
    ],
  },
  {
    caso: 'faltam 2 couverts',
    mesa: '22',
    pessoas: 4,
    garcom: 1043,
    rodadas: 3,
    abertura: '19:42',
    linhas: [
      [500063, 1, 19.9, 1, 1, '19:44'],
      [500063, 1, 19.9, 2, 1, '19:44'],
      [23001, 1, 89.9, 1, 1, '19:45'],
      [23001, 1, 89.9, 2, 1, '19:45'],
      [23001, 1, 89.9, 3, 1, '19:45'],
      [23001, 1, 89.9, 4, 1, '19:45'],
      [3001, 1, 8.9, 1, 1, '19:46'],
      [3001, 1, 8.9, 3, 1, '19:46'],
      [3010, 1, 12.9, 4, 1, '19:46'],
      [4020, 2, 24.9, 1, 2, '20:15'],
      [9743, 1, 18.9, 3, 3, '21:05'],
      [9743, 1, 18.9, 4, 3, '21:05'],
    ],
  },
  {
    caso: '1 couvert a mais, grupo 2',
    mesa: '45',
    grupo: 2,
    pessoas: 3,
    garcom: 1055,
    rodadas: 2,
    abertura: '19:10',
    linhas: [
      [500063, 4, 19.9, 1, 1, '19:12'],
      [23001, 3, 89.9, 1, 1, '19:12'],
      [3010, 3, 12.9, 2, 2, '19:40'],
    ],
  },
  {
    caso: 'sem pessoas, nada lançado',
    mesa: '81',
    pessoas: 0,
    garcom: 1055,
    rodadas: 1,
    abertura: '21:00',
    linhas: [[3010, 1, 12.9, 1, 1, '21:02']],
  },
  {
    caso: 'sem pessoas, com couvert',
    mesa: '82',
    pessoas: 0,
    garcom: 1021,
    rodadas: 1,
    abertura: '20:58',
    linhas: [[500063, 2, 19.9, 1, 1, '21:00']],
  },
  {
    caso: 'sem pessoas, com buffet',
    mesa: '83',
    pessoas: 0,
    garcom: 1043,
    rodadas: 1,
    abertura: '20:55',
    linhas: [[23001, 1, 89.9, 1, 1, '20:56']],
  },
  {
    caso: 'buffet sem lançamento',
    mesa: '31',
    pessoas: 2,
    garcom: 1021,
    rodadas: 2,
    abertura: '20:30',
    linhas: [
      [500063, 2, 19.9, 1, 1, '20:31'],
      [4020, 2, 24.9, 2, 2, '20:50'],
    ],
  },
  {
    caso: 'falta 1 buffet',
    mesa: '60',
    pessoas: 6,
    garcom: 1043,
    rodadas: 2,
    abertura: '20:12',
    linhas: [
      [500060, 6, 19.9, 1, 1, '20:14'],
      [23001, 5, 89.9, 1, 1, '20:14'],
      [3001, 6, 8.9, 3, 2, '20:40'],
    ],
  },
  {
    caso: 'couvert e buffet faltando',
    mesa: '61',
    pessoas: 2,
    garcom: 1055,
    rodadas: 1,
    abertura: '20:40',
    linhas: [
      [500063, 1, 19.9, 1, 1, '20:41'],
      [3001, 2, 8.9, 1, 1, '20:41'],
    ],
  },
  {
    caso: 'mesa grande, faltam 3',
    mesa: '120',
    pessoas: 10,
    garcom: 1021,
    rodadas: 3,
    abertura: '19:30',
    linhas: [
      [500063, 7, 19.9, 1, 1, '19:32'],
      [23001, 10, 89.9, 1, 1, '19:33'],
      [4020, 6, 24.9, 2, 2, '20:05'],
      [9743, 4, 18.9, 5, 3, '21:00'],
    ],
  },
  {
    caso: 'pré-conta impressa, desconto e pagamento parcial',
    mesa: '303',
    pessoas: 2,
    garcom: 1043,
    rodadas: 2,
    impressa: true,
    desconto: 20,
    pago: 150,
    abertura: '19:05',
    linhas: [
      [500063, 2, 19.9, 1, 1, '19:06'],
      [23001, 2, 89.9, 1, 1, '19:06'],
      [9743, 2, 18.9, 2, 2, '20:30'],
    ],
  },
  {
    caso: 'estorno de couvert (linha negativa)',
    mesa: '310',
    pessoas: 1,
    garcom: 1055,
    rodadas: 1,
    abertura: '20:10',
    linhas: [
      [500063, 2, 19.9, 1, 1, '20:11'],
      [500063, -1, 19.9, 1, 1, '20:12'],
      [23001, 1, 89.9, 1, 1, '20:11'],
    ],
  },
  {
    caso: 'conta acabou de abrir, sem itens',
    mesa: '404',
    pessoas: 2,
    garcom: 1021,
    rodadas: 0,
    abertura: '21:10',
    linhas: [],
  },
  {
    caso: 'itens sem assento e item sem nome na BI',
    mesa: '505',
    pessoas: 2,
    garcom: 1043,
    rodadas: 1,
    abertura: '20:50',
    linhas: [
      [500063, 2, 19.9, null, null, '20:51'],
      [23001, 2, 89.9, null, 1, '20:51'],
      [777777, 1, 35, null, 1, '20:52'],
    ],
  },
  {
    caso: 'nomes não chegam (falha no handler nomes)',
    mesa: '700',
    pessoas: 2,
    garcom: 9999,
    rodadas: 1,
    abertura: '20:25',
    linhas: [
      [500063, 2, 19.9, 1, 1, '20:26'],
      [23001, 2, 89.9, 1, 1, '20:26'],
    ],
  },
  {
    caso: 'conta sem garçom',
    mesa: '701',
    pessoas: 2,
    garcom: null,
    rodadas: 1,
    abertura: '20:35',
    linhas: [
      [500063, 2, 19.9, 1, 1, '20:36'],
      [23001, 2, 89.9, 2, 1, '20:36'],
    ],
  },
  {
    caso: 'nome de mesa longo',
    mesa: 'VIP Lounge 12',
    pessoas: 4,
    garcom: 1055,
    rodadas: 1,
    abertura: '20:00',
    linhas: [
      [500063, 4, 19.9, 1, 1, '20:02'],
      [23001, 4, 89.9, 1, 1, '20:02'],
    ],
  },
]

const r2 = (v: number) => Math.round(v * 100) / 100

const ITEM_BUFFET_DEMO = 23001

function contasDemo(rvc: number, temBuffet: boolean): Json[] {
  if (rvc === 901) {
    throw new HttpError(
      504,
      'A BI do Simphony demorou demais para responder. Tente atualizar de novo.'
    )
  }
  if (rvc === 902) {
    throw new HttpError(
      424,
      'A BI do Simphony recusou a credencial do portal (código 401). Avise o time do Portal GIA.'
    )
  }
  if (rvc === 903)
    throw new HttpError(502, 'A BI do Simphony não conseguiu responder agora (código 500).')
  if (rvc !== 101) return [] // 102 Varanda: nenhuma conta aberta
  // As horas das contas são de um turno fictício que está em 21:15; andam junto com o
  // relógio (21:15 = agora em São Paulo) para o "aberta há" fazer sentido a qualquer hora.
  const sp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date())
  const agora = Date.parse(`${sp.replace(' ', 'T')}Z`)
  const h = (hm: string) => {
    const [hh, mm] = hm.split(':').map(Number)
    const atras = (21 * 60 + 15 - (hh * 60 + mm)) * 60_000
    return new Date(agora - atras).toISOString().slice(0, 19)
  }
  // Loja sem buffet não vende buffet: as contas dela vêm sem esses itens.
  const daLoja = MESAS_DEMO.map((m) =>
    temBuffet ? m : { ...m, linhas: m.linhas.filter(([miNum]) => miNum !== ITEM_BUFFET_DEMO) }
  )
  return daLoja.map((m, i) => {
    const sub = r2(m.linhas.reduce((s, l) => s + l[1] * l[2], 0))
    const desconto = m.desconto ?? 0
    const taxa = r2((sub - desconto) * 0.1)
    const total = r2(sub - desconto + taxa)
    const pago = m.pago ?? 0
    const ultima = m.linhas.length ? m.linhas[m.linhas.length - 1][5] : m.abertura
    return {
      guestCheckId: 900000 + i,
      chkNum: 2930 + i,
      tblName: m.mesa,
      tblNum: m.grupo ?? 1,
      gstCnt: m.pessoas,
      empNum: m.garcom === undefined ? 1021 : m.garcom,
      numSrvcRd: m.rodadas ?? 1,
      numChkPrntd: m.impressa ? 1 : 0,
      opnLcl: h(m.abertura),
      lastTransLcl: h(ultima),
      subTtl: sub,
      dscTtl: desconto,
      svcChgTtl: taxa,
      autoSvcTtl: taxa, // a BI repete a taxa aqui; o handler não pode somar os dois
      chkTtl: total,
      payTtl: pago,
      balDueTtl: r2(total - pago),
      detailLines: [
        ...m.linhas.map(([miNum, qtd, unit, assento, rodada, hora]) => ({
          menuItem: { miNum },
          dspQty: qtd,
          dspTtl: r2(qtd * unit),
          seatNum: assento,
          svcRndNum: rodada,
          detailLcl: h(hora),
        })),
        { serviceCharge: {}, dspQty: 0, dspTtl: taxa }, // linha sem item: fica de fora
      ],
    }
  })
}

/** POST numa rota da BI. Erros com status e frase curta; o detalhe fica no log. */
async function bi(
  ctx: ServerContext<Body>,
  rota: string,
  corpo: Json,
  limite = TIMEOUT_MS
): Promise<Json> {
  const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
  let r: Response
  try {
    r = await fetch(`${baseUrl.replace(/\/+$/, '')}/${rota}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(limite),
    })
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new HttpError(
        504,
        'A BI do Simphony demorou demais para responder. Tente atualizar de novo.'
      )
    }
    console.error(`[couvert] falha de rede ao chamar a BI do Simphony (${rota}):`, e)
    throw new HttpError(502, 'A BI do Simphony não respondeu agora. Tente atualizar de novo.')
  }
  if (r.status === 401 || r.status === 403) {
    console.error(`[couvert] BI do Simphony recusou a credencial (${rota}):`, r.status)
    throw new HttpError(
      424,
      `A BI do Simphony recusou a credencial do portal (código ${r.status}). Avise o time do Portal GIA.`
    )
  }
  if (!r.ok) {
    console.error(
      `[couvert] BI do Simphony respondeu com erro (${rota}):`,
      r.status,
      await r.text().catch(() => '')
    )
    throw new HttpError(502, `A BI do Simphony não conseguiu responder agora (código ${r.status}).`)
  }
  try {
    return (await r.json()) as Json
  } catch (e) {
    console.error(`[couvert] resposta da BI do Simphony não é JSON (${rota}):`, e)
    throw new HttpError(502, 'A BI do Simphony devolveu uma resposta que não deu para ler.')
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('couvert.ler')
  const empresaId = Number(ctx.body?.empresaId)
  const rvc = Number(ctx.body?.rvc)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Escolha a loja.')
  if (!Number.isInteger(rvc) || rvc <= 0) throw new HttpError(422, 'Escolha o RVC (salão).')
  await ctx.requireEmpresa(empresaId)

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  const locRef = empresa?.locRefs?.BIAPI?.trim()
  if (!empresa || !locRef) {
    throw new HttpError(
      422,
      'Esta loja não tem vínculo com a BI do Simphony no cadastro do portal. Avise o time do Portal GIA.'
    )
  }
  const config = empresa.couvert ?? { programacao: [], buffet: [], rvcs: [] }
  // O body é palpite: o RVC tem de ser um dos configurados para a loja.
  if (!config.rvcs.some((r) => r.numero === rvc)) {
    throw new HttpError(422, 'Este RVC não está configurado para a loja. Escolha outro salão.')
  }
  if (config.programacao.length === 0) {
    throw new HttpError(
      422,
      'A loja não tem itens de couvert artístico configurados no cadastro. Avise o time do Portal GIA.'
    )
  }

  if (locRef === LOCREF_DEMO && envOptional('GIA_DEV_COUVERT_DEMO') !== '1') {
    throw new HttpError(
      422,
      'A loja de demonstração só funciona no gia dev com GIA_DEV_COUVERT_DEMO=1 no .env. Defina a variável e reinicie o gia dev.'
    )
  }
  if (locRef === LOCREF_DEMO) {
    const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
      new Date()
    )
    return {
      dia,
      consultadoEm: new Date().toISOString(),
      temBuffet: config.buffet.length > 0,
      mesas: montarMesas(
        contasDemo(rvc, config.buffet.length > 0),
        new Set(config.programacao),
        new Set(config.buffet)
      ),
    }
  }

  const ultimo = await bi(ctx, 'getLatestBusDt', { locRef }, TIMEOUT_DIA_MS)
  const dia = String(ultimo.latestBusDt ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
    console.error('[couvert] getLatestBusDt sem latestBusDt:', ultimo)
    throw new HttpError(502, 'A BI do Simphony não informou o dia de negócio da loja.')
  }
  const resposta = await bi(ctx, 'getGuestChecks', {
    locRef,
    busDt: dia,
    searchCriteria: `where equals(guestChecks.clsdFlag,false) AND equals(guestChecks.rvcNum,${rvc})`,
  })
  const contas = Array.isArray(resposta.guestChecks) ? resposta.guestChecks : []

  return {
    dia,
    consultadoEm: new Date().toISOString(),
    temBuffet: config.buffet.length > 0,
    mesas: montarMesas(contas, new Set(config.programacao), new Set(config.buffet)),
  }
})

export const config = { integracoes: ['simphony-bi'], secrets: [] }
