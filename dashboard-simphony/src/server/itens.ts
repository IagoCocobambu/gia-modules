import { defineHandler, envOptional, HttpError, type ServerContext } from '@gia-cb/sdk/server'

// Mix de vendas do dia de UMA loja, da BI do Simphony (regra do legado,
// `SimphonyGetSalesMix`): soma `slsCnt` e `slsTtl` de cada item (`miNum`) em todos
// os centros de receita do `getMenuItemDailyTotals`, do maior total para o menor.
//
// O nome do item vem do cadastro de itens da própria BI (`getMenuItemDimensions`).
// O legado lia o nome de uma tabela do banco dele (`mistatus.menuitems`); a fonte
// do nome é PROVISÓRIA — ver docs/perguntas-gestor.md, pergunta 3.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. O bloco "BI do
// Simphony" abaixo se repete em resumo.ts e funcionarios.ts de propósito.

interface Body {
  empresaId: number
  /** `YYYY-MM-DD` — o dia que o `resumo` devolveu. */
  data: string
}

interface ItemVendido {
  numero: number
  nome: string
  quantidade: number
  total: number
}

interface Resposta {
  itens: ItemVendido[]
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

const ITENS_DEMO: [number, string, number][] = [
  [1001, 'Camarão Internacional', 189.9],
  [1002, 'Moqueca de Camarão', 214.5],
  [1003, 'Bobó de Camarão', 172],
  [1004, 'Picanha na Chapa', 159.9],
  [1005, 'Salmão Grelhado', 118.9],
  [1006, 'Risoto de Camarão', 139.9],
  [2001, 'Caipirinha', 32],
  [2002, 'Suco de Laranja', 14.9],
  [2003, 'Refrigerante Lata', 9.5],
  [2004, 'Água Mineral', 7],
  [3001, 'Petit Gâteau', 39.9],
  [3002, 'Couvert', 18],
]

function mixDemo(data: string): { totais: Json; nomes: Json } {
  const semente = Number(data.replaceAll('-', '')) % 13
  const menuItems = ITENS_DEMO.map(([miNum, , preco], i) => {
    const slsCnt = ((i * 7 + semente) % 23) + 2
    return { miNum, slsCnt, slsTtl: Math.round(slsCnt * preco * 100) / 100 }
  })
  return {
    totais: {
      revenueCenters: [
        { rvcNum: 1, menuItems: menuItems.slice(0, 9) },
        // O mesmo item em dois centros de receita: a tela mostra a soma.
        { rvcNum: 2, menuItems: [...menuItems.slice(6), { miNum: 9999, slsCnt: 1, slsTtl: 5 }] },
      ],
    },
    nomes: { menuItems: ITENS_DEMO.map(([num, name]) => ({ num, name })) },
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('dashboard-simphony.ler')
  const locRef = await locRefDaLoja(ctx, ctx.body.empresaId)
  const data = typeof ctx.body.data === 'string' ? ctx.body.data.trim() : ''
  if (!DATA_RE.test(data)) throw new HttpError(422, 'Data inválida (AAAA-MM-DD).')

  const { totais, nomes } = demo()
    ? mixDemo(data)
    : await Promise.all([
        chamarBi(ctx, 'getMenuItemDailyTotals', { locRef, busDt: data }),
        chamarBi(ctx, 'getMenuItemDimensions', { locRef }),
      ]).then(([totais, nomes]) => ({ totais, nomes }))

  const nomePorNumero = new Map<number, string>()
  for (const mi of lista(nomes, 'menuItems')) {
    const numero = num(mi, 'num') || num(mi, 'miNum')
    const nome = typeof mi.name === 'string' ? mi.name.trim() : ''
    if (numero && nome) nomePorNumero.set(numero, nome)
  }

  const porNumero = new Map<number, ItemVendido>()
  for (const rvc of lista(totais, 'revenueCenters')) {
    for (const mi of lista(rvc, 'menuItems')) {
      const numero = num(mi, 'miNum')
      if (!numero) continue
      const item = porNumero.get(numero) ?? {
        numero,
        // Item fora do cadastro: o número fica no lugar do nome.
        nome: nomePorNumero.get(numero) ?? `Item ${numero}`,
        quantidade: 0,
        total: 0,
      }
      item.quantidade += Math.trunc(num(mi, 'slsCnt'))
      item.total = somar(item.total, num(mi, 'slsTtl'))
      porNumero.set(numero, item)
    }
  }

  const itens = [...porNumero.values()].sort((a, b) => b.total - a.total || a.numero - b.numero)
  return { itens }
})

export const config = { integracoes: ['simphony-bi'], secrets: [] }
