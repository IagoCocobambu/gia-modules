import { defineHandler } from '@gia-cb/sdk/server'

// Lojas do seletor: as Empresas do escopo do usuário com `tipoRegistro === 'empresa'`
// (a loja, com CNPJ), como nos outros módulos. A pesquisa junta TODAS as operações da
// Empresa: os pedidos iFood do DW do número da loja e as vendas de todos os restaurantes
// do iFood da loja (vínculos IFOOD das operações, no cadastro do portal).
//
// O número da loja (`loc_ref` do DW) vem do nome da Empresa ("01.CB GOIANIA") e, na
// falta, do vínculo BIAPI (`locRefs.BIAPI`). Loja sem número aparece mesmo assim,
// com `locRef: null` — a pesquisa dela devolve um aviso claro.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `restaurantesDaLoja`
// se repete em vendas.ts de propósito.

interface Restaurante {
  /** `operacao_ref` da operação dona do restaurante (ex.: "17 cbx"). */
  operacao: string
  /** UUID do restaurante (merchant) no iFood. */
  merchant: string
}

interface Loja {
  empresaId: number
  nome: string
  locRef: string | null
  /** Restaurantes do iFood da loja; vazio = loja sem integração com o iFood. */
  restaurantes: Restaurante[]
  ativo: boolean
}

/**
 * Número da loja com 2 dígitos — o `loc_ref` do DW.
 * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
 * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
 * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
 * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/**
 * Restaurantes do iFood da loja: os vínculos IFOOD ativos de todas as operações da
 * Empresa (cb, cbx, pzcb, dani, vst, adgcb…), do cadastro do portal. Uma operação pode
 * ter mais de um vínculo IFOOD. `locRef` = UUID do restaurante (merchant) no iFood.
 * A MESMA função está em `vendas.ts` (handler auto-contido): mude as duas.
 */
function restaurantesDaLoja(
  operacoes: { ref: string; empresaId: number; integracoes: { tipo: string; locRef: string }[] }[],
  empresaId: number
): Restaurante[] {
  const vistos = new Set<string>()
  return operacoes
    .filter((o) => o.empresaId === empresaId)
    .flatMap((o) =>
      (o.integracoes ?? [])
        .filter((i) => i.tipo === 'IFOOD' && i.locRef?.trim())
        .map((i) => ({ operacao: o.ref, merchant: i.locRef.trim().toLowerCase() }))
    )
    .filter((r) => !vistos.has(r.merchant) && Boolean(vistos.add(r.merchant)))
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
  // "ONDE" visível aqui e no gia validate.
  const escopo = await ctx.empresaScope()
  const operacoes = await ctx.operacoes()
  const lojas: Loja[] = []
  for (const e of await ctx.empresas()) {
    if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
    if (e.tipoRegistro !== 'empresa') continue
    const locRef = numeroDaLoja(e)
    lojas.push({
      empresaId: e.id,
      nome: e.nome,
      locRef,
      restaurantes: restaurantesDaLoja(operacoes, e.id),
      ativo: e.ativo,
    })
  }
  return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
