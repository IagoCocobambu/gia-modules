import { defineHandler } from '@gia-cb/sdk/server'

// Lojas que o usuário pode consultar: Empresas do escopo dele cujo nome começa com
// o número da loja ("01.CB GOIANIA"). É desse número que sai o `loc_ref` da API de
// delivery — mesma regra do legado (ExtrairNumeroLoja sobre o nome_fantasia).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaLoja`
// se repete em pedidos.ts de propósito.

interface Loja {
  empresaId: number
  nome: string
  locRef: string
  ativo: boolean
}

/** "01.CB GOIANIA" → "01"; "48. VASTO SUL" → "48". Sem número antes do ponto → null. */
function numeroDaLoja(nome: string): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(nome)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('reports-maestro.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  const lojas: Loja[] = []
  for (const e of await ctx.empresas()) {
    if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
    const locRef = numeroDaLoja(e.nome)
    if (locRef) lojas.push({ empresaId: e.id, nome: e.nome, locRef, ativo: e.ativo })
  }
  return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
