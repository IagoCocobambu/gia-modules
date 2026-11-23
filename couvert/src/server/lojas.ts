import { defineHandler } from '@gia-cb/sdk/server'

// Lojas do seletor: as Empresas do escopo do usuário que são loja, ativas e com
// vínculo com a BI do Simphony (`locRefs.BIAPI`). Cada loja vem com os RVCs (salões)
// de couvert, na ordem do cadastro (o 1º é o padrão), de `empresa.couvert`, a configuração de couvert do cadastro de Empresas do portal
// (SDK alpha.72). No legado isso vinha de `gia.empresas.couv_*`.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Loja {
  empresaId: number
  nome: string
  rvcs: Array<{ numero: number; nome: string }>
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('couvert.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  return (await ctx.empresas())
    .filter(
      (e) =>
        (escopo.all || escopo.empresaIds.includes(e.id)) &&
        e.tipoRegistro === 'empresa' &&
        e.ativo &&
        Boolean(e.locRefs?.BIAPI?.trim())
    )
    .map((e) => ({
      empresaId: e.id,
      nome: e.nome,
      rvcs: (e.couvert?.rvcs ?? []).map((r) => ({ numero: r.numero, nome: r.nome })),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
