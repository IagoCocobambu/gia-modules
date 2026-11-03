// Tipos do domínio — pedidos de delivery do Maestro, lidos da API do DW
// (`/Delivery/?loc_ref=`). Os nomes dos campos seguem o JSON da API e as colunas
// do legado (Reports Maestro, UniGUI), pra que a tela e o export batam com ele.

/**
 * Loja que o usuário pode consultar: Empresa do escopo com número de loja — do
 * vínculo com a BI do Simphony (`locRefs.BIAPI`) ou, na falta, do nome.
 */
export interface ReportsMaestroLoja {
  empresaId: number
  nome: string
  /** Número da loja com 2 dígitos ("01"), o `loc_ref` da API de delivery. */
  locRef: string
  ativo: boolean
}

export interface LojasResposta {
  lojas: ReportsMaestroLoja[]
}

/**
 * Pedido de delivery. Datas em hora de São Paulo, sem fuso (`YYYY-MM-DD HH:mm:ss`),
 * exceto `data_de_criacao_utc`.
 *
 * Sem `reports-maestro.ver-dados-cliente`, o servidor já devolve CPF, e-mail,
 * telefone, número e complemento do endereço MASCARADOS (ex.: `***.456.789-**`).
 */
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
  // Campos da API que o legado não mostrava — nulos quando o pedido não tem
  // (ex.: pedido sem parceiro). Na tabela nascem ocultos.
  tipo_entrega: string | null
  entrega_pela_origem: boolean | null
  entregue_por: string | null
  parceiro: string | null
  taxa_entrega: number | null
  taxa_extra_parceiro: number | null
  incentivo_loja: number | null
  incentivo_parceiro: number | null
  id_loja: string | null
  /** ISO em UTC (`2026-05-02T14:06:59.459Z`) — a única data que NÃO é de São Paulo. */
  data_de_criacao_utc: string | null
}

export interface PedidosResposta {
  pedidos: PedidoMaestro[]
  /** `true` quando os dados pessoais do cliente vieram mascarados. */
  dadosClienteMascarados: boolean
}

/** Snapshot do clique em "Pesquisar" — é ele que a tabela e o export mostram. */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
}
