import {
  CONFERENCIA_BREAKDOWN_IDS,
  CONFERENCIA_CATEGORIAS,
  type CategoriaConferencia,
} from './conferencia'
import type {
  AdquirenteManualDia,
  LinhaAdquirenteDia,
  LinhaConferencia,
  LinhaExtrato,
  LinhaLedger,
  LinhaOnlineDia,
  LinhaRecebimento,
  OnlineManualDia,
} from './types'

// Regras de cálculo do fechamento mensal — porte FIEL de `utils/formulasLedger.ts`
// do legado (decisão do produto: os números têm de bater com a tela antiga, mesmo
// onde a regra parece estranha; os pontos suspeitos estão no PRD, §Pendências).
// Não "corrija" nada aqui sem combinar com o financeiro.

const DESC_PROMO_IFOOD = 'Promoção custeada pelo iFood'
const DESC_PROMO_LOJA = 'Promoção custeada pela loja'
const DESC_PROMO_LOJA_DEL = 'Promoção custeada pela loja no delivery'
const CLASS_PROMO_REDE = 'Promoção custeada pela rede'

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const fato = (f: string) => f.trim().toLowerCase()
const isCancelTotal = (r: LinhaLedger) => fato(r.fatoGerador) === 'cancelamento total'
const isCancelParcial = (r: LinhaLedger) => fato(r.fatoGerador) === 'cancelamento parcial'
const isPromoLoja = (r: LinhaLedger) =>
  r.descricao === DESC_PROMO_LOJA || r.descricao === DESC_PROMO_LOJA_DEL
const isPromoIfood = (r: LinhaLedger) => r.descricao === DESC_PROMO_IFOOD

type Pred = (r: LinhaLedger) => boolean
const sumTotal = (rows: LinhaLedger[], p: Pred) =>
  round2(rows.filter(p).reduce((s, r) => s + r.total, 0))
const sumValor = (rows: LinhaLedger[], p: Pred) =>
  round2(rows.filter(p).reduce((s, r) => s + r.valor, 0))
const countIf = (rows: LinhaLedger[], p: Pred) => rows.filter(p).length

/** Todos os dias do mês `AAAA-MM`, em `AAAA-MM-DD`. */
export function diasDoMes(mes: string): string[] {
  const [y, m] = mes.split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`)
}

/** Lançamentos agrupados pelo dia do pedido (os de "Ocorrências" ficam de fora). */
export function ledgerPorDia(ledger: LinhaLedger[]): Map<string, LinhaLedger[]> {
  const mapa = new Map<string, LinhaLedger[]>()
  for (const r of ledger) {
    if (r.data === 'Ocorrências') continue
    const dia = r.data.slice(0, 10)
    const lista = mapa.get(dia)
    if (lista) lista.push(r)
    else mapa.set(dia, [r])
  }
  return mapa
}

export function linhaOnlineDoDia(
  dia: string,
  doDia: LinhaLedger[],
  manual: OnlineManualDia | undefined
): LinhaOnlineDia {
  const st = (s: LinhaLedger['status']) => (r: LinhaLedger) => r.status === s

  const ifoodOnline = sumTotal(doDia, st('ONLINE'))
  const descIfood = (r: LinhaLedger) => r.status === 'ONLINE' && isPromoIfood(r)
  const promoRede = sumValor(
    doDia,
    (r) => r.status === 'ONLINE' && r.classificacao === CLASS_PROMO_REDE
  )
  const sdIfoodOnline = ifoodOnline
  const cbOnline = manual?.cbOnline ?? 0
  const difOnline = round2(sdIfoodOnline - cbOnline)

  const descOff = (r: LinhaLedger) => r.status === 'OFFLINE' && isPromoIfood(r)
  const descVr = (r: LinhaLedger) => r.status === 'ONLINE VR' && isPromoIfood(r)
  const descOffRs = sumValor(doDia, descOff)
  const descVrRs = sumValor(doDia, descVr)
  const sdDescontoIfood = round2(descOffRs + descVrRs)
  const cbDescontosIfood = manual?.cbDescontosIfood ?? 0
  const difDescontoIfood = round2(sdDescontoIfood - cbDescontosIfood)

  const lojaOn = (r: LinhaLedger) => r.status === 'ONLINE' && isPromoLoja(r)
  const lojaOff = (r: LinhaLedger) => r.status === 'OFFLINE' && isPromoLoja(r)
  const descLojaOnlineRs = -sumValor(doDia, lojaOn)
  const descLojaOffRs = -sumValor(doDia, lojaOff)
  const sdDescontoLoja = round2(descLojaOnlineRs + descLojaOffRs)
  const cbDescontosLoja = manual?.cbDescontosLoja ?? null
  const difDescontoLoja = round2(sdDescontoLoja - (cbDescontosLoja ?? 0))

  return {
    dia,
    previsao: manual?.previsao ?? '',
    ifoodOnline,
    descIfoodQtd: countIf(doDia, descIfood),
    descIfoodRs: sumValor(doDia, descIfood),
    cancelTotalQtd: countIf(doDia, isCancelTotal),
    cancelTotalRs: -sumValor(doDia, isCancelTotal),
    cancelParcialQtd: countIf(doDia, isCancelParcial),
    cancelParcialRs: -sumValor(doDia, isCancelParcial),
    promoRede,
    sdIfoodOnline,
    cbOnline,
    difOnline,
    descOffQtd: countIf(doDia, descOff),
    descOffRs,
    descVrQtd: countIf(doDia, descVr),
    descVrRs,
    sdDescontoIfood,
    cbDescontosIfood,
    difDescontoIfood,
    descLojaOnlineQtd: countIf(doDia, lojaOn),
    descLojaOnlineRs,
    descLojaOffQtd: countIf(doDia, lojaOff),
    descLojaOffRs,
    sdDescontoLoja,
    cbDescontosLoja,
    difDescontoLoja,
    // Legado: # Total = # Online + # Desconto iFood (o # Desconto LOJA fica de fora).
    difTotal: round2(difOnline + difDescontoIfood),
    comentario: manual?.comentario ?? '',
  }
}

export function montarOnline(
  porDia: Map<string, LinhaLedger[]>,
  mes: string,
  manual: Record<string, OnlineManualDia>
): LinhaOnlineDia[] {
  return diasDoMes(mes).map((d) => linhaOnlineDoDia(d, porDia.get(d) ?? [], manual[d]))
}

export function linhaAdquirenteDoDia(
  dia: string,
  doDia: LinhaLedger[],
  manual: AdquirenteManualDia | undefined
): LinhaAdquirenteDia {
  const vr = (r: LinhaLedger) => r.status === 'ONLINE VR'
  const ifoodVr = sumTotal(doDia, vr)
  const descIfood = (r: LinhaLedger) => vr(r) && isPromoIfood(r)
  const descIfoodRs = sumValor(doDia, descIfood)
  const cancelTotal = (r: LinhaLedger) => vr(r) && isCancelTotal(r)
  const cancelParcial = (r: LinhaLedger) => vr(r) && isCancelParcial(r)
  const sdIfoodVr = round2(ifoodVr - descIfoodRs)
  const caixa = manual?.caixa ?? 0
  return {
    dia,
    previsao: manual?.previsao ?? '',
    ifoodVr,
    descIfoodQtd: countIf(doDia, descIfood),
    descIfoodRs,
    cancelTotalQtd: countIf(doDia, cancelTotal),
    cancelTotalRs: -sumValor(doDia, cancelTotal),
    cancelParcialQtd: countIf(doDia, cancelParcial),
    cancelParcialRs: -sumValor(doDia, cancelParcial),
    // Legado: "Desconto LOJA VR" usa o MESMO filtro de "Descontos iFood" (promoção
    // custeada pelo iFood em ONLINE VR). Mantido — ver PRD, Pendências.
    descLojaVrQtd: countIf(doDia, descIfood),
    descLojaVrRs: descIfoodRs,
    promoRede: -sumValor(doDia, (r) => vr(r) && r.classificacao === CLASS_PROMO_REDE),
    sdIfoodVr,
    caixa,
    difTotal: round2(sdIfoodVr - caixa),
    comentario: manual?.comentario ?? '',
  }
}

export function montarAdquirentes(
  porDia: Map<string, LinhaLedger[]>,
  mes: string,
  manual: Record<string, AdquirenteManualDia>
): LinhaAdquirenteDia[] {
  return diasDoMes(mes).map((d) => linhaAdquirenteDoDia(d, porDia.get(d) ?? [], manual[d]))
}

function filtroCategoria(rotulo: string, cat: Pick<CategoriaConferencia, 'descricao' | 'impacto'>) {
  return (r: LinhaLedger) =>
    r.competenciaLabel === rotulo &&
    (!cat.impacto || r.impactoRepasse === cat.impacto) &&
    (!cat.descricao || r.descricao === cat.descricao)
}

export function montarConferencia(
  ledger: LinhaLedger[],
  mes: string,
  manual: Record<string, number>,
  lojaNome: string
): LinhaConferencia[] {
  const rotulo = ledger.find((r) => r.competencia === mes)?.competenciaLabel ?? ''
  const valores = new Map<string, number>()

  for (const cat of CONFERENCIA_CATEGORIAS) {
    if (cat.tipo === 'sumifs_desc') {
      valores.set(cat.id, sumValor(ledger, filtroCategoria(rotulo, cat)))
    } else if (cat.tipo === 'avg_percent') {
      const f = filtroCategoria(rotulo, cat)
      const linhas = ledger.filter(f)
      valores.set(
        cat.id,
        linhas.length === 0
          ? 0
          : round2(linhas.reduce((s, r) => s + r.percentualTaxa, 0) / linhas.length)
      )
    } else if (cat.tipo === 'manual') {
      valores.set(cat.id, manual[cat.id] ?? 0)
    }
  }

  // Subtotais e referências podem apontar para linhas que vêm depois (3 passadas, como no legado).
  for (let passada = 0; passada < 3; passada++) {
    for (const cat of CONFERENCIA_CATEGORIAS) {
      if (cat.tipo === 'subtotal' || cat.tipo === 'total_depositar') {
        valores.set(
          cat.id,
          round2((cat.somaIds ?? []).reduce((s, id) => s + (valores.get(id) ?? 0), 0))
        )
      } else if (cat.tipo === 'ref') {
        const v = valores.get(cat.refId ?? '') ?? 0
        valores.set(cat.id, cat.negate ? -v : v)
      } else if (cat.tipo === 'difference') {
        const base = (cat.somaIds ?? []).reduce((s, id) => s + (valores.get(id) ?? 0), 0)
        const manuais = CONFERENCIA_BREAKDOWN_IDS.reduce((s, id) => s + (valores.get(id) ?? 0), 0)
        valores.set(cat.id, round2(base - manuais))
      }
    }
  }

  return CONFERENCIA_CATEGORIAS.map((cat) => ({
    id: cat.id,
    label: cat.id === 'valor_site_cc1' && lojaNome ? lojaNome : cat.label,
    grupo: cat.grupo,
    tipo: cat.tipo,
    descricao: cat.descricao,
    valor: valores.get(cat.id) ?? 0,
  }))
}

function dataBrParaDate(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim())
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null
}

/**
 * Malote do extrato num raio de 1 dia da data de pagamento.
 * Legado: só reconhece a data do movimento em DD/MM/AAAA. O extrato é gravado e
 * digitado em AAAA-MM-DD, então na prática a coluna Extrato fica zerada — mantido
 * igual ao legado por decisão do produto (ver PRD, Pendências).
 */
function maloteDoDia(extrato: LinhaExtrato[], dataPagamentoBr: string): number {
  const alvo = dataBrParaDate(dataPagamentoBr)
  if (!alvo) return 0
  const t = alvo.getTime()
  return round2(
    extrato
      .filter((e) => {
        const d = dataBrParaDate(e.dataMovimento)
        return d !== null && Math.abs(d.getTime() - t) <= 86_400_000
      })
      .reduce((s, e) => s + e.malote, 0)
  )
}

export function montarRecebimento(
  ledger: LinhaLedger[],
  extrato: LinhaExtrato[]
): LinhaRecebimento[] {
  const mapa = new Map<string, LinhaRecebimento>()
  for (const r of ledger) {
    if (r.impactoRepasse !== 'SIM' || !r.dataRepasse) continue
    const chave = `${r.competenciaLabel}|${r.dataRepasse}`
    let linha = mapa.get(chave)
    if (!linha) {
      linha = {
        competencia: r.competenciaLabel,
        dataPagamento: r.dataRepasse,
        siteRestaurante: 0,
        extrato: 0,
        diferenca: 0,
      }
      mapa.set(chave, linha)
    }
    linha.siteRestaurante = round2(linha.siteRestaurante + r.valor)
  }

  // Legado: ordena a data DD/MM/AAAA como texto (agrupa pelo dia do mês).
  const linhas = [...mapa.values()].sort((a, b) => a.dataPagamento.localeCompare(b.dataPagamento))
  for (let i = 0; i < linhas.length; i++) {
    const row = linhas[i]
    let valor = maloteDoDia(extrato, row.dataPagamento)
    // Datas de repasse repetidas: desconta o Site da linha vizinha (evita malote em dobro).
    const ant = linhas[i - 1]
    const prox = linhas[i + 1]
    if (ant?.dataPagamento === row.dataPagamento) valor -= ant.siteRestaurante
    else if (prox?.dataPagamento === row.dataPagamento) valor -= prox.siteRestaurante
    row.extrato = round2(valor)
    row.diferenca = round2(row.siteRestaurante - row.extrato)
  }
  return linhas
}

export function somar<T>(linhas: T[], campo: (l: T) => number | null): number {
  return round2(linhas.reduce((s, l) => s + (campo(l) ?? 0), 0))
}
