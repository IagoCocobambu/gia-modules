import { defineHandler } from '@gia-cb/sdk/server'

// ─── Handler SERVER-SIDE — lista de países de uma API PÚBLICA ───────────────
// Consome a API do Banco Mundial (https://api.worldbank.org) — sem auth, sem
// segredo, e MUITO estável (infra governamental). Roda no Node em dev (gia dev)
// e vira Edge Function no deploy (gia pack gera). É o exemplo mínimo de
// "consumir uma fonte externa e devolver JSON pronto".
//
// REGRA: só `fetch` + helpers de @gia-cb/sdk/server. Nada de outros imports.

interface Pais {
  id: string
  nome: string
  regiao: string
  capital: string
  renda: string
  bandeira: string
}

// Shape (parcial) do país no World Bank. A resposta é [meta, País[]].
interface WbCountry {
  id: string
  iso2Code: string
  name: string
  capitalCity: string
  region?: { value?: string }
  incomeLevel?: { value?: string }
}

/** Emoji da bandeira a partir do ISO-2 (letras → regional indicator symbols). */
function bandeiraDe(iso2: string): string {
  if (!/^[A-Za-z]{2}$/.test(iso2)) return ''
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export default defineHandler<Record<string, never>, { paises: Pais[] }>(async (ctx) => {
  // Autorização SERVER-SIDE (princípio nº 1 do portal): a UI esconder a tela
  // não protege o endpoint — todo handler revalida a permissão aqui. Em dev a
  // persona vem do painel do dev-shell; em prod, do cache real do portal.
  await ctx.requirePermission('couvert.ler')

  const r = await fetch('https://api.worldbank.org/v2/country?format=json&per_page=300')
  if (!r.ok) throw new Error(`World Bank respondeu ${r.status}`)

  const json = (await r.json()) as unknown
  // A resposta é [meta, País[]]. Pegamos a segunda posição.
  const raw = (Array.isArray(json) && Array.isArray(json[1]) ? json[1] : []) as WbCountry[]

  const paises: Pais[] = raw
    // O World Bank inclui AGREGADOS (regiões, blocos) — mantemos só países reais
    // (com região != 'Aggregates' e com capital).
    .filter((c) => c.region?.value && c.region.value !== 'Aggregates' && c.capitalCity)
    .map((c) => ({
      id: c.id,
      nome: c.name,
      regiao: c.region?.value?.trim() ?? '—',
      capital: c.capitalCity,
      renda: c.incomeLevel?.value ?? '—',
      bandeira: bandeiraDe(c.iso2Code),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return { paises }
})

// Sem segredo — a API do World Bank é pública. (Se sua API precisar de chave,
// declare aqui e leia com `env('MINHA_CHAVE')`; ver dados-externos.md.)
export const config = { secrets: [] }
