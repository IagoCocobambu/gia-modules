import { defineHandler } from '@gia-cb/sdk/server'

// Lojas do seletor: TODAS as operações do escopo do usuário (`ctx.operacoes()`).
// Exceção combinada para este módulo — os demais buscam por Empresa. Uma Empresa
// pode ter mais de uma operação (ex.: `08 cb` e `08 vst` em Teresina).
//
// O número da loja (`loc_ref` da API de delivery do DW) sai do começo do
// `operacao_ref` ("54 cb" → "54"). O merchant do iFood vem da Empresa dona da
// operação (`locRefs.IFOOD`), menos nas operações com canal próprio (Vasto na loja do
// CB), que têm o merchant em `OPERACOES_IFOOD_PROPRIO`. `temIfood` diz se ele existe.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaOperacao`,
// `chaveOperacao` e `OPERACOES_IFOOD_PROPRIO` se repetem em pedidos.ts e vendas.ts de propósito.

interface Loja {
  /** `operacao_ref` — a chave que a pesquisa manda ao servidor. */
  ref: string
  nome: string
  empresaId: number
  locRef: string | null
  temIfood: boolean
  ativo: boolean
}

/**
 * Operações que dividem o número de loja com outra e têm canal e merchant próprios no
 * iFood. O DW devolve as duas juntas no mesmo `loc_ref` e as separa pela `origem` do
 * pedido: "iFood" é a operação principal, "iFood Vasto" a do Vasto. O SDK não tem
 * vínculo iFood por operação (só por Empresa, um por Empresa), então o merchant destas
 * fica aqui — PROVISÓRIO até o SDK expor `locRefs` em `GiaOperacao`. Operação nova
 * nessa situação precisa entrar nesta tabela (e nas de pedidos.ts e vendas.ts).
 * Merchants: lista `GET /merchant/v1.0/merchants` da conta iFood da Coco Bambu.
 */
const OPERACOES_IFOOD_PROPRIO: Record<string, { canal: string; merchant: string }> = {
  '08 vst': { canal: 'iFood Vasto', merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
  '17 vst': { canal: 'iFood Vasto', merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
  '25 vst': { canal: 'iFood Vasto', merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
  '69 vst': { canal: 'iFood Vasto', merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
  '86 vst': { canal: 'iFood Vasto', merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
}

/** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
function chaveOperacao(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Número da loja com 2 dígitos — o `loc_ref` da API do DW ("54 cb" → "54"). */
function numeroDaOperacao(ref: string): string | null {
  const m = /^\s*(\d{1,4})/.exec(ref)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  // ctx.operacoes() já vem recortado pelo escopo do usuário.
  const [operacoes, empresas] = await Promise.all([ctx.operacoes(), ctx.empresas()])
  const merchant = new Map(empresas.map((e) => [e.id, e.locRefs?.IFOOD?.trim() || null]))
  return operacoes
    .map((o) => ({
      ref: o.ref,
      nome: o.nome,
      empresaId: o.empresaId,
      locRef: numeroDaOperacao(o.ref),
      temIfood: Boolean(
        OPERACOES_IFOOD_PROPRIO[chaveOperacao(o.ref)]?.merchant ?? merchant.get(o.empresaId)
      ),
      ativo: o.ativo,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
})

export const config = { secrets: [] }
