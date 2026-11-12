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
// iFood (handler `vendas`, por restaurante) chegam separados e são cruzados aqui. A
// loja junta todas as operações: os pedidos iFood do DW de todas e as vendas de todos
// os restaurantes do iFood da loja. O módulo só lê:
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

/** Restaurante do iFood já com o nome, para a coluna "Restaurante no iFood". */
export interface RestauranteNomeado {
  nome: string
  operacao: string
}

/**
 * Diferença máxima entre a criação do pedido no DW e a da venda no iFood para serem o
 * mesmo pedido. As duas vêm iguais (medido em 08/11/2026: 0 s em todos os pedidos das
 * lojas 03, 08, 17 e 25); o código curto (n_parceiro = shortId) se repete entre
 * restaurantes da loja, e até no mesmo restaurante, em horas diferentes do dia.
 */
const TOLERANCIA_CRIACAO_MS = 10 * 60_000

/** Distância entre as criações (ms); `null` quando uma das datas falta. */
function distancia(p: PedidoDw, v: VendaIfood): number | null {
  const a = Date.parse(p.criado_utc)
  const b = Date.parse(v.criadoEm)
  return Number.isNaN(a) || Number.isNaN(b) ? null : Math.abs(a - b)
}

/** Campos que a venda do iFood traz para o pedido — a `MergeIfoodData` do legado. */
function cruzar(p: PedidoDw, v: VendaIfood, restaurante: RestauranteNomeado | undefined): void {
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
  p.merchant_ifood = restaurante?.nome || 'iFood'
  p.operacao_ifood = restaurante?.operacao ?? ''
}

/**
 * O fechamento do dia: cruza os pedidos do DW com as vendas do iFood (de todos os
 * restaurantes da loja) e calcula cada pedido.
 *
 * Par pedido × venda: o mesmo código (n_parceiro do DW = shortId do iFood) e a mesma
 * hora de criação (até `TOLERANCIA_CRIACAO_MS`); sem a hora num dos lados, vale só o
 * código, como no legado. Com mais de um candidato, fica o par de horas mais
 * próximas; cada venda cruza com um pedido só (no legado, o primeiro levava).
 */
export function montarFechamento(
  dw: RespostaPedidos,
  vendasDoDia: VendaIfood[],
  restaurantes: ReadonlyMap<string, RestauranteNomeado>,
  /** `false` enquanto ainda chegam páginas do iFood: o não achado fica Aguardando. */
  completo = true
): PedidoIfood[] {
  const porCodigo = new Map<string, VendaIfood[]>()
  for (const v of vendasDoDia) {
    const lista = porCodigo.get(v.shortId)
    if (lista) lista.push(v)
    else porCodigo.set(v.shortId, [v])
  }
  const pedidos = dw.pedidos.map((p) => ({ ...p }))
  const pares: { p: PedidoDw; v: VendaIfood; dist: number }[] = []
  for (const p of pedidos) {
    for (const v of (p.n_parceiro && porCodigo.get(p.n_parceiro)) || []) {
      const dist = distancia(p, v)
      if (dist === null || dist <= TOLERANCIA_CRIACAO_MS) {
        pares.push({ p, v, dist: dist ?? Number.MAX_SAFE_INTEGER })
      }
    }
  }
  // `sort` é estável: no empate vale a ordem do DW e a das vendas, como no legado.
  pares.sort((a, b) => a.dist - b.dist)
  const pedidosCruzados = new Set<PedidoDw>()
  const vendasUsadas = new Set<VendaIfood>()
  for (const { p, v } of pares) {
    if (pedidosCruzados.has(p) || vendasUsadas.has(v)) continue
    pedidosCruzados.add(p)
    vendasUsadas.add(v)
    cruzar(p, v, restaurantes.get(v.merchant))
  }
  // Como no legado, o canal do pedido cruzado (o do iFood) tem que ser iFood — sai,
  // por exemplo, o IFOOD_SHOP. O não cruzado fica: o servidor já trouxe só os canais
  // iFood e iFood Vasto do DW.
  return pedidos
    .filter((p) => !p.encontrado_no_ifood || normalizarOrigem(p.origem || 'Outros') === 'ifood')
    .map((p) => calcular(p, dw.formasVr, completo))
    .sort((a, b) => a.data_de_criacao.localeCompare(b.data_de_criacao))
}
