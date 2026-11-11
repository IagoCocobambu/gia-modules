import type { DadosManuais, LinhaCancelado, LinhaExtrato } from './types'

export const MODULE_ID = 'fechamento-ifood-mensal'
export const NOME_MODULO = 'Fechamento iFood Mensal'

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const NUM = new Intl.NumberFormat('pt-BR')
const PCT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export const formatBRL = (v: number) => BRL.format(v)
export const formatNum = (v: number) => NUM.format(v)
export const formatPct = (v: number) => `${PCT.format(v)}%`

/** `AAAA-MM-DD` → `DD/MM/AAAA` (outro formato volta como veio). */
export function formatData(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v
}

/** ISO com hora → `DD/MM/AAAA HH:MM` no fuso de quem usa. */
export function formatDataHora(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** `AAAA-MM` → `Novembro/2026`. */
export function rotuloMes(mes: string): string {
  const [a, m] = mes.split('-').map(Number)
  return MESES[m - 1] ? `${MESES[m - 1]}/${a}` : mes
}

/** Mês corrente `AAAA-MM` (fuso local). */
export function mesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Mês anterior ao atual — o padrão do legado (fecha-se o mês que terminou). */
export function mesAnterior(): string {
  const d = new Date()
  const ant = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  return `${ant.getFullYear()}-${String(ant.getMonth() + 1).padStart(2, '0')}`
}

/** `AAAA-MM-DD` → competência `AAAA-MM` (vazio se a data não for válida). */
export function competenciaDaData(data: string): string {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(data)
  return m ? `${m[1]}-${m[2]}` : ''
}

/** `AAAA-MM` → `MM/AAAA` (campo "Mês / Ano" do extrato). */
export function mesAnoDoMes(mes: string): string {
  const [a, m] = mes.split('-')
  return a && m ? `${m}/${a}` : ''
}

export function extratoVazio(mes: string): LinhaExtrato {
  return {
    loja: '',
    banco: '',
    tipo: '',
    mesAno: mesAnoDoMes(mes),
    classificacao: '',
    subClassificacao: '',
    dataMovimento: '',
    historico: '',
    documento: '',
    malote: 0,
    competencia: mes,
  }
}

export function canceladoVazio(): LinhaCancelado {
  return {
    dataPedido: '',
    estabelecimento: '',
    cnpj: '',
    nomeCliente: '',
    numeroPedido: '',
    idIfood: '',
    valorPedidoTaxa: 0,
    valorReembolso: null,
    centroVenda: '',
    origemCancelamento: '',
    justificativa: '',
    andamento: '',
    protocolo: '',
    valeNoCofre: '',
    dataAnulacao: '',
    dataReembolso: '',
  }
}

/**
 * Só o que é gravado (sem os campos do borderô) — base do "há alteração não salva"
 * e o corpo do handler `salvar`. Dia sem nada digitado não entra.
 */
export function paraGravar(d: DadosManuais): DadosManuais {
  const online: DadosManuais['online'] = {}
  for (const [dia, o] of Object.entries(d.online)) {
    const item: DadosManuais['online'][string] = {}
    if (o.previsao) item.previsao = o.previsao
    if (o.cbDescontosLoja !== undefined && o.cbDescontosLoja !== null)
      item.cbDescontosLoja = o.cbDescontosLoja
    if (o.comentario?.trim()) item.comentario = o.comentario.trim()
    online[dia] = item
  }
  const adquirente: DadosManuais['adquirente'] = {}
  for (const [dia, a] of Object.entries(d.adquirente)) {
    const item: DadosManuais['adquirente'][string] = {}
    if (a.previsao) item.previsao = a.previsao
    if (a.comentario?.trim()) item.comentario = a.comentario.trim()
    adquirente[dia] = item
  }
  return {
    online,
    adquirente,
    conferencia: { ...d.conferencia },
    extrato: d.extrato,
    cancelados: d.cancelados,
    anulacaoVerificar: d.anulacaoVerificar,
  }
}

/** Chave estável para comparar o estado da tela com o último gravado. */
export function assinatura(d: DadosManuais): string {
  const g = paraGravar(d)
  const ordenado = <T>(r: Record<string, T>) =>
    Object.keys(r)
      .sort()
      .filter((k) => Object.keys(r[k] as object).length > 0)
      .map((k) => [k, r[k]])
  return JSON.stringify([
    ordenado(g.online),
    ordenado(g.adquirente),
    ['valor_site_cc1', 'valor_site_cc2', 'valor_site_cc3', 'valor_site_cc4'].map(
      (k) => g.conferencia[k] ?? 0
    ),
    g.extrato,
    g.cancelados,
    g.anulacaoVerificar,
  ])
}

/** Classe do valor de divergência (#): zero = neutro, diferente de zero = destaque. */
export function classeDivergencia(v: number): string {
  if (Math.abs(v) < 0.005) return 'text-muted-foreground'
  return v > 0 ? 'text-warning font-semibold' : 'text-destructive font-semibold'
}

/**
 * Quantos itens mudaram desde a última leitura/gravação — o contador "Alterados" da
 * barra de abas: cada dia de Online/Adquirentes, cada valor do breakdown, cada linha
 * do Extrato e dos Cancelados (incluída, alterada ou removida) conta 1.
 */
export function contarAlterados(atual: DadosManuais, base: DadosManuais): number {
  const a = paraGravar(atual)
  const b = paraGravar(base)
  const igual = (x: unknown, y: unknown) => JSON.stringify(x ?? {}) === JSON.stringify(y ?? {})
  const porDia = <T>(x: Record<string, T>, y: Record<string, T>) => {
    const dias = new Set([...Object.keys(x), ...Object.keys(y)])
    let n = 0
    for (const d of dias) if (!igual(x[d], y[d])) n += 1
    return n
  }
  // Linhas comparadas como conjunto (com repetidas), não pela posição: excluir a 1ª
  // de 10 conta 1, não 10. Linha editada conta 1 (sai uma, entra outra).
  const lista = <T>(x: T[], y: T[]) => {
    const conta = new Map<string, number>()
    for (const l of y) {
      const k = JSON.stringify(l)
      conta.set(k, (conta.get(k) ?? 0) + 1)
    }
    let novas = 0
    for (const l of x) {
      const k = JSON.stringify(l)
      const n = conta.get(k) ?? 0
      if (n > 0) conta.set(k, n - 1)
      else novas += 1
    }
    let saidas = 0
    for (const n of conta.values()) saidas += n
    return Math.max(novas, saidas)
  }
  const cc = ['valor_site_cc1', 'valor_site_cc2', 'valor_site_cc3', 'valor_site_cc4'].filter(
    (k) => (a.conferencia[k] ?? 0) !== (b.conferencia[k] ?? 0)
  ).length
  return (
    porDia(a.online, b.online) +
    porDia(a.adquirente, b.adquirente) +
    cc +
    lista(a.extrato, b.extrato) +
    lista(a.cancelados, b.cancelados) +
    (a.anulacaoVerificar !== b.anulacaoVerificar ? 1 : 0)
  )
}

/**
 * Botão só de ícone: em tela de toque (sem tooltip) ganha largura para mostrar o
 * rótulo visível ao lado do ícone (`ROTULO_TOQUE` no texto).
 */
export const BOTAO_ICONE_TOQUE =
  '[@media(hover:none)]:w-auto [@media(hover:none)]:gap-1.5 [@media(hover:none)]:px-3'
/** Texto do botão de ícone: escondido com mouse, visível no toque. */
export const ROTULO_TOQUE = 'hidden [@media(hover:none)]:inline'

/** Quantidade e valor juntos, como no selo da grade: `3× R$ 30,00` (sem selo quando é zero). */
export const qtdEValor = (qtd: number, valor: number) =>
  qtd > 0 ? `${qtd}× ${formatBRL(valor)}` : formatBRL(valor)

/**
 * Status HTTP da falha do `server.call` (no portal vem em `status`; no `gia dev`,
 * em `requisicao.status`). `undefined` = sem resposta (rede).
 */
export function statusDoErro(e: unknown): number | undefined {
  const erro = e as { status?: unknown; requisicao?: { status?: unknown } } | null
  const status = erro?.status ?? erro?.requisicao?.status
  return typeof status === 'number' ? status : undefined
}

/**
 * Vale tentar de novo? Só o que pode passar sozinho e é rápido: rede, limite do iFood
 * (429) e falha do servidor (5xx). Tempo esgotado (408/504) NÃO se repete — a
 * chamada já esperou 30 s, e repetir prenderia o usuário por minutos (padrão 9 do
 * workspace). Recusa (4xx: permissão, loja sem iFood, credencial — o servidor usa
 * 424 para a recusa do iFood) também não muda tentando de novo: erro na hora.
 */
export function valeTentarDeNovo(e: unknown): boolean {
  const status = statusDoErro(e)
  if (status === 408 || status === 504) return false
  return status === undefined || status === 429 || status >= 500
}
