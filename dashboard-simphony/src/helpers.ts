import type { Worksheet } from 'exceljs'
import { nomeArquivoExport } from '@gia-cb/ui'
import type { Consulta, DashboardTotais, Funcionario, ItemVendido } from './types'

/** Mesmo `label` do `module.ts` — vai no título e no nome do arquivo exportado. */
export const NOME_MODULO = 'Dashboard Simphony'

const FUSO_SP = 'America/Sao_Paulo'
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const INTEIRO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** Hoje em São Paulo, `YYYY-MM-DD`. */
export function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_SP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Data e hora de São Paulo, `DD/MM/AAAA, HH:MM`. */
export function dataHoraSp(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d)
}

/** `2026-11-18` → `18/11/2026`. */
export function dataBr(data: string): string {
  return data.split('-').reverse().join('/')
}

export function formatBRL(valor: number | null | undefined): string {
  return valor == null ? '—' : BRL.format(valor)
}

export function formatInteiro(valor: number | null | undefined): string {
  return valor == null ? '—' : INTEIRO.format(valor)
}

// ── Indicadores (barra de totais) ────────────────────────────────────────────

export type IdIndicador = keyof DashboardTotais

/**
 * Rótulo e explicação de cada indicador — a mesma explicação está na FAQ (no
 * celular não há dica). A ordem é a da barra.
 */
export const INDICADORES: { id: IdIndicador; rotulo: string; dica: string; moeda: boolean }[] = [
  {
    id: 'vendaLiquida',
    rotulo: 'venda líquida',
    dica: 'Venda líquida do dia na BI do Simphony, somando todos os centros de receita da loja',
    moeda: true,
  },
  {
    id: 'pessoas',
    rotulo: 'pessoas',
    dica: 'Quantidade de pessoas (clientes) atendidas no dia, informada nas contas',
    moeda: false,
  },
  {
    id: 'contas',
    rotulo: 'contas',
    dica: 'Quantidade de contas (checks) do dia',
    moeda: false,
  },
  {
    id: 'descontos',
    rotulo: 'descontos',
    dica: 'Total dos descontos dados nos itens no dia',
    moeda: true,
  },
  {
    id: 'estornos',
    rotulo: 'estornos',
    dica: 'Total dos itens estornados (void) depois de lançados na conta',
    moeda: true,
  },
  {
    id: 'correcoes',
    rotulo: 'cancelamentos',
    dica: 'Total das correções de erro: itens cancelados logo ao serem lançados, antes de a conta ser enviada',
    moeda: true,
  },
]

// ── Exportar (.xlsx) ─────────────────────────────────────────────────────────

type TipoColuna = 'texto' | 'inteiro' | 'moeda'

interface ColunaExport<T> {
  header: string
  largura: number
  tipo: TipoColuna
  valor: (linha: T) => string | number
  /** Soma na linha Total. */
  total?: boolean
}

const XLSX_LINHA_CABECALHO = 4
const XLSX_COR_CABECALHO = 'FFDBE9FF'
const XLSX_COR_SUBTITULO = 'FF6B7280'
const XLSX_FORMATO: Record<TipoColuna, string | undefined> = {
  texto: undefined,
  inteiro: '0',
  moeda: '"R$" #,##0.00;-"R$" #,##0.00',
}

/** Letra da coluna Excel (1 → A, 27 → AA). */
function letraColuna(n: number): string {
  let s = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26))
    s = String.fromCharCode(65 + ((x - 1) % 26)) + s
  return s
}

export const COLUNAS_ITENS: ColunaExport<ItemVendido>[] = [
  { header: 'Nº item', largura: 10, tipo: 'inteiro', valor: (i) => i.numero },
  { header: 'Item', largura: 40, tipo: 'texto', valor: (i) => i.nome },
  { header: 'Quantidade', largura: 12, tipo: 'inteiro', valor: (i) => i.quantidade, total: true },
  { header: 'Total', largura: 16, tipo: 'moeda', valor: (i) => i.total, total: true },
]

export const COLUNAS_FUNCIONARIOS: ColunaExport<Funcionario>[] = [
  { header: 'Funcionário', largura: 36, tipo: 'texto', valor: (f) => f.nome },
  { header: 'Contas', largura: 10, tipo: 'inteiro', valor: (f) => f.contas, total: true },
  {
    header: 'Venda líquida',
    largura: 16,
    tipo: 'moeda',
    valor: (f) => f.vendaLiquida,
    total: true,
  },
  { header: 'Taxa de serviço', largura: 16, tipo: 'moeda', valor: (f) => f.servico, total: true },
]

/**
 * Uma aba no layout dos relatórios do GIA: título, subtítulo, cabeçalho colorido
 * congelado e com autofiltro e, no fim, a linha Total com SUBTOTAL(109) — soma só
 * as linhas visíveis, então acompanha o autofiltro do Excel.
 */
function preencherPlanilha<T>(
  ws: Worksheet,
  linhas: T[],
  colunas: ColunaExport<T>[],
  titulo: string,
  descricao: string
): void {
  ws.getCell('A1').value = titulo
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value = descricao
  ws.getCell('A2').font = { color: { argb: XLSX_COR_SUBTITULO } }

  colunas.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.largura
    const cel = ws.getRow(XLSX_LINHA_CABECALHO).getCell(i + 1)
    cel.value = col.header
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
  })

  const primeira = XLSX_LINHA_CABECALHO + 1
  linhas.forEach((linha, r) => {
    const row = ws.getRow(primeira + r)
    colunas.forEach((col, i) => {
      const cel = row.getCell(i + 1)
      cel.value = col.valor(linha)
      const fmt = XLSX_FORMATO[col.tipo]
      if (fmt) cel.numFmt = fmt
    })
  })

  const ultima = primeira + linhas.length - 1
  const linhaTotal = ws.getRow(ultima + 1)
  colunas.forEach((col, i) => {
    const cel = linhaTotal.getCell(i + 1)
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
    cel.border = { top: { style: 'thin' } }
    if (i === 0) cel.value = 'Total'
    if (!col.total) return
    const letra = letraColuna(i + 1)
    const soma = Math.round(linhas.reduce((acc, l) => acc + Number(col.valor(l)) * 100, 0)) / 100
    cel.value =
      linhas.length > 0
        ? { formula: `SUBTOTAL(109,${letra}${primeira}:${letra}${ultima})`, result: soma }
        : 0
    const fmt = XLSX_FORMATO[col.tipo]
    if (fmt) cel.numFmt = fmt
  })

  ws.views = [
    { state: 'frozen', xSplit: 0, ySplit: XLSX_LINHA_CABECALHO, topLeftCell: `A${primeira}` },
  ]
  ws.autoFilter = `A${XLSX_LINHA_CABECALHO}:${letraColuna(colunas.length)}${Math.max(ultima, XLSX_LINHA_CABECALHO)}`
}

/**
 * Excel da aba aberta, com as linhas como estão na tela (busca e filtros de
 * coluna aplicados) e, numa segunda aba, os totais do dia.
 */
export async function exportarXlsx<T>(opcoes: {
  consulta: Consulta
  /** Dia de negócio consultado (`YYYY-MM-DD`). */
  data: string
  nomeAba: string
  linhas: T[]
  totalLinhas: number
  colunas: ColunaExport<T>[]
  totais: DashboardTotais | null
}): Promise<void> {
  const { consulta, data, nomeAba, linhas, totalLinhas, colunas, totais } = opcoes
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  const titulo = `${NOME_MODULO} · ${consulta.lojaNome} · ${dataBr(data)}`
  const gerado = `gerado em ${dataHoraSp(new Date())}`
  const filtro =
    linhas.length < totalLinhas
      ? ` · filtrado: ${formatInteiro(linhas.length)} de ${formatInteiro(totalLinhas)} linhas`
      : ''

  preencherPlanilha(
    wb.addWorksheet(nomeAba),
    linhas,
    colunas,
    titulo,
    `${nomeAba}${filtro} · ${gerado}`
  )

  if (totais) {
    const ws = wb.addWorksheet('Totais do dia')
    ws.getCell('A1').value = titulo
    ws.getCell('A1').font = { bold: true, size: 13 }
    ws.getCell('A2').value = `Totais do dia (todos os centros de receita) · ${gerado}`
    ws.getCell('A2').font = { color: { argb: XLSX_COR_SUBTITULO } }
    ws.getColumn(1).width = 24
    ws.getColumn(2).width = 18
    INDICADORES.forEach((ind, i) => {
      const row = ws.getRow(XLSX_LINHA_CABECALHO + i)
      row.getCell(1).value = ind.rotulo.charAt(0).toUpperCase() + ind.rotulo.slice(1)
      row.getCell(1).font = { bold: true }
      row.getCell(2).value = totais[ind.id]
      row.getCell(2).numFmt = ind.moeda ? XLSX_FORMATO.moeda! : XLSX_FORMATO.inteiro!
    })
  }

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
    detalhe: `${consulta.lojaNome} - ${nomeAba}`,
    periodo: data,
    extensao: 'xlsx',
  })
  a.click()
  URL.revokeObjectURL(url)
}
