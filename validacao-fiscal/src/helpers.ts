import type { BadgeProps } from '@gia-cb/ui'
import type { Worksheet } from 'exceljs'
import type {
  Check,
  FiltroStatus,
  Invoice,
  SummaryStats,
  ValidationResult,
  ValidationStatus,
} from './types'

export const DEFAULT_JANELA_ANTES_HORAS = 12
export const DEFAULT_JANELA_APOS_HORAS = 12
export const MAX_JANELA_HORAS = 24
export const MAX_DIAS_PERIODO = 31
/** Tolerância por linha entre conta e nota (arredondamento). */
export const TOLERANCIA_VALOR = 0.02
/** Tolerância do card Diferença para ficar "verde". */
export const TOLERANCIA_DIFERENCA_TOTAL = 0.05

const HORA_MS = 60 * 60 * 1000

/**
 * Converte `YYYY-MM-DDTHH:mm:ss` (hora local da loja, sem fuso) em milissegundos
 * comparáveis. Lê os componentes como UTC de propósito: os dois lados (conta e
 * nota) chegam no mesmo formato sem fuso, então só a diferença importa — e assim
 * o fuso/horário de verão do navegador não interfere.
 */
export function horaLocalEmMs(valor: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(valor)
  if (!m) return Number.NaN
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))
}

/** Data `YYYY-MM-DD` deslocada em N dias (aritmética de calendário, sem fuso). */
export function somarDias(data: string, dias: number): string {
  const d = new Date(horaLocalEmMs(data) + dias * 24 * HORA_MS)
  return d.toISOString().slice(0, 10)
}

/** Hoje no fuso do navegador (o legado usava UTC e errava depois das 21h). */
export function hojeLocal(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((horaLocalEmMs(ate) - horaLocalEmMs(de)) / (24 * HORA_MS))
}

/** Valida o período antes da pesquisa. Devolve a mensagem de erro, ou `null`. */
export function validarPeriodo(de: string, ate: string): string | null {
  if (!de || !ate) return 'Informe a data inicial e a data final.'
  const hoje = hojeLocal()
  if (de > hoje || ate > hoje) return 'As datas não podem ser futuras.'
  if (de > ate) return 'A data inicial não pode ser maior que a data final.'
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    return `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
  }
  return null
}

/** Limita a janela de tempo a 0–MAX_JANELA_HORAS horas inteiras. */
export function limitarJanela(horas: number): number {
  const n = Math.round(Number(horas))
  return Number.isFinite(n) ? Math.min(MAX_JANELA_HORAS, Math.max(0, n)) : 0
}

/**
 * Regra de conciliação — porte de `validationService.ts` do legado.
 *
 * O casamento é pelo `Check_Number`: contas (DW) e notas (API) são lidas pelo
 * MESMO `loc_ref` do Simphony, então os dois lados já são da mesma loja — o
 * equivalente ao `Check_Number + Loja` do legado.
 */
export function validateData(
  checks: Check[],
  invoices: Invoice[],
  janelaAposHoras: number,
  janelaAntesHoras: number,
  de: string,
  ate: string
): { results: ValidationResult[]; stats: SummaryStats } {
  const results: ValidationResult[] = []
  const usedInvoiceIds = new Set<string>()
  // Defesa: a janela nunca passa do máximo, mesmo que chegue um valor fora da tela.
  const antes = limitarJanela(janelaAntesHoras)
  const apos = limitarJanela(janelaAposHoras)

  // Janela fiscal de análise (herdada do Delphi): 08:00 do 1º dia até 08:00 do dia
  // seguinte ao último. Notas sem conta fora dela pertencem a outro dia fiscal.
  const inicioJanelaFiscal = horaLocalEmMs(`${de}T08:00:00`)
  const fimJanelaFiscal = horaLocalEmMs(`${somarDias(ate, 1)}T08:00:00`)

  const notasPorCheck = new Map<number, Invoice[]>()
  for (const inv of invoices) {
    const lista = notasPorCheck.get(inv.Check_Number)
    if (lista) lista.push(inv)
    else notasPorCheck.set(inv.Check_Number, [inv])
  }

  const activeChecks = checks.filter((c) => c.Total_Pagamento > 0)

  for (const check of activeChecks) {
    const fechamento = horaLocalEmMs(check.Hora_Fechamento_Conta)
    const validMatches = (notasPorCheck.get(check.Check_Number) ?? []).filter((inv) => {
      const diffHoras = (horaLocalEmMs(inv.Hora_Criacao_Nota) - fechamento) / HORA_MS
      return diffHoras >= -antes && diffHoras <= apos
    })

    let status: ValidationStatus = 'OK'
    let mainInvoice: Invoice | undefined
    let duplicates: Invoice[] = []
    let diff: number

    if (validMatches.length === 0) {
      status = 'CHECK_SEM_XML'
      diff = check.Total_Pagamento
    } else {
      validMatches.sort(
        (a, b) => horaLocalEmMs(b.Hora_Criacao_Nota) - horaLocalEmMs(a.Hora_Criacao_Nota)
      )
      // A principal é a mais recente cujo valor bate; senão, a mais recente de todas.
      // Assim uma reemissão nova com valor errado não esconde a nota que concilia.
      const principal =
        validMatches.find(
          (inv) => Math.abs(check.Total_Pagamento - inv.Valor_Nota) <= TOLERANCIA_VALOR
        ) ?? validMatches[0]
      mainInvoice = principal
      duplicates = validMatches.filter((inv) => inv.Chave_Acesso !== principal.Chave_Acesso)
      validMatches.forEach((inv) => usedInvoiceIds.add(inv.Chave_Acesso))

      diff = check.Total_Pagamento - principal.Valor_Nota
      if (Math.abs(diff) > TOLERANCIA_VALOR) status = 'DIVERGENCIA_VALOR'
      else if (validMatches.length > 1) status = 'DUPLICIDADE'
    }

    results.push({
      id: `C-${check.Check_id}`,
      check,
      mainInvoice,
      duplicateInvoices: duplicates,
      status,
      valueDifference: diff,
      saldo: diff - duplicates.reduce((s, d) => s + d.Valor_Nota, 0),
      loja: check.Loja,
      checkNumber: check.Check_Number,
      date: check.Hora_Fechamento_Conta,
    })
  }

  const orphanInvoices = invoices.filter((inv) => {
    if (usedInvoiceIds.has(inv.Chave_Acesso)) return false
    const t = horaLocalEmMs(inv.Hora_Criacao_Nota)
    return t >= inicioJanelaFiscal && t <= fimJanelaFiscal
  })

  for (const inv of orphanInvoices) {
    results.push({
      id: `I-${inv.Chave_Acesso}`,
      mainInvoice: inv,
      duplicateInvoices: [],
      status: 'XML_SEM_CONTA',
      valueDifference: -inv.Valor_Nota,
      saldo: -inv.Valor_Nota,
      loja: inv.Loja,
      checkNumber: inv.Check_Number,
      date: inv.Hora_Criacao_Nota,
    })
  }

  results.sort((a, b) => horaLocalEmMs(a.date) - horaLocalEmMs(b.date))

  const stats: SummaryStats = {
    totalSystem: 0,
    countSystem: activeChecks.length,
    totalFiscal: 0,
    countFiscal: usedInvoiceIds.size + orphanInvoices.length,
    difference: 0,
    countOk: 0,
    countErrors: 0,
    countWarnings: 0,
  }

  for (const res of results) {
    if (res.check) stats.totalSystem += res.check.Total_Pagamento
    if (res.mainInvoice) stats.totalFiscal += res.mainInvoice.Valor_Nota
    // As duplicadas entram no total para o R$ acompanhar a contagem countFiscal
    // e bater com a soma da coluna "Vl. Nota" do Excel.
    for (const dup of res.duplicateInvoices) stats.totalFiscal += dup.Valor_Nota

    if (res.status === 'OK') stats.countOk++
    else if (res.status === 'DUPLICIDADE') stats.countWarnings++
    else stats.countErrors++
  }

  stats.difference = stats.totalSystem - stats.totalFiscal
  return { results, stats }
}

// ── Busca em todos os campos (celular) ────────────────────────────────────────
// Um texto por registro com TODOS os campos — conta, nota principal e duplicadas —,
// com valores e datas no formato da tela e no formato cru, para "153,80",
// "153.8", "26/10/2026" ou "Salao" acharem o registro. Sem acento e sem caixa.

function normBusca(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function valorParaBusca(v: number | null | undefined): string {
  if (v == null) return ''
  return `${formatBRL(v)} ${v.toFixed(2).replace('.', ',')} ${v}`
}

function notaParaBusca(n: Invoice): string[] {
  return [
    n.Loja,
    n.Chave_Acesso,
    n.Status,
    String(n.Serie),
    String(n.nNf),
    String(n.Check_Number),
    formatDataHora(n.Hora_Criacao_Nota),
    valorParaBusca(n.Valor_Nota),
  ]
}

/** Texto pesquisável do registro (já normalizado). */
export function textoDeBusca(r: ValidationResult): string {
  const c = r.check
  const partes: string[] = [
    STATUS_LABEL[r.status],
    r.loja,
    String(r.checkNumber),
    formatDataHora(r.date),
    valorParaBusca(r.valueDifference),
  ]
  if (c) {
    partes.push(
      String(c.Check_id),
      c.Bus_Date,
      formatDataHora(c.Bus_Date),
      formatDataHora(c.Hora_Fechamento_Conta),
      c.Revenue_Center ?? '',
      c.Order_Type_Name ?? '',
      String(c.Order_Type_Number ?? ''),
      valorParaBusca(c.Total_Pagamento),
      valorParaBusca(c.Service_Charge),
      valorParaBusca(c.Total_Void)
    )
  }
  if (r.mainInvoice) partes.push(...notaParaBusca(r.mainInvoice))
  for (const d of r.duplicateInvoices) partes.push(...notaParaBusca(d))
  return normBusca(partes.join(' '))
}

/** Termos da busca: todas as palavras precisam aparecer no registro. */
export function termosDeBusca(busca: string): string[] {
  return normBusca(busca).split(' ').filter(Boolean)
}

export function passaNoFiltro(res: ValidationResult, filtro: FiltroStatus): boolean {
  if (filtro === 'TODOS') return true
  if (filtro === 'ERROS') return res.status !== 'OK' && res.status !== 'DUPLICIDADE'
  return res.status === filtro
}

export const STATUS_LABEL: Record<ValidationStatus, string> = {
  OK: 'Conciliado',
  CHECK_SEM_XML: 'Conta sem XML',
  XML_SEM_CONTA: 'XML sem Conta',
  DUPLICIDADE: 'Duplicidade',
  DIVERGENCIA_VALOR: 'Divergência R$',
}

/** Cor de cada status — compartilhada com o badge da tabela e o seletor de status. */
export const VARIANTE_STATUS: Record<ValidationStatus, BadgeProps['variant']> = {
  OK: 'success',
  CHECK_SEM_XML: 'destructive',
  XML_SEM_CONTA: 'exception',
  DUPLICIDADE: 'warning',
  DIVERGENCIA_VALOR: 'info',
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(valor: number | null | undefined): string {
  return valor == null ? '—' : BRL.format(valor)
}

/** `2026-09-01T00:00:04` → `01/09/2026 00:00`. */
export function formatDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(valor)
  if (!m) return valor
  return m[4] ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : `${m[3]}/${m[2]}/${m[1]}`
}

/** Mesmo `label` do `module.ts` — vai no nome do arquivo exportado. */
export const NOME_MODULO = 'Validação Fiscal'

/** `2026-10-26` → `26/10/2026`. */
function dataBr(data: string): string {
  return data.split('-').reverse().join('/')
}

/** `2026-10-20`/`2026-10-26` → `20.10.2026 a 26.10.2026` (um dia só → `20.10.2026`). */
export function periodoArquivo(de: string, ate: string): string {
  const fmt = (d: string) => d.split('-').reverse().join('.')
  return de === ate ? fmt(de) : `${fmt(de)} a ${fmt(ate)}`
}

/**
 * Nome do arquivo no padrão do portal: `GIA - <módulo> - <detalhe> - <período>.<extensão>`.
 * Ex.: `GIA - Validação Fiscal - 01.CB GOIANIA - 20.10.2026 a 26.10.2026.xlsx`.
 * Caracteres que o sistema de arquivos recusa viram espaço.
 *
 * TEMPORÁRIO: mesma assinatura do `nomeArquivoExport` do `@gia-cb/ui`, que ainda
 * não existe na 0.1.0-alpha.66. Quando a SDK trouxer, troque o import e apague esta.
 */
export function nomeArquivoExport(p: {
  modulo: string
  detalhe: string
  periodo: string
  extensao: string
}): string {
  const seguro = (t: string) =>
    t
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  return `GIA - ${seguro(p.modulo)} - ${seguro(p.detalhe)} - ${seguro(p.periodo)}.${p.extensao}`
}

type CelulaExport = string | number | null

type TipoColunaExport = 'texto' | 'inteiro' | 'moeda' | 'data' | 'dataHora'

/** Colunas da planilha, na ordem — nomes do legado; tipo define o formato da célula. */
export const COLUNAS_EXPORT: { header: string; tipo: TipoColunaExport; largura: number }[] = [
  { header: 'Loja', tipo: 'texto', largura: 26 },
  { header: 'Check ID', tipo: 'inteiro', largura: 14 },
  { header: 'Check Number', tipo: 'inteiro', largura: 10 },
  { header: 'Bus Date', tipo: 'data', largura: 12 },
  { header: 'Data Fechamento', tipo: 'dataHora', largura: 19 },
  { header: 'Revenue Center', tipo: 'texto', largura: 18 },
  { header: 'Order Type', tipo: 'texto', largura: 18 },
  { header: 'Vl. Pagamento', tipo: 'moeda', largura: 16 },
  { header: 'Vl. Serviço', tipo: 'moeda', largura: 14 },
  { header: 'Vl. Void', tipo: 'moeda', largura: 14 },
  { header: 'Chave Acesso', tipo: 'texto', largura: 48 },
  { header: 'Status Sefaz', tipo: 'texto', largura: 14 },
  { header: 'Série', tipo: 'inteiro', largura: 8 },
  { header: 'nNf', tipo: 'inteiro', largura: 10 },
  { header: 'Data Emissão', tipo: 'dataHora', largura: 19 },
  { header: 'Vl. Nota', tipo: 'moeda', largura: 16 },
  { header: 'Dif. Valores', tipo: 'moeda', largura: 16 },
  { header: 'Status Validação', tipo: 'texto', largura: 34 },
]

/**
 * Linhas da planilha — uma por nota (principal + duplicadas), no formato do legado.
 * Células de valor ficam VAZIAS (não 0) onde somar duplicaria: assim a soma de cada
 * coluna no Excel bate com os cards da tela.
 */
export function linhasExport(resultados: ValidationResult[]): Record<string, CelulaExport>[] {
  const linhas: Record<string, CelulaExport>[] = []

  for (const item of resultados) {
    const c = item.check
    const dadosConta: Record<string, CelulaExport> = {
      Loja: item.loja,
      'Check ID': c?.Check_id ?? null,
      'Check Number': item.checkNumber,
      'Bus Date': c?.Bus_Date ?? null,
      'Data Fechamento': c?.Hora_Fechamento_Conta ?? null,
      'Revenue Center': c?.Revenue_Center ?? null,
      'Order Type': c?.Order_Type_Name ?? null,
      'Vl. Pagamento': c?.Total_Pagamento ?? null,
      'Vl. Serviço': c?.Service_Charge ?? null,
      'Vl. Void': c?.Total_Void ?? null,
    }
    const pagamento = c?.Total_Pagamento ?? 0

    const dadosNota = (inv: Invoice, pag: number): Record<string, CelulaExport> => ({
      'Chave Acesso': inv.Chave_Acesso,
      'Status Sefaz': inv.Status,
      Série: inv.Serie,
      nNf: inv.nNf,
      'Data Emissão': inv.Hora_Criacao_Nota,
      'Vl. Nota': inv.Valor_Nota,
      'Dif. Valores': Math.round((pag - inv.Valor_Nota) * 100) / 100,
    })

    if (item.mainInvoice) {
      const statusTexto =
        item.duplicateInvoices.length > 0
          ? `CONCILIADO/PRINCIPAL (${item.status})`
          : item.status === 'XML_SEM_CONTA'
            ? 'XML SEM CONTA'
            : item.status
      linhas.push({
        ...dadosConta,
        ...dadosNota(item.mainInvoice, pagamento),
        'Status Validação': statusTexto,
      })
    } else {
      linhas.push({
        ...dadosConta,
        'Chave Acesso': null,
        'Status Sefaz': null,
        Série: null,
        nNf: null,
        'Data Emissão': null,
        'Vl. Nota': null,
        'Dif. Valores': pagamento,
        'Status Validação': 'CONTA SEM XML',
      })
    }

    const contaSemValores = {
      ...dadosConta,
      'Vl. Pagamento': null,
      'Vl. Serviço': null,
      'Vl. Void': null,
    }
    item.duplicateInvoices.forEach((dup, i) => {
      linhas.push({
        ...contaSemValores,
        ...dadosNota(dup, 0),
        'Status Validação': `DUPLICIDADE (${i + 1})`,
      })
    })
  }

  return linhas
}

// Estilo do template de exportação do GIA (Rankings de Auditoria — modelo de lançamento).
const XLSX_LINHA_CABECALHO = 4
const XLSX_COR_CABECALHO = 'FFDBE9FF'
const XLSX_COR_SUBTITULO = 'FF6B7280'
const XLSX_FORMATO: Record<TipoColunaExport, string | undefined> = {
  texto: undefined,
  inteiro: '0',
  moeda: '"R$" #,##0.00;-"R$" #,##0.00',
  data: 'dd/mm/yyyy',
  dataHora: 'dd/mm/yyyy hh:mm:ss',
}

/** Texto `YYYY-MM-DD[THH:mm:ss]` (hora local, sem fuso) → `Date` que o Excel mostra igual. */
function dataExcel(valor: string): Date | null {
  const ms = horaLocalEmMs(valor)
  return Number.isNaN(ms) ? null : new Date(ms)
}

/** Letra da coluna Excel (1 → A, 27 → AA). */
function letraColuna(n: number): string {
  let s = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26))
    s = String.fromCharCode(65 + ((x - 1) % 26)) + s
  return s
}

export interface CabecalhoExport {
  lojaNome: string
  de: string
  ate: string
  filtroLabel: string
  janelaAntes: number
  janelaApos: number
  geradoEm: Date
}

/**
 * Preenche a planilha no layout do template do GIA: título (linha 1), subtítulo
 * (linha 2), cabeçalho colorido (linha 4) congelado e com autofiltro, células
 * formatadas por tipo (R$, datas) e, na última linha, o TOTAL de cada coluna
 * monetária. O total usa SUBTOTAL(109), que soma só as linhas visíveis: já vem
 * com o recorte da tela e acompanha o autofiltro do Excel se o usuário filtrar.
 */
export function preencherPlanilha(
  ws: Worksheet,
  resultados: ValidationResult[],
  cab: CabecalhoExport
): void {
  const linhas = linhasExport(resultados)
  const nCols = COLUNAS_EXPORT.length
  const ultimaCol = letraColuna(nCols)
  const periodo = cab.de === cab.ate ? dataBr(cab.de) : `${dataBr(cab.de)} a ${dataBr(cab.ate)}`
  const gerado = `${String(cab.geradoEm.getDate()).padStart(2, '0')}/${String(
    cab.geradoEm.getMonth() + 1
  ).padStart(2, '0')}/${cab.geradoEm.getFullYear()}, ${String(cab.geradoEm.getHours()).padStart(
    2,
    '0'
  )}:${String(cab.geradoEm.getMinutes()).padStart(2, '0')}`

  ws.getCell('A1').value = `${NOME_MODULO} · ${cab.lojaNome} · ${periodo}`
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value =
    `${NOME_MODULO} · ${cab.filtroLabel} · janela −${cab.janelaAntes} h / +${cab.janelaApos} h` +
    ` · ${linhas.length} linhas · gerado em ${gerado}`
  ws.getCell('A2').font = { color: { argb: XLSX_COR_SUBTITULO } }

  COLUNAS_EXPORT.forEach((col, i) => {
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
    COLUNAS_EXPORT.forEach((col, i) => {
      const bruto = linha[col.header]
      if (bruto === null || bruto === undefined || bruto === '') return
      const cel = row.getCell(i + 1)
      cel.value =
        (col.tipo === 'data' || col.tipo === 'dataHora') && typeof bruto === 'string'
          ? (dataExcel(bruto) ?? bruto)
          : bruto
      const fmt = XLSX_FORMATO[col.tipo]
      if (fmt) cel.numFmt = fmt
    })
  })

  const ultima = primeira + linhas.length - 1
  const linhaTotal = ws.getRow(ultima + 1)
  COLUNAS_EXPORT.forEach((col, i) => {
    const cel = linhaTotal.getCell(i + 1)
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
    cel.border = { top: { style: 'thin' } }
    if (i === 0) cel.value = 'Total'
    if (col.tipo !== 'moeda') return
    const soma = linhas.reduce(
      (s, l) => s + (typeof l[col.header] === 'number' ? (l[col.header] as number) : 0),
      0
    )
    const letra = letraColuna(i + 1)
    cel.value =
      linhas.length > 0
        ? {
            formula: `SUBTOTAL(109,${letra}${primeira}:${letra}${ultima})`,
            result: Math.round(soma * 100) / 100,
          }
        : 0
    cel.numFmt = XLSX_FORMATO.moeda!
  })

  // Painel congelado abaixo do cabeçalho; o autofiltro cobre só os dados (sem o total).
  ws.views = [
    { state: 'frozen', xSplit: 0, ySplit: XLSX_LINHA_CABECALHO, topLeftCell: `A${primeira}` },
  ]
  ws.autoFilter = `A${XLSX_LINHA_CABECALHO}:${ultimaCol}${Math.max(ultima, XLSX_LINHA_CABECALHO)}`
}
