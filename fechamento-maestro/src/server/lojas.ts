import { defineHandler } from '@gia-cb/sdk/server'

// Lojas que o usuário pode consultar: todas as Empresas do escopo dele com
// `tipoRegistro === 'empresa'` (a loja, com CNPJ). Propriedades (escritório,
// centro de distribuição — sem CNPJ próprio) ficam de fora.
//
// O número da loja (`loc_ref` da API de delivery) vem primeiro do vínculo com a
// BI do Simphony (`locRefs.BIAPI`) e, na falta, do nome da Empresa
// ("01.CB GOIANIA"). Loja sem número aparece mesmo assim, com `locRef: null` —
// a pesquisa dela devolve um aviso claro (ver fechamento.ts).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaLoja`
// se repete em fechamento.ts de propósito.

interface Loja {
  empresaId: number
  nome: string
  locRef: string | null
  ativo: boolean
}

/**
 * Número da loja com 2 dígitos — o `loc_ref` da API. Sai primeiro do vínculo com a
 * BI do Simphony (`locRefs.BIAPI` começa sempre pelo número: "01 CB Go", "17. CB R",
 * "13CBMa", "65"); o nome da Empresa ("01.CB GOIANIA") fica de reserva.
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '') ?? /^\s*(\d{1,4})\s*\./.exec(e.nome)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('fechamento-maestro.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  const lojas: Loja[] = []
  for (const e of await ctx.empresas()) {
    if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
    if (e.tipoRegistro !== 'empresa') continue
    lojas.push({ empresaId: e.id, nome: e.nome, locRef: numeroDaLoja(e), ativo: e.ativo })
  }
  return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
