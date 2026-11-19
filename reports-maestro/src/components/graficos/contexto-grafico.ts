// O que o cartão de gráfico passa adiante: a tabela da tela cheia. Copiado do
// Dashboard do Plano de Contas (`dashboard-contas`), sem a paginação (o Reports
// Maestro não pagina gráfico) — os contextos de tela cheia e de altura do corpo
// só serviam a ela e saíram na 0.3.2.
//
// Mora fora de `MolduraGrafico.tsx` porque o ESLint do host exige que arquivo de
// componente exporte só componente (`react-refresh`).

/**
 * Os números de um cartão em linhas e colunas — a tabela da tela cheia, que é a
 * versão acessível de cada gráfico.
 */
export interface TabelaDeDados {
  colunas: Array<{ titulo: string; numerica?: boolean }>
  linhas: string[][]
}
