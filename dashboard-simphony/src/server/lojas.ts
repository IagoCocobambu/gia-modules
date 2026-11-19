import { defineHandler } from '@gia-cb/sdk/server'

// Lojas que o usuário pode consultar: as Empresas ATIVAS do escopo dele que têm o
// vínculo com a BI do Simphony (`locRefs.BIAPI`, ex.: "01 CB Go"). É o mesmo recorte
// do legado (`gia.empresas_integracoes` com tipo 'BIAPI' e Empresa ativa).
//
// O `locRef` NÃO vai para o navegador: a pesquisa manda só o `empresaId`, e o
// servidor busca o vínculo de novo (entrada de cálculo nunca vem do body).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Loja {
  empresaId: number
  nome: string
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('dashboard-simphony.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  const lojas: Loja[] = []
  for (const e of await ctx.empresas()) {
    if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
    if (!e.ativo || !e.locRefs?.BIAPI?.trim()) continue
    lojas.push({ empresaId: e.id, nome: e.nome })
  }
  return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
