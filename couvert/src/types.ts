// Tipos do domínio — lista de países vinda de uma API pública (Banco Mundial).
// O shape é o que o handler `src/server/paises.ts` devolve (já mapeado do JSON
// cru da API).

export interface CouvertPais {
  /** Código ISO-3 (ex: BRA) — chave estável de cada país. */
  id: string
  nome: string
  regiao: string
  capital: string
  /** Nível de renda (classificação do Banco Mundial). */
  renda: string
  /** Emoji da bandeira (ex: 🇧🇷), derivado do ISO-2 no handler. */
  bandeira: string
}
