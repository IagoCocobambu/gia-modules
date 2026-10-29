import { defineHandler, env } from '@gia-cb/sdk/server'
// import { sql } from '@gia-cb/sdk/server' // ← descomente pra consultar um DB externo

// ─── Handler SERVER-SIDE (fonte externa: API/DB fora do portal) ─────────────
// Este arquivo roda em DOIS lugares com o MESMO código:
//   - DEV: no processo Node do `gia dev` (exposto em POST /__gia/bff/exemplo-externo).
//   - PROD: como Edge Function (Deno) — o `gia pack` gera o wrapper. Você não
//     escreve Deno.
//
// REGRA: use SÓ `fetch` + os helpers de @gia-cb/sdk/server (`env`, `sql`). NÃO
// importe pacotes npm nem outros arquivos do módulo aqui (o prod não os carrega).
// Segredo fica no `.env` em dev / no secret da Edge Function em prod — nunca no
// código nem no browser.

interface Entrada {
  termo?: string
}
interface Saida {
  fonte: string
  itens: Array<{ id: string; nome: string }>
}

export default defineHandler<Entrada, Saida>(async (ctx) => {
  const { body } = ctx

  // AUTORIZAÇÃO — obrigatória em TODO handler (princípio nº 1 do portal): o
  // endpoint recebe o body direto do browser, então a UI esconder o botão não
  // protege nada.
  //   O QUE o usuário pode fazer:
  await ctx.requirePermission('meu-modulo.ler')
  //   ONDE ele pode fazer — se o seu handler receber uma loja no body:
  //   const loja = await ctx.requireOperacao(body.locRef)   // 403 se fora do escopo
  //   (também: ctx.operacoes(), ctx.empresaScope(), ctx.requireEmpresa(id))

  // (A) API externa — o segredo fica AQUI (server-side), nunca no browser.
  const base = env('EXEMPLO_API_URL') // ex: https://api.parceiro.com
  const key = env('EXEMPLO_API_KEY')
  const r = await fetch(`${base}/itens?q=${encodeURIComponent(body.termo ?? '')}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!r.ok) throw new Error(`fonte externa respondeu ${r.status}`)
  const itens = (await r.json()) as Array<{ id: string; nome: string }>
  return { fonte: 'api', itens }

  // (B) DB externo (Postgres) — descomente o import de `sql` no topo e troque o
  // corpo por:
  //   const itens = await sql<Array<{ id: string; nome: string }>>`
  //     select id, nome from itens where nome ilike ${'%' + (body.termo ?? '') + '%'} limit 50
  //   `
  //   return { fonte: 'db', itens }
  // A connection string vem de GIA_SERVER_DATABASE_URL (env). Adicione-a aos
  // secrets abaixo.
})

/**
 * Declara o que o handler PRECISA. O `gia install` mostra esses nomes pro time
 * GIA configurar na Edge Function (secrets). Em dev, os mesmos nomes vêm do `.env`.
 * (Para o caminho DB, adicione `'GIA_SERVER_DATABASE_URL'`.)
 */
export const config = { secrets: ['EXEMPLO_API_URL', 'EXEMPLO_API_KEY'] }
