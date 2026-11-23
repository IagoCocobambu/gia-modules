import { nomeArquivoExport } from '@gia-cb/ui'
import { dataHoraSp, diaArquivo, formatData, NOME_MODULO } from './helpers'
import { ROTULO_SITUACAO, situacao } from './regras'
import type { Mesa } from './types'

interface Cabecalho {
  lojaNome: string
  rvcNome: string
  dia: string
  consultadoEm: string
  temBuffet: boolean
  /** Nome do chip ligado ("Divergentes") ou da busca; `null` = todas as mesas. */
  filtro: string | null
  /** Mesas exportadas × mesas do salão. */
  total: number
}

/**
 * Baixa as mesas da tela em Excel (.xlsx), com o filtro do chip e a busca aplicados
 * (o subtítulo diz qual estava ligado). O `exceljs` entra por `import()` dinâmico,
 * fora do bundle inicial — o mesmo jeito do `dashboard-simphony`.
 */
export async function exportarMesas(mesas: Mesa[], cab: Cabecalho): Promise<void> {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  const ws = wb.addWorksheet('Mesas')

  const colunas = [
    { titulo: 'Mesa', largura: 12 },
    { titulo: 'Grupo', largura: 10 },
    { titulo: 'Pessoas', largura: 10 },
    { titulo: 'Couvert artístico', largura: 18 },
    ...(cab.temBuffet ? [{ titulo: 'Buffet', largura: 10 }] : []),
    { titulo: 'Situação', largura: 18 },
  ]

  ws.addRow([`${NOME_MODULO} · ${cab.lojaNome} · ${cab.rvcNome}`]).font = {
    bold: true,
    size: 14,
  }
  const filtro = cab.filtro
    ? ` · filtro: ${cab.filtro} (${mesas.length.toLocaleString('pt-BR')} de ${cab.total.toLocaleString('pt-BR')} mesas)`
    : ` · ${cab.total.toLocaleString('pt-BR')} mesas abertas`
  ws.addRow([
    `Dia de negócio ${formatData(cab.dia)} · mesas de ${dataHoraSp(new Date(cab.consultadoEm))}${filtro}`,
  ]).font = { color: { argb: 'FF6B7280' } }
  ws.addRow([])

  const titulo = ws.addRow(colunas.map((c) => c.titulo))
  titulo.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  titulo.eachCell((cel) => {
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3783FF' } }
  })
  for (const m of mesas) {
    ws.addRow([
      m.mesa,
      m.grupo ?? '',
      m.pessoas,
      m.couvert,
      ...(cab.temBuffet ? [m.buffet] : []),
      ROTULO_SITUACAO[situacao(m, cab.temBuffet)],
    ])
  }
  colunas.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.largura
  })
  ws.views = [{ state: 'frozen', ySplit: 4 }]
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: colunas.length } }

  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivoExport({
    modulo: NOME_MODULO,
    detalhe: `${cab.lojaNome} - ${cab.rvcNome}`,
    periodo: diaArquivo(cab.dia),
    extensao: 'xlsx',
  })
  a.click()
  URL.revokeObjectURL(url)
}
