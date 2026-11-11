import type { Direcao, Unidade } from './catalogo'
import { aFavor } from './comparacao'
import { fmtBRLCompacto, fmtConta, fmtDiferenca, fmtPct, fmtPontos, TRACO } from './formato'

// Como a aba Análises adicionais escreve e colore os números — o cartão da loja,
// o resultado e o plano de contas inteiro da loja usam as mesmas regras.
//
// Mora fora dos componentes porque o ESLint do host exige que arquivo de
// componente exporte só componente (`react-refresh`).

/** Verde a favor, vermelho contra, cinza parado — pela direção da linha. */
export function classeDoGap(v: number | null, direcao: Direcao, limite = 0.00005): string {
  if (v == null || Math.abs(v) < limite) return 'text-muted-foreground'
  const favor = aFavor(v, direcao)
  return favor === true
    ? 'text-success'
    : favor === false
      ? 'text-destructive'
      : 'text-muted-foreground'
}

/** "+R$ 75 mil" / "−R$ 12 mil" — o impacto e o gap em reais, com sinal. */
export function reaisComSinal(v: number | null): string {
  if (v == null) return TRACO
  const sinal = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${sinal}${fmtBRLCompacto(Math.abs(v))}`
}

/** Abaixo disto o impacto é ruído de centavos e aparece "—". */
export const IMPACTO_MINIMO = 500

export function textoDoImpacto(v: number | null): string {
  return v != null && Math.abs(v) < IMPACTO_MINIMO ? TRACO : reaisComSinal(v)
}

/** Vermelho = a loja gasta a mais que a média; verde = já economiza. */
export function classeDoImpacto(v: number | null): string {
  if (v == null || Math.abs(v) < IMPACTO_MINIMO) return 'text-muted-foreground'
  return v > 0 ? 'text-destructive' : 'text-success'
}

/** O "%" de uma linha na unidade dela: percentual, múltiplo ou dias. */
export function textoDaMedida(pct: number | null, unidade: Unidade | 'dias'): string {
  return unidade === 'pct' ? fmtPct(pct) : fmtConta(unidade, pct)
}

/**
 * Um gap na unidade da linha: "+0,58 p.p." no percentual, a diferença no resto.
 * Abaixo da casa exibida ele é zero: uma conta sem movimento saía "−0,00 p.p.",
 * sinal sem número (29/09/2026).
 */
export function textoDoGap(v: number | null, unidade: Unidade | 'dias'): string {
  const limite = unidade === 'pct' ? 0.00005 : 0.005
  const r = v != null && Math.abs(v) < limite ? 0 : v
  return unidade === 'pct' ? fmtPontos(r) : fmtDiferenca(unidade, r)
}
