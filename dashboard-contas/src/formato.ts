import type { Unidade } from './catalogo'

// Formatação dos números do painel.
//
// ── OS FORMATADORES SÃO CRIADOS UMA VEZ ─────────────────────────────────────
//
// `toLocaleString('pt-BR', {...})` monta um `Intl.NumberFormat` NOVO a cada
// chamada, e isso custa. Na aba Comparativos com a rede inteira são dezenas de
// milhares de células — no Dashboard de RH, a mesma conta levou ~4 s para montar
// a aba antes de os formatadores irem para o módulo (medido em 14/09/2026).

const FMT_INTEIRO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const FMT_DUAS = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const FMT_UMA = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const FMT_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const TRACO = '—'

function ok(v: number | null | undefined): v is number {
  return v != null && Number.isFinite(v)
}

/**
 * O menos TIPOGRÁFICO no lugar do hífen que o `Intl` escreve. Os valores com
 * sinal (`comSinal`) já usavam o "−"; os sem sinal saíam com hífen, e a mesma
 * linha do cartão da loja mostrava "-8,35%" ao lado de "−0,21 p.p."
 * (29/09/2026). O hífen é mais curto e mais alto: lado a lado, parece outro
 * sinal.
 */
function menos(texto: string): string {
  return texto.startsWith('-') ? `−${texto.slice(1)}` : texto
}

export function fmtInteiro(v: number | null | undefined): string {
  return ok(v) ? menos(FMT_INTEIRO.format(v)) : TRACO
}

/** `R$ 1.234.567,89` — o valor por extenso, com centavos. */
export function fmtBRL(v: number | null | undefined): string {
  return ok(v) ? menos(FMT_BRL.format(v)) : TRACO
}

/**
 * `1.234.567,89` — o valor numa célula de grade, cuja coluna já diz "R$". O
 * símbolo repetido em cada célula tomaria ~20 px de uma grade que rola de lado.
 */
export function fmtValor(v: number | null | undefined): string {
  return ok(v) ? menos(FMT_DUAS.format(v)) : TRACO
}

/**
 * Moeda abreviada — `R$ 17,1 mil`, `R$ 1,7 mi`. É a forma do valor de um CARTÃO:
 * por extenso ele estoura e é cortado no meio, e meio número é pior que número
 * arredondado. Nas grades e na exportação continua por extenso.
 */
export function fmtBRLCompacto(v: number | null | undefined): string {
  if (!ok(v)) return TRACO
  // O sinal vem antes do símbolo, como no valor por extenso: "−R$ 1,2 mi".
  return v < 0 ? `−R$ ${fmtCompacto(-v)}` : `R$ ${fmtCompacto(v)}`
}

/**
 * O mesmo número abreviado SEM o símbolo — `17,1 mil`, `569,74` — para a célula
 * cuja coluna já diz "R$". Não tire o símbolo do `fmtBRLCompacto` com
 * `.replace('R$ ', '')`: abaixo de mil o `Intl` separa o símbolo com espaço
 * inseparável e o replace não acha nada (visto em 18/09/2026: "+R$ 569,74" no
 * meio de uma coluna de "+75,6 mil").
 *
 * O "mil" começa em MIL, e não em 10 mil. Com o corte em 10 mil, a mesma lista
 * misturava as duas formas — "R$ 11,7 mil" e logo abaixo "R$ 9.641,52", com
 * centavos, no ranking do dinheiro e na composição do faturamento (29/09/2026).
 * Centavo só aparece abaixo de mil, onde ele ainda diz alguma coisa.
 */
export function fmtCompacto(v: number | null | undefined): string {
  if (!ok(v)) return TRACO
  const abs = Math.abs(v)
  // 999.960 arredonda para "1.000 mil": a partir dali já é "1 mi".
  if (abs >= 999_950) return menos(`${FMT_UMA.format(v / 1_000_000)} mi`)
  if (abs >= 1_000) return menos(`${FMT_UMA.format(v / 1_000)} mil`)
  return menos(FMT_DUAS.format(v))
}

/** Fração → `25,30%`. */
export function fmtPct(v: number | null | undefined): string {
  return ok(v) ? menos(`${FMT_DUAS.format(v * 100)}%`) : TRACO
}

/** Um múltiplo, como a receita de vinhos sobre a despesa de vinhos: `7,57`. */
export function fmtMult(v: number | null | undefined): string {
  return ok(v) ? menos(FMT_DUAS.format(v)) : TRACO
}

/**
 * `34,5 dias` — com UMA casa, e não arredondado ao dia inteiro.
 *
 * A diferença do DIO já sai com uma casa (`fmtDiferenca`): com o valor inteiro,
 * "35 dias" contra "+1,7" não fechava na conta de quem lê (medido em
 * 22/09/2026, DIO da rede de 34,5 dias).
 */
export function fmtDias(v: number | null | undefined): string {
  if (!ok(v)) return TRACO
  return `${menos(FMT_UMA.format(v))} ${v === 1 ? 'dia' : 'dias'}`
}

/** O valor de uma conta pela unidade dela. */
export function fmtConta(unidade: Unidade | 'dias', v: number | null | undefined): string {
  if (unidade === 'pct') return fmtPct(v)
  if (unidade === 'mult') return fmtMult(v)
  if (unidade === 'dias') return fmtDias(v)
  return fmtValor(v)
}

/** Com sinal: `+1,70` / `−0,40`. O menos é o sinal tipográfico, não o hífen. */
function comSinal(v: number, texto: string): string {
  if (v > 0) return `+${texto}`
  if (v < 0) return `−${texto.replace('-', '')}`
  return texto
}

/**
 * Diferença entre dois percentuais, em pontos: 0,017 → `+1,70 p.p.`. Escrever
 * "+1,70%" confundiria com a variação relativa.
 */
export function fmtPontos(v: number | null | undefined, comUnidade = true): string {
  if (!ok(v)) return TRACO
  const t = comSinal(v, FMT_DUAS.format(Math.abs(v * 100)))
  return comUnidade ? `${t} p.p.` : t
}

/** Variação relativa: 0,0745 → `+7,5%`. */
export function fmtVariacao(v: number | null | undefined): string {
  if (!ok(v)) return TRACO
  return `${comSinal(v, FMT_UMA.format(Math.abs(v * 100)))}%`
}

/** Diferença na unidade da conta — p.p. nos percentuais, dias no DIO, valor no resto. */
export function fmtDiferenca(unidade: Unidade | 'dias', v: number | null | undefined): string {
  if (!ok(v)) return TRACO
  if (unidade === 'pct') return fmtPontos(v, false)
  if (unidade === 'dias') return comSinal(v, FMT_UMA.format(Math.abs(v)))
  return comSinal(v, FMT_DUAS.format(Math.abs(v)))
}

/**
 * Plural explícito. Português não pluraliza por concatenação — `${s}s` produz
 * "1 alteracaos" e coisas piores.
 */
export function plural(n: number, singular: string, plurais: string): string {
  return `${FMT_INTEIRO.format(n)} ${n === 1 ? singular : plurais}`
}
