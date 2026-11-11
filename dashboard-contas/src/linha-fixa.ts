import type { ReactNode } from 'react'
import type { ColumnDef } from '@gia-cb/ui'

// A LINHA FIXA no topo da grade — o `summaryRow` do `DataReport`, usado aqui
// para manter o **1 FATURAMENTO** à vista enquanto se rola a tabela.
//
// ── POR QUE FIXAR JUSTO ESSA LINHA ──────────────────────────────────────────
//
// O "%" de toda linha do plano é sobre o faturamento. Descendo até os custos ou
// os indicadores, o faturamento sai da tela e sobra o percentual sem o número
// que é o denominador dele (pedido do Davi Nascimento, 24/09/2026: "junto com o
// cabeçalho, ficar travada também a linha de faturamento").
//
// ── COMO ELA SE MONTA ───────────────────────────────────────────────────────
//
// A grade fixa COLUNAS por `columnPinning`, mas não fixa linhas: o que ela tem é
// o `summaryRow`, um mapa `columnId → conteúdo` desenhado logo abaixo do
// cabeçalho, que não rola. Montar esse mapa à mão significaria escrever de novo
// cada célula de cada modo das duas abas — e as duas têm muitos modos.
//
// Em vez disso, esta função CHAMA O PRÓPRIO `cell` de cada coluna com a linha
// alvo. O que a linha fixa mostra é, por construção, o mesmo que ela mostraria
// no corpo da tabela: coluna nova, modo novo ou formato novo aparecem lá sem
// ninguém lembrar de mexer aqui.
//
// ── ☠️ O QUE ISTO SUPÕE ─────────────────────────────────────────────────────
//
// Que os `cell` destas grades leiam APENAS `row.original` do contexto que o
// TanStack passa. É verdade em todas as células das abas Plano de contas e
// Comparativos — elas recebem a linha e desenham. Se alguma passar a usar outra
// coisa (o índice da linha, a tabela, o estado de seleção), ela quebra aqui, e o
// sintoma é erro na linha fixa e não na grade.
//
// A linha alvo continua no corpo da tabela, no lugar dela. Ou seja: com a
// rolagem no topo, o faturamento aparece duas vezes — a linha fixa e a linha de
// verdade, logo abaixo. É o preço de não ter congelamento de linha de verdade na
// SDK, e as duas se distinguem porque o `summaryRow` tem fundo próprio.

/** O contexto mínimo que as células destas grades leem. */
interface ContextoDaCelula<T> {
  row: { original: T }
}

/**
 * O mapa `columnId → conteúdo` de UMA linha, chamando os `cell` das colunas.
 *
 * Desce nos grupos (`columns`) até as folhas, que são as que o `summaryRow`
 * endereça. Coluna sem `cell` — espaçador, cabeçalho de grupo — fica de fora, e
 * o `DataReport` desenha vazio.
 */
export function celulasDaLinha<T>(
  colunas: readonly ColumnDef<T, unknown>[],
  alvo: T
): Partial<Record<string, ReactNode>> {
  const saida: Partial<Record<string, ReactNode>> = {}
  const visitar = (cols: readonly ColumnDef<T, unknown>[]) => {
    for (const col of cols) {
      const filhas = (col as { columns?: ColumnDef<T, unknown>[] }).columns
      if (filhas?.length) {
        visitar(filhas)
        continue
      }
      const id = col.id ?? (col as { accessorKey?: string }).accessorKey
      if (!id || typeof col.cell !== 'function') continue
      saida[id] = (col.cell as (ctx: ContextoDaCelula<T>) => ReactNode)({ row: { original: alvo } })
    }
  }
  visitar(colunas)
  return saida
}
