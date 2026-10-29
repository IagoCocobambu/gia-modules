import { defineHandler } from '@gia-cb/sdk/server'

// Lojas que o usuário pode validar: Empresas do escopo dele que têm vínculo com a
// BI do Simphony (integração BIAPI). Sem esse vínculo não há de onde ler as contas.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Loja {
  empresaId: number
  nome: string
  ativo: boolean
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('validacao-fiscal.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  return (await ctx.empresas())
    .filter((e) => escopo.all || escopo.empresaIds.includes(e.id))
    .filter((e) => e.locRefs.BIAPI)
    .map((e) => ({ empresaId: e.id, nome: e.nome, ativo: e.ativo }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
