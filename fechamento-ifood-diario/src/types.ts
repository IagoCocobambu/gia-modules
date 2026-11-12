/** Restaurante do iFood de uma operação da loja. */
export interface RestauranteIfood {
  /** `operacao_ref` da operação dona do restaurante (ex.: "17 cbx"); vazio = da Empresa. */
  operacao: string
  /** UUID do restaurante (merchant) no iFood. */
  merchant: string
}

/** Loja do seletor (handler `lojas`): uma Empresa do escopo do usuário. */
export interface FechamentoLoja {
  /** Empresa — a chave da pesquisa. */
  empresaId: number
  nome: string
  /** Número da loja no DW; `null` quando o cadastro não tem. */
  locRef: string | null
  /** Restaurantes do iFood de todas as operações da loja; vazio = sem iFood. */
  restaurantes: RestauranteIfood[]
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
  /** Criação do pedido em UTC (DW): desempata o mesmo código em dois restaurantes. */
  criado_utc: string
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
  /** Operação dona desse restaurante (ex.: "17 cbx"). */
  operacao_ifood: string
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
  /** Pedidos dos canais do iFood (iFood e iFood Vasto) de todas as operações da loja. */
  pedidos: PedidoDw[]
  formasVr: FormaOnlineVr[]
}

/** Venda do iFood já reduzida ao que o cruzamento usa (handler `vendas`). */
export interface VendaIfood {
  shortId: string
  /** Restaurante do iFood em que a venda está (UUID). */
  merchant: string
  /** `createdAt` da venda (UTC). */
  criadoEm: string
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
  /** Nome do restaurante no iFood (só na página 1). */
  restaurante: string | null
  totalPaginas: number
  aviso: string | null
}

/** Pesquisa feita (foto do clique em Pesquisar). */
export interface Consulta {
  empresaId: number
  lojaNome: string
  /** Restaurantes do iFood da loja, na hora da pesquisa. */
  restaurantes: RestauranteIfood[]
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
