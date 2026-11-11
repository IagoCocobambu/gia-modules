/** Loja do seletor (handler `lojas`): uma OPERAÇÃO do escopo do usuário. */
export interface FechamentoLoja {
  /** `operacao_ref` (ex.: "54 cb", "08 vst") — a chave da pesquisa. */
  ref: string
  /** Empresa dona da operação (de onde vem o merchant do iFood). */
  empresaId: number
  nome: string
  /** Número da loja no DW; `null` quando o cadastro não tem. */
  locRef: string | null
  /** A Empresa da operação tem o merchant do iFood no cadastro. */
  temIfood: boolean
  ativo: boolean
}

/** Tipo de uma forma de pagamento, com os nomes do legado. */
export type TipoPagamento = 'ONLINE' | 'ONLINE VR' | 'OFFLINE' | 'SEM_CLASSIFICACAO'

export interface Pagamento {
  descricao: string
  valor: number | null
  tipo: TipoPagamento
}

/** Pedido iFood do fechamento (montado em `regras.ts` a partir dos handlers `pedidos` e `vendas`) — os campos da grade do legado. */
export interface PedidoIfood {
  id: string
  n_pedido: string
  n_parceiro: string
  data_calc: string
  data_de_criacao: string
  origem: string
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  total_pago_dw: number
  desconto_total: number
  forma_de_pagamentos: string
  nome_loja: string
  id_loja: string
  agendado: string
  incentivo_parceiro: number
  incentivo_loja: number
  taxa_extra_parceiro: number
  confirmado_por: string
  total_parceiro: number
  tipo_pedido: string
  data_cancelamento: string
  origem_cancelamento: string
  motivo_cancelamento: string
  cancelamento_contestavel: string
  motivo_impossibilidade: string
  data_limite_contestacao: string
  cancelamento_parcial: string
  ifood_reembolsa: 'N/A' | 'SIM' | 'NÃO' | 'VERIFICAR'
  desconto_copart: number
  /**
   * OK / Cancelado — e, só enquanto a consulta não terminou, Aguardando: o pedido ainda
   * não foi achado nas páginas do iFood que já chegaram.
   */
  venda_concluida: 'OK' | 'Cancelado' | 'Aguardando'
  tipos: TipoPagamento[]
  pagamentos: Pagamento[]
  total_pago_online: number
  total_pago_adquirentes: number
  total_pago_offline: number
  qtd_sem_classificacao: number
  valor_sem_classificacao: number
  formas_sem_classificacao: string[]
  encontrado_no_ifood: boolean
  /** Restaurante do iFood em que o pedido foi achado. */
  merchant_ifood: string
}

export interface FechamentoResposta {
  pedidos: PedidoIfood[]
  avisos: string[]
}

/** Campos que as regras calculam (o resto do pedido vem do DW e do iFood). */
type CamposCalculados =
  | 'total_pago'
  | 'ifood_reembolsa'
  | 'desconto_copart'
  | 'venda_concluida'
  | 'tipos'
  | 'pagamentos'
  | 'total_pago_online'
  | 'total_pago_adquirentes'
  | 'total_pago_offline'
  | 'qtd_sem_classificacao'
  | 'valor_sem_classificacao'
  | 'formas_sem_classificacao'

/** Pedido do DW no formato do legado, antes do cruzamento e das contas (handler `pedidos`). */
export type PedidoDw = Omit<PedidoIfood, CamposCalculados>

/** Forma "ONLINE VR" do cadastro de formas de pagamento. */
export interface FormaOnlineVr {
  /** Trecho em maiúsculas procurado dentro da forma de pagamento. */
  descricao: string
  /** Chave da origem (normalizada); vazia = vale para todas. */
  origem: string
}

/** Handler `pedidos`. */
export interface RespostaPedidos {
  pedidos: PedidoDw[]
  formasVr: FormaOnlineVr[]
  /** Operação com canal próprio (Vasto na loja do CB). */
  canalProprio: boolean
  /** Nome do restaurante da operação no iFood. */
  restaurante: string | null
}

/** Venda do iFood já reduzida ao que o cruzamento usa (handler `vendas`). */
export interface VendaIfood {
  shortId: string
  idLoja: string | null
  totalParceiro: number
  confirmado: 'SIM' | 'NÃO'
  tipoPedido: string
  canal: string
  dataCancelamento: string
  origemCancelamento: string
  motivoCancelamento: string
  cancelamentoContestavel: string
  motivoImpossibilidade: string
  dataLimiteContestacao: string
  cancelamentoParcial: 'SIM' | 'NÃO'
}

/** Handler `vendas` (uma página). */
export interface RespostaVendas {
  vendas: VendaIfood[]
  totalPaginas: number
  aviso: string | null
}

/** Pesquisa feita (foto do clique em Pesquisar). */
export interface Consulta {
  operacaoRef: string
  lojaNome: string
  data: string
}

/** Os cards do Fechamento iFood Diário do legado (`SummaryData`). */
export interface TotaisDia {
  ifood_online: number
  descontos_offline_vr: number
  ifood_adquirentes: number
  descontos_loja_online: number
  descontos_loja_offline: number
  descontos_loja_vr: number
  desconto_copart: number
  valor_sem_classificacao: number
  /** Quantidade de trechos de pagamento sem classificação. */
  pagamentos_sem_classificacao: number
  /** Formas sem classificação, sem repetir. */
  formas_sem_classificacao: string[]
}

/** Card que filtra a tabela. */
export type FiltroTotal = Exclude<keyof TotaisDia, 'formas_sem_classificacao'>
