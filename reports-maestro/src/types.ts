// Tipos do domínio — pedidos de delivery do Maestro, lidos da API do DW
// (`/Delivery/?loc_ref=`). Os nomes dos campos seguem o JSON da API e as colunas
// do legado (Reports Maestro, UniGUI), pra que a tela e o export batam com ele.

/** Loja que o usuário pode consultar: Empresa do escopo com número de loja no nome. */
export interface ReportsMaestroLoja {
  empresaId: number
  nome: string
  /** Número da loja com 2 dígitos ("01"), o `loc_ref` da API de delivery. */
  locRef: string
  ativo: boolean
}

/** Pedido de delivery. Datas em hora de São Paulo, sem fuso (`YYYY-MM-DD HH:mm:ss`). */
export interface PedidoMaestro {
  id: string
  n_pedido: string
  data_de_criacao: string | null
  data_de_acao: string | null
  n_parceiro: string | null
  n_conta: string | null
  cpf_cliente: string | null
  nome_cliente: string | null
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
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
  forma_de_pagamentos: string | null
  descontos: string | null
  nome_loja: string | null
}

export interface PedidosResposta {
  pedidos: PedidoMaestro[]
}

/** Snapshot do clique em "Pesquisar" — é ele que a tabela e o export mostram. */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
}
