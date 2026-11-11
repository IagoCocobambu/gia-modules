import { nomeArquivoExport } from '@gia-cb/ui'

// O nome dos arquivos que o usuário baixa: `GIA - [módulo] - [detalhe] -
// [período].xlsx`, montado pelo `nomeArquivoExport` da `@gia-cb/ui`.
//
// ── TUDO SAI EM EXCEL ───────────────────────────────────────────────────────
//
// Decisão do João (22/09/2026): nenhuma tela do painel exporta CSV. As grades
// deixaram de usar o `exportFileName` do `DataReport` (que gera CSV e nomeia o
// arquivo sozinho) e passaram a baixar `.xlsx` pelo mesmo caminho dos cartões de
// gráfico — `BotaoExportar` → `baixarPlanilha`.
//
// Com o CSV saiu também o contorno da extensão dobrada: o `exportFileName` pedia
// o nome SEM extensão e o `nomeArquivoExport` EXIGE uma e a devolve dentro do
// nome, o que produzia `… - 2026-08.csv.csv`. Aqui quem escreve o arquivo é o
// módulo, então a extensão fica no nome e pronto.

/**
 * O nome do módulo no arquivo. "Dashboard de Contas", como no menu: o módulo de
 * LANÇAMENTO (Planos > Plano de Contas) exporta com o outro nome, e os dois
 * arquivos cairiam lado a lado na pasta de downloads sem dizer qual é qual.
 */
const MODULO = 'Dashboard de Contas'

/** O nome da planilha, com a extensão dentro. */
export function nomeDaPlanilha(detalhe: string, periodo?: string | null): string {
  return nomeArquivoExport({ modulo: MODULO, detalhe, periodo, extensao: 'xlsx' })
}
