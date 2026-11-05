import type { PedidoOperacional, QuemCancelou } from './types'

// As contas do dashboard Operacional, sobre os pedidos resumidos pelo handler
// `operacional`. Funções puras: a tela chama de novo quando muda o canal, sem
// buscar nada. A base de cada número está em docs/gargalos-operacionais-delivery.md.
//
// ── DUAS FAMÍLIAS DE TEMPO ──────────────────────────────────────────────────
//
// - Tempo NA LOJA (aceite, preparo, expedição): a loja registra essas etapas no
//   Maestro, e elas existem em TODA loja. É o núcleo do dashboard.
// - Tempo da ENTREGA (rota e tempo total até a entrega): quem registra é o app de
//   entrega. Há loja em que ele não registra nada — a 01 em outubro/2026 não teve
//   um único "Entregue" em 2.743 pedidos. Nessas lojas esses números não existem,
//   e a tela diz isso em vez de mostrar cartão vazio.
//
// Retirada fica fora dos tempos: o fluxo é outro (na loja 01, preparo de 8 min
// contra 19 min da entrega), e misturar os dois puxaria a mediana para baixo.
// Pedido cancelado também fica fora. E o pedido em que a loja registrou
// embalado/despachado DEPOIS de o app de entrega pegar o pedido também: o
// preparo e a expedição dele não medem nada.

/** As abas da tela: a lista de pedidos e o dashboard Operacional. */
export type AbaReports = 'pedidos' | 'operacional'

/** Rota acima disto é baixa tardia no app de entrega, não tempo de rota. */
export const LIMITE_BAIXA_TARDIA_MIN = 120
/** Célula do mapa de calor com menos pedidos medidos que isto não mostra tempo. */
export const MIN_PEDIDOS_CELULA = 5
/**
 * O mesmo piso no mapa POR DIA: uma hora de um dia só tem poucos pedidos, e com
 * 5 quase todo o mapa ficaria cinza.
 */
export const MIN_PEDIDOS_CELULA_DIA = 3

export const ETAPAS_DA_LOJA = [
  { id: 'aceite', rotulo: 'Aceite', de: 'Recebido', ate: 'Confirmado' },
  { id: 'preparo', rotulo: 'Preparo', de: 'Confirmado', ate: 'Embalado' },
  { id: 'expedicao', rotulo: 'Expedição', de: 'Embalado', ate: 'Despachado' },
] as const
export const ETAPA_ROTA = { id: 'rota', rotulo: 'Rota', de: 'Despachado', ate: 'Entregue' } as const

/** Semana começando na segunda — a leitura da operação. `dia` = `getUTCDay()`. */
export const DIAS_DA_SEMANA = [
  { dia: 1, rotulo: 'Seg' },
  { dia: 2, rotulo: 'Ter' },
  { dia: 3, rotulo: 'Qua' },
  { dia: 4, rotulo: 'Qui' },
  { dia: 5, rotulo: 'Sex' },
  { dia: 6, rotulo: 'Sáb' },
  { dia: 0, rotulo: 'Dom' },
] as const

export const QUEM_CANCELOU: Record<QuemCancelou, string> = {
  cliente: 'Cliente ou plataforma',
  loja: 'Loja',
  ambos: 'Cliente e loja',
  outro: 'Não identificado',
}

// ─── Base ────────────────────────────────────────────────────────────────────

/** Valor na posição `q` da lista ordenada (0,5 = mediana); `null` se vazia. */
export function quantil(valores: number[], q: number): number | null {
  if (valores.length === 0) return null
  const s = [...valores].sort((a, b) => a - b)
  return s[Math.floor(q * (s.length - 1))]
}

/** Média aritmética; `null` se vazia. */
export function media(valores: number[]): number | null {
  return valores.length === 0 ? null : valores.reduce((s, v) => s + v, 0) / valores.length
}

// ── A MÉDIA É O NÚMERO PRINCIPAL ────────────────────────────────────────────
//
// Pedido do usuário em 05/11/2026: no Operacional o número de destaque de cada
// tempo é a MÉDIA (antes era a mediana) — cartões, mapa, linhas e quem cancelou.
// A mediana continua só como detalhe nos cartões do Tempo por etapa.
//
// A média sente o pedido esquecido (um preparo de 13 h puxa a média de uma hora
// inteira para cima), por isso o "90% até" segue ao lado nos cartões do topo, e
// a célula com poucas entregas medidas continua sem tempo.

export interface Faixa {
  media: number | null
  /** 90% dos pedidos levam até isso. */
  p90: number | null
  /** Mínimo, mediana e máximo — vão na dica dos cartões do topo. */
  minimo: number | null
  mediana: number | null
  maximo: number | null
}

function faixa(valores: number[]): Faixa {
  return {
    media: media(valores),
    p90: quantil(valores, 0.9),
    minimo: valores.length ? Math.min(...valores) : null,
    mediana: quantil(valores, 0.5),
    maximo: valores.length ? Math.max(...valores) : null,
  }
}

const ehCancelado = (p: PedidoOperacional) =>
  p.desfecho === 'cancelado' || p.desfecho === 'entregue-cancelado'

/** Tempo na loja (Recebido → Despachado), se o pedido entra nos tempos da loja. */
export function tempoNaLoja(p: PedidoOperacional): number | null {
  if (p.retirada || ehCancelado(p) || p.baixaForaDeOrdem) return null
  const { aceite, preparo, expedicao } = p
  if (aceite == null || preparo == null || expedicao == null) return null
  if (aceite < 0 || preparo < 0 || expedicao < 0) return null
  // Uma casa, como as etapas: a soma de 0,1 + 0,2 não pode virar 0,30000000004.
  return Math.round((aceite + preparo + expedicao) * 10) / 10
}

/** A entrega entra nos tempos de entrega (rota e total). */
function temTempoDeEntrega(p: PedidoOperacional): boolean {
  return (
    p.desfecho === 'entregue' &&
    tempoNaLoja(p) != null &&
    p.rota != null &&
    p.total != null &&
    p.rota >= 0 &&
    p.rota <= LIMITE_BAIXA_TARDIA_MIN
  )
}

/** Dia da semana (0 = domingo) e hora de `YYYY-MM-DD HH:mm:ss`. */
function diaEHora(criadoEm: string): { dia: number; hora: number } {
  const dia = new Date(`${criadoEm.slice(0, 10)}T12:00:00Z`).getUTCDay()
  return { dia, hora: Number(criadoEm.slice(11, 13)) }
}

/** Os canais (origens) dos pedidos, do que tem mais pedidos ao que tem menos. */
export function canaisDosPedidos(pedidos: PedidoOperacional[]): string[] {
  const n = new Map<string, number>()
  for (const p of pedidos) n.set(p.origem, (n.get(p.origem) ?? 0) + 1)
  return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c)
}

export function filtrarCanal(pedidos: PedidoOperacional[], canal: string | null) {
  return canal ? pedidos.filter((p) => p.origem === canal) : pedidos
}

const somaValor = (g: PedidoOperacional[]) =>
  Math.round(g.reduce((s, p) => s + p.valor, 0) * 100) / 100

// ─── Resumo ──────────────────────────────────────────────────────────────────

export interface ResumoOperacional {
  pedidos: number
  /** Entregas (não retiradas, não canceladas) com os tempos da loja. */
  medidos: number
  naLoja: Faixa
  preparo: Faixa
  cancelados: number
  canceladosValor: number
  /**
   * Os tempos da entrega — `null` quando o app de entrega não registrou nenhuma
   * entrega no período (a loja não tem esse dado).
   */
  entrega: {
    medidas: number
    total: Faixa
    /** Entregas que saíram da loja e nunca tiveram a entrega registrada. */
    semEntrega: number
    semEntregaValor: number
    /** Pedidos de entrega (não retirada). */
    entregas: number
  } | null
}

export function resumoOperacional(pedidos: PedidoOperacional[]): ResumoOperacional {
  const naLoja = pedidos.filter((p) => tempoNaLoja(p) != null)
  const comEntrega = pedidos.filter(temTempoDeEntrega)
  const cancelados = pedidos.filter(ehCancelado)
  const semEntrega = pedidos.filter((p) => p.desfecho === 'sem-entrega')
  return {
    pedidos: pedidos.length,
    medidos: naLoja.length,
    naLoja: faixa(naLoja.map((p) => tempoNaLoja(p) as number)),
    preparo: faixa(naLoja.map((p) => p.preparo as number)),
    cancelados: cancelados.length,
    canceladosValor: somaValor(cancelados),
    entrega:
      comEntrega.length === 0
        ? null
        : {
            medidas: comEntrega.length,
            total: faixa(comEntrega.map((p) => p.total as number)),
            semEntrega: semEntrega.length,
            semEntregaValor: somaValor(semEntrega),
            entregas: pedidos.filter((p) => !p.retirada).length,
          },
  }
}

// ─── Tempo por etapa ─────────────────────────────────────────────────────────

export interface EstatisticasDaEtapa {
  chave: string
  rotulo: string
  /** "Confirmado → Embalado" */
  descricao: string
  /** Quantos pedidos entraram na conta. */
  pedidos: number
  minimo: number | null
  media: number | null
  mediana: number | null
  maximo: number | null
}

function estatisticas(valores: number[]) {
  if (valores.length === 0) return { minimo: null, media: null, mediana: null, maximo: null }
  return {
    minimo: Math.min(...valores),
    media: valores.reduce((s, v) => s + v, 0) / valores.length,
    mediana: quantil(valores, 0.5),
    maximo: Math.max(...valores),
  }
}

/**
 * Mínimo, média, mediana e máximo de cada etapa — as da loja sobre as entregas
 * medidas (`tempoNaLoja`), a rota sobre as entregas registradas pelo app de
 * entrega. A rota só entra quando há alguma.
 */
export function estatisticasDasEtapas(pedidos: PedidoOperacional[]): EstatisticasDaEtapa[] {
  const naLoja = pedidos.filter((p) => tempoNaLoja(p) != null)
  const linhas: EstatisticasDaEtapa[] = ETAPAS_DA_LOJA.map((e) => ({
    chave: e.id,
    rotulo: e.rotulo,
    descricao: `${e.de} → ${e.ate}`,
    pedidos: naLoja.length,
    ...estatisticas(naLoja.map((p) => p[e.id] as number)),
  }))
  const comEntrega = pedidos.filter(temTempoDeEntrega)
  if (comEntrega.length > 0) {
    linhas.push({
      chave: ETAPA_ROTA.id,
      rotulo: ETAPA_ROTA.rotulo,
      descricao: `${ETAPA_ROTA.de} → ${ETAPA_ROTA.ate}`,
      pedidos: comEntrega.length,
      ...estatisticas(comEntrega.map((p) => p.rota as number)),
    })
  }
  return linhas
}

// ─── Mapa de calor: dia × hora ───────────────────────────────────────────────
//
// Duas leituras do mesmo mapa:
// - POR DIA DA SEMANA: soma todas as segundas do período numa linha, todas as
//   terças na outra… Só entram os dias da semana que EXISTEM no período (três
//   dias pesquisados = três linhas, não sete).
// - POR DIA: uma linha por data do período pesquisado — só as datas filtradas,
//   nunca o mês inteiro.

export interface CelulaDoMapa {
  pedidos: number
  medidos: number
  naLojaMedia: number | null
  preparoMedia: number | null
}

export interface LinhaDoMapa {
  chave: string
  rotulo: string
}

export interface GradeDoMapa {
  linhas: LinhaDoMapa[]
  /** Chave = `chaveDaCelula(linha.chave, hora)`. */
  celulas: Map<string, CelulaDoMapa>
}

export interface MapaDeCalor {
  /**
   * Horas com movimento, da primeira à última, sem buracos. Hora com pedido
   * avulso (um pedido à 1 h) não entra: esticaria o mapa com colunas vazias.
   */
  horas: number[]
  /** Pedidos criados fora das `horas`. */
  foraDasHoras: number
  semana: GradeDoMapa
  dias: GradeDoMapa
}

export const chaveDaCelula = (linha: string, hora: number) => `${linha}|${hora}`

const ROTULO_DO_DIA = new Map<number, string>(DIAS_DA_SEMANA.map((d) => [d.dia, d.rotulo]))

/** As datas de `de` a `ate`, inclusive. */
function datasDoPeriodo(de: string, ate: string): string[] {
  const datas: string[] = []
  const fim = Date.parse(`${ate}T00:00:00Z`)
  for (let t = Date.parse(`${de}T00:00:00Z`); t <= fim; t += 86_400_000) {
    datas.push(new Date(t).toISOString().slice(0, 10))
  }
  return datas
}

function celula(g: PedidoOperacional[]): CelulaDoMapa {
  const medidos = g.filter((p) => tempoNaLoja(p) != null)
  return {
    pedidos: g.length,
    medidos: medidos.length,
    naLojaMedia: media(medidos.map((p) => tempoNaLoja(p) as number)),
    preparoMedia: media(medidos.map((p) => p.preparo as number)),
  }
}

function agrupar(
  pedidos: PedidoOperacional[],
  linhaDe: (p: PedidoOperacional) => string
): Map<string, CelulaDoMapa> {
  const grupos = new Map<string, PedidoOperacional[]>()
  for (const p of pedidos) {
    const k = chaveDaCelula(linhaDe(p), diaEHora(p.criadoEm).hora)
    const g = grupos.get(k)
    if (g) g.push(p)
    else grupos.set(k, [p])
  }
  const celulas = new Map<string, CelulaDoMapa>()
  for (const [k, g] of grupos) celulas.set(k, celula(g))
  return celulas
}

export function mapaDeCalor(pedidos: PedidoOperacional[], de: string, ate: string): MapaDeCalor {
  const datas = datasDoPeriodo(de, ate)
  const diaDaData = (data: string) => new Date(`${data}T12:00:00Z`).getUTCDay()
  const diasNoPeriodo = new Set(datas.map(diaDaData))

  const porHora = new Map<number, number>()
  for (const p of pedidos) {
    const { hora } = diaEHora(p.criadoEm)
    porHora.set(hora, (porHora.get(hora) ?? 0) + 1)
  }
  // Hora com movimento: ao menos 0,5% dos pedidos (e no mínimo 3).
  const piso = Math.max(3, Math.ceil(pedidos.length * 0.005))
  const comMovimento = [...porHora.entries()].filter(([, n]) => n >= piso).map(([h]) => h)
  const min = comMovimento.length ? Math.min(...comMovimento) : 0
  const max = comMovimento.length ? Math.max(...comMovimento) : -1
  const horas = max < 0 ? [] : Array.from({ length: max - min + 1 }, (_, i) => min + i)
  let foraDasHoras = 0
  for (const [h, n] of porHora) if (h < min || h > max) foraDasHoras += n

  return {
    horas,
    foraDasHoras,
    semana: {
      linhas: DIAS_DA_SEMANA.filter((d) => diasNoPeriodo.has(d.dia)).map((d) => ({
        chave: String(d.dia),
        rotulo: d.rotulo,
      })),
      celulas: agrupar(pedidos, (p) => String(diaEHora(p.criadoEm).dia)),
    },
    dias: {
      linhas: datas.map((data) => ({
        chave: data,
        rotulo: `${ROTULO_DO_DIA.get(diaDaData(data))} ${data.slice(8, 10)}/${data.slice(5, 7)}`,
      })),
      celulas: agrupar(pedidos, (p) => p.criadoEm.slice(0, 10)),
    },
  }
}

// ─── Cancelamentos ───────────────────────────────────────────────────────────

export interface CancelamentosPorQuem {
  por: QuemCancelou
  pedidos: number
  /** Média de minutos do recebimento ao cancelamento. */
  mediaMin: number | null
  /** Soma do valor dos pedidos cancelados pelo grupo. */
  valor: number
}

export function cancelamentosPorQuem(pedidos: PedidoOperacional[]): CancelamentosPorQuem[] {
  const quem = new Map<QuemCancelou, number[]>()
  const valor = new Map<QuemCancelou, number>()
  for (const p of pedidos) {
    if (!ehCancelado(p)) continue
    const por = p.cancelamento?.por ?? 'outro'
    valor.set(por, (valor.get(por) ?? 0) + p.valor)
    const lista = quem.get(por) ?? []
    if (p.cancelamento?.minutos != null) lista.push(p.cancelamento.minutos)
    else lista.push(Number.NaN)
    quem.set(por, lista)
  }
  return [...quem.entries()]
    .map(([por, mins]) => ({
      por,
      pedidos: mins.length,
      mediaMin: media(mins.filter((m) => Number.isFinite(m))),
      valor: valor.get(por) ?? 0,
    }))
    .sort((a, b) => b.pedidos - a.pedidos)
}

// ─── Formato ─────────────────────────────────────────────────────────────────

export const TRACO = '—'

/** `32 min`; acima de uma hora, `1h 05`. */
export function fmtMin(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return TRACO
  const m = Math.round(v)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}`
}

/**
 * Minutos → `0m 52s`, `22m 34s`, `1h 04m 42s`. Cada valor na própria forma
 * (pedido do usuário em 05/11/2026): a hora só aparece quando o valor tem hora.
 *
 * Os segundos — e os minutos, quando há hora — têm sempre dois dígitos. Com o
 * número alinhado à direita e `tabular-nums`, isso põe o `m` e o `s` de todas as
 * linhas na mesma coluna: `0m 06s` embaixo de `20m 36s` embaixo de `1h 54m 42s`.
 * Arredonda para o segundo.
 */
export function fmtDuracao(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return TRACO
  const total = Math.max(0, Math.round(v * 60))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m ${s}s` : `${m}m ${s}s`
}

/** Fração → `26,7%`. */
export function fmtPct(fracao: number | null | undefined): string {
  if (fracao == null || !Number.isFinite(fracao)) return TRACO
  return `${(fracao * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function fmtInt(v: number): string {
  return v.toLocaleString('pt-BR')
}

/** `R$ 126,9 mil`, `R$ 1,2 mi`, `R$ 850`. */
export function fmtBRLCompacto(v: number): string {
  const abs = Math.abs(v)
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  if (abs >= 1e6) return `R$ ${fmt(v / 1e6)} mi`
  if (abs >= 1e3) return `R$ ${fmt(v / 1e3)} mil`
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

export function plural(n: number, um: string, varios: string): string {
  return `${fmtInt(n)} ${n === 1 ? um : varios}`
}

/** Fração segura: `null` com denominador zero. */
export function fracao(n: number, d: number): number | null {
  return d > 0 ? n / d : null
}
