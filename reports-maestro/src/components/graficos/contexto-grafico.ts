import { createContext, useContext } from 'react'

// O que o cartão de gráfico conta aos gráficos de dentro dele. Copiado do
// Dashboard do Plano de Contas (`dashboard-contas`).
//
// Mora fora de `MolduraGrafico.tsx` porque o ESLint do host exige que arquivo de
// componente exporte só componente (`react-refresh`).

/** O cartão está em tela cheia. Quem fornece é a `MolduraGrafico`. */
export const TelaCheiaDoGrafico = createContext(false)

/**
 * Quantos itens por página — TODOS, em tela cheia.
 *
 * A paginação existe porque a Visão geral já rola como página, e um gráfico que
 * rolasse por dentro dela seria rolagem dentro de rolagem (ver
 * `PaginacaoGrafico`). Em tela cheia o cartão É a página: a lista inteira cabe
 * nele e rola, sem botões — o mesmo arranjo do Dashboard de RH.
 */
export function usePorPagina(porPagina: number): number {
  return useContext(TelaCheiaDoGrafico) ? Number.POSITIVE_INFINITY : porPagina
}

/**
 * A altura do CORPO do cartão, em pixels — o espaço que sobra depois do
 * cabeçalho e do recuo. Zero enquanto não foi medido. Quem fornece é a
 * `MolduraGrafico`.
 */
export const AlturaDoCorpoDoGrafico = createContext(0)

/**
 * O que a paginação ocupa embaixo do gráfico: 37 px da faixa (borda + `pt-2` +
 * botão de 28) mais os 8 px do `gap-2` que a separa do desenho. Medido em
 * 23/09/2026.
 */
const ESPACO_DA_PAGINACAO = 45

/**
 * Quantas linhas de `alturaDaLinha` px cabem no corpo do cartão. Zero = ainda
 * sem medida, e quem chama fica com o próprio padrão.
 *
 * ── ☠️ SÓ PARA CARTÃO COM ALTURA DEFINIDA ───────────────────────────────────
 *
 * O corpo de um cartão da Visão geral não tem altura própria: ele é do tamanho
 * do que está dentro dele. Contar linhas por ali seria uma cobra mordendo o
 * rabo — menos linhas, corpo menor, menos linhas ainda —, e um arredondamento
 * para baixo bastaria para comer uma barra a cada medida. Por isso só o gráfico
 * que pede `preencherAltura` usa este número, e só as abas em que o cartão
 * recebe a altura de fora (a Por índice) pedem.
 *
 * O que isto conserta: até 23/09/2026 a aba Por índice media o elemento de FORA
 * do cartão e descontava 132 px de chute. O cabeçalho, o recuo e a paginação
 * somam 154, então a faixa de páginas era desenhada 17 px ABAIXO da borda do
 * cartão (relato do Davi, com a rede inteira em 1500×950).
 */
export function useLinhasQueCabem(alturaDaLinha: number, reserva = 0): number {
  const corpo = useContext(AlturaDoCorpoDoGrafico)
  if (corpo <= 0) return 0
  return Math.floor((corpo - ESPACO_DA_PAGINACAO - reserva) / alturaDaLinha)
}

/**
 * Os números de um cartão em linhas e colunas — a tabela da tela cheia, que é a
 * versão acessível de cada gráfico.
 */
export interface TabelaDeDados {
  colunas: Array<{ titulo: string; numerica?: boolean }>
  linhas: string[][]
}
