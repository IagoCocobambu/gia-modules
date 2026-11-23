import { defineHandler, envOptional, HttpError, type ServerContext } from '@gia-cb/sdk/server'

// Nomes para o detalhe da mesa: a conta da BI traz só o código do item (`miNum`) e o
// número do garçom (`empNum`). Chamado pela tela só ao abrir o detalhe de uma mesa
// (não pesa a pesquisa), uma vez por loja enquanto a tela está aberta.
//
// - itens: `getMenuItemDimensions` { locRef } → `menuItems[]` { num, name }
//   (medido em 19/11/2026: ~9 mil itens, ~10 s);
// - garçons: `getEmployeeDimensions` { locRef } → `employees[]` { num, fName, lName }.
// Devolve só os códigos pedidos. O garçom vai como "Nome S." (primeiro nome e a inicial
// do sobrenome), o bastante para o salão reconhecer.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

const INTEGRACAO = 'simphony-bi'
const TIMEOUT_MS = 120_000
const MAX_CODIGOS = 500
const LOCREF_DEMO = 'DEMO'

interface Body {
  empresaId: number
  itens: number[]
  garcons: number[]
}

interface Resposta {
  itens: Record<string, string>
  garcons: Record<string, string>
}

type Json = Record<string, unknown>

const codigos = (v: unknown): number[] =>
  Array.isArray(v)
    ? [...new Set(v.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_CODIGOS)
    : []

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
      throw new HttpError(504, 'A BI do Simphony demorou demais para mandar os nomes dos itens.')
    }
    console.error(`[couvert] falha de rede ao chamar a BI do Simphony (${rota}):`, e)
    throw new HttpError(502, 'A BI do Simphony não respondeu agora. Tente de novo.')
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

/** "RAFAEL SOUZA" → "Rafael S." */
function nomeCurto(primeiro: unknown, sobrenome: unknown): string {
  const cap = (t: string) =>
    t.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
  const p = cap(
    String(primeiro ?? '')
      .trim()
      .split(/\s+/)[0] ?? ''
  )
  const s = String(sobrenome ?? '').trim()
  return [p, s ? `${s[0].toUpperCase()}.` : ''].filter(Boolean).join(' ')
}

const DEMO_ITENS: Record<number, string> = {
  500060: 'Prog Art 2',
  500063: 'Program Artistic',
  23001: 'Buffet',
  3001: 'Refrigerante Lata',
  3010: 'Suco de Laranja',
  4020: 'Caipirinha Limão',
  9743: 'Pudim Buffet',
}
const DEMO_GARCONS: Record<number, string> = { 1021: 'Ana P.', 1043: 'Rafael S.', 1055: 'Bruno T.' }

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('couvert.ler')
  const empresaId = Number(ctx.body?.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Escolha a loja.')
  await ctx.requireEmpresa(empresaId)
  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  const locRef = empresa?.locRefs?.BIAPI?.trim()
  if (!locRef) {
    throw new HttpError(
      422,
      'Esta loja não tem vínculo com a BI do Simphony no cadastro do portal.'
    )
  }
  const pedidosItens = codigos(ctx.body?.itens)
  const pedidosGarcons = codigos(ctx.body?.garcons)
  const resposta: Resposta = { itens: {}, garcons: {} }

  if (locRef === LOCREF_DEMO && envOptional('GIA_DEV_COUVERT_DEMO') === '1') {
    for (const n of pedidosItens) if (DEMO_ITENS[n]) resposta.itens[n] = DEMO_ITENS[n]
    for (const n of pedidosGarcons) if (DEMO_GARCONS[n]) resposta.garcons[n] = DEMO_GARCONS[n]
    return resposta
  }

  const [menu, equipe] = await Promise.all([
    pedidosItens.length ? bi(ctx, 'getMenuItemDimensions', { locRef }) : null,
    pedidosGarcons.length ? bi(ctx, 'getEmployeeDimensions', { locRef }) : null,
  ])
  const querItens = new Set(pedidosItens)
  for (const i of Array.isArray(menu?.menuItems) ? (menu.menuItems as Json[]) : []) {
    const n = Number(i.num)
    if (querItens.has(n) && typeof i.name === 'string') resposta.itens[n] = i.name.trim()
  }
  const querGarcons = new Set(pedidosGarcons)
  for (const g of Array.isArray(equipe?.employees) ? (equipe.employees as Json[]) : []) {
    const n = Number(g.num)
    if (querGarcons.has(n)) resposta.garcons[n] = nomeCurto(g.fName, g.lName)
  }
  return resposta
})

export const config = { integracoes: ['simphony-bi'], secrets: [] }
