import { defineHandler, HttpError, type ServerContext } from '@gia-cb/sdk/server'

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
 * abaixo do limite da Edge Function (150 s); combinar com o time do Portal GIA o
 * `timeout_seconds` da função `couvert-mesas` (INTEGRATION §5). O legado esperava 180 s.
 * Estourou: 504, e a tela não repete sozinha.
 */
const TIMEOUT_MS = 120_000

interface Body {
  empresaId: number
  /** Número do RVC (salão) — um dos da loja (conferido aqui). */
  rvc: number
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
}

interface Resposta {
  /** Dia de negócio aberto na loja (`getLatestBusDt`), `AAAA-MM-DD`. */
  dia: string
  /** ISO da consulta (para o "atualizado há N min"). */
  consultadoEm: string
  /** Loja com itens de buffet configurados: a tela mostra o buffet. */
  temBuffet: boolean
  mesas: Mesa[]
}

type Json = Record<string, unknown>

const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0

/** Contas da BI → mesas (regras do legado, ver o topo). */
function montarMesas(contas: unknown[], programacao: Set<number>, buffet: Set<number>): Mesa[] {
  const mesas: Mesa[] = []
  for (const bruto of contas) {
    const c = (bruto ?? {}) as Json
    if (num(c.guestCheckId) <= 0 || c.clsdFlag === true || c.cancelFlag === true) continue
    let couvert = 0
    let somaBuffet = 0
    for (const linha of Array.isArray(c.detailLines) ? (c.detailLines as Json[]) : []) {
      const item = linha?.menuItem as Json | undefined
      if (!item) continue // taxa de serviço, desconto, pagamento…
      const mi = num(item.miNum)
      if (programacao.has(mi)) couvert += num(linha.dspQty)
      if (buffet.has(mi)) somaBuffet += num(linha.dspQty)
    }
    const tblNum = c.tblNum === null || c.tblNum === undefined ? null : num(c.tblNum)
    mesas.push({
      id: String(c.guestCheckId),
      mesa: String(c.tblName ?? tblNum ?? '').trim() || '?',
      grupo: tblNum,
      pessoas: num(c.gstCnt),
      couvert,
      buffet: somaBuffet,
    })
  }
  return mesas
}

/** POST numa rota da BI. Erros com status e frase curta; o detalhe fica no log. */
async function bi(ctx: ServerContext<Body>, rota: string, corpo: Json): Promise<Json> {
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
      signal: AbortSignal.timeout(TIMEOUT_MS),
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

  const ultimo = await bi(ctx, 'getLatestBusDt', { locRef })
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
