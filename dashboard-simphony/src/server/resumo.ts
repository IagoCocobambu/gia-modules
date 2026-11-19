import { defineHandler, envOptional, HttpError, type ServerContext } from '@gia-cb/sdk/server'

// Totais do dia de negócio de UMA loja, da BI do Simphony:
// - sem `data`: pergunta o último dia de negócio da loja (`getLatestBusDt`), como o
//   legado, que sempre abria no último dia;
// - com `data`: usa o dia escolhido na tela.
// Depois soma os centros de receita do `getOperationsDailyTotals` (regra do legado,
// `CarregaSales`): venda líquida, pessoas, contas, descontos, estornos e correções.
//
// O mix de itens e os funcionários vêm em handlers próprios (itens.ts,
// funcionarios.ts) — uma parte por chamada, a tela pede as três.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. O bloco "BI do
// Simphony" abaixo se repete em itens.ts e funcionarios.ts de propósito.

interface Body {
  empresaId: number
  /** `YYYY-MM-DD`; vazio = último dia de negócio da loja. */
  data?: string
}

interface Totais {
  vendaLiquida: number
  pessoas: number
  contas: number
  descontos: number
  estornos: number
  correcoes: number
}

interface Resposta {
  /** Dia de negócio consultado (`YYYY-MM-DD`). */
  data: string
  /** `true` quando o dia veio do `getLatestBusDt` (a tela não escolheu). */
  ultimoDia: boolean
  totais: Totais
}

// ── BI do Simphony (igual em resumo.ts, itens.ts e funcionarios.ts) ──────────

const MODULO = 'dashboard-simphony'
/** Id da integração no hub de Credenciais (PROVISÓRIO — ver docs/perguntas-gestor.md). */
const INTEGRACAO = 'simphony-bi'
/** Organização da BI quando o hub não traz `parametros.org` (a do legado). */
const ORG_PADRAO = 'GCB'
/** Abaixo do tempo da Edge Function (padrão 14 do AGENTS.md da raiz). */
const TIMEOUT_MS = 30_000

type Json = Record<string, unknown>

/** `locRef` da BI (`locRefs.BIAPI`) da Empresa, depois de checar o escopo. */
async function locRefDaLoja(ctx: ServerContext<unknown>, empresaId: unknown): Promise<string> {
  const id = Number(empresaId)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(id)
  const empresa = (await ctx.empresas()).find((e) => e.id === id)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  const locRef = empresa.locRefs?.BIAPI?.trim()
  if (!locRef) {
    throw new HttpError(
      422,
      `A loja "${empresa.nome}" não tem o vínculo com a BI do Simphony no cadastro.`
    )
  }
  return locRef
}

/** Modo demonstração: só no `gia dev`, sem credencial (dados fictícios). */
function demo(): boolean {
  return envOptional('GIA_DEV_DASHBOARD_SIMPHONY_DEMO') === '1'
}

/** Uma chamada à BI (`POST {baseUrl}/{org}/{recurso}`). Erro técnico só no log. */
async function chamarBi(ctx: ServerContext<unknown>, recurso: string, corpo: Json): Promise<Json> {
  const { baseUrl, token, parametros } = await ctx.credencial(INTEGRACAO)
  const org = (parametros?.org?.trim()) || ORG_PADRAO
  const url = `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(org)}/${recurso}`
  let r: Response
  try {
    r = await fetch(url, {
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
        'A BI do Simphony demorou demais para responder. Tente pesquisar de novo.'
      )
    }
    console.error(`[${MODULO}] falha de rede ao chamar a BI do Simphony (${recurso}):`, e)
    throw new HttpError(
      502,
      'Não foi possível falar com a BI do Simphony agora. Tente de novo em alguns minutos.'
    )
  }
  if (!r.ok) {
    const detalhe = await r.text().catch(() => '')
    console.error(`[${MODULO}] BI do Simphony respondeu ${r.status} (${recurso}):`, detalhe)
    if (r.status === 401 || r.status === 403) {
      throw new HttpError(
        424,
        'A BI do Simphony recusou a credencial do portal. Avise o time do Portal GIA.'
      )
    }
    throw new HttpError(
      502,
      `A BI do Simphony não conseguiu responder agora (código ${r.status}). Tente de novo em alguns minutos; se continuar, avise o suporte.`
    )
  }
  try {
    const json = (await r.json()) as unknown
    if (json && typeof json === 'object' && !Array.isArray(json)) return json as Json
  } catch (e) {
    console.error(`[${MODULO}] resposta inválida da BI do Simphony (${recurso}):`, e)
  }
  throw new HttpError(502, 'A BI do Simphony devolveu um formato inesperado.')
}

/** Lista de objetos de um campo da resposta (ausente = vazia). */
function lista(o: unknown, campo: string): Json[] {
  const v = o && typeof o === 'object' ? (o as Json)[campo] : undefined
  return Array.isArray(v) ? v.filter((x): x is Json => !!x && typeof x === 'object') : []
}

/** Número de um campo (ausente ou inválido = 0). */
function num(o: Json, campo: string): number {
  const v = Number(o[campo])
  return Number.isFinite(v) ? v : 0
}

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

// ── Fim do bloco BI do Simphony ──────────────────────────────────────────────

/** Soma de centavos sem erro de ponto flutuante. */
const somar = (a: number, b: number) => Math.round((a + b) * 100) / 100

function totaisDemo(data: string): Json {
  const semente = Number(data.replaceAll('-', '')) % 97
  return {
    revenueCenters: [
      {
        rvcNum: 1,
        netSlsTtl: 48210.35 + semente * 37,
        gstCnt: 412 + semente,
        chkCnt: 131 + (semente % 20),
        itmDscTtl: -1830.4,
        vdTtl: 312.9,
        errCorTtl: 85,
      },
      {
        rvcNum: 2,
        netSlsTtl: 9120.1,
        gstCnt: 0,
        chkCnt: 58,
        itmDscTtl: -210,
        vdTtl: 0,
        errCorTtl: 0,
      },
    ],
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('dashboard-simphony.ler')
  const locRef = await locRefDaLoja(ctx, ctx.body.empresaId)

  const escolhida = typeof ctx.body.data === 'string' ? ctx.body.data.trim() : ''
  if (escolhida && !DATA_RE.test(escolhida)) throw new HttpError(422, 'Data inválida (AAAA-MM-DD).')

  let data = escolhida
  if (!data) {
    if (demo()) {
      data = new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10)
    } else {
      const r = await chamarBi(ctx, 'getLatestBusDt', { locRef })
      // `latestBusDt` pode vir como data ou data e hora; vale o dia.
      data = String(r.latestBusDt ?? '').slice(0, 10)
      if (!DATA_RE.test(data)) {
        console.error(`[${MODULO}] getLatestBusDt sem data (${locRef}):`, r)
        throw new HttpError(
          502,
          'A BI do Simphony não informou o último dia de negócio desta loja. Escolha a data e pesquise de novo.'
        )
      }
    }
  }

  const json = demo()
    ? totaisDemo(data)
    : await chamarBi(ctx, 'getOperationsDailyTotals', { locRef, busDt: data })

  const totais: Totais = {
    vendaLiquida: 0,
    pessoas: 0,
    contas: 0,
    descontos: 0,
    estornos: 0,
    correcoes: 0,
  }
  for (const rvc of lista(json, 'revenueCenters')) {
    totais.vendaLiquida = somar(totais.vendaLiquida, num(rvc, 'netSlsTtl'))
    totais.pessoas += Math.trunc(num(rvc, 'gstCnt'))
    totais.contas += Math.trunc(num(rvc, 'chkCnt'))
    totais.descontos = somar(totais.descontos, num(rvc, 'itmDscTtl'))
    totais.estornos = somar(totais.estornos, num(rvc, 'vdTtl'))
    totais.correcoes = somar(totais.correcoes, num(rvc, 'errCorTtl'))
  }

  return { data, ultimoDia: !escolhida, totais }
})

export const config = { integracoes: ['simphony-bi'], secrets: [] }
