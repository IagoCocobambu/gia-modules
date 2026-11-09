import type { Worksheet } from 'exceljs'
import type { FiltroTotal, Resumo, Transacao, VolumeHora, VolumeModalidade } from './types'

export const NOME_MODULO = 'Pagamento eCheck'
/** Mesmo teto do handler (`src/server/pagamentos.ts`). */
export const MAX_DIAS_PERIODO = 31
/** Faixa de horário padrão do legado: das 08:00 às 23:59. */
export const HORA_INICIO_PADRAO = 8
export const HORA_FIM_PADRAO = 23
/** Status que conta como transação aprovada. */
export const STATUS_APROVADO = 'PAGO'

const DIA_MS = 24 * 60 * 60 * 1000
const FUSO_SP = 'America/Sao_Paulo'

/** `YYYY-MM-DD` somado de `dias` dias. */
export function somarDias(data: string, dias: number): string {
  return new Date(Date.parse(`${data}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10)
}

/** Hoje (`YYYY-MM-DD`) no fuso de São Paulo. */
export function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_SP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS)
}

/** Mensagem do primeiro problema do filtro, ou `null` se está tudo certo. */
export function validarFiltro(
  de: string,
  ate: string,
  horaInicio: number,
  horaFim: number
): string | null {
  if (!de || !ate) return 'Informe a data inicial e a data final.'
  const hoje = hojeLocal()
  if (de > hoje || ate > hoje) return 'As datas não podem ser futuras.'
  if (de > ate) return 'A data final não pode ser menor que a data inicial.'
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    return `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
  }
  if (horaInicio >= horaFim) return 'A hora final precisa ser maior que a hora inicial.'
  return null
}

/** Partes da data e hora no fuso de São Paulo. */
function partesSp(iso: string) {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO_SP,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(t))
      .map((x) => [x.type, x.value])
  )
  return {
    ano: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    hora: Number(p.hour),
    minuto: Number(p.minute),
    segundo: Number(p.second),
  }
}

/** Hora (0–23) da transação em São Paulo; `null` se a data não veio. */
export function horaDaTransacao(t: Transacao): number | null {
  return t.dataHora ? (partesSp(t.dataHora)?.hora ?? null) : null
}

const dois = (n: number) => String(n).padStart(2, '0')

/** `dd/mm/aaaa hh:mm:ss` (com hora) ou `dd/mm/aaaa` (data pura `YYYY-MM-DD`). */
export function formatDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor.split('-').reverse().join('/')
  const p = partesSp(valor)
  if (!p) return valor
  return `${dois(p.dia)}/${dois(p.mes)}/${p.ano} ${dois(p.hora)}:${dois(p.minuto)}:${dois(p.segundo)}`
}

/** `08:00`; o fim 23 da faixa é `23:59`, como na consulta. */
export function formatHora(hora: number, fimDaFaixa = false): string {
  return fimDaFaixa && hora === 23 ? '23:59' : `${dois(hora)}:00`
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(valor: number | null | undefined): string {
  return valor == null ? '—' : BRL.format(valor)
}

export function formatInt(n: number): string {
  return n.toLocaleString('pt-BR')
}

/** Período para o nome do arquivo: `01.10.2026` ou `01.10.2026 a 05.10.2026`. */
export function periodoArquivo(de: string, ate: string): string {
  const fmt = (d: string) => d.split('-').reverse().join('.')
  return de === ate ? fmt(de) : `${fmt(de)} a ${fmt(ate)}`
}

/** Modalidade como o legado mostrava: `CREDITO_AVISTA` → `CREDITO AVISTA`. */
export function rotuloModalidade(m: string | null | undefined): string {
  return (m || 'Outros').replace(/_/g, ' ')
}

export function aprovada(t: Transacao): boolean {
  return t.status === STATUS_APROVADO
}

/** Soma em centavos inteiros (sem erro de ponto flutuante) e volta em reais. */
function somar(valores: number[]): number {
  return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
}

/** Quais transações somam em cada card de filtro. */
const DO_TOTAL: Record<FiltroTotal, (t: Transacao) => boolean> = {
  aprovadas: (t) => aprovada(t),
  nao_aprovadas: (t) => !aprovada(t),
}

export const FILTROS_TOTAL = Object.keys(DO_TOTAL) as FiltroTotal[]

/** As transações que somam no card — o que a tabela mostra com o filtro ligado. */
export function transacoesDoTotal(transacoes: Transacao[], filtro: FiltroTotal): Transacao[] {
  return transacoes.filter(DO_TOTAL[filtro])
}

/** Nome do card, como na tela — para o botão do filtro e o subtítulo do Excel. */
export const NOME_DO_TOTAL: Record<FiltroTotal, string> = {
  aprovadas: 'Aprovadas',
  nao_aprovadas: 'Não aprovadas',
}

/**
 * Os 3 indicadores do legado (valor total, transações e ticket médio) e os
 * cards de filtro por status (aprovadas ou não).
 */
export function resumir(transacoes: Transacao[]): Resumo {
  const valorTotal = somar(transacoes.map((t) => t.valor))
  const qtd = transacoes.length
  const valores = {} as Record<FiltroTotal, number>
  const quantidades = {} as Record<FiltroTotal, number>
  for (const f of FILTROS_TOTAL) {
    const doCard = transacoesDoTotal(transacoes, f)
    valores[f] = somar(doCard.map((t) => t.valor))
    quantidades[f] = doCard.length
  }
  return {
    valorTotal,
    transacoes: qtd,
    ticketMedio: qtd > 0 ? valorTotal / qtd : 0,
    aprovadas: quantidades.aprovadas,
    valores,
    quantidades,
  }
}

/** Valor por hora do dia (só as horas com transação, em ordem). */
export function volumePorHora(transacoes: Transacao[]): VolumeHora[] {
  const mapa = new Map<number, { centavos: number; transacoes: number }>()
  for (const t of transacoes) {
    const h = horaDaTransacao(t)
    if (h === null) continue
    const atual = mapa.get(h) ?? { centavos: 0, transacoes: 0 }
    atual.centavos += Math.round(t.valor * 100)
    atual.transacoes += 1
    mapa.set(h, atual)
  }
  return [...mapa.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hora, v]) => ({ hora, valor: v.centavos / 100, transacoes: v.transacoes }))
}

/** Valor por modalidade, do maior para o menor. */
export function volumePorModalidade(transacoes: Transacao[]): VolumeModalidade[] {
  const mapa = new Map<string, { centavos: number; transacoes: number }>()
  for (const t of transacoes) {
    const m = rotuloModalidade(t.modalidade)
    const atual = mapa.get(m) ?? { centavos: 0, transacoes: 0 }
    atual.centavos += Math.round(t.valor * 100)
    atual.transacoes += 1
    mapa.set(m, atual)
  }
  return [...mapa.entries()]
    .map(([modalidade, v]) => ({ modalidade, valor: v.centavos / 100, transacoes: v.transacoes }))
    .sort((a, b) => b.valor - a.valor)
}

// ── Colunas (tabela e Excel) ────────────────────────────────────────────────

type TipoColuna = 'texto' | 'dataHora' | 'moeda'

export interface Coluna {
  id: keyof Transacao
  header: string
  tipo: TipoColuna
  /** Largura no Excel (caracteres). */
  largura: number
  /** Ligada ao abrir a tela (as `DEFAULT` do legado). */
  visivel: boolean
}

/** Colunas na ordem do legado (`COLUMN_DEFINITIONS`). */
export const COLUNAS: Coluna[] = [
  { id: 'dataHora', header: 'Data/Hora', tipo: 'dataHora', largura: 20, visivel: true },
  { id: 'loja', header: 'Loja', tipo: 'texto', largura: 18, visivel: true },
  { id: 'modalidade', header: 'Modalidade', tipo: 'texto', largura: 20, visivel: true },
  { id: 'bandeira', header: 'Bandeira', tipo: 'texto', largura: 14, visivel: true },
  { id: 'status', header: 'Status', tipo: 'texto', largura: 12, visivel: true },
  { id: 'valor', header: 'Valor', tipo: 'moeda', largura: 14, visivel: true },
  { id: 'codAut', header: 'Cód. Aut.', tipo: 'texto', largura: 16, visivel: false },
  { id: 'codCielo', header: 'Cód. Cielo', tipo: 'texto', largura: 14, visivel: false },
  { id: 'descricao', header: 'Descrição', tipo: 'texto', largura: 20, visivel: false },
  { id: 'terminal', header: 'Terminal', tipo: 'texto', largura: 12, visivel: false },
  { id: 'conta', header: 'Conta', tipo: 'texto', largura: 10, visivel: false },
  { id: 'mesa', header: 'Mesa', tipo: 'texto', largura: 8, visivel: false },
  { id: 'grupoMesa', header: 'Grupo mesa', tipo: 'texto', largura: 12, visivel: false },
  { id: 'aberturaMesa', header: 'Abertura mesa', tipo: 'dataHora', largura: 20, visivel: false },
  { id: 'tipo', header: 'Tipo', tipo: 'texto', largura: 14, visivel: false },
  { id: 'tipoAdhoc', header: 'Tipo ADHOC', tipo: 'texto', largura: 14, visivel: false },
  { id: 'descricaoAdhoc', header: 'Descrição ADHOC', tipo: 'texto', largura: 24, visivel: false },
]

// ── Excel ───────────────────────────────────────────────────────────────────

const XLSX_LINHA_CABECALHO = 4
const XLSX_COR_CABECALHO = 'FFDBE9FF'
const XLSX_COR_SUBTITULO = 'FF6B7280'
const XLSX_FORMATO: Record<TipoColuna, string | undefined> = {
  texto: undefined,
  dataHora: 'dd/mm/yyyy hh:mm:ss',
  moeda: '"R$" #,##0.00',
}

/**
 * Data e hora de São Paulo como valor de data do Excel. O Excel não tem fuso: o
 * `Date` vai com as partes de SP em UTC, para a célula mostrar a hora da loja.
 */
function dataExcel(iso: string): Date | null {
  const p = partesSp(iso)
  return p ? new Date(Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo)) : null
}

function letraColuna(n: number): string {
  let s = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26))
    s = String.fromCharCode(65 + ((x - 1) % 26)) + s
  return s
}

function dataHoraAgora(): string {
  return formatDataHora(new Date().toISOString()).slice(0, 16)
}

export interface CabecalhoExport {
  lojaNome: string
  /** Faixa já formatada: `01/10/2026 08:00 a 05/10/2026 23:59`. */
  faixa: string
  descricao: string
}

/** Uma aba com título, subtítulo, cabeçalho, as linhas e a linha Total. */
export function preencherPlanilha(
  ws: Worksheet,
  linhas: Transacao[],
  colunas: Coluna[],
  cab: CabecalhoExport
): void {
  ws.getCell('A1').value = `${NOME_MODULO} · ${cab.lojaNome} · ${cab.faixa}`
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value = `${cab.descricao} · gerado em ${dataHoraAgora()}`
  ws.getCell('A2').font = { color: { argb: XLSX_COR_SUBTITULO } }

  colunas.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.largura
    const cel = ws.getRow(XLSX_LINHA_CABECALHO).getCell(i + 1)
    cel.value = col.header
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
    cel.alignment = { vertical: 'middle', wrapText: true }
  })

  const primeira = XLSX_LINHA_CABECALHO + 1
  linhas.forEach((linha, r) => {
    const row = ws.getRow(primeira + r)
    colunas.forEach((col, i) => {
      const bruto = linha[col.id]
      if (bruto === null || bruto === '') return
      const cel = row.getCell(i + 1)
      if (col.tipo === 'dataHora' && typeof bruto === 'string') {
        cel.value = dataExcel(bruto) ?? bruto
      } else if (col.id === 'modalidade') {
        cel.value = rotuloModalidade(bruto as string)
      } else {
        cel.value = bruto
      }
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
    if (col.tipo !== 'moeda') return
    const letra = letraColuna(i + 1)
    const soma = somar(linhas.map((l) => Number(l[col.id] ?? 0)))
    cel.value =
      linhas.length > 0
        ? { formula: `SUBTOTAL(109,${letra}${primeira}:${letra}${ultima})`, result: soma }
        : 0
    cel.numFmt = XLSX_FORMATO.moeda!
  })

  // Painel congelado abaixo do cabeçalho; o autofiltro cobre só os dados (sem o total).
  ws.views = [
    { state: 'frozen', xSplit: 0, ySplit: XLSX_LINHA_CABECALHO, topLeftCell: `A${primeira}` },
  ]
  ws.autoFilter = `A${XLSX_LINHA_CABECALHO}:${letraColuna(colunas.length)}${Math.max(ultima, XLSX_LINHA_CABECALHO)}`
}
