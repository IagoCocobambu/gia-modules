import { defineHandler } from '@gia-cb/sdk/server'

// Lojas do seletor: TODAS as operações do escopo do usuário (`ctx.operacoes()`),
// como no Fechamento iFood Diário. Exceção combinada para os módulos do iFood — os
// demais buscam por Empresa. Uma Empresa pode ter mais de uma operação (ex.:
// `08 cb` e `08 vst` em Teresina).
//
// - `ref`: o `operacao_ref` — a chave que a consulta manda ao servidor;
// - `locRef`: o número da loja tirado do começo do ref ("54 cb" → "54"), chave do
//   fechamento no banco do Maestro e do borderô;
// - `temIfood`: há merchant do iFood — o da Empresa dona da operação
//   (`locRefs.IFOOD`), ou o próprio das operações em `OPERACOES_IFOOD_PROPRIO`.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaOperacao`,
// `chaveOperacao` e `OPERACOES_IFOOD_PROPRIO` se repetem nos outros handlers de propósito.

interface Loja {
  ref: string
  nome: string
  empresaId: number
  locRef: string | null
  temIfood: boolean
  ativo: boolean
}

/**
 * Operações que dividem o número de loja com outra e têm merchant próprio no iFood
 * (Vasto na loja do CB). O SDK não tem vínculo iFood por operação (só por Empresa),
 * então o merchant destas fica aqui — PROVISÓRIO até o SDK expor `locRefs` em
 * `GiaOperacao`. Mesma tabela do Fechamento iFood Diário (manter as duas iguais).
 */
const OPERACOES_IFOOD_PROPRIO: Record<string, { merchant: string }> = {
  '08 vst': { merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
  '17 vst': { merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
  '25 vst': { merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
  '69 vst': { merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
  '86 vst': { merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
}

/** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
function chaveOperacao(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Número da loja com 2 dígitos a partir do `operacao_ref` ("02 cb" → "02"): a chave
 * do fechamento no banco do Maestro (`loc_ref`, como no legado) e o
 * `property_number` do borderô. "08 cb" e "08 vst" dividem o mesmo fechamento —
 * o legado também juntava.
 */
function numeroDaOperacao(ref: string): string | null {
  const m = /^\s*(\d{1,4})/.exec(ref)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

export default defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-mensal.ler')
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
