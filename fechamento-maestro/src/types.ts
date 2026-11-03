// Tipos do domínio — fechamento dos pedidos de delivery do Maestro, lidos da API
// do DW (`/Delivery/?loc_ref=`) e conciliados no handler `src/server/fechamento.ts`.
// Os nomes dos campos seguem o JSON da API e os do legado (Fechamento Diário
// Maestro, UniGUI), pra que a tela e o export batam com ele.

/** Loja que o usuário pode consultar: Empresa do escopo com número de loja no nome. */
export interface FechamentoLoja {
  empresaId: number
  nome: string
  /** Número da loja com 2 dígitos ("01"), o `loc_ref` da API de delivery. */
  locRef: string
  ativo: boolean
}

/**
 * Tipo da forma de pagamento (regra do legado, no handler). Na tela: ONLINE,
 * ONLINE VR (`adquirente`, soma em Adquirentes), OFFLINE e SEM CLASSIFICAÇÃO.
 */
export type TipoPagamento = 'online' | 'adquirente' | 'offline' | 'nao_classificado'

export interface Pagamento {
  descricao: string
  valor: number | null
  tipo: TipoPagamento
}

export interface Desconto {
  descricao: string
  valor: number | null
}

/** Pedido de delivery já conciliado. Datas em hora de São Paulo, sem fuso. */
export interface PedidoFechamento {
  id: string
  n_pedido: string
  /** Dia do fechamento (`YYYY-MM-DD`) — data de criação do pedido. */
  data: string
  data_de_criacao: string | null
  data_de_acao: string | null
  n_parceiro: string | null
  n_conta: string | null
  /**
   * CPF, e-mail, telefone, número e referência chegam MASCARADOS do servidor sem
   * `fechamento-maestro.ver-dados-cliente` (ex.: `***.456.789-**`).
   */
  cpf_cliente: string | null
  nome_cliente: string | null
  /** Quantos pedidos o cliente já fez (informado pela API). */
  quantidade_pedidos: number | null
  email_cliente: string | null
  telefone_cliente: string | null
  street_name: string | null
  street_number: string | null
  reference: string | null
  retirada: string | null
  confirmado_por: string | null
  cancelado_por: string | null
  origem: string | null
  status_do_pedido: string | null
  tipo_entrega: string | null
  nome_loja: string | null
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
  incentivo_parceiro: number
  forma_de_pagamentos: string | null
  descontos: string | null
  pagamentos: Pagamento[]
  lista_descontos: Desconto[]
  total_pago_online: number
  /** ONLINE VR pago antes (" - PRE PAGO"): vale no app ou no parceiro. */
  total_pago_adquirentes_online: number
  /** ONLINE VR sem " - PRE PAGO": vale passado na entrega (ex.: VR Refeição). */
  total_pago_adquirentes_offline: number
  total_pago_offline: number
  total_nao_classificado: number
  total_de_descontos: number
  /** Incentivo que vai para Descontos parceiro (regra do legado); 0 se não se aplica. */
  desconto_parceiro: number
  /** Quanto do `desconto_parceiro` sai do Online (só se o pedido tem parte ONLINE). */
  abatimento_online: number
  cancelado: boolean
  /** Status DISPATCHED ou DELIVERED. COMPLETED é o prato pronto, ainda não saiu. */
  venda_concluida: boolean
  check_pagamentos: boolean
  check_descontos: boolean
  divergencias: string[]
}

export interface FechamentoResposta {
  pedidos: PedidoFechamento[]
  /** `true` quando CPF, e-mail, telefone e endereço vieram mascarados. */
  dadosClienteMascarados: boolean
}

/** Uma linha do fechamento diário: os pedidos de um dia somados. */
export interface ResumoDia {
  data: string
  /** Todos os pedidos do dia, inclusive os cancelados. */
  pedidos: number
  cancelados: number
  /** Valores abaixo: só pedidos NÃO cancelados. */
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  /** Online já sem o incentivo que foi para Descontos parceiro (como o card). */
  online: number
  adquirentes_online: number
  adquirentes_offline: number
  offline: number
  nao_classificado: number
  descontos: number
  /** Pedidos não cancelados com algum check reprovado. */
  divergentes: number
}

/**
 * Os 12 indicadores do legado. Valores de venda: só pedidos NÃO cancelados; os
 * cancelados têm os seus.
 */
export interface TotaisPeriodo {
  /** Online menos o incentivo que foi para Descontos parceiro. */
  online: number
  adquirentes_online: number
  adquirentes_offline: number
  offline: number
  cancelado_online: number
  cancelado_adquirentes_online: number
  cancelado_adquirentes_offline: number
  cancelado_offline: number
  /** Desconto total dos pedidos com venda concluída (DISPATCHED ou DELIVERED). */
  descontos_loja: number
  /** Incentivo do parceiro, pela regra do legado (`desconto_parceiro`). */
  descontos_parceiro: number
  /** Valor em formas de pagamento que a regra não reconheceu. */
  nao_classificado: number
  /** Quantas formas de pagamento ficaram sem classificação. */
  pagamentos_sem_classificacao: number
  /** Pedidos não cancelados com algum check reprovado. */
  divergentes: number
}

/** Venda de um canal (origem do pedido) no período: só pedidos NÃO cancelados. */
export interface VendaCanal {
  /** `origem` como veio da API; "Sem origem" quando a API não informou. */
  canal: string
  /** Soma do total pago. */
  valor: number
  pedidos: number
}

/** Uma forma de pagamento sem classificação e o pedido de onde veio. */
export interface PagamentoSemClassificacao {
  pedido: PedidoFechamento
  pagamento: Pagamento
}

/** Snapshot do clique em "Pesquisar" — é ele que as tabelas e o export mostram. */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
}
