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

/** Grupo da forma de pagamento no fechamento (regra fixa do handler). */
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
  origem: string | null
  status_do_pedido: string | null
  tipo_entrega: string | null
  retirada: string | null
  nome_cliente: string | null
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
  total_pago_adquirentes: number
  total_pago_offline: number
  total_nao_classificado: number
  total_de_descontos: number
  cancelado: boolean
  venda_concluida: boolean
  check_pagamentos: boolean
  check_descontos: boolean
  divergencias: string[]
}

export interface FechamentoResposta {
  pedidos: PedidoFechamento[]
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
  online: number
  adquirentes: number
  offline: number
  nao_classificado: number
  descontos: number
  /** Pedidos não cancelados com algum check reprovado. */
  divergentes: number
}

/** Snapshot do clique em "Pesquisar" — é ele que as tabelas e o export mostram. */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
}
