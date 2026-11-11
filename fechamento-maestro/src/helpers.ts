import type { Worksheet } from 'exceljs'
import type {
  FiltroTotal,
  PagamentoSemClassificacao,
  PedidoFechamento,
  ResumoDia,
  TipoPagamento,
  TotaisPeriodo,
  VendaCanal,
} from './types'

/** Mesmo `label` do `module.ts` — vai no título e no nome do arquivo exportado. */
export const NOME_MODULO = 'Fechamento Maestro'
export const MAX_DIAS_PERIODO = 31

const DIA_MS = 24 * 60 * 60 * 1000

/** Data `YYYY-MM-DD` deslocada em N dias (aritmética de calendário, sem fuso). */
export function somarDias(data: string, dias: number): string {
  return new Date(Date.parse(`${data}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10)
}

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

/**
 * Nome de cada tipo de forma de pagamento na coluna TIPO, no detalhe e no Excel —
 * os do legado. "ONLINE VR" é o que soma em Adquirentes.
 */
export const ROTULO_TIPO: Record<TipoPagamento, string> = {
  online: 'ONLINE',
  adquirente: 'ONLINE VR',
  offline: 'OFFLINE',
  nao_classificado: 'SEM CLASSIFICAÇÃO',
}

/** Tipos das formas de pagamento do pedido, sem repetir, na ordem em que aparecem. */
export function tiposDoPedido(p: PedidoFechamento): TipoPagamento[] {
  return [...new Set(p.pagamentos.map((pg) => pg.tipo))]
}

/** Coluna TIPO do legado: os tipos do pedido separados por "; " (`ONLINE; ONLINE VR`). */
export function rotuloTiposDoPedido(p: PedidoFechamento): string {
  return tiposDoPedido(p)
    .map((t) => ROTULO_TIPO[t])
    .join('; ')
}

/** Pedido entra na contagem de divergências: não cancelado e com check reprovado. */
export function divergente(p: PedidoFechamento): boolean {
  return !p.cancelado && (!p.check_pagamentos || !p.check_descontos)
}

/**
 * Online do pedido sem o incentivo que foi para Descontos parceiro (regra do legado).
 * A conta é em centavos: subtrair em reais deixava lixo de ponto flutuante na célula
 * do Excel (-6.990000000000002 em vez de -6,99).
 */
function onlineLiquido(p: PedidoFechamento): number {
  return (Math.round(p.total_pago_online * 100) - Math.round(p.abatimento_online * 100)) / 100
}

/**
 * Pedidos que entram na conta de cada indicador da barra de totais — a MESMA regra
 * de `resumirTotais`: clicar num indicador filtra a tabela para exatamente os
 * pedidos que somaram nele (com valor diferente de zero naquele grupo).
 */
const PEDIDO_DO_TOTAL: Record<FiltroTotal, (p: PedidoFechamento) => boolean> = {
  online: (p) => !p.cancelado && onlineLiquido(p) !== 0,
  adquirentes_online: (p) => !p.cancelado && p.total_pago_adquirentes_online !== 0,
  adquirentes_offline: (p) => !p.cancelado && p.total_pago_adquirentes_offline !== 0,
  offline: (p) => !p.cancelado && p.total_pago_offline !== 0,
  cancelado_online: (p) => p.cancelado && onlineLiquido(p) !== 0,
  cancelado_adquirentes_online: (p) => p.cancelado && p.total_pago_adquirentes_online !== 0,
  cancelado_adquirentes_offline: (p) => p.cancelado && p.total_pago_adquirentes_offline !== 0,
  cancelado_offline: (p) => p.cancelado && p.total_pago_offline !== 0,
  descontos_loja: (p) => p.venda_concluida && p.desconto_total !== 0,
  descontos_parceiro: (p) => !p.cancelado && p.desconto_parceiro !== 0,
  nao_classificado: (p) => !p.cancelado && p.total_nao_classificado !== 0,
  pagamentos_sem_classificacao: (p) =>
    !p.cancelado && p.pagamentos.some((pg) => pg.tipo === 'nao_classificado'),
}

/** Os pedidos que somaram no indicador `filtro`. */
export function pedidosDoTotal(
  pedidos: PedidoFechamento[],
  filtro: FiltroTotal
): PedidoFechamento[] {
  return pedidos.filter(PEDIDO_DO_TOTAL[filtro])
}

/** Nome do indicador, como na barra — para o aviso do filtro e o subtítulo do Excel. */
export const NOME_DO_TOTAL: Record<FiltroTotal, string> = {
  online: 'Online',
  adquirentes_online: 'Adquirentes online',
  adquirentes_offline: 'Adquirentes offline',
  offline: 'Offline',
  cancelado_online: 'Cancelado online',
  cancelado_adquirentes_online: 'Cancelado adquirentes online',
  cancelado_adquirentes_offline: 'Cancelado adquirentes offline',
  cancelado_offline: 'Cancelado offline',
  descontos_loja: 'Descontos loja',
  descontos_parceiro: 'Descontos parceiro',
  nao_classificado: 'Sem classificação',
  pagamentos_sem_classificacao: 'Pagamentos sem classificação',
}

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(pedidos: PedidoFechamento[], campo: (p: PedidoFechamento) => number): number {
  return pedidos.reduce((acc, p) => acc + Math.round(campo(p) * 100), 0) / 100
}

function resumir(data: string, pedidos: PedidoFechamento[]): ResumoDia {
  const validos = pedidos.filter((p) => !p.cancelado)
  return {
    data,
    pedidos: pedidos.length,
    cancelados: pedidos.length - validos.length,
    valor_do_pedido: somar(validos, (p) => p.valor_do_pedido),
    valor_da_entrega: somar(validos, (p) => p.valor_da_entrega),
    total_pago: somar(validos, (p) => p.total_pago),
    online: somar(validos, onlineLiquido),
    adquirentes_online: somar(validos, (p) => p.total_pago_adquirentes_online),
    adquirentes_offline: somar(validos, (p) => p.total_pago_adquirentes_offline),
    offline: somar(validos, (p) => p.total_pago_offline),
    nao_classificado: somar(validos, (p) => p.total_nao_classificado),
    // Mesma regra dos cards (resumirTotais) — o Total da aba bate com eles.
    descontos_loja: somar(
      pedidos.filter((p) => p.venda_concluida),
      (p) => p.desconto_total
    ),
    descontos_parceiro: somar(validos, (p) => p.desconto_parceiro),
    divergentes: validos.filter(divergente).length,
  }
}

/**
 * Fechamento diário: os pedidos agrupados pelo dia de criação, em ordem de data.
 * Cancelados contam em "Pedidos"/"Cancelados", mas ficam fora de todos os valores.
 */
export function resumirPorDia(pedidos: PedidoFechamento[]): ResumoDia[] {
  const porDia = new Map<string, PedidoFechamento[]>()
  for (const p of pedidos) {
    const lista = porDia.get(p.data)
    if (lista) lista.push(p)
    else porDia.set(p.data, [p])
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, lista]) => resumir(data, lista))
}

/**
 * Formas de pagamento sem classificação dos pedidos não cancelados — as mesmas
 * que entram no "Valor sem classificação" e reprovam o check de pagamentos.
 */
export function pagamentosSemClassificacao(
  pedidos: PedidoFechamento[]
): PagamentoSemClassificacao[] {
  return pedidos
    .filter((p) => !p.cancelado)
    .flatMap((pedido) =>
      pedido.pagamentos
        .filter((pagamento) => pagamento.tipo === 'nao_classificado')
        .map((pagamento) => ({ pedido, pagamento }))
    )
}

/**
 * Os 12 indicadores do legado (`calculateSummary` do Fechamento Diário). Venda
 * só dos não cancelados; os cancelados têm os seus. O incentivo que vai para
 * Descontos parceiro sai do Online (também do Cancelado online). Descontos loja
 * é o desconto total dos pedidos com venda concluída (DISPATCHED ou DELIVERED).
 */
export function resumirTotais(pedidos: PedidoFechamento[]): TotaisPeriodo {
  const validos = pedidos.filter((p) => !p.cancelado)
  const cancelados = pedidos.filter((p) => p.cancelado)
  return {
    online: somar(validos, onlineLiquido),
    adquirentes_online: somar(validos, (p) => p.total_pago_adquirentes_online),
    adquirentes_offline: somar(validos, (p) => p.total_pago_adquirentes_offline),
    offline: somar(validos, (p) => p.total_pago_offline),
    cancelado_online: somar(cancelados, onlineLiquido),
    cancelado_adquirentes_online: somar(cancelados, (p) => p.total_pago_adquirentes_online),
    cancelado_adquirentes_offline: somar(cancelados, (p) => p.total_pago_adquirentes_offline),
    cancelado_offline: somar(cancelados, (p) => p.total_pago_offline),
    descontos_loja: somar(
      pedidos.filter((p) => p.venda_concluida),
      (p) => p.desconto_total
    ),
    descontos_parceiro: somar(validos, (p) => p.desconto_parceiro),
    nao_classificado: somar(validos, (p) => p.total_nao_classificado),
    pagamentos_sem_classificacao: pagamentosSemClassificacao(validos).length,
    divergentes: validos.filter(divergente).length,
  }
}

/**
 * Os 4 indicadores à vista na barra de totais acima da tabela (os grupos de
 * pagamento do fechamento); os demais abrem por "Ver todos os totais".
 */
export const TOTAIS_PRINCIPAIS: readonly FiltroTotal[] = [
  'online',
  'adquirentes_online',
  'adquirentes_offline',
  'offline',
]

/** Canal do pedido (a `origem` da API); "Sem origem" quando a API não informou. */
export function canalDoPedido(p: PedidoFechamento): string {
  return p.origem?.trim() || 'Sem origem'
}

/**
 * Anel de canais da seção de totais e opções do seletor Canal: o total pago dos
 * pedidos não cancelados, somado por origem (App Coco Bambu, iFood, ...), do
 * maior para o menor. Canal só com cancelados entra com zero (sem fatia no anel)
 * — dá para escolhê-lo no seletor e ver os cancelados dele.
 */
export function vendasPorCanal(pedidos: PedidoFechamento[]): VendaCanal[] {
  const porCanal = new Map<string, PedidoFechamento[]>()
  for (const p of pedidos) {
    const canal = canalDoPedido(p)
    const lista = porCanal.get(canal) ?? []
    if (!p.cancelado) lista.push(p)
    porCanal.set(canal, lista)
  }
  return [...porCanal.entries()]
    .map(([canal, lista]) => ({
      canal,
      valor: somar(lista, (p) => p.total_pago),
      pedidos: lista.length,
    }))
    .sort((a, b) => b.valor - a.valor || a.canal.localeCompare(b.canal))
}

// ─── Exportação (.xlsx) ──────────────────────────────────────────────────────

type TipoColunaExport = 'texto' | 'inteiro' | 'moeda' | 'data' | 'dataHora'

interface ColunaExport<T> {
  header: string
  valor: (linha: T) => string | number | null
  tipo: TipoColunaExport
  largura: number
  /** Soma na linha Total (SUBTOTAL 109). */
  total?: boolean
}

const simNao = (v: boolean) => (v ? 'Sim' : 'Não')
const ok = (v: boolean) => (v ? 'OK' : 'Divergente')

export const COLUNAS_DIA: ColunaExport<ResumoDia>[] = [
  { header: 'Data', valor: (d) => d.data, tipo: 'data', largura: 12 },
  { header: 'Pedidos', valor: (d) => d.pedidos, tipo: 'inteiro', largura: 10, total: true },
  { header: 'Cancelados', valor: (d) => d.cancelados, tipo: 'inteiro', largura: 11, total: true },
  {
    header: 'Valor pedido',
    valor: (d) => d.valor_do_pedido,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  {
    header: 'Valor entrega',
    valor: (d) => d.valor_da_entrega,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  { header: 'Total pago', valor: (d) => d.total_pago, tipo: 'moeda', largura: 15, total: true },
  { header: 'Online', valor: (d) => d.online, tipo: 'moeda', largura: 15, total: true },
  {
    header: 'Adquirentes online',
    valor: (d) => d.adquirentes_online,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  {
    header: 'Adquirentes offline',
    valor: (d) => d.adquirentes_offline,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  { header: 'Offline', valor: (d) => d.offline, tipo: 'moeda', largura: 15, total: true },
  {
    header: 'Não classificado',
    valor: (d) => d.nao_classificado,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  {
    header: 'Descontos loja',
    valor: (d) => d.descontos_loja,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  {
    header: 'Descontos parceiro',
    valor: (d) => d.descontos_parceiro,
    tipo: 'moeda',
    largura: 15,
    total: true,
  },
  {
    header: 'Divergências',
    valor: (d) => d.divergentes,
    tipo: 'inteiro',
    largura: 12,
    total: true,
  },
]

export const COLUNAS_PEDIDO: ColunaExport<PedidoFechamento>[] = [
  { header: 'Data', valor: (p) => p.data, tipo: 'data', largura: 12 },
  { header: 'Nº pedido', valor: (p) => p.n_pedido, tipo: 'texto', largura: 11 },
  { header: 'Data criação', valor: (p) => p.data_de_criacao, tipo: 'dataHora', largura: 19 },
  { header: 'Origem', valor: (p) => p.origem, tipo: 'texto', largura: 16 },
  { header: 'Status pedido', valor: (p) => p.status_do_pedido, tipo: 'texto', largura: 14 },
  {
    header: 'Venda concluída',
    valor: (p) => simNao(p.venda_concluida),
    tipo: 'texto',
    largura: 10,
  },
  { header: 'Cliente', valor: (p) => p.nome_cliente, tipo: 'texto', largura: 28 },
  { header: 'Tipo entrega', valor: (p) => p.tipo_entrega, tipo: 'texto', largura: 16 },
  {
    header: 'Valor pedido',
    valor: (p) => p.valor_do_pedido,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Valor entrega',
    valor: (p) => p.valor_da_entrega,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  { header: 'Total pago', valor: (p) => p.total_pago, tipo: 'moeda', largura: 14, total: true },
  // Líquido do incentivo que foi para Descontos parceiro — como o card e a aba
  // Fechamento diário. O bruto continua nas formas de pagamento do pedido.
  {
    header: 'Online (líquido)',
    valor: onlineLiquido,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Adquirentes online',
    valor: (p) => p.total_pago_adquirentes_online,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Adquirentes offline',
    valor: (p) => p.total_pago_adquirentes_offline,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Offline',
    valor: (p) => p.total_pago_offline,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Não classificado',
    valor: (p) => p.total_nao_classificado,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Desconto total',
    valor: (p) => p.desconto_total,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Incentivo parceiro',
    valor: (p) => p.incentivo_parceiro,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  {
    header: 'Desconto parceiro',
    valor: (p) => p.desconto_parceiro,
    tipo: 'moeda',
    largura: 14,
    total: true,
  },
  { header: 'Check pagamentos', valor: (p) => ok(p.check_pagamentos), tipo: 'texto', largura: 13 },
  { header: 'Check descontos', valor: (p) => ok(p.check_descontos), tipo: 'texto', largura: 13 },
  { header: 'Forma pgto', valor: (p) => p.forma_de_pagamentos, tipo: 'texto', largura: 40 },
  { header: 'Tipo', valor: (p) => rotuloTiposDoPedido(p), tipo: 'texto', largura: 22 },
  { header: 'Descontos', valor: (p) => p.descontos, tipo: 'texto', largura: 40 },
  { header: 'Divergências', valor: (p) => p.divergencias.join(' '), tipo: 'texto', largura: 50 },
]

// Estilo do template de exportação do GIA (o mesmo do Reports Maestro).
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
 * Preenche uma aba no layout do template do GIA: título (linha 1), subtítulo
 * (linha 2), cabeçalho colorido (linha 4) congelado e com autofiltro, células
 * formatadas por tipo (R$, datas) e, na última linha, o TOTAL das colunas
 * somáveis com SUBTOTAL(109) — soma só as linhas visíveis, então acompanha o
 * autofiltro do Excel se o usuário filtrar.
 */
export function preencherPlanilha<T>(
  ws: Worksheet,
  linhas: T[],
  colunas: ColunaExport<T>[],
  cab: CabecalhoExport,
  descricao: string
): void {
  const ultimaCol = letraColuna(colunas.length)
  const periodo = cab.de === cab.ate ? dataBr(cab.de) : `${dataBr(cab.de)} a ${dataBr(cab.ate)}`
  const gerado = dataHoraSp(cab.geradoEm)

  ws.getCell('A1').value = `${NOME_MODULO} · ${cab.lojaNome} · ${periodo}`
  ws.getCell('A1').font = { bold: true, size: 13 }
  ws.getCell('A2').value = `${descricao} · gerado em ${gerado}`
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

  // Painel congelado abaixo do cabeçalho; o autofiltro cobre só os dados (sem o total).
  ws.views = [
    { state: 'frozen', xSplit: 0, ySplit: XLSX_LINHA_CABECALHO, topLeftCell: `A${primeira}` },
  ]
  ws.autoFilter = `A${XLSX_LINHA_CABECALHO}:${ultimaCol}${Math.max(ultima, XLSX_LINHA_CABECALHO)}`
}
