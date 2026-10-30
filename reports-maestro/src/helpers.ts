import type { Worksheet } from 'exceljs'
import type { PedidoMaestro } from './types'

/** Mesmo `label` do `module.ts` — vai no título e no nome do arquivo exportado. */
export const NOME_MODULO = 'Reports Maestro'
export const MAX_DIAS_PERIODO = 31

const DIA_MS = 24 * 60 * 60 * 1000

/** Data `YYYY-MM-DD` deslocada em N dias (aritmética de calendário, sem fuso). */
export function somarDias(data: string, dias: number): string {
  return new Date(Date.parse(`${data}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10)
}

/** Hoje no fuso do navegador. */
export function hojeLocal(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS)
}

/** Valida o período antes da pesquisa. Devolve a mensagem de erro, ou `null`. */
export function validarPeriodo(de: string, ate: string): string | null {
  if (!de || !ate) return 'Informe a data inicial e a data final.'
  const hoje = hojeLocal()
  if (de > hoje || ate > hoje) return 'As datas não podem ser futuras.'
  if (de > ate) return 'A data final não pode ser menor que a data inicial.'
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    return `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
  }
  return null
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(valor: number | null | undefined): string {
  return valor == null ? '—' : BRL.format(valor)
}

/** `2026-10-27 14:54:08` → `27/10/2026 14:54`; `2026-10-27` → `27/10/2026`. */
export function formatDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(valor)
  if (!m) return valor
  return m[4] ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : `${m[3]}/${m[2]}/${m[1]}`
}

/** `2026-10-20`/`2026-10-26` → `20.10.2026 a 26.10.2026` (um dia só → `20.10.2026`). */
export function periodoArquivo(de: string, ate: string): string {
  const fmt = (d: string) => d.split('-').reverse().join('.')
  return de === ate ? fmt(de) : `${fmt(de)} a ${fmt(ate)}`
}

/** Chave do status no filtro de status: pedido sem status vira `''`. */
export function chaveStatus(p: PedidoMaestro): string {
  return p.status_do_pedido ?? ''
}

/** Chave da origem no filtro de origem: pedido sem origem vira `''`. */
export function chaveOrigem(p: PedidoMaestro): string {
  return p.origem ?? ''
}

/**
 * Quantos pedidos há em cada chave. `base` entra com 0 antes da contagem — é como
 * o filtro mantém visível (e desmarcável) uma opção que o OUTRO filtro zerou.
 */
export function contarPor(
  pedidos: PedidoMaestro[],
  chave: (p: PedidoMaestro) => string,
  base: Iterable<string> = []
): Map<string, number> {
  const m = new Map<string, number>()
  for (const k of base) m.set(k, 0)
  for (const p of pedidos) m.set(chave(p), (m.get(chave(p)) ?? 0) + 1)
  return m
}

/** Aplica os filtros de chips: conjunto vazio = não filtra por aquela dimensão. */
export function filtrarPedidos(
  pedidos: PedidoMaestro[],
  status: ReadonlySet<string>,
  origens: ReadonlySet<string>
): PedidoMaestro[] {
  if (status.size === 0 && origens.size === 0) return pedidos
  return pedidos.filter(
    (p) =>
      (status.size === 0 || status.has(chaveStatus(p))) &&
      (origens.size === 0 || origens.has(chaveOrigem(p)))
  )
}

export interface TotaisPedidos {
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
}

/** Soma das colunas monetárias, arredondada em centavos. */
export function somarPedidos(pedidos: PedidoMaestro[]): TotaisPedidos {
  const t = { valor_do_pedido: 0, valor_da_entrega: 0, total_pago: 0, desconto_total: 0 }
  for (const p of pedidos) {
    t.valor_do_pedido += p.valor_do_pedido
    t.valor_da_entrega += p.valor_da_entrega
    t.total_pago += p.total_pago
    t.desconto_total += p.desconto_total
  }
  const c = (n: number) => Math.round(n * 100) / 100
  return {
    valor_do_pedido: c(t.valor_do_pedido),
    valor_da_entrega: c(t.valor_da_entrega),
    total_pago: c(t.total_pago),
    desconto_total: c(t.desconto_total),
  }
}

// ─── Exportação (.xlsx) ──────────────────────────────────────────────────────

type TipoColunaExport = 'texto' | 'inteiro' | 'moeda' | 'dataHora'

interface ColunaExport {
  header: string
  campo: keyof PedidoMaestro
  tipo: TipoColunaExport
  largura: number
}

/** Colunas da planilha — as mesmas da tabela do legado, na mesma ordem. */
export const COLUNAS_EXPORT: ColunaExport[] = [
  { header: 'Loja', campo: 'nome_loja', tipo: 'texto', largura: 24 },
  { header: 'ID', campo: 'id', tipo: 'texto', largura: 38 },
  { header: 'Nº pedido', campo: 'n_pedido', tipo: 'texto', largura: 11 },
  { header: 'Data criação', campo: 'data_de_criacao', tipo: 'dataHora', largura: 19 },
  { header: 'Data ação', campo: 'data_de_acao', tipo: 'dataHora', largura: 19 },
  { header: 'Nº parceiro', campo: 'n_parceiro', tipo: 'texto', largura: 14 },
  { header: 'Nº conta', campo: 'n_conta', tipo: 'texto', largura: 11 },
  { header: 'CPF cliente', campo: 'cpf_cliente', tipo: 'texto', largura: 14 },
  { header: 'Nome cliente', campo: 'nome_cliente', tipo: 'texto', largura: 28 },
  { header: 'Qtd pedidos', campo: 'quantidade_pedidos', tipo: 'inteiro', largura: 11 },
  { header: 'Email cliente', campo: 'email_cliente', tipo: 'texto', largura: 30 },
  { header: 'Tel. cliente', campo: 'telefone_cliente', tipo: 'texto', largura: 16 },
  { header: 'Rua', campo: 'street_name', tipo: 'texto', largura: 28 },
  { header: 'Núm.', campo: 'street_number', tipo: 'texto', largura: 8 },
  { header: 'Referência', campo: 'reference', tipo: 'texto', largura: 30 },
  { header: 'Retirada', campo: 'retirada', tipo: 'texto', largura: 10 },
  { header: 'Confirmado por', campo: 'confirmado_por', tipo: 'texto', largura: 28 },
  { header: 'Cancelado por', campo: 'cancelado_por', tipo: 'texto', largura: 28 },
  { header: 'Origem', campo: 'origem', tipo: 'texto', largura: 16 },
  { header: 'Status pedido', campo: 'status_do_pedido', tipo: 'texto', largura: 14 },
  { header: 'Valor pedido', campo: 'valor_do_pedido', tipo: 'moeda', largura: 14 },
  { header: 'Valor entrega', campo: 'valor_da_entrega', tipo: 'moeda', largura: 14 },
  { header: 'Total pago', campo: 'total_pago', tipo: 'moeda', largura: 14 },
  { header: 'Desconto total', campo: 'desconto_total', tipo: 'moeda', largura: 14 },
  { header: 'Forma pgto', campo: 'forma_de_pagamentos', tipo: 'texto', largura: 36 },
  { header: 'Descontos', campo: 'descontos', tipo: 'texto', largura: 40 },
]

// Estilo do template de exportação do GIA (o mesmo da Validação Fiscal).
const XLSX_LINHA_CABECALHO = 4
const XLSX_COR_CABECALHO = 'FFDBE9FF'
const XLSX_COR_SUBTITULO = 'FF6B7280'
const XLSX_FORMATO: Record<TipoColunaExport, string | undefined> = {
  texto: undefined,
  inteiro: '0',
  moeda: '"R$" #,##0.00;-"R$" #,##0.00',
  dataHora: 'dd/mm/yyyy hh:mm:ss',
}

/**
 * Texto `YYYY-MM-DD HH:mm:ss` (hora de São Paulo, sem fuso) → `Date` que o Excel
 * mostra igual. Lê como UTC de propósito: o exceljs grava a data em UTC, então o
 * fuso do navegador não desloca a hora.
 */
function dataExcel(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(valor)
  if (!m) return null
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)))
}

/** Letra da coluna Excel (1 → A, 27 → AA). */
function letraColuna(n: number): string {
  let s = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26))
    s = String.fromCharCode(65 + ((x - 1) % 26)) + s
  return s
}

function dataBr(data: string): string {
  return data.split('-').reverse().join('/')
}

export interface CabecalhoExport {
  lojaNome: string
  de: string
  ate: string
  geradoEm: Date
}

/**
 * Preenche a planilha no layout do template do GIA: título (linha 1), subtítulo
 * (linha 2), cabeçalho colorido (linha 4) congelado e com autofiltro, células
 * formatadas por tipo (R$, datas) e, na última linha, o TOTAL de cada coluna
 * monetária com SUBTOTAL(109) — soma só as linhas visíveis, então acompanha o
 * autofiltro do Excel se o usuário filtrar.
 */
export function preencherPlanilha(
  ws: Worksheet,
  pedidos: PedidoMaestro[],
  cab: CabecalhoExport
): void {
  const ultimaCol = letraColuna(COLUNAS_EXPORT.length)
  const periodo = cab.de === cab.ate ? dataBr(cab.de) : `${dataBr(cab.de)} a ${dataBr(cab.ate)}`
  const g = cab.geradoEm
  const dois = (n: number) => String(n).padStart(2, '0')
  const gerado = `${dois(g.getDate())}/${dois(g.getMonth() + 1)}/${g.getFullYear()}, ${dois(
    g.getHours()
  )}:${dois(g.getMinutes())}`

  ws.getCell('A1').value = `${NOME_MODULO} · ${cab.lojaNome} · ${periodo}`
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value =
    `Pedidos de delivery · ${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}` +
    ` · gerado em ${gerado}`
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
  pedidos.forEach((p, r) => {
    const row = ws.getRow(primeira + r)
    COLUNAS_EXPORT.forEach((col, i) => {
      const bruto = p[col.campo]
      if (bruto === null || bruto === undefined || bruto === '') return
      const cel = row.getCell(i + 1)
      cel.value =
        col.tipo === 'dataHora' && typeof bruto === 'string' ? (dataExcel(bruto) ?? bruto) : bruto
      const fmt = XLSX_FORMATO[col.tipo]
      if (fmt) cel.numFmt = fmt
    })
  })

  const ultima = primeira + pedidos.length - 1
  const totais = somarPedidos(pedidos)
  const linhaTotal = ws.getRow(ultima + 1)
  COLUNAS_EXPORT.forEach((col, i) => {
    const cel = linhaTotal.getCell(i + 1)
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
    cel.border = { top: { style: 'thin' } }
    if (i === 0) cel.value = 'Total'
    if (col.tipo !== 'moeda') return
    const letra = letraColuna(i + 1)
    cel.value =
      pedidos.length > 0
        ? {
            formula: `SUBTOTAL(109,${letra}${primeira}:${letra}${ultima})`,
            result: totais[col.campo as keyof TotaisPedidos],
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
