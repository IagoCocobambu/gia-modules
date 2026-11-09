import type { Worksheet } from 'exceljs'
import type { FiltroTotal, PedidoIfood, TipoPagamento, TotaisDia } from './types'

/** Mesmo `label` do `module.ts` — vai no título e no nome do arquivo exportado. */
export const NOME_MODULO = 'Fechamento iFood Diário'

/** Fuso das lojas e da API (datas `_horario_sp`) — não o do navegador. */
const FUSO_SP = 'America/Sao_Paulo'

/** Hoje em São Paulo, `AAAA-MM-DD` (o locale en-CA já formata assim). */
export function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_SP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Ontem em São Paulo, `AAAA-MM-DD` — o dia que a tela já traz selecionado. */
export function ontemLocal(): string {
  const [a, m, d] = hojeLocal().split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d - 1)).toISOString().slice(0, 10)
}

/** Data e hora de São Paulo, `DD/MM/AAAA HH:MM`. */
export function dataHoraSp(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(d)
    .replace(',', '')
}

/** Valida a data antes da pesquisa. Devolve a mensagem de erro, ou `null`. */
export function validarData(data: string): string | null {
  if (!data) return 'Não é possível consultar sem informar a data.'
  if (data > hojeLocal()) return 'A data não pode ser futura.'
  return null
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(valor: number | null | undefined): string {
  return valor == null ? '—' : BRL.format(valor)
}

/**
 * Data/hora para a tela. Com fuso (`...Z`, `-03:00` — as datas do iFood) converte
 * para São Paulo; sem fuso (as `_horario_sp` do DW) mostra como veio.
 * `2026-10-27 14:54:08` → `27/10/2026 14:54`; `2026-10-27` → `27/10/2026`.
 */
export function formatDataHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  if (/T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:?\d{2})$/.test(valor)) {
    const t = Date.parse(valor)
    if (!Number.isNaN(t)) return dataHoraSp(new Date(t))
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(valor)
  if (!m) return valor
  return m[4] ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : `${m[3]}/${m[2]}/${m[1]}`
}

/** `2026-10-20` → `20.10.2026` (nome do arquivo). */
export function dataArquivo(data: string): string {
  return data.split('-').reverse().join('.')
}

/** Nome do tipo na tela e no Excel. O legado mostrava `SEM_CLASSIFICACAO`. */
export const ROTULO_TIPO: Record<TipoPagamento, string> = {
  ONLINE: 'ONLINE',
  'ONLINE VR': 'ONLINE VR',
  OFFLINE: 'OFFLINE',
  SEM_CLASSIFICACAO: 'SEM CLASSIFICAÇÃO',
}

/** Coluna STATUS do legado: os tipos do pedido separados por "; " (`ONLINE; OFFLINE`). */
export function rotuloTipos(p: PedidoIfood): string {
  return p.tipos.map((t) => ROTULO_TIPO[t]).join('; ')
}

/**
 * Tipo único do pedido. Os cards do legado só somam o pedido cujas formas de
 * pagamento são TODAS do mesmo tipo: pedido misto (ONLINE; OFFLINE) não entra em
 * nenhum card de tipo.
 */
function tipoUnico(p: PedidoIfood): TipoPagamento | null {
  return p.tipos.length === 1 ? p.tipos[0] : null
}

const ok = (p: PedidoIfood) => p.venda_concluida === 'OK'

/**
 * Quanto cada pedido soma em cada card — a `calculateSummary` do legado. Só os
 * pedidos com Cancelamento = OK, menos os de "sem classificação", que contam todos.
 */
const PARCELA: Record<
  Exclude<FiltroTotal, 'pagamentos_sem_classificacao'>,
  (p: PedidoIfood) => number
> = {
  ifood_online: (p) =>
    ok(p) && tipoUnico(p) === 'ONLINE' ? round2(p.total_pago - p.desconto_copart) : 0,
  descontos_offline_vr: (p) =>
    ok(p) && (tipoUnico(p) === 'OFFLINE' || tipoUnico(p) === 'ONLINE VR')
      ? p.incentivo_parceiro
      : 0,
  ifood_adquirentes: (p) =>
    ok(p) && tipoUnico(p) === 'ONLINE VR'
      ? round2(p.total_pago - p.incentivo_parceiro - p.desconto_copart)
      : 0,
  descontos_loja_online: (p) => (ok(p) && tipoUnico(p) === 'ONLINE' ? p.incentivo_loja : 0),
  descontos_loja_offline: (p) => (ok(p) && tipoUnico(p) === 'OFFLINE' ? p.incentivo_loja : 0),
  descontos_loja_vr: (p) => (ok(p) && tipoUnico(p) === 'ONLINE VR' ? p.incentivo_loja : 0),
  desconto_copart: (p) => (ok(p) ? p.desconto_copart : 0),
  valor_sem_classificacao: (p) => p.valor_sem_classificacao,
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(pedidos: PedidoIfood[], campo: (p: PedidoIfood) => number): number {
  return pedidos.reduce((acc, p) => acc + Math.round(campo(p) * 100), 0) / 100
}

/** Os cards do dia. */
export function resumirTotais(pedidos: PedidoIfood[]): TotaisDia {
  return {
    ifood_online: somar(pedidos, PARCELA.ifood_online),
    descontos_offline_vr: somar(pedidos, PARCELA.descontos_offline_vr),
    ifood_adquirentes: somar(pedidos, PARCELA.ifood_adquirentes),
    descontos_loja_online: somar(pedidos, PARCELA.descontos_loja_online),
    descontos_loja_offline: somar(pedidos, PARCELA.descontos_loja_offline),
    descontos_loja_vr: somar(pedidos, PARCELA.descontos_loja_vr),
    desconto_copart: somar(pedidos, PARCELA.desconto_copart),
    valor_sem_classificacao: somar(pedidos, PARCELA.valor_sem_classificacao),
    pagamentos_sem_classificacao: pedidos.reduce((n, p) => n + p.qtd_sem_classificacao, 0),
    formas_sem_classificacao: [...new Set(pedidos.flatMap((p) => p.formas_sem_classificacao))],
  }
}

/**
 * Pedidos que entram na conta de um card — a MESMA regra de `resumirTotais`:
 * clicar no card filtra a tabela para os pedidos que somaram nele (com valor
 * diferente de zero). "Pagamentos sem classificação" é o filtro do legado (o
 * clique no painel vermelho): pedidos com alguma forma sem classificação.
 */
export function pedidosDoTotal(pedidos: PedidoIfood[], filtro: FiltroTotal): PedidoIfood[] {
  if (filtro === 'pagamentos_sem_classificacao') {
    return pedidos.filter((p) => p.qtd_sem_classificacao > 0)
  }
  const parcela = PARCELA[filtro]
  return pedidos.filter((p) => parcela(p) !== 0)
}

/** Nome do card, como na tela — para o botão do filtro e o subtítulo do Excel. */
export const NOME_DO_TOTAL: Record<FiltroTotal, string> = {
  ifood_online: 'iFood online',
  descontos_offline_vr: 'Descontos offline e VR',
  ifood_adquirentes: 'iFood adquirentes',
  descontos_loja_online: 'Descontos loja — online',
  descontos_loja_offline: 'Descontos loja — offline',
  descontos_loja_vr: 'Descontos loja — VR',
  desconto_copart: 'Desconto copart',
  valor_sem_classificacao: 'Valor sem classificação',
  pagamentos_sem_classificacao: 'Pagamentos sem classificação',
}

// ─── Exportação (.xlsx) ──────────────────────────────────────────────────────

type TipoColunaExport = 'texto' | 'inteiro' | 'moeda' | 'data' | 'dataHora'

export interface ColunaExport<T> {
  header: string
  valor: (linha: T) => string | number | null
  tipo: TipoColunaExport
  largura: number
  /** Soma na linha Total (SUBTOTAL 109). */
  total?: boolean
}

const vazioNulo = (v: string) => (v === '' ? null : v)

/** Colunas da grade do legado (`ALL_COLUMNS`, sem as repetidas), na mesma ordem. */
export const COLUNAS_PEDIDO: ColunaExport<PedidoIfood>[] = [
  { header: 'iFood reembolsa?', valor: (p) => p.ifood_reembolsa, tipo: 'texto', largura: 11 },
  {
    header: 'Total do pedido',
    valor: (p) => p.total_pago,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Desconto copart',
    valor: (p) => p.desconto_copart,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  { header: 'Cancelamento', valor: (p) => p.venda_concluida, tipo: 'texto', largura: 12 },
  { header: 'Status', valor: rotuloTipos, tipo: 'texto', largura: 20 },
  { header: 'Data', valor: (p) => p.data_calc, tipo: 'data', largura: 12 },
  { header: 'ID do pedido', valor: (p) => vazioNulo(p.id), tipo: 'texto', largura: 38 },
  { header: 'Nº pedido', valor: (p) => vazioNulo(p.n_pedido), tipo: 'texto', largura: 11 },
  {
    header: 'Data hora pedido',
    valor: (p) => vazioNulo(p.data_de_criacao),
    tipo: 'dataHora',
    largura: 19,
  },
  { header: 'Restaurante', valor: (p) => vazioNulo(p.nome_loja), tipo: 'texto', largura: 28 },
  {
    header: 'Restaurante no iFood',
    valor: (p) => vazioNulo(p.merchant_ifood),
    tipo: 'texto',
    largura: 30,
  },
  { header: 'ID do restaurante', valor: (p) => vazioNulo(p.id_loja), tipo: 'texto', largura: 12 },
  {
    header: 'Taxa de entrega',
    valor: (p) => p.valor_da_entrega,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Valor dos itens',
    valor: (p) => p.valor_do_pedido,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Incentivo promocional do iFood',
    valor: (p) => p.incentivo_parceiro,
    tipo: 'moeda',
    largura: 16,
    total: true,
  },
  {
    header: 'Incentivo promocional da loja',
    valor: (p) => p.incentivo_loja,
    tipo: 'moeda',
    largura: 16,
    total: true,
  },
  {
    header: 'Taxa de serviço',
    valor: (p) => p.taxa_extra_parceiro,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Total do parceiro',
    valor: (p) => p.total_parceiro,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Total descontos (DW)',
    valor: (p) => p.desconto_total,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Formas de pagamento',
    valor: (p) => vazioNulo(p.forma_de_pagamentos),
    tipo: 'texto',
    largura: 45,
  },
  {
    header: 'Data do cancelamento',
    valor: (p) => (p.data_cancelamento ? formatDataHora(p.data_cancelamento) : null),
    tipo: 'texto',
    largura: 17,
  },
  {
    header: 'Origem do cancelamento',
    valor: (p) => vazioNulo(p.origem_cancelamento),
    tipo: 'texto',
    largura: 16,
  },
  {
    header: 'Motivo do cancelamento',
    valor: (p) => vazioNulo(p.motivo_cancelamento),
    tipo: 'texto',
    largura: 30,
  },
  {
    header: 'Cancelamento é contestável',
    valor: (p) => vazioNulo(p.cancelamento_contestavel),
    tipo: 'texto',
    largura: 13,
  },
  {
    header: 'Motivo da impossibilidade de contestar',
    valor: (p) => vazioNulo(p.motivo_impossibilidade),
    tipo: 'texto',
    largura: 30,
  },
  {
    header: 'Data limite de contestação',
    valor: (p) => (p.data_limite_contestacao ? formatDataHora(p.data_limite_contestacao) : null),
    tipo: 'texto',
    largura: 17,
  },
  { header: 'Confirmado', valor: (p) => vazioNulo(p.confirmado_por), tipo: 'texto', largura: 11 },
  { header: 'Tipo de pedido', valor: (p) => vazioNulo(p.tipo_pedido), tipo: 'texto', largura: 13 },
  { header: 'Agendado', valor: (p) => vazioNulo(p.agendado), tipo: 'texto', largura: 10 },
  { header: 'Canal de venda', valor: (p) => vazioNulo(p.origem), tipo: 'texto', largura: 13 },
  {
    header: 'Tem cancelamento parcial?',
    valor: (p) => vazioNulo(p.cancelamento_parcial),
    tipo: 'texto',
    largura: 13,
  },
]

// Estilo do template de exportação do GIA (o mesmo do Fechamento Maestro).
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

/**
 * Texto `YYYY-MM-DD[ HH:mm:ss]` (hora de São Paulo, sem fuso) → `Date` que o Excel
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

export interface CabecalhoExport {
  lojaNome: string
  data: string
  geradoEm: Date
}

/** Título (linha 1) e subtítulo (linha 2) de uma aba, no layout do template do GIA. */
function cabecalho(ws: Worksheet, cab: CabecalhoExport, descricao: string): void {
  ws.getCell('A1').value =
    `${NOME_MODULO} · ${cab.lojaNome} · ${cab.data.split('-').reverse().join('/')}`
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value = `${descricao} · gerado em ${dataHoraSp(cab.geradoEm)}`
  ws.getCell('A2').font = { color: { argb: XLSX_COR_SUBTITULO } }
}

/**
 * Aba de linhas no layout do template do GIA: título, subtítulo, cabeçalho colorido
 * (linha 4) congelado e com autofiltro, células formatadas por tipo e, na última
 * linha, o TOTAL das colunas somáveis com SUBTOTAL(109) — que acompanha o autofiltro.
 */
export function preencherPlanilha<T>(
  ws: Worksheet,
  linhas: T[],
  colunas: ColunaExport<T>[],
  cab: CabecalhoExport,
  descricao: string
): void {
  const ultimaCol = letraColuna(colunas.length)
  cabecalho(ws, cab, descricao)

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
      const bruto = col.valor(linha)
      if (bruto === null || bruto === '') return
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
  colunas.forEach((col, i) => {
    const cel = linhaTotal.getCell(i + 1)
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
    cel.border = { top: { style: 'thin' } }
    if (i === 0) cel.value = 'Total'
    if (!col.total) return
    const letra = letraColuna(i + 1)
    const soma =
      Math.round(linhas.reduce((acc, l) => acc + Number(col.valor(l) ?? 0) * 100, 0)) / 100
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
  ws.autoFilter = `A${XLSX_LINHA_CABECALHO}:${ultimaCol}${Math.max(ultima, XLSX_LINHA_CABECALHO)}`
}

/** Aba "Resumo": os cards do dia, um por linha (indicador · valor). */
export function preencherResumo(
  ws: Worksheet,
  totais: TotaisDia,
  cab: CabecalhoExport,
  descricao: string
): void {
  cabecalho(ws, cab, descricao)
  ws.getColumn(1).width = 34
  ws.getColumn(2).width = 18
  const linhas: [string, number, TipoColunaExport][] = [
    ...(Object.keys(NOME_DO_TOTAL) as FiltroTotal[]).map(
      (k) =>
        [
          NOME_DO_TOTAL[k],
          totais[k],
          k === 'pagamentos_sem_classificacao' ? 'inteiro' : 'moeda',
        ] as [string, number, TipoColunaExport]
    ),
  ]
  ;['Indicador', 'Valor'].forEach((h, i) => {
    const cel = ws.getRow(XLSX_LINHA_CABECALHO).getCell(i + 1)
    cel.value = h
    cel.font = { bold: true }
    cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XLSX_COR_CABECALHO } }
  })
  linhas.forEach(([nome, valor, tipo], r) => {
    const row = ws.getRow(XLSX_LINHA_CABECALHO + 1 + r)
    row.getCell(1).value = nome
    row.getCell(2).value = valor
    row.getCell(2).numFmt = XLSX_FORMATO[tipo] ?? ''
  })
  if (totais.formas_sem_classificacao.length > 0) {
    const r = XLSX_LINHA_CABECALHO + linhas.length + 2
    ws.getCell(`A${r}`).value = 'Formas sem classificação'
    ws.getCell(`A${r}`).font = { bold: true }
    totais.formas_sem_classificacao.forEach((f, i) => {
      ws.getCell(`A${r + 1 + i}`).value = f
    })
  }
}
