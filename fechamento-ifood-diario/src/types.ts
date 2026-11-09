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

/** Pedido iFood do fechamento (handler `fechamento`) — os campos da grade do legado. */
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
  venda_concluida: 'OK' | 'Cancelado'
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
  pedidosDw: number
  vendasIfoodSemPedidoDw: number
  pedidosSemIfood: number
  avisos: string[]
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
