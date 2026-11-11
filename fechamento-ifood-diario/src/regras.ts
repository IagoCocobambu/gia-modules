import type {
  FormaOnlineVr,
  Pagamento,
  PedidoDw,
  PedidoIfood,
  RespostaPedidos,
  TipoPagamento,
  VendaIfood,
} from './types'

// As regras do fechamento — a `MergeIfoodData` do legado e as contas do `App.tsx` do
// front antigo (`enrichedTransactions` + `calculateSummary`, este último em
// `helpers.ts`). Rodam na tela porque a consulta é feita em partes, em paralelo, para
// mostrar o progresso: os pedidos do DW (handler `pedidos`) e as páginas de vendas do
// iFood (handler `vendas`) chegam separados e são cruzados aqui. O módulo só lê:
// nenhum valor calculado volta ao servidor.
//
// A classificação e as contas são as mesmas do legado, conferidas pedido a pedido.

/** Sufixo que a API põe nas formas pagas antes, no app ou no parceiro. */
const PRE_PAGO = /\s*-\s*PRE\s+PAGO\s*$/i
/** Cartão mascarado (`**** 1234 - Amex` → `Amex`) — a `trimPaymentDescription` do legado. */
const CARTAO_MASCARADO = /\*\*\*\*\s\d{4}\s-\s/

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(valores: number[]): number {
  return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
}

/**
 * Chave da origem — a `normalizeOrigemKey` do legado: minúsculas, espaços viram `_`,
 * `APP CB` = `App Coco Bambu`, `99 Food` = `99Food`.
 */
function normalizarOrigem(origem: string | null | undefined): string {
  if (!origem) return ''
  const s = origem.trim().toLowerCase().replace(/\s+/g, ' ')
  const apelidos: Record<string, string> = { 'app cb': 'app coco bambu', '99 food': '99food' }
  return (apelidos[s] ?? s).replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Tipo de um trecho de pagamento — a `classifyPaymentSegment` do legado, nesta ordem:
 * 1. vazio ou `DESCONHECIDO` → SEM_CLASSIFICACAO;
 * 2. contém (sem o " - PRE PAGO") uma forma "ONLINE VR" do cadastro, da mesma origem
 *    do pedido ou sem origem → ONLINE VR;
 * 3. termina em " - PRE PAGO" → ONLINE;
 * 4. qualquer outro → OFFLINE.
 */
function classificar(
  descricao: string,
  origemPedido: string,
  formasVr: FormaOnlineVr[]
): TipoPagamento {
  const bruto = descricao.trim()
  const semCartao = bruto.replace(CARTAO_MASCARADO, '').trim().toUpperCase()
  if (semCartao === '' || semCartao === 'DESCONHECIDO') return 'SEM_CLASSIFICACAO'
  const semPrePago = semCartao.replace(PRE_PAGO, '').trim()
  const vr = formasVr.some(
    (f) => (f.origem === '' || f.origem === origemPedido) && semPrePago.includes(f.descricao)
  )
  if (vr) return 'ONLINE VR'
  return PRE_PAGO.test(bruto) ? 'ONLINE' : 'OFFLINE'
}

/** `forma_de_pagamentos` → trechos, como o legado: separa em toda vírgula ou ponto e vírgula. */
function separarPagamentos(bruto: string): { descricao: string; valor: number | null }[] {
  return bruto
    .split(/[,;]/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => {
      const m = /^(.*?)\s*\(([\d.,]+)\)$/.exec(parte)
      return m
        ? { descricao: m[1].trim(), valor: parseFloat(m[2].replace(',', '.')) }
        : { descricao: parte, valor: null }
    })
}

/** As contas do `App.tsx` do legado (`enrichedTransactions` + parte do `calculateSummary`). */
function calcular(p: PedidoDw, formasVr: FormaOnlineVr[], completo: boolean): PedidoIfood {
  const origemChave = normalizarOrigem(p.origem)
  const trechosBrutos = p.forma_de_pagamentos ? p.forma_de_pagamentos.split(/[,;]/).length : 0
  const pagamentos: Pagamento[] = separarPagamentos(p.forma_de_pagamentos).map((t) => ({
    ...t,
    tipo: classificar(t.descricao, origemChave, formasVr),
  }))

  const total = somar([p.valor_da_entrega, p.valor_do_pedido, -p.incentivo_loja])
  // Trecho sem "(valor)": vale o total do pedido se for o único, senão zero (legado).
  // As colunas por grupo usavam o total do DW; o card "sem classificação", o calculado.
  const valorDe = (pg: Pagamento, totalSemValor: number) =>
    pg.valor ?? (trechosBrutos === 1 ? totalSemValor : 0)
  const doTipo = (tipo: TipoPagamento) =>
    somar(pagamentos.filter((pg) => pg.tipo === tipo).map((pg) => valorDe(pg, p.total_pago_dw)))
  const semClassificacao = pagamentos.filter((pg) => pg.tipo === 'SEM_CLASSIFICACAO')

  const incLoja = p.incentivo_loja
  const reembolsa =
    incLoja === 0 ? 'N/A' : incLoja === 12 ? 'SIM' : incLoja <= 10 ? 'NÃO' : 'VERIFICAR'
  const ok = p.origem_cancelamento.trim() === '' && p.confirmado_por.trim().toUpperCase() === 'SIM'

  return {
    ...p,
    total_pago: total,
    ifood_reembolsa: reembolsa,
    desconto_copart: somar([p.incentivo_parceiro, -p.taxa_extra_parceiro]),
    // Antes de todas as vendas do iFood chegarem, não achado ainda não é Cancelado.
    venda_concluida: ok ? 'OK' : !completo && !p.encontrado_no_ifood ? 'Aguardando' : 'Cancelado',
    tipos: [...new Set(pagamentos.map((pg) => pg.tipo))],
    pagamentos,
    total_pago_online: doTipo('ONLINE'),
    total_pago_adquirentes: doTipo('ONLINE VR'),
    total_pago_offline: doTipo('OFFLINE'),
    qtd_sem_classificacao: semClassificacao.length,
    valor_sem_classificacao: somar(semClassificacao.map((pg) => valorDe(pg, total))),
    formas_sem_classificacao: [
      ...new Set(
        semClassificacao
          .map((pg) => pg.descricao.replace(CARTAO_MASCARADO, '').trim() || pg.descricao.trim())
          .filter(Boolean)
      ),
    ],
  }
}

/** Campos que a venda do iFood traz para o pedido — a `MergeIfoodData` do legado. */
function cruzar(p: PedidoDw, v: VendaIfood, restaurante: string): void {
  p.encontrado_no_ifood = true
  if (v.idLoja !== null) p.id_loja = v.idLoja
  p.total_parceiro = v.totalParceiro
  p.confirmado_por = v.confirmado
  p.tipo_pedido = v.tipoPedido
  p.origem = v.canal
  p.data_cancelamento = v.dataCancelamento
  p.origem_cancelamento = v.origemCancelamento
  p.motivo_cancelamento = v.motivoCancelamento
  p.cancelamento_contestavel = v.cancelamentoContestavel
  p.motivo_impossibilidade = v.motivoImpossibilidade
  p.data_limite_contestacao = v.dataLimiteContestacao
  p.cancelamento_parcial = v.cancelamentoParcial
  p.merchant_ifood = restaurante
}

/**
 * O fechamento do dia: cruza os pedidos do DW com as vendas do iFood e calcula cada
 * pedido. Só os pedidos do canal iFood entram (na operação com canal próprio, o
 * servidor já filtrou o canal do DW).
 */
export function montarFechamento(
  dw: RespostaPedidos,
  vendasDoDia: VendaIfood[],
  restaurante: string,
  /** `false` enquanto ainda chegam páginas do iFood: o não achado fica Aguardando. */
  completo = true
): PedidoIfood[] {
  // n_parceiro do DW = shortId do iFood. O legado tirava a venda do dicionário ao
  // cruzar: dois pedidos com o mesmo n_parceiro, só o primeiro leva.
  const vendas = new Map<string, VendaIfood>()
  for (const v of vendasDoDia) vendas.set(v.shortId, v)
  const pedidos = dw.pedidos.map((p) => ({ ...p }))
  for (const p of pedidos) {
    const v = p.n_parceiro ? vendas.get(p.n_parceiro) : undefined
    if (!v) continue
    vendas.delete(p.n_parceiro)
    cruzar(p, v, restaurante)
  }
  // Operação principal, como no legado: o canal (do iFood, quando cruzado; senão o do
  // DW) tem que ser iFood — sai, por exemplo, o IFOOD_SHOP.
  return pedidos
    .filter((p) => dw.canalProprio || normalizarOrigem(p.origem || 'Outros') === 'ifood')
    .map((p) => calcular(p, dw.formasVr, completo))
    .sort((a, b) => a.data_de_criacao.localeCompare(b.data_de_criacao))
}
