import { defineHandler } from '@gia-cb/sdk/server'

// Lojas que o usuário pode consultar: as Empresas do escopo dele com CNPJ
// (`tipoRegistro === 'empresa'`) que têm o código da loja na API de pagamentos.
// Igual ao legado, que listava só as lojas com integração cadastrada: loja sem o
// código não teria o que pesquisar.
//
// O código (`loc_ref` da API, ex.: "17. CB R") sai do vínculo da Empresa com a BI
// do Simphony (`locRefs.BIAPI`) e, na falta, da integração TS2 — a que o legado
// lia de `gia.empresas_integracoes`.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `codigoDaLoja`
// se repete em pagamentos.ts de propósito.

interface Loja {
  empresaId: number
  nome: string
  ativo: boolean
}

/** `loc_ref` da API de pagamentos: o vínculo BIAPI, ou o TS2 na falta dele. */
function codigoDaLoja(e: { locRefs: Record<string, string> }): string | null {
  const ref = (e.locRefs?.BIAPI ?? e.locRefs?.TS2 ?? '').trim().toLowerCase()
  return ref === '' ? null : ref
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('pagamento-echeck.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  const lojas: Loja[] = []
  for (const e of await ctx.empresas()) {
    if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
    if (e.tipoRegistro !== 'empresa' || !codigoDaLoja(e)) continue
    lojas.push({ empresaId: e.id, nome: e.nome, ativo: e.ativo })
  }
  return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
